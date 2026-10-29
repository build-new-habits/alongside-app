/**
 * views/day-open.js
 * 28 Oct 2026 v1
 *
 * STAGE PATH P-4 (blueprint Session 4, spec §2 layer 1, store C1 dayOpen).
 * The first time the Plan opens each day: how are you doing? Three ways on,
 * and nothing else on the screen:
 *   - Check in: the three questions, then Home with today's suggestion;
 *   - Just pick something for me: Home, with the coach's steady one;
 *   - Not now: Home, which asks once more (Want to check in now?) and never
 *     again that day.
 * Whichever is chosen is remembered for the day (store.setDayOpen). Home
 * (today.js) sends the Plan here when the app opens cold (nothing behind
 * it) and today has no answer yet and no check-in. Somebody who reached
 * Home from inside the app stays there (EXIT-HOME), and Home's own card
 * asks How are you doing? Free is never sent, and is sent back to Home if
 * it arrives.
 *
 * Mock-up v9, approved 28 Oct. The Lately tiles (mood before and after,
 * this week) come with Progress, Session 7 (P-7), which draws them for this
 * screen and for Progress from one place (a touch-once exception for this
 * file, in the blueprint).
 */
import { store } from "../store.js";
import { isPremium } from "../auth.js";
import { lineIcon } from "../data/line-icons.js";
import { arcLineHTML } from "./plan-home.js";

const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function greeting() {
  const h = new Date().getHours();
  const when = h < 12 ? "Morning" : h < 17 ? "Afternoon" : "Evening";
  const raw = String(store.get("name") || "").trim();
  const name = raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : "";
  return name ? `${when}, ${name}.` : `${when}.`;
}

export function DayOpenView(router) {
  function mount(container) {
    if (!isPremium()) { router.navigate("today", { replace: true }); return; }
    if (!store.dayOpenToday()) store.setDayOpen(null);   // shown today (C1)
    container.innerHTML = `
      <div class="path-home path-dayopen">
        <h1 class="path-greeting" tabindex="-1">${esc(greeting())}</h1>
        ${arcLineHTML()}
        <section class="path-today k-teal" data-state="first" aria-labelledby="path-today-h">
          <div class="path-today__head"><span class="kind-tile k-teal">${lineIcon("chat")}</span>
            <div class="path-today__titles"><p class="path-today__eyebrow">First thing today</p><h2 class="path-today__title" id="path-today-h">How are you doing?</h2></div></div>
          <p class="path-today__coach">Three quick taps. It helps me suggest the right thing today, and over time it shows you what helps.</p>
          <button type="button" class="btn btn-primary btn-full path-today__go" data-day="checked">Check in</button>
          <button type="button" class="btn btn-secondary btn-full" data-day="pick">Just pick something for me</button>
          <button type="button" class="path-today__link" data-day="not-now">Not now</button>
        </section>
      </div>`;
    container.querySelectorAll("[data-day]").forEach(btn => btn.addEventListener("click", () => {
      const choice = btn.dataset.day;
      store.setDayOpen(choice);
      router.navigate(choice === "checked" ? "checkin" : "today");
    }));
    container.querySelector(".path-greeting")?.focus({ preventScroll: true });
  }
  return { mount };
}
