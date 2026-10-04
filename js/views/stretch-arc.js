/**
 * js/views/stretch-arc.js
 * 04 Oct 2026 v5
 *
 * v5 - D-3 ARC-HOME (Graeme's wife, device test, 04 Oct: tapping "Your
 *   arc" on Home she expected the arc, and how to change, renew, update or
 *   develop it; it opened Progress). Home's arc card now opens this
 *   screen, and an arc with an aim reads, in the LOOK cards: Your arc
 *   (h1), Week n and since when; What you're working towards (the aim,
 *   and How you'd know in their words); What feeds it (each strand, when
 *   it last came up); Start today's session; then Change your arc, three
 *   rows, each saying what it does: Change what feeds it, Change how
 *   you'd know (both keep the arc and its week), Start a fresh arc (the
 *   four questions again, this aim already chosen, from week 1); and Stop
 *   the arc, unchanged. Focus lands on the h1.
 *
 * 29 Sep 2026 v4
 *
 * v4 - P26, THE ARC SCREEN SAYS WHAT THE ARC IS (persona finding W2-20).
 *   Accepting a strength arc landed here on a screen titled "Stretch arc",
 *   listing stretch zones and offering "Stretch now". An arc with an aim
 *   is now "Your arc": the aim, each strand with when it last came up (a
 *   date, never a count; data/arc-readback.js), and "Start today's
 *   session". An arc with no aim is still the stretch tracker.
 *
 * v3 - F7 LANDMARK. role="main" (and its label) removed from the view's
 *   wrapper: index.html's <main> is the one main landmark; a second,
 *   nested inside it, is announced twice and fails landmark rules.
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
import { strandReadback, arcWeek } from "../data/arc-readback.js";
import { arcSetupMode } from "./arc-setup.js";
import { lineIcon } from "../data/line-icons.js";

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
      <div class="mc-view">
        <div class="mc-header">
          <button class="btn btn-ghost" id="sa-back-btn" aria-label="Back">&larr; Back</button>
          ${arc.active && arc.aimId ? "" : `<span class="mc-header-title">Stretch arc</span>`}
        </div>

        ${arc.active ? (arc.aimId ? renderAimed() : renderRunning()) : renderOff()}
      </div>`;
    // D-3. A screen of its own: focus starts on its heading.
    container.querySelector("#sa-title")?.focus?.({ preventScroll: true });

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

    // P26 / D-3. An arc with an aim: what it is, today's session, and how
    // to change it.
    function renderAimed() {
      const strands = strandReadback(arc);
      const week    = arcWeek(arc, new Date());
      const since   = whenText(String(arc.startedAt || "").slice(0, 10));
      const row = (go, icon, colour, title, line) => `
          <li>
            <button type="button" class="sa-change" data-arc-change="${go}">
              <span class="kind-tile kind-tile--sm k-${colour}">${lineIcon(icon, 20)}</span>
              <span class="sa-change__text">
                <span class="sa-change__title">${title}</span>
                <span class="sa-change__line">${line}</span>
              </span>
              <span class="sa-change__chev" aria-hidden="true">${lineIcon("chevron", 20)}</span>
            </button>
          </li>`;
      return `
        <h1 class="sa-title" id="sa-title" tabindex="-1">Your arc</h1>
        ${week ? `<p class="sa-meta">Week ${week}${since ? ` \u00B7 since ${esc(since)}` : ""}</p>` : ""}

        <section class="look-card sa-card" aria-labelledby="sa-aim-h">
          <div class="sa-card__head">
            <span class="kind-tile k-teal">${lineIcon("arc")}</span>
            <h2 class="sa-card__label" id="sa-aim-h">What you\u2019re working towards</h2>
          </div>
          <p class="sa-goal">${esc(aimLabel(arc.aimId))}</p>
          ${arc.marker ? `
            <p class="sa-know"><span class="sa-know__label">How you\u2019d know:</span> \u201C${esc(arc.marker)}\u201D</p>` : ""}
        </section>

        ${strands.length ? `
        <section class="look-card sa-card" aria-labelledby="sa-feeds-h">
          <h2 class="sa-card__label" id="sa-feeds-h">What feeds it</h2>
          <ul class="sa-list">
            ${strands.map(r => `<li><span>${esc(r.label)}</span><span class="sa-when">${esc(r.text)}</span></li>`).join("")}
          </ul>
          <p class="sa-note">Nothing owed here \u2014 it's when each last came up, not a target.</p>
        </section>
        ` : ""}

        <button class="btn btn-primary btn-large btn-full" id="sa-today-btn">
          Start today's session
        </button>

        <section class="sa-changes" aria-labelledby="sa-change-h">
          <h2 class="look-label" id="sa-change-h">Change your arc</h2>
          <ul class="look-card sa-change-list">
            ${row("strands", "list", "amber", "Change what feeds it", "Keep this aim; choose different parts. Same arc, same week.")}
            ${row("marker", "pencil", "violet", "Change how you\u2019d know", arc.marker ? "Put it in different words. Same arc, same week." : "Say it in your own words. Same arc, same week.")}
            ${row("fresh", "arc", "teal", "Start a fresh arc", "Keep this aim or choose another, from week 1.")}
          </ul>
        </section>

        <button class="btn btn-ghost btn-full" id="sa-stop-btn">
          Stop the arc
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

    // D-3. Change one part, or start a fresh arc: the four questions,
    // in the mode the row names.
    container.querySelectorAll("[data-arc-change]").forEach(btn => {
      btn.addEventListener("click", () => {
        arcSetupMode(btn.dataset.arcChange);
        router.navigate("arc-setup");
      });
    });

    container.querySelector("#sa-back-btn")?.addEventListener("click", () => {
      // ARC-BACK, 05 Sep 2026. This went to Mobility & Conditioning,
      // which is where the arc USED to live. LOBBY-1b moved it to Home
      // and this was left pointing at the old parent, so Back sent
      // people somewhere they had not come from and there was no way
      // home except starting a session.
      router.navigate("today", { fromBack: true });
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

    container.querySelector("#sa-today-btn")?.addEventListener("click", () => {
      // The coach's plan leans on the arc; it asks how today is first.
      if (store.checkedInToday()) {
        router.navigate("coach-proposal");
      } else {
        store.set("pendingDoorRoute", "coach-proposal");
        router.navigate("checkin");
      }
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
