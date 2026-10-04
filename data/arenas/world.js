// World Circuit arena: World Stadium.
// A sold-out stadium at night: steep tiers of crowd climbing into the dark,
// banks of floodlights on the rim, and a giant video screen over the far
// stands. A royal-blue ring with silver ropes on a white canvas with a globe.
// Animated: two spotlights sweep back and forth across the crowd (overlay),
// the video screen runs a live feed: scrolling circuit banner, a crowd-cam
// cheer meter, and "KNOCKDOWN!" / "STAR!" when they happen (overlay), the
// floodlights pulse, and camera flashes pop in the stands.

import { makePalette } from '../../src/engine/palette.js';
import { drawText, textWidth } from '../../src/engine/font.js';

const bowl = makePalette('world.bowl', {
  sky: [2, 3, 8], skyHi: [4, 6, 13],
  tierA: [6, 8, 15], tierB: [4, 5, 11], rail: [12, 14, 22],
  frame: [9, 10, 14], frameHi: [16, 18, 24],
  screen: [2, 5, 10], pixA: [8, 20, 31], pixB: [31, 26, 6], pixC: [31, 8, 10],
  lamp: [31, 31, 27], lampDim: [20, 21, 20], beam: [22, 24, 26],
});

const crowd = makePalette('world.crowd', {
  outline: [2, 2, 4],
  skin1: [30, 22, 16], skin1s: [21, 14, 10],
  skin2: [22, 14, 9], skin2s: [14, 8, 6],
  skin3: [13, 8, 5], skin3s: [8, 5, 3],
  hairA: [4, 3, 3], hairB: [23, 17, 7], hairC: [18, 7, 4],
  shirtR: [26, 5, 6], shirtY: [29, 25, 6], shirtG: [5, 19, 10], shirtB: [6, 10, 26],
  shirtSh: [4, 4, 8],
});

const ring = makePalette('world.ring', {
  ropeS: [27, 28, 31], ropeSs: [14, 15, 20],
  ropeB: [8, 12, 30], ropeBs: [3, 5, 16],
  postHi: [26, 27, 31], post: [16, 17, 22], postDk: [7, 8, 12],
  padB: [6, 10, 26], padBs: [3, 4, 14],
  apron: [3, 5, 16], apronHi: [26, 27, 31],
  flash: [31, 31, 31],
});

const floor = makePalette('world.canvas', {
  canvasHi: [31, 31, 31], canvas: [27, 28, 30], canvasSh: [21, 22, 26], canvasDk: [11, 12, 17],
  globe: [7, 11, 27], globeSh: [21, 22, 26],
  shadow: [18, 19, 24],
  spot: [30, 30, 25], spotRim: [25, 24, 17],
});

const ROWS = [
  { y: 52, x0: 4, x1: 252, spacing: 10 },
  { y: 64, x0: 8, x1: 248, spacing: 10 },
  { y: 76, x0: 4, x1: 252, spacing: 11 },
  { y: 86, x0: 10, x1: 246, spacing: 11 },
];
// hangs just under the HUD, over the stands; its text runs below y 42 so the
// badges fighters show under the clock (Maestro's tempo) never cover it
const SCREEN = { x: 72, y: 26, w: 112, h: 30 };

export default {
  id: 'world',
  name: 'WORLD STADIUM',
  circuit: 'world',
  music: 'worldFight',
  palettes: [bowl, crowd, ring, floor],
  ring: {
    canvas: ['canvasHi', 'canvas', 'canvasSh', 'canvasDk'],
    ropes: ['ropeS', 'ropeB', 'ropeS'],
    turnbuckles: ['padB', 'padB'],
    pads: ['padB', 'padB'],
  },
  shadowColor: 'shadow',
  crowd: {
    style: 'stadium',
    density: 0.95,
    excitable: 0.9,
    seed: 2026,
    outline: 'outline',
    rows: ROWS,
    skins: [['skin1', 'skin1s'], ['skin2', 'skin2s'], ['skin3', 'skin3s']],
    hairs: ['hairA', 'hairB', 'hairC', 'hairA'],
    shirts: [['shirtR', 'shirtSh'], ['shirtY', 'shirtSh'], ['shirtG', 'shirtSh'], ['shirtB', 'shirtSh']],
  },

  paintBack(p) {
    p.rect(0, 0, 256, 92, 'sky');
    p.dither(0, 0, 256, 20, 'skyHi', 0.2);
    // the upper tiers climbing into the dark, with rails
    for (let y = 18; y < 92; y++) p.hline(0, 255, y, (y >> 2) & 1 ? 'tierA' : 'tierB');
    for (const y of [46, 58, 70, 82]) p.hline(0, 255, y, 'rail');
    // a far crowd of dots in the dark upper tiers
    for (let y = 20; y < 44; y += 3) for (let x = (y * 7) % 5; x < 256; x += 5) p.px(x, y, (x * 13 + y) % 7 === 0 ? 'lampDim' : 'rail');
    // floodlight banks on the rim
    for (const x of [12, 44, 212, 244]) { p.rect(x - 7, 6, 15, 7, 'frame'); for (let i = 0; i < 4; i++) p.rect(x - 6 + i * 4, 7, 3, 2, 'lampDim'); for (let i = 0; i < 4; i++) p.rect(x - 6 + i * 4, 10, 3, 2, 'lampDim'); p.vline(x, 13, 22, 'frame'); }
    // the video screen frame
    const S = SCREEN;
    p.rect(S.x - 4, S.y - 3, S.w + 8, S.h + 8, 'frame');
    p.hline(S.x - 4, S.x + S.w + 3, S.y - 3, 'frameHi');
    p.rect(S.x, S.y, S.w, S.h, 'screen');
    for (const x of [S.x + 8, S.x + S.w - 9]) p.vline(x, 0, S.y - 3, 'frame'); // hanging cables
  },

  paintRing(p) {
    p.rect(0, 88, 256, 4, 'apron');
    p.text('WORLD CIRCUIT', 6, 88, 'apronHi', { mono: false });
    p.text('WORLD CIRCUIT', 176, 88, 'apronHi', { mono: false });
    p.hline(0, 255, 88, 'canvasDk');
    p.rect(0, 92, 256, 132, 'canvas');
    p.rect(0, 92, 256, 2, 'canvasHi');
    p.dither(0, 94, 256, 12, 'canvasSh', 0.35);
    p.dither(0, 106, 256, 10, 'canvasSh', 0.12);
    // the globe logo
    p.ellipse(128, 184, 44, 18, 'globe', false);
    p.ellipse(128, 184, 28, 18, 'globe', false);
    p.ellipse(128, 184, 10, 18, 'globe', false);
    p.hline(84, 172, 184, 'globe');
    p.hline(92, 164, 176, 'globe'); p.hline(92, 164, 192, 'globe');
    p.dither(80, 164, 96, 40, 'canvas', 0.25, (i, j) => p.get(i, j) === p.c('globe'));
    const ropes = [[62, 'ropeS', 'ropeSs'], [70, 'ropeB', 'ropeBs'], [78, 'ropeS', 'ropeSs']];
    for (const [y, a, b] of ropes) { p.hline(16, 239, y, a); p.hline(16, 239, y + 1, b); }
    for (const [y, a, b] of ropes) {
      p.line(12, y, -10, y + 38, a); p.line(12, y + 1, -10, y + 39, b);
      p.line(243, y, 266, y + 38, a); p.line(243, y + 1, 266, y + 39, b);
    }
    for (const x of [8, 241]) {
      p.rect(x, 50, 7, 44, 'postDk'); p.rect(x + 1, 50, 5, 44, 'post'); p.vline(x + 2, 51, 92, 'postHi');
      p.rect(x - 1, 57, 9, 27, 'padBs'); p.rect(x, 58, 7, 25, 'padB');
      for (const [y] of ropes) p.hline(x, x + 6, y + 2, 'padBs');
      p.rect(x - 1, 92, 9, 3, 'postDk');
    }
  },

  paletteAnim(t, live, pal, state) {
    const set = (k, v) => { live[pal.idx(k)] = pal.u32[pal.idx(v)]; };
    if ((t >> 5) & 1) set('lampDim', 'lamp');
    if (state.flash > 0) { state.flash--; set('lampDim', 'lamp'); set('tierA', 'rail'); if (state.flash > 8) set('canvas', 'canvasHi'); }
  },

  onReaction(kind, state) {
    if (kind === 'knockdown' || kind === 'ko') { state.flash = 30; state.feed = 'KNOCKDOWN!'; state.feedT = 150; }
    if (kind === 'star') { state.flash = 12; state.feed = 'STAR!'; state.feedT = 70; }
  },

  overlay(frame, arena, t, state) {
    const col = (k) => arena.live[arena.pal.idx(k)];
    // spotlights sweeping the crowd: dithered cones from the rim, pools on the stands
    const B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    for (const [ox, sp, ph] of [[20, 0.011, 0], [236, 0.009, 2.1]]) {
      const tx = 128 + Math.sin(t * sp + ph) * 110, ty = 70;
      for (let y = 14; y < 92; y++) {
        const k = (y - 14) / (ty - 14);
        const cx = ox + (tx - ox) * k, hw = 2 + k * 12;
        for (let x = Math.floor(cx - hw); x <= cx + hw; x++) {
          if (x < 0 || x > 255) continue;
          const d = Math.abs(x - cx) / hw;
          if (B[(y & 3) * 4 + (x & 3)] / 16 < (0.3 - d * 0.2) * (y > ty - 10 ? 1.6 : 1)) frame.px(x, y, col(d < 0.5 ? 'spot' : 'spotRim'));
        }
      }
    }
    // the video screen feed (frame + screen over the stands)
    const S = SCREEN;
    frame.rect(S.x - 3, S.y - 3, S.w + 6, S.h + 6, col('frame'));
    frame.rect(S.x - 3, S.y - 3, S.w + 6, 1, col('frameHi'));
    frame.rect(S.x, S.y, S.w, S.h, col('screen'));
    if (state.feedT > 0) {
      state.feedT--;
      const c = (t >> 3) & 1 ? col('pixB') : col('pixC');
      const w = textWidth(state.feed, false);
      drawText(frame, state.feed, S.x + (S.w - w) / 2, S.y + 16, c, { mono: false });
    } else {
      const msg = 'WORLD CIRCUIT  *  LIVE  *  ';
      const w = textWidth(msg, false);
      const off = (t >> 1) % w;
      const clip = { px: (x, y, cc) => { if (x >= S.x && x < S.x + S.w) frame.px(x, y, cc); } };
      for (let k = 0; k < 3; k++) drawText(clip, msg, S.x + k * w - off, S.y + 16, col('pixA'), { mono: false });
      // crowd-cam cheer bars
      for (let i = 0; i < 12; i++) {
        const h = 1 + Math.round((Math.sin(t * 0.08 + i * 0.9) + 1) * 2);
        frame.rect(S.x + 8 + i * 8, S.y + S.h - 2 - h, 5, h, col(i % 3 === 0 ? 'pixB' : 'pixA'));
      }
    }
    // camera flashes in the stands
    for (let i = 0; i < 3; i++) {
      const seed = ((t >> 4) * 7 + i * 53) % 997;
      if (((t + i * 11) & 15) < 2) frame.rect((seed * 37) % 250 + 2, 48 + (seed % 38), 2, 2, col('flash'));
    }
  },
};
