/**
 * tools/chromium-trends.mjs
 * 01 Nov 2026 v4
 *
 * v4 - P-20 session 4: reformer-style's screens and Dynamic Pilates.
 * v3 - P-20 session 3: Hybrid training's screens (week 1, the session, week 9).
 * v2 - P-20 session 2: HILIT's two screens.
 *
 * P-20 TRENDS-BUILD, session 1. The real-browser half of
 * verify-path-trends: jsdom draws no layout, so this measures what a person
 * sees on every new screen behind Follow a fitness trend (the Plan), at
 * text size 1, 1.45 and 2, on 390 and 320 px phones, light and dark:
 *   1. no sideways scroll, and no word split across lines;
 *   2. one visible h1;
 *   3. every row, button and the snack's checkbox label at least 44 px tall
 *      (WCAG 2.2 2.5.8 asks 24; the app's own rule is 44);
 *   4. axe-core (WCAG 2.2 AA tags) finds nothing, when AXE points at
 *      axe.min.js.
 *
 * Needs Chromium and Playwright, so it is not in the verify-* loop (as
 * chromium-text-fit.mjs). Run from the repository root:
 *   AXE=/path/to/axe.min.js node tools/chromium-trends.mjs
 * Optional: SHOTS=dir (a full-page picture of every screen view).
 * Exits 1 on any fault.
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

// Each screen: [door, presses in order, a name]. A press is a row's value, or "#id".
const SCREENS = [
  ["moving",   ["home", "whole", "trend"], "trends, Keep moving"],
  ["stronger", ["home", "whole", "trend"], "trends, Get stronger"],
  ["moving",   ["home", "whole", "trend", "zone2"], "Zone 2, which activity"],
  ["moving",   ["home", "whole", "trend", "zone2", "run"], "Zone 2, week 1"],
  ["moving",   ["home", "whole", "trend", "zone2", "run", "easy"], "Zone 2, easy day"],
  ["moving",   ["@week5", "home", "whole", "trend", "zone2", "hard"], "Zone 2, harder day"],
  ["stronger", ["home", "whole", "trend", "snack"], "snack, qualities"],
  ["stronger", ["home", "whole", "trend", "snack", "legs"], "snack, legs"],
  ["moving",   ["home", "whole", "trend", "snack", "breath"], "snack, out of breath"],
  ["moving",   ["home", "whole", "trend", "cross"], "cross, what do you do most"],
  ["moving",   ["home", "whole", "trend", "cross", "run"], "cross, the choices"],
  ["stronger", ["home", "whole", "trend", "hilit"], "HILIT, week 1"],
  ["stronger", ["home", "whole", "trend", "hilit", "go"], "HILIT, the session"],
  ["stronger", ["home", "whole", "trend", "hybrid"], "Hybrid training, week 1"],
  ["stronger", ["home", "whole", "trend", "hybrid", "go"], "Hybrid training, the session"],
  ["stronger", ["@week9h", "gym", "whole", "trend", "hybrid"], "Hybrid training, week 9"],
  ["stronger", ["home", "whole", "trend", "reformer"], "Reformer-style, week 1"],
  ["stronger", ["home", "whole", "trend", "reformer", "go"], "Reformer-style, the session"],
  ["stronger", ["@week9r", "home", "whole", "trend", "reformer", "dynamic"], "Dynamic Pilates"],
  ["finish",   [], "the Plan finish after a snack"],
];

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || "/opt/pw-browsers/chromium" });
const faults = [];
let measured = 0;
for (const scheme of ["light", "dark"]) for (const width of [390, 320]) for (const size of ["1", "1.45", "2"]) {
  const ctx = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: "block", colorScheme: scheme });
  const page = await ctx.newPage();
  await page.goto(BASE); await page.waitForTimeout(1000);
  for (const [door, presses, name] of SCREENS) {
    const label = `${scheme} ${width}px text ${size}: ${name}`;
    await page.evaluate(async ({ size, week5, week9h, week9r, finish }) => {
      const s = window.store;
      const { POLICY_VERSION } = await import("./js/data/consent-version.js");
      const { AGE_CHECK_VERSION } = await import("./js/data/age-check.js");
      const { HEALTH_CONSENT_VERSION } = await import("./js/data/health-consent.js");
      const { HURT_AND_ACHE_VERSION } = await import("./js/exercise-card.js");
      localStorage.clear(); s.init();
      const at = new Date().toISOString();
      s.set("consent.ageConfirmed", true); s.set("consent.ageCheckedAt", at); s.set("consent.ageVersion", AGE_CHECK_VERSION);
      s.set("consent.given", true); s.set("consent.at", at); s.set("consent.policyVersion", POLICY_VERSION);
      s.set("consent.health", { given: true, at, version: HEALTH_CONSENT_VERSION, withdrawnAt: null });
      s.set("onboardingComplete", true); s.set("name", "Graeme"); s.set("tier", "personal");
      s.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at, textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
      s.set("homeEquipment", ["band-medium"]);
      const k = new Date().toISOString().split("T")[0];
      s.set("checkinHistory", { [k]: { energy: 6, mood: 6, date: new Date().toDateString() } });
      if (week9r) s.set("trends", [{ id: "reformer", startedAt: s._localDay(new Date(Date.now() - 60 * 86400000)), activity: null }]);
      if (week9h) s.set("trends", [{ id: "hybrid", startedAt: s._localDay(new Date(Date.now() - 60 * 86400000)), activity: null }]);
      if (week5) s.set("trends", [{ id: "zone2", startedAt: s._localDay(new Date(Date.now() - 30 * 86400000)), activity: "run" }]);
      if (finish) {
        s.logActivity({ type: "workout", completedAt: at, snack: true, durationMins: 10, exerciseIds: ["sit-to-stand", "reverse-lunge", "glute-bridge"] });
        s.set("currentActivityEntry", s.get("activityLog").slice(-1)[0]);
      }
      const DP = await import("./js/display-prefs.js"); DP.setDisplayPref("textScale", size); DP.applyDisplayPrefs();
    }, { size, week5: presses[0] === "@week5", week9h: presses[0] === "@week9h", week9r: presses[0] === "@week9r", finish: door === "finish" });
    if (door === "finish") { await page.evaluate(() => window.router.navigate("plan-finish")); }
    else {
      await page.evaluate(d => { window.router.pathStart = { door: d }; window.router.navigate("path"); }, door);
      await page.waitForTimeout(350);
      for (const p of presses.filter(x => !x.startsWith("@"))) {
        const hit = await page.evaluate(v => { const el = document.querySelector(`.path-row[data-v="${v}"]`); if (el) el.click(); return !!el; }, p);
        if (!hit) { faults.push(`${label}: could not press ${p}`); break; }
        await page.waitForTimeout(150);
      }
    }
    await page.waitForTimeout(350);
    const r = await page.evaluate(() => {
      const W = document.documentElement.clientWidth;
      const wide = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
      const main = document.getElementById("main-content");
      const h1s = [...main.querySelectorAll("h1")].filter(h => !h.closest(".sr-only") && getComputedStyle(h).display !== "none" && h.getClientRects().length).length;
      const small = [];
      for (const el of main.querySelectorAll(".path-row, button, .pf-count__lbl, .path-seg label, a.path-mv__yt")) {
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
      return { W, wide, h1s, small: small.slice(0, 5), split: [...new Set(split)].slice(0, 5) };
    });
    measured++;
    if (process.env.SHOTS) await page.screenshot({ path: `${process.env.SHOTS}/${scheme}-${width}-${size}-${name.replace(/[^a-z0-9]+/gi, "_")}.png`, fullPage: true });
    if (r.wide > r.W + 1) faults.push(`${label}: ${r.wide}px wide on ${r.W}px`);
    if (r.h1s !== 1) faults.push(`${label}: ${r.h1s} visible h1`);
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
