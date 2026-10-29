import { createRequire as __cr } from "node:module";
/**
 * tools/verify-path-free-unchanged.mjs
 * 28 Oct 2026 v1
 *
 * STAGE PATH, rule A1 (Graeme, 12 and 27 Oct): Free is left exactly as it
 * is. Stage PATH changes the Plan's Home only.
 *
 * Free Home is drawn twice, from the same store, at the same moment: once
 * by today.js as it is now and once by today.js as it was on alongside-v683
 * (commit ded4632, before Session 4), taken from git. Every byte must
 * match, in each of Free's situations (new, a few sessions in, a session
 * to finish, checked in, a scope notice). Its events too: each control on
 * Free Home goes where it went.
 *
 * Needs the repository's git history (a fresh clone has it).
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

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};

const BASE = "ded4632";
const ROOT = new URL("..", import.meta.url).pathname;
let oldSrc = "";
try { oldSrc = execSync(`git -C "${ROOT}" show ${BASE}:js/views/today.js`, { encoding: "utf8", maxBuffer: 1 << 26 }); } catch (e) { /* below */ }
ok("0a. today.js as it was on v683 is in the history", oldSrc.length > 50000, `${oldSrc.length} bytes`);
if (!oldSrc) { console.log(`\nVERIFY-PATH-FREE-UNCHANGED: ${passes} passed, ${fails} failed`); process.exit(1); }
const oldPath = new URL("../js/views/__today_v683_check.js", import.meta.url);
writeFileSync(oldPath, oldSrc);

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const NOW = await import(B + "views/today.js");
let OLD;
try { OLD = await import(oldPath.href); } finally { unlinkSync(oldPath); }
const { router: realRouter } = await import(B + "router.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);

const main = document.getElementById("main-content");
let navs = [];
const fakeRouter = { history: ["somewhere"], navigate: v => navs.push(v), back() {} };
globalThis.window.router = fakeRouter;
realRouter.navigate = fakeRouter.navigate;
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const todayKey = new Date().toISOString().split("T")[0];

const SITUATIONS = {
  "new": s => {},
  "a few sessions in": s => s.set("activityLog", Array.from({ length: 6 }, (_, i) => ({ id: "a" + i, type: "workout", sessionType: "upper", completedAt: new Date(Date.now() - (i + 1) * 864e5).toISOString(), durationMins: 30, completed: true }))),
  "checked in, low mood": s => { s.set("checkinHistory", { [todayKey]: { energy: 6, mood: 3 } }); s.set("lastCheckin", { ...s.get("lastCheckin"), energy: 6, mood: 3, timestamp: new Date().toISOString() }); },
  "moved today": s => s.set("activityLog", [{ id: "t", type: "walk", completedAt: new Date().toISOString(), durationMins: 20, completed: true }]),
  "a scope notice": s => s.set("scopeNoticeDue", true),
  "a flat week": s => s.set("checkinHistory", Object.fromEntries([1, 2, 3, 4].map(n => [new Date(Date.now() - n * 864e5).toISOString().split("T")[0], { energy: 2, mood: 6 }]))),
  "never asked the day's question": s => s.set("dayOpen", { date: null, choice: null }),
};
function fixture(fn) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", "free");
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  fn(store);
  navs = [];
}
const draw = mod => { const snap = JSON.stringify(store.data); main.innerHTML = ""; mod.TodayView(fakeRouter).mount(main); const html = main.innerHTML; store.data = JSON.parse(snap); store.save(); return html; };

console.log("\nTEST 1 - Free Home, byte for byte, as on v683");
for (const [label, fn] of Object.entries(SITUATIONS)) {
  fixture(fn);
  const before = draw(OLD); const after = draw(NOW);
  let at = 0; while (at < before.length && before[at] === after[at]) at++;
  ok(`1. ${label}: the same`, before === after && before.length > 500, `differs at ${at}: "${before.slice(at - 40, at + 60)}" vs "${after.slice(at - 40, at + 60)}"`);
  ok(`1. ${label}: no Plan Home in it, and not sent to the day's question`, !/path-home|path-today/.test(after) && !navs.includes("day-open"), JSON.stringify(navs));
}

console.log("\nTEST 2 - every control on Free Home goes where it went");
for (const [label, fn] of Object.entries(SITUATIONS)) {
  fixture(fn); draw(NOW);
  const n = main.querySelectorAll("button").length;
  const where = mod => [...Array(n).keys()].map(i => { fixture(fn); main.innerHTML = ""; mod.TodayView(fakeRouter).mount(main); navs = []; click(main.querySelectorAll("button")[i]); return navs.join(","); });
  const a = where(OLD), b = where(NOW);
  ok(`2. ${label}: ${n} controls, each to the same place`, JSON.stringify(a) === JSON.stringify(b), `${JSON.stringify(a)} vs ${JSON.stringify(b)}`);
}

console.log(`\n${"=".repeat(60)}\nVERIFY-PATH-FREE-UNCHANGED: ${passes} passed, ${fails} failed\n${"=".repeat(60)}`);
process.exit(fails ? 1 : 0);
