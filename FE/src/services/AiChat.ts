import axios from "axios";
import {
  initSodium,
  createEphemeralKP,
  encryptForServer,
  decryptServerResponse,
} from "../utils/cryptoClient";

// helper: convert File → base64 + mime
async function fileToBase64WithMime(file: File): Promise<{ data: string; mime: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        data: (reader.result as string).split(",")[1], // strip data:... prefix
        mime: file.type || "application/octet-stream",
      });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// helper to fetch server pubkey
async function fetchServerPubKey(): Promise<string> {
  const resp = await axios.get("http://localhost:3000/api/server-pubkey");
  return resp.data.x25519_pub as string;
}

/**
 * Sends encrypted prompt (+ optional files), receives encrypted response,
 * decrypts and returns it.
 */
const sendGeminiRequest = async (prompt: string, files?: File[]) => {
  await initSodium();

  // 1) create ephemeral KP (per-request)
  const clientKP = createEphemeralKP();

  // 2) get server pubkey
  const serverPub = await fetchServerPubKey();

  // 3) prepare payload
  let encodedFiles: { data: string; mime: string }[] = [];
  if (files && files.length > 0) {
    encodedFiles = await Promise.all(files.map(fileToBase64WithMime));
  }

  const payload = { prompt, files: encodedFiles };

  // 4) encrypt payload
  const envelope = await encryptForServer(payload, clientKP, serverPub);
  // envelope = { ephemeral_pub, nonce, ciphertext, ts }

  // 5) send to backend
  const resp = await axios.post("http://localhost:3000/api/gemini", envelope, {
    headers: { "Content-Type": "application/json" },
  });

  // 6) backend responds with encrypted envelope { nonce, ciphertext, ts? }
  const respEnvelope = resp.data as { nonce: string; ciphertext: string; ts?: number };

  // 7) decrypt response
  const decrypted = await decryptServerResponse(respEnvelope, clientKP, serverPub);

  // decrypted contains server JSON { answer: '...' }
  return decrypted.answer;
};

export default sendGeminiRequest;
