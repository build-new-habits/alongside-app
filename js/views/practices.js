/**
 * views/practices.js - Guided Practices
 *
 * 18 Aug 2026 v1
 *
 * PRAC-1. The door for the 28 whole practices that no view referenced.
 *
 * Route: "practices"
 * Nav:   hidden (reached from the Library, which maps to Today)
 * Tier:  FREE, and not gated. "Free = coach-chosen full-body session +
 *        all wellbeing practices." Nothing on this screen is a plan or
 *        a journey, so nothing on it is paid.
 *
 * ── WHAT THIS SERVES, AND FROM WHERE ──────────────────────────────────
 *
 * Whole items, not components. The set comes from
 * data/practice-library.js and is DERIVED there, not listed — see that
 * file's header for why a hardcoded array of 28 ids would have been the
 * same fault it exists to fix.
 *
 * This file holds no practice content of its own. No ids, no copied
 * instruction text. If a practice is wrong, it is wrong in the
 * database, in one place.
 *
 * ── WHY THE FACTORY PATTERN, NOT render()/onMount() ───────────────────
 *
 * Both are live and the router supports both. This one uses the factory
 * because the screen carries navigation state, and that state must not
 * survive leaving.
 *
 * The router caches view MODULES, so module-level state persists across
 * navigations — and `onUnmount` HAS NO CALLER. quiet-session.js's own
 * header says it is "called by router.navigate() before leaving this
 * view"; grep the repo and nothing calls it, in the router or anywhere
 * else. Another confident comment describing a mechanism that is not
 * there. Logged, not fixed here — it is outside this session's scope
 * and it affects two other files.
 *
 * A closure sidesteps it entirely: the factory runs on every mount, so
 * state starts fresh every time by construction rather than by cleanup
 * somebody has to remember to call.
 *
 * ── THREE SCREENS, ONE FILE ───────────────────────────────────────────
 *
 * groups -> items -> one practice. Same shape as library.js, and the
 * same reason: choosing from four is a different act from choosing from
 * twenty-eight, and this product is built for people for whom that
 * difference is not trivial.
 *
 * ── NO TIMER, DELIBERATELY ────────────────────────────────────────────
 *
 * These 28 items do not share a shape. A hydration protocol, a
 * twenty-minute nap, a sleep-position adjustment and a 5-4-3-2-1
 * grounding cannot sit behind one countdown, and a countdown on "Sleep
 * Position Optimisation" is nonsense. Timed sitting already exists and
 * is already good: quiet-session's mindful mode.
 *
 * So the duration is a guide and nothing counts down. That also keeps
 * this screen clear of the exit-confirm, partial-save and session-guard
 * machinery a running timer requires, none of which a page of
 * instructions needs.
 *
 * ── NO COUNTS, NO STREAKS ─────────────────────────────────────────────
 *
 * "I did this" writes an activity entry, the same as a breathing
 * practice or a logged walk. It does not say how many times, does not
 * compare to last week, and does not congratulate. The log is a record
 * the coach displays and never interprets (P4). A person can read a
 * practice, do it, and leave without touching the button, and the
 * product has no opinion about that.
 *
 * ── watchOut AND load: MOVEMENT GROUPS ONLY ───────────────────────────
 *
 * The circuits and warm-ups carry specific, useful watchOut lines
 * ("Landing or catching with locked joints"). The recovery and
 * grounding practices carry a copy-pasted BREATHING watchOut — 44
 * entries across the database share the identical three lines, so
 * "Lifting the shoulders on the in-breath instead of expanding the
 * ribs" currently sits on the cold shower protocol and on the nap.
 *
 * Showing it would put visibly wrong guidance on a wellbeing screen.
 * Suppressing by group rather than editing 44 entries keeps this
 * session inside its scope; the data defect is LOGGED, not fixed here.
 * The rule stays honest once the data is corrected: watchOut is a field
 * about movement form, and a hydration protocol has no form to get
 * wrong.
 */

import { store } from "../store.js";
// SHARED-1. Caught by verify-shared1.mjs, which classifies this as a
// session view the moment it calls store.logActivity() — correctly.
// Somebody's first thing in the product could be a three-minute
// grounding practice, and a first session must be marked whichever
// door it came through. This view does not route to reflect.js, so it
// renders them itself, as breathing-session.js does.
//
// No exerciseIds passed, deliberately and for the same reason
// breathing-session.js passes none: that argument is what triggers the
// baseline "how did that feel" ask, and asking somebody to rate a
// grounding practice turns a thing done for its own sake into a thing
// being assessed. That is the frame these exist outside of.
import { renderSessionMoments } from "../data/session-moments.js";
import { getPracticeGroups, getPractice } from "../data/practice-library.js";

export const centered = false;

// ── Helpers ───────────────────────────────────────────────────────────────────

function personContext() {
  return {
    conditionIds: store.get("conditions") || [],
    painScores:   store.get("conditionPainScores") || {}
  };
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"]/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

/**
 * "About 3 minutes". Rounded, and always hedged: the number is there to
 * answer "does this fit the time I have", not to be a target.
 */
function durationText(seconds) {
  const mins = Math.max(1, Math.round((seconds || 0) / 60));
  return `About ${mins} minute${mins === 1 ? "" : "s"}`;
}

function firstSentence(text) {
  const t = String(text || "").trim();
  if (!t) return "";
  const stop = t.indexOf(". ");
  return stop === -1 ? t : t.slice(0, stop + 1);
}

// ── View ──────────────────────────────────────────────────────────────────────

export function PracticesView(router) {

  // Where in the three screens somebody is. Not a fact about the person,
  // so it lives here and not in the store — and it is gone the moment
  // they leave, which is the point of the closure.
  let screen         = "groups";   // "groups" | "items" | "practice"
  let openGroupId    = null;
  let openPracticeId = null;
  let acknowledged   = false;

  function mount(container) {
    draw(container);
  }

  function draw(container) {
    container.innerHTML = html();
    wire(container);
  }

  // ── Markup ────────────────────────────────────────────────────────

  function shell(title, backLabel, body) {
    return `
      <div class="view practices-view" role="main" aria-label="Practices">
        <div class="practices-header">
          <button class="btn btn-ghost btn-small practices-back-btn"
                  id="practices-back-btn" aria-label="${esc(backLabel)}">
            &larr; Back
          </button>
          <h1 class="practices-title">${esc(title)}</h1>
        </div>
        ${body}
      </div>
    `;
  }

  function html() {
    if (screen === "practice") return practiceScreen();
    if (screen === "items")    return itemsScreen();
    return groupsScreen();
  }

  function groupsScreen() {
    const groups = getPracticeGroups(personContext());

    if (!groups.length) {
      return shell("Practices", "Back to the Library", `
        <p class="practices-intro">
          There is nothing here that would sit well with you today. That is the
          practices being careful, not you being limited.
        </p>
      `);
    }

    return shell("Practices", "Back to the Library", `
      <p class="practices-intro">
        Whole practices, start to finish. Nothing here is part of a session —
        each one is the thing itself.
      </p>

      <ul class="practices-group-grid" role="list">
        ${groups.map(g => `
          <li>
            <button class="practices-group-card" data-group="${esc(g.id)}"
                    aria-label="${esc(g.label)}: ${esc(g.description)}">
              <span class="practices-group-label">${esc(g.label)}</span>
              <span class="practices-group-sub">${esc(g.description)}</span>
            </button>
          </li>
        `).join("")}
      </ul>
    `);
  }

  function itemsScreen() {
    const group = getPracticeGroups(personContext()).find(g => g.id === openGroupId);
    if (!group) { screen = "groups"; return groupsScreen(); }

    return shell(group.label, "Back to practices", `
      <p class="practices-intro">${esc(group.description)}</p>

      <ul class="practices-item-grid" role="list">
        ${group.items.map(item => `
          <li>
            <button class="practices-item-card" data-practice="${esc(item.id)}"
                    aria-label="${esc(item.name)}. ${esc(durationText(item.duration))}">
              <span class="practices-item-name">${esc(item.name)}</span>
              <span class="practices-item-meta">${esc(durationText(item.duration))}</span>
              ${item.why ? `<span class="practices-item-why">${esc(firstSentence(item.why))}</span>` : ""}
            </button>
          </li>
        `).join("")}
      </ul>
    `);
  }

  function practiceScreen() {
    const p = getPractice(openPracticeId, personContext());
    if (!p) { screen = "items"; return itemsScreen(); }

    const equipment = (p.equipment || []).filter(Boolean);
    const optional  = (p.equipmentOptional || []).filter(Boolean);

    return shell(p.name, `Back to ${p.group.label}`, `
      <p class="practices-meta">${esc(durationText(p.duration))}</p>

      ${p.safety === "caution" ? `
        <div class="practices-caution">
          <p>Worth taking gently today. You told me about something this could press
          on, so stay well inside what feels comfortable, and stop if it does not.</p>
        </div>
      ` : ""}

      ${equipment.length ? `
        <p class="practices-kit">You will need: ${esc(equipment.join(", "))}</p>
      ` : ""}
      ${optional.length ? `
        <p class="practices-kit">Useful if you have it: ${esc(optional.join(", "))}</p>
      ` : ""}

      ${p.why ? `
        <section class="practices-block" aria-labelledby="prac-why-h">
          <h2 class="practices-block-title" id="prac-why-h">Why this helps</h2>
          <p>${esc(p.why)}</p>
        </section>
      ` : ""}

      ${(p.instructions || []).length ? `
        <section class="practices-block" aria-labelledby="prac-how-h">
          <h2 class="practices-block-title" id="prac-how-h">How</h2>
          <ol class="practices-steps">
            ${p.instructions.map(step => `<li>${esc(step)}</li>`).join("")}
          </ol>
        </section>
      ` : ""}

      ${p.coaching ? `
        <div class="practices-coach">
          <p>${esc(p.coaching)}</p>
        </div>
      ` : ""}

      ${p.group.movement && (p.watchOut || []).length ? `
        <section class="practices-block" aria-labelledby="prac-watch-h">
          <h2 class="practices-block-title" id="prac-watch-h">Worth watching for</h2>
          <ul class="practices-watch" role="list">
            ${p.watchOut.map(w => `<li>${esc(w)}</li>`).join("")}
          </ul>
          ${p.load ? `<p class="practices-load">${esc(p.load)}</p>` : ""}
        </section>
      ` : ""}

      ${acknowledged ? `
        <div class="practices-ack" role="status">
          <p>Logged. That is all it needs to be.</p>
        </div>
        ${renderSessionMoments({})}
      ` : `
        <button class="btn btn-primary practices-did-btn" id="practices-did-btn">
          I did this
        </button>
      `}
    `);
  }

  // ── Wiring ────────────────────────────────────────────────────────

  function wire(container) {
    container.querySelector("#practices-back-btn")?.addEventListener("click", () => {
      acknowledged = false;
      if (screen === "practice") {
        screen = "items";
        openPracticeId = null;
        draw(container);
        return;
      }
      if (screen === "items") {
        screen = "groups";
        openGroupId = null;
        draw(container);
        return;
      }
      router?.navigate?.("library");
    });

    container.querySelectorAll("[data-group]").forEach(btn => {
      btn.addEventListener("click", () => {
        openGroupId = btn.dataset.group;
        screen = "items";
        draw(container);
      });
    });

    container.querySelectorAll("[data-practice]").forEach(btn => {
      btn.addEventListener("click", () => {
        openPracticeId = btn.dataset.practice;
        acknowledged = false;
        screen = "practice";
        draw(container);
      });
    });

    container.querySelector("#practices-did-btn")?.addEventListener("click", () => {
      const p = getPractice(openPracticeId, personContext());
      if (!p) return;
      logPractice(p);
      acknowledged = true;
      draw(container);
    });
  }

  return { mount };
}

// ── Logging ───────────────────────────────────────────────────────────────────

/**
 * The shared write path, store.logActivity(), which owns the dedupe,
 * the empty-session guard and exerciseHistory. Writing straight to
 * activityLog is exactly what PT-6 was raised to remove.
 *
 * durationMins IS recorded, unlike quiet-session, where the length is
 * the number the person chose and is already in the name. Here it is a
 * property of the practice and progress.js has no other way to see it.
 */
function logPractice(p) {
  const nowIso  = new Date().toISOString();
  const credits = p.credits || 20;

  store.logActivity({
    id:            "practice-" + Date.now(),
    type:          "practice",
    name:          p.name,
    source:        "practices",
    status:        "completed",
    creditsEarned: credits,
    durationMins:  Math.max(1, Math.round((p.duration || 0) / 60)),
    exerciseIds:   [p.id],
    completedAt:   nowIso,
    sessionEnd:    nowIso
  });

  store.set("totalCredits", (store.get("totalCredits") || 0) + credits);
  store.set("lastWorkoutCredits", credits);
  store.set("lastWorkoutName", p.name);
}
