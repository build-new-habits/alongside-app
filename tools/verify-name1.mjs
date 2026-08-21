/**
 * tools/verify-name1.mjs
 * 21 Aug 2026 v2
 * GATE-PATH. Path resolution only -- no assertion changed.
 *
 * 18 Aug 2026 v1
 *
 * NAME-1. The paid tier is "the Plan".
 *
 * The risk this guards is not that the rename was done wrong today. It
 * is that it half-reverts later — one view rewritten from an old draft,
 * one string copied from a stale doc — and the product ends up saying
 * "Plan" on the badge and "Personal" on the heading beside it. A tier
 * with two names is worse than either name.
 *
 * So the load-bearing assertion is #1, and it is an ABSENCE: no
 * user-facing string anywhere in js/ says "Personal" as a tier. It
 * sweeps every file rather than the ones changed today, because the
 * next instance will arrive in a file nobody is looking at.
 *
 * Comments are excluded deliberately — the history of the decision is
 * worth keeping and is not shown to anybody. Three genuine non-tier
 * uses are excluded by name, listed below, so the sweep cannot be
 * quietly widened to make a real failure disappear.
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

// Real, unrelated uses of the word. Not tier names, must not be renamed.
//   personalBests / showPersonalBests — a store field and its toggle
//   "Personal best"                   — a lifting term, in coach copy
//   "Personal Capacity"               — a noticing theme, not a tier
const ALLOWED = /personalBests|showPersonalBests|Personal best|Personal Capacity/;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.name.endsWith('.js')) out.push(full);
  }
  return out;
}

// Strip block comments, line comments and HTML comments — the decision
// history stays, and only what a person could read is asserted on.
// Trailing comments matter too: the first run of this gate flagged
// `import ... // PB-1: Personal tier` as user-facing copy, which it is
// not. Stripped conservatively — `//` only when preceded by whitespace
// and NOT by a colon, so URLs like https:// survive intact. A stricter
// parser is not worth it for a sweep whose failures are read by a human.
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

const jsRoot  = new URL('../js/', import.meta.url).pathname;
const offenders = [];
for (const file of walk(jsRoot)) {
  const lines = stripComments(fs.readFileSync(file, 'utf8')).split('\n');
  lines.forEach((line, i) => {
    if (!/Personal/.test(line)) return;
    if (ALLOWED.test(line)) return;
    offenders.push(`${path.relative(jsRoot, file)}:${i + 1}`);
  });
}

check('1  NAME-1 (the sweep): no user-facing string in js/ says "Personal"',
  offenders.length === 0,
  offenders.join(', '));

// ── The badge itself ─────────────────────────────────────────────────

const dom = new JSDOM('<!doctype html><div id="main-content"></div>',
  { url: 'https://build-new-habits.github.io/alongside-app/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true, writable: true });
Object.defineProperty(globalThis, 'localStorage', { value: dom.window.localStorage, configurable: true, writable: true });

const { lockedFeature } = await import(new URL('../js/auth.js', import.meta.url).href);

const el = document.getElementById('main-content');
el.innerHTML = lockedFeature('<p>anything</p>', 'personal', 'Some feature');

const badge = el.querySelector('.locked-badge-label');
check('2  the badge reads "Plan"', badge && badge.textContent.trim() === 'Plan',
  badge ? badge.textContent.trim() : 'no badge rendered');

const wrap = el.querySelector('.locked-feature-wrap');
const label = wrap ? wrap.getAttribute('aria-label') : '';
check('3  and a screen reader is told the same thing, not a different one',
  /part of the Plan/.test(label) && !/Personal/.test(label), label);
check('4  the context is still announced — the badge alone says nothing useful',
  /Some feature/.test(label), label);

// ── The one place a tier name legitimately belongs ───────────────────

const upgradeSrc = fs.readFileSync(new URL('../js/views/upgrade.js', import.meta.url), 'utf8');
check('5  the pricing page names the tier — this is where a name earns its place',
  /the Plan|a Plan|The Plan/.test(stripComments(upgradeSrc)));

// ── One tier, one label (ATHLETE-RETIRE, 18 Aug 2026) ────────────────
//
// This used to assert that "athlete" still rendered "Athlete", on the
// reasoning that renaming a tier with no surface would be inventing a
// name for nothing. Graeme retired the tier the same day, so the
// assertion inverts: whatever is passed, the badge says Plan. There is
// one paid tier and it has one name.

el.innerHTML = lockedFeature('<p>x</p>', 'athlete', '');
check('6  a retired tier name cannot leak back through the badge',
  el.querySelector('.locked-badge-label')?.textContent.trim() === 'Plan',
  el.querySelector('.locked-badge-label')?.textContent.trim());

console.log(failures === 0
  ? `\nAll 6 checks green.`
  : `\n${failures} FAILED.`);
process.exit(failures === 0 ? 0 : 1);
