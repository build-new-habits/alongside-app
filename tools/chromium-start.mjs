/**
 * tools/chromium-start.mjs
 * 24 Nov 2026 v1
 *
 * P-46 S2. The one-minute start in a real browser (Chromium), from
 * chromium-my-move.mjs's measures: light and dark, 390 and 320 px, text
 * 1, 1.45 and 2. Each screen: no sideways scroll, one visible h1, every
 * control 44 px or more, no word split across lines, and axe-core (WCAG 2.2
 * AA) at text 1 when AXE points at axe.min.js. Not in the verify loop
 * (needs Chromium). Run from the repository root:
 *   AXE=/path/to/axe.min.js node tools/chromium-start.mjs
 */
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, normalize, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright-core")); } catch {
  try { ({ chromium } = require("playwright")); } catch { ({ chromium } = createRequire("/opt/npm-tools/node_modules/")("playwright")); }
}
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const server = createServer((req, res) => {
  const p = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  const f = join(ROOT, p === "/" ? "index.html" : p);
  if (!existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" }); res.end(readFileSync(f));
});
await new Promise(r => server.listen(0, "127.0.0.1", r));
const BASE = `http://127.0.0.1:${server.address().port}/index.html`;
const AXE = process.env.AXE && existsSync(process.env.AXE) ? readFileSync(process.env.AXE, "utf8") : null;

// Each screen: [where, presses, a name].
const SCREENS_ALL = [
  ["start", [], "1 Your name"],
  ["start", ["=#st-name|Sam", "[data-st-next]"], "2 Anything sore, nothing picked"],
  ["start", ["[data-st-next]", '[data-area="lower-back"]', '[data-area="knee"]', '[data-area="shoulder"]'], "2 Anything sore, three picked"],
  ["start", ["[data-st-next]", "[data-st-next]"], "3 Where, nothing chosen"],
  ["start", ["[data-st-next]", "[data-st-next]", '[data-place="gym"]', 'input[name="st-chairRise"][value="not-easily"]', 'input[name="st-legPower"][value="limited"]', 'input[name="st-floorAccess"][value="yes"]', 'input[name="st-balanceWorry"][value="sometimes"]'], "3 Where, all answered, the leg question"],
  ["start", ["=#st-name|Sam", "[data-st-next]", '[data-area="lower-back"]', '[data-area="knee"]', "[data-st-next]", '[data-place="home"]', "[data-st-next]"], "4 Your first session"],
  ["nohealth", ["[data-st-next]"], "No health answers: 2 Where"],
  ["nohealth", ["[data-st-next]", '[data-place="outside"]', "[data-st-next]"], "No health answers: 3 Your first session"],
];
const SCREENS = process.env.ONLY ? SCREENS_ALL.filter(x => x[0] === process.env.ONLY) : SCREENS_ALL;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || "/opt/pw-browsers/chromium" });
const faults = [];
let measured = 0;
for (const scheme of ["light", "dark"]) for (const width of [390, 320]) for (const size of ["1", "1.45", "2"]) {
  const ctx = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: "block", colorScheme: scheme });
  const page = await ctx.newPage();
  await page.goto(BASE); await page.waitForTimeout(1000);
  for (let [where, presses, name] of SCREENS) {
    const label = `${scheme} ${width}px text ${size}: ${name}`;
    await page.evaluate(async ({ size, where }) => {
      const s = window.store;
      const { POLICY_VERSION } = await import("./js/data/consent-version.js");
      const { AGE_CHECK_VERSION } = await import("./js/data/age-check.js");
      const HC = await import("./js/data/health-consent.js");
      localStorage.clear(); s.init();
      const at = new Date().toISOString();
      s.set("consent.ageConfirmed", true); s.set("consent.ageCheckedAt", at); s.set("consent.ageVersion", AGE_CHECK_VERSION);
      s.set("consent.given", true); s.set("consent.at", at); s.set("consent.policyVersion", POLICY_VERSION);
      if (where === "nohealth") HC.declineHealthConsent();
      else s.set("consent.health", { given: true, at, version: HC.HEALTH_CONSENT_VERSION, withdrawnAt: null });
      const DP = await import("./js/display-prefs.js"); DP.setDisplayPref("textScale", size); DP.applyDisplayPrefs();
    }, { size, where });
    await page.evaluate(() => window.router.navigate("onboarding/start"));
    await page.waitForTimeout(500);
    for (const p of presses) {
      const hit = await page.evaluate(v => {
        if (v.startsWith("=")) { const [sel, val] = v.slice(1).split("|"); const el = document.querySelector(sel); if (!el) return false; el.focus(); el.value = val; el.dispatchEvent(new Event("input", { bubbles: true })); return true; }
        const el = document.querySelector(v);
        if (!el) return false;
        if (el.matches("input[type=radio],input[type=checkbox]")) { el.checked = true; el.dispatchEvent(new Event("change", { bubbles: true })); } else el.click();
        return true;
      }, p);
      if (!hit) { faults.push(`${label}: could not press ${p}`); break; }
      await page.waitForTimeout(250);
    }
    await page.waitForTimeout(350);
    const r = await page.evaluate(() => {
      const W = document.documentElement.clientWidth;
      const wide = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
      const main = document.getElementById("main-content");
      const h1s = [...main.querySelectorAll("h1")].filter(h => !h.closest(".sr-only") && getComputedStyle(h).display !== "none" && h.getClientRects().length).length;
      const small = [];
      for (const el of main.querySelectorAll("button, .st-seg__opt span, .st-input")) {
        const b = el.getBoundingClientRect(); if (!b.width) continue;
        if (b.height < 43.5) small.push(`${(el.id || el.className || el.tagName).toString().slice(0, 30)} ${Math.round(b.height)}px`);
      }
      const split = [];
      const tw = document.createTreeWalker(main, NodeFilter.SHOW_TEXT); let n;
      while ((n = tw.nextNode())) {
        const el = n.parentElement; if (!el || el.closest(".sr-only")) continue;
        const re = /[A-Za-z0-9’']{2,}/g; let m;
        while ((m = re.exec(n.data))) {
          const range = document.createRange(); range.setStart(n, m.index); range.setEnd(n, m.index + m[0].length);
          if (new Set([...range.getClientRects()].filter(q => q.width > 0).map(q => Math.round(q.top))).size > 1) split.push(m[0]);
        }
      }
      return { W, wide, h1s, small: small.slice(0, 5), split: [...new Set(split)].slice(0, 5), view: window.router.currentView };
    });
    measured++;
    if (process.env.SHOTS) await page.screenshot({ path: `${process.env.SHOTS}/${scheme}-${width}-${size}-${name.replace(/[^a-z0-9]+/gi, "_")}.png`, fullPage: true });
    if (r.wide > r.W + 1) faults.push(`${label}: ${r.wide}px wide on ${r.W}px`);
    if (r.h1s !== 1) faults.push(`${label}: ${r.h1s} visible h1 (${r.view})`);
    if (r.small.length) faults.push(`${label}: under 44px: ${r.small.join("; ")}`);
    if (r.split.length) faults.push(`${label}: splits ${r.split.join(", ")}`);
    if (AXE && size === "1") {
      await page.addScriptTag({ content: AXE });
      const v = await page.evaluate(async () => (await window.axe.run(document.getElementById("main-content"), { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } })).violations.map(x => `${x.id} (${x.nodes.length}): ${x.nodes[0]?.target?.join(" ")}`));
      for (const x of v) faults.push(`${label}: axe ${x}`);
    }
  }
  await ctx.close();
}
await browser.close(); server.close();
console.log(`${measured} screen views measured${AXE ? ", axe run at text 1" : " (no AXE: axe not run)"}`);
for (const f of faults) console.log("  FAULT  " + f);
console.log(faults.length ? `${faults.length} faults` : "0 faults");
process.exit(faults.length ? 1 : 0);
