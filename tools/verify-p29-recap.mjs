/**
 * tools/verify-p29-recap.mjs
 * 26 Nov 2026 v2
 *
 * v2 - P-42 S1. Part 5 follows Part 4, so Recognition (p4e6) now has a
 *   recap (approved with Part 5, verify-p42-adult holds its words); 1c reads
 *   the last episode, p5e6.
 *
 * 25 Nov 2026 v1
 *
 * P-29 INSTEP-RECAP. In Step's "Before we start" becomes "Last time"
 * (Graeme, 08 Nov: "These lack context. The question pops out of
 * nowhere."; the 23 lines and third answers approved 19 Nov, BNH-Files
 * Product/alongside_content_in-step-recap_19nov2026_v3.md). This gate READS
 * that document and compares; it keeps no copy of the words.
 *
 *   0  Positive controls: the approved document parses to 23 rows; the
 *      view mounts.
 *   1  The data: each of the 23 episodes carries its approved about line
 *      and third answer, word for word, and its recap clip; Part 4's five
 *      are held for their read; the old line is gone wherever the new recap
 *      replaces it, and kept where it waits; the answers' ids unchanged, the
 *      first two labelled I tried it and I forgot.
 *   2  Schema (v1.136): lastCarryAt is written with lastCarry as the local
 *      day; a malformed or missing one loads as null; the default holds it.
 *   3  When, in words: 0, 1, 3, 8 and 20 days and no date.
 *   4  The screen, for each of the 18 recaps that ship: Last time, when, the
 *      episode's title, what it was about, its Carry it word for word; Did
 *      you get to try it? names the three buttons; its own third answer;
 *      no more than 60 words before the first button; only the tap kept.
 *      A Part 4 recap keeps its old line. 3.2 names the car.
 *   5  The voice: on, the recap's clip plays as the screen opens, with
 *      Pause; off, nothing; a held recap is not voiced.
 *   6  The voice script (BNH-Files Product/alongside_voice_script_instep-
 *      recap_25nov2026_v1.csv): 23 clips, each the screen's words, and no
 *      when words (those are on screen only).
 *
 * Red on alongside-v748 (no about lines, no lastCarryAt, "Before we start").
 */
import fs from "node:fs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><body><div id="app"><main id="main-content"></main></div></body>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history; globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };

const audios = [];
let fileThere = false;
class FakeAudio {
  constructor(src) { this.src = src; this.ls = {}; this.paused = true; audios.push(this); }
  addEventListener(t, f) { (this.ls[t] ||= []).push(f); }
  fire(t) { (this.ls[t] || []).forEach(f => f()); }
  play() { this.paused = false; queueMicrotask(() => this.fire(fileThere ? "playing" : "error")); return Promise.resolve(); }
  pause() { this.paused = true; }
}
globalThis.Audio = FakeAudio;
let ALL_IDS = [];
globalThis.fetch = async (u) => { u = String(u); if (/audio\/manifest\.json$/.test(u)) return { ok: true, json: async () => ({ files: fileThere ? Object.fromEntries(ALL_IDS.map(id => [id, "abc123def4567890"])) : {} }) }; return { ok: fileThere }; };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const CA = await import(B + "coach-audio.js");
const { clipIds } = await import(new URL("./build-audio.mjs", import.meta.url).href);
ALL_IDS = clipIds();
const { router } = await import(B + "router.js");
router.navigate = () => {};
globalThis.router = router; dom.window.router = router;
const IS   = await import(B + "views/in-step.js");
const PROG = await import(B + "data/in-step-programme.js");
const OFF  = await import(B + "data/in-step-offer.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
async function block(name, fn) { try { await fn(); } catch (e) { ok(`${name}: ran without throwing`, false, e.stack?.split("\n").slice(0, 3).join(" | ")); } }
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const T = el => ((el || main).textContent || "").replace(/\s+/g, " ").trim();
const $ = s => main.querySelector(s);
const tap = s => { const el = typeof s === "string" ? $(s) : s; el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); return !!el; };
const prog = () => (store.get("inStepProgress") || {}).programme;
const words = s => (s.match(/[A-Za-z0-9’'“”"-]+/g) || []).length;
const dayKey = n => { const d = new Date(); d.setDate(d.getDate() - n); return OFF.localDay ? OFF.localDay(d) : d.toISOString().slice(0, 10); };

async function seed({ programme = null, voice = "off", files = false } = {}) {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", "personal"); store.set("name", "Sentinel-P29");
  if (programme) store.set("inStepProgress", { ...(store.get("inStepProgress") || {}), programme: { ...prog(), ...programme } });
  store.set("coachVoice", voice);
  audios.length = 0; fileThere = files; await CA.loadAudioManifest();
}
function mountInStep() { IS.onUnmount?.(); main.innerHTML = IS.render(); IS.onMount(); }
// The episode after `id`, opened from the list with `id`'s Carry it the last given.
async function openAfter(id, extra = {}) {
  const ids = PROG.EPISODES.map(e => e.id), i = ids.indexOf(id), next = PROG.EPISODES[i + 1];
  await seed({ programme: { part: next.part, episode: next.episode, done: ids.slice(0, i + 1), lastCarry: id, lastAnswer: null, ...extra.programme }, voice: extra.voice || "off", files: !!extra.files });
  mountInStep(); tap(".instep-next");
}

// ── The approved document ─────────────────────────────────────────────
const DOC_PATH = [
  new URL("../../bnh-files/Apps/Alongside Move/Product/alongside_content_in-step-recap_19nov2026_v3.md", import.meta.url),
].map(u => u.pathname).find(p => fs.existsSync(decodeURIComponent(p)));
const DOC = DOC_PATH ? fs.readFileSync(decodeURIComponent(DOC_PATH), "utf8") : "";
const ROWS = [...DOC.matchAll(/^\| (\d)\.(\d) \| (.+?) \| (.+?) \| (.+?) \| \*\*(.+?)\*\* \|$/gm)].map(m => ({
  id: `p${m[1]}e${m[2]}`, part: +m[1], title: m[3], about: m[4].replace(/\*\*/g, "").replace(/\s*\*\(v3\)\*/, "").trim(), third: m[6] }));

await block("TEST 0", async () => {
  console.log("\nTEST 0 - positive controls");
  ok("0a. the approved document is beside this repository (../bnh-files)", !!DOC, "BNH-Files not found");
  ok("0b. it holds the 23 recaps, 1.1 to 4.5", ROWS.length === 23 && ROWS[0].id === "p1e1" && ROWS[22].id === "p4e5", String(ROWS.length));
  await seed(); mountInStep();
  ok("0c. In Step mounts", $("h1")?.textContent.trim() === "In Step");
});

await block("TEST 1", async () => {
  console.log("\nTEST 1 - the data, word for word");
  const diff = [];
  for (const r of ROWS) {
    const e = PROG.getEpisode(r.id) || {};
    if (e.title !== r.title) diff.push(`${r.id} title`);
    if (e.about !== r.about) diff.push(`${r.id} about: "${e.about}"`);
    if (e.notCame !== r.third) diff.push(`${r.id} third: "${e.notCame}"`);
    if (e.recap?.audio !== `instep-recap-${r.part}-${r.id.slice(-1)}`) diff.push(`${r.id} clip`);
    if (!!e.recapHeld !== (r.part === 4)) diff.push(`${r.id} held`);
  }
  ok("1a. each of the 23 has its approved about line, third answer and clip", diff.length === 0, diff.slice(0, 4).join(" | "));
  ok("1b. Part 4's five wait for their read; Parts 1 to 3 ship", ROWS.filter(r => PROG.getEpisode(r.id).recapHeld).map(r => r.id).join() === "p4e1,p4e2,p4e3,p4e4,p4e5");
  ok("1c. the last episode has no recap (nothing follows it)", PROG.EPISODES.at(-1).id === "p5e6" && !PROG.getEpisode("p5e6").about);
  const ids = PROG.EPISODES.map(e => e.id);
  const prevLeft = ids.filter(id => PROG.getEpisode(id).prev).join();
  ok("1d. the old line is gone where the new recap replaces it, kept where it waits (p4e2 to p4e6)", prevLeft === "p4e2,p4e3,p4e4,p4e5,p4e6", prevLeft);
  ok("1e. the answers' ids are unchanged; the first two say I tried it and I forgot",
    JSON.stringify(PROG.ANSWERS.map(a => a.id)) === '["did","not-yet","didnt"]' && PROG.ANSWERS[0].label === "I tried it" && PROG.ANSWERS[1].label === "I forgot");
  ok("1f. every answer five words or fewer", PROG.EPISODES.filter(e => e.notCame).every(e => words(e.notCame) <= 5) && words(PROG.HELD_THIRD || "x x x x x x") <= 5);
  ok("1g. no failure words in any recap or answer", !PROG.EPISODES.some(e => /\b(fail(ed)?|missed|didn't manage)\b/i.test(`${e.notCame || ""}`)));
  ok("1h. 3.2 stands without its title: it names the car", /\ba car\b/.test(PROG.getEpisode("p3e2").about) && !PROG.getEpisode("p3e2").about.includes(PROG.getEpisode("p3e2").title));
  ok("1i. the recap clips are among the clips the app builds (build-audio clipIds)", ROWS.every(r => ALL_IDS.includes(PROG.getEpisode(r.id).recap?.audio)));
});

await block("TEST 2", async () => {
  console.log("\nTEST 2 - schema: lastCarryAt");
  await seed();
  ok("2a. the default holds lastCarryAt: null", prog() && "lastCarryAt" in prog() && prog().lastCarryAt === null, JSON.stringify(prog()));
  await seed({ programme: { part: 1, episode: 1, done: [] } });
  OFF.completeEpisode("p1e1");
  ok("2b. reaching Carry it writes today's local day with lastCarry", prog().lastCarry === "p1e1" && prog().lastCarryAt === dayKey(0), JSON.stringify(prog()));
  for (const [bad, label] of [["yesterday", "a word"], [12345, "a number"], ["2026-13-45", "not a date"]]) {
    localStorage.clear(); store.init();
    store.set("inStepProgress", { programme: { ...prog(), lastCarry: "p1e2", lastCarryAt: bad } });
    store.init();
    ok(`2c. ${label} loads as null`, prog().lastCarryAt === null && prog().lastCarry === "p1e2", JSON.stringify(prog()));
  }
  store.set("inStepProgress", { programme: { ...prog(), lastCarryAt: "2026-11-20" } }); store.init();
  ok("2d. control: a real day is kept on load", prog().lastCarryAt === "2026-11-20");
  const older = { ...prog() }; delete older.lastCarryAt;
  store.set("inStepProgress", { programme: older }); store.init();
  ok("2e. an older record gains null", prog().lastCarryAt === null);
});

await block("TEST 3", async () => {
  console.log("\nTEST 3 - when, in words");
  const now = new Date(2026, 10, 25, 20, 0);   // Wednesday 25 Nov 2026, 8 pm
  const ago = n => { const d = new Date(2026, 10, 25 - n); return OFF.localDay(d); };
  const W = OFF.whenWords;
  ok("3a. the same day: Earlier today", W(ago(0), now) === "Earlier today");
  ok("3b. one day: Yesterday", W(ago(1), now) === "Yesterday");
  ok("3c. three days: On Sunday", W(ago(3), now) === "On Sunday", W(ago(3), now));
  ok("3d. eight days: Last week", W(ago(8), now) === "Last week");
  ok("3e. twenty days: A while ago", W(ago(20), now) === "A while ago");
  ok("3f. no date: Last time", W(null, now) === "Last time" && W(undefined, now) === "Last time");
  ok("3g. edges: six days a weekday, seven Last week, thirteen Last week, fourteen A while ago",
    /^On /.test(W(ago(6), now)) && W(ago(7), now) === "Last week" && W(ago(13), now) === "Last week" && W(ago(14), now) === "A while ago");
});

await block("TEST 4", async () => {
  console.log("\nTEST 4 - the screen");
  const shipped = ROWS.filter(r => r.part < 4);
  const faults = [];
  let most = 0;
  for (const r of shipped) {
    const e = PROG.getEpisode(r.id);
    await openAfter(r.id, { programme: { lastCarryAt: dayKey(1) } });
    const said = T($(".instep-said")).replace(/Speaking|Pause the voice/g, "").trim();
    const btns = [...main.querySelectorAll("[data-answer]")].map(b => T(b));
    const group = $(".instep-answers");
    const q = group && document.getElementById(group.getAttribute("aria-labelledby"));
    const expect = `Yesterday, in “${e.title}”, we talked about ${e.about}. I left you with one thing to try: “${e.carry.text}”`;
    if ($("h1")?.textContent.trim() !== "Last time") faults.push(`${r.id} heading "${$("h1")?.textContent}"`);
    if (said !== expect) faults.push(`${r.id} said: ${said}`);
    if (T(q) !== "Did you get to try it?") faults.push(`${r.id} question`);
    if (btns.join(" / ") !== `I tried it / I forgot / ${e.notCame}`) faults.push(`${r.id} buttons ${btns.join(" / ")}`);
    most = Math.max(most, words(said));
  }
  ok("4a. each of the 18: Last time, when, the title, what it was about, its Carry it word for word", !faults.some(f => /heading|said/.test(f)), faults.filter(f => /heading|said/.test(f)).slice(0, 2).join(" | "));
  ok("4b. Did you get to try it? names the three buttons (aria-labelledby)", !faults.some(f => /question/.test(f)), faults.find(f => /question/.test(f)));
  ok("4c. I tried it, I forgot, and the episode's own third answer", !faults.some(f => /buttons/.test(f)), faults.find(f => /buttons/.test(f)));
  ok("4d. no more than 60 words before the first button", most > 0 && most <= 60, String(most));
  await openAfter("p1e1", { programme: { lastCarryAt: null } });
  ok("4e. no date kept: Last time, in “Three answers”", /^Last time, in “Three answers”, we talked about/.test(T($(".instep-said")).replace(/Speaking/g, "").trim()), T($(".instep-said")).slice(0, 80));
  ok("4f. only the tap is kept, said plainly", /Only your tap is kept\. No score, nothing to write\./.test(T()));
  tap('[data-answer="not-yet"]');
  ok("4g. I forgot keeps not-yet, and the episode starts", prog().lastAnswer === "not-yet" && $("h1")?.textContent.trim() === PROG.getEpisode("p1e2").title);
  await openAfter("p1e1");
  tap('[data-answer="didnt"]');
  ok("4h. the third answer keeps didnt", prog().lastAnswer === "didnt");
  await openAfter("p1e1"); tap("#is-skip-prev");
  ok("4i. Skip keeps nothing and starts", prog().lastAnswer === null && $("h1")?.textContent.trim() === PROG.getEpisode("p1e2").title);
  mountInStep(); tap(".instep-next");
  ok("4j. control: skipped, it is asked again next time", $("h1")?.textContent.trim() === "Last time");
  await openAfter("p4e1");
  const held = T($(".instep-said")).replace(/Speaking/g, "").trim();
  const oldLine = id => PROG.getEpisode(id).prev.replace(/\s*Did it come up\?$/, "");
  ok("4k. a Part 4 recap waits for its read: the line it had (asked once, by the new question), and It didn't come up", held === oldLine("p4e2") &&
    [...main.querySelectorAll("[data-answer]")].map(b => T(b)).join(" / ") === "I tried it / I forgot / It didn't come up", held);
  await openAfter("p4e5");
  ok("4l. the last recap before 4.6 is held as well", T($(".instep-said")).replace(/Speaking/g, "").trim() === oldLine("p4e6"));
});

await block("TEST 5", async () => {
  console.log("\nTEST 5 - the voice");
  await openAfter("p2e3", { voice: "on", files: true }); await wait(10);
  const asked = audios.map(a => a.src);
  ok("5a. voice on, clip there: the recap's own clip plays as the screen opens", asked.some(s => /instep-recap-2-3\.mp3/.test(s)), asked.join(", "));
  ok("5b. with Pause the voice", $("#is-pause") && $("#is-pause").hidden === false, String($("#is-pause")?.hidden));
  await openAfter("p2e3", { voice: "off" }); await wait(10);
  ok("5c. voice off: nothing plays, the words are on screen", audios.length === 0 && /The same worry again/.test(T()));
  await openAfter("p4e1", { voice: "on", files: true }); await wait(10);
  ok("5d. a held recap is not voiced", !audios.some(a => /instep-recap/.test(a.src)));
});

await block("TEST 6", async () => {
  console.log("\nTEST 6 - the voice script says the screen's words");
  const SP = decodeURIComponent(new URL("../../bnh-files/Apps/Alongside Move/Product/alongside_voice_script_instep-recap_25nov2026_v1.csv", import.meta.url).pathname);
  const src = fs.existsSync(SP) ? fs.readFileSync(SP, "utf8") : "";
  ok("6a. the recap voice script is beside this repository", !!src);
  const rows = src.split("\n").slice(2).filter(Boolean).map(l => { const m = l.match(/^([^,]+)\.mp3,[^,]*,"[^"]*",\d+,"(.*)"$/); return m ? { id: m[1], text: m[2].replace(/""/g, '"') } : null; }).filter(Boolean);
  ok("6b. 23 clips, one per recap", rows.length === 23 && rows.every(r => /^instep-recap-[1-4]-[1-6]$/.test(r.id)), String(rows.length));
  const off = rows.filter(r => {
    const e = PROG.EPISODES.find(x => x.recap?.audio === r.id);
    return !e || r.text !== `Last time, in '${e.title}', we talked about ${e.about}. I left you with one thing to try: '${e.carry.text}' Did you get to try it?`;
  }).map(r => r.id);
  ok("6c. each clip's words are the screen's (title, about, Carry it word for word)", rows.length > 0 && off.length === 0, off.join(", "));
  ok("6d. no when words in any clip (they are on screen only)", rows.length > 0 && !rows.some(r => /\b(Earlier today|Yesterday|On (Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day|Last week|A while ago)\b/.test(r.text)));
});

console.log(`\n${"=".repeat(60)}\nVERIFY-P29-RECAP: ${passes} passed, ${fails} failed\n${"=".repeat(60)}`);
process.exit(fails ? 1 : 0);
