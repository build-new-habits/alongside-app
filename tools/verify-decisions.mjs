/**
 * tools/verify-decisions.mjs
 * 13 Aug 2026 v2
 *
 * v2 - A1. Two checks added after the 13 Aug persona trace found that
 *   upgrade.js told every user how to bypass the tier system: "use the
 *   dev panel to switch tiers. Triple-tap the version number at the
 *   bottom of Settings." Every locked feature in the product routes to
 *   that screen, so the most-visited conversion surface published the
 *   bypass. The panel itself is a legitimate tool and stays.
 *
 *   Note on strip(): comments are removed before matching, deliberately.
 *   The dev panel SHOULD be discussed in comments -- the whole house
 *   style depends on that. What must never appear is the gesture in
 *   rendered copy.
 *
 * 12 Aug 2026 v1
 *
 * DECISION-DRIFT GATE.
 *
 * WHY THIS EXISTS. On 12 Aug 2026 In Step sat locked behind isPremium()
 * for hours after the tier decision had made it free. Nothing failed. No
 * error, no broken screen -- the app worked perfectly and was simply
 * wrong, and the best demonstration of what this product is for was
 * invisible to the people it was written for.
 *
 * That is not an isolated bug. It is the fourth instance in one day of
 * the same shape: a decision recorded in prose with nothing in the code
 * enforcing it. sessionVariety was declared and never written.
 * exerciseFeedback is read and never written. prefers-larger-text was
 * styled and never matched. A stated intent with no enforcement decays
 * silently, and silence is exactly what makes it expensive.
 *
 * So the locked decisions get a gate, the same as the code does.
 *
 * WHAT THIS CAN AND CANNOT DO. It checks decisions with a mechanical
 * footprint -- a tier gate, a banned string, a field that must exist.
 * It cannot check tone, judgement, or whether a sentence sounds like the
 * coach. Those still need Graeme. The point is that everything checkable
 * IS checked, so his attention goes to what only he can judge.
 *
 * Every assertion below names the decision and where it is recorded, so
 * a future failure can be traced to a document rather than argued about.
 */
import fs from "node:fs";

const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "")
                    .replace(/<!--[\s\S]*?-->/g, "")
                    .replace(/^\s*\/\/[^\n]*$/gm, "");
const read = f => strip(fs.readFileSync(f, "utf8"));
const raw  = f => fs.readFileSync(f, "utf8");

let fails = 0;
const check = (decision, source, fn) => {
  try { fn(); console.log(`  PASS  ${decision}`); }
  catch (e) { fails++; console.log(`  FAIL  ${decision}\n        recorded in: ${source}\n        ${e.message}`); }
};
const ok = (c, m) => { if (!c) throw new Error(m); };

const DEST = "Documents/Business/alongside_destination_architecture_12aug2026_v1.md";
const SCHED = "Documents/Admin/master_schedule.md";

console.log("\nTIER BOUNDARY \u2014 free must actually be free");

check("In Step is free", `${DEST} §9, §18`, () => {
  ok(/In Step is free/.test(raw(DEST)),
     "the spec no longer says this \u2014 if the decision changed, update this gate deliberately");
  const n = read("js/views/noticing.js");
  ok(!/lockedFeature\(/.test(n), "In Step card is behind a paywall wrapper");
  ok(/id="noticing-in-step-btn"/.test(n), "In Step card is not rendered at all");
});

check("Grounding moments are free", `${DEST} §18`, () => {
  const g = read("js/data/grounding-moments.js");
  ok(!/isPremium|premium|Personal/.test(g), "a tier check has crept into a free feature");
});

check("The drop-in coach question is free", `${DEST} §8`, () => {
  const c = read("js/views/checkin.js");
  ok(/_showVarietyBeat/.test(c), "the free coach question is missing");
  ok(!/isPremium/.test(c), "check-in must not be tier-aware");
});

console.log("\nP1 \u2014 the coach never sells");

check("No upgrade language inside a coach card", "Locked Principles P1/P2", () => {
  for (const f of ["js/views/in-step.js", "js/views/workout.js", "js/views/checkin.js"]) {
    const s = read(f);
    let i = s.indexOf("card-coach");
    while (i !== -1) {
      const block = s.slice(i, i + 600);
      for (const w of ["upgrade", "paid plan", "subscri", "Personal tier"])
        ok(!new RegExp(w, "i").test(block),
           `${f}: "${w}" appears inside a coach card \u2014 the coach must not sell`);
      i = s.indexOf("card-coach", i + 1);
    }
  }
});

console.log("\nP4 \u2014 the app may display load; the coach never interprets it");

check("No delta, comparison or verdict language in the log", "Locked Principles P4", () => {
  // Identifiers are not user-facing copy. progressionInvitation() is a
  // function name and tripped the first run of this gate; matching it
  // would have meant either a false failure forever or -- worse -- the
  // check being weakened until it caught nothing.
  const s = read("js/session-log.js").replace(/progressionInvitation/g, "");
  for (const w of ["new best", "personal best", "up from", "down from",
                   "lighter than", "heavier than", "improve", "\\bprogress\\b",
                   "\u2191", "\u2193"])
    ok(!new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(s),
       `"${w}" attaches a verdict to a number`);
});

check("No streaks anywhere in the app", "Locked Principles / founding rules", () => {
  for (const f of ["js/views/today.js", "js/views/progress.js", "js/views/workout-complete.js"]) {
    const s = read(f);
    ok(!/\bstreak\b/i.test(s), `${f} references a streak`);
  }
});

console.log("\nP5 \u2014 views render, they never define content");

check("No view defines its own exercise pool", "Locked Principles P5", () => {
  // Shape, not name. quiet-session.js holds BREATHING_EXERCISES, which
  // are breathing PATTERNS -- coachIntro, why, phase timings -- not
  // entries the session builder could ever select. Failing on the name
  // alone would have made this gate cry wolf on day one, and a gate that
  // cries wolf gets switched off.
  //
  // The real signal is an exercise-SHAPED object in a view: something
  // carrying equipment or movementPattern, which is what selection reads.
  // BLIND SPOT CLOSED 12 Aug 2026. The first version matched on
  // `equipment:` plus `movementPattern:`, which is what a strength entry
  // looks like. Yoga poses carry holdSeconds and rest instead, so
  // yoga-session.js's 30 inline pose entries -- a private pool of exactly
  // the kind P5 exists to forbid -- walked straight through the check
  // written that morning to catch them.
  //
  // Now matches on the WEAKEST shared signal instead: an object literal
  // carrying both an `id` and a `name`. That is what every selectable
  // thing in this product has, whatever else it does or does not carry.
  // Budgets, each justified. A budget without a reason is a hole.
  const ALLOW = {
    // LOG-4's synthetic logging subject: { id: "activity-walk", name: "Walk" }.
    // Not an exercise and not selectable -- these views log against the
    // ACTIVITY because there is no exercise object in a walk.
    "walk-session.js": 2, "running-session.js": 2,
    "cycle-session.js": 2, "swim-session.js": 2,
    // Breathing PATTERNS (box, 4-7-8, physiological sigh) with coachIntro
    // and phase timings, plus short mindful practices. Session structure,
    // not database exercises. Tracked as QUIET-1 for a proper look.
    "quiet-session.js": 21,
    // Pose SEQUENCES: timing and sequence-specific cues, which legitimately
    // belong to the sequence. Their contraindications and watchOut resolve
    // from the database at build time (YOGA-1, yoga-session.js v5) and
    // tools/verify-yoga1.mjs asserts that resolution happens BEFORE the
    // safety filter runs.
    "yoga-session.js": 60,
  };
  for (const f of fs.readdirSync("js/views").filter(x => x.endsWith(".js"))) {
    const s = read(`js/views/${f}`);
    const inline = (s.match(/\{\s*id:\s*["'][a-z0-9-]+["'],\s*\n?\s*name:/g) || []).length
                 + (s.match(/\{ id: ["'][a-z0-9-]+["'],\s+name:/g) || []).length;
    const budget = ALLOW[f] ?? 0;
    ok(inline <= budget,
       `js/views/${f} defines ${inline} inline exercise entries \u2014 views render, ` +
       `js/data/exercises/ is the only source. The private pool in ` +
       `session-builder.js cost three separate double-fixes.`);
  }
});

console.log("\nVOICE \u2014 nurturing only, permanently");

check("No voice picker is exposed anywhere", "Founding decision, locked permanently", () => {
  const s = read("js/views/settings.js");
  for (const w of ["coachStyle", "voice style", "Direct", "Playful"])
    ok(!new RegExp(`data-field="${w}"|>\\s*${w}\\s*<`, "i").test(s),
       `Settings appears to expose "${w}" \u2014 nurturing is the only voice, permanently`);
});

console.log("\nREADER-WITHOUT-A-WRITER \u2014 the pattern that keeps recurring");

const store = read("js/store.js");
const allJs = fs.readdirSync("js", { recursive: true })
  .filter(f => typeof f === "string" && f.endsWith(".js"))
  .map(f => read(`js/${f}`)).join("\n");

for (const field of ["sessionVariety", "empathyLastPrompt", "grounding", "liftLogEnabled"]) {
  check(`${field} has both a reader and a writer`, "PT-12 pattern, four instances 11\u201312 Aug", () => {
    ok(store.includes(`${field}:`), `${field} not declared in store.js`);
    ok(new RegExp(`get\\(["']${field}["']\\)`).test(allJs), `${field} is never read \u2014 dead field`);
    // A writer is not always a literal store.set("field"). settings.js
    // writes through a generic [data-toggle] / [data-field] handler that
    // takes the name from the dataset, so the string never appears next
    // to set(). The first run of this gate reported liftLogEnabled as
    // writerless when a live toggle writes it on every tap.
    //
    // This matters beyond the false alarm: it is exactly how a REAL
    // writerless field could hide. Both forms count.
    const writtenDirectly = new RegExp(`set\\(["']${field}["']`).test(allJs);
    const writtenViaAttr  = new RegExp(`data-(toggle|field)="${field}"`).test(allJs);
    ok(writtenDirectly || writtenViaAttr,
       `${field} is never written \u2014 it is running on a default nobody chose`);
  });
}

console.log("\nSAFETY \u2014 never paywalled, never silently weakened");

check("The capability fail-safe covers everyone the question is asked of", "C1-SAFETY, store.js v33", () => {
  ok(/asked && c\.chairRise !== 'yes'/.test(store),
     "the legPower default no longer matches the question's trigger \u2014 this served loaded leg work to somebody who could not stand from a chair");
});

check("Grounding moments never appear on the severe-pain path", "GM-1", () => {
  ok(/>= 7\)? return false|>= 7\)/.test(read("js/data/grounding-moments.js")),
     "the acute-pain guard is missing");
});

console.log("\nTIER INTEGRITY \u2014 the bypass is never advertised");

check("No view publishes the developer bypass gesture", "A1, 13 Aug 2026", () => {
  const views = fs.readdirSync("js/views", { recursive: true })
    .filter(f => typeof f === "string" && f.endsWith(".js"));

  // Two distinct rules, and the distinction is the whole check.
  //
  // The GESTURE may appear nowhere in rendered copy, settings.js included.
  // Describing how to open the bypass is the fault, wherever it sits.
  //
  // The PANEL may be named only in settings.js, which owns it and needs a
  // heading on it. A first draft of this check banned the phrase outright
  // and failed on the panel's own <h3>Developer panel</h3> -- a false
  // positive that would have taught the next person to weaken the rule.
  const gesture = views.filter(f =>
    /triple[- ]?tap/i.test(read(`js/views/${f}`)));
  ok(gesture.length === 0,
     `the bypass gesture is described in rendered copy: ${gesture.join(", ")} \u2014 ` +
     "every locked feature in the product routes to upgrade.js, so this is the " +
     "most-read screen a free user reaches");

  const named = views.filter(f =>
    f !== "settings.js" && /dev(eloper)? panel/i.test(read(`js/views/${f}`)));
  ok(named.length === 0,
     `the developer panel is named outside the view that owns it: ${named.join(", ")}`);
});

check("The dev panel gesture and its markup share one flag", "A1, 13 Aug 2026", () => {
  const s = read("js/views/settings.js");
  ok(/const DEV_PANEL_ENABLED\s*=/.test(s),
     "DEV_PANEL_ENABLED is gone \u2014 there is no single switch to close the bypass before launch");
  const gates = (s.match(/DEV_PANEL_ENABLED/g) || []).length;
  ok(gates >= 3,
     `DEV_PANEL_ENABLED appears ${gates} times; the declaration, the markup and the ` +
     "listener must all be covered. Gating the panel without the listener leaves the " +
     "tap sequence live with nothing to open");
});

console.log(fails === 0
  ? "\nALL DECISIONS HOLD\n"
  : `\n${fails} DECISION(S) HAVE DRIFTED FROM THE RECORD\n`);
process.exit(fails === 0 ? 0 : 1);
