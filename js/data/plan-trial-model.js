/**
 * js/data/plan-trial-model.js
 * 27 Nov 2026 v1
 *
 * Row 17 / P-40, Try the Plan, S1. The trial's record, cleaned on load
 * (Schema v1.144). Pure: reads nothing, so the store can import it.
 *
 *   planTrial { startedAt, endsOn, noticedAt, endedAt, endedHow, offeredAt }
 */

const ISO = v => (typeof v === "string" && !Number.isNaN(Date.parse(v)) ? v : null);
const DAY = v => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);

export function sanitizePlanTrial(o) {
  if (!o || typeof o !== "object" || Array.isArray(o)) return {};
  const out = {};
  const startedAt = ISO(o.startedAt), endsOn = DAY(o.endsOn);
  if (startedAt && endsOn) { out.startedAt = startedAt; out.endsOn = endsOn; }
  if (out.startedAt && ISO(o.noticedAt)) out.noticedAt = o.noticedAt;
  if (out.startedAt && ISO(o.endedAt)) {
    out.endedAt = o.endedAt;
    out.endedHow = o.endedHow === "stopped" ? "stopped" : "ended";
  }
  if (ISO(o.offeredAt)) out.offeredAt = o.offeredAt;
  return out;
}
