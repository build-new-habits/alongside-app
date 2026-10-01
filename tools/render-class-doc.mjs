/**
 * tools/render-class-doc.mjs
 * 01 Oct 2026 v2
 *
 * v2 - DOCS-MOVE. Documents/ left this public repository for the private
 *   BNH-Files repository; the files this check reads are now in docs/ (or,
 *   for the master schedule, read through tools/bnh-files.mjs).
 *
 * F8, CLASS-8. Renders a guided class's data file as a readable script,
 * for review (clinical sign-off, Graeme's voice pass) and for the voice
 * recording later.
 *
 * Classes 001-007 were written as documents and transcribed into data,
 * and each data file says "where the two disagree the document is right".
 * Two copies of a script drift. From 008 the DATA is the source and the
 * document is rendered from it, so they cannot disagree:
 * verify-class-contract test 8 re-renders each one and compares.
 *
 *   node tools/render-class-doc.mjs              writes every 008+ document
 *   import { renderClassDoc, docPathFor } from   (used by the gate)
 */
import fs from "node:fs";

const ROOT = new URL("../", import.meta.url);
const C = await import(new URL("js/data/class-contract.js", ROOT).href);

// Classes whose document is rendered. 001-007 keep their authored drafts.
export const RENDERED = {
  "class-putting-down-008":  "alongside_class_008_putting_down_28sep2026_v1_DRAFT.md",
  "class-getting-going-009": "alongside_class_009_getting_going_28sep2026_v1_DRAFT.md",
  "class-from-the-feet-010": "alongside_class_010_from_the_feet_28sep2026_v1_DRAFT.md",
};
export const docPathFor = id => RENDERED[id] && new URL("docs/classes/" + RENDERED[id], ROOT);

const mmss = s => `${Math.floor(s / 60)} min ${String(Math.round(s % 60)).padStart(2, "0")}`;

export function renderClassDoc(cls, { strandLabel = s => s, exerciseName = id => id } = {}) {
  const L = [];
  const lighterOmit = new Set(cls.lighter?.omitSections || []);
  L.push(`# ${cls.title} — guided class ${cls.id.slice(-3)}`);
  L.push(`## 28 Sep 2026 v1 · DRAFT`);
  L.push("");
  L.push(`Build New Habits | Rendered from \`js/data/classes/${cls.id}.js\` by \`tools/render-class-doc.mjs\`. Edit the data file, then re-render; never edit this document by hand.`);
  L.push("");
  L.push("| | |");
  L.push("|---|---|");
  L.push(`| Serves | ${strandLabel(cls.serves)} |`);
  if (cls.touches?.length) L.push(`| Touches | ${cls.touches.map(strandLabel).join(" · ")} |`);
  L.push(`| Format | ${cls.formats.join(" + ")} · ${cls.intensityBias} |`);
  L.push(`| Length | ${C.durationLabel(cls)} (sections total ${cls.durationMins} min) |`);
  if (cls.lighter) L.push(`| Shorter version | about ${Math.ceil(C.lighterMinutes(cls))} minutes — leaves out: ${[...lighterOmit].map(id => cls.sections.find(s => s.id === id)?.title || id).join(", ")}${cls.lighter.note ? `. ${cls.lighter.note}` : ""} |`);
  L.push(`| Position | ${cls.position}${cls.seatedRoute ? " · can be done seated throughout" : ""} |`);
  L.push(`| Equipment | ${cls.equipment.length ? cls.equipment.join(", ") : "none"} |`);
  L.push(`| Flags shown on the card | ${cls.flags.map(f => f.replace(/-/g, " ")).join(" · ")} |`);
  L.push("");
  L.push("**For review:** every line below is said or shown to the person. Tick each, or mark the words to change. `Movement` names the library exercise; its own safety rules apply, and the class is withheld from anybody for whom a movement is unsafe and has no safe seated route.");
  L.push("");
  cls.sections.forEach((s, i) => {
    L.push(`---`);
    L.push("");
    L.push(`### ${i + 1}. ${s.title} · ${mmss(s.durationSeconds)}${lighterOmit.has(s.id) ? " · *not in the shorter version*" : ""}`);
    if (s.note) { L.push(""); L.push(`> ${s.note}`); }
    L.push("");
    for (const b of s.beats) {
      const bits = [];
      if (b.screen) bits.push(`**Screen:** ${b.screen}`);
      if (b.voice) bits.push(`**Voice:** ${b.voice}`);
      if (b.lighterVoice) bits.push(`**Voice, shorter version:** ${b.lighterVoice}`);
      const meta = [];
      if (b.exerciseId) meta.push(`movement: ${exerciseName(b.exerciseId)}`);
      if (b.seatedAlternativeId) meta.push(`seated route: ${exerciseName(b.seatedAlternativeId)}`);
      if (b.easierRouteId) meta.push(`easier route: ${exerciseName(b.easierRouteId)}`);
      if (b.stopCue) meta.push(`stop cue: "${b.stopCue}"`);
      if (typeof b.holdSeconds === "number") meta.push(`held about ${b.holdSeconds} seconds (never sped up)`);
      else if (typeof b.speechSeconds === "number") meta.push(`then ${b.speechSeconds}s`);
      if (b.sitOut) meta.push("can be sat out");
      L.push(`- *${b.kind}* — ${bits.join("  \n  ")}${meta.length ? `  \n  <sub>${meta.join(" · ")}</sub>` : ""}`);
    }
    L.push("");
  });
  L.push("---");
  L.push("");
  L.push(`*Build New Habits · Alongside: Move · ${cls.title} · 28 Sep 2026 v1 · DRAFT*`);
  L.push("");
  return L.join("\n");
}

export async function helpers() {
  const { STRANDS } = await import(new URL("js/data/aims.js", ROOT).href);
  const { EXERCISES } = await import(new URL("js/data/exercises/index.js", ROOT).href);
  const byId = new Map(EXERCISES.map(e => [e.id, e.name]));
  return {
    strandLabel: s => STRANDS[s]?.label ? `${STRANDS[s].label} (\`${s}\`)` : s,
    exerciseName: id => byId.get(id) ? `${byId.get(id)} (\`${id}\`)` : id,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { CLASSES } = await import(new URL("js/data/classes/index.js", ROOT).href);
  const h = await helpers();
  for (const c of CLASSES.filter(c => RENDERED[c.id])) {
    fs.writeFileSync(docPathFor(c.id), renderClassDoc(c, h));
    console.log("wrote", RENDERED[c.id]);
  }
}
