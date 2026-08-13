/**
 * verify-dic1.mjs
 * 12 Aug 2026 v1
 *
 * Gate for DIC-1. Written before trusting the change.
 *
 * The four things that can silently break, each tested against the REAL
 * source rather than a restatement of it.
 */
import fs from "node:fs";

let fails = 0;
const check = (name, fn) => {
  try { fn(); console.log("  PASS  " + name); }
  catch (e) { fails++; console.log("  FAIL  " + name + "\n        " + e.message); }
};
const eq = (a, b, m) => { if (a !== b) throw new Error(`${m}\n        got: ${a}\n        want: ${b}`); };
// Added 12 Aug with CI-SPACE. Second harness today to fail four checks
// at once purely because this helper was missing -- convincing enough to
// look like four code faults both times.
const ok = (c, m) => { if (!c) throw new Error(m); };

const checkin  = fs.readFileSync("js/views/checkin.js", "utf8");
const builder  = fs.readFileSync("js/session-builder.js", "utf8");
const storeSrc = fs.readFileSync("js/store.js", "utf8");
const today    = fs.readFileSync("js/views/today.js", "utf8");

console.log("\nTEST 1 - cross-file value contract");
check("checkin VARIETY_CHOICES values == session-builder VARIETY_NOVELTY keys", () => {
  const mine = [...checkin.matchAll(/value:\s*"([a-z]+)"/g)].map(m => m[1]).sort();
  const nov  = builder.match(/const VARIETY_NOVELTY\s*=\s*\{([^}]*)\}/)[1];
  const keys = [...nov.matchAll(/([a-z]+)\s*:/g)].map(m => m[1]).sort();
  eq(mine.join(","), keys.join(","), "values the question writes must be values selection reads");
});
check("those values are all accepted by store.js's validation whitelist", () => {
  const wl = storeSrc.match(/\[([^\]]*)\]\.includes\(saved\.sessionVariety\)/)[1];
  const allowed = [...wl.matchAll(/'([a-z]+)'/g)].map(m => m[1]).sort();
  const mine = [...checkin.matchAll(/value:\s*"([a-z]+)"/g)].map(m => m[1]).sort();
  eq(mine.join(","), allowed.join(","), "a value outside the whitelist is silently discarded on next load");
});

console.log("\nTEST 2 - window constant matches the selection cutoff");
check("checkin CONTINUITY_WINDOW_DAYS == session-builder CONTINUITY_WINDOW_DAYS", () => {
  const a = checkin.match(/CONTINUITY_WINDOW_DAYS\s*=\s*(\d+)/)[1];
  const b = builder.match(/CONTINUITY_WINDOW_DAYS\s*=\s*(\d+)/)[1];
  eq(a, b, "if these diverge the question promises what selection cannot deliver");
});

console.log("\nTEST 3 - SESSION_DOORS matches today.js's requiresCheckin doors");
check("gate covers exactly the doors that route through check-in", () => {
  const mine = [...checkin.match(/const SESSION_DOORS = \[([^\]]*)\]/)[1]
    .matchAll(/"([a-z-]+)"/g)].map(m => m[1]).sort();
  const doors = [...today.matchAll(/route:\s*'([a-z-]+)',\s*requiresCheckin:\s*true/g)]
    .map(m => m[1]).sort();
  eq(mine.join(","), doors.join(","), "a new requiresCheckin door would silently never get the question");
});

console.log("\nTEST 4 - exerciseStats boundary behaviour (the real date maths)");
const mem = {};
globalThis.localStorage = {
  getItem: k => (k in mem ? mem[k] : null),
  setItem: (k, v) => { mem[k] = String(v); },
  removeItem: k => { delete mem[k]; },
};
const { store } = await import("/home/claude/repo/js/store.js");
// store.set() does NOT lazily init the way store.get() does (store.js:1223 vs
// :1212). app.js:150 calls store.init() on boot so the live path is safe, but
// the harness must do the same. Logged as a latent asymmetry, not fixed here.
store.init();
const ago = d => new Date(Date.now() - d * 86400000).toISOString();

store.set("exerciseHistory", {
  fresh:  { n: 2, first: ago(30), last: ago(0)  },
  edge:   { n: 1, first: ago(21), last: ago(21) },
  stale:  { n: 5, first: ago(90), last: ago(22) },
});
const W = 21;
check("today's exercise is inside the window", () => eq(store.exerciseStats("fresh").daysSince <= W, true, "0 days"));
check("exactly 21 days is inside the window (inclusive boundary)", () => eq(store.exerciseStats("edge").daysSince <= W, true, "21 days"));
check("22 days is outside the window", () => eq(store.exerciseStats("stale").daysSince <= W, false, "22 days"));
check("an unseen exercise reports seen:false", () => eq(store.exerciseStats("nope").seen, false, "unknown id"));

console.log("\nTEST 5 - sessionVariety round-trips through save and reload");
for (const v of ["familiar", "balanced", "varied"]) {
  check(`"${v}" survives a write/reload cycle`, () => {
    store.set("sessionVariety", v);
    const raw = JSON.parse(localStorage.getItem("alongside_user"));
    eq(raw.sessionVariety, v, "not persisted to localStorage");
  });
}
check("a bogus value is rejected by validation on reload", () => {
  const raw = JSON.parse(localStorage.getItem("alongside_user"));
  raw.sessionVariety = "chaos";
  localStorage.setItem("alongside_user", JSON.stringify(raw));
  store.init();
  eq(store.get("sessionVariety"), "balanced", "whitelist should have fallen back to default");
});

console.log("\nTEST 7 - CI-SPACE: panel clearance agrees across JS and CSS");
check("PANEL_CLEARANCE matches .ci-thread's padding-bottom", () => {
  const js  = checkin.match(/PANEL_CLEARANCE = ([0-9.]+)/);
  const css = fs.readFileSync("css/components/checkin-conversation.css", "utf8")
                .match(/padding: var\(--space-5\) var\(--space-4\) (\d+)vh/);
  ok(js && css, "one of the two values is missing");
  eq(Math.round(parseFloat(js[1]) * 100), parseInt(css[1], 10),
     "if these drift, the scroll decides a message fits when the panel will cover it");
});
check("scroll anchors per message rather than always to the top", () => {
  ok(/block: tooTall \? "start" : "end"/.test(checkin),
     "always block:start drags short messages to the ceiling and leaves dead space below");
});

console.log("\nTEST 8 - SB-META: no 'undefined' can reach the session overview");
const sbui = fs.readFileSync("js/views/session-builder-ui.js", "utf8");
check("exercise meta is built from guarded parts", () => {
  ok(/function _exerciseMeta/.test(sbui), "helper missing");
  ok(!/\$\{ex\.sets\} sets/.test(sbui),
     "unguarded sets prints the literal word 'undefined' for a timed hold");
  ok(!/&nbsp; \$\{ex\.tempo\}/.test(sbui), "unguarded tempo does the same");
});
check("the coach's section rationale is styled as the coach", () => {
  ok(/sb-section-why coach-voice/.test(sbui), "class missing");
  const css = fs.readFileSync("css/components/workout.css", "utf8");
  const rule = css.slice(css.indexOf(".sb-section-why {"), css.indexOf("}", css.indexOf(".sb-section-why {")));
  ok(/--color-primary/.test(rule),
     "text-secondary makes the coach's own reasoning look like UI chrome");
  ok(!/--color-gold|#B8970A|#D4AF37/i.test(rule),
     "gold is the paid-tier marker; this is free-tier content");
});

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
