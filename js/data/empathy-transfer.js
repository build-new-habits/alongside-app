/**
 * data/empathy-transfer.js - Empathy Transfer Prompt Pool
 * 13 Aug 2026 v5
 *
 * v5 - VOICE-2. Twelve positive-context prompts added to stage 1, all
 *   requiring goodEnergy so none can fire on a hard day. E1 had
 *   correctly gated two of the original four behind real difficulty,
 *   which left somebody having a straightforwardly good run meeting
 *   only two prompts across their whole arc -- and one of those was
 *   about meeting difficulty. 21 prompts to 33.
 *
 *   The design problem, recorded for whoever writes the next one:
 *   praise slides into verdict almost immediately and P4 forbids
 *   verdicts. Every line points at what HAPPENED, never at what it says
 *   about the person. "That went well" is a description; "you're doing
 *   well" would not be.
 *
 * 13 Aug 2026 v4
 *
 * v4 - E1. Prompts B and D documented a condition ("when check-in energy
 *   was low", "after a particularly difficult session") that lived only
 *   in prefers, never requires. With no difficulty signals every prompt
 *   scores 0, the tie band holds all four, and selection degenerates to
 *   rotation -- so persona 2.15, energy 7 every day for three weeks, was
 *   told she had moved through something difficult. EMP-1s fix arriving
 *   from the other side: absence of difficulty is not a signal a scorer
 *   can act on, it has to be a requirement.
 *
 *   New compound tag "anyOf:a,b,c" -- requires[] is AND, and a prompt
 *   about difficulty should fire when the day was hard OR energy was low
 *   OR they came back after a gap.
 *
 * 12 Aug 2026 v3
 *
 * v3 - EMP-2. The two gaps v2 raised are closed, and BOTH turned out to
 *   be code, not content. v2 called them "content gaps needing Graeme".
 *   That was wrong, and this note corrects it.
 *
 *   GAP 1 -- "the coach made visible adjustments" is now evaluable.
 *   session-builder.js v23 writes session.rationale.adjusted, on two
 *   triggers that both mean the person could SEE it: something was left
 *   out and explained, or a condition was flagged at 4+ (which
 *   constrains selection and makes progressionInvitation name the sore
 *   area). Silent adaptation deliberately does not count -- a prompt
 *   about noticing someone else should follow a moment the person
 *   actually witnessed, or it praises them for something invisible.
 *
 *   GAP 2 -- stage 5 needed no new prompt at all. Every stage header
 *   below carries a session range ("Sessions 1-12", "12-30", "30-55",
 *   "55-85", "85+") and nothing ever read them: stage advance counted
 *   FIRINGS only, so the two mechanisms drifted. Simulation showed
 *   stages 2-4 arriving late against their own ranges (harmless) and
 *   stage 5 arriving at ~77 against a documented 85 -- the entire bug,
 *   since all four stage 5 prompts gate at 85+. STAGE_SESSION_FLOOR now
 *   enforces the ranges this file already declared. Re-simulated: stage
 *   5 entered at session 89, zero fallbacks across a 160-session arc.
 *
 * 12 Aug 2026 v2
 *
 * v2 - EMP-1. Condition-aware selection. Each prompt is now an object
 *   carrying its own conditions, and this file gained a matcher.
 *
 *   WHAT CHANGED AND WHAT DID NOT. Every one of the 21 prompt strings is
 *   byte-identical to v1, verified by assertion during the rewrite. The
 *   v1 rule stands: wording is owned by
 *   alongside_empathy_transfer_prompts_19may2026_v1.docx and is not
 *   edited here. Only structure and metadata changed.
 *
 *   WHY. v1's own header said it plainly: the per-prompt "when" triggers
 *   were "retained here as commentary only, in case a future session
 *   wants to layer in condition-aware selection." Selection was
 *   `pool[atStage % pool.length]` -- rotation. It ignored everything
 *   about the session that had just happened.
 *
 *   NOTE 1 -- the signal v1 never considered. The strongest input is not
 *   in the spec's "when" list at all. By the time a prompt fires, the
 *   person has just answered three questions one screen earlier: how it
 *   felt (Felt strong / About right / Struggled), whether pain was worse
 *   than usual, and mood after on a 1-10. Someone could answer
 *   "Struggled", "Worse than usual" and "Struggling", then receive a
 *   prompt about strong energy because it was next in rotation. The app
 *   asked and did not listen -- at the most exposed moment in the
 *   session. Graeme's decision, 12 Aug: today's answers lead, check-in
 *   energy second.
 *
 *   NOTE 2 -- SUPERSEDED BY v3, which made this condition evaluable via
 *   the coachAdjusted tag. Retained so the reasoning trail survives.
 *   As written at v2: one condition genuinely cannot be evaluated. Stage 2
 *   Prompt B's trigger is "after a session where the coach made visible
 *   adjustments (noted in the rationale card)". session-rationale.js
 *   writes nothing to store, so nothing records that an adjustment
 *   happened. Rather than fake it, that prompt carries an empty
 *   `requires` and an explicit `note`, so it participates only as a
 *   fallback and the gap is visible in the data instead of buried.
 *
 *   NOTE 3 -- the fallback was already in the data. Stages 1-4 each hold
 *   one prompt whose stated condition is "after any completed session".
 *   The spec author built an always-valid option into every pool, which
 *   is strong evidence fit-first-with-fallback was the intended mechanic
 *   from the start. Stage 5 is the exception and has no catch-all: its
 *   four prompts gate at 85+, 90+, 95+ and 100+ sessions.
 *
 *   SUPERSEDED BY v3: v2 concluded this was a spec hole needing new
 *   content. It was a staging bug. Stage 5 was being entered around
 *   session 77 against its own documented range of 85+; with
 *   STAGE_SESSION_FLOOR enforced, all four prompts qualify on entry and
 *   the nearest-threshold fallback below never fires in practice. It is
 *   kept as a genuine safety net rather than a workaround.
 *
 *   NOTE 4 -- P4 applies here too. The prompt should fit the day without
 *   announcing that it noticed. If the coach visibly softens when you
 *   say you struggled, its ordinary tone becomes a verdict on the days
 *   you did not. Selection is silent; no prompt says "I can see today
 *   was hard."
 *
 *   REPEATS. Graeme's decision: fit wins, capped at two consecutive
 *   firings of the same prompt, then the next-best fitting one. The
 *   pools hold 4-5 prompts and somebody can genuinely struggle for a
 *   fortnight; a coach who says the identical sentence every time stops
 *   being heard, but one that says something ill-fitting purely to vary
 *   itself is the rotation problem again. Tracked in store.js v32's
 *   empathyLastPrompt { stage, index, runLength }.
 *
 * 16 Jul 2026 v1 (S4-B3-2)
 *
 * New file. Confirmed fully dormant prior to this session — see
 * alongside_session_handoff_16jul2026_v5.md for the B3 discovery
 * findings.
 *
 * Prompt text is taken verbatim from
 * alongside_empathy_transfer_prompts_19may2026_v1.docx. Do not edit
 * wording here without updating the source spec to match — the spec
 * remains the single source of truth for prompt content.
 *
 * Selection mechanic (implemented in reflect.js v2): prompts are
 * chosen via a simple modulo on empathyPromptsAtStage within the
 * current stage's pool. The individual "When" trigger conditions
 * documented per-prompt in the source spec (e.g. "after 6+ sessions",
 * "after a session where check-in energy was low") are NOT used for
 * targeting in this build — the spec's own Build Notes section
 * confirms selection is "a simple modulo," not per-prompt condition
 * matching. Retained here as commentary only, in case a future session
 * wants to layer in condition-aware selection.
 *
 * Stage sizes (source spec has 21 prompts total, not the "19" in the
 * document's own framing text — the Build Notes stage-advance table
 * counts firings-per-stage, not pool size, so the two numbers were
 * never meant to match exactly):
 *   Stage 1: 4 prompts   Stage 2: 4 prompts   Stage 3: 5 prompts
 *   Stage 4: 4 prompts   Stage 5: 4 prompts
 */

export const EMPATHY_PROMPTS = {

  // ── Stage 1: Self-Recognition — Sessions 1-12 ────────────────
  // The coach names a capacity the user just demonstrated and invites
  // them to notice it. Nothing outward yet.
  1: [
    // Prompt A — when: after any completed session, regardless of energy or difficulty
    {
      text: "You came in today and you did the work. That sounds simple. It isn't. There is a version of today where that didn't happen, and you chose differently. That choice is yours. It's worth knowing you have it.",
      requires: [],
      prefers:  []
    },
    // Prompt B — when: after a session where check-in energy was low (4 or below) and the session was completed
    {
      text: "You moved through something difficult today. Not just the physical part — the part before it, where you decided to come. That decision happens quietly and it doesn't get logged anywhere. I noticed it.",
      // E1, 13 Aug 2026. Was requires: [], prefers: ["lowEnergy",
      // "struggled"] -- so the documented condition on the line above
      // was a preference only. With NO difficulty signals every prompt
      // scores 0, TIE_TOLERANCE puts them all in the tied band, and
      // selection degenerates to rotation. Persona 2.15 -- energy 7
      // every day for three weeks, no pain, no missed sessions -- was
      // told she had moved through something difficult.
      //
      // This is EMP-1's fix arriving from the other side. EMP-1 stopped
      // somebody having a hard day getting a cheerful prompt. Nothing
      // stopped somebody having an easy month getting a sympathetic one,
      // because the ABSENCE of difficulty is not a signal a scorer can
      // act on -- it has to be a requirement.
      requires: ["anyOf:lowEnergy,struggled"],
      prefers:  ["lowEnergy", "struggled"]
    },
    // Prompt C — when: after 6+ completed sessions, when the user has shown a pattern of adjusting rather than skipping
    {
      text: "The way you train tells me something. Not about your fitness — about how you meet difficulty. You don't avoid it. You adjust and continue. That's a particular kind of intelligence. I think you know that.",
      requires: ["minSessions:6"],
      prefers:  ["adjusting"]
    },
    // Prompt D — when: after a particularly difficult session or a return after a longer gap
    {
      text: "Something worth sitting with on the way home: the version of you that shows up here on hard days — what would you call that quality? Not the fitness part. The other part.",
      // E1. Same change, same reason: "on hard days" is a claim about
      // the person's experience and must not fire when there have been
      // none.
      requires: ["anyOf:struggled,returning,lowEnergy"],
      prefers:  ["struggled", "returning"]
    },

    // ── VOICE-2, 13 Aug 2026: positive-context prompts ────────────────
    //
    // E1 correctly gated prompts B and D behind actual difficulty. That
    // left somebody having a straightforwardly good run meeting only two
    // of four prompts across their whole arc, which is thin -- and the
    // two remaining are the neutral catch-all and one about meeting
    // difficulty. A person for whom this is simply going well had almost
    // nothing said to them.
    //
    // All require goodEnergy (energy above 4 AND no reported struggle),
    // so none can fire on a hard day. Written and approved by Graeme; do
    // not paraphrase.
    //
    // THE DESIGN PROBLEM THESE HAD TO SOLVE, recorded because the next
    // person writing one will hit it: praise slides into verdict almost
    // immediately, and P4 forbids verdicts. Every line points at what
    // HAPPENED rather than what it says about the person. "That went
    // well" is a description. "You're doing well" would not be.
    {
      text: "Nothing was in your way today and you came anyway. That's worth noticing, because it's the kind of day people forget. The hard ones get remembered. This one counts the same.",
      requires: ["goodEnergy"],
      prefers:  ["goodEnergy"]
    },
    {
      text: "That was a straightforward one. Not every session has to cost you something. Some of them are just the thing you do now.",
      requires: ["goodEnergy"],
      prefers:  ["goodEnergy"]
    },
    {
      // Graeme's own rewrite, 13 Aug. The draft ended "I'm not going to
      // make that mean anything — I just thought it was worth saying out
      // loud", which he rejected as meaning nothing. His version does
      // something instead of commenting on itself.
      text: "You had the energy today and you spent some of it here. There were other places it could have gone. Thanks for choosing to spend it here. If I could I'd give you extra credit. But sadly, I can't.",
      requires: ["goodEnergy"],
      prefers:  ["goodEnergy"]
    },
    {
      text: "Good days are easy to spend without noticing. This one has something in it now.",
      requires: ["goodEnergy"],
      prefers:  ["goodEnergy"]
    },
    {
      text: "Somewhere in this is a version of you that finds this ordinary. Not easy — ordinary. That's a different thing, and it arrives quietly.",
      requires: ["goodEnergy"],
      prefers:  ["goodEnergy"]
    },
    {
      text: "You turned up on a day that didn't require anything of you. Those are the ones that build the habit, though nobody ever writes about them.",
      requires: ["goodEnergy"],
      prefers:  ["goodEnergy"]
    },
    {
      text: "That went well. I'd rather tell you that plainly than dress it up.",
      requires: ["goodEnergy"],
      prefers:  ["goodEnergy"]
    },
    {
      text: "Nothing to report today, which is its own kind of report.",
      requires: ["goodEnergy"],
      prefers:  ["goodEnergy"]
    },
    {
      text: "There's a question in this somewhere: what does it feel like when it isn't hard? Worth knowing, because that's the feeling you're aiming at.",
      requires: ["goodEnergy"],
      prefers:  ["goodEnergy"]
    },
    {
      text: "You've got something spare today. Might be worth spending a bit of it on someone else before it's gone.",
      requires: ["goodEnergy"],
      prefers:  ["goodEnergy"]
    },
    {
      text: "Easy days aren't a lesser version of the hard ones. They're what the hard ones are for.",
      requires: ["goodEnergy"],
      prefers:  ["goodEnergy"]
    },
    {
      text: "That's the sort of session nobody tells a story about. It's also the sort that most of this is made of.",
      requires: ["goodEnergy"],
      prefers:  ["goodEnergy"]
    }
  ],

  // ── Stage 2: Relational Awareness — Sessions 12-30 ───────────
  // The capacity being built is now gently pointed toward the people
  // immediately around the user — partner, friend, colleague, family.
  // Not strangers yet.
  2: [
    // Prompt A — when: after any completed session, best when check-in energy was low
    {
      text: "Think of someone in your life who is dealing with something hard right now. If they were training through it the way you just trained through today — tired, still here, still doing the work — what would you think of them?",
      requires: [],
      prefers:  ["lowEnergy"]
    },
    // Prompt B — when: after a session where the coach made visible adjustments (noted in the rationale card)
    {
      text: "The coach adjusts based on what's actually going on for you — not what should be going on, not what was planned. Is there someone in your life you could do that for today? Not a big gesture. Just noticing where they actually are.",
      requires: [],
      prefers:  ["coachAdjusted"]
    },
    // Prompt C — when: after a quiet session, a rest day, or a session where the user modified significantly
    {
      text: "You just gave your body something it needed, not something it was told to do. That's a different kind of listening. I wonder if there's someone in your life who needs that kind of listening today — to be heard, not advised.",
      requires: [],
      prefers:  ["gentleSession"]
    },
    // Prompt D — when: after 20+ sessions, when a meaningful pattern of variable energy/completion is visible
    {
      text: "Here's something I've noticed over time: the sessions that look like less from the outside often cost the most. The ones where you were tired, or in pain, or not feeling it. The people around you probably have days like that too. Days that look fine from the outside.",
      requires: ["minSessions:20"],
      prefers:  ["variablePattern"]
    }
  ],

  // ── Stage 3: Situational Empathy — Sessions 30-55 ────────────
  // The frame widens to strangers — specific individuals in ordinary
  // situations, not groups or categories.
  3: [
    // Prompt A — when: after any completed session, strong energy for early stage 3
    {
      text: "On the way home today, if someone cuts you up, or is short with you, or seems like they're not really present — you've just spent an hour meeting yourself where you actually are, not where you're supposed to be. See if you can offer them the same thing. Just the assumption that something might be going on.",
      requires: [],
      prefers:  ["goodEnergy"]
    },
    // Prompt B — when: after a session where the user engaged with the check-in and the coach adjusted accordingly
    {
      text: "That person who seemed like they weren't trying, or weren't listening, or just seemed difficult — they have a check-in score too. You just don't get to see it. If you did, you might train them differently.",
      requires: [],
      prefers:  ["checkedInToday", "coachAdjusted"]
    },
    // Prompt C — when: after 35+ sessions, user well established in the practice
    {
      text: "Something to consider: every person you'll speak to today has arrived from somewhere this morning. Traffic. A difficult night. Something on their mind they haven't said. They're all carrying a check-in you haven't seen. What difference would it make to you if you just assumed that was true?",
      requires: ["minSessions:35"],
      prefers:  []
    },
    // Prompt D — when: after a session requiring persistence (high difficulty, completed despite low energy)
    {
      text: "The version of you who just moved through a hard session — what would it look like if that same steadiness showed up in a difficult conversation today? Not resolving it. Just meeting the other person without the need to fix or judge.",
      requires: [],
      prefers:  ["persisted"]
    },
    // Prompt E — when: after 40+ sessions, reflective tone appropriate for established users
    {
      text: "You just spent time paying close attention to yourself — what your body needed, how much, at what pace. That quality of attention is rare. Most people rush through the day without it. The people you'll meet today probably haven't had anyone pay that kind of attention to them. You know what it feels like to receive it.",
      requires: ["minSessions:40"],
      prefers:  []
    }
  ],

  // ── Stage 4: Structural Curiosity — Sessions 55-85 ───────────
  // The prompts move beyond individual situations to patterns. No
  // categories are named — the questions are about the invisible
  // weight of other lives.
  4: [
    // Prompt A — when: after a session following a period of personal difficulty (low check-in scores across multiple sessions)
    {
      text: "You've trained through days when you were running on almost nothing. Days when, from the outside, you might have looked fine, or difficult, or disengaged. If someone had judged you on those days without knowing what was underneath, they'd have been wrong about you. You know what it's like to be carrying something invisible. Most people do.",
      requires: [],
      prefers:  ["sustainedDifficulty"]
    },
    // Prompt B — when: after 60+ sessions, long history of variable effort and persistence
    {
      text: "Think about what it took for you to get here today. Not just this session — what it's taken across all of them. The planning. The adjusting. The days when it was harder than it looked. Now think about someone whose daily life requires that same level of adjustment just to be present in the world. What would that cost, over time?",
      requires: ["minSessions:60"],
      prefers:  ["variablePattern"]
    },
    // Prompt C — when: after any completed session, philosophical tone suits stage 4
    {
      text: "You know what it's like when the context changes and suddenly something that was hard becomes possible, or vice versa. A different environment, a different day, a different set of pressures. The same thing is true for everyone. The behaviour you see in someone isn't the whole truth about them — it's the truth about them in that context, on that day.",
      requires: [],
      prefers:  []
    },
    // Prompt D — when: after 70+ sessions, mature stage 4 prompt
    {
      text: "Here's a question worth sitting with today: what would you have become if your circumstances had been different? Not better or worse — just different. Different place, different early experiences, different things that were easy or hard for you. The answer isn't you being different. It's someone who is genuinely, interestingly other. That's true of everyone you meet.",
      requires: ["minSessions:70"],
      prefers:  []
    }
  ],

  // ── Stage 5: Full Transfer — Sessions 85+ ────────────────────
  // The user has already built the capacity. These prompts don't
  // teach — they hold up a mirror. Some are genuinely challenging.
  // They are earned.
  5: [
    // Prompt A — when: after 85+ sessions, acknowledges the journey explicitly
    {
      text: "You've been at this long enough to know that what people bring isn't always visible at first. Their effort, their intelligence, their care — it doesn't always show up in the obvious place. You've learned to look past what's on the surface. That's not a small thing. Most people never get there.",
      requires: ["minSessions:85"],
      prefers:  []
    },
    // Prompt B — when: after 90+ sessions, strong direct tone appropriate at this stage
    {
      text: "The things that make someone interesting — the particular way they've navigated difficulty, the things they know because of where they've been, the perspective that only exists because of what they've lived through — none of that is visible on first encounter. You know this. The question is what you do with knowing it.",
      requires: ["minSessions:90"],
      prefers:  []
    },
    // Prompt C — when: after a long continuous period of training (100+ sessions)
    {
      text: "Every person you've trained around has had days you didn't know about. Reasons for going slower, or going harder, or not being there. You've extended them the same courtesy the coach has extended you: you've just been present, without needing to know everything. That's what's changed in you. I want you to know I've noticed.",
      requires: ["minSessions:100"],
      prefers:  []
    },
    // Prompt D — when: after 95+ sessions, the hardest prompt in the library
    {
      text: "What would it mean to take the way you've been treating yourself here — the adjustments, the patience, the willingness to see what's actually happening rather than what should be happening — and offer that to someone whose life looks completely unlike yours? Not as charity. As recognition. That they're navigating something real, the same way you are.",
      requires: ["minSessions:95"],
      prefers:  []
    }
  ]

};

// ─────────────────────────────────────────────────────────────────────
// SELECTION (EMP-1)
//
// Two-part scoring, deliberately simple enough to reason about:
//
//   requires  every one must hold, or the prompt is out of the running
//   prefers   each one that holds adds a point; highest score wins
//
// "After any completed session, best when check-in energy was low"
// therefore becomes requires: [] and prefers: ["lowEnergy"] — always
// eligible, favoured when it genuinely fits. That distinction is what
// lets a catch-all exist without swallowing every session.
//
// MAX_RUN caps consecutive firings of the same prompt (Graeme, 12 Aug).
// ─────────────────────────────────────────────────────────────────────

export const MAX_RUN = 2;

// How far below the best score a prompt may sit and still share the
// rotation. Not zero, and the reason is worth stating: with exact ties
// only, a steady context freezes the band. A 200-session simulation of
// stage 3 in a neutral period fired 2 of its 5 prompts and never the
// other 3, because two of them each match one preference and the rest
// match none -- permanently.
//
// A tolerance of 1 means a STRONG fit still narrows the field (a
// two-preference match excludes everything scoring zero) while
// near-equals share the rotation. Fit leads; it does not monopolise.
export const TIE_TOLERANCE = 1;

// EMP-2. The session at which each stage may first be entered, taken
// verbatim from the stage headers below ("Sessions 1-12", "12-30",
// "30-55", "55-85", "85+"). Those ranges were written into this file
// from the start and nothing ever read them: stage advance counted
// FIRINGS only, so the two mechanisms drifted apart.
//
// A 140-session simulation showed the drift is not uniform. Stages 2-4
// arrive LATE against their own ranges (21 vs 12, 41 vs 30, 61 vs 55),
// which is harmless. Stage 5 arrives EARLY -- around session 77 against
// a documented 85 -- and that is the whole of the stage 5 bug: all four
// of its prompts gate at 85+ or higher, because the stage was designed
// to begin at 85. Somebody could sit in stage 5 for ten sessions with no
// qualifying prompt.
//
// The floor only ever DELAYS entry, never accelerates it, so stages 2-4
// are unaffected in practice -- they already arrive after their floor.
// One change, and it corrects only the case that is broken. No new
// prompt content required.
export const STAGE_SESSION_FLOOR = { 1: 0, 2: 12, 3: 30, 4: 55, 5: 85 };

/**
 * May this person enter the next stage yet? Firing count is necessary
 * but not sufficient -- the stage's own documented session range has to
 * have been reached too.
 */
export function canEnterStage(stageNum, sessionCount) {
  return sessionCount >= (STAGE_SESSION_FLOOR[stageNum] ?? 0);
}

/**
 * Does a single condition hold for this session?
 *
 * The context object is built by reflect.js, which is the only place
 * that has all of it — the reflect answers exist only in that module
 * until they are saved.
 */
function conditionHolds(cond, ctx) {
  if (cond.startsWith("minSessions:")) {
    return ctx.sessionCount >= parseInt(cond.split(":")[1], 10);
  }
  // E1, 13 Aug 2026. "anyOf:a,b,c" — holds when at least one does.
  // Needed because requires[] is AND, and a prompt about difficulty
  // should fire when the day was hard OR the energy was low OR they
  // came back after a gap, not only when all three are true at once.
  if (cond.startsWith("anyOf:")) {
    return cond.slice(6).split(",").some(c => conditionHolds(c.trim(), ctx));
  }
  switch (cond) {
    // Today's answers — these lead, per the 12 Aug decision.
    case "struggled":           return ctx.struggled === true;
    case "persisted":           return ctx.struggled === true && ctx.lowEnergy === true;
    case "gentleSession":       return ctx.gentleSession === true;

    // Check-in, second.
    case "lowEnergy":           return ctx.lowEnergy === true;
    case "goodEnergy":          return ctx.lowEnergy === false && ctx.struggled === false;
    case "checkedInToday":      return ctx.checkedInToday === true;
    case "coachAdjusted":       return ctx.coachAdjusted === true;   // EMP-2

    // Patterns across sessions.
    case "returning":           return ctx.returning === true;
    case "sustainedDifficulty": return ctx.sustainedDifficulty === true;
    case "variablePattern":     return ctx.variablePattern === true;
    case "adjusting":           return ctx.adjusting === true;

    // Unknown tag: fail closed. A typo must never silently make a
    // prompt universally eligible.
    default:                    return false;
  }
}

function scorePrompt(prompt, ctx) {
  for (const r of prompt.requires || []) {
    if (!conditionHolds(r, ctx)) return null;   // out of the running
  }
  let score = 0;
  for (const p of prompt.prefers || []) {
    if (conditionHolds(p, ctx)) score += 1;
  }
  return score;
}

/**
 * Choose a prompt from a stage pool for this session.
 *
 * @param {number} stageNum
 * @param {Object} ctx      session context, built by reflect.js
 * @param {Object} last     store's empathyLastPrompt { stage, index, runLength }
 * @param {number} atStage  store's empathyPromptsAtStage — rotates between
 *                          equally-fitting prompts so the pool is actually
 *                          covered. See the tie-break note below.
 * @returns {{ stage, index, text, score, runLength, fellBack } | null}
 */
export function selectEmpathyPrompt(stageNum, ctx, last, atStage = 0) {
  const pool = EMPATHY_PROMPTS[stageNum] || EMPATHY_PROMPTS[1];

  const scored = pool
    .map((prompt, index) => ({ index, prompt, score: scorePrompt(prompt, ctx) }))
    .filter(e => e.score !== null);

  let fellBack = false;
  let candidates = scored;

  // Stage 5 has no catch-all (see NOTE 3). If every prompt is gated out
  // by a session threshold the person has not reached, take the one
  // closest to being earned rather than firing nothing — a silent screen
  // here reads as the coach having nothing to say.
  if (candidates.length === 0) {
    fellBack = true;
    const nearest = pool
      .map((prompt, index) => {
        const gate = (prompt.requires || []).find(r => r.startsWith("minSessions:"));
        return { index, prompt, threshold: gate ? parseInt(gate.split(":")[1], 10) : 0 };
      })
      .sort((a, b) => a.threshold - b.threshold)[0];
    if (!nearest) return null;
    candidates = [{ index: nearest.index, prompt: nearest.prompt, score: 0 }];
  }

  // Highest score wins.
  const isLast = e => last && last.stage === stageNum && last.index === e.index;
  candidates.sort((a, b) => b.score - a.score);

  // TIE-BREAK BY ROTATION -- and this is not a detail.
  //
  // A stable sort on score alone always hands back the lowest index, so
  // whenever nothing scores (which is most sessions -- the catch-alls all
  // score 0) the same prompt wins every time, the repeat cap bounces to
  // index 1, and the pair oscillates forever. A 140-session simulation
  // showed exactly that: stage 1 used prompts [0] and [1] and NEVER
  // reached [2] or [3]. That is worse than the rotation this replaced,
  // which at least visited all four. Every assertion still passed --
  // the fault was only visible by simulating a real arc.
  //
  // So among the top-scoring candidates, rotate on empathyPromptsAtStage,
  // the counter the old mechanic already used. Fit still decides WHICH
  // group of prompts is eligible; rotation decides between equals. No new
  // state, and coverage is restored.
  const topScore = candidates[0].score;
  const tied     = candidates.filter(e => e.score >= topScore - TIE_TOLERANCE);
  let chosen     = tied[atStage % tied.length];

  // Repeat cap. Only displaces the winner if there is somewhere to go —
  // a pool of one, or a single eligible prompt, keeps repeating rather
  // than falling to something that does not fit at all.
  if (isLast(chosen) && last.runLength >= MAX_RUN && candidates.length > 1) {
    chosen = tied.length > 1
      ? tied[(atStage + 1) % tied.length]
      : candidates.find(e => e.index !== chosen.index) || chosen;
  }

  const runLength = (last && last.stage === stageNum && last.index === chosen.index)
    ? (last.runLength || 0) + 1
    : 1;

  return {
    stage: stageNum,
    index: chosen.index,
    text: chosen.prompt.text,
    score: chosen.score,
    runLength,
    fellBack,
  };
}
