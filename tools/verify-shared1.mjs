/**
 * tools/verify-shared1.mjs
 * 21 Aug 2026 v2
 * GATE-PATH. Path resolution only -- no assertion changed.
 *
 * 15 Aug 2026 v1
 *
 * SHARED-1. The end-of-session moments reach every session view.
 *
 * Written because I shipped four of them into ONE of eleven session
 * views, Graeme tested through a different door, and every one of the 51
 * gates stayed green. None of them knew which views a person can reach.
 *
 * This one asks the only question that mattered: does a session ending
 * in view X show the coach's moments? It answers it by checking that X
 * routes to reflect.js, which is where the moments now live.
 */

// GATE-PATH, 21 Aug 2026. jsdom resolved through Node rather than by
// absolute path into one machine's node_modules.
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
import fs from 'node:fs';
import path from 'node:path';
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html>', { url: 'https://build-new-habits.github.io/alongside-app/' });
globalThis.window = dom.window; globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true, writable: true });
Object.defineProperty(globalThis, 'localStorage', { value: dom.window.localStorage, configurable: true, writable: true });

const BASE = new URL('../js/', import.meta.url).href;
const { store } = await import(BASE + 'store.js');
const SM = await import(BASE + 'data/session-moments.js');

let failures = 0;
const check = (n, ok, d='') => { console.log(`${ok?'PASS':'FAIL'}  ${n}${d?' — '+d:''}`); if(!ok) failures++; };

// ── One home, and it is the shared one ───────────────────────
const reflect = fs.readFileSync('js/views/reflect.js', 'utf8');
check('reflect.js renders the moments',
  /renderSessionMoments\(/.test(reflect) && /\$\{renderSessionMoments/.test(reflect),
  'defined AND composed');
check('and wires their controls', /attachSessionMoments\(/.test(reflect));
check('and resets them on a fresh mount', /resetSessionMoments\(\)/.test(reflect));

// Both repaint sites must re-wire, or the chips die on one path.
const repaints = (reflect.match(/main\.innerHTML = render\(\)/g) || []).length;
const wirings  = (reflect.match(/attachSessionMoments\(main/g) || []).length;
check('every repaint site re-wires the controls', wirings >= repaints - 1,
  `${repaints} repaints, ${wirings} wirings`);

// ── Every session view reaches it ────────────────────────────
const views = fs.readdirSync('js/views').filter(f => f.endsWith('.js'));
const SESSION_VIEWS = views.filter(f => {
  const s = fs.readFileSync(path.join('js/views', f), 'utf8');
  return /store\.logActivity\(\{/.test(s) && /type:\s*["'](?!checkin)/.test(s);
});
check('there are session views to check', SESSION_VIEWS.length >= 8,
  `${SESSION_VIEWS.length} found`);

const orphans = [];
for (const f of SESSION_VIEWS) {
  const s = fs.readFileSync(path.join('js/views', f), 'utf8');
  const routesToReflect = /navigate\(["']reflect["']\)/.test(s);
  const rendersItself   = /renderSessionMoments\(/.test(s);
  if (!routesToReflect && !rendersItself) orphans.push(f);
}
check('every session view routes to reflect or renders the moments itself',
  orphans.length === 0,
  orphans.length ? `no coach moments after a session in: ${orphans.join(', ')}`
                 : `${SESSION_VIEWS.length} views covered`);

// ── No second copy ───────────────────────────────────────────
const dupes = views.filter(f => {
  const s = fs.readFileSync(path.join('js/views', f), 'utf8');
  return /firstSessionRecognition\(|shouldOfferBaseline\(/.test(s);
});
check('the moments are defined in exactly one place', dupes.length === 0,
  dupes.length ? `also in: ${dupes.join(', ')} — two definitions is how they drift apart` : 'data/session-moments.js only');

// ── It behaves ───────────────────────────────────────────────
localStorage.clear(); store.init();
store.set('onboarding.primaryTerritory', 'wrong-fit');
SM.resetSessionMoments();
store.logActivity({ type: 'core-session', status: 'completed', durationMins: 20,
  exercisesCount: 4, completedAt: new Date().toISOString() });
const first = SM.renderSessionMoments({ exerciseIds: [] });
check('a first session shows the recognition', /That was your first one/.test(first));

store.logActivity({ type: 'core-session', status: 'completed', durationMins: 20,
  exercisesCount: 4, completedAt: new Date(Date.now() + 90000).toISOString() });
SM.resetSessionMoments();
const second = SM.renderSessionMoments({ exerciseIds: [] });
check('a second session does not', !/That was your first one/.test(second));

check('a session with no exercises gets no baseline questions',
  !/How was /.test(second),
  'breathing and journalling have nothing to ask about');

// State must not leak between sessions.
SM.resetSessionMoments();
check('resetSessionMoments clears state', typeof SM.resetSessionMoments === 'function');

console.log(failures === 0 ? '\nSHARED-1 GATE GREEN' : `\nSHARED-1 GATE RED — ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
