/**
 * tools/verify-athlete-retire.mjs
 * 18 Aug 2026 v1
 *
 * ATHLETE-RETIRE. The tier is gone, and nobody lost anything.
 *
 * Removing a tier is easy. The dangerous half is the saved data: on
 * 18 Aug, `store.js` read `tier: saved.tier || 'free'` with NO
 * validation, so the moment "athlete" stopped counting as paid, anybody
 * holding it would have silently dropped to free — losing the Plan,
 * their second impact credit, and their export, with nothing on screen
 * to explain it. Graeme's own device could hold it: the dev switcher
 * wrote that value and nothing else ever did.
 *
 * So the load-bearing assertions are #1 and #2, and they EXECUTE the
 * real store against real saved data. A source check would confirm the
 * migration line exists. Only running it confirms somebody keeps what
 * they had.
 *
 * #6 is the one that catches the slow version of this failure: not the
 * tier coming back, but a comparison against it lingering somewhere and
 * quietly evaluating false forever.
 *
 * Every assertion was reversal-tested.
 */
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from '/home/claude/node_modules/jsdom/lib/api.js';

const dom = new JSDOM('<!doctype html><div id="main-content"></div>',
  { url: 'https://build-new-habits.github.io/alongside-app/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true, writable: true });
Object.defineProperty(globalThis, 'localStorage', { value: dom.window.localStorage, configurable: true, writable: true });

const BASE = new URL('../js/', import.meta.url).href;
const { store } = await import(BASE + 'store.js');
const { isPremium } = await import(BASE + 'auth.js');

let failures = 0;
const check = (n, ok, d = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`);
  if (!ok) failures++;
};

// ── The migration, against real saved data ───────────────────────────

// Write a pre-retirement save exactly as a device would hold it, then
// load it the way the app does. Not a synthetic object handed to a
// helper — the actual persisted shape through the actual read path.
// SEED NOTE. The first run of this gate wrote to 'alongside_data' and
// every tier came back free -- including 'personal', which is what gave
// it away. store.init() had found nothing and defaulted. The real key is
// store.STORAGE_KEY ('alongside_user'), read from the store rather than
// typed here so this cannot rot if the key ever changes.
//
// Check 3 passed throughout that first run, because free is the default
// and a broken seed produces the right answer for the wrong reason. That
// is the seed fault in its most dangerous form: a green result.
const seed = (tier) => {
  localStorage.clear();
  localStorage.setItem(store.STORAGE_KEY, JSON.stringify({ tier }));
  store.init();
};

seed('athlete');

check('1  ATHLETE-RETIRE: a saved "athlete" loads as "personal", not free',
  store.get('tier') === 'personal', `got "${store.get('tier')}"`);

check('2  and that person is still paid — the Plan is not taken away',
  isPremium() === true);

// The migration must be ONE WAY and must not touch anybody else.
seed('free');
check('3  a free user is untouched',
  store.get('tier') === 'free' && isPremium() === false);

seed('personal');
check('4  a paying user is untouched',
  store.get('tier') === 'personal' && isPremium() === true);

localStorage.clear();
store.init();
check('5  and a brand new install still starts free',
  store.get('tier') === 'free');

// ── Nothing still branches on it ─────────────────────────────────────

const root = new URL('../', import.meta.url).pathname;
const strip = s => s
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '')
  .replace(/(^|[^:])\/\/.*$/gm, '$1')
  .replace(/<!--[\s\S]*?-->/g, '');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.name.endsWith('.js')) out.push(full);
  }
  return out;
}

// "athletes" appears legitimately in exercise copy — box breathing is
// used by athletes, elite athletes warm up this way. Matched as a tier
// VALUE only: quoted, singular, lowercase.
const offenders = [];
for (const file of walk(path.join(root, 'js'))) {
  const rel = path.relative(root, file);
  const src = strip(fs.readFileSync(file, 'utf8'));
  // store.js holds the migration and is the one place allowed to name it.
  if (rel === 'js/store.js') continue;
  if (rel === 'js/data/field-contract.js') continue;
  if (/["']athlete["']/.test(src)) offenders.push(rel);
}
check('6  no live code outside the migration still branches on "athlete"',
  offenders.length === 0, offenders.join(', '));

const auth = strip(fs.readFileSync(path.join(root, 'js/auth.js'), 'utf8'));
check('7  isAthlete() is gone — a predicate nothing asked, for a state nothing granted',
  !/function isAthlete/.test(auth));

const settings = strip(fs.readFileSync(path.join(root, 'js/views/settings.js'), 'utf8'));
check('8  the dev tier switcher has no way back into it',
  !/data-dev-tier="athlete"/.test(settings));

// ── The contract records it rather than forgetting it ────────────────

const contract = fs.readFileSync(path.join(root, 'js/data/field-contract.js'), 'utf8');
check('9  the contract still DECLARES it retired, so the migration stays legible',
  /retired:\s*\[[^\]]*["']athlete["']/.test(contract),
  'a retired value that is not declared becomes an untracked special case');

const schema = fs.readFileSync(path.join(root, 'Documents/Live State/Schema.md'), 'utf8');
check('10 and the schema says what happens to somebody who held it',
  /ATHLETE-RETIRE/.test(schema) && /migrat/i.test(schema));

console.log(failures === 0
  ? `\nAll 10 checks green.`
  : `\n${failures} FAILED.`);
process.exit(failures === 0 ? 0 : 1);
