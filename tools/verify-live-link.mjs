/**
 * tools/verify-live-link.mjs
 * 24 Nov 2026 v1
 *
 * P-45 THE PHYSIO LINK, Stage 2: the live link (spec
 * docs/specs/alongside_physio-live-link_24nov2026_v1.md). store.js v131,
 * data/live-link.js, data/live-check.js, data/relay-config.js,
 * plan-link-send.js v3, plan-home.js, prescribed.js v1.18,
 * plan-link-back.js v2, app.js v18; website edit-plan v2. Driven against a
 * stand-in relay that keeps relay.sql's rules (tools/pg-relay-check.mjs
 * runs the real SQL).
 *
 *   1  The store: liveLinks and liveInbox, cleaned on load; Delete my health
 *      answers empties the waiting list.
 *   2  Locked: sealed and unsealed on the device; a wrong key or a changed
 *      byte reads nothing; the relay never sees the words or the key.
 *   3  The relay client: off unless set up, and then only Supabase RPC calls,
 *      no cookies, no referrer.
 *   4  As shipped: the relay not set up; app and website copies identical.
 *   5  Off: no live option, no call, nothing collected.
 *   6  Sending with a live link: one opened per visit, key after the #, the
 *      owner never in the link; the lists kept up to date.
 *   7  Opening refused: said, and the link works the usual way.
 *   8  The page: says where the changes go; sends only sealed bytes; said
 *      when sent and when not; no live link, no call.
 *   9  Collecting: unsealed, kept only if they are changes, deleted from the
 *      relay; others ignored; every 2 minutes at most.
 *  10  Home asks first (not on a hard day); Later; My exercises; Look at
 *      them; used: gone from the waiting list.
 *  11  Stop this live link: closed on the relay and here.
 *  12  Free: nothing collected.
 *  13  relay.sql: the tables shut; the cleaner not callable by anyone.
 *
 * Red on alongside-v733.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "SVGElement"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const WM = await import(B + "data/week-shape-model.js");
const ENG = await import(B + "data/path-engine.js");
const { TodayView } = await import(B + "views/today.js");
const { router: realRouter } = await import(B + "router.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
let navs = [];
const fakeRouter = { history: ["somewhere"], navigate: v => navs.push(v), back() {} };
globalThis.window.router = fakeRouter;
realRouter.navigate = fakeRouter.navigate;
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const TODAY = WM.DAY_KEYS[(new Date().getDay() + 6) % 7];
const todayKey = new Date().toISOString().split("T")[0];

// An arc in its week n (week 1 is the week it began).
const ARC_AT = n => new Date(Date.now() - (n - 1) * 7 * 864e5).toISOString();

function fixture({ tier = "personal", open = false, arcWeeks = 3, arc = true, choice = undefined, checkin = null, pairs = 0, sore = null, week = null, done = false, carry = false, likes = [] } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("activityLog", Array.from({ length: 6 }, (_, i) => ({ id: "a" + i, type: "workout", sessionType: "upper", place: "gym",
    completedAt: new Date(Date.now() - (i + 1) * 864e5).toISOString(), durationMins: 30, completed: true })));
  store.set("guidanceShownAt", new Date().toISOString());
  if (arc) store.set("arc", { active: true, aimId: "sport-without-flaring", startedAt: ARC_AT(arcWeeks), strands: [] });
  if (!open) store.setMyMove({ startClosed: "2026-11-01T09:00:00.000Z" });
  if (choice !== undefined) store.setDayOpen(choice);
  if (checkin) {
    store.set("checkinHistory", { [todayKey]: { energy: checkin.energy, mood: checkin.mood, date: new Date().toDateString() } });
    store.set("lastCheckin", { ...store.get("lastCheckin"), energy: checkin.energy, mood: checkin.mood, date: new Date().toDateString(), timestamp: new Date().toISOString() });
  }
  if (sore) store.set("conditionPainScores", sore);
  if (week) {
    const days = Object.fromEntries(WM.DAY_KEYS.map(k => [k, null]));
    if (week === "day") days[TODAY] = "upper-day";
    if (week === "rest") days[TODAY] = "rest";
    store.set("weekShape", WM.sanitizeWeekShape({ templates: { "upper-day": { id: "upper-day", name: "Upper day",
      mix: [{ focus: "upper", level: 2 }, { focus: "trunk", level: 1 }], intensity: "steady", mins: 30, place: "gym" } }, days, setAt: "2026-10-05" }));
  }
  if (done) store.set("activityLog", [...store.get("activityLog"), { id: "today1", type: "yoga-session", name: "Calming yoga", door: "feel",
    completedAt: new Date().toISOString(), durationMins: 15, completed: true, moodAfter: 7 }]);
  if (carry) {
    store.set("generatedSession", { builtAt: "b1", session: { id: "s1", title: "Upper body", exercises: [{ id: "push-up", name: "Push-up" }, { id: "childs-pose", name: "Child's Pose" }, { id: "plank", name: "Plank" }] } });
    store.set("activeSessionCheckpoint", { sessionType: "workout", sessionId: "s1|b1", index: 1, startedAt: new Date().toISOString(), checkpointedAt: new Date().toISOString() });
  }
  for (const id of likes) store.likeMovement(id);
  if (pairs) {   // finished sessions with the check-in's mood that day and the mood after
    const hist = { ...(store.get("checkinHistory") || {}) }, log = [...store.get("activityLog")];
    for (let i = 0; i < pairs; i++) { const d = new Date(Date.now() - (i + 2) * 864e5); hist[d.toISOString().split("T")[0]] = { energy: 6, mood: 3 };
      log.push({ id: "p" + i, type: "yoga-session", name: "Calming yoga", completedAt: d.toISOString(), durationMins: 15, completed: true, moodAfter: i === 0 ? 3 : 7 }); }
    store.set("checkinHistory", hist); store.set("activityLog", log);
  }
  navs = []; delete fakeRouter.pathStart;
}
function home() { main.innerHTML = ""; TodayView(fakeRouter).mount(main); }
// P-31 (Graeme, 14 Nov): Change today and its Undo count with the Today card; Little and often is the person's own choice.
const waysIn = () => [...main.querySelectorAll("button, a[href], [role=button]")].filter(b => !b.closest(".scope-notice, .today-hinge, .path-change, .path-lao, .path-mm") && !b.matches(".path-lao__all"));
const card = () => main.querySelector(".path-today");
const lead = () => main.querySelector(".path-coach, .path-today");
const doors = () => [...main.querySelectorAll(".path-doors .path-door[data-door]")];
const engineFor = (checkin, sore = []) => ENG.suggestToday({ checkin, place: "gym", sore, arcDoor: null });


const mmBar = () => main.querySelector(".path-mm");
const doorIds = () => doors().map(d => d.dataset.door).join();
const set = m => store.setMyMove({ made: "2026-11-23T10:00:00.000Z", step: null, ...m });
const MY = { purposes: ["stronger", "stretch", "calm", "instep"], most: "stronger", goodDay: "few", hardDay: ["coach", "walk"] };

const LL = await import(B + "data/live-link.js");
const LC = await import(B + "data/live-check.js");
const { RELAY } = await import(B + "data/relay-config.js");
const PL = await import(B + "data/plan-link.js");
const SEND = await import(B + "views/plan-link-send.js");
const BACK = await import(B + "views/plan-link-back.js");
const PX = await import(B + "views/prescribed.js");
const fs = await import("node:fs");
const path = await import("node:path");
const { fileURLToPath } = await import("node:url");
const wait = ms => new Promise(r => setTimeout(r, ms));
const q = s => main.querySelector(s);
const tick = async (el, v) => { el.checked = v; el.dispatchEvent(new dom.window.Event("change", { bubbles: true })); await wait(60); };
const J = JSON.stringify;
globalThis.router = fakeRouter; dom.window.router = fakeRouter;
let copied = null;
Object.defineProperty(dom.window.navigator, "clipboard", { value: { writeText: async t => { copied = t; } }, configurable: true });
let netCalls = 0;
globalThis.fetch = async () => { netCalls++; throw new Error("no network in the gate"); };

// The stand-in relay: relay.sql's rules, in memory.
function fakeRelay({ openOk = true } = {}) {
  const chans = new Map(); let seq = 0; const calls = [];
  return { on: true, calls, chans,
    open: async (id, hash) => { calls.push(["open", id, hash]); if (!openOk || chans.has(id) || !/^[0-9a-f]{64}$/.test(hash)) return false; chans.set(id, { hash, msgs: [], posts: 0 }); return true; },
    post: async (id, s) => { calls.push(["post", id, s]); const c = chans.get(id); if (!c || c.posts >= 50) return null; c.posts++; const m = { id: ++seq, iv: s.iv, body: s.body }; c.msgs.push(m); return m.id; },
    fetchSince: async (id, after = 0) => { calls.push(["fetch", id, after]); const c = chans.get(id); return c ? c.msgs.filter(m => m.id > after).slice(0, 20).map(m => ({ ...m })) : []; },
    ack: async (id, owner, upto) => { calls.push(["ack", id, owner, upto]); const c = chans.get(id); if (!c || c.hash !== await LL.ownerHash(owner)) return 0; const n = c.msgs.length; c.msgs = c.msgs.filter(m => m.id > upto); return n - c.msgs.length; },
    close: async (id, owner) => { calls.push(["close", id, owner]); const c = chans.get(id); if (!c || c.hash !== await LL.ownerHash(owner)) return false; chans.delete(id); return true; },
  };
}
const OWN = [
  { id: "px-1-0", exerciseId: "glute-bridge", name: "Glute bridge", sets: 3, reps: "12", group: "Gym A", active: true },
  { id: "px-1-1", name: "Clamshell", sets: 2, reps: "15 each side", group: "Gym A", active: true },
  { id: "px-2-0", name: "Cat-cow", sets: 1, reps: "10", group: "Evening", active: true },
];
const day = n => new Date(Date.now() - n * 864e5).toISOString();
const backCode = async (of = "2026-11-23T20:00:00.000Z") => PL.encodePlan({ t: "back", at: new Date().toISOString(), of, lists: [{ g: "Gym A", x: [{ i: "px-1-0", n: "Glute bridge", s: 3, r: "15" }, { i: "px-1-1", n: "Clamshell", s: 2, r: "15 each side" }] }] });
function own(tier = "personal") {
  fixture({ tier, checkin: { energy: 7, mood: 7 } }); set(MY); store.setMyMove({ startClosed: "2026-11-01T09:00:00.000Z" });
  store.set("prescribedExercises", OWN.map(x => ({ ...x }))); navs = []; copied = null; netCalls = 0; LC._resetThrottle();
}

console.log("\nTEST 1 - the store");
own();
ok("1a. both empty to start", J(store.get("liveLinks")) === "[]" && J(store.get("liveInbox")) === "[]");
const L1 = { ...LL.newLiveLink(), openedAt: day(1), after: 0, lists: ["Gym A"] };
const keyOf = () => Object.keys(localStorage).find(k => (localStorage.getItem(k) || "").includes("onboardingComplete"));
const loadAs = data => { const k = keyOf(); const d = JSON.parse(localStorage.getItem(k)); localStorage.setItem(k, J({ ...d, ...data })); store.init(); };
loadAs({ liveLinks: [L1, { ...L1, id: "not-a-uuid" }, { ...LL.newLiveLink(), openedAt: day(91), after: 0, lists: [] }, { ...L1 }] });
ok("1b. kept: well-formed, not ended, once each", J(store.get("liveLinks").map(l => l.id)) === J([L1.id]));
loadAs({ liveLinks: Array.from({ length: 7 }, () => ({ ...LL.newLiveLink(), openedAt: day(1), after: 0, lists: [] })) });
ok("1c. 5 at most", store.get("liveLinks").length === 5);
const okCode = await backCode();
loadAs({ liveInbox: [{ link: L1.id, msg: 3, code: okCode, at: day(1) }, { link: L1.id, msg: 4, code: "<b>", at: day(1) }, { link: L1.id, msg: 5, code: okCode, at: day(31) }, { link: L1.id, msg: 3, code: okCode, at: day(1) }] });
ok("1d. waiting: well-formed, under 30 days, once each; noticed false unless said", J(store.get("liveInbox").map(m => [m.msg, m.noticed])) === J([[3, false]]));
store.deleteHealthAnswers();
ok("1e. Delete my health answers empties it (their notes may be in it)", store.get("liveInbox").length === 0);

console.log("\nTEST 2 - locked");
const link = LL.newLiveLink();
ok("2a. a uuid, a 256-bit key and a secret, each new", LL.isLiveId(link.id) && LL.isLiveKey(link.key) && LL.isLiveKey(link.owner) && LL.newLiveLink().key !== link.key);
const sealed = await LL.seal(link.key, okCode);
ok("2b. sealed: back again with the key", (await LL.unseal(link.key, sealed)) === okCode);
ok("2c. a wrong key: nothing", (await LL.unseal(LL.newLiveLink().key, sealed)) === null);
const flip = sealed.body.slice(0, 10) + (sealed.body[10] === "A" ? "B" : "A") + sealed.body.slice(11);
ok("2d. one character changed: nothing", (await LL.unseal(link.key, { ...sealed, body: flip })) === null);
ok("2e. a new iv each time", (await LL.seal(link.key, "x")).iv !== (await LL.seal(link.key, "x")).iv);
ok("2f. the owner hash is hex, and not the owner", /^[0-9a-f]{64}$/.test(await LL.ownerHash(link.owner)) && !(await LL.ownerHash(link.owner)).includes(link.owner));
ok("2g. after the #: the id and key, never the owner", LL.liveFragment(link) === `live=${link.id}.${link.key}` && !LL.liveFragment(link).includes(link.owner));
ok("2h. read back from a whole fragment", J(LL.readLive(`#v1.abcdefgh&${LL.liveFragment(link)}`)) === J({ id: link.id, key: link.key }) && LL.readLive("#live=nope.key") === null);

console.log("\nTEST 3 - the relay client");
let seen = [];
const fakeFetch = async (url, o) => { seen.push({ url, o }); return { ok: true, json: async () => true }; };
for (const c of [{}, { url: "", anonKey: "" }, { url: "http://abc.supabase.co", anonKey: "x".repeat(40) }, { url: "https://evil.example.com", anonKey: "x".repeat(40) }]) {
  const rc = LL.relayClient(c, fakeFetch);
  let threw = false; try { await rc.open(link.id, "a".repeat(64)); } catch { threw = true; }
  if (rc.on || !threw) { ok("3a. off unless a Supabase https address and key", false, J(c)); }
}
ok("3a. off unless a Supabase https address and key: no call made", seen.length === 0);
const rc = LL.relayClient({ url: "https://abcd1234.supabase.co/", anonKey: "k".repeat(40) }, fakeFetch);
await rc.open(link.id, "a".repeat(64));
const c0 = seen[0];
ok("3b. on: the RPC address", rc.on && c0.url === "https://abcd1234.supabase.co/rest/v1/rpc/relay_open");
ok("3c. no cookies, no referrer, nothing cached", c0.o.method === "POST" && c0.o.credentials === "omit" && c0.o.referrerPolicy === "no-referrer" && c0.o.cache === "no-store");
ok("3d. the public key as Supabase wants it; the body as named arguments", c0.o.headers.apikey === "k".repeat(40) && c0.o.headers.Authorization === "Bearer " + "k".repeat(40) && J(JSON.parse(c0.o.body)) === J({ p_channel: link.id, p_owner_hash: "a".repeat(64) }));
const bad = LL.relayClient({ url: "https://abcd1234.supabase.co", anonKey: "k".repeat(40) }, async () => ({ ok: false, status: 500 }));
let threw = false; try { await bad.post(link.id, sealed); } catch { threw = true; }
ok("3e. a refusal throws (and is caught by the callers)", threw);

console.log("\nTEST 4 - as shipped");
ok("4a. the relay is not set up: the live link is off", RELAY.url === "" && RELAY.anonKey === "" && LL.relayClient(RELAY).on === false);
const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../website/edit-plan");
const same = f => fs.readFileSync(path.join(WEB, f), "utf8") === fs.readFileSync(new URL(`../js/data/${f}`, import.meta.url), "utf8");
ok("4b. the website's live-link.js and relay-config.js are the app's, byte for byte", same("live-link.js") && same("relay-config.js"));
const libSrc = fs.readFileSync(new URL("../js/data/live-link.js", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
ok("4c. live-link.js calls nothing but the relay's RPC", (libSrc.match(/fetchImpl\(/g) || []).length === 1 && /\$\{url\}\/rest\/v1\/rpc\/\$\{name\}/.test(libSrc) && !/localStorage|document\.cookie|sendBeacon|XMLHttpRequest/.test(libSrc));

console.log("\nTEST 5 - off");
own();
main.innerHTML = ""; SEND.PlanLinkSendView(fakeRouter).mount(main); await wait(30);
ok("5a. no live option, no live links", !q("#pl-live") && !q(".pl-live"));
await main.querySelector("#pl-copy").dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); await wait(80);
ok("5b. the link is Stage 1's: no live part, no call", typeof copied === "string" && !copied.includes("live=") && netCalls === 0);
ok("5c. nothing collected, no call", (await LC.checkLive({ force: true })) === 0 && netCalls === 0);

console.log("\nTEST 6 - sending with a live link");
own(); let relay = fakeRelay();
const mountSend = async () => { main.innerHTML = ""; SEND.PlanLinkSendView(fakeRouter, { client: relay }).mount(main); await wait(30); };
await mountSend();
ok("6a. the option, off to start, with what it means", !!q("#pl-live") && !q("#pl-live").checked && /Locked so only this phone can read them\. You still choose what to keep\. Ends after 90 days, or when you stop it\./.test(txt(main)));
await tick(q("#pl-live"), true);
click(q("#pl-copy")); await wait(120);
const kept = store.get("liveLinks")[0];
ok("6a2. with it ticked, the privacy line says what goes where", /Their changes come back through our relay, locked so only this phone can read them: we can’t\./.test(txt(main)) && !/Nothing is sent to us/.test(txt(main)));
ok("6b. one live link opened, kept here with its lists", relay.calls.filter(c => c[0] === "open").length === 1 && kept && J(kept.lists) === J(["Gym A", "Evening"]) && kept.after === 0);
ok("6c. the relay got the id and a hash of the secret, never the key or the secret", relay.calls[0][1] === kept.id && relay.calls[0][2] === await LL.ownerHash(kept.owner) && !J(relay.calls).includes(kept.key) && !J(relay.calls).includes(kept.owner));
ok("6d. the link: the plan, then the id and key after the #; never the secret", copied.includes(`&live=${kept.id}.${kept.key}`) && !copied.includes(kept.owner) && (await PL.decodePlan(copied.split("&live=")[0])).ok);
click(q("#pl-copy")); await wait(80);
await tick(q('[data-list="Evening"]'), false); click(q("#pl-copy")); await wait(80);
ok("6e. one per visit; its lists kept up to date", relay.calls.filter(c => c[0] === "open").length === 1 && J(store.get("liveLinks")[0].lists) === J(["Gym A"]));
ok("6f. Your live links: it, with when it ends, and Stop", /Your live links/.test(txt(main)) && /Sent \d+ \w+: Gym A\. Ends \d+ \w+\./.test(txt(q(".pl-live"))) && !!q(`[data-stop="${kept.id}"]`));

console.log("\nTEST 7 - opening refused");
own(); relay = fakeRelay({ openOk: false }); await mountSend();
await tick(q("#pl-live"), true); click(q("#pl-copy")); await wait(120);
ok("7a. said; the link works the usual way; nothing kept", /couldn’t be set up just now, so this link works the usual way/.test(txt(main)) && !copied.includes("live=") && store.get("liveLinks").length === 0 && !q("#pl-live").checked);

console.log("\nTEST 8 - the page");
own(); relay = fakeRelay(); await mountSend(); await tick(q("#pl-live"), true); click(q("#pl-copy")); await wait(120);
const liveOut = copied, theLink = store.get("liveLinks")[0];
const webHtml = fs.readFileSync(path.join(WEB, "index.html"), "utf8").replace(/<script[\s\S]*?<\/script>/g, "");
async function page(url) {
  const pg = new JSDOM(webHtml, { url, pretendToBeVisual: true });
  for (const [k, v] of [["document", pg.window.document], ["location", pg.window.location], ["window", pg.window]]) globalThis[k] = v;
  const EP = await import(new URL("file://" + path.join(WEB, "edit-plan.js")).href);
  return { pg, EP, D: pg.window.document };
}
const appGlobals = { document: globalThis.document, location: globalThis.location, window: globalThis.window };
const { pg, EP, D } = await page(liveOut);
const pageRelay = fakeRelay(); pageRelay.chans = relay.chans; Object.assign(pageRelay, { post: relay.post, fetchSince: relay.fetchSince });
EP._useClient({ ...relay, on: true });
await EP.start(new URL(liveOut).hash); await wait(100);
const pt = () => txt(D.getElementById("ep-app"));
ok("8a. it says where the changes go, and that we can't read them", /go straight to their phone, locked on this device so only their phone can read them\. We can’t read them, and they are deleted once their phone has them \(30 days at most\)\./.test(pt()));
const ptype = async (el, v) => { el.value = v; el.dispatchEvent(new pg.window.Event("input", { bubbles: true })); await wait(10); };
await ptype(D.querySelector("#ex-0-0-r"), "15");
D.querySelector("#ep-make").dispatchEvent(new pg.window.MouseEvent("click", { bubbles: true })); await wait(250);
const post = relay.calls.find(c => c[0] === "post");
ok("8b. Send back: sent straight to their phone, said", !!post && txt(D.querySelector("#ep-back-h")) === "Sent straight to their phone" && /next time they open Alongside: Move/.test(pt()));
ok("8c. only sealed bytes, to that link: no words, no key", post && post[1] === theLink.id && !/Glute|bridge|Gym|15/.test(J(post[2]).replace(/"iv":"[^"]*"/, "")) && !J(post[2]).includes(theLink.key));
ok("8d. the back link is there too", D.querySelector("#ep-link").value.startsWith("https://app.buildnewhabits.co.uk/#back=v1."));
EP._useClient({ ...relay, on: true, post: async () => null });
await EP.start(new URL(liveOut).hash); await wait(100);
D.querySelector("#ep-make").dispatchEvent(new pg.window.MouseEvent("click", { bubbles: true })); await wait(250);
ok("8e. not sent: said, and the link is the way", /couldn’t be sent straight to their phone just now\. Send them this link instead/.test(pt()));
let pagePosts = 0;
EP._useClient({ ...relay, on: true, post: async () => { pagePosts++; return 1; } });
await EP.start("#" + liveOut.split("#")[1].split("&live=")[0]); await wait(100);
D.querySelector("#ep-make").dispatchEvent(new pg.window.MouseEvent("click", { bubbles: true })); await wait(200);
ok("8f. a link with no live part: Stage 1's words, no call", /Nothing you type is sent to us or kept/.test(pt()) && pagePosts === 0);
EP._useClient(LL.relayClient({}));
await EP.start(new URL(liveOut).hash); await wait(100);
ok("8g. the relay not set up on the page: Stage 1's words, even with a live part", /Nothing you type is sent to us or kept/.test(pt()));
Object.assign(globalThis, appGlobals);

console.log("\nTEST 9 - collecting");
relay.calls.length = 0;
ok("9a. one new set of changes", (await LC.checkLive({ client: relay, force: true })) === 1);
const inbox = store.get("liveInbox");
ok("9b. kept as the plan link's code, readable, not noticed yet", inbox.length === 1 && (await PL.decodePlan(inbox[0].code)).plan?.t === "back" && inbox[0].link === theLink.id && inbox[0].noticed === false);
ok("9c. deleted from the relay with this phone's secret; after moved on", relay.calls.some(c => c[0] === "ack" && c[2] === theLink.owner && c[3] === inbox[0].msg) && relay.chans.get(theLink.id).msgs.length === 0 && store.get("liveLinks")[0].after === inbox[0].msg);
ok("9d. again: nothing new", (await LC.checkLive({ client: relay, force: true })) === 0);
await relay.post(theLink.id, await LL.seal(LL.newLiveLink().key, await backCode()));
await relay.post(theLink.id, await LL.seal(theLink.key, await PL.encodePlan(PL.outFromOwn(OWN))));
await relay.post(theLink.id, await LL.seal(theLink.key, "hello"));
ok("9e. sealed with another key, not changes, or not a plan: ignored, but cleared", (await LC.checkLive({ client: relay, force: true })) === 0 && relay.chans.get(theLink.id).msgs.length === 0);
const before = relay.calls.length;
ok("9f. within 2 minutes: no call", (await LC.checkLive({ client: relay })) === 0 && relay.calls.length === before);

console.log("\nTEST 10 - Home, My exercises");
const keepInbox = store.get("liveInbox"), keepLinks = store.get("liveLinks");
own(); store.addLiveInbox(keepInbox); store.saveLiveLink(keepLinks[0]);
store.set("checkinHistory", {}); home();
ok("10a. Home asks, in its words", txt(q(".path-ask__q")) === "Your physio or trainer sent changes to your exercises." && [...q(".path-ask").querySelectorAll("button")].map(txt).join("|") === "Look at them|Later");
own(); store.addLiveInbox(keepInbox); fixture({ checkin: { energy: 7, mood: 3 } }); set(MY); store.setMyMove({ startClosed: "2026-11-01T09:00:00.000Z" }); store.addLiveInbox(keepInbox); store.set("prescribedExercises", OWN.map(x => ({ ...x }))); home();
ok("10b. it comes first; the other questions wait", main.querySelectorAll(".path-ask").length === 1 && /physio or trainer sent changes/.test(txt(q(".path-ask__q"))));
fixture({ checkin: { energy: 2, mood: 6 } }); set(MY); store.addLiveInbox(keepInbox); home();
ok("10c. not on a hard day", !/sent changes/.test(txt(main)));
own(); store.addLiveInbox(keepInbox); home();
click(q('[data-action="ask-live-no"]')); home();
ok("10d. Later: not asked again", !/sent changes/.test(txt(main)) && store.get("liveInbox")[0].noticed === true);
main.innerHTML = PX.render(); PX.onMount();
const row = q("[data-px-live]");
ok("10e. My exercises: Changes from your physio or trainer, with when", /Changes from your physio or trainer/.test(txt(main)) && !!row && /Look at them, sent \d+ \w+/.test(txt(row)));
click(row);
ok("10f. Look at them: What they changed, with it", navs.at(-1) === "plan-link-back" && fakeRouter.planBack === keepInbox[0].code && fakeRouter.planBackInbox === `${keepInbox[0].link}:${keepInbox[0].msg}`);
main.innerHTML = ""; await BACK.PlanLinkBackView(fakeRouter).mount(main); await wait(40);
ok("10g. it reads it", txt(q("h1")) === "What your physio or trainer changed" && /Glute bridge: 3 × 12 → 3 × 15/.test(txt(main)));
click(q("#plb-use")); await wait(20);
ok("10h. used: gone from the waiting list", store.get("liveInbox").length === 0 && store.get("prescribedExercises")[0].reps === "15");
own(); store.addLiveInbox(keepInbox); home(); click(q('[data-action="ask-live-yes"]'));
main.innerHTML = ""; await BACK.PlanLinkBackView(fakeRouter).mount(main); await wait(40); click(q("#plb-keep"));
ok("10i. Look at them from Home, Keep my list: gone, nothing changed", store.get("liveInbox").length === 0 && store.get("prescribedExercises")[0].reps === "12");

console.log("\nTEST 11 - Stop");
own(); relay = fakeRelay(); await mountSend(); await tick(q("#pl-live"), true); click(q("#pl-copy")); await wait(120);
const stopId = store.get("liveLinks")[0].id, stopOwner = store.get("liveLinks")[0].owner;
click(q(`[data-stop="${stopId}"]`)); await wait(80);
ok("11a. closed on the relay with this phone's secret, and here", relay.calls.some(c => c[0] === "close" && c[1] === stopId && c[2] === stopOwner) && !relay.chans.has(stopId) && store.get("liveLinks").length === 0);
await wait(60);
ok("11b. said", /Live link stopped/.test(txt(q("#pl-status"))) && !q(".pl-live"));

console.log("\nTEST 12 - Free");
own("free"); store.saveLiveLink(keepLinks[0]); relay = fakeRelay();
ok("12a. nothing collected, no call", (await LC.checkLive({ client: relay, force: true })) === 0 && relay.calls.length === 0);

console.log("\nTEST 13 - relay.sql");
const sql = fs.readFileSync(new URL("../docs/relay/relay.sql", import.meta.url), "utf8");
ok("13a. row level security on, every grant taken away", /alter table public\.relay_channels enable row level security/.test(sql) && /alter table public\.relay_messages enable row level security/.test(sql) && /revoke all on public\.relay_channels, public\.relay_messages from anon/.test(sql) && !/create policy/i.test(sql));
const grant = /grant execute on function([\s\S]*?)to anon/.exec(sql)?.[1] || "";
ok("13b. anon may call the five, never the cleaner", ["relay_open", "relay_post", "relay_fetch", "relay_ack", "relay_close"].every(f => grant.includes(f)) && !grant.includes("relay_clean"));
ok("13d. Supabase's default grants taken away by name (anon and authenticated)", /revoke all on function[\s\S]*?relay_clean\(\) from anon/.test(sql) && /relay_clean\(\) from authenticated/.test(sql));
ok("13c. version header", /^-- docs\/relay\/relay\.sql\n-- \d\d \w{3} \d{4} v\d+/.test(sql));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
