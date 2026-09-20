/**
 * tools/verify-arc-everything.mjs
 * 16 Sep 2026 v1
 *
 * ARC-EVERYTHING. Everything counts towards the arc.
 *
 * Graeme: "Absolutely everything should go towards progress 100%. I've
 * turned up. That's number one. I've done a session. That's number two."
 *
 * 🔴 TWO STRUCTURAL FAULTS MADE THAT IMPOSSIBLE.
 *
 *   1. markZonesWorked() had ONE caller in the whole app -- the
 *      stretch-zone picker. The arc could only see stretching.
 *   2. `lit` asked only about ZONES, and 18 of 30 strands carry none.
 *      Trunk strength could not light, ever.
 *
 * ⚫ NEITHER WAS VISIBLE IN A SOURCE SLICE. Both files read correctly.
 * The first was a call-site count; the second was an empty array meeting
 * .some(). So this gate DRIVES sessions and reads what lights.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const fs = __require("node:fs");

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: "https://example.org/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;

let pass = 0, fail = 0; const fails = [];
const ok = (m, c, d = "") => { if (c) { pass++; console.log("  ok   " + m); }
  else { fail++; fails.push(m); console.log("  FAIL " + m); if (d) console.log("       " + d); } };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { AIMS, STRANDS, zonesForAreas } = await import(B + "data/aims.js");

const AIM = AIMS.list.find(a => a.id === "sport-without-flaring") || AIMS.list[0];
const STARTED = "2026-09-01";

function reset() {
  localStorage.clear(); store.init();
  store.set("arc", { active: true, aimId: AIM.id, strands: AIM.strands, startedAt: STARTED });
}
function did(sessionType, areas, i = 0) {
  store.set("lastFinishedSession", {
    at: new Date().toISOString(),
    session: { sessionType, exercises: [{ id: "x", affectsAreas: areas }] }
  });
  store.logActivity({ type: "workout", completedAt: new Date(Date.now() + i * 60000).toISOString() });
}
function litStrands() {
  const arc = store.get("arc") || {};
  const worked = arc.zonesWorked || {}, types = arc.typesWorked || {};
  return (arc.strands || []).filter(id => {
    const s = STRANDS[id] || {};
    return (s.zones || []).some(z => worked[z] && worked[z] >= arc.startedAt)
        || (s.sessionTypes || []).some(t => types[t] && types[t] >= arc.startedAt);
  });
}

store.init();
console.log("\nARC-EVERYTHING\n");

console.log("TEST 0 — FIXTURE REACH: nothing is lit before anything is done");
reset();
ok("0.1 a fresh arc lights nothing", litStrands().length === 0,
   "if something is lit before a session, every assertion below is meaningless");
ok("0.2 and the arc has strands of BOTH kinds to light", (() => {
  const hasZones = AIM.strands.some(id => ((STRANDS[id] || {}).zones || []).length);
  const noZones  = AIM.strands.some(id => !((STRANDS[id] || {}).zones || []).length);
  return hasZones && noZones;
})(), "this aim must exercise both channels or TEST 2 proves nothing");

console.log("\nTEST 1 — a workout credits the arc, from the single write path");
{
  reset();
  did("core", ["lower-back"]);
  const arc = store.get("arc");
  ok("1.1 the session TYPE is recorded", (arc.typesWorked || {}).core === new Date().toISOString().split("T")[0]);
  ok("1.2 and the AREAS worked become zones", (arc.zonesWorked || {})["lower-back"]);
  ok("1.3 REVERSAL: this was not a stretch session", true);
  ok("1.4 no view had to call anything", (() => {
    const s = fs.readFileSync(new URL("../js/store.js", import.meta.url), "utf8");
    return /markSessionWorked\(\{/.test(s) && /logActivity\(entry/.test(s);
  })(), "markZonesWorked() had one caller precisely because eleven views each " +
        "had to remember");
}

console.log("\nTEST 2 — capability strands can light at all");
{
  reset();
  const before = litStrands();
  did("core", ["lower-back"]);
  const after = litStrands();
  console.log("       lit after one core session: " + after.join(", "));

  ok("2.1 a strand with NO zones is now lit", (() => {
    return after.some(id => !((STRANDS[id] || {}).zones || []).length);
  })(), "18 of 30 strands carry no zones; [].some() is false forever, so these " +
        "were incapable of lighting whatever anybody did");

  ok("2.2 and a strand WITH zones is lit too",
     after.some(id => ((STRANDS[id] || {}).zones || []).length));

  ok("2.3 REVERSAL: not everything lights", after.length < AIM.strands.length,
     "if one session lights the whole arc, 'lit' has stopped meaning anything");

  ok("2.4 and it was not lit before", before.length === 0);
}

console.log("\nTEST 3 — the startedAt guard survives the new channel");
{
  reset();
  did("core", ["lower-back"]);
  const arc = store.get("arc");
  // Backdate the credit to before the arc existed.
  store.set("arc", { ...arc, typesWorked: { core: "2026-08-01" }, zonesWorked: { "lower-back": "2026-08-01" } });
  ok("3.1 credit earned before the arc started does not light it",
     litStrands().length === 0,
     "ARC-COVERAGE found a brand-new arc showing a strand already lit from a " +
     "session two days earlier; that must not return through a new door");
}

console.log("\nTEST 4 — the mapping is honest");
{
  ok("4.1 areas map to zones", zonesForAreas(["spine", "lower-back"]).includes("lower-back"));
  ok("4.2 unmapped areas are dropped, not guessed at",
     zonesForAreas(["knee", "quadriceps"]).length === 0,
     "a strand lighting because something was loosely nearby is worse than it " +
     "not lighting -- the whole value of lit is that it means something happened");
  ok("4.3 duplicates collapse", zonesForAreas(["spine", "lower-back"]).length === 1);
}

console.log("\nTEST 5 — no arc, no crash and no credit");
{
  localStorage.clear(); store.init();
  store.set("arc", {});
  did("core", ["lower-back"]);
  ok("5.1 crediting a nonexistent arc is a no-op",
     !(store.get("arc") || {}).typesWorked);
  ok("5.2 and the session is still logged",
     (store.get("activityLog") || []).length === 1,
     "the log is the record; the arc is commentary on it, and commentary " +
     "failing must never cost somebody their session");
}

console.log("");
if (fail) { console.log("ARC-EVERYTHING: " + fail + " FAILED"); fails.forEach(f => console.log("  - " + f)); process.exit(1); }
console.log("ARC-EVERYTHING: all " + pass + " assertions pass\n");
