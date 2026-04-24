/**
 * coach-proposal.js - Coach Proposal Screen
 *
 * v1.0 (S4-1, April 2026)
 *
 * The coach arrives with a plan. Not a menu. Not cards.
 * A single proposal in plain English, with visible reasoning,
 * and two responses: "Let's go" or "Something else."
 *
 * The coach reads:
 *   - Today's energy, mood, sleep from check-in
 *   - Last session from activityLog (type, when, how hard)
 *   - Active conditions and pain scores
 *   - Strategic goal and target date
 *   - Gym programme week and session
 *   - Available time
 *   - Days since last session
 *
 * From this it produces:
 *   - A named plan type (e.g. "gym session", "something quieter", "a walk")
 *   - A plain-English description of why
 *   - A duration estimate
 *   - A navigation target when accepted
 *
 * On "Something else": soft branching chips appear.
 *   - I had something in mind  → shows activity type chips
 *   - Suggest something different → revised proposal
 *   - Something shorter → same plan, shorter duration
 *   - Something quieter → navigates to quiet-session
 *
 * Header:
 *   ← Back          Library →
 *   (returns to     (goes to Library tab
 *    check-in)       in Settings)
 *
 * Route: coach-proposal
 * Nav: hidden (this IS the nav moment)
 */

import { store } from "../store.js";

export const centered = false;

// ── State ─────────────────────────────────────────────────────────────────────

let proposalState   = "proposal";  // "proposal" | "branching" | "revised" | "activity-pick"
let currentProposal = null;        // the active proposal object
let revisedProposal = null;        // the alternative proposal
let branchChoice    = null;        // "mind" | "different" | "shorter" | "quieter"

// ── Proposal engine ───────────────────────────────────────────────────────────

/**
 * Build a proposal object from all available store data.
 * Returns { type, label, description, rationale, duration, target, quietMode }
 *
 * type: "gym" | "prescribed" | "quiet" | "walk" | "yoga" | "home" | "cardio"
 * label: short name shown in "I'm thinking..."
 * description: one paragraph, coach voice, plain English — NOT a list
 * rationale: the "because..." sentence shown below the description
 * duration: number (minutes)
 * target: router target on acceptance
 * quietMode: if type is "quiet", which mode
 */
function buildProposal(preferShorter = false) {
  const name          = store.get("name") || "you";
  const checkin       = latestCheckin();
  const energy        = checkin.energy    || 5;
  const mood          = checkin.mood      || 5;
  const sleep         = checkin.sleep     || 7;
  const conditions    = store.get("conditions")         || [];
  const painScores    = store.get("conditionPainScores") || {};
  const activityLog   = store.get("activityLog")         || [];
  const prescribed    = (store.get("prescribedExercises") || []).filter(e => !e.completedToday);
  const availableTime = store.get("availableTime")       || null;
  const goal          = store.get("strategicGoal")       || {};
  const gymWeek       = store.get("gymProgrammeWeek")    || 1;
  const gymSession    = store.get("gymProgrammeSession") || "A";

  const recentLog     = activityLog.slice(-5);
  const lastSession   = recentLog[recentLog.length - 1] || null;
  const daysSinceLast = lastSession
    ? Math.floor((Date.now() - new Date(lastSession.loggedAt)) / 86400000)
    : 99;

  const recentTypes   = recentLog.map(e => e.type || "");
  const gymCountRecent = recentTypes.filter(t => t === "gym" || t === "coach-session").length;

  const highPain      = conditions.some(id => (painScores[id] || 0) >= 7);
  const moderatePain  = conditions.some(id => (painScores[id] || 0) >= 4);
  const hasPrescribed = prescribed.length > 0;

  // ── Time budget ──────────────────────────────────────────────────────────────
  const TIME_MAP = {
    "micro":    15,
    "quick":    20,
    "short":    30,
    "standard": 40,
    "long":     50,
    "open":     60
  };
  let timeBudget = availableTime ? (TIME_MAP[availableTime] || 40) : 40;
  if (preferShorter) timeBudget = Math.max(15, Math.round(timeBudget * 0.6));

  // ── Decision logic ───────────────────────────────────────────────────────────

  // Severe state: override everything
  if (highPain || energy <= 2) {
    return {
      type: "quiet",
      label: "something gentle",
      description: "Today is a day for rest and recovery. Your body is telling you something important and the most supportive thing I can offer right now is space, not a workout. A short breathing practice or a few minutes of stillness is the plan.",
      rationale: energy <= 2
        ? "Your energy is very low today. Pushing through won't serve you."
        : "Your pain levels are elevated. Movement is not off the table, but intensity is.",
      duration: 10,
      target: "quiet-session",
      quietMode: "breathing"
    };
  }

  // Prescribed exercises due and energy is okay
  if (hasPrescribed && energy >= 4 && !moderatePain) {
    const baseDur = Math.min(timeBudget, 35);
    return {
      type: "prescribed",
      label: "your prescribed exercises",
      description: "I think today is a good day to work through your prescribed exercises. Your physio gave you these for a reason, and consistency with them is what makes the difference over time. I will walk you through each one in order.",
      rationale: "You have " + prescribed.length + " prescribed exercise" + (prescribed.length > 1 ? "s" : "") + " outstanding today. Your energy is good enough to do them properly.",
      duration: baseDur,
      target: "prescribed",
      quietMode: null
    };
  }

  // Low energy but not severe: suggest quiet or gentle movement
  if (energy <= 3) {
    if (mood <= 3 || sleep <= 5) {
      return {
        type: "quiet",
        label: "something quieter today",
        description: "Looking at how you are feeling, I think a gentle session makes more sense than a workout. I was thinking a short mindful practice or some breathing work, something that meets you where you are without asking more than you have.",
        rationale: "Low energy, " + (sleep <= 5 ? "disrupted sleep" : "lower mood") + " — this is a recovery day, not a training day.",
        duration: Math.min(timeBudget, 20),
        target: "quiet-session",
        quietMode: "mindful"
      };
    }

    // Low energy but mood and sleep are okay — gentle movement
    return {
      type: "walk",
      label: "something gentle to start",
      description: "Your energy is lower today, but that does not mean doing nothing. I think a gentle walk or some light movement would actually help more than staying still. Movement generates the energy it costs, especially on days like this.",
      rationale: "Lower energy often responds better to gentle movement than to rest. A short session is better than skipping.",
      duration: Math.min(timeBudget, 25),
      target: "quiet-session",
      quietMode: "mindful"
    };
  }

  // Good energy, too many gym sessions recently — suggest variety
  if (energy >= 6 && gymCountRecent >= 3) {
    return {
      type: "yoga",
      label: "a yoga or recovery session",
      description: "You have had several good training sessions recently. Rather than loading the same movement patterns again, I think today is a good opportunity for something that supports recovery and mobility. A yoga or stretch-focused session would complement what you have been doing.",
      rationale: "Three or more gym-type sessions in the last five. Your body will adapt faster with some contrast.",
      duration: Math.min(timeBudget, 40),
      target: "yoga-session",
      quietMode: null
    };
  }

  // Missed several days — ease back in
  if (daysSinceLast >= 4 && energy >= 4) {
    return {
      type: "gym",
      label: "a return session",
      description: "It has been a few days since your last session. Rather than diving straight into a full programme, I think a moderate gym session is the right re-entry point. Enough to get back into it without overdoing the return.",
      rationale: "Four or more days since your last session. Easing back in is smarter than catching up.",
      duration: Math.min(timeBudget, 45),
      target: "gym-programme",
      quietMode: null
    };
  }

  // Goal is weight / leanness and no recent cardio
  const hasWeightGoal  = goal.primaryGoal === "lose-weight" || goal.primaryGoal === "body-composition";
  const recentCardio   = recentTypes.filter(t => t === "cardio" || t === "run" || t === "cycle" || t === "swim").length;
  if (hasWeightGoal && recentCardio === 0 && energy >= 5) {
    return {
      type: "cardio",
      label: "a cardio session today",
      description: "Given your goal and recent activity, I think some cardiovascular work would serve you well today. The gym cardio block, a run, or a cycle would all work. The key is sustained effort for at least twenty minutes.",
      rationale: "No cardio in your recent sessions, and your goal includes body composition change. Cardio consistency matters here.",
      duration: Math.min(timeBudget, 40),
      target: "gym-programme",
      quietMode: null
    };
  }

  // Default: gym programme, next session
  return {
    type: "gym",
    label: "your gym programme",
    description: "I think today is a good day to continue your gym programme. Session " + gymSession + " of Week " + gymWeek + " is next. The session includes your warmup cardio, the main programme, and your prescribed exercises are built in. About " + Math.min(timeBudget, 45) + " minutes in total.",
    rationale: energy >= 7
      ? "Your energy is good today. Make the most of it."
      : "Steady progress on the programme is what builds the result.",
    duration: Math.min(timeBudget, 45),
    target: "gym-programme",
    quietMode: null
  };
}

/**
 * Build an alternative proposal — genuinely different from the current one.
 */
function buildAlternativeProposal() {
  const current       = currentProposal;
  const energy        = latestCheckin().energy || 5;
  const prescribed    = (store.get("prescribedExercises") || []).filter(e => !e.completedToday);
  const gymWeek       = store.get("gymProgrammeWeek") || 1;
  const gymSession    = store.get("gymProgrammeSession") || "A";
  const availableTime = store.get("availableTime") || null;
  const TIME_MAP      = { micro: 15, quick: 20, short: 30, standard: 40, long: 50, open: 60 };
  const timeBudget    = availableTime ? (TIME_MAP[availableTime] || 40) : 40;

  // Suggest the opposite of current
  if (current.type === "gym") {
    return {
      type: "quiet",
      label: "something quieter instead",
      description: "How about this instead: skip the gym programme today and do something that nourishes rather than demands. A breathing session, some journaling, or a short mindful movement practice. Different kind of good.",
      rationale: "Sometimes the most useful thing is contrast.",
      duration: Math.min(timeBudget, 20),
      target: "quiet-session",
      quietMode: "breathing"
    };
  }

  if (current.type === "quiet" || current.type === "walk") {
    return {
      type: "gym",
      label: "your gym programme after all",
      description: "Actually — how about continuing your gym programme? Session " + gymSession + " of Week " + gymWeek + ". You might find you have more in you than you think, and even a shorter version of the session is worth doing.",
      rationale: "Movement often generates the energy it costs. Worth trying.",
      duration: Math.min(timeBudget, 35),
      target: "gym-programme",
      quietMode: null
    };
  }

  if (current.type === "prescribed") {
    return {
      type: "gym",
      label: "the full gym session with prescribed built in",
      description: "Rather than just the prescribed exercises on their own, how about the full gym session? Your prescribed work is already built into the programme warmup, so you get both.",
      rationale: "More complete session, same prescribed work included.",
      duration: Math.min(timeBudget, 45),
      target: "gym-programme",
      quietMode: null
    };
  }

  if (current.type === "yoga") {
    return {
      type: "home",
      label: "a home bodyweight workout",
      description: "Instead of yoga, how about a home bodyweight session? No equipment, good mix of strength and mobility, about thirty minutes. Enough contrast from your recent gym sessions without needing any kit.",
      rationale: "Different movement pattern, similar recovery benefit.",
      duration: Math.min(timeBudget, 30),
      target: "quiet-session",
      quietMode: "mindful"
    };
  }

  // Fallback
  return {
    type: "quiet",
    label: "a breathing practice",
    description: "How about just a short breathing practice? Five minutes of box breathing or the physiological sigh. Quick, effective, and genuinely useful however you are feeling.",
    rationale: "Sometimes less is more.",
    duration: 10,
    target: "quiet-session",
    quietMode: "breathing"
  };
}

function latestCheckin() {
  const history = store.get("checkinHistory") || {};
  const todayKey = new Date().toISOString().split("T")[0];
  return history[todayKey] || store.get("lastCheckin") || {};
}

// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  if (!currentProposal) currentProposal = buildProposal();
  const name = (store.get("name") || "").split(" ")[0] || "there";

  return `
    <div class="view coach-proposal-view">

      <!-- ── Header ──────────────────────────────────────────────────────── -->
      <div class="coach-proposal-header">
        <button class="btn btn-ghost btn-small proposal-back-btn"
                id="proposal-back-btn"
                aria-label="Back">
          &larr; Back
        </button>
        <button class="btn btn-ghost btn-small proposal-library-btn"
                id="proposal-library-btn"
                aria-label="Go to Library">
          Library &rarr;
        </button>
      </div>

      <!-- ── Coach proposal ──────────────────────────────────────────────── -->
      <div id="proposal-body">
        ${proposalState === "proposal"   ? renderProposal(name)  : ""}
        ${proposalState === "branching"  ? renderBranching()     : ""}
        ${proposalState === "revised"    ? renderRevised(name)   : ""}
        ${proposalState === "activity-pick" ? renderActivityPick() : ""}
      </div>

    </div>
  `;
}

function renderProposal(name) {
  const p = currentProposal;
  return `
    <div class="card card-coach coach-proposal-card">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div class="coach-proposal-content">
        <p class="coach-proposal-thinking">
          ${getGreeting(name)}, I'm thinking ${p.label} today.
        </p>
        <p class="coach-proposal-description">${p.description}</p>
        <p class="coach-proposal-rationale text-sm text-muted">${p.rationale}</p>
        <div class="coach-proposal-meta">
          <span class="coach-proposal-duration">&#8987; About ${p.duration} minutes</span>
        </div>
      </div>
    </div>

    <div class="coach-proposal-actions">
      <button class="btn btn-primary btn-large btn-full" id="proposal-accept-btn"
              aria-label="Accept proposal and start session">
        Let's go
      </button>
      <button class="btn btn-ghost btn-full" id="proposal-else-btn"
              style="margin-top: var(--space-3);">
        Something else
      </button>
    </div>
  `;
}

function renderBranching() {
  return `
    <div class="card card-coach coach-proposal-card">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div>
        <p>No problem. What would work better?</p>
      </div>
    </div>

    <div class="coach-branch-chips" role="group" aria-label="What would you prefer?">
      <button class="coach-branch-chip" data-branch="mind"
              aria-pressed="false">
        I had something in mind
      </button>
      <button class="coach-branch-chip" data-branch="different"
              aria-pressed="false">
        Suggest something different
      </button>
      <button class="coach-branch-chip" data-branch="shorter"
              aria-pressed="false">
        Something shorter
      </button>
      <button class="coach-branch-chip" data-branch="quieter"
              aria-pressed="false">
        Something quieter
      </button>
    </div>

    <button class="btn btn-ghost btn-full" id="proposal-back-to-proposal-btn"
            style="margin-top: var(--space-4);">
      &larr; Back to the suggestion
    </button>
  `;
}

function renderRevised(name) {
  const p = revisedProposal || currentProposal;
  return `
    <div class="card card-coach coach-proposal-card">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div class="coach-proposal-content">
        <p class="coach-proposal-thinking">
          How about this instead &mdash; ${p.label}.
        </p>
        <p class="coach-proposal-description">${p.description}</p>
        <p class="coach-proposal-rationale text-sm text-muted">${p.rationale}</p>
        <div class="coach-proposal-meta">
          <span class="coach-proposal-duration">&#8987; About ${p.duration} minutes</span>
        </div>
      </div>
    </div>

    <div class="coach-proposal-actions">
      <button class="btn btn-primary btn-large btn-full" id="proposal-accept-revised-btn"
              aria-label="Accept revised proposal">
        Let's go
      </button>
      <button class="btn btn-ghost btn-full" id="proposal-else-btn"
              style="margin-top: var(--space-3);">
        Still not quite right
      </button>
    </div>
  `;
}

const ACTIVITY_PICKS = [
  { id: "gym",         label: "Gym session",         icon: "\uD83C\uDFCB", target: "gym-programme",  quietMode: null },
  { id: "prescribed",  label: "Prescribed exercises", icon: "\uD83E\uDE7A", target: "prescribed",     quietMode: null },
  { id: "yoga",        label: "Yoga / Pilates",       icon: "\uD83E\uDDD8", target: "yoga-session",   quietMode: null },
  { id: "breathing",   label: "Breathing practice",   icon: "\uD83C\uDF2C", target: "quiet-session",  quietMode: "breathing" },
  { id: "journal",     label: "Journaling",           icon: "\uD83D\uDCDD", target: "quiet-session",  quietMode: "journal" },
  { id: "mindful",     label: "Mindful movement",     icon: "\uD83C\uDF3F", target: "quiet-session",  quietMode: "mindful" },
  { id: "walk",        label: "Walk",                 icon: "\uD83D\uDEB6", target: "activity-log",   quietMode: null },
  { id: "run",         label: "Run",                  icon: "\uD83C\uDFC3", target: "activity-log",   quietMode: null },
  { id: "swim",        label: "Swim",                 icon: "\uD83C\uDFCA", target: "activity-log",   quietMode: null },
  { id: "class",       label: "A class",              icon: "\uD83C\uDFE5", target: "activity-log",   quietMode: null },
];

function renderActivityPick() {
  return `
    <div class="card card-coach coach-proposal-card">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div>
        <p>What did you have in mind?</p>
      </div>
    </div>

    <div class="coach-activity-pick-grid" role="group" aria-label="Choose an activity">
      ${ACTIVITY_PICKS.map(act => `
        <button class="coach-activity-pick-btn"
                data-target="${act.target}"
                data-quiet="${act.quietMode || ""}"
                data-activity="${act.id}"
                aria-label="${act.label}">
          <span aria-hidden="true">${act.icon}</span>
          <span>${act.label}</span>
        </button>
      `).join("")}
    </div>

    <button class="btn btn-ghost btn-full" id="proposal-back-to-branching-btn"
            style="margin-top: var(--space-4);">
      &larr; Back
    </button>
  `;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting(name) {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning " + name;
  if (hour < 17) return "Hey " + name;
  return "Evening " + name;
}

function navigateToProposal(proposal) {
  if (proposal.quietMode) store.set("quietMode", proposal.quietMode);
  store.set("coachProposalAccepted", {
    type: proposal.type,
    label: proposal.label,
    duration: proposal.duration,
    acceptedAt: new Date().toISOString()
  });
  router.navigate(proposal.target);
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {
  // ── Header navigation ─────────────────────────────────────────────────────
  document.getElementById("proposal-back-btn")?.addEventListener("click", () => {
    cleanup();
    router.navigate("checkin");
  });

  document.getElementById("proposal-library-btn")?.addEventListener("click", () => {
    cleanup();
    store.set("settingsTab", "library");
    router.navigate("settings");
  });

  // ── Accept proposal ───────────────────────────────────────────────────────
  document.getElementById("proposal-accept-btn")?.addEventListener("click", () => {
    navigateToProposal(currentProposal);
  });

  // ── Something else ────────────────────────────────────────────────────────
  document.getElementById("proposal-else-btn")?.addEventListener("click", () => {
    proposalState = "branching";
    rerender();
  });

  // ── Branch chips ──────────────────────────────────────────────────────────
  document.querySelectorAll(".coach-branch-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      branchChoice = chip.dataset.branch;

      if (branchChoice === "quieter") {
        store.set("quietMode", "mindful");
        cleanup();
        router.navigate("quiet-session");
        return;
      }

      if (branchChoice === "mind") {
        proposalState = "activity-pick";
        rerender();
        return;
      }

      if (branchChoice === "shorter") {
        revisedProposal = buildProposal(true);
        proposalState   = "revised";
        rerender();
        return;
      }

      if (branchChoice === "different") {
        revisedProposal = buildAlternativeProposal();
        proposalState   = "revised";
        rerender();
        return;
      }
    });
  });

  // ── Back to proposal ──────────────────────────────────────────────────────
  document.getElementById("proposal-back-to-proposal-btn")?.addEventListener("click", () => {
    proposalState = "proposal";
    rerender();
  });

  document.getElementById("proposal-back-to-branching-btn")?.addEventListener("click", () => {
    proposalState = "branching";
    rerender();
  });

  // ── Accept revised ────────────────────────────────────────────────────────
  document.getElementById("proposal-accept-revised-btn")?.addEventListener("click", () => {
    navigateToProposal(revisedProposal || currentProposal);
  });

  // ── Activity pick ─────────────────────────────────────────────────────────
  document.querySelectorAll(".coach-activity-pick-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const target    = btn.dataset.target;
      const quietMode = btn.dataset.quiet || null;
      if (quietMode)  store.set("quietMode", quietMode);
      store.set("coachProposalAccepted", {
        type: btn.dataset.activity,
        label: btn.querySelector("span:last-child")?.textContent || "",
        duration: null,
        acceptedAt: new Date().toISOString()
      });
      cleanup();
      router.navigate(target);
    });
  });
}

function cleanup() {
  proposalState   = "proposal";
  currentProposal = null;
  revisedProposal = null;
  branchChoice    = null;
}

function rerender() {
  const body = document.getElementById("proposal-body");
  if (!body) return;
  const name = (store.get("name") || "").split(" ")[0] || "there";
  if (proposalState === "proposal")      body.innerHTML = renderProposal(name);
  if (proposalState === "branching")     body.innerHTML = renderBranching();
  if (proposalState === "revised")       body.innerHTML = renderRevised(name);
  if (proposalState === "activity-pick") body.innerHTML = renderActivityPick();
  onMount();
}
