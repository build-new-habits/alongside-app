/**
 * tools/verify-charset.mjs
 * 12 Oct 2026 v1
 *
 * A-8 SPEED (Stage AWARD). Lighthouse, 12 Oct, on v656: "charset" failed.
 * A browser looks for the character encoding in the first 1024 bytes of the
 * page; index.html's <meta charset> sat after about sixty lines of version
 * comments, past byte 1024, so the page could be parsed twice or with the
 * wrong encoding first (the app is full of curly quotes and dashes).
 *
 * The version header stays at the top (the project's rule); the change
 * notes follow the <meta charset>.
 */
import { readFileSync } from "node:fs";
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const bytes = Buffer.from(html, "utf8");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const at = bytes.indexOf(Buffer.from('<meta charset="UTF-8">'));
ok("1a. <meta charset=\"UTF-8\"> is within the first 1024 bytes", at >= 0 && at + 22 <= 1024, `at byte ${at}`);
ok("1b. the version header is still the first line", /^<!-- index\.html \| \d{2} [A-Z][a-z]{2} \d{4} v\d+ -->/.test(html));
ok("1c. one doctype, before <html>", (html.match(/<!DOCTYPE html>/gi) || []).length === 1 && html.search(/<!DOCTYPE html>/i) < html.search(/<html\b/));

console.log(`\nVERIFY-CHARSET: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
