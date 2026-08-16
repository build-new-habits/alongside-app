/**
 * tools/schema-check.mjs
 * 16 Aug 2026 v2
 *
 * v2 - The field diff had never run. See the note at the extraction
 *   below. Nine store fields were undocumented while this reported the
 *   version line alone.
 *
 * 12 Aug 2026 v1
 *
 * A3/A1. Diffs js/store.js getDefaults() against Documents/Live State/Schema.md
 * in BOTH directions, and checks the "confirmed live version" line matches the
 * store.js header.
 *
 * Exists because Schema.md drifted to eight versions behind live code and the
 * drift survived a commit titled "Schema.md brought current" — a human reading
 * a long document cannot reliably spot a missing field, and should not have to.
 *
 * Usage: node tools/schema-check.mjs
 * Exit 1 on any mismatch, so it can gate a commit.
 */
import fs from 'fs';

const storeSrc  = fs.readFileSync('js/store.js', 'utf8');
const schemaSrc = fs.readFileSync('Documents/Live State/Schema.md', 'utf8');

// 1. Version agreement
const storeVer  = (storeSrc.match(/^ \* \d{1,2} \w{3} \d{4} (v\d+)/m) || [])[1];
const claimed   = (schemaSrc.match(/confirmed live version:\s*\**(v\d+)/) || [])[1];
const issues = [];
if (storeVer !== claimed) {
  issues.push(`VERSION: store.js is ${storeVer}, Schema.md claims ${claimed}`);
}

// 2. Top-level keys in getDefaults()
//
// v2, 16 Aug 2026. THIS BLOCK HAD NEVER EXAMINED ANYTHING.
//
// It anchored on indexOf('getDefaults()'), which matches the FIRST
// mention of the name -- line 209, inside the header comment, not line
// 972 where the method is defined. It then looked for the closing
// '\n    };' from the start of that slice rather than from the return,
// so the end index came out BEFORE the start index and String.slice()
// returned ''. Zero keys were extracted, every key was therefore
// "documented", and UNDOCUMENTED could not fire however far Schema.md
// drifted. The whole check reduced to its version line.
//
// Found by probing the extraction rather than reading the verdict: the
// check was failing, for the right reason, while its second assertion
// was empty. A red check is no more trustworthy than a green one.
//
// Anchored on the definition, ended relative to the return, and the
// result is asserted -- an empty body now FAILS instead of passing.
const defStart = storeSrc.indexOf('\n  getDefaults() {');
const defBlock = defStart < 0 ? '' : storeSrc.slice(defStart);
const iReturn  = defBlock.indexOf('return {');
const iClose   = iReturn < 0 ? -1 : defBlock.indexOf('\n    };', iReturn);
const body     = (iReturn >= 0 && iClose > iReturn) ? defBlock.slice(iReturn, iClose) : '';
const keys = new Set();
for (const m of body.matchAll(/^      ([a-zA-Z][\w]*)\s*:/gm)) keys.add(m[1]);

const documented = new Set();
for (const m of schemaSrc.matchAll(/`([a-zA-Z][\w]*)(?:\.[\w]+)?`/g)) documented.add(m[1]);

// The extraction must be shown to have worked before its silence means
// anything. 101 top-level fields live in getDefaults() today; a run that
// finds a handful has found the wrong block, and "nothing undocumented"
// would be a lie rather than a pass.
if (keys.size < 50) {
  issues.push(`EXTRACTION: only ${keys.size} top-level fields found in getDefaults() — the anchor is wrong, so the field diff below proves nothing`);
}

const undocumented = [...keys].filter(k => !documented.has(k)).sort();
if (undocumented.length) {
  issues.push(`UNDOCUMENTED (${undocumented.length}): ${undocumented.join(', ')}`);
}

if (issues.length) {
  console.log('SCHEMA CHECK FAILED\n');
  issues.forEach(i => console.log('  ' + i + '\n'));
  process.exit(1);
}
console.log(`SCHEMA CHECK PASSED — store.js ${storeVer}, ${keys.size} top-level fields all documented.`);
