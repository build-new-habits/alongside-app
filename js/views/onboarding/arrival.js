/**
 * onboarding/arrival.js
 * 28 Jun 2026 v2
 *
 * Beat 1 — The Castle.
 * First thing a new user sees after mechanical onboarding.
 * Coach speaks first. Not a welcome screen — a moment of genuine
 * acknowledgement. The relationship begins here.
 *
 * What it does:
 *   — Full-screen coach message. Single 'Continue' tap.
 *   — Writes onboarding.castleShownAt to store (analytics, written once).
 *   — Routes to onboarding/hard-before.
 *
 * Coach message is generated from name + goals + fitness level.
 * It is warm, specific, unhurried. It does not mention features.
 * It does not promise results. It opens a relationship.
 *
 * Dependencies:
 *   store.js v6
 *   coach-voice.js v1 (timing rules)
 *
 * WCAG 2.2 AA:
 *   Coach message announced via aria-live region on mount.
 *   Single action. Touch target minimum 44px.
 *   All text meets 4.5:1 contrast on background.
 *   No time pressure — user taps when ready.
 */

import { store } from "../../store.js";
import { getTimingRules } from "../../data/coach-voice.js";

export function ArrivalView(router) {

  function mount(container) {
    // Write castleShownAt once — never overwrite
    if (!store.get("onboarding.castleShownAt")) {
      store.set("onboarding.castleShownAt", new Date().toISOString());
    }
    render(container);
  }

  function render(container) {
    const name        = _cap(store.get("name") || "");
    const goals       = store.get("goals") || [];
    const fitnessLevel = store.get("fitnessLevel") || null;

    const message     = _buildMessage(name, goals, fitnessLevel);
    const timing      = getTimingRules({ difficultTopic: false });

    container.innerHTML = `
      <div class="onboarding-view onboarding-view--arrival"
           role="main"
           aria-label="A message from your coach">

        <div class="arrival-content">

          <div class="arrival-coach-bubble"
               role="region"
               aria-label="Coach message"
               aria-live="polite">
            <div class="arrival-coach-avatar" aria-hidden="true">
              <img src="assets/images/logo-icon-small.png"
                   alt=""
                   width="36"
                   height="36"
                   class="arrival-coach-avatar__img">
            </div>
            <div class="arrival-coach-message" id="arrival-message">
              ${_renderMessage(message)}
            </div>
          </div>

        </div>

        <div class="onboarding-actions arrival-actions">
          <button
            class="btn btn-primary btn-large btn-full"
            data-action="continue"
            aria-label="Continue to the next step"
            style="opacity: 0; transition: opacity 0.4s ease;">
            Continue
          </button>
        </div>

      </div>
    `;

    // Reveal button after message has had time to be read
    const btn = container.querySelector("[data-action='continue']");
    setTimeout(() => {
      if (btn) btn.style.opacity = "1";
    }, timing.delayMs + 800);

    btn?.addEventListener("click", () => {
      router.navigate("onboarding/hard-before");
    });
  }

  /**
   * Build the arrival message from available user data.
   * Returns an array of paragraphs — each renders as a separate block.
   * The message is warm and specific — it references what the user
   * has already told us without listing it back at them.
   */
  function _buildMessage(name, goals, fitnessLevel) {
    const greeting = name
      ? `${name}, you made it here.`
      : "You made it here.";

    // Build a gentle acknowledgement of where they are starting from
    const startingContext = _getStartingContext(fitnessLevel, goals);

    return [
      greeting,
      startingContext,
      "Before we go any further, I want to ask you something. Not about your goals — I've got those. Something more important than that.",
      "I want to know what's made this hard before."
    ];
  }

  /**
   * Generate a context-aware second paragraph based on fitness level and goals.
   * Stays specific without being presumptuous.
   */
  function _getStartingContext(fitnessLevel, goals) {
    const exerciseHistory = store.get("lifestyle.exerciseHistory") || null;
    const hasGoals = goals && goals.length > 0;

    // CONTRACT-1, 13 Aug 2026. These branches tested fitnessLevel
    // against "returning", "beginner", "new-to-exercise" and
    // "experienced". fitnessLevel can hold NONE of those -- it carries
    // the activityLevel vocabulary (sedentary | light | moderate |
    // active | very-active), written from it at
    // onboarding/lifestyle.js:548.
    //
    // So four of the five branches were unreachable and only somebody
    // with activityLevel 'active' ever got a tailored line. Everybody
    // else fell through to the generic default -- including the person
    // this file's warmest sentence was written for. "It takes something
    // to come back" has never been shown to anybody.
    //
    // This is the app's FIRST spoken words after onboarding. Three
    // carefully written first-impression lines were dead copy.
    //
    // The author meant exercise HISTORY, which is a real field with
    // exactly these distinctions: never | lapsed | returning | active.
    // Switched to that. Nothing here is inferred that the person did
    // not tell us.
    if (exerciseHistory === "returning" || exerciseHistory === "lapsed") {
      return "It takes something to come back. Whatever brought you here, I'm glad it did.";
    }
    if (exerciseHistory === "never") {
      return "Starting something new is one of the harder things to do. I don't take lightly that you're here.";
    }
    if (exerciseHistory === "active" || fitnessLevel === "active" || fitnessLevel === "very-active") {
      return hasGoals
        ? "You know what you're doing. What I'm here to do is make sure what you're doing actually works for your life."
        : "You've been here before. What I'm here to do is make sure this time feels different.";
    }

    // Default — warm, open, not presumptuous
    return hasGoals
      ? "I've read what you've told me. I'm already building a picture of what this needs to look like for you."
      : "I'm glad you're here. Let's take a moment before we begin.";
  }

  /**
   * Render message paragraphs as HTML.
   * Each paragraph is a separate element for breathing room.
   */
  function _renderMessage(paragraphs) {
    return paragraphs
      .map(p => `<p class="arrival-coach-message__para">${_esc(p)}</p>`)
      .join("");
  }

  function _cap(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
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
