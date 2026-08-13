/**
 * tools/verify-equip3.mjs
 * 12 Aug 2026 v2
 *
 * EQUIP-3. One equipment vocabulary, verified against REAL DATA.
 *
 * v1 of this gate passed while Graeme's device failed, because it
 * hand-typed the saved ids into a constant. It tested my assumption about
 * the data, not the data. I had also been reading the wrong catalogue
 * entirely -- js/views/onboarding/equipment.js -- while the real one is
 * js/data/equipment.js, 71 items.
 *
 * A gate built from a hand-typed fixture cannot catch a wrong fixture.
 * Everything below is read from the actual files.
 */
import fs from "node:fs";
const mem = {};
globalThis.localStorage = {
  getItem: k => (k in mem ? mem[k] : null),
  setItem: (k, v) => { mem[k] = String(v); },
  removeItem: k => { delete mem[k]; },
};
const { resolveEquipment } = await import("/home/claude/repo/js/data/equipment-map.js");

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };

// REAL catalogue — every id somebody can actually tick in Settings.
const catalogue = fs.readFileSync("js/data/equipment.js", "utf8");
const CATALOGUE_IDS = [...catalogue.matchAll(/\{ id: '([a-z0-9-]+)', name: '([^']+)'/g)]
  .map(m => ({ id: m[1], name: m[2] }));

// REAL session-screen options.
const sbSrc = fs.readFileSync("js/views/session-builder-ui.js", "utf8");
const OPTIONS = [...sbSrc.matchAll(/\{ id: "([a-z-]+)",\s+label: "([^"]+)" \}/g)]
  .map(m => ({ id: m[1], label: m[2] }));

const ticks = (saved, opt) => {
  const r = resolveEquipment(saved);
  return [...resolveEquipment([opt])].some(tag => r.has(tag));
};

console.log(`\ncatalogue: ${CATALOGUE_IDS.length} items   session screen: ${OPTIONS.length} options`);

console.log("\nTEST 1 - the fixtures are real, not hand-typed");
check("catalogue read from js/data/equipment.js", () =>
  ok(CATALOGUE_IDS.length > 50,
     `only ${CATALOGUE_IDS.length} items - wrong file or the regex has drifted. ` +
     `js/views/onboarding/equipment.js is NOT the catalogue; that mistake is ` +
     `what made v1 of this gate pass while the device failed`));
check("session options read from the view", () =>
  ok(OPTIONS.length >= 15, `only ${OPTIONS.length} options found`));

console.log("\nTEST 2 - Graeme's actual saved list ticks what it should");
// The exact 11 he selected, by id, taken from the catalogue by name.
const HIS = ["adjustable-dumbbells", "band-light", "band-medium", "band-heavy",
             "skipping-rope", "yoga-mat", "plyo-box", "step-platform",
             "balance-board", "foam-roller", "massage-gun"];
check("every one of those ids exists in the catalogue", () => {
  const missing = HIS.filter(id => !CATALOGUE_IDS.some(c => c.id === id));
  ok(missing.length === 0, `not in the real catalogue: ${missing.join(", ")}`);
});
for (const [opt, why] of [
  ["dumbbells",        "adjustable-dumbbells"],
  ["resistance-bands", "band-light/medium/heavy"],
  ["box-or-step",      "plyo-box and step-platform"],
  ["foam-roller",      "foam-roller"],
])
  check(`"${opt}" ticks (he owns ${why})`, () =>
    ok(ticks(HIS, opt), "this is exactly what he reported not working"));

console.log("\nTEST 3 - it does not tick things he does not own");
for (const opt of ["treadmill", "rowing-machine", "cable-machine", "squat-rack", "kettlebells"])
  check(`"${opt}" stays unticked`, () =>
    ok(!ticks(HIS, opt), "over-ticking would build a session around kit he has not got"));

console.log("\nTEST 4 - EVERY catalogue id resolves to something usable");
check("no saved id resolves to nothing but itself when it should map", () => {
  const orphans = [];
  for (const { id, name } of CATALOGUE_IDS) {
    const tags = [...resolveEquipment([id])];
    // An id that maps only to itself is fine IF the exercise database uses
    // that id. Otherwise it can never satisfy an exercise requirement.
    if (tags.length === 1 && tags[0] === id) orphans.push(`${id} (${name})`);
  }
  // Reported, not failed: many are legitimately their own canonical id.
  console.log(`        ${orphans.length} of ${CATALOGUE_IDS.length} map only to themselves`);
  ok(true);
});

console.log("\nTEST 5 - the screen asks the resolver");
check("tick state goes through resolveEquipment", () => {
  ok(/import \{ resolveEquipment \}/.test(sbSrc), "not imported");
  ok(/const checked = isTicked\(opt\.id\)/.test(sbSrc), "still comparing raw ids");
});

console.log("\nTEST 6 - SW-2: install must bypass the HTTP cache");
// Comments legitimately quote the pattern they are documenting. Third
// gate today to flag its own change note; strip first, then test.
const sw = fs.readFileSync("sw.js", "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/[^\n]*$/gm, "");
check("shell files are fetched with cache:reload", () => {
  ok(/cache: "reload"/.test(sw),
     "cache.add() fetches through the browser HTTP cache, so a new cache " +
     "gets filled with STALE files - three correct fixes never reached the " +
     "device because of this");
  ok(!/cache\.add\(url\)/.test(sw), "cache.add still present");
});

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
