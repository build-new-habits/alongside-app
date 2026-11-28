/**
 * tools/verify-accounts-screens.mjs
 * 28 Nov 2026 v1
 *
 * Row 13a ACCOUNTS, S2 (mock-up v2 approved by Graeme 28 Nov:
 * Product/alongside_accounts_mockup_28nov2026_v2.html). Against the stand-in
 * service (tools/account-stub.mjs), and the developer demo.
 *
 *   1  The guard: after the age question and the agreement, before anything
 *      else; open: the policies, Help, Settings; off: nothing changes.
 *   2  Screen 1 Your email, as the mock-up; an address that isn't one;
 *      offline (Screen 4).
 *   3  Screen 2 Check your email, and Screen 3; another code; a different
 *      email; signing in goes on to where the person was going.
 *   4  Screen 6 Welcome back.
 *   5  The email's link: taken where it was waited for; Screen 5 elsewhere;
 *      cleared from the address.
 *   6  Settings › Your account (Screens 7, 8): change email, sign out, delete.
 *      Download your data never holds the tokens.
 *   7  Try the Plan and Go back to Free now go through the account.
 *   8  The developer demo: code 123456, nothing sent to the web.
 *   9  No timer on screen; the thirty days are gone from Your plan.
 *
 * Red on alongside-v765.
 */
import fs from "node:fs";
import { createRequire as __cr } from "node:module";
import { agreed } from "./agreed.mjs";
import { server } from "./account-stub.mjs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div><nav id="bottom-nav"></nav></div><button id="hidden-nav-home-btn"></button><div id="sr-announcer"></div>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.history = dom.window.history; globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s).replace(/"/g, '\\"') };
let webCalls = 0;
globalThis.fetch = async () => { webCalls++; return { ok: false, status: 0, json: async () => null }; };

const read = f => fs.readFileSync(new URL("../" + f, import.meta.url), "utf8");
let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${String(detail).slice(0, 300)}`); }
};
async function block(name, fn) { try { await fn(); } catch (e) { ok(`${name}: ran without throwing`, false, e.stack?.split("\n").slice(0, 3).join(" | ")); } }
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const T = el => ((el || main).textContent || "").replace(/\s+/g, " ").trim();
const $ = s => main.querySelector(s);
const tap = s => { const el = typeof s === "string" ? $(s) : s; el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); return !!el; };
const type = (s, v) => { const el = $(s); el.value = v; return el; };

let A, M, store, router, V, TR, SET, UP;
try {
  const B = new URL("../js/", import.meta.url).href;
  ({ store } = await import(B + "store.js"));
  ({ router } = await import(B + "router.js"));
  globalThis.window.router = router; globalThis.router = router;
  A = await import(B + "data/account.js");
  M = await import(B + "data/account-model.js");
  TR = await import(B + "data/plan-trial.js");
  V = await import(B + "views/account-step.js");
  SET = await import(B + "views/settings.js");
  UP = await import(B + "views/upgrade.js");
} catch (e) {
  ok("the email step's files exist and load", false, e.message);
  console.log(`\n${passes} passed, ${fails} failed`);
  process.exit(1);
}
const { settingsFind } = await import(new URL("./settings-open.mjs", import.meta.url).href);
const CONFIG = { url: "https://abcdefghij.supabase.co", anonKey: "public-anon-key-0123456789abcdef" };
const online = v => Object.defineProperty(navigator, "onLine", { value: v, configurable: true });

function person({ done = true, agree = true, tier = "free" } = {}) {
  localStorage.clear(); store.init();
  if (agree) agreed(store);
  store.set("consent", { ...(store.get("consent") || {}), ageConfirmed: true, ageGroup: "adult" });
  store.set("onboardingComplete", done); store.set("name", "Sam"); store.set("tier", tier);
  router.history = ["today"];
  online(true);
}
async function go(route) { await router.navigate(route); await wait(30); return router.currentView; }
const mountStep = () => { V.AccountStepView(router).mount(main); };
const navs = [];
const realNavigate = router.navigate.bind(router);

// ── 1 ─────────────────────────────────────────────────────────────────────
console.log("\nTEST 1 - The guard");
await block("1", async () => {
  person(); A._configureForTest(null, null);
  ok("1a. off: Home opens as before", (await go("today")) === "today");
  const srv = server(); A._configureForTest(CONFIG, srv.fetch);
  person();
  ok("1b. set up, no account: Home opens the email step", (await go("today")) === "account");
  ok("1c. ... and so does any other screen", (await go("progress")) === "account");
  for (const r of ["privacy", "help", "settings"]) ok(`1d. ... but ${r} stays open (the policies, Help, download or delete everything)`, (await go(r)) === r);
  person({ agree: false, done: false });
  ok("1e. before the agreement: the agreement first, not the email step", (await go("today")) !== "account");
  person();
  store.set("consent", { ...(store.get("consent") || {}), ageConfirmed: false });
  ok("1f. before the age question: the age question first", (await go("today")) !== "account");
  person(); await go("progress");
  ok("1g. the email step is full screen: no bar, no house", document.getElementById("bottom-nav").classList.contains("hidden"));
  const src = read("js/router.js");
  const iCV = src.indexOf("this._cv.guardRoute(viewName)"), iAC = src.indexOf("this._acc.guardRoute(viewName)"), iAge = src.indexOf("this._ac.guardRoute(viewName)");
  person(); A._configureForTest(null, null);
  ok("1i. off: the email step itself sends you on", (await go("account")) === "today");
  A._configureForTest(CONFIG, server().fetch);
  ok("1h. in the router: age, then agreement, then the account", iAge > 0 && iCV > iAge && iAC > iCV);
});

// ── 2 ─────────────────────────────────────────────────────────────────────
console.log("\nTEST 2 - Screen 1, Your email");
await block("2", async () => {
  const srv = server(); A._configureForTest(CONFIG, srv.fetch);
  person(); mountStep();
  ok("2a. the heading is Your email, and has focus", T($("h1")) === "Your email" && document.activeElement === $("#ac-title"));
  ok("2b. why, in the mock-up's words", T().includes("So you can move between Free and the Plan, and sign in on another phone. No password: we'll send you a code."));
  ok("2c. the card: We only use it to sign you in; news comes in Messages (not \"we never send marketing\")", T($("#ac-only")) === "We only use it to sign you in Your answers, check-ins and history stay on this phone. News from us comes in the app, in Messages." && !/never send marketing/i.test(T()));
  const f = $("#ac-email");
  ok("2d. a visible label tied to the field", $('label[for="ac-email"]') && T($('label[for="ac-email"]')) === "Email address");
  ok("2e. the email keyboard, and the phone's own address", f.type === "email" && f.getAttribute("autocomplete") === "email" && f.getAttribute("autocapitalize") === "none");
  ok("2f. one button: Send me a code", T($("#ac-send")) === "Send me a code");
  type("#ac-email", "sam at home"); tap("#ac-send"); await wait(20);
  ok("2g. not an address: said in words, tied to the field, focus on it", T($("#ac-error")) === V.SAY.invalid && $("#ac-email").getAttribute("aria-invalid") === "true" && $("#ac-email").getAttribute("aria-describedby") === "ac-error" && document.activeElement === $("#ac-email"));
  ok("2h. ... the error is announced", $("#ac-error").getAttribute("role") === "alert");
  person(); online(false); mountStep();
  ok("2i. offline (Screen 4): You need to be online for this step; Try again", /You need to be online for this step\. Everything else works without a connection\./.test(T($("#ac-error"))) && T($("#ac-send")) === "Try again" && $("#ac-email").getAttribute("aria-invalid") !== "true");
  online(true);
  ok("2j. nothing sent yet", srv.log.length === 0);
});

// ── 3 ─────────────────────────────────────────────────────────────────────
console.log("\nTEST 3 - Screen 2, Check your email; Screen 3");
await block("3", async () => {
  const srv = server(); A._configureForTest(CONFIG, srv.fetch);
  person({ done: false }); await go("onboarding/start");
  ok("3a. setting up: onboarding's start is held for the email step", router.currentView === "account", router.currentView + " | " + T().slice(0, 200));
  type("#ac-email", " Sam@Example.com "); tap("#ac-send"); await wait(30);
  ok("3b. a code asked for; Check your email, with the address and 15 minutes", T($("h1")) === "Check your email" && T($("#ac-sent")) === "We've sent a 6-digit code to sam@example.com. It works for 15 minutes." && srv.log.at(-1).path === "/auth/v1/otp");
  const c = $("#ac-code");
  ok("3c. the code field: label, number keyboard, the phone's code suggestion", T($('label[for="ac-code"]')) === "Code" && c.getAttribute("inputmode") === "numeric" && c.getAttribute("autocomplete") === "one-time-code" && c.getAttribute("maxlength") === "6");
  ok("3d. Sign in, Send another code, Use a different email, and the junk folder", T($("#ac-sign-in")) === "Sign in" && T($("#ac-another")) === "Send another code" && T($("#ac-different")) === "Use a different email" && T().includes("Not there? Check your junk or spam folder."));
  ok("3e. a way back to the address", T($("#ac-back")) === "‹ Back");
  type("#ac-code", "000000"); tap("#ac-sign-in"); await wait(30);
  ok("3f. a wrong code (Screen 3): That code didn't work, tied and announced, focus on the field", /That code didn't work\. Check the 6 digits, or send another code\./.test(T($("#ac-error"))) && $("#ac-code").getAttribute("aria-invalid") === "true" && document.activeElement === $("#ac-code"));
  tap("#ac-another"); await wait(30);
  ok("3g. another code within 60 seconds: how long, in words, no ticking", /^You can send another code in \d+ seconds?\.$/.test(T($("#ac-error"))), T($("#ac-error")));
  tap("#ac-different"); await wait(20);
  ok("3h. Use a different email: Screen 1, the address there to change", T($("h1")) === "Your email" && $("#ac-email").value === "sam@example.com");
  store.set("account", { pending: { ...store.get("account").pending, sentAt: new Date(Date.now() - 120000).toISOString() } });   // a couple of minutes on
  tap("#ac-send"); await wait(30);
  const n = srv.log.length;
  type("#ac-code", srv.code);
  router.navigate = async (v, o) => { navs.push(v); return realNavigate(v, o); };
  tap("#ac-sign-in"); await wait(60);
  router.navigate = realNavigate;
  ok("3i. the right code signs in, and goes on to where they were going", A.signedIn() && navs.at(-1) === "onboarding/start" && srv.log.slice(n).some(l => l.path === "/auth/v1/verify"));
  ok("3j. now the guard lets them by", (await go("today")) === "today");
});

// ── 4 ─────────────────────────────────────────────────────────────────────
console.log("\nTEST 4 - Screen 6, Welcome back");
await block("4", async () => {
  const srv = server({ createdAt: "2026-06-01T09:00:00.000Z" }); A._configureForTest(CONFIG, srv.fetch);
  person(); await A.sendCode("sam@example.com"); await A.verifyCode(srv.code); await A.tryThePlan(); await A.signOut();
  person(); await go("today");
  type("#ac-email", "sam@example.com"); tap("#ac-send"); await wait(30);
  type("#ac-code", srv.code); tap("#ac-sign-in"); await wait(60);
  ok("4a. an account made before: Welcome back", T($("h1")) === "Welcome back");
  ok("4b. the trial came back with it: The Plan is on, until when", /^The Plan is on Your free trial runs until \w+day \d+ \w+\.$/.test(T($("#ac-plan"))) && store.get("tier") === "personal", T($("#ac-plan")));
  ok("4c. history: on the old phone, and how to bring it", T($("#ac-history")) === "Your history is on your old phone To bring it here, use Download your data there, and Restore here.");
  ok("4d. Carry on, and How to move my history", T($("#ac-carry-on")) === "Carry on" && T($("#ac-how")) === "How to move my history");
  tap("#ac-carry-on"); await wait(40);
  ok("4e. Carry on goes on", router.currentView === "today");
});

// ── 5 ─────────────────────────────────────────────────────────────────────
console.log("\nTEST 5 - The email's link");
await block("5", async () => {
  const srv = server(); A._configureForTest(CONFIG, srv.fetch);
  person(); await A.sendCode("sam@example.com");
  // The link Supabase sends back: tokens in the address's fragment.
  const v = await srv.fetch(CONFIG.url + "/auth/v1/verify", { method: "POST", headers: {}, body: JSON.stringify({ email: "sam@example.com", token: srv.code, type: "email" }) }).then(r => r.json());
  const b64 = o => Buffer.from(JSON.stringify(o)).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const jwt = `${b64({ alg: "HS256" })}.${b64({ sub: v.user.id, email: "sam@example.com" })}.signature`;
  srv.tokens[jwt] = v.user.id;
  history.replaceState(null, "", `/#access_token=${jwt}&refresh_token=${v.refresh_token}&expires_in=3600&type=magiclink`);
  const at5 = await go("today");
  ok("5a. where Alongside was waiting: signed in, and on to Home", at5 === "today" && A.signedIn() && store.get("account").userId === v.user.id, at5 + " " + A.signedIn() + " " + JSON.stringify(store.get("account")) + " hash=" + location.hash.slice(0,30));
  ok("5b. the tokens are cleared from the address", !/access_token|refresh_token/.test(location.href), location.href.slice(0, 80));
  person();
  history.replaceState(null, "", `/#access_token=${jwt}&refresh_token=${v.refresh_token}&expires_in=3600&type=magiclink`);
  ok("5c. somewhere it wasn't waiting (Screen 5): Use the code instead", (await go("today")) === "account-link" && !A.signedIn());
  ok("5d. ... in the mock-up's words", T($("h1")) === "Use the code instead" && T().includes("This link opened somewhere Alongside wasn't waiting for it.") && T($("#ac-link-card")) === "Go back to Alongside Type the 6-digit code from the email there.");
  ok("5e. ... and the address cleared there too", !/access_token|refresh_token/.test(location.href));
});

// ── 6 ─────────────────────────────────────────────────────────────────────
console.log("\nTEST 6 - Settings › Your account");
await block("6", async () => {
  const srv = server(); A._configureForTest(CONFIG, srv.fetch);
  person(); await A.sendCode("sam@example.com"); await A.verifyCode(srv.code);
  const s = main;
  SET.SettingsView(router).mount(s); await wait(20);
  const row = settingsFind(s, '[data-open="account"]');
  ok("6a. a row, Your account, with the address", !!row && T(row.querySelector(".settings-row__value")) === "sam@example.com");
  tap(row); await wait(20);
  ok("6b. Screen 7: the address, used only to sign you in", T(s.querySelector("#settings-account-email")) === "sam@example.com" && /Used only to sign you in\./.test(T(s.querySelector("#settings-account"))));
  ok("6c. Change my email, Sign out, Delete my account", ["acct-change", "acct-signout", "acct-delete"].every(a => s.querySelector(`[data-action="${a}"]`)) && T(s.querySelector('[data-action="acct-delete"]')) === "Delete my account");
  tap(s.querySelector('[data-action="acct-change"]')); await wait(10);
  ok("6d. Change my email: a labelled field, focus on it", T(s.querySelector('label[for="settings-account-new"]')) === "New email address" && document.activeElement === s.querySelector("#settings-account-new"));
  s.querySelector("#settings-account-new").value = "new@example.com";
  tap(s.querySelector("#settings-account-send")); await wait(30);
  ok("6e. a code to the new address first; nothing changed yet", /We've sent a 6-digit code to new@example\.com\. Your email changes once you type it here\./.test(T(s)) && store.get("account").email === "sam@example.com");
  s.querySelector("#settings-account-code").value = "111111";
  tap(s.querySelector("#settings-account-confirm")); await wait(30);
  ok("6f. a wrong code: said, and nothing changed", /That code didn.t work/.test(T(s.querySelector("#settings-account-err"))) && store.get("account").email === "sam@example.com");
  s.querySelector("#settings-account-code").value = srv.code;
  tap(s.querySelector("#settings-account-confirm")); await wait(30);
  ok("6g. the right code: changed, and said; the three choices back", store.get("account").email === "new@example.com" && /Your email is now new@example\.com\./.test(T(s.querySelector("#settings-account-status"))) && T(s.querySelector("#settings-account-email")) === "new@example.com" && !!s.querySelector('[data-action="acct-delete"]'));
  router.navigate = async (v, o) => { navs.push(v); };
  tap(s.querySelector('[data-action="acct-delete"]')); await wait(10);
  ok("6h. Delete (Screen 8): one confirm, in the mock-up's words, focus on its heading", T(s.querySelector("#settings-account-del-h")) === "Delete your account?" && /Your email address and account are deleted from our server straight away\. A free trial that.s running ends\./.test(T(s)) && /This phone keeps what.s on it Unless you also use Reset all data in Settings\./.test(T(s)) && document.activeElement === s.querySelector("#settings-account-del-h"));
  ok("6i. ... Delete my account, and the safe choice Keep my account", T(s.querySelector("#settings-account-del-yes")) === "Delete my account" && T(s.querySelector("#settings-account-del-no")) === "Keep my account");
  tap(s.querySelector("#settings-account-del-yes")); await wait(30);
  ok("6j. deleted on the server, signed out here, on to the email step", Object.keys(srv.users).length === 0 && !A.signedIn() && navs.at(-1) === "account");
  await A.sendCode("sam@example.com"); await A.verifyCode(srv.code);
  router.navigate = async (v) => { navs.push(v); };
  SET.SettingsView(router).mount(s); await wait(20);
  tap(settingsFind(s, '[data-open="account"]')); await wait(10);
  tap(s.querySelector('[data-action="acct-signout"]')); await wait(30);
  router.navigate = realNavigate;
  ok("6k. Sign out: signed out, on to the email step, the phone's things kept", !A.signedIn() && navs.at(-1) === "account" && store.get("name") === "Sam");
  ok("6l. Download your data never holds the sign-in tokens", /k !== 'alongside_user' && k !== SESSION_KEY && \/\^alongside\/i\.test\(k\)/.test(read("js/views/settings.js")));
  A._configureForTest(null, null); person();
  SET.SettingsView(router).mount(s); await wait(20);
  ok("6m. off: no Your account row", !settingsFind(s, '[data-open="account"]'));
});

// ── 7 ─────────────────────────────────────────────────────────────────────
console.log("\nTEST 7 - Try the Plan and Go back to Free now, through the account");
await block("7", async () => {
  const srv = server(); A._configureForTest(CONFIG, srv.fetch);
  person(); await A.sendCode("sam@example.com"); await A.verifyCode(srv.code);
  router.navigate = async (v) => { navs.push(v); };
  main.innerHTML = UP.render(); UP.onMount();
  tap("#upgrade-cta"); await wait(40);
  ok("7a. Upgrade's Try the Plan asks the server, then Start your Plan", srv.log.some(l => l.path === "/rest/v1/rpc/start_my_trial") && TR.trialActive() && navs.at(-1) === "my-move");
  SET.SettingsView(router).mount(main); await wait(20);
  tap(settingsFind(main, '[data-open="about-plan"]')); await wait(10);
  tap(main.querySelector('[data-action="trial-stop"]')); await wait(10);
  ok("7b. Go back to Free now: one trial each, said for an account", /you have one trial/.test(T(main.querySelector("#settings-trial-actions"))));
  tap(main.querySelector('[data-action="trial-stop-yes"]')); await wait(40);
  ok("7c. ... tells the server, then Free", srv.log.some(l => l.path === "/rest/v1/rpc/end_my_trial") && store.get("tier") === "free");
  srv.fail = 503;
  store.set("tier", "free");
  A._configureForTest(CONFIG, srv.fetch);
  const srv2 = server(); A._configureForTest(CONFIG, srv2.fetch);
  person(); await A.sendCode("sam@example.com"); await A.verifyCode(srv2.code);
  online(false);
  main.innerHTML = UP.render(); UP.onMount();
  tap("#upgrade-cta"); await wait(40);
  ok("7d. offline: the trial can't start, and the page says so by the button", !TR.trialActive() && /Your trial couldn.t start just now\. Check you.re online, then try again\./.test(T($("#upgrade-cta-note"))) && $("#upgrade-cta-note").getAttribute("role") === "alert");
  online(true);
  router.navigate = realNavigate;
  ok("7e. the finish's Try the Plan goes through the account too", /tryThePlan\(\)\.then\(started => router\.navigate\(started \? "my-move" : "today"\)\)/.test(read("js/views/reflect.js")) && !/\bstartTrial\(/.test(read("js/views/reflect.js")));
});

// ── 8 ─────────────────────────────────────────────────────────────────────
console.log("\nTEST 8 - The developer demo");
await block("8", async () => {
  A._configureForTest(null, null); person(); webCalls = 0;
  ok("8a. demo off and not set up: off", !A.accountsOn());
  A.setDemo(true);
  ok("8b. demo on: the email step is on", A.accountsOn() && A.needsAccount() && (await go("today")) === "account");
  ok("8c. the demo says its code, and that nothing is sent", /Developer demo: the code is 123456\. Nothing is sent anywhere\./.test(T()));
  type("#ac-email", "dev@example.com"); tap("#ac-send"); await wait(30);
  type("#ac-code", "123456"); tap("#ac-sign-in"); await wait(60);
  ok("8d. 123456 signs in", A.signedIn());
  ok("8e. Try the Plan in the demo: one per pretend account", (await A.tryThePlan()) === true && (await A.tryThePlan()) === false);
  ok("8f. nothing went to the web", webCalls === 0, webCalls);
  ok("8g. the demo answers on the phone: no fetch in it", !/\bfetch\(/.test(read("js/data/account-demo.js").replace(/\/\*[\s\S]*?\*\//g, "").replace(/demoFetch\(/g, "")));
  A.setDemo(false);
  SET.SettingsView(router).mount(main); await wait(20);
  ok("8h. the developer panel has the demo, Pretend signed in and Sign out", ["demo", "pretend", "signout"].every(v => read("js/views/settings.js").includes(`data-dev-account="${v}"`)));
});

// ── 9 ─────────────────────────────────────────────────────────────────────
console.log("\nTEST 9 - No timer on screen; the thirty days gone");
await block("9", async () => {
  const v = read("js/views/account-step.js");
  ok("9a. the email step draws no countdown (no setInterval, no ticking seconds)", !/setInterval|requestAnimationFrame/.test(v));
  ok("9b. Your plan on Free no longer says thirty days before paying", !/Thirty days before you pay anything/.test(read("js/views/settings.js")) && /No minimum term\./.test(read("js/views/settings.js")));
});

A._configureForTest(null, null); A.setDemo(false);
console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
