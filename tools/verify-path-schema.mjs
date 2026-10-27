/**
 * tools/verify-path-schema.mjs
 * 27 Oct 2026 v1
 *
 * STAGE PATH P-1 SCHEMA (blueprint Session 1, Part C). Schema first: the
 * store fields the purpose-first Plan Home will read, before anything reads
 * them. Drives the real store (load, write helpers, logActivity) and the
 * real Restore (applyRestore on a file), never the source text.
 *
 * Corrected against the code at session start (the code is the fact):
 *  - The blueprint's movementPrefs held 'liked', 'less' and 'never'. 'Less'
 *    and 'never' already exist: exercisePreferences ('less' / 'avoid'),
 *    written by Skip on both tiers, read by the builder, undone in Settings.
 *    So only liking is new: likedMovements. A like and a dislike of the same
 *    movement cannot both stand.
 *  - requestedFocus and requestedLength are NOT added: stretch zones are
 *    sessionZoneFocus (ZONE-1), an area is requestedSessionType, and a
 *    length for today is availableTimeToday (W5-11, data/session-length.js).
 *  - A check-in finished later in the day is read from checkedInToday(),
 *    not written into dayOpen.
 *
 *  1. Defaults: a phone with no Stage PATH history.
 *  2. dayOpen loads only as a local date and one of three choices.
 *  3. likedMovements loads only as movement ids with a date.
 *  4. Liking and not wanting a movement replace each other.
 *  5. setDayOpen() stamps today's local day; dayOpenToday() forgets
 *     yesterday.
 *  6. savedSessions[] purpose and place, activityLog[] door and feeling:
 *     kept when valid, null when not, absent left absent (old records).
 *  7. logActivity() keeps a valid door and feeling, nulls anything else,
 *     and adds neither to an entry that did not carry them (Free).
 *  8. Restore carries likedMovements and not dayOpen.
 *  9. No duplicate fields: movementPrefs, requestedFocus, requestedLength.
 */
import { createRequire as __cr } from "node:module";
import { agreed } from "./agreed.mjs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><body><div id="app"><main id="main-content"></main></div></body>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} });
dom.window.scrollTo = () => {}; dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history; globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const R = await import(B + "data/restore.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const J = v => JSON.stringify(v);
const today = store._localDay();
/** Load a stored object the way a phone does: raw localStorage, then init(). */
function load(saved) {
  localStorage.clear();
  localStorage.setItem(store.STORAGE_KEY, JSON.stringify(saved));
  store.init();
}

console.log("\nTEST 0 - positive control: a fixture written to storage is what init() loads");
load({ onboardingComplete: true, name: "Sentinel-7" });
ok("0a. the fixture reached the store", store.get("name") === "Sentinel-7", store.get("name"));

console.log("\nTEST 1 - defaults: a phone with no Stage PATH history");
const d = store.getDefaults();
ok("1a. dayOpen defaults to { date: null, choice: null }", J(d.dayOpen) === J({ date: null, choice: null }), J(d.dayOpen));
ok("1b. likedMovements defaults to {}", J(d.likedMovements) === "{}", J(d.likedMovements));
load({ onboardingComplete: true });
ok("1c. an older phone loads both defaults", J(store.get("dayOpen")) === J({ date: null, choice: null }) && J(store.get("likedMovements")) === "{}",
   J([store.get("dayOpen"), store.get("likedMovements")]));

console.log("\nTEST 2 - dayOpen loads only as a local date and one of three choices");
for (const choice of ["checked", "pick", "not-now"]) {
  load({ dayOpen: { date: "2026-10-27", choice } });
  ok(`2a. ${choice} is kept`, J(store.get("dayOpen")) === J({ date: "2026-10-27", choice }), J(store.get("dayOpen")));
}
load({ dayOpen: { date: "2026-10-27", choice: "maybe" } });
ok("2b. an unknown choice loads as null, the date kept", J(store.get("dayOpen")) === J({ date: "2026-10-27", choice: null }), J(store.get("dayOpen")));
load({ dayOpen: { date: "27 Oct", choice: "pick" } });
ok("2c. a date that is not YYYY-MM-DD loads as the default", J(store.get("dayOpen")) === J({ date: null, choice: null }), J(store.get("dayOpen")));
load({ dayOpen: "yes" });
ok("2d. a dayOpen that is not an object loads as the default", J(store.get("dayOpen")) === J({ date: null, choice: null }), J(store.get("dayOpen")));

console.log("\nTEST 3 - likedMovements loads only as movement ids with a date");
load({ likedMovements: { "glute-bridge": "2026-10-20", "bird-dog": true, "": "2026-10-20", "dead-bug": "soon" } });
ok("3a. a liked movement with its date is kept", store.get("likedMovements")["glute-bridge"] === "2026-10-20", J(store.get("likedMovements")));
ok("3b. a value that is not a date is dropped", !("bird-dog" in store.get("likedMovements")) && !("dead-bug" in store.get("likedMovements")), J(store.get("likedMovements")));
ok("3c. an empty id is dropped", !("" in store.get("likedMovements")), J(store.get("likedMovements")));
load({ likedMovements: ["glute-bridge"] });
ok("3d. an array loads as {}", J(store.get("likedMovements")) === "{}", J(store.get("likedMovements")));

console.log("\nTEST 4 - liking and not wanting a movement replace each other");
load({ onboardingComplete: true }); agreed(store);
store.setExercisePreference("glute-bridge", "less", "skip");
store.likeMovement("glute-bridge");
ok("4a. a like is stored with today's local date", store.get("likedMovements")["glute-bridge"] === today, J(store.get("likedMovements")));
ok("4b. liking it clears 'less often'", !(store.get("exercisePreferences") || {})["glute-bridge"], J(store.get("exercisePreferences")));
store.setExercisePreference("glute-bridge", "avoid", "finish");
ok("4c. 'not again' clears the like", !("glute-bridge" in store.get("likedMovements")), J(store.get("likedMovements")));
ok("4d. and is stored as before", store.get("exercisePreferences")["glute-bridge"]?.preference === "avoid", J(store.get("exercisePreferences")));
store.likeMovement("bird-dog"); store.unlikeMovement("bird-dog");
ok("4e. a like can be taken back", !("bird-dog" in store.get("likedMovements")), J(store.get("likedMovements")));
store.likeMovement("");
ok("4f. an empty id is not liked", !("" in store.get("likedMovements")));
store.setExercisePreference("plank", null);
ok("4g. clearing a preference with nothing liked still works", !(store.get("exercisePreferences") || {}).plank);
load(JSON.parse(localStorage.getItem(store.STORAGE_KEY)));
ok("4h. likes reach the phone's storage, not only memory", J(JSON.parse(localStorage.getItem(store.STORAGE_KEY)).likedMovements) === "{}"
   && (store.likeMovement("dead-bug"), JSON.parse(localStorage.getItem(store.STORAGE_KEY)).likedMovements["dead-bug"] === today));

console.log("\nTEST 5 - setDayOpen() stamps today's local day; dayOpenToday() forgets yesterday");
load({ onboardingComplete: true });
ok("5a. nothing shown yet today", store.dayOpenToday() === null, J(store.dayOpenToday()));
store.setDayOpen(null);
ok("5b. shown, nothing chosen yet", J(store.get("dayOpen")) === J({ date: today, choice: null }) && J(store.dayOpenToday()) === J({ date: today, choice: null }), J(store.get("dayOpen")));
store.setDayOpen("not-now");
ok("5c. a choice is saved", store.dayOpenToday()?.choice === "not-now" && JSON.parse(localStorage.getItem(store.STORAGE_KEY)).dayOpen.choice === "not-now");
store.setDayOpen("whenever");
ok("5d. an unknown choice is refused, the last one kept", store.dayOpenToday()?.choice === "not-now", J(store.get("dayOpen")));
load({ dayOpen: { date: "2001-01-01", choice: "pick" } });
ok("5e. a choice from another day is not today's", store.dayOpenToday() === null, J(store.dayOpenToday()));

console.log("\nTEST 6 - saved sessions and the activity log: kept when valid, null when not, absent left absent");
load({
  savedSessions: [
    { id: "s1", name: "A", exerciseIds: ["plank"], purpose: "stronger", place: "gym" },
    { id: "s2", name: "B", exerciseIds: ["plank"], purpose: "bulk", place: "outside" },
    { id: "s3", name: "C", exerciseIds: ["plank"] },
  ],
  activityLog: [
    { id: "a1", type: "workout", completedAt: "2026-10-20T10:00:00Z", door: "feel", feeling: "wake" },
    { id: "a2", type: "workout", completedAt: "2026-10-21T10:00:00Z", door: "lift", feeling: "happy" },
    { id: "a3", type: "walk", completedAt: "2026-10-22T10:00:00Z" },
  ],
});
const ss = store.get("savedSessions"), al = store.get("activityLog");
ok("6a. a valid purpose and place are kept", ss[0].purpose === "stronger" && ss[0].place === "gym", J(ss[0]));
ok("6b. an unknown purpose loads as null; outside is not a saved session's place", ss[1].purpose === null && ss[1].place === null, J(ss[1]));
ok("6c. an older saved session gains no keys", !("purpose" in ss[2]) && !("place" in ss[2]), J(ss[2]));
ok("6d. a valid door and feeling are kept", al[0].door === "feel" && al[0].feeling === "wake", J(al[0]));
ok("6e. an unknown door and feeling load as null", al[1].door === null && al[1].feeling === null, J(al[1]));
ok("6f. an older entry gains no keys", !("door" in al[2]) && !("feeling" in al[2]), J(al[2]));
for (const p of ["stronger", "moving", "stretch", "feel"]) {
  load({ savedSessions: [{ id: "x", purpose: p, place: "home" }], activityLog: [{ id: "y", type: "workout", door: p }] });
  ok(`6g. ${p} is a purpose and a door`, store.get("savedSessions")[0].purpose === p && store.get("activityLog")[0].door === p);
}
for (const f of ["ground", "calm", "worn", "wake", "sleep"]) {
  load({ activityLog: [{ id: "y", type: "practice", door: "feel", feeling: f }] });
  ok(`6h. ${f} is a feeling`, store.get("activityLog")[0].feeling === f);
}

console.log("\nTEST 7 - logActivity(): what the Plan's session says, and nothing on Free's");
load({ onboardingComplete: true }); agreed(store);
const e1 = store.logActivity({ type: "yoga", completedAt: "2026-10-27T08:00:00Z", durationMins: 15, door: "feel", feeling: "sleep", moodAfter: 7 });
ok("7a. a valid door and feeling are written", e1?.door === "feel" && e1?.feeling === "sleep", J(e1));
const e2 = store.logActivity({ type: "workout", completedAt: "2026-10-27T09:00:00Z", durationMins: 20, door: "<b>", feeling: 3 });
ok("7b. anything else is written as null", e2?.door === null && e2?.feeling === null, J(e2));
const e3 = store.logActivity({ type: "walk", completedAt: "2026-10-27T10:00:00Z", durationMins: 30 });
ok("7c. an entry without them gains no keys (Free's sessions)", e3 && !("door" in e3) && !("feeling" in e3), J(e3));
ok("7d. moodAfter is unchanged: same field, same scale", e1?.moodAfter === 7);
const saved = JSON.parse(localStorage.getItem(store.STORAGE_KEY)).activityLog;
ok("7e. what was saved to the phone says the same", saved.find(e => e.id === e1.id)?.feeling === "sleep" && saved.find(e => e.id === e2.id)?.door === null);

console.log("\nTEST 8 - Restore carries likedMovements and not dayOpen");
const file = {
  about: "Everything Alongside: Move keeps about you on this device, including your journal. Nothing here was sent anywhere to make this file.",
  exportedAt: "2026-10-27T07:00:00Z",
  store: { onboardingComplete: true, name: "From file", likedMovements: { "glute-bridge": "2026-10-25" }, dayOpen: { date: today, choice: "pick" },
           exercisePreferences: { plank: { preference: "avoid", setAt: "2026-10-01T00:00:00Z", source: "skip" } } },
};
load({ onboardingComplete: true, name: "Here" }); agreed(store);
store.setDayOpen("checked");
const read = R.readRestoreFile(JSON.stringify(file));
ok("8a. the file reads", read.ok, read.reason);
R.applyRestore(read.data);
ok("8b. the fixture restored (name from the file)", store.get("name") === "From file", store.get("name"));
ok("8c. likes come across", store.get("likedMovements")["glute-bridge"] === "2026-10-25", J(store.get("likedMovements")));
ok("8d. not-wanted movements come across, as before", store.get("exercisePreferences").plank?.preference === "avoid");
ok("8e. dayOpen is this phone's day, not the file's (it loads as the default)", J(store.get("dayOpen")) === J({ date: null, choice: null }), J(store.get("dayOpen")));

console.log("\nTEST 9 - no duplicate fields");
for (const k of ["movementPrefs", "requestedFocus", "requestedLength"]) {
  ok(`9. ${k} is not a store field`, !(k in store.getDefaults()));
}

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
