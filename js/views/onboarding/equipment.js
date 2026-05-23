/**
 * equipment.js - Onboarding Step 8: Equipment selection
 *
 * 22 May 2026 v1 (S4-3):
 *   Rebuilt to match Settings > Equipment exactly.
 *   Two-level flow: facility cards -> sub-screen with chips.
 *   Facilities: Full gym / Swimming pool / Fitness studio / Home setup / Bodyweight only.
 *   Sub-screen shows equipment chips for that facility, togglable.
 *   Preset toggle available for gym/pool/studio.
 *   Back from sub-screen returns to facility list (not previous onboarding step).
 *   Back from facility list returns to onboarding/lifestyle.
 *   "Finish setup" writes equipment and navigates to onboarding/complete.
 *   Same FACILITY_DEFS and chip pattern as settings.js for consistent UX.
 */

import { store }             from "../../store.js";
import { EQUIPMENT_CATEGORIES } from "../../data/equipment.js";

export const centered = false;

// ---- Facility definitions (matches settings.js exactly) --------------------

const FACILITY_DEFS = [
  {
    id: "gym-full", label: "Full gym", icon: "&#127947;", scope: "gym",
    description: "Fully-equipped gym -- weights, machines, cardio",
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
    description: "Pool access -- lane swimming, aqua fitness",
    equipment: ["swimming-pool"]
  },
  {
    id: "fitness-studio", label: "Fitness studio", icon: "&#127973;", scope: "gym",
    description: "Studio classes -- yoga, pilates, spin, circuits",
    equipment: ["fitness-studio","yoga-mat","band-light","band-medium","step-platform"]
  },
  {
    id: "home", label: "Home setup", icon: "&#127968;", scope: "home",
    description: "What you have at home",
    equipment: []
  },
  {
    id: "no-equipment", label: "Bodyweight only", icon: "&#128694;", scope: "home",
    description: "No equipment -- floor space is enough",
    equipment: []
  },
];

// ---- State ------------------------------------------------------------------

let screen = "facilities"; // "facilities" | facility-id string

// ---- Equipment helpers (same logic as settings.js) -------------------------

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

// ---- Render -----------------------------------------------------------------

export function render() {
  screen = "facilities";
  return renderView();
}

function renderView() {
  if (screen !== "facilities") return renderSubScreen(screen);
  return renderFacilities();
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
        <h1>What equipment do you have?</h1>
        <div class="onboarding-coach-line">
          <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
          <p class="onboarding-coach-text">
            Tell me what you have available and I'll build around it.
            A clear floor is enough. If you have more, great -- I'll use it.
            But I'll never assume you have things you don't.
          </p>
        </div>

        <!-- Gym and facilities -->
        <h3 style="font-size:var(--text-xs);letter-spacing:0.08em;font-weight:var(--font-semibold);
                   color:var(--color-primary);text-transform:uppercase;
                   margin:var(--space-5) 0 var(--space-3);">
          At the gym or facility
        </h3>
        <div class="equipment-facility-grid">
          ${gymFacilities.map(f => {
            const active = isFacilityActive(f);
            return `
              <button class="equipment-facility-card ${active ? "equipment-facility-card--active" : ""}"
                      data-facility="${f.id}"
                      aria-label="${f.label}: ${f.description}. ${active ? "Active" : "Tap to add"}">
                <span class="equipment-facility-icon" aria-hidden="true">${f.icon}</span>
                <span class="equipment-facility-label">${f.label}</span>
                ${active ? `<span class="equipment-facility-check" aria-hidden="true">&#10003;</span>` : ""}
              </button>
            `;
          }).join("")}
        </div>

        <!-- Home -->
        <h3 style="font-size:var(--text-xs);letter-spacing:0.08em;font-weight:var(--font-semibold);
                   color:var(--color-primary);text-transform:uppercase;
                   margin:var(--space-5) 0 var(--space-3);">
          At home
        </h3>
        <div class="equipment-facility-grid">
          ${homeFacilities.map(f => {
            const homeItems = store.get("homeEquipment") || [];
            const active    = f.id !== "no-equipment" && homeItems.length > 0;
            return `
              <button class="equipment-facility-card ${active ? "equipment-facility-card--active" : ""}"
                      data-facility="${f.id}"
                      aria-label="${f.label}: ${f.description}">
                <span class="equipment-facility-icon" aria-hidden="true">${f.icon}</span>
                <span class="equipment-facility-label">${f.label}</span>
                ${active ? `<span class="equipment-facility-check" aria-hidden="true">&#10003;</span>` : ""}
              </button>
            `;
          }).join("")}
        </div>

        <p class="text-xs text-muted" style="margin-top:var(--space-3);">
          Tap any location to see and choose the equipment available there.
        </p>

        <div class="bodyweight-note" style="margin-top:var(--space-4);">
          <p class="text-sm text-muted">
            &#128161; No equipment? No problem. Bodyweight exercises are powerful and effective.
          </p>
        </div>
      </div>

      <div class="onboarding-actions">
        <button class="btn btn-primary btn-large btn-full" id="equip-finish-btn">
          ${total > 0 ? "Finish setup" : "Continue with bodyweight only"}
        </button>
        <p class="text-sm text-secondary text-center" style="margin-top:var(--space-3);">
          ${total > 0 ? total + " items selected" : ""}
        </p>
      </div>
    </div>
  `;
}

function renderSubScreen(facilityId) {
  const facility = FACILITY_DEFS.find(f => f.id === facilityId);
  if (!facility) { screen = "facilities"; return renderFacilities(); }

  const currentItems = getEquipmentForScope(facility.scope);
  const isPreset     = facility.equipment.length > 0;
  const presetActive = isPreset && facility.equipment.some(eq => currentItems.includes(eq));

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

        <p class="text-sm text-secondary" style="margin-bottom:var(--space-4);">
          ${facility.description}
        </p>

        ${isPreset ? `
          <div class="card" style="margin-bottom:var(--space-4);padding:var(--space-4);">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div>
                <p style="font-size:var(--text-sm);font-weight:var(--font-semibold);margin:0 0 2px;">
                  Use ${facility.label} preset
                </p>
                <p class="text-xs text-muted" style="margin:0;">
                  Auto-fills ${facility.equipment.length} items
                </p>
              </div>
              <button class="btn ${presetActive ? "btn-secondary" : "btn-primary"} btn-sm"
                      id="equip-preset-toggle"
                      data-facility="${facility.id}"
                      aria-pressed="${presetActive}">
                ${presetActive ? "Remove preset" : "Add preset"}
              </button>
            </div>
          </div>
        ` : ""}

        ${EQUIPMENT_CATEGORIES.map(cat => {
          const catItems = cat.items.filter(item =>
            facility.scope === "home" ||
            facility.equipment.includes(item.id) ||
            currentItems.includes(item.id)
          );
          if (catItems.length === 0) return "";
          const catCount = catItems.filter(item => currentItems.includes(item.id)).length;
          return `
            <div class="equipment-settings-category">
              <div class="equipment-category-heading">
                <span>${cat.icon} ${cat.name}</span>
                ${catCount > 0 ? `<span class="equipment-cat-count">${catCount} selected</span>` : ""}
              </div>
              <div class="equipment-chip-grid">
                ${catItems.map(item => `
                  <button class="equipment-chip ${currentItems.includes(item.id) ? "selected" : ""}"
                          data-equipment="${item.id}"
                          data-scope="${facility.scope}"
                          aria-pressed="${currentItems.includes(item.id)}">
                    ${item.name}
                  </button>
                `).join("")}
              </div>
            </div>
          `;
        }).join("")}

        ${facility.scope === "home" && currentItems.length === 0 ? `
          <div class="card" style="text-align:center;padding:var(--space-6);">
            <p class="text-secondary">No home equipment yet. Tap items above to add them.</p>
            <p class="text-sm text-muted" style="margin-top:var(--space-2);">
              A clear floor is enough. I will never assume you have something you have not told me about.
            </p>
          </div>
        ` : ""}

      </div>

      <div class="onboarding-actions">
        <button class="btn btn-primary btn-large btn-full" id="equip-sub-done-btn">
          Done
        </button>
      </div>
    </div>
  `;
}

// ---- Mount ------------------------------------------------------------------

export function onMount() {
  wireView();
}

function wireView() {
  if (screen === "facilities") {
    wireFacilities();
  } else {
    wireSubScreen();
  }
}

function wireFacilities() {
  // Back to lifestyle
  document.getElementById("equip-onboard-back")?.addEventListener("click", () => {
    router.navigate("onboarding/lifestyle");
  });

  // Facility card tap -- open sub-screen
  document.querySelectorAll(".equipment-facility-card[data-facility]").forEach(btn => {
    btn.addEventListener("click", () => {
      screen = btn.dataset.facility;
      rerender();
    });
  });

  // Finish setup
  document.getElementById("equip-finish-btn")?.addEventListener("click", () => {
    store.completeOnboarding();
    router.navigate("onboarding/complete");
  });
}

function wireSubScreen() {
  // Back to facility list
  document.getElementById("equip-sub-back")?.addEventListener("click", () => {
    screen = "facilities";
    rerender();
  });

  // Preset toggle
  document.getElementById("equip-preset-toggle")?.addEventListener("click", e => {
    toggleFacilityPreset(e.currentTarget.dataset.facility);
    rerender();
  });

  // Equipment chip toggle
  document.querySelectorAll(".equipment-chip[data-equipment]").forEach(chip => {
    chip.addEventListener("click", () => {
      const id      = chip.dataset.equipment;
      const scope   = chip.dataset.scope;
      const current = getEquipmentForScope(scope);
      const updated = current.includes(id)
        ? current.filter(x => x !== id)
        : [...current, id];
      saveEquipmentForScope(scope, updated);
      chip.classList.toggle("selected", updated.includes(id));
      chip.setAttribute("aria-pressed", updated.includes(id));
      // Update category count
      const catEl   = chip.closest(".equipment-settings-category");
      const countEl = catEl?.querySelector(".equipment-cat-count");
      if (countEl) {
        const n = Array.from(catEl.querySelectorAll(".equipment-chip.selected")).length;
        countEl.textContent = n > 0 ? n + " selected" : "";
      }
    });
  });

  // Done -- return to facility list
  document.getElementById("equip-sub-done-btn")?.addEventListener("click", () => {
    screen = "facilities";
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
