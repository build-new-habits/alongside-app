/**
 * js/views/in-step.js
 * 18 Aug 2026 v2
 *
 * v2 - IS-2. Three changes, one product decision and two faults.
 *
 *   STAGED ORDER (Graeme's call, 18 Aug). All four movements were open
 *   from the start, with only a per-movement cooldown after use. On
 *   device that read as "I can access all of it and therefore none of
 *   it lands." Now sequential: Solo, then Partner, then Floor, then
 *   Environment, each opening when the one before it has been answered
 *   once. The per-movement 3-day cooldown is UNCHANGED and still
 *   applies on top -- the two gates do different jobs. The order is not
 *   arbitrary: it widens outward from your own patterns to the people
 *   nearest you to strangers to the world, which is the arc the
 *   scenarios were written in.
 *
 *   DERIVED, NOT STORED. The stage is computed from completedCount,
 *   which already exists. A new field would be a second place holding
 *   the same fact, and the scenario data is the only thing that should
 *   ever define the order. Somebody who already answered a later
 *   movement keeps it -- see isMovementAvailable().
 *
 *   The landing had one coach line describing the FORMAT and nothing
 *   saying what In Step is for. An intro now sits above the movements.
 *
 *   A bare completedCount digit sat on each card with no label. It read
 *   as a score in a product that does not score, and a screen reader
 *   got a naked number. Removed -- see the note at the render.
 *
 *   The locked cards used inline opacity: 0.55, the same fault
 *   A11Y-LOCK fixed in tier-gating.css the same day: it dimmed the
 *   TEXT, not just the chrome, taking --color-text-secondary from
 *   5.97:1 to 2.95:1 on card. Locked state is carried by a dashed
 *   border and explicit wording instead.
 *
 * 09 Aug 2026 v1
 *
 * "In Step" — practice space extending the empathy transfer arc.
 * Route: "in-step". FREE since DOOR-1 (12 Aug 2026) -- the empathy arc
 * is a practice, not a journey, and practices are free. The long-horizon
 * version behind the upgrade door is the paid part.
 *
 * E3, 13 Aug 2026: this line previously still said "Personal tier (gated
 * via js/auth.js isPremium())". The code was right and the header was
 * wrong for a day. Documentation drift of exactly the kind logged at the
 * top of master schedule v183.
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
 * Lock rule, TWO gates, updated 18 Aug (v2):
 *
 *   1. Cooldown, unchanged. After a movement's scenario is answered,
 *      that movement's *next* scenario is locked for 3 days
 *      (IN_STEP_LOCK_DAYS below) — a deliberate anti-binge gap,
 *      matching the 3-4 day cadence already used for the empathy
 *      transfer stage prompts elsewhere in the product.
 *
 *   2. Stage, new. Movements open in MOVEMENTS order, each when the one
 *      before it has been answered at least once. The v1 line that used
 *      to sit here — "all four movements are open from the start; there
 *      is no movement-to-movement gate" — described real v1 behaviour
 *      and is now wrong. Replaced rather than left, since a stale
 *      comment describing a mechanism that is not there is the exact
 *      fault class logged against onUnmount and exercises/index.js.
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

// IS-2. Stage gate. A movement is reached when every movement BEFORE it
// in MOVEMENTS order has been answered at least once. Derived from
// completedCount, which already exists -- no new store field, and the
// scenario data stays the only definition of the order.
//
// Somebody who answered a later movement under v1 keeps it: their own
// completedCount is checked first, so the change never takes away
// something a person has already reached.
function isMovementReached(movementId) {
  const progress = getProgress();
  if ((progress.completedCount?.[movementId] || 0) > 0) return true;

  const index = MOVEMENTS.findIndex(m => m.id === movementId);
  if (index <= 0) return true;   // first movement is always reached
  return MOVEMENTS
    .slice(0, index)
    .every(m => (progress.completedCount?.[m.id] || 0) > 0);
}

// The movement immediately before this one, for the "what opens it" line.
function predecessorName(movementId) {
  const index = MOVEMENTS.findIndex(m => m.id === movementId);
  if (index <= 0) return null;
  return MOVEMENTS[index - 1].name;
}

// Cooldown gate. Separate from the stage gate above and applied on top:
// one paces a movement you have reached, the other decides whether you
// have reached it. Both must pass.
function isMovementAvailable(movementId) {
  if (!isMovementReached(movementId)) return false;
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

      <div class="card card-coach" style="margin-bottom: var(--space-4);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">
          Different styles, different partners, different spaces. A short scenario, three ways to move
          through it — no right step, just yours.
        </p>
      </div>

      <!--
        IS-2. The coach line above describes the FORMAT. Nothing said what
        In Step is for, which is why it read as a set of four things
        rather than one practice. This is the orientation, in the P2
        helper register rather than coach voice: it explains the screen,
        it does not speak to the person about themselves.
      -->
      <section class="card is-intro" aria-labelledby="is-intro-h"
               style="margin-bottom: var(--space-5); background: var(--color-bg-card);">
        <h2 id="is-intro-h" style="font-size: var(--text-base); font-weight: var(--font-semibold);
                                   margin-bottom: var(--space-2);">What this is</h2>
        <p class="text-secondary" style="font-size: var(--text-sm); margin-bottom: var(--space-2);">
          The same care you practise on yourself here, pointed outward. Each one is a moment you would
          recognise, and three ways of standing in it.
        </p>
        <p class="text-secondary" style="font-size: var(--text-sm); margin-bottom: var(--space-2);">
          Nothing is scored and nothing is fed back to you. There is no better answer, and the one you
          pick changes nothing about your sessions.
        </p>
        <p class="text-secondary" style="font-size: var(--text-sm);">
          They open one at a time, widening outward — your own patterns first, then the people nearest
          you, then strangers, then the world that doesn't consult you. A few days between each.
        </p>
      </section>

      <div style="display: flex; flex-direction: column; gap: var(--space-3);">
        ${MOVEMENTS.map(m => {
          const reached   = isMovementReached(m.id);
          const available = isMovementAvailable(m.id);
          const remaining = daysRemaining(m.id);

          // IS-2. Three states, and each says WHY, which the single
          // "Available in N days" line could not: not reached yet,
          // reached but cooling down, open.
          //
          // The bare completedCount digit that used to sit here is gone.
          // An unlabelled number on a card is a score, in a product whose
          // first principle is that it does not evaluate anybody, and a
          // screen reader received it as a naked digit with no context.
          const sub = !reached
            ? `Opens after ${predecessorName(m.id)}`
            : (available
                ? m.tagline
                : `Ready again in ${remaining} day${remaining === 1 ? "" : "s"}`);

          // No opacity dimming. A11Y-LOCK, same day, same reason: it
          // lowers TEXT contrast (--color-text-secondary 5.97:1 -> 2.95:1
          // at 0.55) and encodes state in reduced legibility. The dashed
          // border, the padlock and the wording carry it instead.
          return `
            <button class="card is-movement-card" data-movement="${m.id}"
                    ${available ? "" : "disabled"}
                    style="display: flex; align-items: center; gap: var(--space-4);
                           text-align: left; width: 100%;
                           cursor: ${available ? "pointer" : "default"};
                           background: var(--color-surface);
                           border: 1px ${available ? "solid transparent" : "dashed var(--color-primary)"};"
                    aria-label="${m.name}: ${available ? m.tagline : sub}">
              <span style="font-size: 2rem; flex-shrink: 0; line-height: 1;" aria-hidden="true">${m.icon}</span>
              <div style="flex: 1; min-width: 0;">
                <p style="font-size: var(--text-lg); font-weight: var(--font-semibold);
                          margin-bottom: var(--space-1);">${m.name}</p>
                <p class="text-secondary" style="font-size: var(--text-sm);">${sub}</p>
              </div>
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
