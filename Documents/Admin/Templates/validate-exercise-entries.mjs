/**
 * validate-exercise-entries.mjs
 * 11 Aug 2026 v1
 *
 * Build-time audit of every entry in js/data/exercises/ against the
 * Exercise Entry Standard (Documents/Live State/exercise_entry_standard.md).
 *
 * NOT runtime code. Not loaded by the app, not cached by sw.js. Run it after
 * any authoring session and before any deploy that touches exercise content.
 *
 * Usage, from the repo root:
 *     node "Documents/Admin/Templates/validate-exercise-entries.mjs"
 *     node "Documents/Admin/Templates/validate-exercise-entries.mjs" --verbose
 *
 * Exit code 0 if no errors, 1 if any. Warnings never fail the run — they
 * flag entries that are valid but thin.
 *
 * Why this exists: the mismatch that made 92 exercises unreachable, and the
 * four private pools authored to three different shapes, both survived
 * because nothing ever checked. A standard nobody can verify is a suggestion.
 */

import { EXERCISES } from "../../../js/data/exercises/index.js";
import { assertVocabularyCoverage } from "../../../js/data/equipment-map.js";

const verbose = process.argv.includes("--verbose");

// ── Standard ──────────────────────────────────────────────────────────────

const REQUIRED_ALWAYS = [
  "id", "name", "category",
  "instructions", "why", "coaching", "watchOut", "youtube"
];

// `contentType` is deliberately NOT required.
//
// The first run of this validator reported 93 entries missing it. Checking
// before acting on that: contentType is written on 368 entries and read by
// nothing, anywhere in the codebase. `category` is the field the engines
// actually select on (session-builder.js:830, 878, 1017; workout.js:194).
//
// Requiring contentType would have meant authoring a dead field onto 93
// entries. Logged as a finding instead — same writer-without-reader pattern
// already on record for proposalBias. Resolution is a separate decision:
// retire it, or wire it up.
const DEAD_FIELDS_LOGGED = ["contentType"];

// Fields required only where the exercise is loaded.
const REQUIRED_IF_LOADED = ["load", "sets", "reps"];

// An entry counts as loaded if it needs equipment that a weight is chosen for.
const LOADED_TAGS = new Set([
  "dumbbell", "kettlebell", "barbell", "medicine-ball", "gym-membership"
]);

// Retired fields — present only on legacy entries, folded in during porting.
const RETIRED = ["description", "cues", "setup", "whyThis", "videoUrl", "cue"];

// Phrasings that breach the load rule: an absolute number rather than effort.
const ABSOLUTE_LOAD = /\b\d+\s?(kg|kgs|kilo|kilos|lb|lbs|pound|pounds)\b/i;

// Language the Nurturing voice does not use.
const BANNED_VOICE = [
  /\bnever\s+(ever|do)\b/i,
  /\bdangerous\b/i,
  /\byou will injure\b/i,
  /\bwarning\b/i,
  /\bstreak\b/i,
  /\bdon'?t be\b/i
];

// ── Checks ────────────────────────────────────────────────────────────────

const errors = [];
const warnings = [];

const isLoaded = ex =>
  (ex.equipment || []).some(tag => LOADED_TAGS.has(tag));

const missing = v =>
  v === undefined || v === null || v === "" ||
  (Array.isArray(v) && v.length === 0);

for (const ex of EXERCISES) {
  const where = `${ex.id || "(no id)"} — ${ex.name || "(no name)"}`;

  for (const field of REQUIRED_ALWAYS) {
    if (missing(ex[field])) errors.push([where, `missing ${field}`]);
  }

  if (isLoaded(ex)) {
    for (const field of REQUIRED_IF_LOADED) {
      if (missing(ex[field])) errors.push([where, `loaded exercise missing ${field}`]);
    }
  }

  if (typeof ex.load === "string" && ABSOLUTE_LOAD.test(ex.load)) {
    errors.push([where, `load prescribes an absolute weight — effort only (P4)`]);
  }

  for (const field of RETIRED) {
    if (!missing(ex[field])) {
      warnings.push([where, `carries retired field "${field}" — fold into instructions/coaching`]);
    }
  }

  if (Array.isArray(ex.instructions)) {
    if (ex.instructions.length < 3) {
      warnings.push([where, `only ${ex.instructions.length} instruction steps — standard is 3-6`]);
    }
    if (ex.instructions.length > 6) {
      warnings.push([where, `${ex.instructions.length} instruction steps — standard is 3-6`]);
    }
  }

  if (Array.isArray(ex.watchOut)) {
    if (ex.watchOut.length < 2) {
      warnings.push([where, `only ${ex.watchOut.length} watchOut items — standard is 2-4`]);
    }
    if (ex.watchOut.length > 4) {
      warnings.push([where, `${ex.watchOut.length} watchOut items — standard is 2-4`]);
    }
  }

  const prose = [ex.why, ex.coaching, ex.load, ...(ex.watchOut || [])]
    .filter(v => typeof v === "string").join(" ");
  for (const pattern of BANNED_VOICE) {
    if (pattern.test(prose)) {
      warnings.push([where, `voice check: matches ${pattern}`]);
    }
  }

  if (typeof ex.youtube === "string" && /^https?:/i.test(ex.youtube)) {
    errors.push([where, `youtube is a URL — must be a search term`]);
  }
}

// Duplicate ids would silently break selection and completion tracking.
const seen = new Map();
for (const ex of EXERCISES) {
  if (!ex.id) continue;
  seen.set(ex.id, (seen.get(ex.id) || 0) + 1);
}
for (const [id, count] of seen) {
  if (count > 1) errors.push([id, `duplicate id, appears ${count} times`]);
}

// Equipment vocabulary drift — the failure that hid 92 exercises.
for (const field of DEAD_FIELDS_LOGGED) {
  const n = EXERCISES.filter(ex => ex[field] !== undefined).length;
  if (n > 0 && n < EXERCISES.length) {
    warnings.push(["(schema)", `"${field}" present on ${n}/${EXERCISES.length} entries and read nowhere — retire or wire up`]);
  }
}

const uncoverable = assertVocabularyCoverage(EXERCISES);
for (const tag of uncoverable) {
  errors.push(["(vocabulary)", `tag "${tag}" cannot be satisfied by any equipment.js id`]);
}

// ── Report ────────────────────────────────────────────────────────────────

const byField = {};
for (const [, reason] of errors) {
  byField[reason] = (byField[reason] || 0) + 1;
}

console.log(`\nExercise Entry Standard — audit of ${EXERCISES.length} entries\n`);

console.log(`Errors:   ${errors.length}`);
console.log(`Warnings: ${warnings.length}\n`);

if (errors.length) {
  console.log("Errors by reason:");
  Object.entries(byField)
    .sort((a, b) => b[1] - a[1])
    .forEach(([reason, n]) => console.log(`  ${String(n).padStart(5)}  ${reason}`));
  console.log("");
}

if (verbose) {
  if (errors.length) {
    console.log("--- every error ---");
    errors.forEach(([where, reason]) => console.log(`  ${where}: ${reason}`));
    console.log("");
  }
  if (warnings.length) {
    console.log("--- every warning ---");
    warnings.forEach(([where, reason]) => console.log(`  ${where}: ${reason}`));
    console.log("");
  }
} else if (errors.length || warnings.length) {
  console.log("Run with --verbose for the full list.\n");
}

process.exit(errors.length ? 1 : 0);
