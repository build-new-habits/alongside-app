/**
 * tools/verify-stretch-vary.mjs
 * 06 Sep 2026 v1
 *
 * STRETCH-VARY. Stretch is built by the coach, and varies.
 *
 * ── THE FAULT ───────────────────────────────────────────────────────
 *
 * Nobody decided it. STRETCH-FLOW removed two screens on 2 Sep and took
 * the build-mode DEFAULT with it, one day after SWAP-1 made that default
 * the deterministic builder. So every stretch session in the app was
 * built by buildSessionFromSelection(), which takes pool[0].
 *
 * Measured 06 Sep, before the fix: three consecutive stretch builds
 * returned an IDENTICAL session. After: six builds, six distinct
 * sessions.
 *
 * ── AND THE PART THE SCHEDULE OVERSTATED ────────────────────────────
 *
 * The schedule said stretch "ignores exercisePreferences". Not quite,
 * and the difference matters. `avoid` IS honoured on both routes -- it
 * lives in the shared _filterCandidates (session-builder.js:2270).
 * `less` -- "not keen on this one" -- is applied ONLY inside
 * buildSession (:2768 and :3013). So a stretch user could mark something
 * "less" and be handed it again, unchanged, forever. W2-7 fixed 'less'
 * behaving identically to 'avoid'; this route never asked it at all.
 *
 * ── THE FIXTURE, WHICH TOOK FOUR ATTEMPTS ───────────────────────────
 *
 * Recorded because every one of them looked like a defect and was not:
 *
 *   1. Walked the ordinary screen sequence. Stretch has a ZONE PICKER
 *      after location. Never left it; reported "no session built".
 *   2. Asked for a 20-minute duration. There is no 20 -- 15/30/45/60.
 *   3. Assumed a clean module between builds. State PERSISTS: on a
 *      second run the zones are already chosen and that screen does not
 *      reappear, and the module sits on the preview, not the picker.
 *      It now returns via "Build a different one" -- the behaviour
 *      verify-picker-exit.mjs proved this morning -- and walks whatever
 *      screen is actually in front of it.
 *   4. Marked an exercise "avoid" that was taken from a SEVENTH build,
 *      outside the six measured. "It never comes back" proves nothing
 *      about an exercise that was never coming. The reversal caught it.
 *
 * sawZonePicker records that the picker really was walked at least once,
 * so a run that silently skips it cannot pass.
 *
 * ── SOURCE ANCHORING ────────────────────────────────────────────────
 *
 * Anchored on the branch OPENER, not the bare comparison: the string
 * `selectedType === "stretch"` also appears in the zones routing, and
 * slicing from there measured the wrong code. Comments are stripped
 * first, because the reason for this change names the function it
 * replaced and a naive search finds the explanation and calls it code.
 *
 * Two behavioural breaks caught red, plus one source break. A third
 * break -- leaving buildMode set to "recommend" -- correctly stayed
 * green, because buildMode's only reader is the build-mode handler that
 * stretch returns before reaching. Held by a source assertion that says
 * plainly it is not behavioural.
 */
import { JSDOM } from "jsdom";
const dom=new JSDOM('<!doctype html><html><body><div id="main-content"></div></body></html>',{url:"https://example.org/"});
globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.localStorage=dom.window.localStorage;
let pass=0,fail=0;const fails=[];
const ok=(m,c)=>{if(c){pass++;console.log("  ok   "+m);}else{fail++;fails.push(m);console.log("  FAIL "+m);}};
const reverses=(m,fn)=>ok("[reversal] "+m,!fn());
const fs=await import("node:fs");
const uiSrc=fs.readFileSync(new URL("../js/views/session-builder-ui.js",import.meta.url),"utf8");
const {store}=await import("../js/store.js");
const SB=await import("../js/session-builder.js");
const ui=await import("../js/views/session-builder-ui.js");
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const click=el=>el&&el.dispatchEvent(new dom.window.MouseEvent("click",{bubbles:true}));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const paint=()=>{document.getElementById("main-content").innerHTML=ui.render();ui.onMount();};
const sig=s=>s.exercises.map(e=>e.id).join(",");

// The stretch path is NOT the ordinary one. It has a ZONE PICKER after
// location, and no equipment or build-mode screens (STRETCH-FLOW, 2 Sep).
// The first draft of this gate clicked the ordinary sequence, never left
// the zone screen, and reported "no session built" -- a fixture failure
// dressed as a defect. Durations are 15/30/45/60; there is no 20.
// The stretch path is NOT the ordinary one. It has a ZONE PICKER after
// location and no equipment or build-mode screens (STRETCH-FLOW, 2 Sep).
// The first draft clicked the ordinary sequence, never left the zone
// screen, and reported "no session built" -- a fixture failure dressed
// as a defect. Durations are 15/30/45/60; there is no 20.
//
// Module state also PERSISTS between builds: on a second run the zones
// are already chosen and that screen does not reappear. So this walks
// whatever screen is actually in front of it rather than a script, and
// throws rather than returning something empty. sawZonePicker records
// that the picker really was reached at least once, so a run that never
// sees it cannot pass quietly.
let sawZonePicker=false;
async function buildStretch(){
  paint();
  // After a build the module sits on the preview. "Build a different one"
  // returns to the type picker -- the behaviour verify-picker-exit.mjs
  // proved this morning, used here as the way back rather than reaching
  // into module state.
  if($("#sb-rebuild-btn")){ click($("#sb-rebuild-btn")); }
  const tile=$$(".sb-type-tile").find(b=>b.dataset.type==="stretch");
  if(!tile) throw new Error("FIXTURE FAULT: no stretch tile");
  click(tile);
  if($("#sb-location-continue-btn")) click($("#sb-location-continue-btn"));
  if($$(".sb-zone-chip").length){
    sawZonePicker=true;
    click($$(".sb-zone-chip")[0]);
    click($("#sb-zones-continue-btn"));
  }
  const dur=$$(".sb-duration-btn").find(b=>b.dataset.mins==="30");
  if(!dur) throw new Error("FIXTURE FAULT: duration screen not reached");
  click(dur);
  await wait(1400);
  const rec=store.get("generatedSession");
  if(!rec||!rec.session) throw new Error("FIXTURE FAULT: no session was built");
  return rec.session;
}

console.log("\nSTRETCH-VARY — stretch is built by the coach, and varies\n");
store.set("exercisePreferences",{});
store.set("conditions",[]);store.set("conditionPainScores",{});

const a=await buildStretch();
ok("FIXTURE REACHES THE PREVIEW, not an earlier screen", !!$("#sb-go-btn"));
ok("a real stretch session was built", a && a.exercises.length>2);
reverses("the build-mode screen is still skipped for stretch (STRETCH-FLOW holds)",
  ()=>$$(".sb-buildmode-btn").length>0);

const sigs=new Set([sig(a)]);
for(let i=0;i<5;i++){ sigs.add(sig(await buildStretch())); }
ok(`stretch VARIES across six builds (${sigs.size} distinct sessions)`, sigs.size>1);

// The deterministic route must still be deterministic -- otherwise the
// comparison above proves nothing about which builder ran.
const args={sessionType:"stretch",durationMins:30,equipmentOverride:[],preset:"balanced"};
const pool=SB.buildCandidatePools(args);
const rec=[];["warmup","main","cooldown"].forEach(s=>(pool[s]||[]).forEach(e=>{if(e.recommended)rec.push(e.id);}));
const R=()=>SB.buildSessionFromSelection({sessionType:"stretch",durationMins:30,selectedIds:rec,equipmentOverride:[]});
ok("FIXTURE: the stretch zone picker really was walked, not skipped", sawZonePicker);
ok("CONTROL: the retired route really is deterministic", sig(R())===sig(R()));
reverses("stretch is not simply returning the retired route's session",
  ()=>[...sigs].every(s=>s===sig(R())));

// "not keen on this one" -- honoured only inside buildSession.
console.log("\n'Not keen on this one' reaches the stretch builder\n");
// The victim must be one the builder ACTUALLY produced in the runs
// measured above -- otherwise "it never comes back" proves nothing,
// because it may never have been coming in the first place. The first
// draft took it from a seventh build that was not in `sigs`, and the
// reversal below caught that.
const victim=a.exercises.find(e=>[...sigs].some(s=>s.split(",").includes(e.id)));
ok("FIXTURE: the victim is an exercise these builds really produced",
  !!victim && [...sigs].some(s=>s.split(",").includes(victim.id)));
store.set("exercisePreferences",{[victim.id]:{preference:"avoid",setAt:Date.now(),source:"gate"}});
let seen=0; for(let i=0;i<6;i++){ if(sig(await buildStretch()).split(",").includes(victim.id)) seen++; }
ok(`an "avoid" exercise never comes back (${seen} of 6)`, seen===0);
reverses("the exercise was reachable before it was marked, so this is not a vacuous pass",
  ()=>![...sigs].some(s=>s.split(",").includes(victim.id)) && seen===0);
store.set("exercisePreferences",{});

// Comments stripped first: the REASON for this change names the function
// it replaced, and a naive search finds the explanation and calls it the
// code. Same trap as verify-tier-visible.mjs hit today.
const uiCode=uiSrc.replace(/\/\*[\s\S]*?\*\//g,"").replace(/^\s*\/\/.*$/gm,"");
// Anchor on the BRANCH OPENER, not the bare comparison: the string
// `selectedType === "stretch"` also appears earlier, in the zones
// routing, and slicing from there measured the wrong code entirely.
const OPENER='if (selectedType === "stretch") {';
ok("FIXTURE: the branch opener is unique in the stripped source",
  uiCode.split(OPENER).length-1===1);
const stretchBranch=uiCode.slice(uiCode.indexOf(OPENER));
ok("FIXTURE: the stretch branch was actually located",
  stretchBranch.startsWith(OPENER) && stretchBranch.length>50);
ok("the stretch branch routes to triggerBuild(), not the retired builder",
  /triggerBuild\(\)/.test(stretchBranch.slice(0,400)));
// [SOURCE ONLY, AND SAID SO] buildMode has exactly one reader -- the
// build-mode click handler -- which the stretch branch returns before
// reaching. So leaving it set to "recommend" changes NOTHING that can be
// observed, and a break doing exactly that was run and correctly stayed
// green. It is still state that lies about which builder ran, so it is
// held here rather than left to drift. This assertion is not behavioural
// and does not pretend to be.
ok("[source only] the stretch branch records the builder it actually used",
  /buildMode = "coach"/.test(stretchBranch.slice(0,400)));
reverses("it no longer calls triggerRecommendedBuild() for stretch",
  ()=>/triggerRecommendedBuild\(\)/.test(stretchBranch.slice(0,400)));

console.log("\n────────────────────────────────\n"+pass+" passed, "+fail+" failed");
if(fails.length){fails.forEach(f=>console.log("  - "+f));process.exit(1);}
console.log("STRETCH-VARY green.\n");
