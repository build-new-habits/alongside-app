/**
 * signal-words.js
 * 23 Jun 2026 v1
 *
 * Versioned keyword list for detecting progress and struggle signals
 * in journal entries. Deterministic. Auditable. No AI inference.
 *
 * Two signal types:
 *   progress  — words indicating forward movement, pride, capability, or joy
 *   struggle  — words indicating difficulty, pain, low state, or need for care
 *
 * Language sources:
 *   - Contemporary UK/US English (2020–2026)
 *   - Gen Z and millennial vernacular
 *   - Neurodivergent community language (ADHD, autism, fibromyalgia, chronic fatigue)
 *   - Burnout and recovery vocabulary
 *   - Cross-cultural emotional vocabulary (South Asian, Black British, Caribbean, Irish)
 *   - Body-based and somatic language
 *   - Plain language equivalents for all clinical terms
 *
 * Review: Graeme Wright before first deploy.
 * Update cadence: reviewed quarterly. Bump version on any change.
 *
 * Used by:
 *   journal-entry.js  — detectSignals() called at save time; sets hasProgressSignal on entry
 *   checkin.js        — Mode 5 reads hasProgressSignal on recent entries to open with progress
 *
 * WCAG: This file contains no UI. Detection is silent. No content is surfaced
 * to the user based on these signals without a full UX pass.
 */

// ─── Version ──────────────────────────────────────────────────────────────────

export const SIGNAL_WORDS_VERSION = '1.0.0';

// ─── Progress signals ─────────────────────────────────────────────────────────
// Words and phrases suggesting forward movement, pride, capability, or joy.
// Match is case-insensitive. Phrase matches are checked before single words.

export const PROGRESS_PHRASES = [
  // Achievement / surprise at self
  'first time',
  'never done that before',
  'didn\'t think i could',
  'couldn\'t have done that',
  'further than i thought',
  'longer than usual',
  'more than i expected',
  'better than last time',
  'easier than before',
  'showed up',
  'kept going',
  'pushed through',
  'made it',
  'got there',
  'did it anyway',
  'did it',
  'went for it',
  'proud of myself',
  'proud of that',
  'good about myself',
  'feel good',
  'feeling good',
  'felt good',
  // Neurodivergent community / body-based
  'spoons left',
  'had enough spoons',
  'good body day',
  'body cooperated',
  'brain cooperated',
  'in my body',
  'body felt good',
  'listened to my body',
  // Joy and lightness
  'actually enjoyed',
  'enjoyed that',
  'kind of loved it',
  'loved it',
  'so good',
  'felt amazing',
  'felt great',
  'felt strong',
  'felt capable',
  'felt alive',
  'felt like me',
  'like myself again',
  'felt like myself',
  // Gen Z / millennial vernacular (progress)
  'ate that',
  'ate it',
  'no cap',
  'low key proud',
  'low-key proud',
  'genuinely proud',
  'slept on this',
  'era of',
  'main character',
  'glowed up',
  'glow up',
  'levelled up',
  'leveled up',
  'level up',
  'unlocked',
  'came through',
  'showed up for myself',
  'showed up for me',
  'backed myself',
  'bet on myself',
  'invested in myself',
];

export const PROGRESS_WORDS = [
  // Standard positive movement words
  'achieved',
  'accomplished',
  'succeeded',
  'managed',
  'completed',
  'finished',
  'proud',
  'stronger',
  'fitter',
  'faster',
  'further',
  'better',
  'improved',
  'improving',
  'progress',
  'progressing',
  'growing',
  'grew',
  'built',
  'building',
  'earned',
  'deserved',
  'rewarded',
  'celebrated',
  'celebrating',
  // Energy and capacity
  'energised',
  'energized',
  'refreshed',
  'recharged',
  'restored',
  'renewed',
  'recovered',
  'bounced',
  'comeback',
  'returned',
  'back',
  // Emotional uplift
  'happy',
  'happier',
  'joyful',
  'grateful',
  'thankful',
  'hopeful',
  'optimistic',
  'motivated',
  'inspired',
  'excited',
  'pumped',
  'buzzing',
  'lit',
  'vibing',
  'thriving',
  'flourishing',
  // Body and capability
  'capable',
  'strong',
  'powerful',
  'confident',
  'steady',
  'stable',
  'balanced',
  'grounded',
  'centred',
  'centered',
  'present',
  'focused',
  'clear',
  'calm',
  'peaceful',
  'light',
  'free',
  // Habit and consistency
  'consistent',
  'consistent',
  'routine',
  'habit',
  'streak',     // people use this word even though we don't show streaks
  'regular',
  'showed',
  'turned',
  'committed',
  // Cross-cultural / community language (progress)
  'blessed',
  'grateful',
  'thankful',
  'graced',
  'favoured',
  'favored',
  'fighting',   // "I'm fighting for this" — Caribbean English
  'warrior',
  'champion',
  'boss',
  'killing',    // "killing it"
  'slaying',
  'slayed',
  'slain',
  'flexing',
  // Gen Z vernacular (single words)
  'slay',
  'ate',
  'understood',
  'valid',
  'iconic',
  'legendary',
  'goated',
  'based',
  'fire',       // "that was fire"
  'bussin',
  'lowkey',
];

// ─── Struggle signals ─────────────────────────────────────────────────────────
// Words and phrases suggesting difficulty, pain, low state, or need for care.
// These do NOT trigger safeguarding — that is handled by the separate
// SAFEGUARDING_WORDS list below (acute distress only).
// Struggle signals inform coach tone on next check-in. Nothing more.

export const STRUGGLE_PHRASES = [
  // Effort and exhaustion
  'really hard',
  'so hard',
  'too hard',
  'too much',
  'not enough',
  'not in it',
  'not feeling it',
  'couldn\'t do it',
  'couldn\'t finish',
  'gave up',
  'had to stop',
  'had to quit',
  'quit early',
  'cut it short',
  'fell short',
  'didn\'t make it',
  'running on empty',
  'nothing left',
  'no energy',
  'no fuel',
  'dragging myself',
  'dragged myself',
  'forced myself',
  // Pain and body
  'in pain',
  'hurting',
  'hurt today',
  'body hurts',
  'flare up',
  'flare-up',
  'bad day',
  'bad body day',
  'body not cooperating',
  'body fighting me',
  'fighting my body',
  'out of spoons',
  'no spoons',
  'spoon deficit',
  'crashed after',
  'paid for it',
  'pem',            // post-exertional malaise (ME/CFS community)
  'post exertional',
  'post-exertional',
  // Mental and emotional
  'not okay',
  'not ok',
  'struggling today',
  'struggling a bit',
  'rough day',
  'rough one',
  'really rough',
  'low today',
  'low mood',
  'feeling low',
  'feeling down',
  'down today',
  'really down',
  'in my head',
  'head not in it',
  'distracted',
  'couldn\'t focus',
  'brain fog',
  'brainfog',
  'foggy',
  'brain wasn\'t there',
  'dissociated',
  'checked out',
  // Neurodivergent language
  'dysregulated',
  'overwhelmed',
  'sensory',
  'meltdown',
  'shutdown',
  'masking',
  'unmasked',
  'burnt out',       // burnout — two words
  'shutdown mode',
  // Gen Z / millennial vernacular (struggle)
  'not it',
  'not giving',
  'couldn\'t even',
  'barely',
  'lowkey struggling',
  'low-key struggling',
  'ngl struggling',
  'dead inside',     // often used hyperbolically — context is key
  'cooked',          // exhausted, Gen Z UK
  'fried',
  'drained',
  'depleted',
  'spent',
];

export const STRUGGLE_WORDS = [
  // Core struggle words
  'struggling',
  'difficult',
  'hard',
  'tough',
  'challenging',
  'exhausted',
  'exhausting',
  'tired',
  'drained',
  'depleted',
  'empty',
  'flat',
  'heavy',
  'weighed',
  'stuck',
  'blocked',
  'unmotivated',
  'reluctant',
  'resistant',
  'avoidant',
  'anxious',
  'worried',
  'scared',
  'afraid',
  'nervous',
  'stressed',
  'overwhelmed',
  'swamped',
  'buried',
  'drowning',
  // Pain vocabulary
  'painful',
  'aching',
  'aches',
  'sore',
  'inflamed',
  'inflammation',
  'flaring',
  'aggravated',
  'aggravation',
  'tender',
  'stiff',
  'stiffness',
  'tight',
  'cramping',
  'cramped',
  'nauseous',
  'nausea',
  'dizzy',
  'dizziness',
  'lightheaded',
  // Emotional difficulty
  'sad',
  'unhappy',
  'miserable',
  'awful',
  'terrible',
  'horrible',
  'dreadful',
  'rubbish',       // British English
  'pants',         // British English — "it was pants"
  'grim',          // British English
  'rotten',
  'defeated',
  'hopeless',
  'useless',
  'worthless',
  'failing',
  'failed',
  'failed',
  'broken',
  'lost',
  'confused',
  'foggy',
  'numb',
  'disconnected',
  'detached',
  // Neurodivergent
  'masking',
  'unmasking',
  'burnout',
  'crash',
  'crashed',
  'crashing',
  'flare',
  'flared',
  'relapse',
  // Fatigue spectrum
  'fatigue',
  'fatigued',
  'lethargic',
  'sluggish',
  'leaden',
  'heavy',
  'wired',         // wired-but-tired is a burnout pattern
  'wrecked',       // British/Australian — very tired
  'shattered',     // British — exhausted
  'knackered',     // British — very tired
  'cream-crackered', // Cockney rhyming slang
  'jiggered',      // British dialect
  'gubbed',        // Scottish — exhausted
  'mangled',       // exhausted, Northern Irish
];

// ─── Safeguarding words ───────────────────────────────────────────────────────
// SEPARATE from struggle signals. These indicate acute distress.
// When detected, coach acknowledges warmly and offers signposting ONCE.
// Stored in safeguarding.lastSignpostedAt — suppressed for 7 days after trigger.
// These words are checked in checkin.js (feeling word selection) ONLY —
// not in journal background scanning.

export const SAFEGUARDING_WORDS = [
  'hopeless',
  'trapped',
  'desperate',
  'worthless',
  'numb',
];

// ─── Detection functions ──────────────────────────────────────────────────────

/**
 * Detect progress and struggle signals in a journal entry text.
 * Called at save time by journal-entry.js.
 * Sets hasProgressSignal on the entry object.
 *
 * @param {string} text — raw journal entry text
 * @returns {{ hasProgressSignal: boolean, hasStruggleSignal: boolean }}
 */
export function detectSignals(text) {
  if (!text || typeof text !== 'string') {
    return { hasProgressSignal: false, hasStruggleSignal: false };
  }

  const normalised = text.toLowerCase();

  // Phrases checked first (longer matches take priority)
  const hasProgressPhrase = PROGRESS_PHRASES.some(phrase =>
    normalised.includes(phrase)
  );
  const hasStrugglePhrase = STRUGGLE_PHRASES.some(phrase =>
    normalised.includes(phrase)
  );

  // Single words checked with word boundary awareness
  const hasProgressWord = !hasProgressPhrase && PROGRESS_WORDS.some(word =>
    wordMatch(normalised, word)
  );
  const hasStruggleWord = !hasStrugglePhrase && STRUGGLE_WORDS.some(word =>
    wordMatch(normalised, word)
  );

  return {
    hasProgressSignal: hasProgressPhrase || hasProgressWord,
    hasStruggleSignal: hasStrugglePhrase || hasStruggleWord
  };
}

/**
 * Detect safeguarding signals in a feeling word selection.
 * Called by checkin.js when a feeling word is chosen — not for journal text.
 *
 * @param {string} word — selected feeling word
 * @returns {boolean}
 */
export function detectSafeguardingSignal(word) {
  if (!word || typeof word !== 'string') return false;
  return SAFEGUARDING_WORDS.includes(word.toLowerCase().trim());
}

/**
 * Simple word boundary match — checks if `word` appears as a whole word
 * within `text`. Handles English punctuation boundaries without regex
 * complexity that could fail on unusual input.
 *
 * @param {string} text — normalised (lowercased) text
 * @param {string} word — word to find
 * @returns {boolean}
 */
function wordMatch(text, word) {
  const idx = text.indexOf(word);
  if (idx === -1) return false;

  // Check character before and after are non-alphabetic (word boundary)
  const before = idx === 0 ? ' ' : text[idx - 1];
  const after  = idx + word.length >= text.length ? ' ' : text[idx + word.length];

  return /[^a-z]/.test(before) && /[^a-z]/.test(after);
}
