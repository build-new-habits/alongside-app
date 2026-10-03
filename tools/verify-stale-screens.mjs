/**
 * tools/verify-stale-screens.mjs
 * 03 Oct 2026 v1
 *
 * W5-18 STALE-SCREENS (Wave 5 persona trace: 2.1, 2.4, 2.15).
 *
 * In one app run the finish screen showed the last session's answer and
 * line before anything was tapped; the mood slider started at a mood from
 * days ago; an app left open overnight kept yesterday's sore answers;
 * "It's been 3 days" counted check-ins only, not sessions; and "your
 * energy's been dropping a little each check-in" was said for 6, 2, 3.
 *
 *   1. A new session's finish screen starts empty.
 *   2. The mood slider starts at today's check-in, else the middle.
 *   3. Sore answers are read by their date, with no reload; set today,
 *      they are today's.
 *   4. The gap counts sessions too.
 *   5. "Dropping" or "climbing" only when each step falls or rises.
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
const R = await import(B + "views/reflect.js");
const OP = await import(B + "data/checkin-openings.js");

function fixture() {
  localStorage.clear(); store.init(); agreed(store);
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", "free");
  store.set("conditions", []); store.set("conditionPainScores", {});
}
const dayAgo = n => new Date(Date.now() - n * 86400000);

// ── 1. THE FINISH SCREEN ────────────────────────────────────────────────
console.log("\nTEST 1 - a new session's finish screen starts empty");
fixture();
store.set("currentActivityEntry", { id: "a1", type: "workout", name: "Full Body", startedAt: new Date().toISOString() });
main.innerHTML = R.render(); R.onMount();
const chip = main.querySelector("[data-feel]");
click(chip); await wait(10);
const ta = main.querySelector("#reflect-open-text");
if (ta) { ta.value = "Legs were heavy"; ta.dispatchEvent(new dom.window.Event("input", { bubbles: true })); }
ok("1pc. an answer given on the first finish screen", !!main.querySelector("[data-feel].selected, [data-feel][aria-pressed=true]"));
// Navigating away and back in one app run.
store.set("currentActivityEntry", { id: "a2", type: "workout", name: "Upper Body", startedAt: new Date().toISOString() });
main.innerHTML = R.render();
ok("1a. the next session's screen has no answer chosen", !main.querySelector("[data-feel].selected, [data-feel][aria-pressed=true]"), main.querySelector("[data-feel].selected")?.textContent);
ok("1b. and no line from the last session", !txt(main.querySelector("#finish-coach")), txt(main.querySelector("#finish-coach")));
ok("1c. and an empty note", (main.querySelector("#reflect-open-text")?.value || "") === "");

// ── 2. THE MOOD SLIDER ──────────────────────────────────────────────────
console.log("\nTEST 2 - the mood slider starts at today's check-in, else the middle");
fixture();
store.set("currentActivityEntry", { id: "a3", type: "workout", name: "Full Body" });
store.set("lastCheckin", { energy: 6, mood: 9, timestamp: dayAgo(3).toISOString() });
main.innerHTML = R.render(); R.onMount();
ok("2a. a check-in three days ago: the middle", main.querySelector("#reflect-mood-slider")?.value === "5", main.querySelector("#reflect-mood-slider")?.value);
store.set("lastCheckin", { energy: 6, mood: 9, timestamp: new Date().toISOString() });
store.set("currentActivityEntry", { id: "a4", type: "workout", name: "Full Body" });
main.innerHTML = R.render(); R.onMount();
ok("2b. today's check-in: its mood", main.querySelector("#reflect-mood-slider")?.value === "9", main.querySelector("#reflect-mood-slider")?.value);

// ── 3. SORE ANSWERS BY DATE ─────────────────────────────────────────────
console.log("\nTEST 3 - sore answers are read by their date");
fixture();
store.set("conditions", ["knee"]);
store.set("conditionPainScores", { knee: 6 });
ok("3a. set today: today's", store.get("conditionPainScores")?.knee === 6 && store.get("conditionPainScoresOn") === store._localDay());
store.data.conditionPainScoresOn = store._localDay(dayAgo(1));   // left open overnight, no reload
ok("3b. the next morning, no reload: not today's", Object.keys(store.get("conditionPainScores") || {}).length === 0, JSON.stringify(store.get("conditionPainScores")));

// ── 4. THE GAP COUNTS SESSIONS ──────────────────────────────────────────
console.log("\nTEST 4 - the gap counts sessions too");
fixture();
store.set("checkinHistory", { [store._localDay(dayAgo(3))]: { energy: 6, mood: 6 } });
store.set("activityLog", [{ id: "s1", type: "class", status: "completed", completedAt: dayAgo(1).toISOString(), date: dayAgo(1).toISOString() }]);
const o4 = OP.resolveOpening();
ok("4a. a session yesterday: not \"3 days\"", !/\b3 days\b/i.test(o4?.b1 || ""), o4?.b1);
store.set("activityLog", []);
const o4b = OP.resolveOpening();
ok("4b. control: nothing since, it says 3 days", /3 days/.test(o4b?.b1 || ""), o4b?.b1);

// ── 5. DROPPING ONLY WHEN EACH STEP FALLS ───────────────────────────────
console.log("\nTEST 5 - dropping or climbing only when each step does");
const e = (...v) => v.map(energy => ({ energy }));
ok("5pc. the trend is readable", typeof OP.energyTrend === "function");
ok("5a. 6, 2, 3 is not dropping", OP.energyTrend?.(e(6, 2, 3)) !== "declining");
ok("5b. 6, 4, 2 is dropping", OP.energyTrend?.(e(6, 4, 2)) === "declining");
ok("5c. 2, 6, 5 is not climbing", OP.energyTrend?.(e(2, 6, 5)) !== "improving");
ok("5d. 2, 4, 6 is climbing", OP.energyTrend?.(e(2, 4, 6)) === "improving");

console.log("");
if (fails) { console.log(`STALE-SCREENS: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`STALE-SCREENS: all ${passes} assertions pass\n`);
process.exit(0);
