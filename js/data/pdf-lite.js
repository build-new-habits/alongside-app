/**
 * js/data/pdf-lite.js
 * 15 Nov 2026 v1
 *
 * P-33 PLAN-SHARE (Graeme, 15 Nov: "Yes" to a PDF made on the phone). A
 * small PDF maker for text documents, written for this app rather than
 * a third-party library (about 400 KB, and code the app would carry for
 * features it never uses). It lays out blocks of text, tables and ruled
 * lines on A4 pages in the PDF's own Helvetica, so the text is real text:
 * it can be selected, searched and read aloud by a PDF reader. Nothing is
 * sent anywhere; the bytes are made on the phone.
 *
 *   makePdf({ title, lang, blocks }) -> Uint8Array (a whole PDF file)
 *
 * Blocks: head { eyebrow, title, brand }, h { text }, h5 { text, sub },
 * big { text }, p { runs: [{ text, b, i }] | text }, small { text },
 * table { head?, rows, widths? }, dl { items: [[term, words]] },
 * lines { n }, foot { text }, notes { title, n, foot } (a heading, ruled
 * lines and the footer, kept together on one page). Every page has
 * "Page n of N".
 *
 * Characters outside Windows-1252 (the encoding the PDF's built-in fonts
 * use) print as "?"; the app's own words never need them.
 */

// Character widths (thousandths of the font size) for bytes 32 to 255, from
// the standard Adobe metrics for the PDF's built-in Helvetica fonts.
const W = {
  F1: [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584,761,556,0,222,556,333,1000,556,556,333,1000,667,333,1000,0,611,0,0,222,222,333,333,350,556,1000,333,1000,500,333,944,0,500,667,278,333,556,556,556,556,260,556,333,737,370,556,584,333,737,333,400,584,333,333,333,556,537,278,333,333,365,556,834,834,834,611,667,667,667,667,667,667,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,500,556,556,556,556,278,278,278,278,556,556,556,556,556,556,556,584,611,556,556,556,556,500,556,500],
  F2: [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584,761,556,0,278,556,500,1000,556,556,333,1000,667,333,1000,0,611,0,0,278,278,500,500,350,556,1000,333,1000,556,333,944,0,500,667,278,333,556,556,556,556,280,556,333,737,370,556,584,333,737,333,400,584,333,333,333,611,556,278,333,333,365,556,834,834,834,611,722,722,722,722,722,722,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,556,556,556,556,556,278,278,278,278,611,611,611,611,611,611,611,584,611,611,611,611,611,556,611,556],
  F3: [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584,761,556,0,222,556,333,1000,556,556,333,1000,667,333,1000,0,611,0,0,222,222,333,333,350,556,1000,333,1000,500,333,944,0,500,667,278,333,556,556,556,556,260,556,333,737,370,556,584,333,737,333,400,584,333,333,333,556,537,278,333,333,365,556,834,834,834,611,667,667,667,667,667,667,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,500,556,556,556,556,278,278,278,278,556,556,556,556,556,556,556,584,611,556,556,556,556,500,556,500],
};
const FONT = { F1: "Helvetica", F2: "Helvetica-Bold", F3: "Helvetica-Oblique" };

// Unicode to Windows-1252 for the characters above 0x7F that are not Latin-1.
const CP = { 0x20AC: 0x80, 0x201A: 0x82, 0x0192: 0x83, 0x201E: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02C6: 0x88,
  0x2030: 0x89, 0x0160: 0x8A, 0x2039: 0x8B, 0x0152: 0x8C, 0x017D: 0x8E, 0x2018: 0x91, 0x2019: 0x92, 0x201C: 0x93,
  0x201D: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02DC: 0x98, 0x2122: 0x99, 0x0161: 0x9A, 0x203A: 0x9B,
  0x0153: 0x9C, 0x017E: 0x9E, 0x0178: 0x9F };

/** A string as Windows-1252 bytes (each a char code 0-255). */
export function toWinAnsi(s) {
  let out = "";
  for (const ch of String(s ?? "").replace(/\u00a0/g, " ")) {
    const c = ch.codePointAt(0);
    if (c < 0x80) out += c >= 32 || c === 9 ? (c === 9 ? " " : ch) : "";
    else if (CP[c]) out += String.fromCharCode(CP[c]);
    else if (c >= 0xA0 && c <= 0xFF) out += String.fromCharCode(c);
    else out += "?";
  }
  return out;
}

/** The width of WinAnsi text in points. */
export function textWidth(s, font, size) {
  let w = 0;
  for (let i = 0; i < s.length; i++) { const b = s.charCodeAt(i); w += b >= 32 ? (W[font][b - 32] || 500) : 0; }
  return (w * size) / 1000;
}

const esc = s => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
const n2 = x => (Math.round(x * 100) / 100).toString();

/** Runs of [{ text, font }] broken into lines no wider than max: [[{ text, font }]]. */
function wrapRuns(runs, size, max) {
  const words = [];
  for (const r of runs) {
    const parts = toWinAnsi(r.text).split(/( +)/).filter(p => p !== "");
    for (const p of parts) words.push({ text: p, font: r.font });
  }
  const lines = []; let line = [], w = 0;
  // A line's pieces in the same font are joined, so each line is a few whole strings of text.
  const join = l => l.reduce((out, r) => { const last = out[out.length - 1]; if (last && last.font === r.font) last.text += r.text; else out.push({ ...r }); return out; }, []);
  const push = () => { while (line.length && /^ +$/.test(line[line.length - 1].text)) line.pop(); lines.push(join(line)); line = []; w = 0; };
  for (const wd of words) {
    const ww = textWidth(wd.text, wd.font, size);
    if (/^ +$/.test(wd.text)) { if (line.length) { line.push(wd); w += ww; } continue; }
    if (w + ww > max && line.length) push();
    if (ww > max) {
      // A single word wider than the line: break it by characters.
      let cur = "";
      for (const ch of wd.text) {
        if (textWidth(cur + ch, wd.font, size) > max && cur) { line.push({ text: cur, font: wd.font }); push(); cur = ""; }
        cur += ch;
      }
      line.push({ text: cur, font: wd.font }); w = textWidth(cur, wd.font, size); continue;
    }
    line.push(wd); w += ww;
  }
  if (line.length || !lines.length) push();
  return lines;
}

const runsOf = b => b.runs ? b.runs.map(r => ({ text: r.text, font: r.b ? "F2" : r.i ? "F3" : "F1" })) : [{ text: b.text || "", font: "F1" }];

/**
 * A whole PDF from blocks.
 * Returns a Uint8Array.
 */
export function makePdf({ title = "Document", lang = "en-GB", blocks = [], now = new Date() } = {}) {
  const PW = 595.28, PH = 841.89, M = 50, TOP = PH - M, BOTTOM = M + 24, CW = PW - 2 * M;
  const INK = "0.07 0.09 0.15", TEAL = "0.06 0.46 0.43", SOFT = "0.33 0.37 0.43", RULE = "0.78 0.80 0.83";
  const pages = []; let ops = []; let y = TOP;
  const newPage = () => { if (ops.length) pages.push(ops); ops = []; y = TOP; };
  const need = h => { if (y - h < BOTTOM) newPage(); };
  const text = (x, yy, s, font, size, colour = INK) => ops.push(`BT ${colour} rg /${font} ${n2(size)} Tf ${n2(x)} ${n2(yy)} Td (${esc(s)}) Tj ET`);
  const line = (x1, yy, x2, colour = RULE, width = 0.75) => ops.push(`${colour} RG ${n2(width)} w ${n2(x1)} ${n2(yy)} m ${n2(x2)} ${n2(yy)} l S`);
  const drawRuns = (runs, size, x, max, lead, colour = INK) => {
    for (const l of wrapRuns(runs, size, max)) {
      need(lead); y -= lead;
      let xx = x;
      for (const r of l) { text(xx, y, r.text, r.font, size, colour); xx += textWidth(r.text, r.font, size); }
    }
  };

  for (const b of blocks) {
    switch (b.t) {
      case "head": {
        need(60);
        text(M, y - 10, toWinAnsi((b.eyebrow || "").toUpperCase()), "F2", 9, TEAL);
        if (b.brand) { const s = toWinAnsi(b.brand); text(M + CW - textWidth(s, "F2", 12), y - 12, s, "F2", 12, TEAL); }
        text(M, y - 32, toWinAnsi(b.title || ""), "F2", 18);
        y -= 44; line(M, y, M + CW, TEAL, 1.5); y -= 6; break;
      }
      case "h": y -= 12; need(40); drawRuns([{ text: b.text, font: "F2" }], 13, M, CW, 18); y -= 2; break;
      case "h5": {
        y -= 6; need(36);
        const runs = [{ text: b.text, font: "F2" }]; if (b.sub) runs.push({ text: "  " + b.sub, font: "F1" });
        drawRuns(runs, 11, M, CW, 15); break;
      }
      case "big": y -= 2; drawRuns([{ text: b.text, font: "F2" }], 13, M, CW, 17); y -= 2; break;
      case "p": drawRuns(runsOf(b), 10.5, M, CW, 14.5); y -= 2; break;
      case "small": y -= 2; drawRuns(runsOf(b), 8.5, M, CW, 11.5, SOFT); y -= 2; break;
      case "dl": {
        for (const [term, words] of b.items || []) {
          need(30);
          drawRuns([{ text: term, font: "F2" }], 10.5, M, CW, 14.5);
          drawRuns([{ text: words, font: "F1" }], 10.5, M, CW, 14.5);
          y -= 5; line(M, y, M + CW); y -= 2;
        }
        break;
      }
      case "notes": {
        // Kept together, so the last page is never the footer alone.
        need(30 + (b.n || 4) * 26 + 60);
        y -= 12; drawRuns([{ text: b.title, font: "F2" }], 13, M, CW, 18); y -= 4;
        for (let i = 0; i < (b.n || 4); i++) { y -= 26; line(M, y, M + CW); }
        y -= 14; line(M, y, M + CW); y -= 2; drawRuns(runsOf({ text: b.foot }), 8.5, M, CW, 11.5, SOFT); break;
      }
      case "table": {
        y -= 4;
        const fr = b.widths || [0.6, 0.4];
        const cols = fr.map(f => f * CW);
        const row = (cells, font, size, lead) => {
          const wrapped = cells.map((c, i) => wrapRuns([{ text: String(c ?? ""), font: i === 0 && b.rowHead ? "F2" : font }], size, cols[i] - 8));
          const h = Math.max(...wrapped.map(w => w.length)) * lead + 6;
          need(h);
          let x = M;
          wrapped.forEach((ls, i) => { ls.forEach((l, k) => { let xx = x; for (const r of l) { text(xx, y - lead * (k + 1) + 2, r.text, r.font, size); xx += textWidth(r.text, r.font, size); } }); x += cols[i]; });
          y -= h; line(M, y + 2, M + CW);
        };
        if (b.head) row(b.head.map(h => h.toUpperCase()), "F2", 7.5, 11);
        for (const r of b.rows || []) row(r, "F1", 10, 13.5);
        y -= 4; break;
      }
      case "lines": { y -= 6; for (let i = 0; i < (b.n || 4); i++) { need(26); y -= 26; line(M, y, M + CW); } break; }
      case "foot": y -= 10; need(30); line(M, y, M + CW); y -= 2; drawRuns(runsOf(b), 8.5, M, CW, 11.5, SOFT); break;
      case "space": y -= b.h || 8; break;
    }
  }
  if (ops.length) pages.push(ops);
  const N = pages.length;
  pages.forEach((p, i) => { const s = toWinAnsi(`Page ${i + 1} of ${N}`); p.push(`BT ${SOFT} rg /F1 8 Tf ${n2(PW / 2 - textWidth(s, "F1", 8) / 2)} ${n2(M - 6)} Td (${esc(s)}) Tj ET`); });

  // ── The file ─────────────────────────────────────────────────────────
  const objs = [];
  const add = body => { objs.push(body); return objs.length; };
  const pad = x => String(x).padStart(2, "0");
  const date = `D:${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const catalog = add(null), pagesObj = add(null);
  const fontIds = Object.keys(FONT).map(k => [k, add(`<< /Type /Font /Subtype /Type1 /BaseFont /${FONT[k]} /Encoding /WinAnsiEncoding >>`)]);
  const fontRes = fontIds.map(([k, id]) => `/${k} ${id} 0 R`).join(" ");
  const kids = [];
  for (const p of pages) {
    const stream = p.join("\n");
    const content = add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    kids.push(add(`<< /Type /Page /Parent ${pagesObj} 0 R /MediaBox [0 0 ${n2(PW)} ${n2(PH)}] /Resources << /Font << ${fontRes} >> >> /Contents ${content} 0 R >>`));
  }
  objs[pagesObj - 1] = `<< /Type /Pages /Kids [${kids.map(k => `${k} 0 R`).join(" ")}] /Count ${kids.length} >>`;
  objs[catalog - 1] = `<< /Type /Catalog /Pages ${pagesObj} 0 R /Lang (${esc(lang)}) /ViewerPreferences << /DisplayDocTitle true >> >>`;
  const info = add(`<< /Title (${esc(toWinAnsi(title))}) /Producer (Alongside: Move) /CreationDate (${date}) >>`);
  let out = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offs = [];
  objs.forEach((o, i) => { offs.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offs.map(o => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`;
  out += `trailer\n<< /Size ${objs.length + 1} /Root ${catalog} 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  const bytes = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 0xFF;
  return bytes;
}
