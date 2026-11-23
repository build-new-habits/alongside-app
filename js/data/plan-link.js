/**
 * data/plan-link.js
 * 23 Nov 2026 v1
 *
 * P-44 THE PHYSIO LINK, Stage 1 (spec docs/specs/alongside_physio-link_23nov2026_v1.md;
 * Graeme, 23 Nov: "Go ahead"). The one codec for the link the person sends
 * a physio or trainer and the link they send back. Used by the app and,
 * copied byte for byte, by the website's edit-plan page (a gate compares
 * the two), so it imports nothing and touches no store.
 *
 *   encodePlan(plan)        -> "v1." + base64url(deflate-raw(JSON))
 *   decodePlan(text)        -> { ok: true, plan } | { ok: false, why }
 *                              text: a whole link, its fragment, or the code
 *   checkPlan(plan)         -> the plan cleaned to the rules, or null
 *   outFromOwn(own, opts)   -> the out plan, from My exercises
 *   linkFor(base, code)     -> base + "#" + code
 *   amountText(s, r)        -> "3 × 12", "1 × 30 seconds each side"
 *   changesFrom(own, back)  -> what the professional changed, in words
 *   applyChanges(own, back, ids, opts) -> My exercises with the chosen ones
 *
 * The rules (spec section 4): at most 12 lists and 60 exercises; names 60
 * characters, reps 40, notes 200, list names 40, the professional's line
 * 300; sets a whole number 1 to 20; no < or >. The link is everything after
 * the #, so it is never sent to a server.
 */

export const LIMITS = Object.freeze({ lists: 12, exercises: 60, name: 60, reps: 40, note: 200, group: 40, say: 300, by: 40, sets: 20 });
export const VERSION = "v1";
export const NOT_COMPLETE = "This link is not complete. Ask for it to be sent again.";

const clean = (v, max) => typeof v === "string" ? v.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max) : "";
const isIso = v => typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v) && Number.isFinite(Date.parse(v));

/** The plan cleaned to the rules, or null when it cannot be read. */
export function checkPlan(p) {
  if (!p || typeof p !== "object" || Array.isArray(p)) return null;
  if (p.t !== "out" && p.t !== "back") return null;
  if (!isIso(p.at)) return null;
  if (!Array.isArray(p.lists) || !p.lists.length || p.lists.length > LIMITS.lists) return null;
  let count = 0;
  const lists = [];
  for (const l of p.lists) {
    if (!l || typeof l !== "object" || !Array.isArray(l.x)) return null;
    const g = clean(l.g, LIMITS.group);
    if (!g || lists.some(o => o.g === g)) return null;
    const x = [];
    for (const e of l.x) {
      if (!e || typeof e !== "object") return null;
      const n = clean(e.n, LIMITS.name);
      if (!n) return null;
      const one = { n };
      if (e.i !== undefined) { if (typeof e.i !== "string" || !/^[\w-]{1,60}$/.test(e.i)) return null; one.i = e.i; }
      if (e.l !== undefined) { if (typeof e.l !== "string" || !/^[\w-]{1,80}$/.test(e.l)) return null; one.l = e.l; }
      if (e.s !== undefined) { if (!Number.isInteger(e.s) || e.s < 1 || e.s > LIMITS.sets) return null; one.s = e.s; }
      const r = clean(e.r, LIMITS.reps); if (r) one.r = r;
      const nt = clean(e.nt, LIMITS.note); if (nt) one.nt = nt;
      x.push(one);
      if (++count > LIMITS.exercises) return null;
    }
    lists.push({ g, x });
  }
  const out = { t: p.t, at: p.at, lists };
  const by = clean(p.by, LIMITS.by); if (by) out.by = by;
  if (p.t === "back") {
    if (!isIso(p.of)) return null;
    out.of = p.of;
    const say = clean(p.say, LIMITS.say); if (say) out.say = say;
  }
  return out;
}

// ── bytes ─────────────────────────────────────────────────────────────────
function toB64url(bytes) {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromB64url(s) {
  const b = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4));
  const out = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
  return out;
}
async function pipe(bytes, stream) {
  const res = new Response(new Blob([bytes]).stream().pipeThrough(stream));
  return new Uint8Array(await res.arrayBuffer());
}

/** The code for a plan: "v1." and the plan, deflated, base64url. Refuses a plan that breaks the rules. */
export async function encodePlan(plan) {
  const p = checkPlan(plan);
  if (!p) throw new Error("plan-link: a plan that breaks the rules");
  const bytes = new TextEncoder().encode(JSON.stringify(p));
  return `${VERSION}.${toB64url(await pipe(bytes, new CompressionStream("deflate-raw")))}`;
}

/** A whole link, its fragment, or the code alone, read back. Never throws. */
export async function decodePlan(text) {
  try {
    let s = String(text || "").trim();
    const hash = s.indexOf("#");
    if (hash >= 0) s = s.slice(hash + 1);
    s = s.replace(/^(?:back|plan)=/, "");
    if (!s.startsWith(VERSION + ".")) return { ok: false, why: NOT_COMPLETE };
    const body = s.slice(VERSION.length + 1);
    if (!/^[A-Za-z0-9_-]{8,20000}$/.test(body)) return { ok: false, why: NOT_COMPLETE };
    const json = new TextDecoder().decode(await pipe(fromB64url(body), new DecompressionStream("deflate-raw")));
    const plan = checkPlan(JSON.parse(json));
    return plan ? { ok: true, plan } : { ok: false, why: NOT_COMPLETE };
  } catch {
    return { ok: false, why: NOT_COMPLETE };
  }
}

export const linkFor = (base, code) => `${String(base).replace(/#.*$/, "")}#${code}`;

/**
 * The out plan from My exercises. opts: { groups (names to send; all when
 * missing), notes (send notes), by (a first name), at }. An entry with no
 * list goes under "My exercises".
 */
export const NO_GROUP = "My exercises";
export function outFromOwn(own = [], { groups = null, notes = false, by = "", at = new Date().toISOString() } = {}) {
  const lists = [];
  for (const e of own) {
    if (!e || typeof e.name !== "string") continue;
    const g = clean(e.group, LIMITS.group) || NO_GROUP;
    if (groups && !groups.includes(g)) continue;
    let l = lists.find(o => o.g === g);
    if (!l) lists.push(l = { g, x: [] });
    const one = { i: e.id, n: e.name };
    if (e.exerciseId) one.l = e.exerciseId;
    if (Number.isInteger(e.sets)) one.s = e.sets;
    if (e.reps) one.r = String(e.reps);
    if (notes && e.notes) one.nt = String(e.notes);
    l.x.push(one);
  }
  const plan = { t: "out", at, lists };
  if (by) plan.by = by;
  return checkPlan(plan);
}

/** "3 × 12", "1 × 30 seconds each side", "3 sets", "12", or "". */
export function amountText(s, r) {
  const reps = r ? String(r) : "";
  if (Number.isInteger(s) && reps) return `${s} × ${reps}`;
  if (Number.isInteger(s)) return `${s} ${s === 1 ? "set" : "sets"}`;
  return reps;
}

/**
 * What the professional changed, against My exercises as they are now.
 * Only lists in the back plan are compared. Each change:
 *   { id, kind: "changed" | "added" | "removed", g, name, text, ex?, back? }
 * text is the change in words: "Glute bridge: 3 × 12 → 3 × 15",
 * "Added to Gym A: Side plank, 3 × 20 seconds", "Taken out of Gym A: Clamshell".
 */
export function changesFrom(own = [], back) {
  const out = [];
  if (!back || back.t !== "back") return out;
  const groupOf = e => clean(e.group, LIMITS.group) || NO_GROUP;
  for (const l of back.lists) {
    const mine = own.filter(e => e && groupOf(e) === l.g);
    const seen = new Set();
    l.x.forEach((b, k) => {
      const ex = b.i ? mine.find(e => e.id === b.i) : null;
      if (!ex) {
        const amt = amountText(b.s, b.r);
        out.push({ id: `add:${l.g}:${k}`, kind: "added", g: l.g, name: b.n, back: b,
          text: `Added to ${l.g}: ${b.n}${amt ? `, ${amt}` : ""}${b.nt ? `. Note: ${b.nt}` : ""}` });
        return;
      }
      seen.add(ex.id);
      const was = amountText(ex.sets, ex.reps), now = amountText(b.s, b.r);
      const parts = [];
      if (b.n !== ex.name) parts.push(`now called ${b.n}`);
      if (was !== now) parts.push(was && now ? `${was} → ${now}` : now ? `now ${now}` : "no amount");
      if ((b.nt || "") !== (ex.notes || "") && b.nt) parts.push(`note: ${b.nt}`);
      if (parts.length) out.push({ id: `chg:${ex.id}`, kind: "changed", g: l.g, name: ex.name, ex, back: b, text: `${ex.name}: ${parts.join("; ")}` });
    });
    for (const e of mine) if (!seen.has(e.id))
      out.push({ id: `del:${e.id}`, kind: "removed", g: l.g, name: e.name, ex: e, text: `Taken out of ${l.g}: ${e.name}` });
  }
  return out;
}

/**
 * My exercises with the chosen changes used. opts: { notes (keep the
 * professional's notes: the health consent), now, newId(n) }. A new
 * exercise keeps a library id only when known(l) says the library has it.
 */
export function applyChanges(own = [], back, ids = [], { notes = false, now = new Date(), known = () => false, newId = n => `px-${now.getTime()}-${n}` } = {}) {
  const want = new Set(ids);
  const chosen = changesFrom(own, back).filter(c => want.has(c.id));
  let list = own.map(e => ({ ...e }));
  let n = 0;
  for (const c of chosen) {
    if (c.kind === "removed") list = list.filter(e => e.id !== c.ex.id);
    if (c.kind === "changed") list = list.map(e => {
      if (e.id !== c.ex.id) return e;
      const next = { ...e, name: c.back.n };
      if (c.back.s !== undefined) next.sets = c.back.s; else delete next.sets;
      if (c.back.r) next.reps = c.back.r; else delete next.reps;
      if (notes && c.back.nt) next.notes = c.back.nt;
      return next;
    });
    if (c.kind === "added") {
      const b = c.back;
      list.push({
        id: newId(n++), exerciseId: b.l && known(b.l) ? b.l : null, name: b.n,
        description: "", frequency: "", active: true, completedToday: false, completedAt: null,
        addedAt: now.toISOString(),
        ...(b.s !== undefined ? { sets: b.s } : {}), ...(b.r ? { reps: b.r } : {}),
        ...(notes && b.nt ? { notes: b.nt } : {}),
        ...(c.g !== NO_GROUP ? { group: c.g } : {}),
      });
    }
  }
  return list;
}
