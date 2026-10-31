/**
 * views/plan-home.js
 * 31 Oct 2026 v5
 *
 * v5 - STAGE PATH Session 7 (blueprint v6 Part F: Lately's numbers from
 *   data/progress-report.js, a touch-once exception planned there). Lately
 *   reads the same before-and-after as Progress (moodPairs, moodStory), so
 *   Home and Progress never disagree. Nothing on screen changes.
 *
 * v4 - STAGE PATH Session 6 (one line): the coach's choice tells Today's
 *   plan its door (router.planDoor), so the finish and Lately know it.
 *
 * v3 - STAGE PATH Session 5 (a touch-once exception, recorded: Sessions 4
 *   and 5 release together). What the person told the app today is read
 *   from data/path-context.js, shared with the door routes and Today's
 *   plan. The coach's reason goes with its choice to Today's plan
 *   (router.planReason), where reasons now live. Nothing on Home changes.
 *
 * v2 - MOCK-UP v10 (Graeme, 29 Oct: "I like v10"). The check-in lives
 *   inside each way in, asked once a day just before the first session
 *   (needsCheckin(); "Not today" on the check-in counts as asked), so there
 *   is no first-open screen and no suggestion card on Home: one row, "Let
 *   me choose for you", names today's pick once the questions are answered
 *   and the plan screen gives its reason and every adjustment. Lately (mood
 *   before and after, and what seems to help; never a weekly count on Home,
 *   LOBBY-1b, Graeme 29 Oct) sits above the doors, from three sessions with
 *   both moods. Carry on, Done today, your week's day and a rest day lead
 *   in the row's place. Six ways in at most, still.
 *
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
import { checkinToday, soreToday, lastPlace, prefNames } from "../data/path-context.js";
import { mixLine, detailLine } from "../data/week-shape-model.js";
import { todayInWeek, primaryFocus } from "../data/week-shape.js";
import { kindOf } from "../data/kind-colours.js";
import { activityPhrase } from "../data/activity-labels.js";
import { renderFigure } from "../figures.js";
import { suggestToday, arcDoor, pickProgramme, movementName } from "../data/path-engine.js";
import { moodPairs, moodStory, fiveOf } from "../data/progress-report.js";

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

const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const todayKey = () => new Date().toISOString().split("T")[0];

// ── What the person told the app ──────────────────────────────────────────

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

function arcLine(arc) {
  if (!arc.aim) return "";
  return `<p class="path-arcline">${lineIcon("arc", 20)}<span><strong>Your arc${arc.week ? ` · Week ${arc.week}${arc.fresh ? " starts today" : ""}` : ""}.</strong> ${esc(arc.aim)}</span></p>`;
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

/** One of: carry, week, done, rest, coach. */
export function todayState(carry) {
  if (carry) return "carry";
  const w = todayInWeek();
  // Your own list with exercises still to do leads, even after a session today.
  if (w && w.template && w.template.own && ownLeft(w.template) > 0) return "week";
  if (doneToday()) return "done";
  if (w && w.value === "rest") return "rest";
  if (w && w.template) return "week";
  return "coach";
}

/**
 * v2 (mock-up v10). The check-in is asked once a day, just before the first
 * session, inside whichever way in was chosen; "Not today" (dayOpen 'pick')
 * means not asked again today.
 */
export function needsCheckin() {
  return !store.checkedInToday() && store.dayOpenToday()?.choice !== "pick";
}

function todayCard(state, carry) {
  if (state === "carry") {
    const what = carry.freestyle ? carry.done : `Next: ${carry.next} \u00b7 ${carry.index + 1} of ${carry.total}`;
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
    const line = !hasAfter ? "That\u2019s today done." : !hasBefore ? `You finished feeling ${FIVE[fiveOf(after)]}.`
      : fiveOf(after) > fiveOf(before) ? `You went from ${FIVE[fiveOf(before)]} to ${FIVE[fiveOf(after)]}.`
      : fiveOf(after) === fiveOf(before) ? "You held steady. That counts." : "Thanks for being honest. Some days are like that, and it still counts.";
    const lovedToday = Object.entries(store.get("likedMovements") || {}).filter(([, d]) => d === store._localDay()).map(([id]) => movementName(id)).filter(Boolean);
    const remember = lovedToday.length ? `<div class="path-adj"><p class="path-adj__lbl">I\u2019ll remember</p><ul><li>More of ${esc(lovedToday.join(", "))}</li></ul></div>` : "";
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
    return row("week", kind, DOOR[door].icon, `Today, from your week: ${t.name}`, `${mixLine(t)} \u00b7 ${detailLine(t)}`, 'data-action="week-today"', door);
  }
  // The coach's row: asks the three questions if today has none, then chooses.
  let sub = "Three quick questions, then today\u2019s plan";
  if (!needsCheckin()) {
    const s = todaysSuggestion();
    if (s.route === "bad-day") sub = s.reason;
    else {
      const p = s.door === "feel" ? pickProgramme({ feeling: s.feeling, minutes: s.minutes })?.programme : null;
      sub = `Today: ${p ? p.name : coachTitle(s)} \u00b7 About ${p ? p.minutes : s.minutes} minutes`;
    }
  }
  return row("coach", "teal", "chat", "Let me choose for you", sub, 'data-action="path-coach"');
}

function coachTitle(s) {
  return s.door === "stronger" ? "Whole body strength" : s.door === "stretch" ? "Whole body stretch" : s.intensity === "light" ? "Short and light" : "Whole body, moving";
}

/** One row with one action: the coach, or your week's day. */
function row(state, kind, icon, title, sub, attrs, door = null) {
  return `<button type="button" class="path-coach k-${kind}" data-state="${state}"${door ? ` data-door="${door}"` : ""} ${attrs}>
    <span class="kind-tile k-${kind}">${lineIcon(icon)}</span>
    <span class="path-coach__text"><span class="path-coach__t">${esc(title)}</span><span class="path-coach__d">${esc(sub)}</span></span>
    <span class="path-door__chev" aria-hidden="true">${lineIcon("chevron", 20)}</span>
  </button>`;
}

// ── Lately (a first cut; Session 7 draws it from progress-report.js) ───────

/**
 * Before and after, on the person's own five words, for the last six
 * finished sessions that have both (the check-in's mood that day, and the
 * mood after). Shown from three. Never a count of days, never a target.
 */
export function latelyPairs(n = 6) {
  return moodPairs(store.completedSessions(store.get("activityLog") || []), store.get("checkinHistory") || {}, { last: n })
    .map(p => ({ e: p.entry, before: p.before, after: p.after, better: p.better }));
}

/** v5: the same reading as Progress (data/progress-report.js moodStory), so the two never disagree. */
function lately() {
  const pairs = latelyPairs();
  const story = moodStory(pairs.map(p => ({ entry: p.e, before: p.before, after: p.after, better: p.better })), e => e.name || e.title || activityPhrase(e));
  if (!story) return "";
  const H = 40, bw = 12, gw = bw * 2 + 10, h = v => ((fiveOf(v) + 1) / 5) * H;
  const bars = pairs.map((p, i) => `<rect x="${i * gw}" y="${H - h(p.before)}" width="${bw}" height="${h(p.before)}" rx="3" class="path-lately__before"></rect>` +
    `<rect x="${i * gw + bw + 2}" y="${H - h(p.after)}" width="${bw}" height="${h(p.after)}" rx="3" class="path-lately__after"></rect>`).join("");
  return `<h2 class="look-label" id="path-lately-h">Lately</h2>
    <div class="path-lately" role="group" aria-labelledby="path-lately-h">
      <div class="path-lately__tile"><p class="path-lately__lbl">After moving</p>
        <svg class="path-lately__spark" viewBox="0 0 ${gw * pairs.length - 10} ${H}" role="img" aria-label="${story.label}">${bars}</svg>
        <p class="path-lately__line">Better after ${story.better} of your last ${story.total}.</p></div>
      ${story.helps ? `<div class="path-lately__tile"><p class="path-lately__lbl">What seems to help</p><p class="path-lately__line">${esc(story.helps)} seems to help you most.</p></div>` : ""}
    </div>`;
}

// ── Home ───────────────────────────────────────────────────────────────────

/**
 * ctx: { greeting, top (scope notice, guidance, hinge, saved-for-you: HTML),
 *        coachNote (a flat week or the week's pace, or ''), carry }
 */
export function renderPlanHome(ctx = {}) {
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
      ${lately()}
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

/**
 * The coach's choice, made now: a gentle day goes to Today's plan, where
 * the bad-day door is; Move to feel better to its feeling (path, Session
 * 5); anything else to Today's plan for its kind and place.
 */
export function goToSuggestion(router, opts = {}) {
  const s = todaysSuggestion();
  if (s.route === "bad-day") { router.navigate("coach-proposal", opts); return; }
  if (s.door === "feel") {
    const p = pickProgramme({ feeling: s.feeling, minutes: s.minutes })?.programme;
    router.pathStart = { door: "feel", feeling: s.feeling, minutes: s.minutes, programmeId: p?.id || null, reason: s.reason };
    router.navigate("path", opts);
    return;
  }
  store.set("requestedSessionType", s.sessionType || "full");
  store.set("requestedLocation", s.place || null);
  router.planReason = s.reason;   // Today's plan says why, once (coach-proposal.js, Session 5)
  router.planDoor = s.door || null;   // and which door it is, for the finish (Session 6)
  router.navigate("coach-proposal", opts);
}

/**
 * The presses only this Home has. today.js's attachEvents() wires the rest.
 * The first way in of the day goes through the check-in, which comes back
 * to where the person was going (pendingDoorRoute): a door to its steps
 * (path), the coach to Home, which goes straight on to its choice
 * (router.pathStart.coach, read by today.js).
 */
export function wirePlanHome(container, router) {
  container.querySelectorAll(".path-door[data-door]").forEach(btn => btn.addEventListener("click", () => {
    router.pathStart = { door: btn.dataset.door };
    if (needsCheckin()) { store.set("pendingDoorRoute", "path"); router.navigate("checkin"); return; }
    router.navigate("path");
  }));
  container.querySelector('[data-action="path-coach"]')?.addEventListener("click", () => {
    if (needsCheckin()) { router.pathStart = { coach: true }; store.set("pendingDoorRoute", "today"); router.navigate("checkin"); return; }
    goToSuggestion(router);
  });
}
