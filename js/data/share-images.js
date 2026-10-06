/**
 * data/share-images.js
 * 06 Oct 2026 v1
 *
 * D-11 PROGRESS-SHARE. The shared picture (4:5, 1080 x 1350, for a post or
 * a message) and the certificate (A4 landscape, 1754 x 1240, to keep or
 * print), drawn on the phone from the report model (data/progress-report.js
 * buildReport). Nothing is sent anywhere: the person shares or saves the
 * file through their phone.
 *
 * BRAND AND LAYERING RULES (Graeme, 06 Oct, on the mock-up: "symbols and
 * shapes etc covering words. There needs to be a rule about what's
 * important and what goes in front"; "this is not branded. We have logos
 * in the repo, these need to be used."):
 *   1. Words and numbers first, on plain ground, in front of everything.
 *   2. Nothing behind or across text: no shapes, logos or images.
 *   3. Shapes and colour bands only in their own zones (the kinds bar, the
 *      header line, the footer band, the certificate's side panel).
 *   4. The real logos from assets/images/brand (made from the repo's
 *      logo-icon-512.png, logo-wordmark.png and icons/BNH Logo.png, their
 *      dark squares removed, shapes unchanged), never redrawn: the
 *      Alongside icon and wordmark once at the top, the Build New Habits
 *      mark at the foot, as the maker.
 *   5. Clear space round every logo of at least half the icon's height.
 *   6. Dark ground: teal icon, white wordmark. Light ground: deep-teal icon,
 *      navy wordmark.
 * Every colour pair used here meets WCAG 1.4.3 for text (4.5:1, or 3:1 at
 * 24px and over) and 1.4.11 for the colour bars (3:1); a colour is never
 * the only thing said (each kind is named and counted beside its colour).
 */
import { minutesShort, minutesText } from "./progress-report.js";

const BRAND = "assets/images/brand/";
const KIND_DARK  = { teal: "#2DD4BF", amber: "#FBBF24", violet: "#A78BFA", blue: "#60A5FA", rose: "#FB7185", green: "#34D399", slate: "#94A3B8" };
const KIND_LIGHT = { teal: "#0F766E", amber: "#92400E", violet: "#6D28D9", blue: "#1D4ED8", rose: "#BE123C", green: "#047857", slate: "#475569" };

const _images = new Map();
function _img(name) {
  if (!_images.has(name)) {
    _images.set(name, new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = () => reject(new Error(`could not load ${name}`));
      im.src = BRAND + name;
    }));
  }
  return _images.get(name);
}

async function _fonts(list) {
  if (typeof document === "undefined" || !document.fonts) return;
  await Promise.all(list.map(f => document.fonts.load(f).catch(() => null)));
}

function _canvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return c;
}

/** Lines of words that fit a width. */
function _wrap(ctx, text, width) {
  const out = [];
  for (const para of String(text).split("\n")) {
    let line = "";
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(next).width > width) { out.push(line); line = word; }
      else line = next;
    }
    out.push(line);
  }
  return out;
}

/** The largest size (down to min) at which text fits on one line. */
function _fit(ctx, text, width, font, size, min) {
  let s = size;
  for (; s > min; s -= 4) { ctx.font = font(s); if (ctx.measureText(text).width <= width) break; }
  ctx.font = font(s);
  return s;
}

function _spaced(ctx, px) { if ("letterSpacing" in ctx) ctx.letterSpacing = px; }

function _drawLogo(ctx, im, x, y, h) {
  const w = im.width * (h / im.height);
  ctx.drawImage(im, x, y, w, h);
  return w;
}

const HEADLINES = { 1: "My day,\nmy way.", 7: "My week,\nmy way.", 14: "My fortnight,\nmy way.", 30: "My month,\nmy way.", 90: "My 90 days,\nmy way." };
export function headlineFor(days) { return HEADLINES[days] || "My time,\nmy way."; }

/** A kinds bar and its legend, laid out bottom-up so it never meets the words above. */
function _kindsZone(ctx, kinds, { x, width, bottom, palette, text, size }) {
  if (!kinds.length) return bottom;
  ctx.font = `500 ${size}px Inter`;
  // Legend lines, wrapped across the width.
  const items = kinds.map(k => ({ k, label: `${k.label} ${k.count}` }));
  const lines = [];
  let line = [];
  let used = 0;
  const sq = Math.round(size * 0.65), gap = Math.round(size * 1.2);
  for (const it of items) {
    const w = sq + 14 + ctx.measureText(it.label).width;
    if (line.length && used + gap + w > width) { lines.push(line); line = []; used = 0; }
    used += (line.length ? gap : 0) + w; line.push({ ...it, w });
  }
  if (line.length) lines.push(line);
  const lh = Math.round(size * 1.45);
  let y = bottom - lines.length * lh;
  const top = y - Math.round(size * 0.9) - Math.round(size * 1.2);
  // The bar, in its own zone above the legend.
  const barH = Math.round(size * 1.15), barY = top;
  const total = kinds.reduce((n, k) => n + k.count, 0);
  const segGap = 10;
  let bx = x;
  const usable = width - segGap * (kinds.length - 1);
  kinds.forEach((k, i) => {
    const w = Math.max(barH, Math.round(usable * k.count / total));
    const ww = i === kinds.length - 1 ? x + width - bx : w;
    ctx.fillStyle = palette[k.kind] || palette.slate;
    ctx.beginPath(); ctx.roundRect(bx, barY, ww, barH, barH / 2); ctx.fill();
    bx += ww + segGap;
  });
  // The legend: each colour named and counted beside it (1.4.1).
  ctx.textBaseline = "middle";
  for (const ln of lines) {
    let lx = x; const cy = y + lh / 2;
    for (const it of ln) {
      ctx.fillStyle = palette[it.k.kind] || palette.slate;
      ctx.beginPath(); ctx.roundRect(lx, cy - sq / 2, sq, sq, 5); ctx.fill();
      ctx.fillStyle = text;
      ctx.font = `500 ${size}px Inter`;
      ctx.fillText(it.label, lx + sq + 14, cy);
      lx += it.w + gap;
    }
    y += lh;
  }
  ctx.textBaseline = "alphabetic";
  return top;
}

/**
 * The picture: 1080 x 1350. Header band (logos, dates), the words and
 * numbers on plain ground, the kinds zone, the footer band (the maker).
 */
export async function drawPicture(model) {
  await _fonts(["800 128px Inter", "700 40px Inter", "600 30px Inter", "500 34px Inter"]);
  const [icon, word, bnh] = await Promise.all([_img("alongside-icon-teal.png"), _img("alongside-wordmark-light.png"), _img("bnh-mark-light.png")]);
  const W = 1080, H = 1350, PAD = 88;
  const c = _canvas(W, H), ctx = c.getContext("2d");
  ctx.fillStyle = "#0F172A"; ctx.fillRect(0, 0, W, H);

  // Header band: the Alongside icon and wordmark, the dates.
  const iw = _drawLogo(ctx, icon, PAD, 54, 92);
  _drawLogo(ctx, word, PAD + iw + 28, 68, 64);
  ctx.fillStyle = "#CBD5E1"; ctx.textAlign = "right";
  ctx.font = "600 30px Inter";
  ctx.fillText(model.range.days === 1 ? model.range.title.replace(/^\w+ /, "") : model.range.title, W - PAD, 112);
  ctx.textAlign = "left";
  ctx.fillStyle = "#1E293B"; ctx.fillRect(0, 198, W, 2);

  // Footer band: the maker.
  const FOOT = 1200;
  ctx.fillStyle = "#1E293B"; ctx.fillRect(0, FOOT, W, H - FOOT);
  const bw = _drawLogo(ctx, bnh, PAD, FOOT + 39, 72);
  ctx.fillStyle = "#F8FAFC"; ctx.font = "700 30px Inter"; ctx.fillText("Build New Habits", PAD + bw + 22, FOOT + 68);
  ctx.fillStyle = "#CBD5E1"; ctx.font = "500 24px Inter"; ctx.fillText("Moving at my own pace with Alongside", PAD + bw + 22, FOOT + 104);
  ctx.textAlign = "right"; ctx.font = "500 26px Inter"; ctx.fillText("buildnewhabits.co.uk", W - PAD, FOOT + 86); ctx.textAlign = "left";

  // The kinds zone, bottom-up from above the footer.
  const kindsTop = _kindsZone(ctx, model.kinds, { x: PAD, width: W - PAD * 2, bottom: FOOT - 64, palette: KIND_DARK, text: "#E2E8F0", size: 34 });

  // Words and numbers, top-down, on plain ground.
  let y = 288;
  if (model.name) {
    ctx.fillStyle = "#5EEAD4"; ctx.font = "600 40px Inter";
    ctx.fillText(model.name, PAD, y); y += 64;
  }
  ctx.fillStyle = "#F8FAFC";
  const hs = _fit(ctx, "My fortnight,", W - PAD * 2, s => `800 ${s}px Inter`, 128, 72);
  for (const ln of headlineFor(model.range.days).split("\n")) { y += Math.round(hs * 0.98); ctx.fillText(ln, PAD, y); }
  if (model.include.sessions) {
    y += 88;
    const n = String(model.totals.sessions), m = minutesShort(model.totals.mins);
    const room = Math.min(kindsTop - 40, H) - y;
    const big = Math.max(96, Math.min(176, Math.round(room * 0.62)));
    ctx.fillStyle = "#2DD4BF";
    const ns = _fit(ctx, `${n}${m}`, W - PAD * 2 - 96, s => `800 ${s}px Inter`, big, 72);
    y += ns;
    ctx.fillText(n, PAD, y);
    const nw = Math.max(ctx.measureText(n).width, 160);
    if (model.totals.mins) ctx.fillText(m, PAD + nw + 96, y);
    ctx.fillStyle = "#CBD5E1"; ctx.font = "500 36px Inter";
    ctx.fillText(model.totals.sessions === 1 ? "session" : "sessions", PAD, y + 56);
    if (model.totals.mins) ctx.fillText("of moving", PAD + nw + 96, y + 56);
  }
  return c;
}

const COUNT_WORDS = { 1: "once", 2: "twice" };

/**
 * The certificate: A4 landscape. A navy panel down the left (the Alongside
 * icon and wordmark, what it was); the name, the sentence and the numbers
 * on cream; the maker at the foot.
 */
export async function drawCertificate(model, { arc = null } = {}) {
  await _fonts(["500 150px Newsreader", "italic 400 46px Newsreader", "700 72px Inter", "600 22px Inter", "500 26px Inter"]);
  const [icon, word, bnh] = await Promise.all([_img("alongside-icon-teal.png"), _img("alongside-wordmark-light.png"), _img("bnh-mark-deep.png")]);
  const W = 1754, H = 1240, SIDE = 470;
  const c = _canvas(W, H), ctx = c.getContext("2d");
  ctx.fillStyle = "#FBFAF6"; ctx.fillRect(0, 0, W, H);

  // The side panel: its own zone.
  ctx.fillStyle = "#0F172A"; ctx.fillRect(0, 0, SIDE, H);
  _drawLogo(ctx, icon, 72, 96, 168);
  _drawLogo(ctx, word, 72, 312, 70);
  ctx.fillStyle = "#5EEAD4"; ctx.font = "700 24px Inter"; _spaced(ctx, "4px");
  ctx.fillText("MOVE", 76, 428);
  let ky = 540;
  if (model.kinds.length) {
    ctx.fillStyle = "#CBD5E1"; ctx.font = "600 22px Inter";
    ctx.fillText("WHAT IT WAS", 76, ky); _spaced(ctx, "0px");
    ky += 54;
    for (const k of model.kinds.slice(0, 8)) {
      ctx.fillStyle = KIND_DARK[k.kind] || KIND_DARK.slate;
      ctx.beginPath(); ctx.roundRect(76, ky - 20, 22, 22, 5); ctx.fill();
      ctx.fillStyle = "#F8FAFC"; ctx.font = "500 28px Inter";
      ctx.fillText(k.label, 116, ky);
      ctx.textAlign = "right"; ctx.font = "700 28px Inter"; ctx.fillText(String(k.count), SIDE - 64, ky); ctx.textAlign = "left";
      ky += 54;
    }
  }
  _spaced(ctx, "0px");
  ctx.fillStyle = "#CBD5E1"; ctx.font = "500 24px Inter";
  ctx.fillText("buildnewhabits.co.uk", 76, H - 72);

  // The cream side.
  ctx.fillStyle = "#0F766E"; ctx.fillRect(SIDE, 0, W - SIDE, 14);
  const X = SIDE + 110, RW = W - X - 110;
  let y = 172;
  ctx.fillStyle = "#0F766E"; ctx.font = "600 24px Inter"; _spaced(ctx, "4px");
  ctx.fillText("A RECORD OF MOVING", X, y); _spaced(ctx, "0px");
  y += 40;
  ctx.fillStyle = "#0F172A";
  const head = model.name || model.range.title;
  const hs = _fit(ctx, head, RW, s => `500 ${s}px Newsreader`, model.name ? 168 : 120, 72);
  y += hs; ctx.fillText(head, X, y);

  const n = model.totals.sessions;
  const times = COUNT_WORDS[n] || `${n} times`;
  const lead = model.name ? "moved" : "Moved";
  const sentence = model.range.days === 1
    ? `${lead} ${times} on ${model.range.title}.`
    : `${lead} ${times} in ${model.range.days} days, from ${model.range.from.toLocaleDateString("en-GB", { day: "numeric", month: "long" })} to ${model.range.to.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}. Each time at a pace that suited the day.`;
  ctx.fillStyle = "#1E293B"; ctx.font = "italic 400 46px Newsreader";
  y += 92;
  for (const ln of _wrap(ctx, sentence, RW)) { ctx.fillText(ln, X, y); y += 64; }

  // The numbers.
  y += 60;
  const nums = [[String(n), n === 1 ? "session" : "sessions"]];
  if (model.include.sessions && model.totals.mins) nums.push([minutesShort(model.totals.mins), "of moving"]);
  if (model.kinds.length) nums.push([String(model.kinds.length), model.kinds.length === 1 ? "kind of session" : "kinds of session"]);
  let nx = X;
  for (const [v, l] of nums) {
    ctx.fillStyle = "#0F766E"; ctx.font = "700 76px Inter"; ctx.fillText(v, nx, y);
    const vw = ctx.measureText(v).width;
    ctx.fillStyle = "#475569"; ctx.font = "500 26px Inter"; ctx.fillText(l, nx, y + 44);
    nx += Math.max(vw, ctx.measureText(l).width) + 96;
  }

  // The arc, when the person chose to include it.
  if (arc && arc.aim) {
    y += 124;
    ctx.font = "600 26px Inter";
    const a = `Your arc · Week ${arc.week}`;
    const aw = ctx.measureText(a).width;
    ctx.font = "500 26px Inter";
    const bw = ctx.measureText(arc.aim).width;
    const pw = Math.min(RW, aw + bw + 24 + 64);
    ctx.strokeStyle = "#0F766E"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(X, y - 40, pw, 60, 30); ctx.stroke();
    ctx.fillStyle = "#0F766E"; ctx.font = "600 26px Inter"; ctx.fillText(a, X + 32, y);
    ctx.fillStyle = "#0F172A"; ctx.font = "500 26px Inter"; ctx.fillText(arc.aim, X + 32 + aw + 24, y);
  }

  // The foot: made on, and the maker.
  const FY = H - 150;
  ctx.fillStyle = "#CBD5E1"; ctx.fillRect(X, FY, RW, 2);
  ctx.fillStyle = "#334155"; ctx.font = "500 26px Inter";
  ctx.fillText(`Made on ${model.madeAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`, X, FY + 56);
  ctx.fillStyle = "#475569";
  ctx.fillText("You did the work. Alongside kept the record.", X, FY + 96);
  ctx.textAlign = "right"; ctx.fillStyle = "#0F172A"; ctx.font = "700 28px Inter";
  ctx.fillText("Build New Habits", X + RW, FY + 84);
  const tw = ctx.measureText("Build New Habits").width;
  ctx.textAlign = "left";
  const mh = 72, mw = bnh.width * (mh / bnh.height);
  ctx.drawImage(bnh, X + RW - tw - 20 - mw, FY + 30, mw, mh);
  return c;
}

/** A canvas as a PNG Blob. */
export function canvasBlob(c) {
  return new Promise((resolve, reject) => c.toBlob(b => b ? resolve(b) : reject(new Error("no image")), "image/png"));
}

export { minutesText };
