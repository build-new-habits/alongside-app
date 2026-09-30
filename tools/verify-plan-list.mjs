/**
 * tools/verify-plan-list.mjs
 * 30 Sep 2026 v3
 *
 * v3 - W3-21 NAV-SMALL. Swap opens a list instead of cycling. Test 5
 *   now picks from each row's list, then takes the original back from
 *   the same list; the same three promises hold (the original can come
 *   back, nothing sore today is put on, a swap is said by name).
 *
 * v2 - W3-11 NOT-SURE-PICK. At the gym the coach now picks the Gym
 *   session, whose last row has no alternative, so the status left after
 *   the swap loop is "Nothing else fits here today". 5e read only that
 *   last status; it now reads the announcement after every swap, and
 *   still requires the polite live region and a swap named by name.
 *
 * 28 Sep 2026 v1
 *
 * SMOOTH-P2a. Today's plan names every exercise, and Start works on arrival.
 *
 * Graeme, 27 Sep, tracing the Plan route: "I'm not sold on what the plan
 * is when the coach proposes... too many decisions. It feels rough."
 * Spec §4.3.
 *
 * Measured on v542: the screen showed up to three cards -- a session
 * name, "25-35 mins", "7 movements" and a sentence -- and Start was
 * disabled until a card was tapped. Nobody could see what they were
 * agreeing to before they agreed to it.
 *
 * Driven through the REAL CoachProposalView, the real session builder
 * and the real safety gate. Asserts on what a person sees and taps, and
 * on what is stored when they start.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="main-content"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = (q) => ({ matches: /prefers-reduced-motion/.test(q), media: q,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { CoachProposalView } = await import(B + "views/coach-proposal.js");
const SB = await import(B + "session-builder.js");
const gate = await import(B + "safety-gate.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();

const FULL_GYM = ["dumbbells-light","dumbbells-medium","dumbbells-heavy","adjustable-dumbbells",
  "kettlebell-light","kettlebell-medium","kettlebell-heavy","barbell","ez-curl-bar",
  "band-light","band-medium","band-heavy","treadmill","exercise-bike","rowing-machine","elliptical",
  "bench-flat","bench-adjustable","pull-up-bar","dip-station","stability-ball","ab-wheel",
  "foam-roller","massage-gun","gym-membership"];

function fixture({ tier = "personal", home = [], gym = FULL_GYM, location, scores = {}, acks = 0 } = {}) {
  localStorage.clear(); store.init();
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("homeEquipment", home); store.set("gymEquipment", gym);
  store.set("equipment", [...new Set([...gym, ...home])]);
  if (location !== undefined) store.set("sessionLocation", location);
  store.set("conditionPainScores", scores);
  store.set("availableTime", "standard");
  store.set("liftLogEnabled", true);
  // A safety acknowledgement log at the current wording, past the taper.
  if (acks) {
    for (let i = 0; i < acks; i++) gate.recordAcknowledgement("fixture");
    gate.endGateSession();
  }
}

function mount() {
  const main = document.getElementById("main-content"); main.innerHTML = "";
  const navs = [];
  const view = CoachProposalView({ navigate: v => navs.push(v), back() {} });
  view.mount(main);
  return { main, navs, view };
}

const rows    = main => [...main.querySelectorAll(".cp-plan__row")];
const names   = main => rows(main).map(r => txt(r.querySelector(".cp-plan__name")));
const startEl = main => main.querySelector("#cp-preview-start");

// ── 0. FIXTURE REACH ────────────────────────────────────────────────────
console.log("\nTEST 0 - the fixture reaches the plan");
fixture({ acks: 5 });
let { main, navs } = mount();
ok("0a. the plan panel is open with a heading", !!main.querySelector("#cp-preview-panel.is-open h1"),
   txt(main).slice(0, 200));
ok("0b. and it lists exercises", rows(main).length > 0, `${rows(main).length} rows`);

// ── 1. EVERY EXERCISE NAMED ─────────────────────────────────────────────
console.log("\nTEST 1 - every exercise is on the screen before Start");
ok("1a. no choose-a-card step (no radio cards)", !main.querySelector('[role="radio"], .cp-preview-card'));
const groups = [...main.querySelectorAll(".cp-plan__group-title")].map(txt);
ok("1b. grouped Warm up / Main / Cool down, in that order, each with minutes",
   groups.length >= 2 && groups.every(g => /^(Warm up|Main|Cool down) · \d+ min$/.test(g)) &&
   ["Warm up", "Main", "Cool down"].filter(l => groups.some(g => g.startsWith(l)))
     .every((l, i, a) => i === 0 || groups.findIndex(g => g.startsWith(a[i - 1])) < groups.findIndex(g => g.startsWith(l))),
   JSON.stringify(groups));
const doses = rows(main).map(r => txt(r.querySelector(".cp-plan__dose")));
ok("1c. every row says how much: sets × reps, or a time", doses.length > 0 &&
   doses.every(d => /^\d+ × .+|^\d+ (sec|min)/.test(d) && !/undefined|NaN|null/.test(d)),
   JSON.stringify(doses));
ok("1d. no row leaks an internal id or category", rows(main).length > 0 && !rows(main).some(r => /[a-z]+-[a-z]+-[a-z]+/.test(txt(r.querySelector(".cp-plan__name")))));

// ── 2. START ON ARRIVAL, AND WHAT STARTS IS WHAT WAS SHOWN ──────────────
console.log("\nTEST 2 - Start works on arrival, and starts exactly the list shown");
ok("2a. Start is enabled on arrival", !!startEl(main) && !startEl(main).disabled && !startEl(main).hasAttribute("disabled"));
const shown = names(main);
startEl(main).click();
await wait(2500);
const gs = store.get("generatedSession");
ok("2b. one tap starts the session", navs.includes("workout"), JSON.stringify(navs));
ok("2c. the session that starts is the list that was shown, in order",
   JSON.stringify((gs?.session?.exercises || []).map(e => e.name)) === JSON.stringify(shown),
   `shown ${JSON.stringify(shown)}\n        started ${JSON.stringify((gs?.session?.exercises || []).map(e => e.name))}`);

// ── 3. WHERE DEFAULTS HONESTLY ──────────────────────────────────────────
console.log("\nTEST 3 - Where defaults to somewhere the person can train");
fixture({ acks: 5, home: [], gym: FULL_GYM });
({ main, navs } = mount());
ok("3a. kit only at a gym, nowhere recorded: Where is the gym",
   /gym/i.test(txt(main.querySelector("#cp-loc"))), txt(main.querySelector("#cp-loc")));
startEl(main).click(); await wait(2500);
ok("3b. Start remembers where they trained", store.get("sessionLocation") === "gym", String(store.get("sessionLocation")));
fixture({ acks: 5, home: ["band-light"], gym: [] });
({ main } = mount());
ok("3c. REVERSAL: kit only at home: Where is home", /home/i.test(txt(main.querySelector("#cp-loc"))));
fixture({ acks: 5, home: ["band-light"], gym: FULL_GYM, location: "home" });
({ main } = mount());
ok("3d. where they last trained wins", /home/i.test(txt(main.querySelector("#cp-loc"))));

// ── 4. LAST TIME ────────────────────────────────────────────────────────
console.log("\nTEST 4 - the Plan shows what they lifted last time");
fixture({ acks: 5, location: "gym" });
({ main } = mount());
const firstMain = rows(main).find(r => r.dataset.section === "main");
const mainId = firstMain?.dataset.exerciseId;
store.logLift(mainId, { weight: 40, reps: 8 });
// Builds are not deterministic, so the SAME plan is redrawn (Harder
// redraws without rebuilding) rather than a new one mounted.
main.querySelector('[data-different="harder"]')?.click(); await wait(20);
const again = rows(main).find(r => r.dataset.exerciseId === mainId);
ok("4a. \"Last: 40 kg\" on the row they logged", !!again && /Last: 40 kg/.test(txt(again)), txt(again));
ok("4b. and on no row they did not", rows(main).filter(r => /Last:/.test(txt(r))).length === 1);

// ── 5. SWAP ─────────────────────────────────────────────────────────────
console.log("\nTEST 5 - swap offers alternatives, and never offers something sore today");
fixture({ acks: 5, location: "gym", scores: { shoulder: 8, "upper-back": 8 } });
({ main, navs } = mount());
await wait(80);   // the panel's own first-button focus, 50 ms after opening
// The original plan is the builder's (its own gates cover selection).
// What a SWAP puts there is this screen's: nothing introduced by a swap
// may be blocked by today's sore answer.
const originalIds = new Set(rows(main).map(r => r.dataset.exerciseId));
const blockedShown = () => rows(main).filter(r => {
  if (originalIds.has(r.dataset.exerciseId)) return false;
  const ex = { affectsAreas: (r.dataset.areas || "").split(",").filter(Boolean) };
  return SB.soreLevelFor(ex, SB.soreScoresToday()).level === "blocked";
}).map(r => txt(r.querySelector(".cp-plan__name")));
ok("5a. the fixture has something sore to avoid", Object.keys(SB.soreScoresToday()).length === 2);
const swapBtns = () => [...main.querySelectorAll("[data-swap]")];
ok("5b. every row has a swap", rows(main).length > 0 && swapBtns().length === rows(main).length, `${swapBtns().length} swaps, ${rows(main).length} rows`);
let cycled = false, blockedEver = [], swappedIn = 0; const announced = [];
for (let r = 0; r < rows(main).length; r++) {
  const before = names(main)[r];
  const picks = () => [...main.querySelectorAll("[data-swap-pick]")];
  swapBtns()[r]?.click(); await wait(5);
  announced.push(txt(main.querySelector("#cp-plan-status")));
  const alts = picks().filter(b => b.dataset.swapPick !== "__original");
  if (!alts.length) continue;
  for (const alt of alts) {
    const id = alt.dataset.swapPick;
    main.querySelector(`[data-swap-pick="${id}"]`)?.click(); await wait(5);
    announced.push(txt(main.querySelector("#cp-plan-status")));
    blockedEver.push(...blockedShown());
    if (names(main)[r] !== before) swappedIn++;
    swapBtns()[r]?.click(); await wait(5);
  }
  main.querySelector('[data-swap-pick="__original"]')?.click(); await wait(5);
  announced.push(txt(main.querySelector("#cp-plan-status")));
  if (names(main)[r] === before) cycled = true;
}
ok("5c. the original can always be taken back from the list", cycled);
ok("5d. no swap ever put a sore-today exercise on the plan", swappedIn > 0 && blockedEver.length === 0, JSON.stringify([...new Set(blockedEver)]));
const live = main.querySelector("#cp-plan-status");
ok("5e. a swap is announced by name", !!live && live.getAttribute("aria-live") === "polite" && announced.some(a => /Swapped to|Back to/.test(a)), [...new Set(announced)].slice(0, 3).join(" | "));
const shownAfterSwap = names(main);
startEl(main).click(); await wait(2500);
ok("5f. the swapped plan is the one that starts",
   JSON.stringify((store.get("generatedSession")?.session?.exercises || []).map(e => e.name)) === JSON.stringify(shownAfterSwap));

// ── 6. THE SAFETY NOTE, ONCE ────────────────────────────────────────────
console.log("\nTEST 6 - when the note is due, it is on the plan, ticked once");
fixture({ acks: 0, location: "gym" });
({ main, navs } = mount());
const box = main.querySelector("#cp-ack-box");
ok("6a. due: the full note and a tick-box are on the plan", !!box && /stop that movement/i.test(txt(main.querySelector(".cp-dock"))));
startEl(main).click(); await wait(300);
ok("6b. Start unticked explains, and does not start", !navs.includes("workout") && /confirm you have read this/i.test(txt(main.querySelector("#cp-ack-error"))));
if (box) { box.checked = true; box.dispatchEvent(new dom.window.Event("change")); }
startEl(main).click(); await wait(2500);
const log = store.get("safetyAckLog") || [];
ok("6c. ticked: it starts, and the acknowledgement is recorded from the plan",
   navs.includes("workout") && log.length === 1 && log[0].surface === "coach-plan", JSON.stringify(log));
ok("6d. and the player will not ask again for this session", gate.isGateDue() === false);
fixture({ acks: 5, location: "gym" });
({ main } = mount());
ok("6e. REVERSAL: not due: no tick-box, and the short line is still there",
   !main.querySelector("#cp-ack-box") && /hurts/i.test(txt(main.querySelector(".cp-dock"))));

// ── 7. SOMETHING DIFFERENT TODAY ────────────────────────────────────────
console.log("\nTEST 7 - Something different today changes the plan and shows it");
fixture({ acks: 5, location: "gym" });
({ main, navs } = mount());
const diff = main.querySelector("details.cp-different");
ok("7a. offered on the Plan", !!diff && /Something different today/.test(txt(diff.querySelector("summary"))));
const setsOf = () => rows(main).filter(r => r.dataset.section === "main").map(r => Number(r.dataset.sets || 0));
const baseSets = setsOf();
main.querySelector('[data-different="harder"]')?.click(); await wait(20);
ok("7b. Harder adds a set to every main exercise", baseSets.length > 0 && setsOf().every((s, i) => s === baseSets[i] + 1),
   `${JSON.stringify(baseSets)} -> ${JSON.stringify(setsOf())}`);
main.querySelector('[data-different="easier"]')?.click(); await wait(20);
main.querySelector('[data-different="easier"]')?.click(); await wait(20);
ok("7c. Easier takes one off, never below one", baseSets.length > 0 && setsOf().every((s, i) => s === Math.max(1, baseSets[i] - 1)),
   `${JSON.stringify(baseSets)} -> ${JSON.stringify(setsOf())}`);
const nameBefore = txt(main.querySelector(".cp-plan__title"));
const kind = main.querySelector("[data-different-kind]");
const kindId = kind?.dataset.differentKind;
kind?.click(); await wait(20);
ok("7d. a different kind rebuilds and shows the new plan, without starting",
   store.get("requestedSessionType") === kindId && txt(main.querySelector(".cp-plan__title")) !== nameBefore && !navs.includes("workout"),
   `${nameBefore} -> ${txt(main.querySelector(".cp-plan__title"))}, requested ${store.get("requestedSessionType")}`);
ok("7e. and the coach says it was asked for", /you asked for/i.test(txt(main.querySelector(".cp-plan__sentence"))));
main.querySelector('[data-different="shorter"]')?.click(); await wait(20);
ok("7f. Shorter makes it a 20-minute plan", store.get("availableTime") === "quick" && /20 min/.test(txt(main.querySelector("#cp-time"))));
main.querySelector('[data-different="class"]')?.click(); await wait(20);
ok("7g. A class instead goes to classes", navs.includes("classes"), JSON.stringify(navs));

// ── 8. FREE ─────────────────────────────────────────────────────────────
console.log("\nTEST 8 - free sees one simple suggestion");
fixture({ tier: "free", acks: 5, location: "gym" });
({ main } = mount());
const fid = rows(main).find(r => r.dataset.section === "main")?.dataset.exerciseId;
store.logLift(fid, { weight: 40, reps: 8 });
({ main, navs } = mount());
ok("8a. the list is shown", rows(main).length > 0);
ok("8b. no swaps, no Something different, no weights",
   !main.querySelector("[data-swap]") && !main.querySelector("details.cp-different") && !/Last:/.test(txt(main)));
const pick = main.querySelector("#cp-preview-not-today");
ok("8c. \"Pick something else\" goes Home", /Pick something else/.test(txt(pick)) && (pick.click(), navs.includes("today")), JSON.stringify(navs));

console.log("");
if (fails) { console.log(`PLAN-LIST: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`PLAN-LIST: all ${passes} assertions pass\n`);
process.exit(0);
