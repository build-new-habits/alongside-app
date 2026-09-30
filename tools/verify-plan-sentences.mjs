/**
 * tools/verify-plan-sentences.mjs
 * 30 Sep 2026 v2
 *
 * v2 - W3-9 SORE-LINES. The four sore-area notes below the acute band no
 *   longer say "I've" (the builder takes care there, it does not move
 *   things out); they say what the plan holds. The claim table follows
 *   the new words with the SAME truth test for each: nothing changed but
 *   the pattern that finds the sentence.
 *
 * 29 Sep 2026 v1
 *
 * P9, PLAN SENTENCES (persona finding W2-10). The coach's sentence over a
 * plan named movements the plan did not have: "Hinging, bridging,
 * stepping" over plans with no step, "Push, pull, squat, hinge, brace"
 * over plans missing half of them, and "I've reduced overhead and heavy
 * pressing" above a Turkish Get-Up. The sentence was chosen by rotation
 * before the session was even trimmed to length.
 *
 * This gate reads the claim each sentence makes and checks it against
 * the exercises actually in the plan: every type, several lengths, with
 * and without sore areas, many builds. Then once on the real plan screen.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: /prefers-reduced-motion/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const SB = await import(B + "session-builder.js");
const gate = await import(B + "safety-gate.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));

// ── What a sentence claims, and what makes it true ───────────────────────
const P = e => e.movementPattern;
const isHinge  = e => P(e) === "hinge";
const isSquat  = e => P(e) === "squat";
const isSingle = e => P(e) === "lunge" || /single[- ]leg|split|step[- ]?up|lunge|pistol|bulgarian/i.test(e.name);
const isBridge = e => P(e) === "hip-extension" || /bridge|thrust/i.test(e.name);
const isStep   = e => /step/i.test(e.name) || P(e) === "lunge";
const isPush   = e => P(e) === "push";
const isPull   = e => P(e) === "pull";
const isBrace  = e => /^anti-|isometric/.test(P(e) || "");
const isCalf   = e => P(e) === "calf-raise";
const has = (list, f) => list.some(f);
const firstIdx = (list, f) => list.findIndex(f);
const lastIdx = (list, f) => list.map(f).lastIndexOf(true);
const touches = (e, area) => (e.affectsAreas || []).includes(area);

const CLAIMS = [
  [/Hinging, bridging, stepping/,                 m => has(m, isHinge) && has(m, isBridge) && has(m, isStep)],
  [/Bridges and hinges first, single-leg after/,  m => { const s = firstIdx(m, isSingle); return s > 0 && m.slice(0, s).some(e => isBridge(e) || isHinge(e)); }],
  [/Push, pull, squat, hinge, brace/,             m => [isPush, isPull, isSquat, isHinge, isBrace].every(f => has(m, f))],
  [/every major pattern|every pattern once|all the main patterns|nothing gets skipped/i, m => [isPush, isPull, e => isSquat(e) || isSingle(e), isHinge].every(f => has(m, f))],
  [/Squat, hinge, single-leg/,                    m => has(m, isSquat) && has(m, isHinge) && has(m, isSingle)],
  [/Two legs, then one leg/,                      m => { const s = firstIdx(m, isSingle); return s > 0 && m.slice(0, s).some(e => isSquat(e) || isHinge(e)); }],
  [/Squat and hinge are different jobs/,          m => has(m, isSquat) && has(m, isHinge)],
  [/single-leg after, calves last/,               m => has(m, isSingle) && m.length > 0 && isCalf(m[m.length - 1])],
  [/[Pp]ush and pull|pushing and pulling|Push, pull|Chest, back, shoulders, arms/, m => has(m, isPush) && has(m, isPull)],
  [/Pull first/,                                  m => has(m, isPull)],
  [/Bracing, anti-rotation, anti-extension/,      m => has(m, e => P(e) === "anti-rotation") && has(m, e => P(e) === "anti-extension")],
  [/Mostly holding still/,                        m => m.filter(isBrace).length * 2 > m.length],
  [/no overhead or heavy pressing in this plan/,         (m, all) => !all.some(e => touches(e, "shoulder") && (isPush(e) || /press|overhead|get-?up|snatch|jerk/i.test(e.name)))],
  [/no deep single-leg work in this plan/,             (m, all) => !all.some(e => isSingle(e) && touches(e, "knee"))],
  [/loads the spine under flexion/,               (m, all) => !all.some(e => (e.contraindications || []).includes("lower-back-acute"))],
  [/nothing in this plan loads it heavily/,                   (m, all) => !all.some(e => e.difficultyLevel >= 3 && touches(e, "lower-back"))],
  [/no heavy hinging in this plan/        ,       (m, all) => !all.some(e => isHinge(e) && e.difficultyLevel >= 3)],
];
function untrue(line, exercises) {
  const main = exercises.filter(e => (e.section || "main") === "main");
  return CLAIMS.filter(([rx, f]) => rx.test(line) && !f(main, exercises)).map(([rx]) => String(rx));
}

const KIT = ["dumbbells-light", "dumbbells-medium", "band-light", "kettlebell-medium", "bench-flat", "barbell", "pull-up-bar"];
function fixture(conditions = {}, completed = 0) {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", "personal");
  store.set("equipment", KIT); store.set("homeEquipment", KIT); store.set("gymEquipment", KIT);
  store.set("conditions", Object.keys(conditions)); store.set("conditionPainScores", conditions);
  store.set("activityLog", Array.from({ length: completed }, (_, i) => ({ id: "c" + i, type: "workout", status: "completed", completedAt: new Date(Date.now() - (i + 2) * 864e5).toISOString() })));
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
}

// ── 1. EVERY TYPE, EVERY ROTATION, SEVERAL LENGTHS ────────────────────────
console.log("\nTEST 1 - the sentence over a plan names only what is in it");
const TYPES = ["glute", "full", "lower", "upper", "core"];
{
  const bad = []; const seen = new Set(); let n = 0;
  for (const t of TYPES) for (let rot = 0; rot < 8; rot++) for (const d of [20, 30, 45]) {
    fixture({}, rot);
    const s = SB.buildSession({ sessionType: t, durationMins: d, equipmentOverride: KIT });
    if (!s) continue; n++;
    CLAIMS.forEach(([rx]) => rx.test(s.coachLine) && seen.add(String(rx)));
    const u = untrue(s.coachLine, s.exercises);
    if (u.length) bad.push(`${t} ${d}m rot ${rot}: ${u[0]}`);
  }
  ok("1pc. many plans built, and the claim table reaches the lines", n >= 100 && seen.size >= 6, `${n} plans, ${seen.size} claims seen`);
  ok("1a. no sentence names a movement the plan does not have", bad.length === 0, `${bad.length}: ` + bad.slice(0, 5).join("; "));
}

// ── 2. WITH SORE AREAS ────────────────────────────────────────────────────
console.log("\nTEST 2 - what the coach says it left out, it left out");
{
  const bad = []; const seen = new Set(); let n = 0;
  for (const cond of [{ shoulder: 5 }, { shoulder: 8 }, { knee: 5 }, { "lower-back": 5 }, { "lower-back": 8 }, { hamstring: 5 }])
    for (const t of TYPES) for (let rot = 0; rot < 4; rot++) {
      fixture(cond, rot);
      const s = SB.buildSession({ sessionType: t, durationMins: 30, equipmentOverride: KIT });
      if (!s || s.gentleCare) continue; n++;
      CLAIMS.slice(12).forEach(([rx]) => rx.test(s.coachLine) && seen.add(String(rx)));
      const u = untrue(s.coachLine, s.exercises);
      if (u.length) bad.push(`${Object.keys(cond)[0]} ${Object.values(cond)[0]} ${t}: ${u[0]} — ${s.exercises.filter(e => touches(e, "shoulder") || touches(e, "knee")).map(e => e.name).slice(0, 3).join(", ")}`);
    }
  ok("2pc. the sore-area notes were reached", n >= 60 && seen.size >= 3, `${n} plans, ${seen.size} notes seen`);
  ok("2a. no note claims a change the plan does not bear out", bad.length === 0, `${bad.length}: ` + bad.slice(0, 4).join("; "));
}

// ── 3. THE REAL PLAN SCREEN ───────────────────────────────────────────────
console.log("\nTEST 3 - the plan screen's sentence is true of the plan it shows");
{
  const rtr = { navigate() {}, back() {}, history: [] };
  globalThis.window.router = rtr;
  const { CoachProposalView } = await import(B + "views/coach-proposal.js");
  const bad = []; let n = 0;
  for (let rot = 0; rot < 8; rot++) {
    fixture({}, rot);
    const main = document.getElementById("main-content"); main.innerHTML = "";
    CoachProposalView(rtr).mount(main); await wait(30);
    const text = (main.textContent || "").replace(/\s+/g, " ");
    main.querySelector("#cp-preview-start")?.click(); await wait(2200);
    const s = store.get("generatedSession")?.session;
    if (!s) continue; n++;
    const line = s.rationale || s.coachLine || "";
    if (!text.includes(line.slice(0, 40))) bad.push(`not shown: ${line.slice(0, 40)}`);
    const u = untrue(line, s.exercises);
    if (u.length) bad.push(`rot ${rot}: ${u[0]}`);
  }
  ok("3pc. plans were proposed and started", n >= 6, `${n}`);
  ok("3a. the sentence shown is true of the plan started", bad.length === 0, bad.slice(0, 4).join("; "));
}

console.log("");
if (fails) { console.log(`PLAN-SENTENCES: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`PLAN-SENTENCES: all ${passes} assertions pass\n`);
process.exit(0);
