/**
 * js/data/plan-share.js
 * 15 Nov 2026 v1
 *
 * P-33 PLAN-SHARE (Graeme, 15 Nov: mock-up v2, "That looks better"; a PDF
 * made on the phone, "Yes"; spec docs/specs/alongside_share-your-plan_15nov2026_v1.md).
 *
 * Share your plan: the person's plan as it is today, to look over with a
 * physio or trainer, made on the phone and given to the phone's own share
 * sheet. Nothing is sent by the app.
 *
 *   PARTS / DEFAULTS     what can go in, and what is in to start
 *   planModel(include)   what is in the plan today, read from the store
 *   planBlocks(model)    one list of blocks, drawn by both
 *   planHtml(blocks)     the preview (the app's report look)
 *   makePlanPdf(model)   the PDF (data/pdf-lite.js)
 *   planText(model)      the text, written the way Add a plan you already
 *                        have reads it (Day:, amounts, On Home:), so a
 *                        professional's changes come back in
 *
 * The rules, each a check (tools/verify-p33-plan-share.mjs):
 *   - Never in it: the journal, check-in answers, weight.
 *   - Off unless switched on: the last 30 days, anything sore, notes, the
 *     name. Anything sore and notes also need the health consent.
 *   - What works towards your arc labels the person's own exercises only,
 *     by the arc's own rule (zonesForAreas against the strands' zones). It
 *     never suggests an exercise, and says it is a simple rule.
 *   - Rules only, no AI. No store field: the choices live on the screen.
 */

import { store } from "../store.js";
import { EXERCISES } from "./exercises/index.js";
import { STRANDS, aimById, zonesForAreas } from "./aims.js";
import { arcWeek } from "./arc-readback.js";
import { ownGroups } from "./week-shape.js";
import { DAY_KEYS } from "./week-shape-model.js";
import { savedSessions, resolveSavedSession } from "./saved-sessions.js";
import { healthAllowed } from "./health-consent.js";
import { areaWords, soreWord } from "./conditions.js";
import { windowRange, sessionsIn, kindName } from "./progress-report.js";
import { makePdf } from "./pdf-lite.js";

const BY_ID = new Map(EXERCISES.map(e => [e.id, e]));
const DAY_WORDS = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };
const DAY_SHORT = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };
const ON_HOME_WORDS = { morning: "mornings", evening: "evenings", any: "any time" };

/** What can go in, in order. hint: the line under it. off: off unless chosen. health: needs the health consent. */
export const PARTS = Object.freeze([
  { id: "arc", label: "Your arc, and what works towards it" },
  { id: "week", label: "Your week" },
  { id: "lists", label: "My exercises", hint: "Every list, with amounts, and which are on Home" },
  { id: "saved", label: "Saved sessions" },
  { id: "done", label: "What you’ve done, last 30 days", hint: "Sessions and lists, as Share your progress counts them. Off unless you choose.", off: true },
  { id: "sore", label: "Anything sore", hint: "What you’ve said is sore, and how sore. Off unless you choose.", off: true, health: true },
  { id: "notes", label: "Your notes on exercises", hint: "Off unless you choose.", off: true, health: true },
  { id: "name", label: "Your name", off: true },
]);
export const DEFAULTS = Object.freeze(Object.fromEntries(PARTS.map(p => [p.id, !p.off])));

export const NEVER = "Your journal, check-in answers and weight are never in it. Nothing leaves this phone until you choose where it goes.";
export const SCOPE = "Alongside is for everyday fitness. It works around minor aches and injuries by leaving out movements that are likely to make them worse. It isn’t designed around medical conditions. Made on my phone; the app sent nothing.";
export const RULE_LINE = "From what each exercise works, in the app’s library. If one looks wrong, say so: it’s a simple rule, not a judgement.";

const longDate = d => d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const startedWords = iso => { const d = new Date(`${iso}T12:00:00`); return Number.isFinite(d.getTime()) ? d.toLocaleDateString("en-GB", { day: "numeric", month: "long" }) : ""; };

/** "3 × 10", "1 × 30 seconds each side", from a My exercises entry. */
export function amountOf(e) {
  const sets = Math.max(1, Number(e?.sets) || 1);
  const reps = String(e?.reps ?? "").trim();
  if (reps) return `${sets} × ${reps}`;
  if (Number(e?.duration) > 0) return `${sets} × ${Math.round(Number(e.duration))} seconds`;
  return `${sets} set${sets === 1 ? "" : "s"}`;
}

/** The arc parts (body strands with areas) and which of these exercises work each: [[label, [names]]], and those that work none. */
export function arcFit(strandIds, exercises) {
  const parts = (strandIds || []).map(id => [id, STRANDS[id]]).filter(([, s]) => s && (s.zones || []).length);
  const seen = new Set();
  const uniq = exercises.filter(x => { const k = x.exerciseId || x.name; if (seen.has(k)) return false; seen.add(k); return true; });
  const zonesOf = x => zonesForAreas(BY_ID.get(x.exerciseId)?.affectsAreas || []);
  const groups = parts.map(([, s]) => [s.label, uniq.filter(x => s.zones.some(z => zonesOf(x).includes(z))).map(x => x.name)]).filter(([, names]) => names.length);
  const linked = new Set(groups.flatMap(([, n]) => n));
  return { groups, unlinked: parts.length ? uniq.map(x => x.name).filter(n => !linked.has(n)) : [] };
}

/** What is in the plan today. include: which PARTS are on. */
export function planModel(include = DEFAULTS, now = new Date()) {
  const inc = { ...DEFAULTS, ...include };
  const health = healthAllowed();
  const all = (store.get("prescribedExercises") || []).filter(e => e && e.name);
  const onHome = store.get("myExercisesOnHome") || {};
  const groups = ownGroups();
  const lists = [
    ...groups.map(g => ({ name: g, onHome: onHome[g] || null, items: all.filter(e => e.group === g) })),
    ...(all.some(e => !e.group) ? [{ name: "Other exercises", onHome: null, items: all.filter(e => !e.group) }] : []),
  ].map(l => ({ ...l, items: l.items.map(e => ({ name: e.name, exerciseId: e.exerciseId || null, amount: amountOf(e),
    note: inc.notes && health && e.notes ? String(e.notes).slice(0, 200) : "" })) }));

  const arc = store.get("arc") || {};
  const aim = arc.active ? aimById(arc.aimId) : null;
  const strands = (arc.strands || []).filter(id => STRANDS[id]);
  const arcPart = aim ? {
    aim: aim.label, words: String(arc.marker || "").trim(), week: arcWeek(arc, now), started: arc.startedAt ? startedWords(arc.startedAt) : "",
    parts: strands.map(id => STRANDS[id].label),
    fit: arcFit(strands, lists.flatMap(l => l.items)),
  } : null;

  const shape = store.get("weekShape");
  const week = shape && shape.days ? DAY_KEYS.map(k => {
    const v = shape.days[k];
    const t = v && v !== "rest" ? shape.templates?.[v] : null;
    return { day: k, what: v === "rest" ? "Rest" : t ? (t.name || t.own || "A session") : "Nothing planned" };
  }) : null;

  const saved = savedSessions().map(s => ({ name: s.name, items: resolveSavedSession(s).exercises.map(e => ({ name: e.name, exerciseId: e.id,
    amount: e.reps ? `${Math.max(1, Number(e.sets) || 1)} × ${e.reps}` : Number(e.duration) > 0 ? `${Math.max(1, Number(e.sets) || 1)} × ${Math.round(Number(e.duration))} seconds` : `${Math.max(1, Number(e.sets) || 1)} sets` })) }));

  let done = null;
  if (inc.done) {
    const range = windowRange("30", now);
    const entries = sessionsIn(store.completedSessions(store.get("activityLog")), range);
    const days = new Set(entries.map(e => new Date(e.completedAt || e.loggedAt || e.date).toDateString())).size;
    const counts = new Map();
    for (const e of entries) { const k = e.name || kindName(e); counts.set(k, (counts.get(k) || 0) + 1); }
    done = { sessions: entries.length, days, of: range.days, counts: [...counts.entries()].sort((a, b) => b[1] - a[1]) };
  }

  const sore = inc.sore && health
    ? Object.entries(store.get("conditionPainScores") || {}).filter(([, v]) => Number(v) > 0).map(([id, v]) => `${areaWords(id)}: ${String(soreWord(Number(v)) || "a little").toLowerCase()}`)
    : [];

  const name = inc.name ? String(store.get("name") || "").replace(/[<>]/g, "").trim().slice(0, 40) : "";
  return {
    date: longDate(now), name,
    arc: inc.arc ? arcPart : null, week: inc.week ? week : null,
    lists: inc.lists ? lists : [], saved: inc.saved ? saved : [],
    done, sore, notes: inc.notes && health,
    has: { arc: !!arcPart, week: !!week, lists: lists.length > 0, saved: saved.length > 0 },
  };
}

/** Nothing at all to share: no arc, week, lists or saved sessions. */
export const isEmpty = m => !m.has.arc && !m.has.week && !m.has.lists && !m.has.saved;

/** One list of blocks for the preview and the PDF. */
export function planBlocks(m) {
  const b = [{ t: "head", eyebrow: "My plan", title: m.date, brand: "Alongside: Move" },
    { t: "p", text: `${m.name ? `${m.name}’s plan` : "My plan"} in Alongside: Move, to look over with a physio or trainer.` }];
  if (m.arc) {
    b.push({ t: "h", text: "My arc" }, { t: "big", text: m.arc.aim });
    if (m.arc.words) b.push({ t: "p", runs: [{ text: "In my words: ", i: true }, { text: `“${m.arc.words}”` }] });
    const when = [m.arc.started && `Started ${m.arc.started}`, m.arc.week && `week ${m.arc.week}`].filter(Boolean).join(" · ");
    if (when) b.push({ t: "p", text: when });
    if (m.arc.fit.groups.length || m.arc.fit.unlinked.length) {
      b.push({ t: "h", text: "What works towards it" },
        { t: "dl", items: [...m.arc.fit.groups.map(([p, n]) => [p, n.join(", ")]), ...(m.arc.fit.unlinked.length ? [["Not linked to the arc", m.arc.fit.unlinked.join(", ")]] : [])] },
        { t: "small", text: RULE_LINE });
    }
  }
  if (m.week) b.push({ t: "h", text: "My week" }, { t: "table", rowHead: true, widths: [0.45, 0.55], rows: m.week.map(d => [DAY_WORDS[d.day], d.what]) });
  if (m.lists.length) {
    b.push({ t: "h", text: "My exercises" });
    for (const l of m.lists) {
      b.push({ t: "h5", text: l.name, sub: l.onHome ? `· on Home, ${ON_HOME_WORDS[l.onHome]}` : "" });
      b.push({ t: "table", head: m.notes ? ["Exercise", "Amount", "Note"] : ["Exercise", "Amount"], widths: m.notes ? [0.4, 0.28, 0.32] : [0.58, 0.42],
        rows: l.items.map(x => m.notes ? [x.name, x.amount, x.note] : [x.name, x.amount]) });
    }
  }
  if (m.saved.length) {
    b.push({ t: "h", text: "Saved sessions" });
    for (const s of m.saved) b.push({ t: "h5", text: s.name }, { t: "table", head: ["Exercise", "Amount"], widths: [0.58, 0.42], rows: s.items.map(x => [x.name, x.amount]) });
  }
  if (m.done) {
    b.push({ t: "h", text: "What I’ve done, last 30 days" },
      { t: "p", text: `${m.done.sessions} session${m.done.sessions === 1 ? "" : "s"}, on ${m.done.days} of ${m.done.of} days.` });
    if (m.done.counts.length) b.push({ t: "p", text: m.done.counts.map(([k, n]) => `${k} ${n}`).join(" · ") });
    b.push({ t: "small", text: "A record, not a score: nothing here is marked as behind." });
  }
  if (m.sore.length) b.push({ t: "h", text: "Sore today" }, { t: "p", text: m.sore.join(" · ") }, { t: "small", text: "As I said at today’s check-in." });
  b.push({ t: "notes", title: "Notes from my physio or trainer", n: 5, foot: SCOPE });
  return b;
}

const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The preview: the app's report look, real headings and tables. */
export function planHtml(blocks) {
  const runs = x => x.runs ? x.runs.map(r => r.i ? `<em>${esc(r.text)}</em>` : r.b ? `<strong>${esc(r.text)}</strong>` : esc(r.text)).join("") : esc(x.text);
  const out = [];
  for (const x of blocks) {
    if (x.t === "head") out.push(`<header class="shr-head"><div><p class="shr-eyebrow">${esc(x.eyebrow)}</p><h3 class="shr-title">${esc(x.title)}</h3></div>
      <div class="shr-brand"><img src="assets/images/brand/alongside-icon-deep.png" alt="" width="40" height="40"><img src="assets/images/brand/alongside-wordmark-dark.png" alt="Alongside" width="120" height="28"></div></header>`);
    else if (x.t === "h") out.push(`<h4 class="shr-day__h sp-h">${esc(x.text)}</h4>`);
    else if (x.t === "h5") out.push(`<h5 class="sp-list">${esc(x.text)}${x.sub ? ` <span class="sp-when">${esc(x.sub)}</span>` : ""}</h5>`);
    else if (x.t === "big") out.push(`<p class="sp-big">${esc(x.text)}</p>`);
    else if (x.t === "p") out.push(`<p class="sp-line">${runs(x)}</p>`);
    else if (x.t === "small") out.push(`<p class="sp-small">${runs(x)}</p>`);
    else if (x.t === "dl") out.push(`<dl class="sp-parts">${x.items.map(([d, w]) => `<div><dt>${esc(d)}</dt><dd>${esc(w)}</dd></div>`).join("")}</dl>`);
    else if (x.t === "table") out.push(`<table class="sp-table${x.head ? " sp-ex" : ""}">${x.head ? `<thead><tr>${x.head.map(h => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead>` : ""}<tbody>${
      x.rows.map(r => `<tr>${r.map((c, i) => i === 0 && x.rowHead ? `<th scope="row">${esc(c)}</th>` : `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
    else if (x.t === "notes") out.push(`<h4 class="shr-day__h sp-h">${esc(x.title)}</h4><div class="sp-lines" role="img" aria-label="Space to write"></div><p class="sp-foot">${esc(x.foot)}</p>`);
  }
  return `<article class="sh-report sp-doc" aria-label="Your plan, as it will be shared">${out.join("\n")}</article>`;
}

/** The PDF, as bytes. */
export function makePlanPdf(m, now = new Date()) {
  return makePdf({ title: `My plan, ${m.date}`, lang: "en-GB", blocks: planBlocks(m), now });
}

/** The amount as the reader reads it: "×" written as "x". */
const plainAmount = a => String(a).replace(/×/g, "x");

/** The plan as text, written the way Add a plan you already have reads it. */
export function planText(m) {
  const out = [`My plan, ${m.date} (Alongside: Move)`];
  if (m.name) out.push(`From ${m.name}`);
  if (m.arc) {
    out.push(`Arc: ${m.arc.aim}`);
    if (m.arc.words) out.push(`In my words: ${m.arc.words}`);
    if (m.arc.parts.length) out.push(`Working on: ${m.arc.parts.join(", ")}`);
  }
  if (m.week) out.push("", `My week: ${m.week.map(d => `${DAY_SHORT[d.day]} ${d.what}`).join(" · ")}`);
  for (const l of [...m.lists, ...m.saved]) {
    out.push("", `Day: ${l.name}`);
    if (l.onHome) out.push(`On Home: ${ON_HOME_WORDS[l.onHome]}`);
    for (const x of l.items) out.push(`${x.name} | ${plainAmount(x.amount)}${x.note ? ` | ${x.note.replace(/\|/g, "/")}` : ""}`);
  }
  if (m.done) out.push("", `Last 30 days: ${m.done.sessions} sessions on ${m.done.days} days`);
  if (m.sore.length) out.push("", `Sore today: ${m.sore.join(", ")}`);
  return out.join("\n");
}

/** The file's name: alongside-plan-2026-11-15.pdf */
export function planFileName(ext = "pdf", now = new Date()) {
  const p = n => String(n).padStart(2, "0");
  return `alongside-plan-${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}.${ext}`;
}
