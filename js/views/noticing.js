/**
 * js/views/noticing.js - Wellbeing Hub Landing View
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

import { store }  from "../store.js";
import { router } from "../router.js";
// In Step became free on 12 Aug 2026 (Destination Architecture sections
// 9 and 18), and it was the only gated card on this screen -- so
// isPremium() and lockedFeature() are no longer used here. Removed rather
// than left as unused imports.

export const centered = false;

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

function getCurrentWeekPrompt() {
  const week  = ((store.get("noticingWeekInCycle") || 1) - 1) % 6;
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

// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  const name          = store.get("name") || "";
  const weekData      = getCurrentWeekPrompt();
  const recentEntries = getRecentEntries(3);
  const totalEntries  = (store.get("journalEntries") || []).length;

  return `
    <div class="view noticing-view">

      <!-- TIER-F, 13 Aug 2026. Screen-reader heading follows the nav
           label and the Home door, both of which say Wellbeing. A
           sighted user never saw this heading, so it had drifted
           unnoticed -- but it is the FIRST thing a screen-reader user
           hears on arriving, and hearing "Noticing" after tapping
           "Wellbeing" is precisely the two-features-one-destination
           confusion this change exists to remove. -->
      <h1 class="sr-only">Wellbeing</h1>

      <div class="view-header">
        <p class="text-secondary" style="margin: 0;">
          Good to see you${name ? ", " + name : ""}.
        </p>
      </div>

      <!-- ── This Week ────────────────────────────────────────── -->
      <section class="noticing-section" aria-labelledby="this-week-heading">
        <h2 class="section-label" id="this-week-heading"
            style="color: var(--color-primary); font-size: var(--text-lg);
                   font-weight: var(--font-semibold); margin-bottom: var(--space-3);">
          This week
        </h2>

        <div class="card" style="margin-bottom: var(--space-2);">
          <p class="text-xs text-muted" style="margin-bottom: var(--space-2);">${weekData.theme}</p>
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

        <div style="display: flex; flex-direction: column; gap: var(--space-3);">

          <button class="card" id="noticing-breathe-btn"
                  style="display: flex; align-items: center; gap: var(--space-4);
                         text-align: left; width: 100%; cursor: pointer;
                         background: var(--color-surface);"
                  aria-label="Breathing exercises — five types, any duration">
            <span style="font-size: 2rem; flex-shrink: 0; line-height: 1;"
                  aria-hidden="true">🌬️</span>
            <div style="flex: 1; min-width: 0;">
              <p style="font-size: var(--text-lg); font-weight: var(--font-semibold);
                        margin-bottom: var(--space-1);">Breathing</p>
              <p class="text-secondary" style="font-size: var(--text-sm);">Five types. Any duration.</p>
            </div>
            <span style="color: var(--color-primary); font-size: 1.25rem;"
                  aria-hidden="true">›</span>
          </button>

          <button class="card" id="noticing-mindful-btn"
                  style="display: flex; align-items: center; gap: var(--space-4);
                         text-align: left; width: 100%; cursor: pointer;
                         background: var(--color-surface);"
                  aria-label="Mindful movement — five, ten, fifteen, or twenty minute guided sessions">
            <span style="font-size: 2rem; flex-shrink: 0; line-height: 1;"
                  aria-hidden="true">🌿</span>
            <div style="flex: 1; min-width: 0;">
              <p style="font-size: var(--text-lg); font-weight: var(--font-semibold);
                        margin-bottom: var(--space-1);">Mindful movement</p>
              <p class="text-secondary" style="font-size: var(--text-sm);">
                5, 10, 15, or 20 minutes. Guided, with a timer.
              </p>
            </div>
            <span style="color: var(--color-primary); font-size: 1.25rem;"
                  aria-hidden="true">›</span>
          </button>

          <button class="card" id="noticing-journal-btn"
                  style="display: flex; align-items: center; gap: var(--space-4);
                         text-align: left; width: 100%; cursor: pointer;
                         background: var(--color-surface);"
                  aria-label="Journal and reflect">
            <span style="font-size: 2rem; flex-shrink: 0; line-height: 1;"
                  aria-hidden="true">📝</span>
            <div style="flex: 1; min-width: 0;">
              <p style="font-size: var(--text-lg); font-weight: var(--font-semibold);
                        margin-bottom: var(--space-1);">Journal and reflect</p>
              <p class="text-secondary" style="font-size: var(--text-sm);">
                Guided prompts or free writing. Stays private.
              </p>
            </div>
            <span style="color: var(--color-primary); font-size: 1.25rem;"
                  aria-hidden="true">›</span>
          </button>

          <!-- IN STEP IS FREE. Destination Architecture 12 Aug 2026 sections
               9 and 18: "Free users have full access to everything in
               Wellbeing -- In Step, the empathy arc, grounding moments,
               journalling -- but no personal journey through it", and
               "In Step is free, and is the best door in the product."

               This was gated behind isPremium() from the 9 Aug build, when
               In Step WAS Personal tier. The 12 Aug tier decision moved it
               and the code did not follow, so the single best demonstration
               of what the product is for was invisible to exactly the people
               it was meant to reach.

               The paid thing is not this. It is the long version described
               in the door below: a destination you name, built out over
               months. Same rule as everywhere else -- free is the session,
               Personal is the plan. -->
          <button class="card" id="noticing-in-step-btn"
                  style="display: flex; align-items: center; gap: var(--space-4);
                         text-align: left; width: 100%; cursor: pointer;
                         background: var(--color-surface);"
                  aria-label="In Step \u2014 short scenarios, three ways to respond, no right step">
            <span style="font-size: 2rem; flex-shrink: 0; line-height: 1;"
                  aria-hidden="true">\uD83C\uDFB6</span>
            <div style="flex: 1; min-width: 0;">
              <p style="font-size: var(--text-lg); font-weight: var(--font-semibold);
                        margin-bottom: var(--space-1);">In Step</p>
              <p class="text-secondary" style="font-size: var(--text-sm);">
                Short scenarios. Three ways to respond. No right step.
              </p>
            </div>
            <span style="color: var(--color-primary); font-size: 1.25rem;"
                  aria-hidden="true">\u203A</span>
          </button>

        </div>
      </section>

      <!-- ── Your Reflections ─────────────────────────────────── -->
      ${totalEntries > 0 ? `
        <section class="noticing-section" aria-labelledby="reflections-heading"
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

          <div style="display: flex; flex-direction: column; gap: var(--space-2);">
            ${recentEntries.map(entry => `
              <div class="card" role="article">
                <div style="display: flex; align-items: center; gap: var(--space-2);
                            margin-bottom: var(--space-2);">
                  <span class="text-xs text-muted">${formatDate(entry.date)}</span>
                  ${entry.tags && entry.tags.length > 0
                    ? `<span class="text-xs text-muted"
                             style="background: var(--color-surface-raised, rgba(255,255,255,0.06));
                                    padding: 2px 8px; border-radius: 10px;">
                         ${entry.tags[0]}
                       </span>`
                    : ""}
                </div>
                <p class="text-secondary" style="font-size: var(--text-sm); line-height: 1.6;">${
                  entry.text.length > 120
                    ? entry.text.slice(0, 120) + "…"
                    : entry.text
                }</p>
              </div>
            `).join("")}
          </div>
        </section>
      ` : `
        <p class="text-secondary text-sm" style="margin-top: var(--space-5);">
          Your reflections will appear here after your first journal entry.
        </p>
      `}

    </div>
  `;
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {
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
