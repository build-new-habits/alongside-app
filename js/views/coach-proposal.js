/**
 * coach-proposal.js
 * 23 Jun 2026 v6
 *
 * Coach proposal view. The hub. Three doors, all genuinely right.
 *
 * v6 — Phase 5 door reframe (P5-CP-1, P5-CP-2, P5-CP-3):
 *   - Door framing rewritten. Three doors are genuinely different ways of
 *     being in the body today — not intensity variants of the same thing.
 *     One asks something. One works with where you are. One surprises.
 *   - Coach voice on each door. One line. A human observation, specific to today.
 *     All three lines are true. All three are invitations.
 *   - Bypass door: two flavours. Coach facilitates OR straight to library.
 *     Equal visual weight. The product trusting the person to know themselves.
 *   - Post-choice acknowledgement: one line after the choice, treats it as real.
 *     Not a confirmation. Not a summary. An acknowledgement.
 *   - Re-entry surface: compress/extend offer shown when programmeEngine flags it.
 *   - Re-entry gentler start: intensity adjusted for illness returns.
 *   - getActiveVoice() from coach-voice.js (Nurturing in beta for all settings).
 *
 * v5 — workoutGenerator wired. run→running-session. walk→walk-session.
 *   availableTime drives session length. Cycle phase adaptation.
 *   Burnout override. Programme phase bias.
 *
 * All existing wiring preserved exactly. Phase 5 additions are additive.
 *
 * WCAG 2.2 AA:
 *   Three door buttons: aria-label describes session type and duration.
 *   Disabled door: aria-disabled="true", helper text in aria-describedby.
 *   Bypass door: same touch target (min 44px) and contrast as primary doors.
 *   Post-choice acknowledgement: aria-live="polite" region.
 *   Focus management: after choice, focus moves to acknowledgement region.
 *   All coach text is rendered as <p> — not aria-hidden.
 *   Contrast: teal #0D9488 on white meets 4.5:1 for normal text at all sizes.
 */

import { store }             from '../store.js';
import { getActiveVoice, getTimingRules } from '../data/coach-voice.js';
import { getPhaseBias, getReEntryContext, getMissedSessionOffer,
         captureReturnContext, clearReturnContext,
         recordSession, advanceWeekIfNeeded }  from '../data/programmeEngine.js';
import { getProgramme }      from '../data/programmes.js';
import { detectBurnout }     from '../data/checkin.js';
import { getPrimaryEngineGoal } from '../data/goals.js';

// ─── View registration ────────────────────────────────────────────────────────

export function CoachProposalView(router) {

  let proposal      = null;
  let choiceMade    = false;
  let reEntryCtx    = null;
  let missedOffer   = null;

  // ── Mount ──────────────────────────────────────────────────────────────────

  function mount(container) {
    // Advance week if Monday
    advanceWeekIfNeeded();

    // Check re-entry and missed session contexts
    reEntryCtx  = getReEntryContext();
    missedOffer = getMissedSessionOffer();

    // Build the proposal
    proposal = buildProposal();

    render(container);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  function render(container) {
    const voice       = getActiveVoice();
    const name        = store.get('name') || '';
    const tier        = store.get('tier') || 'free';

    container.innerHTML = `
      <div class="cp-view" role="main" aria-label="Your coaching proposal for today">

        <!-- Re-entry banner (illness/long gap) -->
        ${reEntryCtx && !reEntryCtx.contextCaptured ? renderReturnDoor() : ''}

        <!-- Compress/extend offer -->
        ${missedOffer && !choiceMade ? renderMissedOffer(missedOffer) : ''}

        <!-- Coach message block -->
        <div class="cp-coach-block" aria-live="polite">
          <div class="cp-greeting">${proposal.greeting}</div>

          ${proposal.reflection ? `<p class="cp-reflection">${proposal.reflection}</p>` : ''}

          ${proposal.constraint ? `
            <div class="cp-constraint" role="status" aria-live="polite">
              <p>${proposal.constraint}</p>
            </div>` : ''}

          <p class="cp-proposal-intro">${proposal.intro}</p>
        </div>

        <!-- Three doors -->
        <div class="cp-doors" role="group" aria-label="Choose how you want to move today">
          ${renderDoor(proposal.doors[0], 'door-a', proposal.severePainOverride)}
          ${renderDoor(proposal.doors[1], 'door-b', false)}
          ${renderDoor(proposal.doors[2], 'door-c', false)}
        </div>

        <!-- Bypass door -->
        <div class="cp-bypass">
          ${renderBypassDoor(tier)}
        </div>

        <!-- Post-choice acknowledgement (hidden until choice made) -->
        <div class="cp-acknowledgement"
             id="cp-acknowledgement"
             aria-live="polite"
             role="status"
             style="display:none;">
        </div>

      </div>
    `;

    attachEvents(container);
  }

  // ── Door renderer ──────────────────────────────────────────────────────────

  function renderDoor(door, id, disabled) {
    const isDisabled = disabled && door.isOriginal;
    return `
      <button
        class="cp-door ${isDisabled ? 'cp-door--disabled' : ''}"
        id="${id}"
        ${isDisabled ? 'aria-disabled="true" disabled' : ''}
        aria-label="${door.ariaLabel}"
        ${isDisabled ? `aria-describedby="${id}-helper"` : ''}
        data-door="${door.key}"
        data-route="${door.route}"
      >
        <span class="cp-door__label">${door.label}</span>
        <span class="cp-door__line">${door.coachLine}</span>
        <span class="cp-door__meta">${door.meta}</span>
        ${isDisabled ? `<span class="cp-door__helper" id="${id}-helper">${door.disabledReason}</span>` : ''}
      </button>
    `;
  }

  // ── Bypass door renderer ───────────────────────────────────────────────────

  function renderBypassDoor(tier) {
    // Two flavours:
    // 1. Coach facilitates — person knows direction, coach helps build
    // 2. Straight to library — person knows exactly what they want
    return `
      <div class="cp-bypass__label" id="cp-bypass-label">I know what I want today</div>
      <div class="cp-bypass__options" role="group" aria-labelledby="cp-bypass-label">
        <button class="cp-bypass__btn"
                data-door="bypass-facilitate"
                data-route="session-builder"
                aria-label="Help me build it — I know the direction, coach helps shape it">
          Help me build it
        </button>
        <button class="cp-bypass__btn"
                data-door="bypass-library"
                data-route="library"
                aria-label="Take me to the library — I know exactly what I want">
          Take me to the library
        </button>
      </div>
    `;
  }

  // ── Return door renderer ───────────────────────────────────────────────────

  function renderReturnDoor() {
    // Sideways door — never "why did you miss sessions?"
    // "Anything you'd like me to know about the last little while?"
    return `
      <div class="cp-return-door" role="region" aria-label="Welcome back">
        <p class="cp-return-door__message">
          It's good to see you. Anything you'd like me to know about the last little while?
          Completely optional — we can also just begin.
        </p>
        <div class="cp-return-door__chips"
             role="group"
             aria-label="What was the last little while like?">
          <button class="cp-chip" data-return-context="life"
                  aria-pressed="false">Life got full</button>
          <button class="cp-chip" data-return-context="illness"
                  aria-pressed="false">Was unwell</button>
          <button class="cp-chip" data-return-context="harder"
                  aria-pressed="false">Finding it harder</button>
          <button class="cp-chip cp-chip--skip" data-return-context="skip"
                  aria-pressed="false">Rather not say — let's just begin</button>
        </div>
      </div>
    `;
  }

  // ── Missed session offer renderer ──────────────────────────────────────────

  function renderMissedOffer(offer) {
    return `
      <div class="cp-missed-offer" role="region" aria-label="Session adaptation offer">
        <p class="cp-missed-offer__line">${offer.coachLine}</p>
        <div class="cp-missed-offer__choices"
             role="group"
             aria-label="How would you like to adapt?">
          <button class="cp-missed-offer__btn" data-adapt="compress"
                  aria-label="Stay in 12 weeks — ${offer.compressWeeklySessions} sessions per week">
            Stay in 12 weeks
            <span class="cp-missed-offer__sub">${offer.compressWeeklySessions} sessions a week from here</span>
          </button>
          <button class="cp-missed-offer__btn" data-adapt="extend"
                  aria-label="Keep the same rhythm — extend by ${offer.extendWeeksNeeded} week${offer.extendWeeksNeeded !== 1 ? 's' : ''}">
            Keep the same rhythm
            <span class="cp-missed-offer__sub">Extend by ${offer.extendWeeksNeeded} week${offer.extendWeeksNeeded !== 1 ? 's' : ''}</span>
          </button>
        </div>
      </div>
    `;
  }

  // ── Events ─────────────────────────────────────────────────────────────────

  function attachEvents(container) {
    // Door choices
    container.querySelectorAll('[data-door]').forEach(btn => {
      btn.addEventListener('click', e => {
        const doorKey = btn.dataset.door;
        const route   = btn.dataset.route;
        handleDoorChoice(doorKey, route, container);
      });
    });

    // Return context chips
    container.querySelectorAll('[data-return-context]').forEach(btn => {
      btn.addEventListener('click', e => {
        const context = btn.dataset.returnContext;
        handleReturnContext(context, container);
      });
    });

    // Missed session adaptation
    container.querySelectorAll('[data-adapt]').forEach(btn => {
      btn.addEventListener('click', e => {
        const choice = btn.dataset.adapt;
        handleMissedAdaptation(choice, container);
      });
    });
  }

  // ── Door choice handler ────────────────────────────────────────────────────

  function handleDoorChoice(doorKey, route, container) {
    if (choiceMade) return;
    choiceMade = true;

    // Write proposal state to store
    store.set('lastProposalType', doorKey);
    store.set('lastProposalDate', new Date().toISOString());

    // Show post-choice acknowledgement
    const ack = _buildAcknowledgement(doorKey, proposal);
    const ackEl = container.querySelector('#cp-acknowledgement');
    if (ackEl) {
      ackEl.style.display = '';
      ackEl.textContent = ack;
      ackEl.focus();
    }

    // Route after brief pause (acknowledgement reads naturally)
    const timingRules = getTimingRules({ difficultTopic: false });
    setTimeout(() => {
      if (route === 'library') {
        router.navigate('library');
      } else if (route === 'session-builder') {
        router.navigate('session-builder');
      } else if (route) {
        // Pass the door's session data through to the session view
        const door = proposal.doors.find(d => d.key === doorKey);
        if (door?.sessionData) {
          store.set('generatedSession', {
            session: door.sessionData,
            builtAt: new Date().toISOString(),
            inputs:  door.sessionData.inputs || {}
          });
        }
        // Clear absence context after first post-return session choice
        if (reEntryCtx) clearReturnContext();
        router.navigate(route);
      }
    }, timingRules.delayMs + 400);
  }

  // ── Return context handler ─────────────────────────────────────────────────

  function handleReturnContext(context, container) {
    if (context !== 'skip') {
      captureReturnContext(context);
    }

    // Dismiss return door and rebuild proposal with re-entry context applied
    reEntryCtx = getReEntryContext();
    proposal   = buildProposal();

    const returnDoorEl = container.querySelector('.cp-return-door');
    if (returnDoorEl) {
      returnDoorEl.style.display = 'none';
    }

    // Rebuild just the doors section with adapted proposal
    const doorsEl = container.querySelector('.cp-doors');
    if (doorsEl) {
      doorsEl.innerHTML =
        renderDoor(proposal.doors[0], 'door-a', proposal.severePainOverride) +
        renderDoor(proposal.doors[1], 'door-b', false) +
        renderDoor(proposal.doors[2], 'door-c', false);
      attachEvents(container);
    }
  }

  // ── Missed adaptation handler ──────────────────────────────────────────────

  function handleMissedAdaptation(choice, container) {
    const { applyMissedSessionAdaptation } = require('../data/programmeEngine.js');
    applyMissedSessionAdaptation(choice);

    const offerEl = container.querySelector('.cp-missed-offer');
    if (offerEl) offerEl.style.display = 'none';

    missedOffer = null;
  }

  // ── Proposal builder ───────────────────────────────────────────────────────

  /**
   * Build the full proposal object.
   * All existing v5 logic preserved. Phase 5 door reframe applied on top.
   */
  function buildProposal() {
    const voice        = getActiveVoice();
    const name         = store.get('name') || '';
    const energy       = store.get('lastCheckin.feelingWord')
                           ? store.get('lastCheckin.feelingWord')
                           : null;
    const energyScore  = _getCheckinEnergy();
    const moodScore    = _getCheckinMood();
    const painScores   = store.get('conditionPainScores') || {};
    const conditions   = store.get('conditions') || [];
    const goals        = store.get('goals') || [];
    const availTime    = _getAvailableTime();
    const burnout      = detectBurnout(store.get('checkinHistory') || {});
    const phaseBias    = getPhaseBias();
    const primaryGoal  = getPrimaryEngineGoal(goals);
    const feelingWord  = store.get('lastCheckin.feelingWord');

    // Pain override check
    const severePain   = _checkSeverePain(conditions, painScores);
    const moderatePain = _checkModeratePain(conditions, painScores);

    // Re-entry intensity adjustment
    let effectiveIntensity = phaseBias.intensityBias;
    if (reEntryCtx?.needsGentlerStart) {
      const { getReEntryIntensity } = require('../data/programmeEngine.js');
      effectiveIntensity = getReEntryIntensity('illness', effectiveIntensity);
    }

    // Generate three options from workout generator
    let options = _generateOptions(energyScore, burnout, effectiveIntensity, phaseBias, availTime);

    // Build greeting
    const greeting = _buildGreeting(name, feelingWord);

    // Build reflection (last 48h activity)
    const reflection = _buildReflection();

    // Build constraint message if pain is moderate
    const constraint = moderatePain.hasModerate
      ? _buildConstraintMessage(moderatePain, conditions, painScores)
      : null;

    // Build intro line
    const intro = _buildIntro(primaryGoal, feelingWord, burnout, reEntryCtx);

    // Build three doors from options — genuinely different, not intensity variants
    const doors = _buildDoors(options, energyScore, feelingWord, phaseBias,
                              severePain, effectiveIntensity, availTime);

    return {
      greeting,
      reflection,
      constraint,
      intro,
      doors,
      severePainOverride: severePain.hasSevere,
    };
  }

  // ── Door builder — Phase 5 reframe ────────────────────────────────────────

  /**
   * Build three genuinely different doors from the generated options.
   *
   * Philosophy:
   *   Door A — asks something. The effort-and-reward door. Full programme intent.
   *   Door B — meets where you are. Adapted to today's energy and feeling word.
   *   Door C — the surprise. The coach thinks this might land differently today.
   *            Different emotional register. Not intensity — experience.
   *
   * Coach voice on each: one line. Human observation. Specific to this person today.
   * All three are true. All three are invitations. No right answer framing.
   *
   * @param {Array}   options          — generated workout options
   * @param {number}  energyScore
   * @param {string}  feelingWord
   * @param {Object}  phaseBias
   * @param {Object}  severePain
   * @param {string}  effectiveIntensity
   * @param {number}  availTime
   * @returns {Array} three door objects
   */
  function _buildDoors(options, energyScore, feelingWord, phaseBias,
                        severePain, effectiveIntensity, availTime) {
    // Ensure we have at least three options (pad with fallbacks if needed)
    while (options.length < 3) {
      options.push(_getFallbackOption(options.length));
    }

    const [optA, optB, optC] = options;
    const name = store.get('name') || '';

    // Door A — asks something
    const doorA = {
      key:        'door-a',
      label:      optA.label || 'Your session',
      isOriginal: true,
      route:      _routeForOption(optA),
      sessionData: optA,
      coachLine:  _doorALine(optA, feelingWord, phaseBias),
      meta:       _metaLine(optA, availTime),
      ariaLabel:  `${optA.label || 'Your session'} — ${_metaLine(optA, availTime)}`,
      disabledReason: severePain.hasSevere
        ? `Not available today — protecting your ${severePain.affectedZone}.`
        : null,
    };

    // Door B — meets where you are
    const doorB = {
      key:        'door-b',
      label:      optB.label || 'Adjust for today',
      isOriginal: false,
      route:      _routeForOption(optB),
      sessionData: optB,
      coachLine:  _doorBLine(optB, feelingWord, energyScore),
      meta:       _metaLine(optB, availTime),
      ariaLabel:  `${optB.label || 'Adjust for today'} — ${_metaLine(optB, availTime)}`,
      disabledReason: null,
    };

    // Door C — the surprise
    const doorC = {
      key:        'door-c',
      label:      optC.label || 'Something else entirely',
      isOriginal: false,
      route:      _routeForOption(optC),
      sessionData: optC,
      coachLine:  _doorCLine(optC, feelingWord, phaseBias),
      meta:       _metaLine(optC, availTime),
      ariaLabel:  `${optC.label || 'Something different'} — ${_metaLine(optC, availTime)}`,
      disabledReason: null,
    };

    return [doorA, doorB, doorC];
  }

  // ── Door coach lines ───────────────────────────────────────────────────────

  function _doorALine(option, feelingWord, phaseBias) {
    // One line. Why this fits. Specific to today. Effort-and-reward framing.
    const phase = phaseBias.intensityBias;
    if (phase === 'challenging') {
      return 'This is what the programme calls for this week. You\'re ready for it.';
    }
    if (feelingWord && ['energised', 'motivated', 'ready', 'strong', 'confident'].includes(feelingWord)) {
      return 'Your energy today is a good match for this. Worth using it.';
    }
    return 'This fits where you are in the programme. A solid session.';
  }

  function _doorBLine(option, feelingWord, energyScore) {
    // One line. Meets current energy. Not a consolation — a considered match.
    if (feelingWord && ['tired', 'flat', 'heavy', 'drained', 'foggy'].includes(feelingWord)) {
      return `${_cap(feelingWord)} is worth working with, not against. This session is built for that.`;
    }
    if (energyScore <= 4) {
      return 'Lower energy today — this is shaped for it. Nothing wasted, everything intentional.';
    }
    return 'A session that works with where you actually are, not where a plan expects you to be.';
  }

  function _doorCLine(option, feelingWord, phaseBias) {
    // One line. The surprise. Different experience, not just different intensity.
    const label = (option.label || '').toLowerCase();
    if (label.includes('breath') || label.includes('quiet') || label.includes('mindful')) {
      return 'Sometimes the body needs stillness more than movement. This might be that day.';
    }
    if (label.includes('walk') || label.includes('run') || label.includes('outdoor')) {
      return 'There\'s something different about moving through space rather than through a session.';
    }
    if (label.includes('yoga') || label.includes('mobil') || label.includes('stretch')) {
      return 'The muscles have been working. This is the other side of that work.';
    }
    return 'Worth trying. The coach thinks this might land differently than expected today.';
  }

  // ── Post-choice acknowledgement ────────────────────────────────────────────

  function _buildAcknowledgement(doorKey, proposal) {
    // One line. Treats the choice as real. Not a confirmation or summary.
    // Never "great choice!" — the choice was theirs. Just acknowledgement.
    if (doorKey === 'door-a') {
      return 'Good. Let\'s go.';
    }
    if (doorKey === 'door-b') {
      return 'Noted. A session that fits today.';
    }
    if (doorKey === 'door-c') {
      return 'Good call. Something a bit different.';
    }
    if (doorKey === 'bypass-facilitate') {
      return 'Let\'s build it together.';
    }
    if (doorKey === 'bypass-library') {
      return 'Go find what you need. I\'ll be here when you\'re done.';
    }
    return 'On your way.';
  }

  // ── Greeting ───────────────────────────────────────────────────────────────

  function _buildGreeting(name, feelingWord) {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Morning'
                       : hour < 17 ? 'Afternoon'
                       : 'Evening';
    const displayName = name ? `, ${name}` : '';

    // If re-entry, greeting acknowledges it without making the gap the subject
    if (reEntryCtx && !reEntryCtx.contextCaptured) {
      return `Good to see you${displayName}.`;
    }

    return `${timeGreeting}${displayName}.`;
  }

  // ── Reflection (last 48h activity) ────────────────────────────────────────

  function _buildReflection() {
    const activityLog = store.get('activityLog') || [];
    const cutoff      = Date.now() - (48 * 60 * 60 * 1000);
    const recent      = activityLog.filter(entry => {
      const ts = entry.completedAt || entry.loggedAt || entry.date;
      return ts && new Date(ts).getTime() > cutoff;
    });

    if (recent.length === 0) return null;

    const ACTIVITY_LABELS = {
      'workout':          'strength work',
      'morning-session':  'morning movement',
      'yoga-session':     'yoga',
      'walk-session':     'a walk',
      'running-session':  'a run',
      'cycle-session':    'cycling',
      'swim-session':     'swimming',
      'core-session':     'core work',
      'quiet-session':    'a breathing session',
      'breathing-session':'a breathing session',
      'gym-programme':    'gym work',
    };

    // Deduplicate by type
    const typesSeen = new Set();
    const uniqueTypes = [];
    recent.forEach(entry => {
      const type = entry.type || entry.activityType || 'movement';
      if (!typesSeen.has(type)) {
        typesSeen.add(type);
        uniqueTypes.push(ACTIVITY_LABELS[type] || type);
      }
    });

    const voice = getActiveVoice();

    if (uniqueTypes.length === 1) {
      return `Since yesterday, you did ${uniqueTypes[0]}.`;
    }
    if (uniqueTypes.length === 2) {
      return `Since yesterday, you did ${uniqueTypes[0]} and ${uniqueTypes[1]}.`;
    }
    const last = uniqueTypes.pop();
    return `Since yesterday, you did ${uniqueTypes.join(', ')}, and ${last}.`;
  }

  // ── Intro line ─────────────────────────────────────────────────────────────

  function _buildIntro(primaryGoal, feelingWord, burnout, reEntryCtx) {
    if (burnout) {
      return 'Your body has been running low. Today is for gentle movement only.';
    }
    if (reEntryCtx?.needsGentlerStart) {
      return 'Welcome back. Starting gently — that\'s the right call after being unwell.';
    }
    if (reEntryCtx && reEntryCtx.gapDays >= 7) {
      return 'Good to have you back. Here\'s what I\'d suggest for today.';
    }

    // Goal-connected intro
    const goalIntros = {
      'feel-good':       'Here\'s what might help you feel it today.',
      'build-muscle':    'Three options for today — the programme is building.',
      'weight-loss':     'Here\'s today — three different ways to move.',
      'improve-cardio':  'Three options. All of them move the cardio work forward.',
      'flexibility':     'Three ways to work on range and ease today.',
      'balance':         'Three options — all of them build the stability work.',
      'injury-recovery': 'Three options — all adapted to where your body is today.',
      'return-to-fitness': 'Three options for today. All of them count.',
    };

    return goalIntros[primaryGoal] || 'Here\'s what I\'d suggest for today.';
  }

  // ── Pain checks ────────────────────────────────────────────────────────────

  function _checkSeverePain(conditions, painScores) {
    const severeConditions = conditions.filter(id => (painScores[id] || 0) >= 7);
    if (severeConditions.length === 0) return { hasSevere: false };

    const worstId    = severeConditions[0];
    const painLevel  = painScores[worstId];

    return {
      hasSevere:     true,
      affectedZone:  worstId,
      painLevel,
    };
  }

  function _checkModeratePain(conditions, painScores) {
    const moderateConditions = conditions.filter(
      id => (painScores[id] || 0) >= 4 && (painScores[id] || 0) < 7
    );
    return { hasModerate: moderateConditions.length > 0, conditions: moderateConditions };
  }

  function _buildConstraintMessage(moderatePain, conditions, painScores) {
    const id        = moderatePain.conditions[0];
    const painLevel = painScores[id] || 4;
    return `Your check-in flagged ${id} today (${painLevel}/10). I\'ve worked around that.`;
  }

  // ── Option generation ──────────────────────────────────────────────────────

  function _generateOptions(energyScore, burnout, intensity, phaseBias, availTime) {
    // Import workoutGenerator dynamically to avoid circular dependency issues
    try {
      const wg = window._workoutGenerator;
      if (wg && typeof wg.generateDailyOptions === 'function') {
        return wg.generateDailyOptions({
          energy:         energyScore,
          burnout,
          intensityBias:  intensity,
          focusBias:      phaseBias.focusBias,
          availableTime:  availTime,
        });
      }
    } catch (e) {
      console.warn('coach-proposal: workoutGenerator unavailable, using fallbacks', e);
    }
    return _getFallbackOptions(energyScore, intensity);
  }

  function _getFallbackOptions(energyScore, intensity) {
    const availMins = _getAvailableTime() || 30;
    // Safe fallbacks when generator is unavailable
    if (energyScore <= 3 || intensity === 'gentle') {
      return [
        { label: 'Gentle movement',   type: 'workout',       durationMins: Math.min(20, availMins) },
        { label: 'Breathing session', type: 'quiet-session', durationMins: Math.min(15, availMins) },
        { label: 'Short walk',        type: 'walk-session',  durationMins: Math.min(20, availMins) },
      ];
    }
    return [
      { label: 'Strength session',  type: 'workout',       durationMins: Math.min(35, availMins) },
      { label: 'Mobility work',     type: 'yoga-session',  durationMins: Math.min(25, availMins) },
      { label: 'Breathing session', type: 'quiet-session', durationMins: Math.min(15, availMins) },
    ];
  }

  function _getFallbackOption(index) {
    return [
      { label: 'Mobility', type: 'yoga-session', durationMins: 20 },
      { label: 'Breathing', type: 'quiet-session', durationMins: 15 },
      { label: 'Short walk', type: 'walk-session', durationMins: 20 },
    ][index] || { label: 'Movement', type: 'workout', durationMins: 20 };
  }

  function _routeForOption(option) {
    const TYPE_TO_ROUTE = {
      'workout':          'workout',
      'morning-session':  'morning-session',
      'yoga-session':     'yoga-session',
      'walk-session':     'walk-session',
      'running-session':  'running-session',
      'cycle-session':    'cycle-session',
      'swim-session':     'swim-session',
      'core-session':     'core-session',
      'quiet-session':    'quiet-session',
      'gym-programme':    'gym-programme',
    };
    return TYPE_TO_ROUTE[option.type] || 'workout';
  }

  function _metaLine(option, availTime) {
    const mins = option.durationMins || availTime || 30;
    return `About ${mins} minutes`;
  }

  // ── Store helpers ──────────────────────────────────────────────────────────

  function _getCheckinEnergy() {
    const history = store.get('checkinHistory') || {};
    const today   = new Date().toISOString().split('T')[0];
    return history[today]?.energy || store.get('lastCheckin.energy') || 5;
  }

  function _getCheckinMood() {
    const history = store.get('checkinHistory') || {};
    const today   = new Date().toISOString().split('T')[0];
    return history[today]?.mood || store.get('lastCheckin.mood') || 5;
  }

  function _getAvailableTime() {
    const history = store.get('checkinHistory') || {};
    const today   = new Date().toISOString().split('T')[0];
    return history[today]?.availableTime
        || store.get('lastCheckin.availableTime')
        || 30;
  }

  // ── Utilities ──────────────────────────────────────────────────────────────

  function _cap(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ── Public interface ───────────────────────────────────────────────────────

  return { mount };
}
