/**
 * tools/verify-u18-true.mjs
 * 03 Oct 2026 v3
 *
 * v3 - W5-24 (Graeme, 03 Oct: "drop the copy"). Under 18 deletes what the
 *   phone holds at once, with no warning and no Download, as the policies
 *   say. TESTs 2, 6, 7 and 8b follow: recorded at Continue, everything else
 *   gone straight away, the page says nothing is kept, no button to change
 *   the answer or to keep a copy.
 *
 *
 * v2 - W5-5, W5-6, W5-16 (Wave 5 trace, U18; safeguarding reviewers to
 *   read). Under 18 is recorded at Continue on both doors, and the warning
 *   with Download follows on the under-18 screen itself, with no "I typed
 *   the date wrong": the warning had invited a child to change the answer,
 *   and closing the app on it left nothing recorded. TEST 2 follows that
 *   (2a was "not recorded yet"; it is now "recorded, nothing deleted yet").
 *   TEST 6: the answer stands from Continue, and a reopen lands on the
 *   warning. TEST 7: getting started (an earlier install that never agreed)
 *   warns the same way, and anything entered counts. TEST 8: the site named
 *   is the one the app runs on, plus the home-screen way; a plainer
 *   button; the phone's Back can leave the under-18 screen.
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
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
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
const { ThreadView } = await import(B + "views/onboarding/thread.js");
const { router: realRouter } = await import(B + "router.js");
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
ok("2a. recorded as under 18 at Continue, on to the under-18 screen", store.get("consent.ageConfirmed") === false && went === "under-18", `${went} ${JSON.stringify(store.get("consent.ageConfirmed"))}`);
ok("2b. the journal and sessions are deleted at once (W5-24: no copy)", (store.get("journalEntries") || []).length === 0 && (store.get("activityLog") || []).length === 0 && !store.get("name"));
const w = oneScreen(document.createElement("div")); Under18View(router).mount(w);
ok("2c. no Download and no delete button: nothing is left to keep", ![...w.querySelectorAll("button")].some(b => /download|delete/i.test(txt(b))), txt(w).slice(0, 200));
ok("2d. no file made", downloads === 0);
ok("2e. the page says nothing is kept", /Nothing you told the app is kept/i.test(txt(w)), txt(w).slice(0, 200));
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

// ── 6. THE ANSWER STANDS FROM CONTINUE (W5-5) ──────────────────────────
console.log("\nTEST 6 - the answer stands from Continue, with no way to change it");
earlier(); went = null;
const c6 = oneScreen(document.createElement("div")); AgeCheckView(router).mount(c6);
c6.querySelector("#age-month").value = "1"; c6.querySelector("#age-year").value = String(Y - 16);
click(c6.querySelector("#age-continue")); await wait(10);
ok("6a. recorded straight after Continue", store.get("consent.ageConfirmed") === false);
ok("6b. no \"I typed the date wrong\" anywhere", !/typed the date wrong/i.test(txt(c6)) && !c6.querySelector("#age-again"), txt(c6).slice(0, 200));
// The app closed on the warning and opened again.
ok("6c. a reopen lands on the under-18 screen", AC.guardRoute("today") === "under-18" && AC.guardRoute("age-check") === "under-18");
const r6 = oneScreen(document.createElement("div")); Under18View(router).mount(r6);
ok("6d. and nothing of theirs is still held", !AC.heldOnPhone().any && !/typed the date wrong/i.test(txt(r6)), JSON.stringify(AC.heldOnPhone()));

// ── 7. GETTING STARTED WARNS TOO (W5-6) ─────────────────────────────────
console.log("\nTEST 7 - getting started, on an earlier install that never agreed");
localStorage.clear(); store.init();
store.set("name", "Kai");
store.set("journalEntries", [{ id: "j1", text: "a line", tags: [] }]);
const o7 = oneScreen(document.createElement("div")); const navs7 = [];
ThreadView({ navigate: v => navs7.push(v), back() {} }).mount(o7); await wait(2600);
o7.querySelector("#ob-age-month").value = "1"; o7.querySelector("#ob-age-year").value = String(Y - 16);
click(o7.querySelector("#ob-age-continue")); await wait(10);
ok("7a. recorded, on to the under-18 screen, the journal deleted at once", navs7.includes("under-18") && store.get("consent.ageConfirmed") === false && (store.get("journalEntries") || []).length === 0 && !store.get("name"), JSON.stringify(navs7));
const u7 = oneScreen(document.createElement("div")); Under18View(router).mount(u7);
ok("7b. the same page: nothing kept, no Download", /Nothing you told the app is kept/i.test(txt(u7)) && !u7.querySelector("#u18-download"), txt(u7).slice(0, 200));
const alone = {
  "a name": () => store.set("name", "Kai"),
  "a sore area": () => store.set("conditions", ["knee"]),
  "My exercises": () => store.set("prescribedExercises", [{ id: "x", name: "Mine" }]),
  "a saved session": () => store.set("savedSessions", [{ id: "s1", name: "Tuesday" }]),
  "a weight": () => store.set("weightLog", [{ at: new Date().toISOString(), kg: 60 }]),
};
for (const [label, put] of Object.entries(alone)) {
  localStorage.clear(); store.init(); put();
  ok(`7c. ${label} alone counts`, AC.heldOnPhone().any === true, JSON.stringify(AC.heldOnPhone()));
}
localStorage.clear(); store.init(); store.set("name", "Kai"); AC.recordAge(false);
ok("7d. a name alone goes at once too", !store.get("name") && !AC.heldOnPhone().any);
localStorage.clear(); store.init();
ok("7e. control: a fresh install holds nothing", AC.heldOnPhone().any === false);

// ── 8. SMALLER THINGS (W5-16) ───────────────────────────────────────────
console.log("\nTEST 8 - the site, the button, the phone's Back");
under18();
const u8 = oneScreen(document.createElement("div")); Under18View(router).mount(u8);
ok("8a. names the site the app is running on, and the home-screen way", txt(u8).includes(location.host) && !/app\.buildnewhabits\.co\.uk/.test(txt(u8)) && /home screen/i.test(txt(u8)), txt(u8).slice(0, 600));
earlier(); AC.recordAge(false);
const u8b = oneScreen(document.createElement("div")); Under18View(router).mount(u8b);
ok("8b. nothing says \"carry on\"", !/carry on/i.test(txt(u8b)), txt(u8b).slice(0, 300));
under18();
realRouter.currentView = "under-18"; realRouter.history = [];
realRouter._setupPopstate();
const before = dom.window.history.length;
dom.window.dispatchEvent(new dom.window.PopStateEvent("popstate", { state: { view: "under-18" } }));
await wait(10);
ok("8c. the phone's Back on the under-18 screen pushes nothing (it can leave)", dom.window.history.length === before, `${before} -> ${dom.window.history.length}`);

console.log(`\nU18-TRUE: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
