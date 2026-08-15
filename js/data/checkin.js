/**
 * checkin.js
 * 14 Aug 2026 v5
 *
 * v5 - WRITE-1. coldStartBias() gives lifestyle.stressLevel its first
 *   reader. Onboarding asked how someone's energy had been and nothing
 *   ever looked at the answer. Applies only before three check-ins exist,
 *   only downward, and never as burnout.
 *
 * 14 Aug 2026 v4
 *
 * v4 - W2-2. saveCheckin() clears proposalBias, which was written only
 *   by coach-reflection.js and never cleared.
 *
 * 24 Jun 2026 v3
  *
 * v3 — Compatibility fix. v2 (23 Jun) replaced the existing utility API
 *   with new named exports, breaking js/views/checkin.js which imports:
 *     checkinData.getTodaysCheckin()
 *     checkinData.getHistory(n)
 *     checkinData.saveCheckin(data)
 *     checkinData.getSuggestedIntensity(data)
 *     checkinData.getEnergyEmoji(val)
 *     checkinData.getEnergyLabel(val)
 *     checkinData.getMoodEmoji(val)
 *     checkinData.getMoodLabel(val)
 *   All missing functions restored. New v2 exports (FEELING_WORDS,
 *   getQuadrant, getWordsForQuadrant, etc.) preserved alongside them.
 *   checkinData named export added for backward compatibility.
 *
 * v2 — 23 Jun 2026. Feeling word depth bank, quadrant logic, coach
 *   posture resolver, burnout detection. Phase 5 schema pass.
 *
 * v1 — original check-in data utilities.
 */

import { store } from '../store.js';

// ─── Energy labels and emojis ─────────────────────────────────────────────────

const ENERGY_LABELS = [
  '', 'Exhausted', 'Very low', 'Low', 'Below average', 'Average',
  'Okay', 'Good', 'Very good', 'High', 'Energised'
];

const ENERGY_EMOJIS = [
  '', '😴', '😔', '😕', '😐', '🙂', '😊', '😄', '⚡', '🔥', '🚀'
];

const MOOD_LABELS = [
  '', 'Struggling badly', 'Very low', 'Low', 'Below average', 'Average',
  'Okay', 'Good', 'Very good', 'Great', 'Fantastic'
];

const MOOD_EMOJIS = [
  '', '😢', '😞', '😟', '😕', '😐', '🙂', '😊', '😄', '😁', '🤩'
];

export function getEnergyLabel(val) {
  return ENERGY_LABELS[Math.max(1, Math.min(10, Math.round(val)))] || 'Average';
}

export function getEnergyEmoji(val) {
  return ENERGY_EMOJIS[Math.max(1, Math.min(10, Math.round(val)))] || '🙂';
}

export function getMoodLabel(val) {
  return MOOD_LABELS[Math.max(1, Math.min(10, Math.round(val)))] || 'Average';
}

export function getMoodEmoji(val) {
  return MOOD_EMOJIS[Math.max(1, Math.min(10, Math.round(val)))] || '🙂';
}

// ─── Suggested intensity ──────────────────────────────────────────────────────

export function getSuggestedIntensity(checkin) {
  const energy = checkin?.energy || 5;
  if (energy <= 3) return 'low';
  if (energy <= 6) return 'moderate';
  return 'high';
}

/**
 * BIAS-1, 12 Aug 2026. Combine the intensity derived from energy with the
 * bias the coach worked out from everything else.
 *
 * THE PROBLEM THIS FIXES. getSuggestedIntensity() above reads ONE number:
 * check-in energy. coach-reflection.js separately works out a
 * proposalBias from severe pain, burnout risk, several consecutive days
 * of training, and returning after time away -- then wrote it to the
 * store, where nothing read it. Since 03 Aug.
 *
 * So the coach could privately conclude that today should be lighter
 * because somebody is in a burnout pattern, tell them so in the
 * reflection, and then hand them exactly the session their energy score
 * alone suggested. It knew, said it, and did not act on it -- which is
 * the specific failure that makes a coach feel like it is not listening.
 *
 * A STEP DOWN, NOT A FLOOR. 'lighter' moves one notch, so somebody with
 * high energy in a burnout pattern gets moderate rather than being
 * dropped to low. Overriding a good day entirely because of a pattern
 * would be the app deciding it knows better than the person in front of
 * it, which is P7's line: confidence scales with information, authority
 * never does.
 *
 * 'rest' goes to low rather than to nothing. The severe-pain path already
 * routes to the Gentle Care card upstream of this; the job here is to
 * make sure that anything still generated is the gentlest it can be.
 */
export function resolveIntensity(baseIntensity, bias) {
  const base = ['low', 'moderate', 'high'].includes(baseIntensity) ? baseIntensity : 'moderate';
  if (bias === 'rest')    return 'low';
  if (bias === 'lighter') return base === 'high' ? 'moderate' : 'low';
  // WRITE-1. No coach bias yet -- fall back to what they told us at
  // onboarding, but only while there is nothing better to go on.
  if (bias == null && coldStartBias() === 'lighter') {
    return base === 'high' ? 'moderate' : 'low';
  }
  return base;
}

/**
 * WRITE-1, 14 Aug 2026. The first reader lifestyle.stressLevel has ever had.
 *
 * Step 10 of onboarding asks a careful question -- the difference between
 * tired-because-you-have-been-busy and tired-in-a-way-sleep-does-not-fix
 * -- and until now the answer was stored and never consulted by anything.
 * Somebody who says "running on empty" and is then handed a standard first
 * session has been asked a caring question and ignored, which is worse
 * than not asking.
 *
 * Deliberately narrow, on three counts:
 *
 * 1. COLD START ONLY. detectBurnout() needs three days of check-ins before
 *    it can say anything. This covers only that gap and switches itself
 *    off the moment real data exists. A month-old onboarding answer must
 *    never outrank this week's check-ins.
 * 2. DOWNWARD ONLY. It can soften a session, never harden one. "Pretty
 *    good" at onboarding does not earn anybody a harder first week.
 * 3. NOT BURNOUT. It does not touch detectBurnout(), because burnout is a
 *    claim about an observed pattern and this is a self-report from before
 *    the pattern existed. Calling it burnout would be the coach
 *    interpreting rather than responding.
 *
 * @returns {'lighter'|null}
 */
export function coldStartBias() {
  const history = store.get('checkinHistory') || {};
  // Three is detectBurnout()'s own threshold. Kept identical on purpose:
  // if that changes, this should change with it, and a mismatch would
  // leave a window where neither signal applies.
  if (Object.keys(history).length >= 3) return null;

  const declared = (store.get('lifestyle') || {}).stressLevel;
  return (declared === 'exhausted' || declared === 'running-low') ? 'lighter' : null;
}

// ─── Check-in history ─────────────────────────────────────────────────────────

export function getTodaysCheckin() {
  const today   = new Date().toDateString();
  const history = store.get('checkinHistory') || {};
  // checkinHistory is keyed by ISO date string YYYY-MM-DD
  const todayKey = new Date().toISOString().split('T')[0];
  const entry = history[todayKey] || null;
  if (entry) return entry;

  // Fallback: check lastCheckin date field
  const last = store.get('lastCheckin') || {};
  if (last.date === today) return last;
  return null;
}

export function getHistory(n) {
  const history = store.get('checkinHistory') || {};
  const entries = Object.entries(history)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, entry]) => ({ ...entry, date }));
  return n ? entries.slice(0, n) : entries;
}

export function saveCheckin(data) {
  const today    = new Date().toDateString();
  const todayKey = new Date().toISOString().split('T')[0];

  // ── W2-2 (14 Aug 2026, persona trace Wave 2) ────────────────────────
  //
  // proposalBias is written in three places, all inside
  // coach-reflection.js's option handlers, and was never cleared. So a
  // bias worked out from YESTERDAY's burnout, consecutive days or severe
  // pain sat in the store describing TODAY, and resolveIntensity() reads
  // it without checking its age. field-contract.js already names
  // proposalBias as the WRITTEN-NEVER-READ example; this is the other
  // half of the same fault -- read, but never expired.
  //
  // Cleared here rather than dated: the check-in is the first thing on
  // any session route and coach-reflection runs after it, so a real bias
  // for today is rewritten moments later and a stale one never survives
  // into a new day. checkin.js:866 is the only caller, once per day.
  store.set('proposalBias', null);

  // Write to checkinHistory (keyed by ISO date)
  const history = store.get('checkinHistory') || {};
  history[todayKey] = { ...data, date: today, savedAt: new Date().toISOString() };
  store.set('checkinHistory', history);

  // Write to lastCheckin
  store.set('lastCheckin', {
    ...store.get('lastCheckin'),
    date:            today,
    energy:          data.energy,
    mood:            data.mood,
    sleepHours:      data.sleepHours,
    sleepQuality:    data.sleepQuality,
    feelingWord:     data.feelingWord     || null,
    feelingQuadrant: data.feelingQuadrant || null,
    unwell:          data.unwell          || false,
    completed:       true,
  });
}

// ─── Quadrant derivation ──────────────────────────────────────────────────────

export function getQuadrant(energy, mood) {
  const highEnergy = energy >= 6;
  const highMood   = mood   >= 6;
  if (highEnergy  && highMood)  return 'high-energy-pleasant';
  if (highEnergy  && !highMood) return 'high-energy-unpleasant';
  if (!highEnergy && highMood)  return 'low-energy-pleasant';
  return 'low-energy-unpleasant';
}

// ─── Feeling word bank ────────────────────────────────────────────────────────

export const FEELING_WORDS = [
  { word: 'ready',        quadrant: 'high-energy-pleasant',   depth: 1, coreWord: true  },
  { word: 'good',         quadrant: 'high-energy-pleasant',   depth: 1, coreWord: true  },
  { word: 'motivated',    quadrant: 'high-energy-pleasant',   depth: 1, coreWord: true  },
  { word: 'excited',      quadrant: 'high-energy-pleasant',   depth: 1, coreWord: true  },
  { word: 'happy',        quadrant: 'high-energy-pleasant',   depth: 1, coreWord: true  },
  { word: 'energised',    quadrant: 'high-energy-pleasant',   depth: 1, coreWord: false },
  { word: 'confident',    quadrant: 'high-energy-pleasant',   depth: 2, coreWord: false },
  { word: 'strong',       quadrant: 'high-energy-pleasant',   depth: 2, coreWord: false },
  { word: 'focused',      quadrant: 'high-energy-pleasant',   depth: 2, coreWord: false },
  { word: 'capable',      quadrant: 'high-energy-pleasant',   depth: 2, coreWord: false },
  { word: 'inspired',     quadrant: 'high-energy-pleasant',   depth: 3, coreWord: false },
  { word: 'purposeful',   quadrant: 'high-energy-pleasant',   depth: 4, coreWord: false },
  { word: 'joyful',       quadrant: 'high-energy-pleasant',   depth: 5, coreWord: false },

  { word: 'anxious',      quadrant: 'high-energy-unpleasant', depth: 1, coreWord: true  },
  { word: 'stressed',     quadrant: 'high-energy-unpleasant', depth: 1, coreWord: true  },
  { word: 'tense',        quadrant: 'high-energy-unpleasant', depth: 1, coreWord: true  },
  { word: 'frustrated',   quadrant: 'high-energy-unpleasant', depth: 1, coreWord: true  },
  { word: 'wired',        quadrant: 'high-energy-unpleasant', depth: 1, coreWord: true  },
  { word: 'restless',     quadrant: 'high-energy-unpleasant', depth: 2, coreWord: false },
  { word: 'irritable',    quadrant: 'high-energy-unpleasant', depth: 2, coreWord: false },
  { word: 'overwhelmed',  quadrant: 'high-energy-unpleasant', depth: 2, coreWord: false },
  { word: 'scattered',    quadrant: 'high-energy-unpleasant', depth: 3, coreWord: false },

  { word: 'calm',         quadrant: 'low-energy-pleasant',    depth: 1, coreWord: true  },
  { word: 'okay',         quadrant: 'low-energy-pleasant',    depth: 1, coreWord: true  },
  { word: 'peaceful',     quadrant: 'low-energy-pleasant',    depth: 1, coreWord: true  },
  { word: 'content',      quadrant: 'low-energy-pleasant',    depth: 1, coreWord: true  },
  { word: 'settled',      quadrant: 'low-energy-pleasant',    depth: 1, coreWord: true  },
  { word: 'relaxed',      quadrant: 'low-energy-pleasant',    depth: 2, coreWord: false },
  { word: 'grateful',     quadrant: 'low-energy-pleasant',    depth: 2, coreWord: false },
  { word: 'grounded',     quadrant: 'low-energy-pleasant',    depth: 4, coreWord: false },

  { word: 'tired',        quadrant: 'low-energy-unpleasant',  depth: 1, coreWord: true  },
  { word: 'flat',         quadrant: 'low-energy-unpleasant',  depth: 1, coreWord: true  },
  { word: 'heavy',        quadrant: 'low-energy-unpleasant',  depth: 1, coreWord: true  },
  { word: 'drained',      quadrant: 'low-energy-unpleasant',  depth: 1, coreWord: true  },
  { word: 'sad',          quadrant: 'low-energy-unpleasant',  depth: 1, coreWord: true  },
  { word: 'foggy',        quadrant: 'low-energy-unpleasant',  depth: 2, coreWord: false },
  { word: 'low',          quadrant: 'low-energy-unpleasant',  depth: 2, coreWord: false },
  { word: 'exhausted',    quadrant: 'low-energy-unpleasant',  depth: 2, coreWord: false },
  { word: 'empty',        quadrant: 'low-energy-unpleasant',  depth: 2, coreWord: false },
  { word: 'numb',         quadrant: 'low-energy-unpleasant',  depth: 3, coreWord: false },
  { word: 'depleted',     quadrant: 'low-energy-unpleasant',  depth: 3, coreWord: false },
  { word: 'hopeless',     quadrant: 'low-energy-unpleasant',  depth: 4, coreWord: false },
];

export function getWordsForQuadrant(quadrant, depthLevel) {
  depthLevel = depthLevel || 1;
  const available = FEELING_WORDS.filter(
    w => w.quadrant === quadrant && w.depth <= depthLevel
  );
  return {
    core:     available.filter(w => w.coreWord),
    expanded: available.filter(w => !w.coreWord),
  };
}

export function getWordObject(word) {
  if (!word) return null;
  return FEELING_WORDS.find(w => w.word.toLowerCase() === word.toLowerCase()) || null;
}

export function getQuadrantForWord(word) {
  return getWordObject(word)?.quadrant || null;
}

export function getCoachPostureForQuadrant(quadrant) {
  const postures = {
    'high-energy-pleasant':   { intensity: 'full',    focus: ['strength', 'cardio'],       coachPosture: 'Full programme appropriate.' },
    'high-energy-unpleasant': { intensity: 'moderate', focus: ['cardio', 'breathwork'],    coachPosture: 'Stress-relief movement.' },
    'low-energy-pleasant':    { intensity: 'light',   focus: ['mobility', 'yoga'],          coachPosture: 'Light, enjoyable activity.' },
    'low-energy-unpleasant':  { intensity: 'gentle',  focus: ['breathing', 'mobility'],    coachPosture: 'Breathing, light mobility only.' },
  };
  return postures[quadrant] || postures['low-energy-unpleasant'];
}

export function getOpeningModes() {
  return ['standard', 'reflection', 'milestone', 'return', 'progress', 'care'];
}

// ─── Burnout detection ────────────────────────────────────────────────────────

/**
 * BURN-1, 12 Aug 2026. Returns a GRADED result, not a boolean.
 *
 * Found by tracing the perimenopause persona -- somebody whose whole
 * profile is unpredictable energy, and precisely who this exists for.
 *
 * TWO FAULTS, STACKED, and neither errored:
 *
 *   1. workoutGenerator.js:543 called detectBurnout() with NO ARGUMENT.
 *      The first line returns false for a missing history, so it returned
 *      false every time, for everybody, since the day it was written.
 *   2. Seven places in workoutGenerator.js then read `burnout.level`.
 *      On a boolean that is undefined, so every comparison was false --
 *      including `recoveryMode: burnout.level === "high"`, which gates
 *      filterToRecoveryPool() in exercises/index.js:334.
 *
 * So the entire recovery path was unreachable. Somebody could report a
 * fortnight of exhaustion and the generator would build as if nothing
 * had been said. The shape mismatch hid the missing argument and the
 * missing argument hid the shape mismatch.
 *
 * Graded rather than boolean because the consumers were already written
 * for grades -- "moderate" softens the coach line, "high" changes the
 * exercise pool. The callers were right; the function was wrong.
 *
 * Defaults to reading the store when called without an argument, so a
 * future call site cannot silently repeat fault 1.
 *
 * @returns {{ level: 'none'|'moderate'|'high', avgEnergy: number|null }}
 */
export function detectBurnout(checkinHistory) {
  const history = (checkinHistory && typeof checkinHistory === 'object')
    ? checkinHistory
    : (store.get('checkinHistory') || {});

  const none = { level: 'none', avgEnergy: null };
  const dates = Object.keys(history).sort().slice(-7);
  if (dates.length < 3) return none;

  const energyValues = dates.slice(-5)
    .map(d => history[d]?.energy)
    .filter(v => typeof v === 'number');
  if (energyValues.length < 3) return none;

  const avg = energyValues.reduce((a, b) => a + b, 0) / energyValues.length;

  // 4 was the original boolean threshold and is kept as the outer edge, so
  // nobody who previously registered stops registering. 'high' is the new
  // grade the generator was already written for.
  if (avg <= 2.5) return { level: 'high',     avgEnergy: avg };
  if (avg <= 4)   return { level: 'moderate', avgEnergy: avg };
  return { level: 'none', avgEnergy: avg };
}

// ─── Backward-compatible named export ─────────────────────────────────────────
// js/views/checkin.js imports { checkinData } from '../data/checkin.js'
// and calls checkinData.getTodaysCheckin(), .saveCheckin() etc.

export const checkinData = {
  getTodaysCheckin,
  getHistory,
  saveCheckin,
  getSuggestedIntensity,
  resolveIntensity,
  coldStartBias,
  getEnergyEmoji,
  getEnergyLabel,
  getMoodEmoji,
  getMoodLabel,
  getQuadrant,
  getQuadrantForWord,
  getWordsForQuadrant,
  detectBurnout,
};
