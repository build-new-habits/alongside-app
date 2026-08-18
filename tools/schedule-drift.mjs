/**
 * tools/schedule-drift.mjs
 * 18 Aug 2026 v2
 *
 * v2 - Header/footer version agreement on master_schedule.md. v141
 *   recorded the drift and wrote a rule against it; the rule was then
 *   broken twice by sessions that could read it. Enforced rather than
 *   restated.
 *
 * 12 Aug 2026 v1
 *
 * SCHEDULE-DRIFT GATE.
 *
 * Three entries went stale in one day and each cost Graeme time:
 *   DATA-1  "contentType is read by nothing"     -> read in 2 live places
 *   PT-7    "session-builder-ui uses disabled"   -> already on lockedFeature()
 *   PT-1    "territory branch never matches"     -> fixed 11 Aug
 *
 * Every one was TRUE WHEN WRITTEN and invalidated by later work. And every
 * one was the same shape: a claim that something is dead, missing or
 * unbuilt. That shape is mechanically checkable, so it gets checked.
 *
 * Graeme's diagnosis, 12 Aug, and it is the right one: "I don't hear you
 * talking about updating or reading the master schedule any more. Perhaps
 * that's where mistakes came from." Writing to the schedule is not the
 * ritual. Reading it back is.
 *
 * This does not check prose. It checks named code symbols the schedule
 * asserts are dead, and reports any that are demonstrably alive.
 */
import fs from "node:fs";

// ── HEADER / FOOTER AGREEMENT, added 18 Aug 2026 ─────────────────────
//
// v141 recorded this fault and wrote the rule: header and footer must be
// updated together at every session close. The rule has since been
// broken TWICE by sessions that could read it -- on 18 Aug the file
// opened with header v199 and footer v197.
//
// A rule in a document does not enforce itself. This does.
//
// Runs FIRST and exits on failure. The first placement of this block
// landed inside a conditional failure branch, so it would only ever
// have run on days something else was already wrong -- a check that
// cannot fire is worse than no check, because it looks like coverage.
{
  const ms = fs.readFileSync(
    new URL('../Documents/Admin/master_schedule.md', import.meta.url), 'utf8');
  const headerV = ms.match(/^##\s+\d{1,2} \w{3} \d{4} (v\d+)/m);
  const lines   = ms.trimEnd().split('\n');
  const footerV = lines[lines.length - 1].match(/(v\d+)\*?\s*$/);
  const ok = !!headerV && !!footerV && headerV[1] === footerV[1];

  console.log(`  ${ok ? 'PASS' : 'FAIL'}  master schedule header and footer state the same version` +
    (ok ? ` (${headerV[1]})`
        : ` -- header ${headerV ? headerV[1] : 'unreadable'}, footer ${footerV ? footerV[1] : 'unreadable'}`));

  if (!ok) {
    console.log('\n  Both must be updated together at session close. See master schedule v141.\n');
    process.exit(1);
  }
}

import path from "node:path";

const SCHEDULE = "Documents/Admin/master_schedule.md";
const md = fs.readFileSync(SCHEDULE, "utf8");

// Live code, comments stripped: a symbol named only in a comment that
// DISCUSSES it being dead is not a live use.
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? walk(path.join(d, e.name))
                  : (e.name.endsWith(".js") ? [path.join(d, e.name)] : []));
const code = walk("js")
  .map(f => fs.readFileSync(f, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/[^\n]*$/gm, ""))
  .join("\n");

// Claims of the form: `symbol` ... <dead-phrase>, within one sentence.
const DEAD = /(read by nothing|never read|zero callers|no callers|written on .{0,30}read by nothing|never written|has no live writer|dead code|not built|never built|is dead)/i;

// Only OPEN claims. A resolved entry that describes what USED to be dead
// is a reasoning trail, not an instruction, and flagging those would bury
// the live ones -- a report of 38 items is a report nobody reads.
// A row that CORRECTS a stale claim necessarily quotes the claim it is
// correcting. Those are the most valuable rows in the document and the
// gate must not keep flagging them -- a gate that reports its own
// corrections is one people stop reading.
const RESOLVED = /🟢|RESOLVED|SUPERSEDED|CLOSED|WILL-NOT-DO|WAS ALREADY FIXED|SHIPPED|Fixed|fixed on|STALE|Already corrected|CORRECTED|Original entry|Original finding/;
const OPEN     = /🟠|🔴|Not booked|not booked|Open\.|⬜/;

const claims = [];
for (const line of md.split("\n")) {
  if (!DEAD.test(line)) continue;
  if (RESOLVED.test(line)) continue;
  if (!OPEN.test(line)) continue;
  // Only the symbol the claim is ABOUT: the last one named BEFORE the
  // dead phrase. Taking every backtick on the line caught `category` and
  // `energy` from surrounding prose.
  const upTo = line.slice(0, line.search(DEAD));
  const syms = [...upTo.matchAll(/`([A-Za-z_][A-Za-z0-9_.]{3,40})`/g)];
  if (!syms.length) continue;
  const raw = syms[syms.length - 1][1];
  if (/\.(js|md|css|json)$/.test(raw)) continue;
  const sym = raw.replace(/\(\)$/, "").split(".").pop();
  if (sym.length < 4) continue;
  claims.push({ sym, line: line.trim().slice(0, 130) });
}

const seen = new Set();
const suspect = [];
for (const c of claims) {
  if (seen.has(c.sym)) continue;
  seen.add(c.sym);
  const uses = (code.match(new RegExp(`\\b${c.sym}\\b`, "g")) || []).length;
  if (uses > 0) suspect.push({ ...c, uses });
}

console.log(`\nchecked ${seen.size} "dead" claims in ${path.basename(SCHEDULE)}\n`);
if (suspect.length === 0) {
  console.log("  PASS  no schedule entry claims a live symbol is dead\n");
  console.log("ALL PASS\n");
  process.exit(0);
}

console.log(`  ${suspect.length} claim(s) name a symbol that IS present in live code.`);
console.log("  Not automatically wrong -- but each must be re-read before being acted on.\n");
for (const s of suspect)
  console.log(`  ${s.sym}  (${s.uses} live use${s.uses === 1 ? "" : "s"})\n      ${s.line}\n`);
console.log("REVIEW REQUIRED\n");
process.exit(1);
