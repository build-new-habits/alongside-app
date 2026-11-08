/**
 * js/views/guide-me.js
 * 08 Nov 2026 v3
 *
 * v3 - Opening a session reads the recordings' list again, so a recording
 *   uploaded while the app was open is found (Graeme, 08 Nov).
 *
 * v2 - The recording is there when the recordings' list names it
 *   (audio/manifest.json, coach-audio.js v3), and is asked for with its
 *   fingerprint, so a re-made track reaches phones. It no longer tries to
 *   load the file to find out.
 *
 * P-28 EMPATHY-THREAD, S4 GUIDE ME. Graeme, 05 Nov ("Yes, mock that up";
 * "All of the above"), played as the approved prototype v5 plays it.
 *
 *   What will happen  the session's own words before you start (when the
 *                     voice speaks, headphones, the lock screen), and each
 *                     moment with its time. No surprises.
 *   Guiding           ONE continuous recording (audio/<track>.mp3), so it
 *                     keeps going with the screen locked. The screen follows
 *                     the file's currentTime and shows each moment's words
 *                     when its time comes. Pause and Carry on here and on the
 *                     lock screen (Media Session); Stop and finish.
 *   The end           logged as the activity, with guideMe "guide" (Schema
 *                     v1.123), and on to the finish.
 *
 * Chosen each time: Guide me never drops into music uninvited, and nothing
 * speaks on a road ride (the door offers the ride indoors only). Where the
 * browser has the Audio Session API the session is "playback", so music
 * pauses rather than being talked over.
 *
 * TEXT FIRST. Until the recording exists, the clock runs on its own and the
 * words appear at their times; the screen says plainly that nothing will
 * speak. A missing file is never an error.
 *
 * A web app cannot reliably time a drop-in with the screen locked, vibrate
 * on an iPhone, or lower music on every phone; one recording is the route
 * that works everywhere. A native app later could add those.
 */
import { store }    from "../store.js";
import { router }   from "../router.js";
import { isPremium } from "../auth.js";
import { lineIcon } from "../data/line-icons.js";
import { GUIDE_SESSIONS, momentAt } from "../data/guide-me.js";
import { loadAudioManifest, hasLine, audioUrl } from "../coach-audio.js";

export const centered = false;

const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
/** The log's own word for each activity (Log what I did). */
const LOG_TYPE = { walk: "walk", run: "run", bike: "cycle" };

let _pending = null;   // { id, activity, ret } from the door
let sessionId = null;
let activity = null;
let phase = "intro";
let ret = null;
let audio = null;
let hasFile = false;
let t = 0;
let paused = false;
let ticker = null;
let lastTick = 0;
let startedAt = null;
let _internal = false;

/** The door's Guide me: which session, for which activity (walk, run, bike). */
export function openGuideMe(id, { activity: a = null, ret: r = null } = {}) {
  _pending = GUIDE_SESSIONS[id] ? { id, activity: a, ret: r } : null;
}

function S() { return GUIDE_SESSIONS[sessionId]; }

function _stopAll() {
  if (ticker) { clearInterval(ticker); ticker = null; }
  if (audio) { try { audio.pause(); } catch { /* */ } audio = null; }
  try { if (navigator.mediaSession) navigator.mediaSession.playbackState = "none"; } catch { /* */ }
}

// ── Screens ─────────────────────────────────────────────────────────────
function shell(inner) { return `<div class="view in-step-view guide-me-view${isPremium() ? " is-plan" : ""}">${inner}</div>`; }
const eyebrow = `<p class="instep-eyebrow">${lineIcon("instep", 18)}<span>In Step</span></p>`;
const atWords = m => m.at === 0 ? "Start" : `${Math.round(m.at / 60)} min`;
const firstSentence = text => text.split(". ")[0].replace(/\.$/, "") + ".";

function renderIntro() {
  const s = S();
  const back = isPremium()
    ? `<button type="button" class="btn btn-ghost plan-back" id="gm-back" aria-label="Back to the choices">‹ Back</button>`
    : `<button type="button" class="btn btn-ghost" id="gm-back" aria-label="Back to the choices">← Back</button>`;
  return shell(`
    <div class="workout-header instep-bar">${back}${eyebrow}</div>
    <h1 tabindex="-1">${esc(s.title)}</h1>
    <p class="instep-intro">${esc(s.before)}</p>
    <ol class="gm-plan" aria-label="When I'll speak">${s.moments.map(m => `<li><span class="gm-plan__t">${atWords(m)}</span><span>${esc(firstSentence(m.text))}</span></li>`).join("")}</ol>
    <p class="instep-small" id="gm-nofile" hidden>The recording isn't here yet, so nothing will speak: the words will show at their times.</p>
    <button type="button" class="btn btn-primary btn-large btn-full" id="gm-start">Start, ${s.mins} minutes</button>`);
}

function renderGuide() {
  const s = S(), cur = momentAt(s, t);
  const exit = `<button type="button" class="btn btn-ghost${isPremium() ? " plan-exit" : ""}" id="gm-exit">Exit</button>`;
  return shell(`
    <div class="workout-header instep-bar">${exit}${eyebrow}</div>
    <h1 tabindex="-1">${esc(s.title)}</h1>
    <p class="gm-clock" id="gm-clock" aria-hidden="true">${mmss(t)}</p>
    <p class="sr-only" id="gm-clock-sr">${Math.floor(t / 60)} of ${s.mins} minutes</p>
    <div class="card instep-card instep-said"><p id="gm-said" aria-live="polite">${esc(cur ? cur.text : "")}</p></div>
    <ol class="gm-plan" id="gm-plan" aria-label="When I'll speak">${s.moments.map((m, i) => `<li id="gm-m${i}" class="${cur && m.at < cur.at ? "is-done" : ""}${cur && m.at === cur.at ? " is-now" : ""}"><span class="gm-plan__t">${atWords(m)}</span><span>${esc(firstSentence(m.text))}</span></li>`).join("")}</ol>
    <div class="instep-row">
      <button type="button" class="btn btn-primary" id="gm-pp">${paused ? "Carry on" : "Pause"}</button>
      <button type="button" class="btn btn-secondary" id="gm-end">Stop and finish</button>
    </div>`);
}

export function render() {
  if (_pending) { _stopAll(); sessionId = _pending.id; activity = _pending.activity; ret = _pending.ret; _pending = null; phase = "intro"; t = 0; paused = false; }
  if (!S()) {
    phase = "intro";
    const back = isPremium() ? `<button type="button" class="btn btn-ghost plan-back" id="gm-home" aria-label="Back to Home">‹ Back</button>` : `<button type="button" class="btn btn-ghost" id="gm-home" aria-label="Back to Home">← Back</button>`;
    return shell(`<div class="workout-header instep-bar">${back}</div><h1 tabindex="-1">Guide me</h1><p class="instep-intro">Choose a walk, a run or an indoor ride from Keep moving › Outside.</p>`);
  }
  return phase === "guide" ? renderGuide() : renderIntro();
}

function go(next) {
  phase = next;
  const main = document.getElementById("main-content");
  if (!main) return;
  _internal = true;
  try { main.innerHTML = render(); } finally { _internal = false; }
  onMount();
}

// ── The recording ───────────────────────────────────────────────────────
function _probe(cb) {
  const s = S(); hasFile = false; audio = null;
  loadAudioManifest().then(() => {
    if (S() !== s) return;
    hasFile = hasLine(s.track);
    if (hasFile && typeof Audio !== "undefined") {
      try { audio = new Audio(audioUrl(s.track)); audio.preload = "auto"; } catch { hasFile = false; audio = null; }
    }
    cb(hasFile);
  });
}

function _mediaSession() {
  const s = S();
  try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch { /* optional */ }
  try {
    const ms = navigator.mediaSession; if (!ms) return;
    if (typeof MediaMetadata !== "undefined") ms.metadata = new MediaMetadata({ title: s.title, artist: "Alongside · In Step" });
    ms.setActionHandler?.("play", () => { if (paused) toggle(); });
    ms.setActionHandler?.("pause", () => { if (!paused) toggle(); });
    ms.setActionHandler?.("stop", () => finish());
    ms.playbackState = "playing";
  } catch { /* optional */ }
}

function _paint() {
  const s = S(); if (!s) return;
  const c = document.getElementById("gm-clock"); if (c) c.textContent = mmss(t);
  const sr = document.getElementById("gm-clock-sr"); if (sr) sr.textContent = `${Math.floor(t / 60)} of ${s.mins} minutes`;
  const cur = momentAt(s, t);
  const said = document.getElementById("gm-said");
  if (said && cur && said.textContent !== cur.text) said.textContent = cur.text;
  s.moments.forEach((m, i) => { const li = document.getElementById("gm-m" + i); if (li) { li.classList.toggle("is-done", !!cur && m.at < cur.at); li.classList.toggle("is-now", !!cur && m.at === cur.at); } });
  try { navigator.mediaSession?.setPositionState?.({ duration: s.mins * 60, position: Math.min(t, s.mins * 60), playbackRate: 1 }); } catch { /* */ }
}

function _advance() {
  const now = Date.now();
  if (audio && hasFile) t = audio.currentTime || 0;
  else if (!paused) t += (now - lastTick) / 1000;
  lastTick = now;
}

function _tick() {
  const s = S(); if (!s) return;
  _advance();
  _paint();
  if (t >= s.mins * 60 && !hasFile) finish(true);
}

function startGuide() {
  startedAt = new Date().toISOString(); t = 0; paused = false;
  go("guide");
  _mediaSession();
  if (audio && hasFile) {
    audio.addEventListener("ended", () => finish(true));
    try { const p = audio.play(); p?.catch?.(() => { hasFile = false; }); } catch { hasFile = false; }
  }
  lastTick = Date.now();
  ticker = setInterval(_tick, 250);
}

function toggle() {
  paused = !paused;
  if (audio && hasFile) { try { paused ? audio.pause() : audio.play(); } catch { /* */ } }
  lastTick = Date.now();
  try { if (navigator.mediaSession) navigator.mediaSession.playbackState = paused ? "paused" : "playing"; } catch { /* */ }
  const b = document.getElementById("gm-pp"); if (b) b.textContent = paused ? "Carry on" : "Pause";
}

/** Logged as the activity, with how it was taken, then the finish. */
function finish(toEnd = false) {
  const s = S(); if (!s || phase !== "guide") return;
  _advance(); _stopAll();
  const mins = Math.max(1, Math.round(t / 60));
  const nowIso = new Date().toISOString();
  const type = LOG_TYPE[activity] || (s.id === "ride" ? "cycle" : s.id === "run" ? "run" : "walk");
  const created = store.logActivity({
    id: "gm-" + Date.now(), type, name: s.title, source: "guide-me",
    status: toEnd || t >= s.mins * 60 - 1 ? "completed" : "partial",
    durationMins: mins, guideMe: "guide", startedAt, completedAt: nowIso, sessionEnd: nowIso,
  });
  if (created) store.set("currentActivityEntry", created);
  phase = "intro"; sessionId = null;
  router.navigate(isPremium() ? "plan-finish" : "reflect");
}

export function onMount() {
  const root = document.querySelector(".guide-me-view"); if (!root) return;
  root.querySelector("h1")?.focus?.();
  root.querySelector("#gm-home")?.addEventListener("click", () => router.navigate("today"));
  if (phase === "intro" && S()) {
    _probe(ok => { const n = document.getElementById("gm-nofile"); if (n) n.hidden = ok; });
    // ‹ Back: the door's steps, as they were left (path.js reads pathReturn).
    root.querySelector("#gm-back")?.addEventListener("click", () => { _stopAll(); router.pathReturn = ret; router.navigate(ret ? "path" : "today"); });
    root.querySelector("#gm-start")?.addEventListener("click", startGuide);
  }
  if (phase === "guide") {
    root.querySelector("#gm-pp")?.addEventListener("click", toggle);
    root.querySelector("#gm-end")?.addEventListener("click", () => finish(false));
    root.querySelector("#gm-exit")?.addEventListener("click", () => finish(false));
  }
}

/** Leaving by the bottom bar: the recording stops, and nothing is logged. */
export function onUnmount() {
  if (phase === "guide") { _stopAll(); phase = "intro"; }
}

/** For checks: where the clock is. */
export function _state() { return { phase, t, paused, hasFile, sessionId, activity }; }
