/**
 * tools/verify-path-engine.mjs
 * 29 Oct 2026 v2
 *
 * v2 - Two E4 sentences reworded to what the app does (Graeme, 29 Oct,
 *   chose the words; path-engine.js v3): low energy is "Shorter than
 *   usual, with more time to settle at the end"; nothing else to say is
 *   "Mixed up from your last few sessions". Same rules, same strictness:
 *   exact words only.
 *
 * 28 Oct 2026 v1
 *
 * STAGE PATH Session 3 (P-3 ENGINE; blueprint v3 Part E; P-9c part 2).
 * The rule-based engine (js/data/path-engine.js): no AI, no network; every
 * suggestion explainable in one sentence from what the person told the app.
 *
 *  1. Today's suggestion (E2), first match wins, each rule driven.
 *  2. Adjustments (E4): never empty, exact words only.
 *  3. Likes and recency (E3) through the REAL builder (buildSession):
 *     liked movements come first when they fit, at most two a session,
 *     not when done in either of the last two sessions; "never" never
 *     appears; and with no likes stored (every Free user) the builder
 *     makes exactly the sessions it made before (compared against this
 *     builder with the likes lines taken out). No tier check: TIER-D.
 *  4. A swap is noted as "less often", never over a like or a "never".
 *  5. Programmes and routines by feeling, area, style and length; the
 *     coach's feeling suggestion (P-9c) and its programme pick; Surprise me.
 *  6. A fresh one for me (E5): for every feeling, 200 sequences obey the
 *     hard limits, fit the length, never repeat inside, never hold the
 *     breath, never include a "never" movement; ten in a row all differ.
 *     Stretch's fresh one is a builder request per area, and it builds.
 */
import { createRequire as __cr } from "node:module";
import { agreed } from "./agreed.mjs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><div id="main-content"></div>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const SB = await import(B + "session-builder.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");
const { PATH_MOVEMENTS } = await import(B + "data/exercises/path_movements.js");
let E = {};
try { E = await import(B + "data/path-engine.js"); } catch (e) { console.log("  (path-engine.js did not load: " + e.message + ")"); }

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${String(detail).slice(0, 600)}`); }
};
const fn = name => typeof E[name] === "function" ? E[name] : () => { throw new Error(name + " missing"); };
const safe = (f, ...a) => { try { return f(...a); } catch (e) { return { error: e.message }; } };
const ALL = [...EXERCISES, ...PATH_MOVEMENTS];
const byId = new Map(ALL.map(e => [e.id, e]));
const NOON = new Date(2026, 9, 28, 12, 0), EVENING = new Date(2026, 9, 28, 21, 0), MORNING = new Date(2026, 9, 28, 8, 0);
const ci = (energy, mood) => ({ energy, mood });

/** A seeded random, so the builder's choices can be compared run for run. */
function seeded(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const realRandom = Math.random;
function person(tier) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "T"); store.set("tier", tier);
  store.set("equipment", []); store.set("homeEquipment", []); store.set("sessionLocation", "home");
}

console.log("\nTEST 0 - the engine loaded, and needs no network");
ok("0a. path-engine.js exports its functions", ["suggestToday", "adjustmentsFor", "applyPrefs", "noteSwap", "programmesFor", "routinesFor", "freshSequence", "freshStretchRequest", "suggestFeeling", "pickProgramme", "pickSurprise", "buildRequest", "arcDoor"].every(n => typeof E[n] === "function"),
   Object.keys(E).join(", "));

console.log("\nTEST 1 - today's suggestion (E2): first match wins");
const st = (o) => safe(fn("suggestToday"), { place: "gym", arcDoor: "stronger", now: NOON, ...o });
let s = st({ checkin: ci(2, 6) });
ok("1a. Running on empty -> Move to feel better, Worn out, about 6 minutes", s.door === "feel" && s.feeling === "worn" && s.minutes === 6, JSON.stringify(s));
s = st({ checkin: ci(2, 2) });
ok("1b. Running on empty and struggling -> still Worn out (rule 1 first)", s.feeling === "worn", JSON.stringify(s));
for (const m of [2, 3]) { s = st({ checkin: ci(6, m) });
  ok(`1c. Mood ${m} -> Move to feel better, Calmer, 15 minutes`, s.door === "feel" && s.feeling === "calm" && s.minutes === 15, JSON.stringify(s)); }
s = st({ checkin: ci(3, 6) });
ok("1d. Low energy -> Keep moving, at the last place, full body, 10 minutes", s.door === "moving" && s.place === "gym" && s.sessionType === "full" && s.minutes === 10, JSON.stringify(s));
s = st({ checkin: ci(6, 6) });
ok("1e. Otherwise -> the arc's door at the last place, 25 minutes", s.door === "stronger" && s.place === "gym" && s.minutes === 25, JSON.stringify(s));
s = st({ checkin: ci(7, 6) });
ok("1f. Good energy -> 35 minutes", s.minutes === 35, JSON.stringify(s));
s = st({ checkin: ci(9, 9), arcDoor: "stretch" });
ok("1g. A Stretch arc -> the Stretch door, no place asked", s.door === "stretch" && s.place === null, JSON.stringify(s));
s = st({ checkin: null });
ok("1h. No check-in -> rule 4, and says so", s.door === "stronger" && /^I haven.t checked in with you/.test(s.reason || ""), JSON.stringify(s));
s = st({ checkin: ci(6, 6), week: { day: "tue", templateId: "t1", name: "Legs and core", mins: 30, place: "home" } });
ok("1i. A Your week day set for today comes first, adjustments still listed", s.fromWeek === true && s.minutes === 30 && (s.adjustments || []).length >= 1, JSON.stringify(s));
s = st({ checkin: ci(6, 6), sore: [{ id: "knee", score: 8 }] });
ok("1j. A sore area at Bad -> the existing Bad-day choice, nothing built", s.route === "bad-day" && /knee/i.test(s.reason || ""), JSON.stringify(s));
s = st({ checkin: ci(6, 6), arcDoor: null });
ok("1k. No arc -> Keep moving", s.door === "moving", JSON.stringify(s));
let reasonsOk = true;
for (const c of [ci(2, 6), ci(6, 2), ci(3, 6), ci(6, 6), null]) { const r = st({ checkin: c }); if (!r.reason || r.reason.split(/[.!?]\s/).length > 2) reasonsOk = false; }
ok("1l. every suggestion has one plain reason", reasonsOk);

console.log("\nTEST 2 - adjustments (E4): never empty, exact words");
const EXACT = [/^Shorter than usual, with more time to settle at the end$/, /^No countdown timers, go at your own pace$/, /^Left out moves that load your [a-z ]+$/, /^Easier options pointed out on cards that use your [a-z ]+$/,
  /^A quick check halfway: still okay\?$/, /^Easier options pointed out where something might niggle$/, /^More of [^,]+ and [^,]+, which you loved$/, /^More of [^,]+, which you loved$/,
  /^Left out [^,]+, as you asked$/, /^Less of [^,]+$/, /^Mixed up from your last few sessions$/];
const adj = o => safe(fn("adjustmentsFor"), o) || [];
const all = [];
const cases = [
  [{ checkin: ci(6, 6) }, a => a.length === 1 && /^Mixed up from your last few sessions$/.test(a[0]), "nothing to say -> the recency line"],
  [{ checkin: ci(3, 6) }, a => a.includes("Shorter than usual, with more time to settle at the end"), "low energy"],
  [{ checkin: ci(6, 3) }, a => a.includes("No countdown timers, go at your own pace"), "low mood"],
  [{ checkin: ci(6, 6), sore: [{ id: "knee", score: 6 }] }, a => a.includes("Left out moves that load your knee") && a.includes("Easier options pointed out on cards that use your knee") && a.includes("A quick check halfway: still okay?"), "quite sore"],
  [{ checkin: ci(6, 6), sore: [{ id: "lower-back", score: 4 }] }, a => a.includes("Easier options pointed out where something might niggle"), "a little sore"],
  [{ checkin: ci(6, 6), likedNames: ["Glute Bridge", "Bird Dog", "Plank"] }, a => a.includes("More of Glute Bridge and Bird Dog, which you loved"), "likes, two named"],
  [{ checkin: ci(6, 6), neverNames: ["Burpee"] }, a => a.includes("Left out Burpee, as you asked"), "never"],
  [{ checkin: ci(6, 6), lessNames: ["Plank"] }, a => a.includes("Less of Plank"), "less"],
];
for (const [o, test, label] of cases) { const a = adj(o); all.push(...(Array.isArray(a) ? a : [])); ok(`2a. ${label}`, Array.isArray(a) && a.length >= 1 && test(a), JSON.stringify(a)); }
ok("2b. every sentence is one of E4's, word for word", all.length > 0 && all.every(x => EXACT.some(re => re.test(x))), all.filter(x => !EXACT.some(re => re.test(x))).join(" | "));
let neverEmpty = true;
for (const c of [ci(2, 2), ci(3, 3), ci(6, 6), ci(9, 9), null]) for (const o of [{}, { sore: [{ id: "knee", score: 4 }] }]) { const r = safe(fn("suggestToday"), { checkin: c, place: "home", arcDoor: "moving", now: NOON, ...o }); if (r.route !== "bad-day" && !(r.adjustments || []).length) neverEmpty = false; }
ok("2c. no suggestion has an empty adjustments list", neverEmpty);

console.log("\nTEST 3 - likes and recency, through the real builder (E3)");
person("personal");
const mains = [];
Math.random = seeded(7);
for (let i = 0; i < 20; i++) { const b = SB.buildSession({ sessionType: "full", durationMins: 30 }); mains.push(b); }
Math.random = realRandom;
const seen = {}; for (const b of mains) for (const e of b.exercises || []) seen[e.id] = (seen[e.id] || 0) + 1;
const candidates = Object.entries(seen).sort((a, b) => a[1] - b[1]).map(([id]) => id).filter(id => byId.get(id)?.category === "strength");
const likedIds = candidates.slice(0, 3);
const neverId = Object.entries(seen).sort((a, b) => b[1] - a[1])[0]?.[0];
ok("3pc. positive control: a pool to test with (3 rarely-chosen movements to like, 1 to never)", likedIds.length === 3 && !!neverId && !likedIds.includes(neverId), JSON.stringify({ likedIds, neverId }));
const ALL_LIKES = Object.fromEntries(likedIds.map(id => [id, "2026-10-20"]));
function buildMany(tier, likes, never, seed, n = 30) {
  person(tier);
  store.set("likedMovements", likes);
  if (never) store.setExercisePreference(never, "avoid", "test");
  store.set("activityLog", []);
  Math.random = seeded(seed);
  const out = [];
  try { for (let i = 0; i < n; i++) out.push(SB.buildSession({ sessionType: "full", durationMins: 30 })); }
  finally { Math.random = realRandom; }
  return out;
}
const plan = buildMany("personal", ALL_LIKES, neverId, 11);
const likedPer = plan.map(b => (b.exercises || []).filter(e => likedIds.includes(e.id)).length);
const withLike = likedPer.filter(n => n > 0).length;
const base = buildMany("personal", {}, neverId, 11);
const baseWithLike = base.map(b => (b.exercises || []).filter(e => likedIds.includes(e.id)).length).filter(n => n > 0).length;
ok(`3a. on the Plan, liked movements come in far more often (${withLike} of 30 sessions, against ${baseWithLike} with no likes)`, withLike >= 20 && withLike > baseWithLike * 2, `${withLike} vs ${baseWithLike}`);
ok("3b. never more than two liked movements in a session", likedPer.every(n => n <= 2), likedPer.join(","));
ok("3c. a movement marked never does not appear", plan.every(b => !(b.exercises || []).some(e => e.id === neverId)));
// recency: liked movements done in either of the last two sessions are not put first
person("personal");
store.set("likedMovements", ALL_LIKES);
store.set("activityLog", [
  { id: "r1", type: "workout", completedAt: "2026-10-26T10:00:00Z", durationMins: 30, exerciseIds: likedIds.slice(0, 2) },
  { id: "r2", type: "workout", completedAt: "2026-10-27T10:00:00Z", durationMins: 30, exerciseIds: [likedIds[2]] },
]);
const pref = safe(fn("applyPrefs"), likedIds.map(id => byId.get(id)).concat(byId.get(neverId)), { liked: ALL_LIKES, recent: new Set(likedIds.slice(0, 2)), likedSoFar: 0 });
ok("3d. applyPrefs: a liked movement done in the last two sessions is not put first (only the one not done lately is)", Array.isArray(pref) && pref.length === 1 && pref[0].id === likedIds[2], JSON.stringify(pref?.map?.(e => e.id) || pref));
const prefAll = safe(fn("applyPrefs"), likedIds.map(id => byId.get(id)).concat(byId.get(neverId)), { liked: ALL_LIKES, recent: new Set(likedIds), likedSoFar: 0 });
ok("3d2. all the liked ones done lately: the whole pool comes back", Array.isArray(prefAll) && prefAll.length === 4);
const wornBalance = ALL.filter(e => (e.feelings || []).includes("worn") && e.balanceDemand && ["seated", "floor", "any"].includes(e.position)).map(e => e.id);
ok("3d3. (E5 note) no Worn out movement that balances is seated or lying, so the position rule already keeps balance out; noBalance is the second guard", wornBalance.length === 0, wornBalance.join(", "));
const pref2 = safe(fn("applyPrefs"), likedIds.map(id => byId.get(id)).concat(byId.get(neverId)), { liked: ALL_LIKES, recent: new Set(), likedSoFar: 0 });
ok("3e. applyPrefs: liked first when they fit", Array.isArray(pref2) && pref2.length === 3 && pref2.every(e => likedIds.includes(e.id)), JSON.stringify(pref2?.map?.(e => e.id) || pref2));
const pref3 = safe(fn("applyPrefs"), likedIds.map(id => byId.get(id)).concat(byId.get(neverId)), { liked: ALL_LIKES, recent: new Set(), likedSoFar: 2 });
ok("3f. applyPrefs: once two are in, the rest of the pool comes back", Array.isArray(pref3) && pref3.length === 4);
let rnd = 0; Math.random = () => { rnd++; return realRandom(); };
const same = safe(fn("applyPrefs"), likedIds.map(id => byId.get(id)), { liked: {}, recent: new Set(), likedSoFar: 0 });
Math.random = realRandom;
ok("3g. with no likes, applyPrefs hands back the same pool and draws no random number", Array.isArray(same) && same.length === 3 && rnd === 0, `random calls ${rnd}`);
// Without likes (every Free user: only the Plan's finish writes them), the
// builder makes exactly the sessions it made before. "Before" is this same
// file with the PATH-LIKES lines taken out, loaded beside it, sharing the
// one store, and fed the same random numbers.
const fs = await import("node:fs"); const os = await import("node:os"); const path = await import("node:path");
const src = fs.readFileSync(new URL("../js/session-builder.js", import.meta.url), "utf8");
const blocks = (src.match(/PATH-LIKES BEGIN[\s\S]*?PATH-LIKES END/g) || []).length;
const stripped = src.replace(/^[^\n]*PATH-LIKES BEGIN[\s\S]*?PATH-LIKES END[^\n]*\n/gm, "")
  .replace(/^import \{ applyPrefs, recentIds \} from "\.\/data\/path-engine\.js";\n/m, "")
  .replace(/from "\.\//g, `from "${new URL("../js/", import.meta.url).href}`);
const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "path-engine-")), "session-builder-before.mjs");
fs.writeFileSync(tmp, stripped);
const SB0 = await import("file://" + tmp);
ok("3h0. control: the likes lines were found (two blocks) and taken out of the copy", blocks === 2 && !/applyPrefs\(|recentIds\(|_hasLikes/.test(stripped), `${blocks} blocks`);
const runWith = (builder, tier, seed) => { person(tier); store.set("activityLog", []); Math.random = seeded(seed); try { return Array.from({ length: 30 }, () => (builder.buildSession({ sessionType: "full", durationMins: 30 }).exercises || []).map(e => e.id).join(",")); } finally { Math.random = realRandom; } };
for (const tier of ["free", "personal"]) {
  const now = runWith(SB, tier, 23), before = runWith(SB0, tier, 23);
  ok(`3h. ${tier === "free" ? "Free" : "The Plan"} with no likes: the same 30 sessions as the builder without the likes code`, now.length === 30 && now.every((x, i) => x === before[i]), now.findIndex((x, i) => x !== before[i]));
}
fs.rmSync(path.dirname(tmp), { recursive: true, force: true });

console.log("\nTEST 4 - a swap is noted as less often");
person("personal");
store.set("likedMovements", { "plank": "2026-10-20" });
store.setExercisePreference("burpee", "avoid", "test");
safe(fn("noteSwap"), store, "glute-bridge"); safe(fn("noteSwap"), store, "plank"); safe(fn("noteSwap"), store, "burpee");
const pf = store.get("exercisePreferences") || {};
ok("4a. a swapped movement becomes less often, source swap", pf["glute-bridge"]?.preference === "less" && pf["glute-bridge"]?.source === "swap", JSON.stringify(pf["glute-bridge"]));
ok("4b. a liked movement is not marked down by a swap", !pf.plank && store.get("likedMovements").plank, JSON.stringify(pf.plank));
ok("4c. a never stays never", pf.burpee?.preference === "avoid");

console.log("\nTEST 5 - programmes, routines, the coach's feeling, Surprise me");
const pf5 = safe(fn("programmesFor"), { feeling: "worn" });
ok("5a. Worn out lists its four programmes", Array.isArray(pf5) && pf5.length >= 4 && pf5.every(p => p.feeling === "worn"), JSON.stringify(pf5?.map?.(p => p.id)));
const pfy = safe(fn("programmesFor"), { feeling: "wake", style: "yoga", minutes: 10 });
ok("5b. a style and a length narrow the list", Array.isArray(pfy) && pfy.length >= 1 && pfy.every(p => p.style === "yoga" && p.minutes <= 10), JSON.stringify(pfy?.map?.(p => p.id)));
const rt = safe(fn("routinesFor"), { area: "legs", style: "pilates" });
ok("5c. routines by area and style", Array.isArray(rt) && rt.length === 1 && rt[0].id === "l4", JSON.stringify(rt?.map?.(r => r.id)));
const rtf = safe(fn("routinesFor"), { area: "back-hips", floor: false });
ok("5d. Not today on the floor: only routines without the floor", Array.isArray(rtf) && rtf.length >= 1 && rtf.every(r => r.floor === false || r.withoutFloor), JSON.stringify(rtf?.map?.(r => r.id)));
const sf = (c, now) => safe(fn("suggestFeeling"), { checkin: c, now });
ok("5e. no check-in, no feeling suggested", sf(null, NOON) === null);
let f = sf(ci(2, 6), NOON);
ok("5f. Running on empty -> Worn out, in their words", f?.feeling === "worn" && /running on empty/i.test(f.reason), JSON.stringify(f));
f = sf(ci(6, 2), NOON);
ok("5g. Struggling -> Calmer, in their words", f?.feeling === "calm" && /struggling/i.test(f.reason), JSON.stringify(f));
f = sf(ci(3, 6), MORNING);
ok("5h. Low energy in the morning -> Wake up", f?.feeling === "wake" && /low/i.test(f.reason), JSON.stringify(f));
f = sf(ci(3, 6), EVENING);
ok("5i. Low energy in the evening -> Ready for sleep, never Wake up after 6 pm", f?.feeling === "sleep", JSON.stringify(f));
f = sf(ci(6, 6), NOON);
ok("5j. Okay at noon -> Grounded, never Ready for sleep before 6 pm", f?.feeling === "ground", JSON.stringify(f));
const pp = safe(fn("pickProgramme"), { feeling: "calm", minutes: 12 });
ok("5k. How long have you got? marks the longest programme that fits, with its reason", pp?.programme?.minutes <= 12 && pp.programme.feeling === "calm" && /12 minutes/.test(pp.reason), JSON.stringify(pp));
const pp2 = safe(fn("pickProgramme"), { feeling: "calm", minutes: 3 });
ok("5l. nothing that short: the shortest, and says so", pp2?.programme?.minutes === 10 && /shortest/.test(pp2.reason), JSON.stringify(pp2));
let surpriseOk = true;
for (let i = 0; i < 60; i++) {
  const sp = safe(fn("pickSurprise"), { checkin: ci(2, 6), now: NOON, minutes: 20, doneIds: ["w1"] });
  if (!sp?.programme || sp.programme.feeling === "wake" || sp.programme.feeling === "sleep" || sp.programme.id === "w1" || sp.programme.minutes > 20) { surpriseOk = false; break; }
}
ok("5m. Surprise me: never Wake up on empty, never Ready for sleep before 6 pm, not one done this week, within the length", surpriseOk);

console.log("\nTEST 6 - a fresh one for me (E5)");
const LIMITS = {
  ground: { pos: ["standing", "seated", "any"], min: 6, max: 15 },
  calm:   { pos: ["standing", "seated", "floor", "any"], min: 6, max: 20 },
  worn:   { pos: ["seated", "floor", "any"], min: 5, max: 8 },
  wake:   { pos: ["standing", "seated", "floor", "any"], min: 6, max: 20 },
  sleep:  { pos: ["seated", "floor", "any"], min: 6, max: 15 },
};
const EXCLUDED = new Set(["box-breathing", "box-breathing-extended", "four-seven-eight-breathing", "energising-breath", "alternate-nostril-breathing"]);
const SLEEP_NEVER = new Set(["qg-heel-drops", "qg-tapping", "yoga-sun-salutation-b"]);
const NEVER = "seated-shoulder-rolls-warmup";
for (const [feeling, L] of Object.entries(LIMITS)) {
  const problems = [];
  const seqs = [];
  for (let i = 0; i < 200; i++) {
    const want = [5, 6, 8, 10, 12, 15, 20][i % 7];
    const q = safe(fn("freshSequence"), { feeling, minutes: want, never: new Set([NEVER]), liked: {}, recent: new Set(), rng: seeded(1000 + i) });
    if (!q || q.error) { problems.push("error " + (q && q.error)); break; }
    if (q.fallback) { if (!q.programme || !/There isn.t enough for a fresh one here yet/.test(q.message || "")) problems.push("bad fallback"); continue; }
    const steps = q.steps || [];
    const ids = steps.map(x => x.id);
    seqs.push(ids.join(","));
    const target = Math.min(L.max, Math.max(L.min, want));
    const sum = steps.reduce((a, x) => a + x.mins, 0);
    if (Math.abs(sum - target) > 1) problems.push(`length ${sum} for ${want}`);
    if (sum < L.min - 0.01 || sum > L.max + 0.01) problems.push(`outside ${L.min}-${L.max}: ${sum}`);
    if (new Set(ids).size !== ids.length) problems.push("repeat " + ids);
    if (steps.length < 5 || steps.length > 7) problems.push("shape " + steps.length);
    if (steps[0]?.role !== "arrive" || steps.at(-1)?.role !== "settle") problems.push("shape roles");
    for (const id of ids) {
      const e = byId.get(id);
      if (!e) { problems.push("unknown " + id); continue; }
      if (EXCLUDED.has(id)) problems.push("breath " + id);
      if (id === NEVER) problems.push("never " + id);
      if (!L.pos.includes(e.position)) problems.push(`position ${id} ${e.position}`);
      if (!(e.feelings || []).includes(feeling)) problems.push("not tagged " + id);
      if (feeling === "worn" && e.balanceDemand) problems.push("balance " + id);
      if (feeling === "sleep" && SLEEP_NEVER.has(id)) problems.push("energising " + id);
    }
    if (feeling === "wake") for (let k = 1; k < ids.length; k++) if (byId.get(ids[k])?.position === "floor" && byId.get(ids[k - 1])?.position === "floor") problems.push("two lying in a row");
    if (feeling === "worn" && (q.further || []).length) problems.push("a harder option offered");
  }
  ok(`6a. ${feeling}: 200 sequences inside every hard limit`, problems.length === 0, [...new Set(problems)].slice(0, 8).join("; "));
  let tenOk = true; for (let i = 0; i + 10 <= seqs.length; i += 10) if (new Set(seqs.slice(i, i + 10)).size !== 10) tenOk = false;
  ok(`6b. ${feeling}: ten in a row, all different`, seqs.length >= 150 && tenOk, `${seqs.length} built`);
}
const lk = safe(fn("freshSequence"), { feeling: "calm", minutes: 15, never: new Set(), liked: { "gm-gentle-sway": "2026-10-20", "upper-trap-stretch": "2026-10-20", "thread-the-needle": "2026-10-20" }, recent: new Set(), rng: seeded(5) });
const lkIds = (lk.steps || []).map(x => x.id);
ok("6c. liked movements come in, at most two", ["gm-gentle-sway", "upper-trap-stretch", "thread-the-needle"].filter(id => lkIds.includes(id)).length === 2, lkIds.join(","));
const fb = safe(fn("freshSequence"), { feeling: "worn", minutes: 6, never: new Set(ALL.filter(e => (e.feelings || []).includes("worn")).map(e => e.id)), liked: {}, recent: new Set(), rng: seeded(9) });
ok("6d. a pool that cannot fill it: the nearest ready-made, said plainly", fb.fallback === true && fb.programme?.feeling === "worn" && /^There isn.t enough for a fresh one here yet, so here.s /.test(fb.message || ""), JSON.stringify(fb).slice(0, 300));
const ZONES = { "whole": [], "neck-shoulders": ["neck-shoulders"], "back-hips": ["upper-back", "lower-back", "hips"], "legs": ["hamstrings", "quads", "calves-ankles"] };
person("personal");
for (const [area, zones] of Object.entries(ZONES)) {
  const req = safe(fn("freshStretchRequest"), { area, minutes: 15 });
  ok(`6e. Stretch, ${area}: a builder request for stretch with its zones`, req?.sessionType === "stretch" && JSON.stringify(req.zones) === JSON.stringify(zones) && req.durationMins === 15, JSON.stringify(req));
  store.set("sessionZoneFocus", req?.zones || []);
  const built = SB.buildSession({ sessionType: "stretch", durationMins: 15 });
  ok(`6f. Stretch, ${area}: the real builder builds it`, (built?.exercises || []).length >= 3, (built?.exercises || []).length);
}

console.log("\nTEST 7 - a request the routes can follow");
const rq = safe(fn("buildRequest"), safe(fn("suggestToday"), { checkin: ci(6, 6), place: "home", arcDoor: "stronger", now: NOON }), 25);
ok("7a. a built session goes to Today's plan with the session type, place and length", rq?.route === "coach-proposal" && rq.params?.requestedSessionType && rq.params?.requestedLocation === "home" && rq.params?.minutes === 25, JSON.stringify(rq));
const rq2 = safe(fn("buildRequest"), safe(fn("suggestToday"), { checkin: ci(2, 6), place: "home", arcDoor: "stronger", now: NOON }), 6);
ok("7b. Move to feel better goes to its door with the feeling", rq2?.route === "path" && rq2.params?.door === "feel" && rq2.params?.feeling === "worn", JSON.stringify(rq2));
ok("7c. arcDoor maps the arc's strands to a door", safe(fn("arcDoor"), ["leg-strength", "trunk-strength"]) === "stronger" && safe(fn("arcDoor"), ["hip-range", "hamstring-range"]) === "stretch" && safe(fn("arcDoor"), ["aerobic-base", "keep-walking"]) === "moving" && safe(fn("arcDoor"), ["pacing"]) === null);

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
