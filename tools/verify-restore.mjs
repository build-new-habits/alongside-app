/**
 * tools/verify-restore.mjs
 * 01 Oct 2026 v1
 *
 * RESTORE. Settings › Restore from a file brings a person's history to a
 * new device from the file Download your data saved, and only that.
 *
 *   1. Round trip: download, clear, restore: the history comes back.
 *   2. This device's age answer and agreements stay; the file's never apply.
 *   3. Refused, with nothing changed: not JSON, not Alongside's file, a file
 *      with markup in it, a file that is too large.
 *   4. Only known fields and 'alongside' display keys are taken; replace,
 *      not merge.
 *   5. Settings: the row is there; without the health consent it asks for
 *      it first; with it, picking a file shows what the file holds and asks
 *      before replacing.
 *   6. Download your data says anyone with the file can read it.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "FileReader", "File", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
// Downloads: capture the file instead of saving it.
let lastBlob = null;
dom.window.URL.createObjectURL = b => { lastBlob = b; return "blob:x"; };
dom.window.URL.revokeObjectURL = () => {};
globalThis.URL = dom.window.URL;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const R = await import(B + "data/restore.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const wait = ms => new Promise(r => setTimeout(r, ms));
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const keys = () => Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i));
const adultConsent = (health = true) => ({
  given: true, at: "2026-10-01T09:00:00Z", policyVersion: "2026-10-01",
  ageConfirmed: true, ageCheckedAt: "2026-10-01T09:00:00Z", ageVersion: "2026-10-01",
  health: health ? { given: true, at: "2026-10-01T09:00:00Z", version: "2026-10-01", withdrawnAt: null }
                 : { given: false, at: null, version: null, withdrawnAt: "x" },
});

function oldPhone() {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", "free"); store.set("name", "Sam");
  store.set("consent", { ...adultConsent(), at: "2026-08-01T09:00:00Z" });
  store.set("activityLog", [{ id: "a1", date: "2026-09-20T10:00:00Z", type: "workout", status: "completed", durationMins: 30 },
                            { id: "a2", date: "2026-09-22T10:00:00Z", type: "workout", status: "completed", durationMins: 20 }]);
  store.set("journalEntries", [{ id: "j1", date: "2026-09-21T10:00:00Z", text: "Felt good <3", tags: [] }]);
  store.set("conditions", ["knee"]);
  store.set("gymEquipment", ["dumbbells"]); store.set("totalCredits", 40);
  localStorage.setItem("alongside-display-scheme", "light");
}
function exportText() {
  const data = {
    exportedAt: "2026-09-30T12:00:00Z",
    about: "Everything Alongside: Move keeps about you on this device, including your journal. Nothing here was sent anywhere to make this file.",
    store: JSON.parse(localStorage.getItem("alongside_user")),
    display: { "alongside-display-scheme": localStorage.getItem("alongside-display-scheme") },
  };
  return JSON.stringify(data);
}
function newPhone(health = true) {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", "free");
  store.set("consent", adultConsent(health));
  localStorage.setItem("alongside-display-scheme", "dark");
  localStorage.setItem("alongside-leftover", "x");
  localStorage.setItem("another-site", "keep");
}

// ── 1. ROUND TRIP ───────────────────────────────────────────────────────
console.log("\nTEST 1 - download, then restore on another device");
oldPhone();
const file = exportText();
newPhone();
const read = R.readRestoreFile(file);
ok("1a. Alongside's own file is accepted, with what it holds", read.ok && read.summary.sessions === 2 && read.summary.journal === 1, JSON.stringify(read.summary || read.reason));
R.applyRestore(read.data);
ok("1b. the history comes back", store.get("name") === "Sam" && (store.get("activityLog") || []).length === 2 &&
   store.get("journalEntries")?.[0]?.text === "Felt good <3" && JSON.stringify(store.get("conditions")) === '["knee"]');
ok("1d. live fields kept outside the defaults come back too (equipment, credits)",
   JSON.stringify(store.get("gymEquipment")) === '["dumbbells"]' && store.get("totalCredits") === 40);
ok("1c. display settings come back", localStorage.getItem("alongside-display-scheme") === "light");

// ── 2. THIS DEVICE'S AGREEMENTS STAY ────────────────────────────────────
console.log("\nTEST 2 - this device's age answer and agreements stay");
ok("2a. the consent is this device's, not the file's", store.get("consent")?.at === "2026-10-01T09:00:00Z", JSON.stringify(store.get("consent")));
oldPhone();
store.set("consent", { ...store.get("consent"), ageConfirmed: true, health: { given: true, at: "file", version: "file", withdrawnAt: null } });
const f2 = exportText();
newPhone(false);
R.applyRestore(R.readRestoreFile(f2).data);
ok("2b. a file's health consent never applies here", store.get("consent")?.health?.given === false);

// ── 3. REFUSED, NOTHING CHANGED ─────────────────────────────────────────
console.log("\nTEST 3 - anything else is refused and nothing changes");
const bad = [
  ["not JSON", "hello"],
  ["empty", ""],
  ["JSON, but not Alongside's", JSON.stringify({ store: { name: "x" } })],
  ["no store", JSON.stringify({ about: "Everything Alongside: Move keeps about you on this device" })],
  ["markup in the journal", file.replace("Felt good <3", "<img src=x onerror=alert(1)>")],
  ["markup in a display value", JSON.stringify({ ...JSON.parse(file), display: { "alongside-x": "<script>" } })],
  ["too large", "x".repeat(R.MAX_BYTES + 1)],
];
for (const [label, t] of bad) {
  newPhone();
  const before = localStorage.getItem("alongside_user");
  const r = R.readRestoreFile(t);
  ok(`3. ${label}: refused, with a reason`, !r.ok && typeof r.reason === "string" && /nothing has been changed/.test(r.reason), r.reason);
  ok(`3. ${label}: nothing on the device changed`, localStorage.getItem("alongside_user") === before);
}
ok("3pc. REVERSAL: \"<3\" in a journal is not markup", R.readRestoreFile(file).ok);

// ── 4. ONLY WHAT ALONGSIDE KNOWS; REPLACE ───────────────────────────────
console.log("\nTEST 4 - only known fields; replace, not merge");
const extra = JSON.parse(file);
extra.store.madeUpField = "x";
extra.display["alongside-made-up"] = "y";
extra.display["another-site"] = "z";
newPhone();
R.applyRestore(R.readRestoreFile(JSON.stringify(extra)).data);
ok("4a. an unknown store field is dropped", !("madeUpField" in (JSON.parse(localStorage.getItem("alongside_user")) || {})));
ok("4b. only 'alongside' display keys are taken", localStorage.getItem("alongside-made-up") === "y" && localStorage.getItem("another-site") === "keep");
ok("4c. replace: this device's other Alongside keys are gone", localStorage.getItem("alongside-leftover") === null, keys().join(","));

// ── 5. SETTINGS ─────────────────────────────────────────────────────────
console.log("\nTEST 5 - Settings › Restore from a file");
const { SettingsView } = await import(B + "views/settings.js");
let landed = [];
const mount = () => { main.innerHTML = ""; SettingsView({ navigate(v) { landed.push(v); }, back() {} }).mount(main); };
newPhone(false);
mount(); await wait(20);
const row = () => main.querySelector('[data-action="restore-data"]');
ok("5pc. the row is there, and says it replaces", !!row() && /replaces what is on this device/.test(txt(row())), txt(row()));
click(row()); await wait(20);
ok("5a. without the health consent, it asks for that first", landed.includes("health-consent") && !document.getElementById("settings-restore-input"), JSON.stringify(landed));
newPhone(true);
mount(); await wait(20);
let picked = null;
const origClick = dom.window.HTMLInputElement.prototype.click;
dom.window.HTMLInputElement.prototype.click = function () { if (this.type === "file") picked = this; else origClick.call(this); };
click(row()); await wait(20);
ok("5b. with it, a file picker opens for JSON files", !!picked && /json/.test(picked.accept));
Object.defineProperty(picked, "files", { value: [new File([file], "alongside-data.json", { type: "application/json" })] });
picked.dispatchEvent(new dom.window.Event("change")); await wait(80);
const dlg = document.getElementById("settings-confirm-dialog");
ok("5c. it says what the file holds and that it replaces, before anything changes",
   !!dlg && /2 sessions and 1 journal entry/.test(txt(dlg)) && /30 September 2026/.test(txt(dlg)) && /replaces everything/.test(txt(dlg)) && store.get("name") !== "Sam",
   txt(dlg));
click(document.getElementById("confirm-ok")); await wait(30);
ok("5d. confirmed: restored, and it says so", store.get("name") === "Sam" && /Restored/.test(txt(main.querySelector("#settings-saved"))), txt(main.querySelector("#settings-saved")));
newPhone(true); mount(); await wait(20);
picked = null; click(row()); await wait(20);
Object.defineProperty(picked, "files", { value: [new File(["not a file of ours"], "x.json")] });
picked.dispatchEvent(new dom.window.Event("change")); await wait(80);
ok("5e. a wrong file: no dialog, a plain reason, nothing changed",
   !document.getElementById("settings-confirm-dialog") && /nothing has been changed/.test(txt(main.querySelector("#settings-saved"))) && !store.get("name"));
dom.window.HTMLInputElement.prototype.click = origClick;

// ── 6. THE DOWNLOAD WARNS ───────────────────────────────────────────────
console.log("\nTEST 6 - Download your data says who can read the file");
oldPhone(); mount(); await wait(20);
const dl = main.querySelector('[data-action="download-data"]');
ok("6a. the row says anyone with the file can read it", /Anyone who has the file can read it/.test(txt(dl)));
click(dl); await wait(60);
ok("6b. so does the message after downloading", /anyone who has the file can read it/.test(txt(main.querySelector("#settings-saved"))), txt(main.querySelector("#settings-saved")));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
