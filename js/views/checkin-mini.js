/**
 * checkin-mini.js - Abbreviated Return-Visit Check-In
 *
 * 14 May 2026 v1
 *
 * Triggered when a user returns to the app later in the same day
 * and taps "Yes, tell the coach" on the intention screen prompt.
 *
 * Three questions only — no sleep, no conditions, no time picker:
 *   1. Energy right now (1-10 slider)
 *   2. Mood right now (1-10 slider)
 *   3. Any pain worth flagging? (condition chips, optional)
 *
 * On completion, updates lastCheckin with the new energy/mood values
 * and any changed pain scores, then navigates to intention.
 * The coach-proposal will read the updated values on next proposal.
 *
 * Route: checkin-mini
 * Nav: hidden (focused flow)
 */

import { store }      from "../store.js";
import { CONDITIONS } from "../data/conditions.js";

export const centered = false;

// ── State ─────────────────────────────────────────────────────────────────────
let miniStep     = 0;  // 0 = energy, 1 = mood, 2 = pain, 3 = done
let miniEnergy   = 5;
let miniMood     = 5;
let miniPainScores = {};

const ENERGY_LABELS = [
  "", "Very low", "Very low", "Low", "Low",
  "Moderate", "Moderate", "Good", "Good", "High", "Very high"
];

const MOOD_LABELS = [
  "", "Very low", "Low", "Low", "Okay",
  "Okay", "Good", "Good", "Great", "Great", "Excellent"
];

// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  if (miniStep === 0) return renderEnergy();
  if (miniStep === 1) return renderMood();
  if (miniStep === 2) return renderPain();
  return renderDone();
}

// ── Step 1: Energy ────────────────────────────────────────────────────────────

function renderEnergy() {
  const name = store.get("name") || "";
  return `
    <div class="view checkin-view">
      <div class="checkin-step-header">
        <div class="checkin-step-dots" aria-label="Step 1 of 3">
          <span class="checkin-dot active" aria-current="step"></span>
          <span class="checkin-dot"></span>
          <span class="checkin-dot"></span>
        </div>
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

// ── Step 2: Mood ──────────────────────────────────────────────────────────────

function renderMood() {
  return `
    <div class="view checkin-view">
      <div class="checkin-step-header">
        <div class="checkin-step-dots" aria-label="Step 2 of 3">
          <span class="checkin-dot done"></span>
          <span class="checkin-dot active" aria-current="step"></span>
          <span class="checkin-dot"></span>
        </div>
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

// ── Step 3: Pain ──────────────────────────────────────────────────────────────

function renderPain() {
  const conditions = store.get("conditions") || [];
  const currentPain = store.get("conditionPainScores") || {};

  return `
    <div class="view checkin-view">
      <div class="checkin-step-header">
        <div class="checkin-step-dots" aria-label="Step 3 of 3">
          <span class="checkin-dot done"></span>
          <span class="checkin-dot done"></span>
          <span class="checkin-dot active" aria-current="step"></span>
        </div>
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
              const pending = miniPainScores[id] !== undefined ? miniPainScores[id] : current;
              return `
                <div class="mini-pain-row">
                  <span class="mini-pain-label">
                    ${cond?.icon || ""} ${cond?.name || id}
                  </span>
                  <div class="mini-pain-chips" role="group"
                       aria-label="Pain level for ${cond?.name || id}">
                    ${[0,1,2,3,4,5,6,7,8,9,10].map(n => `
                      <button class="mini-pain-chip ${pending === n ? "selected" : ""}"
                              data-condition="${id}"
                              data-score="${n}"
                              aria-pressed="${pending === n}"
                              aria-label="${n === 0 ? "No pain" : n + " out of 10"}">
                        ${n}
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
            No conditions recorded. Tap Done to continue.
          </p>
        `}
      </div>

      <button class="btn btn-primary btn-large btn-full" id="mini-done-btn"
              style="margin-top: var(--space-6);">
        Done
      </button>
    </div>
  `;
}

// ── Done ──────────────────────────────────────────────────────────────────────

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

// ── Submit ────────────────────────────────────────────────────────────────────

function submitMiniCheckin() {
  // Update lastCheckin energy and mood — preserve everything else
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

  // Bust the workout cache so coach-proposal regenerates with new data
  store.set("workoutsGeneratedAt", null);
  store.set("returnVisit", false);

  miniStep = 3;
  rerender();
}

// ── Rerender ──────────────────────────────────────────────────────────────────

function rerender() {
  const main = document.getElementById("main-content");
  if (main) { main.innerHTML = render(); onMount(); }
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {

  // Skip — abandon mini check-in, go to intention
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

  // Next buttons (energy and mood steps)
  document.getElementById("mini-next-btn")?.addEventListener("click", () => {
    miniStep++;
    rerender();
  });

  // Done button (pain step)
  document.getElementById("mini-done-btn")?.addEventListener("click", () => {
    submitMiniCheckin();
  });

  // Continue from done screen
  document.getElementById("mini-continue-btn")?.addEventListener("click", () => {
    router.navigate("intention");
  });
}
