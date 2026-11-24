/**
 * views/on-the-plan.js
 * 24 Nov 2026 v1
 *
 * v1 - P-46 S4 FREE HOME (spec §5, "Moves to the Plan"). A Free route to
 *   something that moved to the Plan opens this one page: what it is in one
 *   line, Part of the Plan, See what the Plan adds, and the one way back
 *   (‹ Back, to Home: the one look's back, verify-one-look 2). The router sends
 *   Free here (router.js v62, FREE_MOVED) and says which route
 *   (router.planOnly). Nothing is sold: one line says what it is, and the
 *   upgrade page does the rest.
 */
import { lineIcon } from "../data/line-icons.js";

/** What each moved route is, in one line (spec §7: one short line). */
export const PLAN_ONLY = Object.freeze({
  "session-builder":       ["Choose your session", "Pick the kind of session, where, and how long."],
  "mobility-conditioning": ["Mobility and conditioning", "Stretching and moving for stiff joints."],
  "classes":               ["Classes", "Follow-along classes, start to finish."],
  "class-player":          ["Classes", "Follow-along classes, start to finish."],
  "library":               ["The Library", "Every exercise, practice and session, to browse."],
  "know-what":             ["I know what I want", "Say what you want, and go straight to it."],
  "my-programme":          ["Your programme", "A plan for the weeks ahead, held for you."],
  "weekly-plan":           ["Your weekly plan", "Which days you move, planned ahead."],
  "your-week":             ["Your week", "Which days you move, planned ahead."],
  "arc-setup":             ["Your arc", "Something you want to be able to do, worked towards."],
  "stretch-arc":           ["Your arc", "Something you want to be able to do, worked towards."],
  "goal-setup":            ["Your programme", "A plan for the weeks ahead, held for you."],
});

export function OnThePlanView(router) {
  function mount(container) {
    const [title, line] = PLAN_ONLY[router?.planOnly] || ["Part of the Plan", "More choice, and a coach who plans ahead with you."];
    container.innerHTML = `
      <div class="path-view on-the-plan" data-plan-only="${router?.planOnly || ""}">
        <button type="button" class="btn btn-ghost plan-back" id="otp-home" aria-label="Back to Home">‹ Back</button>
        <div class="path-head"><span class="kind-tile k-teal">${lineIcon("star")}</span><h1 class="path-h1" id="otp-h" tabindex="-1">${title}</h1></div>
        <p class="path-coachline">${line}</p>
        <p class="path-small">Part of the Plan</p>
        <button type="button" class="btn btn-primary btn-full" id="otp-plan">See what the Plan adds</button>
      </div>`;
    container.querySelector("#otp-home").addEventListener("click", () => router.navigate("today"));
    container.querySelector("#otp-plan").addEventListener("click", () => router.navigate("upgrade"));
    container.querySelector("#otp-h")?.focus();
  }
  return { mount };
}
