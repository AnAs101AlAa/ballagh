const express = require("express");
const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const decryptBody = require("../decryptBody");
const { sendOtpEmail } = require("../emailer");

const otpStore = new Map();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "changeme";

router.post("/login", decryptBody, async (req, res) => {
  const { username, password } = req.decrypted;

  try {
    if (!username || !password)
      return res.status(400).json({ error: "Username and password required" });

    const result = await pool.query(
      "SELECT password FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, result.rows[0].password);

    if (!valid)
      return res.status(401).json({ error: "Invalid credentials" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(username, { otp, expires: Date.now() + 5 * 60 * 1000 }); // 5 min expiry

    // Get user's email from DB (assuming you have an email column)
    const emailResult = await pool.query(
      "SELECT email FROM users WHERE username = $1",
      [username]
    );
    if (emailResult.rows.length === 0)
      return res.status(401).json({ error: "No email found for user" });

    const userEmail = emailResult.rows[0].email;
    await sendOtpEmail(userEmail, otp);

    res.json({ status: "otp_sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/verify-otp", decryptBody, async (req, res) => {
  const { username, otp } = req.decrypted;
  const entry = otpStore.get(username);
  if (!entry || entry.otp !== otp || Date.now() > entry.expires) {
    return res.status(401).json({ error: "رمز التحقق غير صحيح أو منتهي الصلاحية" });
  }
  otpStore.delete(username);

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 3600000, // 1 hour
  });

  res.json({ status: "success" });
});

module.exports = router;