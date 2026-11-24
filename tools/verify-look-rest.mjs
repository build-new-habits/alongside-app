/**
 * tools/verify-look-rest.mjs
 * 24 Nov 2026 v7
 *
 * v7 - P-46 S4 FREE HOME. TEST 2 reads the coach-led Free Home (each way in
 *   in its kind colour, a line icon beside its words, Check in); TEST 5:
 *   Free's Library moved to the Plan, so Free gets the on-the-plan page in the
 *   same look.
 *
 * 05 Nov 2026 v6
 *
 * v6 - P-27 TIDY (Graeme, 05 Nov: "The Plan's finish"). TEST 3: on the Plan,
 *   reflect now opens the Plan's finish; 3b-3e (the old finish's Plan look)
 *   are retired with the route, and 3b holds the Plan's finish with the mood
 *   question in the open. 3pc, 3a and 3f unchanged and still pass on it.
 *
 * 31 Oct 2026 v5
 *
 * v5 - P-13 re-point: 1f's Library row words are now "Classes, practices,
 *   the mind, your lists" (true words: runs are behind Keep moving). Nothing
 *   loosened.
 *
 * v4 - STAGE PATH P-4 re-point (none loosened; mock-up v10, Graeme approved
 *   29 Oct: "I like v10"). TEST 1 reads the purpose-first Home with the same LOOK-4
 *   properties: the arc said first ("Your arc · Week n", the aim), as words
 *   rather than a control (it opens from Progress); each door its kind
 *   colour tile, icon and name; Home's one row (Let me choose for you) set
 *   apart, tinted, one action, no door filled or tinted; a visible heading naming the doors; one slate Library row
 *   saying what is in it; no count, no emoji, icons decorative.
 *
 * 12 Oct 2026 v3
 *
 * v3 - A-1 PLAN-HOME-PRUNE (Graeme approved the mock-up, 12 Oct: "I love
 *   plan home"). TEST 1 REVERSED by that decision, the LOOK-4 properties
 *   kept: the arc leads the Today card (its label "Your arc · Week n", the
 *   aim, and a name saying both); Tell me what to do is the card's filled
 *   button; each door has its tile, title and chevron (its second line
 *   went, A-4: the name says it); the doors' group is named by a visible
 *   heading; the five tiles under "Or go straight to" became one Library
 *   row with its slate tile, which says what is in it. No count, no emoji,
 *   icons decorative: unchanged.
 *
 *
 * v2 - D-6 WEEK-SHAPE, a recorded reversal: Plan Home has a fifth link,
 *   Plan your week (teal), full width under the four. 1f and 1h expect it.
 *
 * LOOK-4 (Graeme approved the mock-up, 04 Oct: "Yes yes yes. Love it").
 * Home on the Plan and on Free, the finish screen, Wellbeing and the
 * Library take the look Settings and Progress have (LOOK-1/2/3): cards,
 * a kind-colour tile with a line icon beside every choice, numbers before
 * words. Driven through the real router and views.
 *
 *   1. Plan Home: the arc as a card ("Your arc · Week n"); the three doors
 *      with a tile, words and a chevron, the first filled; the four links
 *      as tiles under "Or go straight to", each in its kind colour.
 *   2. Free Home: each session tile in its kind colour with a line icon,
 *      no emoji; Wellbeing on its own row; reference rows in one card.
 *   3. The finish screen: a tick tile, the stats as number tiles that
 *      still read "2 moves · 6 sets · 32 min", three feel buttons.
 *   4. Wellbeing: Suggested now in green with its tile; four practice
 *      tiles; every id, label and words as before.
 *   5. Library: every category on the first page, in its kind colour; one
 *      tap to a session (no Start a session step); Back returns there.
 *   6. Everywhere: icons are decorative (aria-hidden) and beside words; no
 *      emoji left on these screens; colour classes come from the seven kinds.
 */
import { agreed } from "./agreed.mjs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div><nav id="bottom-nav"></nav></div><div id="sr-announcer"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: /prefers-reduced-motion/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };
dom.window.confirm = () => false; globalThis.confirm = () => false;
dom.window.alert = () => {}; globalThis.alert = () => {};
globalThis.fetch = dom.window.fetch = async () => ({ ok: false, text: async () => "", json: async () => ({}) });

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
globalThis.window.router = router;
Object.defineProperty(globalThis, "router", { value: router, configurable: true, writable: true });
const gate = await import(B + "safety-gate.js");
const { AIMS } = await import(B + "data/aims.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const $ = s => main.querySelector(s), $$ = s => [...main.querySelectorAll(s)];
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const KIND = /\bk-(teal|amber|violet|blue|rose|green|slate)\b/;
const iso = d => new Date(Date.now() - d * 86400000).toISOString();

function fixture(tier) {
  localStorage.clear(); store.init(); agreed(store);
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("createdAt", iso(40));
  store.set("conditions", []); store.set("conditionPainScores", {});
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  router.history = []; router.currentView = null;
}
async function go(view) { await router.navigate(view); await wait(60); }
const iconsDecorative = () => $$("svg.line-icon").every(s => s.getAttribute("aria-hidden") === "true");

// ── 1. PLAN HOME ────────────────────────────────────────────────────────
console.log("\nTEST 1 - Plan Home");
fixture("personal");
const aim = AIMS.list[0];
store.set("arc", { active: true, aimId: aim.id, startedAt: iso(22), strands: aim.strands.slice(0, 2), zonesWorked: {}, typesWorked: {} });
await go("today");
// v4 (Stage PATH, mock-up v9): the LOOK-4 properties on the purpose-first Home.
const arcLine = $(".path-arcline");
const doors = $$(".path-doors .path-door[data-door]");
const libRow = $('.path-doors [data-route="library"]');
const DOOR_KIND = { stronger: "k-amber", moving: "k-blue", stretch: "k-violet", feel: "k-green" };
ok("1pc. Plan Home rendered (the one row, four doors, the Library row)", !!$(".path-coach") && doors.length === 4 && !!libRow, txt(main).slice(0, 120));
ok("1a. the arc is said first: \"Your arc · Week n\", the aim", /^Your arc · Week \d+( starts today)?\. /.test(txt(arcLine)) && txt(arcLine).endsWith(aim.label), txt(arcLine));
ok("1b. and it is words, not a control (it opens from Progress, Change my arc)", !!arcLine && !arcLine.closest("button, a") && !arcLine.querySelector("button, a"));
ok("1c. each door: its kind colour tile with an icon, and its name", doors.every(d => d.querySelector(`.kind-tile.${DOOR_KIND[d.dataset.door]} svg`) && txt(d.querySelector(".path-door__t"))));
const lead = $(".path-coach");
ok("1d. the one row is the one set apart (tinted, one action), and no door is", lead?.tagName === "BUTTON" && /\bk-teal\b/.test(lead.className) && $$(".path-coach").length === 1 && !lead.querySelector("button") && !doors.some(d => d.classList.contains("btn-primary") || d.classList.contains("path-coach")));
ok("1e. \"Or choose for yourself\" is a visible heading that names the doors", txt($("#path-doors-h")) === "Or choose for yourself" && !$("#path-doors-h").classList.contains("sr-only") && $(".path-doors")?.getAttribute("aria-labelledby") === "path-doors-h");
ok("1f. one Library row, in slate, saying what is in it", /k-slate/.test(libRow?.querySelector(".kind-tile")?.className || "") && txt(libRow?.querySelector(".path-door__t")) === "Library" && /Classes, practices, the mind, your lists/.test(txt(libRow?.querySelector(".path-door__d"))));
ok("1g. no \"Or go straight to\" tiles", !$("#home-links-label") && !$$(".home-link--tile").length);
ok("1h. the Library row goes to the Library", libRow?.dataset.route === "library");
ok("1i. no count or weekly target on Home", !/\b\d+ of \d+\b|this week/i.test(txt(main)));
ok("1j. icons decorative; no emoji on Plan Home", iconsDecorative() && !EMOJI.test(txt(main)), (txt(main).match(EMOJI) || [""])[0]);
click(libRow); await wait(60);
ok("1k. a link still opens its screen (Library)", router.currentView === "library");

// ── 2. FREE HOME ────────────────────────────────────────────────────────
console.log("\nTEST 2 - Free Home");
fixture("free");
await go("today");
// P-46 S4: Free Home is coach-led, in the Plan's look (free-home.js).
const ways = $$(".free-home .path-door");
const wayLook = ways.map(t => `${t.dataset.action || t.dataset.route}:${(t.querySelector(".kind-tile")?.className.match(KIND) || [])[1]}`);
ok("2pc. Free Home rendered (the Today card and its ways in)", !!$(".free-home .path-today") && ways.length >= 3, txt(main).slice(0, 120));
ok("2a. each way in in its kind colour (Something gentler violet, ready-made amber, Log what I did slate)",
   ["free-gentler:violet", "free-ready:amber", "activity-log:slate"].every(x => wayLook.includes(x)), JSON.stringify(wayLook));
ok("2b. a line icon on each, beside its words", ways.every(t => t.querySelector(".kind-tile svg.line-icon") && txt(t.querySelector(".path-door__t"))));
ok("2c. Wellbeing is not a row (it is in the bottom bar)", !$('[data-route="noticing"]'));
ok("2d. the Today card carries its tile", !!$(".path-today .kind-tile svg"));
ok("2e. Check in is there", txt($('.path-today [data-action="start-today"]')) === "Check in");
ok("2f. icons decorative; no emoji on Free Home", iconsDecorative() && !EMOJI.test(txt(main)), (txt(main).match(EMOJI) || [""])[0]);

// ── 3. THE FINISH SCREEN ────────────────────────────────────────────────
console.log("\nTEST 3 - after a session");
fixture("personal");
store.set("currentActivityEntry", { id: "f1", type: "workout", sessionType: "full", status: "complete", exercisesCount: 2, setsDone: 6, durationMins: 32, completedAt: new Date().toISOString() });
await go("reflect");
ok("3pc. the finish screen rendered", /That.s today done/.test(txt($("h1"))), txt(main).slice(0, 100));
ok("3a. a tick tile above the heading, decorative", !!$(".finish-head > .kind-tile svg[aria-hidden=true]"));
// v6 (P-27, Graeme 05 Nov: "The Plan's finish"). On the Plan the old finish
// is the Plan's finish, for every player. Its own look (3b-3e: number tiles,
// How did it feel?) is Free's only now and is not reached on the Plan.
ok("3b. P-27: on the Plan it is the Plan's finish, with the mood question in the open", router.currentView === "plan-finish" && !!$('input[name="pf-mood"]') && !$("[data-feel]"), router.currentView);
ok("3f. the note still one tap away", !!$("details.finish-more") && !$("details.finish-more[open]"));

// ── 4. WELLBEING ────────────────────────────────────────────────────────
console.log("\nTEST 4 - Wellbeing");
fixture("free");
await go("noticing");
ok("4pc. Wellbeing rendered", txt($("h1")) === "Wellbeing");
ok("4a. Suggested now: green, with its tile, and Start", $(".wb-suggest")?.classList.contains("k-green") && !!$(".wb-suggest .kind-tile svg") && !!$("#wb-start"));
const prac = $$(".wb-practice");
ok("4b. four practices as tiles, each with its words", JSON.stringify(prac.map(p => txt(p.querySelector(".wb-practice__name")))) === JSON.stringify(["Breathing", "Mindful awareness", "Journal", "In Step"]),
   prac.map(txt).join(" | "));
ok("4c. their ids are as before", ["noticing-breathe-btn", "noticing-mindful-btn", "noticing-journal-btn", "noticing-in-step-btn"].every(id => !!main.querySelector("#" + id)));
ok("4d. each one's name starts with its visible words (2.5.3)", prac.every(p => (p.getAttribute("aria-label") || "").startsWith(txt(p.querySelector(".wb-practice__name")))));
ok("4e. the journal still says only you can read it", /Only you can read it/.test(txt($("#noticing-journal-btn"))));
ok("4f. the support lines are still there", !!$("[data-support-lines]") && /116 123/.test(txt($("[data-support-lines]"))));
ok("4g. icons decorative; no emoji on Wellbeing", iconsDecorative() && !EMOJI.test(txt(main)), (txt(main).match(EMOJI) || [""])[0]);
click($("#noticing-breathe-btn")); await wait(60);
ok("4h. a practice still opens (Breathing)", router.currentView !== "noticing", router.currentView);

// ── 5. LIBRARY ──────────────────────────────────────────────────────────
console.log("\nTEST 5 - Library");
// P-46 S4: Free's Library moved to the Plan; its first-page checks retire with
// it (git history). The Plan's Library is verify-library-shelf.
fixture("free");
await go("library");
ok("5. Free asking for the Library: the on-the-plan page, in the same look", router.currentView === "on-the-plan" && !!$(".on-the-plan .kind-tile svg") && iconsDecorative() && !EMOJI.test(txt(main)), router.currentView);

console.log(`\nLOOK-REST: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
