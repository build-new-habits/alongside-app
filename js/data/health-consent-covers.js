/**
 * js/data/health-consent-covers.js
 * 02 Oct 2026 v1
 *
 * W4-26 CONSENT-VERSION-READERS. The one test of whether a recorded health
 * consent still covers what the app keeps (Graeme, 02 Oct: asked again only
 * when what it covers changes). No imports, so store.js and restore.js can
 * read it as data/health-consent.js does, without an import cycle. Those
 * two checked `given === true` alone, so a consent given before the last
 * change still let a lift note be kept and a file's health answers come in.
 *
 *   2026-10-01  separate health consent (PT-2, LEGAL-TRUE)
 *   2026-10-02  shorter tick, same answers, same use: wording only
 */
export const HEALTH_CONSENT_COVERS_FROM = "2026-10-01";

/** True when this consent record is given and still covers what is kept. */
export function consentCovers(health) {
  const v = health && health.version;
  return !!health && health.given === true &&
    typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && v >= HEALTH_CONSENT_COVERS_FROM;
}
