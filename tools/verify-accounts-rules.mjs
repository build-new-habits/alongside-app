/**
 * tools/verify-accounts-rules.mjs
 * 28 Nov 2026 v1
 *
 * Row 13a ACCOUNTS, S1 (spec docs/specs/alongside_accounts_spec_28nov2026_v2.md;
 * mock-up v2 approved by Graeme 28 Nov). Driven against a stand-in account
 * service that answers as Supabase Auth and its REST interface do.
 *
 *   1  Schema v1.145: account, cleaned on load; the tokens in their own key.
 *   2  Switched off (account-config.js empty): nothing sent, nothing changes,
 *      the trial stays on the phone.
 *   3  Signing in with a code: invalid address, the 60-second wait, offline,
 *      wrong codes (5 then a new code), the right code, welcome back.
 *   4  What leaves the phone: only the listed addresses and keys; no health
 *      answer, check-in, note or name; no cookies or referrer.
 *   5  The server's word on each open: the trial and the Plan mirrored into
 *      planTrial and tier; one trial per account; Go back to Free now.
 *   6  A trial started on the phone before accounts moves onto the account.
 *   7  Tokens: refreshed when old; a refused refresh signs the phone out.
 *   8  Sign out, Delete my account, Reset all data.
 *   9  Restore keeps this phone's account and tokens.
 *  10  Not in a young version. app.js checks without holding up the screen.
 *
 * Red on alongside-v764.
 */
import { agreed } from "./agreed.mjs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div><nav id="bottom-nav"></nav></div><div id="sr-announcer"></div>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.history = dom.window.history; globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s).replace(/"/g, '\\"') };
let globalFetches = 0;
globalThis.fetch = async () => { globalFetches++; return { ok: false, status: 0, json: async () => null }; };

const fs = await import("node:fs");
const read = f => fs.readFileSync(new URL("../" + f, import.meta.url), "utf8");
let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${String(detail).slice(0, 300)}`); }
};
async function block(name, fn) { try { await fn(); } catch (e) { ok(`${name}: ran without throwing`, false, e.stack?.split("\n").slice(0, 3).join(" | ")); } }

let A, M, T, store, R;
try {
  const B = new URL("../js/", import.meta.url).href;
  ({ store } = await import(B + "store.js"));
  const { router } = await import(B + "router.js");
  globalThis.window.router = router;
  A = await import(B + "data/account.js");
  M = await import(B + "data/account-model.js");
  T = await import(B + "data/plan-trial.js");
  R = await import(B + "data/restore.js");
} catch (e) {
  ok("the account files exist and load", false, e.message);
  console.log(`\n${passes} passed, ${fails} failed`);
  process.exit(1);
}

const at = (y, m, d, h = 9, min = 0, s = 0) => new Date(y, m - 1, d, h, min, s);
const CONFIG = { url: "https://abcdefghij.supabase.co", anonKey: "public-anon-key-0123456789abcdef" };

/** A stand-in for Supabase Auth and REST: answers the calls the app makes, and keeps a log. */
function server({ code = "482917", createdAt = null } = {}) {
  const s = { code, log: [], users: {}, rows: {}, tokens: {}, n: 0, refreshOk: true, createdAt, fail: null };
  const tok = (p, id) => { s.n++; const t = `${p}-token-${String(s.n).padStart(6, "0")}`; s.tokens[t] = id; return t; };
  const res = (status, data) => ({ ok: status >= 200 && status < 300, status, json: async () => data });
  s.fetch = async (url, init = {}) => {
    const u = new URL(url);
    const body = init.body ? JSON.parse(init.body) : null;
    s.log.push({ url, path: u.pathname, method: init.method, body, init });
    if (s.fail) return res(s.fail, {});
    const who = s.tokens[(init.headers?.Authorization || "").replace(/^Bearer /, "")];
    switch (u.pathname) {
      case "/auth/v1/otp": return res(200, {});
      case "/auth/v1/verify": {
        if (body.token !== s.code) return res(403, { msg: "Token has expired or is invalid" });
        if (body.type === "email_change") { const id = Object.keys(s.users).find(k => s.users[k].email !== body.email) ; if (id) s.users[id].email = body.email; return res(200, {}); }
        let id = Object.keys(s.users).find(k => s.users[k].email === body.email);
        if (!id) { id = `0b1c2d3e-4f50-4a6b-8c7d-${String(Object.keys(s.users).length + 1).padStart(12, "0")}`; s.users[id] = { id, email: body.email, created_at: s.createdAt || new Date().toISOString() }; s.rows[id] = { tier: "free" }; }
        return res(200, { access_token: tok("access", id), refresh_token: tok("refresh", id), expires_in: 3600, user: s.users[id] });
      }
      case "/auth/v1/token": {
        const id = s.tokens[body.refresh_token];
        if (!s.refreshOk || !id) return res(400, { msg: "Invalid Refresh Token" });
        return res(200, { access_token: tok("access", id), refresh_token: tok("refresh", id), expires_in: 3600 });
      }
      case "/auth/v1/logout": return res(204, null);
      case "/auth/v1/user": return who ? res(200, {}) : res(401, {});
      case "/rest/v1/accounts": return who ? res(200, s.rows[who] ? [s.rows[who]] : []) : res(401, {});
      case "/rest/v1/rpc/start_my_trial": {
        if (!who) return res(401, {});
        const row = s.rows[who];
        if (row.trial_started_at) return res(400, { message: "one trial per account" });
        const [y, m, d] = body.p_today.split("-").map(Number);
        const end = new Date(Date.UTC(y, m - 1, d + 14)).toISOString().slice(0, 10);
        Object.assign(row, { trial_started_at: new Date(Date.UTC(y, m - 1, d, 9)).toISOString(), trial_ends_on: end });
        return res(200, null);
      }
      case "/rest/v1/rpc/end_my_trial": {
        if (!who) return res(401, {});
        Object.assign(s.rows[who], { trial_ended_at: new Date().toISOString(), trial_ended_how: "stopped" });
        return res(200, null);
      }
      case "/rest/v1/rpc/delete_my_account": { if (!who) return res(401, {}); delete s.rows[who]; delete s.users[who]; return res(200, null); }
      default: return res(404, {});
    }
  };
  return s;
}

function person({ tier = "free", age = "adult" } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", tier);
  store.set("consent", { ...(store.get("consent") || {}), ageConfirmed: true, ageGroup: age });
  // Health answers and notes on the phone: none of these may ever be sent.
  store.set("conditions", ["lower-back"]); store.set("conditionPainScores", { "lower-back": 2 });
  store.set("checkinHistory", { "2026-12-01": { energy: 2, mood: 2, note: "Back flared again" } });
  store.set("journalEntries", [{ id: "j1", text: "A hard week at home" }]);
  Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
}
const setOnline = v => Object.defineProperty(navigator, "onLine", { value: v, configurable: true });
async function signIn(srv, now = at(2026, 12, 1), email = "sam@example.com") {
  await A.sendCode(email, now);
  return A.verifyCode(srv.code, new Date(now.getTime() + 30000));
}

// ── 1 ─────────────────────────────────────────────────────────────────────
console.log("\nTEST 1 - Schema v1.145: account, cleaned on load; the tokens in their own key");
await block("1", async () => {
  localStorage.clear(); store.init();
  ok("1a. account is {} for a new person", JSON.stringify(store.get("account")) === "{}", JSON.stringify(store.get("account")));
  const s = M.sanitizeAccount;
  ok("1b. a whole record keeps its fields", JSON.stringify(Object.keys(s({ email: " Sam@Example.com ", userId: "0b1c2d3e-4f50-4a6b-8c7d-000000000001", signedInAt: "2026-12-01T09:00:00.000Z", checkedAt: "2026-12-01T09:00:00.000Z", tier: "personal", trial: { startedAt: "2026-12-01T09:00:00.000Z", endsOn: "2026-12-15" } }))) === '["email","userId","signedInAt","checkedAt","tier","trial"]');
  ok("1c. the email address is kept in lower case, trimmed", s({ email: " Sam@Example.com " }).email === "sam@example.com");
  ok("1d. not an email address: dropped, and no userId without one", JSON.stringify(s({ email: "<b>x</b>", userId: "0b1c2d3e-4f50-4a6b-8c7d-000000000001" })) === "{}");
  ok("1e. a tier other than personal loads as free", s({ email: "a@b.co", userId: "0b1c2d3e-4f50-4a6b-8c7d-000000000001", tier: "athlete" }).tier === "free");
  ok("1f. a code on its way only before signing in; tries kept between 0 and 5", !s({ email: "a@b.co", userId: "0b1c2d3e-4f50-4a6b-8c7d-000000000001", pending: { email: "a@b.co", sentAt: "2026-12-01T09:00:00.000Z" } }).pending && s({ pending: { email: "a@b.co", sentAt: "2026-12-01T09:00:00.000Z", tries: 9 } }).pending.tries === 0);
  ok("1g. junk loads as {}", JSON.stringify(s("x")) === "{}" && JSON.stringify(s([1])) === "{}");
  localStorage.setItem(store.STORAGE_KEY, JSON.stringify({ account: { email: "a@b.co", userId: "nope", tier: "personal" } })); store.init();
  ok("1h. the store cleans it on load", JSON.stringify(store.get("account")) === '{"email":"a@b.co"}', JSON.stringify(store.get("account")));
  ok("1i. the tokens' key is alongside-account-session, outside the store", M.SESSION_KEY === "alongside-account-session" && !("accountSession" in store.data));
  ok("1j. Schema.md v1.145 describes account", /## 28 Nov 2026 v1\.145/.test(read("docs/Schema.md")) && /\*\*`account`\*\* `\{ email, userId, signedInAt, checkedAt, tier, trial, pending \}`/.test(read("docs/Schema.md")));
});

// ── 2 ─────────────────────────────────────────────────────────────────────
console.log("\nTEST 2 - Switched off: nothing sent, nothing changes, the trial stays on the phone");
await block("2", async () => {
  ok("2a. account-config.js starts empty", /export const ACCOUNTS = Object\.freeze\(\{ url: "", anonKey: "" \}\);/.test(read("js/data/account-config.js")));
  person(); A._configureForTest(null, null); globalFetches = 0;
  ok("2b. off: accountsOn() false, nobody needs an account", A.accountsOn() === false && A.needsAccount() === false);
  ok("2c. checkAccount says off", (await A.checkAccount(at(2026, 12, 1))) === "off");
  ok("2d. Try the Plan starts the phone's trial, as before", (await A.tryThePlan(at(2026, 12, 1))) === true && store.get("tier") === "personal" && T.trial().endsOn === "2026-12-15");
  ok("2e. Go back to Free now, as before", (await A.backToFree(at(2026, 12, 3))) === true && store.get("tier") === "free" && T.trial().endedHow === "stopped");
  ok("2f. sendCode sends nothing: off", (await A.sendCode("sam@example.com")).reason === "off");
  ok("2g. nothing went to the web", globalFetches === 0, globalFetches);
});

// ── 3 ─────────────────────────────────────────────────────────────────────
console.log("\nTEST 3 - Signing in with a code");
await block("3", async () => {
  person(); const t0 = at(2026, 12, 1);
  const srv = server({ createdAt: new Date(t0.getTime() + 1330000).toISOString() }); A._configureForTest(CONFIG, srv.fetch);
  ok("3a. set up: accountsOn(), and a new person needs an account", A.accountsOn() && A.needsAccount() && !A.signedIn());
  ok("3b. not an email address: invalid, nothing sent", (await A.sendCode("sam at home")).reason === "invalid" && srv.log.length === 0);
  const r1 = await A.sendCode(" Sam@Example.com ", t0);
  ok("3c. a code is asked for, and the address remembered as on its way", r1.ok && store.get("account").pending?.email === "sam@example.com" && srv.log[0].path === "/auth/v1/otp" && srv.log[0].body.email === "sam@example.com");
  const r2 = await A.sendCode("sam@example.com", new Date(t0.getTime() + 20000));
  ok("3d. another code within 60 seconds: wait, with the seconds left", r2.reason === "wait" && r2.seconds === 40 && srv.log.length === 1, JSON.stringify(r2));
  ok("3e. after 60 seconds: sent again", (await A.sendCode("sam@example.com", new Date(t0.getTime() + 61000))).ok && srv.log.length === 2);
  setOnline(false);
  ok("3f. offline: says so, sends nothing", (await A.sendCode("other@example.com", t0)).reason === "offline" && srv.log.length === 2);
  setOnline(true);
  ok("3g. a code that is not 6 digits: format, nothing sent", (await A.verifyCode("12345", t0)).reason === "format" && srv.log.length === 2);
  const reasons = [];
  for (let i = 0; i < 5; i++) reasons.push((await A.verifyCode("000000", new Date(t0.getTime() + 70000))).reason);
  ok("3h. four wrong codes say wrong; the fifth asks for a new code", reasons.join() === "wrong,wrong,wrong,wrong,newCode", reasons.join());
  ok("3i. after five, even the right code needs a new one", (await A.verifyCode(srv.code, new Date(t0.getTime() + 80000))).reason === "newCode");
  await A.sendCode("sam@example.com", new Date(t0.getTime() + 200000));
  ok("3j. a code older than 15 minutes asks for a new one", (await A.verifyCode(srv.code, new Date(t0.getTime() + 200000 + 16 * 60000))).reason === "newCode");
  await A.sendCode("sam@example.com", new Date(t0.getTime() + 1300000));
  const v = await A.verifyCode(srv.code, new Date(t0.getTime() + 1330000));
  ok("3k. the right code signs in", v.ok && A.signedIn() && !A.needsAccount(), JSON.stringify(v));
  const a = store.get("account");
  ok("3l. the account holds the email address and the id; nothing on its way now", a.email === "sam@example.com" && /^[0-9a-f-]{36}$/.test(a.userId) && !a.pending);
  const raw = JSON.parse(localStorage.getItem(M.SESSION_KEY) || "{}");
  ok("3m. the tokens are in their own key, not the store", !!raw.refreshToken && !JSON.stringify(store.data).includes(raw.refreshToken));
  ok("3n. a new account is not a welcome back", v.welcomeBack === false);
  person(); const old = server({ createdAt: "2026-06-01T09:00:00.000Z" }); A._configureForTest(CONFIG, old.fetch);
  ok("3o. an account made before: welcome back", (await signIn(old)).welcomeBack === true);
});

// ── 4 ─────────────────────────────────────────────────────────────────────
console.log("\nTEST 4 - What leaves the phone");
await block("4", async () => {
  person(); const srv = server(); A._configureForTest(CONFIG, srv.fetch);
  await signIn(srv); await A.tryThePlan(at(2026, 12, 2)); await A.checkAccount(at(2026, 12, 3)); await A.backToFree(at(2026, 12, 4));
  await A.changeEmail("new@example.com"); await A.confirmEmailChange(srv.code); await A.signOut();
  await signIn(srv, at(2026, 12, 5), "new@example.com"); await A.deleteAccount(at(2026, 12, 5));
  const paths = [...new Set(srv.log.map(l => l.path))].sort();
  ok("4a. every call the account makes was driven", paths.length === 9, paths.join(" "));
  ok("4b. only to the account service's https address", srv.log.every(l => l.url.startsWith(CONFIG.url + "/")));
  const allowed = new Set(["email", "token", "type", "create_user", "refresh_token", "p_today"]);
  const keys = [...new Set(srv.log.flatMap(l => Object.keys(l.body || {})))];
  ok("4c. what is sent: only the email, the code and its type, the refresh token and the trial's start day", keys.every(k => allowed.has(k)), keys.join());
  const sent = JSON.stringify(srv.log.map(l => l.body));
  ok("4d. never a health answer, check-in, journal, note or name", !/Back flared|hard week|lower-back|energy|mood|Sam"/.test(sent), sent.slice(0, 200));
  ok("4e. no cookies, no referrer, nothing cached", srv.log.every(l => l.init.credentials === "omit" && l.init.referrerPolicy === "no-referrer" && l.init.cache === "no-store"));
  ok("4f. the client refuses anything else, before sending", read("js/data/account-client.js").includes('if (body && Object.keys(body).some(k => !BODY_KEYS.has(k))) throw'));
  const C = await import(new URL("../js/data/account-client.js", import.meta.url).href);
  const before = srv.log.length;
  ok("4g. not a Supabase https address: off, and nothing sent", C.accountClient({ url: "https://evil.example.com", anonKey: CONFIG.anonKey }, srv.fetch).on === false &&
     await C.accountClient({ url: "http://abcdefghij.supabase.co", anonKey: CONFIG.anonKey }, srv.fetch).sendCode("a@b.co").then(() => false, () => true) && srv.log.length === before);
});

// ── 5 ─────────────────────────────────────────────────────────────────────
console.log("\nTEST 5 - The server's word on each open; one trial per account");
await block("5", async () => {
  person(); const srv = server(); A._configureForTest(CONFIG, srv.fetch);
  await signIn(srv, at(2026, 12, 1));
  ok("5a. signed in, Free, no trial", store.get("tier") === "free" && !T.trial().startedAt);
  ok("5b. Try the Plan asks the server, with today's local day", (await A.tryThePlan(at(2026, 12, 2, 20))) === true && srv.log.some(l => l.path === "/rest/v1/rpc/start_my_trial" && l.body.p_today === "2026-12-02"));
  ok("5c. the trial is mirrored: the Plan, to the server's end day", store.get("tier") === "personal" && T.trial().endsOn === "2026-12-16" && store.get("account").trial.endsOn === "2026-12-16");
  ok("5d. once per account: a second try is refused without asking", (await A.tryThePlan(at(2026, 12, 3))) === false);
  T.markNoticed(at(2026, 12, 14));
  await A.checkAccount(at(2026, 12, 14, 10));
  ok("5e. this phone's notice is kept across a check", !!T.trial().noticedAt);
  ok("5f. on the end day, the check ends it: back to Free", (await A.checkAccount(at(2026, 12, 16))) === "checked" && store.get("tier") === "free" && T.trial().endedHow === "ended");
  person(); const srv2 = server(); A._configureForTest(CONFIG, srv2.fetch);
  await signIn(srv2); await A.tryThePlan(at(2026, 12, 2));
  ok("5g. Go back to Free now tells the server, then Free", (await A.backToFree(at(2026, 12, 4))) === true && store.get("tier") === "free" && srv2.log.some(l => l.path === "/rest/v1/rpc/end_my_trial"));
  srv2.rows[Object.keys(srv2.rows)[0]].tier = "personal";
  await A.checkAccount(at(2026, 12, 5));
  ok("5h. paid on the server (row 14): the Plan", store.get("tier") === "personal" && store.get("account").tier === "personal");
  setOnline(false);
  ok("5i. offline: the check says so and changes nothing", (await A.checkAccount(at(2026, 12, 6))) === "offline" && store.get("tier") === "personal");
  setOnline(true);
  store.set("tier", "personal"); srv2.rows[Object.keys(srv2.rows)[0]].tier = "free";
  await A.checkAccount(at(2026, 12, 7));
  ok("5j. a phone that says Plan, with no paid Plan or trial on the server: Free", store.get("tier") === "free");
});

// ── 6 ─────────────────────────────────────────────────────────────────────
console.log("\nTEST 6 - A trial started on the phone before accounts moves onto the account");
await block("6", async () => {
  person(); A._configureForTest(null, null); T.startTrial(at(2026, 12, 1));
  const srv = server(); A._configureForTest(CONFIG, srv.fetch);
  await signIn(srv, at(2026, 12, 4));
  const call = srv.log.find(l => l.path === "/rest/v1/rpc/start_my_trial");
  ok("6a. carried, with its own start day", !!call && call.body.p_today === "2026-12-01", JSON.stringify(call?.body));
  ok("6b. and still running, to the same end day", store.get("tier") === "personal" && T.trial().endsOn === "2026-12-15");
});

// ── 7 ─────────────────────────────────────────────────────────────────────
console.log("\nTEST 7 - Tokens");
await block("7", async () => {
  person(); const srv = server(); A._configureForTest(CONFIG, srv.fetch);
  await signIn(srv, at(2026, 12, 1));
  const n = srv.log.length;
  await A.checkAccount(at(2026, 12, 1, 9, 30));
  ok("7a. a fresh token is used as it is", !srv.log.slice(n).some(l => l.path === "/auth/v1/token"));
  await A.checkAccount(at(2026, 12, 1, 11));
  ok("7b. an old one is refreshed first", srv.log.slice(n).some(l => l.path === "/auth/v1/token" && !!l.body.refresh_token));
  srv.refreshOk = false;
  ok("7c. a refused refresh signs this phone out", (await A.checkAccount(at(2026, 12, 1, 13))) === "signedOut" && !A.signedIn() && A.needsAccount());
});

// ── 8 ─────────────────────────────────────────────────────────────────────
console.log("\nTEST 8 - Sign out, Delete my account, Reset all data");
await block("8", async () => {
  person(); const srv = server(); A._configureForTest(CONFIG, srv.fetch);
  await signIn(srv); await A.tryThePlan(at(2026, 12, 2));
  const history = JSON.stringify(store.get("checkinHistory"));
  await A.signOut();
  ok("8a. sign out: back to needing the email step; the address kept to fill the box", !A.signedIn() && A.needsAccount() && JSON.stringify(store.get("account")) === '{"email":"sam@example.com"}');
  ok("8b. ... nothing on the phone deleted", JSON.stringify(store.get("checkinHistory")) === history && store.get("journalEntries").length === 1);
  await signIn(srv, at(2026, 12, 3));
  const del = await A.deleteAccount(at(2026, 12, 3));
  ok("8c. delete: the server deletes it", del.ok && srv.log.some(l => l.path === "/rest/v1/rpc/delete_my_account") && Object.keys(srv.users).length === 0);
  ok("8d. ... signed out, the record gone, a running trial ended, Free", !A.signedIn() && JSON.stringify(store.get("account")) === "{}" && store.get("tier") === "free" && T.trial().endedHow === "stopped");
  ok("8e. ... and this phone keeps what is on it", JSON.stringify(store.get("checkinHistory")) === history);
  await signIn(srv, at(2026, 12, 4));
  store.resetEverything();
  ok("8f. Reset all data removes the tokens too", localStorage.getItem(M.SESSION_KEY) === null && !A.signedIn());
});

// ── 9 ─────────────────────────────────────────────────────────────────────
console.log("\nTEST 9 - Restore keeps this phone's account and tokens");
await block("9", async () => {
  person(); const srv = server(); A._configureForTest(CONFIG, srv.fetch);
  await signIn(srv);
  const here = JSON.stringify(store.get("account")), tokens = localStorage.getItem(M.SESSION_KEY);
  const file = { exportedAt: "2026-11-01T09:00:00.000Z", about: "Everything Alongside: Move keeps about you on this device, including your journal. Nothing here was sent anywhere to make this file.",
    store: { ...JSON.parse(JSON.stringify(store.data)), account: { email: "someone@else.com", userId: "0b1c2d3e-4f50-4a6b-8c7d-999999999999" } },
    display: { [M.SESSION_KEY]: JSON.stringify({ accessToken: "file-access-token-1", refreshToken: "file-refresh-token-1", expiresAt: 9999999999 }) } };
  const r = R.readRestoreFile(JSON.stringify(file));
  R.applyRestore(r.data);
  ok("9a. this phone's account, not the file's", JSON.stringify(store.get("account")) === here, JSON.stringify(store.get("account")));
  ok("9b. this phone's tokens, never the file's", localStorage.getItem(M.SESSION_KEY) === tokens);
});

// ── 10 ────────────────────────────────────────────────────────────────────
console.log("\nTEST 10 - Not in a young version; the open");
await block("10", async () => {
  person({ age: "young-16" }); A._configureForTest(CONFIG, server().fetch);
  ok("10a. a young version: no account step (their own review first)", A.accountsOn() === false && A.needsAccount() === false);
  const app = read("js/app.js");
  const iT = app.indexOf("    checkTrial();"), iA = app.indexOf("checkAccount().then(");
  ok("10b. app.js checks the account after the trial, without waiting for it", iT > 0 && iA > iT && !/await checkAccount/.test(app));
  ok("10c. ... and a check that finds a change runs the trial's check again", /checkAccount\(\)\.then\(r => \{ if \(r === 'checked'\) checkTrial\(\); \}\)/.test(app));
});

A._configureForTest(null, null);
console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
