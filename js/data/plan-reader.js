/**
 * js/data/plan-reader.js
 * 05 Oct 2026 v1
 *
 * D-7 PLAN-IMPORT. Reads a plan the person pastes (from a trainer, a class,
 * another app or an AI) and finds the exercises in it, with rules: no AI in
 * the app (Graeme, 05 Oct: "I can't afford to put AI into my app").
 *
 * ── THE HEALTH RULES (fixed; see the D-7 rules document) ─────────────────
 *  H1 Movement only. It takes in exercises and how much of each (sets,
 *     reps, seconds). Every other line is left out and shown back as "Not
 *     taken in", WITHOUT comment on what it says. The line saying that
 *     anything about eating, calories, weight or medicine stays with
 *     whoever wrote the plan is always shown, whatever the plan says: it is
 *     never triggered by the words, so nothing here is a word list and
 *     nothing is read for risk (Safeguarding Policy 2.3 and 4).
 *  H2 Read on the device, when the person taps Read, only to find
 *     exercises. The pasted text is never stored.
 *  H3 Nothing is added without the person seeing it. Only exact library
 *     names are ticked to start with; a near match asks which; a name it
 *     does not know, or an amount outside sensible limits, starts unticked.
 *  H4 The exercises become the person's own (My exercises): never swapped,
 *     changed or added to by the coach; on a sore day the player says
 *     which ones load the sore area and leaves the choice to them.
 *  H5 It does not record who wrote the plan or what it is for.
 *  H6 Notes from the plan are kept only with the health consent, as notes
 *     typed into My exercises are.
 *
 * ── HOW IT READS (no AI: patterns and the library's own names) ──────────
 *  - A line is a day heading ("Day A", "Session B: upper body", "Monday",
 *    "Day: Legs"), a part heading ("Warm-up", "Main", "Cool-down"), an
 *    exercise, or not taken in.
 *  - The amount: "3 x 10", "3 sets of 10", "3 x 8-12", "2 x 30s", "30
 *    seconds", "1 min", "10 reps", "30s x 3", with "each side", "per leg"
 *    and so on. Loads ("2 x 10kg"), tempo ("2-1-2") and rest ("60s rest")
 *    are not amounts, and go to the note or are dropped.
 *  - The name is what comes before the amount, without brackets (kept as
 *    a note) or anything after a dash or colon (also a note).
 *  - Matching: the name and every library name are made comparable
 *    (lower case, no punctuation, singular, "push-up" read as "press-up",
 *    "DB" as "dumbbell", "RDL" as "Romanian deadlift"). The same words =
 *    a match. Otherwise the closest three, if close enough, to choose
 *    from; else kept as the person wrote it, if they tick it.
 *  - A table with | between cells, and the Alongside template, read the
 *    same way. Lines starting with # or "e.g." (the template's own
 *    instructions and example) are skipped.
 */

import { EXERCISES } from "./exercises/index.js";

export const LIMITS = { sets: [1, 10], reps: [1, 100], secs: [5, 3600], text: 20000, items: 80 };

export const HEALTH_LINES = {
  takes: "I take in the exercises and their sets, reps or seconds. Nothing else.",
  stays: "Anything about eating, calories, weight or medicine stays with whoever wrote the plan.",
  yours: "They become yours, in My exercises. I don't swap or change them. On a sore day I say which ones load the sore area, and you choose.",
  kept: "I read it on your phone. The words you paste aren't kept.",
};

export const TEMPLATE = `# Alongside plan: exercises only
# One exercise per line, like this:  name | amount | note
# The amount is sets x reps (3 x 10), or sets x seconds (2 x 30s).
# Add "each side" where it is each side.
# Start each day or session with a line:  Day: its name
# Exercises only, please: no food, calories, weight targets or medicine.
# e.g. lines are an example; replace them with the plan.

e.g. Day: Session A
e.g. Cat-cow | 1 x 8 |
e.g. Goblet squat | 3 x 10 | slow on the way down
e.g. Pallof press | 3 x 10 each side |
e.g. Child's pose | 1 x 60s |

Day: `;

// ── Making names comparable ──────────────────────────────────────────────

const PHRASES = [
  [/\bpush[\s-]?ups?\b/g, "press up"], [/\bpress[\s-]?ups?\b/g, "press up"],
  [/\bsit[\s-]?ups?\b/g, "sit up"], [/\bpull[\s-]?ups?\b/g, "pull up"], [/\bchin[\s-]?ups?\b/g, "chin up"],
  [/\bstep[\s-]?ups?\b/g, "step up"], [/\bwood[\s-]?chops?\b/g, "woodchop"], [/\bchops?\b/g, "woodchop"],
  [/\bpull[\s-]?downs?\b/g, "pulldown"], [/\bpull[\s-]?aparts?\b/g, "pull apart"],
  [/\bdead[\s-]?lifts?\b/g, "deadlift"], [/\bdead[\s-]?bugs?\b/g, "dead bug"],
  [/\brdls?\b/g, "romanian deadlift"], [/\bsldls?\b/g, "single leg deadlift"],
  [/\bdbs?\b/g, "dumbbell"], [/\bdumbells?\b/g, "dumbbell"], [/\bkbs?\b/g, "kettlebell"], [/\bbb\b/g, "barbell"],
];
const STOP = new Set(["a", "an", "the", "with", "of", "and", "or", "both", "each", "per", "priority", "light",
  "heavy", "slow", "slowly", "controlled", "optional", "then", "on", "in", "to", "your", "my", "exercise"]);

const singular = w => (w.length > 3 && /sses$/.test(w)) ? w.slice(0, -2)
  : (w.length > 3 && /s$/.test(w) && !/(ss|us|is)$/.test(w)) ? w.slice(0, -1) : w;

/** The words of a name, made comparable. */
export function nameWords(s) {
  let t = String(s || "").toLowerCase().replace(/[’']/g, "");
  for (const [re, to] of PHRASES) t = t.replace(re, to);
  return t.replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).filter(w => w && !STOP.has(w)).map(singular);
}

const LIB = EXERCISES.map(e => {
  const words = nameWords(e.name);
  return { ex: e, words, set: new Set(words), key: [...new Set(words)].sort().join(" ") };
});

/**
 * The library entry for a name: { kind: "matched"|"choose"|"own", id, choices }.
 * matched: the same words. choose: the closest (up to three), close enough
 * to ask. own: none close enough.
 */
export function matchName(name) {
  const words = nameWords(name);
  if (!words.length) return { kind: "own", id: null, choices: [] };
  const key = [...new Set(words)].sort().join(" ");
  const exact = LIB.filter(l => l.key === key);
  if (exact.length) return { kind: "matched", id: exact[0].ex.id, choices: exact.map(l => l.ex.id).slice(0, 3) };
  const q = new Set(words);
  const scored = LIB.map(l => {
    let inter = 0; for (const w of q) if (l.set.has(w)) inter++;
    const dice = (2 * inter) / (q.size + l.set.size);
    const within = inter === q.size;   // every word asked for is in this name
    return { l, score: dice + (within ? 0.25 : 0), inter };
  }).filter(x => x.inter > 0).sort((a, b) => b.score - a.score || a.l.ex.name.length - b.l.ex.name.length);
  const close = scored.filter(x => x.score >= 0.5).slice(0, 3);
  return close.length ? { kind: "choose", id: close[0].l.ex.id, choices: close.map(x => x.l.ex.id) }
                      : { kind: "own", id: null, choices: [] };
}

// ── The amount ───────────────────────────────────────────────────────────

const SECS = "(seconds?|secs?|s|minutes?|mins?)";
const toSecs = (n, unit) => /^m/.test(unit || "") ? n * 60 : n;
const SIDE = /\b(each|per|a)\s+(side|leg|arm)\b|\/\s*(side|leg|arm)\b|\bboth\s+sides\b|\be\/s\b|\beach\b|\b(left|right)\s+(and|&)\s+(left|right)\b/;

/**
 * The amount in a piece of text: { sets, reps, secs, range, perSide, at, len }
 * or null. at/len: where it was found, so the name can be what comes before.
 */
export function findAmount(text) {
  const t = String(text || "").toLowerCase();
  const perSide = SIDE.test(t);
  const tries = [
    // 30s x 3 / 1 min x 2
    [new RegExp(`(\\d+)\\s*${SECS}\\s*(?:x|×|\\*)\\s*(\\d+)\\b`), m => ({ sets: +m[3], secs: toSecs(+m[1], m[2]) })],
    // 3 x 10 / 3x8-12 / 2 x 30s
    [new RegExp(`(\\d+)\\s*(?:x|×|\\*)\\s*(\\d+)(?:\\s*(?:-|–|to)\\s*(\\d+))?\\s*(?:${SECS}|reps?)?\\b`), m =>
      m[4] ? { sets: +m[1], secs: toSecs(+m[2], m[4]) } : { sets: +m[1], reps: +m[2], range: m[3] ? `${m[2]}-${m[3]}` : null }],
    // 3 sets of 10 / 3 sets, 10 reps / 2 sets of 30 seconds / 3 rounds of 8
    [new RegExp(`(\\d+)\\s*(?:sets?|rounds?)\\s*(?:of|x|×|,)?\\s*(\\d+)(?:\\s*(?:-|–|to)\\s*(\\d+))?\\s*(?:${SECS}|reps?)?\\b`), m =>
      m[4] ? { sets: +m[1], secs: toSecs(+m[2], m[4]) } : { sets: +m[1], reps: +m[2], range: m[3] ? `${m[2]}-${m[3]}` : null }],
    // 10 reps / 8-12 reps
    [/(\d+)(?:\s*(?:-|–|to)\s*(\d+))?\s*reps?\b/, m => ({ sets: 1, reps: +m[1], range: m[2] ? `${m[1]}-${m[2]}` : null })],
    // 30 seconds / hold 45s / 1 min
    [new RegExp(`(\\d+)\\s*${SECS}\\b`), m => ({ sets: 1, secs: toSecs(+m[1], m[2]) })],
    // 3 sets (no reps)
    [/(\d+)\s*(?:sets?|rounds?)\b/, m => ({ sets: +m[1] })],
  ];
  for (const [re, make] of tries) {
    const m = re.exec(t);
    if (m) {
      const a = make(m);
      return { sets: a.sets || 1, reps: a.reps ?? null, secs: a.secs ?? null, range: a.range ?? null, perSide, at: m.index, len: m[0].length };
    }
  }
  return null;
}

/** Whether an amount is inside sensible limits (H3). */
export function amountOk(a) {
  if (!a) return false;
  const inR = (v, [lo, hi]) => v == null || (v >= lo && v <= hi);
  return inR(a.sets, LIMITS.sets) && inR(a.reps, LIMITS.reps) && inR(a.secs, LIMITS.secs) && (a.reps != null || a.secs != null || a.sets != null);
}

/** "3 x 10 each side", "2 x 30s", "3 x 8-12" — what the amount box shows. */
export function amountText(a) {
  if (!a) return "";
  const each = a.perSide ? " each side" : "";
  if (a.secs != null) return `${a.sets || 1} x ${a.secs % 60 === 0 && a.secs >= 60 ? `${a.secs / 60} min` : `${a.secs}s`}${each}`;
  if (a.reps != null) return `${a.sets || 1} x ${a.range || a.reps}${each}`;
  return `${a.sets || 1} sets`;
}

/** The reps string My exercises keeps: "10 each side", "30 seconds", "8-12". */
export function repsString(a) {
  if (!a) return null;
  const each = a.perSide ? " each side" : "";
  if (a.secs != null) return `${a.secs} seconds${each}`;
  if (a.reps != null) return `${a.range || a.reps}${each}`;
  return null;
}

// ── Lines ────────────────────────────────────────────────────────────────

const DAY_NAMES = /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tues?|wed|thur?s?|fri|sat|sun)\b/i;
const DAY_HEAD = /^(day|session|workout|training\s+day)\s*[:\-–—]?\s*([a-z0-9]{1,3})\b/i;
const SECTION = /^(warm[\s-]?ups?|cool[\s-]?downs?|main(?:\s+(?:set|part|work|block|session))?|finisher|circuit)\b/i;
const sectionOf = s => /^warm/i.test(s) ? "warmup" : /^cool/i.test(s) ? "cooldown" : "main";
const clean = (s, n = 60) => String(s || "").replace(/[<>]/g, "").replace(/\s+/g, " ").replace(/^[\s:–—\-,.;]+|[\s:–—\-,.;]+$/g, "").slice(0, n);

/** Loads, tempo, rest and effort out of a line: [what is left, notes]. */
function strip(line) {
  const notes = [];
  let t = line.replace(/(\d),(\d{3})/g, "$1$2");
  t = t.replace(/[([]([^)\]]*)[)\]]/g, (_, inner) => { if (inner.trim()) notes.push(inner.trim()); return " "; });
  t = t.replace(/(?:\b\d+\s*(?:x|×)\s*)?\b\d+(?:\.\d+)?\s*(?:kgs?|kilos?|lbs?|pounds?)\b/gi, m => { notes.push(m.trim()); return " "; });
  t = t.replace(/\btempo\s*[:\-]?\s*[\dx]+(?:\s*-\s*[\dx]+)+/gi, " ").replace(/\b\d-\d-\d(?:-\d)?\b/g, " ");
  t = t.replace(/\b(?:rest|recover(?:y)?)\s*[:\-]?\s*\d+\s*(?:seconds?|secs?|s|minutes?|mins?)?\b|\b\d+\s*(?:seconds?|secs?|s|minutes?|mins?)\s*(?:rest|recovery)\b/gi, " ");
  t = t.replace(/\b(?:rpe|rir)\s*\d+(?:\s*-\s*\d+)?\b|@\s*\d+\b/gi, " ");
  return [t, notes];
}

/** A heading's name: "Session A — Lower body" is "Session A"; never cut mid-word. */
function headerLabel(raw) {
  const m = raw.match(/^day\s*:\s*(.+)$/i);
  let t = clean(m ? m[1] : raw, 200);
  const first = t.split(/\s+[–—-]\s+|:\s*/)[0];
  if (first && first.length >= 3 && first.length < t.length) t = clean(first, 200);
  if (t.length > 40) t = t.slice(0, 41).replace(/\s+\S*$/, "");
  return t;
}

/**
 * Read one line: { type: "skip" | "day" | "section" | "item" | "not", ... }.
 * A line that starts with a part heading and goes on to a list ("Warm-up
 * (5 min): marching, arm circles") is split into its pieces.
 */
function readLine(raw) {
  let line = raw.replace(/ /g, " ").trim();
  if (!line || /^#/.test(line) || /^e\.g\./i.test(line) || /^[\s|:\-=_*~`]+$/.test(line)) return [{ type: "skip" }];
  line = line.replace(/^(?:[-*•·▪◦>]+|\d{1,2}[.)]|[a-z][.)])\s+/i, "").replace(/^\*\*|\*\*$/g, "").replace(/\*\*/g, "").trim();
  if (!line) return [{ type: "skip" }];

  // A table row, or the template.
  if (line.includes("|")) {
    const cells = line.split("|").map(c => c.trim()).filter(Boolean);
    if (!cells.length) return [{ type: "skip" }];
    if (!/\d/.test(line) && cells.every(c => /^(exercise|exercises|name|sets?|reps?|notes?|amount|time|rest|tempo|load|weight)$/i.test(c))) return [{ type: "skip" }];
    if (cells.length > 1) {
      const [name, ...rest] = cells;
      if (/^\d+$/.test(rest[0] || "") && /^\d+(?:\s*-\s*\d+)?\s*(s|sec|secs|seconds?)?$/i.test(rest[1] || "")) {
        const isSec = /s/i.test(rest[1]);
        const [r1, r2] = rest[1].match(/\d+/g);
        const a = { sets: +rest[0], reps: isSec ? null : +r1, secs: isSec ? +r1 : null, range: !isSec && r2 ? `${r1}-${r2}` : null, perSide: SIDE.test(line.toLowerCase()) };
        return [item(raw, name, a, rest.slice(2).join(" — "))];
      }
      const [stripped, notes] = strip(rest[0] || "");
      const a = findAmount(stripped);
      const note = [...notes, ...rest.slice(1)].filter(Boolean).join(" — ");
      if (/^day\s*:/i.test(name)) return [{ type: "day", name: headerLabel(name) }];
      return [a ? item(raw, name, a, note) : bare(raw, name, note)];
    }
    line = cells[0];
  }

  if (/^day\s*:/i.test(line)) return [{ type: "day", name: headerLabel(line) }];
  if (/^week\s*\d+\b/i.test(line) && !findAmount(line)) return [{ type: "not", line: raw.trim() }];

  // A part heading, alone or with a list after it.
  const sec = line.match(SECTION);
  if (sec) {
    const after = line.slice(sec[0].length).replace(/^\s*(?:\([^)]*\))?\s*[:\-–—]?\s*/, "");
    const section = sectionOf(sec[1]);
    if (!after.trim()) return [{ type: "section", section }];
    if (/^[:(\s-–—]/.test(line.slice(sec[0].length)) && /[,;]/.test(after)) {
      return [{ type: "section", section }, ...after.split(/\s*[,;]\s*|\s+and\s+/i).flatMap(p => readLine(p))];
    }
  }

  const [stripped, notes] = strip(line);
  const a = findAmount(stripped);
  if (!a) {
    // A day heading has no amount.
    if (DAY_HEAD.test(stripped) || DAY_NAMES.test(stripped)) return [{ type: "day", name: headerLabel(line) }];
    if (/:\s*$/.test(line) && !/\d/.test(line)) return [{ type: "day", name: headerLabel(line.replace(/:\s*$/, "")) }];
    return [bare(raw, stripped, notes.join(" — "))];
  }
  const before = stripped.slice(0, a.at), after = stripped.slice(a.at + a.len);
  return [item(raw, before, a, [...notes, after].map(s => clean(s, 80)).filter(Boolean).join(" — "))];
}

/** The name and its note: a dash or colon starts the note. */
function splitName(s) {
  const t = String(s || "").replace(SIDE, " ").replace(/\b(sets?|reps?|x)\b\s*$/i, " ");
  const m = t.split(/\s+[–—-]\s+|:\s+|\s*—\s*/);
  return [clean(m[0]), clean(m.slice(1).join(" — "), 80)];
}

function item(raw, nameText, a, note) {
  const [name, extra] = splitName(nameText);
  if (name.replace(/[^a-z]/gi, "").length < 3) return { type: "not", line: raw.trim() };
  const match = matchName(name);
  const noteText = [extra, note].map(x => clean(String(x || "").replace(new RegExp(SIDE.source, "g"), " "), 120)).filter(Boolean).join(" — ");
  return { type: "item", line: clean(raw, 120), name, amount: { sets: a.sets, reps: a.reps, secs: a.secs, range: a.range, perSide: a.perSide },
           note: noteText.slice(0, 120), match, defaulted: false };
}

/** A line with no amount: an exercise only if it is a library name exactly. */
function bare(raw, text, note) {
  const [name, extra] = splitName(text);
  const match = name ? matchName(name) : { kind: "own" };
  if (match.kind !== "matched") return { type: "not", line: raw.trim() };
  const ex = EXERCISES.find(e => e.id === match.id);
  const fromLib = findAmount(`${ex?.sets || 1} x ${ex?.reps || (ex?.holdSeconds ? `${ex.holdSeconds}s` : 10)}`) ||
    { sets: ex?.sets || 1, reps: 10, secs: null, range: null, perSide: false };
  if (ex?.perSide) fromLib.perSide = true;
  return { ...item(raw, name, fromLib, [extra, note].filter(Boolean).join(" — ")), defaulted: true };
}

/**
 * Read a whole plan.
 * { days: [{ name, items: [...] }], notRead: [line], counts, readable }.
 * Items carry section (warmup / main / cooldown), match, amount, ok (the
 * amount is inside the limits) and take (ticked to start with: H3).
 */
export function readPlan(text) {
  const src = String(text || "").slice(0, LIMITS.text);
  const days = [];
  const notRead = [];
  let day = null, section = "main", lines = 0;
  const dayNamed = name => {
    const found = days.find(d => d.name.toLowerCase() === name.toLowerCase());
    if (found) return found;
    const d = { name, items: [] }; days.push(d); return d;
  };
  for (const raw of src.split(/\r?\n/)) {
    for (const r of readLine(raw)) {
      if (r.type === "skip") continue;
      lines++;
      if (r.type === "day") { day = dayNamed(r.name || `Day ${days.length + 1}`); section = "main"; continue; }
      if (r.type === "section") { section = r.section; continue; }
      if (r.type === "not") { notRead.push(clean(r.line, 120)); continue; }
      const total = days.reduce((n, d) => n + d.items.length, 0);
      if (total >= LIMITS.items) { notRead.push(clean(r.line, 120)); continue; }
      if (!day) day = dayNamed("Your plan");
      const ok = amountOk(r.amount);
      day.items.push({ ...r, section, ok, take: ok && r.match.kind === "matched" });
    }
  }
  const kept = days.filter(d => d.items.length);
  const exercises = kept.reduce((n, d) => n + d.items.length, 0);
  const known = kept.reduce((n, d) => n + d.items.filter(i => i.match.kind !== "own").length, 0);
  return {
    days: kept, notRead,
    counts: { lines, exercises, known, notRead: notRead.length },
    readable: known >= 1 && known >= Math.ceil(lines / 3),
  };
}

/** A library entry by id. */
export const exerciseById = id => EXERCISES.find(e => e.id === id) || null;
