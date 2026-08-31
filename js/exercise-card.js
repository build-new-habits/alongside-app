/**
 * js/exercise-card.js
 * 31 Aug 2026 v2
 *
 * CARD-2. Three layers, cut by WHEN the person needs something.
 *
 * v1 sized sections by phase and familiarity and collapsed the rest. On a
 * device that was still a wall: the first encounter opened everything,
 * which is the moment somebody is least able to take it in. Graeme's cut
 * is better and this is it -- Before, During, After. Only one is on
 * screen, so six instructions is fine, because that is the thing being
 * done.
 *
 *   BEFORE   why this helps, how heavy, how long to hold each rep.
 *            You are deciding and setting up.
 *   DURING   how to get there, what to watch for, more on form, plus
 *            whatever the view passes in -- target, video.
 *   AFTER    supplied entirely by the view: too hard / too easy, not a
 *            fan, the log block, notes.
 *
 * THE LOG BLOCK MOVES. gym-programme.js rendered it ABOVE the card --
 * band, reps and Save, before a single rep had been done. It is an After
 * thing that was sitting in the Before position.
 *
 * WHAT NEVER MOVES INTO A LAYER. The caution and one cue are PINNED above
 * the tabs and visible in all three. A layer navigated away from is more
 * hidden than a section collapsed, and safety content cannot sit behind a
 * tab somebody does not know exists. bodyCaution renders whenever it
 * fires, in every layer, always.
 *
 * WHAT HAPPENED TO FAMILIARITY. Gone, deliberately. It read
 * exerciseHistory to decide how much to show, and with one layer on
 * screen the density problem it solved no longer exists. Removing it also
 * removes the P4 exposure: this file no longer reads exerciseHistory at
 * all, so there is nothing to leak.
 *
 * holdSeconds APPEARS HERE, NOT ON A CLOCK. TIME-1 established that
 * `duration` is total exercise time and `holdSeconds` is the per-rep hold
 * -- bird-dog holds 3 against a duration of 90. It is coaching detail, so
 * it belongs in Before as a line of text, and exercise-timing.js still
 * refuses to read it.
 */

import { bodyCaution } from "./data/session-rationale.js";
import { getDisplayPref } from "./display-prefs.js";

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function _fullAlways() {
  try { return getDisplayPref("fullInstructions") === "on"; } catch { return false; }
}

const LAYERS = [
  { key: "before", label: "Before" },
  { key: "during", label: "During" },
  { key: "after",  label: "After"  },
];

function list(cls, items) {
  return `<ul class="${cls}">${items.map(i => `<li>${esc(i)}</li>`).join("")}</ul>`;
}

function section(label, body) {
  if (!body) return "";
  return `<div class="xcard-block">
      <span class="exercise-section-label">${esc(label)}</span>
      ${body}
    </div>`;
}

/**
 * @param {object} exercise
 * @param {object} opts
 * @param {string}  opts.idPrefix    unique per card instance on the page
 * @param {boolean} opts.running     true once the timer has started
 * @param {boolean} opts.finished    true once the exercise is done
 * @param {string}  opts.duringSlot  view-supplied HTML for the During layer
 * @param {string}  opts.afterSlot   view-supplied HTML for the After layer
 */
export function renderExerciseCard(exercise, opts = {}) {
  if (!exercise) return "";
  const p        = opts.idPrefix || "xcard";
  const running  = !!opts.running;
  const finished = !!opts.finished;
  const full     = _fullAlways();

  // Sets the STARTING layer only. attachCardEvents never moves anybody
  // after they have touched the tabs -- being yanked from Before to During
  // mid-read because a timer ticked over is worse than landing on the
  // wrong one.
  const initial = finished ? "after" : (running ? "during" : "before");

  const caution  = bodyCaution(exercise);
  const cues     = Array.isArray(exercise.cues) ? exercise.cues : [];
  const leadCue  = cues[0] || exercise.coaching || "";
  const restCues = cues.slice(1);

  const hold = (typeof exercise.holdSeconds === "number" && exercise.holdSeconds > 0)
    ? `<p class="xcard-hold">Hold each one for about ${exercise.holdSeconds} second${exercise.holdSeconds === 1 ? "" : "s"}.</p>`
    : "";

  const before = [
    section("Why this helps", exercise.why ? `<p>${esc(exercise.why)}</p>` : ""),
    section("How heavy", exercise.load ? `<p>${esc(exercise.load)}</p>` : ""),
    hold ? section("Pace", hold) : "",
  ].join("");

  const during = [
    section("How to get there",
      (exercise.instructions && exercise.instructions.length) ? list("exercise-section-list", exercise.instructions) : ""),
    section("What to watch for",
      (exercise.watchOut && exercise.watchOut.length) ? list("exercise-watchout-list", exercise.watchOut) : ""),
    section("More on form", restCues.length ? list("exercise-section-list", restCues) : ""),
    opts.duringSlot || "",
  ].join("");

  const bodies = { before, during, after: opts.afterSlot || "" };

  const pinned = `
    ${caution ? `<p class="exercise-caution" role="note">${caution}</p>` : ""}
    ${leadCue ? `<p class="exercise-cue xcard-lead-cue">${esc(leadCue)}</p>` : ""}`;

  // "Show everything" flattens the tabs rather than opening one of them.
  // Somebody who has asked for all of it should not be sent to three
  // places to get it.
  if (full) {
    return `
  <div class="exercise-card exercise-card--flat" data-xcard="${p}"
       role="region" aria-label="Exercise guidance for ${esc(exercise.name)}">
    ${pinned}
    ${before}${during}${bodies.after}
  </div>`;
  }

  return `
  <div class="exercise-card" data-xcard="${p}"
       role="region" aria-label="Exercise guidance for ${esc(exercise.name)}">
    ${pinned}
    <div class="xcard-tabs" role="tablist" aria-label="When you need it">
      ${LAYERS.map(l => `
        <button type="button" role="tab"
                class="xcard-tab"
                id="${p}-tab-${l.key}"
                data-xcard-tab="${l.key}"
                aria-controls="${p}-panel-${l.key}"
                aria-selected="${l.key === initial ? "true" : "false"}"
                tabindex="${l.key === initial ? "0" : "-1"}">${l.label}</button>`).join("")}
    </div>
    ${LAYERS.map(l => `
      <div role="tabpanel"
           class="xcard-panel"
           id="${p}-panel-${l.key}"
           aria-labelledby="${p}-tab-${l.key}"
           tabindex="0"
           ${l.key === initial ? "" : "hidden"}>
        ${bodies[l.key] || `<p class="xcard-empty">Nothing here for this one.</p>`}
      </div>`).join("")}
  </div>`;
}

/**
 * Delegated and idempotent, so a card re-rendered mid-session needs no
 * rebinding. Arrow keys move between tabs because WCAG expects it of a
 * tablist, and because thumbs are not the only way in.
 */
export function attachCardEvents(root) {
  const el = root || document;
  if (el.__xcardBound) return;
  el.__xcardBound = true;

  const select = (card, key, focus) => {
    card.querySelectorAll("[data-xcard-tab]").forEach(tab => {
      const on = tab.dataset.xcardTab === key;
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.setAttribute("tabindex", on ? "0" : "-1");
      if (on && focus) tab.focus();
      const panel = document.getElementById(tab.getAttribute("aria-controls"));
      if (panel) { if (on) panel.removeAttribute("hidden"); else panel.setAttribute("hidden", ""); }
    });
  };

  el.addEventListener("click", ev => {
    const tab = ev.target.closest("[data-xcard-tab]");
    if (!tab || !el.contains(tab)) return;
    const card = tab.closest(".exercise-card");
    if (card) { card.dataset.xcardTouched = "1"; select(card, tab.dataset.xcardTab, false); }
  });

  el.addEventListener("keydown", ev => {
    const tab = ev.target.closest("[data-xcard-tab]");
    if (!tab || !el.contains(tab)) return;
    const card = tab.closest(".exercise-card");
    if (!card) return;
    const tabs = [...card.querySelectorAll("[data-xcard-tab]")];
    const i = tabs.indexOf(tab);
    let next = null;
    if (ev.key === "ArrowRight")     next = tabs[(i + 1) % tabs.length];
    else if (ev.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
    else if (ev.key === "Home")      next = tabs[0];
    else if (ev.key === "End")       next = tabs[tabs.length - 1];
    if (!next) return;
    ev.preventDefault();
    card.dataset.xcardTouched = "1";
    select(card, next.dataset.xcardTab, true);
  });
}
