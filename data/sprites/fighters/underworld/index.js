// The Underworld's sprite layers and palettes (spec §18): one entry per fighter.
import grue, { palettes as gruePalettes } from './grue.js';
import mae, { palettes as maePalettes } from './mae.js';
import toll, { palettes as tollPalettes } from './toll.js';
import moros, { palettes as morosPalettes } from './moros.js';
import cinder, { palettes as cinderPalettes } from './cinder.js';
import scorch, { palettes as scorchPalettes } from './scorch.js';
import kiln, { palettes as kilnPalettes } from './kiln.js';
import soot, { palettes as sootPalettes } from './soot.js';
import shackle, { palettes as shacklePalettes } from './shackle.js';
import link, { palettes as linkPalettes } from './link.js';
import brisk, { palettes as briskPalettes } from './brisk.js';
import rattle, { palettes as rattlePalettes } from './rattle.js';
import jailer, { palettes as jailerPalettes } from './jailer.js';
// Phase D: the Hall of the Fallen wears the champions' own layers (fallen.js: palettes only), then the Furnace, the Abyss Gate, Vorgath
import { palettes as fallenPalettes } from './fallen.js';
import stoker, { palettes as stokerPalettes } from './stoker.js';
import brand, { palettes as brandPalettes } from './brand.js';
import slag, { palettes as slagPalettes } from './slag.js';
import crucible, { palettes as cruciblePalettes } from './crucible.js';
import nox, { palettes as noxPalettes } from './nox.js';
import umbra, { palettes as umbraPalettes } from './umbra.js';
import lament, { palettes as lamentPalettes } from './lament.js';
import grasp, { palettes as graspPalettes } from './grasp.js';
import herald, { palettes as heraldPalettes } from './herald.js';
import vorgath, { palettes as vorgathPalettes } from './vorgath.js';

export const UNDERWORLD_LAYERS = { grue, mae, toll, moros, cinder, scorch, kiln, soot, shackle, link, brisk, rattle, jailer, stoker, brand, slag, crucible, nox, umbra, lament, grasp, herald, vorgath };
export const UNDERWORLD_PALETTES = { ...gruePalettes, ...maePalettes, ...tollPalettes, ...morosPalettes, ...cinderPalettes, ...scorchPalettes, ...kilnPalettes, ...sootPalettes, ...shacklePalettes, ...linkPalettes, ...briskPalettes, ...rattlePalettes, ...jailerPalettes,
  ...fallenPalettes, ...stokerPalettes, ...brandPalettes, ...slagPalettes, ...cruciblePalettes, ...noxPalettes, ...umbraPalettes, ...lamentPalettes, ...graspPalettes, ...heraldPalettes, ...vorgathPalettes };
