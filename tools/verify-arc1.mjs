/**
 * tools/verify-arc1.mjs
 * 31 Aug 2026 v1
 *
 * ARC-1. The stretch arc, built on a mapping we wrote ourselves.
 *
 * A physiotherapist was asked for the goal-to-zone mapping on 31 Aug and
 * has not replied. She asked not to be named, so whatever comes back is
 * informal input, not clinical review. We are shipping our own answers
 * meanwhile, and this gate exists to keep that decision honest and cheap
 * to reverse.
 *
 * Two things must hold.
 *
 * ASSERTION 2 -- THE MAP MAY ONLY EMPHASISE. Every condition, soreness,
 * equipment and difficulty filter runs BEFORE the map is consulted, and
 * the map reorders rather than filters. So the worst a wrong row can do
 * is produce a less useful session, never an unsafe one. That property is
 * the entire reason shipping our own guesses is defensible, and it is the
 * first thing to re-check if this file is ever given more power.
 *
 * ASSERTION 3 -- NOTHING ELSE HOLDS AN OPINION. If a second file starts
 * deciding which zones suit which goal, replacing the map stops being one
 * edit and becomes a hunt. The whole point is that it can be thrown away.
 */
import fs from "node:fs";
import { STRETCH_GOAL_ZONES, zonesForGoal } from "../js/data/stretch-goal-zones.js";
import { STRETCH_ZONES } from "../js/session-builder.js";
import { GOAL_CATEGORIES } from "../js/data/goals.js";

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };
const strip = t => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const read = p => strip(fs.readFileSync(p, "utf8"));

console.log("\nTEST 1 - the map points at things that exist");

check("1a. every goal id is a real goal", () => {
  const real = new Set(GOAL_CATEGORIES.flatMap(c => (c.goals || []).map(g => g.id)));
  const bad = Object.keys(STRETCH_GOAL_ZONES.goals).filter(g => !real.has(g));
  ok(bad.length === 0,
     `goal ids that do not exist: ${bad.join(", ")}. These fail SILENTLY -- zonesForGoal ` +
     `returns [] forever and the arc simply never leans, with nothing going red.`);
});

check("1b. every zone id is a real zone", () => {
  const real = new Set(STRETCH_ZONES.map(z => z.id));
  const bad = [];
  for (const [g, zs] of Object.entries(STRETCH_GOAL_ZONES.goals)) {
    for (const z of zs) if (!real.has(z)) bad.push(`${g} -> ${z}`);
  }
  ok(bad.length === 0, `zone ids that do not exist: ${bad.join(", ")}`);
});

check("1c. an unknown goal returns [], not an error", () => {
  ok(Array.isArray(zonesForGoal("no-such-goal")) && zonesForGoal("no-such-goal").length === 0,
     "an unmapped goal must yield no emphasis, not throw");
  ok(zonesForGoal(null).length === 0, "a null goal must yield no emphasis");
});

console.log("\nTEST 2 - the map may only emphasise, never permit");

check("2a. the map is data, with no logic in it", () => {
  const src = read("js/data/stretch-goal-zones.js");
  for (const bad of ["contraindic", "conditionSet", "severeZone", "bodyCaution",
                     "difficultyLevel", "ceiling", "bypass"]) {
    ok(!src.includes(bad),
       `the map references "${bad}". It must not participate in any safety decision -- ` +
       `emphasis only, or a wrong row could produce an unsafe session rather than a dull one.`);
  }
});

check("2b. zone focus still orders rather than filters", () => {
  // The map feeds the same path ZONE-1 built. If that ever becomes a
  // filter, a wrong row starts REMOVING safe exercises.
  const sb = read("js/session-builder.js");
  const at = sb.indexOf("function _applyZoneFocus");
  ok(at > -1, "no _applyZoneFocus");
  const body = sb.slice(at, sb.indexOf("\n}", at));
  ok(body.includes("hit.concat(rest)"), "zone focus now filters; a wrong map row would remove exercises");
});

check("2c. the safety filters run before the map is consulted", () => {
  const sb = read("js/session-builder.js");
  const rules = sb.indexOf("_applySectionRules(matched, sectionRules)");
  const zone  = sb.indexOf("_applyZoneFocus(matched");
  ok(rules > -1 && zone > -1, "a marker is missing");
  ok(rules < zone, "zone focus is applied before the section rules that constrain it");
});

console.log("\nTEST 3 - nothing outside the map has an opinion");

check("3. the mapping has exactly one home", () => {
  // AMBITION vs WHAT IS TESTABLE. The intent is "no second file decides
  // which zones suit which goal". A string search cannot enforce that:
  // zone ids deliberately reuse anatomical tag names, "cycling" is both a
  // goal id and a sport, and session-rationale.js legitimately keys copy
  // by goal. The broad version flagged eleven innocent files, and a gate
  // that cries wolf gets ignored -- which is worse than no gate.
  //
  // So this asserts the narrow, true thing: the mapping is defined once
  // and consumed in one place. If a second consumer appears, replacing
  // the map stops being one edit, and that is the property worth keeping.
  const files = [];
  const walk = d => {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      if (f.isDirectory()) walk(`${d}/${f.name}`);
      else if (f.name.endsWith(".js")) files.push(`${d}/${f.name}`);
    }
  };
  walk("js");

  const definers = files.filter(f =>
    !f.endsWith("stretch-goal-zones.js") && /function\s+zonesForGoal|STRETCH_GOAL_ZONES\s*=/.test(read(f)));
  ok(definers.length === 0, `a second file defines the mapping: ${definers.join(", ")}`);

  const consumers = files.filter(f =>
    !f.endsWith("stretch-goal-zones.js") && /from\s+["'][^"']*stretch-goal-zones\.js["']/.test(read(f)));
  ok(consumers.length <= 1,
     `${consumers.length} files import the map (${consumers.join(", ")}). Keep it to one, ` +
     `or replacing it becomes a hunt rather than an edit.`);
});

console.log("\nTEST 4 - the arc records dates, and never a score");

check("4a. coverage is a date per zone", () => {
  const st = read("js/store.js");
  const at = st.indexOf("markZonesWorked(");
  ok(at > -1, "no markZonesWorked");
  const body = st.slice(at, at + 700);
  ok(body.includes("toISOString().split"), "coverage is not stored as a date");
  for (const bad of ["++", "count", "+ 1", "length +"]) {
    ok(!body.includes(bad),
       `coverage increments (${bad}). A date is a fact about the plan; a count is a score, ` +
       `and this product does not keep score.`);
  }
});

check("4b. the UI surfaces what is missing, not what was done", () => {
  const ui = read("js/views/session-builder-ui.js");
  ok(ui.includes("zonesNotRecentlyWorked"), "the picker never surfaces uncovered zones");
  const at = ui.indexOf("missingLabels");
  ok(at > -1, "no missing-zone message");
  const body = ui.slice(at, at + 1200);
  for (const bad of ["you have done", "you've done", "sessions so far", "streak", "times"]) {
    ok(!body.toLowerCase().includes(bad), `the message says "${bad}" -- that is a score`);
  }
});

check("4c. coverage is recorded on build, not on completion", () => {
  const ui = read("js/views/session-builder-ui.js");
  const at = ui.indexOf("markZonesWorked");
  ok(at > -1, "coverage is never recorded");
  const before = ui.slice(Math.max(0, at - 400), at);
  ok(before.includes("sb-zones-continue-btn") || before.includes("sessionZoneFocus"),
     "coverage is recorded somewhere other than the build step. Depending on COMPLETION " +
     "would reintroduce completion pressure through the back door.");
});

console.log("\nTEST 5 - the map does not claim a backing it lacks");

check("5a. it is flagged provisional in the data", () => {
  ok(STRETCH_GOAL_ZONES.provisional === true, "the map is not flagged provisional");
  ok(/not clinically reviewed/i.test(STRETCH_GOAL_ZONES.sourcedFrom),
     "sourcedFrom does not say the map is unreviewed");
});

check("5b. nothing claims clinical backing to the user", () => {
  const ui = read("js/views/session-builder-ui.js");
  for (const bad of ["physio", "clinician", "clinically", "medically", "prescribed by"]) {
    ok(!ui.toLowerCase().includes(bad),
       `the builder tells the person something is "${bad}". Nothing here has been reviewed ` +
       `by anyone, and the reviewer asked not to be named even once she has.`);
  }
});

check("5c. the goal leans the picker, it does not lock it", () => {
  const ui = read("js/views/session-builder-ui.js");
  // Anchor on the CALL, not the import at the top of the file.
  const at = ui.indexOf("const suggested = zonesForGoal(");
  ok(at > -1, "the goal never reaches the picker");
  const body = ui.slice(at, at + 500);
  ok(body.includes("selectedZones ="),
     "suggested zones are not written into the editable selection, so they cannot be " +
     "turned off -- a coach with a plan you are not allowed to change");
  ok(!body.includes("disabled"), "suggested zones are locked");
});

console.log(fails === 0
  ? "\nARC-1: all assertions pass\n"
  : "\nARC-1: " + fails + " FAILED\n");
process.exit(fails === 0 ? 0 : 1);
