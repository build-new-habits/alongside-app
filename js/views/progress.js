/**
 * progress.js - Progress View
 *
 * v2.0 (S4-1, April 2026) — Full rebuild
 *
 * Sections:
 *   1. Coach summary card — personal, pattern-aware, 7-day window
 *   2. This week — days active, sessions by type, vs weekly target
 *   3. Coach sessions — workouts from coach-recommended path
 *   4. Prescribed exercises — physiotherapy protocol sessions
 *   5. Gym sessions — gym-programme completions with session ID
 *   6. Other activities — runs, walks, swims, classes, etc.
 *   7. Mindful moments — breathing, journaling, mindful movement, rest
 *   8. Check-ins — 7-day mood/energy/sleep history as a visual chart
 *   9. Patterns — coach observations from 14+ days of data
 *
 * Sections are only shown if they have data.
 * No streaks. No streak language anywhere.
 * Consistency metric: daysActiveLast30, weeklyConsistencyScore.
 *
 * Route: progress
 * Nav: shown
 */

import { store } from "../store.js";

export const centered = false;

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayKey() {
  return new Date().toISOString().split("T")[0];
}

function daysAgo(isoString) {
  return Math.floor((Date.now() - new Date(isoString)) / 86400000);
}

function weekStart() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isThisWeek(isoString) {
  return new Date(isoString) >= weekStart();
}

function formatDate(isoString) {
  const d = new Date(isoString);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return days[d.getDay()] + " " + d.getDate() + " " + months[d.getMonth()];
}

function activityLabel(type) {
  const labels = {
    "gym": "Gym session", "coach-session": "Coach session",
    "gym-programme": "Gym programme", "prescribed": "Prescribed exercises",
    "prescribed-session": "Prescribed exercises",
    "run": "Run", "walk": "Walk", "swim": "Swim", "cycle": "Cycle",
    "row": "Row", "yoga": "Yoga", "pilates": "Pilates",
    "breathing": "Breathing practice", "journal": "Journaling",
    "mindful": "Mindful movement", "rest": "Rest day",
    "quiet": "Quiet session", "quiet-session": "Quiet session",
    "class": "Class", "boxing": "Boxing", "spin": "Spin class",
    "body-balance": "Body Balance", "hiit": "HIIT", "hike": "Hike",
    "outdoor-cycle": "Outdoor cycle", "tennis": "Tennis",
    "football": "Football", "golf": "Golf"
  };
  return labels[type] || type.replace(/-/g, " ");
}

function feelIcon(feel) {
  const icons = {
    "strong": "&#128170;", "great": "&#128170;",
    "right": "&#128077;", "loved": "&#10084;",
    "managed": "&#128522;", "struggled": "&#128533;",
    "hard": "&#128533;", "tough": "&#128533;"
  };
  return icons[feel] || "";
}

// ── Data aggregation ──────────────────────────────────────────────────────────

function getActivityLog() {
  return (store.get("activityLog") || []).slice().reverse(); // most recent first
}

function getCheckinHistory() {
  const history = store.get("checkinHistory") || {};
  return Object.entries(history)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 14); // last 14 days
}

function getWeeklyTarget() {
  return store.get("strategicGoal")?.weeklySessionTarget || 3;
}

function getDaysActiveLast30() {
  const log = store.get("activityLog") || [];
  const activeDays = new Set(
    log
      .filter(e => daysAgo(e.loggedAt || e.completedAt || e.sessionStart) < 30)
      .filter(e => !["rest"].includes(e.type))
      .map(e => (e.loggedAt || e.completedAt || "").split("T")[0])
  );
  return activeDays.size;
}

function getWeeklyConsistencyScore() {
  const log = store.get("activityLog") || [];
  const ws = weekStart();
  const sessionsThisWeek = log.filter(e => {
    const d = new Date(e.loggedAt || e.completedAt || e.sessionStart);
    return d >= ws && !["rest"].includes(e.type);
  }).length;
  const target = getWeeklyTarget();
  return Math.min(1, sessionsThisWeek / target);
}

// ── Coach summary ─────────────────────────────────────────────────────────────

function buildProgressCoachMessage(log, checkins) {
  const name       = (store.get("name") || "").split(" ")[0] || "";
  const last7      = log.filter(e => daysAgo(e.loggedAt || e.completedAt || e.sessionStart) < 7);
  const last14     = log.filter(e => daysAgo(e.loggedAt || e.completedAt || e.sessionStart) < 14);
  const thisWeek   = log.filter(e => isThisWeek(e.loggedAt || e.completedAt || e.sessionStart));
  const target     = getWeeklyTarget();
  const daysActive = getDaysActiveLast30();

  if (log.length === 0) {
    return "Your progress will build here as we work together. I will tell you what I am noticing — not numbers for their own sake, but patterns that actually mean something. Complete a few sessions and I will have something useful to say.";
  }

  if (log.length < 3) {
    return "You are just getting started. That is exactly the right place to be. I am watching what works for you and will start noticing patterns once we have a bit more to go on.";
  }

  // Energy pattern
  const energyBefores = last7.filter(e => e.energyBefore).map(e => e.energyBefore);
  const energyAfters  = last7.filter(e => e.energyAfter).map(e => e.energyAfter);
  const avgBefore = energyBefores.length ? energyBefores.reduce((a, b) => a + b, 0) / energyBefores.length : null;
  const avgAfter  = energyAfters.length  ? energyAfters.reduce((a, b) => a + b, 0)  / energyAfters.length  : null;
  const energyRise = avgBefore && avgAfter && avgAfter > avgBefore + 0.5;

  // Consistency
  const consistencyScore = getWeeklyConsistencyScore();
  const hitTarget = thisWeek.filter(e => e.type !== "rest").length >= target;

  // Quiet / recovery presence
  const quietCount = last7.filter(e => ["breathing", "journal", "mindful", "rest", "quiet", "quiet-session"].includes(e.type)).length;
  const gymCount   = last7.filter(e => ["gym", "gym-programme", "coach-session"].includes(e.type)).length;

  if (hitTarget) {
    return "You have hit your session target for this week" + (name ? ", " + name : "") + ". I want you to notice that — not because targets are the point, but because consistency is. " + (energyRise ? "Your energy has consistently been higher after movement than before it this week. That pattern is worth holding onto." : "Keep going.");
  }

  if (energyRise && last7.length >= 3) {
    return "Something I have noticed this week: your energy after sessions has been higher than before them, reliably. That is not a coincidence. Movement is generating the energy it costs. That is worth knowing.";
  }

  if (gymCount >= 3 && quietCount === 0) {
    return "Three or more training sessions this week with no recovery work in the mix. I want to flag that — not to slow you down, but because rest and quiet sessions are where adaptation actually happens. Consider adding something restorative.";
  }

  if (daysActive >= 15) {
    return "You have been active on " + daysActive + " of the last 30 days. That is real consistency — the kind that builds something lasting rather than something that peaks and fades.";
  }

  const lastEntry = last7[0];
  if (lastEntry) {
    const dayWord = daysAgo(lastEntry.loggedAt || lastEntry.completedAt || lastEntry.sessionStart) === 0
      ? "today" : daysAgo(lastEntry.loggedAt || lastEntry.completedAt || lastEntry.sessionStart) === 1
      ? "yesterday" : daysAgo(lastEntry.loggedAt || lastEntry.completedAt || lastEntry.sessionStart) + " days ago";
    return "Your last session was " + dayWord + ". " + (thisWeek.filter(e => e.type !== "rest").length >= 2 ? "Good work this week." : "Keep building the pattern.");
  }

  return "Progress takes shape over time. Keep showing up and I will keep noticing what is working.";
}

// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  const log       = getActivityLog();
  const checkins  = getCheckinHistory();
  const thisWeek  = log.filter(e => isThisWeek(e.loggedAt || e.completedAt || e.sessionStart));
  const target    = getWeeklyTarget();
  const score     = getWeeklyConsistencyScore();
  const daysActive = getDaysActiveLast30();

  // Categorise log entries
  const coachSessions     = log.filter(e => e.source === "coach-recommended" || e.type === "coach-session");
  const prescribedSessions = log.filter(e => ["prescribed", "prescribed-session"].includes(e.type) || e.source === "prescribed");
  const gymSessions       = log.filter(e => ["gym", "gym-programme"].includes(e.type) && e.source !== "coach-recommended");
  const otherActivities   = log.filter(e =>
    !["breathing", "journal", "mindful", "rest", "quiet", "quiet-session",
      "prescribed", "prescribed-session", "coach-session",
      "gym", "gym-programme"].includes(e.type) &&
    e.source !== "coach-recommended" && e.source !== "prescribed"
  );
  const mindfulMoments    = log.filter(e =>
    ["breathing", "journal", "mindful", "rest", "quiet", "quiet-session"].includes(e.type)
  );

  const coachMessage = buildProgressCoachMessage(log, checkins);

  return `
    <div class="view progress-view">

      <div class="view-header">
        <h1>Progress</h1>
      </div>

      <!-- ── Coach summary ────────────────────────────────────────────── -->
      <div class="card card-coach progress-coach-card">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">${coachMessage}</p>
      </div>

      <!-- ── This week ──────────────────────────────────────────────────── -->
      ${renderThisWeek(thisWeek, target, score, daysActive)}

      <!-- ── Check-ins ─────────────────────────────────────────────────── -->
      ${checkins.length > 0 ? renderCheckins(checkins) : ""}

      <!-- ── Coach sessions ────────────────────────────────────────────── -->
      ${coachSessions.length > 0 ? renderSection("Coach Sessions", coachSessions, "&#127919;") : ""}

      <!-- ── Prescribed exercises ──────────────────────────────────────── -->
      ${prescribedSessions.length > 0 ? renderSection("Prescribed Exercises", prescribedSessions, "&#129338;") : ""}

      <!-- ── Gym sessions ───────────────────────────────────────────────── -->
      ${gymSessions.length > 0 ? renderSection("Gym Sessions", gymSessions, "&#127947;") : ""}

      <!-- ── Other activities ───────────────────────────────────────────── -->
      ${otherActivities.length > 0 ? renderSection("Other Activities", otherActivities, "&#127939;") : ""}

      <!-- ── Mindful moments ────────────────────────────────────────────── -->
      ${mindfulMoments.length > 0 ? renderSection("Mindful Moments", mindfulMoments, "&#127807;") : ""}

      <!-- ── Patterns ───────────────────────────────────────────────────── -->
      ${log.length >= 7 ? renderPatterns(log) : ""}

      <!-- ── Empty state ────────────────────────────────────────────────── -->
      ${log.length === 0 ? renderEmpty() : ""}

    </div>
  `;
}

// ── This week ─────────────────────────────────────────────────────────────────

function renderThisWeek(thisWeek, target, score, daysActive) {
  const activeSessions = thisWeek.filter(e => e.type !== "rest");
  const sessionCount   = activeSessions.length;
  const pct            = Math.min(100, Math.round(score * 100));

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const ws   = weekStart();

  // Build day dots — which days this week had activity
  const activeDaySet = new Set(
    activeSessions.map(e => {
      const d = new Date(e.loggedAt || e.completedAt || e.sessionStart);
      return d.getDay() === 0 ? 6 : d.getDay() - 1; // 0=Mon
    })
  );

  return `
    <div class="card progress-week-card">
      <div class="progress-week-header">
        <h3>This week</h3>
        <span class="progress-week-count">${sessionCount} of ${target} sessions</span>
      </div>

      <div class="progress-week-dots" role="group" aria-label="Days active this week">
        ${DAYS.map((day, i) => `
          <div class="progress-day-dot ${activeDaySet.has(i) ? "active" : ""}"
               aria-label="${day}${activeDaySet.has(i) ? ", active" : ""}">
            <span class="progress-day-label">${day}</span>
            <div class="progress-day-circle ${activeDaySet.has(i) ? "active" : ""}"></div>
          </div>
        `).join("")}
      </div>

      <div class="progress-week-bar-wrap">
        <div class="progress-week-bar" role="progressbar"
             aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"
             aria-label="Weekly target ${pct}% complete">
          <div class="progress-week-bar-fill" style="width:${pct}%"></div>
        </div>
      </div>

      <div class="progress-week-meta">
        <span class="text-sm text-muted">Active ${daysActive} of last 30 days</span>
        ${sessionCount >= target
          ? `<span class="progress-target-hit text-sm">Target reached</span>`
          : `<span class="text-sm text-muted">${target - sessionCount} to go</span>`}
      </div>
    </div>
  `;
}

// ── Check-ins ─────────────────────────────────────────────────────────────────

function renderCheckins(checkins) {
  return `
    <div class="card progress-checkins-card">
      <h3>Check-ins</h3>
      <p class="text-sm text-muted" style="margin-bottom:var(--space-4);">
        Last ${Math.min(checkins.length, 7)} days
      </p>

      <div class="progress-checkin-chart" role="list" aria-label="Check-in history">
        ${checkins.slice(0, 7).reverse().map(([date, data]) => {
          const energy = data.energy || 0;
          const mood   = data.mood   || 0;
          const sleep  = data.sleep  || 0;
          const d      = new Date(date);
          const days   = ["S", "M", "T", "W", "T", "F", "S"];
          const dayLabel = days[d.getDay()];

          return `
            <div class="progress-checkin-col" role="listitem"
                 aria-label="${formatDate(date)}: energy ${energy}, mood ${mood}">
              <div class="progress-checkin-bars">
                <div class="progress-checkin-bar energy"
                     style="height:${Math.max(4, energy * 10)}%"
                     aria-hidden="true" title="Energy ${energy}"></div>
                <div class="progress-checkin-bar mood"
                     style="height:${Math.max(4, mood * 10)}%"
                     aria-hidden="true" title="Mood ${mood}"></div>
              </div>
              <span class="progress-checkin-day">${dayLabel}</span>
            </div>
          `;
        }).join("")}
      </div>

      <div class="progress-checkin-legend">
        <span class="progress-legend-dot energy"></span><span class="text-sm text-muted">Energy</span>
        <span class="progress-legend-dot mood" style="margin-left:var(--space-4);"></span><span class="text-sm text-muted">Mood</span>
      </div>
    </div>
  `;
}

// ── Activity section ──────────────────────────────────────────────────────────

function renderSection(title, entries, icon) {
  const recent = entries.slice(0, 10); // max 10 per section

  return `
    <div class="card progress-section-card">
      <h3 class="progress-section-heading">
        <span aria-hidden="true">${icon}</span> ${title}
        <span class="progress-section-count">${entries.length}</span>
      </h3>

      <ul class="progress-activity-list" aria-label="${title}">
        ${recent.map(entry => renderActivityEntry(entry)).join("")}
      </ul>

      ${entries.length > 10 ? `
        <p class="text-sm text-muted" style="margin-top:var(--space-3);">
          Showing 10 most recent of ${entries.length} total.
        </p>
      ` : ""}
    </div>
  `;
}

function renderActivityEntry(entry) {
  const date     = entry.loggedAt || entry.completedAt || entry.sessionStart || "";
  const dateStr  = date ? formatDate(date) : "";
  const dAgo     = date ? daysAgo(date) : null;
  const dayStr   = dAgo === 0 ? "Today" : dAgo === 1 ? "Yesterday" : dateStr;
  const label    = entry.name || activityLabel(entry.type || entry.source || "");
  const feel     = entry.feel ? feelIcon(entry.feel) : "";
  const duration = entry.duration ? entry.duration + " min" : "";
  const thisWeekEntry = date && isThisWeek(date);

  return `
    <li class="progress-activity-entry ${thisWeekEntry ? "this-week" : ""}">
      <div class="progress-activity-main">
        <span class="progress-activity-label">${label}</span>
        ${feel ? `<span class="progress-activity-feel" aria-hidden="true">${feel}</span>` : ""}
      </div>
      <div class="progress-activity-meta">
        ${duration ? `<span class="text-sm text-muted">${duration}</span>` : ""}
        <span class="text-sm text-muted">${dayStr}</span>
      </div>
      ${entry.painChange && entry.painChange !== "none" ? `
        <span class="progress-pain-tag progress-pain-tag--${entry.painChange} text-sm">
          Pain: ${entry.painChange}
        </span>
      ` : ""}
    </li>
  `;
}

// ── Patterns ──────────────────────────────────────────────────────────────────

function renderPatterns(log) {
  const patterns = detectPatterns(log);
  if (!patterns.length) return "";

  return `
    <div class="card progress-patterns-card">
      <div class="card-coach" style="margin-bottom:var(--space-4);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div>
          <h3>What I am noticing</h3>
        </div>
      </div>
      <ul class="progress-patterns-list">
        ${patterns.map(p => `
          <li class="progress-pattern-item">
            <p class="text-sm">${p}</p>
          </li>
        `).join("")}
      </ul>
    </div>
  `;
}

function detectPatterns(log) {
  const patterns = [];
  const last14   = log.filter(e => daysAgo(e.loggedAt || e.completedAt || e.sessionStart) < 14);

  // Energy pattern
  const energyPairs = last14.filter(e => e.energyBefore && e.energyAfter);
  if (energyPairs.length >= 3) {
    const rises = energyPairs.filter(e => e.energyAfter > e.energyBefore).length;
    const pct   = Math.round((rises / energyPairs.length) * 100);
    if (pct >= 60) {
      patterns.push("Your energy after sessions has been higher than before them " + pct + "% of the time recently. Movement is generating the energy it costs for you.");
    }
  }

  // Pain pattern
  const painEntries = last14.filter(e => e.painChange);
  const painBetter  = painEntries.filter(e => e.painChange === "better").length;
  const painWorse   = painEntries.filter(e => e.painChange === "worse" || e.painChange === "sharp").length;
  if (painBetter > painWorse && painBetter >= 2) {
    patterns.push("Movement has been leaving you in less pain than before it more often than not recently. That is an important signal worth paying attention to.");
  }
  if (painWorse >= 2) {
    patterns.push("Pain has been worse after some sessions recently. This is worth noting for your next check-in. If it continues, consider mentioning it to a professional.");
  }

  // Quiet ratio
  const quietCount = last14.filter(e => ["breathing", "journal", "mindful", "rest"].includes(e.type)).length;
  const activeCount = last14.filter(e => !["breathing", "journal", "mindful", "rest"].includes(e.type)).length;
  if (activeCount >= 6 && quietCount === 0) {
    patterns.push("All training, no recovery in the last two weeks. Rest and quiet sessions are part of the programme — your body adapts during recovery, not during effort.");
  }
  if (quietCount >= 3 && activeCount >= 3) {
    patterns.push("You have been balancing active sessions with recovery and quieter practices. That balance is what makes the training sustainable.");
  }

  // Consistency
  const daysWithActivity = new Set(
    last14.filter(e => e.type !== "rest")
      .map(e => (e.loggedAt || e.completedAt || "").split("T")[0])
  ).size;
  if (daysWithActivity >= 8) {
    patterns.push("Active on " + daysWithActivity + " of the last 14 days. That level of consistency is uncommon and is exactly what produces lasting change.");
  }

  return patterns.slice(0, 3); // max 3 patterns shown
}

// ── Empty state ───────────────────────────────────────────────────────────────

function renderEmpty() {
  return `
    <div class="card" style="margin-top:var(--space-4);">
      <p class="text-sm text-muted" style="text-align:center; padding:var(--space-4) 0;">
        Nothing logged yet. Complete a session or check in and it will appear here.
      </p>
    </div>
  `;
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {
  // Progress is read-only — no interactive elements to wire
}
