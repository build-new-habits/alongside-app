/**
 * tts.js - Text-to-Speech module
 *
 * Provides read-aloud for coach cards using the Web Speech API
 * (window.speechSynthesis). Built into every modern mobile browser.
 * No server, no cost, no external dependency.
 *
 * Design principles:
 *   - User-initiated only. Never autoplays.
 *   - One card plays at a time. Starting a new one cancels the previous.
 *   - Rate is read from store on every speak() call so changes take
 *     effect immediately without a page reload.
 *   - Strips HTML tags before speaking so markup is never read aloud.
 *   - Stops automatically on page navigation (router calls tts.stop()).
 *   - Respects the device voice and language. No voice selection UI yet.
 *
 * Speed options (stored as store key "speechRate"):
 *   0.75 = Slow    (processing time, reading difficulty)
 *   0.9  = Normal  (default — slightly slower than browser default of 1)
 *   1.2  = Fast    (confident readers who want efficiency)
 *
 * Accessibility:
 *   - Speaker buttons have aria-label "Listen to coach message" /
 *     "Stop reading" depending on state.
 *   - #tts-status is an aria-live="polite" region that announces
 *     "Playing" and "Stopped" to screen readers.
 *   - The icon itself is aria-hidden="true" — the label carries meaning.
 *   - This is ADDITIVE to VoiceOver/TalkBack, not a replacement.
 *     Screen reader users will have their AT read content already.
 *
 * Usage:
 *   import { tts } from "../tts.js";
 *   tts.speak("Hello, here is your coach message.");
 *   tts.stop();
 *   tts.mountButtons(); // call after each view render
 */

import { store } from "./store.js";

// ── Speed presets ─────────────────────────────────────────────────────────────
export const SPEECH_RATES = [
  { value: 0.75, label: "Slow",   description: "More time to process" },
  { value: 0.9,  label: "Normal", description: "Default" },
  { value: 1.2,  label: "Fast",   description: "Quick and efficient" }
];

// ── Module state ──────────────────────────────────────────────────────────────
let _activeButton = null;   // the button currently playing
let _utterance    = null;   // current SpeechSynthesisUtterance

export const tts = {

  /**
   * Is the Web Speech API available on this device?
   * Called before any TTS operation.
   */
  isSupported() {
    return "speechSynthesis" in window;
  },

  /**
   * Speak a piece of text.
   * Strips HTML, reads at user's chosen rate.
   * Cancels any currently playing speech first.
   *
   * @param {string} text        - text or HTML to read aloud
   * @param {HTMLElement} button - the button that triggered this (for state)
   */
  speak(text, button) {
    if (!this.isSupported()) return;

    // Cancel anything already playing
    this.stop();

    // Strip HTML tags so we never read markup aloud
    const clean = text.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    if (!clean) return;

    const rate = store.get("speechRate") || 0.9;

    _utterance        = new SpeechSynthesisUtterance(clean);
    _utterance.rate   = rate;
    _utterance.pitch  = 1;
    _utterance.volume = 1;

    // When speech ends naturally, reset the button state
    _utterance.onend = () => {
      this._resetButton(button);
      this._announce("Stopped");
      _activeButton = null;
      _utterance    = null;
    };

    _utterance.onerror = () => {
      this._resetButton(button);
      _activeButton = null;
      _utterance    = null;
    };

    // Set the button to playing state
    _activeButton = button;
    this._setPlayingState(button, true);
    this._announce("Playing");

    window.speechSynthesis.speak(_utterance);
  },

  /**
   * Stop any currently playing speech.
   * Called by router on navigation, and when user taps stop.
   */
  stop() {
    if (!this.isSupported()) return;
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    if (_activeButton) {
      this._resetButton(_activeButton);
      _activeButton = null;
    }
    _utterance = null;
  },

  /**
   * Mount speaker buttons on all .card-coach elements in the current view.
   * Called by the router after every navigation.
   *
   * Injects a speaker button into the top-right of each coach card.
   * The button reads the text content of the card's first <p> tag.
   *
   * Safe to call multiple times — checks for existing buttons first.
   */
  mountButtons() {
    if (!this.isSupported()) return;

    document.querySelectorAll(".card-coach").forEach(card => {
      // Do not double-mount
      if (card.querySelector(".tts-btn")) return;

      // Find the text to read — first <p> in the card
      const textEl = card.querySelector("p");
      if (!textEl) return;

      const btn = document.createElement("button");
      btn.className   = "tts-btn";
      btn.setAttribute("aria-label", "Listen to coach message");
      btn.setAttribute("type", "button");
      btn.innerHTML   = `<span class="tts-icon" aria-hidden="true">&#128266;</span>`;

      btn.addEventListener("click", () => {
        if (_activeButton === btn) {
          // Already playing this card — stop it
          this.stop();
          this._announce("Stopped");
        } else {
          // Read this card
          this.speak(textEl.innerHTML, btn);
        }
      });

      // Insert into card — position: absolute top-right (CSS handles placement)
      card.style.position = "relative";
      card.appendChild(btn);
    });
  },

  // ── Private helpers ─────────────────────────────────────────────────────────

  _setPlayingState(button, playing) {
    if (!button) return;
    if (playing) {
      button.innerHTML = `<span class="tts-icon tts-icon--playing" aria-hidden="true">&#9632;</span>`;
      button.setAttribute("aria-label", "Stop reading");
      button.classList.add("tts-btn--playing");
    } else {
      button.innerHTML = `<span class="tts-icon" aria-hidden="true">&#128266;</span>`;
      button.setAttribute("aria-label", "Listen to coach message");
      button.classList.remove("tts-btn--playing");
    }
  },

  _resetButton(button) {
    this._setPlayingState(button, false);
  },

  /**
   * Announce play/stop state to screen readers via the aria-live region.
   * The #tts-status element is created once in index.html.
   */
  _announce(message) {
    const el = document.getElementById("tts-status");
    if (!el) return;
    el.textContent = "";
    setTimeout(() => { el.textContent = message; }, 50);
  }
};

// Make tts available globally so workout.js and other views can access it
// without needing to import the module directly.
window.tts = tts;
