/**
 * tools/verify-burnout-live.mjs
 * 16 Sep 2026 v1
 *
 * BURNOUT-LIVE. Work list item 2a.
 *
 * 🔴 detectBurnout() works -- a week of low energy returns "high" -- but
 * on the LIVE path it changed only the coach's opening sentence. The
 * session was built as normal. BURN-1's protection (short, gentle)
 * lived only in workoutGenerator.js, which nothing has called since
 * TWO-ENGINE. verify-burn1 and verify-burn2 proved it there, so they
 * passed while the protection did not exist for anybody.
 *
 * Partial cover already existed: a LOW-ENERGY day gets the gentler
 * session. THE GAP IS BURNOUT PLUS A BETTER DAY -- a full, normal
 * session, the boom-and-bust BURN-1 was built to prevent, found tracing
 * the perimenopause persona.
 *
 * ⚫ THIS GATE DRIVES buildSession() -- the call coach-proposal.js makes
 * -- and asserts that call is reachable from the proposal. A test of a
 * helper is not a test of the feature: that is how INTENSITY-SPACE
 * passed on a function with no callers, the same morning.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const fs = __require("node:fs");

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://example.org/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;

let pass = 0, fail = 0; const fails = [];
const ok = (m, c, d = "") => { if (c) { pass++; console.log("  ok   " + m); }
  else { fail++; fails.push(m); console.log("  FAIL " + m); if (d) console.log("       " + d); } };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { buildSession, equipmentForLocation } = await import(B + "session-builder.js");
const { detectBurnout } = await import(B + "data/checkin.js");

const N = 25;
const day = n => new Date(Date.now() - n * 86400000).toISOString().split("T")[0];

function reset(history, today) {
  localStorage.clear(); store.init();
  store.set("tier", "personal");
  store.set("homeEquipment", ["dumbbells", "resistance-band"]);
  store.set("checkinHistory", history);
  store.set("todayIntensity", today);
}

/** Three hard days, then today feeling better. The case BURN-1 was for. */
function burntOutWeek(todayEnergy) {
  return {
    [day(3)]: { energy: 2, mood: 3 },
    [day(2)]: { energy: 2, mood: 3 },
    [day(1)]: { energy: 2, mood: 2 },
    [day(0)]: { energy: todayEnergy, mood: 6 }
  };
}
/** Same number of check-ins, no burnout. The control. */
function steadyWeek(todayEnergy) {
  return {
    [day(3)]: { energy: 7, mood: 7 },
    [day(2)]: { energy: 7, mood: 6 },
    [day(1)]: { energy: 6, mood: 7 },
    [day(0)]: { energy: todayEnergy, mood: 7 }
  };
}

// 🔴 MARGINS, NOT BARE COMPARISONS. The first run of this gate had 1.1
// pass by chance (4.4 vs 4.2 main movements is noise) and 3.1 fail by
// chance -- before any fix existed. A bare "<" certifies a fix that does
// nothing half the time. Every comparison below carries a margin sized
// above the run-to-run variation measured at N builds.
//
// Effort is measured on CORE sessions: on full body a low day moves mean
// effort only ~0.15, inside the noise; on core it moves ~0.9.
function profile(type = "full") {
  const kit = equipmentForLocation("home").list;
  let main = 0, cool = 0, eff = [], lines = [];
  for (let i = 0; i < N; i++) {
    const s = buildSession({ sessionType: type, durationMins: 30, equipmentOverride: kit, preset: null });
    for (const e of s.exercises) {
      if (e.section === "main") { main++; eff.push(e.energyRequired || 0); }
      if (e.section === "cooldown") cool++;
    }
    lines.push(s.coachLine || "");
  }
  const mean = a => a.reduce((x, y) => x + y, 0) / (a.length || 1);
  return { main: main / N, cool: cool / N, effort: mean(eff), line: lines[0] };
}

store.init();
console.log("\nBURNOUT-LIVE\n");

console.log("TEST 0 — FIXTURE REACH: the histories mean what they say");
ok("0.1 the burnt-out week IS detected as burnout",
   detectBurnout(burntOutWeek(8)).level !== "none",
   JSON.stringify(detectBurnout(burntOutWeek(8))));
ok("0.2 the steady week is NOT", detectBurnout(steadyWeek(8)).level === "none");
ok("0.3 the proposal actually calls buildSession, so this is the live path",
   /buildSession\(/.test(fs.readFileSync(new URL("../js/views/coach-proposal.js", import.meta.url), "utf8")),
   "if the coach stopped calling buildSession, every assertion below would test a dead door");

console.log("\nTEST 1 — burnout plus a better day stays gentle");
reset(steadyWeek(8), "moderate");   const normal = profile();
reset(burntOutWeek(8), "moderate"); const burnt  = profile();
console.log(`       steady week, good day:  main ${normal.main.toFixed(1)}, cool-down ${normal.cool.toFixed(1)}, effort ${normal.effort.toFixed(2)}`);
console.log(`       burnt-out week, good day: main ${burnt.main.toFixed(1)}, cool-down ${burnt.cool.toFixed(1)}, effort ${burnt.effort.toFixed(2)}`);

ok("1.1 less main work, by a clear margin", burnt.main <= normal.main - 0.6,
   "the whole gap: a better day after a burnt-out week got a full session");
ok("1.2 more time to settle at the end", burnt.cool >= normal.cool + 0.6);

reset(steadyWeek(8), "moderate");   const normalCore = profile("core");
reset(burntOutWeek(8), "moderate"); const burntCore  = profile("core");
console.log(`       core effort: steady ${normalCore.effort.toFixed(2)}, burnt-out ${burntCore.effort.toFixed(2)}`);
ok("1.3 easier main work, on core where the effect is measurable",
   burntCore.effort <= normalCore.effort - 0.3);

console.log("\nTEST 2 — the words stay true");
ok("2.1 it does NOT say their energy is low today",
   !/energy's low today/i.test(burnt.line),
   "they reported a better day. Telling them otherwise is the app not listening");
ok("2.2 it says why, from what they reported", /this week|lately|recent/i.test(burnt.line),
   "a gentler session with no reason reads as the app ignoring a good day. Line was: " + burnt.line);
ok("2.3 and never names a diagnosis",
   !/burnout|burnt out|burned out|exhaustion syndrome|depress/i.test(burnt.line),
   "the app reports what somebody told it; it does not label them");

console.log("\nTEST 3 — reversals");
reset(steadyWeek(8), "moderate");
ok("3.1 no burnout history: the normal shape, not the gentle one", (() => {
  const p = profile();
  return p.main >= 3.8 && p.cool <= 2.2;
})(), "the gentle shape is 3 main and 3 cool-down; a steady week must not get it");
reset(steadyWeek(2), "low");
ok("3.2 a plain low day still says energy is low, as before",
   /energy's low today/i.test(profile().line),
   "the existing low-day behaviour must not be disturbed");
reset(burntOutWeek(2), "low");
ok("3.3 burnout AND a low day does not say it twice", (() => {
  const l = profile().line;
  return !(/energy's low today/i.test(l) && /this week/i.test(l));
})(), "two sentences telling somebody they are tired is one too many");

console.log("");
if (fail) { console.log("BURNOUT-LIVE: " + fail + " FAILED"); fails.forEach(f => console.log("  - " + f)); process.exit(1); }
console.log("BURNOUT-LIVE: all " + pass + " assertions pass\n");
