const express = require("express");
const axios = require("axios");
const { sodium, getServerKeyPair, b64, fromB64 } = require("../crypto");
const pool = require("../db");
const conversations = require("../conversations");
const chrono = require("chrono-node");
const decryptBody = require("../decryptBody");

function parseSmartDate(input) {
  if (!input) return null;
  const d = chrono.parseDate(input, new Date());
  return d || null;
}

const router = express.Router();

router.post("/gemini", decryptBody, async (req, res) => {
  try {
    const payload = req.decrypted;
    const { prompt, files } = payload;

    if (!prompt) {
      return res
        .status(400)
        .json({ error: "Decrypted payload missing prompt" });
    }

    // 3) Retrieve or create conversation history
    if (!conversations.has(sessionId)) {
      conversations.set(sessionId, [
        {
          role: "user",
          parts: [
            {
              text: `أنت مساعد افتراضي يتحدث بالعربية فقط.  
مهمتك: مساعدة المستخدم في صياغة بلاغ رسمي للشرطة بأسلوب ودي، متعاطف، وحواري.

- استنتج التفاصيل من السياق متى أمكن: العنوان، التصنيف، التاريخ، الوصف، الحالة، العنوان الرئيسي.  
- اسأل عن التفاصيل الناقصة تدريجياً وبطريقة طبيعية، دون إثقال على المستخدم.  
- أظهر تعاطفك ودعمك في كل رد.  
- اعتمد على سجل المحادثة لفهم السياق، ولا تكرر الأسئلة إلا عند الحاجة للتوضيح.  
- إذا زوّدك المستخدم بوسائط (صور، فيديو، ملفات)، أدرجها في الحقل \`media\`.  
- لا تترك أي حقل فارغ إلا إذا كان المستخدم فعلاً غير قادر على توفيره.  

- عند اكتمال البلاغ:
  1. أنشئ كائن JSON بالهيكل المطلوب باستخدام البيانات المجموعة.
  {
    "id": "",
    "title": "",
    "category": "",
    "address": "",
    "date": "",
    "description": "",
    "media": [],
    "status": "pending",
    "createdAt": "",
    "updatedAt": ""
  }
  2. ضعه داخل الوسوم <REPORT_JSON> ... </REPORT_JSON>.
  3. أضف أيضاً العلامة <REPORT_READY> بعد الوسوم.
  4. لا تشرح JSON أبداً ولا تعلق عليه. النص المرئي للمستخدم يبقى بالعربية فقط.

- عندما تنشئ JSON:
  * لا تضعه داخل أي كود Markdown أو backticks.
  * فقط ضع الكائن نفسه داخل الوسوم <REPORT_JSON> و </REPORT_JSON>.
  * لا تضف كلمة "json" أو أي زخرفة أخرى.
- إذا خرج المستخدم عن موضوع البلاغ، اعتذر بلطف وارفض الاستمرار.`,
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
    if (answer.includes("<REPORT_READY>")) {
      const match = answer.match(/<REPORT_JSON>([\s\S]*?)<\/REPORT_JSON>/);
      if (match) {
        reportObj = JSON.parse(match[1]);
      } else {
        // Fallback: try to extract JSON from the entire answer
        const jsonMatch = answer.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            reportObj = JSON.parse(jsonMatch[0]);
          } catch (err) {
            console.error("Failed to parse report JSON:", err);
          }
        }
      }

      // Use parseSmartDate for the report date, fallback to now
      const safeDate =
        reportObj.date && parseSmartDate(reportObj.date)
          ? new Date(parseSmartDate(reportObj.date)).toISOString()
          : new Date().toISOString();

      const now = new Date().toISOString();

      const reportData = {
        id: crypto.randomUUID(),
        title: reportObj.title || "بلاغ بدون عنوان",
        category: reportObj.category || "أخرى",
        address: reportObj.address || "غير محدد",
        date: safeDate,
        description: reportObj.description || "",
        media: reportObj.media || [],
        status: "pending",
        createdAt: now,
        updatedAt: now,
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

      finalMessage = cleanAnswer; // <-- Use the clean answer for the user
      conversations.delete(sessionId);
    } else {
      finalMessage = answer;
    }

    // 8) Encrypt response
    const responsePlain = sodium.from_string(
      JSON.stringify({ answer: finalMessage })
    );
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
    console.error(
      "Error in /api/gemini:",
      err.response?.data || err.message || err
    );
    return res
      .status(500)
      .json({ error: "Server error: " + (err.message || "unknown") });
  }
});

module.exports = router;
