/**
 * js/views/red-flag.js
 * 28 Sep 2026 v1
 *
 * RED-FLAG. The "before you start" safety screen and its stop. The
 * rules, the wording and the reasons are in js/data/red-flag.js; this
 * file only shows them.
 *
 * Three phases:
 *   ask     the three questions, one answer each (No / Yes / I'm not
 *           sure), nothing preselected. Continue is never disabled: an
 *           unanswered question says so and takes focus (3.3.1).
 *   stop    the message for the level, a way to call, the unconditional
 *           emergency line, what is still open (Wellbeing), and the
 *           self-clear with its confirmation.
 *   (clear) nothing flagged: straight on to where they were going.
 *
 * REGISTER. This is deliberately the one place in the product that
 * sounds like this (review pack, 16 Aug). Plain, short, no warmth that
 * could read as "it's probably fine", no alarm beyond what the answer
 * calls for.
 *
 * Keyboard and screen reader: each question is a radiogroup built from
 * native radio inputs, so arrow keys and the announced state are the
 * browser's own. Headings in order; focus moves to the heading of each
 * phase.
 */

import {
  RED_FLAG_QUESTIONS, RED_FLAG_ANSWERS, RED_FLAG_INTRO, RED_FLAG_ALWAYS,
  RED_FLAG_MESSAGES, RED_FLAG_CLEAR_CONFIRM,
  redFlagStop, recordScreen, clearRedFlag, takePendingRoute,
} from "../data/red-flag.js";

export function RedFlagView(router) {
  let answers = {};
  let error   = "";
  let clearError = "";

  function mount(container) {
    const stop = redFlagStop();
    container.innerHTML = stop ? renderStop(stop) : renderAsk();
    stop ? attachStop(container) : attachAsk(container);
    container.querySelector("h1")?.focus();
  }

  function renderAsk() {
    return `
      <div class="view rf-view" role="main" aria-labelledby="rf-title">
        <h1 class="rf-title" id="rf-title" tabindex="-1">Before you start</h1>
        <p class="rf-intro">${RED_FLAG_INTRO}</p>
        <form class="rf-form" novalidate>
          ${RED_FLAG_QUESTIONS.map((q, i) => `
            <fieldset class="rf-q" id="rf-${q.id}">
              <legend class="rf-q__text"><span class="rf-q__n">${i + 1}.</span> ${q.text}</legend>
              <div class="rf-q__answers">
                ${RED_FLAG_ANSWERS.map(a => `
                  <label class="rf-answer">
                    <input type="radio" name="${q.id}" value="${a.v}" ${answers[q.id] === a.v ? "checked" : ""}>
                    <span>${a.l}</span>
                  </label>`).join("")}
              </div>
            </fieldset>`).join("")}
          <p class="rf-error" id="rf-error" role="alert">${error}</p>
          <button type="submit" class="btn btn-primary btn-large btn-full" id="rf-continue">Continue</button>
        </form>
        <p class="rf-always">${RED_FLAG_ALWAYS}</p>
      </div>`;
  }

  function attachAsk(container) {
    const form = container.querySelector(".rf-form");
    form?.addEventListener("change", e => {
      if (e.target.name) answers[e.target.name] = e.target.value;
    });
    form?.addEventListener("submit", e => {
      e.preventDefault();
      const missing = RED_FLAG_QUESTIONS.find(q => !answers[q.id]);
      if (missing) {
        error = "Please answer each question. “I’m not sure” is a fine answer.";
        const el = container.querySelector("#rf-error");
        if (el) el.textContent = error;
        container.querySelector(`#rf-${missing.id} input`)?.focus();
        return;
      }
      error = "";
      const level = recordScreen(answers);
      if (level) { mount(container); return; }
      router.navigate(takePendingRoute() || "today");
    });
  }

  function renderStop(level) {
    const m = RED_FLAG_MESSAGES[level];
    const call = level === "emergency"
      ? `<a class="btn btn-primary btn-large btn-full rf-call" href="tel:999">Call 999</a>`
      : `<a class="btn btn-primary btn-large btn-full rf-call" href="tel:111">Call NHS 111</a>`;
    return `
      <div class="view rf-view rf-view--stop" role="main" aria-labelledby="rf-title">
        <h1 class="rf-title" id="rf-title" tabindex="-1">${m.title}</h1>
        <p class="rf-body">${m.body}</p>
        ${call}
        <p class="rf-always">${RED_FLAG_ALWAYS}</p>
        <p class="rf-still">Exercise is paused until you've been checked. Breathing and quiet practices in Wellbeing are still here if they help.</p>
        <button class="btn btn-secondary btn-full" id="rf-wellbeing">Go to Wellbeing</button>
        <button class="btn btn-ghost btn-full" id="rf-home">Home</button>

        <details class="rf-clear">
          <summary class="rf-clear__summary">I've been checked since</summary>
          <label class="rf-clear__confirm" for="rf-clear-box">
            <input type="checkbox" id="rf-clear-box">
            <span>${RED_FLAG_CLEAR_CONFIRM}</span>
          </label>
          <p class="rf-error" id="rf-clear-error" role="alert">${clearError}</p>
          <button class="btn btn-secondary btn-full" id="rf-clear-btn">Carry on exercising</button>
        </details>
      </div>`;
  }

  function attachStop(container) {
    container.querySelector("#rf-wellbeing")?.addEventListener("click", () => router.navigate("noticing"));
    container.querySelector("#rf-home")?.addEventListener("click", () => router.navigate("today"));
    const box = container.querySelector("#rf-clear-box");
    box?.addEventListener("change", () => {
      clearError = "";
      const el = container.querySelector("#rf-clear-error");
      if (el) el.textContent = "";
    });
    container.querySelector("#rf-clear-btn")?.addEventListener("click", () => {
      if (!box?.checked) {
        clearError = "Please confirm you've been checked before carrying on.";
        const el = container.querySelector("#rf-clear-error");
        if (el) el.textContent = clearError;
        box?.focus();
        return;
      }
      clearRedFlag();
      router.navigate(takePendingRoute() || "today");
    });
  }

  function onUnmount() { answers = {}; error = ""; clearError = ""; }

  return { mount, onUnmount };
}
