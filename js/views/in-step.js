/**
 * js/views/in-step.js
 * 09 Aug 2026 v1
 *
 * "In Step" — practice space extending the empathy transfer arc.
 * Route: "in-step". Personal tier (gated via js/auth.js isPremium()).
 * Nav: hidden (activity flow, same pattern as journal-entry/breathing-session).
 *
 * Spec: PM chat session, 09 Aug 2026 ("In Step" concept development).
 * Four movements (solo/partner/floor/environment), each a small
 * progressive series reusing the noticingProgress architecture already
 * live in store.js. One scenario per visit, three lateral unrandomised-
 * order response options, no ranking, no evaluation of the choice made.
 *
 * Multi-screen pattern follows breathing-session.js exactly: module-level
 * `phase` state, a render() dispatcher, and a local rerender() that
 * replaces #main-content directly rather than going back through the
 * router (keeps scroll position sane between scenario steps).
 *
 * Lock rule: after a movement's scenario is answered, that movement's
 * *next* scenario is locked for 3 days (IN_STEP_LOCK_DAYS below) — a
 * deliberate anti-binge gap, matching the 3-4 day cadence already used
 * for the empathy transfer stage prompts elsewhere in the product, so
 * pacing feels consistent rather than arbitrary. All four movements are
 * open from the start; there is no movement-to-movement gate, only the
 * per-movement cooldown after use.
 *
 * Data logged (store.inStepProgress.choiceLog): movementId, scenarioId,
 * optionId, tag, timestamp. Aggregate research signal only — see header
 * note in js/data/in-step-scenarios.js. NEVER read this log to change
 * coach language, session content, or anything shown back to the user.
 * If a future session wires cohort-level reporting, it reads this array
 * in bulk, offline, never per-user in-app.
 */

import { store }               from "../store.js";
import { router }              from "../router.js";
import { MOVEMENTS, getScenario } from "../data/in-step-scenarios.js";
import { isPremium }           from "../auth.js";

export const centered = false;

const IN_STEP_LOCK_DAYS = 3;

let phase           = "landing";  // "landing" | "scenario" | "result"
let activeMovementId = null;
let activeScenario   = null;
let chosenOption     = null;
let learnWhyOpen     = false;

// ── Helpers ──────────────────────────────────────────────────────────────────

function getProgress() {
  return store.get("inStepProgress") || {
    unlockedAt: {}, scenarioIndex: {}, completedCount: {}, choiceLog: []
  };
}

function daysSince(iso) {
  if (!iso) return Infinity;
  const ms = Date.now() - new Date(iso).getTime();
  return ms / (1000 * 60 * 60 * 24);
}

function isMovementAvailable(movementId) {
  const progress = getProgress();
  const last = progress.unlockedAt?.[movementId];
  if (!last) return true;
  return daysSince(last) >= IN_STEP_LOCK_DAYS;
}

function daysRemaining(movementId) {
  const progress = getProgress();
  const last = progress.unlockedAt?.[movementId];
  if (!last) return 0;
  const remaining = Math.ceil(IN_STEP_LOCK_DAYS - daysSince(last));
  return Math.max(0, remaining);
}

// Fisher-Yates shuffle — option order rotates per view, per spec
// ("order rotated, first-position-as-correct is a real anchoring bias").
function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function recordChoice(movementId, scenarioId, optionId, tag) {
  const progress = getProgress();
  const choiceLog = Array.isArray(progress.choiceLog) ? [...progress.choiceLog] : [];
  choiceLog.push({ movementId, scenarioId, optionId, tag, at: new Date().toISOString() });

  const scenarioIndex = { ...(progress.scenarioIndex || {}) };
  scenarioIndex[movementId] = (scenarioIndex[movementId] || 0) + 1;

  const completedCount = { ...(progress.completedCount || {}) };
  completedCount[movementId] = (completedCount[movementId] || 0) + 1;

  const unlockedAt = { ...(progress.unlockedAt || {}) };
  unlockedAt[movementId] = new Date().toISOString();

  store.set("inStepProgress", { ...progress, choiceLog, scenarioIndex, completedCount, unlockedAt });
}

// ── Render ───────────────────────────────────────────────────────────────────

export function render() {
  if (phase === "scenario") return renderScenario();
  if (phase === "result")   return renderResult();
  return renderLanding();
}

function renderLanding() {
  const progress = getProgress();

  return `
    <div class="view in-step-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="is-back-btn" aria-label="Back to Noticing">
          ← Back
        </button>
        <span class="workout-header-title">In Step</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-5);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">
          Different styles, different partners, different spaces. A short scenario, three ways to move
          through it — no right step, just yours.
        </p>
      </div>

      <div style="display: flex; flex-direction: column; gap: var(--space-3);">
        ${MOVEMENTS.map(m => {
          const available = isMovementAvailable(m.id);
          const remaining = daysRemaining(m.id);
          const count = progress.completedCount?.[m.id] || 0;
          return `
            <button class="card is-movement-card" data-movement="${m.id}"
                    ${available ? "" : "disabled"}
                    style="display: flex; align-items: center; gap: var(--space-4);
                           text-align: left; width: 100%;
                           cursor: ${available ? "pointer" : "default"};
                           background: var(--color-surface);
                           opacity: ${available ? "1" : "0.55"};"
                    aria-label="${m.name}: ${m.tagline}${available ? "" : ` — available in ${remaining} day${remaining === 1 ? "" : "s"}`}">
              <span style="font-size: 2rem; flex-shrink: 0; line-height: 1;" aria-hidden="true">${m.icon}</span>
              <div style="flex: 1; min-width: 0;">
                <p style="font-size: var(--text-lg); font-weight: var(--font-semibold);
                          margin-bottom: var(--space-1);">${m.name}</p>
                <p class="text-secondary" style="font-size: var(--text-sm);">
                  ${available
                    ? m.tagline
                    : `Available in ${remaining} day${remaining === 1 ? "" : "s"}`}
                </p>
              </div>
              ${count > 0
                ? `<span class="text-xs text-muted" style="flex-shrink: 0;">${count}</span>`
                : ""}
              <span style="color: var(--color-primary); font-size: 1.25rem; flex-shrink: 0;"
                    aria-hidden="true">${available ? "›" : "🔒"}</span>
            </button>
          `;
        }).join("")}
      </div>

    </div>
  `;
}

function renderScenario() {
  const movement = MOVEMENTS.find(m => m.id === activeMovementId);
  const options = shuffled(activeScenario.options);

  return `
    <div class="view in-step-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="is-back-btn" aria-label="Back to In Step">
          ← Back
        </button>
        <span class="workout-header-title">${movement.name}</span>
      </div>

      <div class="card" style="margin-bottom: var(--space-5);">
        <p style="font-size: var(--text-base); line-height: 1.6;">${activeScenario.text}</p>
      </div>

      <div style="display: flex; flex-direction: column; gap: var(--space-3);" role="group"
           aria-label="Three ways to respond — choose the one that fits">
        ${options.map(opt => `
          <button class="card is-option-btn" data-option="${opt.id}" data-tag="${opt.tag}"
                  style="text-align: left; width: 100%; cursor: pointer;
                         background: var(--color-surface); min-height: 44px;">
            <p style="font-size: var(--text-base); line-height: 1.5;">${opt.label}</p>
          </button>
        `).join("")}
      </div>

    </div>
  `;
}

function renderResult() {
  const movement = MOVEMENTS.find(m => m.id === activeMovementId);

  return `
    <div class="view in-step-view">

      <div class="workout-header">
        <span class="workout-header-title">${movement.name}</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-4);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">${movement.acknowledgement}</p>
      </div>

      <button class="btn btn-ghost btn-small" id="is-learn-why-toggle"
              aria-expanded="${learnWhyOpen}" aria-controls="is-learn-why-panel"
              style="margin-bottom: var(--space-3);">
        ${learnWhyOpen ? "Hide" : "Learn why"}
      </button>

      ${learnWhyOpen ? `
        <div class="card" id="is-learn-why-panel" style="margin-bottom: var(--space-4);">
          <p class="text-secondary" style="font-size: var(--text-sm); line-height: 1.6;">
            ${movement.learnWhy}
          </p>
        </div>
      ` : `<div id="is-learn-why-panel" hidden></div>`}

      ${!isPremium() ? `
        <!-- THE DOOR. Destination Architecture section 9, verbatim.
             "In Step is free, and is the best door in the product --
             because someone who has just finished a scenario has FELT the
             shape of the thing."

             P2: this is the helper layer, not the coach. It sits OUTSIDE
             the card-coach block above and is visibly distinct from it,
             because P1 says the coach never sells. The coach's
             acknowledgement finishes; then something else speaks.

             P3 is not breached. This is not an interruption on a timer --
             it is a permanent surface at the one moment the person has
             just felt what it is for. Tier Boundary section 6: "visible
             at all times, never triggered by our judgement of readiness."

             Copy rule 10.2 -- what is it, what would it do for me, how do
             I get it -- in that order. Deliberately soft: it fires
             straight after something reflective, and a hard call to
             action would break the moment. -->
        <aside class="upgrade-door" aria-label="About the paid plan">
          <p class="upgrade-door__text">
            That&rsquo;s In Step \u2014 four movements, one thing at a time, each going
            a bit deeper.
          </p>
          <p class="upgrade-door__text">
            There&rsquo;s a longer version of the same idea. You pick something
            you&rsquo;d like to get better at \u2014 being steadier, being more present,
            noticing other people more \u2014 and I build it out over months, shaped
            around what you&rsquo;re actually noticing rather than a fixed course.
          </p>
          <p class="upgrade-door__text upgrade-door__text--quiet">
            That&rsquo;s part of the paid plan, if you ever fancy it.
          </p>
          <button class="upgrade-door__link" id="is-door-btn">Have a look</button>
        </aside>
      ` : ""}

      <div style="display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-5);">
        <button class="btn btn-ghost" id="is-journal-btn">
          Want to say more? Write about it.
        </button>
        <button class="btn btn-primary" id="is-done-btn">
          Done
        </button>
      </div>

    </div>
  `;
}

// ── Mount ─────────────────────────────────────────────────────────────────────

function rerender() {
  const main = document.getElementById("main-content");
  if (main) {
    main.innerHTML = render();
    onMount();
  }
}

export function onMount() {
  document.getElementById("is-back-btn")?.addEventListener("click", () => {
    if (phase === "landing") {
      router.navigate("noticing");
    } else {
      phase = "landing";
      activeMovementId = null;
      activeScenario = null;
      rerender();
    }
  });

  document.querySelectorAll(".is-movement-card").forEach(btn => {
    if (btn.disabled) return;
    btn.addEventListener("click", () => {
      const movementId = btn.dataset.movement;
      const progress = getProgress();
      const index = progress.scenarioIndex?.[movementId] || 0;
      activeMovementId = movementId;
      activeScenario = getScenario(movementId, index);
      chosenOption = null;
      learnWhyOpen = false;
      phase = "scenario";
      rerender();
    });
  });

  document.querySelectorAll(".is-option-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      chosenOption = btn.dataset.option;
      const tag = btn.dataset.tag;
      recordChoice(activeMovementId, activeScenario.id, chosenOption, tag);
      phase = "result";
      rerender();
    });
  });

  document.getElementById("is-learn-why-toggle")?.addEventListener("click", () => {
    learnWhyOpen = !learnWhyOpen;
    rerender();
  });

  document.getElementById("is-journal-btn")?.addEventListener("click", () => {
    // journal-entry.js's journalEntryType pre-select wiring is dormant
    // (flagged separately on the master schedule, not fixed here — out
    // of this session's scope). Route there plainly; the person can
    // write freely, same as tapping the Journal card from Noticing
    // directly.
    store.set("journalEntryType", null);
    router.navigate("journal-entry");
  });

  document.getElementById("is-door-btn")?.addEventListener("click", () => {
    router.navigate("upgrade");
  });

  document.getElementById("is-done-btn")?.addEventListener("click", () => {
    phase = "landing";
    activeMovementId = null;
    activeScenario = null;
    chosenOption = null;
    learnWhyOpen = false;
    router.navigate("noticing");
  });
}
