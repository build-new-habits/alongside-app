/**
 * js/data/checkin-openings.js
 * 15 Aug 2026 v5
 *
 * v5 - STREAK-1. The seven-check-in milestone claimed "Seven days in a
 *   row" on a COUNT, not consecutive days, stored a key called `streak-7`
 *   in a product that promises no streaks, and said "Seven" at fourteen
 *   and twenty-one too. Now count-based, honest, and dynamic.
 *
 * 14 Aug 2026 v4
 *
 * v4 - OPEN-1. Three day-one openings could never fire. `else if (ageBand)`
 *   sat above injury-recovery, return-to-fitness and feel-good, and
 *   ageBand is asked of everyone, so it always won. Generic fallback moved
 *   last. return-to-fitness repointed from lifestyle.exerciseHistory
 *   (writer deleted) to lifestyle.activityLevel === 'returning'.
 *
 * 11 Aug 2026 v3
 *
 * v3 — PT-1 (Persona Tracing Wave 1). _resolveDayOne()'s territory branch
 *   matched against IDs that have never existed anywhere in this codebase,
 *   so it always fell through to 'generic'. A user who selected "There's a
 *   longer history than any of that" was answered with "No history yet."
 *   Remapped to the seven live IDs; five given purpose-written rows rather
 *   than approximated onto near-misses; age-band values corrected too.
 *   See the note at the trigger map for the full reasoning.
 *
 * 14 Jul 2026 v2
 *
 * v2 — Privacy rule fix (Session B2 finding, 14 Jul 2026, companion to
 *   journal-entry.js v3). _detectMilestone() read journalEntries directly
 *   and used hasProgressSignal (written by journal-entry.js v2) to select
 *   the 'journal-progress' Mode 5 opening — a coach line that speaks
 *   directly from journal content ("Something you wrote recently has
 *   stayed with me..."). Unlike checkin.js's feeling-word signal
 *   detection, which is documented dormant, this one fired live on every
 *   check-in via resolveOpening() — an active violation of the Journal
 *   Privacy Rule (master schedule Appendix D), not a theoretical one.
 *   The companion 'journal-struggle' branch checked e.signalWord, a field
 *   journal-entry.js never actually wrote at any version — that half was
 *   already permanently dead, unrelated to this fix.
 *   Removed: the entire journal-signal block from _detectMilestone(),
 *   the now-unused journalEntries parameter and argument, and the
 *   now-unused `const journalEntries = store.get('journalEntries')`
 *   read in resolveOpening(). Removed the 'journal-progress' and
 *   'journal-struggle' entries from the PROGRESS data object — they can
 *   no longer be triggered by anything and existed solely to serve the
 *   logic just removed; leaving them in place as dead data referencing
 *   journal content risked a future session re-wiring them without
 *   realising why they'd been disconnected.
 *   NOT touched this pass (already-dead before this fix, unrelated,
 *   flagged for a future cleanup session): PROGRESS still contains
 *   'return-journal', 'tone-shift', and 'difficult-feeling' entries that
 *   were never wired to any trigger in _detectMilestone() at any point —
 *   spec'd content that was never built out, not a privacy issue.
 *
 * v1 — 01 Jul 2026. D2: Check-in Opening Narratives — data and resolver.
 *   Six modes + Day One exception. Nurturing voice throughout.
 *   Source: alongside_d2_checkin_openings_30jun2026_v4.md
 *
 * Usage:
 *   import { resolveOpening } from '../data/checkin-openings.js';
 *   const { b1, b2, mode, careMode } = resolveOpening();
 *
 * resolveOpening() reads from store and returns the selected opening.
 * Caller shows B1 as a coach bubble, then (after typing indicator) B2.
 * b2 is null for Mode 6 Simple Arrival single-bubble variants.
 * careMode: true flags to the builder that the user's response may need
 * routing to care-mode, not standard check-in flow.
 */

import { store } from '../store.js';

// ─── Mode 1 — The Reflection ──────────────────────────────────────────────────
// Requires 3+ days history. Never fires on consecutive days.

const REFLECTION_VARIANTS = [
  { id: 'positive-week',        careMode: false,
    b1: "Have you noticed you moved three times last week — and you said you felt good after each one?",
    b2: "I'm curious if today has the same feel to it, or if something's shifted." },
  { id: 'mixed-mood-week',      careMode: false,
    b1: "You moved four times last week — and your mood fluctuated afterwards. Sometimes up, sometimes not.",
    b2: "I want to understand where today starts before I suggest anything." },
  { id: 'better-than-expected', careMode: false,
    b1: "Last time you said you felt better than you expected. I logged that.",
    b2: "I want to know if today's starting from the same place, or somewhere different." },
  { id: 'worse-than-expected',  careMode: true,
    b1: "You told me last session didn't feel great afterwards.",
    b2: "I'm not going to assume today's the same. How are you feeling going in?" },
  { id: 'energy-declining',     careMode: true,
    b1: "Recently, I've noticed your energy's been dropping a little each check-in.",
    b2: "I just wanted to check in with you — how are you feeling today?" },
  { id: 'energy-improving',     careMode: false,
    b1: "Recently, I've noticed your energy's been climbing — slowly, but it has been.",
    b2: "I'm curious if that's still holding today." },
  { id: 'mood-improving-flat',  careMode: false,
    b1: "I've noticed your mood's been a little better each check-in, even when the energy hasn't followed.",
    b2: "I want to check in on that before we figure out today." },
  { id: 'morning-pattern',      careMode: false,
    b1: "Have you noticed that you nearly always come to this in the mornings? I like that habit.",
    b2: "I'm curious how this particular morning is sitting." },
  { id: 'session-adjusted',     careMode: false,
    b1: "Last time you did less than planned, but you finished. You didn't quit — you adjusted.",
    b2: "That stuck with me. I'm curious how today's arriving." },
  { id: 'low-in-better-out',    careMode: false,
    b1: "Last time you said you weren't sure you wanted to start — but you did, and you felt better after.",
    b2: "I'm curious if today feels similar going in." },
  { id: 'active-quiet-pattern', careMode: true,
    b1: "Have you noticed a pattern where you move well for a while, then there's a quieter period?",
    b2: "Is that pattern deliberate, or are there reasons you want to share?" },
  { id: 'feeling-word-carry',   careMode: true, requiresField: 'lastFeelingWord',
    b1: "Last time you said you were feeling {lastFeelingWord}. I've been holding onto that.",
    b2: "I want to know if that's still around, or if something's shifted." },
  { id: 'steady-improvement',   careMode: false,
    b1: "Have you noticed the last couple of weeks have looked different from the weeks before? More settled.",
    b2: "I want to understand what today feels like from inside that." },
  { id: 'low-energy-moved',     careMode: false,
    b1: "Last time you came in low and moved anyway. That's not a small thing.",
    b2: "I want to know how today's arriving." },
  { id: 'better-after-pattern', careMode: false,
    b1: "Have you noticed you keep feeling better after sessions than you expected going in?",
    b2: "I'm curious if today feels like one of those days." },
  { id: 'high-energy-last',     careMode: false,
    b1: "You came in with a lot of energy last time. I hope some of that's still with you.",
    b2: "How are you feeling today?" },
  { id: 'mood-declining',       careMode: true,
    b1: "I've noticed your energy's been fairly steady, but your mood has been a little lower recently.",
    b2: "I just wanted to check in — how are you doing today, honestly?" },
];

// ─── Mode 2 — The Real World ──────────────────────────────────────────────────
// Keyed by context string. Resolver picks most specific match.

const REAL_WORLD = {
  early_morning:    { b1: "You're here early. The day hasn't quite started.",                   b2: "I want to know what this morning actually feels like." },
  late_evening:     { b1: "It's late, and you're here.",                                        b2: "Tell me where you are." },
  monday_morning:   { b1: "Monday.",                                                             b2: "I'm curious what yours looks like from here — before the day gets going." },
  monday_evening:   { b1: "Monday evening. The day's already had a go at you.",                 b2: "I want to know what's left, honestly." },
  wednesday_any:    { b1: "Middle of the week.",                                                 b2: "I'm curious whether you're riding it or just getting through it." },
  thursday_evening: { b1: "Nearly Friday. You can see it from here.",                           b2: "How are you doing?" },
  friday_morning:   { b1: "Friday. Nearly there.",                                              b2: "I want to know how the week's sitting before we figure out today." },
  friday_evening:   { b1: "Friday evening. The week's done.",                                   b2: "I'm curious if you've got something left, or if today needs to be something quieter." },
  saturday_morning: { b1: "Saturday. No alarm, hopefully.",                                     b2: "I want to know what you actually want from today — not what you think you should want." },
  saturday_evening: { b1: "Saturday evening. The day's been whatever it's been.",               b2: "I'm curious where you're landing." },
  sunday_morning:   { b1: "Sunday morning. The week hasn't started yet.",                       b2: "I want to know how you're meeting it." },
  sunday_evening:   { b1: "Sunday evening. Tomorrow's already in the room a little.",           b2: "I'm curious where your head is." },
  january:          { b1: "January has a particular weight to it. Everyone's pretending it doesn't.", b2: "I'm curious how it's sitting with you." },
  february:         { b1: "February. The light's still short.",                                 b2: "I want to know how you're doing with it." },
  march:            { b1: "The light's starting to come back. Not much, but it is.",            b2: "I'm curious if you're feeling it." },
  april_may:        { b1: "Everything seems to be trying to start at once at this time of year.", b2: "I want to know how you're arriving today." },
  june_aug:         { b1: "It's warm. Maybe too warm.",                                         b2: "I want to know how your body's actually feeling in it." },
  september:        { b1: "September. Things are starting up again.",                           b2: "I'm curious how that sits." },
  oct_nov:          { b1: "The evenings are pulling in again.",                                  b2: "I want to check in on how you're doing with that." },
  december:         { b1: "December. Everything asks more of you.",                             b2: "I want to know how you actually are — not the version you tell other people." },
};

// ─── Mode 3 — The Humanistic ──────────────────────────────────────────────────
// No data required. Every line true regardless of recent experience.

const HUMANISTIC = [
  { b1: "You don't have to feel ready to start.",                                               b2: "I'd just rather know honestly where you are than have you perform readiness." },
  { b1: "Some days the body's willing and the mind isn't. Some days it's the other way round.", b2: "Neither's wrong. I just want to know which is true today." },
  { b1: "There's a version of this that's easier than you think it's going to be.",            b2: "I don't know if that's true for today. Let's find out." },
  { b1: "You're here. That's already a decision you made.",                                     b2: "I'm curious what brought you." },
  { b1: "Most people find the starting harder than the doing.",                                 b2: "I'm curious where you are with that right now." },
  { b1: "Showing up and feeling ready aren't the same thing. You only need to do one of them.", b2: "How are you doing today?" },
  { b1: "There's something kind about making this kind of time for yourself.",                  b2: "I want to know what today needs from it." },
];

// ─── Mode 4 — The Imaginary ───────────────────────────────────────────────────
// Never fires on consecutive days.

const IMAGINARY = [
  { b1: "Imagine setting everything down for the next hour. Not solving it, not fixing it — just setting it down.", b2: "That's what this is for. Let's find out what's left when you do." },
  { b1: "There's a version of the next hour that's the easiest part of your day.",             b2: "I want to help you find it. First I need to know where you're starting." },
  { b1: "If today had a colour right now — not what you'd want, what it actually is — what would it be?", b2: "Hold that. Let's check in properly." },
  { b1: "Picture the bit after — when this is done and you're back in your day.",              b2: "I want to help you get there. Tell me where you're starting from." },
  { b1: "Somewhere in the next hour there's a quieter version of you. A little less of whatever you walked in with.", b2: "I'm curious what you walked in with." },
  { b1: "Think of this as a door in the middle of the day. You've just stepped through it.",   b2: "I want to know how you're arriving." },
  { b1: "If your body could say one thing to you right now — before we even start — what do you think it would be?", b2: "Hold onto that. It's usually telling the truth." },
  { b1: "Imagine the version of you who's already done this today. Already moved, already back in the day.", b2: "What do you think she needed to get there? Let's start there." },
  { b1: "What if the only thing this hour had to do was feel a bit different from the one before it?", b2: "I'm curious what that would take today." },
  { b1: "There's a particular kind of quiet that comes about ten minutes into movement. You've felt it before.", b2: "I want to help you get there. Where are you starting from?" },
  { b1: "If today was a room, what would it look like right now? Busy, quiet, cluttered, empty?", b2: "I'm curious. Tell me." },
  { b1: "Sometimes the most useful thing this hour can do is just be yours. No one else's claim on it.", b2: "How does it feel to have it?" },
  { b1: "Picture setting your phone down, the to-do list down, whatever's waiting — just for this.", b2: "What's left when you do that? That's where we're starting." },
  { b1: "You know that feeling when you finish and think — I'm glad I did that? We're going towards that.", b2: "I just want to know where we're starting from." },
];

// ─── Mode 5 — Journal / Progress Reframe ─────────────────────────────────────
// Triggered only — milestones. Journal-content-derived triggers removed
// in v2 (see header) — journal entries are never read by this file.

const PROGRESS = {
  // ── STREAK-1, 15 Aug 2026 ──────────────────────────────────────────────
  //
  // This entry read: "Seven days in a row. Movement, noticing, or both —
  // seven." Three separate faults, found by the moment-of-delight audit.
  //
  // 1. IT WAS NOT TRUE. The trigger is totalCheckins % 7, a COUNT of
  //    check-ins, not consecutive days. Traced: seven check-ins spread
  //    across 102 days, longest run one day, and the coach said "Seven
  //    days in a row." P4 is Locked — the coach displays, it does not
  //    interpret — and this interpreted, wrongly.
  //
  // 2. IT WAS A STREAK, in a product whose first non-negotiable is "no
  //    streaks, no shame, no comparison architecture". The stored key was
  //    literally `streak-7`. And Settings promises the person in writing:
  //    "No streaks. No punishment for absence." So the app made a promise
  //    on one screen and broke it on another. Persona 2.5 selected
  //    'escalation-trap' — being told you are on a run is precisely the
  //    pressure she named, and the loss when it ends is the shame.
  //
  // 3. THE NUMBER WAS WRONG AFTER THE FIRST ONE. The trigger fires at 7,
  //    14, 21 and so on; the copy said "Seven" every time.
  //
  // Now honest, count-based, and it says out loud that we do not count
  // consecutive days — which is a thing worth saying to somebody who has
  // been punished by every other app for missing a Tuesday. {n} is
  // substituted with the real count.
  //
  // The other consecutive-days reader, coach-reflection.js:253, is
  // deliberately left alone. It notices three sessions in a row in order
  // to suggest VARYING or going lighter — load management, not reward.
  // That is the opposite mechanic and it is correct.
  'checkin-count':      { careMode: false, b1: "That's {n} check-ins now. Not in a row — I don't count that way.", b2: "I want to know how that feels from the inside, not just as a number." },
  'four-week':          { careMode: false, b1: "Four weeks. That's actually a long time to keep showing up.",        b2: "I'm curious what feels different now compared to when you started." },
  'eight-week':         { careMode: false, b1: "Eight weeks. I've watched this change shape — not in a straight line, but it's changed.", b2: "I want to understand how today fits into that." },
  'twelve-week':        { careMode: false, b1: "Twelve weeks. That's a whole chapter.",                              b2: "I'm not going to let you check in without knowing you know that." },
  'three-month':        { careMode: false, b1: "Three months. That is worth stopping on for a second.",            b2: "What do you think has actually changed?" },
  'phase-transition':   { careMode: false, b1: "You've moved into a new phase. That doesn't happen automatically — you did something to get here.", b2: "I want to know how today feels with that behind you." },
  'visible-progress':   { careMode: false, b1: "Have you looked at how far you've come since you started? I have.",                          b2: "I want to know how today feels, knowing that." },
  'programme-complete': { careMode: false, b1: "You finished a whole programme. That's not something everyone does.",                         b2: "I'm curious how it feels to be starting something new." },
  'personal-best-long': { careMode: false, b1: "That was your longest session yet. I noticed.",                                              b2: "How do you feel about that?" },
  'personal-best-week': { careMode: false, b1: "Last week was your most active week since you started. Have you noticed that?",              b2: "I want to know how today feels coming off the back of it." },
  'return-positive':    { careMode: true,  b1: "Before you went quiet, things were sounding good. I held onto that.",                       b2: "I want to know how you're coming back — whether that's still true, or something happened." },
  'mood-lift-pattern':  { careMode: false, b1: "For the last few weeks, you've been finishing sessions feeling better than you started.",    b2: "Have you noticed that about yourself?" },
  'noticing-and-move':  { careMode: false, b1: "This week you moved and you noticed. Both. That combination matters more than either one alone.", b2: "I'm curious how you're feeling about that." },
};

// ─── Mode 6 — Simple Arrival ──────────────────────────────────────────────────
// One bubble only (b2: null) — except abandoned-opens variants.
// All care-mode adjacent by design.

const ARRIVAL_LOW = [
  { b1: "Hey. Glad you're here.",                                           b2: null },
  { b1: "You're here. That's the whole thing today.",                       b2: null },
  { b1: "Hey. No pressure on this one. I just want to know how you are.",  b2: null },
  { b1: "Hello. I'm glad you came.",                                        b2: null },
  { b1: "Hey. Today doesn't have to be anything. I just want to be here with you.", b2: null },
  { b1: "You showed up. That's all I needed.",                              b2: null },
];

const ARRIVAL_RETURN = [
  { b1: "Hey. Nice to see you. There's no expectation — but if you want to tell me why you've been away, I'm ready to listen.", b2: null },
  { b1: "You came back. Whatever brought you here, it was enough.",         b2: null },
  { b1: "No need to explain anything. I'm just glad you're here.",         b2: null },
  { b1: "Hey. It's good to see you. Whenever you're ready, let's just start from where you are today.", b2: null },
  { b1: "I noticed you'd been away. I'm not going to make a thing of it — I'm just glad you came back.", b2: null },
  { b1: "Hey. Life gets in the way sometimes. You're here now, and that's what matters.", b2: null },
];

const ARRIVAL_ABANDONED = [
  // Two bubbles — abandoned-opens trigger only.
  // Note: requires store.checkin.abandonedOpens (not yet in schema v7).
  // Tracked in care-mode spec (Appendix I). These variants are defined
  // but not yet reachable until the schema field is added.
  { b1: "You've opened this a couple of times without checking in. I noticed.",        b2: "No pressure at all — but if something's getting in the way, I'd like to know." },
  { b1: "You've been here a couple of times but haven't checked in yet.",              b2: "That's okay. I'm just wondering — is there something making it hard to start?" },
];

// ─── Day One Exception ────────────────────────────────────────────────────────
// No historic data. Coach draws on onboarding fields.
// "Do you remember telling me during onboarding that...?"

const DAY_ONE = [
  { trigger: 'movement-pain',      careMode: true,  b1: "Do you remember telling me during onboarding that movement has sometimes hurt — physically?",  b2: "I was wondering how you feel about that now, before your very first session." },
  { trigger: 'self-consciousness', careMode: false, b1: "Do you remember telling me that being around other people when you exercise has felt hard?",    b2: "You're here now, on your own terms. I was wondering how that feels going into your first one." },
  { trigger: 'motivation',         careMode: false, b1: "Do you remember telling me that getting started — actually starting — has been the hardest part?", b2: "You've just done that. I was wondering what it feels like to be on this side of it." },
  { trigger: 'time-energy',        careMode: false, b1: "Do you remember saying that finding time and energy has been the thing that keeps getting in the way?", b2: "I was wondering — right now, today, how is that feeling?" },
  { trigger: 'not-knowing',        careMode: false, b1: "Do you remember telling me that not knowing what to do has made it hard to start?",             b2: "That's what I'm here for. I was wondering how it feels to have someone take that off your plate." },
  { trigger: 'judged',             careMode: false, b1: "Do you remember telling me that fitness has sometimes felt like a place where you don't quite belong?", b2: "I was wondering how you're feeling now, before your first session — just you and me." },
  { trigger: 'past-failure',       careMode: false, b1: "Do you remember telling me that you've tried to build this before and it hasn't stuck?",        b2: "I want to ask — what feels different this time, if anything?" },
  { trigger: 'feel-good',          careMode: false, b1: "Do you remember telling me that feeling good in your body is what matters most to you?",        b2: "I was wondering — what does feeling good actually look like for you? Not in general. Today." },
  { trigger: 'return-to-fitness',  careMode: false, b1: "Do you remember telling me you're coming back to this after some time away?",                   b2: "I was wondering how it feels to be standing at that starting line again." },
  { trigger: 'injury-recovery',    careMode: true,  b1: "Do you remember telling me your body's been through something and you're rebuilding?",          b2: "I'm holding that. I was wondering how you're feeling about starting today." },
  { trigger: 'chronic-condition',  careMode: true,  b1: "Do you remember telling me about what your body's been dealing with? I haven't forgotten.",    b2: "I was wondering — how is it today, going into your first session?" },
  // 11 Aug 2026 (PT-1 follow-up) — was 'hormonal-change', age-gated, and
  // phrased "Do you remember telling me..." for something the person had
  // never told us: it fired on an inference from ageBand alone, so the coach
  // claimed a disclosure that never happened. Two faults, one fix.
  // Reframed to be true of anyone — a 22-year-old whose knee went, a new
  // mother, someone in perimenopause, someone who can't play football any
  // more — and written as an observation rather than a recollection, so it
  // makes no claim about what was said and no guess about why.
  { trigger: 'changing-body',      careMode: true,  b1: "Bodies change. Sometimes faster than we expect, and rarely at a convenient moment.",             b2: "I don't know what your body's been through lately, and I'm not going to guess. I was wondering what today feels like." },
  { trigger: 'long-absence',       careMode: false, b1: "Do you remember telling me it's been a while since you moved regularly?",                       b2: "I want you to know — there's no catching up needed. I was wondering how it feels to begin again." },

  // ── Territory rows (11 Aug 2026, PT-1) ──────────────────────────────────
  // Five of the seven live territories had no row that fit. Mapping them onto
  // the nearest existing trigger would have changed what the coach is saying:
  // 'past-failure' ("you've tried before and it hasn't stuck") puts the
  // failure on the person, which is the opposite of what someone selecting
  // 'trust-rupture' ("I started things and they let me down") just told us.
  // Written new rather than approximated. Voice matches the rows above:
  // b1 reflects back, b2 opens a question and never makes a statement.
  { trigger: 'trust-rupture',      careMode: false, b1: "Do you remember telling me that you've started things before and they let you down?",           b2: "I don't take that lightly. I was wondering what it's like standing at the start of another one." },
  { trigger: 'escalation-trap',    careMode: false, b1: "Do you remember telling me that last time it moved too fast, too soon?",                        b2: "I was wondering what a pace that actually worked would feel like — you'd know better than I would." },
  { trigger: 'invisible-person',   careMode: false, b1: "Do you remember telling me you never felt like it knew you were there?",                        b2: "I know you're here. I was wondering how you're doing today — actually." },
  { trigger: 'body-story',         careMode: true,  b1: "Do you remember telling me your relationship with your body has made this complicated?",        b2: "I'm not going to ask you to explain it. I was wondering how today feels, going into your first session." },
  { trigger: 'the-history',        careMode: true,  b1: "Do you remember telling me there's a longer history here than any of the rest of it?",          b2: "None of that needs going into today. I was wondering how you feel, standing here before the first one." },

  { trigger: 'generic',            careMode: false, b1: "This is the first real one.",                                                                   b2: "No history yet — just you, now. How are you today?" },
];

// ─── Resolver ─────────────────────────────────────────────────────────────────

/**
 * Resolve which opening to show.
 * Reads from store. Returns { b1, b2, mode, careMode }.
 * b2 is null for single-bubble Simple Arrival openings.
 */
export function resolveOpening() {
  const checkinHistory  = store.get('checkinHistory') || {};
  const historyKeys     = Object.keys(checkinHistory).sort();
  const totalCheckins   = historyKeys.length;
  const lastOpeningMode = store.get('checkin.lastOpeningMode');

  // ── Day One (no history yet) ───────────────────────────────────────────────
  if (totalCheckins === 0) {
    return _resolveDayOne();
  }

  // ── Gap days ───────────────────────────────────────────────────────────────
  const gapDays    = _gapDays(historyKeys);
  const lastEnergy = _recentField(checkinHistory, historyKeys, 'energy');
  const lastMood   = _recentField(checkinHistory, historyKeys, 'mood');

  // ── Mode 6 — Simple Arrival (overrides all) ────────────────────────────────
  if (gapDays >= 7) {
    return _pick(ARRIVAL_RETURN, 'simple-arrival', true);
  }
  if (lastEnergy !== null && lastMood !== null && lastEnergy <= 3 && lastMood <= 3) {
    return _pick(ARRIVAL_LOW, 'simple-arrival', true);
  }
  // Note: abandoned-opens trigger requires store.checkin.abandonedOpens
  // (not in schema v7). See ARRIVAL_ABANDONED above. Add once schema updated.

  // ── Mode 5 — Milestone (overrides base modes) ─────────────────────────────
  const milestone = _detectMilestone(totalCheckins, historyKeys);
  if (milestone && PROGRESS[milestone]) {
    _writeMode('progress');
    const v = PROGRESS[milestone];
    // STREAK-1. {n} is the real check-in count. Hardcoding "Seven" meant
    // the fourteenth and twenty-first also said seven.
    const sub = s => String(s || '').replace('{n}', totalCheckins);
    return { b1: sub(v.b1), b2: sub(v.b2), mode: 'progress', careMode: v.careMode };
  }

  // ── Base modes — weighted selection ────────────────────────────────────────
  const canReflect = totalCheckins >= 3 && lastOpeningMode !== 'reflection';
  const canImagine = lastOpeningMode !== 'imaginary';

  const pool = [];
  if (canReflect) pool.push({ mode: 'reflection', weight: 3 });
  pool.push(       { mode: 'real-world',  weight: 3 });
  pool.push(       { mode: 'humanistic',  weight: 2 });
  if (canImagine) pool.push({ mode: 'imaginary',   weight: 1 });

  const total = pool.reduce((s, e) => s + e.weight, 0);
  let   roll  = Math.random() * total;
  let   chosen = pool[pool.length - 1].mode;
  for (const e of pool) { roll -= e.weight; if (roll <= 0) { chosen = e.mode; break; } }

  _writeMode(chosen);

  switch (chosen) {
    case 'reflection': return _resolveReflection(checkinHistory, historyKeys);
    case 'real-world': return _resolveRealWorld();
    case 'imaginary':  return _resolveImaginary();
    default:           return _resolveHumanistic();
  }
}

// ─── Mode resolvers ───────────────────────────────────────────────────────────

function _resolveDayOne() {
  _writeMode('day-one');
  const primaryT  = store.get('onboarding.primaryTerritory');
  const conditions = store.get('conditions') || [];
  const ageBand   = store.get('ageBand');
  const lifestyle = store.get('lifestyle') || {};
  const goals     = store.get('goals') || [];

  // ── PT-1 FIX, 11 Aug 2026 ────────────────────────────────────────────────
  // This map previously tested for 'pain', 'motivation', 'history',
  // 'past-attempts' and similar. NONE of those IDs has ever existed. The
  // live territory IDs come from HARD_BEFORE_CHIPS in onboarding-thread-
  // data.js, and the retired hard-before.js used the SAME seven before it —
  // so this branch never matched, at any point in the product's life. Every
  // user who has ever completed onboarding fell through to 'generic' and was
  // told "No history yet — just you, now", including the people who had just
  // selected "There's a longer history than any of that."
  //
  // Confirmed by executing this function against all seven live IDs.
  // Five now have purpose-written rows; two map to existing rows where the
  // fit is genuine rather than approximate:
  //   life-interruption -> time-energy  ("the thing that keeps getting in
  //                                       the way" is the same sentiment)
  //   wrong-fit         -> judged       ("a place where you don't quite
  //                                       belong" is the same sentiment)
  let trigger = 'generic';
  if      (primaryT === 'trust-rupture')     trigger = 'trust-rupture';
  else if (primaryT === 'escalation-trap')   trigger = 'escalation-trap';
  else if (primaryT === 'life-interruption') trigger = 'time-energy';
  else if (primaryT === 'wrong-fit')         trigger = 'judged';
  else if (primaryT === 'invisible-person')  trigger = 'invisible-person';
  else if (primaryT === 'body-story')        trigger = 'body-story';
  else if (primaryT === 'the-history')       trigger = 'the-history';
  else if (conditions.length > 0)            trigger = 'chronic-condition';
  // Age bands were also wrong: this tested '45-54'/'55-64'/'65+' against
  // AGE_CHIPS values of under-20/20s/30s/40s/50s/60s/70plus, so
  // 'hormonal-change' had never fired either. Corrected to live values.
  // Graeme's point, 11 Aug: bodies change at every age and for a hundred
  // reasons, so gating this to the over-50s was both an assumption and too
  // narrow. With the line reframed (see 'changing-body' above) it is safe
  // for anyone, so it now fires for any known age band and sits just above
  // 'generic' — a warmer default than "No history yet" for someone who
  // named no territory and logged no condition.
  //
  // OPEN-1, 14 Aug 2026. Three branches below 'changing-body' could never
  // fire. ageBand is asked of everyone at step 6 and is therefore always
  // truthy, so `else if (ageBand)` swallowed injury-recovery,
  // return-to-fitness and feel-good outright -- three written, reviewed
  // coach openings that no user has ever seen. The comment above says
  // this line "sits just above 'generic'". It did not; it sat above four
  // more specific triggers.
  //
  // Reordered so the generic fallback is last, which is what it was
  // always described as. 'changing-body' is a warmer default than
  // 'generic', not a match.
  else if (lifestyle.returningAfter === 'injury' ||
           lifestyle.returningAfter === 'illness')       trigger = 'injury-recovery';
  // OPEN-1. Was lifestyle.exerciseHistory, whose only writer was the
  // deleted views/onboarding/lifestyle.js -- so this had no live input
  // even once the ordering was fixed. Reads lifestyle.activityLevel
  // instead, which the onboarding thread writes at step 9 and whose
  // 'returning' chip means exactly this.
  else if (lifestyle.activityLevel === 'returning')      trigger = 'return-to-fitness';
  else if (goals.includes('feel-good'))                  trigger = 'feel-good';
  else if (ageBand)                                      trigger = 'changing-body';

  const v = DAY_ONE.find(d => d.trigger === trigger) || DAY_ONE.find(d => d.trigger === 'generic');
  return { b1: v.b1, b2: v.b2, mode: 'day-one', careMode: v.careMode };
}

function _resolveReflection(checkinHistory, historyKeys) {
  const last3 = historyKeys.slice(-3).map(k => checkinHistory[k]);

  // Priority-ordered matching
  const feelingWord = store.get('lastCheckin.feelingWord');
  if (feelingWord) return _reflectionV('feeling-word-carry', { lastFeelingWord: feelingWord });

  if (_energyTrend(last3) === 'declining')       return _reflectionV('energy-declining');
  if (_moodDecliningEnergyStable(last3))          return _reflectionV('mood-declining');
  if (_hasActiveQuietPattern(historyKeys, checkinHistory)) return _reflectionV('active-quiet-pattern');
  if (_betterAfterPattern(last3))                 return _reflectionV('better-after-pattern');

  const prev         = last3.length >= 2 ? last3[last3.length - 2] : null;
  if (prev?.energy <= 4 && prev?.moodAfter >= 6) return _reflectionV('low-in-better-out');

  const lastMoodAfter = _recentField(checkinHistory, historyKeys, 'moodAfter');
  const lastEnergy    = _recentField(checkinHistory, historyKeys, 'energy');
  if (lastMoodAfter !== null && lastMoodAfter <= 3) return _reflectionV('worse-than-expected');
  if (lastEnergy !== null && lastEnergy <= 3 && lastMoodAfter >= 5) return _reflectionV('low-energy-moved');
  if (lastEnergy !== null && lastEnergy >= 8)      return _reflectionV('high-energy-last');
  if (_energyTrend(last3) === 'improving')         return _reflectionV('energy-improving');
  if (_moodImprovingEnergyFlat(last3))             return _reflectionV('mood-improving-flat');

  const last14 = historyKeys.slice(-14).map(k => checkinHistory[k]);
  if (_steadyImprovement(last14))                  return _reflectionV('steady-improvement');

  const lastWeekCount = _countLastWeek(historyKeys);
  if (lastWeekCount >= 3) {
    const moods      = _lastWeekMoods(historyKeys, checkinHistory);
    const allPositive = moods.every(m => m >= 6);
    return _reflectionV(allPositive ? 'positive-week' : 'mixed-mood-week');
  }

  // Day-of-week rotation fallback
  const fallbacks = ['better-than-expected','session-adjusted','steady-improvement','positive-week','morning-pattern','mixed-mood-week','energy-improving'];
  return _reflectionV(fallbacks[new Date().getDay() % fallbacks.length]);
}

function _reflectionV(id, replacements = {}) {
  let v = REFLECTION_VARIANTS.find(r => r.id === id) || REFLECTION_VARIANTS[0];
  let b1 = v.b1;
  let b2 = v.b2;
  for (const [key, val] of Object.entries(replacements)) {
    b1 = b1.replace(`{${key}}`, val);
    if (b2) b2 = b2.replace(`{${key}}`, val);
  }
  return { b1, b2, mode: 'reflection', careMode: v.careMode };
}

function _resolveRealWorld() {
  const now   = new Date();
  const hour  = now.getHours();
  const day   = now.getDay();   // 0 = Sun
  const month = now.getMonth(); // 0 = Jan

  if (hour < 7)   return _rw('early_morning');
  if (hour >= 21) return _rw('late_evening');

  const isAM = hour < 12;
  const isPM = hour >= 17;

  if (day === 1 && isAM) return _rw('monday_morning');
  if (day === 1 && isPM) return _rw('monday_evening');
  if (day === 3)         return _rw('wednesday_any');
  if (day === 4 && isPM) return _rw('thursday_evening');
  if (day === 5 && isAM) return _rw('friday_morning');
  if (day === 5 && isPM) return _rw('friday_evening');
  if (day === 6 && isAM) return _rw('saturday_morning');
  if (day === 6 && isPM) return _rw('saturday_evening');
  if (day === 0 && isAM) return _rw('sunday_morning');
  if (day === 0 && isPM) return _rw('sunday_evening');

  // Month fallback
  const months = ['january','february','march','april_may','april_may','june_aug','june_aug','june_aug','september','oct_nov','oct_nov','december'];
  return _rw(months[month]);
}

function _rw(key) {
  const v = REAL_WORLD[key] || REAL_WORLD['september'];
  return { b1: v.b1, b2: v.b2, mode: 'real-world', careMode: false };
}

function _resolveHumanistic() {
  const history = store.get('checkin.openingModeHistory') || [];
  const count   = history.filter(m => m === 'humanistic').length;
  const v       = HUMANISTIC[count % HUMANISTIC.length];
  return { b1: v.b1, b2: v.b2, mode: 'humanistic', careMode: false };
}

function _resolveImaginary() {
  const history = store.get('checkin.openingModeHistory') || [];
  const count   = history.filter(m => m === 'imaginary').length;
  const v       = IMAGINARY[count % IMAGINARY.length];
  return { b1: v.b1, b2: v.b2, mode: 'imaginary', careMode: false };
}

// ─── Milestone detection ──────────────────────────────────────────────────────
// v2: journal-content-derived triggers removed. This function no longer
// reads journalEntries at all — checkin-count and programme-week
// milestones only.

function _detectMilestone(totalCheckins, historyKeys) {
  const last = store.get('checkin.lastMilestoneNoticed');

  // Check-in COUNT milestones, every 7. STREAK-1: the key said `streak-`
  // and the copy said "in a row"; neither was true. Renamed so the store
  // stops recording a streak this product does not keep.
  if (totalCheckins % 7 === 0) {
    const key = `checkins-${totalCheckins}`;
    if (last !== key) { store.set('checkin.lastMilestoneNoticed', key); return 'checkin-count'; }
  }

  // Programme week milestones
  const startDate = store.get('activeProgramme.startDate');
  if (startDate) {
    const weeks = Math.floor((Date.now() - new Date(startDate)) / 6.048e8);
    if (weeks === 4  && last !== 'four-week')   { store.set('checkin.lastMilestoneNoticed', 'four-week');   return 'four-week'; }
    if (weeks === 8  && last !== 'eight-week')  { store.set('checkin.lastMilestoneNoticed', 'eight-week');  return 'eight-week'; }
    if (weeks === 12 && last !== 'twelve-week') { store.set('checkin.lastMilestoneNoticed', 'twelve-week'); return 'twelve-week'; }
    if (weeks === 13 && last !== 'three-month') { store.set('checkin.lastMilestoneNoticed', 'three-month'); return 'three-month'; }
  }

  return null;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function _gapDays(historyKeys) {
  if (!historyKeys.length) return 999;
  const last  = new Date(historyKeys[historyKeys.length - 1]);
  const today = new Date();
  last.setHours(0,0,0,0); today.setHours(0,0,0,0);
  return Math.floor((today - last) / 864e5);
}

function _recentField(checkinHistory, historyKeys, field) {
  if (!historyKeys.length) return null;
  const v = checkinHistory[historyKeys[historyKeys.length - 1]]?.[field];
  return v !== undefined ? v : null;
}

function _energyTrend(last3) {
  const e = last3.map(x => x?.energy).filter(v => typeof v === 'number');
  if (e.length < 3) return null;
  if (e[2] > e[0] + 1) return 'improving';
  if (e[2] < e[0] - 1) return 'declining';
  return 'flat';
}

function _moodDecliningEnergyStable(last3) {
  const m = last3.map(x => x?.mood).filter(v => typeof v === 'number');
  const e = last3.map(x => x?.energy).filter(v => typeof v === 'number');
  if (m.length < 3 || e.length < 3) return false;
  return m[2] < m[0] - 1 && Math.abs(e[2] - e[0]) <= 1;
}

function _moodImprovingEnergyFlat(last3) {
  const m = last3.map(x => x?.mood).filter(v => typeof v === 'number');
  const e = last3.map(x => x?.energy).filter(v => typeof v === 'number');
  if (m.length < 3 || e.length < 3) return false;
  return m[2] > m[0] + 1 && Math.abs(e[2] - e[0]) <= 1;
}

function _betterAfterPattern(last3) {
  return last3.filter(x => typeof x?.moodAfter === 'number' && typeof x?.energy === 'number' && x.moodAfter > x.energy).length >= 2;
}

function _hasActiveQuietPattern(historyKeys, checkinHistory) {
  if (historyKeys.length < 10) return false;
  let gaps = 0;
  for (let i = 1; i < historyKeys.length; i++) {
    if ((new Date(historyKeys[i]) - new Date(historyKeys[i-1])) / 864e5 >= 3) gaps++;
  }
  return gaps >= 2;
}

function _steadyImprovement(last14) {
  if (last14.length < 8) return false;
  const e1 = last14.slice(0,7).map(x => x?.energy).filter(v => typeof v === 'number');
  const e2 = last14.slice(7).map(x => x?.energy).filter(v => typeof v === 'number');
  if (!e1.length || !e2.length) return false;
  return (e2.reduce((a,b) => a+b,0)/e2.length) > (e1.reduce((a,b) => a+b,0)/e1.length) + 0.5;
}

function _countLastWeek(historyKeys) {
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate()-7); cutoff.setHours(0,0,0,0);
  return historyKeys.filter(k => new Date(k) >= cutoff).length;
}

function _lastWeekMoods(historyKeys, checkinHistory) {
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate()-7); cutoff.setHours(0,0,0,0);
  return historyKeys
    .filter(k => new Date(k) >= cutoff)
    .map(k => checkinHistory[k]?.mood)
    .filter(v => typeof v === 'number');
}

function _pick(arr, mode, careMode) {
  _writeMode(mode);
  const v = arr[Math.floor(Math.random() * arr.length)];
  return { b1: v.b1, b2: v.b2, mode, careMode };
}

function _writeMode(mode) {
  store.set('checkin.lastOpeningMode', mode);
  const history = store.get('checkin.openingModeHistory') || [];
  history.push(mode);
  if (history.length > 30) history.splice(0, history.length - 30);
  store.set('checkin.openingModeHistory', history);
}
