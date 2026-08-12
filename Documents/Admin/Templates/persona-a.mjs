/**
 * PERSONA A — Nadia. ADHD, mid-30s, novelty-driven.
 * Hyperfocuses ~2 weeks, then repetition itself becomes the friction.
 * Executed against live modules. No mocking beyond localStorage.
 */
const mem = {};
globalThis.localStorage = {
  getItem: k => (k in mem ? mem[k] : null),
  setItem: (k, v) => { mem[k] = String(v); },
  removeItem: k => { delete mem[k]; },
};
const R = "/home/claude/repo";
const { store } = await import(`${R}/js/store.js`);
store.init();

const day = d => new Date(Date.now() - d * 86400000).toISOString();
const F = [];        // findings
const note = (sev, what) => F.push({ sev, what });

// ── Onboarding ──────────────────────────────────────────────────────────
store.set("name", "Nadia");
store.set("ageBand", "30s");
store.set("onboarding.primaryTerritory", "escalation-trap");   // "moved too fast, too soon"
store.set("capability", { askedAt: day(21), chairRise: "yes", floorAccess: "yes",
                          legPower: null, bothFeet: "yes", balanceWorry: "no" });
store.set("conditions", []);
store.set("conditionPainScores", {});
store.set("lifestyle", { activityLevel: "moderate" });
store.set("sessionVariety", "balanced");

// ── Two weeks of hyperfocus: 10 sessions, days 21..8 ─────────────────────
const POOL = ["glute-bridge","dead-bug","bird-dog","plank","squat-bodyweight",
              "push-up-knees","thoracic-rotation","hip-flexor-stretch"];
for (let i = 0; i < 10; i++) {
  const d = 21 - i * 1.4 | 0;
  store.logActivity({
    id: `n-${i}`, type: "workout", source: "coach-recommended", status: "completed",
    durationMins: 30, completedAt: day(d), sessionEnd: day(d), creditsEarned: 40,
    exerciseIds: POOL.slice(0, 5),
  });
}
console.log("=== NADIA ===\n");
console.log(`sessions logged: ${(store.get("activityLog")||[]).length}`);
const hist = store.get("exerciseHistory") || {};
console.log(`exercises now familiar: ${Object.keys(hist).length}`);
if (Object.keys(hist).length === 0) note("BLOCKER", "exerciseHistory empty after 10 completed sessions");

// ── THE LAPSE: 3 weeks away, comes back today ────────────────────────────
store.logActivity({
  id: "n-return", type: "workout", source: "coach-recommended", status: "completed",
  durationMins: 25, completedAt: day(0), sessionEnd: day(0), creditsEarned: 40,
  exerciseIds: POOL.slice(0, 4),
});

// Does anything shame her for the gap?
const log = store.get("activityLog") || [];
const streaky = JSON.stringify(store.data).match(/streak/gi) || [];
console.log(`\nstreak fields in her whole store: ${streaky.length}`);
if (streaky.length) note("BLOCKER", "streak data present in store");

// ── The thing she is here for: does the session actually vary? ───────────
const { selectMoment } = await import(`${R}/js/data/grounding-moments.js`);
const { EXERCISES } = await import(`${R}/js/data/exercises/index.js`);
const byId = new Map(EXERCISES.map(e => [e.id, e]));

// sessionVariety is now writable (DIC-1). Simulate her choosing "different".
store.set("sessionVariety", "varied");
console.log(`sessionVariety after choosing 'something different': ${store.get("sessionVariety")}`);
if (store.get("sessionVariety") !== "varied") note("BLOCKER", "variety choice not persisted");

// Grounding moment on her return session
const sc = (store.get("activityLog")||[]).length;
const m = selectMoment(byId.get("plank"), sc);
console.log(`\ngrounding moment at session ${sc}: ${m ? `[${m.depth}] ${m.text.slice(0,64)}...` : "(silent)"}`);

// Empathy prompt cadence
const { selectEmpathyPrompt } = await import(`${R}/js/data/empathy-transfer.js`);
const ep = selectEmpathyPrompt(1, {
  sessionCount: sc, struggled: false, lowEnergy: false, checkedInToday: true,
  returning: true, sustainedDifficulty: false, variablePattern: true,
  adjusting: true, gentleSession: false, coachAdjusted: false,
}, { stage: 0, index: -1, runLength: 0 }, 0);
console.log(`empathy prompt on return: [${ep.depth||ep.stage}] ${ep.text.slice(0,64)}...`);

console.log("\n--- FINDINGS ---");
console.log(F.length ? F.map(f => `  ${f.sev}: ${f.what}`).join("\n") : "  none");
