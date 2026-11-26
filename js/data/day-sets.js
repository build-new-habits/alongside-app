/**
 * js/data/day-sets.js
 * 26 Nov 2026 v1
 *
 * P-37 S2 MORNING-EVENING (mock-up v1 approved by Graeme, 26 Nov: "That
 * mock up was good"). The coach's fresh sets, made new each time from the
 * library by plain rules (no AI):
 *
 *   A morning set   to wake you up: gentle, then a little bigger. Moves
 *                   from Move to feel better's "wake" pool, those for the
 *                   area first, put in order small to bigger, ending with
 *                   something that raises the heart a little.
 *   An evening set  to calm down, always three parts: tense and let go
 *                   (progressive muscle relaxation), slow and flowing (tai
 *                   chi, qigong, slow stretches), then still (natural
 *                   breathing, never a held breath). No countdown in the
 *                   player. Never a claim about sleep (MHRA scope).
 *
 *   daySet({ part, area, mins, ... })  the set, shaped as a programme
 *   keepDaySet(practice)               Keep this: a list in My exercises,
 *                                      On Home for Mornings or Evenings
 *                                      (taking turns, the default)
 *
 * Today's sore areas rule moves out, as everywhere (the builder's own
 * filterByConditions); a Not again never comes back.
 */

import { store } from "../store.js";
import { EXERCISES, filterByConditions } from "./exercises/index.js";
import { PATH_MOVEMENTS } from "./exercises/path_movements.js";
import { DAY_SET_AREAS, DAY_SET_MINS } from "./week-shape-model.js";
import { setOnHome } from "./little-and-often.js";

const LIBRARY = [...EXERCISES, ...PATH_MOVEMENTS];
const BY_ID = new Map(LIBRARY.map(e => [e.id, e]));

export { DAY_SET_AREAS, DAY_SET_MINS };

export const AREA_LABEL = Object.freeze({ hips: "Hips", "lower-back": "Lower back", shoulders: "Shoulders", all: "All over" });
const AREA_WORDS = { hips: "hips", "lower-back": "lower back", shoulders: "shoulders", all: "all over" };
const AREA_TAGS = {
  hips: ["hip", "hip-flexor", "glutes", "adductors", "piriformis"],
  "lower-back": ["lower-back", "spine"],
  shoulders: ["shoulder", "upper-back", "thoracic", "rotator-cuff"],
  all: [],
};

/** Every word the sets show (for the gates' boundary check). */
export const WORDS = Object.freeze({
  morning: { title: "A morning set", line: "To wake you up: gentle, then a little bigger.", where: "Where are you stiff?", home: "A fresh morning set", homeSub: "The coach makes one, to wake you up" },
  evening: { title: "An evening set", line: "To calm down: tense and let go, then slow and flowing.", where: "Where do you hold it?", home: "A fresh evening set", homeSub: "The coach makes one, to help you calm down" },
  long: "How long?",
  keep: "Keep this",
  again: "A different one",
  parts: { tense: "Tense and let go", flow: "Slow and flowing", still: "Still" },
  finish: "To finish",
  breathing: "natural breathing",
});

// Never in a set: held or counted breathing, long practices and whole flows.
const HELD = /box-breathing|four-seven-eight|energising-breath|alternate-nostril|coherent-breathing|physiological-sigh/;
const LONG = e => (e.contentType === "practice" && (e.duration || 0) >= 600) || /^(yoga-flow|pilates-sequence)$/.test(e.movementPattern || "");
// Morning: the last move raises the heart a little.
const FINISHERS = ["chair-supported-march", "seated-marching-cardio", "gm-reach-and-rise", "qg-tapping"];
// Evening's three parts.
const TENSE = ["progressive-muscle-relaxation"];
const STILL = ["breath-awareness-meditation", "extended-exhale-breathing", "yoga-corpse-pose", "qg-closing-breath", "diaphragmatic-breathing"];
const STILL_RE = /^(breath|breath-awareness|body-scan|grounding)$/;
const NOT_EVENING = new Set(["qg-heel-drops", "qg-tapping", "yoga-sun-salutation-b"]);
const POS_ORDER = { floor: 0, seated: 1, any: 2, standing: 3 };
const FORM_ORDER = e => /opening/.test(e.id) ? 0 : /closing/.test(e.id) ? 2 : 1;

const half = x => Math.round(x * 2) / 2;
const worksArea = (e, area) => area === "all" || (e.affectsAreas || []).some(a => AREA_TAGS[area].includes(a));
function shuffled(list, rng) { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
/** n moves, those for the area first (in a fresh order each time), then the rest. */
function pick(pool, area, n, rng) {
  const mine = shuffled(pool.filter(e => worksArea(e, area)), rng);
  const rest = shuffled(pool.filter(e => !worksArea(e, area)), rng);
  return [...mine, ...rest].slice(0, n);
}
/** Minutes shared across moves: each to the half minute, the last takes what is left. */
function share(total, n) {
  const each = Math.max(1, Math.floor((total / n) * 2) / 2);
  const out = Array(n).fill(each);
  out[n - 1] = Math.max(1, half(total - each * (n - 1)));
  return out;
}

function usable({ never = new Set(), avoidFor = [] } = {}) {
  let pool = LIBRARY.filter(e => !never.has(e.id) && !HELD.test(e.id) && (!LONG(e) || TENSE.includes(e.id)));
  if (avoidFor.length) pool = filterByConditions(pool, avoidFor).safe;
  return pool;
}

export function setName(part, area) {
  return `${part === "evening" ? "Evening" : "Morning"}: ${AREA_WORDS[area] || "all over"}`;
}

function morningSet({ area, mins, pool, rng }) {
  const finishers = FINISHERS.map(id => pool.find(e => e.id === id)).filter(Boolean);
  const finish = finishers[0] && rng() < 0.5 ? finishers[0] : finishers[Math.floor(rng() * finishers.length)] || null;
  // Small to bigger: a gentle opener (a joint turned or the spine moved), then a little bigger
  // (up to energy 3; 4 in fifteen minutes), then the finisher.
  const wake = pool.filter(e => (e.doors || []).includes("feel") && (e.feelings || []).includes("wake")
    && (e.energyRequired || 1) <= (mins >= 15 ? 4 : 3) && !STILL_RE.test(e.movementPattern || "")
    && !["yoga-corpse-pose", "qg-closing-breath", "yoga-mountain-pose"].includes(e.id) && !FINISHERS.includes(e.id));
  const n = mins <= 5 ? 3 : mins <= 10 ? 4 : 5;
  const opener = pick(wake.filter(e => (e.energyRequired || 1) <= 2), area, 1, rng)[0];
  if (!opener) return null;
  const moves = pick(wake.filter(e => e.id !== opener.id), area, (finish ? n - 1 : n) - 1, rng)
    .sort((a, b) => (a.energyRequired || 1) - (b.energyRequired || 1) || (POS_ORDER[a.position] ?? 2) - (POS_ORDER[b.position] ?? 2));
  if (!moves.length) return null;
  const all = [opener, ...moves, ...(finish ? [finish] : [])];
  const len = share(mins, all.length);
  return all.map((e, i) => ({ id: e.id, mins: len[i], note: finish && i === all.length - 1 ? WORDS.finish : "" }));
}

function eveningSet({ area, mins, pool, rng }) {
  const tense = TENSE.map(id => pool.find(e => e.id === id)).filter(Boolean)[0] || null;
  const stills = STILL.map(id => pool.find(e => e.id === id)).filter(Boolean);
  const still = stills.length ? stills[Math.floor(rng() * stills.length)] : null;
  const flowPool = pool.filter(e => (e.doors || []).includes("feel") && ((e.feelings || []).includes("sleep") || (e.feelings || []).includes("calm"))
    && !STILL_RE.test(e.movementPattern || "") && !NOT_EVENING.has(e.id) && !TENSE.includes(e.id) && !STILL.includes(e.id)
    && (e.energyRequired || 1) <= 2);
  const nFlow = mins <= 5 ? 1 : mins <= 10 ? 2 : 3;
  // At least one tai chi or qigong move, then the rest; those for the area first, fresh each time.
  // In order: standing (an opening first, a closing last), then seated, then the floor, towards still.
  const isForm = e => e.style === "taichi" || e.style === "qigong";
  const form = pick(flowPool.filter(isForm), area, 1, rng);
  const flowing = [...form, ...pick(flowPool.filter(e => !form.includes(e)), area, nFlow - form.length, rng)]
    .sort((a, b) => (POS_ORDER[b.position] ?? 2) - (POS_ORDER[a.position] ?? 2) || FORM_ORDER(a) - FORM_ORDER(b));
  if (!tense || !still || !flowing.length) return null;
  const [t, f, s] = mins <= 5 ? [2, 2, 1] : mins <= 10 ? [4, 4, 2] : [5, 7, 3];
  const fl = share(f, flowing.length);
  return [
    { id: tense.id, mins: t, part: "tense", note: "lying or seated" },
    ...flowing.map((e, i) => ({ id: e.id, mins: fl[i], part: i === 0 ? "flow" : null, note: e.style === "taichi" ? "tai chi" : e.style === "qigong" ? "qigong" : "" })),
    { id: still.id, mins: s, part: "still", note: WORDS.breathing },
  ];
}

/**
 * The coach's set for this part of the day, shaped as a programme the
 * proposal screen shows: { id, name, minutes, dayset, area, steps }.
 * null when the library cannot fill it (today's sore areas, Not agains).
 */
export function daySet({ part = "morning", area = "all", mins = 10, never = new Set(), avoidFor = [], rng = Math.random } = {}) {
  const a = DAY_SET_AREAS.includes(area) ? area : "all";
  const m = DAY_SET_MINS.includes(Number(mins)) ? Number(mins) : 10;
  const pool = usable({ never, avoidFor });
  const steps = part === "evening" ? eveningSet({ area: a, mins: m, pool, rng }) : morningSet({ area: a, mins: m, pool, rng });
  if (!steps) return null;
  return { id: `dayset-${part}`, name: WORDS[part === "evening" ? "evening" : "morning"].title, minutes: m, style: null, position: null,
           dayset: part === "evening" ? "evening" : "morning", area: a, slowLine: part === "evening", steps };
}

/** What the person last chose, or the start (all over, 10 minutes). */
export function lastChoice(part) {
  const c = (store.get("daySetChoices") || {})[part];
  return { area: c?.area || "all", mins: c?.mins || 10 };
}
export function rememberChoice(part, area, mins) {
  const all = { ...(store.get("daySetChoices") || {}) };
  all[part] = { area, mins: Number(mins) };
  store.set("daySetChoices", all);
}

/**
 * Keep this: the set (swaps and all) as a list in My exercises, named by
 * its area ("Morning: hips"; a number added if that name is taken), On
 * Home for Mornings or Evenings, taking turns. Returns the list's name.
 */
export function keepDaySet(practice) {
  if (!practice?.dayset || !practice.steps?.length) return null;
  const all = store.get("prescribedExercises") || [];
  const base = setName(practice.dayset, practice.area);
  let name = base, k = 2;
  while (all.some(e => e && e.group === name)) name = `${base} (${k++})`;
  const at = new Date().toISOString();
  const entries = practice.steps.filter(s => !(s.out || []).length).map((s, n) => {
    const e = BY_ID.get(s.id);
    if (!e) return null;
    const secs = Math.max(10, Math.round((Number(s.mins) || 1) * 60));
    return { id: `px-${Date.now()}-${n}`, exerciseId: e.id, name: e.name.replace(/[<>]/g, "").slice(0, 60),
             description: "", frequency: "", active: true, completedToday: false, completedAt: null, addedAt: at,
             sets: 1, reps: `${secs} seconds`, group: name };
  }).filter(Boolean);
  if (!entries.length) return null;
  store.set("prescribedExercises", [...all, ...entries]);
  setOnHome(name, practice.dayset);
  return name;
}
