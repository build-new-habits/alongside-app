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

// ARC-LED, 06 Sep 2026. Rooms are collapsed rows now, so the class
// names changed. THE PROPERTY DID NOT: every room says what it is,
// permanently, WITHOUT BEING OPENED.
//
// The first draft of that layout moved "what the room is" into the
// expanded detail and left only state on the closed row -- so you had to
// open a room to learn what it was, which is the "find out by doing"
// fault CLUB spec v2 3.1 reversed v1 over. This assertion caught it.
// Hence the closed-row scoping below: querying the whole row would pass
// on a `what` line hidden inside the detail.
for (const r of rooms) {
  const id = r.dataset.roomId;
  const head  = r.querySelector(".club-row__head");
  const name  = head && head.querySelector(".club-row__title");
  const what  = head && head.querySelector(".club-row__what");
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
  const kids = [...(r.querySelector(".club-row__text")?.children || [])]
    .map(c => c.className.split(" ")[0]);
  const n = kids.indexOf("club-row__title");
  const w = kids.indexOf("club-row__what");
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

// ── 8. GUIDED-COPY ──────────────────────────────────────────────────────
// The card described a course. All eight entries in programmes.js have
// an EMPTY sessionSequence -- a programme is four phases carrying a
// bias, not a set of sessions. The copy was written against a room
// nobody had looked inside.
console.log("\nTEST 8 - Guided class does not promise a course");

const { PROGRAMMES } = await import(B + "data/programmes.js");
const progs = Object.values(PROGRAMMES).filter(p => p && p.id);

// The PREMISE, measured. If content ever lands, this goes red and the
// copy can honestly say "course" again -- rather than the wording
// staying cautious forever because nobody rechecked.
ok("8a. no programme has any session content yet",
   progs.every(p => (p.sessionSequence || []).length === 0),
   "a programme now carries sessions. The card may describe a course again, " +
   "and this assertion should be retired with the reason recorded");

// home() clears storage and re-inits, so the programme has to be set
// INSIDE the same fixture rather than before it -- setting it first and
// calling home() would wipe it and measure the empty state instead.
localStorage.clear();
store.init();
store.set("tier", "personal");
store.set("activeProgramme", { programmeId: "beginner-fitness", currentWeek: 1 });
const progContainer = document.createElement("div");
document.body.appendChild(progContainer);
TodayView({ navigate: () => {} }).mount(progContainer);
const withProg = { c: progContainer };
const guided = withProg.c.querySelector('[data-room-id="guided"]');
const gText = guided ? guided.textContent.replace(/\s+/g, " ") : "";

// DEVICE-2, 06 Sep 2026. This measured the WITH-PROGRAMME branch only,
// so it passed while the empty state still said "A set course" -- the
// exact claim GUIDED-COPY existed to remove. Asserted against the
// SOURCE, which covers every branch, and against both rendered states.
ok("8b. no branch of the card calls itself a set course",
   // Comments stripped: the source now contains "set course" in the note
   // recording what it USED to say, and a gate that cannot tell a string
   // from a note about a string will either be silenced or silence the
   // history. Third time today.
   !/set course/i.test(today.split("\n").filter(l => !/^\s*(\*|\/\/|\/\*)/.test(l)).join("\n")),
   "one branch still promises a course. GUIDED-COPY changed the branch that " +
   "was on screen at the time and left the other");

ok("8b-2. including the rendered with-programme state",
   !/set course/i.test(gText), gText.slice(0, 160));

const emptyGuided = home("personal").c.querySelector('[data-room-id="guided"]');
ok("8b-3. and the rendered empty state",
   !/set course/i.test(emptyGuided.textContent),
   emptyGuided.textContent.replace(/\s+/g, " ").slice(0, 160));

// "Nothing scheduled today" rendered EVERY day, because
// plannedFocusToday() reads the empty sessionSequence. It described an
// absence as though a schedule existed and today happened to be empty.
ok("8c. and does not claim a schedule it does not have",
   !/nothing scheduled/i.test(gText),
   gText.slice(0, 160));

ok("8d. it says what is actually there instead",
   /twelve-week shape/i.test(gText),
   gText.slice(0, 160));

ok("8e. and the phase it names is real data",
   /Foundation/.test(gText),
   "the facts are not coming from getPhaseForWeek, so they are decoration again");

// ── 9. DEVICE-1 ─────────────────────────────────────────────────────────
// Found by reading the screen top to bottom rather than by any gate.
// Both are the same class: a sentence claiming something that is not so.
console.log("\nTEST 9 - DEVICE-1: the screen does not name what is not there");

const todaySrc9 = fs.readFileSync("js/views/today.js", "utf8");
const code9 = todaySrc9.split("\n").filter(l => !/^\s*(\*|\/\/|\/\*)/.test(l)).join("\n");

// The orientation line named "Unsure" -- a door renamed twice since.
// Asserted against the ROOM NAMES so a third rename goes red here too,
// rather than against the single word that happened to be wrong.
const roomTitles = ["Guided class", "One to one", "Your own", "Quick build"];
const orient = code9.slice(code9.indexOf("lets me decide today"));
// DEVICE-2. DEVICE-1 replaced "Unsure" with "One to one" and this
// passed -- but One to one is a PLAN room, and free's coach route is the
// "Not sure?" button. The fix moved the fault one tier over. Both tiers
// asserted now, from the control actually on each screen.
ok("9a. the orientation line names a Plan room on Plan",
   roomTitles.some(r => code9.includes(`${r} lets me decide today`)),
   "it points at a door that is not on the screen - and it shows ONLY to " +
   "somebody with no goal set, the exact person who needs the pointer to work");

ok("9a-2. and free's own control on free",
   /Not sure\?[^"]*lets me decide today/.test(code9),
   "free is told to use One to one, which is a Plan room and is not on its screen");

ok("9a-3. and the line is chosen by tier, not written once for both",
   /isPremium\(\)\s*\n?\s*\?\s*"If you'd rather not choose/.test(code9),
   "one line for two different screens is how the fault moved rather than closed");

ok("9b. and no longer says Unsure",
   !/\u201CUnsure\u201D|"Unsure"/.test(code9),
   "Unsure has not been a door since CLUB-SHELL");

// "Every strand has come up at least once" was reached with ZERO
// strands, because zero of zero is zero.
ok("9c. full-coverage is only claimed when there are strands to cover",
   /strands\.length\s*\n?\s*\?\s*"Every strand has come up at least once\."/.test(code9),
   "an arc with no strands announces complete coverage of nothing - vacuously " +
   "true, and read as an achievement");

// ── 10. ARC-LED ─────────────────────────────────────────────────────────
// Home led with the coach's pick and four full cards, so the screen
// nominated a session before the person had said anything. That made the
// app the one with the plan, and it contradicted "free is today, the
// Plan is the arc" on the Plan tier's own home screen.
console.log("\nTEST 10 - ARC-LED: Home does not nominate a session");

const arcLed = fs.readFileSync("js/views/today.js", "utf8")
  .split("\n").filter(l => !/^\s*(\*|\/\/|\/\*|<!--)/.test(l)).join("\n");

ok("10a. no room carries a suggested flag",
   !/suggested:/.test(arcLed),
   "the slot is back. It was removed rather than left unused precisely so it " +
   "could not quietly return");

const planRooms = plan.c.querySelectorAll("[data-room-id]");
ok("10b. and nothing on Home is badged as suggested",
   ![...planRooms].some(r => /suggested for today/i.test(r.textContent)),
   "Home is nominating a session again");

// Rows open IN PLACE. The depth rule counts screens, not taps.
ok("10c. every room row is collapsible",
   [...planRooms].every(r => r.querySelector("[data-room-toggle]")),
   "a room does not open in place, so it must be navigating");

ok("10d. and starts closed, with aria-expanded agreeing",
   [...planRooms].every(r => {
     const head = r.querySelector("[data-room-toggle]");
     const detail = r.querySelector(".club-row__detail");
     return head.getAttribute("aria-expanded") === "false" && detail.hasAttribute("hidden");
   }),
   "aria-expanded and the hidden attribute disagree - the state is visible to " +
   "sighted users and to nobody else");

// The arc shows COVERAGE, not completion. No bar, no percentage, no
// count. P4, and no streaks anywhere in this product.
const arcSrc = arcLed.slice(arcLed.indexOf("function arcPanel"));
ok("10e. the arc block has no progress bar or percentage",
   !/width:\s*\$\{|%\`|percent|progress-bar/i.test(arcSrc.slice(0, 4000)),
   "the arc is showing completion. It shows COVERAGE - which strands have come " +
   "up and which have not - and a bar makes the unlit ones a shortfall");

// ARC-PLAIN, 06 Sep 2026. The per-row mark and "not yet" label are
// gone -- Graeme's call, and the screen is much quieter for it. WCAG
// 1.4.1 is now carried by the NOTE, which names the strands that have
// not come up in every state: all of them, some of them, none of them.
// So this asserts the note rather than the rows, because the note is
// what is doing the work. If the note ever stops naming them, state
// becomes colour-only and this goes red.
ok("10f. the note names which strands have not come up",
   /_esc\(notYet\.join/.test(arcLed) && /All of it still ahead of you/.test(arcLed),
   "state is carried by colour alone (WCAG 1.4.1), and colour is the first " +
   "thing to fail on a phone in daylight");

// One colour, one meaning. Teal is interactive across the whole app.
const clubCss = fs.readFileSync("css/components/club-rooms.css", "utf8");
const litRule = clubCss.slice(clubCss.indexOf(".today-arc__strand--lit"),
                              clubCss.indexOf("}", clubCss.indexOf(".today-arc__strand--lit")));
ok("10f-2. and a lit strand is not painted the interactive colour",
   !/--color-primary/.test(litRule),
   "teal means 'you can tap this' everywhere else in this app. Spending it on " +
   "'this strand has come up' makes one colour mean two things");

ok("10g. and 'not yet' is said not to mean behind",
   /Nothing is behind/.test(arcLed),
   "without that sentence, two of three strands reading 'not yet' is read as " +
   "being behind, whatever the design intends");

console.log(fails === 0
  ? "\nCLUB-SHELL: all assertions pass\n"
  : `\nCLUB-SHELL: ${fails} FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
