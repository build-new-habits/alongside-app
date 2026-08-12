/**
 * tools/verify-disp1.mjs
 * 12 Aug 2026 v1
 *
 * Gate for DISP-1. The highest-risk thing here is the duplicated key and
 * default block: index.html's pre-paint script cannot import the module,
 * so two copies exist and can drift silently. Everything else is a
 * cross-file wiring contract that fails invisibly.
 */
import fs from "node:fs";

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const eq = (a, b, m) => { if (a !== b) throw new Error(`${m}\n        got:  ${a}\n        want: ${b}`); };

// Strip comments before any positional or presence test. Three false
// failures on the first run of this harness came from matching text
// inside comments that legitimately DISCUSS the thing being tested --
// a note saying "must sit before </head>" is not a </head>. Same class
// of error as a cache-string grep matching a changelog line.
const stripHtmlComments = s => s.replace(/<!--[\s\S]*?-->/g, "");
const stripCssComments  = s => s.replace(/\/\*[\s\S]*?\*\//g, "");

const htmlRaw = fs.readFileSync("index.html", "utf8");
const html    = stripHtmlComments(htmlRaw);
const prefs  = fs.readFileSync("js/display-prefs.js", "utf8");
const setts  = fs.readFileSync("js/views/settings.js", "utf8");
const varsRaw = fs.readFileSync("css/base/variables.css", "utf8");
const vars    = stripCssComments(varsRaw);
const mainC  = stripCssComments(fs.readFileSync("css/main.css", "utf8"));
const reset  = stripCssComments(fs.readFileSync("css/base/reset.css", "utf8"));
// sw.js: strip block comments so a SHELL_URLS check cannot be satisfied
// by a changelog entry that merely names the file.
const sw     = fs.readFileSync("sw.js", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

const pairs = src => {
  const m = {};
  for (const [, k, v] of src.matchAll(/(\w+):\s*"([^"]+)"/g)) if (!m[k]) m[k] = v;
  return m;
};

console.log("\nTEST 1 - the duplicated pre-paint block matches the module");
const inline = html.match(/var K = \{([\s\S]*?)\};[\s\S]*?var D = \{([\s\S]*?)\};/);
check("index.html contains the pre-paint block", () => { if (!inline) throw new Error("block not found"); });
if (inline) {
  const modKeys = pairs(prefs.match(/DISPLAY_KEYS = \{([\s\S]*?)\};/)[1]);
  const modDefs = pairs(prefs.match(/DISPLAY_DEFAULTS = \{([\s\S]*?)\};/)[1]);
  check("storage KEYS identical in both copies",
    () => eq(JSON.stringify(pairs(inline[1])), JSON.stringify(modKeys), "drift would silently orphan saved preferences"));
  check("DEFAULTS identical in both copies",
    () => eq(JSON.stringify(pairs(inline[2])), JSON.stringify(modDefs), "drift would flash the wrong value on every launch"));
}

console.log("\nTEST 2 - the pre-paint script runs before paint");
check("inline script sits inside <head>", () => {
  const headEnd = html.indexOf("</head>");
  const script  = html.indexOf("--user-text-scale");
  if (script === -1 || script > headEnd) throw new Error("script is after </head>; preferences would flash");
});
check("it precedes the app module", () => {
  if (html.indexOf("--user-text-scale") > html.indexOf('src="js/app.js"'))
    throw new Error("app.js loads first");
});

console.log("\nTEST 3 - the token scale is actually wired");
for (const tk of ["text-xs","text-sm","text-base","text-lg","text-xl","text-2xl","text-3xl","text-4xl"])
  check(`--${tk} multiplies --user-text-scale`, () => {
    const m = vars.match(new RegExp(`--${tk}:\\s*([^;]+);`));
    if (!m || !m[1].includes("--user-text-scale")) throw new Error(`--${tk} would ignore the control`);
  });
for (const tk of ["leading-tight","leading-normal","leading-relaxed"])
  check(`--${tk} multiplies --user-leading-scale`, () => {
    const m = vars.match(new RegExp(`--${tk}:\\s*([^;]+);`));
    if (!m || !m[1].includes("--user-leading-scale")) throw new Error(`--${tk} would ignore the control`);
  });
check("defaults are exactly 1 / 1 / 0em so nothing changes uninvited", () => {
  eq(/--user-text-scale:\s*1;/.test(vars), true, "text scale default must be 1");
  eq(/--user-leading-scale:\s*1;/.test(vars), true, "leading scale default must be 1");
  eq(/--user-letter-spacing:\s*0em;/.test(vars), true, "letter spacing default must be 0em");
});
check("the dead @media (prefers-larger-text) block is gone", () => {
  eq(vars.includes("@media (prefers-larger-text)"), false, "not a real media feature; never matched");
});

console.log("\nTEST 4 - stylesheet reaches the browser");
check("display-preferences.css imported by main.css", () =>
  eq(mainC.includes("components/display-preferences.css"), true,
     "index.html links ONLY main.css, so an unimported component file is dead"));
check("display-preferences.css precached in sw.js", () =>
  eq(sw.includes("display-preferences.css"), true, "offline launch would drop the styling"));
check("display-prefs.js precached in sw.js", () =>
  eq(sw.includes("js/display-prefs.js"), true, "offline launch would break the Settings tab"));

console.log("\nTEST 5 - Settings tab wiring");
check("'display' tab declared", () => eq(/id:\s*'display'/.test(setts), true, "tab missing"));
check("'display' routed in renderPanel", () => eq(/case 'display':/.test(setts), true, "tab would render empty"));
check("live region uses a class that exists", () => {
  const cls = setts.match(/id="disp-status" class="([a-z-]+)"/)[1];
  if (!new RegExp(`\\.${cls}\\b`).test(reset)) throw new Error(`.${cls} is not defined in reset.css`);
});

console.log("\nTEST 6 - A11Y-3, the orphaned sr-only class");
check(".sr-only is now defined", () => eq(/\.sr-only\s*,/.test(reset), true, "7 elements still unstyled"));
check("every sr-only user is covered", () => {
  const rule = reset.match(/\.sr-only,\s*\n\.visually-hidden \{([\s\S]*?)\}/);
  if (!rule || !rule[1].includes("position: absolute")) throw new Error("alias present but rule body wrong");
});

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
