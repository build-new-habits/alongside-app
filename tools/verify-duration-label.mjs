/**
 * tools/verify-duration-label.mjs
 * 29 Sep 2026 v1
 *
 * P6, DURATION-LABEL (persona finding W2-8, seen by seven of eight). The
 * builder labelled a 30-minute session "65–75 mins". Two sums existed:
 * exerciseSeconds() (SMOOTH-P2b, the one the coach's plan and the trim
 * use) and an older inline sum in buildSession() and
 * buildSessionFromSelection() that multiplied `duration` by `sets` even
 * when `duration` was already the whole exercise. The label came from
 * the old sum, widened to a ten-minute range.
 *
 * Every length shown for a built session must be within a minute of the
 * exerciseSeconds() total of the exercises in it:
 *   1. buildSession(), every type, four lengths;
 *   2. buildSessionFromSelection();
 *   3. the builder's preview screen, as a person sees it;
 *   4. the coach's plan screen: its header, and its sections adding up
 *      to the header.
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
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const rtr = { navigate() {}, back() {}, history: [] };
globalThis.window.router = rtr;
Object.defineProperty(globalThis, "router", { value: rtr, configurable: true, writable: true });

const KIT = ["dumbbells-light", "dumbbells-medium", "band-light", "kettlebell-medium", "bench-flat", "barbell", "treadmill", "exercise-bike", "rowing-machine"];
localStorage.clear(); store.init();
store.set("onboardingComplete", true); store.set("tier", "personal");
store.set("equipment", KIT); store.set("homeEquipment", KIT); store.set("gymEquipment", KIT);
store.set("conditions", []); store.set("conditionPainScores", {});
for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
gate.endGateSession();

const trueMins = ex => (ex || []).reduce((n, e) => n + SB.exerciseSeconds(e), 0) / 60;
// Every number in a label, each within a minute of the truth.
const labelOk = (label, mins) => { const ns = String(label || "").match(/\d+/g) || []; return ns.length > 0 && ns.every(n => Math.abs(+n - mins) <= 1); };

// ── 1. buildSession ─────────────────────────────────────────────────────
console.log("\nTEST 1 - buildSession: every type, four lengths");
{
  const bad = []; let n = 0;
  for (const t of SB.SESSION_TYPES) for (const d of [20, 30, 45, 60]) {
    const s = SB.buildSession({ sessionType: t.id, durationMins: d, equipmentOverride: KIT });
    if (!s || s.gentleCare) continue; n++;
    const m = trueMins(s.exercises);
    if (!labelOk(s.duration, m)) bad.push(`${t.id} ${d}: "${s.duration}" for ${m.toFixed(1)} min`);
  }
  ok("1pc. sessions were built", n >= 30, `${n}`);
  ok("1a. every label is within a minute of the exercises it holds", bad.length === 0, `${bad.length} of ${n}: ` + bad.slice(0, 5).join("; "));
}

// ── 2. buildSessionFromSelection ─────────────────────────────────────────
console.log("\nTEST 2 - buildSessionFromSelection");
{
  const pools = SB.buildCandidatePools({ sessionType: "full", durationMins: 30, equipmentOverride: KIT });
  const ids = Object.values(pools).flat().slice(0, 8).map(e => e.id);
  const s = SB.buildSessionFromSelection({ sessionType: "full", durationMins: 30, selectedIds: ids, equipmentOverride: KIT });
  ok("2pc. a chosen session was built", !!s && s.exercises.length > 0);
  ok("2a. its label is within a minute of what is in it", !!s && labelOk(s.duration, trueMins(s.exercises)), `"${s?.duration}" for ${trueMins(s?.exercises).toFixed(1)} min`);
}

// ── 3. THE BUILDER'S PREVIEW, AS SEEN ─────────────────────────────────────
console.log("\nTEST 3 - the builder's preview screen");
{
  const ui = await import(B + "views/session-builder-ui.js");
  main.innerHTML = ui.render(); ui.onMount();
  const $ = s => main.querySelector(s), $$ = s => [...main.querySelectorAll(s)];
  click($$(".sb-type-tile").find(b => b.dataset.type === "full"));
  click($("#sb-location-continue-btn"));
  click($$(".sb-duration-btn").find(b => b.dataset.mins === "30"));
  click($("#sb-build-btn"));
  click($$(".sb-buildmode-btn").find(b => b.dataset.mode === "coach"));
  await wait(1400);
  const s = store.get("generatedSession")?.session;
  const shown = txt(main).match(/(\d+)(?:\s*[–-]\s*(\d+))?\s*mins?\b[^·]*·\s*\d+\s+exercises/);
  ok("3pc. the preview is on screen with a length", !!$("#sb-go-btn") && !!shown, txt(main).slice(0, 200));
  ok("3a. the length shown is the length of the session", !!shown && !!s && labelOk(shown[0].replace(/·.*$/, ""), trueMins(s.exercises)),
     `shown "${shown?.[0]}" for ${trueMins(s?.exercises).toFixed(1)} min`);
}

// ── 4. THE COACH'S PLAN (CONTROL) ─────────────────────────────────────────
console.log("\nTEST 4 - the coach's plan screen (control: already one sum)");
{
  const { CoachProposalView } = await import(B + "views/coach-proposal.js");
  main.innerHTML = ""; CoachProposalView(rtr).mount(main); await wait(40);
  const meta = txt(main.querySelector(".cp-plan__meta"));
  const shownList = [...main.querySelectorAll(".cp-plan__row")].length;
  ok("4pc. the plan is on screen", shownList > 0 && /About \d+ min/.test(meta), meta);
  const groupSum = [...main.querySelectorAll(".cp-plan__group-title")].reduce((a, h) => a + (+(txt(h).match(/(\d+) min/)?.[1] || 0)), 0);
  ok("4b. and the sections add up to it: one plan, one number", groupSum === +(meta.match(/About (\d+) min/)?.[1] || -1), `sections ${groupSum}, header "${meta}"`);
  // The plan's own list, from what it would start.
  main.querySelector("#cp-preview-start")?.click(); await wait(2500);
  const started = store.get("generatedSession")?.session?.exercises || [];
  ok("4a. its minutes are the exercises' minutes", started.length === shownList && labelOk(meta.match(/About (\d+) min/)?.[1], trueMins(started)),
     `"${meta}" for ${trueMins(started).toFixed(1)} min`);
}

console.log("");
if (fails) { console.log(`DURATION-LABEL: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`DURATION-LABEL: all ${passes} assertions pass\n`);
process.exit(0);
