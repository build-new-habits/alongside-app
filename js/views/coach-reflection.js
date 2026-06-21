/**
 * coach-reflection.js - Post Check-In Pattern Reflection
 *
 * 21 Jun 2026 v3 (bug fixes):
 *   - Double path card bug fixed: mini-no-btn handler now calls rerender()
 *     instead of splicing the DOM directly. The surgical DOM replacement
 *     was leaving stale content and double-rendering the option paths.
 *   - Return-visit / second-session card no longer persists after dismissal
 *     (same root cause — full rerender replaces entire view cleanly).
 *   - Location interstitial added to Option A ("Suggest something for me").
 *     The coach path needs to know where the user is before generating a
 *     proposal. Shows three options: At home / At the gym / Outside.
 *     If today's weekly plan already covers today, location is skipped
 *     (the plan implies context). sessionLocation written to store before
 *     navigating to coach-proposal.
 *
 * 01 Jun 2026 v1
 *   "Your Session" h1 added.
 *
 * 30 May 2026 v2
 *   Options use intention-path CSS classes. Event wiring moved to
 *   wireOptions() with direct button listeners.
 *
 * Act 3 of the daily flow. Sits between check-in and session selection.
 * Route: coach-reflection
 * Nav: visible (Today tab active)
 */

import { store }       from "../store.js";
import { checkinData } from "../data/checkin.js";

export const centered = false;

// ── State ─────────────────────────────────────────────────────────────────────

let miniState        = null;   // null | "asked"
let selectedActivity = null;
let showLocation     = false;  // true while location interstitial is showing

// ── Activity options for path B ───────────────────────────────────────────────

const B_ACTIVITIES = [
  { id: "gym",   label: "Gym session",   icon: "&#127947;" },
  { id: "run",   label: "Run",           icon: "&#127939;" },
  { id: "walk",  label: "Walk",          icon: "&#128694;" },
  { id: "swim",  label: "Swim",          icon: "&#127946;" },
  { id: "cycle", label: "Cycle",         icon: "&#128692;" },
  { id: "yoga",  label: "Yoga / Pilates",icon: "&#129337;" },
  { id: "class", label: "Class / workshop", icon: "&#129338;" },
  { id: "other", label: "Something else",icon: "&#10067;"  },
];

const LOCATION_OPTIONS = [
  { id: "home",    label: "At home",    icon: "&#127968;" },
  { id: "gym",     label: "At the gym", icon: "&#127947;" },
  { id: "outside", label: "Outside",    icon: "&#127807;" },
];

// ── Data helpers ──────────────────────────────────────────────────────────────

function getFirstName() {
  return (store.get("name") || "").split(" ")[0] || "";
}

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function getRecentLog(days) {
  const log    = store.get("activityLog") || [];
  const today  = getTodayStr();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split("T")[0];
  return log.filter(e => e.date >= cutoffStr && e.date < today);
}

function getTodayLog() {
  const log   = store.get("activityLog") || [];
  const today = getTodayStr();
  return log.filter(e => e.date === today);
}

function getConsecutiveDays() {
  const log   = store.get("activityLog") || [];
  const today = getTodayStr();
  const activeDates = new Set(
    log.filter(e => e.date < today).map(e => e.date)
  );
  let count = 0;
  const cursor = new Date();
  cursor.setDate(cursor.getDate() - 1);
  while (true) {
    const dateStr = cursor.toISOString().split("T")[0];
    if (activeDates.has(dateStr)) { count++; cursor.setDate(cursor.getDate() - 1); }
    else break;
  }
  return count;
}

function getDaysSinceLastActivity() {
  const log   = store.get("activityLog") || [];
  const today = getTodayStr();
  const previous = log.filter(e => e.date < today).sort((a, b) => b.date.localeCompare(a.date));
  if (!previous.length) return null;
  return Math.round((new Date(today) - new Date(previous[0].date)) / 86400000);
}

function getEnergyDelta(sessions) {
  const log = getRecentLog(14);
  const withBoth = log.filter(
    e => typeof e.energyBefore === "number" && typeof e.energyAfter === "number"
  ).slice(-sessions);
  if (withBoth.length < 2) return null;
  const sum = withBoth.reduce((acc, e) => acc + (e.energyAfter - e.energyBefore), 0);
  return sum / withBoth.length;
}

function getLowMoodMovedWell() {
  const log = getRecentLog(7);
  return log.find(
    e => (e.feel === "strong" || e.feel === "right" || e.feel === "loved") &&
         typeof e.energyBefore === "number" && e.energyBefore <= 4
  ) || null;
}

function getLastPainImproved() {
  return getRecentLog(7).find(e => e.painChange === "better") || null;
}

function hasHighCheckinConsistency() {
  const history   = checkinData.getHistory(7) || [];
  const today     = getTodayStr();
  const cutoff    = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const cutoffStr = cutoff.toISOString().split("T")[0];
  return history.filter(h => h.date >= cutoffStr && h.date < today).length >= 6;
}

function isBurnoutRisk() {
  const history = checkinData.getHistory(4) || [];
  const today   = getTodayStr();
  const recent  = history.filter(h => h.date < today).slice(-4);
  return recent.filter(h => (h.energy || 5) <= 3 || (h.mood || 5) <= 3).length >= 3;
}

function hasSeverePainToday() {
  const conditions = store.get("conditions") || [];
  const scores     = store.get("conditionPainScores") || {};
  return conditions.some(id => (scores[id] || 0) >= 7);
}

/**
 * Returns true if the weekly plan covers today with a non-open type,
 * meaning location context is already implied and the interstitial
 * can be skipped.
 */
function planCoversToday() {
  const weeklyPlan = store.get("weeklyPlan");
  if (!weeklyPlan?.updatedAt) return false;
  const day  = new Date().toLocaleDateString("en-GB", { weekday: "long" }).toLowerCase();
  const plan = weeklyPlan.days?.[day];
  return !!(plan && plan.enabled && plan.type !== "open");
}

// ── Pattern detection ─────────────────────────────────────────────────────────

function buildReflection() {
  const checkin     = store.get("lastCheckin") || {};
  const energy      = checkin.energy || 5;
  const mood        = checkin.mood   || 5;
  const consecutive = getConsecutiveDays();
  const daysSince   = getDaysSinceLastActivity();
  const energyDelta = getEnergyDelta(3);
  const lowMoodMove = getLowMoodMovedWell();
  const painImproved = getLastPainImproved();
  const hasSevere   = hasSeverePainToday();
  const burnoutRisk = isBurnoutRisk();
  const highConsist = hasHighCheckinConsistency();

  if (hasSevere) {
    return { type: "severe-pain", proposalBias: "rest", lines: [
      "Your pain is quite high today.",
      "I am not going to suggest anything demanding.",
      "Gentle movement, breathing, or rest are all valid options right now. What feels right?"
    ]};
  }

  if (burnoutRisk) {
    return { type: "burnout-risk", proposalBias: "lighter", lines: [
      "Your energy and mood have been running low for a few days now.",
      "That is not a problem to fix -- it is information worth acknowledging.",
      "Today, I am not going to push you. What do you need?"
    ]};
  }

  if (consecutive >= 3) {
    return { type: "consecutive-days", proposalBias: "lighter", lines: [
      consecutive + " sessions in a row.",
      "Your consistency has been good. Your body will be carrying some accumulated load.",
      "I was going to suggest varying the type of movement today -- not stopping, just varying. What do you think?"
    ]};
  }

  if (lowMoodMove) {
    const dayRef = relativeDay(lowMoodMove.date);
    return { type: "mood-movement", proposalBias: null, lines: [
      "Worth noting: " + dayRef + " you came in with low energy and moved anyway.",
      "You came out feeling " + (lowMoodMove.feel || "better") + ".",
      "Your mood is " + (mood <= 4 ? "lower today too" : "steadier today") + ". That pattern is worth keeping in mind."
    ]};
  }

  if (painImproved) {
    const dayRef = relativeDay(painImproved.date);
    return { type: "pain-improved", proposalBias: null, lines: [
      dayRef.charAt(0).toUpperCase() + dayRef.slice(1) + " your pain was better by the end of your session.",
      "That is your body giving you useful information.",
      "We will be careful today -- but careful does not mean still."
    ]};
  }

  if (energyDelta !== null && energyDelta >= 1.5) {
    return { type: "energy-lift", proposalBias: null, lines: [
      "I have noticed something across your last few sessions.",
      "You have been coming in at a " + energy + " for energy and leaving higher almost every time.",
      "Worth knowing. Your body responds well to movement even when you are not feeling it."
    ]};
  }

  if (daysSince !== null && daysSince >= 5) {
    return { type: "returning", proposalBias: "lighter", lines: [
      daysSince >= 10
        ? "It has been a little while. Good to see you back."
        : "A few days off. What matters is you are here now.",
      "Let's find something that feels like a good re-entry."
    ]};
  }

  if (highConsist) {
    return { type: "consistency", proposalBias: null, lines: [
      "You have checked in almost every day this week.",
      "Not because I am counting -- because you have been showing up for yourself.",
      "What would you like to do with that today?"
    ]};
  }

  // Default
  const lines = [];
  if (energy >= 7 && mood >= 7) {
    lines.push("Good energy, good mood. Let's make the most of that.");
  } else if (energy >= 7) {
    lines.push("Energy is good today. Mood is sitting at a " + mood + ".");
    lines.push("I can work with that. What are you thinking?");
  } else if (mood >= 7) {
    lines.push("Mood is good. Energy is at a " + energy + " -- steady.");
    lines.push("What sounds right for today?");
  } else if (energy <= 3 || mood <= 3) {
    lines.push("A harder day. That is okay -- there is something here for wherever you are.");
    lines.push("What feels manageable right now?");
  } else {
    lines.push("A moderate day. Not your highest, not your lowest.");
    lines.push("What do you feel like doing?");
  }
  return { type: "default", proposalBias: energy <= 3 ? "lighter" : null, lines };
}

function relativeDay(dateStr) {
  if (!dateStr) return "recently";
  const diffDays = Math.round((new Date() - new Date(dateStr)) / 86400000);
  if (diffDays === 1) return "yesterday";
  if (diffDays === 2) return "two days ago";
  return "on " + new Date(dateStr).toLocaleDateString("en-GB", { weekday: "long" });
}

// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  const todayLog        = getTodayLog();
  const hasSessionToday = todayLog.length > 0;
  const reflection      = buildReflection();

  return `
    <div class="view coach-reflection-view">

      <div class="view-header">
        <h1>Your Session</h1>
      </div>

      <div class="card card-coach" role="region" aria-label="Your coach">
        <img src="assets/images/logo-icon-192.png"
             alt="" class="coach-icon-small" aria-hidden="true">
        <div class="coach-reflection-content">
          ${reflection.lines.map(line => `<p>${line}</p>`).join("")}
        </div>
      </div>

      ${showLocation
        ? renderLocationInterstitial()
        : hasSessionToday && miniState !== "dismissed"
          ? renderSecondSessionPrompt()
          : renderOptions(reflection)
      }

    </div>
  `;
}

function renderLocationInterstitial() {
  return `
    <div class="intention-paths" id="location-options"
         role="group" aria-label="Where are you right now?">
      <p class="intention-selector-label"
         style="padding: 0 var(--space-1); margin-bottom: var(--space-2);">
        Where are you right now?
      </p>
      ${LOCATION_OPTIONS.map(loc => `
        <button class="intention-path" data-location="${loc.id}"
                aria-label="${loc.label}">
          <span class="intention-path-icon" aria-hidden="true">${loc.icon}</span>
          <div class="intention-path-text">
            <span class="intention-path-label">${loc.label}</span>
          </div>
        </button>
      `).join("")}
      <button class="btn btn-ghost btn-full" id="location-skip-btn"
              style="margin-top: var(--space-2);">
        Not sure
      </button>
    </div>
  `;
}

function renderSecondSessionPrompt() {
  if (miniState === "asked") {
    return `
      <div class="intention-paths" role="group" aria-label="What has changed?">
        <button class="intention-path" id="mini-energy-shifted"
                aria-label="My energy has shifted">
          <span class="intention-path-icon" aria-hidden="true">&#9889;</span>
          <div class="intention-path-text">
            <span class="intention-path-label">My energy has shifted</span>
          </div>
        </button>
        <button class="intention-path" id="mini-pain-flagged"
                aria-label="I have pain to flag">
          <span class="intention-path-icon" aria-hidden="true">&#128681;</span>
          <div class="intention-path-text">
            <span class="intention-path-label">I have pain to flag</span>
          </div>
        </button>
        <button class="btn btn-ghost btn-full" id="mini-no-change"
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
      <div style="display:flex;gap:var(--space-3);margin-top:var(--space-4);flex-wrap:wrap;">
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

function renderOptions(reflection) {
  return `
    <div class="intention-paths" id="reflection-options"
         role="group" aria-label="What would you like to do today?">

      <button class="intention-path" id="option-a"
              aria-label="Let the coach suggest something">
        <span class="intention-path-icon" aria-hidden="true">&#127919;</span>
        <div class="intention-path-text">
          <span class="intention-path-label">Suggest something for me</span>
          <span class="intention-path-sub">Coach recommends based on today</span>
        </div>
      </button>

      <button class="intention-path" id="option-b"
              aria-label="I have something in mind">
        <span class="intention-path-icon" aria-hidden="true">&#127947;</span>
        <div class="intention-path-text">
          <span class="intention-path-label">I have something in mind</span>
          <span class="intention-path-sub">Gym, run, walk, swim, class...</span>
        </div>
      </button>

      <div id="b-activity-picker" class="intention-activity-selector"
           style="display:none;" role="group" aria-label="What are you doing?">
        <p class="intention-selector-label">What are you doing?</p>
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
          <button class="btn btn-primary btn-full" id="option-b-confirm"
                  style="margin-top:var(--space-3);">
            Let's go &rarr;
          </button>
        ` : ""}
      </div>

      <button class="intention-path" id="option-c"
              aria-label="My plans">
        <span class="intention-path-icon" aria-hidden="true">&#128203;</span>
        <div class="intention-path-text">
          <span class="intention-path-label">My plans</span>
          <span class="intention-path-sub">Prescribed exercises, gym plan, weekly routine</span>
        </div>
      </button>

      <button class="intention-path" id="option-d"
              aria-label="Noticing">
        <span class="intention-path-icon" aria-hidden="true">&#127807;</span>
        <div class="intention-path-text">
          <span class="intention-path-label">Noticing</span>
          <span class="intention-path-sub">A walk, reflection, breathing, or rest</span>
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
  wireOptions();
  wireSecondSession();
  wireLocation();
}

function wireLocation() {
  // Location option buttons
  document.querySelectorAll("[data-location]").forEach(btn => {
    btn.addEventListener("click", () => {
      store.set("sessionLocation", btn.dataset.location);
      showLocation = false;
      const reflection = buildReflection();
      store.set("proposalBias", reflection.proposalBias || null);
      router.navigate("coach-proposal");
    });
  });

  // "Not sure" — skip location, navigate without setting it
  document.getElementById("location-skip-btn")?.addEventListener("click", () => {
    store.set("sessionLocation", null);
    showLocation = false;
    const reflection = buildReflection();
    store.set("proposalBias", reflection.proposalBias || null);
    router.navigate("coach-proposal");
  });
}

function wireOptions() {
  // A: Suggest something for me — show location first (unless plan covers today)
  document.getElementById("option-a")?.addEventListener("click", () => {
    if (planCoversToday()) {
      // Plan already implies context — skip location
      const reflection = buildReflection();
      store.set("proposalBias", reflection.proposalBias || null);
      router.navigate("coach-proposal");
    } else {
      showLocation = true;
      rerender();
    }
  });

  // B: toggle picker
  document.getElementById("option-b")?.addEventListener("click", () => {
    const picker = document.getElementById("b-activity-picker");
    if (!picker) return;
    picker.style.display = picker.style.display !== "none" ? "none" : "block";
  });

  // B: activity chips
  document.querySelectorAll("[data-b-activity]").forEach(chip => {
    chip.addEventListener("click", () => {
      selectedActivity = chip.dataset.bActivity;
      document.querySelectorAll("[data-b-activity]").forEach(c => {
        const sel = c.dataset.bActivity === selectedActivity;
        c.classList.toggle("selected", sel);
        c.setAttribute("aria-pressed", sel);
      });
      const picker = document.getElementById("b-activity-picker");
      if (picker && !document.getElementById("option-b-confirm")) {
        const act = B_ACTIVITIES.find(a => a.id === selectedActivity);
        const btn = document.createElement("button");
        btn.id        = "option-b-confirm";
        btn.className = "btn btn-primary btn-full";
        btn.style.marginTop = "var(--space-3)";
        btn.textContent = "Let's go \u2192";
        btn.setAttribute("aria-label", "Let's go - " + (act?.label || "activity"));
        picker.appendChild(btn);
        btn.addEventListener("click", logAndNavigateB);
      }
    });
  });

  document.getElementById("option-b-confirm")?.addEventListener("click", logAndNavigateB);

  // C: My plans
  document.getElementById("option-c")?.addEventListener("click", () => {
    router.navigate("prescribed");
  });

  // D: Noticing
  document.getElementById("option-d")?.addEventListener("click", () => {
    router.navigate("noticing");
  });
}

function wireSecondSession() {
  // "No, all good" — dismiss the second-session card and show options
  document.getElementById("mini-no-btn")?.addEventListener("click", () => {
    miniState = "dismissed";
    rerender();  // Full rerender — render() now shows renderOptions() cleanly
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
    miniState = "dismissed";
    rerender();
  });
}

// ── onUnmount — reset local state when navigating away ───────────────────────

export function onUnmount() {
  miniState        = null;
  selectedActivity = null;
  showLocation     = false;
}

// ── B-path navigation ─────────────────────────────────────────────────────────

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

  if (selectedActivity === "gym") {
    store.set("openGymSub", true);
    router.navigate("coach-proposal");
    return;
  }
  if (selectedActivity === "yoga")  { router.navigate("yoga-session");    return; }
  if (selectedActivity === "run")   { router.navigate("reflect");          return; }
  if (selectedActivity === "walk")  { router.navigate("reflect");          return; }
  if (selectedActivity === "swim")  { router.navigate("reflect");          return; }
  if (selectedActivity === "cycle") { router.navigate("reflect");          return; }
  router.navigate("reflect");
}
