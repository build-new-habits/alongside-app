/**
 * js/views/age-check.js
 * 01 Oct 2026 v1
 *
 * AGE-CHECK. Asked once of an install from before the check existed
 * (consent given, age never asked). New installs are asked in onboarding,
 * before anything else. Reached only through the guard in
 * router.navigate(); see js/data/age-check.js.
 *
 * A11Y. A fieldset with a legend; each select has its own label; Continue
 * is never disabled -- unanswered, it says what is needed and moves focus
 * to the first empty field (3.3.1). The heading takes focus on arrival.
 */
import { ageQuestionHTML, readAge, recordAge, takePendingRoute } from "../data/age-check.js";

export function AgeCheckView(router) {
  function mount(container) {
    container.innerHTML = `
      <div class="view age-view">
        <h1 class="age-title" id="age-title" tabindex="-1">One question first</h1>
        ${ageQuestionHTML("age")}
        <button class="btn btn-primary btn-large btn-full" id="age-continue">Continue</button>
      </div>`;
    container.querySelector("#age-continue").addEventListener("click", () => {
      const adult = readAge(container, "age");
      if (adult === null) {
        container.querySelector("#age-error").textContent = "Choose a month and a year.";
        const first = [...container.querySelectorAll(".age-q__select")].find(s => !s.value);
        first?.focus();
        return;
      }
      recordAge(adult);
      if (adult) router.navigate(takePendingRoute() || "today");
      else { takePendingRoute(); router.navigate("under-18"); }
    });
    container.querySelector("#age-title")?.focus();
  }
  return { mount };
}
