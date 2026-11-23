/**
 * data/my-move.js
 * 23 Nov 2026 v1
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
  { id: "stretch", title: "A gentle stretch",                    line: "Ten minutes, sitting",                    kind: "violet", icon: "mobility" },
  { id: "walk",    title: "A short walk",                        line: "Fifteen minutes, any pace",               kind: "blue",   icon: "walk" },
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
