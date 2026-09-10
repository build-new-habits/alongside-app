/**
 * tools/verify-timetable.mjs
 * 08 Sep 2026 v1
 *
 * TIMETABLE-1. Home reaches the classes, and a class can be started.
 *
 * ── THE FAULT THIS EXISTS FOR ────────────────────────────────────────
 *
 * 🔴 Seven classes were written, reviewed, encoded, gated and PLAYABLE,
 * and nothing in the app could reach them. The Guided class room -- the
 * room named for them -- led to the twelve-week programme instead.
 *
 * Graeme: "When you tell me there's classes in folders but it doesn't
 * get anywhere, that makes me worried... why is the classes not actually
 * there for me to go into?"
 *
 * Every gate on the classes was green throughout, because every one of
 * them asked whether the DATA was right. None asked whether anybody
 * could get to it. That is the same distinction that ran through the
 * whole device pass: a thing can be correct and unreachable, and the
 * gates that check correctness will not notice.
 *
 * So this file walks the route: Home → timetable → a class actually
 * playing. If any link breaks, it goes red.
 *
 * ── WHY A TIMETABLE ──────────────────────────────────────────────────
 *
 * Graeme: "When I go to Nuffield they have a timetable. I get to choose
 * which class I go to because I can see the timetable."
 *
 * ⚫ That is what separates this room from One to one, and test 3
 * asserts it: nothing here is badged "suggested", nothing is reordered
 * by what the coach thinks. A class serving a strand in the person's arc
 * SAYS SO -- naming it is information, reordering would be the coach
 * picking, which is the other room.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="main-content"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = (q) => ({
  matches: /prefers-reduced-motion/.test(q), media: q,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}
});
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [
  ["requestAnimationFrame", (cb) => setTimeout(() => cb(Date.now()), 0)],
  ["cancelAnimationFrame",  (id) => clearTimeout(id)]
]) {
  dom.window[k] = v;
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}

const B = new URL("../js/", import.meta.url).href;
const { store }     = await import(B + "store.js");
const { CLASSES }   = await import(B + "data/classes/index.js");
const { TodayView } = await import(B + "views/today.js");
const L             = await import(B + "views/class-list.js");
const P             = await import(B + "views/class-player.js");

let fails = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) { if (detail) console.log(`        ${detail}`); fails++; }
};

const main = document.getElementById("main-content");
const navs = [];
const routerStub = { navigate: (r) => navs.push(r) };

// class-list.js and class-player.js import `router` from the MODULE,
// not from an injected object -- so a stub passed to TodayView is
// invisible to them. Patching the module is what actually observes
// their navigation.
//
// The first version of this file missed that: 5a said the tap did not
// reach the player while 5b confirmed the class had started, which is
// the shape of a fixture watching the wrong thing rather than a fault.
const realRouter = (await import(B + "router.js")).router;
realRouter.navigate = (r) => navs.push(r);

function seed({ programme = false, injured = false } = {}) {
  localStorage.clear();
  store.init();
  store.set("tier", "personal");
  store.set("name", "Graeme");
  store.set("arc", {
    aimId: "stronger-core",
    strands: ["trunk-strength", "back-resilience", "trusting-body"],
    active: true
  });
  if (injured) {
    store.set("conditions", ["lower-back"]);
    store.set("painScores", { "lower-back": 9 });
  }
  navs.length = 0;
}

function homeRoom() {
  main.innerHTML = "";
  TodayView(routerStub).mount(main);
  return main;
}

// ── 1. HOME REACHES THE CLASSES ─────────────────────────────────────────
console.log("\nTEST 1 - the room named for classes leads to them");

seed();
homeRoom();

const goBtn = main.querySelector('[data-door-id="guided"][data-route="classes"]');
ok("1pc. positive control: Home rendered the Guided class room",
   !!main.querySelector('[data-room-id="guided"]'),
   "no guided room at all - everything below measures nothing");

ok("1a. it offers a way to the classes", !!goBtn,
   "THE FAULT: seven playable classes and the room named for them led " +
   "somewhere else. Every class gate was green throughout, because they " +
   "all asked whether the data was right, not whether anybody could reach it");

if (goBtn) {
  goBtn.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
  ok("1b. and tapping it goes to the timetable",
     navs.includes("classes"), `navigated: ${navs.join(", ") || "nowhere"}`);
}

// Classes do not depend on a programme. This branch used to say
// "Nothing chosen yet" and offer only the programme picker.
ok("1c. and it does so WITHOUT a twelve-week shape chosen",
   !!goBtn,
   "a class no more depends on a programme than a yoga class at a gym " +
   "depends on having signed up for a course");

// ── 2. THE TIMETABLE SHOWS THE CLASSES ──────────────────────────────────
console.log("\nTEST 2 - every class is on the board");

seed();
main.innerHTML = L.render();
L.onMount();

ok("2pc. positive control: the timetable rendered rows",
   main.querySelectorAll(".class-list__row").length > 0,
   "nothing on the board");

ok("2a. every class is listed",
   main.querySelectorAll(".class-list__row").length === CLASSES.length,
   `${main.querySelectorAll(".class-list__row").length} rows for ${CLASSES.length} classes`);

ok("2b. each can be started",
   main.querySelectorAll("[data-start]").length >= CLASSES.length,
   "a class on the board with no way into it");

ok("2c. and its length is on the card before you commit",
   [...main.querySelectorAll(".class-list__facts")]
     .every(p => /about \d+ minute/.test(p.textContent)),
   "somebody choosing a class cannot see how long it is");

// ── 3. IT IS A TIMETABLE, NOT A RECOMMENDATION ──────────────────────────
console.log("\nTEST 3 - nothing here picks for the person");

// The line between this room and One to one. A coach picking is the
// other room; this is a wall with the classes on it.
const listText = (main.textContent || "").toLowerCase();
ok("3a. no class is badged as suggested",
   !/suggested|recommended|best for you|we think/.test(listText),
   "a badge here makes this One to one wearing a timetable's clothes");

ok("3b. the order is the order they were written",
   [...main.querySelectorAll(".class-list__name")].map(h => h.textContent.trim())
     .join("|") === CLASSES.map(c => c.title).join("|"),
   "the board has been sorted by something, which is a recommendation " +
   "without the word");

// The arc is NAMED, and that is all it does.
ok("3c. but a class in the person's arc says so",
   /part of your arc/i.test(main.textContent),
   "the arc is what makes this better than a class at a gym that knows " +
   "nothing about you — if it is never mentioned, nothing distinguishes them");

// ── 4. SAFETY WITHHOLDS, AND SAYS WHY ───────────────────────────────────
console.log("\nTEST 4 - a declared severe zone withholds classes rather than editing them");

seed({ injured: true });
main.innerHTML = L.render();
L.onMount();

const startable = main.querySelectorAll("[data-start]").length;
const withheld  = main.querySelectorAll(".class-list__row--held").length;

ok("4pc. positive control: some classes are still offered",
   startable > 0, "everything withheld, which means the filter is not discriminating");
ok("4a. and some are withheld",
   withheld > 0,
   "a severe lower back withheld nothing - the safety filter is not running");

ok("4b. the withheld ones are NAMED, not hidden",
   [...main.querySelectorAll(".class-list__row--held .class-list__name")].length === withheld,
   "a class that vanishes leaves somebody wondering whether it exists");

ok("4c. and each says what is in it",
   [...main.querySelectorAll(".class-list__why")]
     .every(p => /in it, and you/i.test(p.textContent)),
   "withheld without a reason is the app deciding silently");

// 🔴 No duplicate movement names. Steady Round uses a glute bridge in
// both rounds, and naming it twice reads as a bug in the app rather than
// a fact about the class.
ok("4d. and names each movement once",
   [...main.querySelectorAll(".class-list__why")].every(p => {
     const names = (p.textContent.match(/Has (.+?) in it/s) || [, ""])[1]
       .split(",").map(x => x.trim()).filter(Boolean);
     return new Set(names).size === names.length;
   }),
   "a movement named twice in one reason");

// ── 5. THE WHOLE ROUTE, END TO END ──────────────────────────────────────
console.log("\nTEST 5 - tapping a class actually starts it");

seed();
main.innerHTML = L.render();
L.onMount();
navs.length = 0;

const first = main.querySelector("[data-start]");
ok("5pc. positive control: there is a class to start", !!first);

if (first) {
  const wanted = first.dataset.start;
  first.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

  ok("5a. it goes to the player",
     navs.includes("class-player"), `navigated: ${navs.join(", ") || "nowhere"}`);

  const st = store.get("activeClass") || {};
  ok("5b. and the class it started is the one that was tapped",
     st.id === wanted, `tapped ${wanted}, started ${st.id}`);

  // The player, rendered, on the real state the timetable left behind.
  main.innerHTML = P.render();
  ok("5c. the player opens on that class",
     (main.querySelector("h1") || {}).textContent === CLASSES.find(c => c.id === wanted).title,
     `player shows "${(main.querySelector("h1") || {}).textContent}"`);
  ok("5d. on its first section",
     !!main.querySelector("h2") && st.sectionIndex === 0 && st.beatIndex === 0,
     "started part-way through");
  ok("5e. and says it can be paused",
     /pause/i.test(main.textContent),
     "the slack that used to be padded onto the stated length now lives in " +
     "a pause control — if it is not there, the honest number has nothing " +
     "behind it");
}

// ── 6. THE SHORTER VERSION IS OFFERED ───────────────────────────────────
console.log("\nTEST 6 - the lighter variant is a choice on the board");

seed();
main.innerHTML = L.render();
L.onMount();

ok("6a. every class with a lighter variant offers it",
   main.querySelectorAll('[data-lighter="1"]').length ===
     CLASSES.filter(c => c.lighter).length,
   "a lighter variant nobody can pick is a lighter variant nobody has");

const lighterBtn = main.querySelector('[data-lighter="1"]');
if (lighterBtn) {
  navs.length = 0;
  lighterBtn.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
  ok("6b. and choosing it starts the lighter one",
     (store.get("activeClass") || {}).lighter === true,
     "the shorter button started the full class");
}

// ── 7. IT CAN BE READ ───────────────────────────────────────────────────
console.log("\nTEST 7 - the board can be navigated by heading");

seed();
main.innerHTML = L.render();
const heads = [...main.querySelectorAll("h1,h2,h3,h4")].map(h => Number(h.tagName[1]));
ok("7a. exactly one h1", heads.filter(l => l === 1).length === 1, `${heads.filter(l => l === 1).length}`);
ok("7b. every class is a heading",
   main.querySelectorAll(".class-list__name").length === CLASSES.length,
   "classes are not headings, so the board cannot be skimmed");
ok("7c. no level is skipped",
   heads.every((l, i) => i === 0 || l <= heads[i - 1] + 1),
   `outline: ${heads.map(l => "h" + l).join(" > ")}`);
ok("7d. and each start button names its class",
   [...main.querySelectorAll("[data-start]")]
     .every(b => /^Start /.test(b.getAttribute("aria-label") || "")),
   'seven rows of "Start" are seven identical announcements');

console.log(fails === 0
  ? "\nTIMETABLE-1: all assertions pass\n"
  : `\nTIMETABLE-1: ${fails} FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
