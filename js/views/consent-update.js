/**
 * js/views/consent-update.js
 * 02 Oct 2026 v2
 *
 * v2 - W4-13. Lists only the changes since the version the person agreed to
 *   (policyChangesFor).
 *
 * 01 Oct 2026 v1
 *
 * CONSENT-VERSION. "Our privacy policy and terms have changed": what
 * changed, the links, and one tick. Reached only through the guard in
 * router.navigate(); see js/data/consent-version.js.
 *
 * Somebody who does not agree is not stuck: Settings (to download or
 * delete everything) and the privacy summary stay open.
 *
 * A11Y. A native checkbox with its label; Continue is never disabled --
 * unticked, it says what is needed and moves focus to the box (3.3.1).
 */
import { policyChangesFor, agreeToCurrent, takePendingRoute } from "../data/consent-version.js";

export function ConsentUpdateView(router) {
  function mount(container) {
    container.innerHTML = `
      <div class="view hc-view">
        <h1 class="hc-title" id="cu-title" tabindex="-1">Our privacy policy and terms have changed</h1>
        <p class="hc-text">Here is what is different:</p>
        <ul class="u18-list">${policyChangesFor().map(c => `<li>${c}</li>`).join("")}</ul>
        <p class="hc-text">The full versions are our
          <a class="u18-link" href="https://buildnewhabits.co.uk/privacy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and
          <a class="u18-link" href="https://buildnewhabits.co.uk/terms/" target="_blank" rel="noopener noreferrer">Terms of Service</a>
          (both open in a new tab), or
          <button type="button" class="btn-inline-link" id="cu-summary">read the summary here</button>.</p>
        <div class="ob-consent__tick">
          <input type="checkbox" id="cu-check" class="ob-consent__checkbox">
          <label for="cu-check" class="ob-consent__label">I have read and agree to the updated Privacy Policy and Terms of Service.</label>
        </div>
        <p class="hc-error" id="cu-error" role="alert"></p>
        <button class="btn btn-primary btn-large btn-full" id="cu-continue">Continue</button>
        <p class="hc-text">If you would rather not agree, you can still
          <button type="button" class="btn-inline-link" id="cu-settings">download or delete everything in Settings</button>.</p>
      </div>`;
    const box = container.querySelector("#cu-check");
    container.querySelector("#cu-continue").addEventListener("click", () => {
      if (!box.checked) {
        container.querySelector("#cu-error").textContent = "Tick the box to agree, or go to Settings to download or delete everything.";
        box.focus();
        return;
      }
      agreeToCurrent();
      router.navigate(takePendingRoute() || "today");
    });
    container.querySelector("#cu-summary").addEventListener("click", () => router.navigate("privacy"));
    container.querySelector("#cu-settings").addEventListener("click", () => router.navigate("settings"));
    container.querySelector("#cu-title")?.focus();
  }
  return { mount };
}
