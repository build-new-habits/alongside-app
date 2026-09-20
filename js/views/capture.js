/**
 * js/views/capture.js
 * 16 Sep 2026 v1
 *
 * CAPTURE-1. Build as you go, or log what you just did.
 *
 * Graeme, on what the app could not do: "I'm in the gym, I did a thing,
 * record it" -- and "I'm in the gym (or at home) I want to do..... I'll
 * guide you. But the selection needs to be quick and easy so a user can
 * go - machine, lat pull downs, select, trigger cards."
 *
 * ── ONE FEATURE, TWO DOORS, NOT TWO FEATURES ─────────────────────────
 *
 * The same running session either way. The only difference is whether
 * you pick the movement before you do it or after.
 *
 * Graeme's own framing decided the shape: "I'm at the machine, do I know
 * it or do I not, do I need coaching or do I not." Asking that as a
 * question would put a decision in front of somebody already standing at
 * the machine. So the PICKER RESULT CARRIES BOTH ANSWERS:
 *
 *   tap the name      -> walk the card (the PT on the gym floor)
 *   tap "just log it" -> straight into the list (you know this one)
 *
 * Chosen per exercise, in the moment. No mode, no setting.
 *
 * ── THE SELECTION IS THE FEATURE ─────────────────────────────────────
 *
 * Standing at a machine, anything that makes you scroll a library has
 * already failed. So, in order down the screen:
 *
 *   1. one text field, focused on open. "lat" finds Lat Pulldown in
 *      three characters. Typing beats tapping through a hierarchy, and
 *      it is one control rather than a tree to learn.
 *   2. recents. In a gym you repeat yourself; this is a one-tap hit most
 *      of the time.
 *   3. body areas, for when you do not know the name of the thing in
 *      front of you. The fallback, not the primary.
 *
 * ⚫ THE SEARCH IS NOT NEW. searchByTerm() already matches names AND
 * muscles -- built for mid-session swap. A second search would drift
 * from it, and SAVE-ALL is one day old for exactly that reason.
 *
 * ── EVERYTHING COUNTS ────────────────────────────────────────────────
 *
 * Graeme: "Absolutely everything should go towards progress 100%... I've
 * turned up. That's number one. I've done a session. That's number two."
 * And on a captured session counting as much as a proposed one: "I'd say
 * full too."
 *
 * So this writes lastFinishedSession and calls logActivity() exactly as
 * every other session does. ARC-EVERYTHING credits the arc from there,
 * and knows nothing about which door the session came from -- which IS
 * the rule: contribution is computed from what was done, never from how
 * the session was created.
 *
 * ⚫ THE SAFETY GATE IS LOAD-BEARING HERE in a way it is not elsewhere.
 * Every other session has a known list, so the gate fires before
 * exercise 1 of something planned. A capture session has no list at all
 * until somebody makes one, so the gate is the only thing standing
 * before the first movement. Mounted at the top of the picker, before
 * anything can be added.
 */

import { store } from "../store.js";
import { EXERCISES } from "../data/exercises/index.js";
import { searchByTerm } from "../data/muscle-search.js";
import { isGateDue, renderSafetyGate, attachSafetyGate } from "../safety-gate.js";
import { TARGET_AREAS } from "../stretch-target.js";

export const centered = false;

/** What has been captured this session. Cleared when the view is left. */
let captured = [];
let query    = "";
/**
 * CAPTURE-2, 16 Sep 2026. What kind of session this was, if they say.
 *
 * 🔴 CAPTURE-1 credited the BODY channel from the movements' areas and
 * deliberately did not invent a sessionType -- a captured set of
 * movements is not one of the builder's eight types. That was right, and
 * it left a hole: capability strands light from sessionTypes, and 18 of
 * the 30 strands in the library are capability strands. A captured
 * session could never light Trunk strength, Staying-power or Pacing
 * yourself, however much work went into it.
 *
 * ⚫ ASKING IS NOT INVENTING. The answer is the person's, so it can
 * credit the arc honestly -- the same distinction that governs what this
 * app records anywhere: stated, not inferred. Null until they say, and
 * skipping is a first-class answer rather than a nag.
 */
let kind = null;

/**
 * CAPTURE-2. A short list, not the builder's nine.
 *
 * "Gym" is left out: it describes WHERE, not what, and no arc strand
 * leans on it. The rest are the types capability strands actually name,
 * in the words somebody would use about the session they just did.
 */
const CAPTURE_KINDS = [
  { id: "full",     label: "Full body" },
  { id: "upper",    label: "Upper body" },
  { id: "lower",    label: "Lower body" },
  { id: "core",     label: "Core" },
  { id: "glute",    label: "Glutes" },
  { id: "cardio",   label: "Cardio" },
  { id: "mobility", label: "Mobility" },
  { id: "stretch",  label: "Stretching" }
];

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * Recents, most recently done first.
 *
 * Read from exerciseHistory rather than from the activity log, because
 * the log records SESSIONS and this needs MOVEMENTS.
 *
 * 🔴 exerciseHistory IS A MAP, NOT AN ARRAY: { [id]: { n, first, last,
 * best } }, deliberately, so selection can ask "how often, how recently"
 * without scanning thousands of entries on a phone. The first draft of
 * this function treated it as an array and walked it backwards -- which
 * would have returned an empty list for every user forever, exactly like
 * STRETCH-WHY's two dead branches this morning. Ground-truthed against
 * store.js rather than assumed, which is now the fourth time today that
 * check has paid.
 *
 * Silent when there are none: a "Recent" heading over an empty list
 * tells somebody the app expected something of them that has not
 * happened.
 */
function recentExercises(limit = 6) {
  let hist = null;
  try { hist = store.get("exerciseHistory"); } catch { return []; }
  if (!hist || typeof hist !== "object") return [];

  return Object.entries(hist)
    .filter(([, v]) => v && v.last)
    .sort((a, b) => new Date(b[1].last) - new Date(a[1].last))
    .map(([id]) => EXERCISES.find(e => e.id === id))
    .filter(Boolean)                 // gone from the library; say nothing
    .slice(0, limit);
}

function results() {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const byName = EXERCISES.filter(e => (e.name || "").toLowerCase().includes(q));
  const { exercises: byArea } = searchByTerm(q, EXERCISES);
  const seen = new Set(byName.map(e => e.id));
  return [...byName, ...byArea.filter(e => !seen.has(e.id))].slice(0, 12);
}

/**
 * One result, two targets.
 *
 * The name is the button that walks the card; "just log it" is a
 * separate control beside it. Two targets rather than one row with a
 * mode, because the choice is per exercise and belongs in the moment.
 */
function resultRow(ex) {
  return `
    <li class="cap-result">
      <button type="button" class="cap-result__name" data-walk="${esc(ex.id)}">
        ${esc(ex.name)}
      </button>
      <button type="button" class="cap-result__log" data-log="${esc(ex.id)}"
              aria-label="Just log ${esc(ex.name)}, without the instructions">
        Just log it
      </button>
    </li>`;
}

export function render() {
  // CAPTURE-1. Before anything can be added -- see the header.
  if (isGateDue()) {
    return `<div class="view capture-view">${renderSafetyGate()}</div>`;
  }

  const recent = recentExercises();
  const found  = results();
  const q      = query.trim();

  return `
    <div class="view capture-view">
      <div class="view-header">
        <h1>What did you do?</h1>
        <p class="text-sm text-muted">
          Add them as you go, or afterwards. It all counts the same.
        </p>
      </div>

      <label class="sr-only" for="cap-search">Search for a movement</label>
      <input type="search" id="cap-search" class="cap-search"
             placeholder="Type a movement or a muscle"
             value="${esc(query)}" autocomplete="off" enterkeyhint="search">

      <p class="cap-status" id="cap-status" role="status" aria-live="polite">
        ${q.length >= 2
          ? `${found.length} ${found.length === 1 ? "movement" : "movements"} for \u201c${esc(q)}\u201d.`
          : ""}
      </p>

      ${found.length ? `
        <ul class="cap-results">${found.map(resultRow).join("")}</ul>
      ` : q.length >= 2 ? `
        <p class="cap-empty">
          Nothing matching \u201c${esc(q)}\u201d. Try a muscle \u2014 lats, quads \u2014 or
          part of the name.
        </p>
      ` : ""}

      ${(!q && recent.length) ? `
        <h2 class="cap-heading">Recent</h2>
        <ul class="cap-results">${recent.map(resultRow).join("")}</ul>
      ` : ""}

      ${!q ? `
        <h2 class="cap-heading">Or by body area</h2>
        <ul class="cap-areas">
          ${TARGET_AREAS.filter(t => t.areas.length).map(t => `
            <li>
              <button type="button" class="cap-area" data-area="${esc(t.id)}">
                ${esc(t.label)}
              </button>
            </li>`).join("")}
        </ul>
      ` : ""}

      ${captured.length ? `
        <h2 class="cap-heading">So far today</h2>
        <ul class="cap-done">
          ${captured.map((c, i) => `
            <li class="cap-done__row">
              <span>${esc(c.name)}</span>
              <button type="button" class="cap-done__remove" data-remove="${i}"
                      aria-label="Remove ${esc(c.name)}">Remove</button>
            </li>`).join("")}
        </ul>
        <!--
          CAPTURE-2. Optional, and last: somebody cannot say what a
          session was before they have done it, and asking first would
          turn a picker into a form. Skipping costs nothing except the
          capability half of the credit, which is the honest trade.
        -->
        <h2 class="cap-heading" id="cap-kind-h">What was this, roughly?</h2>
        <ul class="cap-areas" role="group" aria-labelledby="cap-kind-h">
          ${CAPTURE_KINDS.map(k => `
            <li>
              <button type="button" class="cap-area${kind === k.id ? " is-selected" : ""}"
                      data-kind="${esc(k.id)}"
                      aria-pressed="${kind === k.id ? "true" : "false"}">
                ${esc(k.label)}
              </button>
            </li>`).join("")}
        </ul>
        <p class="cap-empty">
          ${kind
            ? "That lets it count towards the parts of your arc this kind of session builds."
            : "Optional. Without it, this still counts for the areas you worked."}
        </p>

        <button type="button" class="btn btn-primary btn-full" id="cap-finish">
          Finish \u2014 ${captured.length} ${captured.length === 1 ? "movement" : "movements"}
        </button>
      ` : `
        <p class="cap-empty-note">
          Nothing added yet. Find the first one above.
        </p>
      `}
    </div>`;
}

function rerender() {
  const root = document.getElementById("main-content") || document.getElementById("app");
  if (!root) return;
  root.innerHTML = render();
  onMount();
}

/**
 * Finish.
 *
 * Writes the same record every other session writes, so logActivity()
 * credits the arc without knowing this came from capture. sessionType is
 * deliberately absent rather than invented: a captured set of movements
 * is not one of the builder's eight types, and claiming one would light
 * an arc strand nothing earned. The BODY channel still credits, from the
 * areas the movements actually work -- which is the honest half.
 */
function finish() {
  if (!captured.length) return;

  // CAPTURE-2. sessionType is included ONLY if they said so. Absent
  // otherwise, exactly as CAPTURE-1 shipped it: the body channel still
  // credits from the areas, and nothing claims a kind of work that was
  // never declared.
  const session = {
    id:        "capture",
    title:     "Your own, as you went",
    exercises: captured.map(c => ({ id: c.id, affectsAreas: c.affectsAreas || [] }))
  };
  if (kind) session.sessionType = kind;

  store.set("lastFinishedSession", { at: new Date().toISOString(), session });

  store.logActivity({
    type:        "capture",
    completedAt: new Date().toISOString(),
    exercises:   captured.map(c => ({ id: c.id, affectsAreas: c.affectsAreas || [] }))
  });

  captured = [];
  query = "";
  kind = null;
  router.navigate("reflect");
}

export function onMount() {
  if (isGateDue()) {
    attachSafetyGate(document.getElementById("app") || document, {
      surface:       "capture",
      onAcknowledge: () => rerender(),
      onLeave:       () => router.navigate("today")
    });
    return;
  }

  const search = document.getElementById("cap-search");
  if (search) {
    // Focused on open: somebody standing at a machine should be able to
    // type immediately. Not on a re-render, which would steal focus back
    // from whatever they just pressed.
    if (!query) { try { search.focus(); } catch { /* non-fatal */ } }

    let t = null;
    search.addEventListener("input", (e) => {
      query = e.target.value;
      clearTimeout(t);
      // Debounced: re-rendering on every keystroke loses the caret.
      t = setTimeout(() => {
        const pos = search.selectionStart;
        rerender();
        const next = document.getElementById("cap-search");
        if (next) { next.focus(); try { next.setSelectionRange(pos, pos); } catch { /* fine */ } }
      }, 250);
    });
  }

  const root = document.getElementById("main-content") || document;

  root.addEventListener("click", (ev) => {
    const log = ev.target.closest("[data-log]");
    if (log) {
      const ex = EXERCISES.find(e => e.id === log.dataset.log);
      if (ex) { captured.push(ex); query = ""; rerender(); }
      return;
    }

    const walk = ev.target.closest("[data-walk]");
    if (walk) {
      const ex = EXERCISES.find(e => e.id === walk.dataset.walk);
      if (!ex) return;
      // Reuses the exercise card rather than building a second one: a
      // one-movement session handed to the view that already knows how
      // to walk Decide, Watch out, Do and Note.
      captured.push(ex);
      store.set("generatedSession", {
        session: { id: "capture-one", title: ex.name, exercises: [ex] },
        builtAt: new Date().toISOString(),
        inputs:  { from: "capture" }
      });
      router.navigate("workout");
      return;
    }

    const area = ev.target.closest("[data-area]");
    if (area) {
      const t = TARGET_AREAS.find(x => x.id === area.dataset.area);
      if (t) { query = (t.areas[0] || "").replace(/-/g, " "); rerender(); }
      return;
    }

    const k = ev.target.closest("[data-kind]");
    if (k) {
      // Tapping the chosen one again clears it: a question somebody
      // answered by accident must be un-answerable, or the only way out
      // is to leave and start again.
      kind = (kind === k.dataset.kind) ? null : k.dataset.kind;
      rerender();
      return;
    }

    const rm = ev.target.closest("[data-remove]");
    if (rm) {
      captured.splice(Number(rm.dataset.remove), 1);
      rerender();
      return;
    }

    if (ev.target.closest("#cap-finish")) finish();
  });
}
