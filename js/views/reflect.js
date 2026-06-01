/**
 * reflect.js - Reflect Screen
 *
 * 01 Jun 2026 v1
 *
 * v1 -- Coach acknowledgement improvements:
 *   buildSummary() now generates more specific coach lines using
 *   session type, duration, and feel answer. Each activity type
 *   gets its own response pattern rather than a generic fallback.
 *   Duration reference added ("45 minutes of real work") where available.
 *   Pain-change lines take priority as before.
 *
 * v1.0 -- "So, how was that?" moment.
 *   Triggered after any activity completes.
 *   Reads currentActivityEntry from store to personalise the coach question.
 *   Two stages:
 *     1. Quick-tap adaptive intel (feel + pain)
 *     2. Open wellbeing invitation
 *   Writes reflect data back to activityLog entry.
 *   Ends with a coach summary and route back to Today.
 */

import { store } from "../store.js";

export const centered = false;

// -- State -------------------------------------------------------------------------

let stage      = "reflect";   // "reflect" | "summary"
let feelAnswer = null;
let painAnswer = null;
let openText   = "";

// -- Coach question variants -------------------------------------------------------

const QUESTIONS = {
  "gym":            "So, how was that? I want to know what it actually felt like in there.",
  "run":            "How was the run? Not the distance -- how did it feel?",
  "walk":           "How was that? What did you notice?",
  "swim":           "How was the swim? How does your body feel now?",
  "cycle":          "How was the ride? How do you feel?",
  "class":          "How was the class? I'd love to hear it in your own words.",
  "yoga":           "How do you feel? Not just physically -- all of it.",
  "mindfulness":    "How was that? What did you notice?",
  "journal":        "Thank you for taking that time. How do you feel now compared to when you started?",
  "rest":           "How was the rest? Sometimes that's the hardest choice to make.",
  "breathing":      "How are you feeling after that? What shifted, if anything?",
  "coach-session":  "Session done. How does your body feel right now?",
  "morning-session":"Session done. How does your body feel right now?",
  "other":          "So, how was that?",
};

const FEEL_OPTIONS = {
  "gym":           [{ v: "strong", l: "Felt strong" }, { v: "right", l: "About right" }, { v: "hard", l: "Struggled" }],
  "run":           [{ v: "good",   l: "Felt good"   }, { v: "steady", l: "Steady"     }, { v: "tough", l: "Tough today" }],
  "walk":          [{ v: "good",   l: "Felt good"   }, { v: "steady", l: "Steady"     }, { v: "tough", l: "Tough today" }],
  "swim":          [{ v: "good",   l: "Felt good"   }, { v: "steady", l: "Steady"     }, { v: "tough", l: "Tough today" }],
  "cycle":         [{ v: "good",   l: "Felt good"   }, { v: "steady", l: "Steady"     }, { v: "tough", l: "Tough today" }],
  "class":         [{ v: "loved",  l: "Loved it"    }, { v: "good",   l: "Good session"}, { v: "hard", l: "Hard going"  }],
  "yoga":          [{ v: "grounded", l: "Grounded"  }, { v: "okay",   l: "Okay"       }, { v: "restless", l: "Restless" }],
  "mindfulness":   [{ v: "grounded", l: "Grounded"  }, { v: "okay",   l: "Okay"       }, { v: "restless", l: "Restless" }],
  "rest":          [{ v: "needed",   l: "Needed it" }, { v: "okay",   l: "Okay"       }, { v: "restless", l: "Restless" }],
  "breathing":     [{ v: "calmer",   l: "Calmer"    }, { v: "okay",   l: "Okay"       }, { v: "same", l: "About the same" }],
  "coach-session": [{ v: "strong", l: "Felt strong" }, { v: "right", l: "About right" }, { v: "hard", l: "Struggled" }],
  "morning-session":[{ v: "strong", l: "Felt strong" }, { v: "right", l: "About right" }, { v: "hard", l: "Struggled" }],
};

const PAIN_OPTIONS = [
  { v: "none",    l: "No pain"           },
  { v: "better",  l: "Better than usual" },
  { v: "same",    l: "About the same"    },
  { v: "worse",   l: "Worse than usual"  },
];

const WELLBEING_INVITATIONS = [
  "How do you feel about yourself after that?",
  "What are you taking away from today?",
  "How does it feel to have shown up?",
  "Is there anything your body is telling you right now?",
  "What did you notice about yourself today?",
];

// -- Summary builder ---------------------------------------------------------------

function buildSummary(entry, feel, pain) {
  const log       = store.get("activityLog") || [];
  const thisWeek  = log.filter(e => {
    const d = new Date(e.date);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    return d >= weekStart;
  });

  const sessionCount = thisWeek.length;
  const type         = entry?.type || "session";
  const name         = entry?.name;
  const duration     = entry?.duration || null;

  // Duration reference -- used in several lines below
  const durRef = duration && duration >= 10
    ? duration + " minutes"
    : null;

  // Pain improving -- always leads if present
  if (pain === "better") {
    return "I noticed things felt better today than usual. That is worth paying attention to -- your body is responding.";
  }
  if (pain === "worse" || pain === "sharp") {
    return "Things were harder today and you showed up anyway. I have noted that. We will factor it in next time.";
  }

  // Session-type specific lines
  if (type === "rest") {
    return "Rest noted. Your body will use it. See you next time.";
  }
  if (type === "breathing" || type === "mindfulness") {
    return feel === "calmer"
      ? "That shift in how you feel -- that is the point of it. Well done for taking the time."
      : "Showing up for that kind of session takes a different kind of effort. It counts.";
  }
  if (type === "journal") {
    return "That reflection time is not nothing. What you bring to the surface shapes what comes next.";
  }
  if (type === "walk") {
    return durRef
      ? durRef + " outside. Movement that generates the energy it costs."
      : "That walk counts. Movement is movement.";
  }
  if (type === "run") {
    return feel === "good"
      ? (durRef ? durRef + " running. Good session." : "Good run. I have noted it.")
      : "Runs that feel tough still build the same fitness. Done is done.";
  }
  if (type === "class" && name) {
    return name + " is in the books. I will count that alongside everything else -- it all matters.";
  }
  if (type === "class") {
    return "Class done. I have logged it. That consistency adds up.";
  }
  if (type === "coach-session" || type === "gym" || type === "gym-programme" || type === "morning-session") {
    if (feel === "strong") {
      return durRef
        ? "Strong session. " + durRef + " of real work. I will remember that for next time."
        : "Strong session. I will remember that when I plan what comes next.";
    }
    if (feel === "hard" || feel === "struggled") {
      return "Hard sessions count just as much as easy ones. You finished it. That is what matters.";
    }
    if (feel === "right") {
      return durRef
        ? durRef + " done. Right in the zone."
        : "Session done. Right in the zone.";
    }
  }

  // Feel-based general lines
  if (feel === "strong") {
    return sessionCount >= 3
      ? "That is " + sessionCount + " sessions this week. You are building something real here."
      : "You were strong today. I will remember that when I plan your next session.";
  }
  if (feel === "hard" || feel === "tough") {
    return "Hard sessions count just as much as easy ones. You finished it. That is what matters.";
  }

  // Session count line
  if (sessionCount >= 3) {
    return "That is " + sessionCount + " sessions this week. Consistency is exactly how this works.";
  }

  return "Done. I have noted how today went and I will use it next time.";
}

// -- Render -----------------------------------------------------------------------

export function render() {
  const entry      = store.get("currentActivityEntry") || {};
  const type       = entry.type  || "other";
  const name       = entry.name;
  const conditions = store.get("conditions") || [];
  const hasConds   = conditions.length > 0;

  const question   = QUESTIONS[type] || QUESTIONS["other"];
  const feelOpts   = FEEL_OPTIONS[type] || FEEL_OPTIONS["coach-session"];

  // Wellbeing invitation -- rotates by day
  const dayIdx     = new Date().getDay();
  const weekNum    = store.get("gymProgrammeWeek") || 1;
  const invitation = WELLBEING_INVITATIONS[(dayIdx + weekNum) % WELLBEING_INVITATIONS.length];

  if (stage === "summary") {
    const summary = buildSummary(entry, feelAnswer, painAnswer);
    return `
      <div class="view reflect-view">
        <div class="view-header">
          <h1>Done</h1>
        </div>
        <div class="card card-coach reflect-coach-card">
          <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
          <p class="coach-message-text">${summary}</p>
        </div>
        <button class="btn btn-primary btn-large btn-full" id="reflect-finish-btn"
                style="margin-top: var(--space-4);">
          Back to Today
        </button>
      </div>`;
  }

  return `
    <div class="view reflect-view">

      <div class="view-header">
        <h1>${name ? name : "How was that?"}</h1>
      </div>

      <!-- Coach question -->
      <div class="card card-coach reflect-coach-card">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">${question}</p>
      </div>

      <!-- Feel chips -->
      <div class="reflect-section">
        <p class="reflect-section-label">How did it feel?</p>
        <div class="reflect-chips" role="group" aria-label="How it felt">
          ${feelOpts.map(o => `
            <button class="chip ${feelAnswer === o.v ? "selected" : ""}"
                    data-feel="${o.v}"
                    aria-pressed="${feelAnswer === o.v}">
              ${o.l}
            </button>
          `).join("")}
        </div>
      </div>

      <!-- Pain check if conditions present -->
      ${hasConds ? `
        <div class="reflect-section">
          <p class="reflect-section-label">Any pain or discomfort?</p>
          <div class="reflect-chips" role="group" aria-label="Pain level">
            ${PAIN_OPTIONS.map(o => `
              <button class="chip chip--sm ${painAnswer === o.v ? "selected" : ""}"
                      data-pain="${o.v}"
                      aria-pressed="${painAnswer === o.v}">
                ${o.l}
              </button>
            `).join("")}
          </div>
        </div>
      ` : ""}

      <!-- Wellbeing invitation -->
      <div class="reflect-section">
        <div class="card card-coach reflect-wellbeing-card">
          <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
          <p class="coach-message-text reflect-invitation">${invitation}</p>
        </div>
        <textarea id="reflect-open-text"
                  class="reflect-textarea"
                  placeholder="Whatever comes to mind... or just tap Done."
                  rows="4"
                  aria-label="Your reflection">${openText}</textarea>
      </div>

      <!-- Done -->
      <button class="btn btn-primary btn-large btn-full" id="reflect-done-btn"
              style="margin-top: var(--space-4);">
        Done
      </button>
      <button class="btn btn-ghost btn-full" id="reflect-skip-btn"
              style="margin-top: var(--space-2);">
        Skip reflection
      </button>

    </div>
  `;
}

// -- Mount -------------------------------------------------------------------------

export function onMount() {
  stage      = "reflect";
  feelAnswer = null;
  painAnswer = null;
  openText   = "";

  const view = document.querySelector(".reflect-view");
  if (!view) return;

  view.addEventListener("click", e => {

    // Feel chip
    const feelChip = e.target.closest("[data-feel]");
    if (feelChip) {
      feelAnswer = feelChip.dataset.feel;
      view.querySelectorAll("[data-feel]").forEach(c => {
        const sel = c.dataset.feel === feelAnswer;
        c.classList.toggle("selected", sel);
        c.setAttribute("aria-pressed", sel);
      });
      return;
    }

    // Pain chip
    const painChip = e.target.closest("[data-pain]");
    if (painChip) {
      painAnswer = painChip.dataset.pain;
      view.querySelectorAll("[data-pain]").forEach(c => {
        const sel = c.dataset.pain === painAnswer;
        c.classList.toggle("selected", sel);
        c.setAttribute("aria-pressed", sel);
      });
      return;
    }

    // Done
    const doneBtn = e.target.closest("#reflect-done-btn");
    if (doneBtn) { saveAndSummarise(); return; }

    // Skip
    const skipBtn = e.target.closest("#reflect-skip-btn");
    if (skipBtn) { saveAndSummarise(); return; }

    // Finish (summary screen)
    const finishBtn = e.target.closest("#reflect-finish-btn");
    if (finishBtn) {
      router.navigate("progress");
    }
  });
}

function saveAndSummarise() {
  const textarea = document.getElementById("reflect-open-text");
  openText = textarea?.value.trim() || "";

  // Write reflect data back to the current activity log entry
  const log = store.get("activityLog") || [];
  const entry = store.get("currentActivityEntry");
  if (entry && log.length > 0) {
    const idx = log.findIndex(e => e.id === entry.id);
    if (idx !== -1) {
      log[idx] = {
        ...log[idx],
        feel:        feelAnswer,
        painChange:  painAnswer,
        note:        openText || null,
        energyAfter: null,
        completedAt: new Date().toISOString(),
      };
      store.set("activityLog", log);
    }
  }

  stage = "summary";
  const main = document.getElementById("main-content");
  if (main) {
    main.innerHTML = render();
    onMount();
  }
}
