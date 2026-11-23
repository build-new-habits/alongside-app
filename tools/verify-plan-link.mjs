/**
 * tools/verify-plan-link.mjs
 * 23 Nov 2026 v1
 *
 * P-44 THE PHYSIO LINK, S1 SCHEMA AND LINK (spec
 * docs/specs/alongside_physio-link_23nov2026_v1.md; store.js v130,
 * js/data/plan-link.js v1).
 *
 *   1  ownPrevious: default null; kept 30 days; anything else null;
 *      setOwnPrevious; Delete my health answers takes its notes.
 *   2  The link: made from My exercises and read back the same, from a
 *      whole link, its fragment or the code; a 25-exercise list stays
 *      short enough for a QR code; it never throws.
 *   3  The rules, on both sides: limits refused, markup removed, a link
 *      changed by hand refused with the one sentence.
 *   4  What goes out: the lists chosen; notes and a name only when asked.
 *   5  What changed, in words: amounts, names, notes, added, taken out;
 *      only the lists sent back; notes not sent are not changes.
 *   6  Using them: only what was chosen; notes only with the health
 *      consent; a library id only when the library has it; the list kept.
 *
 * Red on alongside-v729 (no ownPrevious, no plan-link.js).
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><body><div id="app"><main id="main-content"></main></div></body>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} });
globalThis.history = dom.window.history; globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const PL = await import(B + "data/plan-link.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const J = JSON.stringify;
const day = n => new Date(Date.now() - n * 864e5).toISOString();

const OWN = [
  { id: "px-1-0", exerciseId: "glute-bridge", name: "Glute bridge", sets: 3, reps: "12", group: "Gym A", notes: "squeeze at the top", completedToday: false, completedAt: null, active: true },
  { id: "px-1-1", name: "Clamshell", sets: 2, reps: "15 each side", group: "Gym A", active: true },
  { id: "px-1-2", name: "Dead bug", sets: 2, reps: "8 each side", group: "Gym A", active: true },
  { id: "px-2-0", name: "Cat-cow", sets: 1, reps: "10", group: "Evening", active: true },
  { id: "px-3-0", name: "Wall sit", sets: 3, reps: "30 seconds", active: true },
];

console.log("\nTEST 1 - ownPrevious");
localStorage.clear(); store.init();
ok("1a. default null", store.get("ownPrevious") === null);
// find the store's own key, whatever it is called
localStorage.clear(); store.init(); store.set("name", "probe");
const storeKey = Object.keys(localStorage).find(k => (localStorage.getItem(k) || "").includes("probe"));
const loadAs = v => { localStorage.clear(); localStorage.setItem(storeKey, J({ onboardingComplete: true, ownPrevious: v })); store.init(); return store.get("ownPrevious"); };
ok("1pc. the store's key found", !!storeKey, storeKey);
const at3 = day(3);
ok("1b. a list from 3 days ago is kept as it was", J(loadAs({ at: at3, list: OWN })) === J({ at: at3, list: OWN }));
ok("1c. 31 days ago: null", loadAs({ at: day(31), list: OWN }) === null);
ok("1d. in the future: null", loadAs({ at: new Date(Date.now() + 864e5).toISOString(), list: OWN }) === null);
ok("1e. not a date-time: null", loadAs({ at: "Monday", list: OWN }) === null);
ok("1f. an empty list, or one without names: null", loadAs({ at: day(1), list: [] }) === null && loadAs({ at: day(1), list: [{ id: "x" }] }) === null);
ok("1g. over 200 entries: null", loadAs({ at: day(1), list: Array.from({ length: 201 }, (_, i) => ({ id: "p" + i, name: "n" })) }) === null);
ok("1h. not an object: null", loadAs("yes") === null && loadAs([OWN]) === null);
localStorage.clear(); store.init();
store.setOwnPrevious(OWN);
const op = store.get("ownPrevious");
ok("1i. setOwnPrevious keeps the list, with when", op && op.list.length === 5 && Math.abs(Date.parse(op.at) - Date.now()) < 5000);
store.deleteHealthAnswers();
ok("1j. Delete my health answers takes its notes", store.get("ownPrevious")?.list.every(e => !("notes" in e)) && store.get("ownPrevious").list.length === 5);
store.setOwnPrevious(null);
ok("1k. setOwnPrevious(null) clears it", store.get("ownPrevious") === null);

console.log("\nTEST 2 - the link");
const out = PL.outFromOwn(OWN, { at: "2026-11-23T20:00:00.000Z" });
const code = await PL.encodePlan(out);
ok("2a. the code says its version", /^v1\.[A-Za-z0-9_-]+$/.test(code), code.slice(0, 20));
const link = PL.linkFor("https://buildnewhabits.co.uk/edit-plan/", code);
ok("2b. the link carries it after the #", link === `https://buildnewhabits.co.uk/edit-plan/#${code}`);
for (const [what, text] of [["a whole link", link], ["its fragment", "#" + code], ["the code", code], ["with spaces round it", `  ${link}\n`]]) {
  const r = await PL.decodePlan(text);
  ok(`2c. read back from ${what}`, r.ok && J(r.plan) === J(out), J(r).slice(0, 120));
}
const big = Array.from({ length: 25 }, (_, i) => ({ id: `px-1794424682372-${i}`, name: `Supine hamstring stretch ${i}`, sets: 3, reps: "45 seconds each side", group: i < 12 ? "Evening Release" : "Session A" }));
const bigLink = PL.linkFor("https://buildnewhabits.co.uk/edit-plan/", await PL.encodePlan(PL.outFromOwn(big)));
ok("2d. 25 exercises: under 1,800 characters (a QR code a phone can read)", bigLink.length < 1800, String(bigLink.length));
let threw = false;
for (const junk of [null, "", "hello", "v1.", "v1.!!!!", "v2.abcdefgh", "#v1.AAAAAAAAAAAA", "x".repeat(30000), { a: 1 }]) {
  try { const r = await PL.decodePlan(junk); if (r.ok || r.why !== PL.NOT_COMPLETE) threw = true; } catch { threw = true; }
}
ok("2e. anything else: refused with the one sentence, never thrown", !threw);
const tampered = code.slice(0, -6) + (code.slice(-6) === "AAAAAA" ? "BBBBBB" : "AAAAAA");
ok("2f. a link changed by hand: refused", !(await PL.decodePlan(tampered)).ok);

console.log("\nTEST 3 - the rules");
const plan = (lists, extra = {}) => ({ t: "out", at: "2026-11-23T20:00:00.000Z", lists, ...extra });
const one = (x, g = "A") => ({ g, x });
ok("3a. 60 exercises: fine; 61: refused", !!PL.checkPlan(plan([one(Array.from({ length: 60 }, (_, i) => ({ n: "E" + i })))])) && !PL.checkPlan(plan([one(Array.from({ length: 61 }, (_, i) => ({ n: "E" + i })))])));
ok("3b. 12 lists: fine; 13: refused", !!PL.checkPlan(plan(Array.from({ length: 12 }, (_, i) => one([{ n: "E" }], "L" + i)))) && !PL.checkPlan(plan(Array.from({ length: 13 }, (_, i) => one([{ n: "E" }], "L" + i)))));
ok("3c. sets 1 to 20, whole: 0, 21 and 2.5 refused", [0, 21, 2.5, "3"].every(s => !PL.checkPlan(plan([one([{ n: "E", s }])]))) && !!PL.checkPlan(plan([one([{ n: "E", s: 20 }])])));
const marked = PL.checkPlan(plan([one([{ n: "<b>Bridge</b>", r: "<script>12", nt: "a<i>b" }], "<Gym>")]));
ok("3d. markup removed from every word", J(marked).indexOf("<") < 0 && marked.lists[0].x[0].n === "bBridge/b" && marked.lists[0].g === "Gym");
const long = PL.checkPlan(plan([one([{ n: "N".repeat(99), r: "R".repeat(99), nt: "T".repeat(999) }])], { by: "B".repeat(99) }));
ok("3e. words cut to their limits (60, 40, 200, 40)", long.lists[0].x[0].n.length === 60 && long.lists[0].x[0].r.length === 40 && long.lists[0].x[0].nt.length === 200 && long.by.length === 40);
ok("3f. two lists with one name: refused", !PL.checkPlan(plan([one([{ n: "E" }], "A"), one([{ n: "F" }], "A")])));
ok("3g. an exercise with no name: refused", !PL.checkPlan(plan([one([{ n: "  " }])])));
ok("3h. a back plan must say which plan it answers", !PL.checkPlan({ ...plan([one([{ n: "E" }])]), t: "back" }) && !!PL.checkPlan({ ...plan([one([{ n: "E" }])]), t: "back", of: "2026-11-23T20:00:00.000Z" }));
ok("3i. the professional's line: 300 at most", PL.checkPlan({ ...plan([one([{ n: "E" }])]), t: "back", of: "2026-11-23T20:00:00.000Z", say: "S".repeat(400) }).say.length === 300);
ok("3j. an id that is not an id: refused", !PL.checkPlan(plan([one([{ n: "E", i: "a b" }])])));
let encThrew = false; try { await PL.encodePlan(plan([])); } catch { encThrew = true; }
ok("3k. a plan that breaks the rules is never made into a link", encThrew);

console.log("\nTEST 4 - what goes out");
ok("4a. every list, in order; no list: My exercises", J(out.lists.map(l => l.g)) === J(["Gym A", "Evening", "My exercises"]));
ok("4b. notes off unless asked", !J(out).includes("squeeze") && J(PL.outFromOwn(OWN, { notes: true })).includes("squeeze at the top"));
ok("4c. no name unless asked", !("by" in out) && PL.outFromOwn(OWN, { by: "Graeme" }).by === "Graeme");
ok("4d. only the lists chosen", J(PL.outFromOwn(OWN, { groups: ["Evening"] }).lists.map(l => l.g)) === J(["Evening"]));
ok("4e. each exercise: its id, name, library id, sets, reps", J(out.lists[0].x[0]) === J({ n: "Glute bridge", i: "px-1-0", l: "glute-bridge", s: 3, r: "12" }));
ok("4f. never a tick, a date done, or anything else", !/completed|addedAt|active/.test(J(out)));

console.log("\nTEST 5 - what changed");
const backOf = lists => PL.checkPlan({ t: "back", at: "2026-11-24T10:00:00.000Z", of: out.at, say: "Progress the bridge.", lists });
const BACK = backOf([{ g: "Gym A", x: [
  { i: "px-1-0", n: "Glute bridge", l: "glute-bridge", s: 3, r: "15" },
  { i: "px-1-2", n: "Dead bug, slow", s: 2, r: "8 each side", nt: "keep your back down" },
  { n: "Side plank", s: 3, r: "20 seconds", l: "side-plank" },
] }]);
const ch = PL.changesFrom(OWN, BACK);
const texts = ch.map(c => c.text);
ok("5a. an amount, in words", texts.includes("Glute bridge: 3 × 12 → 3 × 15"), J(texts));
ok("5b. a new name and a note", texts.includes("Dead bug: now called Dead bug, slow; note: keep your back down"), J(texts));
ok("5c. added, with its amount", texts.includes("Added to Gym A: Side plank, 3 × 20 seconds"));
ok("5d. taken out", texts.includes("Taken out of Gym A: Clamshell"));
ok("5e. only the lists sent back are compared (Evening, Wall sit untouched)", ch.length === 4 && !ch.some(c => /Cat-cow|Wall sit/.test(c.text)));
ok("5f. notes not sent are not a change (Glute bridge's own note)", !texts.some(t => /squeeze/.test(t)));
ok("5g. nothing changed: no changes", PL.changesFrom(OWN, backOf([{ g: "Evening", x: [{ i: "px-2-0", n: "Cat-cow", s: 1, r: "10" }] }])).length === 0);
ok("5h. an out plan is not a list of changes", PL.changesFrom(OWN, out).length === 0);
ok("5i. amountText", PL.amountText(3, "12") === "3 × 12" && PL.amountText(1, null) === "1 set" && PL.amountText(undefined, "10") === "10" && PL.amountText() === "");

console.log("\nTEST 6 - using them");
const known = id => id === "side-plank";
const all = PL.applyChanges(OWN, BACK, ch.map(c => c.id), { known, now: new Date("2026-11-24T12:00:00Z") });
const by = n => all.find(e => e.name === n);
ok("6a. all of them: bridge 3 × 15, the dead bug renamed, the plank added, the clamshell gone", by("Glute bridge").reps === "15" && !!by("Dead bug, slow") && !!by("Side plank") && !by("Clamshell"), J(all.map(e => e.name)));
ok("6b. the rest untouched, in order", J(all.filter(e => e.group !== "Gym A").map(e => e.id)) === J(["px-2-0", "px-3-0"]));
ok("6c. the new one: in its list, a new id, untouched by any tick", by("Side plank").group === "Gym A" && /^px-\d+-\d+$/.test(by("Side plank").id) && by("Side plank").completedToday === false);
ok("6d. a library id only when the library has it", by("Side plank").exerciseId === "side-plank" && PL.applyChanges(OWN, BACK, ch.map(c => c.id)).find(e => e.name === "Side plank").exerciseId === null);
ok("6e. the professional's notes only with the health consent", !("notes" in by("Dead bug, slow")) && PL.applyChanges(OWN, BACK, ch.map(c => c.id), { notes: true }).find(e => e.name === "Dead bug, slow").notes === "keep your back down");
ok("6f. the person's own note is kept", by("Glute bridge").notes === "squeeze at the top");
const some = PL.applyChanges(OWN, BACK, [ch.find(c => c.kind === "added").id]);
ok("6g. only what was chosen", some.length === 6 && !!some.find(e => e.name === "Clamshell") && some.find(e => e.id === "px-1-0").reps === "12");
ok("6h. nothing chosen: the list as it was", J(PL.applyChanges(OWN, BACK, [])) === J(OWN));
ok("6i. My exercises is never changed in place", OWN.length === 5 && OWN[0].reps === "12");

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
