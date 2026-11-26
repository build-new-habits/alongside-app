/**
 * tools/verify-p42-young.mjs
 * 26 Nov 2026 v1
 *
 * P-42 S2. In Step for 14-17: the four young parts (approved by Graeme 26
 * Nov, BNH-Files Product/alongside_in-step-young_part1_words_26nov2026_v2,
 * part2 v2, part3 v3, part4 v2), behind the closed gate, with a 14-15
 * switch in the developer panel.
 *
 *   1  Every line word for word (italics as quotation marks): title, ages,
 *      Listen (and Asking first's 16-17 Listen), Hold still, Choose, Carry
 *      it, the help lines, each recap's about and third answer.
 *   2  Last time at each age: every recap in the words is the one the app
 *      builds from the episode before at that age (Standing up, safely's
 *      two included).
 *   3  Two ages: 23 episodes at 14-15, 26 at 16-17; the three 16-17-only
 *      episodes; numbers in each part by age.
 *   4  The version picks the programme: adult, young-16, young-14; the
 *      store keeps young-14 (Schema v1.143); real people still can't get a
 *      young version (YOUNG_OPEN closed).
 *   5  On screen: the young list and parts; Last time across the ages;
 *      the help line under Carry it; In Step's closing at the very end; no
 *      Free door in a young version; never offered at a finish.
 *   6  14-15 gets every young rule; the 16-17 welcome and health line stay
 *      16-17's.
 *   7  The standard: no should, score or streak words; praise words only
 *      where a choice names them; no failure words; about 40 seconds each.
 *   8  The developer panel switches to 14-15.
 *
 * Red on alongside-v761 (16-17's In Step: Coming soon).
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
const DOCS = ["alongside_in-step-young_part1_words_26nov2026_v2.md", "alongside_in-step-young_part2_words_26nov2026_v2.md", "alongside_in-step-young_part3_words_26nov2026_v3.md", "alongside_in-step-young_part4_words_26nov2026_v2.md"];
const WORDS = DOCS.map(f => parseWords(readDoc(f)));
const same = (a, b) => (a || "").replace(/\s+/g, " ").trim() === (b || "").replace(/\s+/g, " ").trim();
const Y = await import(B + "data/in-step-young.js");
const VER = await import(B + "data/in-step-version.js");
const AV = await import(B + "data/age-version.js");
const AC = await import(B + "data/age-check.js");
const asAge = (g) => { store.set("consent", { ...(store.get("consent") || {}), ageConfirmed: true, ageGroup: g, ageGroupNext: g === "young-16" ? "2027-11" : null }); };

await block("TEST 1", async () => {
  console.log("\nTEST 1 - Every line word for word");
  ok("1a. the words parse: 6, 7, 7 and 6 episodes, each whole", JSON.stringify(WORDS.map(w => w.episodes.length)) === "[6,7,7,6]" && WORDS.every(w => w.why && w.episodes.every(e => e.listen && e.hold && e.question && e.options.length === 3 && e.carry)));
  ok("1b. four parts, named as the themes name them, each with its plain sentence", Y.YOUNG_PARTS.length === 4 && Y.YOUNG_PARTS.every((p, i) => same(p.why, WORDS[i].why)) && Y.YOUNG_PARTS[0].name === "Me, on a good day and a hard one" && Y.YOUNG_PARTS[3].name === "Other people's lives, and my part to play");
  const diff = [];
  WORDS.forEach((w, pi) => w.episodes.forEach((d, i) => {
    const e = Y.YOUNG_EPISODES.find(x => x.id === `y${pi + 1}e${d.n}`) || {};
    const last = pi === 3 && i === w.episodes.length - 1;
    for (const [k, a, b] of [["title", e.title, d.title], ["ages", (e.ages || []).join(), d.ages.join()], ["listen", e.listen?.text, d.listen], ["listen16", e.listen16?.text, d.listen16],
      ["pose", e.hold?.pose, d.hold.pose], ["how", e.hold?.how, d.hold.how], ["alt", e.hold?.alt?.text, d.hold.alt?.text], ["alt label", e.hold?.alt?.label, d.hold.alt?.label],
      ["secs", String(e.hold?.secs), String(d.hold.secs)], ["hold", e.hold?.text, d.hold.text], ["question", e.choose?.question, d.question], ["carry", e.carry?.text, d.carry],
      ["help", e.help?.text, d.help], ["about", last ? "-" : e.about, last ? "-" : d.about], ["third", last ? "-" : e.notCame, last ? "-" : d.third]]) if (!same(a, b)) diff.push(`${pi + 1}.${d.n} ${k}: "${a}" vs "${b}"`);
    if (!d.options.every((o, j) => same(e.choose?.options?.[j], o))) diff.push(`${pi + 1}.${d.n} options`);
  }));
  ok("1c. every line word for word", diff.length === 0, diff.slice(0, 3).join(" | "));
  ok("1d. 26 episodes in all; the last has no recap (nothing follows it)", Y.YOUNG_EPISODES.length === 26 && !Y.YOUNG_EPISODES.at(-1).about && !Y.YOUNG_EPISODES.at(-1).recap);
  ok("1e. help lines on the eleven that touch something heavy", Y.YOUNG_EPISODES.filter(e => e.help).map(e => e.id).join() === "y1e3,y1e5,y2e1,y2e3,y2e5,y2e7,y3e4,y3e5,y3e6,y3e7,y4e3,y4e5", Y.YOUNG_EPISODES.filter(e => e.help).map(e => e.id).join());
  ok("1f. the help lines name Childline (and Report Remove, the National Gambling Helpline where they belong)", Y.YOUNG_EPISODES.filter(e => e.help).every(e => /Childline[^.]*0800 1111/.test(e.help.text)) && /childline\.org\.uk\/remove/.test(Y.YOUNG_EPISODES.find(e => e.id === "y3e4").help.text) && /0808 8020 133/.test(Y.YOUNG_EPISODES.find(e => e.id === "y3e6").help.text));
});

await block("TEST 2", async () => {
  console.log("\nTEST 2 - Last time at each age");
  const bad = [];
  for (const age of ["14", "16"]) {
    const list = Y.youngProgramme(age).episodes;
    list.forEach((e, i) => {
      if (i === 0) return;
      const d = WORDS[e.part - 1].episodes.find(x => x.n === e.n);
      const r = d.recaps.find(x => x.age === age) || d.recaps.find(x => x.age === null);
      const before = list[i - 1];
      if (!r || !same(r.text, recapLine({ title: before.title, about: before.about, carry: before.carry.text })) || !same(r.third, before.notCame)) bad.push(`${age}:${e.id}`);
    });
  }
  ok("2a. every Last time in the words is the one the app builds, at both ages", bad.length === 0, bad.join(","));
  const s7 = WORDS[2].episodes.find(x => x.n === 7);
  ok("2b. Standing up, safely has a recap for each age: True, false … at 14-15, Get rich quick at 16-17", s7.recaps.length === 2 && /in 'True, false or made to look true'/.test(s7.recaps.find(r => r.age === "14").text) && /in 'Get rich quick'/.test(s7.recaps.find(r => r.age === "16").text));
  ok("2c. the first episode has no Last time", WORDS[0].episodes[0].recaps.length === 0);
});

await block("TEST 3", async () => {
  console.log("\nTEST 3 - Two ages");
  const a = Y.youngProgramme("14").episodes, b = Y.youngProgramme("16").episodes;
  ok("3a. 23 episodes at 14-15, 26 at 16-17", a.length === 23 && b.length === 26);
  ok("3b. Images and pressure, The wider internet and Get rich quick are 16-17's only", ["y3e4", "y3e5", "y3e6"].every(id => !a.some(e => e.id === id) && b.some(e => e.id === id)));
  ok("3c. Standing up, safely is Part 3's 4th at 14-15 and its 7th at 16-17", a.find(e => e.id === "y3e7").episode === 4 && b.find(e => e.id === "y3e7").episode === 7);
  ok("3d. Asking first has its own Listen at 16-17", same(b.find(e => e.id === "y2e3").listen.text, WORDS[1].episodes[2].listen16) && same(a.find(e => e.id === "y2e3").listen.text, WORDS[1].episodes[2].listen) && b.find(e => e.id === "y2e3").listen.audio === "young-p2-e3-listen-16");
  ok("3e. each part's episodes are numbered 1 to n, at both ages", [a, b].every(l => [1, 2, 3, 4].every(p => l.filter(e => e.part === p).every((e, i) => e.episode === i + 1))));
});

await block("TEST 4", async () => {
  console.log("\nTEST 4 - The version picks the programme");
  await seed(); asAge("adult");
  ok("4a. adult: the adults' five parts", PROG.parts().length === 5 && PROG.episodes()[0].id === "p1e1");
  asAge("young-16");
  ok("4b. 16-17: the young four parts, 26 episodes", PROG.parts().length === 4 && PROG.episodes().length === 26 && PROG.episodes()[0].id === "y1e1");
  asAge("young-14");
  ok("4c. 14-15: 23 episodes", PROG.episodes().length === 23 && AV.inStepVersion() === "young-14");
  store.init();
  ok("4d. the store keeps young-14 on load, with no move-up month (Schema v1.143)", store.get("consent").ageGroup === "young-14" && store.get("consent").ageGroupNext === null);
  ok("4e. Schema.md documents it", /v1\.143[\s\S]*young-14/.test(fs.readFileSync(new URL("../docs/Schema.md", import.meta.url), "utf8")));
  ok("4f. real people still can't get a young version: YOUNG_OPEN is closed", AC.YOUNG_OPEN["young-16"] === false && AC.YOUNG_OPEN["young-14"] === false);
  const g14 = AC.ageGroupFor(1, new Date().getFullYear() - 15);
  ok("4g. a 15-year-old's answer is the 14-15 group, which stays closed (under)", g14?.group === "young-14" && AC.ageAnswer(1, new Date().getFullYear() - 15) === "under", JSON.stringify(g14) + " " + AC.ageAnswer(1, new Date().getFullYear() - 15));
});

await block("TEST 5", async () => {
  console.log("\nTEST 5 - On screen");
  await seed(); asAge("young-16"); mountInStep();
  ok("5a. 16-17: the young list, Part 1 first", $(".instep-next")?.dataset.ep === "y1e1" && /Part 1: Me, on a good day and a hard one/.test(T($(".instep-next"))) && /Part 4: Other people's lives, and my part to play/.test(T()));
  const p3 = ["y1e1", "y1e2", "y1e3", "y1e4", "y1e5", "y1e6", "y2e1", "y2e2", "y2e3", "y2e4", "y2e5", "y2e6", "y2e7", "y3e1", "y3e2", "y3e3"];
  await seed({ programme: { part: 3, episode: 4, done: p3, lastCarry: "y3e3", lastAnswer: null } }); asAge("young-14"); mountInStep();
  ok("5b. 14-15: after True, false …, Standing up, safely is Episode 4", $(".instep-next")?.dataset.ep === "y3e7" && /Episode 4: Standing up, safely/.test(T($(".instep-next"))), T($(".instep-next")));
  tap(".instep-next"); await wait(30);
  ok("5c. its Last time names True, false or made to look true", /in “True, false or made to look true”/.test(T()) && [...main.querySelectorAll("[data-answer]")].map(b => T(b)).join("|") === "I tried it|I forgot|I didn't see anything shocking", T().slice(0, 200));
  await seed({ programme: { part: 3, episode: 4, done: p3, lastCarry: "y3e3", lastAnswer: null } }); asAge("young-16"); mountInStep();
  ok("5d. 16-17: after True, false …, Images and pressure is Episode 4", $(".instep-next")?.dataset.ep === "y3e4" && /Episode 4: Images and pressure/.test(T($(".instep-next"))));
  tap(".instep-next"); await wait(30); tap("[data-answer]"); await wait(20);
  for (let k = 0; k < 2; k++) { tap("#is-next"); await wait(20); tap("#is-skip-hold"); await wait(20); }
  main.querySelector('input[type="radio"]')?.click(); await wait(10); tap("#is-next"); await wait(30);
  ok("5e0. the header counts the part's episodes at this age (Part 3 · 4 of 7)", /In Step · Part 3 · 4 of 7/.test(T($(".instep-bar"))), T($(".instep-bar")));
  ok("5e. Carry it, then the help line under it", T($(".instep-carry")).includes(Y.YOUNG_EPISODES.find(e => e.id === "y3e4").carry.text) && same(T($("#is-help")), Y.YOUNG_EPISODES.find(e => e.id === "y3e4").help.text), T().slice(0, 300));
  ok("5f. the help line is spoken after Carry it (its clip follows the Carry it's)", /const after = \[e\.help\?\.audio, closing\?\.audio\]\.filter\(Boolean\)/.test(fs.readFileSync(new URL("../js/views/in-step.js", import.meta.url), "utf8")) && PROG.audioIdsForPart(3).includes("young-p3-e4-help"));
  await seed({ tier: "free", programme: { part: 4, episode: 6, done: Y.youngProgramme("16").episodes.slice(0, -1).map(e => e.id), lastCarry: "y4e5", lastAnswer: "did" } }); asAge("young-16"); mountInStep();
  tap(".instep-next"); await wait(30);
  for (let k = 0; k < 2; k++) { tap("#is-next"); await wait(20); tap("#is-skip-hold"); await wait(20); }
  main.querySelector('input[type="radio"]')?.click(); await wait(10); tap("#is-next"); await wait(30);
  ok("5g. the very last episode ends with In Step's closing line", T().includes("That's In Step. You can go back to any episode in Wellbeing whenever you like.") && T().includes(Y.YOUNG_EPISODES.at(-1).carry.text), T().slice(0, 300));
  ok("5h. Free, at 16-17: no door selling the Plan", !$(".upgrade-door"));
  ok("5i. never offered at a finish in a young version", OFF.offerForFinish({ sessionCount: 20 }) === null);
  await seed({ tier: "free", programme: { part: 2, episode: 7, done: p3.slice(0, 12), lastCarry: "y2e6", lastAnswer: "did" } }); asAge("young-14"); mountInStep();
  tap(".instep-next"); await wait(30);
  for (let k = 0; k < 2; k++) { tap("#is-next"); await wait(20); tap("#is-skip-hold"); await wait(20); }
  main.querySelector('input[type="radio"]')?.click(); await wait(10); tap("#is-next"); await wait(30);
  ok("5j. a part with no closing line ends on its Carry it (Part 2's last)", T().includes("back the person having the worst day") && !$(".instep-closing"), T().slice(0, 300));
  await seed({ tier: "free" }); asAge("adult"); mountInStep();
  ok("5k. an adult's In Step is unchanged: the adults' Part 1", $(".instep-next")?.dataset.ep === "p1e1" && /Part 1: You/.test(T($(".instep-next"))));
});

await block("TEST 6", async () => {
  console.log("\nTEST 6 - 14-15 gets every young rule");
  await seed(); asAge("young-14");
  ok("6a. young: no weight, at most two hard days, no messages, not bought here", AV.isYoung() && !AV.weightAllowed() && AV.hardDaysMost() === 2 && !AV.messagesAllowed() && !AV.canBuy());
  ok("6b. the young help lines first (Childline)", /Childline/.test(JSON.stringify(AV.YOUNG_SUPPORT_LINES[0])));
  ok("6c. the 16-17 welcome is not due at 14-15 (its words say 16 and 17)", !AV.isSixteen() && !AV.welcomeDue());
  asAge("young-16"); store.set("consent", { ...store.get("consent"), ageWelcomedAt: null });
  ok("6d. and is still due at 16-17", AV.isSixteen() && AV.welcomeDue());
  const hc = fs.readFileSync(new URL("../js/views/health-consent.js", import.meta.url), "utf8"), th = fs.readFileSync(new URL("../js/views/onboarding/thread.js", import.meta.url), "utf8");
  ok("6e. \"At 16 you can agree\" shows in the 16-17 version only", /isSixteen\(\) \? `\s*<p class="hc-text" id="hc-young">/.test(hc) && /isSixteen\(\) \? `\s*<p class="ob-consent__note" id="ob-consent-health-young">/.test(th));
});

await block("TEST 7", async () => {
  console.log("\nTEST 7 - The standard");
  const all = Y.YOUNG_EPISODES.flatMap(e => [e.listen.text, e.listen16?.text || "", e.hold.text, e.choose.question, e.carry.text, e.help?.text || ""]).join(" ");
  ok("7a. no should, score, streak, badge or points words", !/\b(should|shouldn't|score|scores|streak|streaks|badges?|points)\b/i.test(all));
  const praise = Y.YOUNG_EPISODES.flatMap(e => [e.listen.text, e.hold.text, e.carry.text, ...e.choose.options].filter(t => /well done|great job/i.test(t)));
  ok("7b. well done only where a choice or Listen is about saying it to someone (Their win)", praise.every(t => /^Say well done|say so, out loud|Say well done/.test(t) || /well done/.test(t) && Y.YOUNG_EPISODES.find(e => e.id === "y2e6").choose.options.includes(t)), praise.join(" | "));
  ok("7c. no failure words in a third answer", !Y.YOUNG_EPISODES.some(e => /\b(fail(ed)?|missed|didn't manage)\b/i.test(e.notCame || "")));
  ok("7d. nothing cites research", !/\b(19|20)\d\d\b|et al|research|study|studies/i.test(all));
  ok("7e. each Listen about 40 seconds (75 to 100 words)", Y.YOUNG_EPISODES.every(e => [e.listen.text, e.listen16?.text].filter(Boolean).every(t => { const n = t.split(/\s+/).length; return n >= 75 && n <= 100; })));
});

await block("TEST 8", async () => {
  console.log("\nTEST 8 - The developer panel");
  const st = fs.readFileSync(new URL("../js/views/settings.js", import.meta.url), "utf8");
  ok("8a. a 14–15 switch beside Adult and 16–17", /data-dev-age="young-14">14–15</.test(st) && /data-dev-age="young-16">16–17</.test(st));
  ok("8b. it sets young-14 with no move-up month", /v === 'young-14' \? 'young-14'/.test(st) && /v === 'adult' \|\| v === 'young-14' \? null/.test(st));
});

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
