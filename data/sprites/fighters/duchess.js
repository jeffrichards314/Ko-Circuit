// Duchess Kane: sprite layers on the lean build.
// Old money in the ring: silver-blonde hair swept up into a tall chignon under
// a little gold tiara with a violet stone, long lashes and a beauty mark, a
// pearl choker, a violet satin top with a white lace edge, violet trunks with
// gold piping, long white stockings and violet boots,
// lilac gloves with white lace cuffs. Props: a teacup and saucer (tea1/2), a folding fan (victory).
// Poses borrow the champions' signatures: the snap, the whip-crack call, the lunge.

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './_face.js';

const A = makePalette('duchess.A', {
  outline: [3, 2, 4],
  skinHi: [31, 26, 22], skin: [29, 21, 17], skinSh: [22, 14, 13], skinDk: [13, 7, 9],
  white: [31, 31, 31], mouth: [24, 4, 10],
  hairHi: [31, 31, 26], hair: [26, 25, 20], hairDk: [17, 16, 14],
  gloveHi: [30, 24, 31], glove: [24, 15, 29], gloveDk: [13, 7, 18],
  lash: [4, 2, 6], gold: [31, 25, 8],
});
const B = makePalette('duchess.B', {
  satinHi: [24, 13, 30], satin: [16, 6, 22], satinDk: [8, 2, 12],
  pearl: [30, 29, 27], gem: [22, 6, 31],
  stockHi: [31, 31, 31], stock: [26, 25, 28],
  bootHi: [20, 10, 26], boot: [12, 4, 17], bootDk: [6, 1, 9],
  china: [30, 31, 31], goldDk: [21, 14, 3],
});
export const palettes = { duchess: { A, B } };

const poses = {
  // Midnight's snap, borrowed: right glove up by the ear
  snapTell: {
    extends: 'idle1',
    head: { at: [-1, -100], face: 'grin', look: [-1, 0] },
    elR: [31, -80], fiR: [26, -100], gloveR: { angle: -20, view: 'back' },
    elL: [-24, -60], fiL: [-11, -72],
  },
  // Rex's whip-crack call: left arm flung up high
  callTell: {
    extends: 'idle1', shift: [1, 0],
    head: { at: [1, -101], face: 'wide', tilt: 'up', look: [-1, -1] },
    elL: [-30, -96], fiL: [-24, -116], gloveL: { angle: 10 },
    elR: [25, -60], fiR: [12, -72],
  },
  // the Baron's lunge: weight back, glove cocked
  lungeTell: {
    extends: 'jabTell', shift: [3, 2],
    knL: [-12, -22], knR: [16, -20], ftL: [-18, 0], ftR: [18, 0],
    head: { at: [2, -97], face: 'focus', look: [-1, 0] },
    elL: [-22, -66], fiL: [-6, -78],
  },
  lunge: {
    extends: 'jab', shift: [-3, 4],
    knL: [-20, -18], knR: [12, -22], ftL: [-24, 0], ftR: [16, 0],
    fiL: [-2, -64], gloveL: { view: 'front', size: 1.6 },
  },
  // tea time: saucer in the left glove, cup to her lips
  tea1: {
    extends: 'idle1',
    head: { at: [0, -100], face: 'neutral', look: [0, 1] },
    elL: [-22, -60], fiL: [-8, -70], gloveL: { angle: 80 },
    elR: [24, -70], fiR: [8, -86], gloveR: { angle: -60 },
    tea: 1,
  },
  tea2: {
    extends: 'tea1',
    head: { at: [0, -100], face: 'grin', tilt: 'up', look: [0, -1] },
    fiR: [7, -89],
    tea: 2,
  },
  curtsy: {
    extends: 'idle1', shift: [0, 4],
    knL: [-10, -19], knR: [8, -17], ftL: [-6, 0], ftR: [14, 0],
    head: { at: [2, -95], face: 'grin', tilt: 'down', look: [1, 1] },
    elL: [-30, -56], elR: [30, -56], fiL: [-40, -44], fiR: [40, -44],
  },
  fan: {
    extends: 'idle1',
    head: { at: [0, -100], face: 'grin', look: [-1, 0] },
    elR: [26, -76], fiR: [10, -94], gloveR: { angle: -30 },
    elL: [-28, -60], fiL: [-20, -48], gloveL: { angle: 170 },
    fan: 1,
  },
};

export default {
  id: 'duchess',
  build: 'lean',
  // his own body on the build: tall, slender and poised
  body: { size: [0.92, 0.94], legLen: 1.06, shoulders: 0.9, dims: { waistW: 11 } },
  palettes: { default: 'duchess' },
  torsoMaterial: 'satin',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['stockHi', 'stock', 'gloveDk'],
    satin: ['satinHi', 'satin', 'satinDk', 'outline'],
    shorts: ['satinHi', 'satin', 'satinDk'],
    sock: ['stockHi', 'stock', 'gloveDk'],
    boot: ['bootHi', 'boot', 'bootDk'],
    sole: ['bootDk', 'outline', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    gold: ['gold', 'gold', 'goldDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';
    const cy = y + (H.tilt === 'up' ? -1 : H.tilt === 'down' ? 1 : 0);

    // the chignon: a tall swept-up coil behind the crown
    cv.part(ctx.mask().ellipse(x + lx * 0.2, cy - 15, 6.2, 5.6).ellipse(x + lx * 0.2 + 2, cy - 19, 4, 3.4), { ramp: ramps.hair, bevel: 3, inner: 'line' });
    ears(ctx, H, ramps.skin, [1.7, 2.6]);
    skull(ctx, H, ramps.skin, 'narrow');
    // swept-back hair with a soft wave over the brow
    const hr = ctx.mask().ellipse(x + lx * 0.3, y - 6, H.rx + 0.8, 6.8).cut(ctx.mask().rect(x - 14, y - 4, 28, 12));
    hr.ellipse(x - 5 + lx * 0.3, y - 5, 5, 2.6).rect(x - Math.round(H.rx) - 1, y - 6, 2, 7).rect(x + Math.round(H.rx) - 1, y - 6, 2, 7);
    cv.part(hr, { ramp: ramps.hair, bevel: 3, inner: 'line' });
    for (const dx of [-6, -2, 2, 6]) cv.line(x + dx, y - 12, x + dx + 2, y - 5, (X, Y) => { if (hr.in(X, Y)) cv.shade(X, Y, -1); });
    // tiara: a gold band with points and a violet stone
    for (let i = -6; i <= 6; i++) cv.px(x + i + lx * 0.3, cy - 11 + (Math.abs(i) > 4 ? 1 : 0), c('gold'));
    for (const i of [-4, 0, 4]) { cv.px(x + i + lx * 0.3, cy - 12 - (i === 0 ? 1 : 0), c('gold')); }
    cv.px(x + lx * 0.3, cy - 12, c('gem')); cv.px(x + lx * 0.3, cy - 11, c('gem'));
    eyes(ctx, fx, fy, face, -1);
    for (const s of [-1, 1]) { const ex = fx + s * 8 - (s > 0 ? 2 : 0); cv.px(ex, fy - 3, c('lash')); cv.px(ex + s, fy - 4, c('lash')); cv.px(ex + s * 2, fy - 3, c('lash')); }
    brows(ctx, fx, fy, face, ramps.hair, { len: 3.8, thick: 0.8, y: -4.4 });
    nose(ctx, fx, fy, ramps.skin, [1.5, 1.7], 3.4);
    mouth(ctx, fx, fy + 8, face, { w: 2.8 });
    if (!['hurt', 'ko', 'dazed', 'strain', 'wide'].includes(face)) { cv.px(fx - 1, fy + 8, c('mouth')); cv.px(fx, fy + 8, c('mouth')); cv.px(fx + 1, fy + 8, c('mouth')); }
    cv.px(fx + 5, fy + 6, c('outline')); // beauty mark
  },

  torso(ctx) {
    const { cv, J, c, D, pose } = ctx;
    const n = J.neck, w = J.waist, h = J.hip;
    const tm = ctx.torsoMask;
    const skinR = ['skinHi', 'skin', 'skinSh', 'skinDk'].map(c);
    // bare shoulders, a square neckline edged in white lace
    for (const s of ['L', 'R']) cv.part(ctx.mask().ellipse(J['sh' + s][0], J['sh' + s][1], D.deltoid + 1.4, D.deltoid + 1).clip(tm), { ramp: skinR, bevel: 3, shadow: false });
    const nk = ctx.mask().rect(n[0] - 8, n[1] - 2, 16, 9).clip(tm);
    cv.part(nk, { ramp: skinR, bevel: 3, inner: 'line', shadow: false });
    for (let X = Math.round(n[0] - 9); X <= n[0] + 9; X++) { const Y = Math.round(n[1] + 7); if (tm.in(X, Y + 1)) cv.px(X, Y + 1, c((X & 1) ? 'white' : 'pearl')); }
    // pearl choker
    if (!pose.lying) for (let k = -3; k <= 3; k++) cv.px(n[0] + k * 2, n[1] - 1 + (Math.abs(k) > 2 ? -1 : 0), c('pearl'));
    // satin sheen
    for (let Y = Math.round(n[1] + 10); Y < w[1] - 2; Y += 3) cv.shade(n[0] - 7 + ((Y >> 1) & 1), Y, -1);
    // gold piping on the trunks
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, w[1] - 3, D.waistW * 2 + 2, 2).clip(ctx.shortsMask), { ramp: ['gold', 'gold', 'goldDk'].map(c), bevel: 1, inner: 'line', shadow: false });
    if (!pose.lying) for (const s of [-1, 1]) cv.line(h[0] + s * (D.hipSpread + 6), h[1] - 3, h[0] + s * (D.hipSpread + 7), h[1] + 6, (X, Y) => { if (ctx.shortsMask.in(X, Y)) cv.px(X, Y, c('gold')); });
  },

  front(ctx) {
    const { cv, J, c, pose } = ctx;
    if (pose.tea) {
      // saucer in the left glove, cup at her lips
      const china = ['china', 'china', 'pearl'].map(c);
      const [sx, sy] = J.fiL;
      cv.part(ctx.mask().ellipse(sx + 3, sy - 8, 9, 2.4), { ramp: china, bevel: 1, inner: 'line', shadow: false });
      for (let i = -6; i <= 8; i += 2) cv.px(sx + 3 + i, sy - 8, c('gold'));
      const [cx, cy] = J.fiR, up = pose.tea === 2 ? 1 : 0;
      const cup = ctx.mask().rect(cx - 5, cy - 15 - up, 9, 6).ellipse(cx - 0.5, cy - 9 - up, 4.5, 2).ellipse(cx + 5, cy - 12 - up, 1.8, 2.2);
      cv.part(cup, { ramp: china, bevel: 1, inner: 'line', shadow: false });
      for (let i = -5; i <= 3; i++) cv.px(cx + i, cy - 15 - up, c('gold'));
      cv.px(cx - 2, cy - 12 - up, c('gem')); cv.px(cx - 1, cy - 12 - up, c('gem'));
      if (pose.tea === 1) for (const [dx, dy] of [[-2, -19], [-1, -21], [-2, -23], [0, -20]]) cv.px(cx + dx, cy + dy, c('white')); // steam
    }
    if (pose.fan) {
      const [fx, fy] = J.fiR;
      for (let a = -5; a <= 5; a++) {
        const t = (a / 5) * 0.9 - Math.PI / 2 + 0.7;
        cv.line(fx, fy - 4, fx + Math.cos(t) * 14, fy - 4 + Math.sin(t) * 14, (X, Y) => cv.px(X, Y, c(a & 1 ? 'satinHi' : 'satin')));
      }
      for (let a = -5; a <= 5; a++) { const t = (a / 5) * 0.9 - Math.PI / 2 + 0.7; cv.px(fx + Math.cos(t) * 14, fy - 4 + Math.sin(t) * 14, c('gold')); }
    }
  },
};
