/**
 * audit-content-reachability.mjs
 * 11 Aug 2026 v1
 *
 * Whole-codebase integrity audit. Build-time only, not shipped.
 *
 *     node "Documents/Admin/Templates/audit-content-reachability.mjs"
 *
 * WHY THIS EXISTS
 *
 * Eight times in one day the same defect appeared in a different
 * costume: content that exists, is correct, is written to standard --
 * and that nothing in the product can ever select.
 *
 *   equipment vocabulary   92 of 124 equipment exercises unreachable
 *   difficulty ceiling     14 exercises above every possible ceiling
 *   private exercise pool  139 practice entries and all yoga invisible
 *   loaded carries         all 6; no category selected movementPattern
 *   cardio-warmup tags     2 of 4 machine warm-ups untickable
 *   balance board          content and equipment present, no route
 *   contraindications      3 safety exclusions naming conditions that
 *                          do not exist, so they never fired
 *   category coverage      85 of 544 exercises, 15.6% of the database
 *
 * Every one was found by a person using the product, or by a trace.
 * None was found by the code. That is the gap this closes.
 *
 * Four checks nothing else did:
 *   1. Every category a session declares has a matcher and matches
 *      something; every matcher is used by a session type.
 *   2. Every exercise is reachable by at least one route.
 *   3. Equipment vocabulary resolves BOTH ways -- no exercise tag that
 *      cannot be ticked, no tick that unlocks nothing.
 *   4. Every contraindication names a real condition id.
 *
 * Run after any content or category change, and before any deploy that
 * touches either.
 */

import { EXERCISES , isSessionLength } from '../../../js/data/exercises/index.js';
import { CATEGORY_MATCHERS, matchCategory } from '../../../js/data/session-categories.js';
import { EQUIPMENT_CATEGORIES } from '../../../js/data/equipment.js';
import { EQUIPMENT_IMPLIES, UNSATISFIABLE_TAGS, resolveEquipment, exerciseIsAvailable } from '../../../js/data/equipment-map.js';
import { CONDITIONS } from '../../../js/data/conditions.js';
globalThis.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
globalThis.window={addEventListener:()=>{}};
const { SESSION_TYPES } = await import('../../../js/session-builder.js');

const F=[];
const fail=(sev,area,msg)=>F.push({sev,area,msg});

// 1. CATEGORY INTEGRITY
const declared=new Set();
SESSION_TYPES.forEach(t=>[...t.warmupCategories,...t.mainCategories,...t.cooldownCategories].forEach(c=>declared.add(c)));
const defined=new Set(Object.keys(CATEGORY_MATCHERS));
[...declared].filter(c=>!defined.has(c)).forEach(c=>fail('ERROR','category',`"${c}" declared by a session type but has no matcher — silently empty`));
[...defined].filter(c=>!declared.has(c)).forEach(c=>fail('WARN','category',`"${c}" has a matcher but no session type uses it — orphaned content route`));
for (const c of defined) {
  const n=matchCategory(EXERCISES,c,'main').length;
  if(n===0) fail('ERROR','category',`"${c}" matches zero exercises`);
  else if(n===1) fail('WARN','category',`"${c}" matches only 1 exercise — forced repetition`);
}

// 2. EXERCISES REACHABLE AT ALL
const anyCat=new Set();
for(const c of declared){
  ['warmup','main','cooldown'].forEach(s=>matchCategory(EXERCISES,c,s).forEach(e=>anyCat.add(e.id)));
}
// AUDIT-2, 17 Aug 2026. This reported 28 ERRORS and every one was a
// false positive.
//
// The codebase already draws the distinction this check was missing:
// isSessionLength() -- contentType 'practice', or duration >= 600s --
// and getSuitableExercises() filters those out FIRST, because "whole
// sessions are not components". A twenty-minute EMOM circuit cannot be
// one of four picks in a main section, and it is not supposed to be.
// All 28 were session-length. Zero were genuinely orphaned.
//
// Left as one ERROR, the audit told somebody to go and fix twenty-eight
// things that were correct. An audit that cries wolf gets ignored, and
// then it is worth nothing on the day it is right. Now split:
//
//   session-length and unmatched  -> INFO. Expected, by design.
//   a COMPONENT nobody can reach  -> ERROR. That is the real fault.
const unreachable   = EXERCISES.filter(e=>!anyCat.has(e.id));
const orphanedParts = unreachable.filter(e=>!isSessionLength(e));
const standalone    = unreachable.filter(e=>isSessionLength(e));

if(orphanedParts.length)
  fail('ERROR','reach',`${orphanedParts.length} COMPONENT exercise(s) match no category any session type uses: ${orphanedParts.slice(0,6).map(e=>e.id).join(', ')}`);
if(standalone.length)
  fail('INFO','reach',`${standalone.length} standalone/session-length items are not session components — by design (isSessionLength). They need a route of their own, not a category.`);

// 3. EQUIPMENT VOCABULARY BOTH WAYS
const tickable=new Set(); EQUIPMENT_CATEGORIES.forEach(c=>c.items.forEach(i=>tickable.add(i.id)));
const satisfiable=new Set(); Object.values(EQUIPMENT_IMPLIES).forEach(l=>l.forEach(t=>satisfiable.add(t)));
const usedTags=new Set(); EXERCISES.forEach(e=>(e.equipment||[]).forEach(t=>usedTags.add(t)));
[...usedTags].filter(t=>!satisfiable.has(t)&&!UNSATISFIABLE_TAGS.includes(t))
  .forEach(t=>fail('ERROR','equipment',`exercise tag "${t}" cannot be satisfied by any tickable id`));
// An id can legitimately unlock nothing ON ITS OWN and still be useful:
// a bench is only ever needed alongside a dumbbell, and a mat is never
// a requirement at all. What matters is whether any exercise CAN use
// the capability, not whether the id alone completes one.
[...tickable].forEach(id=>{
  // yoga-mat is comfort, not kit -- deliberately required by nothing.
  const COMFORT_ONLY = ['yoga-mat'];
  const implied=EQUIPMENT_IMPLIES[id]||[id];
  const anyUse=EXERCISES.some(e=>(e.equipment||[]).some(t=>implied.includes(t)));
  if(!anyUse && !UNSATISFIABLE_TAGS.includes(id) && !COMFORT_ONLY.includes(id)) {
    fail('WARN','equipment',`"${id}" is tickable and no exercise anywhere uses it`);
    return;
  }
  const r=resolveEquipment([id]);
  const n=EXERCISES.filter(e=>(e.equipment||[]).length>0 && exerciseIsAvailable(e,r)).length;
  if(anyUse && n<=2) fail('INFO','equipment',`"${id}" fully unlocks only ${n} exercise(s) alone`);
});

// 4. CONTRAINDICATIONS MATCH REAL CONDITIONS
const condIds=new Set(CONDITIONS.map(c=>c.id));
const badContra=new Set();
EXERCISES.forEach(e=>(e.contraindications||[]).forEach(c=>{
  const base=c.replace(/-(acute|subacute)$/,'');
  if(!condIds.has(base)) badContra.add(c);
}));
[...badContra].forEach(c=>fail('ERROR','contra',`contraindication "${c}" matches no condition id — never fires`));

// 5. DATA INTEGRITY
const ids={}; EXERCISES.forEach(e=>ids[e.id]=(ids[e.id]||0)+1);
Object.entries(ids).filter(([,n])=>n>1).forEach(([id,n])=>fail('ERROR','data',`duplicate id "${id}" x${n}`));
EXERCISES.filter(e=>!e.position).forEach(e=>fail('ERROR','data',`${e.id} missing position`));
EXERCISES.filter(e=>typeof e.difficultyLevel!=='number').forEach(e=>fail('ERROR','data',`${e.id} missing difficultyLevel`));
EXERCISES.filter(e=>typeof e.impact!=='boolean').forEach(e=>fail('ERROR','data',`${e.id} missing impact`));
EXERCISES.filter(e=>/^https?:/i.test(e.youtube||'')).forEach(e=>fail('ERROR','data',`${e.id} youtube is a URL`));


// ── 6. NAVIGATION REACHABILITY ────────────────────────────────────────
//
// Added 11 Aug 2026. A route can be registered, highlighted in the nav
// map, and point at a view file that does not exist -- 'about',
// 'community-impact' and 'annual-reflection' all did. The code believed
// they existed, so anything navigating there failed at import. Not a
// hidden door: a door onto a missing room.
//
// Separately, a view can exist and be reachable from nowhere, which is
// the navigation version of the unreachable-content defect this file
// was written for.
import fs from 'fs';
const routerSrc = fs.readFileSync('js/router.js','utf8');
const ROUTES={};
for (const m of routerSrc.matchAll(/'([a-z0-9\/-]+)':\s*{\s*path:\s*'([^']+)'/g)) {
  ROUTES[m[1]] = m[2].replace('./','js/');
}
const LINK_PATTERNS=[
  /navigate\(\s*['"`]([a-z0-9\/-]+)['"`]/g,
  /data-nav\s*=\s*["']([a-z0-9\/-]+)["']/g,
  /data-route\s*=\s*["']([a-z0-9\/-]+)["']/g,
  /href\s*=\s*["']#\/?([a-z0-9\/-]+)["']/g,
  /pendingDoorRoute['"]\s*,\s*['"]([a-z0-9\/-]+)['"]/g,
  /["']([a-z0-9-]+)["']\s*:\s*["']([a-z0-9-]+)["']/g,
];
const linksFrom=f=>{
  if(!fs.existsSync(f)) return [];
  const src=fs.readFileSync(f,'utf8'); const out=new Set();
  for(const p of LINK_PATTERNS) for(const m of src.matchAll(p))
    [m[1],m[2]].forEach(v=>{ if(v&&ROUTES[v]) out.add(v); });
  return [...out];
};

// Missing view files first -- this is the one that breaks in front of a user.
Object.entries(ROUTES).forEach(([r,f])=>{
  if(!fs.existsSync(f)) fail('ERROR','nav',`route "${r}" points at ${f}, which does not exist`);
});

const ENTRY=new Set(['today','progress','noticing','settings']);
linksFrom('index.html').forEach(r=>ENTRY.add(r));
const reached=new Set(ENTRY);
let grew=true;
while(grew){
  grew=false;
  for(const r of [...reached]) for(const l of linksFrom(ROUTES[r]||'')) if(!reached.has(l)){reached.add(l);grew=true;}
}
Object.keys(ROUTES).filter(r=>!reached.has(r)&&!r.startsWith('onboarding'))
  .forEach(r=>fail('WARN','nav',`route "${r}" has a view but nothing navigates to it`));

const order={ERROR:0,WARN:1,INFO:2};
F.sort((a,b)=>order[a.sev]-order[b.sev]);
console.log('AUDIT — '+EXERCISES.length+' exercises, '+defined.size+' categories, '+tickable.size+' equipment ids, '+Object.keys(ROUTES).length+' routes\n');
['ERROR','WARN','INFO'].forEach(s=>{
  const f=F.filter(x=>x.sev===s);
  console.log(s+': '+f.length);
  f.slice(0,25).forEach(x=>console.log('   ['+x.area+'] '+x.msg));
  if(f.length>25) console.log('   ...and '+(f.length-25)+' more');
});
