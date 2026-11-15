/**
 * js/data/week-changes.js
 * 14 Nov 2026 v1
 *
 * P-29 CHANGE-TODAY (mock-up v5 approved by Graeme, 14 Nov: "Spec and build
 * the code"; spec docs/specs/alongside_little-and-often_change-today_14nov2026_v1.md).
 *
 * Change today, on the Plan's Today card: what today can become, and the
 * rules that keep it simple and kind. Every change is this week's only
 * (weekChanges); Your week (weekShape) is never changed, so next week is
 * as planned. Reading a day with its change is week-shape.js dayInWeek().
 *
 *   anotherDayChoices()  Do it another day: each later day this week, and
 *                        what will happen there. A day with a session
 *                        (not done, not already changed) swaps; a rest day
 *                        or a day with nothing planned takes it. Two
 *                        sessions never land on one day.
 *   catchUpChoices()     Catch up: on a day with no session, each earlier
 *                        day this week whose session was not done and has
 *                        not moved. Offered only inside Change today,
 *                        never as a reminder.
 *   doAnotherDay(day)    swap or move today's session to that day
 *   doCatchUp(day)       play that earlier day's session today
 *   setToday(kind)       little | rest | else (Something else)
 *   undoToday()          today back as planned, and the other day too
 *   changeLine()         what Home says about today's change, or ""
 *
 * A session moves once: a day already playing another day's session
 * offers no Do it another day. Anything still undone at the end of the
 * week simply was not done; nothing rolls into next week, and nothing is
 * counted against anyone.
 */

import { store } from "../store.js";
import { DAY_KEYS, DAY_NAMES, mondayOf } from "./week-shape-model.js";
import { getWeek, dayKeyOf, dayInWeek, weekChangesNow, doneThisWeek } from "./week-shape.js";

const at = day => DAY_KEYS.indexOf(day);

function current(d) { return { ...(weekChangesNow(d)?.days || {}) }; }

function write(days, d) {
  store.set("weekChanges", Object.keys(days).length ? { week: mondayOf(d), days } : null);
}

/** Today's change removed, with the other day it was tied to. */
function dropDay(days, day) {
  const ch = days[day];
  if (!ch) return days;
  const other = ch.from || ch.to;
  if (other && days[other] && (days[other].from === day || days[other].to === day)) delete days[other];
  delete days[day];
  return days;
}

/** Change today is offered when there is a week and today is not done. */
export function canChangeToday(d = new Date()) {
  return !!getWeek();
}

/** Do it another day: [{ day, kind: "swap"|"move", template? }]. */
export function anotherDayChoices(d = new Date()) {
  const today = dayKeyOf(d);
  const t = dayInWeek(today, d);
  if (!t || !t.template || (t.change && t.change.kind === "plan")) return [];   // a session moves once
  const done = doneThisWeek(d);
  return DAY_KEYS.filter(k => at(k) > at(today)).map(k => {
    const x = dayInWeek(k, d);
    if (!x || x.change) return null;                                 // a day already changed is left alone
    if (x.value === "rest" || x.value === null) return { day: k, kind: "move" };
    if (x.template && !done[k]) return { day: k, kind: "swap", template: x.template };
    return null;
  }).filter(Boolean);
}

/** Catch up: [{ day, template }], only on a day with no session today. */
export function catchUpChoices(d = new Date()) {
  const today = dayKeyOf(d);
  const t = dayInWeek(today, d);
  if (!t || t.template) return [];
  const done = doneThisWeek(d);
  return DAY_KEYS.filter(k => at(k) < at(today)).map(k => {
    const x = dayInWeek(k, d);
    if (!x || !x.template || x.change || done[k]) return null;
    return { day: k, template: x.template };
  }).filter(Boolean);
}

/** Today's session to that later day: a swap when it has a session, else a move. */
export function doAnotherDay(target, d = new Date()) {
  const choice = anotherDayChoices(d).find(c => c.day === target);
  if (!choice) return false;
  const today = dayKeyOf(d);
  const mine = dayInWeek(today, d).value;
  const days = current(d);
  if (choice.kind === "swap") {
    const theirs = dayInWeek(target, d).value;
    days[today] = { kind: "plan", value: theirs, from: target };
    days[target] = { kind: "plan", value: mine, from: today };
  } else {
    days[target] = { kind: "plan", value: mine, from: today };
    days[today] = { kind: "moved", value: mine, to: target };
  }
  write(days, d);
  return true;
}

/** That earlier day's session, today. */
export function doCatchUp(earlier, d = new Date()) {
  const choice = catchUpChoices(d).find(c => c.day === earlier);
  if (!choice) return false;
  const today = dayKeyOf(d);
  const value = dayInWeek(earlier, d).value;
  const days = dropDay(current(d), today);
  days[today] = { kind: "plan", value, from: earlier, caught: true };
  days[earlier] = { kind: "moved", value, to: today, caught: true };
  write(days, d);
  return true;
}

/** Little and often instead, Rest today, or Something else. */
export function setToday(kind, d = new Date()) {
  if (!["little", "rest", "else"].includes(kind) || !getWeek()) return false;
  const today = dayKeyOf(d);
  const days = dropDay(current(d), today);
  days[today] = { kind };
  write(days, d);
  return true;
}

/** Today back as planned, and the day it was tied to. */
export function undoToday(d = new Date()) {
  const days = current(d);
  const today = dayKeyOf(d);
  if (!days[today]) return false;
  write(dropDay(days, today), d);
  return true;
}

/** What Home says about today's change ("Swapped with Friday."), or "". */
export function changeLine(d = new Date()) {
  const t = getWeek() ? dayInWeek(dayKeyOf(d), d) : null;
  const ch = t && t.change;
  if (!ch) return "";
  if (ch.kind === "plan") {
    if (ch.caught) return `Caught up from ${DAY_NAMES[ch.from]}.`;
    const other = weekChangesNow(d)?.days?.[ch.from];
    return other && other.kind === "plan" ? `Swapped with ${DAY_NAMES[ch.from]}.` : `Moved from ${DAY_NAMES[ch.from]}.`;
  }
  if (ch.kind === "moved") return ch.caught ? `Done on ${DAY_NAMES[ch.to]} instead.` : `Moved to ${DAY_NAMES[ch.to]}.`;
  if (ch.kind === "little") return "Little and often instead.";
  if (ch.kind === "rest") return "Changed to a rest day.";
  return "Something else today.";
}
