/**
 * js/views/noticing.js - Wellbeing Hub Landing View
 *
 * 04 Oct 2026 v12 - LOOK-4 (Graeme approved the mock-up, 04 Oct). Suggested
 *   now is a green card with its tile and a green Start; This week's
 *   question is a card; the four practices are a two-by-two grid of tiles
 *   (line icons for the emoji); your reflections and the support lines
 *   are cards. Ids, labels, words and behaviour unchanged.
 *
 * 03 Oct 2026 v11 - W5-21 SMALL-5. Every journal entry can be read: the newest
 *   three show, and Show all N entries shows the rest; each in full (it was
 *   cut at 120 characters with no way to read on).
 *
 * 02 Oct 2026 v10 - W4-20 and W4-21. This week's question changes with the week
 *   (counted from createdAt; noticingWeekInCycle was never advanced).
 *   Saving a journal entry says Saved to your journal, once. An entry saved
 *   with Can't find the words says so beside its date. Mindful movement is
 *   Mindful awareness (sitting and breathing practices).
 *
 * 01 Oct 2026 v9 - SIGNPOST-STATIC. "If you need to talk to someone" at the foot of
 *   Wellbeing, always, the same for everybody (data/support-lines.js).
 *
 * 01 Oct 2026 v8 - PT-2 HEALTH-CONSENT. Each of Your reflections can be
 *   deleted: Delete, then Delete it / Keep it, and "Entry deleted." is said.
 *   Only that entry goes (store.deleteJournalEntry). Entry text is escaped.
 *
 * 28 Sep 2026 v7 - SMOOTH-P4b. Spec 4.9.
 *   The heading says Wellbeing. One coach line, read from TODAY'S CHECK-IN
 *   ONLY, and a "Suggested now" card: one breathing practice, a length,
 *   and Start -- which begins it in one tap. Then This week's question
 *   and Anytime as before; the Journal tile says what it is ("Write
 *   anything. Only you can read it.").
 *
 *   ⚫ THE SUGGESTION NEVER READS THE JOURNAL. suggestNow() takes the
 *   check-in as its only argument and is exported so a gate can prove it:
 *   the Journal Privacy Rule (Appendix D) -- no analysis, no monitoring,
 *   no exceptions -- applies to the coach choosing a practice as much as
 *   to anything else. Nothing here reads journal TEXT; the count of
 *   entries under "Your reflections" is unchanged.
 *
 * 28 Sep 2026 v6 - C4 (Smooth Path P0). The weekly card was labelled with
 *   its internal theme name ("Personal Capacity", "Interdependence"...).
 *   It now reads "This week's question". The theme is still recorded
 *   with the entry (line ~152); it is simply not shown as a label.
 *
 * 13 Aug 2026 - TIER-F. Screen-reader heading follows the nav label.
 *
 * 10 Aug 2026 v5:
 *   - Fixed two real field-name-mismatch bugs in "Your reflections",
 *     found and fixed overnight (Claude, autonomous session). Since
 *     journal-entry.js v3's privacy rewrite (14 Jul), entries have been
 *     written as {id, date, text, tags, noWords} -- but this file was
 *     still reading entry.createdAt (undefined), entry.category
 *     (undefined, real field is the tags array), entry.body (undefined,
 *     real field is text), and entry.type === "weekly-noticing" (never
 *     written anywhere, always false). Two consequences, both silent:
 *     (1) getRecentEntries()'s sort compared new Date(undefined) for
 *     every entry -- NaN vs NaN, meaning entries were never actually
 *     sorted by recency, just left in original array order; (2) the
 *     display itself showed blank/undefined date and body text for
 *     every entry. Fixed both to read the real fields. Dropped the
 *     dead "This week" badge (entry.type check, confirmed always
 *     false, not a guess) rather than inventing a working version of
 *     a concept that was never actually wired up.
 *   - journalEntryType pre-select (referenced in this file's older
 *     docblock, "New \"In Step\" card" section below) confirmed still
 *     dormant -- journal-entry.js's v3 rewrite dropped the whole
 *     pre-selected-screen mechanism, not just the field read. Fixing
 *     that properly means designing what a type-specific screen should
 *     look like, a real product decision -- not attempted tonight,
 *     left for Graeme rather than guessed at. Master schedule note
 *     corrected to reflect the true (larger) scope.
 *
 * 09 Aug 2026 v4:
 *   - New "In Step" card in Anytime, Personal tier. Uses auth.js's
 *     lockedFeature() wrapper for free users (tap -> /upgrade), matching
 *     the pattern already established elsewhere rather than inventing a
 *     new locked-state treatment for this one card.
 *
 * 21 Jun 2026 v3 (S4-13/14):
 *   - Journal card wired to "journal-entry" route. Removes the "on its
 *     way" placeholder. Card is now a tappable button matching the
 *     breathing and mindful movement cards.
 *   - "This week" prompt card gains a "Write about this" button that
 *     navigates to journal-entry and pre-selects the weekly-noticing
 *     type by setting a store flag (journalEntryType).
 *   - Mindful movement description updated: "5, 10, 15, or 20 minutes"
 *     (was "5, 10, or 15 minutes" — quiet-session.js v3 added the 20-min
 *     option with correctly-summing exercise durations).
 *   - "Your reflections" section now active for all users (was already
 *     built in v2 but only visible when entries existed — no change
 *     needed, this renders automatically from journalEntries array).
 *
 * 15 Jun 2026 v2 (S4-9/10) - Activated the Noticing tab properly:
 *   - Breathing card now navigates to breathing-session.js.
 *   - NEW: Mindful Movement card, launched via quiet-session.js's
 *     "mindful" mode.
 *   - "Journal and reflect" card and the "This Week > Reflect on this"
 *     button both treated as warm "on its way" placeholders until
 *     S4-13/14 builds journal-entry.js properly against the array schema.
 *
 * 21 May 2026 v1
 *
 * The Noticing Hub is the wellbeing layer of Alongside: Move.
 * Route: "noticing"
 * Nav: visible (fourth tab)
 */

import { supportLinesHTML } from "../data/support-lines.js";
import { lineIcon } from "../data/line-icons.js";
import { store }  from "../store.js";
import { router } from "../router.js";
import { getTodaysCheckin } from "../data/checkin.js";
import { startBreathing, BREATHING_TYPES } from "./breathing-session.js";
// In Step became free on 12 Aug 2026 (Destination Architecture sections
// 9 and 18), and it was the only gated card on this screen -- so
// isPremium() and lockedFeature() are no longer used here. Removed rather
// than left as unused imports.

export const centered = false;

// PT-2. Which entry is asking "Delete this entry?", and what was just said.
let pendingJournalDelete = null;
let journalStatus = "";
let _allJournal = false;   // W5-21: Show all entries
// W4-21. Said once, on the next Wellbeing screen, after a save.
let _savedOnce = false;
export function noteJournalSaved() { journalStatus = "Saved to your journal."; _savedOnce = true; }
const _escText = t => String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// ── Weekly noticing prompt data ───────────────────────────────────────────────

const WEEKLY_PROMPTS = [
  {
    week:  1,
    theme: "Personal Capacity",
    variants: {
      steady:     "What did you bring to your movement this week that you didn't know you had?",
      energetic:  "What surprised you about yourself in motion this week?",
      nurturing:  "What did your body ask for this week, and how did you respond?",
      minimal:    "What did you notice about your capacity this week?"
    }
  },
  {
    week:  2,
    theme: "Interdependence",
    variants: {
      steady:     "Who or what made movement possible for you this week? What did you rely on?",
      energetic:  "What around you — people, places, things — helped you keep moving?",
      nurturing:  "Who held space for you this week, even without knowing it?",
      minimal:    "What supported you in moving this week?"
    }
  },
  {
    week:  3,
    theme: "Mood and Relational",
    variants: {
      steady:     "Movement shifts something in you. This week, did that show up in how you were with others?",
      energetic:  "Did moving change how you showed up for the people around you this week?",
      nurturing:  "How is your body feeling now, and how does that connect to how you've been with others?",
      minimal:    "Did moving shift how you were with others?"
    }
  },
  {
    week:  4,
    theme: "Nature and Ecological Belonging",
    variants: {
      steady:     "Movement happens in a world. This week — whether you moved outside or inside — what did you notice? Weather, light, ground, air, seasons.",
      energetic:  "What did the world around you show you this week while you moved?",
      nurturing:  "The earth was beneath you, or the air around you. What did you notice about being alive in that world?",
      minimal:    "What did you notice about the world around you?"
    }
  },
  {
    week:  5,
    theme: "Values and Meaning",
    variants: {
      steady:     "You showed up this week even when it was difficult. What does that commitment say about what you value?",
      energetic:  "You kept moving even when it was hard. What does that say about what you care about?",
      nurturing:  "You cared for yourself this week, even in difficulty. What does that tell you about what matters to you?",
      minimal:    "What does your commitment this week say about what you value?"
    }
  },
  {
    week:  6,
    theme: "Reciprocal Care and Empathy Transfer",
    variants: {
      steady:     "As you've learned to meet your own struggle with patience instead of judgment, something shifts. Have you noticed yourself responding to others' difficulties differently?",
      energetic:  "You've been kind to yourself through difficulty this week. Has that changed how you see others' struggles?",
      nurturing:  "You've met yourself with gentleness. When you see others struggling, do you meet them differently now?",
      minimal:    "Has caring for yourself changed how you see others' struggles?"
    }
  }
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCoachStyle() {
  return store.get("coachStyle") || "steady";
}

/**
 * W4-21 (Wave 4, 2.11). This week's question changes with the week: it
 * read noticingWeekInCycle, which nothing ever advanced, so it was the
 * same question for ever. Now weeks are counted from when the person
 * started (createdAt), Monday to Sunday, round the six.
 */
const WEEK_MS = 7 * 86400000;
function _mondayOf(d) {
  const m = new Date(d); m.setHours(0, 0, 0, 0);
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return m.getTime();
}
export function currentWeekQuestion(now = new Date()) { return getCurrentWeekPrompt(now); }

function getCurrentWeekPrompt(now = new Date()) {
  const start = Date.parse(store.get("createdAt") || "") || now.getTime();
  const n     = Math.max(0, Math.round((_mondayOf(now) - _mondayOf(new Date(start))) / WEEK_MS));
  const week  = n % WEEKLY_PROMPTS.length;
  const entry = WEEKLY_PROMPTS[week];
  const style = getCoachStyle();
  return {
    theme:  entry.theme,
    prompt: entry.variants[style] || entry.variants.steady,
    week:   entry.week
  };
}

function getRecentEntries(limit = 3) {
  const entries = store.get("journalEntries") || [];
  return [...entries]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

// ── SMOOTH-P4b. Suggested now ─────────────────────────────────────────────────

/**
 * One practice, and the coach's line for it, from today's check-in ONLY.
 *
 * The argument is the whole input. Energy and mood use the check-in's own
 * 1-10 scale (checkin.js chips: Low 3, Struggling 2, Okay 6, Good 7...).
 * Nothing claims what a practice will do to anybody's body (C1): each
 * line says what it is and leaves it at "might help".
 */
export function suggestNow(checkin) {
  const e = Number(checkin?.energy), m = Number(checkin?.mood);
  const has = Number.isFinite(e) || Number.isFinite(m);
  if (!has) {
    return { type: "box", mins: 3,
      line: "Whenever you want a few minutes to settle, this is here." };
  }
  if (Number.isFinite(m) && m <= 3) {
    return { type: "exhale", mins: 3,
      line: "You said today's been heavy going. Three minutes of slow breathing might help settle it." };
  }
  if (Number.isFinite(e) && e <= 3) {
    return { type: "resonance", mins: 3,
      line: "You said your energy is low today. Slow, even breathing asks nothing of you." };
  }
  if (Number.isFinite(e) && e >= 7 && Number.isFinite(m) && m >= 7) {
    return { type: "box", mins: 3,
      line: "You said you're feeling good today. A few even breaths is a way to notice it." };
  }
  return { type: "box", mins: 3,
    line: "You checked in today. Three minutes of box breathing is here if it helps." };
}

// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  const shownStatus = journalStatus;
  if (_savedOnce) { journalStatus = ""; _savedOnce = false; }
  const name          = store.get("name") || "";
  const weekData      = getCurrentWeekPrompt();
  const recentEntries = getRecentEntries(_allJournal ? Infinity : 3);
  const totalEntries  = (store.get("journalEntries") || []).length;
  // The check-in, and nothing else. See suggestNow().
  const sug     = suggestNow(getTodaysCheckin());
  const sugType = BREATHING_TYPES.find(t => t.id === sug.type) || BREATHING_TYPES[0];

  return `
    <div class="view noticing-view">

      <!-- TIER-F, 13 Aug 2026. Screen-reader heading follows the nav
           label and the Home door, both of which say Wellbeing. A
           sighted user never saw this heading, so it had drifted
           unnoticed -- but it is the FIRST thing a screen-reader user
           hears on arriving, and hearing "Noticing" after tapping
           "Wellbeing" is precisely the two-features-one-destination
           confusion this change exists to remove. -->
      <div class="view-header">
        <h1 class="wb-title">Wellbeing</h1>
        <p class="wb-coach">${sug.line}</p>
      </div>

      <!-- SMOOTH-P4b. One practice, one tap. -->
      <section class="card wb-suggest k-green" aria-labelledby="wb-suggest-h">
        <div class="wb-suggest__head">
          <span class="kind-tile kind-tile--lg">${lineIcon("breath", 26)}</span>
          <div>
            <h2 class="wb-suggest__kicker" id="wb-suggest-h">Suggested now</h2>
            <p class="wb-suggest__name">${sugType.label} \u00b7 ${sug.mins} min</p>
          </div>
        </div>
        <p class="wb-suggest__desc">${sugType.description}</p>
        <button class="btn btn-primary btn-full" id="wb-start"
                aria-label="Start ${sugType.label}, ${sug.mins} minutes">Start</button>
      </section>

      <!-- ── This Week ────────────────────────────────────────── -->
      <section class="noticing-section" aria-labelledby="this-week-heading">
        <h2 class="section-label" id="this-week-heading"
            style="color: var(--color-primary); font-size: var(--text-lg);
                   font-weight: var(--font-semibold); margin-bottom: var(--space-3);">
          This week
        </h2>

        <div class="card wb-question" style="margin-bottom: var(--space-2);">
          <p class="text-xs text-muted" style="margin-bottom: var(--space-2);">This week's question</p>
          <p style="font-size: var(--text-base); line-height: 1.6;
                    margin-bottom: var(--space-4);">${weekData.prompt}</p>
          <button class="btn btn-ghost btn-small" id="noticing-weekly-journal-btn"
                  style="align-self: flex-start;"
                  aria-label="Write about this week's prompt">
            Write about this
          </button>
        </div>
      </section>

      <!-- ── Anytime ──────────────────────────────────────────── -->
      <section class="noticing-section" aria-labelledby="anytime-heading">
        <h2 class="section-label" id="anytime-heading"
            style="color: var(--color-primary); font-size: var(--text-lg);
                   font-weight: var(--font-semibold); margin: var(--space-5) 0 var(--space-3);">
          Anytime
        </h2>

        <!-- LOOK-4. Four practices as tiles. IN STEP IS FREE (Destination
             Architecture, 12 Aug 2026, sections 9 and 18): everything in
             Wellbeing is free; the paid thing is the long version, never this. -->
        <div class="wb-practices">
          <button class="wb-practice k-green" id="noticing-breathe-btn"
                  aria-label="Breathing exercises — five types, any duration">
            <span class="kind-tile">${lineIcon("breath")}</span>
            <span class="wb-practice__name">Breathing</span>
            <span class="wb-practice__sub">Five types. Any duration.</span>
          </button>

          <button class="wb-practice k-green" id="noticing-mindful-btn"
                  aria-label="Mindful awareness — five, ten, fifteen, or twenty minute guided sessions">
            <span class="kind-tile">${lineIcon("mind")}</span>
            <span class="wb-practice__name">Mindful awareness</span>
            <span class="wb-practice__sub">5, 10, 15, or 20 minutes. Guided, with a timer.</span>
          </button>

          <button class="wb-practice k-green" id="noticing-journal-btn"
                  aria-label="Journal — write anything. Only you can read it.">
            <span class="kind-tile">${lineIcon("pencil")}</span>
            <span class="wb-practice__name">Journal</span>
            <span class="wb-practice__sub">Write anything. Only you can read it.</span>
          </button>

          <button class="wb-practice k-green" id="noticing-in-step-btn"
                  aria-label="In Step \u2014 short scenarios, three ways to respond, no right step">
            <span class="kind-tile">${lineIcon("instep")}</span>
            <span class="wb-practice__name">In Step</span>
            <span class="wb-practice__sub">Short scenarios. Three ways to respond. No right step.</span>
          </button>
        </div>
      </section>

      <!-- ── Your Reflections ─────────────────────────────────── -->
      ${totalEntries > 0 ? `
        <section class="noticing-section wb-reflections" aria-labelledby="reflections-heading"
                 style="margin-top: var(--space-5);">
          <div style="display: flex; align-items: center; justify-content: space-between;
                      margin-bottom: var(--space-3);">
            <h2 class="section-label" id="reflections-heading"
                style="color: var(--color-primary); font-size: var(--text-lg);
                       font-weight: var(--font-semibold);">
              Your reflections
            </h2>
            ${totalEntries > 3
              ? `<span class="text-sm text-muted">${totalEntries} entries</span>`
              : ""}
          </div>

          <p class="sr-only" id="journal-status" role="status" aria-live="polite">${_escText(shownStatus)}</p>
          ${shownStatus ? `<p class="text-sm text-muted" aria-hidden="true">${_escText(shownStatus)}</p>` : ""}
          <div style="display: flex; flex-direction: column; gap: var(--space-2);">
            ${recentEntries.map(entry => `
              <div class="card" role="article">
                <div style="display: flex; align-items: center; gap: var(--space-2);
                            margin-bottom: var(--space-2);">
                  <span class="text-xs text-muted">${formatDate(entry.date)}${entry.noWords ? " · Saved without words" : ""}</span>
                  ${entry.tags && entry.tags.length > 0
                    ? `<span class="text-xs text-muted"
                             style="background: var(--color-surface-raised, rgba(255,255,255,0.06));
                                    padding: 2px 8px; border-radius: 10px;">
                         ${entry.tags[0]}
                       </span>`
                    : ""}
                </div>
                <p class="text-secondary" style="font-size: var(--text-sm); line-height: 1.6; white-space: pre-line;">${_escText(entry.text || "")}</p>
                ${pendingJournalDelete === entry.id ? `
                  <div class="journal-delete" role="group" aria-labelledby="jd-q-${_escText(entry.id)}">
                    <p class="text-sm" id="jd-q-${_escText(entry.id)}">Delete this entry? It can’t be undone.</p>
                    <button class="btn btn-danger btn-small" data-journal-delete-yes="${_escText(entry.id)}">Delete it</button>
                    <button class="btn btn-ghost btn-small" data-journal-delete-no="${_escText(entry.id)}">Keep it</button>
                  </div>` : `
                  <button class="btn btn-ghost btn-small" data-journal-delete="${_escText(entry.id)}"
                          aria-label="Delete the entry from ${_escText(formatDate(entry.date))}">Delete</button>`}
              </div>
            `).join("")}
          </div>
          ${totalEntries > 3 ? `
            <button class="btn btn-ghost btn-small" id="journal-show-all" aria-expanded="${_allJournal}"
                    style="margin-top: var(--space-2);">${_allJournal ? "Show the newest three" : `Show all ${totalEntries} entries`}</button>` : ""}
        </section>
      ` : `
        <p class="text-secondary text-sm" style="margin-top: var(--space-5);" ${shownStatus ? 'role="status"' : ''}>
          ${shownStatus ? _escText(shownStatus) + " " : ""}Your reflections will appear here after your first journal entry.
        </p>
      `}

      ${supportLinesHTML("wb-support")}

    </div>
  `;
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {
  // PT-2. Deleting a journal entry: ask, then delete only that one.
  const _repaint = focusSel => {
    const main = document.getElementById("main-content");
    if (!main) return;
    main.innerHTML = render(); onMount();
    if (focusSel) main.querySelector(focusSel)?.focus();
  };
  document.getElementById("journal-show-all")?.addEventListener("click", () => {
    _allJournal = !_allJournal; _repaint("#journal-show-all");
  });
  document.querySelectorAll("[data-journal-delete]").forEach(b => b.addEventListener("click", () => {
    pendingJournalDelete = b.dataset.journalDelete; journalStatus = "";
    _repaint(`[data-journal-delete-no="${pendingJournalDelete}"]`);
  }));
  document.querySelectorAll("[data-journal-delete-no]").forEach(b => b.addEventListener("click", () => {
    const id = b.dataset.journalDeleteNo; pendingJournalDelete = null;
    _repaint(`[data-journal-delete="${id}"]`);
  }));
  document.querySelectorAll("[data-journal-delete-yes]").forEach(b => b.addEventListener("click", () => {
    store.deleteJournalEntry(b.dataset.journalDeleteYes);
    pendingJournalDelete = null; journalStatus = "Entry deleted.";
    _repaint("#reflections-heading");
  }));

  // SMOOTH-P4b. Straight into the suggested practice.
  document.getElementById("wb-start")?.addEventListener("click", () => {
    const sug = suggestNow(getTodaysCheckin());
    startBreathing(sug.type, sug.mins);
  });

  document.getElementById("noticing-breathe-btn")?.addEventListener("click", () => {
    router.navigate("breathing-session");
  });

  document.getElementById("noticing-mindful-btn")?.addEventListener("click", () => {
    store.set("quietMode", "mindful");
    store.set("quietReturnRoute", "noticing");
    store.set("quietLaunchedDirect", true);
    router.navigate("quiet-session");
  });

  // In Step card. Free as of 12 Aug 2026 -- always rendered, always
  // tappable. The paid offer now lives at the END of a scenario, in
  // in-step.js, where the person has actually felt what it is.
  document.getElementById("noticing-in-step-btn")?.addEventListener("click", () => {
    router.navigate("in-step");
  });

  // Journal card — open journal-entry on the "choose" screen
  document.getElementById("noticing-journal-btn")?.addEventListener("click", () => {
    store.set("journalEntryType", null); // null = show choose screen
    router.navigate("journal-entry");
  });

  // "Write about this" on the weekly prompt — open directly on weekly type
  document.getElementById("noticing-weekly-journal-btn")?.addEventListener("click", () => {
    store.set("journalEntryType", "weekly-noticing");
    router.navigate("journal-entry");
  });
}
