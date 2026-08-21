/**
 * tools/verify-sleep1.mjs
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
const gen  = fs.readFileSync(path.join(root, 'js/data/workoutGenerator.js'), 'utf8');

const strip = s => s
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

// ── SLEEP-1 ──────────────────────────────────────────────────────────

const genBody = strip(gen);

check('1  SLEEP-1: the engine claims no adaptation it does not perform',
  !/adjusted for your poor sleep/i.test(genBody),
  'sleepQuality reaches no intensity, filter or duration logic anywhere');

// The inverse, and the more durable half: if a reader is ever added
// back, the claim may return with it. This asserts the RELATIONSHIP,
// so the gate stays honest either way rather than banning a sentence.
const readsSleep = /sleepQuality/.test(genBody);
const claimsSleep = /\bsleep\b/i.test(
  (genBody.match(/parts\.push\([^)]*\)/g) || []).join(' '));
check('2  SLEEP-1 (the rule): the engine may mention sleep only if it reads it',
  !claimsSleep || readsSleep,
  `reads sleepQuality: ${readsSleep}, mentions sleep in coach copy: ${claimsSleep}`);

// The question is still ASKED and still STORED. Removing the claim must
// not quietly remove the data with it — that would be a second decision
// smuggled inside the first.
const checkinData = fs.readFileSync(path.join(root, 'js/data/checkin.js'), 'utf8');
check('3  the answer is still stored — the claim went, the data did not',
  /sleepHours:\s*data\.sleepHours/.test(checkinData) &&
  /sleepQuality:\s*data\.sleepQuality/.test(checkinData));

const checkinView = fs.readFileSync(path.join(root, 'js/views/checkin.js'), 'utf8');
check('4  and the full check-in still asks',
  /_showSleepPanel\(\)/.test(strip(checkinView)));

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
store.init();

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

const rows = [...el.querySelectorAll('[data-section]')];
check('5  the Settings landing offers four rows, not three',
  rows.length === 4, rows.map(r => r.dataset.section).join(', '));

// Exact label, not a substring. A reversal that renamed it "Your
// Coachingx" passed the substring version -- a weak assertion that
// happened to be true rather than one that tested the thing.
const coachingRow = rows.find(r => r.dataset.section === 'coaching');
const coachingLabel = coachingRow?.querySelector('.settings-index__label')?.textContent.trim();
check('6  COACH-TILE: "Your Coaching" is one of them',
  coachingLabel === 'Your Coaching', coachingLabel || 'row missing');

// Click it, and read what a person would see.
coachingRow?.click();
const flat = el.textContent.replace(/\s+/g, ' ').trim();

check('7  and it holds all three sections that were buried in Profile',
  /What your body can do today/.test(flat) &&
  /How you like things/.test(flat) &&
  /Your reflection/.test(flat),
  'capability, preferences, reflection');

check('8  the save buttons came with them — a moved panel that cannot save is worse than a buried one',
  !!el.querySelector('[data-action="save-capability"]') &&
  !!el.querySelector('[data-action="save-preferences"]'));

// The inverse: Profile must not still render them, or they exist twice
// and two Save buttons write the same fields from two screens.
SettingsMod.SettingsView(router).mount(el);
[...el.querySelectorAll('[data-section]')].find(r => r.dataset.section === 'settings')?.click();
const settingsFlat = el.textContent.replace(/\s+/g, ' ').trim();
check('9  COACH-TILE (inverse): Profile no longer renders them too',
  !/What your body can do today/.test(settingsFlat));

check('10 but Profile keeps what is genuinely a fact about you',
  /Your profile/.test(settingsFlat));

console.log(failures === 0
  ? `\nAll 10 checks green.`
  : `\n${failures} FAILED.`);
process.exit(failures === 0 ? 0 : 1);
