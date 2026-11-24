/**
 * views/plan-link-back.js
 * 24 Nov 2026 v1
 *
 * P-44 THE PHYSIO LINK, S4 BACK (spec docs/specs/alongside_physio-link_23nov2026_v1.md
 * section 3; Graeme, 24 Nov: "Yes please"). The link a physio or trainer
 * sent back, opened from the link itself (app.js) or pasted into Add a plan
 * you already have. The code arrives on router.planBack and is never kept.
 *
 * What they changed, each change in words, all ticked; their line at the
 * top. Use all of it, or the ones ticked, or Keep my list. Using them keeps
 * the list as it was (store.setOwnPrevious) for Put back my old list, 30
 * days. Their notes are kept only with the health consent. The Plan only:
 * Free is told it is the Plan's and nothing is kept.
 *
 * showNotHere(): the app opened by the link with nobody set up in it (an
 * iPhone opens Safari, which keeps none of the Home Screen app's data): say
 * so, offer Copy this link, or set up here instead.
 *
 * WCAG 2.2 AA: one h1 that takes focus; the changes in a fieldset of real
 * checkboxes; the count said in a status line; nothing relies on colour.
 */

import { store } from "../store.js";
import { isPremium } from "../auth.js";
import { healthAllowed } from "../data/health-consent.js";
import { exerciseById } from "../data/plan-reader.js";
import { decodePlan, changesFrom, applyChanges } from "../data/plan-link.js";

const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const dayOf = iso => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long" });

export function PlanLinkBackView(router) {
  let root = null;
  let code = null;
  let plan = null, changes = [], ticked = new Set();
  let state = "reading";      // reading | bad | out | none | choose | done | free
  let used = 0;

  async function mount(el) {
    root = el;
    code = router.planBack || null;
    router.planBack = null;
    if (!isPremium()) { state = "free"; render(); return; }
    render();
    const r = await decodePlan(code);
    if (!r.ok) state = "bad";
    else if (r.plan.t !== "back") state = "out";
    else {
      plan = r.plan;
      changes = changesFrom(store.get("prescribedExercises") || [], plan);
      ticked = new Set(changes.map(c => c.id));
      state = changes.length ? "choose" : "none";
    }
    render();
  }

  function shell(h1, body) {
    return `<div class="view share-view is-plan">
      <button class="btn btn-ghost pr-back plan-back" id="plb-home" aria-label="Back to Home">‹ Back</button>
      <h1 class="share-title" tabindex="-1">${esc(h1)}</h1>${body}</div>`;
  }

  function render() {
    if (!root) return;
    const acts = (...b) => `<div class="sp-acts">${b.join("")}</div>`;
    const btn = (id, label, primary = false, extra = "") => `<button class="btn ${primary ? "btn-primary" : "btn-secondary"} btn-large btn-full" id="${id}"${extra}>${esc(label)}</button>`;
    let html;
    if (state === "free") html = shell("Changes to your exercises", `<p class="pr-range">Using a physio’s or trainer’s changes from a link is part of the Plan. Nothing from the link has been kept.</p>
      ${acts(btn("plb-upgrade", "See the Plan", true), btn("plb-own", "My exercises"))}`);
    else if (state === "reading") html = shell("Changes to your exercises", `<p class="pr-range" role="status">Reading the link…</p>`);
    else if (state === "bad") html = shell("Changes to your exercises", `<p class="pr-range">This link is not complete. Ask for it to be sent again.</p>
      <p class="pr-range">Links from Alongside: Move are long. If it was cut short in a message, ask them to use Copy the link or Email it.</p>${acts(btn("plb-own", "My exercises", true))}`);
    else if (state === "out") html = shell("Changes to your exercises", `<p class="pr-range">This is the link you sent, so it has no changes in it yet. When they press Send back, they get a new link to send you.</p>${acts(btn("plb-own", "My exercises", true))}`);
    else if (state === "none") html = shell("Nothing to change", `<p class="pr-range">${plan.say ? `They wrote: “${esc(plan.say)}” ` : ""}Your exercises already match what they sent back${plan.of ? ` for your list from ${esc(dayOf(plan.of))}` : ""}.</p>${acts(btn("plb-own", "My exercises", true))}`);
    else if (state === "done") html = shell("Your exercises are changed", `<p class="pr-range">${used === 1 ? "One change used." : `${used} changes used.`} Your list as it was is kept for 30 days: <strong>My exercises › Put back my old list</strong>.</p>${acts(btn("plb-own", "My exercises", true))}`);
    else {
      const n = ticked.size, all = n === changes.length;
      const noteLost = !healthAllowed() && changes.some(c => c.back && c.back.nt);
      html = shell("What your physio or trainer changed", `
        <p class="pr-range">Changes to your list${plan.of ? ` from ${esc(dayOf(plan.of))}` : ""}, sent back on ${esc(dayOf(plan.at))}. Untick any you don’t want.</p>
        ${plan.say ? `<figure class="plb-say"><figcaption>They wrote</figcaption><blockquote>${esc(plan.say)}</blockquote></figure>` : ""}
        <fieldset class="sh-group sh-parts"><legend class="sh-legend">${changes.length === 1 ? "1 change" : `${changes.length} changes`}</legend>
          ${changes.map((c, i) => `<label class="sh-part"><input type="checkbox" id="plb-c-${i}" data-change="${esc(c.id)}"${ticked.has(c.id) ? " checked" : ""}>
            <span>${c.kind === "changed" ? `<span class="plb-kind">Changed.</span> ` : ""}${esc(c.text)}</span></label>`).join("")}
        </fieldset>
        ${noteLost ? `<p class="sp-left">Their notes are shown here but not kept, because you’ve said the app can’t keep health answers (Settings › Your data).</p>` : ""}
        <p class="sh-status" id="plb-status" role="status" aria-live="polite"></p>
        ${acts(btn("plb-use", n === 0 ? "Tick at least one to use" : all ? "Use all of it" : `Use the ${n} ticked`, true, n === 0 ? " disabled" : ""), btn("plb-keep", "Keep my list"))}`);
    }
    root.innerHTML = html;
    wire();
  }

  function focusTitle() { root?.querySelector("h1")?.focus(); }

  function use() {
    const own = store.get("prescribedExercises") || [];
    const ids = changes.filter(c => ticked.has(c.id)).map(c => c.id);
    if (!ids.length) return;
    store.setOwnPrevious(own.length ? own : null);
    store.set("prescribedExercises", applyChanges(own, plan, ids, { notes: healthAllowed(), known: id => !!exerciseById(id) }));
    used = ids.length; state = "done"; render(); focusTitle();
  }

  function wire() {
    const q = s => root.querySelector(s);
    q("#plb-home")?.addEventListener("click", () => router.navigate("today"));
    q("#plb-own")?.addEventListener("click", () => router.navigate("prescribed"));
    q("#plb-keep")?.addEventListener("click", () => router.navigate("prescribed"));
    q("#plb-upgrade")?.addEventListener("click", () => router.navigate("upgrade"));
    q("#plb-use")?.addEventListener("click", use);
    root.querySelectorAll("[data-change]").forEach((cb, i) => cb.addEventListener("change", () => {
      if (cb.checked) ticked.add(cb.dataset.change); else ticked.delete(cb.dataset.change);
      render();
      root.querySelector(`#plb-c-${i}`)?.focus();
      const s = root.querySelector("#plb-status");
      if (s) setTimeout(() => { s.textContent = `${ticked.size} of ${changes.length} ticked.`; }, 30);
    }));
    if (!root.contains(document.activeElement)) focusTitle();
  }

  function onUnmount() { root = null; }
  return { mount, onUnmount };
}

/**
 * The link opened where nobody is set up (spec section 6). Rendered into
 * el by app.js before any screen; onSetUp() carries on to onboarding.
 */
export function showNotHere(el, link, onSetUp) {
  el.innerHTML = `<div class="view share-view">
    <h1 class="share-title" tabindex="-1">Changes to your exercises</h1>
    <p class="pr-range">This link has changes to someone’s exercises from their physio or trainer. Alongside: Move isn’t set up in this browser, so there’s nothing here to change.</p>
    <p class="pr-range">On an iPhone, the app on your Home Screen keeps its own data. <strong>Copy this link</strong>, open Alongside: Move from your Home Screen, and paste it into <strong>My exercises › Add a plan you already have</strong>.</p>
    <p class="sh-status" id="plb-status" role="status" aria-live="polite"></p>
    <div class="sp-acts">
      <button class="btn btn-primary btn-large btn-full" id="plb-copy">Copy this link</button>
      <button class="btn btn-secondary btn-large btn-full" id="plb-setup">Set up Alongside: Move here instead</button>
    </div></div>`;
  el.querySelector("#plb-copy").addEventListener("click", async () => {
    const s = el.querySelector("#plb-status");
    try { await navigator.clipboard.writeText(link); s.textContent = "Link copied. Now open Alongside: Move from your Home Screen."; }
    catch { s.textContent = "Copying is not allowed here. Press and hold the address bar to copy the link."; }
  });
  el.querySelector("#plb-setup").addEventListener("click", () => onSetUp());
  el.querySelector("h1").focus();
}
