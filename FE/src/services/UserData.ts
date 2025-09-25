import { initSodium, createEphemeralKP, encryptForServer, fetchServerPubKey, decryptServerResponse } from "../utils/cryptoClient";
import axios from "axios";
import sodium from "libsodium-wrappers";

export async function secureLogin(username: string, password: string) {
  await initSodium();

  const clientKP = createEphemeralKP();

  const serverPub = await fetchServerPubKey();

  const envelope = await encryptForServer({ username, password }, clientKP, serverPub);

  const res = await axios.post("http://localhost:3000/api/login", envelope);

  return res.data;
}

export async function verifyOTP(username: string, otp: string) {
  await initSodium();

  const clientKP = createEphemeralKP();

  const serverPub = await fetchServerPubKey();

  const envelope = await encryptForServer({ username, otp }, clientKP, serverPub);

  const res = await axios.post("http://localhost:3000/api/verify-otp", envelope, {withCredentials: true});

  return res.data;
}

export async function checkAuth() {
  await axios.get("http://localhost:3000/api/check-auth", { withCredentials: true });
}

export async function fetchReports() {
  await initSodium();

  // 1. Create ephemeral keypair
  const clientKP = createEphemeralKP();

  // 2. Get server public key
  const serverPub = await fetchServerPubKey();

  // 3. Prepare payload with ephemeral_pub (even if body is dummy)
  const payload = { ephemeral_pub: sodium.to_base64(clientKP.publicKey, sodium.base64_variants.ORIGINAL) };

  // 4. Encrypt the payload
  const envelope = await encryptForServer(payload, clientKP, serverPub);

  // 5. Send POST request with encrypted envelope
  const resp = await axios.post(
    "http://localhost:3000/api/reports",
    envelope,
    { withCredentials: true }
  );

  // 6. Decrypt the response
  const decrypted = await decryptServerResponse(resp.data, clientKP, serverPub);

  const mappedReports = decrypted.reports.map((report: any) => ({
    ...report,
    address: report.location,
  }));

  return mappedReports;
}
