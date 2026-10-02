/**
 * tools/verify-gate-once.mjs
 * 02 Oct 2026 v2
 *
 * v2 - W4-1 GATE-OPEN. The fixture person has agreed (tools/agreed.mjs): the
 *   app now sends anybody who has not back to onboarding. No assertion
 *   changed.
 *
 * SMOOTH-P0 F1, GATE-LOOP. The safety note is read once per session.
 *
 * Found tracing the Plan route on 27 Sep: a new user had to tick the
 * note and press "Start the session" FIVE times in a row before the
 * first exercise appeared.
 *
 * Every session view shows the gate with `if (index === 0 && isGateDue())`
 * and its acknowledge handler re-navigates to the same view. Fourteen
 * views carry the same comment: "isGateDue() goes false the moment the
 * acknowledgement is written". GATE-TAPER (16 Sep, v510) made that
 * untrue -- during the first five sessions the gate is due whatever the
 * log says -- so every re-mount asked again, and the loop only ended when
 * the fifth acknowledgement reached the taper floor.
 *
 * ⚫ Fixed in ONE place, not fourteen: an acknowledgement covers the rest
 * of the session it was given in. The session ends when the person goes
 * back to a hub screen (Home, Progress, Wellbeing, Settings, Library).
 * The taper itself is unchanged: the NEXT session still shows the note.
 *
 * This gate drives attachSafetyGate() -- the code every view uses -- and
 * the real router, never a copy of either.
 */
import { agreed } from "./agreed.mjs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, "navigator", { value: dom.window.navigator, configurable: true, writable: true });
Object.defineProperty(globalThis, "localStorage", { value: dom.window.localStorage, configurable: true, writable: true });
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const gate = await import(B + "safety-gate.js");
const { router } = await import(B + "router.js");
const { isGateDue, renderSafetyGate, attachSafetyGate, TAPER_SESSIONS } = gate;

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};

// The real router with view loading stubbed: its bookkeeping is under test.
router.viewCache = router.viewCache || {};
router._mountView = async () => {};
const goTo = async v => { try { await router.navigate(v); } catch { /* load side-effects only */ } };

// Mount the gate exactly as a session view does, tick, press Start, and
// report what the view would do on the re-mount the handler triggers.
function acknowledgeLikeAView(surface) {
  const app = document.getElementById("app");
  app.innerHTML = renderSafetyGate();
  let remountShowsGate = null;
  attachSafetyGate(app, {
    surface,
    onAcknowledge: () => { remountShowsGate = isGateDue(); },
    onLeave: () => {}
  });
  const box = app.querySelector("input[type=checkbox]");
  const start = [...app.querySelectorAll("button")].find(b => /start/i.test(b.textContent));
  if (box) { box.checked = true; box.dispatchEvent(new window.Event("change", { bubbles: true })); }
  if (start) start.click();
  return { remountShowsGate, reached: !!(box && start) };
}

function fresh() {
  localStorage.clear(); store.init(); agreed(store);
  if (typeof gate.endGateSession === "function") gate.endGateSession();
}

// ── 0. FIXTURE REACH ────────────────────────────────────────────────────
console.log("\nTEST 0 - the fixture reaches the taper it names");
fresh();
ok("0a. a brand-new user is due the note", isGateDue() === true);
const probe = acknowledgeLikeAView("workout");
ok("0b. the harness found the tick box and the Start button, and Start fired onAcknowledge",
   probe.reached && probe.remountShowsGate !== null,
   "if this fails, every assertion below is measuring nothing");
ok("0c. one acknowledgement is below the taper floor",
   (store.get("safetyAckLog") || []).length === 1 && TAPER_SESSIONS > 1);

// ── 1. ONCE PER SESSION ─────────────────────────────────────────────────
console.log("\nTEST 1 - one tick and one Start reach the session");
fresh();
const first = acknowledgeLikeAView("workout");
ok("1a. after acknowledging, the re-mount does NOT show the note again",
   first.remountShowsGate === false,
   "this is the loop: the view re-mounts, isGateDue() is still true during the taper, and the note comes back");
await goTo("workout");
ok("1b. moving on within the session (the view re-navigating to itself) keeps it away",
   isGateDue() === false);

// ── 2. THE TAPER STILL WORKS ────────────────────────────────────────────
console.log("\nTEST 2 - reversal: the next session still shows the note");
await goTo("today");
ok("2a. back on Home, the session has ended and the next one is due the note",
   isGateDue() === true,
   "the fix must end with the session, or the taper is silently gone");
for (const hub of ["progress", "noticing", "settings", "library"]) {
  fresh(); acknowledgeLikeAView("workout"); await goTo(hub);
  ok(`2b. leaving for ${hub} also ends the session`, isGateDue() === true);
}

// ── 3. FIVE SESSIONS, THEN THE MONTHLY RHYTHM ───────────────────────────
console.log("\nTEST 3 - the floor is reached one session at a time");
fresh();
let shownEachTime = true;
for (let i = 0; i < TAPER_SESSIONS; i++) {
  if (!isGateDue()) shownEachTime = false;
  acknowledgeLikeAView("workout");
  await goTo("today");
}
ok(`3a. the note was due at the start of each of the first ${TAPER_SESSIONS} sessions`, shownEachTime);
ok("3b. after the floor, a new session is not asked again (until 30 days)", isGateDue() === false);

console.log("");
if (fails) { console.log(`GATE-ONCE: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`GATE-ONCE: all ${passes} assertions pass\n`);
