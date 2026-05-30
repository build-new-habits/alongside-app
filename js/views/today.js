/**
 * today.js - Today View (Act 1 - Coach Greeting)
 *
 * 30 May 2026 v1
 *
 * Redesigned as the opening screen of the daily flow.
 * The coach speaks first -- always. She references what has happened
 * recently, what she was already thinking, then invites the check-in.
 * This is the "coach at the door" moment.
 *
 * Flow:
 *   Open app -> today.js (this screen)
 *     -> if no check-in today: show greeting + CTA to check in
 *     -> if checked in today:  redirect straight to coach-reflection
 *     -> if second session:    redirect straight to coach-reflection
 *        (coach-reflection handles the mini check-in prompt)
 *
 * Nav: always visible (Today tab active).
 *
 * Data read:
 *   activityLog      -- last 7 days for recent activity reference
 *   checkinHistory   -- frequency in last 7 days (via checkinData)
 *   name             -- for personal address
 *   conditions       -- so coach can acknowledge if relevant
 *   conditionPainScores -- pain context
 */

import { store }       from "../store.js";
import { checkinData } from "../data/checkin.js";

export const centered = false;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getFirstName() {
  return (store.get("name") || "").split(" ")[0] || "";
}

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day:     "numeric",
    month:   "long"
  });
}

/**
 * Returns the number of unique days with a completed activityLog entry
 * in the last N days (not counting today).
 */
function getDaysActiveLast(days) {
  const log   = store.get("activityLog") || [];
  const today = new Date().toISOString().split("T")[0];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  const dates = new Set(
    log
      .filter(e => e.date >= cutoffStr && e.date < today)
      .map(e => e.date)
  );
  return dates.size;
}

/**
 * Returns the most recent completed activityLog entry before today,
 * or null if none exists.
 */
function getLastActivity() {
  const log   = store.get("activityLog") || [];
  const today = new Date().toISOString().split("T")[0];
  const previous = log
    .filter(e => e.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));
  return previous[0] || null;
}

/**
 * Returns how many check-ins have been completed in the last 7 days.
 */
function getCheckinCountLast7() {
  const history = checkinData.getHistory(7) || [];
  const today   = new Date().toISOString().split("T")[0];
  const cutoff  = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const cutoffStr = cutoff.toISOString().split("T")[0];
  return history.filter(h => h.date >= cutoffStr && h.date < today).length;
}

/**
 * Human-readable activity type label.
 */
function activityLabel(type) {
  const labels = {
    "gym":            "a gym session",
    "gym-programme":  "a gym session",
    "coach-session":  "a gym session",
    "run":            "a run",
    "walk":           "a walk",
    "swim":           "a swim",
    "cycle":          "a cycle",
    "yoga":           "yoga",
    "mindfulness":    "some mindful movement",
    "breathing":      "a breathing practice",
    "journal":        "some journaling",
    "rest":           "a rest day",
    "class":          "a class",
    "morning-session":"a morning session",
  };
  return labels[type] || "a session";
}

/**
 * Relative day label: "yesterday", "two days ago", "on Thursday"
 */
function relativeDay(dateStr) {
  const today     = new Date();
  const entryDate = new Date(dateStr);
  const diffDays  = Math.round((today - entryDate) / 86400000);
  if (diffDays === 1) return "yesterday";
  if (diffDays === 2) return "two days ago";
  const dayName = entryDate.toLocaleDateString("en-GB", { weekday: "long" });
  return "on " + dayName;
}

/**
 * Build the coach greeting text.
 * Three parts:
 *   1. What she knows (recent activity + check-in frequency)
 *   2. What she was thinking (a soft pre-proposal hint)
 *   3. The invitation to check in
 *
 * Returns an array of paragraph strings.
 */
function buildGreeting() {
  const name          = getFirstName();
  const greeting      = getTimeGreeting();
  const checkinCount  = getCheckinCountLast7();
  const lastActivity  = getLastActivity();
  const daysActive    = getDaysActiveLast(7);
  const hour          = new Date().getHours();

  const lines = [];

  // ── Line 1: greeting + recent context ────────────────────────────────────
  if (lastActivity) {
    const actLabel = activityLabel(lastActivity.type);
    const dayLabel = relativeDay(lastActivity.date);

    if (checkinCount >= 5) {
      lines.push(
        greeting + (name ? ", " + name : "") + ". " +
        "You have checked in " + checkinCount + " times this week. " +
        "You did " + actLabel + " " + dayLabel + "."
      );
    } else if (checkinCount >= 3) {
      lines.push(
        greeting + (name ? ", " + name : "") + ". " +
        "You did " + actLabel + " " + dayLabel + "."
      );
    } else if (checkinCount === 0) {
      lines.push(
        greeting + (name ? ", " + name : "") + ". Good to see you."
      );
    } else {
      lines.push(
        greeting + (name ? ", " + name : "") + ". " +
        "You did " + actLabel + " " + dayLabel + "."
      );
    }
  } else {
    // No recent activity
    lines.push(
      greeting + (name ? ", " + name : "") + "."
    );
  }

  // ── Line 2: what coach was already thinking ───────────────────────────────
  if (lastActivity) {
    const type      = lastActivity.type;
    const feel      = lastActivity.feel;
    const dayLabel  = relativeDay(lastActivity.date);
    const diffDays  = Math.round(
      (new Date() - new Date(lastActivity.date)) / 86400000
    );

    if (daysActive >= 3) {
      // Multiple consecutive days -- suggest variety
      lines.push(
        "You have been at it a few days in a row. " +
        "I was thinking something that lets your body recover a little today -- " +
        "but let me hear from you first."
      );
    } else if (type === "gym" || type === "gym-programme" || type === "coach-session") {
      if (diffDays === 1) {
        lines.push(
          "I was thinking something different today -- " +
          "maybe a walk, some mobility work, or something lighter. " +
          "But let me do the check-in first so I can be sure."
        );
      } else {
        lines.push(
          "I was thinking a gym session could work well for you today. " +
          "Let me check in with you first."
        );
      }
    } else if (type === "run") {
      if (diffDays === 1) {
        lines.push(
          "You ran " + dayLabel + ". " +
          "I was thinking a rest or a gentler session today -- " +
          "but check in with me and we will see."
        );
      } else {
        lines.push(
          "I was thinking another run could work, or something different. " +
          "Let me know how you are feeling."
        );
      }
    } else if (type === "rest") {
      lines.push(
        "You rested " + dayLabel + ". " +
        "I was thinking it is a good day to move. " +
        "Check in and I will find the right thing."
      );
    } else {
      lines.push(
        "I have been thinking about what would work well for you today. " +
        "Check in first and I will tell you what I have in mind."
      );
    }
  } else if (checkinCount === 0) {
    // Brand new or lapsed user
    lines.push(
      "I do not have much history to go on yet. " +
      "A check-in will help me understand what you need today."
    );
  } else {
    lines.push(
      "I have been thinking about what would work well for you today. " +
      "Check in first and I will tell you what I have in mind."
    );
  }

  // ── Line 3: invitation to check in ───────────────────────────────────────
  lines.push(
    "But first -- let's do the check-in."
  );

  return lines;
}

// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  // If already checked in today, skip straight to coach-reflection.
  // onMount handles this to avoid render-loop issues.
  const hasCheckedIn = checkinData.hasCheckedInToday();

  const greetingLines = buildGreeting();
  const name          = getFirstName();

  return `
    <div class="view today-greeting-view">

      <div class="view-header">
        <h1>${formatDate(new Date())}</h1>
      </div>

      <!-- Coach greeting card -->
      <div class="card card-coach" role="region" aria-label="Your coach">
        <img src="assets/images/logo-icon-192.png"
             alt="" class="coach-icon-small" aria-hidden="true">
        <div class="coach-greeting-content">
          ${greetingLines.map((line, i) => `
            <p class="${i === greetingLines.length - 1 ? "coach-invite-line" : ""}">
              ${line}
            </p>
          `).join("")}
        </div>
      </div>

      ${hasCheckedIn ? `
        <!-- Already checked in today -- offer to go straight to reflection -->
        <button class="btn btn-primary btn-large btn-full"
                id="today-goto-reflection-btn"
                style="margin-top: var(--space-5);"
                aria-label="Continue to your session">
          Continue &rarr;
        </button>
        <button class="btn btn-ghost btn-full"
                id="today-update-checkin-btn"
                style="margin-top: var(--space-3);">
          Update my check-in
        </button>
      ` : `
        <!-- Check-in CTA -->
        <button class="btn btn-primary btn-large btn-full"
                id="today-checkin-btn"
                style="margin-top: var(--space-5);"
                aria-label="Start your daily check-in">
          Check in &rarr;
        </button>
      `}

      <!-- Soft recent history strip (no streaks -- days active only) -->
      ${renderRecentStrip()}

    </div>
  `;
}

/**
 * Render a minimal recent activity strip.
 * Shows days active in last 7 days and last session type.
 * No streak language. No numbers as targets.
 */
function renderRecentStrip() {
  const daysActive   = getDaysActiveLast(7);
  const lastActivity = getLastActivity();

  if (!lastActivity && daysActive === 0) return "";

  return `
    <div class="today-recent-strip" aria-label="Recent activity">
      ${daysActive > 0 ? `
        <div class="today-recent-stat">
          <span class="today-recent-value">${daysActive}</span>
          <span class="today-recent-label">
            ${daysActive === 1 ? "day active" : "days active"} this week
          </span>
        </div>
      ` : ""}
      ${lastActivity ? `
        <div class="today-recent-stat">
          <span class="today-recent-value">
            ${activityLabel(lastActivity.type)}
          </span>
          <span class="today-recent-label">
            ${relativeDay(lastActivity.date)}
          </span>
        </div>
      ` : ""}
    </div>
  `;
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {
  // If already checked in today, redirect to coach-reflection immediately.
  // Small delay to let the render complete visually first.
  const hasCheckedIn = checkinData.hasCheckedInToday();

  if (hasCheckedIn) {
    // Show the screen briefly then offer Continue button -- do not
    // auto-redirect (user may have tapped Today tab intentionally).
    document.getElementById("today-goto-reflection-btn")?.addEventListener("click", () => {
      router.navigate("coach-reflection");
    });

    document.getElementById("today-update-checkin-btn")?.addEventListener("click", () => {
      router.navigate("checkin");
    });

    return;
  }

  // Not yet checked in today -- single CTA
  document.getElementById("today-checkin-btn")?.addEventListener("click", () => {
    router.navigate("checkin");
  });
}
