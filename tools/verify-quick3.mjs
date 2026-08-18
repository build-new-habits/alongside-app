/**
 * tools/verify-quick3.mjs
 * 18 Aug 2026 v1
 *
 * QUICK-3 — the brief check-in asked about sleep and then skipped it.
 * A11Y-LOCK — every locked surface dimmed its own text below AA.
 *
 * Two different fault shapes, one gate, because they share a cause:
 * both are a change that removed something and left what was attached
 * to it behind. QUICK-1 removed the sleep step and left the line that
 * introduces it. The locked-feature wrapper reached for opacity to dim
 * chrome and dimmed the words too.
 *
 * A11Y-LOCK is COMPUTED, not asserted by eye. #5 composites the actual
 * token values at the actual opacity and does the WCAG 1.4.3 sum. That
 * is the only version of this check that could have caught the
 * original, because every locked surface looked deliberately styled.
 *
 * QUICK-3's bridge lines live inside a closure and cannot be called
 * from here, so #1–#3 are source assertions — stated plainly rather
 * than dressed up as execution. What they can still do is prove the
 * brief branch exists, is reached before any sleep line, and contains
 * no question the path then fails to ask.
 *
 * Every assertion was reversal-tested.
 */
import fs from 'node:fs';

let failures = 0;
const check = (n, ok, d = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`);
  if (!ok) failures++;
};

const checkinSrc = fs.readFileSync(new URL('../js/views/checkin.js', import.meta.url), 'utf8');
const cssSrc     = fs.readFileSync(new URL('../css/components/tier-gating.css', import.meta.url), 'utf8');

// ── QUICK-3 ──────────────────────────────────────────────────────────

const bridge = checkinSrc.match(/function _moodBridge\(mood\)\s*\{([\s\S]*?)\n  \}/);
check('1  _moodBridge() exists and is readable',
  !!bridge);

const body = bridge ? bridge[1] : '';
const briefBranch = body.match(/if \(_briefPath\(\)\)\s*\{([\s\S]*?)\n    \}/);
check('2  it branches on _briefPath() before any sleep line',
  !!briefBranch && body.indexOf('_briefPath()') < body.indexOf('sleep'));

check('3  QUICK-3 (the actual fault): the brief lines ask nothing about sleep',
  !!briefBranch && !/sleep|last night/i.test(briefBranch[1]),
  briefBranch ? briefBranch[1].replace(/\s+/g, ' ').trim().slice(0, 90) : '');

check('4  the full path still asks — this removed a mismatch, not a question',
  /How did you sleep\?/.test(body) && /how was last night\?/.test(body));

// The missing beat. The full path's pause is the sleep panel's own
// confirm button; the brief path had none, so the coach's question and
// the panel answering it arrived together.
check('5  the brief path pauses between the coach question and the panel',
  /_PANEL_BEAT_MS/.test(checkinSrc) &&
  /await new Promise\(r => setTimeout\(r, REDUCED_MOTION \? 0 : _PANEL_BEAT_MS\)\);\s*\n\s*_showConditionsPanel\(\);/.test(checkinSrc));

check('6  and that pause is zero under prefers-reduced-motion',
  /REDUCED_MOTION \? 0 : _PANEL_BEAT_MS/.test(checkinSrc));

// ── A11Y-LOCK, computed ──────────────────────────────────────────────

const varsSrc = fs.readFileSync(new URL('../css/base/variables.css', import.meta.url), 'utf8');
const token = (name) => {
  const m = varsSrc.match(new RegExp(`${name}:\\s*(#[0-9A-Fa-f]{6})`));
  return m ? m[1] : null;
};
const hex = (h) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const composite = (fg, bg, alpha) => fg.map((f, i) => Math.round(alpha * f + (1 - alpha) * bg[i]));

const fg = hex(token('--color-text-secondary'));
const bg = hex(token('--color-bg-card'));

const opacityMatch = cssSrc.match(/\.locked-feature-wrap\s*\{[^}]*opacity:\s*([\d.]+)/);
const alpha = opacityMatch ? parseFloat(opacityMatch[1]) : 1;
const effective = alpha < 1 ? ratio(composite(fg, bg, alpha), bg) : ratio(fg, bg);

check('7  A11Y-LOCK: locked text clears WCAG 2.2 AA (1.4.3, 4.5:1)',
  effective >= 4.5,
  `--color-text-secondary on --color-bg-card at opacity ${alpha}: ${effective.toFixed(2)}:1`);

check('8  A11Y-LOCK (inverse): the wrapper sets no opacity at all',
  !opacityMatch,
  'state must not be encoded in reduced legibility');

check('9  locked state is still visually distinct without dimming',
  /\.locked-feature-wrap\s*\{[^}]*border:\s*1px dashed/.test(cssSrc));

check('10 and it survives forced-colors, where a background tint does not',
  /@media \(forced-colors: active\)[\s\S]*\.locked-feature-wrap/.test(cssSrc));

// SWEEP-1, 18 Aug 2026. Was a {0,160} window between the selector and
// the declaration -- my own, written the same morning I found the same
// fault in two other gates. Asserted against the rule BLOCK now, which
// is the unit CSS actually has.
{
  const i = cssSrc.indexOf('.locked-feature-inner > p:first-child');
  const block = i === -1 ? '' : cssSrc.slice(i, cssSrc.indexOf('}', i) + 1);
  check('11 A11Y-LOCK: the badge no longer sits on top of leading text',
    i !== -1 && /padding-right/.test(block),
    i === -1 ? 'the first-child rule is gone entirely' : '');
}

check('12 A11Y-LOCK: the locked box does not sit hard against its own text',
  /\.locked-feature-wrap\s*\{[^}]*padding:/.test(cssSrc),
  'a border with no breathing room reads as trapping the content');

console.log(failures === 0
  ? `\nAll 12 checks green.`
  : `\n${failures} FAILED.`);
process.exit(failures === 0 ? 0 : 1);
