/**
 * tools/verify-p37-turns.mjs
 * 26 Nov 2026 v1
 *
 * P-37 MORNING-EVENING, S1 (mock-up approved by Graeme 26 Nov: "That mock up
 * was good"; decided 19 Nov: both ways, Take turns the default).
 *
 *   1  Schema v1.141: onHomeDays and onHomeTurns, cleaned on load.
 *   2  Take turns: one morning list each morning, in My exercises' order;
 *      it moves on only after the one before was finished on an earlier
 *      day (a missed morning skips nothing); Home says which is next.
 *   3  Choose the days: on those days only, before the one taking its turn.
 *   4  Any time lists as before; evenings take turns separately.
 *   5  My exercises: Which mornings? with Take turns (default) and Choose
 *      the days, a chip per day, at least one; off Home lets the days go.
 *
 * Red on alongside-v757.
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
const ex = (id, group) => ({ id, name: `Move ${id}`, sets: 1, reps: "8", group });
const KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const at = (dayOffset, hour) => { const d = new Date(); d.setDate(d.getDate() + dayOffset); d.setHours(hour, 0, 0, 0); return d; };
const keyOf = d => KEYS[(d.getDay() + 6) % 7];
const dayStr = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const groups = items => items.map(i => i.group).join(",");

function person() {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", "personal");
  store.set("prescribedExercises", [ex("1", "Hips"), ex("2", "Shoulders"), ex("3", "Back"), ex("4", "Wind down"), ex("5", "Calm"), ex("6", "Kettle")]);
  store.set("myExercisesOnHome", { Hips: "morning", Shoulders: "morning", Back: "morning", "Wind down": "evening", Calm: "evening", Kettle: "any" });
}
const finish = group => store.set("prescribedExercises", (store.get("prescribedExercises") || []).map(e => e.group === group ? { ...e, completedToday: true, completedAt: new Date().toISOString() } : e));

await block("TEST 1", async () => {
  console.log("\nTEST 1 - Schema v1.141");
  person(); store.init();   // as on a phone: loaded, so the defaults are filled
  ok("1a. the defaults hold both, empty", JSON.stringify(store.get("onHomeDays")) === "{}" && JSON.stringify(store.get("onHomeTurns")) === "{}");
  store.set("onHomeDays", { Hips: ["fri", "mon", "mon", "funday"], Kettle: ["mon"], Gone: ["tue"], Back: [] });
  store.set("onHomeTurns", { morning: { group: "Shoulders", doneOn: "2026-11-20" }, evening: { group: "Calm", doneOn: "soon" }, noon: { group: "x" } });
  store.init();
  ok("1b. days kept only for Mornings or Evenings lists, known days, once each, in week order", JSON.stringify(store.get("onHomeDays")) === '{"Hips":["mon","fri"]}', JSON.stringify(store.get("onHomeDays")));
  ok("1c. turns: a real day kept, anything else null or dropped", JSON.stringify(store.get("onHomeTurns")) === '{"morning":{"group":"Shoulders","doneOn":"2026-11-20"},"evening":{"group":"Calm","doneOn":null}}', JSON.stringify(store.get("onHomeTurns")));
});

await block("TEST 2", async () => {
  console.log("\nTEST 2 - take turns, mornings");
  person();
  const today = at(0, 8);
  let h = LO.homeItems(today);
  ok("2a. one morning list (the first), then Any time", groups(h) === "Hips,Kettle", groups(h));
  ok("2b. it says which is next", h[0].next === "Shoulders");
  ok("2b2. Home's line says so: 1 exercise · This morning · Shoulders next", LO.homeItemLine(h[0]) === "1 exercise \u00b7 This morning \u00b7 Shoulders next", LO.homeItemLine?.(h[0]));
  const ph = await import(B + "views/plan-home.js");
  ok("2b3. and the Plan's Home uses that line (one place)", /homeItemLine\(i\)/.test(String(ph.renderPlanHome)) || /homeItemLine/.test((await import("node:fs")).readFileSync(new URL("../js/views/plan-home.js", import.meta.url), "utf8").replace(/\/\/.*$/gm, "")));
  h = LO.homeItems(at(1, 8));
  ok("2c. not finished: the next morning it is the same list (nothing skipped)", groups(h) === "Hips,Kettle");
  finish("Hips"); LO.homeItems(today);
  ok("2d. finished today: noted, and still shown as done today", store.get("onHomeTurns").morning.doneOn === dayStr(new Date()) && LO.homeItems(today)[0].done === true);
  store.set("prescribedExercises", (store.get("prescribedExercises") || []).map(e => ({ ...e, completedToday: false })));
  h = LO.homeItems(at(1, 8));
  ok("2e. the morning after: Shoulders's turn, Back next", groups(h) === "Shoulders,Kettle" && h[0].next === "Back", JSON.stringify(h.map(i => [i.group, i.next])));
  store.set("onHomeTurns", { morning: { group: "Back", doneOn: "2026-01-01" } });
  ok("2f. after the last, round to the first", LO.homeItems(at(0, 8))[0].group === "Hips");
  store.set("myExercisesOnHome", { Hips: "morning", Kettle: "any" });
  ok("2g. one morning list alone: no next", LO.homeItems(at(0, 8))[0].next === null);
});

await block("TEST 3", async () => {
  console.log("\nTEST 3 - choose the days");
  person();
  const today = at(0, 8), tomorrow = at(1, 8);
  LO.setOnHomeDays("Back", [keyOf(today)]);
  let h = LO.homeItems(today);
  ok("3a. on its day: first, then the one taking its turn, then Any time", groups(h) === "Back,Hips,Kettle", groups(h));
  h = LO.homeItems(tomorrow);
  ok("3b. not its day: not shown", !groups(h).includes("Back"), groups(h));
  ok("3c. a list with days doesn't take a turn", LO.turnFor("morning", tomorrow).next === "Shoulders" && !JSON.stringify(LO.homeItems(at(2, 8))).includes('"next":"Back"'));
  LO.setOnHomeDays("Back", null);
  ok("3d. back to taking turns", LO.onHomeDaysFor("Back") === null);
});

await block("TEST 4", async () => {
  console.log("\nTEST 4 - Any time, and evenings");
  person();
  ok("4a. midday: Any time only", groups(LO.homeItems(at(0, 14))) === "Kettle");
  const e = LO.homeItems(at(0, 19));
  ok("4b. evening: its own turn (Wind down, Calm next), then Any time", groups(e) === "Wind down,Kettle" && e[0].next === "Calm", JSON.stringify(e.map(i => [i.group, i.next])));
  ok("4c. mornings' turn is untouched by evenings", !store.get("onHomeTurns").morning || store.get("onHomeTurns").morning.group === "Hips");
});

await block("TEST 5", async () => {
  console.log("\nTEST 5 - My exercises");
  person();
  await router.navigate("prescribed"); await wait(150);
  const fs = () => main.querySelector('[data-px-days="Hips"]');
  ok("5a. a Mornings list asks Which mornings?, Take turns ticked", /Which mornings\?/.test(txt(fs())) && fs()?.querySelector('input[value="turns"]')?.checked === true, txt(fs()).slice(0, 120));
  ok("5b. Any time asks nothing", !main.querySelector('[data-px-days="Kettle"]'));
  ok("5c. an Evenings list says evenings", /Which evenings\?/.test(txt(main.querySelector('[data-px-days="Calm"]'))));
  const r = fs().querySelector('input[value="days"]'); r.checked = true; r.dispatchEvent(new dom.window.Event("change", { bubbles: true })); await wait(50);
  ok("5d. Choose the days: Monday, Wednesday and Friday to start, a chip each, said", JSON.stringify(LO.onHomeDaysFor("Hips")) === '["mon","wed","fri"]' && fs().querySelectorAll("[data-px-day]").length === 7 && /Monday, Wednesday and Friday/.test(txt(main.querySelector("#px-onhome-status"))));
  click(fs().querySelector('[data-px-day="tue"]')); click(fs().querySelector('[data-px-day="mon"]'));
  ok("5e. tapping a day adds or takes it off", JSON.stringify(LO.onHomeDaysFor("Hips")) === '["tue","wed","fri"]', JSON.stringify(LO.onHomeDaysFor("Hips")));
  for (const d of ["tue", "wed"]) click(fs().querySelector(`[data-px-day="${d}"]`));
  click(fs().querySelector('[data-px-day="fri"]'));
  ok("5f. at least one day stays", JSON.stringify(LO.onHomeDaysFor("Hips")) === '["fri"]');
  const sel = main.querySelector('[data-px-onhome="Hips"]'); sel.value = "any"; sel.dispatchEvent(new dom.window.Event("change", { bubbles: true })); await wait(50);
  ok("5g. moved to Any time: its days are let go, and the question goes", LO.onHomeDaysFor("Hips") === null && !main.querySelector('[data-px-days="Hips"]'));
});

console.log(`\n${"=".repeat(60)}\nVERIFY-P37-TURNS: ${passes} passed, ${fails} failed\n${"=".repeat(60)}`);
process.exit(fails ? 1 : 0);
