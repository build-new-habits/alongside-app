/**
 * js/views/age-check.js
 * 02 Oct 2026 v3
 *
 * v3 - W5-5 (safeguarding reviewers to read). Under 18 is recorded at
 *   Continue and goes straight to the under-18 screen, which holds the
 *   warning and Download. "I typed the date wrong" is gone: it invited a
 *   child to change the answer.
 *
 * 02 Oct 2026 v2
 *
 * v2 - W4-17 U18-TRUE. Somebody under 18 with sessions, check-ins or a
 *   journal on the phone from before the age question is told what will be
 *   deleted and offered Download a copy before anything is deleted (and I
 *   typed the date wrong). A date not reached yet: "That date hasn't
 *   happened yet".
 *
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
import { ageQuestionHTML, readAnswer, showAgeError, recordAge, takePendingRoute } from "../data/age-check.js";

export function AgeCheckView(router) {
  let root = null;

  function ask() {
    root.innerHTML = `
      <div class="view age-view">
        <h1 class="age-title" id="age-title" tabindex="-1">One question first</h1>
        ${ageQuestionHTML("age")}
        <button class="btn btn-primary btn-large btn-full" id="age-continue">Continue</button>
      </div>`;
    root.querySelector("#age-continue").addEventListener("click", () => {
      const a = readAnswer(root, "age");
      if (a !== "adult" && a !== "under") { showAgeError(root, "age", a); return; }
      if (a === "adult") { recordAge(true); router.navigate(takePendingRoute() || "today"); return; }
      // W5-5. Recorded now, and it stands: the under-18 screen warns about
      // anything this phone holds, offers a copy, then deletes it. There is
      // no way back to change the answer (the warning here offered one).
      recordAge(false);
      takePendingRoute();
      router.navigate("under-18");
    });
    root.querySelector("#age-title")?.focus();
  }

  function mount(container) { root = container; ask(); }
  return { mount };
}
