/**
 * tools/verify-p41-rules.mjs
 * 26 Nov 2026 v1
 *
 * P-41 THREE AGE VERSIONS, S2 RULES (spec BNH-Files Product/alongside_p41_
 * three-age-versions_spec_25nov2026_v2.md, approved by Graeme 25 Nov). Each
 * rule driven in the 16-17 version (consent.ageGroup young-16) and, as the
 * control, in the adult version, which must be exactly as before.
 *
 *   0  The version is read from what the age question kept.
 *   1  Weight: tracking never on, nothing kept, no Weight in Settings, no
 *      Lose weight goal.
 *   2  Where to get help: Childline and Shout first, a trusted adult named.
 *   3  Sore areas: the knee and heel lines add the GP or physio check;
 *      other areas do not.
 *   4  Hard training: every hard day counts together, two a week at most;
 *      Zone 2's harder day goes once two are done; Your week will not save
 *      a third Hard day and says why.
 *   5  In Step: Coming soon, no episode opens, never offered at the finish;
 *      Making my Move says Coming soon for your age.
 *   6  Messages: none fetched or shown, no Messages row in Settings.
 *   7  Buying: no I'm ready on the upgrade page; a parent or carer can.
 *
 * Red on alongside-v751 (no data/age-version.js).
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
dom.window.confirm = () => false; globalThis.confirm = () => false;
globalThis.fetch = async () => ({ ok: true, json: async () => ({ messages: [{ id: "m1", kind: "app", title: "Hello", body: "A message", publishedAt: "2026-11-01" }] }) });

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
globalThis.window.router = router;
Object.defineProperty(globalThis, "router", { value: router, configurable: true, writable: true });
let AV = {};
try { AV = await import(B + "data/age-version.js"); } catch { /* red first */ }
const { supportLinesHTML } = await import(B + "data/support-lines.js");
const { soreLine } = await import(B + "data/conditions.js");
const TR = await import(B + "data/trend-recipes.js");
const { offeredGoals } = await import(B + "data/goals.js");
const MSG = await import(B + "data/messages.js");
const OFF = await import(B + "data/in-step-offer.js");
const WM = await import(B + "data/week-shape-model.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${String(detail).slice(0, 400)}`); }
};
async function block(name, fn) { try { await fn(); } catch (e) { ok(`${name}: ran without throwing`, false, e.stack?.split("\n").slice(0, 3).join(" | ")); } }
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const $ = s => main.querySelector(s);
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = async (el, ms = 80) => { el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true })); await wait(ms); };
const holder = html => { const d = document.createElement("div"); d.innerHTML = html; return d; };

function person(version, tier = "personal") {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("consent.ageConfirmed", true);
  store.set("consent.ageGroup", version === "young" ? "young-16" : "adult");
  store.set("consent.ageGroupNext", version === "young" ? "2027-12" : null);
  store.init();   // as on a phone: what the age question kept, loaded
  router.history = []; router.currentView = null;
}
async function go(r) { await router.navigate(r); await wait(80); }

await block("TEST 0", async () => {
  console.log("\nTEST 0 - the version, from what the age question kept");
  ok("0pc. the rules exist", typeof AV.isYoung === "function");
  person("young"); ok("0a. a young-16 phone is the 16-17 version", AV.ageGroupNow() === "young-16" && AV.isYoung());
  person("adult"); ok("0b. control: an adult phone is the adult version", AV.ageGroupNow() === "adult" && !AV.isYoung());
});

await block("TEST 1", async () => {
  console.log("\nTEST 1 - weight");
  person("young");
  store.set("weightTracking", true); store.set("weight", 60);
  ok("1a. 16-17: weight tracking cannot be turned on, and no weight is kept", store.get("weightTracking") === false && store.get("weight") == null, JSON.stringify([store.get("weightTracking"), store.get("weight")]));
  ok("1b. 16-17: Lose weight is never offered", !JSON.stringify(offeredGoals({ weightTracking: store.get("weightTracking") === true })).includes("lose-weight"));
  await go("settings"); await click(main.querySelector('[data-section-open="body"]'));
  ok("1c. 16-17: Settings › Your body has no weight tracking", !/Weight tracking/.test(txt(main)) && /Your body/.test(txt(main)), txt(main).slice(0, 200));
  person("adult");
  store.set("weightTracking", true);
  ok("1d. control: an adult can turn it on", store.get("weightTracking") === true);
  ok("1e. control: an adult with tracking on is offered Lose weight", JSON.stringify(offeredGoals({ weightTracking: true })).includes("lose-weight"));
  await go("settings"); await click(main.querySelector('[data-section-open="body"]'));
  ok("1f. control: an adult's Settings › Your body has weight tracking", /Weight tracking/.test(txt(main)));
});

await block("TEST 2", async () => {
  console.log("\nTEST 2 - where to get help");
  person("young");
  const y = txt(holder(supportLinesHTML()));
  const names = [...holder(supportLinesHTML()).querySelectorAll("strong")].map(txt);
  ok("2a. 16-17: Childline then Shout first", names[0] === "Childline" && names[1] === "Shout", JSON.stringify(names));
  ok("2b. 16-17: Childline's number, and a trusted adult named", /0800 1111/.test(y) && /trusted adult/i.test(y) && !!holder(supportLinesHTML()).querySelector('a[href="tel:08001111"]'));
  ok("2c. 16-17: Samaritans, 111 and 999 still there", /116 123/.test(y) && /call 111/.test(y) && /999/.test(y));
  person("adult");
  const a = [...holder(supportLinesHTML()).querySelectorAll("strong")].map(txt);
  ok("2d. control: an adult's list is as before (Samaritans first, no Childline)", a[0] === "Samaritans" && !a.includes("Childline"), JSON.stringify(a));
});

await block("TEST 3", async () => {
  console.log("\nTEST 3 - sore areas in a growing body");
  person("young");
  ok("3a. 16-17: a sore knee adds the GP or physio check", /keeps hurting, show it to a GP or physio/.test(soreLine("knee", 4)), soreLine("knee", 4));
  ok("3b. 16-17: the heel and the back of the heel too", /heel keeps hurting/.test(soreLine("plantar-fasciitis", 4)) && /heel keeps hurting/.test(soreLine("achilles", 4)));
  ok("3c. 16-17: a shoulder does not", !/GP or physio/.test(soreLine("shoulder", 4)));
  person("adult");
  ok("3d. control: an adult's knee line is as before", !/GP or physio/.test(soreLine("knee", 4)) && /^You said your knee is a little sore today\./.test(soreLine("knee", 2)), soreLine("knee", 2));
});

await block("TEST 4", async () => {
  console.log("\nTEST 4 - hard training");
  const now = new Date(2026, 10, 26, 12);   // Thursday
  const mon = new Date(2026, 10, 23, 9).toISOString(), tue = new Date(2026, 10, 24, 9).toISOString();
  const two = [{ trend: "hilit", status: "complete", completedAt: mon }, { trend: "zone2", effort: "hard", status: "complete", completedAt: tue }];
  person("young");
  ok("4a. 16-17: after two hard days, HILIT is not offered, and says why", TR.hilitDayAllowed(two, now).ok === false && /two hard days this week/.test(TR.hilitDayAllowed(two, now).why), JSON.stringify(TR.hilitDayAllowed(two, now)));
  ok("4b. 16-17: nor Hybrid", TR.hybridDayAllowed(two, now).ok === false);
  ok("4c. 16-17: Zone 2's harder day has gone for this week", TR.zone2HardDoneThisWeek(two.slice(0, 1).concat([{ trend: "hybrid", status: "complete", completedAt: tue }]), now) === true);
  ok("4d. 16-17: one hard day done, HILIT is still offered", TR.hilitDayAllowed(two.slice(1), now).ok === true);
  ok("4e. 16-17: reformer-style is not a hard day", TR.reformerDayAllowed(two, now).ok === true);
  person("adult");
  ok("4f. control: an adult after the same two days can do HILIT (its own rule only)", TR.hilitDayAllowed(two, now).ok === true);
  ok("4g. control: an adult's Zone 2 harder day is not taken by HILIT", TR.zone2HardDoneThisWeek(two.slice(0, 1), now) === false);

  // Your week: two Hard days set, then a third.
  const shape = () => {
    const templates = {}, days = {};
    for (const [d, n] of [["mon", 1], ["tue", 2], ["wed", 3]]) { const t = WM.newTemplate(Object.keys(templates), `D${n}`); t.intensity = n < 3 ? "hard" : "steady"; templates[t.id] = t; days[d] = t.id; }
    for (const d of ["thu", "fri", "sat", "sun"]) days[d] = "rest";
    return WM.sanitizeWeekShape({ templates, days, setAt: "2026-11-23" });
  };
  for (const v of ["young", "adult"]) {
    person(v); store.set("weekShape", shape());
    await go("your-week");
    await click(main.querySelector('[data-day="wed"]'));
    const said = txt(main);
    await click(main.querySelector('[data-int="hard"]'));
    await click(main.querySelector("#yw-save"));
    const wed = store.get("weekShape"); const hard = AV.hardDaysInWeek?.(wed);
    if (v === "young") {
      ok("4h. 16-17: How hard says two hard days a week at most", /Two hard days a week at most at your age/.test(said));
      ok("4i. 16-17: a third Hard day is not saved, and it says why", hard === 2 && /more than two hard days this week/.test(txt($("#yw-int-error"))), `${hard} ${txt($("#yw-int-error"))}`);
    } else {
      ok("4j. control: an adult can save a third Hard day, with no age line", hard === 3 && !/at your age/.test(said), String(hard));
    }
  }
});

await block("TEST 5", async () => {
  console.log("\nTEST 5 - In Step");
  person("young");
  await go("in-step");
  ok("5a. 16-17: In Step is coming soon, with a heading and a way back", /coming soon/.test(txt($("#is-soon"))) && txt($("h1")) === "In Step" && !!$("#is-back"), txt(main).slice(0, 200));
  ok("5b. 16-17: no episode to open", !main.querySelector("[data-ep]"));
  ok("5c. 16-17: never offered at a finish", OFF.offerForFinish({ sessionCount: 20 }) === null);
  await go("my-move"); await click(main.querySelector('[data-go="for"]'));
  ok("5d. 16-17: Making my Move says Coming soon for your age", /Coming soon for your age/.test(txt(main)), txt(main).slice(0, 300));
  person("adult");
  await go("in-step");
  ok("5e. control: an adult sees the episodes", !!main.querySelector("[data-ep]") && !$("#is-soon"));
});

await block("TEST 6", async () => {
  console.log("\nTEST 6 - messages");
  person("young");
  const got = await MSG.refreshMessages(globalThis.fetch);
  ok("6a. 16-17: nothing is fetched", got === false && !(store.get("messages.list") || []).length);
  store.set("messages.list", [{ id: "m1", kind: "app", title: "Hello", body: "x", publishedAt: "2026-11-01" }]);
  ok("6b. 16-17: nothing is shown, so no dot", MSG.visibleMessages().length === 0 && MSG.hasUnread() === false);
  await go("settings");
  ok("6c. 16-17: no Messages row in Settings", !main.querySelector('[data-open="messages"]'));
  person("adult");
  const got2 = await MSG.refreshMessages(globalThis.fetch);
  ok("6d. control: an adult's messages arrive and show", got2 === true && MSG.visibleMessages().length >= 1);
  await go("settings");
  ok("6e. control: an adult's Settings has Messages", !!main.querySelector('[data-open="messages"]'));
});

await block("TEST 7", async () => {
  console.log("\nTEST 7 - buying the Plan");
  person("young", "free");
  await go("upgrade");
  ok("7a. 16-17: no I'm ready", !$("#upgrade-cta"), txt(main).slice(0, 100));
  ok("7b. 16-17: says a parent or carer can buy a place, and won't see anything", /parent or carer can buy a place/.test(txt($("#upgrade-young"))) && /won’t see anything/.test(txt($("#upgrade-young"))));
  person("adult", "free");
  await go("upgrade");
  ok("7c. control: an adult has I'm ready", !!$("#upgrade-cta") && !$("#upgrade-young"));
});

console.log(`\n${"=".repeat(60)}\nVERIFY-P41-RULES: ${passes} passed, ${fails} failed\n${"=".repeat(60)}`);
process.exit(fails ? 1 : 0);
