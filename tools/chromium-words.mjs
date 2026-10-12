/**
 * tools/chromium-words.mjs
 * 12 Oct 2026 v1
 *
 * A-4 WORDS-DIET and A-9 ONE-NAME (Stage AWARD). The words people actually
 * see, screen by screen. Opens every screen the router can open (the same
 * list and the same person as chromium-text-fit.mjs), on Free and on the
 * Plan, at text size 1, and records for each:
 *   - the visible text (no screen-reader-only text, nothing hidden);
 *   - the words above the first thing to press (a button, link or input),
 *     the measure A-4 budgets.
 * Writes tools/out/words.json (gitignored) and prints the screens with the
 * most words before their first action.
 *
 * Needs Chromium and Playwright, like chromium-text-fit.mjs, so it is not in
 * the verify-* loop. From the repository root:
 *   node tools/chromium-words.mjs          (TIERS=free ROUTES=today,... optional)
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
const SIZES = ["1"];
const TIERS = (process.env.TIERS || "free,personal").split(",");
const PROGRESS_PAGES = ["lifts", "share", "year", "programme", "weight"];

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || "/opt/pw-browsers/chromium" });
const screens = [];
const unreached = [];
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
    const label = `${tier} ${v.r}${v.p ? " > " + v.p : ""}`;
    try {
      await page.evaluate(r => window.router.navigate(r), v.r); await page.waitForTimeout(500);
      if (v.p) {
        const has = await page.evaluate(p => { const el = document.querySelector(`[data-pr-page="${p}"]`); if (el) el.click(); return !!el; }, v.p);
        if (!has) continue;
        await page.waitForTimeout(400);
      }
      const r = await page.evaluate(() => {
        const root = document.getElementById("main-content") || document.body;
        if (/Something went wrong loading this page/.test(root.innerText || "")) return { failed: true };
        const visible = el => { for (let e = el; e && e !== document.body; e = e.parentElement) {
          if (e.matches(".sr-only,.visually-hidden")) return false;
          const cs = getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden") return false; } return true; };
        const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
        let n, before = [], all = [], hitAction = false;
        while ((n = tw.nextNode())) {
          if (n.nodeType === 1) {
            if (!hitAction && n.matches("button,a[href],input,select,textarea,[role=button]") && visible(n) && n.getBoundingClientRect().width > 0) hitAction = true;
            continue;
          }
          const el = n.parentElement; if (!el || !visible(el)) continue;
          const t = n.data.replace(/\s+/g, " ").trim(); if (!t) continue;
          all.push(t);
          if (!hitAction && !el.closest("button,a,[role=button],nav")) before.push(t);
        }
        const words = s => (s.match(/[A-Za-z0-9’']+/g) || []).length;
        return { text: all.join(" | "), wordsBeforeAction: words(before.join(" ")), wordsAll: words(all.join(" ")) };
      });
      if (r.failed) { unreached.push(label); continue; }
      screens.push({ tier, route: v.r + (v.p ? ">" + v.p : ""), ...r });
    } catch (e) { unreached.push(`${label} (${String(e.message).slice(0, 60)})`); }
  }
  await ctx.close();
}
await browser.close();
server.close();
const OUTDIR = join(ROOT, "tools/out"); mkdirSync(OUTDIR, { recursive: true });
const { writeFileSync } = await import("node:fs");
writeFileSync(join(OUTDIR, "words.json"), JSON.stringify(screens, null, 1));
if (unreached.length) console.log(`Not reached: ${unreached.join(", ")}`);
for (const s of [...screens].sort((a, b) => b.wordsBeforeAction - a.wordsBeforeAction).slice(0, 15))
  console.log(`  ${String(s.wordsBeforeAction).padStart(4)} before the first action, ${String(s.wordsAll).padStart(4)} in all  ${s.tier} ${s.route}`);
console.log(`\nCHROMIUM-WORDS: ${screens.length} screens read, tools/out/words.json`);
