/**
 * js/exercise-card.js
 * 29 Aug 2026 v1
 *
 * CARD-1. One exercise card renderer, shared by every session view.
 *
 * WHY THIS EXISTS. Six views rendered `watchOut` and four rendered the
 * full card, each with its own copy. That is how `exercise.cues` came to
 * be rendered in core-session, yoga-session and morning-session and NOT
 * in workout.js, prescribed-session.js or gym-programme.js -- nobody
 * decided that; six copies drifted. A shared renderer is more work once
 * and less work forever.
 *
 * WHAT IT CHANGES. The card was roughly fifteen lines of body prose
 * before the optional blocks, read on a phone while holding a position.
 * Two things follow from that, and the second is the important one:
 *
 *   1. Density. Sections now open and close by PHASE (before the timer
 *      vs running) and by FAMILIARITY (has this person met this exercise
 *      before). Nobody manages any of it.
 *
 *   2. Safety. In workout.js v12 `bodyCaution` rendered below "How
 *      heavy" and `watchOut` rendered below the feedback control -- so
 *      the one personalised safety line in the card sat roughly two
 *      screenfuls down, under three blocks of static prose, and the
 *      hazard list sat beneath a control most people read as the end of
 *      the card. Density is itself a safety failure. Order is now fixed
 *      here, in one place: caution first, hazards before the explanatory
 *      text, feedback last.
 *
 * P4 -- LOAD-BEARING. Familiarity is read from `exerciseHistory`, which
 * store.js states is never used to comment on a person's consistency or
 * decline. Reading it to size the card is permitted because nothing is
 * displayed. THE CARD MUST NEVER SAY WHY IT GOT SHORTER. No count, no
 * "you know this one", no "you've done this before". It simply stops
 * explaining. tools/verify-card1.mjs asserts no history numeric reaches
 * rendered output, and that assertion has a reversal test.
 *
 * NOTHING SAFETY-BEARING IS EVER HIDDEN. `bodyCaution` renders at every
 * familiarity level in every phase. `watchOut` is always open before the
 * timer starts, and stays open while running whenever a caution is
 * firing for that exercise. The full-instructions preference overrides
 * every collapse.
 *
 * See Documents/Admin/alongside_blueprint_CARD-1_29aug2026_v1.md
 */

import { store }        from "./store.js";
import { bodyCaution }  from "./data/session-rationale.js";
import { getDisplayPref } from "./display-prefs.js";

/** Times this person has completed this exercise. Never rendered, never
 *  returned to a caller that renders. Internal sizing only (P4). */
function _seen(exercise) {
  try {
    const h = store.get("exerciseHistory") || {};
    const e = h[exercise?.id];
    return (e && typeof e.n === "number" && e.n > 0) ? e.n : 0;
  } catch { return 0; }
}

function _fullAlways() {
  try { return getDisplayPref("fullInstructions") === "on"; } catch { return false; }
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * A real disclosure. Button with aria-expanded and aria-controls; the
 * content stays in the DOM and in the accessibility tree whether open or
 * closed, so a screen reader user can find it and knows the cost of
 * opening it before they do -- hence the count in the label.
 */
function disclosure({ id, label, count, open, body }) {
  if (!body) return "";
  const n = (typeof count === "number" && count > 1) ? ` (${count})` : "";
  return `
    <div class="xcard-section">
      <button type="button"
              class="xcard-toggle"
              id="${id}-btn"
              aria-expanded="${open ? "true" : "false"}"
              aria-controls="${id}-body">
        <span class="xcard-toggle-label">${esc(label)}${n}</span>
        <span class="xcard-toggle-chev" aria-hidden="true"></span>
      </button>
      <div class="xcard-section-body" id="${id}-body" ${open ? "" : "hidden"}>
        ${body}
      </div>
    </div>`;
}

/** Always-open block. No control, no way to close it. */
function fixed(cls, label, body, labelId) {
  if (!body) return "";
  return `
    <div class="${cls}">
      ${label ? `<span class="exercise-section-label" id="${labelId}">${esc(label)}</span>` : ""}
      <div ${label ? `aria-labelledby="${labelId}"` : ""}>${body}</div>
    </div>`;
}

/**
 * Render one exercise card.
 *
 * @param {object} exercise
 * @param {object} opts
 * @param {string} opts.idPrefix  unique per card instance on the page
 * @param {boolean} opts.running  true once the timer has started
 */
export function renderExerciseCard(exercise, opts = {}) {
  if (!exercise) return "";
  const p       = opts.idPrefix || "xcard";
  const running = !!opts.running;
  const full    = _fullAlways();
  const seen    = _seen(exercise);

  // The caution is personal and time-bound: it fires when this exercise
  // loads an area flagged sore TODAY (CORE-1). It is the first thing
  // after the target and it has no disclosure control at any level.
  const caution = bodyCaution(exercise);

  // Setup closes once the timer runs, and stops opening by default once
  // the movement is familiar. It is never removed.
  const setupOpen = full || (!running && seen < 3);

  // Hazards. Open before the start, always. Open while running whenever
  // a caution is firing -- if today's body already has a reason for
  // care, this is not the moment to tidy the screen.
  const watchOpen = full || !running || !!caution;

  // Explanatory context. The first meeting gets it; after that it waits
  // to be wanted. Never carries safety content -- `load` is
  // effort-relative and never a weight (P4).
  const contextOpen = full || seen === 0;

  const cues      = Array.isArray(exercise.cues) ? exercise.cues : [];
  const leadCue   = cues[0] || exercise.coaching || "";
  const restCues  = cues.slice(1);

  return `
  <div class="exercise-card" data-xcard="${p}" role="region"
       aria-label="Exercise guidance for ${esc(exercise.name)}">

    ${caution ? `<p class="exercise-caution" role="note">${caution}</p>` : ""}

    ${disclosure({
      id: `${p}-setup`,
      label: "How to get there",
      count: (exercise.instructions || []).length,
      open: setupOpen,
      body: (exercise.instructions && exercise.instructions.length)
        ? `<ul class="exercise-section-list">${exercise.instructions.map(i => `<li>${esc(i)}</li>`).join("")}</ul>`
        : ""
    })}

    ${leadCue ? fixed("xcard-lead-cue", "What to focus on",
        `<p class="exercise-cue">${esc(leadCue)}</p>`, `${p}-cue-lbl`) : ""}

    ${disclosure({
      id: `${p}-cues`,
      label: "More on form",
      count: restCues.length,
      open: full,
      body: restCues.length
        ? `<ul class="exercise-section-list">${restCues.map(c => `<li>${esc(c)}</li>`).join("")}</ul>`
        : ""
    })}

    ${disclosure({
      id: `${p}-watch`,
      label: "What to watch for",
      count: (exercise.watchOut || []).length,
      open: watchOpen,
      body: (exercise.watchOut && exercise.watchOut.length)
        ? `<ul class="exercise-watchout-list">${exercise.watchOut.map(w => `<li>${esc(w)}</li>`).join("")}</ul>`
        : ""
    })}

    ${disclosure({
      id: `${p}-load`,
      label: "How heavy",
      open: contextOpen,
      body: exercise.load ? `<p class="exercise-load-text">${esc(exercise.load)}</p>` : ""
    })}

    ${disclosure({
      id: `${p}-why`,
      label: "Why this helps",
      open: contextOpen,
      body: exercise.why ? `<p class="exercise-why-text">${esc(exercise.why)}</p>` : ""
    })}

  </div>`;
}

/**
 * Delegated, so a card re-rendered mid-session does not need rebinding.
 * Idempotent: calling it twice on the same root does not double-fire.
 */
export function attachCardEvents(root) {
  const el = root || document;
  if (el.__xcardBound) return;
  el.__xcardBound = true;
  el.addEventListener("click", (ev) => {
    const btn = ev.target.closest(".xcard-toggle");
    if (!btn || !el.contains(btn)) return;
    const body = document.getElementById(btn.getAttribute("aria-controls"));
    if (!body) return;
    const open = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", open ? "false" : "true");
    if (open) body.setAttribute("hidden", "");
    else body.removeAttribute("hidden");
  });
}
