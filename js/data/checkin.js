/**
 * checkin.js
 * 17 Oct 2026 v15
 *
 * v15 - W6-17 CONSECUTIVE-DAYS (Graeme, 04 Oct: "I guess option 1").
 *   consecutiveActiveDays() is gone: it counted days in a row (never shown),
 *   and the product counts nothing in a row. coachBias() now reads
 *   sessionsInLastThreeDays(): three movement sessions in the three days
 *   before today still make today's plan lighter, so a busy few days is
 *   answered as before, but two sessions on one day and one two days later
 *   count the same as three days running. On the facade too.
 *
 * 17 Oct 2026 v14
 *
 * v14 - W6-19 EMPATHY-GAPS. lowMoodToday(): the person's own word for a
 *   low mood today (Struggling, Low), or null. A Struggling mood was
 *   stored and never answered. No mental-health claim is made from it.
 *
 * 02 Oct 2026 v13
 *
 * v13 - W4-11 BURNOUT-WEEK. detectBurnout counts only check-ins from the
 *   last seven days, so "Your check-ins this week have mostly been low" is
 *   about this week.
 *
 * 01 Oct 2026 v12
 *
 * v12 - BUNDLE-TRUE. The retired feeling-word list (FEELING_WORDS) and its
 *   helpers (getWordsForQuadrant, getWordObject, getQuadrantForWord) are
 *   deleted, with the two orphan exports beside them (getCoachPostureForQuadrant,
 *   getOpeningModes). FEELINGS-RETIRE removed the screens on 28 Sep; the list
 *   still shipped. Nothing in the app read it.
 *
 * 30 Sep 2026 v11
 *
 * v11 - W3-10 LIGHTER-COUNT (Schema v1.83), agreed by Graeme 30 Sep.
 *   consecutiveActiveDays() counts movement: breathing, mindful sessions
 *   and quiet practices are not movement (decision 4a), and a session
 *   stopped under 10 minutes is not a day of it. coachBias() is off on a
 *   "Full of it" day, and on a day the person turned it down.
 *
 * v10 - P26 (persona finding W2-20). consecutiveActiveDays() counts local
 *   calendar days. It compared `date` whole -- and the players write
 *   `date` as a full timestamp, so no entry ever matched and the
 *   lighter-day rule stayed off -- and it used UTC days, so an evening
 *   session in a time zone ahead of UTC landed on the wrong day.
 *
 * v9 - P13. saveCheckin() ends by running store.lapseQuietSoreAreas():
 *   an area tapped once at a check-in leaves the list after three quiet
 *   check-ins on consecutive days. verify-sore-lapse.
 *
 * 28 Sep 2026 v8
 *
 * v8 - FEELINGS-RETIRE. saveCheckin() stores no feeling word or quadrant.
 *
 * v7 - Work list 2e. resolveIntensity() removed with the engine that was
 *   its only caller (see where it stood, below getSuggestedIntensity).
 *
 * 20 Aug 2026 v6
 *
 * v6 - BIAS-3. THE GENERATOR HAS BEEN DEAD, FOR EVERYONE, SINCE BIAS-2.
 *
 *   coachBias() and consecutiveActiveDays() were exported as named
 *   functions and never added to the checkinData facade.
 *   workoutGenerator.js reaches this module only through that facade,
 *   so checkinData.coachBias() was undefined and calling it threw.
 *
 *   It threw on the THIRD LINE of generateDailyOptions(). Everything
 *   below was unreachable: detectBurnout(), the menstrual cycle phase,
 *   programme phase bias, the intensity floor, condition-aware
 *   filtering. coach-proposal.js caught it and served
 *   _getFallbackOptions() instead -- silently, every session, every
 *   user.
 *
 *   WHAT COMES BACK TO LIFE, and this is a real behaviour change:
 *     - todayIntensity actually reaches the generator
 *     - WRITE-1's coldStartBias applies, so the onboarding stress
 *       answer stops being collected and ignored
 *     - BURN-1's recovery path becomes reachable
 *     - coachBias lightens after three consecutive days
 *     - real generated options replace the fallback three
 *
 *   THE LESSON. Two export styles in one module is the fault: a named
 *   export looks complete on its own and is invisible to the only
 *   caller that matters. verify-bias1.mjs was GREEN throughout, because
 *   it asserted the source TEXT said checkinData.coachBias() was
 *   called. It never executed it. verify-bias3.mjs now executes.
 *
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

// resolveIntensity() -- REMOVED 28 Sep 2026 (work list 2e). Its only
// caller was workoutGenerator.js, which nothing had called since
// TWO-ENGINE. What it did lives on the live path now, one rule with one
// reason: session-builder.js _gentleReason() reads coachBias(),
// coldStartBias(), detectBurnout() and last night's sleep, and
// verify-gentle-signals drives it. The proposalBias field it read is
// retired with it (store.js v79).

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
/**
 * BIAS-2, 16 Aug 2026. The coach's bias, DERIVED rather than stored.
 *
 * THE BUG THIS REPLACES. `proposalBias` was a stored field written by
 * coach-reflection.js. That view's route was retired on 04 Aug as
 * obsolete -- correctly -- and unreachable code cannot write, so the
 * field silently stopped being written that day. Twelve days later
 * workoutGenerator.js was still READING it and this file was still
 * CLEARING it. A reader and a clearer with no writer.
 *
 * Three gates were green throughout, because all three asserted the
 * behaviour by reading coach-reflection.js's SOURCE TEXT. The logic was
 * in the file, so they passed. None asked whether anybody could reach
 * it.
 *
 * WHY DERIVED AND NOT RESTORED. Restoring a writer somewhere reachable
 * would have fixed today's symptom and kept the shape that caused it: a
 * value that is correct only while somebody remembers to write it. A
 * derived value cannot have a missing writer. It is the same reasoning
 * that put the difficulty ceiling on one field with one meaning rather
 * than a fourth level field beside three others.
 *
 * WHAT IT NO LONGER CARRIES, because each now has a live owner of its
 * own -- and duplicating them here would be two engines for one
 * decision, which is the fault this codebase keeps finding:
 *
 *   severe pain        -> SEVERE-1's Gentle Care bypass, which is a
 *                         stronger answer than an intensity nudge
 *   burnout            -> detectBurnout(), read directly by
 *                         workoutGenerator and driving recoveryMode
 *   returning after a  -> getReEntryIntensity(), wired through
 *   break                 coach-proposal.js
 *
 * So one trigger is left, and it is the only one that had no other
 * owner: several days in a row.
 *
 * @returns {'lighter'|null}
 */
export function coachBias() {
  // W3-10. The person's own word outranks the count: "Full of it" this
  // morning, or "Keep my usual plan" / Harder on the coach's screen today.
  try {
    const now = new Date();
    const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (store.get('lighterDayDeclinedOn') === localToday) return null;
    if (Number(getTodaysCheckin()?.energy) >= 9) return null;
  } catch { /* nothing readable: the count decides */ }
  // Three is coach-reflection.js's original threshold, kept rather than
  // re-chosen. W6-17: three sessions in the last three days, not three
  // days in a row.
  return sessionsInLastThreeDays() >= 3 ? 'lighter' : null;
}

// W3-10. Decision 4a: breathing and quiet practices are not movement.
const NOT_MOVEMENT = new Set(['breathing', 'mindful', 'mindfulness', 'practice']);
/** A day of movement: not a quiet practice, and not a session stopped under 10 minutes. */
export function countsAsMovement(e) {
  if (!e || NOT_MOVEMENT.has(e.type)) return false;
  if (e.status === 'partial' && !(Number(e.durationMins) >= 10)) return false;
  return true;
}

/**
 * W6-17 (v15; Graeme, 04 Oct: "I guess option 1"). Movement sessions in the
 * three days before today. It replaced consecutiveActiveDays(), which
 * counted days in a row: the product counts nothing in a row, shown or
 * not. Today is left out, as it was: somebody who has already moved today
 * has not yet made it a busier few days, and counting it would soften the
 * very session they are about to do. Local calendar days (P26); a quiet
 * practice, or a session stopped under ten minutes, is not movement
 * (W3-10). The local day of completedAt, else of date; a bare
 * "YYYY-MM-DD" is taken as it is (GENTLE-SIGNALS, P26).
 */
export function sessionsInLastThreeDays() {
  const log = store.get('activityLog') || [];
  const local = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const days = new Set([1, 2, 3].map(n => { const d = new Date(); d.setDate(d.getDate() - n); return local(d); }));
  const dayOf = e => {
    const v = e && (e.completedAt || e.date);
    if (typeof v !== 'string' || !v) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    const d = new Date(v);
    return isNaN(d) ? null : local(d);
  };
  return log.filter(countsAsMovement).filter(e => days.has(dayOf(e))).length;
}

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

/**
 * W6-19. Today's mood in the person's own word when it is low ("struggling"
 * at 2 or under, "low" at 3), or null. Only what they said; nothing read
 * into it.
 */
export function lowMoodToday() {
  const m = Number(getTodaysCheckin()?.mood);
  if (!Number.isFinite(m) || m <= 0) return null;
  return m <= 2 ? "struggling" : m <= 3 ? "low" : null;
}

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
  // BIAS-2. The proposalBias clear is GONE. There is nothing to clear:
  // the bias is derived at read time by coachBias(), so it cannot go
  // stale and cannot survive into a new day.

  // Write to checkinHistory (keyed by ISO date)
  const history = store.get('checkinHistory') || {};
  // FEELINGS-RETIRE: a feeling word is never stored, whatever a caller passes.
  const { feelingWord: _fw, feelingQuadrant: _fq, ...kept } = data || {};
  history[todayKey] = { ...kept, date: today, savedAt: new Date().toISOString() };
  store.set('checkinHistory', history);

  // Write to lastCheckin
  store.set('lastCheckin', {
    ...store.get('lastCheckin'),
    date:            today,
    energy:          data.energy,
    mood:            data.mood,
    sleepHours:      data.sleepHours,
    sleepQuality:    data.sleepQuality,
    unwell:          data.unwell          || false,
    completed:       true,
  });

  // P13. With today's answers saved, an area tapped once at a check-in
  // and quiet for three days running leaves the list.
  store.lapseQuietSoreAreas();
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
export function detectBurnout(checkinHistory, now = new Date()) {
  const history = (checkinHistory && typeof checkinHistory === 'object')
    ? checkinHistory
    : (store.get('checkinHistory') || {});

  const none = { level: 'none', avgEnergy: null };
  // W4-11 (Wave 4, 2.6). "Your check-ins this week" read the last seven
  // check-ins, however old: four low days a fortnight ago still said "this
  // week" after a good day today. Only the last seven days count now.
  const since = store._localDay(new Date(now.getTime() - 6 * 86400000));
  const dates = Object.keys(history).filter(d => d >= since).sort().slice(-7);
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

// BIAS-3, 20 Aug 2026. THE FACADE IS THE CONTRACT.
//
// coachBias and consecutiveActiveDays were exported as named functions
// by BIAS-2 and never added to this object -- and workoutGenerator.js
// reaches this module ONLY through the facade. So
// checkinData.coachBias() was undefined, and calling it threw.
//
// It threw on the THIRD LINE of generateDailyOptions(), which meant
// everything below that line was unreachable: burnout detection, cycle
// phase, programme phase bias, condition-aware filtering, the lot.
// coach-proposal.js caught it and quietly served _getFallbackOptions().
// Every session, for every user, since BIAS-2.
//
// TWO EXPORT STYLES IN ONE MODULE IS THE FAULT. A named export looks
// complete on its own and is invisible to the only caller that matters.
// Anything added here from now on must appear in BOTH places, and
// verify-bias3.mjs asserts that every exported function reachable by
// the facade is actually ON the facade.
export const checkinData = {
  getTodaysCheckin,
  getHistory,
  saveCheckin,
  getSuggestedIntensity,
  coldStartBias,
  coachBias,
  sessionsInLastThreeDays,
  getEnergyEmoji,
  getEnergyLabel,
  getMoodEmoji,
  getMoodLabel,
  getQuadrant,
  detectBurnout,
};
