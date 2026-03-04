/**
 * programmeEngine.js - Strategic layer logic
 *
 * Responsibilities:
 *   - Start a programme (write to store)
 *   - Get current phase and week
 *   - Detect newly achieved milestones
 *   - Advance week on Monday reset
 *   - Generate the strategic rationale line for workoutGenerator
 *   - Calculate progress stats for the progress dashboard
 *
 * Import path from views: ../data/programmeEngine.js
 * Import path from data/: ./programmeEngine.js
 */

import { store } from '../store.js';
import { getProgramme, getPhaseForWeek, getAllMilestones } from './programmes.js';

export const programmeEngine = {

  /**
   * Start a programme — called from goal-setup view on confirmation
   */
  startProgramme(programmeId, strategicGoalData) {
    const programme = getProgramme(programmeId);
    if (!programme) {
      console.error('programmeEngine: unknown programme', programmeId);
      return false;
    }

    const startDate = new Date().toISOString();
    const firstPhase = programme.phases[0];

    // Write strategic goal
    store.set('strategicGoal', {
      primaryGoal:         strategicGoalData.primaryGoal         || null,
      targetDescription:   strategicGoalData.targetDescription   || '',
      targetDate:          strategicGoalData.targetDate          || null,
      targetValue:         strategicGoalData.targetValue         || null,
      targetUnit:          strategicGoalData.targetUnit          || null,
      weeklySessionTarget: strategicGoalData.weeklySessionTarget || 3,
      setAt:               startDate
    });

    // Write active programme
    store.set('activeProgramme', {
      programmeId:      programme.id,
      programmeName:    programme.name,
      startDate:        startDate,
      currentWeek:      1,
      currentPhase:     firstPhase.name,
      sessionsThisWeek: 0,
      totalSessions:    0,
      milestones:       [],
      completed:        false,
      completedAt:      null
    });

    console.log(`🏃 Programme started: ${programme.name}`);
    return true;
  },

  /**
   * Get the current programme object (template data)
   */
  getCurrentProgramme() {
    const ap = store.get('activeProgramme');
    if (!ap?.programmeId) return null;
    return getProgramme(ap.programmeId);
  },

  /**
   * Get the current phase object
   */
  getCurrentPhase() {
    const ap = store.get('activeProgramme');
    const programme = this.getCurrentProgramme();
    if (!ap || !programme) return null;
    return getPhaseForWeek(programme, ap.currentWeek);
  },

  /**
   * Called after each completed session
   * Increments counters, checks milestones, advances week if needed
   * Returns any newly achieved milestone (or null)
   */
  recordSession(sessionFocus) {
    const ap = store.get('activeProgramme');
    if (!ap?.programmeId) return null;

    const programme = this.getCurrentProgramme();
    if (!programme) return null;

    // Increment counters
    const totalSessions    = (ap.totalSessions    || 0) + 1;
    const sessionsThisWeek = (ap.sessionsThisWeek || 0) + 1;
    const weeklyTarget     = store.get('strategicGoal.weeklySessionTarget') || 3;

    // Check if week should advance
    let currentWeek  = ap.currentWeek;
    let newThisWeek  = sessionsThisWeek;

    if (sessionsThisWeek >= weeklyTarget) {
      // Advance to next week (cap at 12)
      currentWeek = Math.min(currentWeek + 1, 12);
      newThisWeek = 0;
    }

    // Update current phase
    const currentPhase = getPhaseForWeek(programme, currentWeek)?.name || ap.currentPhase;

    // Check completion
    const completed   = currentWeek >= 12 && sessionsThisWeek >= weeklyTarget;
    const completedAt = completed ? new Date().toISOString() : null;

    // Check milestones
    const newMilestone = this.checkMilestones(programme, totalSessions, currentWeek, sessionsThisWeek, ap.milestones || []);
    const milestones   = [...(ap.milestones || [])];
    if (newMilestone) {
      milestones.push({ id: newMilestone.id, label: newMilestone.label, achievedAt: new Date().toISOString() });
    }

    // Write back to store
    store.set('activeProgramme', {
      ...ap,
      currentWeek,
      currentPhase,
      sessionsThisWeek: newThisWeek,
      totalSessions,
      milestones,
      completed,
      completedAt
    });

    return newMilestone || null;
  },

  /**
   * Check if any new milestone has just been reached
   * Returns milestone object or null
   */
  checkMilestones(programme, totalSessions, currentWeek, sessionsThisWeek, alreadyAchieved) {
    const achievedIds = alreadyAchieved.map(m => m.id);
    const allMilestones = getAllMilestones(programme);

    for (const m of allMilestones) {
      if (achievedIds.includes(m.id)) continue;

      // Milestone trigger rules
      if (m.id === 'first-session'   && totalSessions === 1)        return m;
      if (m.id === 'week-2-complete' && currentWeek === 3)          return m; // just finished week 2
      if (m.id === 'week-4-complete' && currentWeek === 5)          return m;
      if (m.id === 'halfway'         && currentWeek === 7)          return m;
      if (m.id === 'ten-sessions'    && totalSessions === 10)       return m;
      if (m.id === 'twenty-sessions' && totalSessions === 20)       return m;
      if (m.id === 'programme-complete' && currentWeek >= 12
          && sessionsThisWeek >= (store.get('strategicGoal.weeklySessionTarget') || 3)) return m;
    }

    return null;
  },

  /**
   * Reset weekly session count — call this on Monday (checked in app.js init)
   */
  resetWeeklyCountIfNeeded() {
    const ap = store.get('activeProgramme');
    if (!ap?.programmeId) return;

    const lastReset = ap.lastWeeklyReset;
    const now       = new Date();
    const monday    = this.getMondayOfWeek(now);

    if (!lastReset || new Date(lastReset) < monday) {
      store.set('activeProgramme', {
        ...ap,
        sessionsThisWeek: 0,
        lastWeeklyReset:  now.toISOString()
      });
    }
  },

  getMondayOfWeek(date) {
    const d   = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  },

  /**
   * Generate the strategic rationale line for workoutGenerator
   * Returns a plain string, or null if no programme is active
   */
  getStrategicRationale(focus) {
    const ap = store.get('activeProgramme');
    if (!ap?.programmeId) return null;

    const phase     = this.getCurrentPhase();
    const goal      = store.get('strategicGoal');
    const programme = this.getCurrentProgramme();

    if (!phase || !programme) return null;

    const weekLabel  = `Week ${ap.currentWeek} of ${programme.name}`;
    const phaseLabel = phase.label;

    // Focus-to-goal connection lines
    const connections = {
      strength: {
        'lose-weight':    'Strength sessions raise your metabolism — this counts toward your goal.',
        'build-habit':    'Showing up for strength work is exactly what building a habit looks like.',
        'reduce-pain':    'Controlled strength work builds the support your body needs.',
        'improve-cardio': 'Strength supports your cardio capacity — these sessions connect.',
        'default':        'Building strength this week — every session adds up.'
      },
      cardio: {
        'lose-weight':    'Cardio burns energy and builds the stamina your goal needs.',
        'improve-cardio': 'This is the core of your goal — cardio capacity building directly.',
        'run-5k':         'Every cardio session moves you closer to that 5K.',
        'build-habit':    'Cardio sessions build the routine your goal depends on.',
        'default':        'Cardio work this week — your heart and lungs are adapting.'
      },
      mobility: {
        'reduce-pain':    'Mobility work reduces pain and improves movement range — this is treatment, not a warmup.',
        'lose-weight':    'Recovery and mobility keep you able to train consistently — they support your goal.',
        'build-habit':    'Mobility sessions count. Consistency across all types is what builds the habit.',
        'default':        'Mobility work reduces injury risk and keeps you moving freely.'
      }
    };

    const goalId     = goal?.primaryGoal || 'default';
    const focusMap   = connections[focus] || connections.strength;
    const connection = focusMap[goalId] || focusMap['default'];

    return `${weekLabel} — ${phaseLabel} phase. ${connection}`;
  },

  /**
   * Get workout focus bias for current phase
   * Returns { primaryFocus, secondaryFocus } or null
   */
  getPhaseBias() {
    const phase = this.getCurrentPhase();
    if (!phase) return null;
    return {
      primaryFocus:   phase.focusBias[0] || null,
      secondaryFocus: phase.focusBias[1] || null,
      intensityBias:  phase.intensityBias || 'moderate'
    };
  },

  /**
   * Progress stats for the dashboard
   */
  getProgressStats() {
    const ap  = store.get('activeProgramme');
    const log = store.get('progressLog') || [];
    const sg  = store.get('strategicGoal');

    if (!ap?.programmeId) return null;

    const programme     = this.getCurrentProgramme();
    const totalWeeks    = programme?.durationWeeks || 12;
    const weeklyTarget  = sg?.weeklySessionTarget || 3;
    const pctComplete   = Math.round(((ap.currentWeek - 1) / totalWeeks) * 100);

    // Last 4 weeks of sessions
    const recentLog = log.slice(-28);

    // Average energy over last 7 sessions
    const last7 = log.slice(-7);
    const avgEnergy = last7.length
      ? Math.round(last7.reduce((s, e) => s + (e.energyAtCheckin || 5), 0) / last7.length * 10) / 10
      : null;

    // Sessions this week
    const sessionsThisWeek = ap.sessionsThisWeek || 0;

    return {
      programmeName:    ap.programmeName,
      currentWeek:      ap.currentWeek,
      totalWeeks,
      currentPhase:     ap.currentPhase,
      pctComplete,
      totalSessions:    ap.totalSessions || 0,
      sessionsThisWeek,
      weeklyTarget,
      milestonesCount:  (ap.milestones || []).length,
      avgEnergy,
      recentLog,
      daysUntilTarget:  this.getDaysUntilTarget(sg?.targetDate)
    };
  },

  getDaysUntilTarget(targetDate) {
    if (!targetDate) return null;
    const diff = new Date(targetDate) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
};
