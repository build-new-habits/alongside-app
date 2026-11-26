/**
 * js/data/age-version.js
 * 26 Nov 2026 v1
 *
 * P-41 THREE AGE VERSIONS, S2 RULES (spec BNH-Files Product/alongside_p41_
 * three-age-versions_spec_25nov2026_v2.md, approved by Graeme 25 Nov). One
 * place for every way the 16-17 version differs from the adult one, as
 * tier-table.js is for the tiers. Each screen that differs asks here, never
 * the age itself. Everything not listed is the same, and safety is never
 * weaker for anyone.
 *
 *   1  Weight: never asked, tracked or shown; no weight target (so Lose
 *      weight, which needs weight tracking, is never offered).
 *   2  Where to get help: Childline and Shout first, a trusted adult named,
 *      then Samaritans, 111 and 999.
 *   3  Sore areas: knee, heel and back-of-the-heel pain that keeps coming
 *      back in a growing body is worth showing a GP or physio.
 *   4  Hard training: with the talk test (as for everyone), and no more
 *      than two hard days a week, across every trend and Your week.
 *   5  In Step: Coming soon, until P-42's programme for 14-17 is written
 *      and read. Never offered at the finish.
 *   6  Messages, the survey, Share my figures and news: off.
 *   7  Buying the Plan: not in the app; a parent or carer buys a place.
 *
 * The 14-15 version (young-14) is closed until its own reads; its rules
 * come with it. While it is closed nobody is in it.
 */
import { store } from "../store.js";

/** The version this phone is in: "adult", "young-16", or null (not let in). */
export function ageGroupNow() {
  const c = store.get("consent") || {};
  if (c.ageConfirmed !== true) return null;
  return c.ageGroup === "young-16" ? "young-16" : "adult";
}

/** True for the 16-17 version. */
export const isYoung = () => ageGroupNow() === "young-16";

// 1. Weight.
export const weightAllowed = () => !isYoung();

// 2. Where to get help. Checked on the organisations' own sites, as
// support-lines.js and views/under-18.js: Childline 0800 1111 (under 19),
// Shout text SHOUT to 85258, Samaritans 116 123, NHS 111, 999.
export const YOUNG_SUPPORT_LINES = Object.freeze([
  { name: "Childline", what: "free, any time, for anyone under 19", label: "call 0800 1111", href: "tel:08001111" },
  { name: "Shout", what: "free, any time, by text", label: "text SHOUT to 85258", href: "sms:85258?&body=SHOUT" },
  { name: "Samaritans", what: "free, any time, about anything", label: "call 116 123", href: "tel:116123" },
  { name: "NHS 111", what: "urgent help that isn’t an emergency, including for your mental health", label: "call 111", href: "tel:111" },
  { name: "In an emergency", what: "", label: "call 999", href: "tel:999" },
]);
export const YOUNG_SUPPORT_LEDE = "These are free and confidential. You don’t need a reason. A trusted adult, like a parent, carer or teacher, can help too.";

// 3. Sore areas in a growing body.
export const GROWTH_AREAS = Object.freeze(["knee", "plantar-fasciitis", "achilles"]);
const GROWTH_WORDS = { knee: "knee", "plantar-fasciitis": "heel", achilles: "heel" };
export function growthNote(areaId) {
  if (!isYoung() || !GROWTH_AREAS.includes(areaId)) return "";
  return `If your ${GROWTH_WORDS[areaId]} keeps hurting, show it to a GP or physio: bodies that are still growing can need a check.`;
}

// 4. Hard training.
export const HARD_DAYS_MOST = 2;
export const hardDaysMost = () => (isYoung() ? HARD_DAYS_MOST : Infinity);
export const HARD_DAYS_LINE = "Two hard days a week at most at your age.";
/** A finished session that was hard work: a hard trend day, or a hard effort. */
export const wasHard = e => !!e && e.status !== "partial" && (e.trend === "hilit" || e.trend === "hybrid" || e.effort === "hard");
/** Hard days done this week (Monday to Sunday), each day once. */
export function hardDaysThisWeek(log = [], now = new Date()) {
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monday = new Date(day); monday.setDate(day.getDate() - ((day.getDay() + 6) % 7));
  const days = new Set(log.filter(wasHard).map(e => new Date(e.completedAt || e.date)).filter(d => !isNaN(d) && d >= monday).map(d => d.toDateString()));
  return days.size;
}
/** Can a hard day be offered today? { ok, why }. Adults: always (each trend keeps its own rule). */
export function hardDayAllowed(log = [], now = new Date()) {
  if (!isYoung()) return { ok: true, why: "" };
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toDateString();
  const doneToday = log.some(e => wasHard(e) && new Date(e.completedAt || e.date).toDateString() === today);
  if (!doneToday && hardDaysThisWeek(log, now) >= HARD_DAYS_MOST) return { ok: false, why: "That’s two hard days this week, which is the most at your age. The rest of the week is for something easier." };
  return { ok: true, why: "" };
}
/** Hard days a Your week shape asks for. */
export function hardDaysInWeek(shape) {
  const t = shape?.templates || {}, d = shape?.days || {};
  return Object.values(d).filter(id => t[id]?.intensity === "hard").length;
}

// 5. In Step.
export const inStepOpen = () => !isYoung();
export const IN_STEP_SOON = "In Step for your age is coming soon. It’s being written with young people.";

// 6. Messages, the survey, Share my figures, news.
export const messagesAllowed = () => !isYoung();

// 7. Buying the Plan.
export const canBuy = () => !isYoung();
export const BUY_YOUNG_LINE = "At your age the Plan isn’t bought here. A parent or carer can buy a place for you, and they won’t see anything you do.";
