/**
 * tools/verify-w7-warmup.mjs
 * 24 Nov 2026 v1
 *
 * W7-2 LIFTER-WARMUP (Wave 7 persona trace, 24 Nov 2026). For someone who
 * answered every ability question with no limit, 4 to 15% of warm-up moves
 * were still seated versions (Seated Calf Raise, Seated Heel and Toe Raise,
 * Ankle Alphabet...), which exist for people who need a chair. The warm-up
 * now prefers standing moves for that person: a preference, never a rule
 * (a slot with only seated options still fills), and anyone who needs to
 * sit keeps them at full weight (2a). Warm-up only: a seated cable row or
 * leg curl in the main part is right (2b).
 *
 * The trace first saw Seated Marching OPEN a lifter's session. That came
 * from the trace's own seed leaving two ability answers blank, so the app
 * played safe, by design (silence is never read as capability). With the
 * answers given, the opening move was already standing on v736: 1a is a
 * guard, not a red-first assertion.
 *
 * Drives buildSession(), the builder every plan screen uses.
 * Red on alongside-v736: 1b and every 1c.
 */
import { createRequire as __cr } from "node:module";
import { agreed } from "./agreed.mjs";
const { JSDOM } = __cr(import.meta.url)("jsdom");
const dom = new JSDOM('<!doctype html><div id="main-content"></div>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const SB = await import(B + "session-builder.js");
const log = console.log; console.log = (...a) => { if (!/Store initialised/.test(String(a[0]))) log(...a); };

let fails = 0, passes = 0;
const ok = (n, c, d = "") => { log(`  ${c ? "PASS" : "FAIL"}  ${n}`); if (c) passes++; else { fails++; if (d) log(`        ${String(d).slice(0, 400)}`); } };

const FREE = { balanceWorry: "no", chairRise: "yes", legPower: "full", floorAccess: "yes", bothFeet: "yes", askedAt: "2026-11-01T00:00:00Z" };
const CHAIR = { balanceWorry: "sometimes", chairRise: "no", legPower: "limited", floorAccess: "no", bothFeet: "no", askedAt: "2026-11-01T00:00:00Z" };
function person(cap, place) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("tier", "personal");
  store.set("lifestyle", { activityLevel: "active" }); store.set("capability", cap);
  if (place === "gym") {
    store.set("equipment", ["gym"]); store.set("sessionLocation", "gym");
    store.set("gymEquipment", ["barbell", "dumbbells", "cable-machine", "bench", "pull-up-bar", "leg-press", "kettlebells"]);
  } else { store.set("equipment", []); store.set("homeEquipment", []); store.set("sessionLocation", "home"); }
}
function run(cap, place, type, n = 120) {
  let warm = 0, seated = 0, firstSeated = 0, mainSeated = 0, built = 0;
  for (let i = 0; i < n; i++) {
    person(cap, place);
    const s = SB.buildSession({ sessionType: type, durationMins: 40, location: place });
    const ex = s?.exercises || []; if (ex.length) built++;
    const w = ex.filter(e => e.section === "warmup");
    warm += w.length; seated += w.filter(e => e.position === "seated").length;
    if (w[0]?.position === "seated") firstSeated++;
    mainSeated += ex.filter(e => e.section === "main" && e.position === "seated").length;
  }
  return { warm, seated, firstSeated, mainSeated, built, n };
}

log("\nTEST 0 - self-check: the fixture reaches the builder and the capability rule");
person(FREE, "gym");
const cp = store.capabilityProfile();
ok("0a. a person with no limits reads as unrestricted (asked, no chair, legs loadable, floor, balance)", cp.asked === true && cp.needsSeated === false && cp.legsLoadable === true && store.get("capability.floorAccess") === "yes" && store.get("capability.balanceWorry") === "no", JSON.stringify(cp));
const g = run(FREE, "gym", "lower");
ok("0b. builds come back with a warm-up", g.built === g.n && g.warm >= g.n * 2, JSON.stringify(g));

log("\nTEST 1 - no limits: the warm-up stands");
ok("1a. gym, lower body: never opens on a seated move", g.firstSeated === 0, JSON.stringify(g));
ok("1b. gym, lower body: no seated warm-up moves", g.seated === 0, JSON.stringify(g));
for (const [place, type] of [["gym", "upper"], ["gym", "full"], ["home", "lower"], ["home", "full"]]) {
  const r = run(FREE, place, type, 60);
  ok(`1c. ${place}, ${type}: no seated warm-up moves`, r.seated === 0 && r.built === r.n, JSON.stringify(r));
}

log("\nTEST 2 - controls: nothing taken from people who need to sit, and main unchanged");
const c = run(CHAIR, "home", "full", 60);
ok("2a. someone who needs a chair still gets seated warm-ups", c.seated > 0 && c.built === c.n, JSON.stringify(c));
const u = run(FREE, "gym", "upper", 60);
ok("2b. the main part still uses seated lifts where they fit (warm-up only)", u.mainSeated > 0, JSON.stringify(u));

log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
