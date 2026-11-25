/**
 * js/views/onboarding/start.js
 * 24 Nov 2026 v2
 *
 * v2 - P-46 WAVE 8 FIX. Found in the Wave 8 trace: the card said about 15
 *   minutes, gentle, and Today's plan said "You asked for strength, full body,
 *   30 minutes". Now about 20 minutes on both (quick), and Outside asks for
 *   outside.
 *
 * 24 Nov 2026 v1
 *
 * P-46 FREE-AND-FIRST, S2 GETTING STARTED (spec
 * docs/specs/alongside_free-and-first_24nov2026_v1.md, v2, section 2; mock-up v1
 * approved by Graeme, 24 Nov: "I love all of it"). Both tiers.
 *
 * Reached from onboarding/thread.js once the age question and the
 * agreements are done, for anyone who has not already started the old
 * conversation. About a minute, four screens, then a first session:
 *
 *   1  name        Hi. What should I call you?
 *   2  sore        Anything sore at the moment? (only with the health
 *                  consent, as the old conversation's sore-area step)
 *   3  where       Where will you move? and, with the health consent,
 *                  So I keep it safe: chair, (legs), floor, balance
 *   4  ready       Your first session: Show me my session (Today's plan,
 *                  the one plan screen, with its safety note) or Not now
 *
 * Writes what the old conversation wrote for the same answers, through the
 * same fields: name; conditions; equipment, homeEquipment, gymEquipment,
 * sessionLocation; capability.* with capability.askedAt on the first
 * answer; then onboarding.flow = "short", onboarding.threadCompletedAt and
 * store.completeOnboarding(). The red-flag questions are not asked here:
 * the route guard asks them before the first session, as it always has
 * (data/red-flag.js guardRoute). A short start with no activity level is
 * built as light (store.declaredLevel(), S1).
 *
 * WCAG 2.2 AA: one h1 per screen, focused on arrival; choices are buttons
 * with aria-pressed, or radio groups with legends; a disabled Next says
 * why in words; 44 px targets; nothing relies on colour; no emoji.
 */

import { store } from "../../store.js";
import { CONDITIONS } from "../../data/conditions.js";
import { scopeStatementHTML } from "../../data/scope-statement.js";
import { healthAnswersAllowed } from "../../data/onboarding-thread-data.js";
import { setTodaysLength } from "../../data/session-length.js";

/** The body areas offered: the pain areas (lower body, back, upper body), as the conditions sheet groups them. */
export const START_AREAS = CONDITIONS.filter(c => ["lower", "back", "upper"].includes(c.area)).map(c => ({ id: c.id, name: c.name }));

/** Where will you move? -> the equipment the old equipment step would have written. */
export const FULL_GYM = [
  "dumbbells-light","dumbbells-medium","dumbbells-heavy","adjustable-dumbbells",
  "kettlebell-light","kettlebell-medium","kettlebell-heavy",
  "barbell","ez-curl-bar",
  "band-light","band-medium","band-heavy",
  "treadmill","exercise-bike","rowing-machine","elliptical",
  "bench-flat","bench-adjustable",
  "pull-up-bar","dip-station",
  "stability-ball","ab-wheel",
  "foam-roller","massage-gun","gym-membership"
];
export const PLACES = [
  { id: "home",    title: "Home",    sub: "No kit needed" },
  { id: "gym",     title: "Gym",     sub: "Machines and weights" },
  { id: "outside", title: "Outside", sub: "Walk, run, ride" },
  { id: "mix",     title: "A mix",   sub: "Wherever I am" }
];
const ABILITY = [
  { key: "chairRise",    legend: "Up from a chair without your hands?", opts: [["yes", "Yes"], ["not-easily", "Not easily"], ["no", "No"]] },
  { key: "legPower",     legend: "Can your legs take your weight?",     opts: [["full", "Yes"], ["limited", "A little"], ["none", "No"]], onlyIf: c => c.chairRise === "not-easily" || c.chairRise === "no" },
  { key: "floorAccess",  legend: "Down to the floor and back up?",     opts: [["yes", "Yes"], ["not-comfortably", "Not easily"], ["no", "No"]] },
  { key: "balanceWorry", legend: "Worried about your balance?",        opts: [["no", "No"], ["sometimes", "Sometimes"], ["yes", "Yes"]] }
];

/** Writes the place as the old equipment step would have (same fields, same lists). */
export function applyPlace(place) {
  const gym = place === "gym" || place === "mix" ? [...FULL_GYM] : [];
  store.set("homeEquipment", []);
  store.set("gymEquipment", gym);
  store.set("equipment", [...gym]);
  store.set("sessionLocation", place === "gym" ? "gym" : "home");
}

/** The one line on screen 4, in their words. */
export function readyLine(place, areas) {
  const where = place === "gym" ? "at the gym" : place === "outside" ? "no kit needed" : "at home";
  const names = areas.map(id => (CONDITIONS.find(c => c.id === id) || {}).name || id).map(n => n.toLowerCase());
  const around = names.length ? `, working around your ${names.length < 2 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`}` : "";
  return `Gentle, ${where}${around}.`;
}

const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export function StartView(router) {
  let root = null;
  let screen = "name";
  let place = null;

  const health = () => healthAnswersAllowed(store.data);
  const order = () => health() ? ["name", "sore", "where", "ready"] : ["name", "where", "ready"];

  function mount(container) {
    root = container;
    if (store.get("onboardingComplete") === true) { router.navigate("today", { replace: true }); return; }
    if (store.get("consent.given") !== true || store.get("consent.ageConfirmed") !== true) { router.navigate("onboarding/thread", { replace: true }); return; }
    render();
  }

  function go(s) { screen = s; render(); }
  function next() { const o = order(); go(o[Math.min(o.indexOf(screen) + 1, o.length - 1)]); }
  function back() { const o = order(); const i = o.indexOf(screen); if (i > 0) go(o[i - 1]); }

  function frame(inner, action) {
    const o = order(), i = o.indexOf(screen) + 1, n = o.length;
    const dots = o.map((_, k) => `<span class="st-dot${k < i ? " is-on" : ""}"></span>`).join("");
    return `<section class="st" aria-labelledby="st-h">
      <div class="st-top">
        ${i > 1 ? `<button type="button" class="btn btn-ghost st-back" data-st-back>‹ Back</button>` : `<span class="st-back-space"></span>`}
        <span class="st-count">${i} of ${n}</span>
        <span class="st-dots" aria-hidden="true">${dots}</span>
      </div>
      <div class="st-body">${inner}</div>
      <div class="st-actions">${action}</div>
    </section>`;
  }

  function nameScreen() {
    const v = store.get("name") || "";
    return frame(`
      <h1 id="st-h" tabindex="-1">Hi. What should I call you?</h1>
      <p class="st-line">About a minute, then your first session.</p>
      <label for="st-name" class="st-label">First name</label>
      <input id="st-name" class="st-input" type="text" autocomplete="given-name" maxlength="40" value="${esc(v)}">`,
      `<button type="button" class="btn btn-primary btn-large btn-full" data-st-next>Next</button>`);
  }

  function soreScreen() {
    const sel = new Set(store.get("conditions") || []);
    const chips = START_AREAS.map(a => `<button type="button" class="st-chip${sel.has(a.id) ? " is-on" : ""}" aria-pressed="${sel.has(a.id)}" data-area="${a.id}">${esc(a.name)}</button>`).join("");
    const any = START_AREAS.some(a => sel.has(a.id));
    return frame(`
      <h1 id="st-h" tabindex="-1">Anything sore at the moment?</h1>
      <p class="st-line">Pick any. I'll work around them.</p>
      <div class="st-chips" role="group" aria-label="Sore areas">${chips}</div>
      ${scopeStatementHTML({ heading: "h2", id: "st-scope" })}`,
      `<button type="button" class="btn btn-primary btn-large btn-full" data-st-next>${any ? "Next" : "Nothing sore"}</button>`);
  }

  function whereScreen() {
    const cap = store.get("capability") || {};
    const places = PLACES.map(p => `<button type="button" class="st-place${place === p.id ? " is-on" : ""}" aria-pressed="${place === p.id}" data-place="${p.id}"><span class="st-place__t">${p.title}</span><span class="st-place__s">${p.sub}</span></button>`).join("");
    const ability = health() ? `<h2 class="st-h2">So I keep it safe</h2>` + ABILITY.filter(a => !a.onlyIf || a.onlyIf(cap)).map(a => `
      <fieldset class="st-seg"><legend>${a.legend}</legend><div class="st-seg__row">${a.opts.map(([v, l]) =>
        `<label class="st-seg__opt"><input type="radio" name="st-${a.key}" value="${v}" data-cap="${a.key}"${cap[a.key] === v ? " checked" : ""}><span>${l}</span></label>`).join("")}</div></fieldset>`).join("") : "";
    return frame(`
      <h1 id="st-h" tabindex="-1">Where will you move?</h1>
      <div class="st-places" role="group" aria-label="Where you'll move">${places}</div>
      ${ability}`,
      `<p class="st-need" id="st-need"${place ? " hidden" : ""}>Choose where you'll move first.</p>
       <button type="button" class="btn btn-primary btn-large btn-full${place ? "" : " is-inactive"}" aria-disabled="${place ? "false" : "true"}" aria-describedby="st-need" data-st-next>Next</button>`);
  }

  function readyScreen() {
    const name = (store.get("name") || "").trim();
    const areas = (store.get("conditions") || []).filter(id => START_AREAS.some(a => a.id === id));
    return frame(`
      <h1 id="st-h" tabindex="-1">Your first session${name ? `, ${esc(name)}` : ""}</h1>
      <p class="st-line">${esc(readyLine(place, areas))}</p>
      <div class="st-card">
        <svg class="st-fig" aria-hidden="true" width="120" height="96" viewBox="0 0 120 96" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="60" cy="16" r="9"/><path d="M60 25v30M60 34l-20 14M60 34l20 14M60 55l-14 30M60 55l14 30"/></svg>
        <p class="st-card__t">Whole body, gentle</p>
        <p class="st-card__s">About 20 minutes</p>
      </div>`,
      `<button type="button" class="btn btn-primary btn-large btn-full" data-st-go>Show me my session</button>
       <button type="button" class="btn btn-secondary btn-full st-later" data-st-home>Not now, take me Home</button>`);
  }

  function finish() {
    store.set("onboarding.flow", "short");
    store.set("onboarding.threadCompletedAt", new Date().toISOString());
    store.completeOnboarding();
  }

  function render() {
    if (!root) return;
    root.innerHTML = screen === "name" ? nameScreen() : screen === "sore" ? soreScreen() : screen === "where" ? whereScreen() : readyScreen();
    root.querySelector("#st-h")?.focus({ preventScroll: true });
    root.querySelector("[data-st-back]")?.addEventListener("click", back);

    root.querySelector("#st-name")?.addEventListener("keydown", e => { if (e.key === "Enter") root.querySelector("[data-st-next]")?.click(); });
    root.querySelectorAll("[data-area]").forEach(b => b.addEventListener("click", () => {
      const id = b.dataset.area, cur = new Set(store.get("conditions") || []);
      cur.has(id) ? cur.delete(id) : cur.add(id);
      store.set("conditions", [...cur]);
      const on = cur.has(id);
      b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", String(on));
      const any = START_AREAS.some(a => cur.has(a.id));
      const nb = root.querySelector("[data-st-next]"); if (nb) nb.textContent = any ? "Next" : "Nothing sore";
    }));
    root.querySelectorAll("[data-place]").forEach(b => b.addEventListener("click", () => {
      place = b.dataset.place; applyPlace(place); render();
      root.querySelector(`[data-place="${place}"]`)?.focus();
    }));
    root.querySelectorAll("[data-cap]").forEach(r => r.addEventListener("change", () => {
      const key = r.dataset.cap;
      store.set(`capability.${key}`, r.value);
      if (!store.get("capability.askedAt")) store.set("capability.askedAt", new Date().toISOString());
      if (key === "chairRise") {
        if (r.value === "yes") store.set("capability.legPower", null);
        render(); root.querySelector(`input[name="st-chairRise"][value="${r.value}"]`)?.focus();
      }
    }));
    root.querySelector("[data-st-next]")?.addEventListener("click", () => {
      if (screen === "name") { store.set("name", (root.querySelector("#st-name")?.value || "").trim().slice(0, 40)); next(); return; }
      if (screen === "where" && !place) { const n = root.querySelector("#st-need"); if (n) n.hidden = false; root.querySelector("[data-place]")?.focus(); return; }
      next();
    });
    root.querySelector("[data-st-go]")?.addEventListener("click", () => {
      finish();
      store.set("requestedSessionType", "full");
      // v2 (Wave 8): the place they chose, outside included, and the length the card says.
      store.set("requestedLocation", place === "outside" ? "outside" : (store.get("sessionLocation") || "home"));
      setTodaysLength("quick");   // about 20 minutes (time-windows.js); "short" was 30
      router.navigate("coach-proposal");
    });
    root.querySelector("[data-st-home]")?.addEventListener("click", () => { finish(); router.navigate("today"); });
  }

  return { mount };
}
