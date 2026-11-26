/**
 * js/data/in-step-version.js
 * 26 Nov 2026 v1
 *
 * P-42 S2. Which In Step programme this phone gets, by its age version
 * (age-version.js): the adults' five parts, or the young four parts at
 * 14-15 or 16-17 (in-step-young.js). Imported once, by in-step-offer.js;
 * it sets the programme the In Step helpers read (setProgrammeSource).
 */
import { setProgrammeSource, PARTS, EPISODES } from "./in-step-programme.js";
import { youngProgramme } from "./in-step-young.js";
import { inStepVersion } from "./age-version.js";

const ADULT = { parts: PARTS, episodes: EPISODES };

export function programmeFor(version = inStepVersion()) {
  if (version === "young-14") return youngProgramme("14");
  if (version === "young-16") return youngProgramme("16");
  return ADULT;
}

setProgrammeSource(() => programmeFor());
