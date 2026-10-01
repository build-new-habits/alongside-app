/**
 * tools/verify-privacy-words.mjs
 * 01 Oct 2026 v1
 *
 * PT-3 TRUE-PRIVACY-WORDS and PT-4 QUIET-JOURNAL. Every privacy line the
 * app shows is true of what the app does (facts sheet, 30 Sep).
 *
 *   1. The consent screen: kept on this phone, no account, Sentry named;
 *      never "Your answers stay on your device" on its own.
 *   2. The in-app Privacy page: no "Health conditions", no "our servers",
 *      no "We never store more than we need"; it names this phone,
 *      Sentry, the journal, weight, the scope statement, and both ways to
 *      delete (Delete my health answers, Reset all data).
 *   3. Settings › How your data is kept says how, not only four buttons.
 *   4. No "your account" anywhere the app shows words: there are no
 *      accounts.
 *   5. No reminder switches: nothing ever sent one.
 *   6. Perimenopause and Menopause are not sore areas (W3-4 took them out
 *      of the check-in; the sheet still offered them). A stored one is
 *      dropped on load without the medical-conditions notice, and the
 *      retired hormonalTracking field is gone.
 *   7. PT-4. Something Quieter's Journaling card opens the real journal.
 *      Its own save replaced the journal array with an object, which on
 *      the next load emptied every entry. Reachable: Library › a quiet
 *      practice › Back › Journaling.
 */
import fs from "node:fs";
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

const ROOT = new URL("../", import.meta.url);
const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
let navs = [];
router.navigate = v => { navs.push(v); };

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

// ── 1. CONSENT SCREEN ───────────────────────────────────────────────────
console.log("\nTEST 1 - the consent screen says where answers go");
localStorage.clear(); store.init();
const { ThreadView } = await import(B + "views/onboarding/thread.js");
const obEl = document.createElement("div"); document.body.appendChild(obEl);
ThreadView({ navigate() {} }).mount(obEl); await wait(2600);
const bullets = txt(obEl.querySelector(".ob-consent__list"));
ok("1pc. positive control: the bullets are on screen", bullets.length > 40);
ok("1a. kept on this phone, with no account and no server copy", /kept on this phone/i.test(bullets) && /no account/i.test(bullets) && /server/i.test(bullets), bullets);
ok("1b. Sentry is named, and what it does not carry", /Sentry/.test(bullets) && /never what you told me/i.test(bullets));
ok("1c. never the old absolute line", !/stay on your device/i.test(bullets));

// ── 2. THE PRIVACY PAGE ─────────────────────────────────────────────────
console.log("\nTEST 2 - the in-app Privacy page is true");
const pv = await import(B + "views/privacy.js");
main.innerHTML = pv.render();
const page = txt(main);
ok("2pc. positive control: the page rendered", /Privacy/.test(page) && page.length > 500);
ok("2a. no \"Health conditions\", no \"our servers\", no \"never store more than we need\"",
   !/Health conditions/i.test(page) && !/our servers/i.test(page) && !/never store more than we need/i.test(page),
   (page.match(/Health conditions[^.]*|our servers[^.]*|never store more[^.]*/gi) || []).join(" | "));
ok("2b. says it is kept on this phone, with no account", /on this phone/i.test(page) && /no account/i.test(page));
ok("2c. names Sentry and what it carries", /Sentry/.test(page) && /never what you told me|never what you/i.test(page));
ok("2d. names the journal (only you can read it) and weight (only if you turn it on)",
   /journal/i.test(page) && /only you can read/i.test(page) && /weight/i.test(page) && /turn it on|turn on/i.test(page));
ok("2e. both ways to delete, and download", /Delete my health answers/.test(page) && /Reset all data/.test(page) && /Download your data/.test(page));
const { SCOPE_ADVICE } = await import(B + "data/scope-statement.js");
ok("2f. the scope statement is there", page.includes(SCOPE_ADVICE.slice(0, 40)));
ok("2g. no promise to notify of changes the app has no way to send", !/we will notify you/i.test(page));

// ── 3. HOW YOUR DATA IS KEPT ────────────────────────────────────────────
console.log("\nTEST 3 - Settings › How your data is kept says how");
localStorage.clear(); store.init();
store.set("onboardingComplete", true); store.set("tier", "personal");
const { SettingsView } = await import(B + "views/settings.js");
main.innerHTML = ""; SettingsView({ navigate(v) { navs.push(v); }, back() {} }).mount(main); await wait(20);
click(main.querySelector('[data-open="about-data"]')); await wait(20);
const panel = txt(main);
ok("3a. the panel explains: this phone, Sentry, download, delete",
   /on this phone/i.test(panel) && /Sentry/.test(panel) && /Download your data/.test(panel) && /Delete my health answers/.test(panel),
   panel.slice(0, 300));

// ── 4. NO "YOUR ACCOUNT" ────────────────────────────────────────────────
console.log("\nTEST 4 - nothing says \"your account\"");
function walk(dir, out = []) {
  for (const e of fs.readdirSync(new URL(dir, ROOT), { withFileTypes: true })) {
    const p = `${dir}${e.name}`;
    if (e.isDirectory()) walk(p + "/", out); else if (p.endsWith(".js")) out.push(p);
  }
  return out;
}
const hits = [];
for (const p of walk("js/")) {
  const src = fs.readFileSync(new URL(p, ROOT), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/<!--[\s\S]*?-->/g, "");
  src.split("\n").forEach((l, i) => { if (!/^\s*\/\//.test(l) && /your account|with your account/i.test(l)) hits.push(`${p}:${i + 1}`); });
}
ok("4a. no screen says \"your account\"", hits.length === 0, hits.join(", "));

// ── 5. NO REMINDER SWITCHES ─────────────────────────────────────────────
console.log("\nTEST 5 - no reminder switches");
main.innerHTML = ""; SettingsView({ navigate(v) { navs.push(v); }, back() {} }).mount(main); await wait(20);
ok("5pc. positive control: Settings rendered", /Download your data/.test(txt(main)));
ok("5a. no Reminders group, no check-in or water reminder", !/reminder/i.test(txt(main)), (txt(main).match(/[^.]*reminder[^.]*/i) || [""])[0]);

// ── 6. PERIMENOPAUSE AND MENOPAUSE ──────────────────────────────────────
console.log("\nTEST 6 - Perimenopause and Menopause are not sore areas");
const { CONDITIONS } = await import(B + "data/conditions.js");
ok("6a. not in the sore-area list", !CONDITIONS.some(c => c.id === "perimenopause" || c.id === "menopause"));
const cv = await import(B + "views/onboarding/conditions.js");
localStorage.clear(); store.init();
const sheet = document.createElement("div"); document.body.appendChild(sheet);
try { (cv.mountContainer || cv.mount)?.(sheet); } catch {}
if (!txt(sheet) && cv.render) { sheet.innerHTML = cv.render(); }
ok("6b. the sheet offers no Hormonal group", txt(sheet).length > 50 && !/Hormonal|Perimenopause|Menopause/.test(txt(sheet)), txt(sheet).slice(0, 160));
localStorage.clear();
localStorage.setItem("alongside_user", JSON.stringify({ onboardingComplete: true, conditions: ["perimenopause", "knee"],
  conditionMeta: { perimenopause: { addedAt: "x" }, knee: { addedAt: "x" } }, conditionsResolved: [{ id: "menopause", resolvedAt: "x" }],
  hormonalTracking: true }));
store.init();
ok("6c. a stored one is dropped on load, and the knee stays",
   JSON.stringify(store.get("conditions")) === '["knee"]' && !store.get("conditionMeta")?.perimenopause && (store.get("conditionsResolved") || []).length === 0,
   JSON.stringify({ c: store.get("conditions"), r: store.get("conditionsResolved") }));
ok("6d. without the medical-conditions notice (it is not one)", store.get("scopeNoticeDue") !== true);
ok("6e. the retired hormonalTracking field is gone", !("hormonalTracking" in (store.data || {})));

// ── 7. PT-4 QUIET JOURNAL ───────────────────────────────────────────────
console.log("\nTEST 7 - Something Quieter's Journaling opens the real journal");
localStorage.clear(); store.init();
store.set("journalEntries", [{ id: "j1", date: new Date().toISOString(), text: "Mine", tags: [] }]);
store.set("quietMode", null);
const qs = await import(B + "views/quiet-session.js");
main.innerHTML = qs.render(); try { qs.onMount(); } catch {}
const card = main.querySelector('.quiet-mode-card[data-mode="journal"]');
ok("7pc. positive control: the selector shows a Journaling card", !!card);
navs = [];
click(card); await wait(10);
ok("7a. it opens the journal", navs.includes("journal-entry"), JSON.stringify(navs));
ok("7b. and the journal is still a list with the entry in it",
   Array.isArray(store.get("journalEntries")) && store.get("journalEntries").length === 1);
const qsrc = fs.readFileSync(new URL("js/views/quiet-session.js", ROOT), "utf8");
ok("7c. nothing in Something Quieter writes the journal as an object",
   !/existing\[todayKey\]\s*=/.test(qsrc));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
