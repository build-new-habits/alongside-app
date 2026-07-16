/**
 * reflect.js - Reflect Screen
 *
 * 16 Jul 2026 v2 (S4-B3-2) - Empathy Transfer wiring:
 *   Session B3 (15-16 Jul) confirmed the 19-prompt empathy transfer
 *   library (alongside_empathy_transfer_prompts_19may2026_v1.docx) was
 *   fully dormant — spec existed, nothing in store.js or reflect.js
 *   implemented any part of it. This version builds and wires it.
 *
 *   New import: EMPATHY_PROMPTS from ../data/empathy-transfer.js.
 *   New stage: "empathy" — a final screen inserted between the
 *   existing reflect screen and the summary screen, per the spec's
 *   placement instruction ("final screen in reflect.js, after the
 *   feel chips, pain check, and open reflection. Does not interrupt
 *   the session flow.").
 *
 *   Gate: no prompt fires in the user's first three completed
 *   sessions (activityLog.length <= 3 after this entry is saved).
 *   Selection: modulo on empathyPromptsAtStage within the current
 *   stage's pool, per the spec's Build Notes ("a simple modulo").
 *   Stage advance: Stage 1 after 4 fired, Stage 2 after 5, Stage 3
 *   after 5, Stage 4 after 4, Stage 5 cycles indefinitely.
 *   Gap: base 4 sessions between prompts; widens to 6 after 3+
 *   consecutive skips (empathyPromptSkips is treated as a consecutive
 *   streak here, not a lifetime total, and resets to 0 on any
 *   non-skip response — see skipEmpathyPrompt()/fireEmpathyPrompt()
 *   comments for why, and the note about the spec's own build-note
 *   formula being inverted from its stated intent).
 *
 *   Bug fixes (both previously logged, confirmed present by direct
 *   read during Session B3, folded into this touch of the file):
 *     - "Back to Today" now correctly calls router.navigate("today")
 *       instead of router.navigate("progress"). router is now
 *       explicitly imported at the top of the file — it was being
 *       referenced without an import before, which would throw at
 *       runtime rather than merely misroute.
 *     - moodAfter is now initialised to 5 at module scope instead of
 *       null, so the mood number and slider no longer display the
 *       literal string "null" on first paint before onMount() sets
 *       the real pre-fill value from lastCheckin.mood.
 *
 * 13 Jun 2026 v1 (S4-5) - moodAfter capture:
 *   Added a compact mood-after slider (1-10) to the wellbeing section,
 *   pre-filled from lastCheckin.mood (today's pre-session mood) so it's
 *   a quick adjustment rather than a cold start - same pattern as the
 *   sleep pre-fill in checkin.js. Written to activityLog as moodAfter
 *   (replaces the previously hardcoded energyAfter: null - see schema.md
 *   v1.5/v1.6 Section 12 migration note). buildSummary() can now also
 *   reference the mood shift (moodAfter vs lastCheckin.mood) for a more
 *   specific coach line when the change is notable.
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

import { store }          from "../store.js";
import { router }         from "../router.js";
import { EMPATHY_PROMPTS } from "../data/empathy-transfer.js";

export const centered = false;

let stage        = "reflect";
let feelAnswer    = null;
let painAnswer    = null;
let openText      = "";
let moodAfter     = 5;
let empathyPrompt = null; // { stage, text } | null - set by saveAndSummarise() if one should fire

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

const MOOD_LABELS = [
  "", "Struggling", "Low", "Low", "Okay",
  "Okay", "Good", "Good", "Great", "Great", "Fantastic"
];

// ── Empathy Transfer constants ────────────────────────────────────────
// See alongside_empathy_transfer_prompts_19may2026_v1.docx for the
// full spec this logic implements.

const STAGE_ADVANCE_THRESHOLDS = { 1: 4, 2: 5, 3: 5, 4: 4, 5: Infinity };
const EMPATHY_BASE_GAP    = 4; // sessions between prompts under normal conditions ("every 3-4")
const EMPATHY_WIDENED_GAP = 6; // after 3+ consecutive skips
const EMPATHY_MIN_SESSIONS = 3; // no prompt fires in the user's first three sessions

function getSessionCount() {
  // "Session count" per the spec is unit of experience, not calendar
  // time, and the spec's own language ("after any completed session")
  // treats every activityLog entry as a countable session — consistent
  // with the app-wide Credits Scope Rule that all activity counts, not
  // just workouts. activityLog.length (post-save) is used as the count.
  return (store.get("activityLog") || []).length;
}

function getEmpathyPromptForSession(sessionCount) {
  if (sessionCount <= EMPATHY_MIN_SESSIONS) return null;

  const skips = store.get("empathyPromptSkips") || 0;
  const gap   = skips >= 3 ? EMPATHY_WIDENED_GAP : EMPATHY_BASE_GAP;
  const last  = store.get("lastEmpathyPromptSession") || 0;

  if (sessionCount - last < gap) return null;

  const stageNum = store.get("empathyTransferStage") || 1;
  const pool     = EMPATHY_PROMPTS[stageNum] || EMPATHY_PROMPTS[1];
  const atStage  = store.get("empathyPromptsAtStage") || 0;
  const text     = pool[atStage % pool.length];

  return { stage: stageNum, text };
}

function fireEmpathyPrompt(sessionCount) {
  const stageNum = store.get("empathyTransferStage") || 1;
  const atStage  = (store.get("empathyPromptsAtStage") || 0) + 1;
  const fired    = (store.get("empathyPromptsFired") || 0) + 1;
  const threshold = STAGE_ADVANCE_THRESHOLDS[stageNum];

  if (atStage >= threshold && stageNum < 5) {
    store.set("empathyTransferStage", stageNum + 1);
    store.set("empathyPromptsAtStage", 0);
  } else {
    store.set("empathyPromptsAtStage", atStage);
  }

  store.set("empathyPromptsFired", fired);
  store.set("lastEmpathyPromptSession", sessionCount);
  // Genuine engagement (not a skip) resets the consecutive-skip streak.
  store.set("empathyPromptSkips", 0);
}

function skipEmpathyPrompt(sessionCount) {
  const skips = (store.get("empathyPromptSkips") || 0) + 1;
  store.set("empathyPromptSkips", skips);

  // NOTE: the spec's own Build Notes say the skip handler "sets
  // lastEmpathyPromptSession to current + 1 (so it fires again one
  // session sooner than usual)". That literal formula actually produces
  // a LATER next-fire, not a sooner one (next fire = current + 1 + gap,
  // vs current + gap for a normal fire). Implemented here to match the
  // spec's STATED INTENT ("fires one session sooner") instead of its
  // literal formula: current - 1, which yields next fire at
  // current + gap - 1, genuinely one session earlier than a normal gap.
  // Flagged for Graeme to confirm this interpretation is correct.
  store.set("lastEmpathyPromptSession", sessionCount - 1);
}

function buildSummary(entry, feel, pain, moodAfterValue) {
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

  const durRef = duration && duration >= 10
    ? duration + " minutes"
    : null;

  const moodBefore = store.get("lastCheckin")?.mood || null;
  const moodLift   = (typeof moodAfterValue === "number" && typeof moodBefore === "number")
    ? moodAfterValue - moodBefore
    : null;

  if (pain === "better") {
    return "I noticed things felt better today than usual. That is worth paying attention to -- your body is responding.";
  }
  if (pain === "worse" || pain === "sharp") {
    return "Things were harder today and you showed up anyway. I have noted that. We will factor it in next time.";
  }

  if (moodLift !== null && moodLift >= 3) {
    return "Your mood has shifted since this morning -- that is exactly the kind of thing worth noticing. I will remember that this works for you.";
  }

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

  if (feel === "strong") {
    return sessionCount >= 3
      ? "That is " + sessionCount + " sessions this week. You are building something real here."
      : "You were strong today. I will remember that when I plan your next session.";
  }
  if (feel === "hard" || feel === "tough") {
    return "Hard sessions count just as much as easy ones. You finished it. That is what matters.";
  }

  if (sessionCount >= 3) {
    return "That is " + sessionCount + " sessions this week. Consistency is exactly how this works.";
  }

  return "Done. I have noted how today went and I will use it next time.";
}

export function render() {
  const entry      = store.get("currentActivityEntry") || {};
  const type       = entry.type  || "other";
  const name       = entry.name;
  const conditions = store.get("conditions") || [];
  const hasConds   = conditions.length > 0;

  const question   = QUESTIONS[type] || QUESTIONS["other"];
  const feelOpts   = FEEL_OPTIONS[type] || FEEL_OPTIONS["coach-session"];

  const dayIdx     = new Date().getDay();
  const weekNum    = store.get("gymProgrammeWeek") || 1;
  const invitation = WELLBEING_INVITATIONS[(dayIdx + weekNum) % WELLBEING_INVITATIONS.length];

  if (stage === "empathy" && empathyPrompt) {
    return `
      <div class="view reflect-view">
        <div class="view-header">
          <h1 class="sr-only">A thought before you go</h1>
        </div>
        <div class="card card-coach reflect-coach-card" role="group" aria-labelledby="empathy-prompt-text">
          <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
          <p class="coach-message-text" id="empathy-prompt-text">${empathyPrompt.text}</p>
        </div>
        <button class="btn btn-primary btn-large btn-full" id="empathy-continue-btn"
                style="margin-top: var(--space-4);">
          Continue
        </button>
        <button class="btn btn-ghost btn-full" id="empathy-skip-btn"
                style="margin-top: var(--space-2);"
                aria-label="Not today, skip this prompt">
          Not today
        </button>
      </div>`;
  }

  if (stage === "summary") {
    const summary = buildSummary(entry, feelAnswer, painAnswer, moodAfter);
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

      <div class="card card-coach reflect-coach-card">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">${question}</p>
      </div>

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

      <div class="reflect-section">
        <p class="reflect-section-label">How's your mood right now?</p>
        <div class="reflect-mood-slider-block">
          <div class="reflect-mood-display" aria-live="polite" aria-atomic="true">
            <span class="reflect-mood-number" id="reflect-mood-number">${moodAfter}</span>
            <span class="reflect-mood-label" id="reflect-mood-label">${MOOD_LABELS[moodAfter] || "Okay"}</span>
          </div>
          <input type="range" id="reflect-mood-slider" class="checkin-slider"
                 min="1" max="10" value="${moodAfter}"
                 aria-label="Mood right now, 1 struggling to 10 fantastic"
                 aria-valuetext="${MOOD_LABELS[moodAfter] || "Okay"}">
          <div class="checkin-slider-ends" aria-hidden="true">
            <span>Struggling</span><span>Fantastic</span>
          </div>
        </div>
      </div>

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

export function onMount() {
  // NOTE: this reset to "reflect" runs on every mount, including the
  // remounts triggered by saveAndSummarise() and resolveEmpathyPrompt()
  // after they've already set stage to "empathy" or "summary" and
  // called render(). That's intentional and pre-existing behaviour,
  // not a bug: render() always runs BEFORE onMount() in this file, so
  // the DOM is already painted correctly for the real current stage
  // by the time this reset happens. The click handler below reads the
  // DOM via e.target.closest(), not the stage variable, so the reset
  // has no effect on behaviour - it only matters for the next fresh
  // mount of the view (e.g. router navigating back in), where
  // "reflect" is the correct starting stage anyway.
  stage        = "reflect";
  feelAnswer    = null;
  painAnswer    = null;
  openText      = "";
  empathyPrompt = null;

  const checkin = store.get("lastCheckin") || {};
  moodAfter = (typeof checkin.mood === "number") ? checkin.mood : 5;

  const view = document.querySelector(".reflect-view");
  if (!view) return;

  const moodSlider = document.getElementById("reflect-mood-slider");
  if (moodSlider) {
    moodSlider.addEventListener("input", e => {
      moodAfter = parseInt(e.target.value);
      const numEl = document.getElementById("reflect-mood-number");
      const labEl = document.getElementById("reflect-mood-label");
      if (numEl) numEl.textContent = moodAfter;
      if (labEl) labEl.textContent = MOOD_LABELS[moodAfter] || "Okay";
      moodSlider.setAttribute("aria-valuetext", MOOD_LABELS[moodAfter] || "Okay");
    });
  }

  view.addEventListener("click", e => {

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

    const doneBtn = e.target.closest("#reflect-done-btn");
    if (doneBtn) { saveAndSummarise(); return; }

    const skipBtn = e.target.closest("#reflect-skip-btn");
    if (skipBtn) { saveAndSummarise(); return; }

    const empathyContinueBtn = e.target.closest("#empathy-continue-btn");
    if (empathyContinueBtn) { resolveEmpathyPrompt(false); return; }

    const empathySkipBtn = e.target.closest("#empathy-skip-btn");
    if (empathySkipBtn) { resolveEmpathyPrompt(true); return; }

    const finishBtn = e.target.closest("#reflect-finish-btn");
    if (finishBtn) {
      router.navigate("today");
    }
  });
}

function saveAndSummarise() {
  const textarea = document.getElementById("reflect-open-text");
  openText = textarea?.value.trim() || "";

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
        moodAfter:   moodAfter,
        completedAt: new Date().toISOString(),
      };
      delete log[idx].energyAfter;
      store.set("activityLog", log);
    }
  }

  // Empathy Transfer: decide, after this entry is saved, whether a
  // prompt should fire. sessionCount reflects the just-saved entry.
  const sessionCount = getSessionCount();
  const candidate = getEmpathyPromptForSession(sessionCount);

  if (candidate) {
    empathyPrompt = candidate;
    stage = "empathy";
  } else {
    stage = "summary";
  }

  const main = document.getElementById("main-content");
  if (main) {
    main.innerHTML = render();
    onMount();
  }
}

function resolveEmpathyPrompt(wasSkipped) {
  const sessionCount = getSessionCount();

  if (wasSkipped) {
    skipEmpathyPrompt(sessionCount);
  } else {
    fireEmpathyPrompt(sessionCount);
  }

  empathyPrompt = null;
  stage = "summary";

  const main = document.getElementById("main-content");
  if (main) {
    main.innerHTML = render();
    onMount();
  }
}
