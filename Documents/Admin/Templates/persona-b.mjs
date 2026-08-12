/**
 * PERSONA B — Ruth. Perimenopause, unpredictable energy.
 * The doc makes four testable claims. Each is checked, not assumed.
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
const { resolveIntensity, getSuggestedIntensity, detectBurnout } = await import(`${R}/js/data/checkin.js`);
const F = [];
const note = (sev, w) => F.push({ sev, w });
const day = d => new Date(Date.now() - d * 86400000).toISOString();
const iso = d => new Date(Date.now() - d * 86400000).toISOString().split("T")[0];

store.set("name", "Ruth");
store.set("ageBand", "50s");
store.set("conditions", ["joint-pain"]);
store.set("conditionPainScores", { "joint-pain": 4 });
store.set("capability", { askedAt: day(30), chairRise: "yes", floorAccess: "not-comfortably",
                          legPower: null, bothFeet: "no", balanceWorry: "yes" });

console.log("=== RUTH ===\n");

// CLAIM 1: "no cycle tracking is ever required; nothing degrades without it"
store.set("hormonalTracking", false);
const prof = store.capabilityProfile();
console.log("CLAIM 1 — no cycle tracking required");
console.log(`  hormonalTracking off, capability resolves: legsLoadable=${prof.legsLoadable} legsUsable=${prof.legsUsable}`);
if (prof.legsLoadable !== false) note("CHECK", "chairRise 'yes' + floorAccess 'not-comfortably' -> legs loadable; is that intended?");

// CLAIM 2: "a hard morning is treated as its own data point, not scaled from yesterday"
const hist = {};
[6,5,4,3,2,1].forEach((d,i) => { hist[iso(d)] = { energy: [7,6,7,3,2,2][i], mood: [6,6,7,3,3,2][i] }; });
store.set("checkinHistory", hist);
const burnout = detectBurnout();
const todayEnergy = 2;
const base = getSuggestedIntensity({ energy: todayEnergy });
console.log("\nCLAIM 2 — a hard morning after three low days");
console.log(`  energy 2 -> base intensity: ${base}`);
console.log(`  detectBurnout(): ${burnout}`);
const bias = burnout ? "lighter" : null;
const resolved = resolveIntensity(base, bias);
console.log(`  with proposalBias '${bias}' -> resolved: ${resolved}`);
if (base === "low" && resolved !== "low") note("BLOCKER", "low energy did not resolve to low");

// CLAIM 3: "a good day is NOT defaulted to caution because of her profile"
const goodBase = getSuggestedIntensity({ energy: 8 });
const goodResolved = resolveIntensity(goodBase, burnout ? "lighter" : null);
console.log("\nCLAIM 3 — a good day is not overridden by her profile");
console.log(`  energy 8 -> base: ${goodBase}, resolved: ${goodResolved}`);
if (goodResolved === "low") note("BLOCKER", "a good day was dropped to low - the doc says this must not happen");
console.log(`  ${goodResolved === "moderate" ? "stepped one notch (burnout pattern present) - not floored" : "unchanged"}`);

// CLAIM 4: "exercises lean joint-friendly, without being told what she should manage"
const { EXERCISES } = await import(`${R}/js/data/exercises/index.js`);
const { bodyCaution } = await import(`${R}/js/data/session-rationale.js`);
const byId = new Map(EXERCISES.map(e => [e.id, e]));
console.log("\nCLAIM 4 — joint-aware without prescribing");
for (const id of ["squat-bodyweight", "glute-bridge"]) {
  const ex = byId.get(id);
  if (!ex) { console.log(`  ${id}: not in database`); continue; }
  const c = bodyCaution(ex);
  console.log(`  ${id}: ${c ? c.slice(0, 92) + "..." : "(no caution)"}`);
  if (c && /should|must|need to/i.test(c)) note("BLOCKER", `${id} caution prescribes rather than invites`);
}

// Age must never gate exercises
const gated = EXERCISES.filter(e => JSON.stringify(e).match(/ageBand|minAge|maxAge/));
console.log(`\nexercises gated by age: ${gated.length}`);
if (gated.length) note("BLOCKER", "age gates exercises - locked principle violated");

// Time-stamped horizons must never appear
const { EMPATHY_PROMPTS } = await import(`${R}/js/data/empathy-transfer.js`);
const all = JSON.stringify(EMPATHY_PROMPTS);
const horizons = all.match(/in ten years|in 10 years|by the time you'?re \d/gi) || [];
console.log(`time-stamped horizons in empathy copy: ${horizons.length}`);
if (horizons.length) note("BLOCKER", `time-stamped horizon: ${horizons[0]}`);

console.log("\n--- FINDINGS ---");
console.log(F.length ? F.map(f => `  ${f.sev}: ${f.w}`).join("\n") : "  none");
