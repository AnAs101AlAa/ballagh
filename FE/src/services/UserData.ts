import { initSodium, createEphemeralKP, encryptForServer, fetchServerPubKey } from "../utils/cryptoClient";
import axios from "axios";

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

  const res = await axios.post("http://localhost:3000/api/verify-otp", envelope);

  return res.data;
}