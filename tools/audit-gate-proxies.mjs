/**
 * tools/audit-gate-proxies.mjs
 * 18 Aug 2026 v1
 *
 * SWEEP-1. An audit of the gate suite, for the fault the gate suite
 * cannot catch in itself.
 *
 * THE FAULT. An assertion NAMES a property and TESTS a proxy for it.
 * The proxy is usually true when written, so the gate goes green and
 * nobody looks again. Then it fails on a change that did not touch the
 * property, or — much worse — stays green through a change that broke
 * it. Three instances surfaced in a single day, 18 Aug:
 *
 *   verify-quick1  "PAIN IS NOT COMPRESSIBLE"  tested a {0,200} CHARACTER
 *                  DISTANCE where it meant ORDER. Went red on an added
 *                  comment. Would have stayed green if the panel call had
 *                  been moved 100 characters closer and inverted.
 *   verify-upg2    "a paid user is not sold to" tested a literal MARKETING
 *                  SENTENCE where it meant "renders no price and no buy
 *                  button". Went red on a pure rename.
 *   verify-nav5    "exactly three" sections, where the file's own stated
 *                  reasoning is "nothing scrolls, so nothing hides" — a
 *                  CEILING, not a count.
 *
 * Three in one day is a pattern, not bad luck. This audit finds the rest.
 *
 * IT DOES NOT FAIL A BUILD. Every hit needs a human to decide whether the
 * proxy is the property. `REHAB.size === 94` is a proxy for "the rehab
 * set is intact" and will go red the day somebody adds a 95th entry —
 * but `hits.length === 0` is not a proxy for anything, it IS the
 * property. A regex cannot tell those apart, and a script that guessed
 * would produce exactly the false confidence it exists to remove.
 *
 * Run it, read it, judge each one. Exit code is always 0.
 */
import fs from 'node:fs';
import path from 'node:path';

const dir   = new URL('.', import.meta.url).pathname;
const files = fs.readdirSync(dir)
  .filter(f => f.endsWith('.mjs') && !f.startsWith('audit-'))
  .sort();

const CATEGORIES = [
  {
    tag: 'DISTANCE',
    why: 'A character window standing in for order or containment. Anything ' +
         'written between the two anchors — including a comment — moves the ' +
         'distance without moving the property.',
    // Only [\s\S]{0,N} and [^\n]{0,N} — a gap-spanning window. Plain
    // quantifiers like \d{1,2} in a date or version pattern are not
    // proxies for anything and were flooding the first run of this audit
    // with false positives, which is how an audit stops being read.
    test: line => /\[(\\s\\S|\^\\n|\^<\\n)\]\{\s*\d*\s*,\s*\d+\s*\}/.test(line),
  },
  {
    tag: 'MAGIC-COUNT',
    why: 'An exact count against content or data. Goes red the day somebody ' +
         'adds a legitimate entry. Ask whether the property is the number, a ' +
         'ceiling, a floor, or a relationship to something else that moves with it.',
    // Narrowed to counts taken against CONTENT — a .size, a .length, or a
    // count of matches. An assertion that a seeded scenario produces
    // weeksIn === 8 is not a proxy; that IS the property, and the first
    // run of this audit flagged dozens of them.
    test: line => /(\.size|\.length|\bcount\b|\bn\b)\s*(===|!==)\s*\d+/.test(line) &&
                  !/\.length\s*===\s*0\b/.test(line),
  },
  {
    tag: 'LITERAL-COPY',
    why: 'A long literal string asserted as if it were behaviour. Survives ' +
         'only until somebody rewords the copy, and says nothing about what ' +
         'the code does.',
    // PROSE, not code. A regex full of backslashes and brackets is a
    // structural pattern; one that is mostly words and spaces is a
    // sentence somebody wrote, and it will die the next time that
    // sentence is reworded. Three-plus spaces and no regex
    // metacharacters is a crude test and deliberately so -- the audit
    // reports candidates for a human, it does not decide.
    test: (line) => {
      const m = line.match(/\/([^/\n]{25,})\/[gimsy]*\.test\(/);
      if (!m) return false;
      const body = m[1];
      if (/[\\\[\](){}|^$*+?]/.test(body)) return false;
      return (body.match(/ /g) || []).length >= 3;
    },
  },
];

// Executing gates can still hold proxies, but a source-only gate cannot
// know whether the code it reads is reachable at all — which is the
// fault that let onUnmount's missing caller survive twelve weeks.
const executes = f =>
  /jsdom|JSDOM/.test(fs.readFileSync(path.join(dir, f), 'utf8'));

const hits = [];
let sourceOnly = 0;

for (const f of files) {
  const src = fs.readFileSync(path.join(dir, f), 'utf8');
  if (!executes(f)) sourceOnly++;
  src.split('\n').forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
    for (const c of CATEGORIES) {
      if (c.test(line)) hits.push({ f, n: i + 1, tag: c.tag, line: line.trim().slice(0, 120) });
    }
  });
}

console.log(`\nGATE SUITE PROXY AUDIT — ${files.length} gates\n`);
console.log(`  executing (mount and click):  ${files.length - sourceOnly}`);
console.log(`  source-text only:             ${sourceOnly}`);
console.log(`\n  A source-only gate cannot tell whether the code it reads is`);
console.log(`  reachable. That is not a fault in itself — a copyright rule or`);
console.log(`  a precache list has no runtime to execute — but for any gate`);
console.log(`  asserting BEHAVIOUR it is the onUnmount fault waiting to happen.\n`);

for (const c of CATEGORIES) {
  const group = hits.filter(h => h.tag === c.tag);
  console.log(`\n=== ${c.tag} — ${group.length} ===`);
  console.log(`    ${c.why}\n`);
  for (const h of group) console.log(`  ${h.f}:${h.n}\n      ${h.line}`);
}

console.log(`\n${hits.length} candidates. Each needs a human decision — see the header.\n`);

// ── TRIAGE, 18 Aug 2026 ──────────────────────────────────────────────
//
// First full pass. Recorded here so the next reader starts from a
// judgement rather than from 71 raw lines.
//
// FIXED (4), all NEGATIVE windows — the dangerous direction:
//   verify-delight  HOME_DOORS never sorted        -> bracket-matched region
//   verify-pb1      .slog__best never emphasised   -> the rule block
//   verify-door1    In Step never gated            -> no isPremium in live code
//   verify-quick3   badge reserve (mine, same day) -> the rule block
//
// THE DISTINCTION THAT MATTERS, and it is why these four were chosen:
// a POSITIVE window fails loudly when the gap grows — annoying, visible,
// fixed within the hour. A NEGATIVE one goes SILENTLY GREEN the moment
// the forbidden thing drifts past the limit. One added comment above a
// .sort() would have disarmed verify-delight with nothing to see.
// Positive windows are a nuisance. Negative windows are a false floor.
//
// NOT FIXED, and deliberately:
//   verify-c2      REHAB.size === 94, tagged === 61. Reads as a magic
//                  number and is not: its own comment says "if the
//                  library changed, re-triage rather than adjusting this
//                  number". It is a tripwire forcing human re-triage of a
//                  SAFETY classification. Leave it.
//   verify-empathy n === 33, with per-stage floors beside it for the
//                  more likely failure. Also considered, also leave.
//
// STILL OPEN, the structural one: 43 of 76 gates are SOURCE-TEXT ONLY.
// For a copyright rule or a precache list that is correct. For any gate
// asserting BEHAVIOUR it is the onUnmount fault waiting to happen — the
// code is in the file, so the gate passes, and nobody asks whether a
// person can reach it. Converting the behavioural ones to execute is the
// largest outstanding QA job in the project and is not a one-session
// task. Start with verify-door1 and verify-tier: both assert routing.
process.exit(0);
