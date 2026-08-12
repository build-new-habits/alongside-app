/**
 * tools/verify-gm1.mjs
 * 12 Aug 2026 v1
 *
 * Gate for GM-1. Simulated as well as asserted, per the EMP-1 lesson: a
 * fully passing suite there still shipped a pool that quietly used two
 * of four prompts. Test 5 runs a real arc.
 */
import fs from "node:fs";
const mem = {};
globalThis.localStorage = {
  getItem: k => (k in mem ? mem[k] : null),
  setItem: (k, v) => { mem[k] = String(v); },
  removeItem: k => { delete mem[k]; },
};
const { store } = await import("/home/claude/repo/js/store.js");
store.init();
const GM = await import("/home/claude/repo/js/data/grounding-moments.js");

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };
const reset = () => store.set("grounding", { lastSession: 0, lastId: null, shown: [], dismissed: [] });

const FAMILIES = ["hold","outdoor","loaded","floor","seated","balance","machine"];

console.log("\nTEST 1 - the library itself");
check("every moment has id, family, depth, text, outward", () => {
  const ids = new Set();
  for (const m of GM.GROUNDING_MOMENTS) {
    ok(m.id && !ids.has(m.id), `duplicate or missing id: ${m.id}`);
    ids.add(m.id);
    ok(["contact","place","beyond"].includes(m.depth), `${m.id} bad depth`);
    ok([...FAMILIES,"any"].includes(m.family), `${m.id} unknown family "${m.family}"`);
    ok(typeof m.text === "string" && m.text.length > 40, `${m.id} text missing or too short`);
    ok(typeof m.outward === "boolean", `${m.id} missing outward flag`);
  }
});
check("no verdict or praise language anywhere (P4)", () => {
  for (const m of GM.GROUNDING_MOMENTS)
    for (const w of ["well done","great","brilliant","stronger","better than","progress","personal best","should feel"])
      ok(!new RegExp(w, "i").test(m.text), `${m.id} contains "${w}"`);
});
check("no research or outcome claims (Graeme, 12 Aug)", () => {
  for (const m of GM.GROUNDING_MOMENTS)
    for (const w of ["studies","research","evidence","proven","scientif","shown to","increases your"])
      ok(!new RegExp(w, "i").test(m.text), `${m.id} argues from evidence: "${w}"`);
});

console.log("\nTEST 2 - safety: attention can always be sent outward");
for (const f of FAMILIES)
  check(`family "${f}" offers at least one outward moment`, () => {
    const any = GM.GROUNDING_MOMENTS.some(m => (m.family === f || m.family === "any") && m.outward);
    ok(any, "turning attention inward does not suit everybody; nobody should be offered only that");
  });

console.log("\nTEST 3 - family derivation covers the real database");
check("a plank derives to hold", () =>
  ok(GM.groundingFamily({ name: "Forearm Plank", position: "floor", category: "strength", equipment: [] }) === "hold", "misfiled"));
check("a treadmill run derives to machine, not outdoor", () =>
  ok(GM.groundingFamily({ name: "Treadmill Intervals", category: "cardio", equipment: ["treadmill"] }) === "machine", "misfiled"));
check("an outdoor run derives to outdoor", () =>
  ok(GM.groundingFamily({ name: "Easy Run", category: "cardio", equipment: [] }) === "outdoor", "misfiled"));
check("a dumbbell press derives to loaded", () =>
  ok(GM.groundingFamily({ name: "Dumbbell Press", category: "strength", equipment: ["dumbbell"] }) === "loaded", "misfiled"));
check("a seated exercise derives to seated", () =>
  ok(GM.groundingFamily({ name: "Seated Band Row", category: "strength", position: "seated", equipment: [] }) === "seated", "misfiled"));
check("a seated HOLD still derives to hold, not seated", () =>
  ok(GM.groundingFamily({ name: "Seated Isometric Hold", category: "strength", position: "seated", equipment: [] }) === "hold",
     "a hold in any position is a hold"));
check("duration without reps reads as a hold even when unnamed", () =>
  ok(GM.groundingFamily({ name: "Static Wall Press", category: "strength", position: "standing", duration: 45, equipment: [] }) === "hold",
     "the structural signal should not depend on naming"));
check("unknown shapes return null rather than guessing", () =>
  ok(GM.groundingFamily({ name: "Breathing", category: "mindfulness", equipment: [] }) === null, "should stay silent"));

console.log("\nTEST 4 - when it must stay quiet");
check("never in a first session", () => { reset(); ok(GM.shouldOfferMoment(1, {}) === false, "offered too early"); });
check("never at severe pain (7+, the app's acute threshold)", () => {
  reset();
  ok(GM.shouldOfferMoment(30, { knee: 7 }) === false, "offered on the Gentle Care path");
  ok(GM.shouldOfferMoment(30, { knee: 6 }) === true,  "6 should not block");
});
check("respects the cadence gap", () => {
  reset();
  store.set("grounding", { lastSession: 30, lastId: null, shown: [], dismissed: [] });
  ok(GM.shouldOfferMoment(31, {}) === false, "offered one session after the last");
  ok(GM.shouldOfferMoment(33, {}) === true,  "should be available after the gap");
});
check("depth: beyond is unreachable early", () => {
  reset();
  const early = GM.selectMoment({ name: "Plank", equipment: [] }, 4);
  ok(!early || early.depth === "contact", `depth ${early?.depth} at session 4`);
});
check("a dismissed moment never returns", () => {
  reset();
  const first = GM.selectMoment({ name: "Plank", equipment: [] }, 40);
  ok(first, "nothing selected");
  GM.dismissMoment(first.id);
  for (let s = 40; s < 200; s += 3) {
    store.set("grounding", { ...store.get("grounding"), lastSession: 0, lastId: null });
    const m = GM.selectMoment({ name: "Plank", equipment: [] }, s);
    ok(!m || m.id !== first.id, `dismissed ${first.id} came back at session ${s}`);
  }
});

console.log("\nTEST 5 - simulated arc (the EMP-1 lesson)");
check("the hold pool is fully covered before anything repeats", () => {
  reset();
  const pool = GM.GROUNDING_MOMENTS.filter(m => m.family === "hold" || m.family === "any");
  const seen = new Set();
  for (let s = 30; s < 30 + pool.length * 3 + 30; s += 3) {
    const m = GM.selectMoment({ name: "Plank", equipment: [] }, s);
    if (!m) continue;
    seen.add(m.id);
    GM.recordMomentShown(m, s);
  }
  ok(seen.size === pool.length,
     `only ${seen.size} of ${pool.length} hold moments ever appeared (${[...seen].join(", ")})`);
});
check("the same moment never appears twice running", () => {
  reset();
  let prev = null;
  for (let s = 30; s < 150; s += 3) {
    const m = GM.selectMoment({ name: "Plank", equipment: [] }, s);
    if (!m) continue;
    ok(m.id !== prev, `${m.id} repeated at session ${s}`);
    prev = m.id;
    GM.recordMomentShown(m, s);
  }
});

console.log("\nTEST 6 - wiring");
const wo = fs.readFileSync("js/views/workout.js", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const sw = fs.readFileSync("sw.js", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const mc = fs.readFileSync("css/main.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
check("workout.js selects once per render", () =>
  ok(/const groundingMoment = selectMoment\(/.test(wo), "would reshuffle on every timer tick"));
check("workout.js records on mount, not at render", () =>
  ok(/recordMomentShown\(m, sc\)/.test(wo), "a moment never shown would count as seen"));
check("dismissal is wired", () => ok(/dismissMoment\(m\.id\)/.test(wo), "dismiss does nothing"));
check("store declares the grounding field", () =>
  ok(/grounding: \{ lastSession/.test(fs.readFileSync("js/store.js", "utf8")), "reader without a writer, again"));
check("stylesheet imported and precached", () => {
  ok(/components\/grounding-moments\.css/.test(mc), "index.html links only main.css");
  ok(/components\/grounding-moments\.css/.test(sw), "offline styling would drop");
  ok(/data\/grounding-moments\.js/.test(sw), "offline the import would fail");
});

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
