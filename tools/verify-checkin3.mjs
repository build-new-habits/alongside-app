/**
 * tools/verify-checkin3.mjs
 * 08 Sep 2026 v2
 *
 * v2 - The 60ms settle() is gone. It was a flat wait, and it was green
 *   five runs out of five on an idle box while failing TWELVE assertions
 *   every time inside a full-suite run. Reduced motion collapses the
 *   animation delays to zero, but the beats are still awaited promises
 *   and a busy event loop delivers them late.
 *
 *   A gate whose result depends on how busy the machine is teaches
 *   people to re-run it until it agrees with them, which turns a real
 *   failure into something you shrug at. It now polls until the thread
 *   has been still for three consecutive samples.
 *
 * CHECKIN-3. The coach must ask the question the next panel answers.
 *
 * WHAT THIS PROTECTS. On the full path the mood bridge said "Alright.
 * How did you sleep?" and the panel that opened next was the FEELING
 * WORD. The sleep panel then arrived in silence, its own bridge line
 * having been spent one panel too early. A person answered a different
 * question from the one they were asked, and the coach never asked the
 * one it actually wanted an answer to.
 *
 * THIS IS QUICK-3'S FAULT, ONE PATH OVER. v15 (18 Aug) found
 * _moodBridge() asking about sleep on the BRIEF path -- "the coach asked
 * a question it had already decided not to ask" -- gave the brief path
 * its own three lines, and left the full path's three still naming a
 * panel that no longer came next. Fixed on one branch, and the other one
 * lay there for three weeks.
 *
 * NOTHING HAD EVER MOUNTED THIS VIEW. verify-checkin2 reads checkin.js
 * as text and imports the conditions data module; no gate in the suite
 * imported CheckinView. The whole One to one journey -- Home door,
 * conversation, proposal -- was unexecuted. A conversation is exactly
 * the kind of thing source text cannot check: every line here is present
 * in the file whether or not it is ever said, and in the right order or
 * the wrong one.
 *
 * SO THIS MOUNTS IT AND WALKS IT, and asserts on what the coach actually
 * SAID, in sequence, panel by panel.
 *
 * BOTH BRANCHES OF THE FEELING PANEL. Skip and confirm both open the
 * sleep panel, so both must carry the sleep line. GUIDED-COPY changed
 * one branch of a card and left the other lying; DEVICE-1 moved a fault
 * instead of closing it and needed DEVICE-2 within the hour. Test 3
 * exists because of those two.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="main-content"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });

// jsdom provides none of these. Reduced motion collapses every animation
// delay to zero, which makes the walk deterministic AND exercises a path
// real people use.
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
const { store }       = await import(B + "store.js");
const { CheckinView } = await import(B + "views/checkin.js");
const { TodayView }   = await import(B + "views/today.js");

let fails = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) { if (detail) console.log(`        ${detail}`); fails++; }
};

const main   = document.getElementById("main-content");
/**
 * Waits for the thread to STOP CHANGING, rather than for a fixed 60ms.
 *
 * The flat wait passed 5 runs out of 5 on an idle machine and failed
 * every time under load -- 12 assertions red inside a full-suite run,
 * green on its own. A gate that depends on how busy the box is trains
 * people to re-run until it agrees with them, which is worse than no
 * gate: it converts a real failure into something you shrug at.
 *
 * Reduced motion collapses the animation delays to zero, but the beats
 * are still awaited promises, and a busy event loop delivers them late.
 * So poll until the DOM has been still for three consecutive samples.
 */
const settle = async (maxMs = 4000) => {
  let last = null, stable = 0;
  for (let waited = 0; waited < maxMs; waited += 20) {
    await new Promise(r => setTimeout(r, 20));
    const now = document.body.innerHTML.length + "|" +
                document.querySelectorAll(".ci-bubble, .ci-panel").length;
    stable = (now === last) ? stable + 1 : 0;
    last = now;
    if (stable >= 3) return;
  }
};

// Coach bubbles only. The panels repeat the question by design, so
// asserting on all text would pass on the panel copy alone and never
// notice the coach saying something else entirely -- which is the whole
// defect.
const coachSaid = () =>
  [...document.querySelectorAll(".ci-bubble")]
    .map(b => (b.textContent || "").replace(/\s+/g, " ").trim())
    .filter(Boolean);

// The OPEN panel specifically. _closePanel() removes the node 350ms
// later, so a closed panel lingers in document.body well past the point
// the next one opens -- and querySelector(".ci-panel") returns the
// OLDEST match, which is the one just dismissed. Reading that made four
// assertions here report on the energy panel while claiming to measure
// the sleep panel: a fixture not reaching what it names, caught only
// because the coach-bubble assertions beside them disagreed.
const panelText = () => {
  const open = [...document.querySelectorAll(".ci-panel.is-open")].pop();
  return open ? (open.textContent || "").replace(/\s+/g, " ").trim() : "";
};

async function startCheckin({ pace = null } = {}) {
  localStorage.clear();
  store.init();
  store.set("tier", "personal");
  store.set("name", "Graeme");
  store.set("conditions", ["knee"]);
  if (pace) store.set("sessionPace", pace);
  for (const el of document.querySelectorAll(".ci-panel, .ci-overlay")) el.remove();
  main.innerHTML = "";
  const navs = [];
  CheckinView({ navigate: r => navs.push(r) }).mount(main);
  await settle();
  return navs;
}

async function tap(sel) {
  const el = document.querySelector(sel);
  if (!el) return false;
  el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
  await settle();
  return true;
}
// The opening ends on a ready button with no id, and so does the
// energy->mood beat. Both are .ci-ready__btn.
const tapReady = async () => tap(".ci-ready__btn");

// ── 0. FIXTURE REACH ────────────────────────────────────────────────────
console.log("\nTEST 0 - the conversation actually mounted");

await startCheckin();
ok("0a. the coach has spoken", coachSaid().length > 0,
   "nothing rendered - every assertion below would be measuring an empty thread");
ok("0b. and it offers a way in", !!document.querySelector(".ci-ready__btn"),
   "no ready button, so the walk below cannot start");

// ── 1. THE MOOD BRIDGE NAMES WHAT COMES NEXT ────────────────────────────
console.log("\nTEST 1 - the coach asks the question the next panel answers");

await tapReady();                    // "I'm ready" -> energy panel
ok("1a. energy is the first panel", /How's your energy today/.test(panelText()),
   panelText().slice(0, 120));

await tap("#ci-energy-confirm");
await tapReady();                    // energy -> mood beat
ok("1b. mood is the second panel", /How's your mood/.test(panelText()),
   panelText().slice(0, 120));

await tap("#ci-mood-confirm");
const afterMood = coachSaid().join(" | ");
const moodPanel = panelText();

ok("1c. the panel after mood is the FEELING WORD",
   /word for how you're feeling/i.test(moodPanel),
   `got: ${moodPanel.slice(0, 120)}`);

ok("1d. and the coach's line before it does NOT ask about sleep",
   !/how did you sleep|how was last night|about last night/i.test(afterMood),
   "the coach asked about sleep and the feeling word panel opened - a person " +
   "answers a different question from the one they were asked");

ok("1e. it asks about the feeling word instead",
   /is there a word/i.test(afterMood),
   `the coach said: ${afterMood.slice(-160)}`);

// ── 2. THE SLEEP PANEL IS ASKED FOR, NOT JUST SHOWN ─────────────────────
console.log("\nTEST 2 - the sleep panel arrives with its question, not in silence");

const beforeFeeling = coachSaid().length;
await tap("#ci-feeling-confirm");
const afterFeeling = coachSaid().slice(beforeFeeling).join(" | ");

ok("2a. sleep is the panel after the feeling word",
   /How long did you sleep/i.test(panelText()), panelText().slice(0, 120));
ok("2b. and the coach asked about sleep first",
   /sleep|last night/i.test(afterFeeling),
   "the sleep panel opened in silence - its bridge line was spent one panel " +
   "earlier, on the transition into the feeling word");

// ── 3. BOTH BRANCHES OF THE FEELING PANEL ───────────────────────────────
console.log("\nTEST 3 - the SKIP branch carries it too");

await startCheckin();
await tapReady();
await tap("#ci-energy-confirm");
await tapReady();
await tap("#ci-mood-confirm");
const beforeSkip = coachSaid().length;
const skipped = await tap("#ci-feeling-skip");
const afterSkip = coachSaid().slice(beforeSkip).join(" | ");

ok("3a. the skip control exists", skipped,
   "no #ci-feeling-skip - this assertion measured nothing");
ok("3b. skipping still opens the sleep panel",
   /How long did you sleep/i.test(panelText()), panelText().slice(0, 120));
ok("3c. and the coach still asks the question",
   skipped && /sleep|last night/i.test(afterSkip),
   "confirm carries the sleep line and skip does not - one branch of a " +
   "two-branch panel, which is GUIDED-COPY's fault exactly");

// ── 4. THE BRIEF PATH IS UNTOUCHED ──────────────────────────────────────
console.log("\nTEST 4 - the brief path still ends where QUICK-1 put it");

// QUICK-1 stops after mood: energy and mood are everything
// detectBurnout() reads. Conditions are still asked. Nothing in
// CHECKIN-3 may lengthen it.
await startCheckin({ pace: "brief" });
await tapReady();
await tap("#ci-energy-confirm");
await tapReady();
await tap("#ci-mood-confirm");
const briefPanel = panelText();
const briefSaid  = coachSaid().join(" | ");

ok("4pc. positive control: a panel is open to be measured",
   briefPanel.length > 0,
   "panelText() is empty, so 4a and 4b below would pass against nothing");
ok("4a. the brief path does NOT open the feeling word panel",
   !/word for how you're feeling/i.test(briefPanel),
   `got: ${briefPanel.slice(0, 120)}`);
ok("4b. nor the sleep panel",
   !/How long did you sleep/i.test(briefPanel), briefPanel.slice(0, 120));
ok("4c. and its own three lines never mention sleep",
   !/how did you sleep|how was last night|about last night/i.test(briefSaid),
   "QUICK-3's original fault, back again");
ok("4d. but somebody with a condition is still asked about pain",
   /pain today/i.test(briefSaid) || /pain/i.test(briefPanel),
   "conditions are not enrichment and are never skipped for pace");

// ── 5. THE JOURNEY THE HOME CARD PROMISES ───────────────────────────────
console.log("\nTEST 5 - One to one lands on the proposal, not back on Home");

localStorage.clear();
store.init();
store.set("tier", "personal");
store.set("conditions", []);
for (const el of document.querySelectorAll(".ci-panel, .ci-overlay")) el.remove();
main.innerHTML = "";
const homeNavs = [];
TodayView({ navigate: r => homeNavs.push(r) }).mount(main);
await settle();

const ptBtn = main.querySelector('[data-door-id="pt"]');
ok("5a. the One to one room is on Home", !!ptBtn,
   "the door is gone, so the rest of this test measures nothing");
if (ptBtn) {
  ptBtn.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
  await settle();
  ok("5b. its button routes through check-in first",
     homeNavs.includes("checkin"),
     `navigated: ${homeNavs.join(", ") || "nowhere"}`);
  ok("5c. carrying the proposal as the pending destination",
     store.get("pendingDoorRoute") === "coach-proposal",
     `pendingDoorRoute is ${JSON.stringify(store.get("pendingDoorRoute"))} - ` +
     "without it check-in ends on Home and the door goes nowhere");
}

console.log(fails === 0
  ? "\nCHECKIN-3: all assertions pass\n"
  : `\nCHECKIN-3: ${fails} FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
