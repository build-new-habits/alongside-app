/**
 * tools/verify-contract.mjs
 * 14 Aug 2026 v2
 *
 * v2 - CONTRACT-2 and CONTRACT-3, both found by the W3-A capability work.
 *   A declared writer must now exist AND be referenced from outside
 *   itself; declaring an orphaned file is what hid capability.* being
 *   unwritten for three days. And lookup tables keyed on a contracted
 *   vocabulary now have their keys checked, which the comparison scan
 *   structurally cannot see.
 *
 * 13 Aug 2026 v1
 *
 * FIELD CONTRACT — every comparison uses a value the field can hold,
 * and every declared value is actually produced by something.
 *
 * This is the only gate in the suite that guards a CLASS of fault
 * rather than an instance. Every significant defect found on 13 Aug was
 * a field's meaning drifting from its use: present-but-wrong,
 * over-interpreted, vocabulary mismatch, written-never-read,
 * read-never-written, overwritten-before-use. Thirty-seven gates caught
 * thirty-seven instances and none of them caught the shape.
 *
 * TWO DIRECTIONS, and the second matters as much as the first:
 *
 *   1. No code compares a contracted field against a value the field
 *      cannot hold. `fitnessLevel === "beginner"` is the example --
 *      plausible, wrong, and it fell through to a ceiling four levels
 *      too high without erroring anywhere.
 *
 *   2. Every declared value is produced by a real writer. A value that
 *      nothing writes is a branch nobody can reach, sitting in a table
 *      pretending to be reachable -- which is how `very-active: 8` was
 *      briefly misread as a dead ceiling on 13 Aug.
 *
 * SCOPE, deliberately narrow. Only fields with a FIXED set of permitted
 * values. Free text, numbers and timestamps are out — a contract that
 * tries to cover everything gets switched off.
 */
import fs from "node:fs";
import path from "node:path";

const { FIELD_CONTRACT } = await import("../js/data/field-contract.js");

const TYPEOF_WORDS = new Set(["object", "string", "number", "boolean", "function", "undefined", "symbol", "bigint"]);
const SESSION_CATEGORIES = new Set([
  "squat-pattern", "hip-hinge", "horizontal-pull", "horizontal-push",
  "core-stability", "loaded-carry", "balance-work", "power",
  "activation", "hip-mobility", "thoracic-mobility", "cardio-warmup",
  "hip-flexor-stretch", "chest-stretch", "hamstring-stretch", "spinal-decompression"
]);

let fails = 0;
const check = (name, fn) => {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (e) { fails++; console.log(`  FAIL  ${name}\n        ${e.message}`); }
};
const ok = (c, m) => { if (!c) throw new Error(m); };

const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "")
                    .replace(/^\s*\/\/[^\n]*$/gm, "");
const walk = d => fs.readdirSync(d, { withFileTypes: true })
  .flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);

const FILES = walk("js")
  .filter(f => f.endsWith(".js") && !f.endsWith("field-contract.js"));
const SRC = Object.fromEntries(FILES.map(f => [f, strip(fs.readFileSync(f, "utf8"))]));

console.log("\nCONTRACT — no comparison against a value the field cannot hold");

check("every literal compared to a contracted field is declared", () => {
  const bad = [];
  for (const [field, spec] of Object.entries(FIELD_CONTRACT)) {
    // The leaf name is what appears in code: capability.legPower is
    // read as store.get("capability.legPower") but compared as
    // `cap.legPower === "full"` or `c.legPower === 'no'`.
    const leaf = field.split(".").pop();
    const allowed = new Set(spec.values.filter(v => typeof v === "string"));
    // RETIRED values, added 18 Aug 2026. A value the field no longer
    // accepts but which may still sit in saved data. Migration code must
    // be able to recognise it, so comparisons are permitted -- but only
    // where the contract DECLARES it, so a retired value stays visible
    // rather than becoming an untracked special case. See "tier".
    const retired = new Set((spec.retired || []).filter(v => typeof v === "string"));
    // <thing>.leaf === "literal"  /  "literal" === <thing>.leaf
    const re = new RegExp(
      `\\b${leaf}\\s*[!=]==?\\s*["']([a-z0-9-]+)["']|["']([a-z0-9-]+)["']\\s*[!=]==?\\s*[\\w.]*\\b${leaf}\\b`, "g");
    for (const [file, src] of Object.entries(SRC)) {
      // THE WRITER IS EXEMPT for its own fields. That file is where UI
      // values become stored values, so it legitimately compares against
      // things the STORED field never holds -- capability.legPower is
      // offered as 'skip' in the interface and written as null. The
      // contract describes what is stored; the writer is the boundary.
      if (spec.writer && spec.writer.split(",").some(w => file.endsWith(w.trim().split(":")[0])))
        continue;
      for (const m of src.matchAll(re)) {
        const lit = m[1] ?? m[2];
        // typeof x === "object"/"string"/"number" is a type check, not a
        // value comparison, and shares the syntax.
        if (TYPEOF_WORDS.has(lit)) continue;
        // `category` also names the SESSION category local inside
        // _filterCandidates(). That collision is real and documented in
        // the contract -- it is what made the first C2 filter exclude
        // nothing. Session categories are exempted by name so the
        // collision stays visible rather than being papered over.
        if (leaf === "category" && SESSION_CATEGORIES.has(lit)) continue;
        if (retired.has(lit)) continue;
        if (!allowed.has(lit))
          bad.push(`${file}: ${leaf} compared to "${lit}" (allowed: ${[...allowed].join("|")})`);
      }
    }
  }
  ok(bad.length === 0,
     `${bad.length} comparison(s) against undeclared values:\n        ` +
     [...new Set(bad)].slice(0, 8).join("\n        "));
});

console.log("\nCONTRACT — no declared value is unreachable");

check("every declared value is produced somewhere", () => {
  // A value nothing writes is a branch nobody can reach. The cost is
  // not a crash — it is a table that looks complete and is not.
  const orphan = [];
  const all = Object.values(SRC).join("\n");
  for (const [field, spec] of Object.entries(FIELD_CONTRACT)) {
    for (const v of spec.values) {
      if (typeof v !== "string") continue;
      // Produced = appears as a quoted literal anywhere at all.
      // Escape the value: "65+" and "prefer-not" contain regex
      // metacharacters, and an unescaped "+" made a live band report as
      // unreachable on this gate's own first run.
      const esc = v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (!new RegExp(`["']${esc}["']`).test(all))
        orphan.push(`${field} declares "${v}", which appears nowhere in js/`);
    }
  }
  ok(orphan.length === 0,
     `${orphan.length} unreachable value(s):\n        ` + orphan.slice(0, 6).join("\n        "));
});

console.log("\nCONTRACT — a declared writer must be able to run");

check("every declared writer file exists and is reachable", () => {
  // CONTRACT-2, 14 Aug 2026, strengthened same day.
  //
  // First version required a writer file to exist and be "referenced from
  // outside itself". That was not enough: field-contract.js declared
  // views/onboarding/about.js as the writer of ageBand, and about.js was
  // referenced by name.js and body.js -- which were themselves orphaned
  // from the retired multi-screen onboarding. An orphaned CLUSTER passed.
  // The contract then described a vocabulary no live code produced, while
  // the real writer produced a different one and settings.js a third.
  //
  // Now traced transitively from the routes registered in router.js, plus
  // the sheets sheet-manager.js mounts. If a file cannot be reached from
  // an entry point the app can actually navigate to, it cannot be a
  // writer, however much code it contains.
  const routerSrc = fs.readFileSync("js/router.js", "utf8");
  const roots = new Set();
  for (const m of routerSrc.matchAll(/path:\s*'\.\/([^']+)'/g)) roots.add("js/" + m[1]);
  const sheetMgr = SRC["js/views/onboarding/sheet-manager.js"] || "";
  for (const m of sheetMgr.matchAll(/['"]onboarding\/([a-z-]+)['"]/g))
    roots.add(`js/views/onboarding/${m[1]}.js`);

  const seen = new Set();
  const stack = [...roots];
  while (stack.length) {
    const f = stack.pop();
    if (seen.has(f) || !SRC[f]) continue;
    seen.add(f);
    const dir = f.split("/").slice(0, -1).join("/");
    for (const m of SRC[f].matchAll(/(?:from|import\()\s*['"](\.[^'"]+)['"]/g)) {
      try { stack.push(new URL(m[1], "file:///" + dir + "/").pathname.slice(1)); } catch {}
    }
  }

  const bad = [];
  for (const [field, spec] of Object.entries(FIELD_CONTRACT)) {
    if (!spec.writer) continue;
    for (const w of spec.writer.split(",")) {
      const path = w.trim().split(":")[0].split(" ")[0];
      if (!path.endsWith(".js") || path.includes("*")) continue;
      const full = path.startsWith("js/") ? path : `js/${path}`;
      if (!fs.existsSync(full)) {
        bad.push(`${field}: declared writer ${path} DOES NOT EXIST`);
      } else if (!seen.has(full)) {
        bad.push(`${field}: declared writer ${path} exists but is NOT REACHABLE from any registered route`);
      }
    }
  }
  ok(bad.length === 0,
     `${bad.length} unreachable writer(s):\n        ` + [...new Set(bad)].join("\n        "));
});

console.log("\nCONTRACT — vocabulary used as keys, not just comparisons");

check("lookup tables keyed on a contracted field use declared values", () => {
  // CONTRACT-3, 14 Aug 2026. The comparison scan above reads `x === "y"`.
  // It cannot see a vocabulary used as an OBJECT KEY or a Set member, and
  // that is how 'returning' hid: ACTIVITY_CHIPS has written it since
  // 11 Aug, DIFFICULTY_CEILINGS and LOW_IMPACT_ONLY are both keyed on it,
  // three readers handle it -- and it was undeclared while this gate
  // stayed green.
  //
  // Scanned in the opposite direction to the check above: rather than
  // hunting every table, take the tables that are known to be keyed on a
  // contracted vocabulary and require their keys to be declared. A new
  // table wants adding here, which is deliberate -- the list is the
  // record of which lookups carry vocabulary.
  const KEYED = [
    ["lifestyle.activityLevel", "DIFFICULTY_CEILINGS"],
    ["lifestyle.activityLevel", "LOW_IMPACT_ONLY"],
  ];
  const bad = [];
  const all = Object.values(SRC).join("\n");
  for (const [field, table] of KEYED) {
    const spec = FIELD_CONTRACT[field];
    if (!spec) { bad.push(`${table} keyed on ${field}, which is not contracted`); continue; }
    const allowed = new Set(spec.values.filter(v => typeof v === "string"));
    // RETIRED values, added 18 Aug 2026. A value the field no longer
    // accepts but which may still sit in saved data. Migration code must
    // be able to recognise it, so comparisons are permitted -- but only
    // where the contract DECLARES it, so a retired value stays visible
    // rather than becoming an untracked special case. See "tier".
    const retired = new Set((spec.retired || []).filter(v => typeof v === "string"));
    const m = all.match(new RegExp(`${table}\\s*=\\s*(?:new Set\\()?[\\[{]([\\s\\S]*?)[\\]}]`));
    if (!m) { bad.push(`${table} not found — renamed? this check is now blind`); continue; }
    for (const km of m[1].matchAll(/["']([a-z0-9-]+)["']/g))
      if (!allowed.has(km[1]))
        bad.push(`${table} has key "${km[1]}", undeclared for ${field} (allowed: ${[...allowed].join("|")})`);
  }
  ok(bad.length === 0,
     `${bad.length} undeclared key(s):\n        ` + [...new Set(bad)].join("\n        "));
});

console.log("\nCONTRACT — the record stays honest");

check("every contracted field names its writer and its meaning", () => {
  const thin = Object.entries(FIELD_CONTRACT)
    .filter(([, s]) => !s.writer || !s.meaning || s.meaning.length < 40)
    .map(([f]) => f);
  ok(thin.length === 0,
     `these fields declare values but not what they MEAN: ${thin.join(", ")}. ` +
     "Three defects on 13 Aug came from reading a field as a broader statement " +
     "than it makes — the meaning is the part that prevents that, not the list");
});

check("capability meanings state what they do NOT say", () => {
  // The specific trap. chairRise, floorAccess and bothFeet were each
  // read as a wider limitation than the person gave. Their entries must
  // carry the boundary explicitly or the next person re-derives it.
  for (const f of ["capability.floorAccess", "capability.bothFeet", "capability.chairRise"]) {
    const m = FIELD_CONTRACT[f]?.meaning || "";
    ok(/\bNOT\b|nothing about|not a statement|must not/i.test(m),
       `${f} does not record what it does NOT say. That omission is what caused ` +
       `CAP-6b and CAP-7 — one answer read as a broader limitation than it makes`);
  }
});

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
