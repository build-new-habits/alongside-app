/**
 * js/data/tier-table.js
 * 29 Sep 2026 v2
 *
 * v2 - P0, SCOPE-MINOR. The progress row no longer offers "what you have
 *   told me at check-in": the per-area charts were removed.
 *
 * SMOOTH-P5. Free and the Plan: the one table everything must agree with.
 * Spec 4.11.
 *
 * WHY A FILE. The upgrade page, Settings › Your plan and the Plan's own
 * acknowledgement each described the Plan in their own words, and C2 was
 * the result: a claim withdrawn from one page on 13 Aug stood on another
 * for six weeks. Now the pages RENDER from these rows, and
 * tools/verify-plan-claims.mjs drives the app on both tiers and checks
 * every row is true -- a row that cannot be proved is a row that goes.
 *
 * EACH ROW
 *   free / plan  what each tier gets, in the words a person reads
 *   same         true when both tiers get the same thing (Wellbeing and
 *                safety must always be `same`: they are never paywalled)
 *   says         for rows that differ: the sentence the upgrade page uses
 *   proof        which gate proves it, so the next person can check
 *
 * Website copy is not in this repo. When it is published, it is checked
 * against this file (the price already is: verify-price).
 */

export const TIER_TABLE = [
  {
    id: "home",
    area: "Home",
    free: "Choose any kind of session, or let the coach suggest one from your check-in",
    plan: "Three ways in: tell me what to do, I know what I want, or make it up as I go",
    says: "Home gives you three ways in: let the coach decide, say what you want, or make it up as you go.",
    proof: "verify-plan-claims 3.home, verify-home-plan",
  },
  {
    id: "checkin",
    area: "Check-in",
    same: true,
    free: "Three quick questions: energy, mood, and anything sore. The session changes when your day does",
    plan: "The same three questions",
    proof: "verify-checkin-three",
  },
  {
    id: "plan",
    area: "After you check in",
    free: "One suggested session with every exercise named, and Start",
    plan: "The full plan: swap any exercise, choose something different, see what you lifted last time",
    says: "After you check in you see the whole plan, and you can swap any exercise or choose something different.",
    proof: "verify-plan-claims 3.plan, verify-plan-list",
  },
  {
    id: "know-what",
    area: "I know what I want",
    free: "Any kind of session, chosen yourself",
    plan: "The same, plus sessions you have saved",
    says: "Sessions you put together can be saved and started again.",
    proof: "verify-plan-claims 3.saved, verify-saved1",
  },
  {
    id: "as-you-go",
    area: "Make it up as I go",
    free: "Not included. The activity log is there for anything you did",
    plan: "Log each move and set as you go, and it counts as a full session",
    says: "Make it up as you go: log each move and set as you do it, and it counts as a full session.",
    proof: "verify-plan-claims 3.freestyle, verify-freestyle",
  },
  {
    id: "arc",
    area: "Where you are heading",
    free: "Each session meets you where you are today",
    plan: "You tell the coach where you are heading, and it builds towards it",
    says: "You tell the coach where you're heading — something you want to be able to do, or just a direction — and it builds towards it.",
    proof: "verify-plan-claims 3.arc, verify-arc-door",
  },
  {
    id: "progress",
    area: "Progress",
    free: "Your sessions over the last 30 days, and a way to share them",
    plan: "Your arc read back to you: what has come up and your logged weights, over 30 or 90 days",
    says: "Progress reads your arc back to you: what has come up, and what your logged weights show.",
    proof: "verify-plan-claims 3.progress, verify-progress-agree",
  },
  {
    id: "coming-back",
    area: "Coming back",
    free: "A gentler start after time away",
    plan: "The same, and a session you left part-way carries on where you stopped",
    says: "Leave a session part-way and carry on later, exactly where you stopped.",
    proof: "verify-plan-claims 3.coming-back, verify-home-plan",
  },
  {
    id: "impact",
    area: "Where the five percent goes",
    free: "Each session you finish counts once",
    plan: "Each session you finish counts twice",
    says: "Every session you finish counts double towards where the five percent goes.",
    proof: "verify-plan-claims 3.impact (community-impact.js perSession)",
  },
  {
    id: "wellbeing",
    area: "Wellbeing",
    same: true,
    free: "Everything: breathing, mindful movement, the journal, In Step",
    plan: "Everything, the same",
    proof: "verify-plan-claims 3.wellbeing",
  },
  {
    id: "safety",
    area: "Safety",
    same: true,
    free: "Everything that keeps you safe, always",
    plan: "Everything, the same",
    proof: "verify-plan-claims 3.safety",
  },
];

/** The sentences the upgrade page offers: only what the Plan adds. */
export const PLAN_ADDS = (() => {
  // The arc first: it is what the Plan IS. Then what it changes about a
  // session, then the rest. Every differing row appears exactly once.
  const lead = ["arc", "progress", "plan", "coming-back"];
  const diff = TIER_TABLE.filter(r => !r.same);
  return [...lead.map(id => diff.find(r => r.id === id)), ...diff.filter(r => !lead.includes(r.id))]
    .filter(Boolean).map(r => r.says);
})();

/** What free keeps, said plainly beside the offer. */
export const FREE_KEEPS = TIER_TABLE.filter(r => r.same);

/** The table as an accessible HTML table, for Settings › Your plan. */
export function tierTableHtml(esc = s => String(s)) {
  // Explicit roles, because a phone lays the rows out as stacked cards
  // (settings.css) and a table restyled with display:block can lose its
  // semantics in some browsers. The column names ride on data-label so a
  // stacked cell still says which tier it is.
  return `
    <table class="tier-table" role="table">
      <caption class="tier-table__caption">Free and the Plan, side by side</caption>
      <thead role="rowgroup">
        <tr role="row"><th scope="col" role="columnheader"><span class="sr-only">What</span></th><th scope="col" role="columnheader">Free</th><th scope="col" role="columnheader">The Plan</th></tr>
      </thead>
      <tbody role="rowgroup">
        ${TIER_TABLE.map(r => `
          <tr role="row" data-tier-row="${r.id}">
            <th scope="row" role="rowheader">${esc(r.area)}</th>
            <td role="cell" data-label="Free">${esc(r.free)}</td>
            <td role="cell" data-label="The Plan">${esc(r.plan)}</td>
          </tr>`).join("")}
      </tbody>
    </table>`;
}
