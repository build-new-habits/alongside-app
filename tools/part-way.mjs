/**
 * tools/part-way.mjs
 * 24 Nov 2026 v1
 *
 * P-46 S2. Since the one-minute start (views/onboarding/start.js), the old
 * getting-started conversation is reached only by someone who had started
 * it and got past the name (onboarding/thread.js _beginThread: resume).
 * Gates that check that conversation start there: agreed, a name, the
 * conversation started an hour ago and reached the step after the name.
 * The age question and the agreements are checked on their own (they are
 * unchanged), and the hand-over for everyone else by verify-p46-start.
 */
import { agreed } from "./agreed.mjs";
import { declineHealthConsent } from "../js/data/health-consent.js";

export const PART_WAY_STEP = "3a";

export function partWay(store, { health = true, name = "Sam", step = PART_WAY_STEP } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  if (!health) declineHealthConsent();
  store.set("name", name);
  store.set("onboarding.threadStartedAt", new Date(Date.now() - 3600000).toISOString());
  store.set("onboarding.reachedStep", step);
}
