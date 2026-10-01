/**
 * tools/verify-consent-version.mjs
 * 01 Oct 2026 v1
 *
 * CONSENT-VERSION. The Privacy Policy v6 says that when it changes in a way
 * that matters, the app asks you to agree to the new version before you
 * carry on. consent.policyVersion was recorded since 11 Aug and read by
 * nothing; this proves it is now acted on.
 *
 *   1. Agreed to an older version: asked before Home, with what changed
 *      and the links; unticked Continue says what is needed; ticked, the
 *      current version is recorded and they carry on.
 *   2. Not stuck: Settings and the privacy summary stay open.
 *   3. Asked once; the current version is not asked again; somebody who
 *      never agreed (onboarding asks) or is under 18 is not asked here.
 *   4. Onboarding records the current version.
 */
import fs from "node:fs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: true, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

let CV = null;
try { CV = await import(B + "data/consent-version.js"); } catch { /* red first */ }

let landed = [];
router._mountView = async name => {
  landed.push(name);
  if (name === "consent-update") {
    const m = await import(B + "views/consent-update.js");
    main.innerHTML = ""; m.ConsentUpdateView(router).mount(main);
  }
};
const go = async r => { landed = []; await router.navigate(r); await wait(10); return landed.at(-1); };

function fixture({ version = "2026-08-11", age = true, given = true } = {}) {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("name", "Sam");
  if (given) { store.set("consent.given", true); store.set("consent.at", "2026-08-20T10:00:00Z"); store.set("consent.policyVersion", version); }
  store.set("consent.ageConfirmed", age);
  store.set("consent.health", { given: true, at: "x", version: "x", withdrawnAt: null });
  CV?.takePendingRoute?.();
  router.currentView = "settings"; router.history = [];
}

// ── 1. ASKED AGAIN ──────────────────────────────────────────────────────
console.log("\nTEST 1 - agreed to an older version: asked before carrying on");
fixture();
ok("1a. asked before Home", (await go("today")) === "consent-update");
ok("1b. says what changed, with the links", /have changed/.test(txt(main)) && main.querySelectorAll("li").length >= 3 &&
   !!main.querySelector('a[href*="/privacy/"]') && !!main.querySelector('a[href*="/terms/"]'));
click(main.querySelector("#cu-continue")); await wait(10);
ok("1c. unticked: says what is needed, nothing recorded", !!txt(main.querySelector("#cu-error")) && store.get("consent.policyVersion") === "2026-08-11");
const box = main.querySelector("#cu-check"); if (box) box.checked = true;
landed = []; click(main.querySelector("#cu-continue")); await wait(20);
ok("1d. ticked: the current version is recorded, and on to Home",
   store.get("consent.policyVersion") === CV?.POLICY_VERSION && landed.includes("today"), JSON.stringify(landed));
ok("1e. not asked again", (await go("checkin")) !== "consent-update");

// ── 2. NOT STUCK ────────────────────────────────────────────────────────
console.log("\nTEST 2 - somebody who does not agree can still download or delete");
fixture();
ok("2a. Settings stays open", (await go("settings")) === "settings");
ok("2b. the privacy summary stays open", (await go("privacy")) === "privacy");

// ── 3. WHO IS NOT ASKED HERE ────────────────────────────────────────────
console.log("\nTEST 3 - who is not asked here");
fixture({ version: CV?.POLICY_VERSION });
ok("3a. the current version", (await go("today")) === "today");
fixture({ given: false, age: null });
ok("3b. never agreed (onboarding asks)", (await go("onboarding/thread")) === "onboarding/thread");
fixture({ age: false });
ok("3c. under 18 sees the under-18 screen, not this", (await go("today")) === "under-18");

// ── 4. ONBOARDING RECORDS THE CURRENT VERSION ───────────────────────────
console.log("\nTEST 4 - onboarding records the current version");
const thread = fs.readFileSync(new URL("../js/views/onboarding/thread.js", import.meta.url), "utf8");
ok("4a. the thread's version is the guard's version", /POLICY_VERSION\s*=\s*CURRENT_POLICY_VERSION/.test(thread) && /from '..\/..\/data\/consent-version.js'/.test(thread));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
