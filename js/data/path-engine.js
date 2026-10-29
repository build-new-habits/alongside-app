/**
 * js/data/path-engine.js
 * 29 Oct 2026 v3
 *
 * v3 - STAGE PATH Session 5 (words only; a touch-once exception, recorded).
 *   Two E4 sentences said more than the app does (found before any was on
 *   screen). Graeme, 29 Oct, chose the true words: a low-energy day is
 *   "Shorter than usual, with more time to settle at the end" (what the
 *   builder does; was "Fewer rounds and longer rests"), and the line for
 *   nothing else to say is "Mixed up from your last few sessions" (the
 *   builder rotates; it does not promise no repeat). No rule changed.
 *
 * 28 Oct 2026 v2
 *
 * v2 - STAGE PATH Session 4 (words only; a touch-once exception, recorded in
 *   the blueprint). Home said "You said you're feeling struggling": a mood
 *   is now said as a person says it (said()): "you're struggling", "you're
 *   feeling low". Help me choose asks only about energy, so its reason says
 *   the energy, not "feeling okay" (the P-4a finding). No rule changed.
 *
 * 28 Oct 2026 v1
 *
 * STAGE PATH Session 3 (P-3 ENGINE; blueprint v3 Part E; P-9c part 2).
 * The Plan's adaptive engine, by rule. No AI, no network, no model: every
 * suggestion can be explained in one sentence from what the person told
 * the app (blueprint rule A5.18). Graeme, 27 Oct: "close to Down Dog, but
 * with the ability to save liked ones."
 *
 * PURE except noteSwap(), which writes through the store it is handed. It
 * chooses WHAT to ask for; session-builder.js buildSession() still builds
 * every session (one builder, rule A2.5). Its one reach into the builder
 * is applyPrefs(), called in pickFrom() for the Plan only.
 *
 * Guardrails kept (rules A5.19-21): the app points to adaptations and
 * never chooses one; no stretch target from a sore area (W5-14); a sore
 * area passes through the builder's own sore rules unchanged, the engine
 * only adds the sentences; SORE-THRESHOLD unchanged; the journal is never
 * read; "Bad" keeps the existing Bad-day choice (17 Aug).
 *
 * Nothing on screen reads this yet: Session 4 (Home, first open) and
 * Session 5 (door routes) do. tools/verify-path-engine.mjs drives it.
 */
import { PROGRAMMES } from "./feel-programmes.js";
import { ROUTINES } from "./stretch-routines.js";
import { EXERCISES, filterByConditions } from "./exercises/index.js";
import { PATH_MOVEMENTS } from "./exercises/path_movements.js";
import { STRANDS } from "./aims.js";
import { soreLevel, areaWords } from "./conditions.js";

const LIBRARY = [...EXERCISES, ...PATH_MOVEMENTS];
const BY_ID = new Map(LIBRARY.map(e => [e.id, e]));

/** The check-in's own words for its values (views/checkin.js). */
const ENERGY_WORDS = { 2: "running on empty", 3: "low", 6: "okay", 7: "good", 9: "full of it" };
const MOOD_WORDS = { 2: "struggling", 3: "low", 6: "okay", 7: "pretty good", 9: "great" };
/** A mood as a person says it: "you're struggling", "you're feeling low". */
const said = mood => (mood === 2 ? "you're struggling" : `you're feeling ${MOOD_WORDS[mood] || "okay"}`);

// ── E2. Today ────────────────────────────────────────────────────────────

/** The arc's purpose as a door: what most of its body strands' session types ask for. */
export function arcDoor(strandIds = []) {
  const toDoor = t => (["mobility", "stretch"].includes(t) ? "stretch" : t === "cardio" ? "moving" : "stronger");
  const votes = { stronger: 0, moving: 0, stretch: 0 };
  for (const id of strandIds || []) {
    const s = STRANDS[id];
    if (!s || s.kind !== "body" || !(s.sessionTypes || []).length) continue;
    votes[toDoor(s.sessionTypes[0])] += 1;
  }
  const best = Object.entries(votes).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : null;
}

const ARC_TYPE = { stronger: "full", moving: "full", stretch: "stretch" };

/**
 * suggestToday({ checkin, week, arcDoor, place, sore, likedNames, lessNames, neverNames, now })
 * checkin: { energy, mood } with the check-in's values, or null.
 * week: today's Your week day ({ name, mins, place, templateId }) or null.
 * sore: [{ id, score }] for areas named today.
 * Returns { door, feeling?, place, sessionType?, minutes, reason, adjustments[] }
 * or { route: "bad-day", reason } for a sore area at Bad.
 */
export function suggestToday({ checkin = null, week = null, arcDoor: door = null, place = "home", sore = [], likedNames = [], lessNames = [], neverNames = [], now = new Date() } = {}) {
  const bad = (sore || []).find(s => soreLevel(s.score) === "bad");
  if (bad) {
    return { route: "bad-day", reason: `You said your ${areaWords(bad.id)} is bad today, so today is the gentle choice, not a session.` };
  }
  const adjustments = adjustmentsFor({ checkin, sore, likedNames, lessNames, neverNames });
  const energy = checkin?.energy ?? null, mood = checkin?.mood ?? null;
  if (week) {
    return { door: week.door || door || "moving", place: week.place || place, minutes: week.mins || 25, fromWeek: true, templateId: week.templateId || null,
             reason: `It's ${week.name || "today's session"} in your week.`, adjustments };
  }
  if (energy === 2) return { door: "feel", feeling: "worn", place: null, minutes: 6, reason: "You said you're running on empty, so this is very gentle and short.", adjustments };
  if (mood === 2 || mood === 3) return { door: "feel", feeling: "calm", place: null, minutes: 15, reason: `You said ${said(mood)}, so this is slow and steady.`, adjustments };
  if (energy === 3) return { door: "moving", place, sessionType: "full", intensity: "light", minutes: 10, reason: "You said your energy is low, so this is short and light.", adjustments };
  const d = door || "moving";
  const minutes = (energy != null && energy >= 7) ? 35 : 25;
  const reason = checkin
    ? (d === door ? "It's the next step on what you're working towards." : "A steady session to keep you moving.")
    : "I haven't checked in with you today, so this is a steady one; tell me how you are and I'll fit it to you.";
  return { door: d, place: d === "stretch" ? null : place, sessionType: ARC_TYPE[d], minutes, reason, adjustments };
}

// ── E4. What I've adjusted ───────────────────────────────────────────────

/** The exact sentences of blueprint E4. Never empty. */
export function adjustmentsFor({ checkin = null, sore = [], likedNames = [], lessNames = [], neverNames = [] } = {}) {
  const out = [];
  const energy = checkin?.energy ?? null, mood = checkin?.mood ?? null;
  if (energy != null && energy <= 3) out.push("Shorter than usual, with more time to settle at the end");
  if (mood != null && mood <= 3) out.push("No countdown timers, go at your own pace");
  for (const s of sore || []) {
    const lvl = soreLevel(s.score);
    const area = areaWords(s.id);
    if (lvl === "quite-sore") {
      out.push(`Left out moves that load your ${area}`, `Easier options pointed out on cards that use your ${area}`, "A quick check halfway: still okay?");
    } else if (lvl === "a-little") {
      out.push("Easier options pointed out where something might niggle");
    }
  }
  const names = (likedNames || []).slice(0, 2);
  if (names.length === 2) out.push(`More of ${names[0]} and ${names[1]}, which you loved`);
  else if (names.length === 1) out.push(`More of ${names[0]}, which you loved`);
  if ((neverNames || [])[0]) out.push(`Left out ${neverNames[0]}, as you asked`);
  if ((lessNames || [])[0]) out.push(`Less of ${lessNames[0]}`);
  const seen = new Set();
  const list = out.filter(x => !seen.has(x) && seen.add(x));
  return list.length ? list : ["Mixed up from your last few sessions"];
}

// ── E3. Likes, recency ───────────────────────────────────────────────────

/**
 * Within a builder pool: liked movements first, when any fit and fewer
 * than two are already in the session, leaving out any done in either of
 * the last two sessions. With nothing liked, the pool comes back as it was
 * and no random number is drawn, so a session without likes is built
 * exactly as before.
 * ctx: { liked: { id: date }, recent: Set<id>, likedSoFar: number }
 */
export function applyPrefs(pool, { liked = {}, recent = new Set(), likedSoFar = 0 } = {}) {
  if (!Array.isArray(pool) || !liked || !Object.keys(liked).length || likedSoFar >= 2) return pool;
  const loved = pool.filter(e => e && liked[e.id] && !recent.has(e.id));
  return loved.length ? loved : pool;
}

/** The movement ids of the last two finished sessions. */
export function recentIds(log = []) {
  const done = (log || []).filter(e => e && e.status !== "partial" && Array.isArray(e.exerciseIds))
    .sort((a, b) => String(b.completedAt || "").localeCompare(String(a.completedAt || "")));
  return new Set(done.slice(0, 2).flatMap(e => e.exerciseIds));
}

/** Swap this one, on the Plan: a gentle "less often", never over a like or a "never". */
export function noteSwap(store, exerciseId) {
  if (!store || !exerciseId) return;
  if ((store.get("likedMovements") || {})[exerciseId]) return;
  const cur = (store.get("exercisePreferences") || {})[exerciseId];
  if (cur && cur.preference) return;
  store.setExercisePreference(exerciseId, "less", "swap");
}

// ── Programmes and routines ──────────────────────────────────────────────

export function programmesFor({ feeling, style = null, minutes = null } = {}) {
  return PROGRAMMES.filter(p => p.feeling === feeling && (!style || p.style === style) && (minutes == null || p.minutes <= minutes));
}

export function routinesFor({ area, style = null, minutes = null, floor = null } = {}) {
  return ROUTINES.filter(r => r.area === area && (!style || r.style === style) && (minutes == null || r.minutes <= minutes)
    && (floor !== false || r.floor === false || !!r.withoutFloor));
}

// ── P-9c part 2: the coach suggests a feeling, then a programme ──────────

/**
 * One feeling from today's check-in, in the person's own words; null with
 * no check-in (Help me choose asks one energy question instead).
 * Never Wake up after 6 pm, never Ready for sleep before 6 pm.
 */
export function suggestFeeling({ checkin = null, now = new Date() } = {}) {
  if (!checkin) return null;
  const evening = now.getHours() >= 18;
  const { energy, mood } = checkin;
  if (energy === 2) return { feeling: "worn", reason: "You said you're running on empty." };
  if (mood === 2 || mood === 3) return { feeling: "calm", reason: `You said ${said(mood)}.` };
  if (energy === 3) return evening
    ? { feeling: "sleep", reason: "You said your energy is low, and it's evening." }
    : { feeling: "wake", reason: "You said your energy is low." };
  // Help me choose asks only about energy: then the reason says the energy.
  const what = mood == null ? `You said your energy is ${ENERGY_WORDS[energy] || "okay"}` : `You said ${said(mood)}`;
  if (evening && now.getHours() >= 20) return { feeling: "sleep", reason: `${what}, and it's getting late.` };
  return { feeling: "ground", reason: `${what}.` };
}

/** How long have you got? The longest programme that fits, not one done recently when there is a choice. */
export function pickProgramme({ feeling, minutes, doneIds = [] } = {}) {
  const mine = PROGRAMMES.filter(p => p.feeling === feeling);
  if (!mine.length) return null;
  const fits = mine.filter(p => p.minutes <= minutes);
  if (!fits.length) {
    const shortest = [...mine].sort((a, b) => a.minutes - b.minutes)[0];
    return { programme: shortest, reason: `The shortest one here is ${shortest.minutes} minutes.` };
  }
  const fresh = fits.filter(p => !doneIds.includes(p.id));
  const pool = fresh.length ? fresh : fits;
  const best = [...pool].sort((a, b) => b.minutes - a.minutes)[0];
  return { programme: best, reason: `Fits the ${minutes} minutes you have.` };
}

/** Surprise me: any feeling that fits today; not done in the last seven days; within the length. */
export function pickSurprise({ checkin = null, now = new Date(), minutes = 20, doneIds = [], rng = Math.random } = {}) {
  const evening = now.getHours() >= 18;
  const pool = PROGRAMMES.filter(p => p.minutes <= minutes && !doneIds.includes(p.id)
    && !(p.feeling === "wake" && checkin?.energy === 2)
    && !(p.feeling === "sleep" && !evening)
    && !(p.feeling === "wake" && evening));
  if (!pool.length) return null;
  return { programme: pool[Math.floor(rng() * pool.length)], reason: "A surprise that fits today." };
}

// ── E5. A fresh one for me ───────────────────────────────────────────────

const HOLDS = new Set(["box-breathing", "box-breathing-extended", "four-seven-eight-breathing", "energising-breath", "alternate-nostril-breathing"]);
const STILL = /^(breath|breath-awareness|grounding|body-scan)$/;
const OPENERS = new Set(["tc-opening-stance", "qg-tapping", "neck-mobility", "feet-on-floor-grounding", "qg-closing-breath"]);
const RESTS = new Set(["yoga-corpse-pose", "childs-pose", "tc-closing", "qg-closing-breath", "yoga-legs-up-wall", "feet-on-floor-grounding"]);

/** Hard limits per feeling (blueprint E5). Never relaxed to fill a slot. */
export const FRESH_LIMITS = Object.freeze({
  ground: { positions: ["standing", "seated", "any"], min: 6, max: 15, maxEnergy: 5 },
  calm:   { positions: ["standing", "seated", "floor", "any"], min: 6, max: 20, maxEnergy: 5 },
  worn:   { positions: ["seated", "floor", "any"], min: 5, max: 8, maxEnergy: 3, noBalance: true, noFurther: true },
  wake:   { positions: ["standing", "seated", "floor", "any"], min: 6, max: 20, maxEnergy: 7, noTwoLying: true },
  sleep:  { positions: ["seated", "floor", "any"], min: 6, max: 15, maxEnergy: 4, never: ["qg-heel-drops", "qg-tapping", "yoga-sun-salutation-b"] },
});

const half = x => Math.round(x * 2) / 2;
function pickOne(list, rng, liked, likedLeft) {
  if (!list.length) return null;
  if (likedLeft > 0) {
    const loved = list.filter(e => liked[e.id]);
    if (loved.length) return loved[Math.floor(rng() * loved.length)];
  }
  return list[Math.floor(rng() * list.length)];
}

/**
 * freshSequence({ feeling, minutes, never, liked, less, recent, avoidFor, rng })
 * never: Set of ids the person never wants; less: Set offered only when
 * nothing else fits; recent: Set from the last two sessions (weighted
 * down); avoidFor: today's sore-area condition ids (the builder's own
 * filterByConditions, unchanged). Returns
 *   { feeling, minutes, steps: [{ id, mins, role }], further: [], fresh: true }
 * or, when the pool cannot fill it inside the limits,
 *   { fallback: true, programme, message }.
 */
export function freshSequence({ feeling, minutes = 10, never = new Set(), liked = {}, less = new Set(), recent = new Set(), avoidFor = [], rng = Math.random } = {}) {
  const L = FRESH_LIMITS[feeling];
  if (!L) return null;
  const target = Math.min(L.max, Math.max(L.min, Math.round(minutes)));
  let pool = LIBRARY.filter(e => (e.doors || []).includes("feel") && (e.feelings || []).includes(feeling)
    && !never.has(e.id) && !HOLDS.has(e.id) && !(L.never || []).includes(e.id)
    && L.positions.includes(e.position)
    && !(L.noBalance && e.balanceDemand)
    && (e.energyRequired || 1) <= L.maxEnergy
    && !(e.contentType === "practice" && (e.duration || 0) >= 600)
    && !/^(yoga-flow|pilates-sequence)$/.test(e.movementPattern || ""));
  if (avoidFor && avoidFor.length) pool = filterByConditions(pool, avoidFor).safe;
  const prefer = list => {
    const fresh = list.filter(e => !recent.has(e.id) && !less.has(e.id));
    return fresh.length ? fresh : list.filter(e => !less.has(e.id)).length ? list.filter(e => !less.has(e.id)) : list;
  };
  const isStill = e => STILL.test(e.movementPattern || "");
  const arriveList = prefer(pool.filter(e => isStill(e) || OPENERS.has(e.id)));
  const settleList = prefer(pool.filter(e => isStill(e) || RESTS.has(e.id)));
  const nMiddle = target <= 6 ? 3 : target <= 12 ? 4 : 5;
  let likedLeft = 2;
  const used = new Set();
  const take = (list) => {
    const e = pickOne(list.filter(x => !used.has(x.id)), rng, liked, likedLeft);
    if (!e) return null;
    used.add(e.id); if (liked[e.id]) likedLeft--;
    return e;
  };
  const arrive = take(arriveList);
  // The settle is chosen now and held, so the middle cannot use it up.
  const settle = take(settleList.filter(x => !arrive || x.id !== arrive.id));
  const middle = [];
  for (let i = 0; i < nMiddle; i++) {
    let list = prefer(pool.filter(x => !isStill(x) && !used.has(x.id)));
    const before = middle.length ? middle.at(-1) : arrive;
    if (L.noTwoLying && before?.position === "floor") list = list.filter(x => x.position !== "floor");
    if (L.noTwoLying && i === nMiddle - 1 && settle?.position === "floor") list = list.filter(x => x.position !== "floor");
    const x = take(list);
    if (!x) break;
    middle.push(x);
  }
  if (!arrive || !settle || middle.length < 3) return fallbackFor(feeling, target);
  if (L.noTwoLying && middle.at(-1).position === "floor" && settle.position === "floor") return fallbackFor(feeling, target);
  return finish(feeling, target, arrive, middle, settle);
}

function finish(feeling, target, arrive, middle, settle) {
  const ends = target <= 6 ? 1 : 1.5;
  const midTotal = target - 2 * ends;
  // Round each down to the half minute; the last takes what is left, so
  // the total is exact and no movement is shorter than a minute.
  const each = Math.max(1, Math.floor((midTotal / middle.length) * 2) / 2);
  const mids = middle.map(() => each);
  mids[mids.length - 1] = half(midTotal - each * (middle.length - 1));
  const steps = [
    { id: arrive.id, mins: ends, role: "arrive" },
    ...middle.map((e, i) => ({ id: e.id, mins: mids[i], role: "middle" })),
    { id: settle.id, mins: ends, role: "settle" },
  ];
  return { feeling, minutes: target, steps, further: [], fresh: true,
           line: "I'll put together something new, inside the same gentle rules." };
}

function fallbackFor(feeling, target) {
  const mine = PROGRAMMES.filter(p => p.feeling === feeling);
  const nearest = [...mine].sort((a, b) => Math.abs(a.minutes - target) - Math.abs(b.minutes - target))[0] || null;
  return { fallback: true, programme: nearest,
           message: nearest ? `There isn't enough for a fresh one here yet, so here's ${nearest.name}.` : "There isn't enough for a fresh one here yet." };
}

/** Stretch areas to the builder's stretch zones (blueprint D4). */
export const STRETCH_AREA_ZONES = Object.freeze({
  "whole": [], "neck-shoulders": ["neck-shoulders"],
  "back-hips": ["upper-back", "lower-back", "hips"], "legs": ["hamstrings", "quads", "calves-ankles"],
});

/** Stretch's fresh one is the builder's own stretch session for the area (E5). */
export function freshStretchRequest({ area = "whole", minutes = 15, floor = true } = {}) {
  return { sessionType: "stretch", zones: [...(STRETCH_AREA_ZONES[area] || [])], durationMins: minutes, floor };
}

// ── For the routes (Sessions 4 and 5) ────────────────────────────────────

/** Where a suggestion goes, and what it carries. */
export function buildRequest(s, minutes = null) {
  if (!s) return null;
  if (s.route === "bad-day") return { route: "bad-day", params: {} };
  const mins = minutes ?? s.minutes;
  if (s.door === "feel") return { route: "path", params: { door: "feel", feeling: s.feeling, minutes: mins } };
  return { route: "coach-proposal", params: { requestedSessionType: s.sessionType || "full", requestedLocation: s.place || null, minutes: mins } };
}

/** A movement's name for the sentences, from the library. */
export function movementName(id) { return (BY_ID.get(id) || {}).name || null; }
