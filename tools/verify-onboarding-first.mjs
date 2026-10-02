/**
 * tools/verify-onboarding-first.mjs
 * 02 Oct 2026 v1
 *
 * W4-19 ONBOARDING-FIRST (Wave 4 persona trace: 2.11, 2.12, 2.16).
 *
 * Getting started gave no way to say no to the health consent, although
 * the app works without it; the consent text was small and grey, the
 * health tick 47 words, and the age question and the consent were both
 * headed "Before we start". The year list began at this year, so 1950 was
 * 77th of 101. Back on the sore-areas sheet recorded "Nothing to flag" (and
 * kept any area tapped), the sheet was announced "Health conditions and
 * injuries" and showed "Step 5 of 7". The splash replayed on every reopen
 * and ignored Reduce motion. "A few more, and then I'll stop asking" came
 * before seven questions, "Last one" before three.
 *
 *   1. The health consent can be declined in getting started: the person
 *      goes on, nothing health-related is asked, sessions are planned
 *      carefully, and giving it later asks what their body can do.
 *   2. Consent text at body size and colour; the health tick under 25
 *      words; the two screens headed differently.
 *   3. The year is typed (nothing to scroll): 1950 is as quick as 2000.
 *   4. Sheet Back records nothing and keeps nothing tapped; the sheet is
 *      named for what it asks; no step count inside it.
 *   5. No splash on a return, or under Reduce motion.
 *   6. No count the questions do not keep.
 */
import { createRequire as __cr } from "node:module";
import { readFileSync } from "node:fs";
import { oneScreen } from "./one-screen.mjs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM(`<!doctype html><body><div id="app"><main id="main-content"></main></div></body>`, { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "getComputedStyle"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
let reduce = false;
dom.window.matchMedia = q => ({ matches: /reduce/.test(q) ? reduce : false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
dom.window.Element.prototype.scrollIntoView = () => {};
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(0), 0);
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const ROOT = new URL("../", import.meta.url);
const B = new URL("js/", ROOT).href;
const { store } = await import(B + "store.js");
const HC = await import(B + "data/health-consent.js");
const OTD = await import(B + "data/onboarding-thread-data.js");
const { ThreadView } = await import(B + "views/onboarding/thread.js");
const SM = await import(B + "views/onboarding/sheet-manager.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const tick = el => { el.checked = true; el.dispatchEvent(new dom.window.Event("change")); };

async function mount() {
  const el = oneScreen(document.createElement("div"));
  ThreadView({ navigate() {}, back() {} }).mount(el);
  await wait(2300);
  return el;
}
async function toConsent() {
  localStorage.clear(); store.init();
  const el = await mount();
  el.querySelector("#ob-age-month").value = "3"; el.querySelector("#ob-age-year").value = "1975";
  click(el.querySelector("#ob-age-continue")); await wait(20);
  return el;
}

// ── 1. DECLINING THE HEALTH CONSENT ─────────────────────────────────────
console.log("\nTEST 1 - the health consent can be declined");
let el = await toConsent();
ok("1pc. the consent screen", !!el.querySelector("#ob-consent-check"), txt(el).slice(0, 120));
tick(el.querySelector("#ob-consent-check"));
ok("1a0. one tick: Continue shows as ready", el.querySelector("#ob-consent-continue").getAttribute("aria-disabled") === "false" && !el.querySelector("#ob-consent-continue").classList.contains("is-inactive"));
click(el.querySelector("#ob-consent-continue")); await wait(60);
ok("1a. with only the Privacy and Terms tick, the person goes on", store.get("consent.given") === true && typeof store.get("onboarding.threadStartedAt") === "string",
   txt(el).slice(0, 200));
ok("1b. health consent recorded as declined, not given", store.get("consent.health.given") === false && !!store.get("consent.health.declinedAt"), JSON.stringify(store.get("consent.health")));
const HEALTH_STEPS = ["3a", "3b", 4, 8, "9a", "9b", "9c", "9d", "9e", 10];
const sd = store.data;
const asked = HEALTH_STEPS.filter(id => { const s = OTD.STEPS[id]; return !s || typeof s.showIf !== "function" || s.showIf(sd); });
ok("1c. no health question in getting started (sore areas, body, energy, what's been hard)", asked.length === 0, asked.join(", "));
const prof = store.capabilityProfile();
ok("1d. sessions planned carefully meanwhile", prof.careful === true && prof.floorSafe === false && prof.balanceSafe === false, JSON.stringify(prof));
HC.giveHealthConsent();
ok("1e. given later: What your body can do is asked before the next session", HC.capabilityToAsk() === true);
// control: both ticks, health steps asked as before
el = await toConsent();
tick(el.querySelector("#ob-consent-check")); tick(el.querySelector("#ob-consent-health"));
click(el.querySelector("#ob-consent-continue")); await wait(60);
ok("1f. control: both ticks, the sore-areas step is asked", store.get("consent.health.given") === true && (typeof OTD.STEPS[8].showIf !== "function" || OTD.STEPS[8].showIf(store.data)));
ok("1g. control: and the plan is not the careful one", store.capabilityProfile().careful !== true);

// ── 2. READABLE AND DISTINCT ────────────────────────────────────────────
console.log("\nTEST 2 - consent text readable; screens headed differently");
const css = readFileSync(new URL("css/components/onboarding-thread.css", ROOT), "utf8");
const rule = sel => (css.match(new RegExp(`\\n${sel.replace(/[.]/g, "\\.")}\\s*\\{([^}]*)\\}`)) || [])[1] || "";
for (const sel of [".ob-consent__list li", ".ob-consent__label", ".ob-consent__note", ".ob-consent__links"]) {
  const r = rule(sel);
  ok(`2a. ${sel}: body size and colour`, /font-size:\s*var\(--text-base\)/.test(r) && !/color-text-secondary/.test(r), r.trim().replace(/\s+/g, " "));
}
const words = HC.HEALTH_TICK.split(/\s+/).filter(Boolean).length;
ok("2b. the health tick is under 25 words", words < 25, `${words} words`);
localStorage.clear(); store.init();
el = await mount();
const h1 = txt(el.querySelector("h1"));
el.querySelector("#ob-age-month").value = "3"; el.querySelector("#ob-age-year").value = "1975";
click(el.querySelector("#ob-age-continue")); await wait(20);
const h2 = txt(el.querySelector("h1"));
ok("2c. the age question and the consent are headed differently", h1 && h2 && h1 !== h2, `${h1} | ${h2}`);

// ── 3. THE YEAR ─────────────────────────────────────────────────────────
console.log("\nTEST 3 - the year is typed");
localStorage.clear(); store.init();
el = await mount();
const year = el.querySelector("#ob-age-year");
ok("3a. a number field with its label, not a list of 101", year?.tagName === "INPUT" && year.getAttribute("inputmode") === "numeric" && !!el.querySelector('label[for="ob-age-year"]'), year?.outerHTML.slice(0, 120));
el.querySelector("#ob-age-month").value = "6"; year.value = "1950";
click(el.querySelector("#ob-age-continue")); await wait(20);
ok("3b. 1950 is accepted", store.get("consent.ageConfirmed") === true);
localStorage.clear(); store.init();
el = await mount();
el.querySelector("#ob-age-month").value = "6"; el.querySelector("#ob-age-year").value = "50";
click(el.querySelector("#ob-age-continue")); await wait(20);
ok("3c. two digits: asked for all four, nothing recorded", /four/i.test(txt(el.querySelector("#ob-age-error"))) && store.get("consent.ageConfirmed") == null, txt(el.querySelector("#ob-age-error")));

// ── 4. THE SORE-AREAS SHEET ─────────────────────────────────────────────
console.log("\nTEST 4 - the sore-areas sheet");
localStorage.clear(); store.init();
window.router = { navigate() {} };
let result = null;
await SM.openSheet("onboarding/conditions", r => { result = r; }); await wait(20);
const panel = document.querySelector(".sheet-panel, [role='dialog']");
ok("4a. named for what it asks", /sore or injured areas/i.test(panel?.getAttribute("aria-label") || ""), panel?.getAttribute("aria-label"));
ok("4b. no step count inside it", !/Step \d+ of \d+/.test(panel?.innerHTML || ""));
click(document.querySelector('[data-condition="knee"]')); await wait(5);
ok("4pc. tapping an area marks it", (store.get("conditions") || []).includes("knee"));
const back = [...document.querySelectorAll(".sheet-content button")].find(b => /^Back$/.test(txt(b)));
click(back); await wait(50);
ok("4c. Back records nothing (not done, not skipped)", !!result && result.cancelled === true && result.skipped !== true, JSON.stringify(result));
ok("4d. and keeps nothing tapped", (store.get("conditions") || []).length === 0, JSON.stringify(store.get("conditions")));
const thread = readFileSync(new URL("js/views/onboarding/thread.js", ROOT), "utf8");
ok("4e. getting started offers the sheet again after Back", /result\.cancelled/.test(thread));

// ── 5. THE SPLASH ───────────────────────────────────────────────────────
console.log("\nTEST 5 - the splash");
const splashes = () => document.querySelectorAll(".ob-splash").length;
localStorage.clear(); store.init(); reduce = false;
oneScreen(document.createElement("div")); ThreadView({ navigate() {} }).mount(document.querySelector("[data-check-screen]")); await wait(30);
ok("5pc. a first open: the splash", splashes() === 1);
await wait(2300);
localStorage.clear(); store.init(); store.set("consent.ageConfirmed", true);
const r1 = oneScreen(document.createElement("div")); ThreadView({ navigate() {} }).mount(r1); await wait(30);
ok("5a. a return (age already answered): no splash, straight on", splashes() === 0 && !!r1.querySelector("#ob-consent-check"), txt(r1).slice(0, 80));
localStorage.clear(); store.init(); reduce = true;
const r2 = oneScreen(document.createElement("div")); ThreadView({ navigate() {} }).mount(r2); await wait(30);
ok("5b. Reduce motion: no splash, straight on", splashes() === 0 && !!r2.querySelector("#ob-age-year"), txt(r2).slice(0, 80));
reduce = false;

// ── 6. COUNTS ───────────────────────────────────────────────────────────
console.log("\nTEST 6 - no count the questions do not keep");
const lines = Object.values(OTD.STEPS).map(s => s.coach || "").join("\n");
ok("6a. no \"then I'll stop asking\"", !/stop asking/i.test(lines));
const ASKS = new Set(["inline-text", "inline-chips-single", "inline-chips-multi", "inline-chips-primary", "sheet"]);
const order = OTD.STEP_ORDER;
const bad = order.filter((id, i) => /\bLast one\b/i.test(OTD.STEPS[id]?.coach || "") && order.slice(i + 1).some(n => ASKS.has(OTD.STEPS[n]?.type)));
ok("6b. \"Last one\" only where no question follows", bad.length === 0, bad.join(", "));

console.log(`\nONBOARDING-FIRST: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
