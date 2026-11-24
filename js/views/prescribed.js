/**
 * prescribed.js - My exercises
 *
 * 24 Nov 2026 v1.19
 *
 * v1.19 - P-46 S6 WORDS. The empty list says less (spec §7): Yours, kept
 *   as you wrote them; ones you've been given, or like to do. With
 *   exercises, the sore-area line is unchanged.
 *
 * v1.18 - P-45 THE LIVE LINK. Changes from a physio or trainer waiting
 *   (liveInbox): one row each, with when, and Look at them. Not tier-gated
 *   (verify-tiergh 14); only a Plan fills it.
 *
 * v1.17 - P-44 S4. Put back my old list: after a physio's or trainer's
 *   changes were used (the Plan), the list as it was, for 30 days
 *   (ownPrevious). Asks once before it replaces the list. Not tier-gated:
 *   their own list is free (verify-tiergh 14).
 *
 * v1.16 - OWN-DONE-TODAY (Graeme, 23 Nov: "It says I did these today but I
 *   didn't"). Done today is read through store.ownDoneToday(): ticked today
 *   only (the flag was never cleared).
 *
 * v1.15 - P-25 HOW-TO GUIDES. Guide markers only: Add a plan you already
 *   have (add-plan) and each list's Start (start-group). Nothing else
 *   changes.
 *
 * v1.14 - P-31 review (15 Nov). On Home's label carries the list's name as
 *   hidden text ("On Home: Kettle stretch"), so a screen reader moving
 *   between the choices hears which list each one is for (WCAG 2.4.6;
 *   the visible "On Home" still starts the name, 2.5.3). With more than
 *   three lists on Home, the status line says Home shows up to three at a
 *   time, so a fourth is not promised.
 *
 * v1.13 - P-31 LITTLE-AND-OFTEN (mock-up v5 approved by Graeme, 14 Nov). On
 *   the Plan, each named list has On Home, one labelled choice (a select,
 *   one row, so My exercises grows by one line a list): Not on Home, Any
 *   time, Mornings, Evenings (data/little-and-often.js). A list on Home
 *   shows under Little and often, one tap to play; at most three show at
 *   once. Saved as it changes, focus stays on it, and a status line says it.
 *   Free unchanged.
 *
 * 31 Oct 2026 v1.12
 *
 * v1.12 - STAGE PATH Session 9 (CLOSE; P-12 F2, F5; Graeme, 31 Oct: "‹
 *   Back", and this room taken in now rather than in P-13). On the Plan
 *   only: one way back, "‹ Back" at the top (it said "‹ Home", with Back to
 *   Home again at the foot; its spoken name still says Back to Home), no
 *   house beside it, the heading in the Plan's look, and + Add an exercise,
 *   Cancel and Add a plan you already have drawn as buttons (they were bare
 *   words). Free unchanged.
 *
 * 17 Oct 2026 v1.11
 *
 * v1.11 - D662-10 OLD-STARS (Graeme, 17 Oct: "is there any value here?
 *   Remove them"). "Up to +150 ⭐" is gone: it was the older per-move count,
 *   which nothing shows or uses; the social action credits are 1 or 2 a
 *   session (Settings › Community impact). As it was: BNH-Files,
 *   Archive/DEVICE-662/D662-10 old-stars.
 *
 * 17 Oct 2026 v1.10
 *
 * v1.10 - Graeme's device check of v662 (13 Oct; "Can we fix them now?",
 *   17 Oct). D662-4: a list in plan days is headed "Your exercises", not
 *   "To do today", and today's day comes first, marked "(today)". D662-5:
 *   the way back says Home, where it goes (it said "Back to choices").
 *   D662-7: "1 set", not "1 sets". The house button is not drawn here
 *   (router.js, D662-6): this screen has its own way home.
 *
 * 13 Oct 2026 v1.9
 *
 * v1.9 - A-7 EMPTY-AND-FIRST (Stage AWARD). Empty: a heading, "No exercises
 *   yet", and one line saying what goes here (it said "Add an exercise with
 *   the button below"). The Add button is the action, as before.
 *
 * v1.8 - D-7 PLAN-IMPORT. Exercises added from a plan carry their day
 *   (group: "Session A"); the list shows each day under its own heading
 *   with its own Start, which plays that day only (myExercisesGroup). The
 *   overall Start plays all of them. "Add a plan you already have" opens
 *   the import (plan-import.js).
 *
 * v1.7 - W4-15 DELETE-TRUE. No Notes box, and no notes kept, while the
 *   health consent is not given: notes on an exercise are often about an
 *   injury, and Delete my health answers removes them.
 *
 * v1.6 - BUNDLE-TRUE. Names, notes and who-prescribed are escaped wherever
 *   they are written into the page. A name typed with a quotation mark broke
 *   the card's label, and one from a crafted file could add an event handler
 *   (independent check of the Foot Anstey bundle).
 *
 * 29 Sep 2026 v1.5
 *
 * v1.5 - P0, SCOPE-MINOR (Graeme, 29 Sep). "Prescribed Exercises" is now
 *   "My exercises": the person's own list, from wherever they came -- a
 *   physio, a class, a video. The app does not build it, does not say who
 *   gave it, and does not say what it is for. Removed: "Prescribed by",
 *   "Physio notes" (now Notes), the "For: condition" tag, the Conditions
 *   Update tagging, and every professional-origin line. Graeme: "It is
 *   really just me writing down the exercises I want to do."
 *
 * 04 Aug 2026 v1.4
 *
 * v1.4 — Updated for conditionProgrammes.js v3's multi-condition
 *   entries. "For:" tag now reads via getEntryConditionIds() and
 *   lists every condition an entry serves, not just one. Manual
 *   "Build my own" additions now write conditionIds (array) instead
 *   of the old singular conditionId — no dedup/reuse detection for
 *   these (they're free-text, no exerciseId to match against; that
 *   mechanism only applies to coach-built/recommended entries).
 *
 * 04 Aug 2026 v1.3
 *
 * v1.3 — "Back to choices" no longer hardcoded to 'intention'. Real
 *   confusion Graeme flagged: this screen is now most commonly reached
 *   from Mobility & Conditioning's new landing page, not the old
 *   intention flow. Both back buttons now go to 'today' (Home) — a
 *   safe, correct destination regardless of which entry point was
 *   actually used, rather than guessing at one "true" origin.
 *
 * 04 Aug 2026 v1.2
 *
 * v1.2 — New entries can now carry a conditionId, read from the new
 *   single-use prescribedExercisesActiveCondition context flag (set
 *   by conditions-update.js right before navigating here, cleared the
 *   instant it's read so it can never tag a later, unrelated entry).
 *   Each exercise card now shows a small "For: [condition]" tag when
 *   one is set. Part of the same-day condition-programme build —
 *   see conditionProgrammes.js.
 *
 * 04 Aug 2026 v1.1
 *
 * v1.1 — Origin-aware coach voice (Phase D-2, decision D-2). Reached
 *   directly from Conditions Update's "Build your own" now (no
 *   prescription involved), so the two coach-line branches that
 *   assumed professional origin now check the new
 *   prescribedExercisesOrigin field and speak differently when self-
 *   built. Everything else unchanged — same file, same session flow,
 *   same credits.
 *
 * v1.0 — Dedicated full view for exercises prescribed by an external
 *   professional (physiotherapist, consultant, GP, specialist).
 *
 *   This is a separate space from coach-recommended workouts.
 *   The coach acknowledges this is not their territory and speaks
 *   accordingly — supportive, not directive.
 *
 *   Contains:
 *     - Coach card (warm, condition-aware, acknowledges external origin)
 *     - Exercise list with sets, reps/hold, notes, weekly completion history
 *     - Add exercise form: name, sets, reps/hold, notes, prescribed-by
 *     - Start Session button (navigates to prescribed-session.js)
 *     - Back to choices (top header link + bottom button) -> intention view
 *
 *   Route: 'prescribed'
 *   Nav: shown (user is in the main app, not mid-session)
 *
 *   Credits: 35 per exercise, max 150 per session (matches prescribed-session.js).
 */

import { store } from "../store.js";
import { planLook } from "../plan-look.js";
import { ON_HOME_CHOICES, onHomeFor, setOnHome, onHomeCount, MAX_ON_HOME_SHOWN } from "../data/little-and-often.js";
import { healthAllowed } from "../data/health-consent.js";

export const centered = false;

// ── View state ────────────────────────────────────────────────────────────────
let showAddForm = false;
let prevAsk = false;    // P-44 S4: Put back my old list, asked once
let prevSaid = "";

// ── Coach lines ───────────────────────────────────────────────────────────────

/**
 * Returns a coach line appropriate to the prescribed context.
 * The coach is supportive but clear that these exercises come from
 * the user's professional, not from the coach. Varies by state.
 *
 * 04 Aug 2026 — origin-aware (Phase D-2, decision D-2). Only two
 * branches actually reference professional origin; those two now
 * check prescribedExercisesOrigin and speak differently when the list
 * was self-built via Conditions Update rather than a genuine
 * prescription. Everything else (in-progress, done-today, low-energy)
 * was already origin-neutral, untouched.
 *
 * @param {Array}  exercises - full prescribedExercises array
 * @param {number} energy    - today's energy score
 * @param {string|null} origin - store.get('prescribedExercisesOrigin')
 */
function buildCoachLine(exercises, energy) {
  const active = exercises.filter(e => !store.ownDoneToday(e));
  const done   = exercises.filter(e => store.ownDoneToday(e));

  if (exercises.length === 0) {
    return "Yours, kept as you wrote them.";
  }
  if (done.length > 0 && active.length === 0) {
    return "That's all of them done today.";
  }
  if (done.length > 0 && active.length > 0) {
    return "You've done " + done.length + " so far today, " + active.length + " still here. No rush.";
  }
  if (energy !== null && energy <= 3) {
    return "Low energy today. Do what feels right \u2014 some of them, all of them, or none.";
  }
  return "Your exercises, as you set them. If something's sore today, I'll tell you which ones load it.";
}

// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  const exercises  = store.get("prescribedExercises") || [];
  const active     = exercises.filter(e => !store.ownDoneToday(e));
  const done       = exercises.filter(e => store.ownDoneToday(e));
  const checkin    = store.get("lastCheckin") || {};
  const energy     = checkin.energy || null;
  const coachLine  = buildCoachLine(exercises, energy);

  const plan = planLook(), quiet = plan ? "btn-secondary" : "btn-ghost";
  return `
    <div class="view prescribed-view${plan ? " is-plan" : ""}">

      <!-- ── Header with back link ────────────────────────────────────────── -->
      <div class="view-header prescribed-view-header">
        ${plan ? `<button class="btn btn-ghost btn-small prescribed-back-top plan-back"
                id="prescribed-back-top"
                aria-label="Back to Home">‹ Back</button>` : `<button class="btn btn-ghost btn-small prescribed-back-top"
                id="prescribed-back-top"
                aria-label="Back to Home">
          &lsaquo; Home
        </button>`}
        <h1>My exercises</h1>
      </div>

      <!-- ── Coach card ───────────────────────────────────────────────────── -->
      <div class="card card-coach">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">${coachLine}</p>
      </div>

      ${renderLiveInbox()}${renderPrevious()}<!-- ── Exercise list ────────────────────────────────────────────────── -->
      ${exercises.length === 0
        ? renderEmptyState()
        : renderExerciseList(active, done)
      }

      <!-- ── Add exercise form ────────────────────────────────────────────── -->
      <div class="prescribed-add-section" style="margin-top: var(--space-5);">
        <button class="btn ${quiet} btn-full" id="px-toggle-form-btn"
                aria-expanded="${showAddForm}"
                aria-controls="px-add-form-wrap">
          ${showAddForm ? "Cancel" : "+ Add an exercise"}
        </button>

        <div id="px-add-form-wrap" class="${showAddForm ? "" : "hidden"}" aria-live="polite">
          ${renderAddForm()}
        </div>
        <button class="btn ${quiet} btn-full" id="px-import-btn" data-guide-target="add-plan">Add a plan you already have</button>
      </div>

${plan ? "" : `      <!-- ── Bottom back button ───────────────────────────────────────────── -->
      <div style="margin-top: var(--space-6); margin-bottom: var(--space-4);">
        <button class="btn btn-ghost btn-full" id="prescribed-back-bottom"
                aria-label="Back to Home">
          Back to Home
        </button>
      </div>
`}
    </div>
  `;
}

// ── Empty state ───────────────────────────────────────────────────────────────

function renderEmptyState() {
  return `
    <section class="card prescribed-empty-card" aria-labelledby="prescribed-empty-h">
      <h2 id="prescribed-empty-h" class="prescribed-empty__h">No exercises yet</h2>
      <p class="text-secondary">Ones you’ve been given, or like to do.</p>
    </section>
  `;
}

// ── Exercise list ─────────────────────────────────────────────────────────────

function renderExerciseList(active, done) {
  return `
    <div class="prescribed-list-section">

      ${active.length > 0 ? `
        <div class="prescribed-list-header">
          <h2 class="section-heading">${groupsOf(active).some(g => g.name) ? "Your exercises" : "To do today"}</h2>
        </div>

        ${renderGroups(active)}

        <button class="btn ${groupsOf(active).some(g => g.name) ? "btn-secondary" : "btn-primary"} btn-large btn-full" id="px-start-session-btn"
                style="margin-top: var(--space-4);">
          ${groupsOf(active).some(g => g.name) ? "Start all of them" : "Start Session"}
        </button>
      ` : `
        <div class="card" role="note" style="margin-bottom: var(--space-4);">
          <p class="text-secondary">All done for today.</p>
        </div>
      `}

      ${done.length > 0 ? `
        <h2 class="section-heading" style="margin-top: var(--space-6);">Completed today</h2>
        <ul class="prescribed-exercise-list prescribed-exercise-list--done"
            aria-label="Completed today">
          ${done.map((ex, i) => renderExerciseCard(ex, i, true)).join("")}
        </ul>
      ` : ""}

    </div>
  `;
}

/** D-7. Today's exercises by plan day: [{ name|null, items }], ungrouped first. */
function groupsOf(list) {
  const out = [];
  for (const ex of list) {
    const name = ex.group || null;
    let g = out.find(x => x.name === name);
    if (!g) { g = { name, items: [] }; out.push(g); }
    g.items.push(ex);
  }
  // D662-4. Ungrouped first, then today's day, then the rest as written.
  const today = _todayName();
  const rank = g => (g.name === null ? 0 : _sameDay(g.name, today) ? 1 : 2);
  return out.sort((a, b) => rank(a) - rank(b));
}

const _DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function _todayName() { return _DAY_NAMES[new Date().getDay()]; }
/** "Tuesday", "tuesday", "Tue" all name Tuesday. */
function _sameDay(name, day) {
  const n = String(name || "").toLowerCase().replace(/[^a-z]/g, "");
  return n.length >= 3 && day.toLowerCase().startsWith(n);
}

function renderGroups(active) {
  const groups = groupsOf(active);
  if (!groups.some(g => g.name)) {
    return `<ul class="prescribed-exercise-list" aria-label="Your exercises to do today">
      ${active.map((ex, i) => renderExerciseCard(ex, i, false)).join("")}
    </ul>`;
  }
  return groups.map((g, gi) => `
    <section class="prescribed-group" aria-labelledby="px-group-${gi}">
      <h3 class="prescribed-group__name" id="px-group-${gi}">${_esc(g.name || "Your own")}${g.name && _sameDay(g.name, _todayName()) ? " (today)" : ""}</h3>
      <ul class="prescribed-exercise-list" aria-labelledby="px-group-${gi}">
        ${g.items.map((ex, i) => renderExerciseCard(ex, i, false)).join("")}
      </ul>
      ${g.name ? `<button class="btn btn-primary btn-full prescribed-group__start" data-px-group="${_esc(g.name)}" data-guide-target="start-group">Start ${_esc(g.name)}</button>` : ""}
      ${g.name && planLook() ? renderOnHome(g.name, gi) : ""}
    </section>`).join("") + (planLook() ? `<p class="sr-only" role="status" id="px-onhome-status"></p>` : "");
}

/** P-31. On Home: whether this list shows on Home under Little and often, and when. */
function renderOnHome(name, gi) {
  const now = onHomeFor(name);
  return `<div class="px-onhome">
      <label class="px-onhome__label" for="px-onhome-${gi}">On Home<span class="sr-only">: ${_esc(name)}</span></label>
      <select class="px-onhome__select" id="px-onhome-${gi}" data-px-onhome="${_esc(name)}">
        ${ON_HOME_CHOICES.map(c => `<option value="${c.id}"${now === c.id ? " selected" : ""}>${c.label}</option>`).join("")}
      </select>
    </div>`;
}

/**
 * Render a single prescribed exercise card.
 * Shows: name, sets x reps/hold, notes from physio, prescribed-by,
 * weekly completion count (how many times done this week).
 *
 * @param {object}  ex       - prescribed exercise object from store
 * @param {number}  index    - position in list (for aria labels)
 * @param {boolean} isDone   - whether completed today
 */
/** BUNDLE-TRUE. Text the person typed (or a file brought) is text, never markup. */
function _esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderExerciseCard(ex, index, isDone) {
  const weeklyCount = getWeeklyCompletionCount(ex.id);
  const prescriptionStr = formatPrescription(ex);

  return `
    <li class="prescribed-exercise-card ${isDone ? "prescribed-exercise-card--done" : ""}"
        aria-label="${_esc(ex.name)}${isDone ? ", completed" : ""}">

      <div class="prescribed-exercise-top">
        <div class="prescribed-exercise-name-wrap">
          ${isDone
            ? `<span class="prescribed-done-tick" aria-hidden="true">&#10003;</span>`
            : ""}
          <span class="prescribed-exercise-name">${_esc(ex.name)}</span>
        </div>
        ${!isDone ? `
          <button class="btn btn-ghost btn-xs prescribed-remove-btn"
                  data-exercise-id="${_esc(ex.id)}"
                  aria-label="Remove ${_esc(ex.name)} from my exercises">
            Remove
          </button>
        ` : ""}
      </div>

      ${prescriptionStr ? `
        <p class="prescribed-exercise-prescription text-sm text-muted">
          ${_esc(prescriptionStr)}
        </p>
      ` : ""}

      ${ex.notes ? `
        <div class="prescribed-exercise-notes">
          <span class="prescribed-notes-label text-sm">Notes:</span>
          <p class="text-sm">${_esc(ex.notes)}</p>
        </div>
      ` : ""}

      <div class="prescribed-exercise-history text-sm text-muted"
           aria-label="Completed ${weeklyCount} time${weeklyCount === 1 ? "" : "s"} this week">
        This week: ${renderWeekDots(weeklyCount)}
        <span class="sr-only">${weeklyCount} session${weeklyCount === 1 ? "" : "s"} completed this week</span>
      </div>

    </li>
  `;
}

/**
 * Format the sets/reps prescription as a readable string.
 * Handles: sets x reps, hold time, sets only, reps only.
 */
function formatPrescription(ex) {
  const parts = [];
  if (ex.sets) parts.push(ex.sets + (Number(ex.sets) === 1 ? " set" : " sets"));
  if (ex.reps) parts.push(ex.reps);
  return parts.join(" x ");
}

/**
 * Render small dot indicators for weekly completion.
 * 7 dots, filled for each session completed this week.
 * Max 7 displayed regardless of actual count.
 */
function renderWeekDots(count) {
  const max   = 7;
  const dots  = [];
  for (let i = 0; i < max; i++) {
    dots.push(
      `<span class="week-dot ${i < count ? "week-dot--filled" : ""}" aria-hidden="true"></span>`
    );
  }
  return `<span class="week-dots" aria-hidden="true">${dots.join("")}</span>`;
}

/**
 * Count how many times a prescribed exercise has been completed this week.
 * Reads from activityLog entries where type === "prescribed-session"
 * and the date falls within the current ISO week (Mon-Sun).
 *
 * Note: prescribed-session.js marks individual exercises completedToday
 * but does not write per-exercise history to activityLog yet.
 * Until Phase 4 adds that, we count workout-complete navigations from
 * prescribed sessions using lastWorkoutName in store.
 *
 * For now: count days this week where completedToday was true for this exercise.
 * This is approximated from the prescribedExercises completedAt timestamps.
 */
function getWeeklyCompletionCount(exerciseId) {
  const exercises = store.get("prescribedExercises") || [];
  const ex = exercises.find(e => e.id === exerciseId);
  if (!ex?.completedAt) return 0;

  // Count unique calendar days this week that have a completedAt for this exercise.
  // completedAt is a single ISO timestamp (last completion).
  // Phase 4 will extend this to a full history array per exercise.
  const completed = new Date(ex.completedAt);
  const now       = new Date();
  const weekStart = getWeekStart(now);

  if (completed >= weekStart) return 1;
  return 0;
}

function getWeekStart(date) {
  const d   = new Date(date);
  const day = d.getDay();
  // ISO week: Monday = start
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ── Add form ──────────────────────────────────────────────────────────────────

function renderAddForm() {
  return `
    <form id="px-add-form" class="prescribed-add-form" novalidate
          aria-label="Add an exercise">

      <div class="form-field" style="margin-top: var(--space-4);">
        <label class="form-label" for="px-name">
          Exercise name <span class="form-required" aria-hidden="true">*</span>
        </label>
        <input
          type="text"
          id="px-name"
          class="form-input"
          placeholder="e.g. Calf raises, Single leg deadlift"
          required
          aria-required="true"
          autocomplete="off"
        >
      </div>

      <div class="form-row">
        <div class="form-field form-field-half">
          <label class="form-label" for="px-sets">Sets</label>
          <input
            type="number"
            id="px-sets"
            class="form-input"
            placeholder="3"
            min="1"
            max="20"
            inputmode="numeric"
          >
        </div>
        <div class="form-field form-field-half">
          <label class="form-label" for="px-reps">Reps or hold time</label>
          <input
            type="text"
            id="px-reps"
            class="form-input"
            placeholder="10 or 30s or 2 min"
            autocomplete="off"
          >
        </div>
      </div>

      ${healthAllowed() ? `
      <div class="form-field">
        <label class="form-label" for="px-notes">Notes</label>
        <textarea
          id="px-notes"
          class="form-input form-textarea"
          rows="2"
          placeholder="Instructions, what to watch for, how it should feel..."
        ></textarea>
      </div>` : ""}


      <p class="form-required-note text-sm text-muted">
        <span aria-hidden="true">*</span> Required
      </p>

      <div class="prescribed-form-actions">
        <button type="submit" class="btn btn-primary btn-full">
          Add Exercise
        </button>
      </div>

    </form>
  `;
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {
  // ── Auto-open form from checkin shortcut ───────────────────────────────────
  // checkin.js shortcut sets this flag. Consume once then clear.
  const shouldAutoOpen = store.get("openPrescribedForm");
  if (shouldAutoOpen) {
    store.set("openPrescribedForm", false);
    showAddForm = true;
    rerender();
    return; // rerender calls onMount again
  }

  // ── Back buttons ──────────────────────────────────────────────────────────
  // Fix, 04 Aug 2026: was hardcoded to 'intention' — confusing, since
  // this screen is now most commonly reached from Mobility &
  // Conditioning's landing page, not the old intention flow. 'today'
  // (Home) is always a safe, correct destination regardless of which
  // of this screen's several entry points was actually used, rather
  // than guessing at a single "true" origin.
  document.getElementById("prescribed-back-top")?.addEventListener("click", () => {
    router.navigate("today");
  });
  document.getElementById("prescribed-back-bottom")?.addEventListener("click", () => {
    router.navigate("today");
  });

  // ── P-45. Changes waiting from a live link ──────────────────────────────────
  document.querySelectorAll("[data-px-live]").forEach(b => b.addEventListener("click", () => {
    const m = (store.get("liveInbox") || []).find(x => `${x.link}:${x.msg}` === b.dataset.pxLive);
    if (!m) return;
    router.planBack = m.code; router.planBackInbox = b.dataset.pxLive;
    router.navigate("plan-link-back");
  }));

  // ── P-44 S4. Put back my old list ────────────────────────────────────────
  document.getElementById("px-prev-btn")?.addEventListener("click", () => {
    prevAsk = true; prevSaid = ""; rerender(); document.getElementById("px-prev-yes")?.focus();
  });
  document.getElementById("px-prev-no")?.addEventListener("click", () => {
    prevAsk = false; rerender(); document.getElementById("px-prev-btn")?.focus();
  });
  document.getElementById("px-prev-yes")?.addEventListener("click", () => {
    const prev = store.get("ownPrevious");
    if (prev) { store.set("prescribedExercises", prev.list); store.setOwnPrevious(null); }
    prevAsk = false; prevSaid = "Your list is as it was before the changes.";
    rerender(); document.getElementById("px-prev-h")?.focus();
    prevSaid = "";
  });

  // ── Start session ─────────────────────────────────────────────────────────
  document.getElementById("px-start-session-btn")?.addEventListener("click", () => {
    store.set("myExercisesGroup", null);   // D-7: all of them
    router.navigate("prescribed-session");
  });
  // D-7. One plan day.
  document.querySelectorAll("[data-px-group]").forEach(btn => btn.addEventListener("click", () => {
    store.set("myExercisesGroup", btn.dataset.pxGroup);
    router.navigate("prescribed-session");
  }));
  document.getElementById("px-import-btn")?.addEventListener("click", () => router.navigate("plan-import"));
  // P-31. On Home: one choice per list, saved as it changes; focus stays on it.
  document.querySelectorAll("[data-px-onhome]").forEach(sel => sel.addEventListener("change", () => {
    const name = sel.dataset.pxOnhome;
    setOnHome(name, sel.value);
    const label = sel.options[sel.selectedIndex]?.text || "";
    const status = document.getElementById("px-onhome-status");
    const more = sel.value !== "off" && onHomeCount() > MAX_ON_HOME_SHOWN ? " Home shows up to three at a time." : "";
    if (status) status.textContent = sel.value === "off" ? `${name} is not on Home.` : `${name} is on Home, ${label.toLowerCase()}.${more}`;
  }));

  // ── Toggle add form ───────────────────────────────────────────────────────
  document.getElementById("px-toggle-form-btn")?.addEventListener("click", () => {
    showAddForm = !showAddForm;
    rerender();
  });

  // ── Form submission ───────────────────────────────────────────────────────
  document.getElementById("px-add-form")?.addEventListener("submit", e => {
    e.preventDefault();
    saveExercise();
  });

  // ── Remove exercise ───────────────────────────────────────────────────────
  document.querySelectorAll(".prescribed-remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.exerciseId;
      if (!id) return;
      removeExercise(id);
    });
  });
}

// ── Actions ───────────────────────────────────────────────────────────────────

function saveExercise() {
  const nameEl         = document.getElementById("px-name");
  const setsEl         = document.getElementById("px-sets");
  const repsEl         = document.getElementById("px-reps");
  const notesEl        = document.getElementById("px-notes");

  const name = nameEl?.value?.trim();
  if (!name) {
    nameEl?.setCustomValidity("Please enter an exercise name.");
    nameEl?.reportValidity();
    return;
  }
  if (nameEl) nameEl.setCustomValidity("");

  const sets        = setsEl?.value        ? parseInt(setsEl.value)         : null;
  const reps        = repsEl?.value?.trim()         || null;
  const notes       = healthAllowed() ? (notesEl?.value?.trim() || null) : null;

  const exercise = {
    id:             "px-" + Date.now(),
    exerciseId:     null,
    name,
    description:    "",
    frequency:      "",
    active:         true,
    completedToday: false,
    completedAt:    null,
    addedAt:        new Date().toISOString(),
    ...(sets            !== null ? { sets }                    : {}),
    ...(reps            !== null ? { reps }                    : {}),
    ...(notes           !== null ? { notes }                   : {}),
  };

  const existing = store.get("prescribedExercises") || [];
  store.set("prescribedExercises", [...existing, exercise]);

  showAddForm = false;
  rerender();
}

/**
 * Remove a prescribed exercise after confirmation.
 * Health data — always confirms before deleting.
 */
function removeExercise(id) {
  const exercises = store.get("prescribedExercises") || [];
  const ex = exercises.find(e => e.id === id);
  if (!ex) return;

  if (!confirm("Remove \"" + ex.name + "\" from your exercises?")) return;

  store.set("prescribedExercises", exercises.filter(e => e.id !== id));
  rerender();
}

/** P-45. Changes sent through a live link, waiting to be looked at. */
function renderLiveInbox() {
  const waiting = store.get("liveInbox") || [];
  if (!waiting.length) return "";
  const day = iso => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long" });
  return `<section class="card px-prev" aria-labelledby="px-live-h">
    <h2 class="section-heading" id="px-live-h">Changes from your physio or trainer</h2>
    <ul class="px-live__list">${waiting.slice().reverse().map(m => `<li><span>Sent ${day(m.at)}</span>
      <button class="btn btn-primary" data-px-live="${_esc(`${m.link}:${m.msg}`)}">Look at them<span class="sr-only">, sent ${day(m.at)}</span></button></li>`).join("")}</ul>
  </section>`;
}

/** P-44 S4. The list before a professional's changes were used, for 30 days. */
function renderPrevious() {
  // Not tier-gated (verify-tiergh 14: a person's own list is free). Only the
  // Plan can use a professional's changes, so only a Plan writes ownPrevious;
  // a list kept from before someone left the Plan is still theirs to put back.
  const prev = store.get("ownPrevious");
  if (!prev && !prevSaid) return "";
  const until = prev ? new Date(Date.parse(prev.at) + store.OWN_PREVIOUS_DAYS * 864e5).toLocaleDateString("en-GB", { day: "numeric", month: "long" }) : "";
  return `<section class="card px-prev" aria-labelledby="px-prev-h">
    ${prev ? `<h2 class="section-heading" id="px-prev-h" tabindex="-1">Your list before the last changes</h2>
    <p>Kept until ${until}, in case you want it back.</p>
    ${prevAsk ? `<p><strong>Put back your old list?</strong> Your list now will be replaced by it.</p>
      <div class="px-prev__acts"><button class="btn btn-primary" id="px-prev-yes">Yes, put it back</button>
      <button class="btn btn-secondary" id="px-prev-no">Cancel</button></div>`
      : `<button class="btn btn-secondary" id="px-prev-btn">Put back my old list</button>`}`
    : `<h2 class="section-heading" id="px-prev-h" tabindex="-1">Your old list is back</h2>`}
    <p class="sh-status" id="px-prev-status" role="status" aria-live="polite">${prevSaid}</p>
  </section>`;
}

function rerender() {
  const main = document.getElementById("main-content");
  if (main) {
    main.innerHTML = render();
    onMount();
  }
}
