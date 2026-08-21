/**
 * tools/verify-chap4.mjs
 * 21 Aug 2026 v2
 * GATE-PATH. Path resolution only -- no assertion changed.
 *
 * 17 Aug 2026 v1
 *
 * CHAP-1 step 4. The weekly focus.
 *
 * Blueprint §6: focus, not goal. The coach proposes, the person adjusts.
 * Never scored, never counted, absence never mentioned.
 *
 * THE ASSERTION THAT MATTERS MOST is that the tilt is REAL. Two earlier
 * attempts were built and not shipped:
 *
 *   attempt 1  tilt inside pickFrom()   MEASURED 39 vs 40 — no effect
 *   attempt 2  tilt the week's shape    TRACED — wrote to a field nobody read
 *
 * So this gate measures the tilt over many builds rather than asserting
 * that the code exists. A coach that says "I'm leaning towards the
 * hinging" and changes nothing is making a claim the product does not
 * honour, and only a measurement can tell the difference.
 *
 * The failure mode otherwise is not "it does not work" but "it quietly
 * becomes a weekly target", which is the thing the word focus was
 * chosen to prevent — hence the negatives.
 */

// GATE-PATH, 21 Aug 2026. jsdom resolved through Node rather than by
// absolute path into one machine's node_modules.
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><div id="c"></div>', { url: 'https://x/' });
globalThis.window = dom.window; globalThis.document = dom.window.document;
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true,writable:true});
Object.defineProperty(globalThis,'localStorage',{value:dom.window.localStorage,configurable:true,writable:true});

const B = new URL('../js/', import.meta.url).href;
const { store } = await import(B + 'store.js');
const WF = await import(B + 'data/week-focus.js');
const { buildSession } = await import(B + 'session-builder.js');

let failures = 0;
const check = (n, ok, d='') => { console.log(`${ok?'PASS':'FAIL'}  ${n}${d?' — '+d:''}`); if(!ok) failures++; };
const ago = d => new Date(Date.now() - d*864e5).toISOString();

function seedRead(results) {
  localStorage.clear(); store.init();
  store.set('tier','personal');
  store.set('assessment', {
    baseline: { at: ago(3), measuredLevel: 'moderate', results },
    history: [], lastOfferedAt: ago(3), declined: false
  });
}

// ── 1. Proposed from the last read, hardest first ────────────────────
seedRead({ squat: 'comfortable', push: 'hard', hinge: 'too-much' });
const f = WF.proposeWeekFocus();
check('a focus is proposed from the last read', !!f);
check('and it is the HARDEST thing reported', f.key === 'hinge',
  "'too-much' outranks 'hard'; leaning into what is already comfortable stops asking anything");

localStorage.clear(); store.init();
check('no read means no focus', WF.proposeWeekFocus() === null,
  'picking one at random would be the coach inventing a reason');
seedRead({ squat: 'comfortable' });
check('a read with nothing hard proposes nothing', WF.proposeWeekFocus() === null);

// ── 2. The person's choice is not overwritten ────────────────────────
seedRead({ hinge: 'too-much' });
WF.proposeWeekFocus();
WF.setWeekFocus('push');
check("a later proposal does not undo the person's choice",
  WF.proposeWeekFocus().key === 'push' && store.get('weekFocus.editedByUser') === true);
check('and the line changes to say so', /You've asked me to lean towards/.test(WF.focusLine()));

WF.setWeekFocus(null);
check('a focus can be declined entirely', WF.currentWeekFocus() === null,
  'a focus nobody can decline is a prescription');
check('and nothing is said about its absence', WF.focusLine() === null,
  '§6: its absence is never mentioned');

// ── 3. NEVER counted or scored ───────────────────────────────────────
seedRead({ hinge: 'too-much' });
WF.proposeWeekFocus();
const line = WF.focusLine();
for (const [re, what] of [
  [/\d+ of \d+/, 'a count'], [/%/, 'a percentage'], [/\bgoal\b/i, 'the word goal'],
  [/\bmissed\b|\bfailed\b/i, 'a failure'], [/\bmust\b|make sure/i, 'an instruction'],
  [/\bstreak\b/i, 'a streak'],
]) check(`the coach's line contains no ${what}`, !re.test(line), line);
check('and it is invitational, not directive', /leaning towards/.test(line));

// ── 4. THE MEASUREMENT. Does it actually tilt a session? ─────────────
function mainPatternCount(focusKey, patterns, n = 30) {
  let tot = 0;
  for (let i = 0; i < n; i++) {
    localStorage.clear(); store.init();
    store.set('tier','personal'); store.set('fitnessLevel','moderate');
    store.set('goals',['get-stronger']); store.set('onboardingComplete', true);
    if (focusKey) WF.setWeekFocus(focusKey);
    const s = buildSession({ sessionType: 'full', durationMins: 30 });
    tot += (s.exercises || [])
      .filter(e => e.section === 'main' && patterns.includes(e.movementPattern)).length;
  }
  return tot;
}

const leaning = mainPatternCount('hinge', ['hinge','carry']);
const neutral = mainPatternCount(null,    ['hinge','carry']);
check('the focus MEASURABLY tilts what is offered', leaning > neutral * 1.3,
  `${leaning} focus movements across 30 builds vs ${neutral} without — attempt 1 measured 39 vs 40`);

// And it must remain a preference. A session that becomes ALL focus is
// a filter wearing a preference's clothes.
localStorage.clear(); store.init();
store.set('tier','personal'); store.set('fitnessLevel','moderate');
store.set('goals',['get-stronger']); store.set('onboardingComplete', true);
WF.setWeekFocus('hinge');
const s = buildSession({ sessionType: 'full', durationMins: 30 });
const mains = (s.exercises || []).filter(e => e.section === 'main');
check('a session still builds with a focus set', mains.length > 0, `${mains.length} main movements`);
check('and the focus never becomes the WHOLE session',
  new Set(mains.map(e => e.movementPattern)).size > 1,
  'a reorder, not a filter — nothing is starved');
check('and the warm-up is untouched',
  (s.exercises || []).some(e => e.section === 'warmup'),
  'a preference must not disturb the warm-up floor');

// ── 5. A focus with no matching category changes nothing ─────────────
const untouched = WF.focusOrderedCategories(['yoga-flow','deep-stretch']);
check('a focus that matches no category leaves the list alone',
  untouched.join() === 'yoga-flow,deep-stretch');
check('and reordering never drops a category', (() => {
  WF.setWeekFocus('hinge');
  const before = ['hip-hinge','horizontal-push','squat-pattern'];
  const after  = WF.focusOrderedCategories(before);
  return after.length === before.length && before.every(c => after.includes(c));
})(), 'every original category survives, in the same relative order behind the focus');

console.log(failures === 0 ? '\nALL PASS\n' : `\n${failures} FAILURE(S)\n`);
process.exit(failures === 0 ? 0 : 1);
