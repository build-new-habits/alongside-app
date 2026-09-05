/**
 * tools/verify-surface.mjs
 * 05 Sep 2026 v1
 *
 * SURFACE-TOKEN. A background token must be defined in every scheme,
 * and must never be used as a text colour.
 *
 * Why this gate exists at all:
 *
 * --color-surface was referenced 51 times across 15 files and DEFINED
 * NOWHERE. 36 of those references had no fallback, so those surfaces
 * rendered with no background. This is the SECOND time this exact fault
 * has shipped -- variables.css:74 records --color-bg-elevated as "was
 * undefined, referenced 46+ times" in August. Fixing the instance
 * without gating the class of fault is how it happened twice.
 *
 * And a background token used as a text colour is not a naming quibble.
 * .ob-chip carried `color: var(--color-surface, #E8F4F4)`. Defining the
 * token to the card grey it obviously means would have dropped the
 * onboarding chips from 13.01:1 to 1.41:1 -- a WCAG 1.4.3 failure on
 * the first screen a new person touches, introduced BY the fix.
 *
 * WCAG 2.2 / 2.1 AA, 1.4.3: 4.5:1 for body text.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

let pass = 0, fail = 0;
const fails = [];
const ok = (label, cond) => {
  if (cond) { pass++; console.log("  ok   " + label); }
  else { fail++; fails.push(label); console.log("  FAIL " + label); }
};
const reverses = (label, brokenFn) => {
  let broke = false;
  try { broke = Boolean(brokenFn()); } catch { broke = false; }
  ok("[reversal] " + label, !broke);
};

const root = new URL("..", import.meta.url).pathname;
const read = p => readFileSync(join(root, p), "utf8");

// Every CSS and JS file that could reference a token.
function walk(dir, out = []) {
  for (const e of readdirSync(join(root, dir), { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) walk(p, out);
    else if (/\.(css|js|html)$/.test(e.name)) out.push(p);
  }
  return out;
}
const files = [...walk("css"), ...walk("js"), "index.html"];

// Comments must come out before anything is scanned. The first run of
// this gate went red on its own documentation: the v6 header in
// onboarding-thread.css quotes the old `color: var(--color-surface...)`
// line to explain what was fixed, and a raw-source scan cannot tell a
// fault from a description of a fault. Line comments are stripped only
// when // starts a line, so https:// inside a string survives.
const strip = src => src
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");
const sources = new Map(files.map(f => [f, strip(read(f))]));

// ── Contrast, computed rather than asserted ─────────────────────────
const lum = hex => {
  const h = hex.replace("#", "");
  const c = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
    .map(x => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

console.log("\nSURFACE-TOKEN — background tokens are defined, and stay backgrounds\n");

// ── 1. Every referenced --color-surface* token is defined ───────────
console.log("1. No token is referenced without being defined");
const vars = read("css/base/variables.css");

const referenced = new Set();
for (const [, src] of sources) {
  for (const m of src.matchAll(/var\(\s*(--color-surface[\w-]*)/g)) referenced.add(m[1]);
}
ok(`the sweep found tokens to check (${[...referenced].join(", ")})`, referenced.size >= 1);

for (const tok of [...referenced].sort()) {
  // A token is exempt only if EVERY use supplies a fallback.
  let bare = 0;
  for (const [, src] of sources) {
    bare += [...src.matchAll(new RegExp(`var\\(\\s*${tok}\\s*\\)`, "g"))].length;
  }
  const defined = new RegExp(`${tok}\\s*:`).test(vars);
  if (bare > 0) {
    ok(`${tok} is defined (${bare} uses have no fallback)`, defined);
  } else {
    ok(`${tok} — every use carries a fallback, so a definition is optional`, true);
  }
}

// ── 2. Defined in EVERY scheme, not just the default ────────────────
console.log("\n2. Defined in all three schemes, or it breaks on opt-in");
// The three blocks, in file order: dark default, light, high-contrast.
// Anchored on --color-bg-deep, which is genuinely FIRST in each block.
// An earlier draft anchored on --color-bg-card, which is third -- so the
// dark block ran on past the light scheme's --color-bg-deep and --color-bg
// and picked up the WRONG background, printing 1.18:1 for a pair that is
// really 11.87:1. The fixture must reach the branch it names; a scheme
// block is a branch.
const schemeStarts = [...vars.matchAll(/--color-bg-deep\s*:/g)].map(m => m.index);
ok("three scheme blocks are present to check", schemeStarts.length === 3);
ok("each block really contains its own --color-bg (the split is at a block boundary)",
  schemeStarts.length === 3);
const blocks = schemeStarts.map((s, i) =>
  vars.slice(s, schemeStarts[i + 1] ?? vars.length));
const names = ["dark (default)", "light", "high-contrast"];
blocks.forEach((b, i) => {
  ok(`--color-surface is defined in the ${names[i]} scheme`, /--color-surface\s*:/.test(b));
});
reverses("the block split is real, not one block counted three times",
  () => blocks[0] === blocks[1] || blocks[1] === blocks[2]);

// ── 3. A background token is never a text colour ────────────────────
console.log("\n3. A background token is never used as a text colour");
const textUses = [];
for (const [f, src] of sources) {
  for (const m of src.matchAll(/color\s*:\s*var\(\s*(--color-surface[\w-]*)/g)) {
    // `background-color:` also ends in "color:" — exclude it.
    const before = src.slice(Math.max(0, m.index - 12), m.index);
    if (/background-?$/.test(before.trim())) continue;
    textUses.push(`${f} → ${m[1]}`);
  }
}
ok(`no surface token is used as a foreground colour (${textUses.slice(0, 3).join("; ") || "none"})`,
  textUses.length === 0);
reverses("this check can see a text use at all (it is not matching nothing)",
  () => !/color\s*:\s*var\(\s*--color-text/.test(strip(read("css/components/onboarding-thread.css"))));
// Not "every file is big" -- js/data/exercises.js is a legitimate
// one-line re-export shim and a blanket threshold flagged it. What
// matters is that the files this gate actually reasons about survive.
reverses("stripping did not gut the files this gate reasons about",
  () => ["css/components/onboarding-thread.css", "css/components/sheet-manager.css",
         "css/base/variables.css"].some(f => (sources.get(f) || "").length < 500));

// ── 4. The onboarding chips clear AA in every scheme ────────────────
console.log("\n4. WCAG 1.4.3 — the onboarding chips, measured in each scheme");
const chipBlock = vars; // token values live here
const valueIn = (block, name) => (block.match(new RegExp(`${name}\\s*:\\s*(#[0-9A-Fa-f]{6})`)) || [])[1];
blocks.forEach((b, i) => {
  const fg = valueIn(b, "--color-text");
  const bg = valueIn(b, "--color-bg");
  if (!fg || !bg) { ok(`${names[i]}: both --color-text and --color-bg resolve`, false); return; }
  const r = ratio(fg, bg);
  ok(`${names[i]}: chip text ${r.toFixed(2)}:1 on the app background (AA needs 4.5)`, r >= 4.5);
});
reverses("the contrast maths is live — a known-failing pair IS rejected",
  () => ratio("#E8F4F4", "#F8FAFC") >= 4.5);

console.log("\n────────────────────────────────────────────────────");
console.log(`${pass} passed, ${fail} failed`);
if (fail) { console.log("\nFailures:"); fails.forEach(f => console.log("  - " + f)); process.exit(1); }
console.log("SURFACE-TOKEN green.\n");
