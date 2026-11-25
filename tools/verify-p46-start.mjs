/**
 * tools/verify-p46-start.mjs
 * 24 Nov 2026 v2
 *
 * v2 - P-46 WAVE 8 FIX. Wave 8: the length asked is quick (about 20 minutes,
 *   as the card says), Today's plan says Your first session (never You asked
 *   for), and Outside asks for outside.
 *
 * 24 Nov 2026 v1
 *
 * P-46 FREE-AND-FIRST, S2 GETTING STARTED (spec docs/specs/alongside_free-and-first_24nov2026_v1.md, v2, section 2). Drives the
 * real views: the hand-over from the agreements (ThreadView), and the
 * one-minute start (StartView) screen by screen: what each screen says
 * (one short line), what it writes (the same fields and values as the old
 * conversation), the health-consent rule, the safety rules reached, the
 * red-flag guard before the first session, and the first session asked
 * for gentle at the chosen place. Red on alongside-v738.
 */
import { readFileSync } from "node:fs";
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
const until = async (fn, ms = 4000) => { const t = Date.now(); while (Date.now() - t < ms) { const v = fn(); if (v) return v; await wait(25); } return null; };
const { StartView, START_AREAS, FULL_GYM } = await import(B + "views/onboarding/start.js").catch(e => { console.log("  (start.js did not load: " + e.message + ")"); return {}; });
const { declineHealthConsent } = await import(B + "data/health-consent.js");
const { CONDITIONS } = await import(B + "data/conditions.js");
const RFv = await import(B + "data/red-flag.js");

function fresh(health = true) {
  document.querySelectorAll("body > div:not(#app)").forEach(n => n.remove());   // one screen at a time
  localStorage.clear(); store.init(); agreed(store);
  if (!health) declineHealthConsent();
}
async function openStart() {
  const nav = [];
  const el = document.createElement("div"); document.body.appendChild(el);
  StartView({ navigate: (r, o) => nav.push(r), back() {} }).mount(el);
  await wait(30);
  return { el, nav, q: s => el.querySelector(s), qa: s => [...el.querySelectorAll(s)], h1: () => txt(el.querySelector("h1")) };
}
const words = s => s.split(/\s+/).filter(Boolean).length;

console.log("\nTEST 0 - self-check: the fixture is agreed, not onboarded");
fresh();
ok("0a. agreed: age and Privacy/Terms, health consent given; not onboarded", store.get("consent.given") === true && store.get("consent.ageConfirmed") === true && store.get("consent.health.given") === true && store.get("onboardingComplete") !== true);
ok("0b. start.js exports the view", typeof StartView === "function");

console.log("\nTEST 1 - the hand-over from the agreements");
{
  fresh(); const nav = [];
  const el = document.createElement("div"); document.body.appendChild(el);
  ThreadView({ navigate: (r) => nav.push(r), back() {} }).mount(el);
  await until(() => nav.length, 3000);
  ok("1a. someone new, agreements done: the conversation hands over to the one-minute start", nav.includes("onboarding/start"), JSON.stringify(nav));
  el.remove();   // one thread view at a time, as in the app (jsdom finds ids document-wide)
  fresh(); store.set("name", "Ash"); store.set("onboarding.threadStartedAt", new Date(Date.now() - 3600000).toISOString()); store.set("onboarding.reachedStep", 6);
  const nav2 = []; const el2 = document.createElement("div"); document.body.appendChild(el2);
  ThreadView({ navigate: (r) => nav2.push(r), back() {} }).mount(el2);
  await wait(600);
  ok("1b. someone part-way through the old conversation carries on there (no hand-over)", !nav2.includes("onboarding/start") && /pick up where we left off/i.test(el2.textContent), JSON.stringify(nav2) + " " + txt(el2).slice(0, 120));
}

console.log("\nTEST 2 - four screens, with the health consent");
fresh();
let S = await openStart();
ok("2a. screen 1: the name, in one short line", S.h1() === "Hi. What should I call you?" && /1 of 4/.test(txt(S.el)) && !!S.q("#st-name") && !S.q("[data-st-back]"), txt(S.el).slice(0, 160));
S.q("#st-name").value = "  Sam  "; click(S.q("[data-st-next]")); await wait(10);
ok("2b. Next saves the name (trimmed) and moves to screen 2", store.get("name") === "Sam" && S.h1() === "Anything sore at the moment?" && /2 of 4/.test(txt(S.el)), S.h1());
const chips = S.qa("[data-area]");
ok("2c. screen 2: the pain areas, as the conditions sheet lists them, with the scope statement word for word", chips.length === START_AREAS.length && START_AREAS.length === CONDITIONS.filter(c => ["lower","back","upper"].includes(c.area)).length && !!S.q("[data-scope-statement]"), chips.length);
ok("2d. nothing picked: the button says Nothing sore", txt(S.q("[data-st-next]")) === "Nothing sore");
click(S.q('[data-area="lower-back"]')); click(S.q('[data-area="knee"]')); await wait(5);
ok("2e. tapping areas writes conditions, aria-pressed follows, button says Next", JSON.stringify(store.get("conditions")) === JSON.stringify(["lower-back","knee"]) && S.q('[data-area="knee"]').getAttribute("aria-pressed") === "true" && txt(S.q("[data-st-next]")) === "Next", JSON.stringify(store.get("conditions")));
click(S.q('[data-area="knee"]')); await wait(5);
ok("2f. tapping again takes it off", JSON.stringify(store.get("conditions")) === JSON.stringify(["lower-back"]));
click(S.q('[data-area="knee"]')); click(S.q("[data-st-next]")); await wait(10);
ok("2g. screen 3: where, then So I keep it safe", S.h1() === "Where will you move?" && /3 of 4/.test(txt(S.el)) && S.qa("[data-place]").length === 4 && /So I keep it safe/.test(txt(S.el)), txt(S.el).slice(0, 200));
click(S.q("[data-st-next]")); await wait(10);
ok("2h. Next with no place: stays, says why", S.h1() === "Where will you move?" && S.q("#st-need") && !S.q("#st-need").hidden);
click(S.q('[data-place="gym"]')); await wait(10);
ok("2i. Gym writes the full gym, as the equipment step's Full gym", JSON.stringify(store.get("gymEquipment")) === JSON.stringify(FULL_GYM) && JSON.stringify(store.get("equipment")) === JSON.stringify(FULL_GYM) && store.get("sessionLocation") === "gym" && (store.get("homeEquipment") || []).length === 0);
const radio = (k, v) => { const r = S.q(`input[name="st-${k}"][value="${v}"]`); if (r) { r.checked = true; r.dispatchEvent(new dom.window.Event("change", { bubbles: true })); } return !!r; };
ok("2j. no leg question until the chair answer asks for it", !S.q('input[name="st-legPower"]'));
radio("chairRise", "not-easily"); await wait(10);
ok("2k. chair Not easily writes it, sets askedAt, and asks the leg question", store.get("capability.chairRise") === "not-easily" && !!store.get("capability.askedAt") && !!S.q('input[name="st-legPower"]'));
radio("legPower", "limited"); radio("floorAccess", "not-comfortably"); radio("balanceWorry", "sometimes"); await wait(5);
ok("2l. leg, floor and balance answers written with the old conversation's values", store.get("capability.legPower") === "limited" && store.get("capability.floorAccess") === "not-comfortably" && store.get("capability.balanceWorry") === "sometimes");
const prof = store.capabilityProfile();
ok("2m. the answers reach the safety rules (careful profile: chair hard, ceiling 2)", prof.asked === true && prof.chairHard === true && prof.ceilingCap === 2, JSON.stringify(prof));
radio("chairRise", "yes"); await wait(10);
ok("2n. chair back to Yes: the leg question goes and its answer is cleared", !S.q('input[name="st-legPower"]') && store.get("capability.legPower") === null);
click(S.q("[data-st-next]")); await wait(10);
ok("2o. screen 4: the first session, in their words", S.h1() === "Your first session, Sam" && /4 of 4/.test(txt(S.el)) && /Gentle, at the gym, working around your lower back and knee\./i.test(txt(S.el)), txt(S.el).slice(0, 200));
ok("2p. not onboarded until a button on screen 4 is pressed", store.get("onboardingComplete") !== true);
click(S.q("[data-st-back]")); await wait(5);
ok("2q. Back returns a screen, answers kept", S.h1() === "Where will you move?" && S.q('[data-place="gym"]').getAttribute("aria-pressed") === "true" && S.q('input[name="st-chairRise"][value="yes"]').checked);
click(S.q("[data-st-next]")); await wait(5);
click(S.q("[data-st-go]")); await wait(10);
ok("2r. Show me my session: onboarded, flow short, Today's plan asked for a gentle whole body at the gym", store.get("onboardingComplete") === true && store.get("onboarding.flow") === "short" && !!store.get("onboarding.threadCompletedAt") && store.get("requestedSessionType") === "full" && store.get("requestedLocation") === "gym" && store.get("availableTimeToday")?.cat === "quick" && S.nav.includes("coach-proposal"), JSON.stringify({ nav: S.nav, f: store.get("onboarding.flow"), len: store.get("availableTimeToday") }));
// v2 (Wave 8): the card and Today's plan agree on the length; Today's plan says it is the first session, not "You asked for".
ok("2r2. the card says About 20 minutes, the length asked (quick, 20 minutes)", /About 20 minutes/.test(readFileSync(new URL("../js/views/onboarding/start.js", import.meta.url), "utf8")));
const cpSrc = readFileSync(new URL("../js/views/coach-proposal.js", import.meta.url), "utf8");
ok("2r3. Today's plan's first sentence for it: Your first session: whole body, gentle, about N minutes (never You asked for)", /req === 'full' && store\.get\('onboarding\.flow'\) === 'short'[\s\S]{0,260}`Your first session: whole body, gentle, about \$\{total\} minutes\.`/.test(cpSrc));
ok("2s. the first session is built gentle (light) because nothing said otherwise", store.declaredLevel() === "light");
ok("2t. the red-flag questions are due before that first session (the guard asks them)", RFv.redFlagDue() === true && RFv.guardRoute("workout") !== "workout", String(RFv.guardRoute("workout")));
ok("2u. nothing the old conversation asked later was written here", store.get("lifestyle.activityLevel") == null && (store.get("goals") || []).length === 0 && store.get("ageBand") == null && store.get("capability.bothFeet") == null);

console.log("\nTEST 3 - Not now, and the words");
fresh(); S = await openStart();
click(S.q("[data-st-next]")); await wait(5); click(S.q("[data-st-next]")); await wait(5);
click(S.q('[data-place="outside"]')); await wait(5); click(S.q("[data-st-next]")); await wait(5);
ok("3a. no name: screen 4 says no name; Outside is said as no kit needed", S.h1() === "Your first session" && /Gentle, no kit needed\./.test(txt(S.el)) && store.get("sessionLocation") === "home", txt(S.el).slice(0, 160));
click(S.q("[data-st-go]")); await wait(5);
ok("3a2. Outside, then Show me my session: Today's plan is asked for outside (v2, Wave 8)", store.get("requestedLocation") === "outside");
fresh(); S = await openStart();
click(S.q("[data-st-next]")); await wait(5); click(S.q("[data-st-next]")); await wait(5);
click(S.q('[data-place="outside"]')); await wait(5); click(S.q("[data-st-next]")); await wait(5);
click(S.q("[data-st-home]")); await wait(5);
ok("3b. Not now: onboarded, flow short, Home", store.get("onboardingComplete") === true && store.get("onboarding.flow") === "short" && S.nav.includes("today") && store.get("requestedSessionType") == null);
let over = [];
for (const s of ["name", "sore", "where", "ready"]) {} // measured below on real screens
fresh(); S = await openStart();
const lead = () => { const b = S.el.querySelector(".st-body"); const h = txt(b.querySelector("h1")), l = txt(b.querySelector(".st-line")); return words(h + " " + l); };
const counts = [];
counts.push(lead()); click(S.q("[data-st-next]")); await wait(5);
counts.push(lead()); click(S.q("[data-st-next]")); await wait(5);
counts.push(words(S.h1())); click(S.q('[data-place="home"]')); await wait(5); click(S.q("[data-st-next]")); await wait(5);
counts.push(lead());
ok("3c. every screen says at most 15 words before its first control (heading and line)", counts.every(n => n <= 15), JSON.stringify(counts));

console.log("\nTEST 4 - health answers declined: nothing health-related asked");
fresh(false); S = await openStart();
ok("4a. 1 of 3", /1 of 3/.test(txt(S.el)));
click(S.q("[data-st-next]")); await wait(5);
ok("4b. the sore-area screen is skipped; screen 2 is where, with no ability questions", S.h1() === "Where will you move?" && /2 of 3/.test(txt(S.el)) && !/So I keep it safe/.test(txt(S.el)) && !S.q('input[name="st-chairRise"]'));
click(S.q('[data-place="home"]')); await wait(5); click(S.q("[data-st-next]")); await wait(5);
ok("4c. screen 3: the first session", /Your first session/.test(S.h1()) && /3 of 3/.test(txt(S.el)));
click(S.q("[data-st-go]")); await wait(5);
ok("4d. the careful profile still applies (declined, ability never asked)", store.capabilityProfile().careful === true && (store.get("conditions") || []).length === 0);

console.log("\nTEST 5 - guards");
fresh(); store.completeOnboarding(); S = await openStart();
ok("5a. already onboarded: sent Home", S.nav.includes("today"));
localStorage.clear(); store.init(); S = await openStart();
ok("5b. not agreed: sent to the agreements", S.nav.includes("onboarding/thread"));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
