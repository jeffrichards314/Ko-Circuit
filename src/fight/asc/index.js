// The Ascension's gimmicks (spec §18 A6): one file per zone, merged for the executor (Phase B: the Pantheon, Phase C: the Underworld).
import { STARFIELD_MODIFIERS } from './starfield.js';
import { FORGE_MODIFIERS } from './forge.js';
import { MIRROR_MODIFIERS } from './mirror.js';
import { SUMMIT_MODIFIERS } from './summit.js';
import { HALCYON_MODIFIERS } from './halcyon.js';
import { UNDERWORLD_MODIFIERS } from './underworld.js';
import { ABYSS_MODIFIERS } from './abyss.js';
import { VOID_MODIFIERS } from './void.js';

export const PHASE_B_MODIFIERS = { ...STARFIELD_MODIFIERS, ...FORGE_MODIFIERS, ...MIRROR_MODIFIERS, ...SUMMIT_MODIFIERS, ...HALCYON_MODIFIERS, ...UNDERWORLD_MODIFIERS, ...ABYSS_MODIFIERS, ...VOID_MODIFIERS };
