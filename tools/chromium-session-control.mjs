/**
 * tools/chromium-session-control.mjs
 * 02 Nov 2026 v1
 *
 * P-22 to P-24, the real-browser half of verify-session-control (the Plan):
 * the player's Swap, Do this one later and What's left, the Swap panel with
 * its search, What's left with Add an exercise, How would you like it? with
 * Make it up as I go, a proposal's Swap panel, and Today's plan's swap list
 * with its search. At text size 1, 1.45 and 2, on 390 and 320 px phones,
 * light and dark: no sideways scroll, no word split across lines, one
 * visible h1, every button 44 px or more, and axe-core (WCAG 2.2 AA) at
 * text size 1 when AXE points at axe.min.js.
 *
 * Needs Chromium and Playwright, so it is not in the verify-* loop. From
 * the repository root: AXE=/path/to/axe.min.js node tools/chromium-session-control.mjs
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

// Each screen: [where, presses, a name]. A press is "#id" / a selector, "=selector|text" types into that box, or a path row's value.
const SCREENS = [
  ["player", [], "the player, the three controls"],
  ["player", ["#wo-swap-btn"], "Swap, open"],
  ["player", ["#wo-swap-btn", "=#wo-swap-q|glutes"], "Swap, a search"],
  ["player", ["#wo-swap-btn", "=#wo-swap-q|strengthening"], "Swap, long names"],
  ["player", ["#wo-left-btn"], "What's left"],
  ["player", ["#wo-left-btn", "#wo-add-btn", "=#wo-add-q|squat"], "Add an exercise, a search"],
  ["player", ["#wo-later-btn"], "after Do this one later"],
  ["path", ["gym", "whole"], "How would you like it?"],
  ["feel", ["#path-swap-0"], "a proposal's Swap"],
  ["feel", ["#path-swap-0", "=#path-swp-0-q|neck"], "a proposal's Swap, a search"],
  ["plan", ["[data-swap]"], "Today's plan, a swap list with its search"],
  ["plan", ["[data-swap]", "=.cp-swap input[type=search]|row"], "Today's plan, a search"],
  ["plan", ["[data-swap]", "=.cp-swap input[type=search]|strengthening"], "Today's plan, long names"],
  ["feel", ["#path-swap-0", "=#path-swp-0-q|strengthening"], "a proposal's Swap, long names"],
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
      const { HURT_AND_ACHE_VERSION } = await import("./js/exercise-card.js");
      localStorage.clear(); s.init();
      const at = new Date().toISOString();
      s.set("consent.ageConfirmed", true); s.set("consent.ageCheckedAt", at); s.set("consent.ageVersion", AGE_CHECK_VERSION);
      s.set("consent.given", true); s.set("consent.at", at); s.set("consent.policyVersion", POLICY_VERSION);
      s.set("consent.health", { given: true, at, version: HEALTH_CONSENT_VERSION, withdrawnAt: null });
      s.set("onboardingComplete", true); s.set("name", "Graeme"); s.set("tier", "personal");
      s.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at, textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
      s.set("guidanceShownAt", at);
      const GYM = ["dumbbells-medium", "barbell", "bench-flat", "kettlebell-medium", "band-light", "gym-membership"];
      s.set("gymEquipment", GYM); s.set("homeEquipment", ["band-medium"]); s.set("equipment", GYM); s.set("sessionLocation", "gym");
      const k = new Date().toISOString().split("T")[0];
      s.set("checkinHistory", { [k]: { energy: 6, mood: 6, date: new Date().toDateString() } });
      s.set("lastCheckin", { energy: 6, mood: 6, date: new Date().toDateString(), timestamp: at });
      if (where === "player") {
        const SB = await import("./js/session-builder.js");
        s.set("todayIntensity", "moderate");
        const ex = SB.buildSession({ sessionType: "upper", durationMins: 45, equipmentOverride: GYM }).exercises;
        const sec = e => e.section || e.role || "main";
        s.set("generatedSession", { session: { id: "s" + Math.random(), name: "Upper Body", place: "gym", exercises: [...ex.filter(e => sec(e) === "main"), ...ex.filter(e => sec(e) === "cooldown")] }, builtAt: at, inputs: {} });
        s.set("workoutProgress", null);
      }
      const DP = await import("./js/display-prefs.js"); DP.setDisplayPref("textScale", size); DP.applyDisplayPrefs();
    }, { size, where });
    if (where === "player") { await page.evaluate(() => window.router.navigate("today")); await page.waitForTimeout(150); await page.evaluate(() => window.router.navigate("workout")); }
    else if (where === "feel") await page.evaluate(() => { window.router.pathStart = { door: "feel", feeling: "calm", programmeId: "c3" }; window.router.navigate("path"); });
    else {
      await page.evaluate(() => { window.router.pathStart = { door: "stronger" }; window.router.navigate("path"); });
      if (where === "plan") presses = ["gym", "whole", "coach", "#path-build", ...presses];
    }
    await page.waitForTimeout(500);
    for (const p of presses) {
      const hit = await page.evaluate(v => {
        if (v.startsWith("=")) { const [sel, val] = v.slice(1).split("|"); const el = document.querySelector(sel); if (!el) return false; el.focus(); el.value = val; el.dispatchEvent(new Event("input", { bubbles: true })); return true; }
        const el = /^[#.\[]/.test(v) ? document.querySelector(v) : document.querySelector(`.path-row[data-v="${v}"]`);
        if (el) el.click(); return !!el;
      }, p);
      if (!hit) { faults.push(`${label}: could not press ${p}`); break; }
      await page.waitForTimeout(p === "#path-build" ? 1200 : 200);
    }
    await page.waitForTimeout(350);
    const r = await page.evaluate(() => {
      const W = document.documentElement.clientWidth;
      const wide = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
      const main = document.getElementById("main-content");
      const h1s = [...main.querySelectorAll("h1")].filter(h => !h.closest(".sr-only") && getComputedStyle(h).display !== "none" && h.getClientRects().length).length;
      const small = [];
      for (const el of main.querySelectorAll(".path-row, button, input[type=search], .path-seg label, a.path-mv__yt")) {
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
