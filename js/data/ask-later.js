/**
 * js/data/ask-later.js
 * 24 Nov 2026 v1
 *
 * P-46 FREE-AND-FIRST, S3 ASK LATER (spec
 * docs/specs/alongside_free-and-first_24nov2026_v1.md, v2, section 4).
 * Both tiers. For someone who came through the one-minute start
 * (onboarding.flow "short"), three things the old conversation asked up
 * front are asked once, later, as a small card on Home:
 *
 *   activity  after the first finished session  How active have you been lately?
 *             (the old step 9's five answers; Coming back after a break asks
 *             From what? next, with the health consent only, as step 9e)
 *   goals     after the third, Free only        What do you most want from this?
 *             (up to three; the Plan has Making my Move for this)
 *   weekly    a week after getting started      How many times a week feels realistic?
 *             (the old step 12's answers; writes setAt, as step 12 did)
 *
 * Rules: never on a hard day (the check-in's rule, data/my-move.js); at most
 * one question a day (once one is shown, only it shows until tomorrow); Not
 * now is final for that question (Settings keeps every answer); only an
 * unanswered question is asked; only for the short start (the old
 * conversation asked these up front, and its skips stand). The card is on
 * Home only, so it is never asked before a session.
 *
 * Writes the same fields and values as the old conversation's steps.
 */

import { store } from "../store.js";
import { ACTIVITY_CHIPS, RETURNING_AFTER_CHIPS, FREQUENCY_CHIPS, healthAnswersAllowed } from "./onboarding-thread-data.js";
import { hardFromCheckin } from "./my-move.js";

export const GOAL_CHOICES = [
  ["feel-better", "Feel better day to day"], ["more-energy", "Have more energy"], ["reduce-stress", "Reduce stress"],
  ["get-stronger", "Get stronger"], ["flexibility", "Improve flexibility"], ["balance", "Improve balance"],
  ["start-running", "Start running"], ["enjoy-exercise", "Actually enjoy exercise"]
];
export const GOALS_MAX = 3;

const QUESTIONS = {
  activity: { q: "How active have you been lately?", chips: ACTIVITY_CHIPS.map(c => [c.id, c.label]) },
  returning: { q: "Coming back from what?", chips: RETURNING_AFTER_CHIPS.map(c => [c.id, c.label]) },
  goals: { q: "What do you most want from this?", line: `Pick up to ${GOALS_MAX}.`, chips: GOAL_CHOICES, multi: true },
  weekly: { q: "How many times a week feels realistic?", chips: FREQUENCY_CHIPS.map(c => [c.id, c.label]) }
};

const today = (now = new Date()) => store._localDay(now);
const dayOf = iso => { try { return iso ? store._localDay(new Date(iso)) : null; } catch { return null; } };
const finished = () => store.completedSessions(store.get("activityLog") || []).length;

function open(id) {
  const r = (store.get("askLater") || {})[id];
  return !r || (!r.answeredAt && !r.notNowAt);
}
function stillUnanswered(id) {
  if (id === "activity") return !store.get("lifestyle.activityLevel") && !store.get("fitnessLevel");
  if (id === "goals") return (store.get("goals") || []).length === 0;
  if (id === "weekly") return !store.get("strategicGoal.setAt");
  return false;
}
function ready(id, now) {
  if (id === "activity") return finished() >= 1;
  if (id === "goals") return store.get("tier") !== "personal" && finished() >= 3;
  if (id === "weekly") {
    const since = store.get("onboarding.threadCompletedAt");
    return !!since && (now - new Date(since)) >= 7 * 864e5;
  }
  return false;
}

/** Which question, if any, Home asks now. */
export function dueAskLater(now = new Date()) {
  if (store.get("onboarding.flow") !== "short") return null;
  if (hardFromCheckin()) return null;
  const al = store.get("askLater") || {};
  const shownToday = ["activity", "goals", "weekly"].find(id => dayOf(al[id]?.shownAt) === today(now));
  if (shownToday) return open(shownToday) && stillUnanswered(shownToday) ? shownToday : null;
  return ["activity", "goals", "weekly"].find(id => open(id) && stillUnanswered(id) && ready(id, now)) || null;
}

const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The card for one question; marks it shown today. stage "returning" is activity's follow-up. */
export function askLaterCard(id, stage = null, now = new Date()) {
  if (!id) return "";
  if (!(store.get("askLater") || {})[id]?.shownAt || dayOf(store.get("askLater")[id].shownAt) !== today(now)) store.setAskLater(id, { shownAt: now.toISOString() });
  const Q = QUESTIONS[stage || id];
  const picked = new Set(id === "goals" ? (store.get("goals") || []) : []);
  const chips = Q.chips.map(([v, l]) => `<button type="button" class="al-chip${picked.has(v) ? " is-on" : ""}" data-al-pick="${esc(v)}"${Q.multi ? ` aria-pressed="${picked.has(v)}"` : ""}>${esc(l)}</button>`).join("");
  const done = Q.multi ? `<button type="button" class="btn btn-secondary" data-al-done>Done</button>` : "";
  return `<section class="al" aria-labelledby="al-q" data-al="${id}"${stage ? ` data-al-stage="${stage}"` : ""}>
      <p class="al-q" id="al-q">${esc(Q.q)}</p>
      ${Q.line ? `<p class="al-line">${esc(Q.line)}</p>` : ""}
      <div class="al-chips" role="group" aria-labelledby="al-q">${chips}</div>
      <div class="al-btns">${done}<button type="button" class="btn btn-ghost" data-al-not>Not now</button></div>
    </section>`;
}

/** Wires the card inside root. onChange() re-renders Home. */
export function bindAskLater(root, onChange) {
  const card = root.querySelector("[data-al]");
  if (!card) return;
  const id = card.dataset.al, stage = card.dataset.alStage || null;
  const answered = () => { store.setAskLater(id, { answeredAt: new Date().toISOString() }); onChange(); };
  card.querySelector("[data-al-not]")?.addEventListener("click", () => { store.setAskLater(id, { notNowAt: new Date().toISOString() }); onChange(); });
  card.querySelectorAll("[data-al-pick]").forEach(b => b.addEventListener("click", () => {
    const v = b.dataset.alPick;
    if (id === "goals") {
      const cur = new Set(store.get("goals") || []);
      if (cur.has(v)) cur.delete(v); else if (cur.size < GOALS_MAX) cur.add(v);
      store.set("goals", [...cur]);
      card.querySelectorAll("[data-al-pick]").forEach(x => { const on = cur.has(x.dataset.alPick); x.classList.toggle("is-on", on); x.setAttribute("aria-pressed", String(on)); });
      return;
    }
    if (stage === "returning") { store.set("lifestyle.returningAfter", v); answered(); return; }
    if (id === "activity") {
      store.set("lifestyle.activityLevel", v);
      if (v === "returning" && healthAnswersAllowed(store.data)) {
        const slot = card.parentElement; const html = askLaterCard("activity", "returning");
        card.outerHTML = html; bindAskLater(slot, onChange); slot.querySelector("[data-al-pick]")?.focus();
        return;
      }
      answered(); return;
    }
    if (id === "weekly") {
      const n = v === "5plus" ? 5 : parseInt(v, 10);
      store.set("strategicGoal.weeklySessionTarget", isNaN(n) ? 3 : n);
      store.set("strategicGoal.setAt", new Date().toISOString());
      answered();
    }
  }));
  card.querySelector("[data-al-done]")?.addEventListener("click", () => {
    if ((store.get("goals") || []).length) answered(); else card.querySelector("[data-al-pick]")?.focus();
  });
}
