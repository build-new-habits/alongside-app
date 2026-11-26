/**
 * tools/p42-words.mjs
 * 26 Nov 2026 v1
 *
 * P-42. Reads the approved In Step words (BNH-Files Product/) for the
 * young parts and the adults' Part 5, so the gates can hold the app's data
 * to them word for word. Not a gate itself (no verify- prefix).
 *
 *   parseWords(md) -> { why, episodes: [ { n, title, ages, recaps, listen,
 *                      listen16, hold, question, options, carry, help, about,
 *                      third } ] }
 *
 * Only the italics markers go (a phrase in italics inside a line reads
 * between quotation marks, as P-28's data); every word is kept.
 */

const strip = s => (s || "").replace(/\*/g, "").replace(/\s+/g, " ").trim();
/** Italics set as a quotation read between quotation marks (as P-28's data), then any stray markers go. */
const quote = s => strip((s || "").replace(/\*([^*]+)\*/g, "\u201c$1\u201d"));
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;

/** "Standing tall, feet hip-width, arms easy." -> pose "Standing tall", how "Feet hip-width, arms easy." */
export function splitPose(desc) {
  const m = desc.match(/^([^,.:]+)[,.:]\s*(.*)$/);
  if (!m) return { pose: desc.replace(/\.$/, ""), how: "" };
  return { pose: m[1].trim(), how: cap(m[2].trim()) };
}

/** "(Seated: sit tall …)" -> { label, text } as the adult data holds them. */
export function splitAlt(inner) {
  if (!inner) return null;
  const t = inner.trim();
  let m;
  if ((m = t.match(/^Seated:\s*(.*)$/))) return { label: "Seated", text: cap(m[1]) };
  if (/^Or stand/.test(t)) return { label: "Standing", text: t };
  if (/^Standing:/.test(t)) return { label: "Standing", text: t };
  if (/^Or /.test(t)) return { label: "Seated", text: t };
  return { label: "Seated", text: t };
}

export function parseHold(line) {
  // **Hold still:** [*Pose.*] DESC [*(ALT)*] SECS seconds. *TEXT*
  const m = line.match(/^\*\*Hold still:\*\*\s*(?:\*([^*()]+?)\.\*\s+)?(.*?)\s*(?:\*\(([^)]*)\)\*\s*)?(\d+) seconds\.\s*\*(.+)\*\s*$/);
  if (!m) return null;
  const desc = m[2].trim();
  const { pose, how } = m[1] ? { pose: m[1].trim(), how: desc } : splitPose(desc);
  return { pose, how, alt: splitAlt(m[3]), secs: Number(m[4]), text: strip(m[5]) };
}

export function parseWords(md) {
  const why = strip((md.match(/\*\*What this part is for \(one plain sentence[^)]*\):\*\*\s*(.+)/) || [])[1]);
  const blocks = md.split(/\n### Episode /).slice(1);
  const episodes = blocks.map(b => {
    const head = b.split("\n")[0];
    const hm = head.match(/^(\d+) — (.+?)(?:\s+\*\((.*)\)\*)?\s*$/);
    const n = Number(hm[1]), title = hm[2].trim(), note = hm[3] || "";
    const ages = /16–17 only/.test(note) ? ["16"] : ["14", "16"];
    const lines = b.split("\n");
    const get = re => { const l = lines.find(x => re.test(x)); return l || null; };
    const recaps = lines.filter(l => /^\*\*Last time opens with/.test(l)).map(l => {
      const m = l.match(/^\*\*Last time opens with(?:, (14–15|16–17))?:\*\*\s*\*(.+?)\*\s*·\s*I tried it\s*·\s*I forgot\s*·\s*(.+)$/);
      return m ? { age: m[1] ? (m[1].startsWith("14") ? "14" : "16") : null, text: strip(m[2]), third: strip(m[3]) } : null;
    }).filter(Boolean);
    const lis = re => { const l = get(re); return l ? quote(l.replace(/^\*\*Listen[^*]*\*\*\s*\(\d+ words\):\s*/, "")) : null; };
    const listen14 = lis(/^\*\*Listen, 14–15\*\*/), listen16 = lis(/^\*\*Listen, 16–17\*\*/), listen = lis(/^\*\*Listen\*\* \(/) || listen14;
    const hold = parseHold(get(/^\*\*Hold still:\*\*/) || "");
    const qi = lines.findIndex(l => /^\*\*Choose:\*\*/.test(l));
    const question = qi >= 0 ? quote(lines[qi].replace(/^\*\*Choose:\*\*\s*/, "")) : null;
    const options = [];
    for (let i = qi + 1; i < lines.length && options.length < 3; i++) { if (/^- /.test(lines[i])) options.push(quote(lines[i].slice(2))); else if (options.length) break; }
    const carry = strip(((get(/^\*\*Carry it:\*\*/) || "").match(/^\*\*Carry it:\*\*\s*\*(.+)\*\s*$/) || [])[1]);
    const hl = get(/^\*\*(Help line \(spoken and shown\)|Spoken after Carry it, and shown under it):\*\*/);
    const help = hl ? strip((hl.match(/:\*\*\s*\*(.+?)\*(?:\s*\(Spoken:.*\))?\s*$/) || [])[1]) : null;
    const nx = get(/^\*\*For (the next|Part \d's first|a)\b.*Last time/);
    const nm = nx ? nx.match(/about \*(.+?)\*; third answer \*(.+?)\*/) : null;
    return { n, title, ages, recaps, listen, listen16: listen14 ? listen16 : null, hold, question, options, carry, help: help || null,
             about: nm ? strip(nm[1]) : null, third: nm ? strip(nm[2]) : null };
  });
  return { why, episodes };
}

/** The recap the app says, built as in-step.js builds it (P-29), with straight quotes as the documents write it. */
export function recapLine(e) {
  return `Last time, in '${e.title}', we talked about ${e.about}. I left you with one thing to try: '${e.carry}' Did you get to try it?`;
}
