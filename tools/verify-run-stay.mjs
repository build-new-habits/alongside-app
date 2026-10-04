/**
 * tools/verify-run-stay.mjs
 * 04 Oct 2026 v1
 *
 * W6-5 RUN-STAY (Wave 6 persona trace: 2.15). On a run, Exit stopped the
 * timer and Stay in session only removed the card, so the run froze: no
 * prompts, no cooldown, no end, and Exit and save later saved a part for
 * the whole. Walk, cycle and swim had the same code.
 *
 * Through the real run screen, with the clock and the timer driven here:
 *   1. Exit at 10 minutes, Stay: the run carries on; the card's minutes are
 *      not counted; the next prompt comes; the run ends at its length.
 *   2. A prompt left untapped clears itself, so the next one still comes.
 *   3. The progress bar's value and name follow the run.
 *   4. No frozen "You have N left" sentence.
 *   5. Walk, cycle and swim: Stay restores the running state (source).
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
const { readFileSync } = await import("node:fs");
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
globalThis.window.router = router;
Object.defineProperty(globalThis, "router", { value: router, configurable: true, writable: true });
const gate = await import(B + "safety-gate.js");

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

// The clock and the 1-second timer, driven by the check.
let now = Date.UTC(2026, 9, 5, 8, 0, 0);
const realNow = Date.now;
Date.now = () => now;
const ticks = new Map(); let tid = 1000;
const realSI = globalThis.setInterval, realCI = globalThis.clearInterval;
const fakeSI = (fn, ms) => { if (ms === 1000) { const id = tid++; ticks.set(id, fn); return id; } return realSI(fn, ms); };
const fakeCI = id => { if (ticks.has(id)) ticks.delete(id); else realCI(id); };
globalThis.setInterval = dom.window.setInterval = fakeSI;
globalThis.clearInterval = dom.window.clearInterval = fakeCI;
const advance = secs => { for (let i = 0; i < secs; i++) { now += 1000; for (const fn of [...ticks.values()]) fn(); } };

localStorage.clear(); store.init(); agreed(store); gate.endGateSession();
store.set("onboardingComplete", true); store.set("name", "Jo"); store.set("tier", "free");
for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
gate.endGateSession();

const RS = await import(B + "views/running-session.js");
const paint = () => { main.innerHTML = RS.render(); RS.onMount(); };
paint();
click($('.ws-type-card[data-type="easy"]')); await wait(5);
click($('.ws-duration-card[data-mins="30"]')); await wait(5);
click($("#rs-start-btn")); await wait(5);        // overview -> running
click($("#rs-start-btn")); await wait(5);        // start
const timer = () => txt($("#rs-timer-display"));
const promptText = () => txt($(".ws-prompt-text"));

console.log("\nTEST 1 - Exit, then Stay in session");
advance(10 * 60);
const before = timer();
click($("#rs-exit-btn")); await wait(5);
advance(3 * 60);                                   // three minutes on the card
click(document.getElementById("exit-confirm-stay")); await wait(5);
advance(5);
ok("1a. the run carries on after Stay", timer() !== before && /^19:5/.test(timer()), `${before} -> ${timer()}`);
ok("1b. the minutes on the card are not counted", /^19:5/.test(timer()), timer());
advance(5 * 60);
const t1 = timer();
ok("1c. still counting five minutes later", /^14:5/.test(t1), t1);
advance(16 * 60);
const logged = (store.get("activityLog") || []).filter(a => a.type === "run" || a.source === "running-session");
ok("1d. it ends at its length and is saved complete", logged.some(a => a.status === "completed"), JSON.stringify(logged.map(a => [a.status, a.durationMins])));

console.log("\nTEST 2 - an untapped prompt clears itself");
click($("#rs-home-btn")); await wait(5);
paint();
click($('.ws-type-card[data-type="easy"]')); await wait(5);
click($('.ws-duration-card[data-mins="30"]')); await wait(5);
click($("#rs-start-btn")); await wait(5);
click($("#rs-start-btn")); await wait(5);
const seen = new Set();
for (let s = 0; s < 26 * 60; s++) { advance(1); const p = promptText(); if (p) seen.add(p.slice(0, 40)); }
ok("2a. three or more different prompts shown without a single tap", seen.size >= 3, [...seen].join(" | "));

console.log("\nTEST 3 - the progress bar follows the run");
const pb = $(".workout-progress-bar");
ok("3a. aria-valuenow moved from 0", pb && Number(pb.getAttribute("aria-valuenow")) > 50, pb?.getAttribute("aria-valuenow"));
ok("3b. its name says the same", pb && pb.getAttribute("aria-label") === `Run progress ${pb.getAttribute("aria-valuenow")}%`, pb?.getAttribute("aria-label"));

console.log("\nTEST 4 - no frozen time left in a sentence");
const src = f => readFileSync(new URL(`../js/views/${f}`, import.meta.url), "utf8");
ok("4a. no \"You have ... left\" drawn once", !/You have \$\{formatMMSS\(Math\.max\(0, selectedMins \* 60 - elapsed\)\)\} left/.test(src("running-session.js")));

console.log("\nTEST 5 - walk, cycle and swim: Stay carries on");
for (const f of ["walk-session.js", "cycle-session.js", "swim-session.js"]) {
  const s = src(f);
  const exitFn = s.slice(s.indexOf("function showExitConfirm"), s.indexOf("function showExitConfirm") + 4000);
  ok(`5. ${f}: Exit pauses, Stay restores`, !/clearInterval\(sessionTimer\)/.test(exitFn.split("exit-confirm-stay")[0]) && /paused = wasPaused/.test(exitFn));
}

Date.now = realNow;
console.log("");
if (fails) { console.log(`RUN-STAY: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`RUN-STAY: all ${passes} assertions pass\n`);
process.exit(0);
