/**
 * tools/chromium-p28.mjs
 * 06 Nov 2026 v4
 *
 * v4 - P-28 FINISH: every page error counts again (the getting-started
 *   timer fault it was setting aside is fixed, onboarding/thread.js v29).
 *
 * v3 - S5: the upgrade page's and arc setup's In Step lines.
 *
 * v2 - S4: Outside's three ways, Take three, Guide me before and while it
 *   plays (the Plan's), and a hold's line with the voice on (both tiers).
 *
 * P-28 EMPATHY-THREAD, the real-browser half of its gates. jsdom draws no
 * layout, so verify-p28-instep holds the behaviour and this measures what a
 * person sees on every P-28 screen a route alone does not reach: In Step's
 * list and each step of an episode, and both finishes with In Step's offer,
 * its line and the reflection in In Step's look.
 *
 * On a 412px phone, both tiers, text 1, 1.45 and 2, and at text 1 each
 * colour scheme (dark, light, high contrast):
 *   1. nothing wider than the phone, and no word split across lines;
 *   2. scrolled to the bottom, nothing under the bottom bar (or below the
 *      screen when the bar is hidden);
 *   3. one visible h1;
 *   4. axe-core, WCAG 2.2 AA, at text 1 in every scheme, when AXE points at
 *      axe.min.js.
 * Needs Chromium and Playwright, so it is not in the verify-* loop. From the
 * repository root:
 *   AXE=/path/to/axe.min.js node tools/chromium-p28.mjs
 * Optional: SIZES=1  TIERS=free  SHOTS=dir. Exits 1 on any fault; a screen
 * that could not be reached is a fault, never skipped.
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
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json" };
const server = createServer((req, res) => {
  const p = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  const f = join(ROOT, p === "/" ? "index.html" : p);
  if (!existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" });
  res.end(readFileSync(f));
});
await new Promise(r => server.listen(0, "127.0.0.1", r));
const BASE = `http://127.0.0.1:${server.address().port}/index.html`;
const SIZES = (process.env.SIZES || "1,1.45,2").split(",");
const TIERS = (process.env.TIERS || "free,personal").split(",");
const SCHEMES = ["dark", "light", "high-contrast"];
const AXE = process.env.AXE && existsSync(process.env.AXE) ? readFileSync(process.env.AXE, "utf8") : null;
const SHOTS = process.env.SHOTS || null;
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const faults = [];
let measured = 0;

// Each screen: how to reach it from a fresh person, in the page.
const SCREENS = [
  ["Wellbeing", async p => { await nav(p, "noticing"); }, "#noticing-in-step-btn.k-orchid"],
  ["In Step: the list", async p => { await setProg(p, { part: 2, episode: 3, done: ["p1e1", "p1e2", "p1e3", "p1e4", "p1e5", "p1e6", "p2e1", "p2e2"], lastCarry: "p2e2", lastAnswer: null }); await nav(p, "in-step"); }, ".instep-next"],
  ["In Step: Before we start", async p => { await click(p, ".instep-next"); }, "[data-answer]"],
  ["In Step: Listen", async p => { await click(p, '[data-answer="did"]'); }, ".instep-said"],
  ["In Step: Hold still", async p => { await click(p, "#is-next"); }, "#is-hold-go"],
  ["In Step: holding", async p => { await click(p, "#is-hold-go"); }, ".instep-ring"],
  ["In Step: Choose", async p => { await p.evaluate(() => window.router.navigate("in-step")); await p.waitForTimeout(300); await click(p, ".instep-next"); await click(p, "#is-next"); await click(p, "#is-skip-hold"); await p.evaluate(() => { const r = document.querySelector('input[name="is-opt"]'); r.checked = true; r.dispatchEvent(new Event("change", { bubbles: true })); }); }, "#is-ack"],
  ["In Step: Carry it, end of a part", async p => { await setProg(p, { part: 3, episode: 6, done: [], lastCarry: "p3e5", lastAnswer: "did" }); await nav(p, "in-step"); await click(p, ".instep-next"); await click(p, "#is-next"); await click(p, "#is-skip-hold"); await click(p, "#is-next"); }, ".instep-closing"],
  ["A finish, with In Step's offer", async p => { await finish(p, { offered: false, logLen: 8 }); }, ".instep-offer"],
  ["A finish, with In Step's line", async p => { await finish(p, { offered: true, logLen: 8 }); }, ".instep-bline"],
  ["A finish's reflection, in In Step's look", async p => { await finish(p, { offered: true, logLen: 9, prompt: true }); await click(p, (await p.evaluate(() => window.store.get("tier"))) === "free" ? "#reflect-done-btn" : "#pf-done"); }, ".instep-prompt"],
  // S4 (the door's steps are the Plan's; holds are both tiers).
  ["Outside › Walk: three ways", async p => { await door(p, "walk"); }, '.path-row[data-v="guide:weather"]', true],
  ["Outside › Bike ride: indoors only", async p => { await door(p, "bike"); }, "#path-road", true],
  ["Take three with you", async p => { await door(p, "walk"); await click(p, '.path-row[data-v="three"]'); }, ".path-three", true],
  ["Guide me: what will happen", async p => { await door(p, "run"); await click(p, '.path-row[data-v="guide:run"]'); await p.waitForTimeout(300); }, "#gm-start", true],
  ["Guide me: guiding", async p => { await click(p, "#gm-start"); await p.waitForTimeout(400); }, "#gm-pp", true],
  ["While you hold, the voice on", async p => { await hold(p); }, "#hv-card"],
  // S5: the E lines.
  ["The upgrade page's In Step line", async p => { await nav(p, "upgrade"); }, "#upg-instep", "free"],
  ["Arc setup's In Step line", async p => { await nav(p, "arc-setup"); }, "#as-instep", true],
];
async function door(p, activity) {
  await p.evaluate(() => { window.router.pathStart = { door: "moving" }; });
  await nav(p, "path"); await click(p, '.path-row[data-v="outside"]'); await click(p, `.path-row[data-v="${activity}"]`);
}
async function hold(p) {
  await p.evaluate(() => {
    const s = window.store; s.set("coachVoice", "on");
    s.set("generatedSession", { session: { id: "h", name: "Core", exercises: [{ id: "plank", name: "Plank", category: "strength", position: "floor", duration: 45, sets: 1, section: "main", role: "main", equipment: [], instructions: ["Hold"], watchOut: ["Sagging"] }] }, builtAt: new Date().toISOString(), inputs: {} });
  });
  await nav(p, "workout");
  for (let i = 0; i < 4; i++) { if (await p.evaluate(() => !!document.querySelector("#timer-toggle-btn"))) break; await p.evaluate(() => document.querySelector('[data-step-go="capture"]:not([aria-current]), [data-step-go="do"]:not([aria-current])')?.click()); await p.waitForTimeout(200); }
  await click(p, "#timer-toggle-btn"); await p.waitForTimeout(400);
}

async function nav(p, r) { await p.evaluate(r => window.router.navigate(r), r); await p.waitForTimeout(400); }
async function click(p, sel) {
  const ok = await p.evaluate(sel => { const el = document.querySelector(sel); if (el) el.click(); return !!el; }, sel);
  if (!ok) throw new Error(`could not reach ${sel}`);
  await p.waitForTimeout(250);
}
async function setProg(p, prog) {
  await p.evaluate(prog => { const isp = window.store.get("inStepProgress") || {}; window.store.set("inStepProgress", { ...isp, programme: { part: 1, episode: 1, done: [], lastCarry: null, lastAnswer: null, offeredAt: null, offeredSession: 0, ...prog } }); }, prog);
}
async function finish(p, { offered, logLen, prompt = false }) {
  await p.evaluate(({ offered, logLen, prompt }) => {
    const s = window.store, now = new Date();
    s.set("activityLog", Array.from({ length: logLen }, (_, i) => ({ id: "f" + i, type: "workout", status: "completed", completedAt: new Date(Date.now() - (i + 1) * 86400000).toISOString() })));
    const isp = s.get("inStepProgress") || {};
    s.set("inStepProgress", { ...isp, programme: { part: 1, episode: 2, done: ["p1e1"], lastCarry: "p1e1", lastAnswer: null, offeredAt: offered ? now.toISOString() : null, offeredSession: offered ? logLen : 0 } });
    s.set("lastEmpathyPromptSession", prompt ? 0 : logLen); s.set("lastEmpathyPromptAt", prompt ? new Date(Date.now() - 30 * 86400000).toISOString() : now.toISOString());
    s.set("currentActivityEntry", { id: "now" + Math.random(), type: "workout", status: "completed", name: "Upper body", completedAt: now.toISOString(), exerciseIds: [] });
  }, { offered, logLen, prompt });
  await nav(p, (await p.evaluate(() => window.store.get("tier"))) === "free" ? "reflect" : "plan-finish");
}

async function measure(page, label, { axe }) {
  const r = await page.evaluate(() => {
    const main = document.getElementById("main-content");
    const W = document.documentElement.clientWidth;
    const wide = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    const split = [];
    const tw = document.createTreeWalker(main, NodeFilter.SHOW_TEXT); let n;
    while ((n = tw.nextNode())) {
      const el = n.parentElement; if (!el || el.closest(".sr-only,.visually-hidden,textarea,[hidden]")) continue;
      const cs = getComputedStyle(el); if (cs.display === "none" || cs.visibility === "hidden") continue;
      const re = /[A-Za-z0-9’']{2,}/g; let m;
      while ((m = re.exec(n.data))) {
        const range = document.createRange(); range.setStart(n, m.index); range.setEnd(n, m.index + m[0].length);
        if (new Set([...range.getClientRects()].filter(q => q.width > 0).map(q => Math.round(q.top))).size > 1) split.push(m[0]);
      }
    }
    return { W, wide, split: [...new Set(split)].slice(0, 6) };
  });
  const u = await page.evaluate(async () => {
    const main = document.getElementById("main-content");
    document.documentElement.style.scrollBehavior = "auto"; document.body.style.scrollBehavior = "auto";
    await new Promise(r => setTimeout(r, 300));
    document.scrollingElement.scrollTop = 1e6;
    document.querySelectorAll("*").forEach(e => { e.style.scrollBehavior = "auto"; if (e.scrollHeight > e.clientHeight + 2 && /(auto|scroll)/.test(getComputedStyle(e).overflowY)) e.scrollTop = 1e6; });
    await new Promise(r => setTimeout(r, 300));
    const nav = document.getElementById("bottom-nav");
    const navOn = nav && getComputedStyle(nav).display !== "none" && nav.getBoundingClientRect().height > 0;
    const top = navOn ? nav.getBoundingClientRect().top : innerHeight;
    const vis = el => { const b = el.getBoundingClientRect(); const cs = getComputedStyle(el); return b.width > 0 && b.height > 0 && cs.display !== "none" && cs.visibility !== "hidden" && !el.closest("[hidden],[inert],.sr-only,.visually-hidden,#bottom-nav,details:not([open]) > :not(summary)"); };
    const els = [...main.querySelectorAll("button, a[href], input, select, textarea, [role=button]")].filter(vis);
    const under = els.filter(el => el.getBoundingClientRect().bottom - top > 0.5).map(el => (el.innerText || el.getAttribute("aria-label") || el.tagName).trim().replace(/\s+/g, " ").slice(0, 24));
    const h1 = [...main.querySelectorAll("h1")].filter(h => !h.parentElement?.closest(".sr-only,[hidden]") && (h.classList.contains("sr-only") || vis(h))).length;
    return { under: under.slice(0, 3), h1, empty: !(main.innerText || "").trim() };
  });
  Object.assign(r, u);
  measured++;
  if (r.empty) faults.push(`${label}: nothing on screen`);
  if (r.wide > r.W + 1) faults.push(`${label}: ${r.wide}px wide on a ${r.W}px phone`);
  if (r.split.length) faults.push(`${label}: splits ${r.split.join(", ")}`);
  if (r.under.length) faults.push(`${label}: under the bar: ${r.under.join(" | ")}`);
  if (r.h1 !== 1) faults.push(`${label}: ${r.h1} visible h1`);
  if (axe && AXE) {
    await page.addScriptTag({ content: AXE });
    const v = await page.evaluate(async () => (await window.axe.run(document.getElementById("main-content"), { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } })).violations.map(x => `${x.id} (${x.nodes.length}): ${x.nodes[0]?.target?.join(" ")}`));
    for (const x of v) faults.push(`${label}: axe ${x}`);
  }
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/${label.replace(/[^a-z0-9.-]+/gi, "_")}.png`, fullPage: true });
}

const runs = [];
for (const tier of TIERS) {
  for (const size of SIZES) runs.push({ tier, size, scheme: "dark" });
  if (SIZES.includes("1")) for (const scheme of ["light", "high-contrast"]) runs.push({ tier, size: "1", scheme });
}
for (const { tier, size, scheme } of runs) {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, serviceWorkers: "block" });
  const page = await ctx.newPage();
  await page.goto(BASE); await page.waitForTimeout(1200);
  await page.evaluate(async ({ tier, size, scheme }) => {
    const s = window.store;
    const { POLICY_VERSION } = await import("./js/data/consent-version.js");
    const { AGE_CHECK_VERSION } = await import("./js/data/age-check.js");
    const { HEALTH_CONSENT_VERSION } = await import("./js/data/health-consent.js");
    const at = new Date().toISOString();
    s.set("consent.ageConfirmed", true); s.set("consent.ageCheckedAt", at); s.set("consent.ageVersion", AGE_CHECK_VERSION);
    s.set("consent.given", true); s.set("consent.at", at); s.set("consent.policyVersion", POLICY_VERSION);
    s.set("consent.health", { given: true, at, version: HEALTH_CONSENT_VERSION, withdrawnAt: null });
    s.set("onboardingComplete", true); s.set("name", "Graeme"); s.set("tier", tier);
    s.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at, textVersion: "2026-09-06.1", surface: "fixture" })));
    const key = new Date().toISOString().split("T")[0];
    s.set("checkinHistory", { [key]: { energy: 7, mood: 6 } }); s.set("lastCheckin", { energy: 7, mood: 6, date: new Date().toDateString(), timestamp: at });
    const DP = await import("./js/display-prefs.js");
    DP.setDisplayPref("textScale", size);
    DP.setDisplayPref("scheme", scheme);
    DP.applyDisplayPrefs();
  }, { tier, size, scheme });
  // Errors count from here: the harness's first load starts onboarding, which this leaves.
  page.on("pageerror", e => faults.push(`${tier} ${size} ${scheme}: page error ${String(e.message).slice(0, 90)} ${String(e.stack || "").split("\n").slice(1, 3).join(" ").slice(0, 160)}`));
  for (const [name, go, expect, planOnly] of SCREENS) {
    if (planOnly === true && tier !== "personal") continue;
    if (planOnly === "free" && tier !== "free") continue;   // the upgrade page is Free's
    const label = `${tier.padEnd(8)} text ${size.padEnd(4)} ${scheme.padEnd(13)} ${name}`;
    try {
      await go(page);
      if (expect && !(await page.evaluate(sel => !!document.querySelector("#main-content " + sel), expect))) throw new Error(`${expect} is not on the screen`);
      await measure(page, label, { axe: size === "1" });
    }
    catch (e) { faults.push(`${label}: not reached (${String(e.message).slice(0, 70)})`); }
  }
  await ctx.close();
}
await browser.close(); server.close();
console.log(`${measured} screen views measured${AXE ? ", axe at text 1 in each scheme" : " (no AXE: axe not run)"}`);
console.log(faults.length ? faults.map(f => "  FAIL  " + f).join("\n") : "  PASS  every P-28 screen fits, nothing under the bar, one heading" + (AXE ? ", axe clean" : ""));
process.exit(faults.length ? 1 : 0);
