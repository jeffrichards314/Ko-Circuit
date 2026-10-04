// Dream Fight arena: The Championship.
// Full capacity, and every seat is a camera: a dark arena packed to the rafters,
// light rigs on the trusses, and hanging over the far side of the ring the
// undisputed title belt itself in a spotlit glass case, as big as a car. A
// black canvas ring with red, white and blue ropes and gold posts.
// Animated: nonstop camera flashes all over the crowd, far more on knockdowns
// and stars (overlay); a glint that sweeps across the belt's gold plate
// (overlay); the truss lights chase (palette); on a knockdown the whole house
// flashes white.

import { makePalette } from '../../src/engine/palette.js';

const house = makePalette('dream.house', {
  dark: [1, 1, 3], darkHi: [4, 4, 9], tier: [3, 3, 7],
  truss: [9, 9, 12], lampOff: [12, 11, 9], lampOn: [31, 30, 22],
  caseHi: [18, 22, 28], case: [7, 9, 14],
  strapHi: [10, 10, 14], strap: [4, 4, 7],
  plateHi: [31, 30, 18], plate: [29, 22, 5], plateSh: [19, 12, 2],
  gem: [28, 3, 8], beam: [16, 16, 20],
});

const crowd = makePalette('dream.crowd', {
  outline: [1, 1, 3],
  skin1: [28, 21, 15], skin1s: [19, 12, 9],
  skin2: [20, 12, 8], skin2s: [12, 7, 5],
  skin3: [12, 7, 5], skin3s: [7, 4, 3],
  hairA: [3, 3, 3], hairB: [22, 16, 6], hairC: [17, 6, 3],
  shirtR: [22, 4, 6], shirtY: [26, 23, 6], shirtG: [26, 26, 28], shirtB: [5, 8, 22],
  shirtSh: [2, 2, 5],
});

const ring = makePalette('dream.ring', {
  ropeR: [28, 4, 6], ropeRs: [14, 1, 3],
  ropeW: [31, 31, 31], ropeWs: [18, 18, 21],
  ropeB: [5, 10, 29], ropeBs: [2, 4, 15],
  postHi: [31, 29, 14], post: [26, 19, 5], postDk: [13, 8, 2],
  padR: [24, 3, 6], padRs: [12, 1, 3],
  apron: [3, 3, 6], apronHi: [29, 23, 6],
  flash: [31, 31, 31],
});

const floor = makePalette('dream.canvas', {
  canvasHi: [9, 9, 12], canvas: [5, 5, 8], canvasSh: [3, 3, 5], canvasDk: [1, 1, 2],
  logo: [27, 21, 5], logoSh: [15, 10, 2],
  shadow: [2, 2, 3], spotHi: [12, 12, 15],
});

const ROWS = [
  { y: 58, x0: 4, x1: 252, spacing: 9 },
  { y: 68, x0: 8, x1: 248, spacing: 9 },
  { y: 78, x0: 4, x1: 252, spacing: 10 },
  { y: 88, x0: 8, x1: 248, spacing: 10 },
];
const BELT = { x: 198, y: 38 }; // centre of the display case (off to the right, clear of the HUD badges)

export default {
  id: 'dream',
  name: 'THE CHAMPIONSHIP',
  circuit: 'dream',
  music: 'dreamFight',
  palettes: [house, crowd, ring, floor],
  ring: {
    canvas: ['canvasHi', 'canvas', 'canvasSh', 'canvasDk'],
    ropes: ['ropeR', 'ropeW', 'ropeB'],
    turnbuckles: ['padR', 'padR'],
    pads: ['padR', 'padR'],
  },
  shadowColor: 'shadow',
  crowd: {
    style: 'sellout',
    density: 1,
    excitable: 0.95,
    seed: 1,
    outline: 'outline',
    rows: ROWS,
    skins: [['skin1', 'skin1s'], ['skin2', 'skin2s'], ['skin3', 'skin3s']],
    hairs: ['hairA', 'hairB', 'hairC', 'hairA'],
    shirts: [['shirtR', 'shirtSh'], ['shirtY', 'shirtSh'], ['shirtG', 'shirtSh'], ['shirtB', 'shirtSh']],
  },

  paintBack(p) {
    p.rect(0, 0, 256, 92, 'dark');
    // the upper deck: rows of dim faces climbing into the dark
    for (let y = 18; y < 50; y++) p.hline(0, 255, y, (y >> 2) & 1 ? 'tier' : 'dark');
    for (let y = 20; y < 48; y += 3) for (let x = (y * 5) % 4; x < 256; x += 4) p.px(x, y, 'darkHi');
    // truss with a row of lamps
    p.rect(0, 4, 256, 3, 'truss');
    for (let x = 0; x < 256; x += 6) { p.line(x, 4, x + 3, 6, 'dark'); }
    for (let x = 6; x < 256; x += 16) p.rect(x, 7, 5, 3, 'lampOff');
    // light beams down from the rig
    for (const x of [40, 216]) for (let y = 10; y < 50; y++) { const w = (y - 10) * 0.3; p.dither(Math.round(x - w), y, Math.round(w * 2) + 1, 1, 'beam', 0.12); }
    // the title belt in its glass case, hung over the far stands
    const { x, y } = BELT;
    p.rect(x - 36, y - 11, 73, 23, 'case'); p.rect(x - 36, y - 11, 73, 1, 'caseHi'); p.rect(x - 36, y - 11, 1, 23, 'caseHi');
    p.vline(x - 30, 0, y - 12, 'truss'); p.vline(x + 30, 0, y - 12, 'truss');
    p.ellipse(x, y, 33, 5, 'strap'); p.hline(x - 31, x + 31, y - 3, 'strapHi');
    for (const dx of [-21, 21]) { p.ellipse(x + dx, y, 6, 5, 'plateSh'); p.ellipse(x + dx, y - 1, 5, 4, 'plate'); p.ellipse(x + dx, y, 1.6, 1.6, 'gem'); }
    p.ellipse(x, y, 13, 9, 'plateSh'); p.ellipse(x, y - 1, 12, 8, 'plate');
    p.ellipse(x, y - 1, 9, 5.6, 'plateHi', false);
    p.ellipse(x, y - 6, 2, 1.6, 'gem');
    // and on the left, a banner: the champion's record
    p.rect(24, 30, 48, 16, 'case'); p.rect(24, 30, 48, 1, 'caseHi'); p.rect(24, 30, 1, 16, 'caseHi');
    p.text('60-0', 36, 34, 'plate', { mono: false });
  },

  paintRing(p) {
    p.rect(0, 88, 256, 4, 'apron');
    p.text('DREAM FIGHT', 8, 88, 'apronHi', { mono: false });
    p.text('WORLD TITLE', 184, 88, 'apronHi', { mono: false });
    p.hline(0, 255, 88, 'canvasDk');
    p.rect(0, 92, 256, 132, 'canvas');
    p.rect(0, 92, 256, 2, 'canvasHi');
    p.dither(0, 94, 256, 14, 'canvasHi', 0.2);
    // a pool of light in the middle of the ring
    p.dither(40, 130, 176, 80, 'spotHi', 0.25, (i, j) => ((i - 128) / 88) ** 2 + ((j - 170) / 40) ** 2 < 1);
    // the gold crown logo
    const cx = 128, cy = 186;
    p.rect(cx - 16, cy - 2, 33, 7, 'logo');
    for (const dx of [-14, -7, 0, 7, 14]) p.poly([[cx + dx - 3, cy - 2], [cx + dx, cy - 9 - (dx === 0 ? 3 : 0)], [cx + dx + 3, cy - 2]], 'logo');
    p.hline(cx - 16, cx + 16, cy + 4, 'logoSh');
    const ropes = [[62, 'ropeR', 'ropeRs'], [70, 'ropeW', 'ropeWs'], [78, 'ropeB', 'ropeBs']];
    for (const [yy, a, b] of ropes) { p.hline(16, 239, yy, a); p.hline(16, 239, yy + 1, b); }
    for (const [yy, a, b] of ropes) {
      p.line(12, yy, -10, yy + 38, a); p.line(12, yy + 1, -10, yy + 39, b);
      p.line(243, yy, 266, yy + 38, a); p.line(243, yy + 1, 266, yy + 39, b);
    }
    for (const x of [8, 241]) {
      p.rect(x, 50, 7, 44, 'postDk'); p.rect(x + 1, 50, 5, 44, 'post'); p.vline(x + 2, 51, 92, 'postHi');
      p.rect(x - 1, 57, 9, 27, 'padRs'); p.rect(x, 58, 7, 25, 'padR');
      for (const [yy] of ropes) p.hline(x, x + 6, yy + 2, 'padRs');
      p.rect(x - 1, 92, 9, 3, 'postDk');
    }
  },

  // the truss lamps chase; a knockdown flashes the whole house
  paletteAnim(t, live, pal, state) {
    const set = (k, v) => { live[pal.idx(k)] = pal.u32[pal.idx(v)]; };
    if ((t >> 3) & 1) set('lampOff', 'lampOn');
    if (state.flash > 0) { state.flash--; if ((state.flash >> 1) & 1) { set('dark', 'beam'); set('tier', 'beam'); set('canvas', 'canvasHi'); } }
  },

  onReaction(kind, state) {
    if (kind === 'knockdown' || kind === 'ko') { state.flash = 24; state.frenzy = 150; }
    if (kind === 'star') state.frenzy = Math.max(state.frenzy || 0, 70);
  },

  overlay(frame, arena, t, state) {
    const col = (k) => arena.live[arena.pal.idx(k)];
    // the glint sweeping across the belt plate
    const { x, y } = BELT;
    const g = (t % 120) - 20;
    if (g >= 0 && g < 26) for (let k = -7; k <= 7; k++) {
      const X = x - 12 + g + Math.round(k * 0.35), Y = y + k - 1;
      if (((X - x) / 12) ** 2 + ((Y - y + 1) / 8) ** 2 <= 1) frame.px(X, Y, col('flash'));
    }
    if (((t >> 3) % 12) === 0) for (const [dx, dy] of [[0, -3], [0, 3], [-3, 0], [3, 0], [0, 0]]) frame.px(x + 9 + dx, y - 4 + dy, col('flash'));
    // camera flashes: nonstop, and a frenzy after big moments
    if (state.frenzy > 0) state.frenzy--;
    const n = state.frenzy > 0 ? 12 : 5;
    for (let i = 0; i < n; i++) {
      const seed = ((t >> 2) * 131 + i * 977) % 4099;
      if (((t + i * 7) & 3) > 1) continue;
      const fx = (seed * 37) % 252 + 2, fy = 16 + (seed % 72);
      frame.rect(fx, fy, 2, 2, col('flash'));
      if (((t + i) & 7) === 0) { frame.px(fx - 1, fy, col('lampOn')); frame.px(fx + 2, fy + 1, col('lampOn')); }
    }
  },
};
