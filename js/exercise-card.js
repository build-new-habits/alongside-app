/**
 * js/exercise-card.js
 * 31 Aug 2026 v3
 *
 * CARD-3. Three PAGES, not three tabs.
 *
 * v2's tablist was optional lateral navigation. It said "here are three
 * places you may go", and the honest response to that is to go to none of
 * them -- which is what happened on device: exercises moved through with
 * During and After never opened. Pages fix it without gating. You pass
 * through DO because the timer lives there, not because a checklist made
 * you. Forcing progression was rejected: it would be coercive and would
 * punish exactly the person this is for.
 *
 *   DECIDE  what lets you change what is about to happen. Last time,
 *           and the view's adjust controls. Skip lives here and nowhere
 *           else -- you decide before you start, not halfway through.
 *   DO      hazards unhidden, then how to get there, then the view's
 *           timer and video.
 *   NOTE    supplied entirely by the view: the log block, feedback,
 *           not-a-fan, next.
 *
 * THE REGRESSION THIS CLOSES. v2 put watchOut inside During, behind a
 * tab, so an exercise could be started with the hazards never on screen.
 * Under v1 they were always open before the timer started. Here they are
 * the FIRST thing on DO, before any explanatory text, and no interaction
 * reveals them.
 *
 * WHAT NEVER MOVES. bodyCaution is not page-scoped. It renders on all
 * three pages, every time it fires. It is the personalised safety line
 * and a page navigated away from is more hidden than a section collapsed.
 *
 * `why` IS GONE FROM THE CARD. Not relocated -- removed. It is reference
 * material and belongs in the library; a paragraph on gluteus medius
 * activation is not what a warm-up needs. CARD-1 collapsed sections and
 * CARD-2 sorted them, and neither removed a single word. This does.
 *
 * `load` IS CONDITIONAL, and this is the one addition. It renders on
 * DECIDE only when there is no last time. Their own band beats the
 * generic prescription whenever it exists; the prescription fills the
 * gap on a first encounter, which is otherwise the thinnest the page
 * ever gets.
 *
 * STILL TRUE FROM v2: this file does not read exerciseHistory. There is
 * no familiarity model to leak from. "Last time" arrives as a finished
 * string from session-log.js lastLine(), which is display-only by
 * construction -- their own words, and never a trend, delta, arrow or
 * count. P4 is Locked.
 *
 * holdSeconds is coaching detail and appears on DO as a line of text.
 * exercise-timing.js still refuses to read it (TIME-1): bird-dog holds 3
 * against a duration of 90, and they were never the same number.
 *
 * ACTION BARS ARE NOT OURS. The views own them and bind by their own
 * ids -- wo/ps/cs/gp. The card renders the page frame and the view fills
 * the slots. That is what keeps the blast radius survivable.
 */

import { bodyCaution } from "./data/session-rationale.js";
import { getDisplayPref } from "./display-prefs.js";

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function _fullAlways() {
  try { return getDisplayPref("fullInstructions") === "on"; } catch { return false; }
}

const PAGES = [
  { key: "decide", label: "Decide" },
  { key: "do",     label: "Do"     },
  { key: "note",   label: "Note"   },
];

const BACK_TO = { do: "decide", note: "do" };

function list(cls, items) {
  return `<ul class="${cls}">${items.map(i => `<li>${esc(i)}</li>`).join("")}</ul>`;
}

function section(label, body, mod) {
  if (!body) return "";
  return `<div class="xcard-block${mod ? " " + mod : ""}">
      <span class="exercise-section-label">${esc(label)}</span>
      ${body}
    </div>`;
}

/**
 * @param {object} exercise
 * @param {object} opts
 * @param {string} opts.idPrefix    unique per card instance on the page
 * @param {string} opts.page        "decide" | "do" | "note". Owned by the
 *                                  view, beside currentExerciseIndex, and
 *                                  reset on exercise change. Never stored:
 *                                  surviving a reload would put somebody
 *                                  back on NOTE for a movement they have
 *                                  not done.
 * @param {string} opts.lastTime    lastLine(exercise) output, or ""
 * @param {string} opts.adjustSlot  view-supplied controls for DECIDE
 * @param {string} opts.doSlot      view-supplied timer and video for DO
 * @param {string} opts.noteSlot    view-supplied log block etc for NOTE
 */
export function renderExerciseCard(exercise, opts = {}) {
  if (!exercise) return "";
  const p    = opts.idPrefix || "xcard";
  const page = PAGES.some(x => x.key === opts.page) ? opts.page : "decide";
  const full = _fullAlways();

  const caution  = bodyCaution(exercise);
  const cues     = Array.isArray(exercise.cues) ? exercise.cues : [];
  const leadCue  = cues[0] || exercise.coaching || "";
  const restCues = cues.slice(1);
  // lastLine() returns MARKUP, not a plain string -- and its no-data case
  // returns a populated "No note yet" paragraph rather than "". Escaping
  // it printed the tags on screen, and the empty case counted as content,
  // which suppressed `load` on exactly the first encounter it exists for.
  // Both found on the first device test; the function had never rendered
  // anywhere before CARD-3 called it. It escapes its own user content, so
  // it is injected as HTML.
  const rawLast  = typeof opts.lastTime === "string" ? opts.lastTime.trim() : "";
  const hasLast  = rawLast !== "" && !rawLast.includes("slog__last--empty");

  // Their own words, verbatim, or silence. There is no third option here
  // and no interpretation layer between lastLine() and the screen.
  // No added label: lastLine() already self-labels with "Last:", and
  // "LAST TIME / Last: 60 kg" said it twice.
  const lastBlock = hasLast
    ? `<div class="xcard-last">${rawLast}</div>`
    : "";

  // Only when there is no last time. See the header note.
  const loadBlock = (!hasLast && exercise.load)
    ? section("How heavy", `<p>${esc(exercise.load)}</p>`)
    : "";

  const hold = (typeof exercise.holdSeconds === "number" && exercise.holdSeconds > 0)
    ? `<p class="xcard-hold">Hold each one for about ${exercise.holdSeconds} second${exercise.holdSeconds === 1 ? "" : "s"}.</p>`
    : "";

  const decide = [
    cueBlock,
    lastBlock,
    loadBlock,
    opts.adjustSlot || "",
  ].join("");

  // Safety render order, non-negotiable: caution (pinned, above) first,
  // hazards before any explanatory text, feedback last. watchOut is the
  // first thing in this page body and nothing hides it.
  const doBody = [
    // Given its own rose-tinted box on Graeme's call, 31 Aug. It was
    // reading as one more grey section among several, which is the
    // problem CARD-3 was meant to fix and only half fixed: moving the
    // hazards into view is not the same as making them look different
    // from the instructions underneath them.
    section("What to watch for",
      (exercise.watchOut && exercise.watchOut.length) ? list("exercise-watchout-list", exercise.watchOut) : "",
      "xcard-block--hazard"),
    section("How to get there",
      (exercise.instructions && exercise.instructions.length) ? list("exercise-section-list", exercise.instructions) : ""),
    section("More on form", restCues.length ? list("exercise-section-list", restCues) : ""),
    hold ? section("Pace", hold) : "",
    opts.doSlot || "",
  ].join("");

  const bodies = { decide, do: doBody, note: opts.noteSlot || "" };

  // CUE-UNPIN, 02 Sep 2026. The CAUTION stays pinned to all three
  // pages: a safety line you have navigated away from is more hidden
  // than one that is collapsed, and that reasoning is unchanged.
  //
  // The lead cue does NOT. It is coaching, not safety, and pinning it
  // meant the same paragraph -- "this is exploration, not performance"
  // -- appeared on DECIDE, DO and NOTE. Graeme, 2 Sep, seeing it three
  // times across three screenshots: "all these 2 relevant?" It belongs
  // on DECIDE, where the decision it informs is being made.
  const pinned = `
    ${caution ? `<p class="exercise-caution" role="note">${caution}</p>` : ""}`;

  const cueBlock = leadCue
    ? `<p class="exercise-cue xcard-lead-cue">${esc(leadCue)}</p>`
    : "";

  // "Show everything" flattens the pages rather than landing on one.
  // Somebody who has asked for all of it should not be walked through
  // three screens to get it.
  if (full) {
    return `
  <div class="exercise-card exercise-card--flat" data-xcard="${p}"
       role="region" aria-label="Exercise guidance for ${esc(exercise.name)}">
    ${pinned}
    ${decide}${doBody}${bodies.note}
  </div>`;
  }

  const backTo = BACK_TO[page];

  return `
  <div class="exercise-card exercise-card--paged" data-xcard="${p}"
       data-xcard-page="${page}"
       role="region"
       aria-label="Exercise guidance for ${esc(exercise.name)} \u2014 step ${PAGES.findIndex(x => x.key === page) + 1} of 3">
    ${pinned}

    <p class="xcard-step" aria-hidden="true">${PAGES.find(x => x.key === page).label}</p>

    <div class="xcard-page" id="${p}-page-${page}">
      ${bodies[page] || `<p class="xcard-empty">Nothing here for this one.</p>`}
    </div>

    ${backTo ? `
      <button type="button" class="btn btn-ghost btn-small xcard-back"
              data-xcard-back="${backTo}"
              aria-label="Back to ${esc(PAGES.find(x => x.key === backTo).label)}">
        \u2190 Back
      </button>` : ""}
  </div>`;
}

/**
 * Delegated and idempotent, so a card re-rendered mid-session needs no
 * rebinding.
 *
 * Page state belongs to the view, not to this file, so Back does not
 * move anything itself -- it announces. The view listens for
 * "xcard:page" and re-renders. That keeps one owner for the page number
 * and stops the card and the view disagreeing about which page is up.
 */
export function attachCardEvents(root) {
  const el = root || document;
  if (el.__xcardBound) return;
  el.__xcardBound = true;

  el.addEventListener("click", ev => {
    const btn = ev.target.closest("[data-xcard-back]");
    if (!btn || !el.contains(btn)) return;
    const card = btn.closest(".exercise-card");
    if (!card) return;
    ev.preventDefault();
    card.dispatchEvent(new CustomEvent("xcard:page", {
      bubbles: true,
      detail: { page: btn.getAttribute("data-xcard-back"), prefix: card.dataset.xcard },
    }));
  });
}
