/**
 * js/views/know-what.js
 * 28 Sep 2026 v2
 *
 * v2 - Work list 2e. The time windows come from data/time-windows.js
 *   (the old engine that held them is deleted). Same numbers.
 *
 * SMOOTH-P3b. "I know what I want". Spec 4.6.
 *
 * The second door on Plan Home, for somebody who has already decided.
 * One screen: what kind, how long, anything sore, where -- then the plan
 * (coach-proposal), which says back what they asked for. No energy or
 * mood questions: the person has told us what they want. If today's
 * check-in exists the builder still reads it.
 *
 * THE FASTEST ROUTE IS THREE TAPS. Home "I know what I want" · a kind ·
 * "Show me the plan". Everything else is preselected from what we know:
 * the length they picked last time, where they last trained, Full body
 * for strength. Sore is asked and optional: left alone, today's check-in
 * answer stands.
 *
 * SORE WRITES WHAT THE CHECK-IN WRITES. The same areas, the same three
 * "how sore" answers with the same scores, through the same store calls
 * (addSoreArea for a new area, updateConditionPainScores for the day).
 * So the plan excludes exactly what it would have excluded after a
 * check-in -- one rule, not two.
 *
 * DEVIATIONS FROM THE SPEC, both for honesty, recorded in the schedule:
 *   - Lengths are 20 · 30 · 40 · 60, not 20 · 30 · 45 · 60. The builder's
 *     lengths are 10/20/30/40/50/60 (the plan's own time chip cycles
 *     them). Offering 45 and building 40 would say one thing and do
 *     another.
 *   - "Last time you picked 40", not "40 is what you usually pick". What
 *     is stored is the last length chosen, not a habit.
 *   - Yoga & Pilates opens the yoga session. The classes are not yoga or
 *     Pilates; the yoga session is, and it already exists.
 *
 * NOTHING LEAVES THE APP. What used to sit in Plan Home's rooms and is
 * not one of the three doors is here, at the foot: your saved sessions
 * (counted), the full builder, Mobility & Conditioning and the
 * twelve-week shape.
 *
 * A11Y. Every choice is a native radio inside a fieldset with a legend,
 * so arrow keys, state and grouping are the browser's own. The only
 * multi-choice (sore areas) is checkboxes. "Show me the plan" is never
 * disabled: a missing answer is said in an alert and focus goes to it
 * (3.3.1). Nothing is conveyed by colour alone (the checked chip is
 * bold with a thicker border as well as coloured).
 */

import { store } from "../store.js";
import { CONDITIONS, soreAreaOptions } from "../data/conditions.js";
import { savedSessions } from "../data/saved-sessions.js";
import { AVAILABLE_TIME_WINDOW_MINUTES } from "../data/time-windows.js";

export const KINDS = [
  { id: "strength", label: "Strength" },
  { id: "cardio",   label: "Cardio" },
  { id: "core",     label: "Core" },
  { id: "mobility", label: "Mobility" },
  { id: "stretch",  label: "Stretch" },
  { id: "yoga",     label: "Yoga & Pilates" },
];

export const PARTS = [
  { id: "upper", label: "Upper" },
  { id: "lower", label: "Lower" },
  { id: "full",  label: "Full body" },
  { id: "glute", label: "Glutes" },
];

/** Minutes -> the builder's own length category. Only lengths it builds. */
export const LENGTHS = [
  { mins: 20, cat: "quick" },
  { mins: 30, cat: "short" },
  { mins: 40, cat: "standard" },
  { mins: 60, cat: "open" },
];

export const PLACES = [
  { id: "gym",     label: "At the gym" },
  { id: "home",    label: "At home" },
  { id: "outside", label: "Outside" },
];

/** The check-in's own answers and scores (checkin.js PAIN_CHIPS). */
export const HOW_SORE = [
  { label: "A little",   value: 4 },
  { label: "Quite sore", value: 6 },
  { label: "Bad",        value: 8 },
];

const COMMON_AREAS = ["lower-back", "knee", "shoulder", "hip", "upper-back"];

const _name = id => CONDITIONS.find(c => c.id === id)?.name || id;
const _esc  = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** The length to preselect, and whether it came from them. */
export function preselectedLength() {
  const cat = store.get("availableTime");
  const exact = LENGTHS.find(l => l.cat === cat);
  if (exact) return { mins: exact.mins, fromThem: true };
  const m = AVAILABLE_TIME_WINDOW_MINUTES[cat];
  if (m) {
    // A length the builder has but this screen does not offer (10, 50):
    // the nearest one here, and not claimed as their pick.
    const near = LENGTHS.reduce((a, b) => Math.abs(b.mins - m) < Math.abs(a.mins - m) ? b : a);
    return { mins: near.mins, fromThem: false };
  }
  return { mins: 30, fromThem: false };
}

/** Where they last trained; the gym when their only kit is at one (as the plan decides). */
export function preselectedPlace() {
  const loc = store.get("sessionLocation");
  if (loc === "gym" || loc === "home" || loc === "outside") return loc;
  const gym   = store.get("gymEquipment")  || [];
  const home  = store.get("homeEquipment") || [];
  const ident = store.get("movementIdentity") || [];
  if (gym.length && (!home.length || (Array.isArray(ident) && ident.includes("gym")))) return "gym";
  return "home";
}

/** Areas offered first: their own sore-able areas, then the common ones. */
function _offeredAreas() {
  const soreable = new Set(soreAreaOptions([]).map(o => o.id));
  const own = (store.get("conditions") || []).filter(id => soreable.has(id));
  const common = COMMON_AREAS.filter(id => !own.includes(id));
  return { own, common };
}

export function KnowWhatView(router) {
  let kind   = null;
  let part   = "full";
  let mins   = 30;
  let place  = "home";
  let sore   = null;           // null = not answered; [] = nothing; [ids] = areas
  let levels = {};             // area id -> score
  let extra  = [];             // areas added from "Somewhere else"
  let error  = "";
  let root   = null;

  function mount(container) {
    root   = container;
    kind   = null; part = "full"; sore = null; levels = {}; extra = []; error = "";
    mins   = preselectedLength().mins;
    place  = preselectedPlace();
    paint();
    container.querySelector("h1")?.focus();
  }

  function _radio(name, value, label, checked) {
    return `
      <label class="kw-chip">
        <input type="radio" name="${name}" value="${_esc(value)}" ${checked ? "checked" : ""}>
        <span>${_esc(label)}</span>
      </label>`;
  }

  function _soreBlock() {
    const { own, common } = _offeredAreas();
    const areas = [...own, ...common, ...extra.filter(a => !own.includes(a) && !common.includes(a))];
    const chosen = Array.isArray(sore) ? sore : [];
    const more = soreAreaOptions(areas);
    return `
      <fieldset class="kw-q" id="kw-sore">
        <legend class="kw-q__legend">Anything sore? <span class="kw-q__opt">Optional</span></legend>
        <div class="kw-chips">
          <label class="kw-chip">
            <input type="checkbox" name="sore-none" value="none" ${Array.isArray(sore) && !sore.length ? "checked" : ""}>
            <span>Nothing</span>
          </label>
          ${areas.map(id => `
            <label class="kw-chip">
              <input type="checkbox" name="sore" value="${_esc(id)}" ${chosen.includes(id) ? "checked" : ""}>
              <span>${_esc(_name(id))}</span>
            </label>`).join("")}
        </div>
        ${more.length ? `
          <label class="kw-more" for="kw-sore-more">Somewhere else</label>
          <select class="kw-select" id="kw-sore-more">
            <option value="">Choose an area</option>
            ${more.map(o => `<option value="${_esc(o.id)}">${_esc(o.name)}</option>`).join("")}
          </select>` : ""}
        ${chosen.map(id => `
          <fieldset class="kw-q kw-q--inner" id="kw-how-${_esc(id)}">
            <legend class="kw-q__legend">How sore is your ${_esc(_name(id).toLowerCase())}?</legend>
            <div class="kw-chips kw-chips--3">
              ${HOW_SORE.map(h => _radio(`how-${id}`, h.value, h.label, levels[id] === h.value)).join("")}
            </div>
          </fieldset>`).join("")}
        ${chosen.length ? `<p class="kw-note">If anything is sharp, getting worse, or doesn't feel right, stop.</p>` : ""}
      </fieldset>`;
  }

  function paint() {
    const saved = savedSessions().length;
    const pre   = preselectedLength();
    const yoga  = kind === "yoga";
    const prog  = store.get("activeProgramme") || {};
    root.innerHTML = `
      <div class="view kw-view">
        <h1 class="kw-title" id="kw-title" tabindex="-1">What are you after?</h1>
        <form class="kw-form" novalidate>
          <fieldset class="kw-q" id="kw-kind">
            <legend class="sr-only">What are you after?</legend>
            <div class="kw-tiles">
              ${KINDS.map(k => `
                <label class="kw-tile">
                  <input type="radio" name="kind" value="${k.id}" ${kind === k.id ? "checked" : ""}>
                  <span>${_esc(k.label)}</span>
                </label>`).join("")}
            </div>
          </fieldset>

          ${kind === "strength" ? `
            <fieldset class="kw-q" id="kw-part">
              <legend class="kw-q__legend">Which part?</legend>
              <div class="kw-chips kw-chips--2">${PARTS.map(p => _radio("part", p.id, p.label, part === p.id)).join("")}</div>
            </fieldset>` : ""}

          ${yoga ? `
            <p class="kw-note">Yoga and Pilates have their own session, so these questions aren't needed.</p>` : `
            <fieldset class="kw-q" id="kw-length">
              <legend class="kw-q__legend">How long?</legend>
              <div class="kw-chips kw-chips--4">${LENGTHS.map(l => _radio("length", l.mins, `${l.mins} min`, mins === l.mins)).join("")}</div>
              ${pre.fromThem ? `<p class="kw-hint">Last time you picked ${pre.mins}.</p>` : ""}
            </fieldset>

            ${_soreBlock()}

            <fieldset class="kw-q" id="kw-place">
              <legend class="kw-q__legend">Where?</legend>
              <div class="kw-chips kw-chips--3">${PLACES.map(p => _radio("place", p.id, p.label, place === p.id)).join("")}</div>
            </fieldset>`}

          <p class="kw-error" id="kw-error" role="alert">${_esc(error)}</p>
          <button type="submit" class="btn btn-primary btn-large btn-full" id="kw-go">
            ${yoga ? "Go to yoga &amp; Pilates" : "Show me the plan"}
          </button>
        </form>

        <div class="kw-foot">
          ${saved ? `
            <button class="btn btn-secondary btn-full" data-kw-route="saved-sessions">
              Or one you saved (${saved})
            </button>` : ""}
          <p class="kw-links">
            <button class="home-link" data-kw-route="session-builder">Build your own, move by move</button>
            <button class="home-link" data-kw-route="mobility-conditioning">Mobility &amp; Conditioning</button>
            <button class="home-link" data-kw-route="${prog.programmeId ? "my-programme" : "goal-setup"}">A twelve-week shape</button>
          </p>
        </div>
      </div>`;
    attach();
  }

  /** Repaint and put focus back on what was just used, so a reveal never loses the person. */
  function repaint(focusSel) {
    paint();
    if (focusSel) root.querySelector(focusSel)?.focus();
  }

  function attach() {
    const form = root.querySelector(".kw-form");
    form.addEventListener("change", e => {
      const t = e.target;
      if (t.name === "kind") {
        kind = t.value; _clearError();
        repaint(`input[name="kind"][value="${kind}"]`);
      } else if (t.name === "part") part = t.value;
      else if (t.name === "length") mins = Number(t.value);
      else if (t.name === "place") place = t.value;
      else if (t.name === "sore-none") {
        sore = t.checked ? [] : null; levels = {};
        repaint('input[name="sore-none"]');
      } else if (t.name === "sore") {
        const cur = Array.isArray(sore) ? sore : [];
        sore = t.checked ? [...cur, t.value] : cur.filter(a => a !== t.value);
        if (!t.checked) delete levels[t.value];
        if (!sore.length) sore = null;
        repaint(`input[name="sore"][value="${t.value}"]`);
      } else if (t.name?.startsWith("how-")) {
        levels[t.name.slice(4)] = Number(t.value);
      } else if (t.id === "kw-sore-more" && t.value) {
        const id = t.value;
        extra = [...extra, id];
        sore = [...(Array.isArray(sore) ? sore : []), id];
        repaint(`input[name="sore"][value="${id}"]`);
      }
    });
    form.addEventListener("submit", e => { e.preventDefault(); go(); });
    root.querySelectorAll("[data-kw-route]").forEach(b =>
      b.addEventListener("click", () => {
        if (b.dataset.kwRoute === "session-builder") store.set("sessionBuilderPreselect", null);
        router.navigate(b.dataset.kwRoute);
      }));
  }

  function _clearError() { error = ""; const el = root.querySelector("#kw-error"); if (el) el.textContent = ""; }

  function _say(msg, focusSel) {
    error = msg;
    const el = root.querySelector("#kw-error");
    if (el) el.textContent = msg;
    root.querySelector(focusSel)?.focus();
  }

  function go() {
    if (!kind) return _say("Pick what you're after first.", 'input[name="kind"]');
    if (kind === "yoga") { router.navigate("yoga-session"); return; }
    const unrated = (Array.isArray(sore) ? sore : []).find(a => !levels[a]);
    if (unrated) return _say(`Say how sore your ${_name(unrated).toLowerCase()} is.`, `input[name="how-${unrated}"]`);

    const type = kind === "strength" ? part : kind;
    store.set("requestedSessionType", type);
    store.set("availableTime", LENGTHS.find(l => l.mins === mins)?.cat || "short");
    store.set("sessionLocation", place);
    if (Array.isArray(sore)) {
      // Exactly the check-in's writes: a new area joins their list, and
      // the day's scores are what was said now.
      for (const a of sore) if (!(store.get("conditions") || []).includes(a)) store.addSoreArea(a);
      store.updateConditionPainScores(Object.fromEntries(sore.map(a => [a, levels[a]])));
    }
    router.navigate("coach-proposal");
  }

  function onUnmount() { root = null; }

  return { mount, onUnmount };
}
