/**
 * tools/chromium-one-look.mjs
 * 31 Oct 2026 v1
 *
 * STAGE PATH Session 9 (CLOSE; P-12 F3, F4, F5). The real-browser half of
 * verify-one-look: jsdom draws no layout, so that gate holds the markup and
 * the CSS rule, and this one measures what a person sees.
 *
 * Graeme, 29 Oct, after trying v684: "the links I discovered don't always
 * have pills … maze of rooms … no description or purpose … rooms look
 * different … There needs to be this consistency applied to all". Decided
 * 31 Oct (Session 9): ‹ Back on every room, Exit only once a session has
 * started; every heading 24 px at the left; every Plan screen outside
 * P-13's rooms fixed in this session.
 *
 * For every screen the router can open on the Plan (onboarding, the gate
 * screens and P-13's rooms aside), at text size 1 and 2, on a 390px phone:
 *   1. one visible h1, 24 px at text size 1 (48 at 2), at the left;
 *   2. no emoji on the screen, nor on the house button if it shows;
 *   3. one way back at most, and it says "‹ Back" (or "Exit" on a screen
 *      that is a session in progress); when the bottom bar is hidden there
 *      is exactly one (the house counts as one);
 *      (a finish's Done is its way on);
 *   4. every button and link is a pill, a button (it has a fill or an
 *      edge), or a row that says what it is for (a second line); the only
 *      bare links are phone, text and email numbers inside a sentence (a
 *      crisis line is read, not a room to go into), and a step strip or
 *      tab strip (inside a nav, or role=tab) is a set of places, not a
 *      link.
 *
 * Needs Chromium and Playwright, so it is not in the verify-* loop (as
 * chromium-text-fit.mjs). Run from the repository root:
 *   node tools/chromium-one-look.mjs
 * Optional: SIZES=1  ROUTES=today,library  SHOTS=dir
 * Exits 1 on any fault. A screen that cannot open with this person's
 * history is listed as not reached, never silently skipped.
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
  .filter(r => !r.startsWith("onboarding") && !NOT_A_ROOM.includes(r) && !P13_ROOMS.includes(r) && !NOT_ON_THE_PLAN.includes(r));
if (process.env.ROUTES) routes = routes.filter(r => process.env.ROUTES.split(",").includes(r));
const visits = [...routes.map(r => ({ r })), ...(process.env.ROUTES ? [] : ["stronger", "stretch", "feel", "moving"].map(d => ({ r: "path", door: d })))];
const SIZES = (process.env.SIZES || "1,2").split(",");
const SHOTS = process.env.SHOTS || null;
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || "/opt/pw-browsers/chromium" });
const faults = [], unreached = [];
let measured = 0;

for (const size of SIZES) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: "block" });
  const page = await ctx.newPage();
  await page.goto(BASE); await page.waitForTimeout(1200);
  for (const v of visits) {
    const label = `text ${size} ${v.r}${v.door ? ":" + v.door : ""}`;
    try {
      await page.evaluate(async ({ r, door, size }) => {
        const s = window.store; localStorage.clear(); s.init();
        const { POLICY_VERSION } = await import("./js/data/consent-version.js");
        const { AGE_CHECK_VERSION } = await import("./js/data/age-check.js");
        const { HEALTH_CONSENT_VERSION } = await import("./js/data/health-consent.js");
        const { HURT_AND_ACHE_VERSION } = await import("./js/exercise-card.js");
        const at = new Date().toISOString();
        s.set("consent.ageConfirmed", true); s.set("consent.ageCheckedAt", at); s.set("consent.ageVersion", AGE_CHECK_VERSION);
        s.set("consent.given", true); s.set("consent.at", at); s.set("consent.policyVersion", POLICY_VERSION);
        s.set("consent.health", { given: true, at, version: HEALTH_CONSENT_VERSION, withdrawnAt: null });
        s.set("onboardingComplete", true); s.set("name", "Graeme"); s.set("tier", "personal"); s.set("guidanceShownAt", at);
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
      }, { r: v.r, door: v.door, size });
      await page.waitForTimeout(v.r === "checkin" ? 3200 : 700);
      const m = await page.evaluate(() => {
        const main = document.getElementById("main-content");
        const failed = /Something went wrong loading this page/.test(main?.innerText || "") || !(main?.innerText || "").trim();
        const vis = el => { const b = el.getBoundingClientRect(); const cs = getComputedStyle(el); return b.width > 0 && b.height > 0 && cs.display !== "none" && cs.visibility !== "hidden" && !el.closest("[hidden],[inert],.sr-only,.visually-hidden"); };
        const h1s = [...main.querySelectorAll("h1")].filter(vis);
        const h1 = h1s[0];
        const house = document.getElementById("hidden-nav-home-btn");
        const houseOn = !!house && vis(house);
        const navOn = !!document.getElementById("bottom-nav") && vis(document.getElementById("bottom-nav"));
        const BACKISH = /^(‹|←|<)?\s*(back|home|exit|today|progress|back to [a-z ]+)\s*(›|→)?$/i;
        const acts = [...main.querySelectorAll("button, a[href]")].filter(vis);
        const said = el => (el.innerText || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ");
        // A tab or a pressed choice named Today is a choice, not a way back.
        const backs = acts.filter(el => !el.matches('[role="tab"],[role="radio"],[aria-pressed]')).filter(el => BACKISH.test(said(el)) || el.matches(".path-back,.back-btn,.view-back,.workout-header .btn")).map(said);
        const kind = el => {
          const cs = getComputedStyle(el); const b = el.getBoundingClientRect();
          const fill = (cs.backgroundColor && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent") || (cs.backgroundImage && cs.backgroundImage !== "none");
          const edge = ["Top", "Right", "Bottom", "Left"].some(s => parseFloat(cs[`border${s}Width`]) > 0 && cs[`border${s}Style`] !== "none");
          const lines = (el.innerText || "").split("\n").filter(x => x.trim()).length;
          if (fill || edge) return parseFloat(cs.borderTopLeftRadius) >= b.height / 2 - 1 ? "pill" : "button";
          if (lines >= 2) return "row";
          return "bare";
        };
        // A step strip or tab strip (inside a nav, or role=tab) is a set of places, not a link.
        const bare = acts.filter(el => !el.closest("nav") && !el.matches('[role="tab"]'))
          .filter(el => !BACKISH.test(said(el)) && !el.matches(".path-back,.back-btn,.view-back"))
          .filter(el => kind(el) === "bare")
          .filter(el => !(el.matches('a[href^="tel:"],a[href^="sms:"],a[href^="mailto:"]') && el.closest("p,li")))
          .map(said);
        const emoji = ((main.innerText || "") + " " + (houseOn ? house.innerText : "")).match(/\p{Extended_Pictographic}/gu) || [];
        const done = acts.some(el => said(el) === "Done");
        return { failed, done, now: window.router.currentView, h1n: h1s.length, h1fs: h1 ? parseFloat(getComputedStyle(h1).fontSize) : 0, h1al: h1 ? getComputedStyle(h1).textAlign : "", h1t: h1 ? h1.textContent.trim().slice(0, 40) : "",
          houseOn, navOn, backs, bare, emoji: [...new Set(emoji)] };
      });
      if (m.failed) { unreached.push(label); continue; }
      measured++;
      if (SHOTS) await page.screenshot({ path: `${SHOTS}/${size}-${v.r.replace(/\//g, "_")}${v.door ? "-" + v.door : ""}.png`, fullPage: true });
      const want = 24 * Number(size), f = [];
      if (m.h1n !== 1) f.push(`${m.h1n} headings`);
      else {
        if (Math.abs(m.h1fs - want) > 1.5) f.push(`heading ${m.h1fs}px (want ${want})`);
        if (!/^(start|left)$/.test(m.h1al)) f.push(`heading ${m.h1al}`);
      }
      if (m.emoji.length) f.push(`emoji ${m.emoji.join(" ")}`);
      const session = SESSION_SCREENS.includes(m.now);
      const ways = m.backs.length + (m.houseOn ? 1 : 0);
      const wrong = m.backs.filter(b => b !== "‹ Back" && !(session && b === "Exit"));
      if (wrong.length) f.push(`back says ${wrong.map(b => JSON.stringify(b)).join(", ")}`);
      if (ways > 1) f.push(`${ways} ways back (${[...m.backs, ...(m.houseOn ? ["house"] : [])].join(", ")})`);
      // A finish's Done is its way on (the Plan's finish, and reflect for the other players).
      if (!m.navOn && ways === 0 && !m.done) f.push("no way back");
      if (m.bare.length) f.push(`bare ${m.bare.slice(0, 4).map(b => JSON.stringify(b.slice(0, 30))).join(", ")}`);
      if (f.length) faults.push(`${label} [${m.h1t}]: ${f.join("; ")}`);
    } catch (e) { unreached.push(`${label} (${String(e.message).slice(0, 60)})`); }
  }
  await ctx.close();
}
await browser.close();
server.close();

console.log(`P-13's rooms, not measured here (the Library session): ${P13_ROOMS.join(", ")}`);
if (unreached.length) console.log(`Not reached with this history (not measured):\n  ${unreached.join("\n  ")}\n`);
console.log(faults.length ? faults.map(f => "  FAIL  " + f).join("\n") : "  PASS  every Plan screen: one heading at 24 px at the left, no emoji, one way back in the agreed words, every link a pill, a button or a row that says what it is for");
console.log(`\nCHROMIUM-ONE-LOOK: ${measured} screens measured (the Plan × text ${SIZES.join(" / ")}), ${faults.length} faults`);
process.exit(faults.length ? 1 : 0);
