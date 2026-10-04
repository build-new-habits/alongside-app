/**
 * js/data/figures/index.js
 * 04 Oct 2026 v1
 *
 * D-4 FIGURES. Every batch of figures, merged into one lookup by exercise
 * id. A batch is added here and nowhere else; js/figures.js reads FIGURES.
 * tools/verify-figures.mjs checks every entry: a real exercise id, frames
 * with a caption and a description, every point inside its frame, and
 * every exercise in the library drawn.
 *
 * Batch 01 is the sixteen Graeme approved on the canvas; 02-13 follow the
 * exercise library's own files (gym; strength; rehabilitation; sport
 * conditioning; seated; mobility; recovery and pilates; yoga and
 * mindfulness; running, swimming and cycling; cardio).
 */
import { FIGURES_01 } from "./batch-01.js";
import { FIGURES_02 } from "./batch-02.js";
import { FIGURES_03 } from "./batch-03.js";
import { FIGURES_04 } from "./batch-04.js";
import { FIGURES_05 } from "./batch-05.js";
import { FIGURES_06 } from "./batch-06.js";
import { FIGURES_07 } from "./batch-07.js";
import { FIGURES_08 } from "./batch-08.js";
import { FIGURES_09 } from "./batch-09.js";
import { FIGURES_10 } from "./batch-10.js";
import { FIGURES_11 } from "./batch-11.js";
import { FIGURES_12 } from "./batch-12.js";
import { FIGURES_13 } from "./batch-13.js";

export const FIGURE_BATCHES = Object.freeze([
  FIGURES_01, FIGURES_02, FIGURES_03, FIGURES_04, FIGURES_05, FIGURES_06, FIGURES_07,
  FIGURES_08, FIGURES_09, FIGURES_10, FIGURES_11, FIGURES_12, FIGURES_13,
]);

export const FIGURES = Object.freeze(Object.assign({}, ...FIGURE_BATCHES));
