/**
 * tools/verify-p28-content.mjs
 * 06 Nov 2026 v2
 *
 * v2 - The voice script is v2 (06 Nov: the voice set-up and the upload
 *   folder; the same 109 lines). v1 is archived in BNH-Files Archive/.
 *
 * P-28 EMPATHY-THREAD, S2 CONTENT DATA. Every line In Step's programme,
 * Guide me, the hold lines, the B finish lines and the E lines can show or
 * say is the approved wording, word for word (BNH-Files
 * Product/alongside_content_in-step-guide-me_05nov2026_v5.md, Graeme, 05
 * Nov). This gate READS that document and compares; it does not keep its
 * own copy of the words, so a line changed here and not there is red.
 *
 *   0  Positive controls: the wording and the prototype are reachable and
 *      parse to what they hold (24 episodes, four sessions, 8 hold lines,
 *      3 B lines, 2 E lines).
 *   1  In Step: 4 parts, 24 episodes in order, every line word for word;
 *      positions as the approved prototype has them.
 *   2  Guide me: the four sessions, their times, lines and Take three word
 *      for word; the ride is indoors only; the walk door offers both walks.
 *   3  Hold lines: word for word; each lands on the library's own holds;
 *      a hold shorter than its line gets nothing.
 *   4  Sooner: BEYOND moments from session 8; the empathy stages' floors
 *      and every in-stage gate move together; prompt wording unchanged.
 *   5  B lines: word for word; each said only when true; never on a Bad
 *      day, without a check-in, or beside an episode. E lines: word for word.
 *   6  Audio: every clip named in the data is in the voice script, and
 *      every clip in the voice script is named in the data (109).
 *   7  No research cited; no "should", score, streak or badge words.
 *   8  Archived first: the old scenarios file is in BNH-Files.
 *
 * Red on alongside-v705 (the new files do not exist).
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire as __cr } from "node:module";
import { schedulePath } from "./bnh-files.mjs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><body></body>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} });

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const done = () => {
  console.log(`\n${passes} passed, ${fails} failed`);
  process.exit(fails ? 1 : 0);
};

// ── Sources ───────────────────────────────────────────────────────────
const sched = schedulePath();
if (!sched) { ok("BNH-Files is reachable (clone it beside this repository or set BNH_FILES)", false); done(); }
const MOVE = path.resolve(path.dirname(sched), "..");
const read = rel => { const p = path.join(MOVE, rel); return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null; };
const WORDING = read("Product/alongside_content_in-step-guide-me_05nov2026_v5.md");
const PROTO   = read("Product/alongside_guide_me_prototype_05nov2026_v5.html");
const SCRIPT  = read("Product/alongside_voice_script_06nov2026_v2.csv");

// Italics are the only difference allowed: the wording sets a quoted
// phrase in *italics*, the app between quotation marks.
const norm = s => s == null ? s : String(s).replace(/[*“”]/g, "").replace(/’/g, "'").replace(/\s+/g, " ").trim();
const same = (a, b) => norm(a) === norm(b);

function parseEpisodes(src) {
  const out = [];
  const parts = src.split(/\n## Part ([B-E])\. /);
  for (let k = 1; k < parts.length; k += 2) {
    const part = { B: 1, C: 2, D: 3, E: 4 }[parts[k]], body = parts[k + 1];
    const why = body.match(/\*\*What this part is for.*?:\*\* \*(.+?)\*\n/)?.[1];
    const closing = body.match(/\*\*Part \d finishes with \(spoken, then shown\):\*\* \*(.+?)\*\n/)?.[1];
    const eps = body.split(/\n### Episode (\d) — /).slice(1);
    for (let i = 0; i < eps.length; i += 2) {
      const n = +eps[i], b = eps[i + 1];
      const hold = b.match(/\*\*Hold still:\*\* (.+?)\n/)?.[1] || "";
      const q = b.match(/\*\*Choose:\*\* (.+?)\n((?:- .+\n)+)/);
      out.push({
        part, episode: n, title: b.split("\n")[0].trim(),
        prev: b.match(/\*\*Next time opens with:\*\* \*(.+?)\*\n/)?.[1] || null,
        listen: b.match(/\*\*Listen:\*\* (.+?)\n/)?.[1],
        secs: +(hold.match(/(\d+) seconds\./)?.[1] || 0),
        hold: hold.match(/seconds\. \*(.+)\*$/)?.[1],
        question: q?.[1], options: q ? q[2].trim().split("\n").map(o => o.slice(2)) : [],
        carry: b.match(/\*\*Carry it:\*\* \*(.+?)\*\n/)?.[1],
        why, closing: n === 6 ? closing : null,
      });
    }
  }
  return out;
}
function section(src, tag) {
  const m = src.match(new RegExp(`\\n### ${tag}\\. (.+?)\\n([\\s\\S]*?)(?=\\n### |\\n---)`));
  return m ? { head: m[1], body: m[2] } : null;
}
function parseGuide(src, tag) {
  const s = section(src, tag); if (!s) return null;
  const b = s.body;
  const three = b.match(/\*\*Take three with you[^*]*:\*\*\n((?:\d\. .+\n)+)/)?.[1].trim().split("\n").map(l => l.slice(3)) || [];
  return {
    mins: +(s.head.match(/(\d+) minutes/)?.[1] || 0),
    before: b.match(/\*\*Before you start(?: \(on screen\))?:\*\* \*(.+?)\*\n/)?.[1],
    moments: [...b.matchAll(/\n\| (\d+):(\d\d) \| (.+?) \|/g)].map(m => ({ at: +m[1] * 60 + +m[2], text: m[3] })),
    three, road: b.match(/with this line: \*(.+?)\*\n/)?.[1] || null,
  };
}

console.log("\nTEST 0 - positive controls");
ok("0a. the approved wording v5 is reachable", !!WORDING);
ok("0b. the approved prototype v5 is reachable", !!PROTO);
ok("0c. the voice script v2 is reachable", !!SCRIPT);
if (!WORDING || !PROTO || !SCRIPT) done();
const W_EPS = parseEpisodes(WORDING);
ok("0d. the wording parses to 24 episodes, each with every part", W_EPS.length === 24 && W_EPS.every(e => e.listen && e.hold && e.secs && e.question && e.options.length === 3 && e.carry && e.why), String(W_EPS.length));
const W_GUIDE = { walk: parseGuide(WORDING, "A1"), run: parseGuide(WORDING, "A2"), ride: parseGuide(WORDING, "A3"), weather: parseGuide(WORDING, "A7") };
ok("0e. the wording parses to four guided sessions with moments and Take three", Object.values(W_GUIDE).every(g => g && g.before && g.moments.length === 5 + (g === W_GUIDE.walk ? 1 : 0) && g.three.length === 3));
const A4 = section(WORDING, "A4");
const W_HOLDS = A4 ? [...A4.body.matchAll(/\n\| \*\*(.+?)\*\* \| (.+?) \|/g)].map(m => ({ family: m[1], text: m[2] })) : [];
ok("0f. the wording has 8 hold lines", W_HOLDS.length === 8, String(W_HOLDS.length));
const A5 = section(WORDING, "A5");
const W_B = A5 ? [...A5.body.matchAll(/\n(\d)\. (.+)/g)].map(m => m[2]) : [];
ok("0g. the wording has 3 B lines", W_B.length === 3, String(W_B.length));
const A6 = section(WORDING, "A6");
const W_E = { planPage: A6?.body.match(/\*\*On the Plan page:\*\* (.+)/)?.[1], arcSetup: A6?.body.match(/\*\*When setting your arc:\*\* (.+)/)?.[1] };
ok("0h. the wording has the 2 E lines", !!(W_E.planPage && W_E.arcSetup));
const pi = PROTO.indexOf("const EPISODES = ");
const P_EPS = pi < 0 ? [] : JSON.parse(PROTO.slice(pi + 17, PROTO.indexOf("];", pi) + 1));
ok("0i. the prototype parses to 24 episodes", P_EPS.length === 24, String(P_EPS.length));

// ── The app's data ────────────────────────────────────────────────────
const B = new URL("../js/data/", import.meta.url).href;
let IS, GM, GMm, ET, LIB;
try {
  IS  = await import(B + "in-step-programme.js");
  GM  = await import(B + "guide-me.js");
  GMm = await import(B + "grounding-moments.js");
  ET  = await import(B + "empathy-transfer.js");
  LIB = (await import(B + "exercises/index.js")).EXERCISES;
} catch (e) {
  ok("the P-28 content modules load", false, e.message);
  done();
}

// Shared between the tests below.
const S  = GM.GUIDE_SESSIONS || {};
const H  = GMm.HOLD_LINES || [];
const BL = ET.FINISH_B_LINES || [];
let spoken = [];

// Each test runs on its own: one that throws is a FAIL, and the rest still run.
async function block(name, fn) {
  try { await fn(); } catch (e) { ok(`${name}: ran without throwing`, false, e.message); }
}

await block("TEST 1 - In Step programme", async () => {
console.log("\nTEST 1 - In Step's programme");
ok("1a. four parts, named as the wording names them", IS.PARTS?.length === 4 &&
  same(IS.PARTS[0].name, "You") && same(IS.PARTS[1].name, "People close to you") &&
  same(IS.PARTS[2].name, "People you pass") && same(IS.PARTS[3].name, "People whose lives look nothing like yours"));
ok("1b. 24 episodes, p1e1 to p4e6 in order", IS.EPISODES?.length === 24 &&
  IS.EPISODES.every((e, i) => e.id === `p${Math.floor(i / 6) + 1}e${i % 6 + 1}` && e.part === Math.floor(i / 6) + 1 && e.episode === i % 6 + 1));
const diff = [];
for (const [i, w] of W_EPS.entries()) {
  const e = IS.EPISODES?.[i] || {}, p = P_EPS[i] || {};
  const pairs = [["title", e.title, w.title], ["prev", e.prev, w.prev], ["listen", e.listen?.text, w.listen],
    ["hold line", e.hold?.text, w.hold], ["seconds", String(e.hold?.secs), String(w.secs)],
    ["question", e.choose?.question, w.question], ["carry", e.carry?.text, w.carry],
    ["why", IS.PARTS?.[w.part - 1]?.why, w.why],
    ["pose", e.hold?.pose, p.pose], ["how", e.hold?.how, p.posedesc], ["alt", e.hold?.alt?.text, p.seated]];
  for (const [k, a, b] of pairs) if (!same(a, b)) diff.push(`p${w.part}e${w.episode} ${k}: "${a}" vs "${b}"`);
  if ((e.choose?.options || []).length !== 3 || !w.options.every((o, j) => same(e.choose.options[j], o))) diff.push(`p${w.part}e${w.episode} options`);
  if (w.closing && !same(IS.PARTS?.[w.part - 1]?.closing?.text, w.closing)) diff.push(`part ${w.part} closing`);
}
ok("1c. every line word for word (only italics become quotation marks)", diff.length === 0, diff.slice(0, 4).join(" | "));
ok("1d. the line after every Choose is the wording's", same(IS.ACK?.text, "There's no wrong answer.") && /There's no wrong answer\./.test(WORDING));
ok("1e. the three answers are the wording's, with Schema v1.123's ids",
  JSON.stringify(IS.ANSWERS?.map(a => a.id)) === JSON.stringify(["did", "not-yet", "didnt"]) &&
  /It did \/ Not yet \/ It didn't come up/.test(WORDING) && same(IS.ANSWERS.map(a => a.label).join(" / "), "It did / Not yet / It didn't come up"));
ok("1f. the seated or standing way is labelled by what it is",
  IS.EPISODES.every(e => (e.hold.alt.label === "Standing") === /^Or stand/.test(e.hold.alt.text)));
ok("1g. order is kept: next after p1e6 is p2e1, nothing after p4e6",
  IS.nextEpisodeId("p1e6") === "p2e1" && IS.nextEpisodeId("p4e6") === null && IS.endsPart("p3e6") && !IS.endsPart("p3e5"));
});

await block("TEST 2 - Guide me", async () => {
console.log("\nTEST 2 - Guide me");
for (const id of ["walk", "weather", "run", "ride"]) {
  const s = S[id], w = W_GUIDE[id];
  const d = [];
  if (!s) d.push("missing");
  else {
    if (!same(s.before, w.before)) d.push("before");
    if (s.mins !== w.mins) d.push("minutes");
    if (s.moments.length !== w.moments.length) d.push("moment count");
    w.moments.forEach((m, j) => { if (s.moments[j]?.at !== m.at || !same(s.moments[j]?.text, m.text)) d.push(`moment ${j}`); });
    w.three.forEach((t, j) => { if (!same(s.three[j], t)) d.push(`three ${j}`); });
    if (s.three.length !== 3) d.push("three count");
    if (w.road && !same(s.roadLine, w.road)) d.push("road line");
  }
  ok(`2${"abcd"["walk weather run ride".split(" ").indexOf(id)]}. ${id}: times, lines and Take three word for word`, d.length === 0, d.join(", "));
}
ok("2e. nothing talks on a road ride; the indoor ride may guide", GM.canGuide(S.ride, { road: true }) === false && GM.canGuide(S.ride, { road: false }) === true && GM.canGuide(S.walk, { road: true }) === true);
ok("2f. the walk door offers both walks; run and ride one each",
  JSON.stringify(GM.sessionsForDoor("walk").map(s => s.id)) === JSON.stringify(["walk", "weather"]) &&
  GM.sessionsForDoor("run").length === 1 && GM.sessionsForDoor("ride").length === 1);
ok("2g. the joined recording is one file per session, never a clip's name",
  GM.trackFile(S.walk) === "audio/guide-walk.mp3" && Object.values(S).every(s => s.moments.every(m => `audio/${m.audio}.mp3` !== GM.trackFile(s))));
ok("2h. the screen shows the moment due at the time",
  GM.momentAt(S.walk, 59)?.at === 0 && GM.momentAt(S.walk, 60)?.at === 60 && GM.momentAt(S.walk, 5000)?.at === 1200);
});

await block("TEST 3 - while you hold", async () => {
console.log("\nTEST 3 - while you hold");
ok("3a. eight hold lines, word for word, family for family", H.length === 8 &&
  W_HOLDS.every((w, j) => same(H[j]?.text, w.text) && same(H[j]?.family, w.family)), H.map(h => h.id).join(","));
ok("3b. each line's length is its words said at 135 a minute, and fits a 30-second hold",
  H.every(h => h.secs === Math.ceil(h.text.split(/\s+/).length * 60 / 135) && h.secs <= 30));
const ex = id => LIB.find(e => e.id === id);
const fam = (id, o) => GMm.holdLineFamily(ex(id), o);
ok("3c. the library's holds land on their lines (fixtures exist)",
  ["plank", "side-plank-full", "isometric-wall-sit", "glute-bridge", "balance-single-leg-hold", "standing-quad-stretch", "seated-figure-4-stretch", "hip-flexor-stretch"].every(ex));
ok("3d. plank, side plank, wall sit, bridge", fam("plank") === "plank" && fam("side-plank-full") === "side-plank" && fam("side-plank-modified") === "side-plank" && fam("isometric-wall-sit") === "wall-sit" && fam("glute-bridge") === "bridge",
  [fam("plank"), fam("side-plank-full"), fam("isometric-wall-sit"), fam("glute-bridge")].join(","));
ok("3e. balance, seated stretch, first and later stretch",
  fam("balance-single-leg-hold") === "balance" && fam("standing-quad-stretch") === "balance" && fam("seated-figure-4-stretch") === "seated" &&
  fam("hip-flexor-stretch") === "stretch-1" && fam("hip-flexor-stretch", { later: true }) === "stretch-2");
ok("3f. a line is not offered on a hold shorter than it", GMm.selectHoldLine(ex("plank"), { holdSeconds: 5 }) === null && GMm.selectHoldLine(ex("plank"), { holdSeconds: 30 })?.id === "plank");
ok("3g. a lift gets no hold line", GMm.holdLineFamily({ name: "Goblet Squat", category: "strength", position: "standing" }) === null);
});

await block("TEST 4 - sooner, wording unchanged", async () => {
console.log("\nTEST 4 - sooner, wording unchanged");
ok("4a. BEYOND grounding moments open from session 8 (was 20)", GMm.DEPTH_FLOOR.beyond === 8 && GMm.DEPTH_FLOOR.place === 8 && GMm.DEPTH_FLOOR.contact === 0);
const F = ET.STAGE_SESSION_FLOOR;
ok("4b. close people from session 8, strangers from 20, then 28 and 43", F[1] === 0 && F[2] === 8 && F[3] === 20 && F[4] === 28 && F[5] === 43, JSON.stringify(F));
const gates = st => (ET.EMPATHY_PROMPTS[st] || []).map(p => +((p.requires || []).find(r => r.startsWith("minSessions:")) || ":0").split(":")[1]);
ok("4c. every stage has a prompt the day it opens (EMP-2)", [1, 2, 3, 4, 5].every(st => gates(st).some(g => g <= F[st])), [1, 2, 3, 4, 5].map(st => gates(st).join("/")).join(" "));
ok("4d. the in-stage gates moved with their stages", JSON.stringify([2, 3, 4, 5].map(gates)) === JSON.stringify([[0, 0, 0, 13], [0, 0, 23, 0, 27], [0, 31, 0, 36], [43, 46, 51, 48]]), JSON.stringify([2, 3, 4, 5].map(gates)));
const allText = Object.keys(ET.EMPATHY_PROMPTS).sort().map(k => ET.EMPATHY_PROMPTS[k].map(p => p.text).join("\n")).join("\n\n");
ok("4e. all 33 finish prompts are byte-identical to alongside-v705",
  Object.values(ET.EMPATHY_PROMPTS).flat().length === 33 &&
  crypto.createHash("sha256").update(allText).digest("hex") === "0541421eb25c9df9721ee34f951c4233c812728bec64c1915fa68ecb35281e7a");
ok("4f. a stage still cannot be entered before its floor", ET.canEnterStage(2, 7) === false && ET.canEnterStage(2, 8) === true && ET.canEnterStage(5, 42) === false);
});

await block("TEST 5 - B and E lines", async () => {
console.log("\nTEST 5 - B and E lines");
ok("5a. three B lines, word for word", BL.length === 3 && W_B.every((t, j) => same(BL[j]?.text, t)));
const el = c => ET.eligibleFinishBLines(c).map(l => l.id).join(",");
const base = { checkedInToday: true };
ok("5b. an ordinary check-in day: line 1 only", el(base) === "finish-line-1", el(base));
ok("5c. line 2 only after low energy or low mood", el({ ...base, lowEnergy: true }) === "finish-line-2,finish-line-1" && el({ ...base, lowMood: true }).startsWith("finish-line-2"));
ok("5d. line 3 only when the plan was lighter or a sore area left something out", el({ ...base, planLighter: true }).startsWith("finish-line-3") && el({ ...base, soreLeftOut: true }).startsWith("finish-line-3") && !el(base).includes("3"));
ok("5e. never on a Bad day, without a check-in, or beside an episode",
  el({ ...base, badDay: true, lowEnergy: true }) === "" && el({ lowEnergy: true }) === "" && el({ ...base, episodeOffered: true }) === "");
ok("5f. the two E lines, word for word", same(ET.PURPOSE_LINES?.planPage, W_E.planPage) && same(ET.PURPOSE_LINES?.arcSetup, W_E.arcSetup));
});

await block("TEST 6 - audio slots match the voice script", async () => {
console.log("\nTEST 6 - audio slots match the voice script");
// A small CSV reader: quoted fields may hold commas and doubled quotes.
function csvRows(src) {
  const rows = []; let row = [], f = "", q = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (q) { if (c === '"' && src[i + 1] === '"') { f += '"'; i++; } else if (c === '"') q = false; else f += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && src[i + 1] === "\n") i++; row.push(f); rows.push(row); row = []; f = ""; }
    else f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows.filter(r => r.length > 1);
}
const CSV = csvRows(SCRIPT).slice(1);
const clips = new Set(CSV.map(r => r[0].replace(/\.mp3$/, "")));
const named = new Set([
  ...IS.EPISODES.flatMap(e => [e.listen.audio, e.hold.audio, e.carry.audio]), ...IS.PARTS.map(p => p.closing.audio), IS.ACK.audio,
  ...Object.values(S).flatMap(s => s.moments.map(m => m.audio)), ...H.map(h => h.audio), ...BL.map(l => l.audio)]);
const missing = [...named].filter(a => !clips.has(a)), unused = [...clips].filter(c => !named.has(c));
ok("6a. the voice script has 109 clips", clips.size === 109, String(clips.size));
ok("6b. every clip the data names is in the voice script", missing.length === 0, missing.join(", "));
ok("6c. every clip in the voice script is named by the data", unused.length === 0, unused.join(", "));
const csvText = Object.fromEntries(CSV.map(r => [r[0].replace(/\.mp3$/, ""), r[4]]));
spoken = [...IS.EPISODES.flatMap(e => [e.listen, { text: e.hold.text, audio: e.hold.audio }, e.carry]), ...IS.PARTS.map(p => p.closing), IS.ACK,
  ...Object.values(S).flatMap(s => s.moments), ...H, ...BL];
const off = spoken.filter(x => !same(csvText[x.audio], x.text)).map(x => x.audio);
ok("6d. each clip's words are the words on screen", off.length === 0, off.slice(0, 5).join(", "));
});

await block("TEST 7 - nothing cited, nothing scored", async () => {
console.log("\nTEST 7 - nothing cited, nothing scored");
const NEW = ["in-step-programme.js", "guide-me.js"].map(f => fs.readFileSync(new URL(f, B), "utf8"));
const shown = [...spoken.map(x => x.text), ...IS.EPISODES.flatMap(e => [e.prev, e.title, e.choose.question, ...e.choose.options, e.hold.pose, e.hold.how, e.hold.alt.text]),
  ...IS.PARTS.flatMap(p => [p.name, p.why]), ...Object.values(S).flatMap(s => [s.before, s.title, ...s.three, s.roadLine]), ET.PURPOSE_LINES.planPage, ET.PURPOSE_LINES.arcSetup].filter(Boolean);
ok("7a. 220 or more lines are checked", shown.length >= 220, String(shown.length));
const cited = shown.filter(t => /\b(19|20)\d\d\b|et al|research|stud(y|ies)|scientists?/i.test(t));
ok("7b. no research cited in anything shown or heard", cited.length === 0, cited[0]);
// One approved line uses "score" about the inner voice, never about the
// person (Part 1, episode 3: "The other is keeping score."). It is named
// here so that nothing else can borrow the exception.
const ALLOWED = ["The other is keeping score."];
const bad = shown.filter(t => /\b(should|shouldn't|score|scores|streak|streaks|badges?|well done|great job|points)\b/i.test(ALLOWED.reduce((x, a) => x.replace(a, ""), t)));
ok("7c. no should, score, streak, badge or praise words", bad.length === 0, bad[0]);
ok("7d. the new files carry no research citation in their data", NEW.every(src => !/learnWhy|\(\d{4}\)/.test(src)));
});

await block("TEST 8 - archived before removing", async () => {
console.log("\nTEST 8 - archived before removing");
ok("8a. the old scenarios file is archived in BNH-Files", !!read("Archive/P-28 In Step Environment/in-step-scenarios_v705.js") &&
  /environment-4/.test(read("Archive/P-28 In Step Environment/in-step-scenarios_v705.js")));
});

done();
