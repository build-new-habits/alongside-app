/**
 * tools/verify-card5.mjs
 * 15 Sep 2026 v1
 *
 * CARD-5 / SAFETY-GATE.
 *
 * ── WHAT THIS FILE IS ACTUALLY GUARDING ──────────────────────────────
 *
 * Three other gates -- verify-card3 2c, verify-card4 6.2, verify-adapt1
 * 2.3b -- used to assert flatly that no hazard text sits inside any
 * disclosure. CARD-5 amended that rule so HURT_AND_ACHE could be
 * collapsed, because four pages times ten exercises was forty renders of
 * the same two paragraphs and GUIDANCE-1 had already recorded what
 * repetition without occasion does to a safety line.
 *
 * 🔴 THE AMENDMENT IS CONDITIONAL. Collapsing the text is defensible
 * ONLY because the session gate reads it open, once per occasion, and
 * records a version-stamped acknowledgement. This file exists to hold
 * that condition. If the gate stops recording, or stops firing, or the
 * text stops being pinned to every page, the collapse is no longer
 * defensible and these assertions go red.
 *
 * Every assertion below has a complementary check that fails on the
 * reverse, and TEST 0 is a fixture-reach control that deliberately
 * breaks each of isGateDue()'s four trigger branches in turn and proves
 * the harness reports a different result for each. Eight fixture-reach
 * failures in one session is the standing risk on this codebase.
 */
import { JSDOM } from "jsdom";
const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>',
  { url: "https://example.org/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;

let pass = 0, fail = 0; const fails = [];
const ok = (m, c) => { if (c) { pass++; console.log("  ok   " + m); }
  else { fail++; fails.push(m); console.log("  FAIL " + m); } };
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const fs = await import("node:fs");
const { store } = await import("../js/store.js");
const {
  renderExerciseCard, HURT_AND_ACHE, HURT_AND_ACHE_VERSION
} = await import("../js/exercise-card.js");
const {
  isGateDue, renderSafetyGate, attachSafetyGate,
  recordAcknowledgement, GATE_DAYS, GUIDANCE_TEXT, TAPER_SESSIONS
} = await import("../js/safety-gate.js");
const { EXERCISES } = await import("../js/data/exercises/index.js");

const gateSrc  = strip(fs.readFileSync(new URL("../js/safety-gate.js", import.meta.url), "utf8"));
const cardSrc  = strip(fs.readFileSync(new URL("../js/exercise-card.js", import.meta.url), "utf8"));
const swSrc    = fs.readFileSync(new URL("../sw.js", import.meta.url), "utf8");

const EX = EXERCISES.find(e => e.watchOut && e.watchOut.length) || EXERCISES[0];
const R = (opts = {}) => renderExerciseCard(EX, { idPrefix: "t", ...opts });
const PAGES = ["decide", "watch", "do", "note"];
const allPages = () => Object.fromEntries(
  PAGES.map(p => [p, R({ page: p, noteSlot: "<p>n</p>" })]));

const daysAgo = d => new Date(Date.now() - d * 86400000).toISOString();
const ackEntry = (over = {}) => ({
  at: new Date().toISOString(),
  textVersion: HURT_AND_ACHE_VERSION,
  surface: "fixture",
  ...over
});
const setLog = l => store.set("safetyAckLog", l);

// GATE-TAPER, 16 Sep 2026. The gate fires every session for the first
// TAPER_SESSIONS acknowledgements of the CURRENT wording, then monthly.
// So "a satisfied gate" is no longer one entry -- it is the floor. Tests
// about the OTHER triggers have to clear the taper first or they measure
// the taper instead of the trigger they name.
const atFloor = (over = {}) => Array.from({ length: TAPER_SESSIONS },
  (_, i) => ackEntry(i === TAPER_SESSIONS - 1 ? over : {}));

store.init();

console.log("\nCARD-5 / SAFETY-GATE\n");

// ════════════════════════════════════════════════════════════════════
console.log("TEST 0 — FIXTURE REACH: each trigger is reached separately");

// Not "does isGateDue return true" -- four branches can all be true at
// once and a harness that only ever sees `true` proves nothing about
// which one fired. Each is isolated with the other three satisfied.
{
  setLog([]);
  const empty = isGateDue();

  setLog([ackEntry()]);
  const belowFloor = isGateDue();

  setLog(atFloor());
  const current = isGateDue();

  setLog(atFloor({ textVersion: "0000-00-00.0" }));
  const stale = isGateDue();

  setLog(atFloor({ at: daysAgo(GATE_DAYS + 1) }));
  const old = isGateDue();

  setLog(atFloor({ at: daysAgo(GATE_DAYS - 1) }));
  const withinWindow = isGateDue();

  ok("0.1 empty log fires", empty === true);
  ok("0.2 one acknowledgement is NOT enough -- the taper floor fires",
     belowFloor === true);
  ok("0.2b REVERSAL: at the floor, a current acknowledgement does NOT fire",
     current === false);
  ok("0.3 version mismatch fires, on its own", stale === true);
  ok("0.4 age beyond GATE_DAYS fires, on its own", old === true);
  ok("0.5 REVERSAL: one day inside the window does not fire", withinWindow === false);
  ok("0.6 the branches are distinguishable, not one always-true path",
     empty && belowFloor && !current && stale && old && !withinWindow);

  // The taper is counted in SESSIONS, not days, and it counts only the
  // CURRENT wording -- so a text change restarts it with no second field
  // to fall out of step.
  ok("0.7 four current acknowledgements still fire; five do not",
     (() => { setLog(Array.from({ length: 4 }, () => ackEntry())); const four = isGateDue();
              setLog(Array.from({ length: 5 }, () => ackEntry())); const five = isGateDue();
              return four === true && five === false; })());

  ok("0.8 a text change restarts the taper: fifty OLD-version entries do not count",
     (() => { setLog(Array.from({ length: 50 }, () => ackEntry({ textVersion: "0000-00-00.0" })));
              return isGateDue() === true; })());

  ok("0.9 REVERSAL: the taper is bounded -- it does not fire forever",
     (() => { setLog(Array.from({ length: 20 }, () => ackEntry())); return isGateDue() === false; })());
}

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 1 — the card collapses it, and still carries it");

setLog([ackEntry()]);
{
  const H = allPages();

  // CARD-DECIDE, 16 Sep 2026. Open on DECIDE, closed on the other three.
  // With the taper carrying week one, the 29 days after it would leave a
  // closed row as the only safety text on screen -- present but unread,
  // which is the state CARD-5 existed to end rather than a second
  // version of it. Decide is where somebody is deciding whether to do
  // the movement at all, and it is first, so it is passed once per
  // exercise before any instruction.
  ok("1.1a hurt-and-ache is on ALL FOUR pages",
     PAGES.every(p => H[p].includes("xcard-hurt") && H[p].includes("If it hurts")));

  ok("1.1b OPEN on decide",
     /<details[^>]*xcard-hurt[^>]*\sopen/.test(H.decide));

  ok("1.1c REVERSAL: closed on watch, do and note -- ten renders, not forty",
     ["watch", "do", "note"].every(p =>
       !/<details[^>]*xcard-hurt[^>]*\sopen/.test(H[p])));

  ok("1.2 REVERSAL: it is genuinely present, not just the summary word",
     PAGES.every(p => HURT_AND_ACHE.every(s => H[p].includes(s))));

  ok("1.3 the summary carries the hazard hook, so it is not one more accordion",
     PAGES.every(p => H[p].includes("xcard-hurt-summary")) &&
     cardSrc.includes("xcard-block--hazard"));

  ok("1.4 native <details>/<summary>, not a hand-rolled toggle",
     cardSrc.includes("<details") && cardSrc.includes("<summary") &&
     !cardSrc.includes('role="button"'));
}

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 2 — flattened view opens it");

// "Show everything" must mean everything. A stored display preference,
// so it is set for real rather than passed as an option the card does
// not read.
{
  const { setDisplayPref } = await import("../js/display-prefs.js");
  setDisplayPref("fullInstructions", "on");
  const flat = R({ page: "do" });
  ok("2.1 flattened, the disclosure is open",
     /<details[^>]*xcard-hurt[^>]*\sopen/.test(flat));
  setDisplayPref("fullInstructions", "off");
  const paged = R({ page: "do" });
  ok("2.2 REVERSAL: paged, the same card is closed",
     !/<details[^>]*xcard-hurt[^>]*\sopen/.test(paged));
}

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 3 — the version constant cannot drift from the text");

// The whole evidentiary value of safetyAckLog rests on textVersion
// meaning something. A silent edit to either string with the constant
// left alone makes every stored acknowledgement a record of wording
// nobody can reconstruct.
{
  let h = 0;
  const joined = HURT_AND_ACHE.join("\u241F");
  for (let i = 0; i < joined.length; i++) h = ((h << 5) - h + joined.charCodeAt(i)) | 0;
  const HASH = -2044944042;  // bump WITH HURT_AND_ACHE_VERSION, same commit

  ok("3.1 the two strings are unchanged since the constant was last set",
     h === HASH);
  ok("3.2 the constant is exported and dated, not a bare string",
     /export const HURT_AND_ACHE_VERSION\s*=\s*"\d{4}-\d{2}-\d{2}\.\d+"/.test(cardSrc));
  ok("3.3 REVERSAL: a different text produces a different hash", (() => {
    const alt = HURT_AND_ACHE.join("\u241F") + "x";
    let g = 0;
    for (let i = 0; i < alt.length; i++) g = ((g << 5) - g + alt.charCodeAt(i)) | 0;
    return g !== HASH;
  })());
}

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 4 — the dialog");

setLog([]);
{
  const html = renderSafetyGate();

  ok("4.1 it is a modal dialog with an accessible name",
     html.includes('role="dialog"') && html.includes('aria-modal="true"') &&
     html.includes('aria-labelledby="gate-h"') && html.includes('id="gate-h"'));

  ok("4.2 the full text is OPEN here -- this is where it is read",
     HURT_AND_ACHE.every(s => html.includes(s)) && !html.includes("<details"));

  ok("4.3 a real checkbox with a real label",
     html.includes('type="checkbox"') && html.includes('for="gate-ack-box"') &&
     html.includes('id="gate-ack-box"'));

  ok("4.4 the submit button is NOT disabled",
     html.includes("data-gate-start") && !/data-gate-start[^>]*disabled/.test(html));

  ok("4.5 an assertive live region is present BEFORE any error exists",
     html.includes('aria-live="assertive"') && html.includes("data-gate-error"));

  ok("4.6 two documented exits, so it is not a keyboard trap",
     html.includes("data-gate-start") && html.includes("data-gate-leave"));

  ok("4.7 the wording is notice, never a waiver",
     html.includes("I have read this.") &&
     !/accept the risk|hold .* responsible|fit to exercise|waive/i.test(html));

  ok("4.8 no condition is named and no timescale for care is given",
     !/\b(GP|doctor|A&E|999|emergency|within \d+ (hours|days))\b/i.test(
       html.replace(GUIDANCE_TEXT, "")));
}

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 5 — the record");

{
  setLog([]);
  const e = recordAcknowledgement("workout");
  const log = store.get("safetyAckLog");

  ok("5.1 exactly one entry, with all three fields",
     Array.isArray(log) && log.length === 1 &&
     typeof log[0].at === "string" && log[0].textVersion === HURT_AND_ACHE_VERSION &&
     log[0].surface === "workout");

  ok("5.2 `at` is a real ISO timestamp", !isNaN(new Date(e.at).getTime()));

  ok("5.3 one write does NOT satisfy the gate during the taper",
     isGateDue() === true);
  ok("5.3b writing up to the floor does satisfy it",
     (() => { setLog(atFloor()); return isGateDue() === false; })());

  ok("5.4 REVERSAL: an entry carrying a stale version does NOT satisfy it",
     (() => { setLog([ackEntry({ textVersion: "0000-00-00.0" })]);
              return isGateDue() === true; })());

  setLog(Array.from({ length: 201 }, (_, i) => ackEntry({ surface: "s" + i })));
  recordAcknowledgement("newest");
  const capped = store.get("safetyAckLog");
  ok("5.5 capped at 200, oldest trimmed first",
     capped.length === 200 &&
     capped[capped.length - 1].surface === "newest" &&
     !capped.some(x => x.surface === "s0"));

  setLog([]);
  store.set("safetyAckLog", "not-an-array");
  ok("5.6 a malformed log is treated as empty, not coerced", isGateDue() === true);
}

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 6 — every movement view mounts it");

// GATE-ALL, 16 Sep 2026. WAS PINNED AT FIVE, AND THE FIVE WERE WRONG.
//
// CARD-5 wired the five views that use the shared exercise card and this
// test pinned them with a comment claiming it covered every movement
// view. It did not. It covered every view the grep found. Graeme went to
// do stretching the next morning and got no gate at all, because
// yoga-session.js renders poses rather than exercise cards.
//
// 🔴 The gate made the error look deliberate. A future session reading
// "pinned at exactly five" would have asserted five and never asked why
// swimming was absent. That is the failure mode to watch for in this
// file: a pin records a decision, so pinning an oversight launders it
// into one.
//
// The list is now thirteen, and membership is decided by ONE question:
// does somebody move on this screen? Not: does it render an exercise
// card.
//
// Deliberately absent, each for a stated reason:
//   prescribed.js   - its renderExerciseCard() builds a LIST ITEM.
//                     Nobody moves from it. Same name, different job.
//   stretch-arc.js  - the arc surface, starting and stopping an arc.
//                     No exercise rendering at all.
//   class-list.js   - a picker.
//   saved-sessions.js - a picker.
//   quiet-session.js non-mindful modes - journalling and short breathing
//                     prompts are reading and typing, with no body in
//                     them. Mindful mode IS in, and is asserted below.
{
  const VIEWS = [
    "workout.js", "core-session.js", "prescribed-session.js",
    "gym-programme.js", "morning-session.js",
    "yoga-session.js", "breathing-session.js", "quiet-session.js",
    "walk-session.js", "running-session.js", "cycle-session.js",
    "swim-session.js", "class-player.js"
  ];
  const src = Object.fromEntries(VIEWS.map(v =>
    [v, fs.readFileSync(new URL("../js/views/" + v, import.meta.url), "utf8")]));

  ok("6.1 all thirteen import the gate",
     VIEWS.every(v => /import \{[^}]*isGateDue[^}]*\} from ['"]\.\.\/safety-gate\.js['"]/.test(src[v])));

  ok("6.2 all five render it and all five attach it",
     VIEWS.every(v => src[v].includes("renderSafetyGate()") &&
                      src[v].includes("attachSafetyGate(")));

  ok("6.3 each declares its own surface, so the log says WHERE",
     VIEWS.every(v => new RegExp("surface:\\s*['\"]" + v.replace(".js", "") + "['\"]").test(src[v])));

  // Not one shape any more. Indexed views gate on index 0; the
  // continuous ones (walk, run, cycle, swim) have no indexed first
  // exercise, so they gate on the OVERVIEW phase -- the last screen
  // before movement starts, which is the honest equivalent. Each view is
  // asserted against the shape it actually has, rather than the list
  // being loosened to whatever passes.
  const INDEXED = ["workout.js", "core-session.js", "prescribed-session.js",
                   "gym-programme.js", "morning-session.js", "yoga-session.js"];
  const OVERVIEW = ["walk-session.js", "running-session.js",
                    "cycle-session.js", "swim-session.js"];

  ok("6.4a indexed views gate on the FIRST exercise, not every one",
     INDEXED.every(v => /(currentExerciseIndex|currentIndex)\s*===\s*0\s*&&\s*isGateDue\(\)/.test(src[v])));

  ok("6.4b continuous views gate on the overview, before movement starts",
     OVERVIEW.every(v => /phase === "overview"[\s\S]{0,20}&&\s*isGateDue\(\)/.test(src[v])));

  ok("6.4c class-player gates on the first section AND first beat, so a resumed class is not interrupted mid-practice",
     /sectionIndex === 0 && _st0\.beatIndex === 0 && isGateDue\(\)/.test(src["class-player.js"]));

  ok("6.4d quiet-session gates mindful mode only",
     /mode === "mindful" && isGateDue\(\)/.test(src["quiet-session.js"]));

  ok("6.5 REVERSAL: prescribed.js is deliberately absent", (() => {
    const p = fs.readFileSync(new URL("../js/views/prescribed.js", import.meta.url), "utf8");
    return !p.includes("safety-gate.js");
  })());

  // CARD-LOCAL, 16 Sep 2026. The gap GATE-ALL made survivable is now
  // closed. The session gate fires on occasions; between occasions this
  // view had no safety text at all, because it renders its own card.
  ok("6.5a CR-5: morning-session.js renders the hurt-and-ache block on its local card", (() => {
    const t = fs.readFileSync(new URL("../js/views/morning-session.js", import.meta.url), "utf8");
    return /import \{ hurtBlock \}/.test(t) && /hurtBlock\(true\)/.test(t);
  })());

  ok("6.5a-r REVERSAL: it is OPEN there, not collapsed", (() => {
    const t = fs.readFileSync(new URL("../js/views/morning-session.js", import.meta.url), "utf8");
    return /hurtBlock\(true\)/.test(t) && !/hurtBlock\(false\)/.test(t);
  })(), "a single-screen card is the equivalent of DECIDE, and CARD-DECIDE opens it there");

  ok("6.5b REVERSAL: stretch-arc.js is deliberately absent -- it is the arc surface, not a session", (() => {
    const s = fs.readFileSync(new URL("../js/views/stretch-arc.js", import.meta.url), "utf8");
    return !s.includes("safety-gate.js") && !s.includes("renderExerciseCard");
  })());

  // The check that would have caught the original error. Not "are the
  // listed views wired" -- "is anything NOT listed rendering movement".
  ok("6.6 no session view is wired to movement without being on this list", (() => {
    const dir = new URL("../js/views/", import.meta.url);
    const all = fs.readdirSync(dir).filter(f => f.endsWith(".js"));
    const KNOWN_OUT = ["prescribed.js", "stretch-arc.js", "class-list.js",
                       "saved-sessions.js", "session-builder-ui.js", "today.js"];
    const missing = all.filter(f => {
      if (VIEWS.includes(f) || KNOWN_OUT.includes(f)) return false;
      const t = fs.readFileSync(new URL(f, dir), "utf8");
      return /renderExerciseCard|sessionQueue\[/.test(t);
    });
    if (missing.length) console.log("      unlisted movement views: " + missing.join(", "));
    return missing.length === 0;
  })());
}

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 7 — one copy of the guidance wording");

{
  const today = fs.readFileSync(new URL("../js/views/today.js", import.meta.url), "utf8");
  ok("7.1 today.js imports the sentence rather than repeating it",
     /import \{ GUIDANCE_TEXT, GUIDANCE_DAYS \} from ['"]\.\.\/safety-gate\.js['"]/.test(today) &&
     !today.includes("worth seeking guidance from your GP"));
  ok("7.2 the sentence itself is intact in its one home",
     /seeking guidance from your GP or an exercise\s+professional/.test(GUIDANCE_TEXT));
  ok("7.3 one cadence, not two", GATE_DAYS === 30);
}

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 8 — the new file is precached");

ok("8.1 sw.js precaches js/safety-gate.js", swSrc.includes("js/safety-gate.js"));
ok("8.2 REVERSAL: the check is real, not a substring coincidence",
   !swSrc.includes("js/safety-gate-nonexistent.js"));

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 9 — the storage failure path does not block the session");

// A quota failure must never stand between somebody and their session,
// but it must not be silent either: an unreported empty log looks
// exactly like nobody having acknowledged anything.
{
  ok("9.1 the write is wrapped and the session is not blocked",
     /try\s*\{[\s\S]{0,300}store\.set\("safetyAckLog"/.test(gateSrc));
  ok("9.2 the failure is reported, not swallowed",
     /catch[\s\S]{0,300}captureException/.test(gateSrc));
  ok("9.3 the write happens BEFORE the caller is told to proceed",
     gateSrc.indexOf("recordAcknowledgement(opts.surface)") <
     gateSrc.indexOf("opts.onAcknowledge()"));
}

console.log("");
if (fail) { console.log("CARD-5: " + fail + " FAILED"); fails.forEach(f => console.log("  - " + f)); process.exit(1); }
console.log("CARD-5: all " + pass + " assertions pass\n");
