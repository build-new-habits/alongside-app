/**
 * js/exercise-feedback.js
 * 12 Aug 2026 v1
 *
 * FEED-1. "Too hard" / "too easy" on the exercise card.
 *
 * WHY IT EXISTS. applyFeedbackWeighting() in data/exercises/index.js has
 * read `exerciseFeedback` since v1.3 and nothing has ever written it. The
 * weighting has never once run on real data -- it takes the array, finds
 * it empty, and returns the pool untouched. store.logExerciseFeedback()
 * was even built for it. The response existed; the capture never did.
 *
 * Fifth confirmed instance of that pattern, and the last one on the
 * board.
 *
 * WHAT IT IS NOT. Not a rating. No stars, no thumbs, no five-point scale,
 * no "how did that feel out of 10". The skip/dislike spec §6 settled that
 * and "Not a fan of this one" already follows it -- this matches that
 * pattern deliberately rather than inventing a second vocabulary for the
 * same card.
 *
 * TWO BUTTONS, NEITHER OF THEM DEFAULT. There is no "about right" option,
 * because "about right" is what silence already means. Offering it would
 * turn an optional aside into a question with three answers, and a
 * question on every exercise is measurement pressure -- which is the
 * thing this product is built against.
 *
 * P4. The reader needs two of the last five before it moves anything, so
 * a single hard day changes nothing. Nothing is displayed back, no
 * counter, no history, no "you've found this hard 3 times". The person
 * says it, the selection quietly listens, and the app never mentions it
 * again.
 */

import { store } from "./store.js";

function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Most recent feedback for this exercise, or null. */
export function currentFeedback(exerciseId) {
  const all = store.get("exerciseFeedback") || [];
  for (let i = all.length - 1; i >= 0; i--) {
    if (all[i].exerciseId === exerciseId) return all[i].feedback;
  }
  return null;
}

/**
 * Renders the control, or "" when there is no exercise to attach it to.
 *
 * Rendered on every card-shaped session view. NOT on breathing or quiet
 * sessions: those are restoration, and asking whether restoration was
 * too easy is a category error.
 */
export function renderFeedbackControl(exercise) {
  if (!exercise?.id) return "";
  const set = currentFeedback(exercise.id);
  const id  = esc(exercise.id);

  return `
    <div class="ex-feedback" role="group" aria-label="Was this the right level?">
      <button type="button"
              class="ex-feedback__btn ${set === "too-hard" ? "is-set" : ""}"
              data-feedback="too-hard" data-feedback-id="${id}"
              aria-pressed="${set === "too-hard"}">
        ${set === "too-hard" ? "Noted \u2014 I'll ease this off" : "That was too hard"}
      </button>
      <button type="button"
              class="ex-feedback__btn ${set === "too-easy" ? "is-set" : ""}"
              data-feedback="too-easy" data-feedback-id="${id}"
              aria-pressed="${set === "too-easy"}">
        ${set === "too-easy" ? "Noted \u2014 I'll push this on" : "That was too easy"}
      </button>
    </div>
  `;
}

const LABEL = {
  "too-hard": { off: "That was too hard", on: "Noted \u2014 I'll ease this off" },
  "too-easy": { off: "That was too easy", on: "Noted \u2014 I'll push this on" },
};

/** Repaints both buttons from the store. */
function _paint(exId) {
  const set = currentFeedback(exId);
  document.querySelectorAll(`[data-feedback-id="${CSS.escape(exId)}"]`).forEach(b => {
    const value = b.getAttribute("data-feedback");
    const on = set === value;
    b.classList.toggle("is-set", on);
    b.setAttribute("aria-pressed", String(on));
    b.textContent = on ? LABEL[value].on : LABEL[value].off;
  });
}

/**
 * Wires both buttons.
 *
 * Repaints itself rather than requiring the view to re-render. Only
 * gym-programme.js has a re-render function of the shape "Not a fan"
 * depends on -- workout.js and prescribed-session.js have none, and
 * inventing one for a two-button control would be the tail wagging the
 * dog. Self-painting also means the label cannot fall out of step with
 * the store if a view re-renders for some other reason.
 */
export function attachFeedbackEvents(exercise, onChange) {
  if (!exercise?.id) return;
  document.querySelectorAll("[data-feedback]").forEach(btn => {
    if (btn.dataset.wired === "1") return;
    btn.dataset.wired = "1";
    btn.addEventListener("click", () => {
      const value = btn.getAttribute("data-feedback");
      const exId  = btn.getAttribute("data-feedback-id");
      if (!exId) return;
      // Tapping the one already set clears it -- the same undo the
      // "Not a fan" button offers. Somebody who taps by accident, or
      // changes their mind by the next set, must be able to take it
      // back. A signal you cannot withdraw is one people stop giving.
      if (currentFeedback(exId) === value) {
        store.clearExerciseFeedback(exId);
      } else {
        store.logExerciseFeedback(exId, value);
      }
      _paint(exId);
      if (typeof onChange === "function") onChange();
    });
  });
}
