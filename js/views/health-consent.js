/**
 * js/views/health-consent.js
 * 01 Oct 2026 v2
 *
 * v2 - LEGAL-TRUE. The explanation names what is kept about the person's
 *   body and how they have been, matching the tick.
 *
 * PT-2 HEALTH-CONSENT. Asked before the next health question when the
 * health consent was never given (an install from before onboarding asked
 * it) or was withdrawn by Delete my health answers. Reached only through
 * the guard in router.navigate(); see js/data/health-consent.js.
 *
 * A11Y. A native checkbox with its label; Continue is never disabled --
 * without the tick it says what is needed and moves focus to the box
 * (3.3.1). The heading takes focus on arrival.
 */
import {
  HEALTH_TICK, HEALTH_NOTE, giveHealthConsent, takePendingRoute
} from "../data/health-consent.js";

export function HealthConsentView(router) {
  let root = null;

  function mount(container) {
    root = container;
    root.innerHTML = `
      <div class="view hc-view">
        <h1 class="hc-title" id="hc-title" tabindex="-1">Before I keep how you are</h1>
        <p class="hc-text">To shape your sessions I keep your health answers on this phone:
          what’s sore and how much, what you tell me about your body and how you’ve been,
          your check-ins, your weight if you add it, and your journal.
          They stay on this phone; nothing in them is sent anywhere.</p>
        <p class="hc-text">${HEALTH_NOTE}</p>
        <div class="ob-consent__tick">
          <input type="checkbox" id="hc-check" class="ob-consent__checkbox">
          <label for="hc-check" class="ob-consent__label">${HEALTH_TICK}</label>
        </div>
        <p class="hc-error" id="hc-error" role="alert"></p>
        <button class="btn btn-primary btn-large btn-full" id="hc-continue">Continue</button>
        <button class="btn btn-ghost btn-full" id="hc-not-now">Not now</button>
      </div>`;

    const box = root.querySelector("#hc-check");
    const err = root.querySelector("#hc-error");
    box.addEventListener("change", () => { if (box.checked) err.textContent = ""; });
    root.querySelector("#hc-continue").addEventListener("click", () => {
      if (!box.checked) {
        err.textContent = "Tick the box to say yes, or choose Not now.";
        box.focus();
        return;
      }
      giveHealthConsent();
      router.navigate(takePendingRoute() || "today");
    });
    root.querySelector("#hc-not-now").addEventListener("click", () => {
      takePendingRoute();
      router.navigate("today");
    });
    root.querySelector("#hc-title")?.focus();
  }

  return { mount };
}
