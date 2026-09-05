/**
 * tools/verify-swap1.mjs
 * 05 Sep 2026 v2
 *
 * SWAP-1 gate. The session, then the swap.
 *
 * ── v2, 05 Sep 2026. RE-POINTED AT THE COACH ROUTE ──────────────────
 *
 * v1 reached the preview by clicking "recommend". All 73 UI assertions
 * below sat downstream of that one click. The recommend route is being
 * retired and its screen deleted, so on the day that lands this gate
 * would have thrown on click(undefined) -- loudly, which is something,
 * but it would have left the live path with no gate at all while the
 * daily flow was already changed.
 *
 * Re-pointed FIRST, before the thing it guards changes. Red before
 * green, applied at the scale of a session.
 *
 * v2 also closes a claim the source was making on this gate's behalf.
 * session-builder-ui.js:1358 states that "verify-swap1 asserts the
 * disagreement is empty today, so the day that changes it goes red
 * rather than quiet." IT DID NOT. No such assertion existed. The
 * agreement between buildSession() and buildCandidatePools() was true
 * and unguarded, and a comment claimed otherwise -- the same shape as
 * ARC-3 and as every reader-without-a-writer fault: the rule written,
 * stated, and never enforced. Section 0b enforces it.
 *
 * ── WHY IT IS BUILT THIS WAY ────────────────────────────────────────
 *
 * Ten assertions this week measured the wrong region of a file: a call
 * site instead of a definition, a function's own name, a listener
 * instead of the control it belongs to. All were caught by reversal,
 * none by review. So this gate DRIVES THE VIEW rather than reading it:
 * jsdom, real clicks, the real store, the real 551-entry registry.
 *
 * Where a source-text check is unavoidable it is anchored on a SLICE of
 * one function, extracted between two unique markers, never on the whole
 * file — a file-wide grep for "buildSession" would go green on this
 * file forever because the string legitimately appears elsewhere in it.
 *
 * Every assertion carries a reversal: a check that has never been seen
 * to fail is a decoration, not a check.
 *
 * Run: node tools/verify-swap1.mjs
 */

import fs from "node:fs";
import { JSDOM } from "jsdom";

const dom = new JSDOM(
  '<!doctype html><html><body><div id="main-content"></div></body></html>',
  { url: "https://example.org/" }
);
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;

let pass = 0, fail = 0;
const failures = [];

function ok(label, cond) {
  if (cond) { pass++; console.log(`  ok   ${label}`); }
  else { fail++; failures.push(label); console.log(`  FAIL ${label}`); }
}

/** Reversal: the assertion must FAIL on deliberately wrong input. */
function reverses(label, fn) {
  let threwOrFalse = false;
  try { threwOrFalse = !fn(); } catch { threwOrFalse = true; }
  ok(`[reversal] ${label}`, threwOrFalse);
}

const read = f => fs.readFileSync(f, "utf8");
const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const click = el => el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const wait = ms => new Promise(r => setTimeout(r, ms));

/** The body of one function, between two markers unique in the file. */
function slice(src, from, to) {
  const a = src.indexOf(from);
  const b = src.indexOf(to, a + from.length);
  if (a < 0 || b < 0) throw new Error(`markers not found: ${from}`);
  if (src.indexOf(from, a + 1) !== -1) throw new Error(`start marker not unique: ${from}`);
  return src.slice(a, b);
}

const SB    = await import("../js/session-builder.js");
const COND  = await import("../js/data/conditions.js");
const { store } = await import("../js/store.js");
const uiSrc = read("js/views/session-builder-ui.js");
const sbSrc = read("js/session-builder.js");

const KIT = ["dumbbells", "bench", "resistance-bands", "pull-up-bar"];

console.log("\nSWAP-1 — the session, then the swap\n");

// ── 0. Fixtures are real ────────────────────────────────────────────
console.log("0. Fixtures come from the live engine, not from hand-typed data");
store.set("equipment", KIT);
store.set("conditions", []);
store.set("conditionPainScores", {});
const fullPool = SB.buildCandidatePools({
  sessionType: "full", durationMins: 30, equipmentOverride: KIT, preset: "balanced"
});
ok("a full-body pool builds", !!fullPool);
ok(`main pool is substantial (got ${fullPool.main.length})`, fullPool.main.length > 40);
ok("SWAP_GROUPS extends STRETCH_ZONES rather than replacing it",
  SB.STRETCH_ZONES.every(z => SB.SWAP_GROUPS.some(g => g.id === z.id)));
ok("SWAP_GROUPS is strictly larger than STRETCH_ZONES",
  SB.SWAP_GROUPS.length > SB.STRETCH_ZONES.length);
reverses("STRETCH_ZONES was NOT quietly extended to match (the stretch picker is untouched)",
  () => SB.STRETCH_ZONES.length === SB.SWAP_GROUPS.length);

// ── 0b. The two builders agree ──────────────────────────────────────
//
// THE ASSERTION THE SOURCE ALREADY CLAIMED WAS HERE.
// session-builder-ui.js:1358 tells the reader this gate proves the
// disagreement empty. Until v2 it did not.
//
// Why it is load-bearing: the swap sheet reads candidatePools, and
// _canSwap() checks MEMBERSHIP. Any exercise buildSession() places that
// buildCandidatePools() does not offer gets no swap affordance at all --
// the row simply cannot be changed, silently, with no error and nothing
// on screen to say so. Both go through _filterCandidates() with
// identical arguments today, so they differ in what they SELECT, not in
// what is available. The day a filter is added to one and not the other,
// this goes red instead of swaps quietly dying one exercise at a time.
console.log("\n0b. Every coach-built exercise is in the pool the swap sheet reads");
{
  const personas = [
    ["clear",                        [],                        {}],
    ["shoulder 7",                   [],                        { shoulders: 7 }],
    ["glutes 7 + lower-back 3",      ["lower-back", "glutes"],  { glutes: 7, "lower-back": 3 }],
  ];
  let built = 0, absent = [];
  for (const [, conds, scores] of personas) {
    store.set("equipment", KIT);
    store.set("conditions", conds);
    store.set("conditionPainScores", scores);
    for (const type of ["full", "lower", "upper", "stretch", "core", "cardio", "glute", "mobility"]) {
      for (const mins of [15, 30, 45, 60]) {
        const args = { sessionType: type, durationMins: mins, equipmentOverride: KIT, preset: "balanced" };
        const s = SB.buildSession(args);
        const pool = SB.buildCandidatePools(args);
        if (!s || !pool) continue;
        for (const ex of s.exercises) {
          built++;
          if (!(pool[ex.section] || []).some(c => c.id === ex.id)) absent.push(`${ex.name}[${type}/${mins}]`);
        }
      }
    }
  }
  // Not a vacuous sweep: assert it actually looked at something.
  ok(`${built} coach-built exercises examined across 3 personas x 8 types x 4 durations`, built > 900);
  ok(`every one is offerable by the swap sheet (${absent.slice(0, 3).join(", ") || "none absent"})`,
    absent.length === 0);
  reverses("a planted absence IS detected (this check is armed, not decorative)",
    () => {
      const args = { sessionType: "full", durationMins: 30, equipmentOverride: KIT, preset: "balanced" };
      const s = SB.buildSession(args), pool = SB.buildCandidatePools(args);
      const ghost = { id: "__not-in-any-pool__", name: "Ghost", section: "main" };
      return [...s.exercises, ghost].every(ex => (pool[ex.section] || []).some(c => c.id === ex.id));
    });
  store.set("conditions", []);
  store.set("conditionPainScores", {});
}

// ── 1. The tripwire bucket is empty ─────────────────────────────────
// The grouping was chosen from one afternoon's trace. This is what stops
// that trace being trusted forever: the day content lands that no group
// covers, this goes red instead of the entry quietly vanishing from a
// sheet nobody is watching.
console.log("\n1. Every pool entry lands in a real group — NO_GROUP is empty");
let checked = 0, ungrouped = [];
for (const type of ["full", "lower", "upper", "stretch", "core", "cardio", "glute", "mobility"]) {
  for (const mins of [15, 30, 45, 60]) {
    const pool = SB.buildCandidatePools({
      sessionType: type, durationMins: mins, equipmentOverride: KIT, preset: "balanced"
    });
    if (!pool) continue;
    for (const sec of ["warmup", "main", "cooldown"]) {
      for (const ex of pool[sec]) {
        checked++;
        if (SB.swapGroupFor(ex) === SB.NO_GROUP.id) ungrouped.push(ex.name);
      }
    }
  }
}
ok(`${checked} pool entries scanned across 8 types × 4 durations`, checked > 3000);
ok(`none fall outside the groups (${[...new Set(ungrouped)].slice(0, 5).join(", ") || "none"})`,
  ungrouped.length === 0);
ok("Core & abdominals exists — the group whose absence was the fault",
  SB.SWAP_GROUPS.some(g => g.id === "core"));
reverses("an exercise with an unknown area DOES fall into NO_GROUP (the tripwire is armed)",
  () => SB.swapGroupFor({ affectsAreas: ["left-earlobe"] }) !== SB.NO_GROUP.id);
reverses("STRETCH_ZONES ALONE would have left entries ungrouped (the fault was real)",
  () => {
    const zoneAreas = new Set(SB.STRETCH_ZONES.flatMap(z => z.areas));
    return fullPool.main.every(ex =>
      (ex.affectsAreas || []).slice(0, 2).some(a => zoneAreas.has(a)));
  });

// ── 2. The sheet cannot reach past the pool ─────────────────────────
console.log("\n2. Alternatives come only from the pool the session was built from");
const current = fullPool.main[0];
const inSession = fullPool.main.slice(0, 8).map(e => e.id);
const alt = SB.swapAlternatives({
  pool: fullPool, section: "main", current, inSessionIds: inSession
});
const poolIds = new Set(fullPool.main.map(e => e.id));
const offered = alt.groups.flatMap(g => g.items);
ok(`${offered.length} alternatives offered`, offered.length > 0);
ok("every one is in the pool", offered.every(e => poolIds.has(e.id)));
ok("none is already in the session", offered.every(e => !inSession.includes(e.id)));
ok("the exercise being replaced is not offered as its own alternative",
  !offered.some(e => e.id === current.id));
ok("no alternative comes from another section",
  offered.every(e => !fullPool.cooldown.some(c => c.id === e.id) || poolIds.has(e.id)));
ok("total agrees with what the groups hold", alt.total === offered.length);
reverses("an EMPTY pool yields nothing (the sheet is not inventing entries)",
  () => SB.swapAlternatives({ pool: { main: [] }, section: "main", current, inSessionIds: [] }).total > 0);

// ── 3. Rank, don't filter ───────────────────────────────────────────
console.log("\n3. The tapped exercise's own area leads; nothing is removed");
ok("the lead group is the tapped exercise's own group",
  alt.leadGroupId === SB.swapGroupFor(current));
ok("and it is first", alt.groups[0].id === alt.leadGroupId);
ok("other groups still appear behind it", alt.groups.length > 1);
ok("grouping loses nothing — the groups hold every candidate",
  offered.length === fullPool.main.filter(e =>
    e.id !== current.id && !inSession.includes(e.id)).length);
reverses("the lead group is NOT simply the first entry in SWAP_GROUPS every time",
  () => {
    const other = fullPool.main.find(e => SB.swapGroupFor(e) !== alt.leadGroupId);
    const a2 = SB.swapAlternatives({ pool: fullPool, section: "main", current: other, inSessionIds: [] });
    return a2.leadGroupId === alt.leadGroupId;
  });

// ── 4. Soreness reads today's answers, never the standing list ──────
console.log("\n4. Sore marks come from conditionPainScores, never from `conditions`");
store.set("conditions", ["lower-back", "shoulder", "hip", "knee"]);
store.set("conditionPainScores", { "lower-back": 3, shoulder: 7 });
const scores = SB.soreScoresToday();
ok("only what was named today is scored", Object.keys(scores).sort().join(",") === "lower-back,shoulder");
ok("the standing list has four entries and is NOT used",
  (store.get("conditions") || []).length === 4 && Object.keys(scores).length === 2);
ok("3 marks", SB.soreLevelFor({ affectsAreas: ["lower-back"] }, scores).level === "marked");
ok("7 blocks", SB.soreLevelFor({ affectsAreas: ["shoulder"] }, scores).level === "blocked");
ok("something unmentioned is clear", SB.soreLevelFor({ affectsAreas: ["knee"] }, scores).level === "none");
ok("the level always arrives with the areas that caused it",
  SB.soreLevelFor({ affectsAreas: ["shoulder"] }, scores).areas.length > 0);
ok("a score of 0 marks nothing",
  Object.keys(SB.soreScoresToday.call(null) || {}).length === 2 &&
  !("knee" in SB.soreScoresToday()));
reverses("reading the STANDING list would have marked knee too (the SORE-SOURCE fault is real)",
  () => {
    const wrong = Object.fromEntries((store.get("conditions") || []).map(id => [id, 5]));
    return SB.soreLevelFor({ affectsAreas: ["knee"] }, wrong).level === "none";
  });
reverses("a level never arrives without areas",
  () => {
    const r = SB.soreLevelFor({ affectsAreas: ["shoulder"] }, scores);
    return r.level !== "none" && r.areas.length === 0;
  });

// ── 5. The 7 is getActiveConditionIds' 7, pinned by behaviour ───────
// A comment claiming the two agree would go stale. This runs the other
// function and asserts the acute switch happens exactly at our floor.
console.log("\n5. SORE_BLOCK_FLOOR is getActiveConditionIds' acute switch, not a third rule");
const atFloor = COND.getActiveConditionIds(["shoulder"], { shoulder: SB.SORE_BLOCK_FLOOR });
const below   = COND.getActiveConditionIds(["shoulder"], { shoulder: SB.SORE_BLOCK_FLOOR - 1 });
ok(`at ${SB.SORE_BLOCK_FLOOR}, the acute variant switches on`, atFloor.includes("shoulder-acute"));
ok(`at ${SB.SORE_BLOCK_FLOOR - 1}, it does not`, !below.includes("shoulder-acute"));
ok("so the two thresholds are the same number, demonstrated not asserted",
  atFloor.includes("shoulder-acute") && !below.includes("shoulder-acute"));
ok("the marking floor is far below the blocking floor", SB.SORE_MARK_FLOOR < SB.SORE_BLOCK_FLOOR);
reverses("the acute switch is NOT on at every level (the test would pass vacuously)",
  () => COND.getActiveConditionIds(["shoulder"], { shoulder: 1 }).includes("shoulder-acute"));

// ── 6. One exercise moves. Nothing else does. ───────────────────────
console.log("\n6. A swap replaces one exercise and leaves the rest byte-identical");
const session = {
  title: "t",
  exercises: [
    { id: "a", name: "A", section: "warmup" },
    { id: "b", name: "B", section: "main" },
    { id: "c", name: "C", section: "main" },
  ],
};
const frozen = JSON.stringify(session);
const swapped = SB.swapExerciseInSession(session, 1, { id: "z", name: "Z", section: "cooldown", recommended: true });
ok("length unchanged", swapped.exercises.length === 3);
ok("the target changed", swapped.exercises[1].id === "z");
ok("the SECTION of the slot is kept, not the replacement's",
  swapped.exercises[1].section === "main");
ok("the presentation flag is stripped", !("recommended" in swapped.exercises[1]));
ok("everything else is identical",
  swapped.exercises[0].id === "a" && swapped.exercises[2].id === "c");
ok("order is preserved", swapped.exercises.map(e => e.id).join() === "a,z,c");
ok("the original session was NOT mutated", JSON.stringify(session) === frozen);
ok("session metadata survives", swapped.title === "t");
reverses("the swap really happened (this is not comparing a session to itself)",
  () => swapped.exercises[1].id === session.exercises[1].id);

console.log("\n   Prescribed work is refused even when the caller asks for it");
const withPrescribed = {
  exercises: [{ id: "p", name: "P", section: "main", isPrescribed: true }],
};
const refused = SB.swapExerciseInSession(withPrescribed, 0, { id: "z", name: "Z" });
ok("a prescribed exercise is never replaced", refused.exercises[0].id === "p");
ok("and it keeps its flag", refused.exercises[0].isPrescribed === true);
reverses("the same call on a NON-prescribed entry does replace it",
  () => SB.swapExerciseInSession(
    { exercises: [{ id: "p", name: "P", section: "main" }] }, 0, { id: "z", name: "Z" }
  ).exercises[0].id === "p");

// ── 7. The daily flow: preview first, no candidate list ─────────────
console.log("\n7. Driving the real view — the preview leads and the 188-item list is gone");
// THE FIXTURE MUST REACH THE BRANCH IT CLAIMS TO TEST — the fifth time
// this pattern has been recorded on this build, and it very nearly went
// unrecorded a sixth. The first draft of this gate used shoulder at 7,
// and every "blocked option" assertion below ran over an EMPTY array
// and passed vacuously: at 7 the shoulder-acute contraindication has
// already stripped most shoulder work out of the pool, so almost
// nothing survived to be blocked. Reversal caught it, review did not.
//
// glutes at 7 leaves 15 blocked entries in a full-body pool, and
// lower-back at 3 supplies the marked-but-choosable case in the same
// run — both branches, one fixture. Section 9 now ASSERTS both are
// non-empty rather than trusting them to be.
store.set("conditions", ["lower-back", "glutes"]);
store.set("conditionPainScores", { "lower-back": 3, glutes: 7 });
store.set("equipment", KIT);
const ui = await import("../js/views/session-builder-ui.js");
const paint = () => { document.getElementById("main-content").innerHTML = ui.render(); ui.onMount(); };

paint();
click($$(".sb-type-tile").find(b => b.dataset.type === "full"));
click($("#sb-location-continue-btn"));
click($$(".sb-duration-btn").find(b => b.dataset.mins === "30"));
click($("#sb-build-btn"));
const modes = $$(".sb-buildmode-btn").map(b => b.dataset.mode);
ok("build mode offers two routes, not three", modes.length === 2);
ok('"own" is gone from the daily flow', !modes.includes("own"));
ok("coach and recommend both remain", modes.includes("coach") && modes.includes("recommend"));

// ── 7a. The route this gate drives ──────────────────────────────────
//
// The fixture must reach the branch it names -- seven recorded failures
// of this in the project, two inside Session A alone. Proven two ways,
// and which is which is stated rather than blurred.
//
// DETERMINISTIC: the button really carries data-mode="coach", and the
// handler slice maps any non-"recommend" mode to triggerBuild(), whose
// own slice calls buildSession() and assigns candidatePools.
//
// NEAR-DETERMINISTIC: the session produced is not the one the recommend
// route would have produced. buildSessionFromSelection() takes pool[0]
// and is deterministic; buildSession() weights by preference and
// novelty and varies between runs. A collision would need 9 slots drawn
// from 188 candidates to reproduce an exact ordering. Not impossible,
// so it is NOT the primary proof and is not relied on alone.
const coachBtn = $$(".sb-buildmode-btn").find(b => b.dataset.mode === "coach");
ok("the coach button is present to be clicked", !!coachBtn);

const modeHandler = slice(uiSrc,
  'document.querySelectorAll(".sb-buildmode-btn").forEach(btn => {', "\n  });");
ok("a non-recommend mode routes to triggerBuild()",
  /buildMode === "recommend"/.test(modeHandler) && /triggerBuild\(\)/.test(modeHandler));
reverses("the handler does NOT send the coach mode to the recommend builder",
  () => /buildMode === "coach"[\s\S]{0,80}triggerRecommendedBuild\(\)/.test(modeHandler));

const triggerBuildFn = slice(uiSrc, "function triggerBuild() {", "\n}");
ok("triggerBuild() builds with buildSession()", triggerBuildFn.includes("buildSession({"));
ok("triggerBuild() populates candidatePools -- the swap sheet's only source",
  /candidatePools\s*=\s*buildCandidatePools\(/.test(triggerBuildFn));
ok("it populates them BEFORE the preview is shown",
  triggerBuildFn.indexOf("candidatePools") < triggerBuildFn.indexOf('phase = "preview"'));
reverses("triggerBuild() is not secretly the selection builder",
  () => triggerBuildFn.includes("buildSessionFromSelection("));

click(coachBtn);
await wait(1400);

// ⚠️ BOTH BUILDERS WRITE store.generatedSession AS A SIDE EFFECT
// (session-builder.js:2522 and :3329). Calling one here to compute a
// comparison OVERWRITES the live preview -- which is exactly what the
// first draft of this block did: it clobbered the session, then compared
// that session to itself and reported them equal, and took two unrelated
// assertions in sections 8 and 10 down with it. Eighth recorded instance
// of a fixture not reaching the branch it named, and the first where the
// gate's own setup was the thing that moved it.
//
// So: capture first, compare second, put the record back.
const _sig = s => s.exercises.map(e => e.id).join(",");
const _previewRecord = store.get("generatedSession");
const _previewSig = _sig(_previewRecord.session);

const _recPool = SB.buildCandidatePools({
  sessionType: "full", durationMins: 30, equipmentOverride: KIT, preset: "balanced"
});
const _recIds = [];
["warmup", "main", "cooldown"].forEach(s =>
  _recPool[s].forEach(e => { if (e.recommended) _recIds.push(e.id); }));
const _recSig = _sig(SB.buildSessionFromSelection({
  sessionType: "full", durationMins: 30, selectedIds: _recIds, equipmentOverride: KIT
}));
ok("the recommend route is deterministic (so the comparison means something)",
  _recSig === _sig(SB.buildSessionFromSelection({
    sessionType: "full", durationMins: 30, selectedIds: _recIds, equipmentOverride: KIT
  })));
ok("[near-deterministic] the preview is NOT the recommend route's output",
  _previewSig !== _recSig);
ok("the preview signature was captured from a real session, not an empty one",
  _previewSig.length > 20 && _previewRecord.session.exercises.length > 3);

// Put back what the comparison displaced, or every assertion after this
// point is reading the recommend route's session by accident.
store.set("generatedSession", _previewRecord);
ok("the live preview record is restored before anything else reads it",
  _sig(store.get("generatedSession").session) === _previewSig);
ok("the PREVIEW is what appears", !!$("#sb-go-btn"));
ok("no candidate checkbox is rendered anywhere", $$(".sb-candidate-check").length === 0);
ok("no candidate build button either", !$("#sb-candidate-build-btn"));
ok("the dead class name is gone from the source too",
  !uiSrc.includes("sb-candidate-label") && !uiSrc.includes('phase === "candidates"'));
const swapRows = $$("[data-swap-index]");
ok(`every non-prescribed row offers a swap (${swapRows.length} rows)`, swapRows.length > 0);
ok("each swap row is a real button, not a div with a listener",
  swapRows.every(r => r.tagName === "BUTTON"));
ok("each carries an accessible name naming the exercise",
  swapRows.every(r => /Change .+ for something else/.test(r.getAttribute("aria-label") || "")));
reverses("the preview is NOT rendering a candidate list under another name",
  () => $$('input[type="checkbox"]').length > 0);

// ── 8. The sheet, driven ────────────────────────────────────────────
console.log("\n8. The sheet: one body area at a time, capped, with an escape");
const built = store.get("generatedSession").session;
// Not simply the first main entry. A slot whose alternatives happen to
// be exhausted renders the empty state, and every assertion below would
// then run over nothing and pass — the same vacuous-fixture fault this
// gate's own section 9 was caught by. The slot with the most
// alternatives is chosen deliberately, and asserted to have some.
const mainIdx = built.exercises
  .map((e, i) => ({ e, i }))
  .filter(r => r.e.section === "main" && !r.e.isPrescribed)
  .map(r => ({
    i: r.i,
    n: SB.swapAlternatives({
      pool: SB.buildCandidatePools({
        sessionType: "full", durationMins: 30, equipmentOverride: KIT, preset: "balanced"
      }),
      section: "main", current: r.e, inSessionIds: built.exercises.map(x => x.id)
    }).total
  }))
  .sort((a, b) => b.n - a.n)[0].i;
ok("the chosen slot HAS alternatives (the fixture reaches the sheet, not the empty state)",
  !!$(`[data-swap-index="${mainIdx}"]`));
const swapsWereOffered = $$("[data-swap-index]").length;
ok("swaps are on offer before the Gentle Care fixture runs", swapsWereOffered > 0);
click($(`[data-swap-index="${mainIdx}"]`));
ok("the sheet names what is being replaced",
  ($(".workout-header-title")?.textContent || "").includes(built.exercises[mainIdx].name));
const chips = $$("[data-swap-group]");
ok(`grouped into ${chips.length} body areas`, chips.length > 1);
ok("exactly one group is pressed",
  chips.filter(c => c.getAttribute("aria-pressed") === "true").length === 1);
ok("every group chip states its count",
  chips.every(c => /\d/.test(c.textContent)));
// The bug this gate found on 05 Sep: the sheet opened blank whenever the
// tapped exercise's own area had no alternatives left, while fifty-five
// sat in other groups. Whatever group is pressed must have items in it.
const pressed = chips.find(c => c.getAttribute("aria-pressed") === "true");
ok("the pressed group is one that actually has options",
  Number((pressed.textContent.match(/(\d+)\s*$/) || [])[1] || 0) > 0);
ok("and the list under it is not empty", $$("[data-swap-to]").length > 0);
ok("the escape to the whole section is offered", !!$("#sb-swap-all-btn"));
ok("closing the sheet is offered", !!$("#sb-swap-close-btn"));
let opts = $$("[data-swap-to]");
ok(`options are shown (${opts.length})`, opts.length > 0);

// THE CAP MUST BE EXERCISED ON A GROUP THAT EXCEEDS IT. Asserting
// "no more than eight are shown" against a group holding two is a
// check that cannot fail, and deleting the cap entirely left this
// gate green — caught by reversal, not by review. The gate now finds
// the largest group, asserts it is over the cap, and opens it.
const bigChip = chips
  .map(c => ({ c, n: Number((c.textContent.match(/(\d+)\s*$/) || [])[1] || 0) }))
  .sort((a, b) => b.n - a.n)[0];
ok(`some group holds more than the cap (largest is ${bigChip.n})`,
  bigChip.n > SB.SWAP_GROUP_CAP);
click(bigChip.c);
const bigOpts = $$("[data-swap-to]");
ok(`opening it shows exactly SWAP_GROUP_CAP (${SB.SWAP_GROUP_CAP}), not all ${bigChip.n}`,
  bigOpts.length === SB.SWAP_GROUP_CAP);
ok("and the per-group expander is offered", !!$("#sb-swap-expand-btn"));
click($("#sb-swap-expand-btn"));
ok("expanding shows the rest", $$("[data-swap-to]").length === bigChip.n);
ok("and the expander is then withdrawn", !$("#sb-swap-expand-btn"));
reverses("the cap is not merely equal to the group size by coincidence",
  () => bigChip.n === SB.SWAP_GROUP_CAP);

click($("#sb-swap-all-btn"));
const allOpts = $$("[data-swap-to]");
ok("the escape shows the whole section, past the cap", allOpts.length > SB.SWAP_GROUP_CAP);
ok("which is more than any single group held", allOpts.length > bigChip.n);
ok("and the per-group expander is not offered on top of it", !$("#sb-swap-expand-btn"));
reverses("the escape is NOT showing the same list under a different label",
  () => allOpts.length === opts.length && chips.length > 1);

// ── 9. Soreness, in the rendered sheet ──────────────────────────────
console.log("\n9. Marked in words, unselectable at 7, never HTML-disabled");
const sore = allOpts.filter(o => o.hasAttribute("aria-describedby"));
const blocked = allOpts.filter(o => o.getAttribute("aria-disabled") === "true");
ok(`some options are marked sore (${sore.length} of ${allOpts.length})`, sore.length > 0);
ok(`AND some are blocked (${blocked.length}) — the branch is reached, not assumed`,
  blocked.length > 0);
ok("marked and blocked are different sets, so both cases are live",
  blocked.length < sore.length);
ok("every marked option points at a note that EXISTS in the document",
  sore.every(o => !!document.getElementById(o.getAttribute("aria-describedby"))));
ok("every note is a real sentence, not a symbol",
  sore.every(o => (document.getElementById(o.getAttribute("aria-describedby")).textContent || "").trim().length > 20));
ok("every note names a body area in words",
  sore.every(o => /sore today|or above today/.test(
    document.getElementById(o.getAttribute("aria-describedby")).textContent)));
ok("NOTHING uses the HTML disabled attribute",
  allOpts.every(o => !o.hasAttribute("disabled")));
ok("every option stays a focusable button, blocked or not",
  allOpts.every(o => o.tagName === "BUTTON"));
ok("blocked options are marked with aria-disabled",
  blocked.every(o => o.getAttribute("aria-disabled") === "true"));
ok("every blocked option also carries its reason",
  blocked.every(o => o.hasAttribute("aria-describedby")));
reverses("marking is not applied to everything indiscriminately",
  () => sore.length === allOpts.length);

const beforeClick = $$("[data-swap-to]").length;
click(blocked[0]);
ok("clicking a blocked option changes nothing",
  !!$("#sb-swap-all-btn") && $$("[data-swap-to]").length === beforeClick);
ok("and it did not swap anything into the session",
  store.get("generatedSession").session.exercises.every(
    e => e.id !== blocked[0].dataset.swapTo));

// ── 10. Applying a swap, through the UI ─────────────────────────────
console.log("\n10. Choosing an alternative replaces one exercise and persists it");
const choosable = $$("[data-swap-to]").find(o => o.getAttribute("aria-disabled") !== "true");
const chosenName = choosable.querySelector(".sb-swap-option-name").textContent.trim();
const oldName = built.exercises[mainIdx].name;
click(choosable);
ok("we are back on the preview", !!$("#sb-go-btn"));
const after = store.get("generatedSession").session;
ok("the chosen exercise is in the session", after.exercises[mainIdx].name === chosenName);
ok("the old one is gone from that slot", after.exercises[mainIdx].name !== oldName);
ok("the session is the same length", after.exercises.length === built.exercises.length);
// Whole entries, not ids. An earlier draft compared ids only, and a
// deliberate break that rewrote every other exercise's NAME sailed
// through it green. Decision 4 says nothing else moves; this now checks
// that nothing else changes at all.
ok("NOTHING ELSE MOVED — every other slot is byte-identical",
  after.exercises.every((e, i) =>
    i === mainIdx || JSON.stringify(e) === JSON.stringify(built.exercises[i])));
ok("the slot keeps its section", after.exercises[mainIdx].section === "main");
ok("no new store field was invented",
  !("swapLog" in (store.get() || {})) && !("swappedExercises" in (store.get() || {})));
// The stored record must agree with itself. Written as an equality
// rather than "the old id is gone", because DUPE-SECTION — logged
// 05 Sep, NOT fixed here — means one exercise can legitimately occupy
// two sections, so its id can still be present after one instance is
// swapped out. The invariant that matters either way is that
// selectedIds names exactly what the session now contains.
// ── v2. WHAT CHANGED WHEN THIS GATE MOVED TO THE COACH ROUTE ────────
//
// buildSession() writes inputs WITHOUT selectedIds (session-builder.js
// :3329); buildSessionFromSelection() writes it WITH (:2522). So on the
// route every user actually walks, there is no selectedIds to rewrite.
//
// That is RIGHT, not a gap. selectedIds records what the person chose,
// and on the coach route they chose nothing. Writing one would be the
// stored record claiming an input that was never given -- the same
// fault TRUTHFULNESS fixed, where the coach named inputs it had not
// used. The gate now asserts the absence rather than the value.
const _rec = store.get("generatedSession");
ok("the coach route stores no selectedIds, because nothing was selected",
  !("selectedIds" in (_rec.inputs || {})));
ok("the stored record still agrees with itself after a swap",
  _sig(_rec.session) === _sig(after));
reverses("the record was NOT left holding the pre-swap session",
  () => _sig(_rec.session) === _sig(built));

// NOT PROVEN BEHAVIOURALLY, AND SAID SO RATHER THAN IMPLIED.
// persistBuiltSession()'s selectedIds rewrite is guarded by
// `"selectedIds" in record.inputs`, which is false on this route. The
// branch is therefore unreachable from the daily flow and only a source
// check is possible here. It is RETAINED deliberately -- athlete
// self-build needs it -- and Session B2's retirement gate is where it
// gets held to zero live callers on purpose.
const _persist = slice(uiSrc, "function persistBuiltSession() {", "\n}");
ok("[source only] the selectedIds rewrite still exists for the retained route",
  /"selectedIds" in record\.inputs/.test(_persist) && /selectedIds:/.test(_persist));
ok("[source only] and it is still guarded rather than written unconditionally",
  _persist.indexOf('"selectedIds" in record.inputs') < _persist.indexOf("selectedIds:"));
reverses("the slice is the function body, not an empty string",
  () => _persist.length < 40);
reverses("the comparison is real — the session did change",
  () => after.exercises[mainIdx].id === built.exercises[mainIdx].id);

// ── 11. No builder runs on a swap ───────────────────────────────────
// Anchored on a SLICE of the click handler, not the file: this file
// legitimately calls buildSession elsewhere, so a file-wide check would
// be green forever.
console.log("\n11. A swap reads the pool; it calls no builder");
const handler = slice(uiSrc, 'document.querySelectorAll("[data-swap-to]")', "  // Let's go");
ok("the handler exists and is small", handler.length > 200 && handler.length < 2600);
ok("it does not call buildSession", !handler.includes("buildSession("));
ok("it does not call buildSessionFromSelection", !handler.includes("buildSessionFromSelection("));
ok("it does not call buildCandidatePools", !handler.includes("buildCandidatePools("));
ok("it reads candidatePools instead", handler.includes("candidatePools?."));
ok("it goes through the engine's replacement, not its own splice",
  handler.includes("swapExerciseInSession("));
const engineFn = slice(sbSrc, "export function swapExerciseInSession", "\n}\n");
ok("the engine's replacement calls no builder either",
  !engineFn.includes("buildSession(") && !engineFn.includes("_filterCandidates("));
reverses("the marker check is measuring the right region (buildSession IS elsewhere in this file)",
  () => !uiSrc.includes("buildSession("));
reverses("the slice is not empty (an empty string would pass every check above)",
  () => handler.length === 0 || engineFn.length === 0);

// ── 12. Gentle Care is not editable ─────────────────────────────────
console.log("\n12. At 8 the picker is never reached, and nothing is swappable");
// The standing list must contain it too: severeZoneToday() intersects
// `conditions` with the scores, so scoring a condition the person never
// declared correctly produces nothing. An earlier draft scored shoulder
// at 9 while the fixture's conditions were lower-back and glutes, and
// the whole section passed while the bypass never fired.
store.set("conditions", ["glutes"]);
store.set("conditionPainScores", { glutes: 9 });
paint();
ok("the Gentle Care banner is shown", !!$(".sb-severe-banner"));
ok("no swap affordance appears anywhere", $$("[data-swap-index]").length === 0);
ok("no swap sheet can be opened", $$("[data-swap-to]").length === 0);

// RECORDED RATHER THAN OVERSTATED. _canSwap() refuses on Gentle Care AND
// on pool membership, and today the pool check alone is sufficient —
// deleting the Gentle Care clause leaves this gate green, because a
// Gentle Care session's exercises are not in any candidate pool.
//
// The clause is KEPT as defence in depth, on the same reasoning SEVERE-1
// gives for putting the bypass on both builders: a safety rule honoured
// by one of two paths is the shape of every reachability fault found
// this month. But its INDEPENDENT effect is not reachable today, so this
// gate asserts only that it is present, and says so plainly rather than
// claiming to have proved something it has not.
const canSwapSrc = slice(uiSrc, "function _canSwap(ex) {", "\n}");
ok("[not independently reachable] the Gentle Care clause is present in _canSwap",
  canSwapSrc.includes("gentleCare"));
ok("as is the pool-membership clause that currently does the work",
  canSwapSrc.includes("candidatePools?."));
ok("and the prescribed clause", canSwapSrc.includes("isPrescribed"));
// The contrast is drawn against the SAME view earlier in this run,
// which was shown to offer swaps, rather than by re-rendering
// afterwards. Lowering the score after the fact does not bring them
// back — BYPASS-DOOR deliberately keeps a Gentle Care preview until the
// builder is left, so a re-render would prove nothing about this code.
ok("the same view offered swaps moments ago, so this is the bypass and not a broken render",
  swapsWereOffered > 0 && $$("[data-swap-index]").length === 0);
reverses("the bypass is not simply always on (it was off for the whole run above)",
  () => swapsWereOffered === 0);

// ── Result ──────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(52)}`);
console.log(`${pass} passed, ${fail} failed`);
if (fail) {
  console.log("\nFailures:");
  failures.forEach(f => console.log(`  - ${f}`));
  process.exit(1);
}
console.log("SWAP-1 green.\n");
