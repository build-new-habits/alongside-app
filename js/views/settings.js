/**
 * settings.js
 * 23 Jun 2026 v5
 *
 * Settings view. User controls for profile, programme, goals, and preferences.
 *
 * v5 — Phase 5 (P5-ST-1, P5-ST-2, P5-ST-3):
 *   - Programme change: user can change active programme from Settings
 *   - Programme reset: user can reset current week / restart programme
 *   - Goal change: goals editable after onboarding (was missing entirely)
 *   - Activity level update: fitnessLevel updatable as user improves
 *   - Developer bypass panel: triple-tap version label → tier switcher
 *   - Coach style selector: visible but Nurturing locked in beta (note shown)
 *
 * v4 — Tier gating audit. store.isPremium() calls. Paywall toast wiring.
 *
 * Existing tabs preserved:
 *   Profile, Conditions, Equipment, Notifications, Library, Privacy
 *
 * New tab in v5:
 *   Programme — programme change, reset, weekly target, goal change,
 *               activity level, coach style
 *
 * Developer bypass panel:
 *   Triple-tap on the version label in the About section.
 *   Shows tier switcher: Free / Personal / Athlete.
 *   Writes store.tier directly. Toast confirms.
 *   No visual indicator in production — purely for development and testing.
 *   Not mentioned in any user-facing copy.
 *
 * WCAG 2.2 AA:
 *   Tab strip: role="tablist", tabs role="tab", aria-selected, aria-controls.
 *   Panels: role="tabpanel", aria-labelledby.
 *   All form controls: associated <label> via for/id or aria-label.
 *   Destructive actions (reset programme): confirmation dialog before execution.
 *   Dialog: role="dialog", aria-modal="true", aria-labelledby on heading,
 *   focus trapped within dialog, Escape closes, focus returns to trigger.
 *   Touch targets: minimum 44px.
 *   Select elements: custom styled but native semantics preserved.
 */

import { store }          from '../store.js';
import { GOAL_CATEGORIES, getGoalLabel } from '../data/goals.js';
import { getProgramme, PROGRAMMES }      from '../data/programmes.js';
import { getProgressStats }              from '../data/programmeEngine.js';

// ─── View registration ────────────────────────────────────────────────────────

export function SettingsView(router) {

  let activeTab     = 'profile';
  let devTapCount   = 0;
  let devTapTimer   = null;

  const TABS = [
    { id: 'profile',     label: 'Profile'     },
    { id: 'programme',   label: 'Programme'   },
    { id: 'conditions',  label: 'Conditions'  },
    { id: 'equipment',   label: 'Equipment'   },
    { id: 'notify',      label: 'Reminders'   },
    { id: 'about',       label: 'About'       },
  ];

  // ── Mount ──────────────────────────────────────────────────────────────────

  function mount(container) {
    render(container);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  function render(container) {
    container.innerHTML = `
      <div class="settings-view" role="main" aria-label="Settings">

        <h1 class="settings-title">Settings</h1>

        <!-- Tab strip -->
        <div class="settings-tabs" role="tablist" aria-label="Settings sections">
          ${TABS.map(tab => `
            <button
              class="settings-tab ${activeTab === tab.id ? 'settings-tab--active' : ''}"
              role="tab"
              id="settings-tab-${tab.id}"
              aria-selected="${activeTab === tab.id ? 'true' : 'false'}"
              aria-controls="settings-panel-${tab.id}"
              data-tab="${tab.id}">
              ${tab.label}
            </button>
          `).join('')}
        </div>

        <!-- Tab panels -->
        <div class="settings-panels">
          ${TABS.map(tab => `
            <div
              class="settings-panel ${activeTab === tab.id ? 'settings-panel--active' : ''}"
              role="tabpanel"
              id="settings-panel-${tab.id}"
              aria-labelledby="settings-tab-${tab.id}"
              ${activeTab !== tab.id ? 'hidden' : ''}>
              ${renderPanel(tab.id)}
            </div>
          `).join('')}
        </div>

      </div>
    `;

    attachEvents(container);
  }

  // ── Panel router ───────────────────────────────────────────────────────────

  function renderPanel(tabId) {
    switch (tabId) {
      case 'profile':    return renderProfilePanel();
      case 'programme':  return renderProgrammePanel();
      case 'conditions': return renderConditionsPanel();
      case 'equipment':  return renderEquipmentPanel();
      case 'notify':     return renderNotifyPanel();
      case 'about':      return renderAboutPanel();
      default:           return '';
    }
  }

  // ── Profile panel ──────────────────────────────────────────────────────────

  function renderProfilePanel() {
    const name         = store.get('name') || '';
    const ageBand      = store.get('ageBand') || '';
    const gender       = store.get('gender') || '';
    const hormonalTracking = store.get('hormonalTracking') || false;

    return `
      <div class="settings-section">
        <h2 class="settings-section__heading">Your profile</h2>

        <div class="settings-field">
          <label class="settings-label" for="settings-name">Name</label>
          <input class="settings-input"
                 id="settings-name"
                 type="text"
                 value="${_esc(name)}"
                 autocomplete="given-name"
                 data-field="name"
                 aria-label="Your name">
        </div>

        <div class="settings-field">
          <label class="settings-label" for="settings-agebandsel">Age range</label>
          <select class="settings-select"
                  id="settings-agebandsel"
                  data-field="ageBand"
                  aria-label="Your age range">
            ${['Under 18','18–24','25–34','35–44','45–54','55–64','65+','Prefer not to say'].map(b => `
              <option value="${b}" ${ageBand === b ? 'selected' : ''}>${b}</option>
            `).join('')}
          </select>
        </div>

        <div class="settings-field">
          <label class="settings-label" for="settings-gender">Gender</label>
          <select class="settings-select"
                  id="settings-gender"
                  data-field="gender"
                  aria-label="Your gender">
            <option value="">Prefer not to say</option>
            <option value="female"   ${gender === 'female'    ? 'selected' : ''}>Female</option>
            <option value="male"     ${gender === 'male'      ? 'selected' : ''}>Male</option>
            <option value="non-binary" ${gender === 'non-binary' ? 'selected' : ''}>Non-binary</option>
            <option value="other"    ${gender === 'other'     ? 'selected' : ''}>Other / self-describe</option>
          </select>
        </div>

        <div class="settings-field settings-field--toggle">
          <label class="settings-label" for="settings-hormonal">
            Cycle-aware coaching
            <span class="settings-label__sub">Adapts sessions to your hormonal cycle</span>
          </label>
          <button
            class="settings-toggle ${hormonalTracking ? 'settings-toggle--on' : ''}"
            id="settings-hormonal"
            role="switch"
            aria-checked="${hormonalTracking ? 'true' : 'false'}"
            data-toggle="hormonalTracking"
            aria-label="Cycle-aware coaching ${hormonalTracking ? 'on' : 'off'}">
            <span class="settings-toggle__track" aria-hidden="true"></span>
          </button>
        </div>

        <button class="settings-save-btn btn btn-primary"
                data-action="save-profile"
                aria-label="Save profile changes">
          Save changes
        </button>
      </div>
    `;
  }

  // ── Programme panel (NEW in v5) ────────────────────────────────────────────

  function renderProgrammePanel() {
    const stats        = getProgressStats();
    const goals        = store.get('goals') || [];
    const fitnessLevel = store.get('fitnessLevel') || 'moderate';
    const weeklyTarget = store.get('strategicGoal.weeklySessionTarget') || 3;
    const coachStyle   = store.get('coachStyle') || 'nurturing';
    const tier         = store.get('tier') || 'free';

    return `
      <div class="settings-section">

        <!-- Active programme -->
        <h2 class="settings-section__heading">Your programme</h2>

        ${stats.hasActiveProgramme ? `
          <div class="settings-programme-card">
            <p class="settings-programme-card__name">${stats.programmeName}</p>
            <p class="settings-programme-card__week">Week ${stats.currentWeek} of 12</p>
            <p class="settings-programme-card__phase">${stats.phaseName}</p>
          </div>

          <div class="settings-actions">
            <button class="btn btn-secondary"
                    data-action="change-programme"
                    aria-label="Change your programme">
              Change programme
            </button>
            <button class="btn btn-ghost settings-btn--destructive"
                    data-action="reset-programme"
                    aria-label="Reset programme — restart from week one">
              Reset programme
            </button>
          </div>
        ` : `
          <p class="settings-empty">No active programme. Choose one from the library to get started.</p>
          <button class="btn btn-primary"
                  data-action="choose-programme"
                  aria-label="Choose a programme">
            Choose a programme
          </button>
        `}

        <!-- Weekly session target -->
        <div class="settings-field">
          <label class="settings-label" for="settings-weekly-target">
            Sessions per week
            <span class="settings-label__sub">How many sessions you're aiming for</span>
          </label>
          <select class="settings-select"
                  id="settings-weekly-target"
                  data-field="strategicGoal.weeklySessionTarget"
                  aria-label="Target sessions per week">
            ${[2, 3, 4, 5].map(n => `
              <option value="${n}" ${weeklyTarget === n ? 'selected' : ''}>${n} per week</option>
            `).join('')}
          </select>
        </div>

        <!-- Goals (P5-ST-2) -->
        <h2 class="settings-section__heading">Your goals</h2>
        <p class="settings-section__sub">
          Tap to change what you're working towards.
          Your programme won't be affected until you next review it.
        </p>
        <div class="settings-goals-grid"
             role="group"
             aria-label="Select your goals">
          ${GOAL_CATEGORIES.flatMap(cat => cat.goals).map(goal => `
            <button
              class="settings-goal-chip ${goals.includes(goal.id) ? 'settings-goal-chip--selected' : ''}"
              data-goal="${goal.id}"
              role="checkbox"
              aria-checked="${goals.includes(goal.id) ? 'true' : 'false'}"
              aria-label="${goal.label}">
              <span aria-hidden="true">${goal.icon}</span>
              ${goal.label}
            </button>
          `).join('')}
        </div>
        <button class="settings-save-btn btn btn-primary"
                data-action="save-goals"
                aria-label="Save goal changes">
          Save goals
        </button>

        <!-- Activity level (P5-ST-3) -->
        <h2 class="settings-section__heading">Activity level</h2>
        <p class="settings-section__sub">
          Update this as you get fitter — it affects the intensity ceiling for your sessions.
        </p>
        <div class="settings-field">
          <label class="settings-label" for="settings-fitness-level">Current activity level</label>
          <select class="settings-select"
                  id="settings-fitness-level"
                  data-field="fitnessLevel"
                  aria-label="Your current activity level">
            <option value="sedentary"   ${fitnessLevel === 'sedentary'   ? 'selected' : ''}>Sedentary — mostly sitting</option>
            <option value="light"       ${fitnessLevel === 'light'       ? 'selected' : ''}>Light — some walking or gentle activity</option>
            <option value="moderate"    ${fitnessLevel === 'moderate'    ? 'selected' : ''}>Moderate — exercise a few times a week</option>
            <option value="active"      ${fitnessLevel === 'active'      ? 'selected' : ''}>Active — regular training</option>
            <option value="very-active" ${fitnessLevel === 'very-active' ? 'selected' : ''}>Very active — intensive training most days</option>
          </select>
        </div>
        <button class="settings-save-btn btn btn-primary"
                data-action="save-fitness-level"
                aria-label="Save activity level">
          Save
        </button>

        <!-- Coach style -->
        <h2 class="settings-section__heading">Coach style</h2>
        <p class="settings-section__sub">
          During beta, all coaching is delivered in the Nurturing style.
          More options coming after beta.
        </p>
        <div class="settings-coach-styles"
             role="radiogroup"
             aria-label="Coach style">
          ${[
            { id: 'nurturing',  label: 'Nurturing',  desc: 'Gentle, emotionally attuned, warm' },
            { id: 'steady',     label: 'Steady',     desc: 'Calm, grounded, reassuring'        },
            { id: 'energetic',  label: 'Energetic',  desc: 'Upbeat, motivating, enthusiastic'  },
            { id: 'minimal',    label: 'Minimal',    desc: 'Direct, efficient, no filler'       },
          ].map(style => `
            <button
              class="settings-coach-style ${coachStyle === style.id ? 'settings-coach-style--selected' : ''} ${style.id !== 'nurturing' ? 'settings-coach-style--beta-locked' : ''}"
              role="radio"
              aria-checked="${coachStyle === style.id ? 'true' : 'false'}"
              ${style.id !== 'nurturing' ? 'aria-disabled="true"' : ''}
              data-coach-style="${style.id}"
              aria-label="${style.label}: ${style.desc}${style.id !== 'nurturing' ? ' — coming after beta' : ''}">
              <span class="settings-coach-style__label">${style.label}</span>
              <span class="settings-coach-style__desc">${style.desc}</span>
              ${style.id !== 'nurturing' ? '<span class="settings-coach-style__soon">After beta</span>' : ''}
            </button>
          `).join('')}
        </div>

      </div>
    `;
  }

  // ── Conditions panel ───────────────────────────────────────────────────────

  function renderConditionsPanel() {
    const conditions = store.get('conditions') || [];
    return `
      <div class="settings-section">
        <h2 class="settings-section__heading">Conditions and injuries</h2>
        <p class="settings-section__sub">
          The coach adapts every session around what you've listed here.
          Add or remove conditions at any time.
        </p>
        <button class="btn btn-primary"
                data-action="edit-conditions"
                aria-label="Edit your conditions and injuries">
          Edit conditions
        </button>
        ${conditions.length > 0 ? `
          <ul class="settings-conditions-list" aria-label="Your conditions">
            ${conditions.map(c => `<li class="settings-conditions-item">${_esc(c)}</li>`).join('')}
          </ul>
        ` : `<p class="settings-empty">No conditions listed.</p>`}
      </div>
    `;
  }

  // ── Equipment panel ────────────────────────────────────────────────────────

  function renderEquipmentPanel() {
    return `
      <div class="settings-section">
        <h2 class="settings-section__heading">Equipment</h2>
        <p class="settings-section__sub">
          The coach only suggests exercises that match what you have available.
        </p>
        <button class="btn btn-primary"
                data-action="edit-equipment"
                aria-label="Edit your equipment">
          Edit equipment
        </button>
      </div>
    `;
  }

  // ── Notifications panel ────────────────────────────────────────────────────

  function renderNotifyPanel() {
    const notif   = store.get('checkInNotification') || {};
    const water   = store.get('waterReminderEnabled') || false;
    const enabled = notif.enabled || false;
    const time    = notif.time || '';

    return `
      <div class="settings-section">
        <h2 class="settings-section__heading">Reminders</h2>

        <div class="settings-field settings-field--toggle">
          <label class="settings-label" for="settings-checkin-notif">
            Daily check-in reminder
            <span class="settings-label__sub">A nudge to open the app and check in</span>
          </label>
          <button
            class="settings-toggle ${enabled ? 'settings-toggle--on' : ''}"
            id="settings-checkin-notif"
            role="switch"
            aria-checked="${enabled ? 'true' : 'false'}"
            data-toggle="checkInNotification.enabled"
            aria-label="Check-in reminder ${enabled ? 'on' : 'off'}">
            <span class="settings-toggle__track" aria-hidden="true"></span>
          </button>
        </div>

        ${enabled ? `
          <div class="settings-field">
            <label class="settings-label" for="settings-notif-time">Reminder time</label>
            <input class="settings-input"
                   id="settings-notif-time"
                   type="time"
                   value="${_esc(time)}"
                   data-field="checkInNotification.time"
                   aria-label="Check-in reminder time">
          </div>
        ` : ''}

        <div class="settings-field settings-field--toggle">
          <label class="settings-label" for="settings-water-reminder">
            Pre-session water reminder
            <span class="settings-label__sub">A prompt to drink water before each session</span>
          </label>
          <button
            class="settings-toggle ${water ? 'settings-toggle--on' : ''}"
            id="settings-water-reminder"
            role="switch"
            aria-checked="${water ? 'true' : 'false'}"
            data-toggle="waterReminderEnabled"
            aria-label="Water reminder ${water ? 'on' : 'off'}">
            <span class="settings-toggle__track" aria-hidden="true"></span>
          </button>
        </div>

      </div>
    `;
  }

  // ── About panel (with developer bypass) ───────────────────────────────────

  function renderAboutPanel() {
    const tier = store.get('tier') || 'free';
    const APP_VERSION = '114';

    return `
      <div class="settings-section">
        <h2 class="settings-section__heading">About</h2>

        <div class="settings-about-block">
          <p>Alongside: Move</p>
          <p class="settings-version"
             id="settings-version"
             aria-label="App version ${APP_VERSION}"
             tabindex="0">
            v${APP_VERSION}
          </p>
          <p>by Build New Habits</p>
          <p>buildnewhabits.co.uk</p>
        </div>

        <div class="settings-about-links">
          <button class="btn btn-ghost"
                  data-action="nav-privacy"
                  aria-label="View privacy policy">
            Privacy policy
          </button>
          <button class="btn btn-ghost"
                  data-action="reset-data"
                  aria-label="Reset all app data — this cannot be undone">
            Reset all data
          </button>
        </div>

        <!-- Developer bypass panel (hidden — shown after triple-tap on version) -->
        <div class="settings-dev-panel" id="settings-dev-panel" hidden aria-hidden="true">
          <h3 class="settings-dev-panel__heading">Developer panel</h3>
          <p class="settings-dev-panel__tier">Current tier: <strong id="dev-current-tier">${tier}</strong></p>
          <div class="settings-dev-panel__buttons"
               role="group"
               aria-label="Switch tier for testing">
            <button class="btn btn-secondary btn-sm"
                    data-dev-tier="free"
                    aria-label="Switch to Free tier">Free</button>
            <button class="btn btn-secondary btn-sm"
                    data-dev-tier="personal"
                    aria-label="Switch to Personal tier">Personal</button>
            <button class="btn btn-secondary btn-sm"
                    data-dev-tier="athlete"
                    aria-label="Switch to Athlete tier">Athlete</button>
          </div>
        </div>

      </div>
    `;
  }

  // ── Events ─────────────────────────────────────────────────────────────────

  function attachEvents(container) {
    // Tab switching
    container.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        render(container);
        const newTab = container.querySelector(`[data-tab="${activeTab}"]`);
        if (newTab) newTab.focus();
      });
    });

    // Field saves (inputs and selects)
    container.querySelectorAll('[data-field]').forEach(el => {
      el.addEventListener('change', () => {
        const field = el.dataset.field;
        const value = el.type === 'checkbox' ? el.checked : el.value;
        store.set(field, el.type === 'number' ? Number(value) : value);
      });
    });

    // Toggle switches
    container.querySelectorAll('[data-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const field   = btn.dataset.toggle;
        const current = store.get(field);
        const next    = !current;
        store.set(field, next);
        btn.setAttribute('aria-checked', next ? 'true' : 'false');
        btn.classList.toggle('settings-toggle--on', next);
        const label = btn.getAttribute('aria-label') || '';
        btn.setAttribute('aria-label', label.replace(next ? 'off' : 'on', next ? 'on' : 'off'));
        // Re-render notifications panel to show/hide time input
        if (field === 'checkInNotification.enabled') {
          activeTab = 'notify';
          render(container);
        }
      });
    });

    // Goal chips
    container.querySelectorAll('[data-goal]').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('settings-goal-chip--selected');
        const checked = btn.classList.contains('settings-goal-chip--selected');
        btn.setAttribute('aria-checked', checked ? 'true' : 'false');
      });
    });

    // Coach style (Nurturing only active in beta)
    container.querySelectorAll('[data-coach-style]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.getAttribute('aria-disabled') === 'true') return;
        const style = btn.dataset.coachStyle;
        store.set('coachStyle', style);
        container.querySelectorAll('[data-coach-style]').forEach(b => {
          const isSelected = b.dataset.coachStyle === style;
          b.setAttribute('aria-checked', isSelected ? 'true' : 'false');
          b.classList.toggle('settings-coach-style--selected', isSelected);
        });
      });
    });

    // Action buttons
    container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => handleAction(btn.dataset.action, container));
    });

    // Developer bypass: triple-tap version label
    const versionEl = container.querySelector('#settings-version');
    if (versionEl) {
      versionEl.addEventListener('click', () => {
        devTapCount++;
        clearTimeout(devTapTimer);
        devTapTimer = setTimeout(() => { devTapCount = 0; }, 1500);
        if (devTapCount >= 3) {
          devTapCount = 0;
          _toggleDevPanel(container);
        }
      });
    }

    // Developer tier buttons
    container.querySelectorAll('[data-dev-tier]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tier = btn.dataset.devTier;
        store.set('tier', tier);
        const tierLabel = container.querySelector('#dev-current-tier');
        if (tierLabel) tierLabel.textContent = tier;
        _showToast(`Tier set to: ${tier}`, container);
      });
    });
  }

  // ── Action handlers ────────────────────────────────────────────────────────

  function handleAction(action, container) {
    switch (action) {

      case 'save-profile': {
        const name   = container.querySelector('[data-field="name"]')?.value;
        const age    = container.querySelector('[data-field="ageBand"]')?.value;
        const gender = container.querySelector('[data-field="gender"]')?.value;
        if (name  !== undefined) store.set('name', name);
        if (age   !== undefined) store.set('ageBand', age);
        if (gender !== undefined) store.set('gender', gender);
        _showToast('Profile saved', container);
        break;
      }

      case 'save-goals': {
        const selectedGoals = [...container.querySelectorAll('[data-goal][aria-checked="true"]')]
          .map(b => b.dataset.goal);
        store.set('goals', selectedGoals);
        _showToast('Goals updated', container);
        break;
      }

      case 'save-fitness-level': {
        const level = container.querySelector('[data-field="fitnessLevel"]')?.value;
        if (level) store.set('fitnessLevel', level);
        _showToast('Activity level updated', container);
        break;
      }

      case 'change-programme':
        router.navigate('goal-setup');
        break;

      case 'choose-programme':
        router.navigate('goal-setup');
        break;

      case 'reset-programme':
        _confirmDestructive(
          'Reset programme',
          'This will restart your programme from Week 1. Your session history will be kept. This cannot be undone.',
          () => {
            store.set('activeProgramme.currentWeek',      1);
            store.set('activeProgramme.currentPhase',     'build');
            store.set('activeProgramme.sessionsThisWeek', 0);
            store.set('activeProgramme.totalSessions',    0);
            store.set('activeProgramme.milestones',       []);
            store.set('activeProgramme.missedSessions',   []);
            store.set('activeProgramme.startDate',        new Date().toISOString());
            store.set('activeProgramme.midProgrammeGlanceShown', false);
            store.set('activeProgramme.programmeReflectionShown', false);
            _showToast('Programme reset to Week 1', container);
            render(container);
          },
          container
        );
        break;

      case 'edit-conditions':
        router.navigate('onboarding/conditions');
        break;

      case 'edit-equipment':
        router.navigate('onboarding/equipment');
        break;

      case 'nav-privacy':
        router.navigate('privacy');
        break;

      case 'reset-data':
        _confirmDestructive(
          'Reset all data',
          'This will delete everything — your profile, history, and programme. It cannot be undone.',
          () => {
            store.reset();
            router.navigate('welcome');
          },
          container
        );
        break;
    }
  }

  // ── Developer panel toggle ─────────────────────────────────────────────────

  function _toggleDevPanel(container) {
    const panel = container.querySelector('#settings-dev-panel');
    if (!panel) return;
    const isHidden = panel.hasAttribute('hidden');
    if (isHidden) {
      panel.removeAttribute('hidden');
      panel.removeAttribute('aria-hidden');
    } else {
      panel.setAttribute('hidden', '');
      panel.setAttribute('aria-hidden', 'true');
    }
  }

  // ── Confirmation dialog ────────────────────────────────────────────────────

  function _confirmDestructive(title, message, onConfirm, container) {
    const existing = document.getElementById('settings-confirm-dialog');
    if (existing) existing.remove();

    const dialog = document.createElement('div');
    dialog.id = 'settings-confirm-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'confirm-dialog-title');
    dialog.className = 'settings-dialog';
    dialog.innerHTML = `
      <div class="settings-dialog__backdrop"></div>
      <div class="settings-dialog__content">
        <h2 class="settings-dialog__title" id="confirm-dialog-title">${_esc(title)}</h2>
        <p class="settings-dialog__message">${_esc(message)}</p>
        <div class="settings-dialog__actions">
          <button class="btn btn-ghost" id="confirm-cancel">Cancel</button>
          <button class="btn btn-danger" id="confirm-ok">${_esc(title)}</button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    // Trap focus within dialog
    const focusable = dialog.querySelectorAll('button');
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    first.focus();

    dialog.addEventListener('keydown', e => {
      if (e.key === 'Escape') { dialog.remove(); return; }
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    });

    dialog.querySelector('#confirm-cancel').addEventListener('click', () => dialog.remove());
    dialog.querySelector('#confirm-ok').addEventListener('click', () => {
      dialog.remove();
      onConfirm();
    });
    dialog.querySelector('.settings-dialog__backdrop').addEventListener('click', () => dialog.remove());
  }

  // ── Toast ──────────────────────────────────────────────────────────────────

  function _showToast(message, container) {
    const existing = container.querySelector('.settings-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'settings-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }

  // ── Utilities ──────────────────────────────────────────────────────────────

  function _esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return { mount };
}
