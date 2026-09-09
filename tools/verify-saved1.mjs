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

// ── 7. EDITING KEEPS WHAT YOU SAVED ─────────────────────────────────────
console.log("\nTEST 7 - a saved session survives a round trip through the editor");

// THE ASSERTION THIS WHOLE FEATURE TURNS ON.
//
// The first implementation loaded saved sessions through
// buildSessionFromSelection(), which intersects the ids with the
// candidate pool for the session type -- filtered by categories,
// equipment and conditions AS THEY ARE NOW. Measured on this fixture:
// FOUR movements in, TWO back, and the save that followed reported
// "Saved. Your changes are in."
//
// Opening a session to change one thing, losing half of it, and being
// told it worked is worse than not being able to edit at all.
//
// Starting a saved session already keeps every movement -- no category,
// equipment or condition filter is applied on that path. Editing must
// not enforce a rule starting does not.

const savedData = await import(B + "data/saved-sessions.js");
const builder   = await import(B + "session-builder.js");

fixture();
const roundTrip = savedData.savedSessions()[0] || null;
ok("7pc. positive control: there is a saved session to edit",
   !!roundTrip && (roundTrip.exerciseIds || []).length > 0,
   "no fixture session - everything below measures nothing");

if (roundTrip) {
  const { exercises } = savedData.resolveSavedSession(roundTrip);
  const rebuilt = builder.buildSessionFromSaved({
    sessionType:  roundTrip.sessionType,
    durationMins: roundTrip.durationMins,
    exercises,
    title:        roundTrip.name
  });

  ok("7a. the editor builds something from it", !!rebuilt,
     "buildSessionFromSaved returned null for a session that resolves");

  const backIds = (rebuilt?.exercises || []).map(e => e.id);
  ok("7b. EVERY resolvable movement comes back",
     backIds.length === exercises.length,
     `went in with ${exercises.length}, came back with ${backIds.length}: ` +
     `lost ${exercises.map(e => e.id).filter(id => !backIds.includes(id)).join(", ")}`);

  ok("7c. and they are the same ones, not replacements",
     exercises.every(e => backIds.includes(e.id)),
     `in:  ${exercises.map(e => e.id).join(", ")}\n        out: ${backIds.join(", ")}`);

  ok("7d. the person's own name is kept, not replaced by a type label",
     rebuilt?.title === roundTrip.name,
     `title is "${rebuilt?.title}", the session is called "${roundTrip.name}"`);

  ok("7e. every movement carries a section so the preview can group it",
     (rebuilt?.exercises || []).every(e => ["warmup", "main", "cooldown"].includes(e.section)),
     "library exercises carry no section - it is assigned at assembly, and " +
     "one without it disappears from a preview that groups by section");

  ok("7f. and a role, so the card does not print UNDEFINED (ROLE-1)",
     (rebuilt?.exercises || []).every(e => ["warmup", "main", "cooldown"].includes(e.role)),
     "a new assembler that forgets the stamp reopens ROLE-1 on this path");

  // The write-back, end to end.
  // Counted BEFORE, not asserted as a literal: the fixture holds more
  // than one session, and hard-coding 1 here asserted the fixture rather
  // than the behaviour. What matters is that editing adds no record.
  const countBefore = savedData.savedSessions().length;
  const res = savedData.updateSavedSession(roundTrip.id, {
    name:        roundTrip.name,
    exerciseIds: backIds
  });
  const after = savedData.savedSessions().find(x => x.id === roundTrip.id);
  ok("7g. saving writes back to the SAME record, not a new one",
     res.ok && savedData.savedSessions().length === countBefore,
     `${countBefore} records before the edit, ${savedData.savedSessions().length} after - ` +
     `editing spawned a copy instead of overwriting`);
  ok("7h. with nothing lost on the way out",
     (after?.exerciseIds || []).length === exercises.length,
     `saved ${after?.exerciseIds?.length} of ${exercises.length}`);
  ok("7i. createdAt untouched, so the list does not reshuffle",
     after?.createdAt === roundTrip.createdAt,
     "editing moved the session in a list ordered by createdAt");
  ok("7j. updatedAt stamped", !!after?.updatedAt);
}

// ── 8. AN EDIT CANNOT EMPTY A SESSION ───────────────────────────────────
console.log("\nTEST 8 - an edit cannot leave a session with nothing in it");

fixture();
const target = savedData.savedSessions()[0];
const emptied = savedData.updateSavedSession(target.id, { exerciseIds: [] });
ok("8a. it is refused", emptied.ok === false && emptied.reason === "empty",
   `returned ${JSON.stringify(emptied)}`);
ok("8b. and nothing changed",
   (savedData.savedSessions().find(x => x.id === target.id)?.exerciseIds || []).length ===
   (target.exerciseIds || []).length,
   "an emptying edit went through - that is a deletion wearing an edit's " +
   "clothes, and it leaves a row whose start button 2b already suppresses");

const blankName = savedData.updateSavedSession(target.id, { name: "   " });
ok("8c. and a name cannot be emptied either",
   blankName.ok === false && blankName.reason === "name",
   "creation requires a name; an edit that can remove it is a second set " +
   "of rules that will drift from the first");

// ── 9. THE EDIT ROUTE ITSELF, NOT JUST THE ASSEMBLER ────────────────────
console.log("\nTEST 9 - the Edit button actually reaches the preserving builder");

// Test 7 calls buildSessionFromSaved() directly. That proves the
// assembler is right and proves NOTHING about the wiring: reversing the
// edit route back to buildSessionFromSelection() -- the exact defect
// this feature was rebuilt to fix -- left test 7 entirely green.
//
// A gate that verifies a function while the screen calls a different one
// is the source-text problem wearing a fixture's clothes.

const builderView = await import(B + "views/session-builder-ui.js?saved2");

fixture();
const editTarget = savedData.savedSessions()[0];
const savedCount = (editTarget.exerciseIds || []).length;

store.set("sessionBuilderPreselect", {
  mode: "edit", savedSessionId: editTarget.id, returnTo: "saved-sessions"
});

main.innerHTML = builderView.render();
builderView.onMount();

ok("9pc. positive control: the builder reached the PREVIEW",
   !!main.querySelector("#sb-save-open"),
   `landed on: ${(main.textContent || "").replace(/\s+/g, " ").trim().slice(0, 90)}`);

ok("9a. and the preselect was consumed",
   !store.get("sessionBuilderPreselect"),
   "an edit preselect left in the store re-opens this session on the next build");

// Against the RESOLVABLE count, not the saved id count. This fixture
// deliberately carries an id that is gone from the library, and an id
// with no exercise behind it cannot be shown by anything. Comparing to
// exerciseIds.length asserted the fixture's own gap as a defect.
const resolvable = savedData.resolveSavedSession(editTarget).exercises.length;
const rows  = main.querySelectorAll('[role="listitem"]').length;
const swaps = main.querySelectorAll("[data-swap-index]").length;

ok("9b. EVERY resolvable saved movement is on the preview",
   rows === resolvable,
   `${resolvable} of the session's ${savedCount} ids resolve, the editor ` +
   `shows ${rows} rows. This is the defect the feature was rebuilt for: ` +
   `the route going through a builder that filters against today's ` +
   `categories, equipment and conditions instead of one that keeps what ` +
   `was saved`);

// Counted separately, because a row and a CHANGEABLE row are not the
// same thing. The edit preview first shipped with every movement on
// screen and none of them swappable -- candidatePools was never built,
// so _canSwap() answered false for all of them and editing meant
// renaming. Rows alone would have called that a pass.
ok("9e. and they can actually be changed",
   swaps === rows && swaps > 0,
   `${rows} rows, ${swaps} of them changeable. Editing a saved session ` +
   `that cannot be changed is a rename with extra steps`);

ok("9c. under the person's own name",
   /\b(Sunday|Ten minutes)\b/.test(main.textContent || "") ||
   (main.textContent || "").includes(editTarget.name),
   `the preview does not show "${editTarget.name}"`);

ok("9d. and the save action offers to change it, not to make a second one",
   /save your changes/i.test(main.querySelector("#sb-save-open")?.textContent || ""),
   `the button says "${main.querySelector("#sb-save-open")?.textContent.trim()}" - ` +
   `an edit that reads as a fresh save invites a duplicate`);

console.log(fails === 0
  ? "\nSAVED-1: all assertions pass\n"
  : `\nSAVED-1: ${fails} FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
