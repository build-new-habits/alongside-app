/**
 * tools/chromium-copy-check.mjs
 * 24 Nov 2026 v1
 *
 * Graeme, 24 Nov: "the link didn't copy, and I couldn't share it". In real
 * Chromium as a phone, with a list like his: open Send a link to change, tap
 * Copy, read the clipboard back. Not in the verify-* loop (Chromium).
 *   node tools/chromium-copy-check.mjs <app root>
 */
// Real Chromium, a phone: open Send a link to change with a list like Graeme's, tap Copy, read the clipboard; tap Share.
import { createRequire } from "node:module";
import { createServer } from "node:http"; import { readFileSync, existsSync, statSync } from "node:fs"; import { join, extname } from "node:path";
const { chromium } = createRequire("/opt/npm-tools/node_modules/")("playwright");
const ROOT = process.argv[2];
const T = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".woff2": "font/woff2", ".svg": "image/svg+xml" };
const srv = createServer((q, r) => { let f = join(ROOT, decodeURIComponent(q.url.split("?")[0])); if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html"); if (!existsSync(f)) { r.writeHead(404); r.end(); return; } r.writeHead(200, { "content-type": T[extname(f)] || "application/octet-stream" }); r.end(readFileSync(f)); });
await new Promise(r => srv.listen(0, r));
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await b.newContext({ viewport: { width: 412, height: 900 }, isMobile: true, hasTouch: true, permissions: ["clipboard-read", "clipboard-write"] });
const page = await ctx.newPage();
const errs = []; page.on("pageerror", e => errs.push(e.message)); page.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
const base = `http://localhost:${srv.address().port}/`;
await page.goto(base); await page.waitForTimeout(1500);
await page.evaluate(async () => {
  const s = window.store;
  const { POLICY_VERSION } = await import("./js/data/consent-version.js");
  const { AGE_CHECK_VERSION } = await import("./js/data/age-check.js");
  const { HEALTH_CONSENT_VERSION } = await import("./js/data/health-consent.js");
  localStorage.clear(); s.init(); const at = new Date().toISOString();
  s.set("consent.ageConfirmed", true); s.set("consent.ageCheckedAt", at); s.set("consent.ageVersion", AGE_CHECK_VERSION);
  s.set("consent.given", true); s.set("consent.at", at); s.set("consent.policyVersion", POLICY_VERSION);
  s.set("consent.health", { given: true, at, version: HEALTH_CONSENT_VERSION, withdrawnAt: null });
  s.set("onboardingComplete", true); s.set("name", "Graeme"); s.set("tier", "personal");
  const names = [["Supine Spinal Twist","Evening Release",1,"45 seconds each side","knees together, shoulders down"],["Seated Figure-4 Stretch","Evening Release",1,"45 seconds each side","or lying on your back; right side twice"],["Lateral Quad and IT Band Stretch","Evening Release",1,"45 seconds each side","right side twice"],["QL Stretch — Side Bend","Evening Release",1,"30 seconds each side","long reach, no bouncing"],["Supine Hamstring Stretch","Evening Release",1,"45 seconds each side","use a towel or strap"],["Child's Pose","Evening Release",1,"60 seconds","knees wide, breathe into the lower back"],["Diaphragmatic Breathing","Evening Release",1,"120 seconds","long slow breath out, wind down for sleep"],["Cross Trainer — Easy Pace","Session A",1,"300 seconds","steady, you can still talk"],["Cat-Cow Stretch","Session A",1,"8","gentle pelvic tilt"],["Lat Pulldown","Session A",3,"10","about 40 kg, pull to collarbone, chest proud"],["Seated Cable Row","Session A",3,"10","squeeze shoulder blades together"],["Dead Bug","Session A",2,"8 each side","lower back stays on the floor"]];
  s.set("prescribedExercises", names.map(([name, group, sets, reps, notes], i) => ({ id: "px-1794424682372-" + i, name, group, sets, reps, notes, active: true, completedToday: false })));
  await window.router.navigate("plan-link-send");
});
await page.waitForTimeout(1200);
const has = await page.evaluate(() => !!document.querySelector("#pl-copy"));
await page.evaluate(() => navigator.clipboard.writeText("EMPTY"));
await page.tap("#pl-copy"); await page.waitForTimeout(1200);
const clip = await page.evaluate(() => navigator.clipboard.readText());
const status = await page.evaluate(() => document.querySelector("#pl-status")?.textContent);
const shareExists = await page.evaluate(() => typeof navigator.share);
console.log(JSON.stringify({ screen: has, copied: clip.slice(0, 50), length: clip.length, status, shareExists, errs: errs.slice(0, 3) }));
await b.close(); srv.close();
