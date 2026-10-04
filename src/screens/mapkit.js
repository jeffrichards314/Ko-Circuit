// Shared pieces of the world map and the halls (spec §19 G4): the belt icon of a cleared place, and the little runner that walks the paths.
// (Walking and the graph of paths are src/world/walk.js; the landmarks are drawn by the screens.)
import { c32 } from '../engine/palette.js';
import { BELTS } from '../scene/belts.js';
import { jogFrames } from '../../data/sprites/jog.js';

// a cleared place's belt: a strap and a gold plate in the circuit's own colours, 15 x 7 px
export function drawBeltIcon(f, id, x, y) {
  const B = BELTS[id] || BELTS.rookie, u = (a) => c32(a[0], a[1], a[2]);
  f.rect(x - 8, y - 1, 16, 5, c32(1, 1, 2));
  f.rect(x - 7, y, 14, 3, u(B.strap[1])); f.rect(x - 7, y, 14, 1, u(B.strap[0]));
  f.rect(x - 3, y - 2, 7, 7, c32(1, 1, 2)); f.rect(x - 2, y - 1, 5, 5, u(B.plate[1])); f.rect(x - 2, y - 1, 5, 1, u(B.plate[0])); f.rect(x - 2, y + 3, 5, 1, u(B.plate[2]));
  f.px(x, y + 1, c32(28, 5, 8));
}

// the runner that walks the road: the player's jogging frames drawn at half size
const runners = new Map();
export function mapRunner(profile) {
  const key = JSON.stringify(profile);
  if (!runners.has(key)) runners.set(key, jogFrames(profile));
  return runners.get(key);
}
export function drawRunner(f, profile, x, y, t, moving, flip) {
  const R = mapRunner(profile), i = moving ? Math.floor(t / 6) % 4 : 1;
  f.blit(R.frames[i], Math.round(x), Math.round(y) + (moving && (Math.floor(t / 6) & 1) ? 0 : -1), R.pal, { flip: !!flip, scale: 0.5 });
}
