/**
 * js/views/help.js
 * 15 Nov 2026 v1
 *
 * v1 - P-25 HOW-TO GUIDES (spec v3 §2.2, §2.3, §2.3b; mock-up v2, Graeme 12
 *   Nov: "Perfect"). How do I…?, one full screen with its own heading (a
 *   pop-out menu is hard with a screen reader, a switch or large text):
 *
 *   1. On this screen: the guides for the screen the person came from, only
 *      what they can do; left out when there are none (never "No guides").
 *   2. Search: every word in a title or its keywords. Rules only, no AI. If
 *      nothing matches it says so, and the groups stay below.
 *   3. Everything, by what you want to do: the groups; in each, the Plan's
 *      guides last, under Part of the Plan, on Free. No other mention of the
 *      Plan: no upselling in help.
 *   4. Still stuck?: the email address with Copy (the app sends nothing),
 *      and the support lines in their own words (data/support-lines.js).
 *
 *   A guide opens on its overview: what you'll end up with and its steps,
 *   then Guide me through it (js/guide.js). Every guide ends with Did that
 *   work?: Yes, back to where I was, or Not quite, a few likely answers one
 *   level deep. Nothing on these screens is stored or sent.
 */
import { CATEGORIES, GUIDES, HELP_EMAIL, guideById, guidesFor, searchGuides, inCategory, forTier, wayFor, sayHTML, tierNow } from "../data/guides.js";
import { supportLinesHTML } from "../data/support-lines.js";
import { lineIcon } from "../data/line-icons.js";
import { startGuide } from "../guide.js";

const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** What the screen the person came from is called, for "On this screen" and Back. */
const SCREEN_NAMES = {
  today: "Home", checkin: "Check in", "coach-proposal": "Today’s plan", progress: "Progress", noticing: "Wellbeing",
  settings: "Settings", library: "Library", prescribed: "My exercises", "plan-import": "Add a plan", "your-week": "Your week",
  "arc-setup": "Your arc", "stretch-arc": "Your arc", path: "Choosing a session", "change-today": "Change today",
  "plan-share": "Share your plan", "progress-share": "Share your progress", privacy: "Privacy", upgrade: "The Plan",
  "saved-sessions": "Saved sessions", "know-what": "I know what I want", "build-session": "Build a session",
  "class-list": "Classes", classes: "Classes", "my-programme": "My programme", "weekly-plan": "Your week",
};
export const screenName = v => SCREEN_NAMES[v] || "where you were";

export function HelpView(router) {
  const from = router.helpFrom || "today";
  const open = router.helpOpen || { screen: "home" };
  router.helpOpen = null;
  let state = { screen: open.screen || "home", cat: open.cat || null, id: open.id || null };
  const trail = [];
  let query = "";
  let el = null;

  const row = (attrs, kind, icon, title, line = "") => `<li><button type="button" class="sa-change" ${attrs}>
      <span class="kind-tile kind-tile--sm k-${kind}">${lineIcon(icon, 20)}</span>
      <span class="sa-change__text"><span class="sa-change__title">${title}</span>${line ? `<span class="sa-change__line">${line}</span>` : ""}</span>
      <span class="sa-change__chev" aria-hidden="true">${lineIcon("chevron", 20)}</span></button></li>`;
  const guideRow = g => {
    const c = CATEGORIES.find(x => x.id === g.cat);
    return row(`data-guide="${g.id}"`, c?.kind || "slate", "unsure", esc(g.title));
  };
  const backBtn = label => `<div class="help-head"><button type="button" class="btn btn-ghost plan-back help-back" data-help="back" aria-label="Back to ${esc(label)}">‹ Back</button></div>`;

  function home() {
    const here = guidesFor(from);
    const cats = CATEGORIES.filter(c => GUIDES.some(g => g.cat === c.id));
    return `${backBtn(screenName(from))}
      <h1 class="help-title" tabindex="-1">How do I…?</h1>
      ${here.length ? `<section aria-labelledby="help-here-h">
        <h2 class="look-label" id="help-here-h">On this screen: ${esc(screenName(from))}</h2>
        <ul class="look-card sa-change-list">${here.map(guideRow).join("")}</ul></section>` : ""}
      <div class="help-search">
        <label for="help-q">Search the guides</label>
        <input id="help-q" class="yw-input" type="search" autocomplete="off" placeholder="For example: physio, missed, arc" value="${esc(query)}" aria-describedby="help-count">
        <p class="help-count" id="help-count" aria-live="polite"></p>
      </div>
      <ul class="look-card sa-change-list" id="help-results" hidden></ul>
      <section aria-labelledby="help-cats-h">
        <h2 class="look-label" id="help-cats-h">Everything, by what you want to do</h2>
        <ul class="look-card sa-change-list">${cats.map(c => {
          const n = GUIDES.filter(g => g.cat === c.id).length;
          return row(`data-cat="${c.id}"`, c.kind, c.icon, esc(c.name), `${n} guide${n === 1 ? "" : "s"}`);
        }).join("")}</ul>
      </section>
      ${stuck()}`;
  }

  function stuck() {
    return `<section class="look-card sa-card help-stuck" aria-labelledby="help-stuck-h">
        <h2 class="sa-card__label" id="help-stuck-h">Still stuck?</h2>
        <p>Email us, from your own email. The app sends nothing.</p>
        <p class="help-email"><strong id="help-email">${esc(HELP_EMAIL)}</strong>
          <button type="button" class="btn btn-secondary" data-help="copy" aria-describedby="help-email">Copy</button></p>
        <p class="help-sub">We can’t answer questions about your health. Your GP or a pharmacist can.</p>
      </section>
      ${supportLinesHTML("help-support")}`;
  }

  function category() {
    const c = CATEGORIES.find(x => x.id === state.cat) || CATEGORIES[0];
    const { yours, plan } = inCategory(c.id);
    return `${backBtn("How do I…?")}
      <h1 class="help-title" tabindex="-1">${esc(c.name)}</h1>
      ${yours.length ? `<ul class="look-card sa-change-list">${yours.map(guideRow).join("")}</ul>` : ""}
      ${plan.length ? `<h2 class="look-label">Part of the Plan</h2>
        <ul class="look-card sa-change-list">${plan.map(guideRow).join("")}</ul>` : ""}`;
  }

  function overview() {
    const g = guideById(state.id);
    if (!g) return home();
    const tier = tierNow();
    if (!forTier(g, tier)) {
      return `${backBtn("How do I…?")}
        <h1 class="help-title" tabindex="-1">${esc(g.title)}</h1>
        <p class="help-sub">${esc(g.outcome)}</p>
        <p class="help-sub">This is part of the Plan.</p>`;
    }
    if (g.readOnly) {
      const lines = g.read.filter(l => !l.tiers || l.tiers.includes(tier));
      const walk = guideById(g.walk);
      return `${backBtn("How do I…?")}
        <h1 class="help-title" tabindex="-1">${esc(g.title)}</h1>
        <p class="help-lead">${esc(g.outcome)}</p>
        <section class="look-card sa-card" aria-labelledby="help-steps-h"><h2 class="sa-card__label" id="help-steps-h">What happens</h2>
          <ol class="help-steps">${lines.map(l => `<li>${sayHTML(l.say, esc)}</li>`).join("")}</ol></section>
        ${walk && wayFor(walk) ? `<button type="button" class="btn btn-primary btn-large btn-full" data-help="go" data-walk="${walk.id}">Guide me through it</button>
          <p class="help-sub help-after">I’ll ring each button on the real screen and tell you the next step as you go. You can stop at any time.</p>` : ""}
        ${notQuite(g)}`;
    }
    const way = wayFor(g);
    if (!way) {
      return `${backBtn("How do I…?")}
        <h1 class="help-title" tabindex="-1">${esc(g.title)}</h1>
        <p class="help-lead">${esc(g.outcome)}</p>
        <p class="help-sub">${sayHTML(g.noWay || "This doesn’t apply to you yet.", esc)}</p>`;
    }
    const n = way.parts.reduce((a, p) => a + p.steps.length, 0);
    const many = way.parts.length > 1;
    return `${backBtn("How do I…?")}
      <h1 class="help-title" tabindex="-1">${esc(g.title)}</h1>
      <p class="help-lead">${sayHTML(g.outcome, esc)}</p>
      <section class="look-card sa-card" aria-labelledby="help-steps-h">
        <h2 class="sa-card__label" id="help-steps-h">${many ? `${way.parts.length === 2 ? "Two" : way.parts.length} parts, ${n} steps` : `${n} step${n === 1 ? "" : "s"}`}</h2>
        ${way.parts.map(p => `${many || p.name ? `<p class="help-steps__part">${esc(p.name || "")}</p>` : ""}<ol class="help-steps">${p.steps.map(s => `<li>${sayHTML(s.alts ? s.alts.map(a => a.say).join(" Or: ") : s.say, esc)}</li>`).join("")}</ol>`).join("")}
      </section>
      <button type="button" class="btn btn-primary btn-large btn-full" data-help="go" data-walk="${g.id}">Guide me through it</button>
      <p class="help-sub help-after">I’ll ring each button on the real screen and tell you the next step as you go. You can stop at any time.</p>`;
  }

  function notQuite(g, heading = "Not quite?") {
    const tier = tierNow();
    const items = g.notQuite.filter(n => !n.tiers || n.tiers.includes(tier));
    if (!items.length) return "";
    return `<h2 class="look-label">${esc(heading)}</h2>
      <ul class="look-card help-nq">${items.map(n => {
        const target = n.guide ? guideById(n.guide) : null;
        if (target && forTier(target, tier)) return `<li><button type="button" class="sa-change" data-guide="${target.id}">
            <span class="sa-change__text"><span class="sa-change__title">“${esc(n.q)}”</span><span class="sa-change__line">${esc(target.title)}</span></span>
            <span class="sa-change__chev" aria-hidden="true">${lineIcon("chevron", 20)}</span></button></li>`;
        return `<li><details class="help-nq__item"><summary>“${esc(n.q)}”</summary><p>${sayHTML(n.answer || "", esc)}</p></details></li>`;
      }).join("")}</ul>`;
  }

  function done() {
    const g = guideById(state.id);
    return `<h1 class="help-title" tabindex="-1">Did that work?</h1>
      <button type="button" class="btn btn-primary btn-large btn-full" data-help="yes">Yes, back to where I was</button>
      ${g ? notQuite(g) : ""}
      <p class="help-sub help-after">Optional. Nothing is recorded about your answer.</p>`;
  }

  function render(focus = true) {
    const body = state.screen === "cat" ? category() : state.screen === "guide" ? overview() : state.screen === "done" ? done() : home();
    el.innerHTML = `<div class="help-view look-view">${body}</div>`;
    if (state.screen === "home" && query) search(query);
    if (focus) {
      try { window.scrollTo({ top: 0, left: 0, behavior: "instant" }); } catch { /* jsdom */ }
      el.querySelector("h1")?.focus({ preventScroll: true });
    }
  }

  function search(q) {
    const box = el.querySelector("#help-results"), count = el.querySelector("#help-count");
    if (!box) return;
    const hits = searchGuides(q);
    if (!String(q).trim()) { box.hidden = true; box.innerHTML = ""; count.textContent = ""; return; }
    count.textContent = hits.length ? `${hits.length} guide${hits.length === 1 ? "" : "s"} match.` : `Nothing matched “${q}”. Try a group below.`;
    box.hidden = !hits.length;
    box.innerHTML = hits.map(guideRow).join("");
  }

  function go(next) { trail.push({ ...state }); state = next; render(); }

  function leave() {
    router.helpReturnFocus = true;
    const h = router.history || [];
    if (h[h.length - 1] === from && typeof router.back === "function") router.back();
    else router.navigate(from, { replace: true });
  }

  return {
    mount(container) {
      el = container;
      render();
      el.addEventListener("input", e => { if (e.target.id === "help-q") { query = e.target.value; search(query); } });
      el.addEventListener("click", e => {
        const b = e.target.closest("button");
        if (!b) return;
        const d = b.dataset;
        if (d.help === "back") { if (trail.length) { state = trail.pop(); render(); } else leave(); return; }
        if (d.cat) return go({ screen: "cat", cat: d.cat });
        if (d.guide) return go({ screen: "guide", id: d.guide });
        if (d.help === "go") { startGuide(d.walk); return; }
        if (d.help === "yes") return leave();
        if (d.help === "copy") {
          try { navigator.clipboard?.writeText(HELP_EMAIL).catch(() => {}); } catch { /* no clipboard */ }
          b.textContent = "Copied";
          const live = document.getElementById("guide-live");
          if (live) live.textContent = "Email address copied.";
        }
      });
    },
  };
}
