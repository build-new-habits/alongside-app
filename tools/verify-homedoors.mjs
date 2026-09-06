/**
 * tools/verify-homedoors.mjs
 * 06 Sep 2026 v1
 *
 * HOME-DOORS and ESCAPE-Z.
 *
 * LOBBY-1c (04 Sep, 21:31) deleted the session door grid from Home. On
 * Plan it left a single "Start today" button routing to coach-proposal.
 * The commit message argued this "is not a layout change". It was: the
 * tiles' only other home was a row underneath coach-proposal's preview
 * panel, which is position:fixed, inset:0, z-index:9999, auto-opens on
 * mount, and cannot be dismissed to reveal what is beneath it.
 *
 * TWO CONSEQUENCES, both found on device by Graeme and neither by any
 * gate:
 *
 *   1. STRETCH BECAME UNREACHABLE ON PLAN. coach-proposal builds through
 *      workoutGenerator.js, whose entire type vocabulary is one line --
 *      { strength: "Strength Focus", mobility: "Mobility & Recovery",
 *      cardio: "Cardio Boost" }. session-builder.js has EIGHT types and
 *      Stretch is one of them. The Mobility & Conditioning door was the
 *      only route to that engine, and it left Home.
 *
 *   2. THE ESCAPE HATCH WAS UNDER THE PANEL. #hidden-nav-home-btn was
 *      z-index 100 against the panel's 9999 -- invisible and untappable
 *      on precisely the screen with no other way out.
 *
 * This gate is DRIVEN, not read. Home is mounted under jsdom on both
 * tiers and the rendered nodes are counted, because the source-reading
 * assertions in verify-lobby1.mjs passed throughout the four days this
 * was broken -- they were asserting the relocation, correctly, against a
 * decision that turned out to be wrong on a handset.
 *
 * FIXTURE REACH is asserted before anything else. isPremium() reads
 * tier === "personal"; a fixture that fails to set it lands on the free
 * branch, which had the doors all along, and every assertion below would
 * pass while proving nothing about the tier that lost them.
 */

import { createRequire as __cr } from "node:module";
import fs from "node:fs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="c"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, "navigator",
  { value: dom.window.navigator, configurable: true, writable: true });
Object.defineProperty(globalThis, "localStorage",
  { value: dom.window.localStorage, configurable: true, writable: true });

const B = new URL("../js/", import.meta.url).href;
const { store }      = await import(B + "store.js");
const { isPremium }  = await import(B + "auth.js");
const { TodayView }  = await import(B + "views/today.js");

let fails = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) { if (detail) console.log(`        ${detail}`); fails++; }
};

function home(tier) {
  localStorage.clear();
  store.init();
  store.set("tier", tier);
  const c = document.getElementById("c");
  c.innerHTML = "";
  const navs = [];
  TodayView({ navigate: v => navs.push(v) }).mount(c);
  return { c, navs, text: c.textContent.replace(/\s+/g, " ") };
}

// ── 0. FIXTURE REACH ────────────────────────────────────────────────────
// Nine recorded instances in this project of a fixture not reaching the
// branch it names. This one is cheap to check and fatal to miss.
console.log("\nTEST 0 - the fixtures reach the branches they name");

localStorage.clear(); store.init(); store.set("tier", "personal");
ok("0a. the Plan fixture is actually on Plan", isPremium() === true,
   `isPremium() returned ${isPremium()} - every Plan assertion below would ` +
   `have been measuring the free screen`);

localStorage.clear(); store.init(); store.set("tier", "free");
ok("0b. the free fixture is actually on free", isPremium() === false,
   `isPremium() returned ${isPremium()}`);

// ── 1. THE DOORS ARE BACK ON PLAN ───────────────────────────────────────
console.log("\nTEST 1 - Plan's Home has the session doors");

const plan = home("personal");
const planDoors = [...plan.c.querySelectorAll("[data-door-id]")];

ok("1a. Plan's Home renders session doors at all", planDoors.length > 0,
   "Plan's Home has no door grid. This is the LOBBY-1c state: one button " +
   "into coach-proposal and nothing else.");

// Count them. A presence check passed with the grid down to one tile.
ok("1b. and it is the full set, not a remnant", planDoors.length >= 4,
   `${planDoors.length} door(s) on Plan's Home`);

// VISIBLE AND CLICKABLE, not merely present. jsdom computes no CSS, so a
// node hidden by an inline style is still in the DOM -- the exact way
// verify-chap3's first version of this check was fooled.
const usable = planDoors.filter(d =>
  !d.hasAttribute("hidden") &&
  !d.disabled &&
  !/display:\s*none|visibility:\s*hidden/.test(d.getAttribute("style") || ""));
ok("1c. and they are usable, not just present", usable.length === planDoors.length,
   `${planDoors.length - usable.length} door(s) present but hidden or disabled`);

// ── 2. STRETCH IS REACHABLE ─────────────────────────────────────────────
console.log("\nTEST 2 - the eight-type engine is reachable from Home");

const routes = planDoors.map(d => d.dataset.route);
ok("2a. the Mobility & Conditioning door is on Plan's Home",
   routes.includes("mobility-conditioning"),
   "the only route to a Stretch session. coach-proposal cannot build one: " +
   "workoutGenerator.getWorkoutName() has three names and stretch is not among them.");

ok("2b. and the strength/cardio door too",
   routes.includes("session-builder"),
   "session-builder.js is the engine holding sessionVariety, exercisePreferences " +
   "and SECTION-RULES. workoutGenerator.js reads none of them.");

// The claim in 2a is only worth making if the type list really does
// contain stretch. Read it rather than trusting the comment above.
const { SESSION_TYPES } = await import(B + "session-builder.js");
ok("2c. and that engine really does have a stretch type",
   SESSION_TYPES.some(t => t.id === "stretch"),
   `session-builder types: ${SESSION_TYPES.map(t => t.id).join(", ")}`);

const wg = fs.readFileSync("js/data/workoutGenerator.js", "utf8");
ok("2d. and the coach-proposal engine still does not, so the door matters",
   !/getWorkoutName[\s\S]{0,200}stretch/.test(wg),
   "workoutGenerator now has a stretch type. If that is deliberate this " +
   "assertion should be retired with the reason recorded, not deleted.");

// ── 3. NOTHING WAS TRADED AWAY TO GET THEM BACK ─────────────────────────
console.log("\nTEST 3 - the invitation survived, and nothing doubled");

ok("3a. the coach-picks fallback is still offered on Plan",
   !!plan.c.querySelector('[data-action="start-today"]'),
   "restoring the doors removed the invitation. It is meant to become one " +
   "option among them, not to be replaced in turn -- that would be the same " +
   "mistake in the other direction.");

ok("3b. the arc panel appears exactly once on Plan",
   plan.c.querySelectorAll(".today-arc, .today-arc--active, .today-arc--offer").length <= 1,
   "the arc renders twice: arcPanel() is called above the chooser AND inside it");

// Counted as a SET of elements, not as two filters added together: the
// Wellbeing door carries both data-door-id and data-route="noticing", so
// summing the two filters counted the same node twice and reported a
// duplicate that was not there. Caught by reversal.
const wellbeingCount = new Set([
  ...planDoors.filter(d => d.dataset.doorId === "wellbeing"),
  ...[...plan.c.querySelectorAll('[data-route="noticing"]')]
]).size;
ok("3c. Wellbeing is offered once on Plan, not twice", wellbeingCount <= 1,
   `${wellbeingCount} routes to Wellbeing on Plan's Home`);

// ── 4. FREE DID NOT REGRESS ─────────────────────────────────────────────
console.log("\nTEST 4 - free keeps what it already had");

const free = home("free");
const freeDoors = [...free.c.querySelectorAll("[data-door-id]")];
ok("4a. free still has its doors", freeDoors.length >= 4,
   `${freeDoors.length} door(s) on free's Home`);
ok("4b. free still gets the arc offer beneath them",
   /what you are working towards|arc|aim/i.test(free.text),
   "free never sees the arc, so the product is never mentioned to the people " +
   "who might buy it");
ok("4c. free still gets its fallback",
   !!free.c.querySelector('[data-action="start-today"]'));

// ── 5. THE ESCAPE HATCH OUTRANKS THE MODALS ─────────────────────────────
console.log("\nTEST 5 - ESCAPE-Z: the way out is on top");

const html = fs.readFileSync("index.html", "utf8");
const hatchBlock = html.slice(html.indexOf(".hidden-nav-escape {"),
                              html.indexOf("}", html.indexOf(".hidden-nav-escape {")));
const hatchZ = Number((hatchBlock.match(/z-index:\s*(\d+)/) || [])[1]);

ok("5a. the escape hatch declares a z-index", Number.isFinite(hatchZ),
   "no z-index on .hidden-nav-escape");

// Every z-index in the app, measured, rather than a hardcoded 9999 that
// goes stale the first time something outranks it.
const allZ = [];
const files = ["index.html",
  ...fs.readdirSync("css/components").map(f => `css/components/${f}`),
  ...fs.readdirSync("css/layouts").map(f => `css/layouts/${f}`)];
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  for (const m of src.matchAll(/z-index:\s*(\d+)/g)) {
    if (f === "index.html" && Number(m[1]) === hatchZ) continue;
    allZ.push({ f, z: Number(m[1]) });
  }
}
const highest = allZ.reduce((a, b) => (b.z > a.z ? b : a), { f: "-", z: -1 });

ok("5b. and it sits above everything else in the app", hatchZ > highest.z,
   `escape hatch is ${hatchZ}; ${highest.f} declares ${highest.z}. The hatch is ` +
   `under a modal again -- the state Graeme met as "I can't exit it back to the home page".`);

// The specific one that caused it, named, so a future reader knows why.
const cpCss = fs.readFileSync("css/components/coach-proposal.css", "utf8");
const panelZ = Number((cpCss.slice(cpCss.indexOf(".cp-preview-panel {"))
  .match(/z-index:\s*(\d+)/) || [])[1]);
ok("5c. specifically above coach-proposal's preview panel", hatchZ > panelZ,
   `hatch ${hatchZ} vs panel ${panelZ}`);

// A 44px target is the reason the hatch is usable at all; losing it would
// make the fix cosmetic. WCAG 2.2 AA, 2.5.8 Target Size (Minimum).
ok("5d. and it is still a 44px target",
   /min-width:\s*44px/.test(hatchBlock) && /min-height:\s*44px/.test(hatchBlock),
   "the escape hatch is below the 44px minimum target size (WCAG 2.5.8)");

console.log(fails === 0
  ? "\nHOME-DOORS: all assertions pass\n"
  : `\nHOME-DOORS: ${fails} FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
