// Pantheon V arena: the Thunder Forge (spec §2b, §18). A smithy of the gods: a soot-black stone hall
// with a great furnace mouth glowing behind the ring, anvils and hanging tongs and hammers along the
// wall, chains and a bellows the size of a cart, the crowd in leather aprons on iron benches. The
// ring is a riveted iron plate floor with a glowing seam, iron-and-copper ropes.
// Animated: the furnace breathes (palette), sparks fly up from it and embers drift (overlay), the
// crowd reacts; on a knockdown or a star the forge flares and lightning cracks across the roof.
import { makePalette } from '../../src/engine/palette.js';
import { crowdPalette, crowdOf, ringRopes, seatedCrowdReact } from './_zone.js';

const fire = makePalette('pantheon5.fire', {
  f0: [3, 1, 1], f1: [9, 2, 1], f2: [17, 4, 1], f3: [26, 9, 2], f4: [31, 18, 3], f5: [31, 27, 12], f6: [31, 31, 24],
  spark: [31, 24, 8], ember: [28, 8, 2], flash: [24, 26, 31], bolt: [31, 31, 31],
});
const hall = makePalette('pantheon5.hall', {
  stoneHi: [10, 9, 11], stone: [6, 6, 8], stoneSh: [3, 3, 5], stoneDk: [1, 1, 2],
  ironHi: [20, 21, 25], iron: [12, 13, 17], ironSh: [6, 7, 10], copper: [24, 13, 6], copperDk: [13, 6, 3],
  wood: [12, 7, 3], woodDk: [6, 3, 1],
});
const crowd = crowdPalette('pantheon5.crowd', [[15, 9, 4], [9, 9, 12], [18, 6, 3], [5, 3, 2]], [2, 1, 2]);
const ring = makePalette('pantheon5.ring', {
  plateHi: [14, 15, 19], plate: [9, 10, 13], plateSh: [5, 5, 8], plateDk: [2, 2, 4], rivet: [20, 21, 25], seam: [28, 12, 3], seamHi: [31, 22, 6],
  ropeC: [26, 14, 6], ropeCs: [14, 7, 3], ropeI: [17, 18, 23], ropeIs: [8, 9, 13], shadow: [1, 1, 2],
});
const SPARKS = Array.from({ length: 16 }, (_, i) => ({ x: 96 + ((i * 41) % 64), s: 0.5 + ((i * 3) % 5) * 0.2, o: (i * 71) % 100 }));

export default {
  id: 'pantheon5',
  name: 'THE THUNDER FORGE',
  circuit: 'p5',
  music: 'forgeFight',
  palettes: [fire, hall, crowd, ring],
  ring: { canvas: ['plateHi', 'plate', 'plateSh', 'plateDk'], ropes: ['ropeC', 'ropeI', 'ropeC'], turnbuckles: ['iron', 'iron'], pads: ['iron', 'iron'] },
  shadowColor: 'shadow',
  crowd: crowdOf(5505),
  paintBack(p) {
    p.rect(0, 0, 256, 88, 'stone');
    for (let y = 0; y < 74; y += 10) { p.hline(0, 255, y, 'stoneSh'); for (let x = (y / 10) % 2 ? 0 : 12; x < 256; x += 24) p.vline(x, y, y + 9, 'stoneSh'); }
    p.dither(0, 0, 256, 40, 'stoneDk', 0.4);
    // the furnace mouth: an arch of glow, brighter to the middle
    p.ellipse(128, 70, 62, 52, 'f0', true);
    const bands = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'];
    bands.forEach((k, i) => p.ellipse(128, 72, 58 - i * 9, 46 - i * 7, k, true));
    p.rect(60, 70, 136, 6, 'f0'); p.rect(66, 72, 124, 6, 'f2'); p.dither(66, 70, 124, 8, 'f3', 0.5);
    // arch stones
    for (let a = -8; a <= 8; a++) { const t = (a / 8) * 1.2, x = 128 + Math.sin(t) * 64, y = 72 - Math.cos(t) * 54; p.rect(x - 3, y - 3, 6, 6, 'ironSh'); p.px(x, y - 3, 'iron'); }
    // hanging tools on the walls: hammers and tongs
    for (const x of [20, 40, 210, 232]) { p.rect(x, 12, 2, 24, 'woodDk'); p.rect(x - 5, 10, 12, 7, 'iron'); p.hline(x - 5, x + 6, 10, 'ironHi'); p.rect(x - 2, 36, 6, 3, 'ironSh'); }
    for (const x of [30, 220]) { p.line(x, 44, x - 6, 62, 'iron'); p.line(x, 44, x + 6, 62, 'iron'); p.line(x - 6, 62, x - 3, 70, 'ironHi'); p.line(x + 6, 62, x + 3, 70, 'ironHi'); }
    // an anvil at each end, chains from the roof
    for (const x of [12, 232]) { p.rect(x, 62, 14, 5, 'ironHi'); p.rect(x + 2, 67, 10, 8, 'iron'); p.rect(x - 2, 62, 4, 3, 'ironHi'); p.rect(x + 12, 62, 4, 3, 'ironHi'); }
    for (const x of [70, 186]) for (let y = 0; y < 22; y += 4) { p.rect(x, y, 3, 3, 'ironSh'); p.px(x + 1, y, 'ironHi'); }
    p.rect(0, 74, 256, 4, 'ironSh'); p.hline(0, 255, 74, 'iron'); p.rect(0, 78, 256, 10, 'stoneDk');
  },
  paintRing(p) {
    p.rect(0, 84, 256, 4, 'ironSh'); p.rect(0, 84, 256, 1, 'iron');
    p.rect(0, 88, 256, 136, 'plate'); p.rect(0, 88, 256, 2, 'plateHi');
    p.dither(0, 90, 256, 18, 'plateSh', 0.35); p.dither(0, 200, 256, 24, 'plateSh', 0.3);
    for (let y = 100; y < 224; y += 24) for (let x = ((y / 24) | 0) % 2 ? 0 : 32; x < 256; x += 64) { p.rect(x, y, 64, 1, 'plateDk'); p.rect(x, y, 1, 24, 'plateDk'); p.px(x + 4, y + 4, 'rivet'); p.px(x + 60, y + 4, 'rivet'); }
    // a glowing seam in the floor round the fighters
    p.ellipse(128, 186, 76, 24, 'seam', false); p.ellipse(128, 186, 74, 23, 'plateDk', false);
    for (let a = 0; a < 20; a++) { const t = (a / 20) * Math.PI * 2; p.px(128 + Math.cos(t) * 76, 186 + Math.sin(t) * 24, 'seamHi'); }
    ringRopes(p, [[60, 'ropeC', 'ropeCs'], [68, 'ropeI', 'ropeIs'], [76, 'ropeC', 'ropeCs']], ['plateDk', 'plateSh', 'plateHi', 'ironSh', 'iron', 'ironHi']);
  },
  paletteAnim(t, live, pal, state, arena) {
    const set = (k, v) => { live[pal.idx(k)] = pal.u32[pal.idx(v)]; };
    if (((t >> 4) & 3) === 1) { set('f4', 'f5'); set('f3', 'f4'); }
    if (arena.react > 0 && (t >> 2) % 5 === 0) { set('f0', 'f3'); set('f1', 'f4'); set('stoneDk', 'flash'); }
  },
  overlay(frame, arena, t) {
    const col = (k) => arena.live[arena.pal.idx(k)];
    for (const S of SPARKS) {
      const y = 78 - (((t * S.s + S.o) % 60)), x = S.x + Math.sin((t + S.o) / 14) * 5;
      if (y > 20) { frame.px(Math.round(x), Math.round(y), col(y > 50 ? 'f6' : 'spark')); frame.px(Math.round(x), Math.round(y) + 1, col('ember')); }
    }
    if (arena.react > 0 && (t >> 1) % 6 === 0) { let x = 20 + ((t * 13) % 216), y = 0; for (let i = 0; i < 28; i++) { frame.px(x, y, col('bolt')); x += ((t + i * 7) % 3) - 1; y += 2; } }
    seatedCrowdReact(frame, arena, t, col('f6'));
  },
};
