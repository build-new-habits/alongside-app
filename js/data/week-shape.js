/**
 * js/data/week-shape.js
 * 05 Oct 2026 v1
 *
 * D-6 WEEK-SHAPE. Reading the person's week, and building a day inside it.
 * The shape itself, its vocabulary and its validation are in
 * data/week-shape-model.js; this file adds what needs the store, the log
 * and the session builder.
 *
 *   todayInWeek()     what today is for: a day plan, rest, or nothing set
 *   doneThisWeek()    which days this week already have a finished session
 *   balanceGap()      the one thing the week leaves out, if any, and where
 *                     it could go; never a score, and it can be left
 *   askForToday()     Home's "Show me today's plan" / "Only 10 minutes"
 *   applyWeekDay()    the coach's plan, reshaped to the day plan: its mix
 *                     of focuses, its favourites, its intensity
 *
 * HOW A MIX BECOMES A SESSION. The coach builds the day's main focus as it
 * builds any session (same pools, same sore-area rules, same kit). Each
 * other focus is built the same way and takes a share of the main part:
 * Mostly 3, Some 2, A little 1, at least one each, and the main focus
 * keeps at least as many as any other (more, when it is set higher than
 * all of them); on a short day the smallest go first. Stretching and mobility, unless they are the day's main focus,
 * go to the cool-down (A little one, Some two, Mostly three) and take no
 * main slot. Balance, which has no session of its own, comes from a short
 * list of balance work. So everything placed was chosen by the same rules
 * as the rest of the app; nothing is hand-picked here except that list.
 *
 * FAVOURITES are put in when they fit: not when today's sore answer holds
 * them back, and not without the kit. Then the plan says so. A favourite
 * that fits takes a main slot before the mix is shared out, so the length
 * holds and the main focus keeps its share.
 *
 * INTENSITY. Gentle takes one set off each main exercise. Steady and
 * Moderate keep the sets and differ in how hard each set is, which the
 * plan says in words (how many reps are left in you). The check-in still
 * changes the day as it always does.
 *
 * WHAT IT COUNTS FOR. A day's other focuses are credited to the arc with
 * the session (creditTypes, as freestyle sessions do), and the session is
 * logged like any other, so Progress counts it.
 */

import { store } from "../store.js";
import { EXERCISES } from "./exercises/index.js";
import { soreLevelFor, soreScoresToday } from "../session-builder.js";
import { DAY_KEYS, focusById, LEVEL_WEIGHT, intensityById, mixLine, BALANCE_IDS, EXTRAS } from "./week-shape-model.js";

const JS_DAY = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const pad = n => String(n).padStart(2, "0");
/** Local YYYY-MM-DD. */
export const localDay = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const dayKeyOf = (d = new Date()) => JS_DAY[d.getDay()];

/** The Monday of this date's week, local. */
export function weekStartOf(d = new Date()) {
  const m = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return m;
}

/** Each day of this date's week: key and local date. */
export function weekDates(d = new Date()) {
  const start = weekStartOf(d);
  return DAY_KEYS.map((key, i) => { const x = new Date(start); x.setDate(start.getDate() + i); return { key, date: x, iso: localDay(x) }; });
}

export function getWeek() { return store.get("weekShape") || null; }

/** What today is for: { day, value: id|"rest"|null, template } or null with no week. */
export function todayInWeek(d = new Date()) {
  const w = getWeek();
  if (!w) return null;
  const day = dayKeyOf(d);
  const value = w.days[day] || null;
  return { day, value, template: value && value !== "rest" ? w.templates[value] || null : null };
}

/** { mon: true, ... } for days this week with a finished session. */
export function doneThisWeek(d = new Date()) {
  const log = store.completedSessions(store.get("activityLog") || []);
  const byIso = new Set(log.map(e => {
    const t = new Date(e.date || e.completedAt || e.timestamp || 0);
    return isNaN(t) ? null : localDay(t);
  }).filter(Boolean));
  const out = {};
  for (const { key, iso } of weekDates(d)) out[key] = byIso.has(iso);
  return out;
}

// ── The balance line ───────────────────────────────────────────────────

const GAP_GROUPS = [
  { key: "upper",   label: "upper body",          focus: "upper",   from: ["upper", "full"] },
  { key: "legs",    label: "your legs",           focus: "legs",    from: ["legs", "full"] },
  { key: "trunk",   label: "core and trunk",      focus: "trunk",   from: ["trunk", "full"] },
  { key: "stretch", label: "stretching or mobility", focus: "stretch", from: ["stretch"] },
];

/**
 * The first thing the week leaves out, and the day plan it could go in:
 * { key, label, focus, template, days } or null. Only for a week of three
 * or more session days; a gap left this week is not raised again until
 * next week.
 */
export function balanceGap(d = new Date()) {
  const w = getWeek();
  if (!w) return null;
  const used = DAY_KEYS.map(k => w.days[k]).filter(v => v && v !== "rest");
  if (used.length < 3) return null;
  const groups = new Set();
  for (const id of used) for (const m of (w.templates[id]?.mix || [])) groups.add(focusById(m.focus)?.group);
  const start = localDay(weekStartOf(d));
  for (const g of GAP_GROUPS) {
    if (g.from.some(x => groups.has(x))) continue;
    if (w.dismissed && w.dismissed[g.key] === start) continue;
    // Where it could go: the first day plan from today on with room in it
    // that is not only cardio; else any with room.
    const order = [...DAY_KEYS.slice(DAY_KEYS.indexOf(dayKeyOf(d))), ...DAY_KEYS.slice(0, DAY_KEYS.indexOf(dayKeyOf(d)))];
    const ids = [...new Set(order.map(k => w.days[k]).filter(v => v && v !== "rest"))];
    const room = ids.map(id => w.templates[id]).filter(t => t && t.mix.length < 4);
    const target = room.find(t => !t.mix.every(m => m.focus === "cardio")) || room[0];
    if (!target) continue;
    return { key: g.key, label: g.label, focus: g.focus, template: target,
             days: DAY_KEYS.filter(k => w.days[k] === target.id) };
  }
  return null;
}

/** Put the gap's focus into its day plan, a little. */
export function addGap(gap) {
  const w = getWeek();
  if (!w || !gap) return;
  const t = w.templates[gap.template.id];
  if (!t || t.mix.some(m => m.focus === gap.focus) || t.mix.length >= 4) return;
  t.mix.push({ focus: gap.focus, level: 0 });
  store.set("weekShape", w);
}

/** Leave the gap for this week. */
export function leaveGap(gap, d = new Date()) {
  const w = getWeek();
  if (!w || !gap) return;
  w.dismissed = { ...(w.dismissed || {}), [gap.key]: localDay(weekStartOf(d)) };
  store.set("weekShape", w);
}

// ── Today's plan from the week ─────────────────────────────────────────

/** The day plan's main focus: the most of it, the first on a tie. */
export function primaryFocus(t) {
  const sorted = [...(t?.mix || [])].sort((a, b) => b.level - a.level);
  return sorted[0] ? focusById(sorted[0].focus) : focusById("full");
}

/** The session type the coach builds first for a day plan. */
export function primaryType(t) {
  return primaryFocus(t)?.type || "core";
}

/**
 * Home: ask the plan for today's day plan (short: Only 10 minutes).
 * Writes the request, read once by the plan, and the kind of session.
 */
export function askForToday({ short = false } = {}, d = new Date()) {
  const today = todayInWeek(d);
  if (!today || !today.template) return false;
  store.set("weekDayRequest", { day: today.day, templateId: today.template.id, on: localDay(d), short: !!short });
  store.set("requestedSessionType", primaryType(today.template));
  store.set("requestedLocation", today.template.place);
  return true;
}

/** The request, if it is today's and its day plan still exists; then cleared. */
export function takeWeekDayRequest(d = new Date()) {
  const r = store.get("weekDayRequest");
  if (r) store.set("weekDayRequest", null);
  if (!r || r.on !== localDay(d)) return null;
  const t = getWeek()?.templates?.[r.templateId];
  return t ? { ...r, template: JSON.parse(JSON.stringify(t)) } : null;
}

const byId = new Map(EXERCISES.map(e => [e.id, e]));

/** Kit for an exercise, against the place's equipment list. */
function kitOk(ex, list = [], place) {
  const need = ex.equipment || [];
  if (!need.length) return true;
  if (place === "gym" && list.includes("gym-membership")) return true;
  return need.every(e => {
    const root = String(e).split("-")[0].replace(/s$/, "");
    return list.some(l => String(l).startsWith(root));
  });
}

const blocked = ex => { try { return soreLevelFor(ex, soreScoresToday()).level === "blocked"; } catch { return false; } };

const asPlaced = (ex, section, focus) => ({ ...ex, section, role: section, weekFocus: focus });

/**
 * Reshape a built session to a day plan. Mutates and returns `built`.
 * buildFn is buildSession (passed in, so this file does not decide how
 * sessions are built). args are the arguments the main build used.
 */
export function applyWeekDay(built, req, args, buildFn) {
  if (!built || !req || !req.template || built.gentleCare) return built;
  const t = req.template;
  const list = Array.isArray(built.exercises) ? built.exercises : [];
  const warm = list.filter(e => e.section === "warmup");
  const builtMain = list.filter(e => e.section === "main");
  let cool = list.filter(e => e.section === "cooldown");
  const N = builtMain.length;
  const sorted = [...t.mix].sort((a, b) => b.level - a.level);
  const primary = sorted[0];
  const credit = [];
  const taken = new Set(list.map(e => e.id));

  // Favourites first: the ones that fit take their place in the main part
  // before the mix is shared out, so the day's main focus keeps its share.
  const favIn = [], favOut = [], favAdd = [];
  for (const id of t.favourites || []) {
    if (list.some(e => e.id === id)) { favIn.push(id); continue; }
    const ex = byId.get(id);
    if (!ex) continue;
    if (blocked(ex) || !kitOk(ex, args.equipmentOverride, t.place)) { favOut.push(id); continue; }
    favAdd.push({ ...asPlaced(ex, "main", "favourite"), favourite: true });
    taken.add(id); favIn.push(id);
  }

  // What a focus's own session would put in its main part.
  const poolFor = f => {
    if (f.type) {
      const b = buildFn({ ...args, sessionType: f.type });
      return b && !b.gentleCare ? (b.exercises || []).filter(e => e.section === "main") : [];
    }
    return BALANCE_IDS.map(id => byId.get(id)).filter(e => e && kitOk(e, args.equipmentOverride, t.place) && !blocked(e));
  };
  const pick = (f, n) => {
    const got = poolFor(f).filter(e => !taken.has(e.id)).slice(0, n);
    got.forEach(e => taken.add(e.id));
    if (got.length && f.type) credit.push(f.type);
    return got;
  };

  // The main part: the slots left after favourites, shared by weight among
  // the focuses that belong in it. Stretching and mobility, unless they
  // are the day's main focus, go to the cool-down and take no slot.
  const slots = Math.max(1, N - favAdd.length);
  const isCool = m => focusById(m.focus).group === "stretch" && m !== primary;
  let others = sorted.slice(1).filter(m => !isCool(m));
  const coolMix = sorted.slice(1).filter(isCool);
  const mainMix = [primary, ...others];
  const W = mainMix.reduce((s, m) => s + LEVEL_WEIGHT[m.level], 0);
  let shares = others.map(m => Math.max(1, Math.round(slots * LEVEL_WEIGHT[m.level] / W)));
  // The main focus keeps at least as many as any other; on a short day the
  // smallest go first.
  // "Mostly" against "some" means more, not the same: when the main
  // focus is set higher than every other, it keeps more than any of them.
  const left = () => slots - shares.reduce((a, b) => a + b, 0);
  const need = () => Math.max(1, Math.max(...shares) + (others.every(m => m.level < primary.level) ? 1 : 0));
  while (others.length && left() < need()) {
    const big = shares.indexOf(Math.max(...shares));
    if (shares[big] > 1) shares[big]--;
    else { others = others.slice(0, -1); shares = shares.slice(0, -1); }
  }
  const nPrimary = left();
  const addMain = [];
  others.forEach((m, i) => {
    const f = focusById(m.focus);
    addMain.push(...pick(f, shares[i]).map(e => asPlaced(e, "main", f.id)));
  });
  for (const m of coolMix) {
    const f = focusById(m.focus);
    cool = [...cool, ...pick(f, m.level + 1).map(e => asPlaced(e, "cooldown", f.id))];
  }
  if (primary && focusById(primary.focus).type == null) {
    // Balance as the day's main focus: its own list, not the built session's.
    const f = focusById(primary.focus);
    const got = pick(f, nPrimary).map(e => asPlaced(e, "main", f.id));
    if (got.length) builtMain.splice(0, builtMain.length, ...got);
  }
  let main = N > 0 ? [...builtMain.slice(0, Math.max(1, nPrimary)), ...addMain, ...favAdd] : [...builtMain, ...favAdd];

  // Gentle: one set fewer on each main exercise.
  if (t.intensity === "gentle") {
    main = main.map(e => (Number(e.sets) > 1 ? { ...e, sets: Number(e.sets) - 1 } : e));
  }

  built.exercises = [...warm, ...main, ...cool];
  built.creditTypes = [...new Set(credit)];
  const inten = intensityById(t.intensity);
  const names = ids => ids.map(id => byId.get(id)?.name).filter(Boolean);
  const extras = (t.extras || []).map(x => EXTRAS.find(e => e.id === x)?.label.toLowerCase()).filter(Boolean);
  const join = a => a.length > 1 ? `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}` : (a[0] || "");
  const sentence = [
    `From your week: ${t.name}${req.short ? ", the short version" : ""}.`,
    `${mixLine(t)}.`,
    `${inten.label}: ${inten.line.charAt(0).toLowerCase()}${inten.line.slice(1)}`,
    names(favIn).length ? `${join(names(favIn))} ${names(favIn).length > 1 ? "are" : "is"} in.` : "",
    names(favOut).length ? `${join(names(favOut))} ${names(favOut).length > 1 ? "are" : "is"} left out today.` : "",
    extras.length ? `Then the ${join(extras)}, if you want ${extras.length > 1 ? "them" : "it"}.` : "",
  ].filter(Boolean).join(" ");
  built.weekDay = {
    templateId: t.id, name: t.name, intensity: t.intensity, short: !!req.short,
    primary: primary?.focus || null, sentence, favouritesIn: favIn, favouritesOut: favOut,
  };
  return built;
}
