/**
 * tools/verify-write1.mjs
 * 22 Aug 2026 v2
 * WEIGHT-1a, 22 Aug 2026. `weightTracking` added — declared dark, writer
 * lands with WEIGHT-1b. Dated promise, not permission. See the note at
 * the entry.
 *
 * CHOOSER-1. `targetDate` added to the baseline. Its only writer,
 * goalSetupSaveWeightTargetDate() in onboarding/goal-setup.js, was
 * retired with that view -- and the view had never loaded, so the writer
 * was already unreachable. The field is now MIGRATION-ONLY: store.js
 * reads it once, one way, to carry historic installs into
 * strategicGoal.targetDate (TARGET-4). That is a legitimate permanent
 * one-ended field, not a gap.
 *
 * NOTE: this gate went red on exactly the change that caused it, which
 * is the behaviour it was built for. The baseline is being updated with
 * a reason, not to silence it.
 *
 * 17 Aug 2026 v1
 *
 * WRITE-1. Every store field should have both ends.
 *
 * THREE reader/writer mismatches surfaced in one week, each found by
 * accident while chasing something else:
 *
 *   proposalBias         a reader and a clearer, no writer, for 12 days
 *   weekPlan             a writer, no reader
 *   sessionSequence      a writer, no reader
 *   weekFocus, programme declared with neither until CHAP-1 built them
 *
 * Nothing was looking for them. verify-contract.mjs checks that declared
 * VALUES are reachable; it never asks whether a field is connected at
 * all. So a field could be read for ever while nothing wrote it, and the
 * suite stayed green.
 *
 * WHAT THIS GATE DOES, AND WHAT IT DELIBERATELY DOES NOT
 *
 * It does NOT demand every field be connected today. Forty of 101 are
 * currently one-ended, and many are legitimate -- settings a person may
 * never touch, fields written only through a helper this scan cannot
 * see, or genuinely dormant features. Failing on all of them would make
 * the gate noise, and a noisy gate gets muted.
 *
 * It pins the CURRENT SET and fails when it GROWS. A new one-ended field
 * is a new instance of a fault class that has already cost this project
 * a fortnight of silent breakage. Shrinking is always allowed, and the
 * gate tells you to update the baseline when you fix one.
 *
 * The detection is deliberately generous -- a field counts as connected
 * on any plausible read or write, including through store helpers -- so
 * that a false ALARM is unlikely. It will miss some real mismatches.
 * That is the right direction for the error: this gate exists to stop
 * the set growing, not to be the last word on any one field.
 */
import fs from 'node:fs';
import path from 'node:path';

let failures = 0;
const check = (n, ok, d = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`);
  if (!ok) failures++;
};

const storeSrc = fs.readFileSync('js/store.js', 'utf8');
const defStart = storeSrc.indexOf('\n  getDefaults() {');
const block    = defStart < 0 ? '' : storeSrc.slice(defStart);
const iReturn  = block.indexOf('return {');
const iClose   = iReturn < 0 ? -1 : block.indexOf('\n    };', iReturn);
const body     = (iReturn >= 0 && iClose > iReturn) ? block.slice(iReturn, iClose) : '';
const fields   = [...body.matchAll(/^      ([a-zA-Z][\w]*)\s*:/gm)].map(m => m[1]);

// Same self-check schema-check.mjs learned the hard way: an extraction
// that silently returns nothing must fail loudly, not pass quietly.
check('the field list was actually extracted', fields.length >= 50,
  `${fields.length} top-level fields`);

let all = '';
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.js')) all += fs.readFileSync(p, 'utf8');
  }
})('js');
// Comments stripped, so a changelog entry naming a dead field cannot
// vouch for it. This is exactly how four gates vouched for
// coach-reflection.js while nobody could reach it.
all = all.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const oneEnded = [];
for (const k of fields) {
  const read  = new RegExp(`get\\(['"]${k}(?:['"]|\\.)|\\b${k}\\s*:\\s*saved\\.${k}`).test(all);
  const write = new RegExp(`set\\(['"]${k}(?:['"]|\\.)|data\\.${k}\\s*=|user\\.${k}\\s*=`).test(all);
  if (!(read && write)) oneEnded.push(k);
}

// Baseline recorded 17 Aug 2026. Update it DOWNWARD as fields are
// connected or removed. If you are updating it upward, stop: that is
// the thing this gate exists to prevent.
const BASELINE = new Set([
  // WEIGHT-1b, 22 Aug 2026. 'weight' and 'weightUnit' REMOVED -- both
  // now have writers in settings.js, so the baseline was overstating
  // the debt. This gate caught that itself, which is the direction that
  // matters: an allowlist that only ever grows is permission, not a
  // record.
  'hormonalTracking','coachStyle','targetWeight','targetDescription',
  // weightTracking — DECLARED DARK 22 Aug 2026 (WEIGHT-1a). The opt-in
  // for weight tracking. No writer until WEIGHT-1b builds the Settings
  // toggle; goal-review.js consumes it as a context argument, which this
  // scan correctly does not count as a store read.
  //
  // This gate caught it on the first run after the field was added,
  // which is the gate working exactly as built. The entry is a DATED
  // PROMISE, not permission: WEIGHT-1b removes it. If this line is still
  // here once 1b has shipped, the field is an orphan and the baseline is
  // lying.
  // 'weightTracking' -- CORRECTED 22 Aug. When this was added the note
  // called it a dated promise: "WEIGHT-1b removes it." That promise was
  // unkeepable, and the real reason is different and permanent.
  //
  // It IS written -- the Settings toggle writes it -- but through the
  // generic [data-toggle] handler, as store.set(field, next) where field
  // comes from a data attribute. A literal scan cannot see that, and
  // never will. 'hormonalTracking' sits in this list for exactly the
  // same reason.
  //
  // So this entry is not debt awaiting payment. It is a limit of what a
  // text scan can prove about a dynamic write, and it stays.
  'weightTracking',
  // targetDate — MIGRATION-ONLY as of 22 Aug 2026 (CHOOSER-1). Read by
  // store.js's one-way TARGET-4 migration for historic installs; its
  // writer was retired with onboarding/goal-setup.js, which had never
  // loaded. Do NOT connect a new writer: dated targets now belong to
  // strategicGoal, and R2-a makes them Plan-only.
  'targetDate',
  'trainingIntent','exerciseClearance','lifestyle','gymProgrammeWeek','liftLogEnabled',
  'mindfulPromptFrequency','speechRate','checkInNotification','noticingWeekInCycle',
  'journalSettings','waterReminderEnabled','lastWaterReminder','community',
  'liftLog','personalBests','updatedAt',
  // weekFocus removed 17 Aug: CHAP-1 step 4 connected it. This is the
  // gate working as intended — the baseline shrinks as fields are fixed,
  // and it insists on being pruned rather than drifting out of date.
  'onboardingStep','age','sessionMode','mindfulPromptDepth','proposalBias',
  'activityPreferences','noticingPreferences','noticingProgress','safeguarding',
  'weeklyReview','weightLog','waterLog','waterSettings','coachOffers','unwellMode',
  'foodPrompts','practiceHistory'
]);

const added = oneEnded.filter(k => !BASELINE.has(k));
const fixed = [...BASELINE].filter(k => !oneEnded.includes(k));

check('no NEW one-ended store field', added.length === 0,
  added.length
    ? `${added.join(', ')} — read without a writer, or written without a reader. proposalBias looked exactly like this for twelve days.`
    : `${oneEnded.length} known, none new`);

check('the baseline is still accurate', fixed.length === 0,
  fixed.length
    ? `${fixed.join(', ')} now connected — remove from BASELINE in this file`
    : 'nothing to prune');

// proposalBias is retired and should stay gone. It is in the baseline
// only because the field is still DECLARED in getDefaults(); the reader
// and the clearer were both removed with BIAS-2.
check('proposalBias has no reader and no writer',
  !/get\(['"]proposalBias|set\(['"]proposalBias/.test(all),
  'BIAS-2 retired it; the bias is derived by coachBias() now');

console.log(failures === 0 ? '\nALL PASS\n' : `\n${failures} FAILURE(S)\n`);
process.exit(failures === 0 ? 0 : 1);
