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

import { EXERCISES } from '../../../js/data/exercises/index.js';
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
const unreachable=EXERCISES.filter(e=>!anyCat.has(e.id));
if(unreachable.length) fail('ERROR','reach',`${unreachable.length} exercises match no category any session type uses`);

// 3. EQUIPMENT VOCABULARY BOTH WAYS
const tickable=new Set(); EQUIPMENT_CATEGORIES.forEach(c=>c.items.forEach(i=>tickable.add(i.id)));
const satisfiable=new Set(); Object.values(EQUIPMENT_IMPLIES).forEach(l=>l.forEach(t=>satisfiable.add(t)));
const usedTags=new Set(); EXERCISES.forEach(e=>(e.equipment||[]).forEach(t=>usedTags.add(t)));
[...usedTags].filter(t=>!satisfiable.has(t)&&!UNSATISFIABLE_TAGS.includes(t))
  .forEach(t=>fail('ERROR','equipment',`exercise tag "${t}" cannot be satisfied by any tickable id`));
[...tickable].forEach(id=>{
  const r=resolveEquipment([id]);
  const n=EXERCISES.filter(e=>(e.equipment||[]).length>0 && exerciseIsAvailable(e,r)).length;
  if(n===0) fail('WARN','equipment',`"${id}" is tickable but unlocks 0 exercises`);
  else if(n<=2) fail('INFO','equipment',`"${id}" unlocks only ${n} exercise(s)`);
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

const order={ERROR:0,WARN:1,INFO:2};
F.sort((a,b)=>order[a.sev]-order[b.sev]);
console.log('AUDIT — '+EXERCISES.length+' exercises, '+defined.size+' categories, '+tickable.size+' equipment ids\n');
['ERROR','WARN','INFO'].forEach(s=>{
  const f=F.filter(x=>x.sev===s);
  console.log(s+': '+f.length);
  f.slice(0,25).forEach(x=>console.log('   ['+x.area+'] '+x.msg));
  if(f.length>25) console.log('   ...and '+(f.length-25)+' more');
});
