/**
 * tools/verify-role1.mjs
 * 08 Sep 2026 v1
 *
 * ROLE-1. A card must never print the word "undefined".
 *
 * WHAT SHIPPED. Every exercise in every coach-built session reached the
 * views with `role` undefined -- ten of ten in a Glute Focus build, so
 * the whole One to one route, every card, since the badge was added.
 * workout.js renders that field as the badge above the exercise name and
 * `formatRole()` ended `roles[role] || role`, which passes its own input
 * through on a miss. A template literal stringifies undefined, so the
 * badge read UNDEFINED in caps, and the same expression fed
 * `class="exercise-role-badge undefined"` and
 * `aria-label="Exercise type: undefined"`. Shown AND spoken.
 *
 * Found on a handset by Graeme, not by this suite. Nothing here mounted
 * the in-session card.
 *
 * WHY BOTH HALVES ARE GATED SEPARATELY. The stamp in session-builder.js
 * is the fix; the guard in formatRole() is the floor underneath it.
 * Test 2 proves the badge is now CORRECT, test 3 proves that an exercise
 * arriving without a role -- a session cached before today, or a future
 * builder that forgets the stamp -- produces an empty slot rather than a
 * word. Gating only the stamp would leave the fallthrough free to echo
 * its input again the moment any other path misses.
 *
 * BOTH BUILDERS. buildSession() is the coach route; buildSessionFromSelection()
 * is build-and-save and Your own. They assemble their exercises in two
 * separate places and the fault was in both. Test 1 checks both, because
 * GUIDED-COPY fixed one branch of a card and left the other lying, and
 * DEVICE-1 moved a fault one tier over within the hour.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="main-content"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = (q) => ({
  matches: /prefers-reduced-motion/.test(q), media: q,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}
});
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [
  ["requestAnimationFrame", (cb) => setTimeout(() => cb(Date.now()), 0)],
  ["cancelAnimationFrame",  (id) => clearTimeout(id)]
]) {
  dom.window[k] = v;
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const sb        = await import(B + "session-builder.js");
const workout   = await import(B + "views/workout.js");

let fails = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) { if (detail) console.log(`        ${detail}`); fails++; }
};

function fixture() {
  localStorage.clear();
  store.init();
  store.set("tier", "personal");
  store.set("homeEquipment", ["dumbbells", "resistance-band"]);
}

const VALID = new Set(["warmup", "main", "accessory", "finisher", "cooldown"]);

// ── 1. THE STAMP, ON BOTH BUILDERS ──────────────────────────────────────
console.log("\nTEST 1 - every exercise leaves the builder with a role");

fixture();
const coachBuilt = sb.buildSession({
  sessionType: "glute", durationMins: 30, equipmentOverride: null, preset: null
});

ok("1pc. positive control: the build produced exercises",
   !!coachBuilt && (coachBuilt.exercises || []).length > 0,
   "buildSession returned nothing - every assertion below measures an empty list");

const coachEx = (coachBuilt && coachBuilt.exercises) || [];
ok("1a. buildSession stamps every one",
   coachEx.length > 0 && coachEx.every(e => VALID.has(e.role)),
   `without a role: ${coachEx.filter(e => !VALID.has(e.role)).map(e => e.name).join(", ") || "-"}`);

ok("1b. and the session is still ordered warm-up, main, cool-down",
   (() => {
     const order = coachEx.map(e => e.role);
     const rank  = { warmup: 0, main: 1, accessory: 1, finisher: 1, cooldown: 2 };
     return order.every((r, i) => i === 0 || rank[order[i - 1]] <= rank[r]);
   })(),
   coachEx.map(e => e.role).join(" > "));

// The other builder. Same fault lived here and it is the one behind
// build-and-save and the Your own room.
fixture();
const ids = coachEx.map(e => e.id).filter(Boolean).slice(0, 5);
const selBuilt = sb.buildSessionFromSelection({
  sessionType: "glute", durationMins: 30, selectedIds: ids, equipmentOverride: null
});
const selEx = (selBuilt && selBuilt.exercises) || [];
ok("1c. positive control: buildSessionFromSelection produced exercises",
   selEx.length > 0,
   "no exercises - 1d below would pass against an empty list");
ok("1d. buildSessionFromSelection stamps every one too",
   selEx.length > 0 && selEx.every(e => VALID.has(e.role)),
   `without a role: ${selEx.filter(e => !VALID.has(e.role)).map(e => e.name).join(", ") || "-"}`);

// ── 2. THE CARD, MOUNTED ────────────────────────────────────────────────
console.log("\nTEST 2 - the badge on the rendered card is a real label");

fixture();
const built = sb.buildSession({
  sessionType: "glute", durationMins: 30, equipmentOverride: null, preset: null
});
store.set("generatedSession", { session: built, builtAt: new Date().toISOString(), inputs: {} });
store.set("activeSession", built);
globalThis.window.router = { navigate: () => {} };

const main = document.getElementById("main-content");
main.innerHTML = workout.render();

ok("2pc. positive control: the card rendered",
   (main.textContent || "").trim().length > 0,
   "empty container - the assertions below measure nothing");

const badge = main.querySelector(".exercise-role-badge");
ok("2a. the badge is present on the first exercise", !!badge,
   "no .exercise-role-badge - a session that HAS a role is not showing it");
ok("2b. and reads a real label", !!badge && /Warm Up|Main|Cool Down|Accessory|Finisher/.test(badge.textContent),
   `badge reads: "${badge ? badge.textContent.trim() : "-"}"`);
ok("2c. its class carries the role, not the word",
   !!badge && !/undefined/.test(badge.className),
   `class="${badge ? badge.className : "-"}"`);
ok("2d. and its accessible name does not say undefined",
   !!badge && !/undefined/i.test(badge.getAttribute("aria-label") || ""),
   `aria-label="${badge ? badge.getAttribute("aria-label") : "-"}"`);

ok("2e. the word appears NOWHERE in the rendered card",
   !/undefined/i.test(main.innerHTML),
   "something else on this screen is printing a missing field raw");

// ── 3. THE FLOOR: A ROLELESS EXERCISE MUST NOT PRINT A WORD ─────────────
console.log("\nTEST 3 - an exercise with no role produces an empty slot, not a word");

// Sessions cached before 08 Sep 2026 carry no role, and any future
// builder that forgets the stamp lands here. This is the case that
// actually shipped.
fixture();
const stripped = {
  ...built,
  exercises: (built.exercises || []).map(({ role, ...rest }) => rest)
};
store.set("generatedSession", { session: stripped, builtAt: new Date().toISOString(), inputs: {} });
store.set("activeSession", stripped);
main.innerHTML = workout.render();

ok("3pc. positive control: the roleless card still rendered",
   (main.textContent || "").trim().length > 0, "empty container");
ok("3a. no badge element is emitted at all",
   !main.querySelector(".exercise-role-badge"),
   "an empty styled pill remains, and its aria-label announces a control " +
   "with nothing in it - worse for a screen reader than no badge");
ok("3b. and the word appears nowhere",
   !/undefined/i.test(main.innerHTML),
   "this is the exact state that shipped: UNDEFINED in the badge, in the " +
   "class attribute and in the aria-label");
ok("3c. the exercise name still renders, so nothing else was lost",
   /exercise-name/.test(main.innerHTML),
   "suppressing the badge took the card with it");

// ── 4. AN UNRECOGNISED ROLE IS NOT A LABEL ──────────────────────────────
console.log("\nTEST 4 - an unknown role token is never printed raw");

// Added 08 Sep after reversal-testing test 3 found it could not tell the
// formatRole() guard from the render guard: `undefined` is falsy, so the
// render guard alone suppressed the badge and reversal 3 stayed green.
//
// This is the case that separates them. A role the map does not know --
// an internal token from some future builder, the same shape as the
// `category` values already on these objects ("cardio-warmup",
// "hip-hinge") -- is a NON-EMPTY string. `roles[role] || role` echoes it
// through, and CSS uppercases it into a badge reading CARDIO-WARMUP with
// no styling class behind it. Printing an internal token to a person is
// the same fault as printing "undefined", one step less obvious.

fixture();
const tokened = {
  ...built,
  exercises: (built.exercises || []).map(e => ({ ...e, role: "cardio-warmup" }))
};
store.set("generatedSession", { session: tokened, builtAt: new Date().toISOString(), inputs: {} });
store.set("activeSession", tokened);
main.innerHTML = workout.render();

ok("4pc. positive control: the card rendered", (main.textContent || "").trim().length > 0,
   "empty container");
ok("4a. the raw token is not shown as a badge",
   !/cardio-warmup/i.test((main.querySelector(".exercise-role-badge") || {}).textContent || ""),
   "an internal id is being displayed to a person as though it were a label");
ok("4b. and no badge element is emitted for it",
   !main.querySelector(".exercise-role-badge"),
   "a badge with no styling class and an internal token inside it");

console.log(fails === 0
  ? "\nROLE-1: all assertions pass\n"
  : `\nROLE-1: ${fails} FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
