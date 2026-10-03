/**
 * js/views/health-consent.js
 * 02 Oct 2026 v4
 *
 * v4 - W5-8 DECLINE-DOORS. Not now opens a second screen: the answers stay
 *   on this phone, never sent; Back to the tick, or No thanks: the gentle
 *   routine (the same for anyone, sitting in a chair, changing day to day).
 *   Graeme, 02 Oct.
 *
 * 02 Oct 2026 v3
 *
 * v3 - W4-13. When the consent was given to older wording, it says the
 *   wording has changed and asks again.
 *
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
  HEALTH_TICK, HEALTH_NOTE, giveHealthConsent, takePendingRoute, healthWordingChanged, confirmNoHealth
} from "../data/health-consent.js";
import { startGeneralRoutine } from "../data/general-routine.js";

export function HealthConsentView(router) {
  let root = null;

  // W5-8. Graeme, 02 Oct: "Second chance, then one routine". Not now says
  // once more, plainly, where the answers are kept; a second no gives the
  // one gentle routine, the same for anyone, and asks nothing about health.
  function secondChance() {
    root.innerHTML = `
      <div class="view hc-view">
        <h1 class="hc-title" id="hc-title" tabindex="-1">Your answers stay on this phone</h1>
        <p class="hc-text">Before you decide: what you tell me about your body and how you are is kept
          on this phone and nowhere else. It is never sent to Build New Habits or to anyone, and you can
          delete it whenever you like in Settings.</p>
        <p class="hc-text">Without it I can't shape a session to you. What I can do is give you one gentle
          routine, the same for anyone, all of it sitting in a chair. It changes from day to day.</p>
        <button class="btn btn-primary btn-large btn-full" id="hc-back-to-tick">Back to the tick</button>
        <button class="btn btn-secondary btn-full" id="hc-routine">No thanks: the gentle routine</button>
      </div>`;
    root.querySelector("#hc-back-to-tick").addEventListener("click", () => mount(root));
    root.querySelector("#hc-routine").addEventListener("click", () => {
      confirmNoHealth();
      takePendingRoute();
      startGeneralRoutine();
      router.navigate("workout");
    });
    root.querySelector("#hc-title")?.focus();
  }

  function mount(container) {
    root = container;
    root.innerHTML = `
      <div class="view hc-view">
        <h1 class="hc-title" id="hc-title" tabindex="-1">Before I keep how you are</h1>
        ${healthWordingChanged() ? `<p class="hc-text">What this consent covers has changed since you agreed, so I need you to read it and say yes again before I keep anything new.</p>` : ""}
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
    root.querySelector("#hc-not-now").addEventListener("click", () => secondChance());
    root.querySelector("#hc-title")?.focus();
  }

  return { mount };
}
