/**
 * views/plan-share.js
 * 24 Nov 2026 v4
 *
 * v4 - P-46 S6 WORDS. Fewer words before the first button (spec §7: about
 *   15). The meaning kept; anything about safety unchanged.
 *
 * 24 Nov 2026 v3
 *
 * v3 - P-44 S5. Guide marker send-link on Send a link to change.
 *
 * v2 - P-44 PHYSIO LINK S2. Under the three ways to share, Or let them
 *   change it: Send a link to change (views/plan-link-send.js).
 *
 * P-33 PLAN-SHARE (Graeme, 15 Nov: mock-up v2, "That looks better"; a PDF
 * made on the phone, "Yes"; spec docs/specs/alongside_share-your-plan_15nov2026_v1.md).
 * Reached from Progress › Share your plan. The Plan only: Free is sent to
 * Progress, as Build a session and Change today send Free away.
 *
 * One screen: a line saying who it is for, then Share… (the PDF, to the
 * phone's share sheet), Save as a file (the PDF) and Copy as text (written
 * the way Add a plan you already have reads it, so changes come back in),
 * then Change what's in it (the choices live on this screen only), and the
 * preview: the page as it will be shared. The actions come before the
 * preview so they are never a long scroll away (A-4: nothing long above
 * the first action), a change from mock-up v2, where the preview came first.
 *
 * WCAG 2.2 AA: one h1 that takes focus; the choices are real checkboxes
 * in a fieldset; the preview is a real article with headings and tables;
 * every result is said in a status line; nothing relies on colour.
 */

import { store } from "../store.js";
import { isPremium } from "../auth.js";
import { healthAllowed } from "../data/health-consent.js";
import { PARTS, DEFAULTS, NEVER, planModel, planBlocks, planHtml, planText, makePlanPdf, planFileName, isEmpty } from "../data/plan-share.js";

const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function PlanShareView(router) {
  let root = null;
  let include = { ...DEFAULTS };
  let open = false;
  let copyBox = false;

  function mount(el) {
    root = el;
    if (!isPremium()) { router.navigate("progress", { replace: true }); return; }
    include = { ...DEFAULTS }; open = false; copyBox = false;
    render();
    root.querySelector(".share-title")?.focus();
  }

  /** What is missing, in one line, or "". */
  function missingLine(m) {
    const gone = [!m.has.arc && "no arc", !m.has.week && "no week", !m.has.lists && "no lists in My exercises"].filter(Boolean);
    if (!gone.length) return "";
    const list = gone.length === 1 ? gone[0] : `${gone.slice(0, -1).join(", ")} and ${gone[gone.length - 1]}`;
    return `There’s ${list} yet, so ${gone.length === 1 ? "it isn’t" : "they aren’t"} in the page. Set ${gone.length === 1 ? "it" : "them"} up and ${gone.length === 1 ? "it’ll" : "they’ll"} be in it next time.`;
  }

  function render(focusSel) {
    if (!root) return;
    const m = planModel(include);
    const empty = isEmpty(planModel(DEFAULTS));
    const health = healthAllowed();
    const back = `<button class="btn btn-ghost pr-back plan-back" id="sp-back" aria-label="Back to Progress">‹ Back</button>`;
    if (empty) {
      root.innerHTML = `<div class="view share-view is-plan">${back}
        <h1 class="share-title" tabindex="-1">Share your plan</h1>
        <p class="sp-empty">Nothing to share yet. Your arc, week and lists go in it.</p>
        <div class="sp-acts">
          <button class="btn btn-secondary btn-large btn-full" data-go="your-week">Set up your week</button>
          <button class="btn btn-secondary btn-large btn-full" data-go="prescribed">My exercises</button>
        </div></div>`;
      wire(); return;
    }
    const gap = missingLine(m);
    root.innerHTML = `<div class="view share-view is-plan">${back}
      <h1 class="share-title" tabindex="-1">Share your plan</h1>
      <p class="pr-range">For a physio or trainer to look over. Their changes can come back in.</p>
      ${gap ? `<p class="sp-left" id="sp-gap">${esc(gap)}</p>` : ""}
      <div class="sp-acts">
        <button class="btn btn-primary btn-large btn-full" id="sp-share">Share\u2026</button>
        <button class="btn btn-secondary btn-large btn-full" id="sp-save">Save as a file</button>
        <button class="btn btn-secondary btn-large btn-full" id="sp-copy">Copy as text</button>
      </div>
      ${m.has.lists ? `<p class="sp-link-line">Or let them change it, and send it back for you to choose what to keep.</p>
      <div class="sp-acts"><button class="btn btn-secondary btn-large btn-full" data-go="plan-link-send" data-guide-target="send-link">Send a link to change</button></div>` : ""}
      ${copyBox ? `<label class="sh-legend" for="sp-text">The text, to copy</label><textarea class="sp-textarea" id="sp-text" rows="10" readonly>${esc(planText(m))}</textarea>` : ""}
      <p class="sh-status" id="sp-status" role="status" aria-live="polite"></p>
      <details class="sp-more" id="sp-more"${open ? " open" : ""}><summary>Change what\u2019s in it</summary>
        <fieldset class="sh-group sh-parts"><legend class="sr-only">What goes in it</legend>
          ${PARTS.map(p => {
            const blocked = p.health && !health;
            return `<label class="sh-part"><input type="checkbox" id="sp-p-${p.id}" data-part="${p.id}"${include[p.id] && !blocked ? " checked" : ""}${blocked ? " disabled" : ""}>
              <span>${esc(p.label)}${p.hint || blocked ? `<span class="sh-part__hint">${esc(blocked ? "Only if you\u2019ve said the app can keep health answers (Settings \u203a Your data)." : p.hint)}</span>` : ""}</span></label>`;
          }).join("")}
        </fieldset>
      </details>
      <p class="sh-private"><svg aria-hidden="true" focusable="false" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V8a4 4 0 0 1 8 0v3"></path></svg><span>${esc(NEVER)}</span></p>
      <section class="sh-preview" aria-labelledby="sp-preview-h"><h2 class="sh-legend" id="sp-preview-h">Preview</h2>
        ${planHtml(planBlocks(m))}
      </section>
    </div>`;
    wire();
    if (focusSel) root.querySelector(focusSel)?.focus();
  }

  function say(msg) {
    const s = root?.querySelector("#sp-status");
    if (!s) return;
    s.textContent = "";
    setTimeout(() => { if (s) s.textContent = msg; }, 30);
  }

  const pdfBlob = () => new Blob([makePlanPdf(planModel(include))], { type: "application/pdf" });

  function saveBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name; a.rel = "noopener";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    say(`Saved as ${name}.`);
  }

  async function share() {
    const name = planFileName("pdf");
    let blob;
    try { blob = pdfBlob(); } catch { say("The file could not be made on this phone. Copy as text still works."); return; }
    const file = typeof File === "function" ? new File([blob], name, { type: "application/pdf" }) : null;
    if (file && navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
      try { await navigator.share({ files: [file], title: "My plan" }); say("Shared."); }
      catch (e) { if (e && e.name !== "AbortError") say("Sharing did not work here. Save as a file instead."); }
      return;
    }
    say("This phone cannot share a file from here. Save as a file, then share it from your files.");
  }

  async function copy() {
    const text = planText(planModel(include));
    try {
      await navigator.clipboard.writeText(text);
      say("Copied. Paste it in a message or an email.");
    } catch {
      copyBox = true; render();
      const area = root.querySelector("#sp-text");
      area?.focus(); area?.select();
      say("Copying is not allowed here, so the text is shown and selected. Copy it from your phone’s menu.");
    }
  }

  function wire() {
    const q = s => root.querySelector(s);
    q("#sp-back")?.addEventListener("click", () => router.navigate("progress"));
    root.querySelectorAll("[data-go]").forEach(b => b.addEventListener("click", () => router.navigate(b.dataset.go)));
    q("#sp-share")?.addEventListener("click", share);
    q("#sp-save")?.addEventListener("click", () => { try { saveBlob(pdfBlob(), planFileName("pdf")); } catch { say("The file could not be made on this phone. Copy as text still works."); } });
    q("#sp-copy")?.addEventListener("click", copy);
    q("#sp-more")?.addEventListener("toggle", e => { open = e.target.open; });
    root.querySelectorAll("[data-part]").forEach(cb => cb.addEventListener("change", () => {
      include = { ...include, [cb.dataset.part]: cb.checked };
      open = true;
      render(`#sp-p-${cb.dataset.part}`);
      const part = PARTS.find(p => p.id === cb.dataset.part);
      say(`${part.label}: ${cb.checked ? "in" : "out"}. The preview shows it.`);
    }));
  }

  function onUnmount() { root = null; }

  return { mount, onUnmount };
}
