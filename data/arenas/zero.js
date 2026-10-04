// ZERO's arena: Nothing.
// A silent white void. No walls, no stands, no crowd, no sound: the ring just
// sits on a faint horizon line in an endless pale grey-white, and there is no
// music at all until round 2 (musicFrom). The canvas is white, the ropes are
// thin grey lines, the posts plain white.
// Animated: faint motes drift upward through the void (overlay); a ripple
// spreads slowly across the canvas from under him, like something dropped in
// still water (overlay); the horizon breathes, lighter and darker (palette).
// On a knockdown the void flashes to black for a moment.

import { makePalette } from '../../src/engine/palette.js';

const sky = makePalette('zero.void', {
  white: [31, 31, 31], w1: [29, 29, 30], w2: [27, 27, 29], w3: [25, 25, 27],
  horizon: [21, 21, 24], horizonHi: [24, 24, 27], mote: [18, 18, 22],
  black: [1, 1, 2],
});
const ring = makePalette('zero.ring', {
  rope: [17, 17, 20], ropeS: [23, 23, 26],
  postHi: [31, 31, 31], post: [26, 26, 28], postDk: [19, 19, 22],
  apron: [24, 24, 27], apronText: [19, 19, 22],
});
const floor = makePalette('zero.canvas', {
  canvasHi: [31, 31, 31], canvas: [29, 29, 30], canvasSh: [26, 26, 28], canvasDk: [22, 22, 25],
  ripple: [24, 24, 27], shadow: [23, 23, 26],
});

const MOTES = Array.from({ length: 22 }, (_, i) => ({ x: (i * 89 + 11) % 252 + 2, s: 0.12 + ((i * 7) % 5) * 0.05, o: (i * 131) % 400 }));

export default {
  id: 'zero',
  name: 'NOTHING',
  circuit: 'zero',
  music: 'zeroFight',
  musicFrom: 2, // silence until round 2
  palettes: [sky, ring, floor],
  ring: {
    canvas: ['canvasHi', 'canvas', 'canvasSh', 'canvasDk'],
    ropes: ['rope', 'rope', 'rope'],
    turnbuckles: ['post', 'post'],
    pads: ['post', 'post'],
  },
  shadowColor: 'shadow',
  crowd: null,

  paintBack(p) {
    const bands = ['white', 'w1', 'w2', 'w3'];
    for (let y = 0; y < 92; y++) {
      const k = Math.min(3, Math.floor(y / 20));
      p.hline(0, 255, y, bands[k]);
      if (k < 3 && y % 20 > 15) for (let x = (y & 1); x < 256; x += 2) p.px(x, y, bands[k + 1]);
    }
    p.hline(0, 255, 58, 'horizon');
    p.hline(0, 255, 57, 'horizonHi');
  },

  paintRing(p) {
    p.rect(0, 88, 256, 4, 'apron');
    p.text('0', 124, 88, 'apronText', { mono: false });
    p.rect(0, 92, 256, 132, 'canvas');
    p.rect(0, 92, 256, 2, 'canvasHi');
    p.dither(0, 94, 256, 12, 'canvasSh', 0.15);
    p.dither(0, 200, 256, 24, 'canvasSh', 0.25);
    for (const yy of [62, 70, 78]) {
      p.hline(16, 239, yy, 'rope'); p.hline(16, 239, yy + 1, 'ropeS');
      p.line(12, yy, -10, yy + 38, 'rope');
      p.line(243, yy, 266, yy + 38, 'rope');
    }
    for (const x of [8, 241]) {
      p.rect(x, 50, 7, 44, 'postDk'); p.rect(x + 1, 50, 5, 44, 'post'); p.vline(x + 2, 51, 92, 'postHi');
    }
  },

  // the horizon breathes; a knockdown flashes the void black
  paletteAnim(t, live, pal, state) {
    const set = (k, v) => { live[pal.idx(k)] = pal.u32[pal.idx(v)]; };
    if (((t >> 6) & 3) === 2) { set('horizon', 'mote'); set('horizonHi', 'horizon'); }
    if (state.flash > 0) {
      state.flash--;
      if ((state.flash >> 2) & 1) for (const k of ['white', 'w1', 'w2', 'w3', 'horizonHi']) set(k, 'black');
    }
  },

  onReaction(kind, state) {
    if (kind === 'knockdown' || kind === 'ko') state.flash = 16;
  },

  overlay(frame, arena, t) {
    const col = (k) => arena.live[arena.pal.idx(k)];
    // motes drifting up through the void
    for (const m of MOTES) {
      const y = 90 - ((t * m.s + m.o) % 92);
      frame.px(m.x + Math.round(Math.sin((t + m.o) / 40) * 2), Math.round(y), col('mote'));
    }
    // a slow ripple across the canvas, out from under him
    const r = (t % 240) / 240;
    const rx = 20 + r * 110, ry = 5 + r * 26;
    if (r < 0.92) for (let a = 0; a < 160; a++) {
      const th = (a / 160) * Math.PI * 2;
      const x = Math.round(128 + Math.cos(th) * rx), y = Math.round(196 + Math.sin(th) * ry);
      if (y > 95 && y < 224 && (a & 1)) frame.px(x, y, col('ripple'));
    }
  },
};
