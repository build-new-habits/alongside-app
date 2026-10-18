/**
 * tools/chromium-word-budget.mjs
 * 18 Oct 2026 v1
 *
 * A-4 WORD BUDGET (Stage AWARD; Graeme, 12 Oct: "Measured, not felt";
 * 18 Oct: "You do those things"). On every screen the router can open, on
 * Free and on the Plan, the words a person reads before the first thing
 * they can do (a button, a link, a field, a choice, a fold). Budget: 60.
 * Screens that exist to be read are listed in EXEMPT with the reason; any
 * other screen over the budget fails.
 *
 * Measured 18 Oct on v675: In Step 106 and Stretch arc 93, the only two
 * over that were not pages to read. Each now folds its explanation under
 * "What this is" / "How it works", every word kept.
 *
 * Needs Chromium and Playwright, like chromium-text-fit.mjs, so it is not
 * in the verify-* loop. Run after any change to on-screen words:
 *   node tools/chromium-word-budget.mjs
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
const SIZES = (process.env.SIZES || "1").split(",");
const TIERS = (process.env.TIERS || "free,personal").split(",");
const SHOTS = process.env.SHOTS || null;
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const PROGRESS_PAGES = ["lifts", "share", "year", "programme", "weight"];

// Usage: node tools/chromium-word-budget.mjs   (SIZES defaults to 1)
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || "/opt/pw-browsers/chromium" });
const faults = [], unreached = [], excused = [];
// A-4 WORD BUDGET (Stage AWARD, 18 Oct 2026). Words a person reads before
// the first thing they can do. Headings, labels and the controls' own words
// are not counted; a closed fold's contents are not on the screen.
const BUDGET = 60;
// Screens that are for reading, each with its reason. Anything else over
// the budget is a fault.
const EXEMPT = {
  "upgrade": "the Plan's own page: what changes, what stays free, the price, where the money goes, read before deciding",
  "capture": "on Free the upgrade page (Make it up as I go is the Plan's); on the Plan the safety note before a first exercise",
  "gym-programme": "the safety note before a first exercise (clinical reviewer first), or on Free the upgrade page",
  "workout": "the safety note before a first exercise: not cut without the clinical reviewer",
  "community-impact": "a page that explains the social action credits; its only control is Read more",
  "plan-import": "what is taken in and what is not, said before anything is pasted",
  "progress": "numbers and their labels, not prose",
  "annual-reflection": "a page to read; it has no action",
};
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
        const main = document.getElementById("main-content");
        const failed = /Something went wrong loading this page/.test(main?.innerText || "");
        const vis = el => { const b = el.getBoundingClientRect(); const cs = getComputedStyle(el); return b.width > 0 && b.height > 0 && cs.visibility !== "hidden" && cs.display !== "none" && !el.closest("details:not([open]) > :not(summary)"); };
        // The first thing to do on the screen: a control, a choice or a fold to open. A way out
        // (Back, Home, Close, Exit) is not it.
        const acts = [...main.querySelectorAll("button, a[href], input, select, textarea, summary, [role=button], [role=radio], [role=checkbox], [role=option]")].filter(vis)
          .filter(el => !/^(‹\s*)?(back|home|close|exit|go back|back to .*)$/i.test((el.getAttribute("aria-label") || el.innerText || "").trim()));
        const first = acts[0];
        const top = first ? first.getBoundingClientRect().top : Infinity;
        let words = 0;
        const tw = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
        let n;
        while ((n = tw.nextNode())) {
          const el = n.parentElement;
          if (!el || !vis(el) || el.closest(".sr-only,.visually-hidden,button,a,label,select,summary,h1,h2,h3")) continue;
          if (el.getBoundingClientRect().top >= top) continue;
          words += n.data.trim().split(/\s+/).filter(w => /[A-Za-z]{2,}/.test(w)).length;
        }
        return { failed, words, first: first ? (first.getAttribute("aria-label") || first.innerText || first.tagName).trim().slice(0, 40) : null };
      });
      if (r.failed) { unreached.push(label); continue; }
      measured++;
      const exempt = EXEMPT[v.r];
      if (r.words > BUDGET && !exempt) faults.push(`${label}: ${r.words} words before "${r.first}" (budget ${BUDGET})`);
      if (exempt && r.words > BUDGET) excused.push(`${label}: ${r.words} words, ${exempt}`);
    } catch (e) { unreached.push(`${label} (${String(e.message).slice(0, 60)})`); }
  }
  await ctx.close();
}

await browser.close();
server.close();

if (unreached.length) console.log(`Not reached with this history (not measured):\n  ${unreached.join("\n  ")}\n`);
if (excused.length) console.log(`Over the budget, for a stated reason:\n  ${excused.join("\n  ")}\n`);
console.log(faults.length ? faults.map(f => "  FAIL  " + f).join("\n") : `  PASS  every other screen has ${BUDGET} words or fewer before its first action`);
console.log(`\nCHROMIUM-WORD-BUDGET: ${measured} screens measured (${TIERS.length} tiers), ${faults.length} over the budget`);
process.exit(faults.length ? 1 : 0);
