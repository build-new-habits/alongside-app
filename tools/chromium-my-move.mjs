/**
 * tools/chromium-my-move.mjs
 * 23 Nov 2026 v2
 *
 * v2 - S3: the Plan's Home after Making my Move, on a good day (two doors,
 *   Calm my mind, It's a hard day) and a hard day (the one line, two
 *   choices, Show my usual Home).
 *
 * P-39 MAKING MY MOVE S2, the real-browser half of verify-my-move-screens
 * (the Plan): Making my Move, What's it for? with a taste open, On a good
 * day, On a hard day with two chosen. At text size 1, 1.45 and 2, on 390
 * and 320 px phones, light and dark: no sideways scroll, no word split
 * across lines, one visible h1, every control 44 px or more, and axe-core
 * (WCAG 2.2 AA) at text size 1 when AXE points at axe.min.js.
 *
 * Needs Chromium and Playwright, so it is not in the verify-* loop. From
 * the repository root: AXE=/path/to/axe.min.js node tools/chromium-my-move.mjs
 * Optional: SHOTS=dir. Exits 1 on any fault.
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
const SCREENS = [
  ["mm", [], "Making my Move"],
  ["mm", ['[data-go="for"]', '[data-taste="stronger"]'], "What's it for?, a taste open"],
  ["mm", ['[data-go="for"]', '[data-go="good"]'], "On a good day"],
  ["mm", ['[data-go="for"]', '[data-go="good"]', '[data-go="hard"]', '[data-hard="walk"]'], "On a hard day, two chosen"],
  ["home-good", [], "Home, a good day"],
  ["home-hard", [], "Home, a hard day"],
];

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
      const { HEALTH_CONSENT_VERSION } = await import("./js/data/health-consent.js");
      localStorage.clear(); s.init();
      const at = new Date().toISOString();
      s.set("consent.ageConfirmed", true); s.set("consent.ageCheckedAt", at); s.set("consent.ageVersion", AGE_CHECK_VERSION);
      s.set("consent.given", true); s.set("consent.at", at); s.set("consent.policyVersion", POLICY_VERSION);
      s.set("consent.health", { given: true, at, version: HEALTH_CONSENT_VERSION, withdrawnAt: null });
      s.set("onboardingComplete", true); s.set("name", "Graeme"); s.set("tier", "personal");
      s.set("goals", ["get-stronger", "flexibility", "reduce-stress"]);
      const DP = await import("./js/display-prefs.js"); DP.setDisplayPref("textScale", size); DP.applyDisplayPrefs();
      if (where !== "mm") {
        const k = new Date().toISOString().split("T")[0], e = where === "home-hard" ? 3 : 7;
        s.set("checkinHistory", { [k]: { energy: e, mood: 6, date: new Date().toDateString() } });
        s.set("lastCheckin", { energy: e, mood: 6, date: new Date().toDateString(), timestamp: new Date().toISOString() });
        s.setMyMove({ made: new Date().toISOString(), purposes: ["stronger", "stretch", "calm", "instep"], most: "stronger", goodDay: "few", hardDay: ["coach", "walk"] });
      }
    }, { size, where });
    await page.evaluate(() => window.router.navigate("today")); await page.waitForTimeout(150);
    if (where === "mm") await page.evaluate(() => window.router.navigate("my-move"));
    else { await page.evaluate(() => window.router.navigate("progress")); await page.waitForTimeout(100); await page.evaluate(() => window.router.navigate("today")); }
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
      for (const el of main.querySelectorAll("button, .mm-radio, .mm-check")) {
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
