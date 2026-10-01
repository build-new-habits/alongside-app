/**
 * js/data/file-lock.js
 * 01 Oct 2026 v1
 *
 * B2 RESTORE-LOCK. An optional password on the file Download your data
 * saves, so that moving to a new phone does not mean carrying health
 * answers and a journal in a file anyone can read.
 *
 * ON THE DEVICE ONLY. The file is locked and unlocked here, with the
 * browser's own Web Crypto: a key made from the password with PBKDF2
 * (SHA-256, 600,000 rounds, a fresh random salt per file) and the text
 * sealed with AES-256-GCM (a fresh random IV per file). The password is
 * never stored: not in Alongside's storage, not in the file, and it is not
 * sent anywhere. Nobody, Build New Habits included, can open a locked file
 * without it. The app says so before saving (settings.js).
 *
 * A locked file is still a small JSON object, so Restore can tell it apart
 * and ask for the password. GCM's tag means a wrong password, or a file
 * changed after it was locked, fails to open rather than giving nonsense.
 *
 * Tested by tools/verify-restore-lock.mjs.
 */

export const LOCK_FORMAT = "alongside-locked-1";
export const LOCKED_ABOUT =
  "A locked Alongside: Move file. It opens only with the password chosen when it was saved.";
export const ITERATIONS = 600000;
export const MIN_PASSWORD = 8;

const enc = new TextEncoder();
const dec = new TextDecoder();
const subtle = () => globalThis.crypto && globalThis.crypto.subtle;

function _b64(bytes) {
  let s = "";
  const u = new Uint8Array(bytes);
  for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]);
  return btoa(s);
}
function _unb64(str) {
  const s = atob(str);
  const u = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
  return u;
}

async function _key(password, salt, iterations) {
  const base = await subtle().importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  return subtle().deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/** Can this browser lock files at all? */
export function lockAvailable() {
  return !!(subtle() && globalThis.crypto.getRandomValues);
}

/** "" when the password can be used, otherwise what to fix, in plain words. */
export function passwordProblem(password, again) {
  if (!password) return "";
  if (password.length < MIN_PASSWORD) return `Use at least ${MIN_PASSWORD} characters.`;
  if (password !== again) return "The two passwords don’t match.";
  return "";
}

/** The file's text, locked with the password. Returns the locked file's text. */
export async function lockText(text, password) {
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const iv   = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const key  = await _key(password, salt, ITERATIONS);
  const sealed = await subtle().encrypt({ name: "AES-GCM", iv }, key, enc.encode(text));
  return JSON.stringify({
    about: LOCKED_ABOUT,
    format: LOCK_FORMAT,
    kdf: "PBKDF2-SHA-256",
    iterations: ITERATIONS,
    cipher: "AES-256-GCM",
    salt: _b64(salt),
    iv: _b64(iv),
    data: _b64(sealed),
  }, null, 2);
}

/** Is this text a locked Alongside file? */
export function isLocked(text) {
  try {
    const o = JSON.parse(text);
    return !!o && o.format === LOCK_FORMAT && typeof o.data === "string" && typeof o.salt === "string" && typeof o.iv === "string";
  } catch { return false; }
}

const WRONG = "That password doesn’t open this file. Nothing has been changed.";

/** { ok: true, text } with the original file's text, or { ok: false, reason }. */
export async function unlockText(text, password) {
  let o;
  try { o = JSON.parse(text); } catch { return { ok: false, reason: WRONG }; }
  if (!o || o.format !== LOCK_FORMAT) return { ok: false, reason: WRONG };
  const iterations = Number.isInteger(o.iterations) && o.iterations >= 100000 && o.iterations <= 10000000
    ? o.iterations : ITERATIONS;
  try {
    const key = await _key(String(password || ""), _unb64(o.salt), iterations);
    const plain = await subtle().decrypt({ name: "AES-GCM", iv: _unb64(o.iv) }, key, _unb64(o.data));
    return { ok: true, text: dec.decode(plain) };
  } catch {
    return { ok: false, reason: WRONG };
  }
}
