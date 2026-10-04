/**
 * tools/verify-bad-day-builder.mjs
 * 04 Oct 2026 v2
 *
 * v2 - W6-1. Re-pointed: the builder asks the Bad-day choice first, and
 *   Something gentler then the coach Start plays the gentle plan (it
 *   previewed the plan itself). The assertions on what plays are unchanged.
 *
 * 02 Oct 2026 v1
 *
 * W5-1 BAD-DAY-BUILDER (Wave 5 persona trace: 2.14, 2.16; unsafe).
 *
 * On a Bad day the builder (Cardio, Core & Strength) showed the gentle
 * plan, but the gentle plan was never stored, so "Let's go" opened the
 * player on whatever plan was stored before: the morning after a part-way
 * Full Body, Pistol Squat and Nordic Curl on a Bad knee; with nothing
 * stored, "No workout selected" and a Back that looped.
 *
 * Through the real router:
 *   1. Knee Bad, yesterday's half-done Full Body stored: builder -> Let's
 *      go -> the first card is the gentle plan's; no card is the old plan's.
 *   2. Knee Bad, nothing stored: never "No workout selected".
 *   3. Knee Bad, an ordinary plan stored (built before it turned Bad),
 *      opened straight in the player: the Bad-day choice, not the plan.
 *      Something gentler from there reaches the gentle plan.
 *   4. Controls: Quite sore builds and plays an ordinary plan.
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

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
globalThis.window.router = router;
Object.defineProperty(globalThis, "router", { value: router, configurable: true, writable: true });
const gate = await import(B + "safety-gate.js");
const RF = await import(B + "data/red-flag.js");
const SB = await import(B + "session-builder.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const $ = s => main.querySelector(s);
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));

function fixture(score) {
  localStorage.clear(); store.init(); agreed(store);
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Robin"); store.set("tier", "free");
  store.set("equipment", ["dumbbells"]); store.set("homeEquipment", ["dumbbells"]);
  store.set("conditions", ["knee"]);
  store.set("conditionPainScores", score == null ? {} : { knee: score });
  store.set("redFlag", { screenedAt: new Date().toISOString(), areas: ["knee"], textVersion: RF.RED_FLAG_VERSION, level: null, flaggedAt: null, clearedAt: null });
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  router.history = []; router.currentView = null;
}
async function go(view) { await router.navigate(view); await wait(40); }
const onView = () => router.currentView;

/** An ordinary Full Body plan, stored as the builder stores it; returns the move names. */
function storeOrdinary(daysAgo) {
  const pain = store.get("conditionPainScores");
  store.set("conditionPainScores", {});
  const s = SB.buildSession({ sessionType: "full", durationMins: 30 });
  store.set("conditionPainScores", pain);
  const when = new Date(Date.now() - daysAgo * 86400000).toISOString();
  store.set("generatedSession", { ...store.get("generatedSession"), builtAt: when });
  return (s?.exercises || []).map(e => e.name);
}
const GENTLE = () => SB.buildSession({ sessionType: "full", durationMins: 20 });

// W6-1: the builder asks first now; Something gentler hands to the coach's
// gentle plan, whose Start plays it (one gentle plan whichever door).
async function builderGo() {
  await go("today");
  await go("session-builder");
  const preview = txt(main);
  click($('[data-bad-day="adapt"]')); await wait(80);
  const startBtn = [...main.querySelectorAll("button")].find(b => /^Start\b/.test(txt(b)) && !b.disabled);
  click(startBtn); await wait(1200);
  return preview;
}
const firstCard = () => txt(main).slice(0, 400);

// ── 1. A STALE PLAN STORED ──────────────────────────────────────────────
console.log("\nTEST 1 - knee Bad, yesterday's half-done Full Body stored");
fixture(8);
const stale = storeOrdinary(1);
store.set("usingGeneratedSession", false);
const kept = JSON.parse(JSON.stringify(store.get("generatedSession")));
const gentleFirst = GENTLE().exercises[0].name;
store.set("generatedSession", kept);   // building it here must not stand in for the builder storing it
const preview1 = await builderGo();
ok("1pc. the builder asks first (Rest today / Something gentler)", /Something gentler/.test(preview1) && /Rest today/.test(preview1) && stale.length >= 5, preview1.slice(0, 160));
ok("1a. Let's go opens the player on the gentle plan's first move", onView() === "workout" && firstCard().includes(gentleFirst), `${onView()} | ${firstCard().slice(0, 160)}`);
const leaked = stale.filter(n => n !== gentleFirst && txt(main).includes(n));
ok("1b. no card is the old plan's", leaked.length === 0, leaked.join(", "));
ok("1c. the stored plan is the gentle one", store.get("generatedSession")?.session?.gentleCare === true, store.get("generatedSession")?.session?.title);

// ── 2. NOTHING STORED ───────────────────────────────────────────────────
console.log("\nTEST 2 - knee Bad, nothing stored");
fixture(8);
store.set("generatedSession", { session: null, builtAt: null, inputs: {} });
await builderGo();
ok("2a. never \"No workout selected\"", !/No workout selected/i.test(txt(main)), firstCard().slice(0, 160));
ok("2b. the gentle plan's first move", onView() === "workout" && firstCard().includes(gentleFirst), `${onView()} | ${firstCard().slice(0, 160)}`);

// ── 3. THE PLAYER, OPENED STRAIGHT ──────────────────────────────────────
console.log("\nTEST 3 - an ordinary plan stored, the player opened straight on a Bad day");
fixture(8);
const today = storeOrdinary(0);
store.set("usingGeneratedSession", true);
await go("workout");
const shown = today.filter(n => txt(main).includes(n));
ok("3a. the Bad-day choice, not the plan", !!$('[data-bad-day="adapt"]') && !!$('[data-bad-day="rest"]') && shown.length === 0, `${shown.join(", ")} | ${firstCard().slice(0, 200)}`);
ok("3b. in the person's words", /knee is bad today/i.test(txt(main)), firstCard().slice(0, 200));
click($('[data-bad-day="adapt"]')); await wait(80);
ok("3c. Something gentler: the choice is recorded and the coach shows the gentle plan", (store.get("severePainChoices") || []).at(-1)?.choice === "adapt" && onView() === "coach-proposal" && /breath/i.test(txt(main)), `${onView()} | ${txt(main).slice(0, 200)}`);

const startBtn = [...main.querySelectorAll("button")].find(b => /^Start\b/.test(txt(b)) && !b.disabled);
click(startBtn); await wait(1200);
ok("3d. and Start plays it (no second Bad-day choice)", onView() === "workout" && !$("[data-bad-day]") && /breath/i.test(firstCard()), `${onView()} | ${firstCard().slice(0, 160)}`);

// ── 4. CONTROLS ─────────────────────────────────────────────────────────
console.log("\nTEST 4 - controls");
fixture(6);
const ord = storeOrdinary(0);
store.set("usingGeneratedSession", true);
await go("workout");
ok("4a. Quite sore: the stored plan plays", onView() === "workout" && txt(main).includes(ord[0]) && !$("[data-bad-day]"), firstCard().slice(0, 160));

console.log("");
if (fails) { console.log(`BAD-DAY-BUILDER: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`BAD-DAY-BUILDER: all ${passes} assertions pass\n`);
process.exit(0);
