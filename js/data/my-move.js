/**
 * data/my-move.js
 * 23 Nov 2026 v5
 *
 * v5 - S6 QUIET HOME (Graeme, 23 Nov: It's a hard day and Change what
 *   Alongside is for off Home; "be exceptional"). askHardToday(): one
 *   question on Home when the check-in's mood is Low (an in-between day:
 *   not hard by the S3 rule), until answered for today. reviewDue() and
 *   setReviewed(): Still what you want Alongside for? once at each
 *   twelve-week turn of an arc (weeks 12, 24, ...).
 *
 * v4 - S5 CLOSE. startItems(): Start your Plan on Home, Making my Move
 *   first (P-35 folded in): Making my Move, Set what you're working
 *   towards, Plan your week, Add exercises from your physio or trainer;
 *   each says when it is done and can be done again. Shown until closed,
 *   never on a hard day.
 *
 * v3 - S4 AIM AND SUGGESTIONS. AIMS_FOR: for each purpose, the arc aims
 *   (data/aims.js, none held) that fit it, in order; aimsForMost() puts
 *   them first where the arc asks "What do you want to be able to do?".
 *   The arc's own questions stay (being asked is the Plan's experience,
 *   ARC-3-SETUP); Making my Move leads the choice and does not make it.
 *   suggestion(): a door not on Home, started five or more times in the
 *   last 30 days (activityLog door), not said no to; only with "my doors".
 *
 * v2 - S3 HOME. homeDay(): Making my Move not yet made, a good day or a
 *   hard day (the check-in: energy at Low or below, or mood at Struggling;
 *   or the person's own word today on Home, which wins); a sore area at Bad
 *   keeps the usual Home, where its own choice comes first. setToday().
 *   True words: the gentle stretch and the short walk said ten and fifteen
 *   minutes, sitting; Home opens the Stretch door and the walk, which ask.
 *
 * P-39 MAKING MY MOVE, S2 (spec docs/specs/alongside_making-my-move_23nov2026_v1.md
 * sections 2, 3 and 7). The words, the seeding from getting started, and
 * what Home would show: one place, read by the screens (views/my-move.js)
 * and, from S3, by Home. Rule-based; nothing leaves the phone.
 *
 * The stored record is store.myMove (store.js v125), written only through
 * store.setMyMove().
 */

import { store } from "../store.js";
import { checkinToday } from "./path-context.js";
import { arcWeek } from "./arc-readback.js";

/** What it can be for, in the order the screen lists them (spec section 2). */
export const PURPOSES = [
  { id: "stronger", title: "Get stronger, standing or sitting", short: "Get stronger", line: "Strength at home or the gym, including holds", kind: "amber", icon: "strength", door: true,
    figure: "seated-wall-press", taste: "Press your hands into the wall and hold. Breathe normally. You choose how hard." },
  { id: "moving", title: "Keep moving", short: "Keep moving", line: "Walks, runs, rides, swims and cardio", kind: "blue", icon: "walk", door: true,
    figure: "brisk-walk", taste: "A brisk ten minutes counts. Notice your breathing settle into a rhythm." },
  { id: "stretch", title: "Stretch and loosen up", short: "Stretch", line: "Ease stiffness, sitting or on the floor", kind: "violet", icon: "mobility", door: true,
    figure: "cat-cow", taste: "Ease in to a gentle pull, about three out of ten. Stop if it pinches." },
  { id: "feel", title: "Move to feel better", short: "Move to feel better", line: "Tai chi, qigong and gentle movement", kind: "green", icon: "heart", door: true,
    figure: "tc-weight-shift", taste: "Shift your weight slowly from one foot to the other, like water settling." },
  { id: "yoga", title: "Yoga and Pilates", short: "Yoga and Pilates", line: "As sessions of their own", kind: "violet", icon: "yoga",
    figure: "yoga-mountain-pose", taste: "Lengthen up through the crown of your head, then let your shoulders drop." },
  { id: "calm", title: "Calm my mind", short: "Calm my mind", line: "A row on Home for breathing and mindful practice", kind: "green", icon: "breath",
    figure: "belly-breathing", taste: "Breathe in for four, out for six. Just a few times." },
  { id: "trend", title: "Follow a fitness trend", short: "Fitness trends", line: "Zone 2, HILIT, hybrid and more", kind: "amber", icon: "sparkle",
    figure: null, taste: "Zone 2: you can talk in full sentences, but you know you're working." },
  { id: "instep", title: "Understand other people", short: "In Step", line: "In Step: a few minutes after a session", kind: "orchid", icon: "instep",
    figure: null, taste: "Think of someone who arrived at today tired. What might have helped them?" },
];

export const DOOR_IDS = ["stronger", "moving", "stretch", "feel"];

/** On a hard day (spec section 2). Holds wait for P-38's content. */
export const HARD = [
  { id: "coach",   title: "Let the coach pick something gentle", line: "One easy plan, built from your check-in", kind: "teal",   icon: "choose" },
  { id: "stretch", title: "A gentle stretch",                    line: "Sitting or standing, as you like",                    kind: "violet", icon: "mobility" },
  { id: "walk",    title: "A short walk",                        line: "Any length, any pace",               kind: "blue",   icon: "walk" },
  { id: "holds",   title: "A few seated holds",                  line: "Strength without moving much",            kind: "amber",  icon: "strength", offered: false },
  { id: "calm",    title: "Calm my mind",                        line: "Breathing, sitting still",                kind: "green",  icon: "breath" },
  { id: "rest",    title: "Rest, and that's fine",               line: "Home says so, and nothing else",          kind: "slate",  icon: "rest" },
];
export const HARD_OFFERED = HARD.filter(h => h.offered !== false);

export const GOOD = [
  { id: "one", title: "Just tell me what to do",       line: "One plan from your check-in. One tap to start." },
  { id: "few", title: "The coach's pick and my doors", line: "The doors you chose, nothing else." },
  { id: "all", title: "Show me everything",            line: "All four doors, every day." },
];

export const purposeById = id => PURPOSES.find(p => p.id === id) || null;

/** Getting started's goals, read as purposes (spec section 2: only what they said, and In Step). */
const FROM_GOALS = {
  stronger: ["get-stronger", "build-muscle", "strength-fitness", "tone-up", "lose-weight"],
  moving:   ["improve-cardio", "running-cardio", "start-running", "run-5k", "run-10k", "cycling", "swimming", "move-more", "more-energy", "return-to-fitness"],
  stretch:  ["flexibility", "mobility-recovery", "balance", "improve-posture", "prevent-injury", "reduce-pain"],
  feel:     ["feel-better", "feel-and-energy", "improve-mood"],
  calm:     ["reduce-stress", "sleep-better"],
};

export function seedPurposes(goals = store.get("goals") || []) {
  const ids = (goals || []).map(g => (typeof g === "string" ? g : g && g.id)).filter(Boolean);
  const out = PURPOSES.map(p => p.id).filter(id => (FROM_GOALS[id] || []).some(g => ids.includes(g)));
  out.push("instep");
  return out;
}

/**
 * The record as the screens use it. The first time (nothing made, nothing
 * started, nothing ticked) it is seeded from getting started and saved, so
 * stopping part way keeps it (spec section 6).
 */
export function myMoveForScreens() {
  const m = store.get("myMove") || store.cleanMyMove(null);
  if (!m.made && !m.step && !m.purposes.length) {
    const purposes = seedPurposes();
    store.setMyMove({ purposes, most: purposes.length === 1 ? purposes[0] : (purposes.find(id => id !== "instep") || null) });
    return store.get("myMove");
  }
  return m;
}

/** The doors Home shows on a good day (spec section 3). */
export function goodDayDoors(m) {
  if (!m || m.goodDay === "one") return [];
  if (m.goodDay === "all") return DOOR_IDS.slice();
  const d = DOOR_IDS.filter(id => m.purposes.includes(id));
  if (m.purposes.includes("yoga") && !d.includes("stretch") && !d.includes("feel")) d.push("stretch");
  return d;
}

/** What the live preview says, as one sentence for a screen reader. */
export function previewSentence(m, hard = false) {
  if (hard) {
    const h = (m.hardDay || []).map(id => HARD.find(x => x.id === id)?.title).filter(Boolean);
    if (m.hardDay.includes("rest")) return "On a hard day, Home will say: Rest, and that's fine.";
    return "On a hard day, Home will show: " + (h.length ? h.join(", ") : "Let the coach pick something gentle") + ".";
  }
  const parts = ["Let me choose for you", ...goodDayDoors(m).map(id => purposeById(id).short)];
  if (m.purposes.includes("calm")) parts.push("Calm my mind");
  return "Home will show: " + parts.join(", ") + ".";
}

/**
 * S3. Which Home today: "unmade" (Making my Move not done), "good" or
 * "hard" (spec section 3). The person's own word today wins; otherwise the
 * check-in: energy 3 or lower (Low, Running on empty) or mood 2 or lower
 * (Struggling). A sore area at Bad keeps the usual Home (its own Rest or
 * Something gentler choice comes first).
 */
export function hardFromCheckin(c = checkinToday()) {
  return !!c && ((c.energy != null && c.energy <= 3) || (c.mood != null && c.mood <= 2));
}
export function homeDay({ badSore = false } = {}) {
  const m = store.get("myMove");
  if (!m || !m.made) return "unmade";
  if (badSore) return "good";
  const said = m.day && m.day.date === store._localDay() ? m.day.mode : null;
  if (said === "usual") return "good";
  if (said === "hard") return "hard";
  return hardFromCheckin() ? "hard" : "good";
}
/** S3. It's a hard day / Show my usual Home, for today only. */
export function setToday(mode) {
  store.setMyMove({ day: { date: store._localDay(), mode } });
}

/** S4. The arc aims that fit each purpose, in the order they are offered. */
export const AIMS_FOR = {
  stronger: ["lift-heavier", "stronger-core", "stay-independent", "carry-shopping"],
  moving:   ["walk-further", "run-5k-nonstop", "ride-swim-further", "outdoors-more"],
  stretch:  ["flexible-again", "desk-comfort", "neck-shoulders-ease", "reach-overhead"],
  feel:     ["steadier-in-myself", "energy-through-day", "sleep-better", "kinder-to-myself"],
  yoga:     ["flexible-again", "steadier-in-myself"],
  calm:     ["steadier-in-myself", "sleep-better", "kinder-to-myself"],
  trend:    ["lift-heavier", "faster", "run-further"],
  instep:   ["meet-people-better", "with-others"],
};

/** S4. The aim ids to offer first, from what matters most (none if not made). */
export function aimsForMost() {
  const m = store.get("myMove");
  return m && m.made && m.most ? (AIMS_FOR[m.most] || []).slice() : [];
}

/** S4. Whether Home should offer the arc next: made, something matters most, no arc yet. */
export function arcNext() {
  const arc = store.get("arc") || {};
  return aimsForMost().length > 0 && !(arc.active && arc.aimId);
}

/**
 * S4. One door to suggest putting on Home, or null (spec section 4): not on
 * Home, started five or more times in the last 30 days, never said no to.
 * Only when Home shows "my doors" (the other two choices show none or all).
 */
export function suggestion(now = new Date()) {
  const m = store.get("myMove");
  if (!m || !m.made || m.goodDay !== "few") return null;
  const onHome = goodDayDoors(m);
  const since = now.getTime() - 30 * 864e5;
  const counts = {};
  for (const e of store.get("activityLog") || []) {
    const t = new Date(e.completedAt || e.loggedAt || e.date || 0).getTime();
    if (!DOOR_IDS.includes(e.door) || !(t >= since && t <= now.getTime())) continue;
    counts[e.door] = (counts[e.door] || 0) + 1;
  }
  const id = DOOR_IDS.find(d => !onHome.includes(d) && !m.dismissed.includes(d) && (counts[d] || 0) >= 5);
  return id ? { id, count: counts[id] } : null;
}

/** S5. Start your Plan (spec section 3; P-35 folded in): what to do first, in order. */
export function startItems() {
  const m = store.get("myMove") || {};
  const arc = store.get("arc") || {};
  return [
    { id: "my-move", label: "Making my Move", done: !!m.made, action: "mm-open", guide: "mm-open" },
    { id: "arc", label: "Set what you're working towards", done: !!(arc.active && arc.aimId), action: "mm-arc" },
    { id: "week", label: "Plan your week", done: !!store.get("weekShape"), action: "mm-week" },
    { id: "own", label: "Add exercises from your physio or trainer", done: (store.get("prescribedExercises") || []).length > 0, action: "mm-own" },
  ];
}
/** S5. Start your Plan shows until closed. */
export const startOpen = () => !(store.get("myMove") || {}).startClosed;

/**
 * S6. An in-between day: the check-in's mood is Low (3), and it is not a
 * hard day by the S3 rule. Asked once, until answered for today (the
 * answer is today's word, as It's a hard day / Show my usual Home).
 * Never with a sore area at Bad (that asks its own question first).
 */
export function askHardToday({ badSore = false } = {}) {
  const m = store.get("myMove") || {};
  if (!m.made || badSore) return false;
  if (m.day && m.day.date === store._localDay()) return false;
  const c = checkinToday();
  return !!c && !hardFromCheckin(c) && c.mood === 3;
}

/** S6. The twelve-week turn an arc is at: 1 from week 12, 2 from week 24; 0 before. */
export function reviewBlock(arc = store.get("arc") || {}, now = new Date()) {
  if (!arc.active || !arc.aimId || !arc.startedAt) return 0;
  return Math.floor((arcWeek(arc, now) || 0) / 12);
}
/** S6. Still what you want Alongside for? Once at each turn, until answered. */
export function reviewDue(now = new Date()) {
  const m = store.get("myMove") || {};
  if (!m.made || startOpen()) return false;   // while Start your Plan shows, Making my Move is already on it
  const arc = store.get("arc") || {};
  const block = reviewBlock(arc, now);
  if (!block) return false;
  const r = m.review;
  return !(r && r.arc === arc.startedAt && r.block >= block);
}
export function setReviewed(now = new Date()) {
  const arc = store.get("arc") || {};
  const block = reviewBlock(arc, now);
  if (block) store.setMyMove({ review: { arc: arc.startedAt, block } });
}
