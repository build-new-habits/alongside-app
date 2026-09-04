/**
 * js/views/stretch-arc.js
 * 03 Sep 2026 v2
 *
 * v2 - ARC-3-SETUP. Start routes to the four questions when no aim has
 *   been set. Shows the aim and strands once one has.
 *
 * 03 Sep 2026 v1
 *
 * ARC-2. Starting and stopping a stretch arc.
 *
 * ARC-1 built the machinery -- goal-to-zone leaning, coverage by date,
 * a line for what has not come up yet -- and nothing set
 * stretchArc.active, so none of it could appear. Graeme, having tested
 * the whole flow: "Where's my arc?" It was true. This is the surface.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  WHAT AN ARC IS, AND WHAT IT DELIBERATELY IS NOT
 * ─────────────────────────────────────────────────────────────────────
 *
 * It is a direction, held over weeks. It knows what you are working
 * towards, it leans each session's zones towards that, and it can tell
 * you which parts of you have not come up lately.
 *
 * It has NO schedule, NO session target, and NO end date. Every one of
 * those creates a state you can be behind on, and being behind is the
 * thing this product exists to not do. An arc you have not touched for
 * three weeks is an arc, not a failure -- and it says nothing at all
 * about that, because a plan is not owed anything.
 *
 * NOTHING HERE COUNTS. Coverage is shown as "when", never "how many":
 * "hips came up on the 2nd" is a fact about the plan; "you have done
 * hips four times" is a score. The wording throughout is about what the
 * PLAN has covered, never about what the person has managed -- that
 * distinction is the whole reason a coverage readout can exist in a
 * product with no streaks.
 *
 * STOPPING IS UNPUNISHED AND UNREMARKED. No "are you sure", no summary
 * of what you are giving up, no offer to pause instead. One tap, gone,
 * and the coverage dates are kept so restarting later does not begin
 * from nothing.
 */

import { store } from "../store.js";
import { STRETCH_ZONES, zonesWithCoverage } from "../session-builder.js";
import { zonesForGoal, STRETCH_GOAL_ZONES } from "../data/stretch-goal-zones.js";
import { getGoalLabel } from "../data/goals.js";
import { aimById, STRANDS } from "../data/aims.js";

const aimLabel    = id => (aimById(id) || {}).label || "";
const strandLabel = id => (STRANDS[id] || {}).label || "";

const esc = s => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const labelFor = id => (STRETCH_ZONES.find(z => z.id === id) || {}).label || id;

/** "2 September" from an ISO date, or "" — never "3 days ago", which is a countdown. */
function whenText(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
}

export function StretchArcView(router) {

  function mount(container) { render(container); }

  function render(container) {
    const arc      = store.get("arc") || {};
    const goals    = store.get("goals") || [];
    const goalId   = arc.goalId || goals[0] || null;
    const available = zonesWithCoverage().map(z => z.id);
    const leaning  = zonesForGoal(goalId).filter(id => available.includes(id));
    const worked   = arc.zonesWorked || {};

    const covered  = available.filter(id => worked[id]);
    const notYet   = available.filter(id => !worked[id]);

    container.innerHTML = `
      <div class="mc-view" role="main" aria-label="Stretch arc">
        <div class="mc-header">
          <button class="btn btn-ghost" id="sa-back-btn" aria-label="Back">&larr; Back</button>
          <span class="mc-header-title">Stretch arc</span>
        </div>

        ${arc.active ? renderRunning() : renderOff()}
      </div>`;

    function renderOff() {
      return `
        <p class="sb-coach-line">A direction for your stretching, held over weeks.</p>

        <p class="sa-body">
          I'll lean each session towards what you're working on, and keep track of which
          parts of you have come up so I can tell you what hasn't.
        </p>

        <p class="sa-body">
          There's no schedule and nothing to keep up with. Leave it a week and nothing
          happens \u2014 it's a direction, not a commitment.
        </p>

        ${arc.aimId ? `
          <div class="sa-panel">
            <span class="exercise-section-label">What you're working towards</span>
            <p class="sa-goal">${esc(aimLabel(arc.aimId))}</p>
            ${(arc.strands || []).length ? `
              <p class="sa-zones">${(arc.strands || []).map(strandLabel).filter(Boolean).join(" \u00B7 ")}</p>
            ` : ""}
            ${arc.marker ? `<p class="sa-note">\u201C${esc(arc.marker)}\u201D</p>` : ""}
          </div>
        ` : goalId ? `
          <div class="sa-panel">
            <span class="exercise-section-label">What I'd work towards</span>
            <p class="sa-goal">${esc(getGoalLabel(goalId))}</p>
            ${leaning.length ? `
              <p class="sa-zones">Leaning towards ${leaning.map(labelFor).join(", ")}.</p>
            ` : ""}
          </div>
          <p class="sa-note">
            You can change what you're working towards in Settings, and change the zones
            every time you stretch.
          </p>
        ` : `
          <div class="sa-panel">
            <p class="sa-body">
              You haven't told me what you're working towards yet, so I'd start without a
              lean and just keep track of what comes up. You can add a goal in Settings
              whenever you like.
            </p>
          </div>
        `}

        <button class="btn btn-primary btn-large btn-full" id="sa-start-btn">
          Start
        </button>`;
    }

    function renderRunning() {
      return `
        <p class="sb-coach-line">
          ${goalId ? `Working towards ${esc(getGoalLabel(goalId))}.` : "Keeping track of what comes up."}
        </p>

        ${notYet.length ? `
          <div class="sa-panel">
            <span class="exercise-section-label">Not come up yet</span>
            <p class="sa-zones">${notYet.map(labelFor).join(", ")}.</p>
            <p class="sa-note">Nothing owed here \u2014 it's just what the plan hasn't reached.</p>
          </div>
        ` : `
          <div class="sa-panel">
            <p class="sa-body">Everything I can offer has come up at least once.</p>
          </div>
        `}

        ${covered.length ? `
          <div class="sa-panel">
            <span class="exercise-section-label">Last worked</span>
            <ul class="sa-list">
              ${covered
                .slice()
                .sort((a, b) => String(worked[b]).localeCompare(String(worked[a])))
                .map(id => `<li><span>${labelFor(id)}</span><span class="sa-when">${whenText(worked[id])}</span></li>`)
                .join("")}
            </ul>
          </div>
        ` : ""}

        <button class="btn btn-primary btn-large btn-full" id="sa-stretch-btn">
          Stretch now
        </button>

        <button class="btn btn-ghost btn-full" id="sa-stop-btn">
          Stop the arc
        </button>`;
    }

    container.querySelector("#sa-back-btn")?.addEventListener("click", () => {
      router.navigate("mobility-conditioning");
    });

    container.querySelector("#sa-start-btn")?.addEventListener("click", () => {
      // ARC-3-SETUP. An arc without an aim is a coverage tracker. Send
      // people through the four questions first -- being asked IS the
      // premium experience, so it must not be skippable by anybody who
      // has not already answered.
      if (!arc.aimId) { router.navigate("arc-setup"); return; }
      store.set("arc", {
        ...arc,
        goalId,
        active:    true,
        // Kept if one already exists: restarting is a continuation, not a
        // reset, and re-dating it would erase the only history there is.
        startedAt: arc.startedAt || new Date().toISOString().split("T")[0],
        zonesWorked: arc.zonesWorked || {},
      });
      render(container);
    });

    container.querySelector("#sa-stop-btn")?.addEventListener("click", () => {
      // No confirmation, no summary of what is being given up, no offer
      // to pause instead. Every one of those makes leaving feel like a
      // failure, which is the mechanic this product refuses.
      //
      // zonesWorked survives on purpose: coming back in a month should
      // not start from nothing.
      store.set("arc", { ...store.get("arc"), active: false });
      render(container);
    });

    container.querySelector("#sa-stretch-btn")?.addEventListener("click", () => {
      store.set("sessionBuilderPreselect", { type: "stretch", returnTo: "stretch-arc" });
      if (store.checkedInToday()) {
        router.navigate("session-builder");
      } else {
        store.set("pendingDoorRoute", "session-builder");
        router.navigate("checkin");
      }
    });
  }

  return { mount };
}
