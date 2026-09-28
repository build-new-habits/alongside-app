/**
 * tools/verify-quick1.mjs
 * 28 Sep 2026 v4
 *
 * v4 - SMOOTH-P1. The brief/full choice is gone: every check-in is the
 *   short one (three questions). Retired here, with their guarantees
 *   moved rather than dropped:
 *     - "energy and mood are still asked", "the coach speaks first" and
 *       "PAIN IS NOT COMPRESSIBLE" -> verify-checkin-three (TEST 0, 1, 4:
 *       driven in the real conversation, a listed condition is always
 *       offered first).
 *     - the brief branch and the Settings control -> removed with the
 *       feature (Settings no longer offers it).
 *   Kept: the stored field is still validated on load (it stays for one
 *   release), and burnout still works without sleep data.
 *   The Home offer (QUICK-2) is retired: it pointed to the Settings
 *   control that no longer exists. Asserted below as never offered.
 *
 * 21 Aug 2026 v3
 * GATE-PATH. Path resolution only -- no assertion changed.
 *
 * 18 Aug 2026 v2
 *
 * v2 - One assertion rewritten. See the note at PAIN IS NOT
 *   COMPRESSIBLE: it tested a character distance where it meant to test
 *   an order, and went red on a QUICK-3 change that did not touch the
 *   behaviour it guards. No assertion weakened — the rewritten form
 *   still fails if the conditions panel is dropped or moved above the
 *   test that decides whether to show it, and was reversal-tested both
 *   ways.
 *
 * 15 Aug 2026 v1
 *
 * QUICK-1. The short check-in path for persona 2.16.
 *
 * Matrix open question 6 asked what stays non-negotiable when the coach
 * compresses. This gate is the answer, written down and enforced: the
 * coach still speaks first, energy and mood are still asked, and the
 * pain question is not compressible at any setting.
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

// ── QUICK-2: RETIRED (SMOOTH-P1) ─────────────────────────────
// The offer named a Settings control that no longer exists. It must not
// appear to anyone, however many check-ins they have done.
const P = await import(BASE + 'data/pacing.js');
localStorage.clear(); store.init();
{
  const h = {};
  for (let i = 0; i < 20; i++) {
    const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    h[d] = { energy: 6, mood: 6, date: d };
  }
  store.set('checkinHistory', h);
}
check('the retired offer is never made, even after twenty check-ins', P.offerBriefPath() === null);
check('REVERSAL: the offer is a live call site on Home, so retiring it here is what hides it',
  /offerBriefPath\(\)/.test(fs.readFileSync(new URL('../js/views/today.js', import.meta.url), 'utf8')));

console.log(failures === 0 ? '\nQUICK-1 GATE GREEN' : `\nQUICK-1 GATE RED — ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
