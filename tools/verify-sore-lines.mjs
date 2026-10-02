/**
 * tools/verify-sore-lines.mjs
 * 02 Oct 2026 v2
 *
 * v2 - W4-9 SORE-WORDS. Follows the one sore-area sentence: 3c finds the
 *   skip in the sentence after the area's ("…today. Nothing is left out for
 *   it today, so skip anything that hurts it."); 4 asserts the acute line
 *   says what it left out and, new (4b), that no acute-ruled-out move is in
 *   any of those plans.
 *
 * 30 Sep 2026 v1
 *
 * W3-9 SORE-LINES (persona Wave 3: 2.1, 2.11, 2.13, 2.15, 2.16).
 *
 * At "A little" (4) or "Quite sore" (6) the plan screen said two things:
 * the proposal, "I haven't changed anything there", and the plan's own
 * line, "I've kept loading conservative" (or "I've avoided deep
 * single-leg loading", "I've reduced overhead and heavy pressing", "I've
 * kept hip extension loading controlled"). Measured on 72 real builds a
 * band: the plans at 4 and 6 carry about as much heavy work on the area
 * as plans with nothing sore. The proposal was right; the plan's line
 * claimed an action nobody took. P9 already made each line true of the
 * list; it was the "I've" that was not.
 *
 * And Free was told to "swap anything that loads it". Free has no Swap
 * on the plan; everybody has "Skip this one" in the player.
 *
 *   1. Below the acute band, no plan line claims an action ("I've ...").
 *   2. The area is still named on every build (silence reads as not heard).
 *   3. Nobody is told to swap (the builder does not read the tier, TIER-D);
 *      the line says skip, which everybody has.
 *   4. Control: at 7 the acute exclusion is real, and still says so
 *      when the list bears it out (at 8 no session is built at all).
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} });

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const SB = await import(B + "session-builder.js");
const { EXERCISES: SB_EX } = await import(B + "data/exercises/index.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};

const AREAS = { "lower-back": "lower back", knee: "knee", shoulder: "shoulder", hamstring: "hamstring" };
function builds(tier, area, pain, runs = 6) {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", tier); store.set("name", "Sam");
  store.set("conditions", [area]); store.set("conditionPainScores", { [area]: pain });
  const lines = [];
  for (const t of SB.SESSION_TYPES) for (let i = 0; i < runs; i++) {
    try { lines.push(SB.buildSession({ sessionType: t.id, durationMins: 30 }).coachLine || ""); } catch {}
  }
  return lines;
}
const sentenceAbout = (line, word) =>
  (line.match(/[^.]*\.(?=\s|$)/g) || []).filter(s => s.includes(word)).map(s => s.trim());

console.log("\nTEST 1-3 - through the real builder, each area, at 4 and 6, on both tiers");
const claimed = [], silent = [], freeSwap = [], planNoSwap = [];
let n = 0;
for (const tier of ["free", "personal"]) for (const [area, word] of Object.entries(AREAS)) for (const pain of [4, 6]) {
  for (const line of builds(tier, area, pain)) {
    n++;
    const s = sentenceAbout(line, word);
    if (!s.length) { silent.push(`${tier} ${area} ${pain}: "${line.slice(0, 90)}"`); continue; }
    s.filter(x => /\bI['’]ve\b/.test(x)).forEach(x => claimed.push(`${area} ${pain}: "${x}"`));
    s.filter(x => /\bswap\b/i.test(x)).forEach(x => tier === "free" && freeSwap.push(`${area}: "${x}"`));
    if (tier === "personal") s.filter(x => /\bswap\b/i.test(x)).forEach(x => planNoSwap.push(`${area}: "${x}"`));
  }
}
ok("pc. the builder built", n > 400, String(n));
ok("1. below the acute band, no plan line claims an action", claimed.length === 0,
   `${claimed.length}: ${[...new Set(claimed)].slice(0, 4).join(" | ")}`);
ok("2. the sore area is named on every build", silent.length === 0, silent.slice(0, 3).join(" | "));
ok("3a. Free is never told to swap", freeSwap.length === 0, [...new Set(freeSwap)].slice(0, 3).join(" | "));
ok("3b. the Plan's line says skip too (one line, both tiers)", planNoSwap.length === 0, [...new Set(planNoSwap)].slice(0, 3).join(" | "));
// W4-9: the area is named in one sentence and the skip is in the next.
const freeSkip = builds("free", "shoulder", 4).some(l => /your shoulder is [^.]*today\.[^.]*\bskip\b/i.test(l));
ok("3c. Free's line, when the plan does load the area, says skip", freeSkip);

console.log("\nTEST 4 - control: the acute band still says what it removed");
const acute = builds("free", "lower-back", 7);
const acutePlans = (() => { localStorage.clear(); store.init(); store.set("conditions", ["lower-back"]); store.set("conditionPainScores", { "lower-back": 7 });
  const out = []; for (const t of SB.SESSION_TYPES) for (let i = 0; i < 4; i++) { try { out.push(SB.buildSession({ sessionType: t.id, durationMins: 30 })); } catch {} } return out; })();
// W4-9: said as the one sentence: what is left out, and the acute moves
// really are out of every plan.
const acuteIds = SB_EX.filter(e => (e.contraindications || []).includes("lower-back-acute")).map(e => e.id);
ok("4. at 7 the lower back line says what it left out", acute.length > 0 && acute.every(l => /lower back[^.]*today\.[^.]*left out today/i.test(l)), acute[0]?.slice(0, 200));
ok("4b. and no acute-ruled-out move is in any of those plans", acutePlans.every(s => !(s.exercises || []).some(e => acuteIds.includes(e.id))));

console.log("");
if (fails) { console.log(`SORE-LINES: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`SORE-LINES: all ${passes} assertions pass\n`);
process.exit(0);
