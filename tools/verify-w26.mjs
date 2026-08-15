/**
 * tools/verify-w26.mjs
 * 14 Aug 2026 v1
 *
 * W2-6. "Something like last time" means it, and the other two settings
 * are unmoved. Measured rather than asserted: intentPriority and slot
 * anchoring are probabilistic, so a single session proves nothing.
 */
import { JSDOM } from '/home/claude/node_modules/jsdom/lib/api.js';
const dom = new JSDOM('<!doctype html>', { url: 'https://build-new-habits.github.io/alongside-app/' });
globalThis.window = dom.window; globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true, writable: true });
Object.defineProperty(globalThis, 'localStorage', { value: dom.window.localStorage, configurable: true, writable: true });

const BASE = new URL('../js/', import.meta.url).href;
const { store } = await import(BASE + 'store.js');
const ci = await import(BASE + 'data/checkin.js');
const sb = await import(BASE + 'session-builder.js');

let failures = 0;
const check = (n, ok, d='') => { console.log(`${ok?'PASS':'FAIL'}  ${n}${d?' — '+d:''}`); if(!ok) failures++; };
const idsOf = x => { const a=(x&&(x.exercises||x.items||x))||[]; return (Array.isArray(a)?a:[]).map(e=>e.id||e.exerciseId).filter(Boolean); };

function overlap(variety, trials = 8) {
  const all = [];
  for (let t = 0; t < trials; t++) {
    localStorage.clear(); store.init();      // fixture drift: init MERGES
    store.set('equipment', []); store.set('ageBand', '25-34');
    store.set('sessionVariety', variety);
    let prev = null;
    for (let s = 0; s < 9; s++) {
      ci.saveCheckin({ energy: 6, mood: 6, sleepHours: 7, sleepQuality: 'okay', unwell: false });
      const ids = idsOf(sb.buildSession({ sessionType: 'full', durationMins: 25 }));
      store.logActivity({ type: 'core-session', completedAt: new Date().toISOString(),
        status: 'completed', durationMins: 25, exercisesCount: ids.length, exerciseIds: ids });
      if (prev) { const p = new Set(prev); all.push(ids.filter(i => p.has(i)).length / ids.length * 100); }
      prev = ids;
    }
  }
  return all.reduce((a, b) => a + b, 0) / all.length;
}

const fam = overlap('familiar'), bal = overlap('balanced'), var_ = overlap('varied');
console.log(`\n   familiar ${fam.toFixed(0)}%   balanced ${bal.toFixed(0)}%   varied ${var_.toFixed(0)}%\n`);

check("'familiar' means it — over half the session repeats", fam >= 50, `${fam.toFixed(0)}%`);
check('the three settings stay ordered and separated',
  fam > bal + 15 && bal > var_ + 8, `${fam.toFixed(0)} > ${bal.toFixed(0)} > ${var_.toFixed(0)}`);
check("'familiar' does NOT collapse into identical sessions",
  fam < 90, `${fam.toFixed(0)}% — identical sessions are a different failure and a worse one`);
check("'varied' still delivers real novelty for persona 2.13", var_ < 30, `${var_.toFixed(0)}%`);
check("'balanced' is unmoved — it is the default and was not the problem",
  bal > 20 && bal < 45, `${bal.toFixed(0)}%`);

console.log(failures === 0 ? '\nW2-6 GATE GREEN' : `\nW2-6 GATE RED — ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
