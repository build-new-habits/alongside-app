/**
 * js/data/little-and-often.js
 * 23 Nov 2026 v3
 *
 * v3 - OWN-DONE-TODAY (Graeme, 23 Nov: "It says I did these today but I
 *   didn't"). Done today is read through store.ownDoneToday(): ticked today
 *   only (the flag was never cleared).
 *
 * v2 - P-31 review (15 Nov). The sore rule is the shared one in
 *   data/sore-rule.js (it was a copy of the player's), so Home and the
 *   player cannot drift apart. onHomeCount() lets My exercises' status line
 *   say when Home already shows three, rather than promising a fourth.
 *
 * v1 - 14 Nov 2026.
 *
 * P-31 LITTLE-AND-OFTEN (mock-up v5 approved by Graeme, 14 Nov; spec
 * docs/specs/alongside_little-and-often_change-today_15nov2026_v2.md).
 *
 * Little and often: short lists from My exercises, one tap from the Plan's
 * Home. The person chooses which lists show, and when, on each list in My
 * exercises (On Home: Not on Home, Any time, Mornings, Evenings). Stored in
 * myExercisesOnHome (Schema v1.125).
 *
 *   homeItems()   what Home shows now: at most three. A list set for this
 *                 part of the day comes first (Mornings before midday,
 *                 Evenings from 6pm), then Any time, in My exercises'
 *                 order. Nothing shows when nothing is chosen; Home never
 *                 asks.
 *   setOnHome()   the choice on a list in My exercises
 *
 * Each item says how many exercises it has, whether it is done today
 * (every exercise in it ticked) and, on a sore day, which area it works,
 * by the same rule the list's player warns with (prescribed-session.js
 * _checkContraindication): the person still chooses. No minutes are
 * claimed: a list's length is the person's own.
 */

import { store } from "../store.js";
import { ON_HOME } from "./week-shape-model.js";
import { ownGroups } from "./week-shape.js";
import { soreConditionFor } from "./sore-rule.js";

export const MAX_ON_HOME_SHOWN = 3;
export const ON_HOME_CHOICES = [
  { id: "off", label: "Not on Home" },
  { id: "any", label: "Any time" },
  { id: "morning", label: "Mornings" },
  { id: "evening", label: "Evenings" },
];

/** The choice for a list: "off" | "any" | "morning" | "evening". */
export function onHomeFor(group) {
  return (store.get("myExercisesOnHome") || {})[group] || "off";
}

/** Set the choice for a list. "off" takes it off Home. */
export function setOnHome(group, value) {
  const name = String(group || "").replace(/[<>]/g, "").trim().slice(0, 40);
  if (!name) return false;
  const o = { ...(store.get("myExercisesOnHome") || {}) };
  if (ON_HOME.includes(value)) o[name] = value; else delete o[name];
  store.set("myExercisesOnHome", o);
  return true;
}

/** This part of the day: "morning" before midday, "evening" from 6pm, else null. */
export function partOfDay(d = new Date()) {
  const h = d.getHours();
  return h < 12 ? "morning" : h >= 18 ? "evening" : null;
}

/** The sore area a list works today, by the player's own rule (sore-rule.js), or null. */
function soreAreaIn(items) {
  for (const e of items) {
    const hit = soreConditionFor(e);
    if (hit) return hit.conditionName;
  }
  return null;
}

/** How many of the person's lists are on Home (any part of the day). */
export function onHomeCount() {
  const choices = store.get("myExercisesOnHome") || {};
  return ownGroups().filter(g => ON_HOME.includes(choices[g])).length;
}

/** Home's Little and often: [{ group, when, count, done, sore }], at most three. */
export function homeItems(d = new Date()) {
  const choices = store.get("myExercisesOnHome") || {};
  const groups = ownGroups().filter(g => ON_HOME.includes(choices[g]));
  const part = partOfDay(d);
  const ordered = [...groups.filter(g => part && choices[g] === part), ...groups.filter(g => choices[g] === "any")]
    .slice(0, MAX_ON_HOME_SHOWN);
  const all = store.get("prescribedExercises") || [];
  return ordered.map(group => {
    const items = all.filter(e => e.group === group);
    return {
      group,
      when: choices[group],
      count: items.length,
      done: items.length > 0 && items.every(e => store.ownDoneToday(e)),
      sore: soreAreaIn(items),
    };
  });
}
