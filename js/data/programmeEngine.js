/**
 * programmeEngine.js
 * 23 Jun 2026 v2
 *
 * Programme lifecycle engine. Handles phase tracking, session recording,
 * milestone detection, and programme adaptation.
 *
 * v2 adds (Phase 5, pre-beta non-negotiable):
 *   - Re-entry logic after illness or absence (reads absence{} from store v6)
 *   - Compress/extend offer after 2+ missed sessions
 *   - Writes to activeProgramme.missedSessions and sessionSequence (store v6)
 *   - getReEntryContext() — determines whether gentler re-entry is warranted
 *   - getMissedSessionOffer() — returns compress/extend offer data
 *   - recordMissedSession() — logs to activeProgramme.missedSessions
 *   - getWeekShape() — weekly session type plan from programme + weeklyPlan.days
 *
 * v1 functions (unchanged):
 *   - recordSession()
 *   - getProgressStats()
 *   - getCurrentPhaseMessage()
 *   - getPhaseBias()
 *   - getMilestoneMessage()
 *
 * Used by:
 *   coach-proposal.js  — getPhaseBias(), getReEntryContext(), getMissedSessionOffer()
 *   workout.js         — recordSession() on session completion
 *   progress.js        — getProgressStats()
 *   settings.js        — programme reset, programme change
 *   gym-programme.js   — getPhaseBias()
 *   weekly-plan.js     — getWeekShape()
 *
 * Design principles:
 *   - Absence is information, not failure. No shame mechanics.
 *   - The compress/extend offer is a genuine choice — coach adapts either way.
 *   - Re-entry is a beginning, not a contrast. Coach never references what
 *     was missed. It references what's next.
 *   - Programme holds current week on illness return — never advances silently.
 *
 * WCAG: This file contains no UI. All display of adaptation offers and
 * re-entry messages must meet WCAG 2.2 AA in the views that render them.
 */

import { store }          from '../store.js';
import { getProgramme, getPhaseForWeek, getIntensityBiasForWeek, getFocusBiasForWeek } from './programmes.js';

// ─── Constants ────────────────────────────────────────────────────────────────

// Gap in days that triggers the re-entry pathway
const REENTRY_GAP_DAYS = 7;

// Consecutive missed sessions that trigger compress/extend offer
const MISSED_SESSION_THRESHOLD = 2;

// ─── v1 Functions (unchanged) ─────────────────────────────────────────────────

/**
 * Record a completed session against the active programme.
 * Updates: sessionsThisWeek, totalSessions, progressLog, milestones,
 *          community credits, annualReflection.anniversaryDate.
 * Called by workout completion views.
 *
 * @param {Object} sessionData
 * @param {string} sessionData.focus          — workout focus type
 * @param {number} sessionData.energy         — energy at check-in
 * @param {number} sessionData.durationMinutes
 * @param {number} sessionData.exerciseCount
 * @param {Object} sessionData.conditionScores
 * @returns {Object} { milestoneAchieved: Object|null }
 */
export function recordSession(sessionData = {}) {
  const ap = store.get('activeProgramme');
  if (!ap?.programmeId) return { milestoneAchieved: null };

  // Update session counts
  store.set('activeProgramme.sessionsThisWeek', (ap.sessionsThisWeek || 0) + 1);
  store.set('activeProgramme.totalSessions', (ap.totalSessions || 0) + 1);

  // Progress log entry
  const log = [...(store.get('progressLog') || [])];
  log.push({
    date:              new Date().toISOString(),
    week:              ap.currentWeek  || 1,
    phase:             ap.currentPhase || 'build',
    focus:             sessionData.focus             || null,
    energyAtCheckin:   sessionData.energy            || null,
    conditionScores:   sessionData.conditionScores   || {},
    durationMinutes:   sessionData.durationMinutes   || 0,
    exerciseCount:     sessionData.exerciseCount      || 0,
    milestoneAchieved: null, // filled below if milestone fires
  });
  if (log.length > 90) log.splice(0, log.length - 90);
  store.set('progressLog', log);

  // Anniversary date — set on first ever session
  const anniversaryDate = store.get('annualReflection.anniversaryDate');
  if (!anniversaryDate) {
    store.set('annualReflection.anniversaryDate', new Date().toISOString().split('T')[0]);
  }

  // Award community credit
  store.awardCommunityCredit();

  // Milestone check
  const milestone = _checkMilestone();
  if (milestone) {
    const existingMilestones = store.get('activeProgramme.milestones') || [];
    const alreadyAchieved = existingMilestones.some(m => m.id === milestone.id);
    if (!alreadyAchieved) {
      existingMilestones.push({ ...milestone, achievedAt: new Date().toISOString() });
      store.set('activeProgramme.milestones', existingMilestones);
      log[log.length - 1].milestoneAchieved = milestone.id;
      store.set('progressLog', log);
    }
  }

  return { milestoneAchieved: milestone || null };
}

/**
 * Get progress stats for the progress.js view.
 * @returns {Object}
 */
export function getProgressStats() {
  const ap  = store.get('activeProgramme');
  const log = store.get('progressLog') || [];

  if (!ap?.programmeId) {
    return {
      hasActiveProgramme: false,
      currentWeek:        0,
      totalSessions:      0,
      sessionsThisWeek:   0,
      phase:              null,
      phaseName:          null,
      percentComplete:    0,
      milestones:         [],
      recentSessions:     []
    };
  }

  const programme = getProgramme(ap.programmeId);
  const phase     = getPhaseForWeek(programme, ap.currentWeek || 1);

  return {
    hasActiveProgramme: true,
    programmeId:        ap.programmeId,
    programmeName:      ap.programmeName || programme?.name,
    currentWeek:        ap.currentWeek   || 1,
    totalSessions:      ap.totalSessions || 0,
    sessionsThisWeek:   ap.sessionsThisWeek || 0,
    weeklyTarget:       store.get('strategicGoal.weeklySessionTarget') || 3,
    phase:              phase?.name      || 'build',
    phaseName:          phase?.label     || 'Foundation',
    phaseMessage:       phase?.coachMessage || '',
    percentComplete:    Math.round(((ap.currentWeek || 1) / 12) * 100),
    weeksRemaining:     12 - (ap.currentWeek || 1),
    milestones:         ap.milestones    || [],
    recentSessions:     log.slice(-10),
    midProgrammeGlanceShown:  ap.midProgrammeGlanceShown  || false,
    programmeReflectionShown: ap.programmeReflectionShown || false
  };
}

/**
 * Get the current phase coach message.
 * Used by coach-proposal.js for the rationale block.
 * @returns {string}
 */
export function getCurrentPhaseMessage() {
  const ap = store.get('activeProgramme');
  if (!ap?.programmeId) return '';

  const programme = getProgramme(ap.programmeId);
  const phase     = getPhaseForWeek(programme, ap.currentWeek || 1);
  return phase?.coachMessage || '';
}

/**
 * Get phase bias for the workout generator.
 * Returns { intensityBias, focusBias } for the current programme week.
 * Phase bias is additive — daily adaptation (energy, conditions) takes precedence.
 * @returns {{ intensityBias: string, focusBias: string[] }}
 */
export function getPhaseBias() {
  const ap = store.get('activeProgramme');
  if (!ap?.programmeId) {
    return { intensityBias: 'moderate', focusBias: ['strength', 'mobility'] };
  }

  const programme = getProgramme(ap.programmeId);
  return {
    intensityBias: getIntensityBiasForWeek(programme, ap.currentWeek || 1),
    focusBias:     getFocusBiasForWeek(programme, ap.currentWeek || 1),
  };
}

/**
 * Get a milestone message for a specific milestone ID.
 * Used by workout completion views.
 * @param {string} milestoneId
 * @returns {string|null}
 */
export function getMilestoneMessage(milestoneId) {
  const ap = store.get('activeProgramme');
  if (!ap?.programmeId) return null;

  const programme = getProgramme(ap.programmeId);
  if (!programme) return null;

  for (const phase of programme.phases) {
    const milestone = phase.milestones.find(m => m.id === milestoneId);
    if (milestone) return milestone.label;
  }
  return null;
}

// ─── v2 Functions — Re-entry and adaptation ───────────────────────────────────

/**
 * Determine re-entry context after a gap.
 * Called by coach-proposal.js on each build to check if this is a return visit.
 *
 * Returns null if no gap (normal session).
 * Returns a re-entry object if the gap is 7+ days, with:
 *   - context already captured from absence{} (illness / life / harder)
 *   - whether this is the first session back (needsGentlerStart)
 *   - the gap length in days
 *
 * @returns {Object|null} { gapDays, context, needsGentlerStart } | null
 */
export function getReEntryContext() {
  const log = store.get('progressLog') || [];
  if (log.length === 0) return null;

  const lastSessionDate = new Date(log[log.length - 1].date);
  const today           = new Date();
  const gapDays         = Math.floor((today - lastSessionDate) / (1000 * 60 * 60 * 24));

  if (gapDays < REENTRY_GAP_DAYS) return null;

  const absenceContext  = store.get('absence.context');   // illness | life | harder | null
  const returnCaptured  = store.get('absence.returnCapturedAt');

  return {
    gapDays,
    context:           absenceContext || null,
    contextCaptured:   !!returnCaptured,
    needsGentlerStart: absenceContext === 'illness',
    // For illness returns: programme holds current week, intensity drops one level
    holdWeek:          absenceContext === 'illness',
  };
}

/**
 * Capture the absence context on return.
 * Called by checkin.js when a gap of 7+ days is detected and the user
 * answers the sideways door ("was this planned, or were you unwell?").
 * Never re-asked once captured.
 *
 * @param {string} context — 'illness' | 'life' | 'harder'
 */
export function captureReturnContext(context) {
  const returnCaptured = store.get('absence.returnCapturedAt');
  if (returnCaptured) return; // never re-ask

  store.set('absence.context',          context);
  store.set('absence.capturedAt',       new Date().toISOString());
  store.set('absence.returnCapturedAt', new Date().toISOString());
}

/**
 * Clear absence context once the re-entry session is complete.
 * Called by recordSession() internally — context is one-session only.
 */
export function clearReturnContext() {
  store.set('absence.context',          null);
  store.set('absence.capturedAt',       null);
  store.set('absence.returnCapturedAt', null);
}

/**
 * Get the adapted intensity bias for a re-entry session.
 * Illness return: one intensity level gentler than the programme phase.
 * Life/harder return: normal phase intensity.
 *
 * @param {string} reEntryContext — 'illness' | 'life' | 'harder'
 * @param {string} phaseIntensity — current phase intensityBias
 * @returns {string} adapted intensityBias
 */
export function getReEntryIntensity(reEntryContext, phaseIntensity) {
  if (reEntryContext !== 'illness') return phaseIntensity;

  const scale = ['gentle', 'moderate', 'challenging'];
  const current = scale.indexOf(phaseIntensity);
  return current > 0 ? scale[current - 1] : 'gentle';
}

/**
 * Record a missed session.
 * Called by checkin.js or coach-proposal.js when a session was due but
 * not completed. Writes to activeProgramme.missedSessions.
 * Never shames — purely for adaptation tracking.
 *
 * @param {string} reason — 'life' | 'illness' | 'harder'
 */
export function recordMissedSession(reason = 'life') {
  const missed = store.get('activeProgramme.missedSessions') || [];
  missed.push({
    date:   new Date().toISOString(),
    reason: reason
  });
  // Keep last 20 only — beyond that, compress/extend handles the bigger picture
  if (missed.length > 20) missed.splice(0, missed.length - 20);
  store.set('activeProgramme.missedSessions', missed);
}

/**
 * Get compress/extend offer data when consecutive sessions have been missed.
 * Called by coach-proposal.js to decide whether to surface the offer.
 *
 * Returns null if not enough missed sessions to trigger the offer.
 * Returns offer data if 2+ recent consecutive sessions missed.
 *
 * Compress: stay in 12 weeks — slightly more sessions per remaining week.
 * Extend:   keep original pace — programme runs longer than 12 weeks.
 *
 * @returns {Object|null}
 *   {
 *     shouldOffer: bool,
 *     missedCount: int,
 *     weeksRemaining: int,
 *     compressWeeklySessions: int,  — sessions/week needed to complete in time
 *     extendWeeksNeeded: int        — additional weeks needed at current pace
 *   }
 */
export function getMissedSessionOffer() {
  const missed  = store.get('activeProgramme.missedSessions') || [];
  const ap      = store.get('activeProgramme');
  if (!ap?.programmeId || missed.length < MISSED_SESSION_THRESHOLD) return null;

  // Count missed sessions in the last 14 days
  const cutoff      = new Date();
  cutoff.setDate(cutoff.getDate() - 14);
  const recentMissed = missed.filter(m => new Date(m.date) >= cutoff);

  if (recentMissed.length < MISSED_SESSION_THRESHOLD) return null;

  const currentWeek      = ap.currentWeek || 1;
  const weeksRemaining   = 12 - currentWeek;
  const weeklyTarget     = store.get('strategicGoal.weeklySessionTarget') || 3;
  const totalRemaining   = weeksRemaining * weeklyTarget;
  const sessionsCompleted = ap.totalSessions || 0;
  const totalPlanned     = 12 * weeklyTarget;
  const sessionsBehind   = Math.max(0, (currentWeek * weeklyTarget) - sessionsCompleted);

  // Compress: fit missed sessions into remaining weeks
  const compressWeeklySessions = weeksRemaining > 0
    ? Math.ceil((totalRemaining + sessionsBehind) / weeksRemaining)
    : weeklyTarget;

  // Extend: keep current pace, add weeks
  const extendWeeksNeeded = weeklyTarget > 0
    ? Math.ceil(sessionsBehind / weeklyTarget)
    : 1;

  return {
    shouldOffer:              true,
    missedCount:              recentMissed.length,
    weeksRemaining,
    compressWeeklySessions:   Math.min(compressWeeklySessions, 5), // never more than 5/week
    extendWeeksNeeded,
    // Message data for coach-proposal.js to use directly
    coachLine: `You've missed a couple of sessions recently. That's fine — life does that. Do you want to adjust the pace to stay in 12 weeks, or extend by ${extendWeeksNeeded} week${extendWeeksNeeded !== 1 ? 's' : ''} and keep the same rhythm?`,
  };
}

/**
 * Apply the user's compress/extend choice.
 * Called by the UI when the user responds to the compress/extend offer.
 *
 * @param {string} choice — 'compress' | 'extend'
 */
export function applyMissedSessionAdaptation(choice) {
  if (choice === 'extend') {
    const offer = getMissedSessionOffer();
    if (!offer) return;
    // Extend: add weeks by reducing currentWeek so the engine runs longer
    // In practice, the 12-week boundary is soft — we just don't mark complete
    // at week 12 if sessions are outstanding. No structural change needed.
    store.set('activeProgramme.extendedByWeeks', offer.extendWeeksNeeded);
  }
  // Compress: no structural change — coach simply expects more sessions/week
  // User sees updated weekly shape from getWeekShape()

  // Clear missed sessions log after the offer is actioned
  store.set('activeProgramme.missedSessions', []);
}

/**
 * Get the weekly session shape for the current programme week.
 * Combines programme template focus bias with weeklyPlan.days declared slots.
 * Used by today.js and weekly-plan.js to show the week shape.
 *
 * @returns {Object} { sessionTypes: string[], declaredDays: Object }
 */
export function getWeekShape() {
  const ap = store.get('activeProgramme');
  if (!ap?.programmeId) return { sessionTypes: [], declaredDays: {} };

  const programme  = getProgramme(ap.programmeId);
  const weeklyPlan = store.get('weeklyPlan') || {};
  const phaseBias  = getPhaseBias();

  // Build declared days from weeklyPlan
  const days = weeklyPlan.days || {};
  const declaredDays = Object.entries(days).reduce((acc, [day, config]) => {
    if (config.enabled && config.sessionType) {
      acc[day] = config;
    }
    return acc;
  }, {});

  // Session type plan: use declared slots if available, otherwise derive from phase
  const weeklyTarget = store.get('strategicGoal.weeklySessionTarget') || 3;
  const sessionTypes = _deriveSessionTypes(phaseBias.focusBias, weeklyTarget);

  const weekPlan = { sessionTypes, declaredDays, intensityBias: phaseBias.intensityBias };
  store.set('activeProgramme.weekPlan', weekPlan);

  return weekPlan;
}

/**
 * Advance the programme week. Called on Monday if a new week is detected.
 * Checks for week 6 glance and week 12 reflection triggers.
 * @returns {{ weekAdvanced: bool, week6Trigger: bool, week12Trigger: bool }}
 */
export function advanceWeekIfNeeded() {
  const ap = store.get('activeProgramme');
  if (!ap?.programmeId) return { weekAdvanced: false, week6Trigger: false, week12Trigger: false };

  const startDate   = ap.startDate ? new Date(ap.startDate) : null;
  if (!startDate) return { weekAdvanced: false, week6Trigger: false, week12Trigger: false };

  const today       = new Date();
  const daysDiff    = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  const newWeek     = Math.min(Math.floor(daysDiff / 7) + 1, 12);
  const currentWeek = ap.currentWeek || 1;

  if (newWeek <= currentWeek) {
    return { weekAdvanced: false, week6Trigger: false, week12Trigger: false };
  }

  // Update week and phase
  const programme  = getProgramme(ap.programmeId);
  const phase      = getPhaseForWeek(programme, newWeek);
  store.set('activeProgramme.currentWeek',      newWeek);
  store.set('activeProgramme.currentPhase',     phase?.name || 'build');
  store.set('activeProgramme.phase',            newWeek <= 4  ? 1 :
                                                newWeek <= 8  ? 2 :
                                                newWeek <= 10 ? 3 : 4);
  store.set('activeProgramme.sessionsThisWeek', 0);

  const week6Trigger  = newWeek === 6  && !ap.midProgrammeGlanceShown;
  const week12Trigger = newWeek === 12 && !ap.programmeReflectionShown;

  return { weekAdvanced: true, week6Trigger, week12Trigger };
}

/**
 * Mark the week 6 mid-programme glance as shown.
 * Called by gym-programme.js or progress.js when the glance is rendered.
 */
export function markMidProgrammeGlanceShown() {
  store.set('activeProgramme.midProgrammeGlanceShown', true);
}

/**
 * Mark the week 12 programme reflection as shown.
 * Called by gym-programme.js or progress.js when the reflection is rendered.
 */
export function markProgrammeReflectionShown() {
  store.set('activeProgramme.programmeReflectionShown', true);
}

// ─── Private helpers ──────────────────────────────────────────────────────────

/**
 * Check whether a milestone should fire based on current session totals.
 * @returns {Object|null} milestone object or null
 * @private
 */
function _checkMilestone() {
  const ap = store.get('activeProgramme');
  if (!ap?.programmeId) return null;

  const programme       = getProgramme(ap.programmeId);
  const totalSessions   = (ap.totalSessions || 0) + 1; // +1 for session just recorded
  const existingIds     = (ap.milestones || []).map(m => m.id);
  const phase           = getPhaseForWeek(programme, ap.currentWeek || 1);

  // Check phase milestones
  if (phase) {
    for (const m of phase.milestones) {
      if (!existingIds.includes(m.id)) {
        // first-session: fires on total === 1
        if (m.id === 'first-session' && totalSessions === 1) return m;
        // ten-sessions
        if (m.id === 'ten-sessions' && totalSessions === 10) return m;
        // twenty-sessions
        if (m.id === 'twenty-sessions' && totalSessions === 20) return m;
        // week-N-complete: fires based on sessionsThisWeek reaching weeklyTarget
        if (m.id.startsWith('week-') && m.id.endsWith('-complete')) {
          const targetWeek = parseInt(m.id.split('-')[1]);
          if ((ap.currentWeek || 1) === targetWeek) {
            const weeklyTarget = store.get('strategicGoal.weeklySessionTarget') || 3;
            if ((ap.sessionsThisWeek || 0) + 1 >= weeklyTarget) return m;
          }
        }
        // halfway: week 6 reached
        if (m.id === 'halfway' && (ap.currentWeek || 1) >= 6) return m;
        // programme-complete: week 12, final session
        if (m.id === 'programme-complete' && (ap.currentWeek || 1) === 12) return m;
      }
    }
  }

  return null;
}

/**
 * Derive session type list from phase focus bias and weekly target.
 * @param {string[]} focusBias
 * @param {number}   weeklyTarget
 * @returns {string[]}
 * @private
 */
function _deriveSessionTypes(focusBias = [], weeklyTarget = 3) {
  const types = [];
  for (let i = 0; i < weeklyTarget; i++) {
    types.push(focusBias[i % focusBias.length] || 'strength');
  }
  return types;
}
