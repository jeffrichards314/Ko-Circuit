// Every landmark by id (spec §19 G4). `zone` says which map it belongs to.
import { BASE_LANDMARKS } from './base.js';
import { PANTHEON_LANDMARKS } from './pantheon.js';
import { UNDERWORLD_LANDMARKS } from './underworld.js';
import { VOID_LANDMARKS } from './void.js';
import { WORLD_LANDMARKS } from '../../world/landmarks.js';

export const LANDMARKS = {};
for (const [zone, set] of [['base', BASE_LANDMARKS], ['pantheon', PANTHEON_LANDMARKS], ['underworld', UNDERWORLD_LANDMARKS], ['void', VOID_LANDMARKS], ['world', WORLD_LANDMARKS]]) for (const [id, L] of Object.entries(set)) LANDMARKS[id] = { ...L, zone };
