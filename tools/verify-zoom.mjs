/**
 * tools/verify-zoom.mjs
 * 02 Oct 2026 v1
 *
 * W4-5 ZOOM (Wave 4 persona trace, 2.11; WCAG 2.2 SC 1.4.4 Resize Text).
 * index.html said maximum-scale=1.0, user-scalable=no: pinch-zoom was
 * switched off for everybody, and somebody of 76 who reads small text
 * badly had no way to enlarge what was on the screen (Text size in
 * Settings is never mentioned before they need it).
 *
 *   1. The viewport line allows zoom: no user-scalable=no (or 0), and no
 *      maximum-scale below 5.
 *   2. Nothing else stops it: no script rewrites the viewport, no stylesheet
 *      sets touch-action: none or pan-x/pan-y on html or body, no script
 *      cancels gesture or multi-touch events.
 *   3. The rest of the viewport line is kept (width, initial scale,
 *      viewport-fit for the notch).
 */
import { readFileSync, readdirSync, statSync } from "node:fs";

const root = new URL("../", import.meta.url);
let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const read = p => readFileSync(new URL(p, root), "utf8");
function walk(dir, ext) {
  const out = [];
  for (const n of readdirSync(new URL(dir, root))) {
    const rel = `${dir}${n}`;
    const st = statSync(new URL(rel, root));
    if (st.isDirectory()) out.push(...walk(rel + "/", ext));
    else if (n.endsWith(ext)) out.push(rel);
  }
  return out;
}

// ── 1. THE VIEWPORT LINE ────────────────────────────────────────────────
console.log("\nTEST 1 - the viewport line allows zoom");
const html = read("index.html");
const meta = (html.match(/<meta\s+name="viewport"\s+content="([^"]*)"/i) || [])[1];
ok("1pc. the viewport line is found", typeof meta === "string", String(meta));
const parts = Object.fromEntries((meta || "").split(",").map(s => s.trim().split("=").map(x => x.trim().toLowerCase())));
ok("1a. no user-scalable=no", !("user-scalable" in parts) || !["no", "0"].includes(parts["user-scalable"]), meta);
ok("1b. no maximum-scale below 5", !("maximum-scale" in parts) || Number(parts["maximum-scale"]) >= 5, meta);

// ── 2. NOTHING ELSE STOPS IT ────────────────────────────────────────────
console.log("\nTEST 2 - nothing else stops it");
const js = walk("js/", ".js");
const rewrites = js.filter(f => /name=["']?viewport|querySelector\(["']meta\[name=["']?viewport/i.test(read(f)) && /setAttribute\(\s*["']content/.test(read(f)));
ok("2a. no script rewrites the viewport", rewrites.length === 0, rewrites.join(", "));
const css = walk("css/", ".css");
const blocks = css.filter(f => /(^|[\s,}])(html|body)\s*[^{]*\{[^}]*touch-action\s*:\s*(none|pan-x|pan-y)/i.test(read(f)));
ok("2b. no stylesheet stops pinching on the page", blocks.length === 0, blocks.join(", "));
const gestures = js.filter(f => /addEventListener\(\s*["'](gesturestart|gesturechange)["']/.test(read(f)));
ok("2c. no script cancels pinch gestures", gestures.length === 0, gestures.join(", "));

// ── 3. THE REST IS KEPT ─────────────────────────────────────────────────
console.log("\nTEST 3 - the rest of the line is kept");
ok("3a. width, initial scale and viewport-fit are still there",
   parts.width === "device-width" && Number(parts["initial-scale"]) === 1 && parts["viewport-fit"] === "cover", meta);

console.log(`\nZOOM: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
