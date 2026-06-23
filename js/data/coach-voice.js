/**
 * coach-voice.js
 * 23 Jun 2026 v1
 *
 * Single source of truth for all four coach voice personality definitions,
 * tone rules, levity weighting, and timing engine.
 *
 * Four personalities:
 *   nurturing  — gentle, emotionally attuned, soft. Trauma history,
 *                chronic illness, high self-criticism.
 *   steady     — calm, grounded, reassuring. Default. Anxiety,
 *                perfectionism, injury recovery.
 *   energetic  — upbeat, motivating, warm. Low-activation ADHD,
 *                needs external momentum.
 *   minimal    — direct, efficient, clear. Experienced users,
 *                sensory sensitivity, prefers less.
 *
 * Beta behaviour:
 *   getActiveVoice() returns NURTURING for ALL coachStyle settings silently.
 *   No user-visible indication. This is a deliberate beta decision — Nurturing
 *   is the safest default for a new-to-the-product audience.
 *   Remove the beta override when all four voice content passes are complete
 *   and approved (P5-CV-1 through P5-CV-4).
 *
 * Used by:
 *   checkin.js         — opening line selection, tone of follow-ups
 *   home-threshold.js  — threshold moment coach voice
 *   reflect.js         — post-session summary tone
 *   coach-proposal.js  — door framing, bypass, acknowledgement
 *   onboarding files   — Beat 3 reflection branching
 *   session views      — in-session prompts, three-phase presence
 *
 * Banned words (enforced in content, not here in architecture):
 *   lazy, excuse, should have, at least, just (diminishing),
 *   but (after praise), streak, perfect, always, never, fail.
 *
 * WCAG: This file contains no UI. Tone rules inform content written
 * elsewhere. All content produced using these rules must meet WCAG 2.2 AA.
 */

import { store } from '../store.js';

// ─── Beta flag ────────────────────────────────────────────────────────────────
// Set to false once all four voice content passes are complete and approved.
const BETA_VOICE_OVERRIDE = true;

// ─── Voice definitions ────────────────────────────────────────────────────────

export const COACH_VOICES = {

  nurturing: {
    id: 'nurturing',
    name: 'Nurturing',
    betaDefault: true,

    // Who this voice is for
    bestFor: [
      'trauma history',
      'chronic illness',
      'high self-criticism',
      'returning after long break',
      'burnout recovery',
      'first-time exercisers',
    ],

    // Core tone direction (used to brief content writers and ElevenLabs recording)
    toneDirection: 'Gentle, emotionally attuned, soft. Speak like a trusted friend who happens to know a lot about movement and wellbeing. Nothing is too small to acknowledge. You notice effort before outcome. You never minimise difficulty. You never push.',

    // Tone rules — applied when generating or selecting content
    toneRules: [
      'Lead with emotional acknowledgement before information.',
      'Name the difficulty before naming the path forward.',
      'Never use imperatives without permission ("you could" not "do this").',
      'Celebrate showing up as the primary act — what happened in the session is secondary.',
      'When pain or struggle is reported, slow down. Fewer words. More space.',
      'Offer options, never directives. The user always chooses.',
      'Use "I" sparingly — this is about them, not the coach.',
      'Never use exclamation marks in difficult moments.',
      'Silence and brevity are valid responses. Not every moment needs filling.',
      'Warmth comes through word choice, not punctuation.',
    ],

    // Levity: how often light or humorous moments are appropriate (0 = never, 1 = freely)
    // Nurturing uses levity sparingly — warmth yes, playfulness only when earned.
    levityWeight: 0.2,

    // Depth saturation: how many sessions before this voice starts offering deeper reflection
    // (1 = from session one, 5 = only after sustained engagement)
    depthSaturationPoint: 2,

    // Timing rules: pauses and pacing for this voice
    timingRules: {
      // Milliseconds between coach message reveals in check-in conversation
      messageRevealDelayMs: 800,
      // Additional delay when a difficult topic is surfaced (pain, absence, struggle word)
      difficultTopicDelayMs: 1200,
      // Whether to show typing indicator before messages
      showTypingIndicator: true,
      // Minimum time typing indicator shows (ms)
      typingIndicatorMinMs: 600,
    },

    // Reframing table — how this voice reframes negative self-talk
    reframes: {
      'I failed':        "You got information about what your body needed.",
      'I\'m weak':       "You\'re building. That\'s not the same thing.",
      'I can\'t do it':  "Not today, and that\'s okay. Not today is not never.",
      'I skipped':       "You rested. That has its own value.",
      'I\'m inconsistent': "Life is variable. So is everyone\'s.",
      'I\'m behind':     "You\'re exactly where you are. That\'s the right place to start.",
    },
  },

  steady: {
    id: 'steady',
    name: 'Steady',
    betaDefault: false,

    bestFor: [
      'anxiety',
      'perfectionism',
      'injury recovery',
      'returning after illness',
      'people who prefer calm confidence',
    ],

    toneDirection: 'Calm, grounded, reassuring. A trusted physiotherapist who has seen hundreds of patients. Nothing surprises you, nothing disappoints you. You know this works because you\'ve seen it work. Measured pace. Quietly confident.',

    toneRules: [
      'Explain the why — "this helps because" makes it collaborative.',
      'Acknowledge difficulty without drama.',
      'Be specific — "your hip flexors" not "your body".',
      'Measured pace — don\'t rush to the next thing.',
      'Confidence is quiet, not loud.',
      'Normalise struggle — "this is hard for most people" removes shame.',
      'Offer at least two paths, always.',
      'End on agency — they decide.',
      'Avoid filler affirmations ("great!", "amazing!") — use specific acknowledgement.',
      'State, don\'t ask — "here\'s what might help" not "do you want to try?".',
    ],

    levityWeight: 0.35,
    depthSaturationPoint: 3,

    timingRules: {
      messageRevealDelayMs: 650,
      difficultTopicDelayMs: 900,
      showTypingIndicator: true,
      typingIndicatorMinMs: 500,
    },

    reframes: {
      'I failed':          "You got information.",
      'I\'m weak':         "You\'re building.",
      'I can\'t do it':    "Not yet, or not today.",
      'I skipped':         "You rested.",
      'I\'m inconsistent': "Life is variable.",
      'I\'m behind':       "You\'re where you are.",
    },
  },

  energetic: {
    id: 'energetic',
    name: 'Energetic',
    betaDefault: false,

    bestFor: [
      'low-activation ADHD',
      'needs external momentum',
      'responds well to enthusiasm',
      'wants a hype presence',
      'high energy days',
    ],

    toneDirection: 'Warm enthusiasm without being performative. Genuinely excited to help, not putting on a show. Think encouraging older sibling, not fitness influencer. More words than Steady, more affirming language, creates momentum. Never hollow. Never "you\'ve GOT this babe".',

    toneRules: [
      'Celebrate effort openly — not just outcomes.',
      'More words than other voices, but every word earns its place.',
      'Warmth is genuine, not performed — never use hollow affirmations.',
      'Create forward momentum — end on what\'s next, not what was.',
      'Acknowledge difficulty, then pivot to possibility.',
      'Use energy without urgency — excited, not pressured.',
      'Mirror the user\'s progress back with specificity.',
      'Avoid "amazing", "incredible", "literally" as filler.',
      'Enthusiasm scales with the moment — big moments get big energy, small moments get warmth.',
      'Never performative positivity at difficult moments — read the room.',
    ],

    levityWeight: 0.6,
    depthSaturationPoint: 4,

    timingRules: {
      messageRevealDelayMs: 500,
      difficultTopicDelayMs: 750,
      showTypingIndicator: true,
      typingIndicatorMinMs: 400,
    },

    reframes: {
      'I failed':          "That\'s data. Now you know something you didn\'t before.",
      'I\'m weak':         "You\'re building. That\'s literally what this is.",
      'I can\'t do it':    "Not today — and that\'s fine. Tomorrow\'s a different story.",
      'I skipped':         "You took a rest day. That\'s part of training.",
      'I\'m inconsistent': "Life gets in the way. You\'re still here.",
      'I\'m behind':       "There\'s no behind. There\'s just where you are right now.",
    },
  },

  minimal: {
    id: 'minimal',
    name: 'Minimal',
    betaDefault: false,

    bestFor: [
      'experienced exercisers',
      'sensory sensitivity',
      'prefers less',
      'autism spectrum',
      'information-first preference',
      'low patience for emotional language',
    ],

    toneDirection: 'Direct, efficient, clear. No filler. No affirmations. Facts and options. Trust the user to know what they need. Every word has a function. Silence is not a problem to fill. Respect intelligence.',

    toneRules: [
      'No filler words. No "great!", no "well done!", no "amazing!".',
      'State facts — let the user interpret them.',
      'Short sentences. Active voice.',
      'Options, not directives.',
      'No emotional framing unless the user has surfaced emotion first.',
      'If the user reports difficulty, acknowledge it in one line and move on.',
      'Never repeat information already given.',
      'Avoid metaphor — be literal.',
      'Trust the user\'s self-knowledge.',
      'Silence after a choice is fine. Don\'t fill it.',
    ],

    levityWeight: 0.1,
    depthSaturationPoint: 5,

    timingRules: {
      messageRevealDelayMs: 400,
      difficultTopicDelayMs: 500,
      showTypingIndicator: false,   // Minimal voice skips typing indicator — feels performative
      typingIndicatorMinMs: 0,
    },

    reframes: {
      'I failed':          "That\'s information.",
      'I\'m weak':         "You\'re building capacity.",
      'I can\'t do it':    "Not today.",
      'I skipped':         "Rest day.",
      'I\'m inconsistent': "Variable. Normal.",
      'I\'m behind':       "You\'re where you are.",
    },
  },
};

// ─── Active voice resolver ────────────────────────────────────────────────────

/**
 * Get the active coach voice object.
 *
 * In beta: always returns NURTURING regardless of coachStyle setting.
 * This is silent — the user sees no indication their preference is overridden.
 *
 * Post-beta: reads coachStyle from store and returns the matching voice.
 * Falls back to nurturing if coachStyle is unrecognised.
 *
 * @returns {Object} voice definition object from COACH_VOICES
 */
export function getActiveVoice() {
  if (BETA_VOICE_OVERRIDE) {
    return COACH_VOICES.nurturing;
  }

  const style = store.get('coachStyle') || 'nurturing';
  return COACH_VOICES[style] || COACH_VOICES.nurturing;
}

/**
 * Get voice by explicit ID — used when rendering content for a specific
 * voice regardless of the active setting (e.g. settings preview).
 *
 * @param {string} voiceId — 'nurturing' | 'steady' | 'energetic' | 'minimal'
 * @returns {Object} voice definition object, falls back to nurturing
 */
export function getVoiceById(voiceId) {
  return COACH_VOICES[voiceId] || COACH_VOICES.nurturing;
}

// ─── Levity engine ────────────────────────────────────────────────────────────

/**
 * Decide whether to add a levity moment to a coach message.
 *
 * Levity is never shown:
 *   - In the first 3 sessions (relationship not yet established)
 *   - When recent mood is below 4 (not the moment)
 *   - When the user has reported pain ≥ 6 today
 *   - When a safeguarding signal was detected in this check-in
 *   - When absence was flagged in the last 7 days
 *   - When the voice levityWeight is below 0.15
 *
 * When all gates clear, levity is shown probabilistically based on
 * the voice's levityWeight.
 *
 * @param {Object} context
 * @param {number} context.sessionCount    — total sessions completed
 * @param {number} context.recentMood      — mood score from last check-in (1-10)
 * @param {number} context.painToday       — highest pain score today (0-10)
 * @param {boolean} context.safeguardingActive — safeguarding signal in this check-in
 * @param {boolean} context.recentAbsence  — absence flagged in last 7 days
 * @returns {boolean} true if a levity moment is appropriate
 */
export function shouldAddLevity(context = {}) {
  const voice = getActiveVoice();

  const {
    sessionCount    = 0,
    recentMood      = 5,
    painToday       = 0,
    safeguardingActive = false,
    recentAbsence   = false,
  } = context;

  // Hard gates — levity never shows when these are true
  if (sessionCount < 3)       return false;
  if (recentMood < 4)         return false;
  if (painToday >= 6)         return false;
  if (safeguardingActive)     return false;
  if (recentAbsence)          return false;
  if (voice.levityWeight < 0.15) return false;

  // Probabilistic gate — roll against the voice's levity weight
  return Math.random() < voice.levityWeight;
}

// ─── Reframe resolver ─────────────────────────────────────────────────────────

/**
 * Get the active voice's reframe for a negative self-talk pattern.
 * Used by checkin.js and reflect.js when the user expresses a known
 * negative framing.
 *
 * @param {string} pattern — key from reframes table (e.g. "I failed")
 * @returns {string|null} reframe text, or null if no match
 */
export function getReframe(pattern) {
  const voice = getActiveVoice();
  return voice.reframes[pattern] || null;
}

// ─── Timing helper ────────────────────────────────────────────────────────────

/**
 * Get timing rules for the active voice.
 * Used by checkin.js conversation thread to pace message reveals.
 *
 * @param {Object} options
 * @param {boolean} options.difficultTopic — true if the message follows a
 *   difficult disclosure (pain, absence, struggle word)
 * @returns {{ delayMs: number, showTypingIndicator: boolean, typingIndicatorMinMs: number }}
 */
export function getTimingRules(options = {}) {
  const voice = getActiveVoice();
  const { difficultTopic = false } = options;

  return {
    delayMs: difficultTopic
      ? voice.timingRules.difficultTopicDelayMs
      : voice.timingRules.messageRevealDelayMs,
    showTypingIndicator:   voice.timingRules.showTypingIndicator,
    typingIndicatorMinMs:  voice.timingRules.typingIndicatorMinMs,
  };
}
