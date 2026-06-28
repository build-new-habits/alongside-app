/**
 * onboarding/hard-before.js
 * 28 Jun 2026 v2
 *
 * Beat 2 — The Single Real Question.
 * Asks what has made movement hard before.
 * Seven territory chips. Multi-select. No maximum.
 * Not a diagnostic — a moment of being seen.
 *
 * What it does:
 *   — Renders seven territory chips in a scrollable list.
 *   — Multi-select: no minimum enforced, no maximum.
 *   — On each selection, shows a real-time coach acknowledgement line
 *     drawn from the most recently tapped chip's territory.
 *   — Writes hardBeforeSelections[] and hardBeforeShownAt to store.
 *   — Routes to onboarding/reflection.
 *
 * Territory IDs (written to store, read by reflection.js):
 *   trust-rupture | escalation-trap | life-interruption | wrong-fit
 *   invisible-person | body-story | the-history
 *
 * Dependencies:
 *   store.js v6
 *   js/data/beat3-scripts.js (chip acknowledgement lines)
 *
 * WCAG 2.2 AA:
 *   aria-pressed on each chip — toggles true/false on selection.
 *   Keyboard navigable — each chip is a button.
 *   Minimum 44px touch target on all chips.
 *   Selected state announced to screen reader via aria-pressed.
 *   Coach acknowledgement line in aria-live="polite" region.
 *   Continue button disabled until at least one chip selected.
 */

import { store } from "../../store.js";
import { getChipAcknowledgement } from "../../data/beat3-scripts.js";

// Territory definitions — chip label + ID
// Order matters: most common/accessible territories first.
const TERRITORIES = [
  {
    id: "trust-rupture",
    label: "The app didn't do what it promised"
  },
  {
    id: "escalation-trap",
    label: "It moved faster than I could keep up"
  },
  {
    id: "life-interruption",
    label: "Something happened and there was no way back in"
  },
  {
    id: "wrong-fit",
    label: "It wasn't built for someone like me"
  },
  {
    id: "invisible-person",
    label: "I never felt like it knew I was there"
  },
  {
    id: "body-story",
    label: "I've never felt comfortable in my body"
  },
  {
    id: "the-history",
    label: "Exercise has always felt like it was for other people"
  }
];

export function HardBeforeView(router) {

  // Track selections in insertion order (first = dominant territory)
  let selected = [];

  function mount(container) {
    if (!store.get("onboarding.hardBeforeShownAt")) {
      store.set("onboarding.hardBeforeShownAt", new Date().toISOString());
    }
    render(container);
  }

  function render(container) {
    container.innerHTML = `
      <div class="onboarding-view onboarding-view--hard-before"
           role="main"
           aria-label="What has made movement hard before">

        <div class="onboarding-content">

          <div class="hard-before-coach-opening"
               role="region"
               aria-label="Coach question">
            <p class="hard-before-coach-question">
              What's made it hard before?
            </p>
            <p class="hard-before-coach-sub">
              Select everything that feels true. There is no wrong answer here.
            </p>
          </div>

          <div class="hard-before-chips"
               role="group"
               aria-label="Select what has made movement hard">
            ${TERRITORIES.map(t => `
              <button
                class="hard-before-chip"
                data-territory="${_esc(t.id)}"
                aria-pressed="false"
                type="button">
                ${_esc(t.label)}
              </button>
            `).join("")}
          </div>

          <div class="hard-before-acknowledgement"
               aria-live="polite"
               aria-atomic="true"
               id="hard-before-ack">
          </div>

        </div>

        <div class="onboarding-actions">
          <button
            class="btn btn-primary btn-large btn-full"
            data-action="continue"
            aria-label="Continue to your reflection"
            disabled>
            Continue
          </button>
          <button
            class="btn btn-ghost btn-full hard-before-skip"
            data-action="skip"
            type="button"
            aria-label="Skip this question">
            I'd rather not say
          </button>
        </div>

      </div>
    `;

    _wireChips(container);
    _wireContinue(container);
    _wireSkip(container);
  }

  function _wireChips(container) {
    container.querySelectorAll(".hard-before-chip").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.territory;
        _toggleSelection(id, btn, container);
      });
    });
  }

  function _toggleSelection(id, btn, container) {
    const isSelected = selected.includes(id);

    if (isSelected) {
      selected = selected.filter(s => s !== id);
      btn.setAttribute("aria-pressed", "false");
      btn.classList.remove("hard-before-chip--selected");
    } else {
      selected.push(id);
      btn.setAttribute("aria-pressed", "true");
      btn.classList.add("hard-before-chip--selected");

      // Show acknowledgement for most recently tapped chip
      const ack = getChipAcknowledgement(id);
      if (ack) {
        const ackEl = container.querySelector("#hard-before-ack");
        if (ackEl) {
          ackEl.innerHTML = `<p class="hard-before-ack-text">${_esc(ack)}</p>`;
        }
      }
    }

    // Update continue button state
    const continueBtn = container.querySelector("[data-action='continue']");
    if (continueBtn) {
      continueBtn.disabled = selected.length === 0;
    }
  }

  function _wireContinue(container) {
    container.querySelector("[data-action='continue']")?.addEventListener("click", () => {
      _commitAndAdvance();
    });
  }

  function _wireSkip(container) {
    container.querySelector("[data-action='skip']")?.addEventListener("click", () => {
      // User declined — write empty array, still advance
      store.set("onboarding.hardBeforeSelections", []);
      router.navigate("onboarding/reflection");
    });
  }

  function _commitAndAdvance() {
    store.set("onboarding.hardBeforeSelections", [...selected]);
    router.navigate("onboarding/reflection");
  }

  function _esc(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  return { mount };
}
