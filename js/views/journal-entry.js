/**
 * js/views/journal-entry.js - Journal and Reflect View
 *
 * 21 May 2026 v1
 *
 * Two modes:
 *   1. Guided — coach selects a prompt based on today's check-in data
 *      (Free tier). Premium users can choose a category.
 *   2. Free write — blank canvas, no prompt.
 *
 * Also handles weekly "Noticing..." reflection when triggered from
 * the Noticing hub This Week section.
 *
 * Saves entries to store.journalEntries[].
 * Auto-tags entries from a keyword library.
 *
 * Route: "journal-entry"
 * Nav: hidden
 */

import { store }  from "../store.js";
import { router } from "../router.js";

export const centered = false;

// ── State ─────────────────────────────────────────────────────────────────────
let mode         = "mode-select"; // "mode-select" | "guided" | "free" | "done"
let bodyText     = "";
let selectedPrompt = null;
let selectedCategory = null;
let isWeeklyNoticing = false;   // true when navigated from This Week card

// ── Prompt pool — Free tier (coach-selected) ──────────────────────────────────
// 14 prompts, each with 4 personality variants.
// Coach selects based on today's check-in data.

const PROMPT_POOL = [
  {
    id:       "energy-high",
    category: "Movement",
    trigger:  (c) => (c.energy || 5) >= 7,
    variants: {
      steady:    "Your energy is strong today. What does that feel like in your body right now?",
      energetic: "You're running high today. What's driving that — and how does it feel to have it?",
      nurturing: "Something is alive in you today. Take a moment to notice it. What is it?",
      minimal:   "Energy is good today. What does that feel like?"
    }
  },
  {
    id:       "energy-low",
    category: "Movement",
    trigger:  (c) => (c.energy || 5) < 4,
    variants: {
      steady:    "Your energy is quieter today. What does that tell you about what you need right now?",
      energetic: "Not your highest-energy day. What would feel genuinely supportive right now?",
      nurturing: "You're carrying something heavier today. There's no need to push through it. What does rest mean for you today?",
      minimal:   "Energy is low. What does your body need?"
    }
  },
  {
    id:       "pain-present",
    category: "Health",
    trigger:  (c) => c.hasPain,
    variants: {
      steady:    "There's some pain in your body today. What is it trying to tell you?",
      energetic: "Your body is talking to you through discomfort. What's it saying?",
      nurturing: "Pain is information, not failure. What do you notice about where it is and what it's asking for?",
      minimal:   "Pain is present. What is it communicating?"
    }
  },
  {
    id:       "mood-low",
    category: "Life",
    trigger:  (c) => (c.mood || 5) < 4,
    variants: {
      steady:    "Mood is lower today. Without needing to fix it — what's sitting with you?",
      energetic: "Something is weighing on you. What would you like to put down, even just for a few minutes?",
      nurturing: "It's okay for today to feel heavy. Can you name what's making it so?",
      minimal:   "Something is heavy today. What is it?"
    }
  },
  {
    id:       "movement",
    category: "Movement",
    trigger:  () => true,
    variants: {
      steady:    "What did movement feel like in your body today — or this week? Be specific.",
      energetic: "Your body did something today. What did you notice about how it felt to move?",
      nurturing: "Your body has been working. What does it feel like to be in it right now?",
      minimal:   "What did movement feel like today?"
    }
  },
  {
    id:       "nature",
    category: "Nature",
    trigger:  () => true,
    variants: {
      steady:    "When were you last outside in something that felt alive — weather, light, ground? What did you notice?",
      energetic: "What did the outside world look like to you today — even through a window?",
      nurturing: "The natural world keeps moving whether we notice or not. What has it shown you recently?",
      minimal:   "What have you noticed about the natural world recently?"
    }
  },
  {
    id:       "family",
    category: "Family",
    trigger:  () => true,
    variants: {
      steady:    "Is there something happening in your family right now that you're carrying? You don't have to solve it here — just name it.",
      energetic: "Family. What's going on there lately?",
      nurturing: "The people closest to us — what are you noticing about them right now?",
      minimal:   "What's present in your family life right now?"
    }
  },
  {
    id:       "work",
    category: "Work",
    trigger:  () => true,
    variants: {
      steady:    "What is your work asking of you right now, and what is it giving you back?",
      energetic: "Work: what's energising, what's draining, and what would you change if you could?",
      nurturing: "Your work takes something from you. What does it take, and what does it give?",
      minimal:   "What is work asking of you right now?"
    }
  },
  {
    id:       "values",
    category: "Life",
    trigger:  () => true,
    variants: {
      steady:    "Name one thing you did in the last week that felt genuinely aligned with who you want to be.",
      energetic: "What did you do recently that you're actually proud of — even quietly?",
      nurturing: "There are moments when we act from our best selves. Was there one this week?",
      minimal:   "What did you do recently that felt true to who you are?"
    }
  },
  {
    id:       "struggle",
    category: "Life",
    trigger:  () => true,
    variants: {
      steady:    "What is genuinely hard right now? Not what should be fine — what actually isn't?",
      energetic: "Something is difficult right now. Can you name it clearly?",
      nurturing: "You don't have to pretend things are easier than they are. What's actually hard?",
      minimal:   "What is hard right now?"
    }
  },
  {
    id:       "community",
    category: "Community",
    trigger:  () => true,
    variants: {
      steady:    "Where do you belong? Where do you feel that sense of being part of something?",
      energetic: "Who are your people right now — the ones you'd call in a crisis?",
      nurturing: "Community is fragile and essential. Where do you feel it in your life?",
      minimal:   "Where do you feel a sense of belonging?"
    }
  },
  {
    id:       "creativity",
    category: "Creativity",
    trigger:  () => true,
    variants: {
      steady:    "When did you last make something — cook, build, write, draw, fix? What did it feel like?",
      energetic: "What's the most creative thing you've done recently, even if it doesn't seem like much?",
      nurturing: "Making things is deeply human. When do you feel most creative?",
      minimal:   "When did you last make something? What was it?"
    }
  },
  {
    id:       "joy",
    category: "Joy",
    trigger:  (c) => (c.mood || 5) >= 7,
    variants: {
      steady:    "What has genuinely delighted you recently — even a small thing?",
      energetic: "Something is good right now. Name it specifically.",
      nurturing: "Joy is worth naming. What has felt genuinely good or alive for you recently?",
      minimal:   "What has felt genuinely good recently?"
    }
  },
  {
    id:       "environment",
    category: "Environment",
    trigger:  () => true,
    variants: {
      steady:    "Look around the space you're in. What does it tell you about your life right now?",
      energetic: "Where are you spending most of your time lately? What does that space feel like?",
      nurturing: "Our surroundings shape us more than we notice. What does your environment feel like right now?",
      minimal:   "What does the space around you feel like right now?"
    }
  }
];

// ── Auto-tagging keyword library ──────────────────────────────────────────────

const TAG_KEYWORDS = {
  movement:    ["run", "walk", "gym", "exercise", "session", "body", "moved", "yoga", "swim"],
  pain:        ["pain", "ache", "hurt", "sore", "discomfort", "tender"],
  energy:      ["tired", "exhausted", "energised", "rested", "fatigue", "drained", "alive"],
  mood:        ["happy", "sad", "anxious", "calm", "stressed", "content", "low", "good"],
  family:      ["family", "partner", "children", "kids", "mum", "dad", "home"],
  work:        ["work", "job", "meeting", "colleague", "boss", "deadline", "project"],
  nature:      ["outside", "garden", "walk", "weather", "rain", "sun", "trees", "air"],
  gratitude:   ["grateful", "thankful", "appreciate", "lucky", "fortunate"],
  challenge:   ["hard", "difficult", "struggle", "challenge", "tough", "failing"],
  connection:  ["friend", "people", "community", "belong", "connect", "lonely"]
};

function autoTag(text) {
  const lower = text.toLowerCase();
  const tags  = [];
  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) tags.push(tag);
  }
  return tags;
}

// ── Prompt selection ──────────────────────────────────────────────────────────

function selectPrompt() {
  const checkins = store.get("checkinHistory") || {};
  const todayKey = new Date().toISOString().split("T")[0];
  const today    = checkins[todayKey] || {};

  const context = {
    energy:  today.energy  || 5,
    mood:    today.mood    || 5,
    hasPain: Object.values(store.get("conditionPainScores") || {}).some(v => v >= 4)
  };

  const style = store.get("coachStyle") || "steady";

  // Find first matching prompt (shuffle pool first for variety)
  const shuffled = [...PROMPT_POOL].sort(() => Math.random() - 0.5);
  const match    = shuffled.find(p => p.trigger(context)) || PROMPT_POOL[4];

  return {
    id:       match.id,
    category: match.category,
    text:     match.variants[style] || match.variants.steady
  };
}

// ── Save entry ────────────────────────────────────────────────────────────────

function saveEntry() {
  const today   = new Date().toISOString().split("T")[0];
  const now     = new Date().toISOString();
  const tags    = autoTag(bodyText);
  const entries = store.get("journalEntries") || [];

  const entry = {
    id:        now + "-" + Math.random().toString(36).slice(2, 6),
    date:      today,
    type:      isWeeklyNoticing
                 ? "weekly-noticing"
                 : mode === "guided" ? "guided" : "free",
    prompt:    selectedPrompt?.text || null,
    category:  selectedPrompt?.category || selectedCategory || null,
    body:      bodyText,
    tags,
    createdAt: now
  };

  entries.push(entry);
  store.set("journalEntries", entries);

  // If this was the weekly noticing entry, mark it and possibly advance the cycle
  if (isWeeklyNoticing) {
    store.set("noticingLastTriggered", today);
    // Advance the cycle week every time user completes a weekly noticing
    const current = store.get("noticingWeekInCycle") || 1;
    store.set("noticingWeekInCycle", (current % 6) + 1);
  }
}

// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  if (mode === "mode-select") return renderModeSelect();
  if (mode === "guided")      return renderGuided();
  if (mode === "free")        return renderFree();
  if (mode === "done")        return renderDone();
  return renderModeSelect();
}

function renderModeSelect() {
  return `
    <div class="view journal-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="je-back-btn" aria-label="Back to Noticing">
          ← Back
        </button>
        <span class="workout-header-title">Journal and reflect</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-5);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">
          Write freely, or explore a prompt. Your journal is private and never shared without your choice.
        </p>
      </div>

      <div style="display: flex; flex-direction: column; gap: var(--space-3);">

        <button class="card" id="je-guided-btn"
                style="display: flex; align-items: center; gap: var(--space-4); text-align: left; width: 100%; cursor: pointer; background: var(--color-surface);"
                aria-label="Get a prompt — the coach picks one based on today">
          <span style="font-size: 2rem; flex-shrink: 0; line-height: 1;" aria-hidden="true">💬</span>
          <div style="flex: 1; min-width: 0;">
            <p style="font-size: var(--text-lg); font-weight: var(--font-semibold); margin-bottom: var(--space-1);">Get a prompt</p>
            <p class="text-secondary" style="font-size: var(--text-sm);">The coach picks one based on today.</p>
          </div>
          <span style="color: var(--color-primary); font-size: 1.25rem;" aria-hidden="true">›</span>
        </button>

        <button class="card" id="je-free-btn"
                style="display: flex; align-items: center; gap: var(--space-4); text-align: left; width: 100%; cursor: pointer; background: var(--color-surface);"
                aria-label="Write freely — blank canvas, no prompt needed">
          <span style="font-size: 2rem; flex-shrink: 0; line-height: 1;" aria-hidden="true">✏️</span>
          <div style="flex: 1; min-width: 0;">
            <p style="font-size: var(--text-lg); font-weight: var(--font-semibold); margin-bottom: var(--space-1);">Write freely</p>
            <p class="text-secondary" style="font-size: var(--text-sm);">Blank canvas. No prompt needed.</p>
          </div>
          <span style="color: var(--color-primary); font-size: 1.25rem;" aria-hidden="true">›</span>
        </button>

      </div>

    </div>
  `;
}

function renderGuided() {
  const prompt = selectedPrompt || selectPrompt();
  if (!selectedPrompt) selectedPrompt = prompt;

  return `
    <div class="view journal-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="je-back-btn" aria-label="Back">
          ← Back
        </button>
        <span class="workout-header-title">Reflect</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-4);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div>
          <p class="coach-message-text">${prompt.text}</p>
          ${prompt.category
            ? `<p class="text-xs text-muted" style="margin-top: var(--space-2);">${prompt.category}</p>`
            : ""}
        </div>
      </div>

      <div style="margin-top: var(--space-4);">
        <label for="je-textarea" style="display: block; font-size: var(--text-sm); color: var(--color-text-secondary); margin-bottom: var(--space-2);">
          Your reflection
        </label>
        <textarea
          id="je-textarea"
          style="width: 100%; min-height: 180px; padding: var(--space-3); font-size: 16px; font-family: inherit; background: var(--color-surface); color: var(--color-text); border: 1px solid var(--color-border); border-radius: var(--radius-md, 8px); resize: vertical; box-sizing: border-box;"
          placeholder="Write whatever comes to mind. There is no right answer."
          aria-label="Your reflection"
          aria-describedby="je-privacy-note"
        >${bodyText}</textarea>
        <p id="je-privacy-note" class="text-xs text-muted" style="margin-top: var(--space-2);">
          Private. Never shared. Stored only on your device.
        </p>
      </div>

      <div style="margin-top: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3);">
        <button class="btn btn-primary btn-large btn-full" id="je-save-btn"
                aria-label="Save reflection">
          Save
        </button>
        <button class="btn btn-ghost btn-small" id="je-skip-btn">
          Skip — just want to write freely
        </button>
      </div>

    </div>
  `;
}

function renderFree() {
  return `
    <div class="view journal-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="je-back-btn" aria-label="Back">
          ← Back
        </button>
        <span class="workout-header-title">Write freely</span>
      </div>

      <div style="margin-top: var(--space-4);">
        <textarea
          id="je-textarea"
          style="width: 100%; min-height: 240px; padding: var(--space-3); font-size: 16px; font-family: inherit; background: var(--color-surface); color: var(--color-text); border: 1px solid var(--color-border); border-radius: var(--radius-md, 8px); resize: vertical; box-sizing: border-box;"
          placeholder="Whatever's on your mind."
          aria-label="Your writing"
          aria-describedby="je-privacy-note-free"
        >${bodyText}</textarea>
        <p id="je-privacy-note-free" class="text-xs text-muted" style="margin-top: var(--space-2);">
          Private. Never shared. Stored only on your device.
        </p>
      </div>

      <div style="margin-top: var(--space-4);">
        <button class="btn btn-primary btn-large btn-full" id="je-save-btn"
                aria-label="Save entry">
          Save
        </button>
      </div>

    </div>
  `;
}

function renderDone() {
  const name = store.get("name") || "";
  return `
    <div class="view journal-view" style="text-align: center;">

      <div class="card card-coach" style="margin-top: var(--space-8);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">
          ${name ? name + " — " : ""}that's saved.
          ${isWeeklyNoticing
            ? " Your reflection for this week is in."
            : " It will be here when you want to come back to it."}
        </p>
      </div>

      <div style="display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-6);">
        <button class="btn btn-primary btn-full" id="je-another-btn">
          Write another
        </button>
        <button class="btn btn-ghost btn-full" id="je-home-btn">
          Back to Noticing
        </button>
      </div>

    </div>
  `;
}

// ── Rerender ──────────────────────────────────────────────────────────────────

function rerender() {
  const main = document.getElementById("main-content");
  if (main) {
    main.innerHTML = render();
    onMount();
  }
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {
  // Back button
  document.getElementById("je-back-btn")?.addEventListener("click", () => {
    if (mode === "mode-select") {
      router.navigate("noticing");
    } else {
      mode           = "mode-select";
      bodyText       = "";
      selectedPrompt = null;
      rerender();
    }
  });

  // Mode selection
  document.getElementById("je-guided-btn")?.addEventListener("click", () => {
    mode           = "guided";
    selectedPrompt = selectPrompt();
    bodyText       = "";
    rerender();
  });

  document.getElementById("je-free-btn")?.addEventListener("click", () => {
    mode     = "free";
    bodyText = "";
    rerender();
  });

  // Skip prompt — go to free write
  document.getElementById("je-skip-btn")?.addEventListener("click", () => {
    mode     = "free";
    bodyText = document.getElementById("je-textarea")?.value.trim() || "";
    rerender();
  });

  // Save
  document.getElementById("je-save-btn")?.addEventListener("click", () => {
    const textarea = document.getElementById("je-textarea");
    bodyText = textarea?.value.trim() || "";
    if (!bodyText) {
      textarea?.focus();
      return;
    }
    saveEntry();
    mode = "done";
    rerender();
  });

  // Done screen
  document.getElementById("je-another-btn")?.addEventListener("click", () => {
    mode           = "mode-select";
    bodyText       = "";
    selectedPrompt = null;
    isWeeklyNoticing = false;
    rerender();
  });

  document.getElementById("je-home-btn")?.addEventListener("click", () => {
    mode           = "mode-select";
    bodyText       = "";
    selectedPrompt = null;
    isWeeklyNoticing = false;
    router.navigate("noticing");
  });
}

// ── External trigger — weekly noticing ────────────────────────────────────────
// Called from noticing.js when user taps "Reflect on this" in This Week section.
// Sets the guided mode with the weekly noticing prompt pre-loaded.

export function triggerWeeklyNoticing(weekPromptText) {
  isWeeklyNoticing = true;
  mode             = "guided";
  bodyText         = "";
  selectedPrompt   = {
    id:       "weekly-noticing",
    category: "Weekly Noticing",
    text:     weekPromptText
  };
}
