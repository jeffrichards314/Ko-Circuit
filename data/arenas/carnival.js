// Carnival Circuit arena: The Big Top.
// A circus tent at night: red-and-cream canvas stripes sweeping up to the peak,
// two king poles, strings of bulbs drooping across the tent, wooden bleachers
// packed with the crowd, a trapeze artist swinging high above the ring, and a
// sawdust-cream canvas with a big star.
// Animated: the bulbs chase (palette), the trapeze swings (overlay), pennant
// flags flutter (overlay), and every bulb blazes on knockdowns and stars.

import { makePalette } from '../../src/engine/palette.js';

const tent = makePalette('carnival.tent', {
  red: [23, 4, 7], redSh: [14, 2, 5], cream: [28, 25, 18], creamSh: [18, 15, 11],
  dark: [4, 2, 5], peak: [9, 3, 7],
  pole: [18, 12, 6], poleHi: [26, 19, 10],
  bulbA: [31, 29, 14], bulbB: [31, 29, 14], bulbOff: [12, 9, 6], wire: [5, 4, 3],
  gold: [30, 23, 5], blue: [8, 12, 26], green: [7, 20, 10],
});

const crowd = makePalette('carnival.crowd', {
  outline: [3, 2, 3],
  skin1: [30, 22, 16], skin1s: [22, 14, 10],
  skin2: [22, 14, 9], skin2s: [14, 8, 6],
  skin3: [13, 8, 5], skin3s: [8, 5, 3],
  hairA: [4, 3, 3], hairB: [23, 16, 6], hairC: [19, 7, 4],
  shirtR: [8, 12, 24], shirtY: [26, 21, 6], shirtG: [6, 18, 11], shirtB: [20, 6, 20],
  shirtSh: [5, 4, 7],
});

const ring = makePalette('carnival.ring', {
  ropeR: [28, 6, 8], ropeRs: [15, 2, 4],
  ropeY: [30, 25, 5], ropeYs: [17, 12, 2],
  postHi: [30, 25, 12], post: [22, 15, 5], postDk: [11, 7, 2],
  padR: [26, 5, 8], padRs: [14, 2, 4],
  plank: [17, 11, 6], plankHi: [23, 16, 9], plankDk: [9, 6, 3],
  flagR: [29, 5, 8], flagB: [8, 12, 27], flagY: [30, 26, 5],
});

const floor = makePalette('carnival.canvas', {
  canvasHi: [30, 27, 21], canvas: [27, 23, 16], canvasSh: [22, 17, 11], canvasDk: [13, 9, 6],
  apron: [16, 3, 6], apronHi: [26, 20, 5],
  star: [26, 5, 8], starSh: [22, 17, 11],
  shadow: [19, 15, 10],
  trap: [6, 4, 6], trapHi: [30, 16, 22], rigging: [11, 8, 6],
  sawdust: [24, 19, 12], white: [30, 30, 29],
});

const ROWS = [
  { y: 58, x0: 6, x1: 250, spacing: 11 },
  { y: 70, x0: 10, x1: 246, spacing: 11 },
  { y: 82, x0: 6, x1: 250, spacing: 12 },
];
// bulb strings: [x0, x1, sag, y]
const STRINGS = [[0, 128, 10, 30], [128, 256, 10, 30], [20, 236, 8, 42]];
const TRAPEZE = [128, 30, 18]; // pivot x, pivot y, rope length

function sagY([x0, x1, sag, y], x) { const t = (x - x0) / (x1 - x0); return y + Math.round(4 * sag * t * (1 - t)); }

export default {
  id: 'carnival',
  name: 'THE BIG TOP',
  circuit: 'carnival',
  music: 'carnivalFight',
  palettes: [tent, crowd, ring, floor],
  ring: {
    canvas: ['canvasHi', 'canvas', 'canvasSh', 'canvasDk'],
    ropes: ['ropeR', 'ropeY', 'ropeR'],
    turnbuckles: ['padR', 'padR'],
    pads: ['padR', 'padR'],
  },
  shadowColor: 'shadow',
  crowd: {
    style: 'bleachers',
    density: 0.85,
    excitable: 0.9,
    seed: 1893,
    outline: 'outline',
    rows: ROWS,
    skins: [['skin1', 'skin1s'], ['skin2', 'skin2s'], ['skin3', 'skin3s']],
    hairs: ['hairA', 'hairB', 'hairC', 'hairA'],
    shirts: [['shirtR', 'shirtSh'], ['shirtY', 'shirtSh'], ['shirtG', 'shirtSh'], ['shirtB', 'shirtSh']],
  },

  paintBack(p) {
    // tent canvas: stripes fanning up to the peak (top centre)
    const px = 128, py = -40;
    for (let y = 0; y < 60; y++) for (let x = 0; x < 256; x++) {
      const a = Math.atan2(x - px, y - py);
      const k = Math.floor((a + 2) * 9);
      const shade = y > 48 || (Math.abs(x - 128) > 110 && y > 30);
      p.px(x, y, k % 2 ? (shade ? 'redSh' : 'red') : (shade ? 'creamSh' : 'cream'));
    }
    p.dither(0, 0, 256, 8, 'peak', 0.5);
    p.dither(0, 44, 256, 16, 'dark', 0.25);
    // king poles
    for (const x of [22, 232]) { p.rect(x - 2, 0, 5, 90, 'pole'); p.vline(x - 1, 0, 89, 'poleHi'); for (let y = 6; y < 90; y += 14) p.hline(x - 2, x + 2, y, 'gold'); }
    // trapeze rigging from the peak
    p.line(TRAPEZE[0] - 20, 0, TRAPEZE[0] - 6, TRAPEZE[1], 'rigging'); p.line(TRAPEZE[0] + 20, 0, TRAPEZE[0] + 6, TRAPEZE[1], 'rigging');
    p.rect(TRAPEZE[0] - 8, TRAPEZE[1] - 1, 17, 2, 'rigging');
    // bulb strings (wires; bulbs are palette-animated overlay pixels)
    for (const s of STRINGS) for (let x = s[0]; x < s[1]; x++) p.px(x, sagY(s, x), 'wire');
    // bleachers: tiered planks under each row
    ROWS.forEach((row, i) => {
      p.rect(0, row.y - 3, 256, 5 + i, 'plank');
      p.hline(0, 255, row.y - 3, 'plankHi'); p.hline(0, 255, row.y + 1 + i, 'plankDk');
      for (let x = (i * 9) % 30; x < 256; x += 30) p.vline(x, row.y - 2, row.y + 1 + i, 'plankDk');
    });
    p.rect(0, 50, 256, 6, 'dark');
    // sawdust at ringside
    p.rect(0, 84, 256, 6, 'sawdust'); p.dither(0, 84, 256, 6, 'canvasSh', 0.3);
  },

  paintRing(p) {
    p.rect(0, 88, 256, 4, 'apron');
    for (let x = 0; x < 256; x += 8) p.rect(x, 88, 4, 4, 'apronHi');
    p.hline(0, 255, 88, 'canvasDk');
    p.rect(0, 92, 256, 132, 'canvas');
    p.rect(0, 92, 256, 2, 'canvasHi');
    p.dither(0, 94, 256, 12, 'canvasSh', 0.35);
    p.dither(0, 106, 256, 10, 'canvasSh', 0.12);
    for (const [x, y] of [[36, 136], [214, 156], [80, 206], [180, 196], [124, 124], [24, 186], [232, 120]]) p.dither(x - 8, y - 3, 16, 6, 'canvasSh', 0.3, (i, j) => ((i - x) / 8) ** 2 + ((j - y) / 3) ** 2 < 1);
    // circus ring: a red circle with a big star
    p.ellipse(128, 186, 62, 25, 'star', false);
    p.ellipse(128, 186, 59, 23, 'star', false);
    const st = [];
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? 7 : 17; st.push([128 + Math.cos(a) * rr * 1.6, 186 + Math.sin(a) * rr * 0.62]); }
    p.poly(st, 'star');
    p.text('BIG TOP', 26, 182, 'star', { mono: false });
    p.text('CARNIVAL', 186, 182, 'star', { mono: false });
    p.dither(20, 160, 216, 52, 'canvas', 0.25, (i, j) => p.get(i, j) === p.c('star'));
    // red / gold / red ropes
    const ropes = [[62, 'ropeR', 'ropeRs'], [70, 'ropeY', 'ropeYs'], [78, 'ropeR', 'ropeRs']];
    for (const [y, a, b] of ropes) {
      p.hline(16, 239, y, a); p.hline(16, 239, y + 1, b);
      for (let x = 20; x < 240; x += 6) p.px(x, y + 1, a === 'ropeR' ? 'ropeY' : 'ropeR'); // barber-pole twist
    }
    for (const [y, a, b] of ropes) {
      p.line(12, y, -10, y + 38, a); p.line(12, y + 1, -10, y + 39, b);
      p.line(243, y, 266, y + 38, a); p.line(243, y + 1, 266, y + 39, b);
    }
    // gilded posts, red padded turnbuckles
    for (const x of [8, 241]) {
      p.rect(x, 50, 7, 44, 'postDk');
      p.rect(x + 1, 50, 5, 44, 'post');
      p.vline(x + 2, 51, 92, 'postHi');
      p.rect(x - 1, 57, 9, 27, 'padRs');
      p.rect(x, 58, 7, 25, 'padR');
      p.vline(x + 1, 59, 81, 'ropeY');
      for (const [y] of ropes) p.hline(x, x + 6, y + 2, 'padRs');
      p.rect(x - 1, 92, 9, 3, 'postDk');
      p.ellipse(x + 3, 48, 4, 3, 'postHi');
    }
  },

  paletteAnim(t, live, pal, state) {
    const set = (k, v) => { live[pal.idx(k)] = pal.u32[pal.idx(v)]; };
    // chase: alternate bulbs trade places every 10 frames
    if ((t / 10 | 0) % 2) set('bulbA', 'bulbOff'); else set('bulbB', 'bulbOff');
    if (state.flash > 0) {
      state.flash--;
      set('bulbA', 'white'); set('bulbB', 'white');
      if (state.flash > 4) { set('cream', 'white'); set('canvas', 'canvasHi'); set('plank', 'plankHi'); }
    }
  },

  onReaction(kind, state) {
    if (kind === 'knockdown' || kind === 'ko' || kind === 'star') state.flash = kind === 'star' ? 12 : 24;
  },

  overlay(frame, arena, t, state) {
    const col = (k) => arena.live[arena.pal.idx(k)];
    // the bulbs on their strings
    for (const s of STRINGS) for (let x = s[0] + 3, i = 0; x < s[1]; x += 7, i++) {
      const y = sagY(s, x) + 1;
      frame.rect(x, y, 2, 2, col(i % 2 ? 'bulbA' : 'bulbB'));
    }
    // pennant flags on the pole tops
    for (const x of [22, 232]) {
      const f = (t >> 3) & 1;
      for (let j = 0; j < 5; j++) frame.rect(x + 3, 2 + j, 8 - j - f * (j & 1), 1, col(x < 128 ? 'flagR' : 'flagB'));
    }
    // the trapeze artist swinging high above the ring
    const [tx, ty, L] = TRAPEZE;
    const a = Math.sin(t * 0.035) * 0.9;
    const bx = Math.round(tx + Math.sin(a) * L), by = Math.round(ty + Math.cos(a) * L);
    for (const s of [-6, 6]) { const ax = tx + s; for (let k = 0; k <= 12; k++) frame.px(Math.round(ax + (bx + s - ax) * k / 12), Math.round(ty + (by - ty) * k / 12), col('rigging')); }
    frame.rect(bx - 7, by, 15, 1, col('trap'));
    // acrobat hanging by the knees: legs up over the bar, body below
    frame.rect(bx - 1, by - 3, 3, 3, col('trapHi'));
    frame.rect(bx - 2, by + 1, 5, 6, col('trapHi'));
    frame.rect(bx - 1, by + 7, 3, 3, col('skin1'));
    frame.px(bx - 3, by + 8, col('skin1')); frame.px(bx + 3, by + 8, col('skin1'));
  },
};
