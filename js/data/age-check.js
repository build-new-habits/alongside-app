/**
 * js/data/age-check.js
 * 01 Oct 2026 v1
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

/** The years offered, newest first: this year back 100 years. */
export function yearsOffered(now = new Date()) {
  const ys = [];
  for (let y = now.getFullYear(); y >= now.getFullYear() - 100; y--) ys.push(y);
  return ys;
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
  store.reset();
  store.set("consent.ageConfirmed", false);
  store.set("consent.ageCheckedAt", at);
  store.set("consent.ageVersion", AGE_CHECK_VERSION);
}

let _pending = null;
export function takePendingRoute() { const r = _pending; _pending = null; return r; }

const ALWAYS_OPEN = new Set(["under-18", "privacy"]);

/** Router guard: 'under-18' or 'age-check' in place of the route, or null. */
export function guardRoute(route) {
  if (declaredUnder18()) return ALWAYS_OPEN.has(route) ? null : "under-18";
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
          <select class="age-q__select" id="${idPrefix}-year" aria-describedby="${idPrefix}-hint">
            <option value="">Choose</option>
            ${yearsOffered().map(y => `<option value="${y}">${y}</option>`).join("")}
          </select>
        </div>
      </div>
      <p class="age-q__error" id="${idPrefix}-error" role="alert"></p>
    </fieldset>`;
}

/** Read the answer: true adult, false under 18, null not answered. */
export function readAge(root, idPrefix = "age") {
  const m = root.querySelector(`#${idPrefix}-month`)?.value;
  const y = root.querySelector(`#${idPrefix}-year`)?.value;
  if (!m || !y) return null;
  return isAdult(m, y);
}
