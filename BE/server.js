require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const sodium = require("libsodium-wrappers");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

let serverKeyPair;

// helpers
const b64 = (u8) => sodium.to_base64(u8, sodium.base64_variants.ORIGINAL);
const fromB64 = (s) => sodium.from_base64(s, sodium.base64_variants.ORIGINAL);

async function initKeys() {
  await sodium.ready;

  // Try to load persisted keys from disk/env if you want; else generate new each boot
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
    // Consider persisting keys to disk or a secure KMS for production.
  }
}

app.get("/", (req, res) => {
  res.send("Hello from Node server!");
});

// expose server public key
app.get("/api/server-pubkey", (req, res) => {
  res.json({ x25519_pub: b64(serverKeyPair.publicKey) });
});

/**
 * Receives encrypted envelope from client:
 * {
 *   ephemeral_pub: <client ephemeral pub base64>,
 *   nonce: <base64>,
 *   ciphertext: <base64>,
 *   ts: number
 * }
 *
 * Decrypts request, queries Gemini, encrypts response using sessionKeys.sharedTx (server-side)
 * and returns { nonce, ciphertext, ts? } for client to decrypt.
 */

app.post("/api/gemini", async (req, res) => {
  const { ephemeral_pub, nonce, ciphertext } = req.body;
  if (!ephemeral_pub || !nonce || !ciphertext) {
    return res.status(400).json({ error: "Missing fields" });
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
    
    // 3) Forward to Gemini
  const geminiReq = {
    systemInstruction: {
      role: "system",
      parts: [
        {
          text: `أنت مساعد افتراضي يتحدث ويكتب باللغة العربية فقط. دورك هو مساعدة المستخدم على صياغة بلاغ رسمي للشرطة.

المطلوب منك:
1. استقبال المعلومات الخام التي يكتبها المستخدم عن الحادثة.
2. صياغة رد منظم بلغة واضحة ومفهومة يشمل:
   - عنوان قصير للبلاغ.
   - وصف تفصيلي موجز وواضح لما حدث.
   - تصنيف البلاغ ضمن واحدة من الفئات التالية فقط:
     - "اختيار نوع البلاغ"
     - "سرقة"
     - "احتيال"
     - "تسرب مياه"
     - "أخرى"
3. اعرض الرد للمستخدم بشكل منسق وسهل القراءة، باستخدام نص عربي منسق (عناوين، فقرات، ترقيم عند الحاجة) بدون استخدام صيغة JSON أو أي أكواد برمجية.
4. بعد عرض المسودة، اسأل المستخدم إذا كان يرغب في تعديلها أو إضافة تفاصيل.
5. قبل إنهاء المحادثة، اسأله إن كان يرغب في إرفاق ملفات (صور/مقاطع فيديو) كأدلة أو إثبات.
6. إذا حاول المستخدم استخدامك في أي سياق آخر غير البلاغات، قم بالرد برسالة بسيطة بالرفض.
7. يجب أن تكون جميع الردود باللغة العربية فقط حتى إذا كتب المستخدم بالإنجليزية.
`
        }
      ]
    },
    contents: [
      {
        parts: [
          { text: prompt },
          ...(files || []).map((f) => ({
            inline_data: {
              mime_type: f.mime || "application/octet-stream",
              data: f.data, // base64 string
            },
          })),
        ],
      },
    ],
  };
    
    const glResp = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      geminiReq,
      { headers: { "Content-Type": "application/json" } }
    );

    const answer =
    glResp.data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "No response received";

    // 4) Encrypt the response using server.sharedTx
    const responsePlain = sodium.from_string(JSON.stringify({ answer }));
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

    // 5) Send encrypted response envelope
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

initKeys().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});