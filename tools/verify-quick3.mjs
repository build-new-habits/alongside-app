/**
 * tools/verify-quick3.mjs
 * 08 Sep 2026 v2
 *
 * v2 - CHECKIN-3. Assertions 2 and 4 follow the sleep question to
 *   _sleepBridge(). QUICK-3 fixed the BRIEF path's copy on 18 Aug and
 *   left the FULL path's three lines still asking about sleep while the
 *   feeling word panel opened next -- the same mismatch, one path over,
 *   which this gate could not see because it only ever asked whether the
 *   words existed in the file. 4b and 4c are new and are the invariant
 *   it was always reaching for.
 *
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
// CHECKIN-3, 08 Sep 2026. _moodBridge() no longer contains a sleep line
// at all -- on either path -- so "branches before any sleep line" is now
// trivially true here and the real question is whether the brief branch
// still comes first. Kept as the ordering check it was written to be.
check('2  it branches on _briefPath() before its own full-path lines',
  !!briefBranch && body.indexOf('_briefPath()') < body.lastIndexOf('return'));

check('3  QUICK-3 (the actual fault): the brief lines ask nothing about sleep',
  !!briefBranch && !/sleep|last night/i.test(briefBranch[1]),
  briefBranch ? briefBranch[1].replace(/\s+/g, ' ').trim().slice(0, 90) : '');

// CHECKIN-3, 08 Sep 2026. The sleep question MOVED; it was not dropped.
// It lived in _moodBridge(), which on the full path opened the FEELING
// WORD panel next -- so the coach asked about sleep and then asked
// something else, and the sleep panel arrived in silence afterwards. The
// three lines are unchanged, in _sleepBridge(), on the transition that
// actually opens the sleep panel.
//
// This assertion follows them, and is stricter than it was: it is no
// longer enough for the words to exist SOMEWHERE in the file. They must
// be reached from both exits of the feeling word panel, which is the
// invariant "this removed a mismatch, not a question" was always after.
const sleepBridge = checkinSrc.match(/function _sleepBridge\(mood\)\s*\{([\s\S]*?)\n  \}/);
check('4  the sleep question still exists — this moved it, it did not drop it',
  !!sleepBridge &&
  /How did you sleep\?/.test(sleepBridge[1]) &&
  /how was last night\?/i.test(sleepBridge[1]));

check('4b and it is asked on BOTH exits of the feeling word panel',
  (checkinSrc.match(/_showCoachBubble\(_sleepBridge\(/g) || []).length === 2,
  'skip and confirm both open the sleep panel; a line on one of them is ' +
  'GUIDED-COPY, which fixed one branch of a card and left the other');

check('4c and _moodBridge no longer names a panel that does not come next',
  !/sleep|last night/i.test(body),
  'the coach asks about sleep and the feeling word panel opens');

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
