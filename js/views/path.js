/**
 * views/path.js
 * 31 Oct 2026 v3
 *
 * v3 - STAGE PATH Session 8 (P-8). Outside, after "What are you doing?": a
 *   warm-up before and a cool-down after, each from the library or an
 *   approved routine (data/outside.js), shown as a proposal like any other,
 *   and Log it opens Log what I did with the activity already chosen. Log
 *   it said "anything sore", which Log what I did does not ask: now it says
 *   what it does.
 *
 * v2 - STAGE PATH Session 6 (P-6; P-12, Graeme 29 Oct: "I like the new
 *   design with the stickmen as part of the proposal with the easy swap.
 *   There needs to be this consistency applied to all"). One proposal
 *   shape: a programme, a routine, a fresh one and a kept session all show
 *   each movement with its stick figure and a Swap (path-context
 *   swapOptionsFor: same kind, same purpose, never a Not again, never one
 *   today's sore areas rule out), then Start. Make it mine keeps a
 *   programme or routine, with any swaps, in Saved sessions, for its door
 *   (spec §5 "Make it mine", edit a copy). A kept session opens here from
 *   Saved sessions (router.pathStart.saved) and starts with its own doses.
 *   Build my session tells Today's plan which door it came from
 *   (router.planDoor), so the finish and Lately know.
 *
 * STAGE PATH Session 5 (P-5 DOOR-ROUTES; blueprint v6 D3, spec §5), as
 * mock-up v10 (Graeme, 29 Oct: "Yep. I like v10"). Every step behind the
 * four doors on the Plan's Home, in one view with a step state, so the step
 * bar, Back and focus behave the same everywhere:
 *
 *   Get stronger, Keep moving   Where -> Which part -> How   (Home or Gym)
 *                               Where -> What are you doing -> Log it (Outside)
 *   Stretch                     Where to stretch -> its routines
 *   Move to feel better         How are you feeling? -> its programmes
 *
 * Stretch never asks Where; Move to feel better never asks Where, a part or
 * How; Outside never offers the gym or yoga (verify-path-routes).
 *
 * HOW A DOOR SAYS WHICH DOOR (D1). The router passes no parameters. Home
 * sets router.pathStart = { door, feeling?, minutes?, programmeId?, reason? }
 * and this view reads it once and clears it. The coach's Move to feel better
 * choice arrives with a feeling and a programme: its programme opens, with
 * the coach's reason in the person's word, every adjustment, Change my
 * check-in and, on a low-mood day, Wellbeing (Graeme, 29 Oct: "Agreed");
 * Back from it is that feeling's programmes, the programme marked. Coming
 * back here without a hand-off (the phone's Back from a plan) starts at the
 * door's first step.
 *
 * WHERE EACH WAY OUT GOES. Build it for me: Today's plan (coach-proposal)
 * for the door's kind, part and place (D4), at the length chosen (today's
 * length, data/session-length.js). Build my own: I know what I want, with
 * the door's kind, part and place already chosen (router.knowWhatStart).
 * Saved sessions: the list, for this door (router.savedStart). A programme
 * or routine: the one player (workout), its movements in order with their
 * minutes, as Saved sessions starts one. Log it: Log what I did.
 *
 * NOT HERE YET, ON PURPOSE (each is a later session's, recorded in the
 * schedule): ready-made routines for Get stronger and Keep moving (no
 * content yet, P-9); warm-up and cool-down for an outside activity
 * (Session 8); the Plan's finish and Swap's note (Session 6). Nothing is
 * offered that does not work.
 *
 * Accessibility (Part G): one h1 per step, focused; Back returns focus to
 * what opened the step; every choice of one is a fieldset of native radios;
 * the step bar is named ("Step 2 of 3"); changes are said in one polite
 * live region; every kind is its icon AND its words (WCAG 1.4.1).
 */
import { store } from "../store.js";
import { isPremium } from "../auth.js";
import { lineIcon } from "../data/line-icons.js";
import { renderFigure } from "../figures.js";
import { FEELINGS, PROGRAMMES, SLOW_LINE } from "../data/feel-programmes.js";
import { AREAS, ROUTINES } from "../data/stretch-routines.js";
import { EXERCISES } from "../data/exercises/index.js";
import { PATH_MOVEMENTS } from "../data/exercises/path_movements.js";
import { suggestFeeling, pickProgramme, pickSurprise, routinesFor, STRETCH_AREA_ZONES } from "../data/path-engine.js";
import { checkinToday, lastPlace, lowMood, shownAdjustments, freshPracticeFor, swapOptionsFor } from "../data/path-context.js";
import { savedSessions, resolveSavedSession } from "../data/saved-sessions.js";
import { keepVersion } from "../save-block.js";
import { OUTSIDE_PLANS } from "../data/outside.js";
import { presetLogActivity } from "./activity-log.js";
import { setTodaysLength, lengthCatForToday } from "../data/session-length.js";

const BY_ID = new Map([...EXERCISES, ...PATH_MOVEMENTS].map(e => [e.id, e]));
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const nameOf = id => BY_ID.get(id)?.name || id;

export const DOOR = Object.freeze({
  stronger: { label: "Get stronger",        kind: "amber",  icon: "strength", verb: "get stronger" },
  moving:   { label: "Keep moving",         kind: "blue",   icon: "walk",     verb: "move" },
  stretch:  { label: "Stretch",             kind: "violet", icon: "mobility", verb: "stretch" },
  feel:     { label: "Move to feel better", kind: "green",  icon: "heart",    verb: "move to feel better" },
});
export const PLACES = Object.freeze([
  { id: "home",    label: "Home",    line: "Little or no equipment" },
  { id: "gym",     label: "Gym",     line: "Machines, weights and space" },
  { id: "outside", label: "Outside", line: "A run, a ride, a match or something else" },
]);
export const PARTS = Object.freeze([
  { id: "whole", label: "Whole body" }, { id: "upper", label: "Upper body" },
  { id: "lower", label: "Lower body" }, { id: "core", label: "Core" },
]);
/** Outside: what they are doing. Never the gym, never yoga. */
export const ACTIVITIES = Object.freeze([
  { id: "run",   label: "Run",             icon: "run" },
  { id: "bike",  label: "Bike ride",       icon: "cycle" },
  { id: "walk",  label: "Walk or hike",    icon: "walk" },
  { id: "swim",  label: "Open-water swim", icon: "swim" },
  { id: "sport", label: "A sport or match", icon: "outside", line: "Football, tennis, netball and more" },
  { id: "other", label: "Something else",  icon: "outside" },
]);
const ENJOY = { run: "Enjoy your run", bike: "Enjoy your ride", walk: "Enjoy your walk", swim: "Enjoy your swim", sport: "Enjoy the game", other: "Enjoy it" };
const STYLE = { gentle: "Gentle movement", yoga: "Yoga", taichi: "Tai chi", qigong: "Qigong", pilates: "Pilates", stretch: "Stretches" };
const POSITION = { standing: "Standing", seated: "Seated", floor: "On the floor", lying: "Lying down", mixed: "Mixed" };
const ENERGY = [["Running on empty", 2], ["Low", 3], ["Okay", 6], ["Good", 7], ["Full of it", 9]];
const FEEL_LENGTHS = [5, 10, 15, 20];
const BUILD_LENGTHS = [["micro", 10], ["quick", 20], ["short", 30], ["standard", 40], ["long", 50]];

/** D4: a door, a part and a place, as the builder's session type. */
export function sessionTypeFor(door, part) {
  if (door === "moving") return part === "whole" ? "cardio" : part;
  return part === "whole" ? "full" : part;
}
/** I know what I want's own kinds and parts, for Build my own. */
function knowWhatFor(door, part, place) {
  if (part === "core") return { kind: "core", part: "full", place };
  if (door === "moving" && part === "whole") return { kind: "cardio", part: "full", place };
  return { kind: "strength", part: part === "whole" ? "full" : part, place };
}
/** A routine's steps on a day without the floor: its own swap (stretch-routines.js withoutFloor). */
export function stepsFor(r, floor) {
  if (floor !== false || !r.withoutFloor) return r.steps.map(s => ({ ...s }));
  const out = []; const steps = r.steps;
  for (let i = 0; i < steps.length; i++) {
    const key = Object.keys(r.withoutFloor).find(k => { const ids = k.split("+"); return ids.every((id, j) => steps[i + j]?.id === id); });
    if (key) { out.push(...r.withoutFloor[key].map(s => ({ ...s }))); i += key.split("+").length - 1; }
    else out.push({ ...steps[i] });
  }
  return out;
}
/** The one player, as Saved sessions starts it: the movements, in order, each for its minutes. */
export function startPractice(router, practice, { door, feeling = null } = {}) {
  // A kept session keeps its own doses (sets, reps, time); a programme or routine plays each for its minutes.
  const exercises = practice.saved
    ? practice.steps.map(s => s.entry).filter(Boolean)
    : practice.steps.map(s => {
      const e = BY_ID.get(s.id);
      return e ? { ...e, reps: null, sets: 1, duration: Math.round(s.mins * 60), pathNote: s.note || null } : null;
    }).filter(Boolean);
  if (!exercises.length) return;
  const session = { id: practice.id, title: practice.name, duration: practice.minutes ? `${practice.minutes} mins` : null, exercises,
                    sessionType: practice.sessionType || (door === "stretch" ? "stretch" : null), door, feeling };
  if (practice.place) session.place = practice.place;
  if (!practice.saved) session.programmeId = practice.id;
  store.set("generatedSession", {
    session,
    builtAt: new Date().toISOString(),
    inputs: practice.saved ? { savedSessionId: practice.id, door } : { door, feeling, programmeId: practice.id },
  });
  store.set("usingGeneratedSession", true);
  router.navigate("workout");
}

/** A kept session as a proposal: its movements, each with its own dose. */
export function practiceFromSaved(rec) {
  const { exercises } = resolveSavedSession(rec);
  const dose = e => { const sets = Number(e.sets) || 1; return e.reps ? `${sets} \u00d7 ${e.reps}` : e.duration ? `About ${Math.max(1, Math.round(e.duration / 60))} min` : ""; };
  return { id: rec.id, name: rec.name, minutes: rec.durationMins || null, sessionType: rec.sessionType || null, place: rec.place || null, saved: true,
           steps: exercises.map(e => ({ id: e.id, entry: e, dose: dose(e) })) };
}
/** The door a kept session belongs to: its own, or its kind's. */
export function doorOfSaved(rec) {
  if (DOOR[rec?.purpose]) return rec.purpose;
  return ["stretch", "mobility"].includes(rec?.sessionType) ? "stretch" : rec?.sessionType === "cardio" ? "moving" : "stronger";
}

let lastDoor = null;   // Back to this view without a hand-off starts at this door's first step

export function PathView(router) {
  let root = null;
  let live = null;
  let step = null;
  let st = {};
  let trail = [];
  let opener = null;   // the control that opened the next step (Safari does not focus a pressed button)

  function first(door) {
    if (door === "feel") return ["feel", {}];
    if (door === "stretch") return ["sarea", {}];
    return ["where", {}];
  }

  function mount(container) {
    root = container;
    const start = router.pathStart || null;
    router.pathStart = null;
    const door = start?.door || lastDoor;
    // The Plan's only (A1.2): Free has no doors, and is sent Home.
    if (!isPremium() || !door || !DOOR[door]) { router.navigate("today", { replace: true }); return; }
    lastDoor = door;
    trail = [];
    st = { door };
    if (start?.saved) {
      const rec = savedSessions().find(x => x.id === start.saved);
      if (rec) { step = "prog"; st = { door, practice: practiceFromSaved(rec), fromSaved: true }; paint(); return; }
    }
    if (door === "feel" && start?.feeling && FEELINGS[start.feeling]) {
      // The coach's choice: its feeling's programmes behind, its programme open.
      st.feeling = start.feeling; st.markId = start.programmeId || null;
      const p = PROGRAMMES.find(x => x.id === start.programmeId) || pickProgramme({ feeling: start.feeling, minutes: start.minutes || 15 })?.programme;
      if (p) {
        trail.push({ step: "progs", st: { ...st, markId: p.id }, focus: null });
        step = "prog"; st = { ...st, practice: p, reason: start.reason || null, fromCoach: true };
        paint(); return;
      }
      step = "progs"; paint(); return;
    }
    [step] = first(door);
    paint();
  }

  // ── Navigation inside the view ────────────────────────────────────────
  function go(next, patch = {}) {
    trail.push({ step, st: { ...st }, focus: opener || document.activeElement?.id || null });
    opener = null;
    st = { ...st, ...patch }; step = next; paint();
  }
  function back() {
    const p = trail.pop();
    if (!p) { router.navigate("today"); return; }
    step = p.step; st = p.st; paint();
    const f = p.focus && root.querySelector(`#${CSS.escape(p.focus)}`);
    if (f) f.focus();
  }
  function say(msg) { if (!live) return; live.textContent = ""; setTimeout(() => { if (live) live.textContent = msg; }, 30); }

  // ── Pieces ─────────────────────────────────────────────────────────────
  const tile = (icon, kind) => `<span class="kind-tile k-${kind}">${lineIcon(icon)}</span>`;
  const chev = `<span class="path-door__chev" aria-hidden="true">${lineIcon("chevron", 20)}</span>`;
  function row({ v, t, d = "", icon = null, kind = null, tint = false, dashed = false, badge = "" }) {
    const id = `pr-${String(v).replace(/[^a-z0-9]+/gi, "-")}`;
    return `<li><button type="button" class="path-door path-row${tint ? " is-tint" : ""}${dashed ? " is-dashed" : ""}" id="${id}" data-v="${esc(v)}"${kind ? ` style="--k: var(--kind-${kind})"` : ""}>
      ${icon ? tile(icon, kind || "teal") : ""}
      <span class="path-door__text"><span class="path-door__t">${esc(t)}${badge ? ` <span class="path-badge">${esc(badge)}</span>` : ""}</span>${d ? `<span class="path-door__d">${d}</span>` : ""}</span>${chev}</button></li>`;
  }
  const bar = (n, of) => `<ol class="path-stepbar" aria-label="Step ${n} of ${of}">${Array.from({ length: of }, (_, i) => `<li class="${i < n ? "is-on" : ""}"></li>`).join("")}</ol>`;
  function radios(name, legend, items, cur) {
    return `<fieldset class="path-seg"><legend>${esc(legend)}</legend><div class="path-seg__opts">${items.map(([id, t]) =>
      `<label><input type="radio" name="${name}" value="${esc(id)}"${String(cur) === String(id) ? " checked" : ""}><span>${esc(t)}</span></label>`).join("")}</div></fieldset>`;
  }
  const heading = (text, icon = null, kind = null) =>
    `<div class="path-head">${icon ? tile(icon, kind) : ""}<h1 class="path-h1" tabindex="-1">${esc(text)}</h1></div>`;

  // ── Steps ──────────────────────────────────────────────────────────────
  const STEPS = {
    // Get stronger and Keep moving
    where() {
      const last = lastPlace();
      return `${bar(1, 3)}${heading("Where are you?")}
        <ul class="path-list">${PLACES.map(p => row({ v: p.id, t: p.label, icon: p.id, kind: DOOR[st.door].kind, d: esc(p.line) + (p.id === last && p.id !== "outside" ? " · Same as last time" : "") })).join("")}</ul>`;
    },
    area() {
      return `${bar(2, 3)}${heading("Which part of you?")}
        <ul class="path-list">${PARTS.map(p => row({ v: p.id, t: p.label })).join("")}</ul>`;
    },
    how() {
      const n = savedFor(st.door, st.place).length;
      return `${bar(3, 3)}${heading("How would you like it?")}
        <ul class="path-list">
          ${row({ v: "coach", t: "Build it for me", d: "Shaped by today’s check-in and what you’ve told me", icon: "fresh", kind: DOOR[st.door].kind, tint: true })}
          ${row({ v: "own", t: "Build my own", d: "Choose the exercises yourself" })}
          ${n ? row({ v: "saved", t: "Saved sessions", d: `${n} kept` }) : ""}
        </ul>`;
    },
    buildlen() {
      const cat = lengthCatForToday();
      const cur = st.blen || (BUILD_LENGTHS.find(([c]) => c === cat)?.[0]) || "short";
      st.blen = cur;
      return `${heading("How long have you got?")}
        ${radios("blen", "Length", BUILD_LENGTHS.map(([c, m]) => [c, `${m} min`]), cur)}
        <p class="path-small">${checkinToday() ? "I’ll fit it to today’s check-in." : "You haven’t checked in today, so I’ll keep it steady."}</p>
        <button type="button" class="btn btn-primary btn-full" id="path-build">Build my session</button>`;
    },
    activity() {
      return `${bar(2, 3)}${heading("What are you doing?")}
        <ul class="path-list">${ACTIVITIES.map(a => row({ v: a.id, t: a.label, d: a.line ? esc(a.line) : "", icon: a.icon, kind: DOOR[st.door].kind })).join("")}</ul>`;
    },
    outplan() {
      return `${bar(3, 3)}${heading(ENJOY[st.activity] || "Enjoy it")}
        <p class="path-coachline">I can get you ready for it, and you can log it here when you\u2019re back.</p>
        <ul class="path-list">
          ${outsidePractice("warm") ? row({ v: "warm", t: "Warm-up before", d: `${esc(outsidePractice("warm").name)} \u00b7 about ${outsidePractice("warm").minutes} min`, icon: "sun", kind: DOOR[st.door].kind }) : ""}
          ${outsidePractice("cool") ? row({ v: "cool", t: "Cool-down after", d: `${esc(outsidePractice("cool").name)} \u00b7 about ${outsidePractice("cool").minutes} min`, icon: "moon", kind: DOOR[st.door].kind }) : ""}
          ${row({ v: "log", t: "Log it", d: "How long it was, and how it felt", icon: "pencil", kind: DOOR[st.door].kind })}
        </ul>`;
    },

    // Stretch
    sarea() {
      return `${bar(1, 2)}${heading("Where do you want to stretch?")}
        <ul class="path-list">${Object.entries(AREAS).map(([id, a]) => row({ v: id, t: a.label, icon: "mobility", kind: "violet" })).join("")}</ul>`;
    },
    routines() {
      const floor = st.floor !== "no";
      const mine = routinesFor({ area: st.area, floor: floor ? null : false });
      const n = savedFor("stretch", null).length;
      return `${bar(2, 2)}${heading(AREAS[st.area].label, "mobility", "violet")}
        ${radios("floor", "Can you get down to the floor today?", [["yes", "Yes"], ["no", "Not today"]], floor ? "yes" : "no")}
        <ul class="path-list">
          ${mine.map(r => row({ v: r.id, t: r.name, icon: "mobility", kind: "violet",
              d: `${r.minutes} min · ${STYLE[r.style] || ""}${!floor || r.floor === false ? " · Standing or seated" : " · On the floor"}` })).join("")}
          ${floor ? row({ v: "fresh", t: "A fresh one for me", d: "Built by the coach for this area", icon: "fresh", kind: "violet", dashed: true }) : ""}
          ${n ? row({ v: "saved", t: "Saved sessions", d: `${n} kept`, icon: "keep", kind: "violet" }) : ""}
        </ul>`;
    },

    // Move to feel better
    feel() {
      const sug = st.helped || feelingToday();
      return `${bar(1, 2)}${heading("How are you feeling?")}
        <ul class="path-list">
          ${Object.entries(FEELINGS).map(([id, f]) => row({ v: id, t: f.label, icon: f.icon, kind: "green", tint: sug?.feeling === id,
              badge: sug?.feeling === id ? "Suggested" : "", d: esc(f.line) + (sug?.feeling === id ? `<span class="path-why">${esc(sug.reason)}</span>` : "") })).join("")}
          ${row({ v: "surprise", t: "Surprise me", d: "I’ll pick one that fits today", icon: "sparkle", kind: "green" })}
          ${sug ? "" : row({ v: "help", t: "Help me choose", d: "One question about your energy", icon: "unsure", kind: "green", dashed: true })}
        </ul>`;
    },
    helpme() {
      return `${heading("How’s your energy?")}
        <p class="path-small">Just this one question. I’ll suggest a feeling from it.</p>
        <ul class="path-list">${ENERGY.map(([t, v]) => row({ v: String(v), t })).join("")}</ul>`;
    },
    progs() {
      const f = FEELINGS[st.feeling];
      const mine = PROGRAMMES.filter(p => p.feeling === st.feeling);
      const mark = st.flen ? pickProgramme({ feeling: st.feeling, minutes: Number(st.flen) }) : null;
      const markId = mark?.programme?.id || st.markId || null;
      const title = { sleep: "Movement to help you get ready for sleep", wake: "Movement to wake you up and lift your energy",
                      worn: "Gentle movement for when you’re worn out" }[st.feeling] || `Movement to help you feel ${f.label.toLowerCase()}`;
      return `${bar(2, 2)}${heading(title, f.icon, "green")}
        ${f.before ? `<p class="${st.feeling === "worn" ? "path-note" : "path-coachline"}">${esc(f.before)}</p>` : ""}
        ${radios("flen", "How long have you got?", FEEL_LENGTHS.map(n => [n, `${n} min`]), st.flen)}
        <ul class="path-list" id="path-progs">
          ${mine.map(p => row({ v: p.id, t: p.name, icon: f.icon, kind: "green", tint: p.id === markId, badge: p.id === markId ? "For today" : "",
              d: `${p.minutes} min · ${STYLE[p.style] || ""}${POSITION[p.position] ? ` · ${POSITION[p.position]}` : ""}${p.id === markId && mark ? `<span class="path-why">${esc(mark.reason)}</span>` : ""}` })).join("")}
          ${row({ v: "fresh", t: "A fresh one for me", d: "I’ll put together something new, inside the same gentle rules.", icon: "fresh", kind: "green", dashed: true })}
        </ul>`;
    },

    // A programme or a routine, before Start
    prog() {
      const p = st.practice, kind = DOOR[st.door].kind;
      const icon = st.door === "feel" ? (FEELINGS[st.feeling]?.icon || "heart") : DOOR[st.door].icon;
      const line = st.note || st.reason || (st.surprise ? "A surprise that fits today." : "");
      const adj = st.fresh || st.fromCoach ? shownAdjustments() : [];
      const meta = [p.minutes ? `About ${p.minutes} minutes` : "", !st.fresh && STYLE[p.style], !st.fresh && POSITION[p.position]].filter(Boolean).join(" · ");
      const ids = p.steps.map(s => s.id);
      return `${heading(p.name, icon, kind)}
        ${line ? `<p class="${st.note ? "path-note" : "path-coachline"}">${esc(line)}</p>` : ""}
        <p class="path-small">${esc(meta)}</p>
        ${p.support ? `<p class="path-small">${esc(p.support)}</p>` : ""}
        ${p.slowLine || p.style === "taichi" || p.style === "qigong" ? `<p class="path-small">${esc(SLOW_LINE)}</p>` : ""}
        ${adj.length ? `<div class="path-adj"><p class="path-adj__lbl">What I’ve adjusted</p><ul>${adj.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
        <button type="button" class="btn btn-primary btn-full" id="path-start">Start</button>
        ${st.fromCoach ? `<button type="button" class="path-link" id="path-redo">Change my check-in</button>` : ""}
        ${st.door === "feel" && lowMood() ? `<button type="button" class="path-link" id="path-wellbeing">Or something from Wellbeing</button>` : ""}
        ${!p.saved ? `<button type="button" class="path-link" id="path-mine"${st.kept ? " disabled" : ""}>${st.kept ? "Kept in Saved sessions" : "Make it mine"}</button>` : ""}
        <h2 class="path-adj__lbl" id="path-mvs-h">What\u2019s in it</h2>
        <ol class="path-mvs" aria-labelledby="path-mvs-h">${p.steps.map((s, i) => {
          const e = BY_ID.get(s.id) || {};
          const q = encodeURIComponent(e.youtube || `${e.name || s.id} how to`);
          return `<li class="path-mv">${renderFigure(s.id) || ""}
            <p class="path-mv__nm" id="path-mv-${i}">${i + 1}. ${esc(nameOf(s.id))}</p>
            <p class="path-small">${s.dose ? esc(s.dose) : `${s.mins} min`}${s.note ? ` · ${esc(s.note)}` : ""}</p>
            <span class="path-mv__acts">
              <a class="path-mv__yt" href="https://www.youtube.com/results?search_query=${q}" target="_blank" rel="noopener">Find a video on YouTube<span class="sr-only"> for ${esc(nameOf(s.id))} (opens YouTube, a search)</span></a>
              ${swapOptionsFor(s.id, { door: st.door, feeling: st.feeling, exclude: ids }).length ? `<button type="button" class="btn btn-secondary path-mv__swap" id="path-swap-${i}" data-swap="${i}" aria-describedby="path-mv-${i}">Swap</button>` : ""}
            </span>
          </li>`; }).join("")}</ol>
        ${(p.easeOff || []).length ? `<div class="path-adj"><p class="path-adj__lbl">If you need it easier</p><ul>${p.easeOff.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
`;
    },
  };

  function feelingToday() { return suggestFeeling({ checkin: checkinToday() }); }

  function savedFor(door, place) {
    return savedSessions().filter(s => (s.purpose == null || s.purpose === door) && (!place || s.place == null || s.place === place));
  }

  const freshPractice = () => freshPracticeFor({ feeling: st.feeling, minutes: Number(st.flen) || 10 });

  /** Swap one movement for the next of its kind; said, and focus kept on the row's Swap. */
  function swapAt(i) {
    const p = st.practice, from = p.steps[i];
    const opts = swapOptionsFor(from.id, { door: st.door, feeling: st.feeling, exclude: p.steps.map(s => s.id) });
    if (!opts.length) return;
    const to = opts[0];
    const steps = p.steps.map((s, j) => {
      if (j !== i) return s;
      if (p.saved) {
        const entry = { ...to, section: s.entry?.section, sets: s.entry?.sets ?? to.sets, reps: s.entry?.reps ?? to.reps, duration: s.entry?.duration ?? to.duration };
        return { id: to.id, entry, dose: s.dose };
      }
      return { id: to.id, mins: s.mins };
    });
    st = { ...st, practice: { ...p, steps }, kept: false };
    paint(false);
    root.querySelector(`#path-swap-${i}`)?.focus();
    say(`Swapped ${nameOf(from.id)} for ${nameOf(to.id)}.`);
  }

  /** Make it mine: this version, swaps and all, kept in Saved sessions for this door. */
  function keepMine() {
    const p = st.practice;
    const exercises = p.steps.map(s => BY_ID.get(s.id)).filter(Boolean)
      .map((e, j) => ({ ...e, sets: 1, reps: null, duration: Math.round((p.steps[j].mins || 1) * 60) }));
    const res = keepVersion(`${p.name}, my version`, { title: p.name, exercises, door: st.door, durationMins: p.minutes,
      sessionType: st.door === "stretch" ? "stretch" : null });
    if (res?.ok) { st = { ...st, kept: true }; paint(false); root.querySelector("#path-mine")?.focus(); say(`Kept in Saved sessions as ${p.name}, my version.`); }
    else say(res?.reason === "dupe" ? "You already have one kept under that name." : "That could not be kept.");
  }

  /** P-8. Outside's warm-up or cool-down for the activity chosen, as a proposal (a library practice, or an approved routine). */
  function outsidePractice(kind) {
    const plan = OUTSIDE_PLANS[st.activity]; if (!plan) return null;
    const ref = kind === "warm" ? { practice: plan.warm } : plan.cool;
    if (ref.routine) { const r = ROUTINES.find(x => x.id === ref.routine); return r ? { ...r, steps: stepsFor(r, null) } : null; }
    const e = BY_ID.get(ref.practice); if (!e) return null;
    const mins = Math.max(1, Math.round((e.duration || 300) / 60));
    return { id: e.id, name: e.name, minutes: mins, style: null, position: null, steps: [{ id: e.id, mins }] };
  }

  // ── Presses ────────────────────────────────────────────────────────────
  function onRow(v) {
    switch (step) {
      case "where": return go(v === "outside" ? "activity" : "area", { place: v });
      case "area":  return go("how", { part: v });
      case "how":
        if (v === "coach") return go("buildlen", {});
        if (v === "own") { router.knowWhatStart = knowWhatFor(st.door, st.part, st.place); router.navigate("know-what"); return; }
        if (v === "saved") { router.savedStart = { purpose: st.door, place: st.place }; router.navigate("saved-sessions"); return; }
        return;
      case "activity": return go("outplan", { activity: v });
      case "outplan": {
        if (v === "warm" || v === "cool") {
          const p = outsidePractice(v); if (!p) return;
          return go("prog", { practice: p, fresh: false, reason: null, note: null, surprise: false, fromCoach: false });
        }
        presetLogActivity(OUTSIDE_PLANS[st.activity]?.log || "Other outdoor");   // Log what I did, with the activity chosen
        router.navigate("activity-log"); return;
      }
      case "sarea": return go("routines", { area: v, floor: "yes" });
      case "routines": {
        if (v === "fresh") {
          store.set("requestedSessionType", "stretch");
          store.set("sessionZoneFocus", [...(STRETCH_AREA_ZONES[st.area] || [])]);
          setTodaysLength("quick");
          router.planDoor = "stretch";
          router.navigate("coach-proposal"); return;
        }
        if (v === "saved") { router.savedStart = { purpose: "stretch", place: null }; router.navigate("saved-sessions"); return; }
        const r = ROUTINES.find(x => x.id === v); if (!r) return;
        return go("prog", { practice: { ...r, steps: stepsFor(r, st.floor !== "no" ? null : false) }, fresh: false, reason: null, note: null, surprise: false, fromCoach: false });
      }
      case "feel":
        if (v === "help") return go("helpme", {});
        if (v === "surprise") {
          const s = pickSurprise({ checkin: checkinToday() });
          if (!s) { say("Nothing fits right now. Pick a feeling instead."); return; }
          return go("prog", { practice: s.programme, feeling: s.programme.feeling, surprise: true, fresh: false, reason: null, note: null, fromCoach: false });
        }
        return go("progs", { feeling: v, flen: null, markId: null });
      case "helpme": {
        const helped = suggestFeeling({ checkin: { energy: Number(v), mood: null } });
        trail.pop(); step = "feel"; st = { ...st, helped }; paint();
        say(`Suggested: ${FEELINGS[helped.feeling].label}.`);
        return;
      }
      case "progs": {
        if (v === "fresh") {
          const f = freshPractice(); if (!f) return;
          return go("prog", { practice: f.practice, fresh: !!f.fresh, note: f.note || null, reason: null, surprise: false, fromCoach: false });
        }
        const p = PROGRAMMES.find(x => x.id === v); if (!p) return;
        return go("prog", { practice: p, fresh: false, reason: null, note: null, surprise: false, fromCoach: false });
      }
    }
  }

  function wire() {
    root.querySelector("#path-back")?.addEventListener("click", back);
    root.querySelectorAll(".path-row[data-v]").forEach(b => b.addEventListener("click", () => { opener = b.id; onRow(b.dataset.v); }));
    root.querySelectorAll('input[name="flen"]').forEach(r => r.addEventListener("change", () => {
      st.flen = r.value; paint(false);
      root.querySelector(`input[name="flen"][value="${r.value}"]`)?.focus();
      const m = pickProgramme({ feeling: st.feeling, minutes: Number(r.value) });
      if (m) say(`Marked ${m.programme.name}. ${m.reason}`);
    }));
    root.querySelectorAll('input[name="floor"]').forEach(r => r.addEventListener("change", () => {
      st.floor = r.value; paint(false);
      root.querySelector(`input[name="floor"][value="${r.value}"]`)?.focus();
      say(r.value === "no" ? "Showing ones without the floor." : "Showing all of them.");
    }));
    root.querySelectorAll('input[name="blen"]').forEach(r => r.addEventListener("change", () => { st.blen = r.value; }));
    root.querySelector("#path-build")?.addEventListener("click", () => {
      store.set("requestedSessionType", sessionTypeFor(st.door, st.part));
      store.set("requestedLocation", st.place);
      setTodaysLength(st.blen || "short");
      router.planDoor = st.door;   // P-6: the door goes with the session it starts
      router.navigate("coach-proposal");
    });
    root.querySelector("#path-start")?.addEventListener("click", () => startPractice(router, st.practice, { door: st.door, feeling: st.door === "feel" ? st.feeling : null }));
    root.querySelectorAll("[data-swap]").forEach(b => b.addEventListener("click", () => swapAt(Number(b.dataset.swap))));
    root.querySelector("#path-mine")?.addEventListener("click", keepMine);
    root.querySelector("#path-wellbeing")?.addEventListener("click", () => router.navigate("noticing"));
    root.querySelector("#path-redo")?.addEventListener("click", () => {
      // As Home's row: the check-in, then straight on to the coach's choice (today.js reads pathStart.coach).
      store.set("pendingDoorRoute", "today");
      router.pathStart = { coach: true };
      router.navigate("checkin");
    });
  }

  function paint(focus = true) {
    if (!root) return;
    const door = DOOR[st.door];
    root.innerHTML = `
      <div class="path-view" data-step="${step}" data-door="${st.door}" style="--k: var(--kind-${door.kind})">
        ${trail.length ? `<button type="button" class="path-back" id="path-back"><span aria-hidden="true">‹</span> Back</button>` : ""}
        ${STEPS[step]()}
        <p class="sr-only" role="status" aria-live="polite" id="path-live"></p>
      </div>`;
    live = root.querySelector("#path-live");
    wire();
    if (focus) { root.querySelector(".path-h1")?.focus(); try { window.scrollTo(0, 0); } catch {} }
  }

  function onUnmount() { root = null; live = null; }

  return { mount, onUnmount };
}
