/**
 * tools/verify-w6-chair-class.mjs
 * 17 Oct 2026 v1
 *
 * Stage W6, session 2 (Graeme, 17 Oct: "Let's start wave 6").
 *
 * W6-3 CHAIR-STANCES (Wave 6, persona 2.11; the clinical reviewer to
 *   confirm). Held bent-knee or wide stances (Warrior I and II, Triangle,
 *   Crescent Lunge, Standing Adductor Stretch: the library's heldStance)
 *   reached somebody who gets up from a chair "not easily" in nearly every
 *   Mobility build: chair-legs.js read only the squat/lunge pattern and
 *   names. Graeme's rule (02 Oct, W5-7): no squats or lunges of any kind
 *   when getting up from a chair is tricky. A held lunge is a lunge. And
 *   Warrior I says it needs balance: tagged so.
 *
 * W6-4 CLASS-FLOOR-BALANCE (2.11, 2.1). Classes offered floor classes and
 *   a balance move to somebody who said floor "not comfortably" and
 *   balance "sometimes": classSafety read sore areas and the chair only.
 *   It now reads the same capability answers the builder does (floor,
 *   balance), a beat with a safe route round still allowed. After Delete
 *   my health answers, Settings promises careful planning ("nothing with
 *   impact"): Run no longer offers Intervals then, and Classes follows the
 *   careful answers through the same capability profile.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><div id="main-content"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { buildSession, SESSION_TYPES } = await import(B + "session-builder.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");
const { isSquatOrLunge } = await import(B + "data/chair-legs.js");
const CL = await import(B + "data/classes/index.js");
const run = await import(B + "views/running-session.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const ASKED = "2026-10-01T08:00:00.000Z";
function person(capability) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "T"); store.set("tier", "personal");
  store.set("conditions", []); store.set("conditionPainScores", {});
  store.set("capability", capability);
}
const byId = new Map(EXERCISES.map(e => [e.id, e]));
const HELD = EXERCISES.filter(e => e.heldStance === true);

console.log("\nTEST 1 - W6-3: chair 'not easily', legs full: no held lunge or wide stance");
ok("1pc. the library flags held stances", HELD.length >= 5, HELD.map(e => e.id).join());
ok("1a. a held stance counts as a squat or lunge", HELD.every(e => isSquatOrLunge(e)), HELD.filter(e => !isSquatOrLunge(e)).map(e => e.name).join());
const w1 = EXERCISES.find(e => e.name === "Warrior I");
ok("1b. Warrior I is tagged as needing balance (its own words)", w1?.balanceDemand === true);
const HARD = { chairRise: "not-easily", floorAccess: "yes", bothFeet: "no", balanceWorry: "no", legPower: "full", askedAt: ASKED };
person(HARD);
const types = SESSION_TYPES.map(t => t.id);
let seen = [];
for (const t of types) for (let i = 0; i < 50; i++) {
  const s = buildSession({ sessionType: t, durationMins: 30, equipmentOverride: [], preset: null });
  for (const e of (s?.exercises || [])) if (byId.get(e.id)?.heldStance) seen.push(`${t}:${e.name}`);
}
ok(`1c. 50 builds of each of ${types.length} kinds: none`, seen.length === 0, [...new Set(seen)].slice(0, 6).join(", "));
person({ ...HARD, chairRise: "yes" });
let control = 0;
for (let i = 0; i < 50; i++) for (const e of (buildSession({ sessionType: "mobility", durationMins: 30, equipmentOverride: [], preset: null })?.exercises || [])) if (byId.get(e.id)?.heldStance) control++;
ok("1pc2. CONTROL: chair 'yes', the same stances still come", control > 0, String(control));

console.log("\nTEST 2 - W6-4: floor 'not comfortably', balance 'sometimes': classes");
const beatsOf = cls => CL.movementBeats(cls);
const unsafeFor = (cap) => cls => beatsOf(cls).some(b => {
  const bad = id => { const e = byId.get(id); return !e || (!cap.floor && e.position === "floor") || (!cap.balance && e.balanceDemand === true); };
  if (!bad(b.exerciseId)) return false;
  return ![b.seatedAlternativeId, b.easierRouteId].filter(Boolean).some(id => !bad(id));
});
person({ chairRise: "yes", floorAccess: "no", bothFeet: "no", balanceWorry: "sometimes", legPower: "full", askedAt: ASKED });
const offered = CL.getClasses();
const wrong = offered.filter(unsafeFor({ floor: false, balance: false }));
ok("2pc. there are classes a floor or balance answer should hold", CL.CLASSES.some(unsafeFor({ floor: false, balance: false })));
ok("2a. none offered with a floor or balance move and no way round it", wrong.length === 0, wrong.map(c => c.title || c.name || c.id).join(", "));
ok("2b. a held class says why (named under Not today)", CL.CLASSES.filter(unsafeFor({ floor: false, balance: false })).every(c => CL.classSafety(c).blockedBy.length > 0));
person({ chairRise: "yes", floorAccess: "yes", bothFeet: "yes", balanceWorry: "no", legPower: "full", askedAt: ASKED });
ok("2pc2. CONTROL: floor and balance fine: those classes are offered", CL.CLASSES.filter(unsafeFor({ floor: false, balance: false })).every(c => CL.classSafety(c).offer));

console.log("\nTEST 3 - W6-4: after Delete my health answers, careful planning reaches Run and Classes");
person({ chairRise: null, floorAccess: null, bothFeet: null, balanceWorry: null, legPower: null, askedAt: null, clearedAt: new Date().toISOString() });
ok("3pc. the careful profile is in force", store.capabilityProfile().careful === true);
const main = document.getElementById("main-content");
main.innerHTML = run.render(); try { run.onMount(); } catch {}
const runText = (main.textContent || "").replace(/\s+/g, " ");
ok("3a. Run: no Intervals", !/\bIntervals\b/.test([...main.querySelectorAll("button")].map(b => b.textContent).join(" ")), runText.slice(0, 200));
ok("3b. Run says why", /Intervals are off/i.test(runText));
ok("3c. Classes: nothing with a floor or balance move and no way round it", CL.getClasses().filter(unsafeFor({ floor: false, balance: false })).length === 0);
person({ chairRise: "yes", floorAccess: "yes", bothFeet: "yes", balanceWorry: "no", legPower: "full", askedAt: ASKED });
main.innerHTML = run.render(); try { run.onMount(); } catch {}
ok("3pc2. CONTROL: answers given: Intervals offered", /\bIntervals\b/.test([...main.querySelectorAll("button")].map(b => b.textContent).join(" ")));

console.log(`\nVERIFY-W6-CHAIR-CLASS: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
