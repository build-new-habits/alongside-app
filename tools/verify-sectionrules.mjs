/**
 * tools/verify-sectionrules.mjs
 * 31 Aug 2026 v1
 *
 * SECTION-RULES.
 *
 * W2-1 named the pattern on 14 Aug: "a filter correct against a curated
 * pool, left in place after the pool became the whole database." CON-6
 * made every section draw all 551 entries; the category NAMES were
 * written when each pool was hand-curated, so they still read as though
 * they carry intent. `activation` is region-blind. `glute-stretch` and
 * `hip-mobility` are character-blind.
 *
 * This gate exists because the fix is a mechanism, and a mechanism can
 * fail in a way three patches could not: silently. A rule that is
 * declared but never threaded through to the filter leaves the engine
 * behaving exactly as before while the declaration sits in the file
 * looking correct. Assertion 2 is the one that catches that.
 *
 * Assertion 4 is the counterweight. Every whitelist can starve a
 * section, and a starved section is worse than an impure one -- it fails
 * closed, with no session at all.
 */
import fs from "node:fs";
import { EXERCISES } from "../js/data/exercises/index.js";
import { matchCategory } from "../js/data/session-categories.js";
import { SESSION_TYPES, STRETCH_ZONES, zonesWithCoverage, zoneContentCount } from "../js/session-builder.js";

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };

// Every file read by this gate goes through strip(). Four times today a
// proximity or counting assertion has measured comment prose instead of
// code -- and the code was correct each time. Reading source as source
// is not an optimisation, it is the assertion working at all.
const strip = t => t
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "")
  .replace(/<!--[\s\S]*?-->/g, "");
const read = p => strip(fs.readFileSync(p, "utf8"));

const raw = fs.readFileSync("js/session-builder.js", "utf8");
// Comments stripped for anything that COUNTS occurrences. This file
// documents _filterCandidates() heavily, and counting prose as call
// sites is the third time that mistake has been made today.
const src = raw
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");
const SECTIONS = ["warmup", "main", "cooldown"];
const catsFor = (t, sec) => sec === "warmup" ? t.warmupCategories
                          : sec === "main"   ? t.mainCategories
                          :                    t.cooldownCategories;

function rawPool(type, section) {
  const out = [];
  for (const c of catsFor(type, section) || []) out.push(...matchCategory(EXERCISES, c, section));
  return [...new Map(out.map(e => [e.id, e])).values()];
}

const ruled = SESSION_TYPES.filter(t => t.sectionRules);

console.log("\nTEST 1 - the rules are declared where the faults were");

check("1a. at least one type declares rules", () => {
  ok(ruled.length > 0, "no session type declares sectionRules; the mechanism is inert");
});

check("1b. the three reported faults are covered", () => {
  for (const id of ["lower", "glute", "stretch"]) {
    const t = SESSION_TYPES.find(x => x.id === id);
    ok(t && t.sectionRules && t.sectionRules.warmup,
       `${id} declares no warm-up rules -- this is where the fault was reported`);
  }
  const stretch = SESSION_TYPES.find(t => t.id === "stretch");
  ok(stretch.sectionRules.main, "stretch declares no rules for its main section");
});

console.log("\nTEST 2 - declared rules actually reach the filter");

check("2a. _filterCandidates accepts and applies them", () => {
  ok(/function _filterCandidates\([^)]*sectionRules\)/.test(src),
     "_filterCandidates does not take sectionRules");
  ok(src.includes("_applySectionRules(matched, sectionRules)"),
     "the rules are never applied to the candidate list -- declared and inert");
});

check("2b. EVERY call site passes them", () => {
  // A rule threaded through three of four call sites is the worst
  // outcome: correct in generated sessions and not in hand-picked ones,
  // or the reverse, with nothing to show which.
  const calls = (src.match(/_filterCandidates\(/g) || []).length - 1; // minus the definition
  const wired = (src.match(/_filterCandidates\([^)]*sectionRules[^)]*\)/g) || []).length - 1;
  ok(calls === wired,
     `${calls} call site(s), ${wired} pass sectionRules. A rule that reaches some ` +
     `paths and not others is harder to find than one that reaches none.`);
});

check("2c. the rules run before the per-section pools are read", () => {
  const applied = src.indexOf("_applySectionRules(matched, sectionRules)");
  const warmPool = src.indexOf('const warmupPool = section === "warmup"');
  ok(applied > -1 && warmPool > -1, "a marker is missing");
  ok(applied < src.lastIndexOf("return matched.filter"),
     "the rules are applied after the final return");
});

console.log("\nTEST 3 - the rules remove what they were built to remove");

check("3a. no lower-body or glute warm-up is entirely upper-body", () => {
  const UPPER = ["shoulder", "upper-back", "chest-pecs", "triceps-biceps",
                 "rotator-cuff", "wrist-elbow"];
  for (const id of ["lower", "glute"]) {
    const t = SESSION_TYPES.find(x => x.id === id);
    const rule = t.sectionRules.warmup.excludeAreasOnly;
    ok(Array.isArray(rule), `${id} warm-up has no excludeAreasOnly rule`);
    for (const a of UPPER) {
      ok(rule.includes(a), `${id} warm-up rule omits "${a}" -- Wrist CARs would survive`);
    }
    // And the rule must not be so broad it removes trunk work: cat-cow
    // and pelvic tilt belong in a lower-body warm-up.
    for (const keep of ["lower-back", "spine", "core", "abdominals", "full-body"]) {
      ok(!rule.includes(keep),
         `${id} warm-up excludes "${keep}" -- cat-cow and pelvic tilt would go with it`);
    }
  }
});

check("3b. the stretch pools admit only calm, unloaded movement", () => {
  const t = SESSION_TYPES.find(x => x.id === "stretch");
  for (const [section, rule] of Object.entries(t.sectionRules)) {
    ok(Array.isArray(rule.allowPatterns), `stretch ${section} has no allowPatterns`);
    for (const bad of ["hip-abduction", "squat", "lunge", "push", "pull", "hinge", "yoga-pose"]) {
      ok(!rule.allowPatterns.includes(bad),
         `stretch ${section} admits "${bad}" -- this is how Monster Walk and Warrior II got in`);
    }
  }
});

check("3c. the offenders are gone from the filtered pools", () => {
  const gone = { lower: ["Wrist CARs", "Shoulder CARs", "Seated Shoulder Rolls"],
                 stretch: ["Monster Walk", "Donkey Kick", "Clamshell"] };
  for (const [id, names] of Object.entries(gone)) {
    const t = SESSION_TYPES.find(x => x.id === id);
    const rule = t.sectionRules.warmup;
    const pool = rawPool(t, "warmup").filter(ex => {
      if (rule.allowPatterns && !rule.allowPatterns.includes(ex.movementPattern)) return false;
      if (rule.excludeAreasOnly) {
        const a = ex.affectsAreas || [];
        if (a.length && a.every(x => rule.excludeAreasOnly.includes(x))) return false;
      }
      return true;
    });
    const survivors = pool.filter(e => names.includes(e.name)).map(e => e.name);
    ok(survivors.length === 0,
       `${id} warm-up still offers: ${survivors.join(", ")}`);
  }
});

console.log("\nTEST 4 - no rule starves a section");

for (const t of ruled) {
  check("4. " + t.id + " keeps a usable pool in every ruled section", () => {
    for (const section of SECTIONS) {
      const rule = t.sectionRules[section];
      if (!rule) continue;
      const before = rawPool(t, section);
      const after = before.filter(ex => {
        if (rule.allowPatterns && !rule.allowPatterns.includes(ex.movementPattern)) return false;
        if (rule.denyPatterns && rule.denyPatterns.includes(ex.movementPattern)) return false;
        if (rule.excludeAreasOnly) {
          const a = ex.affectsAreas || [];
          if (a.length && a.every(x => rule.excludeAreasOnly.includes(x))) return false;
        }
        return true;
      });
      // Before any condition, equipment or difficulty filtering, which
      // only narrows further. A section that is thin here fails closed.
      ok(after.length >= 6,
         `${t.id}/${section} drops from ${before.length} to ${after.length}. ` +
         `A starved section is worse than an impure one -- it yields no session.`);
    }
  });
}

console.log("\nTEST 5 - the mechanism is opt-in");

check("5. types declaring nothing are untouched", () => {
  ok(src.includes("if (!rules) return list;"),
     "_applySectionRules does not short-circuit when no rules are declared, so every " +
     "existing session type is exposed to a code path it did not ask for");
  const unruled = SESSION_TYPES.filter(t => !t.sectionRules).map(t => t.id);
  ok(unruled.length > 0, "every type is ruled; the opt-in claim is untested");
});

console.log("\nTEST 6 - Stretch is reachable from the right door");

check("6. the Mobility & Conditioning door offers Stretch", () => {
  // PICKER-GROUP grouped Stretch beside Mobility INSIDE the builder --
  // but the builder is what the Cardio, Core & Strength door opens, so
  // stretching was only reachable through the strength door. Grouping
  // within the wrong room.
  const mc = read("js/views/mobility-conditioning.js");
  ok(mc.includes('id="mc-stretch"'), "no Stretch card on the Mobility & Conditioning door");
  ok(mc.includes('sessionBuilderPreselect'),
     "the Stretch card does not preselect a type, so it drops the person on the " +
     "type picker they just answered by tapping it");
  const at = mc.indexOf('"#mc-stretch"');
  ok(at > -1, "the Stretch card is rendered but never wired");
  const handler = mc.slice(at, at + 400);
  ok(handler.includes('type: "stretch"'), "the card preselects the wrong type");
  ok(handler.includes('router.navigate("session-builder")'), "the card goes nowhere");
});

console.log("\nTEST 7 - the Stretch door gates on check-in and gives back a way out");

check("7a. one definition of checked-in-today", () => {
  const st = read("js/store.js");
  ok(/checkedInToday\(\)\s*{/.test(st), "store.js has no checkedInToday()");
  const today = read("js/views/today.js");
  ok(!today.includes("lastCheckin.timestamp"),
     "today.js still computes it itself. Two copies of 'has this person checked in " +
     "today' is how two doors end up disagreeing about whether they have.");
});

check("7b. the Stretch card enforces the gate", () => {
  const mc = read("js/views/mobility-conditioning.js");
  const at = mc.indexOf('"#mc-stretch"');
  const h = mc.slice(at, at + 1400);
  ok(h.includes("store.checkedInToday()"),
     "the Stretch card skips the check-in gate. The Cardio, Core & Strength door " +
     "enforces it for the SAME builder -- without it there is no pain data, so no " +
     "bodyCaution fires and the severe bypass has nothing to read.");
  ok(h.includes('store.set("pendingDoorRoute", "session-builder")'),
     "no pending route set, so the person would not arrive at the builder after " +
     "checking in");
  ok(h.includes('router.navigate("checkin")'), "the gate never sends anyone to check in");
});

check("7c. back returns to the door, not to a skipped screen", () => {
  const ui = read("js/views/session-builder-ui.js");
  ok(ui.includes("entryDoor"), "the builder does not record which door sent it");
  ok(ui.includes("pre.returnTo"), "the preselect payload's door is never read");
  // Anchor on the BACK HANDLER's branch, not the phase router at the top
  // of render() -- which also matches this string and is 800 lines away.
  const at = ui.indexOf('} else if (phase === "location") {');
  ok(at > -1, "no location back branch");
  const branch = ui.slice(at, at + 500);
  ok(branch.includes("entryDoor"),
     "backing out of the location step still returns to the type picker -- a screen " +
     "the preselect skipped, showing session types from a door the person did not open");
  // The door must be captured before resetState() nulls it.
  const typeAt = ui.indexOf('if (phase === "type") {', at - 900);
  const typeBranch = ui.slice(typeAt, typeAt + 400);
  const cap = typeBranch.indexOf("entryDoor");
  const reset = typeBranch.indexOf("resetState()");
  ok(cap > -1 && reset > -1 && cap < reset,
     "entryDoor is read after resetState(), which nulls it -- the door is silently lost");
});

console.log("\nTEST 8 - ZONE-1: zones are offered only where content exists");

// DERIVED, not hardcoded. These assertions previously carried a literal
// 6 and went red when ZONE-WEIGHTING moved the floor to 5 for a
// documented reason. A gate that has to be edited every time a tuned
// constant moves teaches people to edit gates.
const FLOOR = Number((raw.match(/const MIN_ZONE_CONTENT\s*=\s*(\d+)/) || [])[1]);

check("8a. every offered zone clears the content floor", () => {
  ok(Number.isFinite(FLOOR) && FLOOR >= 3,
     "MIN_ZONE_CONTENT is missing or implausibly low; the floor is what stops a zone " +
     "being offered that cannot fill a session");
  const offered = zonesWithCoverage();
  ok(offered.length >= 5, `only ${offered.length} zones offered; the picker is not usable`);
  for (const z of offered) {
    ok(zoneContentCount(z) >= FLOOR,
       `"${z.label}" is offered with ${zoneContentCount(z)} stretches, floor is ${FLOOR}. Offering a thin ` +
       `zone is worse than omitting it -- it promises a focus the library cannot honour.`);
  }
});

check("8b. thin zones are hidden, not shipped thin", () => {
  const offeredIds = new Set(zonesWithCoverage().map(z => z.id));
  const thin = STRETCH_ZONES.filter(z => zoneContentCount(z) < FLOOR);
  for (const z of thin) {
    ok(!offeredIds.has(z.id), `"${z.label}" is below the floor but still offered`);
  }
});

check("8c. zone focus orders, it does not filter", () => {
  const at = raw.indexOf("function _applyZoneFocus");
  ok(at > -1, "no _applyZoneFocus");
  const body = raw.slice(at, raw.indexOf("\n}", at));
  // ZONE-WEIGHTING split the two bands into three (primary, incidental,
  // rest). The property is unchanged: nothing is dropped.
  ok(/primary\.concat\(incidental, rest\)/.test(body),
     "zone focus drops non-matching exercises. A hard filter over a library this size " +
     "eventually returns an empty session; ordering degrades instead.");
  ok(!/return\s+list\.filter/.test(body), "zone focus filters the list");
});

check("8d. only the main section narrows to the chosen zones", () => {
  const at = src.indexOf("_applyZoneFocus(matched");
  ok(at > -1, "zone focus is never applied");
  const before = src.slice(Math.max(0, at - 200), at);
  ok(before.includes('section === "main"'),
     "zone focus is applied outside the main section -- a cool-down that narrowed to " +
     "the worked zone would end the session on the tightest thing in it");
});

check("8d2. the field is a real default, not a method-object stray", () => {
  // It first landed between two methods, where store.get() returns
  // undefined and zone focus silently does nothing while every gate
  // stays green. It must be in the defaults AND in the load merge, or it
  // does not survive a reload -- which is the one thing it exists for.
  const st = read("js/store.js");
  const inDefaults = /fitnessLevel:\s*null,[\s\S]{0,600}sessionZoneFocus:\s*\[\]/.test(st);
  ok(inDefaults, "sessionZoneFocus is not in the defaults object");
  ok(/saved\.sessionZoneFocus/.test(st),
     "sessionZoneFocus is not restored on load, so it cannot survive the check-in " +
     "detour it exists to survive");
});

check("8e. only Stretch gains a step", () => {
  const ui = read("js/views/session-builder-ui.js");
  // Assert on the ADVANCE, not on a string that could exist anywhere.
  // The reversal that set phase = "zones" unconditionally left the
  // back-branch copy of this string in place and the gate stayed green.
  // Anchor on the HANDLER, not the button markup 860 lines earlier which
  // also contains this id.
  const at = ui.indexOf('getElementById("sb-location-continue-btn")');
  ok(at > -1, "no location continue handler");
  const advance = ui.slice(at, at + 320);
  ok(advance.includes('selectedType === "stretch"'),
     "the forward advance is not gated on the stretch type, so every session type " +
     "gains a step it did not have");
  ok(ui.includes('phase === "zones"'), "the zone phase is never rendered");
});

console.log("\nTEST 9 - STRETCH-FLOW: the path is as short as the session needs");

check("9a. stretch skips equipment and build mode", () => {
  const ui = read("js/views/session-builder-ui.js");
  const at = ui.indexOf('selectedDuration = parseInt(');
  ok(at > -1, "no duration handler");
  const body = ui.slice(at, at + 900);
  ok(body.includes('selectedType === "stretch"'),
     "the duration step still routes stretch into the equipment check. Nothing in the " +
     "stretch pools reads equipment, and build mode was the second 'how would you like " +
     "this to go?' in as many minutes.");
  ok(body.includes("_openRecommendedCandidates()"),
     "stretch does not go straight to the recommended selection");
});

check("9b. the skipped screens share one definition", () => {
  // The recommend branch and the stretch path must not grow two copies
  // of "open the recommended candidate list" -- that duplication is what
  // produced two selection loops.
  const ui = read("js/views/session-builder-ui.js");
  const defs = (ui.match(/function _openRecommendedCandidates/g) || []).length;
  ok(defs === 1, `expected 1 definition, found ${defs}`);
  const uses = (ui.match(/_openRecommendedCandidates\(\)/g) || []).length - defs;
  ok(uses >= 2, `only ${uses} call site(s); the stretch path and the recommend branch must share it`);
});

check("9c. back does not walk into the skipped screens", () => {
  const ui = read("js/views/session-builder-ui.js");
  ok(/phase === "candidates" && selectedType === "stretch"/.test(ui),
     "backing out of the candidate list would enter equipment or build mode -- screens " +
     "the stretch path skipped forward");
});

console.log("\nTEST 10 - the cue is unpinned, the caution is not");

check("10-cue. only the caution renders on every page", () => {
  const card = read("js/exercise-card.js");
  const at = card.indexOf("const pinned =");
  ok(at > -1, "no pinned block");
  const block = card.slice(at, card.indexOf("`;", at));
  ok(block.includes("exercise-caution"), "the caution is no longer pinned -- it must be");
  ok(!block.includes("xcard-lead-cue"),
     "the coaching cue is still pinned, so the same paragraph appears on DECIDE, DO and " +
     "NOTE. It is coaching, not safety.");
  const dec = card.indexOf("const decide = [");
  ok(card.slice(dec, card.indexOf("].join", dec)).includes("cueBlock"),
     "the cue was unpinned but never placed on DECIDE, so it is now lost entirely");
});

console.log("\nTEST 11 - sore zones are marked, never decided for");

check("11. the picker marks sore areas and explains them in text", () => {
  const ui = read("js/views/session-builder-ui.js");
  ok(ui.includes("soreZones"), "the picker does not know which areas were reported sore");
  ok(ui.includes("sb-zone-chip--sore"), "sore chips are styled identically to the rest");
  ok(!/soreZones\.has\([^)]*\)\s*\?\s*["']disabled/.test(ui),
     "sore zones are disabled. Stretching a sore area is often the right call, and the " +
     "exercises are condition-filtered underneath -- mark it, do not decide it.");
  ok(ui.includes("sb-zone-note") && ui.includes("sore today"),
     "nothing explains the marking in words, so the meaning depends on colour alone");
});

console.log("\nTEST 12 - the programme banner names a real programme");

check("12. an ad-hoc session is not labelled Week 0", () => {
  const gp = read("js/views/gym-programme.js");
  const at = gp.indexOf("exercise-role-badge main");
  ok(at > -1, "no programme badge");
  const before = gp.slice(Math.max(0, at - 220), at);
  ok(/currentWeek\)\s*>\s*0/.test(before),
     "the badge renders unconditionally, so a one-off stretch announces itself as " +
     "'Your programme - Week 0 - Session B' -- week 0 of nothing");
});

console.log("\nTEST 13 - ZONE-WEIGHTING: a zone means what an exercise is FOR");

check("13a. only the leading areas count as primary", () => {
  // affectsAreas lists everything an exercise touches. Inchworm is
  // ["hamstring","hip-flexor","shoulder","lower-back"], so treating all
  // of it equally made it a shoulder stretch -- and an ask for neck and
  // shoulders returned four leg stretches out of five.
  ok(/const PRIMARY_DEPTH\s*=\s*[12]\b/.test(raw),
     "no PRIMARY_DEPTH, or it is deep enough to be meaningless");
  ok(/function isPrimaryFor/.test(raw), "no primary predicate");
  ok(/slice\(0,\s*PRIMARY_DEPTH\)/.test(raw),
     "the primary predicate does not restrict itself to the leading areas");
});

check("13b. the focused slots go to primary matches", () => {
  const at = raw.indexOf("export function zoneMatcher");
  ok(at > -1, "no zoneMatcher");
  const body = raw.slice(at, raw.indexOf("\n}", at));
  ok(body.includes("isPrimaryFor"),
     "zoneMatcher still matches on any area, so focused slots go to exercises the zone " +
     "merely touches");
});

check("13c. incidental matches rank, they are not excluded", () => {
  // Matching only primary would have dropped Neck & shoulders below the
  // offering floor -- removing Bend's headline zone to fix a bug. Rank,
  // do not filter: the same conclusion ARC-3 reached about categories.
  const at = raw.indexOf("function _applyZoneFocus");
  const body = raw.slice(at, raw.indexOf("\n}", at));
  ok(body.includes("isIncidentalFor"), "incidental matches are not banded separately");
  ok(/primary\.concat\(incidental, rest\)/.test(body),
     "the three bands are not concatenated in order, so a focused session either loses " +
     "its ordering or loses exercises");
});

check("13d. the offering floor counts primary content only", () => {
  const at = raw.indexOf("export function zoneContentCount");
  const body = raw.slice(at, raw.indexOf("\n}", at));
  ok(body.includes("isPrimaryFor"),
     "a zone can be offered on incidental matches alone, promising a focus the library " +
     "cannot honour");
});

check("13e. no zone offered today is withdrawn by the change", () => {
  // The floor moved 6 -> 5 precisely so that tightening the count does
  // not remove zones that are genuinely serviceable. If a future edit
  // breaks that trade, this fails.
  const offered = zonesWithCoverage();
  const labels = new Set(offered.map(z => z.label));
  for (const must of ["Neck & shoulders", "Upper back", "Lower back", "Hips",
                      "Glutes", "Hamstrings", "Quads", "Calves & ankles"]) {
    ok(labels.has(must), `"${must}" is no longer offered. Tightening the match must not ` +
       `withdraw a zone people can actually be given a session in.`);
  }
});

console.log(fails === 0
  ? "\nSECTION-RULES: all assertions pass\n"
  : "\nSECTION-RULES: " + fails + " FAILED\n");
process.exit(fails === 0 ? 0 : 1);
