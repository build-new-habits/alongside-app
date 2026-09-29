/**
 * tools/verify-length-dose.mjs
 * 29 Sep 2026 v1
 *
 * P24, LENGTH AND DOSE (persona finding W2-20).
 *   - Yoga's length cards said "20 min · 5 poses"; the persona got four
 *     poses and about four minutes. Poses hold 45-60 seconds: the minutes
 *     were a name, not the content.
 *   - The default dose (3 x 10) replaced the dose 35 library entries write
 *     themselves in words the reader did not know: "Complete 10 reps each
 *     side, 3 sets", "Complete 15 reps each side", "Take 10 steps right,
 *     then 10 steps left -- that is one set", "Hold for 30 to 60 seconds".
 *   - Nothing asked how long a session somebody has; the plan assumed 30
 *     minutes and its Length control cycles through six values.
 *
 * Fix column: label from content; the dose reader reads more wordings.
 *
 *   1. Every counted strength entry that writes its own dose gets it, not
 *      3 x 10 -- checked against the words, entry by entry; and through
 *      the real builder.
 *   2. Yoga: each length card says what that session is (about N min, N
 *      poses), built before the card is shown, and plays exactly that.
 *   3. Settings asks how long you usually have; the plan starts from it.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: true, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(0), 0);
dom.window.requestAnimationFrame = globalThis.requestAnimationFrame;
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");
const SB = await import(B + "session-builder.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
let navs = [];
const rtr = { navigate: v => navs.push(v), back() {}, history: [] };
globalThis.window.router = rtr;
Object.defineProperty(globalThis, "router", { value: rtr, configurable: true, writable: true });

function person() {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", "personal"); store.set("name", "Sam");
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("conditions", []); store.set("equipment", []);
}

// ── 1. THEIR OWN DOSE ───────────────────────────────────────────────────
console.log("\nTEST 1 - an entry's own dose, in its own words, beats 3 x 10");
person();
const byId = id => EXERCISES.find(e => e.id === id);
const main_ = id => ({ ...byId(id), section: "main" });
const CASES = [
  ["kettlebell-row",               3, /^10 each side$/],
  ["clamshell",                    null, /^15 each side$/],
  ["reverse-lunge-glute-focus",    3, /^10 each (leg|side)$/],
  ["hip-thrust-bodyweight",        3, /^12$/],
  ["glute-bridge-march",           3, /^10$/],
  ["step-up-glute-focus",          null, /^10 each side$/],
  ["side-lying-hip-abduction",     null, /^15 each side$/],
  ["resistance-band-walk-lateral", 3, /^10 each side$/],
  ["kettlebell-figure-8",          3, /^10 each direction$/],
  ["deep-squat-hold",              null, /^30–60 seconds$/],
  ["rehab-shoulder-y-t-w",         3, /^10 of each$/],
  ["plyo-single-leg-hop",          3, null],
];
for (const [id, sets, reps] of CASES) {
  const e = byId(id);
  if (!e) { ok(`1-${id}. in the library`, false); continue; }
  const d = SB.withDefaultDose(main_(id), "moderate");
  const setsOk = sets === null ? true : d.sets === sets;
  const repsOk = reps === null ? true : reps.test(String(d.reps));
  ok(`1-${id}. ${d.sets} x ${d.reps} (from the words)`, d._doseFrom === "instructions" && setsOk && repsOk,
     `${d.sets} x ${d.reps}, from ${d._doseFrom}; words: ${(e.instructions || []).slice(-2).join(" | ")}`);
}
// Every counted strength entry that states a dose in its words.
const SCOPE = e => e.reps == null && ["hinge", "squat", "lunge", "push", "pull", "hip-extension", "hip-abduction", "calf-raise"].includes(e.movementPattern) &&
  !["conditioning", "easy-cardio", "cardio-warmup", "pilates", "loaded-carry"].includes(e.category);
const SAYS = /complete\s+\d+\s+(slow\s+|full\s+)?(reps?|swings|steps|figure-8)|\d+\s+sets\b|repeat for \d+ reps|\d+ reps on the right|hold for \d+\s*(to|–|-)\s*\d+\s+seconds/i;
const stated = EXERCISES.filter(e => SCOPE(e) && (e.instructions || []).some(l => SAYS.test(l)));
const missed = stated.filter(e => SB.withDefaultDose({ ...e, section: "main" }, "moderate")._doseFrom !== "instructions").map(e => e.id);
ok(`1a. all ${stated.length} entries that state a dose keep it`, stated.length >= 60 && missed.length === 0, `${missed.length} missed: ${missed.join(", ")}`);
ok("1b. a gentle day still takes a set off a written dose", SB.withDefaultDose(main_("kettlebell-row"), "low").sets === 2);
ok("1c. control: an entry with no dose in its words still gets 3 x 10", (() => { const e = EXERCISES.find(x => SCOPE(x) && !(x.instructions || []).some(l => SAYS.test(l) || /\bsets? of\b/i.test(l))); const d = SB.withDefaultDose({ ...e, section: "main" }, "moderate"); return d.sets === 3 && /^10/.test(d.reps) && d._doseFrom !== "instructions"; })());
{
  // Through the real builder: any of these in a built session shows its own dose.
  const ids = new Set(stated.map(e => e.id));
  const seen = []; const wrong = [];
  store.set("equipment", ["kettlebell-medium", "band-medium", "dumbbells-light", "yoga-mat", "mini-bands"]);
  for (const t of ["glute", "lower", "upper", "full"]) for (let i = 0; i < 8; i++) {
    for (const ex of SB.buildSession({ sessionType: t, durationMins: 30 }).exercises) {
      if (!ids.has(ex.id) || ex.section !== "main") continue;
      seen.push(ex.id);
      if (ex._doseFrom !== "instructions") wrong.push(`${ex.id} ${ex.sets}x${ex.reps}`);
    }
  }
  ok("1d. through the real builder, every one met shows its own dose", seen.length >= 5 && wrong.length === 0, `${seen.length} met; wrong: ${wrong.slice(0, 5).join(", ")}`);
}

// ── 2. YOGA SAYS WHAT IT IS ─────────────────────────────────────────────
console.log("\nTEST 2 - yoga's length cards say what the session is");
const yoga = await import(B + "views/yoga-session.js");
const paint = () => { main.innerHTML = yoga.render(); try { yoga.onMount(); } catch {} };
{
  person(); store.set("equipment", ["yoga-mat"]);
  paint();
  click(main.querySelector('[data-focus="flexibility"]')); await wait(10); paint();
  if (!main.querySelector("[data-mins]") && main.querySelector("[data-target]")) { click(main.querySelector("[data-target]")); await wait(10); paint(); }
  const cards = [...main.querySelectorAll("[data-mins]")];
  ok("2pc. the length choice", cards.length >= 1, txt(main).slice(0, 120));
  const said = cards.map(c => ({ mins: +c.dataset.mins, text: txt(c) }));
  ok("2a. no card names a length the session is not (\"20 min\")", said.every(s => !new RegExp(`^${s.mins} min`).test(s.text)), said.map(s => s.text).join(" | "));
  const first = cards[0];
  const m = txt(first).match(/About (\d+) min/); const p = txt(first).match(/(\d+) poses?/);
  click(first); await wait(10); paint();
  const names = [...main.querySelectorAll(".gym-exercise-name")].map(txt);
  const secs = yoga.currentSessionSeconds();
  ok("2b. the card's pose count is the session's", !!p && +p[1] === names.length, `${p?.[1]} vs ${names.length}`);
  ok("2c. the card's minutes are the session's, to the nearest minute", !!m && secs !== null && Math.abs(+m[1] - Math.round(secs / 60)) <= 1 && +m[1] >= 1, `${m?.[1]} vs ${secs}s`);
  ok("2d. the overview says the same", new RegExp(`About ${m?.[1]} min`).test(txt(main)) && new RegExp(`${names.length} poses`).test(txt(main)), txt(main).slice(0, 160));
  const texts = cards.map(txt);
  ok("2e. no two cards offer the same session", new Set(texts.map(t => (t.match(/About \d+ min · \d+ poses/) || [t])[0])).size === texts.length, texts.join(" | "));
}

// ── 3. HOW LONG YOU USUALLY HAVE ────────────────────────────────────────
console.log("\nTEST 3 - Settings asks how long you usually have; the plan starts from it");
{
  person();
  const { SettingsView } = await import(B + "views/settings.js");
  main.innerHTML = ""; SettingsView(rtr).mount(main); await wait(20);
  const row = [...main.querySelectorAll(".settings-row")].find(r => /How long you usually have/.test(txt(r)));
  ok("3a. a row: \"How long you usually have\"", !!row, [...main.querySelectorAll(".settings-row")].map(txt).slice(0, 12).join(" | "));
  click(row); await wait(20);
  const sel = main.querySelector("#settings-usual-length");
  ok("3b. a real choice, every length the plan knows", !!sel && sel.options.length >= 6, sel ? [...sel.options].map(o => o.textContent).join(", ") : "");
  if (sel) { sel.value = "quick"; sel.dispatchEvent(new dom.window.Event("change", { bubbles: true })); await wait(20); }
  ok("3c. choosing 20 minutes is what the plan reads", store.get("availableTime") === "quick", String(store.get("availableTime")));
  const { CoachProposalView } = await import(B + "views/coach-proposal.js");
  main.innerHTML = ""; CoachProposalView(rtr).mount(main); await wait(40);
  const len = [...main.querySelectorAll("#cp-time")].map(txt).join(" ");
  ok("3d. the plan's Length says 20 min", /20 min/.test(len), len);
}

console.log("");
if (fails) { console.log(`LENGTH-DOSE: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`LENGTH-DOSE: all ${passes} assertions pass\n`);
process.exit(0);
