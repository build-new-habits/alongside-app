/**
 * js/data/activity-labels.js
 * 30 Sep 2026 v3
 *
 * v3 - W3-20. "an upper body session", not "a upper body session".
 *
 * v2 - P26. A gym session somebody logs by hand (the activity log's "Gym
 *   or weights", type "gym", source "self-logged") reads "a gym session",
 *   not "a session you built": they did not build it here.
 *
 * P7. ONE map from what the app logs to what a person reads.
 *
 * There were three -- the coach's recap, Home's line about yesterday, and
 * Progress -- each keyed on type names nothing writes ("walk-session",
 * "yoga-session", "gym-programme"). Real entries fell through: "you did
 * gym" at home, "you did movement" after breathing, "mostly gym" on
 * Progress. verify-activity-labels scans every view for the types it
 * logs, and the manual activity log for its own, and fails on any type
 * this file cannot put into words.
 *
 * Old names stay in the map: entries logged before the rename are still
 * somebody's record.
 */
import { SESSION_TYPES } from "../session-builder.js";

// type -> [phrase for "you did ...", noun for "walking × 2" / "mostly ..."]
const LABELS = {
  // Built and guided sessions
  "workout":            ["strength work",             "strength"],
  "gym":                ["a session you built",       "your own sessions"],
  "gym-programme":      ["a session you built",       "your own sessions"],
  "core-session":       ["core work",                 "core work"],
  "morning-session":    ["morning movement",          "morning movement"],
  "class":              ["a class",                   "classes"],
  "freestyle":          ["a session you made up as you went", "made up as you went"],
  "capture":            ["a session you made up as you went", "made up as you went"],
  "prescribed-session": ["your own exercises",        "your own exercises"],
  "coach-session":      ["a coaching session",        "coaching sessions"],
  // Out and about
  "walk":               ["a walk",                    "walking"],
  "walk-session":       ["a walk",                    "walking"],
  "run":                ["a run",                     "running"],
  "running-session":    ["a run",                     "running"],
  "swim":               ["a swim",                    "swimming"],
  "swim-session":       ["a swim",                    "swimming"],
  "cycle":              ["a bike ride",               "cycling"],
  "cycle-session":      ["a bike ride",               "cycling"],
  "outdoor-cycle":      ["a bike ride",               "cycling"],
  "hike":               ["a hike",                    "hiking"],
  "outdoor":            ["something outdoors",        "outdoors"],
  // Mind and breath
  "yoga":               ["yoga",                      "yoga"],
  "yoga-session":       ["yoga",                      "yoga"],
  "mindfulness":        ["a breathing practice",      "breathing"],
  "breathing-session":  ["a breathing practice",      "breathing"],
  "mindful":            ["a quiet practice",          "quiet practice"],
  "quiet-session":      ["a quiet practice",          "quiet practice"],
  "practice":           ["a practice",                "practices"],
  // The manual activity log
  "row":                ["some rowing",               "rowing"],
  "body-balance":       ["a Body Balance class",      "Body Balance"],
  "spin":               ["a spin class",              "spin"],
  "boxing":             ["boxing",                    "boxing"],
  "hiit":               ["a HIIT session",            "HIIT"],
  "tennis":             ["tennis",                    "tennis"],
  "football":           ["football",                  "football"],
  "golf":               ["golf",                      "golf"],
  "sport":              ["some sport",                "sport"],
};

const FALLBACK = ["some activity", "other activity"];

// P26. Logged by hand from the activity log: a gym visit, not a session
// the builder put together.
const SELF_GYM = ["a gym session", "gym sessions"];
const selfGym = e => e?.type === "gym" && e?.source === "self-logged";

function builtKind(entry) {
  const t = entry && SESSION_TYPES.find(s => s.id === entry.sessionType && s.id !== "gym");
  return t ? t.label.toLowerCase() : null;
}

/** "a walk", "a lower body session", "a breathing practice". */
export function activityPhrase(entry) {
  if (selfGym(entry)) return SELF_GYM[0];
  const kind = (entry?.type === "workout" || entry?.type === "gym" || entry?.type === "gym-programme") && builtKind(entry);
  if (kind) return `${/^[aeiou]/i.test(kind) ? "an" : "a"} ${kind} session`;   // W3-20: "an upper body"
  return (LABELS[entry?.type] || FALLBACK)[0];
}

/** "walking", "lower body", "breathing" -- for counts and "mostly ...". */
export function activityNoun(entry) {
  if (selfGym(entry)) return SELF_GYM[1];
  const kind = (entry?.type === "workout" || entry?.type === "gym" || entry?.type === "gym-programme") && builtKind(entry);
  if (kind) return kind;
  return (LABELS[entry?.type] || FALLBACK)[1];
}

/** "a, b and c". */
export function joinList(items) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** Local calendar day, "YYYY-MM-DD". */
export function localDay(d) {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
}

/** Whole calendar days between a time and now: 0 today, 1 yesterday. */
export function daysAgo(ts, now = new Date()) {
  const a = new Date(localDay(ts) + "T12:00:00"), b = new Date(localDay(now) + "T12:00:00");
  return Math.round((b - a) / 864e5);
}
