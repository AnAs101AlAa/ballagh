import axios from "axios";
import {
  initSodium,
  createEphemeralKP,
  encryptForServer,
  decryptServerResponse,
  fetchServerPubKey,
} from "../utils/cryptoClient";
import sodium from "libsodium-wrappers";
import { fileToBase64WithMime } from "../utils/formaters";

const sendGeminiRequest = async (prompt: string, files?: File[], sessionId?: string) => {
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

  const payload = { prompt, files: encodedFiles, ephemeral_pub: 
    (await sodium.to_base64(clientKP.publicKey, sodium.base64_variants.ORIGINAL))
  };

  // 4) encrypt payload
  const envelope = await encryptForServer(payload, clientKP, serverPub);

  // 5) send to backend
  const resp = await axios.post("http://localhost:3000/api/gemini", { ...envelope, sessionId }, {
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
