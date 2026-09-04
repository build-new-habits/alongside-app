/**
 * js/views/arc-setup.js
 * 03 Sep 2026 v1
 *
 * ARC-3-SETUP. The four questions that build an arc.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  THE MODEL IS DECOMPOSITION, NOT SMART
 * ─────────────────────────────────────────────────────────────────────
 *
 * From how a coach actually works. They do not help somebody phrase a
 * goal, they take one apart: "improve your sprint start" becomes the
 * start, the strength under it, the reactivity that triggers it, and how
 * you are at the line.
 *
 *   What do you want to be able to do?   -> specific, as a CAPABILITY
 *   How would you know it was happening? -> replaces "measurable"
 *   What feeds it?                       -> up to three strands
 *   Is this yours?                       -> replaces "relevant"
 *
 * THERE IS NO "BY WHEN", AND THERE NEVER WILL BE. A date is a thing you
 * fail on a Tuesday. verify-arc3.mjs fails if one appears.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  WHY THIS IS THE FIRST PREMIUM EXPERIENCE
 * ─────────────────────────────────────────────────────────────────────
 *
 * Graeme, 3 Sep: upgrading should not reveal a pre-filled arc. The arc
 * should be built WITH the person, and this conversation is the thing
 * worth paying for. So the aim is never guessed from their old goals,
 * even though we could -- being asked is the product.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  ONE SCREEN, ONE QUESTION
 * ─────────────────────────────────────────────────────────────────────
 *
 * Four steps rather than one long form. This is the one place in the app
 * where extra screens are correct: each asks a single thing, which is
 * what the psychological specification requires, and a form asking all
 * four at once would read as an intake questionnaire -- the exact
 * register this product exists to avoid.
 */

import { store } from "../store.js";
import { AIMS, STRANDS, aimById, strandsForAim, situationsFor, aimsFor } from "../data/aims.js";

const esc = s => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

export function ArcSetupView(router) {

  let step    = 1;
  let aimId   = null;
  let chosen  = [];
  let marker  = "";
  let showAll = false;   // "none of these" -- the whole vocabulary, always one tap away

  function mount(container) { render(container); }

  function render(container) {
    container.innerHTML = `
      <div class="mc-view" role="main" aria-label="Setting up your arc">
        <div class="mc-header">
          <button class="btn btn-ghost" id="as-back-btn" aria-label="Back">&larr; Back</button>
          <span class="mc-header-title">Your arc</span>
        </div>
        ${step === 1 ? stepAim()
        : step === 2 ? stepStrands()
        : step === 3 ? stepMarker()
        : stepConfirm()}
      </div>`;
    wire(container);
    // One question per screen means the heading is the question, so it
    // is what a screen reader should land on.
    container.querySelector("h1")?.focus?.();
  }

  // ── 1. The capability ────────────────────────────────────────────
  function stepAim() {
    // SITUATIONS, 03 Sep 2026. v1 showed all fifteen aims to everybody,
    // so a sprinter and a seventy-six-year-old got the same menu.
    // Graeme: "if you're asking more than ten questions to anybody
    // you're asking too many."
    //
    // What is shown is derived from what the app already knows -- age
    // band, activity level, conditions, whether they are coming back
    // from something. Nothing is asked again.
    //
    // NOTHING IS EVER REMOVED FOR AGE OR CONDITION. "None of these"
    // opens the whole vocabulary, and it is present on every render.
    // Deciding what somebody is allowed to want is the judgement this
    // audience already gets everywhere else.
    const shown = showAll ? AIMS.list : aimsFor(situationsFor(store), 8);

    return `
      <h1 class="as-question" tabindex="-1">What do you want to be able to do?</h1>
      <p class="as-help">
        Something you'd notice yourself doing. Not a number \u2014 a thing.
      </p>
      <div class="as-options" role="group" aria-label="Choose one">
        ${shown.map(a => `
          <button class="as-option ${aimId === a.id ? "as-option--on" : ""}"
                  data-aim="${a.id}" aria-pressed="${aimId === a.id}">
            ${esc(a.label)}
          </button>`).join("")}
      </div>

      ${showAll ? `
        <p class="as-count">Everything I can hold for you.</p>
      ` : `
        <button class="btn btn-ghost btn-full" id="as-all-btn">
          None of these \u2014 show me everything
        </button>
      `}

      <button class="btn btn-primary btn-large btn-full" id="as-next-btn" ${aimId ? "" : "disabled"}>
        Continue
      </button>`;
  }

  // ── 2. What feeds it ─────────────────────────────────────────────
  function stepStrands() {
    const cands = strandsForAim(aimId);
    const full  = chosen.length >= AIMS.maxStrands;
    return `
      <h1 class="as-question" tabindex="-1">What feeds it?</h1>
      <p class="as-help">
        Pick up to ${AIMS.maxStrands}. These are what I'll lean your sessions towards.
      </p>
      <div class="as-options" role="group" aria-label="Choose up to ${AIMS.maxStrands}">
        ${cands.map(s => {
          const on = chosen.includes(s.id);
          return `
          <button class="as-option ${on ? "as-option--on" : ""}"
                  data-strand="${s.id}"
                  aria-pressed="${on}"
                  ${!on && full ? "disabled" : ""}>
            ${esc(s.label)}
            ${s.kind === "mind" ? `<span class="as-kind">not a movement</span>` : ""}
          </button>`;
        }).join("")}
      </div>
      <p class="as-count" aria-live="polite">${chosen.length} of ${AIMS.maxStrands} chosen</p>
      <button class="btn btn-primary btn-large btn-full" id="as-next-btn" ${chosen.length ? "" : "disabled"}>
        Continue
      </button>`;
  }

  // ── 3. How they would know ───────────────────────────────────────
  function stepMarker() {
    return `
      <h1 class="as-question" tabindex="-1">How would you know it was happening?</h1>
      <p class="as-help">
        In your words. Nothing measures this and nothing checks it \u2014 I'll just
        read it back to you now and then.
      </p>
      <label class="as-label" for="as-marker">What you'd notice</label>
      <textarea class="as-input" id="as-marker" rows="4"
                placeholder="Getting up off the floor without thinking about it first">${esc(marker)}</textarea>
      <button class="btn btn-primary btn-large btn-full" id="as-next-btn">Continue</button>
      <button class="btn btn-ghost btn-full" id="as-skip-btn">Skip for now</button>`;
  }

  // ── 4. Is this yours ─────────────────────────────────────────────
  function stepConfirm() {
    const aim  = aimById(aimId);
    const labs = chosen.map(id => (STRANDS[id] || {}).label).filter(Boolean);
    return `
      <h1 class="as-question" tabindex="-1">Is this yours?</h1>
      <p class="as-help">
        An aim somebody else picked for you \u2014 a doctor, a partner, an older
        version of you \u2014 is the kind that gets abandoned. This one should be
        yours.
      </p>

      <div class="as-summary">
        <p class="as-summary-aim">${esc(aim ? aim.label : "")}</p>
        <p class="as-summary-strands">${labs.map(esc).join(" \u00B7 ")}</p>
        ${marker.trim() ? `<p class="as-summary-marker">\u201C${esc(marker.trim())}\u201D</p>` : ""}
      </div>

      <p class="as-help">
        No dates, nothing to keep up with. Change it or stop it whenever you like.
      </p>

      <button class="btn btn-primary btn-large btn-full" id="as-start-btn">Yes, that's mine</button>
      <button class="btn btn-ghost btn-full" id="as-restart-btn">Start again</button>`;
  }

  function wire(container) {
    container.querySelector("#as-back-btn")?.addEventListener("click", () => {
      if (step > 1) { step -= 1; render(container); }
      else router.navigate("stretch-arc", { fromBack: true });
    });

    container.querySelector("#as-all-btn")?.addEventListener("click", () => {
      showAll = true;
      render(container);
    });

    container.querySelectorAll("[data-aim]").forEach(btn => {
      btn.addEventListener("click", () => {
        // Changing the aim clears strands: they belong to the aim, and
        // silently keeping ones the new aim does not offer would leave
        // an arc whose parts do not match.
        if (aimId !== btn.dataset.aim) chosen = [];
        aimId = btn.dataset.aim;
        render(container);
      });
    });

    container.querySelectorAll("[data-strand]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.strand;
        if (chosen.includes(id)) chosen = chosen.filter(s => s !== id);
        else if (chosen.length < AIMS.maxStrands) chosen.push(id);
        render(container);
      });
    });

    const ta = container.querySelector("#as-marker");
    ta?.addEventListener("input", () => { marker = ta.value; });

    container.querySelector("#as-next-btn")?.addEventListener("click", () => {
      if (step === 3 && ta) marker = ta.value;
      step += 1;
      render(container);
    });

    container.querySelector("#as-skip-btn")?.addEventListener("click", () => {
      marker = "";
      step = 4;
      render(container);
    });

    container.querySelector("#as-restart-btn")?.addEventListener("click", () => {
      step = 1; aimId = null; chosen = []; marker = "";
      render(container);
    });

    container.querySelector("#as-start-btn")?.addEventListener("click", () => {
      const today = new Date().toISOString().split("T")[0];
      const arc   = store.get("arc") || {};
      store.set("arc", {
        ...arc,
        aimId,
        strands:    chosen.slice(),
        marker:     marker.trim(),
        active:     true,
        provenance: "self",
        acceptedAt: today,
        // Kept if one exists: restarting is a continuation, not a reset.
        startedAt:   arc.startedAt || today,
        zonesWorked: arc.zonesWorked || {},
      });
      router.navigate("stretch-arc");
    });
  }

  return { mount };
}
