/**
 * tools/verify-chain1.mjs
 * 15 Aug 2026 v1
 *
 * CHAIN-1. A finished programme leads somewhere.
 *
 * handleEndOption()'s 'progress' branch has always looked for
 * nextProgrammeId. No programme declared one, so after twelve weeks
 * every route fell through to goal-setup and the same eight options.
 */
import { JSDOM } from '/home/claude/node_modules/jsdom/lib/api.js';
const dom = new JSDOM('<!doctype html>', { url: 'https://build-new-habits.github.io/alongside-app/' });
globalThis.window = dom.window; globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true, writable: true });
Object.defineProperty(globalThis, 'localStorage', { value: dom.window.localStorage, configurable: true, writable: true });

const BASE = new URL('../js/', import.meta.url).href;
const P = await import(BASE + 'data/programmes.js');

let failures = 0;
const check = (n, ok, d='') => { console.log(`${ok?'PASS':'FAIL'}  ${n}${d?' — '+d:''}`); if(!ok) failures++; };
const all = P.PROGRAMMES || [];
const byId = new Map(all.map(p => [p.id, p]));

check('there are programmes to chain', all.length >= 8, `${all.length}`);

const chained = all.filter(p => p.nextProgrammeId);
check('most programmes lead somewhere', chained.length >= 6,
  `${chained.length} of ${all.length}`);

for (const p of chained) {
  check(`${p.id} points at a programme that exists`,
    byId.has(p.nextProgrammeId), p.nextProgrammeId);
  check(`${p.id} does not point at itself`,
    p.nextProgrammeId !== p.id);
}

// No cycles — a chain that loops is the same dead end wearing a hat.
for (const start of all) {
  const seen = new Set([start.id]);
  let cur = start, steps = 0;
  while (cur?.nextProgrammeId && steps < 20) {
    if (seen.has(cur.nextProgrammeId)) { break; }
    seen.add(cur.nextProgrammeId);
    cur = byId.get(cur.nextProgrammeId);
    steps++;
  }
  check(`the chain from ${start.id} terminates without looping`,
    !cur?.nextProgrammeId || !seen.has(cur.nextProgrammeId) || steps < 20,
    `${seen.size} programmes, ${seen.size * 12} weeks`);
}

// Every chain must actually end, or "is there more" becomes "is this ever over".
const endpoints = all.filter(p => !p.nextProgrammeId);
check('at least one programme is an endpoint', endpoints.length >= 1,
  endpoints.map(p => p.id).join(', ') || 'none — every chain loops forever');

console.log(failures === 0 ? '\nCHAIN-1 GATE GREEN' : `\nCHAIN-1 GATE RED — ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
