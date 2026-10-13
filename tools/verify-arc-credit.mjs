/**
 * tools/verify-arc-credit.mjs
 * 13 Oct 2026 v1
 *
 * ARC-CREDIT (found 12 Oct building A-5). store.markSessionWorked() ended
 *   if (type || zones.length) this.set("arc", arc);
 * and `type` was not defined there, so it threw on every call; its caller
 * caught it. The credit landed in memory (store.get returns the live
 * object), so every check that read the store passed; but set() never ran,
 * so it reached the phone's storage only if another write happened to save
 * the store afterwards. A session, then closing the app, could lose it.
 *
 * Every assertion here reads what is SAVED (localStorage), not the store's
 * memory, which is how the fault hid.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM("<!doctype html>", { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });

const { store } = await import(new URL("../js/store.js", import.meta.url).href);

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const saved = () => JSON.parse(localStorage.getItem(store.STORAGE_KEY) || "{}").arc || {};
const today = new Date().toISOString().split("T")[0];
function fresh() {
  localStorage.clear(); store.init();
  store.set("arc", { active: true, aimId: "sport-without-flaring", startedAt: "2026-10-01", strands: ["trunk-strength"] });
}

console.log("\nTEST 1 - markSessionWorked saves what it credits");
fresh();
let threw = null;
try { store.markSessionWorked({ sessionType: "core", exercises: [] }); } catch (e) { threw = e.message; }
ok("1a. it does not throw", threw === null, threw || "");
ok("1b. a session type is saved to the phone", saved().typesWorked?.core === today, JSON.stringify(saved().typesWorked));

fresh();
store.markSessionWorked({ sessionType: "", exercises: [{ affectsAreas: ["hamstring"] }] });
ok("1c. the areas a session worked are saved too", Object.values(saved().zonesWorked || {}).includes(today), JSON.stringify(saved().zonesWorked));

fresh();
store.markSessionWorked({ practice: true, exercises: [] });
ok("1d. a practice (mind strands) is saved", saved().typesWorked?.practice === today, JSON.stringify(saved().typesWorked));

console.log("\nTEST 2 - through the real door: a logged session, then the app closed");
fresh();
store.logActivity({ type: "workout", sessionType: "core", completedAt: new Date().toISOString(), durationMins: 20 });
const onPhone = saved();
localStorage.setItem("x", "1");   // nothing else writes the store after the session
store.init();                      // the app opened again: read from the phone
ok("2a. the core credit is on the phone after reopening", onPhone.typesWorked?.core === today && (store.get("arc").typesWorked || {}).core === today,
   JSON.stringify(onPhone.typesWorked));

console.log("\nTEST 3 - REVERSAL: nothing credited, nothing written");
fresh();
const before = localStorage.getItem(store.STORAGE_KEY);
store.markSessionWorked({ sessionType: "", exercises: [] });
ok("3a. an empty session leaves the saved arc as it was", localStorage.getItem(store.STORAGE_KEY) === before);
fresh();
store.set("arc", { active: true, strands: [] });   // no aim yet: nothing to credit
store.markSessionWorked({ sessionType: "core", exercises: [] });
ok("3b. with no aim, nothing is credited", !saved().typesWorked?.core);

console.log(`\nVERIFY-ARC-CREDIT: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
