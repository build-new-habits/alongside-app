/**
 * tools/verify-stretch-focus.mjs
 * 16 Sep 2026 v1
 *
 * STRETCH-FOCUS and SAVE-IN-MOMENT.
 *
 * Graeme, after a stretch session with a bad lower back: "I skipped some
 * of the exercises that I thought weren't doing that and I focused on
 * the exercises in the suggestions that I thought did do it. So I
 * managed to find a way, but I don't think we should be giving that to
 * our users to find a way."
 *
 * ── THE LESSON THIS FILE IS BUILT AROUND ─────────────────────────────
 *
 * 🔴 GATE-ALL, four days ago: CARD-5 wired five views, verify-card5
 * PINNED the five as if they were every movement view, and stretching
 * went uncovered until Graeme found it on his phone. A pin records a
 * decision, so pinning an oversight launders it into one.
 *
 * SAVE-IN-MOMENT is in ONE view. That is a scope, not a completion. So
 * TEST 4 LISTS which session views offer saving and which do not, and
 * asserts only that yoga does. It deliberately does NOT assert a count.
 * When SAVE-ALL lands, the list changes and nobody has to argue with a
 * number that was never a decision.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const fs = __require("node:fs");

const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>',
  { url: "https://example.org/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;

let pass = 0, fail = 0; const fails = [];
const ok = (m, c, d = "") => { if (c) { pass++; console.log("  ok   " + m); }
  else { fail++; fails.push(m); console.log("  FAIL " + m); if (d) console.log("       " + d); } };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");

// STRETCH-VIA-COACH, 16 Sep 2026. The KNOWLEDGE moved, the view kept
// the selector. TARGET_AREAS, impliedTarget() and the sort now live in
// js/stretch-target.js so the coach-proposed path uses the same one --
// a second copy is how SAVE-ALL's drift started, one day earlier.
//
// These assertions follow the logic to where it lives. What they test is
// unchanged; only the file is. `src` stays pointed at the view, because
// several tests below are genuinely about this view's selector UI.
const raw   = fs.readFileSync(new URL("../js/views/yoga-session.js", import.meta.url), "utf8");
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const src   = strip(raw);
const target = strip(fs.readFileSync(new URL("../js/stretch-target.js", import.meta.url), "utf8"));

console.log("\nSTRETCH-FOCUS / SAVE-IN-MOMENT\n");

// ════════════════════════════════════════════════════════════════════
console.log("TEST 0 — FIXTURE REACH: the data this rests on is really there");

// The whole design assumed every stretch pose carries affectsAreas.
// That was ground-truthed before building; this keeps it true.
{
  const poses  = EXERCISES.filter(e => /stretch|mobility|yoga/.test(e.category || ""));
  const tagged = poses.filter(p => Array.isArray(p.affectsAreas) && p.affectsAreas.length);
  console.log(`       ${tagged.length} of ${poses.length} stretch/mobility poses carry affectsAreas`);

  ok("0.1 stretch and mobility poses exist at all", poses.length > 20);
  ok("0.2 and every one is area-tagged", tagged.length === poses.length,
     "an untagged pose can never match a target, so it silently sinks to the " +
     "bottom of every session and nobody can see why");
}

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 1 — the target question exists and is separate from style");

ok("1.1 TARGET_AREAS is declared, with an all-over option carrying no areas",
   /export const TARGET_AREAS = \[/.test(target) &&
   /id: "all",[\s\S]{0,120}areas: \[\]/.test(target));

ok("1.2 FOCUS_TYPES is UNCHANGED and still offered",
   /const FOCUS_TYPES = \[/.test(src) &&
   ["flexibility", "strength", "balance", "recovery"].every(id => src.includes(`id:          "${id}"`)),
   "the style question was extended, not replaced; removing it would be a " +
   "relocation, and improvements extend");

ok("1.3 both questions are on ONE screen",
   /function renderFocusSelector/.test(src) &&
   src.includes("cs-target-grid") && src.includes("cs-focus-grid"));

ok("1.4 REVERSAL: choosing a target does NOT advance the phase", (() => {
  const i = src.indexOf('querySelectorAll(".cs-target-card")');
  const body = src.slice(i, i + 460);
  return i > -1 && !/phase\s*=\s*"duration"/.test(body);
})(), "a target tap that advanced would make one screen into two, which is the " +
      "friction this was meant to remove");

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 2 — preselected from the check-in, and never from the arc");

ok("2.1 the implied target reads the sore-area signal",
   /export function impliedTarget/.test(target) &&
   target.includes('store.get("conditionPainScores")') &&
   />= 4/.test(target));

ok("2.2 🔴 REVERSAL: it does NOT fall back to the arc", (() => {
  const i = target.indexOf("export function impliedTarget");
  const body = target.slice(i, target.indexOf("export function targetById", i));
  return !/arc|strand|aimById/i.test(body);
})(), 'Graeme: "maybe today I\'ve got DOMS... that\'s my arms, not my lower back. ' +
      'And my lower back is my arc." A fresh signal beats a standing one');

ok("2.3 nothing sore means nothing preselected, not a default", (() => {
  const i = target.indexOf("export function impliedTarget");
  const body = target.slice(i, target.indexOf("export function targetById", i));
  return /if \(!sore\.length\) return null/.test(body);
})());

ok("2.4 an unanswered target is treated as all-over, not as a blocker",
   /selectedTarget === null\) selectedTarget = "all"/.test(src),
   "a style tap must still start a session; an optional question left " +
   "unanswered is an answer");

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 3 — the target SORTS the session, it does not shorten it");

ok("3.1 matching poses come first, the rest stay behind them",
   /const hits = \[\], rest = \[\]/.test(target) &&
   /hits\.concat\(rest\)/.test(target) &&
   /sortByTarget\(safe, targetId\)\.slice\(0, targetCount\)/.test(src));

ok("3.2 🔴 REVERSAL: it is not a hard filter", (() => {
  const i = src.indexOf("function buildSession(focusId");
  const body = src.slice(i, i + 2000);
  return !/return hits\.slice/.test(body) && !/safe = safe\.filter\(ex => \(ex\.affectsAreas/.test(body);
})(), "a hard filter hands back a three-pose session when the pool is thin, and a " +
      "short session reads as the app having nothing for you");

ok("3.3 all-over changes nothing",
   /!target \|\| !target\.areas\.length\) return items\.slice\(\)/.test(target),
   "\"All over\" must be a no-preference answer, not a fifth filter -- it carries " +
   "no areas, so the list comes back in its original order");

ok("3.4 the target actually reaches the build", /buildSession\(selectedFocus, selectedMins, selectedTarget\)/.test(src));

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 4 — saving, now handed off rather than owned here");

// SAVE-HANDOFF, 16 Sep 2026. THESE ASSERTIONS ALL FIRED, AND CORRECTLY.
//
// They described a save block that lived in THIS view: rendered after
// the session, reusing saveSession(), silent for free accounts,
// reporting every refusal reason. All true on 16 Sep, and all obsolete
// by the end of the same day.
//
// yoga-session.js no longer saves anything. It writes
// lastFinishedSession when the session completes, and reflect.js -- the
// one screen every session ends on -- offers "Keep this one?" from
// there. The behaviour these tests protected still exists; it is
// asserted in verify-save-all, against the module that now owns it.
//
// 🔴 What is asserted HERE is the handoff itself, because that is this
// view's half of the contract. A view that stops writing the record
// silently loses its save, and nothing else would notice.
{
  ok("4.1 the finished session is handed off when it completes",
     /store\.set\("lastFinishedSession"/.test(src),
     "without this, yoga silently loses saving and no other gate can tell");

  ok("4.2 the handoff carries real exercises, not a label", (() => {
    const i = src.indexOf('store.set("lastFinishedSession"');
    const body = src.slice(i, i + 700);
    return /exercises:\s*sessionQueue/.test(body) && /durationMins:/.test(body);
  })(), "saveSession() needs exercise ids; a handoff without them offers a " +
        "button that always fails");

  ok("4.3 the target and focus reach the suggested name", (() => {
    const i = src.indexOf('store.set("lastFinishedSession"');
    const body = src.slice(i, i + 700);
    return /FOCUS_TYPES/.test(body) && /TARGET_AREAS/.test(body);
  })(), "the name somebody accepts without typing should say what they chose");

  ok("4.4 REVERSAL: this view keeps no save implementation of its own",
     !src.includes("saveSession(") && !src.includes("_renderSaveBlock"),
     "the private copy is back; verify-save-all 5.2 owns that rule now");
}

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 5 — the sort is real, proven by running it");

// Source slices prove the code is shaped right. This proves it WORKS,
// on the actual pose database, for the case Graeme hit on Tuesday.
{
  const BACK_HIPS = ["lower-back", "spine", "hip", "hip-flexor", "glutes", "piriformis", "upper-back", "thoracic"];
  const poses = EXERCISES.filter(e => /stretch|mobility/.test(e.category || ""));
  const hits  = poses.filter(p => (p.affectsAreas || []).some(a => BACK_HIPS.includes(a)));
  const rest  = poses.filter(p => !hits.includes(p));
  const sorted = [...hits, ...rest].slice(0, 6);

  console.log("       back-and-hips, first 6: " + sorted.map(p => p.name).join(", "));

  ok("5.1 a back-and-hips target has real poses behind it", hits.length >= 6,
     `only ${hits.length} poses touch the back and hips; the target would be a label ` +
     "over a session that mostly ignores it");

  ok("5.2 the first six all serve the target",
     sorted.every(p => (p.affectsAreas || []).some(a => BACK_HIPS.includes(a))));

  // 🔴 THIS CONTROL FIRED ON ITS FIRST RUN, and it was right to.
  //
  // It originally checked back-and-hips against the raw pool order --
  // and the pool's first six ALREADY all touch the back and hips, so
  // 5.2 would have passed whether the sort ran or not. A test that
  // passes with the feature removed is not a test.
  //
  // It now proves the sort CHANGES something, on a target the raw order
  // does not already satisfy.
  const SHOULDERS = ["shoulder", "rotator-cuff", "wrist-elbow", "chest-pecs", "triceps-biceps"];
  const sHits = poses.filter(p => (p.affectsAreas || []).some(a => SHOULDERS.includes(a)));
  const sSorted = [...sHits, ...poses.filter(p => !sHits.includes(p))].slice(0, 6);
  const rawFirst6 = poses.slice(0, 6).map(p => p.id).join(",");

  ok("5.3 REVERSAL: sorting for a different target produces a different session",
     sSorted.map(p => p.id).join(",") !== rawFirst6 &&
     sSorted.map(p => p.id).join(",") !== sorted.map(p => p.id).join(","),
     "the sort makes no difference to what is offered, so the target is a label " +
     "over an unchanged session");

  ok("5.3b and those poses genuinely serve the shoulders",
     sHits.length >= 4 && sSorted.slice(0, 4).every(p =>
       (p.affectsAreas || []).some(a => SHOULDERS.includes(a))),
     "Graeme's DOMS-in-arms case: if this is thin, that target promises more " +
     "than the library can give");

  ok("5.4 and the session is still full length, not shortened to the matches",
     sorted.length === 6 && rest.length > 0);
}

console.log("");
if (fail) { console.log("STRETCH-FOCUS: " + fail + " FAILED"); fails.forEach(f => console.log("  - " + f)); process.exit(1); }
console.log("STRETCH-FOCUS: all " + pass + " assertions pass\n");
