/**
 * js/figures.js
 * 04 Oct 2026 v1
 *
 * v1 - D-4 FIGURES (Graeme, 04 Oct: "Love it. Absolutely love it. Please
 *   do these, obviously in batches, for all of the exercises"). Stick-figure
 *   drawings of each exercise: one to three positions side by side, drawn
 *   as inline SVG from a pose, never an image file.
 *
 * ── HOW A FIGURE IS DESCRIBED ─────────────────────────────────────────
 *
 * js/data/figures/ holds, per exercise id:
 *   { w: 160 | 180, f: [ frame, frame ] }
 * and each frame is
 *   { l: "Start",            the caption under it (seen by everyone)
 *     a: "Standing tall…",   what it shows, for a screen reader
 *     g: "floor" | "mat" | "none",
 *     p: pose | [pose, …],   the person (side or front view)
 *     x: [ prop, … ] }       equipment, arrows, the "feel it here" ring
 *
 * A POSE is joint ANGLES, not coordinates, so every figure has the same
 * body: torso 46, head 12 (its centre 16 past the shoulder), upper arm and
 * forearm 26, thigh and shin 38, foot 14. An angle is the direction a
 * segment points: 0 is straight down, 90 is to the right (forward, for a
 * figure facing right), 180 straight up, -90 to the left.
 *
 *   side view:  { hip:[x,y], t: torso, h: head (default t),
 *                 nl:[thigh, shin, foot],  near leg  (white)
 *                 fl:[…],                  far leg   (pale)
 *                 na:[upper, fore],        near arm  (white)
 *                 fa:[…],                  far arm   (pale)
 *                 bend:[dx,dy],            a curved spine (cat, cow)
 *                 hold: "dbv"|"dbs"|"dbw"|"kb"|"plate"   in the near hand
 *                 holdF: …                               in the far hand }
 *   front view: { v:"front", hip:[x,y], t, h,
 *                 ll, rl: legs, la, ra: arms (screen left and right),
 *                 hold / holdL / holdR, pale: ["la", …] }
 *
 * Props, in the frame's own coordinates (viewBox 0 0 w 200, floor at 190):
 *   chair:[x,seatY]  bench:[x1,x2,y]  box:[x,y,w,h]  bar:[x1,y1,x2,y2]
 *   ln:[x1,y1,x2,y2] (a cable)  pulley:[x,y]  wall:x  ball:[x,y,r]
 *   band:[x1,y1,x2,y2]  db:[x,y,"v"|"s"|"w"]  kb:[x,y]  plate:[x,y]
 *   mv:[x1,y1,x2,y2] / mvq:[x1,y1,cx,cy,x2,y2]  the movement (an arrow)
 *   guide:[x1,y1,x2,y2]  a dashed "keep this line"
 *   ring:[x,y]  where it should be felt   pad:[x,y,w,h]  a pad in front (thigh pad)
 *   body:[[x,y,…]] / far:[[…]] / head:[x,y]  raw lines, for what no pose fits
 *
 * ── HOW IT LOOKS ──────────────────────────────────────────────────────
 *
 * Colours are the app's own tokens, so the three colour schemes need
 * nothing: the person in --color-text, their far side and equipment in
 * --color-text-secondary, weights in --kind-amber, the movement in
 * --color-primary, the floor in --color-border. Colour is never the only
 * cue: every frame has a caption, and the far side is also thinner.
 *
 * Each frame is role="img" with its description; the group is labelled
 * "How it looks". Nothing moves.
 */

import { FIGURES } from "./data/figures/index.js";

const L = { torso: 46, head: 16, headR: 12, upper: 26, fore: 26, thigh: 38, shin: 38, foot: 14, shoulderHalf: 16, hipHalf: 8 };
const FLOOR = 190;

let _uid = 0;

const r1 = n => Math.round(n * 10) / 10;
const dir = a => { const rad = a * Math.PI / 180; return [Math.sin(rad), Math.cos(rad)]; };
const step = (p, a, len) => { const [dx, dy] = dir(a); return [p[0] + dx * len, p[1] + dy * len]; };
const pts = arr => arr.map(p => `${r1(p[0])},${r1(p[1])}`).join(" ");
const esc = s => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The ids that have a figure. */
export function hasFigure(id) {
  return !!(id && FIGURES[id] && Array.isArray(FIGURES[id].f) && FIGURES[id].f.length);
}

// ── Limbs ────────────────────────────────────────────────────────────

function leg(hip, a) {
  if (!Array.isArray(a)) return null;
  const k = step(hip, a[0], L.thigh);
  const an = step(k, a[1], L.shin);
  const t = step(an, a[2] == null ? 90 : a[2], L.foot);
  return [t, an, k, hip];
}

function arm(sh, a) {
  if (!Array.isArray(a)) return null;
  const e = step(sh, a[0], L.upper);
  const h = step(e, a[1], L.fore);
  return [sh, e, h];
}

function holdShape(kind, at) {
  if (!kind || !at) return "";
  const [x, y] = at;
  switch (kind) {
    case "dbv": return `<rect class="fig-wt" x="${r1(x - 5)}" y="${r1(y - 12)}" width="10" height="24" rx="3"></rect>`;
    case "dbs": return `<rect class="fig-wt" x="${r1(x - 7)}" y="${r1(y - 5)}" width="14" height="10" rx="3"></rect>`;
    case "dbw": return `<rect class="fig-wt" x="${r1(x - 11)}" y="${r1(y - 4)}" width="22" height="8" rx="3"></rect>`;
    case "kb": return `<circle class="fig-wt" cx="${r1(x)}" cy="${r1(y + 9)}" r="8"></circle><path class="fig-wt-line" d="M${r1(x - 4)} ${r1(y + 3)} Q${r1(x)} ${r1(y - 4)} ${r1(x + 4)} ${r1(y + 3)}"></path>`;
    case "plate": return `<circle class="fig-wt-line" cx="${r1(x)}" cy="${r1(y)}" r="13"></circle>`;
    default: return "";
  }
}

// ── A pose to lines ──────────────────────────────────────────────────

function sidePose(p) {
  const out = { near: [], far: [], spine: null, head: null, holds: [] };
  const hip = p.hip;
  const sh = step(hip, p.t, L.torso);
  out.head = step(sh, p.h == null ? p.t : p.h, L.head);
  if (Array.isArray(p.bend)) {
    const mid = [(hip[0] + sh[0]) / 2 + p.bend[0], (hip[1] + sh[1]) / 2 + p.bend[1]];
    out.spine = `M${r1(hip[0])} ${r1(hip[1])} Q${r1(mid[0])} ${r1(mid[1])} ${r1(sh[0])} ${r1(sh[1])}`;
  } else {
    out.near.push([hip, sh]);
  }
  const fl = leg(hip, p.fl); if (fl) out.far.push(fl);
  const fa = arm(sh, p.fa); if (fa) { out.far.push(fa); if (p.holdF) out.holds.push(holdShape(p.holdF, fa[2])); }
  const nl = leg(hip, p.nl); if (nl) out.near.push(nl);
  const na = arm(sh, p.na); if (na) { out.near.push(na); if (p.hold) out.holds.push(holdShape(p.hold, na[2])); }
  return out;
}

function frontPose(p) {
  const out = { near: [], far: [], spine: null, head: null, holds: [] };
  const hip = p.hip;
  const sh = step(hip, p.t == null ? 180 : p.t, L.torso);
  const [dx, dy] = dir(p.t == null ? 180 : p.t);
  const perp = [-dy, dx];                       // screen right when upright
  const at = (c, s, n) => [c[0] + perp[0] * s * n, c[1] + perp[1] * s * n];
  const shL = at(sh, -1, L.shoulderHalf), shR = at(sh, 1, L.shoulderHalf);
  const hpL = at(hip, -1, L.hipHalf), hpR = at(hip, 1, L.hipHalf);
  out.head = step(sh, p.h == null ? (p.t == null ? 180 : p.t) : p.h, L.head + 2);
  out.near.push([hip, sh], [shL, shR]);
  const pale = new Set(p.pale || []);
  const put = (key, line, hold) => {
    if (!line) return;
    (pale.has(key) ? out.far : out.near).push(line);
    if (hold) out.holds.push(holdShape(hold, line[line.length - 1]));
  };
  // A front-view leg ends at the foot; the foot points out a little.
  const fleg = (h, a, side) => {
    if (!Array.isArray(a)) return null;
    const k = step(h, a[0], L.thigh), an = step(k, a[1], L.shin);
    const t = step(an, a[2] == null ? (side < 0 ? -90 : 90) : a[2], 8);
    return [h, k, an, t];
  };
  put("ll", fleg(hpL, p.ll, -1));
  put("rl", fleg(hpR, p.rl, 1));
  put("la", arm(shL, p.la), p.holdL || p.hold);
  put("ra", arm(shR, p.ra), p.holdR || p.hold);
  // hips: a short line, so the legs start apart
  out.near.push([hpL, hpR]);
  return out;
}

// ── Props ────────────────────────────────────────────────────────────

function propsBack(x) {
  const s = [];
  for (const o of x || []) {
    if (o.chair) {
      const [cx, cy] = o.chair;
      s.push(`<g class="fig-eq"><line x1="${cx + 2}" y1="${cy}" x2="${cx + 2}" y2="${cy - 42}"></line><line x1="${cx + 4}" y1="${cy + 6}" x2="${cx + 4}" y2="${FLOOR}"></line><line x1="${cx + 36}" y1="${cy + 6}" x2="${cx + 36}" y2="${FLOOR}"></line></g><rect class="fig-eq-fill" x="${cx}" y="${cy}" width="40" height="6" rx="2"></rect>`);
    }
    if (o.bench) {
      const [x1, x2, y] = o.bench;
      s.push(`<rect class="fig-eq-dark" x="${x1}" y="${y}" width="${x2 - x1}" height="8" rx="2"></rect><g class="fig-eq-dark-line"><line x1="${x1 + 6}" y1="${y + 8}" x2="${x1 + 6}" y2="${FLOOR}"></line><line x1="${x2 - 6}" y1="${y + 8}" x2="${x2 - 6}" y2="${FLOOR}"></line></g>`);
    }
    if (o.box) { const [bx, by, bw, bh] = o.box; s.push(`<rect class="fig-eq-dark" x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="3"></rect>`); }
    if (o.wall != null) s.push(`<line class="fig-floor" x1="${o.wall}" y1="20" x2="${o.wall}" y2="${FLOOR}"></line>`);
    if (o.ln) { const [a, b, c, d] = o.ln; s.push(`<line class="fig-cable" x1="${a}" y1="${b}" x2="${c}" y2="${d}"></line>`); }
    if (o.pulley) s.push(`<circle class="fig-eq-ring" cx="${o.pulley[0]}" cy="${o.pulley[1]}" r="5"></circle>`);
    if (o.ball) { const [bx, by, br] = o.ball; s.push(`<circle class="fig-eq-ring" cx="${bx}" cy="${by}" r="${br}"></circle>`); }
    if (o.guide) { const [a, b, c, d] = o.guide; s.push(`<line class="fig-guide" x1="${a}" y1="${b}" x2="${c}" y2="${d}"></line>`); }
  }
  return s.join("");
}

function propsFront(x, mid) {
  const s = [];
  for (const o of x || []) {
    if (o.bar) { const [a, b, c, d] = o.bar; s.push(`<line class="fig-bar" x1="${a}" y1="${b}" x2="${c}" y2="${d}"></line>`); }
    if (o.band) { const [a, b, c, d] = o.band; s.push(`<line class="fig-band" x1="${a}" y1="${b}" x2="${c}" y2="${d}"></line>`); }
    if (o.db) s.push(holdShape("db" + (o.db[2] || "s"), o.db));
    if (o.kb) s.push(holdShape("kb", o.kb));
    if (o.plate) s.push(holdShape("plate", o.plate));
    if (o.mv) { const [a, b, c, d] = o.mv; s.push(`<line class="fig-move" x1="${a}" y1="${b}" x2="${c}" y2="${d}" marker-end="url(#${mid})"></line>`); }
    if (o.mvq) { const [a, b, c, d, e, f] = o.mvq; s.push(`<path class="fig-move" d="M${a} ${b} Q${c} ${d} ${e} ${f}" marker-end="url(#${mid})"></path>`); }
    if (o.pad) { const [px, py, pw, ph] = o.pad; s.push(`<rect class="fig-eq-fill" x="${px}" y="${py}" width="${pw}" height="${ph}" rx="4"></rect>`); }
    if (o.ring) s.push(`<circle class="fig-ring" cx="${o.ring[0]}" cy="${o.ring[1]}" r="10"></circle>`);
  }
  return s.join("");
}

function rawLines(x, key) {
  const out = [];
  for (const o of x || []) if (Array.isArray(o[key])) for (const l of o[key]) {
    const p = []; for (let i = 0; i + 1 < l.length; i += 2) p.push([l[i], l[i + 1]]); out.push(p);
  }
  return out;
}

// ── A frame ──────────────────────────────────────────────────────────

/** One frame as an <svg>, or "" if it cannot be drawn. */
export function frameSvg(fig, frame) {
  if (!fig || !frame) return "";
  const w = fig.w || 160;
  const mid = `figm${++_uid}`;
  const poses = (Array.isArray(frame.p) ? frame.p : frame.p ? [frame.p] : []).map(p => p.v === "front" ? frontPose(p) : sidePose(p));
  const g = frame.g || "floor";
  const ground = g === "floor" ? `<line class="fig-floor" x1="8" y1="${FLOOR}" x2="${w - 8}" y2="${FLOOR}"></line>`
    : g === "mat" ? `<rect class="fig-mat" x="8" y="188" width="${w - 16}" height="4" rx="2"></rect>` : "";
  const line = (l, cls) => `<polyline class="${cls}" points="${pts(l)}"></polyline>`;
  const far = [...poses.flatMap(p => p.far), ...rawLines(frame.x, "far")].map(l => line(l, "fig-far")).join("");
  const near = [...poses.flatMap(p => p.near), ...rawLines(frame.x, "body")].map(l => line(l, "fig-body")).join("");
  const spines = poses.filter(p => p.spine).map(p => `<path class="fig-body" d="${p.spine}"></path>`).join("");
  const heads = [...poses.map(p => p.head), ...(frame.x || []).filter(o => o.head).map(o => o.head)]
    .filter(Boolean).map(h => `<circle class="fig-head" cx="${r1(h[0])}" cy="${r1(h[1])}" r="${L.headR}"></circle>`).join("");
  const holds = poses.flatMap(p => p.holds).join("");
  return `<svg class="fig-svg" viewBox="0 0 ${w} 200" role="img" aria-label="${esc(frame.a)}" focusable="false">` +
    `<defs><marker id="${mid}" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path class="fig-arrowhead" d="M0 0L10 5L0 10z"></path></marker></defs>` +
    ground + propsBack(frame.x) + far + spines + near + heads + holds + propsFront(frame.x, mid) +
    `</svg>`;
}

/**
 * The figure for an exercise: its frames side by side, each with its
 * caption, in a group labelled "How it looks". "" when there is none.
 */
export function renderFigure(exercise, opts = {}) {
  const id = typeof exercise === "string" ? exercise : exercise?.id;
  if (!hasFigure(id)) return "";
  return renderFigureData(FIGURES[id], opts);
}

/** The same, from a figure's own data (the contact sheet draws a batch not yet listed). */
export function renderFigureData(fig, { className = "" } = {}) {
  if (!fig || !Array.isArray(fig.f) || !fig.f.length) return "";
  const n = fig.f.length;
  return `<div class="xfig xfig--${n}${className ? " " + className : ""}" role="group" aria-label="How it looks">` +
    fig.f.map(fr => `<figure class="xfig__frame">${frameSvg(fig, fr)}<figcaption class="xfig__cap">${esc(fr.l)}</figcaption></figure>`).join("") +
    `</div>`;
}

/** For checks: every point a frame draws, and its viewBox width. */
export function framePoints(fig, frame) {
  const poses = (Array.isArray(frame.p) ? frame.p : frame.p ? [frame.p] : []).map(p => p.v === "front" ? frontPose(p) : sidePose(p));
  const all = [];
  for (const p of poses) { for (const l of [...p.near, ...p.far]) all.push(...l); if (p.head) all.push(p.head); }
  return { w: fig.w || 160, points: all };
}
