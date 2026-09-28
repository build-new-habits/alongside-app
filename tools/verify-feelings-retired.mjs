/**
 * tools/verify-feelings-retired.mjs
 * 28 Sep 2026 v1
 *
 * FEELINGS-RETIRE. The feeling-word selection is gone, all of it.
 *
 * Graeme, 27 Sep: "Forget the word selection." SMOOTH-P1 took the word
 * panel out of the check-in. Asked on 28 Sep whether it was retired, the
 * honest answer was "from the screen, not from the app":
 *   - data/feelings.js and data/signal-words.js -- the word lists,
 *     including the words the WORDS item held back for safeguarding
 *     review -- were still shipped and precached, imported by nothing;
 *   - the coach still read lastCheckin.feelingWord, and the check-in
 *     opening "Last time you said you were feeling {word}. I've been
 *     holding onto that." would still say a word stored before P1 back
 *     to somebody, once, at their next check-in;
 *   - lastCheckin.feelingWord / feelingQuadrant, checkin.feelingWordDepth
 *     and any word in checkinHistory stayed in stored data, and so in
 *     Download your data.
 *
 * This gate drives an install that answered the word question before P1
 * ("hopeless") and requires the app to hold no word, say no word, and
 * ship no word list.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const fs = __require("node:fs");

const dom = new JSDOM("<!doctype html>", { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });

const R = new URL("../", import.meta.url);
const B = new URL("../js/", import.meta.url).href;
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const walk = rel => fs.readdirSync(new URL(rel, R), { withFileTypes: true }).flatMap(d =>
  d.isDirectory() ? walk(rel + d.name + "/") : (d.name.endsWith(".js") ? [rel + d.name] : []));

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};

// ── 1. NO WORD LIST SHIPS ───────────────────────────────────────────────
console.log("\nTEST 1 - no word list ships");
ok("1a. data/feelings.js and data/signal-words.js are gone", !fs.existsSync(new URL("js/data/feelings.js", R)) && !fs.existsSync(new URL("js/data/signal-words.js", R)));
const sw = fs.readFileSync(new URL("sw.js", R), "utf8");
ok("1b. and are not precached", !/data\/(feelings|signal-words)\.js"/.test(sw));
const JS = walk("js/");
// The names may appear only where a word is being THROWN AWAY: store.js
// on load and data/checkin.js on save. Every such line must be a delete
// or a destructure that discards it.
const NAMES = /\b(feelingWord|feelingQuadrant|feelingWordDepth|lastFeelingWord)\b/;
const DISCARD = /\bdelete\b|const \{ ?feelingWord|'feelingWord' in/;
const readers = JS.flatMap(f => strip(fs.readFileSync(new URL(f, R), "utf8")).split("\n")
  .filter(l => NAMES.test(l) && !(["js/store.js", "js/data/checkin.js"].includes(f) && DISCARD.test(l)))
  .map(l => `${f}: ${l.trim().slice(0, 80)}`));
ok("1c. nothing in the app reads or writes a feeling word (store.js and saveCheckin only throw them away)", JS.length > 100 && readers.length === 0, readers.join("\n        "));

// ── 2. AN INSTALL FROM BEFORE P1 ────────────────────────────────────────
console.log("\nTEST 2 - somebody who picked a word before P1: nothing kept, nothing said");
const d = n => new Date(Date.now() - n * 864e5).toISOString().split("T")[0];
localStorage.setItem("alongside_user", JSON.stringify({
  onboardingComplete: true, name: "T",
  lastCheckin: { date: d(1), energy: 3, mood: 2, feelingWord: "hopeless", feelingQuadrant: "low-low", unwell: false, timestamp: null },
  checkin: { lastOpeningMode: null, openingModeHistory: [], feelingWordDepth: 2, lastMilestoneNoticed: null },
  checkinHistory: { [d(3)]: { energy: 4, mood: 4, feelingWord: "flat" }, [d(2)]: { energy: 3, mood: 3, feelingWord: "heavy", feelingQuadrant: "low-low" }, [d(1)]: { energy: 3, mood: 2, feelingWord: "hopeless" } },
}));
const { store } = await import(B + "store.js");
store.init();
store.set("name", "T");   // any write saves what the store now holds
const saved = localStorage.getItem("alongside_user") || "";
ok("2a. no stored word survives loading (lastCheckin, history, engine state)",
   !/hopeless|"flat"|"heavy"|feelingWord|feelingQuadrant|feelingWordDepth/.test(saved), saved.match(/.{0,40}(hopeless|feelingWord|feelingQuadrant|feelingWordDepth).{0,20}/)?.[0]);
ok("2b. FIXTURE REACH: the rest of that check-in history is kept", Object.keys(store.get("checkinHistory") || {}).length === 3 && store.get("lastCheckin.energy") === 3);
const { resolveOpening } = await import(B + "data/checkin-openings.js");
const lines = Array.from({ length: 12 }, () => { const o = resolveOpening(); return `${o.b1} ${o.b2}`; }).join(" ");
ok("2c. the next check-in's opening never says a word back", !/hopeless|feeling \{|holding onto that/i.test(lines), lines.slice(0, 160));
const src = strip(fs.readFileSync(new URL("js/data/checkin-openings.js", R), "utf8"));
ok("2d. and the line that did is gone", !/feeling-word-carry|lastFeelingWord/.test(src));

// ── 3. THE CHECK-IN STILL WORKS ─────────────────────────────────────────
console.log("\nTEST 3 - a check-in saved now stores energy, mood and nothing else about feeling");
const { checkinData } = await import(B + "data/checkin.js");
checkinData.saveCheckin({ energy: 6, mood: 7, unwell: false });
const today = new Date().toISOString().split("T")[0];
ok("3a. energy and mood are stored", store.get("lastCheckin.energy") === 6 && (store.get("checkinHistory") || {})[today]?.mood === 7);
ok("3b. and no feeling field is written", !("feelingWord" in (store.get("lastCheckin") || {})) && !("feelingWord" in ((store.get("checkinHistory") || {})[today] || {})));

console.log("");
if (fails) { console.log(`FEELINGS-RETIRED: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`FEELINGS-RETIRED: all ${passes} assertions pass\n`);
process.exit(0);
