/**
 * checkin.js
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
  return base;
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

export function detectBurnout(checkinHistory) {
  if (!checkinHistory || typeof checkinHistory !== 'object') return false;
  const dates = Object.keys(checkinHistory).sort().slice(-7);
  if (dates.length < 3) return false;
  const last5 = dates.slice(-5);
  const energyValues = last5
    .map(d => checkinHistory[d]?.energy)
    .filter(v => typeof v === 'number');
  if (energyValues.length < 3) return false;
  const avg = energyValues.reduce((a, b) => a + b, 0) / energyValues.length;
  return avg <= 4;
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
  getEnergyEmoji,
  getEnergyLabel,
  getMoodEmoji,
  getMoodLabel,
  getQuadrant,
  getQuadrantForWord,
  getWordsForQuadrant,
  detectBurnout,
};
