/**
 * tools/verify-progress-share.mjs
 * 06 Oct 2026 v1
 *
 * D-11 PROGRESS-SHARE (Graeme, 06 Oct: Progress for today, 7, 14, 30 and
 * 90 days; share a picture, a certificate, a report or text; download
 * today's report, "what was done, where, how many"). Drives the real
 * ProgressView, ProgressShareView, store.logActivity and the report
 * module; jsdom cannot draw, so the picture and certificate are checked
 * through what they are drawn from and their written descriptions (the
 * drawing itself is checked by eye and by tools/chromium-text-fit.mjs).
 *
 *   0. Reach: both screens mount on both tiers; the fixture holds a
 *      partial, a note, a journal and a weight that must never be shared.
 *   1. Windows: Free Today, 7, 14, 30; the Plan adds 90 (nothing locked).
 *      Every window's sessions number on Progress = an independent count
 *      of completed sessions on those calendar days = the report's.
 *   2. Today: every session today, in order, with the moves and every set
 *      logged during it (not a set from yesterday), the place when known,
 *      the finish answer in words, library names.
 *   3. Never shared, with every switch on: the journal, session notes,
 *      lift notes, weight. Not in the text, the CSV, the report or a
 *      picture's description. Control: the scan finds a word that is in.
 *   4. Check-in answers: off by default in every format; on and consented,
 *      in; health consent withdrawn, not offered and not in.
 *   5. No streak, days in a row, target, score, best, calories: in any
 *      output or in the words the pictures are drawn with.
 *   6. Accessible: tabs (role, aria-selected, one tab stop), the choices
 *      in fieldsets with legends, every picture described, the report's
 *      table headed.
 *   7. Where: logActivity stamps place from where a built session started;
 *      never guesses one (a walk has none); a stated place wins; the
 *      builder records the place chosen at Let's go.
 */
import { agreed } from "./agreed.mjs";
import { createRequire as __cr } from "node:module";
import fs from "node:fs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="main-content"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { ProgressView } = await import(B + "views/progress.js");
const SHR = await import(B + "views/progress-share.js");
const R = await import(B + "data/progress-report.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${String(detail).slice(0, 400)}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const change = el => { if (!el) return; if (el.type === "checkbox") el.checked = !el.checked; else el.checked = true; el.dispatchEvent(new dom.window.Event("change", { bubbles: true })); };
let navs = [];
const router = { navigate: v => navs.push(v), history: [], back() {} };

// ── The person: today, this week, older; and things that must stay home ──
const at = (daysAgo, h, m) => { const d = new Date(); d.setDate(d.getDate() - daysAgo); d.setHours(h, m, 0, 0); return d.toISOString(); };
const SECRET = { journal: "JOURNALSECRET", note: "SESSIONNOTESECRET", lift: "LIFTNOTESECRET", weight: 83.4 };
const LOG = [
  { id: "t1", type: "breathing-session", completedAt: at(0, 7, 10), durationMins: 4, feel: "calmer" },
  { id: "t2", type: "workout", sessionType: "upper", place: "gym", completedAt: at(0, 9, 47), durationMins: 42, feel: "right",
    exerciseIds: ["gym-lat-pulldown", "dead-bug"], note: SECRET.note, notes: SECRET.note, moodAfter: "MOODAFTERSECRET", painChange: "PAINCHANGESECRET" },
  { id: "y1", type: "walk-session", completedAt: at(1, 12, 30), durationMins: 35, feel: "good" },
  { id: "p1", type: "workout", status: "partial", completedAt: at(2, 18, 0), durationMins: 6 },
  { id: "w1", type: "workout", sessionType: "lower", place: "home", completedAt: at(5, 18, 0), durationMins: 30 },
  { id: "w2", type: "class", completedAt: at(10, 10, 0), durationMins: 25, feel: "loved" },
  { id: "w3", type: "yoga-session", completedAt: at(20, 8, 0), durationMins: 20 },
  { id: "w4", type: "workout", sessionType: "full", completedAt: at(45, 8, 0), durationMins: 30 },
  { id: "w5", type: "walk-session", completedAt: at(80, 8, 0), durationMins: 30 },
];
const LIFTS = {
  "gym-lat-pulldown": [
    { at: at(1, 18, 0), weight: 30, reps: 10, unit: "kg" },                           // yesterday: not today's
    { at: at(0, 9, 10), weight: 40, reps: 10, unit: "kg", note: SECRET.lift },
    { at: at(0, 9, 13), weight: 40, reps: 10, unit: "kg" },
    { at: at(0, 9, 16), weight: 42.5, reps: 8, unit: "kg" },
  ],
  "dead-bug": [{ at: at(0, 9, 40), reps: 8 }],
};
const todayKey = new Date().toISOString().slice(0, 10);
function person(tier = "personal", { consent = true } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("tier", tier); store.set("name", "Graeme");
  store.set("activityLog", LOG); store.set("liftLog", LIFTS);
  store.set("journalEntries", [{ id: "j", text: SECRET.journal, createdAt: at(0, 6, 0) }]);
  store.set("weightTracking", true); store.set("weightLog", [{ at: at(0, 6, 0), kg: SECRET.weight }]);
  store.set("checkinHistory", { [todayKey]: { energy: 6, mood: 7, conditionLevels: { "lower-back": 3 }, notes: "CHECKINNOTESECRET", savedAt: at(0, 7, 0) } });
  if (!consent) store.set("consent.health", { given: false, at: null, version: null, withdrawnAt: new Date().toISOString() });
  navs = [];
}
const progress = () => { main.innerHTML = ""; ProgressView(router).mount(main); return main; };
const share = preset => { main.innerHTML = ""; if (preset !== undefined) SHR.setSharePreset(preset); SHR.ProgressShareView(router).mount(main); return main; };
const exerciseName = id => ({ "gym-lat-pulldown": "Lat Pulldown", "dead-bug": "Dead Bug" })[id] || null;
const ALL_ON = { sessions: true, kinds: true, place: true, moves: true, name: true, checkins: true };

// ── 0 ─────────────────────────────────────────────────────────────────
console.log("\nTEST 0 - reach");
person("free"); progress();
ok("0a. Progress mounts on Free", !!main.querySelector(".progress-view"));
person("personal"); share(null);
ok("0b. the share screen mounts on the Plan", !!main.querySelector(".share-view h1"));
ok("0c. the fixture has a partial, a session note, a lift note, a journal and a weight to keep out",
   LOG.some(e => e.status === "partial") && LOG.some(e => e.note) && LIFTS["gym-lat-pulldown"].some(r => r.note) && store.get("journalEntries").length === 1 && store.get("weightLog").length === 1);

// ── 1. WINDOWS ────────────────────────────────────────────────────────
console.log("\nTEST 1 - windows: Today, 7, 14, 30 on both tiers; 90 on the Plan; one number");
const tabs = () => [...main.querySelectorAll("[data-window]")].map(b => b.dataset.window).join(",");
person("free"); progress();
ok("1a. Free: Today, 7, 14, 30, nothing locked", tabs() === "today,7,14,30" && !main.querySelector(".progress-tab--locked, [aria-disabled=true]"), tabs());
person("personal"); progress();
ok("1b. the Plan: the same and 90", tabs() === "today,7,14,30,90", tabs());
// An independent count: completed sessions on the last N calendar days.
const truth = days => {
  const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - (days - 1));
  return LOG.filter(e => e.status !== "partial" && new Date(e.completedAt) >= start && new Date(e.completedAt) <= new Date()).length;
};
const number = () => Number(txt(main.querySelector(".progress-summary__number")));
const results = {};
for (const [k, days] of [["today", 1], ["7", 7], ["14", 14], ["30", 30], ["90", 90]]) {
  person("personal"); progress();
  click(main.querySelector(`[data-window="${k}"]`));
  const report = R.buildReport({ rangeKey: k, completed: store.completedSessions(LOG), liftLog: LIFTS }).totals.sessions;
  results[k] = [number(), truth(days), report];
}
ok("1c. every window: Progress = an independent calendar-day count = the report (partials never)",
   Object.values(results).every(([a, b, c]) => a === b && b === c) && results.today[0] === 2 && results["7"][0] === 4 && results["90"][0] === 8,
   JSON.stringify(results));
person("free"); progress(); click(main.querySelector('[data-window="7"]'));
ok("1d. 7 days: sessions each day, seven bars, today last", main.querySelectorAll(".pr-bar").length === 7 && /Today/.test(txt([...main.querySelectorAll(".pr-bar__week")].at(-1))), main.querySelectorAll(".pr-bar").length);
click(main.querySelector('[data-window="14"]'));
ok("1e. 14 days: fourteen bars, each named for a screen reader", main.querySelectorAll(".pr-bar").length === 14 && [...main.querySelectorAll(".pr-bar .sr-only")].every(s => /session/.test(txt(s))));
person("personal"); progress(); click(main.querySelector('[data-window="90"]'));
ok("1f. 90 days: sessions each week, thirteen weeks at most", main.querySelectorAll(".pr-bar").length <= 13 && main.querySelectorAll(".pr-bar").length >= 2, main.querySelectorAll(".pr-bar").length);
ok("1g. the coach line says the window in words", /You've moved 8 times over the last 90 days/.test(txt(main.querySelector(".progress-narrative"))), txt(main.querySelector(".progress-narrative")));
person("free"); share({ window: "90" });
ok("1h. Free cannot share 90 days (not offered, falls back to 30)", ![...main.querySelectorAll('input[name="sh-window"]')].some(r => r.value === "90") && main.querySelector('input[name="sh-window"]:checked')?.value === "30");

// ── 2. TODAY ──────────────────────────────────────────────────────────
console.log("\nTEST 2 - Today: what was done, where, how many");
person("personal"); progress(); click(main.querySelector('[data-window="today"]'));
const sess = [...main.querySelectorAll(".pr-session")];
ok("2a. both of today's sessions, in order", sess.length === 2 && /Breathing/.test(txt(sess[0])) && /Upper Body/.test(txt(sess[1])), sess.map(txt).join(" | "));
ok("2b. where, when the app was told; not where it was not", /At the gym/.test(txt(sess[1])) && !/At (home|the gym)|Outside/.test(txt(sess[0])));
const moves = [...sess[1].querySelectorAll(".pr-move")].map(txt);
ok("2c. every move by its library name, every set logged during it (not yesterday's 30 kg)",
   moves.length === 2 && /Lat Pulldown 3 sets: 10 × 40 kg, 10 × 40 kg, 8 × 42\.5 kg/.test(moves[0]) && /Dead Bug 1 set: 8 reps/.test(moves[1]) && !/30 kg/.test(moves.join(" ")), moves.join(" | "));
ok("2d. what they said at the finish, in the words they tapped", /Afterwards you said: Calmer/.test(txt(sess[0])) && /Afterwards you said: About right/.test(txt(sess[1])));
ok("2e. Download today's report and Copy as text", !!main.querySelector('[data-share-open="report"]') && !!main.querySelector('[data-share-open="text"]'));
click(main.querySelector('[data-share-open="report"]'));
ok("2f. Download today's report opens the share screen", navs.at(-1) === "progress-share");
share();   // the preset Progress just set
ok("2g. ... on today's report", main.querySelector('input[name="sh-window"]:checked')?.value === "today" && main.querySelector('input[name="sh-format"]:checked')?.value === "report" && !!main.querySelector(".sh-report"));
const doc = txt(main.querySelector(".sh-report"));
const tile = label => [...main.querySelectorAll(".shr-tile")].find(t => txt(t.querySelector("dt")) === label)?.querySelector("dd");
ok("2h. the report says what, where and how many", /Lat Pulldown/.test(doc) && /At the gym/.test(doc) && txt(tile("sessions")) === "2" && txt(tile("sets logged")) === "4" && /46 minutes/.test(txt(tile("moving"))), doc.slice(0, 300));
ok("2i. a move the library cannot name reads as words, not an id", R.movesFor({ exerciseIds: ["gone-move-x"], completedAt: at(0, 9, 47), durationMins: 10 }, {}, () => null)[0].name === "Gone move x");

{ // 2j: sessions logged without minutes never read "0 minutes of moving".
  const noMins = [{ id: "n1", type: "class", completedAt: at(0, 8, 0) }, { id: "n2", type: "walk-session", completedAt: at(0, 9, 0) }];
  const m0 = R.buildReport({ rangeKey: "today", completed: noMins, liftLog: {}, include: R.defaultsFor("report"), exerciseName });
  const said = [R.reportText(m0), R.reportCsv(m0), R.describeShare(m0, "picture"), R.describeShare(m0, "certificate")].join("\n");
  ok("2j. sessions with no minutes recorded: no \"0 minutes\" in what is shared", m0.totals.sessions === 2 && !/\b0 min|Time moving/.test(said), said.slice(0, 300));
}

// ── 3. NEVER SHARED ───────────────────────────────────────────────────
console.log("\nTEST 3 - never shared: journal, notes, weight (every switch on)");
person("personal");
const outputs = {};
for (const k of ["today", "7", "90"]) {
  const m = R.buildReport({ rangeKey: k, completed: store.completedSessions(LOG), liftLog: LIFTS, checkinHistory: store.get("checkinHistory"),
    name: "Graeme", include: ALL_ON, healthOk: true, exerciseName });
  outputs[`text-${k}`] = R.reportText(m); outputs[`csv-${k}`] = R.reportCsv(m);
  outputs[`alt-picture-${k}`] = R.describeShare(m, "picture"); outputs[`alt-certificate-${k}`] = R.describeShare(m, "certificate");
}
share({ window: "today", format: "report" });
for (const id of ["place", "moves", "name", "checkins"]) { const cb = main.querySelector(`#sh-p-${id}`); if (cb && !cb.checked) change(cb); }
outputs.reportHtml = main.querySelector(".sh-report").outerHTML;
const leaks = Object.entries(outputs).filter(([, v]) => [SECRET.journal, SECRET.note, SECRET.lift, "CHECKINNOTESECRET", "MOODAFTERSECRET", "PAINCHANGESECRET", String(SECRET.weight), "83.4"].some(s => v.includes(s))).map(([k]) => k);
ok("3a. no journal, session note, lift note, check-in note, mood or pain note, or weight in any output", leaks.length === 0, leaks.join(", "));
ok("3b. CONTROL: the scan sees what is in (Lat Pulldown is in the text, the CSV and the report)",
   outputs["text-today"].includes("Lat Pulldown") && outputs["csv-today"].includes("Lat Pulldown") && outputs.reportHtml.includes("Lat Pulldown"));
ok("3c. the screen says what is never included", /journal, your notes and your weight are never included/.test(txt(main.querySelector(".sh-private"))));

// ── 4. CHECK-INS ──────────────────────────────────────────────────────
console.log("\nTEST 4 - check-in answers: off by default; only when on and consented");
ok("4a. off by default in every format", R.FORMATS.every(f => R.defaultsFor(f).checkins === false));
person("personal"); share({ window: "today", format: "text" });
ok("4b. off: not in the text", !/Check-in answers|energy okay/i.test(main.querySelector("#sh-text").value));
change(main.querySelector("#sh-p-checkins"));
ok("4c. on, with the health consent: in, in the check-in's own words", /Check-in answers \(included by choice\)/.test(main.querySelector("#sh-text").value) && /energy okay, mood pretty good, lower back a little/.test(main.querySelector("#sh-text").value),
   main.querySelector("#sh-text").value.split("\n").filter(l => /energy/.test(l)).join(" "));
person("personal", { consent: false }); share({ window: "today", format: "text" });
ok("4d. health consent withdrawn: the switch is not offered", !main.querySelector("#sh-p-checkins"));
const forced = R.buildReport({ rangeKey: "today", completed: store.completedSessions(LOG), checkinHistory: store.get("checkinHistory"), include: ALL_ON, healthOk: false });
ok("4e. and a model asked for them without consent has none", forced.checkins.length === 0 && !/Check-in/.test(R.reportText(forced)));

// ── 5. WORDS ──────────────────────────────────────────────────────────
console.log("\nTEST 5 - no streak, days in a row, target, score, best or calories");
const BANNED = /\bstreak|\bin a row\b|\btarget|\bgoal reached|\bscore\b|\bpersonal best|\bbest\b|\bcalori|\bkcal|\bburn(ed|t)?\b|\bfat\b|\bmost active/i;
const allText = Object.values(outputs).join("\n").replace(/does not estimate calories or energy used/g, "");
ok("5a. none in any output (the line saying the app does not estimate calories aside)", !BANNED.test(allText), (allText.match(BANNED) || [""])[0]);
const drawSrc = fs.readFileSync(new URL("../js/data/share-images.js", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const drawn = [...drawSrc.matchAll(/"([^"\n]{3,})"|`([^`\n]{3,})`/g)].map(m => m[1] || m[2]).join("\n");
ok("5b. none in the words the picture and certificate are drawn with", !BANNED.test(drawn), (drawn.match(BANNED) || [""])[0]);
ok("5c. CONTROL: the pattern catches one", BANNED.test("a 5 day streak") && BANNED.test("calories burned"));
ok("5d. the report says the app does not estimate calories and is not a medical device", R.ABOUT_LINES.some(l => /does not estimate calories/.test(l) && /not a medical device/.test(l)));

// ── 6. ACCESSIBLE ─────────────────────────────────────────────────────
console.log("\nTEST 6 - accessible");
person("personal"); progress();
const tabEls = [...main.querySelectorAll("[role=tab]")];
ok("6a. tabs: role tab, one selected, one tab stop, a tabpanel it controls",
   tabEls.length === 5 && tabEls.filter(t => t.getAttribute("aria-selected") === "true").length === 1 && tabEls.filter(t => t.tabIndex === 0).length === 1 &&
   !!main.querySelector(`#${tabEls.find(t => t.getAttribute("aria-selected") === "true").getAttribute("aria-controls")}[role=tabpanel]`));
ok("6b. a tab's name says it ('7 days', not '7days')", txt(main.querySelector('[data-window="7"]')) === "7 days");
const sel = main.querySelector('[data-window="30"]');
sel.focus(); sel.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
ok("6c. the arrow keys move along the tabs", main.querySelector('[aria-selected="true"]')?.dataset.window === "90" && document.activeElement?.dataset.window === "90");
share({ window: "7", format: "picture" });
ok("6d. every choice is in a fieldset with a legend", [...main.querySelectorAll(".share-view fieldset")].length === 3 && [...main.querySelectorAll(".share-view fieldset")].every(f => f.querySelector("legend")));
const img = main.querySelector("#sh-image");
ok("6e. the picture is described: sessions, time and every kind", !!img && /4 sessions and 1 hour 51 minutes of moving/.test(img.alt) && /Breathing 1/.test(img.alt) && /Alongside: Move, by Build New Habits/.test(img.alt), img?.alt);
share({ window: "today", format: "report" });
ok("6f. the report's moves table has its headers", main.querySelectorAll(".shr-moves th[scope=col]").length === 2 && main.querySelectorAll(".shr-moves th[scope=row]").length >= 2);
ok("6g. a status line says what happened (role status)", main.querySelector("#sh-status")?.getAttribute("role") === "status");

// ── 7. WHERE ──────────────────────────────────────────────────────────
console.log("\nTEST 7 - where a session happened: told, never guessed");
person("personal");
store.set("activityLog", []);
store.set("sessionLocation", "gym");
const w = store.logActivity({ type: "workout", completedAt: new Date().toISOString(), durationMins: 30 });
const f = store.logActivity({ type: "freestyle", completedAt: new Date(Date.now() + 60000).toISOString(), durationMins: 20 });
const wk = store.logActivity({ type: "walk-session", completedAt: new Date(Date.now() + 120000).toISOString(), durationMins: 20 });
const st = store.logActivity({ type: "workout", place: "outside", completedAt: new Date(Date.now() + 180000).toISOString(), durationMins: 20 });
const gy = store.logActivity({ type: "gym", source: "self-logged", completedAt: new Date(Date.now() + 240000).toISOString(), durationMins: 50 });
store.set("sessionLocation", "elsewhere");
const bad = store.logActivity({ type: "workout", completedAt: new Date(Date.now() + 300000).toISOString(), durationMins: 20 });
ok("7a. a built or made-up session takes where it started", w?.place === "gym" && f?.place === "gym", `${w?.place} ${f?.place}`);
ok("7b. a walk is given no place (it could be a treadmill)", wk?.place === null, String(wk?.place));
ok("7c. a stated place wins; a hand-logged gym visit is the gym", st?.place === "outside" && gy?.place === "gym");
ok("7d. an unknown place word is not stored", bad?.place === null, String(bad?.place));
const sbu = fs.readFileSync(new URL("../js/views/session-builder-ui.js", import.meta.url), "utf8");
const go = sbu.slice(sbu.indexOf('getElementById("sb-go-btn")'), sbu.indexOf('router.navigate("workout")', sbu.indexOf('getElementById("sb-go-btn")')));
ok("7e. the builder records the place chosen, at Let's go", /store\.set\("sessionLocation", selectedLocation === "gym" \? "gym" : "home"\)/.test(go));

console.log("");
if (fails) { console.log(`PROGRESS-SHARE: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`PROGRESS-SHARE: all ${passes} assertions pass\n`);
process.exit(0);
