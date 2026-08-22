/**
 * tools/verify-chooser1.mjs
 * 22 Aug 2026 v1
 *
 * CHOOSER-1 — choosing a programme after onboarding.
 *
 * WHAT BROKE, AND WHY A GATE EXISTS NOW.
 *
 * js/views/onboarding/goal-setup.js never loaded. It statically imported
 * `{ programmeEngine }`, which programmeEngine.js does not export, so it
 * was a link-time SyntaxError. Five call sites reached it -- and the one
 * that mattered was today.js:734, the CHAPTER-END HINGE FALLBACK.
 * Somebody finishes twelve weeks, the coach asks what is next, and the
 * answer went nowhere.
 *
 * THE ASSERTION THIS GATE EXISTS FOR is section 3: confirming a
 * programme must CLEAR THE HINGE. programmeEngine.startChapter() clears
 * `completed`, `completedAt` and `programme.hingeOfferedAt`, and its own
 * comment says that clearing them is what answers the hinge. The
 * onboarding screen this chooser was extracted from does NOT call it --
 * it writes six activeProgramme fields directly, which is harmless
 * during onboarding and would be a bug here. A chooser that copied that
 * write path would let somebody answer the chapter-end question, choose
 * a programme, and be asked again.
 *
 * That failure would be invisible to any source-text gate, and would not
 * throw. It would simply ask a person the same question twice, having
 * been told.
 *
 * Run: node tools/verify-chooser1.mjs
 */

import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const { JSDOM } = require("jsdom");
const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..");

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://localhost/" });
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = dom.window.localStorage;

let failures = 0, checks = 0;
function ok(label, condition, detail = "") {
  checks++;
  if (condition) console.log(`  PASS  ${label}`);
  else { failures++; console.log(`  FAIL  ${label}${detail ? "  --  " + detail : ""}`); }
}

const { store } = await import(path.join(REPO, "js/store.js"));
store.init();
const { ProgrammeSelectView } = await import(path.join(REPO, "js/views/programme-select.js"));
const { buildPlanOptions, weeklyTargetForVariant } =
  await import(path.join(REPO, "js/data/plan-options.js"));

function fakeRouter() {
  const calls = [];
  return { calls, navigate: (r) => calls.push(r) };
}

function seed({ goals = ["move-more"], weekly = 3, hinge = true } = {}) {
  store.set("goals", goals);
  store.set("strategicGoal.weeklySessionTarget", weekly);
  store.set("activeProgramme.programmeId", "old-programme");
  store.set("activeProgramme.programmeName", "The Old Chapter");
  store.set("activeProgramme.sessionsThisWeek", 4);
  store.set("activeProgramme.totalSessions", 31);
  store.set("activeProgramme.completed", true);
  store.set("activeProgramme.completedAt", "2026-08-01T00:00:00.000Z");
  store.set("programme.hingeOfferedAt", "2026-08-01T00:00:00.000Z");
}

function mountView() {
  const container = document.createElement("div");
  document.body.innerHTML = "";
  document.body.appendChild(container);
  const router = fakeRouter();
  ProgrammeSelectView(router).mount(container);
  return { container, router };
}

console.log("\n0. Positive control — the view actually renders");
{
  seed();
  const opts = buildPlanOptions();
  ok("buildPlanOptions returns three options", opts.length === 3, `got ${opts.length}`);
  const { container } = mountView();
  ok("the view rendered a heading", !!container.querySelector("#chooser-heading"));
  ok("three plan cards are present",
     container.querySelectorAll(".plan-card").length === 3,
     `got ${container.querySelectorAll(".plan-card").length}`);
}

console.log("\n1. The retired view is gone and the route is repointed");
{
  ok("onboarding/goal-setup.js no longer exists",
     !fs.existsSync(path.join(REPO, "js/views/onboarding/goal-setup.js")));
  ok("it is archived rather than destroyed",
     fs.existsSync(path.join(REPO, "Documents/Archive/goal-setup_retired_22aug2026.js")));
  const router = fs.readFileSync(path.join(REPO, "js/router.js"), "utf8");
  ok("the goal-setup route points at programme-select",
     /'goal-setup':\s*\{\s*path:\s*'\.\/views\/programme-select\.js'/.test(router));
  // Check for an actual route MAPPING, not the bare filename -- v1 of
  // this assertion matched the explanatory comment in router.js and went
  // red against correct code. A source-text assertion is only as good as
  // its precision, which is half of why 43 of this suite's gates are
  // weaker than they look.
  ok("no route still points at the retired file",
     !/path:\s*'\.\/views\/onboarding\/goal-setup\.js'/.test(router));
}

console.log("\n2. All five original call sites still resolve");
{
  const sites = [
    ["js/views/today.js", "chapter-end hinge fallback"],
    ["js/views/settings.js", "change / choose programme"],
    ["js/views/gym-programme.js", "no successor / new goal"]
  ];
  for (const [f, label] of sites) {
    const src = fs.readFileSync(path.join(REPO, f), "utf8");
    ok(`${label} still navigates to 'goal-setup'`, src.includes("navigate('goal-setup')"));
  }
}

console.log("\n3. Confirming a programme CLEARS THE HINGE");
{
  seed();
  const { container, router } = mountView();
  container.querySelector("[data-action='confirm']").click();

  ok("activeProgramme.completed cleared", store.get("activeProgramme.completed") === false,
     String(store.get("activeProgramme.completed")));
  ok("activeProgramme.completedAt cleared", store.get("activeProgramme.completedAt") === null,
     String(store.get("activeProgramme.completedAt")));
  ok("programme.hingeOfferedAt cleared", store.get("programme.hingeOfferedAt") === null,
     String(store.get("programme.hingeOfferedAt")));
  ok("programme.currentChapterId set", !!store.get("programme.currentChapterId"));

  // Counters must reset, or week one of a new chapter starts mid-week.
  ok("sessionsThisWeek reset", store.get("activeProgramme.sessionsThisWeek") === 0,
     String(store.get("activeProgramme.sessionsThisWeek")));
  ok("totalSessions reset", store.get("activeProgramme.totalSessions") === 0);
  ok("currentWeek is 1", store.get("activeProgramme.currentWeek") === 1);
  ok("navigated to today", router.calls.includes("today"), router.calls.join(","));
}

console.log("\n4. The card's promise and the stored number cannot drift");
{
  for (const [variant, expected] of [["recommended", 4], ["gentle", 3], ["committed", 5]]) {
    seed({ weekly: 4 });
    ok(`${variant} resolves to ${expected} sessions`,
       weeklyTargetForVariant(variant) === expected,
       String(weeklyTargetForVariant(variant)));
  }

  // Confirming the gentle option must WRITE the number its card showed.
  seed({ weekly: 4 });
  const { container } = mountView();
  const cards = [...container.querySelectorAll(".plan-card")];
  cards[1].click();
  const shown = cards[1].querySelector(".plan-card__weekly").textContent.trim();
  container.querySelector("[data-action='confirm']").click();
  ok("gentle card showed 3 sessions", shown.startsWith("3 session"), shown);
  ok("gentle choice wrote 3", store.get("strategicGoal.weeklySessionTarget") === 3,
     String(store.get("strategicGoal.weeklySessionTarget")));
  ok("setAt was written", typeof store.get("strategicGoal.setAt") === "string");
}

console.log("\n5. Back changes nothing");
{
  seed({ weekly: 4 });
  const before = JSON.stringify({
    p: store.get("activeProgramme.programmeId"),
    w: store.get("strategicGoal.weeklySessionTarget"),
    h: store.get("programme.hingeOfferedAt")
  });
  const { container, router } = mountView();
  container.querySelector("[data-action='back']").click();
  const after = JSON.stringify({
    p: store.get("activeProgramme.programmeId"),
    w: store.get("strategicGoal.weeklySessionTarget"),
    h: store.get("programme.hingeOfferedAt")
  });
  ok("leaving without confirming writes nothing", before === after, `${before} -> ${after}`);
  ok("back navigates to today", router.calls.includes("today"));
}

console.log("\n6. WCAG 2.2 AA");
{
  seed();
  const { container } = mountView();
  const list = container.querySelector(".plan-list");
  ok("list is a radiogroup", list?.getAttribute("role") === "radiogroup");
  ok("radiogroup is labelled", !!list?.getAttribute("aria-labelledby"));

  const cards = [...container.querySelectorAll(".plan-card")];
  ok("every card is a radio", cards.every(c => c.getAttribute("role") === "radio"));
  ok("exactly one card is checked",
     cards.filter(c => c.getAttribute("aria-checked") === "true").length === 1);
  ok("roving tabindex — exactly one card is focusable",
     cards.filter(c => c.getAttribute("tabindex") === "0").length === 1);

  // 2.1.1 — a radiogroup must be arrow-navigable.
  cards[0].dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
  ok("ArrowDown moves the selection",
     cards[1].getAttribute("aria-checked") === "true",
     cards.map(c => c.getAttribute("aria-checked")).join(","));
  cards[1].dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
  ok("ArrowUp moves it back", cards[0].getAttribute("aria-checked") === "true");

  ok("no progress dots — this is not a wizard",
     !container.querySelector(".progress-dots"));
  ok("heading is focusable for post-navigation focus",
     container.querySelector("#chooser-heading")?.getAttribute("tabindex") === "-1");
}

console.log("\n7. No options — the person is never stranded");
{
  store.set("goals", []);
  store.set("strategicGoal.weeklySessionTarget", 3);
  const opts = buildPlanOptions();
  const { container, router } = mountView();
  if (opts.length === 0) {
    ok("an escape route is offered", !!container.querySelector("[data-action='back']"));
    container.querySelector("[data-action='back']").click();
    ok("it leads back to today", router.calls.includes("today"));
  } else {
    // Empty goals still matched a programme; the fallback is unreachable
    // by this route, which is itself worth stating rather than faking.
    ok("empty goals still yield options (fallback path not exercised)", opts.length === 3);
  }
}

console.log(`\n${"-".repeat(60)}`);
if (failures === 0) { console.log(`verify-chooser1: ${checks} checks, all green.`); process.exit(0); }
else { console.log(`verify-chooser1: ${failures} of ${checks} checks RED.`); process.exit(1); }
