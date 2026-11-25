/**
 * views/free-home.js
 * 24 Nov 2026 v2
 *
 * v2 - P-46 WAVE 8 FIX. Done today names the session from workoutHistory
 *   when the log entry has no name (Free's never does): it said "Your session"
 *   in the Wave 8 trace.
 *
 * 24 Nov 2026 v1
 *
 * v1 - P-46 S4 FREE HOME (spec alongside_free-and-first_24nov2026_v1 §5;
 *   Graeme, 24 Nov: "Coach-led Free, Plan look"). Free Home is the coach,
 *   today: the Today card (check in, then today's session; Done today once
 *   it is done), Something gentler, six ready-made sessions, Log what I did,
 *   Your exercises when there is a list, and one line to what the Plan adds.
 *   Choosing any kind of session, the arc, the Library's shelves and the
 *   twelve-week programme moved to the Plan (router.js v62, on-the-plan.js).
 *   Kept word for word, passed in by today.js: the scope notice, the monthly
 *   advice line, the rescued note and the part-way card. The Bad-day choice
 *   stays where it is, on Today's plan.
 *
 *   The look is Plan Home's (path-* classes, css/components/path.css).
 *   today.js's attachEvents() wires start-today, data-route, carry-*, the
 *   ask-later card and Update check-in; wireFreeHome() the two presses only
 *   this Home has.
 */
import { store } from "../store.js";
import { lineIcon } from "../data/line-icons.js";
import { setTodaysLength } from "../data/session-length.js";
import { askLaterCard, dueAskLater } from "../data/ask-later.js";

const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const NOT_MOVEMENT = ["breathing", "mindful", "mindfulness", "practice"];
const dayOf = ts => { try { return new Date(ts).toISOString().split("T")[0]; } catch { return ""; } };

/** Home or gym, for the six and for Something gentler: the last place moved, else the place given at the start. */
export function freePlace() {
  const log = store.completedSessions(store.get("activityLog") || []);
  for (let i = log.length - 1; i >= 0; i--) if (log[i].place === "home" || log[i].place === "gym") return log[i].place;
  return store.get("sessionLocation") === "gym" ? "gym" : "home";
}

/** Today's finished movement session, if there is one. */
function doneToday() {
  const t = new Date().toISOString().split("T")[0];
  const log = store.completedSessions(store.get("activityLog") || [])
    .filter(e => !NOT_MOVEMENT.includes(e.type))
    .filter(e => dayOf(e.completedAt || e.loggedAt || e.date) === t);
  return log.length ? log[log.length - 1] : null;
}

const hasList = () => (store.get("prescribedExercises") || []).length > 0;

function head(kind, icon, eyebrow, title) {
  return `<div class="path-today__head"><span class="kind-tile k-${kind}">${lineIcon(icon)}</span>
      <div class="path-today__titles"><p class="path-today__eyebrow">${esc(eyebrow)}</p><h2 class="path-today__title" id="path-today-h">${esc(title)}</h2></div></div>`;
}

function todayCard(checkedIn) {
  const done = doneToday();
  if (done) {
    // Free's log entry carries no name (workout.js _pathFields is the Plan's); the session's own history does.
    const wh = (store.get("workoutHistory") || []).slice(-1)[0];
    const title = done.name || done.title || (wh?.name && dayOf(wh.completedAt) === dayOf(done.completedAt || done.date) ? wh.name : "") || "Your session";
    return `<section class="path-today k-teal" data-state="done" aria-labelledby="path-today-h">${head("teal", "tick", "Done today", title)}
      <p class="path-today__coach">That’s today done.</p></section>`;
  }
  if (checkedIn) {
    return `<section class="path-today k-teal" data-state="ready" aria-labelledby="path-today-h">${head("teal", "chat", "Today", "Your session is ready")}
      <p class="path-today__coach">Built from how you are today.</p>
      <button type="button" class="btn btn-primary btn-full path-today__go" data-action="start-today">Show me my session</button></section>`;
  }
  return `<section class="path-today k-teal" data-state="checkin" aria-labelledby="path-today-h">${head("teal", "chat", "Today", "How are you today?")}
      <p class="path-today__coach">Three taps, then your session.</p>
      <button type="button" class="btn btn-primary btn-full path-today__go" data-action="start-today" data-guide-target="not-sure">Check in</button></section>`;
}

function door(attrs, kind, icon, title, sub) {
  return `<li class="path-doors__wide"><button type="button" class="path-door path-door--wide" ${attrs}>
          <span class="kind-tile k-${kind}">${lineIcon(icon)}</span>
          <span class="path-door__text"><span class="path-door__t">${esc(title)}</span><span class="path-door__d">${esc(sub)}</span></span>
          <span class="path-door__chev" aria-hidden="true">${lineIcon("chevron", 20)}</span>
        </button></li>`;
}

/**
 * ctx: { greeting, coachNote, top, carryCard, checkedIn }. carryCard (the
 * part-way session, to save or let go) takes the Today card's place.
 */
export function renderFreeHome(ctx = {}) {
  return `
    <div class="path-home free-home">
      ${ctx.top || ""}
      <h1 class="path-greeting" tabindex="-1">${esc(ctx.greeting || "")}</h1>
      ${ctx.coachNote ? `<p class="path-note" role="status">${esc(ctx.coachNote)}</p>` : ""}
      ${ctx.carryCard || todayCard(!!ctx.checkedIn)}
      ${askLaterCard(dueAskLater())}
      <h2 class="look-label" id="free-more-h">Or something else</h2>
      <ul class="path-doors" aria-labelledby="free-more-h">
        ${door('data-action="free-gentler"', "violet", "mobility", "Something gentler", "A short, easy session")}
        ${door('data-action="free-ready"', "amber", "strength", "Ready-made sessions", "Six to choose from")}
        ${door('data-route="activity-log" data-requires-checkin="false"', "slate", "pencil", "Log what I did", "A walk, a swim, a class")}
        ${hasList() ? door('data-route="prescribed" data-requires-checkin="false"', "teal", "list", "Your exercises", "Your own list") : ""}
      </ul>
      <button type="button" class="path-link free-home__plan" data-route="upgrade" data-requires-checkin="false">Want more choice? See what the Plan adds</button>
      ${ctx.checkedIn ? `<button type="button" class="path-link today-checkin-link" data-action="checkin-mini">Update check-in</button>` : ""}
    </div>`;
}

/** Something gentler: Today's plan, mobility, about ten minutes, at the last place. */
export function askGentler() {
  store.set("requestedSessionType", "mobility");
  store.set("requestedLocation", freePlace());
  setTodaysLength("micro");
}

/**
 * Something gentler and the six. The check-in clears any request when it
 * starts (purpose.js clearPurpose), so with no check-in yet it goes first and
 * comes back to Home (router.freeGentler), which asks for the gentle session
 * then (today.js mount), as the Plan's coach row does.
 */
export function wireFreeHome(container, router, { checkedIn = false } = {}) {
  container.querySelector('[data-action="free-gentler"]')?.addEventListener("click", () => {
    if (checkedIn) { askGentler(); router.navigate("coach-proposal"); return; }
    router.freeGentler = true;
    store.set("pendingDoorRoute", "today");
    router.navigate("checkin");
  });
  container.querySelector('[data-action="free-ready"]')?.addEventListener("click", () => {
    router.pathStart = { free: true, place: freePlace() };
    router.navigate("path");
  });
}
