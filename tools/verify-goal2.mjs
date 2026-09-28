/**
 * tools/verify-goal2.mjs
 * 28 Sep 2026 v2
 *
 * v2 - Work list 2e. "The primary goal is read from where it is written"
 *   was satisfied by ONE line: workoutGenerator.js's
 *   store.get("strategicGoal.primaryGoal"). When that engine was deleted
 *   the check went red -- correctly, and it found the fault: the live
 *   coach route never read the chosen primary at all. It took the first
 *   goal in a fixed priority list, so GOAL-2's bug had been live on the
 *   route Plan users take since TWO-ENGINE (6 Sep). Now the check DRIVES
 *   chosenPrimaryEngineGoal() and asserts coach-proposal calls it with
 *   the stored strategicGoal. Everything else unchanged.
 *
 * 17 Aug 2026 v1
 *
 * GOAL-2. No store read may point at a path that does not exist.
 *
 * workoutGenerator.js read "goal.primaryGoal" and "goal.targetDate".
 * There is no top-level `goal` object in getDefaults() and there never
 * has been, so both were always undefined -- and the first one had a
 * fallback, so the person's CHOSEN primary goal was silently replaced
 * by whichever goal happened to be first in their list. Nothing threw.
 * Nothing looked wrong. It simply used the wrong answer, quietly.
 *
 * WHY THIS GATE AND NOT THE ONE I SET OUT TO BUILD. The plan was to
 * extend verify-write1 to nested fields. Measured first: 74 of 124
 * nested fields look one-ended, and most of those are false positives
 * because objects are written whole or through store helpers. A gate
 * with a 74-item baseline tells nobody anything, and a gate nobody reads
 * gets muted.
 *
 * ALSO, HONESTLY: that gate would NOT have caught TARGET-3. My
 * Programme read `store.get('strategicGoal')` and then a property off
 * the object, so there was no dot-path read to detect. I had claimed it
 * would. It would not.
 *
 * What a dot-path scan DOES catch is this: a read naming a path that
 * cannot resolve. Narrow, zero false positives, and it found a live bug
 * on its first run.
 */
import fs from 'node:fs';
import path from 'node:path';

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


let failures = 0;
const check = (n, ok, d='') => { console.log(`${ok?'PASS':'FAIL'}  ${n}${d?' — '+d:''}`); if(!ok) failures++; };

const storeSrc = fs.readFileSync(_gatePath('js/store.js'), 'utf8');
const start = storeSrc.indexOf('\n  getDefaults() {');
const blk   = start < 0 ? '' : storeSrc.slice(start);
const i     = blk.indexOf('return {');
const j     = i < 0 ? -1 : blk.indexOf('\n    };', i);
const body  = (i >= 0 && j > i) ? blk.slice(i, j) : '';
const topLevel = new Set([...body.matchAll(/^      ([a-zA-Z][\w]*)\s*:/gm)].map(m => m[1]));

check('the defaults were extracted', topLevel.size >= 50, `${topLevel.size} top-level fields`);

let all = '';
(function walk(dir) {
  for (const e of fs.readdirSync(_gatePath(dir), { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.js')) all += fs.readFileSync(_gatePath(p), 'utf8');
  }
})('js');
all = all.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

// Every dot-path read and write in the app, and the root each names.
const paths = new Set([
  ...[...all.matchAll(/\bget\((['"])([a-zA-Z][\w]*\.[\w.]+)\1\)/g)].map(m => m[2]),
  ...[...all.matchAll(/\bset\((['"])([a-zA-Z][\w]*\.[\w.]+)\1/g)].map(m => m[2])
]);

const unresolvable = [...paths].filter(p => !topLevel.has(p.split('.')[0]));

check('every dotted store path names a field that exists',
  unresolvable.length === 0,
  unresolvable.length
    ? `${unresolvable.join(', ')} — no such top-level field, so these read undefined for ever`
    : `${paths.size} dotted paths, all resolvable`);

// The specific one, pinned so it cannot come back under its old name.
check('nothing reads the phantom `goal` object',
  !/\bget\((['"])goal\./.test(all),
  'strategicGoal is the real home; `goal.` never existed');

{
  const G = await import(new URL('../js/data/goals.js', import.meta.url).href);
  const f = G.chosenPrimaryEngineGoal;
  const goals = ['feel-better', 'get-stronger'];   // priority alone picks build-muscle
  const byPriority = typeof f === 'function' ? f(goals, null) : null;
  const chosen = typeof f === 'function' ? f(goals, { primaryGoal: 'feel-better' }) : null;
  check('and the primary goal is read from where it is written',
    typeof f === 'function' && chosen === G.getPrimaryEngineGoal(['feel-better']) && chosen !== byPriority,
    `no choice: ${byPriority}, chose feel-better: ${chosen} -- otherwise a chosen primary is silently replaced`);
  check('a chosen primary that is no longer one of their goals does not lead',
    typeof f === 'function' && f(goals, { primaryGoal: 'balance' }) === byPriority);
  const cpSrc = fs.readFileSync(new URL('../js/views/coach-proposal.js', import.meta.url), 'utf8');
  check('and the coach route asks it, with what is stored',
    /chosenPrimaryEngineGoal\(goals, store\.get\('strategicGoal'\)\)/.test(cpSrc));
}

// ── AUDIT-2. Whole sessions are not orphans. ────────────────────────
//
// The reachability audit reported 28 ERRORS for exercises no session
// type can serve. All 28 were session-length by the codebase's OWN
// definition — isSessionLength(), contentType 'practice' or duration
// >= 600s — and getSuitableExercises() filters those out first, because
// "whole sessions are not components". Zero were genuinely orphaned.
//
// Pinned here so the distinction cannot quietly collapse again: a
// COMPONENT that no session type can reach is a real fault, and this
// asserts there are none.
const { EXERCISES, isSessionLength } = await import(new URL('../js/data/exercises/index.js', import.meta.url));
const { matchCategory } = await import(new URL('../js/data/session-categories.js', import.meta.url));

const sbSrc = fs.readFileSync(_gatePath('js/session-builder.js'), 'utf8');
const declared = new Set();
for (const m of sbSrc.matchAll(/(?:warmupCategories|mainCategories|cooldownCategories):\s*\[([^\]]*)\]/g))
  for (const c of m[1].matchAll(/["']([a-z0-9-]+)["']/g)) declared.add(c[1]);

const reachable = new Set();
for (const c of declared)
  for (const s of ['warmup','main','cooldown'])
    for (const e of matchCategory(EXERCISES, c, s)) reachable.add(e.id);

const orphanComponents = EXERCISES.filter(e => !reachable.has(e.id) && !isSessionLength(e));
// ⚠️ UNPROVEN, and labelled as such rather than left looking like a
// guard. I could not make this assertion FAIL. Seeding a real entry
// with a ghost category AND a ghost movementPattern, short duration and
// no practice contentType still left it reachable — some matcher is
// picking it up on another field (affectsAreas or contentType), so the
// orphan set stayed empty.
//
// That means one of two things and I have not established which: either
// the matchers are broad enough that a component genuinely cannot be
// orphaned, or my seed was wrong again. Every other assertion in this
// file was made to fail on purpose; this one was not, so it is recorded
// as an observation rather than trusted as a gate.
//
// A gate that has never been made to fail proves nothing — that rule
// applies to my own work or it is not a rule.
check('[UNPROVEN] no COMPONENT exercise is unreachable by every session type',
  orphanComponents.length === 0,
  orphanComponents.slice(0, 6).map(e => e.id).join(', ') || 'the 28 the audit flagged were all whole sessions — but see the note above');

console.log(failures === 0 ? '\nALL PASS\n' : `\n${failures} FAILURE(S)\n`);
process.exit(failures === 0 ? 0 : 1);
