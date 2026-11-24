/**
 * tools/verify-physio-back.mjs
 * 24 Nov 2026 v1
 *
 * P-44 THE PHYSIO LINK, S4 BACK (spec docs/specs/alongside_physio-link_23nov2026_v1.md;
 * views/plan-link-back.js v1, app.js v17, plan-import.js v5, prescribed.js
 * v1.17, data/plan-link.js v2). The link a physio or trainer sent back,
 * made by the website's own page logic (the shared codec), opened in the app.
 *
 *   1  Free: the Plan's; nothing kept.
 *   2  What they changed: each change in words, all ticked, their line,
 *      the h1 focused.
 *   3  Choosing: the button says what it will do; none ticked, nothing to
 *      press; the count said.
 *   4  Use: only what was chosen; the old list kept (ownPrevious); said.
 *   5  The same link again: nothing to change (no doubles).
 *   6  Their notes: kept only with the health consent, and said when not.
 *   7  Keep my list: nothing changed, nothing kept.
 *   8  Not right: a link cut short; the link that was sent out.
 *   9  Pasted into Add a plan you already have: opens it; a plan still reads.
 *  10  My exercises: Put back my old list, asked once; Cancel; Free never.
 *  11  Opened in a browser where nobody is set up: said, Copy this link.
 *  12  app.js takes the code out of the address before anything else.
 *
 * Red on alongside-v731.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div><nav id="bottom-nav"></nav></div><div id="sr-announcer"></div>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "SVGElement"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(Date.now()), 0);
globalThis.history = dom.window.history; globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const PL = await import(B + "data/plan-link.js");
const BACK = await import(B + "views/plan-link-back.js");
const { PlanImportView } = await import(B + "views/plan-import.js");
const PX = await import(B + "views/prescribed.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);
const fs = await import("node:fs");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${String(detail).slice(0, 400)}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const wait = ms => new Promise(r => setTimeout(r, ms));
const click = async (el, ms = 40) => { el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true })); await wait(ms); };
const tick = async (el, v) => { el.checked = v; el.dispatchEvent(new dom.window.Event("change", { bubbles: true })); await wait(40); };
const q = s => main.querySelector(s);
let navs = [];
const rtr = { history: ["x"], navigate: v => navs.push(v), back() {} };
globalThis.window.router = rtr; globalThis.router = rtr;
let copied = null;
Object.defineProperty(dom.window.navigator, "clipboard", { value: { writeText: async t => { copied = t; } }, configurable: true });

const OWN = [
  { id: "px-1-0", exerciseId: "glute-bridge", name: "Glute bridge", sets: 3, reps: "12", group: "Gym A", notes: "squeeze at the top", active: true },
  { id: "px-1-1", name: "Clamshell", sets: 2, reps: "15 each side", group: "Gym A", active: true },
  { id: "px-2-0", name: "Cat-cow", sets: 1, reps: "10", group: "Evening", active: true },
];
const OUT = PL.outFromOwn(OWN, { at: "2026-11-23T20:00:00.000Z" });
const BACKPLAN = { t: "back", at: "2026-11-24T10:00:00.000Z", of: OUT.at, say: "Progress the bridge, add a side plank.", lists: [{ g: "Gym A", x: [
  { i: "px-1-0", n: "Glute bridge", l: "glute-bridge", s: 3, r: "15" },
  { n: "Side plank", s: 3, r: "20 seconds", nt: "on your knees to start" },
] }] };
const backLink = "https://app.buildnewhabits.co.uk/#back=" + await PL.encodePlan(BACKPLAN);
const outLink = "https://buildnewhabits.co.uk/edit-plan/#" + await PL.encodePlan(OUT);

function fixture({ tier = "personal", health = true } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  if (!health) store.set("consent.health", { given: false, at: null, version: null, withdrawnAt: new Date().toISOString() });
  store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", tier);
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("prescribedExercises", OWN.map(x => ({ ...x })));
  navs = []; copied = null;
}
const open = async (code = backLink.split("#")[1]) => { rtr.planBack = code; main.innerHTML = ""; await BACK.PlanLinkBackView(rtr).mount(main); await wait(30); };
const names = () => (store.get("prescribedExercises") || []).map(e => `${e.name} ${e.sets}x${e.reps}`).join(" | ");

console.log("\nTEST 1 - Free");
fixture({ tier: "free" }); await open();
ok("1a. the Plan's, and nothing kept", /part of the Plan\. Nothing from the link has been kept\./.test(txt(main)) && store.get("ownPrevious") === null && names().includes("Clamshell"));
ok("1b. the code is not left on the router", rtr.planBack === null);

console.log("\nTEST 2 - what they changed");
fixture(); await open();
ok("2a. the h1, focused", txt(q("h1")) === "What your physio or trainer changed" && document.activeElement === q("h1"));
ok("2b. their line", /They wrote\s*Progress the bridge, add a side plank\./.test(txt(q(".plb-say"))));
const items = () => [...main.querySelectorAll("[data-change]")].map(c => `${c.checked ? "x" : " "} ${txt(c.closest("label"))}`);
ok("2c. each change in words, all ticked", JSON.stringify(items()) === JSON.stringify(["x Changed. Glute bridge: 3 × 12 → 3 × 15", "x Added to Gym A: Side plank, 3 × 20 seconds. Note: on your knees to start", "x Taken out of Gym A: Clamshell"]), JSON.stringify(items()));
ok("2d. a list they didn't send back is not touched", !/Cat-cow/.test(txt(main)));
ok("2e. when, in words", /from 23 November, sent back on 24 November/.test(txt(main)));

console.log("\nTEST 3 - choosing");
ok("3a. all ticked: Use all of it; Keep my list", txt(q("#plb-use")) === "Use all of it" && !!q("#plb-keep"));
await tick(q("#plb-c-2"), false);
ok("3b. one unticked: Use the 2 ticked; focus stays; said", txt(q("#plb-use")) === "Use the 2 ticked" && document.activeElement === q("#plb-c-2"));
await wait(60); ok("3c. the count said", txt(q("#plb-status")) === "2 of 3 ticked.");
await tick(q("#plb-c-0"), false); await tick(q("#plb-c-1"), false);
ok("3d. none ticked: nothing to press, and why", q("#plb-use").disabled && txt(q("#plb-use")) === "Tick at least one to use");

console.log("\nTEST 4 - use");
fixture(); await open();
await tick(q("#plb-c-2"), false);
await click(q("#plb-use"));
ok("4a. only what was chosen: bridge 3x15, side plank added, the clamshell kept", names() === "Glute bridge 3x15 | Clamshell 2x15 each side | Cat-cow 1x10 | Side plank 3x20 seconds", names());
ok("4b. the old list kept", JSON.stringify(store.get("ownPrevious")?.list) === JSON.stringify(OWN));
ok("4c. said, with the way back; focus on the h1", /2 changes used\. Your list as it was is kept for 30 days: My exercises › Put back my old list\./.test(txt(main)) && document.activeElement === q("h1"));
ok("4d. the person's own note is kept", store.get("prescribedExercises")[0].notes === "squeeze at the top");
await click(q("#plb-own")); ok("4e. My exercises", navs.at(-1) === "prescribed");

console.log("\nTEST 5 - the same link again");
await open();
ok("5a. only what was left: the clamshell (no doubles)", JSON.stringify(items()) === JSON.stringify(["x Taken out of Gym A: Clamshell"]), JSON.stringify(items()));
await click(q("#plb-use")); await open();
ok("5b. all used: Nothing to change", txt(q("h1")) === "Nothing to change" && /already match what they sent back for your list from 23 November/.test(txt(main)));
ok("5c. one side plank, not two", (store.get("prescribedExercises")).filter(e => e.name === "Side plank").length === 1);

console.log("\nTEST 6 - their notes");
fixture(); await open(); await click(q("#plb-use"));
ok("6a. with the health consent: kept", store.get("prescribedExercises").find(e => e.name === "Side plank").notes === "on your knees to start");
fixture({ health: false }); await open();
ok("6b. without it: said", /Their notes are shown here but not kept/.test(txt(main)));
await click(q("#plb-use"));
ok("6c. ... and not kept", !("notes" in store.get("prescribedExercises").find(e => e.name === "Side plank")));

console.log("\nTEST 7 - Keep my list");
fixture(); await open(); await click(q("#plb-keep"));
ok("7a. nothing changed, nothing kept, My exercises", names().includes("Clamshell") && !names().includes("Side plank") && store.get("ownPrevious") === null && navs.at(-1) === "prescribed");

console.log("\nTEST 8 - not right");
fixture(); await open("back=v1.abcdefghij");
ok("8a. cut short: said plainly", /This link is not complete\. Ask for it to be sent again\./.test(txt(main)));
await open(outLink);
ok("8b. the link they sent: no changes yet, said", /This is the link you sent, so it has no changes in it yet/.test(txt(main)));

console.log("\nTEST 9 - pasted");
fixture(); main.innerHTML = ""; const pi = PlanImportView(rtr); pi.mount(main); await wait(30);
const ta = () => main.querySelector("#pi-text");
ta().value = "Here you go: " + backLink; await click(q("#pi-read"));
ok("9a. a back link pasted: opens What they changed, with it", navs.at(-1) === "plan-link-back" && typeof rtr.planBack === "string" && rtr.planBack.includes("back=v1."));
await open(rtr.planBack);
ok("9b. ... which reads it", txt(q("h1")) === "What your physio or trainer changed");
fixture(); main.innerHTML = ""; PlanImportView(rtr).mount(main); await wait(30);
ta().value = "Monday\nGlute bridge 3 x 12"; await click(q("#pi-read"));
ok("9c. a plan still reads as a plan", !navs.includes("plan-link-back") && /I read 1 exercise/.test(txt(main)), txt(main).slice(0, 120));

console.log("\nTEST 10 - Put back my old list");
const px = () => { main.innerHTML = PX.render(); PX.onMount(); };
fixture(); px();
ok("10a. nothing kept: not offered", !q("#px-prev-btn"));
await open(); await click(q("#plb-use")); px();
ok("10b. offered, with the date it is kept until", !!q("#px-prev-btn") && /Kept until \d+ \w+, in case you want it back\./.test(txt(q(".px-prev"))));
await click(q("#px-prev-btn"));
ok("10c. asked once, focus on Yes", /Put back your old list\? Your list now will be replaced by it\./.test(txt(q(".px-prev"))) && document.activeElement === q("#px-prev-yes"));
await click(q("#px-prev-no"));
ok("10d. Cancel: nothing changed, focus back", names().includes("Side plank") && document.activeElement === q("#px-prev-btn"));
await click(q("#px-prev-btn")); await click(q("#px-prev-yes"));
ok("10e. Yes: the old list back, nothing kept, said, focus on the heading", names() === "Glute bridge 3x12 | Clamshell 2x15 each side | Cat-cow 1x10" && store.get("ownPrevious") === null && /Your list is as it was before the changes\./.test(txt(q(".px-prev"))) && document.activeElement === q("#px-prev-h"), names());
fixture(); store.setOwnPrevious(OWN); store.set("tier", "free"); px();
ok("10f. not tier-gated: their own list kept from the Plan is still theirs to put back on Free (verify-tiergh 14)", !!q("#px-prev-btn"));

console.log("\nTEST 11 - nobody set up here");
let setUp = false;
BACK.showNotHere(main, backLink, () => { setUp = true; });
ok("11a. said plainly, with the iPhone's way", /Alongside: Move isn’t set up in this browser/.test(txt(main)) && /paste it into My exercises › Add a plan you already have/.test(txt(main)) && document.activeElement === q("h1"));
await click(q("#plb-copy"));
ok("11b. Copy this link: the whole link, said", copied === backLink && /Link copied/.test(txt(q("#plb-status"))));
await click(q("#plb-setup")); ok("11c. or set up here instead", setUp);

console.log("\nTEST 12 - app.js");
const app = fs.readFileSync(new URL("../js/app.js", import.meta.url), "utf8");
const at = s => app.indexOf(s);
ok("12a. the code taken out of the address before any screen", at("history.replaceState(history.state, '', location.pathname + location.search)") > 0 && at("history.replaceState(history.state, '', location.pathname + location.search)") < at("router.navigate('plan-link-back')") && at("router.navigate('plan-link-back')") < at("await router.navigate(firstView);"));
ok("12b. nobody set up: showNotHere; set up: What they changed; and once open, a tapped link too", /if \(isOnboarded\) \{ router\.planBack = backCode;/.test(app) && /m\.showNotHere\(/.test(app) && /addEventListener\('hashchange'/.test(app));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
