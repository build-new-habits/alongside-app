/**
 * tools/verify-my-move-schema.mjs
 * 23 Nov 2026 v2
 *
 * v2 - S3 (store.js v126): myMove.day { date, mode } or null, today's word
 *   from Home (It's a hard day / Show my usual Home). Defaults and 3l-3n.
 *
 * P-39 MAKING MY MOVE, S1 SCHEMA (store.js v125, Schema v1.127; spec
 * docs/specs/alongside_making-my-move_23nov2026_v1.md section 7).
 *
 *   0  Positive control: the fixture reaches the store.
 *   1  Defaults: myMove as the spec says.
 *   2  An older phone (no myMove) loads the default.
 *   3  Every key is cleaned on its own, as the spec's table says.
 *   4  setMyMove() merges, cleans and saves; nothing else is touched.
 *   5  What is saved survives a reload, and Restore carries it.
 *   6  Reversal: with the cleaning switched off, test 3 would fail
 *      (proves the checks read the cleaned value, not the input).
 *
 * Red on alongside-v722 (no myMove, no cleanMyMove, no setMyMove).
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><body><div id="app"><main id="main-content"></main></div></body>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} });
dom.window.scrollTo = () => {}; dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history; globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const J = v => JSON.stringify(v);
const saved = () => JSON.parse(localStorage.getItem(store.STORAGE_KEY));
function load(s) { localStorage.clear(); localStorage.setItem(store.STORAGE_KEY, JSON.stringify(s)); store.init(); }
const DEF = { step: null, made: null, purposes: [], most: null, goodDay: "few", hardDay: ["coach"], dismissed: [], day: null };

console.log("\nTEST 0 - positive control");
load({ onboardingComplete: true, name: "Sentinel-39" });
ok("0a. the fixture reached the store", store.get("name") === "Sentinel-39", store.get("name"));

console.log("\nTEST 1 - defaults");
ok("1a. myMove defaults as the spec says", J(store.getDefaults().myMove) === J(DEF), J(store.getDefaults().myMove));

console.log("\nTEST 2 - an older phone");
load({ onboardingComplete: true, name: "Older" });
ok("2a. no myMove loads the default", J(store.get("myMove")) === J(DEF), J(store.get("myMove")));
load({ onboardingComplete: true, myMove: "nonsense" });
ok("2b. a myMove that is not an object loads the default", J(store.get("myMove")) === J(DEF), J(store.get("myMove")));

console.log("\nTEST 3 - each key cleaned on its own");
const GOOD = { step: "good", made: "2026-11-23T09:41:00.000Z", purposes: ["stronger", "stretch", "instep"], most: "stretch", goodDay: "one", hardDay: ["stretch", "walk"], dismissed: ["feel"], day: { date: "2026-11-23", mode: "hard" } };
load({ onboardingComplete: true, myMove: GOOD });
ok("3a. a well-formed myMove is kept exactly", J(store.get("myMove")) === J(GOOD), J(store.get("myMove")));
load({ onboardingComplete: true, myMove: { ...GOOD, step: "summary" } });
ok("3b. an unknown step loads as null", store.get("myMove").step === null && store.get("myMove").goodDay === "one", J(store.get("myMove")));
load({ onboardingComplete: true, myMove: { ...GOOD, made: "yesterday" } });
ok("3c. a made that is not a date-time loads as null", store.get("myMove").made === null, J(store.get("myMove").made));
load({ onboardingComplete: true, myMove: { ...GOOD, purposes: ["stronger", "stronger", "gym", 4, "calm"] } });
ok("3d. purposes: unknown and repeated ids dropped", J(store.get("myMove").purposes) === J(["stronger", "calm"]), J(store.get("myMove").purposes));
ok("3e. most not among purposes loads as null", store.get("myMove").most === null, J(store.get("myMove").most));
load({ onboardingComplete: true, myMove: { ...GOOD, goodDay: "some" } });
ok("3f. an unknown goodDay loads as 'few'", store.get("myMove").goodDay === "few", J(store.get("myMove").goodDay));
load({ onboardingComplete: true, myMove: { ...GOOD, hardDay: ["coach", "walk", "calm"] } });
ok("3g. more than two hard-day choices keep the first two", J(store.get("myMove").hardDay) === J(["coach", "walk"]), J(store.get("myMove").hardDay));
load({ onboardingComplete: true, myMove: { ...GOOD, hardDay: ["walk", "rest"] } });
ok("3h. rest with another loads as rest alone", J(store.get("myMove").hardDay) === J(["rest"]), J(store.get("myMove").hardDay));
load({ onboardingComplete: true, myMove: { ...GOOD, hardDay: ["nap", "walk", "walk"] } });
ok("3i. unknown and repeated hard-day ids dropped", J(store.get("myMove").hardDay) === J(["walk"]), J(store.get("myMove").hardDay));
load({ onboardingComplete: true, myMove: { ...GOOD, hardDay: [] } });
ok("3j. an empty hard day is kept empty (the coach's pick is the screen's fallback)", J(store.get("myMove").hardDay) === J([]), J(store.get("myMove").hardDay));
load({ onboardingComplete: true, myMove: { ...GOOD, dismissed: ["calm", "feel", "feel", "yoga"] } });
ok("3k. dismissed keeps door ids only, once", J(store.get("myMove").dismissed) === J(["feel"]), J(store.get("myMove").dismissed));

load({ onboardingComplete: true, myMove: { ...GOOD, day: { date: "23 Nov", mode: "hard" } } });
ok("3l. a day whose date is not a local date loads as null", store.get("myMove").day === null, J(store.get("myMove").day));
load({ onboardingComplete: true, myMove: { ...GOOD, day: { date: "2026-11-23", mode: "tired" } } });
ok("3m. a day with an unknown mode loads as null", store.get("myMove").day === null, J(store.get("myMove").day));
load({ onboardingComplete: true, myMove: { ...GOOD, day: { date: "2026-11-23", mode: "usual", extra: 1 } } });
ok("3n. a good day keeps only date and mode", J(store.get("myMove").day) === J({ date: "2026-11-23", mode: "usual" }), J(store.get("myMove").day));

console.log("\nTEST 4 - setMyMove");
load({ onboardingComplete: true, name: "Writer", myMove: GOOD });
store.setMyMove({ goodDay: "all", hardDay: ["rest", "walk"] });
const after = store.get("myMove");
ok("4a. the patch is merged", after.goodDay === "all" && J(after.purposes) === J(GOOD.purposes), J(after));
ok("4b. the patch is cleaned (rest alone)", J(after.hardDay) === J(["rest"]), J(after.hardDay));
ok("4c. it is saved to the phone", J(saved().myMove) === J(after), J(saved().myMove));
ok("4d. nothing else is touched", saved().name === "Writer", saved().name);
store.setMyMove(null);
ok("4e. a patch that is not an object changes nothing", J(store.get("myMove")) === J(after), J(store.get("myMove")));

console.log("\nTEST 5 - reload and Restore");
const kept = store.get("myMove");
store.init();
ok("5a. what is saved survives a reload", J(store.get("myMove")) === J(kept), J(store.get("myMove")));
let carried = null;
try {
  const R = await import(B + "data/restore.js");
  const pick = R.pickRestorable || R.restorablePart || null;
  if (typeof pick === "function") carried = pick({ ...saved() });
} catch (e) { carried = null; }
if (carried) ok("5b. Restore carries myMove", J(carried.myMove) === J(kept), J(carried && carried.myMove));
else {
  const src = (await import("node:fs")).readFileSync(new URL("../js/data/restore.js", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
  ok("5b. Restore does not drop myMove (no delete of it in restore.js)", !/delete\s+\w+\.myMove/.test(src), "restore.js deletes myMove");
}

console.log("\nTEST 6 - reversal: the checks read the cleaned value");
const real = store.cleanMyMove;
store.cleanMyMove = m => (m && typeof m === "object" ? m : DEF);
load({ onboardingComplete: true, myMove: { ...GOOD, hardDay: ["walk", "rest"] } });
const raw = J(store.get("myMove").hardDay) !== J(["rest"]);
store.cleanMyMove = real;
ok("6a. without cleaning, 3h's input would not load as rest alone", raw, "the reversal did not change the result: 3h is not testing the cleaner");

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
