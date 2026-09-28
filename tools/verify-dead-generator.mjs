/**
 * tools/verify-dead-generator.mjs
 * 28 Sep 2026 v1
 *
 * Work list 2e. DEAD-GATES, retired and re-pointed.
 *
 * workoutGenerator.js has had no caller since TWO-ENGINE (6 Sep). Ten
 * gates went on proving behaviour against it: seven by reading its
 * source, three by importing it. A gate that proves a file nobody runs
 * is green for ever, whatever happens on the screen. So the file goes,
 * and with it everything only it called, and each of the ten now proves
 * the path the app actually takes (see each gate's header).
 *
 * FOUND INSIDE 2e, and fixed here because it is the same fault seen
 * from the other side. "That was too easy" on every exercise screen
 * answered "Noted -- I'll push this on". The only thing that read a
 * too-easy tap was applyFeedbackWeighting(), called only by
 * getSuitableExercises(), called only by the dead generator. The app
 * made a promise nothing kept (the honesty rule). Now the next time that
 * exercise comes up on a settled day, the coach suggests a step up, and
 * the button says what will happen. TEST 5 drives the real player.
 *
 * Also found: "Noted -- I'll ease this off" after ONE tap. The live
 * reader (tooHardRecently) deliberately waits for two of the last five,
 * so one hard day moves nothing (P4). The words now say that.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const fs = __require("node:fs");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s).replace(/["\\]/g, "\\$&") };   // jsdom has no CSS.escape

const R = new URL("../", import.meta.url);
const read = p => { try { return fs.readFileSync(new URL(p, R), "utf8"); } catch { return null; } };
const exists = p => fs.existsSync(new URL(p, R));
const strip = s => (s || "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const walk = rel => fs.readdirSync(new URL(rel, R), { withFileTypes: true }).flatMap(d =>
  d.isDirectory() ? walk(rel + d.name + "/") : (d.name.endsWith(".js") ? [rel + d.name] : []));

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};

const JS = walk("js/");

// ── 0. FIXTURE REACH ────────────────────────────────────────────────────
console.log("\nTEST 0 - the scan reaches the app");
ok("0a. the walk finds the app's modules, not nothing", JS.length > 100 && JS.includes("js/session-builder.js"), `${JS.length} files`);

// ── 1. THE ENGINE IS GONE ───────────────────────────────────────────────
console.log("\nTEST 1 - the dead engine is gone, and nothing reaches for it");
ok("1a. js/data/workoutGenerator.js no longer exists", !exists("js/data/workoutGenerator.js"));
ok("1b. nor its import shim js/data/exercises.js (only the engine used it)", !exists("js/data/exercises.js"));
const importers = JS.filter(f => /from\s*['"][^'"]*(workoutGenerator|data\/exercises|\.\/exercises)\.js['"]/.test(strip(read(f))));
ok("1c. no module imports either file", importers.length === 0, importers.join(", "));
const sw = read("sw.js") || "";
ok("1d. the service worker does not precache either (it would fail the install)",
   !/"\/alongside-app\/js\/data\/(workoutGenerator|exercises)\.js"/.test(sw));
const gates = fs.readdirSync(new URL("tools/", R)).filter(f => /^verify-.*\.mjs$/.test(f) && f !== "verify-dead-generator.mjs");
const deadReaders = gates.filter(f => /(readFileSync|_read|import)\([^)]*workoutGenerator\.js/.test(strip(read("tools/" + f))));
ok("1e. no gate reads or imports it any more", deadReaders.length === 0, deadReaders.join(", "));
ok("1f. the record is kept, outside the app: Documents/Archive", fs.readdirSync(new URL("Documents/Archive/", R)).some(f => /^workoutGenerator_retired_28sep2026\.js$/.test(f)));
ok("1g. and verify-intensity-space, which proved only that engine, is retired", !exists("tools/verify-intensity-space.mjs"));

// ── 2. THE ONE CONSTANT IT HELD THAT THE APP USES ──────────────────────
console.log("\nTEST 2 - the time window constant has its own home");
const TW = exists("js/data/time-windows.js") ? await import(new URL("js/data/time-windows.js", R).href) : {};
ok("2a. js/data/time-windows.js exports the same six windows",
   JSON.stringify(TW.AVAILABLE_TIME_WINDOW_MINUTES) === JSON.stringify({ micro: 10, quick: 20, short: 30, standard: 40, long: 50, open: 60 }),
   JSON.stringify(TW.AVAILABLE_TIME_WINDOW_MINUTES));
const readers = JS.filter(f => /\bAVAILABLE_TIME_WINDOW_MINUTES\b/.test(strip(read(f))) && f !== "js/data/time-windows.js");
ok("2b. both live readers import it from there",
   readers.sort().join(",") === "js/views/coach-proposal.js,js/views/know-what.js" &&
   readers.every(f => /import\s*\{[^}]*AVAILABLE_TIME_WINDOW_MINUTES[^}]*\}\s*from\s*['"]\.\.\/data\/time-windows\.js['"]/.test(read(f))),
   readers.join(", "));

// ── 3. WHAT ONLY THE ENGINE CALLED GOES WITH IT ────────────────────────
console.log("\nTEST 3 - helpers with no caller left are gone, not kept for tests");
const CI = await import(new URL("js/data/checkin.js", R).href);
const EX = await import(new URL("js/data/exercises/index.js", R).href);
ok("3a. resolveIntensity() is gone (its only caller was the engine)", !("resolveIntensity" in CI) && !("resolveIntensity" in (CI.checkinData || {})));
const gone = ["getSuitableExercises", "filterByEnergy", "filterToRecoveryPool", "filterByFitnessLevel", "applyFeedbackWeighting", "getCautionExercises"];
ok("3b. the engine's own pool chain is gone: " + gone.join(", "), gone.every(n => !(n in EX)), gone.filter(n => n in EX).join(", "));
const liveUse = gone.concat("resolveIntensity").filter(n => JS.some(f => new RegExp(`\\b${n}\\s*\\(`).test(strip(read(f)))));
ok("3c. and nothing in the app still calls any of them", liveUse.length === 0, liveUse.join(", "));
const { store } = await import(new URL("js/store.js", R).href);
localStorage.clear();
localStorage.setItem("alongside_user", JSON.stringify({ proposalBias: "lighter", onboardingComplete: true }));
store.init();
ok("3d. proposalBias (read only by resolveIntensity) is retired: not a default, and dropped on load",
   !("proposalBias" in store.getDefaults()) && store.get("proposalBias") === undefined &&
   (() => { store.set("name", "T"); return !/"proposalBias"/.test(localStorage.getItem("alongside_user") || ""); })(),
   `default: ${"proposalBias" in store.getDefaults()}, loaded: ${JSON.stringify(store.get("proposalBias"))}`);

// ── 4. THE LIVE SIGNALS STILL HAVE LIVE CALLERS ────────────────────────
console.log("\nTEST 4 - what the ten gates guarded is on the live path");
const sb = strip(read("js/session-builder.js"));
ok("4a. the live builder reads coachBias(), detectBurnout() and sleepQuality",
   /coachBias\(\)/.test(sb) && /detectBurnout\(store\.get\("checkinHistory"\)/.test(sb) && /sleepQuality/.test(sb));
ok("4b. and excludes session-length content with the shared rule", /isSessionLength\(ex\)/.test(sb));
ok("4c. the coach route builds through it", /import\s*\{[^}]*\bbuildSession\b[^}]*\}\s*from\s*'\.\.\/session-builder\.js'/.test(read("js/views/coach-proposal.js")));

// ── 5. "TOO EASY" IS KEPT ───────────────────────────────────────────────
console.log("\nTEST 5 - a too-easy tap changes what the coach says next time (the real player)");
const { HURT_AND_ACHE_VERSION } = await import(new URL("js/exercise-card.js", R).href);
const workout = await import(new URL("js/views/workout.js", R).href);
const main = document.getElementById("main-content");
function paint() { main.innerHTML = workout.render(); try { workout.onMount(); } catch { /* the render is what is read */ } }
const _router = { navigate(v) { if (v === "workout") paint(); }, back() {} };
globalThis.window.router = _router;
Object.defineProperty(globalThis, "router", { value: _router, configurable: true, writable: true });
const ROW = { id: "fixture-row", name: "Dumbbell Row", section: "main", role: "main", category: "horizontal-pull",
  movementPattern: "pull", equipment: ["dumbbell"], affectsAreas: ["upper-back"], credits: 20,
  sets: 3, reps: "10", rest: 60, duration: 220, instructions: ["Hinge", "Pull to the hip"],
  watchOut: ["Twisting as you pull"], coaching: "Keep the back flat." };
function player({ feedback = [], sore = false, energy = "moderate", lifted = true } = {}) {
  workout.onUnmount?.();
  localStorage.clear(); store.init();
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("tier", "personal"); store.set("liftLogEnabled", true); store.set("todayIntensity", energy);
  if (lifted) store.logLift("fixture-row", { weight: 16, reps: 10 });
  for (const f of feedback) store.logExerciseFeedback("fixture-row", f);
  if (sore) { store.set("conditions", ["upper-back"]); store.set("conditionPainScores", { "upper-back": 6 }); }
  store.set("generatedSession", { session: { id: "s", name: "Upper Body", exercises: [ROW] }, builtAt: new Date().toISOString(), inputs: {} });
  paint();
  return (main.querySelector(".slog__invite")?.textContent || "").trim();
}
const up = /too easy last time/i;
let line = player({ feedback: ["too-easy"] });
ok("5a. said too easy last time: on a settled day the coach suggests a step up", up.test(line) && /step up/i.test(line), line);
line = player({ feedback: ["too-easy"], lifted: false });
ok("5b. even with no weight logged yet", up.test(line), line);
line = player({ feedback: [] });
ok("5c. REVERSAL: without the tap, it does not", !up.test(line), line);
line = player({ feedback: ["too-easy", "too-hard"] });
ok("5d. REVERSAL: a later too-hard tap replaces it", !up.test(line), line);
line = player({ feedback: ["too-easy"], sore: true });
ok("5e. a sore area that this works still wins: no pushing into it", !up.test(line) && /sore/i.test(line), line);
line = player({ feedback: ["too-easy"], energy: "low" });
ok("5f. a low day still holds steady", !up.test(line) && /holding steady/i.test(line), line);

player({ feedback: [] });
const tapBtn = v => main.querySelector(`[data-feedback="${v}"]`)?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
main.querySelector("#wo-set-done-btn")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
main.querySelector("#wo-set-done-btn")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
main.querySelector("#wo-set-done-btn")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const reached = !!main.querySelector('[data-feedback="too-easy"]');
ok("5g. FIXTURE REACH: the too-easy button is on the player after the sets", reached);
tapBtn("too-easy");
const easyOn = main.querySelector('[data-feedback="too-easy"]')?.textContent.trim();
ok("5h. its answer says what will happen, and nothing more", easyOn === "Noted — I'll suggest a step up next time", easyOn);
tapBtn("too-hard");
const hardOn = main.querySelector('[data-feedback="too-hard"]')?.textContent.trim();
ok("5i. one too-hard tap does not claim to ease it off (two of five do)", hardOn === "Noted — if it keeps happening, I'll ease it off", hardOn);
const src = strip(read("js/exercise-feedback.js"));
ok("5j. neither old promise survives anywhere in the control", !/push this on|I'll ease this off"/.test(src));

console.log("");
if (fails) { console.log(`DEAD-GENERATOR: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`DEAD-GENERATOR: all ${passes} assertions pass\n`);
process.exit(0);
