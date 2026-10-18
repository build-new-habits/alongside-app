/**
 * tools/verify-css-parallel.mjs
 * 18 Oct 2026 v1
 *
 * A-8b CSS-PARALLEL (Stage AWARD; Graeme, 18 Oct: "You do those things").
 * main.css pulls in every sheet with @import, which a browser only starts
 * once main.css has arrived. index.html now preloads each of those sheets
 * so they are asked for at once. main.css stays the one list (seven checks
 * read it); this holds index.html's preloads to it, exactly and in order,
 * so a sheet added to one and not the other is caught the day it happens.
 *
 * Measured in Chromium (slow network: 150 ms, 1.6 Mbps; compressed, as
 * GitHub Pages serves): first paint 2.20 s before, 2.08 s after. The rest
 * is the sheets' size and the local server's six connections; GitHub
 * Pages serves over HTTP/2. Re-measure with Lighthouse at the app's own
 * address once the domain is live (A-8).
 */
import { readFileSync } from "node:fs";
const ROOT = new URL("../", import.meta.url);
let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = readFileSync(new URL("css/main.css", ROOT), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const imports = [...main.matchAll(/@import\s+'([^']+)'\s*;/g)].map(m => "css/" + m[1]);
const html = readFileSync(new URL("index.html", ROOT), "utf8").replace(/<!--[\s\S]*?-->/g, "");
const preloads = [...html.matchAll(/<link rel="preload" as="style" href="([^"]+)">/g)].map(m => m[1]);
ok("0. the import list was read", imports.length > 40, String(imports.length));
ok("1. every sheet main.css imports is preloaded, in the same order, and nothing else", JSON.stringify(preloads) === JSON.stringify(imports),
   `only in main.css: ${imports.filter(i => !preloads.includes(i)).join(", ") || "-"}; only preloaded: ${preloads.filter(p => !imports.includes(p)).join(", ") || "-"}`);
ok("2. main.css is still the stylesheet the page links", /<link rel="stylesheet" href="css\/main\.css">/.test(html));
ok("3. the preloads come before it", html.indexOf('rel="preload" as="style"') < html.indexOf('href="css/main.css"'));
console.log(`\nVERIFY-CSS-PARALLEL: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
