// Legends Circuit arena: The Hall of Fame.
// A dark marble hall of honour: a wall of gold-framed portraits of past
// champions (each one a silhouette with its own hat, hair or crown), a gold
// banner with a laurel hanging between every pair, black marble pillars, and
// a crowd in evening dress. A black ring with gold ropes on an ivory canvas
// with a laurel wreath.
// Animated: a slow picture light moves from portrait to portrait (palette),
// the banners ripple (overlay), the portrait of whoever you're fighting next
// in history gets a glint (overlay), and on knockdowns and stars every
// picture light blazes and the banners flare gold.

import { makePalette } from '../../src/engine/palette.js';

const hall = makePalette('legends.hall', {
  marble: [5, 4, 7], marbleHi: [10, 9, 13], vein: [15, 14, 18],
  goldHi: [31, 29, 16], gold: [26, 19, 5], goldDk: [15, 9, 2],
  canvasP: [9, 8, 9], lit: [22, 18, 12], dim: [13, 10, 8],
  bannerHi: [29, 22, 6], banner: [22, 14, 3], bannerDk: [12, 7, 1],
  sil: [3, 2, 3], plaque: [20, 15, 6],
});

const crowd = makePalette('legends.crowd', {
  outline: [2, 2, 3],
  skin1: [30, 23, 17], skin1s: [22, 14, 11],
  skin2: [22, 14, 9], skin2s: [14, 8, 6],
  skin3: [14, 9, 6], skin3s: [9, 5, 3],
  hairA: [4, 3, 3], hairB: [26, 26, 26], hairC: [18, 11, 5],
  shirtR: [3, 3, 5], shirtY: [28, 27, 25], shirtG: [18, 3, 6], shirtB: [6, 6, 12],
  shirtSh: [1, 1, 2],
});

const ring = makePalette('legends.ring', {
  ropeG: [31, 26, 9], ropeGs: [18, 12, 3],
  ropeW: [30, 30, 28], ropeWs: [18, 18, 18],
  postHi: [31, 28, 14], post: [24, 17, 5], postDk: [12, 8, 2],
  padK: [6, 5, 7], padKs: [2, 2, 3],
  apron: [4, 3, 5], apronHi: [28, 21, 6],
  flash: [31, 31, 31],
});

const floor = makePalette('legends.canvas', {
  canvasHi: [31, 30, 27], canvas: [28, 26, 22], canvasSh: [22, 20, 16], canvasDk: [12, 10, 8],
  laurel: [24, 18, 5], laurelSh: [22, 20, 16],
  shadow: [19, 17, 13],
  carpet: [14, 2, 4], carpetHi: [20, 4, 7],
});

const ROWS = [
  { y: 66, x0: 6, x1: 250, spacing: 11 },
  { y: 78, x0: 10, x1: 246, spacing: 11 },
  { y: 88, x0: 4, x1: 252, spacing: 12 },
];
// portrait frames along the wall: [x, style] (each silhouette is an old champ)
const FRAMES = [[14, 'cap'], [46, 'chef'], [78, 'hat'], [110, 'bald'], [146, 'top'], [178, 'crown'], [210, 'bun'], [242, 'spiky']];
const BANNERS = [62, 128, 194]; // hung over the pillars, between the portraits

export default {
  id: 'legends',
  name: 'THE HALL OF FAME',
  circuit: 'legends',
  music: 'legendsFight',
  palettes: [hall, crowd, ring, floor],
  ring: {
    canvas: ['canvasHi', 'canvas', 'canvasSh', 'canvasDk'],
    ropes: ['ropeG', 'ropeW', 'ropeG'],
    turnbuckles: ['padK', 'padK'],
    pads: ['padK', 'padK'],
  },
  shadowColor: 'shadow',
  crowd: {
    style: 'evening',
    density: 0.85,
    excitable: 0.7,
    seed: 1968,
    outline: 'outline',
    rows: ROWS,
    skins: [['skin1', 'skin1s'], ['skin2', 'skin2s'], ['skin3', 'skin3s']],
    hairs: ['hairA', 'hairB', 'hairC', 'hairB'],
    shirts: [['shirtR', 'shirtSh'], ['shirtY', 'shirtSh'], ['shirtG', 'shirtSh'], ['shirtB', 'shirtSh']],
  },

  paintBack(p) {
    // black marble with pale veins
    p.rect(0, 0, 256, 96, 'marble');
    for (let i = 0; i < 18; i++) {
      let x = (i * 53) % 256, y = (i * 17) % 60;
      for (let k = 0; k < 26; k++) { p.px(x, y, 'vein'); x += ((k * 7 + i) % 3) - 1; y += 1; }
    }
    p.dither(0, 0, 256, 96, 'marbleHi', 0.1);
    // gold cornice and skirting
    p.rect(0, 30, 256, 2, 'goldDk'); p.hline(0, 255, 30, 'gold');
    p.rect(0, 58, 256, 3, 'goldDk'); p.hline(0, 255, 58, 'goldHi');
    // pillars between the frames
    for (const x of [30, 62, 94, 128, 162, 194, 226]) {
      p.rect(x - 3, 31, 7, 27, 'marbleHi'); p.vline(x - 2, 31, 57, 'vein'); p.vline(x + 3, 31, 57, 'marble');
      p.rect(x - 4, 31, 9, 2, 'gold'); p.rect(x - 4, 55, 9, 2, 'gold');
    }
    // the portraits of past champions
    for (const [x, style] of FRAMES) portrait(p, x, 36, style);
  },

  paintRing(p) {
    p.rect(0, 92, 256, 4, 'apron');
    p.text('HALL OF FAME', 8, 92, 'apronHi', { mono: false });
    p.text('LEGENDS', 196, 92, 'apronHi', { mono: false });
    p.hline(0, 255, 92, 'canvasDk');
    p.rect(0, 96, 256, 128, 'canvas');
    p.rect(0, 96, 256, 2, 'canvasHi');
    p.dither(0, 98, 256, 12, 'canvasSh', 0.35);
    p.dither(0, 110, 256, 10, 'canvasSh', 0.12);
    // laurel wreath
    for (const s of [-1, 1]) for (let k = 0; k < 9; k++) {
      const a = Math.PI / 2 + s * (0.35 + k * 0.28), cx = 128 + Math.cos(a) * 34, cy = 186 - Math.sin(a) * 16;
      p.ellipse(cx, cy, 4, 2.2, 'laurel');
      p.ellipse(cx + s * 2, cy - 1, 1.4, 0.8, 'laurelSh');
    }
    p.text('LEGENDS', 128 - 22, 183, 'laurel', { mono: false });
    const ropes = [[64, 'ropeG', 'ropeGs'], [72, 'ropeW', 'ropeWs'], [80, 'ropeG', 'ropeGs']];
    for (const [y, a, b] of ropes) { p.hline(16, 239, y, a); p.hline(16, 239, y + 1, b); }
    for (const [y, a, b] of ropes) {
      p.line(12, y, -10, y + 38, a); p.line(12, y + 1, -10, y + 39, b);
      p.line(243, y, 266, y + 38, a); p.line(243, y + 1, 266, y + 39, b);
    }
    for (const x of [8, 241]) {
      p.rect(x, 52, 7, 44, 'postDk'); p.rect(x + 1, 52, 5, 44, 'post'); p.vline(x + 2, 53, 94, 'postHi');
      p.rect(x - 1, 59, 9, 27, 'padKs'); p.rect(x, 60, 7, 25, 'padK');
      for (const [y] of ropes) p.hline(x, x + 6, y + 2, 'postDk');
      p.rect(x - 1, 96, 9, 3, 'postDk');
    }
  },

  // a picture light that walks from portrait to portrait
  paletteAnim(t, live, pal, state) {
    const set = (k, v) => { live[pal.idx(k)] = pal.u32[pal.idx(v)]; };
    if (state.blaze > 0) { state.blaze--; set('dim', 'lit'); set('banner', 'bannerHi'); if (state.blaze > 20) set('canvas', 'canvasHi'); }
  },

  onReaction(kind, state) {
    if (kind === 'knockdown' || kind === 'ko') state.blaze = 60;
    if (kind === 'star') state.blaze = Math.max(state.blaze || 0, 24);
  },

  overlay(frame, arena, t, state) {
    const col = (k) => arena.live[arena.pal.idx(k)];
    // the lit portrait: its canvas glows, a cone of light from the lamp above
    const lit = Math.floor(t / 150) % FRAMES.length;
    const [lx] = FRAMES[lit];
    frame.rect(lx - 9, 34, 19, 1, col('goldHi'));
    const B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    for (let y = 35; y < 56; y++) for (let x = lx - 10; x <= lx + 10; x++) {
      const k = (y - 35) / 21, hw = 3 + k * 8;
      if (Math.abs(x - lx) <= hw && B[(y & 3) * 4 + (x & 3)] / 16 < 0.18 * (1 - k * 0.5)) frame.px(x, y, col('lit'));
    }
    if (((t >> 4) & 7) === 0) { frame.px(lx + 6, 40, col('flash')); frame.px(lx + 5, 41, col('flash')); frame.px(lx + 7, 41, col('flash')); frame.px(lx + 6, 42, col('flash')); }
    // gold banners hanging from the cornice, rippling
    for (let i = 0; i < BANNERS.length; i++) {
      const bx = BANNERS[i];
      for (let y = 0; y < 22; y++) {
        const off = Math.round(Math.sin(t * 0.06 + y * 0.35 + i) * (y / 22) * 1.6);
        const w = 11 - (y > 17 ? (y - 17) * 2 : 0);
        for (let x = 0; x < w; x++) {
          const X = bx - 5 + x + off + (y > 17 ? y - 17 : 0), Y = 32 + y;
          const edge = x === 0 || x === w - 1;
          frame.px(X, Y, col(edge ? 'bannerDk' : (x + (y >> 2)) & 3 ? 'banner' : 'bannerHi'));
        }
      }
      // laurel emblem
      const ex = bx + Math.round(Math.sin(t * 0.06 + 3 + i) * 0.8), ey = 40;
      for (const [dx, dy] of [[-3, 0], [-3, 1], [-2, 2], [-1, 3], [3, 0], [3, 1], [2, 2], [1, 3], [0, -1]]) frame.px(ex + dx, ey + dy, col('goldHi'));
      frame.rect(bx - 6, 31, 13, 1, col('goldHi'));
    }
  },
};

// A framed portrait of an old champion: a silhouette on a warm-lit canvas.
function portrait(p, cx, top, style) {
  p.rect(cx - 9, top, 19, 20, 'gold'); p.rect(cx - 8, top + 1, 17, 18, 'goldDk');
  p.rect(cx - 7, top + 2, 15, 16, 'dim');
  p.hline(cx - 9, cx + 9, top, 'goldHi'); p.vline(cx - 9, top, top + 19, 'goldHi');
  // head + shoulders
  p.ellipse(cx, top + 9, 3.6, 4, 'sil');
  p.rect(cx - 6, top + 14, 13, 4, 'sil'); p.rect(cx - 2, top + 12, 5, 3, 'sil');
  if (style === 'cap') { p.rect(cx - 4, top + 5, 9, 2, 'sil'); p.rect(cx + 2, top + 7, 4, 1, 'sil'); }
  if (style === 'chef') { p.rect(cx - 3, top + 2, 7, 4, 'sil'); p.ellipse(cx, top + 3, 4, 2, 'sil'); }
  if (style === 'hat') { p.rect(cx - 6, top + 6, 13, 1, 'sil'); p.rect(cx - 3, top + 3, 7, 3, 'sil'); }
  if (style === 'top') { p.rect(cx - 5, top + 6, 11, 1, 'sil'); p.rect(cx - 3, top + 1, 7, 5, 'sil'); }
  if (style === 'crown') for (const dx of [-3, 0, 3]) p.vline(cx + dx, top + 3, top + 5, 'sil');
  if (style === 'bun') p.ellipse(cx, top + 4, 2, 2, 'sil');
  if (style === 'spiky') for (const dx of [-3, -1, 1, 3]) p.px(cx + dx, top + 4, 'sil');
  // brass name plaque
  p.rect(cx - 4, top + 20, 9, 2, 'plaque');
}
