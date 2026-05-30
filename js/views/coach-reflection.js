/**
 * coach-reflection.js - Post Check-In Pattern Reflection
 *
 * 30 May 2026 v1
 *
 * Act 3 of the daily flow. Sits between check-in and session selection.
 *
 * The coach reads today's check-in against recent activityLog entries
 * and checkinHistory, identifies one relevant pattern, and speaks to it
 * before offering any proposal. This is the emotional intelligence moment --
 * the coach showing she has been paying attention to the person, not just
 * the metrics.
 *
 * After the reflection, the user is offered four paths (A/B/C/D):
 *   A -- Suggest something for me (routes to coach-proposal)
 *   B -- I have something in mind (activity chip picker)
 *   C -- My plans (prescribed, gym plan, weekly routine)
 *   D -- Noticing (walk, reflection, rest)
 *
 * Second session same day:
 *   If a check-in exists today AND an activityLog entry exists today,
 *   the screen detects this and shows a mini "has anything changed?"
 *   prompt before the A/B/C/D options, rather than routing back to
 *   the full check-in.
 *
 * Route: coach-reflection
 * Nav: visible (Today tab active)
 *
 * Data read:
 *   activityLog         -- last 14 days, completed entries
 *   conditionPainScores -- today's pain
 *   conditions          -- active condition IDs
 *   lastCheckin         -- today's energy and mood
 *   name                -- for personal address
 */

import { store }       from "../store.js";
import { checkinData } from "../data/checkin.js";

export const centered = false;

// ── State ─────────────────────────────────────────────────────────────────────
// Second-session mini prompt
let miniState   = null;  // null | "asked" | "energy-shifted" | "pain-flagged"

// B-path: I have something in mind
let selectedActivity = null;

// ── Activity options for path B ───────────────────────────────────────────────
const B_ACTIVITIES = [
  { id: "gym",         label: "Gym session",       icon: "&#127947;" },
  { id: "run",         label: "Run",                icon: "&#127939;" },
  { id: "walk",        label: "Walk",               icon: "&#128694;" },
  { id: "swim",        label: "Swim",               icon: "&#127946;" },
  { id: "cycle",       label: "Cycle",              icon: "&#128692;" },
  { id: "yoga",        label: "Yoga / Pilates",     icon: "&#129337;" },
  { id: "class",       label: "Class / workshop",   icon: "&#129338;" },
  { id: "other",       label: "Something else",     icon: "&#10067;"  },
];

// ── Data helpers ──────────────────────────────────────────────────────────────

function getFirstName() {
  return (store.get("name") || "").split(" ")[0] || "";
}

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

/**
 * Returns completed activityLog entries from the last N days (excluding today).
 */
function getRecentLog(days) {
  const log    = store.get("activityLog") || [];
  const today  = getTodayStr();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split("T")[0];
  return log.filter(e => e.date >= cutoffStr && e.date < today);
}

/**
 * Returns activityLog entries logged today.
 */
function getTodayLog() {
  const log   = store.get("activityLog") || [];
  const today = getTodayStr();
  return log.filter(e => e.date === today);
}

/**
 * Count consecutive training days ending yesterday.
 * Uses completed activityLog entries only.
 * A gap of one day breaks the chain.
 */
function getConsecutiveDays() {
  const log   = store.get("activityLog") || [];
  const today = getTodayStr();

  // Build a Set of unique dates with activity (excluding today)
  const activeDates = new Set(
    log
      .filter(e => e.date < today)
      .map(e => e.date)
  );

  let count = 0;
  const cursor = new Date();
  cursor.setDate(cursor.getDate() - 1); // start yesterday

  while (true) {
    const dateStr = cursor.toISOString().split("T")[0];
    if (activeDates.has(dateStr)) {
      count++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return count;
}

/**
 * Returns the number of days since the last activity (excluding today).
 * Returns null if no activity found.
 */
function getDaysSinceLastActivity() {
  const log   = store.get("activityLog") || [];
  const today = getTodayStr();
  const previous = log
    .filter(e => e.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));
  if (!previous.length) return null;
  const last = new Date(previous[0].date);
  const now  = new Date(today);
  return Math.round((now - last) / 86400000);
}

/**
 * For the last N completed sessions, returns the average energy delta
 * (energyAfter - energyBefore). Returns null if insufficient data.
 */
function getEnergyDelta(sessions) {
  const log = getRecentLog(14);
  const withBoth = log.filter(
    e => typeof e.energyBefore === "number" && typeof e.energyAfter === "number"
  ).slice(-sessions);
  if (withBoth.length < 2) return null;
  const sum = withBoth.reduce((acc, e) => acc + (e.energyAfter - e.energyBefore), 0);
  return sum / withBoth.length;
}

/**
 * Returns the last session where the user flagged a specific feel value
 * and mood was low (mood <= 4) at check-in, to detect the "moved despite
 * low mood and felt better" pattern.
 */
function getLowMoodMovedWell() {
  const log = getRecentLog(7);
  return log.find(
    e => (e.feel === "strong" || e.feel === "right" || e.feel === "loved") &&
         typeof e.energyBefore === "number" &&
         e.energyBefore <= 4
  ) || null;
}

/**
 * Returns the last session where painChange was "better".
 */
function getLastPainImproved() {
  const log = getRecentLog(7);
  return log.find(e => e.painChange === "better") || null;
}

/**
 * Returns true if the user has checked in on at least 6 of the last 7 days.
 */
function hasHighCheckinConsistency() {
  const history = checkinData.getHistory(7) || [];
  const today   = getTodayStr();
  const cutoff  = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const cutoffStr = cutoff.toISOString().split("T")[0];
  const count = history.filter(h => h.date >= cutoffStr && h.date < today).length;
  return count >= 6;
}

/**
 * Returns true if energy OR mood check-in has been <= 3 for 3+ of the
 * last 4 check-ins. Burnout proximity signal.
 */
function isBurnoutRisk() {
  const history = checkinData.getHistory(4) || [];
  const today   = getTodayStr();
  const recent  = history.filter(h => h.date < today).slice(-4);
  const lowCount = recent.filter(h => (h.energy || 5) <= 3 || (h.mood || 5) <= 3).length;
  return lowCount >= 3;
}

/**
 * Returns true if any active condition has a pain score >= 7 today.
 */
function hasSeverePainToday() {
  const conditions = store.get("conditions") || [];
  const scores     = store.get("conditionPainScores") || {};
  return conditions.some(id => (scores[id] || 0) >= 7);
}

// ── Pattern detection ─────────────────────────────────────────────────────────

/**
 * buildReflection()
 *
 * Priority order (first match wins):
 *   1. Severe pain today
 *   2. Burnout risk (3+ low check-ins in last 4)
 *   3. 3+ consecutive training days
 *   4. Moved despite low energy/mood and felt positive
 *   5. Pain improved after last session
 *   6. Energy consistently higher after sessions (avg delta > 1.5)
 *   7. First session in 5+ days
 *   8. High check-in consistency (6/7 days)
 *   9. Default: warm contextual greeting from today's check-in
 *
 * Returns:
 *   { type: string, lines: string[], proposalBias: string|null }
 */
function buildReflection() {
  const checkin     = store.get("lastCheckin") || {};
  const energy      = checkin.energy || 5;
  const mood        = checkin.mood   || 5;
  const name        = getFirstName();
  const consecutive = getConsecutiveDays();
  const daysSince   = getDaysSinceLastActivity();
  const energyDelta = getEnergyDelta(3);
  const lowMoodMove = getLowMoodMovedWell();
  const painImproved = getLastPainImproved();
  const hasSevere   = hasSeverePainToday();
  const burnoutRisk = isBurnoutRisk();
  const highConsist = hasHighCheckinConsistency();

  // 1. Severe pain
  if (hasSevere) {
    return {
      type: "severe-pain",
      lines: [
        "Your pain is quite high today.",
        "I am not going to suggest anything demanding.",
        "Gentle movement, breathing, or rest are all valid options right now. What feels right?"
      ],
      proposalBias: "rest"
    };
  }

  // 2. Burnout risk
  if (burnoutRisk) {
    return {
      type: "burnout-risk",
      lines: [
        "Your energy and mood have been running low for a few days now.",
        "That is not a problem to fix -- it is information worth acknowledging.",
        "Today, I am not going to push you. What do you need?"
      ],
      proposalBias: "lighter"
    };
  }

  // 3. Consecutive training days
  if (consecutive >= 3) {
    return {
      type: "consecutive-days",
      lines: [
        consecutive + " sessions in a row.",
        "Your consistency has been good. Your body will be carrying some accumulated load.",
        "I was going to suggest varying the type of movement today -- not stopping, just varying. What do you think?"
      ],
      proposalBias: "lighter"
    };
  }

  // 4. Moved despite low energy/mood and came out positive
  if (lowMoodMove) {
    const dayRef = relativeDay(lowMoodMove.date);
    return {
      type: "mood-movement",
      lines: [
        "Worth noting: " + dayRef + " you came in with low energy and moved anyway.",
        "You came out feeling " + (lowMoodMove.feel || "better") + ".",
        "Your mood is " + (mood <= 4 ? "lower today too" : "steadier today") + ". That pattern is worth keeping in mind."
      ],
      proposalBias: null
    };
  }

  // 5. Pain improved after movement
  if (painImproved) {
    const dayRef = relativeDay(painImproved.date);
    return {
      type: "pain-improved",
      lines: [
        dayRef.charAt(0).toUpperCase() + dayRef.slice(1) + " your pain was better by the end of your session.",
        "That is your body giving you useful information.",
        "We will be careful today -- but careful does not mean still."
      ],
      proposalBias: null
    };
  }

  // 6. Energy lift pattern
  if (energyDelta !== null && energyDelta >= 1.5) {
    return {
      type: "energy-lift",
      lines: [
        "I have noticed something across your last few sessions.",
        "You have been coming in at a " + energy + " for energy and leaving higher almost every time.",
        "Worth knowing. Your body responds well to movement even when you are not feeling it."
      ],
      proposalBias: null
    };
  }

  // 7. First session in 5+ days
  if (daysSince !== null && daysSince >= 5) {
    return {
      type: "returning",
      lines: [
        daysSince >= 10
          ? "It has been a little while. Good to see you back."
          : "A few days off. What matters is you are here now.",
        "Let's find something that feels like a good re-entry."
      ],
      proposalBias: "lighter"
    };
  }

  // 8. High check-in consistency
  if (highConsist) {
    return {
      type: "consistency",
      lines: [
        "You have checked in almost every day this week.",
        "Not because I am counting -- because you have been showing up for yourself.",
        "What would you like to do with that today?"
      ],
      proposalBias: null
    };
  }

  // 9. Default: warm contextual greeting
  const defaultLines = [];
  if (energy >= 7 && mood >= 7) {
    defaultLines.push("Good energy, good mood. Let's make the most of that.");
  } else if (energy >= 7) {
    defaultLines.push("Energy is good today. Mood is sitting at a " + mood + ".");
    defaultLines.push("I can work with that. What are you thinking?");
  } else if (mood >= 7) {
    defaultLines.push("Mood is good. Energy is at a " + energy + " -- steady.");
    defaultLines.push("What sounds right for today?");
  } else if (energy <= 3 || mood <= 3) {
    defaultLines.push("A harder day. That is okay -- there is something here for wherever you are.");
    defaultLines.push("What feels manageable right now?");
  } else {
    defaultLines.push("A moderate day. Not your highest, not your lowest.");
    defaultLines.push("What do you feel like doing?");
  }

  return {
    type: "default",
    lines: defaultLines,
    proposalBias: energy <= 3 ? "lighter" : null
  };
}

/**
 * Relative day label for use in reflection text.
 */
function relativeDay(dateStr) {
  if (!dateStr) return "recently";
  const today     = new Date();
  const entryDate = new Date(dateStr);
  const diffDays  = Math.round((today - entryDate) / 86400000);
  if (diffDays === 1) return "yesterday";
  if (diffDays === 2) return "two days ago";
  const dayName = entryDate.toLocaleDateString("en-GB", { weekday: "long" });
  return "on " + dayName;
}

// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  const todayLog     = getTodayLog();
  const hasSessionToday = todayLog.length > 0;
  const reflection   = buildReflection();

  return `
    <div class="view coach-reflection-view">

      <!-- Coach reflection card -->
      <div class="card card-coach" role="region" aria-label="Your coach">
        <img src="assets/images/logo-icon-192.png"
             alt="" class="coach-icon-small" aria-hidden="true">
        <div class="coach-reflection-content">
          ${reflection.lines.map(line => `<p>${line}</p>`).join("")}
        </div>
      </div>

      ${hasSessionToday ? renderSecondSessionPrompt() : renderOptions(reflection)}

    </div>
  `;
}

/**
 * Second session prompt -- shown when an activity has already been logged today.
 * Replaces the full A/B/C/D with a brief "has anything changed?" check.
 */
function renderSecondSessionPrompt() {
  if (miniState === "asked") {
    // User said something has changed -- route to mini check-in
    return `
      <div class="reflection-options" role="group" aria-label="What has changed?">
        <p class="reflection-options-label">What has changed?</p>

        <button class="reflection-option-btn"
                id="mini-energy-shifted"
                aria-label="My energy has shifted">
          <span class="reflection-option-icon" aria-hidden="true">&#9889;</span>
          <span>My energy has shifted</span>
        </button>

        <button class="reflection-option-btn"
                id="mini-pain-flagged"
                aria-label="I have pain to flag">
          <span class="reflection-option-icon" aria-hidden="true">&#128681;</span>
          <span>I have pain to flag</span>
        </button>

        <button class="btn btn-ghost btn-full"
                id="mini-no-change"
                style="margin-top: var(--space-3);">
          Actually, nothing has changed
        </button>
      </div>
    `;
  }

  return `
    <div class="card" style="margin-top: var(--space-4);" role="region"
         aria-label="Second session today">
      <div class="checkin-coach-line">
        <img src="assets/images/logo-icon-128.png" alt=""
             class="coach-icon-xs" aria-hidden="true">
        <p>You have already moved today. Has anything changed since then?</p>
      </div>
      <div class="reflection-mini-options"
           style="display:flex;gap:var(--space-3);margin-top:var(--space-4);flex-wrap:wrap;">
        <button class="btn btn-primary" id="mini-yes-btn"
                aria-label="Yes, something has changed">
          Yes, tell the coach
        </button>
        <button class="btn btn-ghost" id="mini-no-btn"
                aria-label="No, nothing has changed">
          No, all good
        </button>
      </div>
    </div>
  `;
}

/**
 * Render the four option paths (A/B/C/D).
 */
function renderOptions(reflection) {
  return `
    <div class="reflection-options" role="group"
         aria-label="What would you like to do today?">

      <p class="reflection-options-label">What would you like to do?</p>

      <!-- A: Suggest something for me -->
      <button class="reflection-option-btn"
              id="option-a"
              aria-label="Let the coach suggest something">
        <span class="reflection-option-icon" aria-hidden="true">&#127919;</span>
        <div class="reflection-option-text">
          <span class="reflection-option-label">Suggest something for me</span>
          <span class="reflection-option-sub">Coach recommends based on today</span>
        </div>
      </button>

      <!-- B: I have something in mind -->
      <button class="reflection-option-btn"
              id="option-b"
              aria-label="I have something in mind">
        <span class="reflection-option-icon" aria-hidden="true">&#127947;</span>
        <div class="reflection-option-text">
          <span class="reflection-option-label">I have something in mind</span>
          <span class="reflection-option-sub">Gym, run, walk, swim, class...</span>
        </div>
      </button>

      <!-- B expanded: activity picker -->
      ${selectedActivity !== null ? "" : ""}
      <div id="b-activity-picker" class="b-activity-picker"
           style="display:none;"
           role="group" aria-label="What are you doing?">
        <p class="reflection-options-label" style="margin-top:var(--space-3);">
          What are you doing?
        </p>
        <div class="intention-activity-grid">
          ${B_ACTIVITIES.map(a => `
            <button class="intention-activity-chip ${selectedActivity === a.id ? "selected" : ""}"
                    data-b-activity="${a.id}"
                    aria-pressed="${selectedActivity === a.id}">
              <span aria-hidden="true">${a.icon}</span>
              ${a.label}
            </button>
          `).join("")}
        </div>
        ${selectedActivity ? `
          <button class="btn btn-primary btn-full"
                  id="option-b-confirm"
                  style="margin-top:var(--space-3);"
                  aria-label="Let's go - ${B_ACTIVITIES.find(a => a.id === selectedActivity)?.label || "activity"}">
            Let's go &rarr;
          </button>
        ` : ""}
      </div>

      <!-- C: My plans -->
      <button class="reflection-option-btn"
              id="option-c"
              aria-label="My plans - prescribed exercises, gym plan, weekly routine">
        <span class="reflection-option-icon" aria-hidden="true">&#128203;</span>
        <div class="reflection-option-text">
          <span class="reflection-option-label">My plans</span>
          <span class="reflection-option-sub">Prescribed exercises, gym plan, weekly routine</span>
        </div>
      </button>

      <!-- D: Noticing -->
      <button class="reflection-option-btn"
              id="option-d"
              aria-label="Noticing - walk, reflection, rest">
        <span class="reflection-option-icon" aria-hidden="true">&#127807;</span>
        <div class="reflection-option-text">
          <span class="reflection-option-label">Noticing</span>
          <span class="reflection-option-sub">A walk, reflection, breathing, or rest</span>
        </div>
      </button>

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

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {
  const view = document.querySelector(".coach-reflection-view");
  if (!view) return;

  // ── Option A: Suggest something for me ───────────────────────────────────
  document.getElementById("option-a")?.addEventListener("click", () => {
    // Store proposal bias hint for coach-proposal to read
    const reflection = buildReflection();
    if (reflection.proposalBias) {
      store.set("proposalBias", reflection.proposalBias);
    } else {
      store.set("proposalBias", null);
    }
    router.navigate("coach-proposal");
  });

  // ── Option B: I have something in mind ───────────────────────────────────
  document.getElementById("option-b")?.addEventListener("click", () => {
    const picker = document.getElementById("b-activity-picker");
    if (picker) {
      picker.style.display = picker.style.display === "none" ? "block" : "none";
    }
  });

  view.addEventListener("click", e => {
    // B activity chip selection
    const chip = e.target.closest("[data-b-activity]");
    if (chip) {
      selectedActivity = chip.dataset.bActivity;
      // Update chip states
      view.querySelectorAll("[data-b-activity]").forEach(c => {
        const sel = c.dataset.bActivity === selectedActivity;
        c.classList.toggle("selected", sel);
        c.setAttribute("aria-pressed", sel);
      });
      // Show confirm button if not present
      if (!document.getElementById("option-b-confirm")) {
        rerender();
        // Reopen picker after rerender
        const picker = document.getElementById("b-activity-picker");
        if (picker) picker.style.display = "block";
      }
      return;
    }

    // B confirm
    const bConfirm = e.target.closest("#option-b-confirm");
    if (bConfirm && selectedActivity) {
      logAndNavigateB();
      return;
    }
  });

  // ── Option C: My plans ────────────────────────────────────────────────────
  document.getElementById("option-c")?.addEventListener("click", () => {
    router.navigate("prescribed");
  });

  // ── Option D: Noticing ────────────────────────────────────────────────────
  document.getElementById("option-d")?.addEventListener("click", () => {
    router.navigate("noticing");
  });

  // ── Second session: mini prompt ───────────────────────────────────────────
  document.getElementById("mini-no-btn")?.addEventListener("click", () => {
    // Nothing changed -- show options directly
    miniState = null;
    const todayLog = getTodayLog();
    const reflection = buildReflection();
    const optionsEl = document.createElement("div");
    optionsEl.innerHTML = renderOptions(reflection);
    // Replace the second-session card with the options
    const secondCard = view.querySelector(".card[role='region']");
    if (secondCard) secondCard.replaceWith(...optionsEl.children);
    onMount();
  });

  document.getElementById("mini-yes-btn")?.addEventListener("click", () => {
    miniState = "asked";
    rerender();
  });

  document.getElementById("mini-energy-shifted")?.addEventListener("click", () => {
    router.navigate("checkin-mini");
  });

  document.getElementById("mini-pain-flagged")?.addEventListener("click", () => {
    router.navigate("checkin-mini");
  });

  document.getElementById("mini-no-change")?.addEventListener("click", () => {
    miniState = null;
    rerender();
  });
}

// ── Navigation helpers ────────────────────────────────────────────────────────

/**
 * Log a self-directed activity entry and navigate to the right session.
 */
function logAndNavigateB() {
  if (!selectedActivity) return;

  const log     = store.get("activityLog") || [];
  const checkin = store.get("lastCheckin")  || {};
  const entry   = {
    id:           new Date().toISOString() + "_" + Math.random().toString(36).slice(2, 6),
    date:         getTodayStr(),
    type:         selectedActivity,
    name:         null,
    energyBefore: checkin.energy || null,
    source:       "self-directed",
    sessionStart: new Date().toISOString(),
  };
  store.set("activityLog", [...log, entry]);
  store.set("currentActivityEntry", entry);

  // Route to appropriate session view
  if (selectedActivity === "gym") {
    store.set("openGymSub", true);
    router.navigate("coach-proposal");
    return;
  }
  if (selectedActivity === "yoga") {
    router.navigate("yoga-session");
    return;
  }
  if (selectedActivity === "run") {
    router.navigate("running-session");
    return;
  }
  if (selectedActivity === "walk") {
    router.navigate("walk-session");
    return;
  }
  if (selectedActivity === "swim") {
    router.navigate("swim-session");
    return;
  }
  if (selectedActivity === "cycle") {
    router.navigate("cycle-session");
    return;
  }
  // Class / other / fallback -- go to reflect with duration prompt
  router.navigate("reflect");
}
