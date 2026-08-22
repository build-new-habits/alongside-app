/**
 * js/views/programme-select.js
 * 22 Aug 2026 v1
 *
 * CHOOSER-1. Choosing a programme AFTER onboarding.
 *
 * REPLACES js/views/onboarding/goal-setup.js, which had never loaded.
 * That file statically imported `{ programmeEngine }` -- a symbol
 * programmeEngine.js does not export -- so it was a link-time
 * SyntaxError, and every one of these five entry points dead-ended:
 *
 *   today.js:734          the chapter-end hinge fallback
 *   settings.js:2229      "change programme"
 *   settings.js:2233      "choose programme"
 *   gym-programme.js:596  chapter finished with no successor
 *   gym-programme.js:601  "new goal"
 *
 * The first of those is the one that matters. Somebody finishes a
 * twelve-week chapter, the coach asks what next, and the answer went
 * nowhere. That is the moment this product works hardest to earn.
 *
 * The route key stays `goal-setup` so those five call sites are
 * untouched. Renaming it is a follow-up, not a reason to edit five view
 * files today -- one of which (today.js) is already scheduled for R2-a,
 * and the touch-once rule exists precisely to stop two sessions editing
 * one file.
 *
 * ── WHY THIS CALLS startChapter() AND plan-select.js DOES NOT ───────
 *
 * plan-select.js writes six activeProgramme fields directly. In
 * onboarding that is harmless, because everything else is already at its
 * default. Here it would be a bug.
 *
 * startChapter() additionally resets sessionsThisWeek, totalSessions,
 * milestones, missedSessions and the two "shown" flags -- and clears
 * `completed`, `completedAt` and `programme.hingeOfferedAt`. That last
 * group is what ANSWERS the hinge. Its own comment in programmeEngine.js
 * says so: until it is cleared, isHingePending() stays true and the
 * offer keeps standing.
 *
 * So a chooser that copied plan-select's write path would let somebody
 * answer the chapter-end question, pick a programme -- and be asked
 * again. Reaching this view from today.js:734 is exactly that case.
 *
 * ── WCAG 2.2 AA ────────────────────────────────────────────────────
 *
 *   - role="radiogroup" on the list, role="radio" + aria-checked on cards
 *   - Arrow-key roving tabindex, as a radiogroup requires (2.1.1)
 *   - Focus moves to the heading on mount, so a screen reader lands on
 *     what changed rather than at the top of the document (2.4.3)
 *   - Back returns to Today. There is no onboarding step to go back to,
 *     and no progress dots -- this is not a wizard and must not pretend
 *     to be one
 *   - 44px minimum touch targets
 *
 * STYLING. `.plan-card` and `.plan-list` come from
 * css/layouts/onboarding-additions.css, which main.css @imports, so they
 * resolve on any route -- verified, not assumed. `.view` and
 * `.view-header` are app-shell conventions used by upgrade.js. The two
 * wrapper classes below are new and carry only spacing.
 */

import { store }        from "../store.js";
import { startChapter } from "../data/programmeEngine.js";
import {
  buildPlanOptions,
  weeklyTargetForVariant,
  renderPlanCard,
  escapeHtml
} from "../data/plan-options.js";

export function ProgrammeSelectView(router) {

  let selectedIndex = 0;

  function mount(container) {
    render(container);
  }

  function render(container) {
    const options = buildPlanOptions();
    const current = store.get("activeProgramme.programmeName") || null;

    if (options.length === 0) {
      // Nothing matched. Say so plainly and let the person leave --
      // never strand them on an empty screen.
      container.innerHTML = `
        <div class="view" role="main">
          <h1 tabindex="-1" id="chooser-heading">Choosing what is next</h1>
          <p>I could not put together options just now. Your current plan is unchanged.</p>
          <button class="btn btn-primary btn-large btn-full" data-action="back">
            Back to today
          </button>
        </div>
      `;
      container.querySelector("[data-action='back']")
        ?.addEventListener("click", () => router.navigate("today"));
      container.querySelector("#chooser-heading")?.focus();
      return;
    }

    container.innerHTML = `
      <div class="view programme-select-view" role="main" aria-label="Choose your next programme">

        <div class="view-header">
          <button class="btn btn-ghost" data-action="back"
                  aria-label="Back to today, without changing your plan">
            &larr; Back
          </button>
        </div>

        <div class="programme-select-body">
          <h1 tabindex="-1" id="chooser-heading">What would you like to do next?</h1>
          ${current ? `
            <p class="text-secondary">
              You have been following ${escapeHtml(current)}. Nothing changes until you confirm.
            </p>
          ` : `
            <p class="text-secondary">
              Here is what I would suggest, based on what you have shared.
            </p>
          `}

          <div class="plan-list" role="radiogroup" aria-labelledby="plan-list-label">
            <p class="sr-only" id="plan-list-label">Choose your next programme</p>
            ${options.map((opt, i) => renderPlanCard(opt, i, i === selectedIndex)).join("")}
          </div>
        </div>

        <div class="programme-select-actions">
          <button class="btn btn-primary btn-large btn-full"
                  data-action="confirm"
                  aria-label="Start this plan">
            Start this plan
          </button>
        </div>

      </div>
    `;

    const cards = [...container.querySelectorAll(".plan-card")];

    function select(index, focus = false) {
      selectedIndex = index;
      cards.forEach((c, i) => {
        const on = i === index;
        c.classList.toggle("plan-card--selected", on);
        c.setAttribute("aria-checked", String(on));
        c.setAttribute("tabindex", on ? "0" : "-1");
        const tick = c.querySelector(".plan-card__select-indicator");
        if (tick) tick.innerHTML = on ? "&#10003;" : "";
      });
      if (focus) cards[index]?.focus();
    }

    cards.forEach((card, i) => {
      card.addEventListener("click", () => select(i));
      // A radiogroup must be arrow-navigable (WCAG 2.1.1). The onboarding
      // screen this was extracted from is click-only; that is logged as a
      // separate fix rather than smuggled into this session.
      card.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowRight") {
          e.preventDefault(); select((i + 1) % cards.length, true);
        } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
          e.preventDefault(); select((i - 1 + cards.length) % cards.length, true);
        } else if (e.key === " " || e.key === "Enter") {
          e.preventDefault(); select(i, true);
        }
      });
    });

    container.querySelector("[data-action='back']")
      ?.addEventListener("click", () => router.navigate("today"));

    container.querySelector("[data-action='confirm']")
      ?.addEventListener("click", () => {
        const chosen = options[selectedIndex];
        if (!chosen) return;

        // startChapter() first -- it is what answers the hinge. See the
        // header note. Order matters: it resets weekly counters, so the
        // weekly target is written afterwards.
        const started = startChapter(chosen.programme.id);
        if (!started) {
          router.navigate("today");
          return;
        }

        store.set("strategicGoal.weeklySessionTarget", weeklyTargetForVariant(chosen.variant));
        store.set("strategicGoal.setAt", new Date().toISOString());

        router.navigate("today");
      });

    // Land the reader on what changed, not at the top of the document.
    container.querySelector("#chooser-heading")?.focus();
  }

  return { mount };
}
