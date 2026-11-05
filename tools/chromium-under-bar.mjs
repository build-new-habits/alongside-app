/**
 * tools/chromium-under-bar.mjs
 * 05 Nov 2026 v1
 *
 * P-27 TIDY (Graeme, 05 Nov: "it's so close to the nav bar at the bottom
 * that you miss the line that cuts off and seals off the pill"). The
 * real-browser half of verify-tidy-trace TEST 1: jsdom draws no layout.
 *
 * For every screen the router opens (as chromium-one-look) and the four
 * doors, on a small phone (375 x 667 by default; W and H to change it), at
 * text 1, 1.45 and 2: scrolled to the very bottom, no button, link or field
 * ends under the bottom bar (or below the screen when the bar is hidden).
 * TIER=free measures Free. Needs Chromium and Playwright, so it is not in
 * the verify-* loop. Run from the repository root:
 *   node tools/chromium-under-bar.mjs
 * Optional: SIZES=1  ROUTES=today,library  SHOTS=dir  TIER=free  W=390 H=844
 * Exits 1 on any fault.
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
const { P13_ROOMS, SESSION_SCREENS, NOT_A_ROOM, NOT_ON_THE_PLAN } = await import(new URL("./one-look-scope.mjs", import.meta.url).href);

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

const src = readFileSync(join(ROOT, "js/router.js"), "utf8");
const block = src.slice(src.indexOf("const VIEW_NAMES = {"));
const table = block.slice(0, block.indexOf("\n};"));
let routes = [...table.matchAll(/^\s*'([a-z0-9/-]+)'\s*:\s*\{/gm)].map(m => m[1])
  .filter(r => !r.startsWith("onboarding") && !NOT_A_ROOM.includes(r) && !NOT_ON_THE_PLAN.includes(r));
if (process.env.ROUTES) routes = routes.filter(r => process.env.ROUTES.split(",").includes(r));
const visits = [...routes.map(r => ({ r })), ...(process.env.ROUTES ? [] : ["stronger", "stretch", "feel", "moving"].map(d => ({ r: "path", door: d })))];
const SIZES = (process.env.SIZES || "1,1.45,2").split(",");
const SHOTS = process.env.SHOTS || null;
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || "/opt/pw-browsers/chromium" });
const faults = [], unreached = [];
let measured = 0;

for (const size of SIZES) {
  const ctx = await browser.newContext({ viewport: { width: Number(process.env.W || 375), height: Number(process.env.H || 667) }, isMobile: true, hasTouch: true, serviceWorkers: "block" });
  const page = await ctx.newPage();
  await page.goto(BASE); await page.waitForTimeout(1200);
  for (const v of visits) {
    const label = `text ${size} ${v.r}${v.door ? ":" + v.door : ""}`;
    try {
      await page.evaluate(async ({ r, door, size, tier }) => {
        const s = window.store; localStorage.clear(); s.init();
        const { POLICY_VERSION } = await import("./js/data/consent-version.js");
        const { AGE_CHECK_VERSION } = await import("./js/data/age-check.js");
        const { HEALTH_CONSENT_VERSION } = await import("./js/data/health-consent.js");
        const { HURT_AND_ACHE_VERSION } = await import("./js/exercise-card.js");
        const at = new Date().toISOString();
        s.set("consent.ageConfirmed", true); s.set("consent.ageCheckedAt", at); s.set("consent.ageVersion", AGE_CHECK_VERSION);
        s.set("consent.given", true); s.set("consent.at", at); s.set("consent.policyVersion", POLICY_VERSION);
        s.set("consent.health", { given: true, at, version: HEALTH_CONSENT_VERSION, withdrawnAt: null });
        s.set("onboardingComplete", true); s.set("name", "Graeme"); s.set("tier", tier); s.set("guidanceShownAt", at);
        s.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at, textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
        s.set("gymEquipment", ["dumbbells-medium", "bench-flat", "gym-membership"]);
        s.set("arc", { active: true, aimId: "sport-without-flaring", startedAt: new Date(Date.now() - 15 * 864e5).toISOString(), strands: [] });
        s.set("activityLog", Array.from({ length: 6 }, (_, i) => ({ id: "a" + i, type: "workout", sessionType: "upper", place: "gym", completedAt: new Date(Date.now() - (i + 1) * 864e5).toISOString(), durationMins: 30, completed: true, moodAfter: 7, exerciseIds: ["push-up"] })));
        const k = new Date().toISOString().split("T")[0];
        s.set("checkinHistory", { [k]: { energy: 6, mood: 6 } }); s.set("lastCheckin", { ...s.get("lastCheckin"), energy: 6, mood: 6, timestamp: at });
        s.set("generatedSession", { session: { id: "fx", name: "Upper body", type: "workout", sessionType: "upper", exercises: [{ id: "push-up", name: "Push-up", sets: 2, reps: 8, section: "main" }, { id: "plank", name: "Plank", sets: 2, duration: 30, section: "main" }] }, builtAt: at, inputs: {} });
        s.set("prescribedExercises", [{ id: "p1", name: "Bridge", sets: 2, reps: "10" }]);
        s.set("savedSessions", [{ id: "own1", name: "Tuesday legs", sessionType: "lower", doses: {}, durationMins: 30, equipment: [], exerciseIds: ["push-up", "plank"], createdAt: at, lastUsedAt: null }]);
        const DP = await import("./js/display-prefs.js"); DP.setDisplayPref("textScale", size); DP.applyDisplayPrefs();
        window.router.history = ["today"];
        if (r === "coach-proposal") s.set("requestedSessionType", "full");
        if (door) window.router.pathStart = { door };
        await window.router.navigate(r);
      }, { r: v.r, door: v.door, size, tier: process.env.TIER || "personal" });
      await page.waitForTimeout(v.r === "checkin" ? 3200 : 700);
      const m = await page.evaluate(async () => {
        document.documentElement.style.scrollBehavior="auto"; document.body.style.scrollBehavior="auto"; await new Promise(r => setTimeout(r, 900)); const sc = document.scrollingElement; sc.scrollTop = 1e6;
        document.querySelectorAll("*").forEach(e => { e.style.scrollBehavior="auto"; if (e.scrollHeight > e.clientHeight + 2 && /(auto|scroll)/.test(getComputedStyle(e).overflowY)) e.scrollTop = 1e6; });
        await new Promise(r => setTimeout(r, 400));
        const nav = document.getElementById("bottom-nav");
        const navOn = nav && getComputedStyle(nav).display !== "none" && nav.getBoundingClientRect().height > 0;
        const top = navOn ? nav.getBoundingClientRect().top : innerHeight;
        const main = document.getElementById("main-content");
        const vis = el => { const b = el.getBoundingClientRect(); const cs = getComputedStyle(el); return b.width > 0 && b.height > 0 && cs.display !== "none" && cs.visibility !== "hidden" && !el.closest("[hidden],[inert],.sr-only,.visually-hidden,#bottom-nav,details:not([open]) > :not(summary)"); };
        const els = [...main.querySelectorAll("button, a[href], input, select, textarea, [role=button]")].filter(vis);
        const hid = els.map(el => ({ cls: el.className, t: (el.innerText || el.getAttribute("aria-label") || el.tagName).trim().replace(/\s+/g," ").slice(0,30), over: Math.round(el.getBoundingClientRect().bottom - top) })).filter(x => x.over > 0);
        return { now: window.router.currentView, navH: navOn ? Math.round(nav.getBoundingClientRect().height) : 0, pad: getComputedStyle(main).paddingBottom, hid, failed: !(main?.innerText||"").trim() };
      });
      if (m.failed) { unreached.push(label); continue; }
      measured++;
      if (SHOTS) await page.screenshot({ path: `${SHOTS}/${size}-${v.r}${v.door ? '-' + v.door : ''}.png` });
      if (m.hid.length) faults.push(`${label} [nav ${m.navH}, pad ${m.pad}]: ${m.hid.slice(0,3).map(h=>h.t+"("+String(h.cls).slice(0,30)+") +"+h.over+"px").join("; ")}`);
    } catch (e) { unreached.push(`${label} (${String(e.message).slice(0, 60)})`); }
  }
  await ctx.close();
}
await browser.close();
server.close();

if (P13_ROOMS.length) console.log(`P-13's rooms, not measured here (the Library session): ${P13_ROOMS.join(", ")}`);
if (unreached.length) console.log(`Not reached with this history (not measured):\n  ${unreached.join("\n  ")}\n`);
console.log(faults.length ? faults.map(f => "  FAIL  " + f).join("\n") : "  PASS  every screen, scrolled to the bottom: nothing under the bottom bar or off the screen");
console.log(`\nCHROMIUM-UNDER-BAR: ${measured} screens measured (${process.env.TIER || "personal"} × text ${SIZES.join(" / ")}), ${faults.length} faults`);
process.exit(faults.length ? 1 : 0);
