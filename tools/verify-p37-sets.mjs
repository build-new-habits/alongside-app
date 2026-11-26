/**
 * tools/verify-p37-sets.mjs
 * 26 Nov 2026 v1
 *
 * P-37 MORNING-EVENING, S2 (mock-up approved by Graeme 26 Nov: "That mock
 * up was good"; decided 19 Nov: a new set each time, with Keep this).
 *
 *   1  Schema v1.142: daySetChoices, cleaned on load.
 *   2  A morning set: opens gently, small to bigger, ends raising the heart
 *      a little; the minutes add up; the area is worked; new each time.
 *   3  An evening set: tense and let go, slow and flowing (always a tai chi
 *      or qigong move), still with natural breathing; nothing brisk; no
 *      claim about sleep.
 *   4  Today's sore areas and Not agains are never in a set.
 *   5  Home: A fresh morning set before midday, A fresh evening set from
 *      6pm, under Little and often; not on a hard day.
 *   6  The screen: the two choices (remembered), figures and Swap, Keep this
 *      (a Mornings list taking turns), A different one, focus and status.
 *   7  The evening's parts named; Start plays it with no countdown.
 *
 * Red on alongside-v758.
 */
import { agreed } from "./agreed.mjs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div><nav id="bottom-nav"></nav></div><div id="sr-announcer"></div>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.history = dom.window.history; globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s).replace(/"/g, '\\"') };
globalThis.fetch = async () => ({ ok: false });

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
globalThis.window.router = router;
Object.defineProperty(globalThis, "router", { value: router, configurable: true, writable: true });

const LO = await import(B + "data/little-and-often.js");
const DS = await import(B + "data/day-sets.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");
const { PATH_MOVEMENTS } = await import(B + "data/exercises/path_movements.js");
const BY = new Map([...EXERCISES, ...PATH_MOVEMENTS].map(e => [e.id, e]));
const fs = await import("node:fs");
const read = f => fs.readFileSync(new URL("../" + f, import.meta.url), "utf8");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${String(detail).slice(0, 300)}`); }
};
async function block(name, fn) { try { await fn(); } catch (e) { ok(`${name}: ran without throwing`, false, e.stack?.split("\n").slice(0, 3).join(" | ")); } }
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const change = el => { el.checked = true; el.dispatchEvent(new dom.window.Event("change", { bubbles: true })); };
const seeded = seed => () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
const realHours = Date.prototype.getHours;
const atHour = h => { Date.prototype.getHours = function () { return h; }; };
const clock = () => { Date.prototype.getHours = realHours; };

function person({ sore = null } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", "personal");
  store.set("prescribedExercises", []); store.set("myExercisesOnHome", {});
  if (sore) store.set("conditionPainScores", sore);
}
const AREAS = ["hips", "lower-back", "shoulders", "all"], MINS = [5, 10, 15];
const many = (part, fn) => { for (const area of AREAS) for (const mins of MINS) for (let k = 1; k <= 12; k++) fn(DS.daySet({ part, area, mins, rng: seeded(k * 7 + mins) }), area, mins); };

await block("TEST 1", async () => {
  console.log("\nTEST 1 - Schema v1.142: daySetChoices");
  person(); store.init();
  ok("1a. the default is empty", JSON.stringify(store.get("daySetChoices")) === "{}");
  store.set("daySetChoices", { morning: { area: "hips", mins: 15 }, evening: { area: "knees", mins: 15 }, late: { area: "x", mins: 7 }, noon: { area: "hips" } });
  store.init();
  ok("1b. known kept, an unknown area all, anything else dropped", JSON.stringify(store.get("daySetChoices")) === '{"morning":{"area":"hips","mins":15},"evening":{"area":"all","mins":15}}', JSON.stringify(store.get("daySetChoices")));
  ok("1c. Schema.md documents it, and its live store version", /v1\.142[\s\S]*daySetChoices/.test(read("docs/Schema.md")) && /confirmed live version: \*\*v139/.test(read("docs/Schema.md")));
});

await block("TEST 2", async () => {
  console.log("\nTEST 2 - A morning set: gentle, then a little bigger, ending with the heart up a little");
  person();
  let all = true, opener = true, order = true, finish = true, total = true, noHeld = true, area = true, wakeOnly = true;
  many("morning", (s, a, m) => {
    if (!s) { all = false; return; }
    const es = s.steps.map(x => BY.get(x.id));
    if ((es[0].energyRequired || 1) > 2) opener = false;
    const mid = es.slice(1, -1).map(e => e.energyRequired || 1);
    for (let i = 1; i < mid.length; i++) if (mid[i] < mid[i - 1]) order = false;
    if (!["chair-supported-march", "seated-marching-cardio", "gm-reach-and-rise", "qg-tapping"].includes(s.steps.at(-1).id)) finish = false;
    if (Math.abs(s.steps.reduce((t, x) => t + x.mins, 0) - m) > 0.01) total = false;
    if (es.some(e => /box-breathing|four-seven-eight|corpse/.test(e.id))) noHeld = false;
    if (es.slice(0, -1).some(e => !(e.feelings || []).includes("wake"))) wakeOnly = false;
    if (a !== "all" && !es.some(e => (e.affectsAreas || []).some(t => ({ hips: ["hip", "hip-flexor", "glutes", "adductors"], "lower-back": ["lower-back", "spine"], shoulders: ["shoulder", "upper-back", "thoracic"] })[a].includes(t)))) area = false;
  });
  ok("2a. every area and length makes a set (144 tries)", all);
  ok("2b. it opens gently (energy 2 at most)", opener);
  ok("2c. small to bigger in between", order);
  ok("2d. the last move raises the heart a little (a march, reach and rise, or tapping)", finish);
  ok("2e. the minutes add up to the length chosen", total);
  ok("2f. from Move to feel better's wake-up moves, never a still or held-breath one", noHeld && wakeOnly);
  ok("2g. the area chosen is worked", area);
  const a = DS.daySet({ part: "morning", area: "hips", mins: 10, rng: seeded(1) }), b = DS.daySet({ part: "morning", area: "hips", mins: 10, rng: seeded(5) });
  ok("2h. a new set each time", a.steps.map(x => x.id).join() !== b.steps.map(x => x.id).join());
});

await block("TEST 3", async () => {
  console.log("\nTEST 3 - An evening set: tense and let go, slow and flowing, still");
  person();
  let all = true, three = true, form = true, held = true, still = true, energy = true, notSleep = true;
  many("evening", (s) => {
    if (!s) { all = false; return; }
    const parts = s.steps.filter(x => x.part).map(x => x.part).join();
    if (parts !== "tense,flow,still" || s.steps[0].id !== "progressive-muscle-relaxation" || s.steps.at(-1).part !== "still") three = false;
    const flow = s.steps.slice(1, -1).map(x => BY.get(x.id));
    if (!flow.some(e => e.style === "taichi" || e.style === "qigong")) form = false;
    if (s.steps.some(x => /box-breathing|four-seven-eight|coherent|physiological-sigh|energising|alternate-nostril/.test(x.id))) held = false;
    if (s.steps.at(-1).note !== "natural breathing") still = false;
    if (flow.some(e => (e.energyRequired || 1) > 2 || ["qg-heel-drops", "qg-tapping"].includes(e.id))) energy = false;
  });
  ok("3a. every area and length makes a set", all);
  ok("3b. always three parts, in order: progressive muscle relaxation first, still last", three);
  ok("3c. slow and flowing always has a tai chi or qigong move", form);
  ok("3d. never a held or counted breath", held && still);
  ok("3e. nothing brisk in the evening (energy 2 at most; no heel drops or tapping)", energy);
  for (const w of [DS.WORDS.evening.title, DS.WORDS.evening.line, DS.WORDS.evening.homeSub, DS.WORDS.evening.where]) if (/sleep|insomnia|treat|cure|heal/i.test(w)) notSleep = false;
  ok("3f. no claim about sleep or treatment in its words (MHRA scope)", notSleep);
});

await block("TEST 4", async () => {
  console.log("\nTEST 4 - Sore areas and Not again");
  person({ sore: { "lower-back": 6 } });
  const { soreToday } = await import(B + "data/path-context.js");
  const sore = soreToday().map(x => x.id);
  ok("4a. (set-up) today's check-in has a sore lower back", sore.length > 0, JSON.stringify(sore));
  const { filterByConditions } = await import(B + "data/exercises/index.js");
  let safe = true;
  for (const part of ["morning", "evening"]) many(part, s => { if (s && filterByConditions(s.steps.map(x => BY.get(x.id)), sore).safe.length !== s.steps.length) safe = false; });
  ok("4b. a sore area's moves are never in a set", safe);
  person();
  let never = true;
  many("morning", () => {});
  for (let k = 0; k < 20; k++) { const s = DS.daySet({ part: "morning", area: "lower-back", mins: 15, never: new Set(["yoga-cat-cow-flow", "chair-supported-march"]), rng: seeded(k) }); if (s && s.steps.some(x => ["yoga-cat-cow-flow", "chair-supported-march"].includes(x.id))) never = false; }
  ok("4c. a Not again never comes back", never);
});

await block("TEST 5", async () => {
  console.log("\nTEST 5 - Home: A fresh morning set, A fresh evening set");
  person();
  atHour(8); await router.navigate("today"); await wait(200);
  let b = main.querySelector('[data-action="day-set"]');
  ok("5a. before midday, even with no lists on Home: A fresh morning set", b && /A fresh morning set/.test(txt(b)) && /to wake you up/.test(txt(b)), txt(main.querySelector(".path-lao")));
  ok("5b. under Little and often's heading", !!main.querySelector("#path-lao-h") && main.querySelector(".path-lao")?.contains(b));
  ok("5c. no All of My exercises link when there are no lists", !main.querySelector('[data-action="lao-all"]'));
  atHour(14); await router.navigate("today"); await wait(200);
  ok("5d. in the afternoon: no fresh set", !main.querySelector('[data-action="day-set"]'));
  atHour(19); await router.navigate("today"); await wait(200);
  b = main.querySelector('[data-action="day-set"]');
  ok("5e. from 6pm: A fresh evening set", b && /A fresh evening set/.test(txt(b)));
  ok("5f. not on a hard day (plan-home passes the hard day)", /littleAndOften\(mm\.day === "hard"\)/.test(read("js/views/plan-home.js")) && /const part = hard \? null : partOfDay\(\)/.test(read("js/views/plan-home.js")));
  click(b); await wait(250);
  ok("5g. it opens An evening set", /An evening set/.test(txt(main.querySelector(".path-h1"))), txt(main).slice(0, 200));
  clock();
});

await block("TEST 6", async () => {
  console.log("\nTEST 6 - The set's screen: choices remembered, Swap, Keep this, A different one");
  person();
  router.pathStart = { door: "feel", dayset: "morning" }; await router.navigate("path"); await wait(200);
  ok("6a. A morning set, with its line", /A morning set/.test(txt(main.querySelector(".path-h1"))) && /To wake you up: gentle, then a little bigger\./.test(txt(main)));
  const legends = [...main.querySelectorAll("legend")].map(txt);
  ok("6b. Where are you stiff? and How long?", legends.includes("Where are you stiff?") && legends.includes("How long?"), legends.join("|"));
  ok("6c. all over and 10 minutes to start", main.querySelector('input[name="dsarea"][value="all"]').checked && main.querySelector('input[name="dsmins"][value="10"]').checked);
  ok("6d. each move has its figure and a Swap", main.querySelectorAll(".path-mv").length >= 3 && main.querySelectorAll(".path-mv [data-swap]").length === main.querySelectorAll(".path-mv").length);
  ok("6e. Start, Keep this and A different one; no Make it mine", !!main.querySelector("#path-start") && !!main.querySelector("#path-ds-keep") && !!main.querySelector("#path-ds-again") && !main.querySelector("#path-mine"));
  ok("6f. a ‹ Back", !!main.querySelector("#path-back"));
  ok("6f2. no \"What I've adjusted\" (that list is for the coach's sessions; it said A balanced first session)", !/What I\u2019ve adjusted|balanced first session/.test(txt(main)));
  change(main.querySelector('input[name="dsarea"][value="hips"]')); await wait(60);
  ok("6g. choosing Hips remembers it and keeps focus there", JSON.stringify(store.get("daySetChoices").morning) === '{"area":"hips","mins":10}' && document.activeElement === main.querySelector('input[name="dsarea"][value="hips"]'));
  ok("6h. and says so", /A new set for your hips, 10 minutes\./.test(txt(main.querySelector("#path-live"))));
  change(main.querySelector('input[name="dsmins"][value="5"]')); await wait(60);
  ok("6i. 5 min: a set of about five minutes", /About 5 minutes/.test(txt(main)));
  const before = [...main.querySelectorAll(".path-mv__nm")].map(txt).join();
  let differed = false;
  for (let k = 0; k < 6 && !differed; k++) { click(main.querySelector("#path-ds-again")); await wait(50); differed = [...main.querySelectorAll(".path-mv__nm")].map(txt).join() !== before; }
  ok("6j. A different one makes another", differed);
  ok("6k. focus stays on A different one", document.activeElement === main.querySelector("#path-ds-again"));
  await router.navigate("today"); await wait(100);
  router.pathStart = { door: "feel", dayset: "morning" }; await router.navigate("path"); await wait(200);
  ok("6l. next time it starts with Hips and 5 minutes", main.querySelector('input[name="dsarea"][value="hips"]').checked && main.querySelector('input[name="dsmins"][value="5"]').checked);
  const names = [...main.querySelectorAll(".path-mv__nm")].map(t => txt(t).replace(/^\d+\.\s*/, ""));
  click(main.querySelector("#path-ds-keep")); await wait(60);
  const list = (store.get("prescribedExercises") || []).filter(e => e.group === "Morning: hips");
  ok("6m. Keep this: a list Morning: hips in My exercises, the set's moves in order", list.length === names.length && list.map(e => e.name).join() === names.join(), list.map(e => e.name).join() + " / " + names.join());
  ok("6n. On Home for Mornings, taking turns (no days)", store.get("myExercisesOnHome")["Morning: hips"] === "morning" && !(store.get("onHomeDays") || {})["Morning: hips"]);
  ok("6o. says where it went, and focus moves to that line", /Kept in My exercises as Morning: hips/.test(txt(main)) && document.activeElement?.id === "path-ds-kept");
  click(main.querySelector("#path-ds-again")); await wait(50); click(main.querySelector("#path-ds-keep")); await wait(50);
  ok("6p. keeping another: its own name (Morning: hips (2))", (store.get("prescribedExercises") || []).some(e => e.group === "Morning: hips (2)"));
  atHour(8);
  ok("6q. Home's Little and often then shows it this morning", LO.homeItems().some(i => i.group === "Morning: hips"));
  clock();
});

await block("TEST 7", async () => {
  console.log("\nTEST 7 - An evening set's screen and player");
  person();
  router.pathStart = { door: "feel", dayset: "evening" }; await router.navigate("path"); await wait(200);
  const legends = [...main.querySelectorAll("legend")].map(txt);
  ok("7a. An evening set, Where do you hold it?", /An evening set/.test(txt(main.querySelector(".path-h1"))) && legends.includes("Where do you hold it?"));
  const parts = [...main.querySelectorAll(".path-mv__part")].map(txt);
  ok("7b. the three parts named on the moves", parts.join("|") === "Tense and let go|Slow and flowing|Still", parts.join("|"));
  ok("7c. the slow line (move slowly, ease off) is shown", /Move slowly and only as far as is comfortable/.test(txt(main)));
  click(main.querySelector("#path-start")); await wait(250);
  const g = store.get("generatedSession");
  ok("7d. Start plays it with no countdown (session.noClock)", g?.session?.noClock === true && g.session.dayset === "evening");
  ok("7e. the player reads it: no countdown", /generatedSession"\)\?\.session\?\.noClock === true/.test(read("js/views/workout.js")));
  person();
  router.pathStart = { door: "feel", dayset: "morning" }; await router.navigate("path"); await wait(200);
  click(main.querySelector("#path-start")); await wait(250);
  ok("7f. a morning set keeps its timer", store.get("generatedSession")?.session?.noClock !== true);
});

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
