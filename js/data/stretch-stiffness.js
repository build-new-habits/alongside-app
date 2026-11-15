/**
 * js/data/stretch-stiffness.js
 * 15 Nov 2026 v1
 *
 * P-32 STRETCH-FOR-STIFFNESS (Graeme, 15 Nov: mock-up v2, "The full range";
 * spec docs/specs/alongside_stretch-for-stiffness_15nov2026_v1.md).
 *
 * Inside the Stretch door, after the area, the person says how stiff it
 * feels and, if they like, where in particular. Plain rules:
 *
 *   STIFFNESS        Fine, just a stretch · A little · Quite · Very stiff
 *   spotsFor(area)   the finer spots for an area, each with its library
 *                    areas and its stretch zones (none for Whole body)
 *   routinesForSpots(list, spots)
 *                    routines that work a ticked spot first, each tagged
 *                    "Works your hips"; the rest after, in their order
 *   stiffPractice(practice, area, level)
 *                    Very stiff: a two-minute gentle start for the area
 *                    (unless the routine holds it already), shorter holds
 *   EASE_IN          the line on every Stretch routine before Start
 *   addToHome(practice)  Put this on Home: the routine as a list in My
 *                    exercises, On Home any time (P-31)
 *
 * The boundary (spec section 1): a sore area never sets anything here
 * (W5-14 stands), It hurts never leads to a stretch, no treatment words
 * (BOUNDARY_WORDS, checked), nothing new is kept. Free never sees it.
 */

import { store } from "../store.js";
import { EXERCISES } from "./exercises/index.js";
import { setOnHome } from "./little-and-often.js";

const BY_ID = new Map(EXERCISES.map(e => [e.id, e]));

/** How does it feel today? "fine" is chosen to start. */
export const STIFFNESS = Object.freeze([
  { id: "fine", label: "Fine, just a stretch" },
  { id: "little", label: "A little stiff" },
  { id: "quite", label: "Quite stiff" },
  { id: "very", label: "Very stiff" },
]);
export const isStiffness = v => STIFFNESS.some(s => s.id === v);

/** Anywhere in particular? Per Stretch area. works: how a row says it. zones: STRETCH_ZONES ids for a fresh one. */
const S = (id, label, works, areas, zones) => Object.freeze({ id, label, works, areas, zones });
const SPOTS = Object.freeze({
  "whole": [],
  "neck-shoulders": [
    S("shoulders", "Shoulders", "your shoulders", ["shoulder", "rotator-cuff"], ["neck-shoulders"]),
    S("upper-back", "Upper back", "your upper back", ["upper-back", "thoracic"], ["upper-back"]),
    S("chest", "Chest", "your chest", ["chest-pecs"], ["chest"]),
  ],
  "back-hips": [
    S("lower-back", "Lower back", "your lower back", ["lower-back", "spine"], ["lower-back"]),
    S("hips", "Hips", "your hips", ["hip", "hip-flexor", "piriformis"], ["hips"]),
    S("glutes", "Glutes", "your glutes", ["glutes", "piriformis"], ["glutes"]),
    S("upper-back", "Upper back", "your upper back", ["upper-back", "thoracic"], ["upper-back"]),
  ],
  "legs": [
    S("hamstrings", "Hamstrings", "your hamstrings", ["hamstring"], ["hamstrings"]),
    S("front-thigh", "Front of the thigh", "the front of your thigh", ["quadriceps", "hip-flexor"], ["quads"]),
    S("outside-thigh", "Outside of the thigh", "the outside of your thigh", ["it-band"], ["glutes"]),
    S("calves", "Calves", "your calves", ["calves", "achilles", "ankle-foot"], ["calves-ankles"]),
  ],
});

export function spotsFor(area) { return SPOTS[area] || []; }

/** The ticked spots that are real for this area, in the area's order. */
export function cleanSpots(area, spots) {
  const want = new Set(Array.isArray(spots) ? spots : []);
  return spotsFor(area).filter(s => want.has(s.id));
}

/** "your hips", "your hips and your glutes". */
export function worksPhrase(spots) {
  const w = spots.map(s => s.works);
  return w.length <= 1 ? (w[0] || "") : `${w.slice(0, -1).join(", ")} and ${w[w.length - 1]}`;
}

/** The spots a routine works, by the library areas of its movements. */
export function spotsWorked(routine, spots) {
  const areas = new Set((routine.steps || []).flatMap(s => BY_ID.get(s.id)?.affectsAreas || []));
  return spots.filter(sp => sp.areas.some(a => areas.has(a)));
}

/**
 * Routines with the ones that work a ticked spot first, each with tag
 * "Works your hips"; the others after, in their own order.
 */
export function routinesForSpots(list, area, spotIds) {
  const spots = cleanSpots(area, spotIds);
  if (!spots.length) return list.map(r => ({ routine: r, tag: "" }));
  const tagged = list.map(r => { const hit = spotsWorked(r, spots); return { routine: r, tag: hit.length ? `Works ${worksPhrase(hit)}` : "" }; });
  return [...tagged.filter(x => x.tag), ...tagged.filter(x => !x.tag)];
}

/** Stretch zones for A fresh one for me: the ticked spots', or null for the area's own. */
export function zonesForSpots(area, spotIds) {
  const spots = cleanSpots(area, spotIds);
  return spots.length ? [...new Set(spots.flatMap(s => s.zones))] : null;
}

/** Very stiff: a two-minute gentle start, standing or seated, per area. */
export const GENTLE_START = Object.freeze({
  "whole": "chair-supported-march",
  "legs": "chair-supported-march",
  "back-hips": "hip-circles-standing",
  "neck-shoulders": "seated-shoulder-rolls-warmup",
});
export const GENTLE_MINS = 2;
export const SHORTER_HOLDS = "Shorter holds: about 20 to 30 seconds, then again";

/** The routine as played at this stiffness. Only Very stiff changes it. */
export function stiffPractice(practice, area, level) {
  if (level !== "very" || !practice) return practice;
  const start = GENTLE_START[area] || GENTLE_START.whole;
  const has = practice.steps.some(s => s.id === start);
  const steps = [
    ...(has || !BY_ID.has(start) ? [] : [{ id: start, mins: GENTLE_MINS, note: "Gently, to warm up" }]),
    ...practice.steps.map(s => s.id === start ? s : { ...s, note: s.note ? `${s.note}. ${SHORTER_HOLDS}` : SHORTER_HOLDS }),
  ];
  const added = steps.length - practice.steps.length;
  return { ...practice, steps, minutes: (practice.minutes || 0) + added * GENTLE_MINS, stiff: "very" };
}

/** The minutes a routine row shows at this stiffness. */
export function minutesAt(routine, level) {
  if (level !== "very") return routine.minutes;
  const start = GENTLE_START[routine.area] || GENTLE_START.whole;
  return routine.minutes + (routine.steps.some(s => s.id === start) ? 0 : GENTLE_MINS);
}

export const EASE_IN = "Ease into each stretch until you feel a gentle pull, about 3 out of 10. Breathe out slowly as you hold. Stop if it pinches, hurts or feels electric.";

/** The coach's line under How does it feel today?, or "". */
export function stiffLine(level) {
  if (level === "quite") return "Take each one slowly, and ease off if it tightens up.";
  if (level === "very") return "Very stiff usually eases as you move. Each of these starts with two minutes of gentle movement, and the holds are shorter. It should feel easier as you go, not worse.";
  return "";
}

export const HURTS = Object.freeze({
  row: "It hurts, rather than feels stiff",
  rowSub: "Stretching shouldn’t hurt. What to do instead",
  head: "It hurts",
  line: "Stretching shouldn’t hurt. A stiff area usually feels better as you move; one that hurts needs something different.",
  what: "Tell the check-in how sore it is. The app then leaves out the movements likely to make it worse, and if it’s bad, it offers something gentler or a rest.",
  button: "Tell the check-in",
  other: "Stretch somewhere else",
  otherSub: "Back to where you want to stretch",
  note: "If it’s getting worse or still there after a few days, or you have numbness, tingling or pain spreading down an arm or leg, stop and speak to a GP, physio or other medical professional. For something sudden or severe, call NHS 111, or 999 in an emergency.",
});

/** At the end: the question and what each answer says. */
export const AFTER = Object.freeze({
  legend: "Compared with before you started",
  options: [["Easier", "easier"], ["About the same", "same"], ["Worse", "worse"]],
  easier: "Glad it helped. A short stretch a few times a day often does more than one long one.",
  same: "That’s fine. A short one later in the day is another option.",
  worse: "Leave stretching that area for today. If it hurts, tell the check-in how sore it is, and the app will work around it.",
  home: "Put this on Home",
  homeSub: "Under Little and often, any time",
});
export const afterQuestion = areaLabel => `How do your ${String(areaLabel || "muscles").toLowerCase()} feel now?`;

/** Words this feature never uses (spec section 1, line 3). */
export const BOUNDARY_WORDS = ["treat", "relieve", "fix", "cure", "heal", "recover", "rehab", "injur", "therapy", "pain relief"];

/** Every word this feature shows, for the boundary check. */
export function allWords() {
  return [...STIFFNESS.map(s => s.label), ...Object.values(SPOTS).flat().flatMap(s => [s.label, s.works]),
    EASE_IN, stiffLine("quite"), stiffLine("very"), SHORTER_HOLDS, "Gently, to warm up",
    ...Object.values(HURTS), AFTER.legend, ...AFTER.options.map(o => o[0]), AFTER.easier, AFTER.same, AFTER.worse,
    AFTER.home, AFTER.homeSub, afterQuestion("back and hips")];
}

/**
 * Put this on Home: the routine as a list in My exercises (its own name;
 * each movement for its seconds, each side where the step says so), then
 * On Home, any time. A list of that name already there is put on Home as
 * it is. Returns the list's name, or null.
 */
export function addToHome(practice) {
  const name = String(practice?.name || "").replace(/[<>]/g, "").trim().slice(0, 40);
  if (!name || !practice.steps?.length) return null;
  const all = store.get("prescribedExercises") || [];
  if (!all.some(e => e && e.group === name)) {
    const at = new Date().toISOString();
    const entries = practice.steps.map((s, n) => {
      const e = BY_ID.get(s.id);
      if (!e) return null;
      const each = /each side/i.test(s.note || "");
      const secs = Math.max(10, Math.round(((Number(s.mins) || 1) * 60) / (each ? 2 : 1)));
      return { id: `px-${Date.now()}-${n}`, exerciseId: e.id, name: e.name.replace(/[<>]/g, "").slice(0, 60),
               description: "", frequency: "", active: true, completedToday: false, completedAt: null, addedAt: at,
               sets: 1, reps: `${secs} seconds${each ? " each side" : ""}`, group: name };
    }).filter(Boolean);
    if (!entries.length) return null;
    store.set("prescribedExercises", [...all, ...entries]);
  }
  setOnHome(name, "any");
  return name;
}
