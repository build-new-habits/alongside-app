/**
 * tools/verify-arc-home.mjs
 * 04 Oct 2026 v1
 *
 * D-3 ARC-HOME. Graeme's wife, on the device test: tapping "Your arc" on
 * Home she expected the arc, and how to change, renew, update or develop
 * it. It opened Progress.
 *
 * Through the real router, on the Plan with an arc:
 *   1. Home's Your arc card opens the arc screen, not Progress.
 *   2. The arc screen: Your arc (h1, focused), Week n, the aim, How you'd
 *      know in their words, What feeds it with when each last came up,
 *      Start today's session, and Change your arc: three named rows, each
 *      saying what it does; Stop the arc.
 *   3. Change what feeds it: the arc's strands already chosen; Save keeps
 *      the aim and the week; Back saves nothing.
 *   4. Change how you'd know: their words in the box; Save keeps the arc.
 *   5. Start a fresh arc: the four questions, this aim already chosen;
 *      "Yes, that's mine" starts it again at week 1.
 *   6. Setting one up from nothing is unchanged: step 1, nothing chosen.
 */
import { agreed } from "./agreed.mjs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div><nav id="bottom-nav"></nav></div><div id="sr-announcer"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: /prefers-reduced-motion/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };
dom.window.confirm = () => false; globalThis.confirm = () => false;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
globalThis.window.router = router;
Object.defineProperty(globalThis, "router", { value: router, configurable: true, writable: true });
const gate = await import(B + "safety-gate.js");
const { aimById, STRANDS } = await import(B + "data/aims.js");
const { arcWeek } = await import(B + "data/arc-readback.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const $ = s => main.querySelector(s), $$ = s => [...main.querySelectorAll(s)];
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = async el => { el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true })); await wait(60); };

const iso = d => { const x = new Date(); x.setDate(x.getDate() - d); return x.toISOString().slice(0, 10); };
const ARC = { active: true, aimId: "floor-unaided", strands: ["leg-strength", "trunk-strength"], marker: "Up off the floor without thinking",
  startedAt: iso(20), zonesWorked: { hips: iso(3) }, typesWorked: { lower: iso(1) }, provenance: "self" };

function fixture(arc = ARC) {
  localStorage.clear(); store.init(); agreed(store);
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", "personal");
  store.set("conditions", []); store.set("conditionPainScores", {});
  if (arc) store.set("arc", JSON.parse(JSON.stringify(arc)));
  router.history = []; router.currentView = null;
}
async function go(view) { await router.navigate(view); await wait(60); }
const view = () => router.currentView;

// ── 1. HOME → THE ARC ──────────────────────────────────────────────────
console.log("\nTEST 1 - Home's Your arc opens the arc");
fixture();
await go("today");
const card = $(".home-arc");
ok("1pc. Home shows the Your arc card with the aim", !!card && txt(card).includes(aimById(ARC.aimId).label), txt(card));
await click(card);
ok("1a. tapping it opens the arc, not Progress", view() === "stretch-arc", view());

// ── 2. THE ARC SCREEN ──────────────────────────────────────────────────
console.log("\nTEST 2 - the arc: what it is, and how to change it");
const h1 = $("h1");
ok("2a. one h1, \"Your arc\", and focus is on it", $$("h1").length === 1 && txt(h1) === "Your arc" && document.activeElement === h1,
   `${$$("h1").length} ${txt(h1)} ${document.activeElement?.tagName}`);
ok("2b. the week it is in", txt($(".sa-meta")).startsWith(`Week ${arcWeek(ARC)}`), txt($(".sa-meta")));
ok("2c. the aim, and How you'd know in their words",
   txt($(".sa-goal")) === aimById(ARC.aimId).label && txt($(".sa-know")).includes(ARC.marker));
const feeds = $$(".sa-list li").map(txt);
ok("2d. What feeds it: each strand with when it last came up (a date or Not yet, never a count)",
   feeds.length === 2 && ARC.strands.every((id, i) => feeds[i].startsWith(STRANDS[id].label)) &&
   feeds.every(f => /(Worked .+|Not yet)$/.test(f) && !/\b(times?|sessions?)\b/.test(f)), JSON.stringify(feeds));
ok("2e. Start today's session is there", /Start today's session/.test(txt($("#sa-today-btn"))));
const rows = $$("[data-arc-change]");
ok("2f. Change your arc is a heading over three named rows, in order",
   txt($("#sa-change-h")) === "Change your arc" &&
   JSON.stringify(rows.map(r => txt(r.querySelector(".sa-change__title")))) ===
   JSON.stringify(["Change what feeds it", "Change how you’d know", "Start a fresh arc"]),
   JSON.stringify(rows.map(r => txt(r))));
ok("2g. each row says what it does, and is a button", rows.length === 3 && rows.every(r => r.tagName === "BUTTON" && txt(r.querySelector(".sa-change__line")).length > 10));
ok("2h. the icons are decorative", rows.every(r => [...r.querySelectorAll("svg")].every(s => s.getAttribute("aria-hidden") === "true")));
ok("2i. Stop the arc is still there", !!$("#sa-stop-btn"));
const headings = $$("h1,h2").map(h => Number(h.tagName[1]));
ok("2j. headings in order, no level skipped", headings[0] === 1 && headings.every((h, i) => i === 0 || h <= headings[i - 1] + 1), headings.join(","));

// ── 3. CHANGE WHAT FEEDS IT ────────────────────────────────────────────
console.log("\nTEST 3 - Change what feeds it");
await click($('[data-arc-change="strands"]'));
ok("3a. opens What feeds it, the arc's own strands already chosen",
   view() === "arc-setup" && /What feeds it/.test(txt($("h1"))) &&
   JSON.stringify($$('[data-strand][aria-pressed="true"]').map(b => b.dataset.strand).sort()) === JSON.stringify(ARC.strands.slice().sort()),
   `${view()} ${txt($("h1"))}`);
ok("3b. its button says Save (one screen, not the four questions)", !!$("#as-save-btn") && !$("#as-next-btn"));
// Back first: nothing is saved.
const pick = $$("[data-strand]").find(b => b.getAttribute("aria-pressed") === "false" && !b.disabled);
await click(pick);
await click($("#as-back-btn"));
ok("3c. Back returns to the arc and saves nothing",
   view() === "stretch-arc" && JSON.stringify(store.get("arc").strands) === JSON.stringify(ARC.strands));
await click($('[data-arc-change="strands"]'));
const add = $$("[data-strand]").find(b => b.getAttribute("aria-pressed") === "false" && !b.disabled);
const addId = add?.dataset.strand;
await click(add);
await click($("#as-save-btn"));
const a3 = store.get("arc");
ok("3d. Save: back on the arc, with the new strand, the same aim and the same week",
   view() === "stretch-arc" && a3.strands.includes(addId) && a3.aimId === ARC.aimId && a3.startedAt === ARC.startedAt && a3.active === true,
   JSON.stringify(a3));
ok("3e. and the arc screen shows it", $$(".sa-list li").some(li => txt(li).startsWith(STRANDS[addId].label)));

// ── 4. CHANGE HOW YOU'D KNOW ───────────────────────────────────────────
console.log("\nTEST 4 - Change how you'd know");
await click($('[data-arc-change="marker"]'));
const ta = $("#as-marker");
ok("4a. opens How would you know, their words in the box", /How would you know/.test(txt($("h1"))) && ta?.value === ARC.marker);
if (ta) {
  ta.value = "Playing on the floor with the grandchildren";
  ta.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
}
await click($("#as-save-btn"));
const a4 = store.get("arc");
ok("4b. Save keeps the arc and its week, with the new words",
   view() === "stretch-arc" && a4.marker === "Playing on the floor with the grandchildren" && a4.startedAt === ARC.startedAt && a4.aimId === ARC.aimId,
   JSON.stringify(a4));
ok("4c. read back on the arc", txt($(".sa-know")).includes("Playing on the floor"));

// ── 5. START A FRESH ARC ───────────────────────────────────────────────
console.log("\nTEST 5 - Start a fresh arc");
await click($('[data-arc-change="fresh"]'));
ok("5a. the four questions from the first, this aim already chosen",
   view() === "arc-setup" && /What do you want to be able to do/.test(txt($("h1"))) &&
   $(`[data-aim="${ARC.aimId}"]`)?.getAttribute("aria-pressed") === "true" && !$("#as-next-btn")?.disabled);
await click($("#as-next-btn"));                                   // keep the aim
ok("5b. What feeds it starts empty (a fresh arc chooses again)", $$('[data-strand][aria-pressed="true"]').length === 0);
await click($$("[data-strand]")[0]);
await click($("#as-next-btn"));
await click($("#as-skip-btn"));
ok("5c. Is this yours?", /Is this yours/.test(txt($("h1"))));
await click($("#as-start-btn"));
const a5 = store.get("arc");
ok("5d. Yes, that's mine: the arc starts again at week 1", view() === "stretch-arc" && a5.startedAt === iso(0) && arcWeek(a5) === 1 &&
   txt($(".sa-meta")).startsWith("Week 1"), JSON.stringify(a5));

// ── 6. SETTING ONE UP FROM NOTHING IS UNCHANGED ────────────────────────
console.log("\nTEST 6 - setting one up from nothing");
fixture(null);
await go("arc-setup");
ok("6. step 1, nothing chosen, Continue (no Save)", /What do you want to be able to do/.test(txt($("h1"))) &&
   !$('[data-aim][aria-pressed="true"]') && !!$("#as-next-btn") && !$("#as-save-btn"));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
