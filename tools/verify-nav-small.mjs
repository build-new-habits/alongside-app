/**
 * tools/verify-nav-small.mjs
 * 03 Oct 2026 v2
 *
 * v2 - W5-11 USUAL-LENGTH. 1d: 60 is today's length (availableTimeToday),
 *   and the usual is left as it was.
 *
 * 30 Sep 2026 v1
 *
 * W3-21 NAV-SMALL. The small routes the Wave 3 tracers tripped on
 * (findings §3, W3-21). Each one drives the real view.
 *
 *   1. Length and Where on the plan open a list; one tap picks. Length
 *      cycled 30 → 10 → 20 → 30 → 40 → 50 → 60 (2.13, 2.15, 2.16: five
 *      or six taps to reach 60, five to go from 20 to 10).
 *   2. Plan Home has a way to a run (2.4 found Run three taps deep in
 *      the Library).
 *   3. Looking at a plan does not change where the next one is for.
 *      2.4 looked at an outdoor plan, backed out, and later plans said
 *      Outside; Where on the plan wrote the default on every tap.
 *   4. The builder and the Run door do not reopen on old choices.
 *      2.16's builder reopened on a two-day-old preview whose Let's go
 *      led to "No workout selected".
 *   5. The Mobility door: no build-mode question (as Stretch), and the
 *      equipment line does not say "nothing saved" to somebody who told
 *      us bodyweight only.
 *   6. "Keep this one?" names a place that exists: there is no "Your own"
 *      on Plan Home any more.
 *   7. Swap on the plan is a list, not a cycle through sixteen moves.
 *   8. "I'll just log what I do" is under Something different today.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: /prefers-reduced-motion/.test(q), media: q,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(0), 0);
dom.window.requestAnimationFrame = globalThis.requestAnimationFrame;
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const { router: realRouter } = await import(B + "router.js");
const { CoachProposalView } = await import(B + "views/coach-proposal.js");
const { TodayView } = await import(B + "views/today.js");
const KW = await import(B + "views/know-what.js");
const SB = await import(B + "session-builder.js");
const gate = await import(B + "safety-gate.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

let navs = [];
let painter = null;
const nav = v => { navs.push(v); if (painter) painter(v); };
const rtr = { navigate: nav, back() {}, history: ["somewhere"] };
Object.defineProperty(globalThis, "router", { value: rtr, configurable: true, writable: true });
globalThis.window.router = rtr;
realRouter.navigate = nav;

const FULL_GYM = ["dumbbells-light", "dumbbells-medium", "dumbbells-heavy", "barbell", "bench-flat",
  "bench-adjustable", "pull-up-bar", "kettlebell-medium", "band-medium", "gym-membership"];

function fixture({ tier = "personal", home = ["band-light", "dumbbells-light"], gym = FULL_GYM, location, scores = {} } = {}) {
  localStorage.clear(); store.init();
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", tier);
  store.set("homeEquipment", home); store.set("gymEquipment", gym);
  store.set("equipment", [...new Set([...gym, ...home])]);
  if (location !== undefined) store.set("sessionLocation", location);
  store.set("conditions", []); store.set("conditionPainScores", scores);
  store.set("availableTime", "short");
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  navs = []; painter = null;
}
function proposal() {
  main.innerHTML = ""; navs = [];
  const view = CoachProposalView(rtr);
  view.mount(main);
  return view;
}
async function proposalSettled() {
  // The panel puts focus on its first button 50 ms after it opens; a
  // person does not tap inside that, so the tests wait it out.
  const v = proposal(); await wait(80); return v;
}
const rows  = () => [...main.querySelectorAll(".cp-plan__row")];
const names = () => rows().map(r => txt(r.querySelector(".cp-plan__name")));
const whereText = () => txt(main.querySelector("#cp-loc"));

// ── 1. LENGTH AND WHERE ARE LISTS ───────────────────────────────────────
console.log("\nTEST 1 - Length and Where open a list; one tap picks");
fixture({ location: "home" });
await proposalSettled();
ok("1pc. positive control: the plan is on screen with a Length control", rows().length > 0 && !!main.querySelector("#cp-time"));
const before = txt(main.querySelector("#cp-time"));
click(main.querySelector("#cp-time")); await wait(10);
const lens = [...main.querySelectorAll("[data-pick-time]")];
ok("1a. tapping Length shows the lengths, and does not change it by itself",
   lens.length === 6 && txt(main.querySelector("#cp-time")) === before, `${lens.length} choices; ${before} -> ${txt(main.querySelector("#cp-time"))}`);
ok("1b. in order, shortest first", lens.map(txt).join(" ") === "10 min 20 min 30 min 40 min 50 min 60 min", lens.map(txt).join(" "));
ok("1c. the current one is marked, and the control says it is open",
   lens.find(b => b.getAttribute("aria-pressed") === "true") && txt(lens.find(b => b.getAttribute("aria-pressed") === "true")) === "30 min" &&
   main.querySelector("#cp-time")?.getAttribute("aria-expanded") === "true");
click(main.querySelector('[data-pick-time="60"]')); await wait(10);
ok("1d. one tap reaches 60, and the plan is rebuilt for it",
   /60 min/.test(txt(main.querySelector("#cp-time"))) && store.get("availableTimeToday")?.cat === "open" && store.get("availableTime") !== "open" && !main.querySelector("[data-pick-time]"),
   txt(main.querySelector("#cp-time")));
ok("1e. the change is said, and focus is back on Length",
   /60 minutes/.test(txt(main.querySelector("#cp-plan-status"))) && document.activeElement?.id === "cp-time");
click(main.querySelector("#cp-loc")); await wait(10);
const locs = [...main.querySelectorAll("[data-pick-loc]")];
ok("1f. Where lists the three places", locs.length === 3 && /home/i.test(whereText()), locs.map(txt).join(" | "));
click(main.querySelector('[data-pick-loc="gym"]')); await wait(10);
ok("1g. one tap to the gym", /gym/i.test(whereText()) && !main.querySelector("[data-pick-loc]"), whereText());
click(main.querySelector("#cp-time")); await wait(10);
click(main.querySelector("#cp-time")); await wait(10);
ok("1h. REVERSAL: tapping Length again closes the list, nothing changed",
   !main.querySelector("[data-pick-time]") && /60 min/.test(txt(main.querySelector("#cp-time"))));

// ── 2. A RUN FROM PLAN HOME ─────────────────────────────────────────────
console.log("\nTEST 2 - Plan Home has a way to a run");
fixture();
main.innerHTML = ""; TodayView(rtr).mount(main); navs = [];
const runLink = [...main.querySelectorAll(".home-link")].find(b => /run/i.test(txt(b)));
ok("2a. a Go for a run link on Plan Home", !!runLink && txt(runLink) === "Go for a run", [...main.querySelectorAll(".home-link")].map(txt).join(" | "));
click(runLink); await wait(10);
ok("2b. one tap opens the Run door", navs.includes("running-session"), JSON.stringify(navs));

// ── 3. LOOKING DOES NOT CHANGE THE DEFAULT ──────────────────────────────
console.log("\nTEST 3 - looking at a plan does not change where the next one is for");
fixture({ location: "home" });
proposal();
click(main.querySelector("#cp-loc")); await wait(10);
click(main.querySelector('[data-pick-loc="outside"]')); await wait(10);
ok("3a. the plan is now for outside", /outside/i.test(whereText()), whereText());
ok("3b. and the default is still home", store.get("sessionLocation") === "home", String(store.get("sessionLocation")));
click(main.querySelector("#cp-preview-not-today")); await wait(10);
proposal();
ok("3c. backed out and came back: home again", /home/i.test(whereText()), whereText());
const diffLoc = main.querySelector('[data-different-loc="gym"]');
click(diffLoc); await wait(10);
ok("3d. Somewhere else changes this plan only", /gym/i.test(whereText()) && store.get("sessionLocation") === "home",
   `${whereText()} / ${store.get("sessionLocation")}`);
click(main.querySelector("#cp-preview-start")); await wait(2500);
ok("3e. REVERSAL: starting it at the gym makes the gym the default", store.get("sessionLocation") === "gym" && navs.length > 0,
   `${store.get("sessionLocation")} ${JSON.stringify(navs)}`);

fixture({ location: "home" });
painter = v => {
  main.innerHTML = "";
  if (v === "know-what") KW.KnowWhatView(rtr).mount(main);
  if (v === "coach-proposal") CoachProposalView(rtr).mount(main);
};
nav("know-what");
const choose = input => { if (!input) return; input.checked = true; input.dispatchEvent(new dom.window.Event("change", { bubbles: true })); };
choose(main.querySelector('input[name="kind"][value="cardio"]'));
choose(main.querySelector('input[name="place"][value="outside"]'));
main.querySelector(".kw-form")?.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));
await wait(10);
ok("3f. I know what I want: the plan is for where they said", navs.at(-1) === "coach-proposal" && /outside/i.test(whereText()), whereText());
ok("3g. and the default is still home", store.get("sessionLocation") === "home", String(store.get("sessionLocation")));
painter = null;
proposal();
ok("3h. the next plan is for home, not the outdoor one they only looked at", /home/i.test(whereText()) && store.get("requestedLocation") == null,
   `${whereText()} / requested ${store.get("requestedLocation")}`);

// ── 4. NO STALE BUILDER OR RUN DOOR ─────────────────────────────────────
console.log("\nTEST 4 - the builder and the Run door start fresh each time");
let _n = 0;
const fresh = path => import(B + path + `?nav=${++_n}`);
const paintMod = mod => { main.innerHTML = mod.render(); try { mod.onMount(); } catch (e) { console.log("        onMount threw", e.message); } };

fixture({ tier: "free", location: "home" });
let sbu = await fresh("views/session-builder-ui.js");
store.set("sessionBuilderPreselect", { type: "full", returnTo: "today" });
paintMod(sbu);
click(main.querySelector("#sb-location-continue-btn")); await wait(10);
click(main.querySelector('.sb-duration-btn[data-mins="15"]')); await wait(10);
click(main.querySelector("#sb-build-btn")); await wait(10);
ok("4pc. the Full Body builder asks how to build it", !!main.querySelector(".sb-buildmode-btn"));
click(main.querySelector('.sb-buildmode-btn[data-mode="coach"]')); await wait(1400);
ok("4a. positive control: the builder reached its preview", !!main.querySelector("#sb-go-btn"), txt(main).slice(0, 120));
ok("4b. the builder lets go of its choices when it is left", typeof sbu.onUnmount === "function");
try { sbu.onUnmount?.(); } catch {}
paintMod(sbu);
ok("4c. coming back later opens at the start, not on the old preview",
   !main.querySelector("#sb-go-btn") && !!main.querySelector(".sb-type-tile"), txt(main).slice(0, 120));

let run = await fresh("views/running-session.js");
fixture({ location: "home" });
paintMod(run);
click(main.querySelector('.ws-type-card[data-type="easy"]')); await wait(10);
ok("4d. positive control: the Run door asks how long", !!main.querySelector(".ws-duration-card"));
ok("4e. the Run door lets go of its choices when it is left", typeof run.onUnmount === "function");
try { run.onUnmount?.(); } catch {}
paintMod(run);
ok("4f. coming back opens on What kind of run, not on the old answer",
   !!main.querySelector('.ws-type-card[data-type="easy"]') && !main.querySelector(".ws-duration-card"), txt(main).slice(0, 120));

// ── 5. THE MOBILITY DOOR ────────────────────────────────────────────────
console.log("\nTEST 5 - Mobility: fewer taps, and a true line about equipment");
fixture({ tier: "free", home: [], gym: [], location: "home" });
store.set("equipment", []);
sbu = await fresh("views/session-builder-ui.js");
store.set("sessionBuilderPreselect", { type: "mobility", returnTo: "mobility-conditioning" });
paintMod(sbu);
click(main.querySelector("#sb-location-continue-btn")); await wait(10);
click(main.querySelector('.sb-duration-btn[data-mins="15"]')); await wait(10);
const eq = txt(main.querySelector(".coach-message-text"));
ok("5a. bodyweight only is said as bodyweight, not as nothing saved",
   !/haven't got any equipment saved/i.test(eq) && /bodyweight/i.test(eq), eq);
click(main.querySelector("#sb-build-btn")); await wait(10);
ok("5b. no second build question for mobility", !main.querySelector(".sb-buildmode-btn"), txt(main).slice(0, 120));
await wait(1400);
ok("5c. it goes straight to the plan", !!main.querySelector("#sb-go-btn"), txt(main).slice(0, 120));

// ── 6. KEEP THIS ONE, SOMEWHERE THAT EXISTS ─────────────────────────────
console.log("\nTEST 6 - the save block names a place on Plan Home");
const saveSrc = (await import("node:fs")).readFileSync(new URL("../js/save-block.js", import.meta.url), "utf8");
const live = saveSrc.split("\n").filter(l => !/^\s*(\*|\/\/)/.test(l)).join("\n");
ok("6a. no \"Your own\" in what it says", !/in Your own/.test(live));
ok("6b. it says where to find it", /I know what I want/.test(live));

// ── 7. SWAP IS A LIST ───────────────────────────────────────────────────
console.log("\nTEST 7 - Swap shows the alternatives as a list");
fixture({ location: "gym", scores: { shoulder: 8, "upper-back": 8 } });
await proposalSettled();
const idx = rows().findIndex(r => r.dataset.section === "main");
const swapBtn = () => main.querySelector(`[data-swap="${idx}"]`);
const orig = names()[idx];
click(swapBtn()); await wait(10);
const choices = [...main.querySelectorAll("[data-swap-pick]")];
ok("7a. tapping Swap shows a list, and leaves the row as it was",
   choices.length > 1 && names()[idx] === orig && swapBtn()?.getAttribute("aria-expanded") === "true",
   `${choices.length} choices; row ${orig} -> ${names()[idx]}`);
const scores = SB.soreScoresToday();
const { EXERCISES } = await import(B + "data/exercises/index.js");
const byId = new Map(EXERCISES.map(e => [e.id, e]));
const blocked = choices.map(b => byId.get(b.dataset.swapPick)).filter(ex => ex && SB.soreLevelFor(ex, scores).level === "blocked");
ok("7b. nothing on the list is sore today", choices.length > 0 && blocked.length === 0, blocked.map(e => e.name).join(", "));
const pick = choices[choices.length - 1];
const pickName = txt(pick.querySelector(".cp-swap__name")) || txt(pick);
click(pick); await wait(10);
ok("7c. one tap puts it on the plan, and the list closes",
   names()[idx] === pickName && !main.querySelector("[data-swap-pick]"), `${names()[idx]} vs ${pickName}`);
ok("7d. said by name, and focus is back on its Swap",
   new RegExp(`Swapped to ${pickName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(txt(main.querySelector("#cp-plan-status"))) &&
   document.activeElement === swapBtn(), `${txt(main.querySelector("#cp-plan-status"))} / focus ${document.activeElement?.outerHTML?.slice(0, 80)}`);
click(swapBtn()); await wait(10);
const back = main.querySelector('[data-swap-pick="__original"]');
ok("7e. the list offers the original back", !!back && new RegExp(orig.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).test(txt(back)), txt(back));
click(back); await wait(10);
ok("7f. REVERSAL: and it comes back", names()[idx] === orig, names()[idx]);
click(swapBtn()); await wait(10);
click(main.querySelector("[data-swap-pick]:not([data-swap-pick=\"__original\"])")); await wait(10);
const shown = names();
click(main.querySelector("#cp-preview-start")); await wait(2500);
ok("7g. the swapped plan is the one that starts",
   JSON.stringify((store.get("generatedSession")?.session?.exercises || []).map(e => e.name)) === JSON.stringify(shown));

// ── 8. I'LL JUST LOG WHAT I DO ──────────────────────────────────────────
console.log("\nTEST 8 - Something different today offers logging as you go");
fixture({ location: "gym" });
proposal();
const logBtn = main.querySelector('[data-different="log"]');
ok("8a. \"I'll just log what I do\" is there", !!logBtn && /I.ll just log what I do/.test(txt(logBtn)), txt(main.querySelector(".cp-different")));
click(logBtn); await wait(10);
ok("8b. it opens Make it up as I go", navs.includes("capture"), JSON.stringify(navs));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
