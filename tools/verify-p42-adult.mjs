/**
 * tools/verify-p42-adult.mjs
 * 26 Nov 2026 v1
 *
 * P-42 S1. In Step's fifth part for adults, The world on your phone
 * (approved by Graeme 26 Nov, BNH-Files Product/alongside_in-step-adult_
 * part5_words_26nov2026_v2.md), held word for word to its approved words.
 *
 *   1  Part 5's six episodes: every line word for word (italics as
 *      quotation marks), its plain sentence, its recaps and third answers.
 *   2  Part 4's last episode, Recognition, gains its recap; each Last time
 *      in the words is the recap the app builds from the episode before.
 *   3  Part 5 is the last part: "That's In Step ..." closes it; Part 4
 *      closes as Parts 1 to 3 do, saying Part 5 comes next.
 *   4  The Part 5 voice script (addendum) has every clip, with the words on
 *      screen, and build-audio names them.
 *   5  On screen: after Recognition, Part 5 is next, its Last time names
 *      Recognition with "I didn't get the chance"; Part 5's last episode
 *      ends with In Step's closing line, and so does the finished list.
 *   6  The standard: no should, score, streak or praise words (Part 5's
 *      "the anger points at" allowed, as in verify-p28-content).
 *
 * Red on alongside-v760 (four parts).
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
globalThis.fetch = async (u) => { u = String(u); if (/audio\/manifest\.json$/.test(u)) return { ok: true, json: async () => ({ files: fileThere ? Object.fromEntries(ALL_IDS.map(id => [id, HASH])) : {} }) }; fetched.push(u); return { ok: fileThere }; };

const ROOT = new URL("../", import.meta.url);
const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
// v-list: the recordings' list decides what plays (coach-audio.js v3). Every
// clip and track the app knows, all "there" or none.
const CA = await import(B + "coach-audio.js");
const { clipIds } = await import(new URL("./build-audio.mjs", import.meta.url).href);
const { GUIDE_SESSIONS: _GS } = await import(B + "data/guide-me.js");
const ALL_IDS = [...clipIds(), ...Object.values(_GS).map(x => x.track)];
let HASH = "abc123def4567890";
const V = "?v=abc123def4567890";
async function setFiles(on) { fileThere = on; await CA.loadAudioManifest(); }
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

async function seed({ tier = "personal", sessions = 4, checkin = { energy: 7, mood: 6 }, sore = null, programme = null, voice = "off" } = {}) {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", tier); store.set("name", "Sentinel-S3");
  store.set("ageConfirmed", true);
  store.set("activityLog", Array.from({ length: sessions }, (_, i) => ({ id: "p" + i, type: "workout", status: "completed", completedAt: dayAgo(i + 1).toISOString(), date: dayAgo(i + 1).toISOString() })));
  if (checkin) { store.set("checkinHistory", { [key(new Date())]: checkin }); store.set("lastCheckin", { ...checkin, date: new Date().toDateString() }); }
  if (sore) { store.set("conditions", [sore.id]); store.set("conditionPainScores", { [sore.id]: sore.score }); }
  if (programme) store.set("inStepProgress", { ...(store.get("inStepProgress") || {}), programme: { ...prog(), ...programme } });
  store.set("coachVoice", voice);
  audios.length = 0; navs.length = 0;
  await setFiles(false);
}
function mountInStep() { IS.onUnmount?.(); main.innerHTML = IS.render(); IS.onMount(); }

const { parseWords, recapLine } = await import(new URL("./p42-words.mjs", import.meta.url).href);
const BNH = new URL("../../bnh-files/Apps/Alongside%20Move/Product/", import.meta.url);
const readDoc = f => fs.readFileSync(new URL(f, BNH), "utf8");
const DOC = readDoc("alongside_in-step-adult_part5_words_26nov2026_v2.md");
const W = parseWords(DOC);
const same = (a, b) => (a || "").replace(/\s+/g, " ").trim() === (b || "").replace(/\s+/g, " ").trim();
const P5 = PROG.EPISODES.filter(e => e.part === 5);

await block("TEST 1", async () => {
  console.log("\nTEST 1 - Part 5's words, word for word");
  ok("1a. the words parse to six episodes, each whole", W.episodes.length === 6 && W.episodes.every(e => e.listen && e.hold && e.question && e.options.length === 3 && e.carry), String(W.episodes.length));
  ok("1b. Part 5 is The world on your phone, with its plain sentence", PROG.getPart(5)?.name === "The world on your phone" && same(PROG.getPart(5).why, W.why));
  ok("1c. six episodes, p5e1 to p5e6, after Part 4", P5.length === 6 && P5.every((e, i) => e.id === `p5e${i + 1}` && e.episode === i + 1) && PROG.nextEpisodeId("p4e6") === "p5e1");
  const diff = [];
  for (const [i, w] of W.episodes.entries()) {
    const e = P5[i] || {};
    for (const [k, a, b] of [["title", e.title, w.title], ["listen", e.listen?.text, w.listen], ["pose", e.hold?.pose, w.hold.pose], ["how", e.hold?.how, w.hold.how],
      ["alt", e.hold?.alt?.text, w.hold.alt?.text], ["alt label", e.hold?.alt?.label, w.hold.alt?.label], ["secs", String(e.hold?.secs), String(w.hold.secs)], ["hold", e.hold?.text, w.hold.text],
      ["question", e.choose?.question, w.question], ["carry", e.carry?.text, w.carry]]) if (!same(a, b)) diff.push(`5.${i + 1} ${k}: "${a}" vs "${b}"`);
    if (!w.options.every((o, j) => same(e.choose?.options?.[j], o))) diff.push(`5.${i + 1} options`);
    if (i < 5 && (!same(e.about, w.about) || !same(e.notCame, w.third))) diff.push(`5.${i + 1} recap fields`);
  }
  ok("1d. every line word for word", diff.length === 0, diff.slice(0, 3).join(" | "));
  ok("1e. the last episode has no recap (nothing follows it)", !PROG.getEpisode("p5e6").about && !PROG.getEpisode("p5e6").recap);
});

await block("TEST 2", async () => {
  console.log("\nTEST 2 - Last time across Parts 4 and 5");
  const r = PROG.getEpisode("p4e6");
  const added = DOC.match(/\*\*Added to Part 4, episode 6[^\n]*about \*(.+?)\*; third answer \*(.+?)\*/);
  ok("2a. Recognition gains its approved recap: about and third answer", !!added && same(r.about, added[1]) && same(r.notCame, added[2]) && r.recap?.audio === "instep-recap-4-6" && !r.recapHeld);
  const bad = [];
  W.episodes.forEach((w, i) => {
    const before = i === 0 ? r : P5[i - 1];
    const want = recapLine({ title: before.title, about: before.about, carry: before.carry.text });
    if (!same(w.recaps[0]?.text, want) || !same(w.recaps[0]?.third, before.notCame)) bad.push(`5.${i + 1}`);
  });
  ok("2b. each Last time in the words is the recap the app builds, with its third answer", bad.length === 0, bad.join(","));
});

await block("TEST 3", async () => {
  console.log("\nTEST 3 - Part 5 is the last part");
  ok("3a. five parts", PROG.PARTS.length === 5);
  ok("3b. That's In Step closes Part 5, with its clip", PROG.PARTS[4].closing.text === "That's In Step. You can go back to any episode in Wellbeing whenever you like." && PROG.PARTS[4].closing.audio === "instep-p4-e6-closing");
  ok("3c. Part 4 closes as Parts 1 to 3, saying the world on your phone is next", PROG.PARTS[3].closing.text === "That's Part 4. Next time, if you'd like, we'll look at the world on your phone." && /^That's Part 3\. Next time, if you'd like, we'll look at /.test(PROG.PARTS[2].closing.text));
  ok("3d. each part ends on its last episode", PROG.endsPart("p4e6") && PROG.endsPart("p5e6") && !PROG.endsPart("p5e5"));
});

await block("TEST 4", async () => {
  console.log("\nTEST 4 - The Part 5 voice script");
  const csv = readDoc("alongside_voice_script_instep-part5_26nov2026_v1.csv").split("\n").slice(2).filter(Boolean);
  const rows = Object.fromEntries(csv.map(l => { const m = l.match(/^([a-z0-9-]+)\.mp3,[^,]*,"(?:[^"]|"")*",\d+,"((?:[^"]|"")*)"$/); return m ? [m[1], m[2].replace(/""/g, '"')] : [l, null]; }));
  const want = [...P5.flatMap(e => [[e.listen.audio, e.listen.text], [e.hold.audio, e.hold.text], [e.carry.audio, e.carry.text], ...(e.recap ? [[e.recap.audio, recapLine({ title: e.title, about: e.about, carry: e.carry.text })]] : [])]),
    ["instep-recap-4-6", recapLine({ title: "Recognition", about: PROG.getEpisode("p4e6").about, carry: PROG.getEpisode("p4e6").carry.text })], [PROG.PARTS[3].closing.audio, PROG.PARTS[3].closing.text]];
  const off = want.filter(([a, t]) => !same(rows[a], t)).map(([a]) => a);
  ok("4a. every Part 5 clip, the new recap and Part 4's new closing, with the words on screen", off.length === 0 && Object.keys(rows).length === want.length, off.slice(0, 4).join(", ") + ` (${Object.keys(rows).length} rows, ${want.length} wanted)`);
  ok("4b. build-audio names them all", want.every(([a]) => ALL_IDS.includes(a)));
});

await block("TEST 5", async () => {
  console.log("\nTEST 5 - On screen");
  const p14 = PROG.EPISODES.filter(e => e.part <= 4).map(e => e.id);
  await seed({ programme: { part: 5, episode: 1, done: p14, lastCarry: "p4e6", lastAnswer: null } });
  mountInStep();
  ok("5a. after Part 4, Part 5's first episode is next", $(".instep-next")?.dataset.ep === "p5e1" && /Part 5: The world on your phone/.test(T($(".instep-next"))), T($(".instep-next")));
  ok("5b. the list shows Part 5 and its plain sentence", T().includes(PROG.PARTS[4].why));
  tap(".instep-next"); await wait(30);
  ok("5c. Last time names Recognition", /in “Recognition”/.test(T()) && T().includes(PROG.getEpisode("p4e6").carry.text), T().slice(0, 240));
  ok("5d. with its own third answer", [...main.querySelectorAll("[data-answer]")].map(b => T(b)).join("|") === "I tried it|I forgot|I didn't get the chance");
  await seed({ programme: { part: 5, episode: 6, done: [...p14, "p5e1", "p5e2", "p5e3", "p5e4", "p5e5"], lastCarry: "p5e5", lastAnswer: "did" } });
  mountInStep(); tap(".instep-next"); await wait(30);
  for (const s of ["#is-next", "#is-skip-hold"]) { tap(s); await wait(20); }
  tap("#is-skip-hold"); await wait(20);
  main.querySelector('input[type="radio"]')?.click(); await wait(20);
  tap("#is-next"); await wait(30);
  const closeAt = T();
  await seed({ programme: { part: 5, episode: 6, done: PROG.EPISODES.map(e => e.id) } });
  mountInStep();
  ok("5f. all done: the list ends with In Step's closing line, not Part 4's", T().includes(PROG.PARTS[4].closing.text) && !T().includes(PROG.PARTS[3].closing.text));
  ok("5g. a part's closing comes on its last episode (endsPart), so Part 5's on its sixth", /endsPart\(e\.id\) \? getPart\(e\.part\)\.closing/.test(fs.readFileSync(new URL("../js/views/in-step.js", import.meta.url), "utf8")));
  ok("5e. the last episode's Carry it, then In Step's closing line", closeAt.includes(PROG.getEpisode("p5e6").carry.text) && closeAt.includes(PROG.PARTS[4].closing.text), closeAt.slice(0, 300));
});

await block("TEST 6", async () => {
  console.log("\nTEST 6 - The standard");
  const text = P5.flatMap(e => [e.listen.text, e.hold.text, e.choose.question, ...e.choose.options, e.carry.text]).join(" ").replace("Often the anger points at a whole group of people.", "");
  ok("6a. no should, score, streak, badge or praise words", !/\b(should|shouldn't|score|scores|streak|streaks|badges?|well done|great job|points)\b/i.test(text));
  ok("6b. nothing cites research", !/\b(19|20)\d\d\b|et al|research|study|studies/i.test(text));
  ok("6c. each Listen is about 40 seconds (80 to 95 words)", P5.every(e => { const n = e.listen.text.split(/\s+/).length; return n >= 80 && n <= 95; }));
});

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
