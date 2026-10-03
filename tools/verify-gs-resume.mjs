/**
 * tools/verify-gs-resume.mjs
 * 03 Oct 2026 v1
 *
 * W5-19 GETTING-STARTED-RESUME (Wave 5 persona trace: 2.16, 2.1, 2.11, 2.12).
 *
 * Closing getting started part-way and opening it again started at "what
 * can I call you?" and asked all fourteen again; "I'd rather not say" on
 * the second pass kept the first answer, which the check-in then quoted;
 * the age range offered two ways to skip; after declining, the bridge said
 * "Now I know a bit about where you've been"; Settings showed "Gender:
 * Prefer not to say" to people never asked.
 *
 *   1. Reopened part-way, it carries on at the step reached.
 *   2. A skip clears an earlier answer (the age range; what made it hard).
 *   3. The age range has one way to skip.
 *   4. After skipping what made it hard, the bridge does not claim to know
 *      where they have been.
 *   5. Settings says Gender is not set when it never was.
 */
import { agreed } from "./agreed.mjs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div><nav id="bottom-nav"></nav></div><div id="sr-announcer"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: /prefers-reduced-motion/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };
dom.window.confirm = () => false; globalThis.confirm = () => false;
dom.window.alert = () => {}; globalThis.alert = () => {};

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
globalThis.window.router = router;
Object.defineProperty(globalThis, "router", { value: router, configurable: true, writable: true });
const gate = await import(B + "safety-gate.js");
const RF = await import(B + "data/red-flag.js");
const SB = await import(B + "session-builder.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const $ = s => main.querySelector(s);
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
const { ThreadView } = await import(B + "views/onboarding/thread.js");
const { SettingsView } = await import(B + "views/settings.js");

function fixture(extra = {}) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("name", "Ash");
  store.set("onboarding.threadStartedAt", new Date(Date.now() - 3600000).toISOString());
  for (const [k, v] of Object.entries(extra)) store.set(k, v);
}
async function open() {
  const el = document.createElement("div"); document.body.appendChild(el);
  ThreadView({ navigate() {}, back() {} }).mount(el);
  for (let i = 0; i < 120 && !el.querySelector("button, input"); i++) await wait(25);
  await wait(150);
  return el;
}
const until = async (fn, ms = 4000) => { const t = Date.now(); while (Date.now() - t < ms) { const v = fn(); if (v) return v; await wait(25); } return null; };

// ── 1. RESUME ───────────────────────────────────────────────────────────
console.log("\nTEST 1 - reopened part-way, it carries on");
fixture({ "onboarding.reachedStep": 6 });
let el = await open();
ok("1a. not \"what can I call you?\" again", !/what can I call you/i.test(txt(el)) && !el.querySelector(".ob-input-bar__field"), txt(el).slice(0, 200));
ok("1b. the age range question, where they left off", /roughly how old/i.test(txt(el)), txt(el).slice(0, 300));
el.remove();

// ── 2. A SKIP CLEARS ────────────────────────────────────────────────────
console.log("\nTEST 2 - a skip clears an earlier answer");
fixture({ "onboarding.reachedStep": 6, ageBand: "45-54" });
el = await open();
const skip = await until(() => [...el.querySelectorAll("button")].find(b => /rather not say/i.test(txt(b))));
click(skip); await wait(300);
ok("2a. the age range skipped: the earlier answer is gone", store.get("ageBand") == null, String(store.get("ageBand")));
el.remove();
fixture({ "onboarding.reachedStep": "3a", "onboarding.hardBeforeSelections": ["time"], "onboarding.primaryTerritory": "time" });
el = await open();
const skip2 = await until(() => [...el.querySelectorAll("button")].find(b => /rather not say/i.test(txt(b))));
click(skip2); await wait(1200);
ok("2b. what made it hard skipped: the earlier answer is gone", (store.get("onboarding.hardBeforeSelections") || []).length === 0 && store.get("onboarding.primaryTerritory") == null,
   JSON.stringify([store.get("onboarding.hardBeforeSelections"), store.get("onboarding.primaryTerritory")]));
// ── 4. THE BRIDGE AFTER A SKIP ──────────────────────────────────────────
console.log("\nTEST 4 - the bridge after a skip");
await until(() => /Can I ask roughly how old/i.test(txt(el)), 5000);
ok("4a. it does not claim to know where they have been", !/where you.ve been/i.test(txt(el)), txt(el).slice(-400));
el.remove();

// ── 3. ONE WAY TO SKIP ──────────────────────────────────────────────────
console.log("\nTEST 3 - the age range has one way to skip");
fixture({ "onboarding.reachedStep": 6 });
el = await open();
const skips = [...el.querySelectorAll("button")].filter(b => /rather not say|prefer not to say/i.test(txt(b)));
ok("3a. one skip button", skips.length === 1, skips.map(txt).join(" | "));
el.remove();

// ── 5. GENDER NEVER ASKED ───────────────────────────────────────────────
console.log("\nTEST 5 - Settings, Gender never asked");
fixture();
main.innerHTML = ""; SettingsView({ navigate() {}, back() {} }).mount(main); await wait(20);
const genderRow = [...main.querySelectorAll("button, [data-open]")].map(txt).find(t => /^Gender/.test(t)) || txt(main);
ok("5a. not \"Prefer not to say\"", !/Gender\s*Prefer not to say/i.test(genderRow), genderRow.slice(0, 100));

console.log("");
if (fails) { console.log(`GS-RESUME: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`GS-RESUME: all ${passes} assertions pass\n`);
process.exit(0);
