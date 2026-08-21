/**
 * tools/verify-reentry2.mjs
 * 21 Aug 2026 v2
 * GATE-PATH. Path resolution only -- no assertion changed.
 *
 * 20 Aug 2026 v1
 *
 * REENTRY-2 — coming back after a break.
 *
 * WHY. getReEntryContext() set needsGentlerStart only for 'illness', so
 * somebody returning after three weeks away for work resumed at FULL
 * phase intensity. Detraining does not care why you were away, and that
 * is how people come back, find it too hard, and stop. There was also no
 * injury option at all — a person returning from one was choosing
 * between "life got full" and "finding it harder", neither true, neither
 * stepping anything down.
 *
 * THE DISTINCTION THIS GATE PROTECTS, and it is the whole design:
 *
 *   IMPOSED  (illness, injury) — stepped down without asking. Both carry
 *            a reason to be careful that is not the person's to override
 *            on the first session back.
 *
 *   OFFERED  (life, harder) — declinable. Telling somebody who feels
 *            fine that they have lost ground is its own insult.
 *
 * Collapsing those two into one behaviour in either direction is the
 * failure. Imposing on everyone is patronising; offering to everyone
 * leaves the person who has been ill to make a clinical call.
 *
 * SOURCE OF TRUTH: Schema.md v1.37 section 8.
 */

// GATE-PATH, 21 Aug 2026. jsdom resolved through Node rather than by
// absolute path into one machine's node_modules.
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);

import fs from "node:fs";

const read = p => fs.readFileSync(new URL("../" + p, import.meta.url), "utf8");

let failures = 0;
const check = (name, ok, detail = "") => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
  if (!ok) failures++;
};

console.log("\nREENTRY-2 — returning after a break\n");

// ── Behavioural half: the engine is pure enough to execute directly ──
const { JSDOM } = __require("jsdom");
const dom = new JSDOM("<!doctype html><div></div>",
  { url: "https://build-new-habits.github.io/alongside-app/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });

const BASE = new URL("../js/", import.meta.url).href;
const { store } = await import(BASE + "store.js");
const PE = await import(BASE + "data/programmeEngine.js");

// Seed a session 21 days ago — Graeme's three weeks away for work.
function seed(context, gapDays = 21) {
  localStorage.clear();
  store.init();
  const then = new Date(Date.now() - gapDays * 864e5).toISOString();
  store.set("progressLog", [{ date: then }]);
  store.set("absence.context", context);
  store.set("absence.returnCapturedAt", new Date().toISOString());
  return PE.getReEntryContext();
}

// ── 1. The imposed half ──────────────────────────────────────────────
for (const ctx of ["illness", "injury"]) {
  const r = seed(ctx);
  check(`"${ctx}" steps down WITHOUT asking`,
    r?.needsGentlerStart === true,
    `needsGentlerStart=${r?.needsGentlerStart}`);
  check(`"${ctx}" holds the programme week rather than advancing`,
    r?.holdWeek === true);
  check(`"${ctx}" actually lowers the intensity`,
    PE.getReEntryIntensity(ctx, "challenging") === "moderate",
    `challenging -> ${PE.getReEntryIntensity(ctx, "challenging")}`);
}

// ── 2. The offered half — the change Graeme asked for ────────────────
for (const ctx of ["life", "harder"]) {
  const r = seed(ctx);
  check(`"${ctx}" OFFERS a gentler start`,
    r?.offersGentlerStart === true,
    `three weeks away costs fitness whatever the reason`);
  check(`"${ctx}" does not impose it`,
    r?.needsGentlerStart === false,
    "somebody away by choice who feels fine is not told they lost ground");
  check(`"${ctx}" does not hold the programme week`,
    r?.holdWeek === false,
    "three weeks at a conference is not a reason to repeat a week");
}

// ── 3. The two halves must stay distinct ─────────────────────────────
//
// The load-bearing inverse. If a later change makes every context
// behave the same way, every check above still passes individually.
{
  const all = ["illness", "injury", "life", "harder"].map(c => seed(c));
  const imposed = all.filter(r => r.needsGentlerStart).length;
  const offered = all.filter(r => r.offersGentlerStart).length;
  check("exactly two contexts impose and two offer",
    imposed === 2 && offered === 2,
    `${imposed} impose, ${offered} offer — collapsing these is the failure ` +
    "this gate exists for, in either direction");
  check("no context both imposes and offers",
    all.every(r => !(r.needsGentlerStart && r.offersGentlerStart)));
}

// ── 4. Injury asks, and only injury ──────────────────────────────────
{
  check('"injury" asks what still hurts', seed("injury").asksWhatHurts === true);
  for (const ctx of ["illness", "life", "harder"]) {
    check(`"${ctx}" does NOT ask what hurts`, seed(ctx).asksWhatHurts === false,
      "only injury has a reason to ask");
  }
}

// ── 5. No gap, no adaptation ─────────────────────────────────────────
{
  const r = seed("injury", 2);
  check("a 2-day gap is not a return at all", r === null,
    "the door must not appear for somebody training normally");
}

// ── 6. Source-text companions ────────────────────────────────────────
const cp = read("js/views/coach-proposal.js");

check("the return door offers an injury option",
  /data-return-context="injury"/.test(cp),
  "there was none, so a returning injured person had no true answer");

check("getReEntryIntensity is passed the REAL context, not a literal",
  !/getReEntryIntensity\(\s*['"]illness['"]\s*,\s*effectiveIntensity\s*\)[\s\S]{0,80}needsGentlerStart/.test(cp) &&
  /getReEntryIntensity\(reEntryCtx\.context/.test(cp),
  "it was hardcoded to 'illness' regardless of what the person said");

check("declining a gentler start is a real, equally-weighted choice",
  /data-gentler="no"/.test(cp) && /data-gentler="yes"/.test(cp));

check('"nothing to flag" does not clear the step down',
  /asksWhatHurts:\s*false/.test(cp) && !/needsGentlerStart:\s*false[\s\S]{0,120}data-hurts/.test(cp),
  "saying nothing hurts is not a claim to be back to full");

check("the offer states physiology, never a judgement",
  /whatever the reason/.test(cp) && !/you have let|slipped behind|lost your/i.test(cp));

console.log(failures === 0
  ? "\nREENTRY-2 GATE GREEN\n"
  : `\nREENTRY-2 GATE RED — ${failures} failure(s)\n`);
process.exit(failures === 0 ? 0 : 1);
