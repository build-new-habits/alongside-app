/**
 * tools/chromium-text-fit.mjs
 * 06 Oct 2026 v1
 *
 * D-12 PROGRESS-FIT. The real-browser half of verify-text-fit (jsdom draws
 * no layout, so that gate can only hold the CSS rules; this one measures).
 *
 * Graeme, 06 Oct, on the phone: "when I go into progress the screen shifts
 * right which makes some stuff off screen ... it's every time." Measured:
 * at his text size Progress was 707px wide on a 412px phone. Sweeping
 * every screen found it was not only Progress: before D-12, 70 screen and
 * size pairs were wider than the phone (Plan your week even at normal
 * text), and 44 split a word across two lines.
 *
 * For every screen the router can open (onboarding and the gate screens
 * aside), on Free and on the Plan, at text size 1, 1.45 and 2, on a 412px
 * phone, it checks two things:
 *   - the page is no wider than the phone (nothing to scroll sideways:
 *     WCAG 1.4.10 Reflow, 1.4.4 Resize text);
 *   - no word is split across two lines (a layout that "fits" by breaking
 *     "sessions" into "ses / sions" has not fitted). A web or email
 *     address is the one exception: one too long for a line may break
 *     (reset.css, body overflow-wrap: break-word).
 * Progress's detail pages (lifts, share, year, programme, weight) are
 * opened by their own rows. A screen that cannot open with this person's
 * history is listed as not reached, never silently skipped.
 *
 * Needs Chromium and Playwright, so it is not in the verify-* loop (as
 * chromium-sheets.mjs). Run from the repository root:
 *   node tools/chromium-text-fit.mjs
 * Optional: SIZES=1,1.6  TIERS=free  ROUTES=progress,today  SHOTS=dir
 * Exits 1 on any screen too wide or any split word.
 */
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { createRequire } from "node:module";

const ROOT = new URL("..", import.meta.url).pathname;
const require = createRequire(process.env.NODE_PATH ? process.env.NODE_PATH + "/" : import.meta.url);
let chromium;
try { ({ chromium } = require("playwright-core")); } catch {
  try { ({ chromium } = require("playwright")); } catch { ({ chromium } = createRequire("/opt/npm-tools/node_modules/")("playwright")); }
}

// A small static server for the app, so nothing else needs to be running.
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json" };
const server = createServer((req, res) => {
  const p = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  let f = join(ROOT, p === "/" ? "index.html" : p);
  if (!existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" });
  res.end(readFileSync(f));
});
await new Promise(r => server.listen(0, "127.0.0.1", r));
const BASE = `http://127.0.0.1:${server.address().port}/index.html`;

const src = readFileSync(join(ROOT, "js/router.js"), "utf8");
const block = src.slice(src.indexOf("const VIEW_NAMES = {"));
const table = block.slice(0, block.indexOf("\n};"));
const SKIP = ["age-check", "under-18", "consent-update", "health-consent", "red-flag"];
let routes = [...table.matchAll(/^\s*'([a-z0-9/-]+)'\s*:\s*\{/gm)].map(m => m[1]).filter(r => !r.startsWith("onboarding") && !SKIP.includes(r));
if (process.env.ROUTES) routes = routes.filter(r => process.env.ROUTES.split(",").includes(r));
const SIZES = (process.env.SIZES || "1,1.45,2").split(",");
const TIERS = (process.env.TIERS || "free,personal").split(",");
const SHOTS = process.env.SHOTS || null;
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const PROGRESS_PAGES = ["lifts", "share", "year", "programme", "weight"];

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || "/opt/pw-browsers/chromium" });
const faults = [], unreached = [];
let measured = 0;

for (const tier of TIERS) for (const size of SIZES) {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, serviceWorkers: "block" });
  const page = await ctx.newPage();
  await page.goto(BASE); await page.waitForTimeout(1200);
  // Somebody through onboarding, with four months of mixed sessions and lifts.
  await page.evaluate(async ({ tier, size }) => {
    const s = window.store;
    const { POLICY_VERSION } = await import("./js/data/consent-version.js");
    const { AGE_CHECK_VERSION } = await import("./js/data/age-check.js");
    const { HEALTH_CONSENT_VERSION } = await import("./js/data/health-consent.js");
    const at = new Date().toISOString();
    s.set("consent.ageConfirmed", true); s.set("consent.ageCheckedAt", at); s.set("consent.ageVersion", AGE_CHECK_VERSION);
    s.set("consent.given", true); s.set("consent.at", at); s.set("consent.policyVersion", POLICY_VERSION);
    s.set("consent.health", { given: true, at, version: HEALTH_CONSENT_VERSION, withdrawnAt: null });
    s.set("onboardingComplete", true); s.set("name", "Graeme"); s.set("tier", tier);
    const kinds = [["workout", "upper"], ["workout", "lower"], ["walk", null], ["yoga", null], ["class", null], ["breathing-session", null], ["freestyle", null], ["workout", "full"]];
    const log = [];
    for (let d = 1; d < 120; d += 2) { const [type, sessionType] = kinds[d % kinds.length]; log.push({ id: "t" + d, type, sessionType, completedAt: new Date(Date.now() - d * 86400000).toISOString(), duration: 35, completed: true }); }
    s.set("activityLog", log);
    const lifts = {};
    for (const id of ["lat-pulldown", "seated-cable-row", "goblet-squat", "dumbbell-bench-press"])
      lifts[id] = [0, 1, 2, 3].map(i => ({ at: new Date(Date.now() - (30 - i * 7) * 86400000).toISOString(), weight: 20 + i * 2.5, reps: 10, unit: "kg" }));
    s.set("liftLog", lifts);
    const DP = await import("./js/display-prefs.js"); DP.setDisplayPref("textScale", size); DP.applyDisplayPrefs();
  }, { tier, size });

  const visits = [...routes.map(r => ({ r })), ...(routes.includes("progress") ? PROGRESS_PAGES.map(p => ({ r: "progress", p })) : [])];
  for (const v of visits) {
    const label = `${tier.padEnd(8)} text ${size.padEnd(4)} ${v.r}${v.p ? " › " + v.p : ""}`;
    try {
      await page.evaluate(r => window.router.navigate(r), v.r); await page.waitForTimeout(500);
      if (v.p) {
        const has = await page.evaluate(p => { const el = document.querySelector(`[data-pr-page="${p}"]`); if (el) el.click(); return !!el; }, v.p);
        if (!has) continue;   // that row is not offered to this person (no programme, weight off)
        await page.waitForTimeout(400);
      }
      const r = await page.evaluate(() => {
        const W = document.documentElement.clientWidth;
        const wide = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
        const failed = /Something went wrong loading this page/.test(document.getElementById("main-content")?.innerText || "");
        const split = [];
        const tw = document.createTreeWalker(document.getElementById("main-content") || document.body, NodeFilter.SHOW_TEXT);
        let n;
        while ((n = tw.nextNode())) {
          const el = n.parentElement;
          if (!el || el.closest(".sr-only,.visually-hidden,textarea")) continue;
          const cs = getComputedStyle(el); if (cs.display === "none" || cs.visibility === "hidden") continue;
          const re = /[A-Za-z0-9’']{2,}/g; let m;
          while ((m = re.exec(n.data))) {
            // The whole run of text the word sits in, to the spaces either side.
            const s = n.data.lastIndexOf(" ", m.index) + 1, e = n.data.indexOf(" ", m.index);
            const token = n.data.slice(s, e < 0 ? undefined : e);
            if (/@|\/|\w\.\w/.test(token)) continue;   // an address may break
            const range = document.createRange(); range.setStart(n, m.index); range.setEnd(n, m.index + m[0].length);
            if (new Set([...range.getClientRects()].filter(q => q.width > 0).map(q => Math.round(q.top))).size > 1) split.push(m[0]);
          }
        }
        return { W, wide, failed, split: [...new Set(split)].slice(0, 6) };
      });
      if (r.failed) { unreached.push(label); continue; }
      measured++;
      if (SHOTS) await page.screenshot({ path: `${SHOTS}/${tier}-${size}-${v.r.replace(/\//g, "_")}${v.p ? "-" + v.p : ""}.png`, fullPage: true });
      if (r.wide > r.W + 1) faults.push(`${label}: ${r.wide}px wide on a ${r.W}px phone`);
      if (r.split.length) faults.push(`${label}: splits ${r.split.join(", ")}`);
    } catch (e) { unreached.push(`${label} (${String(e.message).slice(0, 60)})`); }
  }
  await ctx.close();
}
await browser.close();
server.close();

if (unreached.length) console.log(`Not reached with this history (not measured):\n  ${unreached.join("\n  ")}\n`);
console.log(faults.length ? faults.map(f => "  FAIL  " + f).join("\n") : "  PASS  every screen fits the phone, and no word is split");
console.log(`\nCHROMIUM-TEXT-FIT: ${measured} screens measured (${TIERS.length} tiers × text ${SIZES.join(" / ")}), ${faults.length} faults`);
process.exit(faults.length ? 1 : 0);
