/**
 * views/plan-finish.js
 * 29 Oct 2026 v1
 *
 * STAGE PATH Session 6 (P-6 FINISH; blueprint D5, mock-up v10). The Plan's
 * finish, after any session the Plan's player plays (workout.js routes here
 * on the Plan; Free keeps reflect.js exactly as it is).
 *
 * As mock-up v10 (Graeme, 29 Oct: "Yep. I like v10"):
 *   - That's today done (or, part-way, Saved what you did);
 *   - How do you feel now? on the check-in's own five words, with this
 *     morning's said beside it (health consent, as every mood answer);
 *   - Any you loved, or want less of? Loved it, or Less often with Not
 *     again, for each movement done (likedMovements, exercisePreferences:
 *     the same records Skip and Settings use);
 *   - Keep to repeat (the existing save, now kept with its door and place).
 * Kept from the old finish at Graeme's choice (29 Oct, all four): the pain
 * check when something is sore today (Worse says the safety line); the
 * occasional reflection prompt (the same cadence, reflect.js's own); Your
 * arc today; Add a note. And always, as every session view must (SHARED-1):
 * the session moments (first session, pacing, baseline questions).
 *
 * Nothing here is required; Done saves only what was said. Never a count,
 * a streak or a score.
 */
import { store } from "../store.js";
import { isPremium } from "../auth.js";
import { lineIcon } from "../data/line-icons.js";
import { healthAllowed } from "../data/health-consent.js";
import { getTodaysCheckin } from "../data/checkin.js";
import { areaWords } from "../data/conditions.js";
import { movementName } from "../data/path-engine.js";
import { renderSaveBlock, attachSaveBlock } from "../save-block.js";
import { renderSessionMoments, attachSessionMoments, resetSessionMoments } from "../data/session-moments.js";
import { PAIN_OPTIONS, buildSummary, arcTodayLine, getSessionCount, getEmpathyPromptForSession,
         fireEmpathyPrompt, skipEmpathyPrompt, useAnswersForEmpathy } from "./reflect.js";

/** The check-in's own words and values (checkin.js), so before and after compare directly (C4). */
export const MOODS = Object.freeze([["Struggling", 2], ["Low", 3], ["Okay", 6], ["Pretty good", 7], ["Great", 9]]);
const wordFor = v => { if (typeof v !== "number") return null; const near = MOODS.reduce((a, b) => Math.abs(b[1] - v) < Math.abs(a[1] - v) ? b : a); return near[0].toLowerCase(); };
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export function PlanFinishView(router) {
  let root = null;
  let entry = null;
  let mood = null, pain = null, note = "";
  let fb = {};          // id -> { like, less, never }
  let empathy = null;   // { text } when the prompt is due

  function mount(container) {
    root = container;
    entry = store.get("currentActivityEntry") || null;
    if (!isPremium() || !entry) { router.navigate(isPremium() ? "today" : "reflect", { replace: true }); return; }
    mood = null; pain = null; note = ""; empathy = null;
    fb = Object.fromEntries(ids().map(id => [id, { like: false, less: false, never: false }]));
    resetSessionMoments();
    paint();
    root.querySelector("h1")?.focus();
  }

  const ids = () => [...new Set((entry?.exerciseIds || []).filter(Boolean))];
  const soreAreas = () => Object.entries(store.get("conditionPainScores") || {}).filter(([, v]) => Number(v) > 0).map(([id]) => id);

  function radios(name, legend, items, cur, extra = "") {
    return `<fieldset class="path-seg"><legend>${esc(legend)}</legend>${extra}<div class="path-seg__opts">${items.map(([t, v]) =>
      `<label><input type="radio" name="${name}" value="${esc(v)}"${String(cur) === String(v) ? " checked" : ""}><span>${esc(t)}</span></label>`).join("")}</div></fieldset>`;
  }

  function paint() {
    if (!root) return;
    if (empathy) {
      root.innerHTML = `
        <div class="view plan-finish">
          <h1 class="sr-only" tabindex="-1">A thought before you go</h1>
          <div class="card card-coach reflect-coach-card" role="group" aria-labelledby="pf-empathy">
            <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
            <p class="coach-message-text" id="pf-empathy">${empathy.text}</p>
          </div>
          <button type="button" class="btn btn-primary btn-large btn-full" id="pf-empathy-go">Continue</button>
          <button type="button" class="btn btn-ghost btn-full" id="pf-empathy-skip" aria-label="Not today, skip this prompt">Not today</button>
        </div>`;
      wire(); return;
    }
    const partial = entry.status === "partial";
    const before = Number(getTodaysCheckin()?.mood);
    const beforeWord = Number.isFinite(before) && store.checkedInToday() ? wordFor(before) : null;
    const sore = soreAreas();
    const painQ = sore.length === 1 ? `How’s your ${areaWords(sore[0])} now?` : "Any pain or discomfort now?";
    const line = pain ? buildSummary(entry, null, pain, mood) : "";
    const list = ids();
    const keep = renderSaveBlock();
    root.innerHTML = `
      <div class="view plan-finish">
        <div class="finish-head">
          <span class="kind-tile kind-tile--lg k-teal">${lineIcon(partial ? "pencil" : "tick", 28)}</span>
          <h1 tabindex="-1">${partial ? "Saved what you did." : "That’s today done."}</h1>
        </div>
        ${arcTodayLine()}
        ${renderSessionMoments({ exerciseIds: list })}
        ${healthAllowed() ? radios("pf-mood", "How do you feel now?", MOODS, mood,
            beforeWord ? `<p class="path-small" id="pf-before">This morning you said ${esc(beforeWord)}.</p>` : "") : ""}
        ${sore.length ? radios("pf-pain", painQ, PAIN_OPTIONS.map(o => [o.l, o.v]), pain) : ""}
        <p class="path-coachline" id="pf-line" role="status" aria-live="polite">${esc(line)}</p>
        ${list.length ? `
          <h2 class="look-label" id="pf-fb-h">Any you loved, or want less of?</h2>
          <ul class="pf-fb" aria-labelledby="pf-fb-h">${list.map((id, j) => {
            const f = fb[id];
            return `<li class="pf-fb__row" data-id="${esc(id)}">
              <span class="pf-fb__nm" id="pf-mv-${j}">${esc(movementName(id) || id)}</span>
              <span class="pf-fb__btns">
                <button type="button" class="pf-tog" data-act="like" aria-pressed="${f.like}" aria-describedby="pf-mv-${j}">${lineIcon("heart", 18)}Loved it</button>
                <button type="button" class="pf-tog" data-act="less" aria-pressed="${f.less}" aria-describedby="pf-mv-${j}">${lineIcon("less", 18)}Less often</button>
              </span>
              ${f.less ? radios(`pf-lo-${j}`, `How much less of ${movementName(id) || "it"}?`, [["Less often", "less"], ["Not again", "never"]], f.never ? "never" : "less") : ""}
            </li>`; }).join("")}</ul>
          <p class="path-small">Nothing here is required. Less often and Not again can be undone in Settings, How you like things.</p>` : ""}
        ${keep ? `<details class="finish-more finish-keep"><summary class="finish-more__summary">Keep to repeat</summary>${keep}</details>` : ""}
        ${healthAllowed() ? `<details class="finish-more"${note ? " open" : ""}><summary class="finish-more__summary">Add a note</summary>
          <label class="sr-only" for="pf-note">A note about this session</label>
          <textarea id="pf-note" class="reflect-textarea" rows="3">${esc(note)}</textarea></details>` : ""}
        <button type="button" class="btn btn-primary btn-large btn-full" id="pf-done">Done</button>
      </div>`;
    wire();
  }

  function repaint(focusSel) {
    const n = root.querySelector("#pf-note"); if (n) note = n.value;
    paint();
    if (focusSel) root.querySelector(focusSel)?.focus();
  }

  function wire() {
    attachSaveBlock(root);
    attachSessionMoments(root, () => repaint());
    root.querySelectorAll('input[name="pf-mood"]').forEach(r => r.addEventListener("change", () => { mood = Number(r.value); }));
    root.querySelectorAll('input[name="pf-pain"]').forEach(r => r.addEventListener("change", () => {
      pain = r.value;
      const el = root.querySelector("#pf-line"); if (el) el.textContent = buildSummary(entry, null, pain, mood);
    }));
    root.querySelectorAll(".pf-fb__row").forEach((li, j) => {
      const id = li.dataset.id, f = fb[id];
      li.querySelectorAll(".pf-tog").forEach(b => b.addEventListener("click", () => {
        const on = b.getAttribute("aria-pressed") !== "true";
        if (b.dataset.act === "like") { f.like = on; if (on) { f.less = false; f.never = false; } }
        else { f.less = on; if (on) f.like = false; else f.never = false; }
        repaint(`.pf-fb__row[data-id="${CSS.escape(id)}"] [data-act="${b.dataset.act}"]`);
      }));
      li.querySelectorAll(`input[name="pf-lo-${j}"]`).forEach(r => r.addEventListener("change", () => { f.never = r.value === "never"; }));
    });
    root.querySelector("#pf-note")?.addEventListener("input", e => { note = e.target.value; });
    root.querySelector("#pf-done")?.addEventListener("click", done);
    root.querySelector("#pf-empathy-go")?.addEventListener("click", () => { fireEmpathyPrompt(getSessionCount()); router.navigate("today"); });
    root.querySelector("#pf-empathy-skip")?.addEventListener("click", () => { skipEmpathyPrompt(getSessionCount()); router.navigate("today"); });
  }

  /** Saves only what was said, on the session's own entry and the person's own preferences. */
  function done() {
    const log = store.get("activityLog") || [];
    const i = log.findIndex(e => e && e.id === entry.id);
    const fields = {};
    if (typeof mood === "number") fields.moodAfter = mood;
    if (note.trim()) fields.note = note.trim();
    if (i !== -1 && Object.keys(fields).length) {
      log[i] = { ...log[i], ...fields };
      store.set("activityLog", log);
      store.set("currentActivityEntry", log[i]);
    }
    for (const [id, f] of Object.entries(fb)) {
      if (f.like) store.likeMovement(id);
      else if (f.less) store.setExercisePreference(id, f.never ? "avoid" : "less", "finish");
    }
    useAnswersForEmpathy(null, typeof mood === "number" ? mood : null);
    const candidate = getEmpathyPromptForSession(getSessionCount());
    if (candidate) { empathy = candidate; paint(); root.querySelector("h1")?.focus(); return; }
    router.navigate("today");
  }

  function onUnmount() { root = null; }

  return { mount, onUnmount };
}
