import type { SessionClaims } from "@/domain/types";

const text = new TextEncoder();

function bytesToB64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function b64UrlToBytes(value: string): Uint8Array {
  const pad = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4));
  const bin = atob(value.replaceAll("-", "+").replaceAll("_", "/") + pad);
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function timingEqual(a: Uint8Array, b: Uint8Array): boolean {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}

async function sha256(value: string): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest("SHA-256", text.encode(value));
  return new Uint8Array(digest);
}

/** Constant-time check. Passwords are never stored; only the env value is compared. */
export async function passwordMatches(input: string, expected: string): Promise<boolean> {
  if (!expected) return false;
  const [a, b] = await Promise.all([sha256(input), sha256(expected)]);
  return timingEqual(a, b);
}

async function aesKey(secret: string): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey("raw", text.encode(secret), "HKDF", false, [
    "deriveKey",
  ]);
  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: text.encode("folio-session-salt-v1"),
      info: text.encode("folio-session-v1"),
    },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * Session token, FOLIO1.
 * AES-256-GCM (NIST SP 800-38D) with an HKDF-SHA-256 key (RFC 5869).
 * Wire format: v1.<iv>.<ciphertext>  (base64url, tag appended by Web Crypto).
 */
export async function sealSession(claims: SessionClaims, secret: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await aesKey(secret);
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    text.encode(JSON.stringify(claims)),
  );
  return `v1.${bytesToB64Url(iv)}.${bytesToB64Url(new Uint8Array(cipher))}`;
}

export async function openSession(token: string, secret: string): Promise<SessionClaims | null> {
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1" || !parts[1] || !parts[2]) return null;
  try {
    const iv = b64UrlToBytes(parts[1]);
    const cipher = b64UrlToBytes(parts[2]);
    const key = await aesKey(secret);
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
      key,
      cipher.buffer as ArrayBuffer,
    );
    const claims = JSON.parse(new TextDecoder().decode(plain)) as SessionClaims;
    if (claims.sub !== "admin" || typeof claims.exp !== "number") return null;
    if (claims.exp * 1000 < Date.now()) return null;
    return claims;
  } catch {
    return null;
  }
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    text.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

function toHex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Stripe-style signature over `${timestamp}.${body}` using HMAC-SHA-256 (RFC 2104). */
export async function signWebhook(body: string, secret: string, timestamp: number): Promise<string> {
  const key = await hmacKey(secret);
  const mac = await crypto.subtle.sign("HMAC", key, text.encode(`${timestamp}.${body}`));
  return `t=${timestamp},v1=${toHex(new Uint8Array(mac))}`;
}
