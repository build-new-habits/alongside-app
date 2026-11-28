/**
 * js/data/account.js
 * 28 Nov 2026 v1
 *
 * Row 13a ACCOUNTS, S1 (spec docs/specs/alongside_accounts_spec_28nov2026_v2.md;
 * mock-up v2 approved by Graeme 28 Nov: "Otherwise all good"). Everyone has
 * an email account, on Free and the Plan; no password: a 6-digit code comes
 * by email. The account holds the email address, whether the Plan is paid,
 * and the trial's dates. Nothing else leaves the phone (account-client.js).
 * The only writer of `account` (Schema v1.145) and of the session's key.
 *
 * Switched off while account-config.js is empty: accountsOn() is false, no
 * account step, nothing sent, the trial stays on the phone as before.
 * Not for the young versions (canBuy): their accounts wait for their own review.
 *
 *   accountsOn()                  set up, and an adult version
 *   account(), session()          the record; the tokens (own key)
 *   signedIn(), needsAccount()    needsAccount: on, and not signed in
 *   sendCode(email, now)          { ok } or { ok: false, reason: off | invalid |
 *                                 wait (seconds) | offline | tooMany | failed }
 *   verifyCode(code, now)         { ok, welcomeBack } or { ok: false, reason:
 *                                 format | wrong | newCode | offline | failed }
 *   checkAccount(now)             on every open: the server's Plan and trial,
 *                                 mirrored into tier and planTrial
 *   tryThePlan(now)               the trial: on the account when signed in,
 *                                 else on the phone (plan-trial.js)
 *   backToFree(now)               Go back to Free now, the same way
 *   changeEmail(email), confirmEmailChange(code)
 *   signOut(), deleteAccount()
 *   devPretendSignedIn(), devSignOut()   the developer panel (S2)
 */

import { store } from "../store.js";
import { ACCOUNTS } from "./account-config.js";
import { accountClient } from "./account-client.js";
import { SESSION_KEY, sanitizeAccount, sanitizeSession, sanitizeServerTrial, isEmail, cleanEmail } from "./account-model.js";
import { sanitizePlanTrial } from "./plan-trial-model.js";
import { trial, trialActive, canStartTrial, startTrial, endTrial } from "./plan-trial.js";
import { canBuy } from "./age-version.js";
import { localDay } from "./in-step-offer.js";

export const CODE_MINUTES = 15;
export const RESEND_SECONDS = 60;
export const MAX_TRIES = 5;

let _config = ACCOUNTS;
let _fetch;   // undefined: account-client.js uses the browser's own
let _emailChange = null;
/** Gates only: point the module at a stand-in service. */
export function _configureForTest(config, fetchImpl) { _config = config || ACCOUNTS; _fetch = fetchImpl || undefined; }

const client = () => accountClient(_config, _fetch);
export const accountsOn = () => client().on && canBuy();
export const account = () => store.get("account") || {};

export function session() {
  try { return sanitizeSession(JSON.parse(localStorage.getItem(SESSION_KEY) || "{}")); } catch { return {}; }
}
function saveSession(s) { try { localStorage.setItem(SESSION_KEY, JSON.stringify(sanitizeSession(s))); } catch { /* storage unavailable */ } }
function clearSession() { try { localStorage.removeItem(SESSION_KEY); } catch { /* storage unavailable */ } }
const setAccount = o => store.set("account", sanitizeAccount(o));

export const signedIn = () => !!account().userId && !!session().refreshToken;
export const needsAccount = () => accountsOn() && !signedIn();

const offline = () => typeof navigator !== "undefined" && navigator.onLine === false;
const fromAuth = (d, now) => ({
  accessToken: d.access_token, refreshToken: d.refresh_token,
  expiresAt: Number.isFinite(d.expires_at) ? d.expires_at : Math.floor(now.getTime() / 1000) + (Number(d.expires_in) || 3600),
});

/** A current access token, refreshed if it is about to run out; null if there is none. */
async function accessToken(now = new Date()) {
  const s = session();
  if (!s.refreshToken) return null;
  if (s.expiresAt * 1000 - 60000 > now.getTime()) return s.accessToken;
  const r = await client().refresh(s.refreshToken);
  if (r.ok && r.data?.access_token && r.data?.refresh_token) { const n = fromAuth(r.data, now); saveSession(n); return n.accessToken; }
  if (r.status === 400 || r.status === 401) clearSession();   // the server has signed this phone out
  return null;
}

// ── Signing in ────────────────────────────────────────────────────────────

export async function sendCode(email, now = new Date()) {
  if (!accountsOn()) return { ok: false, reason: "off" };
  const e = cleanEmail(email);
  if (!isEmail(e)) return { ok: false, reason: "invalid" };
  const p = account().pending;
  if (p && p.email === e) {
    const waited = (now - new Date(p.sentAt)) / 1000;
    if (waited < RESEND_SECONDS) return { ok: false, reason: "wait", seconds: Math.ceil(RESEND_SECONDS - waited) };
  }
  if (offline()) return { ok: false, reason: "offline" };
  let r;
  try { r = await client().sendCode(e); } catch { return { ok: false, reason: "offline" }; }
  if (r.status === 429) return { ok: false, reason: "tooMany" };
  if (!r.ok) return { ok: false, reason: "failed" };
  setAccount({ ...account(), pending: { email: e, sentAt: now.toISOString(), tries: 0 } });
  return { ok: true, email: e };
}

export async function verifyCode(code, now = new Date()) {
  const p = account().pending;
  if (!p) return { ok: false, reason: "newCode" };
  const c = String(code || "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(c)) return { ok: false, reason: "format" };
  if (p.tries >= MAX_TRIES || (now - new Date(p.sentAt)) > CODE_MINUTES * 60000) return { ok: false, reason: "newCode" };
  if (offline()) return { ok: false, reason: "offline" };
  let r;
  try { r = await client().verifyCode(p.email, c); } catch { return { ok: false, reason: "offline" }; }
  if (!r.ok || !r.data?.access_token || !r.data?.user?.id) {
    if (r.status >= 500) return { ok: false, reason: "failed" };
    const tries = p.tries + 1;
    setAccount({ ...account(), pending: { ...p, tries } });
    return { ok: false, reason: tries >= MAX_TRIES ? "newCode" : "wrong" };
  }
  saveSession(fromAuth(r.data, now));
  const made = Date.parse(r.data.user.created_at || "");
  setAccount({ email: cleanEmail(r.data.user.email || p.email), userId: r.data.user.id, signedInAt: now.toISOString() });
  await carryPhoneTrial(now);
  await checkAccount(now);
  return { ok: true, welcomeBack: Number.isFinite(made) && now - made > 10 * 60000 };
}

/** Rule 11: a trial started on this phone before accounts moves onto the account, once. */
async function carryPhoneTrial(now) {
  const t = trial();
  if (!trialActive(t)) return;
  const tok = await accessToken(now);
  if (!tok) return;
  const r = await client().readAccount(tok).catch(() => null);
  const row = Array.isArray(r?.data) ? r.data[0] : null;
  if (!r?.ok || row?.trial_started_at) return;
  await client().startTrial(tok, localDay(new Date(t.startedAt))).catch(() => null);
}

// ── On every open: the server's word on the Plan and the trial ────────────

function mirror(row, now) {
  const today = localDay(now);
  const t = sanitizeServerTrial({
    startedAt: row?.trial_started_at, endsOn: row?.trial_ends_on,
    endedAt: row?.trial_ended_at, endedHow: row?.trial_ended_how,
  });
  if (t.startedAt && !t.endedAt && t.endsOn <= today) { t.endedAt = now.toISOString(); t.endedHow = "ended"; }
  const paid = row?.tier === "personal";
  const { trial: _old, ...rest } = account();
  setAccount({ ...rest, tier: paid ? "personal" : "free", ...(t.startedAt ? { trial: t } : {}), checkedAt: now.toISOString() });
  // The phone's copy: the server's dates; this phone's notice (same trial) and offer.
  const local = trial();
  const keep = {};
  if (local.offeredAt) keep.offeredAt = local.offeredAt;
  if (local.noticedAt && local.startedAt === t.startedAt) keep.noticedAt = local.noticedAt;
  store.set("planTrial", sanitizePlanTrial({ ...keep, ...t }));
  store.set("tier", paid || (t.startedAt && !t.endedAt) ? "personal" : "free");
}

/** "off" | "signedOut" | "offline" | "checked" */
export async function checkAccount(now = new Date()) {
  if (!accountsOn()) return "off";
  if (!signedIn()) return "signedOut";
  if (offline()) return "offline";
  try {
    const tok = await accessToken(now);
    if (!tok) return signedIn() ? "offline" : "signedOut";
    const r = await client().readAccount(tok);
    if (r.status === 401) { clearSession(); return "signedOut"; }
    if (!r.ok) return "offline";
    mirror(Array.isArray(r.data) ? r.data[0] || {} : {}, now);
    return "checked";
  } catch { return "offline"; }
}

// ── The trial, through the account when there is one ──────────────────────

export async function tryThePlan(now = new Date()) {
  if (!(accountsOn() && signedIn())) return startTrial(now);
  if (!canStartTrial()) return false;
  try {
    const tok = await accessToken(now);
    if (!tok) return false;
    const r = await client().startTrial(tok, localDay(now));
    if (!r.ok) return false;
    await checkAccount(now);
    return trialActive();
  } catch { return false; }
}

export async function backToFree(now = new Date()) {
  if (!(accountsOn() && signedIn())) return endTrial(now, "stopped");
  try {
    const tok = await accessToken(now);
    if (!tok) return false;
    const r = await client().endTrial(tok);
    if (!r.ok) return false;
    await checkAccount(now);
    return !trialActive();
  } catch { return false; }
}

// ── Settings › Your account ───────────────────────────────────────────────

export async function changeEmail(email, now = new Date()) {
  const e = cleanEmail(email);
  if (!isEmail(e) || e === account().email) return { ok: false, reason: "invalid" };
  try {
    const tok = await accessToken(now);
    if (!tok) return { ok: false, reason: "offline" };
    const r = await client().changeEmail(tok, e);
    if (r.status === 429) return { ok: false, reason: "tooMany" };
    if (!r.ok) return { ok: false, reason: "failed" };
    _emailChange = { email: e, tries: 0 };
    return { ok: true, email: e };
  } catch { return { ok: false, reason: "offline" }; }
}

export async function confirmEmailChange(code) {
  if (!_emailChange) return { ok: false, reason: "newCode" };
  const c = String(code || "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(c)) return { ok: false, reason: "format" };
  try {
    const r = await client().verifyEmailChange(_emailChange.email, c);
    if (!r.ok) {
      _emailChange.tries += 1;
      if (_emailChange.tries >= MAX_TRIES) { _emailChange = null; return { ok: false, reason: "newCode" }; }
      return { ok: false, reason: "wrong" };
    }
    setAccount({ ...account(), email: _emailChange.email });
    _emailChange = null;
    return { ok: true };
  } catch { return { ok: false, reason: "offline" }; }
}

/** Back to the email step. Nothing on the phone is deleted; the email is kept to fill the box. */
export async function signOut(now = new Date()) {
  const tok = session().accessToken;
  if (tok && accountsOn()) { try { await client().signOut(tok); } catch { /* signed out here anyway */ } }
  clearSession();
  setAccount({ email: account().email });
  return true;
}

/** The account and its email address deleted from the server; this phone keeps what is on it. */
export async function deleteAccount(now = new Date()) {
  try {
    const tok = await accessToken(now);
    if (!tok) return { ok: false, reason: "offline" };
    const r = await client().deleteAccount(tok);
    if (!r.ok) return { ok: false, reason: "failed" };
  } catch { return { ok: false, reason: "offline" }; }
  clearSession();
  setAccount({});
  if (trialActive()) endTrial(now, "stopped");
  else if (store.get("tier") === "personal") store.set("tier", "free");
  return { ok: true };
}

// ── The developer panel (S2; the panel is off at release) ────────────────

export function devPretendSignedIn(now = new Date()) {
  setAccount({ email: "dev@example.com", userId: "00000000-0000-4000-8000-000000000000", signedInAt: now.toISOString() });
  saveSession({ accessToken: "dev-access-token", refreshToken: "dev-refresh-token", expiresAt: Math.floor(now.getTime() / 1000) + 3650 * 86400 });
}
export function devSignOut() { clearSession(); setAccount({ email: account().email }); }
