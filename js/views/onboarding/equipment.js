/**
 * js/views/onboarding/equipment.js
 * 26 Jun 2026 v3
 *
 * v3 (26 Jun 2026)
 *   Bodyweight only: tapping the card now toggles selection state on the
 *   facility list (no sub-screen). No equipment is written — empty array
 *   is the correct store state for bodyweight-only users. The card shows
 *   a teal tick and active left-border when selected, tapping again deselects.
 *
 * v2a (26 Jun 2026)
 *   Fix: wireFacilities() finish button routes to onboarding/frequency.
 *
 * v2 (26 Jun 2026)
 *   Facility cards: full card treatment — elevated background, large icon,
 *   description line, chevron right-aligned, teal left-border selected state.
 *   Equipment sub-screen: collapsible accordions per category, first open by
 *   default. Wrapping chip layout inside each accordion. Category header shows
 *   selected count badge when items are chosen inside. Preset toggle stays
 *   above accordions as a one-tap shortcut. Back/Done wiring unchanged.
 *
 * v1 (22 May 2026 S4-3)
 *   Rebuilt to match Settings > Equipment. Two-level flow: facility cards ->
 *   sub-screen with chips. Preset toggle. Same FACILITY_DEFS as settings.js.
 */

import { store }             from "../../store.js";
import { EQUIPMENT_CATEGORIES } from "../../data/equipment.js";

export const centered = false;

// ── Facility definitions (matches settings.js) ───────────────────

const FACILITY_DEFS = [
  {
    id: "gym-full", label: "Full gym", icon: "&#127947;", scope: "gym",
    description: "Weights, machines, cardio — the full setup",
    equipment: [
      "dumbbells-light","dumbbells-medium","dumbbells-heavy","adjustable-dumbbells",
      "kettlebell-light","kettlebell-medium","kettlebell-heavy",
      "barbell","ez-curl-bar",
      "band-light","band-medium","band-heavy",
      "treadmill","exercise-bike","rowing-machine","elliptical",
      "bench-flat","bench-adjustable",
      "pull-up-bar","dip-station",
      "stability-ball","ab-wheel",
      "foam-roller","massage-gun","gym-membership"
    ]
  },
  {
    id: "swimming-pool", label: "Swimming pool", icon: "&#127946;", scope: "gym",
    description: "Lane swimming or aqua fitness",
    equipment: ["swimming-pool"]
  },
  {
    id: "fitness-studio", label: "Fitness studio", icon: "&#127973;", scope: "gym",
    description: "Yoga, pilates, spin, or circuit classes",
    equipment: ["fitness-studio","yoga-mat","band-light","band-medium","step-platform"]
  },
  {
    id: "home", label: "Home setup", icon: "&#127968;", scope: "home",
    description: "Tell me what you have at home",
    equipment: []
  },
  {
    id: "no-equipment", label: "Bodyweight only", icon: "&#128694;", scope: "home",
    description: "Floor space is all you need",
    equipment: []
  },
];

// ── State ────────────────────────────────────────────────────────

let screen            = "facilities"; // "facilities" | facility-id string
let openCategory      = null;         // category id currently expanded, or null
let bodyweightSelected = false;       // bodyweight-only toggle state

// ── Equipment helpers ────────────────────────────────────────────

function getEquipmentForScope(scope) {
  return scope === "home"
    ? (store.get("homeEquipment") || [])
    : (store.get("gymEquipment")  || []);
}

function saveEquipmentForScope(scope, items) {
  if (scope === "home") store.set("homeEquipment", items);
  else                  store.set("gymEquipment",  items);
  const gym  = store.get("gymEquipment")  || [];
  const home = store.get("homeEquipment") || [];
  store.set("equipment", Array.from(new Set([...gym, ...home])));
}

function isFacilityActive(facility) {
  if (facility.equipment.length === 0) return false;
  const current = getEquipmentForScope(facility.scope);
  return facility.equipment.some(eq => current.includes(eq));
}

function toggleFacilityPreset(facilityId) {
  const facility = FACILITY_DEFS.find(f => f.id === facilityId);
  if (!facility) return;
  const current  = getEquipmentForScope(facility.scope);
  const isActive = facility.equipment.length > 0 &&
                   facility.equipment.some(eq => current.includes(eq));
  if (isActive) {
    saveEquipmentForScope(facility.scope, current.filter(eq => !facility.equipment.includes(eq)));
  } else {
    saveEquipmentForScope(facility.scope, Array.from(new Set([...current, ...facility.equipment])));
  }
}

function totalSelected() {
  return (store.get("equipment") || []).length;
}

// ── Render ───────────────────────────────────────────────────────

export function render() {
  screen             = "facilities";
  openCategory       = null;
  bodyweightSelected = false;
  return renderView();
}

function renderView() {
  return screen === "facilities" ? renderFacilities() : renderSubScreen(screen);
}

function renderFacilities() {
  const gymFacilities  = FACILITY_DEFS.filter(f => f.scope === "gym");
  const homeFacilities = FACILITY_DEFS.filter(f => f.scope === "home");
  const total          = totalSelected();

  return `
    <div class="onboarding-view">

      <div class="onboarding-header">
        <button class="btn btn-ghost" id="equip-onboard-back"
                aria-label="Back to lifestyle">
          &larr; Back
        </button>
        <div class="progress-dots" aria-label="Step 8 of 8">
          <span class="dot completed" aria-hidden="true"></span>
          <span class="dot completed" aria-hidden="true"></span>
          <span class="dot completed" aria-hidden="true"></span>
          <span class="dot completed" aria-hidden="true"></span>
          <span class="dot completed" aria-hidden="true"></span>
          <span class="dot completed" aria-hidden="true"></span>
          <span class="dot active"    aria-hidden="true"></span>
        </div>
      </div>

      <div class="onboarding-content" style="padding-bottom:var(--space-2);">
        <h1>What do you have available?</h1>
        <div class="onboarding-coach-line">
          <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
          <p class="onboarding-coach-text">
            Tell me where you train and what you have.
            I will build every session around what is actually available to you —
            never assuming you have something you have not told me about.
          </p>
        </div>

        <h3 class="equip-section-heading">At the gym or facility</h3>
        <div class="equip-facility-list" role="list">
          ${gymFacilities.map(f => renderFacilityCard(f)).join("")}
        </div>

        <h3 class="equip-section-heading">At home</h3>
        <div class="equip-facility-list" role="list">
          ${homeFacilities.map(f => renderFacilityCard(f)).join("")}
        </div>
      </div>

      <div class="onboarding-actions">
        <button class="btn btn-primary btn-large btn-full" id="equip-finish-btn">
          ${total > 0 ? "Finish setup" : "Continue with bodyweight only"}
        </button>
        ${total > 0 ? `<p class="text-sm text-secondary text-center" style="margin-top:var(--space-2);">${total} items selected</p>` : ""}
      </div>
    </div>
  `;
}

function renderFacilityCard(f) {
  const active = isFacilityActive(f);
  const homeItems = f.scope === "home" ? (store.get("homeEquipment") || []) : [];
  const homeActive = f.id === "home" && homeItems.length > 0;
  const isActive = active || homeActive;

  // Bodyweight only — toggle card, no sub-screen
  if (f.id === "no-equipment") {
    const bwActive = bodyweightSelected;
    return `
      <button class="equip-facility-card ${bwActive ? "equip-facility-card--active" : ""}"
              data-facility="no-equipment"
              data-bodyweight-toggle="true"
              role="listitem"
              aria-pressed="${bwActive}"
              aria-label="${f.label}. ${f.description}. ${bwActive ? "Selected." : "Tap to select."}">
        <span class="equip-facility-icon" aria-hidden="true">${f.icon}</span>
        <span class="equip-facility-body">
          <span class="equip-facility-label">${f.label}</span>
          <span class="equip-facility-desc">${f.description}</span>
        </span>
        ${bwActive ? `<span class="equip-facility-check" aria-hidden="true">&#10003;</span>` : `<span class="equip-facility-chevron" aria-hidden="true">&#8250;</span>`}
      </button>
    `;
  }

  return `
    <button class="equip-facility-card ${isActive ? "equip-facility-card--active" : ""}"
            data-facility="${f.id}"
            role="listitem"
            aria-label="${f.label}. ${f.description}. ${isActive ? "Items selected. " : ""}Tap to open.">
      <span class="equip-facility-icon" aria-hidden="true">${f.icon}</span>
      <span class="equip-facility-body">
        <span class="equip-facility-label">${f.label}</span>
        <span class="equip-facility-desc">${f.description}</span>
      </span>
      ${isActive ? `<span class="equip-facility-check" aria-hidden="true">&#10003;</span>` : `<span class="equip-facility-chevron" aria-hidden="true">&#8250;</span>`}
    </button>
  `;
}

function renderSubScreen(facilityId) {
  const facility = FACILITY_DEFS.find(f => f.id === facilityId);
  if (!facility) { screen = "facilities"; return renderFacilities(); }

  const currentItems = getEquipmentForScope(facility.scope);
  const isPreset     = facility.equipment.length > 0;
  const presetActive = isPreset && facility.equipment.some(eq => currentItems.includes(eq));

  // Determine which categories have items relevant to this facility
  const relevantCats = EQUIPMENT_CATEGORIES.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      facility.scope === "home" ||
      facility.equipment.includes(item.id) ||
      currentItems.includes(item.id)
    )
  })).filter(cat => cat.items.length > 0);

  // Default: open the first category
  if (openCategory === null && relevantCats.length > 0) {
    openCategory = relevantCats[0].id;
  }

  const totalInFacility = currentItems.length;

  return `
    <div class="onboarding-view">

      <div class="onboarding-header" style="justify-content:flex-start;gap:var(--space-3);">
        <button class="btn btn-ghost" id="equip-sub-back"
                aria-label="Back to equipment locations">
          &larr; Back
        </button>
        <span style="font-size:var(--text-base);font-weight:var(--font-semibold);">
          ${facility.icon} ${facility.label}
        </span>
      </div>

      <div class="onboarding-content">

        ${isPreset ? `
          <div class="equip-preset-card">
            <div class="equip-preset-card__body">
              <p class="equip-preset-card__title">Add everything from ${facility.label}</p>
              <p class="equip-preset-card__sub">${facility.equipment.length} items in one tap</p>
            </div>
            <button class="btn ${presetActive ? "btn-secondary" : "btn-primary"} btn-sm"
                    id="equip-preset-toggle"
                    data-facility="${facility.id}"
                    aria-pressed="${presetActive}">
              ${presetActive ? "Remove all" : "Add all"}
            </button>
          </div>
        ` : ""}

        ${facility.scope === "home" && relevantCats.length === 0 ? `
          <div class="card" style="text-align:center;padding:var(--space-6);margin-top:var(--space-4);">
            <p class="text-secondary">Use the categories below to add your home equipment.</p>
            <p class="text-sm text-muted" style="margin-top:var(--space-2);">
              A clear floor is enough. I will never assume you have something you have not told me about.
            </p>
          </div>
        ` : ""}

        <div class="equip-accordion-list">
          ${relevantCats.length > 0 ? relevantCats.map(cat => {
            const selectedInCat = cat.items.filter(item => currentItems.includes(item.id)).length;
            const isOpen        = openCategory === cat.id;
            return `
              <div class="equip-accordion ${isOpen ? "equip-accordion--open" : ""}"
                   data-cat-id="${cat.id}">
                <button class="equip-accordion__header"
                        data-cat-toggle="${cat.id}"
                        aria-expanded="${isOpen}"
                        aria-controls="equip-cat-${cat.id}">
                  <span class="equip-accordion__heading">
                    <span aria-hidden="true">${cat.icon}</span>
                    ${cat.name}
                  </span>
                  <span class="equip-accordion__meta">
                    ${selectedInCat > 0 ? `<span class="equip-cat-badge">${selectedInCat}</span>` : ""}
                    <span class="equip-accordion__chevron" aria-hidden="true">&#8250;</span>
                  </span>
                </button>
                <div class="equip-accordion__body" id="equip-cat-${cat.id}"
                     ${isOpen ? "" : `style="display:none;"`}>
                  <div class="equip-chip-wrap">
                    ${cat.items.map(item => `
                      <button class="equip-item-chip ${currentItems.includes(item.id) ? "equip-item-chip--selected" : ""}"
                              data-equipment="${item.id}"
                              data-scope="${facility.scope}"
                              aria-pressed="${currentItems.includes(item.id)}">
                        ${item.name}
                      </button>
                    `).join("")}
                  </div>
                </div>
              </div>
            `;
          }).join("") : `
            <div class="card" style="text-align:center;padding:var(--space-6);">
              <p class="text-secondary">No equipment categories available for this location.</p>
            </div>
          `}
        </div>

      </div>

      <div class="onboarding-actions">
        <button class="btn btn-primary btn-large btn-full" id="equip-sub-done-btn">
          ${totalInFacility > 0 ? "Done — " + totalInFacility + " item" + (totalInFacility !== 1 ? "s" : "") + " selected" : "Done"}
        </button>
      </div>
    </div>
  `;
}

// ── Mount ────────────────────────────────────────────────────────

export function onMount() {
  wireView();
}

function wireView() {
  if (screen === "facilities") wireFacilities();
  else wireSubScreen();
}

function wireFacilities() {
  document.getElementById("equip-onboard-back")?.addEventListener("click", () => {
    router.navigate("onboarding/lifestyle");
  });

  document.querySelectorAll(".equip-facility-card[data-facility]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.bodyweightToggle) {
        // Toggle bodyweight selection — no sub-screen
        bodyweightSelected = !bodyweightSelected;
        rerender();
        return;
      }
      screen       = btn.dataset.facility;
      openCategory = null;
      rerender();
    });
  });

  document.getElementById("equip-finish-btn")?.addEventListener("click", () => {
    router.navigate("onboarding/frequency");
  });
}

function wireSubScreen() {
  // Back
  document.getElementById("equip-sub-back")?.addEventListener("click", () => {
    screen       = "facilities";
    openCategory = null;
    rerender();
  });

  // Preset toggle
  document.getElementById("equip-preset-toggle")?.addEventListener("click", e => {
    toggleFacilityPreset(e.currentTarget.dataset.facility);
    rerender();
  });

  // Accordion toggles
  document.querySelectorAll("[data-cat-toggle]").forEach(btn => {
    btn.addEventListener("click", () => {
      const catId  = btn.dataset.catToggle;
      openCategory = openCategory === catId ? null : catId;
      rerender();
    });
  });

  // Equipment chip toggles
  document.querySelectorAll(".equip-item-chip[data-equipment]").forEach(chip => {
    chip.addEventListener("click", () => {
      const id      = chip.dataset.equipment;
      const scope   = chip.dataset.scope;
      const current = getEquipmentForScope(scope);
      const updated = current.includes(id)
        ? current.filter(x => x !== id)
        : [...current, id];
      saveEquipmentForScope(scope, updated);
      rerender();
    });
  });

  // Done
  document.getElementById("equip-sub-done-btn")?.addEventListener("click", () => {
    screen       = "facilities";
    openCategory = null;
    rerender();
  });
}

function rerender() {
  const main = document.getElementById("main-content");
  if (main) {
    main.innerHTML = renderView();
    wireView();
  }
}
