/**
 * tools/verify-empty1.mjs
 * 22 Aug 2026 v1
 *
 * EMPTY-1 — a fallback that crashes is not a fallback.
 *
 * workout.js guarded that a workout EXISTED and never that it CONTAINED
 * anything. A session with exercises: [] passed the guard and the next
 * line read .role off undefined — a blank crash, mid-journey, with the
 * person having just chosen to train.
 *
 * NOT HYPOTHETICAL. coach-proposal.js _getFallbackOptions() returns
 * exercises: [] by design, and BIAS-3 meant that fallback was serving
 * EVERY user. "Strength session" and "Gentle movement" both carry
 * type: 'workout' and route here, so the FIRST option on Door 1, in both
 * energy branches, landed on the crash.
 *
 * TWO CRASHES, NOT ONE. Guarding render() looked complete and was not:
 * onMount runs regardless of what render returned, and the timer read
 * .duration off exercises[0]. Found only by executing the view AGAIN
 * after the first fix. This is why the gate mounts rather than renders.
 */
// GATE-PATH, 21 Aug 2026 (adopted): jsdom resolved through Node rather
// than by absolute path into one machine's node_modules.
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="main-content"></div>',
  { url: "https://build-new-habits.github.io/alongside-app/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator","localStorage","history","location",
                 "requestAnimationFrame","getComputedStyle","matchMedia","scrollTo"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });

const BASE = new URL("../js/", import.meta.url).href;
const { store }  = await import(BASE + "store.js");
const { router } = await import(BASE + "router.js");
dom.window.router = router; globalThis.router = router; router.navigate = () => {}; router.back = () => {};

let failures = 0;
const check = (name, ok, detail = "") => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
  if (!ok) failures++;
};

console.log("\nEMPTY-1 — every fallback route survives an empty session\n");

const el = document.getElementById("main-content");

// Every route _routeForOption() can send a FALLBACK option to.
for (const type of ["workout","yoga-session","walk-session","quiet-session","core-session"]) {
  localStorage.clear(); store.init();
  store.set("generatedSession", {
    session: { id: "fb", name: "X", type, duration: 20, exerciseCount: 4, exercises: [] },
    builtAt: new Date().toISOString(), inputs: {}
  });
  let threw = null;
  try {
    const M = await import(BASE + "views/" + type.replace("workout","workout") + ".js");
    if (M.render) { el.innerHTML = M.render(); M.onMount?.(); }
    else {
      const V = Object.values(M).find(v => typeof v === "function" && /View$/.test(v.name));
      const c = document.createElement("div"); document.body.appendChild(c);
      V(router).mount(c);
    }
  } catch (e) { threw = e.message; }
  check(`"${type}" survives a session with exercises: []`, !threw,
    threw || "mounted, not just rendered");
}

// The message must not blame the person.
localStorage.clear(); store.init();
store.set("generatedSession", { session: { id:"fb", name:"X", type:"workout", duration:20, exerciseCount:4, exercises: [] }, builtAt:new Date().toISOString(), inputs:{} });
const W = await import(BASE + "views/workout.js");
el.innerHTML = W.render(); W.onMount?.();
const text = el.textContent || "";
check("the empty screen says something honest", /could not build|went wrong/i.test(text), text.trim().slice(0,60));
check("and does not blame the person", !/you did|your fault|you have not/i.test(text));
check("and offers a way out", !!document.getElementById("no-workout-back-btn"));

console.log(failures === 0 ? "\nEMPTY-1 GATE GREEN\n" : `\nEMPTY-1 GATE RED — ${failures} failure(s)\n`);
process.exit(failures === 0 ? 0 : 1);
