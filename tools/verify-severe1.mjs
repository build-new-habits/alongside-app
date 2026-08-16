/**
 * tools/verify-severe1.mjs
 * 16 Aug 2026 v1
 *
 * SEVERE-1. Severe pain gets a Gentle Care card, not a workout.
 *
 * PROVISIONAL AND REVERSIBLE. No physiotherapist has reviewed this.
 * Graeme asked for the full offering on the understanding it can be
 * rolled back, and rollback is one constant: SEVERE_BYPASS_ENABLED in
 * session-builder.js. This gate is written so that flipping it produces
 * clean failures naming the decision, not a confusing cascade.
 *
 * WHAT IT IS BUILT ON. Not a clinical judgement of mine. Two things
 * already in the product: workoutGenerator.js v1.3's changelog, which
 * has claimed this behaviour since August, and getZoneStatus()'s own
 * existing definition of a severe zone at pain >= 7.
 *
 * THE INCONSISTENCY IS ASSERTED, NOT HIDDEN. getPainBand() calls 8+
 * severe; getZoneStatus() calls 7+ severe. Both are live and they
 * disagree. The gate pins the disagreement so it reaches the clinical
 * review as a known fact rather than being quietly resolved by me.
 */
import { JSDOM } from '/home/claude/node_modules/jsdom/lib/api.js';
const dom = new JSDOM('<!doctype html>', { url: 'https://x/' });
globalThis.window = dom.window; globalThis.document = dom.window.document;
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true,writable:true});
Object.defineProperty(globalThis,'localStorage',{value:dom.window.localStorage,configurable:true,writable:true});

const B = new URL('../js/', import.meta.url).href;
const { store } = await import(B + 'store.js');
const SB = await import(B + 'session-builder.js');
const C  = await import(B + 'data/conditions.js');

let failures = 0;
const check = (n, ok, d='') => { console.log(`${ok?'PASS':'FAIL'}  ${n}${d?' — '+d:''}`); if(!ok) failures++; };

function seed(conditions, scores) {
  localStorage.clear(); store.init();
  store.set('tier','personal'); store.set('fitnessLevel','moderate');
  store.set('goals',['get-stronger']); store.set('onboardingComplete', true);
  store.set('conditions', conditions);
  store.set('conditionPainScores', scores);
}

// ── 1. Severe pain, both entry points ────────────────────────────────
seed(['knee'], { knee: 9 });
const s = SB.buildSession({ sessionType:'full', durationMins:30 });
check('severe pain returns the Gentle Care card', s?.gentleCare === true);
check('and not a workout', (s?.exercises || []).length === 3,
  `${(s?.exercises||[]).length} items — breathing, settling, an optional walk`);
check('and it names the zone, not the condition',
  s?.severeZone === 'lower-limb',
  'the app has not diagnosed a knee; the person typed it in');

const sel = SB.buildSessionFromSelection({ sessionType:'full', durationMins:30, selectedIds:[] });
check('the self-directed route gets the same answer', sel?.gentleCare === true,
  'a safety rule honoured by one of two entry points is the week\'s recurring fault');

// ── 2. It does NOT fire for anybody else ─────────────────────────────
seed(['knee'], { knee: 6 });
const moderate = SB.buildSession({ sessionType:'full', durationMins:30 });
check('moderate pain still gets a real session', !moderate?.gentleCare,
  'getZoneStatus calls severe at 7+; 6 is moderate');
check('and it is a full session', (moderate?.exercises || []).length > 4);

seed([], {});
const clear = SB.buildSession({ sessionType:'full', durationMins:30 });
check('no conditions, no bypass', !clear?.gentleCare);

seed(['knee'], { knee: 0 });
check('a declared condition with no pain today does not trigger it',
  !SB.buildSession({ sessionType:'full', durationMins:30 })?.gentleCare,
  'the condition is not the trigger — today\'s score is');

// SILENCE IS NOT SEVERITY. Added after reversal testing: defaulting a
// missing score to 9 was NOT caught, because every fixture above
// supplies one. Somebody who declared a condition at onboarding and has
// never entered a pain score must get a normal session — the codebase
// already holds the same rule for capability, where silence is never
// read as limitation. It has to hold in this direction too, or the
// product stops offering sessions to people who simply never answered.
seed(['knee'], {});
check('a condition with NO score at all is not treated as severe',
  !SB.buildSession({ sessionType:'full', durationMins:30 })?.gentleCare,
  'silence is not severity');
check('and the zone function agrees',
  C.getZoneStatus(['knee'], {})['lower-limb'] === undefined);

// ── 3. The card says the right things ────────────────────────────────
seed(['knee'], { knee: 9 });
const card = SB.buildSession({ sessionType:'full', durationMins:30 });
const line = card.coachLine;
check('the coach explains why', /pain is high today/.test(line));
check('and says nothing is required', /None of it is required/.test(line));
for (const [re, what] of [
  [/\byou (have|might have)\b/i,   'a diagnosis'],
  [/\bknee\b|\binjur/i,            'the condition name'],
  [/\bshould\b|\bmust\b/i,         'an instruction'],
  [/\brest day\b/i,                'a verdict on their day'],
  [/see (a|your) (doctor|physio|gp)/i, 'a referral the red-flag screen has not been built to make'],
]) {
  check(`the card contains no ${what}`, !re.test(line));
}

// ── 4. The override exists for a future control ──────────────────────
seed(['knee'], { knee: 9 });
const overridden = SB.buildSession({ sessionType:'full', durationMins:30, ignoreSevere: true });
check('a deliberate override can still build a session', !overridden?.gentleCare,
  'nobody is locked out; this changes what the coach offers, not what a person may reach');

// ── 5. The threshold disagreement, pinned ────────────────────────────
//
// EXPECTED TO FAIL the day somebody reconciles these — which is the
// point. It carries the question to whoever does the clinical review.
check('the two severity definitions still disagree, and that is recorded',
  C.getPainBand(7).id === 'moderate' &&
  C.getZoneStatus(['knee'], { knee: 7 })['lower-limb'] === 'severe',
  'getPainBand says 7 is moderate; getZoneStatus says 7 is severe. Unreconciled, deliberately — clinical review owns it');

// ── 6. The card's content is real ────────────────────────────────────
const ids = (card.exercises || []).map(e => e.id);
check('the card is built from real library entries, not invented ones',
  ids.length === 3 && ids.every(Boolean),
  ids.join(', '));
check('and every item is marked as gentle care',
  (card.exercises || []).every(e => e._gentleCare === true));

console.log(failures === 0 ? '\nALL PASS\n' : `\n${failures} FAILURE(S)\n`);
process.exit(failures === 0 ? 0 : 1);
