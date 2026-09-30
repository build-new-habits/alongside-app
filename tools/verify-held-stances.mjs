/**
 * tools/verify-held-stances.mjs
 * 30 Sep 2026 v1
 *
 * W3-6 HELD-STANCES (Wave 3, persona 2.11). Somebody whose legs are not
 * loadable (chair "Not easily") and who worries about balance was given
 * Warrior I and II, Triangle and Standing Adductor Stretch: held
 * bent-knee or wide stances, tagged "yoga-pose" or "stretch" at
 * difficulty 1-2, so the leg rule let them through. S1-LEGS already says
 * a hold standing on bent legs is a squat that does not move.
 *
 * Until the physio answers pack section 4, these carry heldStance: true
 * in the library and count as loading the legs. The list is explicit so
 * she can change it by the entry.
 *
 *   1. Exactly the reviewed entries carry the flag.
 *   2. personFilter keeps them from the pack's person; through the real
 *      builder, none reach her.
 *   3. Controls: a fit person still gets them; somebody with limited legs
 *      keeps supported standing work.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} });

const B = new URL("../js/", import.meta.url).href;
const { EXERCISES } = await import(B + "data/exercises/index.js");
const { store } = await import(B + "store.js");
const SB = await import(B + "session-builder.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const words = e => [...(e.instructions || []), e.description || "", ...(e.cues || []), e.setup || ""].join(" | ");
const byId = Object.fromEntries(EXERCISES.map(e => [e.id, e]));

const HELD = ["adductor-stretch-standing", "yoga-warrior-1", "yoga-warrior-2", "yoga-triangle", "yoga-hip-strength", "yoga-crescent-lunge"];

console.log("\nTEST 1 - the reviewed entries, and only those, are held stances");
const flagged = EXERCISES.filter(e => e.heldStance === true).map(e => e.id).sort();
ok("1pc. every named entry exists", HELD.every(id => byId[id]), HELD.filter(id => !byId[id]).join(", "));
ok("1a. exactly those carry heldStance", JSON.stringify(flagged) === JSON.stringify([...HELD].sort()), JSON.stringify(flagged));

console.log("\nTEST 2 - the pack's person");
const KIT = ["dumbbells-light", "yoga-mat", "bands"];
function person(cap) {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", "personal"); store.set("name", "Sam");
  store.set("conditions", []); store.set("conditionPainScores", {});
  store.set("capability", { askedAt: new Date().toISOString(), ...cap });
}
function sweep(runs) {
  const seen = new Set();
  for (const t of SB.SESSION_TYPES) for (let i = 0; i < runs; i++) {
    try { SB.buildSession({ sessionType: t.id, durationMins: 30, equipmentOverride: KIT }).exercises.forEach(x => seen.add(x.id)); } catch {}
  }
  return seen;
}
person({ balanceWorry: "no", chairRise: "not-easily", legPower: null, floorAccess: "yes" });
const f = SB.personFilter({});
ok("2a. personFilter keeps every held stance from limited legs", HELD.every(id => !f(byId[id])), HELD.filter(id => f(byId[id])).join(", "));
const got = [...sweep(25)].filter(id => HELD.includes(id));
ok("2b. through the real builder, none reach her", got.length === 0, got.join(", "));

console.log("\nTEST 3 - controls");
person({ balanceWorry: "no", chairRise: "yes", legPower: "full", floorAccess: "yes" });
const fit = SB.personFilter({});
ok("3a. a fit person may be given them", HELD.every(id => fit(byId[id])), HELD.filter(id => !fit(byId[id])).join(", "));
person({ balanceWorry: "no", chairRise: "not-easily", legPower: null, floorAccess: "yes" });
const lim = SB.personFilter({});
ok("3b. limited legs keep supported standing work", EXERCISES.some(e => e.name === "Supported Calf Raise" && lim(e)));

console.log("");
if (fails) { console.log(`HELD-STANCES: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`HELD-STANCES: all ${passes} assertions pass\n`);
process.exit(0);
