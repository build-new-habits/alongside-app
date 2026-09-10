/**
 * data/class-contract.js
 *
 * 08 Sep 2026 v2
 *
 * v2 - CLASS-1b. durationLabel(). What a person reads is DERIVED from the
 *   true total and rounded UP to five minutes, not authored. Graeme's
 *   call, and it resolves a discrepancy the exact check was papering
 *   over rather than tidying a number that was misleading either way.
 *
 * 08 Sep 2026 v1
 *
 * CLASS-1. The guided class data contract, fixed against the three
 * classes that were written before it.
 *
 * ── WHY THE CONTRACT COMES FROM THE CLASSES, NOT THE OTHER WAY ROUND ──
 *
 * Class 001 proposed a shape from what it had actually used. 002 was
 * written as a circuit and 003 as seated mindfulness precisely to strain
 * it. All three record what they did to the contract, and all three say
 * the same thing: it held. This file is that shape as code, and the
 * three classes are the fixtures it is checked against.
 *
 * Their own words: "Fix it against these three before writing a fourth."
 *
 * ── THE ONE THING THEIR PROPOSAL GOT WRONG ───────────────────────────
 *
 * Class 001's draft wrote `strands: ["trusting-body", "at-home-in-body",
 * "self-kindness"]` -- a flat list. But every class card distinguishes
 * "Serves strand" (exactly one) from "Also touches" (several), and the
 * distinction is load-bearing:
 *
 *   "A class declares which strands it SERVES; a twelve-week programme
 *    is a path through the strands the person's arc contains."
 *
 * Flattened, Class 003 -- which serves `pacing` and merely touches
 * `trusting-body` -- would be offered to somebody whose arc contains
 * trusting-body as though it were built for them. It is not. It is a
 * class about stopping early that happens to brush against it.
 *
 * So: `serves` is one strand, `touches` is a list, and they are separate
 * fields. That is what the cards always said; only the draft schema
 * collapsed them.
 *
 * ── AND THE SECOND: SECTIONS, NOT A FLAT LIST OF BEATS ───────────────
 *
 * The draft had `beats` at the top level. But every class is written in
 * NUMBERED SECTIONS WITH STATED DURATIONS -- Ground has eight, summing
 * to exactly its fifteen minutes -- and flattening them loses three
 * things that are not decoration:
 *
 *   1. The card's stated length becomes unverifiable. Transcribed flat,
 *      Ground's pauses total 7.4 minutes against a card promising 15.
 *      Nothing is wrong with the writing: the missing time is the
 *      speaking, and the sections are what account for it. A duration
 *      nothing can check is a claim with nothing behind it.
 *
 *   2. The player cannot say where somebody is. "3 of 8" needs sections.
 *      25 beats is not something to show anybody.
 *
 *   3. Class 002's rounds already need them. Its "Round two" repeats
 *      sections 2 to 6, cued by name. As indices into a flat array that
 *      range breaks silently the first time a line is inserted.
 *
 * Beats are unchanged. They sit one level down.
 *
 * validateClass() asserts the section durations sum to the class
 * duration, so the number on the card and the content underneath it
 * cannot drift apart.
 *
 * ── SPEECH AND HOLD ARE DIFFERENT SECONDS ────────────────────────────
 *
 * 🔴 The safety-relevant rule in this whole file, from spec §4b and
 * Class 002.
 *
 * `speechSeconds` is a gap between cues and SCALES with a pacing choice.
 * `holdSeconds` is a movement held to a duration and MUST NEVER SCALE.
 * Class 002's plank is 35 seconds: at 1.5x that becomes 23, which is a
 * harder exercise nobody asked for, and at 0.5x it becomes 70, which is
 * the opposite of what somebody choosing "slower" was asking for.
 *
 * One number in one field cannot carry both meanings, so there are two
 * fields and scaling touches exactly one of them.
 *
 * ── THREE KINDS OF ALTERNATIVE, AND WHY THEY ARE NOT ONE FIELD ───────
 *
 * Class 002 and 003 both made this argument and it survived twice:
 *
 *   seatedRoute          the whole CLASS, done seated. A property of the
 *                        class, not of a beat -- somebody who cannot get
 *                        to the floor needs to know before they start,
 *                        not to discover it beat by beat.
 *
 *   seatedAlternativeId  this movement, done seated.
 *
 *   easierRouteId        the SAME movement, less of it. Knees-down plank
 *                        is not a seated plank. Collapsing these two
 *                        would make "can't get to the floor" and "can't
 *                        hold it long" the same problem, and they are
 *                        not remotely the same problem.
 *
 * Class 003 found a fourth -- a DIFFERENT movement doing the same job --
 * and deliberately did not add a field for it. Three classes is not
 * enough to know whether it recurs. It stays out until it does.
 */

/** Beat kinds. A class is not a list of movements: half of Class 001 is
 *  silence and questions, and a schema shaped like a workout would have
 *  thrown away the parts that make it a class. */
export const BEAT_KINDS = Object.freeze([
  'arriving',   // settling in. Screen and voice, no movement, no hold.
  'movement',   // the only kind that may carry an exercise or a hold.
  'reflect',    // NEW in Class 003. Asks a question, offers no movement.
  'rest',       // between rounds or movements.
  'closing'     // the last beat. Class 001: the closing line IS the class.
]);

export const POSITIONS = Object.freeze(['floor', 'seated', 'standing', 'mixed']);

/**
 * Fields every class carries, and the ones only some do.
 *
 * Listed here rather than implied by a validator so that the contract is
 * readable as a contract. verify-class-contract asserts that this list
 * and validateClass() below cannot disagree.
 */
export const CLASS_FIELDS = Object.freeze({
  required: ['id', 'title', 'serves', 'formats', 'intensityBias',
             'durationMins', 'position', 'equipment', 'flags', 'sections'],
  optional: ['touches', 'seatedRoute', 'rounds', 'roundRange', 'notes', 'durationNote']
});

/**
 * Sections are timed in SECONDS, the class in minutes.
 *
 * Class 002 opens with a section the document calls "1 min 30". In
 * whole minutes that is not expressible, and in decimal minutes it is
 * 1.5 -- a float summed nine times to be compared against an integer,
 * which is a rounding argument waiting to happen over something that
 * should simply be exact.
 *
 * The class keeps durationMins because that is what the card says and
 * what a person reads. The check is sum(seconds) === minutes * 60.
 */
export const SECTION_FIELDS = Object.freeze({
  required: ['id', 'title', 'durationSeconds', 'beats'],
  optional: ['note']
});

export const BEAT_FIELDS = Object.freeze({
  required: ['kind'],
  optional: ['screen', 'voice', 'speechSeconds', 'holdSeconds', 'exerciseId',
             'practiceId', 'sitOut', 'seatedAlternativeId', 'easierRouteId',
             'stopCue']
});

/**
 * Applies a pacing rate to a beat's timings.
 *
 * 🔴 The whole point of the two fields. holdSeconds is returned
 * untouched at every rate. If a future caller wants to scale a hold it
 * has to go around this function, which is exactly the visibility the
 * spec asks for.
 */
/**
 * What a person reads on the card.
 *
 * DERIVED, NEVER AUTHORED. Graeme's call, and it fixes something the
 * exact check was papering over: Class 002's card said 18 minutes and its
 * own sections totalled 19, and reconciling those two numbers would have
 * been tidying a figure that was misleading either way. That class openly
 * offers stopping after one round -- so a single exact number describes a
 * session a good proportion of people will not have.
 *
 * The class still carries its true total, and the contract still asserts
 * the sections sum to it, because that is what stops content and stated
 * length drifting apart. What changes is that the true total is no longer
 * what anybody reads.
 *
 * Rounded UP to five minutes, and hedged. "About 20 minutes" is both true
 * and useful where "19 minutes" is precise and slightly false.
 *
 * UP, not to the nearest. To the nearest, a 12-minute class reads "about
 * 10 minutes" -- and somebody who has exactly ten minutes starts it and
 * runs over. Over-stating costs them a pleasant surprise; under-stating
 * costs them the thing they were protecting when they checked. Those are
 * not symmetrical, and this app is for people whose time and energy are
 * often the scarce thing.
 *
 * A second authored label would be a second thing to keep in step with
 * the content, and it would go stale the first time a section changed --
 * which is the whole fault this file exists to prevent, reintroduced one
 * level up.
 */
export function durationLabel(cls) {
  if (!cls || typeof cls.durationMins !== 'number') return '';
  const rounded = Math.ceil(cls.durationMins / 5) * 5;
  const base = `about ${rounded} minutes`;
  // durationNote is for the classes where the SHAPE matters, not the
  // number: Class 002 is meaningfully shorter if somebody stops after one
  // round, and that is a fact about the class, not a rounding.
  return cls.durationNote ? `${base} — ${cls.durationNote}` : base;
}

export function pacedBeat(beat, rate = 1) {
  const r = Number(rate) > 0 ? Number(rate) : 1;
  const out = { ...beat };
  if (typeof beat.speechSeconds === 'number') {
    out.speechSeconds = Math.round(beat.speechSeconds / r);
  }
  // holdSeconds deliberately absent from this function's effects.
  return out;
}

/**
 * Validates one class against the contract. Returns { ok, problems }.
 *
 * Problems are strings a person can act on, not codes. A content author
 * writing class four is the reader here, and "beat 7: holdSeconds on a
 * reflect beat" tells them what to do where "E_BEAT_FIELD" does not.
 */
export function validateClass(cls, { strandIds = null, exerciseIds = null } = {}) {
  const problems = [];
  const p = (msg) => problems.push(msg);

  if (!cls || typeof cls !== 'object') return { ok: false, problems: ['not an object'] };

  for (const f of CLASS_FIELDS.required) {
    if (cls[f] === undefined || cls[f] === null) p(`missing required field: ${f}`);
  }

  const known = new Set([...CLASS_FIELDS.required, ...CLASS_FIELDS.optional]);
  for (const f of Object.keys(cls)) {
    if (!known.has(f)) p(`unknown field: ${f}`);
  }

  // serves is ONE strand. See the header: a flat list would offer a
  // class to an arc it only brushes against.
  if (typeof cls.serves !== 'string') {
    p('serves must be a single strand id, not a list — see the header');
  }
  if (cls.touches !== undefined && !Array.isArray(cls.touches)) {
    p('touches must be an array of strand ids');
  }
  if (typeof cls.serves === 'string' && Array.isArray(cls.touches) &&
      cls.touches.includes(cls.serves)) {
    p(`serves and touches both list "${cls.serves}" — a class serves it or brushes it`);
  }

  if (strandIds) {
    const all = [cls.serves, ...(cls.touches || [])].filter(Boolean);
    for (const s of all) {
      if (!strandIds.has(s)) p(`unknown strand: ${s}`);
    }
  }

  if (cls.position !== undefined && !POSITIONS.includes(cls.position)) {
    p(`position must be one of ${POSITIONS.join(', ')}`);
  }
  if (cls.position === 'floor' && cls.seatedRoute === undefined) {
    p('a floor class must state seatedRoute either way — somebody who ' +
      'cannot get to the floor needs to know before they start');
  }

  if (!Array.isArray(cls.sections) || cls.sections.length === 0) {
    p('sections must be a non-empty array');
    return { ok: problems.length === 0, problems };
  }

  const sectionIds = new Set();
  let stated = 0;

  cls.sections.forEach((sec, si) => {
    const where = `section ${si + 1}`;
    for (const f of SECTION_FIELDS.required) {
      if (sec[f] === undefined || sec[f] === null) p(`${where}: missing ${f}`);
    }
    const knownS = new Set([...SECTION_FIELDS.required, ...SECTION_FIELDS.optional]);
    for (const f of Object.keys(sec)) {
      if (!knownS.has(f)) p(`${where}: unknown field "${f}"`);
    }
    if (sectionIds.has(sec.id)) p(`${where}: duplicate section id "${sec.id}"`);
    sectionIds.add(sec.id);
    if (typeof sec.durationSeconds === 'number') stated += sec.durationSeconds;
    if (!Array.isArray(sec.beats) || sec.beats.length === 0) {
      p(`${where} ("${sec.title}"): beats must be a non-empty array`);
    }
  });

  // The number on the card and the content underneath it cannot drift.
  if (typeof cls.durationMins === 'number' && stated !== cls.durationMins * 60) {
    p(`sections total ${(stated / 60).toFixed(1)} min but the class says ` +
      `${cls.durationMins} — a stated length nothing checks is a claim with ` +
      `nothing behind it`);
  }

  // Rounds repeat SECTIONS, by id. Class 002's "Round two" repeats
  // sections 2 to 6, cued by name; as indices into a flat beat array
  // that range would break the first time a line was inserted.
  if (cls.rounds !== undefined) {
    if (!Array.isArray(cls.roundRange) || cls.roundRange.length === 0) {
      p('rounds needs roundRange: which section ids repeat');
    } else {
      for (const id of cls.roundRange) {
        if (!sectionIds.has(id)) p(`roundRange names a section that does not exist: ${id}`);
      }
    }
  }

  const allBeats = cls.sections.flatMap((sec, si) =>
    (Array.isArray(sec.beats) ? sec.beats : []).map((b, bi) => ({ b, label: `${sec.id} beat ${bi + 1}` })));

  allBeats.forEach(({ b, label }) => {
    const at = label;
    if (!BEAT_KINDS.includes(b.kind)) {
      p(`${at}: unknown kind "${b.kind}"`);
    }
    const knownB = new Set([...BEAT_FIELDS.required, ...BEAT_FIELDS.optional]);
    for (const f of Object.keys(b)) {
      if (!knownB.has(f)) p(`${at}: unknown field "${f}"`);
    }

    // Only a movement beat may carry a movement or a hold. Class 003
    // recorded reflect beats being filed as ordinary beats and called
    // that wrong: they take no exercise, no hold and no stop cue.
    if (b.kind !== 'movement') {
      for (const f of ['exerciseId', 'holdSeconds', 'stopCue',
                       'seatedAlternativeId', 'easierRouteId']) {
        if (b[f] !== undefined) p(`${at}: ${f} on a ${b.kind} beat`);
      }
    }

    if (typeof b.holdSeconds === 'number' && typeof b.speechSeconds === 'number') {
      p(`${at}: carries both holdSeconds and speechSeconds — they mean ` +
        `different things and only one of them scales`);
    }

    // Never "when you can't do any more". Class 002: that phrasing makes
    // the end of a set a failure event, and it is the default in this
    // entire format.
    if (typeof b.stopCue === 'string' &&
        /can'?t (do )?any ?more|to failure|until failure|as many as you can/i.test(b.stopCue)) {
      p(`${at}: stopCue makes the end of a set a failure event`);
    }

    if (exerciseIds) {
      for (const f of ['exerciseId', 'seatedAlternativeId', 'easierRouteId']) {
        if (b[f] && !exerciseIds.has(b[f])) p(`${at}: unknown ${f}: ${b[f]}`);
      }
    }
  });

  return { ok: problems.length === 0, problems };
}
