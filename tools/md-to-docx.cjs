/**
 * tools/md-to-docx.cjs
 * 01 Oct 2026 v1
 *
 * Turns the 12g legal drafts (plain markdown) into accessible Word files:
 * real heading styles, a document title, en-GB language, header rows that
 * repeat, list numbering rather than typed bullets, and the version line in
 * every page header. Not a gate; run by hand:
 *   node tools/md-to-docx.cjs <in.md> <out.docx>
 */
const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, BorderStyle, ShadingType, AlignmentType, LevelFormat, Header, Footer,
  PageNumber,
} = require("docx");

const [, , inPath, outPath] = process.argv;
const md = fs.readFileSync(inPath, "utf8").replace(/\r/g, "");
const lines = md.split("\n");

const FONT = "Arial";
const TEXT_W = 9026; // A4 with 1" margins
const INK = "1F2933", MUTED = "52606D", RULE = "9AA5B1", FILL = "E4E7EB", QUOTE = "F5F7FA";

// ── inline: **bold**, *italic*, `code` ─────────────────────────────────
function runs(text, base = {}) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g;
  let last = 0, m;
  const push = (t, o) => { if (t) out.push(new TextRun({ text: t, font: FONT, ...base, ...o })); };
  while ((m = re.exec(text))) {
    push(text.slice(last, m.index), {});
    const tok = m[0];
    if (tok.startsWith("**")) push(tok.slice(2, -2), { bold: true });
    else if (tok.startsWith("`")) push(tok.slice(1, -1), { font: "Consolas" });
    else push(tok.slice(1, -1), { italics: true });
    last = m.index + tok.length;
  }
  push(text.slice(last), {});
  return out;
}

const title = (lines.find(l => l.startsWith("# ")) || "# Document").slice(2).trim();
const version = (md.match(/\*\*(\d{2} \w{3} \d{4} v\d+)\*\*/) || [])[1] || "";
const docName = title.replace(/ — Alongside: Move$/, "");

const children = [];
let numberedRef = 0;
const numberingConfigs = [];

function newNumbering() {
  const ref = `num${++numberedRef}`;
  numberingConfigs.push({
    reference: ref,
    levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 567, hanging: 340 } } } }],
  });
  return ref;
}

function para(text, opts = {}) {
  return new Paragraph({ children: runs(text, opts.run || {}), spacing: { after: 120, line: 300 }, ...opts.p });
}

function table(rows) {
  const parse = l => l.replace(/^\|/, "").replace(/\|$/, "").split("|").map(c => c.trim());
  const head = parse(rows[0]);
  const body = rows.slice(2).map(parse);
  const n = head.length;
  // Width by content length, with a floor, summing to TEXT_W.
  const lens = head.map((h, i) => Math.max(h.length, ...body.map(r => (r[i] || "").length)));
  const weights = lens.map(l => Math.max(Math.sqrt(l), 3));
  const total = weights.reduce((a, b) => a + b, 0);
  const widths = weights.map(w => Math.floor(TEXT_W * w / total));
  // No word broken across lines: each column at least its longest word.
  const strip = t => t.replace(/\*\*|`|\*/g, "");
  const mins = head.map((h, i) => 220 + 112 * Math.max(...[h, ...body.map(r => r[i] || "")]
    .flatMap(t => strip(t).split(/\s+/)).map(w => w.length)));
  for (let k = 0; k < n; k++) {
    if (widths[k] < mins[k]) {
      const need = mins[k] - widths[k];
      const j = widths.indexOf(Math.max(...widths));
      widths[j] -= need; widths[k] += need;
    }
  }
  widths[n - 1] += TEXT_W - widths.reduce((a, b) => a + b, 0);
  const border = { style: BorderStyle.SINGLE, size: 4, color: RULE };
  const borders = { top: border, bottom: border, left: border, right: border };
  const emptyHead = head.every(h => !h);
  const cell = (t, i, isHead) => new TableCell({
    width: { size: widths[i], type: WidthType.DXA },
    borders,
    shading: isHead ? { type: ShadingType.CLEAR, fill: FILL, color: "auto" } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ children: runs(t, { size: 20, ...(isHead ? { bold: true } : {}) }), spacing: { after: 0, line: 276 } })],
  });
  const trs = [];
  if (!emptyHead) trs.push(new TableRow({ tableHeader: true, cantSplit: true, children: head.map((h, i) => cell(h, i, true)) }));
  body.forEach(r => trs.push(new TableRow({ cantSplit: true, children: head.map((_, i) => cell(r[i] || "", i, emptyHead && i === 0)) })));
  return new Table({ width: { size: TEXT_W, type: WidthType.DXA }, columnWidths: widths, rows: trs });
}

let i = 0;
let listRef = null;
while (i < lines.length) {
  const l = lines[i];
  if (!l.trim()) { listRef = null; i++; continue; }
  if (l.startsWith("# ")) {
    children.push(new Paragraph({ heading: HeadingLevel.TITLE, children: runs(l.slice(2), { size: 40, bold: true, color: INK }), spacing: { after: 120 } }));
  } else if (l.startsWith("### ")) {
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: runs(l.slice(4)), spacing: { before: 200, after: 80 } }));
  } else if (l.startsWith("## ")) {
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: runs(l.slice(3)), spacing: { before: 280, after: 120 } }));
  } else if (l.trim() === "---") {
    children.push(new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: RULE, space: 1 } }, spacing: { after: 120 } }));
  } else if (l.startsWith("|")) {
    const rows = [];
    while (i < lines.length && lines[i].startsWith("|")) rows.push(lines[i++]);
    children.push(table(rows));
    children.push(new Paragraph({ spacing: { after: 80 } }));
    continue;
  } else if (l.startsWith(">")) {
    while (i < lines.length && lines[i].startsWith(">")) {
      const q = lines[i].replace(/^>\s?/, "");
      if (q.trim()) {
        const bullet = /^- /.test(q);
        children.push(new Paragraph({
          children: runs(bullet ? q.slice(2) : q, { color: INK }),
          numbering: bullet ? { reference: "bullets", level: 1 } : undefined,
          indent: bullet ? undefined : { left: 567 },
          border: { left: { style: BorderStyle.SINGLE, size: 18, color: RULE, space: 8 } },
          shading: { type: ShadingType.CLEAR, fill: QUOTE, color: "auto" },
          spacing: { after: 80, line: 300 },
        }));
      }
      i++;
    }
    children.push(new Paragraph({ spacing: { after: 40 } }));
    continue;
  } else if (/^\s*- /.test(l)) {
    children.push(new Paragraph({ children: runs(l.replace(/^\s*- /, "")), numbering: { reference: "bullets", level: 0 }, spacing: { after: 80, line: 300 } }));
  } else if (/^\d+\. /.test(l)) {
    if (!listRef || /^1\. /.test(l)) listRef = newNumbering();
    children.push(new Paragraph({ children: runs(l.replace(/^\d+\. /, "")), numbering: { reference: listRef, level: 0 }, spacing: { after: 80, line: 300 } }));
    i++; continue;
  } else if (/^\*[^*].*\*$/.test(l.trim())) {
    children.push(para(l.trim().slice(1, -1), { run: { italics: true, color: MUTED, size: 18 } }));
  } else {
    // Consecutive non-blank lines of a letter's address block stay as lines.
    children.push(para(l));
  }
  if (!/^\d+\. /.test(l)) listRef = null;
  i++;
}

const doc = new Document({
  title: `${title} (${version})`,
  creator: "Build New Habits",
  description: `${docName}, ${version}`,
  styles: {
    default: { document: { run: { font: FONT, size: 22, color: INK, language: { value: "en-GB" } } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal", run: { font: FONT, size: 40, bold: true, color: INK } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT, size: 28, bold: true, color: INK }, paragraph: { outlineLevel: 1, keepNext: true } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT, size: 24, bold: true, color: INK }, paragraph: { outlineLevel: 2, keepNext: true } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 567, hanging: 340 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "–", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 907, hanging: 340 } } } },
      ] },
      ...numberingConfigs,
    ],
  },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: `Alongside: Move · ${docName} · ${version}`, font: FONT, size: 18, color: MUTED })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
      children: [new TextRun({ children: ["Page ", PageNumber.CURRENT, " of ", PageNumber.TOTAL_PAGES], font: FONT, size: 18, color: MUTED })] })] }) },
    children,
  }],
});

Packer.toBuffer(doc).then(buf => { fs.writeFileSync(outPath, buf); console.log("wrote", outPath); });
