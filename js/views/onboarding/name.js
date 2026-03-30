/**
 * name.js - Onboarding Step 1: Name input
 *
 * v1.1 — Coach line added above input field.
 */

import { store } from "../../store.js";

export const centered = false;

export function render() {
  const name = store.get("name") || "";

  return `
    <div class="onboarding-view">
      <div class="onboarding-header">
        <button class="btn btn-ghost" onclick="router.navigate('onboarding/welcome')"
                aria-label="Back">Back</button>
        <div class="progress-dots" aria-label="Step 1 of 7">
          <span class="dot active"    aria-hidden="true"></span>
          <span class="dot"           aria-hidden="true"></span>
          <span class="dot"           aria-hidden="true"></span>
          <span class="dot"           aria-hidden="true"></span>
          <span class="dot"           aria-hidden="true"></span>
          <span class="dot"           aria-hidden="true"></span>
          <span class="dot"           aria-hidden="true"></span>
        </div>
      </div>

      <div class="onboarding-content">
        <h1>Your name</h1>
        ${coachLine("Let's start with the most important thing. What should I call you?")}

        <div class="input-group">
          <input
            type="text"
            id="user-name"
            class="input-field"
            placeholder="Your name"
            autocomplete="given-name"
            value="${name}"
            aria-label="Your first name"
          >
        </div>
      </div>

      <div class="onboarding-actions">
        <button class="btn btn-primary btn-large btn-full" onclick="saveName()">
          Continue
        </button>
      </div>
    </div>
  `;
}

export function onMount() {
  setTimeout(() => {
    const input = document.getElementById("user-name");
    if (input) input.focus();
  }, 100);

  document.getElementById("user-name")?.addEventListener("keypress", e => {
    if (e.key === "Enter") saveName();
  });
}

window.saveName = function() {
  const input = document.getElementById("user-name");
  const name  = input?.value.trim();

  if (!name) {
    input?.focus();
    input?.classList.add("error");
    return;
  }

  store.set("name", name);
  router.navigate("onboarding/about");
};

function coachLine(text) {
  return `
    <div class="onboarding-coach-line">
      <img src="assets/images/logo-icon-small.png" alt="" class="coach-icon-small" aria-hidden="true">
      <p class="onboarding-coach-text">${text}</p>
    </div>
  `;
}
