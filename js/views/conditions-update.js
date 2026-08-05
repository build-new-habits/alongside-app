/**
 * conditions-update.js - Conditions Update
 *
 * 04 Aug 2026 v4
 *
 * v4 — Real bug found immediately after shipping the "coach recommends"
 *   selection UI: Graeme couldn't tell which exercises were selected.
 *   Native checkboxes on a dark theme with no explicit colour are easy
 *   to miss at 20px. Each .cu-recommend-item label now gets an
 *   is-selected class matching its checkbox state, styled the same way
 *   every other selection control in this app already is (.cu-goal-pill,
 *   .cu-foldin-btn) — a whole-row background/border change, not reliance
 *   on the tiny native control alone. See conditions-update.css v4.
 *
 * 04 Aug 2026 v3
 *
 * v3 — Real programme-build routes, scoped and built same day
 *   (alongside_scoping_condition_programmes_04aug2026_v1.md).
 *   "Your programme" moved from one shared section at the bottom into
 *   each condition's own card — enabled by prescribedExercises now
 *   carrying an optional conditionId (store.js v16). Three real
 *   routes per card: "Coach builds it" (automatic, js/data/
 *   conditionProgrammes.js, biased by the condition's severity phase
 *   and stated goal), "Coach recommends, I'll choose" (same safe
 *   pool, wider, presented as checkable candidates), "Build my own"
 *   (routes into prescribed.js, now passing which condition via a
 *   single-use context flag). Programmes are one-time, not auto-
 *   regenerating — Graeme's confirmed instinct — "Ask the coach to
 *   rebuild this" is a deliberate re-run, not silent drift. 8
 *   exercises per coach-built programme, not 4-6 — Graeme: "more
 *   substantial... we should be helping the user work towards caring
 *   for and improving their condition."
 *
 * 04 Aug 2026 v2
 *
 * v2 — Real gap found by Graeme after the on-device pass: no way to
 *   remove a condition from this screen. The underlying toggle-off
 *   mechanism already existed (the "Add a condition" sheet lets you
 *   untick an already-selected one), but nothing on this screen made
 *   that discoverable as a "delete" action. Added an explicit "Remove"
 *   action per expanded card, with a confirm dialog reusing settings.js's
 *   _confirmDestructive() pattern (same .settings-dialog CSS, already
 *   loaded app-wide) rather than a jarring native confirm(). Same
 *   minimal-cleanup approach as the existing toggle: removes the id
 *   from `conditions` only, leaves severity/reflections/goal data in
 *   place — consistent with existing behaviour, not a new inconsistency.
 *
 * 04 Aug 2026 v1
 *
 * New screen, Phase D-2 of the Home Nav & Conditions Redesign
 * (alongside_blueprint_phaseD_04aug2026_v3.md). Reachable from Home's
 * Conditions Update door and from Settings' "Edit conditions" shortcut
 * — same destination, not a separate UI, per the original spec.
 *
 * Structure: one collapsed card per logged condition (always collapsed
 * by default, unambiguous chevron affordance — see CSS), each expanding
 * to severity (slider, reusing checkin.js's pattern and CSS exactly),
 * a free-text reflection, and a felt-sense goal (3 options + skip, not
 * numeric — Graeme's own framing: "feel healed, or more able to cope,
 * or improved"). Once a goal is set, a severity trend shows alongside
 * it, sourced from checkinHistory (already recorded daily by full
 * check-in, no new tracking needed) — deliberately descriptive, not
 * judgemental, since conditions fluctuate and editorialising a
 * plateau as failure would cut against the app's "no shame" principle.
 *
 * "Your programme" lives inside each condition's card now (04 Aug 2026,
 * same-day follow-up) — prescribedExercises entries carry a conditionId
 * tag (additive, nullable; entries added the original way stay
 * untagged and keep showing in prescribed.js unfiltered). Three real
 * routes: "Coach builds it" (automatic, js/data/conditionProgrammes.js),
 * "Coach recommends, I'll choose" (same safe pool, wider, presented as
 * checkable candidates), and "Build my own" (routes into prescribed.js,
 * setting prescribedExercisesOrigin so its coach voice reads
 * correctly). Scoped in alongside_scoping_condition_programmes_
 * 04aug2026_v1.md before any of this was written.
 *
 * Fold-in dial shown once a programme exists — writes
 * conditionFoldInLevel, read by workoutGenerator.js (Phase D-5, not
 * built this pass; the setting is stored correctly regardless of
 * when the generator hook lands).
 */

import { store } from "../store.js";
import { openSheet } from "./onboarding/sheet-manager.js";
import { CONDITIONS, getConditionName, getPainBand } from "../data/conditions.js";
import { buildCoachProgramme, buildRecommendedCandidates, commitProgramme } from "../data/conditionProgrammes.js";

export function ConditionsUpdateView(router) {

  let expandedIds = new Set();
  let recommendingIds = new Set();      // conditionIds currently showing the "coach recommends" selection UI
  let selectedCandidates = new Map();   // conditionId -> Set of exercise ids checked in that UI

  function mount(container) {
    render(container);
  }

  // ── Severity trend, from existing checkinHistory — no new tracking ──────

  function _severityTrend(conditionId, days = 14) {
    const history = store.get("checkinHistory") || {};
    const cutoff  = Date.now() - days * 24 * 60 * 60 * 1000;
    const points = Object.entries(history)
      .filter(([date]) => new Date(date).getTime() >= cutoff)
      .map(([date, entry]) => ({ date, score: entry?.conditionLevels?.[conditionId] }))
      .filter(p => p.score !== undefined && p.score !== null)
      .sort((a, b) => a.date.localeCompare(b.date));
    return points;
  }

  function _renderTrend(conditionId) {
    const points = _severityTrend(conditionId);
    if (points.length < 2) {
      return `<p class="cu-trend cu-trend--empty">Not enough history yet to show a trend \u2014 check in a few more times and it'll show here.</p>`;
    }
    const first = getPainBand(points[0].score);
    const last  = getPainBand(points[points.length - 1].score);
    const daySpan = Math.max(1, Math.round(
      (new Date(points[points.length - 1].date) - new Date(points[0].date)) / 86400000
    ));
    const spanLabel = daySpan <= 1 ? "today" : `over the last ${daySpan} days`;
    return first.id === last.id
      ? `<p class="cu-trend">About the same (${last.label}) ${spanLabel}.</p>`
      : `<p class="cu-trend">${first.label} \u2192 ${last.label} ${spanLabel}.</p>`;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  function render(container) {
    const conditions   = store.get("conditions") || [];
    const painScores   = store.get("conditionPainScores") || {};
    const goals        = store.get("conditionGoals") || {};
    const reflections  = store.get("conditionReflections") || [];
    const prescribed   = store.get("prescribedExercises") || [];
    const foldIn       = store.get("conditionFoldInLevel");

    container.innerHTML = `
      <div class="cu-view" role="main" aria-label="Conditions Update">
        <div class="cu-header">
          <button class="btn btn-ghost" data-action="back" aria-label="Back to Home">&larr; Back</button>
          <span class="cu-header-title">Conditions Update</span>
        </div>

        <p class="cu-coach-line">Let's look at how things are going with your body.</p>

        ${conditions.length === 0 ? `
          <p class="cu-empty">Nothing logged yet \u2014 add a condition below whenever you're ready.</p>
        ` : `
          <div class="cu-conditions-list">
            ${conditions.map(id => _renderCard(id, painScores, goals, reflections, prescribed, foldIn)).join("")}
          </div>
        `}

        <button class="btn btn-ghost cu-add-condition" data-action="add-condition"
                aria-label="Add a condition">
          + Add a condition
        </button>
      </div>
    `;

    attachEvents(container);
  }

  function _renderCard(id, painScores, goals, reflections, prescribed, foldIn) {
    const cond      = CONDITIONS.find(c => c.id === id);
    const score     = painScores[id] || 0;
    const band      = getPainBand(score);
    const expanded  = expandedIds.has(id);
    const goal      = goals[id];
    const latest    = [...reflections].reverse().find(r => r.conditionId === id);
    const name      = getConditionName(id);

    return `
      <div class="cu-card ${expanded ? "is-expanded" : ""}" data-condition-card="${id}">
        <button class="cu-card__header" data-action="toggle-card" data-condition="${id}"
                aria-expanded="${expanded}" aria-controls="cu-card-body-${id}">
          <span class="cu-card__icon" aria-hidden="true">${cond?.icon || ""}</span>
          <span class="cu-card__name">${name}</span>
          <span class="cu-card__severity ci-value-label--${band.id}">${band.label}</span>
          <span class="cu-card__chevron" aria-hidden="true">&rsaquo;</span>
        </button>

        ${expanded ? `
          <div class="cu-card__body" id="cu-card-body-${id}">

            <div class="ci-slider-wrap ci-slider-wrap--condition">
              <div class="ci-value-row" aria-live="polite" aria-atomic="true">
                <span class="ci-value-num" id="cu-num-${id}">${score}</span>
                <span class="ci-value-label ci-value-label--${band.id}" id="cu-label-${id}">${band.label}</span>
              </div>
              <input type="range" class="ci-slider cu-severity-slider" data-condition="${id}"
                     min="0" max="10" value="${score}"
                     aria-label="Severity for ${name}, 0 none to 10 severe"
                     aria-valuetext="${band.label}">
            </div>

            <label class="cu-field-label" for="cu-reflect-${id}">
              Anything you want to note about this today?
            </label>
            <textarea class="cu-reflection-input" id="cu-reflect-${id}" data-condition="${id}"
                      rows="2" placeholder="Optional">${latest?.text || ""}</textarea>

            <p class="cu-field-label">What's your aim here?</p>
            <div class="cu-goal-pills" role="group" aria-label="Goal for ${name}">
              <button class="cu-goal-pill ${goal?.goalType === "healed"  ? "selected" : ""}" data-goal="healed"  data-condition="${id}">Feel healed</button>
              <button class="cu-goal-pill ${goal?.goalType === "cope"    ? "selected" : ""}" data-goal="cope"    data-condition="${id}">Cope better day-to-day</button>
              <button class="cu-goal-pill ${goal?.goalType === "improve" ? "selected" : ""}" data-goal="improve" data-condition="${id}">Feel stronger, improve</button>
            </div>
            ${goal ? `
              <button class="cu-goal-clear" data-action="clear-goal" data-condition="${id}">
                Not sure anymore \u2014 clear this
              </button>
              ${_renderTrend(id)}
            ` : `
              <p class="cu-goal-skip-hint">No pressure \u2014 skip this if you're not sure yet.</p>
            `}

            ${_renderProgramme(id, name, goal, prescribed, foldIn)}

            <button class="cu-remove-condition" data-action="remove-condition" data-condition="${id}"
                    aria-label="Remove ${name} from your conditions">
              Remove ${name}
            </button>

          </div>
        ` : ""}
      </div>
    `;
  }

  function _renderProgramme(conditionId, name, goal, prescribed, foldIn) {
    const mine = prescribed.filter(e => e.conditionId === conditionId);

    if (recommendingIds.has(conditionId)) {
      return _renderRecommendSelection(conditionId, name, goal);
    }

    if (mine.length === 0) {
      return `
        <div class="cu-programme-inline">
          <p class="cu-field-label">Want a programme for this?</p>
          <div class="cu-programme-options">
            <button class="btn btn-primary" data-action="coach-build" data-condition="${conditionId}">
              Coach builds it
            </button>
            <button class="btn btn-ghost" data-action="coach-recommend" data-condition="${conditionId}">
              Coach recommends, I'll choose
            </button>
            <button class="btn btn-ghost" data-action="build-own" data-condition="${conditionId}">
              Build my own
            </button>
          </div>
        </div>
      `;
    }

    return `
      <div class="cu-programme-inline">
        <p class="cu-programme__intro">
          ${mine.length} exercise${mine.length === 1 ? "" : "s"} in your programme for ${name}.
        </p>
        <button class="btn btn-ghost" data-action="view-programme" data-condition="${conditionId}">View / edit</button>
        <button class="btn btn-ghost" data-action="coach-build" data-condition="${conditionId}">
          Ask the coach to rebuild this
        </button>
        ${_renderFoldIn(foldIn)}
      </div>
    `;
  }

  function _renderRecommendSelection(conditionId, name, goal) {
    const candidates = buildRecommendedCandidates(conditionId);
    const selected    = selectedCandidates.get(conditionId) || new Set();

    if (candidates.length === 0) {
      return `<p class="cu-programme__intro">Nothing suitable turned up right now \u2014 try "Coach builds it" instead, or build your own.</p>`;
    }

    return `
      <div class="cu-recommend" role="group" aria-label="Choose exercises for ${name}">
        <p class="cu-field-label">Pick the ones that make sense for you \u2014 add as many as you like.</p>
        <div class="cu-recommend-list">
          ${candidates.map(ex => `
            <label class="cu-recommend-item ${selected.has(ex.id) ? "is-selected" : ""}">
              <input type="checkbox" data-candidate="${ex.id}" data-condition="${conditionId}"
                     ${selected.has(ex.id) ? "checked" : ""}>
              <span>${ex.name}</span>
            </label>
          `).join("")}
        </div>
        <div class="cu-recommend-actions">
          <button class="btn btn-ghost" data-action="cancel-recommend" data-condition="${conditionId}">Cancel</button>
          <button class="btn btn-primary" data-action="confirm-recommend" data-condition="${conditionId}"
                  ${selected.size === 0 ? "disabled" : ""}>
            Add ${selected.size || ""} to my programme
          </button>
        </div>
      </div>
    `;
  }

  function _renderFoldIn(current) {
    const opts = [
      { id: "partial", label: "A little" },
      { id: "mostly",  label: "Mostly" },
      { id: "all",     label: "Fully" },
      { id: "none",    label: "Keep separate" },
    ];
    return `
      <div class="cu-foldin">
        <p class="cu-field-label">Fold this into your Cardio, Core &amp; Strength sessions?</p>
        <div class="cu-foldin-options" role="group" aria-label="How much to include your programme in regular sessions">
          ${opts.map(o => `
            <button class="cu-foldin-btn ${(current || "none") === o.id ? "selected" : ""}"
                    data-foldin="${o.id}">${o.label}</button>
          `).join("")}
        </div>
      </div>
    `;
  }

  // ── Events ──────────────────────────────────────────────────────────────

  function attachEvents(container) {
    container.querySelector('[data-action="back"]')?.addEventListener("click", () => {
      router.navigate("today");
    });

    container.querySelectorAll('[data-action="toggle-card"]').forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.condition;
        if (expandedIds.has(id)) expandedIds.delete(id); else expandedIds.add(id);
        render(container);
      });
    });

    container.querySelectorAll(".cu-severity-slider").forEach(slider => {
      slider.addEventListener("input", () => {
        const id   = slider.dataset.condition;
        const n    = parseInt(slider.value);
        const band = getPainBand(n);
        store.set("conditionPainScores", { ...(store.get("conditionPainScores") || {}), [id]: n });
        const numEl   = container.querySelector(`#cu-num-${id}`);
        const labelEl = container.querySelector(`#cu-label-${id}`);
        if (numEl)   numEl.textContent = n;
        if (labelEl) {
          labelEl.textContent = band.label;
          labelEl.className   = `ci-value-label ci-value-label--${band.id}`;
        }
        slider.setAttribute("aria-valuetext", band.label);
      });
    });

    container.querySelectorAll(".cu-reflection-input").forEach(ta => {
      ta.addEventListener("blur", () => {
        const id   = ta.dataset.condition;
        const text = ta.value.trim();
        if (!text) return;
        const reflections = store.get("conditionReflections") || [];
        reflections.push({ conditionId: id, text, loggedAt: new Date().toISOString() });
        store.set("conditionReflections", reflections);
      });
    });

    container.querySelectorAll("[data-goal]").forEach(btn => {
      btn.addEventListener("click", () => {
        store.setConditionGoal(btn.dataset.condition, btn.dataset.goal);
        render(container);
      });
    });

    container.querySelectorAll('[data-action="clear-goal"]').forEach(btn => {
      btn.addEventListener("click", () => {
        store.setConditionGoal(btn.dataset.condition, null);
        render(container);
      });
    });

    // Fix, 04 Aug 2026: found by Graeme after the on-device pass —
    // there was no direct way to remove a condition from this screen.
    // The underlying toggle-off mechanism already existed (the "Add a
    // condition" sheet lets you untick an already-selected condition),
    // but that's not a "delete" action anyone would find from here.
    // Same minimal-cleanup approach as that existing toggle: removes
    // the id from `conditions` only. Severity/reflections/goal data is
    // left in place, harmlessly orphaned — consistent with how the
    // existing toggle already behaves, not a new inconsistency.
    container.querySelectorAll('[data-action="remove-condition"]').forEach(btn => {
      btn.addEventListener("click", () => {
        const id   = btn.dataset.condition;
        const name = getConditionName(id);
        _confirmRemove(name, () => {
          const conditions = (store.get("conditions") || []).filter(c => c !== id);
          store.set("conditions", conditions);
          expandedIds.delete(id);
          recommendingIds.delete(id);
          selectedCandidates.delete(id);
          render(container);
        });
      });
    });

    container.querySelector('[data-action="add-condition"]')?.addEventListener("click", () => {
      openSheet("onboarding/conditions", () => render(container));
    });

    // "Build my own" — sets which condition new entries should be
    // tagged with (prescribed.js reads this when constructing a new
    // entry), plus the origin flag for its coach-voice branch (Phase
    // D-2, decision D-2) — only if this is genuinely the first entry
    // overall, never overwrites an existing 'professional' origin.
    container.querySelectorAll('[data-action="build-own"]').forEach(btn => {
      btn.addEventListener("click", () => {
        const conditionId = btn.dataset.condition;
        const prescribed  = store.get("prescribedExercises") || [];
        if (prescribed.length === 0 && !store.get("prescribedExercisesOrigin")) {
          store.set("prescribedExercisesOrigin", "self");
        }
        store.set("prescribedExercisesActiveCondition", conditionId);
        router.navigate("prescribed");
      });
    });

    container.querySelectorAll('[data-action="view-programme"]').forEach(btn => {
      btn.addEventListener("click", () => {
        store.set("prescribedExercisesActiveCondition", btn.dataset.condition);
        router.navigate("prescribed");
      });
    });

    // "Coach builds it" — automatic. Real, working generation
    // (js/data/conditionProgrammes.js), not a placeholder. Replaces
    // any existing programme for this condition if one already exists
    // (commitProgramme() only touches entries tagged with this
    // conditionId) — a fresh, deliberate rebuild, not silent drift;
    // matches Graeme's confirmed instinct that programmes shouldn't
    // regenerate on their own.
    container.querySelectorAll('[data-action="coach-build"]').forEach(btn => {
      btn.addEventListener("click", () => {
        const conditionId = btn.dataset.condition;
        const goals       = store.get("conditionGoals") || {};
        const goalType    = goals[conditionId]?.goalType || null;
        const exercises   = buildCoachProgramme(conditionId, goalType);
        commitProgramme(conditionId, exercises, "coach");
        render(container);
      });
    });

    container.querySelectorAll('[data-action="coach-recommend"]').forEach(btn => {
      btn.addEventListener("click", () => {
        recommendingIds.add(btn.dataset.condition);
        selectedCandidates.set(btn.dataset.condition, new Set());
        render(container);
      });
    });

    container.querySelectorAll('[data-action="cancel-recommend"]').forEach(btn => {
      btn.addEventListener("click", () => {
        recommendingIds.delete(btn.dataset.condition);
        selectedCandidates.delete(btn.dataset.condition);
        render(container);
      });
    });

    container.querySelectorAll("[data-candidate]").forEach(checkbox => {
      checkbox.addEventListener("change", () => {
        const conditionId = checkbox.dataset.condition;
        const exId        = checkbox.dataset.candidate;
        const set          = selectedCandidates.get(conditionId) || new Set();
        if (checkbox.checked) set.add(exId); else set.delete(exId);
        selectedCandidates.set(conditionId, set);
        render(container);
      });
    });

    container.querySelectorAll('[data-action="confirm-recommend"]').forEach(btn => {
      btn.addEventListener("click", () => {
        const conditionId = btn.dataset.condition;
        const selectedIds  = selectedCandidates.get(conditionId) || new Set();
        if (selectedIds.size === 0) return;
        const candidates   = buildRecommendedCandidates(conditionId);
        const chosen       = candidates.filter(ex => selectedIds.has(ex.id));
        commitProgramme(conditionId, chosen, "coach-recommended");
        recommendingIds.delete(conditionId);
        selectedCandidates.delete(conditionId);
        render(container);
      });
    });

    container.querySelectorAll("[data-foldin]").forEach(btn => {
      btn.addEventListener("click", () => {
        store.set("conditionFoldInLevel", btn.dataset.foldin === "none" ? null : btn.dataset.foldin);
        render(container);
      });
    });
  }

  // ── Confirm dialog (remove condition) ────────────────────────────────────
  // Same pattern as settings.js's _confirmDestructive() — reuses that
  // file's .settings-dialog CSS (already loaded app-wide via main.css),
  // not reinvented, so removing a condition feels consistent with every
  // other destructive action in the app rather than a jarring native
  // confirm().

  function _confirmRemove(name, onConfirm) {
    const existing = document.getElementById('cu-confirm-dialog');
    if (existing) existing.remove();

    const dialog = document.createElement('div');
    dialog.id = 'cu-confirm-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'cu-confirm-title');
    dialog.className = 'settings-dialog';
    dialog.innerHTML = `
      <div class="settings-dialog__backdrop"></div>
      <div class="settings-dialog__content">
        <h2 class="settings-dialog__title" id="cu-confirm-title">Remove ${name}?</h2>
        <p class="settings-dialog__message">This removes it from your conditions list. Your severity history, reflections, and any goal stay recorded, they just won't show here any more.</p>
        <div class="settings-dialog__actions">
          <button class="btn btn-ghost" id="cu-confirm-cancel">Cancel</button>
          <button class="btn btn-danger" id="cu-confirm-ok">Remove</button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

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

    dialog.querySelector('#cu-confirm-cancel').addEventListener('click', () => dialog.remove());
    dialog.querySelector('#cu-confirm-ok').addEventListener('click', () => {
      dialog.remove();
      onConfirm();
    });
    dialog.querySelector('.settings-dialog__backdrop').addEventListener('click', () => dialog.remove());
  }

  return { mount };
}
