/**
 * library.js - Library Page
 *
 * 05 Aug 2026 v3
 *
 * v3 — Gym Session Builder Phase 1 (blueprint
 *   alongside_blueprint_gym-session-builder-phase1_05aug2026_v2.md).
 *   "At the gym" category fixed: Core/Upper body/Lower body/Strength
 *   were confirmed non-functional duplicates -- all four navigated to
 *   gym-programme with no parameter, and gym-programme.js had no way
 *   to receive one, so all four produced the identical result
 *   regardless of which was tapped. Core/Upper/Lower now route into
 *   session-builder-ui.js with the matching type pre-selected via a
 *   new preselectType field, passed through navigateToSession() as
 *   store.sessionBuilderPreselect (read once, cleared, same pattern
 *   as running-session.js's resume checkpoint). "Strength" retired --
 *   it never mapped to any real SESSION_TYPES id -- replaced with
 *   "Glute Focus" (already existed in the engine, never surfaced in
 *   Library before now). New "Full Body" card added as the blend
 *   option. "My programme" and "Cardio" (a log-what-you-did shortcut,
 *   a different, working, deliberately-unchanged feature) untouched.
 *
 * 04 Aug 2026 v2
 *
 * v2 — renderGuidedSubScreen()'s session cards restructured slightly:
 *   label + note now wrapped in a .library-session-text span, needed
 *   so the new CSS (library.css v2) can lay out icon-left/text-stacked-
 *   right correctly — the two spans were previously flex siblings with
 *   nothing grouping them for that layout. No behaviour change, markup
 *   only.
 *
 * 18 May 2026 v1
 *
 * NS-2: Library moved from Settings tab to dedicated route.
 * Structured with two main sections: Guided Sessions and Log an Activity.
 * Each section opens a sub-screen with branched options rather than
 * scrolling through a long list on one screen.
 *
 * Structure:
 *   Landing → two large cards: "Start a session" and "Log what I did"
 *
 *   Guided Sessions sub-screen:
 *     Home     → Mixed workout, Core, HIIT, Strength, Cardio, Mobility
 *     Gym      → My programme, Core, Upper body, Lower body, Strength, Cardio
 *     Swim     → swim-session
 *     Run      → running-session
 *     Cycle    → cycle-session
 *     Mindful  → Breathing, Journal, Mindful movement, Yoga/Pilates
 *     Quiet    → Rest day, Prescribed exercises
 *
 *   Log an Activity sub-screen:
 *     Cardio, Classes, Sport, Outdoor, Mindful — navigates to activity-log
 *     or directly to the relevant session view
 *
 * Route: library
 * Nav: shown (standard bottom nav)
 */

import { store } from "../store.js";

export const centered = false;

// ── State ─────────────────────────────────────────────────────────────────────
let screen = "landing";  // "landing" | "guided" | "guided-home" | "guided-gym"
                          // "guided-mindful" | "log"

// ── Session definitions ───────────────────────────────────────────────────────

const GUIDED_CATEGORIES = [
  {
    id:          "home",
    label:       "At home",
    icon:        "\uD83C\uDFE0",
    description: "Bodyweight or home equipment",
    sessions: [
      { label: "Mixed workout",  icon: "\u2728",        target: "home-workout",   note: "Coach builds a range of things" },
      { label: "Core",          icon: "\uD83E\uDDD8",  target: "core-session",   note: "Choose intensity" },
      { label: "HIIT",          icon: "\u26A1",        target: "core-session",   note: "High intensity intervals" },
      { label: "Strength",      icon: "\uD83D\uDCAA",  target: "core-session",   note: "Bodyweight or home weights" },
      { label: "Cardio",        icon: "\uD83C\uDFC3",  target: "walk-session",   note: "Raise the heart rate" },
      { label: "Mobility",      icon: "\uD83C\uDF3F",  target: "core-session",   note: "Open and unlock the body" },
    ]
  },
  {
    id:          "gym",
    label:       "At the gym",
    icon:        "\uD83C\uDFCB",
    description: "Your gym programme and session types",
    // 05 Aug 2026 -- Core/Upper body/Lower body/Strength were confirmed
    // non-functional duplicates: all navigated to gym-programme with no
    // parameter, and gym-programme.js had no way to receive one, so all
    // four produced the identical result regardless of which was tapped.
    // Fixed: Core/Upper/Lower now route into session-builder-ui.js with
    // the matching SESSION_TYPES id pre-selected (via preselectType,
    // read once by session-builder-ui.js's onMount, same pattern as
    // running-session.js's resume-checkpoint reading). "Strength" is
    // retired -- it never mapped to any real SESSION_TYPES id (glute/
    // upper/lower/full/core/cardio/mobility has no "strength" entry) --
    // replaced with "Glute Focus", which already exists in the engine
    // and was never surfaced anywhere in Library before now. New "Full
    // Body" card added as the blend option Graeme asked for, mapping to
    // SESSION_TYPES' "full" (free-tier available). "My programme" and
    // "Cardio" (a log-what-you-did shortcut to activity-log, a
    // different, working, deliberately-unchanged feature) are untouched.
    sessions: [
      { label: "My programme",   icon: "\uD83C\uDFCB",  target: "gym-programme",   note: "Your current programme" },
      { label: "Core",           icon: "\uD83E\uDDD8",  target: "session-builder", note: "", preselectType: "core"  },
      { label: "Upper body",     icon: "\uD83D\uDCAA",  target: "session-builder", note: "", preselectType: "upper" },
      { label: "Lower body",     icon: "\uD83E\uDDB5",  target: "session-builder", note: "", preselectType: "lower" },
      { label: "Glute Focus",    icon: "\uD83C\uDF51",  target: "session-builder", note: "", preselectType: "glute" },
      { label: "Full Body",      icon: "\u26A1",        target: "session-builder", note: "A blend of everything", preselectType: "full" },
      { label: "Cardio",         icon: "\uD83C\uDFC3",  target: "activity-log",    note: "Treadmill, bike, rower" },
    ]
  },
  {
    id:          "run",
    label:       "Run",
    icon:        "\uD83C\uDFC3",
    description: "Easy, intervals, or long run",
    sessions: [],
    directTarget: "running-session"
  },
  {
    id:          "walk",
    label:       "Walk",
    icon:        "\uD83D\uDEB6",
    description: "Gentle, mindful, brisk, or nature walk",
    sessions: [],
    directTarget: "walk-session"
  },
  {
    id:          "swim",
    label:       "Swim",
    icon:        "\uD83C\uDFCA",
    description: "Steady or interval swim session",
    sessions: [],
    directTarget: "swim-session"
  },
  {
    id:          "cycle",
    label:       "Cycle",
    icon:        "\uD83D\uDEB4",
    description: "Road, indoor, or turbo trainer",
    sessions: [],
    directTarget: "cycle-session"
  },
  {
    id:          "yoga",
    label:       "Yoga / Pilates",
    icon:        "\uD83E\uDDD8",
    description: "Flexibility, strength, balance, recovery",
    sessions: [],
    directTarget: "yoga-session"
  },
  {
    id:          "mindful",
    label:       "Mindful practice",
    icon:        "\uD83C\uDF3F",
    description: "Breathing, journaling, mindful movement",
    sessions: [
      { label: "Breathing",       icon: "\uD83C\uDF2C\uFE0F", target: "quiet-session", quiet: "breathing",  note: "" },
      { label: "Journal",         icon: "\uD83D\uDCDD",        target: "quiet-session", quiet: "journal",    note: "" },
      { label: "Mindful movement",icon: "\uD83C\uDF3F",        target: "quiet-session", quiet: "mindful",   note: "" },
      { label: "Rest day",        icon: "\uD83D\uDECC",        target: "reflect",                            note: "Log a deliberate rest" },
    ]
  },
  {
    id:          "prescribed",
    label:       "Prescribed",
    icon:        "\uD83E\uDE7A",
    description: "Exercises from your physio or specialist",
    sessions: [],
    directTarget: "prescribed"
  },
  {
    id:          "coach",
    label:       "Coach recommends",
    icon:        "\uD83C\uDFAF",
    description: "Let the coach suggest something for today",
    sessions: [],
    directTarget: "coach-proposal"
  },
];

const LOG_CATEGORIES = [
  {
    group: "Cardio",
    items: [
      { label: "Run",          icon: "\uD83C\uDFC3", target: "activity-log" },
      { label: "Walk",         icon: "\uD83D\uDEB6", target: "activity-log" },
      { label: "Cycle",        icon: "\uD83D\uDEB4", target: "activity-log" },
      { label: "Swim",         icon: "\uD83C\uDFCA", target: "activity-log" },
      { label: "Row",          icon: "\uD83D\uDEA3", target: "activity-log" },
      { label: "Hike",         icon: "\uD83E\uDD7E", target: "activity-log" },
    ]
  },
  {
    group: "Classes",
    items: [
      { label: "Boxing",       icon: "\uD83E\uDD4A", target: "activity-log" },
      { label: "Spin class",   icon: "\uD83D\uDEB4", target: "activity-log" },
      { label: "HIIT",         icon: "\u26A1",        target: "activity-log" },
      { label: "Body Balance", icon: "\uD83E\uDDD8",  target: "activity-log" },
      { label: "Other class",  icon: "\uD83C\uDFE5",  target: "activity-log" },
    ]
  },
  {
    group: "Sport",
    items: [
      { label: "Tennis",       icon: "\uD83C\uDFBE", target: "activity-log" },
      { label: "Football",     icon: "\u26BD",        target: "activity-log" },
      { label: "Golf",         icon: "\u26F3",        target: "activity-log" },
      { label: "Other sport",  icon: "\uD83C\uDFC6",  target: "activity-log" },
    ]
  },
  {
    group: "Outdoor",
    items: [
      { label: "Hike",         icon: "\uD83E\uDD7E", target: "activity-log" },
      { label: "Outdoor cycle",icon: "\uD83D\uDEB4", target: "activity-log" },
      { label: "Other outdoor",icon: "\uD83C\uDF33", target: "activity-log" },
    ]
  },
  {
    group: "Mindful and gentle",
    items: [
      { label: "Yoga",         icon: "\uD83E\uDDD8",  target: "activity-log" },
      { label: "Pilates",      icon: "\uD83E\uDDD8",  target: "activity-log" },
      { label: "Stretching",   icon: "\uD83C\uDF3F",  target: "activity-log" },
      { label: "Meditation",   icon: "\uD83D\uDE4F",  target: "activity-log" },
      { label: "Something else",icon: "\u2754",        target: "activity-log" },
    ]
  },
];

// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  if (screen === "landing")       return renderLanding();
  if (screen === "guided")        return renderGuidedLanding();
  if (screen === "log")           return renderLogLanding();
  if (screen.startsWith("guided-")) return renderGuidedSubScreen(screen.replace("guided-", ""));
  return renderLanding();
}

// ── Landing ───────────────────────────────────────────────────────────────────

function renderLanding() {
  const name = store.get("name") || "";
  return `
    <div class="view library-view">
      <div class="view-header">
        <h1>Library</h1>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-5);">
        <img src="assets/images/logo-icon-192.png" alt=""
             class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">
          ${name ? name + ". " : ""}What would you like to do?
        </p>
      </div>

      <div class="library-landing-grid">

        <button class="library-landing-card" id="lib-start-session-btn"
                aria-label="Start a guided session">
          <span class="library-landing-icon" aria-hidden="true">\u25B6\uFE0F</span>
          <span class="library-landing-label">Start a session</span>
          <span class="library-landing-sub">Guided sessions for any activity</span>
        </button>

        <button class="library-landing-card" id="lib-log-activity-btn"
                aria-label="Log an activity you have done">
          <span class="library-landing-icon" aria-hidden="true">\u2795</span>
          <span class="library-landing-label">Log what I did</span>
          <span class="library-landing-sub">Capture something you have already done</span>
        </button>

      </div>

    </div>
  `;
}

// ── Guided sessions landing ───────────────────────────────────────────────────

function renderGuidedLanding() {
  return `
    <div class="view library-view">
      <div class="library-sub-header">
        <button class="btn btn-ghost" id="lib-back-btn" aria-label="Back to Library">
          \u2190 Back
        </button>
        <h1>Start a session</h1>
      </div>

      <p class="text-sm text-secondary" style="margin-bottom: var(--space-4);">
        Choose your activity. No check-in needed from here.
      </p>

      <div class="library-category-grid">
        ${GUIDED_CATEGORIES.map(cat => `
          <button class="library-category-card"
                  data-guided="${cat.id}"
                  aria-label="${cat.label}: ${cat.description}">
            <span class="library-category-icon" aria-hidden="true">${cat.icon}</span>
            <span class="library-category-label">${cat.label}</span>
            <span class="library-category-sub">${cat.description}</span>
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

// ── Guided sub-screen (home / gym / mindful) ──────────────────────────────────

function renderGuidedSubScreen(categoryId) {
  const cat = GUIDED_CATEGORIES.find(c => c.id === categoryId);
  if (!cat) return renderGuidedLanding();

  return `
    <div class="view library-view">
      <div class="library-sub-header">
        <button class="btn btn-ghost" id="lib-back-btn" aria-label="Back">
          \u2190 Back
        </button>
        <h1>${cat.icon} ${cat.label}</h1>
      </div>

      <p class="text-sm text-secondary" style="margin-bottom: var(--space-4);">
        ${cat.description}
      </p>

      <div class="library-session-grid">
        ${cat.sessions.map(s => `
          <button class="library-session-card"
                  data-target="${s.target}"
                  ${s.quiet ? `data-quiet="${s.quiet}"` : ""}
                  ${s.preselectType ? `data-preselect-type="${s.preselectType}"` : ""}
                  aria-label="${s.label}${s.note ? ": " + s.note : ""}">
            <span class="library-session-icon" aria-hidden="true">${s.icon}</span>
            <span class="library-session-text">
              <span class="library-session-label">${s.label}</span>
              ${s.note ? `<span class="library-session-note">${s.note}</span>` : ""}
            </span>
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

// ── Log an activity landing ───────────────────────────────────────────────────

function renderLogLanding() {
  return `
    <div class="view library-view">
      <div class="library-sub-header">
        <button class="btn btn-ghost" id="lib-back-btn" aria-label="Back to Library">
          \u2190 Back
        </button>
        <h1>Log what I did</h1>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-4);">
        <img src="assets/images/logo-icon-192.png" alt=""
             class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">
          What did you do? I will note it and factor it into what I suggest next.
        </p>
      </div>

      ${LOG_CATEGORIES.map(group => `
        <h3 class="library-group-heading">${group.group}</h3>
        <div class="library-grid library-grid--compact" role="group"
             aria-label="${group.group} activities">
          ${group.items.map(item => `
            <button class="library-card library-card--compact"
                    data-log-target="${item.target}"
                    data-log-label="${item.label}"
                    aria-label="Log ${item.label}">
              <span class="library-card-icon" aria-hidden="true">${item.icon}</span>
              <span class="library-card-label">${item.label}</span>
            </button>
          `).join("")}
        </div>
      `).join("")}
    </div>
  `;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// 05 Aug 2026 -- added preselectType param. When set, writes
// sessionBuilderPreselect to store before navigating, so
// session-builder-ui.js can skip straight past its own type picker with
// the right type already chosen -- read-once-and-clear pattern, same as
// running-session.js's resume checkpoint.
function navigateToSession(target, quiet, preselectType) {
  if (quiet) store.set("quietMode", quiet);
  if (preselectType) store.set("sessionBuilderPreselect", { type: preselectType });
  screen = "landing";  // reset for next time
  router.navigate(target);
}

function rerender() {
  const main = document.getElementById("main-content");
  if (main) { main.innerHTML = render(); onMount(); }
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {

  // Landing
  document.getElementById("lib-start-session-btn")?.addEventListener("click", () => {
    screen = "guided";
    rerender();
  });

  document.getElementById("lib-log-activity-btn")?.addEventListener("click", () => {
    screen = "log";
    rerender();
  });

  // Back button — context-aware
  document.getElementById("lib-back-btn")?.addEventListener("click", () => {
    if (screen === "guided" || screen === "log") {
      screen = "landing";
    } else if (screen.startsWith("guided-")) {
      screen = "guided";
    } else {
      screen = "landing";
    }
    rerender();
  });

  // Guided category cards
  document.querySelectorAll("[data-guided]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id  = btn.dataset.guided;
      const cat = GUIDED_CATEGORIES.find(c => c.id === id);
      if (!cat) return;

      // Direct targets (run, walk, swim, cycle, yoga, prescribed, coach)
      if (cat.directTarget) {
        navigateToSession(cat.directTarget, null);
        return;
      }

      // Sub-screen for home, gym, mindful
      screen = `guided-${id}`;
      rerender();
    });
  });

  // Guided sub-screen session cards
  document.querySelectorAll("[data-target]").forEach(btn => {
    btn.addEventListener("click", () => {
      const target        = btn.dataset.target;
      const quiet          = btn.dataset.quiet || null;
      const preselectType  = btn.dataset.preselectType || null;
      if (!target) return;
      navigateToSession(target, quiet, preselectType);
    });
  });

  // Log activity cards
  document.querySelectorAll("[data-log-target]").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.logTarget;
      const label  = btn.dataset.logLabel;
      // Pre-populate activity log with the selected type
      store.set("pendingLogActivity", label);
      screen = "landing";
      router.navigate(target);
    });
  });
}
