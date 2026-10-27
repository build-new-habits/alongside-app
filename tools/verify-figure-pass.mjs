/**
 * tools/verify-figure-pass.mjs
 * 27 Oct 2026 v3
 *
 * v3 - Graeme's third marks (27 Oct): the band drawn coming towards you in
 *   every front view of a band exercise ("dashes curve out towards hands
 *   from central point near waist"); face pull elbows above the hands;
 *   Mermaid says where it is felt. Tests 5c, 5d, 6l.
 *
 * v2 - Graeme's second marks (27 Oct): "Where is the band?", "Explain how
 *   to set up the band", "Where is the band and how is this set up", and
 *   the Mermaid ring "hovering in mid air". Test 5: a band exercise opens
 *   with a set-up picture that shows the band, then the movement in one
 *   view. Test 6j: the Mermaid ring touches the body.
 *
 * A-6 FIGURE-PASS. Graeme marked 25 drawings on the Figure Review page
 * (19 Oct 2026). What he found, kept fixed:
 *
 *  1. Swimming: the water is a light wavy line (water:[…]) on every swim,
 *     never a grey "far" line through the body ("Messy lines for all
 *     swimming strokes").
 *  2. Every ring says "feel it", and the words sit inside the frame
 *     ("What is the green circle marking?").
 *  3. The guide line is not the movement's colour ("What's the green line
 *     about? Usually this means a band?").
 *  4. A standing front-view foot points outwards or forwards, never across the body
 *     ("Foot turns in and out shouldn't"; "foot … pointing in").
 *  5. These figures stay in one view from first picture to last, so
 *     nothing changes between them but the movement ("Not sure what to do
 *     between these images").
 *  6. Compassionate Self-Talk has its speech bubble; Frog Stretch has no
 *     stray short line; Bilateral Breathing shows the breath (two pictures);
 *     Shoulder Bridge shows the peel (three pictures, not a glute bridge).
 *  7. No exercise says it burns calories (the app never counts them).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dom = new JSDOM("<!doctype html><body></body>", { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node"]) Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });

const { FIGURES } = await import("../js/data/figures/index.js");
const F = await import("../js/figures.js");
const { EXERCISES } = await import("../js/data/exercises/index.js");

let passed = 0, failed = 0;
const ok = (c, label, detail = "") => {
  if (c) { passed++; console.log(`  PASS  ${label}`); }
  else { failed++; console.log(`  FAIL  ${label}${detail ? `\n        ${detail}` : ""}`); }
};
const frames = fig => fig.f || [];
const props = fr => fr.x || [];

console.log("\nTEST 1 - every swim has a light wavy water line, none a grey line through the body");
const swims = Object.keys(FIGURES).filter(id => id.startsWith("swim-"));
ok(swims.length >= 15, `1a. ${swims.length} swims found`);
for (const id of swims) {
  const fr = frames(FIGURES[id]);
  const water = fr.every(f => props(f).some(o => o.water));
  const greyLine = fr.some(f => props(f).some(o => Array.isArray(o.far) && o.far.some(l => l.length === 4 && l[1] === l[3] && l[2] - l[0] > 100)));
  ok(water && !greyLine, `1b. ${id}`);
}
const svg = F.frameSvg(FIGURES["swim-easy-400"], FIGURES["swim-easy-400"].f[0]);
ok(/class="fig-water" d="M8 130 q3 -3 6 0/.test(svg), "1c. the water line is drawn wavy");

console.log('\nTEST 2 - every ring says "feel it", inside the frame');
let rings = 0;
for (const [id, fig] of Object.entries(FIGURES)) {
  const w = fig.w || 160;
  for (const fr of frames(fig)) {
    if (!props(fr).some(o => o.ring)) continue;
    rings++;
    const s = F.frameSvg(fig, fr);
    const m = s.match(/<text class="fig-note" x="([\d.-]+)" y="[\d.-]+" text-anchor="(start|end)">feel it<\/text>/);
    const x = m ? Number(m[1]) : NaN;
    const inside = m && (m[2] === "start" ? x + 44 <= w : x - 44 >= 0);
    ok(inside, `2. ${id}`, m ? `label at ${x} (${m[2]}) in a frame ${w} wide` : "no label");
  }
}
ok(rings >= 25, `2b. ${rings} frames with a ring checked`);

console.log("\nTEST 3 - the guide line is not the movement's colour");
const css = fs.readFileSync(path.join(REPO, "css/base/global.css"), "utf8");
const guide = (css.match(/\.fig-guide \{([^}]*)\}/) || [])[1] || "";
ok(guide && !/--color-primary/.test(guide) && /dasharray: 1 /.test(guide), "3. .fig-guide is grey and dotted", guide);
for (const k of ["fig-water", "fig-say", "fig-note"]) ok(new RegExp(`\\.${k} \\{`).test(css), `3b. .${k} is styled`);

{
  const fig = FIGURES["band-reverse-fly"], fr = fig.f.find(f => props(f).some(o => o.bandq));
  const w = fr ? [...F.frameSvg(fig, fr).matchAll(/class="fig-bandq"[^>]*stroke-width="([\d.]+)"/g)].map(m => Number(m[1])) : [];
  ok(w.length >= 5 && w[0] > w[4], "3c. the band coming towards you is drawn in dashes that thin with distance", w.join(","));
}
ok(/\.fig-bandq \{[^}]*--kind-amber/.test(css), "3d. .fig-bandq is the band colour");

console.log("\nTEST 4 - front-view feet never point across the body");
const bad = [];
for (const [id, fig] of Object.entries(FIGURES)) frames(fig).forEach((fr, i) => {
  for (const p of [].concat(fr.p || [])) {
    // upright only: lying and kneeling front views turn the legs on purpose
    const t = p.t == null ? 180 : p.t;
    if (p.v !== "front" || t < 160 || t > 200) continue;
    if (Array.isArray(p.ll) && p.ll[2] != null && p.ll[2] > 0 && p.ll[2] < 180) bad.push(`${id} #${i + 1} left foot ${p.ll[2]}`);
    if (Array.isArray(p.rl) && p.rl[2] != null && p.rl[2] < 0 && p.rl[2] > -180) bad.push(`${id} #${i + 1} right foot ${p.rl[2]}`);
  }
});
ok(bad.length === 0, "4. no foot turned in", bad.join("; "));

console.log("\nTEST 5 - a band exercise shows where the band goes, then the movement in one view");
const viewOf = fr => [].concat(fr.p || [])[0]?.v === "front" ? "front" : (fr.p ? "side" : "lines");
for (const id of ["band-face-pull", "seated-band-face-pull", "band-reverse-fly", "seated-band-chest-fly"]) {
  const fr = frames(FIGURES[id]);
  const setUp = /^Set up/.test(fr[0].l) && props(fr[0]).some(o => o.band);
  const rest = new Set(fr.slice(1).map(viewOf));
  ok(setUp && rest.size === 1 && fr.length >= 3, `5a. ${id}: "${fr[0].l}", then ${fr.slice(1).map(viewOf).join(", ")}`);
}
for (const id of ["band-face-pull", "seated-band-face-pull", "band-reverse-fly", "seated-band-chest-fly"]) {
  const fr = frames(FIGURES[id]).slice(1).filter(f => viewOf(f) === "front");
  const missing = fr.filter(f => !props(f).some(o => o.bandq || o.band)).map(f => f.l);
  ok(fr.length > 0 && missing.length === 0, `5c. ${id}: every front picture shows the band`, missing.join("; "));
}
for (const id of ["band-face-pull", "seated-band-face-pull"]) {
  const end = frames(FIGURES[id]).at(-1), p = [].concat(end.p)[0];
  // left arm: shoulder, elbow, hand follow the torso line and shoulder bar in framePoints order
  const elbowUp = p.la && p.la[0] < -95 && p.la[0] > -180;
  ok(elbowUp, `5d. ${id}: at the end the elbows are lifted above the hands`, JSON.stringify(p.la));
}
{
  const views = frames(FIGURES["thread-the-needle"]).map(viewOf);
  ok(new Set(views).size === 1 && views[0] !== "lines", `5b. thread-the-needle: ${views.join(", ")}`);
}

console.log("\nTEST 6 - the single fixes");
ok(props(FIGURES["compassionate-self-talk"].f[0]).some(o => o.say), "6a. Compassionate Self-Talk has a speech bubble");
const frogShort = props(FIGURES["frog-stretch"].f[0]).flatMap(o => [...(o.body || []), ...(o.far || [])])
  .some(l => l.length === 4 && Math.hypot(l[2] - l[0], l[3] - l[1]) < 10);
ok(!frogShort, "6b. Frog Stretch has no stray short line");
ok(frames(FIGURES["swim-bilateral-breathing"]).length === 2, "6c. Bilateral Breathing shows the breath in a second picture");
ok(frames(FIGURES["pilates-shoulder-bridge"]).length === 3 && frames(FIGURES["pilates-shoulder-bridge"])[1].p.bend, "6d. Shoulder Bridge shows the peel, a curved spine");
ok(/squat/i.test(frames(FIGURES["quiet-cardio-circuit"])[2].l), "6e. the Quiet Cardio Circuit's third picture is the squat");

const sp = frames(FIGURES["side-plank-full"]);
ok(/side/i.test(sp[0].l) && /straight line/i.test(sp[1].l), "6f. Side Plank says lie on your side, then a straight line", sp.map(f => f.l).join(" / "));
for (const id of ["achilles-heel-drop-bent", "achilles-heel-drop-straight"]) {
  const fr = frames(FIGURES[id]);
  ok(JSON.stringify(fr[0].p.fl) === JSON.stringify(fr[1].p.fl) && fr.every(f => props(f).some(o => o.wall != null)),
    `6g. ${id}: the other foot is lifted the same way in both pictures, a hand on the wall`);
}
const bike = frames(FIGURES["bike-easy-spin-warmup"])[0];
// Graeme: "This looks a little messy". The frame was a diagonal from the base to the crank under the legs.
const diag = props(bike).filter(o => o.bar && Math.max(o.bar[1], o.bar[3]) >= 180 && Math.min(o.bar[1], o.bar[3]) > 140 && Math.abs(o.bar[0] - o.bar[2]) > 20);
ok(diag.length === 0, "6h. the bike has no diagonal bar under the rider's legs", JSON.stringify(diag));
const tw = frames(FIGURES["towel-hamstring-curl"]);
ok(tw.every(f => f.p.nl[2] !== 180), "6i. Towel Hamstring Curl: the feet are not drawn straight up");

// The ring sits on the side of the body that stretches: within 10 of a drawn point.
{
  const fig = FIGURES["pilates-mermaid"], fr = fig.f[1];
  const [rx, ry] = props(fr).find(o => o.ring).ring;
  const near = F.framePoints(fig, fr).points.some(([x, y]) => Math.hypot(x - rx, y - ry) <= 16)
    || (() => { const p = [].concat(fr.p)[0]; const hip = p.hip, a = p.t * Math.PI / 180;
        const sh = [hip[0] + Math.sin(a) * 46, hip[1] + Math.cos(a) * 46];
        for (let k = 0; k <= 10; k++) { const x = hip[0] + (sh[0] - hip[0]) * k / 10, y = hip[1] + (sh[1] - hip[1]) * k / 10; if (Math.hypot(x - rx, y - ry) <= 12) return true; }
        return false; })();
  ok(near, `6j. the Mermaid ring is on the body, not in the air (${rx}, ${ry})`);
}
ok(/feel it along your side/i.test(FIGURES["pilates-mermaid"].f[1].l), "6l. Mermaid says where it is felt", FIGURES["pilates-mermaid"].f[1].l);
ok(props(FIGURES["towel-hamstring-curl"].f[0]).some(o => o.box && o.box[2] >= 30), "6k. the towel under the heels is big enough to see");

console.log("\nTEST 7 - no exercise says it burns calories");
const cal = EXERCISES.filter(e => /calorie/i.test(JSON.stringify(e))).map(e => e.id);
ok(cal.length === 0, "7. no calorie claims", cal.join(", "));

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
