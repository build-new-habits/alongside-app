/**
 * checkin-mini.js - Abbreviated Return-Visit Check-In
 *
 * 04 Aug 2026 v4
 *
 * v4 — Pain Input Redesign, same pass as checkin.js v9. Pain step
 *   converted from .ci-quality-chip (None/Mild/Moderate/Severe buttons)
 *   to per-condition sliders, matching checkin.js's new pattern exactly.
 *   This file's own private PAIN_LEVELS/painLevelForScore — a fourth
 *   independent duplicate of the severity-band logic, on top of the
 *   three already found and fixed earlier today — retired in favour of
 *   conditions.js's new canonical getPainBand(). Confirmed nothing else
 *   in this file referenced PAIN_LEVELS after removal.
 *
 * 04 Aug 2026 v3
 *
 * v3 — Severe-pain score corrected 8→9. Found while investigating a
 *   Graeme report against the Home Nav Phase A threshold fix: this file
 *   has always had its own private, duplicate PAIN_LEVELS definition
 *   (same class of problem as core-session.js's private exercise pool,
 *   just smaller) — its "Severe" chip wrote score:8 to the shared
 *   conditionPainScores field, while checkin.js's "Severe" button
 *   writes 9. Both cleared every existing threshold (>=6 subacute,
 *   >=7 acute) so there was no live behavioural bug from this — purely
 *   a single-source-of-truth inconsistency, now closed. "Moderate"
 *   (score:6) already matched checkin.js exactly; not touched.
 *
 * 10 Jul 2026 v2
 *
 * v2 — Styling fix. This file's markup used .checkin-slider,
 *   .checkin-coach-card, .mini-pain-chip, .mini-location-chip and
 *   friends — a class naming convention with no stylesheet anywhere in
 *   the app. checkin.js was rewritten to a conversational thread UI on
 *   01 Jul (checkin-conversation.css, .ci-* prefix throughout) and this
 *   file was never updated to match — it's been rendering completely
 *   unstyled since that rewrite, five days before this fix, not
 *   anything from the current session's work.
 *   Migrated every input widget to reuse the equivalent already-styled
 *   .ci-* class from checkin-conversation.css: sliders now use
 *   .ci-slider/.ci-slider-wrap/.ci-value-row (identical structure to
 *   checkin.js's energy/mood panels), pain chips reuse .ci-quality-chip
 *   (same single-select toggle pattern as checkin.js's sleep-quality
 *   chips), location chips reuse .ci-time-card/.ci-time-grid (a 3-column
 *   icon+label card grid — already exactly 3 columns, a natural fit for
 *   Home/Gym/Outside). Step header and dots are new to this file family
 *   (no existing equivalent) — minimal supporting rules added to
 *   checkin-conversation.css v2 rather than left unstyled.
 *   No behavioural changes — same 4 steps, same store writes.
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
import { CONDITIONS, getPainBand } from "../data/conditions.js";

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

// Pain scoring now uses getPainBand() from conditions.js — the app's
// one canonical band/label source (added 04 Aug 2026, Pain Input
// Redesign). This file's own PAIN_LEVELS/painLevelForScore, a private
// duplicate of the exact same bands, is retired below; this was the
// fourth independent copy of pain-severity logic found in one day
// (conditions.js's real threshold functions, core-session.js's private
// pool filter, coach-proposal.js's _checkModeratePain, and this one).

const LOCATION_OPTIONS = [
  { id: "home",    label: "Home",    sub: "",  icon: "\uD83C\uDFE0" },
  { id: "gym",     label: "Gym",     sub: "",  icon: "\uD83C\uDFCB" },
  { id: "outside", label: "Outside", sub: "",  icon: "\uD83C\uDF33" }
];

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

        <div class="ci-slider-wrap">
          <div class="ci-value-row" id="mini-energy-row" aria-live="polite" aria-atomic="true">
            <span class="ci-value-num" id="mini-energy-num">${miniEnergy}</span>
            <span class="ci-value-label" id="mini-energy-label">${ENERGY_LABELS[miniEnergy] || "Moderate"}</span>
          </div>
          <input type="range"
                 id="mini-energy-slider"
                 class="ci-slider"
                 min="1" max="10" step="1"
                 value="${miniEnergy}"
                 aria-label="Energy level, 1 to 10"
                 aria-valuenow="${miniEnergy}"
                 aria-valuetext="${ENERGY_LABELS[miniEnergy]}">
          <div class="ci-slider-ends" aria-hidden="true">
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

        <div class="ci-slider-wrap">
          <div class="ci-value-row" id="mini-mood-row" aria-live="polite" aria-atomic="true">
            <span class="ci-value-num" id="mini-mood-num">${miniMood}</span>
            <span class="ci-value-label" id="mini-mood-label">${MOOD_LABELS[miniMood] || "Okay"}</span>
          </div>
          <input type="range"
                 id="mini-mood-slider"
                 class="ci-slider"
                 min="1" max="10" step="1"
                 value="${miniMood}"
                 aria-label="Mood, 1 to 10"
                 aria-valuenow="${miniMood}"
                 aria-valuetext="${MOOD_LABELS[miniMood]}">
          <div class="ci-slider-ends" aria-hidden="true">
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
              const band    = getPainBand(pendingScore);
              return `
                <div class="mini-pain-row" data-condition="${id}">
                  <span class="mini-pain-label">
                    ${cond?.icon || ""} ${cond?.name || id}
                  </span>
                  <div class="ci-slider-wrap ci-slider-wrap--condition">
                    <div class="ci-value-row" aria-live="polite" aria-atomic="true">
                      <span class="ci-value-num"   id="mini-pain-num-${id}">${pendingScore}</span>
                      <span class="ci-value-label ci-value-label--${band.id}" id="mini-pain-label-${id}">${band.label}</span>
                    </div>
                    <input type="range" class="ci-slider mini-pain-slider"
                           data-condition="${id}"
                           min="0" max="10" value="${pendingScore}"
                           aria-label="Pain level for ${cond?.name || id}, 0 none to 10 severe"
                           aria-valuetext="${band.label}">
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

        <div class="ci-time-grid" role="group" aria-label="Where are you now?">
          ${LOCATION_OPTIONS.map(loc => `
            <button class="ci-time-card mini-location-chip ${currentLocation === loc.id ? "selected" : ""}"
                    data-location="${loc.id}"
                    aria-pressed="${currentLocation === loc.id}">
              <span class="ci-time-label" aria-hidden="true">${loc.icon} ${loc.label}</span>
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
      const numEl   = document.getElementById("mini-energy-num");
      const labelEl = document.getElementById("mini-energy-label");
      if (numEl)   numEl.textContent   = miniEnergy;
      if (labelEl) labelEl.textContent = ENERGY_LABELS[miniEnergy] || String(miniEnergy);
      energySlider.setAttribute("aria-valuenow", miniEnergy);
      energySlider.setAttribute("aria-valuetext", ENERGY_LABELS[miniEnergy]);
    });
  }

  // Mood slider
  const moodSlider = document.getElementById("mini-mood-slider");
  if (moodSlider) {
    moodSlider.addEventListener("input", () => {
      miniMood = parseInt(moodSlider.value);
      const numEl   = document.getElementById("mini-mood-num");
      const labelEl = document.getElementById("mini-mood-label");
      if (numEl)   numEl.textContent   = miniMood;
      if (labelEl) labelEl.textContent = MOOD_LABELS[miniMood] || String(miniMood);
      moodSlider.setAttribute("aria-valuenow", miniMood);
      moodSlider.setAttribute("aria-valuetext", MOOD_LABELS[miniMood]);
    });
  }

  // Pain sliders
  document.querySelectorAll(".mini-pain-slider").forEach(slider => {
    slider.addEventListener("input", () => {
      const condId = slider.dataset.condition;
      if (!condId) return;
      const n    = parseInt(slider.value);
      const band = getPainBand(n);
      miniPainScores[condId] = n;
      const numEl   = document.getElementById(`mini-pain-num-${condId}`);
      const labelEl = document.getElementById(`mini-pain-label-${condId}`);
      if (numEl)   numEl.textContent   = n;
      if (labelEl) {
        labelEl.textContent = band.label;
        labelEl.className   = `ci-value-label ci-value-label--${band.id}`;
      }
      slider.setAttribute("aria-valuetext", band.label);
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
