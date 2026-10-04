// Avalanche: sprite layers on the heavy build.
// A mountain of a mountaineer: a shaggy brown mane and a huge beard dusted
// with snow, a red nordic knit vest with a white patterned yoke, black trunks
// with a white snowflake, laced brown mountain boots, snow-white gloves.
// Poses: beating his chest before the Avalanche rush (and as his taunt).

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './_face.js';

const A = makePalette('avalanche.A', {
  outline: [3, 2, 2],
  skinHi: [31, 24, 18], skin: [27, 17, 12], skinSh: [20, 11, 8], skinDk: [11, 6, 5],
  ruddy: [28, 12, 11], white: [31, 31, 31], mouth: [13, 2, 4],
  hairHi: [17, 11, 6], hair: [11, 6, 3], hairDk: [5, 3, 2],
  gloveHi: [31, 31, 31], glove: [25, 27, 30], gloveDk: [14, 16, 21],
  snow: [29, 31, 31],
});
const B = makePalette('avalanche.B', {
  knitHi: [29, 7, 7], knit: [21, 3, 4], knitDk: [11, 1, 2],
  yoke: [30, 30, 29], yokeSh: [20, 20, 22],
  trunkHi: [8, 8, 11], trunk: [3, 3, 5],
  bootHi: [18, 11, 6], boot: [11, 6, 3], bootDk: [5, 3, 2],
  lace: [28, 6, 6],
});
export const palettes = { avalanche: { A, B } };

const poses = {
  // pounding his chest, roaring
  beatChest1: {
    extends: 'idle1', shift: [0, 1],
    head: { at: [0, -101], face: 'wide', tilt: 'up', look: [0, -1] },
    elL: [-30, -66], fiL: [-10, -74], gloveL: { view: 'back', angle: 80 },
    elR: [32, -76], fiR: [26, -94], gloveR: { angle: 10 },
  },
  beatChest2: {
    extends: 'idle1', shift: [0, 1],
    head: { at: [0, -101], face: 'strain', tilt: 'up', look: [0, -1] },
    elR: [30, -66], fiR: [10, -74], gloveR: { view: 'back', angle: -80 },
    elL: [-32, -76], fiL: [-26, -94], gloveL: { angle: -10 },
  },
};

export default {
  id: 'avalanche',
  build: 'heavy',
  // his own body on the build: a mountain: bigger than any other heavy, in every direction
  body: { size: [1.12, 1.05], shoulders: 1.1, dims: { chestW: 27, belly: 10, upperArm: [8.4, 7], forearm: [7, 6] } },
  palettes: { default: 'avalanche' },
  torsoMaterial: 'knit',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['yoke', 'yokeSh', 'knitDk'],
    knit: ['knitHi', 'knit', 'knitDk', 'outline'],
    yoke: ['yoke', 'yoke', 'yokeSh'],
    shorts: ['trunkHi', 'trunk', 'outline'],
    sock: ['yoke', 'yokeSh', 'knitDk'],
    boot: ['bootHi', 'boot', 'bootDk'],
    sole: ['bootDk', 'outline', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';
    const open = ['strain', 'hurt', 'wide'].includes(face);

    // shaggy mane behind and around the head
    const mane = ctx.mask().ellipse(x + lx * 0.3, y - 3, H.rx + 4, H.ry + 1);
    for (const s of [-1, 1]) mane.ellipse(x + s * (H.rx + 2), y + 4, 3.5, 7);
    cv.part(mane, { ramp: ramps.hair, bevel: 4, inner: 'line' });
    ears(ctx, H, ramps.skin, [2.6, 3.6]);
    const hm = skull(ctx, H, ramps.skin, 'square');
    // fringe
    const fr = ctx.mask().ellipse(x + lx * 0.3, y - 8, H.rx + 0.5, 5.5).clip(hm);
    for (const dx of [-8, -4, 0, 4, 8]) fr.poly([[x + dx - 2, y - 6], [x + dx + 2, y - 6], [x + dx, y - 2]]);
    cv.part(fr.clip(hm), { ramp: ramps.hair, bevel: 2, inner: 'line', shadow: false });
    // huge beard
    const bd = ctx.mask().ellipse(fx, fy + 10, H.rx + 3, 11).cut(ctx.mask().rect(fx - 20, fy - 8, 40, 12));
    bd.rect(x - Math.round(H.rx) - 1, y - 2, 4, 10).rect(x + Math.round(H.rx) - 3, y - 2, 4, 10);
    const mo = ctx.mask().ellipse(fx, fy + 9.5, 3.6, 2);
    if (open) bd.cut(mo);
    cv.part(bd, { ramp: ramps.hair, bevel: 4, inner: 'line' });
    if (open) { cv.flat(mo, c('mouth'), true); cv.px(fx - 1, fy + 8, c('white')); cv.px(fx, fy + 8, c('white')); cv.px(fx + 1, fy + 8, c('white')); }
    for (const s of [-1, 1]) { cv.px(fx + s * 6, fy + 3, c('ruddy')); cv.px(fx + s * 6 - s, fy + 3, c('ruddy')); }
    eyes(ctx, fx, fy, face, 0);
    brows(ctx, fx, fy, face, ramps.hair, { len: 5, thick: 1.6, y: -4 });
    nose(ctx, fx, fy, ['skinHi', 'ruddy', 'skinSh', 'skinDk'].map(c), [3, 2.6], 3.6);
    cv.part(ctx.mask().ellipse(fx - 3.6, fy + 7, 4.6, 2, 1, -0.2).ellipse(fx + 3.6, fy + 7, 4.6, 2, 1, 0.2), { ramp: ramps.hair, bevel: 1, inner: 'line', shadow: false });
    // snow caught in the mane and beard
    for (const [dx, dy] of [[-13, -8], [-9, -13], [2, -14], [10, -12], [14, -4], [-15, 6], [15, 8], [-6, 14], [5, 16], [0, 19], [-10, 12], [9, 11]]) cv.px(x + dx, y + dy, c('snow'));
  },

  torso(ctx) {
    const { cv, J, c, D, ramps, pose } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, h = J.hip;
    const tm = ctx.torsoMask;
    // bare shoulders; knit rib texture
    for (const s of ['L', 'R']) cv.part(ctx.mask().ellipse(J['sh' + s][0], J['sh' + s][1], D.deltoid + 1.4, D.deltoid + 1).clip(tm), { ramp: ramps.skin, bevel: 3, shadow: false });
    // the white nordic yoke across the chest, with a red zigzag and dots
    const yk = ctx.mask().rect(ch[0] - D.chestW - 4, n[1] + 3, D.chestW * 2 + 8, 11).clip(tm).cut(ctx.mask().ellipse(n[0], n[1] + 1, 6, 4));
    cv.part(yk, { ramp: ramps.yoke, bevel: 1, inner: 'line', shadow: false });
    for (let X = 0; X < yk.w; X++) {
      const zz = Math.round(n[1] + 7 + (((X >> 1) & 3) < 2 ? (X >> 1) & 1 : 1 - ((X >> 1) & 1)));
      if (yk.in(X, zz)) cv.px(X, zz, c('knit'));
      if (yk.in(X, n[1] + 11) && X % 4 === 0) cv.px(X, n[1] + 11, c('knitDk'));
      if (yk.in(X, n[1] + 4) && X % 4 === 2) cv.px(X, n[1] + 4, c('knit'));
    }
    for (let Y = n[1] + 15; Y < w[1]; Y++) for (let X = 0; X < tm.w; X++) if (tm.in(X, Y) && X % 3 === 0 && cv.ramp[Y * cv.w + X]) cv.shade(X, Y, 1);
    cv.part(ctx.mask().ellipse(n[0], n[1] + 1, 6, 3.5).clip(tm), { ramp: ramps.skin, bevel: 2, inner: 'line', shadow: false });
    // ribbed hem + a white snowflake on the trunks
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, w[1] - 4, D.waistW * 2 + 2, 4).clip(tm.copy().add(ctx.shortsMask)), { ramp: ramps.knit, bevel: 1, inner: 'line', shadow: false });
    if (!pose.lying) {
      const sx = Math.round(h[0] + D.hipSpread + 6), sy = Math.round(h[1] + 3);
      cv.stamp(['w.w.w', '.www.', 'wwwww', '.www.', 'w.w.w'], sx - 2, sy - 2, { w: c('yoke') });
    }
  },

  front(ctx) {
    // red laces on the mountain boots
    const { cv, J, c, D, pose } = ctx;
    if (pose.lying) return;
    for (const s of ['L', 'R']) { const f = J['ft' + s]; for (let k = 0; k < 3; k++) cv.px(f[0] + (k & 1 ? 1 : -1), f[1] - D.ankle - 1 + k * 2, c('lace')); }
  },
  // Title Defense, THE DEEP FREEZE: a fur-lined ushanka with the ear flaps down,
  // ice crusted over both shoulders, and icicles hanging off the beard.
  remix: {
    colors: { B: { furHi: [23, 18, 13], fur: [15, 11, 7], furDk: [8, 5, 3], iceHi: [27, 31, 31] } },
    ramps: { fur: ['furHi', 'fur', 'furDk'], hatTop: ['knitHi', 'knit', 'knitDk'], ice: ['iceHi', 'glove', 'gloveDk'] },
    head(ctx, H) {
      const { cv, ramps, c } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.3), y = Math.round(H.y) + (H.tilt === 'up' ? -1 : H.tilt === 'down' ? 1 : 0);
      const fx = Math.round(H.x + H.look[0]), fy = Math.round(H.y + H.look[1]);
      // the crown, the fur band across the forehead, and the two flaps
      cv.part(ctx.mask().ellipse(x, y - 10, H.rx + 2, 7).cut(ctx.mask().rect(x - 20, y - 6, 40, 10)), { ramp: ramps.hatTop, bevel: 3 });
      const fur = ctx.mask().rect(x - H.rx - 3, y - 9, H.rx * 2 + 6, 5).rect(x - H.rx - 4, y - 7, 5, 14).rect(x + H.rx - 1, y - 7, 5, 14);
      cv.part(fur, { ramp: ramps.fur, bevel: 2, inner: 'soft' });
      for (let i = -Math.round(H.rx) - 2; i <= H.rx + 2; i += 2) cv.px(x + i, y - 9, c('furHi'));
      // icicles off the beard
      for (const [dx, len] of [[-6, 4], [-2, 6], [2, 5], [6, 3]]) for (let k = 0; k < len; k++) cv.px(fx + dx, fy + 20 + k, c(k < len - 1 ? 'iceHi' : 'glove'));
    },
    torso(ctx) {
      const { cv, J, ramps, pose } = ctx;
      if (pose.lying) return;
      for (const s of ['L', 'R']) {
        const sh = J['sh' + s], sign = s === 'L' ? -1 : 1;
        const ice = ctx.mask().ellipse(sh[0], sh[1] - 1, 7, 4).poly([[sh[0] - 6, sh[1]], [sh[0] - 2, sh[1]], [sh[0] - 4, sh[1] + 6]]).poly([[sh[0] + 1, sh[1]], [sh[0] + 5, sh[1]], [sh[0] + 3, sh[1] + 5]]);
        cv.part(ice, { ramp: ramps.ice, bevel: 2, inner: 'line' });
        cv.px(sh[0] - sign * 2, sh[1] - 3, ctx.c('white'));
      }
    },
  },
};
