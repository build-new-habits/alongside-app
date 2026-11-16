/**
 * tools/verify-p36-my-list.mjs
 * 16 Nov 2026 v1
 *
 * P-36 MY-LIST-PLAYER (Graeme, 15-16 Nov: "The timer is at the bottom. I
 * can't see what exercises are being done ... I also want a noise or
 * vibration when the timer finishes"; mock-up approved 16 Nov: both tiers,
 * the chime on by default, Watch out folded and notes at the end).
 *
 *   1  The list first: every exercise with its figure and how much, about how
 *      long, Start; Help is there (nothing is running yet).
 *   2  After Start: the safety note before the first, then one screen an
 *      exercise, the timer (or the count) above the figure and How; Watch out
 *      folded on the same screen; the app's own safety line; Skip and Done.
 *   3  Time's up: the chime (Timer sound), a longer buzz, a tick and the words,
 *      said once; it never moves on by itself; the button names the next.
 *   4  Timer sound off: no chime, the buzz and the words still.
 *   5  The list, any time: a dialog with what's done and what's left; tap one
 *      to do it now; Close puts focus back on the list button.
 *   6  Notes at the end, then Finish logs the session (as before).
 *   7  Left another way and come back: the list again, done ones ticked.
 *   8  Free sees the same player; Settings › Display › Sound › Timer sound.
 *
 *   node tools/verify-p36-my-list.mjs
 */
import { readFileSync } from "node:fs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const ROOT = new URL("../", import.meta.url);
const html = readFileSync(new URL("index.html", ROOT), "utf8");
const navHTML = html.match(/<nav id="bottom-nav"[\s\S]*?<\/nav>/)[0];
const dom = new JSDOM(`<!doctype html><body><div id="app" class="app-container">
  <div id="sr-announcer"></div><div id="help-row" class="help-row" hidden></div>
  <main id="main-content" class="main-content"></main>${navHTML}<div id="toast-container"></div><div id="modal-container" class="hidden"></div></div>
  <button id="hidden-nav-home-btn" class="hidden-nav-escape hidden" type="button" aria-label="Back to Today"></button>
  <div id="guide-overlay"></div><p id="guide-live" class="sr-only" role="status" aria-live="polite"></p></body>`, { url: "https://app.test/", pretendToBeVisual: true });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "sessionStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob", "MutationObserver", "getComputedStyle", "DOMParser", "HTMLInputElement", "HTMLTextAreaElement"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
// Reduce motion: the check-in's pauses are nothing (prefersReducedMotion), so the walk is quick.
dom.window.matchMedia = q => ({ matches: /reduce/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
globalThis.matchMedia = dom.window.matchMedia;
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {}; dom.window.scrollBy = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };
dom.window.confirm = () => false; globalThis.confirm = () => false;
dom.window.speechSynthesis = undefined;
process.on("unhandledRejection", e => { if (process.env.DEBUG) console.log("  (unhandled)", e?.message || e); });

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
const GD = await import(B + "data/guides.js");
const GE = await import(B + "guide.js");
const WM = await import(B + "data/week-shape-model.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);
window.router = router; globalThis.router = router;
router.init();
GE.initGuides(router);

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${String(detail).slice(0, 500)}`); }
};
const main = document.getElementById("main-content");
// What is read out: aria-hidden parts (the small figures) left out.
const txt = el => { if (!el) return ""; const c = el.cloneNode(true); c.querySelectorAll?.('[aria-hidden="true"]').forEach(n => n.remove()); return (c.textContent || "").replace(/\s+/g, " ").trim(); };
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function until(fn, ms = 4000) { const t = Date.now(); while (Date.now() - t < ms) { try { if (fn()) return true; } catch { /* not yet */ } await sleep(25); } return false; }
const $ = s => document.querySelector(s);

// The chime: count notes made, without a speaker.
let notes = 0;
class FakeAC { constructor() { this.state = "running"; this.currentTime = 0; this.destination = {}; }
  resume() {} createOscillator() { notes++; return { type: "", frequency: {}, connect: g => g, start() {}, stop() {} }; }
  createGain() { const g = { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect: d => d }; return g; } }
dom.window.AudioContext = FakeAC; globalThis.AudioContext = FakeAC;
let buzz = [];
Object.defineProperty(dom.window.navigator, "vibrate", { value: p => { buzz.push(p); return true; }, configurable: true, writable: true });
const DP = await import(B + "display-prefs.js");
DP.applyDisplayPrefs();

const G = "Evening Release";
function person(tier = "personal", { gateDone = true } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", tier);
  store.set("safetyAckLog", gateDone ? Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })) : []);
  store.set("prescribedExercises", [
    ["cat-cow", "Cat-Cow", "10"], ["childs-pose", "Child's Pose", "2 seconds"], ["supine-twist", "Supine Twist", "30 seconds each side"],
  ].map(([id, n, r], i) => ({ id: "p" + i, exerciseId: id, name: n, sets: 1, reps: r, group: G, completedToday: false })));
  store.set("myExercisesGroup", G);
  router.history = []; router.currentView = null;
}
async function go(view) { await router.navigate(view); await sleep(80); }

console.log("\nTEST 1 - the list first");
person();
await go("today"); await go("prescribed-session");
{
  ok("1a. the list's name as the heading, and about how long", txt(main.querySelector("h1")) === G && /3 exercises · about \d+ minutes?/.test(txt(main.querySelector(".ps-sub"))), txt(main.querySelector(".ps-sub")));
  const rows = [...main.querySelectorAll(".ps-rows .ps-row")];
  ok("1b. every exercise with its figure and how much", rows.length === 3 && rows.every(r => r.querySelector(".ps-thumb svg")) && /^Child's Pose, 2 seconds$/.test(txt(rows[1])) && /^Cat-Cow, 10$/.test(txt(rows[0])), rows.map(txt).join(" | ") + " svg:" + rows.map(r => !!r.querySelector(".ps-thumb svg")));
  ok("1c. Start, and Help (nothing running yet)", txt($("#ps-start-btn")) === "Start" && !document.getElementById("help-row").hidden);
}

console.log("\nTEST 2 - the safety note, then one screen an exercise");
person("personal", { gateDone: false });
await go("today"); await go("prescribed-session");
click($("#ps-start-btn"));
await until(() => $("#gate-ack-box"));
ok("2a. after Start, the safety note before the first exercise (not before the list)", !!$("#gate-ack-box"));
click($("#gate-ack-box")); click($("[data-gate-start]"));
await until(() => $("#ps-complete-btn"));
{
  const h1 = txt(main.querySelector("h1"));
  ok("2b. the first exercise: its name, how much, the count at the top", h1 === "Cat-Cow" && !!main.querySelector(".ps-count .ps-count__n") && txt(main.querySelector(".ps-count__n")) === "10");
  ok("2c. Skip and Done, next; the list button says where you are", txt($("#ps-skip-btn")) === "Skip" && txt($("#ps-complete-btn")) === "Done, next" && txt($("#ps-list-btn")) === "1 of 3 · The list");
  ok("2d. Help goes once the list has started", await until(() => document.getElementById("help-row").hidden, 1000));
  click($("#ps-complete-btn"));
  await until(() => txt(main.querySelector("h1")) === "Child's Pose");
  const t = main.querySelector(".ps-timer"), fig = main.querySelector(".xcard-figure"), how = [...main.querySelectorAll(".exercise-section-label")].find(l => /How/.test(txt(l)));
  const before = (a, b) => !!(a && b && (a.compareDocumentPosition(b) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING));
  ok("2e. the timer and Start the timer above the figure and How", !!t && before(t, fig) && before($("#ps-timer-btn"), fig) && before(fig, how) && txt($("#ps-timer-btn")) === "Start the timer");
  const watch = main.querySelector("details.xcard-watch");
  ok("2f. Watch out folded on the same screen (no page of its own)", !!watch && !watch.open && !$("#ps-watch-btn") && !$("#ps-begin-btn"));
  const coach = readFileSync(new URL("js/views/coach-proposal.js", ROOT), "utf8");
  const line = txt(main.querySelector(".ps-hurt"));
  ok("2g. the app's own safety line, word for word", line === "If something hurts — sharp, or building as you go — stop that one. Aching afterwards is normal." && coach.includes(line));
  ok("2h. 2 of 3, a third done", txt($("#ps-list-btn")) === "2 of 3 · The list" && /width: 33/.test(main.querySelector(".workout-progress-fill").getAttribute("style")));
}

console.log("\nTEST 3 - time's up");
{
  notes = 0; buzz = [];
  click($("#ps-timer-btn"));
  await until(() => txt($("#ps-timer-btn")) === "Pause", 1500);
  ok("3a. running: Pause", txt($("#ps-timer-btn")) === "Pause");
  await until(() => main.querySelector(".ps-timesup"), 4500);
  ok("3b. time's up: a tick and the words, said as status", txt(main.querySelector(".ps-timesup")) === "Time’s up." && main.querySelector(".ps-timesup").getAttribute("role") === "status" && txt($("#ps-timer-display")) === "✓");
  ok("3c. the chime (two notes) and a longer buzz", notes === 2 && buzz.length === 1 && Array.isArray(buzz[0]) && buzz[0].length === 5, `notes ${notes}, buzz ${JSON.stringify(buzz)}`);
  ok("3d. it never moves on by itself; the button names the next", txt(main.querySelector("h1")) === "Child's Pose" && txt($("#ps-complete-btn")) === "Next: Supine Twist");
}

console.log("\nTEST 4 - Timer sound off");
{
  person(); DP.setDisplayPref("timerSound", "off");
  await go("today"); await go("prescribed-session");
  click($("#ps-start-btn")); await until(() => $("#ps-complete-btn"));
  click($("#ps-complete-btn")); await until(() => $("#ps-timer-btn"));
  notes = 0; buzz = [];
  click($("#ps-timer-btn"));
  await until(() => main.querySelector(".ps-timesup"), 4500);
  ok("4a. no chime; the buzz and the words still", notes === 0 && buzz.length === 1 && !!main.querySelector(".ps-timesup"), `notes ${notes} buzz ${buzz.length} up ${!!main.querySelector(".ps-timesup")} h1 ${txt(main.querySelector("h1"))}`);
  DP.setDisplayPref("timerSound", "on");
}

console.log("\nTEST 5 - the list, any time");
{
  click($("#ps-list-btn"));
  await until(() => main.querySelector(".ps-sheet"));
  const sh = main.querySelector(".ps-sheet");
  ok("5a. a dialog, named by the list, with what's done and what's left", sh?.getAttribute("role") === "dialog" && sh.getAttribute("aria-modal") === "true" && /Cat-Cow, 10 · done/.test(txt(sh)) && /Child's Pose, 2 seconds · now/.test(txt(sh)));
  ok("5b. done ones can't be started again; the rest are buttons", !sh.querySelector('[data-ps-jump="p0"]') && !!sh.querySelector('[data-ps-jump="p2"]'));
  click(sh.querySelector('[data-ps-jump="p2"]'));
  await until(() => txt(main.querySelector("h1")) === "Supine Twist");
  ok("5c. tap one to do it now", txt(main.querySelector("h1")) === "Supine Twist" && !main.querySelector(".ps-sheet"));
  click($("#ps-list-btn")); await until(() => main.querySelector(".ps-sheet"));
  click($("#ps-sheet-close"));
  await until(() => !main.querySelector(".ps-sheet") && document.activeElement?.id === "ps-list-btn", 1500);
  ok("5d. Close: focus back on the list button", document.activeElement?.id === "ps-list-btn");
}

console.log("\nTEST 6 - notes at the end, then Finish");
{
  click($("#ps-complete-btn"));                               // Supine Twist done
  await until(() => txt(main.querySelector("h1")) === "Child's Pose");
  click($("#ps-complete-btn"));                               // Child's Pose done: the end
  await until(() => $("#ps-finish-btn"));
  const items = [...main.querySelectorAll(".ps-note-item")];
  ok("6a. That's the list, with Add a note on each one done", txt(main.querySelector("h1")) === "That’s the list" && items.length === 3 && items.every(d => /Add a note/.test(txt(d.querySelector("summary")))));
  const before = (store.get("activityLog") || []).length;
  click($("#ps-finish-btn"));
  await until(() => router.currentView === "reflect" || router.currentView === "plan-finish", 3000);
  const log = store.get("activityLog") || [];
  ok("6b. Finish logs the session, as before, and goes to the finish", log.length === before + 1 && log[log.length - 1].type === "prescribed-session" && log[log.length - 1].exercisesCount === 3, router.currentView);
}

console.log("\nTEST 7 - left another way, and come back");
{
  person(); await go("today"); await go("prescribed-session");
  click($("#ps-start-btn")); await until(() => $("#ps-complete-btn"));
  click($("#ps-complete-btn")); await until(() => txt(main.querySelector("h1")) === "Child's Pose");
  await go("today"); await go("prescribed-session");
  ok("7a. the list again, the done one ticked, Carry on", !!$("#ps-start-btn") && txt($("#ps-start-btn")) === "Carry on" && main.querySelectorAll(".ps-tick--on").length === 1);
}

console.log("\nTEST 8 - both tiers, and the setting");
{
  person("free"); await go("today"); await go("prescribed-session");
  ok("8a. Free: the same list first", txt(main.querySelector("h1")) === G && !!$("#ps-start-btn"));
  ok("8b. Timer sound: on unless turned off", DP.getDisplayPref("timerSound") === "on" && DP.DISPLAY_KEYS.timerSound === "alongside-timer-sound");
  const set = readFileSync(new URL("js/views/settings.js", ROOT), "utf8");
  ok("8c. Settings › Display › Sound › Timer sound, beside the coach's voice", /title: 'Sound', rows: \[\s*_voiceSwitch\(\),[\s\S]{0,120}_rowSwitch\(\{ id: 'disp-timer-sound', label: 'Timer sound'/.test(set));
  DP.resetDisplayPrefs();
  ok("8d. Reset display keeps it (as Vibration)", DP.DISPLAY_KEYS.timerSound && !/name !== "vibration"\)/.test(readFileSync(new URL("js/display-prefs.js", ROOT), "utf8")));
}

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
