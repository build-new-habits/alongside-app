/**
 * js/data/account-model.js
 * 28 Nov 2026 v1
 *
 * Row 13a ACCOUNTS, S1 (Schema v1.145). The account record on the phone,
 * made safe on every load, and the sign-in session's own storage key. Imports
 * nothing, so the store and restore can both use it.
 *
 *   account { email, userId, signedInAt, checkedAt, tier, trial, pending }
 *     email       the address the person signs in with
 *     userId      the sign-in service's id for the account (a uuid)
 *     signedInAt  ISO, when this phone signed in
 *     checkedAt   ISO, when this phone last heard from the server
 *     tier        "personal" only when paid (row 14); "free" otherwise
 *     trial       the server's trial { startedAt, endsOn, endedAt, endedHow }
 *     pending     { email, sentAt, tries } while a code is on its way
 *
 *   SESSION_KEY  the sign-in tokens' own key: never in Download your data,
 *                never taken from a file by Restore, gone with Reset all data.
 */
export const SESSION_KEY = "alongside-account-session";

const ISO = v => typeof v === "string" && !Number.isNaN(Date.parse(v)) && /^\d{4}-\d{2}-\d{2}T/.test(v);
const DAY = v => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isEmail = s => typeof s === "string" && s.length <= 254 && /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(s);
export const cleanEmail = s => (typeof s === "string" ? s.trim().toLowerCase() : "");

export function sanitizeServerTrial(o) {
  if (!o || typeof o !== "object" || Array.isArray(o)) return {};
  if (!ISO(o.startedAt) || !DAY(o.endsOn)) return {};
  const out = { startedAt: o.startedAt, endsOn: o.endsOn };
  if (ISO(o.endedAt)) { out.endedAt = o.endedAt; out.endedHow = o.endedHow === "stopped" ? "stopped" : "ended"; }
  return out;
}

export function sanitizeAccount(o) {
  if (!o || typeof o !== "object" || Array.isArray(o)) return {};
  const out = {};
  const email = cleanEmail(o.email);
  if (isEmail(email)) out.email = email;
  if (out.email && typeof o.userId === "string" && UUID.test(o.userId)) out.userId = o.userId;
  if (out.userId && ISO(o.signedInAt)) out.signedInAt = o.signedInAt;
  if (out.userId && ISO(o.checkedAt)) out.checkedAt = o.checkedAt;
  if (out.userId) out.tier = o.tier === "personal" ? "personal" : "free";
  if (out.userId) { const t = sanitizeServerTrial(o.trial); if (t.startedAt) out.trial = t; }
  const p = o.pending;
  if (!out.userId && p && typeof p === "object" && isEmail(cleanEmail(p.email)) && ISO(p.sentAt)) {
    out.pending = { email: cleanEmail(p.email), sentAt: p.sentAt, tries: Number.isInteger(p.tries) && p.tries >= 0 && p.tries <= 5 ? p.tries : 0 };
  }
  return out;
}

export function sanitizeSession(o) {
  if (!o || typeof o !== "object" || Array.isArray(o)) return {};
  const tok = v => typeof v === "string" && v.length > 10 && v.length < 4096 && /^[A-Za-z0-9._-]+$/.test(v);
  if (!tok(o.accessToken) || !tok(o.refreshToken) || !Number.isFinite(o.expiresAt)) return {};
  return { accessToken: o.accessToken, refreshToken: o.refreshToken, expiresAt: o.expiresAt };
}
