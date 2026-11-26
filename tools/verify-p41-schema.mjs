/**
 * tools/verify-p41-schema.mjs
 * 25 Nov 2026 v1
 *
 * P-41 THREE AGE VERSIONS, S1 SCHEMA (spec BNH-Files Product/alongside_p41_
 * three-age-versions_spec_25nov2026_v2.md, approved by Graeme 25 Nov).
 *
 *   1  Which version suits an age, by the month rule: 18 and over adult;
 *      16-17 young-16 with the month they move up; 14-15 young-14; under
 *      14 under. The edges at 14, 16 and 18, month by month.
 *   2  Schema v1.137: consent.ageGroup, ageGroupNext, ageGroupAt in the
 *      defaults; cleaned on load field by field; a phone let in before is
 *      an adult; a young-16 with no month is asked again.
 *   3  Recording: an adult is recorded as adult with no month; nothing of
 *      the date is kept. While the young versions are closed (S1), a 16-17
 *      or 14-15 year old is kept out exactly as before: everything deleted,
 *      no group, no month. Opened (as S5 will), a 16-17 year old is let in
 *      with young-16 and the month to move up, and nothing else of the date.
 *   4  Nothing on screen changes in S1: onboarding with a 17-year-old still
 *      goes to the under-18 screen.
 *
 * Red on alongside-v750 (no ageGroupFor, no consent.ageGroup).
 */
import { oneScreen } from "./one-screen.mjs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: true, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(0), 0);
dom.window.requestAnimationFrame = globalThis.requestAnimationFrame;
globalThis.history = dom.window.history; globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const AC = await import(B + "data/age-check.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
async function block(name, fn) { try { await fn(); } catch (e) { ok(`${name}: ran without throwing`, false, e.stack?.split("\n").slice(0, 3).join(" | ")); } }
const wait = ms => new Promise(r => setTimeout(r, ms));
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const pick = (root, sel, v) => { const e = root.querySelector(sel); if (e) { e.value = String(v); e.dispatchEvent(new dom.window.Event("change", { bubbles: true })); } return !!e; };

const NOW = new Date(2026, 10, 25, 12);   // 25 Nov 2026
const ym = back => { const d = new Date(NOW.getFullYear(), NOW.getMonth() - back, 1); return { m: d.getMonth() + 1, y: d.getFullYear() }; };
const grp = back => { const a = ym(back); return AC.ageGroupFor?.(a.m, a.y, NOW); };
const c = () => store.get("consent") || {};

await block("TEST 1", async () => {
  console.log("\nTEST 1 - which version suits an age, by the month rule");
  ok("1pc. the rule exists", typeof AC.ageGroupFor === "function");
  ok("1a. 30 years: adult, no month", grp(360)?.group === "adult" && grp(360)?.next === null);
  ok("1b. 18 last month: adult", grp(18 * 12 + 1)?.group === "adult");
  ok("1c. 18 this month: still 16-17 (the birth month does not count), moving up next month", grp(18 * 12)?.group === "young-16" && grp(18 * 12)?.next === "2026-12", JSON.stringify(grp(18 * 12)));
  const b = ym(17 * 12 + 8);   // born March 2009: 17 years 8 months
  ok("1d. 17 years 8 months: young-16, moving up the month after the month they turn 18", grp(17 * 12 + 8)?.group === "young-16" && grp(17 * 12 + 8)?.next === `${b.y + 18}-${String(b.m + 1).padStart(2, "0")}`, JSON.stringify([b, grp(17 * 12 + 8)]));
  ok("1e. 16 last month: young-16", grp(16 * 12 + 1)?.group === "young-16");
  ok("1f. 16 this month: young-14", grp(16 * 12)?.group === "young-14" && grp(16 * 12)?.next === null);
  ok("1g. 14 last month: young-14", grp(14 * 12 + 1)?.group === "young-14");
  ok("1h. 14 this month, and 10: under", grp(14 * 12)?.group === "under" && grp(120)?.group === "under");
  ok("1i. December birthday: moving up in January", (() => { const g = AC.ageGroupFor(12, 2009, NOW); return g?.group === "young-16" && g?.next === "2028-01"; })());
  ok("1j. not an answer: null", AC.ageGroupFor(13, 2009, NOW) === null && AC.ageGroupFor(1, 2027, NOW) === null);
});

await block("TEST 2", async () => {
  console.log("\nTEST 2 - Schema v1.137");
  localStorage.clear(); store.init();
  ok("2a. the defaults hold the three keys, null", "ageGroup" in c() && c().ageGroup === null && c().ageGroupNext === null && c().ageGroupAt === null, JSON.stringify(c()));
  const load = consent => { localStorage.clear(); store.init(); store.set("consent", { ...c(), ...consent }); store.init(); return c(); };
  ok("2b. a phone let in before P-41 loads as an adult", load({ given: true, ageConfirmed: true }).ageGroup === "adult");
  ok("2c. a phone kept out holds no group", load({ ageConfirmed: false, ageGroup: "adult" }).ageGroup === null);
  ok("2d. a group that is not one of the two is cleaned", load({ ageConfirmed: true, ageGroup: "child" }).ageGroup === "adult");
  ok("2e. a young-16 keeps its month", (x => x.ageGroup === "young-16" && x.ageGroupNext === "2027-04")(load({ ageConfirmed: true, ageGroup: "young-16", ageGroupNext: "2027-04" })));
  const nm = load({ given: true, ageConfirmed: true, ageGroup: "young-16", ageGroupNext: "April" });
  ok("2f. a young-16 with no month to move up is asked the age again", nm.ageGroup === null && nm.ageConfirmed === null && AC.ageNeeded(), JSON.stringify(nm));
  ok("2g. an adult carries no month", load({ ageConfirmed: true, ageGroup: "adult", ageGroupNext: "2027-04" }).ageGroupNext === null);
  ok("2h. a bad time is cleaned; control: a real one kept", load({ ageConfirmed: true, ageGroupAt: "soon" }).ageGroupAt === null && load({ ageConfirmed: true, ageGroupAt: NOW.toISOString() }).ageGroupAt === NOW.toISOString());
});

const { ThreadView } = await import(B + "views/onboarding/thread.js");
async function onboard(back) {
  localStorage.clear(); store.init();
  const el = document.createElement("div"); oneScreen(el);
  const navs = [];
  ThreadView({ navigate: v => navs.push(v), back() {} }).mount(el); await wait(2600);
  const a = ym(back);   // relative to today, as the screen reads today
  const t = new Date(); const d = new Date(t.getFullYear(), t.getMonth() - back, 1);
  pick(el, "#ob-age-month", d.getMonth() + 1); pick(el, "#ob-age-year", d.getFullYear());
  click(el.querySelector("#ob-age-continue")); await wait(10);
  return { el, navs, y: d.getFullYear(), a };
}

await block("TEST 3", async () => {
  console.log("\nTEST 3 - recording");
  let r = await onboard(30 * 12);
  ok("3a. an adult: let in, ageGroup adult, no month, when it was set", c().ageConfirmed === true && c().ageGroup === "adult" && c().ageGroupNext === null && !!c().ageGroupAt, JSON.stringify(c()));
  ok("3b. nothing of the date kept", !JSON.stringify(store.data).includes(`"${r.y}`) && !Object.values(c()).some(v => String(v).includes(String(r.y))));
  ok("3c. both young versions are closed in S1", AC.YOUNG_OPEN?.["young-16"] === false && AC.YOUNG_OPEN?.["young-14"] === false);
  r = await onboard(17 * 12);
  ok("3d. closed: a 17-year-old is kept out exactly as before (nothing kept, no group, no month)",
    r.navs.includes("under-18") && c().ageConfirmed === false && c().ageGroup === null && c().ageGroupNext === null && !store.get("name"), JSON.stringify([r.navs, c()]));
  r = await onboard(15 * 12);
  ok("3e. closed: a 15-year-old kept out the same way", r.navs.includes("under-18") && c().ageConfirmed === false && c().ageGroup === null);
  // Opened (as S5 will do): the same answer is let in as young-16, with its month.
  AC.YOUNG_OPEN["young-16"] = true;
  try {
    r = await onboard(17 * 12 + 8);
    const t = new Date(), born = new Date(t.getFullYear(), t.getMonth() - (17 * 12 + 8), 1), up = new Date(born.getFullYear() + 18, born.getMonth() + 1, 1);
    const want = `${up.getFullYear()}-${String(up.getMonth() + 1).padStart(2, "0")}`;
    ok("3f. opened: a 17-year-old is let in as young-16, with the month to move up", c().ageConfirmed === true && c().ageGroup === "young-16" && c().ageGroupNext === want && !r.navs.includes("under-18"), JSON.stringify([want, c()]));
    ok("3g. opened: still nothing of the date but that month", !Object.entries(c()).some(([k, v]) => k !== "ageGroupNext" && String(v).includes(String(r.y))));
    r = await onboard(15 * 12);
    ok("3h. opened 16-17 does not open 14-15", r.navs.includes("under-18") && c().ageConfirmed === false);
  } finally { AC.YOUNG_OPEN["young-16"] = false; }
  AC.recordAge(true, { group: "young-16", next: "2027-12" });
  ok("3i. closed: even asked directly, recordAge never records a young group", c().ageGroup === "adult" && c().ageGroupNext === null, JSON.stringify(c()));
});

await block("TEST 4", async () => {
  console.log("\nTEST 4 - nothing on screen changes in S1");
  const r = await onboard(17 * 12 + 6);
  ok("4a. a 17-year-old in onboarding goes to the under-18 screen, as on v750", r.navs.includes("under-18") && !r.el.querySelector("#ob-consent-check"));
  const a = await onboard(40 * 12);
  ok("4b. an adult goes on to the agreements, as on v750", !!a.el.querySelector("#ob-consent-check"));
  ok("4c. the question's words are unchanged in S1", /Alongside is for adults\. I only keep whether you are 18 or over, not the date\./.test(AC.ageQuestionHTML("w")));
});

console.log(`\n${"=".repeat(60)}\nVERIFY-P41-SCHEMA: ${passes} passed, ${fails} failed\n${"=".repeat(60)}`);
process.exit(fails ? 1 : 0);
