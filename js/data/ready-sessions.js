/**
 * data/ready-sessions.js
 * 24 Nov 2026 v2
 *
 * v2 - P-46 S4 FREE HOME. FREE_READY and freeReady(place): the six Free
 *   Home offers (spec §5). Home: rm-gs-h1, h5, h6, rm-km-h1, h2, h6; with a
 *   gym, rm-gs-g3, g6, rm-km-g2, g3 take the place of the first four.
 *
 * 19 Nov 2026 v1
 *
 * v1 - P-9d (c) READY-MADE SESSIONS (Graeme, 19 Nov, by voice: "could you
 *   please publish and push those exercise programs to the app"). Content:
 *   BNH-Files Product/alongside_content_ready-made-sessions_19nov2026_v1.md.
 *   24 sessions behind Get stronger and Keep moving, at the gym and at home
 *   (home: body weight only, Graeme's decision). The shape of each is
 *   Graeme's own (warm the heart up; the main part; bring it down; always a
 *   stretch); the amounts follow published guidance (NHS: strength on at
 *   least 2 days a week, every major group; ACSM: 2 to 3 sets of 8 to 12;
 *   AHA and Harvard Health: 5 to 10 minutes' warm-up and cool-down, stretches
 *   held 10 to 30 seconds). Graeme, 19 Nov: "I don't think I'm the authority
 *   here", so these go to the clinical reviewer with the next pack.
 *
 *   One session, three sizes, by rule (draft Part 2): Shorter (about 30),
 *   As written (about 45), Longer (about 60). Every movement is a library
 *   entry; every cool-down ends with an approved Stretch routine
 *   (stretch-routines.js). Nothing here is new movement content.
 *
 *   Not here yet, on purpose (draft §7 and §8, for Graeme): the gym recovery
 *   days, the week rotations in Your week, and the four library gaps (a
 *   plain bodyweight squat, water movement, a steady ski erg, a treadmill
 *   run). GS-H1 uses Sit to Stand for its squat until a plain one is written.
 *   Home warm-ups are indoor and quiet (marching, step touch, squat to reach,
 *   knee drives): the draft's sport-warmup-dynamic-full and -lower-body are
 *   jogs, skips and hops for a pitch (impact), found by the gate's 1g.
 */
import { ROUTINES } from "./stretch-routines.js";

/** Sizes: [id, word]. The minutes said beside each are worked out from the session itself (readySession), never a promise. */
export const SIZES = Object.freeze([
  ["short", "Shorter"],
  ["usual", "As written"],
  ["long",  "Longer"],
]);

// A step: { id, mins } (timed, one go) or { id, sets, reps } or { id, sets, secs }.
// rest is seconds between sets. label replaces the library name where the
// session uses the entry in its own way (said honestly, never a new move).
const W = (id, mins, label) => ({ id, mins, ...(label ? { label } : {}) });
const R = (id, sets, reps, rest = 60) => ({ id, sets, reps: String(reps), rest });
const H = (id, sets, secs, rest = 45) => ({ id, sets, secs, rest });
const C = (id, mins, label) => ({ id, mins, cardio: true, ...(label ? { label } : {}) });

/**
 * The 24 sessions. part: the "Which part of you?" choice it suits best
 * (whole, upper, lower, core); it is listed first for that choice and still
 * shown for the others. effort: the talk test's word (Keep moving only).
 */
export const READY_SESSIONS = Object.freeze([
  // ── Get stronger · Gym ──────────────────────────────────────────────
  { id: "rm-gs-g1", door: "stronger", place: "gym", part: "upper", name: "Upper focus, with core and legs",
    line: "Mostly upper body, with a little for your legs and middle.",
    warm: [W("cross-trainer-easy-warmup", 6)],
    main: [R("gym-lat-pulldown", 3, 10, 90), R("gym-chest-press-machine", 3, 10, 90), R("gym-seated-cable-row", 3, 10, 90),
           R("seated-shoulder-press", 2, 10), R("gym-leg-press", 2, 12), R("gym-cable-pallof-press", 2, "10 each side")],
    cool: [W("bike-easy-spin-warmup", 3)], stretch: "ns4" },
  { id: "rm-gs-g2", door: "stronger", place: "gym", part: "lower", name: "Lower focus, with core and upper",
    line: "Mostly legs and hips, with a little for your back and middle.",
    warm: [W("bike-easy-spin-warmup", 6)],
    main: [R("goblet-squat", 3, 10, 90), R("dumbbell-romanian-deadlift", 3, 10, 90), R("gym-leg-curl", 2, 12),
           R("dumbbell-reverse-lunge", 2, "8 each side"), R("dumbbell-row", 2, "10 each side"), R("dead-bug", 2, "8 each side", 45)],
    cool: [W("treadmill-easy-walk-warmup", 3)], stretch: "bh2" },
  { id: "rm-gs-g3", door: "stronger", place: "gym", part: "whole", name: "Whole body, machines",
    line: "Every major group, on machines that are easy to find your way round.",
    warm: [W("treadmill-easy-walk-warmup", 6)],
    main: [R("gym-leg-press", 3, 10, 90), R("gym-chest-press-machine", 3, 10, 90), R("gym-seated-cable-row", 3, 10, 90),
           R("gym-leg-curl", 2, 12), R("gym-lat-pulldown", 2, 10), H("plank", 2, 25)],
    cool: [W("bike-easy-spin-warmup", 3)], stretch: "wb1" },
  { id: "rm-gs-g4", door: "stronger", place: "gym", part: "whole", name: "Whole body, free weights",
    line: "Every major group, with dumbbells and a cable.",
    warm: [W("rower-easy-warmup", 6)],
    main: [R("goblet-squat", 3, 10, 90), R("dumbbell-bench-press", 3, 10, 90), R("dumbbell-romanian-deadlift", 3, 10, 90),
           R("dumbbell-single-arm-row", 3, "10 each side"), R("farmers-carry", 3, "30 metres"), R("gym-cable-woodchop", 2, "10 each side")],
    cool: [W("treadmill-easy-walk-warmup", 3)], stretch: "wb1" },
  { id: "rm-gs-g5", door: "stronger", place: "gym", part: "core", name: "Core and carries",
    line: "Keeping your middle strong: holds, carries and steady control.",
    warm: [W("rower-easy-warmup", 6)],
    main: [R("gym-cable-pallof-press", 3, "10 each side"), R("dead-bug", 3, "8 each side", 45), H("side-plank-modified", 2, 20),
           R("farmers-carry", 3, "30 metres"), R("suitcase-carry", 2, "20 metres each side"), R("bird-dog", 2, "8 each side", 45)],
    cool: [W("treadmill-easy-walk-warmup", 3)], stretch: "bh2" },
  { id: "rm-gs-g6", door: "stronger", place: "gym", part: "whole", name: "Low-energy strength",
    line: "Seated machines, two sets each. Rest as long as you need.",
    warm: [W("bike-easy-spin-warmup", 6)],
    main: [R("gym-chest-press-machine", 2, 10, 90), R("gym-seated-cable-row", 2, 10, 90), R("gym-leg-press", 2, 10, 90),
           R("gym-leg-curl", 2, 10, 90), R("glute-bridge", 2, 10, 90)],
    cool: [], stretch: "wb1" },

  // ── Keep moving · Gym ───────────────────────────────────────────────
  { id: "rm-km-g1", door: "moving", place: "gym", part: "whole", effort: "steady", name: "Cardio and core",
    line: "A steady run on the treadmill, a short go on the ski erg, then your middle.",
    warm: [W("cross-trainer-easy-warmup", 6)],
    main: [C("run-easy-20", 15, "Steady run on the treadmill"), C("gym-ski-erg-intervals", 4, "Ski erg, short and steady"),
           R("gym-cable-pallof-press", 2, "10 each side"), R("dead-bug", 2, "8 each side", 45)],
    cool: [W("treadmill-easy-walk-warmup", 5)], stretch: "l1" },
  { id: "rm-km-g2", door: "moving", place: "gym", part: "whole", effort: "steady", name: "Three machines, steady",
    line: "Ten minutes each on three machines, all at a steady effort.",
    warm: [W("bike-easy-spin-warmup", 5)],
    main: [C("bike-easy-spin-warmup", 10, "Bike, steady"), C("cross-trainer-easy-warmup", 10, "Cross trainer, steady"), C("rowing-machine", 10)],
    cool: [W("treadmill-easy-walk-warmup", 3)], stretch: "wb1" },
  { id: "rm-km-g3", door: "moving", place: "gym", part: "lower", effort: "steady", name: "Incline walk",
    line: "Low impact, no running: walking uphill on the treadmill.",
    warm: [W("treadmill-easy-walk-warmup", 5)],
    main: [C("gym-treadmill-incline-walk", 22), R("bird-dog", 2, "8 each side", 45), H("side-plank-modified", 2, 20)],
    cool: [], stretch: "l1" },
  { id: "rm-km-g4", door: "moving", place: "gym", part: "whole", effort: "hard", name: "Intervals",
    line: "A harder day. Two a week at most, with an easier day between.",
    warm: [W("cross-trainer-easy-warmup", 8)],
    main: [C("gym-cross-trainer-intervals", 12), C("cardio-assault-bike", 6)],
    cool: [W("bike-easy-spin-warmup", 5, "Bike, easy")], stretch: "l1" },
  { id: "rm-km-g5", door: "moving", place: "gym", part: "lower", effort: "steady", name: "Stairs and core",
    line: "The stair climber at a steady effort, then your middle.",
    warm: [W("treadmill-easy-walk-warmup", 5)],
    main: [C("gym-stair-climber-steady", 15), R("gym-cable-pallof-press", 2, "10 each side"), H("plank", 2, 25), R("dead-bug", 2, "8 each side", 45)],
    cool: [W("treadmill-easy-walk-warmup", 3)], stretch: "l2" },
  { id: "rm-km-g6", door: "moving", place: "gym", part: "core", effort: "steady", name: "Bike and core",
    line: "Twenty steady minutes on the bike, then two moves for your middle.",
    warm: [W("bike-easy-spin-warmup", 5)],
    main: [C("bike-easy-spin-warmup", 20, "Bike, steady"), R("dead-bug", 2, "8 each side", 45), R("bird-dog", 2, "8 each side", 45)],
    cool: [], stretch: "wb1" },

  // ── Get stronger · Home (body weight only) ──────────────────────────
  { id: "rm-gs-h1", door: "stronger", place: "home", part: "whole", name: "Whole body at home",
    line: "Every major group, with nothing but you.",
    warm: [W("marching-on-spot", 3), W("squat-to-reach", 2), W("cross-body-knee-drive", 2)],
    main: [R("sit-to-stand", 3, 10), R("press-up-incline", 3, 10), R("glute-bridge", 3, 12), R("reverse-lunge", 2, "8 each side"),
           R("inverted-row-table", 2, 8, 90), H("plank", 2, 25), R("bird-dog", 2, "8 each side", 45)],
    cool: [], stretch: "wb1" },
  { id: "rm-gs-h2", door: "stronger", place: "home", part: "upper", name: "Upper focus at home",
    line: "Pushing, pulling and your shoulders, with a little for your legs.",
    warm: [W("marching-on-spot", 3), W("sport-warmup-upper-body", 4)],
    main: [R("press-up-incline", 3, 10), R("inverted-row-table", 3, 8, 90), R("scapular-pushup", 2, 10), R("prone-ytw", 2, 8),
           R("plank-shoulder-tap", 2, "8 each side"), R("glute-bridge", 2, 12)],
    cool: [], stretch: "ns4" },
  { id: "rm-gs-h3", door: "stronger", place: "home", part: "lower", name: "Lower focus at home",
    line: "Legs and hips, with a little pushing for your upper body.",
    warm: [W("marching-on-spot", 3), W("step-touch", 2), W("squat-to-reach", 2)],
    main: [R("reverse-lunge", 3, "8 each side"), R("hip-thrust-bodyweight", 3, 12), H("isometric-wall-sit", 2, 25),
           R("single-leg-calf-raise", 2, "10 each side"), R("side-lying-hip-abduction", 2, "12 each side"), R("push-up", 2, 8)],
    cool: [], stretch: "l2" },
  { id: "rm-gs-h4", door: "stronger", place: "home", part: "core", name: "Core at home",
    line: "Your middle: slow, steady control, no sit-ups.",
    warm: [W("marching-on-spot", 3)],
    main: [R("dead-bug", 3, "8 each side", 45), R("bird-dog", 3, "8 each side", 45), H("side-plank-modified", 2, 20),
           R("mcgill-curl-up", 2, 8, 45), H("bear-hold", 2, 20), R("glute-bridge-march", 2, "8 each side", 45)],
    cool: [], stretch: "bh2" },
  { id: "rm-gs-h5", door: "stronger", place: "home", part: "whole", name: "Strength without the floor",
    line: "Standing and a chair, nothing on the floor.",
    warm: [W("chair-supported-march", 3)],
    main: [R("sit-to-stand", 3, 10), R("seated-wall-press", 3, 10), R("seated-self-resisted-row", 3, 10),
           R("chair-supported-calf-raise", 2, 12), R("chair-supported-hip-abduction", 2, "10 each side"), R("seated-knee-lift", 2, "8 each side")],
    cool: [], stretch: "ns4", noFloor: true },
  { id: "rm-gs-h6", door: "stronger", place: "home", part: "whole", name: "Ten-minute strength",
    line: "Four moves, twice through. Short enough for a busy day.",
    warm: [W("marching-on-spot", 1)],
    main: [R("sit-to-stand", 2, 12, 30), R("press-up-incline", 2, 10, 30), R("glute-bridge", 2, 12, 30), H("plank", 2, 20, 30)],
    cool: [], stretch: null, fixed: 10 },

  // ── Keep moving · Home (body weight only, quiet by default) ─────────
  { id: "rm-km-h1", door: "moving", place: "home", part: "whole", effort: "steady", name: "Quiet cardio",
    line: "No jumping: easy on your knees and your neighbours.",
    warm: [W("marching-on-spot", 3)],
    main: [C("step-jacks", 3), C("skater-steps", 3), C("cross-body-knee-drive", 3), C("squat-to-reach", 3), C("shadow-boxing", 3), C("step-back-burpee", 3)],
    cool: [], stretch: "wb1" },
  { id: "rm-km-h2", door: "moving", place: "home", part: "core", effort: "steady", name: "Cardio and core at home",
    line: "Shadow boxing and steps, then your middle, then once more.",
    warm: [W("marching-on-spot", 3)],
    main: [C("shadow-boxing", 3), C("step-jacks", 2), H("mountain-climbers", 3, 20, 40), R("dead-bug", 2, "8 each side", 45), H("plank", 2, 20),
           C("shadow-boxing", 3, "Shadow Boxing, once more"), C("step-jacks", 2, "Step Jacks, once more")],
    cool: [], stretch: "bh2" },
  { id: "rm-km-h3", door: "moving", place: "home", part: "whole", effort: "steady", name: "Dance",
    line: "Your own music, moving however feels good. Easy to steady.",
    warm: [W("step-touch", 3)],
    main: [C("dance-freestyle", 20)],
    cool: [], stretch: "wb1" },
  { id: "rm-km-h4", door: "moving", place: "home", part: "lower", effort: "steady", name: "Stairs",
    line: "If you have stairs: up and down at a steady effort, holding the rail.",
    warm: [W("marching-on-spot", 3)],
    main: [C("stair-climbing", 12)],
    cool: [], stretch: "l3" },
  { id: "rm-km-h5", door: "moving", place: "home", part: "whole", effort: "hard", name: "Cardio with jumping",
    line: "Jumps and fast feet. A harder day, and not for a sore knee or ankle.",
    warm: [W("marching-on-spot", 3), W("high-knees", 1)],
    main: [C("jumping-jacks", 3), C("squat-jumps", 3), C("high-knees", 3, "High Knees, again"), C("burpee", 3)],
    cool: [W("marching-on-spot", 3, "Marching, to slow down")], stretch: "l2" },
  { id: "rm-km-h6", door: "moving", place: "home", part: "upper", effort: "steady", name: "Seated cardio",
    line: "All in a chair: arms and marching, three rounds.",
    warm: [W("seated-marching-cardio", 3)],
    main: [C("seated-punches", 3), C("seated-arm-cycling", 3), C("seated-arm-intervals", 3), C("seated-marching-cardio", 3, "Seated Marching, faster")],
    cool: [], stretch: "ns1", noFloor: true },
]);

const BY = new Map(READY_SESSIONS.map(s => [s.id, s]));
export const readyById = id => BY.get(id) || null;

/** P-46 S4. Free's six, by place (spec §5). */
export const FREE_READY = Object.freeze({
  home: Object.freeze(["rm-gs-h1", "rm-gs-h5", "rm-gs-h6", "rm-km-h1", "rm-km-h2", "rm-km-h6"]),
  gym:  Object.freeze(["rm-gs-g3", "rm-gs-g6", "rm-km-g2", "rm-km-g3", "rm-km-h2", "rm-km-h6"]),
});
export const freeReady = place => (FREE_READY[place === "gym" ? "gym" : "home"]).map(readyById).filter(Boolean);

/** The sessions behind a door, for a place; the part chosen first, the rest after. */
export function readyFor(door, place, part = null) {
  const all = READY_SESSIONS.filter(s => s.door === door && s.place === place);
  if (!part) return all;
  return [...all.filter(s => s.part === part), ...all.filter(s => s.part !== part)];
}

const each = reps => /each side/.test(String(reps));
/** Seconds of work in one set, roughly: 4 s a rep (2 up, 2 down), both sides counted; a carry about 40 s. */
function setSecs(st) {
  if (st.secs) return st.secs * (each(st.reps) ? 2 : 1);
  const r = String(st.reps || "");
  if (/metres/.test(r)) return 40 * (each(r) ? 2 : 1);
  const n = parseInt(r, 10) || 10;
  return n * 4 * (each(r) ? 2 : 1);
}
function stepSecs(st) {
  if (st.mins) return st.mins * 60;
  return st.sets * setSecs(st) + Math.max(0, st.sets - 1) * (st.rest || 60) + 30;   // + moving between
}

/** The words for a step's amount, as the plan screen says it. */
export function doseOf(st) {
  if (st.mins) return null;
  if (st.secs) return `${st.sets} × ${st.secs} seconds`;
  return `${st.sets} × ${st.reps}`;
}

/** The routine's own steps, as the Stretch door plays it. */
function stretchSteps(id) {
  const r = ROUTINES.find(x => x.id === id);
  return r ? r.steps.map(s => ({ ...s })) : [];
}

/**
 * One session at a size, as a practice the plan screen and the one player
 * take (path.js prog and startPractice). Rules (draft Part 2):
 *   short: warm-up 5 min; strength, the first four moves at 2 sets; cardio
 *          at about 0.6 of its minutes; no easy step before the stretch.
 *   usual: as written.
 *   long:  warm-up 10 min; strength one set more (3 at most), then a steady
 *          cardio piece (gym: the rower, 10 min; home: the quiet cardio
 *          circuit, 10 min); cardio at about 1.3 of its minutes.
 * The minutes said are worked out from the steps (about 4 s a rep, the
 * rests, 30 s between moves), rounded to 5.
 * A session marked fixed (the ten-minute one) has one size.
 */
export function readySession(s, size = "usual") {
  if (!s) return null;
  if (s.fixed) size = "usual";
  const warm = s.warm.map((w, i) => i === 0 && size !== "usual" ? { ...w, mins: size === "short" ? Math.min(w.mins, 5) : Math.max(w.mins, 10) } : { ...w });
  let main = s.main.map(m => ({ ...m }));
  if (size === "short") {
    const strength = main.filter(m => m.sets);
    const keep = new Set(strength.slice(0, 4));
    main = main.filter(m => !m.sets || keep.has(m)).map(m => m.sets ? { ...m, sets: Math.min(m.sets, 2) } : { ...m, mins: Math.max(2, Math.round(m.mins * 0.6)) });
  } else if (size === "long") {
    main = main.map(m => m.sets ? { ...m, sets: Math.min(3, m.sets + 1) } : { ...m, mins: Math.round(m.mins * 1.3) });
    if (s.door === "stronger") main.push(s.place === "gym" ? C("rowing-machine", 10, "Rower, steady") : C("quiet-cardio-circuit", 10));
  }
  const cool = size === "short" ? [] : s.cool.map(c => ({ ...c }));
  const routine = s.stretch;
  const steps = [...warm, ...main, ...cool, ...(routine ? stretchSteps(routine) : [])]
    .map(st => ({ ...st, dose: doseOf(st) }));
  const secs = steps.reduce((n, st) => n + stepSecs(st), 0);
  return {
    id: s.id, name: s.name, line: s.line, place: s.place, part: s.part, size,
    minutes: Math.max(5, Math.round(secs / 300) * 5),
    sessionType: s.door === "moving" ? "cardio" : (s.part === "whole" ? "full" : s.part),
    ...(s.effort ? { effort: s.effort } : {}),
    ready: true, steps,
  };
}
