/**
 * views/path.js
 * 06 Nov 2026 v13
 *
 * v13 - P-28 S4 GUIDE ME (Graeme, 05 Nov; prototype v5). Outside › Walk,
 *   Run or Bike ride asks How would you like your walk? before the plan:
 *   Just go (the plan as before), Guide me (the walk door has two, the
 *   mindful walk and a walk in any weather; it opens What will happen,
 *   views/guide-me.js) or Take three with you (three things to notice,
 *   read now, then the plan). On a bike ride nothing talks to you on the
 *   road: the line says so, and Guide me is offered indoors only. Log it
 *   keeps the way chosen on the entry (activityLog[].guideMe).
 *
 * v12 - P-27 TIDY (Graeme, 05 Nov). (1) My programme leaves How would you
 *   like it? (Graeme: "Remove it"): it replayed only the session already
 *   built today, and after that session said "complete your check-in" to
 *   somebody who had. (2) ‹ Back on Today's plan, from Build my session,
 *   comes back to the length step with every choice kept
 *   (router.pathReturn); it went Home and lost them, the same as Not today.
 *
 * v11 - P-26 ONE-BUILD-PAGE (mock-up v1 approved 02 Nov). Build my own, in
 *   Get stronger and Keep moving, opens Build a session with the door, part
 *   and place chosen (router.buildStart). A session built there and started
 *   now arrives as router.pathStart.practice and opens as a proposal, as a
 *   kept session does. Graeme's answer for the day itself: a kept or built
 *   session leaves out what today's sore areas rule out (path-context
 *   soreRuledOut), says which and why, and offers that row's Swap; Start
 *   plays the rest. A kept session's proposal offers Change this session
 *   (Build a session, editing it), the "Change it" the mock-up put on Home,
 *   moved here so Home keeps six ways in.
 *
 * v10 - P-23, P-24. How would you like it? gains Make it up as I go (the
 *   capture room, at the place chosen). A proposal's Swap opens a panel under
 *   its row: like this one, then a search (data/swap-search.js). A trend's
 *   step stays inside the trend's own moves, so it has no search.
 *
 * 01 Nov 2026 v9
 *
 * v9 - P-21 TRENDS-WEEK. Home's row for a trend day in Your week arrives
 *   with router.pathStart.trendDay ({ id, day }) and opens that day: Zone 2
 *   and a snack straight to their proposal (From your week), the trend's
 *   list behind Back; HILIT, Hybrid training and reformer-style at their
 *   step, which asks its quick questions; Mix it up at its choices.
 *
 * v8 - P-20 session 4: reformer-style Pilates with a band (approved 01 Nov,
 *   Graeme; Get stronger). Its step says the week, asks the floor question
 *   and how long, and offers today's reformer-style session, the library's
 *   own Mat Adaptation and, from week 9 once a week, Dynamic Pilates. Up to
 *   three days a week, a day off between. Always reformer-style.
 *
 * v7 - P-20 session 3: Hybrid training (approved 01 Nov, Graeme; Get
 *   stronger only). Its step says the week and the stations, asks how long
 *   and what goes between the stations (everyone chooses, a run or not),
 *   and from week 11 offers the full eight at your own pace. A station the
 *   time leaves out is said, for another day. Never a time kept.
 *
 * v6 - P-20 session 2: HILIT (approved 01 Nov, Graeme: "HILIT: hard work,
 *   no jumping"; two days a week at most, never back to back). Follow a
 *   fitness trend lists it in Get stronger and Keep moving. Its step says
 *   the week, asks how long and standing or seated, and builds today's
 *   session as a proposal; on a day it is not offered, it says why.
 *
 * v5 - P-20 TRENDS-BUILD, session 1 (content approved 01 Nov, Graeme:
 *   BNH-Files Product/alongside_content_trends-zone2-snacks-cross_01nov2026_v2.md).
 *   How would you like it? gains Follow a fitness trend (Get stronger and
 *   Keep moving, Home or Gym): Zone 2, mostly easy (Keep moving), Mix it up
 *   (cross training) and A 10-minute snack. Each is a recipe filled from the
 *   library (data/trend-recipes.js) and shown as a proposal like any other:
 *   figures, Swap (only within the recipe's own pool), Start. The session's
 *   effort is said in the talk test's words, with the safety line on a Hard
 *   one. Choosing Zone 2 or Mix it up starts following it (store.trends);
 *   Zone 2 says its week and offers the harder day only from week 5 and once
 *   a week; Mix it up offers two or three easy swaps for what they do most,
 *   and the person picks. The ten new movements stay held (none offered).
 *
 * v4 - P-13 LIBRARY, doors first (Graeme, 31 Oct: "Doors first, then trim";
 *   Mobility & Conditioning split into the Stretch door). Every room the
 *   Plan's Library no longer lists is behind a door:
 *   - Outside › Run, Bike ride, Walk or hike, Open-water swim: "A guided
 *     run / ride / walk / swim" opens that room;
 *   - Stretch: after the areas, Yoga & Pilates and A mobility session (the
 *     coach's mobility plan, as Mobility & Conditioning's was);
 *   - Get stronger › Gym: My programme.
 *   verify-library-shelf drives each from Home.
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
import { checkinToday, lastPlace, lowMood, shownAdjustments, freshPracticeFor, swapOptionsFor, soreRuledOut } from "../data/path-context.js";
import { areaWords } from "../data/conditions.js";
import { renderSwapSearch, wireSwapSearch, kitWords } from "../data/swap-search.js";
import { savedSessions, resolveSavedSession } from "../data/saved-sessions.js";
import { keepVersion } from "../save-block.js";
import { OUTSIDE_PLANS } from "../data/outside.js";
import { presetLogActivity } from "./activity-log.js";
import { GUIDE_SESSIONS, sessionsForDoor } from "../data/guide-me.js";
import { openGuideMe } from "./guide-me.js";
import { setTodaysLength, lengthCatForToday, todaysLengthCat } from "../data/session-length.js";
import { equipmentForLocation } from "../session-builder.js";
import { resolveEquipment, exerciseIsAvailable } from "../data/equipment-map.js";
import { TRENDS, EFFORT, HARD_SAFETY, ZONE2_ACTIVITIES, zone2Week, zone2Session, zone2HardDoneThisWeek,
         SNACK_QUALITIES, snackSession, MAIN_ACTIVITIES, mainActivityFrom, crossOptions, recentTrendIds, plainName,
         hilitWeek, hilitDayAllowed, hilitSession, HYBRID_BETWEEN, hybridWeek, hybridDayAllowed, hybridSession,
         reformerWeek, reformerDayAllowed, reformerSession, dynamicSession, dynamicDoneThisWeek } from "../data/trend-recipes.js";

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
// v4 (P-13). The guided room for each outside activity, in the words its Library tile used.
const GUIDED = { run: ["running-session", "A guided run", "Easy, intervals, or long run"], bike: ["cycle-session", "A guided ride", "Road, indoor, or turbo trainer"],
  walk: ["walk-session", "A guided walk", "Gentle, mindful, brisk, or nature walk"], swim: ["swim-session", "A guided swim", "Steady or interval swim session"] };
// P-28. The three ways, for the activities Guide me has (its door id for each).
const GUIDE_DOOR = { walk: "walk", run: "run", bike: "ride" };
const NOUN = { walk: "walk", run: "run", bike: "ride" };
const ENJOY = { run: "Enjoy your run", bike: "Enjoy your ride", walk: "Enjoy your walk", swim: "Enjoy your swim", sport: "Enjoy the game", other: "Enjoy it" };
const STYLE = { gentle: "Gentle movement", yoga: "Yoga", taichi: "Tai chi", qigong: "Qigong", pilates: "Pilates", stretch: "Stretches" };
const POSITION = { standing: "Standing", seated: "Seated", floor: "On the floor", lying: "Lying down", mixed: "Mixed" };
const ENERGY = [["Running on empty", 2], ["Low", 3], ["Okay", 6], ["Good", 7], ["Full of it", 9]];
const FEEL_LENGTHS = [5, 10, 15, 20];
const BUILD_LENGTHS = [["micro", 10], ["quick", 20], ["short", 30], ["standard", 40], ["long", 50]];
/** P-20. A step's length in words: seconds under two minutes when not whole, else whole minutes ("0.666… min" was shown). */
export const stepLength = m => { const n = Number(m) || 0; return n < 2 && Math.abs(n - Math.round(n)) > 0.01 ? `${Math.round(n * 60)} seconds` : `${Math.round(n)} min`; };
/** P-20. Today's length in minutes, only when chosen today (else the recipe's own). */
const lengthMinsToday = () => BUILD_LENGTHS.find(([c]) => c === todaysLengthCat())?.[1] || null;

/** D4: a door, a part and a place, as the builder's session type. */
export function sessionTypeFor(door, part) {
  if (door === "moving") return part === "whole" ? "cardio" : part;
  return part === "whole" ? "full" : part;
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
    ? practice.steps.filter(s => !(s.out || []).length).map(s => s.entry).filter(Boolean)
    : practice.steps.map(s => {
      const e = BY_ID.get(s.id);
      return e ? { ...e, ...(s.label ? { name: s.label } : {}), reps: null, sets: 1, duration: Math.round(s.mins * 60), pathNote: s.note || null } : null;
    }).filter(Boolean);
  if (!exercises.length) return;
  const session = { id: practice.id, title: practice.name, duration: practice.minutes ? `${practice.minutes} mins` : null, exercises,
                    sessionType: practice.sessionType || (door === "stretch" ? "stretch" : null), door, feeling };
  if (practice.place) session.place = practice.place;
  if (!practice.saved) session.programmeId = practice.id;
  // P-20. A trend session says which trend, its effort, and whether it is a snack (Schema v1.117).
  if (practice.trend && practice.trend !== "snack") session.trend = practice.trend;
  if (practice.effort) session.effort = practice.effort;
  if (practice.snack) session.snack = true;
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
/**
 * P-26. A kept or built session on the day: each movement today's sore
 * areas rule out is marked out (with the areas), so the proposal says so,
 * offers its Swap, and Start leaves it out. Nothing else changes.
 */
export function markSore(practice) {
  if (!practice?.saved) return practice;
  return { ...practice, steps: practice.steps.map(s => ({ ...s, out: soreRuledOut(s.entry || BY_ID.get(s.id)) })) };
}
const areaList = ids => { const w = ids.map(id => `your ${areaWords(id)}`); return w.length > 1 ? `${w.slice(0, -1).join(", ")} and ${w[w.length - 1]}` : w[0] || ""; };

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
    // P-27. Back from Today's plan: the steps as they were left.
    const ret = !start && router.pathReturn ? router.pathReturn : null;
    router.pathReturn = null;
    const door = start?.door || ret?.st?.door || lastDoor;
    // The Plan's only (A1.2): Free has no doors, and is sent Home.
    if (!isPremium() || !door || !DOOR[door]) { router.navigate("today", { replace: true }); return; }
    lastDoor = door;
    trail = [];
    st = { door };
    if (ret && DOOR[ret.st.door]) { trail = ret.trail; st = ret.st; step = ret.step; paint(); return; }
    if (start?.saved) {
      const rec = savedSessions().find(x => x.id === start.saved);
      if (rec) { step = "prog"; st = { door, practice: markSore(practiceFromSaved(rec)), fromSaved: true }; paint(); return; }
    }
    // P-26. A session from Build a session, started now: the same proposal.
    if (start?.practice && Array.isArray(start.practice.steps)) {
      step = "prog"; st = { door, practice: markSore(start.practice), fromSaved: true }; paint(); return;
    }
    if (start?.trendDay && openTrendDay(door, start.trendDay, start.mins)) return;
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
          ${row({ v: "own", t: "Build my own", d: "Choose each move, with help when you want it" })}
          ${row({ v: "asgo", t: "Make it up as I go", d: "Go to an exercise, log your sets, then choose the next" })}
          ${row({ v: "trend", t: "Follow a fitness trend", d: trendsFor(st.door).map(([, x]) => x.short).join(", ") })}
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
    // P-28. How would you like it? Just go, Guide me, Take three with you.
    gway() {
      const ss = sessionsForDoor(GUIDE_DOOR[st.activity]);
      const road = st.activity === "bike";
      return `${bar(3, 3)}${heading(`How would you like your ${NOUN[st.activity]}?`)}
        <ul class="path-list">
          ${row({ v: "just", t: "Just go", d: "Your own thoughts, or your music. No voice.", icon: "play", kind: DOOR[st.door].kind })}
        </ul>
        ${road ? `<p class="path-note" id="path-road">${esc(GUIDE_SESSIONS.ride.roadLine)}</p>` : ""}
        <ul class="path-list">
          ${ss.map(s => row({ v: "guide:" + s.id, t: road ? "Guide me, indoors" : ss.length > 1 ? `Guide me: ${s.title}` : "Guide me",
              d: road ? `${esc(s.title)}, ${s.mins} minutes, on a turbo or bike at home.` : `${esc(s.title)}, ${s.mins} minutes. Put your headphones in.`, icon: "instep", kind: "orchid" })).join("")}
          ${row({ v: "three", t: "Take three with you", d: "Three things to notice, read now. No audio, so keep your music on if you like.", icon: "keep", kind: "orchid" })}
        </ul>`;
    },
    gthree() {
      const s = sessionsForDoor(GUIDE_DOOR[st.activity])[0];
      return `${heading("Three to take with you", "instep", "orchid")}
        <p class="path-small">Read them now. Nothing will speak or buzz while you\u2019re out.</p>
        ${st.activity === "bike" ? `<p class="path-note">${esc(GUIDE_SESSIONS.ride.roadLine)}</p>` : ""}
        <div class="card instep-card"><ol class="path-three">${s.three.map(x => `<li>${esc(x)}</li>`).join("")}</ol></div>
        <button type="button" class="btn btn-primary btn-full" id="path-three-go">Got them. Start</button>`;
    },
    outplan() {
      return `${bar(3, 3)}${heading(ENJOY[st.activity] || "Enjoy it")}
        <p class="path-coachline">I can get you ready for it, and you can log it here when you\u2019re back.</p>
        <ul class="path-list">
          ${outsidePractice("warm") ? row({ v: "warm", t: "Warm-up before", d: `${esc(outsidePractice("warm").name)} \u00b7 about ${outsidePractice("warm").minutes} min`, icon: "sun", kind: DOOR[st.door].kind }) : ""}
          ${outsidePractice("cool") ? row({ v: "cool", t: "Cool-down after", d: `${esc(outsidePractice("cool").name)} \u00b7 about ${outsidePractice("cool").minutes} min`, icon: "moon", kind: DOOR[st.door].kind }) : ""}
          ${GUIDED[st.activity] ? row({ v: "guided", t: GUIDED[st.activity][1], d: GUIDED[st.activity][2], icon: ACTIVITIES.find(a => a.id === st.activity)?.icon || "outside", kind: DOOR[st.door].kind }) : ""}
          ${row({ v: "log", t: "Log it", d: "How long it was, and how it felt", icon: "pencil", kind: DOOR[st.door].kind })}
        </ul>`;
    },

    // P-20. Follow a fitness trend
    trends() {
      return `${heading("Follow a fitness trend", "fresh", DOOR[st.door].kind)}
        <ul class="path-list">${trendsFor(st.door).map(([id, x]) => {
          const w = ["zone2", "hilit", "hybrid", "reformer"].includes(id) ? store.trendWeek(id) : null;
          return row({ v: id, t: x.name, d: esc(x.line) + (w ? ` · Week ${w}` : ""), icon: x.icon, kind: DOOR[st.door].kind }); }).join("")}</ul>`;
    },
    z2act() {
      return `${heading("Which do you want to keep easy?", "run", DOOR[st.door].kind)}
        <p class="path-small">Zone 2 is mostly easy days of one activity, with one harder day from week 5.</p>
        <ul class="path-list">${ZONE2_ACTIVITIES.map(a => row({ v: a.id, t: a.label })).join("")}</ul>`;
    },
    z2day() {
      const t = followed("zone2"), wk = zone2Week(store.trendWeek("zone2") || 1);
      const label = ZONE2_ACTIVITIES.find(a => a.id === t?.activity)?.label || "";
      const hardDone = zone2HardDoneThisWeek(store.get("activityLog") || []);
      const hardNote = !wk.hardAllowed ? "The harder day starts in week 5. Until then, every day is easy."
        : hardDone ? "This week\u2019s harder day is done. The rest of the week is easy." : "";
      return `${heading(`Zone 2: ${label}, week ${wk.week}`, "run", DOOR[st.door].kind)}
        <p class="path-coachline">Mostly easy, with one harder day.${wk.easier ? " This is an easier week." : ""}</p>
        <ul class="path-list">
          ${row({ v: "easy", t: "An easy day", d: `About ${zone2Session({ ...recipeIn(), activity: t.activity, week: wk.week })?.minutes || wk.easyMins} min \u00b7 ${esc(EFFORT.easy)}`, tint: true })}
          ${wk.hardAllowed && !hardDone ? row({ v: "hard", t: "The harder day", d: `About 25 min \u00b7 ${esc(EFFORT.hard)}` }) : ""}
          ${row({ v: "change", t: "Change the activity", d: `Now: ${esc(label)}` })}
          ${row({ v: "stop", t: "Stop following Zone 2" })}
        </ul>
        ${hardNote ? `<p class="path-small">${esc(hardNote)}</p>` : ""}`;
    },
    hilit() {
      const wk = hilitWeek(store.trendWeek("hilit") || 1);
      const day = hilitDayAllowed(store.get("activityLog") || []);
      const len = st.hlen || "30";
      return `${heading(`HILIT, week ${wk.week}`, "strength", DOOR[st.door].kind)}
        <p class="path-coachline">Short bursts of ${wk.work} seconds, then ${wk.rest} seconds\u2019 rest. Nothing leaves the floor.${wk.easier ? " This is an easier week." : ""}</p>
        ${day.ok ? `${radios("hlen", "How long have you got?", [["20", "20 min"], ["30", "30 min"], ["40", "40 min"]], len)}
        ${radios("hseat", "Standing or seated?", [["stand", "Standing"], ["seated", "Seated"]], st.hseat || "stand")}
        <ul class="path-list">${row({ v: "go", t: "Today\u2019s HILIT", d: esc(EFFORT.hard), tint: true })}</ul>` : `<p class="path-note" id="path-hilit-why">${esc(day.why)}</p>`}
        ${followed("hilit") ? `<ul class="path-list">${row({ v: "stop", t: "Stop following HILIT" })}</ul>` : ""}
        <p class="path-small">Two HILIT days a week at most, with a day off between.</p>`;
    },
    hybrid() {
      const wk = hybridWeek(store.trendWeek("hybrid") || 1);
      const day = hybridDayAllowed(store.get("activityLog") || []);
      const what = wk.block === 1 ? `Four stations, ${wk.each} minutes each, with an easy walk between.` : `${wk.stations} stations, about ${Math.round(wk.each)} minutes each, with ${wk.between >= 3 ? "3 minutes" : "2 or 3 minutes"} between.`;
      return `${heading(`Hybrid training, week ${wk.week}`, "strength", DOOR[st.door].kind)}
        <p class="path-coachline">${esc(what)}${wk.easier ? " This is an easier week." : ""} No time is kept.</p>
        ${day.ok ? `${radios("ylen", "How long have you got?", [["30", "30 min"], ["45", "45 min"], ["60", "60 min"], ["75", "75 min"]], st.ylen || "45")}
        ${wk.runs ? radios("ybetween", "Between the stations", HYBRID_BETWEEN.map(b => [b.id, b.label]), st.ybetween || "walk") : ""}
        <ul class="path-list">
          ${row({ v: "go", t: "Today\u2019s stations", d: esc(EFFORT.hard), tint: true })}
          ${wk.fullEight ? row({ v: "full", t: "The full eight, at your own pace", d: "All eight stations, in order. Nothing is timed." }) : ""}
        </ul>` : `<p class="path-note" id="path-hybrid-why">${esc(day.why)}</p>`}
        ${followed("hybrid") ? `<ul class="path-list">${row({ v: "stop", t: "Stop following Hybrid training" })}</ul>` : ""}
        <p class="path-small">Two days a week at most, with a day off between.</p>`;
    },
    reformer() {
      const wk = reformerWeek(store.trendWeek("reformer") || 1);
      const day = reformerDayAllowed(store.get("activityLog") || []);
      const dyn = wk.dynamic && !dynamicDoneThisWeek(store.get("activityLog") || []);
      const floor = st.rfloor !== "no";
      return `${heading(`Reformer-style, week ${wk.week}`, "yoga", DOOR[st.door].kind)}
        <p class="path-coachline">A reformer class\u2019s order, with a long band where the springs would be. Slow, with control.${wk.easier ? " This is an easier week." : ""}</p>
        ${day.ok ? `${radios("rfloor", "Can you get down to the floor today?", [["yes", "Yes"], ["no", "Not today"]], floor ? "yes" : "no")}
        ${radios("rlen", "How long have you got?", [["20", "20 min"], ["30", "30 min"], ["40", "40 min"]], st.rlen || "20")}
        <ul class="path-list">
          ${row({ v: "go", t: "Today\u2019s reformer-style session", d: esc(EFFORT.steady), tint: true })}
          ${dyn && floor ? row({ v: "dynamic", t: "Dynamic Pilates", d: "Pilates moves, each followed by a short band burst. Once a week." }) : ""}
          ${floor && BY_ID.has("pilates-reformer-simulation") ? row({ v: "mat", t: "Reformer-Style Pilates, Mat Adaptation", d: "The library\u2019s own 30 minute sequence" }) : ""}
        </ul>` : `<p class="path-note" id="path-reformer-why">${esc(day.why)}</p>`}
        ${followed("reformer") ? `<ul class="path-list">${row({ v: "stop", t: "Stop following reformer-style" })}</ul>` : ""}
        <p class="path-small">Up to three days a week, with a day off between.</p>`;
    },
    squal() {
      const mine = SNACK_QUALITIES.filter(q => q.door === st.door || (st.door === "moving" && q.id === "legs"));
      const len = st.slen || "10";
      return `${heading("A 10-minute snack", "sparkle", DOOR[st.door].kind)}
        <p class="path-small">A short burst for one thing. Ten minutes still counts.</p>
        ${radios("slen", "How long have you got?", [["10", "10 min"], ["15", "15 min"]], len)}
        ${radios("sseat", "Standing or seated?", [["stand", "Standing"], ["seated", "Seated"]], st.sseat || "stand")}
        <ul class="path-list">${mine.map(q => row({ v: q.id, t: q.label })).join("")}</ul>`;
    },
    xmain() {
      return `${heading("What do you do most?", "fresh", DOOR[st.door].kind)}
        <p class="path-small">Mix it up swaps one day of it for something that uses your body differently.</p>
        <ul class="path-list">${MAIN_ACTIVITIES.map(a => row({ v: a.id, t: a.label })).join("")}</ul>`;
    },
    xopts() {
      const t = followed("cross");
      const label = MAIN_ACTIVITIES.find(a => a.id === t?.activity)?.label?.toLowerCase() || "";
      const opts = crossOptions({ ...recipeIn(), main: t?.activity });
      return `${heading("Mix it up", "fresh", DOOR[st.door].kind)}
        <p class="path-coachline">You usually ${t?.activity === "workout" ? "do strength work" : t?.activity === "yoga" ? "do yoga or Pilates" : esc(label)}. Something different today?</p>
        <ul class="path-list">${opts.map(o => row({ v: o.id, t: o.name, d: `About ${o.minutes} min \u00b7 ${esc(EFFORT[o.effort])}` })).join("")}</ul>
        <p class="path-small">You choose. It uses your body differently, and gives the same parts a break from the same work.</p>
        <ul class="path-list">
          ${row({ v: "change", t: "That\u2019s not what I do most", d: `Now: ${esc(MAIN_ACTIVITIES.find(a => a.id === t?.activity)?.label || "")}` })}
          ${row({ v: "stop", t: "Stop mixing it up" })}
        </ul>`;
    },

    // Stretch
    sarea() {
      return `${bar(1, 2)}${heading("Where do you want to stretch?")}
        <ul class="path-list">${Object.entries(AREAS).map(([id, a]) => row({ v: id, t: a.label, icon: "mobility", kind: "violet" })).join("")}</ul>
        <h2 class="look-label" id="path-more-stretch">Or a whole session</h2>
        <ul class="path-list" aria-labelledby="path-more-stretch">
          ${row({ v: "yoga", t: "Yoga & Pilates", d: "Flexibility, strength, balance, recovery", icon: "yoga", kind: "violet" })}
          ${row({ v: "mobility", t: "A mobility session", d: "Hips, spine, ankles and shoulders, with some yoga and Pilates, adapted to how you\u2019re doing today", icon: "fresh", kind: "violet" })}
        </ul>`;
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
      const outs = p.steps.filter(s => (s.out || []).length);
      const outAreas = [...new Set(outs.flatMap(s => s.out))];
      const canStart = p.steps.length > outs.length;
      const editable = p.saved && savedSessions().some(x => x.id === p.id);
      return `${heading(p.name, icon, kind)}
        ${line ? `<p class="${st.note ? "path-note" : "path-coachline"}">${esc(line)}</p>` : ""}
        <p class="path-small">${esc(meta)}</p>
        ${p.support ? `<p class="path-small">${esc(p.support)}</p>` : ""}
        ${p.effort ? `<p class="path-small path-effort" id="path-effort">${esc(EFFORT[p.effort])}${p.line ? ` ${esc(p.line)}` : ""}</p>` : ""}
        ${p.effort === "hard" ? `<p class="path-note" id="path-hard-safety">${esc(HARD_SAFETY)}</p>` : ""}
        ${p.slowLine || p.style === "taichi" || p.style === "qigong" ? `<p class="path-small">${esc(SLOW_LINE)}</p>` : ""}
        ${adj.length ? `<div class="path-adj"><p class="path-adj__lbl">What I’ve adjusted</p><ul>${adj.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
        ${outs.length ? `<p class="path-note" id="path-outs">Left out today, because ${esc(areaList(outAreas))} ${outAreas.length > 1 ? "are" : "is"} sore: ${esc(outs.map(s => nameOf(s.id)).join(", "))}. Each has a Swap, or start without ${outs.length > 1 ? "them" : "it"}.</p>` : ""}
        <button type="button" class="btn btn-primary btn-full" id="path-start"${canStart ? "" : ' disabled aria-describedby="path-outs"'}>Start</button>
        ${editable ? `<button type="button" class="path-link" id="path-change">Change this session</button>` : ""}
        ${st.fromCoach ? `<button type="button" class="path-link" id="path-redo">Change my check-in</button>` : ""}
        ${st.door === "feel" && lowMood() ? `<button type="button" class="path-link" id="path-wellbeing">Or something from Wellbeing</button>` : ""}
        ${!p.saved ? `<button type="button" class="path-link" id="path-mine"${st.kept ? " disabled" : ""}>${st.kept ? "Kept in Saved sessions" : "Make it mine"}</button>` : ""}
        <h2 class="path-adj__lbl" id="path-mvs-h">What\u2019s in it</h2>
        <ol class="path-mvs" aria-labelledby="path-mvs-h">${p.steps.map((s, i) => {
          const e = BY_ID.get(s.id) || {};
          const q = encodeURIComponent(e.youtube || `${e.name || s.id} how to`);
          return `<li class="path-mv">${renderFigure(s.id) || ""}
            <p class="path-mv__nm" id="path-mv-${i}">${i + 1}. ${esc(s.label || nameOf(s.id))}</p>
            <p class="path-small">${s.dose ? esc(s.dose) : stepLength(s.mins)}${s.note ? ` · ${esc(s.note)}` : ""}</p>
            ${(s.out || []).length ? `<p class="path-small path-mv__out">Left out today, for ${esc(areaList(s.out))}</p>` : ""}
            <span class="path-mv__acts">
              <a class="path-mv__yt" href="https://www.youtube.com/results?search_query=${q}" target="_blank" rel="noopener">Find a video on YouTube<span class="sr-only"> for ${esc(s.label || nameOf(s.id))} (opens YouTube, a search)</span></a>
              ${canSwap(p, s, ids) ? `<button type="button" class="btn btn-secondary path-mv__swap" id="path-swap-${i}" data-swap="${i}" aria-describedby="path-mv-${i}" aria-expanded="${st.swapOpen === i}"${st.swapOpen === i ? ` aria-controls="path-swp-${i}"` : ""}>Swap</button>` : ""}
            </span>
            ${st.swapOpen === i ? swapPanel(p, s, i, ids) : ""}
          </li>`; }).join("")}</ol>
        ${(p.easeOff || []).length ? `<div class="path-adj"><p class="path-adj__lbl">If you need it easier</p><ul>${p.easeOff.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
`;
    },
  };

  function feelingToday() { return suggestFeeling({ checkin: checkinToday() }); }

  // ── P-20, fitness trends ─────────────────────────────────────────────
  /** The trends a door offers, in order: [id, trend]. */
  function trendsFor(door) {
    return Object.entries(TRENDS).filter(([, x]) => x.doors.includes(door)).map(([id, x]) => [id, { ...x, short: x.short || x.name }]);
  }
  const followed = id => (store.get("trends") || []).find(t => t && t.id === id) || null;
  /** What every recipe needs: the library, the kit where they are, likes, Not again, what was done lately. */
  function recipeIn() {
    const kit = resolveEquipment(equipmentForLocation(st.place || "home").list);
    return { byId: BY_ID, available: e => !!e && exerciseIsAvailable(e, kit), prefs: store.get("exercisePreferences") || {},
             liked: store.get("likedMovements") || {}, recent: recentTrendIds(store.get("activityLog") || []) };
  }
  /** A recipe's step swaps only within its own pool; anything else as before. */
  function swapsFor(p, s, ids) {
    if (Array.isArray(s.swaps)) return s.swaps.filter(id => id !== s.id && !ids.includes(id)).map(id => BY_ID.get(id)).filter(Boolean);
    return swapOptionsFor(s.id, { door: st.door, feeling: st.feeling, exclude: ids });
  }
  /**
   * P-23. A recipe's step stays inside its own pool (the trend's rules); any
   * other step can also be searched for, so it always has a Swap.
   */
  const canSwap = (p, s, ids) => !Array.isArray(s.swaps) || swapsFor(p, s, ids).length > 0;
  function swapPanel(p, s, i, ids) {
    const like = swapsFor(p, s, ids).slice(0, 6);
    const nm = esc(s.label || nameOf(s.id));
    return `<div class="path-swp" id="path-swp-${i}" role="group" aria-labelledby="path-swp-h-${i}">
              <h3 class="path-swp__h" id="path-swp-h-${i}">Instead of ${nm}</h3>
              ${like.length ? `<p class="path-swp__sub" id="path-swp-like-${i}">Like this one</p>
              <ul class="path-swp__list" aria-labelledby="path-swp-like-${i}">${like.map(e => `<li><button type="button" class="path-swp__pick" data-swap-to="${esc(e.id)}"><span class="path-swp__name">${esc(e.name)}</span><span class="path-swp__kit">${esc(kitWords(e))}</span></button></li>`).join("")}</ul>` : ""}
              ${Array.isArray(s.swaps) ? `<p class="path-small">This one stays within the trend\u2019s own moves.</p>` : renderSwapSearch(`path-swp-${i}`)}
              <button type="button" class="btn btn-secondary btn-full" id="path-swp-keep">Keep ${nm}</button>
            </div>`;
  }
  const trendProg = practice => go("prog", { practice, fresh: false, reason: null, note: null, surprise: false, fromCoach: false });

  /**
   * P-21. A trend day from Your week, opened from Home. The trend's list sits
   * behind Back, as if the person had come through the door. Returns false
   * when the day cannot be opened (Home then stays where it was going).
   */
  function openTrendDay(door, td, mins) {
    const at = (next, patch = {}) => { step = next; st = { ...st, ...patch }; paint(); return true; };
    trail.push({ step: "trends", st: { door }, focus: null });
    const fromWeek = practice => at("prog", { practice, fresh: false, reason: "From your week.", note: null, surprise: false, fromCoach: false });
    if (td.id === "zone2") {
      const f = followed("zone2");
      if (!f?.activity) return at("z2act");
      trail.push({ step: "z2day", st: { door }, focus: null });
      const s = zone2Session({ ...recipeIn(), activity: f.activity, kind: td.day === "hard" ? "hard" : "easy", week: store.trendWeek("zone2") || 1, minutes: Number(mins) || null });
      if (s) return fromWeek(s);
      trail.pop(); return at("z2day");
    }
    if (td.id === "snack") {
      trail.push({ step: "squal", st: { door }, focus: null });
      const s = snackSession({ ...recipeIn(), quality: td.day, minutes: 10 });
      if (s) return fromWeek(s);
      trail.pop(); return at("squal");
    }
    if (td.id === "cross") return at(followed("cross")?.activity ? "xopts" : "xmain");
    if (["hilit", "hybrid", "reformer"].includes(td.id)) return at(td.id);
    trail = [];
    return false;
  }

  function savedFor(door, place) {
    return savedSessions().filter(s => (s.purpose == null || s.purpose === door) && (!place || s.place == null || s.place === place));
  }

  const freshPractice = () => freshPracticeFor({ feeling: st.feeling, minutes: Number(st.flen) || 10 });

  /** P-23. Swap opens that row's choices and search; again closes them. */
  function swapAt(i) {
    st = { ...st, swapOpen: st.swapOpen === i ? null : i };
    paint(false);
    if (st.swapOpen === i) root.querySelector(`#path-swp-${i} [data-swap-to], #path-swp-${i}-q`)?.focus();
    else root.querySelector(`#path-swap-${i}`)?.focus();
  }

  /** One movement for another, from the list or the search; said, and focus back on the row's Swap. */
  function swapTo(i, to) {
    const p = st.practice, from = p.steps[i];
    if (!to || !from || to.id === from.id || p.steps.some(s => s.id === to.id)) return;
    const steps = p.steps.map((s, j) => {
      if (j !== i) return s;
      if (p.saved) {
        const entry = { ...to, section: s.entry?.section, sets: s.entry?.sets ?? to.sets, reps: s.entry?.reps ?? to.reps, duration: s.entry?.duration ?? to.duration };
        return { id: to.id, entry, dose: s.dose };
      }
      return { ...s, id: to.id, ...(s.label ? { label: plainName(to.name) } : {}) };
    });
    st = { ...st, practice: { ...p, steps }, kept: false, swapOpen: null };
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
        // P-26. Build a session, with the door, part and place chosen.
        if (v === "own") { router.buildStart = { door: st.door, part: st.part, place: st.place, returnTo: "today" }; router.navigate("build-session"); return; }
        // P-24. The room that already exists: suggestions, a search, sets logged as they go.
        if (v === "asgo") { if (st.place) store.set("sessionLocation", st.place); router.navigate("capture"); return; }
        if (v === "saved") { router.savedStart = { purpose: st.door, place: st.place }; router.navigate("saved-sessions"); return; }
        if (v === "trend") return go("trends", {});
        return;
      case "trends":
        if (v === "zone2") return go(followed("zone2")?.activity ? "z2day" : "z2act", {});
        if (v === "cross") {
          const t = followed("cross");
          if (t?.activity) return go("xopts", {});
          const main = mainActivityFrom(store.get("activityLog") || []);
          if (main) { store.startTrend("cross", main); return go("xopts", {}); }
          return go("xmain", {});
        }
        if (v === "snack") return go("squal", {});
        if (v === "hilit") return go("hilit", {});
        if (v === "hybrid") return go("hybrid", {});
        if (v === "reformer") return go("reformer", {});
        return;
      case "reformer": {
        if (v === "stop") { store.stopTrend("reformer"); say("Stopped following reformer-style."); trail.pop(); step = "trends"; paint(); return; }
        if (!reformerDayAllowed(store.get("activityLog") || []).ok) return;
        const inn = { ...recipeIn(), minutes: Number(st.rlen || 20) };
        let s = null;
        if (v === "go") s = reformerSession({ ...inn, week: store.trendWeek("reformer") || 1, floor: st.rfloor !== "no" });
        else if (v === "dynamic") s = dynamicSession(inn);
        else if (v === "mat") { const e = BY_ID.get("pilates-reformer-simulation"); s = { id: e.id, trend: "reformer", effort: "steady", name: e.name, minutes: 30, steps: [{ id: e.id, mins: 30 }] }; }
        if (!s) { say("Nothing fits with the kit you have there. A long band is needed."); return; }
        if (!followed("reformer")) store.startTrend("reformer");
        return trendProg(s);
      }
      case "hybrid": {
        if (v === "stop") { store.stopTrend("hybrid"); say("Stopped following Hybrid training."); trail.pop(); step = "trends"; paint(); return; }
        if (!hybridDayAllowed(store.get("activityLog") || []).ok) return;
        const done = (store.get("activityLog") || []).filter(e => e && e.trend === "hybrid" && e.status !== "partial").length;
        const s = hybridSession({ ...recipeIn(), week: store.trendWeek("hybrid") || 1, minutes: Number(st.ylen || 45), half: done % 2,
                                  between: st.ybetween || "walk", full: v === "full" });
        if (!s) { say("Nothing fits with the kit you have there."); return; }
        if (!followed("hybrid")) store.startTrend("hybrid");
        return trendProg(s.leftOut.length ? { ...s, support: `Left for another day, to fit your time: ${s.leftOut.join(", ")}.` } : s);
      }
      case "hilit": {
        if (v === "stop") { store.stopTrend("hilit"); say("Stopped following HILIT."); trail.pop(); step = "trends"; paint(); return; }
        if (!hilitDayAllowed(store.get("activityLog") || []).ok) return;
        const s = hilitSession({ ...recipeIn(), week: store.trendWeek("hilit") || 1, minutes: Number(st.hlen || 30), place: st.place || "home", seated: st.hseat === "seated" });
        if (!s) { say("Nothing fits with the kit you have there."); return; }
        if (!followed("hilit")) store.startTrend("hilit");
        return trendProg(s);
      }
      case "z2act":
        if (followed("zone2")) store.changeTrendActivity("zone2", v); else store.startTrend("zone2", v);
        trail.pop(); return go("z2day", {});
      case "z2day": {
        if (v === "change") return go("z2act", {});
        if (v === "stop") { store.stopTrend("zone2"); say("Stopped following Zone 2."); trail.pop(); step = "trends"; paint(); return; }
        const wk = store.trendWeek("zone2") || 1;
        const s = zone2Session({ ...recipeIn(), activity: followed("zone2")?.activity, kind: v, week: wk, minutes: lengthMinsToday() });
        if (!s) { say("That one isn\u2019t available today."); return; }
        return trendProg(s);
      }
      case "squal": {
        const s = snackSession({ ...recipeIn(), quality: v, minutes: Number(st.slen || 10), seated: st.sseat === "seated" });
        if (!s) { say("Nothing fits with the kit you have there. Try another."); return; }
        return trendProg(s);
      }
      case "xmain":
        if (followed("cross")) store.changeTrendActivity("cross", v); else store.startTrend("cross", v);
        trail.pop(); return go("xopts", {});
      case "xopts": {
        if (v === "change") return go("xmain", {});
        if (v === "stop") { store.stopTrend("cross"); say("Stopped mixing it up."); trail.pop(); step = "trends"; paint(); return; }
        const o = crossOptions({ ...recipeIn(), main: followed("cross")?.activity }).find(x => x.id === v);
        return o ? trendProg(o) : undefined;
      }
      case "activity": return go(GUIDE_DOOR[v] ? "gway" : "outplan", { activity: v, way: null });
      case "gway": {
        if (v === "just") return go("outplan", { way: "just" });
        if (v === "three") return go("gthree", { way: "three" });
        if (v.startsWith("guide:")) {
          router.pathReturn = null;
          openGuideMe(v.slice(6), { activity: st.activity, ret: { step, st: { ...st }, trail: trail.map(t => ({ ...t })) } });
          router.navigate("guide-me"); return;
        }
        return;
      }
      case "outplan": {
        if (v === "warm" || v === "cool") {
          const p = outsidePractice(v); if (!p) return;
          return go("prog", { practice: p, fresh: false, reason: null, note: null, surprise: false, fromCoach: false });
        }
        if (v === "guided" && GUIDED[st.activity]) { router.navigate(GUIDED[st.activity][0]); return; }
        presetLogActivity(OUTSIDE_PLANS[st.activity]?.log || "Other outdoor", { guideMe: GUIDE_DOOR[st.activity] ? (st.way || "just") : null });   // Log what I did, with the activity chosen (P-28: and how it was taken)
        router.navigate("activity-log"); return;
      }
      case "sarea":
        if (v === "yoga") { router.navigate("yoga-session"); return; }
        if (v === "mobility") {
          store.set("requestedSessionType", "mobility");
          router.planDoor = "stretch";
          router.navigate("coach-proposal"); return;
        }
        return go("routines", { area: v, floor: "yes" });
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
    root.querySelectorAll('input[name="slen"]').forEach(r => r.addEventListener("change", () => { st.slen = r.value; }));
    root.querySelectorAll('input[name="sseat"]').forEach(r => r.addEventListener("change", () => { st.sseat = r.value; }));
    root.querySelectorAll('input[name="hlen"]').forEach(r => r.addEventListener("change", () => { st.hlen = r.value; }));
    root.querySelectorAll('input[name="hseat"]').forEach(r => r.addEventListener("change", () => { st.hseat = r.value; }));
    root.querySelectorAll('input[name="ylen"]').forEach(r => r.addEventListener("change", () => { st.ylen = r.value; }));
    root.querySelectorAll('input[name="ybetween"]').forEach(r => r.addEventListener("change", () => { st.ybetween = r.value; }));
    root.querySelectorAll('input[name="rlen"]').forEach(r => r.addEventListener("change", () => { st.rlen = r.value; }));
    root.querySelectorAll('input[name="rfloor"]').forEach(r => r.addEventListener("change", () => {
      st.rfloor = r.value; paint(false); root.querySelector(`input[name="rfloor"][value="${r.value}"]`)?.focus();
      say(r.value === "no" ? "Showing the session without the floor." : "Showing all of them.");
    }));
    root.querySelector("#path-build")?.addEventListener("click", () => {
      store.set("requestedSessionType", sessionTypeFor(st.door, st.part));
      store.set("requestedLocation", st.place);
      setTodaysLength(st.blen || "short");
      router.planDoor = st.door;   // P-6: the door goes with the session it starts
      router.pathBack = { step, st: { ...st }, trail: trail.map(t => ({ ...t })) };   // P-27: ‹ Back returns here
      router.navigate("coach-proposal");
    });
    root.querySelector("#path-start")?.addEventListener("click", () => startPractice(router, st.practice, { door: st.door, feeling: st.door === "feel" ? st.feeling : null }));
    // P-26. A kept session: change it on Build a session.
    root.querySelector("#path-change")?.addEventListener("click", () => { router.buildStart = { editId: st.practice.id, returnTo: "saved-sessions" }; router.navigate("build-session"); });
    root.querySelectorAll("[data-swap]").forEach(b => b.addEventListener("click", () => swapAt(Number(b.dataset.swap))));
    if (step === "prog" && Number.isInteger(st.swapOpen)) {
      const i = st.swapOpen, p = st.practice, ids = p.steps.map(s => s.id);
      root.querySelectorAll(`#path-swp-${i} [data-swap-to]`).forEach(b => b.addEventListener("click", () => swapTo(i, BY_ID.get(b.dataset.swapTo))));
      wireSwapSearch(root, `path-swp-${i}`, e => swapTo(i, BY_ID.get(e.id) || e), { place: st.place || p.place || null, exclude: ids });
      root.querySelector("#path-swp-keep")?.addEventListener("click", () => swapAt(i));
    }
    root.querySelector("#path-mine")?.addEventListener("click", keepMine);
    root.querySelector("#path-three-go")?.addEventListener("click", () => go("outplan", { way: "three" }));
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
