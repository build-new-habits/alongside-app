/**
 * tools/verify-price.mjs
 * 18 Aug 2026 v1
 *
 * PRICE-2. One price, everywhere.
 *
 * This exists because the price has been wrong in a readable place
 * twice, and both times the wrong figure was in a document that looked
 * authoritative:
 *
 *   13 Aug — a schedule entry claimed the website published £9.99/£89.
 *     It did not. The claim came from a March-era file read as if it
 *     were live, and WEB-PRICE was raised against a fault that did not
 *     exist.
 *   18 Aug — the product-family overview in project knowledge still
 *     publishes £9.99/£89. It is exactly the document a session reaches
 *     for when it wants a summary.
 *
 * So the risk is not that today's figures are wrong. It is that a
 * stale figure somewhere readable gets quoted as current, and the app
 * and the paperwork drift apart without anything going red.
 *
 * TRUTH lives in js/views/upgrade.js's constants. Everything else in
 * the repo must agree with it or be explicitly banded as superseded.
 *
 * Archive/ and Past MS/ are excluded by design: they are the historical
 * record and are SUPPOSED to hold old prices. Excluding them is what
 * makes the rest of the sweep meaningful.
 *
 * Every assertion was reversal-tested.
 */
import fs from 'node:fs';
import path from 'node:path';

let failures = 0;
const check = (n, ok, d = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`);
  if (!ok) failures++;
};

const root = new URL('../', import.meta.url).pathname;
// PRICE-3, 18 Aug 2026. Truth moved out of the view into
// js/data/pricing.js, so the number exists once in the app rather than
// once per screen that mentions it. This gate follows the truth.
const priceSrc   = fs.readFileSync(path.join(root, 'js/data/pricing.js'), 'utf8');
const upgradeSrc = fs.readFileSync(path.join(root, 'js/views/upgrade.js'), 'utf8');

// ── 1. The source of truth is a single pair of constants ─────────────

const monthly = priceSrc.match(/export const PRICE_MONTHLY\s*=\s*"\\u00A3([\d.]+)"/);
const annual  = priceSrc.match(/export const PRICE_ANNUAL\s*=\s*"\\u00A3([\d.]+)"/);

check('1  the app declares both prices as constants, in ONE module',
  !!monthly && !!annual,
  monthly && annual ? `£${monthly[1]} / £${annual[1]}` : 'one or both missing');

if (!monthly || !annual) {
  console.log('\n1 FAILED.');
  process.exit(1);
}
const MONTHLY = monthly[1];
const ANNUAL  = annual[1];

check('2  and states them exactly once each — a duplicated price goes wrong in one place',
  (priceSrc.match(/PRICE_MONTHLY\s*=/g) || []).length === 1 &&
  (priceSrc.match(/PRICE_ANNUAL\s*=/g) || []).length === 1);

// ── 2. No retired figure survives anywhere current ───────────────────

// Figures that are dead EVERYWHERE. Deliberately not exhaustive:
// £49.99 is not on this list, because it is still the live Community
// organisation Year 2 rate. A sweep that flagged it would be red for a
// correct document, and a gate that is red for correct reasons stops
// being read. The consumer annual price is asserted directly instead,
// at check 4.
const RETIRED = ['9.99', '89', '4.99']
  .filter(p => p !== MONTHLY && p !== ANNUAL);

const EXCLUDED = ['Archive', 'Past MS', 'node_modules', '.git'];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDED.includes(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (/\.(js|md|html|docx)$/.test(e.name)) out.push(full);
  }
  return out;
}

// Only figures written as money. A bare "89" is a line number as often
// as it is a price; "£89" is unambiguous.
const hits = [];
const superseded = [];
for (const file of walk(root)) {
  const rel = path.relative(root, file);
  // The gate names the retired prices itself, and the schedule is the
  // record of why they were retired. Neither is a place a price is
  // published to a person.
  if (rel === 'tools/verify-price.mjs') continue;
  if (rel === 'Documents/Admin/master_schedule.md') continue;
  // A file may declare itself superseded and be excused -- but it has to
  // SAY SO, in a banner a person reading it would see. That is the whole
  // mechanism: the sweep does not care whether a price is old, only
  // whether an old price is presented as current. Kept deliberately
  // narrow: this exact string, not a fuzzy match, so it cannot become a
  // way to silence the gate by accident.
  const raw = fs.readFileSync(file, 'utf8');
  if (raw.includes('SUPERSEDED PRICING')) { superseded.push(rel); continue; }
  // Comments explaining WHY a price was retired are not published
  // prices. Stripping them is what lets the reasoning stay in the file
  // without the gate shouting about its own explanation -- the same
  // fault caught in verify-is2.mjs earlier today, where an assertion
  // matched the comment describing the fix.
  const src = fs.readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*(\/\/|\*).*$/gm, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  for (const p of RETIRED) {
    const re = new RegExp(`(£|\\\\u00A3|&pound;)\\s?${p.replace('.', '\\.')}\\b`);
    if (re.test(src)) hits.push(`${rel} (£${p})`);
  }
}

// PRICE-3 (the inverse). No view may declare its own. This is the
// assertion that stops the duplicate coming back: settings.js typed the
// number for weeks and only a price CHANGE revealed it.
const declarers = walk(path.join(root, 'js'))
  .filter(f => !f.endsWith('data/pricing.js'))
  .filter(f => /const PRICE_(MONTHLY|ANNUAL)\s*=/.test(fs.readFileSync(f, 'utf8')))
  .map(f => path.relative(root, f));
check('2b no view declares its own price constant',
  declarers.length === 0, declarers.join(', '));

check('3  PRICE-2 (the sweep): no retired price is published anywhere current',
  hits.length === 0,
  hits.join(', '));
if (superseded.length) {
  console.log(`      (excused, banded SUPERSEDED PRICING: ${superseded.join(', ')})`);
}

// ── 3. The pages a person actually reads ─────────────────────────────

check('4  the Plan page imports the price rather than typing it',
  /from ["']\.\.\/data\/pricing\.js["']/.test(upgradeSrc) &&
  /PRICE_ANNUAL/.test(upgradeSrc),
  `live annual is £${ANNUAL}`);

const upgradeBody = upgradeSrc
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');
check('5  nothing on the Plan page promises the rate expires',
  !/holds until|ANNUAL_LIMIT\s*=/.test(upgradeBody),
  'Year 2 is deferred to Year 2 — an expiry date the product cannot honour is worse than none');

// ── 4. The pair ──────────────────────────────────────────────────────
//
// REVERSAL FINDING, same session. Reverting settings.js to £49.99 went
// UNDETECTED by check 3, because £49.99 had just been removed from the
// retired list for being the live Community org rate. So the sweep could
// not catch the exact regression it had found ten minutes earlier.
//
// The property that actually holds: wherever the monthly price is
// quoted as money next to an annual figure, that annual figure must be
// the live one. A community-org rate is never written beside £7.99.
const pairHits = [];
for (const file of walk(root)) {
  const rel = path.relative(root, file);
  if (rel === 'tools/verify-price.mjs') continue;
  if (rel === 'Documents/Admin/master_schedule.md') continue;
  const raw = fs.readFileSync(file, 'utf8');
  if (raw.includes('SUPERSEDED PRICING')) continue;
  const src = raw
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*(\/\/|\*).*$/gm, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  const money = `(?:£|\\\\u00A3|&pound;)`;
  // The window must MENTION a year. Without that the pattern matched
  // "| Monthly @ £7.99 | 267 user-months | £7.76 |" in the pricing
  // model's projection table, where £7.76 is net revenue per user, not
  // an annual price -- a false positive on a correct document, which is
  // how a gate stops being read.
  const re = new RegExp(
    `${money}\\s?${MONTHLY.replace('.', '\\.')}[^\\n]{0,60}?${money}\\s?([\\d.]+)[^\\n]{0,20}`, 'g');
  let m;
  while ((m = re.exec(src)) !== null) {
    if (!/year/i.test(m[0])) continue;
    if (m[1] !== ANNUAL) pairHits.push(`${rel} (£${MONTHLY} beside £${m[1]})`);
  }
}
check('6  PRICE-2 (the pair): every monthly-and-annual quote uses the live annual',
  pairHits.length === 0,
  pairHits.join(', '));

console.log(failures === 0
  ? `\nAll checks green. Live: £${MONTHLY}/month, £${ANNUAL}/year.`
  : `\n${failures} FAILED.`);
process.exit(failures === 0 ? 0 : 1);
