/**
 * tools/build-audio.mjs
 * 06 Nov 2026 v1
 *
 * P-28 FINISH. Turns Graeme's ElevenLabs recordings into the app's audio
 * files, ready for the day they arrive (BNH-Files Apps/Alongside Move/
 * Audio/raw/, named exactly as the voice script,
 * Product/alongside_voice_script_05nov2026_v1.csv: 109 clips).
 *
 * For each clip: silence trimmed from both ends (never inside a line: the
 * full stops make the pauses), loudness matched (EBU R128, -18 LUFS, peaks
 * at -1.5 dB), mono, 44.1 kHz, 48 kbps MP3, into audio/<id>.mp3.
 * For each guided session (data/guide-me.js): one continuous track,
 * audio/guide-<session>.mp3, each moment starting at its time and silence
 * between, so it keeps going with the screen locked. A moment that would
 * start before the one before it has finished is moved later, and said.
 *
 * Not in the verify loop (it needs ffmpeg and the recordings). From the
 * repository root:
 *   node tools/build-audio.mjs            build every clip and track found
 *   node tools/build-audio.mjs --check    list what is missing, build nothing
 *   RAW=dir OUT=dir                       other folders
 * Exits 1 if a clip named in the script is missing (the build still makes
 * what it can; the app plays only files that exist).
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { schedulePath } from "./bnh-files.mjs";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sched = schedulePath();
const MOVE = sched ? path.resolve(path.dirname(sched), "..") : null;
const RAW = process.env.RAW || (MOVE && path.join(MOVE, "Audio/raw"));
const OUT = process.env.OUT || path.join(REPO, "audio");
const SCRIPT = MOVE && path.join(MOVE, "Product/alongside_voice_script_05nov2026_v1.csv");
const CHECK = process.argv.includes("--check");

if (!SCRIPT || !existsSync(SCRIPT)) { console.log("The voice script is not reachable (clone BNH-Files beside this repository)."); process.exit(1); }

// The clip names, from the script's first column (quoted fields may hold commas).
function csvRows(src) {
  const rows = []; let row = [], f = "", q = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (q) { if (c === '"' && src[i + 1] === '"') { f += '"'; i++; } else if (c === '"') q = false; else f += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && src[i + 1] === "\n") i++; row.push(f); rows.push(row); row = []; f = ""; }
    else f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows.filter(r => r.length > 1);
}
const CLIPS = csvRows(readFileSync(SCRIPT, "utf8")).slice(1).map(r => r[0].replace(/\.mp3$/, ""));
const { GUIDE_SESSIONS } = await import(new URL("../js/data/guide-me.js", import.meta.url).href);

const rawOf = id => {
  if (!RAW || !existsSync(RAW)) return null;
  const hit = readdirSync(RAW).find(f => f.replace(/\.(mp3|wav|m4a|ogg)$/i, "") === id);
  return hit ? path.join(RAW, hit) : null;
};
const missing = CLIPS.filter(id => !rawOf(id));
console.log(`${CLIPS.length} clips in the script; ${CLIPS.length - missing.length} recorded in ${RAW || "(no raw folder)"}.`);
if (missing.length) console.log(`Missing (${missing.length}): ${missing.slice(0, 12).join(", ")}${missing.length > 12 ? ", …" : ""}`);
if (CHECK) process.exit(missing.length ? 1 : 0);

mkdirSync(OUT, { recursive: true });
const ff = args => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: ["ignore", "ignore", "inherit"] });
const dur = f => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());
const TRIM = "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.08,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.15,areverse";
const NORM = "loudnorm=I=-18:TP=-1.5:LRA=11";
const ENC = ["-ac", "1", "-ar", "44100", "-codec:a", "libmp3lame", "-b:a", "48k"];

let built = 0;
for (const id of CLIPS) {
  const src = rawOf(id); if (!src) continue;
  ff(["-i", src, "-af", `${TRIM},${NORM}`, ...ENC, path.join(OUT, `${id}.mp3`)]);
  built++;
}
console.log(`Clips made: ${built} into ${OUT}.`);

// One track per guided session: each moment at its time.
for (const s of Object.values(GUIDE_SESSIONS)) {
  const files = s.moments.map(m => path.join(OUT, `${m.audio}.mp3`));
  const absent = s.moments.filter((m, i) => !existsSync(files[i])).map(m => m.audio);
  if (absent.length) { console.log(`${s.track}: not made (missing ${absent.join(", ")})`); continue; }
  let at = 0; const starts = [];
  s.moments.forEach((m, i) => {
    const want = m.at, start = Math.max(want, at);
    if (start > want) console.log(`${s.track}: the moment at ${m.at}s starts at ${start.toFixed(1)}s (the one before runs on)`);
    starts.push(start); at = start + dur(files[i]) + 1;
  });
  const inputs = files.flatMap(f => ["-i", f]);
  const delays = starts.map((t, i) => `[${i}:a]adelay=${Math.round(t * 1000)}:all=1[a${i}]`).join(";");
  const mix = `${delays};${starts.map((_, i) => `[a${i}]`).join("")}amix=inputs=${starts.length}:normalize=0:duration=longest[out]`;
  ff([...inputs, "-filter_complex", mix, "-map", "[out]", ...ENC, path.join(OUT, `${s.track}.mp3`)]);
  console.log(`${s.track}.mp3: ${Math.round(dur(path.join(OUT, `${s.track}.mp3`)))}s, ${s.moments.length} moments`);
}
process.exit(missing.length ? 1 : 0);
