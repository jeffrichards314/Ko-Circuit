// The Pantheon's sprite layers and palettes (spec §18): one entry per fighter.
import oro, { palettes as oroPalettes } from './oro.js';
import lark, { palettes as larkPalettes } from './lark.js';
import ember, { palettes as emberPalettes } from './ember.js';
import aurora, { palettes as auroraPalettes } from './aurora.js';
import zephyr, { palettes as zephyrPalettes } from './zephyr.js';
import nimbus, { palettes as nimbusPalettes } from './nimbus.js';
import ulla, { palettes as ullaPalettes } from './ulla.js';
import cirrus, { palettes as cirrusPalettes } from './cirrus.js';
import tom, { palettes as tomPalettes } from './tom.js';
import jules, { palettes as julesPalettes } from './jules.js';
import reuben, { palettes as reubenPalettes } from './reuben.js';
import simone, { palettes as simonePalettes } from './simone.js';
import oldguard, { palettes as oldguardPalettes } from './oldguard.js';
import polaris, { palettes as polarisPalettes } from './polaris.js';
import kira, { palettes as kiraPalettes } from './kira.js';
import orbit, { palettes as orbitPalettes } from './orbit.js';
import nebula, { palettes as nebulaPalettes } from './nebula.js';
import anvil, { palettes as anvilPalettes } from './anvil.js';
import spark, { palettes as sparkPalettes } from './spark.js';
import bellows, { palettes as bellowsPalettes } from './bellows.js';
import hale, { palettes as halePalettes } from './hale.js';
import { REFLECTION_LAYERS, palettes as reflectionPalettes } from './reflection.js';
import glass, { palettes as glassPalettes } from './glass.js';
import doubt, { palettes as doubtPalettes } from './doubt.js';
import prism, { palettes as prismPalettes } from './prism.js';
import aldric, { palettes as aldricPalettes } from './aldric.js';
import valkyr, { palettes as valkyrPalettes } from './valkyr.js';
import scribe, { palettes as scribePalettes } from './scribe.js';
import verity, { palettes as verityPalettes } from './verity.js';
import rho, { palettes as rhoPalettes } from './rho.js';
import barney2 from './barney2.js';
import halcyon, { palettes as halcyonPalettes } from './halcyon.js';

export const PANTHEON_LAYERS = { oro, lark, ember, aurora, zephyr, nimbus, ulla, cirrus, tom, jules, reuben, simone, oldguard, polaris, kira, orbit, nebula, anvil, spark, bellows, hale, ...REFLECTION_LAYERS, glass, doubt, prism, aldric, valkyr, scribe, verity, rho, barney2, halcyon };
export const PANTHEON_PALETTES = {
  ...oroPalettes, ...larkPalettes, ...emberPalettes, ...auroraPalettes, ...zephyrPalettes, ...nimbusPalettes, ...ullaPalettes, ...cirrusPalettes,
  ...tomPalettes, ...julesPalettes, ...reubenPalettes, ...simonePalettes, ...oldguardPalettes,
  ...polarisPalettes, ...kiraPalettes, ...orbitPalettes, ...nebulaPalettes,
  ...anvilPalettes, ...sparkPalettes, ...bellowsPalettes, ...halePalettes,
  ...reflectionPalettes, ...glassPalettes, ...doubtPalettes, ...prismPalettes,
  ...aldricPalettes, ...valkyrPalettes, ...scribePalettes, ...verityPalettes, ...rhoPalettes, ...halcyonPalettes,
};
