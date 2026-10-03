/**
 * tools/verify-restore-move.mjs
 * 03 Oct 2026 v3
 *
 * v3 - W5-20/W5-21. 4b re-pointed: "</3" comes back as written, and no "<"
 *   that could open a tag is left. 7c re-pointed: getting started says
 *   Restored and what came across, then Go to Home.
 *
 * 02 Oct 2026 v2
 *
 * v2 - W4-26. 2d: a health consent given before what it covers changed
 *   brings no health answers in from a file, as everywhere else.
 *
 * 02 Oct 2026 v1
 *
 * W4-3 RESTORE-TAKES and W4-6 RESTORE-MOVE (Wave 4 persona trace,
 * 01 Oct 2026; found by 2.13, 2.14, 2.15).
 *
 * W4-3. Restore took everything from the file except the agreements: the
 * Plan (a Free phone became a Plan phone), the News switch (a possible
 * marketing opt-in), and this phone's text size and Reduce motion. Its
 * confirmation named none of it.
 *
 * W4-6. A journal line holding "<sigh>" or "</3" made Restore refuse the
 * person's own file, locked or not ("something Alongside would not have
 * written"). Every result went only to a hidden live region, so a sighted
 * person saw nothing. A forgotten password got the same line for ever.
 * And on a new phone Restore was reachable only after the whole of
 * onboarding.
 *
 *   1. The Plan, Messages and the News switch, and display settings stay
 *      this phone's.
 *   2. Health answers in a file come in only with this phone's health
 *      consent; the confirmation says what comes back and what stays.
 *   3. The session count is the one Progress uses (a stopped session is
 *      not counted).
 *   4. Text that looks like markup is made harmless, not refused: the
 *      file restores, the words read the same, no element is made.
 *   5. Results are on screen, and focus goes to them.
 *   6. Two wrong passwords: a plain line, and a way forward.
 *   7. Onboarding offers Restore after the two consents, and a restored
 *      phone lands on Home with this phone's agreements.
 */
import { createRequire as __cr } from "node:module";
import { agreed } from "./agreed.mjs";
import { oneScreen } from "./one-screen.mjs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "FileReader", "File", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(0), 0);
dom.window.requestAnimationFrame = globalThis.requestAnimationFrame;
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
dom.window.URL.createObjectURL = () => "blob:x";
dom.window.URL.revokeObjectURL = () => {};
globalThis.URL = dom.window.URL;
dom.window.HTMLAnchorElement.prototype.click = function () {};
// No file picker in a test: a file input's click does nothing.
dom.window.HTMLInputElement.prototype.click = function () { if (this.type !== "file") this.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
const R = await import(B + "data/restore.js");
const L = await import(B + "data/file-lock.js");
const { DISPLAY_KEYS } = await import(B + "display-prefs.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const until = async (cond, ms = 15000) => { const end = Date.now() + ms; while (!cond() && Date.now() < end) await wait(25); };
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const dlgText = () => txt(document.querySelector('[role="dialog"]'));

const DAY = 86400000;
const iso = d => new Date(Date.now() - d * DAY).toISOString();

/** A file as Download your data writes it, from a phone with a month of history. */
function fileFrom({ tier = "personal", newsOn = true, journal = "a quiet week", display = { [DISPLAY_KEYS.textScale]: "1" } } = {}) {
  return JSON.stringify({
    exportedAt: iso(1),
    about: "Everything Alongside: Move keeps about you on this device, including your journal. Nothing here was sent anywhere to make this file.",
    store: {
      onboardingComplete: true, name: "Rowan", tier,
      activityLog: [
        { id: "a1", type: "workout", completedAt: iso(9), durationMins: 30, status: "completed" },
        { id: "a2", type: "walk", completedAt: iso(6), durationMins: 20, status: "completed" },
        { id: "a3", type: "yoga", completedAt: iso(3), durationMins: 7, status: "partial" },
      ],
      journalEntries: [{ id: "j1", date: iso(2), text: journal, tags: [] }],
      checkinHistory: { [iso(2).slice(0, 10)]: { energy: 3 } },
      conditions: ["knee"],
      capability: { chairRise: "yes", floorAccess: "yes", bothFeet: "no", balanceWorry: "yes", askedAt: iso(20) },
      messages: { list: [], fetchedAt: null, read: [], dismissed: [], newsOn },
      consent: { given: true, ageConfirmed: true, health: { given: true } },
    },
    display,
  });
}

function phone({ tier = "free", newsOn = false, health = true, textScale = "1.15" } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Rowan"); store.set("tier", tier);
  store.set("messages", { ...(store.get("messages") || {}), newsOn });
  if (!health) store.set("consent.health", { given: false, at: null, version: null, withdrawnAt: iso(0) });
  localStorage.setItem(DISPLAY_KEYS.textScale, textScale);
  localStorage.setItem(DISPLAY_KEYS.reduceMotion, "true");
}

// ── 1. THIS PHONE'S PLAN, NEWS AND DISPLAY ──────────────────────────────
console.log("\nTEST 1 - the Plan, News and display stay this phone's");
phone({ tier: "free", newsOn: false });
let read = R.readRestoreFile(fileFrom({ tier: "personal", newsOn: true }));
ok("1pc. the file reads", read.ok, read.reason);
R.applyRestore(read.data);
ok("1pc2. the history came across", (store.get("activityLog") || []).length === 3 && store.get("journalEntries")?.[0]?.text === "a quiet week");
ok("1a. a Free phone stays Free", store.get("tier") === "free", store.get("tier"));
ok("1b. the News switch stays off", store.get("messages")?.newsOn === false, JSON.stringify(store.get("messages")));
ok("1c. text size and Reduce motion stay this phone's", localStorage.getItem(DISPLAY_KEYS.textScale) === "1.15" && localStorage.getItem(DISPLAY_KEYS.reduceMotion) === "true",
   `${localStorage.getItem(DISPLAY_KEYS.textScale)} / ${localStorage.getItem(DISPLAY_KEYS.reduceMotion)}`);
ok("1d. this phone's agreements stay", store.get("consent")?.given === true && store.get("consent")?.health?.given === true);

// ── 2. HEALTH ANSWERS NEED THIS PHONE'S CONSENT ─────────────────────────
console.log("\nTEST 2 - health answers come in only with this phone's health consent");
phone({ health: false });
R.applyRestore(R.readRestoreFile(fileFrom()).data);
ok("2a. without it: no check-ins, sore areas, body answers or journal",
   Object.keys(store.get("checkinHistory") || {}).length === 0 && (store.get("conditions") || []).length === 0 &&
   !store.get("capability")?.askedAt && (store.get("journalEntries") || []).length === 0,
   JSON.stringify({ c: store.get("conditions"), j: (store.get("journalEntries") || []).length, cap: store.get("capability")?.askedAt }));
ok("2b. without it: sessions still come across, and planning is careful", (store.get("activityLog") || []).length === 3 && store.capabilityProfile().careful === true);
phone({ health: true });
R.applyRestore(R.readRestoreFile(fileFrom()).data);
ok("2c. with it: they come across", (store.get("conditions") || []).includes("knee") && !!store.get("capability")?.askedAt);
// W4-26: consent given before what it covers changed is not consent here.
phone({ health: true });
store.set("consent.health", { given: true, at: iso(30), version: "2026-09-01", withdrawnAt: null });
R.applyRestore(R.readRestoreFile(fileFrom()).data);
ok("2d. consent from before what it covers changed: no health answers come in", (store.get("conditions") || []).length === 0 && (store.get("journalEntries") || []).length === 0,
   JSON.stringify({ c: store.get("conditions"), j: (store.get("journalEntries") || []).length }));

// ── 3. THE COUNT ────────────────────────────────────────────────────────
console.log("\nTEST 3 - the count is Progress's");
read = R.readRestoreFile(fileFrom());
ok("3a. a stopped session is not counted", read.summary.sessions === 2, `sessions ${read.summary.sessions}`);

// ── 4. HARMLESS, NOT REFUSED ────────────────────────────────────────────
console.log("\nTEST 4 - text that looks like markup is made harmless, not refused");
const LT = "ugh </3 <sigh> brain fog all week";
read = R.readRestoreFile(fileFrom({ journal: LT }));
ok("4a. the file is not refused", read.ok, read.reason);
phone();
if (read.ok) R.applyRestore(read.data);
const back = store.get("journalEntries")?.[0]?.text || "";
// W5-21: "</3" comes back as written; no "<" is left that could open a tag.
ok("4b. the words read the same, \"</3\" kept, no tag can open", /<\/3/.test(back) && /sigh/.test(back) && /brain fog/.test(back) && !/<\s*[a-zA-Z!?]|<\s*\/\s*[a-zA-Z]/.test(back), back);
read = R.readRestoreFile(fileFrom({ journal: "learning javascript: week 2" }));
ok("4c. a javascript: in someone's words does not refuse the file", read.ok, read.reason);
phone();
if (read.ok) R.applyRestore(read.data);
ok("4d. and cannot be an address", !/javascript\s*:/i.test(JSON.stringify(store.data)), store.get("journalEntries")?.[0]?.text);
const { NoticingView } = await import(B + "views/noticing.js");
phone(); const r4 = R.readRestoreFile(fileFrom({ journal: '<img src=x onerror="alert(1)"> hello' })); if (r4.ok) R.applyRestore(r4.data);
ok("4epc. that file restores too", r4.ok, r4.reason);
main.innerHTML = ""; try { NoticingView({ navigate() {}, back() {} }).mount(main); } catch {}
await wait(10);
ok("4e. a crafted line makes no element on Wellbeing", !main.querySelector("img[onerror], img[src='x']"));

// ── 5. ON SCREEN ────────────────────────────────────────────────────────
console.log("\nTEST 5 - results are on screen, and focus goes to them");
const { SettingsView } = await import(B + "views/settings.js");
function settings() { main.innerHTML = ""; SettingsView({ navigate() {}, back() {} }).mount(main); }
async function pickFile(text, name = "alongside.json") {
  click(main.querySelector('[data-action="restore-data"]')); await wait(10);
  const input = document.getElementById("settings-restore-input");
  if (!input) return false;
  Object.defineProperty(input, "files", { value: [new dom.window.File([text], name, { type: "application/json" })] });
  input.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  await until(() => document.querySelector('[role="dialog"]') || main.querySelector(".settings-result:not([hidden])"), 3000);
  return true;
}
const result = () => main.querySelector("#settings-result");
const visible = el => !!el && !el.hidden && !/sr-only|visually-hidden/.test(el.className) && txt(el).length > 0;

phone({ tier: "free" }); settings();
ok("5pc. picker opened", await pickFile(fileFrom()));
const confirmText = dlgText();
ok("5a. the confirmation says what comes back: history and health answers", /health answers/i.test(confirmText) && /journal/i.test(confirmText), confirmText);
ok("5b. and what stays: your plan, News, display settings, agreements", /plan/i.test(confirmText) && /News/.test(confirmText) && /display/i.test(confirmText) && /agree/i.test(confirmText), confirmText);
ok("5c. the count is 2 sessions", /2 sessions/.test(confirmText), confirmText);
click(document.querySelector("#confirm-ok")); await wait(30);
ok("5d. restored: the result is on screen", visible(result()) && /Restored/.test(txt(result())), txt(result()));
ok("5e. and has focus", document.activeElement === result(), document.activeElement?.id || document.activeElement?.tagName);

phone(); settings();
await pickFile("not a file of ours");
ok("5f. a refused file: the reason is on screen, with focus", visible(result()) && /nothing has been changed/i.test(txt(result())) && document.activeElement === result(), txt(result()));

phone(); settings();
click(main.querySelector('[data-action="download-data"]')); await wait(10);
click(document.querySelector("#download-go, #download-save, [data-download-go]") || [...document.querySelectorAll('[role="dialog"] button')].find(b => /download|save/i.test(txt(b)) && !/cancel/i.test(txt(b))));
await until(() => visible(result()), 3000);
ok("5g. Download: the result is on screen", visible(result()) && /download/i.test(txt(result())), txt(result()));

// ── 6. A FORGOTTEN PASSWORD ─────────────────────────────────────────────
console.log("\nTEST 6 - two wrong passwords: a plain line and a way forward");
const locked = await L.lockText(fileFrom(), "correct horse 42");
phone(); settings();
await pickFile(locked);
const pw = () => document.querySelector("#unlock-pw");
ok("6pc. the unlock dialog", !!pw(), dlgText());
async function tryPw(v) {
  const err = document.querySelector("#unlock-error"); if (err) err.textContent = "";
  pw().value = v; click(document.querySelector("#unlock-open"));
  await until(() => txt(document.querySelector("#unlock-error")) || !pw(), 15000); await wait(40);
}
await tryPw("wrong one 1");
const first = txt(document.querySelector("#unlock-error"));
ok("6a. one miss: nothing changed, said plainly", /Nothing has been changed/i.test(first), first);
await tryPw("wrong one 2");
const second = txt(document.querySelector("#unlock-error"));
ok("6b. two misses: it says the file cannot be opened without the password", /cannot be opened|can.t be opened/i.test(second) && /including us/i.test(second), second);
ok("6c. and suggests a file saved without a password", /without a password/i.test(second), second);
await tryPw("correct horse 42");
ok("6d. the right one: on to the confirmation", /Restore from this file/.test(dlgText()), dlgText());
document.querySelector("#confirm-cancel") && click(document.querySelector("#confirm-cancel"));

// ── 7. ONBOARDING ───────────────────────────────────────────────────────
console.log("\nTEST 7 - a new phone: Restore after the two consents");
localStorage.clear(); store.init();
store.set("consent.ageConfirmed", true); store.set("consent.ageCheckedAt", iso(0)); store.set("consent.ageVersion", "2026-10-01");
let navs = [];
const { ThreadView } = await import(B + "views/onboarding/thread.js");
const el = oneScreen(document.createElement("div"));
ThreadView({ navigate: v => navs.push(v), back() {} }).mount(el);
await until(() => el.querySelector("#ob-consent-check"), 5000);
const offer = el.querySelector("#ob-restore-file");
ok("7a. the consent screen offers Restore from a file", !!offer && /another phone/i.test(txt(el)), txt(el).slice(-300));
if (offer) {
  el.querySelector("#ob-consent-check").checked = true; el.querySelector("#ob-consent-check").dispatchEvent(new dom.window.Event("change"));
  el.querySelector("#ob-consent-health").checked = true; el.querySelector("#ob-consent-health").dispatchEvent(new dom.window.Event("change"));
  Object.defineProperty(offer, "files", { value: [new dom.window.File([fileFrom({ tier: "free" })], "a.json", { type: "application/json" })] });
  offer.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  await until(() => document.querySelector("#confirm-ok"), 3000);
  ok("7b. the same confirmation", /Restore from this file/.test(dlgText()), dlgText());
  click(document.querySelector("#confirm-ok")); await wait(40);
  // W5-20: it says what came across first, then Go to Home.
  const said = txt(el);
  click(el.querySelector("#ob-restored-go")); await wait(20);
  ok("7c. says it restored, then lands on Home", /Restored\. Your history from the file is on this device now/.test(said) && navs.includes("today"), `${said.slice(0, 160)} | ${JSON.stringify(navs)}`);
  ok("7d. onboarding done, the history there, this phone's agreements recorded",
     store.get("onboardingComplete") === true && (store.get("activityLog") || []).length === 3 &&
     store.get("consent")?.given === true && store.get("consent")?.health?.given === true && store.get("consent")?.ageConfirmed === true);
}
await wait(3000);

console.log(`\nRESTORE-MOVE: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
