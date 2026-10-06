/**
 * data/progress-report.js
 * 06 Oct 2026 v1
 *
 * D-11 PROGRESS-SHARE (Graeme, 06 Oct: "Progress pages to show today, 7
 * days, 14 days, 30, and 90 ... Download today's report - what was done,
 * where, how many. Some people may want to report this to a dietician or
 * AI or something. It needs to be attractive looking. But functional and
 * informative.")
 *
 * One reading of the record, used by every place that shows or shares it:
 * Progress's windows and Today, the shared picture, the certificate, the
 * printable report and the text (plain or CSV). Pure: it reads only what
 * it is given, so the numbers on Progress and in anything shared are the
 * same numbers.
 *
 * WHAT IS NEVER IN ANYTHING SHARED, whatever is switched on:
 *   - the journal, session notes, lift notes (a note is often about how a
 *     body part felt; it was written for the person, not for a reader);
 *   - weight;
 *   - calories or energy used (the app does not estimate them);
 *   - streaks, days in a row, targets, scores, "best" or "most".
 * Check-in answers (energy, mood, anything sore) only when the person
 * switches them on AND has the health consent.
 *
 * Windows are calendar days, ending today: "7 days" is today and the six
 * before it. Today is today since midnight.
 */
import { activityNoun, localDay } from "./activity-labels.js";
import { SESSION_TYPES } from "../session-builder.js";
import { kindOf } from "./kind-colours.js";
import { soreWord, getConditionName } from "./conditions.js";

const DAY = 86400000;

// ── Windows ───────────────────────────────────────────────────────────────

export const WINDOWS = Object.freeze([
  { key: "today", days: 1,  label: "Today" },
  { key: "7",     days: 7,  label: "7 days" },
  { key: "14",    days: 14, label: "14 days" },
  { key: "30",    days: 30, label: "30 days" },
  { key: "90",    days: 90, label: "90 days", plan: true },
]);

/** The windows this person can see: 90 days is the Plan's. */
export function windowsFor(premium) {
  return WINDOWS.filter(w => premium || !w.plan);
}

/** Midnight at the start of a local calendar day. */
function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

const longDay = d => new Date(d).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
const dayMonth = d => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const year = d => new Date(d).getFullYear();

/**
 * windowRange("today" | "7" | "14" | "30" | "90", now)
 * -> { key, days, from, to, title, sentence }
 *   title     "Tuesday 6 October" or "30 Sep – 6 Oct"
 *   sentence  "today" or "in the last 7 days"
 */
export function windowRange(key, now = new Date()) {
  const w = WINDOWS.find(x => x.key === String(key)) || WINDOWS[3];
  const to = new Date(now);
  const from = startOfDay(new Date(startOfDay(now).getTime() - (w.days - 1) * DAY + DAY / 2));
  const title = w.days === 1 ? longDay(now) : `${dayMonth(from)} – ${dayMonth(to)}`;
  const sentence = w.days === 1 ? "today" : `in the last ${w.days} days`;
  return { key: w.key, days: w.days, from, to, title, sentence, label: w.label };
}

const at = e => Date.parse(e && (e.completedAt || e.loggedAt || e.date));

/** The completed sessions in a window, earliest first. */
export function sessionsIn(completed = [], range) {
  const from = range.from.getTime(), to = range.to.getTime();
  return completed
    .filter(e => { const t = at(e); return Number.isFinite(t) && t >= from && t <= to; })
    .sort((a, b) => at(a) - at(b));
}

/** Sessions on each calendar day of the window, oldest first. */
export function dailyCounts(entries = [], range) {
  const days = [];
  for (let i = 0; i < range.days; i++) {
    const d = startOfDay(new Date(range.from.getTime() + i * DAY + DAY / 2));
    days.push({ day: d, key: localDay(d), total: 0 });
  }
  const byKey = new Map(days.map(d => [d.key, d]));
  for (const e of entries) {
    const t = at(e);
    if (!Number.isFinite(t)) continue;
    const slot = byKey.get(localDay(new Date(t)));
    if (slot) slot.total++;
  }
  return days;
}

// ── One session, in words ─────────────────────────────────────────────────

const PLACE_WORDS = { home: "At home", gym: "At the gym", outside: "Outside" };
/** "At home", "At the gym", "Outside", or null when the app was not told. */
export function placeLabel(place) {
  return PLACE_WORDS[place] || null;
}

/** "Upper body", "Walking", "Breathing": what a person would call it. */
export function kindName(entry) {
  const t = entry && entry.sessionType && SESSION_TYPES.find(x => x.id === entry.sessionType);
  if (t && (entry.type === "workout" || entry.type === "gym" || entry.type === "gym-programme")) return t.label;
  const noun = activityNoun(entry);
  if (!noun || noun === "other activity") return "A session";
  return noun.charAt(0).toUpperCase() + noun.slice(1);
}

// The finish screen's answers (views/reflect.js FEEL_OPTIONS), by value.
// A class's "hard" is "Hard going"; everywhere else it is "Struggled".
const FEEL_WORDS = {
  strong: "Felt strong", right: "About right", hard: "Struggled",
  good: "Felt good", steady: "Steady", tough: "Tough today",
  loved: "Loved it", grounded: "Grounded", okay: "Okay", restless: "Restless",
  needed: "Needed it", calmer: "Calmer", same: "About the same",
};
/** What they said at the finish, in the words they tapped; null if nothing. */
export function feelLabel(entry) {
  if (!entry || !entry.feel) return null;
  if (entry.type === "class" && entry.feel === "good") return "Good session";
  if (entry.type === "class" && entry.feel === "hard") return "Hard going";
  return FEEL_WORDS[entry.feel] || null;
}
export const FEEL_VALUES = Object.freeze(Object.keys(FEEL_WORDS));

const clock = t => new Date(t).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

/**
 * The moves of one session and the sets logged for each, from the lift
 * log: records for the session's own exercises, made while it ran (from
 * its length before it finished, give or take five minutes). Notes are
 * never read.
 */
export function movesFor(entry, liftLog = {}, exerciseName = id => id) {
  const ids = Array.isArray(entry && entry.exerciseIds) ? [...new Set(entry.exerciseIds)] : [];
  if (!ids.length) return [];
  const end = at(entry);
  const mins = Number(entry.durationMins) > 0 ? Number(entry.durationMins) : 90;
  const from = end - (mins + 5) * 60000, to = end + 5 * 60000;
  return ids.map(id => {
    const sets = (liftLog[id] || [])
      .filter(r => { const t = Date.parse(r && r.at); return Number.isFinite(t) && t >= from && t <= to; })
      .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
      .map(r => {
        const s = {};
        for (const k of ["reps", "weight", "unit", "durationMins", "distance", "speed", "incline", "level", "tension"]) {
          if (r[k] !== undefined && r[k] !== null && r[k] !== "") s[k] = r[k];
        }
        return s;
      });
    return { id, name: exerciseName(id) || readableId(id), sets };
  });
}

/**
 * A move the library cannot name (renamed or retired since it was logged)
 * is still shown in words: "lat-pulldown" reads "Lat pulldown", never the
 * id itself (LOG-CLASS-1: a lookup that ends `|| input` shows a person
 * developer vocabulary).
 */
export function readableId(id) {
  const s = String(id || "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "A move";
}

/** One set in words: "10 × 40 kg", "2 min", "Level 6, 12 min". */
export function setText(s) {
  const parts = [];
  if (s.reps !== undefined && s.weight !== undefined) parts.push(`${s.reps} × ${s.weight} ${s.unit || "kg"}`);
  else if (s.reps !== undefined) parts.push(`${s.reps} reps`);
  else if (s.weight !== undefined) parts.push(`${s.weight} ${s.unit || "kg"}`);
  if (s.tension) parts.push(`${s.tension} band`);
  if (s.level !== undefined) parts.push(`level ${s.level}`);
  if (s.speed !== undefined) parts.push(`speed ${s.speed}`);
  if (s.incline !== undefined) parts.push(`incline ${s.incline}`);
  if (s.distance !== undefined) parts.push(`${s.distance} km`);
  if (s.durationMins !== undefined) parts.push(`${s.durationMins} min`);
  const t = parts.join(", ");
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : "Done";
}

/** "3 sets: 10 × 40 kg, 10 × 40 kg, 8 × 42.5 kg" */
export function setsText(sets = []) {
  if (!sets.length) return "";
  return `${sets.length} set${sets.length === 1 ? "" : "s"}: ${sets.map(setText).join(", ")}`;
}

/** The kinds of session in a set of entries, most first (an order, not a ranking). */
export function kindsIn(entries = []) {
  const m = new Map();
  for (const e of entries) {
    const label = kindName(e);
    const was = m.get(label) || { label, kind: kindOf(e), count: 0 };
    was.count++;
    m.set(label, was);
  }
  return [...m.values()].sort((a, b) => b.count - a.count);
}

// ── Check-ins (health answers: shared only when switched on and consented) ──

const ENERGY_WORDS = [[2, "Running on empty"], [4, "Low"], [6, "Okay"], [8, "Good"], [10, "Full of it"]];
const MOOD_WORDS   = [[2, "Struggling"], [4, "Low"], [6, "Okay"], [8, "Pretty good"], [10, "Great"]];
const wordFor = (table, v) => (typeof v === "number" && Number.isFinite(v)) ? (table.find(([max]) => v <= max) || table[table.length - 1])[1] : null;

function checkinsIn(checkinHistory = {}, range) {
  const out = [];
  for (const [key, c] of Object.entries(checkinHistory || {})) {
    const t = Date.parse((c && c.savedAt) || key);
    if (!Number.isFinite(t) || t < range.from.getTime() || t > range.to.getTime()) continue;
    const sore = Object.entries((c && c.conditionLevels) || {})
      .filter(([, v]) => typeof v === "number" && v > 0)
      .map(([id, v]) => `${String(getConditionName(id) || id).toLowerCase()} ${String(soreWord(v) || "").toLowerCase()}`.trim());
    out.push({
      t, date: longDay(t),
      energy: wordFor(ENERGY_WORDS, c && c.energy),
      mood: wordFor(MOOD_WORDS, c && c.mood),
      sore: sore.length ? sore.join(", ") : "nothing sore",
    });
  }
  return out.sort((a, b) => a.t - b.t);
}

// ── What goes on it ───────────────────────────────────────────────────────

export const FORMATS = Object.freeze(["picture", "certificate", "report", "text"]);

export const PARTS = Object.freeze([
  { id: "sessions", label: "Sessions and time" },
  { id: "kinds",    label: "Kinds of session" },
  { id: "place",    label: "Where you trained" },
  { id: "moves",    label: "Moves, sets and weights" },
  { id: "name",     label: "Your name" },
  { id: "checkins", label: "Your check-in answers", health: true,
    hint: "Energy, mood and anything sore. Off unless you choose." },
]);

/**
 * What starts switched on. A picture or certificate goes to people:
 * sessions and kinds only (a certificate carries the name it is for).
 * A report or text goes to someone who helps: what, where and how many.
 * Check-in answers are never on until the person chooses.
 */
export function defaultsFor(format) {
  const base = { sessions: true, kinds: true, place: false, moves: false, name: false, checkins: false };
  if (format === "certificate") return { ...base, name: true };
  if (format === "report" || format === "text") return { ...base, place: true, moves: true };
  return base;
}

/**
 * buildReport() -> the one model every output is drawn from.
 *   include   which PARTS are on; checkins also needs healthOk
 *   exerciseName(id) -> a library name
 */
export function buildReport({ rangeKey = "today", completed = [], liftLog = {}, checkinHistory = {},
  name = "", include = defaultsFor("report"), healthOk = false, exerciseName = id => id, now = new Date() } = {}) {
  const range = windowRange(rangeKey, now);
  const entries = sessionsIn(completed, range);
  const sessions = entries.map(e => {
    const t = at(e);
    return {
      t, day: localDay(new Date(t)), date: longDay(t), time: clock(t),
      kind: kindName(e), colour: kindOf(e),
      place: include.place ? placeLabel(e.place) : null,
      mins: Number(e.durationMins) > 0 ? Math.round(Number(e.durationMins)) : null,
      afterwards: feelLabel(e),
      moves: include.moves ? movesFor(e, liftLog, exerciseName) : [],
    };
  });
  const mins = sessions.reduce((n, s) => n + (s.mins || 0), 0);
  const sets = sessions.reduce((n, s) => n + s.moves.reduce((m, mv) => m + mv.sets.length, 0), 0);
  return {
    range, title: `${range.title} ${year(now)}`,
    name: include.name ? String(name || "").trim().slice(0, 40) : "",
    include: { ...include, checkins: !!(include.checkins && healthOk) },
    sessions,
    totals: { sessions: sessions.length, mins, sets, days: new Set(sessions.map(s => s.day)).size },
    kinds: include.kinds ? kindsIn(entries) : [],
    days: dailyCounts(entries, range),
    checkins: include.checkins && healthOk ? checkinsIn(checkinHistory, range) : [],
    madeAt: now,
  };
}

/** "3 hours 45 minutes", "46 minutes", "1 hour". */
export function minutesText(m) {
  if (!m) return "0 minutes";
  const h = Math.floor(m / 60), r = m % 60;
  const hp = h ? `${h} hour${h === 1 ? "" : "s"}` : "";
  const mp = r ? `${r} minute${r === 1 ? "" : "s"}` : "";
  return [hp, mp].filter(Boolean).join(" ");
}

/** "3h 45", "46 min". */
export function minutesShort(m) {
  if (!m) return "0 min";
  const h = Math.floor(m / 60), r = m % 60;
  return h ? `${h}h${r ? " " + String(r).padStart(2, "0") : ""}` : `${r} min`;
}

export const ABOUT_LINES = Object.freeze([
  "Recorded by hand in the Alongside: Move app. Nothing was measured by a device.",
  "Alongside plans movement only. It does not estimate calories or energy used, and it is not a medical device.",
]);

/** Plain text: for an email, notes or an AI chat. Says what was done; asks nothing. */
export function reportText(model) {
  const L = [];
  const one = model.range.days === 1;
  L.push(`Movement report: ${one ? model.title : `${model.range.title} ${year(model.madeAt)} (${model.range.days} days)`}`);
  if (model.name) L.push(`For: ${model.name}`);
  L.push("From Alongside: Move (buildnewhabits.co.uk)", "");
  L.push(`Sessions: ${model.totals.sessions}`);
  if (model.include.sessions && model.totals.mins) L.push(`Time moving: ${minutesText(model.totals.mins)}`);
  if (!one && model.totals.sessions) L.push(`Days with a session: ${model.totals.days} of ${model.range.days}`);
  if (model.include.moves && model.totals.sets) L.push(`Sets logged: ${model.totals.sets}`);
  if (model.kinds.length) L.push(`Kinds of session: ${model.kinds.map(k => `${k.label} ${k.count}`).join(", ")}`);
  if (model.include.sessions && model.sessions.length) {
    let lastDay = null, n = 0;
    for (const s of model.sessions) {
      if (!one && s.day !== lastDay) { L.push("", s.date); lastDay = s.day; n = 0; }
      if (one && n === 0) L.push("");
      n++;
      const head = [s.time, s.place && s.place.toLowerCase(), s.mins ? `${s.mins} minutes` : null].filter(Boolean).join(", ");
      L.push(`${n}. ${s.kind}: ${head}`);
      for (const m of s.moves) L.push(`   - ${m.name}${m.sets.length ? `: ${setsText(m.sets)}` : ""}`);
      if (s.afterwards) L.push(`   Afterwards: ${s.afterwards.toLowerCase()}`);
    }
  }
  if (model.checkins.length) {
    L.push("", "Check-in answers (included by choice)");
    for (const c of model.checkins) L.push(`- ${c.date}: energy ${String(c.energy || "not given").toLowerCase()}, mood ${String(c.mood || "not given").toLowerCase()}, ${c.sore}`);
  }
  L.push("", "About this report", ...ABOUT_LINES.map(l => `- ${l}`));
  return L.join("\n");
}

const csvCell = v => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** CSV: one row a set (or a session with no sets), for a spreadsheet. */
export function reportCsv(model) {
  const rows = [["date", "time", "kind", "place", "minutes", "move", "set", "reps", "weight", "unit", "other", "afterwards"]];
  for (const s of model.sessions) {
    const base = [s.day, s.time, s.kind, s.place || "", s.mins ?? ""];
    const moves = s.moves.filter(m => m.sets.length);
    if (!moves.length) {
      rows.push([...base, s.moves.map(m => m.name).join("; "), "", "", "", "", "", s.afterwards || ""]);
      continue;
    }
    let first = true;
    for (const m of moves) m.sets.forEach((set, i) => {
      const other = ["durationMins", "distance", "speed", "incline", "level", "tension"]
        .filter(k => set[k] !== undefined).map(k => `${k} ${set[k]}`).join("; ");
      rows.push([...base, m.name, i + 1, set.reps ?? "", set.weight ?? "", set.weight !== undefined ? (set.unit || "kg") : "", other, first ? (s.afterwards || "") : ""]);
      first = false;
    });
  }
  return rows.map(r => r.map(csvCell).join(",")).join("\n");
}

/** A description for a picture or certificate, read in place of it. */
export function describeShare(model, format) {
  const t = model.totals;
  const what = `${t.sessions} session${t.sessions === 1 ? "" : "s"}${model.include.sessions && t.mins ? ` and ${minutesText(t.mins)} of moving` : ""}`;
  const when = model.range.days === 1 ? `on ${model.range.title}` : `from ${model.range.title}`;
  const kinds = model.kinds.length ? `. ${model.kinds.map(k => `${k.label} ${k.count}`).join(", ")}` : "";
  const who = model.name ? `${model.name}, ` : "";
  const lead = format === "certificate" ? `A record of moving. ${who}` : "";
  return `${lead}${what} ${when}${kinds}. Alongside: Move, by Build New Habits.`;
}
