/**
 * tools/verify-adapt1.mjs
 * 11 Sep 2026 v1
 *
 * ADAPT-1. "Other ways to do this" -- adaptations as options the person
 * chooses, never a choice the app makes for them.
 *
 * ── WHY IT EXECUTES ─────────────────────────────────────────────────
 *
 * CARD-TDZ is the standing reason: a source-slice gate cannot see a
 * runtime fault, and five source-text gates passed while behaviour was
 * broken on 20 Aug alone. Every assertion below that matters CALLS
 * renderExerciseCard() with real store state.
 *
 * ── THE LIMIT IN verify-card3 THIS GATE COVERS ──────────────────────
 *
 * verify-card3 test 2c forbids "<details" inside the `doBody` SOURCE
 * slice, to keep hazards out of any disclosure. ADAPT-1 builds its
 * disclosure above that slice, so 2c stays green -- and that is exactly
 * why 2c cannot see it. Test 3 below asserts the same guarantee on
 * RENDERED html instead: both hazard blocks appear before, and outside,
 * any <details>. Stronger than 2c, not a way around it.
 *
 * ── THE ADAPTED SET IS EXACT, NOT A MINIMUM ─────────────────────────
 *
 * ADAPTED_IDS lists every entry that carries `adaptations`, in the style
 * of verify-link's known-failure list. A content session that adds a
 * tenth entry must update this list on purpose. Unreviewed content
 * cannot arrive quietly.
 *
 * Reversals are in the blueprint, section 8.4.
 */
import { JSDOM } from "jsdom";
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: "https://example.org/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;

let pass = 0, fail = 0; const fails = [];
const ok = (m, c) => { if (c) { pass++; console.log("  ok   " + m); }
  else { fail++; fails.push(m); console.log("  FAIL " + m); } };
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const fs = await import("node:fs");
const { store } = await import("../js/store.js");
const { EXERCISES } = await import("../js/data/exercises/index.js");
const { renderExerciseCard } = await import("../js/exercise-card.js");
const { setDisplayPref } = await import("../js/display-prefs.js");

const byId = new Map(EXERCISES.map(e => [e.id, e]));

// The exact set. Update deliberately when a reviewed entry is added.
const ADAPTED_IDS = [
  "adductor-stretch-standing",
  "bulgarian-split-squat",
  "dead-bug",
  "glute-bridge",
  "glute-bridge-single-leg",
  "hip-flexor-stretch",
  "ql-stretch-side-bend",
  "side-plank-full",
  "side-plank-modified",
].sort();

const BANNED     = /\b(easy|easier|easiest|hard|harder|hardest|beginner|advanced|intermediate|modified|regression|progression|basic|proper)\b/i;
const PRESCRIBES = /\b(should|must|need to|needs to|have to|has to)\b/i;
const KILOS      = /\b(kg|kilo|kilos|kilogram|kilograms)\b/i;

const setSore = (map) => {
  store.set("conditions", Object.keys(map));
  store.set("conditionPainScores", map);
};

// ── FIXTURES ────────────────────────────────────────────────────────
const BOTH = {
  id: "fx-both", name: "Fixture both", category: "strength",
  affectsAreas: ["lower-back"],
  watchOut: ["Knees falling inwards"],
  instructions: ["Set up", "Move"],
  coaching: "One thing",
  adaptations: {
    easeOff: ["If your back lifts, keep both feet on the floor."],
    further: ["When this feels steady, lift one foot."],
  },
};
const FURTHER_ONLY = { ...BOTH, id: "fx-further", adaptations: { further: BOTH.adaptations.further } };
const OTHER_AREA   = { ...FURTHER_ONLY, id: "fx-other", affectsAreas: ["shoulder"] };
const NONE         = { ...BOTH, id: "fx-none", adaptations: undefined };
const ESCAPES      = { ...BOTH, id: "fx-esc",
  adaptations: { easeOff: ["If <b>this</b> happens, try that."] } };

const R = (ex, opts = {}) => renderExerciseCard(ex, { idPrefix: "t", ...opts });
const between = (html) => {
  const a = html.indexOf("<details");
  if (a < 0) return "";
  return html.slice(a, html.indexOf("</details>", a) + 10);
};

console.log("\nADAPT-1 — other ways to do this\n");

// ════════════════════════════════════════════════════════════════════
console.log("TEST 1 — the data");

ok("1.1 the adapted set is exactly the reviewed list", (() => {
  const found = EXERCISES.filter(e => e.adaptations).map(e => e.id).sort();
  const same = found.length === ADAPTED_IDS.length && found.every((id, i) => id === ADAPTED_IDS[i]);
  if (!same) console.log("       found: " + JSON.stringify(found));
  return same;
})());

{
  let shapeBad = [], startBad = [], longBad = [], wordBad = [];
  for (const id of ADAPTED_IDS) {
    const e = byId.get(id);
    if (!e || !e.adaptations) { shapeBad.push(id + ": missing"); continue; }
    const keys = Object.keys(e.adaptations);
    if (keys.some(k => k !== "easeOff" && k !== "further")) shapeBad.push(id + ": unknown key");
    if (keys.length === 0) shapeBad.push(id + ": empty");
    for (const k of keys) {
      const list = e.adaptations[k];
      if (!Array.isArray(list) || list.length < 1 || list.length > 3) { shapeBad.push(id + "." + k + ": 1-3 items"); continue; }
      for (const s of list) {
        if (typeof s !== "string" || !s.trim()) { shapeBad.push(id + "." + k + ": empty string"); continue; }
        const prefix = k === "easeOff" ? "If " : "When ";
        if (!s.startsWith(prefix)) startBad.push(id + "." + k + ': "' + s.slice(0, 24) + '"');
        if (s.split(/\s+/).length > 60) longBad.push(id + "." + k);
        const m = s.match(BANNED) || s.match(PRESCRIBES) || s.match(KILOS);
        if (m) wordBad.push(id + "." + k + ": " + m[0]);
      }
    }
  }
  ok("1.2 shape: only easeOff/further, 1-3 non-empty items each" + (shapeBad.length ? "  [" + shapeBad.join("; ") + "]" : ""), shapeBad.length === 0);
  ok("1.3 easeOff items start \"If \", further items start \"When \"" + (startBad.length ? "  [" + startBad.join("; ") + "]" : ""), startBad.length === 0);
  ok("1.4 no item runs past 60 words" + (longBad.length ? "  [" + longBad.join("; ") + "]" : ""), longBad.length === 0);
  ok("1.5 no ranking word, no instruction, no kilos" + (wordBad.length ? "  [" + wordBad.join("; ") + "]" : ""), wordBad.length === 0);
}

{
  const rdl = byId.get("dumbbell-romanian-deadlift");
  const hinge = byId.get("hip-hinge-drill");
  const bss = byId.get("bulgarian-split-squat");
  const joined = ex => (ex.watchOut || []).join(" || ");
  ok("1.6a RDL: the knee cue no longer reads as keep your legs straight",
     !/Bending the knees to reach lower/.test(joined(rdl)) && /turns into a squat/.test(joined(rdl)));
  ok("1.6b hip hinge: same correction",
     !/^Bending the knees more as you go down$/m.test(joined(hinge)) && /keep it while your hips travel back/.test(joined(hinge)));
  ok("1.6c Bulgarian split squat: the forward lean is no longer listed as a fault",
     !/turns it into a hinge/.test(joined(bss)) && /drive/i.test(bss.coaching || ""));
}

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 2 — the disclosure renders, and only where it should");

setSore({});
const doBoth = R(BOTH, { page: "do" });

ok("2.0 FIXTURE REACH: both item texts render on DO",
   doBoth.includes("keep both feet on the floor") && doBoth.includes("lift one foot"));
ok("2.1 one disclosure, labelled, with both groups",
   doBoth.includes("<details") &&
   doBoth.includes("Other ways to do this") &&
   doBoth.includes("To ease off") && doBoth.includes("To go further") &&
   (doBoth.match(/<details/g) || []).length === 1);

ok("2.1b an entry with no adaptations renders no disclosure",
   !R(NONE, { page: "do" }).includes("<details"));

setSore({ "lower-back": 5 });
ok("2.2 no empty disclosure: further-only, worked area sore, renders nothing",
   !R(FURTHER_ONLY, { page: "do" }).includes("<details"));

ok("2.3a hazards render before any disclosure", (() => {
  const h = R(BOTH, { page: "do" });
  const d = h.indexOf("<details");
  return d > -1 && h.indexOf("What to watch for") < d && h.indexOf("If it hurts") < d;
})());
ok("2.3b no hazard text sits inside the disclosure", (() => {
  const inner = between(R(BOTH, { page: "do" }));
  return inner.length > 0 && !inner.includes("What to watch for") && !inner.includes("If it hurts");
})());

setSore({});
ok("2.4 DECIDE and NOTE carry no disclosure",
   !R(BOTH, { page: "decide" }).includes("<details") &&
   !R(BOTH, { page: "note", noteSlot: "<p>note</p>" }).includes("<details"));

// "Show everything" is a stored display preference, not a card option.
// Passing { full: true } proves nothing -- the card never reads it. This
// fixture sets the real preference and puts it back afterwards.
ok("2.5 \"Show everything\" renders it open", (() => {
  setDisplayPref("fullInstructions", "on");
  const flat = R(BOTH);
  setDisplayPref("fullInstructions", "off");
  const paged = R(BOTH, { page: "do" });
  return /<details[^>]*\sopen/.test(flat) && !/<details[^>]*\sopen/.test(paged);
})());

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 3 — what today changes");

setSore({ "lower-back": 5 });
{
  const h = R(BOTH, { page: "do" });
  ok("3.1 worked area sore: To go further is withheld, To ease off is not",
     h.includes("To ease off") && !h.includes("To go further"));

  const real = byId.get("glute-bridge-single-leg");
  const dec = R(real, { page: "decide" });
  const dd  = R(real, { page: "do" });
  const nn  = R(real, { page: "note", noteSlot: "<p>note</p>" });
  ok("3.2 FIXTURE REACH: the real entry produces a caution", dec.includes("exercise-caution"));
  ok("3.3 pointer on DECIDE says on the next page", /other ways to do this one on the next page/.test(dec));
  ok("3.4 pointer on DO says below", /other ways to do this one below/.test(dd));
  ok("3.5 no pointer on NOTE", !/other ways to do this one/.test(nn));
}

{
  const db = byId.get("dead-bug");
  const h = R(db, { page: "do" });
  ok("3.6 sore elsewhere: the general caution fires and the pointer still shows",
     h.includes("exercise-caution") && /carrying something sore/.test(h) &&
     /other ways to do this one below/.test(h));
}

ok("3.7 a caution with no ways to ease off gets no pointer", (() => {
  const h = R(OTHER_AREA, { page: "do" });
  return h.includes("exercise-caution") && !/other ways to do this one/.test(h);
})());

setSore({});
ok("3.8 nothing sore: no pointer, and To go further is there", (() => {
  const h = R(BOTH, { page: "do" });
  return !/other ways to do this one/.test(h) && h.includes("To go further");
})());

setSore({ "lower-back": 5 });
ok("3.9 prescribed: nothing, by either route", (() => {
  const a = R({ ...BOTH, isPrescribed: true }, { page: "do" });
  const b = R(BOTH, { page: "do", prescribed: true });
  return !a.includes("<details") && !/other ways to do this one/.test(a) &&
         !b.includes("<details") && !/other ways to do this one/.test(b);
})());

ok("3.10 Gentle Care: ways to ease off stay, To go further does not", (() => {
  setSore({});
  const h = R({ ...BOTH, _gentleCare: true }, { page: "do" });
  return h.includes("To ease off") && !h.includes("To go further");
})());

ok("3.11 item text is escaped, not rendered as markup", (() => {
  const h = R(ESCAPES, { page: "do" });
  return h.includes("&lt;b&gt;") && !h.includes("<b>this</b>");
})());

setSore({ "lower-back": 5 });
// The first version of this assertion passed with the pointer nested
// INSIDE the caution paragraph -- it only checked that the caution's
// opening tag was followed by text. It proved nothing, which is the
// failure mode the house rules name. It now checks both halves: the
// caution paragraph is untouched, and the pointer is its own element
// outside it.
ok("3.12 the caution paragraph is untouched and the pointer is its own element", (() => {
  const h = R(BOTH, { page: "do" });
  const m = h.match(/<p class="exercise-caution" role="note">([\s\S]*?)<\/p>/);
  return !!m && !m[1].includes("xcard-adapt-pointer") && !m[1].includes("<p") &&
         /<p class="xcard-adapt-pointer">There are other ways/.test(h);
})());

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 4 — it reaches the real routes");

ok("4.1 prescribed-session.js tells the card the exercise is prescribed",
   /prescribed:\s*true/.test(strip(fs.readFileSync("js/views/prescribed-session.js", "utf8"))));

{
  const { buildSession, SESSION_TYPES } = await import("../js/session-builder.js");
  store.set("equipment", ["resistance-band", "dumbbell", "bench"]);
  setSore({});
  store.set("capability", { askedAt: new Date().toISOString(), chairRise: "yes", floorAccess: "yes", legPower: null, bothFeet: "yes", balanceWorry: "no" });

  let seen = null, intact = true, builds = 0;
  outer:
  for (const t of SESSION_TYPES) {
    for (let i = 0; i < 8; i++) {
      const s = buildSession({ sessionType: t.id, durationMins: 30 });
      builds++;
      for (const ex of (s?.exercises || [])) {
        if (!ADAPTED_IDS.includes(ex.id)) continue;
        seen = ex.id;
        const lib = byId.get(ex.id);
        intact = JSON.stringify(ex.adaptations) === JSON.stringify(lib.adaptations);
        break outer;
      }
    }
  }
  ok("4.2 CONTROL: an adapted entry was actually built in " + builds + " sessions" +
     (seen ? " (" + seen + ")" : ""), seen !== null);
  ok("4.3 adaptations survive into the built session unchanged", seen !== null && intact);
}

console.log("\n  " + pass + " passed, " + fail + " failed");
if (fail) { console.log("\n  " + fails.join("\n  ") + "\n"); process.exit(1); }
console.log("");
