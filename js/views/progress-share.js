/**
 * views/progress-share.js
 * 06 Oct 2026 v1
 *
 * D-11 PROGRESS-SHARE. Share your progress (Graeme, 06 Oct: "Reporting or
 * sending progress to someone else. I need a nicely designed, attractive
 * report; marketing resource; social media post; modern certificate style -
 * branded ... Download today's report - what was done, where, how many.
 * Some people may want to report this to a dietician or AI or something.")
 * Mock-up approved 06 Oct with two changes (brand layering, real logos).
 *
 * One screen: which days (Today to 30, and 90 on the Plan), what to make
 * (a picture, a certificate, a report, text), what goes on it, a preview,
 * then the phone's own share sheet or a save. Everything is made on the
 * phone from data/progress-report.js; nothing is sent anywhere by the app.
 *
 * Never included, whatever is switched on: the journal, session and lift
 * notes, weight, calories (data/progress-report.js says why). Check-in
 * answers only when switched on and the health consent is given. The arc
 * only on the Plan, with an arc, when switched on. The name only when
 * switched on (on for a certificate, which is for someone).
 *
 * Opened from Progress (Share your progress: that window), and from Today
 * (Download today's report: the report; Copy as text: the text) through
 * setSharePreset().
 */
import { store } from "../store.js";
import { healthAllowed } from "../data/health-consent.js";
import { EXERCISES } from "../data/exercises/index.js";
import { aimById } from "../data/aims.js";
import { arcWeek } from "../data/arc-readback.js";
import { windowsFor, windowRange, buildReport, defaultsFor, PARTS, FORMATS, reportText, reportCsv,
         describeShare, setsText, minutesText, ABOUT_LINES } from "../data/progress-report.js";
import { drawPicture, drawCertificate, canvasBlob } from "../data/share-images.js";

let _preset = null;
/** Set by Progress before it opens this screen: { window, format }. Read once. */
export function setSharePreset(p) { _preset = p ? { ...p } : null; }

const FORMAT_INFO = {
  picture:     { title: "A picture",     sub: "For a post, a story or a message to friends" },
  certificate: { title: "A certificate", sub: "To keep, print or frame" },
  report:      { title: "A report",      sub: "A page for a trainer, a dietitian or a doctor" },
  text:        { title: "Text",          sub: "To paste into an email, your notes or an AI chat" },
};

const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function ProgressShareView(router) {
  let windowKey = "30";
  let format = "picture";
  let include = defaultsFor("picture");
  let textKind = "plain";
  let objectUrl = null;
  let drawToken = 0;
  let lastBlob = null;
  let container = null;

  const premium = () => store.get("tier") === "personal";
  const exerciseName = id => (EXERCISES.find(e => e.id === id) || {}).name || null;

  function arcInfo() {
    if (!premium()) return null;
    const arc = store.get("arc") || {};
    const aim = arc.active && arc.aimId ? aimById(arc.aimId) : null;
    return aim ? { week: arcWeek(arc), aim: aim.label } : null;
  }

  function model() {
    return buildReport({
      rangeKey: windowKey,
      completed: store.completedSessions(store.get("activityLog")),
      liftLog: store.get("liftLog") || {},
      checkinHistory: store.get("checkinHistory") || {},
      name: store.get("name") || "",
      include,
      healthOk: healthAllowed(),
      exerciseName,
    });
  }

  function mount(el) {
    container = el;
    const p = _preset; _preset = null;
    if (p && p.window && windowsFor(premium()).some(w => w.key === String(p.window))) windowKey = String(p.window);
    if (p && FORMATS.includes(p.format)) format = p.format;
    include = defaultsFor(format);
    render();
    container.querySelector(".share-title")?.focus();
  }

  function onUnmount() {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = null; lastBlob = null; drawToken++;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  function partsOffered() {
    return PARTS.filter(pt => {
      if (pt.id === "name") return !!String(store.get("name") || "").trim();
      if (pt.id === "checkins") return healthAllowed();
      return true;
    });
  }

  function render(focusId) {
    const m = model();
    const range = m.range;
    const arc = arcInfo();
    container.innerHTML = `
      <div class="view share-view">
        <button class="btn btn-ghost pr-back" id="sh-back" aria-label="Back to Progress">&larr; Progress</button>
        <h1 class="share-title" tabindex="-1">Share your progress</h1>
        <p class="pr-range">${esc(range.title)}</p>

        <fieldset class="sh-group">
          <legend class="sh-legend">Which days</legend>
          <div class="sh-chips">
            ${windowsFor(premium()).map(w => `
              <label class="sh-chip">
                <input type="radio" name="sh-window" value="${w.key}" id="sh-w-${w.key}" ${w.key === windowKey ? "checked" : ""}>
                <span>${esc(w.label)}</span>
              </label>`).join("")}
          </div>
        </fieldset>

        <fieldset class="sh-group">
          <legend class="sh-legend">What would you like to make?</legend>
          <div class="sh-cards">
            ${FORMATS.map(f => `
              <label class="sh-card">
                <input type="radio" name="sh-format" value="${f}" id="sh-f-${f}" ${f === format ? "checked" : ""}>
                <span class="sh-card__text">
                  <span class="sh-card__title">${FORMAT_INFO[f].title}</span>
                  <span class="sh-card__sub">${FORMAT_INFO[f].sub}</span>
                </span>
              </label>`).join("")}
          </div>
        </fieldset>

        <fieldset class="sh-group sh-parts">
          <legend class="sh-legend">What goes on it</legend>
          ${partsOffered().map(pt => `
            <label class="sh-part">
              <input type="checkbox" id="sh-p-${pt.id}" data-part="${pt.id}" ${include[pt.id] ? "checked" : ""}>
              <span>${esc(pt.label)}${pt.hint ? `<span class="sh-part__hint">${esc(pt.hint)}</span>` : ""}</span>
            </label>`).join("")}
          ${arc && format === "certificate" ? `
            <label class="sh-part">
              <input type="checkbox" id="sh-p-arc" data-part="arc" ${include.arc ? "checked" : ""}>
              <span>Your arc<span class="sh-part__hint">Week ${esc(arc.week)}: ${esc(arc.aim)}</span></span>
            </label>` : ""}
        </fieldset>

        <p class="sh-private">
          <svg aria-hidden="true" focusable="false" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
          <span>Your journal, your notes and your weight are never included. Nothing leaves this phone until you choose where it goes.</span>
        </p>

        <section class="sh-preview" aria-labelledby="sh-preview-h">
          <h2 class="sh-legend" id="sh-preview-h">${format === "text" ? "What will be copied" : "Preview"}</h2>
          ${renderPreview(m, arc)}
        </section>
        <p class="sh-status" id="sh-status" role="status" aria-live="polite"></p>
      </div>`;
    wire();
    if (format === "picture" || format === "certificate") draw(m, arc);
    if (focusId) container.querySelector(`#${focusId}`)?.focus();
  }

  function renderPreview(m, arc) {
    const empty = !m.totals.sessions;
    if (format === "picture" || format === "certificate") {
      if (empty) return `<p class="sh-note">Nothing logged in these days yet, so there is nothing to put on ${format === "picture" ? "a picture" : "a certificate"}. Try more days.</p>`;
      return `
        <div class="sh-image-wrap sh-image-wrap--${format}">
          <img class="sh-image" id="sh-image" alt="${esc(describeShare(m, format))}" hidden>
          <p class="sh-note" id="sh-drawing">Making it…</p>
        </div>
        <div class="sh-actions">
          <button class="btn btn-primary btn-full" id="sh-share-file" disabled>Share…</button>
          <button class="btn btn-ghost btn-full" id="sh-save-file" disabled>Save to phone</button>
        </div>`;
    }
    if (format === "report") {
      return `
        ${reportDoc(m)}
        <div class="sh-actions">
          <button class="btn btn-primary btn-full" id="sh-print">Print or save as PDF</button>
          <button class="btn btn-ghost btn-full" id="sh-to-text">Copy as text instead</button>
        </div>`;
    }
    const text = textKind === "csv" ? reportCsv(m) : reportText(m);
    return `
      <div class="sh-chips" role="radiogroup" aria-label="Format">
        <label class="sh-chip"><input type="radio" name="sh-textkind" value="plain" id="sh-t-plain" ${textKind === "plain" ? "checked" : ""}><span>Plain text</span></label>
        <label class="sh-chip"><input type="radio" name="sh-textkind" value="csv" id="sh-t-csv" ${textKind === "csv" ? "checked" : ""}><span>Spreadsheet (CSV)</span></label>
      </div>
      <label class="sr-only" for="sh-text">The text to copy</label>
      <textarea class="sh-text" id="sh-text" readonly rows="14">${esc(text)}</textarea>
      <div class="sh-actions">
        <button class="btn btn-primary btn-full" id="sh-copy">Copy</button>
        <button class="btn btn-ghost btn-full" id="sh-share-text">Share…</button>
        <button class="btn btn-ghost btn-full" id="sh-save-text">Save as a file</button>
      </div>`;
  }

  /** The printable A4 report, as HTML: what, where, how many. */
  function reportDoc(m) {
    const one = m.range.days === 1;
    const byDay = [];
    for (const s of m.sessions) {
      const last = byDay[byDay.length - 1];
      if (last && last.day === s.day) last.items.push(s); else byDay.push({ day: s.day, date: s.date, items: [s] });
    }
    const places = [...new Set(m.sessions.map(s => s.place).filter(Boolean))];
    const tiles = [
      [String(m.totals.sessions), m.totals.sessions === 1 ? "session" : "sessions"],
      m.include.sessions && m.totals.mins ? [minutesText(m.totals.mins), "moving"] : null,
      m.include.moves && m.totals.sets ? [String(m.totals.sets), m.totals.sets === 1 ? "set logged" : "sets logged"] : null,
      !one ? [`${m.totals.days} of ${m.range.days}`, "days with a session"] : null,
      m.include.place && places.length ? [places.join(", "), "where"] : null,
    ].filter(Boolean);
    const madeAt = m.madeAt;
    return `
      <article class="sh-report" aria-label="Report preview">
        <header class="shr-head">
          <div>
            <p class="shr-eyebrow">Movement report</p>
            <h3 class="shr-title">${esc(one ? m.title : `${m.range.title} ${madeAt.getFullYear()}`)}</h3>
            ${m.name ? `<p class="shr-for">${esc(m.name)}</p>` : ""}
          </div>
          <div class="shr-brand">
            <img src="assets/images/brand/alongside-icon-deep.png" alt="" width="40" height="40">
            <img src="assets/images/brand/alongside-wordmark-dark.png" alt="Alongside" width="120" height="28">
          </div>
        </header>
        <dl class="shr-tiles">
          ${tiles.map(([v, l]) => `<div class="shr-tile"><dt>${esc(l)}</dt><dd>${esc(v)}</dd></div>`).join("")}
        </dl>
        ${m.kinds.length ? `<p class="shr-kinds">${m.kinds.map(k => `<span class="shr-kind"><span class="pr-dot pr-k--${k.colour || k.kind}" aria-hidden="true"></span>${esc(k.label)} ${k.count}</span>`).join("")}</p>` : ""}
        ${m.include.sessions ? byDay.map(d => `
          <section class="shr-day">
            ${one ? "" : `<h4 class="shr-day__h">${esc(d.date)}</h4>`}
            ${d.items.map(s => `
              <div class="shr-sess">
                <p class="shr-sess__head"><span class="pr-dot pr-k--${s.colour}" aria-hidden="true"></span><strong>${esc(s.time)} · ${esc(s.kind)}</strong>${[s.place, s.mins ? `${s.mins} minutes` : null].filter(Boolean).length ? `<span class="shr-sess__meta">${esc([s.place, s.mins ? `${s.mins} minutes` : null].filter(Boolean).join(" · "))}</span>` : ""}</p>
                ${s.moves.length ? `<table class="shr-moves"><thead><tr><th scope="col">Move</th><th scope="col">Sets</th></tr></thead><tbody>
                  ${s.moves.map(mv => `<tr><th scope="row">${esc(mv.name)}</th><td>${mv.sets.length ? esc(setsText(mv.sets)) : "No sets logged"}</td></tr>`).join("")}
                </tbody></table>` : ""}
                ${s.afterwards ? `<p class="shr-feel">Afterwards: ${esc(s.afterwards.toLowerCase())}</p>` : ""}
              </div>`).join("")}
          </section>`).join("") : ""}
        ${m.sessions.length ? "" : `<p class="shr-none">Nothing logged ${one ? "on this day" : "in these days"}.</p>`}
        ${m.checkins.length ? `
          <section class="shr-checkins">
            <h4 class="shr-day__h">Check-in answers <span class="shr-muted">(included by choice)</span></h4>
            <ul>${m.checkins.map(c => `<li>${esc(c.date)}: energy ${esc(String(c.energy || "not given").toLowerCase())}, mood ${esc(String(c.mood || "not given").toLowerCase())}, ${esc(c.sore)}</li>`).join("")}</ul>
          </section>` : ""}
        <footer class="shr-foot">
          <h4 class="shr-day__h">About this report</h4>
          <ul>${ABOUT_LINES.map(l => `<li>${esc(l)}</li>`).join("")}
            <li>Made on this phone on ${esc(madeAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }))} at ${esc(madeAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }))}. Build New Habits does not receive a copy.</li>
          </ul>
          <p class="shr-maker"><img src="assets/images/brand/bnh-mark-deep.png" alt="" width="28" height="25"> Build New Habits · buildnewhabits.co.uk</p>
        </footer>
      </article>`;
  }

  // ── Drawing ──────────────────────────────────────────────────────────────

  async function draw(m, arc) {
    if (!m.totals.sessions) return;
    const token = ++drawToken;
    try {
      const canvas = format === "picture" ? await drawPicture(m)
        : await drawCertificate(m, { arc: include.arc ? arc : null });
      const blob = await canvasBlob(canvas);
      if (token !== drawToken || !container) return;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = URL.createObjectURL(blob);
      lastBlob = blob;
      const img = container.querySelector("#sh-image");
      if (!img) return;
      img.src = objectUrl; img.hidden = false;
      container.querySelector("#sh-drawing")?.remove();
      container.querySelector("#sh-share-file")?.removeAttribute("disabled");
      container.querySelector("#sh-save-file")?.removeAttribute("disabled");
    } catch (e) {
      if (token !== drawToken || !container) return;
      const note = container.querySelector("#sh-drawing");
      if (note) note.textContent = "It could not be made on this phone. The report and text still work.";
    }
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  function say(msg) {
    const s = container.querySelector("#sh-status");
    if (!s) return;
    s.textContent = "";
    setTimeout(() => { s.textContent = msg; }, 30);
  }

  function fileName(ext) {
    const d = new Date();
    const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const what = windowKey === "today" ? "today" : `${windowKey}-days`;
    const kind = format === "certificate" ? "certificate" : format === "picture" ? "progress" : "report";
    return `alongside-${kind}-${what}-${day}.${ext}`;
  }

  function saveBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name; a.rel = "noopener";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    say(`Saved as ${name}.`);
  }

  async function shareFile() {
    if (!lastBlob) return;
    const name = fileName("png");
    const file = typeof File === "function" ? new File([lastBlob], name, { type: "image/png" }) : null;
    if (file && navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
      try { await navigator.share({ files: [file], title: "My progress" }); say("Shared."); }
      catch (e) { if (e && e.name !== "AbortError") say("Sharing did not work here. Save to phone instead."); }
      return;
    }
    say("This phone cannot share a picture from here. Save to phone, then share it from your photos or files.");
  }

  function currentText() {
    const m = model();
    return textKind === "csv" ? reportCsv(m) : reportText(m);
  }

  async function copyText() {
    const text = currentText();
    try {
      await navigator.clipboard.writeText(text);
      say("Copied. Paste it wherever you like.");
    } catch {
      const area = container.querySelector("#sh-text");
      area?.focus(); area?.select();
      say("Copying is not allowed here, so the text is selected. Copy it from your phone's menu.");
    }
  }

  async function shareText() {
    const text = currentText();
    if (navigator.share) {
      try { await navigator.share({ title: "My progress", text }); say("Shared."); }
      catch (e) { if (e && e.name !== "AbortError") say("Sharing did not work here. Copy it instead."); }
      return;
    }
    say("This phone cannot share text from here. Copy it instead.");
  }

  function wire() {
    const q = s => container.querySelector(s);
    q("#sh-back")?.addEventListener("click", () => router.navigate("progress"));
    container.querySelectorAll('input[name="sh-window"]').forEach(r => r.addEventListener("change", () => {
      windowKey = r.value; render(r.id);
    }));
    container.querySelectorAll('input[name="sh-format"]').forEach(r => r.addEventListener("change", () => {
      format = r.value; include = defaultsFor(format); render(r.id);
    }));
    container.querySelectorAll("[data-part]").forEach(cb => cb.addEventListener("change", () => {
      include = { ...include, [cb.dataset.part]: cb.checked }; render(cb.id);
    }));
    container.querySelectorAll('input[name="sh-textkind"]').forEach(r => r.addEventListener("change", () => {
      textKind = r.value; render(r.id);
    }));
    q("#sh-share-file")?.addEventListener("click", shareFile);
    q("#sh-save-file")?.addEventListener("click", () => lastBlob && saveBlob(lastBlob, fileName("png")));
    q("#sh-print")?.addEventListener("click", () => { say("Choose Save as PDF in the print options to keep a copy."); window.print(); });
    q("#sh-to-text")?.addEventListener("click", () => { format = "text"; include = { ...include }; render("sh-f-text"); });
    q("#sh-copy")?.addEventListener("click", copyText);
    q("#sh-share-text")?.addEventListener("click", shareText);
    q("#sh-save-text")?.addEventListener("click", () => {
      const csv = textKind === "csv";
      saveBlob(new Blob([currentText()], { type: csv ? "text/csv" : "text/plain" }), fileName(csv ? "csv" : "txt"));
    });
  }

  return { mount, onUnmount };
}
