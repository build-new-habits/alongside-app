/**
 * tools/website-claims.mjs
 * 07 Nov 2026 v2
 *
 * v2 - APP_URL: the site links the app for friends to try (Graeme, 07 Nov).
 *
 * WEB-TRIM (master schedule row 9b). Every Free / Plan claim the public
 * website makes, in one reviewed list beside the app, so the site and the
 * app change together. tools/verify-website.mjs (v2) checks that:
 *   - each table on the site (data-claims="home", and one per How it works
 *     scenario) has exactly these rows, word for word, with these ticks;
 *   - each row's proof is really in the app: the named file contains the
 *     named words, so a feature the site claims cannot quietly disappear.
 *
 * What a proof does NOT show: which tier sees the feature. The Free and
 * Plan columns here are the reviewed decision (Graeme, 07 Nov 2026, from
 * the tier split and js/data/tier-table.js); a change to who gets what is
 * a change to this file, made on purpose.
 *
 * A cell is true (a tick), false (a dash) or a string shown as written.
 * Not loaded by the app. Named without "verify-" so the suite does not
 * count it as a gate.
 */

const P = (file, words) => ({ file, words });

/** Where the site sends people to try the app. Must match this repo's CNAME. */
export const APP_URL = "https://app.buildnewhabits.co.uk/";

/** Prices shown on the site. Monthly and yearly must equal js/data/pricing.js. */
export const EARLY_BIRD = {
  price: "£44.99",
  // Revenue Architecture, 18 Aug 2026: the founding price for testers.
  // Its dates are still marked TO CONFIRM in the planned changes addendum v4.
  source: "Revenue Architecture 18 Aug 2026 (dates TO CONFIRM)",
};

/** Home: Free, or the Plan. */
export const HOME_ROWS = [
  { text: "Check in and get a session shaped to how you are", free: true, plan: true,
    proof: [P("js/views/checkin.js", "How's your energy today?")] },
  { text: "All of Wellbeing: breathing, mindful awareness, the journal, In Step", free: true, plan: true,
    proof: [P("js/data/tier-table.js", "In Step")] },
  { text: "Everything that keeps you safe", free: true, plan: true,
    // S1 SAFE-HALFWAY, 07 Nov: the halfway check runs on both tiers.
    proof: [P("tools/verify-path-finish.mjs", "Free, quite sore: the same halfway check")] },
  { text: "Choose by what you came for: get stronger, keep moving, stretch, or move to feel better", free: false, plan: true,
    proof: [P("js/views/plan-home.js", "Get stronger"), P("js/views/plan-home.js", "Move to feel better")] },
  { text: "Swap any exercise, and save sessions to start again", free: false, plan: true,
    proof: [P("js/views/path.js", "Swap"), P("js/data/saved-sessions.js", "export")] },
  { text: "Tell the coach where you’re heading, and it builds towards it", free: false, plan: true,
    proof: [P("js/views/arc-setup.js", "What do you want to be able to do?"), P("js/views/coach-proposal.js", "Based on your arc")] },
  { text: "Your progress", free: "Last 7, 14 or 30 days", plan: "Up to 90 days, read back to you",
    proof: [P("js/views/progress.js", "90 days")] },
];

/** How it works: one table per scenario, in page order. */
export const SCENARIOS = [
  { id: "arc", title: "When I’m working towards something", rows: [
    { text: "Tell the coach what you want to be able to do, in your own words", free: false, plan: true,
      proof: [P("js/views/arc-setup.js", "What do you want to be able to do?"), P("js/views/today.js", "Part of the Plan")] },
    { text: "Pick up to three things that feed it", free: false, plan: true,
      proof: [P("js/views/arc-setup.js", "Pick up to ${AIMS.maxStrands}")] },
    { text: "Sessions are built towards it", free: false, plan: true,
      proof: [P("js/views/coach-proposal.js", "Based on your arc")] },
    { text: "See it on Home, week by week", free: false, plan: true,
      proof: [P("js/views/plan-home.js", "Your arc")] },
    { text: "Progress reads it back to you", free: false, plan: true,
      proof: [P("js/views/progress.js", "Nothing is behind")] },
    { text: "No dates or targets. Change it or stop it any time", free: false, plan: true,
      proof: [P("js/views/arc-setup.js", "No dates, nothing to keep up with")] },
    { text: "Each session meets you where you are today", free: true, plan: true,
      proof: [P("js/data/tier-table.js", "Each session meets you where you are today")] },
  ]},
  { id: "coach", title: "When I want the coach to choose for me", rows: [
    { text: "Three quick questions: energy, mood, and anything sore", free: true, plan: true,
      proof: [P("js/views/checkin.js", "How's your energy today?"), P("js/views/checkin.js", "Anything sore today?")] },
    { text: "A session shaped to your answers", free: true, plan: true,
      proof: [P("js/session-builder.js", "so this is shorter than usual")] },
    { text: "Every exercise says why it helps, and how to do it", free: true, plan: true,
      proof: [P("js/exercise-card.js", "\"why\"")] },
    { text: "A list of what the coach adjusted, and Change my check-in", free: false, plan: true,
      proof: [P("js/views/coach-proposal.js", "What I've adjusted"), P("js/views/coach-proposal.js", "Change my check-in")] },
    { text: "Swap any exercise", free: false, plan: true,
      proof: [P("js/views/path.js", "Swap")] },
    { text: "Do an exercise later, or see what’s left", free: false, plan: true,
      proof: [P("js/views/workout.js", "Do this one later"), P("js/views/workout.js", "What's left")] },
  ]},
  { id: "know", title: "When I want to choose for myself", rows: [
    { text: "Choose the kind of session, home or gym, and how long", free: true, plan: true,
      proof: [P("js/data/tier-table.js", "Choose any kind of session")] },
    { text: "Start from your purpose: get stronger, keep moving, stretch, or move to feel better", free: false, plan: true,
      proof: [P("js/views/plan-home.js", "Get stronger")] },
    { text: "Build your own session, part by part, with the coach’s help", free: false, plan: true,
      proof: [P("js/views/build-session.js", "Help me fill this")] },
    { text: "Follow a fitness trend: Zone 2, HILIT, hybrid training, reformer-style Pilates, 10-minute snacks", free: false, plan: true,
      proof: [P("js/views/path.js", "Follow a fitness trend")] },
    { text: "Save sessions to start again", free: false, plan: true,
      proof: [P("js/data/saved-sessions.js", "export")] },
    { text: "Log what you did", free: true, plan: true,
      proof: [P("js/views/path.js", "Log what I did")] },
    { text: "Make it up as you go, logging each set", free: false, plan: true,
      proof: [P("js/views/path.js", "Make it up as I go")] },
  ]},
  { id: "low", title: "When I want something for a low day", rows: [
    { text: "Notices when your energy or mood is low", free: true, plan: true,
      proof: [P("js/session-builder.js", "low today, so this is shorter than usual")] },
    { text: "A shorter, gentler session", free: true, plan: true,
      proof: [P("js/session-builder.js", "shorter than usual")] },
    { text: "Something gentler, or Wellbeing, one tap away", free: true, plan: true,
      proof: [P("js/views/coach-proposal.js", "Something gentler")] },
    { text: "Sessions made for low days, with no countdown timers", free: false, plan: true,
      proof: [P("js/data/path-engine.js", "No countdown timers")] },
    { text: "A gentler start after time away", free: true, plan: true,
      proof: [P("js/views/coach-proposal.js", "Welcome back. Starting gently")] },
    { text: "Carry on a session you left part-way", free: false, plan: true,
      proof: [P("js/views/plan-home.js", "Carry on")] },
  ]},
  { id: "calm", title: "When I want something calmer", rows: [
    { text: "Breathing, mindful awareness, the journal, and In Step", free: true, plan: true,
      proof: [P("js/data/tier-table.js", "In Step")] },
    { text: "Help numbers, if you need them", free: true, plan: true,
      proof: [P("js/data/support-lines.js", "Samaritans")] },
    { text: "Move to feel better: grounded, calmer, worn out, wake up, ready for sleep", free: false, plan: true,
      proof: [P("js/data/feel-programmes.js", "Ready for sleep")] },
    { text: "Tai chi, qigong, calming yoga and gentle movement", free: false, plan: true,
      proof: [P("js/views/path.js", "qigong")] },
  ]},
  { id: "progress", title: "When I want to see how it’s going", rows: [
    { text: "Today, and the last 7, 14 or 30 days", free: true, plan: true,
      proof: [P("js/views/progress.js", "30 days")] },
    { text: "Share your progress as a picture, certificate, report or text", free: true, plan: true,
      proof: [P("js/views/progress-share.js", "ertificate")] },
    { text: "Up to 90 days", free: false, plan: true,
      proof: [P("js/views/progress.js", "90 days")] },
    { text: "How you felt before and after moving, and what seems to help", free: false, plan: true,
      proof: [P("js/views/progress.js", "Before and after")] },
    { text: "Your arc, read back to you", free: false, plan: true,
      proof: [P("js/views/progress.js", "Change my arc")] },
    { text: "The weights you’ve lifted", free: false, plan: true,
      proof: [P("js/data/tier-table.js", "logged weights")] },
  ]},
];
