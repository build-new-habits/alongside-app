/**
 * tools/schema-check.mjs
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
const defBlock = storeSrc.slice(storeSrc.indexOf('getDefaults()'));
const body = defBlock.slice(defBlock.indexOf('return {'), defBlock.indexOf('\n    };'));
const keys = new Set();
for (const m of body.matchAll(/^      ([a-zA-Z][\w]*)\s*:/gm)) keys.add(m[1]);

const documented = new Set();
for (const m of schemaSrc.matchAll(/`([a-zA-Z][\w]*)(?:\.[\w]+)?`/g)) documented.add(m[1]);

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
