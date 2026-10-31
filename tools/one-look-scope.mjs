/**
 * tools/one-look-scope.mjs
 * 31 Oct 2026 v1
 *
 * STAGE PATH Session 9. Which Plan screens verify-one-look and
 * chromium-one-look hold, in one place so the two cannot disagree.
 *
 * P13_ROOMS: the rooms P-13 LIBRARY-AND-ROOMS moves to the new look (the
 * schedule's P-13 row, decided 29 Oct). Graeme, 31 Oct, chose to fix every
 * other Plan screen in Session 9, and that included My exercises
 * (prescribed) and the twelve-week shape (goal-setup), so those two left
 * this list. When P-13 moves a room, it comes off this list and the gates
 * hold it from then on. Nothing is ever added here to make a gate pass.
 *
 * SESSION_SCREENS: a session in progress, where the way out says "Exit"
 * (Graeme, 31 Oct: Exit only once a session has started).
 *
 * NOT_A_ROOM: screens left only by answering them (the gate screens), which
 * have no way back by design (W4-1 GATE-OPEN).
 *
 * NOT_ON_THE_PLAN: screens no Plan screen opens. checkin-mini (Update
 * check-in) is offered only on Free's Home: the Plan's Home returns before
 * that row is drawn, and the Plan changes its check-in from Today's plan
 * (Change my check-in, the full check-in). verify-one-look proves it.
 */
export const P13_ROOMS = [
  "classes", "class-player", "in-step", "session-builder", "mobility-conditioning",
  "morning-session", "core-session", "yoga-session", "quiet-session", "breathing-session",
];
export const SESSION_SCREENS = ["workout", "capture", "prescribed-session", "gym-programme"];
export const NOT_A_ROOM = ["age-check", "under-18", "consent-update", "health-consent", "red-flag"];
export const NOT_ON_THE_PLAN = ["checkin-mini"];
