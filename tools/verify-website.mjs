/**
 * tools/verify-website.mjs
 * 18 Oct 2026 v1
 *
 * WEB-CLAIMS (master schedule, before the app is wrapped, row 9). The
 * public website (build-new-habits/website) says only what this app does.
 *
 * Graeme, 18 Oct 2026: "website - you have this control because it's
 * still in GitHub repo". Until today the site claimed the app "detects the
 * early signs" of burnout and "responds with restoration", carried three
 * quotations no user ever said, four invented "How it felt" stories, a
 * coach preview of conversations the app cannot have, and a Free/Plan
 * comparison from August (Free "Full Body only, 30 minutes").
 *
 * Looks for the website in $WEBSITE, then beside this repository
 * (../website). If it is not there the check FAILS, the same rule as
 * tools/bnh-files.mjs: a check that skips looks like coverage and is not.
 *
 *  1. No page claims detection, early signs, diagnosis, monitoring or
 *     restoration (visible text, every page).
 *  2. Nothing is presented as a user's words: no <blockquote>, and every
 *     quotation of 20 characters or more is a coach line in the preview.
 *  3. Every coach line in the preview is one the app says: it matches a
 *     string in js/ (a template's ${...} matching any words).
 *  4. Who it's for: the comparison is js/data/tier-table.js, row for row
 *     and word for word; the four people are said to be made up; no
 *     "How it felt" stories; no cycle or menopause feature claimed.
 *  5. Upgrade: none of the August claims (library "opens fully", "phase
 *     by phase", periodisation, correlation, Full Body only).
 *  6. Every sign-up form is switched off and says nothing is sent, until
 *     the mailing list is connected (it needs Graeme's Kit account).
 *  7. The accessibility statement exists, names WCAG 2.2 AA, is dated,
 *     and the footer links to it.
 *  8. Products does not say Move is live.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { TIER_TABLE } from "../js/data/tier-table.js";

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
const coach = [...doc["index.html"].querySelectorAll(".coach-bubble__message")].map(el => text(el).replace(/^"|"$/g, ""));
ok(coach.length >= 6, `3a. the coach preview has its lines (${coach.length})`);
for (const line of coach) ok(said(line), `3b. "${line.slice(0, 60)}…"`, "not found in js/: use a line the app really says");

// 4 ─ Who it's for
console.log("\nTEST 4 - Who it's for matches js/data/tier-table.js");
const w = doc["who-its-for/index.html"];
const rows = [...w.querySelectorAll(".comparison-table tbody tr")].map(r => ({
  area: text(r.querySelector("th")), cells: [...r.querySelectorAll("td")].map(text),
}));
ok(rows.length === TIER_TABLE.length, `4a. ${TIER_TABLE.length} rows, one per tier-table row (found ${rows.length})`);
for (const t of TIER_TABLE) {
  const r = rows.find(x => x.area === t.area);
  ok(r && r.cells[0] === t.free && r.cells[1] === t.plan, `4b. ${t.area}: Free and Plan word for word`,
    r ? `site: ${r.cells.join(" | ")}` : "row missing");
}
const wt = visible(w);
ok(/made up/i.test(wt) && /not customers/i.test(wt), "4c. the four people are said to be made up, not customers");
ok(!/How it felt/i.test(wt), '4d. no "How it felt, over time" stories');
const helps = [...w.querySelectorAll(".persona-card__list li")].filter(li => li.querySelector(".tier-tag")).map(text).join(" ");
ok(!/cycle|menopaus|calorie language|periodis|correlation|Full Body/i.test(helps), "4e. no cycle, menopause, periodisation or Full-Body-only claim among what Alongside does");

// 5 ─ Upgrade
console.log("\nTEST 5 - Upgrade makes none of the August claims");
const u = visible(doc["upgrade/index.html"]);
const stale = u.match(/opens fully|phase by phase|periodis|correlation|Full Body only/i);
ok(!stale, "5. upgrade/index.html", stale ? `says "${stale[0]}"` : "");

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

// 8 ─ Products
console.log("\nTEST 8 - Products");
ok(!/Live now/i.test(visible(doc["products/index.html"])), "8. Move is not called live");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
