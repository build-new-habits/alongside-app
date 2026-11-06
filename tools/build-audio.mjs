/**
 * tools/build-audio.mjs
 * 06 Nov 2026 v2
 *
 * v2 - THE UPLOAD FOLDER. Graeme uploads his ElevenLabs recordings into
 *   this repository's audio/raw/ (GitHub › audio › raw › Add file › Upload
 *   files), and .github/workflows/build-audio.yml runs this on every upload:
 *   it makes the app's files, writes the recordings' list
 *   (audio/manifest.json) and commits them, so the app speaks once the site
 *   has updated. The clip names now come from the app's own data (every
 *   `audio: "..."` in the four P-28 data files), so this runs without
 *   BNH-Files; verify-p28-content holds the data and the voice script the
 *   same. A file in audio/raw/ whose name is not a clip is listed, not used.
 *
 * v1 - P-28 FINISH. Turns the recordings into the app's audio files.
 *
 * For each clip: silence trimmed from both ends (never inside a line: the
 * full stops make the pauses), loudness matched (EBU R128, -18 LUFS, peaks
 * at -1.5 dB), mono, 44.1 kHz, 48 kbps MP3, into audio/<id>.mp3.
 * For each guided session (data/guide-me.js): one continuous track,
 * audio/guide-<session>.mp3, each moment starting at its time and silence
 * between, so it keeps going with the screen locked. A moment that would
 * start before the one before it has finished is moved later, and said.
 * Then the list: every file made, with its fingerprint (the first 16
 * characters of its SHA-256), which the app reads to know what can play.
 *
 *   node tools/build-audio.mjs              build, write the list
 *   node tools/build-audio.mjs --check      say what is missing; build nothing
 *   node tools/build-audio.mjs --partial-ok exit 0 even when clips are missing
 *   RAW=dir OUT=dir                         other folders (RAW defaults to
 *                                           audio/raw, OUT to audio)
 * Needs ffmpeg and ffprobe.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RAW = process.env.RAW || path.join(REPO, "audio/raw");
const OUT = process.env.OUT || path.join(REPO, "audio");
const CHECK = process.argv.includes("--check");
const PARTIAL_OK = process.argv.includes("--partial-ok");

/** Every clip the app can play, from its own data. */
export function clipIds(repo = REPO) {
  const files = ["js/data/in-step-programme.js", "js/data/guide-me.js", "js/data/grounding-moments.js", "js/data/empathy-transfer.js"];
  const ids = new Set();
  for (const f of files) for (const m of readFileSync(path.join(repo, f), "utf8").matchAll(/audio:\s*"([a-z0-9-]+)"/g)) ids.add(m[1]);
  return [...ids];
}
export const fingerprint = file => createHash("sha256").update(readFileSync(file)).digest("hex").slice(0, 16);

if (import.meta.url !== `file://${process.argv[1]}`) { /* imported by a check: nothing to run */ }
else {
  const CLIPS = clipIds();
  const { GUIDE_SESSIONS } = await import(new URL("../js/data/guide-me.js", import.meta.url).href);
  const TRACKS = Object.values(GUIDE_SESSIONS).map(s => s.track);

  const rawFiles = existsSync(RAW) ? readdirSync(RAW).filter(f => /\.(mp3|wav|m4a|ogg)$/i.test(f)) : [];
  const stem = f => f.replace(/\.(mp3|wav|m4a|ogg)$/i, "");
  const rawOf = id => { const hit = rawFiles.find(f => stem(f) === id); return hit ? path.join(RAW, hit) : null; };
  const missing = CLIPS.filter(id => !rawOf(id));
  const stray = rawFiles.filter(f => !CLIPS.includes(stem(f)));
  console.log(`${CLIPS.length} clips; ${CLIPS.length - missing.length} recorded in ${path.relative(REPO, RAW) || RAW}.`);
  if (missing.length) console.log(`Not yet recorded (${missing.length}): ${missing.join(", ")}`);
  if (stray.length) console.log(`Not a clip name, so not used (${stray.length}): ${stray.join(", ")}  (names are in the voice script, e.g. instep-p1-e1-listen.mp3)`);
  if (CHECK) process.exit(missing.length || stray.length ? 1 : 0);

  mkdirSync(OUT, { recursive: true });
  const ff = args => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: ["ignore", "ignore", "inherit"] });
  const dur = f => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());
  const TRIM = "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.08,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.15,areverse";
  const NORM = "loudnorm=I=-18:TP=-1.5:LRA=11";
  // -map_metadata -1 and no Xing date: the same recording always makes the
  // same bytes, so the fingerprint changes only when the recording does.
  const ENC = ["-map_metadata", "-1", "-ac", "1", "-ar", "44100", "-codec:a", "libmp3lame", "-b:a", "48k", "-bitexact"];

  let built = 0;
  for (const id of CLIPS) {
    const src = rawOf(id); if (!src) continue;
    ff(["-i", src, "-af", `${TRIM},${NORM}`, ...ENC, path.join(OUT, `${id}.mp3`)]);
    built++;
  }
  console.log(`Clips made: ${built}.`);

  for (const s of Object.values(GUIDE_SESSIONS)) {
    const files = s.moments.map(m => path.join(OUT, `${m.audio}.mp3`));
    const absent = s.moments.filter((m, i) => !rawOf(m.audio) || !existsSync(files[i])).map(m => m.audio);
    if (absent.length) { console.log(`${s.track}: not made yet (waiting for ${absent.join(", ")})`); continue; }
    let at = 0; const starts = [];
    s.moments.forEach((m, i) => {
      const start = Math.max(m.at, at);
      if (start > m.at) console.log(`${s.track}: the moment at ${m.at}s starts at ${start.toFixed(1)}s (the one before runs on)`);
      starts.push(start); at = start + dur(files[i]) + 1;
    });
    const inputs = files.flatMap(f => ["-i", f]);
    const delays = starts.map((t, i) => `[${i}:a]adelay=${Math.round(t * 1000)}:all=1[a${i}]`).join(";");
    const mix = `${delays};${starts.map((_, i) => `[a${i}]`).join("")}amix=inputs=${starts.length}:normalize=0:duration=longest[out]`;
    ff([...inputs, "-filter_complex", mix, "-map", "[out]", ...ENC, path.join(OUT, `${s.track}.mp3`)]);
    console.log(`${s.track}.mp3: ${Math.round(dur(path.join(OUT, `${s.track}.mp3`)))}s, ${s.moments.length} moments`);
  }

  // The list: only what was made from a recording that is here now.
  const files = {};
  for (const id of [...CLIPS, ...TRACKS]) {
    const f = path.join(OUT, `${id}.mp3`);
    const fromRaw = CLIPS.includes(id) ? !!rawOf(id) : GUIDE_SESSIONS && Object.values(GUIDE_SESSIONS).some(s => s.track === id && s.moments.every(m => rawOf(m.audio)));
    if (fromRaw && existsSync(f)) files[id] = fingerprint(f);
  }
  writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify({ about: "The coach's recordings: which lines have a file, and each file's fingerprint. Written by tools/build-audio.mjs; read by js/coach-audio.js.", files }, null, 1) + "\n");
  console.log(`The list: ${Object.keys(files).length} files (audio/manifest.json).`);
  process.exit(missing.length && !PARTIAL_OK ? 1 : 0);
}
