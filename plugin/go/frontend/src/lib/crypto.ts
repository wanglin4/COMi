import { sha256 } from "@noble/hashes/sha2.js";
import { hkdf } from "@noble/hashes/hkdf.js";
import { bls12_381 } from "@noble/curves/bls12-381.js";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";

const DERIVATION_MSG = new TextEncoder().encode("COMi-Prediction-Market-Derivation-v1");

export async function deriveBlsFromSignature(signatureHex: string): Promise<Uint8Array> {
  const sigBytes = hexToBytes(signatureHex.startsWith("0x") ? signatureHex.slice(2) : signatureHex);
  return hkdf(sha256, sigBytes, new Uint8Array(), DERIVATION_MSG, 32);
}

export function getAddressFromScalar(scalar: Uint8Array): string {
  const scalarBigInt = BigInt("0x" + bytesToHex(scalar));
  const pubkey = bls12_381.G1.Point.BASE.multiply(scalarBigInt).toBytes();
  const hash = sha256(pubkey);
  return "0x" + bytesToHex(hash.slice(0, 20));
}

export async function pbkdf2Key(ethAddress: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw", enc.encode(ethAddress.toLowerCase()), "PBKDF2", false, ["deriveKey"]
  );
  return window.crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: enc.encode("COMi-Salt-v1"), iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptData(data: Uint8Array, ethAddress: string): Promise<string> {
  const key = await pbkdf2Key(ethAddress);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data as any);
  
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

export async function decryptData(base64: string, ethAddress: string): Promise<Uint8Array> {
  const key = await pbkdf2Key(ethAddress);
  const combined = new Uint8Array(atob(base64).split("").map(c => c.charCodeAt(0)));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  
  const decrypted = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data as any);
  return new Uint8Array(decrypted);
}
