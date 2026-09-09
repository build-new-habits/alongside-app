/**
 * tools/verify-location1.mjs
 * 08 Sep 2026 v1
 *
 * LOCATION-1. A session must not propose kit you do not have where you
 * are.
 *
 * WHAT SHIPPED. buildSession() has no location parameter and never has:
 * location exists ONLY as a selector for which equipment list is used.
 * coach-proposal.js passed `equipmentOverride: null`, which falls back to
 * the flat `equipment` field -- and onboarding/equipment.js writes that
 * field as the UNION of home kit and gym kit.
 *
 * So One to one built every session against both lists at once. Measured
 * with a resistance band at home and a rack at the gym, it proposed a
 * BARBELL BACK SQUAT and a BARBELL DEADLIFT to somebody who might be
 * standing in their kitchen. The default path, not an edge case.
 *
 * `sessionLocation` already existed, already had a writer
 * (checkin-mini.js Step 4, "Where are you now?"), and was read by nothing
 * that builds a session. The wire was left hanging.
 *
 * ── WHY THIS ASSERTS AN INVARIANT, NOT A MOVEMENT LIST ──────────────
 *
 * The generator varies between calls: the same inputs give different
 * exercises. An assertion naming movements would be flaky, and a flaky
 * gate teaches people to re-run it -- the fault found in verify-checkin3
 * and verify-thread1 the same day.
 *
 * The invariant holds every time: EVERY piece of equipment a proposed
 * movement requires must be available where the person said they are.
 * That is the thing that was wrong, stated in a form that cannot flake.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="main-content"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = (q) => ({
  matches: /prefers-reduced-motion/.test(q), media: q,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}
});
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const SB        = await import(B + "session-builder.js");

let fails = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) { if (detail) console.log(`        ${detail}`); fails++; }
};

const HOME = ["resistance-band"];
const GYM  = ["barbell", "squat-rack", "cable-machine", "bench"];

function fixture(location) {
  localStorage.clear();
  store.init();
  store.set("tier", "personal");
  store.set("homeEquipment", HOME);
  store.set("gymEquipment",  GYM);
  // onboarding/equipment.js writes the UNION. This is the field the old
  // code fell back to, and the reason a barbell reached a kitchen.
  store.set("equipment", [...new Set([...GYM, ...HOME])]);
  if (location !== undefined) store.set("sessionLocation", location);
}

/** Kit a movement needs that is NOT in the list it was built against. */
const unavailable = (session, allowed) => {
  const have = new Set(allowed);
  return (session?.exercises || [])
    .filter(ex => (ex.equipment || []).some(item => !have.has(item)))
    .map(ex => `${ex.name} [${(ex.equipment || []).join("/")}]`);
};

// ── 1. THE RESOLVER ─────────────────────────────────────────────────────
console.log("\nTEST 1 - location picks the right list");

fixture();
ok("1a. gym gets the gym list",
   SB.equipmentForLocation("gym").list.join() === GYM.join(),
   JSON.stringify(SB.equipmentForLocation("gym").list));
ok("1b. home gets the home list",
   SB.equipmentForLocation("home").list.join() === HOME.join(),
   JSON.stringify(SB.equipmentForLocation("home").list));

ok("1c. OUTSIDE gets nothing, not the home list",
   SB.equipmentForLocation("outside").list.length === 0,
   "your home dumbbells are not in the park - falling through to the home " +
   "list would propose them there");

ok("1d. null is treated as HOME, the safe direction",
   SB.equipmentForLocation(null).list.join() === HOME.join(),
   "a session built for home can be done at a gym; one built for a gym " +
   "cannot be done at home. Guessing the permissive way is how a barbell " +
   "was proposed to somebody in a kitchen");

// The fallback, and its limit.
localStorage.clear(); store.init();
store.set("homeEquipment", []); store.set("gymEquipment", GYM);
ok("1e. an empty list falls back to the other one",
   SB.equipmentForLocation("home").list.length === GYM.length &&
   SB.equipmentForLocation("home").usingFallback === true,
   "somebody who filled in one list and not the other gets an unexplained " +
   "bodyweight session");
ok("1f. but outside never falls back",
   SB.equipmentForLocation("outside").list.length === 0,
   "empty outside is a fact, not a gap");

// ── 2. THE INVARIANT, ON REAL BUILDS ────────────────────────────────────
console.log("\nTEST 2 - nothing is proposed that you cannot do where you are");

for (const location of ["home", "gym", "outside", null]) {
  fixture(location);
  const kit = SB.equipmentForLocation(location);
  const built = SB.buildSession({
    sessionType: "lower", durationMins: 30,
    equipmentOverride: kit.list, preset: null
  });

  ok(`2pc-${location}. positive control: a session was built`,
     !!built && (built.exercises || []).length > 0,
     "nothing built, so the assertion below measures nothing");

  const bad = unavailable(built, kit.list);
  ok(`2-${location}. every movement is doable there`,
     bad.length === 0,
     `proposed with kit not available at "${location}": ${bad.join("; ")}`);
}

// ── 3. THE GYM USER DOES NOT LOSE THEIR KIT ─────────────────────────────
console.log("\nTEST 3 - scoping down does not flatten everybody to bodyweight");

// The other way this could go wrong: defaulting everyone to home and
// quietly taking the rack away from somebody standing in front of it.
fixture("gym");
let sawGymKit = false;
for (let i = 0; i < 6; i++) {
  const s = SB.buildSession({
    sessionType: "lower", durationMins: 30,
    equipmentOverride: SB.equipmentForLocation("gym").list, preset: null
  });
  if ((s?.exercises || []).some(ex => (ex.equipment || []).some(k => GYM.includes(k)))) {
    sawGymKit = true; break;
  }
}
// Six attempts because the generator varies; one bodyweight-only build is
// legitimate, six in a row would mean the gym list is not reaching it.
ok("3a. a gym session uses gym kit", sawGymKit,
   "six builds at the gym and not one used the rack - the scoping has " +
   "taken the equipment away from the person standing in front of it");

// ── 4. THE OLD BEHAVIOUR IS GONE ────────────────────────────────────────
console.log("\nTEST 4 - the union field is no longer what a session is built from");

fixture("home");
const union = store.get("equipment");
ok("4pc. positive control: the union field still holds both lists",
   union.length === GYM.length + HOME.length,
   `the fixture is wrong: ${JSON.stringify(union)}`);

const atHome = SB.buildSession({
  sessionType: "lower", durationMins: 30,
  equipmentOverride: SB.equipmentForLocation("home").list, preset: null
});
const gymKitAtHome = (atHome?.exercises || [])
  .filter(ex => (ex.equipment || []).some(k => GYM.includes(k)))
  .map(ex => ex.name);
ok("4a. a home session contains no gym-only kit",
   gymKitAtHome.length === 0,
   `at home, holding only a resistance band, it proposed: ${gymKitAtHome.join(", ")}`);

// ── 5. THE ROUTE, NOT JUST THE RESOLVER ─────────────────────────────────
console.log("\nTEST 5 - the PROPOSAL itself honours where you are");

// Tests 1-4 call equipmentForLocation() and buildSession() directly.
// That proves the resolver and proves NOTHING about the wiring: reverting
// coach-proposal.js to `equipmentOverride: null` -- the exact defect --
// left every one of them green.
//
// Second time in two features. The same gap was found in verify-saved1
// on the same day, where reverting the edit route left its test 7 green.
// A gate that verifies a function while the screen calls a different one
// is the source-text problem wearing a fixture's clothes.

dom.window.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
Object.defineProperty(globalThis, "requestAnimationFrame",
  { value: dom.window.requestAnimationFrame, configurable: true, writable: true });

const { CoachProposalView } = await import(B + "views/coach-proposal.js");
const main = document.getElementById("main-content");

async function proposeAt(location) {
  fixture(location);
  store.set("name", "Graeme");
  main.innerHTML = "";
  CoachProposalView({ navigate: () => {} }).mount(main);
  // Wait for the build rather than betting on a clock.
  for (let waited = 0; waited < 8000; waited += 25) {
    if (main.querySelector(".cp-preview-card__name")) break;
    await new Promise(r => setTimeout(r, 25));
  }
  return main;
}

await proposeAt("home");

ok("5pc. positive control: the proposal rendered options",
   !!main.querySelector(".cp-preview-card__name"),
   "no options on screen - everything below measures nothing");

ok("5a. it shows where it thinks you are",
   /At home/.test(main.textContent || ""),
   "the assumption is not on the screen, so nobody can tell it is wrong");

ok("5b. and offers a way to say otherwise",
   !!main.querySelector("#cp-loc"),
   'Graeme: "It works though. I can\'t change anything though if I wanted to."');

ok("5c. the control says what it changes, not just its value",
   /^Where: /.test(main.querySelector("#cp-loc")?.getAttribute("aria-label") || ""),
   `announced as "${main.querySelector("#cp-loc")?.getAttribute("aria-label")}"`);

ok("5d. and the screen has an h1 to orient from",
   !!main.querySelector("h1"),
   "the outline began at h2 - somebody navigating by heading meets this " +
   "page with no top level. WCAG 2.2 AA 1.3.1");

// THE ONE. Read off the options the proposal actually built.
const proposedAtHome = [...document.querySelectorAll(".cp-preview-card")].length;
ok("5e. positive control: options were built to inspect", proposedAtHome > 0);

// Started, and the SESSION THE VIEW HANDED OVER is inspected.
//
// The first version of this assertion re-ran buildSession() itself with
// the store as the view left it. That is not the route: it would have
// passed with `equipmentOverride: null` still in coach-proposal.js,
// because the assertion was building its own correct session and then
// checking that one. Reversal testing is what showed it up.
async function startAndInspect() {
  const card = main.querySelector("[data-option-id]");
  if (!card) return null;
  card.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
  const start = main.querySelector("#cp-preview-start");
  if (!start || start.hasAttribute("disabled")) return null;
  start.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
  for (let waited = 0; waited < 4000; waited += 25) {
    const g = store.get("generatedSession");
    if (g && g.session) return g.session;
    await new Promise(r => setTimeout(r, 25));
  }
  return null;
}

// OUTSIDE, deliberately, and this is the point.
//
// A first attempt asserted "no gym kit at home" and passed even with the
// defect restored -- because chooseSessionType() picked a hip session
// whose pool holds no barbell work, so the union never showed itself.
// The assertion was right and the fixture could not exercise it.
//
// Outside admits NO equipment at all, so any item on any movement is a
// violation whichever type the coach picks. It is the one location where
// the assertion cannot be dodged by the luck of the draw.
await proposeAt("outside");

ok("5f-pc. positive control: the proposal rendered at outside",
   !!main.querySelector(".cp-preview-card__name"),
   "no options - the assertions below measure nothing");

ok("5f. it says so on the screen",
   /Outside/.test(main.textContent || ""),
   "the assumption is not shown, so nobody can tell it is wrong");

const outsideSession = await startAndInspect();
ok("5g-pc. positive control: a session was handed over to inspect",
   !!outsideSession && (outsideSession.exercises || []).length > 0,
   "Start produced no session");

const carried = (outsideSession?.exercises || [])
  .filter(ex => (ex.equipment || []).length > 0)
  .map(ex => `${ex.name} [${(ex.equipment || []).join("/")}]`);

ok("5h. AND EVERY MOVEMENT IN IT NEEDS NOTHING",
   carried.length === 0,
   `outside, with nothing to hand, One to one handed over: ${carried.join("; ")}. ` +
   `This is the defect: equipmentOverride null falls back to the flat ` +
   `\`equipment\` field, which onboarding writes as the UNION of home and ` +
   `gym kit -- so the room proposes whatever you own, wherever you are`);

console.log(fails === 0
  ? "\nLOCATION-1: all assertions pass\n"
  : `\nLOCATION-1: ${fails} FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
