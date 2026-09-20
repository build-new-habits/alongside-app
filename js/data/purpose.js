/**
 * js/data/purpose.js
 * 16 Sep 2026 v1
 *
 * PURPOSE-ASK. Why today's session, asked rather than assumed.
 *
 * ── THE FAULT THIS EXISTS FOR ────────────────────────────────────────
 *
 * Graeme, across five days: "The coach still doesn't ask what I want.
 * Like, work towards my arc, conditions, body zone, general fitness,
 * etc. There are lots of reasons to work out but the coach never asks."
 *
 * 🔴 The coach assumed the reason was always the arc. Everything
 * downstream followed from one hardcoded purpose, which is why the
 * answer kept being core. Three fixes were made at the wrong level --
 * ALWAYS-CORE fixed the rotation, PROPOSAL-LOC fixed the alternates,
 * ASK-KIND offered a different SHAPE of session. All real bugs. None of
 * them the question.
 *
 * ⚫ The repetition was the signal and it was read as a reminder.
 *
 * ── THE SECOND QUESTION IS A RECOMMENDATION, NOT A MENU ──────────────
 *
 * Graeme's correction to the first mockup, and the better design: "Coach
 * should make a suggestion based on all the pain data etc like, 'I'd
 * recommend we build strength around it rather than directly work it'...
 * and these are gold marked."
 *
 * Four neutral options ask somebody to be their own physiotherapist. One
 * marked option with a stated reason is the coach doing the job it
 * exists for. The others stay, unmarked, and can be chosen freely.
 *
 * ── TWO RULES THAT ARE NOT NEGOTIABLE ────────────────────────────────
 *
 * 🔴 THE REASON MUST BE SOMETHING THEY TOLD US, SAID BACK TO THEM.
 * "You've flagged this three times in a fortnight" is a fact. "This is
 * what your body needs" is a diagnosis, and a physiotherapist would
 * object to it -- correctly. Same rule as bodyCaution() on the cards.
 *
 * 🔴 WITH NO EVIDENCE THERE IS NO RECOMMENDATION. On day one there is no
 * flag history and no activity types, so nothing is marked and the
 * options are offered plain. The gold mark means "I have a reason". It
 * must never mean "I have to pick something" -- inventing confidence is
 * the failure mode of every app this product exists as an alternative
 * to.
 */

import { store } from "../store.js";
import { TARGET_AREAS } from "../stretch-target.js";
// PURPOSE-ASK. The one alias table, imported rather than copied --
// ALIAS-ONE merged two of these this morning and a third would undo it.
import { AREA_ALIASES } from "./session-rationale.js";
// PURPOSE-ASK. The same source today.js reads for the arc headline, so
// the proposal names the arc in the words already on Home.
import { aimById } from "./aims.js";

/** Q1. The one that has never been asked. */
export const PURPOSES = [
  { id: "arc",     label: "Working towards my arc",
    sub: "Keep building the thing you're building" },
  { id: "niggle",  label: "Something's niggling",
    sub: "Work around it, or work on it" },
  { id: "area",    label: "A particular area",
    sub: "You pick the part of you" },
  { id: "general", label: "General fitness",
    sub: "Nothing specific, just good work" },
  // ⚫ A REAL ANSWER, NOT A FALLBACK. "Just moving" is the whole product
  // for somebody who is not having a good day, and it must not read as
  // the lesser option. It is last because it is the gentlest, not
  // because it is the least.
  { id: "gentle",  label: "Just moving",
    sub: "Something easy. That still counts" }
];

/**
 * Q2. Options per purpose.
 *
 * `gentle` is absent on purpose: "just moving" has already answered
 * this, and asking again is the coach not listening.
 */
export const FORMS = {
  niggle: [
    { id: "mobility", label: "Range of movement" },
    { id: "around",   label: "Build strength around it" },
    { id: "stretch",  label: "Stretch it out" },
    { id: "gentle",   label: "Move gently, nothing loaded" }
  ],
  area: [
    { id: "mobility", label: "Range of movement" },
    { id: "around",   label: "Build strength around it" },
    { id: "stretch",  label: "Stretch it out" },
    { id: "gentle",   label: "Move gently, nothing loaded" }
  ],
  arc: [
    { id: "strength", label: "Strength" },
    { id: "mobility", label: "Mobility" },
    { id: "stretch",  label: "Stretch" },
    { id: "mixed",    label: "A bit of each" }
  ],
  general: [
    { id: "strength", label: "Strength" },
    { id: "cardio",   label: "Cardio" },
    { id: "mobility", label: "Mobility" },
    { id: "mixed",    label: "A bit of each" }
  ]
};

/** Q2's answers map onto the builder's session types. */
const FORM_TO_SESSION_TYPE = {
  strength: "full", around: "full", mixed: "full",
  mobility: "mobility", stretch: "stretch",
  cardio: "cardio", gentle: "mobility"
};

/**
 * 🔴 AROUND-AREA, 16 Sep 2026. "Build strength AROUND it" has to mean
 * something.
 *
 * Found by tracing the whole chain rather than by a test: somebody
 * flags a sore lower back three times, the coach says "I'd build
 * strength around it rather than work it directly" -- and then handed
 * them FULL BODY, which loads the back like everything else.
 *
 * ⚫ THE ADVICE WAS RIGHT AND THE SESSION DID NOT FOLLOW IT, which is
 * worse than not giving the advice. A coach that contradicts itself in
 * two screens is the thing this product exists to not be.
 *
 * "Around" means: load the chain that SUPPORTS the sore area, without
 * loading the area itself. For a back that is the posterior chain --
 * glutes and hamstrings doing the work so the back does not have to,
 * which is what the reason text already promises.
 *
 * 🟠 FOR THE CLINICAL REVIEWER. This mapping is movement reasoning, not clinical
 * prescription, and it is the kind of thing a physiotherapist should
 * read before beta. It is deliberately coarse: four buckets, no
 * condition-specific protocols, and no claim beyond "work near it, not
 * on it". Logged as AROUND-REVIEW.
 */
const AROUND_BY_AREA = {
  // A sore back: posterior chain takes the load instead.
  "lower-back": "glute", "spine": "glute", "upper-back": "glute",
  "thoracic": "glute", "back-hips": "glute", "sciatica": "glute",

  // Sore hips or glutes: trunk work, off the hips.
  "hip": "core", "hip-flexor": "core", "glutes": "core",
  "piriformis": "core", "adductors": "core",

  // Sore legs: trunk again -- there is nowhere lower to go.
  "hamstring": "core", "quadriceps": "core", "knee": "core",
  "calves": "core", "ankle-foot": "core", "legs": "core",

  // Sore upper body: work the legs instead.
  "shoulder": "lower", "rotator-cuff": "lower", "wrist-elbow": "lower",
  "chest-pecs": "lower", "shoulders": "lower"
};

export function sessionTypeForForm(formId, areaId) {
  if (formId === "around" && areaId) {
    // Direct hit, then the coarse target it belongs to.
    if (AROUND_BY_AREA[areaId]) return AROUND_BY_AREA[areaId];
    const target = TARGET_AREAS.find(t => t.id === areaId);
    if (target) {
      const hit = target.areas.find(a => AROUND_BY_AREA[a]);
      if (hit) return AROUND_BY_AREA[hit];
    }
    // Unknown area: fall through rather than guess at a body part.
  }
  return FORM_TO_SESSION_TYPE[formId] || null;
}

export function formsFor(purposeId) {
  return FORMS[purposeId] || [];
}

/**
 * Q1b. Only when the app does not already know.
 *
 * ⚫ Graeme's rule: asking again when he answered three questions ago is
 * the coach not listening. A niggle with exactly ONE flagged area needs
 * no question -- the check-in just said which. "A particular area"
 * always asks, because that is somebody choosing something the check-in
 * did not raise.
 */
export function needsAreaQuestion(purposeId) {
  if (purposeId === "area") return true;
  if (purposeId !== "niggle") return false;
  return flaggedAreas().length !== 1;
}

/** Areas flagged at today's check-in, at or above the threshold. */
export function flaggedAreas() {
  try {
    const conditions = store.get("conditions") || [];
    const scores     = store.get("conditionPainScores") || {};
    return conditions.filter(id => (scores[id] || 0) >= 4);
  } catch { return []; }
}

/** The four coarse targets, shared with the stretch door. One vocabulary. */
export function areaOptions() {
  const flagged = flaggedAreas();
  const named = flagged.map(id => ({ id, label: _words(id) }));
  const coarse = TARGET_AREAS.filter(t => t.areas.length)
    .map(t => ({ id: t.id, label: t.label }));
  const seen = new Set(named.map(o => o.id));
  return [...named, ...coarse.filter(o => !seen.has(o.id))];
}

function _words(id) { return String(id || "").replace(/-/g, " "); }

/**
 * An area's name as a person would say it.
 *
 * A coarse target has a LABEL ("Back and hips") and an id
 * ("back-hips"). Hyphen-stripping the id gives "back hips", which is
 * the app reading its own filing system aloud. Conditions have no
 * label, so those fall back to the id, which is already readable.
 */
function _areaWords(id) {
  const t = TARGET_AREAS.find(x => x.id === id);
  return t ? t.label.toLowerCase() : _words(id);
}

/**
 * The name the person used, not the bucket the app sorts by.
 *
 * Somebody flags "lower back"; the app may group that under the coarse
 * target "back and hips". Saying "you've flagged your back hips three
 * times" is the app talking about its own taxonomy. The reason has to
 * repeat what THEY said -- that is the honesty rule, and it includes
 * the words.
 */
function _spokenArea(areaId) {
  const flagged = flaggedAreas();
  if (flagged.includes(areaId)) return _words(areaId);
  const target = TARGET_AREAS.find(t => t.id === areaId);
  if (!target) return _words(areaId);
  const hit = flagged.find(id =>
    (AREA_ALIASES[id] || [id]).some(a => target.areas.includes(a)));
  return _words(hit || areaId);
}

// ── The recommendation ──────────────────────────────────────────────

/**
 * How many of the last `days` check-ins flagged this area at or above
 * the threshold. Reads checkinHistory exactly as _severityTrend() in
 * conditions-update.js does -- one way to ask this question, not two.
 */
function timesFlagged(areaId, days = 14) {
  try {
    const history = store.get("checkinHistory") || {};
    const cutoff  = Date.now() - days * 86400000;

    // 🔴 TWO VOCABULARIES MEET HERE, and the first draft of this counted
    // in the wrong one. areaId may be a CONDITION id ("lower-back",
    // straight from the check-in) or one of the four coarse TARGET_AREAS
    // ("back-hips", picked from the list). checkinHistory is keyed by
    // CONDITION only -- so looking up conditionLevels["back-hips"] found
    // nothing, always, and the recommendation never fired for anybody.
    //
    // Driven before it shipped: twelve days of flag history returned
    // null. That is the fifth dead branch found this way today, and the
    // same family as ALIAS-ONE one layer up.
    //
    // A coarse target counts any condition whose areas fall inside it.
    const target = TARGET_AREAS.find(t => t.id === areaId);
    const matches = (condId) => {
      if (condId === areaId) return true;
      if (!target) return false;
      const areas = AREA_ALIASES[condId] || [condId];
      return areas.some(a => target.areas.includes(a));
    };

    return Object.entries(history)
      .filter(([date]) => new Date(date).getTime() >= cutoff)
      .filter(([, e]) => {
        const levels = (e && e.conditionLevels) || {};
        return Object.keys(levels).some(id => matches(id) && (levels[id] || 0) >= 4);
      })
      .length;
  } catch { return 0; }
}

/** Completed sessions of each type inside the window, and days since. */
function recentWork(days = 14) {
  const out = { counts: {}, daysSince: {} };
  try {
    const log = store.get("activityLog") || [];
    const cutoff = Date.now() - days * 86400000;
    for (const e of log) {
      if (!e || e.status === "partial" || !e.sessionType) continue;
      const ts = new Date(e.completedAt || e.loggedAt || e.date).getTime();
      if (!isFinite(ts) || ts < cutoff) continue;
      out.counts[e.sessionType] = (out.counts[e.sessionType] || 0) + 1;
      const d = Math.floor((Date.now() - ts) / 86400000);
      if (out.daysSince[e.sessionType] === undefined || d < out.daysSince[e.sessionType]) {
        out.daysSince[e.sessionType] = d;
      }
    }
  } catch { /* no history is normal */ }
  return out;
}

/**
 * Which form to mark, and why. Null when there is nothing to say.
 *
 * 🔴 EVERY BRANCH RETURNS A REASON DRAWN FROM A STORED FACT. If a branch
 * cannot name what it read, it must not fire. That is what keeps this
 * the coach reporting rather than the coach diagnosing.
 */
export function recommendation(purposeId, areaId) {
  const work = recentWork();
  const done = Object.keys(work.counts).length;

  if (purposeId === "niggle" || purposeId === "area") {
    if (!areaId) return null;
    const times = timesFlagged(areaId);
    // Say it back in THEIR words. "back hips" is the coarse bucket the
    // app groups by; "lower back" is what they actually flagged. The
    // honesty rule is that a reason repeats what somebody told us, and
    // that includes the name they used for it.
    const said = _spokenArea(areaId);

    // Repeatedly sore: work around it rather than into it.
    if (times >= 3) {
      return { formId: "around",
        reason: `You've flagged your ${said} ${times} times in the last fortnight. ` +
                `I'd build strength around it rather than work it directly.` };
    }
    if (times === 2) {
      return { formId: "mobility",
        reason: `That's the second time you've flagged your ${said} this fortnight. ` +
                `Range of movement first, and see how it goes.` };
    }
    // Flagged once, and it is today's. Nothing historical to lean on, so
    // the reason is today's own answer rather than a pattern.
    if (times === 1 && flaggedAreas().includes(areaId)) {
      return { formId: "gentle",
        reason: `You flagged it this morning, and it hasn't come up before this fortnight. ` +
                `Keeping it moving without loading it is the useful thing today.` };
    }
    return null;
  }

  if (purposeId === "arc") {
    // An arc strand nobody has touched beats one already lit.
    try {
      const arc = store.get("arc") || {};
      const types = arc.typesWorked || {};
      const untouched = ["strength", "mobility", "stretch"]
        .map(f => ({ f, t: FORM_TO_SESSION_TYPE[f] }))
        .filter(x => !types[x.t]);
      if (untouched.length && done >= 2) {
        const pick = untouched[0];
        return { formId: pick.f,
          reason: `You've done ${_typeWords(work.counts)} this fortnight, ` +
                  `and nothing that feeds ${pick.f === "strength" ? "strength" : pick.f} yet.` };
      }
    } catch { /* no arc */ }
    return null;
  }

  if (purposeId === "general") {
    if (done < 2) return null;
    const strengthish = (work.counts.full || 0) + (work.counts.upper || 0) +
                        (work.counts.lower || 0) + (work.counts.core || 0);
    const mobilityish = (work.counts.mobility || 0) + (work.counts.stretch || 0);
    if (strengthish >= 2 && mobilityish === 0) {
      return { formId: "mobility",
        reason: `You've done ${strengthish} strength sessions this fortnight and no mobility. ` +
                `I'd even that up.` };
    }
    if (mobilityish >= 2 && strengthish === 0) {
      return { formId: "strength",
        reason: `Plenty of mobility this fortnight and no strength work. ` +
                `I'd put something loaded in.` };
    }
    if ((work.counts.cardio || 0) === 0 && done >= 3) {
      return { formId: "cardio",
        reason: `Nothing with your heart rate up in the last fortnight.` };
    }
    return null;
  }

  return null;
}

/**
 * How each answer reads in the middle of a sentence.
 *
 * 🔴 The labels are VERB PHRASES -- "Stretch it out", "Move gently,
 * nothing loaded" -- and slotting them after "asked for" produced
 * "asked for stretch it out". Written out per answer rather than
 * generated, because there are seven of them and the sentence has to
 * read like a person wrote it.
 */
const FORM_SHORT = {
  around:   "strength around it",
  mobility: "range of movement",
  stretch:  "stretching",
  gentle:   "gentle movement",
  strength: "strength",
  cardio:   "cardio",
  mixed:    "a bit of each"
};

const FORM_TAILS = {
  around:   ", and asked to build strength around it",
  mobility: ", and asked to work on range of movement",
  stretch:  ", and asked to stretch it out",
  gentle:   ", and asked to keep it moving without loading it",
  strength: ", and asked for strength",
  cardio:   ", and asked for cardio",
  mixed:    ", and asked for a bit of each"
};

function _typeWords(counts) {
  const names = Object.keys(counts);
  if (!names.length) return "nothing";
  if (names.length === 1) return `${counts[names[0]]} ${names[0]}`;
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/**
 * Session types, in the words somebody would use about them.
 *
 * 🔴 requestedSessionType holds a SESSION TYPE, not a form id, so
 * ASK-KIND's existing plumbing keeps working unchanged and no third
 * field is needed. But "full" is the builder's word, not a person's --
 * a first draft of purposeLine() said "asked for around", which is an
 * internal id leaking into the coach's voice.
 */
const TYPE_WORDS = {
  full: "strength", upper: "upper body", lower: "lower body",
  core: "core", glute: "glutes", cardio: "cardio",
  mobility: "mobility", stretch: "stretching"
};

/** The proposal screen's line. One screen, one line, five meanings. */
export function purposeLine() {
  const purpose = store.get("todayPurpose");
  const area    = store.get("todayPurposeArea");
  const form    = store.get("requestedSessionType");
  if (!purpose) return "";

  // AROUND-AREA. The FORM answered, where we have it, because
  // "build strength around it" flattened to "strength" lost the word
  // that made the recommendation worth giving.
  // Two shapes, because the sentence needs both. `tail` appends to
  // "Because you flagged your lower back…"; `short` drops into
  // "general fitness — cardio today", where a second "asked" would
  // say it twice.
  const formId = store.get("todayForm");
  const short  = formId ? (FORM_SHORT[formId] || null)
               : (form ? (TYPE_WORDS[form] || _words(form)) : null);
  const tail   = formId ? (FORM_TAILS[formId] || "")
               : (short ? `, and asked for ${short}` : "");
  const formWords = short;

  switch (purpose) {
    case "arc": {
      // 🔴 arc.aimLabel DOES NOT EXIST. The arc stores aimId; the label
      // comes from aimById(), which is what today.js and ARC-VISIBLE
      // both already use. The first draft read a field that was never
      // written, so this always fell to the generic "your arc" -- the
      // sixth dead branch found by driving the code today, and the
      // second this hour.
      const arc = store.get("arc") || {};
      const aim = arc.aimId ? aimById(arc.aimId) : null;
      return (aim && aim.label)
        ? `Because you're working towards \u201c${aim.label}\u201d${tail}.`
        : `Because you're working towards your arc${tail}.`;
    }
    case "niggle":
      return area
        ? `Because you flagged your ${_areaWords(area)}${tail}.`
        : `Because something was niggling${tail}.`;
    case "area":
      // Same "asked" twice problem as general, above.
      if (!area) return `Because you asked for a particular area${tail}.`;
      return formWords
        ? `Because you asked for ${_areaWords(area)} \u2014 ${formWords} today.`
        : `Because you asked for ${_areaWords(area)}.`;
    case "general":
      // Not `${tail}` here: "you asked for general fitness, and asked
      // for cardio" says "asked" twice. The coach should read like one
      // sentence somebody would say.
      return formWords
        ? `Because you asked for general fitness \u2014 ${formWords} today.`
        : `Because you asked for general fitness.`;
    case "gentle":
      return `Because you said just moving today.`;
    default:
      return "";
  }
}

/** Cleared at the start of every check-in. A purpose is about today. */
export function clearPurpose() {
  store.set("todayForm", null);
  store.set("todayPurpose", null);
  store.set("todayPurposeArea", null);
  store.set("requestedSessionType", null);
}
