/**
 * tools/verify-onunmount1.mjs
 * 21 Aug 2026 v2
 * GATE-PATH. Path resolution only -- no assertion changed.
 *
 * 18 Aug 2026 v1
 *
 * ONUNMOUNT-1. The router tears the outgoing view down.
 *
 * quiet-session.js has carried this line in its header since 02 Jul:
 * "onUnmount() export added: called by router.navigate() before leaving
 * this view." It was not. Nothing called it — not the router, not
 * app.js, not anything. Found 18 Aug by grepping for the CALLER while
 * building PRAC-1, rather than by reading the comment that described it.
 *
 * Same shape as the exercises/index.js comment claiming the 28
 * standalone items were "reached through the Library", and the same
 * reason it survived: the code said the mechanism existed, so nobody
 * looked. A source-text gate would have read both comments and stayed
 * green.
 *
 * So this one EXECUTES a navigation and asserts the outgoing view's
 * onUnmount actually ran. And it asserts the inverse that matters more:
 * that no view exports an onUnmount the router will never reach.
 */

// GATE-PATH, 21 Aug 2026. jsdom resolved through Node rather than by
// absolute path into one machine's node_modules.
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
import fs from 'node:fs';
import path from 'node:path';
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="main-content"></div><nav id="bottom-nav"></nav>',
  { url: 'https://build-new-habits.github.io/alongside-app/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.history = dom.window.history;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true, writable: true });
Object.defineProperty(globalThis, 'localStorage', { value: dom.window.localStorage, configurable: true, writable: true });

const BASE = new URL('../js/', import.meta.url).href;
const { store }  = await import(BASE + 'store.js');
const { router } = await import(BASE + 'router.js');
globalThis.router = router;
dom.window.router = router;

let failures = 0;
const check = (n, ok, d = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`);
  if (!ok) failures++;
};

localStorage.clear();
store.init();

// ── It runs ──────────────────────────────────────────────────────────
//
// A fake module planted in the cache: the router mounts from
// this.viewCache, so this exercises the real navigate() path without
// depending on any one view's internals.
let unmounted = 0;
router.viewCache['today'] = {
  render: () => '<p>stub</p>',
  onMount: () => {},
  onUnmount: () => { unmounted++; }
};
router.currentView = 'today';

await router.navigate('library');
check('navigating away calls the outgoing view\'s onUnmount', unmounted === 1,
  `called ${unmounted} time(s)`);

// ── It does not run on a no-op ───────────────────────────────────────
router.viewCache['today'] = {
  render: () => '<p>stub</p>', onMount: () => {}, onUnmount: () => { unmounted++; }
};
router.currentView = 'today';
unmounted = 0;
await router.navigate('today');
check('navigating to the view you are already on does not tear it down',
  unmounted === 0, `called ${unmounted} time(s)`);

// ── A throwing teardown cannot strand somebody ───────────────────────
router.viewCache['today'] = {
  render: () => '<p>stub</p>', onMount: () => {},
  onUnmount: () => { throw new Error('deliberate'); }
};
router.currentView = 'today';
let stranded = false;
try { await router.navigate('library'); }
catch { stranded = true; }
check('a view that throws on the way out does not block the navigation',
  !stranded && router.currentView === 'library');

// ── Nobody exports one the router will never reach ───────────────────
//
// The inverse assertion, and the one that would have caught the
// original fault. A view exporting onUnmount is making a claim about
// cleanup; if the router cannot reach it, the claim is false.
const routerSrc = fs.readFileSync('js/router.js', 'utf8');
check('navigate() reaches onUnmount through the view cache',
  /viewCache\[this\.currentView\]/.test(routerSrc) && /onUnmount\(\)/.test(routerSrc),
  'read from the cache, not from a local that may be empty');

const exporters = fs.readdirSync('js/views')
  .filter(f => f.endsWith('.js'))
  .filter(f => /export function onUnmount|export const onUnmount/
    .test(fs.readFileSync(path.join('js/views', f), 'utf8')));
check('every view exporting onUnmount is registered in the router',
  exporters.every(f => routerSrc.includes(`views/${f}`)),
  exporters.join(', ') || 'none export one');

// ── The comments that were wrong are now true ────────────────────────
//
// Not a style check. Both files' headers asserted a mechanism that did
// not exist, and that assertion is what stopped anyone looking. If the
// call is ever removed, this fails rather than the comment quietly
// reverting to fiction.
check('the timer views still export the teardown they rely on',
  exporters.includes('quiet-session.js') && exporters.includes('breathing-session.js'),
  exporters.join(', '));

console.log(failures ? `\n${failures} FAILED` : '\nALL PASS');
process.exit(failures ? 1 : 0);
