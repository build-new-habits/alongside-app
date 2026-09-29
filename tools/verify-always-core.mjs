/**
 * tools/verify-always-core.mjs
 * 29 Sep 2026 v2
 *
 * v2 - P2, SESSION-TYPE-ID. This gate stayed green while every real
 *   session was recorded as "glute-1791180600000": it fed a bare type
 *   through lastFinishedSession -- a shape the app never writes, down the
 *   path that was lending the previous session's type to the next entry.
 *   It now feeds what the app writes: a real built session in the player
 *   (generatedSession, as the coach's plan leaves it), logged as a
 *   workout, sessions on separate occasions in the past. Nothing
 *   loosened. The full loop through the real screens is
 *   verify-session-type-live.
 *
 * ALWAYS-CORE. The rotation has to actually rotate.
 *
 * Graeme, testing the 1-to-1 path: "The options are core, mobility and
 * stretch. It seems to always be core."
 *
 * 🔴 It always was. chooseSessionType() step 2 picks the first arc type
 * NOT in recentSessionTypes(), and recentSessionTypes() filters the
 * activity log on validType(e.sessionType) -- a field NO VIEW EVER
 * WROTE. So `recent` was permanently [], firstUnused() always returned
 * arcTypes[0], and a rotation that reads as a rotation was a
 * deterministic pick of the first element wearing the reason "arc-gap".
 *
 * 🔴 Schema.md already said "Written by store.logActivity()". The
 * documentation, the reader and the chooser all agreed. Nothing
 * executed. Same shape as CARD-6's grammar fix, which three documents
 * also called done.
 *
 * ⚫ SO THIS GATE DRIVES FOUR SESSIONS IN A ROW. Not "is sessionType in
 * the source" -- the source was always fine. The only proof that a
 * rotation rotates is running it.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: "https://example.org/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;

let pass = 0, fail = 0; const fails = [];
const ok = (m, c, d = "") => { if (c) { pass++; console.log("  ok   " + m); }
  else { fail++; fails.push(m); console.log("  FAIL " + m); if (d) console.log("       " + d); } };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { AIMS } = await import(B + "data/aims.js");
const { chooseSessionType, recentSessionTypes, arcSessionTypes } =
  await import(B + "data/session-choice.js");
const { buildSession } = await import(B + "session-builder.js");

const AIM = AIMS.list.find(a => a.id === "sport-without-flaring") || AIMS.list[0];
function reset() {
  localStorage.clear(); store.init();
  store.set("arc", { aimId: AIM.id, strands: AIM.strands });
}
// What the coach's plan leaves in the player: a real built session.
function playing(sessionType) {
  const session = buildSession({ sessionType, durationMins: 30 });
  store.set("generatedSession", { session, builtAt: new Date().toISOString() });
  return session;
}
function finish(sessionType, i) {
  playing(sessionType);
  store.logActivity({ type: "workout", completedAt: new Date(Date.now() - (10 - i) * 3600e3).toISOString() });
}

store.init();
console.log("\nALWAYS-CORE\n");

console.log("TEST 0 — FIXTURE REACH: the arc offers more than one type");
reset();
const types = arcSessionTypes();
console.log("       arc types: " + types.join(", "));
ok("0.1 the arc resolves to several session types", types.length >= 3,
   "with one type there is nothing to rotate and every assertion below is " +
   "vacuous");
ok("0.2 the first is the one Graeme kept getting", types[0] === "core",
   "not required, but if this changes the story below needs rereading");

console.log("\nTEST 1 — four sessions in a row are not the same session");
{
  reset();
  const seen = [];
  for (let i = 0; i < 4; i++) {
    const c = chooseSessionType();
    seen.push(c.sessionType);
    finish(c.sessionType, i);
  }
  console.log("       " + seen.join(" \u2192 "));

  ok("1.1 four consecutive choices are four different types",
     new Set(seen).size === 4,
     "got: " + seen.join(", ") + ". This is the whole bug: the rotation " +
     "returned arcTypes[0] every time");

  ok("1.2 REVERSAL: the first is still core, so the arc still leads",
     seen[0] === "core",
     "the fix must not have turned an arc-led choice into a shuffle");

  ok("1.3 and the reason given is the arc, not a fallback",
     chooseSessionType().reason.startsWith("arc"),
     "landing on 'least-recent' or 'default' would mean the arc stopped " +
     "leading, which is a different bug wearing this fix as a disguise");
}

console.log("\nTEST 2 — the field is actually written, by the single write path");
{
  reset();
  const s = playing("glute");
  store.logActivity({ type: "workout", completedAt: new Date().toISOString() });

  ok("2.0 the built session's id is not its type (the shape that hid the bug)", s.id !== "glute" && /^glute-\d+$/.test(s.id), s.id);
  ok("2.1 logActivity stamps sessionType onto the entry",
     (store.get("activityLog") || []).slice(-1)[0].sessionType === "glute",
     "Schema.md said this was written by logActivity() and it was not");

  ok("2.2 recentSessionTypes can now see it",
     recentSessionTypes().includes("glute"),
     "the reader was correct throughout; it had nothing to read");

  ok("2.3 an explicit sessionType on the entry wins", (() => {
    reset();
    playing("core");
    store.logActivity({ type: "workout", sessionType: "cardio", completedAt: new Date().toISOString() });
    return (store.get("activityLog") || []).slice(-1)[0].sessionType === "cardio";
  })(), "a caller that knows better than the store must not be overruled by it");

  ok("2.4 REVERSAL: with nothing to infer from, it is null, not a guess", (() => {
    reset();
    store.logActivity({ type: "workout", completedAt: new Date().toISOString() });
    return (store.get("activityLog") || []).slice(-1)[0].sessionType === null;
  })(), "Schema.md: not back-filled, and the chain must treat absence as its " +
        "normal early state rather than inventing a type");
}

console.log("");
if (fail) { console.log("ALWAYS-CORE: " + fail + " FAILED"); fails.forEach(f => console.log("  - " + f)); process.exit(1); }
console.log("ALWAYS-CORE: all " + pass + " assertions pass\n");
