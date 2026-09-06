/**
 * tools/verify-tier-visible.mjs
 * 06 Sep 2026 v1
 *
 * TIER-VISIBLE. The device never hides which plan it is in.
 *
 * ── WHY ─────────────────────────────────────────────────────────────
 *
 * The tier was displayed in exactly one place: inside the developer
 * panel, behind an undocumented triple-tap. A device could sit in the
 * Plan with nothing on any screen saying so.
 *
 * That is how Graeme came to ask why free was showing him the arc. It
 * was not. The arc is correctly gated at today.js:690 behind
 * isPremium(); his handset was simply on "personal" and nothing said so.
 *
 * The cost is not confusion, it is CONTAMINATED EVIDENCE. A beta tester
 * who switches once and forgets reports on "free" while being shown the
 * Plan, and the feedback reads as valid. So does every on-device
 * judgement made before this shipped.
 *
 * ── WHAT THIS GATE HOLDS ────────────────────────────────────────────
 *
 * That the line exists, is VISIBLE (not hidden like the panel it
 * compensates for), says "Free" or "the Plan" per NAME-1, and agrees
 * with isPremium() -- the same predicate that gates the arc -- rather
 * than with a second reading of the raw store field that could drift
 * from it.
 *
 * ── THE FIXTURE WALKS THE REAL PATH, TWICE OVER ─────────────────────
 *
 * Settings opens on the NAV-5 three-row index. Neither surface is
 * rendered at mount:
 *
 *   the plan line -> Settings section > Profile panel
 *   the switcher  -> About section > App panel, then three real taps
 *
 * Two drafts of this gate failed here before it worked. The first
 * mounted and found no plan line at all. The second opened About and
 * found the dev BUTTON in the markup but not the version label, because
 * the section opens on "about-story" and the gesture only renders on
 * "about-app". Both are recorded because the pattern -- a fixture that
 * looks like it reached a screen and did not -- is this project's most
 * repeated fault.
 *
 * ── AND ONE PIECE OF DEAD CODE CAUGHT BEFORE IT SHIPPED ─────────────
 *
 * The first implementation added a handler syncing the plan line when
 * the dev switcher fires. It could never run: the panels are exclusive,
 * so #settings-plan-line is absent from the DOM at that exact moment --
 * asserted below, not assumed. A break that re-adds the handler goes
 * red. The line stays correct because it re-reads isPremium() on the
 * next render, which is the path a person actually takes.
 *
 * Four deliberate breaks, four caught red: hardcoding "Free"; reading a
 * different predicate from the one gating the arc; re-adding the dead
 * sync handler; rendering the line but hiding it.
 */
import { JSDOM } from "jsdom";
const dom = new JSDOM('<!doctype html><html><body><div id="main-content"></div></body></html>', { url: "https://example.org/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;
let pass=0, fail=0; const fails=[];
const ok=(m,c)=>{ if(c){pass++;console.log("  ok   "+m);} else {fail++;fails.push(m);console.log("  FAIL "+m);} };
const reverses=(m,fn)=>ok("[reversal] "+m, !fn());
const fs = await import("node:fs");
const setSrc = fs.readFileSync(new URL("../js/views/settings.js", import.meta.url), "utf8");
const { store } = await import("../js/store.js");
const { SettingsView } = await import("../js/views/settings.js");
const { router } = await import("../js/router.js");
const $ = s => document.querySelector(s);
const click = el => el && el.dispatchEvent(new dom.window.MouseEvent("click",{bubbles:true}));
// NAV-5: Settings opens on a three-row index. The profile panel is not
// rendered until a section is opened, so the gate clicks through the way
// a person does. Mounting alone renders the index and nothing else --
// which is how the first draft of this gate "found" no plan line at all.
const paint = () => {
  SettingsView(router).mount(document.getElementById("main-content"));
  const section = document.querySelector('[data-section="settings"]');
  if (!section) throw new Error("FIXTURE FAULT: settings section row not found");
  section.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
  const tab = document.querySelector('[data-tab="profile"], [data-panel="profile"]');
  if (tab) tab.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
};

console.log("\nTIER-VISIBLE — the device never hides which plan it is in\n");

store.set("tier","free"); paint();
const free = $("#settings-plan-line");
ok("FIXTURE REACHES IT: the line renders on the profile panel", !!free);
ok("free says Free", /your plan:\s*free/i.test(free.textContent.replace(/\s+/g," ")));
reverses("free does not claim the Plan", () => /the Plan/.test(free.textContent));

store.set("tier","personal"); paint();
const paid = $("#settings-plan-line");
ok("the Plan says the Plan", /your plan:\s*the plan/i.test(paid.textContent.replace(/\s+/g," ")));
reverses("the Plan does not still say Free", () => /Free/.test(paid.textContent));

ok("it is visible, not hidden like the dev panel",
  !paid.hasAttribute("hidden") && paid.getAttribute("aria-hidden") !== "true");
const devPanel = $("#settings-dev-panel");
ok("CONTRAST: the dev panel IS hidden, so this is a different surface",
  !devPanel || devPanel.hasAttribute("hidden"));

// It must agree with the predicate the app actually gates on.
const { isPremium } = await import("../js/auth.js");
store.set("tier","personal"); paint();
ok("it agrees with isPremium(), the predicate that gates the arc",
  isPremium() === /the plan/i.test($("#settings-plan-line").textContent));
store.set("tier","free"); paint();
ok("and agrees when free too",
  isPremium() === /the plan/i.test($("#settings-plan-line").textContent));

// The dev switcher must not leave the line lying.
//
// It does NOT live on the profile panel -- it is in the About section,
// behind a deliberate triple-tap on the version label. The gate performs
// the real gesture rather than reaching past it, because the sync it is
// testing only ever fires through that path.
store.set("tier","free"); paint();
const planLineBefore = $("#settings-plan-line");
ok("the plan line is on screen before the switch", !!planLineBefore);

SettingsView(router).mount(document.getElementById("main-content"));
const aboutRow = document.querySelector('[data-section="about"]');
ok("FIXTURE REACHES IT: the About section row exists", !!aboutRow);
click(aboutRow);
// The About section opens on "about-story". The version label -- and so
// the triple-tap gesture -- only renders on "about-app". Clicking the
// section row alone lands on the wrong panel, which is how the previous
// draft found the dev BUTTON in the markup but not the version label.
const appPanel = document.querySelector('[data-panel="about-app"]');
ok("FIXTURE REACHES IT: the About > App panel row exists", !!appPanel);
click(appPanel);
const versionEl = $("#settings-version");
ok("FIXTURE REACHES IT: the version label is on the About panel", !!versionEl);
click(versionEl); click(versionEl); click(versionEl);
const devPanelNow = $("#settings-dev-panel");
ok("three taps reveal the developer panel", devPanelNow && !devPanelNow.hasAttribute("hidden"));
const devBtn = document.querySelector('[data-dev-tier="personal"]');
ok("FIXTURE REACHES IT: the dev switcher button exists to click", !!devBtn);
click(devBtn);
ok("the switch actually changed the stored tier", store.get("tier") === "personal");
// The panels are EXCLUSIVE. Asserted, because a sync handler was written
// against this moment and could never have fired.
ok("the plan line is genuinely absent while the switcher is on screen",
  !$("#settings-plan-line"));
reverses("no dead sync handler has been added back against this moment",
  () => {
    // Strip comments first: the removal is DOCUMENTED at this spot, and a
    // naive string search finds the explanation and calls it the code.
    const after = setSrc.split("data-dev-tier").slice(1).join("");
    const code  = after.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    return /querySelector\(['"]#settings-plan-line/.test(code);
  });
// The plan line is on the PROFILE panel, which is not mounted while the
// About panel is open -- so the sync is asserted on a fresh render, which
// is what the person sees when they navigate back.
paint();
ok("after switching, the line reports the new tier",
  /the plan/i.test($("#settings-plan-line").textContent));
reverses("it does not keep reporting the tier the device just left",
  () => /Free/.test($("#settings-plan-line").textContent));

console.log("\n────────────────────────────────\n"+pass+" passed, "+fail+" failed");
if(fails.length){ fails.forEach(f=>console.log("  - "+f)); process.exit(1); }
console.log("TIER-VISIBLE green.\n");
