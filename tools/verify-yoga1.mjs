/**
 * tools/verify-yoga1.mjs
 * 12 Aug 2026 v1
 *
 * P5 / YOGA-1 gate.
 *
 * yoga-session.js carried its own copy of 19 poses, including their
 * contraindications. 16 of the 19 had diverged from the exercise
 * database, always toward being LESS cautious -- Downward Dog listed knee
 * and hip while the database says shoulder, wrist/elbow and hamstring,
 * and Pilates Hundred listed none at all.
 *
 * Nothing failed. Sessions built, poses rendered, and somebody with an
 * acute wrist injury was quietly offered a full weight-bearing wrist
 * pose. This is P5's defect costing safety rather than rework.
 */
import fs from "node:fs";

const mem = {};
globalThis.localStorage = {
  getItem: k => (k in mem ? mem[k] : null),
  setItem: (k, v) => { mem[k] = String(v); },
  removeItem: k => { delete mem[k]; },
};
const { EXERCISES } = await import("/home/claude/repo/js/data/exercises/index.js");

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };

const view = fs.readFileSync("js/views/yoga-session.js", "utf8");
const code = view.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/[^\n]*$/gm, "");
const db   = new Map(EXERCISES.map(e => [e.id, e]));

console.log("\nTEST 1 - every pose the view names exists in the database");
const ids = [...new Set([...view.matchAll(/\{ id: "([a-z0-9-]+)",\s+name:/g)].map(m => m[1]))];
check(`all ${ids.length} pose ids resolve`, () => {
  const missing = ids.filter(i => !db.has(i));
  ok(missing.length === 0, `not in js/data/exercises/: ${missing.join(", ")}`);
});

console.log("\nTEST 2 - safety data comes from the database, not the view");
check("resolvePose() overrides contraindications from the database", () => {
  const fn = code.slice(code.indexOf("function resolvePose"), code.indexOf("let sessionQueue"));
  ok(/contraindications:\s*db\.contraindications/.test(fn),
     "the view's own list would win, and 16 of 19 are narrower than the database's");
  ok(/watchOut:\s*db\.watchOut/.test(fn), "watchOut would never reach a pose card");
});
check("buildSession resolves BEFORE it filters", () => {
  const fn = code.slice(code.indexOf("function buildSession"), code.indexOf("export function render"));
  const resolveAt = fn.indexOf("map(resolvePose)");
  const filterAt  = fn.indexOf("contra.some");
  ok(resolveAt !== -1, "no resolution step");
  ok(resolveAt < filterAt,
     "filtering before resolving runs the safety check on the stale copy - the original bug");
});
check("watchOut is actually rendered", () =>
  ok(/pose\.watchOut \?/.test(code), "resolved but never shown"));

console.log("\nTEST 3 - the divergence itself, measured");
const inlineContra = new Map();
for (const m of view.matchAll(/\{ id: "([a-z0-9-]+)",[\s\S]*?contraindications: \[([^\]]*)\] \}/g))
  if (!inlineContra.has(m[1]))
    inlineContra.set(m[1], new Set([...m[2].matchAll(/"([a-z0-9-]+)"/g)].map(x => x[1])));

check("no pose can be built with a contraindication the database does not have", () => {
  // The point is not that the inline lists match - they are allowed to be
  // stale now, because resolvePose() replaces them. The point is that
  // nothing downstream reads them. If that ever changes, this catches it.
  const narrower = [];
  for (const [id, inl] of inlineContra) {
    const dbc = new Set(db.get(id)?.contraindications || []);
    for (const c of dbc) if (!inl.has(c)) { narrower.push(id); break; }
  }
  ok(/map\(resolvePose\)/.test(code),
     `${narrower.length} inline lists are narrower than the database ` +
     `(${narrower.slice(0, 3).join(", ")}...) and nothing is resolving them`);
});

console.log("\nTEST 4 - watchOut coverage in the database");
check("every pose the view uses carries a watchOut", () => {
  const without = ids.filter(i => !db.get(i)?.watchOut);
  ok(without.length === 0,
     `Exercise Entry Standard requires it: ${without.join(", ")}`);
});

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
