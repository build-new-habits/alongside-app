/**
 * tools/verify-physio-link.mjs
 * 24 Nov 2026 v2
 *
 * v2 - SHARE-NOW (Graeme, 24 Nov: "The link does copy and I can't share").
 *   TEST 2S: the link is ready before the tap, so Share and Copy are asked
 *   for at once, inside it; Share refused: copied, and said; no Share:
 *   copied, said; Copy refused too: the link shown, selected.
 *
 * P-44 THE PHYSIO LINK, S2 SEND and S3 THE PAGE (spec
 * docs/specs/alongside_physio-link_23nov2026_v1.md). The app's Send a
 * link to change (views/plan-link-send.js), and the website's
 * edit-plan page (../website/edit-plan/), driven end to end: the link the
 * app makes is opened in the page, changed, sent back, and read by the
 * app's own changesFrom.
 *
 *   1  Share your plan offers Send a link to change (with lists only);
 *      Free is sent to Progress; nothing in My exercises: says so.
 *   2  The link: every list, no notes, no name, unless chosen; notes only
 *      with the health consent; a list unticked is left out; none ticked,
 *      nothing to press.
 *   3  The QR code: made on the phone, named; too long, said instead.
 *   4  The page: the app's codec byte for byte; loads nothing from anyone
 *      else; not indexed, no referrer, not in the menu or the sitemap.
 *   5  The page reads the link: who, each list, each exercise labelled.
 *   6  Changes made and sent back: the app reads them as the changes made.
 *   7  Mistakes: a new exercise with no name, sets out of range: said
 *      beside the field, marked, focus there, no link made.
 *   8  A link cut short, or a back link opened here: said plainly.
 *
 * Red on alongside-v730 (no Send a link to change, no page).
 */
import { createRequire as __cr } from "node:module";
/**
 * tools/verify-p33-plan-share.mjs
 * 15 Nov 2026 v1
 *
 * P-33 PLAN-SHARE (spec docs/specs/alongside_share-your-plan_15nov2026_v1.md).
 *
 *   1  What is in the plan: the arc and what works towards it (the arc's own
 *      rule, own exercises only), the week, the lists with amounts and On
 *      Home, saved sessions; no name unless switched on.
 *   2  The boundary: never the journal, check-in answers or weight; the last
 *      30 days, anything sore and notes off unless switched on; sore and
 *      notes also need the health consent.
 *   3  The round trip: the text, read by Add a plan you already have, gives
 *      back every exercise, its amount and the On Home choices; a library
 *      name with a dash is matched whole; a note after a dash still reads.
 *   4  Coming back in: Plan import puts a list On Home as the plan says.
 *   5  The PDF: a whole, well-formed file, its words real text, its title
 *      and language set, and nothing that is never in it.
 *   6  The screen: Progress's row on the Plan only; actions before the
 *      preview; Change what's in it; the empty state; Free sent away.
 *
 *   node tools/verify-p33-plan-share.mjs
 */
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div><nav id="bottom-nav"></nav></div><div id="sr-announcer"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "SVGElement"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };
dom.window.confirm = () => false; globalThis.confirm = () => false;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const { PlanShareView } = await import(B + "views/plan-share.js");
const SEND = await import(B + "views/plan-link-send.js");
const PL = await import(B + "data/plan-link.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);
const fs = await import("node:fs");
const { fileURLToPath } = await import("node:url");
const path = await import("node:path");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${String(detail).slice(0, 500)}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const wait = ms => new Promise(r => setTimeout(r, ms));
const click = async (el, ms = 60) => { el?.dispatchEvent(new el.ownerDocument.defaultView.MouseEvent("click", { bubbles: true, cancelable: true })); await wait(ms); };
const tick = async (el, v) => { el.checked = v; el.dispatchEvent(new el.ownerDocument.defaultView.Event("change", { bubbles: true })); await wait(60); };
const type = async (el, v) => { el.value = v; el.dispatchEvent(new el.ownerDocument.defaultView.Event("input", { bubbles: true })); await wait(10); };
let navs = [];
const rtr = { history: ["x"], navigate: v => navs.push(v), back() {} };
globalThis.window.router = rtr;
let copied = null;
Object.defineProperty(dom.window.navigator, "clipboard", { value: { writeText: async t => { copied = t; } }, configurable: true });

const OWN = [
  { id: "px-1-0", exerciseId: "glute-bridge", name: "Glute bridge", sets: 3, reps: "12", group: "Gym A", notes: "squeeze at the top", active: true },
  { id: "px-1-1", name: "Clamshell", sets: 2, reps: "15 each side", group: "Gym A", active: true },
  { id: "px-2-0", name: "Cat-cow", sets: 1, reps: "10", group: "Evening", active: true },
];
function fixture({ tier = "personal", lists = true, health = true } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  if (!health) store.set("consent.health", { given: false, at: null, version: null, withdrawnAt: new Date().toISOString() });
  store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", tier);
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  if (lists) store.set("prescribedExercises", OWN.map(x => ({ ...x })));
  navs = []; copied = null;
}
const mountSend = async () => { main.innerHTML = ""; SEND.PlanLinkSendView(rtr).mount(main); await wait(30); };
const q = s => main.querySelector(s);

console.log("\nTEST 1 - the way in");
fixture(); main.innerHTML = ""; PlanShareView(rtr).mount(main); await wait(30);
const way = [...main.querySelectorAll("[data-go]")].find(b => /Send a link to change/.test(txt(b)));
ok("1a. Share your plan: Send a link to change", !!way);
await click(way);
ok("1b. it opens it", navs.at(-1) === "plan-link-send");
fixture({ tier: "free" }); await mountSend();
ok("1c. Free is sent to Progress", navs.at(-1) === "progress");
fixture({ lists: false }); await mountSend();
ok("1d. nothing in My exercises: said, with the way there", /nothing in My exercises yet/.test(txt(main)) && !!q('[data-go="prescribed"]') && !q("#pl-copy"));

console.log("\nTEST 2 - the link");
fixture(); await mountSend();
ok("2a. the h1, and what happens, in words", txt(q("h1")) === "Send a link to change" && /send a link back, and you choose what to keep/.test(txt(main)));
ok("2b. every list ticked, with how many", [...main.querySelectorAll("[data-list]")].map(c => `${c.dataset.list}:${c.checked}`).join() === "Gym A:true,Evening:true" && /2 exercises/.test(txt(main)));
ok("2c. notes and name off to start", !q("#pl-notes").checked && !q("#pl-name").checked);
await click(q("#pl-copy"));
let r = await PL.decodePlan(copied);
ok("2d. Copy link: the edit page's address, the plan after the #", typeof copied === "string" && copied.startsWith("https://buildnewhabits.co.uk/edit-plan/#v1.") && r.ok, copied);
ok("2e. both lists, no notes, no name", r.ok && r.plan.lists.map(l => l.g).join() === "Gym A,Evening" && !JSON.stringify(r.plan).includes("squeeze") && !r.plan.by);
ok("2f. said", /Link copied\. Paste it in a message or an email\./.test(txt(q("#pl-status"))), txt(q("#pl-status")));
await tick(q("#pl-notes"), true); await tick(q("#pl-name"), true); await tick(q('[data-list="Evening"]'), false);
await click(q("#pl-copy")); r = await PL.decodePlan(copied);
ok("2g. notes, name, and only Gym A, when chosen", r.ok && JSON.stringify(r.plan).includes("squeeze at the top") && r.plan.by === "Sam" && r.plan.lists.map(l => l.g).join() === "Gym A", JSON.stringify(r.plan));
await tick(q('[data-list="Gym A"]'), false);
ok("2h. none ticked: said, and nothing to press", /Tick at least one list/.test(txt(main)) && q("#pl-copy").disabled && q("#pl-share").disabled && q("#pl-qr").disabled);
fixture({ health: false }); await mountSend();
ok("2i. without the health consent, notes can't be chosen, and it says why", q("#pl-notes").disabled && /keep health answers/.test(txt(main)));
await click(q("#pl-copy")); r = await PL.decodePlan(copied);
ok("2j. ... and none go", r.ok && !JSON.stringify(r.plan).includes("squeeze"));
ok("2k. it says plainly that anyone with the link can read it", /Nothing is sent to us\. Everything is in the link, so anyone you give it to can read it\./.test(txt(main)));

console.log("\nTEST 2S - Share and Copy, at once");
let shares = [];
const setShare = fn => Object.defineProperty(dom.window.navigator, "share", { value: fn, configurable: true, writable: true });
fixture(); await mountSend(); await wait(100);
setShare(d => { shares.push(d); return Promise.resolve(); });
q("#pl-share").dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
ok("2Sa. the link is ready before the tap: Share is asked for at once, inside it", shares.length === 1 && (await PL.decodePlan(shares[0].url)).ok, String(shares.length));
await wait(40); ok("2Sb. said", /^Shared\.$/.test(txt(q("#pl-status"))));
copied = null; q("#pl-copy").dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
ok("2Sc. Copy, at once too", typeof copied === "string" && copied.startsWith("https://buildnewhabits.co.uk/edit-plan/#v1."));
await tick(q('[data-list="Evening"]'), false); shares = [];
q("#pl-share").dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
ok("2Sd. after a change, the new link is ready at once", shares.length === 1 && (await PL.decodePlan(shares[0].url)).plan.lists.map(l => l.g).join() === "Gym A");
setShare(() => Promise.reject(Object.assign(new Error("x"), { name: "NotAllowedError" }))); copied = null;
q("#pl-share").dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); await wait(80);
ok("2Se. Share refused: copied instead, and said", typeof copied === "string" && /Sharing didn’t open here, so the link is copied instead/.test(txt(q("#pl-status"))), txt(q("#pl-status")));
setShare(() => Promise.reject(Object.assign(new Error("x"), { name: "AbortError" }))); copied = null;
q("#pl-share").dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); await wait(80);
ok("2Sf. they closed the share sheet: nothing more", copied === null);
setShare(undefined); delete dom.window.navigator.share; copied = null;
q("#pl-share").dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); await wait(80);
ok("2Sg. no Share on this phone: copied, and said", typeof copied === "string" && /can’t share from here, so the link is copied instead/.test(txt(q("#pl-status"))));
const realClip = dom.window.navigator.clipboard;
Object.defineProperty(dom.window.navigator, "clipboard", { value: { writeText: () => Promise.reject(new Error("no")) }, configurable: true });
q("#pl-copy").dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); await wait(80);
ok("2Sh. Copy refused too: the link shown, labelled, focused, and said", !!q("#pl-link") && q("#pl-link").value.startsWith("https://buildnewhabits.co.uk/edit-plan/#v1.") && document.activeElement === q("#pl-link") && !!document.querySelector('label[for="pl-link"]') && /won’t copy from here\. The link is below, selected/.test(txt(q("#pl-status"))));
Object.defineProperty(dom.window.navigator, "clipboard", { value: realClip, configurable: true });

console.log("\nTEST 3 - the QR code");
fixture(); await mountSend();
await click(q("#pl-qr"), 120);
const svg = q("#pl-qr-box svg");
ok("3a. Show a QR code: an image, named for what it is, said", !!svg && svg.getAttribute("role") === "img" && /QR code for the link/.test(svg.getAttribute("aria-label")) && q("#pl-qr").getAttribute("aria-expanded") === "true");
ok("3b. made on the phone: dark squares on white, with a quiet edge", /<rect width="\d+" height="\d+" fill="#fff"/.test(svg.outerHTML) && /path d="M4 4h1v1h-1z/.test(svg.outerHTML));
ok("3c. too long: said instead of a code nobody can scan", SEND.qrSvg("x".repeat(SEND.QR_MAX + 1), "l") === "" && SEND.qrSvg("https://a.b/", "l").startsWith("<svg"));

console.log("\nTEST 4 - the page, as files");
const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../website");
const wf = f => path.join(WEB, "edit-plan", f);
const have = fs.existsSync(wf("index.html"));
ok("4pc. the website is beside this repository (../website)", have, WEB);
if (!have) { console.log(`\n${passes} passed, ${fails} failed`); process.exit(1); }
ok("4a. the page's codec is the app's, byte for byte", fs.readFileSync(wf("plan-link.js"), "utf8") === fs.readFileSync(new URL("../js/data/plan-link.js", import.meta.url), "utf8"));
const html = fs.readFileSync(wf("index.html"), "utf8"), js = fs.readFileSync(wf("edit-plan.js"), "utf8"), css = fs.readFileSync(wf("edit-plan.css"), "utf8");
ok("4b. loads nothing from anyone else", !/(src|href)="(https?:)?\/\//.test(html) && !/https?:\/\/(?!app\.buildnewhabits\.co\.uk\/)/.test(js.replace(/\/\*[\s\S]*?\*\//g, "")) && !/@import|url\(/.test(css));
ok("4c. never sends or keeps: no fetch, no storage, no beacon", !/fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB|document\.cookie/.test(js));
ok("4d. not indexed, no referrer", /<meta name="robots" content="noindex, nofollow">/.test(html) && /<meta name="referrer" content="no-referrer">/.test(html));
ok("4e. not in the sitemap or the menu", !/edit-plan/.test(fs.readFileSync(path.join(WEB, "sitemap.xml"), "utf8")) && !/edit-plan/.test(fs.readFileSync(path.join(WEB, "js/site.js"), "utf8")));
ok("4f. version headers", /edit-plan\/index\.html\n  \d\d \w{3} \d{4} v\d+/.test(html) && /\d\d \w{3} \d{4} v\d+/.test(js.slice(0, 200)) && /\d\d \w{3} \d{4} v\d+/.test(css.slice(0, 200)));

console.log("\nTEST 5 - the page reads the link");
fixture(); await mountSend(); await tick(q("#pl-name"), true); await click(q("#pl-copy"));
const outLink = copied;
const page = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, ""), { url: outLink, pretendToBeVisual: true });
const W = page.window, D = W.document;
let pageCopied = null;
Object.defineProperty(W.navigator, "clipboard", { value: { writeText: async t => { pageCopied = t; } }, configurable: true });
globalThis.document = D; globalThis.location = W.location; globalThis.window = W;
Object.defineProperty(globalThis, "navigator", { value: W.navigator, configurable: true, writable: true });
const EP = await import(new URL("file://" + wf("edit-plan.js")).href);
await wait(150);
const P = s => D.querySelector(s);
const ptxt = () => txt(D.getElementById("ep-app"));
ok("5a. whose, and when", /Sam’s exercises from Alongside: Move, sent on/.test(ptxt()), ptxt().slice(0, 200));
ok("5b. each list a heading; each exercise a fieldset named by it", [...D.querySelectorAll(".ep-list h2")].map(txt).join() === "Gym A,Evening" && [...D.querySelectorAll(".ep-ex legend")].map(txt).join() === "Glute bridge,Clamshell,Cat-cow");
const labelled = [...D.querySelectorAll("#ep-app input, #ep-app textarea")].every(el => el.id && D.querySelector(`label[for="${el.id}"]`));
ok("5c. every field labelled", labelled);
ok("5d. the amounts as sent", P("#ex-0-0-s").value === "3" && P("#ex-0-0-r").value === "12");
ok("5e. it says nothing is sent or kept", /Nothing you type is sent to us or kept/.test(ptxt()));

console.log("\nTEST 6 - changed, sent back, read by the app");
await type(P("#ex-0-0-r"), "15");
await click(P('[data-toggle="0:1"]'));
ok("6a. Take it out: marked, can be put back, said", P("#ex-0-1").classList.contains("is-out") && txt(P('[data-toggle="0:1"]')) === "Put it back" && /Clamshell: taken out/.test(txt(P("#ep-status"))), txt(P("#ep-status")));
await click(P('[data-add="0"]'));
ok("6b. Add an exercise: a new one, focus in its name", !!P("#ex-0-2") && D.activeElement === P("#ex-0-2-n"));
await type(P("#ex-0-2-n"), "Side plank"); await type(P("#ex-0-2-s"), "3"); await type(P("#ex-0-2-r"), "20 seconds"); await type(P("#ex-0-2-nt"), "on your knees to start");
await type(P("#ep-say"), "Progress the bridge, add a side plank.");
await click(P("#ep-make"), 200);
const backLink = P("#ep-link")?.value || "";
ok("6c. Send back: the link, ready, focus on it", backLink.startsWith("https://app.buildnewhabits.co.uk/#back=v1.") && D.activeElement === P("#ep-back-h"), backLink.slice(0, 60));
await click(P("#ep-copy")); ok("6d. Copy the link", pageCopied === backLink);
ok("6e. Email it: the link in the body", decodeURIComponent(P("#ep-mail").getAttribute("href")).includes(backLink));
const back = await PL.decodePlan(backLink);
ok("6f. the app reads it: a back plan answering the one sent", back.ok && back.plan.t === "back" && back.plan.of === (await PL.decodePlan(outLink)).plan.at && back.plan.say === "Progress the bridge, add a side plank.");
const texts = PL.changesFrom(OWN, back.plan).map(c => c.text);
ok("6g. ... as the changes made, in words", JSON.stringify(texts) === JSON.stringify(["Glute bridge: 3 × 12 → 3 × 15", "Added to Gym A: Side plank, 3 × 20 seconds. Note: on your knees to start", "Taken out of Gym A: Clamshell"]), JSON.stringify(texts));
ok("6h. a list left alone is not changed", !texts.some(t => /Cat-cow|Evening/.test(t)));

console.log("\nTEST 7 - mistakes");
await click(P('[data-add="1"]'));
await type(P("#ex-0-0-s"), "25");
await click(P("#ep-make"), 150);
ok("7a. a new exercise with no name: said beside it, marked", P("#ex-1-1-n").getAttribute("aria-invalid") === "true" && /Give it a name, or take it out/.test(txt(P("#ex-1-1-n-err"))) && !P("#ex-1-1-n-err").hidden);
ok("7b. sets out of range: said, marked", P("#ex-0-0-s").getAttribute("aria-invalid") === "true" && /whole number from 1 to 20/.test(txt(P("#ex-0-0-s-err"))));
ok("7c. focus on the first; how many said", D.activeElement === P("#ex-0-0-s") && /2 things to check/.test(txt(P("#ep-status"))));
ok("7d. the error is read with the field", P("#ex-1-1-n").getAttribute("aria-describedby").includes("ex-1-1-n-err"));

console.log("\nTEST 8 - links that are not right");
await EP.start("#v1.abcdefgh");
ok("8a. cut short: said plainly, and what to do", /This link is not complete\. Ask for it to be sent again\./.test(ptxt()) && /cut short/.test(ptxt()));
await EP.start("#" + backLink.split("#")[1]);
ok("8b. a back link opened here: open it on their phone", /Open it on their phone, in Alongside: Move/.test(ptxt()));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
