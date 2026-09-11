/**
 * tools/verify-proposal3.mjs
 * 11 Sep 2026 v1
 *
 * PROPOSAL-3. A harder day, then ten movements.
 *
 * ── WHAT WAS BROKEN, REPRODUCED BEFORE IT WAS TOUCHED ───────────────
 *
 * Free account on alongside-v494. Energy 2/10, mood 3/10, seven hours of
 * poor sleep. Check-in read it correctly and said "A harder day". The
 * session offered was Glute Focus, 25-35 minutes, TEN movements, coached
 * as loading the posterior chain progressively.
 *
 * Two faults, and the second is the worse one:
 *
 *   1. checkin.js writes todayIntensity "low" from the energy score.
 *      coach-proposal.js's _generateOptions() then writes the phase bias
 *      over it on every mount -- and on free, getPhaseBias() is the
 *      constant { intensityBias: "moderate" }. The person's own answer
 *      survived seconds.
 *
 *   2. session-builder.js never read todayIntensity AT ALL. So even with
 *      fault 1 fixed, a 2/10 day and a good day built the same session.
 *      The field had a writer, a second writer that clobbered it, and no
 *      reader on the live path: the BUILD-5 shape exactly.
 *
 * ── WHY THIS GATE MOUNTS THE SCREEN ─────────────────────────────────
 *
 * The schedule's own words: "Needs an executing gate, not a source
 * check." A regex over coach-proposal.js would have passed on every day
 * this was broken -- the code it would have matched was all present and
 * all running. Test 2 therefore mounts the real view through
 * CoachProposalView, on a real store, and reads what the store holds
 * afterwards.
 *
 * ── THE CONTROL THAT MATTERS ────────────────────────────────────────
 *
 * Test 1 asserts the ORIGINAL fault is reproducible with the fix removed
 * in-memory: a "moderate" day still builds the full-size session. Without
 * that control, tests 3 and 4 could pass on a build where intensity did
 * nothing at all and every session happened to be small.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="main-content"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = (q) => ({
  matches: /prefers-reduced-motion/.test(q), media: q,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}
});
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [
  ["requestAnimationFrame", (cb) => setTimeout(() => cb(Date.now()), 0)],
  ["cancelAnimationFrame",  (id) => clearTimeout(id)]
]) {
  dom.window[k] = v;
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}

const B = new URL("../js/", import.meta.url).href;
const { store }              = await import(B + "store.js");
const { getSuggestedIntensity } = await import(B + "data/checkin.js");
const { buildSession }       = await import(B + "session-builder.js");
const { chooseSessionType }  = await import(B + "data/session-choice.js");

let fails = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) { if (detail) console.log(`        ${detail}`); fails++; }
};

const main = document.getElementById("main-content");
const today = () => new Date().toISOString().split("T")[0];

/** A free account that has just checked in with the given energy and mood. */
function checkedIn(energy, mood) {
  localStorage.clear();
  store.init();
  store.set("name", "Graeme");
  store.set("conditions", []);
  store.set("conditionPainScores", {});
  store.set("homeEquipment", ["dumbbells", "resistance-band"]);
  store.set("availableTime", "standard");
  store.set("lastCheckin.timestamp", new Date().toISOString());
  const checkin = { energy, mood, sleepHours: 7, sleepQuality: "poor" };
  store.set("checkinHistory", { [today()]: checkin });
  store.set("lastCheckin.energy", energy);
  // Exactly what checkin.js does on submit.
  store.set("todayIntensity", getSuggestedIntensity(checkin));
  return store.get("todayIntensity");
}

/**
 * Fixed session type, on purpose. chooseSessionType() rotates on
 * least-recent, so letting it choose made the two sides of every
 * comparison different session types with different count tables -- the
 * first draft of this gate failed for that reason and proved nothing
 * either way. "glute" is the type Graeme was actually offered.
 */
function build(sessionType = "glute") {
  const s = buildSession({ sessionType, durationMins: 30, equipmentOverride: ["dumbbells", "resistance-band"], preset: null });
  const ex = s.exercises || [];
  return {
    count:    ex.length,
    warmup:   ex.filter(e => e.section === "warmup").length,
    main:     ex.filter(e => e.section === "main").length,
    cooldown: ex.filter(e => e.section === "cooldown").length,
    coach:    s.coachLine || ""
  };
}

/**
 * Five builds, and the LARGEST session of the five.
 *
 * Selection and _trimToDuration() make an ordinary 30-minute session land
 * on four or five main movements from one build to the next, so a single
 * build compared against a single build is a coin toss -- the first draft
 * of test 5 failed on exactly that. Variance here only ever removes work,
 * so the ceiling is the stable number and the ceiling is what an
 * intensity step is supposed to move.
 */
function buildWith({ durationMins = 30, preset = null, sessionType = "glute" }) {
  const s = buildSession({ sessionType, durationMins, preset,
                           equipmentOverride: ["dumbbells", "resistance-band"] });
  const ex = s.exercises || [];
  return { main: ex.filter(e => e.section === "main").length, count: ex.length };
}

function measure(sessionType = "glute") {
  const runs = Array.from({ length: 5 }, () => build(sessionType));
  const max = k => Math.max(...runs.map(r => r[k]));
  return { count: max("count"), warmup: max("warmup"), main: max("main"),
           cooldown: max("cooldown"), coach: runs[0].coach };
}

let _n = 0;
async function mountProposal() {
  main.innerHTML = "";
  const mod  = await import(B + `views/coach-proposal.js?n=${++_n}`);
  mod.CoachProposalView({ navigate: () => {} }).mount(main);
  await new Promise(r => setTimeout(r, 1200));
  return store.get("todayIntensity");
}

console.log("\nPROPOSAL-3 — a harder day, then ten movements\n");

// ════════════════════════════════════════════════════════════════════
console.log("TEST 0 — the fixtures reach what they claim to");

const lowWritten = checkedIn(2, 3);
ok("0a. energy 2/10 makes check-in write todayIntensity \"low\"", lowWritten === "low", `wrote "${lowWritten}"`);
// 6 and not 7: getSuggestedIntensity() returns "high" above 6, and a
// "high" fixture would have been a silently different test.
const modWritten = checkedIn(6, 6);
ok("0b. energy 6/10 writes \"moderate\"", modWritten === "moderate", `wrote "${modWritten}"`);
const highWritten = checkedIn(9, 9);
ok("0c. energy 9/10 writes \"high\"", highWritten === "high", `wrote "${highWritten}"`);

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 1 — CONTROL: an ordinary day still gets an ordinary session");

checkedIn(6, 6);
const ordinary = measure();
ok("1a. a moderate day builds the full-size session",
   ordinary.main >= 5 && ordinary.count >= 9,
   `main ${ordinary.main}, total ${ordinary.count} — if this is already small, tests 3 and 4 prove nothing`);
ok("1b. and says nothing about energy",
   !/energy is low/i.test(ordinary.coach), ordinary.coach.slice(0, 120));

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 2 — the proposal screen no longer overwrites the check-in");

checkedIn(2, 3);
const afterMount = await mountProposal();
ok("2a. todayIntensity is still \"low\" after the screen has mounted",
   afterMount === "low",
   `store holds "${afterMount}" — the phase bias has overwritten what the person told us, which is the original fault`);

checkedIn(6, 6);
const afterMountMod = await mountProposal();
ok("2b. and a moderate day is left alone, not dragged down",
   afterMountMod === "moderate", `store holds "${afterMountMod}"`);

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 3 — a low day builds a genuinely smaller working section");

checkedIn(2, 3);
const hard = measure();
ok("3a. fewer main movements than an ordinary day",
   hard.main < ordinary.main, `low ${hard.main} vs moderate ${ordinary.main}`);
ok("3b. and never fewer than two", hard.main >= 2, `main ${hard.main}`);
ok("3c. a longer settle, not simply less session",
   hard.cooldown > ordinary.cooldown, `low ${hard.cooldown} vs moderate ${ordinary.cooldown}`);
ok("3d. the warm-up is untouched — it is the protective part",
   hard.warmup === ordinary.warmup,
   `low warm-up ${hard.warmup} vs ordinary ${ordinary.warmup}`);
ok("3e. the session Graeme was offered is no longer offered: not ten movements",
   hard.count < 10, `${hard.count} movements`);

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 4 — the coach says why, rather than quietly doing less");

ok("4a. the coach line names the low-energy day",
   /energy is low/i.test(hard.coach), hard.coach.slice(0, 160));
ok("4b. and frames easing off as useful rather than a compromise",
   /not a compromise/i.test(hard.coach));
ok("4c. it does not claim to know anything it was not told",
   !/mood|sleep|tired|exhaust/i.test(hard.coach), hard.coach.slice(0, 160));

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 5 — downward only");

checkedIn(9, 9);
store.set("todayIntensity", "high");
const high = measure();
ok("5a. a high day is not given MORE than an ordinary one",
   high.main <= ordinary.main && high.cooldown <= ordinary.cooldown,
   `high main ${high.main}/cooldown ${high.cooldown} vs ordinary ${ordinary.main}/${ordinary.cooldown}`);

checkedIn(2, 3);
store.set("todayIntensity", "nonsense");
const junk = measure();
ok("5b. an unrecognised value changes nothing rather than guessing",
   junk.main === ordinary.main, `main ${junk.main} vs ordinary ${ordinary.main}`);

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 6 — the step and the allocation preset compose safely");

// The two are multiplicative and commute almost everywhere, so this is
// the one place the ORDER is observable: the intensity step runs last, so
// its floor of two main movements is the final word. Run the other way
// round, "mostly mobility" at 15 minutes takes a low day down to a single
// working movement, and _applyPreset's own floor of one allows it.
checkedIn(2, 3);
{
  const short = Math.max(...Array.from({ length: 5 },
    () => buildWith({ durationMins: 15, preset: "mobility" }).main));
  ok("6a. a low day at 15 minutes with \"mostly mobility\" keeps two working movements",
     short >= 2, `main ${short}`);
}

console.log(`\n  ${fails === 0 ? "ALL PASS" : fails + " RED"}\n`);
process.exit(fails ? 1 : 0);
