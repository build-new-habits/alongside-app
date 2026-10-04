/**
 * tools/verify-figures.mjs
 * 04 Oct 2026 v1
 *
 * D-4 FIGURES. Graeme, 04 Oct: "Love it. Absolutely love it. Please do
 * these, obviously in batches, for all of the exercises."
 *
 *   1. Every exercise in the library has a figure, and every figure is a
 *      real exercise.
 *   2. Every frame has a caption (1-40 characters) and a description a
 *      screen reader can use (25 or more), one to three frames each, and
 *      every point it draws is inside its frame.
 *   3. A figure is drawn in the app's colour tokens (classes, no colour in
 *      the markup), each frame is role="img" named by its description, the
 *      group is "How it looks", and arrowhead ids never repeat on a page.
 *   4. The player's How step shows the exercise's figure, above the steps in
 *      words; Why and Watch out do not.
 *   5. The plan's exercise sheet shows it in How.
 *   6. On the paged cards' DO page the figure replaces "Photographs are
 *      being added"; an exercise with no figure keeps that line.
 *   7. Every batch file carries its "DD Mon YYYY vN" header.
 */
import fs from "node:fs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="main-content"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");
const { FIGURES } = await import(B + "data/figures/index.js");
const FG = await import(B + "figures.js");
const CARD = await import(B + "exercise-card.js");
const gate = await import(B + "safety-gate.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${String(detail).slice(0, 600)}`); }
};
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const frag = html => { const d = document.createElement("div"); d.innerHTML = html; return d; };

// ── 1. COVERAGE ─────────────────────────────────────────────────────────
console.log("\nTEST 1 - every exercise has a figure");
const ids = new Set(EXERCISES.map(e => e.id));
const missing = [...ids].filter(id => !FG.hasFigure(id));
const stray = Object.keys(FIGURES).filter(id => !ids.has(id));
ok(`1a. all ${ids.size} exercises are drawn`, ids.size > 500 && missing.length === 0, missing.slice(0, 20).join(", "));
ok("1b. every figure is a real exercise", stray.length === 0, stray.join(", "));

// ── 2. EACH FRAME ───────────────────────────────────────────────────────
console.log("\nTEST 2 - every frame is captioned, described and inside its frame");
const bad = { frames: [], cap: [], alt: [], out: [], w: [] };
for (const [id, fig] of Object.entries(FIGURES)) {
  const w = fig.w || 160;
  if (![160, 180, 190, 200].includes(w)) bad.w.push(id);
  if (!Array.isArray(fig.f) || fig.f.length < 1 || fig.f.length > 3) { bad.frames.push(id); continue; }
  fig.f.forEach((fr, i) => {
    if (!fr.l || fr.l.length > 40) bad.cap.push(`${id}[${i}]`);
    if (!fr.a || fr.a.length < 25) bad.alt.push(`${id}[${i}]`);
    const { points } = FG.framePoints(fig, fr);
    if (points.some(([x, y]) => !Number.isFinite(x) || !Number.isFinite(y) || x < 2 || x > w - 2 || y < 2 || y > 198)) bad.out.push(`${id}[${i}]`);
  });
}
ok("2a. one to three frames each", bad.frames.length === 0, bad.frames.join(", "));
ok("2b. every frame has a caption of 1-40 characters", bad.cap.length === 0, bad.cap.join(", "));
ok("2c. every frame has a description (25+ characters)", bad.alt.length === 0, bad.alt.join(", "));
ok("2d. every point of every frame is inside it", bad.out.length === 0, bad.out.join(", "));
ok("2e. frame widths are one of 160, 180, 190, 200", bad.w.length === 0, bad.w.join(", "));

// ── 3. HOW IT IS DRAWN ──────────────────────────────────────────────────
console.log("\nTEST 3 - drawn in tokens, named for a screen reader");
const html = FG.renderFigure("goblet-squat");
const g = frag(html).firstElementChild;
const svgs = [...g.querySelectorAll("svg")];
ok("3a. a group named \"How it looks\" holding one frame per position, each captioned",
   g.getAttribute("role") === "group" && g.getAttribute("aria-label") === "How it looks" &&
   svgs.length === FIGURES["goblet-squat"].f.length &&
   [...g.querySelectorAll("figcaption")].map(txt).join("|") === FIGURES["goblet-squat"].f.map(f => f.l).join("|"));
ok("3b. each frame is role=img named by its description, and not focusable",
   svgs.every((s, i) => s.getAttribute("role") === "img" && s.getAttribute("aria-label") === FIGURES["goblet-squat"].f[i].a && s.getAttribute("focusable") === "false"));
const allHtml = Object.keys(FIGURES).map(id => FG.renderFigure(id)).join("");
ok("3c. no colour written into any figure: every colour is a class on the app's tokens",
   !/(fill|stroke|style)="[^"]*#[0-9a-f]{3,6}/i.test(allHtml) && !/style="/.test(allHtml));
const markerIds = [...allHtml.matchAll(/<marker id="([^"]+)"/g)].map(m => m[1]);
ok("3d. arrowhead ids never repeat, however many figures a page draws", markerIds.length > 500 && new Set(markerIds).size === markerIds.length, `${markerIds.length} markers, ${new Set(markerIds).size} unique`);
const css = fs.readFileSync(new URL("../css/base/global.css", import.meta.url), "utf8");
ok("3e. the figure colours are tokens, and forced colours are handled",
   /\.fig-body \{[^}]*var\(--color-text\)/.test(css) && /\.fig-move \{[^}]*var\(--color-primary\)/.test(css) &&
   /\.fig-wt \{[^}]*var\(--kind-amber\)/.test(css) && /forced-colors: active[\s\S]*\.fig-body/.test(css));
ok("3f. no figure for an unknown id, and nothing thrown", FG.renderFigure("no-such-exercise") === "" && FG.renderFigure(null) === "");

// ── 4. THE PLAYER'S HOW STEP ────────────────────────────────────────────
console.log("\nTEST 4 - the How step shows it");
const ex = EXERCISES.find(e => e.id === "goblet-squat");
const how = frag(CARD.renderExerciseCard(ex, { layout: "steps", step: "how" }));
const fig = how.querySelector(".xfig");
const list = how.querySelector(".xcard-how");
ok("4a. How shows the exercise's figure", !!fig && fig.querySelectorAll("svg[role=img]").length === FIGURES["goblet-squat"].f.length);
ok("4b. above the steps in words", !!fig && !!list && (fig.compareDocumentPosition(list) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING) !== 0);
ok("4c. Why and Watch out do not show it",
   !frag(CARD.renderExerciseCard(ex, { layout: "steps", step: "why" })).querySelector(".xfig") &&
   !frag(CARD.renderExerciseCard(ex, { layout: "steps", step: "watch" })).querySelector(".xfig"));

// ── 5. THE PLAN'S EXERCISE SHEET ────────────────────────────────────────
console.log("\nTEST 5 - the plan's exercise sheet shows it");
localStorage.clear(); store.init(); gate.endGateSession();
store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", "personal");
store.set("gymEquipment", ["dumbbells-medium", "bench-flat"]); store.set("homeEquipment", []); store.set("equipment", ["dumbbells-medium", "bench-flat"]);
for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
gate.endGateSession();
const { CoachProposalView } = await import(B + "views/coach-proposal.js");
const main = document.getElementById("main-content");
CoachProposalView({ navigate() {}, back() {} }).mount(main);
const opener = main.querySelector("[data-preview]");
opener?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const sheet = main.querySelector("#cp-xprev");
const rowId = main.querySelector(`.cp-plan__row[data-plan-index="${opener?.dataset.preview}"]`)?.dataset.exerciseId;
ok("5a. the sheet's How starts with that exercise's figure",
   !!sheet && FG.hasFigure(rowId) && !!sheet.querySelector('[data-xprev-part="how"] .xfig') &&
   sheet.querySelector('[data-xprev-part="how"] .xfig svg')?.getAttribute("aria-label") === FIGURES[rowId]?.f[0].a,
   `${rowId} ${!!sheet}`);

// ── 6. THE PAGED CARDS ──────────────────────────────────────────────────
console.log("\nTEST 6 - the DO page: the figure, or the placeholder when there is none");
const doPage = frag(CARD.renderExerciseCard(ex, { page: "do" }));
ok("6a. an exercise with a figure: the figure, and no \"Photographs are being added\"",
   !!doPage.querySelector(".xcard-figure .xfig") && !/Photographs are being added/.test(txt(doPage)));
const synth = { ...ex, id: "fixture-no-figure" };
const doNone = frag(CARD.renderExerciseCard(synth, { page: "do" }));
ok("6b. REVERSAL: an exercise with no figure keeps the placeholder", !doNone.querySelector(".xfig") && /Photographs are being added/.test(txt(doNone)));

// ── 7. HEADERS ──────────────────────────────────────────────────────────
console.log("\nTEST 7 - every batch file is dated and versioned");
const dir = new URL("../js/data/figures/", import.meta.url);
const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));
const undated = files.filter(f => !/\n \* \d{2} [A-Z][a-z]{2} \d{4} v\d+\n/.test(fs.readFileSync(new URL(f, dir), "utf8").slice(0, 400)));
ok(`7. all ${files.length} files carry "DD Mon YYYY vN"`, files.length >= 14 && undated.length === 0, undated.join(", "));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
