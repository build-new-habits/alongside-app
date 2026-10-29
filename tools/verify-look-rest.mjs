/**
 * tools/verify-look-rest.mjs
 * 29 Oct 2026 v4
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
ok("1f. one Library row, in slate, saying what is in it", /k-slate/.test(libRow?.querySelector(".kind-tile")?.className || "") && txt(libRow?.querySelector(".path-door__t")) === "Library" && /Classes, runs, the mind, your lists/.test(txt(libRow?.querySelector(".path-door__d"))));
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
const tiles = $$(".today-door--pick");
const tileLook = tiles.map(t => `${t.dataset.doorId}:${(t.querySelector(".kind-tile")?.className.match(KIND) || [])[1]}`);
ok("2pc. Free Home rendered (the session tiles)", tiles.length >= 5, txt(main).slice(0, 120));
ok("2a. each tile in its kind colour (strength amber, mobility and yoga violet, run blue, classes rose, Wellbeing green)",
   ["cardio-core-strength:amber", "mobility-conditioning:violet", "yoga:violet", "run:blue", "classes:rose", "wellbeing:green"].every(x => tileLook.includes(x)), JSON.stringify(tileLook));
ok("2b. a line icon on each, beside its words", tiles.every(t => t.querySelector(".kind-tile svg.line-icon") && txt(t.querySelector(".today-door__label"))));
ok("2c. Wellbeing has its own row", $('[data-door-id="wellbeing"]')?.classList.contains("today-door--wide"));
ok("2d. My exercises and Library in one card, each with its tile", $(".today-reference")?.classList.contains("look-card") && $$(".today-ref-row .kind-tile svg").length === 2);
ok("2e. Not sure? I'll pick something is still there", /Not sure\? I.ll pick something/.test(txt($(".today-unsure"))));
ok("2f. icons decorative; no emoji on Free Home", iconsDecorative() && !EMOJI.test(txt(main)), (txt(main).match(EMOJI) || [""])[0]);

// ── 3. THE FINISH SCREEN ────────────────────────────────────────────────
console.log("\nTEST 3 - after a session");
fixture("personal");
store.set("currentActivityEntry", { id: "f1", type: "workout", sessionType: "full", status: "complete", exercisesCount: 2, setsDone: 6, durationMins: 32, completedAt: new Date().toISOString() });
await go("reflect");
ok("3pc. the finish screen rendered", /That.s today done/.test(txt($("h1"))), txt(main).slice(0, 100));
ok("3a. a tick tile above the heading, decorative", !!$(".finish-head > .kind-tile svg[aria-hidden=true]"));
const stats = $$(".finish-stat");
ok("3b. the stats as number tiles: 2 moves, 6 sets, 32 min", JSON.stringify(stats.map(s => `${txt(s.querySelector(".finish-stat__n"))} ${txt(s.querySelector(".finish-stat__l"))}`)) === JSON.stringify(["2 moves", "6 sets", "32 min"]),
   stats.map(txt).join(" | "));
ok("3c. and still read as one line, \"2 moves · 6 sets · 32 min\"", txt($(".finish-stats")) === "2 moves · 6 sets · 32 min", `"${txt($(".finish-stats"))}"`);
ok("3d. moves and sets in the session's kind colour, minutes in blue", stats[0]?.classList.contains("k-amber") && stats[1]?.classList.contains("k-amber") && stats[2]?.classList.contains("k-blue"));
ok("3e. How did it feel? offers three", $$("[data-feel]").length === 3);
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
fixture("free");
await go("library");
const cats = $$(".library-category-card");
ok("5pc. the Library rendered", txt($("h1")) === "Library");
ok("5a. every kind of session is on the first page (no Start a session step)", cats.length >= 9 && !$("#lib-start-session-btn"), `${cats.length} categories`);
const catLook = Object.fromEntries(cats.map(c => [txt(c.querySelector(".library-category-label")), (c.querySelector(".kind-tile")?.className.match(KIND) || [])[1]]));
ok("5b. each in its kind colour (home and gym amber; run, walk, swim, cycle blue; yoga violet; mindful green)",
   catLook["At home"] === "amber" && catLook["At the gym"] === "amber" && ["Run", "Walk", "Swim", "Cycle"].every(k => catLook[k] === "blue") && catLook["Yoga / Pilates"] === "violet" && catLook["Mindful practice"] === "green",
   JSON.stringify(catLook));
ok("5c. Log what I did is still there", /Log what I did/.test(txt($("#lib-log-activity-btn"))));
ok("5d. the categories are named by their heading", $(".library-category-grid")?.getAttribute("aria-labelledby") === "lib-start-h" && txt($("#lib-start-h")) === "Start a session");
ok("5e. icons decorative; no emoji on the Library page", iconsDecorative() && !EMOJI.test(txt(main)), (txt(main).match(EMOJI) || [""])[0]);
click($('[data-guided="home"]')); await wait(30);
ok("5f. one tap: At home opens its sessions", /At home/.test(txt($("h1"))), txt($("h1")));
const back = $("#lib-back-btn");
ok("5g. its Back says Library", back?.getAttribute("aria-label") === "Back to Library");
click(back); await wait(30);
ok("5h. and returns to the Library page", txt($("h1")) === "Library" && $$(".library-category-card").length === cats.length);
click($('[data-guided="run"]')); await wait(60);
ok("5i. a direct category still starts its session (Run)", router.currentView === "running-session", router.currentView);

console.log(`\nLOOK-REST: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
