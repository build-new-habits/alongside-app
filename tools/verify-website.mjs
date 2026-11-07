/**
 * tools/verify-website.mjs
 * 07 Nov 2026 v2
 *
 * v2 - WEB-TRIM (master schedule row 9b, Graeme 07 Nov: "far far far too
 *   many words"). The site is now Home, How it works and About; Who it's
 *   for, Philosophy, Products, Upgrade, Community and Impact send you on
 *   (Giving back waits until Graeme has something to say). The Free / Plan
 *   claims come from tools/website-claims.mjs, each with its proof in the
 *   app. Tests 4, 5 and 8 re-pointed; 9 and 10 new.
 * v1 - 18 Oct 2026. WEB-CLAIMS (row 9). Graeme, 18 Oct 2026: "website -
 *   you have this control because it's still in GitHub repo".
 *
 * Looks for the website in $WEBSITE, then beside this repository
 * (../website). If it is not there the check FAILS, the same rule as
 * tools/bnh-files.mjs: a check that skips looks like coverage and is not.
 *
 *  1. No page claims detection, early signs, diagnosis, monitoring or
 *     restoration (visible text, every page).
 *  2. Nothing is presented as a user's words: no <blockquote>, and every
 *     quotation of 20 characters or more is a coach line.
 *  3. Every coach line on Home is one the app says (a string in js/, a
 *     template's ${...} matching any words).
 *  4. Every Free / Plan table (data-claims) is tools/website-claims.mjs,
 *     row for row, word for word, tick for tick; every claim's proof is in
 *     the app; prices are js/data/pricing.js (plus the early bird).
 *  5. No page makes the August claims (library "opens fully", "phase by
 *     phase", periodisation, correlation, Full Body only).
 *  6. Every sign-up form is switched off and says nothing is sent, until
 *     the mailing list is connected (it needs Graeme's Kit account).
 *  7. The accessibility statement exists, names WCAG 2.2 AA, is dated,
 *     says what isn't right yet, and the footer links to it.
 *  8. No page says Move is live.
 *  9. The menu is Home, How it works, About; the footer has no "coming
 *     soon" links.
 * 10. Every retired page sends you on to its new page and asks search
 *     engines not to list it.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { HOME_ROWS, SCENARIOS, EARLY_BIRD } from "./website-claims.mjs";
import { PRICE_MONTHLY, PRICE_ANNUAL } from "../js/data/pricing.js";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = [process.env.WEBSITE, path.resolve(REPO, "..", "website")]
  .filter(Boolean).find(p => fs.existsSync(path.join(p, "index.html")));

let passed = 0, failed = 0;
const ok = (cond, label, detail = "") => {
  if (cond) { passed++; console.log(`  PASS  ${label}`); }
  else { failed++; console.log(`  FAIL  ${label}${detail ? `\n        ${detail}` : ""}`); }
};

if (!SITE) {
  console.log("  FAIL  the website is not reachable");
  console.log("        It lives in build-new-habits/website. Clone it beside this repository (../website), or set WEBSITE to its folder.");
  process.exit(1);
}

const pages = ["index.html", ...fs.readdirSync(SITE, { withFileTypes: true })
  .filter(d => d.isDirectory() && fs.existsSync(path.join(SITE, d.name, "index.html")))
  .map(d => `${d.name}/index.html`)];
const doc = {};
for (const p of pages) doc[p] = new JSDOM(fs.readFileSync(path.join(SITE, p), "utf8")).window.document;
const text = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const visible = d => { const c = d.body.cloneNode(true); c.querySelectorAll("script,style").forEach(n => n.remove()); return text(c); };

console.log(`\nverify-website: ${pages.length} pages in ${SITE}\n`);

// 1 ─ banned claims
console.log("TEST 1 - no detection, diagnosis, monitoring or restoration claims");
const BANNED = /\bdetect(s|ed|ion|ing)?\b|early signs?\b|\bdiagnos(e|es|ed|ing)\b|\bmonitor(s|ed|ing)?\b|\brestoration\b|burnout detection|pattern-detection/i;
for (const p of pages) {
  const m = visible(doc[p]).match(BANNED);
  ok(!m, `1. ${p}`, m ? `says "${m[0]}"` : "");
}

// 2 ─ nothing presented as a user's words
console.log("\nTEST 2 - no quotation reads as a user's words");
for (const p of pages) {
  const d = doc[p];
  ok(d.querySelectorAll("blockquote").length === 0, `2a. ${p} has no blockquote`);
  const c = d.body.cloneNode(true);
  c.querySelectorAll("script,style,.coach-bubble__message").forEach(n => n.remove());
  const q = text(c).match(/["“][^"”]{20,}["”]/);
  ok(!q, `2b. ${p}: every long quotation is a coach line`, q ? `found ${q[0].slice(0, 80)}` : "");
}

// 3 ─ coach lines are the app's own
console.log("\nTEST 3 - every coach line on the site is one the app says");
const appSrc = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p); else if (p.endsWith(".js")) appSrc.push(fs.readFileSync(p, "utf8"));
  }
})(path.join(REPO, "js"));
const literals = [];
for (const src of appSrc) {
  for (const m of src.matchAll(/`((?:[^`\\]|\\.)*)`|"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'/g)) {
    const s = (m[1] ?? m[2] ?? m[3]).replace(/\\'/g, "'").replace(/\\"/g, '"');
    if (s.length >= 12) literals.push(s);
  }
}
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const said = line => literals.some(l => {
  if (!l.includes("${")) return l === line;
  const parts = l.split(/\$\{(?:[^{}]|\{[^{}]*\})*\}/);
  // A template that is mostly ${...} would match any sentence at all:
  // at least 20 of its own characters must be fixed words.
  if (parts.join("").replace(/\s/g, "").length < 20) return false;
  return new RegExp("^" + parts.map(esc).join(".+?") + "$").test(line);
});
const coach = [...doc["index.html"].querySelectorAll(".coach-bubble__message")].map(el => text(el).replace(/^[\u201C"]|[\u201D"]$/g, ""));
ok(coach.length >= 1, `3a. Home shows a coach line (${coach.length})`);
for (const line of coach) ok(said(line), `3b. "${line.slice(0, 60)}…"`, "not found in js/: use a line the app really says");

// 4 ─ Free / Plan claims
console.log("\nTEST 4 - every Free / Plan table is tools/website-claims.mjs, and every claim is in the app");
const cell = td => td.querySelector(".yes") ? true : td.querySelector(".no") ? false : text(td);
const tableRows = tbl => [...tbl.querySelectorAll("tbody tr")].filter(r => !r.classList.contains("price"))
  .map(r => ({ text: text(r.querySelector("th")), cells: [...r.querySelectorAll("td")].map(cell) }));
function sameTable(where, tbl, want) {
  if (!tbl) { ok(false, `4a. ${where}: the table is there`); return; }
  const got = tableRows(tbl);
  ok(got.length === want.length, `4a. ${where}: ${want.length} rows (found ${got.length})`);
  want.forEach((w, i) => {
    const g = got[i];
    ok(g && g.text === w.text && g.cells[0] === w.free && g.cells[1] === w.plan,
      `4b. ${where}: "${w.text.slice(0, 50)}" word for word, ticks as reviewed`,
      g ? `site: ${g.text} | ${g.cells.join(" | ")}` : "row missing");
  });
}
sameTable("Home", doc["index.html"].querySelector('table[data-claims="home"]'), HOME_ROWS);
const hiw = doc["how-it-works/index.html"];
ok(!!hiw, "4c. how-it-works/index.html exists");
for (const sc of SCENARIOS) {
  sameTable(`How it works, ${sc.id}`, hiw?.querySelector(`table[data-claims="${sc.id}"]`), sc.rows);
  ok(!!hiw && text(hiw.querySelector(`#b-${sc.id}`)) === sc.title, `4d. How it works, ${sc.id}: titled "${sc.title}"`);
}
ok(hiw && hiw.querySelectorAll("table[data-claims]").length === SCENARIOS.length, `4e. How it works has ${SCENARIOS.length} tables, no others`);
const proofs = [...HOME_ROWS, ...SCENARIOS.flatMap(s => s.rows)].flatMap(r => r.proof.map(pr => ({ ...pr, row: r.text })));
const missing = proofs.filter(pr => { const f = path.join(REPO, pr.file); return !fs.existsSync(f) || !fs.readFileSync(f, "utf8").includes(pr.words); });
ok(proofs.length >= 40 && missing.length === 0, `4f. every claim's proof is in the app (${proofs.length} proofs)`,
  missing.map(m => `"${m.row.slice(0, 40)}": ${m.file} has no "${m.words}"`).join("\n        "));
const allowed = new Set(["£0", PRICE_MONTHLY, PRICE_ANNUAL, EARLY_BIRD.price]);
for (const p of pages) {
  const bad = (visible(doc[p]).match(/£\d+(\.\d\d)?/g) || []).filter(x => !allowed.has(x));
  ok(!bad.length, `4g. ${p}: every price is the app's (or the early bird)`, bad.join(", "));
}
for (const p of ["index.html", "how-it-works/index.html"]) {
  const v = doc[p] ? visible(doc[p]) : "";
  ok(v.includes(PRICE_MONTHLY) && v.includes(PRICE_ANNUAL), `4h. ${p} shows ${PRICE_MONTHLY} and ${PRICE_ANNUAL}`);
}

// 5 ─ August claims
console.log("\nTEST 5 - no page makes the August claims");
for (const p of pages) {
  const stale = visible(doc[p]).match(/opens fully|phase by phase|periodis|correlation|Full Body only/i);
  ok(!stale, `5. ${p}`, stale ? `says "${stale[0]}"` : "");
}

// 6 ─ sign-up forms
console.log("\nTEST 6 - sign-up stays switched off, and says so, until it is connected");
for (const p of pages) {
  for (const f of doc[p].querySelectorAll("form")) {
    if (f.getAttribute("action")) continue;
    const off = [...f.querySelectorAll("input,button")].every(i => i.disabled);
    ok(off && /nothing you type here is sent/i.test(text(f)), `6. ${p}: ${f.getAttribute("aria-label") || "form"}`);
  }
}

// 7 ─ accessibility statement
console.log("\nTEST 7 - the accessibility statement");
const a = doc["accessibility/index.html"];
ok(!!a, "7a. accessibility/index.html exists");
const at = a ? visible(a) : "";
ok(/WCAG\)? 2\.2 at level AA/.test(at), "7b. it names WCAG 2.2 AA");
ok(/Last reviewed \d{1,2} \w+ 20\d\d/.test(at), "7c. it is dated");
ok(/What isn't right yet/.test(at), "7d. it says what isn't right yet");
const siteJs = fs.readFileSync(path.join(SITE, "js/site.js"), "utf8");
ok(/label: "Accessibility", href: BASE_PATH \+ "\/accessibility\/"/.test(siteJs), "7e. the footer links to it");

// 8 ─ nothing says Move is live
console.log("\nTEST 8 - no page says Move is live");
for (const p of pages) ok(!/Live now/i.test(visible(doc[p])), `8. ${p}`);

// 9 ─ the menu
console.log("\nTEST 9 - the menu is Home, How it works, About");
const navBlock = (siteJs.match(/var NAV_LINKS = \[([\s\S]*?)\];/) || [])[1] || "";
const navLabels = [...navBlock.matchAll(/label: "([^"]+)"/g)].map(m => m[1]);
ok(navLabels.join("|") === "Home|How it works|About", "9a. Home, How it works, About", `found ${navLabels.join(", ")}`);
ok(!/comingSoon: true/.test(siteJs), '9b. no "coming soon" links in the footer');

// 10 ─ retired pages send you on
console.log("\nTEST 10 - every retired page sends you on");
const RETIRED = { "who-its-for": "how-it-works", upgrade: "how-it-works", philosophy: "about", products: "", community: "", impact: "" };
for (const [from, to] of Object.entries(RETIRED)) {
  const d = doc[`${from}/index.html`];
  const meta = d?.querySelector('meta[http-equiv="refresh"]')?.getAttribute("content") || "";
  const target = to ? `../${to}/` : "../";
  ok(!!d && meta.endsWith(`url=${target}`) && !!d.querySelector(`a[href="${target}"]`) && /noindex/.test(d.querySelector('meta[name="robots"]')?.getAttribute("content") || ""),
    `10. /${from}/ sends you to /${to}${to ? "/" : ""} and is not listed`, meta || "no refresh");
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
