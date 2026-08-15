/**
 * tools/verify-quick1.mjs
 * 15 Aug 2026 v1
 *
 * QUICK-1. The short check-in path for persona 2.16.
 *
 * Matrix open question 6 asked what stays non-negotiable when the coach
 * compresses. This gate is the answer, written down and enforced: the
 * coach still speaks first, energy and mood are still asked, and the
 * pain question is not compressible at any setting.
 */
import fs from 'node:fs';
import { JSDOM } from '/home/claude/node_modules/jsdom/lib/api.js';
const dom = new JSDOM('<!doctype html>', { url: 'https://build-new-habits.github.io/alongside-app/' });
globalThis.window = dom.window; globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true, writable: true });
Object.defineProperty(globalThis, 'localStorage', { value: dom.window.localStorage, configurable: true, writable: true });

const BASE = new URL('../js/', import.meta.url).href;
const { store } = await import(BASE + 'store.js');
const ci = await import(BASE + 'data/checkin.js');

let failures = 0;
const check = (n, ok, d='') => { console.log(`${ok?'PASS':'FAIL'}  ${n}${d?' — '+d:''}`); if(!ok) failures++; };

const src      = fs.readFileSync(new URL('../js/views/checkin.js', import.meta.url), 'utf8');
const settings = fs.readFileSync(new URL('../js/views/settings.js', import.meta.url), 'utf8');

// ── Schema ───────────────────────────────────────────────────
localStorage.clear(); store.init();
check('the default is the full check-in', store.get('sessionPace') === 'full',
  'nobody is opted into the short one without choosing it');
store.set('sessionPace', 'brief');
check('the preference persists', store.get('sessionPace') === 'brief');
// Validation lives in mergeWithDefaults(), which runs on LOAD — so a
// stray value is corrected on the next open, not on write. Tested the
// way it actually happens rather than the way I first assumed it did.
localStorage.clear(); store.init();
store.set('sessionPace', 'nonsense');
store.init();
check('a corrupted value is corrected on load',
  ['full', 'brief'].includes(store.get('sessionPace')),
  store.get('sessionPace'));
check('and an unknown value fails safe as the FULL path meanwhile',
  /=== 'brief'/.test(src),
  "_briefPath() tests for 'brief', so anything else takes the long route");

// ── The branch ───────────────────────────────────────────────
const branch = src.slice(src.indexOf('if (_briefPath())'), src.indexOf('_showFeelingWordPanel();', src.indexOf('if (_briefPath())')));
check('the brief path branches after mood, not before it', branch.length > 0);
check('and it skips the feeling word, sleep and variety',
  /_finishConversation\(\)|_showConditionsPanel\(\)/.test(branch) &&
  !/_showFeelingWordPanel\(\)|_showSleepPanel\(\)|_showVarietyPanel\(\)/.test(branch));

// The non-negotiables.
const beforeBranch = src.slice(0, src.indexOf('if (_briefPath())'));
check('energy is still asked on the brief path',
  /_showEnergyPanel/.test(beforeBranch),
  'the source of todayIntensity');
check('mood is still asked on the brief path',
  /_showMoodPanel/.test(beforeBranch),
  'energy and mood are what detectBurnout() actually reads');
check('the coach still responds before the branch',
  /_showCoachBubble\(_moodBridge/.test(beforeBranch),
  '"coach speaks first" is the line this feature may not cross');
check('PAIN IS NOT COMPRESSIBLE — asked at either setting',
  /_conditions\.length > 0[\s\S]{0,200}_showConditionsPanel\(\)/.test(branch),
  'somebody with a declared condition is not offered a shortcut past it');

// ── Burnout still works on the brief path ────────────────────
// Five brief check-ins: energy and mood only, no sleep.
localStorage.clear(); store.init();
store.set('sessionPace', 'brief');
for (let i = 5; i >= 1; i--) {
  const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
  const h = store.get('checkinHistory') || {};
  h[d] = { energy: 3, mood: 3, date: d };
  store.set('checkinHistory', h);
}
check('burnout is still detected without sleep data',
  ci.detectBurnout().level !== 'none', ci.detectBurnout().level);

// ── Reachable ────────────────────────────────────────────────
check('Settings exposes the control', /data-field="sessionPace"/.test(settings));
check('and saves it', /store\.set\('sessionPace', p\)/.test(settings));
check('the control is validated on save',
  /p === 'full' \|\| p === 'brief'/.test(settings));
check('the hint tells her pain is still asked',
  /still ask about pain/.test(settings),
  'otherwise choosing short feels like opting out of safety');

// It must not ask her every time. Asserted on the CONSTRUCT: the
// predicate reads the stored preference, and the brief branch renders no
// panel of its own. The first version of this searched the source for
// "have you got time" and failed — because my own explanatory comment
// contains the phrase. Seventh time a check in this project has matched
// prose instead of code.
const pred = src.slice(src.indexOf('function _briefPath()'),
                       src.indexOf('function _showEnergyPanel()'));
check('the pace is read from storage, not asked for',
  /store\.get\('sessionPace'\)/.test(pred), pred.trim().split('\n').pop());
check('the brief branch renders no extra question',
  !/_buildPanel\(/.test(branch),
  'asking would be the friction she is complaining about');

console.log(failures === 0 ? '\nQUICK-1 GATE GREEN' : `\nQUICK-1 GATE RED — ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
