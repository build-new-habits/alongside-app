/**
 * js/views/age-check.js
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
import { ageQuestionHTML, readAnswer, showAgeError, recordAge, takePendingRoute, heldOnPhone } from "../data/age-check.js";
import { saveExport } from "../data/export-file.js";

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
      // W4-17. An install from before the age question may hold a journal
      // and sessions. Say so, and offer a copy, before anything is deleted.
      if (heldOnPhone().any) warn();
      else under();
    });
    root.querySelector("#age-title")?.focus();
  }

  function under() {
    recordAge(false);
    takePendingRoute();
    router.navigate("under-18");
  }

  function warn() {
    const h = heldOnPhone();
    const parts = [];
    if (h.sessions) parts.push(h.sessions === 1 ? "1 session" : `${h.sessions} sessions`);
    if (h.checkins) parts.push(h.checkins === 1 ? "1 check-in" : `${h.checkins} check-ins`);
    if (h.journal) parts.push("your journal");
    const what = parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}` : parts[0];
    root.innerHTML = `
      <div class="view age-view">
        <h1 class="age-title" id="age-title" tabindex="-1">Alongside is for adults</h1>
        <p class="u18-text">So I\u2019ll delete what this phone holds from before: ${what}, and your other session records.
          None of it has been sent anywhere.</p>
        <p class="u18-text">If you\u2019d like a copy first, download it now. Anyone who has the file can read it, so keep it somewhere private.</p>
        <p class="u18-text" id="age-download-result" role="status" tabindex="-1"></p>
        <button class="btn btn-secondary btn-large btn-full" id="age-download">Download a copy</button>
        <button class="btn btn-primary btn-large btn-full" id="age-delete">Delete it and carry on</button>
        <button class="btn btn-ghost btn-full" id="age-again">I typed the date wrong</button>
      </div>`;
    root.querySelector("#age-download").addEventListener("click", () => {
      const name = saveExport();
      const out = root.querySelector("#age-download-result");
      out.textContent = name ? `Your file, ${name}, is downloading to this phone.` : "The file could not be made on this phone.";
      out.focus();
    });
    root.querySelector("#age-delete").addEventListener("click", under);
    root.querySelector("#age-again").addEventListener("click", ask);
    root.querySelector("#age-title")?.focus();
  }

  function mount(container) { root = container; ask(); }
  return { mount };
}
