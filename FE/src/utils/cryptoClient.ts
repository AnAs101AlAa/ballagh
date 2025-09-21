// src/lib/cryptoClient.ts
import sodium from "libsodium-wrappers";

export type Envelope = {
  ephemeral_pub: string; // client's ephemeral public key (base64)
  nonce: string;         // base64 (for request)
  ciphertext: string;    // base64 (request ciphertext)
  ts: number;
};

// Response envelope shape
export type ResponseEnvelope = {
  nonce: string;        // base64
  ciphertext: string;   // base64
  ts?: number;
};

let sodiumReady = false;
export async function initSodium() {
  if (!sodiumReady) {
    await sodium.ready;
    sodiumReady = true;
  }
}

const b64 = (u8: Uint8Array) =>
  sodium.to_base64(u8, sodium.base64_variants.ORIGINAL);
const fromB64 = (s: string) =>
  sodium.from_base64(s, sodium.base64_variants.ORIGINAL);

/**
 * Create an ephemeral keypair for this request.
 */
export function createEphemeralKP() {
  const kp = sodium.crypto_kx_keypair();
  return kp; // { publicKey: Uint8Array, privateKey: Uint8Array }
}

/**
 * Encrypt a payload for server using ephemeral client keypair and server public key.
 * Returns envelope plus ephemeral public key (base64) embedded in envelope.ephemeral_pub.
 */
export async function encryptForServer(
  payload: any,
  clientKP: { publicKey: Uint8Array; privateKey: Uint8Array },
  serverPubB64: string
): Promise<Envelope> {
  await initSodium();

  const serverPub = fromB64(serverPubB64);

  // derive session keys client-side
  const sessionKeys = sodium.crypto_kx_client_session_keys(
    clientKP.publicKey,
    clientKP.privateKey,
    serverPub
  );
  // client.sharedTx used for encrypting requests
  const symmetricKey = sessionKeys.sharedTx;

  const plaintext = sodium.from_string(JSON.stringify(payload));
  const nonce = sodium.randombytes_buf(
    sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES
  );

  const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    plaintext,
    null,
    null,
    nonce,
    symmetricKey
  );

  return {
    ephemeral_pub: b64(clientKP.publicKey),
    nonce: b64(nonce),
    ciphertext: b64(ciphertext),
    ts: Math.floor(Date.now() / 1000),
  };
}

/**
 * Decrypt server response envelope using the same ephemeral clientKP and server public key.
 * Server will have encrypted the response using server.sharedTx (so client must use client.sharedRx).
 */
export async function decryptServerResponse(
  respEnv: ResponseEnvelope,
  clientKP: { publicKey: Uint8Array; privateKey: Uint8Array },
  serverPubB64: string
): Promise<any> {
  await initSodium();
  const serverPub = fromB64(serverPubB64);

  const sessionKeys = sodium.crypto_kx_client_session_keys(
    clientKP.publicKey,
    clientKP.privateKey,
    serverPub
  );
  // client.sharedRx is used to decrypt responses encrypted by server.sharedTx
  const symmetricKey = sessionKeys.sharedRx;

  const plaintext = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    null,
    fromB64(respEnv.ciphertext),
    null,
    fromB64(respEnv.nonce),
    symmetricKey
  );

  return JSON.parse(sodium.to_string(plaintext));
}
