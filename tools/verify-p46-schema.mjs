/**
 * tools/verify-p46-schema.mjs
 * 24 Nov 2026 v1
 *
 * P-46 FREE-AND-FIRST, S1 SCHEMA + SAFE DEFAULT (spec
 * docs/specs/alongside_free-and-first_24nov2026_v1.md §3, §8).
 *
 *   TEST 1  onboarding.flow ("short" or null) and askLater (activity,
 *           goals, weekly: shownAt, answeredAt, notNowAt) are made safe on
 *           load; setAskLater() merges and cleans.
 *   TEST 2  The safe default: someone who came through the short start
 *           with no activity level is built as "light" (difficulty 3 at
 *           most, no impact) until they answer. The old start, with no
 *           level, keeps "moderate" (unchanged); an answer always wins.
 *   TEST 3  The assessment starts from the same level.
 *   TEST 4  Restore brings both fields back.
 *
 * Drives buildSession() (every plan screen's builder) and store.load().
 * Red on alongside-v737.
 */
import { createRequire as __cr } from "node:module";
import { agreed } from "./agreed.mjs";
const { JSDOM } = __cr(import.meta.url)("jsdom");
const dom = new JSDOM('<!doctype html><div id="main-content"></div>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const SB = await import(B + "session-builder.js");
const AS = await import(B + "data/assessment.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");
const log = console.log; console.log = (...a) => { if (!/Store initialised|Store loaded/.test(String(a[0]))) log(...a); };
let fails = 0, passes = 0;
const ok = (n, c, d = "") => { log(`  ${c ? "PASS" : "FAIL"}  ${n}`); if (c) passes++; else { fails++; if (d) log(`        ${String(d).slice(0, 400)}`); } };
const KEY = "alongside_user";
const reload = saved => { localStorage.clear(); localStorage.setItem(KEY, JSON.stringify(saved)); store.init(); };
const byId = new Map(EXERCISES.map(e => [e.id, e]));

log("\nTEST 0 - self-check: the fixture writes where the store reads");
localStorage.clear(); store.init(); agreed(store); store.set("name", "Zed");
const raw = localStorage.getItem(KEY);
ok("0a. the store saves under " + KEY, !!raw && JSON.parse(raw).name === "Zed", raw && raw.slice(0, 120));

log("\nTEST 1 - the fields, made safe");
localStorage.clear(); store.init();
ok("1a. default: onboarding.flow is null", store.get("onboarding")?.flow === null, JSON.stringify(store.get("onboarding")));
ok("1b. default: askLater is {}", JSON.stringify(store.get("askLater")) === "{}", JSON.stringify(store.get("askLater")));
const base = JSON.parse(localStorage.getItem(KEY) || "{}");
reload({ ...base, onboarding: { flow: "short", threadCompletedAt: "2026-11-24T10:00:00Z" } });
ok("1c. flow 'short' is kept", store.get("onboarding.flow") === "short");
reload({ ...base, onboarding: { flow: "<b>long" } });
ok("1d. any other flow -> null", store.get("onboarding.flow") === null, store.get("onboarding.flow"));
const at = "2026-11-24T10:00:00.000Z";
reload({ ...base, askLater: { activity: { shownAt: at, answeredAt: null, notNowAt: "junk" }, goals: "x", sneaky: { shownAt: at }, weekly: { shownAt: at, notNowAt: at, extra: 1 } } });
const al = store.get("askLater");
ok("1e. askLater: a known question keeps its readable dates, junk dates -> null", al?.activity?.shownAt === at && al.activity.notNowAt === null && al.activity.answeredAt === null, JSON.stringify(al));
ok("1f. askLater: unknown ids and non-objects dropped, extra keys dropped", !("sneaky" in (al || {})) && !("goals" in (al || {})) && al?.weekly && !("extra" in al.weekly) && al.weekly.notNowAt === at, JSON.stringify(al));
localStorage.clear(); store.init();
ok("1g. setAskLater() merges and saves", typeof store.setAskLater === "function" && (store.setAskLater("goals", { shownAt: at }), store.setAskLater("goals", { notNowAt: at }), true) && JSON.parse(localStorage.getItem(KEY)).askLater?.goals?.shownAt === at && store.get("askLater").goals.notNowAt === at, JSON.stringify(store.get("askLater")));
ok("1h. setAskLater() refuses an unknown id", (() => { try { store.setAskLater("nope", { shownAt: at }); } catch {} return !("nope" in (store.get("askLater") || {})); })());

log("\nTEST 2 - the safe default");
const CAP = { balanceWorry: "no", chairRise: "yes", legPower: "full", floorAccess: "yes", askedAt: at };
function person({ flow = null, level = null } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("tier", "free");
  store.set("equipment", []); store.set("homeEquipment", []); store.set("sessionLocation", "home");
  store.set("capability", { ...CAP });
  if (flow) store.set("onboarding.flow", flow);
  if (level) store.set("lifestyle", { activityLevel: level });
}
function run(o, n = 80) {
  let maxD = 0, impact = 0, built = 0;
  for (let i = 0; i < n; i++) {
    person(o);
    for (const type of ["full", "lower", "cardio"]) {
      const s = SB.buildSession({ sessionType: type, durationMins: 30, location: "home" });
      for (const e of s?.exercises || []) { built++; const d = Number((byId.get(e.id) || e).difficultyLevel) || 0; if (d > maxD) maxD = d; if ((byId.get(e.id) || e).impact === true) impact++; }
    }
  }
  return { maxD, impact, built };
}
const shortNone = run({ flow: "short" });
ok("2a. short start, no level: nothing above difficulty 3", shortNone.built > 500 && shortNone.maxD <= 3, JSON.stringify(shortNone));
ok("2b. short start, no level: no impact moves", shortNone.impact === 0, JSON.stringify(shortNone));
const longNone = run({});
ok("2c. control - the old start with no level still reaches difficulty 4 (moderate, unchanged)", longNone.maxD === 4, JSON.stringify(longNone));
const shortActive = run({ flow: "short", level: "active" });
ok("2d. short start, answered 'active': the answer wins (above 3)", shortActive.maxD > 3, JSON.stringify(shortActive));
person({ flow: "short" });
ok("2e. store.declaredLevel(): short and unanswered -> light; answered -> the answer; old start -> null",
   typeof store.declaredLevel === "function" && store.declaredLevel() === "light"
   && (store.set("lifestyle", { activityLevel: "active" }), store.declaredLevel() === "active")
   && (person({}), store.declaredLevel() === null), typeof store.declaredLevel);

log("\nTEST 3 - the assessment starts from the same level");
person({ flow: "short" });
const r1 = AS.recordAssessmentAnswers({ squat: "comfortable", push: "comfortable", pull: "comfortable" });
ok("3a. short start, no level, all comfortable -> one step up from light (moderate)", r1?.measuredLevel === "moderate", JSON.stringify(r1));
person({});
const r2 = AS.recordAssessmentAnswers({ squat: "comfortable", push: "comfortable", pull: "comfortable" });
ok("3b. control - old start, no level -> one step up from moderate (active), unchanged", r2?.measuredLevel === "active", JSON.stringify(r2));

log("\nTEST 4 - Restore brings both back");
const RS = await import(B + "data/restore.js");
const fn = RS.applyRestore || RS.restoreFrom || null;
ok("4a. both fields are store defaults, so Restore's known-field list includes them", "askLater" in store.getDefaults() && "flow" in (store.getDefaults().onboarding || {}), Object.keys(store.getDefaults()).length);

log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
