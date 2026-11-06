/**
 * tools/verify-p28-instep.mjs
 * 06 Nov 2026 v2
 *
 * v2 - P-28 FINISH: 7m's line is "This one's about you today." (Graeme,
 *   06 Nov; "short" was not true).
 *
 * P-28 EMPATHY-THREAD, S3 IN STEP PLAYER. Drives the real views in jsdom:
 * Wellbeing's tile, In Step's list and player (views/in-step.js), and both
 * finishes (views/plan-finish.js on the Plan, views/reflect.js on Free),
 * with the real store, the real offer rules (data/in-step-offer.js) and
 * the real wording (data/in-step-programme.js).
 *
 *   0  Positive controls: the fixture reaches the store; the views mount.
 *   1  Wellbeing: In Step's tile is orchid, two figures, new words.
 *   2  The list: the next episode in order and the ones done; nothing later.
 *   3  An episode, all four steps, the approved prototype's way: Listen,
 *      Hold still (seated way, Skip, Start, the timer), Choose (three, then
 *      There's no wrong answer.), Carry it. Reaching Carry it moves on.
 *   4  Before we start: last time's Carry it, three taps, only the tap kept;
 *      Skip keeps nothing. Not asked twice for the same Carry it.
 *   5  Going back to an episode done keeps the place in the programme.
 *   6  Text first, the voice: off, nothing plays; on, the line's file is
 *      asked for; Pause the voice only once sound has started; a missing
 *      file shows no control and is no error.
 *   7  The offer, on the Plan's finish: from session 3, never part-way, on a
 *      Bad day, twice a day or two sessions running; Not today does not
 *      push it away; a low day offers Part 1's Adjusting with its line;
 *      Start keeps what was said and opens that episode; no reflection
 *      prompt as well.
 *   8  The offer on Free's finish (reflect.js), counting the session not
 *      yet logged; B lines when no episode is offered, only when true.
 *   9  In Step's look: orchid in all three themes, at contrast; the icon
 *      is two figures; the finish lines wear it.
 *  10  The old room is gone: no Learn why, no research, no choice log;
 *      in-step-scenarios.js retired and imported by nothing; Free's door
 *      says four parts.
 *
 * Red on alongside-v706 (the old room: no programme player, no offer).
 */
import fs from "node:fs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><body><div id="app"><main id="main-content"></main></div></body>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history; globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };

// A stand-in Audio that records what was asked for and plays only when told.
const audios = [];
let fileThere = false;
class FakeAudio {
  constructor(src) { this.src = src; this.ls = {}; this.paused = true; audios.push(this); }
  addEventListener(t, f) { (this.ls[t] ||= []).push(f); }
  fire(t) { (this.ls[t] || []).forEach(f => f()); }
  play() { this.paused = false; queueMicrotask(() => this.fire(fileThere ? "playing" : "error")); return Promise.resolve(); }
  pause() { this.paused = true; }
}
globalThis.Audio = FakeAudio;
const fetched = [];
globalThis.fetch = async (u) => { fetched.push(String(u)); return { ok: fileThere }; };

const ROOT = new URL("../", import.meta.url);
const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
const navs = [];
router.navigate = (v) => { navs.push(v); };
globalThis.router = router; dom.window.router = router;
const IS   = await import(B + "views/in-step.js");
const NOT  = await import(B + "views/noticing.js");
const RF   = await import(B + "views/reflect.js");
const { PlanFinishView } = await import(B + "views/plan-finish.js");
const PROG = await import(B + "data/in-step-programme.js");
const OFF  = await import(B + "data/in-step-offer.js");
const { giveHealthConsent } = await import(B + "data/health-consent.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
async function block(name, fn) { try { await fn(); } catch (e) { ok(`${name}: ran without throwing`, false, e.stack?.split("\n").slice(0, 3).join(" | ")); } }
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const T = el => ((el || main).textContent || "").replace(/\s+/g, " ").trim();
const $ = s => main.querySelector(s);
const tap = s => { const el = typeof s === "string" ? $(s) : s; el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); return !!el; };
const prog = () => (store.get("inStepProgress") || {}).programme;
const dayAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
const key = d => d.toISOString().split("T")[0];

function seed({ tier = "personal", sessions = 4, checkin = { energy: 7, mood: 6 }, sore = null, programme = null, voice = "off" } = {}) {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", tier); store.set("name", "Sentinel-S3");
  store.set("ageConfirmed", true);
  store.set("activityLog", Array.from({ length: sessions }, (_, i) => ({ id: "p" + i, type: "workout", status: "completed", completedAt: dayAgo(i + 1).toISOString(), date: dayAgo(i + 1).toISOString() })));
  if (checkin) { store.set("checkinHistory", { [key(new Date())]: checkin }); store.set("lastCheckin", { ...checkin, date: new Date().toDateString() }); }
  if (sore) { store.set("conditions", [sore.id]); store.set("conditionPainScores", { [sore.id]: sore.score }); }
  if (programme) store.set("inStepProgress", { ...(store.get("inStepProgress") || {}), programme: { ...prog(), ...programme } });
  store.set("coachVoice", voice);
  audios.length = 0; navs.length = 0;
}
function mountInStep() { IS.onUnmount?.(); main.innerHTML = IS.render(); IS.onMount(); }

// ── 0 ──────────────────────────────────────────────────────────────────
await block("TEST 0", async () => {
  console.log("\nTEST 0 - positive controls");
  seed();
  ok("0a. the fixture reached the store", store.get("name") === "Sentinel-S3" && store.get("activityLog").length === 4);
  mountInStep();
  ok("0b. In Step's list mounts with its heading", $("h1")?.textContent.trim() === "In Step", T().slice(0, 60));
});

// ── 1 ──────────────────────────────────────────────────────────────────
await block("TEST 1", async () => {
  console.log("\nTEST 1 - Wellbeing's tile");
  seed();
  const v = NOT.NoticingView ? NOT.NoticingView(router) : null;
  if (v?.mount) v.mount(main); else { main.innerHTML = NOT.render(); NOT.onMount?.(); }
  const tile = $("#noticing-in-step-btn");
  ok("1a. the tile is there, orchid", !!tile && tile.classList.contains("k-orchid"), tile?.className);
  ok("1b. it says what In Step is now", /Short moments about the people around you\./.test(T(tile)) && !/scenario/i.test(T(tile) + (tile?.getAttribute("aria-label") || "")), T(tile));
  ok("1c. its icon is two figures", (tile?.innerHTML.match(/<circle/g) || []).length === 2);
});

// ── 2 ──────────────────────────────────────────────────────────────────
await block("TEST 2", async () => {
  console.log("\nTEST 2 - the list keeps the order");
  seed({ programme: { part: 1, episode: 3, done: ["p1e1", "p1e2"] } });
  mountInStep();
  const eps = [...main.querySelectorAll("[data-ep]")].map(b => b.dataset.ep);
  ok("2a. the next episode is offered first", main.querySelector(".instep-next")?.dataset.ep === "p1e3" && /Episode 3: Two standards/.test(T(main.querySelector(".instep-next"))));
  ok("2b. the episodes done are open again; nothing later is", JSON.stringify([...new Set(eps)].sort()) === JSON.stringify(["p1e1", "p1e2", "p1e3"]), eps.join(","));
  ok("2c. each part says why, in its own plain sentence", PROG.PARTS.every(p => T().includes(p.why)));
  ok("2d. a part not reached says when it opens", /Opens after Part 1\./.test(T()) && /Opens after Part 3\./.test(T()));
  seed({ programme: { part: 4, episode: 6, done: PROG.EPISODES.map(e => e.id) } });
  mountInStep();
  ok("2e. all 24 done: every episode open, and the last part's closing line", main.querySelectorAll(".instep-ep").length === 24 && !main.querySelector(".instep-next") && T().includes(PROG.PARTS[3].closing.text));
});

// ── 3 ──────────────────────────────────────────────────────────────────
await block("TEST 3", async () => {
  console.log("\nTEST 3 - an episode, as the prototype plays it");
  seed();
  mountInStep();
  tap(".instep-next");
  const e = PROG.getEpisode("p1e1");
  ok("3a. the first episode has no last time: it opens on Listen", $("h1")?.textContent === e.title && T().includes(e.listen.text), T().slice(0, 80));
  ok("3b. the step strip says where you are", $('[aria-current="step"]')?.textContent === "Listen" && main.querySelectorAll(".instep-steps li").length === 4);
  ok("3c. the header says In Step, part and place, with Exit", /In Step · Part 1 · 1 of 6/.test(T($(".instep-bar"))) && $("#is-exit")?.textContent.trim() === "Exit");
  tap("#is-next");
  ok("3d. Hold still: the position, how, and the seated way", $("h1")?.textContent === "Hold still" && T().includes(e.hold.pose) && T().includes(e.hold.how) && T().includes("Seated: " + e.hold.alt.text));
  ok("3e. Skip the hold, and Start with its seconds", !!$("#is-skip-hold") && $("#is-hold-go")?.textContent.trim() === `Start ${e.hold.secs} seconds`);
  tap("#is-hold-go");
  ok("3f. the timer, with the hold's line on screen", $('[role="timer"]') && $("#is-left")?.textContent === String(e.hold.secs) && T().includes(e.hold.text));
  await wait(1100);
  ok("3g. the timer counts real seconds", Number($("#is-left")?.textContent) < e.hold.secs, $("#is-left")?.textContent);
  IS.onUnmount(); main.innerHTML = ""; // stop the clock
  // Pick it up at Choose (the hold is skippable, which is the next check).
  seed(); mountInStep(); tap(".instep-next"); tap("#is-next"); tap("#is-skip-hold");
  ok("3h. Skip the hold goes to Choose, and the strip says so", $("h1")?.textContent === "Choose" && $('[aria-current="step"]')?.textContent === "Choose" && main.querySelectorAll(".instep-steps li.is-done").length === 2);
  const radios = [...main.querySelectorAll('input[name="is-opt"]')];
  ok("3i. three ways, word for word, in a fieldset with the question", radios.length === 3 && T($("legend")) === e.choose.question && e.choose.options.every(o => T().includes(o)));
  ok("3j. nothing is said before a choice", T($("#is-ack")) === "");
  radios[1].checked = true; radios[1].dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  ok("3k. after any choice: There's no wrong answer.", T($("#is-ack")) === "There's no wrong answer.");
  const before = JSON.stringify(store.get("inStepProgress"));
  ok("3l. the choice is kept nowhere", !/"(optionId|choice|tag)"/.test(before) && (store.get("inStepProgress").choiceLog || []).length === 0);
  tap("#is-next");
  ok("3m. Carry it: one small thing for today", $("h1")?.textContent === "Carry it" && T().includes(e.carry.text) && /I'll ask how it went next time\./.test(T()));
  const p = prog();
  ok("3n. reaching Carry it moves on to episode 2, and remembers this Carry it", p.part === 1 && p.episode === 2 && p.done.includes("p1e1") && p.lastCarry === "p1e1" && p.lastAnswer === null, JSON.stringify(p));
  tap("#is-done");
  ok("3o. Done from Wellbeing goes back to the list", $("h1")?.textContent === "In Step" && $(".instep-next")?.dataset.ep === "p1e2");
  // The end of a part says its closing line.
  seed({ programme: { part: 1, episode: 6, done: ["p1e1", "p1e2", "p1e3", "p1e4", "p1e5"], lastCarry: "p1e5", lastAnswer: "did" } });
  mountInStep(); tap(".instep-next"); tap("#is-next"); tap("#is-skip-hold"); tap("#is-next");
  ok("3p. episode 6 ends with the part's closing line", T().includes(PROG.PARTS[0].closing.text));
  ok("3q. and then Part 2 is next", prog().part === 2 && prog().episode === 1);
});

// ── 4 ──────────────────────────────────────────────────────────────────
await block("TEST 4", async () => {
  console.log("\nTEST 4 - Before we start");
  seed({ programme: { part: 1, episode: 2, done: ["p1e1"], lastCarry: "p1e1", lastAnswer: null } });
  mountInStep(); tap(".instep-next");
  const prev = PROG.getEpisode("p1e2").prev;
  ok("4a. last time's line, word for word", $("h1")?.textContent === "Before we start" && T($("#is-prev-line")) === prev, T($("#is-prev-line")));
  const btns = [...main.querySelectorAll("[data-answer]")];
  ok("4b. three taps: It did / Not yet / It didn't come up", btns.map(b => b.textContent.trim()).join(" / ") === "It did / Not yet / It didn't come up");
  ok("4c. it says only the tap is kept", /Only your tap is kept\. No score, nothing to write\./.test(T()));
  tap('[data-answer="not-yet"]');
  ok("4d. the tap is kept, and only the tap", prog().lastAnswer === "not-yet" && $("h1")?.textContent === "The session you didn't do");
  IS.onUnmount(); mountInStep(); tap(".instep-next");
  ok("4e. not asked twice about the same Carry it", $("h1")?.textContent === "The session you didn't do");
  seed({ programme: { part: 1, episode: 2, done: ["p1e1"], lastCarry: "p1e1", lastAnswer: null } });
  mountInStep(); tap(".instep-next"); tap("#is-skip-prev");
  ok("4f. Skip this and start keeps nothing", prog().lastAnswer === null && $("h1")?.textContent === "The session you didn't do");
  OFF.answerLastTime("something typed");
  ok("4g. nothing but the three taps can be kept", prog().lastAnswer === null);
});

// ── 5 ──────────────────────────────────────────────────────────────────
await block("TEST 5", async () => {
  console.log("\nTEST 5 - going back to one done");
  seed({ programme: { part: 2, episode: 3, done: ["p1e1", "p1e2", "p1e3", "p1e4", "p1e5", "p1e6", "p2e1", "p2e2"], lastCarry: "p2e2", lastAnswer: "did" } });
  mountInStep(); tap('.instep-ep[data-ep="p1e4"]');
  tap("#is-next"); tap("#is-skip-hold"); tap("#is-next");
  const p = prog();
  ok("5a. the place in the programme is kept", p.part === 2 && p.episode === 3, JSON.stringify(p));
  ok("5b. the last Carry it is the one just given", p.lastCarry === "p1e4" && OFF.lastTimeLine() === PROG.getEpisode("p1e5").prev);
});

// ── 6 ──────────────────────────────────────────────────────────────────
await block("TEST 6", async () => {
  console.log("\nTEST 6 - text first, the voice");
  seed({ voice: "off" }); mountInStep(); tap(".instep-next"); await wait(5);
  ok("6a. voice off: nothing is asked for, the words are on screen", audios.length === 0 && T().includes(PROG.getEpisode("p1e1").listen.text));
  ok("6b. voice off: no Pause the voice, no Speaking", $("#is-pause")?.hidden === true && $("#is-spk")?.hidden === true);
  seed({ voice: "on" }); fileThere = false; mountInStep(); tap(".instep-next"); await wait(5);
  ok("6c. voice on: the line's own file is asked for", audios.at(-1)?.src === "audio/instep-p1-e1-listen.mp3", audios.at(-1)?.src);
  ok("6d. no file: no control that does nothing, and no error", $("#is-pause")?.hidden === true && $("#is-spk")?.hidden === true);
  seed({ voice: "on" }); fileThere = true; mountInStep(); tap(".instep-next"); await wait(5);
  ok("6e. the file plays: Speaking and Pause the voice appear", $("#is-pause")?.hidden === false && $("#is-spk")?.hidden === false);
  tap("#is-pause");
  ok("6f. Pause the voice stops it and says so", audios.at(-1).paused === true && /Voice paused/.test($("#is-pause")?.textContent));
  tap("#is-next");
  ok("6h. voice on: the hold intro says it will talk you through", /When you press Start, I'll talk you through it\./.test(T()));
  tap("#is-hold-go"); await wait(5);
  ok("6g. the hold's line starts by itself with the timer", audios.at(-1)?.src === "audio/instep-p1-e1-hold.mp3" && !audios.at(-1).paused);
  IS.onUnmount();
  ok("6i. leaving the screen stops the voice", audios.at(-1).paused === true);
  seed({ voice: "off" }); mountInStep(); tap(".instep-next"); tap("#is-next");
  ok("6j. voice off: the hold intro does not promise a voice", !/talk you through/.test(T()));
  // v2: a part's clips are asked for when an episode opens, voice on only.
  // Part 4, which nothing here has opened yet, so the once-only memory cannot hide a fetch.
  seed({ voice: "off", programme: { part: 4, episode: 1, done: PROG.EPISODES.slice(0, 18).map(e => e.id), lastCarry: "p3e6", lastAnswer: "did" } }); fetched.length = 0; mountInStep(); tap(".instep-next");
  ok("6k. voice off: no clip is asked for", fetched.length === 0, fetched.join(","));
  IS.onUnmount?.();
  seed({ voice: "on", programme: { part: 3, episode: 1, done: ["p1e1","p1e2","p1e3","p1e4","p1e5","p1e6","p2e1","p2e2","p2e3","p2e4","p2e5","p2e6"], lastCarry: "p2e6", lastAnswer: "did" } }); fetched.length = 0; mountInStep(); tap(".instep-next");
  const want = PROG.audioIdsForPart(3).map(id => `audio/${id}.mp3`);
  ok("6l. voice on: opening Part 3 asks for its 19 clips (the line after Choose with them, unless already asked)", want.every(u => fetched.includes(u)) && fetched.every(u => want.includes(u) || u === `audio/${PROG.ACK.audio}.mp3`) && new Set(fetched).size === fetched.length, fetched.length + " " + fetched.slice(0, 3).join(","));
  const n = fetched.length; IS.onUnmount?.(); mountInStep(); tap(".instep-next");
  ok("6m. and only once: opening it again asks for nothing more", fetched.length === n, String(fetched.length - n));
  fileThere = false;
});

// ── 7 ──────────────────────────────────────────────────────────────────
function planFinish(entry = {}) {
  const e = { id: "now", type: "workout", status: "completed", completedAt: new Date().toISOString(), exerciseIds: [], ...entry };
  store.set("currentActivityEntry", e);
  main.innerHTML = "";
  PlanFinishView({ navigate: v => navs.push(v), back() {} }).mount(main);
}
await block("TEST 7", async () => {
  console.log("\nTEST 7 - the offer, on the Plan's finish");
  seed({ sessions: 1 }); planFinish();
  ok("7a. not before session 3 (this is session 2)", !$(".instep-offer"));
  seed({ sessions: 2 }); planFinish();
  const card = $(".instep-offer");
  ok("7b. session 3: the offer, orchid, In Step · part · Episode n · about 3 minutes", !!card && T(card.querySelector("h2")) === "In Step · You · Episode 1 · about 3 minutes" && !!card.querySelector(".line-icon"), T(card));
  ok("7c. Start and Not today", $("#pf-is-start")?.textContent.trim() === "Start" && $("#pf-is-later")?.textContent.trim() === "Not today");
  ok("7d. it is recorded as offered, today, at this session", prog().offeredSession === 3 && new Date(prog().offeredAt).toDateString() === new Date().toDateString());
  tap("#pf-is-later");
  ok("7e. Not today takes the card away and leaves Done", !$(".instep-offer") && !!$("#pf-done"));
  ok("7f. Not today does not push the next offer away", prog().offeredSession === 3);
  seed({ sessions: 4, programme: { offeredAt: new Date().toISOString(), offeredSession: 2 } }); planFinish();
  ok("7g. once a day at most, even when two sessions have passed", !$(".instep-offer"));
  seed({ sessions: 3, programme: { offeredAt: dayAgo(1).toISOString(), offeredSession: 3 } }); planFinish();
  ok("7h. not two finished sessions running", !$(".instep-offer"));
  seed({ sessions: 4, programme: { offeredAt: dayAgo(1).toISOString(), offeredSession: 3 } }); planFinish();
  ok("7i. control: the second session after, on another day, offers again", !!$(".instep-offer"));
  seed({ sessions: 4 }); planFinish({ status: "partial" });
  ok("7j. never part-way", !$(".instep-offer"));
  seed({ sessions: 4, sore: { id: "knee", score: 8 } }); planFinish();
  ok("7k. never on a Bad day", !$(".instep-offer"));
  seed({ sessions: 4, sore: { id: "knee", score: 3 } }); planFinish();
  ok("7l. control: a little sore still offers", !!$(".instep-offer"));
  seed({ sessions: 4, checkin: { energy: 3, mood: 6 }, programme: { part: 2, episode: 2, done: ["p1e1","p1e2","p1e3","p1e4","p1e5","p1e6","p2e1"] } }); planFinish();
  ok("7m. a low energy day: Part 1's Adjusting, with its line", /Episode 6/.test(T($(".instep-offer h2"))) && T($(".instep-offer")).includes("Adjusting") && T($(".instep-offer")).includes("This one's about you today.") && !/short/.test(T($(".instep-offer"))), T($(".instep-offer")));
  seed({ sessions: 4, checkin: { energy: 7, mood: 2 } }); planFinish();
  ok("7n. a low mood day too", T($(".instep-offer")).includes("Adjusting"));
  seed({ sessions: 4, programme: { part: 2, episode: 3, done: ["p1e1"] } }); planFinish();
  ok("7o. otherwise the next in order", T($(".instep-offer h2")) === "In Step · People close to you · Episode 3 · about 3 minutes");
  // Start keeps what was said, then opens the episode.
  seed({ sessions: 4 }); giveHealthConsent();
  store.set("activityLog", [...store.get("activityLog"), { id: "now", type: "workout", status: "completed", completedAt: new Date().toISOString() }]);
  planFinish();
  const note = $("#pf-note");
  ok("7pc. control: the finish has its note box (health consent given)", !!note);
  if (note) { note.value = "kept"; note.dispatchEvent(new dom.window.Event("input", { bubbles: true })); }
  tap("#pf-is-start");
  ok("7p. Start opens In Step", navs.at(-1) === "in-step", navs.join(","));
  ok("7q. what was said on the finish is kept", (store.get("activityLog").find(x => x.id === "now") || {}).note === "kept");
  mountInStep();
  ok("7r. the player opens on that episode", $("h1")?.textContent === "Three answers");
  tap("#is-exit");
  ok("7s. Exit from a finish's episode goes Home", navs.at(-1) === "today");
  // From a finish, the episode opens as it would from Wellbeing.
  seed({ sessions: 4, programme: { part: 1, episode: 2, done: ["p1e1"], lastCarry: "p1e1", lastAnswer: "did" } }); planFinish(); tap("#pf-is-start"); mountInStep();
  ok("7u. last time already answered: it opens on Listen", $("h1")?.textContent === "The session you didn't do");
  seed({ sessions: 4, programme: { part: 1, episode: 2, done: ["p1e1"], lastCarry: "p1e1", lastAnswer: null } }); planFinish(); tap("#pf-is-start"); mountInStep();
  ok("7v. not yet answered: it asks first", $("h1")?.textContent === "Before we start");
  // No reflection prompt as well.
  seed({ sessions: 4, programme: {} }); store.set("lastEmpathyPromptSession", 0);
  planFinish(); tap("#pf-done");
  ok("7t. an offered finish has no reflection prompt as well", !$("#pf-empathy") && navs.at(-1) === "today");
});

// ── 8 ──────────────────────────────────────────────────────────────────
function freeFinish(entry = {}) {
  store.set("currentActivityEntry", { id: "f" + Math.random(), type: "run", status: "completed", name: "Run", ...entry });
  main.innerHTML = RF.render(); RF.onMount();
}
await block("TEST 8", async () => {
  console.log("\nTEST 8 - Free's finish, and B");
  seed({ tier: "free", sessions: 2 }); freeFinish();
  ok("8a. Free: the run not yet logged counts (session 3), so it is offered", !!$(".instep-offer") && prog().offeredSession === 3, String(prog().offeredSession));
  tap("#rf-is-later");
  ok("8b. Not today takes it away", !$(".instep-offer") && !!$("#reflect-done-btn"));
  seed({ tier: "free", sessions: 2 }); freeFinish(); tap("#rf-is-start");
  ok("8c. Start logs the session and opens In Step", navs.at(-1) === "in-step" && store.get("activityLog").length === 3);
  // B: every third finished session, checked in, nothing offered, only when true.
  seed({ sessions: 5, programme: { offeredAt: new Date().toISOString(), offeredSession: 5 } }); planFinish();
  ok("8d. B on session 6 with a check-in: the general line", T($(".instep-bline")).includes("This morning you told me how you were, in three answers."), T($(".instep-bline")));
  ok("8e. B wears In Step's look, and nothing to press but Listen (hidden: voice off)", !!$(".instep-bline .line-icon") && $("#pf-bl-listen")?.hidden === true);
  seed({ sessions: 5, checkin: { energy: 3, mood: 6 }, programme: { offeredAt: new Date().toISOString(), offeredSession: 5 } }); planFinish();
  ok("8f. after a low check-in: the low day line", T($(".instep-bline")).includes("You told me today was a low one, and you came anyway."));
  seed({ sessions: 5, sore: { id: "knee", score: 3 }, programme: { offeredAt: new Date().toISOString(), offeredSession: 5 } }); planFinish();
  ok("8g. when a sore area left something out: the plan changed line", T($(".instep-bline")).includes("Your plan changed today because of how you were."));
  seed({ sessions: 5, checkin: null, programme: { offeredAt: new Date().toISOString(), offeredSession: 5 } }); planFinish();
  ok("8h. no check-in today: no B", !$(".instep-bline"));
  seed({ sessions: 5, sore: { id: "knee", score: 8 }, programme: { offeredAt: new Date().toISOString(), offeredSession: 5 } }); planFinish();
  ok("8i. a Bad day: no B", !$(".instep-bline"));
  seed({ sessions: 4, programme: { offeredAt: new Date().toISOString(), offeredSession: 4 } }); planFinish();
  ok("8j. now and then: not on session 5", !$(".instep-bline"));
  seed({ sessions: 8 }); planFinish();
  ok("8k. not beside an episode (session 9 offers one)", !!$(".instep-offer") && !$(".instep-bline"));
  ok("8m. and the rule itself: no B when an episode is offered", OFF.finishBLine({ sessionCount: 9, episodeOffered: true }) === null && OFF.finishBLine({ sessionCount: 9, episodeOffered: false }) !== null);
  seed({ voice: "on", sessions: 5, programme: { offeredAt: new Date().toISOString(), offeredSession: 5 } }); fileThere = true; planFinish(); await wait(5);
  ok("8l. voice on and the file there: Listen appears", $("#pf-bl-listen")?.hidden === false);
  fileThere = false;
});

// ── 9 ──────────────────────────────────────────────────────────────────
await block("TEST 9", async () => {
  console.log("\nTEST 9 - In Step's look");
  const vars = fs.readFileSync(new URL("css/base/variables.css", ROOT), "utf8");
  const block = sel => { const i = vars.indexOf(sel); return i < 0 ? "" : vars.slice(i, vars.indexOf("}", i)); };
  const tok = (b, n) => (b.match(new RegExp(`--${n}:\\s*(#[0-9A-Fa-f]{6})`)) || [])[1];
  const dark = block(":root {"), light = block(":root.scheme-light"), hc = block(":root.scheme-high-contrast");
  ok("9a. orchid: #F0ABFC dark, #A21CAF light, #F5D0FE high contrast",
    tok(dark, "kind-orchid")?.toUpperCase() === "#F0ABFC" && tok(light, "kind-orchid")?.toUpperCase() === "#A21CAF" && tok(hc, "kind-orchid")?.toUpperCase() === "#F5D0FE");
  const lum = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const cr = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const pairs = [[dark, ["color-bg-deep", "color-bg", "color-bg-card"]], [light, ["color-bg-deep", "color-bg", "color-bg-card"]], [hc, ["color-bg-deep", "color-bg", "color-bg-card"]]];
  const worst = Math.min(...pairs.flatMap(([b, ss]) => ss.map(s => cr(tok(b, "kind-orchid"), tok(b, s) || tok(dark, s)))));
  ok("9b. orchid is 4.5:1 or more as text on every ground, every theme", worst >= 4.5, worst.toFixed(2));
  const css = fs.readFileSync(new URL("css/components/in-step.css", ROOT), "utf8");
  ok("9c. in-step.css is imported and gives .k-orchid its colour", /@import 'components\/in-step\.css'/.test(fs.readFileSync(new URL("css/main.css", ROOT), "utf8")) && /\.k-orchid\s*\{\s*--k:\s*var\(--kind-orchid\)/.test(css));
  const { lineIcon } = await import(B + "data/line-icons.js");
  ok("9d. the icon is two figures side by side", (lineIcon("instep").match(/<circle/g) || []).length === 2);
  seed({ sessions: 1 }); store.set("lastEmpathyPromptSession", 0); store.set("lastEmpathyPromptAt", dayAgo(30).toISOString());
  store.set("activityLog", Array.from({ length: 9 }, (_, i) => ({ id: "q" + i, type: "workout", status: "completed", completedAt: dayAgo(i + 1).toISOString() })));
  store.set("inStepProgress", { ...store.get("inStepProgress"), programme: { ...prog(), offeredAt: new Date().toISOString(), offeredSession: 9 } });
  planFinish(); tap("#pf-done");
  ok("9e. the reflection prompt wears In Step's look", !!$(".instep-prompt .instep-eyebrow .line-icon") && /In Step/.test(T($(".instep-prompt"))), T().slice(0, 80));
});

// ── 10 ─────────────────────────────────────────────────────────────────
await block("TEST 10", async () => {
  console.log("\nTEST 10 - the old room is gone");
  const src = fs.readFileSync(new URL("js/views/in-step.js", ROOT), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  ok("10a. no Learn why, no movements, no choice log", !/learnWhy|Learn why|MOVEMENTS|choiceLog|recordChoice/.test(src));
  ok("10b. in-step-scenarios.js is retired to docs/archive-code and imported by nothing",
    !fs.existsSync(new URL("js/data/in-step-scenarios.js", ROOT)) && fs.existsSync(new URL("docs/archive-code/in-step-scenarios_retired_06nov2026.js", ROOT)) &&
    !fs.readdirSync(new URL("js/views/", ROOT)).some(f => f.endsWith(".js") && /in-step-scenarios/.test(fs.readFileSync(new URL("js/views/" + f, ROOT), "utf8"))));
  seed({ tier: "free", programme: { part: 1, episode: 1 } }); mountInStep(); tap(".instep-next"); tap("#is-next"); tap("#is-skip-hold"); tap("#is-next");
  ok("10c. Free's door, on Carry it, says four parts", /That.s In Step \u2014 four parts, one thing at a time/.test(T($(".upgrade-door"))), T($(".upgrade-door")));
  seed({ tier: "personal" }); mountInStep(); let shown = T(); tap(".instep-next"); shown += T(); tap("#is-next"); shown += T(); tap("#is-skip-hold"); shown += T(); tap("#is-next");
  ok("10d. the Plan has no door", !$(".upgrade-door"));
  shown += T();
  ok("10e. nothing on screen cites research", !/\b(19|20)\d\d\b|et al|research/i.test(shown));
});

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
