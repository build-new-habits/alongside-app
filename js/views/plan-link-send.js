/**
 * views/plan-link-send.js
 * 23 Nov 2026 v1
 *
 * P-44 THE PHYSIO LINK, S2 SEND (spec docs/specs/alongside_physio-link_23nov2026_v1.md
 * section 3; Graeme, 23 Nov: "Yes"). Reached from Share your plan. The Plan
 * only: Free is sent to Progress, as Share your plan sends it.
 *
 * One screen: what happens, in two lines; which lists go (all ticked);
 * notes (off, and only with the health consent) and a first name (off);
 * then Share… (the link to the phone's share sheet), Copy link and Show a
 * QR code (made on the phone, for the clinic). Nothing is sent by the app:
 * it only makes the link. The link opens buildnewhabits.co.uk/edit-plan/,
 * with the plan after the #, which a browser never sends to a server.
 *
 * WCAG 2.2 AA: one h1 that takes focus; real checkboxes in fieldsets; every
 * result said in a status line; the QR code is an image named for what it
 * is, with the link to copy beside it; nothing relies on colour.
 */

import { store } from "../store.js";
import { isPremium } from "../auth.js";
import { healthAllowed } from "../data/health-consent.js";
import { outFromOwn, encodePlan, linkFor, NO_GROUP } from "../data/plan-link.js";
import qrcode from "../data/qr.js";

export const EDIT_PAGE = "https://buildnewhabits.co.uk/edit-plan/";
/** Longer than this, a QR code is too dense for a phone camera: share the link. */
export const QR_MAX = 1200;

const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The lists in My exercises, in order, each with how many. */
export function ownLists() {
  const out = [];
  for (const e of store.get("prescribedExercises") || []) {
    if (!e || typeof e.name !== "string") continue;
    const g = (typeof e.group === "string" && e.group.trim()) || NO_GROUP;
    const l = out.find(o => o.g === g);
    if (l) l.n++; else out.push({ g, n: 1 });
  }
  return out;
}

/** A QR code as SVG, or "" when the text is too long for one. */
export function qrSvg(text, label) {
  if (String(text).length > QR_MAX) return "";
  const q = qrcode(0, "L");
  q.addData(String(text), "Byte");
  q.make();
  const n = q.getModuleCount(), quiet = 4, size = n + quiet * 2;
  let d = "";
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c + quiet} ${r + quiet}h1v1h-1z`;
  return `<svg class="pl-qr" role="img" aria-label="${esc(label)}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg"><rect width="${size}" height="${size}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
}

export function PlanLinkSendView(router) {
  let root = null;
  let chosen = null;          // list names ticked
  let notes = false, name = false;
  let link = "";
  let showQr = false;

  function mount(el) {
    root = el;
    if (!isPremium()) { router.navigate("progress", { replace: true }); return; }
    chosen = ownLists().map(l => l.g);
    notes = false; name = false; link = ""; showQr = false;
    render();
    root.querySelector(".share-title")?.focus();
  }

  async function makeLink() {
    const by = name ? String(store.get("name") || "").trim() : "";
    const plan = outFromOwn(store.get("prescribedExercises") || [], { groups: chosen, notes: notes && healthAllowed(), by });
    link = plan ? linkFor(EDIT_PAGE, await encodePlan(plan)) : "";
    return link;
  }

  function render(focusSel) {
    if (!root) return;
    const lists = ownLists();
    const back = `<button class="btn btn-ghost pr-back plan-back" id="pl-back" aria-label="Back to Share your plan">‹ Back</button>`;
    if (!lists.length) {
      root.innerHTML = `<div class="view share-view is-plan">${back}
        <h1 class="share-title" tabindex="-1">Send a link to change</h1>
        <p class="sp-empty">There’s nothing in My exercises yet. Add your exercises first, then send them.</p>
        <div class="sp-acts"><button class="btn btn-secondary btn-large btn-full" data-go="prescribed">My exercises</button></div></div>`;
      wire(); return;
    }
    const health = healthAllowed();
    const none = !chosen.length;
    const qr = showQr && link ? qrSvg(link, "QR code for the link to your exercises") : "";
    root.innerHTML = `<div class="view share-view is-plan">${back}
      <h1 class="share-title" tabindex="-1">Send a link to change</h1>
      <p class="pr-range">Your physio or trainer opens it in any browser and changes your exercises. They send a link back, and you choose what to keep.</p>
      <fieldset class="sh-group sh-parts"><legend class="sh-legend">Which lists</legend>
        ${lists.map((l, i) => `<label class="sh-part"><input type="checkbox" id="pl-g-${i}" data-list="${esc(l.g)}"${chosen.includes(l.g) ? " checked" : ""}>
          <span>${esc(l.g)}<span class="sh-part__hint">${l.n} ${l.n === 1 ? "exercise" : "exercises"}</span></span></label>`).join("")}
      </fieldset>
      <fieldset class="sh-group sh-parts"><legend class="sh-legend">Also</legend>
        <label class="sh-part"><input type="checkbox" id="pl-notes" data-also="notes"${notes && health ? " checked" : ""}${health ? "" : " disabled"}>
          <span>Your notes<span class="sh-part__hint">${esc(health ? "They can be about an injury. Off unless you choose." : "Only if you’ve said the app can keep health answers (Settings › Your data).")}</span></span></label>
        <label class="sh-part"><input type="checkbox" id="pl-name" data-also="name"${name ? " checked" : ""}>
          <span>Your first name<span class="sh-part__hint">So they know whose it is.</span></span></label>
      </fieldset>
      ${none ? `<p class="sp-left" id="pl-none">Tick at least one list to send.</p>` : ""}
      <div class="sp-acts">
        <button class="btn btn-primary btn-large btn-full" id="pl-share"${none ? " disabled" : ""}>Share the link…</button>
        <button class="btn btn-secondary btn-large btn-full" id="pl-copy"${none ? " disabled" : ""}>Copy link</button>
        <button class="btn btn-secondary btn-large btn-full" id="pl-qr"${none ? " disabled" : ""} aria-expanded="${showQr ? "true" : "false"}" aria-controls="pl-qr-box">${showQr ? "Hide the QR code" : "Show a QR code"}</button>
      </div>
      <p class="sh-status" id="pl-status" role="status" aria-live="polite"></p>
      <div id="pl-qr-box"${showQr ? "" : " hidden"}>${showQr ? (qr
        ? `<p class="pl-qr-line">For them to scan in the clinic.</p><div class="pl-qr-wrap">${qr}</div>`
        : `<p class="sp-left">Too long for a QR code. Share the link instead.</p>`) : ""}</div>
      <p class="sh-private"><svg aria-hidden="true" focusable="false" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V8a4 4 0 0 1 8 0v3"></path></svg><span>Nothing is sent to us. Everything is in the link, so anyone you give it to can read it.</span></p>
    </div>`;
    wire();
    if (focusSel) root.querySelector(focusSel)?.focus();
  }

  function say(msg) {
    const s = root?.querySelector("#pl-status");
    if (!s) return;
    s.textContent = "";
    setTimeout(() => { if (s) s.textContent = msg; }, 30);
  }

  async function share() {
    const url = await makeLink();
    if (!url) { say("This list could not be made into a link. Check each exercise has a name."); return; }
    if (navigator.share) {
      try { await navigator.share({ title: "My exercises", text: "My exercises from Alongside: Move. Open the link to change them, then press Send back.", url }); say("Shared."); return; }
      catch (e) { if (e && e.name === "AbortError") return; }
    }
    await copy(url);
  }

  async function copy(pre) {
    const url = pre || await makeLink();
    if (!url) { say("This list could not be made into a link. Check each exercise has a name."); return; }
    try { await navigator.clipboard.writeText(url); say("Link copied. Paste it in a message or an email."); }
    catch { say("Copying is not allowed here. Show a QR code, or Share the link instead."); }
  }

  function wire() {
    const q = s => root.querySelector(s);
    q("#pl-back")?.addEventListener("click", () => router.navigate("plan-share"));
    root.querySelectorAll("[data-go]").forEach(b => b.addEventListener("click", () => router.navigate(b.dataset.go)));
    q("#pl-share")?.addEventListener("click", share);
    q("#pl-copy")?.addEventListener("click", () => copy());
    q("#pl-qr")?.addEventListener("click", async () => {
      showQr = !showQr;
      if (showQr) await makeLink();
      render("#pl-qr");
      say(showQr ? (link.length > QR_MAX ? "Too long for a QR code. Share the link instead." : "The QR code is showing, under the buttons.") : "QR code hidden.");
    });
    root.querySelectorAll("[data-list]").forEach((cb, i) => cb.addEventListener("change", async () => {
      const g = cb.dataset.list;
      chosen = cb.checked ? [...chosen, g] : chosen.filter(x => x !== g);
      chosen = ownLists().map(l => l.g).filter(x => chosen.includes(x));
      if (showQr) await makeLink();
      render(`#pl-g-${i}`);
      say(`${g}: ${cb.checked ? "in" : "out"}.`);
    }));
    root.querySelectorAll("[data-also]").forEach(cb => cb.addEventListener("change", async () => {
      if (cb.dataset.also === "notes") notes = cb.checked; else name = cb.checked;
      if (showQr) await makeLink();
      render(`#pl-${cb.dataset.also}`);
      say(`${cb.dataset.also === "notes" ? "Your notes" : "Your first name"}: ${cb.checked ? "in" : "out"}.`);
    }));
  }

  function onUnmount() { root = null; }

  return { mount, onUnmount };
}
