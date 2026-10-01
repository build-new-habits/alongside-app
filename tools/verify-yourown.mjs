/**
 * tools/verify-yourown.mjs
 * 01 Oct 2026 v4
 *
 * v4 - DOCS-MOVE. Documents/ left this public repository for the private
 *   BNH-Files repository; the files this check reads are now in docs/ (or,
 *   for the master schedule, read through tools/bnh-files.mjs).
 *
 * v3 - SMOOTH-P3a/b. The Your own ROOM left Plan Home (spec 4.1). What
 *   it held now lives in two places: "I know what I want" (the way to
 *   build one, and the counted way to the ones you saved) and the saved-
 *   sessions list (each session, its facts, Start). Tests 4 and 4b now
 *   mount those, with every property kept: an inviting empty state; a
 *   way to build another that survives the first save and points at the
 *   builder; the newest first; startable; counted, never "More"; the
 *   count is what still exists; one movement is singular; gone movements
 *   said out loud; no dead Start. 4b-b WENT RED on the list -- it had
 *   OWN-1's saved-not-existing count all along -- and saved-sessions.js
 *   v4 fixes it.
 *
 * v2 - OWN-1. Test 4b: the card counts what is THERE, not what was
 *   saved; one movement is singular; and a session whose movements have
 *   all gone offers no dead Start button.
 *
 *   All three were fixed elsewhere first and left standing here.
 *   SAVED-1b fixed the dead button on the saved-sessions list the same
 *   day; PROPOSAL-1 fixed the plural on the proposal card the same day.
 *   Test 4 mounted this room and asserted only that a start button
 *   EXISTS -- which was true throughout, and was the problem.
 *
 * 06 Sep 2026 v1
 *
 * YOUR-OWN. Sessions the person built and kept.
 *
 * THE ROOM WHERE THE COACH LEADS LEAST. The case on record is Graeme's
 * daughter, a national-standard sprinter, writing her programme on
 * paper. SWAP-1 caught the conflation between deleting the flat
 * candidate picker and deleting self-authoring; this is the part that
 * was kept.
 *
 * TWO PROPERTIES THIS GATE EXISTS FOR, both easy to lose quietly:
 *
 *   1. IDS, NOT OBJECTS. Storing whole exercise objects would freeze a
 *      copy of the library inside somebody's saved session -- a safety
 *      correction, a changed contraindication, a fixed `rest` value
 *      would never reach it. A saved session would become a private
 *      fork of the exercise database that no gate can see.
 *
 *   2. THE NAME IS THE PERSON'S. Never generated, never silently
 *      replaced. A helpfully auto-named session takes back the one
 *      thing this room is for.
 */

import { createRequire as __cr } from "node:module";
import fs from "node:fs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="c"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });

const B = new URL("../js/", import.meta.url).href;
const { store }     = await import(B + "store.js");
const { isPremium } = await import(B + "auth.js");
const SS            = await import(B + "data/saved-sessions.js");
const SB            = await import(B + "session-builder.js");
const { TodayView } = await import(B + "views/today.js");

// GATE-PATH, 08 Sep 2026. Paths resolved from import.meta.url, not the
// working directory.
//
// 72 of 139 gates read files by a path relative to process.cwd(), so
// they were green from the repo root and read NOTHING from anywhere
// else. Not a live fault -- every session so far has run them from the
// root -- but an expensive trap: a session running the suite by full
// path from elsewhere sees most of it red and reasonably concludes the
// app is broken.
const _GATE_ROOT = new URL("../", import.meta.url);
const _gatePath = (p) => new URL(String(p).replace(/^\.\//, ""), _GATE_ROOT);

const EX            = await import(B + "data/exercises/index.js");

let fails = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) { if (detail) console.log(`        ${detail}`); fails++; }
};

function seed(tier = "personal") {
  localStorage.clear();
  store.init();
  store.set("tier", tier);
  store.set("equipment", ["none"]);
}
const build = () => SB.buildSession({ sessionType: "lower", durationMins: 30 });

// ── 0. FIXTURE REACH ────────────────────────────────────────────────────
console.log("\nTEST 0 - the fixture builds something real to save");
seed();
ok("0a. the Plan fixture is on Plan", isPremium() === true);
const built = build();
ok("0b. and buildSession produced a session with exercises",
   !!built && (built.exercises || []).length > 0,
   "every save assertion below would be testing the empty-session branch");

// ── 1. IDS, NOT OBJECTS ─────────────────────────────────────────────────
console.log("\nTEST 1 - a saved session does not fork the exercise library");

seed();
const r1 = SS.saveSession("Tuesday legs", build());
ok("1a. saving succeeds on Plan", r1.ok === true, JSON.stringify(r1));

const rec = store.get("savedSessions")[0];
ok("1b. exerciseIds is a list of strings",
   Array.isArray(rec.exerciseIds) && rec.exerciseIds.every(x => typeof x === "string"),
   JSON.stringify(rec.exerciseIds).slice(0, 120));

ok("1c. and no exercise OBJECT was stored anywhere in the record",
   !JSON.stringify(rec).includes('"category"') && !JSON.stringify(rec).includes('"rest"'),
   "an exercise object is embedded in the saved record. A safety correction, a " +
   "changed contraindication or a fixed rest value would never reach this session");

const resolved = SS.resolveSavedSession(rec);
ok("1d. and the ids resolve back to real exercises",
   resolved.exercises.length === rec.exerciseIds.length && resolved.missing === 0,
   `${resolved.exercises.length} of ${rec.exerciseIds.length}, ${resolved.missing} missing`);

// An id that has since gone must be dropped, not block the session.
const gone = SS.resolveSavedSession({ exerciseIds: [...rec.exerciseIds, "no-such-exercise"] });
ok("1e. a since-deleted exercise is dropped, and the rest still resolve",
   gone.exercises.length === rec.exerciseIds.length && gone.missing === 1,
   "refusing to start would punish somebody for a library change they did not make");

// ── 2. THE NAME IS THEIRS ───────────────────────────────────────────────
console.log("\nTEST 2 - the name is never generated");

seed();
ok("2a. an empty name is REJECTED", SS.saveSession("", build()).ok === false);
ok("2b. and whitespace is not a name", SS.saveSession("   ", build()).ok === false);
ok("2c. and nothing was written when it was rejected",
   (store.get("savedSessions") || []).length === 0,
   "a rejected save still wrote a record, so a nameless session exists");

seed();
SS.saveSession("  Sprint prep  ", build());
ok("2d. the name is trimmed but otherwise the person's words",
   store.get("savedSessions")[0].name === "Sprint prep",
   store.get("savedSessions")[0].name);

seed();
SS.saveSession("x".repeat(200), build());
ok("2e. and capped rather than rejected for length",
   store.get("savedSessions")[0].name.length === SS.NAME_MAX,
   `${store.get("savedSessions")[0].name.length} chars`);

// ── 3. TIER ─────────────────────────────────────────────────────────────
console.log("\nTEST 3 - free composes freely; the Plan is that it is kept");

seed("free");
const freeSave = SS.saveSession("Mine", build());
ok("3a. free cannot save", freeSave.ok === false && freeSave.reason === "tier",
   JSON.stringify(freeSave));
ok("3b. and nothing was written", (store.get("savedSessions") || []).length === 0);

// Checked at the READER too. A writer-only check leaves a downgraded
// account still reading what it can no longer add to.
store.set("savedSessions", [{ id: "own_x", name: "Left over", exerciseIds: [] }]);
ok("3c. and free cannot read a leftover list either",
   SS.savedSessions().length === 0,
   "the tier check is only on the writer, so a downgraded account still sees them");

// ── 4. WHERE THE ROOM WENT ──────────────────────────────────────────────
console.log("\nTEST 4 - building and keeping your own, after the room");

const { KnowWhatView } = await import(B + "views/know-what.js");
const LIST = await import(B + "views/saved-sessions.js");
function knowWhat() {
  const c = document.createElement("div");
  document.body.appendChild(c);
  const navs = [];
  KnowWhatView({ navigate: v => navs.push(v) }).mount(c);
  return { c, navs };
}
function list() {
  let m = document.getElementById("main-content");
  if (!m) { m = document.createElement("div"); m.id = "main-content"; document.body.appendChild(m); }
  m.innerHTML = LIST.render();
  try { LIST.onMount(); } catch {}
  return m;
}

seed();
const empty = knowWhat();
const buildBtn = [...empty.c.querySelectorAll("[data-kw-route]")].find(b => b.dataset.kwRoute === "session-builder");
ok("4a. with nothing saved, it invites you to build one",
   !!buildBtn && /Build your own/.test(buildBtn.textContent));
ok("4b. and no longer says saving is not built", !/comes soon/i.test(empty.c.textContent));

seed();
SS.saveSession("Tuesday legs", build());
SS.saveSession("Sprint prep", build());
SS.saveSession("Easy evening", build());
const full = knowWhat();
const fullList = list();

ok("4c. the newest is first on the list",
   (fullList.querySelector("h2.club-room__name")?.textContent || "").trim() === "Easy evening",
   fullList.textContent.replace(/\s+/g, " ").slice(0, 140));

// YOUR-OWN-CREATE, 16 Sep 2026: "Build your first" existed only in the
// empty branch, so a way to build vanished with the first save. The same
// check on the populated state, where it now lives.
const buildAgain = [...full.c.querySelectorAll("[data-kw-route]")].find(b => b.dataset.kwRoute === "session-builder");
ok("4c-1. with sessions saved, there is still a way to build another", !!buildAgain);
ok("4c-2. and it points at the builder, not the list", buildAgain?.dataset.kwRoute === "session-builder");
ok("4c-3. REVERSAL: it does not displace the primary action",
   /Show me the plan/.test(full.c.querySelector(".btn-primary")?.textContent || "") &&
   !buildAgain?.classList.contains("btn-primary"));
ok("4c-4. \"your first\" is not said once one exists", !/your first/i.test(full.c.textContent));
ok("4d. and each can be started from the list", fullList.querySelectorAll("[data-saved-id]").length === 3);

// COUNTED, never "More". A count tells you whether it is worth the tap.
ok("4e. the saved ones are behind a COUNTED button",
   /Or one you saved \(3\)/.test(full.c.textContent),
   '"More" makes somebody tap to find out whether it was worth tapping');
ok("4f. and the word More is not used for it", !/>\s*More\s*</.test(full.c.innerHTML));

// ── 4b. THE LIST TELLS THE TRUTH ABOUT WHAT IS IN THE SESSION ───────────
console.log("\nTEST 4b - the list counts what is THERE, not what was saved");

// OWN-1, 08 Sep 2026, fixed then on Home's card only. The count was
// exerciseIds.length -- what was SAVED, not what still exists; "1
// movements"; and a Start that did nothing when every movement had gone.
function listWith(sessions) {
  seed();
  store.set("savedSessions", sessions);
  return list();
}
const day = "2026-09-01T10:00:00Z";
const liveIds = EX.EXERCISES.slice(0, 3).map(e => e.id);

const oneRoom = listWith([
  { id: "one", name: "Just the one", sessionType: "glute", durationMins: 15,
    exerciseIds: [liveIds[0]], createdAt: day, lastUsedAt: null }
]);
ok("4b-pc. positive control: the list rendered the session",
   /Just the one/.test(oneRoom.textContent), "the list is empty");
ok("4b-a. one movement is singular",
   /1 movement(?!s)/.test(oneRoom.textContent),
   oneRoom.textContent.replace(/\s+/g, " ").slice(0, 140));

const partRoom = listWith([
  { id: "part", name: "Half gone", sessionType: "glute", durationMins: 30,
    exerciseIds: [liveIds[0], "RETIRED-1", "RETIRED-2"], createdAt: day, lastUsedAt: null }
]);
ok("4b-b. the count is what STILL EXISTS, not what was saved",
   /1 movement(?!s)/.test(partRoom.textContent) && !/3 movement/.test(partRoom.textContent),
   `saved 3 ids, 1 resolves: ${partRoom.textContent.replace(/\s+/g, " ").slice(0, 140)}`);
ok("4b-c. and the ones that have gone are said out loud",
   /no longer in the library/.test(partRoom.textContent),
   "the list promises movements it cannot hand over");
ok("4b-d. it can still be started", !!partRoom.querySelector("[data-saved-id]"),
   "some movements missing is not a reason to refuse");

const goneRoom = listWith([
  { id: "gone", name: "Old favourite", sessionType: "glute", durationMins: 30,
    exerciseIds: ["RETIRED-1", "RETIRED-2"], createdAt: day, lastUsedAt: null }
]);
ok("4b-pc2. positive control: the all-gone session is still listed",
   /Old favourite/.test(goneRoom.textContent),
   "the row vanished - it is still the person's session");
ok("4b-e. NO start button when there is nothing to start",
   !goneRoom.querySelector("[data-saved-id]"));
ok("4b-f. and it says why instead",
   /nothing left to start/.test(goneRoom.textContent),
   goneRoom.textContent.replace(/\s+/g, " ").slice(0, 160));

// ── 5. THE COACH DOES NOT READ IT ───────────────────────────────────────
console.log("\nTEST 5 - saving is a decision about a session, not about a person");

const choiceSrc = fs.readFileSync(_gatePath("js/data/session-choice.js"), "utf8");
ok("5a. chooseSessionType does not read savedSessions",
   !/savedSessions/.test(choiceSrc),
   "the coach is treating a saved session as a preference signal. Saving " +
   "something says what you wanted once, not what you are like");

// ── 6. SCHEMA BEFORE CODE ───────────────────────────────────────────────
console.log("\nTEST 6 - declared, defaulted, and defended on rehydrate");

const schema = fs.readFileSync(_gatePath("docs/Schema.md"), "utf8");
ok("6a. savedSessions is in Schema.md", /### `savedSessions`/.test(schema));

const storeSrc = fs.readFileSync(_gatePath("js/store.js"), "utf8");
ok("6b. it has a default", /savedSessions:\s*\[\]/.test(storeSrc));
ok("6c. and is defended on rehydrate",
   /Array\.isArray\(saved\.savedSessions\)/.test(storeSrc),
   "a null or an object from a half-written localStorage would throw on the " +
   "Home screen before anything renders");

console.log(fails === 0
  ? "\nYOUR-OWN: all assertions pass\n"
  : `\nYOUR-OWN: ${fails} FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
