// Underworld III arena: the Chain Pits (spec §2b, §18). A sunken dungeon of black stone: iron-barred cells
// along the back wall with pairs of eyes glowing in the dark of them, chains hanging in loops from the roof at
// every height, cages on chains, braziers throwing a low orange light up the wall. The ring is a floor of
// riveted iron grating over a drain; its ropes are heavy chain and its posts iron pillars hung with
// manacles. The crowd is shades in the seats between the cells.
// `underworld3d` is the same pit dressed for Dash in Chains (spec §18 A5): his teal-and-gold banner hangs from
// the bars of a cell, and a length of chain is padlocked across it.
// Animated: the braziers flicker (palette), chains sway and dust falls (overlay), eyes blink in the cells; on a
// knockdown or a star every chain in the room rattles and the bars flash.
import { makePalette } from '../../src/engine/palette.js';
import { shadePalette, crowdOf, ringRopes, seatedCrowdReact } from './_uw.js';

const cells = makePalette('underworld3.cells', {
  wallHi: [7, 8, 11], wall: [4, 5, 8], wallSh: [2, 3, 5], wallDk: [1, 1, 3],
  barHi: [15, 16, 20], bar: [8, 9, 12], barSh: [3, 4, 6],
  eye: [28, 6, 4], eyeDim: [14, 3, 3], glowA: [26, 13, 4], glowB: [14, 6, 2], chainHi: [22, 23, 27], chain: [11, 12, 16],
  flash: [22, 24, 28],
});
const pit = makePalette('underworld3.pit', {
  brazier: [8, 6, 6], brazierHi: [16, 12, 10], flameHi: [31, 28, 12], flame: [31, 16, 3], flameLo: [22, 6, 2],
  cage: [10, 11, 15], cageHi: [19, 20, 25], cageSh: [4, 5, 7], moss: [4, 9, 6], teal: [3, 21, 20], tealDk: [1, 11, 12], gold: [30, 24, 6], goldDk: [18, 12, 2],
});
const crowd = shadePalette('underworld3.crowd', [[5, 5, 9], [3, 3, 6], [8, 8, 12]], [[6, 7, 12], [4, 5, 9], [9, 10, 15], [2, 3, 6]]);
const ring = makePalette('underworld3.ring', {
  gratHi: [12, 13, 17], grat: [7, 8, 11], gratSh: [3, 4, 6], gratDk: [1, 1, 2], rivet: [19, 20, 24], glow: [24, 10, 3],
  chainI: [17, 18, 22], chainIs: [8, 9, 12], chainR: [22, 8, 5], chainRs: [11, 3, 2], shadow: [1, 1, 2], cap: [14, 15, 19], capHi: [22, 23, 27],
});
const DUST = Array.from({ length: 14 }, (_, i) => ({ x: (i * 59 + 11) % 250, s: 0.1 + ((i * 3) % 4) * 0.05, o: (i * 71) % 220 }));
const CELLS = [[22, 'a'], [74, 'b'], [126, 'a'], [178, 'b'], [220, 'a']]; // x of each cell door on the back wall
const CHAINS = [[40, 26], [96, 34], [150, 28], [200, 36], [12, 30], [244, 32]]; // x, length of each hanging loop

function build(dash) {
  return {
    id: dash ? 'underworld3d' : 'underworld3',
    name: 'THE CHAIN PITS',
    circuit: dash ? 'rival7' : 'u3',
    music: dash ? 'rivalChains' : 'chainFight',
    palettes: [cells, pit, crowd, ring],
    ring: { canvas: ['gratHi', 'grat', 'gratSh', 'gratDk'], ropes: ['chainI', 'chainR', 'chainI'], turnbuckles: ['cap', 'cap'], pads: ['cap', 'cap'] },
    shadowColor: 'shadow',
    crowd: crowdOf(dash ? 6313 : 6303),
    paintBack(p) {
      p.rect(0, 0, 256, 88, 'wall');
      for (let y = 0; y < 76; y += 12) { p.hline(0, 255, y, 'wallSh'); for (let x = (y / 12) % 2 ? 0 : 12; x < 256; x += 24) p.vline(x, y, y + 11, 'wallSh'); }
      p.dither(0, 0, 256, 36, 'wallDk', 0.45);
      // the cell doors: barred arches with eyes behind the bars
      CELLS.forEach(([x, k], i) => {
        const w = 34, y0 = 26;
        p.rect(x - 2, y0 - 2, w + 4, 52, 'wallDk'); p.rect(x, y0, w, 50, 'wallSh');
        p.ellipse(x + w / 2, y0 + 2, w / 2, 8, 'wallSh', true);
        for (let bx = x + 3; bx < x + w - 1; bx += 5) { p.vline(bx, y0 - 3, y0 + 48, 'bar'); p.vline(bx + 1, y0 - 3, y0 + 48, 'barSh'); p.px(bx, y0 - 3, 'barHi'); }
        p.hline(x, x + w - 1, y0 + 14, 'bar'); p.hline(x, x + w - 1, y0 + 30, 'bar');
        p.rect(x + w - 8, y0 + 22, 4, 5, 'barHi'); p.px(x + w - 7, y0 + 24, 'wallDk'); // the lock
        if (!(dash && i === 2)) for (const dx of [10, 22]) { p.px(x + dx, y0 + 8 + (i % 2) * 3, 'eye'); p.px(x + dx + 3, y0 + 8 + (i % 2) * 3, 'eye'); }
      });
      if (dash) {
        // Dash's banner hangs from the bars of the middle cell, chained shut
        const x = 126, y0 = 26;
        p.rect(x + 4, y0 + 2, 26, 36, 'tealDk'); p.rect(x + 6, y0 + 4, 22, 32, 'teal'); p.poly([[x + 6, y0 + 36], [x + 28, y0 + 36], [x + 17, y0 + 44]], 'teal');
        p.rect(x + 6, y0 + 4, 22, 2, 'gold'); p.ellipse(x + 17, y0 + 20, 6, 7, 'goldDk', true); p.ellipse(x + 17, y0 + 20, 4.4, 5.4, 'gold', true);
        for (const [dx, dy] of [[15, 17], [15, 19], [15, 21], [17, 17], [17, 22], [19, 19], [19, 20]]) p.px(x + dx, y0 + dy, 'tealDk');
        p.line(x + 2, y0 + 8, x + 32, y0 + 34, 'chainHi'); p.line(x + 2, y0 + 9, x + 32, y0 + 35, 'chain');
        p.line(x + 2, y0 + 34, x + 32, y0 + 8, 'chainHi'); p.line(x + 2, y0 + 35, x + 32, y0 + 9, 'chain');
        p.rect(x + 13, y0 + 19, 8, 8, 'barHi'); p.rect(x + 14, y0 + 20, 6, 6, 'bar');
      }
      // chains looping from the roof, cages hanging on the longest
      for (const [x, len] of CHAINS) { for (let y = 0; y < len; y += 3) { p.px(x + (y & 3 ? 1 : 0), y, 'chainHi'); p.px(x, y + 1, 'chain'); } if (len > 33) { p.rect(x - 6, len, 13, 14, 'cageSh'); p.rect(x - 5, len + 1, 11, 12, 'cage'); for (let cx = x - 4; cx < x + 6; cx += 3) p.vline(cx, len + 1, len + 12, 'cageHi'); p.hline(x - 5, x + 5, len + 6, 'cageSh'); p.px(x - 2, len + 8, 'eye'); p.px(x + 2, len + 8, 'eye'); } }
      // braziers throwing their low light up the wall
      for (const x of [56, 200]) { p.rect(x - 1, 58, 3, 28, 'bar'); p.rect(x - 7, 56, 15, 5, 'brazierHi'); p.rect(x - 6, 57, 13, 3, 'brazier'); p.dither(x - 20, 40, 42, 18, 'glowB', 0.3, (i, j) => p.get(i, j) === p.c('wall')); }
      p.rect(0, 84, 256, 4, 'wallDk'); p.hline(0, 255, 84, 'bar');
      for (const y of [72, 85]) p.rect(8, y, 240, 2, 'barSh');
    },
    paintRing(p) {
      p.rect(0, 88, 256, 136, 'grat'); p.rect(0, 88, 256, 2, 'gratHi');
      // riveted iron grating: a grid of bars over black
      for (let y = 92; y < 224; y += 8) p.hline(0, 255, y, 'gratSh');
      for (let x = 0; x < 256; x += 12) p.vline(x, 90, 223, 'gratSh');
      for (let y = 92; y < 224; y += 24) for (let x = 6; x < 256; x += 24) { p.px(x, y, 'rivet'); p.px(x + 12, y + 8, 'rivet'); }
      p.dither(0, 90, 256, 16, 'gratDk', 0.4); p.dither(0, 200, 256, 24, 'gratDk', 0.4);
      // the drain in the middle of the ring, and the red glow coming up through the grating round it
      p.ellipse(128, 186, 78, 25, 'glow', false); p.ellipse(128, 186, 76, 24, 'gratDk', false);
      p.ellipse(128, 190, 10, 3, 'gratDk', true); for (let x = 120; x < 137; x += 3) p.vline(x, 188, 192, 'gratSh');
      ringRopes(p, [[60, 'chainI', 'chainIs'], [68, 'chainR', 'chainRs'], [76, 'chainI', 'chainIs']], ['gratDk', 'gratSh', 'gratHi', 'gratDk', 'chainI', 'chainIs']);
      // manacles hung on the corner posts
      for (const x of [3, 246]) { p.rect(x, 62, 6, 2, 'chainIs'); p.rect(x + 1, 64, 4, 6, 'chainI'); p.rect(x + 2, 66, 2, 2, 'gratDk'); }
    },
    paletteAnim(t, live, pal, state, arena) {
      const set = (k, v) => { live[pal.idx(k)] = pal.u32[pal.idx(v)]; };
      if (((t >> 3) % 6) === 2) { set('glowB', 'glowA'); set('flame', 'flameHi'); }
      if (((t >> 4) % 11) === 4) { set('eye', 'eyeDim'); }
      if (arena.react > 0 && (t >> 2) % 3 === 0) { set('wallSh', 'flash'); set('bar', 'barHi'); }
    },
    overlay(frame, arena, t) {
      const col = (k) => arena.live[arena.pal.idx(k)];
      // the braziers burn
      for (const x of [56, 200]) for (const [dx, h] of [[-3, 7], [0, 12], [3, 8]]) { const hh = h + ((t + dx * 7) % 6 < 3 ? 2 : 0); for (let j = 0; j < hh; j++) frame.px(x + dx, 55 - j, col(j < hh * 0.4 ? 'flameHi' : j < hh * 0.75 ? 'flame' : 'flameLo')); }
      // the hanging chains sway a link or two
      for (const [x, len] of CHAINS) { const sway = Math.round(Math.sin((t + x * 3) / 40) * 2); for (let y = 6; y < len; y += 6) frame.px(x + sway * (y / len), y, col('chainHi')); }
      // dust falling from the roof
      for (const D of DUST) { const y = 6 + (((t * D.s + D.o) % 70)); if (y < 70) frame.px(Math.round(D.x + Math.sin((t + D.o) / 30) * 3), Math.round(y), col('chain')); }
      seatedCrowdReact(frame, arena, t, col('glowA'));
    },
  };
}
export const CHAIN_PITS = { underworld3: build(false), underworld3d: build(true) };
export default CHAIN_PITS.underworld3;
