/**
 * tools/verify-domain-ready.mjs
 * 01 Oct 2026 v1
 *
 * B3 DOMAIN, the app's half. The app moves from
 * build-new-habits.github.io/alongside-app/ to its own address,
 * app.buildnewhabits.co.uk, so its storage stops sharing a site address
 * with anything else Build New Habits publishes on GitHub Pages. Graeme's
 * half (a CNAME record at the domain provider, the custom domain in the
 * repository's Pages settings) is the switch; this makes the code work at
 * both addresses, so the switch needs no code change on the day.
 *
 *   1. No path in the app assumes /alongside-app/: the page, the code, the
 *      styles, the manifest and the service worker.
 *   2. The manifest's start and scope, and the service worker's
 *      registration and scope, are relative.
 *   3. Every file the service worker keeps for offline use resolves to a
 *      real file at BOTH addresses, and its offline fallback page too.
 */
import fs from "node:fs";

const ROOT = new URL("../", import.meta.url);
const read = p => fs.readFileSync(new URL(p, ROOT), "utf8");
const strip = s => s.replace(/\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->/g, "").split("\n").filter(l => !/^\s*\/\//.test(l)).join("\n");
let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const walk = (dir, ext) => fs.readdirSync(new URL(dir, ROOT), { withFileTypes: true })
  .flatMap(d => d.isDirectory() ? walk(`${dir}${d.name}/`, ext) : d.name.endsWith(ext) ? [`${dir}${d.name}`] : []);

console.log("\nTEST 1 - no path assumes /alongside-app/");
const files = ["index.html", "manifest.json", "sw.js", ...walk("js/", ".js"), ...walk("css/", ".css")];
const hits = files.filter(f => strip(read(f)).includes("/alongside-app"));
ok("1pc. positive control: the files were read", files.length > 100);
ok("1a. none, in the page, code, styles, manifest or service worker", hits.length === 0, hits.join(", "));

console.log("\nTEST 2 - relative start, scope and registration");
const man = JSON.parse(read("manifest.json"));
ok("2a. the manifest's start_url and scope are relative", man.start_url === "./" && man.scope === "./", `${man.start_url} ${man.scope}`);
const app = strip(read("js/app.js"));
ok("2b. the service worker is registered relative, with a relative scope", /register\(\s*["']\.\/sw\.js["']\s*,\s*\{\s*scope:\s*["']\.\/["']/.test(app));

console.log("\nTEST 3 - the offline files resolve at both addresses");
const sw = read("sw.js");
const block = strip(sw.slice(sw.indexOf("const SHELL_URLS"), sw.indexOf("];", sw.indexOf("const SHELL_URLS"))));
const shell = [...block.matchAll(/"([^"]+)"/g)].map(m => m[1]);
ok("3pc. positive control: the offline list was found", shell.length > 100, String(shell.length));
for (const base of ["https://build-new-habits.github.io/alongside-app/sw.js", "https://app.buildnewhabits.co.uk/sw.js"]) {
  const dir = new URL("./", base).pathname;
  const bad = shell.filter(u => !/^https?:/.test(u)).filter(u => {
    const p = new URL(u, base).pathname;
    if (!p.startsWith(dir)) return true;
    const rel = p.slice(dir.length);
    return rel !== "" && !fs.existsSync(new URL(rel, ROOT));
  });
  ok(`3a. every entry is a real file at ${new URL(base).host}`, bad.length === 0, bad.slice(0, 5).join(", "));
}
const fallback = (strip(sw).match(/cache\.match\(\s*["']([^"']+)["']\s*\)/) || [])[1];
ok("3b. the offline fallback page is relative and exists", fallback === "./index.html" && fs.existsSync(new URL("index.html", ROOT)), fallback);

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
