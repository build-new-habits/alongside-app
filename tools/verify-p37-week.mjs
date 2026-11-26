/**
 * tools/verify-p37-week.mjs
 * 26 Nov 2026 v1
 *
 * P-37 MORNING-EVENING, S3 (mock-up v1 approved by Graeme 26 Nov, screen 5).
 *
 *   1  weekRoutines(): each day names a list on its chosen day; lists
 *      taking turns say "takes turns" (one alone is named, it is every
 *      morning); both together say so.
 *   2  Every day, as well: Mornings, Evenings and Any time, the chosen days
 *      shown, the ones taking turns named together.
 *   3  Your week: a quiet line on each day's row, read out in its button's
 *      name; Every day, as well with Change these in My exercises; nothing
 *      counted (no streak, no missed); nothing at all with no lists on Home.
 *      A day's button is named by its own words (axe label-content-name-mismatch).
 *
 * Red on alongside-v759.
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
const spoken = el => { const c = el?.cloneNode(true); c?.querySelectorAll('[aria-hidden="true"]').forEach(n => n.remove()); return (c?.textContent || "").replace(/\s+/g, " ").trim(); };
const T = (id, name) => ({ id, name, own: name, mix: [{ focus: "full", level: 2 }], intensity: "steady", mins: 45, place: "gym" });

function person(lists = true) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", "personal");
  store.set("weekShape", { templates: { "t-a": T("t-a", "Upper day") }, days: { mon: "t-a", tue: "rest", wed: "rest", thu: "rest", fri: "t-a", sat: "rest", sun: "rest" }, setAt: "2026-11-11" });
  store.set("prescribedExercises", lists ? [ex("1", "Wake-up hips"), ex("2", "Shoulders"), ex("3", "Morning: hips"), ex("4", "Wind down"), ex("5", "Evening: lower back"), ex("6", "Kettle")] : []);
  store.set("myExercisesOnHome", lists ? { "Wake-up hips": "morning", Shoulders: "morning", "Morning: hips": "morning", "Wind down": "evening", "Evening: lower back": "evening", Kettle: "any" } : {});
  store.set("onHomeDays", lists ? { "Wake-up hips": ["mon", "wed", "fri"] } : {});
}

await block("TEST 1", async () => {
  console.log("\nTEST 1 - Each day's line");
  person();
  const w = LO.weekRoutines();
  ok("1a. Monday: the list on its day, and one taking turns; evenings take turns", w.days.mon === "Mornings: Wake-up hips, and one taking turns · Evenings: takes turns", w.days.mon);
  ok("1b. Tuesday: mornings take turns", w.days.tue === "Mornings: takes turns · Evenings: takes turns", w.days.tue);
  store.set("myExercisesOnHome", { "Wake-up hips": "morning", Shoulders: "morning", Kettle: "any" });
  store.set("onHomeDays", { "Wake-up hips": ["mon"] });
  const v = LO.weekRoutines();
  ok("1c. one list taking turns alone is named (it is every morning)", v.days.tue === "Mornings: Shoulders", v.days.tue);
  ok("1d. Any time lists add nothing to a day", !/Kettle/.test(Object.values(v.days).join()));
  store.set("onHomeDays", { "Wake-up hips": ["mon"], Shoulders: ["fri"] });
  const u = LO.weekRoutines();
  ok("1e. only chosen days: nothing on the others", u.days.tue === "" && u.days.mon === "Mornings: Wake-up hips" && u.days.fri === "Mornings: Shoulders", JSON.stringify(u.days));
});

await block("TEST 2", async () => {
  console.log("\nTEST 2 - Every day, as well");
  person();
  const s = LO.weekRoutines().summary;
  ok("2a. Mornings: the chosen days, then those taking turns", s[0]?.part === "Mornings" && s[0].line === "Wake-up hips (Mon, Wed, Fri) · Shoulders and Morning: hips take turns", JSON.stringify(s[0]));
  ok("2b. Evenings", s[1]?.part === "Evenings" && s[1].line === "Wind down and Evening: lower back take turns", JSON.stringify(s[1]));
  ok("2c. Any time", s[2]?.part === "Any time" && s[2].line === "Kettle", JSON.stringify(s[2]));
  person(false);
  ok("2d. no lists on Home: nothing", LO.weekRoutines().summary.length === 0 && Object.values(LO.weekRoutines().days).every(x => x === ""));
});

await block("TEST 3", async () => {
  console.log("\nTEST 3 - Your week");
  person();
  await router.navigate("your-week"); await wait(250);
  const mon = main.querySelector('[data-day="mon"]');
  ok("3a. Monday's row has the quiet line", /Mornings: Wake-up hips, and one taking turns/.test(txt(mon?.querySelector(".yw-day__routines"))), txt(mon));
  ok("3b. and its button's name says it too, named by its own words (no aria-label)", !mon?.hasAttribute("aria-label") && /^Monday(, today)?: Upper day .*Mornings: Wake-up hips, and one taking turns · Evenings: takes turns \. Change$/.test(spoken(mon)), spoken(mon));
  const card = main.querySelector('[aria-labelledby="yw-every-h"]');
  ok("3c. Every day, as well, as a heading", txt(main.querySelector("#yw-every-h")) === "Every day, as well");
  ok("3d. with Mornings, Evenings and Any time", [...(card?.querySelectorAll("dt") || [])].map(txt).join("|") === "Mornings|Evenings|Any time");
  ok("3e. nothing counted: no streak, no missed, no done routines", !/streak|missed|in a row|\d+ of \d+/i.test(txt(card)) && !card.querySelector(".yw-done"));
  click(card.querySelector(".yw-every__change")); await wait(250);
  ok("3f. Change these in My exercises opens My exercises", router.currentRoute === "prescribed" || !!main.querySelector("[data-px-days], .px-list, #prescribed-h, .prescribed-view") , router.currentRoute);
  person(false);
  await router.navigate("your-week"); await wait(250);
  ok("3g. no lists on Home: no line and no card (as before)", !main.querySelector(".yw-day__routines") && !main.querySelector("#yw-every-h"));
  ok("3h. and the row's name as before, with no routines line", /^Tuesday(, today)?: Rest Rest counts\. \. Change$/.test(spoken(main.querySelector('[data-day="tue"]'))), spoken(main.querySelector('[data-day="tue"]')));
});

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
