/**
 * tools/verify-checkin2.mjs
 * 29 Aug 2026 v1
 *
 * Gate for CHECKIN-2a.
 *
 * The failure this guards against is silent by nature. A sore area that
 * cannot be reported produces no error, no warning and no visible
 * difference -- just a card with no caution on it, which looks exactly
 * like a card that correctly has nothing to say. Nobody would notice for
 * months. That is why the assertions below are mostly about the CHAIN
 * holding rather than about any one function behaving.
 *
 * NO NEGATIVE DISTANCE WINDOWS.
 *
 * Assertions 1, 4, 6 and 8 were reversal-tested at the time of writing.
 */
import fs from "node:fs";

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const store   = strip(fs.readFileSync("js/store.js", "utf8"));
const conds   = strip(fs.readFileSync("js/data/conditions.js", "utf8"));
const checkin = strip(fs.readFileSync("js/views/checkin.js", "utf8"));
const rationale = strip(fs.readFileSync("js/data/session-rationale.js", "utf8"));

const { soreAreaOptions, CONDITIONS } = await import("../js/data/conditions.js");

console.log("\nTEST 1 - the picker vocabulary is real");

check("every option resolves to a catalogue entry", () => {
  const ids = new Set(CONDITIONS.map(c => c.id));
  for (const o of soreAreaOptions([]))
    ok(ids.has(o.id), `${o.id} is not in CONDITIONS - its slider would never fire a caution`);
});

check("systemic conditions are excluded, pelvic-floor excepted", () => {
  const opts = soreAreaOptions([]).map(o => o.id);
  ok(!opts.includes("fibromyalgia"), "fibromyalgia offered as a today-sore area");
  ok(!opts.includes("menopause"), "menopause offered as a today-sore area");
  ok(!opts.includes("other"), "`other` offered - it resolves to no real body area");
  ok(opts.includes("pelvic-floor"), "pelvic-floor missing; it is the explicit exception");
});

check("shoulder is offerable - the case that started this", () => {
  ok(soreAreaOptions([]).some(o => o.id === "shoulder"),
     "shoulder cannot be added, which is the exact gap CHECKIN-2a exists to close");
});

check("already-active areas are not offered twice", () => {
  const all = soreAreaOptions([]).length;
  ok(soreAreaOptions(["shoulder", "hip"]).length === all - 2, "taken areas still offered");
});

console.log("\nTEST 2 - the store chain");

check("addSoreArea exists and writes both fields", () => {
  const i = store.indexOf("addSoreArea(id)");
  ok(i > -1, "addSoreArea missing");
  const body = store.slice(i, store.indexOf("\n  },", i));
  ok(body.includes("this.data.conditions"), "does not add to conditions - bodyCaution reads that field");
  ok(body.includes("conditionMeta"), "does not record lifecycle metadata");
  ok(body.includes("this.save()"), "does not persist");
});

check("conditions is NOT reshaped - 25 readers depend on ids", () => {
  const d = store.slice(store.indexOf("conditions: []"), store.indexOf("conditions: []") + 200);
  ok(d.includes("conditions: []"), "default changed shape");
  ok(!/conditions:\s*\[\s*\{/.test(store), "conditions default holds objects; every id reader breaks");
});

check("the migration never invents addedAt", () => {
  const i = store.indexOf("_migrateConditionMeta(meta, conditions) {");
  ok(i > -1, "_migrateConditionMeta missing");
  const body = store.slice(i, store.indexOf("\n  },", i));
  ok(/addedAt:\s*\(m && m\.addedAt\)\s*\?\?\s*null/.test(body),
     "addedAt is defaulted to something other than null - a long-standing condition would look brand new and become eligible for the CHECKIN-2b ask");
});

check("dormant records survive leaving conditions", () => {
  const i = store.indexOf("_migrateConditionMeta(meta, conditions) {");
  const body = store.slice(i, store.indexOf("\n  },", i));
  ok(body.includes("dormant"), "dormancy not handled; history would be lost on retirement");
});

console.log("\nTEST 3 - the check-in surface");

check("the picker is offered on the conditions sheet", () => {
  ok(checkin.includes("soreAreaOptions("), "checkin.js does not offer the picker");
  ok(checkin.includes("store.addSoreArea("), "picker does not write anything");
});

check("no free-text entry anywhere in the flow", () => {
  const block = checkin.slice(checkin.indexOf("ci-add-area"), checkin.indexOf("ci-cond-confirm"));
  ok(!/<input[^>]*type=["']text["']/.test(block), "free text input - an unmatched id saves and silently never fires a caution");
  ok(!/contenteditable/.test(block), "contenteditable in the add-area block");
});

check("the control is a real disclosure", () => {
  const block = checkin.slice(checkin.indexOf("ci-add-area"), checkin.indexOf("ci-cond-confirm"));
  ok(block.includes("aria-expanded"), "no aria-expanded");
  ok(block.includes("aria-controls"), "no aria-controls");
});

console.log("\nTEST 4 - the caution still reads the field");

check("soreAreaLoaded reads conditions and pain scores", () => {
  const i = rationale.indexOf("export function soreAreaLoaded");
  ok(i > -1, "soreAreaLoaded missing");
  const body = rationale.slice(i, rationale.indexOf("\n}", i));
  ok(body.includes('store.get("conditions")'), "no longer reads conditions - added areas would never reach a caution");
  ok(body.includes('conditionPainScores'), "no longer reads pain scores");
});

console.log(fails ? `\n${fails} FAILED\n` : "\nALL PASS\n");
process.exit(fails ? 1 : 0);
