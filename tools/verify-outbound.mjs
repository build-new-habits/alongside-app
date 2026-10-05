/**
 * tools/verify-outbound.mjs
 * 05 Oct 2026 v4
 *
 * v4 - SW-INCREMENTAL. 3a2: the Sentry loader is async, so it never holds up
 *   opening the app.
 *
 * v3 - B3 DOMAIN: 2e reads the offline list's relative paths (sw.js v624).
 * v3 - B5 EVIDENCE. The app now has exactly one way to send something it
 *   made: js/data/evidence.js, to the survey receiver, only once the person
 *   presses Send, and only while the receiver is set. 4b-4d hold it to that:
 *   one POST in the whole of js/, in that file, inside sendEvidence, behind
 *   enabled(); and the receiver starts empty. Driven in verify-evidence.
 *
 *
 * v2 - SENTRY-SESSIONS. 3s: no release-health sessions, so nothing is sent
 *   when the app opens without an error.
 *
 * PT-1 OUTBOUND. Nothing leaves the phone that the privacy policy does
 * not name.
 *
 * Found preparing 12g (30 Sep): the consent screen says "Your answers stay
 * on your device", and on every open the page fetched the Inter font from
 * Google (the phone's address to Google) and loaded Sentry with its
 * defaults, whose breadcrumbs carry console output -- and store.js logs
 * whole activity entries (a session note, mood after) to the console.
 *
 * Graeme, 30 Sep: keep Sentry, locked down; serve the font from the app.
 *
 *   1. The only third-party address the page loads is the Sentry loader.
 *      No Google Fonts, anywhere in the page, the styles or the code.
 *   2. Inter is served from the app: @font-face on local woff2 files that
 *      exist, and the service worker keeps them for offline use.
 *   3. Sentry is initialised before its loader, errors only: no personal
 *      data, no breadcrumbs, no replay, no tracing; beforeSend removes the
 *      user, breadcrumbs, extra data and request headers from every event.
 *      Driven: the page's own init runs against a stand-in Sentry and a
 *      real-shaped event carrying a session note is passed through it.
 *   4. No code in js/ calls fetch, XMLHttpRequest, sendBeacon or a
 *      WebSocket on an absolute web address.
 */
import fs from "node:fs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const ROOT = new URL("../", import.meta.url);
const read = p => fs.readFileSync(new URL(p, ROOT), "utf8");
const exists = p => fs.existsSync(new URL(p, ROOT));

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};

const html = read("index.html");
const live = html.replace(/<!--[\s\S]*?-->/g, "");

// ── 1. THIRD PARTIES ────────────────────────────────────────────────────
console.log("\nTEST 1 - the only third party the page loads is Sentry");
const external = [...live.matchAll(/\b(?:src|href)\s*=\s*"(https?:\/\/[^"]+)"/g)].map(m => m[1]);
ok("1a. every external address in the page is the Sentry loader",
   external.length > 0 && external.every(u => /^https:\/\/js-de\.sentry-cdn\.com\//.test(u)), JSON.stringify(external));
function walk(dir, ext, out = []) {
  for (const e of fs.readdirSync(new URL(dir, ROOT), { withFileTypes: true })) {
    const p = `${dir}${e.name}`;
    if (e.isDirectory()) walk(p + "/", ext, out); else if (p.endsWith(ext)) out.push(p);
  }
  return out;
}
const css = walk("css/", ".css");
const js  = walk("js/", ".js");
const google = [...css, ...js, "index.html", "sw.js"].filter(p => /fonts\.googleapis|fonts\.gstatic/.test(read(p).replace(/\/\*[\s\S]*?\*\//g, "").replace(/<!--[\s\S]*?-->/g, "").split("\n").filter(l => !/^\s*(\/\/|\*)/.test(l)).join("\n")));
ok("1b. no Google Fonts in the page, the styles, the code or the service worker", google.length === 0, google.join(", "));

// ── 2. THE FONT IS THE APP'S OWN ────────────────────────────────────────
console.log("\nTEST 2 - Inter is served from the app");
const faceFile = css.find(p => /@font-face[\s\S]*?Inter/.test(read(p)));
const faceSrc = faceFile ? read(faceFile) : "";
const urls = [...faceSrc.matchAll(/url\(\s*["']?([^"')]+\.woff2)["']?\s*\)/g)].map(m => m[1]);
const resolved = urls.map(u => new URL(u, new URL(faceFile, ROOT)));
ok("2a. an @font-face for Inter on local woff2 files", !!faceFile && urls.length >= 4 && urls.every(u => !/^https?:/.test(u)), `${faceFile} ${JSON.stringify(urls)}`);
ok("2b. the files are there", resolved.length >= 4 && resolved.every(u => fs.existsSync(u)), resolved.map(u => u.pathname).join(", "));
const weights = [...faceSrc.matchAll(/font-weight:\s*(\d+)/g)].map(m => m[1]).sort().join(",");
ok("2c. the four weights the app uses: 400, 500, 600, 700", weights === "400,500,600,700", weights);
ok("2d. the styles load it", /@import\s+(?:url\()?["']?(?:\.\/)?base\/fonts\.css/.test(read("css/main.css")) || live.includes("css/base/fonts.css"),
   "fonts.css is not imported by main.css or linked from the page");
const sw = read("sw.js");
const shell = sw.slice(sw.indexOf("const SHELL_URLS"), sw.indexOf("];", sw.indexOf("const SHELL_URLS")));
const fontPaths = resolved.map(u => u.pathname.replace(new URL(ROOT).pathname, "./"));
ok("2e. the service worker keeps the font and its stylesheet for offline use",
   fontPaths.length >= 4 && fontPaths.every(p => shell.includes(`"${p}"`)) && shell.includes('"./css/base/fonts.css"'),
   fontPaths.filter(p => !shell.includes(`"${p}"`)).join(", ") || "css/base/fonts.css missing");

// ── 3. SENTRY, LOCKED DOWN ──────────────────────────────────────────────
console.log("\nTEST 3 - Sentry sends errors only, with nothing personal");
const loaderAt = live.indexOf("js-de.sentry-cdn.com");
const inline = [...live.matchAll(/<script>([\s\S]*?)<\/script>/g)].find(m => /sentryOnLoad/.test(m[1]));
ok("3a. Sentry is configured before its loader", !!inline && inline.index < loaderAt);
// SW-INCREMENTAL, 05 Oct. A plain script tag held up every open until Sentry's
// server answered; it is outside the app's own cache.
const loaderTag = (live.match(/<script[^>]*js-de\.sentry-cdn\.com[^>]*>/) || [""])[0];
ok("3a2. the Sentry loader does not hold up the page (async)", /\basync\b/.test(loaderTag), loaderTag);
let opts = null;
if (inline) {
  const dom = new JSDOM("<!doctype html>", { runScripts: "outside-only" });
  dom.window.eval(inline[1]);
  dom.window.Sentry = { init: o => { opts = o; } };
  try { dom.window.sentryOnLoad?.(); } catch (e) { console.log("        sentryOnLoad threw", e.message); }
}
ok("3b. no personal data, no replay, no tracing",
   !!opts && opts.sendDefaultPii === false && opts.tracesSampleRate === 0 && opts.replaysSessionSampleRate === 0 && opts.replaysOnErrorSampleRate === 0,
   JSON.stringify(opts && { pii: opts.sendDefaultPii, t: opts.tracesSampleRate, r: opts.replaysSessionSampleRate, re: opts.replaysOnErrorSampleRate }));
ok("3s. no release-health sessions: nothing sent on an open without an error",
   opts?.autoSessionTracking === false && typeof opts?.integrations === "function" &&
   opts.integrations([{ name: "BrowserSession" }, { name: "GlobalHandlers" }]).map(i => i.name).join() === "GlobalHandlers",
   JSON.stringify(opts && { ast: opts.autoSessionTracking }));
ok("3c. no breadcrumbs: every one is dropped", typeof opts?.beforeBreadcrumb === "function" &&
   opts.beforeBreadcrumb({ category: "console", message: "Duplicate activity entry {note: 'Back flared again'}" }) === null);
const event = {
  message: "boom", tags: { feature: "router", view: "workout" },
  user: { ip_address: "{{auto}}", id: "x" },
  breadcrumbs: [{ category: "console", message: "entry {note: 'Back flared again', moodAfter: 3}" }],
  extra: { trail: ["today", "red-flag", "workout"], entry: { note: "Back flared again" } },
  request: { url: "https://x/#workout", headers: { "User-Agent": "phone" }, cookies: "a=b" },
  contexts: { state: { note: "Back flared again" } },
};
const sent = typeof opts?.beforeSend === "function" ? opts.beforeSend(structuredClone(event), {}) : null;
ok("3d. an event keeps the error and which feature it came from", !!sent && sent.message === "boom" && sent.tags?.feature === "router");
ok("3e. and loses the user, breadcrumbs, extra data, request headers and cookies",
   !!sent && !sent.user && !sent.breadcrumbs && !sent.extra && !sent.request?.headers && !sent.request?.cookies,
   JSON.stringify(sent));
ok("3f. nothing a person wrote survives anywhere in the event", !!sent && !/Back flared|moodAfter/.test(JSON.stringify(sent)), JSON.stringify(sent));

// ── 4. NO OTHER OUTBOUND CALLS ──────────────────────────────────────────
console.log("\nTEST 4 - the code makes no calls to the web");
const calls = [];
for (const p of js) {
  const src = read(p).replace(/\/\*[\s\S]*?\*\//g, "").split("\n").filter(l => !/^\s*\/\//.test(l)).join("\n");
  if (/fetch\(\s*[`'"]https?:/.test(src) || /XMLHttpRequest|sendBeacon|new WebSocket/.test(src)) calls.push(p);
}
ok("4a. no fetch, XMLHttpRequest, sendBeacon or WebSocket to a web address", calls.length === 0, calls.join(", "));
const posts = js.filter(p => /method:\s*["']POST["']/.test(read(p).replace(/\/\*[\s\S]*?\*\//g, "")));
ok("4b. one file in the app can send anything it made: evidence.js", posts.length === 1 && /data\/evidence\.js$/.test(posts[0]), posts.join(", "));
const ev = read(posts[0] || "js/data/evidence.js");
const fnBody = ev.slice(ev.indexOf("export async function sendEvidence"), ev.indexOf("export function researchMessages"));
ok("4c. only inside sendEvidence, and only while the receiver is set", /if \(!enabled\(\)/.test(fnBody) && /method: "POST"/.test(fnBody));
ok("4d. the receiver starts empty: nothing is sent until it is set", /export const RECEIVER = \{ url: "", key: ""/.test(ev));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
