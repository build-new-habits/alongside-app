/**
 * tools/verify-log1.mjs
 * 12 Aug 2026 v1
 *
 * Gate for LOG-1. Two things it guards:
 *
 *   REACH   the note block lived in one view of eleven, which is why a
 *           nine-metric log read as a gym-weights feature. The block is
 *           now shared; nothing should re-privatise it.
 *   TRUTH   the Settings panel described a narrower feature than existed.
 *           A feature that describes itself wrongly is one people
 *           correctly believe does not do the thing.
 */
import fs from "node:fs";

const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/[^\n]*$/gm, "");
const read  = f => strip(fs.readFileSync(f, "utf8"));

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };

const shared = read("js/session-log.js");
const gym    = read("js/views/gym-programme.js");
const wo     = read("js/views/workout.js");
const set    = read("js/views/settings.js");
const store  = read("js/store.js");
const mainC  = read("css/main.css");
const gymCss = read("css/components/gym-programme.css");
const sw     = read("sw.js");

console.log("\nTEST 1 - every metric the store accepts is offered somewhere");
const NUMERIC = ["weight","reps","speed","incline","level","distance","durationMins"];
const TEXT    = ["tension","note"];
for (const k of [...NUMERIC, ...TEXT])
  check(`"${k}" is reachable from a field set`, () =>
    ok(new RegExp(`key:\\s*"${k}"`).test(shared),
       `store.logLift() accepts ${k} but no field offers it - unrecordable by design`));

console.log("\nTEST 2 - reach");
check("the block is defined once, in the shared module", () => {
  ok(/export function renderLogBlock/.test(shared), "not exported from session-log.js");
  ok(!/function renderLiftBlock/.test(gym), "gym-programme still holds a private copy");
  ok(!/function _performanceFields/.test(gym), "gym-programme still holds private field logic");
});
check("gym-programme imports it rather than owning it", () =>
  ok(/from '\.\.\/session-log\.js'/.test(gym), "import missing"));
check("workout.js now renders it", () =>
  ok(/renderLogBlock\(/.test(wo), "the main coach-built session still offers no way to write anything down"));
check("workout.js wires the save handler", () =>
  ok(/attachLogEvents\(/.test(wo), "the block would render but never save"));
check("id prefixes are per-exercise, so two cards cannot collide", () =>
  ok(/wo-log-\$\{currentExerciseIndex\}/.test(wo),
     "a fixed id would let one exercise's numbers be written onto another"));

console.log("\nTEST 3 - the deliberate exclusions stay excluded");
for (const f of ["js/views/breathing-session.js", "js/views/quiet-session.js"])
  check(`${f.split("/").pop()} does NOT offer it`, () =>
    ok(!/renderLogBlock/.test(read(f)),
       "restoration screens exist to stop measuring; a metrics box contradicts the product"));

console.log("\nTEST 3b - LOG-2, yoga takes gentle mode only");
const yoga = read("js/views/yoga-session.js");
check("yoga renders the block in gentle mode", () =>
  ok(/renderLogBlock\(pose, `ys-log-\$\{currentIndex\}`, "gentle"\)/.test(yoga),
     "yoga must pass gentle, or it inherits reps and levels"));
check("gentle mode offers duration and note ONLY", () => {
  const m = shared.match(/if \(mode === "gentle"\) \{[\s\S]*?\n  \}/);
  ok(m, "gentle branch not found");
  ok(/durationMins/.test(m[0]) && /note/.test(m[0]), "should offer duration and note");
  for (const bad of ["reps", "level", "weight", "incline", "speed", "distance", "tension"])
    ok(!new RegExp(`key: "${bad}"`).test(m[0]), `gentle mode must not offer ${bad}`);
});

console.log("\nTEST 4 - the setting describes what it actually does");
check("panel is no longer called 'Weight notes'", () =>
  ok(!/>Weight notes</.test(set), "nine metrics behind a weight-only label"));
check("copy names more than weight", () => {
  const m = set.match(/Jot down what you did[\s\S]{0,220}/);
  ok(m, "descriptive copy not found");
  ok(/time/i.test(m[0]) && /level/i.test(m[0]) && /band/i.test(m[0]),
     "should name several of the metrics, not just weight");
});
check("copy no longer claims it is gym-only", () =>
  ok(!/For gym sessions/.test(set), "it is not, as of workout.js v11"));
check("P4: no verdict words in the panel", () => {
  const panel = set.slice(set.indexOf("Session notes"), set.indexOf("Session notes") + 1200);
  for (const w of ["personal best", "progress", "improve", "beat "])
    ok(!new RegExp(w, "i").test(panel), `"${w}" attaches a verdict to a number`);
});
check("liftLogEnabled still defaults on (Graeme, 12 Aug)", () =>
  ok(/liftLogEnabled:\s*true/.test(store), "confirmed default-on"));

console.log("\nTEST 5 - the CSS actually reaches the browser");
check("session-log.css imported by main.css", () =>
  ok(/components\/session-log\.css/.test(mainC), "index.html links only main.css"));
check("session-log.css precached", () =>
  ok(/components\/session-log\.css/.test(sw), "offline styling would drop"));
check("js/session-log.js precached", () =>
  ok(/js\/session-log\.js/.test(sw), "offline the module import would fail"));
check("the old .gp-lift rules are gone, not left dead", () =>
  ok(!/\.gp-lift/.test(gymCss), "dead CSS left behind after the move"));

console.log("\nSCROLL-1 - a new card starts at the top");
for (const v of ["workout", "core-session", "prescribed-session", "gym-programme", "yoga-session"])
  check(`${v} scrolls up on advance`, () => {
    const s = fs.readFileSync(`js/views/${v}.js`, "utf8");
    const advances = (s.match(/(current(Exercise)?Index)\+\+;/g) || []).length;
    const scrolls  = (s.match(/scrollToTop\(\);/g) || []).length;
    ok(advances > 0, "no advance point found - the regex has drifted");
    ok(scrolls >= advances,
       `${advances} advance point(s), ${scrolls} scroll reset(s). router.js ` +
       `resets scroll on view MOUNT, but advancing re-renders in place - so ` +
       `you finish a card at the bottom and the next one opens there too`);
    ok(/import \{[^}]*scrollToTop[^}]*\} from ['"]\.\.\/session-log\.js['"]/.test(s),
       "not imported");
  });
check("one definition, not five", () => {
  const src = fs.readFileSync("js/session-log.js", "utf8");
  ok(/export function scrollToTop/.test(src), "helper missing from the shared module");
  for (const v of ["workout", "core-session", "yoga-session"])
    ok(!/function scrollToTop/.test(fs.readFileSync(`js/views/${v}.js`, "utf8")),
       `${v} declares its own - five copies is how four of them drift`);
});
check("instant, not smooth", () => {
  const src = fs.readFileSync("js/session-log.js", "utf8");
  ok(/behavior: "instant"/.test(src),
     "a smooth scroll from the bottom of one card to the top of the next " +
     "animates past everything between, which reads as a lurch");
});

console.log("\nLOG-6 - the note is readable back before saving");
const slog = fs.readFileSync("js/session-log.js", "utf8");
const slogCss = fs.readFileSync("css/components/session-log.css", "utf8");
check("the note is a textarea, not a one-line input", () => {
  ok(/<textarea class="slog__input slog__input--note"/.test(slog),
     "an input shows a few characters at a time whatever its width");
  ok(/multiline: true/.test(slog), "no field is marked multiline");
});
check("it grows with its content", () => {
  ok(/function autogrow/.test(slog), "no growth");
  ok(/el\.style\.height = "auto";/.test(slog),
     "without resetting to auto first the box can only ever grow - deleting " +
     "text would leave the space behind");
  ok(/addEventListener\("input", \(\) => \{ autogrow/.test(slog), "not wired to typing");
});
check("it starts at one row", () => {
  ok(/rows="1"/.test(slog),
     "an empty three-line box on every card reads as an expectation to " +
     "fill it, and this field is optional");
});
check("the 40-character cap is gone", () => {
  ok(!/maxlength: "40"/.test(slog),
     "40 truncates 'felt fine, back was tight' mid-sentence - the box size " +
     "was only half the problem");
  ok(/maxlength: "280"/.test(slog), "no raised cap");
});
check("it warns before the new cap", () => {
  ok(/function remaining/.test(slog), "no counter");
  ok(/left <= 60/.test(slog),
     "a counter from the first keystroke is pressure; one near the ceiling " +
     "is help");
  ok(/aria-live="polite"/.test(slog), "count must be announced");
});
check("the textarea does not fight its own sizing", () => {
  const rule = slogCss.slice(slogCss.indexOf(".slog__input--note {"),
                             slogCss.indexOf("}", slogCss.indexOf(".slog__input--note {")));
  ok(/resize: none/.test(rule), "a drag handle fighting auto-grow is worse than neither");
  ok(/overflow: hidden/.test(rule), "a scrollbar flickers before each height update");
  ok(/font-family: inherit/.test(rule), "textareas default to monospace");
  ok(/flex: 1 1 100%/.test(rule),
     "sharing a row with two number boxes leaves it three words wide");
});
check("a saved note is readable when shown back", () => {
  const rule = slogCss.slice(slogCss.indexOf(".slog__last {"),
                             slogCss.indexOf("}", slogCss.indexOf(".slog__last {")));
  ok(!/white-space: nowrap/.test(rule) && !/text-overflow: ellipsis/.test(rule),
     "a long note must wrap, not truncate - reading it back is the point");
});

console.log("\nLOG-5 - the note field takes the space it needs");
check("note is not a fixed-width number box", () => {
  const css = fs.readFileSync("css/components/session-log.css", "utf8");
  ok(/\.slog__input--note \{/.test(css), "no note modifier");
  const rule = css.slice(css.indexOf(".slog__input--note {"), css.indexOf("}", css.indexOf(".slog__input--note {")));
  ok(/flex: 1 1 100%/.test(rule), "must take a full row of its own");
  ok(/min-width: 0/.test(rule), "without this it pushes Save off the edge on a tight row");
});
check("the markup tags the note field", () =>
  // LOG-6 replaced the conditional class with a dedicated textarea
  // branch, so the class is now literal rather than computed.
  ok(/<textarea class="slog__input slog__input--note"/.test(fs.readFileSync("js/session-log.js", "utf8")),
     "class never applied"));

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
