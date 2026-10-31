/**
 * js/data/outside.js
 * 31 Oct 2026 v1
 *
 * STAGE PATH Session 8 (P-8 OUTSIDE-LOG; spec §5, mock-up v10's "Warm-up
 * before", "Cool-down after", "Just log it"). Behind Get stronger or Keep
 * moving, Outside: what to do before and after the activity named, and how
 * Log what I did names it. Data only (views/path.js reads it).
 *
 * Every warm-up and cool-down here is already in the library, written to
 * the entry standard and on the Library's Warm-ups and Recovery shelves
 * (sport-warmup-*, sport-cooldown-*), or one of the Stretch routines Graeme
 * approved on 28 Oct (L1 "After a run or ride"). Nothing new is written
 * here, so nothing waits for approval (P-9's own outside content can
 * replace these when it is written).
 *
 * The person chooses; the app never chooses an adaptation for them. Each is
 * played in the one player, each card with its own hurt-and-ache guidance.
 */
export const OUTSIDE_PLANS = Object.freeze({
  run:   { log: "Run",           warm: "sport-warmup-lower-body", cool: { practice: "sport-cooldown-running" } },
  bike:  { log: "Outdoor cycle", warm: "sport-warmup-lower-body", cool: { routine: "l1" } },
  walk:  { log: "Walk",          warm: "sport-warmup-lower-body", cool: { practice: "sport-cooldown-general" } },
  swim:  { log: "Swim",          warm: "sport-warmup-upper-body", cool: { practice: "sport-cooldown-general" } },
  sport: { log: "Other sport",   warm: "sport-warmup-general",    cool: { practice: "sport-cooldown-general" } },
  other: { log: "Other outdoor", warm: "sport-warmup-general",    cool: { practice: "sport-cooldown-general" } },
});
