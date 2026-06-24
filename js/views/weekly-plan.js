/**
 * weekly-plan.js
 * 23 Jun 2026 v2
 *
 * Weekly plan view. The user's declared week shape.
 * v2 wires the plan into programme sequencing — the engine reads it.
 *
 * v2 — Phase 5 (P5-PROG-2):
 *   - getWeekShape() called on mount — reads programme phase and merges
 *     with user-declared day slots
 *   - Writes activeProgramme.weekPlan and activeProgramme.sessionSequence
 *   - Day configuration flow: tap a day → configure type / duration / location
 *   - Shows today highlighted
 *   - Coach line per day type (gym / rest / recovery / class / open)
 *   - Weekly session count vs target shown at top
 *
 * v1 — Initial weekly plan build (May 2026). 7-day grid. Store integration.
 *
 * Day types:
 *   open      — no plan yet (default)
 *   gym       — structured session (routes to session builder or proposal)
 *   rest      — intentional rest (coach validates it)
 *   recovery  — light movement (yoga, walk, swim, mindfulness)
 *   class     — external class or activity (log on return)
 *
 * Plan behaviour:
 *   - Coach proposal reads today's slot before generating
 *   - Rest day: coach validates, offers Noticing Hub / breathing
 *   - Recovery day: coach offers light movement options
 *   - Class day: coach acknowledges class, offers "log it" on return
 *   - Gym day: coach uses plan as session intent, still adapts to check-in
 *   - Open: coach behaves as if no plan (normal check-in led flow)
 *
 * WCAG 2.2 AA:
 *   Day buttons: aria-label includes day name, type, and whether today.
 *   Today marker: announced via aria-label suffix " — today".
 *   Configuration sheet: role="dialog", aria-modal, focus trap, Escape closes.
 *   Session type chips: role="radiogroup", each chip role="radio" aria-checked.
 *   Duration chips: same pattern.
 *   Save button: aria-label describes what is being saved.
 *   All touch targets minimum 44px.
 */

import { store }        from '../store.js';
import { getWeekShape } from '../data/programmeEngine.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

const DAY_LABELS = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
  thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun'
};

const DAY_FULL = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday'
};

const TYPE_CONFIG = {
  open:     { label: 'Open',     icon: '○', coachLine: 'No plan for today — coach will ask at check-in.' },
  gym:      { label: 'Session',  icon: '●', coachLine: 'A movement session. Coach will shape it from your check-in.' },
  rest:     { label: 'Rest',     icon: '—', coachLine: 'Intentional rest. Just as important as movement.' },
  recovery: { label: 'Recovery', icon: '◌', coachLine: 'Light movement — walk, yoga, breathing. Coach will offer options.' },
  class:    { label: 'Class',    icon: '◆', coachLine: 'You have something planned. Log it when you\'re back.' },
};

const DURATION_OPTIONS = [15, 20, 30, 45, 60];

const SESSION_TYPES = [
  { id: 'strength',    label: 'Strength'    },
  { id: 'cardio',      label: 'Cardio'      },
  { id: 'yoga',        label: 'Yoga'        },
  { id: 'walk',        label: 'Walk'        },
  { id: 'run',         label: 'Run'         },
  { id: 'swim',        label: 'Swim'        },
  { id: 'cycle',       label: 'Cycle'       },
  { id: 'core',        label: 'Core'        },
  { id: 'mindfulness', label: 'Mindfulness' },
];

// ─── View registration ────────────────────────────────────────────────────────

export function WeeklyPlanView(router) {

  let configuringDay = null; // day string being configured in sheet

  // ── Mount ──────────────────────────────────────────────────────────────────

  function mount(container) {
    // Sync week shape from programme engine on every mount
    _syncWeekShape();
    render(container);
  }

  // ── Sync week shape ────────────────────────────────────────────────────────

  function _syncWeekShape() {
    const hasActiveProgramme = store.hasActiveProgramme();
    if (!hasActiveProgramme) return;

    // getWeekShape() writes activeProgramme.weekPlan and returns shape
    const shape = getWeekShape();

    // Build session sequence from declared days + programme suggestion
    const weeklyPlan   = store.get('weeklyPlan') || {};
    const days         = weeklyPlan.days || {};
    const sessionTypes = shape.sessionTypes || [];

    // Fill declared gym days with programme-suggested session types
    let sequenceIndex = 0;
    const sessionSequence = DAYS.map(day => {
      const slot = days[day] || {};
      if (slot.type === 'gym' && !slot.sessionType && sessionTypes[sequenceIndex]) {
        const suggestedType = sessionTypes[sequenceIndex];
        sequenceIndex++;
        return { day, type: suggestedType, declaredDuration: slot.durationMins, completed: false };
      }
      if (slot.type === 'gym' && slot.sessionType) {
        sequenceIndex++;
        return { day, type: slot.sessionType, declaredDuration: slot.durationMins, completed: false };
      }
      return null;
    }).filter(Boolean);

    store.set('activeProgramme.sessionSequence', sessionSequence);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  function render(container) {
    const weeklyPlan    = store.get('weeklyPlan') || {};
    const days          = weeklyPlan.days || {};
    const today         = _todayDayName();
    const weeklyTarget  = store.get('strategicGoal.weeklySessionTarget') || 3;
    const plannedCount  = DAYS.filter(d => days[d]?.type === 'gym').length;

    container.innerHTML = `
      <div class="weekly-plan-view" role="main" aria-label="Your weekly plan">

        <header class="wp-header">
          <h1 class="wp-title">My Week</h1>
          <p class="wp-subtitle">
            ${plannedCount} session${plannedCount !== 1 ? 's' : ''} planned
            ${weeklyTarget ? `— aiming for ${weeklyTarget}` : ''}
          </p>
        </header>

        <!-- 7-day grid -->
        <div class="wp-grid" role="list" aria-label="Days of the week">
          ${DAYS.map(day => renderDaySlot(day, days[day] || {}, day === today)).join('')}
        </div>

        <!-- Legend -->
        <div class="wp-legend" aria-label="Day type key">
          ${Object.entries(TYPE_CONFIG).map(([type, config]) => `
            <span class="wp-legend__item">
              <span class="wp-legend__icon" aria-hidden="true">${config.icon}</span>
              <span class="wp-legend__label">${config.label}</span>
            </span>
          `).join('')}
        </div>

        <!-- Week toggle -->
        <div class="wp-toggle-row">
          <label class="settings-label" for="wp-plan-toggle">
            Use this plan
            <span class="settings-label__sub">Coach reads this before every session</span>
          </label>
          <button
            class="settings-toggle ${weeklyPlan.enabled ? 'settings-toggle--on' : ''}"
            id="wp-plan-toggle"
            role="switch"
            aria-checked="${weeklyPlan.enabled ? 'true' : 'false'}"
            data-action="toggle-plan"
            aria-label="Weekly plan ${weeklyPlan.enabled ? 'on' : 'off'}">
            <span class="settings-toggle__track" aria-hidden="true"></span>
          </button>
        </div>

        <!-- Configuration sheet (hidden by default) -->
        <div id="wp-config-sheet"
             class="wp-config-sheet"
             role="dialog"
             aria-modal="true"
             aria-labelledby="wp-config-title"
             hidden>
        </div>

      </div>
    `;

    attachEvents(container);
  }

  // ── Day slot renderer ──────────────────────────────────────────────────────

  function renderDaySlot(day, slot, isToday) {
    const type    = slot.type || 'open';
    const config  = TYPE_CONFIG[type] || TYPE_CONFIG.open;
    const label   = slot.label || config.label;
    const duration = slot.durationMins ? `${slot.durationMins}m` : '';
    const actName  = slot.activityName || '';

    return `
      <div class="wp-day-slot ${isToday ? 'wp-day-slot--today' : ''} wp-day-slot--${type}"
           role="listitem">
        <button
          class="wp-day-btn"
          data-day="${day}"
          aria-label="${DAY_FULL[day]}${isToday ? ' — today' : ''}: ${label}${duration ? ', ' + duration : ''}. Tap to configure.">
          <span class="wp-day-btn__name" aria-hidden="true">${DAY_LABELS[day]}</span>
          <span class="wp-day-btn__icon" aria-hidden="true">${config.icon}</span>
          <span class="wp-day-btn__label" aria-hidden="true">${actName || label}</span>
          ${duration ? `<span class="wp-day-btn__duration" aria-hidden="true">${duration}</span>` : ''}
          ${isToday ? `<span class="wp-day-today-marker" aria-hidden="true">Today</span>` : ''}
        </button>
      </div>
    `;
  }

  // ── Configuration sheet ────────────────────────────────────────────────────

  function renderConfigSheet(day) {
    const weeklyPlan = store.get('weeklyPlan') || {};
    const slot       = weeklyPlan.days?.[day] || {};
    const type       = slot.type || 'open';
    const duration   = slot.durationMins || 30;
    const sessionType = slot.sessionType || '';
    const activityName = slot.activityName || '';

    return `
      <div class="wp-config-sheet__backdrop"></div>
      <div class="wp-config-sheet__content">
        <h2 class="wp-config-sheet__title" id="wp-config-title">${DAY_FULL[day]}</h2>

        <!-- Day type selection -->
        <div class="wp-config-section">
          <p class="wp-config-section__label" id="wp-type-label">What kind of day?</p>
          <div class="wp-config-chips"
               role="radiogroup"
               aria-labelledby="wp-type-label">
            ${Object.entries(TYPE_CONFIG).map(([t, cfg]) => `
              <button
                class="wp-chip ${type === t ? 'wp-chip--selected' : ''}"
                role="radio"
                aria-checked="${type === t ? 'true' : 'false'}"
                data-type-choice="${t}"
                aria-label="${cfg.label}">
                <span aria-hidden="true">${cfg.icon}</span>
                ${cfg.label}
              </button>
            `).join('')}
          </div>
          <p class="wp-config-section__coach-line" id="wp-coach-line">
            ${TYPE_CONFIG[type]?.coachLine || ''}
          </p>
        </div>

        <!-- Duration (shown for gym and recovery) -->
        ${type === 'gym' || type === 'recovery' ? `
          <div class="wp-config-section" id="wp-duration-section">
            <p class="wp-config-section__label" id="wp-duration-label">How long?</p>
            <div class="wp-config-chips"
                 role="radiogroup"
                 aria-labelledby="wp-duration-label">
              ${DURATION_OPTIONS.map(mins => `
                <button
                  class="wp-chip ${duration === mins ? 'wp-chip--selected' : ''}"
                  role="radio"
                  aria-checked="${duration === mins ? 'true' : 'false'}"
                  data-duration-choice="${mins}"
                  aria-label="${mins} minutes">
                  ${mins}m
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Session type (shown for gym only) -->
        ${type === 'gym' ? `
          <div class="wp-config-section" id="wp-session-type-section">
            <p class="wp-config-section__label" id="wp-session-type-label">
              Session type <span class="wp-config-section__optional">(optional)</span>
            </p>
            <div class="wp-config-chips"
                 role="radiogroup"
                 aria-labelledby="wp-session-type-label">
              <button
                class="wp-chip ${!sessionType ? 'wp-chip--selected' : ''}"
                role="radio"
                aria-checked="${!sessionType ? 'true' : 'false'}"
                data-session-type-choice=""
                aria-label="Let the coach decide">
                Coach decides
              </button>
              ${SESSION_TYPES.map(st => `
                <button
                  class="wp-chip ${sessionType === st.id ? 'wp-chip--selected' : ''}"
                  role="radio"
                  aria-checked="${sessionType === st.id ? 'true' : 'false'}"
                  data-session-type-choice="${st.id}"
                  aria-label="${st.label}">
                  ${st.label}
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Activity name (shown for class only) -->
        ${type === 'class' ? `
          <div class="wp-config-section">
            <label class="wp-config-section__label" for="wp-activity-name">
              What's the class? <span class="wp-config-section__optional">(optional)</span>
            </label>
            <input
              class="settings-input"
              id="wp-activity-name"
              type="text"
              value="${_esc(activityName)}"
              placeholder="e.g. Pilates, boxing, park run"
              aria-label="Activity or class name">
          </div>
        ` : ''}

        <div class="wp-config-sheet__actions">
          <button class="btn btn-ghost" id="wp-config-cancel" aria-label="Cancel">Cancel</button>
          <button class="btn btn-primary" id="wp-config-save"
                  aria-label="Save ${DAY_FULL[day]} plan">Save</button>
        </div>
      </div>
    `;
  }

  // ── Events ─────────────────────────────────────────────────────────────────

  function attachEvents(container) {
    // Day slot taps → open config sheet
    container.querySelectorAll('[data-day]').forEach(btn => {
      btn.addEventListener('click', () => {
        configuringDay = btn.dataset.day;
        openConfigSheet(btn.dataset.day, container);
      });
    });

    // Plan toggle
    const toggle = container.querySelector('[data-action="toggle-plan"]');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const current = store.get('weeklyPlan.enabled') || false;
        store.set('weeklyPlan.enabled', !current);
        toggle.setAttribute('aria-checked', (!current).toString());
        toggle.classList.toggle('settings-toggle--on', !current);
      });
    }
  }

  // ── Config sheet open/close ────────────────────────────────────────────────

  function openConfigSheet(day, container) {
    const sheet = container.querySelector('#wp-config-sheet');
    if (!sheet) return;

    sheet.innerHTML = renderConfigSheet(day);
    sheet.removeAttribute('hidden');

    // Focus first interactive element
    const first = sheet.querySelector('button, input');
    if (first) first.focus();

    // Trap focus
    sheet.addEventListener('keydown', trapFocus);

    // Close on backdrop
    sheet.querySelector('.wp-config-sheet__backdrop')?.addEventListener('click', () => closeConfigSheet(container));

    // Close on Escape
    sheet.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeConfigSheet(container);
    });

    // Type chips → update coach line + show/hide sections
    sheet.querySelectorAll('[data-type-choice]').forEach(btn => {
      btn.addEventListener('click', () => {
        sheet.querySelectorAll('[data-type-choice]').forEach(b => {
          b.setAttribute('aria-checked', 'false');
          b.classList.remove('wp-chip--selected');
        });
        btn.setAttribute('aria-checked', 'true');
        btn.classList.add('wp-chip--selected');
        const chosenType = btn.dataset.typeChoice;
        const coachLine  = sheet.querySelector('#wp-coach-line');
        if (coachLine) coachLine.textContent = TYPE_CONFIG[chosenType]?.coachLine || '';
      });
    });

    // Duration chips
    sheet.querySelectorAll('[data-duration-choice]').forEach(btn => {
      btn.addEventListener('click', () => {
        sheet.querySelectorAll('[data-duration-choice]').forEach(b => {
          b.setAttribute('aria-checked', 'false');
          b.classList.remove('wp-chip--selected');
        });
        btn.setAttribute('aria-checked', 'true');
        btn.classList.add('wp-chip--selected');
      });
    });

    // Session type chips
    sheet.querySelectorAll('[data-session-type-choice]').forEach(btn => {
      btn.addEventListener('click', () => {
        sheet.querySelectorAll('[data-session-type-choice]').forEach(b => {
          b.setAttribute('aria-checked', 'false');
          b.classList.remove('wp-chip--selected');
        });
        btn.setAttribute('aria-checked', 'true');
        btn.classList.add('wp-chip--selected');
      });
    });

    // Cancel
    sheet.querySelector('#wp-config-cancel')?.addEventListener('click', () => closeConfigSheet(container));

    // Save
    sheet.querySelector('#wp-config-save')?.addEventListener('click', () => {
      saveConfigSheet(day, sheet, container);
    });
  }

  function closeConfigSheet(container) {
    const sheet = container.querySelector('#wp-config-sheet');
    if (sheet) {
      sheet.setAttribute('hidden', '');
      sheet.innerHTML = '';
      sheet.removeEventListener('keydown', trapFocus);
    }
    // Return focus to the day slot button
    if (configuringDay) {
      const dayBtn = container.querySelector(`[data-day="${configuringDay}"]`);
      if (dayBtn) dayBtn.focus();
    }
    configuringDay = null;
  }

  function saveConfigSheet(day, sheet, container) {
    const typeChip = sheet.querySelector('[data-type-choice][aria-checked="true"]');
    const type     = typeChip?.dataset.typeChoice || 'open';

    const durationChip = sheet.querySelector('[data-duration-choice][aria-checked="true"]');
    const duration     = durationChip ? parseInt(durationChip.dataset.durationChoice) : null;

    const sessionTypeChip = sheet.querySelector('[data-session-type-choice][aria-checked="true"]');
    const sessionType     = sessionTypeChip?.dataset.sessionTypeChoice || null;

    const activityName = sheet.querySelector('#wp-activity-name')?.value || null;

    // Write to store
    const path = `weeklyPlan.days.${day}`;
    store.set(`${path}.type`,         type);
    store.set(`${path}.durationMins`, duration);
    store.set(`${path}.sessionType`,  sessionType);
    store.set(`${path}.activityName`, activityName);
    store.set(`${path}.enabled`,      type !== 'open');
    store.set('weeklyPlan.updatedAt', new Date().toISOString());

    // Re-sync week shape after save
    _syncWeekShape();

    closeConfigSheet(container);
    render(container);
  }

  // ── Utilities ──────────────────────────────────────────────────────────────

  function _todayDayName() {
    return new Date().toLocaleDateString('en-GB', { weekday: 'long' }).toLowerCase();
  }

  function _esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const sheet    = document.getElementById('wp-config-sheet');
    if (!sheet) return;
    const focusable = [...sheet.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )];
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  return { mount };
}
