/**
 * data/field-contract.js
 * 14 Aug 2026 v2
 *
 * v2 - W3-A / W3-D. Capability writers repointed from the unreachable
 *   views/onboarding/lifestyle.js to thread.js steps 9a-9d, and
 *   lifestyle.activityLevel gains 'returning', which has been written
 *   since 11 Aug and read by three call sites. Two gaps in the gate
 *   itself logged as CONTRACT-2 (writer existence is not reachability)
 *   and CONTRACT-3 (lookup-table keys are invisible to the scan).
 *
 * 13 Aug 2026 v1
 *
 * ONE DECLARED VOCABULARY PER FIELD, AND WHAT IT MEANS.
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────
 *
 * Every significant defect found on 13 Aug 2026 was one class of fault
 * wearing different clothes: a field's meaning drifting from its use.
 * Thirty-seven gates catch thirty-seven instances. None of them catches
 * the class. This does.
 *
 * The forms it took, all in one day:
 *
 *   PRESENT BUT WRONG      All 94 rehabilitation entries carried
 *                          difficultyLevel: 1. That defeated
 *                          _difficulty()'s safe default, which only
 *                          fires when the field is ABSENT. Difficulty
 *                          is the capability ceiling, so a beginner met
 *                          an assisted Nordic curl in session one.
 *
 *   OVER-INTERPRETED       needsSeated fired on floorAccess === 'no'
 *                          and restricted selection to seated only. Not
 *                          being able to get DOWN to the floor is not
 *                          the same as not being able to STAND UP. A
 *                          76-year-old's pool collapsed to seven
 *                          exercises. Separately, bothFeet === 'no' --
 *                          a statement about IMPACT -- was read as
 *                          needing a chair.
 *
 *   VOCABULARY MISMATCH    A persona carried fitnessLevel: 'beginner'.
 *                          DIFFICULTY_CEILINGS is keyed on activityLevel
 *                          words, so 'beginner' fell through to the
 *                          moderate ceiling of 4. Plausible, wrong, and
 *                          invisible.
 *
 *   WRITTEN, NEVER READ    proposalBias. The coach decided somebody
 *                          needed a lighter session after severe pain,
 *                          wrote it down, and nothing looked.
 *
 *   READ, NEVER WRITTEN    fitnessLevel, after the onboarding rebuild.
 *
 *   OVERWRITTEN BEFORE USE _filterCandidates() replaces `category` with
 *                          the SESSION category. The first C2 filter
 *                          tested ex.category === 'rehabilitation', ran
 *                          on every candidate, and excluded NOTHING
 *                          while reading as completely correct.
 *
 * Every one of them looked right. Several were written by somebody
 * fixing another instance of the same thing on the same day.
 *
 * ── HOW TO USE IT ───────────────────────────────────────────────────
 *
 * Add a field here when it has a FIXED set of permitted values. Free
 * text, numbers and timestamps do not belong. Then:
 *
 *   - tools/verify-contract.mjs asserts every literal compared against
 *     a contracted field is a declared value, across all of js/
 *   - and asserts every declared value is actually produced by a writer,
 *     so a dead option cannot sit in a table pretending to be reachable
 *
 * `meaning` is not decoration. Three defects on 13 Aug came from reading
 * a field as a broader statement than it makes, so the contract records
 * what each answer DOES and DOES NOT say. If a gate you are writing
 * needs a meaning not written here, the honest move is to collect that
 * answer rather than infer it from a neighbouring one.
 *
 * Vocabularies below were extracted from the live writers on 13 Aug
 * 2026, not from documentation and not from memory.
 */

export const FIELD_CONTRACT = {

  // ── Identity. Writer: views/onboarding/about.js ───────────────────
  // AGE-1, 14 Aug 2026. This entry declared the bands of
  // views/onboarding/about.js -- an orphaned pre-thread view, now deleted
  // -- while the LIVE writer wrote 'under-20'|'20s'|'30s'. Two
  // vocabularies, and settings.js made a third by writing labels. The
  // contract described the one nobody used.
  //
  // CONTRACT-2 did not catch it: about.js was imported by name.js and
  // body.js, which were themselves orphaned. Reachability was checked as
  // "referenced by something", and an orphaned CLUSTER satisfies that.
  // Now traced to a router-registered entry point instead.
  "ageBand": {
    values: ["18-24", "25-34", "35-44", "45-54", "55-64", "65-74", "75plus", "prefer-not", null],
    writer: "views/onboarding/thread.js (step 6, AGE_CHIPS)",
    meaning: "Age band. Lowest is 18 because the product is 18+ — there is deliberately no under-18 option. Selects who gets ASKED the chair and floor questions; it never decides what anyone can do. 'prefer-not' is a real answer and reaches the capability questions by the other three triggers."
  },
  "gender": {
    // TWO WRITERS THAT DISAGREE, found by this gate on its first run.
    // Onboarding offers female | male | non-binary | prefer-not.
    // Settings offers those plus "other" (Other / self-describe).
    // Harmless today because gender only feeds hormonal tracking, but it
    // is the drift class exactly: the same field, two vocabularies, and
    // nothing anywhere noticing. Recorded rather than silently
    // normalised — which of the two is right is Graeme's call.
    values: ["female", "male", "non-binary", "other", "prefer-not", null],
    writer: "views/settings.js",  // AGE-1: about.js deleted, was orphaned,
    meaning: "Optional. Used for hormonal tracking only. Must NOT gate exercise selection — a pelvic-floor squat reaching a male user was a selection fault, not a gender one."
  },

  // ── Lifestyle. Writer: views/onboarding/lifestyle.js ──────────────
  "lifestyle.activityLevel": {
    // W3-D, 14 Aug 2026: 'returning' was missing. ACTIVITY_CHIPS has
    // written it since 11 Aug and all three readers handle it --
    // filterByFitnessLevel (ceiling 6), DIFFICULTY_CEILINGS (3) and
    // LOW_IMPACT_ONLY (gated). The gate did not catch it because it
    // scans string COMPARISONS (=== "x") and these are object KEYS and
    // Set members. Lookup-table keys are a vocabulary use the gate
    // cannot currently see. Logged as CONTRACT-3.
    values: ["sedentary", "light", "returning", "moderate", "active", "very-active"],
    writer: "views/onboarding/thread.js (step 9, ACTIVITY_CHIPS)",
    meaning: "How much the person moves in ordinary life. Keys DIFFICULTY_CEILINGS in session-builder.js — so a value outside this list silently falls through to the 'moderate' ceiling of 4."
  },
  "fitnessLevel": {
    values: ["sedentary", "light", "moderate", "active", "very-active"],
    writer: "views/settings.js:1746",
    meaning: "Written from activityLevel and shares its vocabulary. NOT 'beginner'/'intermediate'/'advanced' — those read plausibly and fall through to the moderate ceiling."
  },
  // RETIRED 14 Aug 2026 (OPEN-1). lifestyle.exerciseHistory had exactly
  // one writer, the deleted views/onboarding/lifestyle.js, and exactly one
  // reader, checkin-openings.js's return-to-fitness trigger -- which could
  // never fire anyway because `else if (ageBand)` sat above it. The reader
  // now uses lifestyle.activityLevel === 'returning', which the live
  // onboarding thread writes and which means the same thing.
  //
  // Removed from the contract rather than left with a dead writer: a
  // contract entry for a field nothing writes and nothing reads is exactly
  // the "table that looks complete and is not" this file exists to stop.
  // The field itself stays in store.js defaults, marked RETIRED, so
  // existing localStorage is not disturbed.
  // Live writer and live reader as of 14 Aug 2026 (OPEN-1). Before that it
  // had a reader and no writer, so the 'injury-recovery' day-one opening
  // had no input -- on top of being unreachable in the trigger chain.
  // W3-B, 14 Aug 2026. Had no writer at all until step 9f: every user was
  // the 'improve' default and both other branches of intentPriority() in
  // session-builder.js were unreachable.
  // CARDIAC-1, 14 Aug 2026.
  "exerciseClearance": {
    values: ["cleared", "not-yet", "not-sure", null],
    writer: "views/onboarding/thread.js (step 8a, CLEARANCE_CHIPS)",
    meaning: "Whether a professional has said unsupervised exercise is okay. null means NOT ASKED and must never be read as 'not-yet' — most people are never asked. Gates LOADED STRENGTH only; mobility, walking, breathing and bodyweight stay open at every value."
  },

  "trainingIntent": {
    values: ["improve", "maintain", "recover"],
    writer: "views/onboarding/thread.js (step 9f, INTENT_CHIPS)",
    meaning: "What the person is aiming at. 'maintain' PRIORITISES carries, grip, balance and floor transfer — it does not mean doing less. Never inferred from age or activity level; the person says."
  },

  "lifestyle.returningAfter": {
    values: ["injury", "illness", "life", "burnout", null],
    writer: "views/onboarding/thread.js (step 9e, RETURNING_AFTER_CHIPS)",
    meaning: "What the person is coming back from, asked only when they said 'returning'. Selects a day-one coach opening. Not a diagnosis and never shown back to them as one."
  },

  "lifestyle.stressLevel": {
    // W3-A, 14 Aug 2026. Corrected on three counts, all found when
    // deleting lifestyle.js removed the writer exclusion that hid them.
    //
    // 1. VOCABULARY. The live writer is step 10 of the onboarding
    //    thread, which writes ENERGY_CHIPS ids. It has never written
    //    low/moderate/high/very-high. The old declaration described a
    //    screen that no longer exists.
    // 2. MEANING. It does NOT feed burnout detection. detectBurnout()
    //    reads checkinHistory and has never read this field.
    // 3. NO READER -- RESOLVED 14 Aug 2026 (WRITE-1). Step 10 asks a
    //    careful question and the answer went nowhere. It now seeds
    //    coldStartBias(), which softens the first sessions for somebody
    //    who arrived exhausted and switches itself off the moment three
    //    real check-ins exist.
    values: ["exhausted", "running-low", "up-and-down", "decent", "pretty-good"],
    writer: "views/onboarding/thread.js (step 10, ENERGY_CHIPS)",
    meaning: "Self-reported energy at onboarding. Read ONLY by coldStartBias() in data/checkin.js, and only until three check-ins exist — it can soften a session, never harden one, and is never reported as burnout. Not a clinical measure and must never be treated as one."
  },
  // RETIRED 14 Aug 2026 (OPEN-1). lifestyle.sleepQuality had one writer,
  // the deleted lifestyle.js, and NO reader -- views/checkin.js has its
  // own per-day sleepQuality on the check-in object, which is a different
  // field that merely shares a leaf name. Nothing consulted the onboarding
  // one. Retired in store.js defaults.

  // ── Capability. Writer: views/onboarding/thread.js, steps 9a-9d ───
  //
  // W3-A, 14 Aug 2026. Was views/onboarding/lifestyle.js:524, which is
  // not registered in router.js and whose only inbound navigate() calls
  // sheet-manager.js swallows. The contract named a writer that could
  // not run, so capability.askedAt was null for every live user and six
  // protective branches in session-builder.js were dead.
  //
  // Direction 2 of verify-contract.mjs checks a writer EXISTS IN SOURCE,
  // not that it is REACHABLE. That gap is what hid this. Logged as
  // CONTRACT-2.
  //
  // capability.bothFeet is deliberately not written at onboarding -- the
  // impact gate already works from lifestyle.activityLevel alone
  // (measured 14 Aug: active 35 impact exercises, sedentary 0, with
  // capability unasked). Settings remains its writer.
  //
  // Each answer means EXACTLY what it asks and nothing wider. Two of the
  // three worst defects of 13 Aug came from ignoring that.
  "capability.chairRise": {
    values: ["yes", "not-easily", "no", null],
    writer: "views/onboarding/thread.js:_writeStepValue (steps 9a-9d)",
    meaning: "Can they stand up from a chair without using their hands. ONLY 'no' means seated-only work. 'not-easily' means standing work with support — not a chair sentence."
  },
  "capability.floorAccess": {
    values: ["yes", "not-comfortably", "rather-not", "no", null],
    writer: "views/onboarding/thread.js:_writeStepValue (steps 9a-9d)",
    meaning: "Can they get DOWN to the floor and back up. Says NOTHING about whether they can stand. Handled by floorSafe, which removes floor-position exercises — it must not feed needsSeated (CAP-7)."
  },
  "capability.bothFeet": {
    values: ["yes", "no", null],
    writer: "views/onboarding/thread.js:_writeStepValue (steps 9a-9d)",
    meaning: "Can both feet leave the ground at once — i.e. IMPACT. Says nothing about standing, balance or needing a chair. Handled by the impact gate alone (CAP-6b)."
  },
  "capability.balanceWorry": {
    values: ["no", "sometimes", "yes", null],
    writer: "views/onboarding/thread.js:_writeStepValue (steps 9a-9d)",
    meaning: "Worry about falling. Removes balance-demanding exercises. Not a statement about strength."
  },
  "capability.legPower": {
    values: ["full", "limited", "none", null],
    writer: "views/onboarding/thread.js:_writeStepValue (step 9c)",
    meaning: "How much the legs can drive. NOT 'yes'/'no' — those read plausibly and make legsLoadable false, which makes a fully capable person read as restricted. Declining stores null, not a sentinel — 'skip' exists only in the UI layer and is converted at the writer."
  },

  // ── Session shaping ───────────────────────────────────────────────
  "sessionVariety": {
    values: ["familiar", "balanced", "varied"],
    writer: "views/checkin.js:793",
    meaning: "Repetition across sessions — do you want what you did last time. MUST be asked, never inferred from behaviour. Distinct from sessionPreset."
  },
  "sessionPreset": {
    values: ["balanced", "strength", "mobility"],
    writer: "views/session-builder-ui.js",
    meaning: "How one session's time splits between warm-up, work and cool-down. The SHAPE of a session, a standing preference. Distinct from sessionVariety."
  },
  // W3-B, 14 Aug 2026: a second, vaguer trainingIntent entry sat here
  // declaring writer "views/onboarding, views/settings.js" -- neither a
  // real path. A duplicate key in an object literal is legal JS and the
  // last one silently wins, so the contract had two answers and the gate
  // only ever saw one. The live entry is above, with the capability
  // fields. Nothing writes trainingIntent in settings.js today; if that
  // changes, add it to the entry above rather than making a second.
  "tier": {
    values: ["free", "personal", "athlete"],
    writer: "views/upgrade.js, views/settings.js dev panel",
    meaning: "Subscription tier. The field is `tier` — NOT `userTier`, which had no writer and whose reader always evaluated false, locking paid options for paying users."
  },

  // ── Exercise entries. js/data/exercises/*.js ──────────────────────
  "exercise.position": {
    values: ["standing", "seated", "floor", "any"],
    writer: "js/data/exercises/*.js",
    meaning: "The position the exercise is performed in. 'any' is NOT 'standing' — a check counting 'any' as standing passed while the bug it guarded was live."
  },
  // NOTE ON THE LEAF NAME. This is contracted as `exercise.category`
  // and the gate matches on the leaf `category`, which also names the
  // SESSION category local inside _filterCandidates(). That collision is
  // not incidental — it is the exact confusion that made the first C2
  // filter exclude nothing. The gate exempts the session-category
  // comparisons explicitly rather than loosening the rule, so the
  // collision stays visible.
  "exercise.category": {
    values: ["strength", "cardio", "mobility", "recovery", "rehabilitation", "mindfulness"],
    writer: "js/data/exercises/*.js",
    meaning: "The library an entry belongs to. OVERWRITTEN by _filterCandidates() with the SESSION category before any filter sees it — read `sourceLibrary` inside that function, never `category`."
  },
  "exercise.rehabPhase": {
    values: ["acute", "subacute", "maintenance"],
    writer: "js/data/exercises/rehabilitation.js",
    meaning: "Stage of a rehabilitation protocol. Does NOT indicate general-purpose suitability — that is generalPurpose, decided per entry."
  }
};

/** Fields whose vocabulary is fixed and therefore checkable. */
export const CONTRACTED_FIELDS = Object.keys(FIELD_CONTRACT);

/** True if `value` is permitted for `field`. */
export function isValid(field, value) {
  const c = FIELD_CONTRACT[field];
  return c ? c.values.includes(value) : true;
}
