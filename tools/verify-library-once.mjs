/**
 * tools/verify-library-once.mjs
 * 04 Oct 2026 v1
 *
 * D-5 LIBRARY-ONCE. Graeme, device test, 04 Oct, going through the Library:
 * "I'm asked home or gym twice" and "the look of the coach plan (where I can
 * switch out ...) isn't the same". At home / At the gym already say where;
 * their body sessions opened the step-by-step builder, which asked again
 * and ended on its own older plan.
 *
 * Through the real router, both tiers, every body session in At home and
 * At the gym:
 *   1. One tap opens Today's plan (the coach's plan screen), not the builder.
 *   2. Nothing asks At home or At the gym again on the way.
 *   3. The plan is for the place the Library said (its Where), and the kind
 *      tapped ("You asked for strength, upper body ..."; Focus on the Plan).
 *   4. It is the same plan screen: grouped rows, each exercise a button that
 *      opens its sheet; Swap on the Plan; Start.
 *   5. The place is read once: the next plan, from Home, is back to the
 *      default.
 *   6. The other cards (Core at home, Cardio, My programme) go where they
 *      went.
 *   7. The category page is in the LOOK cards: kind tiles with line icons,
 *      a chevron, no emoji.
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
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };
dom.window.confirm = () => false; globalThis.confirm = () => false;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
globalThis.window.router = router;
Object.defineProperty(globalThis, "router", { value: router, configurable: true, writable: true });
const gate = await import(B + "safety-gate.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${String(detail).slice(0, 400)}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const $ = s => main.querySelector(s), $$ = s => [...main.querySelectorAll(s)];
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = async el => { el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true })); await wait(80); };

const GYM = ["dumbbells-medium", "barbell", "bench-flat", "kettlebell-medium", "band-light", "gym-membership"];
const HOME = ["dumbbells-light", "band-light"];
function fixture(tier) {
  localStorage.clear(); store.init(); agreed(store);
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("homeEquipment", HOME); store.set("gymEquipment", GYM); store.set("equipment", [...HOME, ...GYM]);
  store.set("sessionLocation", "home");
  store.set("conditions", []); store.set("conditionPainScores", {});
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  router.history = []; router.currentView = null;
}
const view = () => router.currentView;
// Anything that would ask where again: the builder's step, or a question naming both places.
const asksWhere = () => !!$(".sb-location-btn") || /home or (at )?the gym\?|where are you training/i.test(txt(main));

const CARDS = {
  home: [["Full Body", "full"], ["Upper body", "upper"], ["Lower body", "lower"], ["Mobility", "mobility"]],
  gym:  [["Core", "core"], ["Upper body", "upper"], ["Lower body", "lower"], ["Glute Focus", "glute"], ["Full Body", "full"]],
};
const WORDS = { full: "strength, full body", upper: "strength, upper body", lower: "strength, lower body", glute: "strength, glutes", core: "core", mobility: "mobility" };

for (const tier of ["free", "personal"]) {
  for (const place of ["home", "gym"]) {
    for (const [label, type] of CARDS[place]) {
      fixture(tier);
      await router.navigate("library"); await wait(60);
      await click($(`[data-guided="${place}"]`));
      const card = $$("[data-target]").find(b => txt(b.querySelector(".library-session-label")) === label);
      const tag = `${tier} · ${place} · ${label}`;
      if (!card) { ok(`${tag}: the card is there`, false, txt(main).slice(0, 200)); continue; }
      let asked = asksWhere();
      await click(card);
      await wait(200);
      asked = asked || asksWhere();
      ok(`${tag}: one tap opens Today's plan, not the builder`, view() === "coach-proposal" && !!$("#cp-preview-panel.is-open"), `${view()}`);
      ok(`${tag}: nothing asks home or gym again`, !asked);
      const where = $("#cp-loc");
      ok(`${tag}: the plan is for ${place === "gym" ? "the gym" : "home"}`, new RegExp(place === "gym" ? "gym" : "home", "i").test(txt(where)), txt(where));
      ok(`${tag}: and for what was tapped`, txt($(".cp-plan__sentence")).includes(`You asked for ${WORDS[type]}`), txt($(".cp-plan__sentence")));
      ok(`${tag}: the same plan screen: rows that open their exercise, ${tier === "personal" ? "Swap, " : ""}Start`,
         $$(".cp-plan__row").length > 0 && $$(".cp-plan__row [data-preview]").length === $$(".cp-plan__row").length &&
         (tier === "personal" ? $$("[data-swap]").length > 0 : true) && !!$("#cp-preview-start"));
    }
  }
}

// 5. Read once.
console.log("\nTEST 5 - the place is read once");
fixture("personal");
await router.navigate("library"); await wait(60);
await click($('[data-guided="gym"]'));
await click($$("[data-target]").find(b => txt(b.querySelector(".library-session-label")).startsWith("Upper body")));
await wait(200);
ok("5pc. the Library's plan is at the gym", /gym/i.test(txt($("#cp-loc"))));
store.set("requestedSessionType", null);
await router.navigate("coach-proposal"); await wait(200);
ok("5. the next plan, opened from elsewhere, is back where they usually train (home)", /home/i.test(txt($("#cp-loc"))), txt($("#cp-loc")));

// 7. The look.
console.log("\nTEST 7 - the category page in the LOOK cards");
fixture("personal");
await router.navigate("library"); await wait(60);
await click($('[data-guided="gym"]'));
const rows = $$(".library-session-card");
ok("7a. every session row has its kind tile with a line icon, and a chevron", rows.length > 4 &&
   rows.every(r => r.querySelector(".kind-tile svg[aria-hidden=true]") && r.querySelector(".library-session-chev svg")));
ok("7b. no emoji on the page", !/\p{Extended_Pictographic}/u.test(txt(main)), txt(main).slice(0, 200));
ok("7c. the title carries its tile", !!$("h1.library-sub-title .kind-tile svg"));

// 6. The other cards.
console.log("\nTEST 6 - the other cards go where they went");
fixture("personal");
await router.navigate("library"); await wait(60);
if ($("#lib-back-btn")) await click($("#lib-back-btn"));   // the Library page, not the last category
await click($('[data-guided="home"]'));
const core = $$("[data-target]").find(b => txt(b.querySelector(".library-session-label")).startsWith("Core"));
ok("6a. Core at home still opens the core session", core?.dataset.target === "core-session");
const cardio = $$("[data-target]").find(b => txt(b.querySelector(".library-session-label")).startsWith("Cardio"));
ok("6b. Cardio at home still opens the walk", cardio?.dataset.target === "walk-session");
await click($("#lib-back-btn"));
await click($('[data-guided="gym"]'));
ok("6c. My programme still opens the programme", $$("[data-target]").find(b => txt(b.querySelector(".library-session-label")).startsWith("My programme"))?.dataset.target === "gym-programme");

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
