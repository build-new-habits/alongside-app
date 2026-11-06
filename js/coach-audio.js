/**
 * js/coach-audio.js
 * 06 Nov 2026 v3
 *
 * v3 - THE RECORDINGS' LIST (audio/manifest.json, written by
 *   tools/build-audio.mjs when the recordings are built). It says which
 *   lines have a file, and each file's fingerprint:
 *     { "files": { "instep-p1-e1-listen": "3fa9c2...", "guide-walk": "..." } }
 *   - A line is asked for only when the list names it: nothing is requested
 *     that is not there, and until the recordings arrive nothing speaks and
 *     the words are on screen.
 *   - Each file is asked for as audio/<id>.mp3?v=<fingerprint>, so a
 *     re-recorded line reaches phones at once instead of the copy they
 *     kept (sw.js v712 keeps one copy per line, the newest).
 *   - The list is read when the app opens, and kept for offline use by the
 *     service worker. hasLine(id) says whether a line has a file.
 *
 * v2 - P-28 FINISH. prefetchLines(): with the voice on, a part's clips are
 *   fetched when one of its episodes opens (build blueprint: "fetched when
 *   a part or session is first opened, then kept in a separate cache";
 *   sw.js v710 keeps them). Each clip once per page load; a missing one is
 *   ignored. With the voice off, nothing is fetched.
 *
 * P-28 EMPATHY-THREAD, S3. The coach's recorded voice, text first.
 *
 * Every spoken line has an id (the voice script's clip name, without
 * .mp3). playLine(id) plays audio/<id>.mp3 when, and only when:
 *   - the coach's voice is on (store.coachVoice === "on"; off by default,
 *     Settings › Display › Coach's voice arrives in S4), and
 *   - the file is there. A missing file is never an error: the line is on
 *     screen as text whatever happens, and nothing speaks.
 * No AI in the app (Graeme, 05 Oct): the files are made once in
 * ElevenLabs. The phone's own synthetic voice, the prototype's stand-in,
 * is never used here.
 *
 * Callers show "Pause the voice" only once the line is actually playing
 * (onPlaying), so a missing file shows no control that does nothing.
 *
 * Where the browser has the Audio Session API, the session is "playback",
 * so music pauses rather than being talked over; where it does not,
 * nothing breaks. One line plays at a time: starting one stops the last.
 */
import { store } from "./store.js";

let _current = null;   // { audio, id }

// ── The recordings' list ─────────────────────────────────────────────
export const MANIFEST_URL = "audio/manifest.json";
let _files = {};          // id -> fingerprint
let _loading = null;

/** Reads the list (again when asked). Never throws; no list is an empty one. */
export function loadAudioManifest() {
  if (typeof fetch !== "function") return Promise.resolve(_files);
  _loading = (async () => {
    try {
      const r = await fetch(MANIFEST_URL, { cache: "no-cache" });
      if (r && r.ok) {
        const j = await r.json();
        const f = j && typeof j.files === "object" && j.files ? j.files : {};
        _files = Object.fromEntries(Object.entries(f).filter(([k, v]) =>
          /^[a-z0-9-]+$/.test(k) && typeof v === "string" && /^[0-9a-f]{6,64}$/.test(v)));
      }
    } catch { /* offline with no kept list: nothing plays, the words show */ }
    return _files;
  })();
  return _loading;
}
/** Resolves once the list has been read (the first read starts when the app opens). */
export function audioReady() { return _loading || loadAudioManifest(); }
/** Whether this line has a recording. */
export function hasLine(id) { return !!(id && _files[id]); }
loadAudioManifest();

/** Whether the coach's voice is on (Settings). */
export function voiceOn() {
  return store.get("coachVoice") === "on";
}

/** Where a line's file lives, with its fingerprint when the list has one. */
export function audioUrl(id) {
  return `audio/${id}.mp3` + (_files[id] ? `?v=${_files[id]}` : "");
}

function _session() {
  try {
    if (typeof navigator !== "undefined" && navigator.audioSession) navigator.audioSession.type = "playback";
  } catch { /* the API is optional */ }
}

/**
 * Plays a line if the voice is on. Returns a handle { stop } or null when
 * nothing will play. onPlaying fires when sound actually starts; onEnd
 * fires when it ends, is stopped, or could not play (no file).
 */
export function playLine(id, { onPlaying, onEnd, title = "In Step" } = {}) {
  stopLine();
  if (!id || !voiceOn() || !hasLine(id) || typeof Audio === "undefined") return null;
  let ended = false;
  const finish = () => { if (ended) return; ended = true; if (_current && _current.id === id) _current = null; onEnd?.(); };
  let audio;
  try { audio = new Audio(audioUrl(id)); } catch { return null; }
  _current = { audio, id, finish };
  audio.addEventListener("playing", () => onPlaying?.());
  audio.addEventListener("ended", finish);
  audio.addEventListener("error", finish);
  _session();
  try {
    if (typeof navigator !== "undefined" && navigator.mediaSession && typeof MediaMetadata !== "undefined") {
      navigator.mediaSession.metadata = new MediaMetadata({ title, artist: "Alongside" });
    }
  } catch { /* optional */ }
  try {
    const p = audio.play();
    if (p && typeof p.catch === "function") p.catch(finish);
  } catch { finish(); }
  return { stop: () => { try { audio.pause(); } catch { /* */ } finish(); } };
}

/** Stops whatever line is playing (leaving a screen, Pause the voice). */
export function stopLine() {
  if (!_current) return;
  const c = _current; _current = null;
  try { c.audio.pause(); } catch { /* */ }
  c.finish?.();
}

const _fetched = new Set();
/** With the voice on, asks for each clip once (the service worker keeps them). Never throws. */
export function prefetchLines(ids = []) {
  if (!voiceOn() || typeof fetch !== "function") return 0;
  let n = 0;
  for (const id of ids) {
    if (!id || !hasLine(id) || _fetched.has(audioUrl(id))) continue;
    _fetched.add(audioUrl(id)); n++;
    try { const p = fetch(audioUrl(id)); p?.catch?.(() => {}); } catch { /* a missing clip is never an error */ }
  }
  return n;
}

/**
 * Calls back with true only if the voice is on and the line's file is
 * there, for a Listen button that should not appear when nothing would
 * play. Never throws; no network, no file or no fetch is false.
 */
export async function lineAvailable(id) {
  if (!id || !voiceOn()) return false;
  await audioReady();
  return hasLine(id);
}
