/**
 * js/data/age-check.js
 * 26 Nov 2026 v9
 *
 * v9 - P-41 S4. Once 16-17 is open the question's line says Alongside is
 *   for 16 and over (approved 26 Nov); while closed it is as before.
 *
 * 25 Nov 2026 v8
 *
 * v8 - P-41 THREE AGE VERSIONS, S1 (spec v2, approved by Graeme 25 Nov).
 *   ageGroupFor() says which version suits an age (adult, young-16,
 *   young-14, under), by the same month rule, with the month a 16-17 year
 *   old moves up. recordAge() keeps the group (consent.ageGroup, Schema
 *   v1.137) and recordAnswer() records from the question's fields. Both
 *   young versions are closed (YOUNG_OPEN): until their rules are built,
 *   anyone under 18 is kept out exactly as before. Nothing on screen
 *   changes in S1.
 *
 * 17 Oct 2026 v7
 *
 * v7 - W6-16 U18-POLICY-2 (Graeme, 17 Oct: "a"; "make everything
 *   match"). The birth month no longer counts: 18 from the month after
 *   it, so nobody is let in while 17. Under 18 also removes the research
 *   "already answered" key, which resetEverything() did not reach.
 *
 * 03 Oct 2026 v6
 *
 * v6 - W5-24 (Graeme, 03 Oct: drop the copy). Under 18 deletes everything
 *   else at once again, with no warning and no copy, as the Privacy Policy,
 *   Safeguarding Policy, Children's Access Assessment and Terms say. Also
 *   W5-17 A11Y-W5: showAgeError marks the field in error aria-invalid and
 *   adds the message to its description.
 *
 * 02 Oct 2026 v5
 *
 * v5 - W5-5 and W5-6 (safeguarding reviewers to read). recordAge(false)
 *   records under 18 at once and no longer deletes first when the phone
 *   holds something: the under-18 screen warns, offers a copy and deletes
 *   (deleteForUnder18). heldOnPhone() counts anything entered (a name, a
 *   sore area, My exercises, a saved session, a weight, lifts).
 *
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
 * month does NOT count as reached (W6-16, Graeme, 17 Oct: option a). With
 * only a month and a year, somebody born in October 2008 may still be 17
 * on any day of October 2026, so they are let in from November 2026. An
 * 18-year-old can wait up to a month; a 17-year-old is never let in.
 */
import { AGE_LINE_OPEN } from "./age-version.js";
import { store } from "../store.js";

export const AGE_CHECK_VERSION = "2026-10-01";
export const ADULT_MONTHS = 18 * 12;
/** P-41: 16 and over can have the young version, by the same month rule. */
export const YOUNG_MONTHS = 16 * 12;

/**
 * P-41 (Graeme, 23 and 25 Nov): three versions, 14-15, 16-17 and 18+.
 * Which young versions are open. Both closed until their rules are built
 * and read (spec §1, §3): 16-17 opens when S2 to S5 are done; 14-15 after
 * its own reads. A closed version is kept out exactly as under 18 was:
 * everything deleted, nothing kept but that they were kept out.
 */
export const YOUNG_OPEN = { "young-16": false, "young-14": false };   // not frozen: verify-p41-schema opens it to prove the open path

/** Whole months old by the month rule (the birth month not yet reached). */
function _months(m, y, now) { return (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m); }

/**
 * P-41. Which version suits this age: { group: "adult" | "young-16" |
 * "young-14" | "under", next }. next is the month a 16-17 year old moves up
 * to the adult version (YYYY-MM: the month after the month they turn 18,
 * as the adult rule lets them in); null for everyone else. null when the
 * answer can't be read.
 */
export function ageGroupFor(month, year, now = new Date()) {
  const m = Number(month), y = Number(year);
  if (!Number.isInteger(m) || !Number.isInteger(y) || m < 1 || m > 12) return null;
  const months = _months(m, y, now);
  if (months < 0) return null;
  if (months > ADULT_MONTHS) return { group: "adult", next: null };
  if (months > YOUNG_MONTHS) {
    const at = new Date(y + 18, m, 1);   // the month after the 18th birthday month
    return { group: "young-16", next: `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, "0")}` };
  }
  if (months > 14 * 12) return { group: "young-14", next: null };
  return { group: "under", next: null };
}

export const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

/** month 1-12, year YYYY. True when 18 or over by month, false otherwise. */
export function isAdult(month, year, now = new Date()) {
  const m = Number(month), y = Number(year);
  if (!Number.isInteger(m) || !Number.isInteger(y) || m < 1 || m > 12) return null;
  const months = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
  if (months < 0) return null;
  return months > ADULT_MONTHS;   // W6-16: from the month after
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
  if (adult) return "adult";
  // P-41: a young version that is open is "young"; closed, it is kept out.
  const g = ageGroupFor(m, y, now);
  return g && YOUNG_OPEN[g.group] ? "young" : "under";
}

/** The plain words for an answer that can't be read. */
export const AGE_ERRORS = Object.freeze({
  empty: "Choose a month and type the year.",
  short: "Type all four digits of the year, for example 1975.",
  future: "That date hasn\u2019t happened yet. Check the month and the year.",
  old: "Check the year: it is more than 120 years ago.",
});

/**
 * Anything on this phone from before the age question (W4-17). W5-6:
 * anything entered counts, not only sessions, check-ins and the journal (a
 * phone holding only a name, a sore area, My exercises, a saved session or a
 * weight was cleared with no warning).
 */
export function heldOnPhone() {
  const d = store.data || {};
  const sessions = store.completedSessions(d.activityLog || []).length;
  const journal = (d.journalEntries || []).length;
  const checkins = Object.keys(d.checkinHistory || {}).length;
  const other = !!String(d.name || "").trim() ||
    (d.conditions || []).length > 0 ||
    (d.prescribedExercises || []).length > 0 ||
    (d.savedSessions || []).length > 0 ||
    (d.weightLog || []).length > 0 || d.weight != null ||
    Object.keys(d.liftLog || {}).length > 0;
  return { sessions, journal, checkins, other, any: sessions + journal + checkins > 0 || other };
}

const _c = () => store.get("consent") || {};

/** Somebody who said they are under 18. */
export const declaredUnder18 = () => _c().ageConfirmed === false;

/** An install from before the check existed: consent given, age never asked. */
export const ageNeeded = () => _c().given === true && _c().ageConfirmed !== true && _c().ageConfirmed !== false;

/**
 * Record the result. W5-5: under 18 is recorded at once, on both doors,
 * and stands: every route then shows the under-18 screen. W5-24 (Graeme,
 * 03 Oct: "drop the copy"): everything else the phone holds is deleted
 * now, with no warning and no copy, as the policies say ("deleted at
 * once"). Nothing about their health is ever kept.
 */
export function recordAge(adult, { group = "adult", next = null } = {}) {
  const at = new Date().toISOString();
  if (adult) {
    // P-41 (Schema v1.137): the group, and for 16-17 the month they move up.
    const young = group === "young-16" && YOUNG_OPEN["young-16"] && /^\d{4}-\d{2}$/.test(next || "");
    store.set("consent.ageConfirmed", true);
    store.set("consent.ageCheckedAt", at);
    store.set("consent.ageVersion", AGE_CHECK_VERSION);
    store.set("consent.ageGroup", young ? "young-16" : "adult");
    store.set("consent.ageGroupNext", young ? next : null);
    store.set("consent.ageGroupAt", at);
    return;
  }
  store.resetEverything();
  _forgetResearch();
  store.set("consent.ageConfirmed", false);
  store.set("consent.ageCheckedAt", at);
  store.set("consent.ageVersion", AGE_CHECK_VERSION);
}

/**
 * W6-16. The research "already answered" key is not an alongside key, so
 * resetEverything() kept it (it holds which question, never an answer).
 * Under 18 keeps only that they said so: it goes too.
 */
function _forgetResearch() {
  try { globalThis.localStorage?.removeItem("bnh-research-answered"); } catch { /* storage off */ }
}

/** W5-5. Under 18: delete everything else the phone holds, keep the answer. */
export function deleteForUnder18() {
  const c = store.get("consent") || {};
  store.resetEverything();
  _forgetResearch();
  store.set("consent.ageConfirmed", false);
  store.set("consent.ageCheckedAt", c.ageCheckedAt || new Date().toISOString());
  store.set("consent.ageVersion", c.ageVersion || AGE_CHECK_VERSION);
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
      <p class="age-q__hint" id="${idPrefix}-hint">${YOUNG_OPEN["young-16"] ? AGE_LINE_OPEN : "Alongside is for adults. I only keep whether you are 18 or over, not the date."}</p>
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

/**
 * P-41. Record what the question's fields say: let in ("adult", or "young"
 * when that version is open, with its month to move up) or kept out.
 * Returns the answer as ageAnswer() gives it; a reason it can't be read
 * records nothing.
 */
export function recordAnswer(root, idPrefix = "age", now = new Date()) {
  const month = root.querySelector(`#${idPrefix}-month`)?.value, year = root.querySelector(`#${idPrefix}-year`)?.value;
  const a = ageAnswer(month, year, now);
  if (a === "adult") recordAge(true);
  else if (a === "young") { const g = ageGroupFor(month, year, now); recordAge(true, { group: g.group, next: g.next }); }
  else if (a === "under") recordAge(false);
  return a;
}

/** The version this phone is in: "adult", "young-16", or null (not let in). */
export const ageGroup = () => (_c().ageConfirmed === true ? (_c().ageGroup || "adult") : null);

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
  const bad = answer === "empty" && !month?.value ? month : year;
  // W5-17. The field in error says so, and names the message.
  for (const f of [month, year]) {
    if (!f) continue;
    if (f === bad) {
      f.setAttribute("aria-invalid", "true");
      const ids = (f.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean);
      if (err && !ids.includes(err.id)) f.setAttribute("aria-describedby", [...ids, err.id].join(" "));
    } else f.removeAttribute("aria-invalid");
  }
  bad?.focus();
}
