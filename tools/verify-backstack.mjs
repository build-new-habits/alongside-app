/**
 * tools/verify-backstack.mjs
 * 31 Aug 2026 v1
 *
 * RETIRE-INTENTION + BACK-STACK.
 *
 * Two faults with the same shape: a person tries to go where they came
 * from, and the app takes them somewhere else.
 *
 * intention.js was raised as wrong on 19 Jul and four more times after
 * that. It duplicated coach-reflection.js, rendered its own
 * <h1>Today</h1> while documenting itself as not being Today, and was
 * the landing place for every session exit. It is deleted, not
 * deprecated -- a retired screen that still loads is the thing that kept
 * this open.
 *
 * BACK worked exactly once per session. back() popped an entry and then
 * called navigate(), which pushed the view being LEFT back on, so the
 * stack oscillated between the last two screens instead of unwinding
 * while the popstate handler kept adding browser entries underneath.
 *
 * Assertion 3 is the one that keeps this shut: no navigation caused by
 * going back may push anything. Everything else follows from it.
 */
import fs from "node:fs";

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };
const strip = s => s
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "")
  .replace(/<!--[\s\S]*?-->/g, "");

const router = strip(fs.readFileSync("js/router.js", "utf8"));

console.log("\nTEST 1 - the screen is gone, not merely unreachable");

check("1a. the file does not exist", () => {
  ok(!fs.existsSync("js/views/intention.js"),
     "js/views/intention.js is still on disk. A retired screen that still loads is " +
     "what kept this open across six weeks and five reports.");
});

check("1b. the route is not registered", () => {
  ok(!/'intention'\s*:/.test(router),
     "router.js still registers an 'intention' route");
});

check("1c. nothing navigates to it", () => {
  const files = fs.readdirSync("js/views").filter(f => f.endsWith(".js"));
  const bad = [];
  for (const f of files) {
    const src = strip(fs.readFileSync("js/views/" + f, "utf8"));
    if (src.includes('navigate("intention")') || src.includes("navigate('intention')")) bad.push(f);
    if (/["']quietReturnRoute["']\s*\)\s*\|\|\s*["']intention["']/.test(src)) bad.push(f + " (fallback)");
  }
  ok(bad.length === 0, "still routing to intention: " + bad.join(", "));
});

check("1d. the shell does not precache it and the CSS is gone", () => {
  const sw = fs.readFileSync("sw.js", "utf8");
  ok(!sw.includes("views/intention.js"),
     "sw.js precaches a file that no longer exists -- offline install would fail");
  const css = fs.readFileSync("css/base/global.css", "utf8");
  ok(!css.includes("intention"), "dead .intention-* rules survive in global.css");
});

console.log("\nTEST 2 - session exits land on the real Today");

check("2. every session view returns to today", () => {
  const views = ["walk-session", "running-session", "yoga-session", "swim-session",
                 "core-session", "cycle-session", "quiet-session", "checkin-mini"];
  for (const v of views) {
    const src = strip(fs.readFileSync(`js/views/${v}.js`, "utf8"));
    ok(src.includes('navigate("today")') || src.includes('|| "today"'),
       `${v}.js has no route home to today`);
  }
});

console.log("\nTEST 3 - going back unwinds instead of oscillating");

check("3a. back() marks its navigation as a back navigation", () => {
  const at = router.indexOf("back() {");
  ok(at > -1, "no back()");
  const body = router.slice(at, router.indexOf("},", at));
  ok(/navigate\([^)]*fromBack:\s*true/.test(body),
     "back() calls navigate() without fromBack, so the view being left is pushed " +
     "straight back on and the stack oscillates instead of unwinding");
});

check("3b. a back navigation pushes nothing, on either stack", () => {
  const at = router.indexOf("async navigate(viewName");
  ok(at > -1, "no navigate()");
  ok(/navigate\(viewName,\s*opts\s*=\s*\{\}\)/.test(router),
     "navigate() does not accept opts");
  const body = router.slice(at, at + 2600);

  const browserPush = body.indexOf("history.pushState");
  ok(browserPush > -1, "navigate() never pushes browser state");
  const guardB = body.lastIndexOf("opts.fromBack", browserPush);
  ok(guardB > -1 && browserPush - guardB < 260,
     "the browser pushState is not guarded by fromBack; going back would add an entry");

  const ourPush = body.indexOf("this.history.push");
  ok(ourPush > -1, "navigate() never pushes internal history");
  const guardO = body.lastIndexOf("opts.fromBack", ourPush);
  ok(guardO > -1 && ourPush - guardO < 200,
     "the internal history push is not guarded by fromBack -- this is the exact " +
     "mechanism that made back work only once");
});

check("3c. the bottom of the stack lets the gesture through", () => {
  ok(router.includes("canGoBack()"), "no canGoBack()");
  // Anchor on the DEFINITION. indexOf found the call site in init()
  // first, and 1200 characters from there contains neither the guard nor
  // the push -- an assertion measuring the wrong region of the file.
  const at = router.indexOf("_setupPopstate() {");
  const body = router.slice(at, at + 1200);
  ok(body.includes("canGoBack()"),
     "popstate re-pushes unconditionally, so the app can never be closed by the " +
     "gesture and which press exits depends on stack drift");
  const guard = body.indexOf("canGoBack()");
  const push  = body.indexOf("history.pushState", guard);
  ok(push > guard, "the exit check runs after the re-push");
});

console.log(fails === 0
  ? "\nBACK-STACK: all assertions pass\n"
  : "\nBACK-STACK: " + fails + " FAILED\n");
process.exit(fails === 0 ? 0 : 1);
