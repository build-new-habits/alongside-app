/**
 * Documents/Admin/Templates/audit-contraindications.mjs
 * 12 Sep 2026 v1
 *
 * CONTRA-AUDIT. Where the library disagrees with itself about who is safe
 * to meet what.
 *
 * THE QUESTION. If two entries are the same movement at different
 * difficulties, and the GENTLER one is excluded for a condition that the
 * HARDER one allows, somebody in that condition is offered the harder
 * version and refused the gentler. That is backwards, and it is in the
 * data today -- with nothing linking families, nothing surfaces it.
 *
 * AN AUDIT, NOT A GATE. It reports; it decides nothing and changes
 * nothing. Grouping is a name-stem heuristic, so some pairs are not real
 * families and a person has to read them. Deliberately kept out of tools/
 * for that reason: every file there is a pass/fail gate.
 *
 * Findings as of 12 Sep 2026 are written up in
 * Documents/Business/alongside_contraindication_audit_12sep2026_v1.md,
 * which also carries the three pairs this heuristic MISSES.
 *
 * Run from the repo root: node Documents/Admin/Templates/audit-contraindications.mjs
 */
import { createRequire as __cr } from "node:module";
const { JSDOM } = __cr(import.meta.url)("jsdom");
const dom = new JSDOM('<!doctype html><body></body>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;
const { EXERCISES } = await import(new URL("../../../js/data/exercises/index.js", import.meta.url).href);

const MOD = /\b(modified|assisted|banded|band|resistance|wall|incline|decline|kneeling|knee|knees|seated|supported|single|one|two|arm|arms|leg|legs|weighted|progression|progressive|rehab|load|activation|box|elevated|tempo|pause|paused|jump|jumping|dumbbell|barbell|kettlebell|cable|machine|bodyweight|isometric|hold|standing|lying|supine|prone|side|chair|full|partial|deficit|goblet|alternating|reverse|lateral|slow|basic|advanced|beginner|gentle|light|heavy|drill|flow|series|pose|stretch|with|and|the|to|on|a|of|level|version|variation)\b/gi;
const stem = e => e.name.toLowerCase().replace(/[()–—-]/g, " ").replace(MOD, " ").replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();

const groups = {};
for (const e of EXERCISES) {
  const k = (e.movementPattern || "?") + "|" + stem(e);
  if (!stem(e)) continue;
  (groups[k] = groups[k] || []).push(e);
}
const rows = [];
for (const [k, v] of Object.entries(groups)) {
  if (v.length < 2) continue;
  for (const a of v) for (const b of v) {
    const da = a.difficultyLevel ?? 0, db = b.difficultyLevel ?? 0;
    if (da >= db) continue;
    const extra = (a.contraindications || []).filter(c => !(b.contraindications || []).includes(c));
    if (!extra.length) continue;
    rows.push({ group: k.split("|")[1], pattern: k.split("|")[0],
      gentler: a.id, gd: da, gcat: a.category,
      harder: b.id, hd: db, hcat: b.category, extra });
  }
}
rows.sort((x, y) => x.group.localeCompare(y.group));
console.log("PAIRS:", rows.length);
for (const r of rows) console.log(JSON.stringify(r));
