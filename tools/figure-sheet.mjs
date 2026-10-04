/**
 * tools/figure-sheet.mjs
 * 04 Oct 2026 v1
 *
 * D-4 FIGURES. Not a gate. Draws every figure (or those whose id matches
 * a filter) onto one contact sheet, as the app draws them, so a person (or
 * Claude) can look at them all at once:
 *
 *   node tools/figure-sheet.mjs [filter] [--png out.png] [--html out.html]
 *       [--scheme dark|light] [--cols 4] [--ids a,b,c] [--file js/data/figures/batch-NN.js]
 *
 * With --png it photographs the sheet in the pre-installed Chromium.
 * Each card shows the exercise name, its id and every frame with its caption.
 */
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const filter = args.find((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));
const ids = (opt("--ids", "") || "").split(",").filter(Boolean);
const cols = Number(opt("--cols", 4));
const scheme = opt("--scheme", "dark");

const B = new URL("../js/", import.meta.url).href;
let { FIGURES } = await import(B + "data/figures/index.js");
const { renderFigureData } = await import(B + "figures.js");
// --file js/data/figures/batch-NN.js : draw that batch, listed in the index or not.
const file = opt("--file", null);
if (file) {
  const m = await import(new URL("../" + file, import.meta.url).href + "?t=" + Date.now());
  FIGURES = Object.values(m).find(v => v && typeof v === "object") || {};
}
const { EXERCISES } = await import(B + "data/exercises/index.js");
const byId = new Map(EXERCISES.map(e => [e.id, e]));

let list = Object.keys(FIGURES);
if (ids.length) list = list.filter(id => ids.includes(id));
if (filter) list = list.filter(id => id.includes(filter));

const css = fs.readFileSync(new URL("../css/base/global.css", import.meta.url), "utf8");
const figCss = css.slice(css.indexOf("/* D-4 FIGURES, 04 Oct 2026"));
const tokens = scheme === "light"
  ? "--color-bg:#F8FAFC;--color-bg-card:#FFFFFF;--color-text:#0F172A;--color-text-secondary:#3D4C5F;--color-primary:#0F766E;--color-border:#64748B;--kind-amber:#92400E;"
  : "--color-bg:#1E293B;--color-bg-card:#0F172A;--color-text:#E2E8F0;--color-text-secondary:#B9C6D6;--color-primary:#2DD4BF;--color-border:#475569;--kind-amber:#FBBF24;";
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

const cards = list.map(id => `
  <section class="card"><h2>${esc(byId.get(id)?.name || "?? " + id)}</h2><p class="id">${esc(id)}</p>${renderFigureData(FIGURES[id])}</section>`).join("");
const html = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>Figure sheet</title><style>
:root{${tokens}--space-2:8px;--space-3:12px;--text-sm:13px}
body{margin:0;padding:20px;background:var(--color-bg-card);color:var(--color-text);font-family:system-ui,sans-serif}
.grid{display:grid;grid-template-columns:repeat(${cols},minmax(0,1fr));gap:16px}
.card{border:1px solid var(--color-border);border-radius:16px;padding:12px}
h2{margin:0;font-size:16px}.id{margin:2px 0 8px;font-size:11px;color:var(--color-text-secondary)}
${figCss}
</style></head><body><p>${list.length} figures</p><div class="grid">${cards}</div></body></html>`;

const outHtml = opt("--html", null);
if (outHtml) fs.writeFileSync(outHtml, html);
const outPng = opt("--png", null);
if (outPng) {
  const tmp = outHtml || path.join(path.dirname(outPng), "figure-sheet.tmp.html");
  if (!outHtml) fs.writeFileSync(tmp, html);
  const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 330 * cols, height: 800 }, deviceScaleFactor: 1 });
  await page.goto("file://" + path.resolve(tmp));
  await page.screenshot({ path: outPng, fullPage: true });
  await browser.close();
}
console.log(`${list.length} figures${outPng ? " -> " + outPng : ""}${outHtml ? " -> " + outHtml : ""}`);
