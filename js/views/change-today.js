/**
 * views/change-today.js
 * 15 Nov 2026 v2
 *
 * v2 - P-31 review (15 Nov). Free is sent to Home rather than shown a
 *   page about the Plan, as Build a session sends Free to its own screen
 *   (verify-one-look TEST 4: Free stays as it was). Free never sees the
 *   link, so this only matters for a stale address.
 *
 * v1 - 14 Nov 2026.
 *
 * P-31 CHANGE-TODAY (mock-up v5 approved by Graeme, 14 Nov: "Spec and build
 * the code"; spec docs/specs/alongside_little-and-often_change-today_15nov2026_v2.md).
 * Reached from Change today under the Plan's Today card.
 *
 * Screens, one at a time, each with its own h1 that takes focus:
 *   menu     Change today: Do it another day (when today has a session that
 *            has not moved), Catch up (on a day with no session, when an
 *            earlier one this week was not done), Little and often instead,
 *            Rest today (not on a rest day), Something else
 *   another  Which day instead? Each later day says what will happen there:
 *            "Swaps with Session C" or "Rest day · moves here"
 *   catch    Catch up which one? Earlier days this week, "Do it today"
 *
 * Every change is this week's only; Your week stays as planned. Home then
 * says what changed, with Undo beside it, and takes focus there. The rules
 * are data/week-changes.js. Nothing here keeps score.
 *
 * WCAG 2.2 AA: every choice is a real button with its words; ‹ Back on
 * every screen; after a change, Home puts focus on Undo, whose name says
 * what happened; nothing relies on colour.
 */

import { isPremium } from "../auth.js";
import { lineIcon } from "../data/line-icons.js";
import { DAY_NAMES } from "../data/week-shape-model.js";
import { todayInWeek } from "../data/week-shape.js";
import { anotherDayChoices, catchUpChoices, doAnotherDay, doCatchUp, setToday } from "../data/week-changes.js";

const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export function ChangeTodayView(router) {
  let root = null;
  let screen = "menu";

  function mount(container) {
    root = container;
    screen = "menu";
    render();
  }

  const header = back => `<div class="yw-header"><button class="btn btn-ghost yw-back plan-back" data-back="${back}" aria-label="Back${back === "home" ? " to Home" : ""}">‹ Back</button></div>`;

  const choice = (attrs, title, sub) => `<li><button type="button" class="path-door ct-choice" ${attrs}>
      <span class="path-door__text"><span class="path-door__t">${esc(title)}</span>${sub ? `<span class="path-door__d">${esc(sub)}</span>` : ""}</span>
      <span class="path-door__chev" aria-hidden="true">${lineIcon("chevron", 20)}</span></button></li>`;

  function menu() {
    const t = todayInWeek();
    const another = anotherDayChoices();
    const catchUp = catchUpChoices();
    const movedOnce = t?.template && t.change?.kind === "plan";
    return `${header("home")}
      <h1 class="yw-title" tabindex="-1">Change today</h1>
      <p class="yw-sub">Just for this week. Your week stays as you planned it.</p>
      <ul class="path-lao ct-list">
        ${t?.template && !movedOnce ? choice('data-go="another"', "Do it another day", another.length ? "Pick a day later this week" : "No days left this week") : ""}
        ${catchUp.length ? choice('data-go="catch"', "Catch up", "Do a session you missed earlier this week") : ""}
        ${choice('data-set="little"', "Little and often instead", "The short ones on Home")}
        ${t?.value === "rest" && !t.change ? "" : choice('data-set="rest"', "Rest today", "Rest counts")}
        ${choice('data-set="else"', "Something else", "The four ways in, or let the coach choose")}
      </ul>
      ${movedOnce ? `<p class="yw-note">${esc(t.template.name)} has moved once this week already, so it stays today.</p>` : ""}`;
  }

  function another() {
    const t = todayInWeek();
    const days = anotherDayChoices();
    return `${header("menu")}
      <h1 class="yw-title" tabindex="-1">Which day instead?</h1>
      <p class="yw-sub">${esc(t?.template?.name || "Today's session")} goes to the day you pick.</p>
      ${days.length ? `<ul class="path-lao ct-list">
        ${days.map(c => choice(`data-day="${c.day}"`, DAY_NAMES[c.day],
          c.kind === "swap" ? `Swaps with ${c.template.name}` : "Rest day · moves here")).join("")}
      </ul>` : `<p class="yw-note">There are no days left this week to move it to.</p>`}`;
  }

  function catchUp() {
    const days = catchUpChoices();
    return `${header("menu")}
      <h1 class="yw-title" tabindex="-1">Catch up which one?</h1>
      <p class="yw-sub">Only this week. Do it today if you'd like to. There's no need to.</p>
      <ul class="path-lao ct-list">
        ${days.map(c => choice(`data-catch="${c.day}"`, `${DAY_NAMES[c.day]}'s ${c.template.name}`, "Do it today")).join("")}
      </ul>`;
  }

  function render() {
    if (!root) return;
    if (!isPremium()) { router.navigate("today", { replace: true }); return; }
    const body = screen === "another" ? another() : screen === "catch" ? catchUp() : menu();
    root.innerHTML = `<div class="view yw-view">${body}</div>`;
    wire();
    root.querySelector(".yw-title")?.focus?.({ preventScroll: true });
  }

  function home() {
    router.homeFocus = "change";
    router.navigate("today");
  }

  function wire() {
    const $$ = s => [...root.querySelectorAll(s)];
    $$("[data-back]").forEach(b => b.addEventListener("click", () => {
      if (b.dataset.back === "home") router.navigate("today");
      else { screen = b.dataset.back; render(); }
    }));
    $$("[data-go]").forEach(b => b.addEventListener("click", () => { screen = b.dataset.go; render(); }));
    $$("[data-day]").forEach(b => b.addEventListener("click", () => { if (doAnotherDay(b.dataset.day)) home(); }));
    $$("[data-catch]").forEach(b => b.addEventListener("click", () => { if (doCatchUp(b.dataset.catch)) home(); }));
    $$("[data-set]").forEach(b => b.addEventListener("click", () => { if (setToday(b.dataset.set)) home(); }));
  }

  function onUnmount() { root = null; }

  return { mount, onUnmount };
}
