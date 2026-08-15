/**
 * tools/verify-write1.mjs
 * 14 Aug 2026 v1
 *
 * WRITE-1. lifestyle.stressLevel has a reader, and it is bounded.
 * The bounds matter more than the feature: an onboarding answer that
 * outranked live check-ins, or that hardened a session, would be worse
 * than the silence it replaced.
 */
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

function setup(stressLevel, days) {
  localStorage.clear(); store.init();
  store.set('lifestyle.stressLevel', stressLevel);
  const h = {};
  for (let i = 0; i < days; i++) h[`2026-08-0${i+1}`] = { energy: 7, mood: 7 };
  store.set('checkinHistory', h);
}

setup('running-low', 0);
check('a low onboarding answer softens the first session',
  ci.coldStartBias() === 'lighter' && ci.resolveIntensity('moderate', null) === 'low');

setup('exhausted', 0);
check("'exhausted' also softens", ci.coldStartBias() === 'lighter');

setup('pretty-good', 0);
check('a good answer changes nothing — it cannot harden a session',
  ci.coldStartBias() === null && ci.resolveIntensity('moderate', null) === 'moderate');

setup('running-low', 3);
check('it switches OFF once three check-ins exist',
  ci.coldStartBias() === null,
  'a month-old onboarding answer must never outrank this week');

setup('running-low', 0);
check('a real coach bias still wins over it',
  ci.resolveIntensity('high', 'rest') === 'low');
check('it never raises intensity',
  ci.resolveIntensity('low', null) === 'low');

setup('running-low', 0);
check('it is NOT reported as burnout',
  ci.detectBurnout().level === 'none',
  'burnout is a claim about an observed pattern, not a self-report');

check('the threshold matches detectBurnout()',
  (() => { setup('running-low', 2); return ci.coldStartBias() === 'lighter'; })() &&
  (() => { setup('running-low', 3); return ci.coldStartBias() === null; })(),
  'a mismatch would leave a window where neither signal applies');

console.log(failures === 0 ? '\nWRITE-1 GATE GREEN' : `\nWRITE-1 GATE RED — ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
