/**
 * tools/verify-restore-lock.mjs
 * 04 Oct 2026 v5
 *
 * v5 - LOOK-1: Download your data and Restore from a file are on the Your
 *   data section page, not the Settings index; the clicks find them with
 *   settingsFind. #settings-result is read on that page as before. No
 *   assertion loosened.
 *
 * 02 Oct 2026 v4
 *
 * v4 - W4-13. Fixtures give the health consent at the current version: given
 *   to older wording now asks again. No assertion changed.
 *
 * 02 Oct 2026 v3
 *
 * v3 - W4-6. The download's outcome is read where the person sees it (#settings-result,
 *   on the page), not from the screen-reader-only line. No assertion loosened.
 *
 * v2 - Waits for each lock and unlock to finish instead of a fixed 1.5 s,
 *   so a busy machine cannot fail it. No assertion changed.
 *
 *
 * B2 RESTORE-LOCK. An optional password on the Download your data file.
 *
 *   1. The lock itself (js/data/file-lock.js): a locked file round-trips;
 *      a wrong password, or a file changed after locking, is refused; each
 *      file gets its own salt and IV; the password is nowhere in the file;
 *      the text inside cannot be read without it.
 *   2. Download your data (Settings, driven): the button opens a dialog
 *      with an optional password typed twice and the warning, word for word,
 *      before anything is saved. No password: the plain file, as before. A
 *      short or mismatched password: nothing saved, the reason said. A good
 *      password: a locked file, and the message says it is locked.
 *   3. Restore from a file (Settings, driven): a locked file asks for its
 *      password; a wrong one changes nothing and says so; the right one
 *      goes on to the usual "what this file holds" confirmation, and the
 *      history comes back.
 *   4. The password is not kept: nothing in Alongside's storage holds it.
 */
import { createRequire as __cr } from "node:module";
import { settingsFind } from "./settings-open.mjs";
import { HEALTH_CONSENT_VERSION as HEALTH_V } from "../js/data/health-consent.js";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "FileReader", "File", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
let lastBlob = null, lastName = null;
dom.window.URL.createObjectURL = b => { lastBlob = b; return "blob:x"; };
dom.window.URL.revokeObjectURL = () => {};
globalThis.URL = dom.window.URL;
const origAnchorClick = dom.window.HTMLAnchorElement.prototype.click;
dom.window.HTMLAnchorElement.prototype.click = function () { if (this.download) lastName = this.download; else origAnchorClick.call(this); };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const wait = ms => new Promise(r => setTimeout(r, ms));
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
// Locking takes 600,000 rounds on purpose; wait for the outcome, not a fixed time.
const until = async (cond, ms = 10000) => { const end = Date.now() + ms; while (!cond() && Date.now() < end) await wait(25); };
const type = (el, v) => { if (el) { el.value = v; el.dispatchEvent(new dom.window.Event("input", { bubbles: true })); } };
const blobText = async b => b ? (typeof b.text === "function" ? b.text() : new Response(b).text()) : "";
const SECRET = "correct horse 42";
const JOURNAL = "a private line about my knee";

let L = null;
try { L = await import(B + "data/file-lock.js"); } catch { /* red first */ }

// ── 1. THE LOCK ─────────────────────────────────────────────────────────
console.log("\nTEST 1 - the lock");
ok("1pc. positive control: file-lock.js loads and this runtime has Web Crypto", !!L && L.lockAvailable());
if (L) {
  const plain = JSON.stringify({ about: "x", store: { journalEntries: [{ text: JOURNAL }] } });
  const a = await L.lockText(plain, SECRET);
  const b = await L.lockText(plain, SECRET);
  const back = await L.unlockText(a, SECRET);
  ok("1a. a locked file opens with its password, unchanged", back.ok && back.text === plain);
  ok("1b. a wrong password is refused, and says nothing changed",
     !(await L.unlockText(a, "correct horse 43")).ok && /Nothing has been changed/.test((await L.unlockText(a, "nope nope 1")).reason));
  const o = JSON.parse(a); const t = o.data.slice(0, 10) + (o.data[10] === "A" ? "B" : "A") + o.data.slice(11);
  ok("1c. a file changed after locking is refused", !(await L.unlockText(JSON.stringify({ ...o, data: t }), SECRET)).ok);
  ok("1d. each file has its own salt and IV", JSON.parse(a).salt !== JSON.parse(b).salt && JSON.parse(a).iv !== JSON.parse(b).iv);
  ok("1e. neither the password nor the text is in the locked file", !a.includes(SECRET) && !a.includes(JOURNAL) && !a.includes("journalEntries"));
  ok("1f. it says what it is, and is recognised as locked", o.about === L.LOCKED_ABOUT && L.isLocked(a) && !L.isLocked(plain));
  ok("1g. AES-256-GCM, PBKDF2-SHA-256, 600,000 rounds", o.cipher === "AES-256-GCM" && o.kdf === "PBKDF2-SHA-256" && o.iterations === 600000);
  ok("1h. password rules: none is fine; under 8 refused; two must match",
     L.passwordProblem("", "") === "" && /at least 8/.test(L.passwordProblem("short", "short")) && /match/.test(L.passwordProblem("longenough1", "longenough2")) && L.passwordProblem(SECRET, SECRET) === "");
}

// ── 2. DOWNLOAD ─────────────────────────────────────────────────────────
console.log("\nTEST 2 - Download your data, with and without a password");
function phone() {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", "free"); store.set("name", "Sam");
  store.set("consent", { given: true, at: "2026-10-01T09:00:00Z", policyVersion: "2026-10-01", ageConfirmed: true,
    ageCheckedAt: "2026-10-01T09:00:00Z", ageVersion: "2026-10-01",
    health: { given: true, at: "2026-10-01T09:00:00Z", version: HEALTH_V, withdrawnAt: null } });
  store.set("journalEntries", [{ id: "j1", date: "2026-09-21T10:00:00Z", text: JOURNAL, tags: [] }]);
  store.set("activityLog", [{ id: "a1", date: "2026-09-20T10:00:00Z", type: "workout", status: "completed", durationMins: 30 }]);
}
const { SettingsView } = await import(B + "views/settings.js");
const mount = () => { main.innerHTML = ""; SettingsView({ navigate() {}, back() {} }).mount(main); };
const dlg = () => document.getElementById("settings-download-dialog");
const saved = () => txt(main.querySelector("#settings-result"));

phone(); mount(); await wait(20);
lastBlob = null;
click(settingsFind(main, '[data-action="download-data"]')); await wait(20);
ok("2pc. positive control: the Download button is there and opens a dialog", !!dlg());
ok("2a. nothing is saved until the person chooses", lastBlob === null);
const pw = () => document.getElementById("download-pw"), pw2 = () => document.getElementById("download-pw2");
ok("2b. two labelled password fields, optional",
   pw()?.type === "password" && pw2()?.type === "password" &&
   /optional/i.test(txt(document.querySelector('label[for="download-pw"]'))) && !!document.querySelector('label[for="download-pw2"]'));
ok("2c. the warning, word for word, before saving",
   /If you forget this password, nobody can open this file, including us\. Write it down and keep it where you can find it\./.test(txt(dlg())) &&
   /Without a password, anyone who has the file can read it, so keep it somewhere private\./.test(txt(dlg())), txt(dlg()));
click(document.getElementById("download-save")); await wait(60);
const plainFile = await blobText(lastBlob);
ok("2d. no password: the plain file, as before", !!plainFile && JSON.parse(plainFile).store?.journalEntries?.[0]?.text === JOURNAL && !dlg());
ok("2e. and the message says anyone with it can read it", /anyone who has the file can read it/.test(saved()), saved());

lastBlob = null; click(settingsFind(main, '[data-action="download-data"]')); await wait(20);
type(pw(), "short"); type(pw2(), "short"); click(document.getElementById("download-save")); await wait(60);
ok("2f. a short password: nothing saved, the reason said where the person is",
   lastBlob === null && !!dlg() && /at least 8/.test(txt(document.getElementById("download-pw-error"))) &&
   document.getElementById("download-pw-error")?.getAttribute("role") === "alert");
type(pw(), SECRET); type(pw2(), SECRET + "x"); click(document.getElementById("download-save")); await wait(60);
ok("2g. mismatched: nothing saved", lastBlob === null && /match/.test(txt(document.getElementById("download-pw-error"))));
type(pw2(), SECRET); click(document.getElementById("download-save")); await until(() => /locked/i.test(saved()));
const lockedFile = await blobText(lastBlob);
ok("2h. a good password: a locked file, the journal unreadable in it",
   !!L && L.isLocked(lockedFile) && !lockedFile.includes(JOURNAL) && !lockedFile.includes(SECRET), lockedFile.slice(0, 80));
ok("2i. the message says it is locked, and only the password opens it", /locked/i.test(saved()) && /password/i.test(saved()), saved());
ok("2j. the file's name says it is locked", /locked/.test(lastName || ""), lastName);

// ── 3. RESTORE ──────────────────────────────────────────────────────────
console.log("\nTEST 3 - Restore from a locked file");
function newPhone() {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true);
  store.set("consent", { given: true, at: "2026-10-01T09:00:00Z", policyVersion: "2026-10-01", ageConfirmed: true,
    ageCheckedAt: "2026-10-01T09:00:00Z", ageVersion: "2026-10-01",
    health: { given: true, at: "2026-10-01T09:00:00Z", version: HEALTH_V, withdrawnAt: null } });
}
let picked = null;
const origClick = dom.window.HTMLInputElement.prototype.click;
dom.window.HTMLInputElement.prototype.click = function () { if (this.type === "file") picked = this; else origClick.call(this); };
async function pick(text) {
  picked = null; click(settingsFind(main, '[data-action="restore-data"]')); await wait(20);
  Object.defineProperty(picked, "files", { value: [new File([text], "alongside-data-locked.json", { type: "application/json" })] });
  picked.dispatchEvent(new dom.window.Event("change")); await wait(80);
}
const askDlg = () => document.getElementById("settings-unlock-dialog");
newPhone(); mount(); await wait(20);
await pick(lockedFile || "{}");
ok("3a. a locked file asks for its password first, changing nothing", !!askDlg() && !document.getElementById("settings-confirm-dialog") && !store.get("name"));
const upw = () => document.getElementById("unlock-pw");
ok("3b. a labelled password field", upw()?.type === "password" && !!document.querySelector('label[for="unlock-pw"]'));
type(upw(), "wrong password"); click(document.getElementById("unlock-open")); await until(() => !!txt(document.getElementById("unlock-error")));
ok("3c. a wrong password: refused, said, nothing changed",
   !!askDlg() && /doesn.t open this file/.test(txt(document.getElementById("unlock-error"))) && !store.get("name"));
type(upw(), SECRET); click(document.getElementById("unlock-open")); await until(() => !!document.getElementById("settings-confirm-dialog"));
const conf = document.getElementById("settings-confirm-dialog");
ok("3d. the right one: then the usual confirmation of what the file holds", !askDlg() && !!conf && /1 session and 1 journal entry/.test(txt(conf)), txt(conf));
click(document.getElementById("confirm-ok")); await wait(30);
ok("3e. confirmed: the history is back", store.get("name") === "Sam" && store.get("journalEntries")?.[0]?.text === JOURNAL);
newPhone(); mount(); await wait(20);
await pick(lockedFile || "{}");
click(document.getElementById("unlock-cancel")); await wait(20);
ok("3f. Cancel closes it and changes nothing", !askDlg() && !store.get("name"));
dom.window.HTMLInputElement.prototype.click = origClick;

// ── 4. NOT KEPT ─────────────────────────────────────────────────────────
console.log("\nTEST 4 - the password is not kept");
const all = Array.from({ length: localStorage.length }, (_, i) => localStorage.getItem(localStorage.key(i))).join("\n");
ok("4a. nothing in Alongside's storage holds it", !all.includes(SECRET));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
