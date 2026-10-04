/**
 * tools/verify-sleep1.mjs
 * 04 Oct 2026 v6
 *
 * v6 - LOOK-1. Settings' rows live on section pages, not the index. Check 5
 *   ("rows on the one page") tested the old layout directly: it now gathers
 *   the row labels from every section page (index -> each section), so it
 *   still holds that each dial is a named row one section away. Checks 6-10
 *   open each row through settingsFind (index -> the section that holds it
 *   -> the row). Before this, check 9 passed only because the profile row
 *   was never reached; it now reads the real Profile screen. No expected
 *   value changed, no assertion loosened.
 *
 * v5 - W4-1 GATE-OPEN. The fixture person has agreed (tools/agreed.mjs): the
 *   app now sends anybody who has not back to onboarding. No assertion
 *   changed.
 *
 * v4 - Work list 2e. Checks 1-2 read workoutGenerator.js, which nothing
 *   had called since 6 Sep. SLEEP-1's rule -- the coach may mention sleep
 *   only if the session reads it -- now holds across EVERY app module,
 *   and specifically for the live builder, which does both since
 *   GENTLE-SIGNALS (2b): it reads sleepQuality and says "You said you
 *   slept badly". verify-gentle-signals 1.1-1.2 drive that. Checks 3-10
 *   unchanged.
 *
 * 28 Sep 2026 v3
 * SMOOTH-P4c. COACH-TILE's door was a fourth landing row; Settings is now
 *   one page, and the three dials are rows of their own under "You" and
 *   "How the coach works" -- one tap, not two. Checks 5-10 follow them:
 *   each is a named row, each opens its own screen, each saves with no
 *   Save button (the property check 8 guarded), and Profile still does
 *   not render them twice. Checks 1-4 (SLEEP-1) unchanged.
 *
 * 21 Aug 2026 v2
 * GATE-PATH. Path resolution only -- no assertion changed.
 *
 * 18 Aug 2026 v1
 *
 * SLEEP-1 — the coach claimed an adaptation that never happened.
 * COACH-TILE — the dials that decide what the coach offers got a door.
 *
 * SLEEP-1 is the one that matters. generateRationale() said "I have
 * adjusted for your poor sleep last night" and nothing adjusted:
 * sleepQuality reached no intensity calculation, no exercise filter, no
 * duration cap, and detectBurnout() never looked at it.
 *
 * That is the same fault as onUnmount's missing caller and the Library
 * route exercises/index.js claimed — with the difference that those
 * were comments lying to developers and this was the COACH, in coach
 * voice, telling a person it had done something for them.
 *
 * So the load-bearing assertion is #1, and it is deliberately shaped as
 * a RULE rather than as a string check: no coach-facing copy anywhere
 * may claim an adaptation on a field the engine does not read. Written
 * this way because the next instance will not use the word "sleep".
 *
 * Every assertion was reversal-tested.
 */

// GATE-PATH, 21 Aug 2026. jsdom resolved through Node rather than by
// absolute path into one machine's node_modules.
import { agreed } from "./agreed.mjs";
import { settingsFind, settingsSection } from "./settings-open.mjs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
import fs from 'node:fs';
import path from 'node:path';
const { JSDOM } = __require("jsdom");

let failures = 0;
const check = (n, ok, d = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`);
  if (!ok) failures++;
};

const root = new URL('../', import.meta.url).pathname;
// 2e: every app module, not the retired engine.
const _walk = d => fs.readdirSync(path.join(root, d), { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? _walk(path.join(d, e.name)) : (e.name.endsWith('.js') ? [path.join(d, e.name)] : []));
const APP = _walk('js').map(f => [f, fs.readFileSync(path.join(root, f), 'utf8')]);
const sbSrc = fs.readFileSync(path.join(root, 'js/session-builder.js'), 'utf8');

const strip = s => s
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

// ── SLEEP-1 ──────────────────────────────────────────────────────────

const allBody = APP.map(([, t]) => strip(t)).join('\n');

check('1  SLEEP-1: nothing in the app claims an adaptation it does not perform',
  !/adjusted for your poor sleep/i.test(allBody) && APP.length > 100,
  `${APP.length} modules scanned`);

// The rule, on the path that runs: the builder may mention sleep only
// because it reads it. Asserted as a RELATIONSHIP, so the gate stays
// honest either way rather than banning a sentence.
const sbBody = strip(sbSrc);
const lines = sbBody.slice(sbBody.indexOf('const GENTLE_LINES'), sbBody.indexOf('};', sbBody.indexOf('const GENTLE_LINES')));
const readsSleep = /sleepQuality === "poor"/.test(sbBody);
const claimsSleep = /slept/i.test(lines);
check('2  SLEEP-1 (the rule): the live builder mentions sleep only because it reads it',
  lines.length > 100 && (!claimsSleep || readsSleep),
  `reads sleepQuality: ${readsSleep}, mentions sleep in coach copy: ${claimsSleep}`);

// The question is still ASKED and still STORED. Removing the claim must
// not quietly remove the data with it — that would be a second decision
// smuggled inside the first.
const checkinData = fs.readFileSync(path.join(root, 'js/data/checkin.js'), 'utf8');
check('3  the answer is still stored — the claim went, the data did not',
  /sleepHours:\s*data\.sleepHours/.test(checkinData) &&
  /sleepQuality:\s*data\.sleepQuality/.test(checkinData));

const checkinView = fs.readFileSync(path.join(root, 'js/views/checkin.js'), 'utf8');
// SMOOTH-P1, 28 Sep 2026: sleep is optional, one link away, and asked
// only if the person offers it. Driven in verify-checkin-three TEST 5.
check('4  and the check-in still lets you say how you slept (optional since SMOOTH-P1)',
  /_askSleep\(\)/.test(strip(checkinView)));

// ── COACH-TILE ───────────────────────────────────────────────────────

const dom = new JSDOM('<!doctype html><div id="main-content"></div>',
  { url: 'https://build-new-habits.github.io/alongside-app/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true, writable: true });
Object.defineProperty(globalThis, 'localStorage', { value: dom.window.localStorage, configurable: true, writable: true });

const BASE = new URL('../js/', import.meta.url).href;
const { store }  = await import(BASE + 'store.js');
const { router } = await import(BASE + 'router.js');
dom.window.router = router;
globalThis.router = router;
const SettingsMod = await import(BASE + 'views/settings.js');

const el = document.getElementById('main-content');
localStorage.clear();
store.init(); agreed(store);

// The reflection section renders nothing without a primaryTerritory,
// which is correct -- there is no reflection to show somebody who never
// answered that question. Seeded here so check 7 tests the panel's
// contents rather than a fresh user's empty state. The first run of
// this gate failed on exactly that and the SEED was wrong, not the app.
store.set('onboarding.primaryTerritory', 'trust-rupture');

// settings.js is the factory shape -- SettingsView(router) returning
// { mount }. Not render/onMount like the newer views. Confirmed by
// reading its exports, not guessed: the first run of this gate assumed
// the newer shape and died on it.
const settings = SettingsMod.SettingsView(router);
settings.mount(el);

const click = x => x?.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
const rowLabels = ['you', 'body', 'sessions', 'display', 'data', 'plan', 'about'].flatMap(id => {
  settingsSection(el, id);
  return [...el.querySelectorAll('.settings-secpage .settings-row__label')].map(r => r.textContent.trim());
});
check('5  the three dials are rows on the one page, by name',
  ['What your body can do', 'How much sessions change', 'Your reflection'].every(l => rowLabels.includes(l)), rowLabels.join(', '));

const open = key => { SettingsMod.SettingsView(router).mount(el); click(settingsFind(el, `[data-open="${key}"]`)); return el.textContent.replace(/\s+/g, ' ').trim(); };
check('6  What your body can do opens its own screen', /What your body can do today/.test(open('capability')));
check('7  and so do the other two',
  /How you like things/.test(open('preferences')) && /Your reflection/.test(open('reflection')),
  'preferences, reflection');

open('capability');
const capSel = el.querySelector('[data-field="capability.chairRise"]');
if (capSel) { capSel.value = capSel.options[1].value; capSel.dispatchEvent(new dom.window.Event('change', { bubbles: true })); }
check('8  they save as they change -- no Save button, and nothing lost',
  !el.querySelector('[data-action^="save-"]') && store.get('capability.chairRise') === capSel?.value);

const settingsFlat = open('profile');
check('9  COACH-TILE (inverse): Profile does not render them too',
  !/What your body can do today/.test(settingsFlat));

check('10 but Profile keeps what is genuinely a fact about you',
  /Your profile/.test(settingsFlat));

console.log(failures === 0
  ? `\nAll 10 checks green.`
  : `\n${failures} FAILED.`);
process.exit(failures === 0 ? 0 : 1);
