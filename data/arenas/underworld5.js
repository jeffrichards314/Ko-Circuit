// Underworld V arena: the Furnace (spec §2b, §18). The foundry that keeps the Underworld's fires: a great brick hall, its back wall a row of
// furnace mouths glowing orange-white with the fire inside them, iron pipes and gantries across the roof, buckets and chains
// hanging over channels of molten metal that run along the foot of the wall, sparks jumping. The ring is a plate of black iron
// over a grate with the glow coming up round every edge; its ropes are hot iron (dull red) and its posts are chimneys. The crowd is
// shades in front of the fire, black cut-outs with two embers for eyes.
// Animated: the fire and the channels flicker (palette), sparks fly and heat shimmers off the wall (overlay); on a knockdown or a star every
// furnace door flares white.
import { makePalette } from '../../src/engine/palette.js';
import { shadePalette, crowdOf, ringRopes, seatedCrowdReact } from './_uw.js';

const wall = makePalette('underworld5.wall', {
  brickHi: [9, 4, 3], brick: [6, 3, 2], brickSh: [3, 1, 1], brickDk: [1, 0, 0], mortar: [4, 2, 2],
  pipeHi: [13, 11, 11], pipe: [7, 6, 6], pipeSh: [3, 3, 3], glowHi: [31, 30, 20], glow: [31, 18, 4], glowLo: [24, 8, 2], glowDk: [12, 3, 1], flash: [31, 31, 28],
});
const props = makePalette('underworld5.props', {
  metalHi: [16, 12, 11], metal: [9, 7, 7], metalSh: [4, 3, 3], bucket: [11, 9, 8], bucketHot: [24, 10, 3],
  flameHi: [31, 28, 12], flame: [31, 16, 3], flameLo: [22, 6, 2], spark: [31, 24, 8], smoke: [6, 4, 4], smokeHi: [12, 8, 7], chain: [14, 11, 10], black: [1, 0, 0],
});
const crowd = shadePalette('underworld5.crowd', [[6, 3, 3], [3, 1, 1], [9, 4, 3]], [[9, 3, 2], [5, 1, 1], [13, 6, 3], [2, 0, 0]], [1, 0, 0]);
const ring = makePalette('underworld5.ring', {
  plateHi: [12, 10, 10], plate: [6, 5, 5], plateSh: [3, 2, 2], plateDk: [1, 0, 0], glow: [30, 12, 2], glowHi: [31, 24, 6], rivet: [17, 14, 13],
  ropeI: [11, 8, 8], ropeIs: [5, 3, 3], ropeR: [24, 8, 3], ropeRs: [12, 3, 1], shadow: [1, 0, 0], cap: [14, 11, 10], capHi: [22, 17, 15],
});
const SPARKS = Array.from({ length: 22 }, (_, i) => ({ x: (i * 47 + 11) % 250, s: 0.25 + ((i * 3) % 5) * 0.1, o: (i * 41) % 240 }));
const MOUTHS = [16, 78, 140, 202]; // x of each furnace door
const BUCKETS = [[48, 20], [110, 28], [172, 22], [234, 26]];

export default {
  id: 'underworld5',
  name: 'THE FURNACE',
  circuit: 'u5',
  music: 'furnaceFight',
  palettes: [wall, props, crowd, ring],
  ring: { canvas: ['plateHi', 'plate', 'plateSh', 'plateDk'], ropes: ['ropeI', 'ropeR', 'ropeI'], turnbuckles: ['cap', 'cap'], pads: ['cap', 'cap'] },
  shadowColor: 'shadow',
  crowd: crowdOf(6505),
  paintBack(p) {
    p.rect(0, 0, 256, 88, 'brick');
    for (let y = 0; y < 84; y += 8) { p.hline(0, 255, y, 'mortar'); for (let x = (y / 8) % 2 ? 0 : 12; x < 256; x += 24) p.vline(x, y, y + 7, 'mortar'); }
    p.dither(0, 0, 256, 34, 'brickDk', 0.55); p.dither(0, 34, 256, 20, 'brickDk', 0.2);
    // pipes and a gantry across the roof
    for (const y of [6, 14]) { p.rect(0, y, 256, 4, 'pipe'); p.rect(0, y, 256, 1, 'pipeHi'); p.rect(0, y + 3, 256, 1, 'pipeSh'); for (let x = 20; x < 256; x += 48) p.rect(x, y - 1, 3, 6, 'pipeSh'); }
    for (const x of [40, 104, 168, 232]) { p.rect(x, 18, 4, 30, 'pipe'); p.rect(x, 18, 1, 30, 'pipeHi'); }
    // the furnace mouths: a brick arch, the fire white in the middle of it
    for (const x of MOUTHS) {
      p.rect(x - 4, 36, 46, 50, 'brickDk'); p.ellipse(x + 19, 44, 23, 12, 'brickDk', true); p.rect(x, 44, 38, 42, 'glowDk');
      p.ellipse(x + 19, 46, 19, 10, 'glowDk', true);
      p.rect(x + 3, 50, 32, 36, 'glowLo'); p.ellipse(x + 19, 50, 16, 8, 'glowLo', true);
      p.rect(x + 8, 58, 22, 28, 'glow'); p.ellipse(x + 19, 58, 11, 6, 'glow', true);
      p.rect(x + 13, 68, 12, 18, 'glowHi'); p.ellipse(x + 19, 68, 6, 4, 'glowHi', true);
      for (let bx = x + 1; bx < x + 38; bx += 7) p.vline(bx, 60, 86, 'metalSh'); // the grate bars across the doors
      p.rect(x - 6, 84, 50, 4, 'metalSh'); p.rect(x - 6, 84, 50, 1, 'metal');
    }
    // buckets on chains over the channels of molten metal
    for (const [x, len] of BUCKETS) { for (let y = 0; y < len + 18; y += 3) p.px(x, y, 'chain'); p.poly([[x - 6, len + 18], [x + 6, len + 18], [x + 4, len + 30], [x - 4, len + 30]], 'bucket'); p.rect(x - 6, len + 18, 13, 2, 'metalHi'); p.rect(x - 3, len + 26, 7, 3, 'bucketHot'); }
    // the channel of molten metal along the foot of the wall
    p.rect(0, 82, 256, 6, 'glowDk'); p.rect(0, 84, 256, 2, 'glowLo'); for (let x = 0; x < 256; x += 9) p.px(x, 85, 'glowHi');
    for (const y of [72, 85]) p.rect(8, y, 240, 2, 'brickSh');
  },
  paintRing(p) {
    p.rect(0, 88, 256, 136, 'plate'); p.rect(0, 88, 256, 2, 'plateHi');
    // plates of black iron, riveted, the seams between them glowing
    for (let y = 92; y < 224; y += 26) for (let x = ((y / 26) | 0) % 2 ? 0 : 32; x < 256; x += 64) { p.rect(x, y, 64, 1, 'plateDk'); p.rect(x, y, 1, 26, 'plateDk'); for (const [rx, ry] of [[4, 4], [59, 4], [4, 21], [59, 21]]) p.px(x + rx, y + ry, 'rivet'); }
    p.dither(0, 90, 256, 16, 'plateSh', 0.4); p.dither(0, 200, 256, 24, 'plateSh', 0.35);
    p.ellipse(128, 186, 78, 25, 'glow', false); p.ellipse(128, 186, 76, 24, 'plateDk', false);
    for (const [x0, y0, x1, y1] of [[22, 102, 56, 128], [214, 108, 186, 140], [40, 212, 90, 192], [232, 202, 192, 220]]) { p.line(x0, y0, x1, y1, 'glow'); p.line(x0 + 1, y0, x1 + 1, y1, 'plateDk'); }
    ringRopes(p, [[60, 'ropeI', 'ropeIs'], [68, 'ropeR', 'ropeRs'], [76, 'ropeI', 'ropeIs']], ['plateDk', 'plateSh', 'plateHi', 'plateDk', 'ropeI', 'ropeIs']);
  },
  paletteAnim(t, live, pal, state, arena) {
    const set = (k, v) => { live[pal.idx(k)] = pal.u32[pal.idx(v)]; };
    if (((t >> 3) % 6) === 2) { set('glow', 'glowHi'); set('glowLo', 'glow'); set('flame', 'flameHi'); }
    if (((t >> 4) % 9) === 4) { set('glowHi', 'flash'); }
    if (arena.react > 0 && (t >> 2) % 3 === 0) { set('glowLo', 'flash'); set('glow', 'flash'); set('glowDk', 'glowHi'); }
  },
  overlay(frame, arena, t) {
    const col = (k) => arena.live[arena.pal.idx(k)];
    // the fire licks up out of every door
    for (const x of MOUTHS) for (const [dx, h] of [[8, 6], [16, 10], [24, 7], [31, 5]]) { const hh = h + ((t + dx * 5) % 6 < 3 ? 2 : 0); for (let j = 0; j < hh; j++) frame.px(x + dx + ((t >> 2) & 1), 60 - j, col(j < hh * 0.4 ? 'flameHi' : j < hh * 0.75 ? 'flame' : 'flameLo')); }
    // heat shimmer: the wall wobbles a pixel over each door (thin dark lines drifting up)
    for (const x of MOUTHS) for (let j = 0; j < 5; j++) { const y = 84 - ((t * 0.6 + j * 17) % 60); frame.px(Math.round(x + 4 + Math.sin((t + j * 9) / 8) * 3 + j * 7), Math.round(y), col('smokeHi')); }
    // sparks flying up the hall
    for (const S of SPARKS) { const y = 84 - (((t * S.s + S.o) % 78)), x = S.x + Math.sin((t + S.o) / 14) * 6; if (y > 6) { frame.px(Math.round(x), Math.round(y), col('spark')); if (y > 40) frame.px(Math.round(x), Math.round(y) + 1, col('flameLo')); } }
    seatedCrowdReact(frame, arena, t, col('spark'));
  },
};
