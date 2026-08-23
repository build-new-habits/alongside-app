/**
 * workoutGenerator.validateWeightTarget() — RETIRED 22 Aug 2026 (WEIGHT-1a)
 *
 * Called by nothing. Returned null unconditionally because weight and
 * targetWeight had no writers. The 12-week unsafe-pace warning here
 * never fired for anyone. Rewritten in js/data/weight-targets.js.
 */
  // ── Weight target safeguarding ──────────────────────────────────────────────

  /**
   * Validate the user's weight target against a safe rate of change.
   * Safe rate: ~0.5-1 kg per week (1-2 lbs).
   * Returns a warm coach message string if the target is unsafe.
   * Returns null if the target is safe, or if data is insufficient to check.
   *
   * @returns {string|null}
   */
  validateWeightTarget() {
    const currentWeight = store.get("weight");
    const targetWeight  = store.get("targetWeight");
    // GOAL-2. The second half of this read "goal.targetDate", which has
    // never existed. Harmless — the first read works — but a dead branch
    // in a validator is a branch somebody will one day trust. Now reads
    // the two real homes, matching TARGET-3's precedence.
    const targetDate    = store.get("strategicGoal.targetDate") ||
                          store.get("targetDate");

    if (!currentWeight || !targetWeight || !targetDate) return null;

    const current = parseFloat(currentWeight);
    const target  = parseFloat(targetWeight);
    if (isNaN(current) || isNaN(target)) return null;

    const weightDiff = Math.abs(current - target);
    if (weightDiff < 0.5) return null; // Already at or near target

    const today      = new Date();
    const end        = new Date(targetDate);
    const msPerWeek  = 7 * 24 * 60 * 60 * 1000;
    const weeksLeft  = (end - today) / msPerWeek;

    if (weeksLeft <= 0) return null; // Date already passed — no intervention

    const kgPerWeek = weightDiff / weeksLeft;

    if (kgPerWeek <= 1.0) return null; // Safe rate — no message needed

    return "That is a meaningful goal and I want to help you get there. That timeline concerns me a little though — a pace of around 0.5 to 1 kg a week tends to be more sustainable and kinder to your body. Want to adjust the date, or keep the goal open-ended for now?";
  },

  // ── Daily options ───────────────────────────────────────────────────────────

