/**
 * js/data/week-changes.js
 * 15 Nov 2026 v2
 *
 * v2 - P-31 review (15 Nov), three rules made safe:
 *   1. Undo never puts a session back on a day that has passed. On the
 *      later day of a swap or a move, Home still says what happened, with
 *      no Undo (canUndoToday). A catch-up can always be undone: its other
 *      day is the earlier one it was missed on, so nothing is lost.
 *   2. On a day whose session moved to a later day, choosing Little and
 *      often, Rest today, Something else or Catch up leaves the session on
 *      that later day (it was being undone without a word). Undo then puts
 *      today back to "Moved to Friday.", not to the session itself, so the
 *      week never holds it twice.
 *   3. "Swapped with" is said only when the other day plays today's plan.
 *   canChangeToday() removed: nothing used it, and it did not check what
 *   its comment said.
 *
 * v1 - 14 Nov 2026.
 *
 * P-31 CHANGE-TODAY (mock-up v5 approved by Graeme, 14 Nov: "Spec and build
 * the code"; spec docs/specs/alongside_little-and-often_change-today_15nov2026_v2.md).
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
 *   canUndoToday()       whether Undo shows (never onto a day that has passed)
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

/**
 * The day a change is tied to, if it should be undone with it: only when it
 * plays or gave up this day's plan, and never a day that has passed, except
 * a catch-up's earlier day (missed already, so putting it back loses
 * nothing). keepMoved: a day whose session moved keeps the move.
 */
function tiedDay(days, day, keepMoved = false) {
  const ch = days[day];
  if (!ch) return null;
  const other = ch.from || ch.to;
  if (!other || !days[other] || (days[other].from !== day && days[other].to !== day)) return null;
  if (keepMoved && ch.kind === "moved") return null;
  return ch.caught || at(other) > at(day) ? other : null;
}

/** This day's change removed, with the day it is tied to (tiedDay). */
function dropDay(days, day, keepMoved = false) {
  const other = tiedDay(days, day, keepMoved);
  if (other) delete days[other];
  delete days[day];
  return days;
}

/** The later day now playing this day's session (a move), or null. */
function movedOnTo(days, day) {
  const hit = Object.entries(days).find(([k, c]) => c.kind === "plan" && c.from === day && !c.caught && at(k) > at(day));
  return hit ? { day: hit[0], value: hit[1].value } : null;
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
  const days = dropDay(current(d), today, true);
  days[today] = { kind: "plan", value, from: earlier, caught: true };
  days[earlier] = { kind: "moved", value, to: today, caught: true };
  write(days, d);
  return true;
}

/** Little and often instead, Rest today, or Something else. */
export function setToday(kind, d = new Date()) {
  if (!["little", "rest", "else"].includes(kind) || !getWeek()) return false;
  const today = dayKeyOf(d);
  const days = dropDay(current(d), today, true);
  days[today] = { kind };
  write(days, d);
  return true;
}

/**
 * Whether today's change can be undone: never when its other day has
 * passed (the session would land in the past), except a catch-up.
 */
export function canUndoToday(d = new Date()) {
  const days = current(d);
  const today = dayKeyOf(d);
  const ch = days[today];
  if (!ch) return false;
  const other = ch.from || ch.to;
  return !other || !!ch.caught || at(other) > at(today);
}

/** Today back as planned, and the day it was tied to; a moved session stays moved. */
export function undoToday(d = new Date()) {
  if (!canUndoToday(d)) return false;
  const today = dayKeyOf(d);
  const days = dropDay(current(d), today);
  const moved = movedOnTo(days, today);
  if (moved) days[today] = { kind: "moved", value: moved.value, to: moved.day };
  write(days, d);
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
    return other && other.kind === "plan" && other.from === dayKeyOf(d) ? `Swapped with ${DAY_NAMES[ch.from]}.` : `Moved from ${DAY_NAMES[ch.from]}.`;
  }
  if (ch.kind === "moved") return ch.caught ? `Done on ${DAY_NAMES[ch.to]} instead.` : `Moved to ${DAY_NAMES[ch.to]}.`;
  if (ch.kind === "little") return "Little and often instead.";
  if (ch.kind === "rest") return "Changed to a rest day.";
  return "Something else today.";
}
