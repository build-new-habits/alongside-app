# The coach's recordings
## 06 Nov 2026 v1

**Upload into `raw/` (this folder's `raw`).** Open it on GitHub, then **Add file › Upload files**, drag the clips in, and **Commit changes**. GitHub takes up to 100 files at a time, so 109 clips go in two batches.

**Name each file exactly as the voice script names it**, all lower case, for example `instep-p1-e1-listen.mp3` (the full list is in BNH-Files `Apps/Alongside Move/Product/alongside_voice_script_06nov2026_v2.md`). MP3 or WAV.

**Then nothing else.** A few minutes after each upload, *Build the coach's recordings* (GitHub › Actions) makes the app's files into this folder: each clip trimmed, its loudness matched to the others, made small for phones; each guided walk, run and ride joined into one track (`guide-walk.mp3`, `guide-weather.mp3`, `guide-run.mp3`, `guide-ride.mp3`) with each moment at its time; and `manifest.json`, the list the app reads to know what can play. When the site has updated, the app speaks.

**To redo a line,** upload the new take with the same name: it replaces the old one, and phones get the new one (each file carries a fingerprint in the list).

A file whose name is not a clip is left out and named in the Action's log. A guided track is made once all of its moments are here; until then that walk is words on the screen.

*Build New Habits · Alongside: Move · audio/README · 06 Nov 2026 v1*
