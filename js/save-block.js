/**
 * js/save-block.js
 * 16 Sep 2026 v1
 *
 * SAVE-ALL. "Keep this one?" — offered once, on the screen every session
 * already lands on.
 *
 * ── WHY THIS IS ONE MODULE ON ONE SCREEN ─────────────────────────────
 *
 * Graeme: "I think saving the session would be good. Kinda like building
 * my own but in the moment."
 *
 * saveSession() already existed, Plan-gated, built by YOUR-OWN for
 * sessions assembled in advance. SAVE-IN-MOMENT then offered it at the
 * end of a yoga session — and an audit found that was the ONLY place it
 * was offered. Twelve other session views could not save at all.
 *
 * 🔴 The obvious fix was to add a save block to each of them, and it is
 * the wrong fix. GATE-ALL is one day old: CARD-5 wired five views by
 * hand, a gate pinned the five as complete, and stretching went
 * uncovered until Graeme walked into it. Adding the same block to four
 * more views would buy exactly the same failure, one view at a time.
 *
 * Eleven views route to reflect.js when a session ends. So the offer
 * lives THERE, once, and appears when there is something savable to
 * offer. A walk lands on the same screen and gets nothing, not because a
 * list excludes it but because a walk has no exercise ids and
 * saveSession() would refuse it.
 *
 * ⚫ THE CAPABILITY DECIDES, NOT A LIST SOMEBODY MAINTAINS BY HAND. That
 * is the whole structural difference, and verify-save-all asserts the
 * rule rather than a count of views.
 *
 * ── WHAT IS DELIBERATELY NOT OFFERED ─────────────────────────────────
 *
 * 🔴 PRESCRIBED SESSIONS. They route to reflect like everything else and
 * they DO carry exercise ids, so the capability test alone would offer
 * them. It is suppressed on purpose: those movements were chosen by a
 * physiotherapist, and copying them into a session the person owns — and
 * can then edit — quietly launders a clinical prescription into a
 * personal preset. Asserted, so a later session does not "fix" it.
 *
 * FREE ACCOUNTS get nothing here rather than a locked control.
 * savedSessions() returns [] for free by design, so a teaser would be a
 * door with no room behind it.
 *
 * AFTER the session, never before. Somebody cannot name a session they
 * have not done, and the ones worth keeping are the ones that turned out
 * well.
 */

import { store } from "./store.js";
import { isPremium } from "./auth.js";
import { saveSession } from "./data/saved-sessions.js";

function _isToday(iso) {
  if (!iso) return false;
  const d = new Date(iso);
  return !isNaN(d.getTime()) && d.toDateString() === new Date().toDateString();
}

/** The same test saveSession() applies, applied before offering. */
function _validate(built) {
  if (!built || !Array.isArray(built.exercises)) return null;
  if (built.exercises.filter(e => e && e.id).length === 0) return null;
  if (built.isPrescribed || built.prescribedBy) return null;
  return built;
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * The session that just happened, if it is one this can keep.
 *
 * Date-guarded for the same reason reflect.js guards coachAdjusted:
 * generatedSession outlives the session it was built for, so without the
 * check a walk today would offer to save yesterday's workout under
 * today's name.
 */
export function savableSession() {
  // SAVE-HANDOFF, 16 Sep 2026. lastFinishedSession FIRST.
  //
  // It is a record of what finished; generatedSession is a proposal that
  // may never have been done and outlives the day it was built for. Any
  // view can write the record, which is what lets a view that assembles
  // its own queue offer a save without carrying its own implementation.
  //
  // The fallback stays: the builder-generated views work through
  // generatedSession today and rewriting all of them to write the record
  // as well would be eleven edits for no behaviour change, which is
  // precisely the churn SAVE-ALL was written to avoid.
  const handoff = store.get("lastFinishedSession");
  if (handoff && handoff.session && _isToday(handoff.at)) {
    const h = _validate(handoff.session);
    if (h) return h;
  }

  const gen = store.get("generatedSession") || {};
  const built = gen.session || null;
  if (!built) return null;

  if (!_isToday(gen.builtAt)) return null;

  // The same test saveSession() applies, applied before offering rather
  // than after pressing. A button that always fails is worse than no
  // button.
  if (!Array.isArray(built.exercises)) return null;
  if (built.exercises.filter(e => e && e.id).length === 0) return null;

  // Prescribed work is excluded on content grounds, not capability -- see
  // the header. The entry records its own type, so this reads what the
  // session says about itself rather than guessing from the route.
  const type = String((store.get("currentActivityEntry") || {}).type || "");
  if (/prescribed/i.test(type)) return null;
  if (built.isPrescribed || built.prescribedBy) return null;

  return built;
}

/** A name somebody can accept without typing. Theirs to change. */
export function suggestedName(built) {
  const base = built.title || built.name || "Session";
  const mins = Number(built.durationMins) || null;
  return mins ? `${base} \u2014 ${mins} min` : base;
}

export function renderSaveBlock() {
  if (!isPremium()) return "";
  const built = savableSession();
  if (!built) return "";

  return `
    <div class="save-block" id="save-block" data-save-block>
      <p class="save-block-title">Keep this one?</p>
      <p class="text-sm text-muted save-block-sub">
        It will be in Your own, ready to repeat.
      </p>
      <label class="sr-only" for="save-block-name">Name for this session</label>
      <input type="text" id="save-block-name" class="save-block-name"
             value="${esc(suggestedName(built))}" maxlength="60"
             autocomplete="off" enterkeyhint="done">
      <p class="save-block-status" id="save-block-status"
         role="status" aria-live="polite"></p>
      <button type="button" class="btn btn-secondary btn-full" id="save-block-btn">
        Save this session
      </button>
    </div>`;
}

/**
 * Bound once. The button becomes non-interactive AFTER a successful save
 * rather than the block vanishing: a block that disappears looks like a
 * failure, and somebody who taps twice should see that it worked, not
 * wonder where it went.
 *
 * Every refusal reason from saveSession() is reported in words. Silence
 * on a failed save is how a person ends up believing they have a session
 * they do not have.
 */
export function attachSaveBlock(root) {
  const el = (root || document).querySelector("[data-save-block]");
  if (!el || el.dataset.bound === "1") return;
  el.dataset.bound = "1";

  const input  = el.querySelector("#save-block-name");
  const status = el.querySelector("#save-block-status");
  const btn    = el.querySelector("#save-block-btn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const built = savableSession();
    if (!built) {
      if (status) status.textContent = "That session is no longer available to save.";
      return;
    }

    const res = saveSession(input ? input.value : "", built);

    if (res && res.ok) {
      if (status) status.textContent = "Saved. It is in Your own.";
      btn.textContent = "Saved";
      btn.disabled = true;
      if (input) input.disabled = true;
      return;
    }

    const why = {
      name:  "Give it a name first.",
      empty: "There are no movements in this one to keep.",
      tier:  "Saving sessions is part of the Plan.",
      dupe:  "You already have one saved under that name."
    };
    if (status) {
      status.textContent = (res && why[res.reason]) || "That could not be saved.";
    }
    if (res && res.reason === "name" && input) input.focus();
  });
}
