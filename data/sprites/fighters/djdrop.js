// DJ Drop: sprite layers on the medium build.
// Club DJ: a backwards purple snapback under big neon-green headphones, dark
// shades, a thin goatee, a gold rope chain with a vinyl-record medallion, an
// open sleeveless purple track top, black trunks with a neon equalizer, white
// high-tops, neon-green gloves. `cueUp` (one glove on the ear cup, nodding) is
// his hold pose while the beat counts in; his real tell is the sound.

import { makePalette } from '../../../src/engine/palette.js';
import { brows, mouth, ears, skull, nose } from './_face.js';

const A = makePalette('djdrop.A', {
  outline: [2, 2, 4],
  skinHi: [24, 16, 11], skin: [18, 11, 7], skinSh: [12, 7, 5], skinDk: [6, 3, 3],
  white: [31, 31, 31], mouth: [11, 2, 4],
  hairHi: [8, 6, 6], hair: [3, 2, 3],
  gloveHi: [22, 31, 12], glove: [11, 27, 5], gloveDk: [4, 15, 3],
  lensHi: [14, 20, 30],
});
const B = makePalette('djdrop.B', {
  topHi: [21, 11, 29], top: [14, 5, 22], topDk: [7, 2, 13],
  blackHi: [9, 9, 13], black: [4, 4, 7],
  goldHi: [31, 30, 14], gold: [29, 22, 4], goldDk: [17, 10, 2],
  vinyl: [2, 2, 3], label: [30, 6, 12],
  eqG: [11, 29, 6], eqY: [31, 27, 4], eqR: [31, 7, 6],
  shoe: [28, 28, 30], shoeSh: [17, 17, 21],
});
export const palettes = { djdrop: { A, B } };

const poses = {
  // counting in the beat: glove on the ear cup, head down, nodding
  cueUp: {
    extends: 'idle1', shift: [0, 1],
    head: { at: [-1, -99], face: 'focus', tilt: 'down', look: [-1, 1] },
    elL: [-30, -80], fiL: [-15, -100], gloveL: { angle: 30 },
  },
  // taunt: scratching an invisible deck
  scratch1: {
    extends: 'idle1', shift: [0, 1],
    head: { at: [0, -99], face: 'grin', tilt: 'down', look: [0, 1] },
    elR: [26, -66], fiR: [10, -68], gloveR: { angle: -80 },
    elL: [-30, -80], fiL: [-15, -100], gloveL: { angle: 30 },
  },
  scratch2: {
    extends: 'scratch1',
    elR: [28, -64], fiR: [20, -66], gloveR: { angle: -100 },
  },
  raiseRoof: {
    extends: 'idle1',
    head: { at: [0, -101], face: 'grin', look: [0, -1] },
    elL: [-31, -94], elR: [31, -94], fiL: [-16, -112], fiR: [16, -112],
    gloveL: { angle: 80 }, gloveR: { angle: -80 },
  },
};

export default {
  id: 'djdrop',
  build: 'medium',
  // his own body on the build: slim and loose: narrow waist, long legs
  body: { size: [0.97, 1], legLen: 1.03, dims: { belly: 3, waistW: 15 } },
  palettes: { default: 'djdrop' },
  torsoMaterial: 'skin',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['white', 'shoe', 'shoeSh', 'blackHi'],
    shorts: ['blackHi', 'black', 'vinyl'],
    sock: ['white', 'shoe', 'shoeSh'],
    boot: ['white', 'shoe', 'shoeSh'],
    sole: ['shoeSh', 'blackHi', 'outline'],
    hair: ['hairHi', 'hair', 'outline'],
    top: ['topHi', 'top', 'topDk', 'outline'],
    gold: ['goldHi', 'gold', 'goldDk'],
    phones: ['gloveHi', 'glove', 'gloveDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    ears(ctx, H, ramps.skin, [2.4, 3.4]);
    skull(ctx, H, ramps.skin, 'chin');
    // backwards snapback: crown + the strap arch over the forehead
    const cap = ctx.mask().ellipse(x + lx * 0.3, y - 6, H.rx + 1, 8).cut(ctx.mask().rect(x - 14, y - 4, 28, 12));
    cv.part(cap, { ramp: ramps.top, bevel: 4 });
    cv.line(x - 4, y - 5, x + 4, y - 5, (X, Y) => cv.px(X, Y, c('topDk')));
    cv.px(x, y - 6, c('goldHi'));
    // shades
    if (!['hurt', 'ko', 'dazed'].includes(face)) {
      const sh = ctx.mask().rect(fx - 9, fy - 2, 8, 4).rect(fx + 1, fy - 2, 8, 4).rect(fx - 1, fy - 2, 2, 1);
      cv.flat(sh, c('black'), true);
      cv.px(fx - 7, fy - 1, c('lensHi')); cv.px(fx - 6, fy - 1, c('lensHi')); cv.px(fx + 3, fy - 1, c('lensHi'));
    } else {
      // shades knocked askew
      cv.flat(ctx.mask().rect(fx - 9, fy - 5, 8, 3).rect(fx + 1, fy - 4, 8, 3), c('black'), true);
      cv.px(fx - 5, fy + 1, c('outline')); cv.px(fx + 4, fy + 1, c('outline'));
    }
    brows(ctx, fx, fy, face, ramps.hair, { len: 4, thick: 0.9, y: -4.6 });
    nose(ctx, fx, fy, ramps.skin, [2.4, 2.2], 3.6);
    mouth(ctx, fx, fy + 8, face === 'neutral' ? 'grin' : face, { w: 3.4 });
    // thin goatee
    cv.part(ctx.mask().rect(fx - 1, fy + 11, 3, 3), { ramp: ramps.hair, bevel: 1, inner: 'line', shadow: false });
    // headphones: band over the cap, big ear cups
    const band = ctx.mask().ellipse(x, y - 4, H.rx + 2.5, 10).cut(ctx.mask().ellipse(x, y - 4, H.rx + 0.5, 8.4)).cut(ctx.mask().rect(x - 16, y - 2, 32, 12));
    cv.part(band, { ramp: ramps.phones, bevel: 1, inner: 'line', shadow: false });
    for (const s of [-1, 1]) {
      const cx = x + s * (H.rx + 1.5) + lx * 0.3, cy = y;
      cv.part(ctx.mask().ellipse(cx, cy, 3.4, 4.6), { ramp: ramps.phones, bevel: 2 });
      cv.px(cx, cy - 1, c('black')); cv.px(cx, cy, c('black'));
    }
  },

  torso(ctx) {
    const { cv, J, c, ramps, D, pose } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, h = J.hip;
    const tm = ctx.torsoMask;
    // open sleeveless track top: two panels at the sides
    for (const s of [-1, 1]) {
      const pnl = ctx.mask().poly([
        [n[0] + s * 7, n[1] + 1], [J['sh' + (s < 0 ? 'L' : 'R')][0], J['sh' + (s < 0 ? 'L' : 'R')][1] - 3],
        [ch[0] + s * (D.chestW + 3), ch[1]], [w[0] + s * (D.waistW + 2), w[1] + 1], [w[0] + s * 8, w[1] + 1], [ch[0] + s * 8, ch[1] - 4],
      ]).clip(tm);
      cv.part(pnl, { ramp: ramps.top, bevel: 3, inner: 'line' });
      cv.line(ch[0] + s * 9, ch[1] - 3, w[0] + s * 9, w[1], (X, Y) => { if (pnl.in(X, Y)) cv.px(X, Y, c('white')); });
    }
    // abs
    for (const dy of [4, 9]) { cv.shade(w[0] - 3, ch[1] + dy, 1); cv.shade(w[0] + 3, ch[1] + dy, 1); }
    cv.line(w[0], ch[1] + 1, w[0], w[1] - 2, (X, Y) => cv.shade(X, Y, 1));
    // gold rope chain + vinyl record medallion
    if (!pose.lying) {
      cv.line(n[0] - 6, n[1] + 2, ch[0], ch[1] - 2, (X, Y) => cv.px(X, Y, c((X + Y) & 1 ? 'gold' : 'goldHi')));
      cv.line(n[0] + 6, n[1] + 2, ch[0], ch[1] - 2, (X, Y) => cv.px(X, Y, c((X + Y) & 1 ? 'gold' : 'goldHi')));
      const [rx, ry] = [Math.round(ch[0]), Math.round(ch[1] + 2)];
      cv.part(ctx.mask().ellipse(rx, ry, 4.4, 4.4), { ramp: ['blackHi', 'vinyl', 'vinyl'].map(c), bevel: 2, inner: 'line' });
      cv.flat(ctx.mask().ellipse(rx, ry, 1.6, 1.6), c('label'));
      cv.px(rx - 2, ry - 3, c('blackHi')); cv.px(rx - 3, ry - 2, c('blackHi'));
    }
    // neon equalizer on the trunks
    const sm = ctx.shortsMask;
    const bars = [3, 5, 2, 6, 4, 7, 3, 5, 2];
    bars.forEach((hgt, i) => {
      const X = Math.round(h[0] - 12 + i * 3);
      for (let k = 0; k < hgt; k++) {
        const Y = Math.round(h[1] + 8 - k);
        if (sm.in(X, Y)) cv.px(X, Y, c(k > 5 ? 'eqR' : k > 3 ? 'eqY' : 'eqG'));
      }
    });
  },
};
