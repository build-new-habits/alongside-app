/**
 * js/views/journal-entry.js - Journal Entry View
 *
 * 21 Jun 2026 v1 (S4-13/14)
 *
 * Replaces the "on its way" placeholder in noticing.js. Builds a proper
 * journal entry view against the array schema in store.js v4 (journalEntries
 * is an array of objects, NOT the date-keyed object shape that was in
 * quiet-session.js's old journal mode).
 *
 * Three entry types:
 *   "guided"          — coach picks a prompt from the user's categoryPrefs
 *   "free"            — blank page, no prompt
 *   "weekly-noticing" — the current week's noticing prompt
 *
 * Entry shape (schema.md v1.7 Section 18):
 *   id:        string  — ISO timestamp + 4-char random suffix
 *   date:      string  — ISO date e.g. "2026-06-21"
 *   type:      string  — "guided" | "free" | "weekly-noticing"
 *   prompt:    string  — the prompt shown (guided + weekly-noticing only)
 *   category:  string  — prompt category e.g. "movement", "nature"
 *   body:      string  — the user's written content
 *   tags:      array   — auto-tags derived from body (when autoTagging on)
 *   createdAt: string  — ISO timestamp
 *
 * Auto-tagging: keyword matching against a small dictionary per category.
 * Only fires when journalSettings.autoTagging === true.
 * Tags are additive; never removes content.
 *
 * Route: "journal-entry"
 * Nav: hidden (focused flow)
 * Return: "noticing" (always)
 */

import { store }  from "../store.js";
import { router } from "../router.js";

export const centered = false;

// ── Guided prompts by category ────────────────────────────────────────────────
// 14 categories total (schema.md 18.1):
//   Always (5): life, movement, environment, nature, health
//   Optional (7): relationships, work, creativity, sleep, body, gratitude, growth
//   Triggered (2): grief, joy — surfaced by coach only, not selectable here

const PROMPTS = {
  life: [
    "What has been pulling at your attention this week?",
    "What feels unfinished or unresolved right now?",
    "What would it mean to let one thing go today?",
    "What is one thing you want to acknowledge about this week?",
    "If today had a theme, what would it be?"
  ],
  movement: [
    "What did your body ask for today, and how did you respond?",
    "What surprised you about how you moved this week?",
    "When did movement feel like something you wanted rather than something you should do?",
    "What does your relationship with movement feel like right now?",
    "What would you tell someone who asked why you move?"
  ],
  environment: [
    "What did you notice about the space you moved in today?",
    "What in your environment made movement easier or harder this week?",
    "Where do you feel most like yourself when you move?",
    "What would you change about where you spend your time right now?",
    "What space are you craving that you're not getting?"
  ],
  nature: [
    "What did the world around you show you today?",
    "When were you last outside long enough to notice something?",
    "What season is your body in right now, regardless of the calendar?",
    "What would it mean to move with the weather instead of against it?",
    "What is alive around you that you haven't paid attention to recently?"
  ],
  health: [
    "What is your body asking for that you haven't given it yet?",
    "What does rest mean to you right now — is it absence of effort, or something else?",
    "What is one small thing that made you feel more like yourself this week?",
    "Where in your body do you carry stress? What does it feel like?",
    "What would it mean to feel well, even if you're not there yet?"
  ],
  relationships: [
    "Who made things easier for you this week without being asked?",
    "Is there something you've been meaning to say to someone?",
    "How has your movement practice affected how you show up for others?",
    "What do you need from the people around you right now?",
    "When did you feel most connected to someone recently?"
  ],
  work: [
    "What felt meaningful in your work this week, even briefly?",
    "What are you carrying from work into the rest of your life right now?",
    "What would make tomorrow at work feel more sustainable?",
    "What is one boundary you'd like to set or reset?",
    "What are you good at that isn't being used enough?"
  ],
  creativity: [
    "When did you last make something just for yourself?",
    "What form does creativity take in your life right now?",
    "What would you do with an unstructured afternoon?",
    "What idea has been sitting in the back of your mind?",
    "What does play look like for you as an adult?"
  ],
  sleep: [
    "What has your sleep been like, honestly?",
    "What is getting in the way of rest?",
    "What would help you wind down better tonight?",
    "When did you last wake up and feel restored?",
    "What does your body do when it's properly rested versus depleted?"
  ],
  body: [
    "What is your body doing well right now that you haven't acknowledged?",
    "What are you grateful for about how your body works?",
    "What has been difficult for your body recently, and how have you responded?",
    "What would it mean to feel at home in your body?",
    "What do you want for your body in the next few months?"
  ],
  gratitude: [
    "What went quietly right today that you didn't comment on?",
    "Who or what supported you this week without making a fuss about it?",
    "What small moment this week felt good?",
    "What do you have right now that you would miss if it were gone?",
    "What is ordinary about your life that is actually not ordinary at all?"
  ],
  growth: [
    "What did you learn about yourself this week?",
    "Where did you surprise yourself?",
    "What are you better at than you were a year ago?",
    "What are you still figuring out?",
    "What does growth feel like for you right now — is it expansive, uncomfortable, slow?"
  ]
};

// ── Auto-tag keyword dictionary ───────────────────────────────────────────────
// Simple keyword matching — not NLP. Keeps it fast and deterministic.
// Each tag fires if any of its keywords appears in the lowercased body.

const TAG_KEYWORDS = {
  energy:       ["energy", "tired", "exhausted", "energised", "drained", "buzzing", "flat"],
  pain:         ["pain", "ache", "hurting", "sore", "stiff", "injury", "flare"],
  mood:         ["mood", "anxious", "low", "happy", "sad", "frustrated", "calm", "content"],
  sleep:        ["sleep", "tired", "insomnia", "rest", "awake", "nap"],
  connection:   ["friend", "family", "partner", "colleague", "lonely", "together"],
  movement:     ["run", "walk", "gym", "session", "exercise", "moved", "training"],
  nature:       ["outside", "walk", "garden", "park", "trees", "air", "weather", "rain", "sun"],
  gratitude:    ["grateful", "thankful", "appreciate", "lucky", "glad"],
  stress:       ["stress", "overwhelmed", "pressure", "anxious", "tense", "worry"],
  progress:     ["better", "improving", "progress", "stronger", "further"],
};

// ── State ─────────────────────────────────────────────────────────────────────

let entryType    = "guided";   // "guided" | "free" | "weekly-noticing"
let currentPrompt = null;      // { text, category } | null
let bodyText      = "";        // user's writing
let saved         = false;     // true after successful save
let entryMode     = "choose";  // "choose" | "write" | "done"

// ── Prompt selection ──────────────────────────────────────────────────────────

function pickPrompt(category) {
  const pool = PROMPTS[category];
  if (!pool?.length) return null;
  // Rotate through prompts using day-of-year so the same prompt
  // doesn't appear two sessions in a row.
  const start     = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((Date.now() - start) / 86400000);
  return pool[dayOfYear % pool.length];
}

function selectGuidedPrompt() {
  const prefs = store.get("journalSettings.categoryPrefs") ||
                ["life", "movement", "environment", "nature", "health"];
  // Pick the category with fewest recent entries to maintain variety
  const entries  = store.get("journalEntries") || [];
  const counts   = {};
  prefs.forEach(c => { counts[c] = 0; });
  entries.slice(-20).forEach(e => {
    if (e.category && counts[e.category] !== undefined) counts[e.category]++;
  });
  const leastUsed = prefs.slice().sort((a, b) => counts[a] - counts[b])[0];
  const text = pickPrompt(leastUsed);
  return text ? { text, category: leastUsed } : { text: "What's on your mind right now?", category: "life" };
}

function getWeeklyPrompt() {
  // Mirror the logic in noticing.js so the weekly prompt is consistent
  const week  = ((store.get("noticingWeekInCycle") || 1) - 1) % 6;
  const style = store.get("coachStyle") || "steady";
  const WEEKLY = [
    { theme: "Personal Capacity",
      variants: { steady: "What did you bring to your movement this week that you didn't know you had?", energetic: "What surprised you about yourself in motion this week?", nurturing: "What did your body ask for this week, and how did you respond?", minimal: "What did you notice about your capacity this week?" } },
    { theme: "Interdependence",
      variants: { steady: "Who or what made movement possible for you this week? What did you rely on?", energetic: "What around you — people, places, things — helped you keep moving?", nurturing: "Who held space for you this week, even without knowing it?", minimal: "What supported you in moving this week?" } },
    { theme: "Mood and Relational",
      variants: { steady: "Movement shifts something in you. This week, did that show up in how you were with others?", energetic: "Did moving change how you showed up for the people around you this week?", nurturing: "How is your body feeling now, and how does that connect to how you've been with others?", minimal: "Did moving shift how you were with others?" } },
    { theme: "Nature and Ecological Belonging",
      variants: { steady: "Movement happens in a world. This week — whether you moved outside or inside — what did you notice? Weather, light, ground, air, seasons.", energetic: "What did the world around you show you this week while you moved?", nurturing: "The earth was beneath you, or the air around you. What did you notice about being alive in that world?", minimal: "What did you notice about the world around you?" } },
    { theme: "Values and Meaning",
      variants: { steady: "You showed up this week even when it was difficult. What does that commitment say about what you value?", energetic: "You kept moving even when it was hard. What does that say about what you care about?", nurturing: "You cared for yourself this week, even in difficulty. What does that tell you about what matters to you?", minimal: "What does your commitment this week say about what you value?" } },
    { theme: "Reciprocal Care and Empathy Transfer",
      variants: { steady: "As you've learned to meet your own struggle with patience instead of judgment, something shifts. Have you noticed yourself responding to others' difficulties differently?", energetic: "You've been kind to yourself through difficulty this week. Has that changed how you see others' struggles?", nurturing: "You've met yourself with gentleness. When you see others struggling, do you meet them differently now?", minimal: "Has caring for yourself changed how you see others' struggles?" } }
  ];
  const entry = WEEKLY[week];
  return { text: entry.variants[style] || entry.variants.steady, category: "weekly" };
}

// ── Auto-tagging ──────────────────────────────────────────────────────────────

function autoTag(text) {
  if (!store.get("journalSettings.autoTagging")) return [];
  const lower = text.toLowerCase();
  return Object.entries(TAG_KEYWORDS)
    .filter(([, keywords]) => keywords.some(kw => lower.includes(kw)))
    .map(([tag]) => tag);
}

// ── Save ──────────────────────────────────────────────────────────────────────

function saveEntry() {
  const trimmed = bodyText.trim();
  if (!trimmed) return false;

  const now    = new Date();
  const entry  = {
    id:        now.toISOString() + "_" + Math.random().toString(36).slice(2, 6),
    date:      now.toISOString().split("T")[0],
    type:      entryType,
    prompt:    currentPrompt?.text || null,
    category:  currentPrompt?.category || null,
    body:      trimmed,
    tags:      autoTag(trimmed),
    createdAt: now.toISOString()
  };

  const existing = store.get("journalEntries") || [];
  store.set("journalEntries", [...existing, entry]);
  saved = true;
  return true;
}

// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  if (entryMode === "choose") return renderChoose();
  if (entryMode === "write")  return renderWrite();
  if (entryMode === "done")   return renderDone();
  return renderChoose();
}

function renderChoose() {
  const name = store.get("name") || "";
  return `
    <div class="view checkin-view">

      <div class="checkin-step-header" style="justify-content: flex-start; gap: var(--space-3);">
        <button class="btn btn-ghost btn-small" id="journal-back-btn"
                aria-label="Back to Noticing">
          &larr; Back
        </button>
        <h1 style="font-size: var(--text-lg); font-weight: var(--font-semibold); margin: 0;">
          Journal
        </h1>
      </div>

      <div class="card card-coach" style="margin: var(--space-4);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">
          ${name ? name + ". " : ""}How do you want to write today?
        </p>
      </div>

      <div style="display: flex; flex-direction: column; gap: var(--space-3);
                  padding: 0 var(--space-4);"
           role="group" aria-label="Journal entry type">

        <button class="card" id="journal-guided-btn"
                style="display: flex; align-items: flex-start; gap: var(--space-4);
                       text-align: left; width: 100%; cursor: pointer;
                       background: var(--color-surface);"
                aria-label="Guided — coach picks a prompt">
          <span style="font-size: 1.75rem; flex-shrink: 0; line-height: 1.2;"
                aria-hidden="true">🎯</span>
          <div style="flex: 1; min-width: 0;">
            <p style="font-size: var(--text-base); font-weight: var(--font-semibold);
                      margin: 0 0 var(--space-1);">
              Guided
            </p>
            <p class="text-secondary" style="font-size: var(--text-sm); margin: 0;">
              Coach picks a prompt based on what you've been up to.
            </p>
          </div>
          <span style="color: var(--color-primary); font-size: 1.25rem; flex-shrink: 0;"
                aria-hidden="true">›</span>
        </button>

        <button class="card" id="journal-free-btn"
                style="display: flex; align-items: flex-start; gap: var(--space-4);
                       text-align: left; width: 100%; cursor: pointer;
                       background: var(--color-surface);"
                aria-label="Free write — blank page">
          <span style="font-size: 1.75rem; flex-shrink: 0; line-height: 1.2;"
                aria-hidden="true">📄</span>
          <div style="flex: 1; min-width: 0;">
            <p style="font-size: var(--text-base); font-weight: var(--font-semibold);
                      margin: 0 0 var(--space-1);">
              Free write
            </p>
            <p class="text-secondary" style="font-size: var(--text-sm); margin: 0;">
              Blank page. No prompt. Just write.
            </p>
          </div>
          <span style="color: var(--color-primary); font-size: 1.25rem; flex-shrink: 0;"
                aria-hidden="true">›</span>
        </button>

        <button class="card" id="journal-weekly-btn"
                style="display: flex; align-items: flex-start; gap: var(--space-4);
                       text-align: left; width: 100%; cursor: pointer;
                       background: var(--color-surface);"
                aria-label="This week's noticing prompt">
          <span style="font-size: 1.75rem; flex-shrink: 0; line-height: 1.2;"
                aria-hidden="true">🌀</span>
          <div style="flex: 1; min-width: 0;">
            <p style="font-size: var(--text-base); font-weight: var(--font-semibold);
                      margin: 0 0 var(--space-1);">
              This week's prompt
            </p>
            <p class="text-secondary" style="font-size: var(--text-sm); margin: 0;">
              Write to the weekly noticing question.
            </p>
          </div>
          <span style="color: var(--color-primary); font-size: 1.25rem; flex-shrink: 0;"
                aria-hidden="true">›</span>
        </button>

      </div>
    </div>
  `;
}

function renderWrite() {
  const hasPrompt = currentPrompt?.text;
  const charCount = bodyText.length;

  return `
    <div class="view checkin-view">

      <div class="checkin-step-header" style="justify-content: flex-start; gap: var(--space-3);">
        <button class="btn btn-ghost btn-small" id="journal-write-back-btn"
                aria-label="Back to journal type picker">
          &larr; Back
        </button>
        <h1 style="font-size: var(--text-lg); font-weight: var(--font-semibold); margin: 0;">
          ${entryType === "weekly-noticing" ? "This week" : entryType === "free" ? "Free write" : "Journal"}
        </h1>
      </div>

      ${hasPrompt ? `
        <div class="card card-coach" style="margin: var(--space-4) var(--space-4) var(--space-2);">
          <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
          <p class="coach-message-text">${currentPrompt.text}</p>
        </div>
      ` : `
        <div style="margin: var(--space-4) var(--space-4) var(--space-2);">
          <p class="text-secondary text-sm">Write freely. There is no wrong answer.</p>
        </div>
      `}

      <div style="padding: 0 var(--space-4);">
        <textarea
          id="journal-body"
          class="quiet-journal-textarea"
          rows="10"
          placeholder="${hasPrompt ? "Write here…" : "Whatever is on your mind."}"
          aria-label="${hasPrompt ? "Your response to: " + currentPrompt.text : "Free journal entry"}"
          style="width: 100%; box-sizing: border-box; min-height: 200px;"
        >${bodyText}</textarea>

        <p class="text-xs text-muted" style="text-align: right; margin-top: var(--space-1);"
           aria-live="polite" aria-atomic="true" id="journal-char-count">
          ${charCount > 0 ? charCount + " characters" : ""}
        </p>
      </div>

      <div style="padding: var(--space-4); display: flex; flex-direction: column;
                  gap: var(--space-3);">
        <button class="btn btn-primary btn-large btn-full" id="journal-save-btn"
                ${bodyText.trim().length === 0 ? "disabled" : ""}
                aria-label="Save journal entry">
          Save entry
        </button>
        <button class="btn btn-ghost btn-full" id="journal-discard-btn"
                aria-label="Discard and go back">
          Discard
        </button>
      </div>

    </div>
  `;
}

function renderDone() {
  const entries    = store.get("journalEntries") || [];
  const totalCount = entries.length;
  return `
    <div class="view checkin-view">

      <div class="card card-coach" style="margin: var(--space-8) var(--space-4) var(--space-4);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div>
          <p class="coach-message-text">
            Saved. That one's yours.
          </p>
          ${totalCount > 1
            ? `<p class="text-sm text-muted" style="margin-top: var(--space-2);">
                 You have ${totalCount} ${totalCount === 1 ? "entry" : "entries"} now.
               </p>`
            : `<p class="text-sm text-muted" style="margin-top: var(--space-2);">
                 Your first entry. They will build up over time.
               </p>`
          }
        </div>
      </div>

      <div style="padding: 0 var(--space-4); display: flex; flex-direction: column;
                  gap: var(--space-3);">
        <button class="btn btn-primary btn-full" id="journal-another-btn">
          Write another
        </button>
        <button class="btn btn-ghost btn-full" id="journal-done-btn">
          Back to Noticing
        </button>
      </div>

    </div>
  `;
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {

  // Choose screen
  document.getElementById("journal-back-btn")?.addEventListener("click", () => {
    resetState();
    router.navigate("noticing");
  });

  document.getElementById("journal-guided-btn")?.addEventListener("click", () => {
    entryType     = "guided";
    currentPrompt = selectGuidedPrompt();
    entryMode     = "write";
    bodyText      = "";
    rerender();
  });

  document.getElementById("journal-free-btn")?.addEventListener("click", () => {
    entryType     = "free";
    currentPrompt = null;
    entryMode     = "write";
    bodyText      = "";
    rerender();
  });

  document.getElementById("journal-weekly-btn")?.addEventListener("click", () => {
    entryType     = "weekly-noticing";
    currentPrompt = getWeeklyPrompt();
    entryMode     = "write";
    bodyText      = "";
    rerender();
  });

  // Write screen
  document.getElementById("journal-write-back-btn")?.addEventListener("click", () => {
    entryMode = "choose";
    bodyText  = "";
    rerender();
  });

  const textarea = document.getElementById("journal-body");
  if (textarea) {
    textarea.addEventListener("input", () => {
      bodyText = textarea.value;
      // Update save button state and char count without full rerender
      const saveBtn   = document.getElementById("journal-save-btn");
      const charCount = document.getElementById("journal-char-count");
      if (saveBtn) saveBtn.disabled = bodyText.trim().length === 0;
      if (charCount) charCount.textContent = bodyText.length > 0 ? bodyText.length + " characters" : "";
    });
    // Focus textarea on write screen
    textarea.focus();
  }

  document.getElementById("journal-save-btn")?.addEventListener("click", () => {
    const ta = document.getElementById("journal-body");
    if (ta) bodyText = ta.value;
    if (saveEntry()) {
      entryMode = "done";
      rerender();
    }
  });

  document.getElementById("journal-discard-btn")?.addEventListener("click", () => {
    bodyText  = "";
    entryMode = "choose";
    rerender();
  });

  // Done screen
  document.getElementById("journal-another-btn")?.addEventListener("click", () => {
    bodyText  = "";
    saved     = false;
    entryMode = "choose";
    rerender();
  });

  document.getElementById("journal-done-btn")?.addEventListener("click", () => {
    resetState();
    router.navigate("noticing");
  });
}

// ── onUnmount — called by router before navigating away ───────────────────────

export function onUnmount() {
  // Nothing to clean up (no timers) but reset state so a
  // fresh entry starts from "choose" if the user returns.
  resetState();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function resetState() {
  entryType     = "guided";
  currentPrompt = null;
  bodyText      = "";
  saved         = false;
  entryMode     = "choose";
}

function rerender() {
  const main = document.getElementById("main-content");
  if (main) {
    main.innerHTML = render();
    onMount();
  }
}
