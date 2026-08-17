/**
 * tools/verify-burn3.mjs
 * 16 Aug 2026 v1
 *
 * BURN-3. The graded burnout message, restored and REACHABLE.
 *
 * It lived in coach-reflection.js, whose route was retired on 04 Aug.
 * Unreachable code says nothing, so this had been said to nobody for
 * twelve days -- while four separate gates asserted it was fine by
 * reading that file's source text.
 *
 * So this gate does not read source. It mounts Home and reads the
 * sentence a person would see.
 */
import { JSDOM } from '/home/claude/node_modules/jsdom/lib/api.js';
const dom = new JSDOM('<!doctype html><div id="c"></div>', { url: 'https://x/' });
globalThis.window = dom.window; globalThis.document = dom.window.document;
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true,writable:true});
Object.defineProperty(globalThis,'localStorage',{value:dom.window.localStorage,configurable:true,writable:true});

const B = new URL('../js/', import.meta.url).href;
const { store } = await import(B + 'store.js');
const { TodayView } = await import(B + 'views/today.js');
const { detectBurnout } = await import(B + 'data/checkin.js');

let failures = 0;
const check = (n, ok, d='') => { console.log(`${ok?'PASS':'FAIL'}  ${n}${d?' — '+d:''}`); if(!ok) failures++; };
const day = n => new Date(Date.now() - n*864e5).toISOString().split('T')[0];

function homeWith(energyByDay) {
  localStorage.clear(); store.init();
  store.set('tier','personal');
  const hist = {};
  energyByDay.forEach((e, i) => { hist[day(i + 1)] = { energy: e, mood: e }; });
  store.set('checkinHistory', hist);
  const el = document.getElementById('c');
  TodayView({ navigate: () => {} }).mount(el);
  // The COACH LINE only, not the whole page. Scanning all of Home made
  // the P4 checks fail on door labels and the greeting — a banned-word
  // test is only meaningful against the text it is meant to police.
  return (el.querySelector('.today-coach-line')?.textContent || '').replace(/\s+/g, ' ');
}

// ── 1. It is REACHED, on the surface everybody uses ──────────────────
const high = homeWith([1, 2, 2, 1, 2]);
check('detectBurnout grades this high', detectBurnout(store.get('checkinHistory')).level === 'high');
check('and Home says so', /low for a while now, not just today/.test(high),
  'mounted, not grepped — the last version was in a file nobody could reach');

const moderate = homeWith([4, 3, 4, 4, 3]);
check('a flatter week grades moderate', detectBurnout(store.get('checkinHistory')).level === 'moderate');
check('and gets a DIFFERENT sentence', /flatter few days/.test(moderate),
  'one sentence for both would tell a flat week and a fortnight of exhaustion the same thing');
check('and not the high one', !/low for a while now/.test(moderate));

// ── 2. It does not fire for everybody else ───────────────────────────
const fine = homeWith([7, 8, 7, 8, 7]);
check('a good week gets neither message',
  !/low for a while now|flatter few days/.test(fine));

const tooEarly = homeWith([1, 1]);
check('two days of data is not enough to say it',
  !/low for a while now|flatter few days/.test(tooEarly),
  'detectBurnout needs three; a bad Monday is not a bad fortnight');
// Reversal testing note: deleting detectBurnout's `dates.length < 3`
// guard does NOT break this, and that is correct rather than a hole.
// There is a second guard on energyValues.length, so the three-day floor
// is belt-and-braces. Verified by execution — two days still returns
// level 'none' with the first guard removed.

// ── 3. P4 — it says what it noticed, not what somebody IS ────────────
for (const text of [high, moderate]) {
  for (const [re, what] of [
    [/burn ?out/i,              'the word burnout — a clinical claim this product cannot make'],
    [/\byou are\b|\byou're\b (?:exhausted|depressed)/i, 'a verdict on the person'],
    [/\bshould\b|\bmust\b|make sure/i, 'an instruction'],
    [/rest day/i,               'a decision taken for them'],
    [/see (a|your) (doctor|gp)/i, 'a referral the red-flag screen has not been built to make'],
  ]) {
    check(`no ${what}`, !re.test(text));
  }
}
check('the high message says what the coach will DO',
  /I'll keep things gentle/.test(high));
check('and the moderate one does too, proportionately',
  /a bit easier/.test(moderate));

// ── 4. It outranks the yesterday line ────────────────────────────────
localStorage.clear(); store.init();
store.set('tier','personal');
const hist = {}; [1,2,2,1,2].forEach((e,i)=>{ hist[day(i+1)] = { energy: e, mood: e }; });
store.set('checkinHistory', hist);
store.set('activityLog', [{ type:'workout', completed:true,
  date: day(1), completedAt: new Date(Date.now()-864e5).toISOString() }]);
const el = document.getElementById('c');
TodayView({ navigate: () => {} }).mount(el);
const both = (el.querySelector('.today-coach-line')?.textContent || '').replace(/\s+/g,' ');
check('a flat week outranks "you did strength work yesterday"',
  /low for a while now/.test(both) && !/You did strength work yesterday/.test(both),
  'if somebody has been flat for a week, yesterday is not the useful thing to say');

console.log(failures === 0 ? '\nALL PASS\n' : `\n${failures} FAILURE(S)\n`);
process.exit(failures === 0 ? 0 : 1);
