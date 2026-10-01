/**
 * tools/verify-bundle-true.mjs
 * 01 Oct 2026 v1
 *
 * BUNDLE-TRUE. The independent check of the Foot Anstey bundle against the
 * code (B1, 01 Oct 2026) found places where the app, not the wording, was
 * wrong. Each test drives the screen the person uses.
 *
 *   1. The Library's Journal card opens the real journal (health consent and
 *      support lines), and the quiet-practice route has no journal of its
 *      own that saves entries.
 *   2. Restore from a file cannot put working code on a screen: straight
 *      quotation marks in a file become curly ones, and My exercises
 *      and its player escape names, doses and notes (a name typed with a
 *      quote broke the markup too).
 *   3. With the health consent withdrawn, no weight or target weight can be
 *      entered (Settings › Your profile; My programme).
 *   4. Delete my health answers also clears the plan text, the session in
 *      progress, today's sore area, the opening mode, the weight-rate marker
 *      and notes on My exercises.
 *   5. Journal topic tags start empty; the old default (never changeable by
 *      the person) is migrated to empty; a different list is kept.
 *   6. The retired feeling-word list no longer ships.
 *   7. Sentry sends no client reports.
 *   8. The under-18 screen says the one thing it keeps.
 *   9. Getting started says movements are left out on a day an area is bad,
 *      not unconditionally.
 */
import { createRequire as __cr } from "node:module";
import { readFileSync } from "node:fs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "FileReader", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: true, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(0), 0);
dom.window.requestAnimationFrame = globalThis.requestAnimationFrame;
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const ROOT = new URL("../", import.meta.url);
const B = new URL("js/", ROOT).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

let navigated = [];
router.navigate = async r => { navigated.push(r); };

function fixture({ health = true, tier = "personal" } = {}) {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", tier);
  store.set("consent.given", true); store.set("consent.at", new Date().toISOString());
  store.set("consent.ageConfirmed", true); store.set("consent.policyVersion", "2026-10-01");
  store.set("consent.health", { given: health, at: health ? new Date().toISOString() : null, version: health ? "2026-10-01" : null });
  navigated = [];
}

// ── 1. LIBRARY JOURNAL ─────────────────────────────────────────────────
console.log("\nTEST 1 - the Library's Journal card opens the real journal");
fixture();
const lib = await import(B + "views/library.js");
main.innerHTML = lib.render(); lib.onMount();
click(document.getElementById("lib-start-session-btn")); await wait(5);
click(document.querySelector('[data-guided="mindful"]')); await wait(5);
const jBtn = [...document.querySelectorAll(".library-session-card")].find(b => /Journal/.test(txt(b)));
ok("1pc. positive control: the Mindful practice screen shows a Journal card", !!jBtn);
click(jBtn); await wait(5);
ok("1a. tapping it goes to journal-entry (consent guard and support lines live there)",
   navigated.at(-1) === "journal-entry", `navigated: ${JSON.stringify(navigated)}`);

fixture();
const qs = await import(B + "views/quiet-session.js");
store.set("quietMode", "journal");
store.set("journalEntries", []);
main.innerHTML = qs.render(); qs.onMount(); await wait(5);
ok("1b. arriving at the quiet route in journal mode shows no journal of its own",
   !main.querySelector("textarea") && !main.querySelector("#quiet-journal-save-btn"));
ok("1c. and sends the person to the real journal", navigated.includes("journal-entry"), JSON.stringify(navigated));
ok("1d. it saved nothing", (store.get("journalEntries") || []).length === 0);
const qsSrc = readFileSync(new URL("js/views/quiet-session.js", ROOT), "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
ok("1e. no code path in the quiet route writes journalEntries", !/set\(\s*["']journalEntries/.test(qsSrc));

// ── 2. RESTORE CANNOT PUT CODE ON A SCREEN ─────────────────────────────
console.log("\nTEST 2 - Restore from a file, and My exercises, cannot carry working code");
fixture();
const R = await import(B + "data/restore.js");
const crafted = {
  exportedAt: new Date().toISOString(),
  about: "Everything Alongside: Move keeps about you on this device, including your journal. Nothing here was sent anywhere to make this file.",
  store: { ...JSON.parse(localStorage.getItem(store.STORAGE_KEY) || "{}"),
    prescribedExercises: [{ id: "p1", name: 'Squat" autofocus onfocus="window.__pwned=1', sets: 2, reps: 10, notes: "it's fine" }],
    journalEntries: [{ id: "j1", date: new Date().toISOString(), text: 'She said "go"', tags: [] }] },
  display: {},
};
const read = R.readRestoreFile(JSON.stringify(crafted));
ok("2pc. positive control: the crafted file is read (it has no tag-like text)", read.ok === true, read.reason || "");
if (read.ok) R.applyRestore(read.data);
const pe = store.get("prescribedExercises") || [];
ok("2a. no straight double quotation mark survives in restored text", !JSON.stringify(pe).includes('\\"'), JSON.stringify(pe));
ok("2b. the words are kept (curly quotation marks)", /Squat” autofocus/.test(pe[0]?.name || ""), pe[0]?.name);
ok("2c. journal text keeps its words", /She said “go”|She said .go./.test((store.get("journalEntries") || [])[0]?.text || ""));
const P = await import(B + "views/prescribed.js");
main.innerHTML = P.render(); P.onMount?.(); await wait(5);
ok("2d. My exercises renders no event-handler attribute from a restored name",
   ![...main.querySelectorAll("*")].some(el => [...el.attributes].some(a => /^on/i.test(a.name))));
// A name typed in the app with a straight quote must not break the markup either.
store.set("prescribedExercises", [{ id: "p2", name: 'Band "pull" apart', sets: 2, reps: 10 }]);
main.innerHTML = P.render(); P.onMount?.(); await wait(5);
const card = main.querySelector(".prescribed-exercise-card");
ok("2e. a name typed with a quotation mark is shown whole, in text and label",
   /Band "pull" apart/.test(txt(card)) && /Band "pull" apart/.test(card?.getAttribute("aria-label") || ""),
   card?.getAttribute("aria-label"));
// The My exercises player writes the same text.
const SG = await import(B + "safety-gate.js");
SG.recordAcknowledgement("test");
const PS = await import(B + "views/prescribed-session.js");
store.set("prescribedExercises", [{ id: "p2", name: 'Band "pull" <b>apart</b>', sets: 2, reps: '10 <i>each</i> side', notes: 'Slow "down"' }]);
main.innerHTML = PS.render(); await wait(5);
const h1 = main.querySelector(".exercise-name");
ok("2gpc. positive control: the player shows the exercise", !!h1, main.innerHTML.slice(0, 120));
ok("2g. the player shows typed text as text, in heading and dose (no markup made from it)",
   /Band "pull" <b>apart<\/b>/.test(txt(h1)) && /10 <i>each<\/i> side/.test(txt(main)) &&
   !main.querySelector(".exercise-name b") && !main.querySelector(".meta-tag i"), txt(h1));
ok("2f. a file containing a javascript: address is refused",
   R.readRestoreFile(JSON.stringify({ ...crafted, store: { ...crafted.store, name: "javascript:alert(1)" } })).ok === false);

// ── 3. NO WEIGHT ENTRY WITHOUT HEALTH CONSENT ──────────────────────────
console.log("\nTEST 3 - with the health consent withdrawn, no weight entry");
fixture({ health: true });
store.set("weightTracking", true); store.set("weightUnit", "kg");
const { SettingsView } = await import(B + "views/settings.js");
let s = SettingsView(router); main.innerHTML = ""; s.mount(main); await wait(5);
click(main.querySelector('[data-open="profile"]')); await wait(10);
ok("3pc. positive control: with consent, Your profile offers weight entry", !!main.querySelector("#settings-weight-now"));
fixture({ health: false });
store.set("weightTracking", true); store.set("weightUnit", "kg");
s = SettingsView(router); main.innerHTML = ""; s.mount(main); await wait(5);
click(main.querySelector('[data-open="profile"]')); await wait(10);
ok("3a. without it, Your profile offers no weight entry", !!main.querySelector("#settings-name") && !main.querySelector("#settings-weight-now"));
const { MyProgrammeView } = await import(B + "views/my-programme.js");
fixture({ health: true }); store.set("weightTracking", true);
let mp = MyProgrammeView(router); main.innerHTML = ""; mp.mount(main); await wait(10);
const hadTarget = !!main.querySelector("#weight-target");
fixture({ health: false }); store.set("weightTracking", true);
mp = MyProgrammeView(router); main.innerHTML = ""; mp.mount(main); await wait(10);
ok("3bpc. positive control: with consent, My programme offers a target weight", hadTarget);
ok("3b. without it, My programme offers no target weight", !main.querySelector("#weight-target"));

// ── 4. DELETE MY HEALTH ANSWERS: THE LEFTOVERS ─────────────────────────
console.log("\nTEST 4 - Delete my health answers clears the leftovers");
fixture();
store.set("generatedSession", { session: { coachLine: "Your knee is sore today" }, builtAt: "x", inputs: { conditions: ["knee"] } });
store.set("lastFinishedSession", { name: "Legs", coachLine: "knee" });
store.set("activeSessionCheckpoint", { session: { coachLine: "knee" } });
store.set("rescuedSession", { session: { coachLine: "knee" } });
store.set("currentActivityEntry", { type: "workout", note: "knee hurt", moodAfter: 2, painChange: "worse", energyBefore: 3, durationMins: 20 });
store.set("todayPurposeArea", "knee");
store.set("checkin.lastOpeningMode", "care");
store.set("checkin.openingModeHistory", [{ mode: "care", at: "x" }]);
store.set("weightRateRaisedAt", new Date().toISOString());
store.set("prescribedExercises", [{ id: "p1", name: "Clam", sets: 2, reps: 10, notes: "after knee surgery" }]);
store.deleteHealthAnswers();
const gs = store.get("generatedSession");
ok("4a. the built plan text is gone", !gs?.session && !JSON.stringify(gs || {}).includes("knee"), JSON.stringify(gs));
ok("4b. the last finished session, checkpoint and rescued session are gone",
   !store.get("lastFinishedSession") && !store.get("activeSessionCheckpoint") && !store.get("rescuedSession"));
const cae = store.get("currentActivityEntry");
ok("4c. the session in progress keeps no note, mood, pain or energy answer",
   !cae || (cae.note === undefined && cae.moodAfter === undefined && cae.painChange === undefined && cae.energyBefore === undefined), JSON.stringify(cae));
ok("4d. today's sore area is gone", !store.get("todayPurposeArea"));
ok("4e. the opening mode and its history are gone",
   !store.get("checkin.lastOpeningMode") && (store.get("checkin.openingModeHistory") || []).length === 0);
ok("4f. the weight-rate marker is gone", !store.get("weightRateRaisedAt"));
const px = store.get("prescribedExercises") || [];
ok("4g. My exercises stay, without their notes", px.length === 1 && px[0].name === "Clam" && px[0].notes === undefined, JSON.stringify(px));

// ── 5. JOURNAL TAGS START EMPTY ────────────────────────────────────────
console.log("\nTEST 5 - journal topic tags start empty");
localStorage.clear(); store.init();
ok("5a. a new person's tags start empty", (store.get("journalSettings.categoryPrefs") || ["x"]).length === 0);
localStorage.clear();
localStorage.setItem(store.STORAGE_KEY, JSON.stringify({ journalSettings: { autoTagging: true, categoryPrefs: ["life", "movement", "environment", "nature", "health"] } }));
store.init();
ok("5b. the old default is migrated to empty", (store.get("journalSettings.categoryPrefs") || ["x"]).length === 0, JSON.stringify(store.get("journalSettings")));
localStorage.clear();
localStorage.setItem(store.STORAGE_KEY, JSON.stringify({ journalSettings: { autoTagging: true, categoryPrefs: ["nature"] } }));
store.init();
ok("5c. any other list is kept", JSON.stringify(store.get("journalSettings.categoryPrefs")) === '["nature"]');
fixture();
const { JournalEntryView } = await import(B + "views/journal-entry.js");
const je = JournalEntryView(router); main.innerHTML = ""; je.mount(main); await wait(10);
ok("5d. the journal screen shows no topic ticked",
   main.querySelectorAll(".je-cat-chip").length > 0 && main.querySelectorAll('.je-cat-chip[aria-checked="true"]').length === 0,
   [...main.querySelectorAll('.je-cat-chip[aria-checked="true"]')].map(txt).join(", "));

// ── 6. NO FEELING-WORD LIST ────────────────────────────────────────────
console.log("\nTEST 6 - the retired feeling-word list no longer ships");
const ck = await import(B + "data/checkin.js");
const ckSrc = readFileSync(new URL("js/data/checkin.js", ROOT), "utf8");
ok("6a. no FEELING_WORDS export", !("FEELING_WORDS" in ck));
ok("6b. none of its words remain in the file", !/\bhopeless\b|\boverwhelmed\b/i.test(ckSrc));

// ── 7. SENTRY CLIENT REPORTS OFF ───────────────────────────────────────
console.log("\nTEST 7 - Sentry sends no client reports");
const html = readFileSync(new URL("index.html", ROOT), "utf8");
const init = (html.match(/Sentry\.init\(\{[\s\S]*?\}\);/) || [""])[0];
ok("7pc. positive control: the Sentry.init block was found", init.length > 50);
ok("7a. sendClientReports is false", /sendClientReports:\s*false/.test(init));

// ── 8. UNDER-18 WORDING ────────────────────────────────────────────────
console.log("\nTEST 8 - the under-18 screen says the one thing it keeps");
const { Under18View } = await import(B + "views/under-18.js");
main.innerHTML = ""; Under18View(router).mount(main); await wait(5);
ok("8a. it says it keeps only that the person is under 18", /only remembers that you are under 18/i.test(txt(main)), txt(main).slice(0, 200));

// ── 9. ONBOARDING SAYS WHEN MOVEMENTS ARE LEFT OUT ───────────────────────
// A sore area leaves out movements that load it on a day the person rates
// it "Bad" (three movements are left out at "A little" or "Quite sore", for
// a lower back or a hamstring). Getting started promised it unconditionally.
console.log("\nTEST 9 - getting started says when movements are left out");
const OT = await import(B + "data/onboarding-thread-data.js");
for (const ids of [["knee"], ["knee", "shoulder"], ["knee", "shoulder", "hip"]]) {
  const ack = OT.generateConditionsAck(ids);
  ok(`9a. ${ids.length} area(s): the thank-you ties leaving movements out to a bad day`,
     /on a day (it\S*|one is) bad/i.test(ack) && !/won.t have to remind me/i.test(ack), ack.split("\n")[0]);
}
const step = Object.values(OT.STEPS).find(s => s && typeof s.coach === "string" && /is anything sore/i.test(s.coach));
ok("9pc. positive control: the sore-area question was found", !!step);
ok("9b. the question ties it to a bad day too", /on a day it.s bad/i.test(step?.coach || ""), (step?.coach || "").slice(0, 200));
ok("9c. its answered line too", /on a day one is bad/i.test(step?.coachAfter?.answered || ""), step?.coachAfter?.answered);
const condSrc = readFileSync(new URL("js/views/onboarding/conditions.js", ROOT), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
ok("9d. the older sore-areas screen says the same", /on a day it.s bad/i.test(condSrc) && !/Tell me where, and I.ll leave out/.test(condSrc));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
