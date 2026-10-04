/**
 * data/kind-colours.js
 * 04 Oct 2026 v1
 *
 * LOOK-2 / LOOK-3 (Graeme, 04 Oct: "Both lack colour"). One colour per
 * kind of session, the same everywhere it is drawn (variables.css
 * --kind-*). Pure: reads only the entry it is given.
 *
 *   amber   strength and the gym (built strength sessions, core, morning)
 *   violet  mobility, stretching, yoga, Pilates
 *   blue    walking, running, cycling, swimming, cardio
 *   rose    classes
 *   green   breathing and quiet practice
 *   teal    sessions you made yourself (your own, made up as you went,
 *           your own exercises)
 *   slate   anything else
 *
 * A colour is never the only thing said: wherever one is drawn, the kind's
 * name and its count sit beside it (WCAG 1.4.1).
 */

const BY_SESSION_TYPE = {
  glute: "amber", upper: "amber", lower: "amber", full: "amber", core: "amber", gym: "amber",
  mobility: "violet", stretch: "violet",
  cardio: "blue",
};

const BY_TYPE = {
  "workout": "amber", "core-session": "amber", "morning-session": "amber", "coach-session": "amber",
  "hiit": "amber", "boxing": "amber",
  "yoga": "violet", "yoga-session": "violet", "body-balance": "violet",
  "walk": "blue", "walk-session": "blue", "run": "blue", "running-session": "blue",
  "swim": "blue", "swim-session": "blue", "cycle": "blue", "cycle-session": "blue",
  "outdoor-cycle": "blue", "hike": "blue", "outdoor": "blue", "row": "blue", "spin": "blue",
  "class": "rose",
  "mindfulness": "green", "breathing-session": "green", "mindful": "green",
  "quiet-session": "green", "practice": "green",
  "gym": "teal", "gym-programme": "teal", "freestyle": "teal", "capture": "teal",
  "prescribed-session": "teal",
};

export const KINDS = Object.freeze(["teal", "amber", "violet", "blue", "rose", "green", "slate"]);

/** The kind colour for one activity-log entry. */
export function kindOf(entry) {
  if (!entry) return "slate";
  // A hand-logged gym visit is strength, not a session the builder made.
  if (entry.type === "gym" && entry.source === "self-logged") return "amber";
  const built = entry.type === "workout" || entry.type === "gym" || entry.type === "gym-programme";
  if (built && BY_SESSION_TYPE[entry.sessionType]) return BY_SESSION_TYPE[entry.sessionType];
  return BY_TYPE[entry.type] || "slate";
}
