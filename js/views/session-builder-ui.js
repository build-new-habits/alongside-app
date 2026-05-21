/**
 * js/views/session-builder-ui.js - Session Builder UI
 *
 * 21 May 2026 v1
 *
 * The user-facing flow for building a bespoke gym session:
 *   1. Pick session type (7 tiles)
 *   2. Choose duration (15 / 30 / 45 / 60 min)
 *   3. Equipment check (pre-filled from settings, overridable this session)
 *   4. Loading state with coach line
 *   5. Session preview — coach rationale + exercise overview
 *   6. "Let's go" → gym-programme.js renders the generated session
 *
 * Tier gating:
 *   Free: "Balanced Full-Body" only. Duration fixed at 30 min.
 *         Equipment override not available.
 *   Personal+: All 7 session types. All durations. Equipment override.
 *
 * Route: "session-builder"
 * Entry points:
 *   - Coach proposal "Something else entirely" button
 *   - Library tab "Build a session" tile
 *
 * Spec: alongside_session_builder_spec_17may2026_v1.docx
 */

import { store }                          from "../store.js";
import { router }                         from "../router.js";
import { SESSION_TYPES, buildSession }    from "../session-builder.js";

export const centered = false;

// ── State ─────────────────────────────────────────────────────────────────────
let phase            = "type";      // "type" | "duration" | "equipment" | "loading" | "preview" | "done"
let selectedType     = null;
let selectedDuration = null;
let equipmentOverride = null;       // null = use store defaults; array = this-session override
let builtSession     = null;

// ── Tier check ────────────────────────────────────────────────────────────────
function isPremium() {
  const tier = store.get("userTier") || "free";
  return tier === "personal" || tier === "athlete";
}

// ── Duration options ──────────────────────────────────────────────────────────
const DURATIONS = [
  { mins: 15, label: "15 min", desc: "Quick and focused" },
  { mins: 30, label: "30 min", desc: "A proper session" },
  { mins: 45, label: "45 min", desc: "Full programme" },
  { mins: 60, label: "60 min", desc: "When you have the time" }
];

// ── Equipment list (subset of store.equipment values) ─────────────────────────
const EQUIPMENT_OPTIONS = [
  { id: "dumbbells",        label: "Dumbbells" },
  { id: "barbell",          label: "Barbell" },
  { id: "kettlebells",      label: "Kettlebells" },
  { id: "cable-machine",    label: "Cable machine" },
  { id: "resistance-bands", label: "Resistance bands" },
  { id: "bench",            label: "Bench" },
  { id: "squat-rack",       label: "Squat rack" },
  { id: "pull-up-bar",      label: "Pull-up bar" },
  { id: "box-or-step",      label: "Box or step" },
  { id: "foam-roller",      label: "Foam roller" },
  { id: "leg-curl-machine", label: "Leg curl machine" }
];

// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  if (phase === "type")      return renderTypePicker();
  if (phase === "duration")  return renderDurationPicker();
  if (phase === "equipment") return renderEquipmentCheck();
  if (phase === "loading")   return renderLoading();
  if (phase === "preview")   return renderPreview();
  return renderTypePicker();
}

function renderTypePicker() {
  const premium = isPremium();
  const types   = premium ? SESSION_TYPES : SESSION_TYPES.filter(t => t.id === "full");

  return `
    <div class="view session-builder-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="sb-back-btn" aria-label="Go back">
          ← Back
        </button>
        <span class="workout-header-title">Build a session</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-5);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">
          Tell me what you want to work on today. I'll build something around your equipment and how you're feeling.
        </p>
      </div>

      <div class="sb-type-grid" role="group" aria-label="Choose session type">
        ${SESSION_TYPES.map(t => {
          const locked = !premium && t.id !== "full";
          return `
            <button class="sb-type-tile ${locked ? "sb-type-tile--locked" : ""}"
                    data-type="${t.id}"
                    ${locked ? 'aria-label="' + t.label + ' — Personal tier" aria-disabled="true"' : 'aria-label="' + t.label + '"'}
                    ${locked ? 'disabled' : ''}>
              <span class="sb-type-icon" aria-hidden="true">${t.icon}</span>
              <span class="sb-type-label">${t.label}</span>
              <span class="sb-type-desc text-xs text-muted">${t.description}</span>
              ${locked ? '<span class="sb-lock-badge" aria-hidden="true">Personal</span>' : ""}
            </button>
          `;
        }).join("")}
      </div>

      ${!premium ? `
        <p class="text-xs text-muted" style="text-align:center; margin-top: var(--space-4);">
          All session types are available on the Personal plan.
        </p>
      ` : ""}

    </div>
  `;
}

function renderDurationPicker() {
  const premium = isPremium();
  const type    = SESSION_TYPES.find(t => t.id === selectedType);

  return `
    <div class="view session-builder-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="sb-back-btn" aria-label="Back to session type">
          ← Back
        </button>
        <span class="workout-header-title">${type?.label || "Build a session"}</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-5);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">How long have you got today?</p>
      </div>

      <div class="sb-duration-grid" role="group" aria-label="Choose duration">
        ${DURATIONS.map(d => {
          const locked = !premium && d.mins !== 30;
          return `
            <button class="sb-duration-btn ${locked ? "sb-duration-btn--locked" : ""} ${d.mins === 30 ? "sb-duration-btn--recommended" : ""}"
                    data-mins="${d.mins}"
                    ${locked ? "disabled" : ""}
                    aria-label="${d.label}: ${d.desc}${locked ? " — Personal tier" : ""}">
              <span class="sb-duration-label">${d.label}</span>
              <span class="sb-duration-desc text-xs text-muted">${d.desc}</span>
              ${!locked && d.mins === 30 ? '<span class="sb-recommended text-xs">Recommended</span>' : ""}
              ${locked ? '<span class="sb-lock-badge" aria-hidden="true">Personal</span>' : ""}
            </button>
          `;
        }).join("")}
      </div>

    </div>
  `;
}

function renderEquipmentCheck() {
  const savedEquip   = store.get("equipment") || [];
  const currentEquip = equipmentOverride ?? savedEquip;
  const equipSet     = new Set(currentEquip);

  return `
    <div class="view session-builder-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="sb-back-btn" aria-label="Back to duration">
          ← Back
        </button>
        <span class="workout-header-title">Equipment today</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-4);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">
          Here's what I think you have access to today. Untick anything you don't — I'll adjust the session.
          Changes here don't affect your saved settings.
        </p>
      </div>

      <div class="sb-equipment-list" role="group" aria-label="Equipment available today">
        ${EQUIPMENT_OPTIONS.map(opt => `
          <label class="sb-equipment-item">
            <input type="checkbox"
                   class="sb-equipment-check"
                   data-equipment="${opt.id}"
                   ${equipSet.has(opt.id) ? "checked" : ""}
                   aria-label="${opt.label}">
            <span class="sb-equipment-label">${opt.label}</span>
          </label>
        `).join("")}
      </div>

      <button class="btn btn-primary btn-large btn-full" id="sb-build-btn"
              style="margin-top: var(--space-6);">
        Build my session
      </button>

    </div>
  `;
}

function renderLoading() {
  const type = SESSION_TYPES.find(t => t.id === selectedType);
  return `
    <div class="view session-builder-view" style="text-align: center;">
      <div style="margin-top: var(--space-10);">
        <div class="card card-coach">
          <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
          <p class="coach-message-text" aria-live="polite" aria-busy="true">
            Building your ${type?.label?.toLowerCase() || "session"} — one moment.
          </p>
        </div>
        <div class="sb-loading-spinner" aria-hidden="true"></div>
      </div>
    </div>
  `;
}

function renderPreview() {
  if (!builtSession) return renderLoading();

  const type = SESSION_TYPES.find(t => t.id === selectedType);
  const warmup   = builtSession.exercises.filter(e => e.section === "warmup");
  const main     = builtSession.exercises.filter(e => e.section === "main");
  const cooldown = builtSession.exercises.filter(e => e.section === "cooldown");

  return `
    <div class="view session-builder-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="sb-back-btn" aria-label="Build a different session">
          ← Different session
        </button>
        <span class="workout-header-title">${builtSession.title}</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-4);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div>
          <p class="coach-message-text">${builtSession.coachLine}</p>
          <p class="text-sm text-muted" style="margin-top: var(--space-2);">
            ${builtSession.duration} &nbsp;·&nbsp; ${builtSession.exercises.length} exercises
          </p>
        </div>
      </div>

      <!-- Exercise overview — all visible before committing -->
      <div class="sb-exercise-list" role="list">

        ${warmup.length > 0 ? `
          <p class="sb-section-label text-xs text-muted">Warm-up</p>
          ${warmup.map(ex => `
            <div class="sb-exercise-item" role="listitem">
              <div class="sb-exercise-left">
                <span class="sb-exercise-name">${ex.name}</span>
                <span class="sb-exercise-meta text-xs text-muted">
                  ${ex.sets} sets &nbsp; ${ex.reps || (ex.duration + "s")} &nbsp; ${ex.tempo}
                </span>
              </div>
            </div>
          `).join("")}
        ` : ""}

        ${main.length > 0 ? `
          <p class="sb-section-label text-xs text-muted" style="margin-top: var(--space-3);">Main session</p>
          ${main.map(ex => `
            <div class="sb-exercise-item" role="listitem">
              <div class="sb-exercise-left">
                <span class="sb-exercise-name">${ex.name}</span>
                <span class="sb-exercise-meta text-xs text-muted">
                  ${ex.sets} sets &nbsp; ${ex.reps || (ex.duration + "s")} &nbsp; ${ex.tempo}
                  ${ex.rest && ex.rest !== "0s" ? "&nbsp; rest " + ex.rest : ""}
                </span>
              </div>
            </div>
          `).join("")}
        ` : ""}

        ${cooldown.length > 0 ? `
          <p class="sb-section-label text-xs text-muted" style="margin-top: var(--space-3);">Cool-down</p>
          ${cooldown.map(ex => `
            <div class="sb-exercise-item" role="listitem">
              <div class="sb-exercise-left">
                <span class="sb-exercise-name">${ex.name}</span>
                <span class="sb-exercise-meta text-xs text-muted">
                  ${ex.reps || (ex.duration + "s")} &nbsp; ${ex.tempo}
                </span>
              </div>
            </div>
          `).join("")}
        ` : ""}

      </div>

      <div style="display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-6);">
        <button class="btn btn-primary btn-large btn-full" id="sb-go-btn">
          Let's go
        </button>
        <button class="btn btn-ghost btn-full" id="sb-rebuild-btn">
          Build a different one
        </button>
      </div>

    </div>
  `;
}

// ── Rerender ──────────────────────────────────────────────────────────────────

function rerender() {
  const main = document.getElementById("main-content");
  if (main) {
    main.innerHTML = render();
    onMount();
  }
}

// ── Build and navigate ────────────────────────────────────────────────────────

function triggerBuild() {
  phase = "loading";
  rerender();

  // Artificial pause (1.2s) makes the coach feel like she's thinking
  setTimeout(() => {
    builtSession = buildSession({
      sessionType:       selectedType,
      durationMins:      selectedDuration,
      equipmentOverride: equipmentOverride
    });

    if (!builtSession) {
      // Fallback — should not happen
      router.navigate("today");
      return;
    }

    phase = "preview";
    rerender();
  }, 1200);
}

function resetState() {
  phase             = "type";
  selectedType      = null;
  selectedDuration  = null;
  equipmentOverride = null;
  builtSession      = null;
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {

  // Back button behaviour varies by phase
  document.getElementById("sb-back-btn")?.addEventListener("click", () => {
    if (phase === "type") {
      resetState();
      router.navigate("today");
    } else if (phase === "duration") {
      phase = "type";
      rerender();
    } else if (phase === "equipment") {
      phase = "duration";
      rerender();
    } else if (phase === "preview") {
      resetState();
      rerender();
    } else {
      resetState();
      router.navigate("today");
    }
  });

  // Type selection
  document.querySelectorAll(".sb-type-tile:not([disabled])").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedType = btn.dataset.type;
      if (isPremium()) {
        phase = "duration";
      } else {
        selectedType     = "full";
        selectedDuration = 30;
        phase            = "equipment";
      }
      rerender();
    });
  });

  // Duration selection
  document.querySelectorAll(".sb-duration-btn:not([disabled])").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedDuration = parseInt(btn.dataset.mins);
      if (isPremium()) {
        phase            = "equipment";
        equipmentOverride = [...(store.get("equipment") || [])];
      } else {
        selectedDuration  = 30;
        equipmentOverride = [...(store.get("equipment") || [])];
        triggerBuild();
      }
      rerender();
    });
  });

  // Equipment toggles
  document.querySelectorAll(".sb-equipment-check").forEach(cb => {
    cb.addEventListener("change", () => {
      // Rebuild override from current checkbox state
      const checked = Array.from(
        document.querySelectorAll(".sb-equipment-check:checked")
      ).map(c => c.dataset.equipment);
      equipmentOverride = checked;
    });
  });

  // Build button
  document.getElementById("sb-build-btn")?.addEventListener("click", () => {
    // Capture final equipment state
    const checked = Array.from(
      document.querySelectorAll(".sb-equipment-check:checked")
    ).map(c => c.dataset.equipment);
    equipmentOverride = checked;
    triggerBuild();
  });

  // Let's go — navigate to gym-programme which reads generatedSession
  document.getElementById("sb-go-btn")?.addEventListener("click", () => {
    // gym-programme.js will read store.get("generatedSession").session
    // and render it in place of the hardcoded PROGRAMME
    store.set("usingGeneratedSession", true);
    router.navigate("gym-programme");
  });

  // Build a different one
  document.getElementById("sb-rebuild-btn")?.addEventListener("click", () => {
    builtSession = null;
    phase        = "type";
    rerender();
  });
}
