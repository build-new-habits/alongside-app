/**
 * bad-day-door.js - the Bad-day choice, for every door that starts a session
 *
 * 02 Oct 2026 v1
 *
 * v1 - W5-1, W5-2 (Wave 5 persona trace: 2.12, 2.14, 2.16). On a Bad day
 *   the coach and Run asked first (Rest today / Something gentler); Yoga,
 *   Classes and the player did not, so a pose list, a class or yesterday's
 *   half-done plan could start on a Bad knee or back. One choice, worded as
 *   Run's, used by every door that does not build through the coach. Either
 *   answer is recorded as the coach records it, and the coach's screen then
 *   shows the rest day or the gentle plan.
 */
import { store }  from "../store.js";
import { router } from "../router.js";
import { isBad, areaWords, bodyAreasOf } from "../data/conditions.js";
import { safetyLineFor }    from "../data/purpose.js";

/** The listed areas the person called Bad today (sorted ids). */
export function badDayIds() {
  const ids    = bodyAreasOf(store.get("conditions") || []);   // W5-4: never stress
  const scores = store.get("conditionPainScores") || {};
  return ids.filter(id => isBad(scores[id])).sort();
}

function _join(names) {
  if (names.length < 2) return names[0] || "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/** The choice, as a whole screen. `title` names the door ("Before yoga"). */
export function renderBadDayDoor(title = "Before you start") {
  const ids    = badDayIds();
  const plural = ids.length > 1;
  const areas  = _join(ids.map(areaWords));
  return `
    <div class="view walk-session-view" data-bad-day-door>
      <div class="workout-header">
        <button class="btn btn-ghost" data-bad-day="exit" aria-label="Back to Home">Back</button>
        <h1 class="workout-header-title" tabindex="-1">${title}</h1>
      </div>
      <div class="card card-coach" style="margin-bottom: var(--space-5);">
        <p class="coach-message-text">Your ${areas} ${plural ? "are" : "is"} bad today. I can't give you medical support — that isn't something I can do. What I can do is keep today gentle, or we can call it a rest day. ${safetyLineFor(plural ? "them" : "it")}</p>
      </div>
      <div class="ws-type-grid" role="group" aria-label="Rest or something gentler">
        <button class="ws-type-card" data-bad-day="rest">
          <span class="ws-type-label">Rest today</span>
          <span class="ws-type-desc">Nothing pushed today — the right call some days</span>
        </button>
        <button class="ws-type-card" data-bad-day="adapt">
          <span class="ws-type-label">Something gentler</span>
          <span class="ws-type-desc">Something gentler, that asks less of the sore area</span>
        </button>
      </div>
    </div>`;
}

/** Wires the choice. `leave` runs first (each door clears its own state). */
export function wireBadDayDoor(root = document, leave = () => {}) {
  root.querySelectorAll("[data-bad-day]").forEach(btn => {
    btn.addEventListener("click", () => {
      const choice = btn.dataset.badDay;
      leave();
      if (choice === "exit") { router.navigate("today"); return; }
      store.recordSeverePainChoice(badDayIds(), choice);
      router.navigate("coach-proposal");
    });
  });
}
