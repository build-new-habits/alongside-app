/**
 * tools/verify-mobility-door.mjs
 * 02 Oct 2026 v4
 *
 * v4 - W5-3 FLOOR-SITTING. The one yoga move this seated, off-the-floor
 *   person was given was Spine Stretch Forward, which sits you on the floor
 *   with the legs out long (now tagged floor). So every yoga style is now
 *   closed for them, each saying why: 3pc allows no open style for the yoga
 *   session as long as every closed one says so, and 3e asks that Pilates is
 *   closed. The core session still needs one open focus.
 *
 * 30 Sep 2026 v3
 *
 * v3 - W3-19 YOGA-EMPTY. A yoga style with nothing that fits now says so
 *   on its own card and cannot be chosen, so it gives no list to walk.
 *   "Every focus and length was walked" counts the styles that can be
 *   chosen (and still asks for four offered in all); a style that cannot
 *   be chosen must say why (verify-yoga-empty proves the words). Nothing
 *   else changed.
 *
 * v2 - P24. Yoga no longer shows a length card that would repeat the one
 *   before (a style that ran out of poses built the same list three times
 *   under three lengths). "Every focus and length was walked" now asks for
 *   at least one list per focus, which is every distinct session offered.
 *
 * P17, MOBILITY DOOR AND CORE SESSION (persona finding W2-12). "Start a
 * Mobility Session -- Yoga, Pilates, stretching, warmups" opened a Core
 * Session ("anti-lateral-flexion"). The core session and the yoga session
 * each built from their own pool and read neither capability nor
 * equipment: a foam roller for somebody with no kit, floor work for
 * somebody who cannot get down.
 *
 * Decision (accepted 28 Sep): the door goes to mobility; both use the
 * shared filters.
 *
 *   1. The door opens the builder's Mobility session (through today's
 *      check-in, as the Stretch card does).
 *   2. The core session, every focus and length, for somebody who needs
 *      seated work, cannot get to the floor and has no kit: everything it
 *      lists passes the builder's own personFilter().
 *   3. The yoga session, the same.
 *   4. Control: with every answer clear and a full kit, both still build.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: true, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(0), 0);
dom.window.requestAnimationFrame = globalThis.requestAnimationFrame;
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");
const { EQUIPMENT_CATEGORIES } = await import(B + "data/equipment.js");
const { router: realRouter } = await import(B + "router.js");
const SB = await import(B + "session-builder.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
let navs = [];
const nav = v => { navs.push(v); };
const rtr = { navigate: nav, back() {}, history: [] };
globalThis.window.router = rtr;
Object.defineProperty(globalThis, "router", { value: rtr, configurable: true, writable: true });
realRouter.navigate = nav;
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const byName = new Map(EXERCISES.map(e => [e.name, e]));
const ALL_KIT = EQUIPMENT_CATEGORIES.flatMap(c => (c.items || c.options || []).map(i => i.id || i)).filter(Boolean);

function person(careful) {
  if (careful === "middle") {
    localStorage.clear(); store.init();
    store.set("onboardingComplete", true); store.set("tier", "personal"); store.set("name", "Sam");
    store.set("conditions", []); store.set("conditionPainScores", {});
    store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
    store.set("equipment", []);
    store.set("capability", { ...(store.get("capability") || {}), askedAt: new Date().toISOString(),
      balanceWorry: "yes", chairRise: "yes", legPower: "full", floorAccess: "yes", bothFeet: "no" });
    return;
  }
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", "personal"); store.set("name", "Sam");
  store.set("conditions", []); store.set("conditionPainScores", {});
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("equipment", careful ? [] : ALL_KIT);
  store.set("capability", { ...(store.get("capability") || {}), askedAt: new Date().toISOString(),
    ...(careful
      ? { balanceWorry: "yes", chairRise: "no", legPower: "limited", floorAccess: "no", bothFeet: "no" }
      : { balanceWorry: "no", chairRise: "yes", legPower: "full", floorAccess: "yes", bothFeet: "yes" }) });
}

// Walk a focus → length → the moves it gives, through the view's own
// buttons. The yoga session lists them on its overview; the core session
// shows them one at a time, so it is played through, skipping each.
async function listed(mod, focusId, mins) {
  const paint = () => { main.innerHTML = mod.render(); try { mod.onMount(); } catch {} };
  const q = sel => main.querySelector(sel);
  paint();
  const f = q(`[data-focus="${focusId}"]`); if (!f) return null;
  click(f); await wait(10); paint();
  if (!q(`[data-mins]`) && q("[data-target]")) { click(q("[data-target]")); await wait(10); paint(); }
  const d = q(`[data-mins="${mins}"]`); if (!d) return null;
  click(d); await wait(10); paint();
  const over = [...main.querySelectorAll(".gym-exercise-name")].map(n => n.textContent.trim());
  if (over.length) return over;
  const names = [];
  click(q("#cs-start-btn, #cs-begin-btn")); await wait(10); paint();
  for (let i = 0; i < 40; i++) {
    const h = q("h1.exercise-name");
    if (h) { names.push(h.textContent.trim()); click(q("#cs-skip-btn") || q("#cs-next-btn") || q("#cs-done-btn")); await wait(10); paint(); continue; }
    const r = q("#cs-rest-skip-btn"); if (r) { click(r); await wait(10); paint(); continue; }
    const b = q("#cs-begin-btn, #cs-start-btn"); if (b) { click(b); await wait(10); paint(); continue; }
    break;
  }
  return names;
}
let _n = 0;
const fresh = path => import(B + path + `?w=${++_n}`);   // a view's state is module-level
async function sweep(path, careful) {
  person(careful);
  const allows = SB.personFilter({ equipment: store.get("equipment") });
  const out = { lists: 0, names: 0, bad: [], unknown: [], empties: [], honest: 0 };
  let mod = await fresh(path);
  main.innerHTML = mod.render(); try { mod.onMount(); } catch {}
  const ids = [...main.querySelectorAll("[data-focus]")].map(b => b.dataset.focus);
  // v3. A style that cannot be chosen gives no list; it must say why.
  const closed = [...main.querySelectorAll("[data-focus]")].filter(b => b.disabled).map(b => b.dataset.focus);
  const closedSaid = [...main.querySelectorAll("[data-focus]")].filter(b => b.disabled && /nothing here fits/i.test(b.textContent)).length;
  for (const f of ids.filter(x => !closed.includes(x))) {
    mod = await fresh(path);
    main.innerHTML = mod.render(); try { mod.onMount(); } catch {}
    click(main.querySelector(`[data-focus="${f}"]`)); await wait(10); main.innerHTML = mod.render(); try { mod.onMount(); } catch {}
    if (!main.querySelector("[data-mins]") && main.querySelector("[data-target]")) { click(main.querySelector("[data-target]")); await wait(10); main.innerHTML = mod.render(); try { mod.onMount(); } catch {} }
    const mins = [...main.querySelectorAll("[data-mins]")].map(b => b.dataset.mins);
    for (const m of mins) {
      person(careful);
      mod = await fresh(path);
      const names = await listed(mod, f, m);
      if (names === null) continue;
      out.lists++;
      if (!names.length) {
        out.empties.push(`${f}/${m}`);
        if (/Nothing in this (focus|style) fits what you've told me/.test(main.textContent) && main.querySelector("#cs-refocus-btn, #ys-refocus-btn")) out.honest++;
      }
      for (const n of names) {
        out.names++;
        const e = byName.get(n) || EXERCISES.find(x => x.id === "yoga-corpse-pose" && n === "Savasana");
        if (!e) { out.unknown.push(n); continue; }
        if (!allows(e)) out.bad.push(`${f}/${m}: ${n}`);
        out.all = (out.all || []).concat(e.id);
      }
    }
  }
  return { ...out, focuses: ids.filter(x => !closed.includes(x)), closed, closedSaid };
}

// ── 1. THE DOOR ─────────────────────────────────────────────────────────
console.log("\nTEST 1 - \"Start a Mobility Session\" opens a mobility session");
{
  const { MobilityConditioningView } = await import(B + "views/mobility-conditioning.js");
  person(true);
  main.innerHTML = ""; navs = []; MobilityConditioningView(rtr).mount(main); await wait(10);
  const card = main.querySelector("#mc-start-session");
  ok("1pc. the card is there", !!card && /Mobility/.test(card.textContent));
  click(card); await wait(10);
  const pre = store.get("sessionBuilderPreselect") || {};
  ok("1a. not checked in today: through the check-in, to the builder, as Mobility",
     navs.at(-1) === "checkin" && store.get("pendingDoorRoute") === "session-builder" && pre.type === "mobility",
     `${JSON.stringify(navs)} pending ${store.get("pendingDoorRoute")} preselect ${JSON.stringify(pre)}`);
  ok("1b. never the core session", !navs.includes("core-session"), JSON.stringify(navs));
  store.set("lastCheckin", { energy: 6, mood: 6, timestamp: new Date().toISOString() });
  navs = []; main.innerHTML = ""; MobilityConditioningView(rtr).mount(main); await wait(10);
  click(main.querySelector("#mc-start-session")); await wait(10);
  ok("1c. checked in: straight to the builder, as Mobility", navs.at(-1) === "session-builder" && (store.get("sessionBuilderPreselect") || {}).type === "mobility", JSON.stringify(navs));
  const allows = SB.personFilter({ equipment: [] });
  const s = SB.buildSession({ sessionType: "mobility", durationMins: 20, equipmentOverride: [] });
  const off = s.exercises.filter(e => !allows(EXERCISES.find(x => x.id === e.id) || e)).map(e => e.name);
  ok("1d. and the Mobility session it builds for this person passes the shared filters", s.exercises.length > 0 && off.length === 0, `${s.exercises.length} moves; off: ${off.join(", ")}`);
}

// ── 2 & 3. CORE AND YOGA ────────────────────────────────────────────────
for (const [label, path, T] of [["core session", "views/core-session.js", "2"], ["yoga session", "views/yoga-session.js", "3"]]) {
  console.log(`\nTEST ${T} - the ${label}, for somebody seated, off the floor, with no kit`);
  const r = await sweep(path, true);
  ok(`${T}pc. every focus and length that can be chosen was walked`, r.focuses.length + r.closed.length >= 4 && (r.focuses.length >= 1 || T === "3") && r.lists >= r.focuses.length && r.closedSaid === r.closed.length,
     `${r.focuses.join(",")} (closed: ${r.closed.join(",") || "none"}); ${r.lists} lists, ${r.names} moves`);
  if (T === "3") ok("3e. Pilates is closed for somebody off the floor (W5-3)", r.closed.includes("pilates"), r.closed.join(","));
  ok(`${T}pc2. every listed move is a library entry`, r.unknown.length === 0, r.unknown.join(", "));
  ok(`${T}a. nothing listed that the shared filters would keep from them`, r.bad.length === 0, `${r.bad.length}: ${r.bad.slice(0, 8).join("; ")}`);
  ok(`${T}a2. where nothing fits, it says so and offers another choice`, r.honest === r.empties.length, `${r.honest} of ${r.empties.length} empty lists: ${r.empties.join(",")}`);
  console.log(`        (${r.lists} lists, ${r.names} moves, ${r.empties.length} with nothing that fits)`);
  const mid = await sweep(path, "middle");
  ok(`${T}d. no foam roller, no Warrior III, no Tree Pose for them`,
     !(mid.all || []).some(id => /foam-roll|warrior-3|warrior-iii|tree-pose/.test(id)), (mid.all || []).filter(id => /foam-roll|warrior|tree/.test(id)).join(", "));
  ok(`${T}c. no kit and a balance worry (the persona's case): sessions, and none of them breaks the filters`,
     mid.names > 0 && mid.bad.length === 0, `${mid.names} moves; ${mid.bad.slice(0, 6).join("; ")}`);
  const o = await sweep(path, false);
  ok(`${T}b. control: clear answers and a full kit, every list has moves`, o.lists >= o.focuses.length && o.empties.length === 0 && o.names > 0, `${o.lists} lists, empties ${o.empties.join(",")}`);
}

console.log("");
if (fails) { console.log(`MOBILITY-DOOR: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`MOBILITY-DOOR: all ${passes} assertions pass\n`);
process.exit(0);
