/**
 * tools/verify-p41-moveup.mjs
 * 26 Nov 2026 v1
 *
 * P-41 S3 MOVING UP (spec BNH-Files Product/alongside_p41_three-age-
 * versions_spec_25nov2026_v2.md §1, approved by Graeme 25 Nov). From the
 * month a 16-17 year old turns 18 (the month after their birth month, as
 * the adult rule), the phone is the adult version by itself; the month is
 * let go; Home says so once; nothing they made changes.
 *
 *   1  On load: the month come, moved up; a month to come, not; the same
 *      month, moved up. Adults never move.
 *   2  With the app open across the month (ageMoveUpIfDue).
 *   3  Home says it once, first, on both tiers; the next Home does not.
 *   4  After moving up the adult version's rules apply, and nothing they
 *      made is lost.
 *
 * Red on alongside-v752 (no ageMoveUpIfDue, no ageMovedUpAt).
 */
import { agreed } from "./agreed.mjs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div><nav id="bottom-nav"></nav></div><div id="sr-announcer"></div>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.history = dom.window.history; globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };
globalThis.fetch = async () => ({ ok: false });

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
globalThis.window.router = router;
Object.defineProperty(globalThis, "router", { value: router, configurable: true, writable: true });
const AV = await import(B + "data/age-version.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${String(detail).slice(0, 400)}`); }
};
async function block(name, fn) { try { await fn(); } catch (e) { ok(`${name}: ran without throwing`, false, e.stack?.split("\n").slice(0, 3).join(" | ")); } }
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const c = () => store.get("consent") || {};
const ym = back => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - back); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; };

function young(next, tier = "personal") {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", tier);
  store.set("journalEntries", [{ id: "j1", date: new Date().toISOString(), text: "Mine", tags: [] }]);
  store.set("consent.ageConfirmed", true); store.set("consent.ageGroup", "young-16"); store.set("consent.ageGroupNext", next);
  store.init();
  router.history = []; router.currentView = null;
}

await block("TEST 1", async () => {
  console.log("\nTEST 1 - on load");
  young(ym(1));
  ok("1a. the month came last month: moved up to the adult version", c().ageGroup === "adult" && c().ageGroupNext === null && !!c().ageMovedUpAt && !!c().ageGroupAt, JSON.stringify(c()));
  young(ym(0));
  ok("1b. this month: moved up", c().ageGroup === "adult" && !!c().ageMovedUpAt);
  young(ym(-1));
  ok("1c. next month: still the 16-17 version, the month kept", c().ageGroup === "young-16" && c().ageGroupNext === ym(-1) && c().ageMovedUpAt === null, JSON.stringify(c()));
  localStorage.clear(); store.init(); agreed(store); store.set("consent.ageConfirmed", true); store.set("consent.ageGroup", "adult"); store.set("consent.ageMovedUpAt", null); store.init();
  ok("1d. control: an adult never moves, and has nothing to be told", c().ageGroup === "adult" && c().ageMovedUpAt === null);
  store.set("consent.ageMovedUpAt", "nonsense"); store.init();
  ok("1e. a bad time loads as null", c().ageMovedUpAt === null);
});

await block("TEST 2", async () => {
  console.log("\nTEST 2 - with the app open across the month");
  young(ym(-1));
  const later = new Date(); later.setDate(1); later.setMonth(later.getMonth() + 1); later.setDate(3);
  ok("2a. before the month: nothing happens", store.ageMoveUpIfDue(new Date()) === false && c().ageGroup === "young-16");
  ok("2b. the month comes: moved up", store.ageMoveUpIfDue(later) === true && c().ageGroup === "adult" && c().ageGroupNext === null && !!c().ageMovedUpAt);
  store.init();
  ok("2c. and it is saved", c().ageGroup === "adult");
});

await block("TEST 3", async () => {
  console.log("\nTEST 3 - Home says it once, both tiers");
  for (const tier of ["personal", "free"]) {
    young(ym(1), tier);
    await router.navigate("today"); await wait(150);
    ok(`3a. ${tier}: Home says they're 18 now and nothing they made has changed`, txt(main).includes("You’re 18 now, so Alongside shows you everything for adults. Nothing you made has changed."), txt(main).slice(0, 200));
    ok(`3b. ${tier}: said as a status, not a pop-up`, [...main.querySelectorAll('[role="status"]')].some(e => /18 now/.test(txt(e))));
    await router.navigate("settings"); await wait(80);
    await router.navigate("today"); await wait(150);
    ok(`3c. ${tier}: the next Home does not say it again`, !/18 now/.test(txt(main)) && c().ageMovedUpAt === null);
  }
  young(ym(-2));
  await router.navigate("today"); await wait(150);
  ok("3d. control: not yet 18, nothing said", !/18 now/.test(txt(main)));
});

await block("TEST 4", async () => {
  console.log("\nTEST 4 - after moving up");
  young(ym(1));
  ok("4a. the adult version's rules apply", AV.isYoung() === false && AV.weightAllowed() && AV.messagesAllowed() && AV.inStepOpen() && AV.canBuy());
  store.set("weightTracking", true);
  ok("4b. weight tracking can now be turned on (off until they do)", store.get("weightTracking") === true);
  ok("4c. nothing they made is lost", (store.get("journalEntries") || []).length === 1 && store.get("name") === "Sam");
  young(ym(-1));
  ok("4d. control: before the month, still the 16-17 rules", AV.isYoung() === true && !AV.weightAllowed());
});

console.log(`\n${"=".repeat(60)}\nVERIFY-P41-MOVEUP: ${passes} passed, ${fails} failed\n${"=".repeat(60)}`);
process.exit(fails ? 1 : 0);
