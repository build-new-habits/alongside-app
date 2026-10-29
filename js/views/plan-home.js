/**
 * views/plan-home.js
 * 28 Oct 2026 v1
 *
 * STAGE PATH P-4 (blueprint Session 4, D2). The Plan's Home, purpose first,
 * as Graeme approved it in mock-up v9 (28 Oct: "I think this is good. A
 * nice consistency to help users use it."). Free Home is not drawn here and
 * is not changed (verify-path-free-unchanged).
 *
 * Top to bottom: anything due (the scope notice, the monthly guidance line,
 * a chapter's end, a session saved for them, the coach noticing a flat
 * week), the greeting, the arc said as a line, ONE Today card, "Or choose
 * for yourself", the four doors, the Library.
 *
 * Stage AWARD's rules, measured (verify-plan-home-path, and the real-browser
 * audit kept beside the mock-up in BNH-Files):
 *   - six ways in at most: the Today card has one action, the arc is said
 *     rather than pressed (it opens from Progress, Change my arc), Join a
 *     class lives in the Library (as A-1);
 *   - one kind, one colour (LOOK-3): Get stronger amber, Keep moving blue,
 *     Stretch violet, Move to feel better green; every door is its tile's
 *     icon and its name in words (WCAG 1.4.1);
 *   - Home shows two adjustments and says how many more are on the plan;
 *     the plan lists them all (blueprint E4: never empty);
 *   - never a count, a streak or a score: Done today draws before and after
 *     on the person's own five words, and the sentence says it.
 *
 * The suggestion is the engine's (data/path-engine.js), word for word.
 * Rules, not AI: every line here comes from something the person told the
 * app.
 *
 * Presses: a door opens its own steps (route 'path', Session 5), told which
 * door by router.pathStart, read once; a suggestion opens Today's plan
 * (coach-proposal) for its kind and place, or, for Move to feel better,
 * its feeling. Check in, Carry on, your week's day and the Library keep
 * the handlers today.js already has (data-action, data-route).
 */
import { store } from "../store.js";
import { lineIcon } from "../data/line-icons.js";
import { aimById } from "../data/aims.js";
import { arcWeek } from "../data/arc-readback.js";
import { arcWeekStartsToday } from "./today.js";   // A-5: "Week n starts today" (a function; the cycle is safe)
import { getTodaysCheckin } from "../data/checkin.js";
import { mixLine, detailLine } from "../data/week-shape-model.js";
import { todayInWeek, primaryFocus } from "../data/week-shape.js";
import { kindOf } from "../data/kind-colours.js";
import { activityPhrase } from "../data/activity-labels.js";
import { renderFigure } from "../figures.js";
import { suggestToday, arcDoor, pickProgramme, movementName } from "../data/path-engine.js";

// ── The doors ──────────────────────────────────────────────────────────────

export const DOORS = Object.freeze([
  Object.freeze({ id: "stronger", label: "Get stronger",        kind: "amber",  icon: "strength" }),
  Object.freeze({ id: "moving",   label: "Keep moving",         kind: "blue",   icon: "walk" }),
  Object.freeze({ id: "stretch",  label: "Stretch",             kind: "violet", icon: "mobility" }),
  Object.freeze({ id: "feel",     label: "Move to feel better", kind: "green",  icon: "heart" }),
]);
const DOOR = Object.fromEntries(DOORS.map(d => [d.id, d]));
const KIND_DOOR = { amber: "stronger", blue: "moving", violet: "stretch", green: "feel" };
const STYLE = { gentle: "Gentle movement", yoga: "Yoga", taichi: "Tai chi", qigong: "Qigong", pilates: "Pilates", stretch: "Stretches" };
const PLACE = { home: "Home", gym: "Gym", outside: "Outside" };
const NOT_MOVEMENT = ["breathing", "mindful", "mindfulness", "practice"];

// The person's own five words, on the check-in's scale (1-10).
const FIVE = ["struggling", "low", "okay", "pretty good", "great"];
const fiveOf = v => (v <= 2 ? 0 : v <= 4 ? 1 : v <= 6 ? 2 : v <= 8 ? 3 : 4);

const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const todayKey = () => new Date().toISOString().split("T")[0];

// ── What the person told the app ──────────────────────────────────────────

function checkinToday() {
  if (!store.checkedInToday()) return null;
  const c = getTodaysCheckin();
  const energy = Number(c?.energy), mood = Number(c?.mood);
  return Number.isFinite(energy) || Number.isFinite(mood) ? { energy: Number.isFinite(energy) ? energy : null, mood: Number.isFinite(mood) ? mood : null } : null;
}
function soreToday() {
  const s = store.get("conditionPainScores") || {};
  return Object.entries(s).filter(([, v]) => Number(v) > 0).map(([id, score]) => ({ id, score: Number(score) }));
}
function lastPlace() {
  const log = store.completedSessions(store.get("activityLog") || []);
  for (let i = log.length - 1; i >= 0; i--) if (log[i].place === "home" || log[i].place === "gym") return log[i].place;
  return "home";
}
function prefNames() {
  const liked = Object.keys(store.get("likedMovements") || {}).map(movementName).filter(Boolean);
  const prefs = store.get("exercisePreferences") || {};
  const by = want => Object.entries(prefs).filter(([, p]) => (p?.preference || p) === want).map(([id]) => movementName(id)).filter(Boolean);
  return { likedNames: liked, lessNames: by("less"), neverNames: by("avoid") };
}
function arcInfo() {
  const arc = store.get("arc") || {};
  if (!arc.active) return { aim: null, week: null, door: null };
  const aim = (arc.aimId && aimById(arc.aimId)?.label) || arc.label || null;
  return { aim, week: aim ? arcWeek(arc, new Date()) : null, fresh: !!aim && arcWeekStartsToday(arc), door: arcDoor(arc.strands || []) };
}
function doneToday() {
  const t = todayKey();
  const log = store.completedSessions(store.get("activityLog") || [])
    .filter(e => !NOT_MOVEMENT.includes(e.type))
    .filter(e => { const ts = e.completedAt || e.loggedAt || e.date; return ts && new Date(ts).toISOString().split("T")[0] === t; });
  return log.length ? log[log.length - 1] : null;
}

/** The engine's suggestion for today, from what the person said. */
export function todaysSuggestion() {
  const arc = arcInfo();
  return suggestToday({ checkin: checkinToday(), arcDoor: arc.door, place: lastPlace(), sore: soreToday(), ...prefNames() });
}

// ── Pieces ─────────────────────────────────────────────────────────────────

/** The arc, said as a line (not a button): also the first-open screen's. */
export function arcLineHTML() { return arcLine(arcInfo()); }

function arcLine(arc) {
  if (!arc.aim) return "";
  return `<p class="path-arcline">${lineIcon("arc", 20)}<span><strong>Your arc${arc.week ? ` · Week ${arc.week}${arc.fresh ? " starts today" : ""}` : ""}.</strong> ${esc(arc.aim)}</span></p>`;
}

/** Two on Home; the plan lists them all. */
function adjustments(list) {
  const shown = list.slice(0, 2), more = list.length - shown.length;
  return `<div class="path-adj"><p class="path-adj__lbl">What I’ve adjusted</p><ul>${shown.map(x => `<li>${esc(x)}</li>`).join("")}${more ? `<li>And ${more} more on the plan</li>` : ""}</ul></div>`;
}

const fig = id => { const f = id ? renderFigure(id) : ""; return f ? `<div class="path-today__fig" aria-hidden="true">${f}</div>` : ""; };

function head(kind, icon, eyebrow, title, figId) {
  return `<div class="path-today__head"><span class="kind-tile k-${kind}">${lineIcon(icon)}</span>
      <div class="path-today__titles"><p class="path-today__eyebrow">${esc(eyebrow)}</p><h2 class="path-today__title" id="path-today-h">${esc(title)}</h2></div>${fig(figId)}</div>`;
}
const card = (state, kind, door, body) =>
  `<section class="path-today k-${kind}" data-state="${state}"${door ? ` data-door="${door}"` : ""} aria-labelledby="path-today-h">${body}</section>`;
const go = (label, attrs) => `<button type="button" class="btn btn-primary btn-full path-today__go" ${attrs}>${label}</button>`;

function moodPath(before, after) {
  const W = 300, y = 22, x = i => 14 + i * ((W - 28) / 4);
  const b = before == null ? null : fiveOf(before), a = fiveOf(after);
  const ticks = [0, 1, 2, 3, 4].map(i => `<circle class="path-moodpath__tick" cx="${x(i)}" cy="${y}" r="3"></circle>`).join("");
  const len = b == null ? 0 : Math.abs(x(a) - x(b));
  const line = b != null && a !== b ? `<line class="path-moodpath__move" style="--len:${len}" x1="${x(b)}" y1="${y}" x2="${x(a)}" y2="${y}"></line>` : "";
  return `<svg class="path-moodpath" viewBox="0 0 ${W} 44" aria-hidden="true" focusable="false">` +
    `<line class="path-moodpath__line" x1="14" y1="${y}" x2="${W - 14}" y2="${y}"></line>${ticks}${line}` +
    `${b != null ? `<circle class="path-moodpath__before" cx="${x(b)}" cy="${y}" r="8"></circle>` : ""}<circle class="path-moodpath__after" cx="${x(a)}" cy="${y}" r="9"></circle>` +
    `</svg><p class="path-moodpath__ends" aria-hidden="true"><span>Struggling</span><span>Great</span></p>`;
}

// ── The Today card ────────────────────────────────────────────────────────

function ownLeft(t) {
  const group = t.own === "all" ? null : t.own;
  return (store.get("prescribedExercises") || []).filter(e => !e.completedToday && (!group || e.group === group)).length;
}

/** One of: carry, done, week, rest, bad, suggest, prompt. */
export function todayState(carry) {
  if (carry) return "carry";
  const w = todayInWeek();
  // Your own list with exercises still to do leads, even after a session today.
  if (w && w.template && w.template.own && ownLeft(w.template) > 0) return "week";
  if (doneToday()) return "done";
  if (w && w.value === "rest") return "rest";
  if (w && w.template) return "week";
  const d = store.dayOpenToday();
  if (checkinToday() || d?.choice === "pick") return todaysSuggestion().route === "bad-day" ? "bad" : "suggest";
  return "prompt";
}

function todayCard(state, carry) {
  if (state === "carry") {
    const what = carry.freestyle ? carry.done : `Next: ${carry.next} · ${carry.index + 1} of ${carry.total}`;
    return card("carry", "teal", null, `${head("teal", "play", "Carry on", carry.name, carry.nextId)}
      <p class="path-today__meta">${esc(what)}</p>
      ${carry.freestyle ? "" : `<div class="path-today__bar" role="img" aria-label="Movement ${carry.index + 1} of ${carry.total}"><i style="width:${Math.round((carry.index / carry.total) * 100)}%"></i></div>`}
      ${go("Carry on", `data-action="carry-on"${carry.freestyle ? ' data-carry="capture"' : ""}`)}`);
  }
  if (state === "done") {
    const e = doneToday();
    const door = DOOR[e.door] ? e.door : KIND_DOOR[kindOf(e)] || null;
    const kind = door ? DOOR[door].kind : kindOf(e);
    const before = Number(getTodaysCheckin()?.mood), after = Number(e.moodAfter);
    const hasBefore = store.checkedInToday() && Number.isFinite(before), hasAfter = Number.isFinite(after) && after > 0;
    const line = !hasAfter ? "That’s today done." : !hasBefore ? `You finished feeling ${FIVE[fiveOf(after)]}.`
      : fiveOf(after) > fiveOf(before) ? `You went from ${FIVE[fiveOf(before)]} to ${FIVE[fiveOf(after)]}.`
      : fiveOf(after) === fiveOf(before) ? "You held steady. That counts." : "Thanks for being honest. Some days are like that, and it still counts.";
    const lovedToday = Object.entries(store.get("likedMovements") || {}).filter(([, d]) => d === store._localDay()).map(([id]) => movementName(id)).filter(Boolean);
    const remember = lovedToday.length ? `<div class="path-adj"><p class="path-adj__lbl">I’ll remember</p><ul><li>More of ${esc(lovedToday.join(", "))}</li></ul></div>` : "";
    const title = e.name || e.title || (activityPhrase(e) || "Your session").replace(/^(a|an) /, "").replace(/^./, c => c.toUpperCase());
    return card("done", kind, door, `${head(kind, "tick", "Done today", title)}
      ${hasAfter ? moodPath(hasBefore ? before : null, after) : ""}
      <p class="path-today__coach">${line}</p>${remember}`);
  }
  if (state === "rest") {
    return card("rest", "teal", null, `${head("teal", "rest", "Today, from your week", "Rest")}
      <p class="path-today__coach">Today is a rest day in your week. Rest counts.</p>`);
  }
  if (state === "week") {
    const t = todayInWeek().template;
    const kind = primaryFocus(t)?.kind || "amber";
    const door = KIND_DOOR[kind] || "stronger";
    if (t.own) {
      const left = ownLeft(t);
      return card("week", kind, door, `${head(kind, DOOR[door].icon, "Today, from your week", t.name)}
        <p class="path-today__meta">${esc(mixLine(t))}</p>
        ${left ? `<p class="path-today__coach">${left} exercise${left === 1 ? "" : "s"}, as you wrote ${left === 1 ? "it" : "them"}.</p>${go("Start your list", 'data-action="week-own"')}`
          : `<p class="path-today__coach">All done today.</p>`}`);
    }
    const s = suggestToday({ checkin: checkinToday(), week: { name: t.name, mins: t.mins, place: t.place, door }, sore: soreToday(), ...prefNames() });
    return card("week", kind, door, `${head(kind, DOOR[door].icon, `Today, from your week · ${DOOR[door].label}`, t.name)}
      <p class="path-today__meta">${esc(mixLine(t))} · ${esc(detailLine(t))}</p>
      <p class="path-today__coach">${esc(s.reason)}</p>
      ${adjustments(s.adjustments)}
      ${go("Show me today’s plan", 'data-action="week-today"')}`);
  }
  if (state === "bad") {
    const s = todaysSuggestion();
    return card("bad", "teal", null, `${head("teal", "rest", "Today", "A gentle day")}
      <p class="path-today__coach">${esc(s.reason)}</p>
      ${go("See gentle choices", 'data-action="path-go"')}`);
  }
  if (state === "suggest") {
    const s = todaysSuggestion();
    const d = DOOR[s.door] || DOOR.moving;
    let title, meta, figId = null;
    if (s.door === "feel") {
      const p = pickProgramme({ feeling: s.feeling, minutes: s.minutes })?.programme;
      title = p ? p.name : "Move to feel better";
      meta = `Anywhere · About ${p ? p.minutes : s.minutes} minutes${p ? ` · ${STYLE[p.style] || ""}` : ""}`;
      figId = p?.steps?.[0]?.id || null;
    } else {
      title = s.door === "stronger" ? "Whole body strength" : s.door === "stretch" ? "Whole body stretch" : s.intensity === "light" ? "Short and light" : "Whole body, moving";
      meta = `${s.place ? PLACE[s.place] + " · " : ""}About ${s.minutes} minutes`;
    }
    return card("suggest", d.kind, s.door, `${head(d.kind, d.icon, `Today · ${d.label}`, title, figId)}
      <p class="path-today__meta">${esc(meta)}</p>
      <p class="path-today__coach">${esc(s.reason)}</p>
      ${adjustments(s.adjustments)}
      ${go("Show me today’s plan", 'data-action="path-go"')}`);
  }
  const after = store.dayOpenToday()?.choice === "not-now";
  return card("prompt", "teal", null, `${head("teal", "chat", "Today", after ? "Want to check in now?" : "How are you doing?")}
    <p class="path-today__coach">${after ? "No pressure. " : ""}Three quick taps and I’ll fit today to your energy, your mood and anything sore.</p>
    ${go("Check in", 'data-action="checkin"')}`);
}

// ── Home ───────────────────────────────────────────────────────────────────

/**
 * ctx: { greeting, top (scope notice, guidance, hinge, saved-for-you: HTML),
 *        coachNote (a flat week or the week's pace, or ''), carry }
 */
export function renderPlanHome(ctx = {}) {
  // A check-in finished later the same day counts as the day's answer (C1).
  if (store.checkedInToday() && store.dayOpenToday()?.choice !== "checked") store.setDayOpen("checked");
  const arc = arcInfo();
  const state = todayState(ctx.carry);
  const label = state === "carry" ? "Or instead" : (state === "week" || state === "rest") ? "Or something else today" : "Or choose for yourself";
  // Your week lives in the Library on the Plan (no card offers to plan it), so the row always names it.
  const libSub = "Classes, runs, the mind, your lists, your week";
  return `
    <div class="path-home">
      ${ctx.top || ""}
      <h1 class="path-greeting" tabindex="-1">${esc(ctx.greeting || "")}</h1>
      ${ctx.coachNote ? `<p class="path-note" role="status">${esc(ctx.coachNote)}</p>` : ""}
      ${arcLine(arc)}
      ${todayCard(state, ctx.carry)}
      <h2 class="look-label" id="path-doors-h">${label}</h2>
      <ul class="path-doors" aria-labelledby="path-doors-h">
        ${DOORS.map(d => `<li><button type="button" class="path-door" data-door="${d.id}">
          <span class="kind-tile k-${d.kind}">${lineIcon(d.icon)}</span>
          <span class="path-door__text"><span class="path-door__t">${d.label}</span>${arc.door === d.id ? `<span class="path-door__d">Your arc</span>` : ""}</span>
        </button></li>`).join("")}
        <li class="path-doors__wide"><button type="button" class="path-door path-door--wide" data-route="library" data-requires-checkin="false">
          <span class="kind-tile k-slate">${lineIcon("library")}</span>
          <span class="path-door__text"><span class="path-door__t">Library</span><span class="path-door__d">${libSub}</span></span>
          <span class="path-door__chev" aria-hidden="true">${lineIcon("chevron", 20)}</span>
        </button></li>
      </ul>
    </div>`;
}

/** The presses only this Home has. today.js's attachEvents() wires the rest. */
export function wirePlanHome(container, router) {
  container.querySelectorAll(".path-door[data-door]").forEach(btn => btn.addEventListener("click", () => {
    router.pathStart = { door: btn.dataset.door };
    router.navigate("path");
  }));
  container.querySelector('[data-action="path-go"]')?.addEventListener("click", () => {
    const s = todaysSuggestion();
    if (s.route === "bad-day") { router.navigate("coach-proposal"); return; }   // its bad-day door
    if (s.door === "feel") {
      const p = pickProgramme({ feeling: s.feeling, minutes: s.minutes })?.programme;
      router.pathStart = { door: "feel", feeling: s.feeling, minutes: s.minutes, programmeId: p?.id || null };
      router.navigate("path");
      return;
    }
    store.set("requestedSessionType", s.sessionType || "full");
    store.set("requestedLocation", s.place || null);
    router.navigate("coach-proposal");
  });
}
