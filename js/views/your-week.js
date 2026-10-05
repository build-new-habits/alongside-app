/**
 * js/views/your-week.js
 * 05 Oct 2026 v1
 *
 * D-6 WEEK-SHAPE. "Your week" (the Plan). Graeme, 05 Oct: plan what each
 * day is for, and let the coach build each session inside it. Approved on
 * the "Alongside Your Week" mock-up ("looks good on the face of it. It
 * will obviously need to count against the arc and progress").
 *
 * Screens, one at a time, each with its own h1 that takes focus:
 *   start  no week yet, or "Change the week": Build it with me, a
 *          ready-made week, or (coming next) add a plan you already have
 *   pick   Build it with me: which days you want to move
 *   week   the seven days, what each is for and whether it is done this
 *          week, favourites, and the one gap the week leaves (Add / Leave)
 *   day    one day: a session or rest; its day plan's mix (a little / some
 *          / mostly), how hard, how long, where, extras after, favourites.
 *          Edits are a draft until Save; Back saves nothing.
 *
 * Nothing keeps score: a day not done is simply not done. The data is
 * weekShape (data/week-shape-model.js); the logic is data/week-shape.js.
 *
 * WCAG 2.2 AA: every choice is a real button with aria-pressed inside a
 * labelled group, or a labelled input; a status line (role="status")
 * says what was saved; colour is never the only cue (the chosen chip is
 * bold with a thicker border).
 */

import { store } from "../store.js";
import { isPremium } from "../auth.js";
import { lineIcon } from "../data/line-icons.js";
import { EXERCISES } from "../data/exercises/index.js";
import {
  DAY_KEYS, DAY_NAMES, DAY_SHORT, FOCUSES, focusById, LEVELS, INTENSITIES, LENGTHS, PLACES, EXTRAS,
  READY_WEEKS, weekFromReady, newTemplate, sanitizeWeekShape, mixLine, detailLine,
} from "../data/week-shape-model.js";
import { weekDates, dayKeyOf, doneThisWeek, balanceGap, addGap, leaveGap, primaryFocus } from "../data/week-shape.js";

const esc = s => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const clone = o => JSON.parse(JSON.stringify(o));
const byId = new Map(EXERCISES.map(e => [e.id, e]));
const byName = new Map(EXERCISES.map(e => [e.name.toLowerCase(), e]));

export function YourWeekView(router) {
  let root = null;
  let screen = null;       // start | pick | week | day
  let dayKey = null;       // the day being edited
  let draft = null;        // the week being edited on the day screen
  let status = "";
  let picked = [];         // days chosen on the pick screen

  function mount(container) {
    root = container;
    screen = store.get("weekShape") ? "week" : "start";
    render();
  }

  function go(next, msg = "") { screen = next; status = msg; render(); }

  function render() {
    if (!root) return;
    if (!isPremium()) {
      root.innerHTML = `
        <div class="view yw-view">
          ${header("Home", "today")}
          <h1 class="yw-title" tabindex="-1">Your week</h1>
          <p class="yw-sub">Planning your week, and having each day's session built inside it, is part of the Plan.</p>
          <button class="btn btn-primary btn-large btn-full" data-go-route="upgrade">See the Plan</button>
        </div>`;
      wire();
      return;
    }
    const body = screen === "start" ? renderStart()
      : screen === "pick" ? renderPick()
      : screen === "day" ? renderDay()
      : renderWeek();
    root.innerHTML = `<div class="view yw-view">${body}<p class="sr-only" role="status" id="yw-status">${esc(status)}</p></div>`;
    wire();
    root.querySelector(".yw-title")?.focus?.({ preventScroll: true });
  }

  function header(label, route, back) {
    return `<div class="yw-header">
      <button class="btn btn-ghost yw-back" ${back ? `data-back="${back}"` : `data-go-route="${route}"`}>← ${esc(label)}</button>
    </div>`;
  }

  // ── start ───────────────────────────────────────────────────────────
  function renderStart() {
    const has = !!store.get("weekShape");
    return `
      ${has ? header("Your week", null, "week") : header("Home", "today")}
      <h1 class="yw-title" tabindex="-1">Plan your week</h1>
      <p class="yw-sub">You say what each day is for. I build each session inside it, and fit it to how you are on the day.</p>
      ${has ? `<p class="yw-note">Choosing one of these replaces your week as it is now.</p>` : ""}
      <button class="yw-way" data-start="build">
        <span class="kind-tile k-teal">${lineIcon("pencil")}</span>
        <span class="yw-way__text"><span class="yw-way__name">Build it with me</span>
          <span class="yw-way__line">Which days you want to move, then what each one is for.</span></span>
      </button>
      <h2 class="look-label" id="yw-ready-h">Or start from a ready-made week</h2>
      <div class="yw-ready" role="group" aria-labelledby="yw-ready-h">
        ${READY_WEEKS.map(r => `
          <button class="yw-way" data-ready="${r.id}">
            <span class="kind-tile k-amber">${lineIcon("list")}</span>
            <span class="yw-way__text"><span class="yw-way__name">${esc(r.name)}</span>
              <span class="yw-way__line">${esc(r.line)}</span></span>
          </button>`).join("")}
      </div>
      <div class="yw-way yw-way--soon">
        <span class="kind-tile k-blue">${lineIcon("plus")}</span>
        <span class="yw-way__text"><span class="yw-way__name">Add a plan you already have</span>
          <span class="yw-way__line">From a trainer, a class or another app. Coming next.</span></span>
      </div>
      <p class="yw-foot">Change any day, any time. Missing a day is fine: the week does not keep score.</p>`;
  }

  // ── pick ────────────────────────────────────────────────────────────
  function renderPick() {
    return `
      ${header("Back", null, "start")}
      <h1 class="yw-title" tabindex="-1">Which days do you want to move?</h1>
      <p class="yw-sub">The others are rest. Rest counts.</p>
      <div class="yw-chips" role="group" aria-label="Days to move">
        ${DAY_KEYS.map(d => `<button class="yw-chip${picked.includes(d) ? " is-on" : ""}" data-pick="${d}" aria-pressed="${picked.includes(d)}">${DAY_NAMES[d]}</button>`).join("")}
      </div>
      <p class="yw-error" id="yw-pick-error" role="alert"></p>
      <button class="btn btn-primary btn-large btn-full" id="yw-pick-go">Continue</button>`;
  }

  // ── week ────────────────────────────────────────────────────────────
  function renderWeek() {
    const w = store.get("weekShape");
    const dates = weekDates();
    const done = doneThisWeek();
    const today = dayKeyOf();
    const span = `${dates[0].date.getDate()} to ${dates[6].date.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`;
    const favs = [...new Set(Object.values(w.templates).flatMap(t => t.favourites || []))];
    const gap = balanceGap();
    return `
      <div class="yw-header">
        <button class="btn btn-ghost yw-back" data-go-route="today">← Home</button>
        <button class="btn btn-secondary yw-change" data-back="start">Change the week</button>
      </div>
      <h1 class="yw-title" tabindex="-1">Your week</h1>
      <p class="yw-sub">${esc(span)}. I build each day inside it.</p>
      <ol class="yw-days look-card" aria-label="Each day">
        ${DAY_KEYS.map(d => {
          const v = w.days[d];
          const t = v && v !== "rest" ? w.templates[v] : null;
          const f = t ? primaryFocus(t) : null;
          const kind = t ? f.kind : v === "rest" ? "green" : "slate";
          const icon = t ? f.icon : v === "rest" ? "rest" : "plus";
          const name = t ? t.name : v === "rest" ? "Rest" : "Nothing planned";
          const isToday = d === today;
          const aria = `${DAY_NAMES[d]}${isToday ? ", today" : ""}: ${name}${done[d] ? ", done" : ""}. Change`;
          return `<li><button class="yw-day" data-day="${d}" aria-label="${esc(aria)}">
            <span class="yw-day__key${isToday ? " is-today" : ""}" aria-hidden="true">${DAY_SHORT[d]}</span>
            <span class="kind-tile kind-tile--sm k-${kind}">${lineIcon(icon, 20)}</span>
            <span class="yw-day__text" aria-hidden="true">
              <span class="yw-day__name">${esc(name)}</span>
              ${t ? `<span class="yw-day__line">${esc(mixLine(t))}</span><span class="yw-day__line">${esc(detailLine(t))}</span>`
                  : v === "rest" ? `<span class="yw-day__line">Rest counts.</span>` : `<span class="yw-day__line">Tap to say what this day is for.</span>`}
              ${isToday ? `<span class="yw-tag yw-tag--today">Today</span>` : ""}
            </span>
            ${done[d] ? `<span class="yw-done" aria-hidden="true">${lineIcon("tick", 18)} Done</span>` : ""}
          </button></li>`;
        }).join("")}
      </ol>
      ${favs.length ? `
      <section class="look-card yw-card" aria-labelledby="yw-fav-h">
        <h2 class="yw-card__h" id="yw-fav-h">Always in, when it fits</h2>
        <p class="yw-card__p">${favs.map(id => esc(byId.get(id)?.name || id)).join(" · ")}</p>
      </section>` : ""}
      ${gap ? `
      <section class="look-card yw-card" aria-labelledby="yw-gap-h">
        <h2 class="yw-card__h" id="yw-gap-h">Across the week</h2>
        <p class="yw-card__p">Nothing yet for ${esc(gap.label)}. Add a little to ${esc(gap.template.name)} (${gap.days.map(k => DAY_SHORT[k]).join(", ")})?</p>
        <div class="yw-row">
          <button class="btn btn-secondary" id="yw-gap-add">Add to ${esc(gap.template.name)}</button>
          <button class="btn btn-ghost" id="yw-gap-leave">Leave it</button>
        </div>
      </section>` : ""}`;
  }

  // ── day ─────────────────────────────────────────────────────────────
  function renderDay() {
    const v = draft.days[dayKey];
    const t = v && v !== "rest" ? draft.templates[v] : null;
    const usedOn = t ? DAY_KEYS.filter(k => draft.days[k] === t.id) : [];
    const others = Object.values(draft.templates).filter(x => !t || x.id !== t.id);
    const btn = (attr, on, label, cls = "yw-chip") => `<button class="${cls}${on ? " is-on" : ""}" ${attr} aria-pressed="${on}">${label}</button>`;
    return `
      ${header("Your week", null, "week")}
      <h1 class="yw-title" tabindex="-1">${DAY_NAMES[dayKey]}</h1>
      <div class="yw-chips" role="group" aria-label="This day is">
        ${btn('data-kind="session"', !!t, "A session")}
        ${btn('data-kind="rest"', v === "rest", "Rest")}
      </div>
      ${others.length && t ? `
        <h2 class="look-label" id="yw-use-h">Or use another day's plan</h2>
        <div class="yw-chips" role="group" aria-labelledby="yw-use-h">
          ${others.map(o => `<button class="yw-chip" data-use="${o.id}">${esc(o.name)}</button>`).join("")}
        </div>` : ""}
      ${t ? renderEditor(t, usedOn) : ""}
      <button class="btn btn-primary btn-large btn-full" id="yw-save">Save ${DAY_NAMES[dayKey]}</button>
      <p class="yw-foot">Back saves nothing.</p>`;
  }

  function renderEditor(t, usedOn) {
    const btn = (attr, on, label, cls = "yw-chip") => `<button class="${cls}${on ? " is-on" : ""}" ${attr} aria-pressed="${on}">${label}</button>`;
    const absent = FOCUSES.filter(f => !t.mix.some(m => m.focus === f.id));
    const favs = t.favourites || [];
    return `
      ${usedOn.length > 1 ? `
        <p class="yw-note">This plan is used on ${usedOn.map(k => DAY_NAMES[k]).join(" and ")}: a change here changes ${usedOn.length > 2 ? "all of them" : "both"}.
          <button class="btn btn-ghost yw-inline" id="yw-own">Change ${DAY_NAMES[dayKey]} only</button></p>` : ""}
      <label class="yw-label" for="yw-name">Name</label>
      <input class="yw-input" id="yw-name" maxlength="40" value="${esc(t.name)}" autocomplete="off">

      <section class="look-card yw-card" aria-labelledby="yw-mix-h">
        <h2 class="yw-card__h" id="yw-mix-h">What's in it</h2>
        ${t.mix.map(m => {
          const f = focusById(m.focus);
          return `<div class="yw-mix" role="group" aria-label="${esc(f.label)}">
            <div class="yw-mix__head"><span class="yw-mix__name">${esc(f.label)}</span>
              ${t.mix.length > 1 ? `<button class="btn btn-ghost yw-inline" data-unmix="${f.id}" aria-label="Take out ${esc(f.label)}">Take out</button>` : ""}</div>
            <div class="yw-seg">${LEVELS.map((l, i) => btn(`data-mix="${f.id}" data-level="${i}"`, m.level === i, l, "yw-seg__btn")).join("")}</div>
          </div>`;
        }).join("")}
        ${t.mix.length < 4 ? `
          <h3 class="look-label" id="yw-add-h">Add something</h3>
          <div class="yw-chips" role="group" aria-labelledby="yw-add-h">
            ${absent.map(f => `<button class="yw-chip" data-addmix="${f.id}">+ ${esc(f.label)}</button>`).join("")}
          </div>` : ""}
        <p class="yw-hint">Mostly has the most of the main part, some less, a little one exercise or so. Stretching and mobility go in the cool-down.</p>
      </section>

      <section class="look-card yw-card" aria-labelledby="yw-int-h">
        <h2 class="yw-card__h" id="yw-int-h">How hard</h2>
        <div class="yw-stack" role="group" aria-labelledby="yw-int-h">
          ${INTENSITIES.map(i => `<button class="yw-int${t.intensity === i.id ? " is-on" : ""}" data-int="${i.id}" aria-pressed="${t.intensity === i.id}">
            <span class="yw-int__name">${i.label}</span><span class="yw-int__line">${esc(i.line)}</span></button>`).join("")}
        </div>
      </section>

      <section class="look-card yw-card" aria-labelledby="yw-len-h">
        <h2 class="yw-card__h" id="yw-len-h">How long, and where</h2>
        <div class="yw-chips" role="group" aria-label="How long">
          ${LENGTHS.map(n => btn(`data-mins="${n}"`, t.mins === n, `${n} min`)).join("")}
        </div>
        <div class="yw-chips" role="group" aria-label="Where">
          ${PLACES.map(p => btn(`data-place="${p.id}"`, t.place === p.id, p.label)).join("")}
        </div>
      </section>

      <section class="look-card yw-card" aria-labelledby="yw-ext-h">
        <h2 class="yw-card__h" id="yw-ext-h">After, if you like</h2>
        <div class="yw-chips" role="group" aria-labelledby="yw-ext-h">
          ${EXTRAS.map(x => btn(`data-extra="${x.id}"`, t.extras.includes(x.id), x.label)).join("")}
        </div>
      </section>

      <section class="look-card yw-card" aria-labelledby="yw-favs-h">
        <h2 class="yw-card__h" id="yw-favs-h">Always in, when it fits</h2>
        ${favs.length ? `<ul class="yw-favs">${favs.map(id => `<li><span>${esc(byId.get(id)?.name || id)}</span>
          <button class="btn btn-ghost yw-inline" data-unfav="${id}" aria-label="Take out ${esc(byId.get(id)?.name || id)}">Take out</button></li>`).join("")}</ul>`
          : `<p class="yw-hint">An exercise you like to do whenever this day comes round.</p>`}
        ${favs.length < 6 ? `
          <label class="yw-label" for="yw-fav-in">Add an exercise</label>
          <div class="yw-row">
            <input class="yw-input" id="yw-fav-in" list="yw-fav-list" autocomplete="off" placeholder="Start typing a name">
            <button class="btn btn-secondary" id="yw-fav-add">Add</button>
          </div>
          <datalist id="yw-fav-list">${EXERCISES.map(e => `<option value="${esc(e.name)}"></option>`).join("")}</datalist>
          <p class="yw-error" id="yw-fav-error" role="alert"></p>` : ""}
      </section>`;
  }

  // ── wiring ──────────────────────────────────────────────────────────
  function wire() {
    const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
    $$("[data-go-route]").forEach(b => b.addEventListener("click", () => router.navigate(b.dataset.goRoute)));
    $$("[data-back]").forEach(b => b.addEventListener("click", () => { draft = null; go(b.dataset.back); }));

    // start
    $$("[data-start]").forEach(b => b.addEventListener("click", () => { picked = []; go("pick"); }));
    $$("[data-ready]").forEach(b => b.addEventListener("click", () => {
      store.set("weekShape", weekFromReady(b.dataset.ready));
      go("week", `${READY_WEEKS.find(r => r.id === b.dataset.ready)?.name} is your week. Tap any day to change it.`);
    }));

    // pick
    $$("[data-pick]").forEach(b => b.addEventListener("click", () => {
      const d = b.dataset.pick;
      picked = picked.includes(d) ? picked.filter(x => x !== d) : [...picked, d];
      render();
      root.querySelector(`[data-pick="${d}"]`)?.focus();
    }));
    $("#yw-pick-go")?.addEventListener("click", () => {
      if (!picked.length) {
        const e = $("#yw-pick-error"); if (e) e.textContent = "Choose at least one day.";
        root.querySelector("[data-pick]")?.focus();
        return;
      }
      const templates = {}, days = {};
      for (const d of DAY_KEYS) {
        if (picked.includes(d)) {
          const t = newTemplate(Object.keys(templates), `${DAY_NAMES[d]} plan`);
          templates[t.id] = t; days[d] = t.id;
        } else days[d] = "rest";
      }
      store.set("weekShape", sanitizeWeekShape({ templates, days, setAt: new Date().toISOString().slice(0, 10) }));
      go("week", "Your week is set. Tap each day to say what it is for.");
    });

    // week
    $$("[data-day]").forEach(b => b.addEventListener("click", () => {
      dayKey = b.dataset.day;
      draft = clone(store.get("weekShape"));
      if (!draft.days[dayKey]) {
        const t = newTemplate(Object.keys(draft.templates), `${DAY_NAMES[dayKey]} plan`);
        draft.templates[t.id] = t; draft.days[dayKey] = t.id;
      }
      go("day");
    }));
    $("#yw-gap-add")?.addEventListener("click", () => {
      const gap = balanceGap(); addGap(gap);
      go("week", gap ? `Added a little ${focusById(gap.focus).label.toLowerCase()} to ${gap.template.name}.` : "");
    });
    $("#yw-gap-leave")?.addEventListener("click", () => { leaveGap(balanceGap()); go("week", "Left as it is this week."); });

    // day
    const cur = () => { const v = draft.days[dayKey]; return v && v !== "rest" ? draft.templates[v] : null; };
    // The name is kept as it is typed, into the plan on screen; reading it
    // at redraw instead wrote it into whichever plan was on screen next
    // (found by verify-your-week 3g: Tuesday's name onto Monday's plan).
    $("#yw-name")?.addEventListener("input", e => { const t = cur(); if (t) t.name = e.target.value.slice(0, 40); });
    const keepName = () => { const t = cur(); if (t) t.name = t.name.trim() || `${DAY_NAMES[dayKey]} plan`; };
    const redraw = (focusSel) => { render(); if (focusSel) root.querySelector(focusSel)?.focus(); };
    $$("[data-kind]").forEach(b => b.addEventListener("click", () => {
      keepName();
      if (b.dataset.kind === "rest") draft.days[dayKey] = "rest";
      else if (!cur()) {
        const t = newTemplate(Object.keys(draft.templates), `${DAY_NAMES[dayKey]} plan`);
        draft.templates[t.id] = t; draft.days[dayKey] = t.id;
      }
      redraw(`[data-kind="${b.dataset.kind}"]`);
    }));
    $$("[data-use]").forEach(b => b.addEventListener("click", () => { keepName(); draft.days[dayKey] = b.dataset.use; redraw("#yw-name"); }));
    $("#yw-own")?.addEventListener("click", () => {
      keepName();
      const t = cur();
      const copy = { ...clone(t), id: newTemplate(Object.keys(draft.templates)).id, name: `${t.name} (${DAY_SHORT[dayKey]})` };
      draft.templates[copy.id] = copy; draft.days[dayKey] = copy.id;
      redraw("#yw-name");
    });
    $$("[data-mix]").forEach(b => b.addEventListener("click", () => {
      const m = cur().mix.find(x => x.focus === b.dataset.mix); m.level = Number(b.dataset.level);
      redraw(`[data-mix="${b.dataset.mix}"][data-level="${b.dataset.level}"]`);
    }));
    $$("[data-unmix]").forEach(b => b.addEventListener("click", () => {
      const t = cur(); t.mix = t.mix.filter(x => x.focus !== b.dataset.unmix); redraw("#yw-mix-h");
    }));
    $$("[data-addmix]").forEach(b => b.addEventListener("click", () => {
      const t = cur(); if (t.mix.length < 4) t.mix.push({ focus: b.dataset.addmix, level: 1 });
      redraw(`[data-mix="${b.dataset.addmix}"][data-level="1"]`);
    }));
    $$("[data-int]").forEach(b => b.addEventListener("click", () => { cur().intensity = b.dataset.int; redraw(`[data-int="${b.dataset.int}"]`); }));
    $$("[data-mins]").forEach(b => b.addEventListener("click", () => { cur().mins = Number(b.dataset.mins); redraw(`[data-mins="${b.dataset.mins}"]`); }));
    $$("[data-place]").forEach(b => b.addEventListener("click", () => { cur().place = b.dataset.place; redraw(`[data-place="${b.dataset.place}"]`); }));
    $$("[data-extra]").forEach(b => b.addEventListener("click", () => {
      const t = cur(), x = b.dataset.extra;
      t.extras = t.extras.includes(x) ? t.extras.filter(e => e !== x) : [...t.extras, x];
      redraw(`[data-extra="${x}"]`);
    }));
    $$("[data-unfav]").forEach(b => b.addEventListener("click", () => {
      const t = cur(); t.favourites = t.favourites.filter(f => f !== b.dataset.unfav); redraw("#yw-favs-h");
    }));
    $("#yw-fav-add")?.addEventListener("click", () => {
      const inp = $("#yw-fav-in");
      const ex = byName.get((inp?.value || "").trim().toLowerCase());
      if (!ex) { const e = $("#yw-fav-error"); if (e) e.textContent = "Choose an exercise from the list."; inp?.focus(); return; }
      const t = cur(); if (!t.favourites.includes(ex.id)) t.favourites.push(ex.id);
      redraw("#yw-fav-in");
    });
    $("#yw-save")?.addEventListener("click", () => {
      keepName();
      // Day plans no day uses any more are let go.
      const used = new Set(Object.values(draft.days).filter(v => v && v !== "rest"));
      for (const id of Object.keys(draft.templates)) if (!used.has(id)) delete draft.templates[id];
      const saved = sanitizeWeekShape(draft);
      if (saved) store.set("weekShape", saved);
      const name = DAY_NAMES[dayKey];
      draft = null;
      go("week", `Saved ${name}.`);
    });
  }

  function onUnmount() { root = null; }

  return { mount, onUnmount };
}
