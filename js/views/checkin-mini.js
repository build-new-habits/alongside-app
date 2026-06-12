/**
 * checkin-mini.js - Abbreviated Return-Visit Check-In
 *
 * 12 Jun 2026 v1 (S4-4 P1)
 *
 * Triggered when a user returns to the app later in the same day
 * (2+ hours after their original check-in) and taps "Yes, tell the
 * coach" on the intention screen prompt.
 *
 * Four questions only - no sleep, no full conditions step, no time picker:
 *   1. Energy right now (1-10 slider)
 *   2. Mood right now (1-10 slider)
 *   3. Any pain worth flagging? (None / Mild / Moderate / Severe chips)
 *   4. Still in the same place? (location update - home / gym / outside)
 *
 * On completion, updates lastCheckin with the new energy/mood values,
 * any changed pain scores, and sessionLocation if changed, then
 * navigates to intention. The coach-proposal will read the updated
 * values on next proposal.
 *
 * Route: checkin-mini
 * Nav: hidden (focused flow)
 */

import { store }      from "../store.js";
import { CONDITIONS } from "../data/conditions.js";

export const centered = false;

// -- State ---------------------------------------------------------------------
let miniStep     = 0;  // 0 = energy, 1 = mood, 2 = pain, 3 = location, 4 = done
let miniEnergy   = 5;
let miniMood     = 5;
let miniPainScores = {};
let miniLocation = null;

const TOTAL_STEPS = 4;

const ENERGY_LABELS = [
  "", "Very low", "Very low", "Low", "Low",
  "Moderate", "Moderate", "Good", "Good", "High", "Very high"
];

const MOOD_LABELS = [
  "", "Very low", "Low", "Low", "Okay",
  "Okay", "Good", "Good", "Great", "Great", "Excellent"
];

// Pain chip levels - matches checkin.js convention.
// Stored score is the representative value written to conditionPainScores.
const PAIN_LEVELS = [
  { id: "none",     label: "None",     score: 0, min: 0, max: 2 },
  { id: "mild",     label: "Mild",     score: 4, min: 3, max: 5 },
  { id: "moderate", label: "Moderate", score: 6, min: 6, max: 7 },
  { id: "severe",   label: "Severe",   score: 8, min: 8, max: 10 }
];

const LOCATION_OPTIONS = [
  { id: "home",    label: "Home",    icon: "\uD83C\uDFE0" },
  { id: "gym",     label: "Gym",     icon: "\uD83C\uDFCB" },
  { id: "outside", label: "Outside", icon: "\uD83C\uDF33" }
];

function painLevelForScore(score) {
  const level = PAIN_LEVELS.find(l => score >= l.min && score <= l.max);
  return level ? level.id : "none";
}

// -- Render --------------------------------------------------------------------

export function render() {
  if (miniStep === 0) return renderEnergy();
  if (miniStep === 1) return renderMood();
  if (miniStep === 2) return renderPain();
  if (miniStep === 3) return renderLocation();
  return renderDone();
}

function renderDots(activeIndex) {
  return `
    <div class="checkin-step-dots" aria-label="Step ${activeIndex + 1} of ${TOTAL_STEPS}">
      ${Array.from({ length: TOTAL_STEPS }, (_, i) => `
        <span class="checkin-dot ${i < activeIndex ? "done" : i === activeIndex ? "active" : ""}"
              ${i === activeIndex ? "aria-current=\"step\"" : ""}></span>
      `).join("")}
    </div>
  `;
}

// -- Step 1: Energy ------------------------------------------------------------

function renderEnergy() {
  const name = store.get("name") || "";
  return `
    <div class="view checkin-view">
      <div class="checkin-step-header">
        ${renderDots(0)}
        <button class="btn btn-ghost" id="mini-skip-btn"
                aria-label="Skip update and return to today">
          Skip
        </button>
      </div>

      <div class="checkin-question-wrap">
        <div class="card card-coach checkin-coach-card">
          <img src="assets/images/logo-icon-192.png" alt=""
               class="coach-icon-small" aria-hidden="true">
          <p class="coach-message-text">
            ${name ? name + ". " : ""}How is your energy right now?
          </p>
        </div>

        <div class="checkin-slider-section">
          <div class="checkin-slider-value" id="mini-energy-label"
               aria-live="polite" aria-atomic="true">
            ${ENERGY_LABELS[miniEnergy] || "Moderate"}
          </div>
          <input type="range"
                 id="mini-energy-slider"
                 class="checkin-slider"
                 min="1" max="10" step="1"
                 value="${miniEnergy}"
                 aria-label="Energy level, 1 to 10"
                 aria-valuenow="${miniEnergy}"
                 aria-valuetext="${ENERGY_LABELS[miniEnergy]}">
          <div class="checkin-slider-ends" aria-hidden="true">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      </div>

      <button class="btn btn-primary btn-large btn-full" id="mini-next-btn"
              style="margin-top: var(--space-6);">
        Next
      </button>
    </div>
  `;
}

// -- Step 2: Mood --------------------------------------------------------------

function renderMood() {
  return `
    <div class="view checkin-view">
      <div class="checkin-step-header">
        ${renderDots(1)}
        <button class="btn btn-ghost" id="mini-skip-btn"
                aria-label="Skip update and return to today">
          Skip
        </button>
      </div>

      <div class="checkin-question-wrap">
        <div class="card card-coach checkin-coach-card">
          <img src="assets/images/logo-icon-192.png" alt=""
               class="coach-icon-small" aria-hidden="true">
          <p class="coach-message-text">
            And your mood?
          </p>
        </div>

        <div class="checkin-slider-section">
          <div class="checkin-slider-value" id="mini-mood-label"
               aria-live="polite" aria-atomic="true">
            ${MOOD_LABELS[miniMood] || "Okay"}
          </div>
          <input type="range"
                 id="mini-mood-slider"
                 class="checkin-slider"
                 min="1" max="10" step="1"
                 value="${miniMood}"
                 aria-label="Mood, 1 to 10"
                 aria-valuenow="${miniMood}"
                 aria-valuetext="${MOOD_LABELS[miniMood]}">
          <div class="checkin-slider-ends" aria-hidden="true">
            <span>Low</span>
            <span>Good</span>
          </div>
        </div>
      </div>

      <button class="btn btn-primary btn-large btn-full" id="mini-next-btn"
              style="margin-top: var(--space-6);">
        Next
      </button>
    </div>
  `;
}

// -- Step 3: Pain --------------------------------------------------------------

function renderPain() {
  const conditions = store.get("conditions") || [];
  const currentPain = store.get("conditionPainScores") || {};

  return `
    <div class="view checkin-view">
      <div class="checkin-step-header">
        ${renderDots(2)}
        <button class="btn btn-ghost" id="mini-skip-btn"
                aria-label="Skip and return to today">
          Skip
        </button>
      </div>

      <div class="checkin-question-wrap">
        <div class="card card-coach checkin-coach-card">
          <img src="assets/images/logo-icon-192.png" alt=""
               class="coach-icon-small" aria-hidden="true">
          <p class="coach-message-text">
            Anything hurting that I should know about?
          </p>
        </div>

        ${conditions.length > 0 ? `
          <div class="mini-pain-list" role="group" aria-label="Rate any pain">
            ${conditions.map(id => {
              const cond    = CONDITIONS.find(c => c.id === id);
              const current = currentPain[id] || 0;
              const pendingScore = miniPainScores[id] !== undefined ? miniPainScores[id] : current;
              const pendingLevel = painLevelForScore(pendingScore);
              return `
                <div class="mini-pain-row">
                  <span class="mini-pain-label">
                    ${cond?.icon || ""} ${cond?.name || id}
                  </span>
                  <div class="mini-pain-chips" role="group"
                       aria-label="Pain level for ${cond?.name || id}">
                    ${PAIN_LEVELS.map(level => `
                      <button class="mini-pain-chip ${pendingLevel === level.id ? "selected" : ""}"
                              data-condition="${id}"
                              data-score="${level.score}"
                              aria-pressed="${pendingLevel === level.id}">
                        ${level.label}
                      </button>
                    `).join("")}
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        ` : `
          <p class="text-secondary text-sm"
             style="margin-top: var(--space-4);">
            No conditions recorded. Tap Next to continue.
          </p>
        `}
      </div>

      <button class="btn btn-primary btn-large btn-full" id="mini-next-btn"
              style="margin-top: var(--space-6);">
        Next
      </button>
    </div>
  `;
}

// -- Step 4: Location ---------------------------------------------------------

function renderLocation() {
  const currentLocation = miniLocation !== null ? miniLocation : store.get("sessionLocation");

  return `
    <div class="view checkin-view">
      <div class="checkin-step-header">
        ${renderDots(3)}
        <button class="btn btn-ghost" id="mini-skip-btn"
                aria-label="Skip and return to today">
          Skip
        </button>
      </div>

      <div class="checkin-question-wrap">
        <div class="card card-coach checkin-coach-card">
          <img src="assets/images/logo-icon-192.png" alt=""
               class="coach-icon-small" aria-hidden="true">
          <p class="coach-message-text">
            Still in the same place, or has that changed?
          </p>
        </div>

        <div class="mini-location-grid" role="group" aria-label="Where are you now?">
          ${LOCATION_OPTIONS.map(loc => `
            <button class="mini-location-chip ${currentLocation === loc.id ? "selected" : ""}"
                    data-location="${loc.id}"
                    aria-pressed="${currentLocation === loc.id}">
              <span aria-hidden="true">${loc.icon}</span>
              ${loc.label}
            </button>
          `).join("")}
        </div>
        <p class="text-secondary text-sm" style="margin-top: var(--space-3);">
          This helps me suggest the right kind of session.
        </p>
      </div>

      <button class="btn btn-primary btn-large btn-full" id="mini-done-btn"
              style="margin-top: var(--space-6);">
        Done
      </button>
    </div>
  `;
}

// -- Done ----------------------------------------------------------------------

function renderDone() {
  return `
    <div class="view checkin-view" style="text-align: center; padding-top: var(--space-10);">
      <div class="card card-coach" style="text-align: left;">
        <img src="assets/images/logo-icon-192.png" alt=""
             class="coach-icon-small" aria-hidden="true">
        <div>
          <p class="coach-message-text">
            Got it. I have updated my picture of where you are right now.
          </p>
        </div>
      </div>
      <button class="btn btn-primary btn-large btn-full" id="mini-continue-btn"
              style="margin-top: var(--space-6);">
        Continue
      </button>
    </div>
  `;
}

// -- Submit --------------------------------------------------------------------

function submitMiniCheckin() {
  // Update lastCheckin energy and mood - preserve everything else
  const existing = store.get("lastCheckin") || {};
  store.set("lastCheckin", {
    ...existing,
    energy:    miniEnergy,
    mood:      miniMood,
    updatedAt: new Date().toISOString(),
  });

  // Update pain scores if any were set
  if (Object.keys(miniPainScores).length > 0) {
    const currentPain = store.get("conditionPainScores") || {};
    store.set("conditionPainScores", { ...currentPain, ...miniPainScores });
  }

  // Update session location if changed
  if (miniLocation !== null) {
    store.set("sessionLocation", miniLocation);
  }

  // Bust the workout cache so coach-proposal regenerates with new data
  store.set("workoutsGeneratedAt", null);
  store.set("returnVisit", false);

  miniStep = 4;
  rerender();
}

// -- Rerender ------------------------------------------------------------------

function rerender() {
  const main = document.getElementById("main-content");
  if (main) { main.innerHTML = render(); onMount(); }
}

// -- Mount ---------------------------------------------------------------------

export function onMount() {

  // Skip - abandon mini check-in, go to intention
  document.getElementById("mini-skip-btn")?.addEventListener("click", () => {
    store.set("returnVisit", false);
    router.navigate("intention");
  });

  // Energy slider
  const energySlider = document.getElementById("mini-energy-slider");
  if (energySlider) {
    energySlider.addEventListener("input", () => {
      miniEnergy = parseInt(energySlider.value);
      const label = document.getElementById("mini-energy-label");
      if (label) {
        label.textContent = ENERGY_LABELS[miniEnergy] || String(miniEnergy);
      }
      energySlider.setAttribute("aria-valuenow", miniEnergy);
      energySlider.setAttribute("aria-valuetext", ENERGY_LABELS[miniEnergy]);
    });
  }

  // Mood slider
  const moodSlider = document.getElementById("mini-mood-slider");
  if (moodSlider) {
    moodSlider.addEventListener("input", () => {
      miniMood = parseInt(moodSlider.value);
      const label = document.getElementById("mini-mood-label");
      if (label) {
        label.textContent = MOOD_LABELS[miniMood] || String(miniMood);
      }
      moodSlider.setAttribute("aria-valuenow", miniMood);
      moodSlider.setAttribute("aria-valuetext", MOOD_LABELS[miniMood]);
    });
  }

  // Pain chips
  document.querySelectorAll(".mini-pain-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const condId = chip.dataset.condition;
      const score  = parseInt(chip.dataset.score);
      if (!condId) return;
      miniPainScores[condId] = score;
      // Update chip selection without full rerender
      document.querySelectorAll(`.mini-pain-chip[data-condition="${condId}"]`).forEach(c => {
        const isSelected = parseInt(c.dataset.score) === score;
        c.classList.toggle("selected", isSelected);
        c.setAttribute("aria-pressed", isSelected);
      });
    });
  });

  // Location chips
  document.querySelectorAll(".mini-location-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const loc = chip.dataset.location;
      if (!loc) return;
      miniLocation = loc;
      document.querySelectorAll(".mini-location-chip").forEach(c => {
        const isSelected = c.dataset.location === loc;
        c.classList.toggle("selected", isSelected);
        c.setAttribute("aria-pressed", isSelected);
      });
    });
  });

  // Next buttons (energy, mood, pain steps)
  document.getElementById("mini-next-btn")?.addEventListener("click", () => {
    miniStep++;
    rerender();
  });

  // Done button (location step)
  document.getElementById("mini-done-btn")?.addEventListener("click", () => {
    submitMiniCheckin();
  });

  // Continue from done screen
  document.getElementById("mini-continue-btn")?.addEventListener("click", () => {
    router.navigate("intention");
  });
}
