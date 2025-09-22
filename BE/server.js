require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sodium = require("libsodium-wrappers");
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// --- Postgres setup ---
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

let serverKeyPair;

// helpers
const b64 = (u8) => sodium.to_base64(u8, sodium.base64_variants.ORIGINAL);
const fromB64 = (s) => sodium.from_base64(s, sodium.base64_variants.ORIGINAL);
const conversations = new Map();

async function initKeys() {
  await sodium.ready;
  if (process.env.SERVER_X25519_PUB && process.env.SERVER_X25519_PRIV) {
    serverKeyPair = {
      publicKey: fromB64(process.env.SERVER_X25519_PUB),
      privateKey: fromB64(process.env.SERVER_X25519_PRIV),
    };
    console.log("Loaded server keypair from env.");
  } else {
    serverKeyPair = sodium.crypto_kx_keypair();
    console.log("Generated new server keypair.");
    console.log("Server public key (base64):", b64(serverKeyPair.publicKey));
  }
}

// expose server public key
app.get("/api/server-pubkey", (req, res) => {
  res.json({ x25519_pub: b64(serverKeyPair.publicKey) });
});


app.post("/api/gemini", async (req, res) => {
  const { ephemeral_pub, nonce, ciphertext, sessionId } = req.body;
  if (!ephemeral_pub || !nonce || !ciphertext || !sessionId) {
    return res
      .status(400)
      .json({ error: "Missing fields (need ephemeral_pub, nonce, ciphertext, sessionId)" });
  }

  try {
    // 1) Derive session keys
    const clientPub = fromB64(ephemeral_pub);
    const sessionKeys = sodium.crypto_kx_server_session_keys(
      serverKeyPair.publicKey,
      serverKeyPair.privateKey,
      clientPub
    );
    const keyForDecryptingRequest = sessionKeys.sharedRx;

    // 2) Decrypt request
    const plain = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      null,
      fromB64(ciphertext),
      null,
      fromB64(nonce),
      keyForDecryptingRequest
    );
    const payload = JSON.parse(sodium.to_string(plain));
    const { prompt, files } = payload;

    if (!prompt) {
      return res.status(400).json({ error: "Decrypted payload missing prompt" });
    }

    // 3) Retrieve or create conversation history
    if (!conversations.has(sessionId)) {
      conversations.set(sessionId, [
        {
          role: "user",
          parts: [
            {
              text: `
أنت مساعد افتراضي يتحدث بالعربية فقط.
مهمتك: مساعدة المستخدم في صياغة بلاغ رسمي للشرطة.

- استنتج بنفسك التفاصيل: العنوان، الموقع، التاريخ، الوصف، التصنيف.
- اسأل عن المفقود فقط بشكل طبيعي وبالتدريج.
- لا تنسَ المعلومات السابقة.
- أسلوبك متعاطف ومحاوري.
- عند اكتمال البلاغ، أضف كائن JSON بهذا الشكل فقط:

{
  "title": "",
  "category": "",
  "address": "",
  "date": "",
  "description": "",
  "media": []
}

- بعد JSON ضع العلامة [END_OF_REPORT].
- دائماً أرسل رسالة طبيعية + JSON، لا ترسل JSON فقط.
- إذا كان المستخدم خارج موضوع البلاغ، اعتذر بلطف وارفض.
              `,
            },
          ],
        },
      ]);
    }

    const history = conversations.get(sessionId);

    // 4) Append user message
    history.push({
      role: "user",
      parts: [
        { text: prompt },
        ...(files || []).map((f) => ({
          inline_data: {
            mime_type: f.mime || "application/octet-stream",
            data: f.data,
          },
        })),
      ],
    });

    // 5) Send to Gemini
    const glResp = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { contents: history },
      { headers: { "Content-Type": "application/json" } }
    );

    const answer =
      glResp.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "لم يتم استلام رد من المساعد";

    // 6) Append model reply
    history.push({ role: "model", parts: [{ text: answer }] });

    let finalMessage = answer;

    // 7) Detect report completion
    if (answer.includes("[END_OF_REPORT]")) {
      const match = answer.match(/\{[\s\S]*\}/);
      let reportObj = {};
      if (match) {
        try {
          reportObj = JSON.parse(match[0]);
        } catch (err) {
          console.error("Failed to parse report JSON:", err);
        }
      }

      const reportData = {
        id: crypto.randomUUID(),
        title: reportObj.title || "بلاغ بدون عنوان",
        category: reportObj.category || "أخرى",
        address: reportObj.address || "غير محدد",
        date: new Date(reportObj.date) || new Date(),
        description: reportObj.description || "",
        media: reportObj.media || [],
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await pool.query(
        `INSERT INTO reports (id, title, category, location, date, description, createdat, updatedat, evidence_url, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          reportData.id,
          reportData.title,
          reportData.category,
          reportData.address,
          reportData.date,
          reportData.description,
          reportData.createdAt,
          reportData.updatedAt,
          JSON.stringify(reportData.media),
          reportData.status,
        ]
      );

      finalMessage = "✅ تم حفظ بلاغك بنجاح. شكراً لك على تعاونك، ونتمنى لك السلامة.";
      conversations.delete(sessionId);
    }

    // 8) Encrypt response
    const responsePlain = sodium.from_string(JSON.stringify({ answer: finalMessage }));
    const respNonce = sodium.randombytes_buf(
      sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES
    );
    const keyForEncryptingResponse = sessionKeys.sharedTx;

    const responseCipher = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      responsePlain,
      null,
      null,
      respNonce,
      keyForEncryptingResponse
    );

    return res.json({
      nonce: b64(respNonce),
      ciphertext: b64(responseCipher),
      ts: Math.floor(Date.now() / 1000),
    });
  } catch (err) {
    console.error("Error in /api/gemini:", err.response?.data || err.message || err);
    return res.status(500).json({ error: "Server error: " + (err.message || "unknown") });
  }
});



app.post("/api/submit-report", async (req, res) => {
  const { ephemeral_pub, nonce, ciphertext } = req.body;
  if (!ephemeral_pub || !nonce || !ciphertext) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const clientPub = fromB64(ephemeral_pub);
    const sessionKeys = sodium.crypto_kx_server_session_keys(
      serverKeyPair.publicKey,
      serverKeyPair.privateKey,
      clientPub
    );
    const keyForDecrypting = sessionKeys.sharedRx;

    const plain = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      null,
      fromB64(ciphertext),
      null,
      fromB64(nonce),
      keyForDecrypting
    );
    const decryptedReport = JSON.parse(sodium.to_string(plain));

    // Insert report into Postgres
    const report = decryptedReport.report || decryptedReport;

    // Store media in a backend file
    let mediaRefs = [];
    if (report.media && Array.isArray(report.media) && report.media.length > 0) {
      const mediaStorePath = path.join(__dirname, "media_store.json");
      let mediaStore = [];
      if (fs.existsSync(mediaStorePath)) {
        mediaStore = JSON.parse(fs.readFileSync(mediaStorePath, "utf-8"));
      }
      // Each media gets a unique ID
      report.media.forEach((file, idx) => {
        const mediaId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
        mediaStore.push({
          id: mediaId,
          data: file.data, // base64 string
          mime: file.mime,
          uploadedAt: new Date().toISOString(),
        });
        mediaRefs.push(mediaId);
      });
      fs.writeFileSync(mediaStorePath, JSON.stringify(mediaStore, null, 2), "utf-8");
    }

    // Prepare report object for DB
    const reportDate = {
      id: crypto.randomUUID(),
      title: report.title || "",
      category: report.category || "",
      location: report.address || "",
      date: new Date(report.date) || "",
      description: report.description || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      evidence_url: mediaRefs, // store media IDs
      status: "pending",
    };

    await pool.query(
      `INSERT INTO reports (id, title, category, location, date, description, createdat, updatedat, evidence_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        reportDate.id,
        reportDate.title,
        reportDate.category,
        reportDate.location,
        reportDate.date,
        reportDate.description,
        reportDate.createdAt,
        reportDate.updatedAt,
        JSON.stringify(reportDate.evidence_url),
        reportDate.status,
      ]
    );

    return res.json({ status: "ok" });
  } catch (err) {
    console.error("Error in /api/submit-report:", err.message || err);
    return res.status(500).json({ error: "Server error: " + (err.message || "unknown") });
  }
});

initKeys().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});