/**
 * tools/verify-journal-small.mjs
 * 02 Oct 2026 v1
 *
 * W4-21 JOURNAL-SMALL (Wave 4 persona trace, 2.11). THIS CHECK NEVER READS
 * WHAT A JOURNAL ENTRY SAYS: it types into the box itself and looks only at
 * what the screens show around it.
 *
 *   1. This week's question changes with the week (nothing advanced it).
 *   2. Write about this keeps the question on the writing screen.
 *   3. Back goes back where the person came from (it always went to
 *      Wellbeing), and with something written asks first (it threw a
 *      half-written entry away without a word).
 *   4. Saving says so.
 *   5. An entry saved with Can't find the words says that, not a bare date.
 */
import { createRequire as __cr } from "node:module";
import { agreed } from "./agreed.mjs";
import { oneScreen } from "./one-screen.mjs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><body><div id="app"><main id="main-content"></main></div></body>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const N = await import(B + "views/noticing.js");
const { JournalEntryView } = await import(B + "views/journal-entry.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
function person() { localStorage.clear(); store.init(); agreed(store); store.set("onboardingComplete", true); store.set("createdAt", new Date(Date.now() - 2 * 86400000).toISOString()); }
let went = [];
const fakeRouter = (history = []) => ({ history: [...history], navigate(r) { went.push(r); }, back() { went.push("back"); } });
function journal(router) { const el = oneScreen(document.createElement("div")); JournalEntryView(router).mount(el); return el; }

// ── 1. THE WEEK'S QUESTION ──────────────────────────────────────────────
console.log("\nTEST 1 - this week's question changes with the week");
person();
const q = N.currentWeekQuestion?.bind(N);
const now = Date.now();
const qs = q ? [0, 7, 14].map(d => q(new Date(now + d * 86400000)).prompt) : [];
ok("1a. three weeks, three questions", new Set(qs).size === 3, qs.map(s => (s || "").slice(0, 30)).join(" | "));
ok("1b. the same week, the same question", !!q && q(new Date(now)).prompt === q(new Date(now + 3600000)).prompt);
const page = document.createElement("div"); page.innerHTML = N.render();
ok("1c. Wellbeing shows this week's", !!q && txt(page).includes(q(new Date()).prompt));

// ── 2. WRITE ABOUT THIS ─────────────────────────────────────────────────
console.log("\nTEST 2 - Write about this keeps the question");
person(); store.set("journalEntryType", "weekly-noticing");
let el = journal(fakeRouter());
ok("2a. the writing screen shows this week's question as the box's label", !!q && txt(el.querySelector('label[for="je-text"]')).includes(q(new Date()).prompt), txt(el.querySelector('label[for="je-text"]')));

// ── 3. BACK ─────────────────────────────────────────────────────────────
console.log("\nTEST 3 - Back goes back, and asks first with something written");
person(); went = [];
el = journal(fakeRouter(["library"]));
click(el.querySelector('[data-action="back"]')); await wait(5);
ok("3a. from the Library, nothing written: back to where they came from", went.at(-1) === "back", JSON.stringify(went));
ok("3b. the button is not named for Wellbeing", !/Wellbeing/.test(el.querySelector('[data-action="back"]')?.getAttribute("aria-label") || ""), el.querySelector('[data-action="back"]')?.getAttribute("aria-label"));
person(); went = [];
el = journal(fakeRouter(["library"]));
el.querySelector("#je-text").value = "typed by the check";
click(el.querySelector('[data-action="back"]')); await wait(5);
ok("3c. something written: nothing thrown away yet; it asks", went.length === 0 && /keep writing/i.test(txt(el)) && /discard/i.test(txt(el)), txt(el).slice(0, 200));
click([...el.querySelectorAll("button")].find(b => /keep writing/i.test(txt(b)))); await wait(5);
ok("3d. Keep writing stays, with the words still in the box", went.length === 0 && el.querySelector("#je-text")?.value === "typed by the check");
click(el.querySelector('[data-action="back"]')); await wait(5);
click([...el.querySelectorAll("button")].find(b => /discard/i.test(txt(b)))); await wait(5);
ok("3e. Discard goes back, and nothing is saved", went.at(-1) === "back" && (store.get("journalEntries") || []).length === 0, JSON.stringify(went));
person(); went = [];
el = journal(fakeRouter([]));
click(el.querySelector('[data-action="back"]')); await wait(5);
ok("3f. with nowhere to go back to: Wellbeing", went.at(-1) === "noticing", JSON.stringify(went));

// ── 4. SAVED ────────────────────────────────────────────────────────────
console.log("\nTEST 4 - saving says so");
person(); went = [];
el = journal(fakeRouter(["noticing"]));
el.querySelector("#je-text").value = "typed by the check";
click(el.querySelector('[data-action="save"]')); await wait(5);
const after = document.createElement("div"); after.innerHTML = N.render();
ok("4a. Wellbeing says it was saved", /Saved to your journal/.test(txt(after)), txt(after).slice(0, 200));
const again = document.createElement("div"); again.innerHTML = N.render();
ok("4b. once", !/Saved to your journal/.test(txt(again)));

// ── 5. CAN'T FIND THE WORDS ─────────────────────────────────────────────
console.log("\nTEST 5 - an entry saved without words says so");
person(); store.set("journalEntries", [{ id: "j1", date: new Date().toISOString(), text: "", tags: [], noWords: true }]);
const list = document.createElement("div"); list.innerHTML = N.render();
ok("5a. not a bare date", /without words/i.test(txt(list)), txt(list).slice(-300));

console.log(`\nJOURNAL-SMALL: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
