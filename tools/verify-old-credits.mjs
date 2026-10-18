/**
 * tools/verify-old-credits.mjs
 * 18 Oct 2026 v1
 *
 * OLD-CREDITS-TIDY (Graeme, 18 Oct: "You do those things"; the stars went
 * in v665, D662-10). The older per-session count -- totalCredits,
 * lastWorkoutCredits, lastWorkoutName, an activity entry's creditsEarned --
 * was written by twelve screens and read by nothing since August. Retired.
 *
 *   1. No app code writes or reads any of them (comments aside).
 *   2. The social action credits are unchanged: a finished session adds
 *      one on Free and two on the Plan to community.credits.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM("<!doctype html><body></body>", { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });

const ROOT = new URL("../", import.meta.url);
let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const files = [];
const walk = d => { for (const f of readdirSync(d)) { const p = d + "/" + f; if (statSync(p).isDirectory()) walk(p); else if (p.endsWith(".js")) files.push(p); } };
walk(new URL("js", ROOT).pathname);
const code = f => readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "").replace(/\s\/\/ .*$/gm, "");
const RETIRED = /\b(totalCredits|lastWorkoutCredits|lastWorkoutName|creditsEarned|creditsForIndex|CREDITS_PER_EXERCISE)\b/;
const hits = files.filter(f => RETIRED.test(code(f))).map(f => `${f.split("/js/")[1]}: ${code(f).match(RETIRED)[0]}`);
ok("1a. nothing in the app writes or reads the old count", hits.length === 0, hits.join("; "));

const { store } = await import(new URL("js/store.js", ROOT).href);
for (const [tier, n] of [["free", 1], ["personal", 2]]) {
  localStorage.clear(); store.init(); store.set("onboardingComplete", true); store.set("tier", tier);
  const before = (store.get("community") || {}).credits || 0;
  store.logActivity({ type: "walk", completedAt: new Date().toISOString(), durationMins: 20 });
  const after = (store.get("community") || {}).credits || 0;
  ok(`2a-${tier}. a finished session adds ${n} to the social action credits`, after - before === n, `${before} -> ${after}`);
}
console.log(`\nVERIFY-OLD-CREDITS: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
