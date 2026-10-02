/**
 * js/data/age-check.js
 * 02 Oct 2026 v4
 *
 * v4 - W4-17 and W4-19. The year is typed (inputmode numeric), not a list of
 *   101 starting at this year. ageAnswer() says why an answer cannot be
 *   read: a date not reached yet is "That date hasn't happened yet"
 *   (AGE_ERRORS), not "Choose a month and a year". heldOnPhone() for the
 *   warning before deleting an earlier install.
 *
 * 02 Oct 2026 v3
 *
 * v3 - W4-1 GATE-OPEN. A fresh install that has answered nothing goes to
 *   onboarding from every route but the privacy summary. Before this the
 *   guard acted only once consent was given, so the house button on the age
 *   question opened the whole app with nothing asked (Wave 4 trace, 01 Oct).
 *
 * v2 - LEGAL-TRUE. Under 18 clears every key the app keeps on the phone
 *   (store.resetEverything), not only the store.
 *
 * AGE-CHECK. Alongside is for adults (decision A1.11, 15 Aug 2026). This
 * is the check that makes that true, and the guard that keeps it true.
 *
 * WHY IT IS BUILT THIS WAY (ICO, Children's code and the Commissioner's
 * Opinion on age assurance; Ofcom/ICO joint statement, 25 Mar 2026):
 *   - NEUTRAL. It asks when you were born, not "Are you over 18?", so the
 *     answer that lets you in is not handed to you.
 *   - MINIMAL. The month and year are used once, here, and thrown away.
 *     Only the result is kept: consent.ageConfirmed true (18 or over) or
 *     false (under 18), with when and which version of the check.
 *   - NOT RELIED ON ALONE. Self-declaration is weak, so the app also
 *     applies the Children's code standards to everyone (Children's Access
 *     Assessment, 01 Oct 2026). This check is what makes the 18+ in the
 *     terms something the app actually does (standard 6).
 *   - UNDER 18 STORES NOTHING ELSE. Anything already on the phone is
 *     deleted, and the app shows only the under-18 screen from then on.
 *     Starting again needs the app's data cleared, a deliberate act.
 *
 * Age is counted in whole months: 18 years is 216 months, and the birth
 * month counts as reached. So somebody born in October 2008 is 18 in
 * October 2026; somebody born in November 2008 is not yet.
 */
import { store } from "../store.js";

export const AGE_CHECK_VERSION = "2026-10-01";
export const ADULT_MONTHS = 18 * 12;

export const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

/** month 1-12, year YYYY. True when 18 or over by month, false otherwise. */
export function isAdult(month, year, now = new Date()) {
  const m = Number(month), y = Number(year);
  if (!Number.isInteger(m) || !Number.isInteger(y) || m < 1 || m > 12) return null;
  const months = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
  if (months < 0) return null;
  return months >= ADULT_MONTHS;
}

/**
 * W4-19. The year is typed, not chosen from a list: 1950 was 77th of 101 in
 * a list that started at this year. A typed year hands nobody the answer
 * that lets them in (a list starting 18 years ago would), and anybody can
 * type their real one.
 */
export const OLDEST_YEARS = 120;

/**
 * What the answer is: "adult", "under", or a reason it can't be read:
 * "empty", "short" (not four digits), "future" (W4-17: a date not reached
 * yet said "Choose a month and a year"), "old" (more than 120 years ago).
 */
export function ageAnswer(month, year, now = new Date()) {
  const m = String(month ?? "").trim(), y = String(year ?? "").trim();
  if (!m || !y) return "empty";
  if (!/^\d{4}$/.test(y)) return "short";
  if (Number(y) < now.getFullYear() - OLDEST_YEARS) return "old";
  const adult = isAdult(m, y, now);
  if (adult === null) return "future";
  return adult ? "adult" : "under";
}

/** The plain words for an answer that can't be read. */
export const AGE_ERRORS = Object.freeze({
  empty: "Choose a month and type the year.",
  short: "Type all four digits of the year, for example 1975.",
  future: "That date hasn\u2019t happened yet. Check the month and the year.",
  old: "Check the year: it is more than 120 years ago.",
});

/** Anything on this phone from before the age question (W4-17). */
export function heldOnPhone() {
  const d = store.data || {};
  const sessions = store.completedSessions(d.activityLog || []).length;
  const journal = (d.journalEntries || []).length;
  const checkins = Object.keys(d.checkinHistory || {}).length;
  return { sessions, journal, checkins, any: sessions + journal + checkins > 0 };
}

const _c = () => store.get("consent") || {};

/** Somebody who said they are under 18. */
export const declaredUnder18 = () => _c().ageConfirmed === false;

/** An install from before the check existed: consent given, age never asked. */
export const ageNeeded = () => _c().given === true && _c().ageConfirmed !== true && _c().ageConfirmed !== false;

/** Record the result. Under 18: delete everything else on the phone first. */
export function recordAge(adult) {
  const at = new Date().toISOString();
  if (adult) {
    store.set("consent.ageConfirmed", true);
    store.set("consent.ageCheckedAt", at);
    store.set("consent.ageVersion", AGE_CHECK_VERSION);
    return;
  }
  store.resetEverything();
  store.set("consent.ageConfirmed", false);
  store.set("consent.ageCheckedAt", at);
  store.set("consent.ageVersion", AGE_CHECK_VERSION);
}

let _pending = null;
export function takePendingRoute() { const r = _pending; _pending = null; return r; }

const ALWAYS_OPEN = new Set(["under-18", "privacy"]);

/** Nothing answered yet: a fresh install, before the age question. */
export const nothingAnswered = () =>
  _c().given !== true && _c().ageConfirmed !== true && _c().ageConfirmed !== false;

// W4-1. Before the age question, only onboarding (which asks it first) and
// the privacy summary it links to.
const FIRST_OPEN = new Set(["onboarding/thread", "privacy"]);

/** Router guard: 'under-18' or 'age-check' in place of the route, or null. */
export function guardRoute(route) {
  if (declaredUnder18()) return ALWAYS_OPEN.has(route) ? null : "under-18";
  if (nothingAnswered()) return FIRST_OPEN.has(route) ? null : "onboarding/thread";
  if (ageNeeded() && !ALWAYS_OPEN.has(route) && route !== "age-check") {
    _pending = route;
    return "age-check";
  }
  return null;
}

/** The question, shared by onboarding and the age-check screen. */
export function ageQuestionHTML(idPrefix = "age") {
  return `
    <fieldset class="age-q" id="${idPrefix}-fieldset">
      <legend class="age-q__legend">When were you born?</legend>
      <p class="age-q__hint" id="${idPrefix}-hint">Alongside is for adults. I only keep whether you are 18 or over, not the date.</p>
      <div class="age-q__row">
        <div class="age-q__field">
          <label class="age-q__label" for="${idPrefix}-month">Month</label>
          <select class="age-q__select" id="${idPrefix}-month" aria-describedby="${idPrefix}-hint">
            <option value="">Choose</option>
            ${MONTHS.map((m, i) => `<option value="${i + 1}">${m}</option>`).join("")}
          </select>
        </div>
        <div class="age-q__field">
          <label class="age-q__label" for="${idPrefix}-year">Year</label>
          <input class="age-q__select age-q__year" id="${idPrefix}-year" type="text" inputmode="numeric"
                 pattern="[0-9]*" maxlength="4" autocomplete="off" placeholder="For example 1975"
                 aria-describedby="${idPrefix}-hint">
        </div>
      </div>
      <p class="age-q__error" id="${idPrefix}-error" role="alert"></p>
    </fieldset>`;
}

/** Read the answer: true adult, false under 18, null not answered. */
export function readAge(root, idPrefix = "age") {
  const a = readAnswer(root, idPrefix);
  return a === "adult" ? true : a === "under" ? false : null;
}

/** The answer as ageAnswer() gives it, read from the question's fields. */
export function readAnswer(root, idPrefix = "age") {
  return ageAnswer(root.querySelector(`#${idPrefix}-month`)?.value, root.querySelector(`#${idPrefix}-year`)?.value);
}

/** Show why the answer can't be read and put focus where to fix it. */
export function showAgeError(root, idPrefix, answer) {
  const err = root.querySelector(`#${idPrefix}-error`);
  if (err) err.textContent = AGE_ERRORS[answer] || AGE_ERRORS.empty;
  const month = root.querySelector(`#${idPrefix}-month`), year = root.querySelector(`#${idPrefix}-year`);
  (answer === "empty" && !month?.value ? month : year)?.focus();
}
