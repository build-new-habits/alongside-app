/**
 * tools/verify-save-all.mjs
 * 16 Sep 2026 v1
 *
 * SAVE-ALL. The offer is governed by a capability, not by a list.
 *
 * ── THE FAILURE THIS FILE IS SHAPED TO PREVENT ───────────────────────
 *
 * saveSession() was offered in yoga-session.js and nowhere else. The
 * obvious fix was to add the same block to the other session views, and
 * it is the wrong fix: GATE-ALL is one day old, and it exists because
 * CARD-5 wired five views by hand, pinned the five as complete, and
 * stretching went uncovered until Graeme walked into it.
 *
 * So the offer lives on reflect.js — the one screen every session ends
 * on — and appears when the session is savable. A walk gets nothing, not
 * because a list excludes walks but because a walk has no exercise ids.
 *
 * 🔴 THEREFORE THIS FILE ASSERTS THE RULE, NOT A COUNT. A test that
 * pinned "the save block is in N views" would be the same instrument
 * that laundered the five-view oversight into a decision. What is pinned
 * instead is: savable offers, unsavable does not, and prescribed never
 * does.
 *
 * Every assertion is reversal-proven, and TEST 0 proves the harness
 * reaches a real offer before anything below reads its absence as a
 * decision.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const fs = __require("node:fs");

const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>',
  { url: "https://example.org/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;

let pass = 0, fail = 0; const fails = [];
const ok = (m, c, d = "") => { if (c) { pass++; console.log("  ok   " + m); }
  else { fail++; fails.push(m); console.log("  FAIL " + m); if (d) console.log("       " + d); } };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { renderSaveBlock, attachSaveBlock, savableSession, suggestedName } =
  await import(B + "save-block.js");
const { savedSessions } = await import(B + "data/saved-sessions.js");

const today = () => new Date().toISOString();
const withSession = (session, entryType = "workout") => {
  store.set("generatedSession", { session, builtAt: today(), inputs: {} });
  store.set("currentActivityEntry", { type: entryType });
};
const REAL = {
  title: "Core", durationMins: 40,
  exercises: [{ id: "plank" }, { id: "dead-bug" }, { id: "bird-dog" }]
};

store.init();
store.set("tier", "personal");

console.log("\nSAVE-ALL\n");

// ════════════════════════════════════════════════════════════════════
console.log("TEST 0 — FIXTURE REACH: a real offer renders at all");

withSession(REAL);
const offered = renderSaveBlock();
ok("0.1 a savable session produces an offer", offered.includes("data-save-block"),
   "everything below reads an ABSENT block as a decision; if nothing ever " +
   "renders, those assertions pass while proving nothing");
ok("0.2 with a name field and a button",
   offered.includes("save-block-name") && offered.includes("save-block-btn"));
ok("0.3 REVERSAL: the probe can tell an offer from silence",
   renderSaveBlock().includes("data-save-block") !== ("".includes("data-save-block")));

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 1 — the capability decides, not a view list");

ok("1.1 no exercises at all: no offer", (() => {
  withSession({ title: "Walk", durationMins: 25, exercises: [] });
  return renderSaveBlock() === "" && savableSession() === null;
})(), "a walk lands on reflect like everything else and must get nothing");

ok("1.2 exercises with no ids: no offer", (() => {
  withSession({ title: "Odd", exercises: [{ name: "thing" }, {}] });
  return renderSaveBlock() === "";
})(), "saveSession() needs ids; offering a button that always fails is worse " +
      "than offering nothing");

ok("1.3 no session at all: no offer", (() => {
  store.set("generatedSession", null);
  return renderSaveBlock() === "";
})());

ok("1.4 yesterday's session is not offered under today's name", (() => {
  const y = new Date(Date.now() - 86400000).toISOString();
  store.set("generatedSession", { session: REAL, builtAt: y, inputs: {} });
  store.set("currentActivityEntry", { type: "workout" });
  return renderSaveBlock() === "";
})(), "generatedSession outlives the session it was built for -- the same " +
      "trap reflect.js guards coachAdjusted against");

ok("1.5 REVERSAL: today's identical session IS offered", (() => {
  withSession(REAL);
  return renderSaveBlock().includes("data-save-block");
})());

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 2 — prescribed work is excluded on content grounds");

// This is the one exclusion the capability test would NOT make: a
// prescribed session carries real exercise ids and would otherwise be
// offered. Copying a physiotherapist's prescription into a session the
// person owns, and can then edit, launders a clinical instruction into a
// personal preset.
ok("2.1 a prescribed activity entry suppresses the offer", (() => {
  withSession(REAL, "prescribed-session");
  return renderSaveBlock() === "";
})());

ok("2.2 and a session flagged prescribed on itself does too", (() => {
  withSession({ ...REAL, isPrescribed: true }, "workout");
  return renderSaveBlock() === "";
})());

ok("2.3 REVERSAL: the same session without the flag IS offered", (() => {
  withSession(REAL, "workout");
  return renderSaveBlock().includes("data-save-block");
})(), "if this fails the exclusion is swallowing everything, not just " +
      "prescribed work");

ok("2.4 the reason is written down where it will be read",
   fs.readFileSync(new URL("../js/save-block.js", import.meta.url), "utf8")
     .includes("launders a clinical prescription"),
   "an unexplained exclusion is one a later session deletes as a bug");

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 3 — free accounts get nothing, not a locked control");

ok("3.1 free: no block at all", (() => {
  store.set("tier", "free");
  withSession(REAL);
  const h = renderSaveBlock();
  return h === "" && !h.includes("disabled") && !h.includes("Plan");
})(), "savedSessions() returns [] for free by design, so a teaser is a door " +
      "with no room behind it");

ok("3.2 REVERSAL: the Plan tier does get it", (() => {
  store.set("tier", "personal");
  withSession(REAL);
  return renderSaveBlock().includes("data-save-block");
})());

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 4 — it saves, and it says so");

{
  store.set("tier", "personal");
  store.set("savedSessions", []);
  withSession(REAL);

  document.getElementById("app").innerHTML = renderSaveBlock();
  attachSaveBlock(document);
  document.getElementById("save-block-btn").click();

  const list = savedSessions();
  ok("4.1 one record is stored, with the exercise ids", (() => {
    return list.length === 1 && list[0].exerciseIds.length === 3 &&
           list[0].exerciseIds.includes("plank");
  })());

  ok("4.2 the person is told, in words", (() => {
    const s = document.getElementById("save-block-status").textContent || "";
    return /saved/i.test(s);
  })(), "silence on a save is how somebody ends up believing they have a " +
        "session they do not have");

  ok("4.3 a second tap does not save it twice", (() => {
    document.getElementById("save-block-btn").click();
    return savedSessions().length === 1;
  })());

  ok("4.4 an empty name is refused and SAYS why", (() => {
    store.set("savedSessions", []);
    withSession(REAL);
    document.getElementById("app").innerHTML = renderSaveBlock();
    attachSaveBlock(document);
    document.getElementById("save-block-name").value = "   ";
    document.getElementById("save-block-btn").click();
    const s = document.getElementById("save-block-status").textContent || "";
    return savedSessions().length === 0 && s.length > 0 && /name/i.test(s);
  })());

  ok("4.5 the suggested name needs no typing to be usable",
     suggestedName(REAL).length > 0 && suggestedName(REAL).length <= 60);
}

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 5 — one implementation, and the shared screen carries it");

{
  const reflect = fs.readFileSync(new URL("../js/views/reflect.js", import.meta.url), "utf8");
  ok("5.1 reflect.js renders and attaches the shared block",
     reflect.includes("renderSaveBlock()") && reflect.includes("attachSaveBlock("));

  // Not "N views have a save block". The point of SAVE-ALL is that no
  // view has its own; a second copy is the beginning of the drift this
  // design exists to avoid.
  const dir = new URL("../js/views/", import.meta.url);
  // js/views/ contains subdirectories (onboarding/), so filter to files.
  const copies = fs.readdirSync(dir).filter(f => {
    if (!f.endsWith(".js")) return false;
    if (f === "reflect.js" || f === "session-builder-ui.js" || f === "saved-sessions.js") return false;
    const t = fs.readFileSync(new URL(f, dir), "utf8");
    return /saveSession\s*\(/.test(t);
  });
  // 🟡 ONE KNOWN EXCEPTION, NAMED RATHER THAN TOLERATED SILENTLY.
  //
  // yoga-session.js builds its save from sessionQueue. The shared block
  // reads generatedSession, which yoga never writes -- so deleting
  // yoga's copy would silently remove saving from the only view that
  // had it. It stays until SAVE-HANDOFF gives every view one way to
  // hand its session to reflect.js.
  //
  // Pinned as a NAMED exception, not a count: if a THIRD implementation
  // appears, this goes red. That is the difference between recording a
  // decision and laundering an oversight into one.
  const EXPECTED = ["yoga-session.js"];
  const unexpected = copies.filter(f => !EXPECTED.includes(f));
  if (copies.length) console.log("      views with their own save call: " + copies.join(", "));
  ok("5.2 only the one known private save implementation remains",
     unexpected.length === 0,
     "a new private copy: " + unexpected.join(", ") + ". A second copy drifts " +
     "from the first, and then a third is added to match whichever one " +
     "somebody read");
  ok("5.2b REVERSAL: the exception is still real, so it cannot be quietly dropped",
     copies.includes("yoga-session.js"),
     "yoga's copy is gone -- if SAVE-HANDOFF landed, remove it from EXPECTED " +
     "here rather than leaving a stale allowance behind");

  const sw = fs.readFileSync(new URL("../sw.js", import.meta.url), "utf8");
  ok("5.3 js/save-block.js is precached", sw.includes("js/save-block.js"),
     "a new module that fails to load offline takes reflect.js down with it");
}

console.log("");
if (fail) { console.log("SAVE-ALL: " + fail + " FAILED"); fails.forEach(f => console.log("  - " + f)); process.exit(1); }
console.log("SAVE-ALL: all " + pass + " assertions pass\n");
