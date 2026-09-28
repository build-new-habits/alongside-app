/**
 * tools/verify-proposal1.mjs
 * 28 Sep 2026 v2
 *
 * v2 - SMOOTH-P2a. The three cards became one plan (spec 4.3), so tests
 *   0-4 read the plan: it renders (0a), nobody has to choose before
 *   Start (0b, which replaces "the suggested card is marked" -- there is
 *   nothing to mark), its length is in minutes (1), its count is English
 *   (2), and every chip's accessible name contains its visible text (3,
 *   the same 2.5.3 rule the cards had, on the controls that now carry
 *   values). 4a no longer taps a card first: Start is enabled on arrival;
 *   the fresh fixture ticks the safety note the plan now carries.
 *   Test 5 is unchanged. Nothing loosened.
 *
 * PROPOSAL-1 and PROPOSAL-2. The end of the One to one journey.
 *
 * NOTHING HAD EVER MOUNTED THIS VIEW. No gate in the suite imported
 * CoachProposalView, so the screen that decides what a person actually
 * does today had never been executed by anything but a person.
 *
 * PROPOSAL-1, what the cards said.
 *   Two shapes reach renderPreviewCard(). A generated option carries
 *   `duration` as a range STRING, "25-35 mins". A fallback option
 *   carries a bare NUMBER. Both printed raw, so the column read
 *   "25-35 mins", "15", "20" down the same screen. And the movements
 *   count was interpolated unguarded, so the Short walk fallback -- which
 *   has exactly one, every time it is offered -- read "1 movements", in
 *   its accessible name as well as on the card.
 *
 * PROPOSAL-2, where Start Session went.
 *   closePreviewPanel() navigated to Home UNCONDITIONALLY, and
 *   handlePreviewStart() calls it on the way to starting a session. So
 *   Start Session fired navigate('today') and then navigate('workout')
 *   about a second later. Home mounted in between, and "Good. Let's go."
 *   was written into a container Home had already replaced -- the one
 *   line confirming the choice, never seen.
 *
 *   The v18 note names the callers that helper was written for: "Not
 *   today", the backdrop, and close. Escape is the fourth. All four are
 *   DISMISSALS. Test 3 checks every one of them still reaches Home,
 *   because the fix is a behaviour REMOVED from one caller and it must
 *   not be removed from the others -- which is the failure shape
 *   DEVICE-1 produced within an hour on 06 Sep.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const fs = __require("node:fs");

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
const { store } = await import(B + "store.js");

let fails = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) { if (detail) console.log(`        ${detail}`); fails++; }
};

const main = document.getElementById("main-content");
const txt  = (el) => (el.textContent || "").replace(/\s+/g, " ").trim();

let _n = 0;
async function openProposal() {
  localStorage.clear();
  store.init();
  store.set("tier", "personal");
  store.set("name", "Graeme");
  store.set("conditions", []);
  store.set("homeEquipment", ["dumbbells", "resistance-band"]);
  store.set("lastCheckin.timestamp", new Date().toISOString());
  main.innerHTML = "";
  // Fresh module instance: this view keeps choiceMade and
  // selectedOptionId in module state, and choiceMade latches.
  const mod  = await import(B + `views/coach-proposal.js?n=${++_n}`);
  const navs = [];
  mod.CoachProposalView({ navigate: (r) => navs.push(r) }).mount(main);
  await new Promise(r => setTimeout(r, 1200));
  return { navs, cards: [...main.querySelectorAll(".cp-plan")] };
}

// ── 0. CONTROL ──────────────────────────────────────────────────────────
console.log("\nTEST 0 - the proposal rendered");

const p0 = await openProposal();
ok("0a. the plan is on screen, with its exercises", p0.cards.length === 1 &&
   main.querySelectorAll(".cp-plan__row").length > 0,
   `${p0.cards.length} plans - every assertion below would measure nothing`);
const start0 = main.querySelector("#cp-preview-start");
ok("0b. and it is already chosen: Start works without picking anything",
   !!start0 && !start0.disabled && !main.querySelector('[role="radio"]'),
   "the person is asked to choose before they can start");

// ── 1. WHAT THE PLAN SAYS ───────────────────────────────────────────────
console.log("\nTEST 1 - the plan states its length in minutes");

const meta = txt(main.querySelector(".cp-plan__meta") || { textContent: "" });
const dur  = meta.split("\u00B7")[0].trim();
ok(`1. "${txt(main.querySelector(".cp-plan__title"))}" gives its length in minutes`,
   dur.length > 0 && !/^\d+$/.test(dur) && /min/i.test(dur),
   `reads "${dur}" - a bare number is the one thing on screen without units`);

console.log("\nTEST 2 - and counts its movements in English");

// The singular case is asserted at its SOURCE -- _movementsLabel(n), the
// one place the count becomes English -- because whether today's plan
// has exactly one movement depends on the builder (PROPOSAL-LOC note).
const srcCP = fs.readFileSync(new URL("../js/views/coach-proposal.js", import.meta.url), "utf8");
const labelFn = srcCP.slice(srcCP.indexOf("function _movementsLabel"),
                            srcCP.indexOf("function _movementsLabel") + 260);
ok("2pc. the singular case is handled where the count becomes English",
   /c === 1 \? ""\s*:\s*"s"/.test(labelFn),
   "no singular branch in _movementsLabel; \"1 movements\" would reach the screen");
ok("2pc-b. REVERSAL: the plural branch is still there",
   labelFn.includes('movement$'.replace('$','')) && /"s"/.test(labelFn));
ok("2pc-c. the rendered plan was reachable at all", p0.cards.length > 0);
ok(`2. the plan is not "1 movements"`, !/\b1 movements\b/.test(meta), meta);
const rowsN = main.querySelectorAll(".cp-plan__row").length;
ok("2b. and the count it states is the number of rows it shows",
   new RegExp(`\\b${rowsN} movements?\\b`).test(meta), `${rowsN} rows, meta "${meta}"`);

console.log("\nTEST 3 - every chip announces its own visible text");

const chips = [...main.querySelectorAll(".cp-assumptions__change")];
ok("3pc. the chips are there", chips.length >= 2);
for (const c of chips) {
  const label = c.getAttribute("aria-label") || "";
  ok(`3. "${txt(c)}" is in its accessible name`, label.includes(txt(c)),
     `shows "${txt(c)}", announces "${label}" - WCAG 2.5.3, the two were built separately`);
}

// ── 4. START SESSION ────────────────────────────────────────────────────
console.log("\nTEST 4 - Start Session goes to the session, not through Home");

const p4 = await openProposal();
const startBtn = main.querySelector("#cp-preview-start");
// A fresh account has never read the safety note, so the plan asks for
// the tick first (verify-plan-list test 6 owns that). Ticked here so
// this test measures where Start GOES.
const ack = main.querySelector("#cp-ack-box");
if (ack) { ack.checked = true; ack.dispatchEvent(new dom.window.Event("change")); }
ok("4a. Start is enabled on arrival",
   !!startBtn && !startBtn.disabled,
   "Start is disabled, so nothing below is reachable");
startBtn.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
await new Promise(r => setTimeout(r, 3000));

ok("4b. it reaches a session", p4.navs.length > 0 && p4.navs[p4.navs.length - 1] !== "today",
   `navigated: ${p4.navs.join(" -> ") || "nowhere"}`);
ok("4c. and does NOT bounce through Home on the way",
   !p4.navs.includes("today"),
   `navigated: ${p4.navs.join(" -> ")} - Home mounts between the choice and ` +
   `the session, and the acknowledgement is written into a container Home ` +
   `has already replaced`);

// ── 5. EVERY DISMISSAL STILL REACHES HOME ───────────────────────────────
console.log("\nTEST 5 - all four dismissals still go Home");

// PROPOSAL-2 removed a navigation from ONE caller of a shared helper.
// These four are the callers it must stay in. A fix that moves a fault
// one caller over is DEVICE-1, which needed DEVICE-2 within the hour.

for (const [name, act] of [
  ["the close button",  () => main.querySelector("#cp-preview-close")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }))],
  ['"Not today"',       () => main.querySelector("#cp-preview-not-today")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }))],
  ["the backdrop",      () => main.querySelector(".cp-preview-panel__backdrop")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }))],
  ["Escape",            () => document.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }))]
]) {
  const p = await openProposal();
  act();
  await new Promise(r => setTimeout(r, 200));
  ok(`5. ${name} returns to Home`, p.navs.includes("today"),
     `navigated: ${p.navs.join(" -> ") || "nowhere"} - the panel is the only ` +
     `content on this screen, so a dismissal that does not navigate leaves ` +
     `nothing actionable`);
}

console.log(fails === 0
  ? "\nPROPOSAL-1/2: all assertions pass\n"
  : `\nPROPOSAL-1/2: ${fails} FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
