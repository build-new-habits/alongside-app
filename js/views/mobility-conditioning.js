/**
 * mobility-conditioning.js - Mobility & Conditioning
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
import { getConditionName } from "../data/conditions.js";
import { getEntryConditionIds } from "../data/conditionProgrammes.js";

export function MobilityConditioningView(router) {

  let programmeExpanded = false;

  function mount(container) {
    render(container);
  }

  function render(container) {
    const prescribed = store.get("prescribedExercises") || [];
    const tagged      = prescribed.filter(e => getEntryConditionIds(e).length > 0);

    container.innerHTML = `
      <div class="mc-view" role="main" aria-label="Mobility and Conditioning">
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

        ${_renderProgrammeCard(tagged)}

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

  function _renderProgrammeCard(tagged) {
    if (tagged.length === 0) {
      return `
        <div class="mc-card mc-card--static" aria-label="My Conditions Programme, not created">
          <span class="mc-card__icon" aria-hidden="true">\uD83E\uDE79</span>
          <span class="mc-card__text">
            <span class="mc-card__label">My Conditions Programme</span>
            <span class="mc-card__sub">Not created yet</span>
          </span>
          <button class="mc-card__link" id="mc-goto-conditions-update">
            Build one in Conditions Update
          </button>
        </div>
      `;
    }

    const byCondition = {};
    tagged.forEach(e => {
      // An entry can now serve more than one condition (04 Aug 2026,
      // real exercise reuse) — it appears under each heading it
      // genuinely belongs to, not just the first/only one, so the
      // grouped view honestly reflects what the exercise is doing.
      getEntryConditionIds(e).forEach(conditionId => {
        (byCondition[conditionId] ||= []).push(e);
      });
    });

    return `
      <div class="mc-card mc-card--static">
        <button class="mc-programme-toggle" id="mc-programme-toggle"
                aria-expanded="${programmeExpanded}" aria-controls="mc-programme-body">
          <span class="mc-card__icon" aria-hidden="true">\uD83E\uDE79</span>
          <span class="mc-card__text">
            <span class="mc-card__label">My Conditions Programme</span>
            <span class="mc-card__sub">${tagged.length} exercise${tagged.length === 1 ? "" : "s"} saved \u2014 tap to find out more</span>
          </span>
          <span class="mc-programme-toggle__chevron" aria-hidden="true">&rsaquo;</span>
        </button>

        ${programmeExpanded ? `
          <div class="mc-programme-body" id="mc-programme-body">
            ${Object.entries(byCondition).map(([conditionId, exercises]) => `
              <div class="mc-programme-group">
                <p class="mc-programme-group__heading">${getConditionName(conditionId)}</p>
                <ul class="mc-programme-group__list">
                  ${exercises.map(e => `<li>${e.name}</li>`).join("")}
                </ul>
              </div>
            `).join("")}
            <p class="mc-programme-edit-note">
              Want to change what's here, your goal, or how it folds into your sessions?
              Edit it in Conditions Update.
            </p>
            <div class="mc-programme-actions">
              <button class="btn btn-ghost" id="mc-goto-conditions-update-2">Conditions Update</button>
              <button class="btn btn-primary" id="mc-start-programme">Start this programme</button>
            </div>
          </div>
        ` : ""}
      </div>
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
    container.querySelector("#mc-stretch")?.addEventListener("click", () => {
      store.set("sessionBuilderPreselect", { type: "stretch" });
      router.navigate("session-builder");
    });

    container.querySelector("#mc-log-event")?.addEventListener("click", () => {
      router.navigate("library");
    });

    container.querySelector("#mc-goto-conditions-update")?.addEventListener("click", () => {
      router.navigate("conditions-update");
    });

    container.querySelector("#mc-goto-conditions-update-2")?.addEventListener("click", () => {
      router.navigate("conditions-update");
    });

    container.querySelector("#mc-start-programme")?.addEventListener("click", () => {
      router.navigate("prescribed-session");
    });

    container.querySelector("#mc-programme-toggle")?.addEventListener("click", () => {
      programmeExpanded = !programmeExpanded;
      render(container);
    });
  }

  return { mount };
}
