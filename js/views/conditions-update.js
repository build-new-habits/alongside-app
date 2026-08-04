/**
 * conditions-update.js - Conditions Update
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
 * "Your programme" is ONE shared section below the condition cards,
 * not duplicated per card — prescribedExercises is a flat, ungrouped
 * list in the live schema (confirmed before building, not assumed),
 * so a programme isn't actually condition-scoped today. Only "Build
 * your own" ships (routes into prescribed.js, setting
 * prescribedExercisesOrigin so its coach voice reads correctly).
 * "Coach builds it" / "coach recommends, you select" need real
 * programme-generation logic that doesn't exist yet — deliberately
 * not shown as tiles that say "coming soon"; that's the exact pattern
 * removed elsewhere today (door-2/door-3). They land later as part of
 * NEW-1 (Programme Curation), not invented here as a condition-
 * specific duplicate of that future work.
 *
 * Fold-in dial shown once a programme exists — writes
 * conditionFoldInLevel, read by workoutGenerator.js (Phase D-5, not
 * built this pass; the setting is stored correctly regardless of
 * when the generator hook lands).
 */

import { store } from "../store.js";
import { openSheet } from "./onboarding/sheet-manager.js";
import { CONDITIONS, getConditionName, getPainBand } from "../data/conditions.js";

export function ConditionsUpdateView(router) {

  let expandedIds = new Set();

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
            ${conditions.map(id => _renderCard(id, painScores, goals, reflections)).join("")}
          </div>
        `}

        <button class="btn btn-ghost cu-add-condition" data-action="add-condition"
                aria-label="Add a condition">
          + Add a condition
        </button>

        ${_renderProgramme(prescribed, foldIn)}
      </div>
    `;

    attachEvents(container);
  }

  function _renderCard(id, painScores, goals, reflections) {
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

          </div>
        ` : ""}
      </div>
    `;
  }

  function _renderProgramme(prescribed, foldIn) {
    return `
      <div class="cu-programme" role="region" aria-label="Your programme">
        <h2 class="cu-programme__heading">Your programme</h2>
        ${prescribed.length === 0 ? `
          <p class="cu-programme__intro">
            Want to build your own set of exercises for what's going on? Add them here \u2014
            sets, reps, notes, whatever's useful.
          </p>
          <button class="btn btn-primary" data-action="build-own">Build your own</button>
        ` : `
          <p class="cu-programme__intro">
            You've got ${prescribed.length} exercise${prescribed.length === 1 ? "" : "s"} in your programme.
          </p>
          <button class="btn btn-ghost" data-action="view-programme">View / edit</button>
          ${_renderFoldIn(foldIn)}
        `}
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

    container.querySelector('[data-action="add-condition"]')?.addEventListener("click", () => {
      openSheet("onboarding/conditions", () => render(container));
    });

    container.querySelector('[data-action="build-own"]')?.addEventListener("click", () => {
      // Sets the origin flag only if this is genuinely the first entry —
      // never overwrites an existing 'professional' origin. See Phase D
      // blueprint v3, decision D-2.
      const prescribed = store.get("prescribedExercises") || [];
      if (prescribed.length === 0 && !store.get("prescribedExercisesOrigin")) {
        store.set("prescribedExercisesOrigin", "self");
      }
      router.navigate("prescribed");
    });

    container.querySelector('[data-action="view-programme"]')?.addEventListener("click", () => {
      router.navigate("prescribed");
    });

    container.querySelectorAll("[data-foldin]").forEach(btn => {
      btn.addEventListener("click", () => {
        store.set("conditionFoldInLevel", btn.dataset.foldin === "none" ? null : btn.dataset.foldin);
        render(container);
      });
    });
  }

  return { mount };
}
