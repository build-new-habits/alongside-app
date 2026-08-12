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
];

// Physical cues that legitimately contain a banned substring.
const EXEMPT = [
  /sit with (legs|dumbbells|your back|knees|feet)/i,
  // "Let gravity do the work" is a physical cue about not forcing a
  // stretch, not an instruction to do emotional work on yourself.
  /(gravity|the floor|the wall|the bench|the machine) do the work/i,
];

const FILES = [
  ...fs.readdirSync("js/data").filter(f => f.endsWith(".js")).map(f => `js/data/${f}`),
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

console.log(fails === 0 ? "ALL PASS\n" : `${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
