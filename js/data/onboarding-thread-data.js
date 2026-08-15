/**
 * js/data/onboarding-thread-data.js
 * 14 Aug 2026 v9
 *
 * v9 - AGE-1 (18+ bands, one vocabulary) and CARDIAC-1 (step 8a exercise
 *   clearance). See the block comments on AGE_CHIPS and step 8a.
 *
 * 14 Aug 2026 v8
 *
 * v8 - W3-B. Step 9f writes trainingIntent, which had no writer at all --
 *   every user was 'improve' and both the 'maintain' and 'recover'
 *   branches of session-builder.js were unreachable. Asked of everyone.
 *
 * 14 Aug 2026 v7
 *
 * v7 - OPEN-1. Step 9e writes lifestyle.returningAfter, which
 *   checkin-openings.js reads and nothing wrote. Shown only when the
 *   activity answer was 'returning'.
 *
 * 14 Aug 2026 v6
 *
 * v6 - W3-A. Capability steps 9a-9d. The CAP-1 questions moved here from
 *   the unreachable views/onboarding/lifestyle.js. balanceWorry asked of
 *   everyone and gating chairRise/floorAccess; legPower conditional on
 *   chairRise; bothFeet deliberately not asked. New step property showIf.
 *   See the block comment above step 9a for the persona reasoning.
 *
 * 14 Aug 2026 v5
 *
 * v5 - W2-4. Step 8 comment corrected: conditions store IDs, not names.
 *   Comment only, no behaviour change.
 *
 * 29 Jun 2026 v4
  *
 * v4 — generateSummary('equipment', ...) corrected to match what
 *   equipment.js (confirmed against real source) actually writes — no
 *   facility name is ever stored, only the combined equipment[] list.
 *   Previous version required value.facility to be truthy or it
 *   incorrectly reported "I'll decide later." even when the user had
 *   genuinely selected equipment.
 *
 * v3 — Added Step 2b: a single-chip "Ready to get started?" pacing beat
 *   between the name response and Hard Before. Step 2 was advancing
 *   straight into 3a with zero pause — this also caused the past-step
 *   fade to look wrong, since there was no genuine step boundary for it
 *   to land in. Step 2's coach message split in two: the immediate
 *   response stays on Step 2, the settings reassurance line moved to 2b
 *   alongside the readiness check. STEP_ORDER updated to include '2b'.
 *
 * v2 — Post-QA revision: Step 4 reworked from a single auto-revealing
 *   block into a consent-gated config (gateText, gateYesLabel,
 *   gateNoLabel, declineCoach, continueLabel — see STEPS[4]). Step 3b
 *   coach copy updated to the locked "take your time" wording.
 *
 * OB-THREAD content file. All coach lines, step configuration, chip labels,
 * summary bubble generators, and the Hard Before short phrase map.
 *
 * Imported by js/views/onboarding/thread.js.
 * No UI logic in this file. Data only.
 *
 * Structure:
 *   HARD_BEFORE_CHIPS       — seven territory chips + skip option
 *   HARD_BEFORE_PHRASE_MAP  — territory ID → short plain-English phrase
 *                             (used in user summary bubbles)
 *   AGE_CHIPS               — age band options
 *   ACTIVITY_CHIPS          — activity level options
 *   ENERGY_CHIPS            — energy level options
 *   FREQUENCY_CHIPS         — sessions-per-week options
 *   STEPS                   — full step config, Steps 0–14
 *   generateSummary()       — summary bubble text for each sheet step
 *   FALLBACK_REFLECTION     — Beat 3 fallback for "I'd rather not say"
 */

// ─────────────────────────────────────────────────────────────────────────────
// HARD BEFORE — chips and phrase map
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Seven territory chips for Step 3a multi-select.
 * id matches territory IDs used throughout beat3-scripts.js and store.js.
 * label is what appears on the chip in the UI.
 */
export const HARD_BEFORE_CHIPS = [
  { id: 'trust-rupture',     label: 'I started things and they let me down' },
  { id: 'escalation-trap',   label: 'It moved too fast, too soon' },
  { id: 'life-interruption', label: 'Life kept getting in the way' },
  { id: 'wrong-fit',         label: "It just wasn't built for someone like me" },
  { id: 'invisible-person',  label: "I never felt like it knew I was there" },
  { id: 'body-story',        label: 'My relationship with my body made it complicated' },
  { id: 'the-history',       label: "There's a longer history than any of that" },
];

/**
 * Maps territory ID → short plain-English phrase for user summary bubbles.
 * Used by generateSummary('hardBefore', ...) and generateSummary('primaryTerritory', ...).
 * Spec source: alongside_onboarding_conversation_script_28jun2026_v3.docx
 */
export const HARD_BEFORE_PHRASE_MAP = {
  'trust-rupture':     'Trust was broken',
  'escalation-trap':   'It moved too fast',
  'life-interruption': 'Life got in the way',
  'wrong-fit':         "It wasn't built for me",
  'invisible-person':  'I never felt seen',
  'body-story':        'My relationship with my body',
  'the-history':       'A longer history than that',
};

// ─────────────────────────────────────────────────────────────────────────────
// INLINE CHIP SETS
// ─────────────────────────────────────────────────────────────────────────────

/** Step 6 — age bands. Single select. */
// ── Capability chips (W3-A, 14 Aug 2026) ────────────────────────────────────
// Vocabulary copied verbatim from views/onboarding/lifestyle.js, which was
// the declared writer in field-contract.js. Changing any of these strings
// changes what capabilityProfile() derives -- 'not-easily' and 'rather-not'
// are load-bearing, not cosmetic.

// Three points, not two. store.js documents 'no' | 'sometimes' | 'yes'
// and field-contract.js declares all three. balanceSafe is currently true
// only for 'no' or null, so 'sometimes' and 'yes' behave identically today
// -- but collapsing them would make a declared value unproducible and
// throw away a distinction the schema is holding open.
// Vocabulary from store.js:1090 — 'injury'|'illness'|'life'|'burnout'.
export const RETURNING_AFTER_CHIPS = [
  { id: 'injury',  label: 'An injury'          },
  { id: 'illness', label: 'Illness'            },
  { id: 'life',    label: 'Life got in the way' },
  { id: 'burnout', label: 'Burnout'            },
];

// W3-B, 14 Aug 2026. store.js:1050 declares improve|maintain|recover and
// session-builder.js tilts main-section selection on it -- 'maintain'
// prioritises carries, grip, balance, sit-to-stand and floor transfer,
// the capacities that decide whether somebody keeps living in their own
// home. It had NO WRITER anywhere, so every user was 'improve' and that
// entire branch was unreachable, as was 'recover'.
//
// Labels carry the meaning rather than the word. "Maintain" reads as
// settling to somebody who does not think of themselves as declining, and
// as a euphemism to somebody who does. What the option actually does is
// hold on to specific capacities, so that is what it says.
export const INTENT_CHIPS = [
  { id: 'improve',  label: 'Build something — get stronger or fitter' },
  { id: 'maintain', label: 'Hold on to what I have'                   },
  { id: 'recover',  label: 'Come back from something'                 },
];

// CARDIAC-1, 14 Aug 2026. See step 8a.
export const CLEARANCE_CHIPS = [
  { id: 'cleared',   label: "Yes — I've been told it's fine"  },
  { id: 'not-yet',   label: "No, not yet"                      },
  { id: 'not-sure',  label: "I'm not sure"                     },
];

export const BALANCE_CHIPS = [
  { id: 'no',        label: 'No, not really' },
  { id: 'sometimes', label: 'Sometimes'      },
  { id: 'yes',       label: 'Yes'            },
];

export const CHAIR_RISE_CHIPS = [
  { id: 'yes',        label: 'Yes'        },
  { id: 'not-easily', label: 'Not easily' },
  { id: 'no',         label: 'No'         },
];

export const FLOOR_ACCESS_CHIPS = [
  { id: 'yes',             label: 'Yes'                 },
  { id: 'not-comfortably', label: 'Not comfortably'     },
  { id: 'rather-not',      label: "I'd rather not try"  },
  { id: 'no',              label: 'No'                  },
];

// 'skip' is a UI answer, not a capability value. thread.js converts it to
// null at the writer -- see _writeStepValue(). Writing the string "skip"
// would be truthy and match none of full/limited/none, so legsLoadable
// would be false but legsUsable TRUE by accident, defeating the fail-safe.
export const LEG_POWER_CHIPS = [
  { id: 'full',    label: 'Yes'                      },
  { id: 'limited', label: 'A little, or on good days' },
  { id: 'none',    label: 'No'                       },
  { id: 'skip',    label: "I'd rather not say"       },
];

/**
 * Does the chair/floor pair apply to this person? (W3-A)
 *
 * OR, deliberately, not AND. Any single trigger is enough. Somebody who
 * says they do not worry about balance is still caught by age or activity
 * level, and somebody young and active who DOES worry is caught by their
 * own answer -- which is the case no demographic trigger would find.
 *
 * MOBILITY_RELEVANT_CONDITIONS is the set where the chair/floor answer
 * could plausibly differ from "obviously yes". It is not a list of
 * "serious" conditions and must not become one.
 */
// CARDIAC-1. Conditions where "have you been cleared to exercise alone?"
// is a question worth asking. Deliberately NOT a list of "serious"
// conditions -- a stiff shoulder does not belong here and neither does a
// managed condition that has nothing to do with exertion. The test is
// whether an unsupervised progressive load could plausibly be the wrong
// thing without someone having said otherwise.
const CLEARANCE_RELEVANT_CONDITIONS = new Set([
  'cardiovascular-condition', 'breathing', 'osteoporosis',
  'chronic-fatigue', 'fibromyalgia', 'pelvic-floor',
]);

const MOBILITY_RELEVANT_CONDITIONS = new Set([
  'hip', 'knee', 'ankle-foot', 'lower-back', 'sciatica', 'osteoporosis',
  'hypermobility', 'fibromyalgia', 'chronic-fatigue', 'cardiovascular-condition',
  'calves', 'achilles', 'plantar-fasciitis', 'it-band', 'shin-splints',
]);

// AGE-1. Was ['60s','70plus']. Set at 65 rather than 55: a fit
// 62-year-old should not be asked whether they can get out of a chair,
// and if they have any reason to be asked -- a knee, a worry about
// balance, a sedentary answer -- the other three triggers catch them.
const CAPABILITY_TRIGGER_AGE_BANDS   = new Set(['65-74', '75plus']);
const CAPABILITY_TRIGGER_ACTIVITY    = new Set(['sedentary', 'returning']);

export function _capabilityQuestionsApply(storeData) {
  const d = storeData || {};
  const bw = (d.capability || {}).balanceWorry;
  if (bw === 'yes' || bw === 'sometimes') return true;
  if (CAPABILITY_TRIGGER_AGE_BANDS.has(d.ageBand)) return true;
  if (CAPABILITY_TRIGGER_ACTIVITY.has((d.lifestyle || {}).activityLevel)) return true;
  return (d.conditions || []).some(id => MOBILITY_RELEVANT_CONDITIONS.has(id));
}

// AGE-1, 14 Aug 2026. Rebanded, for three reasons at once.
//
// 1. THE PRODUCT IS 18+. 'Under 20' could not tell a 15-year-old from a
//    19-year-old, so the onboarding did not assert the position the Terms
//    are going to claim. The lowest band now starts at 18.
// 2. THERE WERE THREE VOCABULARIES. These chips wrote 'under-20'|'20s'|...
//    field-contract.js declared 'under-18'|'18-24'|... (the retired
//    about.js's bands), and settings.js wrote the LABELS -- 'Under 20',
//    '70+' -- as values, so editing your age in Settings stored a string
//    nothing matched and silently dropped you out of the capability age
//    trigger. One vocabulary now, defined here, imported everywhere.
// 3. '75plus' not '75+'. The '+' is a regex metacharacter and an
//    unescaped one already made a live band report as unreachable on
//    verify-contract.mjs's own first run.
//
// 'prefer-not' is kept deliberately. Somebody who will not give an age
// still gets asked about balance, conditions and activity, so the
// capability questions still reach them by the other three triggers.
export const AGE_CHIPS = [
  { id: '18-24',      label: '18 - 24'           },
  { id: '25-34',      label: '25 - 34'           },
  { id: '35-44',      label: '35 - 44'           },
  { id: '45-54',      label: '45 - 54'           },
  { id: '55-64',      label: '55 - 64'           },
  { id: '65-74',      label: '65 - 74'           },
  { id: '75plus',     label: '75 and over'       },
  { id: 'prefer-not', label: 'Prefer not to say' },
];

/** Step 9 — activity level. Single select. */
export const ACTIVITY_CHIPS = [
  { id: 'sedentary',         label: 'Mostly sitting' },
  { id: 'light',             label: 'A little walking' },
  { id: 'moderate',          label: 'Active a few times a week' },
  { id: 'active',            label: 'Regularly training' },
  { id: 'returning',         label: 'Coming back after a break' },
];

/** Step 10 — energy level. Single select. */
export const ENERGY_CHIPS = [
  { id: 'exhausted',    label: 'Exhausted' },
  { id: 'running-low',  label: 'Running on empty' },
  { id: 'up-and-down',  label: 'Up and down' },
  { id: 'decent',       label: 'Decent' },
  { id: 'pretty-good',  label: 'Pretty good' },
];

/** Step 12 — session frequency. Single select. */
export const FREQUENCY_CHIPS = [
  { id: '1',    label: 'Once a week' },
  { id: '2',    label: 'Twice a week' },
  { id: '3',    label: '3 times' },
  { id: '4',    label: '4 times' },
  { id: '5plus',label: '5 or more' },
];

// ─────────────────────────────────────────────────────────────────────────────
// BEAT 3 FALLBACK REFLECTION
// Used when user tapped "I'd rather not say" in Step 3a.
// Five parts, same sequential reveal as territory scripts in beat3-scripts.js.
// ─────────────────────────────────────────────────────────────────────────────

export const FALLBACK_REFLECTION = [
  "That's completely fine — and I mean that. You don't owe me an explanation of anything that happened before today.",
  "What I do know is that you're here. And that's not nothing — actually, for a lot of people, getting to this point is the hardest part.",
  "What I can tell you is what I'm going to try to do differently. I'm going to pay attention. Not just to what you tell me, but to how things are going — the days when it's easy and the ones when it really isn't.",
  "I'm not going to disappear when life gets complicated. And I'm not going to make you feel like a failure for being human.",
  "You don't have to tell me what happened before. Just give me a chance to do things differently."
];

// ─────────────────────────────────────────────────────────────────────────────
// STEP CONFIGURATION
// Each step object contains everything thread.js needs to render that step.
//
// Properties:
//   id          — unique step identifier
//   type        — 'coach-only' | 'inline-text' | 'inline-chips-multi' |
//                 'inline-chips-single' | 'inline-chips-primary' |
//                 'sheet' | 'closing'
//   coach       — coach message string, or array of strings (sequential reveal)
//   coachAfter  — object { answered, skipped } for steps with optional input
//                 omitted for steps with no branching
//   chips       — chip array reference (inline chip steps only)
//   skipLabel   — label for skip option (omitted if step is not skippable)
//   skipRoutes  — { to: stepId } — where skip goes (if different from next step)
//   sheetView   — name of the view module to mount in the sheet (sheet steps only)
//   storeField  — dot-path string for where the step's answer is written in store
//   summaryType — key passed to generateSummary() to build the user bubble text
// ─────────────────────────────────────────────────────────────────────────────

export const STEPS = {

  // ── Step 0 — Wordmark splash ─────────────────────────────────────────────
  // Not part of the thread. Handled separately in thread.js as a pre-thread moment.
  // Duration: 1500ms. No interaction. Alongside wordmark fades in then out.
  0: {
    id: 0,
    type: 'splash',
    durationMs: 1500,
  },

  // ── Step 1 — Coach opens ─────────────────────────────────────────────────
  // No user input. Coach message appears after typing indicator.
  // Writes onboarding.threadStartedAt to store.
  1: {
    id: 1,
    type: 'coach-only',
    coach: "Hey. I'm your Alongside coach — and my job, in the simplest terms I can put it, is to help you move. Not just your body, although that's part of it. But the whole thing — body, mind, how you're feeling, what's going on in your life. All of it. Because I think that's the only way any of this actually works.\n\nBefore we do anything else — what can I call you?",
    writesTo: 'onboarding.threadStartedAt',
  },

  // ── Step 2 — Name entry ──────────────────────────────────────────────────
  // Inline text input. Single field. Sends on enter or send button.
  // Writes store.name.
  2: {
    id: 2,
    type: 'inline-text',
    placeholder: 'Your first name',
    storeField: 'name',
    summaryType: 'name',
    coach: "[Name]. Right. Good to meet you.\n\nSo — everything I'm going to ask you over the next little while, the reason I need it is so that what I build for you is actually built for you. Not something generic. Not something I'd give to anyone who walked in. Yours.",
    // coach line above renders after name is submitted, with [Name] replaced.
  },

  // ── Step 2b — Settings reassurance + readiness check ──────────────────────
  // No text input. A single light-touch interaction before the conversation
  // moves into Hard Before — the moment that was missing in the v2 build,
  // where Step 2 advanced straight into Step 3a with no pause at all.
  // This also gives the past-step fade (applied in _showCoachBubble) a real
  // gap to land in, instead of firing mid-typing-indicator for the next
  // message because the steps ran back to back.
  '2b': {
    id: '2b',
    type: 'inline-chips-single',
    storeField: null, // no data written — this is a pacing beat, not a question
    summaryType: null,
    coach: "Oh — and if anything changes, or you want to come back and add something you skipped, it'll all be in your settings. Nothing is locked in forever.\n\nReady to get started?",
    chips: [
      { id: 'ready', label: "Yes, let's go" },
    ],
    // Single chip, not a real choice — the point is the tap itself, the
    // pause it creates, and the chance for the user to actually read what
    // came before it. coachAfter intentionally omitted: 3a's own coach
    // message follows immediately, no extra acknowledgement needed.
  },

  // ── Step 3a — Hard Before (multi-select) ─────────────────────────────────
  // Inline chip tray. Multi-select, no maximum.
  // Skip option: "I'd rather not say" — routes to Step 5, skipping 3b and 4.
  // On confirm: writes onboarding.hardBeforeSelections[] and
  //             onboarding.hardBeforeShownAt to store.
  // Then advances to Step 3b.
  '3a': {
    id: '3a',
    type: 'inline-chips-multi',
    chips: HARD_BEFORE_CHIPS,
    skipLabel: "I'd rather not say",
    skipRoutes: { to: 5 },
    storeField: 'onboarding.hardBeforeSelections',
    summaryType: 'hardBefore',
    writesAlso: 'onboarding.hardBeforeShownAt',
    coach: "Before we get into the detail of all of this — I want to ask you something that I think matters more than any of the other questions I'm going to ask.\n\nMost people who find their way here have tried something before. A different app, a programme, a gym membership, a plan they made for themselves. And most of the time, it didn't go the way they hoped.\n\nThat's not a judgement — honestly, I'd be more surprised if it had. The tools most people have been given just... weren't built very well. Not for real people, anyway.\n\nSo — what made it hard? What got in the way, or let you down, or just didn't fit the life you were actually living?\n\nPick everything that feels true. You can pick more than one. And if none of them quite land, just tap 'I'd rather not say' and we'll move on.",
  },

  // ── Step 3b — Primary territory (single select from own selections) ───────
  // CRITICAL: chip tray shows ONLY the chips the user selected in Step 3a.
  // One tap — no Confirm button. Selection advances immediately.
  // If user selected only one territory in 3a: skip this step automatically.
  //   Write that single territory as primaryTerritory and advance to Step 4.
  // Writes onboarding.primaryTerritory to store.
  '3b': {
    id: '3b',
    type: 'inline-chips-primary',
    // chips: dynamically built from user's Step 3a selections — not a static list.
    storeField: 'onboarding.primaryTerritory',
    summaryType: 'primaryTerritory',
    coach: "Take your time. Choose the most important of these chosen few and I'll reflect back exactly how Alongside: Move works differently for you.",
    // No skip option. User can only select from their own Step 3a choices.
    // Auto-advance if only one territory was selected in 3a.
  },

  // ── Step 4 — Beat 3 reflection consent gate + sequential reveal ───────────
  // Type 'reflection-gate' is a compound step handled specially by thread.js:
  //   1. Gate question shown first — Y/N choice
  //   2. If "Later, in settings" — coach gives the settings line, advance to Step 5
  //   3. If "Read it now" — Part 1 reveals automatically, then a single
  //      "Continue" tap appears under each subsequent part (no auto-advance,
  //      no timeout — see thread.js _runSequentialReveal for the rationale:
  //      passive disappearance is the exact failure pattern this product
  //      promises never to repeat).
  // Script selected from beat3-scripts.js using primaryTerritory.
  // Fallback script (FALLBACK_REFLECTION above) fires if user skipped Step 3a.
  // Writes onboarding.reflectionShownAt to store (written when gate is shown,
  // regardless of Y/N answer — it records that the moment was offered).
  4: {
    id: 4,
    type: 'reflection-gate',
    writesTo: 'onboarding.reflectionShownAt',
    gateText: "Your reflection is ready. It's 5 short paragraphs — would you like to read it now, or find it in settings later?",
    gateYesLabel: 'Read it now',
    gateNoLabel:  'Later, in settings',
    declineCoach: "No problem. I'll leave it in settings for you whenever you're ready.",
    continueLabel: 'Continue',
    partFadeMs: 400,
    autoAdvanceAfterMs: 1200, // pause after final part before advancing to Step 5
    // coach content: loaded by thread.js from beat3-scripts.js getDominantTerritory()
    // or FALLBACK_REFLECTION if primaryTerritory is null.
  },

  // ── Step 5 — Bridge into practical setup ─────────────────────────────────
  // No user input. Short coach message. Sets up the practical questions.
  5: {
    id: 5,
    type: 'coach-only',
    coach: "Right.\n\nNow I know a bit about where you've been. Let me ask what I need to know so I can build something that actually fits where you're going.",
  },

  // ── Step 6 — Age ─────────────────────────────────────────────────────────
  // Inline chips. Single select. Skip option.
  // Writes store.ageBand.
  6: {
    id: 6,
    type: 'inline-chips-single',
    chips: AGE_CHIPS,
    skipLabel: "I'd rather not say",
    storeField: 'ageBand',
    summaryType: 'ageBand',
    coach: "Can I ask roughly how old you are?\n\nYou don't have to be exact — I'm not going to use it to put you in a box. It just helps me think about what your body has probably been through, and what kinds of movement are going to suit it best. Feel free to skip if you'd rather not say.",
    coachAfter: {
      answered: "Got it — thank you.",
      skipped:  "No problem at all.",
    },
  },

  // ── Step 7 — Goals (sheet branch) ────────────────────────────────────────
  // Sheet: goals.js v2 mounts at 95% height.
  // Done button closes sheet and writes store.goals[].
  7: {
    id: 7,
    type: 'sheet',
    sheetView: 'onboarding/goals',
    storeField: 'goals',
    summaryType: 'goals',
    skipLabel: 'Skip for now',
    openLabel: 'Yes, show me',
    coach: "Okay. So — what are you actually hoping to get out of using this?\n\nI've put together a list of things people usually say when I ask this question. Some of them might feel obvious. Some might surprise you. Pick everything that feels even a little bit true — you can always change your mind about this later.",
    coachAfter: {
      answered: "That's a good mix. I'll keep all of that in mind.",
      skipped:  "That's completely fine — sometimes it takes a while to work out what you actually want from something like this. It'll be there in your settings whenever you're ready.",
    },
  },

  // ── Step 8 — Conditions and injuries (sheet branch) ──────────────────────
  // Sheet: conditions.js mounts at 95% height.
  // Done button closes sheet and writes store.conditions[].
  8: {
    id: 8,
    type: 'sheet',
    sheetView: 'onboarding/conditions',
    storeField: 'conditions',
    summaryType: 'conditions',
    skipLabel: 'Skip for now',
    openLabel: "Yes, let's do this",
    coach: "Before I start suggesting things for you to actually do — I want to make sure I'm not about to recommend something that makes things worse for your body.\n\nInjuries, health conditions, anything you're managing or being careful around — even things you don't think of as a big deal. Would you be willing to tell me about them?\n\nIt genuinely changes what I'm going to suggest for you.",
    coachAfter: {
      answered: "Thank you for telling me. I'll work around both of those — you won't have to remind me.",
      // Note: coachAfter.answered is a template here — thread.js should replace
      // "both of those" with the actual count if more or fewer than two.
      // Simpler approach: thread.js uses a single dynamic string built from conditions[].
      // See generateConditionsAck() below.
      skipped:  "Okay — no problem at all. If anything comes to mind later, you can add it in your settings and I'll adjust from there. I just wanted to ask.",
    },
  },

  // ── Step 8a — Exercise clearance (CARDIAC-1, 14 Aug 2026) ────────────────
  //
  // Persona 2.5, traced 14 Aug: she declares a heart condition and the
  // coach says "It genuinely changes what I'm going to suggest for you."
  // It did not. Exactly three of 545 exercise entries reference
  // cardiovascular-condition and all three are session-length, so the
  // buildable pool changed by zero exercises at every pain level. There
  // was also no medical-review pathway anywhere in the codebase.
  //
  // WHAT THIS PRODUCT CAN HONESTLY DO
  //
  // Not treat heart conditions. What it can do is Phase IV maintenance --
  // the self-managed stage after supervised cardiac rehab ends, where
  // people are explicitly encouraged to keep going on their own and where
  // most of them fall off a cliff when the six-week programme stops. The
  // app already holds the right mechanism for it: the talk test, "warm,
  // slightly breathless, but able to speak a few words", appears across
  // cardio, running, seated and swimming entries. That is the standard
  // for unsupervised moderate intensity without a heart-rate monitor.
  //
  // The thing that separates safe from unsafe here is not exercise
  // selection. It is whether the person has been cleared. So we ask.
  //
  // Asked of anyone declaring a condition where the answer changes what
  // we should offer -- not cardiac alone, because the same reasoning
  // holds for anyone mid-treatment or recently discharged.
  //
  // A "no" is NOT a refusal. Wellbeing, breathing and walking stay open.
  // What waits is loaded strength work, and the coach says why.
  '8a': {
    id: '8a',
    type: 'inline-chips-single',
    chips: CLEARANCE_CHIPS,
    storeField: 'exerciseClearance',
    summaryType: 'exerciseClearance',
    showIf: (storeData) => (storeData.conditions || []).some(
      id => CLEARANCE_RELEVANT_CONDITIONS.has(id)),
    coach: "One thing I should ask, and then I'll stop.\n\nHas a doctor, physio or rehab team told you it's okay for you to exercise on your own?\n\nI ask because it changes what I'll put in front of you, and because I'd rather ask than assume. There's no wrong answer.",
    coachAfter: {
      answered: null, // dynamic — see generateClearanceAck()
    },
  },

  // ── Step 9 — Activity level ───────────────────────────────────────────────
  // Inline chips. Single select. No skip.
  // Writes store.lifestyle.activityLevel.
  9: {
    id: 9,
    type: 'inline-chips-single',
    chips: ACTIVITY_CHIPS,
    storeField: 'lifestyle.activityLevel',
    summaryType: 'activityLevel',
    coach: "How active have you been lately?\n\nAnd I mean actually — not what you were doing two years ago, not what you're planning to do. What does a normal week look like right now, if you're being honest with yourself?",
    coachAfter: {
      answered: "Good to know. We'll build from there.",
    },
  },

  // ── Steps 9a-9d — Capability (W3-A, 14 Aug 2026) ─────────────────────────
  //
  // The four CAP-1 questions, rebuilt as thread steps. They previously
  // lived in views/onboarding/lifestyle.js, which was not registered in
  // router.js and whose only inbound navigate() calls were swallowed by
  // sheet-manager.js. So capability.askedAt was null for EVERY live user,
  // capabilityProfile().asked was false, and SIX protective branches in
  // session-builder.js never ran for anybody: floorSafe, balanceSafe,
  // needsSeated, legsUsable, legsLoadable and _capabilityUnrestricted().
  // Eight CAP work items sat behind a screen nobody could reach.
  //
  // WHY THEY ARE SPLIT RATHER THAN ALL ASKED
  //
  // Persona review of the actual wording, 14 Aug. The four questions are
  // not one thing:
  //
  //   balanceWorry  — reads neutrally to everybody, 2.3 to 2.10
  //   bothFeet      — reads neutrally, but see below: it is NOT asked
  //   chairRise     — right for 2.10; insulting to 2.3, a national-
  //                   standard 15-year-old sprinter
  //   floorAccess   — same
  //
  // So balanceWorry is asked of everyone and gates the other two. Nobody
  // is asked whether they can rise from a chair unless something suggests
  // the answer might not be "obviously yes".
  //
  // WHY balanceWorry IS THE GATE, AND NOT AGE
  //
  // A trigger built only on age, activity level or declared condition
  // MISSES persona 2.8 — dyspraxia and autism, young, enthusiastic, not
  // sedentary. Dyspraxia is a motor-coordination condition and is not in
  // CONDITIONS (neither is autism). She is precisely the person whose
  // failure mode is a fall, and she would trip no demographic trigger.
  // Asking everyone the one neutral question catches her.
  //
  // The triggers are OR, not AND, so somebody who answers "no" to
  // worrying about balance out of pride is still caught by age or
  // activity level.
  //
  // WHY bothFeet IS NOT ASKED AT ALL
  //
  // Measured, 14 Aug: with capability unasked, an 'active' user already
  // receives impact work (35 impact exercises across 30 sessions) and a
  // 'sedentary' user receives none (0). session-builder.js:1201-1202 has
  // an explicit !cap.asked fallback that gates impact from
  // lifestyle.activityLevel alone. The question earns no protection it
  // does not already have. The field stays in the schema and Settings can
  // write it; it does not cost an onboarding screen.
  //
  // This answers Graeme's original question -- if we are not filtering by
  // age, how do we protect people? Age selects who gets ASKED. Their
  // answer decides what they can do.

  '9a': {
    id: '9a',
    type: 'inline-chips-single',
    chips: BALANCE_CHIPS,
    storeField: 'capability.balanceWorry',
    summaryType: 'balanceWorry',
    coach: "One more thing, and then I'll stop asking questions.\n\nDo you ever worry about losing your balance?\n\nThere's no wrong answer here. Plenty of people say yes and are perfectly capable — it just changes which things I'd put in front of you early on.",
    coachAfter: {
      answered: null, // dynamic — see generateBalanceAck()
    },
  },

  '9b': {
    id: '9b',
    type: 'inline-chips-single',
    chips: CHAIR_RISE_CHIPS,
    storeField: 'capability.chairRise',
    summaryType: 'chairRise',
    // Revealed only when the answer could plausibly not be "obviously yes".
    showIf: (storeData) => _capabilityQuestionsApply(storeData),
    coach: "Can you get up from a chair without pushing off with your hands?\n\nI ask because it tells me something about what your legs are ready for — more than age or how often you exercise does.",
    coachAfter: {
      answered: "Thank you. That's genuinely useful.",
    },
  },

  '9c': {
    id: '9c',
    type: 'inline-chips-single',
    chips: LEG_POWER_CHIPS,
    storeField: 'capability.legPower',
    summaryType: 'legPower',
    // C1 fail-safe. Asked only of somebody who has just said getting out
    // of a chair is not easy or not possible. Optional by Graeme's
    // decision, which is only safe because store.js treats unanswered as
    // 'limited' for exactly this group.
    showIf: (storeData) => {
      const cr = (storeData.capability || {}).chairRise;
      return !!cr && cr !== 'yes';
    },
    coach: "Can you take your weight through your legs — standing, or moving from a chair to somewhere else?\n\nSome exercises ask your legs to carry your weight, so this matters. Say if you'd rather not answer.",
    coachAfter: {
      answered: "Understood.",
    },
  },

  '9d': {
    id: '9d',
    type: 'inline-chips-single',
    chips: FLOOR_ACCESS_CHIPS,
    storeField: 'capability.floorAccess',
    summaryType: 'floorAccess',
    showIf: (storeData) => _capabilityQuestionsApply(storeData),
    coach: "And can you get down to the floor and back up on your own?\n\nQuite a lot of good exercises happen on the floor. If that's not somewhere you want to be, I'll simply build around it — it isn't a limitation, it's just information.",
    coachAfter: {
      answered: "Good. I'll work with that.",
    },
  },

  // ── Step 9e — Returning after what (OPEN-1, 14 Aug 2026) ─────────────────
  //
  // lifestyle.returningAfter is READ by checkin-openings.js to select the
  // 'injury-recovery' day-one opening, and had no writer at all -- its
  // only one was the deleted views/onboarding/lifestyle.js. So the opening
  // was doubly dead: unreachable in the trigger chain AND with no input.
  //
  // Asked only of somebody who has just said they are coming back after a
  // break, which is the one group for whom it is a kind question rather
  // than a prying one.
  '9e': {
    id: '9e',
    type: 'inline-chips-single',
    chips: RETURNING_AFTER_CHIPS,
    storeField: 'lifestyle.returningAfter',
    summaryType: 'returningAfter',
    showIf: (storeData) => (storeData.lifestyle || {}).activityLevel === 'returning',
    coach: "You said you're coming back after a break. Can I ask what from?\n\nOnly because coming back from an injury is a different thing to coming back from a hard year, and I'd rather not treat them the same.",
    coachAfter: {
      answered: "Thank you. I'll bear that in mind.",
    },
  },

  // ── Step 9f — Training intent (W3-B, 14 Aug 2026) ────────────────────────
  //
  // Asked of everyone, unlike the chair and floor questions. Reviewed
  // against all sixteen personas: there is no one it lands badly on. A
  // footballer picks the first, a 76-year-old picks the second, somebody
  // six weeks post-injury picks the third, and none of the three is a
  // verdict about them. That is what makes it safe to ask universally
  // where "can you get out of a chair" is not.
  //
  // Not derived from age or activity level, though it would have been
  // easy. Deriving 'maintain' from being 70plus is exactly the age
  // filtering this product refuses -- plenty of 76-year-olds are
  // building, and plenty of 40-year-olds are holding on. The person says.
  //
  // Placed after the capability questions so it reads as "now I know what
  // your body does, what are we aiming it at" rather than as another
  // question about limits.
  '9f': {
    id: '9f',
    type: 'inline-chips-single',
    chips: INTENT_CHIPS,
    storeField: 'trainingIntent',
    summaryType: 'trainingIntent',
    coach: "Last one, and it's the one that shapes most of what I suggest.\n\nWhat are we actually aiming at?\n\nThere's no better answer here. Holding on to what you've got is real work, and it's a different session to building something new.",
    coachAfter: {
      answered: null, // dynamic — see generateIntentAck()
    },
  },

  // ── Step 10 — Energy ──────────────────────────────────────────────────────
  // Inline chips. Single select. No skip.
  // Writes store.lifestyle.stressLevel (energy maps to this field).
  10: {
    id: 10,
    type: 'inline-chips-single',
    chips: ENERGY_CHIPS,
    storeField: 'lifestyle.stressLevel',
    summaryType: 'energyLevel',
    coach: "And energy — how's that been?\n\nBecause there's a real difference between tired-because-you've-been-busy and tired-in-a-way-that-sleep-doesn't-really-fix. Which is closer to where you are right now?",
    coachAfter: {
      answered: "Understood. That's actually really useful to know.",
    },
  },

  // ── Step 11 — Equipment and location (sheet branch) ──────────────────────
  // Sheet: equipment.js v3 mounts at 95% height.
  // Done button closes sheet and writes store.equipment[].
  11: {
    id: 11,
    type: 'sheet',
    sheetView: 'onboarding/equipment',
    storeField: 'equipment',
    summaryType: 'equipment',
    skipLabel: 'Skip for now',
    openLabel: 'Tell you',
    coach: "Where are you thinking you'll exercise? And what have you actually got available to you — equipment, space, that kind of thing?\n\nI'm asking because this changes everything about what I can suggest. I can build you something genuinely good with a mat and a pair of dumbbells, or something completely different if you've got a full gym. I just need to know what we're actually working with.",
    coachAfter: {
      answered: "Perfect. That gives me plenty to work with.",
      skipped:  "No problem — I'll use bodyweight exercises for now, and you can always update this in your settings.",
    },
  },

  // ── Step 12 — Session frequency ───────────────────────────────────────────
  // Inline chips. Single select. No skip.
  // Writes store.strategicGoal.weeklySessionTarget (as integer).
  12: {
    id: 12,
    type: 'inline-chips-single',
    chips: FREQUENCY_CHIPS,
    storeField: 'strategicGoal.weeklySessionTarget',
    summaryType: 'frequency',
    coach: "How many times a week feels realistic for you — right now, with everything else going on in your life?\n\nNot aspirational. Not what you're hoping for in six weeks. What's actually doable this week, if you're being honest with yourself?",
    coachAfter: {
      // Dynamic: thread.js builds this using the selected frequency label.
      // e.g. "Twice a week is a solid place to start. Let's build from there."
      // See generateFrequencyAck() below.
      answered: null, // signal to thread.js to use generateFrequencyAck()
    },
  },

  // ── Step 13 — Programme selection (sheet branch) ──────────────────────────
  // Sheet: plan-select.js v1 mounts at 95% height.
  // Confirm triggers store.completeOnboarding(). Sheet closes.
  13: {
    id: 13,
    type: 'sheet',
    sheetView: 'onboarding/plan-select',
    storeField: 'activeProgramme',
    summaryType: 'programme',
    skipLabel: 'Decide later',
    openLabel: 'Show me',
    coach: "Okay. I think I've got a pretty good picture now.\n\nBased on everything you've told me, I've put together a few options for where we could start. They're not set in stone — you can always change direction — but have a look and tell me if one of them feels right.",
    coachAfter: {
      answered: "Good choice.\nHonestly — that's exactly where I'd have started you.",
      skipped:  "That's fine — we'll default to something gentle to begin with. You can choose properly in your settings whenever you're ready.",
    },
  },

  // ── Step 14 — Closing coach moment ────────────────────────────────────────
  // No user input. Final coach message.
  // Begin button appears 600ms after message completes.
  // Tapping Begin routes to today.js.
  // Writes onboarding.threadCompletedAt to store before button appears.
  14: {
    id: 14,
    type: 'closing',
    writesTo: 'onboarding.threadCompletedAt',
    beginButtonDelayMs: 600,
    beginButtonLabel: "Let's begin",
    coach: "Right. I think that's everything I need.\n\nI know that was a lot of questions. But I wanted to do it properly — because what you've told me is actually going to change what I put in front of you. Not just today. Every time.\n\nI'm glad you're here, [name]. Let's see what we can do.",
    // [name] replaced by thread.js using store.get('name').
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP ORDER
// Canonical sequence for thread.js to step through.
// 3b is conditional — skipped if only one territory selected in 3a.
// 4 is skipped if user chose "I'd rather not say" in 3a (goes to 5 directly).
// ─────────────────────────────────────────────────────────────────────────────

export const STEP_ORDER = [0, 1, 2, '2b', '3a', '3b', 4, 5, 6, 7, 8,
                           '8a', 9,
                           '9a', '9b', '9c', '9d', '9e', '9f',
                           10, 11, 12, 13, 14];

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY BUBBLE GENERATORS
// Called by thread.js after the user completes each step.
// Returns a plain-English string for the right-aligned user bubble.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate the user summary bubble text for a given step.
 *
 * @param {string} type     — summaryType from STEPS config
 * @param {*}      value    — the value written to store for this step
 * @param {object} store    — the full store data object (for multi-field steps)
 * @returns {string}        — plain-English summary for the user bubble
 */
/**
 * Coach acknowledgement after the balance question (W3-A).
 *
 * P4, Locked: the coach DISPLAYS, it does not interpret. Neither branch
 * tells the person what their answer means about them. "Yes" must not
 * become "you are unsteady" and "no" must not become "you are fine".
 */
/**
 * Coach acknowledgement after the training-intent question (W3-B).
 *
 * None of the three is treated as lesser. The 'maintain' line in
 * particular must not read as consolation -- it is the option that
 * unlocks the carries, grip and floor-transfer work, which is more
 * demanding than what 'improve' selects for a deconditioned person, not
 * less.
 */
/**
 * Coach acknowledgement after the clearance question (CARDIAC-1).
 *
 * The 'not-yet' and 'not-sure' branches are the careful ones. They must
 * be a redirect, not a rejection, and they must not frighten somebody who
 * has just told us about their heart. Neither line diagnoses, neither
 * says "you cannot", and both name something we WILL do today.
 */
export function generateClearanceAck(value) {
  if (value === 'cleared')
    return "Good — that's what I needed to know. I'll keep you at a pace where you could still hold a conversation, and I'll never skip the warm-up or the wind-down.";
  if (value === 'not-yet')
    return "That's completely fine, and thank you for saying. I'll hold off on the heavier strength work until someone who knows your history has said yes. Everything else is open — walking, mobility, breathing, the wellbeing practices — and those are genuinely worth doing.";
  return "No problem at all. I'll treat it as a not-yet for now, which just means I'll leave the heavier strength work aside until you know. Everything else is open, and it's worth asking your GP or rehab team next time you speak to them.";
}

export function generateIntentAck(value) {
  if (value === 'maintain')
    return "Good. That means I'll keep putting the things that matter in front of you — carrying, gripping, getting up and down — rather than quietly making everything easier.";
  if (value === 'recover')
    return "Understood. We'll rebuild rather than push, and I'll lean on the movements that are designed for exactly that.";
  return "Right then. We'll build.";
}

export function generateBalanceAck(value) {
  return (value === 'yes' || value === 'sometimes')
    ? "Thank you for saying. I'll keep that in mind — it doesn't rule anything out, it just changes the order I'd suggest things in."
    : "Good to know. I'll still build sensibly, but that opens a few more options.";
}

export function generateSummary(type, value, storeData) {
  switch (type) {

    // ── W3-A capability summaries ──────────────────────────────────
    // The user bubble repeats their answer back. It must never editorialise:
    // "Yes, sometimes" is what they said, not "you have balance problems".
    case 'exerciseClearance':
      return { 'cleared': "Yes, I've been told it's fine", 'not-yet': 'Not yet',
               'not-sure': "Not sure" }[value] || 'Not answered';

    case 'trainingIntent':
      return { 'improve': 'Build something', 'maintain': "Hold on to what I've got",
               'recover': 'Come back from something' }[value] || 'Not answered';

    case 'returningAfter':
      return { 'injury': 'An injury', 'illness': 'Illness',
               'life': 'Life got in the way', 'burnout': 'Burnout' }[value]
             || 'Not answered';

    case 'balanceWorry':
      return { 'no': 'No, not really', 'sometimes': 'Sometimes', 'yes': 'Yes' }[value]
             || 'Not answered';

    case 'chairRise':
      return { 'yes': 'Yes', 'not-easily': 'Not easily', 'no': 'No' }[value] || 'Not answered';

    case 'floorAccess':
      return {
        'yes': 'Yes',
        'not-comfortably': 'Not comfortably',
        'rather-not': "I'd rather not try",
        'no': 'No',
      }[value] || 'Not answered';

    case 'legPower':
      // 'skip' never reaches the store (converted to null at the writer),
      // but the bubble is generated from the CHIP value, so handle it here.
      return {
        'full': 'Yes',
        'limited': 'A little, or on good days',
        'none': 'No',
        'skip': "I'd rather not say",
      }[value] || 'Not answered';

    case 'name':
      // value: string
      return value || 'You';

    case 'hardBefore': {
      // value: string[] of territory IDs
      if (!value || value.length === 0) return "I'd rather not say.";
      return value
        .map(id => HARD_BEFORE_PHRASE_MAP[id] || id)
        .join('\n');
    }

    case 'primaryTerritory': {
      // value: string territory ID
      if (!value) return '';
      return HARD_BEFORE_PHRASE_MAP[value] || value;
    }

    case 'ageBand': {
      // value: chip id string, or null if skipped
      if (!value) return "I'd rather not say.";
      const chip = AGE_CHIPS.find(c => c.id === value);
      return chip ? chip.label : value;
    }

    case 'goals': {
      // value: string[] of goal IDs
      // Thread.js passes the human-readable labels, not IDs, from goals.js
      if (!value || value.length === 0) return "I'd rather come back to this later.";
      return value.join(', ');
    }

    case 'conditions': {
      // value: string[] of condition IDs (e.g. 'lower-back'), from conditions.js.
      // W2-4, 14 Aug 2026: this said "names (human-readable)". It does not --
      // views/onboarding/conditions.js writes c.id. Comment was wrong, code right.
      if (!value || value.length === 0) return 'Nothing to flag.';
      if (value.length === 1) return value[0];
      if (value.length === 2) return value.join(', ');
      const others = value.length - 2;
      return `${value[0]}, ${value[1]}, and ${others} other${others > 1 ? 's' : ''}`;
    }

    case 'activityLevel': {
      // value: chip id string
      const chip = ACTIVITY_CHIPS.find(c => c.id === value);
      return chip ? chip.label : value;
    }

    case 'energyLevel': {
      // value: chip id string
      const chip = ENERGY_CHIPS.find(c => c.id === value);
      return chip ? chip.label : value;
    }

    case 'equipment': {
      // value: { facility: null, equipment: string[] } — equipment.js
      // (confirmed against real source) never writes a facility name,
      // only equipment IDs via the combined equipment[] store field. A
      // genuinely skipped step passes value: null entirely (handled by
      // the sheet skip path in thread.js, not this generator). An empty
      // equipment[] array is a real, valid choice — bodyweight only —
      // not a skip, so it must not be conflated with the skip message.
      if (!value) return "I'll decide later.";
      const items = Array.isArray(value.equipment) ? value.equipment : [];
      if (items.length === 0) return "Bodyweight only";
      return `${items.length} item${items.length !== 1 ? 's' : ''} selected`;
    }

    case 'frequency': {
      // value: chip id string ('1', '2', '3', '4', '5plus')
      const chip = FREQUENCY_CHIPS.find(c => c.id === value);
      return chip ? chip.label : value;
    }

    case 'programme': {
      // value: { programmeName: string, weeklyTarget: number } — passed from plan-select.js
      // If skipped: value is null.
      if (!value || !value.programmeName) return "I'll decide later.";
      return `${value.programmeName} — ${value.weeklyTarget} session${value.weeklyTarget !== 1 ? 's' : ''} a week`;
    }

    default:
      return '';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC ACKNOWLEDGEMENT GENERATORS
// Used for the few coach responses that depend on what the user said.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Step 8 — conditions acknowledgement.
 * Varies based on number of conditions entered.
 *
 * @param {string[]} conditions — array of human-readable condition names
 * @returns {string}
 */
export function generateConditionsAck(conditions) {
  if (!conditions || conditions.length === 0) {
    return "Okay — no problem at all. If anything comes to mind later, you can add it in your settings and I'll adjust from there. I just wanted to ask.";
  }
  if (conditions.length === 1) {
    return `Thank you for telling me. I'll work around ${conditions[0]} — you won't have to remind me.`;
  }
  if (conditions.length === 2) {
    return `Thank you for telling me. I'll work around both of those — you won't have to remind me.`;
  }
  return `Thank you for telling me. I'll work around all of those — you won't have to remind me.`;
}

/**
 * Step 12 — frequency acknowledgement.
 * Varies based on the frequency selected.
 *
 * @param {string} frequencyId — chip id ('1', '2', '3', '4', '5plus')
 * @returns {string}
 */
export function generateFrequencyAck(frequencyId) {
  const map = {
    '1':     "Once a week is a great place to start — consistency matters more than volume. Let's build from there.",
    '2':     "Twice a week is a solid place to start. Let's build from there.",
    '3':     "Three times a week — that's a genuinely good rhythm. Let's build from there.",
    '4':     "Four times a week — you're serious about this. Let's build from there.",
    '5plus': "Five or more — that's ambitious. I'll make sure we build in enough recovery. Let's go.",
  };
  return map[frequencyId] || "Good. Let's build from there.";
}
