/**
 * views/plan-link-send.js
 * 24 Nov 2026 v4
 *
 * v4 - SHARE-NOW (Graeme, 24 Nov, on his phone: "The link does copy and I
 *   can't share"). The link was made after the tap (compressing it takes a
 *   moment), so by the time Share was asked for, the phone no longer counted
 *   it as the tap and refused; the code then copied the link without saying
 *   why. Now the link is made as soon as the screen opens and again on each
 *   choice, so Share and Copy use it at once, inside the tap. If Share still
 *   won't open, it copies and says so; if copying won't either, the link is
 *   shown, selected, to copy by hand.
 *
 * v3 - P-45 THE LIVE LINK. When the relay is set up (relay-config.js):
 *   Send their changes straight to this phone (off to start). The first
 *   link made opens a live link on the relay; its key goes after the # with
 *   the plan, never to a server. Your live links: each one sent, with Stop.
 *   If it can't be opened, said, and the link works the usual way. With the
 *   relay not set up, this screen is as v2.
 *
 * v2 - P-44 S5. Guide markers send-share and send-copy.
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
import { RELAY } from "../data/relay-config.js";
import { relayClient, newLiveLink, ownerHash, liveFragment } from "../data/live-link.js";
import { stopLive } from "../data/live-check.js";

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

export function PlanLinkSendView(router, { client = relayClient(RELAY) } = {}) {
  let root = null;
  let chosen = null;          // list names ticked
  let notes = false, name = false;
  let link = "";
  let showQr = false;
  let live = false;           // P-45: send their changes straight to this phone
  let liveLink = null;        // the one opened on this visit, reused
  let liveNote = "";
  let showLink = false;       // v4: neither Share nor Copy worked: the link, to copy by hand
  let redraw = false;         // a live link was just opened, or couldn't be

  function mount(el) {
    root = el;
    if (!isPremium()) { router.navigate("progress", { replace: true }); return; }
    chosen = ownLists().map(l => l.g);
    notes = false; name = false; link = ""; showQr = false; live = false; liveLink = null; liveNote = ""; showLink = false;
    render();
    root.querySelector(".share-title")?.focus();
    makeLink();   // v4: ready before any tap
  }

  async function makeLink() {
    const by = name ? String(store.get("name") || "").trim() : "";
    const plan = outFromOwn(store.get("prescribedExercises") || [], { groups: chosen, notes: notes && healthAllowed(), by });
    if (!plan) { link = ""; return link; }
    let code;
    try { code = await encodePlan(plan); } catch { link = ""; return link; }   // v4: a phone that can't compress: say so on the tap, never throw
    if (live && client.on) {
      if (!liveLink) {
        redraw = true;
        const made = newLiveLink();
        let opened = false;
        try { opened = await client.open(made.id, await ownerHash(made.owner)); } catch { opened = false; }
        if (opened) liveLink = { ...made, openedAt: new Date().toISOString(), after: 0, lists: [] };
        else { live = false; liveNote = "The live link couldn\u2019t be set up just now, so this link works the usual way: they send a link back."; }
      }
      if (liveLink) {
        liveLink = { ...liveLink, lists: [...chosen] };
        store.saveLiveLink(liveLink);
        code += "&" + liveFragment(liveLink);
      }
    }
    link = linkFor(EDIT_PAGE, code);
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
        ${client.on ? `<label class="sh-part"><input type="checkbox" id="pl-live" data-also="live"${live ? " checked" : ""}>
          <span>Send their changes straight to this phone<span class="sh-part__hint">Locked so only this phone can read them. You still choose what to keep. Ends after 90 days, or when you stop it.</span></span></label>` : ""}
      </fieldset>
      ${liveNote ? `<p class="sp-left" id="pl-live-note">${esc(liveNote)}</p>` : ""}
      ${none ? `<p class="sp-left" id="pl-none">Tick at least one list to send.</p>` : ""}
      <div class="sp-acts">
        <button class="btn btn-primary btn-large btn-full" id="pl-share" data-guide-target="send-share"${none ? " disabled" : ""}>Share the link…</button>
        <button class="btn btn-secondary btn-large btn-full" id="pl-copy" data-guide-target="send-copy"${none ? " disabled" : ""}>Copy link</button>
        <button class="btn btn-secondary btn-large btn-full" id="pl-qr"${none ? " disabled" : ""} aria-expanded="${showQr ? "true" : "false"}" aria-controls="pl-qr-box">${showQr ? "Hide the QR code" : "Show a QR code"}</button>
      </div>
      <p class="sh-status" id="pl-status" role="status" aria-live="polite"></p>
      ${showLink && link ? `<div class="sh-group"><label class="sh-legend" for="pl-link">The link, to copy</label>
        <textarea class="yw-input" id="pl-link" rows="4" readonly>${esc(link)}</textarea></div>` : ""}
      <div id="pl-qr-box"${showQr ? "" : " hidden"}>${showQr ? (qr
        ? `<p class="pl-qr-line">For them to scan in the clinic.</p><div class="pl-qr-wrap">${qr}</div>`
        : `<p class="sp-left">Too long for a QR code. Share the link instead.</p>`) : ""}</div>
      <p class="sh-private"><svg aria-hidden="true" focusable="false" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V8a4 4 0 0 1 8 0v3"></path></svg><span>${live && client.on ? "Your exercises are in the link, so anyone you give it to can read them. Their changes come back through our relay, locked so only this phone can read them: we can\u2019t." : "Nothing is sent to us. Everything is in the link, so anyone you give it to can read it."}</span></p>
      ${liveList()}
    </div>`;
    wire();
    if (focusSel) root.querySelector(focusSel)?.focus();
  }

  /** P-45. The live links this phone has open, each with Stop. */
  function liveList() {
    const open = client.on ? store.get("liveLinks") || [] : [];
    if (!open.length) return "";
    const day = iso => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long" });
    return `<section class="sh-group pl-live" aria-labelledby="pl-live-h"><h2 class="sh-legend" id="pl-live-h">Your live links</h2>
      <ul class="pl-live__list">${open.map(l => `<li><span>Sent ${esc(day(l.openedAt))}${l.lists.length ? `: ${esc(l.lists.join(", "))}` : ""}. Ends ${esc(day(new Date(Date.parse(l.openedAt) + 90 * 864e5).toISOString()))}.</span>
        <button class="btn btn-secondary" data-stop="${esc(l.id)}">Stop this live link</button></li>`).join("")}</ul></section>`;
  }

  function say(msg) {
    const s = root?.querySelector("#pl-status");
    if (!s) return;
    s.textContent = "";
    setTimeout(() => { if (s) s.textContent = msg; }, 30);
  }

  /** After a live link was opened (or refused), draw again: Your live links, or the note. */
  function redrawIf(sel) { if (redraw) { redraw = false; render(sel); } }

  const SHARE_TEXT = "My exercises from Alongside: Move. Open the link to change them, then press Send back.";
  const NO_LINK = "This list could not be made into a link. Check each exercise has a name.";

  /** v4: Share at once, inside the tap, with the link already made. */
  function share() {
    if (!link) { makeLink().then(u => { redrawIf("#pl-share"); u ? shareNow(u) : say(NO_LINK); }); return; }
    shareNow(link);
  }
  function shareNow(url) {
    if (!navigator.share) { copyNow(url, "This phone can\u2019t share from here, so the link is copied instead. Paste it in a message or an email."); return; }
    navigator.share({ title: "My exercises", text: SHARE_TEXT, url }).then(
      () => say("Shared."),
      e => { if (e && e.name === "AbortError") return; copyNow(url, "Sharing didn\u2019t open here, so the link is copied instead. Paste it in a message or an email."); });
  }

  /** v4: Copy at once, inside the tap. */
  function copy() {
    if (!link) { makeLink().then(u => { redrawIf("#pl-copy"); u ? copyNow(u) : say(NO_LINK); }); return; }
    copyNow(link);
  }
  function copyNow(url, done = "Link copied. Paste it in a message or an email.") {
    const fail = () => { showLink = true; render("#pl-link"); root?.querySelector("#pl-link")?.select(); say("This phone won\u2019t copy from here. The link is below, selected: copy it from your phone\u2019s menu, or show a QR code."); };
    try { navigator.clipboard.writeText(url).then(() => say(done), fail); }
    catch { fail(); }
  }

  function wire() {
    const q = s => root.querySelector(s);
    root.querySelectorAll("[data-stop]").forEach(b => b.addEventListener("click", async () => {
      await stopLive(b.dataset.stop, { client });
      if (liveLink && liveLink.id === b.dataset.stop) { liveLink = null; live = false; link = ""; }
      render("h1");
      say("Live link stopped. They can still open the link, but changes no longer come straight to this phone.");
    }));
    q("#pl-back")?.addEventListener("click", () => router.navigate("plan-share"));
    root.querySelectorAll("[data-go]").forEach(b => b.addEventListener("click", () => router.navigate(b.dataset.go)));
    q("#pl-share")?.addEventListener("click", share);
    q("#pl-copy")?.addEventListener("click", copy);
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
      if (liveLink) { liveLink = { ...liveLink, lists: [...chosen] }; store.saveLiveLink(liveLink); }
      showLink = false;
      await makeLink();   // v4: ready for the next tap
      render(`#pl-g-${i}`);
      say(`${g}: ${cb.checked ? "in" : "out"}.`);
    }));
    root.querySelectorAll("[data-also]").forEach(cb => cb.addEventListener("change", async () => {
      if (cb.dataset.also === "notes") notes = cb.checked; else if (cb.dataset.also === "live") { live = cb.checked; liveNote = ""; } else name = cb.checked;
      showLink = false;
      await makeLink();   // v4: ready for the next tap (ticking Straight to this phone opens the live link now)
      redraw = false;
      render(`#pl-${cb.dataset.also}`);
      say(`${({ notes: "Your notes", name: "Your first name", live: "Straight to this phone" })[cb.dataset.also]}: ${cb.checked ? "on" : "off"}.`);
    }));
  }

  function onUnmount() { root = null; }

  return { mount, onUnmount };
}
