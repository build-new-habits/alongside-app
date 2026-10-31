import { createRequire as __cr } from "node:module";
/**
 * tools/verify-path-outside.mjs
 * 31 Oct 2026 v1
 *
 * STAGE PATH Session 8 (P-8 OUTSIDE-LOG; P-12's Plan look for Outside's
 * rooms). Drives the real views: the door route (path.js), Log what I did
 * (activity-log.js), Walk, Run, Cycle and Swim.
 *
 *   1. Outside, after "What are you doing?": a warm-up before and a cool-down
 *      after for each activity, every one already in the library or an
 *      approved routine (data/outside.js), shown as a proposal (figure,
 *      Start) and played in the one player.
 *   2. Log it opens Log what I did with the activity already chosen; it
 *      promises nothing Log what I did does not ask (no "anything sore").
 *   3. On the Plan, Log what I did, Walk, Run, Cycle and Swim take the new
 *      look: is-plan, no emoji, line icons on their choices.
 *   4. Free: the same five rooms byte for byte as on alongside-v687.
 */
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
import { execSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "SVGElement"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
if (!globalThis.CSS) globalThis.CSS = { escape: s => String(s).replace(/[^a-zA-Z0-9_-]/g, c => "\\" + c) };

const B = new URL("../js/", import.meta.url).href;
const ROOT = new URL("..", import.meta.url).pathname;
const { store } = await import(B + "store.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const { PathView } = await import(B + "views/path.js");
const AL = await import(B + "views/activity-log.js");
const { OUTSIDE_PLANS } = await import(B + "data/outside.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");
const { ROUTINES } = await import(B + "data/stretch-routines.js");
const { router: realRouter } = await import(B + "router.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
let navs = [];
const fakeRouter = { history: [], navigate: v => navs.push(v), back() {} };
globalThis.window.router = fakeRouter;
Object.defineProperty(globalThis, "router", { value: fakeRouter, configurable: true, writable: true });
realRouter.navigate = fakeRouter.navigate;
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const EMOJI = /\p{Extended_Pictographic}/u;
function fixture(tier = "personal") {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  fakeRouter.pathStart = null; navs = [];
}
let pv = null;
const path = () => { try { pv?.onUnmount?.(); } catch {} main.innerHTML = ""; pv = PathView(fakeRouter); pv.mount(main); };
const tapRow = v => click(main.querySelector(`.path-row[data-v="${v}"]`));

// ── 1 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 1 - a warm-up before and a cool-down after, for every activity");
const LIB = new Set(EXERCISES.map(e => e.id));
ok("1pc. every warm-up and cool-down is in the library or an approved routine", Object.values(OUTSIDE_PLANS).every(p => LIB.has(p.warm) &&
   (p.cool.practice ? LIB.has(p.cool.practice) : ROUTINES.some(r => r.id === p.cool.routine))));
for (const act of Object.keys(OUTSIDE_PLANS)) {
  fixture(); fakeRouter.pathStart = { door: "moving" }; path(); tapRow("outside"); tapRow(act);
  const rows = [...main.querySelectorAll(".path-row")].map(r => txt(r.querySelector(".path-door__t")));
  ok(`1a. ${act}: Warm-up before, Cool-down after, Log it, each saying what it is`, rows.join() === "Warm-up before,Cool-down after,Log it" &&
     [...main.querySelectorAll(".path-row")].every(r => txt(r.querySelector(".path-door__d"))), rows.join());
}
fixture(); fakeRouter.pathStart = { door: "moving" }; path(); tapRow("outside"); tapRow("run"); tapRow("warm");
ok("1b. the warm-up opens as a proposal: its name, figure or card, Start", main.querySelector(".path-view")?.dataset.step === "prog" && /Warm-Up/i.test(txt(main.querySelector("h1"))) && !!main.querySelector("#path-start"), txt(main.querySelector("h1")));
navs = []; click(main.querySelector("#path-start"));
const g = store.get("generatedSession")?.session;
ok("1c. Start: the one player, the warm-up, for its door", navs.join() === "workout" && g?.exercises?.[0]?.id === OUTSIDE_PLANS.run.warm && g.door === "moving", JSON.stringify({ navs, id: g?.exercises?.[0]?.id, door: g?.door }));
fixture(); fakeRouter.pathStart = { door: "moving" }; path(); tapRow("outside"); tapRow("bike"); tapRow("cool");
const l1 = ROUTINES.find(r => r.id === "l1");
ok("1d. a bike ride's cool-down is the approved routine After a run or ride, every movement", txt(main.querySelector("h1")) === l1.name && main.querySelectorAll(".path-mv").length === l1.steps.length);

// ── 2 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 2 - Log it, with the activity chosen");
fixture(); fakeRouter.pathStart = { door: "stronger" }; path(); tapRow("outside"); tapRow("swim");
ok("2a. Log it promises only what Log what I did asks (no \"anything sore\")", !/sore/i.test(txt(main.querySelector('.path-row[data-v="log"]'))), txt(main.querySelector('.path-row[data-v="log"]')));
navs = []; tapRow("log");
main.innerHTML = AL.render(); AL.onMount();
ok("2b. Log what I did opens with Swim chosen (how long, how it felt)", navs.join() === "activity-log" && txt(main.querySelector(".activity-log-type")) === "Swim" && !!main.querySelector("#activity-save-btn"), txt(main).slice(0, 120));

// ── 3 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 3 - the Plan's look");
const rooms = {
  "js/views/activity-log.js": async mod => { main.innerHTML = mod.render(); try { mod.onMount(); } catch {}
    if (main.querySelector("#activity-change-btn")) { click(main.querySelector("#activity-change-btn")); } },   // the choices, not a form left open
  "js/views/walk-session.js": async mod => { main.innerHTML = mod.render(); try { mod.onMount(); } catch {} },
  "js/views/running-session.js": async mod => { main.innerHTML = mod.render(); try { mod.onMount(); } catch {} },
  "js/views/cycle-session.js": async mod => { main.innerHTML = mod.render(); try { mod.onMount(); } catch {} },
  "js/views/swim-session.js": async mod => { main.innerHTML = mod.render(); try { mod.onMount(); } catch {} },
};
for (const [file, draw] of Object.entries(rooms)) {
  fixture();
  await draw(await import(B + file.slice(3)));
  const root = main.firstElementChild;
  ok(`3. ${file.split("/").pop()}: is-plan, no emoji, line icons on its choices`, root?.classList.contains("is-plan") && !EMOJI.test(txt(main)) && !!main.querySelector(".line-icon, svg"),
     `${root?.className} | ${(txt(main).match(/\p{Extended_Pictographic}/gu) || []).join(" ")}`);
}

// ── 4 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 4 - Free, as it was on v687");
async function asWas(file) {
  let old = "";
  try { old = execSync(`git -C "${ROOT}" show b352933:${file}`, { encoding: "utf8", maxBuffer: 1 << 26 }); } catch {}
  if (!old) return null;
  const tmp = new URL(`../${file.replace(/\.js$/, "")}__v687_check.js`, import.meta.url);
  writeFileSync(tmp, old);
  try { return await import(tmp.href); } finally { unlinkSync(tmp); }
}
for (const [file, draw] of Object.entries(rooms)) {
  const OLD = await asWas(file);
  const NOW = await import(B + file.slice(3));
  fixture("free");
  const snap = JSON.stringify(store.data);
  let a = ""; if (OLD) { store.data = JSON.parse(snap); store.save(); await draw(OLD); a = main.innerHTML; }
  store.data = JSON.parse(snap); store.save(); await draw(NOW); const b = main.innerHTML;
  let at = 0; while (at < a.length && a[at] === b[at]) at++;
  ok(`4. Free ${file.split("/").pop()}: the same, byte for byte`, !!OLD && a === b && a.length > 200, `differs at ${at}: ${a.slice(at - 40, at + 40)} | ${b.slice(at - 40, at + 40)}`);
}

try { pv?.onUnmount?.(); } catch {}
console.log(`\n${"=".repeat(60)}\nVERIFY-PATH-OUTSIDE: ${passes} passed, ${fails} failed\n${"=".repeat(60)}`);
process.exit(fails ? 1 : 0);
