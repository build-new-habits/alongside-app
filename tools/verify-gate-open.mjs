/**
 * tools/verify-gate-open.mjs
 * 02 Oct 2026 v2
 *
 * v2 - W4-13. 6pc's positive control is a person with nothing waiting (the
 *   summary keeps its house); new 6e: before anything is answered the
 *   summary has no house, since it led back to the first question. Stricter,
 *   none loosened.
 *
 * 02 Oct 2026 v1
 *
 * W4-1 GATE-OPEN (Wave 4 persona trace, 01 Oct 2026; found by 2.12, 2.13,
 * 2.16 and U18). On a fresh install the house button on the age question
 * opened the whole app: Home, check-in, journal, Settings, Upgrade, with no
 * age answer and no consent. Health answers were then stored with nothing
 * agreed. A name typed in Settings, or at the first coach question before
 * closing the app, made start-up treat the person as an existing user, so
 * neither question was ever asked again. Every guard acted only once
 * consent.given was true, so none fired. An under-18 bypass.
 *
 * Drives the REAL router and the REAL app.js start-up (App.init). Route
 * names are read from js/router.js, not typed.
 *
 *   1. Fresh install: every route but the privacy summary lands on
 *      onboarding (which asks the age first).
 *   2. Fresh install: the house button lands on onboarding.
 *   3. Age answered (adult), consent not given: every route but privacy
 *      lands on onboarding (the consent screen).
 *   4. Start-up decides by the answers, never by a stored name: a name with
 *      nothing agreed opens onboarding; agreed but onboarding not finished
 *      opens onboarding; finished opens Home.
 *   5. Nothing agreed: health consent is needed and health answers are not
 *      allowed.
 *   6. No house button on the onboarding, age, under-18 or policy screens;
 *      still there on the privacy summary (positive control).
 *   7. Positive control: a person who has answered and agreed reaches Home,
 *      check-in and Settings.
 */
import { createRequire as __cr } from "node:module";
import { readFileSync } from "node:fs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM(`<!doctype html><body>
  <div id="loading"></div>
  <div id="app"><main id="main-content" tabindex="-1"></main></div>
  <nav id="bottom-nav" class="hidden"><a data-view="today" class="nav-item">Today</a><a data-view="settings" class="nav-item">Settings</a></nav>
  <button id="hidden-nav-home-btn" class="hidden" aria-label="Back to Today"></button>
</body>`, { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "FileReader", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(0), 0);
dom.window.requestAnimationFrame = globalThis.requestAnimationFrame;
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.fetch = dom.window.fetch = async () => ({ ok: true, json: async () => ({ messages: [] }), text: async () => "" });

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
await import(B + "app.js");
const HC = await import(B + "data/health-consent.js");
const { POLICY_VERSION } = await import(B + "data/consent-version.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));

// The routes, from the router itself.
const src = readFileSync(new URL("../js/router.js", import.meta.url), "utf8");
const block = src.slice(src.indexOf("const VIEW_NAMES = {"), src.indexOf("};", src.indexOf("const VIEW_NAMES = {")));
const ROUTES = [...block.matchAll(/^\s*'([^']+)'\s*:\s*\{\s*path:/gm)].map(m => m[1]);
ok("0. positive control: the route list was read", ROUTES.length > 40 && ROUTES.includes("today") && ROUTES.includes("journal-entry"), `${ROUTES.length} routes`);

const realMount = router._mountView.bind(router);
let landed = [];
const record = () => { router._mountView = async name => { landed.push(name); }; };
const go = async r => { landed = []; await router.navigate(r); await wait(5); return landed.at(-1); };

function fresh() { localStorage.clear(); store.init(); router.history = []; }
function adultOnly() { fresh(); store.set("consent.ageConfirmed", true); store.set("consent.ageCheckedAt", new Date().toISOString()); }
function agreed({ onboarded = true } = {}) {
  adultOnly();
  store.set("consent.given", true); store.set("consent.at", new Date().toISOString()); store.set("consent.policyVersion", POLICY_VERSION);
  HC.giveHealthConsent();
  store.set("name", "Sam");
  if (onboarded) store.set("onboardingComplete", true);
}
const OPEN_BEFORE = new Set(["privacy", "onboarding/thread"]);

// ── 1. FRESH INSTALL ────────────────────────────────────────────────────
console.log("\nTEST 1 - fresh install: every route but privacy goes to onboarding");
record();
fresh();
let leaks = [];
for (const r of ROUTES) {
  if (OPEN_BEFORE.has(r)) continue;
  fresh();
  const to = await go(r);
  if (to !== "onboarding/thread") leaks.push(`${r} -> ${to}`);
}
ok("1a. no route reaches the app before the age question", leaks.length === 0, leaks.slice(0, 8).join(" | ") + (leaks.length > 8 ? ` (+${leaks.length - 8})` : ""));
fresh();
ok("1b. the privacy summary stays readable", (await go("privacy")) === "privacy");

// ── 2. THE HOUSE BUTTON ─────────────────────────────────────────────────
console.log("\nTEST 2 - fresh install: the house button");
fresh();
landed = [];
await window.App.init();
await wait(20);
ok("2pc. positive control: start-up opened onboarding", landed.at(-1) === "onboarding/thread", JSON.stringify(landed));
landed = [];
document.getElementById("hidden-nav-home-btn").dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
await wait(20);
ok("2a. pressing it lands on onboarding, not Home", landed.at(-1) === "onboarding/thread", JSON.stringify(landed));
ok("2b. nothing agreed afterwards", store.get("consent.given") !== true && store.get("consent.ageConfirmed") == null);

// ── 3. AGE ANSWERED, NO CONSENT ─────────────────────────────────────────
console.log("\nTEST 3 - age answered, consent not given");
leaks = [];
for (const r of ROUTES) {
  if (OPEN_BEFORE.has(r)) continue;
  adultOnly();
  const to = await go(r);
  if (to !== "onboarding/thread") leaks.push(`${r} -> ${to}`);
}
ok("3a. no route reaches the app before consent", leaks.length === 0, leaks.slice(0, 8).join(" | ") + (leaks.length > 8 ? ` (+${leaks.length - 8})` : ""));
adultOnly();
ok("3b. Settings is not a way round it", (await go("settings")) === "onboarding/thread");

// ── 4. START-UP ─────────────────────────────────────────────────────────
console.log("\nTEST 4 - start-up decides by the answers, not by a name");
async function startUp() { landed = []; await window.App.init(); await wait(20); return landed.at(-1); }
fresh(); store.set("name", "Jess");
ok("4a. a name with nothing agreed opens onboarding", (await startUp()) === "onboarding/thread");
agreed({ onboarded: false });
ok("4b. agreed but onboarding not finished opens onboarding", (await startUp()) === "onboarding/thread");
agreed();
ok("4c. finished opens Home", (await startUp()) === "today");

// ── 5. HEALTH CONSENT ───────────────────────────────────────────────────
console.log("\nTEST 5 - nothing agreed: no health answers");
fresh();
ok("5a. health consent is needed when nothing has been agreed", HC.healthConsentNeeded() === true);
ok("5b. health answers are not allowed", HC.healthAllowed() === false);
agreed();
ok("5c. positive control: given, allowed", HC.healthAllowed() === true);

// ── 6. NO HOUSE ON THE GATE SCREENS ─────────────────────────────────────
console.log("\nTEST 6 - no house button on the gate screens");
router._mountView = realMount;
const house = () => !document.getElementById("hidden-nav-home-btn").classList.contains("hidden");
const shown = {};
for (const [r, setup] of [["onboarding/thread", fresh], ["age-check", fresh], ["under-18", fresh], ["consent-update", agreed], ["privacy", agreed], ["privacy-fresh", fresh]]) {
  setup();
  try { await router._mountView(r === "privacy-fresh" ? "privacy" : r); } catch (e) { /* the view's own mount; visibility is set first */ }
  await wait(5);
  shown[r] = house();
}
ok("6a. onboarding: no house", shown["onboarding/thread"] === false);
ok("6b. the age question: no house", shown["age-check"] === false);
ok("6c. the under-18 screen: no house", shown["under-18"] === false);
ok("6d. the policy screen: no house", shown["consent-update"] === false);
ok("6pc. positive control: the privacy summary still has it", shown["privacy"] === true, JSON.stringify(shown));
// W4-13: before anything is answered the house would only lead back to the
// first question, so the summary opened from it has none either.
ok("6e. the privacy summary before anything is answered: no house", shown["privacy-fresh"] === false, JSON.stringify(shown));
await wait(3000); // let onboarding's splash timers finish before the next mount
document.getElementById("main-content").innerHTML = "";

// ── 7. POSITIVE CONTROL ─────────────────────────────────────────────────
console.log("\nTEST 7 - somebody who has answered and agreed is not stopped");
record();
agreed();
ok("7a. Home", (await go("today")) === "today");
agreed();
ok("7b. Settings", (await go("settings")) === "settings");
agreed();
ok("7c. the check-in (or the screen it is due before)", ["checkin", "red-flag"].includes(await go("checkin")));

console.log(`\nGATE-OPEN: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
