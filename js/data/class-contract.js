/**
 * data/class-contract.js
 *
 * 08 Sep 2026 v6
 *
 * v6 - PACING-1. Beats cost SAYING the line plus the pause after it;
 *   a section runs for its stated duration and the remainder is silence.
 *   The card rounds up to the nearest MINUTE, not to five: a 15.5 minute
 *   class read "about 20", a 30% overstatement. The slack belongs in a
 *   pause control the person operates.
 *
 * 08 Sep 2026 v5
 *
 * v5 - CLASS-3. Two things Class 006 found by being the first class that
 *   leaves the room: `walking` is a position, and a class with no
 *   movement beats -- invisible to classSafety(), which judges exercise
 *   ids -- must declare its own flags, or nothing warns the person from
 *   any direction.
 *
 * 08 Sep 2026 v4
 *
 * v4 - CLASS-2b. lighterVoice: one alternative line per beat, used only
 *   when the lighter variant runs. Subtraction alone turned out not to
 *   be sufficient -- a line naming a duration the person did not have.
 *   Smallest thing that works: there is still exactly ONE class.
 *
 * 08 Sep 2026 v3
 *
 * v3 - CLASS-2. The lighter variant, as a SUBTRACTION of sections rather
 *   than a second script. Graeme decided on 06 Sep that a not-great day
 *   gets the lighter class and only a genuinely-should-not day routes
 *   out of the room; none of the three written classes encoded one and
 *   there was no field for it.
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

/**
 * CLASS-3, 08 Sep 2026. `walking` added for Class 006, the first class
 * that leaves the room.
 *
 * `standing` was technically true of a walk and completely useless to
 * somebody deciding whether they can do it today, which is the only
 * question this field exists to answer.
 *
 * ⚫ Worth saying while it is fresh: this field is really WHERE THE BODY
 * IS, not what posture it holds. If a swimming or cycling class is ever
 * written, the honest fix is to rename it rather than keep adding
 * postures that are not postures.
 */
export const POSITIONS = Object.freeze(['floor', 'seated', 'standing', 'mixed', 'walking']);

/**
 * CLASS-2, 08 Sep 2026. The lighter variant.
 *
 * Graeme's decision, 06 Sep, and it was already made before any class was
 * written: on a NOT-GREAT day the class serves its lighter variant --
 * "you still get the class you came for" -- and only a genuinely-should-
 * not day routes the person out of the room to One to one or Quick build.
 * Two tiers, and he was explicit that the pairing beats either alone.
 *
 * None of the three written classes encoded one and the contract had no
 * field for it, so a fourth class written now would have been written in
 * one variant of a thing that is supposed to have two.
 *
 * ── WHY IT IS A SUBTRACTION, NOT A SECOND SCRIPT ─────────────────────
 *
 * A lighter variant expressed as its own set of sections would be a
 * second class to keep in step with the first: change a line in Ground
 * and you would have two places to change it, and the day somebody
 * changed one and not the other is the day a person on a bad day gets
 * the older, worse version.
 *
 * So it names what to LEAVE OUT and what to say instead. The class is
 * the class; the lighter day is the class with less of it.
 *
 * `omitSections` — section ids not run.
 * `note`         — what the coach says about the shorter shape, if
 *                  anything needs saying. Optional: Steady Round already
 *                  says it inside the class itself.
 *
 * ⚫ The lighter variant is NOT the seated route and NOT the easier
 * route. Those answer "I cannot get to the floor" and "I cannot hold
 * this for that long". This one answers "today is not a good day", which
 * is a different question with a different answer, and conflating them
 * would offer somebody a chair when what they needed was a shorter class.
 */
export const LIGHTER_FIELDS = Object.freeze({
  required: ['omitSections'],
  optional: ['note']
});

/**
 * The sections a class runs today. The whole class, or the lighter one.
 *
 * One function, so a caller cannot accidentally run the full class on a
 * bad day by reaching for `cls.sections` directly -- which is what every
 * caller would otherwise do, because that is the obvious field.
 */
export function sectionsFor(cls, { lighter = false } = {}) {
  if (!lighter || !cls.lighter) return cls.sections || [];
  const omit = new Set(cls.lighter.omitSections || []);
  return (cls.sections || []).filter(s => !omit.has(s.id));
}

/**
 * CLASS-2b, 08 Sep 2026. A line that is only true on the full day.
 *
 * Ground's second noticing asks "is anything different from four minutes
 * ago?" -- and in a lighter variant that drops two of the three
 * movements, four minutes ago is wrong. Not a nuance: it names a
 * duration the person did not experience, in a class whose entire
 * subject is whether they can trust what their body reports.
 *
 * Found by searching every possible subtraction of Ground's sections.
 * Thirty-eight satisfy the structural rules, and the best of them still
 * leaves that line saying something untrue -- so subtraction alone is
 * not sufficient after all, and the contract needed one more thing.
 *
 * `lighterVoice` is that thing, and it is deliberately the SMALLEST
 * thing that works. Not a second script, not a second set of sections:
 * one alternative line on one beat, used only when the lighter variant
 * runs. There is still exactly one class, and a change to it is still
 * made in exactly one place.
 *
 * ⚫ It replaces the voice only, never the screen, the exercise, the
 * hold or the stop cue. A lighter day is a shorter class, not a
 * different one — the moment this could swap an exercise it would be a
 * second script wearing a small field's clothes.
 */
export function voiceFor(beat, { lighter = false } = {}) {
  if (lighter && typeof beat.lighterVoice === 'string') return beat.lighterVoice;
  return beat.voice;
}

/** Minutes the lighter variant runs. Derived, like everything else. */
export function lighterMinutes(cls) {
  const secs = sectionsFor(cls, { lighter: true })
    .reduce((a, s) => a + (s.durationSeconds || 0), 0);
  return secs / 60;
}

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
  optional: ['touches', 'seatedRoute', 'rounds', 'roundRange', 'notes', 'durationNote', 'lighter']
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
             'stopCue', 'lighterVoice']
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
 * Rounded UP to the nearest MINUTE, and hedged.
 *
 * UP, not to the nearest: over-stating costs a pleasant surprise,
 * under-stating costs somebody the thing they were protecting when they
 * checked. Not symmetrical, in an app for people whose time and energy
 * are usually the scarce thing.
 *
 * ── WHY MINUTES AND NOT FIVES ────────────────────────────────────────
 *
 * It rounded up to five until PACING-1 measured what the classes
 * actually run. A 15.5 minute class then read "about 20 minutes" -- a
 * 30% overstatement that would make somebody skip a class they had time
 * for. The five-minute bucket was sound at "is this 10 or 20" and coarse
 * at "is this 15 or 16".
 *
 * Graeme, thinking it through out loud: the case for five-minute
 * boundaries was transition time -- getting to the floor, finding a
 * chair -- and then "but actually, these are paced classes, aren't they?
 * So we might have pauses." Which is the better answer: the slack
 * belongs in a PAUSE CONTROL the person operates, not in a number padded
 * on their behalf.
 *
 * So the number is honest to the minute, and the class says you can stop
 * it whenever you like.
 *
 * A second authored label would be a second thing to keep in step with
 * the content, and it would go stale the first time a section changed --
 * which is the whole fault this file exists to prevent, reintroduced one
 * level up.
 */
export function durationLabel(cls) {
  if (!cls || typeof cls.durationMins !== 'number') return '';
  const rounded = Math.ceil(cls.durationMins);
  const base = `about ${rounded} minute${rounded === 1 ? '' : 's'}`;
  // durationNote is for the classes where the SHAPE matters, not the
  // number: Class 002 is meaningfully shorter if somebody stops after one
  // round, and that is a fact about the class, not a rounding.
  return cls.durationNote ? `${base} — ${cls.durationNote}` : base;
}

/**
 * PACING-1, 08 Sep 2026. How long a beat actually takes.
 *
 * ── THE FAULT THIS FIXES ─────────────────────────────────────────────
 *
 * `speechSeconds` is the pause AFTER a line. Nothing anywhere accounted
 * for the time to SAY the line — so the first player ran a fifteen
 * minute class in eight and a half, and 50 of the 55 sections across
 * seven classes missed their own stated duration by more than fifteen
 * seconds. Only playing a class revealed it; reading never would.
 *
 * ── WHY THE RATE IS 105 AND NOT THE APP'S TTS DEFAULT ────────────────
 *
 * tts.js speaks at Web Speech rate 0.9, roughly 135 wpm. That is a
 * reading voice. These classes are a coach talking to somebody lying on
 * the floor, and calm guided delivery sits nearer 100–120.
 *
 * ⚫ Checked against the classes themselves rather than assumed: at 105
 * wpm the four classes drafted on 08 Sep land within a minute of their
 * authored lengths. The three from 06 Sep do not, and looking at WHICH
 * sections showed why — Steady Round's round two is a five minute slot
 * holding one beat and nine seconds of content, because "the same five,
 * cued by name only" was never written out. A content gap, not a rate.
 */
export const SPEAKING_WPM = 105;

export function speakingSeconds(text, wpm = SPEAKING_WPM) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean).length;
  return words === 0 ? 0 : (words / wpm) * 60;
}

/**
 * The whole cost of a beat: saying it, then the pause written after it.
 *
 * 🔴 holdSeconds is added, never scaled. A held position is a duration
 * somebody is in, not a gap between sentences.
 */
export function beatSeconds(beat, { lighter = false, rate = 1, wpm = SPEAKING_WPM } = {}) {
  const said = speakingSeconds(voiceFor(beat, { lighter }), wpm);
  if (typeof beat.holdSeconds === 'number') return said + beat.holdSeconds;
  const paced = pacedBeat(beat, rate);
  return said + (typeof paced.speechSeconds === 'number' ? paced.speechSeconds : 3);
}

/** What a section's content actually needs. */
export function sectionSeconds(section, opts = {}) {
  return (section.beats || []).reduce((a, b) => a + beatSeconds(b, opts), 0);
}

/**
 * PACING-1. A SECTION RUNS FOR ITS STATED DURATION.
 *
 * Graeme's call, after hearing it: beats consume time inside the
 * section, and whatever is left is silence at the end. That keeps the
 * authored durations as the truth — they are the SHAPE of the class —
 * and makes the number on the card true rather than aspirational.
 *
 * It also produces the one error worth gating: a section whose content
 * OVERFLOWS its slot. That is not silence, it is a class running past
 * what it promised, and it is the direction that actually harms anybody.
 */
export function silenceTailSeconds(section, opts = {}) {
  return Math.max(0, (section.durationSeconds || 0) - sectionSeconds(section, opts));
}

export function sectionOverflows(section, opts = {}) {
  return sectionSeconds(section, opts) > (section.durationSeconds || 0);
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

  // CLASS-3. A class with no movement beats is INVISIBLE to the safety
  // filter: classSafety() judges exercise ids against the person's
  // conditions, and a class with none passes trivially, for everybody, in
  // every condition.
  //
  // That is not a bug in the filter -- Class 006's risks are weather,
  // light, traffic and going out alone, none of which are in the model
  // and none of which belong in an exercise library. But a class that
  // nothing can vet must at least SAY what it involves, or the person
  // gets no warning from any direction at all.
  const anyMovement = (cls.sections || [])
    .flatMap(s => s.beats || [])
    .some(b => b.kind === 'movement');
  if (!anyMovement && Array.isArray(cls.flags) && cls.flags.length === 0) {
    p('a class with no movement beats is invisible to the safety filter, ' +
      'so it must declare its own flags — otherwise nothing warns the ' +
      'person about it from any direction');
  }

  if (cls.lighter !== undefined) {
    const L = cls.lighter;
    if (!L || typeof L !== 'object') {
      p('lighter must be an object');
    } else {
      for (const f of LIGHTER_FIELDS.required) {
        if (L[f] === undefined) p(`lighter: missing ${f}`);
      }
      const knownL = new Set([...LIGHTER_FIELDS.required, ...LIGHTER_FIELDS.optional]);
      for (const f of Object.keys(L)) {
        if (!knownL.has(f)) p(`lighter: unknown field "${f}"`);
      }
      if (Array.isArray(L.omitSections) && L.omitSections.length === 0) {
        p('lighter omits nothing — a lighter variant identical to the class ' +
          'is not a lighter variant, and offering it on a bad day is a lie');
      }
    }
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

  if (cls.lighter && Array.isArray(cls.lighter.omitSections)) {
    for (const id of cls.lighter.omitSections) {
      if (!sectionIds.has(id)) p(`lighter omits a section that does not exist: ${id}`);
    }
    const left = cls.sections.filter(s => !cls.lighter.omitSections.includes(s.id));
    // A lighter day still has to arrive somewhere and leave somewhere.
    // Stripping a class back to its middle is not a gentler version of
    // it, it is a fragment.
    const kinds = new Set(left.flatMap(s => (s.beats || []).map(b => b.kind)));
    if (!kinds.has('closing')) {
      p('the lighter variant has no closing — a class that stops rather ' +
        'than ends is not a gentler version of one that ends');
    }
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

    if (b.lighterVoice !== undefined && !cls.lighter) {
      p(`${at}: lighterVoice on a class with no lighter variant — it can ` +
        `never be said`);
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
