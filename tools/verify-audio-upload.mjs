/**
 * tools/verify-audio-upload.mjs
 * 06 Nov 2026 v1
 *
 * The coach's recordings, from upload to the app (Graeme, 06 Nov: "set up
 * the folder I'm uploading into so that once it is in the right place it
 * works in the app").
 *
 *   0  Positive controls: the files this reads are here.
 *   1  The upload folder: audio/raw/ exists, with a README that says where
 *      to upload, how to name, and that nothing else is needed.
 *   2  The Action: runs on an upload to audio/raw/ (and by hand), builds
 *      with build-audio --partial-ok, commits the files and the list, may
 *      write, and two batches wait for each other.
 *   3  The names: build-audio reads every clip from the app's own data, the
 *      same 109 the voice script names (verify-p28-content holds data and
 *      script the same), and no two clips share a name.
 *   4  The list (audio/manifest.json), when there is one: every entry is a
 *      clip or a guided track, its file is here, and its fingerprint is the
 *      file's own; every file made is in it.
 *   5  The service worker never treats an upload in audio/raw/ as a
 *      recording, and precaches no recording.
 *
 * Red before this release (no folder, no Action, no list).
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${String(detail).slice(0, 300)}`); }
};
const read = rel => existsSync(path.join(REPO, rel)) ? readFileSync(path.join(REPO, rel), "utf8") : null;

const WF = read(".github/workflows/build-audio.yml");
const README = read("audio/README.md");
const SW = read("sw.js");

console.log("\nTEST 0 - positive controls");
ok("0a. the service worker and the build tool are here", !!SW && !!read("tools/build-audio.mjs"));

console.log("\nTEST 1 - the upload folder");
ok("1a. audio/raw/ exists (kept by .gitkeep)", existsSync(path.join(REPO, "audio/raw/.gitkeep")));
ok("1b. its README says where to upload, how to name, and that nothing else is needed",
  !!README && /Add file › Upload files/.test(README) && /instep-p1-e1-listen\.mp3/.test(README) && /Then nothing else/.test(README) && /\d\d \w\w\w 2026 v\d+/.test(README));

console.log("\nTEST 2 - the Action");
ok("2a. it is there", !!WF);
ok("2b. an upload to audio/raw/ on main runs it, and it can be run by hand", !!WF && /branches:\s*\[main\]/.test(WF) && /paths:\s*\["audio\/raw\/\*\*"\]/.test(WF) && /workflow_dispatch/.test(WF));
ok("2c. it builds with build-audio, keeping what is there when some are missing", !!WF && /node tools\/build-audio\.mjs --partial-ok/.test(WF) && /apt-get install[^\n]*ffmpeg/.test(WF));
ok("2d. it commits the files and the list, and may write", !!WF && /git add audio\/\*\.mp3 audio\/manifest\.json/.test(WF) && /contents:\s*write/.test(WF) && /git push origin HEAD:main/.test(WF));
ok("2e. two batches wait for each other (no lost commit)", !!WF && /concurrency:[\s\S]*cancel-in-progress:\s*false/.test(WF) && /git pull --rebase origin main/.test(WF));

console.log("\nTEST 3 - the names");
const { clipIds, fingerprint } = await import(new URL("./build-audio.mjs", import.meta.url).href);
const ids = clipIds();
ok("3a. 109 clips, every one from the app's own data", ids.length === 109, String(ids.length));
ok("3b. no two clips share a name, and every name is a file name", new Set(ids).size === ids.length && ids.every(id => /^[a-z0-9-]+$/.test(id)));
const { GUIDE_SESSIONS } = await import(new URL("../js/data/guide-me.js", import.meta.url).href);
const tracks = Object.values(GUIDE_SESSIONS).map(s => s.track);
ok("3c. no guided track shares a name with a clip", tracks.every(t => !ids.includes(t)), tracks.join(","));

console.log("\nTEST 4 - the list");
const M = read("audio/manifest.json");
if (!M) ok("4a. no recordings yet: no list, so nothing plays (the words show)", true);
else {
  let files = {};
  try { files = JSON.parse(M).files || {}; } catch (e) { ok("4a. the list is JSON", false, e.message); }
  const known = new Set([...ids, ...tracks]);
  ok("4a. every entry is a clip or a guided track", Object.keys(files).every(k => known.has(k)), Object.keys(files).filter(k => !known.has(k)).join(","));
  const off = Object.entries(files).filter(([k, v]) => !existsSync(path.join(REPO, "audio", `${k}.mp3`)) || fingerprint(path.join(REPO, "audio", `${k}.mp3`)) !== v).map(([k]) => k);
  ok("4b. each file is here, with its own fingerprint", off.length === 0, off.join(","));
  const made = readdirSync(path.join(REPO, "audio")).filter(f => f.endsWith(".mp3")).map(f => f.replace(/\.mp3$/, ""));
  ok("4c. every file made is in the list", made.every(k => k in files), made.filter(k => !(k in files)).join(","));
}

console.log("\nTEST 5 - the service worker");
const re = SW.match(/if \(\/(\\\/audio\\\/\[\^\/\]\+\\\.mp3\$)\/\.test\(url\.pathname\)\)/);
ok("5pc. the recordings' rule is found", !!re);
const rule = re ? new RegExp(re[1].replace(/\\\//g, "/")) : null;
ok("5a. an upload in audio/raw/ is never treated as a recording", !!rule && rule.test("/app/audio/instep-p1-e1-listen.mp3") && !rule.test("/app/audio/raw/instep-p1-e1-listen.mp3"));
const shell = SW.slice(SW.indexOf("const SHELL_URLS = ["), SW.indexOf("];", SW.indexOf("const SHELL_URLS = [")));
ok("5b. no recording, list or upload is precached", !/audio\//.test(shell));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
