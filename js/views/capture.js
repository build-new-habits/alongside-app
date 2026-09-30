/**
 * js/views/capture.js
 * 30 Sep 2026 v4
 *
 * v4 - W3-13 INTERRUPTIONS (persona Wave 3: 2.4, 2.15, 2.16). The session
 *   waited 3 hours, then was dropped with every set in it. Now it says up
 *   front that it keeps for 3 hours after the last set and then saves
 *   what was logged; the checkpoint carries that entry (rescue) for
 *   session-resume.js to write. Minutes leave out any gap of more than
 *   30 minutes between sets (time away, not training).
 *
 * v3 - F1, FREESTYLE-RELOAD. The session survives the app closing: each
 *   logged set writes the one active-session slot (session-resume.js),
 *   a reopened view picks it back up ("Carried on where you were."), and
 *   Home offers it with the same Carry-on card the coach's player uses
 *   (carryOnSummary, finishFromHome). Leaving without saving clears it;
 *   an empty freestyle never displaces a coach session's carry-on.
 *
 * v2 - SMOOTH-P3c. "Make it up as I go". Spec 4.7.
 *
 *   The third door on Plan Home. Somebody in a gym who knows what they
 *   want to do next and wants the app to keep up, not lead:
 *
 *     Exit · running clock · Finish
 *     the moves done so far, with their sets ("40 kg × 10 · 40 × 10")
 *     the current move: Set n · last time, weight and reps pre-filled,
 *       − / + on each, Log set n, the sets logged so far
 *     Next move: three suggestions and a search box
 *
 *   ONE FILE, EXTENDED, NOT A SECOND ONE. CAPTURE-1 already was "build as
 *   you go"; the spec's freestyle.js would have been a second screen for
 *   the same sentence. What changed is the shape: v1 kept a list of
 *   names and walked each one through the player; v2 logs every SET on
 *   the move card itself, so the person never leaves the screen. v1's
 *   two targets per result ("walk the card" / "just log it") become one:
 *   the card is here, with "How to do it" folded under the move.
 *
 *   LOG SET writes the lift log through store.logLift() -- the same
 *   helper the player's log block uses -- one entry per set. Nothing
 *   computes, compares or narrates the numbers (P4).
 *
 *   FINISH writes ONE activity entry, type "freestyle", through
 *   store.logActivity(): completedAt, duration, exerciseIds, moves and
 *   sets. So Progress, the arc and COUNT-1 see it as a completed session
 *   like any other, and the finish screen shows "3 moves · 9 sets".
 *   A freestyle entry never INHERITS a session type from whatever the
 *   builder last made (store.js v77): only what the person said.
 *
 *   EXIT without Finish: Keep going · Save what I did · Leave without
 *   saving. Saving writes the same entry and goes Home.
 *
 *   KIT. The search and the suggestions only offer what the kit at this
 *   location allows -- the builder's own answer (equipmentForLocation,
 *   resolveEquipment, exerciseIsAvailable), not a second one. Where is
 *   on screen with a Change, because it decides what is offered.
 *
 *   SORE. A move that loads an area the person said is sore today is
 *   SHOWN, with a note, not hidden -- they are choosing (10 Sep
 *   adaptation decision): "You mentioned your knee today — this one
 *   loads it." The same rule the plan's swap uses (soreLevelFor).
 *
 *   SUGGESTIONS. What the person usually does after the current move,
 *   read from their own lift log's order (no new field). With no such
 *   history: three from the builder's main pool for this location,
 *   labelled as ideas rather than as habits. Never mixed under one
 *   heading, because "what you usually do" must be true of every line.
 *
 *   SAFETY. The acknowledgement gate stands before the first move, as
 *   in v1, because a session with no list has nothing else in front of
 *   it. The red-flag guard now covers this route (red-flag.js). The
 *   "If it hurts" block is open on the first move card and closed on
 *   the rest, as on the player.
 *
 * 16 Sep 2026 v1 - CAPTURE-1 / CAPTURE-2. Build as you go, or log what
 *   you just did. Search over names and muscles, recents, body areas;
 *   the optional "What was this, roughly?" question, which is kept.
 */

import { store } from "../store.js";
import { EXERCISES } from "../data/exercises/index.js";
import { CONDITIONS } from "../data/conditions.js";
import { searchByTerm } from "../data/muscle-search.js";
import { resolveEquipment, exerciseIsAvailable } from "../data/equipment-map.js";
import { equipmentForLocation, buildCandidatePools, soreScoresToday, soreLevelFor, SORE_BLOCK_FLOOR }
  from "../session-builder.js";
import { performanceFields } from "../session-log.js";
import { hurtBlock } from "../exercise-card.js";
import { isGateDue, renderSafetyGate, attachSafetyGate } from "../safety-gate.js";
import { mountSessionGuard, dismountSessionGuard } from "../session-guard.js";
import { checkpointSession, getResumableSession, clearCheckpoint, rescueStaleSession } from "../session-resume.js";

export const centered = false;

/** Two sets further apart than this are not "after" each other. */
const AFTER_WINDOW_MS = 3 * 3600 * 1000;

/**
 * CAPTURE-2, kept. What kind of session this was, if they say. Asking is
 * not inventing: the answer is the person's, so it can credit the arc's
 * capability strands honestly. Null until they say; skipping costs only
 * that half of the credit.
 */
export const CAPTURE_KINDS = [
  { id: "full",     label: "Full body" },
  { id: "upper",    label: "Upper body" },
  { id: "lower",    label: "Lower body" },
  { id: "core",     label: "Core" },
  { id: "glute",    label: "Glutes" },
  { id: "cardio",   label: "Cardio" },
  { id: "mobility", label: "Mobility" },
  { id: "stretch",  label: "Stretching" }
];

// ── Session state. Module-level, so it survives moving around the app
// and coming back through the third door; cleared on Finish, Save or
// Leave, and when stale. ─────────────────────────────────────────────────
let moves     = [];     // [{ id, sets: [entry] }] -- filed moves, in order
let current   = null;   // { id, sets: [entry], last: entry|null }
let startedAt = null;
let query     = "";
let kind      = null;
let status    = "";
let focusNext = null;   // selector to focus after the next paint
let clock     = null;
let guarded   = false;  // the back-gesture guard, mounted once per visit

/**
 * F1, FREESTYLE-RELOAD. The session lives in memory while the app is
 * open; this puts it in the one active-session slot (session-resume.js)
 * as each set is logged, so closing the app loses nothing. Written only
 * once there is a set: an empty freestyle is nothing to come back to,
 * and must not displace a coach session waiting to be carried on.
 */
function _persist() {
  if (!totalSets()) return;
  const list = allMoves();
  checkpointSession("freestyle", {
    moves:     moves.map(m => ({ id: m.id, sets: m.sets })),
    current:   current ? { id: current.id, sets: current.sets } : null,
    kind,
    startedAt: new Date(startedAt || Date.now()).toISOString(),
    // W3-13. Saved as it is if nobody comes back within 3 hours.
    awayMs:    _awayMs(false),
    rescue: {
      type:           "freestyle",
      name:           "Make it up as I go",
      exerciseIds:    list.map(m => m.id),
      exercisesCount: list.length,
      setsDone:       list.reduce((n, m) => n + m.sets.length, 0),
      ...(kind ? { sessionType: kind } : {}),
    },
  });
}

/** W3-13. A gap this long between sets is time away, not training. */
const AWAY_GAP_MS = 30 * 60 * 1000;
/**
 * W3-13. Time away within the session: every gap longer than AWAY_GAP_MS
 * between the start, each logged set and (untilNow) the present.
 */
function _awayMs(untilNow) {
  const times = [startedAt || Date.now()];
  for (const m of allMoves()) for (const e of m.sets) { const t = Date.parse(e.at); if (Number.isFinite(t)) times.push(t); }
  times.sort((a, b) => a - b);
  if (untilNow) times.push(Date.now());
  let away = 0;
  for (let i = 1; i < times.length; i++) { const gap = times[i] - times[i - 1]; if (gap > AWAY_GAP_MS) away += gap; }
  return away;
}

/** A reopened app: pick the session back up from the slot, if it is ours. */
function _restore() {
  if (startedAt || moves.length || current) return false;
  const cp = getResumableSession("freestyle");
  if (!cp) return false;
  moves = (Array.isArray(cp.moves) ? cp.moves : []).filter(m => m && byId(m.id)).map(m => ({ id: m.id, sets: Array.isArray(m.sets) ? m.sets : [] }));
  current = cp.current && byId(cp.current.id)
    ? { id: cp.current.id, sets: Array.isArray(cp.current.sets) ? cp.current.sets : [], last: store.lastLift(cp.current.id) || null }
    : null;
  kind = cp.kind || null;
  startedAt = Date.parse(cp.startedAt) || Date.now();
  status = "Carried on where you were.";
  return true;
}

/** Only our own checkpoint is cleared; a coach session's is left alone. */
function _clearOurs() {
  if (store.get("activeSessionCheckpoint")?.sessionType === "freestyle") clearCheckpoint();
}

/** What the Home card says about a freestyle session waiting, or null. */
export function carryOnSummary() {
  const cp = getResumableSession("freestyle");
  if (!cp) return null;
  const list = [...(cp.moves || []), ...(cp.current && (cp.current.sets || []).length ? [cp.current] : [])];
  const sets = list.reduce((n, m) => n + (m.sets || []).length, 0);
  if (!sets) return null;
  return { moves: list.length, sets };
}

/** Home's "Finish here and save" for a freestyle session: save it, then the finish screen. */
export function finishFromHome() {
  _restore();
  saveFreestyle();
  _end();
  router.navigate("reflect");
}

function _reset() {
  moves = []; current = null; startedAt = null; query = ""; kind = null;
  status = ""; focusNext = null;
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const byId = id => EXERCISES.find(e => e.id === id) || null;
const _areaName = id => (CONDITIONS.find(c => c.id === id)?.name || id.replace(/-/g, " ")).toLowerCase();

// ── Where, and what the kit there allows ─────────────────────────────────

export function currentLocation() {
  const loc = store.get("sessionLocation");
  if (loc === "gym" || loc === "home" || loc === "outside") return loc;
  const gym   = store.get("gymEquipment")  || [];
  const home  = store.get("homeEquipment") || [];
  const ident = store.get("movementIdentity") || [];
  if (gym.length && (!home.length || (Array.isArray(ident) && ident.includes("gym")))) return "gym";
  return "home";
}
const PLACE_WORDS = { gym: "At the gym", home: "At home", outside: "Outside, with nothing to hand" };

/** The exercises the kit here allows. The builder's own rule. */
export function availableHere(location = currentLocation()) {
  const kit = resolveEquipment(equipmentForLocation(location).list);
  return EXERCISES.filter(e => exerciseIsAvailable(e, kit));
}

/** Search over names and muscles, kit-filtered. */
export function searchHere(q, location = currentLocation()) {
  const t = String(q || "").trim().toLowerCase();
  if (t.length < 2) return { found: [], anyKit: 0 };
  const byName = EXERCISES.filter(e => (e.name || "").toLowerCase().includes(t));
  const { exercises: byArea } = searchByTerm(t, EXERCISES);
  const seen = new Set(byName.map(e => e.id));
  const all  = [...byName, ...byArea.filter(e => !seen.has(e.id))];
  const here = new Set(availableHere(location).map(e => e.id));
  return { found: all.filter(e => here.has(e.id)).slice(0, 12), anyKit: all.length };
}

// ── Sore ────────────────────────────────────────────────────────────────

/** The note for a move that loads a sore area, or "". */
export function soreNote(ex) {
  const scores = soreScoresToday();
  const { level, areas } = soreLevelFor(ex, scores);
  if (level === "none") return "";
  const area = areas.slice().sort((a, b) => scores[b] - scores[a])[0];
  return scores[area] >= SORE_BLOCK_FLOOR
    ? `You said your ${_areaName(area)} is bad today — this one loads it.`
    : `You mentioned your ${_areaName(area)} today — this one loads it.`;
}

// ── Suggestions ─────────────────────────────────────────────────────────

/**
 * What the person usually does after `afterId`, from the order of their
 * own lift log: a set of B logged within three hours after a set of A,
 * on a move change, counts once. Most frequent first.
 */
export function usuallyAfter(afterId) {
  const log = store.get("liftLog") || {};
  const sets = [];
  for (const [id, list] of Object.entries(log)) {
    for (const e of list || []) { const t = new Date(e.at).getTime(); if (Number.isFinite(t)) sets.push({ id, t }); }
  }
  sets.sort((a, b) => a.t - b.t);
  const counts = {};
  for (let i = 1; i < sets.length; i++) {
    const a = sets[i - 1], b = sets[i];
    if (a.id !== afterId || b.id === afterId || b.t - a.t > AFTER_WINDOW_MS) continue;
    counts[b.id] = (counts[b.id] || 0) + 1;
  }
  return Object.entries(counts).sort((x, y) => y[1] - x[1]).map(([id]) => id);
}

/** Up to three to offer next, and the honest heading for them. */
export function suggestions(location = currentLocation()) {
  const done = new Set([...moves.map(m => m.id), current?.id].filter(Boolean));
  const here = new Set(availableHere(location).map(e => e.id));
  const anchor = current || moves[moves.length - 1] || null;
  if (anchor) {
    const ids = usuallyAfter(anchor.id).filter(id => here.has(id) && !done.has(id)).slice(0, 3);
    if (ids.length) {
      return { heading: `What you usually do after ${byId(anchor.id)?.name || "that"}`, list: ids.map(byId).filter(Boolean) };
    }
  }
  if (!anchor) {
    // Nothing done yet: what they have done most recently, if anything --
    // in a gym you repeat yourself (v1's Recent). Lift log and the
    // exercise history both, newest first.
    const when = {};
    for (const [id, list] of Object.entries(store.get("liftLog") || {})) {
      const t = Math.max(...(list || []).map(e => new Date(e.at).getTime()).filter(Number.isFinite));
      if (Number.isFinite(t)) when[id] = t;
    }
    for (const [id, v] of Object.entries(store.get("exerciseHistory") || {})) {
      const t = new Date(v?.last).getTime();
      if (Number.isFinite(t) && !(when[id] > t)) when[id] = t;
    }
    const recent = Object.keys(when).sort((a, b) => when[b] - when[a]).filter(id => here.has(id)).slice(0, 3);
    if (recent.length) return { heading: "Recently", list: recent.map(byId).filter(Boolean) };
  }
  let pools = null;
  try { pools = buildCandidatePools({ sessionType: "full", durationMins: 30, equipmentOverride: equipmentForLocation(location).list }); } catch { pools = null; }
  const main = (pools?.main || []).filter(e => here.has(e.id) && !done.has(e.id));
  // At a gym, kit first: somebody standing among the racks did not come
  // for a glute bridge. Stable order otherwise (recommended first).
  const kitFirst = location === "gym" ? (e => (e.equipment || []).length ? 0 : 1) : (() => 0);
  const pick = [...main].sort((a, b) => kitFirst(a) - kitFirst(b) || (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0)).slice(0, 3);
  return { heading: location === "gym" ? "Ideas for the gym" : location === "outside" ? "Ideas for outside" : "Ideas for home", list: pick };
}

// ── Sets ────────────────────────────────────────────────────────────────

/** "40 kg × 10", "12 reps", "level 6 · 10 min" -- flat, no verdict (P4). */
export function setText(e, withUnit = true) {
  if (!e) return "";
  if (typeof e.weight === "number" && typeof e.reps === "number")
    return `${e.weight}${withUnit ? ` ${e.unit || store.get("weightUnit") || "kg"}` : ""} × ${e.reps}`;
  const bits = [];
  if (typeof e.weight === "number") bits.push(`${e.weight} ${e.unit || "kg"}`);
  if (typeof e.reps === "number")   bits.push(`${e.reps} reps`);
  if (e.tension)                    bits.push(e.tension);
  if (typeof e.level === "number")  bits.push(`level ${e.level}`);
  if (typeof e.speed === "number")  bits.push(`speed ${e.speed}`);
  if (typeof e.incline === "number") bits.push(`${e.incline}% incline`);
  if (typeof e.durationMins === "number") bits.push(`${e.durationMins} min`);
  if (typeof e.distance === "number") bits.push(`${e.distance} distance`);
  return bits.join(" · ") || (e.note ? "noted" : "");
}
const setsLine = sets => sets.map((s, i) => setText(s, i === 0)).join(" · ");

const totalSets = () => moves.reduce((n, m) => n + m.sets.length, 0) + (current ? current.sets.length : 0);
const allMoves  = () => [...moves, ...(current && current.sets.length ? [current] : [])];

/** File the current move (if it had sets) and start `id`. */
function _pick(id) {
  const ex = byId(id);
  if (!ex) return;
  if (current && current.sets.length) moves.push({ id: current.id, sets: current.sets });
  current = { id, sets: [], last: store.lastLift(id) || null };
  query = "";
  status = "";
  focusNext = "#fs-move-name";
  _persist();
}

function _logSet(root) {
  const ex = byId(current.id);
  const entry = {};
  root.querySelectorAll("[data-fs-key]").forEach(input => {
    const raw = input.value;
    if (raw === "" || raw == null) return;
    entry[input.dataset.fsKey] = input.type === "number" ? parseFloat(raw) : raw;
  });
  if (!Object.keys(entry).length) {
    status = "Put in what you did first — even just the reps.";
    focusNext = "[data-fs-key]";
    return;
  }
  if (typeof entry.weight === "number") entry.unit = store.get("weightUnit") || "kg";
  store.logLift(ex.id, entry);            // no-op if lift notes are off; the session still has it
  current.sets.push({ ...entry, at: new Date().toISOString() });
  status = `Set ${current.sets.length} logged: ${setText(entry)}.`;
  focusNext = "#fs-log";
  _persist();
}

// ── Rendering ───────────────────────────────────────────────────────────

function _elapsed() {
  if (!startedAt) return "0:00";
  const s = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}` : `${m}:${String(sec).padStart(2, "0")}`;
}

function _field(f, value) {
  const id = `fs-f-${f.key}`;
  if (f.type !== "number") {
    return `
      <div class="fs-field fs-field--text">
        <label class="fs-field__label" for="${id}">${esc(f.label)}</label>
        <input class="fs-field__input" id="${id}" type="text" data-fs-key="${f.key}"
               maxlength="${f.maxlength || 60}" value="${esc(value ?? "")}">
      </div>`;
  }
  const unit = store.get("weightUnit") || "kg";
  const step = f.key === "weight" ? (unit === "lb" ? 5 : 2.5) : Number(f.step) || 1;
  const name = f.label.replace(/\s*\(.*\)$/, "");
  return `
    <div class="fs-field">
      <label class="fs-field__label" for="${id}">${esc(f.label)}</label>
      <div class="fs-stepper">
        <button type="button" class="fs-step" data-fs-step="${id}" data-step="-${step}" aria-label="${esc(name)} down ${step}">−</button>
        <input class="fs-field__input" id="${id}" type="number" inputmode="decimal" step="${f.step || "any"}" min="0"
               data-fs-key="${f.key}" value="${value ?? ""}">
        <button type="button" class="fs-step" data-fs-step="${id}" data-step="${step}" aria-label="${esc(name)} up ${step}">+</button>
      </div>
    </div>`;
}

function _moveCard() {
  const ex = byId(current.id);
  const n  = current.sets.length + 1;
  const prev = current.sets[current.sets.length - 1] || current.last || {};
  const fields = performanceFields(ex).filter(f => f.key !== "note");
  const note = soreNote(ex);
  // Open on the first move, closed on the rest -- as the player does.
  const first = moves.length === 0;
  return `
    <section class="fs-move" aria-labelledby="fs-move-name">
      <h2 class="fs-move__name" id="fs-move-name" tabindex="-1">${esc(ex.name)}</h2>
      ${note ? `<p class="fs-sore" role="note">${esc(note)}</p>` : ""}
      <p class="fs-move__set">Set ${n}${current.last ? ` · last time ${esc(setText(current.last))}` : ""}</p>
      <div class="fs-fields">${fields.map(f => _field(f, prev[f.key])).join("")}</div>
      <button type="button" class="btn btn-primary btn-large btn-full" id="fs-log">Log set ${n}</button>
      <p class="fs-status" id="fs-status" role="status" aria-live="polite">${esc(status)}</p>
      ${current.sets.length ? `
        <ol class="fs-sets" aria-label="Sets logged on ${esc(ex.name)}">
          ${current.sets.map((s, i) => `<li><span class="fs-sets__n">Set ${i + 1}</span> ${esc(setText(s))}</li>`).join("")}
        </ol>` : ""}
      ${Array.isArray(ex.instructions) && ex.instructions.length ? `
        <details class="fs-how">
          <summary>How to do it</summary>
          <ol>${ex.instructions.map(s => `<li>${esc(s)}</li>`).join("")}</ol>
        </details>` : ""}
      ${hurtBlock(first)}
    </section>`;
}

function _row(ex) {
  const note = soreNote(ex);
  return `
    <li>
      <button type="button" class="fs-pick__btn" data-pick="${esc(ex.id)}"
              ${note ? `aria-describedby="fs-note-${esc(ex.id)}"` : ""}>
        <span class="fs-pick__name">${esc(ex.name)}</span>
        ${note ? `<span class="fs-pick__note" id="fs-note-${esc(ex.id)}">${esc(note)}</span>` : ""}
      </button>
    </li>`;
}

export function render() {
  // W3-13. A session nobody came back to within 3 hours is saved, not
  // dropped (session-resume.js); what is in memory then starts afresh.
  rescueStaleSession();
  if (totalSets() && store.get("activeSessionCheckpoint")?.sessionType !== "freestyle") _reset();
  // CAPTURE-1. The gate stands before the first movement -- see the header.
  if (isGateDue()) return `<div class="view capture-view">${renderSafetyGate()}</div>`;
  _restore();
  if (!startedAt) startedAt = Date.now();

  const loc  = currentLocation();
  const done = allMoves();
  const sug  = suggestions(loc);
  const q    = query.trim();
  const { found, anyKit } = searchHere(q, loc);

  return `
    <div class="view capture-view" data-freestyle>
      <header class="fs-bar">
        <button type="button" class="btn btn-ghost fs-bar__exit" id="fs-exit">Exit</button>
        <span class="fs-bar__clock" id="fs-clock" aria-hidden="true">${_elapsed()}</span>
        <button type="button" class="btn btn-secondary fs-bar__finish" id="fs-finish">Finish</button>
      </header>
      <h1 class="sr-only">Make it up as I go</h1>
      <p class="fs-error" id="fs-error" role="alert"></p>

      <p class="fs-sub">If you stop part-way, this keeps for 3 hours after your last set, then I save what you\u2019ve logged.</p>

      <p class="fs-where">${esc(PLACE_WORDS[loc])}
        <button type="button" class="fs-where__change" id="fs-where" aria-label="Change where you are. Now: ${esc(PLACE_WORDS[loc])}">Change</button>
      </p>

      ${moves.length ? `
        <h2 class="fs-heading">Done so far</h2>
        <ul class="fs-done">
          ${moves.map(m => `
            <li class="fs-done__row"><span class="fs-done__name">${esc(byId(m.id)?.name || m.id)}</span>
              <span class="fs-done__sets">${esc(setsLine(m.sets))}</span></li>`).join("")}
        </ul>` : ""}

      ${current ? _moveCard() : ""}

      <section class="fs-next" aria-labelledby="fs-next-h">
        <h2 class="fs-heading" id="fs-next-h">${current || moves.length ? "Next move" : "First move"}</h2>
        ${sug.list.length && !q ? `
          <p class="fs-sub">${esc(sug.heading)}</p>
          <ul class="fs-picks">${sug.list.map(_row).join("")}</ul>` : ""}
        <label class="fs-sub fs-search-label" for="cap-search">Or search a move or a muscle</label>
        <input type="search" id="cap-search" class="cap-search" placeholder="Bench press, lats, quads…"
               value="${esc(query)}" autocomplete="off" enterkeyhint="search">
        <p class="cap-status" id="cap-status" role="status" aria-live="polite">${q.length >= 2
          ? (found.length
              ? `${found.length} ${found.length === 1 ? "move" : "moves"} you can do ${esc(PLACE_WORDS[loc].split(",")[0].toLowerCase())}.`
              : anyKit
                ? `Nothing for “${esc(q)}” with the kit you have ${esc(PLACE_WORDS[loc].split(",")[0].toLowerCase())}.`
                : `Nothing matching “${esc(q)}”. Try a muscle — lats, quads — or part of the name.`)
          : ""}</p>
        ${found.length ? `<ul class="fs-picks">${found.map(_row).join("")}</ul>` : ""}
      </section>

      ${done.length ? `
        <details class="fs-kind"${kind ? " open" : ""}>
          <summary>What was this, roughly? <span class="fs-sub">Optional</span></summary>
          <ul class="cap-areas" role="group" aria-label="What kind of session this was">
            ${CAPTURE_KINDS.map(k => `
              <li><button type="button" class="cap-area${kind === k.id ? " is-selected" : ""}"
                          data-kind="${esc(k.id)}" aria-pressed="${kind === k.id}">${esc(k.label)}</button></li>`).join("")}
          </ul>
          <p class="fs-sub">${kind
            ? "That lets it count towards the parts of your arc this kind of session builds."
            : "Without it, this still counts for the areas you worked."}</p>
        </details>` : ""}
    </div>`;
}

function rerender() {
  const root = document.getElementById("main-content") || document.getElementById("app");
  if (!root) return;
  root.innerHTML = render();
  onMount();
}

// ── Saving ──────────────────────────────────────────────────────────────

/** One activity entry for the whole session. Returns it, or null if nothing was done. */
export function saveFreestyle() {
  const list = allMoves();
  if (!list.length) return null;
  const nowIso = new Date().toISOString();
  const exercises = list.map(m => { const ex = byId(m.id); return { id: m.id, affectsAreas: ex?.affectsAreas || [] }; });

  // What the arc credits from, exactly as CAPTURE-1 did. sessionType only
  // if they said so; store.js v77 stops a freestyle entry inheriting one.
  const session = { id: "freestyle", title: "Made up as I went", exercises };
  if (kind) session.sessionType = kind;
  store.set("lastFinishedSession", { at: nowIso, session });

  const entry = store.logActivity({
    type:           "freestyle",
    date:           nowIso,
    completedAt:    nowIso,
    // W3-13. Without the time away.
    durationMins:   startedAt ? Math.max(1, Math.round((Date.now() - startedAt - _awayMs(true)) / 60000)) : null,
    moodAfter:      null,
    exerciseIds:    list.map(m => m.id),
    exercisesCount: list.length,
    setsDone:       list.reduce((n, m) => n + m.sets.length, 0),
    ...(kind ? { sessionType: kind } : {})
  });
  if (entry) store.set("currentActivityEntry", entry);
  return entry;
}

/** Stop the clock and the guard and clear the session. The caller navigates. */
function _end() {
  clearInterval(clock); clock = null;
  dismountSessionGuard(); guarded = false;
  _clearOurs();
  _reset();
}

function showExitSheet() {
  if (document.getElementById("session-exit-overlay")) return;
  const opener = document.activeElement;
  const overlay = document.createElement("div");
  overlay.className = "session-exit-overlay";
  overlay.id = "session-exit-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "exit-sheet-title");
  const any = totalSets() > 0;
  overlay.innerHTML = `
    <div class="session-exit-card">
      <h2 class="session-exit-title" id="exit-sheet-title">Leave this session?</h2>
      <div class="session-exit-actions">
        <button class="btn btn-primary btn-full" id="exit-confirm-stay">Keep going</button>
        ${any ? `<button class="btn btn-secondary btn-full" id="exit-confirm-save">Save what I did</button>` : ""}
        <button class="btn btn-ghost btn-full session-exit-discard" id="exit-confirm-discard">
          ${any ? "Leave without saving" : "Leave"}
        </button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  const stay = overlay.querySelector("#exit-confirm-stay");
  stay?.focus();
  const close = () => { overlay.remove(); opener?.focus?.(); };
  overlay.addEventListener("keydown", e => {
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (e.key !== "Tab") return;
    const f = [...overlay.querySelectorAll("button")];
    const i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
  });
  stay?.addEventListener("click", close);
  overlay.querySelector("#exit-confirm-save")?.addEventListener("click", () => { overlay.remove(); saveFreestyle(); _end(); router.navigate("today"); });
  overlay.querySelector("#exit-confirm-discard")?.addEventListener("click", () => { overlay.remove(); _end(); router.navigate("today"); });
}

// ── Events ──────────────────────────────────────────────────────────────

export function onMount() {
  if (isGateDue()) {
    attachSafetyGate(document.getElementById("app") || document, {
      surface:       "capture",
      onAcknowledge: () => rerender(),
      onLeave:       () => router.navigate("today")
    });
    return;
  }
  const root = document.getElementById("main-content") || document;

  // Once per visit: each mount pushes a history entry, and a re-render is
  // not a new visit. The router dismounts it on the way out.
  if (!guarded) {
    guarded = true;
    mountSessionGuard({
      isActive: () => totalSets() > 0,
      onExit:   () => { saveFreestyle(); _end(); router.navigate("today"); },
      label:    "session"
    });
  }

  clearInterval(clock);
  clock = setInterval(() => {
    const el = document.getElementById("fs-clock");
    if (!el) { clearInterval(clock); clock = null; return; }
    el.textContent = _elapsed();
  }, 1000);

  const search = document.getElementById("cap-search");
  if (search) {
    let t = null;
    search.addEventListener("input", e => {
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

  if (root.dataset.fsWired !== "1") {
    root.dataset.fsWired = "1";
    root.addEventListener("click", ev => {
      if (!document.querySelector("[data-freestyle]")) return;
      const t = ev.target;
      const pick = t.closest("[data-pick]");
      if (pick) { _pick(pick.dataset.pick); rerender(); return; }

      const step = t.closest("[data-fs-step]");
      if (step) {
        const input = document.getElementById(step.dataset.fsStep);
        if (!input) return;
        const next = Math.max(0, (parseFloat(input.value) || 0) + parseFloat(step.dataset.step));
        input.value = String(Math.round(next * 100) / 100);
        return;
      }
      if (t.closest("#fs-log")) { _logSet(root); rerender(); return; }

      if (t.closest("#fs-where")) {
        const order = ["home", "gym", "outside"];
        const next = order[(order.indexOf(currentLocation()) + 1) % order.length];
        store.set("sessionLocation", next);
        status = "";
        focusNext = "#fs-where";
        rerender();
        return;
      }
      const k = t.closest("[data-kind]");
      if (k) { kind = kind === k.dataset.kind ? null : k.dataset.kind; focusNext = `[data-kind="${k.dataset.kind}"]`; rerender(); return; }

      if (t.closest("#fs-exit")) { showExitSheet(); return; }
      if (t.closest("#fs-finish")) {
        if (!totalSets()) {
          const err = document.getElementById("fs-error");
          if (err) err.textContent = "Log a set first. To leave without one, use Exit.";
          return;
        }
        saveFreestyle();
        _end();
        // The finish screen, as every session: "That's today done."
        router.navigate("reflect");
      }
    });
  }

  if (focusNext) {
    const sel = focusNext; focusNext = null;
    document.querySelector(sel)?.focus?.({ preventScroll: false });
  } else if (!current && !moves.length && search && !query) {
    // Standing at a machine: type straight away (v1).
    try { search.focus({ preventScroll: true }); } catch { /* non-fatal */ }
  }
}

/** Router hook: stop the clock when the view goes. The session itself is kept. */
export function onUnmount() { clearInterval(clock); clock = null; guarded = false; }
