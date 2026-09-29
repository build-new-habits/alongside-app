/**
 * tools/chromium-sheets.mjs
 * 29 Sep 2026 v1
 *
 * P1, REDUCED-MOTION-SHEET. The real-browser half of verify-sheet-close:
 * in Chromium at phone size, with motion reduced and with motion normal,
 * and with the app's own Display › Reduce motion switch on, every bottom sheet (goals, sore areas, equipment, plan) opens with its
 * view in it and finishes closing, and Settings › Equipment opens and
 * closes through the real buttons.
 *
 * Not a verify-* gate: it needs Chromium, which a fresh session may not
 * have. Run it when the sheet code changes; its result is recorded in the
 * master schedule.
 *
 * Setup:  npm i playwright-core (or a global playwright); Chromium at
 *         /opt/pw-browsers/chromium; serve the repo on :8765
 *         (python3 -m http.server 8765 from the repo root).
 * Run:    node tools/chromium-sheets.mjs
 * Stop the server ONLY with: pkill -f "^python3 -m http.server 8765"
 */
import { createRequire } from "node:module";
const require = createRequire(process.env.NODE_PATH ? process.env.NODE_PATH + "/" : import.meta.url);
let chromium;
try { ({ chromium } = require("playwright-core")); } catch { ({ chromium } = require("playwright")); }

const b = await chromium.launch({ executablePath: process.env.CHROMIUM || "/opt/pw-browsers/chromium" });
let fails = 0;
const ok = (n, c, d = "") => { console.log(`  ${c ? "PASS" : "FAIL"}  ${n}`); if (!c) { fails++; if (d) console.log("        " + d); } };

for (const motion of ["reduce", "no-preference", "in-app switch"]) {
  console.log(`\nMotion: ${motion}`);
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: "block", reducedMotion: motion === "reduce" ? "reduce" : "no-preference" });
  const page = await ctx.newPage();
  const errs = []; page.on("pageerror", e => errs.push(e.message));
  await page.goto("http://localhost:8765/index.html"); await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const s = window.store; s.set("onboardingComplete", true); s.set("name", "T"); s.set("tier", "personal");
  });
  if (motion === "in-app switch") await page.evaluate(async () => { const DP = await import("./js/display-prefs.js"); DP.setDisplayPref("reduceMotion", "on"); DP.applyDisplayPrefs(); });
  const duration = await page.evaluate(async () => {
    const SM = await import("./js/views/onboarding/sheet-manager.js");
    await SM.openSheet("onboarding/goals", () => {}); await new Promise(r => setTimeout(r, 400));
    const d = getComputedStyle(document.querySelector(".sheet-panel")).transitionDuration;
    SM.closeSheet(true); await new Promise(r => setTimeout(r, 900));
    return d;
  });
  console.log(`  (panel transition: ${duration})`);
  for (const view of ["onboarding/goals", "onboarding/conditions", "onboarding/equipment", "onboarding/plan-select"]) {
    const r = await page.evaluate(async view => {
      const SM = await import("./js/views/onboarding/sheet-manager.js");
      const calls = [];
      await SM.openSheet(view, x => calls.push(x)); await new Promise(r => setTimeout(r, 400));
      const panel = document.querySelector(".sheet-panel"), content = document.querySelector(".sheet-content");
      const opened = panel.classList.contains("is-open") && content.children.length > 0;
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      await new Promise(r => setTimeout(r, 800));
      return { opened, calls: calls.length, empty: content.innerHTML === "", closed: !panel.classList.contains("is-open") };
    }, view);
    ok(`${view}: opens, and closes by Escape`, r.opened && r.calls === 1 && r.empty && r.closed, JSON.stringify(r));
  }
  // Settings › Equipment through the real buttons.
  await page.evaluate(() => window.router.navigate("settings")); await page.waitForTimeout(800);
  await page.click('[data-open="equipment"]'); await page.waitForTimeout(400);
  await page.click('[data-action="edit-equipment"]'); await page.waitForTimeout(600);
  const opened = await page.evaluate(() => document.querySelector(".sheet-panel")?.classList.contains("is-open"));
  await page.mouse.click(195, 40); await page.waitForTimeout(900);
  const after = await page.evaluate(() => ({ closed: !document.querySelector(".sheet-panel").classList.contains("is-open"), empty: document.querySelector(".sheet-content").innerHTML === "", settings: /Equipment/.test(document.getElementById("main-content").textContent) }));
  ok("Settings › Equipment: opens, and a tap outside closes it back to Settings", opened && after.closed && after.empty && after.settings, JSON.stringify({ opened, ...after }));
  ok("no page errors", errs.length === 0, errs.join(" | "));
  await ctx.close();
}
await b.close();
console.log(fails ? `\nCHROMIUM-SHEETS: ${fails} FAILED` : "\nCHROMIUM-SHEETS: all pass");
process.exit(fails ? 1 : 0);
