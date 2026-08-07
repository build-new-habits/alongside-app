/**
 * settings.js
 * 05 Aug 2026 v14
 *
 * v14 — Equipment panel now shows a saved-equipment summary (Home: N
 *   items / Gym: N items), split by scope. Previously just a bare
 *   "Edit equipment" button with no way to glance at what was saved.
 *   Found while investigating the gym-session location bug (05 Aug) --
 *   directly useful for confirming onboarding wasn't rushed through
 *   without redoing the whole edit flow.
 *
 * 04 Aug 2026 v13
 *
 * v13 — New "Update app" button in the About panel. Graeme: laptop was
 *   on the latest version, phone was still showing old, unstyled
 *   screens — real cache-staleness, not imagined. Checked sw.js's
 *   fetch handler before building anything: pure cache-first, a stale
 *   cached file is served without even checking the network until a
 *   new service worker fully takes over. This button goes further than
 *   the existing checkForUpdate()/applyUpdate() (app.js) — those only
 *   politely ask the current SW registration to check; this also
 *   clears every cache directly and hard-reloads regardless of SW
 *   state, so it works even if the SW itself is what's stuck.
 *
 * 04 Aug 2026 v12
 *
 * Settings view. User controls for profile, programme, goals, and preferences.
 *
 * v12 — "Edit conditions" now routes to the real Conditions Update
 *   screen (conditions-update.js, Phase D-2) instead of the limited
 *   openSheet('onboarding/conditions') bridge from v9 — that bridge
 *   only ever let you toggle which conditions exist, nothing about
 *   severity, goals, or a programme. Matches the original spec:
 *   Settings' panel is a shortcut into the same destination Home's
 *   Conditions Update door uses. "Edit equipment" untouched, still
 *   uses openSheet() as v9 fixed it.
 *
 * 05 Jul 2026 v11
 *
 * v11 — My Movement rebuild (agreed 13 May, never built — ground-truthed
 *   05 Jul: the selector was absent from the live UI entirely, not merely
 *   single-select as the old note implied). Schema-first: store.js v8
 *   changed movementIdentity from string|null to string[]. Added a "How
 *   you move" section to the Profile panel (own heading, own Save button,
 *   same pattern as Programme panel's per-subsection saves) — six chips
 *   (gym/yoga/running/walking/swimming/classes) as true multi-select,
 *   plus a separate "A mix of things" chip that's mutually exclusive with
 *   the six: choosing it clears and disables the others (with
 *   aria-disabled kept in sync), choosing any of the six clears it. Read
 *   from and written to movementIdentity as an array. Placed after "Save
 *   changes" and before the reflection section — distinct concept from
 *   name/age/gender, deserves its own save action rather than being
 *   bundled into the general profile save.
 *
 * v10 — Functional QA fix (My Week). Ground-truthed against router.js v8 and
 *   weekly-plan.js v2: the "weekly-plan" route and its view file were both
 *   intact and schema-correct — the ONLY thing missing was a way in. The
 *   14 Jun (S4-WP) "simple entry card" that used to live in this file's My
 *   Week tab was dropped somewhere across the v4–v9 Programme-panel rewrites,
 *   not deliberately, and never replaced. Restored as a "Your week" section
 *   in the Programme panel — placed directly after the weekly session target
 *   field, since both concern the shape of the week rather than the
 *   programme itself. Deliberately not styled as a bare utility link: reads
 *   store.weeklyPlan.updatedAt and speaks to what's actually true right now
 *   ("You haven't shaped a week yet" vs "Last shaped <date>"), consistent
 *   with the rest of this panel's voice (Conditions/Equipment sections do
 *   the same). No schema change — weeklyPlan already exists per schema.md
 *   v1.6+. No changes to router.js or weekly-plan.js; both were already
 *   correct.
 *
 * v9 — Back-navigation bug fix. "Edit conditions"/"Edit equipment" were
 *   calling router.navigate('onboarding/conditions' / 'onboarding/equipment')
 *   directly — a real navigation into a view built for onboarding, whose
 *   Back/Done buttons are hardcoded to onboarding-sequence destinations
 *   (conditions.js's Back button literally calls
 *   router.navigate('onboarding/goals')). That's why Back landed on
 *   onboarding goals instead of returning to Settings, and why the
 *   bottom nav vanished and onboarding progress dots appeared in its
 *   place — the view was mounting as a full onboarding page, not an
 *   "edit" screen.
 *   Fix: both actions now call openSheet() from
 *   js/views/onboarding/sheet-manager.js — the exact mechanism OB-THREAD
 *   already uses to mount these same view files inside onboarding.
 *   sheet-manager.js temporarily intercepts the bare global
 *   router.navigate() while a sheet is open, so conditions.js's hardcoded
 *   Back call just closes the sheet instead of leaking through as a real
 *   navigation. equipment.js already exports mountContainer()/
 *   setSheetDoneCallback() for this exact purpose. No changes needed to
 *   conditions.js, equipment.js, or sheet-manager.js — only the call site
 *   here. onDone callback re-renders Settings so any conditions/equipment
 *   changes made in the sheet show immediately. Nav bar now stays visible
 *   throughout, since the route never actually changes from 'settings'.
 *
 * v8 — S1/S3 fixes (second round, same day).
 *   S1: age band options were out of date. Settings still had the
 *   pre-OB-THREAD bands (Under 18/18–24/25–34/35–44/45–54/55–64/65+).
 *   Onboarding moved to Under 20/20s/30s/40s/50s/60s/70+ as part of the
 *   28 Jun OB-THREAD rewrite (confirmed against
 *   alongside_onboarding_conversation_script_28jun2026_v3). Settings
 *   never followed — a saved ageBand from onboarding wouldn't even
 *   match an option here. Updated to the current bands.
 *   S3: "Your goals" was flattening GOAL_CATEGORIES with flatMap,
 *   throwing away the category grouping onboarding uses (see
 *   screenshot: "Feel good and have energy" / "Strength and fitness" /
 *   "Running and cardio goals" etc.). Now renders one
 *   .settings-goals-category block per category with its own label,
 *   matching onboarding's presentation. Assumes cat.label exists on
 *   GOAL_CATEGORIES entries (consistent with the .label pattern used
 *   elsewhere in this file's own TABS array) — not confirmed against
 *   goals.js directly, flag if it renders blank.
 *
 * v7 — S1 fix. Coach style is Nurturing only, permanently — no other
 *   styles are planned, not just "locked for beta". Removed the
 *   Steady/Energetic/Minimal radiogroup and all "After beta" locked-
 *   option UI entirely. Replaced with a single static line. store's
 *   coachStyle field is untouched (still defaults to 'nurturing', still
 *   read elsewhere for voice logic) — this is a UI-only removal, no
 *   schema change. Removed the now-dead [data-coach-style] event
 *   listener block. Flagged separately (not done here, out of scope
 *   for Settings): audit website copy, marketing, and other Alongside
 *   product docs for any remaining "choose your coach style" language.
 *
 * v6 — OB-THREAD. New "Your reflection" section added to the Profile panel.
 *   Displays the Beat 3 reflection generated at onboarding, report-style —
 *   all five parts rendered as continuous text, no staged reveal, no
 *   Continue taps (those belong to the conversational moment in thread.js;
 *   here it's a reference document, read top to bottom like a report).
 *   Reads store.onboarding.primaryTerritory and calls getBeat3Script() live
 *   — no new schema field, no duplicated content, single source of truth
 *   stays in beat3-scripts.js.
 *   Section does not render at all if primaryTerritory is null (user chose
 *   "I'd rather not say" at Hard Before — there is nothing to reflect back).
 *   Collapsed by default behind a single "Read your reflection" button,
 *   consistent with the existing edit-conditions / edit-equipment pattern
 *   on this page. No read/unread state — it isn't a notification.
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
 *   Reflection block (v6): collapsible region uses aria-expanded on the
 *   trigger button and aria-hidden on the content when collapsed.
 *   Weekly plan section (v10): plain button + descriptive aria-label,
 *   same pattern as Conditions/Equipment sections — no new interaction
 *   pattern introduced.
 *   Movement chips (v11): role="checkbox" with aria-checked for the six
 *   multi-select chips, disabled + aria-disabled kept in sync when
 *   "mixed" is active. Divider between the two groups uses
 *   role="separator". All chips minimum 44px touch target.
 */

import { store }          from '../store.js';
import { GOAL_CATEGORIES, getGoalLabel } from '../data/goals.js';
import { getProgramme, PROGRAMMES }      from '../data/programmes.js';
import { getProgressStats }              from '../data/programmeEngine.js';
import { getBeat3Script }                from '../data/beat3-scripts.js';
import { openSheet }                     from './onboarding/sheet-manager.js';

// ─── View registration ────────────────────────────────────────────────────────

export function SettingsView(router) {

  let activeTab        = 'profile';
  let devTapCount       = 0;
  let devTapTimer       = null;
  let reflectionExpanded = false;

  const TABS = [
    { id: 'profile',     label: 'Profile'     },
    { id: 'programme',   label: 'Programme'   },
    { id: 'conditions',  label: 'Conditions'  },
    { id: 'equipment',   label: 'Equipment'   },
    { id: 'notify',      label: 'Reminders'   },
    { id: 'about',       label: 'About'       },
  ];

  // v11 — My Movement rebuild. Matches store.js's movementIdentity
  // string[] values. "mixed" is handled separately, below, since it's
  // mutually exclusive with these six rather than a seventh peer option.
  const MOVEMENT_IDENTITIES = [
    { id: 'gym',      label: 'Gym',      icon: '●' },
    { id: 'yoga',     label: 'Yoga',     icon: '◌' },
    { id: 'running',  label: 'Running',  icon: '→' },
    { id: 'walking',  label: 'Walking',  icon: '↝' },
    { id: 'swimming', label: 'Swimming', icon: '≈' },
    { id: 'classes',  label: 'Classes',  icon: '◆' },
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
            ${['Under 20','20s','30s','40s','50s','60s','70+','Prefer not to say'].map(b => `
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

        ${renderMovementSection()}

        ${renderReflectionSection()}
      </div>
    `;
  }

  // ── Movement section (v11) ──────────────────────────────────────────────
  // How you move — multi-select identity chips + mutually-exclusive
  // "mixed" fallback. Reads/writes movementIdentity as string[].

  function renderMovementSection() {
    const movementIdentity = store.get('movementIdentity') || [];
    const isMixed = movementIdentity.includes('mixed');

    return `
      <h2 class="settings-section__heading">How you move</h2>
      <p class="settings-section__sub">
        Pick everything that's part of your movement life — the coach
        rotates suggestions toward whichever you've done least recently.
        Or, if you'd rather not pick, tell it you do a mix of things.
      </p>
      <div class="settings-movement-chips" role="group" aria-label="Your movement identities">
        ${MOVEMENT_IDENTITIES.map(m => `
          <button
            class="settings-movement-chip ${movementIdentity.includes(m.id) ? 'settings-movement-chip--selected' : ''}"
            data-movement="${m.id}"
            role="checkbox"
            aria-checked="${movementIdentity.includes(m.id) ? 'true' : 'false'}"
            aria-label="${m.label}"
            ${isMixed ? 'disabled aria-disabled="true"' : ''}>
            <span aria-hidden="true">${m.icon}</span>
            ${m.label}
          </button>
        `).join('')}
      </div>
      <div class="settings-movement-divider" role="separator" aria-hidden="true">or</div>
      <button
        class="settings-movement-chip settings-movement-chip--mixed ${isMixed ? 'settings-movement-chip--selected' : ''}"
        data-movement="mixed"
        role="checkbox"
        aria-checked="${isMixed ? 'true' : 'false'}"
        aria-label="A mix of things — don't ask me to pick">
        A mix of things
      </button>
      <button class="settings-save-btn btn btn-primary"
              data-action="save-movement"
              aria-label="Save how you move">
        Save
      </button>
    `;
  }

  // ── Reflection section ──────────────────────────────────────────────────
  // Collapsible block. Reads primaryTerritory live, no stored read/unread
  // state, no new schema. Renders nothing if the user has no territory set.

  function renderReflectionSection() {
    const territory = store.get('onboarding.primaryTerritory');
    if (!territory) return '';

    const script = getBeat3Script([territory]);
    if (!script) return '';

    return `
      <div class="settings-reflection">
        <h2 class="settings-section__heading">Your reflection</h2>
        <p class="settings-section__sub">
          What we shared with you when you first joined, about why
          Alongside: Move works differently for you.
        </p>

        <button class="btn btn-secondary"
                id="settings-reflection-toggle"
                data-action="toggle-reflection"
                aria-expanded="${reflectionExpanded ? 'true' : 'false'}"
                aria-controls="settings-reflection-content"
                aria-label="${reflectionExpanded ? 'Hide your reflection' : 'Read your reflection'}">
          ${reflectionExpanded ? 'Hide reflection' : 'Read your reflection'}
        </button>

        <div class="settings-reflection__content"
             id="settings-reflection-content"
             ${reflectionExpanded ? '' : 'hidden'}
             aria-hidden="${reflectionExpanded ? 'false' : 'true'}">
          ${script.parts.map(part => `<p class="settings-reflection__para">${_esc(part)}</p>`).join('')}
        </div>
      </div>
    `;
  }

  // ── Programme panel ────────────────────────────────────────────────────────

  function renderProgrammePanel() {
    const stats        = getProgressStats();
    const goals        = store.get('goals') || [];
    const fitnessLevel = store.get('fitnessLevel') || 'moderate';
    const weeklyTarget = store.get('strategicGoal.weeklySessionTarget') || 3;
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

        <!-- Your week (v10 — restored entry point into weekly-plan.js) -->
        <h2 class="settings-section__heading">Your week</h2>
        <p class="settings-section__sub">
          ${renderWeeklyPlanSummary()}
        </p>
        <button class="btn btn-secondary"
                data-action="open-weekly-plan"
                aria-label="Plan your week — set an intent for each day">
          Plan my week
        </button>

        <!-- Goals -->
        <h2 class="settings-section__heading">Your goals</h2>
        <p class="settings-section__sub">
          Tap to change what you're working towards.
          Your programme won't be affected until you next review it.
        </p>
        <div class="settings-goals-groups" role="group" aria-label="Select your goals">
          ${GOAL_CATEGORIES.map(cat => `
            <div class="settings-goals-category">
              <p class="settings-goals-category__label">${_esc(cat.label)}</p>
              <div class="settings-goals-grid">
                ${cat.goals.map(goal => `
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
            </div>
          `).join('')}
        </div>
        <button class="settings-save-btn btn btn-primary"
                data-action="save-goals"
                aria-label="Save goal changes">
          Save goals
        </button>

        <!-- Activity level -->
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

        <!-- Coach (S1 — Nurturing only, permanently. No picker.) -->
        <h2 class="settings-section__heading">Your coach</h2>
        <p class="settings-section__sub">
          Every session is guided in a warm, nurturing style — gentle,
          emotionally attuned, and always on your side.
        </p>

      </div>
    `;
  }

  // ── Weekly plan summary line ────────────────────────────────────────────
  // Reads weeklyPlan.updatedAt live — no new schema field. Speaks to what's
  // actually true right now rather than a generic label, consistent with
  // the voice used elsewhere on this panel (Conditions/Equipment sections).

  function renderWeeklyPlanSummary() {
    const updatedAt = store.get('weeklyPlan.updatedAt');
    if (!updatedAt) {
      return `You haven't shaped a week yet — the coach will ask each day instead. Set one up and it'll use that as your starting point.`;
    }
    const formatted = new Date(updatedAt).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
    return `Last shaped ${_esc(formatted)}. The coach uses this as its starting point each day — you can still adjust on the day itself.`;
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

  // 05 Aug 2026 -- summary of what's actually saved, split by scope. Found
  // while investigating the gym-session location bug: this panel showed
  // nothing but a bare "Edit equipment" button, no way to glance at what
  // was saved without stepping through the whole edit flow again. Small,
  // low-risk, directly useful for verifying onboarding wasn't rushed
  // through without redoing it.
  function _equipmentSummaryLine(scope, list) {
    if (!list || list.length === 0) {
      return `<p class="text-sm text-muted">${scope}: nothing saved &mdash; bodyweight only</p>`;
    }
    const label = list.length === 1 ? "1 item" : `${list.length} items`;
    return `<p class="text-sm text-muted">${scope}: ${label} saved</p>`;
  }

  function renderEquipmentPanel() {
    const homeEquip = store.get('homeEquipment') || [];
    const gymEquip   = store.get('gymEquipment')  || [];

    return `
      <div class="settings-section">
        <h2 class="settings-section__heading">Equipment</h2>
        <p class="settings-section__sub">
          The coach only suggests exercises that match what you have available.
        </p>
        <div style="margin-bottom: var(--space-3);">
          ${_equipmentSummaryLine("Home", homeEquip)}
          ${_equipmentSummaryLine("Gym", gymEquip)}
        </div>
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
    const APP_VERSION = '115';

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

        <div class="settings-update-block">
          <button class="btn btn-primary" id="settings-force-update-btn"
                  aria-label="Force update — clears cache and reloads the latest version">
            Update app
          </button>
          <p class="settings-update-status" id="settings-update-status" aria-live="polite"></p>
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

    // Movement chips (v11) — six-way multi-select, mutually exclusive
    // with the separate "mixed" option.
    container.querySelectorAll('[data-movement]').forEach(btn => {
      btn.addEventListener('click', () => {
        const isMixedBtn = btn.dataset.movement === 'mixed';

        if (isMixedBtn) {
          const nowSelected = !btn.classList.contains('settings-movement-chip--selected');
          container.querySelectorAll('[data-movement]').forEach(b => {
            b.classList.remove('settings-movement-chip--selected');
            b.setAttribute('aria-checked', 'false');
            if (b.dataset.movement !== 'mixed') {
              b.disabled = nowSelected;
              b.setAttribute('aria-disabled', nowSelected ? 'true' : 'false');
            }
          });
          if (nowSelected) {
            btn.classList.add('settings-movement-chip--selected');
            btn.setAttribute('aria-checked', 'true');
          }
        } else {
          btn.classList.toggle('settings-movement-chip--selected');
          const checked = btn.classList.contains('settings-movement-chip--selected');
          btn.setAttribute('aria-checked', checked ? 'true' : 'false');
          // Selecting any specific identity clears "mixed"
          const mixedBtn = container.querySelector('[data-movement="mixed"]');
          if (mixedBtn) {
            mixedBtn.classList.remove('settings-movement-chip--selected');
            mixedBtn.setAttribute('aria-checked', 'false');
          }
        }
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

    // Force update — Graeme: "It's strange that my laptop is full and
    // latest version, but phone isn't... the Forced Update might need
    // to cut through those issues." sw.js's fetch handler is cache-
    // first (checked before building this, not assumed) — a stale
    // cached file is served immediately, network is never even
    // consulted, until a new service worker fully takes over. The
    // existing checkForUpdate()/applyUpdate() in app.js only handle
    // the polite path (ask the SW registration to check, apply if
    // waiting) — this button goes further: also clears every cache
    // directly and hard-reloads regardless of SW state, so it works
    // even if the SW itself is what's stuck.
    const forceUpdateBtn = container.querySelector('#settings-force-update-btn');
    if (forceUpdateBtn) {
      forceUpdateBtn.addEventListener('click', async () => {
        const statusEl = container.querySelector('#settings-update-status');
        forceUpdateBtn.disabled = true;
        if (statusEl) statusEl.textContent = 'Checking for updates…';

        try {
          if (window.App?.checkForUpdate) {
            await window.App.checkForUpdate();
          }
          if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map(k => caches.delete(k)));
          }
          if ('serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg) await reg.update();
          }
        } catch (err) {
          console.error('Force update failed:', err);
        }

        if (statusEl) statusEl.textContent = 'Reloading with the latest version…';
        setTimeout(() => window.location.reload(), 400);
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

      case 'toggle-reflection': {
        reflectionExpanded = !reflectionExpanded;
        render(container);
        const toggleBtn = container.querySelector('#settings-reflection-toggle');
        if (toggleBtn) toggleBtn.focus();
        break;
      }

      case 'save-goals': {
        const selectedGoals = [...container.querySelectorAll('[data-goal][aria-checked="true"]')]
          .map(b => b.dataset.goal);
        store.set('goals', selectedGoals);
        _showToast('Goals updated', container);
        break;
      }

      case 'save-movement': {
        const selectedMovement = [...container.querySelectorAll('[data-movement][aria-checked="true"]')]
          .map(b => b.dataset.movement);
        store.set('movementIdentity', selectedMovement);
        _showToast('How you move, updated', container);
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

      case 'open-weekly-plan':
        router.navigate('weekly-plan');
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
        // Fix, 04 Aug 2026 (Phase D-2): now routes to the real Conditions
        // Update screen (conditions-update.js) instead of the limited
        // onboarding sheet, which only ever let you toggle which
        // conditions exist — nothing about severity, goals, or a
        // programme. Matches the original spec: Settings' panel is a
        // shortcut into the same destination Home's Conditions Update
        // door uses, not a separate UI. conditions-update.js has its own
        // "Back" button, which returns to Home rather than back to
        // Settings specifically — a small known rough edge, not a bug
        // (no vanished nav, no nonsensical destination, unlike the old
        // openSheet('onboarding/conditions') bug this replaces).
        router.navigate('conditions-update');
        break;

      case 'edit-equipment':
        // Same fix as edit-conditions, above. equipment.js already has
        // mountContainer()/setSheetDoneCallback() exports built for this
        // exact sheet pattern — reused as-is, no changes to that file.
        openSheet('onboarding/equipment', () => {
          render(container);
        });
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
            router.navigate('onboarding/thread');
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
