/**
 * js/hold-voice.js
 * 06 Nov 2026 v1
 *
 * P-28 EMPATHY-THREAD, S4. While you hold: the coach's line for a timed
 * hold (grounding-moments.js HOLD_LINES, wording A4 approved 05 Nov),
 * started by itself when the hold's timer starts, with one big Pause the
 * voice (Graeme, 05 Nov). Shared by the player (views/workout.js) and Yoga
 * & Pilates (views/yoga-session.js), both tiers.
 *
 * Only when the coach's voice is on (Settings › Display › Coach's voice,
 * off by default) and the line's file is there: with the voice off nothing
 * here shows or plays, and with no file the line is shown as words and
 * nothing speaks. A line is played once per hold, near its start, and not
 * on a hold shorter than the line. The second stretch of a cool-down gets
 * the later stretch line.
 */
import { selectHoldLine } from "./data/grounding-moments.js";
import { playLine, stopLine, voiceOn } from "./coach-audio.js";
import { lineIcon } from "./data/line-icons.js";

let _cur = null;          // { key, line, speaking, paused }
let _stretches = 0;       // stretch lines given in this session
let _session = null;

const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/** A new session: the stretch count starts again. */
export function resetHoldVoice(sessionKey = null) {
  stopLine(); _cur = null; _stretches = 0; _session = sessionKey;
}

/** The line for this hold, or null (voice off, nothing fits, too short). */
export function holdLineFor(exercise, holdSeconds) {
  if (!voiceOn()) return null;
  return selectHoldLine(exercise, { holdSeconds, later: _stretches > 0 });
}

function _sync() {
  const card = document.getElementById("hv-card"), b = document.getElementById("hv-pause"), spk = document.getElementById("hv-spk");
  if (!card) return;
  if (spk) spk.hidden = !(_cur && _cur.speaking);
  if (b) {
    b.hidden = !(_cur && (_cur.speaking || _cur.paused));
    b.disabled = !!(_cur && _cur.paused);
    b.textContent = _cur && _cur.paused ? "Voice paused" : "Pause the voice";
  }
}

/** The timer started: the line plays by itself, once for this hold (key). */
export function startHoldVoice(exercise, holdSeconds, key) {
  if (_cur && _cur.key === key) return;     // resumed, not a new hold
  const line = holdLineFor(exercise, holdSeconds);
  if (!line) { stopLine(); _cur = null; return; }
  if (line.id.startsWith("stretch")) _stretches++;
  _cur = { key, line, speaking: false, paused: false };
  playLine(line.audio, {
    title: "While you hold",
    onPlaying: () => { if (_cur && _cur.line === line) { _cur.speaking = true; _sync(); } },
    onEnd: () => { if (_cur && _cur.line === line) { _cur.speaking = false; _sync(); } },
  });
}

/** Leaving the hold (next exercise, exit): quiet. */
export function stopHoldVoice() { stopLine(); _cur = null; }

/** The card under the timer, while this hold's line is current. */
export function renderHoldVoice(key) {
  if (!_cur || _cur.key !== key) return "";
  return `<div class="card instep-card hv-card" id="hv-card">
      <p class="instep-eyebrow">${lineIcon("instep", 18)}<span>While you hold</span></p>
      <p class="instep-speaking" id="hv-spk"${_cur.speaking ? "" : " hidden"}><span class="instep-dots" aria-hidden="true"><i></i><i></i><i></i></span>Speaking</p>
      <p>${esc(_cur.line.text)}</p>
      <button type="button" class="btn btn-primary btn-large btn-full instep-pause" id="hv-pause"${_cur.speaking || _cur.paused ? "" : " hidden"}${_cur.paused ? " disabled" : ""}>${_cur.paused ? "Voice paused" : "Pause the voice"}</button>
    </div>`;
}

/** Wires the card's Pause the voice (call after each render). */
export function wireHoldVoice(root = document) {
  root.querySelector?.("#hv-pause")?.addEventListener("click", () => {
    stopLine(); if (_cur) { _cur.speaking = false; _cur.paused = true; } _sync();
  });
}
