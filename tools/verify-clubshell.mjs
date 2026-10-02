/**
 * tools/verify-clubshell.mjs
 * 02 Oct 2026 v3
 *
 * v3 - W4-0 SUITE-TRUE. Mounts through tools/one-screen.mjs, so one screen
 *   is in the page at a time (two copies of one id failed on jsdom 27+). No
 *   assertion changed.
 *
 * v2 - SMOOTH-P3a. THE ROOMS HAVE GONE FROM PLAN HOME, BY DECISION.
 *
 *   Spec 4.1 (Graeme, 27 Sep: "too many decisions") replaces the four
 *   rooms and the tile grid with three doors. So the tests that proved
 *   the rooms were there (1a/1b, 2a-c), their grammar (3), their CSS
 *   (4, 5), Quick build's chips (6), Your own's copy (7), Guided class's
 *   copy (8) and the room rows' disclosure and headings (10b-d, 11b/d/e/
 *   f/g/h) have nothing left to measure, and are RETIRED, not loosened.
 *
 *   What they protected is kept, and asserted where it now lives:
 *   - "IMPROVEMENTS EXTEND, THEY DO NOT RELOCATE" (the v1 lesson below):
 *     test 2 now drives every route the rooms and tiles reached and
 *     requires each within two taps of Plan Home -- the doors, the links,
 *     and the know-what screen behind the second door.
 *   - Free keeps its screen (1c, unchanged).
 *   - DEVICE-1 (9): the orientation line names the door actually there.
 *   - ARC-LED's no-nomination and coverage-not-completion rules (10a,
 *     10e-g) and A11Y-HOME's one-h1-and-no-skipped-level (11a, 11c) --
 *     plus 11b: the doors are a group labelled by a heading.
 *   - GUIDANCE-1 (12), unchanged, positive control now the doors. Its 12a
 *     caught the guidance line going with the rooms; it is back.
 *
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

import { oneScreen } from "./one-screen.mjs";
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

// GATE-PATH, 08 Sep 2026. Paths resolved from import.meta.url, not the
// working directory.
//
// 72 of 139 gates read files by a path relative to process.cwd(), so
// they were green from the repo root and read NOTHING from anywhere
// else. Not a live fault -- every session so far has run them from the
// root -- but an expensive trap: a session running the suite by full
// path from elsewhere sees most of it red and reasonably concludes the
// app is broken.
const _GATE_ROOT = new URL("../", import.meta.url);
const _gatePath = (p) => new URL(String(p).replace(/^\.\//, ""), _GATE_ROOT);

const today = fs.readFileSync(_gatePath("js/views/today.js"), "utf8");

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
  oneScreen(c);
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

// ── 1. NO ROOMS ─────────────────────────────────────────────────────────
console.log("\nTEST 1 - the rooms have gone from Plan Home; free keeps its screen");

const plan = home("personal");
ok("1pc. positive control: Plan Home rendered its doors", plan.c.querySelectorAll(".home-door").length === 3);
ok("1a. no rooms on Plan Home", plan.c.querySelectorAll("[data-room-id], .club-row").length === 0);
const free = home("free");
ok("1b-2. mounting free did not wipe the Plan render", plan.c.querySelectorAll(".home-door").length === 3);
ok("1c. and free does NOT get them", free.c.querySelectorAll("[data-room-id]").length === 0,
   "free was given the rooms. Free keeps the screen it has -- structure IS the " +
   "free product, and Graeme confirmed he likes it");

// ── 2. EVERY ROUTE STILL REACHED ────────────────────────────────────────
console.log("\nTEST 2 - everything the rooms and tiles reached is still within two taps");
{
  const { KnowWhatView } = await import(B + "views/know-what.js");
  const reached = new Set();
  const c = home("personal").c;
  // One tap: the doors' own routes and every data-route on Home.
  c.querySelectorAll("[data-route]").forEach(b => reached.add(b.dataset.route));
  const hop = sel => { const navs = []; const h = document.createElement("div"); oneScreen(h);
    TodayView({ navigate: v => navs.push(v) }).mount(h); h.querySelector(sel)?.dispatchEvent(new window.MouseEvent("click", { bubbles: true })); return navs; };
  for (const a of ["start-today", "know-what", "as-i-go"]) hop(`[data-action="${a}"]`).forEach(r => reached.add(r));
  // Two taps: behind "I know what I want".
  const kw = document.createElement("div"); oneScreen(kw);
  const kwNavs = [];
  KnowWhatView({ navigate: v => kwNavs.push(v) }).mount(kw);
  kw.querySelectorAll("[data-kw-route]").forEach(b => reached.add(b.dataset.kwRoute));
  if (kw.querySelector('input[name="kind"][value="yoga"]')) reached.add("yoga-session");   // the yoga tile's route (driven in verify-know-what 6b)
  store.set("savedSessions", [{ id: "s1", name: "Mine", exerciseIds: ["x"], createdAt: new Date().toISOString() }]);
  const kw2 = document.createElement("div"); oneScreen(kw2);
  KnowWhatView({ navigate() {} }).mount(kw2);
  kw2.querySelectorAll("[data-kw-route]").forEach(b => reached.add(b.dataset.kwRoute));
  const MUST = ["classes", "checkin", "session-builder", "saved-sessions", "capture", "goal-setup",
                "mobility-conditioning", "yoga-session", "noticing", "library", "know-what"];
  const missing = MUST.filter(r => !reached.has(r));
  ok("2a. every route the rooms and tiles led to is still reached", missing.length === 0,
     `unreachable: ${missing.join(", ")}. The v1 lesson: improvements extend what exists; they do not relocate it out of reach`);
  ok("2b. REVERSAL: the check is not vacuous", !reached.has("no-such-route") && reached.size >= MUST.length);
}

// ── 9. DEVICE-1 ─────────────────────────────────────────────────────────
// Found by reading the screen top to bottom rather than by any gate.
// Both are the same class: a sentence claiming something that is not so.
console.log("\nTEST 9 - DEVICE-1: the screen does not name what is not there");

const todaySrc9 = fs.readFileSync(_gatePath("js/views/today.js"), "utf8");
const code9 = todaySrc9.split("\n").filter(l => !/^\s*(\*|\/\/|\/\*)/.test(l)).join("\n");

// The orientation line named "Unsure" -- a door renamed twice since.
// Asserted against the ROOM NAMES so a third rename goes red here too,
// rather than against the single word that happened to be wrong.
const roomTitles = ["Tell me what to do"];   // v2: the Plan door that lets the coach decide
const orient = code9.slice(code9.indexOf("lets me decide today"));
// DEVICE-2. DEVICE-1 replaced "Unsure" with "One to one" and this
// passed -- but One to one is a PLAN room, and free's coach route is the
// "Not sure?" button. The fix moved the fault one tier over. Both tiers
// asserted now, from the control actually on each screen.
ok("9a. the orientation line names the Plan door that is on the screen",
   roomTitles.some(r => new RegExp(`${r}(\\\\u2019|\u2019)? lets me decide today`).test(code9)) &&
   plan.c.querySelector(".home-door__title")?.textContent === roomTitles[0],
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

const arcLed = fs.readFileSync(_gatePath("js/views/today.js"), "utf8")
  .split("\n").filter(l => !/^\s*(\*|\/\/|\/\*|<!--)/.test(l)).join("\n");

ok("10a. no room carries a suggested flag",
   !/suggested:/.test(arcLed),
   "the slot is back. It was removed rather than left unused precisely so it " +
   "could not quietly return");

ok("10b. and nothing on Home is badged as suggested",
   !/suggested for today/i.test(plan.c.textContent),
   "Home is nominating a session again");

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
const clubCss = fs.readFileSync(_gatePath("css/components/club-rooms.css"), "utf8");
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

console.log("\nTEST 11 - A11Y-HOME: Home can be read by heading");

// Home had ONE heading for the whole screen -- the greeting -- so the
// page everybody starts on could not be skimmed at all. Four rooms, and
// a screen reader user had no way to jump between them. WCAG 2.2 AA
// 1.3.1: these are the page's sections and they existed in presentation
// only.
//
// Graeme, on being told nothing on Home reached the class player:
// "That's obviously an accessibility problem... Home needs to be read."

{
  // home() returns { c, navs, text } -- the element is on .c. Destructured
  // rather than assumed: the first version treated the return value as
  // the element and threw, which is a fixture not reaching what it names.
  const { c } = home("personal");
  const heads = [...c.querySelectorAll("h1,h2,h3,h4,h5,h6")]
    .map(h => ({ level: Number(h.tagName[1]), text: (h.textContent || "").replace(/\s+/g, " ").trim() }));

  ok("11pc. positive control: Home rendered headings to check",
     heads.length > 0, "no headings at all, so nothing below measures anything");

  ok("11a. exactly one h1",
     heads.filter(h => h.level === 1).length === 1,
     `${heads.filter(h => h.level === 1).length} found`);

  const group = c.querySelector(".home-doors[role=group]");
  const label = group && c.querySelector("#" + group.getAttribute("aria-labelledby"));
  ok("11b. the doors are a group named by a heading",
     !!label && /^H[1-6]$/.test(label.tagName) && label.textContent.trim().length > 0);

  ok("11c. no level is skipped",
     heads.every((h, i) => i === 0 || h.level <= heads[i - 1].level + 1),
     heads.map(h => `h${h.level} ${h.text.slice(0, 18)}`).join(" > "));
}

console.log("\nTEST 12 - GUIDANCE-1: the general-guidance line returns");

// The statement that this app's advice is general, and that somebody
// should speak to their GP or an exercise professional, lived in exactly
// two places: the closing beat of onboarding -- said once, at signup --
// and the Terms page, which almost nobody opens.
//
// Clinical advice on the three-question red-flag screen this
// replaces: those questions "only take into account some red flags", and
// "to protect yourself you might be better off saying something like:
// the advice given by this app is generic, prior to starting any
// exercise programme you should seek guidance from your GP or exercise
// professional."
//
// Graeme: "To have a disclaimer in the terms and onboarding only is a
// concern. I think it needs a one liner regularly, not necessarily every
// session."

{
  const said = (c) => /advice in this app is general/i.test(c.textContent || "");

  // home() clears localStorage every call, so every render through it is
  // "never shown before" and the interval can never be observed. The
  // first version of this test used it and 12c/12d failed against a
  // fixture that was resetting the very field under test.
  function homeKeepingState() {
    const c = document.createElement("div");
    oneScreen(c);
    TodayView({ navigate: () => {} }).mount(c);
    return c;
  }

  localStorage.clear(); store.init(); store.set("tier", "personal");
  const first = homeKeepingState();
  ok("12pc. positive control: Home rendered", first.querySelectorAll(".home-door").length === 3);

  ok("12a. somebody who has never seen it, sees it", said(first),
     "the line that carries the red-flag screen's weight never appears");

  ok("12b. and the store records that it was shown",
     !!store.get("guidanceShownAt"),
     "not stamped, so it would appear on every single render");

  // 🔴 NOT EVERY SESSION. A line that appears every time is a line
  // nobody reads -- the same argument that keeps a live region from
  // firing when nothing has happened.
  const second = homeKeepingState();
  ok("12c. and does not appear again immediately", !said(second),
     "repetition without occasion trains people to look past it, and the " +
     "one time it matters it has already become furniture");

  store.set("guidanceShownAt", new Date(Date.now() - 29 * 86400000).toISOString());
  ok("12d. nor at 29 days", !said(homeKeepingState()), "interval not honoured");

  store.set("guidanceShownAt", new Date(Date.now() - 31 * 86400000).toISOString());
  ok("12e. but does at 31", said(homeKeepingState()),
     "the interval never expires, so it is said once and never again — " +
     "which is the fault this exists to fix");

  // It is the product speaking about its own limits, not the coach.
  const line = homeKeepingState().querySelector(".today-guidance");
  ok("12f. and it is not in the coach's first person",
     !line || !/\bI\b|\bI'\w/.test(line.textContent || ""),
     "the coach says 'I' all over this app; this is the product being " +
     "plain about what it is, and the difference in voice is the point");
}

console.log(fails === 0
  ? "\nCLUB-SHELL: all assertions pass\n"
  : `\nCLUB-SHELL: ${fails} FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
