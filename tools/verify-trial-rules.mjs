/**
 * tools/verify-trial-rules.mjs
 * 28 Nov 2026 v2
 *
 * v2 - Row 13a ACCOUNTS, S1. 6a: app.js's account check may follow the trial's
 *   on the same open (it does not hold up the first screen). 6b: account.js
 *   may write planTrial too, mirroring the server's trial (verify-accounts-rules).
 *
 * 27 Nov 2026 v1
 *
 * Row 17 / P-40, Try the Plan, S1 (spec docs/specs/alongside_plan-trial_
 * 27nov2026_v1.md; mock-up v2 approved by Graeme 27 Nov).
 *
 *   1  Schema v1.144: planTrial, cleaned on load.
 *   2  Starting: the Plan for 14 days to a local end day; one per phone;
 *      not on the Plan already; never in a young version.
 *   3  The end: on the first open on or after the end day, back to Free;
 *      nothing else changed or deleted; Go back to Free now.
 *   4  The notice: 2 days or fewer left, once, never on a hard or low day.
 *   5  The offer: Free, from the first finished session, once a week at
 *      most, never on a hard, low or sore day, never once trialled.
 *   6  The open: app.js checks before the first screen.
 *
 * Red on alongside-v762.
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
globalThis.CSS = { escape: s => String(s).replace(/"/g, '\\"') };
globalThis.fetch = async () => ({ ok: false });

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
globalThis.window.router = router;
Object.defineProperty(globalThis, "router", { value: router, configurable: true, writable: true });

const T = await import(B + "data/plan-trial.js");
const fs = await import("node:fs");
const read = f => fs.readFileSync(new URL("../" + f, import.meta.url), "utf8");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${String(detail).slice(0, 300)}`); }
};
async function block(name, fn) { try { await fn(); } catch (e) { ok(`${name}: ran without throwing`, false, e.stack?.split("\n").slice(0, 3).join(" | ")); } }
const at = (y, m, d, h = 9) => new Date(y, m - 1, d, h);
function person({ tier = "free", age = "adult" } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", tier);
  store.set("consent", { ...(store.get("consent") || {}), ageConfirmed: true, ageGroup: age });
  store.set("checkinHistory", {}); store.set("conditionPainScores", {});
}

await block("TEST 1", async () => {
  console.log("\nTEST 1 - Schema v1.144: planTrial");
  person(); store.init();   // merged defaults come with a load (as verify-p37-sets)
  ok("1a. the default is empty", JSON.stringify(store.get("planTrial")) === "{}", JSON.stringify(store.get("planTrial")));
  store.set("planTrial", { startedAt: "2026-11-27T09:00:00.000Z", endsOn: "2026-12-11", noticedAt: "nope", endedAt: "2026-12-11T08:00:00.000Z", endedHow: "lost", offeredAt: 5, extra: 1 });
  store.init();
  ok("1b. known kept, a bad time dropped, endedHow ended unless stopped, anything else dropped", JSON.stringify(store.get("planTrial")) === '{"startedAt":"2026-11-27T09:00:00.000Z","endsOn":"2026-12-11","endedAt":"2026-12-11T08:00:00.000Z","endedHow":"ended"}', JSON.stringify(store.get("planTrial")));
  store.set("planTrial", { startedAt: "2026-11-27T09:00:00.000Z", endsOn: "11 Dec" }); store.init();
  ok("1c. a start without a proper end day is not kept", !store.get("planTrial").startedAt);
  ok("1d. Schema.md documents it, and the live store", /v1\.144[\s\S]*planTrial/.test(read("docs/Schema.md")) && /confirmed live version: \*\*v1(4[1-9]|[5-9]\d)/.test(read("docs/Schema.md")));
});

await block("TEST 2", async () => {
  console.log("\nTEST 2 - Starting");
  person();
  ok("2a. on Free, never trialled, an adult: it may start", T.canStartTrial());
  ok("2b. it starts: the Plan, ending 14 days on, a local day", T.startTrial(at(2026, 11, 27)) && store.get("tier") === "personal" && T.trialEndsOn() === "2026-12-11" && T.trialActive(), JSON.stringify(store.get("planTrial")));
  ok("2c. said as a date: Friday 11 December", T.endsOnWords() === "Friday 11 December" && T.endsOnDay() === "Friday", T.endsOnWords());
  ok("2d. 14 days left on the first day, 0 on the end day", T.daysLeft(at(2026, 11, 27)) === 14 && T.daysLeft(at(2026, 12, 11)) === 0);
  T.endTrial(at(2026, 12, 1), "stopped");
  ok("2e. one trial per phone: once ended, it can't start again", !T.canStartTrial() && !T.startTrial(at(2026, 12, 2)) && store.get("tier") === "free");
  person({ tier: "personal" });
  ok("2f. not on the Plan already", !T.canStartTrial() && !T.startTrial());
  person({ age: "young-16" });
  ok("2g. never in a young version (the Plan isn't bought under 18)", !T.canStartTrial() && !T.startTrial());
  ok("2h. a clock across midnight and the month: 18 Dec starts end on 1 Jan", (() => { person(); T.startTrial(at(2026, 12, 18, 23)); return T.trialEndsOn() === "2027-01-01"; })(), T.trialEndsOn());
});

await block("TEST 3", async () => {
  console.log("\nTEST 3 - The end");
  person();
  store.set("myExercisesOnHome", { "Wake-up hips": "morning" }); store.set("myMove", { purposes: ["strength"] });
  T.startTrial(at(2026, 11, 27));
  ok("3a. before the end day: nothing happens", !T.checkTrial(at(2026, 12, 10, 23)) && store.get("tier") === "personal");
  ok("3b. on the end day: back to Free", T.checkTrial(at(2026, 12, 11, 7)) && store.get("tier") === "free" && T.trialEnded() && T.trial().endedHow === "ended");
  ok("3c. nothing else changed or deleted", store.get("myExercisesOnHome")["Wake-up hips"] === "morning" && JSON.stringify(store.get("myMove")?.purposes) === '["strength"]');
  ok("3d. checking again does nothing", !T.checkTrial(at(2026, 12, 20)) && store.get("tier") === "free");
  person(); T.startTrial(at(2026, 11, 27));
  ok("3e. weeks later, the first open ends it", T.checkTrial(at(2027, 2, 1)) && store.get("tier") === "free");
  person(); T.startTrial(at(2026, 11, 27));
  ok("3f. Go back to Free now: stopped, on Free", T.endTrial(at(2026, 11, 30), "stopped") && store.get("tier") === "free" && T.trial().endedHow === "stopped");
  ok("3g. a Plan with no trial is never ended by the check", (() => { person({ tier: "personal" }); return !T.checkTrial(at(2027, 6, 1)) && store.get("tier") === "personal"; })());
});

await block("TEST 4", async () => {
  console.log("\nTEST 4 - The notice");
  person(); T.startTrial(at(2026, 11, 27));
  ok("4a. not with three days left", !T.noticeDue(at(2026, 12, 8)));
  ok("4b. with two left (day 12): due", T.noticeDue(at(2026, 12, 9)));
  store.set("checkinHistory", { [new Date().toISOString().split("T")[0]]: { mood: 1, energy: 1, timestamp: new Date().toISOString() } });
  ok("4c. not on a low day (it waits)", !T.noticeDue(at(2026, 12, 9)));
  store.set("checkinHistory", {});
  T.markNoticed(at(2026, 12, 9));
  ok("4d. once: shown, never again", !T.noticeDue(at(2026, 12, 10)));
  T.endTrial(at(2026, 12, 11));
  ok("4e. not after the end", !T.noticeDue(at(2026, 12, 12)));
});

await block("TEST 5", async () => {
  console.log("\nTEST 5 - The offer");
  person();
  ok("5a. not before a first finished session", !T.offerDue({ sessionCount: 0 }));
  ok("5b. after the first: due", T.offerDue({ sessionCount: 1, now: at(2026, 11, 27) }));
  ok("5c. not for a session stopped part way", !T.offerDue({ sessionCount: 1, partial: true }));
  T.markOffered(at(2026, 11, 27));
  ok("5d. once a week at most", !T.offerDue({ sessionCount: 2, now: at(2026, 12, 2) }) && T.offerDue({ sessionCount: 3, now: at(2026, 12, 4, 10) }));
  store.set("planTrial", {});
  store.set("checkinHistory", { [new Date().toISOString().split("T")[0]]: { mood: 1, energy: 3, timestamp: new Date().toISOString() } });
  ok("5e. never on a low day", !T.offerDue({ sessionCount: 1 }));
  store.set("checkinHistory", {});
  T.startTrial(at(2026, 11, 27)); T.endTrial(at(2026, 12, 11));
  ok("5f. never once trialled", !T.offerDue({ sessionCount: 9 }));
  person({ tier: "personal" });
  ok("5g. never on the Plan", !T.offerDue({ sessionCount: 1 }));
});

await block("TEST 6", async () => {
  console.log("\nTEST 6 - The open");
  const app = read("js/app.js");
  ok("6a. app.js checks the trial after the store loads and before the first screen", /store\.init\(\);\s*checkTrial\(\);[^\n]*\n(\s*checkAccount\(\)[^\n]*\n)?\s*router\.init\(\);/.test(app));
  ok("6b. plan-trial.js is the only writer of planTrial (and, v2, account.js mirroring the server's)", fs.readdirSync(new URL("../js/", import.meta.url), { recursive: true }).filter(f => /\.js$/.test(f) && !/data\/(plan-trial|account)\.js$/.test(f)).every(f => !/store\.set\(\s*["']planTrial/.test(read("js/" + f))));
});

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
