/**
 * js/views/build-session.js
 * 02 Nov 2026 v1
 *
 * P-26 ONE-BUILD-PAGE (master schedule v621). Build a session, the Plan
 * only. Mock-up v1 approved by Graeme, 02 Nov ("I like this. I think it
 * works"; BNH-Files Product/alongside_build_session_mockup_02nov2026_v1.html).
 *
 * Graeme, 02 Nov: "I want to build a session. Within building that
 * session, I might want to be able to get some coach support or I might
 * want to save it to a day ... they need to be from one place, not a
 * multitude of different places."
 *
 * One page:
 *   - where (Home or Gym) and what it's for (any of four areas);
 *   - Lately: what was worked in the last 7 days, one suggestion, never a
 *     rule (data/build-lately.js); Add it, or Leave it;
 *   - three parts, warm-up, main and cool-down; in each, add moves by
 *     search, or "Help me fill this" for that part only: favourites first,
 *     then the coach's picks for the areas chosen; nothing goes in unticked;
 *   - every move: its figure, its dose, a heart (the same record as Loved
 *     it, likedMovements) and Swap (like this one, a search, Take it out);
 *   - one Save: a name (the person's own, never made up for them), then
 *     When's it for? A date (saved-sessions planSavedSession), every week
 *     on a day (Your week, weekShape templates[].saved), or just keep it.
 *     Start now opens it as a proposal first, as every session does.
 *
 * Opened from Build my own behind Get stronger and Keep moving
 * (router.buildStart = { door, part, place }), Saved sessions' Build a
 * session, and Edit on a saved session (router.buildStart = { editId }),
 * Graeme's choice. Free never reaches it: Free keeps the builder it has
 * (views/session-builder-ui.js), and this page sends Free there.
 *
 * Building is for any day, so today's sore answer does not narrow the
 * search (swap-search sore: false); the day's own check-in does, when the
 * session is opened (views/path.js v11). Rule-based, no AI.
 */
import { store } from "../store.js";
import { isPremium } from "../auth.js";
import { lineIcon } from "../data/line-icons.js";
import { renderFigure } from "../figures.js";
import { EXERCISES } from "../data/exercises/index.js";
import { PATH_MOVEMENTS } from "../data/exercises/path_movements.js";
import { buildCandidatePools, equipmentForLocation, withDefaultDose, exerciseSeconds } from "../session-builder.js";
import { renderSwapSearch, wireSwapSearch, kitWords } from "../data/swap-search.js";
import { saveSession, updateSavedSession, savedById, resolveSavedSession, planSavedSession, NAME_MAX } from "../data/saved-sessions.js";
import { latelyFor, groupOfMovement, LATELY_GROUPS } from "../data/build-lately.js";
import { lastPlace } from "../data/path-context.js";
import { getWeek, localDay } from "../data/week-shape.js";
import { DAY_KEYS, DAY_NAMES, sanitizeWeekShape } from "../data/week-shape-model.js";

const BY_ID = new Map([...EXERCISES, ...PATH_MOVEMENTS].map(e => [e.id, e]));
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/** The three parts, in order. want: how many the coach's help fills, when the part has none. */
export const PARTS = Object.freeze([
  { id: "warmup",   label: "Warm-up",   kind: "blue",   icon: "sun",      want: 2 },
  { id: "main",     label: "Main",      kind: "amber",  icon: "strength", want: 4 },
  { id: "cooldown", label: "Cool-down", kind: "violet", icon: "breath",   want: 2 },
]);
/** What it's for. type: the builder's session type; group: Lately's. */
export const AREAS = Object.freeze([
  { id: "upper",   label: "Upper body",     type: "upper",   group: "upper" },
  { id: "legs",    label: "Legs",           type: "lower",   group: "legs" },
  { id: "trunk",   label: "Core and trunk", type: "core",    group: "trunk" },
  { id: "stretch", label: "Stretching",     type: "stretch", group: null },
]);
const AREA_OF_PART = { upper: ["upper"], lower: ["legs"], core: ["trunk"], whole: [] };
const PLACES = [["home", "Home"], ["gym", "Gym"]];
const LENGTHS = [10, 20, 30, 40, 50, 60];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const JS_KEY = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const HEART = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>`;

const dayOf = iso => new Date(iso + "T12:00:00");
/** "Today", "Tomorrow", "Wed 4 Nov". */
export function dayWords(iso, now = new Date()) {
  if (iso === localDay(now)) return "Today";
  const t = new Date(now); t.setDate(t.getDate() + 1);
  if (iso === localDay(t)) return "Tomorrow";
  const d = dayOf(iso);
  return `${SHORT_DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
function secsWords(s) { return s < 120 ? `${Math.round(s)} sec` : `${Math.round(s / 60)} min`; }
/** "3 × 10", "2 × 30 sec", "1 min". */
export function doseWords(e) {
  const sets = Number(e.sets) || 1;
  if (e.reps != null && e.reps !== "") return `${sets} × ${e.reps}`;
  if (e.duration) return sets > 1 ? `${sets} × ${secsWords(e.duration)}` : secsWords(e.duration);
  return "";
}
const minsOf = list => Math.round(list.reduce((n, e) => n + exerciseSeconds(e), 0) / 60);
/** A library entry as it goes into a part: its section, and the plan's dose for a main move. */
function placed(e, part) {
  const { recommended, ...clean } = e;
  const x = { ...clean, section: part };
  return part === "main" ? withDefaultDose(x) : x;
}

export function BuildSessionView(router) {
  let root = null, live = null;
  let st = null;
  let cache = { key: null, pools: [] };

  // ── State ──────────────────────────────────────────────────────────────
  function fresh(start) {
    const place = ["home", "gym"].includes(start?.place) ? start.place : (lastPlace() === "gym" ? "gym" : "home");
    return {
      editId: null, name: "", place, door: ["stronger", "moving"].includes(start?.door) ? start.door : "stronger",
      areas: [...(AREA_OF_PART[start?.part] || [])], parts: { warmup: [], main: [], cooldown: [] },
      leftLately: false, open: null, help: null, step: "build",
      when: "keep", date: localDay(), weekday: JS_KEY[new Date().getDay()], error: null, done: null,
      returnTo: start?.returnTo || null,
    };
  }
  function fromSaved(rec, start) {
    const s = fresh({ place: rec.place, door: rec.purpose, returnTo: start?.returnTo || "saved-sessions" });
    s.editId = rec.id; s.name = rec.name;
    for (const e of resolveSavedSession(rec).exercises) {
      const part = ["warmup", "main", "cooldown"].includes(e.section) ? e.section : "main";
      s.parts[part].push({ ...e, section: part });
    }
    const groups = new Set(Object.values(s.parts).flat().map(groupOfMovement).filter(Boolean));
    s.areas = AREAS.filter(a => a.group && groups.has(a.group)).map(a => a.id);
    const wk = weekdayOf(rec.id);
    if (rec.plannedFor) { s.when = "date"; s.date = rec.plannedFor; }
    else if (wk) { s.when = "week"; s.weekday = wk; }
    return s;
  }
  const allIds = () => Object.values(st.parts).flat().map(e => e.id);
  const partOf = id => PARTS.find(p => p.id === id);

  // ── The coach's pools, for the areas chosen and the place ──────────────
  function types() {
    const t = st.areas.map(a => AREAS.find(x => x.id === a)?.type).filter(Boolean);
    return t.length ? t : [st.door === "moving" ? "cardio" : "full"];
  }
  function poolsFor(typeList) {
    const kit = equipmentForLocation(st.place).list;
    return typeList.map(t => buildCandidatePools({ sessionType: t, durationMins: 40, equipmentOverride: kit })).filter(Boolean);
  }
  /** One part's candidates, the coach's picks first, taking turns between the areas chosen. */
  function pool(part) {
    const key = `${st.place}|${types().join(",")}`;
    if (cache.key !== key) cache = { key, pools: poolsFor(types()) };
    const lists = cache.pools.map(p => p[part] || []);
    const seen = new Set(), out = [];
    const take = pick => { for (let i = 0; lists.some(l => i < l.length); i++) for (const l of lists) { const e = l[i]; if (e && pick(e) && !seen.has(e.id)) { seen.add(e.id); out.push(e); } } };
    take(e => e.recommended); take(e => !e.recommended);
    return out;
  }
  function whyFor(e, part) {
    const g = groupOfMovement(e);
    if (part === "warmup") return "To get you warm and moving.";
    if (part === "cooldown") return "To help you settle at the end.";
    return g ? `Works ${LATELY_GROUPS[g].label}.` : "Fits what you chose.";
  }
  /** "Help me fill this": favourites first (ticked), then the coach's picks. */
  function helpPicks(part) {
    const inIds = new Set(allIds());
    const liked = store.get("likedMovements") || {};
    const cands = pool(part).filter(e => !inIds.has(e.id));
    const favs = cands.filter(e => liked[e.id]).slice(0, 4);
    const coach = cands.filter(e => !liked[e.id]);
    const need = Math.max(0, partOf(part).want - st.parts[part].length - favs.length);
    const recs = coach.filter(e => e.recommended);
    const on = recs.slice(0, need);
    const extra = [...recs.slice(need), ...coach.filter(e => !e.recommended)].slice(0, Math.max(0, 4 - on.length));
    const picks = [
      ...favs.map(e => ({ id: e.id, on: true, fav: true, why: "You marked this as a favourite." })),
      ...on.map(e => ({ id: e.id, on: true, fav: false, why: whyFor(e, part) })),
      ...extra.map(e => ({ id: e.id, on: false, fav: false, why: whyFor(e, part) })),
    ];
    // Lately's area, offered once, never ticked for them.
    const l = lately();
    if (part === "main" && l) {
      const area = AREAS.find(a => a.group === l.gap);
      const gp = area && poolsFor([area.type])[0]?.main.find(e => e.recommended && !inIds.has(e.id) && !picks.some(p => p.id === e.id));
      if (gp) picks.push({ id: gp.id, on: false, fav: false, why: l.line.split(". ")[1] || l.line, gap: true });
    }
    return picks;
  }
  function entryFor(id, part) {
    const fromPool = pool(part).find(e => e.id === id);
    const e = fromPool || BY_ID.get(id);
    return e ? placed(e, part) : null;
  }

  // ── Lately ─────────────────────────────────────────────────────────────
  function lately() {
    if (st.leftLately) return null;
    const chosen = st.areas.map(a => AREAS.find(x => x.id === a)?.group).filter(Boolean);
    return latelyFor({ log: store.completedSessions(store.get("activityLog") || []), byId: BY_ID, chosen });
  }

  // ── Your week ──────────────────────────────────────────────────────────
  function weekdayOf(savedId) {
    const w = getWeek();
    if (!w) return null;
    const tid = Object.values(w.templates).find(t => t.saved === savedId)?.id;
    return tid ? DAY_KEYS.find(k => w.days[k] === tid) || null : null;
  }
  /** Every week on this day: the saved session as that day's plan. Says what it replaced. */
  function putOnWeekday(rec, day) {
    const w = getWeek() || { templates: {}, days: {} };
    const templates = { ...w.templates };
    let tid = Object.values(templates).find(t => t.saved === rec.id)?.id;
    if (!tid) { let n = 1; while (templates[`saved-${n}`]) n++; tid = `saved-${n}`; }
    const mins = LENGTHS.reduce((a, b) => Math.abs(b - (rec.durationMins || 30)) < Math.abs(a - (rec.durationMins || 30)) ? b : a, 30);
    templates[tid] = { id: tid, name: rec.name.slice(0, 40), mix: [], intensity: "steady", mins, place: rec.place || "gym", saved: rec.id };
    const was = w.days?.[day];
    const days = { ...(w.days || {}) };
    for (const k of DAY_KEYS) if (days[k] === tid) days[k] = null;   // one weekday, as chosen
    days[day] = tid;
    store.set("weekShape", sanitizeWeekShape({ ...w, templates, days, setAt: w.setAt || localDay() }));
    if (was === "rest") return "a rest day";
    const wasT = was ? w.templates[was] : null;
    return wasT && wasT.id !== tid ? wasT.name : null;
  }
  function offWeek(savedId) {
    const w = getWeek();
    if (!w) return;
    const ids = Object.values(w.templates).filter(t => t.saved === savedId).map(t => t.id);
    if (!ids.length) return;
    const templates = Object.fromEntries(Object.entries(w.templates).filter(([k]) => !ids.includes(k)));
    const days = Object.fromEntries(DAY_KEYS.map(k => [k, ids.includes(w.days[k]) ? null : w.days[k]]));
    store.set("weekShape", sanitizeWeekShape({ ...w, templates, days }));
  }

  // ── Mount ──────────────────────────────────────────────────────────────
  function mount(container) {
    root = container;
    const start = router.buildStart || null;
    router.buildStart = null;
    // The Plan's only: Free keeps the builder it has.
    if (!isPremium()) { router.navigate("session-builder", { replace: true }); return; }
    const rec = start?.editId ? savedById(start.editId) : null;
    st = rec ? fromSaved(rec, start) : fresh(start);
    paint();
  }

  function say(msg) { if (!live) return; live.textContent = ""; setTimeout(() => { if (live) live.textContent = msg; }, 30); }

  // ── Drawing ────────────────────────────────────────────────────────────
  const tile = (icon, kind) => `<span class="kind-tile k-${kind}">${lineIcon(icon)}</span>`;
  function seg(name, legend, items, cur, type = "radio") {
    const isOn = id => type === "checkbox" ? cur.includes(id) : String(cur) === String(id);
    return `<fieldset class="path-seg"><legend>${legend}</legend><div class="path-seg__opts">${items.map(([id, t]) =>
      `<label><input type="${type}" name="${name}" value="${esc(id)}"${isOn(id) ? " checked" : ""}><span>${esc(t)}</span></label>`).join("")}</div></fieldset>`;
  }

  function latelyCard() {
    const l = lately();
    if (!l) return "";
    const area = AREAS.find(a => a.group === l.gap);
    return `<section class="bs-lately" aria-labelledby="bs-lately-h">
      <h2 class="path-adj__lbl" id="bs-lately-h">Lately</h2>
      <p class="path-coachline" id="bs-lately-line">${esc(l.line)}</p>
      <div class="bs-pills">
        <button type="button" class="plan-link" id="bs-lately-add" aria-describedby="bs-lately-line">Add ${esc(area.label.toLowerCase())}</button>
        <button type="button" class="plan-link bs-quiet" id="bs-lately-leave" aria-describedby="bs-lately-line">Leave it</button>
      </div>
    </section>`;
  }

  function moveRow(e, part, i) {
    const liked = !!(store.get("likedMovements") || {})[e.id];
    const nmId = `bs-mv-${part}-${i}`;
    const open = st.open && st.open.kind === "swap" && st.open.part === part && st.open.i === i;
    return `<li class="bs-mv">
      <div class="bs-mv__row">
        <span class="bs-mv__fig">${renderFigure(e.id) || ""}</span>
        <span class="bs-mv__txt"><span class="bs-mv__nm" id="${nmId}">${esc(e.name)}</span><span class="path-small">${esc(doseWords(e))}</span></span>
        <button type="button" class="bs-fav" data-fav="${esc(e.id)}" aria-pressed="${liked}" aria-label="Favourite: ${esc(e.name)}">${HEART}</button>
        <button type="button" class="btn btn-secondary bs-swap" id="bs-swap-${part}-${i}" data-swap="${part}:${i}" aria-describedby="${nmId}" aria-expanded="${open}"${open ? ` aria-controls="bs-swp"` : ""}>Swap</button>
      </div>
      ${open ? swapPanel(e, part) : ""}
    </li>`;
  }

  function swapPanel(e, part) {
    const ids = new Set(allIds());
    const like = pool(part).filter(x => !ids.has(x.id) && x.category === e.category && (!e.movementPattern || x.movementPattern === e.movementPattern)).slice(0, 6);
    return `<div class="path-swp" id="bs-swp" role="group" aria-labelledby="bs-swp-h">
      <h3 class="path-swp__h" id="bs-swp-h">Instead of ${esc(e.name)}</h3>
      ${like.length ? `<p class="path-swp__sub" id="bs-swp-like">Like this one</p>
      <ul class="path-swp__list" aria-labelledby="bs-swp-like">${like.map(x => `<li><button type="button" class="path-swp__pick" data-swap-to="${esc(x.id)}"><span class="path-swp__name">${esc(x.name)}</span><span class="path-swp__kit">${esc(kitWords(x))}</span></button></li>`).join("")}</ul>` : ""}
      ${renderSwapSearch("bs-swp-find")}
      <button type="button" class="btn btn-secondary btn-full" id="bs-swp-out">Take it out</button>
      <button type="button" class="btn btn-secondary btn-full" id="bs-swp-keep">Keep ${esc(e.name)}</button>
    </div>`;
  }

  function helpPanel(part) {
    const p = partOf(part);
    const picks = st.help || [];
    const areaWords = st.areas.length ? st.areas.map(a => AREAS.find(x => x.id === a).label).join(", ") : "Whole body";
    const pick = (x, i) => {
      const e = BY_ID.get(x.id);
      return `<li><label class="bs-pick"><input type="checkbox" data-pick="${i}"${x.on ? " checked" : ""}>
        <span class="bs-pick__txt"><span class="bs-mv__nm">${esc(e?.name || x.id)}</span><span class="path-small">${esc(doseWords(entryFor(x.id, part) || e || {}))}</span><span class="bs-pick__why">${esc(x.why)}</span></span></label></li>`;
    };
    const favs = picks.map((x, i) => [x, i]).filter(([x]) => x.fav);
    const coach = picks.map((x, i) => [x, i]).filter(([x]) => !x.fav);
    const n = picks.filter(x => x.on).length;
    return `<div class="bs-panel" id="bs-panel" role="group" aria-labelledby="bs-panel-h">
      <h3 class="path-swp__h" id="bs-panel-h" tabindex="-1">Help with ${esc(p.label)}</h3>
      <p class="path-small">${esc(areaWords)}, ${st.place === "gym" ? "at the gym" : "at home"}. Tick what you want. Nothing goes in until you say.</p>
      ${favs.length ? `<p class="path-swp__sub" id="bs-panel-fav">Your favourites</p><ul class="bs-picks" aria-labelledby="bs-panel-fav">${favs.map(([x, i]) => pick(x, i)).join("")}</ul>` : ""}
      ${coach.length ? `<p class="path-swp__sub" id="bs-panel-coach">The coach suggests</p><ul class="bs-picks" aria-labelledby="bs-panel-coach">${coach.map(([x, i]) => pick(x, i)).join("")}</ul>`
        : `<p class="path-small">Nothing more to suggest for ${esc(p.label.toLowerCase())} with what you have here. You can still search.</p>`}
      ${renderSwapSearch("bs-help-find")}
      <button type="button" class="btn btn-primary btn-full" id="bs-help-add"${n ? "" : " disabled"}>${addWords(n, p)}</button>
      <button type="button" class="btn btn-secondary btn-full" id="bs-help-close">Not now</button>
    </div>`;
  }
  const addWords = (n, p) => n ? `Add ${n} to ${p.label}` : "Tick one to add it";

  function addPanel(part) {
    const p = partOf(part);
    return `<div class="bs-panel" id="bs-panel" role="group" aria-labelledby="bs-add-h">
      <h3 class="path-swp__h" id="bs-add-h">Add to ${esc(p.label)}</h3>
      ${renderSwapSearch("bs-add-find", { label: "Find a move" })}
      <button type="button" class="btn btn-secondary btn-full" id="bs-add-close">Done adding</button>
    </div>`;
  }

  function partCard(p) {
    const list = st.parts[p.id];
    const m = minsOf(list);
    const open = st.open && st.open.part === p.id && (st.open.kind === "help" || st.open.kind === "add");
    return `<section class="bs-part" style="--k: var(--kind-${p.kind})" aria-labelledby="bs-h-${p.id}">
      <div class="bs-part__head">${tile(p.icon, p.kind)}<h2 class="bs-part__h" id="bs-h-${p.id}">${p.label}</h2><span class="bs-part__min">${list.length ? `About ${Math.max(1, m)} min` : "Empty"}</span></div>
      ${list.length ? `<ul class="bs-mvs" aria-labelledby="bs-h-${p.id}">${list.map((e, i) => moveRow(e, p.id, i)).join("")}</ul>` : `<p class="path-small">Nothing here yet.</p>`}
      ${open ? (st.open.kind === "help" ? helpPanel(p.id) : addPanel(p.id)) : `<div class="bs-acts">
        <button type="button" class="btn btn-secondary" data-add="${p.id}" aria-describedby="bs-h-${p.id}">+ Add a move</button>
        <button type="button" class="btn btn-secondary bs-help" data-help="${p.id}" aria-describedby="bs-h-${p.id}">Help me fill this</button>
      </div>`}
    </section>`;
  }

  function buildStep() {
    const n = allIds().length;
    const m = Object.values(st.parts).reduce((t, l) => t + minsOf(l), 0);
    return `<button type="button" class="btn btn-ghost plan-back" id="bs-back">‹ Back</button>
      <div class="path-head"><h1 class="path-h1" tabindex="-1">${st.editId ? "Change this session" : "Build a session"}</h1></div>
      <p class="path-small">Add moves yourself, or ask for help with any part.</p>
      ${seg("bs-place", "Where?", PLACES, st.place)}
      ${seg("bs-area", "What’s it for? Pick any", AREAS.map(a => [a.id, a.label]), st.areas, "checkbox")}
      ${latelyCard()}
      ${PARTS.map(partCard).join("")}
      <p class="bs-sum"><span>${n} move${n === 1 ? "" : "s"}</span><span>${n ? `About ${Math.max(1, m)} minutes` : ""}</span></p>
      ${st.error ? `<p class="path-note" id="bs-err" role="alert">${esc(st.error)}</p>` : ""}
      <button type="button" class="btn btn-primary btn-full" id="bs-save"${n ? "" : ' aria-describedby="bs-save-why"'}>Save</button>
      ${n ? "" : `<p class="path-small" id="bs-save-why">Add a move first.</p>`}
      <button type="button" class="btn btn-secondary btn-full" id="bs-start"${n ? "" : " disabled"}>Start now</button>`;
  }

  function nextDays() {
    const out = [], d = new Date();
    for (let i = 0; i < 7; i++) { const x = new Date(d); x.setDate(d.getDate() + i); out.push(localDay(x)); }
    return out;
  }
  function saveWords() {
    if (st.when === "date") return `Save for ${dayWords(st.date).replace(/^Today$/, "today").replace(/^Tomorrow$/, "tomorrow")}`;
    if (st.when === "week") return `Save for every ${DAY_NAMES[st.weekday]}`;
    return "Save";
  }
  function saveStep() {
    const days = nextDays();
    const custom = !days.includes(st.date);
    const w = getWeek();
    const onDay = st.when === "week" && w && w.days[st.weekday];
    const wasT = onDay && onDay !== "rest" ? w.templates[onDay] : null;
    const replaces = onDay === "rest" ? "a rest day" : wasT && !(st.editId && wasT.saved === st.editId) ? wasT.name : null;
    return `<button type="button" class="btn btn-ghost plan-back" id="bs-back">‹ Back</button>
      <div class="path-head"><h1 class="path-h1" tabindex="-1">Save this session</h1></div>
      <div class="bs-field">
        <label for="bs-name">Name</label>
        <input type="text" id="bs-name" class="form-input" maxlength="${NAME_MAX}" autocomplete="off" value="${esc(st.name)}"${st.error ? ' aria-invalid="true" aria-describedby="bs-err"' : ""}>
        ${st.error ? `<p class="path-note" id="bs-err" role="alert">${esc(st.error)}</p>` : ""}
      </div>
      <fieldset class="bs-when"><legend class="bs-when__lg">When’s it for?</legend>
        <div class="bs-opt${st.when === "date" ? " is-on" : ""}">
          <label class="bs-radio"><input type="radio" name="bs-when" value="date"${st.when === "date" ? " checked" : ""}> A date</label>
          ${st.when === "date" ? `${seg("bs-date", "Which day?", days.map(d => [d, dayWords(d)]), custom ? "" : st.date)}
          <div class="bs-field"><label for="bs-date-other">Another date</label><input type="date" id="bs-date-other" class="form-input" min="${days[0]}" value="${custom ? esc(st.date) : ""}"></div>` : ""}
        </div>
        <div class="bs-opt${st.when === "week" ? " is-on" : ""}">
          <label class="bs-radio"><input type="radio" name="bs-when" value="week"${st.when === "week" ? " checked" : ""}> Every week, on…</label>
          ${st.when === "week" ? `${seg("bs-day", "Which day?", DAY_KEYS.map(k => [k, DAY_NAMES[k]]), st.weekday)}
          <p class="path-small">It goes into Your week on that day, until you change it.${replaces ? ` ${esc(DAY_NAMES[st.weekday])} is “${esc(replaces)}” now; this takes its place.` : ""}</p>` : `<p class="path-small bs-opt__sub">Goes into Your week on that day.</p>`}
        </div>
        <div class="bs-opt${st.when === "keep" ? " is-on" : ""}">
          <label class="bs-radio"><input type="radio" name="bs-when" value="keep"${st.when === "keep" ? " checked" : ""}> Just keep it</label>
          <p class="path-small bs-opt__sub">In Saved sessions, for any day.</p>
        </div>
      </fieldset>
      <button type="button" class="btn btn-primary btn-full" id="bs-save-go">${esc(saveWords())}</button>`;
  }

  function doneStep() {
    return `<div class="path-head"><h1 class="path-h1" tabindex="-1">Saved</h1></div>
      <p class="path-coachline" role="status">${esc(st.done)}</p>
      <button type="button" class="btn btn-primary btn-full" id="bs-done">Done</button>`;
  }

  function paint(focus = true) {
    if (!root) return;
    const body = st.step === "save" ? saveStep() : st.step === "done" ? doneStep() : buildStep();
    root.innerHTML = `<div class="bs-view path-view is-plan" data-step="${st.step}">
      ${body}
      <p class="sr-only" role="status" aria-live="polite" id="bs-live"></p>
    </div>`;
    live = root.querySelector("#bs-live");
    wire();
    if (focus) { root.querySelector(".path-h1")?.focus(); try { window.scrollTo(0, 0); } catch {} }
  }

  // ── Doing ──────────────────────────────────────────────────────────────
  function add(part, e, { quiet = false } = {}) {
    if (!e || allIds().includes(e.id)) return false;
    const x = entryFor(e.id, part) || placed(e, part);
    st.parts[part] = [...st.parts[part], x];
    st.error = null;
    if (!quiet) say(`Added ${x.name} to ${partOf(part).label}.`);
    return true;
  }
  function refocus(sel) { root.querySelector(sel)?.focus(); }

  function toSave() {
    if (!allIds().length) { st.error = "Add a move first, then save."; paint(false); refocus("#bs-err"); return; }
    st.error = null; st.open = null; st.help = null; st.step = "save"; paint();
  }

  function built() {
    const exercises = PARTS.flatMap(p => st.parts[p.id].map(e => ({ ...e, section: p.id })));
    const m = Object.values(st.parts).reduce((t, l) => t + minsOf(l), 0);
    return { title: st.name, exercises, durationMins: Math.max(1, m), door: st.door, place: st.place,
             sessionType: types()[0] === "cardio" ? "cardio" : (st.areas.length === 1 ? types()[0] : "full") };
  }

  function doSave() {
    st.name = String(root.querySelector("#bs-name")?.value || "").trim();
    if (!st.name) { st.error = "Give it a name, so you can find it again."; paint(false); refocus("#bs-name"); return; }
    if (st.when === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(st.date)) { st.error = "Choose a day, or another date."; paint(false); refocus("#bs-err"); return; }
    const b = built();
    let res;
    if (st.editId) {
      res = updateSavedSession(st.editId, { name: st.name, exerciseIds: b.exercises.map(e => e.id), exercises: b.exercises, durationMins: b.durationMins, place: b.place, purpose: b.door });
    } else {
      res = saveSession(st.name, b);
    }
    if (!res?.ok) { st.error = res?.reason === "name" ? "Give it a name, so you can find it again." : "That could not be saved. Please try again."; paint(false); refocus("#bs-err"); return; }
    const rec = res.saved;
    st.editId = rec.id;
    let msg;
    if (st.when === "date") {
      planSavedSession(rec.id, st.date); offWeek(rec.id);
      const w = dayWords(st.date);
      msg = w === "Today" ? "Saved for today. Home has it ready to start." : `Saved for ${w}. On that day, Home will have it ready to start.`;
    } else if (st.when === "week") {
      planSavedSession(rec.id, null);
      const was = putOnWeekday(savedById(rec.id) || rec, st.weekday);
      msg = `Saved for every ${DAY_NAMES[st.weekday]}, in Your week.${was ? ` It takes the place of “${was}”.` : ""}`;
    } else {
      planSavedSession(rec.id, null); offWeek(rec.id);
      msg = "Saved. It’s in Saved sessions, for any day.";
    }
    st.done = st.when === "keep" ? msg : `${msg} It’s also in Saved sessions.`;
    st.error = null; st.step = "done"; paint();
  }

  /** Start now: the session as a proposal first, as every session opens (P-12). */
  function startNow() {
    const b = built();
    if (!b.exercises.length) return;
    const practice = { id: st.editId || "built", name: st.name || "Your session", minutes: b.durationMins, sessionType: b.sessionType,
      place: st.place, saved: true, steps: b.exercises.map(e => ({ id: e.id, entry: e, dose: doseWords(e) })) };
    router.pathStart = { door: st.door, practice };
    router.navigate("path");
  }

  function leave() {
    if (st.step === "save") { st.step = "build"; st.error = null; paint(); return; }
    if (router.back) router.back(); else router.navigate("today");
  }

  // ── Wiring ─────────────────────────────────────────────────────────────
  function wire() {
    root.querySelector("#bs-back")?.addEventListener("click", leave);
    root.querySelector("#bs-done")?.addEventListener("click", () => router.navigate(st.returnTo || "saved-sessions"));

    if (st.step === "build") {
      root.querySelectorAll('input[name="bs-place"]').forEach(r => r.addEventListener("change", () => { st.place = r.value; st.help = null; st.open = null; paint(false); refocus(`input[name="bs-place"][value="${r.value}"]`); }));
      root.querySelectorAll('input[name="bs-area"]').forEach(c => c.addEventListener("change", () => {
        st.areas = c.checked ? [...st.areas, c.value] : st.areas.filter(a => a !== c.value);
        st.areas = AREAS.map(a => a.id).filter(id => st.areas.includes(id));
        if (st.open?.kind === "help") st.help = helpPicks(st.open.part);
        paint(false); refocus(`input[name="bs-area"][value="${c.value}"]`);
      }));
      root.querySelector("#bs-lately-add")?.addEventListener("click", () => {
        const l = lately(); const area = l && AREAS.find(a => a.group === l.gap);
        if (!area) return;
        st.areas = AREAS.map(a => a.id).filter(id => id === area.id || st.areas.includes(id));
        paint(false); refocus(`input[name="bs-area"][value="${area.id}"]`); say(`${area.label} added to what it’s for.`);
      });
      root.querySelector("#bs-lately-leave")?.addEventListener("click", () => { st.leftLately = true; paint(false); refocus("#bs-h-warmup"); say("Left as it is."); });

      root.querySelectorAll("[data-help]").forEach(b => b.addEventListener("click", () => {
        const part = b.dataset.help;
        st.open = { kind: "help", part }; st.help = helpPicks(part); paint(false);
        refocus("#bs-panel-h");
      }));
      root.querySelectorAll("[data-add]").forEach(b => b.addEventListener("click", () => {
        st.open = { kind: "add", part: b.dataset.add }; st.help = null; paint(false); refocus("#bs-add-find-q");
      }));
      // Help me fill this
      root.querySelectorAll("[data-pick]").forEach(c => c.addEventListener("change", () => {
        st.help[Number(c.dataset.pick)].on = c.checked;
        const n = st.help.filter(x => x.on).length, btn = root.querySelector("#bs-help-add");
        if (btn) { btn.textContent = addWords(n, partOf(st.open.part)); btn.disabled = !n; }
      }));
      root.querySelector("#bs-help-add")?.addEventListener("click", () => {
        const part = st.open.part;
        const added = st.help.filter(x => x.on).map(x => BY_ID.get(x.id)).filter(e => add(part, e, { quiet: true }));
        st.open = null; st.help = null; paint(false); refocus(`[data-help="${part}"]`);
        say(`Added ${added.length} to ${partOf(part).label}.`);
      });
      root.querySelector("#bs-help-close")?.addEventListener("click", () => { const part = st.open.part; st.open = null; st.help = null; paint(false); refocus(`[data-help="${part}"]`); });
      if (st.open?.kind === "help") wireSwapSearch(root, "bs-help-find", e => {
        const part = st.open.part; add(part, e); st.help = helpPicks(part); paint(false); refocus("#bs-help-find-q");
      }, { place: st.place, exclude: allIds(), sore: false });
      // + Add a move
      if (st.open?.kind === "add") wireSwapSearch(root, "bs-add-find", e => {
        add(st.open.part, e); paint(false); refocus("#bs-add-find-q");
      }, { place: st.place, exclude: allIds(), sore: false });
      root.querySelector("#bs-add-close")?.addEventListener("click", () => { const part = st.open.part; st.open = null; paint(false); refocus(`[data-add="${part}"]`); });

      // Each move: the heart, and Swap
      root.querySelectorAll("[data-fav]").forEach(b => b.addEventListener("click", () => {
        const id = b.dataset.fav, on = b.getAttribute("aria-pressed") !== "true";
        if (on) store.likeMovement(id); else store.unlikeMovement(id);
        b.setAttribute("aria-pressed", String(on));
        say(on ? `${BY_ID.get(id)?.name || "It"} is a favourite.` : `${BY_ID.get(id)?.name || "It"} is no longer a favourite.`);
      }));
      root.querySelectorAll("[data-swap]").forEach(b => b.addEventListener("click", () => {
        const [part, i] = b.dataset.swap.split(":");
        const same = st.open?.kind === "swap" && st.open.part === part && st.open.i === Number(i);
        st.open = same ? null : { kind: "swap", part, i: Number(i) }; st.help = null; paint(false);
        refocus(same ? `#bs-swap-${part}-${i}` : "#bs-swp [data-swap-to], #bs-swp-find-q");
      }));
      if (st.open?.kind === "swap") {
        const { part, i } = st.open;
        const swapTo = to => {
          const from = st.parts[part][i];
          if (!to || !from || allIds().includes(to.id)) return;
          const x = entryFor(to.id, part) || placed(to, part);
          st.parts[part] = st.parts[part].map((e, j) => j === i ? x : e);
          st.open = null; paint(false); refocus(`#bs-swap-${part}-${i}`);
          say(`Swapped ${from.name} for ${x.name}.`);
        };
        root.querySelectorAll("[data-swap-to]").forEach(b => b.addEventListener("click", () => swapTo(BY_ID.get(b.dataset.swapTo))));
        wireSwapSearch(root, "bs-swp-find", swapTo, { place: st.place, exclude: allIds(), sore: false });
        root.querySelector("#bs-swp-out")?.addEventListener("click", () => {
          const from = st.parts[part][i];
          st.parts[part] = st.parts[part].filter((_, j) => j !== i);
          st.open = null; paint(false);
          refocus(st.parts[part].length ? `#bs-swap-${part}-${Math.min(i, st.parts[part].length - 1)}` : `[data-add="${part}"]`);
          say(`Took out ${from.name}.`);
        });
        root.querySelector("#bs-swp-keep")?.addEventListener("click", () => { st.open = null; paint(false); refocus(`#bs-swap-${part}-${i}`); });
      }
      root.querySelector("#bs-save")?.addEventListener("click", toSave);
      root.querySelector("#bs-start")?.addEventListener("click", startNow);
    }

    if (st.step === "save") {
      const name = root.querySelector("#bs-name");
      name?.addEventListener("input", () => { st.name = name.value; });
      root.querySelectorAll('input[name="bs-when"]').forEach(r => r.addEventListener("change", () => {
        st.when = r.value; st.error = null; paint(false); refocus(`input[name="bs-when"][value="${r.value}"]`);
      }));
      root.querySelectorAll('input[name="bs-date"]').forEach(r => r.addEventListener("change", () => {
        st.date = r.value; st.error = null; paint(false); refocus(`input[name="bs-date"][value="${r.value}"]`);
      }));
      const other = root.querySelector("#bs-date-other");
      other?.addEventListener("change", () => { if (other.value) { st.date = other.value; st.error = null; paint(false); refocus("#bs-date-other"); } });
      root.querySelectorAll('input[name="bs-day"]').forEach(r => r.addEventListener("change", () => {
        st.weekday = r.value; paint(false); refocus(`input[name="bs-day"][value="${r.value}"]`);
      }));
      root.querySelector("#bs-save-go")?.addEventListener("click", doSave);
    }
  }

  function onUnmount() { root = null; live = null; }

  return { mount, onUnmount };
}
