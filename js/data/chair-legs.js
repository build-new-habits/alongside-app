/**
 * js/data/chair-legs.js
 * 02 Oct 2026 v1
 *
 * v1 - W5-7 CHAIR-LEGS (Wave 5 persona trace: 2.11). Decided by Graeme,
 *   02 Oct 2026: "squats and lunges when getting up and down from a chair
 *   is tricky is not an option". Somebody who gets up from a chair "not
 *   easily" (or not at all) is given no squat or lunge of any kind, whatever
 *   they said about their legs and whatever the difficulty. Kept: the
 *   chair-supported Sit to Stand, hands allowed, which is the movement they
 *   are working towards and is done with the chair under them.
 *
 *   One reading, used by the builder (session-builder.js personFilter) and
 *   by Classes (data/classes/index.js classSafety), so the two cannot differ.
 *   No imports: the store and the class data both read it.
 */

/** The one squat-pattern move that stays: done from and back to a chair. */
export const KEPT_FOR_CHAIR = new Set(["sit-to-stand"]);

const NAMED = /squat|lunge|split[- ]squat|step[- ]?up|step[- ]?down|wall sit/i;

/**
 * A squat or a lunge in any form: the pattern tags (a seated machine such
 * as Seated Leg Extension is not getting up or down) or the name (Wall Sit,
 * Step-Up and Crescent Lunge are tagged otherwise).
 */
export function isSquatOrLunge(ex) {
  if (!ex || KEPT_FOR_CHAIR.has(ex.id)) return false;
  if (ex.position === "seated") return false;
  return ["squat", "lunge"].includes(ex.movementPattern) || NAMED.test(ex.name || "");
}

/** Getting up from a chair is hard (answered "not easily" or "no"). */
export function chairIsHard(capability) {
  const c = capability || {};
  return c.chairRise === "not-easily" || c.chairRise === "no";
}
