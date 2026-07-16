/**
 * data/empathy-transfer.js - Empathy Transfer Prompt Pool
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
    "You came in today and you did the work. That sounds simple. It isn't. There is a version of today where that didn't happen, and you chose differently. That choice is yours. It's worth knowing you have it.",
    // Prompt B — when: after a session where check-in energy was low (4 or below) and the session was completed
    "You moved through something difficult today. Not just the physical part — the part before it, where you decided to come. That decision happens quietly and it doesn't get logged anywhere. I noticed it.",
    // Prompt C — when: after 6+ completed sessions, when the user has shown a pattern of adjusting rather than skipping
    "The way you train tells me something. Not about your fitness — about how you meet difficulty. You don't avoid it. You adjust and continue. That's a particular kind of intelligence. I think you know that.",
    // Prompt D — when: after a particularly difficult session or a return after a longer gap
    "Something worth sitting with on the way home: the version of you that shows up here on hard days — what would you call that quality? Not the fitness part. The other part."
  ],

  // ── Stage 2: Relational Awareness — Sessions 12-30 ───────────
  // The capacity being built is now gently pointed toward the people
  // immediately around the user — partner, friend, colleague, family.
  // Not strangers yet.
  2: [
    // Prompt A — when: after any completed session, best when check-in energy was low
    "Think of someone in your life who is dealing with something hard right now. If they were training through it the way you just trained through today — tired, still here, still doing the work — what would you think of them?",
    // Prompt B — when: after a session where the coach made visible adjustments (noted in the rationale card)
    "The coach adjusts based on what's actually going on for you — not what should be going on, not what was planned. Is there someone in your life you could do that for today? Not a big gesture. Just noticing where they actually are.",
    // Prompt C — when: after a quiet session, a rest day, or a session where the user modified significantly
    "You just gave your body something it needed, not something it was told to do. That's a different kind of listening. I wonder if there's someone in your life who needs that kind of listening today — to be heard, not advised.",
    // Prompt D — when: after 20+ sessions, when a meaningful pattern of variable energy/completion is visible
    "Here's something I've noticed over time: the sessions that look like less from the outside often cost the most. The ones where you were tired, or in pain, or not feeling it. The people around you probably have days like that too. Days that look fine from the outside."
  ],

  // ── Stage 3: Situational Empathy — Sessions 30-55 ────────────
  // The frame widens to strangers — specific individuals in ordinary
  // situations, not groups or categories.
  3: [
    // Prompt A — when: after any completed session, strong energy for early stage 3
    "On the way home today, if someone cuts you up, or is short with you, or seems like they're not really present — you've just spent an hour meeting yourself where you actually are, not where you're supposed to be. See if you can offer them the same thing. Just the assumption that something might be going on.",
    // Prompt B — when: after a session where the user engaged with the check-in and the coach adjusted accordingly
    "That person who seemed like they weren't trying, or weren't listening, or just seemed difficult — they have a check-in score too. You just don't get to see it. If you did, you might train them differently.",
    // Prompt C — when: after 35+ sessions, user well established in the practice
    "Something to consider: every person you'll speak to today has arrived from somewhere this morning. Traffic. A difficult night. Something on their mind they haven't said. They're all carrying a check-in you haven't seen. What difference would it make to you if you just assumed that was true?",
    // Prompt D — when: after a session requiring persistence (high difficulty, completed despite low energy)
    "The version of you who just moved through a hard session — what would it look like if that same steadiness showed up in a difficult conversation today? Not resolving it. Just meeting the other person without the need to fix or judge.",
    // Prompt E — when: after 40+ sessions, reflective tone appropriate for established users
    "You just spent time paying close attention to yourself — what your body needed, how much, at what pace. That quality of attention is rare. Most people rush through the day without it. The people you'll meet today probably haven't had anyone pay that kind of attention to them. You know what it feels like to receive it."
  ],

  // ── Stage 4: Structural Curiosity — Sessions 55-85 ───────────
  // The prompts move beyond individual situations to patterns. No
  // categories are named — the questions are about the invisible
  // weight of other lives.
  4: [
    // Prompt A — when: after a session following a period of personal difficulty (low check-in scores across multiple sessions)
    "You've trained through days when you were running on almost nothing. Days when, from the outside, you might have looked fine, or difficult, or disengaged. If someone had judged you on those days without knowing what was underneath, they'd have been wrong about you. You know what it's like to be carrying something invisible. Most people do.",
    // Prompt B — when: after 60+ sessions, long history of variable effort and persistence
    "Think about what it took for you to get here today. Not just this session — what it's taken across all of them. The planning. The adjusting. The days when it was harder than it looked. Now think about someone whose daily life requires that same level of adjustment just to be present in the world. What would that cost, over time?",
    // Prompt C — when: after any completed session, philosophical tone suits stage 4
    "You know what it's like when the context changes and suddenly something that was hard becomes possible, or vice versa. A different environment, a different day, a different set of pressures. The same thing is true for everyone. The behaviour you see in someone isn't the whole truth about them — it's the truth about them in that context, on that day.",
    // Prompt D — when: after 70+ sessions, mature stage 4 prompt
    "Here's a question worth sitting with today: what would you have become if your circumstances had been different? Not better or worse — just different. Different place, different early experiences, different things that were easy or hard for you. The answer isn't you being different. It's someone who is genuinely, interestingly other. That's true of everyone you meet."
  ],

  // ── Stage 5: Full Transfer — Sessions 85+ ────────────────────
  // The user has already built the capacity. These prompts don't
  // teach — they hold up a mirror. Some are genuinely challenging.
  // They are earned.
  5: [
    // Prompt A — when: after 85+ sessions, acknowledges the journey explicitly
    "You've been at this long enough to know that what people bring isn't always visible at first. Their effort, their intelligence, their care — it doesn't always show up in the obvious place. You've learned to look past what's on the surface. That's not a small thing. Most people never get there.",
    // Prompt B — when: after 90+ sessions, strong direct tone appropriate at this stage
    "The things that make someone interesting — the particular way they've navigated difficulty, the things they know because of where they've been, the perspective that only exists because of what they've lived through — none of that is visible on first encounter. You know this. The question is what you do with knowing it.",
    // Prompt C — when: after a long continuous period of training (100+ sessions)
    "Every person you've trained around has had days you didn't know about. Reasons for going slower, or going harder, or not being there. You've extended them the same courtesy the coach has extended you: you've just been present, without needing to know everything. That's what's changed in you. I want you to know I've noticed.",
    // Prompt D — when: after 95+ sessions, the hardest prompt in the library
    "What would it mean to take the way you've been treating yourself here — the adjustments, the patience, the willingness to see what's actually happening rather than what should be happening — and offer that to someone whose life looks completely unlike yours? Not as charity. As recognition. That they're navigating something real, the same way you are."
  ]

};
