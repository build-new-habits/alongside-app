/**
 * tools/contrast-check.mjs
 * 12 Aug 2026 v1
 *
 * A11Y-1 gate. Reads the live token values out of css/base/variables.css
 * -- never a restatement of them -- and asserts every text token clears
 * WCAG 2.2 AA against every surface token it can land on.
 *
 * Exits 1 on any failure, so it can gate a commit like schema-check.mjs.
 */
import fs from "node:fs";

const src = fs.readFileSync("css/base/variables.css", "utf8");
const tok = n => {
  const m = src.match(new RegExp(`--${n}:\\s*(#[0-9A-Fa-f]{6})`));
  if (!m) throw new Error(`token --${n} not found in variables.css`);
  return m[1];
};

const lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const L = h => { const [r,g,b] = [1,3,5].map(i => parseInt(h.substr(i,2),16));
  return 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b); };
const cr = (a,b) => { const x=L(a), y=L(b), hi=Math.max(x,y), lo=Math.min(x,y);
  return (hi+0.05)/(lo+0.05); };

const SURFACES = ["color-bg-deep","color-bg","color-bg-card","color-bg-elevated","color-bg-hover"];
const TEXT     = ["color-text","color-text-secondary","color-text-muted"];

const AA_TEXT = 4.5;   // 1.4.3 normal text
const AA_UI   = 3.0;   // 1.4.11 non-text / component boundaries

let fails = 0;
console.log("\nAA 4.5:1 - every text token on every surface\n");
console.log("           surface:  " + SURFACES.map(s => s.replace("color-bg","bg").padStart(9)).join(""));
for (const t of TEXT) {
  const row = SURFACES.map(s => {
    const v = cr(tok(t), tok(s));
    if (v < AA_TEXT) fails++;
    return (v.toFixed(2) + (v < AA_TEXT ? "!" : " ")).padStart(9);
  }).join("");
  console.log(`  ${t.replace("color-","").padEnd(16)}${row}`);
}

console.log("\nAA 3:1 - accents and boundaries");
const uiPairs = [
  ["color-primary","color-bg","primary on bg"],
  ["color-primary","color-bg-card","primary on card"],
  ["color-primary","color-bg-elevated","primary on elevated"],
  ["color-border-focus","color-bg-card","focus ring on card"],
  ["color-text-muted","color-bg-card","ci-choice border on panel"],
];
for (const [a,b,label] of uiPairs) {
  const v = cr(tok(a), tok(b));
  const ok = v >= AA_UI;
  if (!ok) fails++;
  console.log(`  ${label.padEnd(30)} ${v.toFixed(2).padStart(6)}  ${ok ? "PASS" : "FAIL"}`);
}

console.log("\nRegression guard - the exact pair A11Y-1 was raised for");
const sub = cr(tok("color-text-secondary"), tok("color-bg-elevated"));
console.log(`  secondary on elevated ${sub.toFixed(2)} (was 4.30, must be >= ${AA_TEXT})`);
if (sub < AA_TEXT) fails++;

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
