/**
 * tools/verify-aims.mjs
 * 03 Sep 2026 v1
 *
 * AIM-VOCAB. The arc's content spine.
 *
 * The old onboarding goals did nothing, and this file exists because of
 * why. Traced 3 Sep: "get stronger" and "improve flexibility" shared 48%
 * of their exercise pool, the non-overlap was noise, and the coach spoke
 * BYTE-IDENTICAL words for every goal including none. The goals were
 * unactionable, so nothing acted on them.
 *
 * These assertions guard the three properties that stop that recurring:
 *
 *   AIMS ARE CAPABILITIES, NOT METRICS, AND NEVER HAVE DATES. A coach
 *   can act on "get off the floor without using my hands". It cannot act
 *   on "improve mobility", and a date is a thing you fail on a Tuesday.
 *
 *   EVERYTHING RESOLVES. A strand naming a zone that does not exist
 *   fails SILENTLY -- the arc simply never leans, and nothing goes red.
 *   That exact fault shipped in ARC-1 (five invented goal ids) and was
 *   caught by checking, not by running.
 *
 *   MIND STRANDS DO NOT THIN OUT. The arc spec recorded itself doing
 *   this: its worked table listed a mind strand, and its illustration
 *   then used three physical ones and dropped it. The model permitted
 *   the right answer; the example taught the wrong one. Assertion 4
 *   makes that drift fail a gate instead.
 */
import fs from "node:fs";
import { AIMS, STRANDS, aimById, strandsForAim, zonesForStrands, sessionTypesForStrands }
  from "../js/data/aims.js";
import { STRETCH_ZONES, SESSION_TYPES } from "../js/session-builder.js";

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };
const raw = fs.readFileSync("js/data/aims.js", "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

console.log("\nTEST 1 - everything resolves");

check("1a. every aim's strands exist", () => {
  const bad = [];
  for (const a of AIMS.list) for (const s of a.strands) if (!STRANDS[s]) bad.push(`${a.id} -> ${s}`);
  ok(bad.length === 0,
     `strands that do not exist: ${bad.join(", ")}. These fail SILENTLY -- the strand is ` +
     `dropped, the arc leans less, and nothing goes red.`);
});

check("1b. every zone and session type is real", () => {
  const zi = new Set(STRETCH_ZONES.map(z => z.id));
  const si = new Set(SESSION_TYPES.map(t => t.id));
  const bad = [];
  for (const [k, v] of Object.entries(STRANDS)) {
    for (const z of v.zones || [])        if (!zi.has(z)) bad.push(`${k} -> zone ${z}`);
    for (const t of v.sessionTypes || []) if (!si.has(t)) bad.push(`${k} -> type ${t}`);
  }
  ok(bad.length === 0, `do not exist: ${bad.join(", ")}`);
});

check("1c. an unknown aim yields nothing, not an error", () => {
  ok(aimById("nope") === null, "an unknown aim must return null");
  ok(strandsForAim("nope").length === 0, "an unknown aim must yield no strands");
  ok(zonesForStrands(null).length === 0 && sessionTypesForStrands(undefined).length === 0,
     "missing strand lists must yield nothing rather than throwing");
});

console.log("\nTEST 2 - an aim is a capability");

check("2a. no aim is a metric or a vague state", () => {
  for (const a of AIMS.list) {
    const l = a.label.toLowerCase();
    for (const bad of ["kg", "lbs", "%", "per week", "times a", "minutes a day"]) {
      ok(!l.includes(bad), `"${a.label}" is a metric. A coach cannot act on a number.`);
    }
    // A substring list missed "walk 10000 steps a day" -- caught by
    // reversal, not by review. The distinguishing feature is not the
    // number: "run 5K without stopping" is a capability that happens to
    // contain one. It is the RATE. A quantity per unit of time is a
    // target you can be behind on by Wednesday; a distance you can
    // either cover or not is a thing you can do.
    ok(!/\d[^.]*\b(?:a|per|every)\s+(?:day|week|month|morning|night)\b/.test(l),
       `"${a.label}" sets a quantity per unit of time. That is a target somebody can fall ` +
       `behind on, which is the mechanic this product refuses.`);
    for (const vague of ["get fitter", "be fitter", "improve mobility", "get healthy",
                         "lose weight", "tone up", "feel better"]) {
      ok(l !== vague, `"${a.label}" is the kind of goal that did nothing. It must name ` +
                      `something the person wants to be able to DO.`);
    }
  }
});

check("2b. no aim carries a date, and nothing in the file does", () => {
  for (const bad of ["by when", "deadline", "target date", "weeks to", "in 12 weeks",
                     "by christmas", "days left"]) {
    ok(!raw.toLowerCase().includes(bad),
       `the file contains "${bad}". A date is a thing you fail on a Tuesday.`);
  }
  for (const a of AIMS.list) {
    ok(!/\b(by|within|in)\s+\d/.test(a.label.toLowerCase()), `"${a.label}" contains a deadline`);
  }
});

console.log("\nTEST 3 - the cap is real");

check("3. an aim offers more than it allows, and the cap is declared", () => {
  ok(AIMS.maxStrands === 3, `maxStrands is ${AIMS.maxStrands}; the agreed cap is 3`);
  for (const a of AIMS.list) {
    ok(a.strands.length > AIMS.maxStrands,
       `"${a.id}" offers ${a.strands.length} strands and allows ${AIMS.maxStrands}. If an aim ` +
       `offers no more than the cap, the person is not choosing, they are accepting.`);
  }
});

console.log("\nTEST 4 - mind strands do not thin out");

check("4a. every aim offers at least one mind strand", () => {
  const bad = AIMS.list.filter(a => !a.strands.some(s => (STRANDS[s] || {}).kind === "mind"));
  ok(bad.length === 0,
     `aims with no mind strand: ${bad.map(a => a.id).join(", ")}. This is the exact drift the ` +
     `arc spec recorded in itself -- the model permits a mind strand and the examples quietly ` +
     `use physical ones.`);
});

check("4b. mind strands are a real proportion, not a token", () => {
  const all  = Object.values(STRANDS);
  const mind = all.filter(s => s.kind === "mind").length;
  ok(mind / all.length >= 0.25,
     `${mind} of ${all.length} strands are mind strands. Below a quarter it is a garnish.`);
});

check("4c. a mind strand is actionable, not a mood", () => {
  // A mind strand with no movements is a label with nothing behind it.
  for (const [k, v] of Object.entries(STRANDS)) {
    if (v.kind !== "mind") continue;
    ok(Array.isArray(v.movements) && v.movements.length > 0,
       `mind strand "${k}" names no In Step movements, so nothing can be offered for it`);
    ok(!v.zones || v.zones.length === 0,
       `mind strand "${k}" also carries zones. A strand that is both is two strands.`);
  }
});

check("4d. mind strands point at In Step movements that exist", () => {
  const src = fs.readFileSync("js/data/in-step-scenarios.js", "utf8");
  const real = ["solo", "partner", "floor", "environment"].filter(m =>
    new RegExp(`["']${m}["']`).test(src));
  ok(real.length === 4, `in-step-scenarios.js no longer defines all four movements (found ${real.join(", ")})`);
  for (const [k, v] of Object.entries(STRANDS)) {
    for (const m of v.movements || []) {
      ok(real.includes(m), `strand "${k}" names movement "${m}", which In Step does not have`);
    }
  }
});

console.log("\nTEST 5 - the vocabulary may only emphasise");

check("5a. it makes no safety decisions", () => {
  for (const bad of ["contraindic", "conditionSet", "severeZone", "bodyCaution",
                     "difficultyLevel", "bypass", "painScore"]) {
    ok(!raw.includes(bad),
       `aims.js references "${bad}". Conditions, soreness, equipment and the difficulty ` +
       `ceiling all filter BEFORE this is consulted -- which is why a wrong row here can only ` +
       `produce a duller session, never an unsafe one.`);
  }
});

check("5b. it is flagged provisional", () => {
  ok(AIMS.provisional === true, "not flagged provisional");
  ok(/not clinically reviewed/i.test(AIMS.sourcedFrom), "sourcedFrom does not say it is unreviewed");
});

console.log(fails === 0
  ? "\nAIM-VOCAB: all assertions pass\n"
  : "\nAIM-VOCAB: " + fails + " FAILED\n");
process.exit(fails === 0 ? 0 : 1);
