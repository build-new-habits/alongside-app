/**
 * tools/verify-decl1.mjs
 * 15 Aug 2026 v1
 *
 * DECL-1. Every view module must have all its variables declared.
 *
 * The suite has fifty gates and NONE of them executes a view. So when
 * the `let pendingSkipOffer` declaration went missing between the W2-7
 * commit and now, every gate stayed green while tapping Skip threw a
 * ReferenceError in production — modules are strict mode, and assigning
 * to an undeclared identifier throws.
 *
 * This gate catches that class without needing to render anything: it
 * finds identifiers that are ASSIGNED at module scope but never
 * DECLARED anywhere in the file.
 *
 * It is not a substitute for a device pass. It is the cheapest possible
 * guard against the one fault that a device pass would have caught in
 * five seconds and fifty source-reading gates could not catch at all.
 */
import fs from 'node:fs';
import path from 'node:path';

let failures = 0;
const check = (n, ok, d='') => { console.log(`${ok?'PASS':'FAIL'}  ${n}${d?' — '+d:''}`); if(!ok) failures++; };

const strip = s => s
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '')
  .replace(/`(?:[^`\\]|\\.)*`/g, '``')      // template literals
  .replace(/"(?:[^"\\]|\\.)*"/g, '""')
  .replace(/'(?:[^'\\]|\\.)*'/g, "''");

const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? walk(path.join(d, e.name))
  : e.name.endsWith('.js') ? [path.join(d, e.name)] : []);

// HTML attribute names, which survive the strip on multi-line markup
// continuations like `  class="settings-select"` and read as
// assignments. Excluding them by name is blunt but honest: none of these
// is ever a JavaScript identifier in this codebase, and the alternative
// is a template-literal parser.
const HTML_ATTRS = new Set([
  'style','class','id','role','target','rel','rows','cols','placeholder',
  'type','onclick','href','src','alt','width','height','value','name',
  'title','lang','dir','tabindex','disabled','checked','selected','for',
  'min','max','step','pattern','autocomplete','loading','method','action'
]);

const BUILTINS = new Set([
  'window','document','console','globalThis','localStorage','navigator',
  'location','history','setTimeout','clearTimeout','setInterval','clearInterval',
  'requestAnimationFrame','fetch','Date','Math','JSON','Object','Array','Set','Map',
  'String','Number','Boolean','Promise','Error','speechSynthesis','CustomEvent','self'
]);

const files = [...walk('js/views'), ...walk('js/data'), 'js/session-log.js', 'js/session-builder.js', 'js/store.js'];
const offenders = [];

for (const f of files) {
  const src = strip(fs.readFileSync(f, 'utf8'));
  // Bare assignments at the start of a statement: `foo = ...` or `foo += ...`
  // Line-based, and markup lines are excluded. Nested template literals
  // survive the strip above, so `class="x"` becomes `class=""` and reads
  // as an assignment to `class`. Every one of the 45 first-run failures
  // was an HTML attribute. A gate that cries wolf 45 times is a gate
  // nobody will read.
  const assigned = new Set();
  for (const line of src.split('\n')) {
    if (/[<>]|\$\{|`/.test(line)) continue;          // markup or template
    const m = line.match(/^\s*([A-Za-z_$][\w$]*)\s*(?:=[^=>]|\+=|-=)/);
    if (m) assigned.add(m[1]);
  }
  for (const name of assigned) {
    if (BUILTINS.has(name) || HTML_ATTRS.has(name)) continue;
    if (name.startsWith('aria') || name.startsWith('data')) continue;
    const declared = new RegExp(
      `(?:let|const|var|function|class)\\s+${name}\\b|` +
      `\\b${name}\\s*(?:,[^)]*)?\\)?\\s*=>|` +          // arrow params
      `function\\s*\\w*\\s*\\([^)]*\\b${name}\\b|` +     // function params
      `\\b(?:catch|for)\\s*\\([^)]*\\b${name}\\b|` +
      `\\{[^{}]*\\b${name}\\b[^{}]*\\}\\s*=`             // destructuring
    ).test(src);
    if (!declared) offenders.push(`${path.basename(f)}: ${name}`);
  }
}

check('no module assigns an identifier it never declares',
  offenders.length === 0,
  offenders.length ? offenders.join(', ')
    : `${files.length} files scanned — modules are strict mode, so an undeclared assignment throws`);

// The specific one that shipped, asserted by name so it cannot recur silently.
const cs = fs.readFileSync('js/views/core-session.js', 'utf8');
for (const v of ['pendingSkipOffer', 'baselineAnswers', 'baselineDone']) {
  check(`core-session declares ${v}`,
    new RegExp(`let\\s+${v}\\b`).test(cs));
}

console.log(failures === 0 ? '\nDECL-1 GATE GREEN' : `\nDECL-1 GATE RED — ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
