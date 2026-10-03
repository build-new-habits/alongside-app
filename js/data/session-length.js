/**
 * js/data/session-length.js
 * 03 Oct 2026 v1
 *
 * v1 - W5-11 USUAL-LENGTH (Wave 5 persona trace: 2.1, 2.12, 2.15, 2.16).
 *   A length picked on the coach's plan, in I know what I want, or by
 *   "Something shorter" was saved as availableTime, which Settings calls
 *   "How long you usually have": a Bad day's 10 became "your usual 10
 *   minutes" for twelve days. Now a pick is today's (availableTimeToday,
 *   with its day), and the usual changes only in Settings. Readers ask for
 *   today's length, which is today's pick if there is one, else the usual.
 *
 *   Lengths are the builder's own categories (data/time-windows.js).
 */
import { store } from "../store.js";

/** The usual length category (Settings › How long you usually have). */
export const usualLengthCat = () => store.get("availableTime") || null;

/** A length picked today, or null (a pick from another day is not today's). */
export function todaysLengthCat() {
  const t = store.get("availableTimeToday");
  return t && t.cat && t.on === store._localDay() ? t.cat : null;
}

/** The length to build today: today's pick, else the usual. */
export const lengthCatForToday = () => todaysLengthCat() || usualLengthCat();

/** Today only: the usual is left as it is. */
export function setTodaysLength(cat) {
  if (!cat) return;
  store.set("availableTimeToday", { cat, on: store._localDay() });
}
