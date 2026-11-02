/**
 * js/data/swap-search.js
 * 02 Nov 2026 v1
 *
 * P-23 SWAP-SEARCH. One rule for "search for something else", wherever the
 * Plan offers a swap (the session player, a door's proposal, Today's plan),
 * and for P-24's "Add an exercise" in What's left.
 *
 * By name or muscle (the muscle words are muscle-search's, as Make it up as
 * I go uses them). Then, always:
 *   - only what the kit where they are allows (the builder's own rule);
 *   - never one they said Not again to;
 *   - never one today's sore answer rules out (blocked, as selection blocks);
 *   - never the held movements: they are not in the library this searches.
 *   - never what is already in the session (`exclude`).
 *
 * No view state here: the views render the box and the list with
 * renderSwapSearch() and wire it with wireSwapSearch().
 */

import { store } from "../store.js";
import { EXERCISES } from "./exercises/index.js";
import { searchByTerm } from "./muscle-search.js";
import { resolveEquipment, exerciseIsAvailable } from "./equipment-map.js";
import { equipmentForLocation, soreScoresToday, soreLevelFor } from "../session-builder.js";

const esc = t => String(t ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Where they are: the session's own place, else gym or home as Make it up as I go decides. */
export function swapPlace(place = null) {
  if (place === "gym" || place === "home" || place === "outside") return place;
  const loc = store.get("sessionLocation");
  if (loc === "gym" || loc === "home" || loc === "outside") return loc;
  const gym = store.get("gymEquipment") || [], home = store.get("homeEquipment") || [];
  const ident = store.get("movementIdentity") || [];
  return gym.length && (!home.length || (Array.isArray(ident) && ident.includes("gym"))) ? "gym" : "home";
}

/** Not again, from the person's own answers. */
function neverIds() {
  const prefs = store.get("exercisePreferences") || {};
  return new Set(Object.entries(prefs).filter(([, p]) => (p?.preference || p) === "avoid").map(([id]) => id));
}

/** Would this one be allowed here, today, for this person? The filters every list below uses. */
export function swapAllowed(place = null, exclude = []) {
  const kit = resolveEquipment(equipmentForLocation(swapPlace(place)).list);
  const never = neverIds(), out = new Set(exclude), scores = soreScoresToday();
  return e => !!e && !out.has(e.id) && !never.has(e.id)
    && exerciseIsAvailable(e, kit) && soreLevelFor(e, scores).level !== "blocked";
}

/**
 * Search the library for `q` (two letters or more), by name first and then
 * by the muscle it works. Returns up to `limit` library entries.
 */
export function searchSwaps(q, { place = null, exclude = [], limit = 8 } = {}) {
  const t = String(q || "").trim().toLowerCase();
  if (t.length < 2) return [];
  const ok = swapAllowed(place, exclude);
  const byName = EXERCISES.filter(e => (e.name || "").toLowerCase().includes(t));
  const { exercises: byArea } = searchByTerm(t, EXERCISES);
  const seen = new Set(byName.map(e => e.id));
  return [...byName, ...byArea.filter(e => !seen.has(e.id))].filter(ok).slice(0, limit);
}

/** The words under a result: what it needs, or "No kit". */
export function kitWords(e) {
  const kit = (e?.equipment || []).filter(k => k && k !== "none" && k !== "bodyweight");
  return kit.length ? kit.join(", ").replace(/[-_]/g, " ") : "No kit";
}

/** The results list's inner HTML. */
function listHtml(idp, q, found) {
  const t = String(q || "").trim();
  if (t.length < 2) return "";
  if (!found.length) return `<li class="swap-find__none">Nothing here matches “${esc(t)}” with your kit today.</li>`;
  return found.map(e => `
            <li><button type="button" class="swap-find__pick" data-find-pick="${esc(e.id)}">
              <span class="swap-find__name">${esc(e.name)}</span>
              <span class="swap-find__kit">${esc(kitWords(e))}</span>
            </button></li>`).join("");
}

/**
 * The search box and its list. `idp` keeps ids unique on the page;
 * `label` is the box's visible label.
 */
export function renderSwapSearch(idp, { label = "Search for something else", q = "", found = [] } = {}) {
  return `
        <div class="swap-find" id="${idp}-find">
          <label class="swap-find__label" for="${idp}-q">${esc(label)}</label>
          <p class="swap-find__hint" id="${idp}-hint">By name or muscle, for example “glutes”. Only what your kit allows, never one you said Not again to, or one today’s sore areas rule out.</p>
          <input class="swap-find__input" type="search" id="${idp}-q" autocomplete="off" aria-describedby="${idp}-hint" value="${esc(q)}">
          <p class="sr-only" id="${idp}-count" role="status" aria-live="polite"></p>
          <ul class="swap-find__list" id="${idp}-list">${listHtml(idp, q, found)}</ul>
        </div>`;
}

/**
 * Wire the box: typing redraws the list only (focus stays in the box); a
 * pick calls onPick(entry). `opts` is searchSwaps' options.
 */
export function wireSwapSearch(root, idp, onPick, opts = {}) {
  const box = root?.querySelector(`#${idp}-q`);
  const list = root?.querySelector(`#${idp}-list`);
  const count = root?.querySelector(`#${idp}-count`);
  if (!box || !list) return;
  let found = [];
  const draw = () => {
    found = searchSwaps(box.value, opts);
    list.innerHTML = listHtml(idp, box.value, found);
    if (count) count.textContent = box.value.trim().length < 2 ? ""
      : found.length ? `${found.length} found.` : "Nothing found.";
  };
  box.addEventListener("input", draw);
  list.addEventListener("click", ev => {
    const b = ev.target.closest("[data-find-pick]");
    if (!b) return;
    const e = EXERCISES.find(x => x.id === b.getAttribute("data-find-pick"));
    if (e) onPick(e);
  });
  if (box.value.trim().length >= 2) draw();
}
