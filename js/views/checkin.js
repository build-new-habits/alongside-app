/**
 * checkin.js - Daily Check-In View
 *
 * 01 Jun 2026 v1
 *
 * v1 -- Sleep pre-fill:
 *   On first check-in of the day, sleepHours and sleepQuality are
 *   pre-filled from yesterday's check-in rather than defaulting to
 *   7 hours / "okay". User corrects if wrong rather than starting blank.
 *   Pre-fill only applies when no today check-in exists yet -- the
 *   update path (returning to check-in mid-day) is unaffected.
 *
 * 30 May 2026 v1
 *
 * v1.4 -- Route change:
 *   submitCheckin() now navigates to coach-reflection instead of intention.
 *
 * v1.3 -- availableTime picker added.
 * v1.2 -- Pain score wiring added.
 */

import { store } from "../store.js";
import { checkinData } from "../data/checkin.js";
import { CONDITIONS } from "../data/conditions.js";

export const centered = false;

const TIME_OPTIONS = [
  { value: "micro",    label: "Micro",    sub: "10 min" },
  { value: "quick",    label: "Quick",    sub: "20 min" },
  { value: "short",    label: "Short",    sub: "30 min" },
  { value: "standard", label: "Standard", sub: "40 min" },
  { value: "long",     label: "Long",     sub: "50 min" },
  { value: "open",     label: "Open",     sub: "60+ min" }
];

let checkinStep = 0;

let currentCheckin = {
  energy: 5,
  mood: 5,
  sleepHours: 7,
  sleepQuality: "okay",
  conditionLevels: {},
  cycleDay: null,
  notes: ""
};

let selectedAvailableTime = null;

function getCoachBridge(fromStep, value) {
  if (fromStep === 0) {
    if (value >= 8) return "Good energy. Let's see what else is going on.";
    if (value >= 6) return "Solid. How about your mood?";
    if (value >= 4) return "Okay, I hear that. How's your mood sitting alongside that?";
    return "That's low. I want to understand the full picture.";
  }
  if (fromStep === 1) {
    if (value >= 8) return "Good. And sleep -- how was last night?";
    if (value >= 5) return "Alright. Last question -- how did you sleep?";
    return "Understood. Sleep affects everything -- tell me about last night.";
  }
  return "";
}

function getCoachSummary() {
  const e = currentCheckin.energy;
  const m = currentCheckin.mood;
  const s = currentCheckin.sleepHours;
  const time = selectedAvailableTime;
  const timeLabel = { micro: "10 minutes", quick: "20 minutes", short: "30 minutes",
                      standard: "40 minutes", long: "50 minutes", open: "an hour or more" };

  let summary = "";
  if (e >= 7 && m >= 7) summary = "Good energy, good mood";
  else if (e >= 7) summary = "Good energy";
  else if (m >= 7) summary = "Good mood";
  else if (e <= 3 || m <= 3) summary = "A harder day";
  else summary = "A moderate day";

  if (s >= 8) summary += ", well rested.";
  else if (s >= 6) summary += ", " + s + " hours sleep.";
  else summary += ", lighter sleep than usual.";

  if (time) summary += " You have " + (timeLabel[time] || time) + " today.";
  summary += " I'll have something ready for you.";
  return summary;
}

export function render() {
  const existing = checkinData.getTodaysCheckin();

  if (existing) {
    // Returning to update today's check-in -- restore exactly what was saved
    currentCheckin = { ...currentCheckin, ...existing };
  } else {
    // First check-in of the day -- pre-fill sleep from yesterday if available
    const history = checkinData.getHistory(1) || [];
    const yesterday = history[0] || null;
    if (yesterday && typeof yesterday.sleepHours === "number") {
      currentCheckin.sleepHours   = yesterday.sleepHours;
      currentCheckin.sleepQuality = yesterday.sleepQuality || "okay";
    }
  }

  selectedAvailableTime = store.get("availableTime") || null;

  const conditions = store.get("conditions") || [];
  const name = (store.get("name") || "").split(" ")[0] || "there";

  const steps = [0, 1, 2];
  if (conditions.length > 0) steps.push(3);
  steps.push(4, 5);

  const currentStepId = steps[Math.min(checkinStep, steps.length - 1)];
  return renderStep(currentStepId, name, conditions);
}

function renderStep(stepId, name, conditions) {
  const totalSteps = conditions.length > 0 ? 6 : 5;
  const stepNum    = checkinStep + 1;

  const header = `
    <div class="checkin-step-header">
      <div class="checkin-progress-dots" role="progressbar"
           aria-valuenow="${checkinStep}" aria-valuemin="0" aria-valuemax="${totalSteps}"
           aria-label="Check-in step ${stepNum} of ${totalSteps}">
        ${Array.from({ length: totalSteps }, (_, i) => `
          <div class="checkin-dot ${i < stepNum ? "done" : i === checkinStep ? "current" : ""}"
               aria-hidden="true"></div>
        `).join("")}
      </div>
    </div>
  `;

  if (stepId === 0) return renderEnergyStep(header, name);
  if (stepId === 1) return renderMoodStep(header);
  if (stepId === 2) return renderSleepStep(header);
  if (stepId === 3) return renderConditionsStep(header, conditions);
  if (stepId === 4) return renderTimeStep(header);
  if (stepId === 5) return renderSummaryStep(header);
  return renderEnergyStep(header, name);
}

function renderEnergyStep(header, name) {
  const val   = currentCheckin.energy;
  const emoji = checkinData.getEnergyEmoji(val);
  const label = checkinData.getEnergyLabel(val);
  const hour  = new Date().getHours();
  const greeting = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";

  return `
    <div class="view checkin-step-view">
      ${header}
      <div class="checkin-step-body">
        <div class="checkin-coach-line">
          <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-xs" aria-hidden="true">
          <p>${greeting} ${name}. How's your energy today?</p>
        </div>
        <div class="checkin-slider-block">
          <div class="checkin-value-display" aria-live="polite" aria-atomic="true">
            <span class="checkin-value-emoji" id="energy-emoji" aria-hidden="true">${emoji}</span>
            <span class="checkin-value-number" id="energy-number">${val}</span>
            <span class="checkin-value-label" id="energy-label">${label}</span>
          </div>
          <input type="range" id="energy-slider" class="checkin-slider"
                 min="1" max="10" value="${val}"
                 aria-label="Energy level, 1 exhausted to 10 energised"
                 aria-valuetext="${label}">
          <div class="checkin-slider-ends" aria-hidden="true">
            <span>Exhausted</span><span>Energised</span>
          </div>
        </div>
      </div>
      <div class="checkin-step-actions">
        <button class="btn btn-primary btn-large btn-full" id="checkin-next-btn"
                aria-label="Continue to mood">Next</button>
      </div>
    </div>
  `;
}

function renderMoodStep(header) {
  const val    = currentCheckin.mood;
  const emoji  = checkinData.getMoodEmoji(val);
  const label  = checkinData.getMoodLabel(val);
  const bridge = getCoachBridge(0, currentCheckin.energy);

  return `
    <div class="view checkin-step-view">
      ${header}
      <div class="checkin-step-body">
        <div class="checkin-coach-line">
          <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-xs" aria-hidden="true">
          <p>${bridge}</p>
        </div>
        <div class="checkin-slider-block">
          <p class="checkin-question">How's your mood?</p>
          <div class="checkin-value-display" aria-live="polite" aria-atomic="true">
            <span class="checkin-value-emoji" id="mood-emoji" aria-hidden="true">${emoji}</span>
            <span class="checkin-value-number" id="mood-number">${val}</span>
            <span class="checkin-value-label" id="mood-label">${label}</span>
          </div>
          <input type="range" id="mood-slider" class="checkin-slider"
                 min="1" max="10" value="${val}"
                 aria-label="Mood, 1 struggling to 10 great"
                 aria-valuetext="${label}">
          <div class="checkin-slider-ends" aria-hidden="true">
            <span>Struggling</span><span>Great</span>
          </div>
        </div>
      </div>
      <div class="checkin-step-actions">
        <button class="btn btn-primary btn-large btn-full" id="checkin-next-btn">Next</button>
        <button class="btn btn-ghost btn-small" id="checkin-back-btn"
                style="margin-top:var(--space-2);">&larr; Back</button>
      </div>
    </div>
  `;
}

function renderSleepStep(header) {
  const bridge = getCoachBridge(1, currentCheckin.mood);

  // Check if values were pre-filled from yesterday
  const existing  = checkinData.getTodaysCheckin();
  const history   = checkinData.getHistory(1) || [];
  const prefilled = !existing && history[0]?.sleepHours;
  const coachLine = prefilled
    ? bridge + " I've pre-filled this from yesterday -- adjust if needed."
    : bridge;

  return `
    <div class="view checkin-step-view">
      ${header}
      <div class="checkin-step-body">
        <div class="checkin-coach-line">
          <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-xs" aria-hidden="true">
          <p>${coachLine}</p>
        </div>
        <div class="checkin-sleep-block">
          <p class="checkin-question">How long did you sleep?</p>
          <div class="checkin-sleep-adjuster">
            <button type="button" class="checkin-sleep-btn" id="sleep-minus"
                    aria-label="Decrease sleep hours">&#8722;</button>
            <div class="checkin-sleep-display"
                 aria-live="polite" aria-label="${currentCheckin.sleepHours} hours">
              <span class="checkin-sleep-number" id="sleep-hours-display">${currentCheckin.sleepHours}</span>
              <span class="checkin-sleep-unit">hours</span>
            </div>
            <button type="button" class="checkin-sleep-btn" id="sleep-plus"
                    aria-label="Increase sleep hours">&#43;</button>
          </div>
          <div class="checkin-sleep-quality">
            <p class="checkin-question-sub">How was the quality?</p>
            <div class="checkin-quality-chips" role="group" aria-label="Sleep quality">
              ${["Poor", "Okay", "Good"].map(q => `
                <button type="button"
                        class="checkin-quality-chip ${currentCheckin.sleepQuality === q.toLowerCase() ? "selected" : ""}"
                        data-quality="${q.toLowerCase()}"
                        aria-pressed="${currentCheckin.sleepQuality === q.toLowerCase()}">
                  ${q}
                </button>
              `).join("")}
            </div>
          </div>
        </div>
      </div>
      <div class="checkin-step-actions">
        <button class="btn btn-primary btn-large btn-full" id="checkin-next-btn">Next</button>
        <button class="btn btn-ghost btn-small" id="checkin-back-btn"
                style="margin-top:var(--space-2);">&larr; Back</button>
      </div>
    </div>
  `;
}

function renderConditionsStep(header, conditions) {
  return `
    <div class="view checkin-step-view">
      ${header}
      <div class="checkin-step-body">
        <div class="checkin-coach-line">
          <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-xs" aria-hidden="true">
          <p>One more thing. How's the pain today?</p>
        </div>
        <div class="checkin-conditions-block">
          ${conditions.map(conditionId => {
            const condition = CONDITIONS.find(c => c.id === conditionId);
            const level = currentCheckin.conditionLevels[conditionId] || 1;
            return `
              <div class="checkin-condition-row" data-condition="${conditionId}">
                <p class="checkin-condition-name">
                  <span aria-hidden="true">${condition?.icon || ""}</span>
                  ${condition?.name || conditionId}
                </p>
                <div class="checkin-pain-chips" role="group"
                     aria-label="Pain level for ${condition?.name || conditionId}">
                  <button class="checkin-pain-chip ${level <= 2 ? "selected low" : ""}"
                          data-level="1" aria-pressed="${level <= 2}">None</button>
                  <button class="checkin-pain-chip ${level > 2 && level <= 5 ? "selected mild" : ""}"
                          data-level="4" aria-pressed="${level > 2 && level <= 5}">Mild</button>
                  <button class="checkin-pain-chip ${level > 5 && level <= 7 ? "selected moderate" : ""}"
                          data-level="6" aria-pressed="${level > 5 && level <= 7}">Moderate</button>
                  <button class="checkin-pain-chip ${level > 7 ? "selected severe" : ""}"
                          data-level="9" aria-pressed="${level > 7}">Severe</button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
      <div class="checkin-step-actions">
        <button class="btn btn-primary btn-large btn-full" id="checkin-next-btn">Next</button>
        <button class="btn btn-ghost btn-small" id="checkin-back-btn"
                style="margin-top:var(--space-2);">&larr; Back</button>
      </div>
    </div>
  `;
}

function renderTimeStep(header) {
  return `
    <div class="view checkin-step-view">
      ${header}
      <div class="checkin-step-body">
        <div class="checkin-coach-line">
          <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-xs" aria-hidden="true">
          <p>Last one. How much time do you have today?</p>
        </div>
        <div class="checkin-time-grid" role="group" aria-label="Available time today">
          ${TIME_OPTIONS.map(opt => `
            <button type="button"
                    class="checkin-time-card ${selectedAvailableTime === opt.value ? "selected" : ""}"
                    data-time="${opt.value}"
                    aria-pressed="${selectedAvailableTime === opt.value}">
              <span class="checkin-time-label">${opt.label}</span>
              <span class="checkin-time-sub">${opt.sub}</span>
            </button>
          `).join("")}
        </div>
        <p class="text-sm text-muted" style="margin-top:var(--space-3);">
          Skip this and I'll use your energy level to decide.
        </p>
      </div>
      <div class="checkin-step-actions">
        <button class="btn btn-primary btn-large btn-full" id="checkin-next-btn">Done</button>
        <button class="btn btn-ghost btn-small" id="checkin-back-btn"
                style="margin-top:var(--space-2);">&larr; Back</button>
      </div>
    </div>
  `;
}

function renderSummaryStep(header) {
  const summary = getCoachSummary();
  return `
    <div class="view checkin-step-view">
      ${header}
      <div class="checkin-step-body checkin-summary-body">
        <div class="checkin-summary-coach card card-coach">
          <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
          <p>${summary}</p>
        </div>
      </div>
      <div class="checkin-step-actions">
        <button class="btn btn-primary btn-large btn-full" id="checkin-submit-btn">
          See what I'm thinking &rarr;
        </button>
        <button class="btn btn-ghost btn-full" id="prescribed-shortcut-btn"
                style="margin-top:var(--space-3);">
          I have prescribed exercises to do
        </button>
      </div>
    </div>
  `;
}

export function onMount() {
  const conditions = store.get("conditions") || [];

  const existing = checkinData.getTodaysCheckin();
  if (existing) currentCheckin = { ...currentCheckin, ...existing };

  const energySlider = document.getElementById("energy-slider");
  if (energySlider) {
    energySlider.addEventListener("input", e => {
      const val = parseInt(e.target.value);
      currentCheckin.energy = val;
      const emoji = checkinData.getEnergyEmoji(val);
      const label = checkinData.getEnergyLabel(val);
      const emojiEl = document.getElementById("energy-emoji");
      const numEl   = document.getElementById("energy-number");
      const labEl   = document.getElementById("energy-label");
      if (emojiEl) emojiEl.textContent = emoji;
      if (numEl)   numEl.textContent   = val;
      if (labEl)   labEl.textContent   = label;
      energySlider.setAttribute("aria-valuetext", label);
    });
  }

  const moodSlider = document.getElementById("mood-slider");
  if (moodSlider) {
    moodSlider.addEventListener("input", e => {
      const val = parseInt(e.target.value);
      currentCheckin.mood = val;
      const emoji = checkinData.getMoodEmoji(val);
      const label = checkinData.getMoodLabel(val);
      const emojiEl = document.getElementById("mood-emoji");
      const numEl   = document.getElementById("mood-number");
      const labEl   = document.getElementById("mood-label");
      if (emojiEl) emojiEl.textContent = emoji;
      if (numEl)   numEl.textContent   = val;
      if (labEl)   labEl.textContent   = label;
      moodSlider.setAttribute("aria-valuetext", label);
    });
  }

  document.getElementById("sleep-minus")?.addEventListener("click", () => {
    currentCheckin.sleepHours = Math.max(0, currentCheckin.sleepHours - 0.5);
    const el = document.getElementById("sleep-hours-display");
    if (el) el.textContent = currentCheckin.sleepHours;
  });
  document.getElementById("sleep-plus")?.addEventListener("click", () => {
    currentCheckin.sleepHours = Math.min(14, currentCheckin.sleepHours + 0.5);
    const el = document.getElementById("sleep-hours-display");
    if (el) el.textContent = currentCheckin.sleepHours;
  });

  document.querySelectorAll(".checkin-quality-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      currentCheckin.sleepQuality = chip.dataset.quality;
      document.querySelectorAll(".checkin-quality-chip").forEach(c => {
        c.classList.toggle("selected", c === chip);
        c.setAttribute("aria-pressed", c === chip);
      });
    });
  });

  document.querySelectorAll(".checkin-condition-row").forEach(row => {
    row.querySelectorAll(".checkin-pain-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const condId = row.dataset.condition;
        const level  = parseInt(chip.dataset.level);
        currentCheckin.conditionLevels[condId] = level;
        row.querySelectorAll(".checkin-pain-chip").forEach(c => {
          const selected = c === chip;
          c.classList.toggle("selected", selected);
          c.setAttribute("aria-pressed", selected);
          c.classList.remove("low", "mild", "moderate", "severe");
          if (selected) {
            if      (level <= 2) c.classList.add("low");
            else if (level <= 5) c.classList.add("mild");
            else if (level <= 7) c.classList.add("moderate");
            else                 c.classList.add("severe");
          }
        });
      });
    });
  });

  document.querySelectorAll(".checkin-time-card").forEach(card => {
    card.addEventListener("click", () => {
      selectedAvailableTime = selectedAvailableTime === card.dataset.time ? null : card.dataset.time;
      document.querySelectorAll(".checkin-time-card").forEach(c => {
        const sel = c.dataset.time === selectedAvailableTime;
        c.classList.toggle("selected", sel);
        c.setAttribute("aria-pressed", sel);
      });
    });
  });

  document.getElementById("checkin-next-btn")?.addEventListener("click", () => {
    const conditionsExist = conditions.length > 0;
    const maxStep = conditionsExist ? 5 : 4;
    checkinStep = Math.min(checkinStep + 1, maxStep);
    rerenderCheckin();
  });

  document.getElementById("checkin-back-btn")?.addEventListener("click", () => {
    checkinStep = Math.max(0, checkinStep - 1);
    rerenderCheckin();
  });

  document.getElementById("checkin-submit-btn")?.addEventListener("click", submitCheckin);
  document.getElementById("prescribed-shortcut-btn")?.addEventListener("click", submitCheckinToPrescribed);
}

function rerenderCheckin() {
  const main = document.getElementById("main-content");
  if (main) {
    main.innerHTML = render();
    onMount();
    main.scrollTop = 0;
  }
}

function submitCheckin() {
  const notesEl = document.getElementById("checkin-notes");
  if (notesEl) currentCheckin.notes = notesEl.value;

  const cycleEl = document.getElementById("cycle-day");
  if (cycleEl?.value) currentCheckin.cycleDay = parseInt(cycleEl.value);

  store.updateConditionPainScores({ ...currentCheckin.conditionLevels });
  store.set("availableTime", selectedAvailableTime);
  checkinData.saveCheckin(currentCheckin);

  const intensity = checkinData.getSuggestedIntensity(currentCheckin);
  store.set("todayIntensity", intensity);

  router.navigate("coach-reflection");
}

function submitCheckinToPrescribed() {
  const notesEl = document.getElementById("checkin-notes");
  if (notesEl) currentCheckin.notes = notesEl.value;

  const cycleEl = document.getElementById("cycle-day");
  if (cycleEl?.value) currentCheckin.cycleDay = parseInt(cycleEl.value);

  store.updateConditionPainScores({ ...currentCheckin.conditionLevels });
  store.set("availableTime", selectedAvailableTime);
  checkinData.saveCheckin(currentCheckin);

  const intensity = checkinData.getSuggestedIntensity(currentCheckin);
  store.set("todayIntensity", intensity);

  router.navigate("prescribed");
}
