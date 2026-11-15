/**
 * js/data/sore-rule.js
 * 15 Nov 2026 v1
 *
 * P-31 (review, 15 Nov). The one rule for "this exercise works a sore area
 * today", shared by the My exercises player (prescribed-session.js, which
 * warns before the exercise and lets the person choose) and Home's Little
 * and often (little-and-often.js, which says "Works your ..." on the row).
 * It was the player's own _checkContraindication(); one copy means Home and
 * the player can never disagree.
 *
 * For an exercise linked to the shared library (exerciseId), compares its
 * contraindications with today's active sore areas (getActiveConditionIds).
 * Manually added exercises have no library record, so nothing to check.
 * It never hides or blocks anything: it only names the area.
 */

import { store } from "../store.js";
import { getActiveConditionIds, getConditionName } from "./conditions.js";
import { EXERCISES } from "./exercises/index.js";

const byId = new Map(EXERCISES.map(e => [e.id, e]));

/** { conditionName } when this exercise works an area that is sore today, else null. */
export function soreConditionFor(ex) {
  if (!ex || !ex.exerciseId) return null;
  const full = byId.get(ex.exerciseId);
  if (!full || !full.contraindications?.length) return null;
  const activeIds = getActiveConditionIds(store.get("conditions") || [], store.get("conditionPainScores") || {});
  const hit = full.contraindications.find(c => activeIds.includes(c));
  if (!hit) return null;
  return { conditionName: getConditionName(hit.replace(/-acute$|-subacute$/, "")) };
}
