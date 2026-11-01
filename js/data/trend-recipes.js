/**
 * js/data/trend-recipes.js
 * 01 Nov 2026 v2
 *
 * v2 - P-20 session 2: HILIT, hard work with no jumping (approved 01 Nov,
 *   Graeme: BNH-Files Product/alongside_content_trends-hilit_01nov2026_v2.md).
 *   Five stations a round (legs, upper body with push and pull taking turns,
 *   out of breath, your middle, legs or a carry), impact false and no jump
 *   on every one; twelve weeks in three blocks, the fourth week of each
 *   easier; two HILIT days a week at most, never on the day after another.
 *
 * P-20 TRENDS-BUILD, session 1 (master schedule v610): Zone 2 / 80-20,
 * snacks and cross training, as recipes the engine fills from the library.
 * Content approved 01 Nov (Graeme): BNH-Files Product/
 * alongside_content_trends-zone2-snacks-cross_01nov2026_v2.md.
 *
 * Pure: no store, no DOM. Every function takes what it needs (preferences,
 * the activity log, the kit) and returns a practice in path.js's shape:
 *   { id, name, minutes, steps: [{ id, mins, note?, swaps? }], effort, trend, snack? }
 * A step's swaps are the only movements Swap may offer for it (the recipe's
 * own pool), so a swap never leaves the recipe's rules.
 * so the door route shows it as a proposal (figures, Swap, Start) and the one
 * player plays it (startPractice).
 *
 * Rules kept (the approved draft):
 *  - Effort is said in the talk test's words, never a heart rate or a zone
 *    number. EFFORT holds the three lines.
 *  - Library exercises only. The ten new P-17 entries are held until the
 *    clinical read (HELD below); nothing here offers one.
 *  - Not again is left out; less often goes last; a liked movement comes
 *    first, at most one per snack.
 *  - The person chooses (cross training's swap, the day's easy or hard);
 *    the app offers.
 *  - No times kept as a result, no scores, no counts of days in a row.
 */

export const EFFORT = Object.freeze({
  easy:   "Easy: you could talk in full sentences the whole time.",
  steady: "Steady: you can talk in short sentences.",
  hard:   "Hard: you can only say a few words at a time.",
});

export const HARD_SAFETY = "If you feel dizzy, sick or unwell, or pain in your chest, stop. If it happens again, talk to your GP before you carry on.";

/**
 * A library name without a length in it ("Easy Run — 30 Minutes" becomes
 * "Easy Run"), so a step never says a length it is not: the step's own
 * minutes are said beside it.
 */
export function plainName(name) {
  return String(name || "").replace(/\s*[—–-]\s*\d+[\s-]*(?:minutes?|mins?)\b.*$/i, "").replace(/\s*\(\d+[\s-]*(?:minutes?|mins?)\)\s*$/i, "").trim();
}
/** Every step of a recipe's practice gets its plain name as its label. */
function labelled(practice, byId) {
  if (!practice) return practice;
  return { ...practice, steps: practice.steps.map(s => ({ ...s, label: plainName(byId.get(s.id)?.name) || undefined })) };
}

/** The ten new entries approved 01 Nov, built later and held until the clinical read (P-18). */
export const HELD = Object.freeze([
  "uphill-walk", "slider-reverse-lunge", "slider-lateral-lunge", "slider-mountain-climber",
  "sled-pull", "burpee-broad-jump", "loaded-walking-lunge", "wall-ball",
  "band-footwork", "band-feet-in-straps",
]);

/** What Follow a fitness trend offers in each door, this session's formats. */
export const TRENDS = Object.freeze({
  zone2: { name: "Zone 2, mostly easy", short: "Zone 2", line: "Mostly easy, with one harder day.", doors: ["moving"], icon: "run" },
  cross: { name: "Mix it up", short: "cross training", line: "Cross training: swap one day for something that uses your body differently.", doors: ["moving", "stronger"], icon: "fresh" },
  hilit: { name: "HILIT: hard work, no jumping", short: "HILIT", line: "Short bursts, then a rest. Nothing leaves the floor.", doors: ["stronger", "moving"], icon: "strength" },
  snack: { name: "A 10-minute snack", short: "a 10-minute snack", line: "A short burst for one thing. Ten minutes still counts.", doors: ["stronger", "moving"], icon: "sparkle" },
});

export const ZONE2_ACTIVITIES = Object.freeze([
  { id: "walk",  label: "Walk" },
  { id: "run",   label: "Run" },
  { id: "cycle", label: "Ride" },
  { id: "row",   label: "Row" },
  { id: "swim",  label: "Swim" },
]);

/** Approved pools (draft §3). Easy: energyRequired 4 or under; hard: 6 or over. */
export const ZONE2_POOLS = Object.freeze({
  walk:  { easy: ["brisk-walk", "cardio-nordic-walking", "active-recovery-walk"], hard: ["gym-stair-climber-intervals", "gym-treadmill-incline-walk", "stair-climbing"] },
  run:   { easy: ["run-easy-30", "run-easy-20", "walk-run-intervals"],           hard: ["run-fartlek-25", "run-tempo-20", "run-hills", "run-intervals-400m"] },
  cycle: { easy: ["cycle-easy-spin", "cycle-recovery-spin"],                     hard: ["cycle-tempo-45", "cycle-hill-simulation", "cycle-intervals"] },
  row:   { easy: ["cardio-rowing-easy", "rower-easy-warmup"],                   hard: ["cardio-rowing-intervals"] },
  swim:  { easy: ["swim-easy-400"],                                              hard: ["swim-hard-200", "swim-descending-intervals"] },
});

/** Minutes for an easy day, by block and week within the block (draft §3). */
const ZONE2_EASY_MINS = [[20, 25, 30, 20], [25, 30, 35, 25], [30, 35, 40, 30]];

/**
 * The shape of a Zone 2 week: week 1 to 12, three blocks of four, the
 * fourth week of each easier. No hard day in weeks 1 to 4.
 */
export function zone2Week(week) {
  const w = Math.min(12, Math.max(1, Math.floor(Number(week) || 1)));
  const block = Math.ceil(w / 4);
  const inBlock = ((w - 1) % 4) + 1;
  return { week: w, block, easier: inBlock === 4, easyMins: ZONE2_EASY_MINS[block - 1][inBlock - 1], hardAllowed: w >= 5 };
}

/**
 * Order a pool: Not again out; liked first; then as listed; then what was
 * done recently (so the same three do not come back every time); less
 * often last.
 */
export function orderPool(ids, { byId, prefs = {}, liked = {}, recent = [] } = {}) {
  const ok = ids.filter(id => byId.has(id) && !HELD.includes(id) && prefs[id]?.preference !== "avoid");
  const rec = new Set(recent);
  const rank = id => (liked[id] ? 0 : prefs[id]?.preference === "less" ? 3 : rec.has(id) ? 2 : 1);
  return ok.map((id, i) => [id, i]).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).map(([id]) => id);
}

/**
 * A Zone 2 session. kind 'easy' is one continuous block (its first minutes
 * are the warm-up); 'hard' is 5 min easy, the hard session, 5 min easy.
 * minutes is what the person has; it caps the day's length.
 */
export function zone2Session({ activity, kind = "easy", week = 1, minutes = null, byId, available = () => true, prefs = {}, liked = {}, recent = [] }) {
  const pool = ZONE2_POOLS[activity];
  if (!pool) return null;
  const shape = zone2Week(week);
  // Kit first; when nothing fits, the pool as it is (they chose the activity, so they have its means).
  const fit = ids => { const o = orderPool(ids, { byId, prefs, liked, recent }); const k = o.filter(id => available(byId.get(id))); return k.length ? k : o; };
  const easyPool = fit(pool.easy), hardPool = fit(pool.hard);
  const easyId = easyPool[0];
  if (!easyId) return null;
  const cap = Number(minutes) > 0 ? Number(minutes) : null;
  const label = ZONE2_ACTIVITIES.find(a => a.id === activity)?.label || "Session";
  if (kind === "hard") {
    if (!shape.hardAllowed) return null;
    const hardId = hardPool[0];
    if (!hardId) return null;
    const total = Math.min(cap || 25, 30);
    const main = Math.max(10, total - 10);
    return labelled({
      id: `trend-zone2-hard-${activity}`, trend: "zone2", effort: "hard", name: `${label}: the harder day`,
      minutes: main + 10,
      steps: [{ id: easyId, mins: 5, note: "Easy, to warm up", swaps: easyPool }, { id: hardId, mins: main, note: "Hard", swaps: hardPool }, { id: easyId, mins: 5, note: "Easy, to finish", swaps: easyPool }],
    }, byId);
  }
  const mins = cap ? Math.min(cap, shape.easyMins) : shape.easyMins;
  return labelled({
    id: `trend-zone2-easy-${activity}`, trend: "zone2", effort: "easy", name: `${label}: an easy day`,
    minutes: mins, steps: [{ id: easyId, mins, note: "Easy the whole way", swaps: easyPool }],
  }, byId);
}

/** The movements of the last two trend sessions in the log, for orderPool's recent. */
export function recentTrendIds(log = []) {
  return log.filter(e => e && e.trend && e.status !== "partial").slice(-2).flatMap(e => e.exerciseIds || []);
}

/** Did a Zone 2 hard day already happen this week (Monday to today)? Reads the log's trend and effort (Schema v1.117). */
export function zone2HardDoneThisWeek(log = [], now = new Date()) {
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monday = new Date(day); monday.setDate(day.getDate() - ((day.getDay() + 6) % 7));
  return log.some(e => e && e.trend === "zone2" && e.effort === "hard"
    && Date.parse(e.completedAt || e.date) >= monday.getTime());
}

// ── Snacks (draft §4) ────────────────────────────────────────────────────

export const SNACK_QUALITIES = Object.freeze([
  { id: "legs",    label: "Legs",          door: "stronger" },
  { id: "pull",    label: "A pull",        door: "stronger" },
  { id: "middle",  label: "Your middle",   door: "stronger" },
  { id: "balance", label: "Balance",       door: "stronger" },
  { id: "breath",  label: "Out of breath", door: "moving" },
]);

/** Approved pools, easiest first; seated routes beside them. */
export const SNACK_POOLS = Object.freeze({
  legs:    { stand: ["sit-to-stand", "reverse-lunge", "glute-bridge", "hip-hinge-drill", "isometric-wall-sit", "chair-supported-calf-raise", "goblet-squat", "band-squat", "loop-band-squat", "bulgarian-split-squat"],
             seated: ["seated-leg-extension", "seated-hip-hinge", "seated-heel-toe-raise"] },
  pull:    { stand: ["band-row-seated", "band-pull-apart", "band-face-pull", "band-bent-over-row", "dumbbell-row", "kettlebell-row", "inverted-row-table", "seated-self-resisted-row", "rehab-shoulder-y-t-w"],
             seated: ["seated-self-resisted-row", "seated-scapular-retraction"] },
  middle:  { stand: ["dead-bug", "bird-dog", "side-plank-modified", "mcgill-curl-up", "plank", "side-plank-full", "plank-shoulder-tap"],
             seated: ["seated-dead-bug-arms", "seated-knee-lift", "seated-side-bend"] },
  balance: { stand: ["balance-single-leg-hold", "standing-hip-abduction", "y-balance-reach", "single-leg-calf-raise", "yoga-tree-pose", "single-leg-deadlift-rehab", "gym-balance-board-hold"],
             seated: [] },
  breath:  { stand: ["step-jacks", "skater-steps", "cross-body-knee-drive", "squat-to-reach", "step-back-burpee", "band-punches", "mountain-climbers"],
             seated: ["seated-punches", "seated-marching-cardio"] },
});

/**
 * A 10 or 15 minute snack: 1 min warm-up, then three different movements,
 * twice (10 min) or three times (15). The intervals snack is 30 s hard,
 * 30 s easy, eight or twelve times. available(entry) says whether the
 * person's kit allows an entry. No two movements of the same pattern in a
 * row; at most one liked movement.
 */
export function snackSession({ quality, minutes = 10, seated = false, byId, available = () => true, prefs = {}, liked = {}, recent = [] }) {
  const pool = SNACK_POOLS[quality];
  if (!pool) return null;
  const long = Number(minutes) >= 15;
  const ids = orderPool(seated ? pool.seated : pool.stand, { byId, prefs, liked: {}, recent }).filter(id => available(byId.get(id)));
  const likedFirst = ids.find(id => liked[id]);
  const ordered = likedFirst ? [likedFirst, ...ids.filter(id => id !== likedFirst)] : ids;
  // No two of the same pattern in a row where the pool allows it (not for
  // getting out of breath, where most moves share one); then fill to three.
  const chosen = [];
  const patternOf = id => byId.get(id)?.movementPattern;
  if (quality !== "breath") {
    for (const id of ordered) {
      if (chosen.length === 3) break;
      if (chosen.length && patternOf(chosen[chosen.length - 1]) === patternOf(id)) continue;
      chosen.push(id);
    }
  }
  for (const id of ordered) { if (chosen.length === 3) break; if (!chosen.includes(id)) chosen.push(id); }
  if (chosen.length < 2) return null;
  const warm = seated ? "seated-marching-cardio" : "marching-on-spot";
  const label = SNACK_QUALITIES.find(q => q.id === quality)?.label || "Snack";
  if (quality === "breath") {
    const n = long ? 12 : 8;
    const steps = [{ id: warm, mins: 1, note: "Warm up" }];
    for (let i = 0; i < n; i++) {
      steps.push({ id: chosen[i % chosen.length], mins: 0.5, note: "Hard", swaps: ids });
      steps.push({ id: warm, mins: 0.5, note: "Easy, until your breath settles" });
    }
    return labelled({ id: `trend-snack-breath-${n}`, trend: "snack", effort: "hard", name: `Snack: ${label.toLowerCase()}`, minutes: 1 + n, steps, snack: true }, byId);
  }
  const rounds = long ? 3 : 2;
  const per = 1.5;
  const steps = [{ id: warm, mins: 1, note: "Warm up" }];
  for (let r = 1; r <= rounds; r++) for (const id of chosen) steps.push({ id, mins: per, note: `Round ${r} of ${rounds}`, swaps: ids });
  return labelled({
    id: `trend-snack-${quality}-${rounds}`, trend: "snack", effort: "steady", name: `Snack: ${label.toLowerCase()}`,
    minutes: Math.round(1 + rounds * chosen.length * per), steps, snack: true,
    line: "The last few reps take effort.",
  }, byId);
}

// ── HILIT (HILIT draft §2 to §4) ─────────────────────────────────────────

/** Approved pools, easiest first; the three slider entries are held (P-18). */
export const HILIT_POOLS = Object.freeze({
  legs:   { stand: ["sit-to-stand", "reverse-lunge", "glute-bridge", "isometric-wall-sit", "hip-hinge-drill", "goblet-squat", "band-squat", "loop-band-squat", "bulgarian-split-squat"],
            seated: ["seated-leg-extension", "seated-heel-toe-raise"] },
  push:   { stand: ["press-up-incline", "band-chest-press", "band-overhead-press", "dumbbell-chest-press-floor", "dumbbell-overhead-press", "push-up", "press-up-decline"],
            seated: ["seated-wall-press", "seated-band-chest-press"] },
  pull:   { stand: ["inverted-row-table", "band-row-seated", "band-bent-over-row", "band-pull-apart", "dumbbell-row", "seated-self-resisted-row"],
            seated: ["seated-self-resisted-row", "seated-scapular-retraction"] },
  breath: { stand: ["step-jacks", "skater-steps", "cross-body-knee-drive", "squat-to-reach", "step-back-burpee", "band-punches", "mountain-climbers"],
            gym: ["gym-cross-trainer-intervals", "cardio-rowing-intervals", "gym-stair-climber-intervals"],
            seated: ["seated-punches", "seated-marching-cardio"] },
  middle: { stand: ["dead-bug", "bird-dog", "plank", "bear-hold", "side-plank-modified", "isometric-hollow-hold"],
            seated: ["seated-knee-lift", "seated-dead-bug-arms"] },
  carry:  { stand: ["farmers-carry", "suitcase-carry", "gym-kettlebell-suitcase-carry", "dumbbell-front-rack-carry"], seated: [] },
});

/** The shape of a HILIT week: work and rest in seconds, the most rounds, and whether it is the easier week. */
export function hilitWeek(week) {
  const w = Math.min(12, Math.max(1, Math.floor(Number(week) || 1)));
  const block = Math.ceil(w / 4), easier = ((w - 1) % 4) + 1 === 4;
  const [work, rest, most] = block === 1 ? [30, 30, 3] : block === 2 ? [40, 20, 3] : [40, 20, 4];
  return { week: w, block, easier, work, rest, rounds: easier ? most - 1 : most };
}

/**
 * Can a HILIT day be offered today? Two a week (Monday to Sunday) at most,
 * never on the day after another. Returns { ok, why }.
 */
export function hilitDayAllowed(log = [], now = new Date()) {
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monday = new Date(day); monday.setDate(day.getDate() - ((day.getDay() + 6) % 7));
  const yesterday = new Date(day); yesterday.setDate(day.getDate() - 1);
  const done = log.filter(e => e && e.trend === "hilit" && e.status !== "partial").map(e => Date.parse(e.completedAt || e.date)).filter(Number.isFinite);
  if (done.some(t => t >= yesterday.getTime())) return { ok: false, why: "You did HILIT yesterday or today. It works best with a day off between." };
  if (done.filter(t => t >= monday.getTime()).length >= 2) return { ok: false, why: "That\u2019s two HILIT days this week, which is plenty. The rest of the week is for something easier." };
  return { ok: true, why: "" };
}

/**
 * A HILIT session: 4 min warm-up, rounds of five stations (each worked for
 * the week's time with its rest after it), one easy minute between rounds,
 * then a cool-down. minutes (20, 30 or 40, from How long have you got?)
 * gives 2, 3 or 4 rounds, never more than the week allows.
 */
export function hilitSession({ week = 1, minutes = 30, place = "home", seated = false, byId, available = () => true, prefs = {}, liked = {}, recent = [] }) {
  const wk = hilitWeek(week);
  const want = Number(minutes) >= 40 ? 4 : Number(minutes) >= 30 ? 3 : 2;
  const rounds = Math.max(1, Math.min(want, wk.rounds));
  const used = new Set();
  const from = key => {
    const P = HILIT_POOLS[key];
    const list = seated ? P.seated : [...(place === "gym" && P.gym ? P.gym : []), ...P.stand];
    const ids = orderPool(list, { byId, prefs, liked, recent }).filter(id => {
      const e = byId.get(id); return e && e.impact !== true && e.movementPattern !== "jump" && available(e);
    });
    const id = ids.find(x => !used.has(x)) || null;
    if (id) used.add(id);
    return { id, pool: ids };
  };
  const legs = from("legs"), push = from("push"), pull = from("pull"), breath = from("breath"), middle = from("middle");
  const carry = seated ? { id: null, pool: [] } : from("carry");
  const fifth = carry.id ? carry : from("legs");
  if (!legs.id || !(push.id || pull.id) || !breath.id || !middle.id || !fifth.id) return null;
  const warm = seated ? "seated-marching-cardio" : "marching-on-spot";
  const w = wk.work / 60, r = wk.rest / 60;
  const steps = [{ id: warm, mins: 2, note: "Warm up, easy" }];
  if (!seated) steps.push({ id: "squat-to-reach", mins: 1, note: "Warm up, easy" }, { id: "step-jacks", mins: 1, note: "Warm up, easy" });
  else steps.push({ id: warm, mins: 2, note: "Warm up, easy" });
  for (let n = 1; n <= rounds; n++) {
    const upper = (n % 2 === 0 && pull.id) || !push.id ? pull : push;
    for (const s of [legs, upper, breath, middle, fifth]) {
      steps.push({ id: s.id, mins: w, note: `Round ${n} of ${rounds} \u00b7 ${wk.work} seconds, hard`, swaps: s.pool });
      steps.push({ id: warm, mins: r, note: `Rest, ${wk.rest} seconds` });
    }
    if (n < rounds) steps.push({ id: warm, mins: 1, note: "One easy minute" });
  }
  steps.push({ id: warm, mins: 1, note: "Cool down, easy" });
  if (!seated && byId.has("sport-cooldown-general")) steps.push({ id: "sport-cooldown-general", mins: 3, note: "Cool down" });
  const total = Math.round(steps.reduce((a, s) => a + s.mins, 0));
  return labelled({ id: `trend-hilit-${rounds}`, trend: "hilit", effort: "hard", name: "HILIT: hard work, no jumping", minutes: total, steps,
    line: "Hard comes from moving steadily for the whole burst, not from going faster." }, byId);
}

// ── Cross training (draft §5) ────────────────────────────────────────────

export const MAIN_ACTIVITIES = Object.freeze([
  { id: "run",     label: "Run" },
  { id: "cycle",   label: "Ride" },
  { id: "swim",    label: "Swim" },
  { id: "walk",    label: "Walk" },
  { id: "workout", label: "Strength" },
  { id: "yoga",    label: "Yoga or Pilates" },
]);

/** The swap table: what each main activity is offered on Mix it up. */
const SWAPS = Object.freeze({
  run:     [["An easy ride", ["cycle-easy-spin"]], ["An easy swim", ["swim-easy-400"]], ["An easy row", ["cardio-rowing-easy"]], ["The cross trainer", ["cross-trainer-easy-warmup"]]],
  cycle:   [["An easy walk", ["brisk-walk"]], ["An easy swim", ["swim-easy-400"]], ["A legs and middle snack", ["snack:legs", "snack:middle"]]],
  swim:    [["An easy walk", ["brisk-walk"]], ["An easy ride", ["cycle-easy-spin"]], ["A legs snack", ["snack:legs"]]],
  walk:    [["A legs and middle snack", ["snack:legs", "snack:middle"]], ["An easy ride", ["cycle-easy-spin"]], ["An easy swim", ["swim-easy-400"]]],
  workout: [["An easy walk", ["brisk-walk"]], ["An easy ride", ["cycle-easy-spin"]], ["An easy row", ["cardio-rowing-easy"]]],
  yoga:    [["An easy walk", ["brisk-walk"]], ["An easy ride", ["cycle-easy-spin"]], ["A legs snack", ["snack:legs"]]],
});

/**
 * The main activity from the log: the most common of the six over the last
 * four weeks. null when there are fewer than four, or a tie (the app then
 * asks once: What do you do most?).
 */
export function mainActivityFrom(log = [], now = new Date()) {
  const since = now.getTime() - 28 * 86400000;
  const map = { run: "run", cycle: "cycle", swim: "swim", walk: "walk", workout: "workout", yoga: "yoga" };
  const counts = {};
  let n = 0;
  for (const e of log) {
    const t = map[e?.type];
    if (!t || Date.parse(e.completedAt || e.date) < since) continue;
    counts[t] = (counts[t] || 0) + 1; n++;
  }
  if (n < 4) return null;
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted.length > 1 && sorted[0][1] === sorted[1][1] ? null : sorted[0][0];
}

/**
 * Mix it up: two or three choices for the main activity, each an easy
 * session about the length of the day it replaces (minutes, default 30).
 * available(entry) filters by kit; a choice needing kit the person does not
 * have is not offered. Never picks: the person chooses one.
 */
export function crossOptions({ main, minutes = 30, byId, available = () => true, prefs = {}, liked = {}, seated = false, recent = [] }) {
  const rows = SWAPS[main];
  if (!rows) return [];
  const out = [];
  for (const [label, parts] of rows) {
    if (out.length === 3) break;
    if (parts[0].startsWith("snack:")) {
      const snacks = parts.map(p => snackSession({ quality: p.slice(6), minutes: 10, seated, byId, available, prefs, liked, recent })).filter(Boolean);
      if (snacks.length !== parts.length) continue;
      const steps = snacks.flatMap(s => s.steps);
      out.push({ id: `trend-cross-${main}-${parts.join("-").replace(/snack:/g, "")}`, trend: "cross", effort: "steady", name: label, line: snacks[0].line,
                 minutes: snacks.reduce((a, s) => a + s.minutes, 0), steps });
      continue;
    }
    const id = parts[0];
    const e = byId.get(id);
    if (!e || HELD.includes(id) || prefs[id]?.preference === "avoid" || !available(e)) continue;
    const mins = id === "cardio-rowing-easy" ? Math.min(20, minutes) : minutes;
    out.push(labelled({ id: `trend-cross-${main}-${id}`, trend: "cross", effort: "easy", name: label, minutes: mins, steps: [{ id, mins, note: "Easy the whole way", swaps: [] }] }, byId));
  }
  return out;
}

/**
 * Progress's words for a Zone 2 week (draft §3). Never a score, a
 * percentage or a grade. null when no session this week was easy or hard.
 */
export function zone2WeekWords({ easy = 0, hard = 0 }) {
  if (!easy && !hard) return null;
  if (!hard) return "This week: all easy.";
  if (hard === easy) return "This week had as many hard days as easy ones. The plan works best when most days are easy.";
  if (hard > easy) return "This week had more hard days than easy ones. The plan works best when most days are easy.";
  return hard === 1 ? "This week: mostly easy, with one harder day." : "This week: mostly easy, with a few harder days.";
}
