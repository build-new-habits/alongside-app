/**
 * tools/verify-voice.mjs
 * 12 Aug 2026 v1
 *
 * COPY REGISTER GATE.
 *
 * Graeme, 12 Aug: "You're using jargon again like 'sits with you' please
 * try again." He was right, and the phrase was not only in a draft -- it
 * was LIVE, on the day-one opening shown to somebody who had just chosen
 * "there's a longer history than any of that". The most delicate line in
 * the product, in the register of a therapy room.
 *
 * Five more were live alongside it, including "your journey", which copy
 * rule 10.1 bans outright as an internal term.
 *
 * This checks user-facing STRINGS only. Class names, function names and
 * internal tags are not copy: renderCoachNarrative() and
 * .complete-journey-card are fine, and a gate that flagged them would be
 * switched off within a week.
 *
 * Physical instructions are exempt for the same reason -- "Sit with legs
 * extended" is a yoga cue, not therapy-speak.
 */
import fs from "node:fs";

const BANNED = [
  ["sits with you",          "therapy register - try 'how do you feel about that'"],
  ["sit with that",          "instructs somebody what to do with a feeling"],
  ["sit with it",            "as above"],
  ["reflecting on",          "asks somebody to perform reflection rather than answer"],
  ["hold space",             "therapy register"],
  ["holding space",          "therapy register"],
  ["lean into",              "self-help register"],
  ["showing up for yourself","self-help register - say what they actually did"],
  ["your truth",             "self-help register"],
  ["your journey",           "copy rule 10.1 - internal term, and jargon"],
  ["this journey",           "as above"],
  ["radical acceptance",     "clinical term"],
  ["do the work",            "self-help register"],
  ["sit in the discomfort",  "instructs, and clinical"],
  ["honour your",            "self-help register"],
  ["tune into your",         "self-help register"],

  // C1, 13 Aug 2026 — external help is OFFERED, never presumed.
  // The old rehabilitation boilerplate carried "check with whoever is
  // treating you" on all 94 entries, to people who mostly have nobody
  // treating them, and (before C2) to people with no condition at all.
  // Graeme's own About copy says "I couldn't afford a physio" — the
  // product cannot ship wording that assumes what its founder could not
  // access. Note js/data/exercises is NOT in FILES below, so this is
  // scoped to view and data copy; the exercise sweep is separate.
  ["whoever is treating you", "presumes a clinician already exists — offer help, do not assume it"],
  ["ask your physio",         "as above"],
  ["your physio will",        "as above"],
  ["as your doctor said",     "as above"],
];

// Physical cues that legitimately contain a banned substring.
const EXEMPT = [
  /sit with (legs|dumbbells|your back|knees|feet)/i,
  // "Let gravity do the work" is a physical cue about not forcing a
  // stretch, not an instruction to do emotional work on yourself.
  /(gravity|the floor|the wall|the bench|the machine) do the work/i,

  // C1, 13 Aug 2026. Adding js/data/exercises to FILES surfaced twelve
  // hits, ALL of them physical cues: "legs do the work", "leaving the
  // back to do the work", "lets momentum do the work", "lean into the
  // turns", "lean into it with straight arms".
  //
  // The temptation was to drop the exercise library back out of FILES.
  // That would have been the wrong fix: the library is exactly where
  // the presumed-clinician copy lived, and it is the largest body of
  // user-facing text in the product. Widening the exemption keeps the
  // sweep and keeps the rule -- a banned phrase in a body cue is a
  // false positive, and a gate that cries wolf gets switched off.
  //
  // Deliberately anchored to body parts and physics, not a blanket
  // "do the work" pardon: "do the work" aimed at a PERSON is still
  // caught, which is the register this rule exists for.
  // Anatomy or physics as the subject, with an optional "to" between --
  // "leaving the back TO do the work" is the same cue as "the back does
  // the work". Built from the twelve real hits rather than guessed, then
  // re-run until only genuine register violations remained.
  /(legs|arms|glutes|hamstrings|quads|back|core|shoulders|momentum|gravity|the right muscles|the muscle|the band|the weight[^.]{0,20}) (to )?do the work/i,
  /lean into (it|the turn|the turns|the stretch|the movement|the wall|the bar)/i,
];

const FILES = [
  ...fs.readdirSync("js/data").filter(f => f.endsWith(".js")).map(f => `js/data/${f}`),
  // C1: the exercise library is where the presumed-clinician copy lived.
  ...fs.readdirSync("js/data/exercises").filter(f => f.endsWith(".js")).map(f => `js/data/exercises/${f}`),
  ...fs.readdirSync("js/views").filter(f => f.endsWith(".js")).map(f => `js/views/${f}`),
  ...fs.readdirSync("js/views/onboarding").filter(f => f.endsWith(".js")).map(f => `js/views/onboarding/${f}`),
];

let fails = 0;
const found = [];

for (const f of FILES) {
  let src = fs.readFileSync(f, "utf8");
  // Comments are working notes and legitimately quote the phrases they ban.
  src = src.replace(/\/\*[\s\S]*?\*\//g, m => "\n".repeat((m.match(/\n/g) || []).length))
           .replace(/^\s*\/\/[^\n]*$/gm, "");

  src.split("\n").forEach((line, i) => {
    // Only string literals of sentence length. A class name has no spaces.
    const strings = [...line.matchAll(/"([^"\\]{12,}?)"|'([^'\\]{12,}?)'|`([^`\\]{12,}?)`/g)]
      .map(m => m[1] || m[2] || m[3])
      .filter(s => s.includes(" ") && !s.includes("--") && !/^[a-z-]+$/.test(s));
    // Plain template/JSX text, which is how complete.js's "journey" line looked.
    const text = line.replace(/<[^>]*>/g, " ").replace(/\$\{[^}]*\}/g, " ");
    for (const candidate of [...strings, text]) {
      if (EXEMPT.some(rx => rx.test(candidate))) continue;
      for (const [phrase, why] of BANNED)
        if (candidate.toLowerCase().includes(phrase))
          found.push({ f, line: i + 1, phrase, why, ctx: candidate.trim().slice(0, 88) });
    }
  });
}

const seen = new Set();
const uniq = found.filter(h => {
  const k = `${h.f}:${h.line}:${h.phrase}`;
  if (seen.has(k)) return false;
  seen.add(k); return true;
});

if (uniq.length) {
  fails = uniq.length;
  console.log(`\n${uniq.length} therapy/self-help phrase(s) in user-facing copy:\n`);
  for (const h of uniq)
    console.log(`  ${h.f}:${h.line}\n    "${h.phrase}" — ${h.why}\n    ...${h.ctx}...\n`);
} else {
  console.log("\n  PASS  no therapy or self-help register in user-facing copy\n");
}


// ── VOICE-2, 13 Aug 2026: pools must not collapse ────────────────────
// Every one of these was a SINGLE fixed string until today. Free is
// locked to Full Body at 30 minutes, so persona 2.12 read a
// byte-identical sentence at the top of every session he ever did.
// The failure mode to guard is not a bad line -- it is a pool quietly
// shrinking back to one, which nothing else would ever notice.
{
  const sb  = fs.readFileSync("js/session-builder.js", "utf8");
  const sr  = fs.readFileSync("js/data/session-rationale.js", "utf8");
  let poolFails = 0;

  const poolCheck = (label, src, name, min) => {
    const m = src.match(new RegExp(name + ":\\s*\\[([\\s\\S]*?)\\n\\s*\\]", ));
    const n = m ? (m[1].match(/^\s*(d =>|")/gm) || []).length : 0;
    if (n >= min) { console.log(`  PASS  ${label} pool has ${n} lines`); }
    else { poolFails++; console.log(`  FAIL  ${label} pool has ${n} lines, minimum ${min}. ` +
      `A pool that collapses to one is the fault VOICE-2 fixed, and it would ` +
      `look completely normal in review.`); }
  };

  console.log("\nVOICE-2 - no coach pool has collapsed");
  for (const type of ["full", "lower", "upper", "core", "cardio", "mobility", "glute"])
    poolCheck(`session line: ${type}`, sb, type, 4);
  poolCheck("warm-up purpose", sr, "warmup", 4);
  poolCheck("cool-down purpose", sr, "cooldown", 4);

  if (!/_rotationIndex\(\)/.test(sb) || /Math\.random\(\)\s*\*\s*COACH_LINES/.test(sb))
    { poolFails++; console.log("  FAIL  session lines are not rotated on a counter"); }
  else console.log("  PASS  session lines rotate on a counter, not Math.random()");

  if (poolFails) { console.log(`\n${poolFails} FAILURE(S)\n`); process.exit(1); }
  console.log("");
}

console.log(fails === 0 ? "ALL PASS\n" : `${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
