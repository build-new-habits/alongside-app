/**
 * tools/verify-nav5.mjs
 * 12 Aug 2026 v1
 *
 * NAV-5. Three sections, not seven tabs.
 *
 * Graeme, device pass part 4: "Changing equipment and turning on session
 * notes really hard to find. Like really really hard."
 *
 * Two of the three things he could not find anywhere in the app were in
 * Settings, both in the FOURTH tab of a strip that scrolled horizontally
 * with the scrollbar hidden. Profile, Programme and Conditions sat
 * off-screen with nothing indicating they existed.
 *
 * His grouping, agreed in conversation: "we divide into app controls,
 * about, and settings."
 */
import fs from "node:fs";

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };
const eq = (a, b, m) => { if (a !== b) throw new Error(`${m}\n        got: ${a}  want: ${b}`); };

const s = fs.readFileSync("js/views/settings.js", "utf8");

console.log("\nTEST 1 - three sections, Graeme's grouping");
check("exactly three", () => {
  const ids = [...s.matchAll(/^\s{6}id: '(\w+)',\n\s+label: '/gm)].map(m => m[1]);
  eq(ids.length, 3, `sections: ${ids.join(", ")}`);
  for (const want of ["controls", "settings", "about"])
    ok(ids.includes(want), `missing "${want}"`);
});
check("each row explains what is inside", () => {
  const subs = [...s.matchAll(/sub: '([^']+)'/g)].map(m => m[1]);
  eq(subs.length, 3, "every section needs a description");
  ok(subs.some(x => /session notes/i.test(x)),
     "App Controls must NAME session notes - 'App Controls' alone does not " +
     "tell you it is in there, which is the exact problem being fixed");
  ok(subs.some(x => /equipment/i.test(x)), "Settings must name equipment");
});

console.log("\nTEST 2 - every panel is reachable, none orphaned");
check("sections and router agree", () => {
  const referenced = [...s.matchAll(/panels: \[([^\]]+)\]/g)]
    .flatMap(m => m[1].replace(/[ ']/g, "").split(","));
  // \w excludes hyphens, so about-story/-app/-data read as unrouted when
  // they are routed. Panel ids are kebab-case; the pattern must be too.
  const routed = [...s.matchAll(/case '([\w-]+)':\s+return render/g)].map(m => m[1]);
  const missing = referenced.filter(p => !routed.includes(p));
  const orphan  = routed.filter(p => !referenced.includes(p));
  ok(missing.length === 0, `referenced but not routed: ${missing.join(", ")}`);
  ok(orphan.length === 0,
     `routed but unreachable - a panel nobody can open: ${orphan.join(", ")}`);
});

console.log("\nTEST 3 - session notes is no longer a lodger");
check("it has its own panel", () => {
  ok(/case 'liftlog':\s+return renderLiftLogPanel/.test(s), "no liftlog route");
  ok(!/renderEquipmentPanel\(\) \+ renderLiftLogPanel\(\)/.test(s),
     "still appended to Equipment - it is a behaviour toggle, not a fact " +
     "about what you own, and it was filed there because Equipment was the " +
     "smallest panel");
});
check("it sits in App Controls, not Settings", () => {
  const controls = s.slice(s.indexOf("id: 'controls'"), s.indexOf("id: 'settings'"));
  ok(/'liftlog'/.test(controls), "session notes should be a control, not a preference");
});

console.log("\nTEST 4 - nothing scrolls, so nothing hides");
check("the index does not overflow", () => {
  const css = fs.readFileSync("css/components/settings.css", "utf8");
  const rule = css.slice(css.indexOf(".settings-index {"), css.indexOf("}", css.indexOf(".settings-index {")));
  ok(/flex-direction: column/.test(rule), "must stack vertically");
  ok(!/overflow-x/.test(rule), "horizontal overflow is the fault being fixed");
});
check("rows clear the 44px touch floor", () => {
  const css = fs.readFileSync("css/components/settings.css", "utf8");
  const rule = css.slice(css.indexOf(".settings-index__row {"), css.indexOf("}", css.indexOf(".settings-index__row {")));
  const m = rule.match(/min-height:\s*(\d+)px/);
  ok(m && parseInt(m[1], 10) >= 44, "WCAG 2.2 AA 2.5.8");
});

console.log("\nTEST 5 - re-renders do not bounce back to the index");
check("in-section actions keep their section", () => {
  ok(!/activeTab = 'display';\s*\n\s*render\(container\)/.test(s),
     "Display reset would return to the index mid-action");
  ok(!/activeTab = 'notify';\s*\n\s*render\(container\)/.test(s),
     "toggling reminders would return to the index mid-toggle");
  ok(/activeSection = 'settings'/.test(s) && /activeSection = 'controls'/.test(s),
     "both deep links should set the section instead");
});
check("the index is not sticky", () => {
  ok(/let activeSection = null;/.test(s),
     "opening Settings should show the index, not drop somebody back where " +
     "they were last time wondering where everything went");
});

console.log("\nTEST 6 - NAV-6: Home does not duplicate the bottom nav");
check("no tile routes to a nav destination except the flagged one", () => {
  const home = fs.readFileSync("js/views/today.js", "utf8");
  const tiles = [...home.matchAll(/\{ id: '[\w-]+', label: '([^']+)'[^}]*?route: '([\w-]+)'/g)]
    .map(m => ({ label: m[1], route: m[2] }));
  ok(tiles.length > 0, "no tiles found - the regex has drifted from the markup");
  const nav = ["today", "progress", "noticing", "settings"];
  const dup = tiles.filter(t => nav.includes(t.route) && t.label !== "Wellbeing");
  ok(dup.length === 0,
     `duplicates a bottom-nav destination, which is reachable from every ` +
     `screen while Home is not: ${dup.map(d => `${d.label} -> ${d.route}`).join(", ")}`);
});
check("the Progress tile stays removed", () => {
  const home = fs.readFileSync("js/views/today.js", "utf8");
  ok(!/id: 'progress', label: 'Progress'/.test(home),
     "it was the only tile duplicating the nav by name as well as route");
});

console.log("\nTEST 7 - VER-2: the version comes from the running worker");
check("settings asks, rather than inferring from cache names", () => {
  const s2 = fs.readFileSync("js/views/settings.js", "utf8");
  ok(/postMessage\(\{ type: 'GET_VERSION' \}\)/.test(s2),
     "reading caches.keys() answers which caches EXIST, not which is serving " +
     "the page - during an update both do, and About reported a build the " +
     "page was not running");
  ok(!/const cacheNames = await caches\.keys\(\)/.test(s2), "old inference still present");
});
check("the worker answers", () => {
  const sw = fs.readFileSync("sw.js", "utf8");
  ok(/event\.data\?\.type === "GET_VERSION"/.test(sw), "no handler - settings would time out");
  ok(/CACHE_NAME\.replace\("alongside-", ""\)/.test(sw), "must report its OWN cache name");
});

console.log("\nTEST 8 - NAV-7: sub-tabs, and they cannot hide");
check("every panel has a short label", () => {
  const referenced = [...s.matchAll(/panels: \[([^\]]+)\]/g)]
    .flatMap(m => m[1].replace(/[ ']/g, "").split(","));
  const labels = s.slice(s.indexOf("const PANEL_LABEL"), s.indexOf("let activePanel"));
  for (const p of referenced)
    ok(new RegExp(`["']?${p}["']?:`).test(labels), `no tab label for "${p}"`);
});
check("no section carries more than four tabs", () => {
  for (const m of s.matchAll(/panels: \[([^\]]+)\]/g)) {
    const n = m[1].split(",").length;
    ok(n <= 4,
       `${n} tabs - five or more is where the old strip started scrolling ` +
       `and hiding its own contents`);
  }
});
check("the strip wraps rather than scrolls", () => {
  const css = fs.readFileSync("css/components/settings.css", "utf8");
  const rule = css.slice(css.indexOf(".settings-subtabs {"),
                         css.indexOf("}", css.indexOf(".settings-subtabs {")));
  ok(/flex-wrap: wrap/.test(rule), "must wrap");
  ok(!/overflow-x/.test(rule),
     "a wrapped tab is ugly; a scrolled one is invisible, and invisible is " +
     "what made Equipment unfindable");
});
check("a one-panel section shows no tabs", () =>
  ok(/panels\.length < 2 \? "" :/.test(s),
     "one tab is not a choice, it is decoration"));
check("About is split, and every part is routed", () => {
  // 13 Aug 2026, A3. Was pinned to the exact literal
  // `'about-story', 'about-app', 'about-data'`, so adding a FOURTH panel
  // (about-plan) failed a check about the other three. That is the gate
  // asserting an incidental ordering rather than the decision it guards
  // -- NAV-5's decision is that About is several panels and each one is
  // reachable, not that they sit in a particular sequence.
  //
  // Loosened to test membership and routing rather than sequence.
  // Deliberately NOT extended to check that each listed id has a case in
  // renderPanel(): the existing "sections and router agree" check below
  // already does exactly that, and proved it by failing correctly when
  // about-plan's case was removed during this build. A second copy of a
  // working assertion is upkeep with no coverage.
  const group = s.match(/panels:\s*\[([^\]]*'about-story'[^\]]*)\]/);
  ok(group, "the About section no longer lists its panels");
  const ids = [...group[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
  for (const id of ["about-story", "about-app", "about-data"])
    ok(ids.includes(id), `${id} dropped from the About section`);
  for (const part of ["story", "app", "data"])
    ok(new RegExp(`renderAboutPanel\\("${part}"\\)`).test(s), `${part} not routed`);
});
check("changing section resets to its first tab", () =>
  ok(/activePanel   = null;/.test(s),
     "otherwise somebody re-enters a section on a tab they never chose"));
check("in-section actions keep their tab", () => {
  ok(/activePanel   = 'display';/.test(s), "Display reset would jump tabs");
  ok(/activePanel   = 'notify';/.test(s), "reminders toggle would jump tabs");
});
check("sub-tabs carry tab semantics", () => {
  ok(/role="tablist"/.test(s) && /role="tab"/.test(s) && /role="tabpanel"/.test(s),
     "screen readers need the relationship, not just buttons");
  ok(/aria-selected="\$\{id === open\}"/.test(s), "no selected state announced");
});

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
