/**
 * tools/verify-arc-door.mjs
 * 24 Nov 2026 v7
 *
 * v7 - P-46 S4 FREE HOME. Free Home has no arc row now (the arc is the
 *   Plan's). Free with an arc stored: no arc on Home, the aim never shown, and
 *   arc-setup is a Free-moved route. The arcPanel() source checks went with
 *   arcPanel().
 *
 * 28 Oct 2026 v6
 *
 * v6 - STAGE PATH P-4 re-point (none loosened; mock-up v9, Graeme approved
 *   28 Oct). The Plan's Home says the arc as a line, not a button; with no
 *   arc it says nothing, and the setup entrance is Progress's Set up your
 *   arc (driven). Every Free assertion unchanged.
 *
 * v5 - A-1 PLAN-HOME-PRUNE (Graeme approved the mock-up, 12 Oct). REACH
 *   only: Plan Home's arc is a line inside the Today card, no longer its
 *   own .home-arc card. Found by its route (stretch-arc, or arc-setup with
 *   no arc), as a person finds it by its words. Every assertion unchanged.
 *
 *
 * v4 - D-3 ARC-HOME. REVERSAL of v3, from the device test (Graeme's wife
 *   expected the arc, and how to change it, not Progress): the Plan chip
 *   opens the arc screen (stretch-arc) again. The fixture check follows
 *   it; nothing else changed.
 *
 * 28 Sep 2026 v3
 *
 * v3 - SMOOTH-P4a. The Plan chip now opens Progress, where the arc is
 *   read back (spec 4.1). The fixture check follows it; nothing else.
 *
 * v2 - SMOOTH-P3a. Plan Home shows the arc as one line (.home-arc), not
 *   the panel (.today-arc). The Plan half of the fixture check now reads
 *   the chip: active arc -> opens the arc with the aim's words; no arc ->
 *   the setup entrance. Every free assertion is unchanged -- free still
 *   renders arcPanel(), and the tier rule inside it is still asserted.
 *
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
// v6 (Stage PATH, mock-up v9): the Plan's Home says the arc as a line; it opens from Progress.
store.set("tier","personal");store.set("arc",ACTIVE_ARC); paint();
const paidEl=document.querySelector(".path-arcline");
ok("FIXTURE REACHES THE ACTIVE BRANCH: Plan's arc line says the arc, with the aim",
  paidEl && /Build a core that actually holds me up/.test(paidEl.textContent));
reverses("the fixture is not quietly on the offer branch (the fault that hid this)",
  ()=>!!document.querySelector('#main-content [data-route="arc-setup"]'));

// P-46 S4 FREE HOME. Free Home has no arc row at all now (spec §5: the arc row
// moved to the Plan); Free asking for arc-setup gets the on-the-plan page
// (router FREE_MOVED, verify-p46-free-home 7).
store.set("tier","free"); paint();
const fm=document.getElementById("main-content");
ok("free, WITH an active arc stored, gets no arc on Home at all",
  !fm.querySelector(".today-arc, .path-arcline") && !!fm.querySelector(".free-home"));
ok("and the aim itself never appears on free",
  !/Build a core that actually holds me up/.test(fm.innerHTML));
reverses("free cannot walk into arc setup from Home",
  ()=>!!fm.querySelector('[data-route="arc-setup"]'));
const routerSrc=fs.readFileSync(new URL("../js/router.js", import.meta.url),"utf8");
ok("arc-setup and the arc itself are Free-moved routes (the router sends Free to on-the-plan)",
  /FREE_MOVED = new Set\([\s\S]{0,300}'arc-setup'[\s\S]{0,40}'stretch-arc'/.test(routerSrc));

// Plan with no arc keeps the real setup entrance.
store.set("tier","personal");store.set("arc",{}); paint();
ok("Plan without an arc: Home says no arc (nothing to say yet)", !document.querySelector(".path-arcline"));
const {ProgressView}=await import("../js/views/progress.js");
const pm=document.getElementById("main-content"); pm.innerHTML=""; ProgressView({navigate(){},back(){},history:["x"]}).mount(pm);
const setupEl=pm.querySelector('[data-route="arc-setup"]');
ok("Plan without an arc still gets the SETUP entrance (Progress, Set up your arc)",
  setupEl && setupEl.dataset.route==="arc-setup");

console.log("\n────────────────────────────────\n"+pass+" passed, "+fail+" failed");
if(fails.length){fails.forEach(f=>console.log("  - "+f));process.exit(1);}
console.log("ARC-DOOR green.\n");
