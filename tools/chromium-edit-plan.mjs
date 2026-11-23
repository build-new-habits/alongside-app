/**
 * tools/chromium-edit-plan.mjs
 * 23 Nov 2026 v1
 *
 * P-44 S3, the real-browser half of verify-physio-link: the website's
 * edit-plan page (../website/edit-plan/) opened from a real link, as read,
 * with a new exercise and a mistake showing, and with the back link made.
 * At 390 and 320 px wide, text at 100% and 200%: no sideways scroll, no
 * word split across lines, one visible h1, every control 44 px or more,
 * and axe-core (WCAG 2.2 AA) at 100% when AXE points at axe.min.js.
 *
 * Needs Chromium and Playwright, so it is not in the verify-* loop. From
 * the repository root: AXE=/path/to/axe.min.js node tools/chromium-edit-plan.mjs
 * Optional: SHOTS=dir. Exits 1 on any fault.
 */
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, normalize, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const WEB = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "website");
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright-core")); } catch {
  try { ({ chromium } = require("playwright")); } catch { ({ chromium } = createRequire("/opt/npm-tools/node_modules/")("playwright")); }
}
const PL = await import(new URL("../js/data/plan-link.js", import.meta.url).href);
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".xml": "text/xml" };
const server = createServer((req, res) => {
  let p = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  let f = join(WEB, p);
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
  if (!existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" }); res.end(readFileSync(f));
});
await new Promise(r => server.listen(0, r));
const BASE = `http://127.0.0.1:${server.address().port}`;
const AXE = process.env.AXE ? readFileSync(process.env.AXE, "utf8") : null;

const own = [["Supine Spinal Twist", "Evening Release", "45 seconds each side", "knees together, shoulders down"], ["Seated Figure-4 Stretch", "Evening Release", "45 seconds each side"],
  ["Lateral Quad and IT Band Stretch", "Evening Release", "45 seconds each side"], ["Lat Pulldown", "Session A", "10", "about 40 kg, pull to collarbone"], ["Seated Cable Row", "Session A", "10"]]
  .map(([name, group, reps, notes], i) => ({ id: "px-1794424682372-" + i, name, group, sets: 3, reps, notes }));
const code = await PL.encodePlan(PL.outFromOwn(own, { notes: true, by: "Graeme" }));
const STATES = [["read", []], ["added, a mistake", ['[data-add="0"]', "#ep-make"]], ["back link made", ["#ep-make"]]];

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || "/opt/pw-browsers/chromium" });
const faults = []; let measured = 0;
for (const width of [390, 320]) for (const zoom of ["100%", "200%"]) for (const [name, presses] of STATES) {
  const ctx = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/edit-plan/#${code}`); await page.waitForTimeout(600);
  await page.evaluate(z => { document.documentElement.style.fontSize = z; }, zoom);
  for (const p of presses) { await page.evaluate(s => document.querySelector(s)?.click(), p); await page.waitForTimeout(250); }
  await page.waitForTimeout(250);
  const label = `${width}px ${zoom}: ${name}`;
  const r = await page.evaluate(() => {
    const W = document.documentElement.clientWidth, wide = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    const main = document.getElementById("main-content");
    const h1s = [...main.querySelectorAll("h1")].filter(h => h.getClientRects().length).length;
    const small = [];
    for (const el of main.querySelectorAll("button, input, a.ep-btn, .cta")) { const b = el.getBoundingClientRect(); if (b.width && b.height < 43.5) small.push(`${el.id || el.className} ${Math.round(b.height)}px`); }
    const split = []; const tw = document.createTreeWalker(main, NodeFilter.SHOW_TEXT); let n;
    while ((n = tw.nextNode())) {
      const el = n.parentElement; if (!el || el.closest("textarea")) continue;
      const re = /[A-Za-z0-9’']{2,}/g; let m;
      while ((m = re.exec(n.data))) { const range = document.createRange(); range.setStart(n, m.index); range.setEnd(n, m.index + m[0].length);
        if (new Set([...range.getClientRects()].filter(q => q.width > 0).map(q => Math.round(q.top))).size > 1) split.push(m[0]); }
    }
    return { W, wide, h1s, small: small.slice(0, 5), split: [...new Set(split)].slice(0, 5), text: main.textContent.replace(/\s+/g, " ").slice(0, 80) };
  });
  measured++;
  if (process.env.SHOTS) await page.screenshot({ path: `${process.env.SHOTS}/edit-plan-${width}-${zoom.replace("%", "")}-${name.replace(/[^a-z0-9]+/gi, "_")}.png`, fullPage: true });
  if (!/Graeme’s exercises/.test(r.text)) faults.push(`${label}: the list did not open (${r.text})`);
  if (r.wide > r.W + 1) faults.push(`${label}: ${r.wide}px wide on ${r.W}px`);
  if (r.h1s !== 1) faults.push(`${label}: ${r.h1s} visible h1`);
  if (r.small.length) faults.push(`${label}: under 44px: ${r.small.join("; ")}`);
  if (r.split.length) faults.push(`${label}: splits ${r.split.join(", ")}`);
  if (AXE && zoom === "100%") {
    await page.addScriptTag({ content: AXE });
    const v = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } })).violations.map(x => `${x.id} (${x.nodes.length}): ${x.nodes[0]?.target?.join(" ")}`));
    for (const x of v) faults.push(`${label}: axe ${x}`);
  }
  await ctx.close();
}
await browser.close(); server.close();
console.log(`${measured} page views measured${AXE ? ", axe run at 100%" : " (no AXE)"}`);
for (const f of faults) console.log("  FAULT  " + f);
console.log(faults.length ? `${faults.length} faults` : "0 faults");
process.exit(faults.length ? 1 : 0);
