/**
 * tools/verify-saved1.mjs
 * 08 Sep 2026 v1
 *
 * SAVED-1. The Your own room's count is a promise, and this is where it
 * is kept.
 *
 * WHAT SHIPPED. YOUR-OWN (06 Sep) saved sessions, showed the newest on
 * Home, and put the rest behind a counted button -- "Your other 2
 * sessions" -- carrying `data-route="session-builder"`. That button
 * opened the BUILDER: the screen for making a NEW session, reached by
 * tapping a control that names the ones you already have. And there was
 * nowhere else for it to go. `savedSessions` was referenced in exactly
 * one file, no list view existed, no route pointed at one, and nothing
 * in the app could show you something you saved a fortnight ago.
 *
 * Graeme, on a handset: "I can't seem to be able to save my own series
 * of sessions. No place for history to exist of recall."
 *
 * TEST 3 IS THE ONE THAT WOULD HAVE CAUGHT IT. A gate that only mounts
 * the new view proves a list exists; it does not prove anybody can reach
 * it. The defect was never in a view, it was in where a button pointed.
 *
 * TIER IS TESTED AS TWO DIFFERENT EMPTY STATES, not one. savedSessions()
 * returns [] for a free account BY DESIGN -- free composes freely, the
 * Plan is what KEEPS it (R4, 20 Aug, which reversed TIER-G on exactly
 * that point). So [] means two unrelated things. "You have not saved
 * anything yet" told to somebody who cannot save is a lie, and an
 * upgrade line told to somebody who simply has none answers a question
 * they did not ask. Test 4 asserts they never swap.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
import fs from "node:fs";

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

const R = new URL("../", import.meta.url);
const readRepo = (rel) => fs.readFileSync(new URL(rel, R), "utf8");
const B = new URL("../js/", import.meta.url).href;

const { store } = await import(B + "store.js");
const view      = await import(B + "views/saved-sessions.js");
const { TodayView } = await import(B + "views/today.js");

let fails = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) { if (detail) console.log(`        ${detail}`); fails++; }
};

const main = document.getElementById("main-content");
const now  = Date.now();

// Real library ids. A fixture built on invented ids would report every
// session as missing movements and test 2 would pass on a fault.
const FIXTURE = [
  { id: "own_1", name: "Knees-friendly legs", sessionType: "lower", durationMins: 25,
    equipment: ["dumbbells"], exerciseIds: ["cat-cow", "90-90-hip-stretch", "thoracic-rotation"],
    createdAt: new Date(now - 20 * 86400000).toISOString(),
    lastUsedAt: new Date(now - 14 * 86400000).toISOString() },
  { id: "own_2", name: "Ten minutes when I can't face it", sessionType: "mobility", durationMins: 10,
    equipment: [], exerciseIds: ["cat-cow", "THIS-ID-IS-GONE"],
    createdAt: new Date(now - 3 * 86400000).toISOString(), lastUsedAt: null }
];

function fixture({ tier = "personal", saved = FIXTURE } = {}) {
  localStorage.clear();
  store.init();
  store.set("tier", tier);
  store.set("savedSessions", saved);
  main.innerHTML = "";
}

const text = () => (main.textContent || "").replace(/\s+/g, " ").trim();

// ── 1. THE LIST EXISTS AND HOLDS EVERYTHING ─────────────────────────────
console.log("\nTEST 1 - every saved session is on the list");

fixture();
main.innerHTML = view.render();
view.onMount();

ok("1pc. positive control: the view rendered", text().length > 0,
   "empty container - everything below measures nothing");
ok("1a. both saved sessions are listed",
   /Knees-friendly legs/.test(text()) && /Ten minutes when I can't face it/.test(text()),
   text().slice(0, 200));
ok("1b. each has a start control",
   main.querySelectorAll("[data-saved-id]").length === 2,
   `${main.querySelectorAll("[data-saved-id]").length} start buttons for 2 sessions`);
ok("1c. newest first, as savedSessions() returns them",
   text().indexOf("Ten minutes") < text().indexOf("Knees-friendly"),
   "the order was re-sorted somewhere - the list is theirs in the order they made it");

// ── 2. MISSING MOVEMENTS ARE SAID, NOT SWALLOWED ────────────────────────
console.log("\nTEST 2 - a session missing a movement says so");

// resolveSavedSession() has always returned `missing` alongside the
// exercises, because "a session that quietly comes back four movements
// shorter than the person wrote is worse than one that says so". Its
// only other caller drops it.
ok("2a. the session with a dead id is flagged",
   /no longer in the library/.test(text()),
   "the warning is absent, so a session silently comes back short");
ok("2b. and the intact one is NOT flagged",
   (text().match(/no longer in the library/g) || []).length === 1,
   "every row is being warned, so the warning means nothing - " +
   "check the fixture ids are real library ids before believing this");

// ── 2b. NOTHING LEFT TO START ───────────────────────────────────────────
console.log("\nTEST 2b - a session whose movements have ALL gone offers no dead button");

// Found 08 Sep by mounting this view with a fixture whose ids resolve to
// nothing. The start handler ends `if (!exercises.length) return;` -- a
// SILENT no-op. Tapping Start did nothing at all: no navigation, no
// message, no change on screen. A dead control with no explanation is
// the shape STUCK-1 was, and the warning above it made it worse by
// promising the session "will start without them".
//
// The same silent return sits in today.js's copy of this handler, on the
// Home room's featured session. Logged there, not fixed here.

fixture({ saved: [
  { id: "own_gone", name: "Old favourite", sessionType: "glute", durationMins: 30,
    equipment: [], exerciseIds: ["THIS-ID-IS-GONE", "THIS-ONE-TOO"],
    createdAt: new Date(now - 40 * 86400000).toISOString(), lastUsedAt: null }
] });
main.innerHTML = view.render();
view.onMount();

ok("2b-pc. positive control: the row rendered",
   /Old favourite/.test(text()),
   "the row is absent entirely - the assertions below measure nothing");
ok("2b-a. no start button is offered",
   !main.querySelector("[data-saved-id]"),
   "a button is present that does nothing when tapped, silently");
ok("2b-b. and the copy does not promise it will start",
   !/will start without/.test(text()),
   "the card says the session will start without the missing movements, " +
   "which is exactly what the handler refuses to do");
ok("2b-c. it says plainly why instead",
   /nothing left to start/.test(text()),
   text().slice(0, 200));
ok("2b-d. and the session is still listed, not hidden",
   /Old favourite/.test(text()) && /1 saved/.test(text()),
   "the row was removed - it is still the person's session, and making " +
   "it vanish answers a question they did not ask");

// ── 3. THE COUNTED BUTTON REACHES IT ────────────────────────────────────
console.log("\nTEST 3 - the Your own room's counted button leads here");

// The defect was never in a view. It was in where a button pointed.
fixture();
const navs = [];
TodayView({ navigate: (r) => navs.push(r) }).mount(main);

const counted = [...main.querySelectorAll("button")]
  .find(b => /Your other \d+ session/.test(b.textContent || ""));

ok("3pc. positive control: the counted button is on Home", !!counted,
   "no 'Your other N sessions' button - test 3 measures nothing");
ok("3a. it does not point at the builder",
   !!counted && counted.dataset.route !== "session-builder",
   "a button naming sessions you already have opens the screen for making " +
   "a new one - this is the fault verbatim");
ok("3b. it points at the saved-sessions list",
   !!counted && counted.dataset.route === "saved-sessions",
   `data-route="${counted ? counted.dataset.route : "-"}"`);

if (counted) {
  counted.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
  ok("3c. and tapping it actually navigates there",
     navs.includes("saved-sessions"),
     `navigated: ${navs.join(", ") || "nowhere"}`);
}

// The route has to be registered or 3c navigates into a 404.
const routerSrc = readRepo("js/router.js");
ok("3d. the route is registered in the router",
   /'saved-sessions':\s*\{\s*path:\s*'\.\/views\/saved-sessions\.js'/.test(routerSrc),
   "navigate('saved-sessions') resolves to nothing");
ok("3e. and it maps back to Today, the door it is reached from",
   /'saved-sessions':\s*'today'/.test(routerSrc),
   "the highlighted tab will disagree with the door somebody came through - " +
   "the NAV-8 fault");

// ── 4. TWO EMPTY STATES, NEVER SWAPPED ──────────────────────────────────
console.log("\nTEST 4 - an empty list means two different things");

fixture({ tier: "personal", saved: [] });
main.innerHTML = view.render();
const planEmpty = text();
ok("4a. Plan with nothing saved is told it has nothing saved",
   /Nothing saved yet/i.test(planEmpty), planEmpty.slice(0, 160));
ok("4b. and is NOT sold an upgrade it already has",
   !/Plan tier|upgrade/i.test(planEmpty),
   "answering a question they did not ask");

fixture({ tier: "free" });
main.innerHTML = view.render();
const freeEmpty = text();
ok("4c. free is told why the list is empty",
   /Plan tier/i.test(freeEmpty), freeEmpty.slice(0, 160));
ok("4d. and is NOT told it has saved nothing, which would be untrue",
   !/Nothing saved yet/i.test(freeEmpty),
   "somebody who cannot save is being told they have not saved");

// ── 5. ACCESSIBILITY ────────────────────────────────────────────────────
console.log("\nTEST 5 - the list is navigable and its controls say what they do");

fixture();
main.innerHTML = view.render();

ok("5a. the screen has one h1", main.querySelectorAll("h1").length === 1,
   `${main.querySelectorAll("h1").length} h1 elements`);
ok("5b. each saved session is a heading, so the list can be skimmed by one",
   main.querySelectorAll("h2").length === 2,
   `${main.querySelectorAll("h2").length} h2 elements for 2 sessions`);

for (const btn of main.querySelectorAll("[data-saved-id]")) {
  const name = btn.getAttribute("aria-label") || "";
  const seen = (btn.textContent || "").replace(/\s+/g, " ").trim();
  ok(`5c. "${seen.slice(0, 34)}" carries its facts in its accessible name`,
     /movement/.test(name) && (/minutes/.test(name) || /Not done|Last done/.test(name)),
     `aria-label="${name}" - a screen reader hears a name with no idea how ` +
     `long it is or whether it has ever been done (WCAG 2.2 AA 2.4.6)`);
  // 2.5.3 Label in Name: voice control must be able to address it by
  // what it visibly says.
  ok(`5d. and its visible text is inside that name (2.5.3)`,
     name.includes(seen), `visible "${seen}" not inside "${name}"`);
}

// ── 6. THE TOP-RIGHT CORNER ─────────────────────────────────────────────
console.log("\nTEST 6 - nothing is placed under the escape hatch");

// STUCK-1, 08 Sep: the coach-proposal panel could not be left because a
// close control sat under the fixed top-right hatch and both became
// untappable. A new screen is exactly where that gets repeated.
const viewSrc = readRepo("js/views/saved-sessions.js");
ok("6a. this view declares no fixed or absolute positioning",
   !/position:\s*(fixed|absolute)/.test(viewSrc),
   "an inline fixed/absolute element here can land under the escape hatch; " +
   "if that is intended, the selector goes in the corners list in " +
   "verify-hatchoverlap.mjs and gets a gutter");

console.log(fails === 0
  ? "\nSAVED-1: all assertions pass\n"
  : `\nSAVED-1: ${fails} FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
