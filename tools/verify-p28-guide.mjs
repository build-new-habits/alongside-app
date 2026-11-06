/**
 * tools/verify-p28-guide.mjs
 * 06 Nov 2026 v2
 *
 * v2 - The recordings' list (coach-audio.js v3, guide-me.js v2): a
 *   recording plays only when the list names it, at audio/<id>.mp3?v=<fp>.
 *   The checks set the list, not a file's answer.
 *
 * P-28 EMPATHY-THREAD, S4 GUIDE ME. Drives the real views in jsdom: the
 * Plan's Keep moving › Outside steps (views/path.js), What will happen and
 * the guided player (views/guide-me.js), Log what I did, the player's and
 * Yoga's holds (views/workout.js, views/yoga-session.js, js/hold-voice.js)
 * and Settings › Display › Coach's voice.
 *
 *   0  Positive controls: the fixture reaches the store; the door opens.
 *   1  Walk, run, bike ride ask How would you like your walk? Just go,
 *      Guide me (two on a walk), Take three with you. A swim does not.
 *   2  A bike ride: the road line, and Guide me indoors only.
 *   3  Take three: the three things, word for word, no audio; then the plan,
 *      and Log it keeps "three" on the entry. Just go keeps "just".
 *   4  What will happen: the session's own words and every moment's time,
 *      before Start; no recording: it says nothing will speak.
 *   5  Guiding, text first: the clock runs, each moment's words come at
 *      their time, Pause holds the clock, Stop and finish logs the walk
 *      with guideMe "guide" and goes to the finish.
 *   6  With the recording: the file is played, the screen follows its
 *      currentTime, the lock screen has its title and play, pause and stop,
 *      the session is "playback"; the end of the file is the end.
 *   7  ‹ Back from What will happen returns to the door's steps.
 *   8  While you hold: voice off, nothing; voice on, the hold's line starts
 *      with the timer, on screen, with one big Pause the voice; a lift has
 *      none; Yoga's held pose the same.
 *   9  Settings › Display › Coach's voice: off by default, writes 'on' and
 *      'off', never true or false.
 *
 * Red on alongside-v707 (no Guide me, no hold voice, no Coach's voice).
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><body><div id="app"><main id="main-content"></main><nav id="bottom-nav"></nav></div></body>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history; globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };

// A stand-in Audio: records what was asked for; "there" decides whether the file exists.
const audios = []; let fileThere = false;
class FakeAudio {
  constructor(src) { this.src = src; this.ls = {}; this.paused = true; this.currentTime = 0; audios.push(this); }
  addEventListener(t, f) { (this.ls[t] ||= []).push(f); }
  fire(t) { (this.ls[t] || []).forEach(f => f()); }
  load() { queueMicrotask(() => this.fire(fileThere ? "loadedmetadata" : "error")); }
  play() { this.paused = false; queueMicrotask(() => this.fire(fileThere ? "playing" : "error")); return Promise.resolve(); }
  pause() { this.paused = true; }
}
globalThis.Audio = FakeAudio;
globalThis.fetch = async (u) => { u = String(u); if (/audio\/manifest\.json$/.test(u)) return { ok: true, json: async () => ({ files: fileThere ? Object.fromEntries(ALL_IDS.map(id => [id, "abc123def4567890"])) : {} }) }; return { ok: fileThere }; };
const handlers = {};
Object.defineProperty(dom.window.navigator, "mediaSession", { value: { metadata: null, playbackState: "none", setActionHandler: (a, f) => { handlers[a] = f; }, setPositionState() {} }, configurable: true });
Object.defineProperty(dom.window.navigator, "audioSession", { value: { type: "auto" }, configurable: true });
globalThis.MediaMetadata = class { constructor(o) { Object.assign(this, o); } };
// A clock the test moves.
let NOW = Date.parse("2026-11-06T09:00:00Z");
const realNow = Date.now; Date.now = () => NOW;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
// v-list: the recordings' list decides what plays (coach-audio.js v3). Every
// clip and track the app knows, all "there" or none.
const CA = await import(B + "coach-audio.js");
const { clipIds } = await import(new URL("./build-audio.mjs", import.meta.url).href);
const { GUIDE_SESSIONS: _GS } = await import(B + "data/guide-me.js");
const ALL_IDS = [...clipIds(), ...Object.values(_GS).map(x => x.track)];
const V = "?v=abc123def4567890";
async function setFiles(on) { fileThere = on; await CA.loadAudioManifest(); }
const { router } = await import(B + "router.js");
const navs = [];
const main = document.getElementById("main-content");
const { PathView } = await import(B + "views/path.js");
const GM = await import(B + "views/guide-me.js");
const AL = await import(B + "views/activity-log.js");
const WO = await import(B + "views/workout.js");
const YS = await import(B + "views/yoga-session.js");
const { SettingsView } = await import(B + "views/settings.js");
const { GUIDE_SESSIONS } = await import(B + "data/guide-me.js");
const { HOLD_LINES } = await import(B + "data/grounding-moments.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);

function nav(v) {
  navs.push(v);
  if (v === "guide-me") { main.innerHTML = GM.render(); GM.onMount(); }
  if (v === "activity-log") { main.innerHTML = AL.render(); AL.onMount?.(); }
  if (v === "path") { main.innerHTML = ""; PathView(router).mount(main); }
  if (v === "workout") { main.innerHTML = WO.render(); try { WO.onMount(); } catch {} }
}
router.navigate = v => nav(v);
router.back = () => {};
globalThis.router = router; dom.window.router = router;

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
async function block(name, fn) { try { await fn(); } catch (e) { ok(`${name}: ran without throwing`, false, e.stack?.split("\n").slice(0, 3).join(" | ")); } }
const wait = ms => new Promise(r => setTimeout(r, ms));
const T = el => ((el || main).textContent || "").replace(/\s+/g, " ").trim();
const $ = s => main.querySelector(s);
const tap = s => { const el = typeof s === "string" ? $(s) : s; el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); return !!el; };
const rows = () => [...main.querySelectorAll(".path-row[data-v]")].map(b => b.dataset.v);

async function seed({ tier = "personal", voice = "off" } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("tier", tier); store.set("name", "Sentinel-S4");
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("coachVoice", voice);
  audios.length = 0; navs.length = 0; await setFiles(false);
  for (const k of Object.keys(handlers)) delete handlers[k];
}
function outside(activity) {
  router.pathStart = { door: "moving" }; nav("path");
  tap('.path-row[data-v="outside"]');
  tap(`.path-row[data-v="${activity}"]`);
}

await block("TEST 0", async () => {
  console.log("\nTEST 0 - positive controls");
  await seed();
  ok("0a. the fixture reached the store", store.get("name") === "Sentinel-S4");
  router.pathStart = { door: "moving" }; nav("path");
  ok("0b. Keep moving opens on where", rows().includes("outside"), rows().join(","));
});

await block("TEST 1", async () => {
  console.log("\nTEST 1 - three ways, on a walk, a run and a ride");
  await seed(); outside("walk");
  ok("1a. a walk asks How would you like your walk?", T($("h1")) === "How would you like your walk?", T($("h1")));
  ok("1b. Just go, Guide me twice (the two walks), Take three with you", JSON.stringify(rows()) === JSON.stringify(["just", "guide:walk", "guide:weather", "three"]), rows().join(","));
  ok("1c. each Guide me names its walk and its minutes", /Guide me: Mindful walk/.test(T()) && /Guide me: A walk in any weather/.test(T()) && /20 minutes\. Put your headphones in\./.test(T()));
  ok("1d. Take three says no audio", /Three things to notice, read now\. No audio, so keep your music on if you like\./.test(T()));
  ok("1e. Guide me and Take three are In Step's (orchid, two figures)", main.querySelector('.path-row[data-v="guide:walk"] .k-orchid') && main.querySelector('.path-row[data-v="three"] .k-orchid'));
  await seed(); outside("run");
  ok("1f. a run: How would you like your run?, one Guide me", T($("h1")) === "How would you like your run?" && JSON.stringify(rows()) === JSON.stringify(["just", "guide:run", "three"]));
  await seed(); outside("swim");
  ok("1g. a swim goes straight to its plan (no Guide me)", T($("h1")) === "Enjoy your swim" && !rows().some(v => v.startsWith("guide:")));
});

await block("TEST 2", async () => {
  console.log("\nTEST 2 - a bike ride");
  await seed(); outside("bike");
  ok("2a. the road line, word for word", T($("#path-road")) === GUIDE_SESSIONS.ride.roadLine);
  ok("2b. Guide me is offered indoors only", T($('.path-row[data-v="guide:ride"]')).startsWith("Guide me, indoors") && /on a turbo or bike at home/.test(T($('.path-row[data-v="guide:ride"]'))));
});

await block("TEST 3", async () => {
  console.log("\nTEST 3 - Take three, and Just go");
  await seed(); outside("walk"); tap('.path-row[data-v="three"]');
  const three = [...main.querySelectorAll(".path-three li")].map(li => T(li));
  ok("3a. the three things, word for word", JSON.stringify(three) === JSON.stringify(GUIDE_SESSIONS.walk.three), three.join(" | "));
  ok("3b. nothing speaks: no recording asked for", audios.length === 0 && /Nothing will speak or buzz while you.re out\./.test(T()));
  tap("#path-three-go");
  ok("3c. then the plan", T($("h1")) === "Enjoy your walk");
  tap('.path-row[data-v="log"]');
  ok("3d. Log it opens Log what I did", navs.at(-1) === "activity-log");
  const sel = main.querySelector('[data-type="walk"], [data-activity="walk"], #activity-type-walk');
  if (sel && !sel.classList.contains("selected")) tap(sel);
  tap("#activity-save-btn");
  const e = (store.get("activityLog") || []).at(-1) || {};
  tap("#activity-done-btn");
  ok("3e. the walk is kept with guideMe three", e.type === "walk" && e.guideMe === "three", JSON.stringify(e).slice(0, 160));
  await seed(); outside("run"); tap('.path-row[data-v="just"]'); tap('.path-row[data-v="log"]');
  tap("#activity-save-btn");
  const j = (store.get("activityLog") || []).at(-1) || {};
  tap("#activity-done-btn");
  ok("3f. Just go: the run is kept with guideMe just", j.type === "run" && j.guideMe === "just", JSON.stringify(j).slice(0, 160));
  await seed(); router.pathStart = { door: "moving" }; nav("path"); tap('.path-row[data-v="outside"]'); tap('.path-row[data-v="swim"]'); tap('.path-row[data-v="log"]'); tap("#activity-save-btn");
  const sw = (store.get("activityLog") || []).at(-1) || {};
  ok("3g. a swim gains no guideMe", sw.type === "swim" && !("guideMe" in sw), JSON.stringify(sw).slice(0, 120));
  tap("#activity-done-btn");
  // Each layer on its own: the door asks nothing for a swim, and Log what I did keeps a way only for a walk, run or ride.
  await seed(); AL.presetLogActivity("Swim", { guideMe: "just" }); nav("activity-log"); tap("#activity-save-btn");
  const sw2 = (store.get("activityLog") || []).at(-1) || {}; tap("#activity-done-btn");
  ok("3h. Log what I did keeps a way only for a walk, run or ride", sw2.type === "swim" && !("guideMe" in sw2), JSON.stringify(sw2).slice(0, 120));
});

await block("TEST 4", async () => {
  console.log("\nTEST 4 - What will happen");
  await seed(); outside("walk"); tap('.path-row[data-v="guide:walk"]'); await wait(10);
  const s = GUIDE_SESSIONS.walk;
  ok("4a. it opens What will happen for that walk", navs.at(-1) === "guide-me" && T($("h1")) === s.title);
  ok("4b. the walk's own words before you start", T().includes(s.before));
  const plan = [...main.querySelectorAll(".gm-plan li")].map(li => T(li.querySelector(".gm-plan__t")));
  ok("4c. every moment with its time", JSON.stringify(plan) === JSON.stringify(["Start", "1 min", "6 min", "12 min", "18 min", "20 min"]), plan.join(","));
  ok("4d. no recording: it says nothing will speak", $("#gm-nofile")?.hidden === false);
  ok("4e. Start says the minutes", T($("#gm-start")) === "Start, 20 minutes");
});

await block("TEST 5", async () => {
  console.log("\nTEST 5 - guiding, text first");
  await seed(); outside("walk"); tap('.path-row[data-v="guide:walk"]'); await wait(10);
  tap("#gm-start");
  const s = GUIDE_SESSIONS.walk;
  ok("5a. the first words are on screen at the start", T($("#gm-said")) === s.moments[0].text);
  NOW += 61 * 1000; await wait(300);
  ok("5b. at a minute the next moment's words", T($("#gm-said")) === s.moments[1].text && T($("#gm-clock")) === "1:01", T($("#gm-clock")));
  ok("5c. the moment is marked now, the first done", $("#gm-m1")?.classList.contains("is-now") && $("#gm-m0")?.classList.contains("is-done"));
  tap("#gm-pp");
  ok("5d. Pause says Carry on", T($("#gm-pp")) === "Carry on");
  NOW += 300 * 1000; await wait(300);
  ok("5e. paused, the clock holds", T($("#gm-clock")) === "1:01", T($("#gm-clock")));
  tap("#gm-pp"); NOW += 299 * 1000; await wait(300);
  ok("5f. carried on, the clock moves again", T($("#gm-said")) === s.moments[2].text, T($("#gm-clock")));
  tap("#gm-end");
  const e = (store.get("activityLog") || []).at(-1) || {};
  ok("5g. Stop and finish logs the walk, part-way, with guideMe guide", e.type === "walk" && e.guideMe === "guide" && e.status === "partial" && e.durationMins === 6, JSON.stringify(e).slice(0, 200));
  ok("5h. and goes to the finish", navs.at(-1) === "plan-finish" && store.get("currentActivityEntry")?.id === e.id);
  await seed({ tier: "personal" }); outside("walk"); tap('.path-row[data-v="guide:weather"]'); await wait(10); tap("#gm-start");
  NOW += 1201 * 1000; await wait(400);
  const w = (store.get("activityLog") || []).at(-1) || {};
  ok("5i. to the end: logged as done, and on to the finish", w.status === "completed" && w.name === "A walk in any weather" && navs.at(-1) === "plan-finish", JSON.stringify(w).slice(0, 160));
});

await block("TEST 6", async () => {
  console.log("\nTEST 6 - with the recording");
  await seed(); await setFiles(true); outside("run"); tap('.path-row[data-v="guide:run"]'); await wait(10);
  ok("6a. the recording is there: no 'nothing will speak' line", $("#gm-nofile")?.hidden === true);
  tap("#gm-start"); await wait(10);
  const a = audios.find(x => x.src === "audio/guide-run.mp3" + V);
  ok("6b. the one joined recording plays", !!a && a.paused === false);
  ok("6c. the session is playback, so music pauses rather than being talked over", navigator.audioSession.type === "playback");
  ok("6d. the lock screen: its title, and play, pause and stop", navigator.mediaSession.metadata?.title === "Mindful easy run" && ["play", "pause", "stop"].every(k => typeof handlers[k] === "function"));
  a.currentTime = 12 * 60 + 2; await wait(300);
  ok("6e. the screen follows the file", T($("#gm-said")) === GUIDE_SESSIONS.run.moments[2].text && T($("#gm-clock")) === "12:02");
  handlers.pause(); await wait(10);
  ok("6f. pause from the lock screen pauses the file", a.paused === true && T($("#gm-pp")) === "Carry on");
  handlers.play();
  ok("6g. play from the lock screen carries on", a.paused === false);
  a.currentTime = 1500; a.fire("ended"); await wait(10);
  const e = (store.get("activityLog") || []).at(-1) || {};
  ok("6h. the end of the file is the end: the run, done, guideMe guide", e.type === "run" && e.status === "completed" && e.guideMe === "guide" && e.durationMins === 25, JSON.stringify(e).slice(0, 160));
});

await block("TEST 7", async () => {
  console.log("\nTEST 7 - back to the door");
  await seed(); outside("walk"); tap('.path-row[data-v="guide:walk"]'); await wait(10);
  tap("#gm-back");
  ok("7a. ‹ Back returns to How would you like your walk?", navs.at(-1) === "path" && T($("h1")) === "How would you like your walk?", T($("h1")));
});

// ── 8. holds ──────────────────────────────────────────────────────────
const PLANK = { id: "plank", name: "Plank", category: "strength", position: "floor", duration: 45, sets: 1, section: "main", role: "main", equipment: [], instructions: ["Hold"], watchOut: ["Sagging"] };
const SQUAT = { id: "goblet-squat", name: "Goblet Squat", category: "strength", position: "standing", sets: 3, reps: "10", section: "main", role: "main", equipment: ["dumbbell"], instructions: ["Squat"], watchOut: ["Knees"] };
function workoutWith(ex) {
  store.set("generatedSession", { session: { id: "s", name: "Core", exercises: [ex] }, builtAt: new Date().toISOString(), inputs: {} });
  nav("workout");
  for (let i = 0; i < 4 && !$("#timer-toggle-btn") && !$("#complete-exercise-btn"); i++) tap('[data-step-go="capture"]:not([aria-current]), [data-step-go="do"]:not([aria-current])');
}
await block("TEST 8", async () => {
  console.log("\nTEST 8 - while you hold");
  await seed({ voice: "off" }); workoutWith(PLANK);
  ok("8pc. the plank's timer is there", !!$("#timer-toggle-btn"), T().slice(0, 120));
  tap("#timer-toggle-btn"); await wait(10);
  ok("8a. voice off: no line, nothing asked for", !$("#hv-card") && audios.length === 0);
  WO.onUnmount?.();
  await seed({ voice: "on" }); await setFiles(true); workoutWith(PLANK);
  tap("#timer-toggle-btn"); await wait(10);
  const plank = HOLD_LINES.find(l => l.id === "plank");
  ok("8b. voice on: the plank's line starts with the timer", audios.at(-1)?.src === "audio/hold-plank.mp3" + V && !audios.at(-1).paused);
  ok("8c. its words under the clock, in In Step's look", T($("#hv-card")).includes(plank.text) && !!$("#hv-card .line-icon"));
  ok("8d. one big Pause the voice", $("#hv-pause")?.hidden === false && $("#hv-pause").classList.contains("btn-large"));
  tap("#hv-pause");
  ok("8e. Pause the voice stops it and says so", audios.at(-1).paused === true && T($("#hv-pause")) === "Voice paused");
  const n = audios.length; tap("#timer-toggle-btn"); tap("#timer-toggle-btn"); await wait(10);
  ok("8f. pausing and resuming the timer does not start the line again", audios.length === n, String(audios.length - n));
  WO.onUnmount?.();
  await seed({ voice: "on" }); await setFiles(false); workoutWith(PLANK); tap("#timer-toggle-btn"); await wait(10);
  ok("8g. no file: the words show, and no Pause that does nothing", T($("#hv-card")).includes(plank.text) && $("#hv-pause")?.hidden === true);
  WO.onUnmount?.();
  await seed({ voice: "on" }); workoutWith(SQUAT);
  ok("8h. a lift has no timer and no line", !$("#timer-toggle-btn") && !$("#hv-card"));
  { const HV = await import(B + "hold-voice.js"); HV.resetHoldVoice(); await setFiles(true); const before = audios.length;
    HV.startHoldVoice(PLANK, 45, "k1"); HV.startHoldVoice(PLANK, 45, "k1");
    ok("8k. one line per hold, however often its timer starts", audios.length - before === 1, String(audios.length - before)); HV.stopHoldVoice(); }
  WO.onUnmount?.();
  // Yoga: a held pose.
  await seed({ voice: "on" }); await setFiles(true);
  main.innerHTML = YS.render(); YS.onMount();
  for (let i = 0; i < 14 && !main.querySelector("#ys-timer-btn"); i++) {
    const next = ['.cs-focus-card:not([disabled])', '[data-mins]', '#ys-start-btn'].map(q => main.querySelector(q)).find(Boolean);
    if (next) { tap(next); await wait(5); }
    if (!main.querySelector("#ys-timer-btn") && main.querySelector("#ys-next-btn")) tap("#ys-next-btn");
  }
  ok("8ipc. a held pose is reached in Yoga", !!$("#ys-timer-btn"), T().slice(0, 100));
  tap("#ys-timer-btn"); await wait(10);
  ok("8i. Yoga: the pose's line starts with Start hold, under the clock", !!$("#hv-slot #hv-card") && /audio\/hold-/.test(audios.at(-1)?.src || ""), (audios.at(-1)?.src || "none") + " | " + T($(".exercise-name, h2, h1")) + " | " + T($(".meta-tag")));
  tap("#ys-next-btn"); await wait(5);
  ok("8j. the next pose: the line stops", audios.filter(a => /hold-/.test(a.src)).every(a => a.paused));
});

await block("TEST 9", async () => {
  console.log("\nTEST 9 - Settings › Display › Coach's voice");
  await seed();
  ok("9a. off by default", store.getDefaults().coachVoice === "off" && store.get("coachVoice") === "off");
  main.innerHTML = ""; const v = SettingsView(router); v.mount(main);
  const open = main.querySelector('[data-section="display"], [data-open="display"], #settings-sec-display, [data-sec="display"]');
  if (open) tap(open);
  const sw = main.querySelector("#disp-coach-voice");
  ok("9b. the switch is in Display, off", !!sw && sw.getAttribute("aria-checked") === "false" && /Coach.s voice/.test(T(sw.closest("li"))), open ? "" : "display section not found");
  tap(sw);
  ok("9c. on writes 'on'", store.get("coachVoice") === "on" && sw?.getAttribute("aria-checked") === "true");
  tap(sw);
  ok("9d. off writes 'off', never false", store.get("coachVoice") === "off");
});

Date.now = realNow;
console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
