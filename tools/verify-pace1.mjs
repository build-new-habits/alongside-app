/**
 * tools/verify-pace1.mjs
 * 21 Aug 2026 v2
 * GATE-PATH. Path resolution only -- no assertion changed.
 *
 * 15 Aug 2026 v1
 *
 * PACE-1 and PACE-2. Matrix decisions 4 and 4a.
 *
 * The assertions that matter most are the NEGATIVE ones. This feature
 * exists for persona 2.8, whose failure mode is harm — but the way it
 * would fail her is by becoming a limit, and the way it would fail
 * persona 2.11 is by treating breathing practice as overreach. Both are
 * gated here.
 */

// GATE-PATH, 21 Aug 2026. jsdom resolved through Node rather than by
// absolute path into one machine's node_modules.
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
import fs from 'node:fs';
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html>', { url: 'https://build-new-habits.github.io/alongside-app/' });
globalThis.window = dom.window; globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true, writable: true });
Object.defineProperty(globalThis, 'localStorage', { value: dom.window.localStorage, configurable: true, writable: true });

const BASE = new URL('../js/', import.meta.url).href;
const { store } = await import(BASE + 'store.js');
const P = await import(BASE + 'data/pacing.js');

let failures = 0;
const check = (n, ok, d='') => { console.log(`${ok?'PASS':'FAIL'}  ${n}${d?' — '+d:''}`); if(!ok) failures++; };

function log(type, n = 1, status = 'completed') {
  for (let i = 0; i < n; i++) {
    store.logActivity({ type, status, durationMins: 20, exercisesCount: 6,
      completedAt: new Date(Date.now() + i * 60000).toISOString() });
  }
}
function fresh() { localStorage.clear(); store.init(); }

// ── The cap counts the right things ──────────────────────────
fresh(); log('core-session', 2);
check('two sessions is not noticed', P.noticeDailyPace() === null);

fresh(); log('core-session', 3);
check('the third IS noticed', P.noticeDailyPace() !== null);

fresh(); log('core-session', 3);
P.noticeDailyPace();
check('and only once that day', P.noticeDailyPace() === null,
  'repeating it turns one observation into pressure');

fresh(); log('core-session', 5);
const fourth = P.noticeDailyPace();
P.noticeDailyPace();
check('a fourth and fifth are NEVER blocked or re-warned',
  fourth !== null && P.noticeDailyPace() === null && P.todaysExerciseCount() === 5,
  'soft threshold, never a hard block');

// Mindful work is uncapped, deliberately.
fresh(); log('mindful', 4);
check('breathing and Noticing are uncapped entirely',
  P.noticeDailyPace() === null && P.todaysExerciseCount() === 0,
  'persona 2.11 enters through that door — warning her would be actively wrong');

fresh(); log('mindfulness', 3);
check("'mindfulness' is uncapped too", P.noticeDailyPace() === null);

fresh(); log('core-session', 2); log('mindful', 3);
check('mindful work does not push exercise over the cap',
  P.noticeDailyPace() === null, `count ${P.todaysExerciseCount()}`);

// Partial exits are not sessions.
fresh(); log('core-session', 3, 'partial');
check('abandoned sessions do not count toward the cap',
  P.noticeDailyPace() === null,
  'otherwise opening and closing a screen three times triggers it');

// Every counted type must be a type something actually logs.
const viewSrc = fs.readdirSync(new URL('../js/views/', import.meta.url))
  .filter(f => f.endsWith('.js'))
  .map(f => fs.readFileSync(new URL('../js/views/' + f, import.meta.url), 'utf8'))
  .join('\n');
const bogus = [...P._EXERCISE_TYPES].filter(ty =>
  !new RegExp(`type:\\s*["']${ty}["']`).test(viewSrc));
check('every counted type is one a view actually logs', bogus.length === 0,
  bogus.length ? `never logged: ${bogus.join(', ')}` : `${P._EXERCISE_TYPES.size} types, all real`);

// ── Tone: it must not become a limit ─────────────────────────
fresh(); log('core-session', 3);
const line = P.noticeDailyPace();
check('it does not instruct them to stop',
  !/you should stop|stop now|that's enough|too much|don't do/i.test(line.body), line.body.slice(0, 50));
check('it explicitly permits carrying on',
  /have a fourth|if you want/i.test(line.body));
check('it makes no claim about their body',
  !/you're overtraining|you'll injure|your body can't|risk of injury/i.test(line.body),
  'P4: the coach does not diagnose');

// ── PACE-2: the plan jump ────────────────────────────────────
fresh();
store.set('createdAt', new Date(Date.now() - 30 * 86400000).toISOString());
store.set('strategicGoal.weeklySessionTarget', 5);
check('no nudge against a target nobody chose', P.noticePlanJump() === null,
  'setAt unwritten — the default 3 is not a plan anybody made');

store.set('strategicGoal.setAt', new Date().toISOString());
const jump = P.noticePlanJump();
check('a sharp jump from near-zero history is named', jump !== null,
  jump ? jump.body.slice(0, 60) : '');
check('and it is named at most once a week', P.noticePlanJump() === null,
  'twice would be nagging');

fresh();
store.set('createdAt', new Date(Date.now() - 30 * 86400000).toISOString());
store.set('strategicGoal.weeklySessionTarget', 3);
store.set('strategicGoal.setAt', new Date().toISOString());
for (let w = 0; w < 3; w++)
  for (let i = 0; i < 3; i++)
    store.logActivity({ type: 'core-session', status: 'completed', durationMins: 20,
      exercisesCount: 6, completedAt: new Date(Date.now() - (w * 7 + i) * 86400000).toISOString() });
check('somebody already doing the amount is not nudged',
  P.noticePlanJump() === null, `avg ${P.recentWeeklyAverage()}`);

// Week one must be silent.
fresh();
store.set('createdAt', new Date().toISOString());
store.set('strategicGoal.weeklySessionTarget', 5);
store.set('strategicGoal.setAt', new Date().toISOString());
check('a brand-new user is never told their plan is a jump',
  P.noticePlanJump() === null,
  'landing that on week-one enthusiasm would be the opposite of the point');

const src = fs.readFileSync(new URL('../js/data/pacing.js', import.meta.url), 'utf8');
check('the plan nudge permits the ambitious version',
  /You can absolutely go for it/.test(src));

// ── Wired in ─────────────────────────────────────────────────
// SHARED-1: moved to the shared moments, so it reaches every session
// view rather than the one it was originally written into.
const cs = fs.readFileSync(new URL('../js/data/session-moments.js', import.meta.url), 'utf8');
check('the shared moments call AND render the daily line',
  /noticeDailyPace\(\)/.test(cs) && /if \(pacingNote\)/.test(cs) &&
  /pacingNote\.heading/.test(cs));
const today = fs.readFileSync(new URL('../js/views/today.js', import.meta.url), 'utf8');
check('Home calls AND renders the plan line',
  /noticePlanJump\(\)/.test(today) && /planJump\s*\n?\s*\?\s*planJump\.body/.test(today));

console.log(failures === 0 ? '\nPACE GATE GREEN' : `\nPACE GATE RED — ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
