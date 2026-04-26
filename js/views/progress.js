/**
 * progress.js - Progress View
 *
 * v3.0 (S4-1b, April 2026) — Numbers-first redesign
 *
 * Layout:
 *   1. Coach summary — personal, pattern-aware. Always first.
 *   2. This week — stat ring + five key numbers
 *   3. Check-in streak — 7-day visual dots
 *   4. Activity breakdown — five stat tiles, shown only if data exists
 *   5. Coach patterns — observations after 7+ sessions
 *   6. Body changes — shown only if user has opted in
 *
 * Design principles:
 *   - Numbers first. Lists last (or never).
 *   - No activity log dump. No "Gym session — Yesterday" x13.
 *   - Coach speaks in plain English, not data labels.
 *   - No streaks. Consistency = daysActiveLast30.
 */

import { store } from "../store.js";

export const centered = false;

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysAgo(iso) {
  if (!iso) return 999;
  return Math.floor((Date.now() - new Date(iso)) / 86400000);
}

function weekStart() {
  const d = new Date();
  const diff = d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1);
  const ws = new Date(d.setDate(diff));
  ws.setHours(0, 0, 0, 0);
  return ws;
}

function isThisWeek(iso) {
  return iso && new Date(iso) >= weekStart();
}

function isLast7Days(iso) {
  return iso && daysAgo(iso) < 7;
}

function isLast30Days(iso) {
  return iso && daysAgo(iso) < 30;
}

function getLog() {
  return store.get("activityLog") || [];
}

function getCheckins() {
  const history = store.get("checkinHistory") || {};
  return Object.entries(history)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 14);
}

function isTrainingType(type) {
  return !["breathing", "journal", "rest", "mindful", "quiet", "quiet-session"].includes(type || "");
}

// ── Coach summary ─────────────────────────────────────────────────────────────

function buildCoachMessage(log, checkins) {
  const name       = (store.get("name") || "").split(" ")[0] || "";
  const namePrefix = name ? name + ". " : "";
  const last7      = log.filter(e => isLast7Days(e.loggedAt || e.completedAt));
  const last30     = log.filter(e => isLast30Days(e.loggedAt || e.completedAt));

  if (log.length === 0) {
    return "Your progress builds here as we work together. Complete a few sessions and I will start noticing patterns.";
  }

  if (log.length < 3) {
    return namePrefix + "You are just getting started. That is exactly the right place to be. Keep showing up.";
  }

  const trainingDays = new Set(
    last30.filter(e => isTrainingType(e.type || e.source))
          .map(e => (e.loggedAt || e.completedAt || "").split("T")[0])
  ).size;

  const thisWeekSessions = last7.filter(e => isThisWeek(e.loggedAt || e.completedAt) && isTrainingType(e.type)).length;
  const target = store.get("strategicGoal")?.weeklySessionTarget || 3;
  const hitTarget = thisWeekSessions >= target;

  const quietCount   = last7.filter(e => !isTrainingType(e.type || e.source)).length;
  const trainingCount = last7.filter(e => isTrainingType(e.type || e.source)).length;

  // Energy pattern
  const energyPairs = last7.filter(e => e.energyBefore && e.energyAfter);
  const energyRises = energyPairs.filter(e => e.energyAfter > e.energyBefore).length;
  const energyPattern = energyPairs.length >= 3 && energyRises / energyPairs.length >= 0.6;

  if (hitTarget) {
    return namePrefix + "You have hit your session target for this week. I want you to notice that \u2014 not because targets are the point, but because consistency is. Keep going.";
  }
  if (energyPattern) {
    return namePrefix + "Your energy after sessions has been higher than before them this week, consistently. Movement is generating the energy it costs. That is worth holding onto.";
  }
  if (trainingCount >= 4 && quietCount === 0) {
    return namePrefix + "All training, no recovery this week. Rest and quiet sessions are where adaptation happens. Consider adding something restorative.";
  }
  if (trainingDays >= 15) {
    return namePrefix + "Active on " + trainingDays + " of the last 30 days. That level of consistency builds something lasting.";
  }
  if (last7.length === 0) {
    return namePrefix + "Nothing logged in the last 7 days. No pressure \u2014 but I am here when you are ready.";
  }

  return namePrefix + "You have had " + last7.length + " session" + (last7.length !== 1 ? "s" : "") + " in the last week. Keep building the pattern.";
}

// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  const log      = getLog();
  const checkins = getCheckins();

  // Categorise
  const thisWeekLog   = log.filter(e => isThisWeek(e.loggedAt || e.completedAt));
  const last7Log      = log.filter(e => isLast7Days(e.loggedAt || e.completedAt));
  const last30Log     = log.filter(e => isLast30Days(e.loggedAt || e.completedAt));
  const checkinCount7 = checkins.filter(([date]) => daysAgo(date) < 7).length;

  // Stat counts
  const coachCount    = last30Log.filter(e => e.source === "coach-recommended" || e.type === "coach-session").length;
  const prescribedCount = last30Log.filter(e => ["prescribed","prescribed-session"].includes(e.type) || e.source === "prescribed").length;
  const gymCount      = last30Log.filter(e => ["gym","gym-programme"].includes(e.type) && e.source !== "coach-recommended").length;
  const otherCount    = last30Log.filter(e =>
    isTrainingType(e.type) &&
    !["gym","gym-programme","coach-session","prescribed","prescribed-session"].includes(e.type) &&
    e.source !== "coach-recommended" && e.source !== "prescribed"
  ).length;
  const mindfulCount  = last30Log.filter(e => !isTrainingType(e.type || e.source)).length;

  const thisWeekTraining = thisWeekLog.filter(e => isTrainingType(e.type || e.source)).length;
  const target           = store.get("strategicGoal")?.weeklySessionTarget || 3;
  const pct              = Math.min(100, Math.round((thisWeekTraining / target) * 100));

  const daysActive30     = new Set(
    last30Log.filter(e => isTrainingType(e.type || e.source))
             .map(e => (e.loggedAt || e.completedAt || "").split("T")[0])
  ).size;

  const showBody = store.get("trackBodyChanges");
  const coachMessage = buildCoachMessage(log, checkins);

  return `
    <div class="view progress-view">

      <div class="view-header">
        <h1>Progress</h1>
      </div>

      <!-- 1. Coach summary -->
      <div class="progress-coach-card">
        <div class="progress-coach-inner">
          <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-xs" aria-hidden="true">
          <p class="progress-coach-text">${coachMessage}</p>
        </div>
      </div>

      <!-- 2. This week ring + stats -->
      <div class="card progress-week-card">
        <div class="progress-week-top">
          <div class="progress-ring-wrap" aria-label="This week: ${thisWeekTraining} of ${target} sessions">
            <svg class="progress-ring" viewBox="0 0 80 80" aria-hidden="true">
              <circle class="progress-ring-track" cx="40" cy="40" r="32"/>
              <circle class="progress-ring-fill" cx="40" cy="40" r="32"
                      stroke-dasharray="${2 * Math.PI * 32}"
                      stroke-dashoffset="${2 * Math.PI * 32 * (1 - pct / 100)}"
                      transform="rotate(-90 40 40)"/>
            </svg>
            <div class="progress-ring-label">
              <span class="progress-ring-num">${thisWeekTraining}</span>
              <span class="progress-ring-of">of ${target}</span>
            </div>
          </div>
          <div class="progress-week-stats">
            <div class="progress-stat-row">
              <span class="progress-stat-label">Sessions this week</span>
              <span class="progress-stat-value">${thisWeekTraining}</span>
            </div>
            <div class="progress-stat-row">
              <span class="progress-stat-label">Active days (30 days)</span>
              <span class="progress-stat-value">${daysActive30}</span>
            </div>
            <div class="progress-stat-row">
              <span class="progress-stat-label">Check-ins (7 days)</span>
              <span class="progress-stat-value">${checkinCount7} / 7</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Check-in dots -->
      ${checkins.length > 0 ? renderCheckinDots(checkins) : ""}

      <!-- 4. Activity breakdown — 30 days -->
      ${log.length > 0 ? renderStatTiles(coachCount, prescribedCount, gymCount, otherCount, mindfulCount) : ""}

      <!-- 5. Patterns -->
      ${log.length >= 7 ? renderPatterns(log) : ""}

      <!-- 6. Body changes (opt-in) -->
      ${showBody ? renderBodyChanges() : renderBodyOptIn()}

      <!-- Empty state -->
      ${log.length === 0 ? `
        <div class="card" style="margin-top:var(--space-4);text-align:center;">
          <p class="text-muted" style="padding:var(--space-4) 0;">
            Nothing logged yet. Complete a session and it will appear here.
          </p>
        </div>
      ` : ""}

    </div>
  `;
}

// ── Check-in dots ─────────────────────────────────────────────────────────────

function renderCheckinDots(checkins) {
  const DAYS = ["M","T","W","T","F","S","S"];
  const ws = weekStart();

  // Which days this week had a check-in
  const checkinDays = new Set(
    checkins
      .filter(([date]) => daysAgo(date) < 7)
      .map(([date]) => new Date(date).getDay())
  );

  // Energy trend — last 7 days average
  const recent = checkins.slice(0, 7);
  const avgEnergy = recent.length
    ? Math.round(recent.reduce((sum, [, d]) => sum + (d.energy || 0), 0) / recent.length * 10) / 10
    : null;
  const avgMood = recent.length
    ? Math.round(recent.reduce((sum, [, d]) => sum + (d.mood || 0), 0) / recent.length * 10) / 10
    : null;

  return `
    <div class="card progress-checkins-card">
      <div class="progress-checkins-header">
        <h3>Check-ins this week</h3>
        <span class="progress-checkin-count">${checkinDays.size} / 7</span>
      </div>

      <div class="progress-dot-row" role="group" aria-label="Check-in days this week">
        ${DAYS.map((day, i) => {
          // i=0 is Mon in our layout; getDay() 0=Sun,1=Mon...
          const dayNum = i === 6 ? 0 : i + 1;
          const active = checkinDays.has(dayNum);
          return `
            <div class="progress-dot-col" aria-label="${day}${active ? ", checked in" : ""}">
              <div class="progress-dot-circle ${active ? "active" : ""}" aria-hidden="true"></div>
              <span class="progress-dot-day">${day}</span>
            </div>
          `;
        }).join("")}
      </div>

      ${avgEnergy !== null ? `
        <div class="progress-checkin-avgs">
          <div class="progress-avg-pill">
            <span>Avg energy</span>
            <strong>${avgEnergy}/10</strong>
          </div>
          <div class="progress-avg-pill">
            <span>Avg mood</span>
            <strong>${avgMood}/10</strong>
          </div>
        </div>
      ` : ""}
    </div>
  `;
}

// ── Stat tiles ────────────────────────────────────────────────────────────────

function renderStatTiles(coach, prescribed, gym, other, mindful) {
  const tiles = [
    { label: "Coach sessions",     value: coach,      icon: "\uD83C\uDFAF", show: true  },
    { label: "Prescribed",        value: prescribed,  icon: "\uD83E\uDE7A", show: true  },
    { label: "Gym sessions",      value: gym,         icon: "\uD83C\uDFCB", show: true  },
    { label: "Own activities",    value: other,       icon: "\uD83C\uDFC3", show: true  },
    { label: "Mindful moments",   value: mindful,     icon: "\uD83C\uDF3F", show: true  },
  ].filter(t => t.show);

  const total = coach + prescribed + gym + other + mindful;

  return `
    <div class="card progress-tiles-card">
      <div class="progress-tiles-header">
        <h3>Last 30 days</h3>
        <span class="progress-tiles-total">${total} total</span>
      </div>
      <div class="progress-tiles-grid">
        ${tiles.map(tile => `
          <div class="progress-tile ${tile.value === 0 ? "progress-tile--empty" : ""}">
            <span class="progress-tile-icon" aria-hidden="true">${tile.icon}</span>
            <span class="progress-tile-value">${tile.value}</span>
            <span class="progress-tile-label">${tile.label}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

// ── Patterns ──────────────────────────────────────────────────────────────────

function renderPatterns(log) {
  const last14 = log.filter(e => daysAgo(e.loggedAt || e.completedAt) < 14);
  const patterns = [];

  const energyPairs = last14.filter(e => e.energyBefore && e.energyAfter);
  if (energyPairs.length >= 3) {
    const rises = energyPairs.filter(e => e.energyAfter > e.energyBefore).length;
    const pct = Math.round((rises / energyPairs.length) * 100);
    if (pct >= 60) patterns.push("Your energy after sessions has been higher than before them " + pct + "% of the time recently.");
  }

  const painEntries = last14.filter(e => e.painChange);
  const painBetter  = painEntries.filter(e => e.painChange === "better").length;
  const painWorse   = painEntries.filter(e => ["worse","sharp"].includes(e.painChange)).length;
  if (painBetter >= 2 && painBetter > painWorse) {
    patterns.push("Movement has been leaving you in less pain than before it, more often than not.");
  }
  if (painWorse >= 2) {
    patterns.push("Pain has been worse after some sessions. Worth noting for your next check-in.");
  }

  const quietCount  = last14.filter(e => !isTrainingType(e.type || e.source)).length;
  const activeCount = last14.filter(e => isTrainingType(e.type || e.source)).length;
  if (activeCount >= 6 && quietCount === 0) {
    patterns.push("All training, no recovery in two weeks. Rest is part of the programme.");
  }
  if (quietCount >= 3 && activeCount >= 3) {
    patterns.push("You are balancing active sessions with recovery. That balance is what makes training sustainable.");
  }

  if (!patterns.length) return "";

  return `
    <div class="card progress-patterns-card">
      <div class="progress-patterns-coach">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-xs" aria-hidden="true">
        <h3>What I am noticing</h3>
      </div>
      ${patterns.slice(0, 3).map(p => `
        <p class="progress-pattern-item">${p}</p>
      `).join("")}
    </div>
  `;
}

// ── Body changes ──────────────────────────────────────────────────────────────

function renderBodyChanges() {
  const entries = store.get("bodyLog") || [];
  const latest  = entries[entries.length - 1];
  const first   = entries[0];

  const weightUnit = store.get("weightUnit") || "kg";
  const weightDiff = latest && first && latest.weight && first.weight
    ? (latest.weight - first.weight).toFixed(1)
    : null;

  return `
    <div class="card progress-body-card">
      <h3>Body changes</h3>
      ${latest ? `
        <div class="progress-body-stats">
          ${latest.weight ? `
            <div class="progress-body-stat">
              <span class="progress-body-value">${latest.weight}${weightUnit}</span>
              <span class="progress-body-label">Current weight</span>
              ${weightDiff !== null ? `
                <span class="progress-body-change ${parseFloat(weightDiff) < 0 ? "down" : "up"}">
                  ${parseFloat(weightDiff) > 0 ? "+" : ""}${weightDiff}${weightUnit}
                </span>
              ` : ""}
            </div>
          ` : ""}
        </div>
        <button class="btn btn-ghost btn-small" id="progress-log-weight-btn"
                style="margin-top:var(--space-3);">
          + Log today
        </button>
      ` : `
        <p class="text-muted text-sm" style="margin-bottom:var(--space-3);">
          No entries yet. Log your weight and the coach will track changes over time.
        </p>
        <button class="btn btn-ghost btn-small" id="progress-log-weight-btn">
          + Log today
        </button>
      `}
    </div>
  `;
}

function renderBodyOptIn() {
  return `
    <div class="card progress-body-optin">
      <p class="text-sm text-muted">
        Want to track weight or body changes over time?
      </p>
      <button class="btn btn-ghost btn-small" id="progress-body-optin-btn"
              style="margin-top:var(--space-3);">
        Turn on body tracking
      </button>
    </div>
  `;
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {
  // Body opt-in
  document.getElementById("progress-body-optin-btn")?.addEventListener("click", () => {
    store.set("trackBodyChanges", true);
    const main = document.getElementById("main-content");
    if (main) { main.innerHTML = render(); onMount(); }
  });

  // Log weight
  document.getElementById("progress-log-weight-btn")?.addEventListener("click", () => {
    const weight = prompt("Enter your weight (" + (store.get("weightUnit") || "kg") + "):");
    if (!weight || isNaN(parseFloat(weight))) return;
    const bodyLog = store.get("bodyLog") || [];
    bodyLog.push({ weight: parseFloat(weight), loggedAt: new Date().toISOString() });
    store.set("bodyLog", bodyLog);
    const main = document.getElementById("main-content");
    if (main) { main.innerHTML = render(); onMount(); }
  });
}
