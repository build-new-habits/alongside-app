/**
 * js/plan-look.js
 * 31 Oct 2026 v1
 *
 * STAGE PATH Session 9 (CLOSE; P-12). Graeme, 29 Oct: the new look is the
 * Plan's only ("I basically want a paying user to look at the app and see
 * it differently … It's the same thing, but it doesn't look like it").
 *
 * planLook() answers one question: draw this screen in the Plan's look?
 * It is for the LOOK only (a class, a heading's place, the words of the way
 * back, a button's style), never for what anybody can reach, read, keep or
 * do. Rooms that must never check the tier (Wellbeing, the check-in, My
 * exercises, sharing your data: verify-tier, verify-tiergh, verify-door1,
 * verify-decisions, verify-plan-claims, all unchanged) use this and not
 * isPremium(), and verify-one-look TEST 6 proves on both tiers that each
 * offers exactly the same controls: the look changes, nothing else.
 */
import { getUserTier } from "./auth.js";

/** The same answer as isPremium() (the Plan is tier "personal"), asked for the look. */
export function planLook() {
  return getUserTier() === "personal";
}
