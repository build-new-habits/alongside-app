/**
 * tools/verify-card3.mjs
 * 04 Oct 2026 v3
 *
 * v3 - D-1 EXERCISE-FOUR. REVERSAL, Graeme's request on the device test
 *   (Option B, approved in the mock-up): 10b said `why` was off the card
 *   entirely; the exercise's own why is now the first of the four steps,
 *   so 10b asserts it renders there and nowhere else on the card.
 *
 * 28 Sep 2026 v2
 *
 * v2 - SMOOTH-P2c. workout.js left the page model for one screen per
 *   exercise (spec 4.4; exercise-card.js v12 layout "flow"). Tests 3, 4b
 *   and 11 keep asserting the page model on the three views still on it,
 *   and assert the SAME property on workout.js in the form it now takes:
 *   3w skip is offered only before the exercise is done; 4w nothing but
 *   the Start button starts the clock; 11w no page handler, so it cannot
 *   answer for another view's card. 2d holds the safety order inside the
 *   flow layout: caution, then what to watch for, outside any
 *   disclosure, before "How to do it". Nothing loosened.
 *
 * Gate for CARD-3. Replaces verify-card2.mjs, which is deleted rather
 * than left passing against a tab model that no longer exists.
 *
 * The assertions that mattered under CARD-1 and CARD-2 are carried over
 * rather than dropped -- caution first, hazards not buried, no history
 * count on screen -- because the reason for each is unchanged even
 * though the mechanism changed twice.
 *
 * THE RISK SPECIFIC TO PAGES. A page is not lateral like a tab: you are
 * moved to it, and only one is ever on screen. That is the point, and it
 * is also the danger -- anything safety-bearing that ends up scoped to
 * one page is invisible on the other two. Most of this file exists to
 * keep bodyCaution and the hazard list out of page scope.
 *
 * NO NEGATIVE DISTANCE WINDOWS. Positional assertions compare indexOf to
 * indexOf, which cannot pass by drifting apart.
 *
 * Every assertion here has been reversal-tested: the change described in
 * the blueprint's gate table was applied, the gate was watched failing,
 * and the change was reverted. A gate that has never failed proves
 * nothing.
 */
import fs from "node:fs";

// GATE-PATH, 08 Sep 2026. Paths resolved from import.meta.url, not the
// working directory.
//
// 72 of 139 gates read files by a path relative to process.cwd(), so
// they were green from the repo root and read NOTHING from anywhere
// else. Not a live fault -- every session so far has run them from the
// root -- but an expensive trap: a session running the suite by full
// path from elsewhere sees most of it red and reasonably concludes the
// app is broken.
const _GATE_ROOT = new URL("../", import.meta.url);
const _gatePath = (p) => new URL(String(p).replace(/^\.\//, ""), _GATE_ROOT);


let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const cardRaw = fs.readFileSync(_gatePath("js/exercise-card.js"), "utf8");
const card    = strip(cardRaw);
const timing  = strip(fs.readFileSync(_gatePath("js/exercise-timing.js"), "utf8"));

const VIEWS = ["js/views/workout.js", "js/views/prescribed-session.js",
               "js/views/gym-programme.js", "js/views/core-session.js"];
const src = {};
for (const v of VIEWS) src[v] = strip(fs.readFileSync(_gatePath(v), "utf8"));
// SMOOTH-P2c. Still on the four-page model.
const PAGED = VIEWS.filter(v => v !== "js/views/workout.js");
const WO = src["js/views/workout.js"];

// The action-bar ids each view binds by. Renaming one silently unbinds a
// control, which is the failure this whole slot design exists to avoid.
const IDS = {
  "js/views/workout.js":            ["timer-toggle-btn", "complete-exercise-btn", "skip-exercise-btn"],
  "js/views/prescribed-session.js": ["ps-timer-btn", "ps-complete-btn", "ps-skip-btn", "ps-back-btn"],
  "js/views/gym-programme.js":      ["gp-timer-btn", "gp-next-btn", "gp-skip-btn", "gp-swap-btn"],
  "js/views/core-session.js":       ["cs-timer-btn", "cs-next-btn", "cs-skip-btn", "cs-back-btn"],
};

// Slice a view's per-page action-bar branch. Returns "" if the view has
// not been migrated yet, which the callers treat as a failure rather
// than a pass -- an unmigrated view is not a compliant one.
function pageBranch(text, page) {
  const guard = 'currentCardPage === "' + page + '"';
  const at = text.indexOf(guard);
  if (at < 0) return "";
  const next = text.indexOf("currentCardPage ===", at + guard.length);
  return text.slice(at, next < 0 ? text.length : next);
}

console.log("\nTEST 1 - the caution is not page-scoped");

check("1a. the pinned block carries the caution, and ONLY the caution", () => {
  // DECISION REVERSED, 02 Sep 2026 (Graeme). This assertion originally
  // required the lead cue to be pinned alongside the caution. On device
  // that meant the same paragraph -- "this is exploration, not
  // performance" -- appeared on DECIDE, DO and NOTE, three screenshots
  // in a row.
  //
  // The reasoning that pinned the CAUTION is unchanged and still holds:
  // a safety line you have navigated away from is more hidden than one
  // that is collapsed. The cue is coaching, not safety, and repeating it
  // three times taught people to skip the block that also carries the
  // caution -- so pinning both made the caution LESS likely to be read.
  //
  // This is a narrowing, not a weakening: the caution requirement is
  // strengthened by an explicit "and nothing else".
  const pin = card.indexOf("const pinned =");
  ok(pin > -1, "no pinned block");
  const body = card.slice(pin, card.indexOf("`;", pin));
  ok(body.includes("exercise-caution"), "the caution is not pinned; it would sit on one page only");
  ok(!body.includes("xcard-lead-cue"),
     "the lead cue is pinned again, so it repeats on all three pages and dilutes the " +
     "caution it sits beside");

  // Unpinned must not mean lost.
  const dec = card.indexOf("const decide = [");
  ok(dec > -1, "no decide body");
  ok(card.slice(dec, card.indexOf("].join", dec)).includes("cueBlock"),
     "the cue was unpinned but never placed on DECIDE, so it is gone entirely");
});

check("1b. pinned content renders before the page body in both paths", () => {
  const flat = card.indexOf("exercise-card--flat");
  const paged = card.indexOf("exercise-card--paged");
  ok(flat > -1 && paged > -1, "a render path is missing");
  const pageSlot = card.indexOf("${bodies[page]");
  const pinnedUse = card.indexOf("${pinned}", paged - 400 > 0 ? paged - 400 : 0);
  ok(pinnedUse > -1 && pinnedUse < pageSlot, "the page body renders before the pinned caution");
});

check("1c. no page body may contain the caution", () => {
  for (const name of ["const decide =", "const doBody ="]) {
    const i = card.indexOf(name);
    ok(i > -1, name + " missing");
    const body = card.slice(i, card.indexOf("].join", i));
    ok(!body.includes("caution"), name + " includes the caution; it must stay pinned");
  }
});

// CARD-4, 13 Sep 2026. The hazards moved to a page of their own, so
// these checks follow them to WATCH rather than being relaxed. The
// safety ORDER they existed to protect is unchanged and is now asserted
// structurally: WATCH comes before DO in PAGES, and HURT_AND_ACHE is
// pinned above every page body. Runtime proof of all of it is in
// verify-card4 tests 2, 4 and 8.
console.log("\nTEST 2 - hazards are on WATCH, unhidden, and ahead of DO");

check("2a. watchOut renders in the WATCH body", () => {
  const i = card.indexOf("const watchBody =");
  ok(i > -1, "no watchBody");
  const body = card.slice(i, card.indexOf("].join", i));
  ok(body.includes("watchOut"), "the hazard list is not on WATCH -- CARD-4 moved it there");
});

check("2a2. and no longer on DO", () => {
  const i = card.indexOf("const doBody =");
  ok(i > -1, "no doBody");
  const body = card.slice(i, card.indexOf("].join", i));
  ok(!body.includes("watchOut"), "the hazard list is still on DO; CARD-4 moved it to WATCH");
});

check("2b. the warnings page comes before the instructions page", () => {
  const p = card.indexOf("const PAGES =");
  ok(p > -1, "no PAGES");
  const pages = card.slice(p, card.indexOf("];", p));
  const w = pages.indexOf('"watch"'), d = pages.indexOf('"do"');
  ok(w > -1 && d > -1, "a page is missing from PAGES");
  ok(w < d, "DO precedes WATCH; moving forward would reach the instructions before the warnings");
});

check("2b2. the universal hazard is pinned, so it precedes every page body", () => {
  const i = card.indexOf("const pinned =");
  ok(i > -1, "no pinned block");
  const body = card.slice(i, card.indexOf("`;", i));
  // CARD-5: pinned now calls hurtBlock() rather than inlining the HTML.
  // The guarantee is unchanged -- present on every page -- so the
  // assertion follows the indirection rather than being weakened.
  ok(body.includes("hurtBlock("),
     "HURT_AND_ACHE is not pinned; CR-5 requires it on every page, and CARD-4 moved the hazards off DO");
  const h = card.indexOf("function hurtBlock");
  ok(h > -1, "hurtBlock() is gone; pinned points at nothing");
  ok(card.slice(h, h + 500).includes("HURT_AND_ACHE_HTML"),
     "hurtBlock() does not render HURT_AND_ACHE; the pin is a shell");
});

// CARD-5, 15 Sep 2026. AMENDED, AND THE AMENDMENT IS NARROW.
//
// This read "nothing gates EITHER hazard behind an interaction". The
// exercise-specific watchOut is still ungated and always will be. The
// universal HURT_AND_ACHE now sits in a closed <details>, on purpose:
// four pages times ten exercises was forty renders of the same two
// paragraphs, and GUIDANCE-1 already recorded what repetition without
// occasion does to a safety line.
//
// What makes that defensible is not this file relaxing -- it is
// safety-gate.js reading the text open, once per occasion, and
// recording the acknowledgement. verify-adapt1 test 2.5 asserts that
// condition, and verify-card5 asserts it again from the other side.
//
// The EXERCISE-SPECIFIC hazard keeps the original rule unchanged.
check("2c. the exercise-specific hazard is never behind an interaction", () => {
  for (const which of ["const watchBody =", "const doBody ="]) {
    const i = card.indexOf(which);
    const body = card.slice(i, card.indexOf("].join", i));
    for (const bad of ["<details", "<summary", "hidden", "aria-expanded", "data-xcard-back"]) {
      ok(!body.includes(bad),
         which.replace("const ", "").replace(" =", "") + " wraps its content in " + bad +
         "; the hazards must need no interaction");
    }
  }
});

check("2d. flow layout: caution, then what to watch for, outside any disclosure, before how to do it", () => {
  const i = card.indexOf('opts.layout === "flow"');
  ok(i > -1, "no flow layout");
  const body = card.slice(i, card.indexOf("const backTo", i));
  const c = body.indexOf("exercise-caution"), w = body.indexOf("${watchBody}"), h = body.indexOf("How to do it");
  ok(c > -1 && w > -1 && h > -1, "flow layout is missing caution, watchBody or How to do it");
  ok(c < w && w < h, "the flow layout puts instructions before the hazards");
  const before = body.slice(0, w);
  ok((before.match(/<details/g) || []).length === (before.match(/<\/details>/g) || []).length,
     "what to watch for sits inside a disclosure");
});

console.log("\nTEST 3 - Skip is on DECIDE and nowhere else");

check("3w. workout.js (one screen) offers skip only before the exercise is done", () => {
  const at = WO.indexOf("${exerciseDone ? `");
  ok(at > -1, "workout.js has no done/not-done action branch");
  const elseAt = WO.indexOf("` : `", at);
  const skipAt = WO.indexOf('id="skip-exercise-btn"', at);
  ok(elseAt > -1 && skipAt > elseAt, "skip renders once the exercise is done");
});

for (const v of PAGED) {
  check("3. " + v.split("/").pop() + " renders skip on DECIDE only", () => {
    const t = src[v];
    const skipId = IDS[v].find(x => x.includes("skip"));
    ok(skipId, "no skip id known for " + v);
    const decide = pageBranch(t, "decide");
    ok(decide !== "", v + " has no DECIDE branch; it has not been migrated to the page model");
    ok(decide.includes(skipId), "skip does not render on DECIDE");
    for (const page of ["do", "note"]) {
      const b = pageBranch(t, page);
      ok(!b.includes('id="' + skipId + '"'), "skip also renders on " + page.toUpperCase());
    }
  });
}

console.log("\nTEST 4 - landing on DO does not start the clock");

check("4a. the card never starts a timer", () => {
  for (const bad of ["startTimer", "setInterval", "setTimeout"]) {
    ok(!card.includes(bad), "exercise-card.js calls " + bad + "; the card must not drive the clock");
  }
});

check("4w. workout.js: only the Start button starts the clock", () => {
  const calls = [...WO.matchAll(/(?<!function )startTimer\(\)/g)].map(m => m.index);
  const handler = WO.indexOf('getElementById("timer-toggle-btn")');
  ok(handler > -1, "no timer toggle handler");
  ok(calls.length > 0 && calls.every(i => i > handler && i < handler + 400),
     "startTimer() is called somewhere other than the Start button's handler");
});

for (const v of PAGED) {
  check("4b. " + v.split("/").pop() + "'s forward-to-DO handler does not start the clock", () => {
    const t = src[v];
    const at = t.indexOf('currentCardPage = "do"');
    ok(at > -1, v + " has no forward-to-DO transition; it has not been migrated");
    const window = t.slice(at, at + 300);
    ok(!window.includes("startTimer("), "moving to DO calls startTimer(); auto-starting punishes reading");
  });
}

console.log("\nTEST 5 - last time is their own words and nothing else");

check("5a. the last-time panel prints lastLine() verbatim and computes nothing", () => {
  const i = card.indexOf("const lastBlock");
  ok(i > -1, "no lastBlock");
  const body = card.slice(i, card.indexOf('    : "";', i));
  // lastLine() returns markup and escapes its own user content, so the
  // card injects it raw. Escaping it printed the tags on screen.
  ok(body.includes("${rawLast}"), "the last-time panel does not print lastLine() output verbatim");
  ok(!body.includes("esc(rawLast)"), "the panel escapes markup that is already escaped inside");
  for (const bad of ["Math.", " - ", " + ", "reduce", "filter", "map(", "%"]) {
    ok(!body.includes(bad), "the last-time panel computes with " + bad.trim() + "; it may only display");
  }
});

check("5c. lastLine()'s empty case counts as no last time", () => {
  // lastLine() returns a populated "No note yet" paragraph rather than
  // "", so a bare truthiness test treats no-data as data -- which
  // suppressed `load` on exactly the first encounter it exists for.
  const i = card.indexOf("const hasLast");
  ok(i > -1, "no hasLast; the empty case is not being detected");
  const line = card.slice(i, card.indexOf(";", i));
  ok(line.includes("slog__last--empty"), "the empty-state marker is not checked for");
  const loadAt = card.indexOf("const loadBlock");
  ok(card.slice(loadAt, card.indexOf(";", loadAt)).includes("!hasLast"),
     "`load` still keys off raw output rather than the emptiness check");
});

check("5b. no trend, delta, arrow or session count anywhere in the card", () => {
  for (const bad of ["since", "streak", "improve", "up ", "down ", "better", "progress",
                     "\\u2191", "\\u2193", "times done", "sessions so far"]) {
    ok(!card.toLowerCase().includes(bad.toLowerCase()),
       'the card contains "' + bad.trim() + '" -- P4: the coach displays, it does not interpret');
  }
});

check("5d. the hazard block is visually distinct from ordinary prose", () => {
  // CARD-4: watchOut lives in watchBody now, and HURT_AND_ACHE in pinned.
  // Both must keep the modifier.
  const slice = (marker, end) => card.slice(card.indexOf(marker), card.indexOf(end, card.indexOf(marker)));
  const body = slice("const watchBody =", "].join");
  ok(body.includes("xcard-block--hazard"),
     "the hazard section has no modifier class; it renders as one more grey block");
  // CARD-5: the modifier moved with the markup into hurtBlock().
  const hb = card.indexOf("function hurtBlock");
  const h = card.slice(hb, hb + 500);
  ok(h.includes("xcard-block--hazard"),
     "the pinned hurt-and-ache block has no hazard modifier");
  ok(h.includes("xcard-hurt-summary"),
     "the collapsed summary row carries no hazard styling hook; it reads as one more accordion");
  const css = fs.readFileSync(_gatePath("css/components/workout.css"), "utf8");
  ok(css.includes(".xcard-block--hazard"), "the modifier class has no styling");
  ok(css.includes("--color-danger"), "the hazard box does not use the danger token");
  // The accent must not be the only thing carrying the text's legibility.
  // Anchor on the RULE, not the first mention -- the file's header
  // comment names the class too, and slicing from there tested prose.
  const at = css.indexOf(".xcard-block--hazard {");
  ok(at > -1, "no .xcard-block--hazard rule block");
  const rule = css.slice(at, css.indexOf("}", at));
  ok(!/(^|[;{]\s*)color:\s*var\(--color-danger\)/.test(rule),
     "the hazard BODY text is set in the accent colour; only the box should be rose");
});

console.log("\nTEST 6 - no P4 exposure via history");

check("6. exercise-card.js never reads exerciseHistory", () => {
  ok(!card.includes("exerciseHistory"),
     "the card reads exerciseHistory again; CARD-2 removed it so there is nothing to leak");
  ok(!card.includes("lastLift"), "the card reaches into the log itself; lastTime arrives pre-formatted");
});

console.log("\nTEST 7 - TIME-1 holds");

check("7. exercise-timing.js never reads holdSeconds", () => {
  ok(!timing.includes("holdSeconds"),
     "the timer resolver reads holdSeconds; bird-dog holds 3 against a duration of 90");
});

console.log("\nTEST 8 - the running flag is gone, not merely unused");

check("8. the card does not read opts.running", () => {
  ok(!card.includes("opts.running"),
     "the card still reads opts.running; the page is set by the view, so a view cannot be wrong about it");
});

console.log("\nTEST 9 - action-bar ids survive");

for (const v of VIEWS) {
  check("9. " + v.split("/").pop() + " keeps its action-bar ids", () => {
    for (const id of IDS[v]) {
      ok(src[v].includes('id="' + id + '"'), "missing " + id + "; the view binds by it and would silently unbind");
    }
  });
}

console.log("\nTEST 11 - page handlers do not answer for other views");

// Every view binds xcard:page on a shared root and none unbinds. A handler
// from a view visited earlier is still live, so without a prefix check,
// Back inside one session fires another view's handler and navigates out
// of it. Found on review, not by a gate -- this assertion is the gate.
const PREFIX = {
  "js/views/workout.js": "wo-", "js/views/prescribed-session.js": "ps-",
  "js/views/gym-programme.js": "gp-", "js/views/core-session.js": "cs-",
};
check("11w. workout.js binds no page handler, so it answers for no other view's card", () => {
  ok(!WO.includes('addEventListener("xcard:page"'), "workout.js still listens for xcard:page");
});

for (const v of PAGED) {
  check("11. " + v.split("/").pop() + " ignores other views' cards", () => {
    const t = src[v];
    const at = t.indexOf('addEventListener("xcard:page"');
    ok(at > -1, v + " has no xcard:page handler");
    const guardAt = t.indexOf('startsWith("' + PREFIX[v] + '")', at);
    ok(guardAt > -1, "no prefix guard; this handler answers for every view's cards");
    const pageAt = t.indexOf('!== "decide"', at);
    ok(pageAt > -1 && guardAt < pageAt, "the prefix guard runs after the page check");
  });
}

console.log("\nTEST 10 - the page budgets hold");

check("10a. DECIDE carries no instructions, no hazards, no why", () => {
  const i = card.indexOf("const decide =");
  ok(i > -1, "no decide body");
  const body = card.slice(i, card.indexOf("].join", i));
  for (const bad of ["instructions", "watchOut", "why", "cues"]) {
    ok(!body.includes(bad), "DECIDE includes " + bad + "; it is a decision page, not a reference one");
  }
});

// D-1 REVERSAL (Graeme, 04 Oct, Option B): the exercise's own why is the
// first of the four steps. It renders there and nowhere else on the card.
check("10b. `why` renders only on the Why step of the four-step layout", () => {
  const i = card.indexOf('if (opts.layout === "steps")');
  const j = card.indexOf('if (opts.layout === "flow")');
  ok(i > -1 && j > i, "no steps branch before the flow branch");
  const uses = [...card.matchAll(/exercise\.why/g)].map(m => m.index);
  ok(uses.length > 0 && uses.every(k => k > i && k < j), "`why` is read outside the steps layout");
});

check("10c. `load` renders only when there is no last time", () => {
  const i = card.indexOf("const loadBlock");
  ok(i > -1, "no loadBlock");
  const body = card.slice(i, card.indexOf(";", card.indexOf("section(", i)));
  ok(body.includes("!hasLast"), "`load` is unconditional; their own band must win over the prescription");
});

check("10d. no tab machinery survives", () => {
  for (const bad of ["tablist", "xcard-tab", 'role="tab"', "aria-selected"]) {
    ok(!card.includes(bad), "tab machinery survives in the card: " + bad);
  }
});

console.log(fails === 0
  ? "\nCARD-3: all assertions pass\n"
  : "\nCARD-3: " + fails + " FAILED\n");
process.exit(fails === 0 ? 0 : 1);
