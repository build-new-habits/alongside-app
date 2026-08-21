/**
 * tools/verify-pb1.mjs
 * 21 Aug 2026 v3
 * GATE-PATH. Path resolution only -- no assertion changed.
 *
 * 20 Aug 2026 v2
 *
 * PB-1. Personal bests for persona 2.7, without turning the product
 * into a scoreboard for everybody else.
 *
 * R4 / decision 7.1, 20 Aug 2026. THE TIER CHECK IS INVERTED. Matrix
 * decision 2 (05 Jul) made bests a paid feature. A best is a fact about
 * the person's own log -- they produced it, and free already includes
 * lift notes and recall -- so it is free.
 *
 * WHAT DID NOT CHANGE, and it is the more important half: the opt-in.
 * showPersonalBests still defaults to false and every tone assertion
 * below still holds. Ungating is not switching on. For personas 2.5,
 * 2.8 and 2.13 a visible best is a target to fall short of, which is
 * the failure this product exists to avoid -- and that risk belongs to
 * free users exactly as much as paid ones, so widening who can see it
 * makes the default MORE load-bearing, not less.
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
const slog = await import(BASE + 'session-log.js');

let failures = 0;
const check = (n, ok, d='') => { console.log(`${ok?'PASS':'FAIL'}  ${n}${d?' — '+d:''}`); if(!ok) failures++; };
const fresh = () => { localStorage.clear(); store.init(); };

// ── Recording ────────────────────────────────────────────────
fresh();
for (const w of [60, 80, 70, 85, 75]) store.logLift('squat', { weight: w, reps: 5 });
check('the best is the maximum, not the latest',
  store.personalBest('squat')?.weight?.value === 85, 'last logged was 75');

fresh();
store.logLift('squat', { weight: 80 });
const at = store.personalBest('squat')?.weight?.at;
store.logLift('squat', { weight: 80 });
check('equalling a best does not replace it',
  store.personalBest('squat')?.weight?.at === at,
  'announcing an equal as new would be a small untruth');

// The reason this is stored rather than derived.
fresh();
store.logLift('deadlift', { weight: 140 });
for (let i = 0; i < 25; i++) store.logLift('deadlift', { weight: 60 });
check('a best survives liftLog evicting its entry',
  store.personalBest('deadlift')?.weight?.value === 140,
  'liftLog caps at 20 — a derived best would have been thrown away');
check('and liftLog itself is still capped',
  (store.get('liftLog').deadlift || []).length === 20);

// Ambiguous metrics are deliberately absent.
fresh();
store.logLift('plank', { durationMins: 3 });
check('durationMins is NOT tracked as a best',
  !store.personalBest('plank')?.durationMins,
  'longer is better for a plank and worse for a 5k — a best that is sometimes backwards is worse than none');

fresh();
store.logLift('run', { distance: 10, speed: 12 });
check('distance and speed are tracked',
  store.personalBest('run')?.distance?.value === 10 && store.personalBest('run')?.speed?.value === 12);

fresh();
store.logLift('squat', { weight: 100, unit: 'lb' });
check('the unit travels with the weight',
  store.personalBest('squat')?.weight?.unit === 'lb');

fresh();
check('no lifts means no best', store.personalBest('squat') === null);

// Recorded even while hidden — otherwise turning it on loses history.
fresh();
store.set('showPersonalBests', false);
store.logLift('squat', { weight: 90 });
// Null-safe: an earlier version dereferenced .weight directly, so
// reversing this behaviour threw a TypeError and the gate produced no
// output at all rather than a clean FAIL. A gate that crashes is not a
// gate that failed — it is a gate nobody can read.
check('bests are recorded even when hidden',
  store.personalBest('squat')?.weight?.value === 90,
  'otherwise switching it on later would start from nothing');

// ── Showing ──────────────────────────────────────────────────
const ex = { id: 'squat', name: 'Squat' };
fresh(); store.set('tier', 'personal'); store.logLift('squat', { weight: 90 });
check('hidden by default', slog.bestLine(ex) === '',
  'showPersonalBests defaults to false');

store.set('showPersonalBests', true);
check('shown when asked for', /Your best: 90/.test(slog.bestLine(ex)), slog.bestLine(ex));

store.set('tier', 'free');
check('R4: a FREE user sees their own best when they ask for it',
  /Your best: 90/.test(slog.bestLine(ex)),
  slog.bestLine(ex) || '(empty) — the tier gate is back. "Your best: 90 kg" ' +
  'is a fact the person produced, not a coach read');

// The inverse, and the one that matters more. Asserted on the FREE tier
// specifically: ungating widened who is exposed to the default, so the
// default has to hold for the newly-included group, not just the old one.
fresh(); store.set('tier', 'free'); store.logLift('squat', { weight: 90 });
check('R4 (inverse): and still NOT by default, on free',
  slog.bestLine(ex) === '',
  'ungating is not switching on — a visible best is a target to fall ' +
  'short of for personas 2.5, 2.8 and 2.13');
store.set('showPersonalBests', true);

// ── Tone ─────────────────────────────────────────────────────
store.set('tier', 'personal');
const line = slog.bestLine(ex);
check('no delta against the last attempt', !/up |down |\+|improved|since/i.test(line), line);
check('no ranking or celebration', !/new best|PB!|record|congrat|🎉/i.test(line), line);

const src = fs.readFileSync(new URL('../js/session-log.js', import.meta.url), 'utf8');
check('it is flat, like the last-note line above it',
  /slog__best/.test(src) && /store\.get\('showPersonalBests'\)/.test(src));

const css = fs.readFileSync(new URL('../css/components/session-log.css', import.meta.url), 'utf8');
// SWEEP-1, 18 Aug 2026. Negative {0,120} window -- silently green if the
// emphasis moved past 120 characters, e.g. behind a media query or below
// two added properties. Asserted against the RULE BLOCK instead, which is
// the actual unit: everything between the selector and its closing brace.
{
  const i = css.indexOf('.slog__best');
  const block = i === -1 ? '' : css.slice(i, css.indexOf('}', i) + 1);
  check('and styled the same as the last-note line, not highlighted',
    i !== -1 && !/gold|--color-accent|bold|700|600/.test(block),
    i === -1 ? '.slog__best not found — the assertion had nothing to read'
             : 'a best styled as an achievement becomes a target to defend');
}

// ── Reachable ────────────────────────────────────────────────
const settings = fs.readFileSync(new URL('../js/views/settings.js', import.meta.url), 'utf8');
check('Settings has the toggle', /data-action="toggle-pb"/.test(settings));
check('and it is separate from session notes',
  /showPersonalBests/.test(settings) && /liftLogEnabled/.test(settings),
  'somebody using notes as a memory aid did not ask to be shown a best');

console.log(failures === 0 ? '\nPB-1 GATE GREEN' : `\nPB-1 GATE RED — ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
