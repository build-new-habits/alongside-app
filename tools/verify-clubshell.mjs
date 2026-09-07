/**
 * tools/verify-clubshell.mjs
 * 06 Sep 2026 v1
 *
 * CLUB-SHELL. The four rooms on the Plan home screen.
 *
 * THE ROOMS ARE AN ADDITION, NOT A REPLACEMENT. The first draft of this
 * work replaced the eight tiles with the four rooms, and
 * verify-homedoors went red on "the Mobility & Conditioning door is on
 * Plan's Home" -- the gate written hours earlier after LOBBY-1c did
 * exactly that. It was right: yoga-session is a route the rooms do not
 * reach, and mobility and stretch would have gone back to being two
 * screens deep. Improvements extend what exists; they do not relocate
 * it.
 *
 * ONE GRAMMAR. Every card carries the same five slots in the same order.
 * CLUB spec v2 3.3 reversed v1, which gave each room its own internal
 * grammar -- four things to learn at once, differentiated by cues that
 * have to be picked up implicitly.
 */

import { createRequire as __cr } from "node:module";
import fs from "node:fs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="c"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });

const B = new URL("../js/", import.meta.url).href;
const { store }     = await import(B + "store.js");
const { isPremium } = await import(B + "auth.js");
const { TodayView } = await import(B + "views/today.js");
const today = fs.readFileSync("js/views/today.js", "utf8");

let fails = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) { if (detail) console.log(`        ${detail}`); fails++; }
};

/**
 * EACH MOUNT GETS ITS OWN CONTAINER, and that is not tidiness.
 *
 * The first version of this harness reused one #c and cleared it, so
 * home("free") wiped the Plan render that the later tests were still
 * querying. Tests 2 and 3 passed anyway -- free has tiles too, and the
 * room array had already been captured as detached nodes -- while test 6
 * read free's DOM and correctly reported no time chips on a card that
 * renders four of them.
 *
 * A shared fixture that a later test mutates is the same fault as a
 * fixture that never reaches its branch: the assertion runs, and it
 * measures something other than what it names.
 */
function home(tier) {
  localStorage.clear();
  store.init();
  store.set("tier", tier);
  const c = document.createElement("div");
  document.body.appendChild(c);
  const navs = [];
  TodayView({ navigate: v => navs.push(v) }).mount(c);
  return { c, navs, text: c.textContent.replace(/\s+/g, " ") };
}

// ── 0. FIXTURE REACH ────────────────────────────────────────────────────
console.log("\nTEST 0 - the fixtures reach the tiers they name");
localStorage.clear(); store.init(); store.set("tier", "personal");
ok("0a. the Plan fixture is on Plan", isPremium() === true);
localStorage.clear(); store.init(); store.set("tier", "free");
ok("0b. the free fixture is on free", isPremium() === false);

// ── 1. FOUR ROOMS ───────────────────────────────────────────────────────
console.log("\nTEST 1 - the four rooms are on Plan's Home");

const plan = home("personal");
const rooms = [...plan.c.querySelectorAll("[data-room-id]")];
const ids = rooms.map(r => r.dataset.roomId);

ok("1a. four rooms render", rooms.length === 4, `${rooms.length} rendered: ${ids.join(", ")}`);
for (const id of ["guided", "pt", "own", "quick"])
  ok(`1b. the ${id} room is present`, ids.includes(id));

const free = home("free");
ok("1b-2. mounting free did not wipe the Plan render",
   plan.c.querySelectorAll("[data-room-id]").length === 4,
   "the two mounts share a container, so every assertion below this line " +
   "measures free while claiming to measure Plan");

ok("1c. and free does NOT get them", free.c.querySelectorAll("[data-room-id]").length === 0,
   "free was given the rooms. Free keeps the screen it has -- structure IS the " +
   "free product, and Graeme confirmed he likes it");

// ── 2. THE TILES DID NOT LEAVE ──────────────────────────────────────────
console.log("\nTEST 2 - the direct routes survived the addition");

const planDoors = [...plan.c.querySelectorAll("[data-door-id]")]
  .filter(d => d.dataset.roomId === undefined);
const planRoutes = planDoors.map(d => d.dataset.route);

ok("2a. Plan still has the tile grid", planDoors.length >= 4,
   `${planDoors.length} tiles on Plan's Home. The first draft of this work removed ` +
   `them and verify-homedoors caught it -- LOBBY-1c with better comments`);
ok("2b. including Mobility & Conditioning", planRoutes.includes("mobility-conditioning"),
   "the only route to a Stretch session");
ok("2c. and Yoga & Pilates", planRoutes.includes("yoga-session"),
   "yoga-session is a route NO room reaches - it is only on the tile grid");

// ── 3. ONE GRAMMAR ──────────────────────────────────────────────────────
console.log("\nTEST 3 - every card has the same five slots, in the same order");

for (const r of rooms) {
  const id = r.dataset.roomId;
  const name  = r.querySelector(".club-room__name");
  const what  = r.querySelector(".club-room__what");
  const act   = r.querySelector(".club-room__go, .club-room__chip");
  ok(`3a. ${id}: has a name`, !!name && name.textContent.trim().length > 0);
  // SLOT 2 IS THE ONE v1 GOT WRONG. Permanent, not a first-run tooltip.
  ok(`3b. ${id}: says what the room is, permanently`,
     !!what && what.textContent.trim().length > 0 && !what.hasAttribute("hidden"),
     "v1 said you learn what a room is by entering it once. That is an implicit " +
     "demand and it spends executive function to satisfy");
  ok(`3c. ${id}: has an action`, !!act);
}

const order = rooms.every(r => {
  const kids = [...r.children].map(c => c.className.split(" ")[0]);
  const n = kids.indexOf("club-room__name");
  const w = kids.indexOf("club-room__what");
  return n > -1 && w > -1 && n < w;
});
ok("3d. and the name always comes before the description", order,
   "slot order differs between cards, which is the thing one grammar exists to prevent");

// ── 4. TAP TARGETS ──────────────────────────────────────────────────────
console.log("\nTEST 4 - WCAG 2.5.8, and nothing launches by accident");

const css = fs.readFileSync("css/components/club-rooms.css", "utf8");
ok("4a. actions declare a 44px minimum", /min-height:\s*44px/.test(css),
   "below the WCAG 2.2 AA minimum target size");
ok("4b. keyboard focus is visible on them", /focus-visible/.test(css));
ok("4c. and the chips are two columns, not four",
   /grid-template-columns:\s*repeat\(2/.test(css),
   "four chips across a 380px screen puts every target under the minimum");

// ── 5. NO COLOUR CARRIES A ROOM ─────────────────────────────────────────
console.log("\nTEST 5 - colour still means what it meant");

const roomColour = /\.club-room--(guided|pt|own|quick)/.test(css);
ok("5a. no room has its own colour class", !roomColour,
   "colour already means energy, a sore zone, caution and tier here. Somebody " +
   "learning that amber means 'be careful with this movement' must not also " +
   "learn it means 'you are in a room'");
ok("5b. and there is no entry animation",
   !/@keyframes|animation:/.test(css),
   "a screen that assembles itself is a screen you cannot read while it moves");

// ── 6. QUICK BUILD CARRIES ITS ANSWER ───────────────────────────────────
console.log("\nTEST 6 - the chip is not a label with nothing behind it");

const chips = [...plan.c.querySelectorAll("[data-quick-mins]")];
ok("6a. Quick build offers time chips", chips.length >= 3, `${chips.length} chips`);
ok("6b. and each carries a real number",
   chips.every(c => Number.isFinite(Number(c.dataset.quickMins)) && Number(c.dataset.quickMins) > 0));
ok("6c. the chip writes a duration preselect",
   /sessionBuilderPreselect'?"?,\s*\{\s*durationMins/.test(today),
   "the chip navigates without carrying the answer, so the builder asks again - " +
   "which tells somebody their first answer was not heard");

const sbui = fs.readFileSync("js/views/session-builder-ui.js", "utf8");
ok("6d. and the builder reads it", /pre\.durationMins/.test(sbui),
   "written but never read - the writer-without-reader half of the same class");
ok("6e. and clears it, so it cannot pin a later build",
   /if \(!pre\.type\) \{\s*\n\s*store\.set\("sessionBuilderPreselect", null\);/.test(sbui),
   "a preselect that persists silently pins every later build to a duration " +
   "chosen days earlier");

const schema = fs.readFileSync("Documents/Live State/Schema.md", "utf8");
ok("6f. and the field is declared", /sessionBuilderPreselect\.durationMins/.test(schema),
   "schema before code");

// ── 7. THE SHELL IS HONEST ABOUT WHAT IS NOT BUILT ──────────────────────
console.log("\nTEST 7 - no room implies something that does not work yet");

const own = rooms.find(r => r.dataset.roomId === "own");
ok("7a. Your own says saving is not here yet",
   /comes soon|not.*yet|Nothing saved/i.test(own.textContent),
   "the card implies saved routines work. YOUR-OWN is item 5 and its store " +
   "fields do not exist - an empty state that lies is worse than one that waits");

console.log(fails === 0
  ? "\nCLUB-SHELL: all assertions pass\n"
  : `\nCLUB-SHELL: ${fails} FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
