/**
 * js/guide.js
 * 24 Nov 2026 v3
 *
 * v3 - P-46 S2. No Help on onboarding/start (answered, start to end).
 *
 * 15 Nov 2026 v2
 *
 * v1 - P-25 HOW-TO GUIDES (spec v3 §2.1, §2.3; mock-up v2, Graeme 12 Nov:
 *   "Perfect"). Two things the app shell draws, once, the way the router
 *   draws the house button:
 *
 *   1. HELP. "Help" in words with a line icon, in its own slim row above the
 *      screen, top right, in the same place and order on every screen where
 *      it is shown (WCAG 2.2 SC 3.2.6). It scrolls with the page, never
 *      fixed over content. Hidden while a session is running (the players,
 *      the gates and the finish: HELP_HIDDEN). Both tiers. It opens How do
 *      I…? (views/help.js); coming back puts focus on it again (SC 2.4.3).
 *
 *   2. GUIDE ME THROUGH IT. The help sits over the live app while you do the
 *      task: a ring on the real button (a thick outline, never colour
 *      alone), an arrow in the left margin, and a box with the step docked
 *      at the top or bottom edge, whichever is further from the button. You
 *      tap the real button; the app does what it always does, and the box
 *      moves on. Tap something else and the box says "You've left the
 *      guide." with Carry on from here and Stop the guide: the tap goes
 *      ahead, nothing is undone. The box never moves on by itself and never
 *      times out (SC 2.2.1); Back a step and Stop the guide are always there
 *      (SC 1.4.13); each new step is said once in a live region and focus
 *      stays in the app (SC 4.1.3); the page gets room for the box (SC
 *      2.4.11); the pulse stops under Reduce motion (SC 2.3.3).
 *
 * v2 (15 Nov, on the live app): a later step's screen open (the check-in
 *   already answered today) carries the guide on from there; the check-in is
 *   a screen to wait through ("Answer the questions"), never off the route;
 *   Make this smaller keeps its words at ordinary text sizes.
 *
 * Steps come from data/guides.js and find their button by its
 * data-guide-target marker. Nothing about guide use is stored or sent:
 * closing the app ends the guide.
 */
import { guideById, wayFor, stepsOf, sayHTML, plainSay } from "./data/guides.js";
import { lineIcon } from "./data/line-icons.js";

/** No Help on a screen that is only answered, or that runs from start to end. */
export const HELP_HIDDEN = new Set([
  "help",
  "onboarding/thread", "onboarding/start", "onboarding/goals", "onboarding/conditions", "onboarding/equipment", "onboarding/plan-select",
  "home-threshold", "community-impact", "annual-reflection",
  "guide-me", "class-player", "practices", "in-step",
  "reflect", "plan-finish", "journal-entry",
  "red-flag", "health-consent", "age-check", "under-18", "consent-update",
]);

/**
 * The players. Help shows on a player's start screen (choosing, the safety
 * note, Start) and goes the moment the session is running: the player's own
 * session guard says when (isGuardActive(), the house button's own test).
 */
export const PLAYERS = new Set([
  "workout", "gym-programme", "morning-session", "core-session", "yoga-session", "walk-session",
  "running-session", "cycle-session", "swim-session", "quiet-session", "breathing-session",
  "prescribed-session", "capture",
]);
let guardMod = null;
const running = () => { try { return !!guardMod?.isGuardActive(); } catch { return false; } };
/** No Help here, now? */
export const helpHiddenNow = view => HELP_HIDDEN.has(view) || (PLAYERS.has(view) && running());

const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const $ = (s, r = document) => r.querySelector(s);

let R = null;
const WAIT_MS = 3000;
const fresh = () => ({ id: null, way: null, side: null, waitSince: 0, waiting: false, steps: [], i: 0, sub: false, off: false, pause: false, ended: false, mini: false, ret: null, said: "", lastI: -1 });
let G = fresh();
let ringEl = null, timer = 0, observer = null;

// ── Help ──────────────────────────────────────────────────────────────────

export function helpButtonHTML(where = "row") {
  return where === "panel"
    ? `<button type="button" class="help-btn help-btn--panel" data-help-open="panel">${lineIcon("unsure", 20)}<span>Help</span></button>`
    : `<button type="button" class="help-btn" id="help-btn" data-help-open="row">${lineIcon("unsure", 20)}<span>Help</span></button>`;
}

export function initGuides(router) {
  R = router;
  import("./session-guard.js").then(m => { guardMod = m; }).catch(() => {});
  const row = document.getElementById("help-row");
  if (row && !row.querySelector("#help-btn")) row.innerHTML = helpButtonHTML();
  // Help is the row's button, or, where a screen covers the page with its own
  // panel (Today's plan), the same button drawn top right in that panel.
  document.addEventListener("click", e => {
    const b = e.target.closest?.("[data-help-open]");
    if (b) openHelp(b.dataset.helpOpen);
  });
  document.addEventListener("click", onClick, true);
  document.addEventListener("alongside:mounted", e => afterMount(e.detail?.view));
  const main = document.getElementById("main-content");
  if (main && typeof MutationObserver === "function") {
    // The ring's own class going on and off is not a change to the screen.
    const ringOnly = r => r.type === "attributes" && r.attributeName === "class" &&
      String(r.oldValue || "").replace(/\s*gd-ring/g, "").trim() === String(r.target.className || "").replace(/\s*gd-ring/g, "").trim();
    observer = new MutationObserver(recs => {
      if (recs.every(ringOnly)) return;
      if (PLAYERS.has(R?.currentView)) helpRow();     // a session starting, or ending
      if (G.id) schedule();
    });
    observer.observe(main, { childList: true, subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ["hidden", "class", "disabled"] });
  }
  window.addEventListener("scroll", () => { if (G.id && ringEl) placeArrow(); }, { passive: true });
  window.addEventListener("resize", () => { if (G.id) schedule(); });
}

/** Help: open How do I…? for the screen the person is on. A running guide stops. */
export function openHelp(where = "row") {
  if (G.id) stopGuide({ quiet: true });
  if (!R) return;
  R.helpFrom = R.currentView;
  R.helpFocus = where === "panel" ? "panel" : "row";
  R.helpOpen = { screen: "home" };
  R.navigate("help");
}

/** After every screen: Help shown or hidden, and the guide drawn again. */
export function afterMount(view) {
  helpRow(view);
  if (view !== "help" && R?.helpReturnFocus) {
    R.helpReturnFocus = false;
    const sel = R.helpFocus === "panel" ? "[data-help-open='panel']" : "#help-btn";
    setTimeout(() => document.querySelector(sel)?.focus({ preventScroll: true }), 120);
  }
  if (G.id) schedule();
}

function helpRow(view = R?.currentView) {
  const row = document.getElementById("help-row");
  if (!row) return;
  const hide = helpHiddenNow(view);
  if (row.hidden !== hide) row.hidden = hide;
  const hatch = document.getElementById("hidden-nav-home-btn");
  row.classList.toggle("help-row--hatch", !!hatch && !hatch.classList.contains("hidden"));
}

// ── Guide me through it ──────────────────────────────────────────────────

export const guideState = () => ({ ...G, step: G.id ? cur() : null });

export function startGuide(id) {
  const g = guideById(id);
  const way = wayFor(g);
  if (!way || !R) return false;
  // The way is fixed when the guide starts: Part 1 can change what is true
  // (a week now exists), and the guide must not jump to another way.
  G = { ...fresh(), id, way, steps: stepsOf(way), ret: R.helpFrom || "today" };
  const s = firstScreen(G.steps[0].screen);
  R.navigate(s === "any" ? G.ret : s);
  schedule();
  return true;
}

export function stopGuide({ quiet = false } = {}) {
  G = fresh();
  clearRing();
  const o = document.getElementById("guide-overlay");
  if (o) { o.innerHTML = ""; o.dataset.html = ""; }
  roomFor(null);
  if (!quiet) say("Guide stopped.");
}

/** Screens the app may put in the way (asked once a day): wait there, never "left the guide". */
const PASS = new Set(["checkin"]);
/** The first later step, in this part, whose screen is open now. */
function aheadOnScreen(v) {
  const part = G.steps[G.i]?.part;
  for (let k = G.i + 1; k < G.steps.length; k++) {
    const ks = G.steps[k];
    if (ks.part !== part) break;
    if (ks.screen !== "any" && onScreen(ks, v)) return k;
  }
  return -1;
}
const onPrevScreen = v => { const p = G.steps[G.i - (G.sub ? 0 : 1)]; return !!p && p.screen !== "any" && onScreen(p, v); };
const firstScreen = s => (Array.isArray(s) ? s[0] : s);
const onScreen = (st, v) => st.screen === "any" ? !HELP_HIDDEN.has(v) : (Array.isArray(st.screen) ? st.screen.includes(v) : st.screen === v);

/** The step now: its "then" after the first tap, and the alternative on screen. */
function cur() {
  let st = G.steps[G.i];
  if (!st) return null;
  if (G.sub && st.then) st = { ...st, ...st.then, then: null };
  if (st.alts) {
    const a = st.alts.find(x => findTarget(x.target)) || st.alts[0];
    st = { ...st, ...a, alts: null };
  }
  return st;
}

export function findTarget(t) {
  const list = Array.isArray(t) ? t : [t];
  for (const one of list) {
    if (!one) continue;
    const sel = one.startsWith("nav:") ? `#bottom-nav [data-nav="${one.slice(4)}"]` : `[data-guide-target="${one}"]`;
    const el = [...document.querySelectorAll(sel)].find(visible);
    if (el) return el;
  }
  return null;
}
const visible = el => !!el && !el.closest("[hidden], .hidden, [aria-hidden='true']") && !el.disabled;

function schedule() {
  clearTimeout(timer);
  timer = setTimeout(sync, 60);
}

function sync() {
  if (!G.id) return;
  const v = R?.currentView;
  const st = cur();
  const keep = ringEl;
  if (!st) { clearRing(); return; }
  const hidden = helpHiddenNow(v) && !(st && onScreen(st, v) && !G.off && !G.pause && !G.ended);
  if (hidden) { G.waitSince = 0; clearRing(); draw(null, true); return; }
  if (G.off || G.pause || G.ended) { G.waitSince = 0; clearRing(); draw(null); return; }
  if (!onScreen(st, v)) {
    // A later step's screen is open: the app skipped a screen the guide
    // allowed for (the check-in, already answered today). Carry on from there.
    const later = aheadOnScreen(v);
    if (later > G.i) { G.i = later; G.sub = false; G.waitSince = 0; G.waiting = false; return sync(); }
    // Between screens: "One moment…", never the next screen's words early.
    // Still not there after a few seconds (a back gesture, say): off the route.
    clearRing();
    // Still on the last step's screen (the check-in finishing, or a button
    // there to tap first): the person carries on there, for as long as it takes.
    if (onPrevScreen(v) || PASS.has(v)) { G.waitSince = 0; G.waiting = PASS.has(v) && !onPrevScreen(v) ? "pass" : "here"; draw(null); return; }
    if (!G.waitSince) { G.waitSince = Date.now(); setTimeout(() => { if (G.id) sync(); }, WAIT_MS + 100); }
    else if (Date.now() - G.waitSince > WAIT_MS) { G.waitSince = 0; G.waiting = false; G.off = true; say("You’ve left the guide."); draw(null); return; }
    G.waiting = "moment"; draw(null); return;
  }
  G.waitSince = 0; G.waiting = false;
  const el = findTarget(st.target);
  if (!el && st.optional) { G.i++; G.sub = false; return sync(); }
  let moved = false;
  if (keep !== el) clearRing();
  if (el) {
    if (!el.classList.contains("gd-ring")) el.classList.add("gd-ring");
    ringEl = el;
    if (G.lastI !== G.i * 2 + (G.sub ? 1 : 0)) {
      G.lastI = G.i * 2 + (G.sub ? 1 : 0);
      G.side = null;
      moved = true;
      try { el.scrollIntoView({ block: "center" }); } catch { /* old browsers */ }
    }
  }
  draw(el);
  if (moved) intoFreeSpace(el);
}

/** Then move the page so the ring sits in the space the box leaves free. */
function intoFreeSpace(el) {
  const dock = document.querySelector("#guide-overlay .gd-dock");
  if (!el || !dock || el.closest("#bottom-nav")) return;
  const r = el.getBoundingClientRect(), d = dock.getBoundingClientRect();
  if (!r.height) return;
  const nav = document.getElementById("bottom-nav");
  const navH = nav && !nav.classList.contains("hidden") ? nav.getBoundingClientRect().height : 0;
  const top = G.side === "top" ? d.bottom : 0;
  const bottom = G.side === "top" ? (window.innerHeight - navH) : d.top;
  if (r.top >= top + 8 && r.bottom <= bottom - 8) return;
  const want = r.height < (bottom - top - 24) ? (top + bottom) / 2 - (r.top + r.height / 2) : top + 16 - r.top;
  try { window.scrollBy(0, -want); } catch { /* jsdom */ }
  placeArrow();
}

function clearRing() {
  document.querySelectorAll(".gd-ring").forEach(x => x.classList.remove("gd-ring"));
  ringEl = null;
}

function advance() {
  const st = G.steps[G.i];
  if (st.then && !G.sub) { G.sub = true; schedule(); return; }
  G.sub = false;
  if (G.i < G.steps.length - 1) {
    const next = G.steps[G.i + 1];
    G.i++;
    if (next.part !== st.part) G.pause = true;
    schedule();
    return;
  }
  G.ended = true;
  schedule();
}

function back() {
  if (G.sub) G.sub = false;
  else if (G.i > 0) {
    G.i--;
    while (G.i > 0 && G.steps[G.i].optional && !findTarget(G.steps[G.i].target)) G.i--;
  }
  G.off = false;
  const st = cur();
  if (st && !onScreen(st, R.currentView) && st.screen !== "any") R.navigate(firstScreen(st.screen));
  schedule();
}

/** Carry on from here: back to the step's screen, from the first step there. */
function resume() {
  G.off = false;
  const st = G.steps[G.i];
  if (st && st.screen !== "any" && !onScreen(st, R.currentView)) {
    let j = G.i;
    while (j > 0 && G.steps[j - 1].part === st.part && JSON.stringify(G.steps[j - 1].screen) === JSON.stringify(st.screen)) j--;
    G.i = j; G.sub = false;
    R.navigate(firstScreen(st.screen));
  }
  schedule();
}

function onClick(e) {
  const b = e.target.closest?.("button, a, [role=button], input, textarea, select, label, summary");
  if (!b || !G.id) return;
  if (b.closest("#guide-overlay")) { dockClick(b, e); return; }
  if (b.closest("#help-row")) return;
  if (G.off || G.pause || G.ended) return;
  const st = cur();
  if (!st || !onScreen(st, R.currentView)) {
    if (b.matches("input, textarea, select") || b.closest("label")) return;
    if (onPrevScreen(R.currentView) || PASS.has(R.currentView)) return;   // finishing the last screen is part of the route
    return offRoute();
  }
  const el = findTarget(st.target);
  const inEl = !!el && (el === b || el.contains(b));
  if (inEl && st.tap !== false) { advance(); return; }
  if (ahead(b)) return;
  if (inEl) return;                         // a box to type in, or a row to read: no step yet
  // The step before, on this screen, can be changed (a different day, another aim).
  const prev = G.steps[G.i - (G.sub ? 0 : 1)];
  const pel = prev && onScreen(prev, R.currentView) ? findTarget(prev.target) : null;
  if (pel && (pel === b || pel.contains(b))) return;
  if (b.matches("input, textarea, select") || b.closest("label") || b.matches("summary")) return;
  offRoute();
}

/** A later step's button on this screen: the person is ahead of the guide. */
function ahead(b) {
  if (G.sub) return false;
  for (let k = G.i + 1; k <= Math.min(G.i + 2, G.steps.length - 1); k++) {
    const ks = G.steps[k];
    if (!onScreen(ks, R.currentView) || ks.part !== G.steps[G.i].part) break;
    const kel = findTarget(ks.alts ? ks.alts.map(a => a.target) : ks.target);
    if (kel && (kel === b || kel.contains(b))) { G.i = k; G.sub = false; advance(); return true; }
  }
  return false;
}

function offRoute() {
  G.off = true;
  clearRing();
  say("You’ve left the guide.");
  schedule();
}

function dockClick(b, e) {
  const a = b.dataset.gd;
  if (!a) return;
  e.preventDefault();
  if (a === "stop") { stopGuide(); setTimeout(() => document.getElementById("help-btn")?.focus({ preventScroll: true }), 0); return; }
  if (a === "back") return back();
  if (a === "next") return advance();
  if (a === "mini") { G.mini = true; draw(ringEl); $("#guide-overlay [data-gd='big']")?.focus(); return; }
  if (a === "big") { G.mini = false; draw(ringEl); $("#guide-overlay .gd-dock__say")?.focus(); return; }
  if (a === "resume") return resume();
  if (a === "carry") { G.pause = false; schedule(); return; }
  if (a === "done") {
    const id = G.id, ret = G.ret;
    stopGuide({ quiet: true });
    R.helpFrom = ret;
    R.helpOpen = { screen: "done", id };
    R.navigate("help");
  }
}

// ── The box ────────────────────────────────────────────────────────────

function dockBody(st) {
  const total = G.steps.length;
  const parts = G.steps[0]?.parts || 1;
  const done = G.i + (G.ended ? 1 : 0);
  const bar = `<span class="gd-dock__bar" aria-hidden="true"><i style="width:${Math.round((done / total) * 100)}%"></i></span>`;
  const g = guideById(G.id);
  const btn = (gd, label, cls = "btn-ghost") => `<button type="button" class="btn ${cls}" data-gd="${gd}">${label}</button>`;
  if (G.ended) {
    return { key: "end", text: `That’s it. ${plainSay(g?.end)}`, html: `<p class="gd-dock__eyebrow" id="gd-dock-h">Guide · Done ${bar}</p>
      <p class="gd-dock__say" tabindex="-1">That’s it. ${sayHTML(g?.end, esc)}</p>
      <div class="gd-dock__row">${btn("done", "Did that work?", "btn-primary")}${btn("stop", "Close")}</div>` };
  }
  if (G.off) {
    return { key: "off", text: "You’ve left the guide.", html: `<p class="gd-dock__eyebrow" id="gd-dock-h">Guide · paused</p>
      <p class="gd-dock__say" tabindex="-1">You’ve left the guide.</p>
      <div class="gd-dock__row">${btn("resume", "Carry on from here", "btn-primary")}${btn("stop", "Stop the guide", "btn-secondary")}</div>` };
  }
  if (G.pause) {
    const prevPart = G.way?.parts[G.steps[G.i].part - 1];
    return { key: "pause" + G.i, text: prevPart?.done || "Part done.", html: `<p class="gd-dock__eyebrow" id="gd-dock-h">Guide · Part ${G.steps[G.i].part} of ${parts} done ${bar}</p>
      <p class="gd-dock__say" tabindex="-1">${esc(prevPart?.done || "That part is done.")}</p>
      <div class="gd-dock__row">${btn("carry", "Carry on", "btn-primary")}${btn("stop", "Stop here", "btn-secondary")}</div>` };
  }
  const s = G.steps[G.i];
  const partTxt = parts > 1 ? `Part ${s.part + 1} of ${parts} · ` : "";
  const eyebrow = `<p class="gd-dock__eyebrow" id="gd-dock-h">${partTxt}Step ${s.index + 1} of ${s.inPart} ${bar}</p>`;
  if (G.waiting) {
    return { key: "wait" + G.i + G.waiting, text: "", html: `${eyebrow}<p class="gd-dock__mini">${G.waiting === "here" ? "Carry on here. The guide picks up on the next screen." : G.waiting === "pass" ? "Answer the questions. The guide picks up after." : "One moment…"}</p>
      <div class="gd-dock__row">${btn("stop", "Stop the guide")}</div>` };
  }
  if (G.mini) {
    return { key: "mini" + G.i + G.sub, text: "", html: `${eyebrow}<p class="gd-dock__mini">${st.tap === false ? "Then tap Next." : "Tap the ringed button."}</p>
      <div class="gd-dock__row">${btn("big", "Show the step", "btn-secondary")}${btn("stop", "Stop the guide")}</div>` };
  }
  const canBack = G.i > 0 || G.sub;
  // Large text: the same three buttons, said shorter so they share one line
  // (each name still begins with its visible word, SC 2.5.3), and the step at
  // body size, so the box takes less of the screen.
  const big = textScale() >= 1.4;
  // short: the word shown at large text; spoken: its name there (begins with
  // the word); long: the words at ordinary sizes.
  const b2 = (gd, short, spoken, long, cls) => big ? `<button type="button" class="btn ${cls}" data-gd="${gd}" aria-label="${spoken}">${short}</button>` : btn(gd, long, cls);
  return { key: "step" + G.i + G.sub + (st.target || "") + big, text: plainSay(st.say), html: `${eyebrow}
    <p class="gd-dock__say${big ? " gd-dock__say--big" : ""}" tabindex="-1">${sayHTML(st.say, esc)}</p>
    <div class="gd-dock__row${big ? " gd-dock__row--big" : ""}">${st.tap === false ? btn("next", "Next", "btn-primary") : ""}${canBack ? b2("back", "Back", "Back a step", "Back a step", "btn-secondary") : ""}${b2("stop", "Stop", "Stop the guide", "Stop the guide", "btn-ghost")}${b2("mini", "Smaller", "Smaller: make this box one line", "Make this smaller", "btn-ghost")}</div>` };
}

function draw(el, hidden = false) {
  const o = document.getElementById("guide-overlay");
  if (!o) return;
  if (!G.id || hidden) { o.innerHTML = ""; o.dataset.html = ""; roomFor(null); return; }
  const st = cur();
  const body = dockBody(st || {});
  // The side is chosen once a step: whichever edge is further from the button.
  if (!G.side || !el) G.side = el && !el.closest("#bottom-nav") && midY(el) > (window.innerHeight || 800) / 2 ? "top" : "bottom";
  const side = el ? G.side : "bottom";
  const nav = document.getElementById("bottom-nav");
  const navShown = !!nav && !nav.classList.contains("hidden");
  const hatch = document.getElementById("hidden-nav-home-btn");
  const hatchShown = !!hatch && !hatch.classList.contains("hidden");
  const html = `<section class="gd-dock gd-dock--${side}${navShown ? "" : " gd-dock--nonav"}${hatchShown ? " gd-dock--hatch" : ""}" aria-labelledby="gd-dock-h">${body.html}</section>`;
  // Drawn again only when it changes, so a keyboard or switch user's place in the box is kept.
  if (o.dataset.html !== html || !o.firstElementChild) { o.innerHTML = html; o.dataset.html = html; }
  roomFor(side, o.firstElementChild);
  placeArrow();
  if (body.text && body.key !== G.said) { G.said = body.key; say(body.text); }
}

const textScale = () => {
  try { return parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--user-text-scale")) || 1; } catch { return 1; }
};

const midY = el => { const r = el.getBoundingClientRect(); return r.top + r.height / 2; };

/** Room for the box, so nothing on the page is hidden behind it. */
function roomFor(side, dock) {
  const main = document.getElementById("main-content");
  if (!main) return;
  if (!side || !dock) { main.style.removeProperty("padding-top"); main.style.removeProperty("padding-bottom"); return; }
  const h = dock.offsetHeight || 160;
  if (side === "bottom") main.style.removeProperty("padding-top");
  if (side === "top") {
    main.style.setProperty("padding-top", `calc(${h}px + var(--content-padding, 16px))`, "important");
    // And room below, so a button near the end of the page can be scrolled up into view.
    main.style.setProperty("padding-bottom", `calc(var(--nav-height, 72px) + 45vh)`, "important");
  }
  else main.style.setProperty("padding-bottom", `calc(${h}px + var(--nav-height, 72px) + 24px)`, "important");
}

/** The arrow sits in the left margin, pointing at the ring, never over words. */
function placeArrow() {
  const o = document.getElementById("guide-overlay");
  if (!o) return;
  o.querySelector(".gd-arrow")?.remove();
  if (!ringEl || ringEl.closest("#bottom-nav")) return;
  const r = ringEl.getBoundingClientRect();
  if (!r.width && !r.height) return;
  const size = Math.max(16, Math.min(26, r.left - 6));
  const a = document.createElement("div");
  a.className = "gd-arrow";
  a.setAttribute("aria-hidden", "true");
  a.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M4 12h15M13 6l6 6-6 6"/></svg>`;
  const top = Math.max(r.top, 0), bot = Math.min(r.bottom, window.innerHeight || r.bottom);
  if (bot - top < 12) return;                 // off the screen: no arrow pointing at nothing
  a.style.cssText = `width:${size}px;height:${size}px;left:${Math.max(1, r.left - size - 5)}px;top:${(top + bot) / 2 - size / 2}px`;
  o.append(a);
}

function say(text) {
  const l = document.getElementById("guide-live");
  if (!l) return;
  l.textContent = "";
  setTimeout(() => { l.textContent = text; }, 40);
}
