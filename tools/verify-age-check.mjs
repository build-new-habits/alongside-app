/**
 * tools/verify-age-check.mjs
 * 02 Oct 2026 v3
 *
 * v3 - W4-0 SUITE-TRUE. Mounts through tools/one-screen.mjs, so one screen
 *   is in the page at a time (two copies of one id failed on jsdom 27+). No
 *   assertion changed.
 *
 * v2 - CONSENT-VERSION. The existing-install fixture agreed to the current
 *   policy version, so test 5 measures the age check alone. No assertion
 *   changed.
 *
 * AGE-CHECK. Alongside is 18+, and the app now does what its terms say
 * (Children's code standard 6). The check is neutral, keeps only the
 * result, and somebody under 18 keeps nothing else and sees only support
 * meant for them.
 *
 *   1. Onboarding asks first, before consent: when were you born (month,
 *      year). Not answered: says so, nothing recorded. Adult: on to the
 *      consent screen, ageConfirmed true. No date of birth kept anywhere.
 *   2. Neutral: no "Are you 18 or over? Yes / No" buttons.
 *   3. The boundary, by month: 18 this month is 18; a month short is not.
 *   4. Under 18 in onboarding: the under-18 screen, consent never asked,
 *      nothing else kept.
 *   5. An install from before the check is asked once, through the real
 *      router; adult carries on; under 18 deletes what was there.
 *   6. Once under 18, every route shows the under-18 screen, except the
 *      privacy summary.
 *   7. The under-18 screen: no way into the app; Childline 0800 1111,
 *      Shout 85258, NHS 111 and 999, as links that work; says nothing was
 *      kept.
 */
import { oneScreen } from "./one-screen.mjs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: true, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(0), 0);
dom.window.requestAnimationFrame = globalThis.requestAnimationFrame;
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
const pick = (root, sel, v) => { const e = root.querySelector(sel); if (e) { e.value = String(v); e.dispatchEvent(new dom.window.Event("change", { bubbles: true })); } return !!e; };

let AC = null;
try { AC = await import(B + "data/age-check.js"); } catch { /* red first */ }

let landed = [];
router._mountView = async name => {
  landed.push(name);
  const views = { "age-check": ["views/age-check.js", "AgeCheckView"], "under-18": ["views/under-18.js", "Under18View"] };
  if (views[name]) {
    const m = await import(B + views[name][0]);
    main.innerHTML = ""; m[views[name][1]](router).mount(main);
  }
};
const go = async r => { landed = []; await router.navigate(r); await wait(10); return landed.at(-1); };

const now = new Date();
const ym = monthsBack => { const d = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1); return { m: d.getMonth() + 1, y: d.getFullYear() }; };
const ADULT = ym(30 * 12), CHILD = ym(15 * 12);

const { ThreadView } = await import(B + "views/onboarding/thread.js");
async function onboard() {
  localStorage.clear(); store.init();
  const el = document.createElement("div"); oneScreen(el);
  const navs = [];
  ThreadView({ navigate: v => navs.push(v), back() {} }).mount(el); await wait(2600);
  return { el, navs };
}

// ── 1. ONBOARDING ASKS FIRST ────────────────────────────────────────────
console.log("\nTEST 1 - onboarding asks when you were born, before anything else");
let { el, navs } = await onboard();
ok("1a. the first question is the date of birth, and the consent screen is not up yet",
   !!el.querySelector("#ob-age-month") && !!el.querySelector("#ob-age-year") && !el.querySelector("#ob-consent-check"),
   txt(el).slice(0, 120));
ok("1b. labelled: Month, Year, in a fieldset that asks when you were born",
   !!el.querySelector('label[for="ob-age-month"]') && !!el.querySelector('label[for="ob-age-year"]') &&
   /When were you born/.test(txt(el.querySelector("legend"))));
ok("1c. it says only the result is kept", /only keep whether you are 18 or over, not the date/i.test(txt(el)));
click(el.querySelector("#ob-age-continue")); await wait(10);
ok("1d. not answered: it says so, and nothing is recorded",
   /Choose a month and a year/.test(txt(el.querySelector("#ob-age-error"))) && store.get("consent.ageConfirmed") == null);
pick(el, "#ob-age-month", ADULT.m); pick(el, "#ob-age-year", ADULT.y);
click(el.querySelector("#ob-age-continue")); await wait(10);
ok("1e. adult: on to the consent screen", !!el.querySelector("#ob-consent-check"));
ok("1f. recorded as a yes, with when and which version",
   store.get("consent.ageConfirmed") === true && !!store.get("consent.ageCheckedAt") && !!store.get("consent.ageVersion"));
ok("1g. no date of birth anywhere in what is kept",
   !new RegExp(`"(?:dob|dateOfBirth|birth\\w*)"`, "i").test(JSON.stringify(store.data)) && !JSON.stringify(store.data).includes(`"${ADULT.y}-`) &&
   !Object.values(store.get("consent") || {}).some(v => String(v) === String(ADULT.y)));

// ── 2. NEUTRAL ──────────────────────────────────────────────────────────
console.log("\nTEST 2 - the question is neutral");
({ el } = await onboard());
const btns = [...el.querySelectorAll("button")].map(txt);
ok("2a. no yes/no buttons about being 18", !btns.some(b => /18|over|under|^yes$|^no$/i.test(b)), JSON.stringify(btns));

// ── 3. THE BOUNDARY ─────────────────────────────────────────────────────
console.log("\nTEST 3 - the boundary, by month");
const e18 = ym(18 * 12), short = ym(18 * 12 - 1);
ok("3pc. the rule exists", typeof AC?.isAdult === "function");
ok("3a. 18 this month is 18", AC?.isAdult(e18.m, e18.y, now) === true);
ok("3b. a month short is not", AC?.isAdult(short.m, short.y, now) === false);
ok("3c. a future date is not an answer", AC?.isAdult(1, now.getFullYear() + 1, now) === null);

// ── 4. UNDER 18 IN ONBOARDING ───────────────────────────────────────────
console.log("\nTEST 4 - under 18 in onboarding");
({ el, navs } = await onboard());
pick(el, "#ob-age-month", CHILD.m); pick(el, "#ob-age-year", CHILD.y);
click(el.querySelector("#ob-age-continue")); await wait(10);
ok("4a. the under-18 screen, and consent is never asked", navs.includes("under-18") && !el.querySelector("#ob-consent-check"), JSON.stringify(navs));
ok("4b. recorded as under 18, and nothing else kept",
   store.get("consent.ageConfirmed") === false && store.get("consent.given") !== true && !store.get("name") &&
   !JSON.stringify(store.data).includes(`"${CHILD.y}`));

// ── 5. INSTALLS FROM BEFORE ─────────────────────────────────────────────
console.log("\nTEST 5 - an install from before the check is asked once");
function existing() {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", "personal");
  store.set("consent.given", true); store.set("consent.at", now.toISOString()); store.set("consent.policyVersion", "2026-10-01");
  store.set("journalEntries", [{ id: "j1", date: now.toISOString(), text: "Mine", tags: [] }]);
  router.currentView = "settings"; router.history = [];
}
existing();
ok("5a. asked before Home", (await go("today")) === "age-check" && !!main.querySelector("#age-month"));
click(main.querySelector("#age-continue")); await wait(10);
ok("5b. not answered: says so", /Choose a month and a year/.test(txt(main.querySelector("#age-error"))));
pick(main, "#age-month", ADULT.m); pick(main, "#age-year", ADULT.y);
landed = []; click(main.querySelector("#age-continue")); await wait(20);
ok("5c. adult: on to where they were going, data untouched",
   landed.includes("today") && store.get("consent.ageConfirmed") === true && (store.get("journalEntries") || []).length === 1, JSON.stringify(landed));
ok("5d. and not asked again", (await go("today")) === "today");
existing();
await go("checkin");
pick(main, "#age-month", CHILD.m); pick(main, "#age-year", CHILD.y);
landed = []; click(main.querySelector("#age-continue")); await wait(20);
ok("5e. under 18: the under-18 screen, and what was on the phone is deleted",
   landed.includes("under-18") && store.get("consent.ageConfirmed") === false && !store.get("name") &&
   (store.get("journalEntries") || []).length === 0, JSON.stringify(landed));

// ── 6. EVERY ROUTE ──────────────────────────────────────────────────────
console.log("\nTEST 6 - once under 18, only the under-18 screen");
for (const r of ["today", "checkin", "classes", "settings", "noticing", "onboarding/thread"])
  ok(`6. ${r} shows the under-18 screen`, (await go(r)) === "under-18");
ok("6p. the privacy summary stays reachable", (await go("privacy")) === "privacy");
localStorage.clear(); store.init(); router.currentView = null;
ok("6r. REVERSAL: a fresh install is not stopped by the guard (onboarding asks)", (await go("onboarding/thread")) === "onboarding/thread");

// ── 7. THE UNDER-18 SCREEN ──────────────────────────────────────────────
console.log("\nTEST 7 - the under-18 screen");
localStorage.clear(); store.init(); AC?.recordAge?.(false);
await go("today");
const u = txt(main);
ok("7pc. positive control: it rendered", /Alongside is for adults/.test(u));
ok("7a. says nothing was kept", /Nothing you told the app has been kept/.test(u));
ok("7b. Childline, any time, 0800 1111, as a working link", !!main.querySelector('a[href="tel:08001111"]') && /Childline/.test(u) && /0800 1111/.test(u));
ok("7c. Shout 85258", !!main.querySelector('a[href^="sms:85258"]') && /85258/.test(u));
ok("7d. NHS 111 and 999", !!main.querySelector('a[href="tel:111"]') && !!main.querySelector('a[href="tel:999"]'));
const ways = [...main.querySelectorAll("button, a")].map(b => txt(b));
ok("7e. no way on into the app", !ways.some(w => /continue|start|home|carry on|let'?s go/i.test(w)), JSON.stringify(ways));
ok("7f. no blame: no \"not allowed\", \"banned\" or \"too young\"", !/not allowed|banned|too young/i.test(u));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
