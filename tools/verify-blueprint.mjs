/**
 * tools/verify-blueprint.mjs
 * 22 Aug 2026 v1
 *
 * BLUEPRINT-1 — the cold start blueprint may not lie about live state.
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────
 *
 * The blueprint's live-state table went stale THREE TIMES on 22 Aug
 * alone. That is not carelessness: a hand-maintained table cannot track
 * a repo with several sessions pushing to it, and it will always be
 * updated last if at all.
 *
 * It matters more than an ordinary stale document because of what the
 * blueprint IS. It is the first thing a memoryless session reads, and it
 * instructs that session to STOP AND RECONCILE if the versions do not
 * match. So a stale table does not merely misinform — it halts work over
 * a document rather than a fault, and the session spends its time
 * hunting a discrepancy that exists only on paper.
 *
 * Three times it was fixed by hand. This is the fourth approach: make
 * drifting impossible instead.
 *
 * ── WHAT IT CHECKS ──────────────────────────────────────────────────
 *
 * Every version the blueprint states is compared against the file that
 * actually carries it. If they disagree, this goes red and says exactly
 * which line to change.
 *
 * ⚠️ IT ASSERTS AGREEMENT, NOT CORRECTNESS. It cannot tell whether the
 * blueprint's PROSE is still true — only that its numbers are. The prose
 * still has to be read by a person.
 *
 * Run: node tools/verify-blueprint.mjs
 */

import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..");

const read = p => fs.readFileSync(path.join(REPO, p), "utf8");

let failures = 0, checks = 0;
const ok = (label, cond, detail = "") => {
  checks++;
  if (cond) console.log(`  PASS  ${label}`);
  else { failures++; console.log(`  FAIL  ${label}${detail ? "\n        " + detail : ""}`); }
};

const BLUEPRINT = "Documents/Admin/alongside_cold_start_blueprint_20aug2026_v1.md";
const bp = read(BLUEPRINT);

console.log("\nThe blueprint's live-state table vs the files themselves\n");

// ── store.js ────────────────────────────────────────────────────────
{
  const actual = read("js/store.js").match(/^ \* \d{1,2} \w{3} \d{4} (v\d+)$/m)?.[1];
  const claimed = bp.match(/\|\s*`store\.js`\s*\|\s*\*{0,2}(v\d+)\*{0,2}\s*\|/)?.[1];
  ok(`store.js — blueprint says ${claimed}, file says ${actual}`, claimed === actual,
     claimed !== actual ? `Update the store.js row in ${BLUEPRINT}` : "");
}

// ── Schema.md ───────────────────────────────────────────────────────
{
  const actual = read("Documents/Live State/Schema.md").match(/^## \d{1,2} \w{3} \d{4} (v[\d.]+)$/m)?.[1];
  const claimed = bp.match(/\|\s*`Schema\.md`\s*\|\s*\*{0,2}(v[\d.]+)\*{0,2}\s*\|/)?.[1];
  ok(`Schema.md — blueprint says ${claimed}, file says ${actual}`, claimed === actual,
     claimed !== actual ? `Update the Schema.md row in ${BLUEPRINT}` : "");
}

// ── sw.js and the cache name ────────────────────────────────────────
{
  const sw = read("sw.js");
  const actualVer = sw.match(/^ \* \d{1,2} \w{3} \d{4} v(\d+)$/m)?.[1];
  const actualCache = sw.match(/const CACHE_NAME = "(alongside-v\d+)"/)?.[1];
  const row = bp.match(/\|\s*`sw\.js`\s*\|([^|]*)\|/)?.[1] || "";
  const claimedVer = row.match(/v(\d+)/)?.[1];
  const claimedCache = row.match(/(alongside-v\d+)/)?.[1];

  ok(`sw.js — blueprint says v${claimedVer}, file says v${actualVer}`, claimedVer === actualVer,
     claimedVer !== actualVer ? `Update the sw.js row in ${BLUEPRINT}` : "");
  ok(`cache — blueprint says ${claimedCache}, file says ${actualCache}`, claimedCache === actualCache,
     claimedCache !== actualCache ? `Update the sw.js row in ${BLUEPRINT}` : "");

  // The version and its cache must agree with each other too. A bump
  // that changes one and not the other ships a service worker that never
  // replaces the old cache.
  ok(`sw.js version and cache name agree (v${actualVer} / ${actualCache})`,
     actualCache === `alongside-v${actualVer}`,
     `sw.js header says v${actualVer} but CACHE_NAME is ${actualCache}`);
}

// ── Gate count ──────────────────────────────────────────────────────
{
  const actual = fs.readdirSync(path.join(REPO, "tools"))
    .filter(f => /^verify-.*\.mjs$/.test(f)).length;
  const claimedRow = bp.match(/\|\s*Gates\s*\|([^|]*)\|/)?.[1] || "";
  const claimed = Number(claimedRow.match(/(\d+)/)?.[1]);
  const claimedInventory = Number(bp.match(/`tools\/verify-\*\.mjs`\s*\|\s*(\d+) gates/)?.[1]);

  ok(`gate count — blueprint says ${claimed}, tools/ holds ${actual}`, claimed === actual,
     claimed !== actual ? `Update the Gates row in ${BLUEPRINT}` : "");
  ok(`inventory line agrees too — says ${claimedInventory}`, claimedInventory === actual,
     claimedInventory !== actual ? `Update the tools/verify-*.mjs line in ${BLUEPRINT}` : "");
}

// ── The blueprint's own header ──────────────────────────────────────
{
  ok("the blueprint carries a DD Mon YYYY vN header",
     /^## \d{1,2} \w{3} \d{4} v\d+$/m.test(bp));
}

console.log(`\n${"-".repeat(60)}`);
if (failures === 0) {
  console.log(`verify-blueprint: ${checks} checks, all green.`);
  console.log("The first document a new session reads is telling the truth.");
  process.exit(0);
} else {
  console.log(`verify-blueprint: ${failures} of ${checks} checks RED.`);
  console.log("The blueprint is stale. A new session reading it would be told to");
  console.log("stop and reconcile against a discrepancy that exists only on paper.");
  process.exit(1);
}
