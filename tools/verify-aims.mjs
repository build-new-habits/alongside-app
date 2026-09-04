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
import { AIMS, STRANDS, SITUATIONS, aimById, strandsForAim, zonesForStrands, sessionTypesForStrands, aimsFor }
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

console.log("\nTEST 6 - situations: fewer aims, and the right ones");

check("6a. every aim declares its situations, all real", () => {
  const known = new Set(SITUATIONS);
  for (const a of AIMS.list) {
    ok(Array.isArray(a.situations) && a.situations.length,
       `"${a.id}" declares no situations, so it can never be offered to anybody`);
    for (const x of a.situations) ok(known.has(x), `"${a.id}" names unknown situation "${x}"`);
  }
});

check("6b. nobody is ever shown the whole list by default", () => {
  // No limit passed: the DEFAULT is what people actually get, and
  // passing 8 in meant raising the default went undetected.
  const shown = aimsFor(["everyday"]);
  ok(shown.length <= 10,
     `${shown.length} aims shown by default. Graeme, 3 Sep: "if you are asking more than ten ` +
     `questions to anybody, you are asking too many."`);
  ok(AIMS.list.length > shown.length,
     "the vocabulary is no bigger than what is shown, so filtering does nothing");
});

check("6c. \"everyday\" does not score", () => {
  // Counting it made it worth as much as "training", so a gym-four-
  // times-a-week 25-year-old was offered "carry the shopping" while
  // "lift heavier" never appeared. A fallback that ranks is not a
  // fallback.
  const trained = aimsFor(["everyday", "training"], 8).map(a => a.id);
  ok(trained.includes("lift-heavier"),
     `somebody training does not see "lift heavier". Shown: ${trained.join(", ")}`);
  ok(!trained.includes("floor-unaided"),
     "somebody training is offered getting off the floor unaided ahead of training aims");
});

check("6d. every aim is reachable by somebody", () => {
  const reachable = new Set();
  for (const sit of SITUATIONS) aimsFor([sit], 99).forEach(a => reachable.add(a.id));
  const orphans = AIMS.list.filter(a => !reachable.has(a.id)).map(a => a.id);
  ok(orphans.length === 0, `aims nobody can ever be shown: ${orphans.join(", ")}`);
});

check("6e. the whole vocabulary stays one tap away", () => {
  const view = fs.readFileSync("js/views/arc-setup.js", "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  ok(/id="as-all-btn"/.test(view),
     "there is no escape to the full list. Filtering without an escape is the app deciding " +
     "what somebody is allowed to want.");
  ok(/showAll \? AIMS\.list/.test(view), "the escape does not open the whole vocabulary");
});

check("6f. the personas the vocabulary was rewritten for are served", () => {
  // Each of these is a real persona from the matrix. If a future edit
  // stops serving one, this names them rather than failing abstractly.
  const cases = [
    ["2.1 Graeme: trains, injured, wants his sport back",
     ["returning", "managing", "training", "sport"], "sport-without-flaring"],
    ["2.5 post-cardiac beginner", ["returning", "managing", "starting"], "after-illness"],
    ["2.10 frail 76, walks", ["later-life", "starting"], "keep-walking-far"],
    ["2.12 blank slate", ["starting"], "just-start"],
    ["2.15 gym-literate 20s", ["training"], "lift-heavier"],
    ["2.16 time-poor parent", ["training"], "fit-it-in"],
  ];
  for (const [who, sits, wanted] of cases) {
    const ids = aimsFor(sits, 8).map(a => a.id);
    ok(ids.includes(wanted),
       `${who} is not offered "${wanted}" in their first 8. Shown: ${ids.join(", ")}`);
  }
});

console.log(fails === 0
  ? "\nAIM-VOCAB: all assertions pass\n"
  : "\nAIM-VOCAB: " + fails + " FAILED\n");
process.exit(fails === 0 ? 0 : 1);
