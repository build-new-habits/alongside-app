import { createRequire as __cr } from "node:module";
/**
 * tools/verify-library-shelf.mjs
 * 06 Nov 2026 v4
 *
 * v4 - P-28 S4. A walk, run or bike ride now asks How would you like it?
 *   (Just go, Guide me, Take three with you) before its plan; Just go is
 *   the plan as before, so this walks through it. verify-p28-guide checks
 *   the new step.
 *
 * 05 Nov 2026 v3
 *
 * v3 - P-27 TIDY. 1d: the Library's line says what it holds (its tiles start
 *   sessions too; it said they start only from the doors). 2d reversed with
 *   Graeme's decision (05 Nov, "Remove it"): Get stronger › Gym has no My
 *   programme row; the at-home control is kept.
 *
 * 02 Nov 2026 v2
 *
 * v2 - P-26 ONE-BUILD-PAGE re-point (Graeme, 02 Nov: one Build a session
 *   page on the Plan, replacing the builder's ways in there). 2e: Build my
 *   own opens Build a session; 3b: I know what I want's row is it.
 *
 * 31 Oct 2026 v1
 *
 * P-13 LIBRARY, first session. Graeme, 29 Oct: the Library keeps "Only what
 * doors don't hold"; 31 Oct: "Doors first, then trim", and Mobility &
 * Conditioning "Split into the Stretch door". Drives the real views.
 *
 *   1. On the Plan the Library holds exactly Classes, Practices, Mindful
 *      practice, My exercises, Saved sessions, Your week and Log what I did,
 *      each with a line saying what it is for, and says sessions start from
 *      Home's doors.
 *   2. Doors first: every room the Plan's Library opened on alongside-v690
 *      and no longer lists is reached from a door: the guided run, ride,
 *      walk and swim (Keep moving › Outside); Yoga & Pilates and the
 *      mobility session (Stretch); My programme (Get stronger › Gym); I know
 *      what I want (Build my own); the session types of At home and At the
 *      gym (a part, then Build it for me); Make it up as I go (Today's plan,
 *      Something different today).
 *   3. Mobility & Conditioning is no longer opened on the Plan: not from the
 *      Library, not from I know what I want, not from Home or a door.
 *   4. Free's Library, byte for byte as on alongside-v690.
 */
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
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
const LIB = await import(B + "views/library.js");
const { KnowWhatView } = await import(B + "views/know-what.js");
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
function fixture(tier = "personal") {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("checkinHistory", { [new Date().toISOString().split("T")[0]]: { energy: 6, mood: 6 } });
  fakeRouter.pathStart = null; realRouter.pathStart = null; navs = [];
}
let pv = null;
const path = door => { try { pv?.onUnmount?.(); } catch {} main.innerHTML = ""; fakeRouter.pathStart = { door }; realRouter.pathStart = { door }; pv = PathView(fakeRouter); pv.mount(main); };
const tapRow = v => { click(main.querySelector(`.path-row[data-v="${v}"]`));
  // v-P28: a walk, run or ride asks how first; Just go is the plan as before.
  if (main.querySelector('.path-view[data-step="gway"]')) click(main.querySelector('.path-row[data-v="just"]')); };
const library = () => { main.innerHTML = LIB.render(); try { LIB.onMount(); } catch {} };

// ── 1 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 1 - the Plan's Library: only what no door holds");
fixture(); library();
const tiles = [...main.querySelectorAll(".library-category-card")];
const names = tiles.map(t => txt(t.querySelector(".library-category-label")));
const WANT = ["Mindful practice", "Practices", "My exercises", "Classes", "Saved sessions", "Your week"];
ok("1a. exactly Classes, Practices, Mindful practice, My exercises, Saved sessions and Your week", JSON.stringify([...names].sort()) === JSON.stringify([...WANT].sort()), names.join(", "));
ok("1b. each says what it is for", tiles.every(t => txt(t.querySelector(".library-category-sub")).length > 8));
ok("1c. and Log what I did", txt(main.querySelector("#lib-log-activity-btn")).startsWith("Log what I did"));
// v3 (P-27): sessions start here too (Classes, Saved sessions, My exercises), so it says what it holds.
ok("1d. it says what it holds, and no longer that sessions start only from the doors", /What the doors don.t hold/.test(txt(main.querySelector(".library-purpose"))) && !/Sessions start from Home.s doors/.test(txt(main)));
navs = []; click(tiles.find(t => /Saved sessions/.test(txt(t))));
ok("1e. Saved sessions opens the list", navs.includes("saved-sessions"), JSON.stringify(navs));

// ── 2 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 2 - doors first: every room the Library let go is behind a door");
for (const [act, room] of [["run", "running-session"], ["bike", "cycle-session"], ["walk", "walk-session"], ["swim", "swim-session"]]) {
  fixture(); path("moving"); tapRow("outside"); tapRow(act);
  const r = main.querySelector('.path-row[data-v="guided"]');
  navs = []; click(r);
  ok(`2a. Keep moving › Outside › ${act}: a guided one, saying what it is, opens ${room}`, !!r && !!txt(r.querySelector(".path-door__d")) && navs.join() === room, JSON.stringify(navs));
}
fixture(); path("moving"); tapRow("outside"); tapRow("sport");
ok("2a. control: a sport or match has no guided room (none exists)", !main.querySelector('.path-row[data-v="guided"]'));
fixture(); path("stretch"); navs = []; tapRow("yoga");
ok("2b. Stretch › Yoga & Pilates opens Yoga & Pilates", navs.join() === "yoga-session", JSON.stringify(navs));
fixture(); path("stretch"); navs = []; tapRow("mobility");
ok("2c. Stretch › A mobility session: the coach's mobility plan, for Stretch", navs.join() === "coach-proposal" && store.get("requestedSessionType") === "mobility" && (fakeRouter.planDoor || realRouter.planDoor) === "stretch", `${navs} ${store.get("requestedSessionType")} ${fakeRouter.planDoor}`);
fixture(); path("stronger"); tapRow("gym"); tapRow("whole");
// v3 (P-27, Graeme 05 Nov: "Remove it"): no My programme behind Get stronger › Gym.
ok("2d. Get stronger › Gym: no My programme row (the rest of How would you like it? is there)", !main.querySelector('.path-row[data-v="programme"]') && !!main.querySelector('.path-row[data-v="coach"]') && !!main.querySelector('.path-row[data-v="own"]'));
fixture(); path("stronger"); tapRow("home"); tapRow("whole");
ok("2d. control: at home there is no gym programme row", !main.querySelector('.path-row[data-v="programme"]'));
fixture(); path("stronger"); tapRow("home"); tapRow("upper"); navs = []; tapRow("own");
ok("2e. Build my own opens Build a session", navs.join() === "build-session", JSON.stringify(navs));
fixture(); path("stronger"); tapRow("gym"); tapRow("lower"); tapRow("coach");
ok("2f. the session types of At home and At the gym: a part, then Build it for me", !!main.querySelector("#path-build"), txt(main).slice(0, 80));
const cpSrc = readFileSync(`${ROOT}js/views/coach-proposal.js`, "utf8");
ok("2g. Make it up as I go stays on Today's plan (Something different today)", /data-different="log"/.test(cpSrc) && /Make it up as I go/.test(cpSrc));

// ── 3 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 3 - Mobility & Conditioning is no longer opened on the Plan");
fixture(); library();
ok("3a. not from the Library", !main.querySelector('[data-guided="mobility"]'));
fixture(); main.innerHTML = ""; KnowWhatView(fakeRouter).mount(main);
ok("3b. not from I know what I want", !main.querySelector('[data-kw-route="mobility-conditioning"]') && !!main.querySelector('[data-kw-route="build-session"]'));
const planFiles = ["js/views/path.js", "js/views/plan-home.js", "js/views/plan-finish.js", "js/data/path-context.js"];
ok("3c. not from Home or a door", planFiles.every(f => !readFileSync(`${ROOT}${f}`, "utf8").includes("mobility-conditioning")));
ok("3d. control: Free keeps its own way in (Free Home's Mobility & Conditioning)", /route: 'mobility-conditioning'/.test(readFileSync(`${ROOT}js/views/today.js`, "utf8")));

// ── 4 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 4 - Free's Library, as it was on alongside-v690");
let old = "";
try { old = execSync(`git -C "${ROOT}" show 1a27106:js/views/library.js`, { encoding: "utf8", maxBuffer: 1 << 26 }); } catch {}
const tmp = new URL("../js/views/library__v690_check.js", import.meta.url);
writeFileSync(tmp, old);
let OLD; try { OLD = await import(tmp.href); } finally { unlinkSync(tmp); }
fixture("free"); main.innerHTML = OLD.render(); const a = main.innerHTML;
fixture("free"); main.innerHTML = LIB.render(); const b = main.innerHTML;
let at = 0; while (at < a.length && a[at] === b[at]) at++;
ok("4. Free's Library: the same, byte for byte", !!old && a === b && a.length > 200, `differs at ${at}: ${a.slice(at - 40, at + 40)} | ${b.slice(at - 40, at + 40)}`);

try { pv?.onUnmount?.(); } catch {}
console.log(`\n${"=".repeat(60)}\nVERIFY-LIBRARY-SHELF: ${passes} passed, ${fails} failed\n${"=".repeat(60)}`);
process.exit(fails ? 1 : 0);
