/**
 * js/views/plan-import.js
 * 05 Oct 2026 v1
 *
 * D-7 PLAN-IMPORT. "Add a plan you already have" (the Plan). Paste a plan
 * from a trainer, a class, another app or an AI; the app finds the
 * exercises with rules (data/plan-reader.js), shows what it read, and adds
 * what the person ticks to My exercises, each day as its own group.
 * If it cannot read much, it offers a template to take back to whoever
 * wrote the plan.
 *
 * Screens, each with an h1 that takes focus:
 *   paste     what it takes in (the health rules, always shown), the box,
 *             Read my plan, Get the template
 *   review    each day: its name (editable), each exercise with what it
 *             matched, Which is it? for a near match, the amount (editable),
 *             a tick; what was not taken in; Add to My exercises
 *   done      what was added; Open My exercises, Put them into your week
 *   template  the template, Copy, and what to do with it
 *
 * The pasted text lives only in this screen's memory and is dropped when
 * the plan is added or the screen is left (health rule H2).
 *
 * WCAG 2.2 AA: real checkboxes, radios and inputs with labels; groups in
 * fieldsets with legends; errors in role="alert" and focused; a status
 * line for what happened; nothing by colour alone.
 */

import { store } from "../store.js";
import { isPremium } from "../auth.js";
import { healthAllowed } from "../data/health-consent.js";
import { lineIcon } from "../data/line-icons.js";
import {
  readPlan, findAmount, amountOk, amountText, repsString, exerciseById, HEALTH_LINES, TEMPLATE, LIMITS,
} from "../data/plan-reader.js";

const esc = s => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function PlanImportView(router) {
  let root = null;
  let screen = "paste";
  let text = "";          // H2: in memory only
  let plan = null;        // what readPlan found, with the person's edits
  let added = null;       // { count, days }
  let status = "";
  let error = "";

  function mount(container) {
    root = container;
    screen = "paste"; plan = null; added = null; status = ""; error = "";
    render();
  }

  function go(next, msg = "") { screen = next; status = msg; error = ""; render(); }

  function header(label, back) {
    return `<div class="yw-header"><button class="btn btn-ghost yw-back" data-back="${back}">← ${esc(label)}</button></div>`;
  }

  function rulesCard() {
    return `<section class="look-card yw-card pi-rules" aria-labelledby="pi-rules-h">
      <h2 class="yw-card__h" id="pi-rules-h">What I take in</h2>
      <ul class="pi-rules__list">
        <li>${esc(HEALTH_LINES.takes)}</li>
        <li>${esc(HEALTH_LINES.stays)}</li>
        <li>${esc(HEALTH_LINES.yours)}</li>
        <li>${esc(HEALTH_LINES.kept)}</li>
      </ul>
    </section>`;
  }

  function render() {
    if (!root) return;
    if (!isPremium()) {
      root.innerHTML = `<div class="view yw-view">
        <div class="yw-header"><button class="btn btn-ghost yw-back" data-route-to="today">← Home</button></div>
        <h1 class="yw-title" tabindex="-1">Add a plan you already have</h1>
        <p class="yw-sub">Bringing in a plan you already have, and giving its days a place in your week, is part of the Plan.</p>
        <button class="btn btn-primary btn-large btn-full" data-route-to="upgrade">See the Plan</button>
      </div>`;
      wire(); return;
    }
    const body = screen === "review" ? renderReview()
      : screen === "done" ? renderDone()
      : screen === "template" ? renderTemplate()
      : renderPaste();
    root.innerHTML = `<div class="view yw-view pi-view">${body}<p class="sr-only" role="status" id="pi-status">${esc(status)}</p></div>`;
    wire();
    root.querySelector(".yw-title")?.focus?.({ preventScroll: true });
  }

  // ── paste ───────────────────────────────────────────────────────────
  function renderPaste() {
    return `
      <div class="yw-header"><button class="btn btn-ghost yw-back" data-route-to="back">← Back</button></div>
      <h1 class="yw-title" tabindex="-1">Add a plan you already have</h1>
      <p class="yw-sub">From a trainer, a class, another app or an AI. Paste it below and I'll find the exercises in it.</p>
      ${rulesCard()}
      <label class="yw-label" for="pi-text">Your plan</label>
      <textarea class="yw-input pi-text" id="pi-text" rows="10" maxlength="${LIMITS.text}" aria-describedby="pi-text-hint pi-error"
        autocomplete="off" spellcheck="false">${esc(text)}</textarea>
      <p class="yw-hint" id="pi-text-hint">One exercise to a line works best, with its amount: "Goblet squat 3 x 10". Days or sessions on their own line: "Session A".</p>
      <p class="yw-error" id="pi-error" role="alert">${esc(error)}</p>
      <button class="btn btn-primary btn-large btn-full" id="pi-read">Read my plan</button>
      <button class="yw-way" data-go="template">
        <span class="kind-tile k-blue">${lineIcon("list")}</span>
        <span class="yw-way__text"><span class="yw-way__name">Get the template</span>
          <span class="yw-way__line">Send it to whoever wrote your plan, a trainer or an AI, to write it out in a form I can read.</span></span>
      </button>`;
  }

  // ── review ──────────────────────────────────────────────────────────
  function renderReview() {
    const ownGroups = new Set((store.get("prescribedExercises") || []).map(e => e.group).filter(Boolean));
    const n = plan.days.reduce((k, d) => k + d.items.length, 0);
    return `
      ${header("Back", "paste")}
      <h1 class="yw-title" tabindex="-1">Here's what I read</h1>
      <p class="yw-sub">${n} exercise${n === 1 ? "" : "s"} in ${plan.days.length} ${plan.days.length === 1 ? "day" : "days"}. The ticked ones go into My exercises, each day under its own name. Amounts are sets x reps, or sets x seconds.</p>
      ${!plan.readable ? `
        <section class="look-card yw-card" aria-labelledby="pi-hard-h">
          <h2 class="yw-card__h" id="pi-hard-h">I couldn't read much of this</h2>
          <p class="yw-card__p">The template shows whoever wrote it how to set it out so I can.</p>
          <button class="btn btn-secondary" data-go="template">Get the template</button>
        </section>` : ""}
      <section class="look-card yw-card" aria-label="What I take in">
        <p class="yw-card__p">${esc(HEALTH_LINES.takes)} ${esc(HEALTH_LINES.stays)}</p>
      </section>
      ${plan.days.map((d, di) => `
        <section class="pi-day" aria-labelledby="pi-day-h-${di}">
          <h2 class="pi-day__h" id="pi-day-h-${di}">${esc(d.name)}</h2>
          <label class="yw-label" for="pi-day-${di}">Name for this day</label>
          <input class="yw-input" id="pi-day-${di}" data-dayname="${di}" maxlength="40" value="${esc(d.name)}" autocomplete="off">
          ${ownGroups.has(d.name) ? `<p class="yw-note">${esc(d.name)} is already in My exercises: adding replaces it.</p>` : ""}
          <ul class="pi-items">${d.items.map((it, ii) => renderItem(it, di, ii)).join("")}</ul>
        </section>`).join("")}
      ${plan.notRead.length ? `
        <details class="look-card yw-card pi-not">
          <summary>Not taken in (${plan.notRead.length})</summary>
          <ul>${plan.notRead.map(l => `<li>${esc(l)}</li>`).join("")}</ul>
        </details>` : ""}
      ${!healthAllowed() && plan.days.some(d => d.items.some(i => i.note)) ? `<p class="yw-hint">Notes from the plan are kept only if you have said I can keep health answers, as with notes you type into My exercises.</p>` : ""}
      <p class="yw-error" id="pi-error" role="alert">${esc(error)}</p>
      <button class="btn btn-primary btn-large btn-full" id="pi-add">Add the ticked ones to My exercises</button>`;
  }

  function renderItem(it, di, ii) {
    const key = `${di}-${ii}`;
    const lib = it.chosen ? exerciseById(it.chosen) : null;
    const shown = lib ? lib.name : it.name;
    const kind = it.match.kind;
    return `<li class="pi-item${it.take ? " is-on" : ""}">
      <div class="pi-item__take">
        <input type="checkbox" id="pi-take-${key}" data-take="${key}" ${it.take ? "checked" : ""}>
        <label for="pi-take-${key}"><span class="pi-item__name">${esc(shown)}</span></label>
      </div>
      <p class="pi-item__line">You wrote: ${esc(it.line)}</p>
      ${kind === "choose" ? `
        <fieldset class="pi-choose">
          <legend>Which is it?</legend>
          ${it.match.choices.map(id => `<label class="pi-radio"><input type="radio" name="pi-ch-${key}" value="${esc(id)}" data-choose="${key}" ${it.chosen === id ? "checked" : ""}> ${esc(exerciseById(id)?.name || id)}</label>`).join("")}
          <label class="pi-radio"><input type="radio" name="pi-ch-${key}" value="" data-choose="${key}" ${it.take && !it.chosen ? "checked" : ""}> None of these: keep it as I wrote it</label>
        </fieldset>` : ""}
      ${kind === "own" ? `<p class="pi-item__what">I don't know this one. Tick it to keep it as you wrote it: there is no how-to or picture, and I can't tell whether it loads a sore area.</p>` : ""}
      <div class="pi-amt-row">
        <label class="yw-label" for="pi-amt-${key}">Amount</label>
        <input class="yw-input pi-amt" id="pi-amt-${key}" data-amt="${key}" value="${esc(it.amountText)}" autocomplete="off"${it.defaulted || !it.ok ? ` aria-describedby="pi-amt-note-${key}"` : ""}>
      </div>
      ${it.defaulted ? `<p class="yw-hint" id="pi-amt-note-${key}">No amount given: this is the usual for it.</p>`
        : !it.ok ? `<p class="yw-hint pi-warn" id="pi-amt-note-${key}">Check the amount: it is outside what I'd expect.</p>` : ""}
    </li>`;
  }

  // ── done ────────────────────────────────────────────────────────────
  function renderDone() {
    return `
      <div class="yw-header"><button class="btn btn-ghost yw-back" data-route-to="prescribed">← My exercises</button></div>
      <h1 class="yw-title" tabindex="-1">Added to My exercises</h1>
      <p class="yw-sub">${added.count} exercise${added.count === 1 ? "" : "s"}, in ${added.days.map(esc).join(", ")}.</p>
      <p class="yw-sub">${esc(HEALTH_LINES.yours)}</p>
      <button class="btn btn-primary btn-large btn-full" data-route-to="your-week">Put them into your week</button>
      <button class="btn btn-secondary btn-full" data-route-to="prescribed">Open My exercises</button>
      <button class="btn btn-ghost btn-full" data-go="paste">Add another plan</button>`;
  }

  // ── template ────────────────────────────────────────────────────────
  function renderTemplate() {
    return `
      ${header("Back", plan ? "review" : "paste")}
      <h1 class="yw-title" tabindex="-1">A template for your plan</h1>
      <p class="yw-sub">Send this to whoever wrote your plan, a trainer or an AI you use, and ask them to write the plan out this way. Then paste what comes back.</p>
      <label class="yw-label" for="pi-template">The template</label>
      <textarea class="yw-input pi-text pi-template" id="pi-template" rows="14" readonly>${esc(TEMPLATE)}</textarea>
      <button class="btn btn-primary btn-large btn-full" id="pi-copy">Copy the template</button>
      ${typeof navigator !== "undefined" && navigator.share ? `<button class="btn btn-secondary btn-full" id="pi-share">Share the template</button>` : ""}
      <p class="yw-hint">Lines starting with # or e.g. are instructions and an example; I skip them.</p>`;
  }

  // ── wiring ──────────────────────────────────────────────────────────
  function wire() {
    const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
    $$("[data-route-to]").forEach(b => b.addEventListener("click", () => {
      const to = b.dataset.routeTo;
      if (to === "back") { if (router.back) router.back(); else router.navigate("your-week"); return; }
      router.navigate(to);
    }));
    $$("[data-back]").forEach(b => b.addEventListener("click", () => go(b.dataset.back)));
    $$("[data-go]").forEach(b => b.addEventListener("click", () => { keepText(); go(b.dataset.go); }));
    const keepText = () => { const t = $("#pi-text:not(.pi-template)"); if (t) text = t.value; };

    $("#pi-read")?.addEventListener("click", () => {
      keepText();
      if (!text.trim()) return fail("Paste your plan into the box first.", "#pi-text");
      plan = readPlan(text);
      for (const d of plan.days) for (const it of d.items) {
        it.chosen = it.match.kind === "matched" ? it.match.id : null;
        it.amountText = amountText(it.amount);
      }
      if (!plan.days.length) {
        plan = null;
        return fail("I couldn't find any exercises in that. The template shows how to set it out so I can.", "#pi-text");
      }
      go("review", `I read ${plan.days.reduce((k, d) => k + d.items.length, 0)} exercises.`);
    });

    // review
    const itemOf = key => { const [di, ii] = key.split("-").map(Number); return plan.days[di].items[ii]; };
    $$("[data-take]").forEach(b => b.addEventListener("change", () => {
      const it = itemOf(b.dataset.take); it.take = b.checked;
      b.closest(".pi-item")?.classList.toggle("is-on", b.checked);
    }));
    $$("[data-choose]").forEach(b => b.addEventListener("change", () => {
      const it = itemOf(b.dataset.choose); it.chosen = b.value || null; it.take = true;
      const box = root.querySelector(`#pi-take-${b.dataset.choose}`);
      if (box) box.checked = true;
      b.closest(".pi-item")?.classList.add("is-on");
      const name = b.closest(".pi-item")?.querySelector(".pi-item__name");
      if (name) name.textContent = it.chosen ? (exerciseById(it.chosen)?.name || it.name) : it.name;
    }));
    $$("[data-amt]").forEach(b => b.addEventListener("input", () => { itemOf(b.dataset.amt).amountText = b.value; }));
    $$("[data-dayname]").forEach(b => b.addEventListener("input", () => { plan.days[+b.dataset.dayname].name = b.value.replace(/[<>]/g, "").trim().slice(0, 40); }));
    $("#pi-add")?.addEventListener("click", addTicked);

    // template
    $("#pi-copy")?.addEventListener("click", async () => {
      const box = $("#pi-template");
      let done = false;
      try { await navigator.clipboard.writeText(TEMPLATE); done = true; } catch { /* fall back below */ }
      if (!done && box) { box.focus(); box.select(); try { done = document.execCommand && document.execCommand("copy"); } catch { done = false; } }
      setStatus(done ? "Copied. Paste it into a message, or into your AI chat." : "The template is selected: copy it from the box.");
    });
    $("#pi-share")?.addEventListener("click", () => { navigator.share({ title: "Alongside plan template", text: TEMPLATE }).catch(() => {}); });
  }

  function setStatus(msg) { status = msg; const el = root.querySelector("#pi-status"); if (el) el.textContent = msg; }

  function fail(msg, focusSel) {
    error = msg;
    const el = root.querySelector("#pi-error"); if (el) el.textContent = msg;
    root.querySelector(focusSel)?.focus();
  }

  function addTicked() {
    const keepNotes = healthAllowed();
    const entries = [], days = [];
    let n = 0;
    for (const [di, d] of plan.days.entries()) {
      const name = (d.name || "").trim();
      if (!name) return fail("Give each day a name.", `#pi-day-${di}`);
      for (const [ii, it] of d.items.entries()) {
        if (!it.take) continue;
        const a = findAmount(it.amountText);
        if (!a || !amountOk(a)) return fail(`Check the amount for ${it.name}: sets x reps, or sets x seconds.`, `#pi-amt-${di}-${ii}`);
        const lib = it.chosen ? exerciseById(it.chosen) : null;
        entries.push({
          id: `px-${Date.now()}-${n++}`,
          exerciseId: lib ? lib.id : null,
          name: (lib ? lib.name : it.name).replace(/[<>]/g, "").slice(0, 60),
          description: "", frequency: "", active: true, completedToday: false, completedAt: null,
          addedAt: new Date().toISOString(),
          sets: a.sets || 1,
          ...(repsString(a) ? { reps: repsString(a) } : {}),
          ...(keepNotes && it.note ? { notes: it.note.slice(0, 200) } : {}),
          group: name,
        });
      }
      if (d.items.some(i => i.take)) days.push(name);
    }
    if (!entries.length) return fail("Tick at least one exercise to add.", "[data-take]");
    // A day already there is replaced by the one just read.
    const kept = (store.get("prescribedExercises") || []).filter(e => !days.includes(e.group));
    store.set("prescribedExercises", [...kept, ...entries]);
    added = { count: entries.length, days };
    text = ""; plan = null;   // H2: the pasted words go
    go("done", `Added ${entries.length} exercises to My exercises.`);
  }

  function onUnmount() { root = null; text = ""; plan = null; }

  return { mount, onUnmount };
}
