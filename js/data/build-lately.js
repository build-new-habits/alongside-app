/**
 * js/data/build-lately.js
 * 02 Nov 2026 v1
 *
 * P-26 ONE-BUILD-PAGE. Lately, on Build a session: what the person has
 * actually worked in the last seven days, said as a suggestion they are
 * free to ignore (Graeme, 02 Nov: "balance should always be a suggestion
 * ... I might choose to go against it"; "Last 7 days").
 *
 * Read from what was done (the activity log), never from what was planned:
 * Your week's balance line already reads the plan. Nothing is stored.
 *
 * The rule, in full:
 *   - the finished sessions of the last 7 days that worked upper body,
 *     legs or core and trunk, newest first; fewer than two, nothing said;
 *   - the last three (or two) were mostly one of those: every one, or all
 *     but one, had it as its main group;
 *   - another of the three had no turn in those sessions (the first, in
 *     the order legs, upper body, core and trunk), and the person has not
 *     already chosen it for this session; once they have, nothing more is
 *     said (one suggestion, never a list);
 *   - then: "Your last three sessions were mostly upper body. Legs haven't
 *     had a turn since Thursday." (or "in the last week" when it had none
 *     in the seven days). Never a score, a count of days in a row, or a
 *     word that blames. It never stops a save (the page's to keep).
 *
 * A session's groups: its own kind when it has one (upper, lower, glute,
 * core, full), otherwise the first area each of its movements works.
 * Pure: the log and the library come in, a sentence goes out.
 */

export const LATELY_DAYS = 7;

/** The three groups Lately speaks about, in the order a gap is named. */
export const LATELY_GROUPS = {
  legs:  { id: "legs",  label: "your legs",      cap: "Legs",           have: "haven’t" },
  upper: { id: "upper", label: "upper body",     cap: "Upper body",     have: "hasn’t" },
  trunk: { id: "trunk", label: "core and trunk", cap: "Core and trunk", have: "hasn’t" },
};
const GAP_ORDER = ["legs", "upper", "trunk"];

const AREA_GROUP = {
  "shoulder": "upper", "upper-back": "upper", "chest-pecs": "upper", "triceps-biceps": "upper",
  "biceps-triceps": "upper", "rotator-cuff": "upper", "wrist-elbow": "upper",
  "glutes": "legs", "quadriceps": "legs", "hamstring": "legs", "calves": "legs", "hip": "legs",
  "ankle-foot": "legs", "hip-flexor": "legs", "adductors": "legs", "knee": "legs", "achilles": "legs",
  "abdominals": "trunk", "core": "trunk", "lower-back": "trunk",
};
const KIND_GROUPS = { upper: ["upper"], lower: ["legs"], glute: ["legs"], core: ["trunk"], full: ["upper", "legs", "trunk"] };

/** The group a movement mostly works, from its first area, or null. */
export function groupOfMovement(e) {
  for (const a of (e?.affectsAreas || [])) if (AREA_GROUP[a]) return AREA_GROUP[a];
  return null;
}

/** { groups: [...], main: group|null } for one finished session. */
export function groupsOfEntry(e, byId) {
  const kind = KIND_GROUPS[e?.sessionType];
  if (kind) return { groups: kind, main: kind.length === 1 ? kind[0] : null };
  const n = {};
  for (const id of (Array.isArray(e?.exerciseIds) ? e.exerciseIds : [])) {
    const g = groupOfMovement(byId.get(id));
    if (g) n[g] = (n[g] || 0) + 1;
  }
  const groups = Object.keys(n);
  if (!groups.length) return { groups: [], main: null };
  const top = groups.sort((a, b) => n[b] - n[a])[0];
  return { groups, main: groups.length === 1 || n[top] > n[groups[1]] ? top : null };
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const whenOf = e => new Date(e?.completedAt || e?.date || e?.timestamp || 0);

/** "since yesterday", "since Thursday", "since last Monday". */
function sinceWords(then, now) {
  const days = Math.round((startOfDay(now) - startOfDay(then)) / 864e5);
  if (days <= 1) return "since yesterday";
  return days >= 7 ? `since last ${DAY_NAMES[then.getDay()]}` : `since ${DAY_NAMES[then.getDay()]}`;
}

/**
 * @param {object} p
 * @param {Array}  p.log      finished sessions (store.completedSessions())
 * @param {Map}    p.byId     the library by id
 * @param {Date}   [p.now]
 * @param {Array}  [p.chosen] groups already chosen for this session (upper, legs, trunk)
 * @returns {null|{ line: string, gap: string, top: string, sessions: number }}
 */
export function latelyFor({ log = [], byId = new Map(), now = new Date(), chosen = [] } = {}) {
  const from = startOfDay(now).getTime() - LATELY_DAYS * 864e5;
  const recent = log
    .map(e => ({ e, at: whenOf(e), ...groupsOfEntry(e, byId) }))
    .filter(x => !isNaN(x.at) && x.at.getTime() >= from && x.at.getTime() <= now.getTime() && x.groups.length)
    .sort((a, b) => b.at - a.at);
  if (recent.length < 2) return null;
  const last = recent.slice(0, 3);
  const tally = {};
  for (const x of last) if (x.main) tally[x.main] = (tally[x.main] || 0) + 1;
  const top = Object.keys(tally).sort((a, b) => tally[b] - tally[a])[0];
  if (!top || tally[top] < 2 || tally[top] < last.length - 1) return null;
  const worked = new Set(last.flatMap(x => x.groups));
  const gap = GAP_ORDER.find(g => g !== top && !worked.has(g));
  // One suggestion at a time: once the person has chosen it, nothing more is said.
  if (!gap || chosen.includes(gap)) return null;
  const had = recent.find(x => x.groups.includes(gap));
  const n = last.length === 3 ? "three" : "two";
  const G = LATELY_GROUPS[gap];
  const line = `Your last ${n} sessions were mostly ${LATELY_GROUPS[top].label}. `
    + `${G.cap} ${G.have} had a turn ${had ? sinceWords(had.at, now) : "in the last week"}.`;
  return { line, gap, top, sessions: last.length };
}
