/**
 * tools/verify-my-move-screens.mjs
 * 23 Nov 2026 v1
 *
 * P-39 MAKING MY MOVE, S2 SCREENS (views/my-move.js, data/my-move.js;
 * spec docs/specs/alongside_making-my-move_23nov2026_v1.md section 2).
 * Drives the real view, through the router's own registration.
 *
 *   0  Controls: the router registers 'my-move' without the nav; the
 *      fixture is on the Plan and agreed.
 *   1  Free is sent Home and nothing is written.
 *   2  First open: the intro, its h1 focused; ticks seeded from getting
 *      started's goals, and In Step always; nothing else.
 *   3  What's it for: purposes are buttons with aria-pressed; a tap
 *      saves, keeps focus on it, updates the preview and says it;
 *      Which matters most appears from two and saves.
 *   4  Try it first: aria-expanded, aria-controls, a figure or icon and
 *      the coach line.
 *   5  Good day: three radios in a fieldset; the choice saves.
 *   6  Hard day: up to two; a third is refused and said; Rest stands
 *      alone; holds not offered yet; the safety line is there.
 *   7  That's mine saves when, clears the step and goes Home.
 *   8  Resume: stopping part way and reopening returns to the same step
 *      with the same ticks.
 *   9  Not sure? Keep it simple: one plan a day, the coach on hard days.
 *  10  Every button and input has a name; one h1 per screen.
 *
 * Red on alongside-v723 (no view, no route).
 */
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
globalThis.history = dom.window.history; globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const R = await import(B + "router.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);
const fs = await import("node:fs");
const routerSrc = fs.readFileSync(new URL("../js/router.js", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${String(detail).slice(0, 400)}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const change = el => { if (!el) return; el.checked = !el.checked; el.dispatchEvent(new dom.window.Event("change", { bubbles: true })); };
const $ = s => main.querySelector(s);
const $$ = s => [...main.querySelectorAll(s)];
let navs = [];
const fakeRouter = { history: ["today"], navigate: v => navs.push(v), back() {} };

console.log("\nTEST 0 - controls");
ok("0a. the router registers 'my-move' to views/my-move.js", /'my-move':\s*\{\s*path:\s*'\.\/views\/my-move\.js',\s*fn:\s*'MyMoveView'/.test(routerSrc));
ok("0b. ... without the nav, its tab Home's", /'capture',\s*'my-move',\s*\]\)/.test(routerSrc) && /'my-move':\s*'today'/.test(routerSrc));
let View = null;
try { View = (await import(B + "views/my-move.js")).MyMoveView; } catch (e) { ok("0c. the view loads", false, e.message); }
if (!View) { console.log(`\n${passes} passed, ${fails + 1} failed`); process.exit(1); }

function fixture({ tier = "personal", goals = ["get-stronger", "reduce-stress"], myMove = null } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", tier);
  store.set("goals", goals);
  if (myMove) store.set("myMove", store.cleanMyMove(myMove));
  navs = [];
}
let view = null;
function open() { if (view?.onUnmount) view.onUnmount(); main.innerHTML = ""; view = View(fakeRouter); view.mount(main); }
fixture();
ok("0d. the fixture is on the Plan", store.get("tier") === "personal");

console.log("\nTEST 1 - Free");
fixture({ tier: "free" });
open();
ok("1a. Free is sent Home", navs.includes("today"), JSON.stringify(navs));
ok("1b. nothing is written for Free", JSON.stringify(store.get("myMove").purposes) === "[]" && store.get("myMove").step === null, JSON.stringify(store.get("myMove")));

console.log("\nTEST 2 - first open");
fixture();
open();
ok("2a. the intro: Making my Move", txt($("h1")) === "Making my Move", txt($("h1")));
ok("2b. its h1 has focus", document.activeElement === $("h1"));
ok("2c. Start and Not sure? Keep it simple", !!$('[data-go="for"]') && txt($("[data-simple]")) === "Not sure? Keep it simple");
ok("2d. seeded: Get stronger and Calm my mind from the goals, In Step always, nothing else",
  JSON.stringify(store.get("myMove").purposes) === JSON.stringify(["stronger", "calm", "instep"]), JSON.stringify(store.get("myMove").purposes));
ok("2e. Matters most starts as the first one they said", store.get("myMove").most === "stronger", store.get("myMove").most);
fixture({ goals: [] }); open();
ok("2f. with no goals, only In Step", JSON.stringify(store.get("myMove").purposes) === JSON.stringify(["instep"]), JSON.stringify(store.get("myMove").purposes));

console.log("\nTEST 3 - What's it for");
fixture(); open();
click($('[data-go="for"]'));
ok("3a. Step 1 of 3, What's it for?", txt($("h1")) === "What's it for?" && /Step 1 of 3/.test(txt(main)));
ok("3b. the step is saved", store.get("myMove").step === "for");
const btns = $$("[data-purpose]");
ok("3c. eight purposes, each a button with aria-pressed", btns.length === 8 && btns.every(b => b.tagName === "BUTTON" && b.hasAttribute("aria-pressed")), btns.length);
ok("3d. ticked ones say so", $('[data-purpose="stronger"]').getAttribute("aria-pressed") === "true" && $('[data-purpose="moving"]').getAttribute("aria-pressed") === "false");
click($('[data-purpose="moving"]'));
ok("3e. a tap saves", store.get("myMove").purposes.includes("moving"), JSON.stringify(store.get("myMove").purposes));
ok("3f. ... focus stays on it", document.activeElement === $('[data-purpose="moving"]') && $('[data-purpose="moving"]').getAttribute("aria-pressed") === "true");
ok("3g. ... the preview shows Keep moving", /Keep moving/.test(txt($(".mm-pv"))) && $(".mm-pv").getAttribute("aria-hidden") === "true", txt($(".mm-pv")));
ok("3h. ... and a screen reader is told", /Home will show: Let me choose for you, Get stronger, Keep moving, Calm my mind\./.test(txt($("#mm-said"))), txt($("#mm-said")));
ok("3i. Which matters most right now? in a fieldset with a legend", txt($(".mm-field legend")) === "Which matters most right now?" && $$('input[name="mm-most"]').length === 4);
change($('input[name="mm-most"][value="moving"]'));
ok("3j. choosing it saves", store.get("myMove").most === "moving");
click($('[data-purpose="moving"]'));
ok("3k. unticking the one that matters most moves it on", store.get("myMove").most === "stronger", store.get("myMove").most);
click($('[data-purpose="calm"]')); click($('[data-purpose="stronger"]'));
ok("3l. with one left, the question goes", !$('input[name="mm-most"]'), $$('input[name="mm-most"]').length);
click($('[data-purpose="stronger"]')); click($('[data-purpose="calm"]'));

console.log("\nTEST 4 - Try it first");
const t = $('[data-taste="stronger"]');
ok("4a. a button, closed, naming its panel", t.tagName === "BUTTON" && t.getAttribute("aria-expanded") === "false" && t.getAttribute("aria-controls") === "mm-taste-stronger" && $("#mm-taste-stronger").hidden);
ok("4b. its name says which", /Try it first: Get stronger/.test(txt(t)), txt(t));
click(t);
ok("4c. open: aria-expanded true, the panel shown", $('[data-taste="stronger"]').getAttribute("aria-expanded") === "true" && !$("#mm-taste-stronger").hidden);
ok("4d. the figure and the coach line", !!$("#mm-taste-stronger .xfig") && /You choose how hard/.test(txt($("#mm-taste-stronger"))), txt($("#mm-taste-stronger")));
click($('[data-taste="instep"]'));
ok("4e. without a figure, its icon (decorative) and the line", !!$("#mm-taste-instep .kind-tile[aria-hidden='true']") && /arrived at today tired/.test(txt($("#mm-taste-instep"))));
ok("4f. opening a taste changes no choice", !store.get("myMove").purposes.includes("moving"));

console.log("\nTEST 5 - good day");
click($('[data-go="good"]'));
ok("5a. Step 2 of 3", txt($("h1")) === "On a good day, how much choice?" && store.get("myMove").step === "good");
const radios = $$('input[name="mm-good"]');
ok("5b. three radios in a fieldset, each in its label", radios.length === 3 && radios.every(r => r.closest("label") && r.closest("fieldset")));
ok("5c. the stored choice is checked", $('input[name="mm-good"][value="few"]').checked);
change($('input[name="mm-good"][value="one"]'));
ok("5d. choosing saves", store.get("myMove").goodDay === "one");
ok("5e. the preview shows no doors, only the coach and the Calm my mind row", $$(".mm-pv .mm-chip").map(txt).join("|") === "Calm my mind" && /Let me choose for you/.test(txt($(".mm-pv"))), txt($(".mm-pv")));
ok("5f. ... and matters most went back to a movement purpose when one was ticked", store.get("myMove").most === "stronger", store.get("myMove").most);

console.log("\nTEST 6 - hard day");
click($('[data-go="hard"]'));
ok("6a. Step 3 of 3", txt($("h1")) === "On a hard day, what would help?" && store.get("myMove").step === "hard");
ok("6b. holds not offered until P-38's content", !$('[data-hard="holds"]'));
ok("6c. the default: the coach's gentle pick", $('[data-hard="coach"]').checked);
change($('[data-hard="walk"]'));
ok("6d. a second saves", JSON.stringify(store.get("myMove").hardDay) === JSON.stringify(["coach", "walk"]));
change($('[data-hard="stretch"]'));
ok("6e. a third is refused", JSON.stringify(store.get("myMove").hardDay) === JSON.stringify(["coach", "walk"]) && !$('[data-hard="stretch"]').checked);
ok("6f. ... and said in words", /Untick one first/.test(txt($("#mm-hard-count"))), txt($("#mm-hard-count")));
change($('[data-hard="rest"]'));
ok("6g. Rest stands alone", JSON.stringify(store.get("myMove").hardDay) === JSON.stringify(["rest"]));
ok("6h. the preview says it", /Rest today, and that's fine/.test(txt($(".mm-pv"))));
ok("6i. the safety line", /mark it Bad, that comes first/.test(txt($(".mm-safety"))));

console.log("\nTEST 7 - That's mine");
click($("[data-done]"));
ok("7a. saves when", typeof store.get("myMove").made === "string" && !isNaN(new Date(store.get("myMove").made)));
ok("7b. clears the step", store.get("myMove").step === null);
ok("7c. goes Home", navs.at(-1) === "today", JSON.stringify(navs));
open();
ok("7d. opened again later: straight to What's it for, as made", txt($("h1")) === "What's it for?" && JSON.stringify(store.get("myMove").hardDay) === JSON.stringify(["rest"]));

console.log("\nTEST 8 - resume");
fixture(); open();
click($('[data-go="for"]')); click($('[data-purpose="feel"]')); click($('[data-go="good"]'));
view.onUnmount(); main.innerHTML = "";
store.init();
open();
ok("8a. reopened on the same step", txt($("h1")) === "On a good day, how much choice?", txt($("h1")));
ok("8b. with the same ticks", store.get("myMove").purposes.includes("feel"));

console.log("\nTEST 9 - Not sure? Keep it simple");
fixture(); open();
click($("[data-simple]"));
ok("9a. one plan a day, the coach on hard days, made", store.get("myMove").goodDay === "one" && JSON.stringify(store.get("myMove").hardDay) === JSON.stringify(["coach"]) && !!store.get("myMove").made);
ok("9b. goes Home", navs.at(-1) === "today");

console.log("\nTEST 10 - names");
fixture(); open();
const screens = [];
for (const go of [null, "for", "good", "hard"]) {
  if (go) click($(`[data-go="${go}"]`) || $(`[data-back="${go}"]`));
  if (go === "for") click($('[data-taste="stronger"]'));
  screens.push({ go, h1s: $$("h1").length,
    unnamedButtons: $$("button").filter(b => !txt(b) && !b.getAttribute("aria-label")).length,
    unlabelledInputs: $$("input").filter(i => !i.closest("label") && !i.getAttribute("aria-label")).length });
}
ok("10a. one h1 on every screen", screens.every(s => s.h1s === 1), JSON.stringify(screens));
ok("10b. every button has a name", screens.every(s => s.unnamedButtons === 0), JSON.stringify(screens));
ok("10c. every input has a label", screens.every(s => s.unlabelledInputs === 0), JSON.stringify(screens));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
