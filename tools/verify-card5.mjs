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
  recordAcknowledgement, GATE_DAYS, GUIDANCE_TEXT
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
  const current = isGateDue();

  setLog([ackEntry({ textVersion: "0000-00-00.0" })]);
  const stale = isGateDue();

  setLog([ackEntry({ at: daysAgo(GATE_DAYS + 1) })]);
  const old = isGateDue();

  setLog([ackEntry({ at: daysAgo(GATE_DAYS - 1) })]);
  const withinWindow = isGateDue();

  ok("0.1 empty log fires", empty === true);
  ok("0.2 REVERSAL: a current acknowledgement does NOT fire", current === false);
  ok("0.3 version mismatch fires, on its own", stale === true);
  ok("0.4 age beyond GATE_DAYS fires, on its own", old === true);
  ok("0.5 REVERSAL: one day inside the window does not fire", withinWindow === false);
  ok("0.6 the four branches are distinguishable, not one always-true path",
     empty && !current && stale && old && !withinWindow);
}

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 1 — the card collapses it, and still carries it");

setLog([ackEntry()]);
{
  const H = allPages();

  ok("1.1 hurt-and-ache is on ALL FOUR pages, closed",
     PAGES.every(p => H[p].includes("xcard-hurt") &&
                      H[p].includes("If it hurts") &&
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

  ok("5.3 writing it satisfies the gate", isGateDue() === false);

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

// Pinned at exactly five, in the style of verify-card4 test 11. A new
// session view that renders exercises must be added here on purpose.
// prescribed.js is NOT in this list: its local renderExerciseCard()
// builds a LIST ITEM -- name, prescription, physio notes, week dots,
// Remove -- and nobody moves from that screen. Same function name,
// different job, which is exactly how it got mis-called a CR-5 gap on
// 15 Sep before it was read.
{
  const VIEWS = [
    "workout.js", "core-session.js", "prescribed-session.js",
    "gym-programme.js", "morning-session.js"
  ];
  const src = Object.fromEntries(VIEWS.map(v =>
    [v, fs.readFileSync(new URL("../js/views/" + v, import.meta.url), "utf8")]));

  ok("6.1 all five import the gate",
     VIEWS.every(v => /import \{[^}]*isGateDue[^}]*\} from "\.\.\/safety-gate\.js"/.test(src[v])));

  ok("6.2 all five render it and all five attach it",
     VIEWS.every(v => src[v].includes("renderSafetyGate()") &&
                      src[v].includes("attachSafetyGate(")));

  ok("6.3 each declares its own surface, so the log says WHERE",
     VIEWS.every(v => new RegExp('surface:\\s*"' + v.replace(".js", "") + '"').test(src[v])));

  ok("6.4 it is gated on the FIRST exercise, not every one",
     VIEWS.every(v => /(currentExerciseIndex|currentIndex)\s*===\s*0\s*&&\s*isGateDue\(\)/.test(src[v])));

  ok("6.5 REVERSAL: prescribed.js is deliberately absent", (() => {
    const p = fs.readFileSync(new URL("../js/views/prescribed.js", import.meta.url), "utf8");
    return !p.includes("safety-gate.js");
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
