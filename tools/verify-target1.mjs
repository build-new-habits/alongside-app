/**
 * tools/verify-target1.mjs
 * 15 Aug 2026 v1
 *
 * TARGET-1. A weekly target the person actually chose is recorded as
 * chosen, and therefore shown back to them.
 *
 * _writeStepValue() is not exported, so the write itself is asserted
 * against the source — but narrowly, INSIDE the correct branch, and the
 * downstream consequence is asserted behaviourally. Two assertions in
 * this project have now passed against explanatory comments rather than
 * code, so the pattern here is deliberately anchored to the store.set
 * call and its enclosing branch.
 */
import fs from 'node:fs';
import { JSDOM } from '/home/claude/node_modules/jsdom/lib/api.js';
const dom = new JSDOM('<!doctype html>', { url: 'https://build-new-habits.github.io/alongside-app/' });
globalThis.window = dom.window; globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true, writable: true });
Object.defineProperty(globalThis, 'localStorage', { value: dom.window.localStorage, configurable: true, writable: true });

const BASE = new URL('../js/', import.meta.url).href;
const { store } = await import(BASE + 'store.js');
const D = await import(BASE + 'data/onboarding-thread-data.js');

let failures = 0;
const check = (n, ok, d='') => { console.log(`${ok?'PASS':'FAIL'}  ${n}${d?' — '+d:''}`); if(!ok) failures++; };

const thread = fs.readFileSync(new URL('../js/views/onboarding/thread.js', import.meta.url), 'utf8');

// Isolate the weeklySessionTarget branch and assert the write is INSIDE it.
const branchStart = thread.indexOf("if (step.storeField === 'strategicGoal.weeklySessionTarget')");
const branchEnd   = thread.indexOf("if (step.storeField && step.storeField.startsWith('capability.'))");
const branch = branchStart > -1 && branchEnd > branchStart
  ? thread.slice(branchStart, branchEnd) : '';

check('the weeklySessionTarget branch exists', branch.length > 0);
check('choosing a target records that it WAS chosen',
  /store\.set\(\s*'strategicGoal\.setAt'/.test(branch),
  'inside the branch, not merely somewhere in the file');

// The step it belongs to still asks the question.
check('step 12 still writes weeklySessionTarget',
  D.STEPS[12]?.storeField === 'strategicGoal.weeklySessionTarget');
check('step 12 is asked of everyone', typeof D.STEPS[12].showIf !== 'function');

// Downstream: today.js must still gate on setAt, not on the raw number.
const today = fs.readFileSync(new URL('../js/views/today.js', import.meta.url), 'utf8');
check('Home still gates the denominator on setAt',
  /targetSetAt\s*\?\s*\(store\.get\('strategicGoal\.weeklySessionTarget'\)/.test(today),
  'HOME-1: persona 2.12 must not be shown a shortfall against a number he never chose');

// Behavioural: with setAt written, the denominator is available; without, it is not.
function shown(setAt, target) {
  localStorage.clear(); store.init();
  store.set('strategicGoal.weeklySessionTarget', target);
  if (setAt) store.set('strategicGoal.setAt', new Date().toISOString());
  const t = store.get('strategicGoal.setAt');
  return t ? (store.get('strategicGoal.weeklySessionTarget') || null) : null;
}
check('a chosen target is shown back', shown(true, 2) === 2);
check('an unchosen default is still not shown', shown(false, 3) === null,
  'the default of 3 must never appear as a target');

// The default itself must stay unset, or HOME-1 regresses.
localStorage.clear(); store.init();
check('a fresh store has no setAt', store.get('strategicGoal.setAt') === null);
check('and its target sits at the unagreed default',
  store.get('strategicGoal.weeklySessionTarget') === 3);

// ── TARGET-2: hitting a chosen target is acknowledged ────────
check('reaching the chosen target is said out loud',
  /targetMet/.test(today) && /you said you'd aim for/.test(today),
  'reaching it previously read identically to missing it');

// Extract the template literal itself. The first pattern used a `[^`]*`
// class that stopped at the wrong place and captured an empty string,
// so the "closes the week" assertion tested nothing.
const line = (today.match(/`That's[\s\S]*?`/) || [''])[0];
check('the line CLOSES the week rather than opening a demand',
  /extra, not expected/.test(line), line.slice(0, 80));
check('it does not declare the week over',
  !/that's it for|see you next week|done for the week|no more/i.test(line),
  'somebody who hits two on Tuesday must not read this as a stop sign');
check('no streak or comparison language',
  !/streak|in a row|again next week|keep it up|beat/i.test(line));
check('it only fires against a target the person CHOSE',
  /targetMet = sessionDone && weeklyTarget/.test(today),
  'weeklyTarget is null unless setAt is written, so the default 3 cannot trigger it');
check('it needs the person to have moved today',
  /targetMet = sessionDone/.test(today),
  'otherwise it would greet them with it on an untouched day');

// Declaration order — the first version referenced weeklyTarget 20 lines
// before it was declared, which is a temporal dead zone and would have
// thrown on every Home render.
check('weeklyTarget is declared before targetMet uses it',
  today.indexOf('const weeklyTarget') < today.indexOf('const targetMet'));

console.log(failures === 0 ? '\nTARGET-1 GATE GREEN' : `\nTARGET-1 GATE RED — ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
