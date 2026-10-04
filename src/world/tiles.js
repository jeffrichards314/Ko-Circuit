// The world map's art (spec §19 G4): 16x16 ground tiles and the scenery that stands on them, all drawn in code.
// Nothing here is a copy of anything: every tile is made from a few ramps of four 15-bit colours (highlight, base, shade, deep shade)
// and deterministic noise, in the flat stepped-shading style of the rest of the game (§2): no gradients, no blending.
//
//   KINDS          ground kinds: what each one is made of (its ramp, its texture, the ramp of the cliff under it)
//   groundImg      one tile: (kind, edge mask, variant, frame); the mask says which neighbours are not land (N=1, E=2, S=4, W=8)
//   decoImg        one piece of scenery by name and frame; DECO says its size and where it stands
import { c32 } from '../engine/palette.js';
import { makeImg, hash2, vnoise } from './img.js';

const R = (a) => a.map((c) => c32(c[0], c[1], c[2]));
// ramps: [highlight, base, shade, deep shade]
export const RAMP = {
  gr: R([[14, 28, 10], [8, 22, 8], [5, 16, 6], [3, 11, 4]]),
  gd: R([[9, 20, 10], [5, 14, 7], [3, 10, 5], [2, 7, 4]]),
  sd: R([[31, 29, 19], [29, 25, 14], [24, 19, 9], [18, 13, 6]]),
  ds: R([[30, 24, 12], [27, 19, 8], [21, 14, 5], [15, 9, 3]]),
  sn: R([[31, 31, 31], [27, 29, 31], [21, 25, 30], [14, 18, 27]]),
  rk: R([[22, 21, 23], [16, 15, 18], [11, 10, 13], [6, 6, 9]]),
  ct: R([[18, 19, 23], [13, 14, 18], [9, 10, 13], [5, 5, 8]]),
  pz: R([[31, 30, 26], [27, 25, 21], [21, 19, 16], [14, 12, 11]]),
  cl: R([[26, 19, 11], [21, 14, 8], [14, 9, 5], [8, 5, 3]]),
  wd: R([[25, 17, 9], [19, 12, 6], [13, 8, 4], [8, 5, 2]]),
  sea: R([[11, 22, 31], [6, 14, 27], [4, 10, 22], [2, 6, 16]]),
  sky: R([[21, 28, 31], [14, 22, 31], [10, 17, 29], [6, 12, 25]]),
  ash: R([[15, 11, 13], [9, 6, 8], [5, 3, 5], [2, 1, 3]]),
  lv: R([[31, 26, 8], [29, 14, 3], [21, 6, 2], [12, 2, 1]]),
  vd: R([[31, 31, 31], [14, 14, 18], [6, 6, 9], [1, 1, 3]]),
  nm: R([[20, 12, 24], [14, 8, 19], [9, 5, 13], [4, 2, 8]]),
  wt: R([[31, 31, 31], [26, 29, 31], [20, 24, 30], [12, 16, 24]]),
  fd: R([[29, 26, 10], [24, 20, 7], [18, 13, 5], [12, 8, 3]]),
  cw: R([[31, 31, 31], [28, 29, 31], [23, 25, 30], [17, 19, 27]]),   // cloud floor
  mb: R([[31, 31, 30], [28, 27, 26], [22, 21, 22], [15, 14, 17]]),   // marble
  go: R([[31, 29, 14], [29, 23, 6], [22, 15, 3], [14, 9, 2]]),       // gold
  cv: R([[12, 9, 11], [8, 6, 8], [5, 3, 5], [2, 1, 3]]),             // cave rock
  bs: R([[18, 11, 10], [12, 7, 7], [8, 4, 5], [4, 2, 3]]),           // basalt (warm dark)
  sx: R([[10, 22, 20], [4, 13, 13], [2, 8, 9], [1, 4, 5]]),          // the Styx
  vf: R([[22, 22, 26], [4, 4, 7], [2, 2, 4], [0, 0, 1]]),            // void floor
  rf: R([[27, 10, 31], [14, 4, 22], [8, 2, 14], [3, 1, 7]]),         // a rift
  wn: R([[16, 14, 24], [10, 8, 17], [6, 5, 11], [3, 2, 6]]),         // warped night stone
};
const YEL = c32(31, 28, 9); // the one warm light of the map (windows, lamps, flower hearts)
const INK = c32(2, 2, 4), WHITE = c32(31, 31, 31), FOAM0 = c32(27, 31, 31);
const SKY_BANDS = [[c32(31, 29, 18), c32(31, 31, 26), c32(29, 25, 13)], [c32(24, 29, 31), c32(29, 31, 31), c32(18, 24, 30)], [c32(14, 22, 31), c32(21, 28, 31), c32(9, 16, 28)], [c32(31, 22, 20), c32(31, 28, 24), c32(27, 16, 18)]];

// Ground kinds. `water` and `air` kinds are not land (they get cliffs and shores drawn on their neighbours); `cliff` is the ramp of the
// wall under a land tile whose south neighbour is not land; `tex` picks the texture.
export const KINDS = {
  sea: { id: 0, water: true, ramp: 'sea' },
  sky: { id: 1, air: true, ramp: 'sky' },
  void: { id: 2, air: true, ramp: 'vd' },
  grass: { id: 3, land: true, ramp: 'gr', cliff: 'cl', tex: 'tuft' },
  meadow: { id: 4, land: true, ramp: 'gr', cliff: 'cl', tex: 'flower' },
  forest: { id: 5, land: true, ramp: 'gd', cliff: 'cl', tex: 'tuft' },
  sand: { id: 6, land: true, ramp: 'sd', cliff: 'ds', tex: 'speck', low: true },
  desert: { id: 7, land: true, ramp: 'ds', cliff: 'cl', tex: 'dune' },
  snow: { id: 8, land: true, ramp: 'sn', cliff: 'rk', tex: 'snow' },
  rock: { id: 9, land: true, ramp: 'rk', cliff: 'cl', tex: 'rock' },
  city: { id: 10, land: true, ramp: 'ct', cliff: 'rk', tex: 'asphalt' },
  plaza: { id: 11, land: true, ramp: 'pz', cliff: 'cl', tex: 'paving' },
  dock: { id: 12, land: true, ramp: 'wd', cliff: 'wd', tex: 'planks', low: true },
  ash: { id: 13, land: true, ramp: 'ash', cliff: 'ash', tex: 'ash' },
  lava: { id: 14, land: true, ramp: 'lv', cliff: 'ash', tex: 'lava', glow: true },
  shard: { id: 15, land: true, ramp: 'vd', cliff: 'vd', tex: 'shard' },
  night: { id: 16, land: true, ramp: 'nm', cliff: 'ash', tex: 'night' },
  marsh: { id: 17, land: true, ramp: 'gd', cliff: 'cl', tex: 'tuft' },
  road: { id: 18, land: true, ramp: 'ct', cliff: 'rk', tex: 'road' },
  stoneFloor: { id: 19, land: true, ramp: 'rk', cliff: 'rk', tex: 'paving' },
  field: { id: 20, land: true, ramp: 'fd', cliff: 'cl', tex: 'rows' },
  cobble: { id: 21, land: true, ramp: 'pz', cliff: 'cl', tex: 'cobble' },
  // the other worlds (spec §19 G11). `z` is height: where land meets lower land a cliff face is drawn, so a world can have terraces,
  // walls and pits without being an island in a sea
  cloud: { id: 22, land: true, ramp: 'cw', cliff: 'cw', tex: 'puff', z: 0 },
  marble: { id: 23, land: true, ramp: 'mb', cliff: 'go', tex: 'marbleTiles', z: 1 },
  gold: { id: 24, land: true, ramp: 'go', cliff: 'mb', tex: 'paving', z: 2 },
  cloudsea: { id: 25, air: true, ramp: 'sky', tex: 'deep' },
  cavewall: { id: 26, land: true, ramp: 'cv', cliff: 'cv', tex: 'cavetop', z: 2 },
  basalt: { id: 27, land: true, ramp: 'bs', cliff: 'cv', tex: 'rock', z: 1 },
  lavaflow: { id: 28, water: true, ramp: 'lv', foam: c32(31, 28, 10), glow: true },
  styx: { id: 29, water: true, ramp: 'sx', foam: c32(18, 29, 24) },
  voidfloor: { id: 30, land: true, ramp: 'vf', cliff: 'vd', tex: 'grid' },
  rift: { id: 31, air: true, ramp: 'rf', tex: 'swirl' },
  warp: { id: 32, land: true, ramp: 'wn', cliff: 'rf', tex: 'cracks' },
  warpHigh: { id: 33, land: true, ramp: 'wn', cliff: 'rf', tex: 'rock', z: 1 },
  champHigh: { id: 34, land: true, ramp: 'pz', cliff: 'rk', tex: 'paving', z: 1 },
  park: { id: 35, land: true, ramp: 'gr', cliff: 'rk', tex: 'tuft' },
  pit: { id: 36, air: true, ramp: 'cv', tex: 'pit' },
};
export const KIND_BY_ID = []; for (const [n, k] of Object.entries(KINDS)) { k.name = n; k.z = k.z || 0; KIND_BY_ID[k.id] = k; }
export const isLand = (id) => !!(KIND_BY_ID[id] && KIND_BY_ID[id].land);

const cache = new Map();
const memo = (key, make) => { let v = cache.get(key); if (!v) { v = make(); cache.set(key, v); } return v; };

// ------------------------------------------------------------------------------------------------------------------ ground textures
function texture(f, K, ramp, vx, vy) {
  const [hi, base, dk, dd] = ramp;
  const n = (x, y, s = 0) => hash2(x + vx * 16, y + vy * 16, s);
  switch (K.tex) {
    case 'tuft':
      for (let i = 0; i < 7; i++) { const x = (n(i, 1) * 14 | 0) + 1, y = (n(i, 2) * 12 | 0) + 1; f.px(x, y, hi); f.px(x + 1, y, hi); f.px(x, y + 1, dk); }
      for (let i = 0; i < 4; i++) { const x = (n(i, 3) * 15 | 0), y = (n(i, 4) * 14 | 0) + 1; f.px(x, y, dk); }
      break;
    case 'flower':
      for (let i = 0; i < 5; i++) { const x = (n(i, 1) * 14 | 0) + 1, y = (n(i, 2) * 12 | 0) + 1; f.px(x, y, hi); f.px(x, y + 1, dk); }
      for (let i = 0; i < 3; i++) { const x = (n(i, 5) * 13 | 0) + 1, y = (n(i, 6) * 12 | 0) + 1, c = [c32(31, 31, 27), c32(31, 14, 20), YEL][(n(i, 7) * 3) | 0]; f.px(x, y, c); f.px(x + 1, y, c); f.px(x, y - 1, YEL); }
      break;
    case 'speck':
      for (let i = 0; i < 9; i++) { const x = (n(i, 1) * 15 | 0), y = (n(i, 2) * 15 | 0); f.px(x, y, i & 1 ? hi : dk); }
      break;
    case 'dune':
      for (let i = 0; i < 3; i++) { const y = 2 + i * 5 + (n(i, 1) * 2 | 0), x0 = (n(i, 2) * 6 | 0); f.rect(x0, y, 9, 1, dk); f.rect(x0 + 2, y - 1, 6, 1, hi); }
      break;
    case 'snow':
      for (let i = 0; i < 6; i++) { const x = (n(i, 1) * 14 | 0) + 1, y = (n(i, 2) * 13 | 0) + 1; f.px(x, y, dk); f.px(x + 1, y + 1, hi); }
      break;
    case 'rock':
      for (let i = 0; i < 5; i++) { const x = (n(i, 1) * 11 | 0) + 1, y = (n(i, 2) * 11 | 0) + 1; f.rect(x, y, 3, 2, dk); f.rect(x, y, 3, 1, hi); f.px(x + 3, y + 1, dd); }
      break;
    case 'asphalt':
      for (let i = 0; i < 8; i++) { const x = (n(i, 1) * 15 | 0), y = (n(i, 2) * 15 | 0); f.px(x, y, i & 1 ? dk : hi); }
      break;
    case 'road':
      f.rect(0, 7, 16, 2, dk); for (let x = 1; x < 16; x += 6) f.rect(x, 7, 3, 1, c32(28, 25, 8));
      break;
    case 'paving':
      f.rect(0, 0, 16, 1, dk); f.rect(0, 8, 16, 1, dk); f.rect(0, 0, 1, 8, dk); f.rect(8, 8, 1, 8, dk);
      f.rect(1, 1, 7, 1, hi); f.rect(9, 9, 7, 1, hi);
      break;
    case 'planks':
      for (let y = 0; y < 16; y += 4) { f.rect(0, y + 3, 16, 1, dk); f.rect(0, y, 16, 1, hi); const x = ((n(y, 1) * 12) | 0) + 2; f.rect(x, y + 1, 1, 2, dd); }
      break;
    case 'ash':
      for (let i = 0; i < 8; i++) { const x = (n(i, 1) * 15 | 0), y = (n(i, 2) * 15 | 0); f.px(x, y, i & 1 ? hi : dd); }
      break;
    case 'lava':
      for (let i = 0; i < 3; i++) { const x = (n(i, 1) * 10 | 0) + 1, y = (n(i, 2) * 10 | 0) + 2; f.rect(x, y, 4, 2, hi); f.rect(x + 1, y + 2, 3, 1, dk); }
      break;
    case 'shard':
      for (let i = 0; i < 4; i++) { const x = (n(i, 1) * 13 | 0) + 1, y = (n(i, 2) * 13 | 0) + 1; f.px(x, y, hi); }
      f.frameRect(0, 0, 16, 16, dk);
      break;
    case 'rows':
      for (let y = 1; y < 16; y += 4) { f.rect(0, y, 16, 1, dk); f.rect(0, y + 1, 16, 1, hi); for (let x = (y >> 2) & 1; x < 16; x += 3) f.px(x, y - 1 < 0 ? 0 : y - 1, c32(10, 20, 6)); }
      break;
    case 'cobble':
      for (let y = 0; y < 16; y += 4) for (let x = (y >> 2) & 1 ? 2 : 0; x < 16; x += 5) { f.rect(x, y, 4, 3, hi); f.rect(x, y + 2, 4, 1, dk); f.px(x + 3, y, dk); }
      break;
    case 'puff':
      for (let i = 0; i < 3; i++) { const x = (n(i, 1) * 11 | 0) + 1, y = (n(i, 2) * 11 | 0) + 2; f.rect(x, y, 5, 2, hi); f.rect(x + 1, y + 2, 4, 1, dk); }
      break;
    case 'marbleTiles':
      f.rect(0, 0, 16, 1, dk); f.rect(0, 0, 1, 16, dk); f.rect(1, 1, 15, 1, hi); f.rect(1, 1, 1, 15, hi);
      for (let i = 0; i < 2; i++) { const x = (n(i, 1) * 10 | 0) + 3, y = (n(i, 2) * 10 | 0) + 3; f.rect(x, y, 3, 1, dk); f.px(x + 3, y + 1, dk); }
      break;
    case 'cavetop':
      for (let i = 0; i < 6; i++) { const x = (n(i, 1) * 13 | 0) + 1, y = (n(i, 2) * 13 | 0) + 1; f.rect(x, y, 2, 2, i & 1 ? hi : dd); }
      break;
    case 'grid':
      f.rect(0, 15, 16, 1, dk); f.rect(15, 0, 1, 16, dk); if (n(0, 3) > 0.8) f.rect(0, 15, 16, 1, hi);
      if (n(1, 4) > 0.85) { f.rect((n(2, 5) * 12) | 0, (n(3, 6) * 12) | 0, 3, 1, hi); }
      break;
    case 'cracks':
      for (let i = 0; i < 2; i++) { let x = (n(i, 1) * 12 | 0) + 2, y = (n(i, 2) * 6 | 0) + 2; for (let k = 0; k < 6; k++) { f.px(x, y, dd); x += n(i, k + 3) > 0.5 ? 1 : 0; y += 1; } }
      for (let i = 0; i < 3; i++) f.px((n(i, 9) * 15) | 0, (n(i, 10) * 15) | 0, hi);
      break;
    case 'night':
      for (let i = 0; i < 6; i++) { const x = (n(i, 1) * 14 | 0) + 1, y = (n(i, 2) * 13 | 0) + 1; f.px(x, y, hi); f.px(x + 1, y + 1, dd); }
      break;
    default: break;
  }
}

// one ground tile. mask: which of N=1 E=2 S=4 W=8 neighbours are not land (land tiles) or ARE land (water tiles). v: 0-3 variant. frame: water animation 0-3.
// up: for a water tile under land, the ramp of that land's cliff (the wall runs on down into the water, as tall cliffs do), or null
export function groundImg(kindId, mask = 0, v = 0, frame = 0, up = null) {
  const K = KIND_BY_ID[kindId];
  return memo(`g${kindId}.${mask}.${v}.${K.water ? frame : 0}.${up || ''}`, () => makeImg(16, 16, (f) => (K.water ? seaTile(f, K, mask, v, frame, up) : K.air ? airTile(f, K, v, mask, frame, up) : landTile(f, K, mask, v, frame, up))));
}

// the lower half of a cliff face coming down onto this tile from the tile above (a plateau's wall over lower ground, water or air)
function cliffFoot(f, up, v, frame, shadow) {
  const [chi, cb, cdk, cdd] = RAMP[up];
  f.rect(0, 0, 16, 7, cb);
  for (let x = 1; x < 16; x += 4) { const o = (hash2(x, v, 3) * 3 | 0); f.rect(x + o, 0, 1, 5, cdk); }
  for (let x = 3; x < 16; x += 5) f.px(x, 2 + (hash2(x, v, 6) * 2 | 0), chi);
  f.rect(0, 5, 16, 2, cdd);
  if (shadow) f.rect(0, 7, 16, 2, shadow);
}
function landTile(f, K, mask, v, frame, up) {
  const ramp = RAMP[K.ramp], [hi, base, dk, dd] = ramp, cramp = RAMP[K.cliff], vx = v & 1, vy = v >> 1;
  f.rect(0, 0, 16, 16, base);
  texture(f, K, ramp, vx, vy);
  if (up) { cliffFoot(f, up, v, frame, dk); mask &= ~1; }
  if (K.glow) { const p = (frame >> 1) & 1; for (let i = 0; i < 3; i++) { const x = (hash2(i, v, 9) * 11 | 0) + 1, y = (hash2(i, v, 10) * 10 | 0) + 2; f.rect(x, y, 4, 2, p ? hi : base); } }
  const cliff = mask & 4;
  const top = cliff ? 10 : 16; // the ground part; the wall below it
  // lips where the ground ends: a bright rim on the north, dark rims on the sides
  if (mask & 1) { f.rect(0, 0, 16, 1, dd); f.rect(0, 1, 16, 1, hi); }
  if (mask & 2) { f.rect(15, 0, 1, top, dd); f.rect(14, 1, 1, top - 1, dk); }
  if (mask & 8) { f.rect(0, 0, 1, top, dd); f.rect(1, 1, 1, top - 1, dk); }
  if (cliff) {
    const [chi, cb, cdk, cdd] = cramp;
    f.rect(0, 9, 16, 1, dk);
    f.rect(0, 10, 16, 6, cb);
    f.rect(0, 10, 16, 1, chi);
    for (let x = 1; x < 16; x += 4) { const o = (hash2(x, v, 3) * 3 | 0); f.rect(x + o, 11, 1, 4, cdk); }
    for (let x = 2; x < 16; x += 5) f.px(x, 12 + (hash2(x, v, 4) * 2 | 0), chi);
    f.rect(0, 15, 16, 1, cdd);
    if (mask & 2) f.rect(15, 10, 1, 6, cdd);
    if (mask & 8) f.rect(0, 10, 1, 6, cdd);
  } else if (mask & 4) f.rect(0, 15, 16, 1, dd);
}

function seaTile(f, K, mask, v, frame, up) {
  // mask: which neighbours are land (N=1 E=2 S=4 W=8)
  const [hi, base, dk, dd] = RAMP[K.ramp || 'sea'], FOAM = K.foam || FOAM0;
  f.rect(0, 0, 16, 16, base);
  let top = 0;
  // waves: short highlights that slide with the frame, each row its own phase
  for (let r = 0; r < 4; r++) {
    const y = 2 + r * 4 + ((hash2(r, v, 1) * 2) | 0), x0 = (((hash2(r, v, 2) * 16) | 0) + frame * 2 * (r & 1 ? 1 : -1) + 32) % 16;
    f.rect(x0 % 16, y, 4, 1, hi);
    if (x0 + 4 > 16) f.rect(0, y, x0 + 4 - 16, 1, hi);
    f.px((x0 + 6) % 16, y + 1, dk);
  }
  if ((mask & 1) && up) {
    // the lower half of the cliff above: striped rock down to a line of foam, then its shadow on the water
    const [chi, cb, cdk, cdd] = RAMP[up];
    f.rect(0, 0, 16, 7, cb);
    for (let x = 1; x < 16; x += 4) { const o = (hash2(x, v, 3) * 3 | 0); f.rect(x + o, 0, 1, 5, cdk); }
    for (let x = 3; x < 16; x += 5) f.px(x, 2 + (hash2(x, v, 6) * 2 | 0), chi);
    f.rect(0, 5, 16, 2, cdd);
    f.rect(0, 7, 16, 1, (frame & 1) ? FOAM : hi); f.rect(0, 8, 16, 2, dd); f.rect(0, 10, 16, 1, dk);
    top = 7;
  } else if (mask & 1) { f.rect(0, 0, 16, 4, dk); f.rect(0, 0, 16, 2, dd); }                 // the shadow of the cliff above
  if (mask & 4) { f.rect(0, 14, 16, 1, (frame & 1) ? FOAM : hi); f.rect(0, 15, 16, 1, FOAM); }
  if (mask & 2) { f.rect(14, top, 2, 16 - top, (frame & 1) ? hi : FOAM); }
  if (mask & 8) { f.rect(0, top, 2, 16 - top, (frame & 1) ? hi : FOAM); }
}

function airTile(f, K, v, mask, frame, up) {
  const [hi, base, dk, dd] = RAMP[K.ramp];
  f.rect(0, 0, 16, 16, K.ramp === 'vd' ? dd : base);
  if (K.tex === 'deep') {
    // the open sky under the cloud floor: blue depth with wisps drifting past far below
    f.rect(0, 0, 16, 16, dk);
    for (let i = 0; i < 2; i++) { const y = (hash2(i, v, 5) * 12 | 0) + 2, x = ((hash2(i, v, 4) * 16 | 0) + frame * (i ? 1 : 2)) % 16; f.rect(x, y, 6, 1, base); f.rect((x + 2) % 16, y + 1, 4, 1, hi); if (x > 10) f.rect(0, y, x - 10, 1, base); }
    f.px((hash2(3, v, 6) * 15) | 0, (hash2(4, v, 7) * 15) | 0, hi);
  } else if (K.tex === 'pit') {
    // a pit: black depth, a few embers drifting up out of it
    f.rect(0, 0, 16, 16, dd);
    for (let i = 0; i < 2; i++) { const x = (hash2(i, v, 4) * 14 | 0) + 1, y = (((hash2(i, v, 5) * 16) | 0) - frame * 3 + 32) % 16; f.px(x, y, i ? c32(31, 18, 4) : c32(29, 8, 3)); }
    if (v & 1) f.rect((hash2(7, v, 7) * 12) | 0, (hash2(8, v, 8) * 12) | 0, 3, 1, dk);
  } else if (K.tex === 'swirl') {
    // a rift: purple nothing that turns slowly, a few specks of light
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 + frame * 0.35 + v * 1.3, r = 2 + i * 1.3, x = 8 + Math.round(Math.cos(a) * r), y = 8 + Math.round(Math.sin(a) * r); f.rect(x, y, 3, 1, i & 1 ? dk : hi); }
    f.px((hash2(5, v, 8) * 15) | 0, (hash2(6, v, 9) * 15) | 0, c32(31, 31, 31));
  } else if (K.ramp === 'sky') {
    // the sky in four bands (v): gold at the very top, then pale, blue, and a dawn glow near the mountain; each with a few soft puffs
    const B = SKY_BANDS[v & 3];
    f.rect(0, 0, 16, 16, B[0]);
    for (let i = 0; i < 2; i++) { const x = (hash2(i, v, 4) * 9 | 0), y = (hash2(i, v, 5) * 11 | 0) + 2; f.rect(x, y, 6, 2, B[1]); f.rect(x + 1, y - 1, 4, 1, B[1]); f.rect(x + 1, y + 2, 4, 1, B[2]); }
  } else {
    // the void: a faint grid and a few stars
    for (let i = 0; i < 3; i++) { const x = (hash2(i, v, 6) * 15 | 0), y = (hash2(i, v, 7) * 15 | 0); f.px(x, y, ((frame >> 2) + i) & 1 ? WHITE : dk); }
    if (!(v & 1)) f.rect(0, 15, 16, 1, base);
  }
  if ((mask & 1) && up) cliffFoot(f, up, v, frame, dd);
}

// ------------------------------------------------------------------------------------------------------------------ scenery
// name -> { w, h, frames, ax, ay (the anchor: the point that stands at the tile's bottom centre) }
export const DECO = {
  tree: { w: 18, h: 24, frames: 2 }, pine: { w: 14, h: 26, frames: 2 }, palm: { w: 20, h: 26, frames: 2 }, deadTree: { w: 16, h: 24, frames: 1 },
  bush: { w: 12, h: 9, frames: 1 }, rock: { w: 13, h: 10, frames: 1 }, boulder: { w: 18, h: 14, frames: 1 }, flowers: { w: 10, h: 6, frames: 1 },
  peak: { w: 34, h: 34, frames: 1 }, snowpeak: { w: 36, h: 40, frames: 1 }, hill: { w: 30, h: 16, frames: 1 },
  house: { w: 18, h: 18, frames: 1 }, house2: { w: 18, h: 18, frames: 1 }, shop: { w: 20, h: 20, frames: 1 }, barn: { w: 22, h: 18, frames: 1 },
  tower1: { w: 16, h: 34, frames: 4 }, tower2: { w: 16, h: 42, frames: 4 }, tower3: { w: 18, h: 28, frames: 4 }, lamp: { w: 7, h: 18, frames: 2 },
  cactus: { w: 12, h: 20, frames: 1 }, column: { w: 10, h: 22, frames: 1 }, brokenColumn: { w: 10, h: 12, frames: 1 }, arch: { w: 26, h: 26, frames: 1 },
  stalagmite: { w: 12, h: 22, frames: 1 }, bones: { w: 14, h: 8, frames: 1 }, chain: { w: 10, h: 20, frames: 1 }, brazier: { w: 10, h: 16, frames: 4 },
  shardDeco: { w: 12, h: 20, frames: 4 }, slab: { w: 40, h: 16, frames: 1, on: 'any' }, sailboat: { w: 16, h: 18, frames: 4, on: 'water' }, buoy: { w: 8, h: 10, frames: 4, on: 'water' },
  pier: { w: 16, h: 8, frames: 1 }, tent: { w: 22, h: 22, frames: 2 }, flag: { w: 10, h: 16, frames: 4 }, crate: { w: 10, h: 9, frames: 1 },
  ruinWall: { w: 18, h: 12, frames: 1 }, cloudPuff: { w: 30, h: 14, frames: 1, on: 'any' }, fence: { w: 16, h: 8, frames: 1 }, hut: { w: 16, h: 14, frames: 1 },
  ring: { w: 26, h: 18, frames: 1 }, spotlight: { w: 10, h: 18, frames: 4 }, neon: { w: 14, h: 18, frames: 4 },
  hillTall: { w: 16, h: 40, frames: 1 }, dome: { w: 34, h: 24, frames: 1 }, treeClump: { w: 30, h: 30, frames: 2 }, bushRow: { w: 28, h: 11, frames: 1 },
  windmill: { w: 24, h: 34, frames: 4 }, lighthouse: { w: 14, h: 40, frames: 4 }, fountain: { w: 22, h: 16, frames: 4 }, sign: { w: 12, h: 14, frames: 1 },
  crane: { w: 28, h: 38, frames: 1 }, haystack: { w: 12, h: 10, frames: 1 }, stoneWall: { w: 16, h: 8, frames: 1 }, statue: { w: 12, h: 26, frames: 1 },
  billboard: { w: 26, h: 24, frames: 2 }, mesa: { w: 36, h: 26, frames: 1 }, ferris: { w: 32, h: 36, frames: 4 },
  towerBroken: { w: 20, h: 36, frames: 4 }, obelisk: { w: 12, h: 30, frames: 4 }, temple: { w: 34, h: 30, frames: 1 }, goldBrazier: { w: 12, h: 18, frames: 4 },
  skullPile: { w: 16, h: 10, frames: 1 }, cage: { w: 14, h: 26, frames: 2 }, boneArch: { w: 32, h: 28, frames: 1 }, cube: { w: 12, h: 16, frames: 4 },
  doorframe: { w: 14, h: 26, frames: 1 }, hollowStatue: { w: 10, h: 30, frames: 1 },
  bleachers: { w: 32, h: 18, frames: 2 }, landingPad: { w: 44, h: 22, frames: 2 }, windsock: { w: 14, h: 24, frames: 4 }, hedge: { w: 16, h: 10, frames: 1 }, seaRock: { w: 16, h: 10, frames: 4, on: 'water' }, campfire: { w: 12, h: 12, frames: 4 }, cabin: { w: 20, h: 18, frames: 1 }, well: { w: 12, h: 14, frames: 1 }, trophy: { w: 14, h: 24, frames: 4 }, bannerPole: { w: 10, h: 28, frames: 4 }, cloudBank: { w: 40, h: 20, frames: 1, on: 'any' }, rainbow: { w: 40, h: 22, frames: 1, on: 'any' }, pineClump: { w: 28, h: 32, frames: 2 }, cave: { w: 26, h: 18, frames: 1 },
};
const DC = {
  trunk: c32(14, 8, 4), trunkHi: c32(20, 12, 6), trunkDk: c32(8, 4, 2),
  leaf: RAMP.gr, leafD: RAMP.gd,
  roofR: [c32(27, 8, 8), c32(20, 4, 6), c32(12, 2, 4)], roofB: [c32(10, 14, 28), c32(6, 9, 21), c32(3, 5, 14)], roofG: [c32(10, 22, 12), c32(6, 15, 8), c32(3, 9, 5)],
  wall: [c32(31, 29, 23), c32(26, 23, 17), c32(19, 16, 12)], wallS: [c32(28, 25, 28), c32(22, 19, 24), c32(15, 12, 17)],
  glass: [c32(20, 27, 31), c32(9, 16, 26), c32(5, 9, 18)], lit: YEL, door: c32(12, 7, 4),
};

const disc = (f, cx, cy, r, col) => { for (let y = -r; y <= r; y++) { const w = Math.round(Math.sqrt(Math.max(0, r * r - y * y))); f.rect(cx - w, cy + y, w * 2 + 1, 1, col); } };
const ell = (f, cx, cy, rx, ry, col) => { for (let y = -ry; y <= ry; y++) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry)))); f.rect(cx - w, cy + y, w * 2 + 1, 1, col); } };
const tri = (f, cx, top, base, w, col) => { for (let y = top; y <= base; y++) { const hw = Math.round(((y - top) / (base - top)) * w); f.rect(cx - hw, y, hw * 2 + 1, 1, col); } };

// Scenery shares the ground's colours: every colour a piece draws is snapped to the nearest of the ramps above or a short list of accents,
// so a screen of the map stays near the arena rule (§2: 4 palettes of 15) however much scenery it holds.
const ACCENTS = [INK, WHITE, YEL, c32(28, 6, 7), c32(14, 3, 4), c32(6, 12, 26), c32(3, 5, 14), c32(31, 6, 20), c32(6, 26, 31), c32(31, 12, 18), c32(14, 8, 4), c32(8, 4, 2)];
let SNAP = null;
const rgb = (v) => [v & 255, (v >> 8) & 255, (v >> 16) & 255];
function snap(v) {
  if (!SNAP) { SNAP = new Map(); SNAP.pal = [...new Set([...Object.values(RAMP).flat(), ...ACCENTS])].map((c) => [c, rgb(c)]); for (const [c] of SNAP.pal) SNAP.set(c, c); }
  let out = SNAP.get(v);
  if (out === undefined) {
    const [r, g, b] = rgb(v); let bd = Infinity;
    for (const [c, [R, G, B]] of SNAP.pal) { const d = (r - R) ** 2 * 3 + (g - G) ** 2 * 4 + (b - B) ** 2 * 2; if (d < bd) { bd = d; out = c; } }
    SNAP.set(v, out);
  }
  return out;
}
export function decoImg(name, frame = 0, v = 0) {
  const D = DECO[name];
  if (!D) return null;
  const fr = D.frames > 1 ? frame % D.frames : 0;
  return memo(`d.${name}.${fr}.${v}`, () => { const img = makeImg(D.w, D.h, (f) => DRAW[name](f, D.w, D.h, fr, v)); for (let i = 0; i < img.buf.length; i++) if (img.buf[i]) img.buf[i] = snap(img.buf[i]); return img; });
}

const DRAW = {
  tree(f, w, h, fr) {
    const cx = 9, sw = fr ? 1 : 0, [hi, b, dk, dd] = DC.leaf;
    f.rect(cx - 1, 16, 3, 8, DC.trunk); f.rect(cx - 1, 16, 1, 8, DC.trunkHi); f.rect(cx + 1, 16, 1, 8, DC.trunkDk);
    ell(f, cx + sw, 10, 8, 9, dd); ell(f, cx + sw, 9, 7, 8, dk); ell(f, cx + sw - 1, 8, 6, 7, b);
    ell(f, cx + sw - 2, 5, 3, 3, hi); f.px(cx + sw + 2, 11, dd); f.px(cx + sw - 3, 12, dk); f.px(cx + sw + 1, 7, dk);
  },
  pine(f, w, h, fr) {
    const cx = 7, sw = fr ? 1 : 0, [hi, b, dk, dd] = DC.leafD;
    f.rect(cx - 1, 21, 3, 5, DC.trunk);
    for (let i = 0; i < 3; i++) { const t = 1 + i * 6, bs = t + 9; tri(f, cx + (i === 1 ? sw : 0), t, bs, 6 + i, dd); tri(f, cx + (i === 1 ? sw : 0), t + 1, bs - 1, 5 + i, b); f.rect(cx - 2 - i + (i === 1 ? sw : 0), bs - 2, 2, 1, hi); }
  },
  palm(f, w, h, fr) {
    const sw = fr ? 1 : 0, [hi, b, dk, dd] = DC.leaf;
    for (let i = 0; i < 12; i++) f.rect(8 + Math.round(i * 0.3), 25 - i * 1.4 | 0, 3, 2, i % 2 ? DC.trunk : DC.trunkHi);
    const tx = 12, ty = 10;
    for (const [dx, dy] of [[-8, 2], [-6, -2], [0, -4], [6, -2], [8, 2], [-4, 4], [5, 4]]) {
      for (let k = 0; k <= 6; k++) { const x = tx + Math.round(dx * k / 6) + (k > 3 ? sw : 0), y = ty + Math.round(dy * k / 6) + (k > 3 ? 1 : 0); f.rect(x, y, 3, 2, k > 4 ? dk : b); f.px(x + 1, y - 1, hi); }
    }
    disc(f, tx + 1, ty + 2, 2, DC.trunkDk);
  },
  deadTree(f) {
    const d = c32(10, 7, 9), h = c32(16, 12, 14);
    f.rect(7, 10, 3, 14, d); f.rect(7, 10, 1, 14, h);
    for (const [x, y, dx, dy] of [[8, 14, -5, -4], [9, 11, 5, -5], [8, 8, -3, -5], [9, 17, 4, -3]]) { for (let k = 0; k < 6; k++) f.rect(x + Math.round(dx * k / 5), y + Math.round(dy * k / 5), 2, 2, d); }
  },
  bush(f) { const [hi, b, dk, dd] = DC.leaf; ell(f, 6, 5, 6, 4, dd); ell(f, 6, 4, 5, 4, b); ell(f, 4, 3, 2, 2, hi); f.px(8, 5, dk); f.px(9, 4, c32(31, 12, 14)); },
  rock(f) { const [hi, b, dk, dd] = RAMP.rk; ell(f, 6, 6, 6, 4, dd); ell(f, 6, 5, 5, 4, b); ell(f, 4, 3, 3, 2, hi); f.rect(8, 6, 3, 2, dk); },
  boulder(f) { const [hi, b, dk, dd] = RAMP.rk; ell(f, 9, 8, 9, 6, dd); ell(f, 9, 7, 8, 6, b); ell(f, 6, 4, 4, 2, hi); f.rect(11, 9, 4, 3, dk); },
  flowers(f) { for (const [x, y, c] of [[2, 3, c32(31, 12, 18)], [5, 2, YEL], [8, 4, c32(31, 31, 27)], [4, 5, c32(31, 12, 18)]]) { f.px(x, y, c); f.px(x, y + 1, DC.leaf[2]); } },
  peak(f) {
    const [hi, b, dk, dd] = RAMP.rk;
    tri(f, 17, 2, 33, 16, dd); tri(f, 17, 3, 32, 14, b);
    for (let y = 3; y < 32; y++) { const hw = Math.round(((y - 3) / 29) * 14); f.rect(17 + (hw >> 1), y, hw - (hw >> 1) + 1, 1, dk); }
    for (let y = 3; y < 18; y += 2) { const hw = Math.round(((y - 3) / 29) * 14); f.px(17 - hw + 1, y, hi); f.rect(17 - hw + 2, y + 1, 3, 1, hi); }
    f.rect(14, 18, 5, 1, dd); f.rect(18, 24, 6, 1, dd);
    // a cap of snow on the top third
    for (let y = 3; y < 13; y++) { const hw = Math.round(((y - 3) / 29) * 14); f.rect(17 - hw + 1, y, hw * 2 - 1, 1, RAMP.sn[1]); f.rect(17 - hw + 1, y, Math.max(1, hw - 1), 1, RAMP.sn[0]); }
  },
  snowpeak(f) {
    const [hi, b, dk, dd] = RAMP.sn, r = RAMP.rk;
    tri(f, 18, 1, 39, 17, r[3]); tri(f, 18, 2, 38, 15, r[1]);
    for (let y = 2; y < 38; y++) { const hw = Math.round(((y - 2) / 36) * 15); f.rect(18 + (hw >> 1), y, hw - (hw >> 1) + 1, 1, r[2]); }
    for (let y = 2; y < 22; y++) { const hw = Math.round(((y - 2) / 36) * 15) + (y > 14 ? (y % 3) : 0); f.rect(18 - hw, y, hw * 2 + 1, 1, b); f.rect(18 - hw, y, Math.max(1, hw), 1, hi); f.rect(18 + (hw >> 1), y, hw - (hw >> 1) + 1, 1, dk); }
    for (let x = 6; x < 31; x += 4) f.px(x, 22 + ((x >> 2) & 1), dk);
  },
  hill(f) { const [hi, b, dk, dd] = RAMP.gr; ell(f, 15, 14, 14, 10, dd); ell(f, 15, 13, 13, 10, b); ell(f, 11, 9, 6, 3, hi); f.rect(18, 12, 6, 3, dk); },
  house(f, w, h, fr, v) {
    const roof = [DC.roofR, DC.roofB][v % 2], [wl, wb, wd] = DC.wall;
    f.rect(2, 8, 14, 10, wd); f.rect(3, 8, 12, 9, wb); f.rect(3, 8, 12, 1, wl);
    for (let i = 0; i < 8; i++) { f.rect(1 + i, 8 - i, 16 - i * 2, 1, i & 1 ? roof[1] : roof[0]); if (i > 4) break; }
    tri(f, 9, 1, 8, 9, roof[1]); tri(f, 9, 2, 8, 7, roof[0]); f.rect(0, 8, 18, 1, roof[2]);
    f.rect(4, 11, 3, 3, DC.glass[1]); f.px(4, 11, DC.glass[0]); f.rect(11, 12, 3, 6, DC.door); f.rect(12, 15, 1, 1, DC.lit);
    f.rect(13, 1, 2, 5, wd); f.rect(13, 0, 3, 1, roof[2]);
  },
  house2(f, w, h, fr, v) {
    const roof = [DC.roofB, DC.roofR][v % 2], [wl, wb, wd] = DC.wall;
    f.rect(2, 7, 14, 11, wd); f.rect(3, 7, 12, 10, wb); f.rect(3, 7, 12, 1, wl);
    f.rect(1, 6, 16, 2, roof[1]); f.rect(1, 6, 16, 1, roof[0]); f.rect(3, 3, 12, 3, roof[1]); f.rect(5, 1, 8, 2, roof[0]); f.rect(1, 8, 16, 1, roof[2]);
    f.rect(4, 10, 3, 3, DC.glass[1]); f.rect(11, 10, 3, 3, DC.glass[1]); f.rect(8, 13, 3, 5, DC.door);
  },
  shop(f, w, h, fr, v) {
    const aw = [c32(28, 6, 7), c32(6, 12, 26)][v % 2];
    f.rect(1, 6, 18, 14, DC.wall[2]); f.rect(2, 6, 16, 13, DC.wall[1]); f.rect(2, 6, 16, 1, DC.wall[0]);
    f.rect(0, 4, 20, 3, INK); for (let x = 1; x < 19; x += 4) { f.rect(x, 5, 2, 2, aw); f.rect(x + 2, 5, 2, 2, WHITE); }
    f.rect(3, 10, 6, 5, DC.glass[1]); f.rect(3, 10, 6, 1, DC.glass[0]); f.rect(12, 10, 4, 9, DC.door); f.rect(1, 0, 18, 4, DC.wallS[1]); f.rect(1, 0, 18, 1, DC.wallS[0]);
  },
  barn(f) {
    f.rect(1, 6, 20, 12, c32(21, 5, 5)); f.rect(1, 6, 20, 1, c32(28, 9, 8)); tri(f, 11, 0, 7, 11, c32(14, 3, 4)); tri(f, 11, 1, 7, 10, c32(21, 5, 5));
    f.rect(7, 10, 8, 8, c32(28, 27, 22)); f.rect(7, 10, 8, 1, c32(14, 3, 4)); f.line && 0; for (let i = 0; i < 8; i++) { f.px(7 + i, 10 + i, c32(14, 3, 4)); f.px(14 - i, 10 + i, c32(14, 3, 4)); }
  },
  tower1: (f, w, h, fr, v) => tower(f, w, h, fr, v, 0), tower2: (f, w, h, fr, v) => tower(f, w, h, fr, v, 1), tower3: (f, w, h, fr, v) => tower(f, w, h, fr, v, 2),
  lamp(f, w, h, fr) { f.rect(3, 4, 1, 14, RAMP.rk[2]); f.rect(1, 2, 5, 3, RAMP.rk[1]); f.rect(2, 3, 3, 2, fr ? YEL : YEL); f.rect(0, 17, 7, 1, RAMP.rk[3]); },
  cactus(f) { const [hi, b, dk] = RAMP.gr; f.rect(4, 4, 4, 16, b); f.rect(4, 4, 1, 16, hi); f.rect(7, 4, 1, 16, dk); f.rect(0, 9, 4, 3, b); f.rect(0, 6, 2, 4, b); f.rect(8, 7, 4, 3, b); f.rect(10, 4, 2, 4, b); f.rect(4, 3, 4, 1, hi); },
  column(f) { const [hi, b, dk, dd] = RAMP.pz; f.rect(1, 0, 8, 3, hi); f.rect(1, 3, 8, 1, dk); f.rect(2, 4, 6, 15, b); f.rect(2, 4, 2, 15, hi); f.rect(6, 4, 2, 15, dk); f.rect(0, 19, 10, 3, b); f.rect(0, 21, 10, 1, dd); },
  brokenColumn(f) { const [hi, b, dk, dd] = RAMP.pz; f.rect(2, 4, 6, 7, b); f.rect(2, 4, 2, 7, hi); f.rect(6, 4, 2, 7, dk); f.rect(2, 2, 3, 2, b); f.rect(0, 10, 10, 2, dk); f.px(6, 3, dd); },
  arch(f) { const [hi, b, dk, dd] = RAMP.pz; f.rect(1, 6, 5, 20, b); f.rect(20, 6, 5, 20, b); f.rect(1, 6, 2, 20, hi); f.rect(23, 6, 2, 20, dk); for (let x = 1; x < 25; x++) { const y = 6 + Math.round(10 - Math.sqrt(Math.max(0, 144 - (x - 13) * (x - 13))) * 0.83); f.rect(x, Math.max(2, y - 4), 1, 6, x < 13 ? b : dk); f.px(x, Math.max(2, y - 4), hi); } f.rect(0, 25, 26, 1, dd); },
  stalagmite(f) { const [hi, b, dk, dd] = RAMP.ash; tri(f, 6, 1, 21, 5, dk); tri(f, 6, 3, 21, 4, c32(13, 9, 12)); f.rect(3, 15, 1, 6, hi); f.rect(8, 10, 1, 9, dd); tri(f, 6, 10, 21, 3, b); },
  bones(f) { const w = c32(28, 26, 22); f.rect(2, 4, 10, 2, w); f.rect(1, 3, 2, 2, w); f.rect(1, 6, 2, 2, w); f.rect(11, 3, 2, 2, w); f.rect(11, 6, 2, 2, w); disc(f, 7, 3, 3, w); f.px(6, 2, INK); f.px(8, 2, INK); },
  chain(f) { const g = c32(17, 17, 20), d = c32(9, 9, 12); for (let y = 0; y < 20; y += 3) { f.rect(3 + ((y / 3) & 1 ? 2 : 0), y, 3, 2, g); f.px(4 + ((y / 3) & 1 ? 2 : 0), y + 1, d); } },
  brazier(f, w, h, fr) { f.rect(1, 9, 8, 2, RAMP.rk[2]); f.rect(2, 11, 6, 4, RAMP.rk[1]); f.rect(4, 15, 2, 1, RAMP.rk[3]); const t = [0, 1, 0, -1][fr]; ell(f, 5, 6, 3 + (t > 0 ? 1 : 0), 4, c32(29, 14, 3)); ell(f, 5, 7, 2, 3, c32(31, 25, 6)); f.px(5, 3 - (fr & 1), YEL); },
  shardDeco(f, w, h, fr) { const y = Math.round(Math.sin(fr * Math.PI / 2) * 1.5); tri(f, 6, 2 + y, 12 + y, 4, RAMP.vd[1]); tri(f, 6, 12 + y, 18 + y, 3, RAMP.vd[2]); f.rect(6, 2 + y, 1, 16, RAMP.vd[0]); f.px(4, 8 + y, WHITE); },
  slab(f) { const [hi, b, dk, dd] = RAMP.pz; f.rect(2, 2, 36, 4, hi); f.rect(1, 5, 38, 5, b); f.rect(2, 10, 36, 3, dk); f.rect(6, 13, 28, 2, dd); f.rect(12, 15, 16, 1, dd); for (let x = 7; x < 34; x += 9) f.rect(x, 6, 1, 4, dk); },
  sailboat(f, w, h, fr) { const b = Math.round(Math.sin(fr * Math.PI / 2)); f.rect(2, 13 + b, 12, 2, c32(18, 11, 5)); f.rect(3, 15 + b, 10, 1, c32(11, 6, 3)); f.rect(8, 2 + b, 1, 11, c32(12, 7, 4)); tri(f, 6, 2 + b, 12 + b, 4, c32(31, 31, 29)); f.rect(9, 4 + b, 4, 8, c32(28, 27, 22)); f.px(9, 1 + b, c32(28, 6, 7)); },
  buoy(f, w, h, fr) { const b = Math.round(Math.sin(fr * Math.PI / 2)); f.rect(2, 4 + b, 4, 4, c32(27, 6, 7)); f.rect(2, 6 + b, 4, 1, WHITE); f.rect(3, 1 + b, 2, 3, RAMP.rk[1]); f.px(3, b, fr & 1 ? c32(31, 28, 6) : RAMP.rk[2]); },
  pier(f) { f.rect(0, 0, 16, 8, RAMP.wd[1]); for (let x = 0; x < 16; x += 4) f.rect(x, 0, 1, 8, RAMP.wd[2]); f.rect(0, 0, 16, 1, RAMP.wd[0]); },
  tent(f, w, h, fr, v) { const c = [c32(28, 6, 7), c32(6, 14, 27), c32(26, 22, 4)][v % 3]; tri(f, 11, 2, 20, 10, WHITE); for (let x = 1; x < 22; x += 4) { const hw = Math.round((x - 11 > 0 ? x - 11 : 11 - x)); f.rect(x, Math.round(2 + (hw / 10) * 0) + 2 + (hw >> 1), 2, 18 - (hw >> 1), c); } f.rect(10, 1, 2, 3, c32(28, 6, 7)); f.rect(12, 1 + (fr & 1), 3, 2, c32(28, 6, 7)); f.rect(9, 14, 4, 6, DC.door); },
  flag(f, w, h, fr) { f.rect(1, 0, 1, 16, RAMP.rk[1]); const o = [0, 1, 0, -1][fr]; for (let i = 0; i < 7; i++) f.rect(2 + i, 1 + (i >> 1) * 0 + Math.round(Math.sin((i + fr * 2) * 0.9) * 1), 1, 5 - (i >> 2), i & 1 ? c32(28, 6, 7) : c32(31, 26, 6)); void o; },
  crate(f) { f.rect(0, 0, 10, 9, RAMP.wd[1]); f.frameRect(0, 0, 10, 9, RAMP.wd[2]); f.rect(1, 1, 8, 1, RAMP.wd[0]); f.px(4, 4, RAMP.wd[2]); f.px(5, 5, RAMP.wd[2]); },
  ruinWall(f) { const [hi, b, dk, dd] = RAMP.pz; f.rect(0, 4, 18, 8, b); f.rect(0, 4, 18, 1, hi); f.rect(2, 1, 4, 3, b); f.rect(11, 2, 5, 2, b); f.rect(0, 11, 18, 1, dd); for (let x = 3; x < 17; x += 5) f.rect(x, 5, 1, 6, dk); },
  cloudPuff(f) { ell(f, 15, 9, 14, 4, c32(24, 26, 31)); ell(f, 15, 8, 13, 4, WHITE); ell(f, 10, 5, 6, 4, WHITE); ell(f, 19, 6, 6, 4, WHITE); f.rect(3, 11, 24, 1, c32(20, 23, 30)); },
  fence(f) { for (let x = 1; x < 16; x += 4) { f.rect(x, 1, 2, 7, RAMP.wd[1]); f.px(x, 1, RAMP.wd[0]); } f.rect(0, 3, 16, 1, RAMP.wd[2]); f.rect(0, 6, 16, 1, RAMP.wd[2]); },
  hut(f) { f.rect(1, 6, 14, 8, c32(14, 9, 7)); f.rect(1, 6, 14, 1, c32(20, 13, 10)); tri(f, 8, 0, 6, 9, c32(10, 7, 6)); f.rect(6, 9, 4, 5, DC.door); },
  ring(f) { f.rect(1, 6, 24, 12, c32(9, 10, 18)); f.rect(3, 4, 20, 10, c32(28, 27, 22)); f.frameRect(3, 4, 20, 10, c32(26, 5, 7)); f.rect(3, 8, 20, 1, c32(26, 5, 7)); f.rect(3, 11, 20, 1, WHITE); for (const x of [3, 22]) f.rect(x, 1, 1, 13, c32(26, 5, 7)); },
  spotlight(f, w, h, fr) { f.rect(3, 12, 4, 6, RAMP.rk[2]); f.rect(2, 10, 6, 3, RAMP.rk[1]); f.rect(4, 0, 2, 11, c32(31, 31, 22)); if (fr & 1) { f.rect(3, 0, 4, 6, c32(31, 31, 26)); } },
  // an old overworld's tall round-topped hill: a pillar of green with a lit side and a shaded side
  hillTall(f, w, h) {
    const [hi, b, dk, dd] = RAMP.gr;
    f.rect(1, 7, 14, h - 7, dd); ell(f, 7, 7, 7, 7, dd); f.rect(2, 7, 12, h - 8, b); ell(f, 7, 7, 6, 6, b);
    f.rect(9, 6, 4, h - 8, dk); f.rect(3, 5, 2, h - 12, hi); f.px(5, 3, hi); f.px(4, 4, hi);
    f.rect(1, h - 1, 14, 1, INK); for (let y = 12; y < h - 3; y += 7) f.rect(10, y, 2, 1, dd);
  },
  dome(f) {
    const [hi, b, dk, dd] = RAMP.gr;
    ell(f, 17, 16, 17, 12, dd); ell(f, 17, 15, 16, 12, b); ell(f, 22, 17, 10, 9, dk); ell(f, 17, 15, 12, 10, b); ell(f, 11, 9, 6, 3, hi); f.rect(8, 11, 4, 1, hi);
    f.rect(1, 23, 32, 1, dd);
  },
  treeClump(f, w, h, fr) {
    const [hi, b, dk, dd] = DC.leafD, sw = fr ? 1 : 0;
    for (const [x, y, r] of [[8, 14, 8], [21, 13, 8], [15, 8, 8], [11, 21, 7], [20, 21, 7]]) { disc(f, x + (y < 12 ? sw : 0), y, r, dd); }
    for (const [x, y, r] of [[8, 13, 7], [21, 12, 7], [15, 7, 7], [11, 20, 6], [20, 20, 6]]) { disc(f, x + (y < 12 ? sw : 0), y, r, b); disc(f, x - 2 + (y < 12 ? sw : 0), y - 2, 3, DC.leaf[1]); f.px(x - 3 + (y < 12 ? sw : 0), y - 4, hi); f.px(x + 3, y + 2, dk); }
    f.rect(13, 26, 3, 4, DC.trunk); f.rect(6, 26, 2, 3, DC.trunkDk); f.rect(22, 26, 2, 3, DC.trunkDk);
  },
  pineClump(f, w, h, fr) {
    const [hi, b, dk, dd] = DC.leafD, sw = fr ? 1 : 0;
    for (const [cx, top, s] of [[7, 6, 6], [20, 4, 7], [14, 0, 7], [10, 12, 6], [20, 13, 6]]) {
      for (let i = 0; i < 2; i++) { const t = top + i * 6, bs = t + 10; tri(f, cx + (i ? sw : 0), t, bs, s - 1 + i, dd); tri(f, cx + (i ? sw : 0), t + 1, bs - 1, s - 2 + i, b); f.rect(cx - s + 2 + i, bs - 2, 2, 1, hi); }
    }
    f.rect(13, 28, 3, 4, DC.trunk);
  },
  bushRow(f) { const [hi, b, dk, dd] = DC.leaf; for (const x of [5, 13, 21]) { ell(f, x, 6, 6, 4, dd); } for (const x of [5, 13, 21]) { ell(f, x, 5, 5, 4, b); ell(f, x - 2, 3, 2, 1, hi); f.px(x + 2, 6, dk); } f.px(12, 3, c32(31, 12, 14)); f.px(22, 4, YEL); },
  windmill(f, w, h, fr) {
    const [wl, wb, wd] = DC.wall;
    tri(f, 12, 10, 33, 8, wd); tri(f, 12, 11, 33, 7, wb); f.rect(5, 12, 3, 20, wl); f.rect(10, 26, 4, 7, DC.door); f.rect(11, 17, 2, 3, DC.glass[1]);
    tri(f, 12, 6, 12, 6, DC.roofR[1]); f.rect(6, 12, 13, 1, DC.roofR[2]);
    const a = (fr * Math.PI) / 8;
    for (let k = 0; k < 4; k++) { const ang = a + (k * Math.PI) / 2; for (let d = 1; d < 11; d++) { const x = Math.round(12 + Math.cos(ang) * d), y = Math.round(10 + Math.sin(ang) * d); f.rect(x, y, 2, 2, d > 3 ? c32(29, 27, 22) : RAMP.wd[2]); } }
    disc(f, 12, 10, 1, RAMP.wd[2]);
  },
  lighthouse(f, w, h, fr) {
    const red = c32(28, 6, 7);
    for (let y = 10; y < 38; y++) { const hw = 3 + Math.round((y - 10) / 9); f.rect(7 - hw, y, hw * 2 + 1, 1, ((y - 10) >> 3) & 1 ? red : WHITE); f.px(7 + hw, y, ((y - 10) >> 3) & 1 ? c32(18, 3, 5) : c32(22, 22, 24)); }
    f.rect(3, 38, 9, 2, RAMP.rk[2]); f.rect(3, 6, 9, 4, INK); f.rect(4, 7, 7, 2, fr & 1 ? YEL : c32(31, 31, 22)); f.rect(4, 3, 7, 3, red); f.px(7, 2, red);
    if (fr === 0) { f.rect(0, 7, 4, 1, YEL); } if (fr === 2) { f.rect(11, 7, 3, 1, YEL); }
    f.rect(6, 30, 3, 8, DC.door);
  },
  fountain(f, w, h, fr) {
    const [hi, b, dk, dd] = RAMP.pz, wtr = RAMP.sea;
    ell(f, 11, 11, 10, 4, dd); ell(f, 11, 10, 10, 4, b); ell(f, 11, 10, 8, 3, wtr[1]); f.rect(4, 9, 6, 1, wtr[0]);
    f.rect(10, 3, 3, 8, b); f.rect(10, 3, 1, 8, hi);
    const up = [0, 1, 2, 1][fr]; f.rect(10, 0 + up, 3, 2, wtr[0]); f.px(7 - up, 3 + up, wtr[0]); f.px(15 + up, 3 + up, wtr[0]); f.px(6 - up, 6, WHITE); f.px(16 + up, 6, WHITE);
    f.rect(1, 13, 20, 1, dd);
  },
  sign(f) { f.rect(5, 6, 2, 8, RAMP.wd[2]); f.rect(0, 1, 12, 7, RAMP.wd[1]); f.rect(0, 1, 12, 1, RAMP.wd[0]); f.frameRect(0, 1, 12, 7, RAMP.wd[3]); f.rect(2, 3, 7, 1, RAMP.wd[3]); f.rect(2, 5, 5, 1, RAMP.wd[3]); f.px(9, 5, RAMP.wd[3]); },
  crane(f) {
    const Y = c32(29, 22, 4), Yd = c32(19, 13, 2);
    for (let y = 6; y < 36; y += 3) { f.rect(4, y, 6, 1, Yd); f.px(4 + ((y / 3) & 1) * 5, y + 1, Yd); }
    f.rect(4, 6, 1, 30, Y); f.rect(9, 6, 1, 30, Y); f.rect(0, 3, 27, 3, Y); f.rect(0, 5, 27, 1, Yd); for (let x = 2; x < 26; x += 4) f.px(x, 4, Yd);
    f.rect(1, 1, 5, 2, RAMP.rk[2]); f.rect(22, 6, 1, 18, RAMP.rk[3]); f.rect(19, 24, 7, 6, c32(6, 12, 24)); f.rect(19, 24, 7, 1, c32(12, 18, 29));
    f.rect(2, 36, 10, 2, RAMP.rk[2]);
  },
  haystack(f) { const a = c32(29, 25, 9), b = c32(22, 17, 5), c = c32(15, 11, 3); ell(f, 6, 6, 6, 4, c); ell(f, 6, 5, 5, 4, a); f.rect(2, 6, 9, 1, b); f.px(3, 3, WHITE); },
  stoneWall(f) { const [hi, b, dk, dd] = RAMP.rk; for (let x = 0; x < 16; x += 4) { f.rect(x, 2, 4, 3, b); f.rect(x, 2, 3, 1, hi); f.rect(x + 2, 5, 4, 3, b); f.rect(x + 2, 5, 3, 1, hi); } f.rect(0, 7, 16, 1, dd); },
  statue(f) { const [hi, b, dk, dd] = RAMP.rk; f.rect(1, 20, 10, 6, dk); f.rect(1, 20, 10, 1, hi); f.rect(3, 9, 6, 11, b); f.rect(3, 9, 2, 11, hi); disc(f, 6, 6, 3, b); f.px(5, 5, hi); f.rect(8, 3, 3, 5, b); f.rect(8, 1, 3, 3, c32(28, 6, 7)); f.rect(0, 25, 12, 1, dd); },
  billboard(f, w, h, fr) {
    f.rect(5, 14, 2, 10, RAMP.rk[2]); f.rect(19, 14, 2, 10, RAMP.rk[2]); f.rect(0, 0, 26, 15, INK); f.rect(1, 1, 24, 13, fr ? c32(28, 6, 7) : c32(6, 12, 26));
    f.rect(3, 3, 8, 9, c32(31, 29, 20)); disc(f, 7, 6, 2, fr ? c32(6, 12, 26) : c32(28, 6, 7)); f.rect(13, 4, 10, 2, WHITE); f.rect(13, 8, 7, 2, YEL);
  },
  mesa(f) {
    const [hi, b, dk, dd] = RAMP.ds, cl = RAMP.cl;
    f.rect(2, 8, 32, 18, cl[1]); f.rect(2, 8, 32, 2, cl[0]); for (let x = 4; x < 32; x += 5) f.rect(x, 11, 1, 13, cl[2]); f.rect(26, 8, 8, 18, cl[2]); f.rect(2, 25, 32, 1, cl[3]);
    f.rect(0, 3, 36, 6, b); f.rect(0, 3, 36, 1, hi); f.rect(4, 5, 8, 1, hi); f.rect(0, 8, 36, 1, dk);
  },
  ferris(f, w, h, fr) {
    const st = RAMP.rk, cx = 16, cy = 15, R = 13, cols = [c32(28, 6, 7), c32(6, 14, 27), c32(29, 24, 4), c32(8, 22, 10)];
    for (let a = 0; a < 64; a++) { const t = (a / 64) * Math.PI * 2; f.px(Math.round(cx + Math.cos(t) * R), Math.round(cy + Math.sin(t) * R), st[1]); }
    for (let k = 0; k < 8; k++) { const t = (k / 8) * Math.PI * 2 + (fr * Math.PI) / 16; for (let d = 1; d < R; d += 2) f.px(Math.round(cx + Math.cos(t) * d), Math.round(cy + Math.sin(t) * d), st[2]); const x = Math.round(cx + Math.cos(t) * R), y = Math.round(cy + Math.sin(t) * R); f.rect(x - 1, y, 3, 3, cols[k & 3]); f.px(x, y, WHITE); }
    for (let y = cy; y < 35; y++) { const d = Math.round((y - cy) * 0.45); f.px(cx - d, y, st[2]); f.px(cx + d, y, st[2]); }
    disc(f, cx, cy, 2, st[0]); f.rect(5, 35, 23, 1, st[3]);
  },
  // ZERO's world: a tower that has cracked and leans, its windows flickering wrong
  towerBroken(f, w, h, fr, v) {
    const W2 = RAMP.wn, lit = [c32(27, 10, 31), c32(6, 26, 31)][v & 1];
    for (let y = 6; y < h; y++) { const lean = Math.round((h - y) * 0.12) * (v & 2 ? -1 : 1), x0 = 4 + lean; f.rect(x0, y, 12, 1, W2[2]); f.rect(x0 + 1, y, 9, 1, W2[1]); f.px(x0 + 1, y, W2[0]); }
    for (let y = 9; y < h - 4; y += 4) for (let x = 6; x < 14; x += 3) { const lean = Math.round((h - y) * 0.12) * (v & 2 ? -1 : 1), on = ((x * 7 + y * 3 + fr * 5) % 9) < 3; f.rect(x + lean, y, 2, 2, on ? lit : W2[3]); }
    // the break: a jagged top and a crack down it
    const lt = Math.round((h - 6) * 0.12) * (v & 2 ? -1 : 1);
    for (let x = 0; x < 12; x += 2) f.rect(4 + lt + x, 4 + ((x * 5) % 4), 2, 3, W2[2]);
    for (let y = 10; y < h - 6; y += 2) f.px(9 + Math.round((h - y) * 0.12) * (v & 2 ? -1 : 1) + ((y >> 1) & 1), y, INK);
    f.rect(3, h - 1, 14, 1, W2[3]);
  },
  obelisk(f, w, h, fr) {
    const d = RAMP.wn, glow = [c32(27, 10, 31), c32(31, 22, 31), c32(27, 10, 31), c32(14, 4, 22)][fr];
    tri(f, 6, 0, 4, 2, d[2]); f.rect(3, 4, 7, h - 7, d[3]); f.rect(3, 4, 2, h - 7, d[2]); f.rect(1, h - 3, 11, 3, d[2]); f.rect(1, h - 3, 11, 1, d[1]);
    for (let y = 8; y < h - 6; y += 5) { f.rect(5, y, 3, 1, glow); f.px(6, y + 2, glow); }
  },
  // the Pantheon: a little temple of columns under a gold pediment
  temple(f) {
    const [mh, mb, md, mdd] = RAMP.mb, [gh, gb, gd] = RAMP.go;
    f.rect(1, 26, 32, 4, md); f.rect(1, 26, 32, 1, mh); f.rect(3, 23, 28, 3, mb); f.rect(3, 23, 28, 1, mh);
    for (let x = 4; x < 30; x += 5) { f.rect(x, 11, 3, 12, mb); f.px(x, 11, mh); f.rect(x + 2, 11, 1, 12, md); }
    f.rect(2, 8, 30, 3, gb); f.rect(2, 8, 30, 1, gh); tri(f, 17, 0, 8, 15, gd); tri(f, 17, 1, 8, 13, gb); f.rect(15, 4, 4, 2, gh);
    f.rect(7, 13, 20, 10, mdd); for (let x = 4; x < 30; x += 5) { f.rect(x, 11, 3, 12, mb); f.px(x, 11, mh); }
  },
  goldBrazier(f, w, h, fr) {
    const [gh, gb, gd] = RAMP.go, t = [0, 1, 0, -1][fr];
    f.rect(2, 9, 8, 2, gb); f.rect(2, 9, 8, 1, gh); f.rect(4, 11, 4, 5, gd); f.rect(2, 16, 8, 2, gb);
    ell(f, 6, 5, 3 + (t > 0 ? 1 : 0), 4, c32(31, 25, 6)); ell(f, 6, 6, 2, 3, c32(31, 31, 22)); f.px(6, 1 - (fr & 1), WHITE);
  },
  // the Underworld
  skullPile(f) { const w = c32(28, 26, 22), d = c32(18, 16, 13); for (const [x, y] of [[3, 6], [8, 6], [13, 6], [5, 3], [11, 3], [8, 1]]) { disc(f, x, y + 1, 2, d); disc(f, x, y, 2, w); f.px(x - 1, y, INK); f.px(x + 1, y, INK); } },
  cage(f, w, h, fr) {
    const g = c32(15, 15, 18), d = c32(8, 8, 11), sw = fr ? 1 : 0;
    f.rect(6 + sw, 0, 1, 6, g); ell(f, 7 + sw, 7, 6, 2, g); for (let x = 1; x < 14; x += 3) f.rect(x + sw, 7, 1, 14, x & 2 ? d : g); f.rect(1 + sw, 20, 13, 2, g); f.rect(4 + sw, 13, 5, 6, c32(28, 26, 22)); f.px(5 + sw, 14, INK); f.px(7 + sw, 14, INK);
    f.rect(4, 25, 7, 1, d);
  },
  boneArch(f) {
    const w = c32(28, 26, 22), d = c32(18, 16, 13);
    for (let a = 0; a <= 20; a++) { const t = (a / 20) * Math.PI, x = Math.round(16 - Math.cos(t) * 13), y = Math.round(26 - Math.sin(t) * 22); f.rect(x - 1, y - 1, 4, 4, a & 1 ? d : w); }
    disc(f, 16, 5, 4, w); f.rect(14, 4, 1, 2, INK); f.rect(17, 4, 1, 2, INK); f.rect(15, 8, 3, 1, INK);
  },
  // the Void
  cube(f, w, h, fr) {
    const y = [0, 1, 2, 1][fr], [hi, b, dk] = RAMP.vd;
    f.rect(2, 2 + y, 8, 8, WHITE); f.rect(2, 2 + y, 8, 1, WHITE); f.rect(8, 2 + y, 2, 8, RAMP.vd[1]); f.rect(2, 9 + y, 8, 1, RAMP.vd[1]);
    f.rect(3, 15, 6, 1, dk); void hi; void b;
  },
  doorframe(f) { f.rect(1, 0, 12, 26, WHITE); f.rect(3, 2, 8, 24, RAMP.vd[3]); f.rect(1, 25, 12, 1, RAMP.vd[1]); f.px(9, 13, RAMP.vd[1]); },
  hollowStatue(f) { const W1 = WHITE, g = RAMP.vd[1]; disc(f, 5, 4, 3, W1); f.rect(2, 8, 7, 12, W1); f.rect(3, 20, 2, 9, W1); f.rect(6, 20, 2, 9, W1); f.rect(1, 9, 1, 9, W1); f.rect(9, 9, 1, 9, W1); f.rect(7, 8, 2, 20, g); f.rect(1, 29, 9, 1, g); },
  // the city of champions: stands full of a crowd that never sits still, a gold trophy on a plinth, a tall banner
  bleachers(f, w, h, fr) {
    const [hi, b, dk, dd] = RAMP.rk, crowd = [c32(28, 6, 7), c32(31, 28, 9), c32(6, 12, 26), WHITE, c32(31, 12, 18), c32(8, 21, 8)];
    for (let r = 0; r < 4; r++) { const y = 2 + r * 4; f.rect(r * 2, y, 32 - r * 4, 4, r & 1 ? b : dk); f.rect(r * 2, y + 3, 32 - r * 4, 1, dd); for (let x = r * 2 + 1; x < 31 - r * 2; x += 2) if (hash2(x, r, 11) > 0.25) f.rect(x, y - ((x + r + fr) % 3 === 0 ? 1 : 0), 1, 2, crowd[((x * 7 + r * 3) >> 1) % crowd.length]); }
    f.rect(0, 17, 32, 1, dd); f.rect(0, 1, 32, 1, hi);
  },
  trophy(f, w, h, fr) {
    const [gh, gb, gd] = RAMP.go;
    f.rect(2, 18, 10, 6, RAMP.mb[2]); f.rect(2, 18, 10, 1, RAMP.mb[0]); f.rect(4, 15, 6, 3, gd); f.rect(6, 10, 2, 5, gb);
    ell(f, 7, 6, 5, 5, gd); ell(f, 7, 5, 4, 4, gb); f.rect(3, 1, 9, 2, gb); f.rect(0, 3, 2, 4, gb); f.rect(12, 3, 2, 4, gb); f.px(5, 4, gh); f.px(5, 5, gh);
    if (fr === 1) f.px(4, 3, WHITE); if (fr === 3) f.px(10, 8, WHITE);
  },
  bannerPole(f, w, h, fr) {
    f.rect(1, 0, 2, 28, RAMP.rk[2]); f.px(1, 0, c32(31, 25, 6));
    for (let j = 0; j < 14; j++) { const o = Math.round(Math.sin(fr * 1.5 + j * 0.5)); f.rect(3, 2 + j, 6 + o, 1, j < 3 ? c32(31, 25, 6) : j & 1 ? c32(28, 6, 7) : c32(20, 4, 6)); }
    f.rect(4, 8, 3, 3, c32(31, 25, 6));
  },
  // the Pantheon: a bank of cloud, a rainbow
  cloudBank(f) { ell(f, 20, 13, 19, 6, c32(23, 25, 30)); ell(f, 20, 12, 18, 6, c32(28, 29, 31)); ell(f, 12, 8, 9, 6, WHITE); ell(f, 26, 7, 10, 7, WHITE); ell(f, 19, 5, 7, 5, WHITE); f.rect(4, 17, 32, 1, c32(21, 24, 30)); },
  rainbow(f) {
    const cols = [c32(28, 6, 7), c32(31, 18, 4), c32(31, 28, 9), c32(8, 22, 8), c32(6, 12, 26), c32(19, 7, 21)];
    for (let a = 0; a <= 60; a++) { const t = (a / 60) * Math.PI; cols.forEach((c, i) => { const r = 19 - i; f.px(Math.round(20 - Math.cos(t) * r), Math.round(21 - Math.sin(t) * r), c); }); }
    ell(f, 3, 20, 4, 2, WHITE); ell(f, 37, 20, 4, 2, WHITE);
  },
  seaRock(f, w, h, fr) {
    const [hi, b, dk, dd] = RAMP.rk, fo = fr & 1;
    ell(f, 8, 6, 6, 3, dd); ell(f, 7, 5, 5, 3, b); ell(f, 6, 4, 2, 1, hi); f.rect(9, 6, 3, 1, dk);
    f.rect(1 - fo, 8, 3, 1, WHITE); f.rect(12 + fo, 8, 3, 1, WHITE); if (fr & 2) f.rect(5, 9, 6, 1, RAMP.sea[0]);
  },
  campfire(f, w, h, fr) {
    f.rect(2, 10, 8, 2, DC.trunk); f.rect(3, 9, 6, 1, DC.trunkHi); const t = [0, 1, 0, -1][fr];
    ell(f, 6, 6, 2 + (t > 0 ? 1 : 0), 3, c32(29, 12, 3)); ell(f, 6, 7, 1, 2, c32(31, 25, 8)); f.px(6 + t, 1, RAMP.rk[1]); f.px(5, 0, RAMP.rk[0]);
  },
  cabin(f) {
    const [wh, wb, wd] = [RAMP.wd[0], RAMP.wd[1], RAMP.wd[2]];
    f.rect(2, 8, 16, 10, wd); for (let y = 9; y < 18; y += 2) f.rect(3, y, 14, 1, wb); f.rect(3, 9, 14, 1, wh);
    tri(f, 10, 0, 8, 10, RAMP.sn[2]); tri(f, 10, 1, 8, 9, RAMP.sn[0]); f.rect(0, 8, 20, 1, RAMP.sn[3]);
    f.rect(5, 11, 3, 3, YEL); f.rect(11, 12, 4, 6, DC.door); f.rect(14, 1, 2, 5, RAMP.rk[2]);
  },
  well(f) { const [hi, b, dk] = RAMP.rk; ell(f, 6, 10, 5, 3, dk); ell(f, 6, 9, 5, 2, b); ell(f, 6, 9, 3, 1, RAMP.sea[2]); f.rect(1, 2, 1, 8, DC.trunk); f.rect(10, 2, 1, 8, DC.trunk); tri(f, 6, 0, 3, 6, DC.roofR[1]); f.rect(5, 3, 1, 4, RAMP.rk[3]); void hi; },
  // the blimp's airfield: a painted landing circle with lights round it, a windsock
  landingPad(f, w, h, fr) {
    const Y = c32(29, 23, 3), Wt = WHITE;
    ell(f, 22, 12, 21, 9, RAMP.ct[3]); ell(f, 22, 11, 21, 9, RAMP.ct[2]); ell(f, 22, 11, 17, 7, Y); ell(f, 22, 11, 15, 6, RAMP.ct[2]);
    f.rect(17, 7, 2, 9, Wt); f.rect(25, 7, 2, 9, Wt); f.rect(17, 10, 10, 2, Wt);
    for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2, x = Math.round(22 + Math.cos(a) * 20), y = Math.round(11 + Math.sin(a) * 8.5); f.rect(x, y, 2, 2, (fr + k) & 1 ? c32(31, 8, 8) : c32(31, 28, 10)); }
  },
  windsock(f, w, h, fr) {
    f.rect(2, 2, 1, 22, RAMP.rk[1]); f.rect(1, 23, 3, 1, RAMP.rk[3]);
    for (let i = 0; i < 4; i++) { const sw = Math.round(Math.sin(fr * 1.5 + i) * 1); f.rect(3 + i * 3, 3 + sw, 3, 4 - (i >> 1), i & 1 ? WHITE : c32(31, 14, 4)); }
  },
  hedge(f) { const [hi, b, dk, dd] = DC.leaf; f.rect(0, 2, 16, 8, dd); f.rect(0, 1, 16, 7, b); for (let x = 1; x < 16; x += 3) f.px(x, 2, hi); f.rect(0, 8, 16, 1, dk); },
  cave(f) { const [hi, b, dk, dd] = RAMP.rk; ell(f, 13, 12, 13, 10, dd); ell(f, 13, 11, 12, 10, b); ell(f, 8, 6, 5, 3, hi); ell(f, 13, 14, 7, 6, INK); f.rect(6, 17, 14, 1, dd); },
  neon(f, w, h, fr) { f.rect(1, 6, 12, 12, c32(7, 6, 13)); f.rect(2, 7, 10, 3, [c32(31, 6, 20), c32(6, 26, 31), c32(31, 6, 20), c32(6, 26, 31)][fr]); f.rect(2, 12, 10, 2, [c32(6, 26, 31), c32(31, 6, 20), c32(6, 26, 31), c32(31, 6, 20)][fr]); f.rect(6, 0, 2, 6, RAMP.rk[1]); },
};

// a skyscraper: a slab of colour with a grid of windows, some of them lit (they blink in turns)
const TOWER = [
  { wall: [c32(11, 12, 20), c32(7, 8, 14), c32(4, 5, 9)], lit: YEL },
  { wall: [c32(17, 17, 21), c32(12, 12, 17), c32(8, 8, 12)], lit: YEL },
];
function tower(f, w, h, fr, v, kind) {
  const T = TOWER[(v + kind) % 2], [hi, b, dk] = T.wall;
  f.rect(1, 3, w - 2, h - 3, dk); f.rect(2, 3, w - 4, h - 3, b); f.rect(2, 3, w - 4, 1, hi); f.rect(w - 4, 3, 2, h - 3, dk);
  f.rect(3, 1, w - 6, 2, b); if (kind === 1) { f.rect(w / 2 - 1, -0, 2, 3, b); }
  for (let y = 6; y < h - 4; y += 4) for (let x = 4; x < w - 5; x += 4) { const on = hash2(x + v, y, 5) > 0.45 || (((x + y + fr * 7) % 11) === 0); f.rect(x, y, 2, 2, on ? T.lit : dk); }
  f.rect(w / 2 - 1, h - 3, 3, 3, DC.door);
}

// scenery lookup for the terrain pass: which tile kinds each can stand on
export const STANDS = {};
