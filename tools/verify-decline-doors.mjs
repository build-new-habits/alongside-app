/**
 * tools/verify-decline-doors.mjs
 * 02 Oct 2026 v1
 *
 * W5-8 DECLINE-DOORS (Wave 5 persona trace: 2.14, 2.4). Decided by Graeme,
 * 02 Oct: "Second chance, then one routine". Explain again, plainly, that
 * the answers stay on this phone; if still no, one gentle full-body routine
 * that rotates, with no health questions and nothing tailored.
 *
 * Before: with the health consent declined, every coach door ended on the
 * consent screen and Not now went Home, so the next tap asked again with no
 * reason given; Yoga said "Nothing here fits what you've told me" to
 * somebody who had told it nothing; a careful Full Body held no movements;
 * Settings said "you deleted these answers" to somebody who had declined.
 *
 * Through the real router:
 *   1. Declined in getting started, a coach door: the consent screen; Not
 *      now opens a second screen saying the answers stay on this phone,
 *      with the way back to the tick and the gentle routine.
 *   2. Back to the tick: the tick again.
 *   3. The gentle routine: the player opens on it; at least five
 *      movements; none on the floor, none with impact, no squat or lunge;
 *      said on screen why it is the same for anyone; the second no kept.
 *   4. After that every door that builds a session gives the routine,
 *      with no consent screen and no check-in question; the journal still
 *      asks for the consent.
 *   5. It rotates: tomorrow's is not today's.
 *   6. Words: no "you deleted" after a decline; no "what you've told me".
 *   7. Controls: given, the check-in opens; given after the second no, the
 *      routine stops.
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
const { EXERCISES } = await import(B + "data/exercises/index.js");
const HC = await import(B + "data/health-consent.js");

function fixture(declined = true) {
  localStorage.clear(); store.init(); agreed(store);
  if (declined) HC.declineHealthConsent();
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Robin"); store.set("tier", "personal");
  store.set("equipment", []); store.set("homeEquipment", []);
  store.set("conditions", []); store.set("conditionPainScores", {});
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  router.history = []; router.currentView = null;
}
async function go(view) { await router.navigate(view); await wait(60); }
const onView = () => router.currentView;
const btn = re => [...main.querySelectorAll("button")].find(b => re.test(txt(b)) && !b.disabled);
const SQUAT_LUNGE = /squat|lunge|split[- ]squat|step[- ]?up|step[- ]?down|wall sit/i;

// ── 1. THE SECOND SCREEN ────────────────────────────────────────────────
console.log("\nTEST 1 - Not now opens a second screen");
fixture();
await go("today"); await go("checkin");
ok("1pc. a coach door after a decline: the consent screen", onView() === "health-consent", onView());
click(btn(/^Not now$/)); await wait(60);
const second = txt(main);
ok("1a. still on the consent screen, not Home", onView() === "health-consent", onView());
ok("1b. it says, plainly, that the answers stay on this phone", /stay on this phone/i.test(second) && /never sent|not sent|isn.t sent/i.test(second), second.slice(0, 300));
ok("1c. the way back to the tick, and the gentle routine", !!btn(/tick/i) && !!btn(/gentle routine/i), second.slice(0, 400));

// ── 2. BACK TO THE TICK ─────────────────────────────────────────────────
console.log("\nTEST 2 - back to the tick");
click(btn(/tick/i)); await wait(40);
ok("2a. the tick again", !!main.querySelector("#hc-check") && !!btn(/^Not now$/), txt(main).slice(0, 200));

// ── 3. THE GENTLE ROUTINE ───────────────────────────────────────────────
console.log("\nTEST 3 - the gentle routine");
click(btn(/^Not now$/)); await wait(40);
click(btn(/gentle routine/i)); await wait(120);
const s = store.get("generatedSession")?.session;
const full = (s?.exercises || []).map(e => EXERCISES.find(x => x.id === e.id) || e);
ok("3a. the player opens on the routine's first movement", onView() === "workout" && !!s?.general && txt(main).includes(full[0]?.name || "--"), `${onView()} | ${txt(main).slice(0, 160)}`);
ok("3b. at least five movements", full.length >= 5, String(full.length));
const unsafe = full.filter(e => e.position === "floor" || e.impact || e.balanceDemand || SQUAT_LUNGE.test(e.name) || ["squat", "lunge"].includes(e.movementPattern)).map(e => e.name);
ok("3c. none on the floor, none with impact or balance, no squat or lunge", unsafe.length === 0, unsafe.join(", "));
ok("3d. the screen says it is the same for anyone, and why", /same/i.test(txt(main)) && /health answers/i.test(txt(main)), txt(main).slice(0, 300));
ok("3e. the second no is kept", !!store.get("consent")?.health?.confirmedNoAt && store.get("consent")?.health?.given !== true, JSON.stringify(store.get("consent")?.health));

// ── 4. EVERY DOOR ───────────────────────────────────────────────────────
console.log("\nTEST 4 - every door that builds a session gives the routine");
for (const door of ["checkin", "checkin-mini", "coach-proposal", "session-builder", "know-what", "yoga-session", "core-session"]) {
  await go("today"); await go(door);
  const here = txt(main);
  ok(`4a-${door}. the routine, no consent screen, no question`, onView() === "workout" && store.get("generatedSession")?.session?.general === true &&
     !/How.s your energy|Anything hurting|Before I keep/i.test(here), `${onView()} | ${here.slice(0, 140)}`);
}
await go("today"); await go("journal-entry");
ok("4b. the journal still asks for the consent", onView() === "health-consent", onView());

// ── 5. ROTATION ─────────────────────────────────────────────────────────
console.log("\nTEST 5 - it rotates");
const GR = await import(B + "data/general-routine.js");
const ids = d => GR.generalRoutine(new Date(2026, 9, d, 9)).exercises.map(e => e.id).join(",");
ok("5a. tomorrow's is not today's", ids(3) !== ids(4) && ids(4) !== ids(5), `${ids(3)} | ${ids(4)}`);
ok("5b. the same day gives the same one", ids(3) === GR.generalRoutine(new Date(2026, 9, 3, 18)).exercises.map(e => e.id).join(","));

// ── 6. WORDS ────────────────────────────────────────────────────────────
console.log("\nTEST 6 - true words after a decline");
fixture();
HC.giveHealthConsent();
await go("today"); await go("coach-proposal");
const set6 = txt(main);
ok("6pc. consent given after a decline: What your body can do first", onView() === "settings", onView());
ok("6a. not \"you deleted these answers\"", !/you deleted/i.test(set6), set6.slice(0, 300));
fixture();
await go("today"); await go("yoga-session");
ok("6b. no \"what you've told me\" to somebody who has told nothing", !/what you.ve told me/i.test(txt(main)), txt(main).slice(0, 200));

// ── 7. CONTROLS ─────────────────────────────────────────────────────────
console.log("\nTEST 7 - controls");
fixture(false);
await go("today"); await go("checkin");
ok("7a. consent given: the check-in opens", onView() === "checkin", onView());
fixture();
await go("today"); await go("checkin");
click(btn(/^Not now$/)); await wait(40); click(btn(/gentle routine/i)); await wait(80);
HC.giveHealthConsent();
store.set("capability", { askedAt: new Date().toISOString(), floorAccess: "yes", chairRise: "yes", balanceWorry: "no", bothFeet: "no", legPower: null });
await go("today"); await go("checkin");
ok("7b. given after the second no: the check-in again, not the routine", onView() === "checkin", onView());

console.log("");
if (fails) { console.log(`DECLINE-DOORS: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`DECLINE-DOORS: all ${passes} assertions pass\n`);
process.exit(0);
