/**
 * views/my-move.js
 * 26 Nov 2026 v6
 *
 * v6 - P-42 S2. In Step no longer says Coming soon for your age: the young
 *   versions have their own programme.
 *
 * 26 Nov 2026 v5
 *
 * v5 - P-41 S2 rule 5. In the 16-17 version In Step's line says it is
 *   coming soon for their age. Adults unchanged.
 *
 * 24 Nov 2026 v4
 *
 * v4 - P-46 S6 WORDS. Fewer words before the first button (spec §7: about
 *   15). The meaning kept; anything about safety unchanged.
 *
 * 23 Nov 2026 v3
 *
 * v3 - S5. Guide markers only (data-guide-target): Start (mm-start), Next
 *   (mm-next), That's mine (mm-done), for the Help guide A3.
 *
 * v2 - S4. Opened again after it is made, What's it for? leads with one
 *   suggestion when there is one ("You've used Stretch often lately. Put it
 *   on Home?" Add it / No thanks; no thanks is kept and never asked again).
 *   Which matters most says what it does now: it leads the aims offered when
 *   they set what they're working towards.
 *
 * P-39 MAKING MY MOVE, S2 SCREENS (spec docs/specs/alongside_making-my-move_23nov2026_v1.md
 * section 2; tap-through prototype v2, agreed by Graeme 23 Nov: "Those
 * things I think stick now"). The Plan only: Free is sent Home.
 *
 *   intro  Making my Move: Start, or Not sure? Keep it simple
 *   for    What's it for? (step 1 of 3): eight purposes, each with Try it
 *          first; Which matters most right now? when two or more
 *   good   On a good day, how much choice? (step 2 of 3)
 *   hard   On a hard day, what would help? (step 3 of 3): up to two;
 *          Rest stands alone; the sore-area safety line
 *
 * Steps 1 to 3 keep a live preview of Home above Next. It is hidden from a
 * screen reader as a picture and spoken instead as one polite line when it
 * changes. Every choice is saved as it is made (store.setMyMove), with the
 * step, so stopping part way keeps it and reopening returns there.
 *
 * Home reading myMove is S3; the aim from "Which matters most" is S4; the
 * coach's voice for Try it first comes with its recordings.
 *
 * WCAG 2.2 AA: one h1 per screen, focused on arrival; purposes are buttons
 * with aria-pressed; Try it first says aria-expanded and names its panel;
 * radios and checkboxes sit in fieldsets with legends; a choice that can't
 * be taken says why in words; nothing relies on colour; 44 px targets.
 */

import { store } from "../store.js";
import { isPremium } from "../auth.js";
import { lineIcon } from "../data/line-icons.js";
import { renderFigure, hasFigure } from "../figures.js";
import { PURPOSES, HARD_OFFERED, GOOD, purposeById, myMoveForScreens, goodDayDoors, previewSentence, suggestion } from "../data/my-move.js";

const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const STEPS = ["intro", "for", "good", "hard"];

export function MyMoveView(router) {
  let root = null;
  let screen = "intro";
  const open = new Set();          // Try it first panels open
  let focusKey = null;             // where focus returns after a re-render

  function mount(container) {
    root = container;
    if (!isPremium()) { router.navigate("today", { replace: true }); return; }
    const m = myMoveForScreens();
    screen = m.made && !m.step ? "for" : (STEPS.includes(m.step) ? m.step : "intro");
    render(true);
  }

  const m = () => store.get("myMove");
  function go(s) { screen = s; store.setMyMove({ step: s }); focusKey = null; render(true); }

  const header = back => `<div class="yw-header"><button type="button" class="btn btn-ghost yw-back plan-back" data-back="${back}" aria-label="${back === "home" ? "Back to Home" : "Back"}">‹ Back</button></div>`;

  function preview(hard) {
    const r = m();
    let body;
    if (hard) {
      const h = r.hardDay.map(id => HARD_OFFERED.find(x => x.id === id)).filter(Boolean);
      body = r.hardDay.includes("rest")
        ? `<span class="mm-pv__coach mm-pv__coach--rest">Rest today, and that's fine</span>`
        : `<span class="mm-pv__chips">${(h.length ? h : [HARD_OFFERED[0]]).map(x => `<span class="mm-chip k-${x.kind}">${esc(x.title)}</span>`).join("")}</span>`;
    } else {
      const doors = goodDayDoors(r).map(purposeById);
      const chips = [...doors.map(p => `<span class="mm-chip k-${p.kind}">${esc(p.short)}</span>`),
        ...(r.purposes.includes("calm") ? [`<span class="mm-chip k-green">Calm my mind</span>`] : [])];
      body = `<span class="mm-pv__coach">Let me choose for you</span>
        ${chips.length ? `<span class="mm-pv__chips">${chips.join("")}</span>` : `<span class="mm-pv__empty">One tap a day, nothing else.</span>`}`;
    }
    const most = r.most ? purposeById(r.most) : null;
    return `<div class="mm-pv" aria-hidden="true">
        <span class="mm-pv__label"><span>${hard ? "Your Home, hard day" : "Your Home, good day"}</span><span>Live</span></span>
        ${most ? `<span class="mm-pv__most">Matters most: ${esc(most.short)}</span>` : ""}
        ${body}
      </div>`;
  }

  function footer(hard, nextAttrs, nextLabel) {
    return `<div class="mm-foot">${preview(hard)}
      <p class="sr-only" id="mm-said" aria-live="polite"></p>
      <button type="button" class="btn btn-primary mm-next" ${nextAttrs} data-guide-target="${nextLabel === "Next" ? "mm-next" : "mm-done"}">${esc(nextLabel)}</button></div>`;
  }

  function intro() {
    return `${header("home")}
      <p class="mm-kicker">Start your Plan</p>
      <h1 class="yw-title" tabindex="-1">Making my Move</h1>
      <p class="yw-note">What do you want Alongside for, on good days and hard ones?</p>
      <div class="mm-intro-actions">
        <button type="button" class="btn btn-primary" data-go="for" data-key="start" data-guide-target="mm-start">Start</button>
        <button type="button" class="btn btn-secondary" data-simple data-key="simple">Not sure? Keep it simple</button>
      </div>
      <p class="yw-sub">About a minute. What you choose is kept if you stop, and you can change it any time.</p>`;
  }

  function purposeRow(p) {
    const on = m().purposes.includes(p.id);
    const isOpen = open.has(p.id);
    const fig = p.figure && hasFigure(p.figure) ? renderFigure(p.figure, { className: "mm-taste__fig" }) : `<span class="kind-tile k-${p.kind} mm-taste__icon" aria-hidden="true">${lineIcon(p.icon)}</span>`;
    return `<li class="mm-opt${on ? " is-on" : ""} k-${p.kind}">
      <button type="button" class="path-door mm-opt__btn" aria-pressed="${on}" data-purpose="${p.id}" data-key="p-${p.id}">
        <span class="kind-tile k-${p.kind}" aria-hidden="true">${lineIcon(p.icon)}</span>
        <span class="path-door__text"><span class="path-door__t">${esc(p.title)}</span><span class="path-door__d">${esc(p.line)}</span></span>
        <span class="mm-tick" aria-hidden="true">${on ? lineIcon("tick", 18) : ""}</span>
      </button>
      <button type="button" class="mm-taste-btn" aria-expanded="${isOpen}" aria-controls="mm-taste-${p.id}" data-taste="${p.id}" data-key="t-${p.id}">${isOpen ? "Close the taste" : "Try it first"}<span class="sr-only">: ${esc(p.short)}</span></button>
      <div class="mm-taste" id="mm-taste-${p.id}"${isOpen ? "" : " hidden"}>
        ${fig}
        <p class="mm-taste__line">“${esc(p.taste)}”</p>
      </div>
    </li>`;
  }

  function forScreen() {
    const r = m();
    const chosen = PURPOSES.filter(p => r.purposes.includes(p.id));
    const sug = suggestion();
    const sp = sug ? purposeById(sug.id) : null;
    return `${header("intro")}
      <p class="mm-kicker">Step 1 of 3</p>
      <h1 class="yw-title" tabindex="-1">What's it for?</h1>
      ${sp ? `<section class="mm-suggest" aria-labelledby="mm-suggest-h">
        <p class="mm-suggest__t" id="mm-suggest-h">You've used ${esc(sp.short)} often lately. Put it on Home?</p>
        <div class="mm-suggest__actions">
          <button type="button" class="btn btn-primary" data-sug-yes="${sp.id}" data-key="sug-yes">Add it</button>
          <button type="button" class="btn btn-secondary" data-sug-no="${sp.id}" data-key="sug-no">No thanks</button>
        </div></section>` : ""}
      <p class="yw-sub">Choose as many as you like. Ticked from what you told me at the start. Try any of them first.</p>
      <ul class="mm-list" aria-label="What Alongside: Move is for">${PURPOSES.map(purposeRow).join("")}</ul>
      ${chosen.length >= 2 ? `<fieldset class="mm-field">
        <legend class="mm-legend">Which matters most right now?</legend>
        <p class="yw-sub">The aims that fit it come first when you set what you're working towards.</p>
        ${chosen.map(p => `<label class="mm-radio"><input type="radio" name="mm-most" value="${p.id}" data-key="m-${p.id}"${r.most === p.id ? " checked" : ""}><span>${esc(p.short)}</span></label>`).join("")}
      </fieldset>` : ""}
      ${footer(false, 'data-go="good" data-key="next"', "Next")}`;
  }

  function goodScreen() {
    const r = m();
    return `${header("for")}
      <p class="mm-kicker">Step 2 of 3</p>
      <h1 class="yw-title" tabindex="-1">On a good day, how much choice?</h1>
      <fieldset class="mm-field">
        <legend class="sr-only">How much choice on a good day</legend>
        ${GOOD.map(g => `<label class="mm-radio"><input type="radio" name="mm-good" value="${g.id}" data-key="g-${g.id}"${r.goodDay === g.id ? " checked" : ""}>
          <span><strong>${esc(g.title)}</strong><span class="mm-radio__d">${esc(g.line)}</span></span></label>`).join("")}
      </fieldset>
      ${footer(false, 'data-go="hard" data-key="next"', "Next")}`;
  }

  function hardScreen() {
    const r = m();
    const n = r.hardDay.length;
    const full = n >= 2 || r.hardDay.includes("rest");
    const status = r.hardDay.includes("rest") ? "Rest on its own: Home will just say it's a rest day."
      : n >= 2 ? "Two chosen. Untick one to choose another." : `${n} of 2 chosen.`;
    return `${header("good")}
      <p class="mm-kicker">Step 3 of 3</p>
      <h1 class="yw-title" tabindex="-1">On a hard day, what would help?</h1>
      <p class="yw-sub">Choose up to two. When your check-in says it's a hard day, Home shows only these, so you won't have to decide then.</p>
      <fieldset class="mm-field">
        <legend class="sr-only">What would help on a hard day, up to two</legend>
        ${HARD_OFFERED.map(h => {
          const on = r.hardDay.includes(h.id);
          const blocked = !on && (full && !(h.id === "rest"));
          return `<label class="mm-check${blocked ? " is-blocked" : ""}"><input type="checkbox" value="${h.id}" data-hard="${h.id}" data-key="h-${h.id}"${on ? " checked" : ""}${blocked ? ' aria-disabled="true"' : ""}>
            <span><strong>${esc(h.title)}</strong><span class="mm-radio__d">${esc(h.line)}</span></span></label>`;
        }).join("")}
      </fieldset>
      <p class="yw-sub" id="mm-hard-count" aria-live="polite">${esc(status)}</p>
      <p class="mm-safety">If something is sore and you mark it Bad, that comes first: you'll still be asked whether to rest or do something gentler.</p>
      ${footer(true, 'data-done data-key="done"', "That's mine")}`;
  }

  function render(arrive = false) {
    if (!root) return;
    const body = screen === "for" ? forScreen() : screen === "good" ? goodScreen() : screen === "hard" ? hardScreen() : intro();
    // At a large text size the preview would take half the screen if it
    // stayed pinned, so there it sits above Next in the page instead.
    let big = false;
    try { big = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--user-text-scale")) > 1.2; } catch (e) { big = false; }
    root.innerHTML = `<div class="view yw-view mm-view is-plan${big ? " mm-view--big" : ""}" data-screen="${screen}">${body}</div>`;
    wire();
    const back = focusKey && root.querySelector(`[data-key="${focusKey}"]`);
    if (back) back.focus({ preventScroll: true });
    else if (arrive) root.querySelector(".yw-title")?.focus?.({ preventScroll: true });
  }

  function say(hard) {
    const el = root?.querySelector("#mm-said");
    if (el) el.textContent = previewSentence(m(), hard);
  }

  function togglePurpose(id) {
    const r = m();
    const on = r.purposes.includes(id);
    const purposes = on ? r.purposes.filter(x => x !== id) : [...r.purposes, id];
    let most = r.most;
    if (on && most === id) most = purposes.find(x => x !== "instep") || purposes[0] || null;
    // In Step is ticked for everyone, so a movement purpose takes over
    // from it as what matters most when one is chosen.
    if (!on && (!most || (most === "instep" && id !== "instep"))) most = id;
    store.setMyMove({ purposes, most });
  }

  function toggleHard(id, input) {
    const r = m();
    const on = r.hardDay.includes(id);
    if (on) { store.setMyMove({ hardDay: r.hardDay.filter(x => x !== id) }); return true; }
    if (id === "rest") { store.setMyMove({ hardDay: ["rest"] }); return true; }
    if (r.hardDay.includes("rest") || r.hardDay.length >= 2) { if (input) input.checked = false; return false; }
    store.setMyMove({ hardDay: [...r.hardDay, id] });
    return true;
  }

  function wire() {
    const $$ = s => [...root.querySelectorAll(s)];
    $$("[data-back]").forEach(b => b.addEventListener("click", () => {
      if (b.dataset.back === "home") { store.setMyMove({ step: null }); router.navigate("today"); }
      else go(b.dataset.back);
    }));
    $$("[data-go]").forEach(b => b.addEventListener("click", () => go(b.dataset.go)));
    $$("[data-simple]").forEach(b => b.addEventListener("click", () => {
      store.setMyMove({ goodDay: "one", hardDay: ["coach"], step: null, made: new Date().toISOString() });
      router.navigate("today");
    }));
    $$("[data-done]").forEach(b => b.addEventListener("click", () => {
      store.setMyMove({ step: null, made: new Date().toISOString() });
      router.navigate("today");
    }));
    $$("[data-purpose]").forEach(b => b.addEventListener("click", () => {
      togglePurpose(b.dataset.purpose); focusKey = b.dataset.key; render(); say(false);
    }));
    $$("[data-taste]").forEach(b => b.addEventListener("click", () => {
      const id = b.dataset.taste; open.has(id) ? open.delete(id) : open.add(id); focusKey = b.dataset.key; render();
    }));
    root.querySelector("[data-sug-yes]")?.addEventListener("click", e => {
      const id = e.currentTarget.dataset.sugYes;
      store.setMyMove({ purposes: [...m().purposes, id] }); focusKey = null; render(true); say(false);
    });
    root.querySelector("[data-sug-no]")?.addEventListener("click", e => {
      store.setMyMove({ dismissed: [...m().dismissed, e.currentTarget.dataset.sugNo] }); focusKey = null; render(true);
    });
    $$('input[name="mm-most"]').forEach(i => i.addEventListener("change", () => {
      store.setMyMove({ most: i.value }); focusKey = i.dataset.key; render(); say(false);
    }));
    $$('input[name="mm-good"]').forEach(i => i.addEventListener("change", () => {
      store.setMyMove({ goodDay: i.value }); focusKey = i.dataset.key; render(); say(false);
    }));
    $$("[data-hard]").forEach(i => i.addEventListener("change", () => {
      const done = toggleHard(i.dataset.hard, i);
      focusKey = i.dataset.key; render();
      if (!done) { const c = root.querySelector("#mm-hard-count"); if (c) c.textContent = "You can choose two. Untick one first."; }
      else say(true);
    }));
  }

  function onUnmount() { root = null; }

  return { mount, onUnmount };
}
