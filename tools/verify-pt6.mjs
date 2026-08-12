/**
 * tools/verify-pt6.mjs
 * 12 Aug 2026 v1
 *
 * PT-6 / PT-3 gate: one write path into activityLog, one set of field
 * names.
 *
 * store.logActivity() exists because coach-reflection, workout and
 * yoga-session once wrote directly and produced a duplicate/phantom-write
 * bug (session B3-3). It now also carries the empty-partial guard and the
 * exerciseHistory write. Every view that bypasses it loses all three,
 * silently.
 *
 * The field names matter as much as the path. progress.js sums
 * durationMins; a view writing `duration` has its sessions counted as
 * zero minutes, which is PT-3. morning-session.js justified writing
 * `duration` as "consistent within this file" -- but nothing reads a
 * file, and consistent-within-the-file was the wrong unit of consistency.
 *
 * morning-session.js also had a LOCAL function called logActivity(),
 * which shadowed the store method and made the file read as compliant to
 * any grep for the name. The name was doing the hiding.
 */
import fs from "node:fs";

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };

const views = fs.readdirSync("js/views").filter(f => f.endsWith(".js"));
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/[^\n]*$/gm, "");

console.log("\nTEST 1 - one write path");
check("no view writes activityLog directly", () => {
  const offenders = [];
  for (const f of views) {
    const s = strip(fs.readFileSync(`js/views/${f}`, "utf8"));
    // reflect.js UPDATES an existing entry in place, which is not a
    // creation and legitimately does not go through logActivity().
    if (f === "reflect.js") continue;
    if (/store\.set\(["']activityLog["']/.test(s)) offenders.push(f);
  }
  ok(offenders.length === 0,
     `bypass store.logActivity() and lose its dedupe, empty-partial and ` +
     `exerciseHistory handling: ${offenders.join(", ")}`);
});
check("reflect.js only ever updates, never appends", () => {
  const s = strip(fs.readFileSync("js/views/reflect.js", "utf8"));
  ok(!/log\.push\(/.test(s), "appending directly would bypass every guard");
});

console.log("\nTEST 2 - no local function shadows store.logActivity()");
for (const f of views)
  check(`${f} does not shadow it`, () => {
    const s = strip(fs.readFileSync(`js/views/${f}`, "utf8"));
    ok(!/function logActivity\s*\(/.test(s),
       "a local logActivity() makes this file read as compliant to any grep " +
       "for the name - which is exactly how morning-session.js hid for months");
  });

console.log("\nTEST 3 - field names progress.js can actually read");
check("no activity entry writes `duration` instead of `durationMins`", () => {
  const offenders = [];
  for (const f of views) {
    const s = strip(fs.readFileSync(`js/views/${f}`, "utf8"));
    for (const m of s.matchAll(/store\.logActivity\(\{[\s\S]{0,900}?\n\s*\}\)/g))
      if (/\n\s*duration:\s/.test(m[0])) offenders.push(f);
    // Entries built as a variable then passed in.
    for (const m of s.matchAll(/const entry = \{[\s\S]{0,900}?\n\s*\};/g))
      if (/\n\s*duration:\s/.test(m[0]) && /store\.logActivity\(entry\)/.test(s)) offenders.push(f);
  }
  ok(offenders.length === 0,
     `progress.js sums durationMins - these count as zero minutes: ${[...new Set(offenders)].join(", ")}`);
});
check("progress.js still sums durationMins (the field this gate protects)", () => {
  const s = fs.readFileSync("js/views/progress.js", "utf8");
  ok(/durationMins/.test(s), "if this changed, the whole gate needs revisiting");
});

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
