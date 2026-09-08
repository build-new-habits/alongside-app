/**
 * tools/verify-quickbuild.mjs
 * 08 Sep 2026 v2
 *
 * v2 - QUICK-BUILD-2/3. Tests 6, 7 and 8 MOUNT the builder.
 *
 *   v1 was green while the scaffold had never rendered for anybody.
 *   Tests 0-1 executed the Home chip; 2, 3 and 4 were readFileSync
 *   regexes that proved only that this file CONTAINS a function called
 *   renderQuickScaffold and the string phase === \"quick\". Nothing ever
 *   mounted the receiving end, so a branch that set a phase and never
 *   re-rendered passed every assertion.
 *
 *   The three defects that shipped behind it: the scaffold never
 *   rendered at all; no change button came back; the kit line read the
 *   flat merged `equipment` field the equipment step exists not to use.
 *
 *   A gate that mounts one state and claims the screen is worse than no
 *   gate. These mount the screen a person meets and walk it.
 *
 * QUICK-BUILD. The room's own screen.
 *
 * WHAT THIS PROTECTS. session-builder-ui.js walks six question phases --
 * type, location, zones, duration, equipment, buildmode -- before it
 * builds anything. That is right for somebody who came to compose. It is
 * wrong for a room whose entire card said "Tell me how long. I fill the
 * rest in": answering one question and then being asked six is the
 * opposite of what was offered, and it is the specific way a promise on
 * a card gets broken one screen later.
 *
 * THE ASSUMPTIONS ARE SHOWN BEFORE THE BUILD, NOT DISCOVERED AFTER IT.
 * The Home card says "You can change the place and kit next". That has
 * to be true on the very next screen or it was decoration.
 *
 * THE COACH'S CHOICE IS NAMED AND CHANGEABLE. A coach that picks
 * silently and cannot be corrected is not handing you a frame, it is
 * deciding for you -- which is what the four rooms exist to stop.
 */

import { createRequire as __cr } from "node:module";
import fs from "node:fs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM(
  '<!doctype html><div id="c"></div><div id="main-content"></div>',
  { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });

const B = new URL("../js/", import.meta.url).href;
const { store }     = await import(B + "store.js");
const { isPremium } = await import(B + "auth.js");
const { TodayView } = await import(B + "views/today.js");

// GATE-PATH. These were cwd-relative, so the gate read nothing (or the
// wrong tree) from any directory but the repo root. Resolved from
// import.meta.url like the other 49.
const R = new URL("../", import.meta.url);
const readRepo = (rel) => fs.readFileSync(new URL(rel, R), "utf8");
const sbui = readRepo("js/views/session-builder-ui.js");
const code = sbui.split("\n").filter(l => !/^\s*(\*|\/\/|\/\*)/.test(l)).join("\n");

let fails = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) { if (detail) console.log(`        ${detail}`); fails++; }
};

function home() {
  localStorage.clear();
  store.init();
  store.set("tier", "personal");
  store.set("equipment", ["none"]);
  const c = document.createElement("div");
  document.body.appendChild(c);
  const navs = [];
  TodayView({ navigate: v => navs.push(v) }).mount(c);
  return { c, navs };
}

// ── 0. FIXTURE REACH ────────────────────────────────────────────────────
console.log("\nTEST 0 - the chips are actually on the screen being measured");
const { c, navs } = home();
const chips = [...c.querySelectorAll("[data-quick-mins]")];
ok("0a. the Plan fixture is on Plan", isPremium() === true);
ok("0b. and Quick build rendered its chips", chips.length >= 3,
   `${chips.length} chips - every assertion below would be measuring an absent room`);

// ── 1. THE CHIP ASKS FOR THE ROOM'S OWN SCREEN ──────────────────────────
console.log("\nTEST 1 - one tap, one screen");

chips[1].click();
const pre = store.get("sessionBuilderPreselect");

ok("1a. the chip writes a preselect", !!pre, "nothing was stored, so the tap carried nothing");
ok("1b. carrying the duration the person tapped",
   Number(pre.durationMins) === Number(chips[1].dataset.quickMins),
   `chip said ${chips[1].dataset.quickMins}, store says ${pre && pre.durationMins}`);
ok("1c. and asking for quick mode",
   pre.mode === "quick",
   'without mode:"quick" the builder walks six question phases after the ' +
   'card promised to fill the rest in');
ok("1d. and it navigates to the builder", navs.includes("session-builder"), navs.join(", "));

// ── 2. THE BUILDER HONOURS IT ───────────────────────────────────────────
console.log("\nTEST 2 - the mode reaches a screen of its own");

ok("2a. quick is a phase", /phase === "quick"/.test(code),
   "the mode is written but the builder has no branch for it");
ok("2b. with its own render function", /function renderQuickScaffold/.test(sbui));
ok("2c. entered from the preselect", /pre\.mode === "quick"/.test(code));

// Cleared, like the rest of the object. A mode that survived would turn
// one tap on Home into a permanent change to how the builder behaves.
ok("2d. and quickMode is cleared by resetState",
   /function resetState\(\)\s*\{[\s\S]{0,120}quickMode\s*=\s*false/.test(code),
   "quickMode survives a reset, so one tap on Home permanently changes the builder");

// ── 3. THE COACH PICKS THE TYPE, THROUGH THE SAME CHAIN ─────────────────
console.log("\nTEST 3 - one chooser, not two");

ok("3a. quick mode calls chooseSessionType", /chooseSessionType\(\)/.test(code),
   "the builder picks a type some other way, so there are two choosers to " +
   "keep in step - which is how the two ENGINES drifted for three months");
ok("3b. imported from session-choice, not reimplemented",
   /from '\.\.\/data\/session-choice\.js'/.test(sbui));

// ── 4. EVERY ASSUMPTION IS SHOWN, AND EVERY ONE IS CHANGEABLE ───────────
console.log("\nTEST 4 - the card's promise is kept on the next screen");

const scaffold = sbui.slice(sbui.indexOf("function renderQuickScaffold"),
                            sbui.indexOf("function renderLocationStep"));
for (const [label, id] of [
  ["4a. the session type", "sb-quick-type"],
  ["4b. the length",       "sb-quick-duration"],
  ["4c. where you are",    "sb-quick-location"],
  ["4d. what kit",         "sb-quick-equipment"]
]) {
  ok(`${label} is shown and changeable`, scaffold.includes(id),
     `${id} is missing - the Home card says "You can change the place and kit next"`);
  ok(`${label} is wired to a real step`,
     new RegExp(`getElementById\\("${id}"\\)`).test(code),
     `${id} renders but does nothing, which is worse than not offering it`);
}

ok("4e. and there is one build button", /id="sb-quick-build"/.test(scaffold));
ok("4f. wired to the same triggerBuild the other paths use",
   /getElementById\("sb-quick-build"\)[\s\S]{0,160}triggerBuild\(\)/.test(code),
   "a second build path would be a second thing to keep in step");

// The change buttons must drop into the EXISTING steps. A second
// location picker would be a second thing to keep in step with the
// first, and the real step knows things an inline editor would not.
for (const phase of ["type", "duration", "location", "equipment"]) {
  ok(`4g. changing ${phase} reuses the real step`,
     new RegExp(`phase = "${phase}"; rerender\\(\\)`).test(code),
     `an inline editor was built for ${phase} instead of reusing the step`);
}

// ── 5. THE COACH'S CONSULTATION REACHES THE RECORD ──────────────────────
// QUICK-INPUTS, 06 Sep 2026. This block used to assert the OPPOSITE:
// that the unfinished state was labelled as unfinished. It is finished
// now, so the assertion is inverted rather than deleted -- the reason
// it existed is the reason this one does.
console.log("\nTEST 5 - what the coach consulted is written down");

ok("5a. quick mode passes its inputs to buildSession",
   /inputs:\s*quickMode \? quickInputs : null/.test(code),
   "the coach chose the type and nothing recorded what it consulted - the same " +
   "empty `inputs` TWO-ENGINE fixed on the One to one route");

const sb = readRepo("js/session-builder.js");
ok("5b. and buildSession merges them into the stored record",
   /inputs:\s*\{ \.\.\.\(inputs \|\| \{\}\), sessionType/.test(sb),
   "buildSession ignores the inputs it was handed, so they are gathered and dropped");

ok("5c. merged UNDER what the builder actually used, not over it",
   /\.\.\.\(inputs \|\| \{\}\), sessionType, durationMins, equipment/.test(sb),
   "a caller can overwrite the record of what the builder really used with " +
   "something it merely intended");

ok("5d. and ONLY in quick mode",
   !/inputs:\s*quickInputs\b(?!.*quickMode)/.test(code),
   "inputs are recorded on paths where the PERSON chose the type, which is the " +
   "same overclaim in the other direction");

const schema = readRepo("Documents/Live State/Schema.md");
ok("5b. and the mode field is declared", /sessionBuilderPreselect\.mode/.test(schema),
   "schema before code");

// ── 6, 7, 8. THE SCREEN, MOUNTED ────────────────────────────────────────
//
// Everything above this line reads source text. Everything below mounts
// the builder the way the router does -- render() FIRST, then onMount(),
// once -- because that ordering is what the original defect turned on:
// the quick branch set phase = "quick" inside onMount(), after render()
// had already put the type picker on screen, and nothing re-rendered.
//
// Fresh module instance per scenario via a cache-busting query, because
// this view keeps its phase in module state. store.js is imported by
// specifier from inside it, so the store stays shared and the fixture
// still reaches it.

const B2 = new URL("../js/", import.meta.url).href;
let _n = 0;

async function mountQuick({ mins = 20, home = ["dumbbells", "resistance-band"],
                            gym = ["squat-rack", "treadmill", "cable-machine"] } = {}) {
  localStorage.clear();
  store.init();
  store.set("tier", "personal");
  store.set("homeEquipment", home);
  store.set("gymEquipment",  gym);
  store.set("sessionBuilderPreselect", { mode: "quick", durationMins: mins, returnTo: "today" });

  const view = await import(B2 + `views/session-builder-ui.js?n=${++_n}`);
  const main = document.getElementById("main-content");
  main.innerHTML = view.render();
  view.onMount();
  return { view, main };
}

const txt   = (el) => (el.textContent || "").replace(/\s+/g, " ").trim();
const onScaffold = (main) => !!main.querySelector("#sb-quick-build");
const click = (main, sel) => {
  const el = main.querySelector(sel);
  if (!el) return false;
  el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
  return true;
};

console.log("\nTEST 6 - the scaffold is what a person actually meets");

const m6 = await mountQuick({ mins: 20 });

// Positive control FIRST. verify-hard1-store passed every assertion once
// having never loaded its own fixture; a control that would fail on an
// empty container is the cheapest guard against repeating it.
ok("6a. the fixture reached the builder at all", txt(m6.main).length > 0,
   "the container is empty, so every assertion below is measuring nothing");

ok("6b. and the QUICK SCAFFOLD is on screen", onScaffold(m6.main),
   "phase was set to quick but the screen never changed - the router calls " +
   "render() BEFORE onMount(), so a branch that sets a phase and does not " +
   "rerender leaves the previous screen up");

ok("6c. NOT the eight-way type picker", m6.main.querySelectorAll(".sb-type-tile").length === 0,
   'the room whose card said "Tell me how long. I fill the rest in" opened ' +
   "the compose flow's type picker instead - the exact screen it replaced");

ok("6d. showing the length the chip carried", /20 min/.test(txt(m6.main)),
   "the duration came through the preselect but is not on the screen");

ok("6e. and the preselect is cleared", !store.get("sessionBuilderPreselect"),
   "a surviving preselect pins every later build to a duration tapped days ago");

console.log("\nTEST 7 - every change button comes back to the scaffold");

// The outbound leg was built and the return leg was not, so correcting
// one assumption dropped the person into the full six-question flow --
// where the duration picker then asked "How long have you got today?" of
// somebody who had answered exactly that two taps earlier.

const m7a = await mountQuick();
click(m7a.main, "#sb-quick-location");
ok("7a. 'Where' opens the real location step",
   !!m7a.main.querySelector("#sb-location-continue-btn") && !onScaffold(m7a.main),
   "an inline editor was built instead of reusing the step");
click(m7a.main, '[data-location="gym"]');
click(m7a.main, "#sb-location-continue-btn");
ok("7b. and Continue returns to the scaffold", onScaffold(m7a.main),
   "it walked on to the duration picker, which is the compose flow");
ok("7c. carrying the corrected answer", /At the gym/.test(txt(m7a.main)),
   "it came back but the change did not");

const m7d = await mountQuick({ mins: 20 });
click(m7d.main, "#sb-quick-duration");
const durBtn = m7d.main.querySelector('.sb-duration-btn[data-mins="45"]')
            || m7d.main.querySelector(".sb-duration-btn");
ok("7d. 'Length' opens the real duration step", !!durBtn && !onScaffold(m7d.main),
   "no .sb-duration-btn on screen - the step was never reached");
// Guarded. A missing element must make this gate report a named failing
// row, not throw a TypeError: a crash is red for the wrong reason and
// tells whoever reverted something nothing about WHICH promise broke.
if (durBtn) durBtn.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
ok("7e. and choosing a length returns to the scaffold", onScaffold(m7d.main),
   "it walked on to equipment, or - for a stretch type - built the session " +
   "there and then, from a screen opened only to CHANGE a number");
ok("7f. carrying the corrected length", /45 min/.test(txt(m7d.main)),
   txt(m7d.main).slice(0, 120));

const m7g = await mountQuick();
click(m7g.main, "#sb-quick-type");
const tile = m7g.main.querySelector(".sb-type-tile");
ok("7g. 'Session' opens the real type picker", !!tile && !onScaffold(m7g.main),
   "no .sb-type-tile on screen - the picker was never reached");
if (tile) tile.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
ok("7h. and choosing a type returns to the scaffold", onScaffold(m7g.main),
   "it walked on into location, duration, equipment, buildmode");

const m7i = await mountQuick();
click(m7i.main, "#sb-quick-equipment");
ok("7i. 'Kit' opens the real equipment step",
   !!m7i.main.querySelector("#sb-build-btn") && !onScaffold(m7i.main));
// Captured BEFORE the click. Without it this assertion passes when the
// equipment step THROWS during render: innerHTML is never assigned, the
// scaffold is still up, and "came back" reads as true having never left.
// That is precisely the shape 7i caught on 08 Sep -- a false pass sitting
// next to a real failure.
const reachedEquipStep = !!m7i.main.querySelector("#sb-build-btn");
click(m7i.main, "#sb-build-btn");
ok("7j. and confirming kit returns to the scaffold",
   reachedEquipStep && onScaffold(m7i.main),
   reachedEquipStep
     ? "it walked on to the build-mode question, which quick build does not ask"
     : "never reached the equipment step, so this assertion measured nothing");

const m7k = await mountQuick();
click(m7k.main, "#sb-quick-location");
click(m7k.main, "#sb-back-btn");
ok("7k. and Back out of a detour returns to the scaffold", onScaffold(m7k.main),
   "the back chain walked into the compose flow's own previous step - " +
   "location back to type - a screen this person never saw");

console.log("\nTEST 9 - the rows say what they are, not just what they hold");

// Each row was a <span> label beside a button whose accessible name was
// its VALUE alone: "Glute Focus, button". The label carried the meaning
// visually and nowhere else. WCAG 2.2 AA 1.3.1 and 2.4.6.
//
// Executed, not grepped. An aria-label present in source can still be
// built from a stale value, and this screen's values all come from state.

const m9 = await mountQuick({ mins: 20 });
for (const [id, label] of [
  ["sb-quick-type",      "Session"],
  ["sb-quick-duration",  "Length"],
  ["sb-quick-location",  "Where"],
  ["sb-quick-equipment", "Kit"]
]) {
  const btn  = m9.main.querySelector(`#${id}`);
  const name = btn && btn.getAttribute("aria-label");
  const seen = btn && txt(btn);
  ok(`9. "${label}" announces what it is and that it changes`,
     !!name && name.startsWith(`${label}: `) && /\. Change$/.test(name),
     `announced as "${name || seen}" - no indication of what the value IS ` +
     `or that the button changes it`);
  // 2.5.3 Label in Name. The accessible name must CONTAIN the visible
  // text or voice control cannot address the button by what it says.
  ok(`9. and its visible text is inside that name (2.5.3)`,
     !!name && !!seen && name.includes(seen),
     `visible "${seen}" is not inside accessible name "${name}"`);
}

console.log("\nTEST 8 - the kit line is the kit behind its own button");

// It read store.get("equipment"), the flat merged list that the equipment
// step exists specifically NOT to read. At the gym it showed the home kit.

const m8 = await mountQuick({ home: ["dumbbells", "resistance-band"],
                              gym:  ["squat-rack", "treadmill", "cable-machine"] });
ok("8a. at home it counts the HOME list", /2 things you have/.test(txt(m8.main)),
   txt(m8.main).slice(0, 160));

click(m8.main, "#sb-quick-location");
click(m8.main, '[data-location="gym"]');
click(m8.main, "#sb-location-continue-btn");
ok("8b. at the gym it counts the GYM list", /3 things you have/.test(txt(m8.main)),
   "the count did not follow the place - the flat merged field again");

// Asserts SCOPE, not the tag expansion. The equipment step runs the saved
// ids through resolveEquipment(), so its tick count legitimately differs
// from this one; what must never differ is WHICH list is being counted.
const m8c = await mountQuick({ home: [], gym: [] });
ok("8c. and an empty list says so rather than counting nothing",
   /Nothing needed/.test(txt(m8c.main)), txt(m8c.main).slice(0, 160));

console.log(fails === 0
  ? "\nQUICK-BUILD: all assertions pass\n"
  : `\nQUICK-BUILD: ${fails} FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
