/**
 * mobility-conditioning.js - Mobility & Conditioning
 *
 * 29 Sep 2026 v7
 *
 * v7 - P0, SCOPE-MINOR. "My Conditions Programme" (coach-built, grouped by
 *   condition, edited in the retired Conditions Update) is now "My
 *   exercises": the person's own list, one tap to it.
 *
 * v6 - F7 LANDMARK. role="main" (and its label) removed from the view's
 *   wrapper: index.html's <main> is the one main landmark; a second,
 *   nested inside it, is announced twice and fails landmark rules.
 *
 * v5 - ARC-2. A Stretch arc card above the one-off Stretch card. The arc
 *   is the thing that spans weeks; the card below it is today.
 *
 * 31 Aug 2026 v4
 *
 * v4 - CHECKIN-GATE. The Stretch card gates on today's check-in exactly
 *   as the Cardio, Core & Strength door does. Without it the builder had
 *   no pain or soreness data, so a stretch session could not know about a
 *   bad back: no bodyCaution, and nothing for the severe bypass to read.
 *   The same screen was enforcing the gate through one door and skipping
 *   it through the other.
 *
 * 31 Aug 2026 v3
 *
 * v3 - STRETCH-DOOR. A "Stretch" card, where stretching actually belongs.
 *
 *   PICKER-GROUP put Stretch beside Mobility inside the session builder.
 *   That was grouping within the wrong room: the builder is what the
 *   CARDIO, CORE & STRENGTH door opens. The only route to a stretch
 *   session was to tap the strength door first -- which is what Graeme
 *   kept reporting, and what the grouping did not fix.
 *
 *   No new routing machinery. library.js already enters the builder via
 *   store.set("sessionBuilderPreselect", { type }), which skips the type
 *   picker. This card does the same with "stretch", so the person lands
 *   on duration rather than on a question they answered by tapping.
 *
 * 04 Aug 2026 v2
 *
 * v2 — Updated for conditionProgrammes.js v3's multi-condition
 *   entries. A shared exercise now correctly appears under every
 *   condition heading it genuinely belongs to when the programme
 *   section is expanded, not just one — getEntryConditionIds() used
 *   throughout instead of a direct conditionId read.
 *
 * 04 Aug 2026 v1
 *
 * New screen, replacing the today.js smart-routing hack (Home Nav
 * follow-up, same day). Graeme's design, confirmed before building:
 * three options — "Start a Mobility Session" (routes to core-session.js,
 * already condition-aware via Phase B's consolidated pool),
 * "My Conditions Programme" (collapsed by default — count + expand,
 * not the full inventory up front; "Not created" state links straight
 * into Conditions Update when nothing exists yet), "Log an event"
 * (routes to Library's existing log flow).
 *
 * "My Conditions Programme" deliberately renders inline here rather
 * than always jumping to prescribed.js — Graeme: "the 'programme' menu
 * and inventory should be collapsed and the user can open it if they
 * want to 'find out more about your saved programme'." Expanded state
 * lists exercises grouped by condition, plus a note pointing to
 * Conditions Update for editing, and a "Start this programme" action
 * into prescribed-session.js for anyone who came here specifically to
 * do it, not just look at it.
 */

import { store } from "../store.js";

export function MobilityConditioningView(router) {


  function mount(container) {
    render(container);
  }

  function render(container) {
    const mine = store.get("prescribedExercises") || [];

    container.innerHTML = `
      <div class="mc-view">
        <div class="mc-header">
          <button class="btn btn-ghost" id="mc-back-btn" aria-label="Back to Home">&larr; Back</button>
          <span class="mc-header-title">Mobility &amp; Conditioning</span>
        </div>

        <p class="mc-coach-line">What would you like to do?</p>

        <button class="mc-card" id="mc-start-session" aria-label="Start a Mobility Session">
          <span class="mc-card__icon" aria-hidden="true">\uD83E\uDDD8</span>
          <span class="mc-card__text">
            <span class="mc-card__label">Start a Mobility Session</span>
            <span class="mc-card__sub">Yoga, Pilates, stretching, warmups \u2014 adapted to how you're doing today</span>
          </span>
        </button>

        ${_renderMyExercisesCard(mine)}

        <button class="mc-card" id="mc-arc" aria-label="Stretch arc">
          <span class="mc-card__icon" aria-hidden="true">\uD83E\uDDED</span>
          <span class="mc-card__text">
            <span class="mc-card__label">Stretch arc</span>
            <span class="mc-card__sub" id="mc-arc-sub">A direction for your stretching, held over weeks</span>
          </span>
          <span class="mc-card__chev" aria-hidden="true">&#8250;</span>
        </button>

        <button class="mc-card" id="mc-stretch" aria-label="Stretch">
          <span class="mc-card__icon" aria-hidden="true">\uD83E\uDD38</span>
          <span class="mc-card__text">
            <span class="mc-card__label">Stretch</span>
            <span class="mc-card__sub">Held positions for hips, hamstrings, back and shoulders \u2014 no load</span>
          </span>
          <span class="mc-card__chev" aria-hidden="true">&#8250;</span>
        </button>

        <button class="mc-card" id="mc-log-event" aria-label="Log an event">
          <span class="mc-card__icon" aria-hidden="true">\u2795</span>
          <span class="mc-card__text">
            <span class="mc-card__label">Log an event</span>
            <span class="mc-card__sub">Capture something you've already done</span>
          </span>
        </button>
      </div>
    `;

    attachEvents(container);
  }

  // P0 (29 Sep 2026). Was "My Conditions Programme", built by the coach
  // for a condition and grouped by condition. Now the person's own list,
  // whatever it came from; the app does not build it or say what it is for.
  function _renderMyExercisesCard(mine) {
    return `
      <button class="mc-card" id="mc-my-exercises" aria-label="My exercises">
        <span class="mc-card__icon" aria-hidden="true">\uD83D\uDCCB</span>
        <span class="mc-card__text">
          <span class="mc-card__label">My exercises</span>
          <span class="mc-card__sub">${mine.length
            ? `${mine.length} exercise${mine.length === 1 ? "" : "s"} you've added`
            : "Keep a list of your own exercises"}</span>
        </span>
        <span class="mc-card__chev" aria-hidden="true">&#8250;</span>
      </button>
    `;
  }


  function attachEvents(container) {
    container.querySelector("#mc-back-btn")?.addEventListener("click", () => {
      router.navigate("today");
    });

    container.querySelector("#mc-start-session")?.addEventListener("click", () => {
      router.navigate("core-session");
    });

    // STRETCH-DOOR. Preselects the type so the builder opens on duration,
    // not on a picker the person just answered by tapping this card.
    container.querySelector("#mc-arc")?.addEventListener("click", () => {
      router.navigate("stretch-arc");
    });

    container.querySelector("#mc-stretch")?.addEventListener("click", () => {
      // CHECKIN-GATE, 31 Aug 2026. The Cardio, Core & Strength door
      // carries requiresCheckin: true; this one carries false, because
      // Mobility & Conditioning's other cards do not need it. But the
      // builder does -- without today's check-in it cannot know about a
      // bad back, so no bodyCaution fires and the severe bypass has
      // nothing to read. Stretch entered through this door was skipping
      // the gate the identical screen enforces through the other one.
      //
      // Same rule as today.js: only the day's FIRST check-in is a gate.
      // returnTo records the door, so Back does not walk into the type
      // picker this card exists to skip.
      store.set("sessionBuilderPreselect", { type: "stretch", returnTo: "mobility-conditioning" });
      if (store.checkedInToday()) {
        router.navigate("session-builder");
      } else {
        store.set("pendingDoorRoute", "session-builder");
        router.navigate("checkin");
      }
    });

    container.querySelector("#mc-log-event")?.addEventListener("click", () => {
      router.navigate("library");
    });

    container.querySelector("#mc-my-exercises")?.addEventListener("click", () => {
      router.navigate("prescribed");
    });
  }

  return { mount };
}
