/**
 * js/views/in-step.js
 * 06 Nov 2026 v6
 *
 * v6 - P-28 EMPATHY-THREAD, S3 IN STEP PLAYER (Graeme, 05 Nov: In Step
 *   "probably becomes a program"). The four movements and their scenarios
 *   are gone (archived first: BNH-Files Archive/P-28 In Step Environment/,
 *   and docs/archive-code/). In Step is now a programme of four parts, six
 *   episodes each (data/in-step-programme.js, the approved wording v5 word
 *   for word), played as the approved prototype v5 plays it:
 *
 *     Before we start  last time's Carry it, "Did it come up?", three taps
 *                      (It did / Not yet / It didn't come up), or skip;
 *                      only the tap is kept (Schema v1.123).
 *     Listen           the scene, on screen, and heard when the coach's
 *                      voice is on and the file is there.
 *     Hold still       the position, its seated (or standing) way, Skip
 *                      the hold; then the timer, and the voice starts by
 *                      itself with it, with one big Pause the voice.
 *     Choose           three ways, none right; then "There's no wrong
 *                      answer." whichever was chosen. The choice is not
 *                      kept anywhere (the old room logged it).
 *     Carry it         one small thing for today, and at the end of a
 *                      part, its closing line.
 *
 *   The order is kept: the next episode in order, and any already done,
 *   are open; nothing later. Opened from Wellbeing any time, or from a
 *   finish's offer (data/in-step-offer.js). Both tiers (Graeme, 05 Nov).
 *   The colour is orchid, always with the two-figures icon and the words
 *   In Step. No Learn why: each part says why in one plain sentence, and
 *   no research is cited. Free's door to the Plan stays on Carry it, and
 *   says four parts (Graeme, 06 Nov; it said four movements).
 *
 * v5 - P-13 rooms (31 Oct): the one look on the Plan. v4 - A-4 word budget.
 * v3 - A11Y-HEADER. v2 - IS-2 staged order. v1 - 09 Aug 2026. Their notes
 * are in the archived copy (docs/archive-code/in-step_v5_retired_06nov2026.js).
 */
import { store }   from "../store.js";
import { router }  from "../router.js";
import { isPremium } from "../auth.js";
import { lineIcon } from "../data/line-icons.js";
import { PARTS, EPISODES, ACK, ANSWERS, getEpisode, getPart, episodesInPart, nextEpisodeId } from "../data/in-step-programme.js";
import { programme, currentEpisodeId, isOpen, lastTimeLine, answerLastTime, completeEpisode,
         takePendingEpisode, LOW_DAY_LINE } from "../data/in-step-offer.js";
import { playLine, stopLine, voiceOn } from "../coach-audio.js";

export const centered = false;

const STEPS = ["Listen", "Hold still", "Choose", "Carry it"];
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

let phase  = "landing";   // landing | prev | listen | holdIntro | hold | choose | carry
let epId   = null;
let low    = false;       // opened from a low day's offer
let from   = "wellbeing"; // wellbeing | finish
let chosen = null;
let timer  = null;
let left   = 0;
let _internal = false;    // true while this file redraws itself (go)

function _stop() {
  if (timer) { clearInterval(timer); timer = null; }
  stopLine();
}

// ── Pieces ──────────────────────────────────────────────────────────────
const icon = (size = 20) => lineIcon("instep", size);
const eyebrow = text => `<p class="instep-eyebrow k-orchid">${icon(18)}<span>${esc(text)}</span></p>`;

function stepNav(n) {
  return `<nav class="instep-steps" aria-label="This episode's steps"><ol>${STEPS.map((w, i) =>
    `<li class="${i < n ? "is-done" : ""}${i === n ? " is-now" : ""}"${i === n ? ' aria-current="step"' : ""}>${w}${i < n ? '<span class="sr-only">, done</span>' : ""}</li>`).join("")}</ol></nav>`;
}

function epHeader(e) {
  return `<div class="workout-header instep-bar">
      <button type="button" class="btn btn-ghost${isPremium() ? " plan-exit" : ""}" id="is-exit">Exit</button>
      ${eyebrow(`In Step · Part ${e.part} · ${e.episode} of 6`)}
    </div>`;
}

const speaking = `<p class="instep-speaking" id="is-spk" hidden><span class="instep-dots" aria-hidden="true"><i></i><i></i><i></i></span>Speaking</p>`;
const pauseBtn = (big = false) => `<button type="button" class="btn ${big ? "btn-primary btn-large" : "btn-secondary"} btn-full instep-pause" id="is-pause" hidden>Pause the voice</button>`;

function altLine(alt) {
  // "Or stand, hands the same." and "Seated: let your weight ..." say what
  // they are; the rest are the seated way.
  return /^(Or |Seated:)/.test(alt.text) ? alt.text : `Seated: ${alt.text}`;
}

function shell(inner) {
  return `<div class="view in-step-view${isPremium() ? " is-plan" : ""}">${inner}</div>`;
}

// ── Screens ─────────────────────────────────────────────────────────────
function renderLanding() {
  const p = programme();
  const cur = currentEpisodeId(p);
  const curE = cur ? getEpisode(cur) : null;
  const back = isPremium()
    ? `<button type="button" class="btn btn-ghost plan-back" id="is-back" aria-label="Back to Wellbeing">‹ Back</button>`
    : `<button type="button" class="btn btn-ghost" id="is-back" aria-label="Back to Wellbeing">← Back</button>`;
  const reachedPart = n => episodesInPart(n).some(e => isOpen(e.id, p));
  return shell(`
    <div class="workout-header">${back}<h1 class="workout-header-title" tabindex="-1">In Step</h1></div>
    ${eyebrow("In Step")}
    <p class="instep-intro">Short moments after a session about the people around you. They come one at a time, in order, and anything you've done is here whenever you like.</p>
    ${curE ? `
      <button type="button" class="instep-next" data-ep="${curE.id}">
        <span class="kind-tile k-orchid">${icon()}</span>
        <span class="instep-next__txt"><span class="instep-next__part">Part ${curE.part}: ${esc(getPart(curE.part).name)}</span>
        <span class="instep-next__title">Episode ${curE.episode}: ${esc(curE.title)}</span>
        <span class="instep-next__sub">About 3 minutes</span></span>
      </button>` : `<p class="instep-intro">${esc(PARTS[3].closing.text)}</p>`}
    ${PARTS.map(part => `
      <section class="instep-part" aria-labelledby="is-part-${part.n}">
        <h2 id="is-part-${part.n}">Part ${part.n}: ${esc(part.name)}</h2>
        <p class="instep-why">${esc(part.why)}</p>
        ${reachedPart(part.n) ? `<ul class="instep-eps">${episodesInPart(part.n).filter(e => isOpen(e.id, p)).map(e => `
          <li><button type="button" class="instep-ep" data-ep="${e.id}">
            <span class="instep-ep__title">Episode ${e.episode}: ${esc(e.title)}</span>
            <span class="instep-ep__sub">${p.done.includes(e.id) ? "Done. Open it again any time" : "Next · About 3 minutes"}</span>
          </button></li>`).join("")}</ul>`
          : `<p class="instep-later">Opens after Part ${part.n - 1}.</p>`}
      </section>`).join("")}
  `);
}

function renderPrev(e) {
  return shell(`${epHeader(e)}
    <h1 tabindex="-1">Before we start</h1>
    ${low ? `<p class="instep-low">${esc(LOW_DAY_LINE)}</p>` : ""}
    <div class="card instep-card"><p class="instep-prev" id="is-prev-line">${esc(lastTimeLine())}</p></div>
    <div class="instep-answers" role="group" aria-labelledby="is-prev-line">
      ${ANSWERS.map(a => `<button type="button" class="btn btn-secondary btn-full" data-answer="${a.id}">${esc(a.label)}</button>`).join("")}
    </div>
    <p class="instep-small">Only your tap is kept. No score, nothing to write.</p>
    <button type="button" class="btn btn-secondary btn-full" id="is-skip-prev">Skip this and start</button>`);
}

function renderListen(e) {
  return shell(`${epHeader(e)}
    <h1 tabindex="-1">${esc(e.title)}</h1>${stepNav(0)}
    ${low && !lastTimeLine() ? `<p class="instep-low">${esc(LOW_DAY_LINE)}</p>` : ""}
    <div class="card instep-card instep-said">${speaking}<p>${esc(e.listen.text)}</p>${pauseBtn()}</div>
    <button type="button" class="btn btn-primary btn-large btn-full" id="is-next">Next: hold still</button>`);
}

function renderHoldIntro(e) {
  const h = e.hold;
  return shell(`${epHeader(e)}
    <h1 tabindex="-1">Hold still</h1>${stepNav(1)}
    <div class="card instep-pose"><h2>${esc(h.pose)}</h2><p>${esc(h.how)}</p><p class="instep-small">${esc(altLine(h.alt))}</p></div>
    ${voiceOn() ? `<p class="instep-small">When you press Start, I'll talk you through it. You won't need to touch the phone.</p>` : ""}
    <div class="instep-row">
      <button type="button" class="btn btn-secondary" id="is-skip-hold">Skip the hold</button>
      <button type="button" class="btn btn-primary" id="is-hold-go">Start ${h.secs} seconds</button>
    </div>`);
}

function renderHold(e) {
  const h = e.hold, C = 2 * Math.PI * 76;
  return shell(`${epHeader(e)}
    <h1 tabindex="-1">${esc(h.pose)}</h1>${stepNav(1)}
    <div class="instep-ring" role="timer" aria-label="Time left, in seconds">
      <svg viewBox="0 0 170 170" aria-hidden="true" focusable="false"><circle class="instep-ring__track" cx="85" cy="85" r="76"/><circle class="instep-ring__arc" id="is-arc" cx="85" cy="85" r="76" stroke-dasharray="${C}" stroke-dashoffset="0"/></svg>
      <span class="instep-ring__n" id="is-left">${left}</span>
    </div>
    <div class="card instep-card instep-said">${speaking}<p>${esc(h.text)}</p></div>
    ${pauseBtn(true)}
    <div id="is-hold-end"></div>`);
}

function renderChoose(e) {
  return shell(`${epHeader(e)}
    <h1 tabindex="-1">Choose</h1>${stepNav(2)}
    <fieldset class="instep-choose"><legend>${esc(e.choose.question)}</legend>
      ${e.choose.options.map((o, k) => `<label class="instep-opt"><input type="radio" name="is-opt" value="${k}"${chosen === k ? " checked" : ""}><span>${esc(o)}</span></label>`).join("")}
    </fieldset>
    <p class="instep-ack" id="is-ack" role="status">${chosen === null ? "" : esc(ACK.text)}</p>
    <button type="button" class="btn btn-primary btn-large btn-full" id="is-next">Next: carry it</button>`);
}

function renderCarry(e) {
  const closing = e.episode === 6 ? getPart(e.part).closing : null;
  const more = nextEpisodeId(e.id) !== null;
  return shell(`${epHeader(e)}
    <h1 tabindex="-1">Carry it</h1>${stepNav(3)}
    <p class="instep-small instep-center">One small thing for today</p>
    <div class="card instep-card instep-carry">${speaking}<p>${esc(e.carry.text)}</p>${pauseBtn()}</div>
    ${more ? `<p class="instep-small">I'll ask how it went next time.</p>` : ""}
    ${closing ? `<p class="instep-closing">${esc(closing.text)}</p>` : ""}
    ${!isPremium() ? `
      <aside class="upgrade-door" aria-label="About the paid plan">
        <p class="upgrade-door__text">That&rsquo;s In Step — four parts, one thing at a time, each going a bit deeper.</p>
        <p class="upgrade-door__text">There&rsquo;s a longer version of the same idea. You pick something you&rsquo;d like to get better at — being steadier, being more present, noticing other people more — and I build it out over months, shaped around what you&rsquo;re actually noticing rather than a fixed course.</p>
        <p class="upgrade-door__text upgrade-door__text--quiet">That&rsquo;s part of the paid plan, if you ever fancy it.</p>
        <button type="button" class="upgrade-door__link" id="is-door-btn">Have a look</button>
      </aside>` : ""}
    <button type="button" class="btn btn-primary btn-large btn-full" id="is-done">Done</button>`);
}

export function render() {
  // A finish's Start hands over the episode once (data/in-step-offer.js).
  const pending = takePendingEpisode();
  if (pending) { _stop(); epId = pending.id; low = pending.low; chosen = null; from = "finish"; phase = "start"; }
  // Opened by the router (not a step of this file): the list, quiet.
  else if (!_internal) { _stop(); phase = "landing"; epId = null; low = false; chosen = null; from = "wellbeing"; }
  const e = epId ? getEpisode(epId) : null;
  if (!e) phase = "landing";
  if (phase === "start") phase = lastTimeLine() && programme().lastAnswer === null ? "prev" : "listen";
  switch (phase) {
    case "prev":      return renderPrev(e);
    case "listen":    return renderListen(e);
    case "holdIntro": return renderHoldIntro(e);
    case "hold":      return renderHold(e);
    case "choose":    return renderChoose(e);
    case "carry":     return renderCarry(e);
    default:          return renderLanding();
  }
}

// ── Behaviour ───────────────────────────────────────────────────────────
function go(next) {
  _stop();
  phase = next;
  const main = document.getElementById("main-content");
  if (!main) return;
  _internal = true;
  try { main.innerHTML = render(); } finally { _internal = false; }
  onMount();
  window.scrollTo?.(0, 0);
}

function voice(id, { then } = {}) {
  const spk = document.getElementById("is-spk"), pause = document.getElementById("is-pause");
  const quiet = () => { if (spk) spk.hidden = true; if (pause) pause.hidden = true; };
  const h = playLine(id, {
    onPlaying: () => { if (spk) spk.hidden = false; if (pause) { pause.hidden = false; pause.disabled = false; pause.textContent = "Pause the voice"; } },
    onEnd: () => { quiet(); then?.(); },
  });
  if (pause) pause.addEventListener("click", () => { stopLine(); pause.hidden = false; pause.textContent = "Voice paused"; pause.disabled = true; if (spk) spk.hidden = true; });
  return h;
}

function startEpisode(id, opts = {}) {
  epId = id; low = !!opts.low; chosen = null;
  go(lastTimeLine() && programme().lastAnswer === null ? "prev" : "listen");
}

function leave() {
  _stop();
  const wasFinish = from === "finish";
  phase = "landing"; epId = null; low = false; chosen = null; from = "wellbeing";
  if (wasFinish) router.navigate("today"); else go("landing");
}

export function onMount() {
  const root = document.querySelector(".in-step-view");
  if (!root) return;
  root.querySelector("h1")?.focus?.();
  const e = epId ? getEpisode(epId) : null;

  root.querySelector("#is-back")?.addEventListener("click", () => { _stop(); router.navigate("noticing"); });
  root.querySelectorAll("[data-ep]").forEach(b => b.addEventListener("click", () => { from = "wellbeing"; startEpisode(b.dataset.ep); }));
  root.querySelector("#is-exit")?.addEventListener("click", leave);

  if (phase === "prev") {
    root.querySelectorAll("[data-answer]").forEach(b => b.addEventListener("click", () => { answerLastTime(b.dataset.answer); go("listen"); }));
    root.querySelector("#is-skip-prev")?.addEventListener("click", () => go("listen"));
  }
  if (phase === "listen" && e) {
    voice(e.listen.audio);
    root.querySelector("#is-next")?.addEventListener("click", () => go("holdIntro"));
  }
  if (phase === "holdIntro" && e) {
    root.querySelector("#is-skip-hold")?.addEventListener("click", () => go("choose"));
    root.querySelector("#is-hold-go")?.addEventListener("click", () => { left = e.hold.secs; go("hold"); });
  }
  if (phase === "hold" && e) {
    // The voice starts by itself when the timer starts (Graeme, 05 Nov).
    voice(e.hold.audio);
    const C = 2 * Math.PI * 76, total = e.hold.secs;
    timer = setInterval(() => {
      left = Math.max(0, left - 0.25);
      const n = document.getElementById("is-left"); if (n) n.textContent = String(Math.ceil(left));
      const a = document.getElementById("is-arc"); if (a) a.setAttribute("stroke-dashoffset", String(C * (1 - left / total)));
      if (left <= 0) {
        clearInterval(timer); timer = null;
        const end = document.getElementById("is-hold-end");
        if (end && !end.firstChild) {
          end.innerHTML = `<button type="button" class="btn btn-primary btn-large btn-full" id="is-next">Next</button>`;
          end.querySelector("#is-next").addEventListener("click", () => go("choose"));
          end.querySelector("#is-next").focus();
        }
      }
    }, 250);
  }
  if (phase === "choose" && e) {
    root.querySelectorAll('input[name="is-opt"]').forEach(r => r.addEventListener("change", () => {
      const first = chosen === null;
      chosen = Number(r.value);
      const ack = document.getElementById("is-ack"); if (ack) ack.textContent = ACK.text;
      if (first) playLine(ACK.audio);
    }));
    root.querySelector("#is-next")?.addEventListener("click", () => go("carry"));
  }
  if (phase === "carry" && e) {
    completeEpisode(e.id);
    const closing = e.episode === 6 ? getPart(e.part).closing : null;
    voice(e.carry.audio, { then: closing ? () => playLine(closing.audio) : null });
    document.getElementById("is-door-btn")?.addEventListener("click", () => { _stop(); router.navigate("upgrade"); });
    root.querySelector("#is-done")?.addEventListener("click", leave);
  }
}

/** Leaving the screen (the router): quiet, and the next visit starts at the list. */
export function onUnmount() {
  _stop();
  phase = "landing"; epId = null; low = false; chosen = null; from = "wellbeing";
}
