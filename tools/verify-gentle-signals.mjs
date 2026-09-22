/**
 * tools/verify-gentle-signals.mjs
 * 16 Sep 2026 v1
 *
 * GENTLE-SIGNALS. Work list items 2b and 2d, built as one rule.
 *
 * 🔴 EVERY "GO GENTLER" SIGNAL EXCEPT TODAY'S ENERGY WAS DEAD on the live
 * path, each proven only against workoutGenerator.js:
 *
 *   poor sleep        asked at check-in, read by nothing (SLEEP-1)
 *   days in a row     coachBias() had no caller AND counted `e.date`,
 *                     a field no activity entry has -- always zero
 *   declared low      coldStartBias()'s only caller was resolveIntensity(),
 *                     whose only caller is the dead generator. The
 *                     sign-up stress question has never done anything
 *   burnout week      fixed as BURNOUT-LIVE (2a) this morning
 *
 * ⚫ ONE RULE, ONE REASON. Several signals at once must not produce
 * several sentences about being tired. The coach gives the single most
 * relevant reason, in priority: today's energy > last night's sleep >
 * this week > days in a row > what they said at sign-up.
 *
 * ⚫ DRIVES buildSession(), the call the proposal makes. Every
 * comparison carries a margin: bare comparisons passed and failed by
 * chance in verify-burnout-live's first run.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const fs = __require("node:fs");

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://example.org/" });
globalThis.window = dom.window; globalThis.document = dom.window.document; globalThis.localStorage = dom.window.localStorage;

let pass = 0, fail = 0; const fails = [];
const ok = (m, c, d = "") => { if (c) { pass++; console.log("  ok   " + m); }
  else { fail++; fails.push(m); console.log("  FAIL " + m); if (d) console.log("       " + d); } };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { buildSession, equipmentForLocation } = await import(B + "session-builder.js");

const N = 25;
const day = n => new Date(Date.now() - n * 86400000).toISOString().split("T")[0];
const TIRED = /energy's low today|slept badly|this week|days in a row|running low/i;

/** A steady week so burnout never fires unless a test wants it. */
function base({ today = "moderate", sleep = "good", streak = 0, declared = null, checkins = 5 } = {}) {
  localStorage.clear(); store.init();
  store.set("tier", "personal");
  store.set("homeEquipment", ["dumbbells", "resistance-band"]);
  const h = {};
  for (let i = checkins - 1; i >= 1; i--) h[day(i)] = { energy: 7, mood: 7, sleepQuality: "good" };
  h[day(0)] = { energy: today === "low" ? 2 : 7, mood: 6, sleepQuality: sleep };
  store.set("checkinHistory", h);
  store.set("todayIntensity", today);
  for (let n = 1; n <= streak; n++)
    store.logActivity({ type: "workout", completedAt: new Date(Date.now() - n * 86400000).toISOString() });
  if (declared) store.set("lifestyle", { ...(store.get("lifestyle") || {}), stressLevel: declared });
}

function profile(type = "full") {
  const kit = equipmentForLocation("home").list;
  let main = 0, cool = 0, lines = [];
  for (let i = 0; i < N; i++) {
    const s = buildSession({ sessionType: type, durationMins: 30, equipmentOverride: kit, preset: null });
    for (const e of s.exercises) { if (e.section === "main") main++; if (e.section === "cooldown") cool++; }
    lines.push(s.coachLine || "");
  }
  return { main: main / N, cool: cool / N, line: lines[0] };
}
const gentle = (p, ref) => p.main <= ref.main - 0.6 && p.cool >= ref.cool + 0.6;
const reasons = l => (l.match(new RegExp(TIRED.source, "gi")) || []).length;

store.init();
console.log("\nGENTLE-SIGNALS\n");

console.log("TEST 0 — FIXTURE REACH");
ok("0.1 the proposal calls buildSession, so this is the live path",
   /buildSession\(/.test(fs.readFileSync(new URL("../js/views/coach-proposal.js", import.meta.url), "utf8")));
base(); const ref = profile();
console.log(`       reference: main ${ref.main.toFixed(1)}, cool-down ${ref.cool.toFixed(1)}`);
ok("0.2 the reference session is the normal shape, not the gentle one",
   ref.main >= 3.8 && ref.cool <= 2.2, "otherwise every 'gentler than' below is vacuous");
ok("0.3 the reference coach line mentions no tiredness at all", reasons(ref.line) === 0, ref.line);

console.log("\nTEST 1 — each signal ALONE makes it gentler, and says so");
base({ sleep: "poor" }); let p = profile();
ok("1.1 poor sleep last night -> gentler", gentle(p, ref), `main ${p.main.toFixed(1)}, cool ${p.cool.toFixed(1)}`);
ok("1.2 ...and says it was the sleep", /slept badly/i.test(p.line), p.line);

base({ streak: 3 }); p = profile();
ok("1.3 three days in a row -> gentler", gentle(p, ref), `main ${p.main.toFixed(1)}, cool ${p.cool.toFixed(1)}`);
ok("1.4 ...and says how many days", /3 days in a row/i.test(p.line), p.line);

base({ declared: "exhausted", checkins: 1 }); p = profile();
ok("1.5 declared exhausted at sign-up, first days -> gentler", gentle(p, ref), `main ${p.main.toFixed(1)}`);
ok("1.6 ...and says what they told it", /running low/i.test(p.line), p.line);

console.log("\nTEST 2 — several at once: gentle, and ONE reason");
base({ today: "low", sleep: "poor", streak: 4 }); p = profile();
ok("2.1 three signals at once is still one sentence of reason", reasons(p.line) === 1,
   "several sentences about being tired is the app talking at somebody. Line: " + p.line);
ok("2.2 and it is the highest-priority one: today's energy", /energy's low today/i.test(p.line), p.line);
base({ sleep: "poor", streak: 4 }); p = profile();
ok("2.3 sleep outranks days in a row", /slept badly/i.test(p.line) && !/days in a row/i.test(p.line), p.line);

console.log("\nTEST 3 — reversals");
base({ streak: 2 }); p = profile();
ok("3.1 two days in a row is NOT enough", !gentle(p, ref) && reasons(p.line) === 0,
   "the threshold is three; two must leave the session alone");
base({ sleep: "okay" }); p = profile();
ok("3.2 'okay' sleep is not poor sleep", reasons(p.line) === 0, p.line);
base({ declared: "exhausted", checkins: 5 }); p = profile();
ok("3.3 the sign-up answer stops counting once there is real history", reasons(p.line) === 0,
   "coldStartBias is meant to soften the first days only, never to become a standing label");
// Tests the SENTENCES people read, not the code around them. The first
// version scanned the whole GENTLE_LINES block and failed on the object
// key `burnout:` -- an internal label nobody sees. A check that cannot
// tell a label from a sentence would push somebody into renaming code to
// silence it, which proves nothing about what the person is told.
ok("3.4 no line a person reads ever names a condition", (() => {
  const block = fs.readFileSync(new URL("../js/session-builder.js", import.meta.url), "utf8")
    .match(/const GENTLE_LINES = \{[\s\S]*?\};/);
  if (!block) return false;
  const said = (block[0].match(/"[^"]*"|`[^`]*`/g) || []).join(" ").toLowerCase();
  return said.length > 100 &&
    !["burnout", "burnt out", "burned out", "depress", "insomnia", "overtrain", "exhaustion"]
      .some(w => said.includes(w));
})(), "the app says what somebody told it; it does not label them");

console.log("");
if (fail) { console.log("GENTLE-SIGNALS: " + fail + " FAILED"); fails.forEach(f => console.log("  - " + f)); process.exit(1); }
console.log("GENTLE-SIGNALS: all " + pass + " assertions pass\n");
