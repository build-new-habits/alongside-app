/**
 * js/stretch-target.js
 * 16 Sep 2026 v1
 *
 * STRETCH-VIA-COACH. What a stretch session is FOR, in one place.
 *
 * ── WHY THIS IS A MODULE AND NOT A SECOND COPY ───────────────────────
 *
 * STRETCH-FOCUS put a target question on the stretch door: "What's this
 * for today?", preselected from the check-in, sorting the poses so the
 * ones serving that area come first.
 *
 * Graeme, testing the 1-to-1 path: "I never get a chance to state what I
 * want to do with stretching... I didn't get any body part or shape
 * options for stretch."
 *
 * He is right, and the cause is routing. When the coach proposes a
 * stretch session it routes to workout.js, the generic exercise-list
 * view. The target logic lived in yoga-session.js. So the feature built
 * on Monday was unreachable from the path he actually uses.
 *
 * 🔴 THE FIX IS NOT A REROUTE. yoga-session.js assembles its own queue
 * from its own pools and would discard the session the coach built. And
 * it is not a second copy of the logic either -- SAVE-ALL is one day old
 * and exists because a second implementation of saving drifted from the
 * first. One module, both paths.
 *
 * ── THE ALIAS TABLE WAS ALREADY DRIFTING ─────────────────────────────
 *
 * 🔴 Extracting this found what extraction usually finds: _impliedTarget()
 * carried its OWN copy of the area aliases -- lower-back to spine,
 * sciatica to glutes and hamstring, and so on -- a second table beside
 * AREA_ALIASES in session-rationale.js. Two tables answering "what does
 * a sore lower back cover" is exactly how the caution on a card and the
 * preselection on the selector come to disagree about the same body.
 *
 * They are still two tables, because session-rationale.js does not
 * export its one. That is logged (ALIAS-ONE) rather than fixed here:
 * merging them is a change to what bodyCaution() matches, and that is
 * clinical surface, not refactoring. What has changed is that there is
 * now ONE copy of the stretch-side table instead of one per view.
 */

import { store } from "./store.js";

/**
 * Four targets, deliberately coarse.
 *
 * Twenty `affectsAreas` values exist. Offering twenty is a taxonomy;
 * offering four is a question somebody answers in a gym at 06:40. "All
 * over" carries no areas, which is what makes it the honest no-preference
 * option rather than a fifth kind of filter.
 */
export const TARGET_AREAS = [
  { id: "back-hips", label: "Back and hips", icon: "\uD83E\uDDD8",
    areas: ["lower-back", "spine", "hip", "hip-flexor", "glutes", "piriformis", "upper-back", "thoracic"] },
  { id: "legs",      label: "Legs",          icon: "\uD83E\uDDB5",
    areas: ["hamstring", "quadriceps", "calves", "adductors", "knee", "ankle-foot"] },
  { id: "shoulders", label: "Shoulders and arms", icon: "\uD83D\uDCAA",
    areas: ["shoulder", "rotator-cuff", "wrist-elbow", "chest-pecs", "triceps-biceps"] },
  { id: "all",       label: "All over",      icon: "\u2728", areas: [] }
];

/** See the header: a second copy of the stretch-side aliases. ALIAS-ONE. */
const ALIASES = {
  "lower-back":        ["lower-back", "spine"],
  "upper-back":        ["upper-back", "thoracic"],
  "sciatica":          ["lower-back", "glutes", "hamstring", "piriformis"],
  "it-band":           ["hip", "knee"],
  "shin-splints":      ["calves", "ankle-foot"],
  "achilles":          ["calves", "ankle-foot"],
  "plantar-fasciitis": ["ankle-foot", "calves"],
  "biceps-triceps":    ["triceps-biceps"],
  "wrist-elbow":       ["wrist-elbow"]
};

/**
 * The target the check-in already implies, or null.
 *
 * 🔴 IT DOES NOT FALL BACK TO THE ARC, and that is the decision rather
 * than an omission. Graeme: "maybe today I've got DOMS from having done
 * too many arm exercises yesterday... and that's my arms, not my lower
 * back. And my lower back is my arc." Some days the arc is not what
 * today is about. A fresh signal beats a standing one; with no fresh
 * signal, nothing is preselected and the person is asked.
 *
 * Computed on every call rather than latched: the check-in changes
 * between visits and a stale preselection is worse than none.
 */
export function impliedTarget() {
  const conditions = store.get("conditions") || [];
  const scores     = store.get("conditionPainScores") || {};
  const sore       = conditions.filter(id => (scores[id] || 0) >= 4);
  if (!sore.length) return null;

  for (const id of sore) {
    const areas = ALIASES[id] || [id];
    const hit = TARGET_AREAS.find(t => t.areas.some(a => areas.includes(a)));
    if (hit) return hit.id;
  }
  return null;
}

export function targetById(id) {
  return TARGET_AREAS.find(t => t.id === id) || null;
}

/**
 * SORT, DO NOT FILTER.
 *
 * A hard filter would hand back a three-pose session when the pool is
 * thin, and a short session reads as the app having nothing for you.
 * Sorting puts what serves the target first and keeps the rest behind
 * it, so the count holds and the priority is honest. Graeme did this
 * sorting by hand and skipped the tail; now the tail is the tail.
 *
 * Stable: equal items keep their original order, so a re-render does not
 * reshuffle a session somebody is halfway through.
 */
export function sortByTarget(list, targetId) {
  const items = Array.isArray(list) ? list : [];
  const target = targetById(targetId);
  if (!target || !target.areas.length) return items.slice();

  const hits = [], rest = [];
  for (const ex of items) {
    const areas = (ex && ex.affectsAreas) || [];
    (areas.some(a => target.areas.includes(a)) ? hits : rest).push(ex);
  }
  return hits.concat(rest);
}

/**
 * Is this a session the target question is even about?
 *
 * Asked of the SESSION rather than of the route, so a stretch session
 * reached by any path is treated the same. A strength session has a
 * target in a different sense and must not get this.
 */
export function isStretchLike(session) {
  const t = String(session?.sessionType || session?.id || "").toLowerCase();
  return t === "stretch" || t === "mobility";
}
