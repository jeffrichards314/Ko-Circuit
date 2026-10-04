// Major Circuit arena: Grand Garden Arena.
// The big time: a dark bowl packed to the rafters, a lighting truss with neon
// tubes, a hanging video board, glowing neon ropes, and a sea of fans.
// Animated: the neon colour-cycles (palette), camera flashes pop all over the
// crowd (overlay, many more on knockdowns and stars), the video board scrolls
// and shows the action, and the whole crowd jumps on big moments.

import { makePalette } from '../../src/engine/palette.js';
import { rng } from '../../src/engine/arena.js';
import { drawText, textWidth } from '../../src/engine/font.js';

const bowl = makePalette('major.bowl', {
  dark0: [1, 1, 4], dark1: [3, 2, 8], dark2: [5, 4, 12], dark3: [8, 6, 16],
  truss: [9, 10, 14], trussHi: [16, 17, 22],
  neonA: [31, 6, 20], neonB: [8, 24, 31], neonC: [31, 26, 6], neonDim: [8, 4, 12],
  screen: [2, 5, 10], screenHi: [7, 26, 31], screenRed: [31, 6, 6],
  spot: [26, 26, 20], flash: [31, 31, 31],
});

const crowd = makePalette('major.crowd', {
  outline: [1, 1, 3],
  skin1: [29, 21, 16], skin1s: [21, 13, 10],
  skin2: [21, 13, 9], skin2s: [13, 8, 6],
  skin3: [12, 7, 5], skin3s: [7, 4, 3],
  hairA: [3, 2, 3], hairB: [21, 15, 5], hairC: [17, 5, 3],
  shirtR: [21, 4, 8], shirtY: [25, 20, 5], shirtG: [4, 17, 12], shirtB: [6, 9, 23],
  shirtSh: [4, 3, 8],
});

const ring = makePalette('major.ring', {
  ropeC: [10, 28, 31], ropeCs: [3, 13, 20],
  ropeM: [31, 9, 24], ropeMs: [16, 3, 13],
  postHi: [22, 23, 27], post: [11, 12, 16], postDk: [4, 4, 7],
  padHi: [14, 16, 31], pad: [6, 7, 22], padDk: [3, 3, 12],
  rail: [14, 15, 19], railDk: [6, 6, 10],
  press: [9, 9, 12],
});

const floor = makePalette('major.canvas', {
  canvasHi: [12, 17, 29], canvas: [8, 12, 24], canvasSh: [5, 8, 18], canvasDk: [3, 4, 11],
  apron: [2, 2, 6],
  logo: [30, 25, 6], logoSh: [5, 8, 18], logoRed: [26, 5, 8],
  shadow: [4, 6, 15],
  gold: [31, 27, 8], goldDk: [18, 12, 2],
  table: [7, 5, 4], tableHi: [13, 9, 6], white: [30, 30, 30],
});

const ROWS = [
  { y: 50, x0: 4, x1: 252, spacing: 9 },
  { y: 60, x0: 8, x1: 248, spacing: 9 },
  { y: 71, x0: 4, x1: 252, spacing: 10 },
  { y: 83, x0: 10, x1: 246, spacing: 11 },
];
const BOARD = [96, 32, 64, 13]; // x, y, w, h of the video board

export default {
  id: 'major',
  name: 'GRAND GARDEN ARENA',
  circuit: 'major',
  music: 'majorFight',
  palettes: [bowl, crowd, ring, floor],
  ring: {
    canvas: ['canvasHi', 'canvas', 'canvasSh', 'canvasDk'],
    ropes: ['ropeC', 'ropeM', 'ropeC'],
    turnbuckles: ['pad', 'pad'],
    pads: ['pad', 'pad'],
  },
  shadowColor: 'shadow',
  crowd: {
    style: 'packed',
    density: 0.97,
    excitable: 0.95,
    seed: 9001,
    outline: 'outline',
    rows: ROWS,
    skins: [['skin1', 'skin1s'], ['skin2', 'skin2s'], ['skin3', 'skin3s']],
    hairs: ['hairA', 'hairB', 'hairC', 'hairA'],
    shirts: [['shirtR', 'shirtSh'], ['shirtY', 'shirtSh'], ['shirtG', 'shirtSh'], ['shirtB', 'shirtSh']],
  },

  paintBack(p) {
    // the dark bowl: stepped bands, lighter toward the lower tiers
    const bands = [['dark0', 0, 30], ['dark1', 30, 14], ['dark2', 44, 16], ['dark3', 60, 30]];
    for (const [k, y, h] of bands) p.rect(0, y, 256, h, k);
    for (const [k, y] of [['dark1', 29], ['dark2', 43], ['dark3', 59]]) p.dither(0, y - 2, 256, 3, k, 0.4);
    // upper-deck crowd as a speckled silhouette
    const R = rng(4242);
    for (let y = 30; y < 44; y += 3) for (let x = (y % 2) * 2; x < 256; x += 4) if (R() < 0.8) { p.px(x, y, 'dark3'); p.px(x + 1, y, 'dark3'); p.px(x, y - 1, 'dark2'); }
    // aisle stairs
    for (const x of [40, 128, 216]) for (let y = 44; y < 88; y += 3) p.hline(x - 3, x + 3, y, 'dark1');
    // lighting truss with neon tubes
    p.rect(0, 22, 256, 5, 'truss');
    p.hline(0, 255, 22, 'trussHi'); p.hline(0, 255, 26, 'dark0');
    for (let x = 0; x < 256; x += 8) { p.line(x, 23, x + 4, 25, 'dark0'); p.line(x + 4, 23, x + 8, 25, 'dark0'); }
    for (let x = 4; x < 256; x += 24) { p.rect(x, 27, 16, 2, 'neonDim'); }
    // hanging video board
    const [bx, by, bw, bh] = BOARD;
    p.vline(bx + 8, 26, by, 'truss'); p.vline(bx + bw - 9, 26, by, 'truss');
    p.rect(bx - 2, by - 2, bw + 4, bh + 4, 'truss'); p.rect(bx - 1, by - 1, bw + 2, bh + 2, 'dark0');
    p.rect(bx, by, bw, bh, 'screen');
    // press row + ringside tables
    p.rect(0, 84, 256, 6, 'table'); p.hline(0, 255, 84, 'tableHi');
    for (let x = 12; x < 256; x += 40) { p.rect(x, 82, 6, 2, 'press'); p.px(x + 2, 81, 'screenHi'); }
  },

  paintRing(p) {
    p.rect(0, 88, 256, 4, 'apron');
    p.hline(0, 255, 88, 'canvasDk');
    p.rect(0, 92, 256, 132, 'canvas');
    p.rect(0, 92, 256, 2, 'canvasHi');
    p.dither(0, 94, 256, 12, 'canvasSh', 0.35);
    p.dither(0, 106, 256, 10, 'canvasSh', 0.12);
    for (const [x, y] of [[36, 136], [214, 156], [80, 206], [180, 196], [124, 124], [24, 186], [232, 120]]) p.dither(x - 8, y - 3, 16, 6, 'canvasSh', 0.3, (i, j) => ((i - x) / 8) ** 2 + ((j - y) / 3) ** 2 < 1);
    // centre logo: a gold star in a red ring
    p.ellipse(128, 186, 62, 25, 'logoRed', false);
    p.ellipse(128, 186, 58, 22, 'gold', false);
    const star = [];
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? 7 : 17; star.push([128 + Math.cos(a) * rr * 1.6, 186 + Math.sin(a) * rr * 0.62]); }
    p.poly(star, 'gold');
    p.text('MAJOR', 30, 182, 'logo', { mono: false });
    p.text('CIRCUIT', 188, 182, 'logo', { mono: false });
    p.dither(24, 160, 210, 52, 'canvas', 0.22, (i, j) => [p.c('logo'), p.c('gold'), p.c('logoRed')].includes(p.get(i, j)));
    // neon ropes: cyan / magenta / cyan
    const ropes = [[62, 'ropeC', 'ropeCs'], [70, 'ropeM', 'ropeMs'], [78, 'ropeC', 'ropeCs']];
    for (const [y, a, b] of ropes) { p.hline(16, 239, y, a); p.hline(16, 239, y + 1, b); }
    for (const [y, a, b] of ropes) {
      p.line(12, y, -10, y + 38, a); p.line(12, y + 1, -10, y + 39, b);
      p.line(243, y, 266, y + 38, a); p.line(243, y + 1, 266, y + 39, b);
    }
    // chrome posts with padded blue turnbuckles
    for (const x of [8, 241]) {
      p.rect(x, 50, 7, 44, 'postDk');
      p.rect(x + 1, 50, 5, 44, 'post');
      p.vline(x + 2, 51, 92, 'postHi');
      p.rect(x - 1, 57, 9, 27, 'padDk');
      p.rect(x, 58, 7, 25, 'pad');
      p.vline(x + 1, 59, 81, 'padHi');
      for (const [y] of ropes) p.hline(x, x + 6, y + 2, 'padDk');
      p.rect(x - 1, 92, 9, 3, 'postDk');
    }
  },

  paletteAnim(t, live, pal, state) {
    const set = (k, v) => { live[pal.idx(k)] = pal.u32[pal.idx(v)]; };
    // neon cycle: the three tube colours rotate every half second
    const ph = Math.floor(t / 30) % 3;
    const order = [['neonA', 'neonB', 'neonC'], ['neonB', 'neonC', 'neonA'], ['neonC', 'neonA', 'neonB']][ph];
    ['neonA', 'neonB', 'neonC'].forEach((k, i) => { live[pal.idx(k)] = pal.u32[pal.idx(order[i])]; });
    // the neon ropes breathe
    if ((t >> 5) & 1) { set('ropeC', 'ropeCs'); set('ropeM', 'ropeMs'); }
    if (state.flash > 0) {
      state.flash--;
      if (state.flash > 4) { set('dark3', 'dark2'); set('canvas', 'canvasHi'); set('dark2', 'truss'); }
    }
  },

  onReaction(kind, state) {
    if (kind === 'knockdown' || kind === 'ko') { state.flash = 12; state.board = { text: kind === 'ko' ? 'K.O.!!' : 'DOWN!', t: 150 }; state.burst = 60; }
    if (kind === 'star') { state.flash = 7; state.burst = 30; }
  },

  overlay(frame, arena, t, state) {
    const col = (k) => arena.live[arena.pal.idx(k)];
    // neon tubes on the truss
    const keys = ['neonA', 'neonB', 'neonC'];
    for (let i = 0, x = 4; x < 256; x += 24, i++) frame.rect(x, 27, 16, 2, col(keys[i % 3]));
    // video board: scrolling ticker, or the big moment
    const [bx, by, bw, bh] = BOARD;
    const clip = (fx, fy, c) => { if (fx >= bx && fx < bx + bw && fy >= by && fy < by + bh) frame.px(fx, fy, c); };
    const shim = { px: clip };
    if (state.board && state.board.t > 0) {
      state.board.t--;
      const tx = state.board.text, w = textWidth(tx);
      if ((t >> 3) & 1) drawText(shim, tx, bx + (bw - w) / 2, by + 3, col('screenRed'));
    } else {
      const msg = 'GRAND GARDEN ARENA * MAJOR CIRCUIT * SOLD OUT * ';
      const w = textWidth(msg, false);
      const off = Math.floor(t / 2) % w;
      drawText(shim, msg + msg, bx - off, by + 3, col('screenHi'), { mono: false });
    }
    // camera flashes: a few all the time, a storm on big moments
    const n = state.burst > 0 ? 7 : 1;
    if (state.burst > 0) state.burst--;
    if (!state.flashes) state.flashes = [];
    if (Math.random() < (state.burst > 0 ? 0.6 : 0.08)) for (let i = 0; i < n; i++) state.flashes.push({ x: 4 + Math.floor(Math.random() * 248), y: 34 + Math.floor(Math.random() * 46), t: 0 });
    state.flashes = state.flashes.filter((f) => f.t++ < 5);
    for (const f of state.flashes) {
      const c = col('flash'), r = f.t < 2 ? 2 : 1;
      for (let i = -r; i <= r; i++) { frame.px(f.x + i, f.y, c); frame.px(f.x, f.y + i, c); }
    }
  },
};
