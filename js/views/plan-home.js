/**
 * views/plan-home.js
 * 26 Nov 2026 v20
 *
 * v20 - P-37 S1. Little and often: a list taking turns says which comes
 *   next ("Shoulders next").
 *
 * v19 - P-46 S3. The question asked once, later (data/ask-later.js), under
 *   Making my Move's bar, only when no other question is asking and never on
 *   a hard day. Not a way in (a question, not a destination).
 *
 * 24 Nov 2026 v18
 *
 * v18 - P-45 THE LIVE LINK. When a physio or trainer has sent changes
 *   through a live link, Home asks once: Your physio or trainer sent changes
 *   to your exercises (Look at them / Later); it comes first, and the other
 *   questions wait. Not on a hard day. Later leaves them in My exercises.
 *
 * v17 - OWN-DONE-TODAY (Graeme, 23 Nov: "It says I did these today but I
 *   didn't"). Done today is read through store.ownDoneToday(): ticked today
 *   only (the flag was never cleared).
 *
 * v16 - P-39 S6 QUIET HOME (Graeme, 23 Nov: "I'd like them to disappear
 *   off the main home page"; "be exceptional"). It's a hard day and Change
 *   what Alongside is for leave Home. Instead, Home asks at the moment it
 *   matters, once: on an in-between day (mood Low), Keep today to what you
 *   chose for hard days? (Yes / No, as planned); at each twelve-week turn of
 *   an arc, Still what you want Alongside for? (Have a look / Yes, still
 *   right). It's a hard day moves into Change today; Making my Move stays
 *   in Settings › Your plan and Help. Show my usual Home stays on a hard day.
 *
 * v15 - P-39 S5 CLOSE. Start your Plan, under Today until closed (P-35
 *   folded in): Making my Move first, then Set what you're working towards,
 *   Plan your week, Add exercises from your physio or trainer; done ones
 *   ticked and quieter, still there to do again; Close this list. While it
 *   shows, it is the way into Making my Move and the arc. Not on a hard
 *   day: that Home stays the one line and the hard-day choices.
 *
 * v14 - P-39 S4. Once Making my Move is made and something matters most,
 *   with no arc set yet, the line under Today also offers Set what you're
 *   working towards (the arc's own questions, its aims led by what matters
 *   most).
 *
 * v13 - P-39 S3 HOME (Making my Move; spec section 3; prototype v2 agreed
 *   by Graeme, 23 Nov). The Plan's Home follows what the person chose:
 *   - Not made yet: Home as before, and one line under Today, "Make Home
 *     yours, in about a minute" with Making my Move.
 *   - A good day: Let me choose for you, then only the doors they chose
 *     (none for Just tell me what to do, all four for Show me everything),
 *     a Calm my mind row when chosen (when three doors or fewer, so six ways
 *     in still hold), the Library. Under Today: It's a hard day, and Change
 *     what Alongside is for.
 *   - A hard day (the check-in: energy Low or below, or mood Struggling; or
 *     It's a hard day): one line, "A hard day. Here's what you chose for
 *     days like this.", then only their hard-day choices (or the coach's
 *     gentle pick), and no doors; Show my usual Home under it. Rest alone is
 *     said, with nothing to press. A session carried on, planned or done
 *     today keeps its card. A sore area at Bad keeps the usual Home, where
 *     its own Rest or Something gentler choice comes first.
 *   Nothing re-adds a door by itself. Free's Home is unchanged.
 *
 * v12 - P-25 HOW-TO GUIDES. Guide markers only (data-guide-target): the
 *   coach's row (coach-row), your week's day (week-row), Start your list
 *   (start-list) and the Library (library). Nothing else changes.
 *
 * v11 - P-34 HOME-CALM (Graeme, 15 Nov: "exercise routes from home and
 *   progress in progress, so lately in progress"). Lately is gone from Home:
 *   Home is what to do (greeting, arc line, Today, Change today, Little and
 *   often, the four ways in, the Library). How moving is going lives on
 *   Progress, as Before and after, near its top; it read the same pairs the
 *   same way (data/progress-report.js), so nothing is lost. The finish still
 *   sets now beside this morning.
 *
 * v10 review (15 Nov): Undo shows only when it can be done safely
 *   (week-changes.js canUndoToday: never onto a day that has passed); the
 *   line saying what happened stays either way.
 *
 * v10 - P-31 LITTLE-AND-OFTEN and CHANGE-TODAY (mock-up v5 approved by
 *   Graeme, 14 Nov). Home keeps everything it had, in the same order, and
 *   gains two things. Under the Today card, Change today (a link to its
 *   own screen, change-today.js) and, after a change, one line saying what
 *   happened with Undo beside it ("Swapped with Friday. Undo"); undo also
 *   puts the other day back. Then Little and often: at most three short
 *   lists from My exercises the person put on Home, one tap each to play
 *   (the list's own player warns on a sore day; the row says which area a
 *   list works), "Done today" once every exercise in one is ticked, and
 *   All of My exercises. Nothing shows when nothing is chosen. A rest day
 *   from Change today says what it is (Little and often, a moved session,
 *   Rest today). Lately shows once today's session is done, or on a day
 *   without one, so the Today card stays near the top.
 *
 * v9 - P-27 TIDY (Graeme, 05 Nov). Let me choose for you hands Today's plan
 *   the length it promised ("About 30 minutes" built a plan for the usual
 *   length), so the plan is the one Home said. startCoachChoice(): the one
 *   way to the coach's choice, used by Home's row, the arc's Start today's
 *   session and an empty Saved sessions (each built its own, from a stale
 *   request).
 *
 * v8 - P-26 ONE-BUILD-PAGE (mock-up v1 approved 02 Nov). A session the
 *   person built and saved for today (plannedFor) leads in the one row:
 *   "Today: Wednesday gym", about how long, where, "You built this"; one tap
 *   opens it as a proposal behind its door, through the check-in when today
 *   has none, as every door does (and the proposal leaves out what today's
 *   sore areas rule out). A Your week day that is a saved session says
 *   "Today, from your week: …, as you built it" and opens the same way. A
 *   week day whose saved session has gone counts as a day with no plan. The
 *   mock-up's "Change it" lives on the proposal (Change this session), so
 *   Home keeps one action per row and six ways in. Once the planned
 *   session is finished today, Done today shows, as for any session.
 *
 * v7 - P-21 TRENDS-WEEK (mock-up v1 approved 01 Nov). When today in Your
 *   week follows a fitness trend, the one row names it ("Today, from your
 *   week: Zone 2: an easy day", with the activity, about how long and the
 *   talk test's word) and one tap opens that trend's session behind its
 *   door (router.pathStart.trendDay, read by path.js), through the
 *   check-in when today has none, as every door does. Zone 2's harder day,
 *   before week 5 or once this week's is done, is said as an easy day.
 *
 * v6 - P-13 (true words). The Library row said "Classes, runs, the mind,
 *   your lists, your week"; runs are behind Keep moving now, so it says
 *   "Classes, practices, the mind, your lists, your week".
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
import { todayInWeek, primaryFocus, localDay, getWeek } from "../data/week-shape.js";
import { changeLine, undoToday, canUndoToday } from "../data/week-changes.js";
import { homeItems, homeItemLine } from "../data/little-and-often.js";
import { DAY_NAMES } from "../data/week-shape-model.js";
import { savedForDay, savedById, lastDoneOf } from "../data/saved-sessions.js";
import { kindOf } from "../data/kind-colours.js";
import { activityPhrase } from "../data/activity-labels.js";
import { renderFigure } from "../figures.js";
import { suggestToday, arcDoor, pickProgramme, movementName } from "../data/path-engine.js";
import { setTodaysLength } from "../data/session-length.js";
import { fiveOf } from "../data/progress-report.js";
import { EFFORT, ZONE2_ACTIVITIES, zone2Week, zone2HardDoneThisWeek } from "../data/trend-recipes.js";
import { dueAskLater, askLaterCard } from "../data/ask-later.js";   // P-46 S3 (bound by today.js attachEvents)
import { goodDayDoors, HARD_OFFERED, homeDay, setToday, arcNext, startItems, startOpen, askHardToday, reviewDue, reviewBlock, setReviewed } from "../data/my-move.js";

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
  `<section class="path-today k-${kind}" data-state="${state}"${door ? ` data-door="${door}"` : ""}${state === "week" ? ' data-guide-target="week-row"' : ""} aria-labelledby="path-today-h">${body}</section>`;
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
  return (store.get("prescribedExercises") || []).filter(e => !store.ownDoneToday(e) && (!group || e.group === group)).length;
}

/**
 * P-26. The session saved for today (plannedFor), not yet finished today,
 * or null. The newest first, when there is more than one.
 */
export function plannedToday(d = new Date()) {
  const day = localDay(d);
  return savedForDay(day).find(r => { const t = lastDoneOf(r); return !t || localDay(new Date(t)) !== day; }) || null;
}
/** P-26. Today's day plan from Your week, unless it is a saved session that has gone. */
function weekToday() {
  const w = todayInWeek();
  if (w && w.template && w.template.saved && !savedById(w.template.saved)) return { ...w, template: null, value: null };
  return w;
}
/** P-26. The door a saved session opens behind: its own, or its kind's (as path.js doorOfSaved). */
const savedDoor = r => DOOR[r?.purpose] ? r.purpose : ["stretch", "mobility"].includes(r?.sessionType) ? "stretch" : r?.sessionType === "cardio" ? "moving" : "stronger";
const savedSub = (r, first) => [first, r.durationMins ? `About ${r.durationMins} min` : "", r.place === "gym" ? "at the gym" : r.place === "home" ? "at home" : ""].filter(Boolean).join(" \u00b7 ");

/** One of: carry, planned, week, done, rest, coach. */
export function todayState(carry) {
  if (carry) return "carry";
  const w = weekToday();
  // Your own list with exercises still to do leads, even after a session today.
  if (w && w.template && w.template.own && ownLeft(w.template) > 0) return "week";
  // P-26. A session built and saved for today leads until it is done.
  if (plannedToday()) return "planned";
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
    const ch = weekToday()?.change;
    if (ch && ch.kind === "little") return card("rest", "violet", null, `${head("violet", "mobility", "Today", "Little and often")}
      <p class="path-today__coach">Just the short ones today. That counts.</p>`);
    if (ch && ch.kind === "moved") {
      const name = getWeek()?.templates?.[ch.value]?.name || "Your session";
      return card("rest", "teal", null, `${head("teal", "rest", "Today", "Nothing planned now")}
      <p class="path-today__coach">${esc(ch.caught ? `You did ${name} on ${DAY_NAMES[ch.to]} instead.` : `${name} is on ${DAY_NAMES[ch.to]} now.`)} Rest counts, or choose something below.</p>`);
    }
    return card("rest", "teal", null, `${head("teal", "rest", "Today, from your week", "Rest")}
      <p class="path-today__coach">${ch && ch.kind === "rest" ? "You've made today a rest day." : "Today is a rest day in your week."} Rest counts.</p>`);
  }
  if (state === "planned") {
    const r = plannedToday(), door = savedDoor(r);
    return row("planned", DOOR[door].kind, DOOR[door].icon, `Today: ${r.name}`, savedSub(r, "You built this"), `data-action="planned" data-saved="${esc(r.id)}"`, door);
  }
  if (state === "week") {
    const t = weekToday().template;
    if (t.saved) {
      const r = savedById(t.saved), door = savedDoor(r);
      return row("week", DOOR[door].kind, DOOR[door].icon, `Today, from your week: ${r.name}`, savedSub(r, "As you built it"), `data-action="week-saved" data-saved="${esc(r.id)}"`, door);
    }
    const kind = primaryFocus(t)?.kind || "amber";
    const door = KIND_DOOR[kind] || "stronger";
    if (t.own) {
      const left = ownLeft(t);
      return card("week", kind, door, `${head(kind, DOOR[door].icon, "Today, from your week", t.name)}
        <p class="path-today__meta">${esc(mixLine(t))}</p>
        ${left ? `<p class="path-today__coach">${left} exercise${left === 1 ? "" : "s"}, as you wrote ${left === 1 ? "it" : "them"}.</p>${go("Start your list", 'data-action="week-own" data-guide-target="start-list"')}`
          : `<p class="path-today__coach">All done today.</p>`}`);
    }
    if (t.trend) {
      const d = trendDayToday(t);
      return row("week", DOOR[d.door].kind, DOOR[d.door].icon, `Today, from your week: ${d.name}`, d.sub, 'data-action="week-trend"', d.door);
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

/**
 * P-21. Today's trend day as Home says it: its door, its name (Zone 2's
 * harder day said as an easy day before week 5, or once this week's is
 * done), and a line: the activity, about how long, the talk test's word.
 */
export function trendDayToday(t) {
  const tr = t.trend;
  const followed = (store.get("trends") || []).find(x => x && x.id === tr.id) || null;
  const door = (tr.id === "zone2" || tr.id === "cross" || (tr.id === "snack" && tr.day === "breath")) ? "moving" : "stronger";
  let name = t.name, effort = { gentle: "easy", steady: "steady", moderate: "steady", hard: "hard" }[t.intensity] || "steady", day = tr.day || null;
  if (tr.id === "zone2" && tr.day === "hard") {
    const wk = zone2Week(store.trendWeek("zone2") || 1);
    if (!wk.hardAllowed || zone2HardDoneThisWeek(store.get("activityLog") || [])) { name = "Zone 2: an easy day"; effort = "easy"; day = "easy"; }
  }
  const act = tr.id === "zone2" ? ZONE2_ACTIVITIES.find(a => a.id === followed?.activity)?.label : null;
  const sub = [act, `About ${t.mins} min`, EFFORT[effort]].filter(Boolean).join(" \u00b7 ");
  return { door, name, sub, trend: { id: tr.id, day }, mins: t.mins };
}

function coachTitle(s) {
  return s.door === "stronger" ? "Whole body strength" : s.door === "stretch" ? "Whole body stretch" : s.intensity === "light" ? "Short and light" : "Whole body, moving";
}

/** One row with one action: the coach, or your week's day. */
function row(state, kind, icon, title, sub, attrs, door = null) {
  const gt = state === "coach" ? "coach-row" : state === "week" ? "week-row" : "";
  return `<button type="button" class="path-coach k-${kind}" data-state="${state}"${door ? ` data-door="${door}"` : ""}${gt ? ` data-guide-target="${gt}"` : ""} ${attrs}>
    <span class="kind-tile k-${kind}">${lineIcon(icon)}</span>
    <span class="path-coach__text"><span class="path-coach__t">${esc(title)}</span><span class="path-coach__d">${esc(sub)}</span></span>
    <span class="path-door__chev" aria-hidden="true">${lineIcon("chevron", 20)}</span>
  </button>`;
}

/**
 * P-31. Under the Today card: what today's change was, with Undo beside it,
 * and Change today. Only with a week, and not while a session is carried
 * on, already done today, or built and saved for today.
 */
function changeBar(state) {
  if (!getWeek() || !["week", "rest", "coach"].includes(state)) return "";
  const line = changeLine();
  const undo = line && canUndoToday()
    ? `<button type="button" class="path-change__undo" data-action="undo-change" aria-label="Undo: ${esc(line)}">Undo</button>` : "";
  return `<div class="path-change">
      ${line ? `<p class="path-change__line"><span class="path-change__what">${esc(line)}</span>${undo}</p>` : ""}
      <button type="button" class="path-link path-change__link" data-action="change-today">Change today</button>
    </div>`;
}

/** P-31. Little and often: the lists the person put on Home, at most three. */
function littleAndOften() {
  const items = homeItems();
  if (!items.length) return "";
  return `<h2 class="look-label" id="path-lao-h">Little and often</h2>
    <ul class="path-lao" aria-labelledby="path-lao-h">
      ${items.map(i => {
        const sub = homeItemLine(i);   // P-37: with which comes next, when lists take turns
        const body = `<span class="kind-tile k-violet">${lineIcon(i.done ? "tick" : "mobility")}</span>
          <span class="path-door__text"><span class="path-door__t">${esc(i.group)}</span>
            <span class="path-door__d">${esc(i.done ? "Done today" : sub)}</span>
            ${i.sore && !i.done ? `<span class="path-lao__sore">Works your ${esc(String(i.sore).toLowerCase())}</span>` : ""}</span>`;
        return i.done ? `<li><div class="path-door path-lao__done">${body}</div></li>`
          : `<li><button type="button" class="path-door" data-action="lao-start" data-group="${esc(i.group)}">${body}
          <span class="path-door__chev" aria-hidden="true">${lineIcon("chevron", 20)}</span></button></li>`;
      }).join("")}
    </ul>
    <button type="button" class="path-link path-lao__all" data-action="lao-all">All of My exercises</button>`;
}

// ── P-39 Making my Move on Home ────────────────────────────────────────────

/** Which Home today, and the doors it shows. */
export function myMoveHome() {
  const s = needsCheckin() ? null : todaysSuggestion();
  const badSore = s?.route === "bad-day";
  const day = homeDay({ badSore });
  const m = store.get("myMove");
  const doors = day === "unmade" ? DOORS.map(d => d.id) : day === "hard" ? [] : goodDayDoors(m);
  const calm = day === "good" && m.purposes.includes("calm") && doors.length <= 3;
  const ask = day === "good" && askHardToday({ badSore });
  return { day, doors, calm, hard: day === "hard" ? m.hardDay : [], ask, review: day === "good" && !ask && reviewDue() };
}

const HARD_ROUTE = { coach: "hard-coach", stretch: "hard-stretch", walk: "hard-walk", calm: "hard-calm" };
const HARD_ICON = { coach: "chat", stretch: "mobility", walk: "walk", calm: "breath" };

/** A hard day: the person's own choices, set on a good day. */
function hardToday(mm) {
  const note = `<p class="path-note path-mm__note">A hard day. Here's what you chose for days like this.</p>`;
  if (mm.hard.includes("rest")) {
    return note + card("hard", "slate", null, `${head("slate", "rest", "A hard day", "Rest, and that's fine")}
      <p class="path-today__coach">You chose this for days like this. Rest counts.</p>`);
  }
  const picks = (mm.hard.length ? mm.hard : ["coach"]).map(id => HARD_OFFERED.find(h => h.id === id)).filter(h => h && HARD_ROUTE[h.id]);
  return note + picks.map(h => row("hard", h.kind, HARD_ICON[h.id], h.title, h.line, `data-action="${HARD_ROUTE[h.id]}"`)).join("");
}

/** Under Today: Making my Move's way in, or It's a hard day / Show my usual Home, and Change. */
function startList() {
  const items = startItems();
  return `<section class="path-start" aria-labelledby="path-start-h">
      <h2 class="path-start__h" id="path-start-h">Start your Plan</h2>
      <ul class="path-start__list">${items.map(i => `<li class="${i.done ? "is-done" : ""}">
        <span class="path-start__mark" aria-hidden="true">${i.done ? lineIcon("tick", 18) : ""}</span>
        <button type="button" class="path-link" data-action="${i.action}"${i.guide ? ` data-guide-target="${i.guide}"` : ""}>${esc(i.label)}${i.done ? '<span class="sr-only">, done</span>' : ""}</button>
      </li>`).join("")}</ul>
      <button type="button" class="path-link path-start__close" data-action="start-close">Close this list</button>
    </section>`;
}

/** S6. One question, asked when it matters, gone once answered. */
function ask(id, q, yes, no) {
  return `<section class="path-ask" aria-labelledby="path-ask-${id}">
      <p class="path-ask__q" id="path-ask-${id}">${esc(q)}</p>
      <div class="path-ask__btns">
        <button type="button" class="btn btn-secondary path-ask__btn" data-action="${id}-yes">${esc(yes)}</button>
        <button type="button" class="btn btn-ghost path-ask__btn" data-action="${id}-no">${esc(no)}</button>
      </div>
    </section>`;
}

/** P-45. Changes sent through a live link, not yet asked about. */
function liveWaiting() { return (store.get("liveInbox") || []).find(m => !m.noticed) || null; }
function liveAsk(mm) {
  if (mm.day === "hard" || !liveWaiting()) return "";
  return ask("ask-live", "Your physio or trainer sent changes to your exercises.", "Look at them", "Later");
}

function myMoveBar(mm) {
  const asks = mm.ask ? ask("ask-hard", "You said your mood is low today. Keep today to what you chose for hard days?", "Yes", "No, as planned")
    : mm.review ? ask("ask-review", `${reviewBlock() * 12} weeks into your arc. Still what you want Alongside for?`, "Have a look", "Yes, still right") : "";
  if (startOpen() && mm.day !== "hard") return `<div class="path-mm">${asks}${startList()}</div>`;
  if (mm.day === "unmade") {
    return `<div class="path-mm"><p class="path-mm__line">Make Home yours, in about a minute.</p>
      <button type="button" class="path-link" data-action="mm-open">Making my Move</button></div>`;
  }
  // S6: on a hard day, the one way back; on a good day, nothing standing.
  const usual = mm.day === "hard" ? `<button type="button" class="path-link" data-action="mm-usual">Show my usual Home</button>` : "";
  const arcLink = arcNext() ? `<button type="button" class="path-link" data-action="mm-arc">Set what you're working towards</button>` : "";
  const inside = asks + usual + arcLink;
  return inside ? `<div class="path-mm">${inside}</div>` : "";
}

// ── Home ───────────────────────────────────────────────────────────────────

/**
 * ctx: { greeting, top (scope notice, guidance, hinge, saved-for-you: HTML),
 *        coachNote (a flat week or the week's pace, or ''), carry }
 */
export function renderPlanHome(ctx = {}) {
  const arc = arcInfo();
  const state = todayState(ctx.carry);
  const mm = myMoveHome();
  const hardLead = mm.day === "hard" && ["coach", "week", "rest"].includes(state);
  const label = !mm.doors.length ? "More" : state === "carry" ? "Or instead" : (state === "week" || state === "rest" || state === "planned") ? "Or something else today" : "Or choose for yourself";
  const shown = DOORS.filter(d => mm.doors.includes(d.id));
  // Your week lives in the Library on the Plan (no card offers to plan it), so the row always names it.
  const libSub = "Classes, practices, the mind, your lists, your week";
  return `
    <div class="path-home">
      ${ctx.top || ""}
      <h1 class="path-greeting" tabindex="-1">${esc(ctx.greeting || "")}</h1>
      ${ctx.coachNote ? `<p class="path-note" role="status">${esc(ctx.coachNote)}</p>` : ""}
      ${arcLine(arc)}
      ${hardLead ? hardToday(mm) : (mm.day === "hard" ? `<p class="path-note path-mm__note">A hard day. Here's what you chose for days like this.</p>` : "") + todayCard(state, ctx.carry)}
      ${hardLead ? "" : changeBar(state)}
      ${liveAsk(mm) ? `<div class="path-mm">${liveAsk(mm)}</div>` : ""}${myMoveBar(liveAsk(mm) ? { ...mm, ask: false, review: false } : mm)}
      ${!hardLead && mm.day !== "hard" && !liveAsk(mm) && !mm.ask && !mm.review ? askLaterCard(dueAskLater()) : ""}
      ${littleAndOften()}
      <h2 class="look-label" id="path-doors-h" tabindex="-1">${label}</h2>
      <ul class="path-doors" aria-labelledby="path-doors-h">
        ${shown.map(d => `<li><button type="button" class="path-door" data-door="${d.id}">
          <span class="kind-tile k-${d.kind}">${lineIcon(d.icon)}</span>
          <span class="path-door__text"><span class="path-door__t">${d.label}</span>${arc.door === d.id ? `<span class="path-door__d">Your arc</span>` : ""}</span>
        </button></li>`).join("")}
        ${mm.calm ? `<li class="path-doors__wide"><button type="button" class="path-door path-door--wide" data-route="noticing" data-requires-checkin="false">
          <span class="kind-tile k-green">${lineIcon("breath")}</span>
          <span class="path-door__text"><span class="path-door__t">Calm my mind</span><span class="path-door__d">Breathing and mindful practice</span></span>
          <span class="path-door__chev" aria-hidden="true">${lineIcon("chevron", 20)}</span>
        </button></li>` : ""}
        <li class="path-doors__wide"><button type="button" class="path-door path-door--wide" data-route="library" data-requires-checkin="false" data-guide-target="library">
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
  // P-27. The length Home said (About n minutes), as today's length.
  const LEN = [["micro", 10], ["quick", 20], ["short", 30], ["standard", 40], ["long", 50]];
  if (Number.isFinite(s.minutes)) setTodaysLength(LEN.reduce((a, b) => Math.abs(b[1] - s.minutes) < Math.abs(a[1] - s.minutes) ? b : a)[0]);
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
  // P-21. Today's trend day from Your week: that trend's session, behind its door.
  container.querySelector('[data-action="week-trend"]')?.addEventListener("click", () => {
    const t = todayInWeek()?.template; if (!t?.trend) return;
    const d = trendDayToday(t);
    router.pathStart = { door: d.door, trendDay: d.trend, mins: d.mins };
    if (needsCheckin()) { store.set("pendingDoorRoute", "path"); router.navigate("checkin"); return; }
    router.navigate("path");
  });
  // P-26. A session they built: today's planned one, or Your week's day.
  container.querySelectorAll('[data-action="planned"], [data-action="week-saved"]').forEach(btn => btn.addEventListener("click", () => {
    const r = savedById(btn.dataset.saved); if (!r) return;
    router.pathStart = { door: savedDoor(r), saved: r.id };
    if (needsCheckin()) { store.set("pendingDoorRoute", "path"); router.navigate("checkin"); return; }
    router.navigate("path");
  }));
  container.querySelector('[data-action="path-coach"]')?.addEventListener("click", () => startCoachChoice(router));
  // P-39. Making my Move: its way in, today's word, and the hard-day choices.
  container.querySelector('[data-action="mm-open"]')?.addEventListener("click", () => router.navigate("my-move"));
  container.querySelector('[data-action="mm-usual"]')?.addEventListener("click", () => {
    setToday("usual");
    router.homeFocus = "doors";
    router.navigate("today");
  });
  // S6. The in-between day's question: Yes is today's hard day; No keeps the plan. Either way it is answered for today.
  container.querySelector('[data-action="ask-hard-yes"]')?.addEventListener("click", () => {
    setToday("hard");
    router.homeFocus = "mm";
    router.navigate("today");
  });
  container.querySelector('[data-action="ask-hard-no"]')?.addEventListener("click", () => {
    setToday("usual");
    router.homeFocus = "doors";
    router.navigate("today");
  });
  // P-45. Look at them: What your physio or trainer changed. Later: My exercises keeps them.
  container.querySelector('[data-action="ask-live-yes"]')?.addEventListener("click", () => {
    const m = liveWaiting(); if (!m) return;
    store.noticeLiveInbox(`${m.link}:${m.msg}`);
    router.planBack = m.code; router.planBackInbox = `${m.link}:${m.msg}`;
    router.navigate("plan-link-back");
  });
  container.querySelector('[data-action="ask-live-no"]')?.addEventListener("click", () => {
    const m = liveWaiting(); if (m) store.noticeLiveInbox(`${m.link}:${m.msg}`);
    router.homeFocus = "doors";
    router.navigate("today");
  });
  // S6. The twelve-week turn: answered either way, not asked again until the next turn.
  container.querySelector('[data-action="ask-review-yes"]')?.addEventListener("click", () => {
    setReviewed();
    router.navigate("my-move");
  });
  container.querySelector('[data-action="ask-review-no"]')?.addEventListener("click", () => {
    setReviewed();
    router.homeFocus = "doors";
    router.navigate("today");
  });
  container.querySelector('[data-action="mm-arc"]')?.addEventListener("click", () => router.navigate("arc-setup"));
  container.querySelector('[data-action="mm-week"]')?.addEventListener("click", () => router.navigate("your-week"));
  container.querySelector('[data-action="mm-own"]')?.addEventListener("click", () => router.navigate("prescribed"));
  container.querySelector('[data-action="start-close"]')?.addEventListener("click", () => {
    store.setMyMove({ startClosed: new Date().toISOString() });
    router.homeFocus = "doors";
    router.navigate("today");
  });
  container.querySelector('[data-action="hard-coach"]')?.addEventListener("click", () => startCoachChoice(router));
  container.querySelector('[data-action="hard-stretch"]')?.addEventListener("click", () => {
    router.pathStart = { door: "stretch" };
    if (needsCheckin()) { store.set("pendingDoorRoute", "path"); router.navigate("checkin"); return; }
    router.navigate("path");
  });
  container.querySelector('[data-action="hard-walk"]')?.addEventListener("click", () => router.navigate("walk-session"));
  container.querySelector('[data-action="hard-calm"]')?.addEventListener("click", () => router.navigate("noticing"));
  // P-31. Change today, its Undo, and Little and often.
  container.querySelector('[data-action="change-today"]')?.addEventListener("click", () => router.navigate("change-today"));
  container.querySelector('[data-action="undo-change"]')?.addEventListener("click", () => {
    undoToday();
    router.homeFocus = "change";
    router.navigate("today");
  });
  container.querySelectorAll('[data-action="lao-start"]').forEach(btn => btn.addEventListener("click", () => {
    store.set("myExercisesGroup", btn.dataset.group);
    router.navigate("prescribed-session");
  }));
  container.querySelector('[data-action="lao-all"]')?.addEventListener("click", () => router.navigate("prescribed"));
  // After Change today or Undo, the next thing to read is the change itself.
  const focus = router.homeFocus;
  if (focus) {
    router.homeFocus = null;
    const el = focus === "doors" ? container.querySelector("#path-doors-h")
      : focus === "mm" ? container.querySelector('[data-action="mm-usual"]')
      : container.querySelector('[data-action="undo-change"]') || container.querySelector('[data-action="change-today"]');
    el?.focus();   // the router keeps focus a view has placed (router.js W4-18)
  }
}

/** P-27. Let me choose for you, from anywhere: today's check-in first when
 *  there has not been one, then the coach's choice (Home's row, the arc's
 *  Start today's session, an empty Saved sessions). One way, one plan. */
export function startCoachChoice(router) {
  if (needsCheckin()) { router.pathStart = { coach: true }; store.set("pendingDoorRoute", "today"); router.navigate("checkin"); return; }
  goToSuggestion(router);
}
