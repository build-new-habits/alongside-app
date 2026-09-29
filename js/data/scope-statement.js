/**
 * data/scope-statement.js
 * 29 Sep 2026 v1
 *
 * P0, SCOPE-MINOR. What Alongside is for, said once and shown everywhere
 * it matters. Graeme, 29 Sep 2026: "The app is just there as an adaptive
 * source for people who carry minor injuries ... let's make sure we've
 * got the wording that points someone to a professional, not to the
 * app."
 *
 * Decision record: Documents/Admin/alongside_scope_minor-injury_29sep2026_v1.md
 *
 * One source. Onboarding, Settings and the one-time notice all import
 * these strings; a second copy would drift, and this is the sentence the
 * whole product's positioning rests on.
 */

export const SCOPE_TITLE = "Alongside is for everyday fitness.";

export const SCOPE_BODY =
  "It works around minor aches and injuries by leaving out movements " +
  "that are likely to make them worse. It isn't designed around medical " +
  "conditions.";

export const SCOPE_ADVICE =
  "If you have a medical condition, or anything is persisting, getting " +
  "worse or hurting, stop and speak to a GP, physio or other medical " +
  "professional.";

/**
 * Conditions the app no longer offers (P0a). A stored one is dropped on
 * load (store.js) and the person sees the statement once.
 */
export const RETIRED_CONDITIONS = Object.freeze([
  "cardiovascular-condition", "osteoporosis", "fibromyalgia", "hypermobility",
  "breathing", "pelvic-floor", "me-cfs", "long-covid", "other",
]);

/** The statement as one block of HTML, for any screen that shows it. */
export function scopeStatementHTML({ heading = "h2", id = "scope-statement" } = {}) {
  return `
    <section class="scope-statement" aria-labelledby="${id}-h" data-scope-statement>
      <${heading} class="scope-statement__title" id="${id}-h">${SCOPE_TITLE}</${heading}>
      <p class="scope-statement__body">${SCOPE_BODY}</p>
      <p class="scope-statement__advice">${SCOPE_ADVICE}</p>
    </section>`;
}
