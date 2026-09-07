/**
 * js/data/plan-options.js
 * 06 Sep 2026 v2
 *
 * v2 - COMMIT-COPY. Three phrases on the picker, all off-voice.
 *
 *   "3 sessions a week" -> "aiming for 3 sessions a week". A bare number
 *   reads as a TARGET, which is a number you can fall behind on -- the
 *   shape of a streak, on a product that has no streaks by design. The
 *   number is unchanged; what changed is whether it is a quota or an
 *   intention.
 *
 *   "Full commitment" / "For when you are ready to push" -> "More often"
 *   / "More sessions, so things build a bit quicker. Only if that suits
 *   you." The coach voice is Nurturing only, permanently, and this
 *   product does not push. "Commitment" also frames the weekly number as
 *   a promise that can be broken.
 *
 *   "Highly Recommended" -> "Suggested for you". THE RECOMMENDATION
 *   SURVIVES, and that is deliberate: a clear recommendation reduces
 *   decision load, which this audience needs most. The caps and the gold
 *   band were the problem, not recommending.
 *
 * v1 - CHOOSER-1. Shared plan-option building and card markup.
 *
 * Extracted from onboarding/plan-select.js so that the post-onboarding
 * chooser (views/programme-select.js) can present exactly the same three
 * options without a second copy of the logic.
 *
 * WHY EXTRACTED RATHER THAN COPIED. Duplicated write paths are this
 * codebase's most repeated fault -- TARGET-3 was two editors for one
 * pair of fields, and the session builder has two entry paths that set
 * `phase` independently, so reverting one leaves both gates green. Three
 * option cards are exactly the kind of thing that drifts silently once
 * copied: a wording change lands in one place, and the two screens
 * quietly stop offering the same product.
 *
 * The three options are CHARACTER-DIFFERENTIATED, NOT DIFFICULTY-RANKED.
 * All three run the same best-match programme; they differ only in
 * weekly frequency and framing. "Gentle start" is not a lesser option
 * and must never be styled as one -- it is the same destination at a
 * different pace, which is the whole product in miniature.
 *
 * WCAG 2.2 AA: cards carry role="radio" and aria-checked; the caller
 * supplies role="radiogroup" and the labelling.
 */

import { store }                 from "../store.js";
import { getProgrammesForGoals } from "./programmes.js";
import { toEngineGoals }         from "./goals.js";

/**
 * Build the three plan options from the person's goals and agreed
 * weekly frequency.
 *
 * @returns {Array<object>} three options, or [] if nothing matched
 */
export function buildPlanOptions() {
  const goals        = store.get("goals") || [];
  const weeklyTarget = store.get("strategicGoal.weeklySessionTarget") || 3;
  const engineGoals  = toEngineGoals(goals);
  const programmes   = getProgrammesForGoals(engineGoals);
  const best         = programmes[0];

  if (!best) return [];

  // COMMIT-COPY, 06 Sep 2026. Was "3 sessions a week", which reads as a
  // TARGET -- a number you can fall behind on, which is the shape of a
  // streak on a product that has no streaks by design. "Aiming for"
  // makes it an intention rather than a quota, and the number is the
  // same number.
  const plural = (n) => `aiming for ${n} session${n !== 1 ? "s" : ""} a week`;

  return [
    {
      programme:    best,
      // COMMIT-COPY, 06 Sep 2026. Was "Highly Recommended", set in caps
      // in a gold band. The banner was the problem; recommending was
      // not -- a clear recommendation reduces decision load, which this
      // audience needs most. Sentence case, said plainly.
      badge:        "Suggested for you",
      variant:      "recommended",
      tagOverride:  null,
      noteOverride: null,
      weeklyNote:   plural(weeklyTarget),
    },
    {
      programme:    best,
      badge:        null,
      variant:      "gentle",
      tagOverride:  "Gentle start",
      noteOverride: "Fewer sessions, more room to recover. Same place, your pace.",
      weeklyNote:   plural(Math.max(1, weeklyTarget - 1)),
    },
    {
      programme:    best,
      badge:        null,
      variant:      "committed",
      // COMMIT-COPY. Was "Full commitment" / "For when you are ready to
      // push". Off-voice on both counts: the coach voice is Nurturing
      // only, permanently, and this product does not push. "Commitment"
      // also frames a weekly number as a promise you can break, which is
      // streak-shaped on a product that has no streaks by design.
      tagOverride:  "More often",
      noteOverride: "More sessions, so things build a bit quicker. Only if that suits you.",
      weeklyNote:   plural(Math.min(6, weeklyTarget + 1)),
    },
  ];
}

/**
 * The weekly session target implied by a chosen variant.
 *
 * Kept here rather than in either view, because the number shown on the
 * card and the number written to the store must not be able to drift
 * apart -- a card reading "2 sessions a week" that writes 3 is a promise
 * broken silently.
 *
 * @param {string} variant  "recommended" | "gentle" | "committed"
 * @returns {number} 1-6
 */
export function weeklyTargetForVariant(variant) {
  const current = store.get("strategicGoal.weeklySessionTarget") || 3;
  if (variant === "gentle")    return Math.max(1, current - 1);
  if (variant === "committed") return Math.min(6, current + 1);
  return current;
}

/**
 * Escape a string for safe interpolation into markup.
 */
export function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Render one plan card.
 *
 * @param {object}  opt          an entry from buildPlanOptions()
 * @param {number}  index        position in the list
 * @param {boolean} isSelected   whether this card is the current choice
 * @returns {string} markup
 */
export function renderPlanCard(opt, index, isSelected) {
  const prog        = opt.programme;
  const name        = opt.tagOverride  || prog.name || "Your programme";
  const description = opt.noteOverride || prog.tagline || prog.description || "";
  const firstPhase  = prog.phases?.[0];
  const weeks       = prog.durationWeeks || 12;

  return `
      <div class="plan-card ${isSelected ? "plan-card--selected" : ""} ${opt.variant === "recommended" ? "plan-card--recommended" : ""}"
           data-plan-index="${index}"
           role="radio"
           aria-checked="${isSelected}"
           tabindex="${isSelected ? "0" : "-1"}">

        ${opt.badge ? `
          <div class="plan-badge" aria-label="${escapeHtml(opt.badge)}">
            ${escapeHtml(opt.badge)}
          </div>
        ` : ""}

        <div class="plan-card__body">
          <div class="plan-card__header">
            <span class="plan-card__icon" aria-hidden="true">
              ${prog.icon || "&#127793;"}
            </span>
            <div class="plan-card__titles">
              <p class="plan-card__name">${escapeHtml(name)}</p>
              <p class="plan-card__weekly">${escapeHtml(opt.weeklyNote)}</p>
            </div>
            <span class="plan-card__duration">${weeks}w</span>
          </div>

          <p class="plan-card__desc">${escapeHtml(description)}</p>

          ${firstPhase && !opt.tagOverride ? `
            <p class="plan-card__phase-hint">
              First four weeks: ${escapeHtml(firstPhase.description || firstPhase.name || "")}
            </p>
          ` : ""}
        </div>

        <div class="plan-card__select-indicator" aria-hidden="true">
          ${isSelected ? "&#10003;" : ""}
        </div>

      </div>
    `;
}
