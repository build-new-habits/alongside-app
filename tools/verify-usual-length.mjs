/**
 * tools/verify-usual-length.mjs
 * 03 Oct 2026 v1
 *
 * W5-11 USUAL-LENGTH (Wave 5 persona trace: 2.1, 2.12, 2.15, 2.16).
 *
 * A length picked once on the coach's plan or in *I know what I want* was
 * saved as "How long you usually have": a Bad day's 10 became "your usual
 * 10 minutes" for twelve days, and a rushed Friday's 40 made Monday's plan
 * 40.
 *
 *   1. Coach's plan, Length 10: today's plan is 10; the usual (Settings) is
 *      unchanged; tomorrow the plan and the check-in use the usual.
 *   2. I know what I want, 40: the same.
 *   3. Something shorter: today only.
 *   4. The check-in, after a pick today: says today's length, not "usual".
 *   5. Control: Settings changes the usual, and that sticks.
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
const { CoachProposalView } = await import(B + "views/coach-proposal.js");
const { KnowWhatView } = await import(B + "views/know-what.js");
const CKV = await import(B + "views/checkin.js");

function fixture() {
  localStorage.clear(); store.init(); agreed(store);
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Ash"); store.set("tier", "personal");
  store.set("equipment", []); store.set("homeEquipment", []);
  store.set("conditions", []); store.set("conditionPainScores", {});
  store.set("availableTime", "short");                 // Settings: 30 minutes
  store.set("lastCheckin", { energy: 6, mood: 6, timestamp: new Date().toISOString() });
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
}
const rtr = { history: ["x"], navigate() {}, back() {} };
async function coach() {
  main.innerHTML = ""; CoachProposalView(rtr).mount(main); await wait(40);
}
const about = () => Number((txt(main).match(/About (\d+) min/) || [])[1]);
// Tomorrow, with the app left as it is: whatever was kept for today is yesterday's.
function tomorrow() {
  const t = store.get("availableTimeToday");
  if (t && t.on) store.set("availableTimeToday", { ...t, on: store._localDay(new Date(Date.now() - 86400000)) });
}

// ── 1. THE COACH'S LENGTH ───────────────────────────────────────────────
console.log("\nTEST 1 - Length on the coach's plan is today's");
fixture();
await coach();
click(main.querySelector("#cp-time")); await wait(10);
click(main.querySelector('[data-pick-time="10"]')); await wait(40);
ok("1pc. today's plan follows the pick", about() > 0 && about() <= 12, String(about()));
ok("1a. the usual is unchanged", store.get("availableTime") === "short", store.get("availableTime"));
tomorrow();
await coach();
ok("1b. tomorrow the plan is the usual length again", about() >= 22, String(about()));
ok("1c. and the check-in says the usual 30", /usual 30 minutes/.test(CKV.lengthLine(store.get("availableTime"))), CKV.lengthLine(store.get("availableTime")));

// ── 2. I KNOW WHAT I WANT ───────────────────────────────────────────────
console.log("\nTEST 2 - I know what I want's length is today's");
fixture();
main.innerHTML = ""; KnowWhatView(rtr).mount(main); await wait(10);
const kind = main.querySelector('input[name="kind"][value="strength"]') || main.querySelector('input[name="kind"]');
kind.checked = true; kind.dispatchEvent(new dom.window.Event("change", { bubbles: true })); await wait(10);
const len = main.querySelector('input[name="length"][value="40"]');
len.checked = true; len.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
const none = main.querySelector('input[name="sore-none"]');
if (none) { none.checked = true; none.dispatchEvent(new dom.window.Event("change", { bubbles: true })); await wait(10); }
main.querySelector(".kw-form").dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true })); await wait(10);
ok("2a. the usual is unchanged", store.get("availableTime") === "short", store.get("availableTime"));
await coach();
ok("2b. today's plan is 40", about() >= 32, String(about()));
tomorrow();
main.innerHTML = ""; KnowWhatView(rtr).mount(main); await wait(10);
ok("2c. tomorrow I know what I want starts from the usual 30", main.querySelector('input[name="length"][value="30"]')?.checked === true);

// ── 3. SOMETHING SHORTER ────────────────────────────────────────────────
console.log("\nTEST 3 - Something shorter is today's");
fixture();
await coach();
const shorter = main.querySelector('[data-different="shorter"]');
click(shorter); await wait(40);
ok("3pc. offered and taken", !!shorter);
ok("3a. the usual is unchanged", store.get("availableTime") === "short", store.get("availableTime"));

// ── 4. THE CHECK-IN AFTER A PICK ────────────────────────────────────────
console.log("\nTEST 4 - the check-in after a pick today");
fixture();
await coach();
click(main.querySelector("#cp-time")); await wait(10);
click(main.querySelector('[data-pick-time="20"]')); await wait(40);
const L = CKV.checkinLengthLine?.() ?? "";
ok("4a. it says today's 20, not the usual 30", /20 minutes/.test(L) && !/usual 30/.test(L), L);

// ── 5. SETTINGS ─────────────────────────────────────────────────────────
console.log("\nTEST 5 - control: Settings changes the usual");
fixture();
store.set("availableTime", "standard");
tomorrow();
await coach();
ok("5a. the usual 40 builds 40", about() >= 32, String(about()));

console.log("");
if (fails) { console.log(`USUAL-LENGTH: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`USUAL-LENGTH: all ${passes} assertions pass\n`);
process.exit(0);
