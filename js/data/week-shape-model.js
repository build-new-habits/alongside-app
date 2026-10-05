/**
 * js/data/week-shape-model.js
 * 05 Oct 2026 v2
 *
 * v2 - D-7 PLAN-IMPORT. A day plan may be the person's own list: own is a
 *   group of My exercises (a plan day, "Session A") or "all". That day is
 *   played as written; its mix is not used.
 *
 * D-6 WEEK-SHAPE. The shape of a person's week, as data: what each day is
 * for. No store, no DOM: store.js validates with sanitizeWeekShape() and
 * everything else reads through js/data/week-shape.js.
 *
 * Graeme, 05 Oct: "I would like to go to the gym every day this week, but I
 * don't want to do everything ... Monday upper body and some gentle trunk,
 * mostly upper ... then the coach can create whatever it does based on
 * that." And later: intensity on the day; favourites (his cable Pallof
 * press); not doing only one area all week.
 *
 * ── THE SHAPE ──────────────────────────────────────────────────────────
 *
 *   weekShape = {
 *     templates: { [id]: {
 *       id, name,                         "Upper day"
 *       mix: [{ focus, level }],          up to four; level 0 a little,
 *                                         1 some, 2 mostly
 *       intensity: "gentle"|"steady"|"moderate",
 *       mins: 10|20|30|40|50|60,
 *       place: "home"|"gym"|"outside",
 *       extras: ["sauna", "hydro-pool", ...],   after the session, if wanted
 *       favourites: [exerciseId, ...]     in, when they fit
 *       own: groupName | "all" | null      D-7: the day is My exercises,
 *                                          played as written
 *     } },
 *     days: { mon..sun: templateId | "rest" | null },
 *     setAt: ISO date the week was first set,
 *     dismissed: { [gapKey]: "YYYY-MM-DD" }  a balance line left for that week
 *   }
 *
 * The week is a PATTERN, not a calendar: it repeats until changed. It
 * keeps no score. A day not done is simply not done.
 */

export const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
export const DAY_NAMES = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };
export const DAY_SHORT = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };

/**
 * What a day can hold. `type` is the session type the builder makes for it;
 * balance has no session type of its own, so it draws from BALANCE_IDS.
 * `group` is what the week's balance line looks at.
 */
export const FOCUSES = [
  { id: "upper",    label: "Upper body",     type: "upper",    group: "upper",   kind: "amber",  icon: "strength" },
  { id: "legs",     label: "Legs",           type: "lower",    group: "legs",    kind: "amber",  icon: "walk" },
  { id: "glutes",   label: "Glutes",         type: "glute",    group: "legs",    kind: "amber",  icon: "run" },
  { id: "full",     label: "Full body",      type: "full",     group: "full",    kind: "amber",  icon: "strength" },
  { id: "trunk",    label: "Core and trunk", type: "core",     group: "trunk",   kind: "amber",  icon: "instep" },
  { id: "balance",  label: "Balance",        type: null,       group: "balance", kind: "violet", icon: "mobility" },
  { id: "mobility", label: "Mobility",       type: "mobility", group: "stretch", kind: "violet", icon: "mobility" },
  { id: "stretch",  label: "Stretching",     type: "stretch",  group: "stretch", kind: "violet", icon: "yoga" },
  { id: "cardio",   label: "Cardio",         type: "cardio",   group: "cardio",  kind: "blue",   icon: "run" },
];
export const focusById = id => FOCUSES.find(f => f.id === id) || null;

export const LEVELS = ["A little", "Some", "Mostly"];
/** How much of the main part each level takes, relative to the others. */
export const LEVEL_WEIGHT = [1, 2, 3];

export const INTENSITIES = [
  { id: "gentle",   label: "Gentle",   line: "Easy all the way. You could chat throughout." },
  { id: "steady",   label: "Steady",   line: "Working, but you could still talk in short sentences." },
  { id: "moderate", label: "Moderate", line: "The last reps take effort: two or three left in you." },
];
export const intensityById = id => INTENSITIES.find(i => i.id === id) || INTENSITIES[1];

export const LENGTHS = [10, 20, 30, 40, 50, 60];
export const PLACES = [
  { id: "home", label: "Home" }, { id: "gym", label: "Gym" }, { id: "outside", label: "Outside" },
];
export const EXTRAS = [
  { id: "sauna",      label: "Sauna" },
  { id: "hydro-pool", label: "Hydro pool" },
  { id: "steam-room", label: "Steam room" },
  { id: "swim",       label: "A swim" },
  { id: "walk",       label: "A walk" },
];

/**
 * Balance work for a balance focus, easiest first. Standing or floor,
 * mostly no kit; the two with kit are kept only where that kit is.
 */
export const BALANCE_IDS = [
  "balance-single-leg-hold", "single-leg-calf-raise", "standing-hip-abduction",
  "y-balance-reach", "yoga-tree-pose", "single-leg-deadlift-rehab",
  "rehab-ankle-proprioception", "step-down-eccentric", "dumbbell-single-leg-deadlift",
  "gym-balance-board-hold",
];

const MAX_MIX = 4;
const MAX_TEMPLATES = 14;
const MAX_FAVOURITES = 6;
const NAME_MAX = 40;

const _str = (s, n) => (typeof s === "string" ? s.replace(/[<>]/g, "").trim().slice(0, n) : "");
const _id = s => (typeof s === "string" && /^[a-z0-9-]{1,40}$/.test(s) ? s : null);

/** A template made safe: unknown values dropped, missing ones defaulted. */
export function sanitizeTemplate(t, id) {
  if (!t || typeof t !== "object") return null;
  const tid = _id(t.id) || _id(id);
  if (!tid) return null;
  const seen = new Set();
  const mix = (Array.isArray(t.mix) ? t.mix : [])
    .filter(m => m && focusById(m.focus) && !seen.has(m.focus) && seen.add(m.focus))
    .map(m => ({ focus: m.focus, level: [0, 1, 2].includes(m.level) ? m.level : 1 }))
    .slice(0, MAX_MIX);
  return {
    id: tid,
    name: _str(t.name, NAME_MAX) || "My day",
    mix: mix.length ? mix : [{ focus: "full", level: 2 }],
    intensity: INTENSITIES.some(i => i.id === t.intensity) ? t.intensity : "steady",
    mins: LENGTHS.includes(t.mins) ? t.mins : 30,
    place: PLACES.some(p => p.id === t.place) ? t.place : "gym",
    extras: (Array.isArray(t.extras) ? t.extras : []).filter((e, i, a) => EXTRAS.some(x => x.id === e) && a.indexOf(e) === i),
    favourites: (Array.isArray(t.favourites) ? t.favourites : []).filter((f, i, a) => _id(f) && a.indexOf(f) === i).slice(0, MAX_FAVOURITES),
    own: _str(t.own, NAME_MAX) || null,
  };
}

/** The whole week made safe, or null when there is no usable week. */
export function sanitizeWeekShape(w) {
  if (!w || typeof w !== "object") return null;
  const templates = {};
  for (const [k, t] of Object.entries(w.templates || {}).slice(0, MAX_TEMPLATES)) {
    const s = sanitizeTemplate(t, k);
    if (s) templates[s.id] = s;
  }
  const days = {};
  for (const d of DAY_KEYS) {
    const v = w.days && w.days[d];
    days[d] = v === "rest" ? "rest" : (v && templates[v] ? v : null);
  }
  if (!Object.values(days).some(Boolean)) return null;
  const dismissed = {};
  for (const [k, v] of Object.entries(w.dismissed || {})) {
    if (/^[a-z]{1,12}$/.test(k) && /^\d{4}-\d{2}-\d{2}$/.test(String(v))) dismissed[k] = v;
  }
  return {
    templates, days, dismissed,
    setAt: /^\d{4}-\d{2}-\d{2}/.test(String(w.setAt || "")) ? String(w.setAt).slice(0, 10) : null,
  };
}

/** A request from Home for today's plan, made safe. */
export function sanitizeWeekDayRequest(r) {
  if (!r || typeof r !== "object") return null;
  if (!DAY_KEYS.includes(r.day) || !_id(r.templateId)) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(r.on || ""))) return null;
  return { day: r.day, templateId: r.templateId, on: r.on, short: r.short === true };
}

// ── Ready-made weeks ───────────────────────────────────────────────────

const T = (id, name, mix, intensity, mins, place, extras = []) =>
  ({ id, name, mix: mix.map(([focus, level]) => ({ focus, level })), intensity, mins, place, extras, favourites: [] });

export const READY_WEEKS = [
  {
    id: "rotation",
    name: "Three-way rotation",
    line: "Strength, then your base (core, balance, mobility), then steady cardio, round again.",
    templates: [
      T("strength", "Strength", [["full", 2], ["trunk", 1]], "moderate", 30, "gym"),
      T("base", "Your base", [["trunk", 2], ["balance", 1], ["mobility", 1]], "steady", 30, "gym"),
      T("steady-cardio", "Steady cardio", [["cardio", 2], ["stretch", 0]], "steady", 30, "gym"),
    ],
    days: { mon: "strength", tue: "base", wed: "steady-cardio", thu: "strength", fri: "base", sat: "steady-cardio", sun: "rest" },
  },
  {
    id: "upper-lower",
    name: "Upper, lower and a walk",
    line: "Upper body and legs on alternate days, a walk in between.",
    templates: [
      T("upper-day", "Upper day", [["upper", 2], ["trunk", 1], ["stretch", 0]], "moderate", 30, "gym"),
      T("lower-day", "Lower day", [["legs", 2], ["trunk", 1], ["stretch", 0]], "moderate", 30, "gym"),
      T("walk-day", "A walk", [["cardio", 2]], "gentle", 30, "outside"),
    ],
    days: { mon: "upper-day", tue: "walk-day", wed: "lower-day", thu: "rest", fri: "upper-day", sat: "lower-day", sun: "walk-day" },
  },
  {
    id: "gentle",
    name: "A gentle week",
    line: "Short, easy movement and walks, with rest in between.",
    templates: [
      T("gentle-move", "Gentle movement", [["mobility", 2], ["trunk", 1]], "gentle", 20, "home"),
      T("gentle-walk", "A gentle walk", [["cardio", 2]], "gentle", 20, "outside"),
    ],
    days: { mon: "gentle-move", tue: "gentle-walk", wed: "rest", thu: "gentle-move", fri: "gentle-walk", sat: "rest", sun: "rest" },
  },
];

/** A ready-made week as a weekShape, with a date. */
export function weekFromReady(id, today = new Date()) {
  const r = READY_WEEKS.find(w => w.id === id);
  if (!r) return null;
  const templates = Object.fromEntries(r.templates.map(t => [t.id, JSON.parse(JSON.stringify(t))]));
  return sanitizeWeekShape({ templates, days: { ...r.days }, setAt: today.toISOString().slice(0, 10) });
}

/** A new, empty-ish day plan with a fresh id. */
export function newTemplate(existingIds = [], name = "My day") {
  let n = 1;
  while (existingIds.includes(`day-${n}`)) n++;
  return sanitizeTemplate({ id: `day-${n}`, name, mix: [{ focus: "full", level: 2 }], intensity: "steady", mins: 30, place: "gym" });
}

/** "Mostly upper body · some core and trunk · a little stretching" */
export function mixLine(t) {
  if (!t) return "";
  if (t.own) return t.own === "all" ? "Your own list: all of My exercises" : `Your own list: ${t.own}`;
  const parts = [...t.mix].sort((a, b) => b.level - a.level)
    .map(m => `${LEVELS[m.level].toLowerCase()} ${focusById(m.focus).label.toLowerCase()}`);
  const s = parts.join(" · ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "Moderate · 30 min · gym" */
export function detailLine(t) {
  if (!t) return "";
  if (t.own) return "As you wrote it";
  return `${intensityById(t.intensity).label} · ${t.mins} min · ${PLACES.find(p => p.id === t.place)?.label.toLowerCase() || ""}`;
}
