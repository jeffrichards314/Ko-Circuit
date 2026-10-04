// Continental Circuit arena: The Grand Hall.
// An old-world ballroom turned boxing hall: cream-and-gold walls, marble
// columns, two tiers of opera balconies draped in red velvet, two crystal
// chandeliers, and a red velvet ring with gilded posts on a cream canvas with
// a gold crest.
// Animated: the chandelier candles flicker (palette), the chandeliers sway
// gently and their crystals glint (overlay), opera glasses flash in the
// balconies (overlay), and on knockdowns and stars every candle blazes up.

import { makePalette } from '../../src/engine/palette.js';

const hall = makePalette('continental.hall', {
  wall: [25, 21, 15], wallSh: [18, 14, 10], wallDk: [9, 6, 5],
  goldHi: [31, 28, 14], gold: [26, 19, 5], goldDk: [15, 9, 2],
  marble: [28, 27, 25], marbleSh: [19, 18, 18],
  velvetHi: [24, 4, 7], velvet: [16, 2, 5], velvetDk: [8, 1, 3],
  flameA: [31, 27, 12], flameB: [31, 20, 6], crystal: [26, 31, 31],
});

const crowd = makePalette('continental.crowd', {
  outline: [3, 2, 3],
  skin1: [30, 23, 17], skin1s: [22, 14, 11],
  skin2: [22, 14, 9], skin2s: [14, 8, 6],
  skin3: [14, 9, 6], skin3s: [9, 5, 3],
  hairA: [4, 3, 3], hairB: [24, 22, 20], hairC: [20, 12, 5],
  shirtR: [4, 4, 7], shirtY: [26, 24, 22], shirtG: [7, 12, 22], shirtB: [18, 4, 12],
  shirtSh: [2, 2, 4],
});

const ring = makePalette('continental.ring', {
  ropeR: [26, 4, 8], ropeRs: [14, 2, 4],
  ropeG: [30, 25, 9], ropeGs: [17, 12, 3],
  postHi: [31, 28, 14], post: [25, 18, 5], postDk: [13, 8, 2],
  padR: [21, 3, 6], padRs: [11, 1, 3],
  apron: [12, 2, 4], apronHi: [27, 20, 6],
  glass: [30, 31, 31],
});

const floor = makePalette('continental.canvas', {
  canvasHi: [30, 28, 24], canvas: [27, 24, 19], canvasSh: [22, 19, 14], canvasDk: [13, 10, 7],
  crest: [26, 19, 5], crestSh: [22, 19, 14],
  shadow: [20, 17, 12],
  white: [31, 31, 31], carpet: [15, 3, 5], carpetHi: [22, 5, 8],
});

// balcony rows (upper tier first) and the stalls at ringside
const ROWS = [
  { y: 34, x0: 20, x1: 236, spacing: 12, skip: [[112, 144]] },
  { y: 60, x0: 8, x1: 248, spacing: 11, skip: [[116, 140]] },
  { y: 80, x0: 4, x1: 252, spacing: 11 },
];
const CHANDELIERS = [[56, 30], [200, 30]]; // hook x, drop length (below the HUD, in front of the upper balcony)

export default {
  id: 'continental',
  name: 'THE GRAND HALL',
  circuit: 'continental',
  music: 'continentalFight',
  palettes: [hall, crowd, ring, floor],
  ring: {
    canvas: ['canvasHi', 'canvas', 'canvasSh', 'canvasDk'],
    ropes: ['ropeR', 'ropeG', 'ropeR'],
    turnbuckles: ['padR', 'padR'],
    pads: ['padR', 'padR'],
  },
  shadowColor: 'shadow',
  crowd: {
    style: 'balconies',
    density: 0.8,
    excitable: 0.75,
    seed: 1789,
    outline: 'outline',
    rows: ROWS,
    skins: [['skin1', 'skin1s'], ['skin2', 'skin2s'], ['skin3', 'skin3s']],
    hairs: ['hairA', 'hairB', 'hairC', 'hairA'],
    shirts: [['shirtR', 'shirtSh'], ['shirtY', 'shirtSh'], ['shirtG', 'shirtSh'], ['shirtB', 'shirtSh']],
  },

  paintBack(p) {
    // cream wall with gilded panels
    p.rect(0, 0, 256, 92, 'wall');
    p.dither(0, 0, 256, 14, 'wallSh', 0.5);
    for (let x = 6; x < 256; x += 40) { p.rect(x, 16, 28, 12, 'wallSh'); p.hline(x, x + 27, 16, 'gold'); p.hline(x, x + 27, 27, 'goldDk'); p.vline(x, 16, 27, 'gold'); p.vline(x + 27, 16, 27, 'goldDk'); }
    // gilded cornice
    p.rect(0, 0, 256, 3, 'goldDk'); p.hline(0, 255, 3, 'gold'); p.hline(0, 255, 4, 'goldHi');
    // marble columns between the balcony bays
    for (const x of [8, 112, 144, 248]) { p.rect(x - 4, 0, 9, 92, 'marble'); p.vline(x + 3, 0, 91, 'marbleSh'); p.vline(x - 4, 0, 91, 'marbleSh'); p.rect(x - 6, 4, 13, 3, 'gold'); p.hline(x - 6, x + 6, 7, 'goldDk'); }
    // upper balcony: velvet-draped front with a gold rail
    p.rect(0, 36, 256, 8, 'velvet'); p.hline(0, 255, 36, 'goldHi'); p.hline(0, 255, 37, 'gold');
    for (let x = 0; x < 256; x += 16) for (let j = 0; j < 4; j++) p.hline(x + j, x + 15 - j, 44 + j, j < 3 ? 'velvet' : 'velvetDk');
    for (let x = 4; x < 256; x += 16) p.vline(x, 38, 43, 'velvetHi');
    // lower balcony
    p.rect(0, 62, 256, 8, 'velvet'); p.hline(0, 255, 62, 'goldHi'); p.hline(0, 255, 63, 'gold');
    for (let x = 0; x < 256; x += 16) for (let j = 0; j < 4; j++) p.hline(x + j, x + 15 - j, 70 + j, j < 3 ? 'velvet' : 'velvetDk');
    for (let x = 4; x < 256; x += 16) p.vline(x, 64, 69, 'velvetHi');
    // a grand velvet curtain in the centre bay (the royal box)
    for (let x = 114; x < 142; x++) for (let y = 8; y < 74; y++) if (y < 60 || Math.abs(x - 128) > (y - 60) * 0.9) p.px(x, y, ((x >> 1) & 1) ? 'velvet' : 'velvetDk');
    p.rect(116, 8, 24, 3, 'gold');
    p.rect(124, 12, 8, 7, 'goldDk'); p.rect(125, 13, 6, 5, 'gold'); p.px(127, 14, 'goldHi'); p.px(128, 14, 'goldHi');
    // stalls behind ringside: dark, then the red carpet aisle line
    p.rect(0, 74, 256, 14, 'wallDk');
    p.rect(0, 84, 256, 6, 'carpet'); p.hline(0, 255, 84, 'carpetHi');
    // chandelier chains
    for (const [x, len] of CHANDELIERS) p.vline(x, 5, 5 + len, 'goldDk');
  },

  paintRing(p) {
    p.rect(0, 88, 256, 4, 'apron');
    for (let x = 2; x < 256; x += 10) { p.px(x, 89, 'apronHi'); p.px(x + 1, 90, 'apronHi'); p.px(x + 2, 89, 'apronHi'); }
    p.hline(0, 255, 88, 'canvasDk');
    p.rect(0, 92, 256, 132, 'canvas');
    p.rect(0, 92, 256, 2, 'canvasHi');
    p.dither(0, 94, 256, 12, 'canvasSh', 0.35);
    p.dither(0, 106, 256, 10, 'canvasSh', 0.12);
    for (const [x, y] of [[40, 140], [210, 150], [90, 204], [176, 198], [26, 188], [230, 124]]) p.dither(x - 8, y - 3, 16, 6, 'canvasSh', 0.3, (i, j) => ((i - x) / 8) ** 2 + ((j - y) / 3) ** 2 < 1);
    // the gold crest in the centre: a laurel ring around a crown
    p.ellipse(128, 184, 40, 16, 'crest', false);
    for (let a = 0; a < 18; a++) { const t = (a / 18) * Math.PI * 2; const x = 128 + Math.cos(t) * 44, y = 184 + Math.sin(t) * 18; p.ellipse(x, y, 3, 1.5, 'crest'); }
    p.poly([[112, 192], [144, 192], [148, 176], [138, 184], [128, 172], [118, 184], [108, 176]], 'crest');
    p.text('GRAND HALL', 26, 150, 'crest', { mono: false });
    p.text('CONTINENTAL', 176, 150, 'crest', { mono: false });
    p.dither(60, 160, 136, 48, 'canvas', 0.25, (i, j) => p.get(i, j) === p.c('crest'));
    // red velvet ropes with gold cord between
    const ropes = [[62, 'ropeR', 'ropeRs'], [70, 'ropeG', 'ropeGs'], [78, 'ropeR', 'ropeRs']];
    for (const [y, a, b] of ropes) { p.hline(16, 239, y, a); p.hline(16, 239, y + 1, b); }
    for (const [y, a, b] of ropes) {
      p.line(12, y, -10, y + 38, a); p.line(12, y + 1, -10, y + 39, b);
      p.line(243, y, 266, y + 38, a); p.line(243, y + 1, 266, y + 39, b);
    }
    // gilded posts with velvet pads
    for (const x of [8, 241]) {
      p.rect(x, 50, 7, 44, 'postDk'); p.rect(x + 1, 50, 5, 44, 'post'); p.vline(x + 2, 51, 92, 'postHi');
      p.rect(x - 1, 57, 9, 27, 'padRs'); p.rect(x, 58, 7, 25, 'padR');
      for (const [y] of ropes) p.hline(x, x + 6, y + 2, 'padRs');
      p.rect(x - 1, 92, 9, 3, 'postDk');
      p.ellipse(x + 3, 47, 4, 3, 'postHi'); p.px(x + 3, 44, 'post');
    }
  },

  paletteAnim(t, live, pal, state) {
    const set = (k, v) => { live[pal.idx(k)] = pal.u32[pal.idx(v)]; };
    // candle flicker: the two flame colours trade places irregularly
    const f = (Math.sin(t * 0.31) + Math.sin(t * 0.13 + 1)) > 0.4;
    if (f) { set('flameA', 'flameB'); set('flameB', 'flameA'); }
    if (state.flash > 0) {
      state.flash--;
      set('flameA', 'crystal'); set('flameB', 'goldHi');
      if (state.flash > 6) { set('wall', 'marble'); set('wallSh', 'wall'); set('canvas', 'canvasHi'); }
    }
  },

  onReaction(kind, state) {
    if (kind === 'knockdown' || kind === 'ko' || kind === 'star') state.flash = kind === 'star' ? 14 : 28;
  },

  overlay(frame, arena, t, state) {
    const col = (k) => arena.live[arena.pal.idx(k)];
    // the chandeliers, swaying on their chains
    CHANDELIERS.forEach(([hx, len], i) => {
      const sway = Math.round(Math.sin(t * 0.02 + i * 1.7) * 1.2);
      const x = hx + sway, y = 5 + len;
      frame.rect(x - 11, y + 4, 23, 2, col('gold'));
      frame.rect(x - 8, y + 6, 17, 2, col('goldDk'));
      frame.rect(x - 1, y, 3, 12, col('gold'));
      for (const dx of [-10, -5, 0, 5, 10]) {
        frame.rect(x + dx, y + 1, 1, 3, col('marble'));
        frame.px(x + dx, y, col((dx + (t >> 3)) & 1 ? 'flameA' : 'flameB'));
      }
      for (const dx of [-9, -6, -3, 0, 3, 6, 9]) { const drop = 8 + (Math.abs(dx) < 4 ? 3 : 1); frame.rect(x + dx, y + drop, 1, 2, col('crystal')); }
      if (((t + i * 37) % 90) < 4) frame.px(x + ((t >> 2) % 7) - 3, y + 11, col('marble'));
    });
    // opera glasses glinting in the balconies
    for (const [x, y, ph] of [[46, 29, 0], [172, 29, 71], [224, 55, 133], [30, 55, 191]]) {
      if (((t + ph) % 220) < 6) { frame.px(x, y, col('glass')); frame.px(x + 2, y, col('glass')); frame.px(x + 1, y - 1, col('glass')); }
    }
  },
};
