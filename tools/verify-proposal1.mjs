/**
 * tools/verify-proposal1.mjs
 * 08 Sep 2026 v1
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
  return { navs, cards: [...main.querySelectorAll(".cp-preview-card")] };
}

// ── 0. CONTROL ──────────────────────────────────────────────────────────
console.log("\nTEST 0 - the proposal rendered");

const p0 = await openProposal();
ok("0a. option cards are on screen", p0.cards.length >= 2,
   `${p0.cards.length} cards - every assertion below would measure nothing`);
ok("0b. and the suggested one is marked",
   p0.cards.some(c => /Suggested for today/i.test(txt(c))),
   "no recommended card, so the person is asked to choose with no steer");

// ── 1. WHAT THE CARDS SAY ───────────────────────────────────────────────
console.log("\nTEST 1 - every card states a length in the same units");

for (const c of p0.cards) {
  const metas = [...c.querySelectorAll(".cp-preview-card__meta")].map(txt);
  const dur   = metas[0] || "";
  ok(`1. "${txt(c.querySelector(".cp-preview-card__name"))}" gives its length in minutes`,
     dur.length > 0 && !/^\d+$/.test(dur) && /min/i.test(dur),
     `reads "${dur}" - a generated option renders "25-35 mins" beside it, ` +
     `so a bare number is the only thing on screen without units`);
}

console.log("\nTEST 2 - and counts its movements in English");

// The pad loop tops the option list up to three with _getFallbackOption(),
// whose third entry is Short walk with exactly one movement. A control
// first: if that card ever stops appearing, the singular case stops being
// exercised and this test would quietly pass on plurals alone.
const single = p0.cards.find(c => /\b1 movement\b/.test(txt(c)) || /\b1 movements\b/.test(txt(c)));
ok("2pc. positive control: a one-movement card is on screen", !!single,
   "no single-movement option rendered, so the singular case is untested here");

for (const c of p0.cards) {
  const t = txt(c);
  ok(`2. "${txt(c.querySelector(".cp-preview-card__name"))}" is not "1 movements"`,
     !/\b1 movements\b/.test(t), t.slice(0, 120));
}

console.log("\nTEST 3 - the accessible name matches what is on the card");

for (const c of p0.cards) {
  const label = c.getAttribute("aria-label") || "";
  const metas = [...c.querySelectorAll(".cp-preview-card__meta")].map(txt);
  ok(`3. "${txt(c.querySelector(".cp-preview-card__name"))}" announces its own visible text`,
     metas.every(m => !m || label.includes(m)),
     `card shows ${JSON.stringify(metas)}, announces "${label}" - the label was ` +
     `built from a separate interpolation, so the two could drift`);
}

// ── 4. START SESSION ────────────────────────────────────────────────────
console.log("\nTEST 4 - Start Session goes to the session, not through Home");

const p4 = await openProposal();
p4.cards[0].dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
await new Promise(r => setTimeout(r, 80));
const startBtn = main.querySelector("#cp-preview-start");
ok("4a. selecting a card enables Start Session",
   !!startBtn && !startBtn.disabled,
   "Start is still disabled after a selection, so nothing below is reachable");
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
