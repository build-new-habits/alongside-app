/**
 * about.js - Onboarding Step 3: Age band, gender, hormonal tracking
 *
 * v1.1 — Age band chips replace numeric age input (store v1.6).
 *   Eight bands: under-18 through 65+, plus prefer-not-to-say.
 *   Numeric age field removed — no DOB collected, no stale data.
 *   Privacy benefit: age band is less identifying than exact age.
 */

import { store } from "../../store.js";

export const centered = false;

const AGE_BANDS = [
  { id: "under-18",   label: "Under 18"        },
  { id: "18-24",      label: "18 - 24"          },
  { id: "25-34",      label: "25 - 34"          },
  { id: "35-44",      label: "35 - 44"          },
  { id: "45-54",      label: "45 - 54"          },
  { id: "55-64",      label: "55 - 64"          },
  { id: "65+",        label: "65 and over"      },
  { id: "prefer-not", label: "Prefer not to say"}
];

const GENDER_OPTIONS = [
  { id: "female",     label: "Female"            },
  { id: "male",       label: "Male"              },
  { id: "non-binary", label: "Non-binary"        },
  { id: "prefer-not", label: "Prefer not to say" }
];

export function render() {
  const name             = store.get("name")             || "";
  const ageBand          = store.get("ageBand");
  const gender           = store.get("gender");
  const hormonalTracking = store.get("hormonalTracking");
  const showHormonalOption = ["female", "non-binary"].includes(gender);

  return `
    <div class="onboarding-view">
      <div class="onboarding-header">
        <button class="btn btn-ghost" onclick="router.navigate('onboarding/name')"
                aria-label="Back to name step">Back</button>
        <div class="progress-dots" aria-label="Step 2 of 7">
          <span class="dot completed" aria-hidden="true"></span>
          <span class="dot active"    aria-hidden="true"></span>
          <span class="dot"           aria-hidden="true"></span>
          <span class="dot"           aria-hidden="true"></span>
          <span class="dot"           aria-hidden="true"></span>
          <span class="dot"           aria-hidden="true"></span>
          <span class="dot"           aria-hidden="true"></span>
        </div>
      </div>

      <div class="onboarding-content">
        <h1>A bit about you${name ? ", " + name : ""}</h1>
        <p class="text-secondary">This helps me personalise your experience.</p>

        <!-- Age band -->
        <div class="form-section">
          <label class="form-label" id="age-band-label">Your age group</label>
          <div class="chip-group" role="group" aria-labelledby="age-band-label">
            ${AGE_BANDS.map(band => `
              <button
                class="chip ${ageBand === band.id ? "selected" : ""}"
                onclick="setAgeBand('${band.id}')"
                aria-pressed="${ageBand === band.id}"
              >${band.label}</button>
            `).join("")}
          </div>
        </div>

        <!-- Gender -->
        <div class="form-section">
          <label class="form-label" id="gender-label">Gender</label>
          <div class="chip-group" role="group" aria-labelledby="gender-label">
            ${GENDER_OPTIONS.map(opt => `
              <button
                class="chip ${gender === opt.id ? "selected" : ""}"
                onclick="setGender('${opt.id}')"
                aria-pressed="${gender === opt.id}"
              >${opt.label}</button>
            `).join("")}
          </div>
        </div>

        <!-- Hormonal tracking -->
        <div id="hormonal-option" class="form-section ${showHormonalOption ? "" : "hidden"}">
          <label class="form-label">Would you like cycle-aware recommendations?</label>
          <p class="text-sm text-secondary" style="margin-bottom: var(--space-3);">
            This helps me adapt sessions to your energy patterns throughout the month.
          </p>
          <div class="chip-group" role="group" aria-label="Cycle-aware recommendations">
            <button
              class="chip ${hormonalTracking === true  ? "selected" : ""}"
              onclick="setHormonalTracking(true)"
              aria-pressed="${hormonalTracking === true}"
            >Yes, that would help</button>
            <button
              class="chip ${hormonalTracking === false ? "selected" : ""}"
              onclick="setHormonalTracking(false)"
              aria-pressed="${hormonalTracking === false}"
            >No thanks</button>
          </div>
        </div>
      </div>

      <div class="onboarding-actions">
        <button class="btn btn-primary btn-large btn-full" onclick="saveAbout()">
          Continue
        </button>
      </div>
    </div>
  `;
}

window.setAgeBand = function(bandId) {
  store.set("ageBand", bandId);
  document.querySelectorAll("[onclick^='setAgeBand']").forEach(btn => {
    const isSelected = btn.getAttribute("onclick") === "setAgeBand('" + bandId + "')";
    btn.classList.toggle("selected", isSelected);
    btn.setAttribute("aria-pressed", isSelected);
  });
};

window.setGender = function(genderId) {
  store.set("gender", genderId);
  router.navigate("onboarding/about");
};

window.setHormonalTracking = function(value) {
  store.set("hormonalTracking", value);
  document.querySelectorAll("#hormonal-option .chip").forEach(btn => {
    btn.classList.remove("selected");
    btn.setAttribute("aria-pressed", "false");
  });
  event.target.classList.add("selected");
  event.target.setAttribute("aria-pressed", "true");
};

window.saveAbout = function() {
  router.navigate("onboarding/body");
};
