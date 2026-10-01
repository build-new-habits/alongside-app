/**
 * tools/bnh-files.mjs
 * 01 Oct 2026 v1
 *
 * Where the private BNH-Files repository is, for the few checks that read
 * the master schedule. The schedule moved out of this public repository on
 * 01 Oct 2026 (build-new-habits/BNH-Files, Apps/Alongside Move/Schedule/).
 *
 * Looks in $BNH_FILES first, then for a clone beside this repository named
 * bnh-files or BNH-Files. If none is found the check FAILS with an
 * explanation rather than skipping: a check that silently stops checking
 * looks like coverage and is not.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CANDIDATES = [
  process.env.BNH_FILES,
  path.resolve(REPO, "..", "bnh-files"),
  path.resolve(REPO, "..", "BNH-Files"),
].filter(Boolean);

export const SCHEDULE_REL = "Apps/Alongside Move/Schedule/master_schedule.md";

export function schedulePath() {
  for (const root of CANDIDATES) {
    const p = path.join(root, SCHEDULE_REL);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

export function readSchedule() {
  const p = schedulePath();
  if (!p) {
    console.log("  FAIL  the master schedule is not reachable");
    console.log("        It lives in the private repository build-new-habits/BNH-Files.");
    console.log("        Clone it beside this repository (../bnh-files), or set BNH_FILES to its folder.");
    process.exit(1);
  }
  return fs.readFileSync(p, "utf8");
}
