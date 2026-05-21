/**
 * js/views/noticing.js - Noticing Hub Landing View
 *
 * 21 May 2026 v1
 *
 * The Noticing Hub is the wellbeing layer of Alongside: Move.
 * It is a co-equal nav item with Today and Progress.
 *
 * Structure:
 *   - This Week: weekly reflection prompt (6-week rotation)
 *   - Anytime: Breathing / Journal / Your Reflections
 *
 * Route: "noticing"
 * Nav: visible (fourth tab)
 */

import { store }  from "../store.js";
import { router } from "../router.js";

export const centered = false;

// ── Weekly noticing prompt data ───────────────────────────────────────────────
// 6-week cycle. Each week has 4 personality variants.
// Cycle advances on the first check-in of each new week.

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

function hasJournaledThisWeek() {
  const entries  = store.get("journalEntries") || [];
  const weekAgo  = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return entries.some(e =>
    e.type === "weekly-noticing" &&
    new Date(e.createdAt) > weekAgo
  );
}

function getRecentEntries(limit = 3) {
  const entries = store.get("journalEntries") || [];
  return [...entries]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
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
  const journaledThisWeek = hasJournaledThisWeek();
  const recentEntries = getRecentEntries(3);
  const totalEntries  = (store.get("journalEntries") || []).length;

  return `
    <div class="view noticing-view">

      <!-- Screen-reader page title — visually hidden, matches nav label -->
      <h1 class="sr-only">Noticing</h1>

      <div class="view-header">
        <p class="text-secondary" style="margin: 0;">
          Good to see you${name ? ", " + name : ""}.
        </p>
      </div>

      <!-- ── This Week ────────────────────────────────────────── -->
      <section class="noticing-section" aria-labelledby="this-week-heading">
        <h2 class="section-label" id="this-week-heading"
            style="color: var(--color-primary); font-size: var(--text-lg); font-weight: var(--font-semibold); margin-bottom: var(--space-3);">
          This week
        </h2>

        <div class="card" style="margin-bottom: var(--space-2);">
          <p class="text-xs text-muted" style="margin-bottom: var(--space-2);">${weekData.theme}</p>
          <p style="font-size: var(--text-base); line-height: 1.6; margin-bottom: var(--space-4);">${weekData.prompt}</p>
          ${journaledThisWeek
            ? `<p class="text-sm text-muted">You've reflected this week.</p>`
            : `<button class="btn btn-primary btn-full" id="noticing-reflect-btn"
                       aria-label="Reflect on this week's prompt">
                Reflect on this
               </button>`
          }
        </div>
      </section>

      <!-- ── Anytime ──────────────────────────────────────────── -->
      <section class="noticing-section" aria-labelledby="anytime-heading">
        <h2 class="section-label" id="anytime-heading"
            style="color: var(--color-primary); font-size: var(--text-lg); font-weight: var(--font-semibold); margin: var(--space-5) 0 var(--space-3);">
          Anytime
        </h2>

        <div style="display: flex; flex-direction: column; gap: var(--space-3);">

          <button class="card" id="noticing-breathe-btn"
                  style="display: flex; align-items: center; gap: var(--space-4); text-align: left; width: 100%; cursor: pointer; background: var(--color-surface);"
                  aria-label="Breathing exercises — five types, any duration">
            <span style="font-size: 2rem; flex-shrink: 0; line-height: 1;" aria-hidden="true">🌬️</span>
            <div style="flex: 1; min-width: 0;">
              <p style="font-size: var(--text-lg); font-weight: var(--font-semibold); margin-bottom: var(--space-1);">Breathing</p>
              <p class="text-secondary" style="font-size: var(--text-sm);">Five types. Any duration.</p>
            </div>
            <span style="color: var(--color-primary); font-size: 1.25rem;" aria-hidden="true">›</span>
          </button>

          <button class="card" id="noticing-journal-btn"
                  style="display: flex; align-items: center; gap: var(--space-4); text-align: left; width: 100%; cursor: pointer; background: var(--color-surface);"
                  aria-label="Journal and reflect — guided prompt or free writing">
            <span style="font-size: 2rem; flex-shrink: 0; line-height: 1;" aria-hidden="true">📝</span>
            <div style="flex: 1; min-width: 0;">
              <p style="font-size: var(--text-lg); font-weight: var(--font-semibold); margin-bottom: var(--space-1);">Journal and reflect</p>
              <p class="text-secondary" style="font-size: var(--text-sm);">Guided prompt or free writing.</p>
            </div>
            <span style="color: var(--color-primary); font-size: 1.25rem;" aria-hidden="true">›</span>
          </button>

        </div>
      </section>

      <!-- ── Your Reflections ─────────────────────────────────── -->
      ${totalEntries > 0 ? `
        <section class="noticing-section" aria-labelledby="reflections-heading"
                 style="margin-top: var(--space-5);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3);">
            <h2 class="section-label" id="reflections-heading"
                style="color: var(--color-primary); font-size: var(--text-lg); font-weight: var(--font-semibold);">
              Your reflections
            </h2>
            ${totalEntries > 3
              ? `<span class="text-sm text-muted">${totalEntries} entries</span>`
              : ""}
          </div>

          <div style="display: flex; flex-direction: column; gap: var(--space-2);">
            ${recentEntries.map(entry => `
              <div class="card" role="article">
                <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2);">
                  <span class="text-xs text-muted">${formatDate(entry.createdAt)}</span>
                  ${entry.category
                    ? `<span class="text-xs text-muted" style="background: var(--color-surface-raised, rgba(255,255,255,0.06)); padding: 2px 8px; border-radius: 10px;">${entry.category}</span>`
                    : ""}
                </div>
                <p class="text-secondary" style="font-size: var(--text-sm); line-height: 1.6;">${
                  entry.body.length > 120
                    ? entry.body.slice(0, 120) + "…"
                    : entry.body
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
  document.getElementById("noticing-reflect-btn")?.addEventListener("click", () => {
    // Weekly noticing reflection — use journal-entry with weekly prompt pre-loaded
    router.navigate("journal-entry");
  });

  document.getElementById("noticing-breathe-btn")?.addEventListener("click", () => {
    // Route to existing quiet-session breathing — fully working, consistent UI
    store.set("quietMode", "breathing");
    router.navigate("quiet-session");
  });

  document.getElementById("noticing-journal-btn")?.addEventListener("click", () => {
    // Route to existing quiet-session journal — fully working, consistent UI
    store.set("quietMode", "journal");
    router.navigate("quiet-session");
  });
}
