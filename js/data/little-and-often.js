/**
 * js/data/little-and-often.js
 * 26 Nov 2026 v5
 *
 * v5 - P-37 S3. weekRoutines(): what Your week says of the lists on Home,
 *   each day (Mornings: Wake-up hips · Evenings: takes turns) and across
 *   the week (Every day, as well). Nothing counted.
 *
 * v4 - P-37 S1 (mock-up approved by Graeme 26 Nov). A Mornings or Evenings
 *   list either takes turns (the default) or has its own days. Take turns:
 *   one list each morning (or evening), in My exercises' order; it moves on
 *   only after the one before was finished, so a missed morning skips
 *   nothing (no catching up, no count). Chosen days: on those days only, and
 *   a list on its day comes before the one taking its turn. Any time lists
 *   as before.
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
import { ON_HOME, DAY_KEYS } from "./week-shape-model.js";
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
  // P-37: days belong to Mornings or Evenings only.
  if (!["morning", "evening"].includes(value) && (store.get("onHomeDays") || {})[name]) setOnHomeDays(name, null);
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

/** P-37. The days a list has (Choose the days), or null (it takes turns). */
export function onHomeDaysFor(group) {
  const d = (store.get("onHomeDays") || {})[group];
  return Array.isArray(d) && d.length ? d : null;
}

/** P-37. Set the days for a list; null or none, and it takes turns. */
export function setOnHomeDays(group, days) {
  const o = { ...(store.get("onHomeDays") || {}) };
  const list = Array.isArray(days) ? DAY_KEYS.filter(d => days.includes(d)) : [];
  if (list.length) o[group] = list; else delete o[group];
  store.set("onHomeDays", o);
}

const _day = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const _key = d => DAY_KEYS[(d.getDay() + 6) % 7];
const _finished = (group, all) => { const items = all.filter(e => e.group === group); return items.length > 0 && items.every(e => store.ownDoneToday(e)); };

/**
 * P-37. Whose turn it is for a part of the day, among the lists taking
 * turns there: { group, next } or null. It moves on only once the list
 * before was finished on an earlier day; finishing today is noted.
 */
export function turnFor(part, d = new Date()) {
  const choices = store.get("myExercisesOnHome") || {};
  const days = store.get("onHomeDays") || {};
  const order = ownGroups().filter(g => choices[g] === part && !days[g]);
  if (!order.length) return null;
  const turns = { ...(store.get("onHomeTurns") || {}) };
  let t = turns[part] && order.includes(turns[part].group) ? { ...turns[part] } : { group: order[0], doneOn: null };
  const today = _day(d);
  if (t.doneOn && t.doneOn < today) t = { group: order[(order.indexOf(t.group) + 1) % order.length], doneOn: null };
  if (!t.doneOn && _finished(t.group, store.get("prescribedExercises") || [])) t.doneOn = today;
  const was = turns[part];
  if (!was || was.group !== t.group || was.doneOn !== t.doneOn) { turns[part] = t; store.set("onHomeTurns", turns); }
  const next = order.length > 1 ? order[(order.indexOf(t.group) + 1) % order.length] : null;
  return { group: t.group, next };
}

/** Home's line under a list: how many, when, and (P-37) which comes next. */
export function homeItemLine(i) {
  const when = { morning: "This morning", evening: "This evening", any: "" };
  return [`${i.count} exercise${i.count === 1 ? "" : "s"}`, when[i.when], i.next ? `${i.next} next` : ""].filter(Boolean).join(" \u00b7 ");
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
  // P-37: this part of the day's lists on their chosen day, then the one whose turn it is.
  const days = store.get("onHomeDays") || {};
  const onDay = part ? groups.filter(g => choices[g] === part && Array.isArray(days[g]) && days[g].includes(_key(d))) : [];
  const turn = part ? turnFor(part, d) : null;
  const ordered = [...onDay, ...(turn ? [turn.group] : []), ...groups.filter(g => choices[g] === "any")]
    .slice(0, MAX_ON_HOME_SHOWN);
  const all = store.get("prescribedExercises") || [];
  return ordered.map(group => {
    const items = all.filter(e => e.group === group);
    return {
      group,
      when: choices[group],
      next: turn && turn.group === group ? turn.next : null,
      count: items.length,
      done: items.length > 0 && items.every(e => store.ownDoneToday(e)),
      sore: soreAreaIn(items),
    };
  });
}

const _and = list => list.length <= 1 ? (list[0] || "") : `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;
const _SHORT = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };

/**
 * P-37 S3. Your week's lines for the lists on Home.
 *   days: { mon: "Mornings: Wake-up hips · Evenings: takes turns", ... } ("" when none)
 *   summary: [{ part: "Mornings"|"Evenings"|"Any time", line }] for Every day, as well
 * A list on its chosen day is named; lists taking turns say "takes turns"
 * (which one depends on when the last was finished, so no day is promised).
 */
export function weekRoutines() {
  const choices = store.get("myExercisesOnHome") || {};
  const daysOf = store.get("onHomeDays") || {};
  const groups = ownGroups().filter(g => ON_HOME.includes(choices[g]));
  const out = { days: {}, summary: [] };
  const by = part => groups.filter(g => choices[g] === part);
  for (const d of DAY_KEYS) {
    const bits = [];
    for (const [part, word] of [["morning", "Mornings"], ["evening", "Evenings"]]) {
      const lists = by(part);
      const on = lists.filter(g => Array.isArray(daysOf[g]) && daysOf[g].includes(d));
      const turns = lists.filter(g => !Array.isArray(daysOf[g]));
      if (!on.length && !turns.length) continue;
      bits.push(`${word}: ${[..._and(on) ? [_and(on)] : [], ...(turns.length ? [on.length ? "one taking turns" : turns.length > 1 ? "takes turns" : turns[0]] : [])].join(", and ")}`);
    }
    out.days[d] = bits.join(" \u00b7 ");
  }
  for (const [part, word] of [["morning", "Mornings"], ["evening", "Evenings"]]) {
    const lists = by(part);
    if (!lists.length) continue;
    const chosen = lists.filter(g => Array.isArray(daysOf[g])).map(g => `${g} (${daysOf[g].map(k => _SHORT[k]).join(", ")})`);
    const turns = lists.filter(g => !Array.isArray(daysOf[g]));
    const t = turns.length > 1 ? `${_and(turns)} take turns` : turns.length ? `${turns[0]}, every ${part}` : "";
    out.summary.push({ part: word, line: [...chosen, ...(t ? [t] : [])].join(" \u00b7 ") });
  }
  const any = by("any");
  if (any.length) out.summary.push({ part: "Any time", line: _and(any) });
  return out;
}
