/**
 * onboarding/reflection.js
 * 28 Jun 2026 v2
 *
 * Beat 3 — The Reflection.
 * Coach reflects back what the user has shared.
 * Not a summary — an act of understanding.
 * The person feels met before their first session.
 *
 * What it does:
 *   — Reads hardBeforeSelections[] from store.
 *   — Calls getDominantTerritory() — first selection wins.
 *   — Renders the five-part script for the dominant territory.
 *   — Parts are revealed sequentially with timing gaps.
 *   — Single 'Begin' tap at the end. Writes reflectionShownAt.
 *   — Routes to today.js.
 *
 * If hardBeforeSelections is empty (user skipped Beat 2):
 *   — Renders a graceful fallback script that does not reference any
 *     specific territory. Warm, open, forward-moving.
 *
 * Dependencies:
 *   store.js v6
 *   js/data/beat3-scripts.js (getBeat3Script)
 *   coach-voice.js v1 (getTimingRules)
 *
 * WCAG 2.2 AA:
 *   Coach message in aria-live="polite" region.
 *   Parts revealed progressively — screen reader hears each as it appears.
 *   Single action. Touch target minimum 44px.
 *   All text meets 4.5:1 contrast on background.
 *   No time pressure — 'Begin' button appears after all parts shown,
 *   user taps when ready.
 */

import { store } from "../../store.js";
import { getBeat3Script } from "../../data/beat3-scripts.js";
import { getTimingRules } from "../../data/coach-voice.js";

// Fallback script for users who skipped Beat 2
const FALLBACK_SCRIPT = [
  "You've told me what I need to get started. That's enough.",
  "Whatever has made this feel complicated before — I don't need you to name it right now. What I do know is that you're here, and that matters.",
  "With Alongside: Move, the starting point is always where you actually are. Not where you think you should be. Not where another app said you'd be by now. Where you are today.",
  "I will never push you past what feels right. I will never treat a difficult week as a failure. What I will do is stay close to what's actually true for you — and work from there.",
  "I don't know everything about you yet. But I'm going to. Let's begin."
];

// Delay between each part appearing (ms)
// Gives the user time to read each section before the next arrives.
const PART_DELAY_MS = 1800;
const PART_FADE_MS  = 400;

export function OnboardingReflectionView(router) {

  let revealTimer = null;

  function mount(container) {
    if (!store.get("onboarding.reflectionShownAt")) {
      store.set("onboarding.reflectionShownAt", new Date().toISOString());
    }
    render(container);
  }

  function render(container) {
    const selections = store.get("onboarding.hardBeforeSelections") || [];
    const script     = getBeat3Script(selections);
    const parts      = script ? script.parts : FALLBACK_SCRIPT;
    const timing     = getTimingRules({ difficultTopic: true });

    container.innerHTML = `
      <div class="onboarding-view onboarding-view--reflection"
           role="main"
           aria-label="Your coach's reflection">

        <div class="reflection-content"
             aria-live="polite"
             aria-atomic="false"
             id="reflection-parts">
        </div>

        <div class="onboarding-actions reflection-actions" id="reflection-actions" hidden>
          <button
            class="btn btn-primary btn-large btn-full"
            data-action="begin"
            aria-label="Begin your first session">
            Let's begin
          </button>
        </div>

      </div>
    `;

    _revealParts(container, parts, timing);
  }

  /**
   * Reveal each part sequentially with timed delays.
   * Each part fades in as a separate paragraph block.
   * Begin button appears after all parts have been shown.
   */
  function _revealParts(container, parts, timing) {
    const partsEl   = container.querySelector("#reflection-parts");
    const actionsEl = container.querySelector("#reflection-actions");
    if (!partsEl) return;

    let index = 0;

    function showNext() {
      if (index >= parts.length) {
        // All parts shown — reveal Begin button
        if (actionsEl) {
          actionsEl.hidden = false;
          actionsEl.removeAttribute("hidden");
          // Wire the button
          actionsEl.querySelector("[data-action='begin']")?.addEventListener("click", () => {
            if (revealTimer) clearTimeout(revealTimer);
            store.set("onboarding.reflectionShownAt", new Date().toISOString());
            router.navigate("today");
          });
          // Scroll to bottom so button is visible
          setTimeout(() => {
            actionsEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }, 100);
        }
        return;
      }

      const para = document.createElement("p");
      para.className = "reflection-part";
      para.style.opacity = "0";
      para.style.transition = `opacity ${PART_FADE_MS}ms ease`;
      para.textContent = parts[index];

      partsEl.appendChild(para);

      // Scroll new part into view
      setTimeout(() => {
        para.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 50);

      // Fade in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          para.style.opacity = "1";
        });
      });

      index++;
      revealTimer = setTimeout(showNext, PART_DELAY_MS + timing.delayMs);
    }

    // First part appears after a short initial pause
    revealTimer = setTimeout(showNext, timing.delayMs);
  }

  return { mount };
}
