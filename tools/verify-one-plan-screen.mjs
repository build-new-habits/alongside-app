/**
 * tools/verify-one-plan-screen.mjs
 * 12 Oct 2026 v1
 *
 * A-2 ONE-PLAN-SCREEN (Stage AWARD), the Plan only (Graeme, 12 Oct: Free is
 * left alone). On the Plan, every door that asks for a kind of session
 * lands on Today's plan (coach-proposal) and the one player, as Home's
 * doors, I know what I want and the Library's body sessions (D-5) already
 * do. Measured on v658, three Plan doors still opened the older builder or
 * the core session's own player:
 *   - Mobility & Conditioning › Start a mobility session, and › Stretch
 *     (the builder's own preview);
 *   - the stretch arc's Start a stretch (the builder);
 *   - Library › At home › Core (the core session's own screens).
 *
 * Kept by design, and asserted so: "Build your own, move by move" (choosing
 * each move is a different job from a plan) and Free, whose doors are as
 * they were.
 *
 * The hand-over is the one D-5 made: requestedSessionType (and, from the
 * Library, requestedLocation), then the plan, through today's check-in when
 * there has not been one.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router: realRouter } = await import(B + "router.js");
const { MobilityConditioningView } = await import(B + "views/mobility-conditioning.js");
const { StretchArcView } = await import(B + "views/stretch-arc.js");
const library = await import(B + "views/library.js");
const { KnowWhatView } = await import(B + "views/know-what.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
let navs = [];
const rtr = { navigate: v => navs.push(v), back() {}, history: [] };
realRouter.navigate = rtr.navigate;
globalThis.window.router = rtr;
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

function fixture(tier = "personal", checkedIn = true) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "T"); store.set("tier", tier);
  if (checkedIn) {
    const key = new Date().toISOString().split("T")[0];
    store.set("checkinHistory", { [key]: { energy: 6, mood: 6, date: new Date().toDateString() } });
    store.set("lastCheckin", { energy: 6, mood: 6, date: new Date().toDateString(), timestamp: new Date().toISOString() });
  }
  store.set("arc", { active: true, aimId: "sport-without-flaring", startedAt: new Date(Date.now() - 9 * 864e5).toISOString(), strands: [] });
  navs = [];
}
const toPlan = () => navs.at(-1) === "coach-proposal" || (navs.at(-1) === "checkin" && store.get("pendingDoorRoute") === "coach-proposal");

function mc(sel, tier = "personal", checkedIn = true) {
  fixture(tier, checkedIn); main.innerHTML = "";
  MobilityConditioningView(rtr).mount(main); navs = [];
  click(main.querySelector(sel));
}

console.log("\nTEST 1 - Mobility & Conditioning, on the Plan");
mc("#mc-start-session");
ok("1a. Start a mobility session: Today's plan, a mobility session", toPlan() && store.get("requestedSessionType") === "mobility", JSON.stringify(navs));
ok("1b. and not the builder", !navs.includes("session-builder") && !store.get("sessionBuilderPreselect"));
mc("#mc-stretch");
ok("1c. Stretch: Today's plan, a stretch session", toPlan() && store.get("requestedSessionType") === "stretch", JSON.stringify(navs));
mc("#mc-stretch", "personal", false);
ok("1d. not checked in today: the check-in first, then the plan", navs.at(-1) === "checkin" && store.get("pendingDoorRoute") === "coach-proposal", JSON.stringify(navs));

console.log("\nTEST 2 - the stretch arc's Stretch now, on the Plan");
fixture(); main.innerHTML = "";
// "Stretch now" is on a stretch arc with no aim (the older, stretch-only arc).
store.set("arc", { active: true, startedAt: new Date(Date.now() - 9 * 864e5).toISOString(), zonesWorked: {} });
StretchArcView(rtr).mount(main); navs = [];
const sa = main.querySelector("#sa-stretch-btn");
ok("2pc. the button is there", !!sa);
click(sa);
ok("2a. Today's plan, a stretch session, not the builder", toPlan() && store.get("requestedSessionType") === "stretch" && !navs.includes("session-builder"), JSON.stringify(navs));

console.log("\nTEST 3 - Library › At home › Core, on the Plan");
function libCore(tier) {
  fixture(tier);
  main.innerHTML = library.render(); library.onMount();
  click(main.querySelector('[data-guided="home"]'));
  main.innerHTML = library.render(); library.onMount();
  const core = [...main.querySelectorAll("[data-target]")].find(b => b.dataset.target === "core-session");
  navs = []; click(core);
  return !!core;
}
ok("3pc. the Core row is there", libCore("personal"));
ok("3a. Today's plan, a core session at home", navs.at(-1) === "coach-proposal" && store.get("requestedSessionType") === "core" && store.get("requestedLocation") === "home", JSON.stringify(navs));

console.log("\nTEST 4 - kept by design");
fixture(); main.innerHTML = "";
KnowWhatView(rtr).mount(main);
ok("4a. Build your own, move by move still opens the builder (choosing each move)", !!main.querySelector('[data-kw-route="session-builder"]'));

console.log("\nTEST 5 - FREE IS LEFT ALONE");
mc("#mc-start-session", "free");
ok("5a. Free's Mobility & Conditioning opens the builder, as before", navs.at(-1) === "session-builder" && store.get("sessionBuilderPreselect")?.type === "mobility", JSON.stringify(navs));
mc("#mc-stretch", "free");
ok("5b. and its Stretch too", navs.at(-1) === "session-builder" && store.get("sessionBuilderPreselect")?.type === "stretch", JSON.stringify(navs));
libCore("free");
ok("5c. Free's Library Core opens the core session, as before", navs.at(-1) === "core-session", JSON.stringify(navs));

console.log(`\nVERIFY-ONE-PLAN-SCREEN: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
