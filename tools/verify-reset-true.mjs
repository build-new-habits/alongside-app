/**
 * tools/verify-reset-true.mjs
 * 04 Oct 2026 v2
 *
 * v2 - LOOK-1: Reset all data now lives on the Your data section page;
 *   openReset() reaches it with settingsFind. No assertion loosened.
 *
 * 02 Oct 2026 v1
 *
 * W4-16 RESET-TRUE (Wave 4 persona trace). Reset all data said "your
 * profile, history, and programme": not the journal, not the Plan on this
 * phone, not display settings, and nothing about research answers already
 * sent (they can't be taken back) or the one thing that stays (that they
 * were answered, W4-12). After Reset nothing on screen said it had
 * happened, and a larger text size stayed on the live page.
 *
 *   1. The dialog names what goes: the journal, check-ins and sore areas,
 *      sessions, the Plan on this phone, display settings.
 *   2. With a research answer sent: it says that can't be taken back, and
 *      that this phone remembers it was answered. Without one: neither.
 *   3. After Reset: a visible confirmation with focus, everything gone but
 *      the research marker, and the text size back to normal on the page.
 *   4. Cancel deletes nothing.
 */
import { createRequire as __cr } from "node:module";
import { agreed } from "./agreed.mjs";
import { oneScreen } from "./one-screen.mjs";
import { settingsFind } from "./settings-open.mjs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><body></body>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.fetch = dom.window.fetch = async () => ({ ok: false, text: async () => "", json: async () => ({}) });

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const DP = await import(B + "display-prefs.js");
const E = await import(B + "data/evidence.js");
const { SettingsView } = await import(B + "views/settings.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
let went = null;

function person({ answered = false } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Ruth"); store.set("tier", "personal");
  store.set("journalEntries", [{ id: "j1", text: "a line", tags: [] }]);
  DP.setDisplayPref("textScale", "1.3");
  if (answered) E.rememberAnswered("survey");
}
async function openReset() {
  const el = oneScreen(document.createElement("div"));
  SettingsView({ navigate(r) { went = r; }, back() {} }).mount(el); await wait(10);
  click(settingsFind(el, '[data-action="reset-data"]')); await wait(10);
  return { el, dlg: document.getElementById("settings-confirm-dialog") };
}

// ── 1. WHAT GOES ────────────────────────────────────────────────────────
console.log("\nTEST 1 - the dialog names what goes");
person();
let { el, dlg } = await openReset();
const said = txt(dlg);
ok("1pc. the dialog is up", !!dlg, said.slice(0, 80));
ok("1a. the journal", /journal/i.test(said), said);
ok("1b. check-ins and sore areas", /check-ins/i.test(said) && /sore areas/i.test(said), said);
ok("1c. sessions", /sessions/i.test(said));
ok("1d. the Plan on this phone", /the Plan/.test(said));
ok("1e. display settings", /display settings/i.test(said));
ok("1f. a copy first: Download your data", /Download your data/.test(said));

// ── 2. RESEARCH ANSWERS ─────────────────────────────────────────────────
console.log("\nTEST 2 - research answers");
ok("2a. none sent: nothing said about them", !/survey|Share my figures/i.test(said), said);
click(dlg.querySelector("#confirm-cancel")); await wait(5);
person({ answered: true });
({ el, dlg } = await openReset());
const said2 = txt(dlg);
ok("2b. sent: they can't be taken back", /survey/i.test(said2) && /can.t be taken back/i.test(said2), said2);
ok("2c. and this phone remembers they were answered", /remember/i.test(said2) && /answered/i.test(said2), said2);

// ── 3. AFTER RESET ──────────────────────────────────────────────────────
console.log("\nTEST 3 - after Reset");
click(dlg.querySelector("#confirm-ok")); await wait(20);
const conf = el.querySelector("[data-reset-done]");
ok("3a. a visible confirmation", !!conf && /deleted/i.test(txt(conf)), txt(el).slice(0, 200));
ok("3b. with focus on it", !!conf && (document.activeElement === conf || conf.contains(document.activeElement)), document.activeElement?.outerHTML?.slice(0, 80));
ok("3c. everything gone", (store.get("journalEntries") || []).length === 0 && !store.get("name"));
ok("3d. but the research marker stays", E.wasAnswered("survey") === true);
ok("3e. the text size is back to normal on the page", document.documentElement.style.getPropertyValue("--user-text-scale") === "1",
   document.documentElement.style.getPropertyValue("--user-text-scale"));
const again = [...el.querySelectorAll("button")].find(b => /start again/i.test(txt(b)));
click(again); await wait(5);
ok("3f. Start again goes to the first question", went === "onboarding/thread", String(went));

// ── 4. CANCEL ───────────────────────────────────────────────────────────
console.log("\nTEST 4 - Cancel deletes nothing");
person();
({ el, dlg } = await openReset());
click(dlg.querySelector("#confirm-cancel")); await wait(5);
ok("4a. nothing deleted", (store.get("journalEntries") || []).length === 1 && store.get("name") === "Ruth");

console.log(`\nRESET-TRUE: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
