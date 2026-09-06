/**
 * tools/verify-arc-door.mjs
 * 06 Sep 2026 v1
 *
 * ARC-DOOR. Free gets the door. Never the arc.
 *
 * ── THE LEAK THIS CLOSES ────────────────────────────────────────────
 *
 * arcPanel() had TWO call sites. today.js:~690 was gated behind
 * isPremium(). The one inside freeChooser() was not. So a free user with
 * arc.active true rendered the full today-arc--active panel, aim and
 * strands and all, with no lock wrapper -- the paid product, on Home,
 * free. The offer card also routed to "arc-setup" with no tier check, so
 * the entire path was open: offer -> setup -> active arc -> full panel.
 *
 * "Free is today, the Plan is the arc." Both halves were breached.
 *
 * ── WHY IT SURVIVED TWO INSPECTIONS ─────────────────────────────────
 *
 * Graeme asked why free was showing him an arc. He was told the arc was
 * correctly gated at today.js:690 and his handset must be on the Plan.
 * That answer was wrong -- it came from finding one call site and not
 * looking for a second.
 *
 * It was then checked again with a fixture that set arc.aimId but NOT
 * arc.active. That combination lands on the OFFER branch, which renders
 * correctly for free, and the check reported no leak. The fixture had
 * not reached the branch it named.
 *
 * So the first assertions below are about the FIXTURE, not the feature:
 * they prove the Plan render really is today-arc--active before anything
 * concludes that free's is not.
 *
 * ── WHERE THE RULE LIVES, AND WHY IT MATTERS ────────────────────────
 *
 * Inside arcPanel(), not at the call sites. Patching only the site that
 * was found is precisely how this happened. A third caller added later
 * inherits the rule instead of reopening the hole.
 *
 * Three deliberate breaks, three caught red: restoring the original leak;
 * pointing the free door back at arc-setup; inverting the tier test.
 */
import { JSDOM } from "jsdom";
const dom=new JSDOM('<!doctype html><html><body><div id="main-content"></div></body></html>',{url:"https://example.org/"});
globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.localStorage=dom.window.localStorage;
let pass=0,fail=0;const fails=[];
const ok=(m,c)=>{if(c){pass++;console.log("  ok   "+m);}else{fail++;fails.push(m);console.log("  FAIL "+m);}};
const reverses=(m,fn)=>ok("[reversal] "+m,!fn());
const fs=await import("node:fs");
const todaySrc=fs.readFileSync(new URL("../js/views/today.js",import.meta.url),"utf8");
const {store}=await import("../js/store.js");
const {isPremium}=await import("../js/auth.js");
const today=await import("../js/views/today.js");
const {router}=await import("../js/router.js");
const paint=()=>{today.TodayView(router).mount(document.getElementById("main-content"));};
const ACTIVE_ARC={active:true,aimId:"core-hold",label:"Build a core that actually holds me up",
  strands:[{id:"trunk",label:"Trunk strength"},{id:"back",label:"A back that copes"}]};

console.log("\nARC-DOOR — free gets the door, never the arc\n");

// FIXTURE INTEGRITY FIRST. The previous investigation set aimId without
// active, landed on the offer branch, and reported no leak.
store.set("tier","personal"); store.set("arc",ACTIVE_ARC); paint();
const paidEl=document.querySelector(".today-arc");
ok("FIXTURE REACHES THE ACTIVE BRANCH: Plan renders today-arc--active",
  paidEl && /today-arc--active/.test(paidEl.className));
reverses("the fixture is not quietly on the offer branch (the fault that hid this)",
  ()=>/today-arc--offer/.test(paidEl.className));

store.set("tier","free"); paint();
const freeEl=document.querySelector(".today-arc");
ok("free, WITH an active arc stored, still gets only the offer",
  freeEl && /today-arc--offer/.test(freeEl.className));
reverses("free does not render the active arc panel",
  ()=>/today-arc--active/.test(freeEl.className));
ok("and the aim itself never appears on free",
  !/Build a core that actually holds me up/.test(document.getElementById("main-content").innerHTML));

ok("the free door leads to upgrade, not arc-setup",
  freeEl.dataset.route==="upgrade");
reverses("free cannot walk into arc setup from Home",
  ()=>freeEl.dataset.route==="arc-setup");

// Plan with no arc keeps the real setup entrance.
store.set("tier","personal"); store.set("arc",{}); paint();
const setupEl=document.querySelector(".today-arc");
ok("Plan without an arc still gets the SETUP entrance",
  setupEl && setupEl.dataset.route==="arc-setup");

// The rule must live in arcPanel(), not at a call site.
const fn=todaySrc.slice(todaySrc.indexOf("function arcPanel() {"));
ok("the tier rule is inside arcPanel(), so every call site inherits it",
  /isPremium\(\)/.test(fn.slice(0,1400)));
reverses("the slice is the function, not an empty string",()=>fn.length<200);
ok("BOTH call sites exist and neither can leak",
  (todaySrc.match(/arcPanel\(\)/g)||[]).length>=3);

console.log("\n────────────────────────────────\n"+pass+" passed, "+fail+" failed");
if(fails.length){fails.forEach(f=>console.log("  - "+f));process.exit(1);}
console.log("ARC-DOOR green.\n");
