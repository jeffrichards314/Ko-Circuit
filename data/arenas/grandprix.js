// Grand Prix arena: The Colosseum.
// The biggest crowd in the game: a colosseum of stone arches climbing four
// tiers into a purple night sky, every arch packed, checkered flags and
// torches along the rim, and a ring pitched on the floor of it: royal purple
// ropes and gold posts on a white canvas with a chequered GP laurel.
// Animated: fireworks burst over the upper stands (overlay), confetti drifts down all
// fight long and comes down in a storm on knockdowns and stars (overlay), the
// torches flicker and the flags wave (palette), and the crowd is five rows deep.

import { makePalette } from '../../src/engine/palette.js';

const bowl = makePalette('grandprix.bowl', {
  sky: [4, 2, 10], skyHi: [8, 4, 16],
  stone: [19, 16, 13], stoneSh: [12, 10, 9], stoneDk: [6, 5, 5], arch: [3, 2, 4],
  flagW: [30, 30, 30], flagK: [4, 4, 5],
  torch: [31, 22, 6], torchHi: [31, 30, 18],
  fwA: [31, 10, 16], fwB: [12, 26, 31], fwC: [31, 28, 8], fwD: [20, 31, 12],
});

const crowd = makePalette('grandprix.crowd', {
  outline: [2, 2, 4],
  skin1: [30, 23, 17], skin1s: [21, 14, 10],
  skin2: [22, 14, 9], skin2s: [14, 8, 6],
  skin3: [13, 8, 5], skin3s: [8, 5, 3],
  hairA: [4, 3, 3], hairB: [24, 18, 7], hairC: [19, 7, 4],
  shirtR: [27, 5, 8], shirtY: [30, 26, 6], shirtG: [18, 6, 26], shirtB: [6, 12, 28],
  shirtSh: [4, 3, 8],
});

const ring = makePalette('grandprix.ring', {
  ropeP: [20, 6, 28], ropePs: [10, 2, 15],
  ropeW: [31, 31, 31], ropeWs: [18, 18, 22],
  postHi: [31, 29, 14], post: [26, 20, 5], postDk: [14, 9, 2],
  padP: [18, 5, 25], padPs: [9, 2, 13],
  apron: [9, 2, 13], apronHi: [30, 26, 8],
  flash: [31, 31, 31],
});

const floor = makePalette('grandprix.canvas', {
  canvasHi: [31, 31, 31], canvas: [28, 28, 29], canvasSh: [22, 22, 25], canvasDk: [11, 10, 14],
  check: [5, 5, 7], laurel: [26, 20, 5],
  shadow: [19, 19, 23],
  confA: [31, 8, 20], confB: [8, 24, 31], confC: [31, 28, 6], confD: [14, 30, 10],
});

const ROWS = [
  { y: 50, x0: 4, x1: 252, spacing: 9 },
  { y: 60, x0: 8, x1: 248, spacing: 9 },
  { y: 70, x0: 4, x1: 252, spacing: 10 },
  { y: 80, x0: 8, x1: 248, spacing: 10 },
  { y: 90, x0: 4, x1: 252, spacing: 11 },
];
const TORCHES = [22, 86, 170, 234];

export default {
  id: 'grandprix',
  name: 'THE COLOSSEUM',
  circuit: 'grandprix',
  music: 'grandprixFight',
  palettes: [bowl, crowd, ring, floor],
  ring: {
    canvas: ['canvasHi', 'canvas', 'canvasSh', 'canvasDk'],
    ropes: ['ropeP', 'ropeW', 'ropeP'],
    turnbuckles: ['padP', 'padP'],
    pads: ['padP', 'padP'],
  },
  shadowColor: 'shadow',
  crowd: {
    style: 'colosseum',
    density: 0.97,
    excitable: 0.95,
    seed: 80,
    outline: 'outline',
    rows: ROWS,
    skins: [['skin1', 'skin1s'], ['skin2', 'skin2s'], ['skin3', 'skin3s']],
    hairs: ['hairA', 'hairB', 'hairC', 'hairA'],
    shirts: [['shirtR', 'shirtSh'], ['shirtY', 'shirtSh'], ['shirtG', 'shirtSh'], ['shirtB', 'shirtSh']],
  },

  paintBack(p) {
    p.rect(0, 0, 256, 100, 'sky');
    p.dither(0, 0, 256, 24, 'skyHi', 0.25);
    for (let i = 0; i < 40; i++) p.px((i * 97) % 256, (i * 29) % 22, 'flagW'); // stars
    // the colosseum: tiers of stone arches, the far side curving down to the rim
    for (let tier = 0; tier < 4; tier++) {
      const y0 = 20 + tier * 18, h = 18;
      p.rect(0, y0, 256, h, tier & 1 ? 'stoneSh' : 'stone');
      p.hline(0, 255, y0, 'stoneDk'); p.hline(0, 255, y0 + 1, tier & 1 ? 'stone' : 'stoneSh');
      const w = 14 + tier * 2, gap = 6;
      for (let x = (tier * 7) % (w + gap) - w; x < 256; x += w + gap) {
        p.rect(x, y0 + 5, w, h - 5, 'arch');
        p.ellipse(x + w / 2, y0 + 6, w / 2, 3, 'arch');
        p.vline(x - 1, y0 + 4, y0 + h - 1, 'stoneDk');
      }
    }
    // checkered flags on poles along the rim
    for (const x of [8, 56, 104, 152, 200, 248]) {
      p.vline(x, 4, 20, 'stoneDk');
      for (let j = 0; j < 6; j++) for (let i = 0; i < 10; i++) p.px(x + 1 + i, 4 + j, ((i >> 1) + (j >> 1)) & 1 ? 'flagK' : 'flagW');
    }
    // torches on the rim
    for (const x of TORCHES) { p.rect(x - 1, 14, 3, 7, 'stoneDk'); p.ellipse(x, 12, 2.5, 3, 'torch'); p.px(x, 11, 'torchHi'); }
  },

  paintRing(p) {
    p.rect(0, 94, 256, 4, 'apron');
    p.text('GRAND PRIX', 8, 94, 'apronHi', { mono: false });
    p.text('GRAND PRIX', 190, 94, 'apronHi', { mono: false });
    p.hline(0, 255, 94, 'canvasDk');
    p.rect(0, 98, 256, 126, 'canvas');
    p.rect(0, 98, 256, 2, 'canvasHi');
    p.dither(0, 100, 256, 12, 'canvasSh', 0.35);
    p.dither(0, 112, 256, 10, 'canvasSh', 0.12);
    // chequered GP laurel
    for (let j = 0; j < 14; j++) for (let i = 0; i < 40; i++) {
      const x = 108 + i, y = 178 + j;
      const inside = ((x - 128) / 20) ** 2 + ((y - 185) / 7) ** 2 <= 1;
      if (inside && ((i >> 2) + (j >> 2)) & 1) p.px(x, y, 'check');
    }
    for (const s of [-1, 1]) for (let k = 0; k < 7; k++) {
      const a = Math.PI / 2 + s * (0.5 + k * 0.3), cx = 128 + Math.cos(a) * 30, cy = 185 - Math.sin(a) * 13;
      p.ellipse(cx, cy, 3.4, 1.8, 'laurel');
    }
    const ropes = [[66, 'ropeP', 'ropePs'], [74, 'ropeW', 'ropeWs'], [82, 'ropeP', 'ropePs']];
    for (const [y, a, b] of ropes) { p.hline(16, 239, y, a); p.hline(16, 239, y + 1, b); }
    for (const [y, a, b] of ropes) {
      p.line(12, y, -10, y + 38, a); p.line(12, y + 1, -10, y + 39, b);
      p.line(243, y, 266, y + 38, a); p.line(243, y + 1, 266, y + 39, b);
    }
    for (const x of [8, 241]) {
      p.rect(x, 54, 7, 44, 'postDk'); p.rect(x + 1, 54, 5, 44, 'post'); p.vline(x + 2, 55, 96, 'postHi');
      p.rect(x - 1, 61, 9, 27, 'padPs'); p.rect(x, 62, 7, 25, 'padP');
      for (const [y] of ropes) p.hline(x, x + 6, y + 2, 'padPs');
      p.rect(x - 1, 98, 9, 3, 'postDk');
    }
  },

  paletteAnim(t, live, pal, state) {
    const set = (k, v) => { live[pal.idx(k)] = pal.u32[pal.idx(v)]; };
    if (((t >> 2) + (t >> 4)) & 1) set('torch', 'torchHi');
    if ((t >> 4) & 1) { set('flagW', 'flagK'); live[pal.idx('flagK')] = pal.u32[pal.idx('flagW')]; }
    if (state.flash > 0) { state.flash--; set('sky', 'skyHi'); if (state.flash > 10) set('canvas', 'canvasHi'); }
  },

  onReaction(kind, state) {
    if (kind === 'knockdown' || kind === 'ko') { state.flash = 30; state.storm = 200; state.volley = 4; }
    if (kind === 'star') { state.storm = Math.max(state.storm || 0, 90); state.volley = Math.max(state.volley || 0, 2); }
  },

  overlay(frame, arena, t, state) {
    const col = (k) => arena.live[arena.pal.idx(k)];
    const FW = ['fwA', 'fwB', 'fwC', 'fwD'];
    // fireworks over the rim: a new shell every so often, more in a volley
    state.shells = state.shells || [];
    if (t % 70 === 0 || (state.volley > 0 && t % 12 === 0)) {
      if (state.volley > 0 && t % 12 === 0) state.volley--;
      const s = (t * 7919) % 997;
      state.shells.push({ x: 20 + (s * 13) % 216, y: 32 + (s % 10), t: 0, c: FW[s % 4], r: 8 + (s % 5) }); // over the upper stands, below the HUD
    }
    state.shells = state.shells.filter((sh) => ++sh.t < 40);
    for (const sh of state.shells) {
      const k = sh.t / 40, r = sh.r * Math.min(1, sh.t / 10);
      for (let a = 0; a < 16; a++) {
        const th = (a / 16) * Math.PI * 2;
        const x = Math.round(sh.x + Math.cos(th) * r), y = Math.round(sh.y + Math.sin(th) * r * 0.8 + k * k * 8);
        if (sh.t < 30 || (sh.t + a) & 1) frame.px(x, y, col(sh.t < 6 ? 'flash' : sh.c));
        if (sh.t < 20) frame.px(Math.round(sh.x + Math.cos(th) * r * 0.6), Math.round(sh.y + Math.sin(th) * r * 0.5 + k * 4), col(sh.c));
      }
    }
    // confetti: a light drift always, a storm after big moments
    if (state.storm > 0) state.storm--;
    const n = 14 + (state.storm > 0 ? 70 : 0), C = ['confA', 'confB', 'confC', 'confD'];
    for (let i = 0; i < n; i++) {
      const seed = (i * 2654435761) >>> 0;
      const sp = 1 + (seed % 3) * 0.5, x = (seed % 256 + Math.round(Math.sin(t * 0.05 + i) * 4) + 256) % 256;
      const y = ((seed >> 8) % 224 + t * sp) % 240 - 12;
      if (y < 0 || y > 223) continue;
      frame.px(x, Math.round(y), col(C[i & 3]));
      if (((t >> 2) + i) & 1) frame.px(x + 1, Math.round(y), col(C[i & 3]));
    }
  },
};
