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
  // CLINICAL-REVIEW, 16 Sep 2026. Was "Work around it, or work on it". Both
  // halves were the problem she named: the app deciding what to load.
  { id: "niggle",  label: "Something's niggling",
    sub: "Take it a bit easier today" },
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
/**
 * 🔴 CLINICAL-REVIEW, 16 Sep 2026. THE NIGGLE AND AREA OPTIONS ARE ACTIVITY
 * MODIFICATION, NOT A TREATMENT CHOICE.
 *
 * They were: range of movement, BUILD STRENGTH AROUND IT, stretch it
 * out, move gently. the clinical reviewer, reviewing:
 *
 *   "I would not support fixed mappings from a reported sore area to a
 *    specific training focus. A self-reported sore area does not provide
 *    enough information to determine what should or should not be
 *    loaded, and the wording risks being interpreted as rehabilitation
 *    advice. I would keep this at the level of activity modification:
 *    offer a lower-intensity, general, or user-selected session that
 *    reduces demand on the area concerned."
 *
 * So the four options are now exactly her three, plus the gentle one
 * the product already had. None of them names a body part to load or
 * to avoid. The session builder's existing condition handling and the
 * caution line on each card still respond to the flagged area -- that
 * is the "reduces demand on the area" half, and it was already there.
 *
 * ⚫ Recorded as her REVIEW COMMENTS, not a sign-off. She did not sign
 * anything off, and nothing here claims she did.
 */
export const FORMS = {
  niggle: [
    { id: "lighter", label: "A lighter session" },
    { id: "general", label: "Something general" },
    { id: "gentle",  label: "Just keep moving gently" },
    { id: "choose",  label: "I'll choose myself" }
  ],
  area: [
    { id: "lighter", label: "A lighter session" },
    { id: "general", label: "Something general" },
    { id: "gentle",  label: "Just keep moving gently" },
    { id: "choose",  label: "I'll choose myself" }
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
  strength: "full", mixed: "full", mobility: "mobility", stretch: "stretch",
  cardio: "cardio", gentle: "mobility",
  // CLINICAL-REVIEW. Activity modification. "lighter" and "choose" deliberately
  // carry NO session type: the arc's own choice stands, and the person
  // either takes it at lower intensity or picks from the cards.
  lighter: null, general: "full", choose: null
};

/**
 * 🔴 CLINICAL-REVIEW, 16 Sep 2026. AROUND_BY_AREA IS GONE.
 *
 * It mapped a sore area to a training focus -- a sore back to glutes,
 * sore hips to core, a sore shoulder to legs. the clinical reviewer: "I would not support
 * fixed mappings from a reported sore area to a specific training
 * focus." Her reason is the one the research pack had already half
 * found: a self-reported sore area does not tell the app enough to
 * decide what should or should not be loaded. The evidence was
 * low-certainty for the back and pointed the other way for the
 * shoulder, and the pack said so -- but the answer was to remove the
 * mapping, not to tune it.
 *
 * sessionTypeForForm() takes no area now. There is nothing about a
 * body part it is allowed to decide.
 */
export function sessionTypeForForm(formId) {
  return Object.prototype.hasOwnProperty.call(FORM_TO_SESSION_TYPE, formId)
    ? FORM_TO_SESSION_TYPE[formId] : null;
}

/**
 * CLINICAL-REVIEW. "A lighter session" and "just keep moving gently" mean a
 * lower-intensity session -- the first of the three things she named.
 * INTENSITY-SPACE made "low" reach the generator properly this
 * morning; without that, this would have been a label that changed
 * nothing.
 */
/**
 * 🔴 CL-4, 16 Sep 2026. THE STOP-AND-SEEK LINE, SHOWN EVERY TIME.
 *
 * the clinical reviewer: "Include clear advice to stop if symptoms increase and to seek
 * assessment for persistent, worsening, or concerning symptoms."
 *
 * The first implementation put this INSIDE the recommendation reason --
 * and a recommendation only exists when there is history. So on day one,
 * somebody reporting a sore back got no stop advice at all, which is
 * the exact person it is for. Found on review of an interrupted turn's
 * work, by asking what a first-day user would see.
 *
 * Now separate, and shown whenever the purpose is about a sore or
 * particular area, whether or not there is anything to recommend.
 *
 * ⚫ It names all three of her words -- keeps coming back (persistent),
 * getting worse (worsening), anything that worries you (concerning) --
 * and echoes HURT_AND_ACHE's "worth getting someone to look at it", so
 * the app says one thing about this rather than two.
 */
/**
 * One wording, two grammatical numbers. The severe-pain screen can name
 * more than one condition, and "Stop if it gets worse" about two
 * things at once is a small grammar fault on the most serious screen in
 * the app. Built from one function so both places say the same thing.
 */
export function safetyLineFor(them = "it") {
  const plural = them === "them";
  return `Stop if ${plural ? "they get" : "it gets"} worse. ` +
         `If ${plural ? "they keep" : "it keeps"} coming back, ` +
         `${plural ? "are" : "is"} getting worse, or anything about ` +
         `${them} worries you, it's worth getting someone to look at ${them}.`;
}

export const SAFETY_LINE = safetyLineFor("it");

export function needsSafetyLine(purposeId) {
  return purposeId === "niggle" || purposeId === "area";
}

export function intensityForForm(formId) {
  return (formId === "lighter" || formId === "gentle") ? "low" : null;
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

    // 🔴 CLINICAL-REVIEW, 16 Sep 2026. Every reason here used to tell the
    // person what to do with the sore part -- "I'd build strength around
    // it rather than work it directly", "keeping it moving without
    // loading it". the clinical reviewer: "Avoid wording that says the app is
    // strengthening around a problem or advises users not to work an
    // area directly."
    //
    // Now each reason says what they TOLD us, and suggests a lighter
    // session -- activity modification, her words -- without naming a
    // body part to load or spare.
    //
    // ⚫ THE STOP-AND-SEEK ADVICE IS NOT HERE, deliberately. It was, in
    // the first implementation, and that meant a first-day user -- who
    // has no history and so gets no recommendation -- got no stop
    // advice at all. It now lives in SAFETY_LINE, shown as its own
    // message whenever the purpose concerns a sore or particular area.
    // These reasons say what somebody TOLD us; that line says what to
    // do if it gets worse. Keeping them apart means neither repeats the
    // other.
    if (times >= 3) {
      return { formId: "lighter",
        reason: `You've flagged your ${said} ${times} times in the last fortnight. ` +
                `A lighter session may suit today.` };
    }
    if (times === 2) {
      return { formId: "lighter",
        reason: `That's the second time you've flagged your ${said} this fortnight. ` +
                `A lighter session may suit today.` };
    }
    // Flagged once, and it is today's. Nothing historical to lean on, so
    // the reason is today's own answer rather than a pattern.
    if (times === 1 && flaggedAreas().includes(areaId)) {
      return { formId: "gentle",
        // No "stop if it gets worse" here: SAFETY_LINE follows this
        // message immediately and says it. Two consecutive messages
        // saying the same thing reads as the app not listening to itself.
        reason: `You flagged it this morning. Something gentle may suit today.` };
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
  lighter:  "a lighter session",
  general:  "something general",
  gentle:   "gentle movement",
  choose:   "your own choice",
  mobility: "range of movement",
  stretch:  "stretching",
  strength: "strength",
  cardio:   "cardio",
  mixed:    "a bit of each"
};

const FORM_TAILS = {
  // CLINICAL-REVIEW. The "around it" tail is gone with the option. Nothing
  // here describes what is being done TO the sore part.
  lighter:  ", and asked for a lighter session",
  general:  ", and asked for something general",
  gentle:   ", and asked to keep moving gently",
  choose:   ", and chose the session yourself",
  mobility: ", and asked to work on range of movement",
  stretch:  ", and asked to stretch",
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
