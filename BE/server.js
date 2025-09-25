require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { initKeys, getServerKeyPair, b64 } = require("./cryptos/crypto");
const cookieParser = require("cookie-parser")

const geminiRoute = require("./routes/gemini");
const submitReportRoute = require("./routes/submitReport");
const authRoute = require("./routes/users");

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser())
app.use(cors({
  origin: "http://localhost:5173", // <-- your frontend URL/port
  credentials: true,               // <-- allow cookies
}));

initKeys().then(() => {
  app.get("/api/server-pubkey", (req, res) => {
    const serverKeyPair = getServerKeyPair();
    res.json({ x25519_pub: b64(serverKeyPair.publicKey) });
  });

  app.use("/api", geminiRoute);
  app.use("/api", submitReportRoute);
  app.use("/api", authRoute);
  
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});