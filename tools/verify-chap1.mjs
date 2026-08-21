/**
 * tools/verify-chap1.mjs
 * 21 Aug 2026 v2
 * GATE-PATH. Path resolution only -- no assertion changed.
 *
 * 15 Aug 2026 v1
 *
 * CHAP-1 step 1. The programme presentation schema.
 *
 * Most of these are NEGATIVE assertions, because this is the feature
 * most likely to reintroduce the things the product has spent two days
 * removing: a countdown, a streak, a target you can fall behind.
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

let failures = 0;
const check = (n, ok, d='') => { console.log(`${ok?'PASS':'FAIL'}  ${n}${d?' — '+d:''}`); if(!ok) failures++; };

localStorage.clear(); store.init();
check('the default presentation is chapters', store.get('programme').presentation === 'chapters',
  'safer for the primary market; Blocks is offered at the first hinge');
check('no chapters recorded yet', store.get('programme').chaptersDone.length === 0);
check('no weekly focus proposed yet', store.get('weekFocus').key === null);
check('the focus is not marked as edited before it exists',
  store.get('weekFocus').editedByUser === false);

store.set('programme.presentation', 'blocks');
check('blocks persists', store.get('programme').presentation === 'blocks');

localStorage.clear(); store.init();
store.set('programme.presentation', 'nonsense');
store.init();
check('an unknown presentation is corrected on load',
  ['chapters', 'blocks'].includes(store.get('programme').presentation),
  store.get('programme').presentation);

localStorage.clear(); store.init();
store.set('programme.chaptersDone', 'not an array');
store.init();
check('a corrupted chaptersDone becomes an array',
  Array.isArray(store.get('programme').chaptersDone));

// ── The negative assertions ──────────────────────────────────
const src = fs.readFileSync(new URL('../js/store.js', import.meta.url), 'utf8');
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
// Slice from the STRIPPED source. Taking indices from the raw file meant
// a comment mentioning sessionMode appeared before the field itself and
// the slice came out empty — an assertion testing nothing, which is the
// ninth time today. Strip first, then locate.
const stripped = strip(src);
const block = stripped.slice(
  stripped.indexOf('programme: {'),
  stripped.indexOf('sessionMode:', stripped.indexOf('programme: {')));

check('no field counts weeks remaining',
  !/remaining|weeksLeft|daysLeft|countdown/i.test(block),
  'progress made, never distance left');
check('no field counts consecutive anything',
  !/streak|consecutive|inARow/i.test(block),
  'STREAK-1 removed the one streak this product had');
check('chaptersDone records what was FINISHED, not what is outstanding',
  /chaptersDone/.test(block) && !/chaptersRemaining|chaptersLeft/.test(block));

// The only legitimate countdown field, and it predates this work.
check('targetDate still exists as the one honest countdown',
  'targetDate' in (store.get('strategicGoal') || {}),
  'a date the person supplied is a fact, not manufactured pressure');
check('and it is still unwritten, so nothing has started counting yet',
  store.get('strategicGoal').targetDate === null);

// Blueprint promises that must survive into the build.
const bp = fs.readFileSync(
  new URL('../Documents/Admin/alongside_blueprint_chapters_15aug2026_v1.md', import.meta.url), 'utf8');
check('the blueprint is in the repo for the next session', bp.length > 2000);
check('and it records the one-engine rule',
  /two presentations of ONE engine|One flag, two vocabularies/i.test(bp));

console.log(failures === 0 ? '\nCHAP-1 GATE GREEN' : `\nCHAP-1 GATE RED — ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
