/**
 * js/data/time-windows.js
 * 28 Sep 2026 v1
 *
 * Work list 2e. The one constant the retired workoutGenerator.js held
 * that the live app still reads: how many minutes each declared time
 * window means. Moved here so the engine could go (TWO-ENGINE left it
 * with no caller on 6 Sep; its record is in Documents/Archive).
 *
 * Readers: views/coach-proposal.js (a category to minutes) and
 * views/know-what.js (the lengths offered). Same numbers as the labels
 * the check-in has always shown: Micro/Quick/Short/Standard/Long/Open.
 */
export const AVAILABLE_TIME_WINDOW_MINUTES = {
  micro:    10,
  quick:    20,
  short:    30,
  standard: 40,
  long:     50,
  open:     60
};
