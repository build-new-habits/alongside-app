/**
 * tools/verify-u18-true.mjs
 * 02 Oct 2026 v1
 *
 * W4-17 U18-TRUE (Wave 4 persona trace, U18). Safeguarding reviewers to
 * read the wording.
 *
 * At 18 the under-18 screen still said "so it won't ask you again", with no
 * way to start again; somebody who installed before the age check and
 * answered honestly lost their journal and sessions with no warning and no
 * chance to download them, then read "Nothing you told the app has been
 * kept"; a month not yet reached said "Choose a month and a year"; the
 * privacy summary from that screen described an adult's data and pointed
 * to Settings, which only shows the under-18 screen; and messages.json was
 * still fetched.
 *
 *   1. The screen says how to start again at 18, and that is what happens.
 *   2. An earlier install with a journal: told what will be deleted, and
 *      offered Download, before anything is deleted.
 *   3. A date not reached yet: "That date hasn't happened yet".
 *   4. The privacy summary says what is kept for somebody under 18.
 *   5. No message fetch for somebody under 18.
 */
import { createRequire as __cr } from "node:module";
import { oneScreen } from "./one-screen.mjs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM(`<!doctype html><div id="app"><main id="main-content"></main></div><nav><button data-nav="settings" aria-label="Settings"></button></nav>`, { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
let downloads = 0;
dom.window.HTMLAnchorElement.prototype.click = function () { if (this.download) downloads++; };
globalThis.URL.createObjectURL = () => "blob:x"; globalThis.URL.revokeObjectURL = () => {};

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const AC = await import(B + "data/age-check.js");
const { Under18View } = await import(B + "views/under-18.js");
const { AgeCheckView } = await import(B + "views/age-check.js");
const PV = await import(B + "views/privacy.js");
const M = await import(B + "data/messages.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
let went = null;
const router = { navigate(r) { went = r; }, back() {} };
const Y = new Date().getFullYear();
function under18() { localStorage.clear(); store.init(); AC.recordAge(false); }

// ── 1. STARTING AGAIN AT 18 ─────────────────────────────────────────────
console.log("\nTEST 1 - how to start again at 18, and it is true");
under18();
const u = oneScreen(document.createElement("div")); Under18View(router).mount(u);
const ut = txt(u);
ok("1pc. the under-18 screen", /Alongside is for adults/.test(ut));
ok("1a. no \"it won't ask you again\"", !/won.t ask you again/i.test(ut), ut.slice(0, 400));
ok("1b. says how to start again at 18: clear the app's data", /18/.test(ut.replace("under 18", "")) && /clear/i.test(ut) && /data/i.test(ut), ut.slice(0, 500));
localStorage.clear(); store.init();
ok("1c. and clearing the data does start again: the first question, not this screen", AC.guardRoute("today") === "onboarding/thread", String(AC.guardRoute("today")));

// ── 2. AN EARLIER INSTALL ───────────────────────────────────────────────
console.log("\nTEST 2 - an earlier install: told, and offered Download, first");
function earlier() {
  localStorage.clear(); store.init();
  store.set("consent.given", true); store.set("consent.at", new Date().toISOString());
  store.set("onboardingComplete", true); store.set("name", "Kai");
  store.set("journalEntries", [{ id: "j1", text: "a line", tags: [] }]);
  store.set("activityLog", [{ id: "a", type: "walk", status: "completed", completedAt: new Date().toISOString() }]);
}
earlier(); downloads = 0; went = null;
const a = oneScreen(document.createElement("div")); AgeCheckView(router).mount(a);
a.querySelector("#age-month").value = "1"; a.querySelector("#age-year").value = String(Y - 16);
click(a.querySelector("#age-continue")); await wait(10);
ok("2a. nothing deleted yet", (store.get("journalEntries") || []).length === 1 && store.get("consent.ageConfirmed") !== false, JSON.stringify(store.get("consent.ageConfirmed")));
ok("2b. it says the journal and sessions will be deleted", /journal/i.test(txt(a)) && /session/i.test(txt(a)) && /delete/i.test(txt(a)), txt(a).slice(0, 400));
const dl = [...a.querySelectorAll("button")].find(b => /download/i.test(txt(b)));
ok("2c. Download is offered", !!dl);
click(dl); await wait(10);
ok("2d. Download makes the file, and still nothing is deleted", downloads === 1 && (store.get("journalEntries") || []).length === 1, `downloads ${downloads}`);
const go = [...a.querySelectorAll("button")].find(b => /delete/i.test(txt(b)) && !/download/i.test(txt(b)));
click(go); await wait(10);
ok("2e. then deleted, recorded as under 18, and on to the under-18 screen", (store.get("journalEntries") || []).length === 0 && store.get("consent.ageConfirmed") === false && went === "under-18", `${went}`);
// control: nothing on the phone, no extra step
localStorage.clear(); store.init(); store.set("consent.given", true); went = null;
const a2 = oneScreen(document.createElement("div")); AgeCheckView(router).mount(a2);
a2.querySelector("#age-month").value = "1"; a2.querySelector("#age-year").value = String(Y - 16);
click(a2.querySelector("#age-continue")); await wait(10);
ok("2f. control: nothing kept yet, so straight to the under-18 screen", went === "under-18" && store.get("consent.ageConfirmed") === false);

// ── 3. A DATE NOT REACHED ───────────────────────────────────────────────
console.log("\nTEST 3 - a date not reached yet");
localStorage.clear(); store.init(); store.set("consent.given", true);
const f = oneScreen(document.createElement("div")); AgeCheckView(router).mount(f);
f.querySelector("#age-month").value = "12"; f.querySelector("#age-year").value = String(Y + 1);
click(f.querySelector("#age-continue")); await wait(10);
ok("3a. \"That date hasn't happened yet\"", /That date hasn.t happened yet/.test(txt(f.querySelector("#age-error"))), txt(f.querySelector("#age-error")));
ok("3b. and nothing recorded", store.get("consent.ageConfirmed") !== false && store.get("consent.ageConfirmed") !== true);

// ── 4. THE PRIVACY SUMMARY ──────────────────────────────────────────────
console.log("\nTEST 4 - the privacy summary for somebody under 18");
under18();
const p = document.createElement("div"); p.innerHTML = PV.render(); const pt = txt(p);
ok("4a. says the one thing kept", /under 18/i.test(pt) && /only/i.test(pt), pt.slice(0, 300));
ok("4b. not an adult's list (check-ins, journal) and not sent to Settings", !/check-ins|your journal|in Settings/i.test(pt), pt.slice(0, 600));
localStorage.clear(); store.init();
const p2 = document.createElement("div"); p2.innerHTML = PV.render();
ok("4c. control: an adult's summary still lists check-ins", /check-ins/i.test(txt(p2)));

// ── 5. NO MESSAGE FETCH ─────────────────────────────────────────────────
console.log("\nTEST 5 - no message fetch for somebody under 18");
under18();
let calls = 0;
const r = await M.refreshMessages(async () => { calls++; return { ok: true, json: async () => ({ messages: [] }) }; });
ok("5a. messages.json is not fetched", calls === 0 && r === false, `calls ${calls}`);
localStorage.clear(); store.init(); calls = 0;
await M.refreshMessages(async () => { calls++; return { ok: true, json: async () => ({ messages: [] }) }; });
ok("5b. control: an adult's is", calls === 1);

console.log(`\nU18-TRUE: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
