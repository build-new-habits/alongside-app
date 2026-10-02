/**
 * tools/verify-consent-versions.mjs
 * 02 Oct 2026 v2
 *
 * v2 - Graeme, 02 Oct: a consent is asked again only when what it covers
 *   changes, not for a change of wording (3e); the wording seen is still
 *   recorded (3f).
 *
 * 02 Oct 2026 v1
 *
 * W4-13 CONSENT-VERSIONS (Wave 4 persona trace, 2.4).
 *
 * The policy-change screen listed one fixed set of changes, whatever the
 * person had agreed to: "Your health answers now have their own consent"
 * to somebody who gave that consent on day one. A change to the health
 * consent's wording never asked again (consent.health.version was stored
 * and read by nothing). And from the policy screen's summary, the house
 * button went to Today, which sent them straight back: a loop.
 *
 *   1. Changes are listed per version, only those since the one agreed.
 *   2. On the screen: a change the person already has is not listed.
 *   3. A new health-consent version asks again, and says the wording
 *      changed. The current version does not ask.
 *   4. No house button while the policy (or first consent) is waiting,
 *      on the policy screen or the summary it opens.
 */
import { createRequire as __cr } from "node:module";
import { agreed } from "./agreed.mjs";
import { oneScreen } from "./one-screen.mjs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM(`<!doctype html><div id="app"><main id="main-content"></main></div>
  <nav id="bottom-nav"></nav><button id="hidden-nav-home-btn" class="hidden"></button>`, { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(0), 0);
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.fetch = dom.window.fetch = async () => ({ ok: false, json: async () => ({}) });

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const CV = await import(B + "data/consent-version.js");
const HC = await import(B + "data/health-consent.js");
const { ConsentUpdateView } = await import(B + "views/consent-update.js");
const { HealthConsentView } = await import(B + "views/health-consent.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const router = { navigate() {}, back() {} };

// ── 1. PER VERSION ──────────────────────────────────────────────────────
console.log("\nTEST 1 - changes listed per version, only since the one agreed");
const H = [{ version: "2026-08-11", changes: ["a1"] }, { version: "2026-09-15", changes: ["b1", "b2"] }, { version: "2026-10-01", changes: ["c1"] }];
const since = (v) => (CV.changesSince?.(v, H) || []).map(c => typeof c === "string" ? c : c.text);
ok("1a. agreed at the version before: only the newest version's changes", JSON.stringify(since("2026-09-15")) === '["c1"]', JSON.stringify(since("2026-09-15")));
ok("1b. agreed two versions back: both newer versions'", JSON.stringify(since("2026-08-11")) === '["b1","b2","c1"]', JSON.stringify(since("2026-08-11")));
ok("1c. never recorded: everything", JSON.stringify(since(null)) === '["a1","b1","b2","c1"]', JSON.stringify(since(null)));
ok("1d. the current version: nothing", JSON.stringify(since("2026-10-01")) === "[]");
ok("1e. the shipped history ends at the shipped version", (CV.POLICY_HISTORY || []).at(-1)?.version === CV.POLICY_VERSION);

// ── 2. ON THE SCREEN ────────────────────────────────────────────────────
console.log("\nTEST 2 - a change the person already has is not listed");
function older(healthGiven) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true);
  store.set("consent.policyVersion", "2026-08-11");
  if (!healthGiven) store.set("consent.health", { given: null, at: null, version: null, withdrawnAt: null });
}
const screen = () => { const el = oneScreen(document.createElement("div")); ConsentUpdateView(router).mount(el); return el; };
older(true);
ok("2pc. the policy screen is asked for", CV.consentUpdateNeeded());
let s = txt(screen());
ok("2a. health consent given on day one: not told it is new", !/health answers now have their own consent/i.test(s), s.slice(0, 300));
older(false);
s = txt(screen());
ok("2b. control: never given it, so it is listed", /health answers now have their own consent/i.test(s), s.slice(0, 300));

// ── 3. HEALTH CONSENT VERSION ───────────────────────────────────────────
console.log("\nTEST 3 - a new health-consent version asks again");
localStorage.clear(); store.init(); agreed(store); store.set("onboardingComplete", true);
ok("3pc. the current version: nothing to ask", !HC.healthConsentNeeded() && HC.guardRoute("checkin") === null);
store.set("consent.health.version", "2026-09-01");
ok("3a. an older version: asked again", HC.healthConsentNeeded() === true);
ok("3b. before the next health question", HC.guardRoute("checkin") === "health-consent");
const hc = oneScreen(document.createElement("div")); HealthConsentView(router).mount(hc);
ok("3c. and it says what it covers has changed", /changed/i.test(txt(hc)), txt(hc).slice(0, 200));
// Graeme, 02 Oct: ask again only when what the consent covers changes. The
// shorter tick (W4-19) covers the same answers for the same use, so a
// consent given to the wording before it stands; the wording each person saw
// is still recorded.
store.set("consent.health.version", "2026-10-01");
ok("3e. a consent to the longer tick (same answers, same use) is not asked again", HC.healthConsentNeeded() === false && HC.guardRoute("checkin") === null);
HC.giveHealthConsent();
ok("3f. a new consent records the wording shown now", store.get("consent.health.version") === HC.HEALTH_CONSENT_VERSION && HC.HEALTH_CONSENT_VERSION === "2026-10-02");
store.set("consent.health", { given: null, at: null, version: null, withdrawnAt: null });
const hc2 = oneScreen(document.createElement("div")); HealthConsentView(router).mount(hc2);
ok("3d. control: never asked, it does not say anything changed", !/has changed|have changed/i.test(txt(hc2)), txt(hc2).slice(0, 200));

// ── 4. NO HOUSE WHILE WAITING ───────────────────────────────────────────
console.log("\nTEST 4 - no house button while the policy is waiting");
const { router: R } = await import(B + "router.js");
const house = () => !document.getElementById("hidden-nav-home-btn").classList.contains("hidden");
older(true);
await R._mountView("consent-update"); await wait(10);
ok("4a. on the policy screen: no house", !house());
await R._mountView("privacy"); await wait(10);
ok("4b. on the summary it opens: no house (it led straight back)", !house());
localStorage.clear(); store.init(); agreed(store); store.set("onboardingComplete", true);
await R._mountView("privacy"); await wait(10);
ok("4c. control: nothing waiting, the summary has its house", house());

console.log(`\nCONSENT-VERSIONS: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
