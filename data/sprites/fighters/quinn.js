// Quickdraw Quinn: sprite layers on the medium build.
// A gunslinger: a sand-coloured ten-gallon hat with a snakeskin band, a
// narrow squint, long sideburns and a drooping horseshoe mustache, a red
// bandana knotted at the throat, an open leather vest on a bare chest, faded
// denim trunks with a gun belt of brass cartridges and an empty holster,
// tooled boots with spurs, rust-red gloves.
// Poses: the standoff (holster / holster2 / drawReach), tipping his hat
// (HIGH NOON), twirling a glove like a six-gun (taunt), blowing the smoke off it.

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose, stubble } from './_face.js';

const A = makePalette('quinn.A', {
  outline: [3, 2, 2],
  skinHi: [30, 22, 16], skin: [25, 15, 10], skinSh: [18, 10, 7], skinDk: [10, 5, 4],
  white: [31, 30, 28], mouth: [12, 3, 4],
  hairHi: [14, 9, 5], hair: [8, 5, 3],
  gloveHi: [28, 12, 8], glove: [20, 6, 4], gloveDk: [11, 3, 2],
  hatHi: [29, 25, 17], hat: [23, 18, 11], hatDk: [14, 10, 6],
});
const B = makePalette('quinn.B', {
  vestHi: [18, 11, 6], vest: [12, 7, 4], vestDk: [7, 4, 2],
  denimHi: [16, 20, 27], denim: [9, 13, 21], denimDk: [5, 7, 13],
  brass: [30, 24, 9], brassDk: [19, 13, 3],
  band: [26, 4, 5], bandDk: [15, 1, 3],
  bootHi: [22, 14, 8], boot: [15, 9, 5],
  spur: [26, 27, 28],
});
export const palettes = { quinn: { A, B } };

const poses = {
  // the standoff: right glove hovering over the holster, fingers loose
  holster: {
    extends: 'idle1', shift: [0, 1],
    knL: [-15, -22], knR: [15, -22], ftL: [-18, 0], ftR: [18, 0],
    head: { at: [0, -99], face: 'focus', look: [0, 0] },
    elR: [30, -60], fiR: [26, -44], gloveR: { angle: 175 },
    elL: [-24, -62], fiL: [-12, -74],
  },
  holster2: { extends: 'holster', fiR: [27, -42], gloveR: { angle: 165 } },
  // the draw: from the hip straight up at you
  drawReach: {
    extends: 'holster',
    head: { at: [0, -99], face: 'strain', look: [0, 1] },
    elR: [26, -62], fiR: [16, -66], gloveR: { angle: -60 },
  },
  // HIGH NOON: a finger to the hat brim
  tipHat1: {
    extends: 'idle1',
    head: { at: [0, -100], face: 'grin', look: [-1, 0] },
    elR: [28, -84], fiR: [12, -108], gloveR: { angle: -30 },
    elL: [-24, -60], fiL: [-12, -72],
  },
  tipHat2: {
    extends: 'tipHat1',
    head: { at: [0, -99], face: 'focus', tilt: 'down', look: [-1, 1] },
    fiR: [13, -106],
  },
  // taunt: twirling a glove like a six-gun
  spin1: {
    extends: 'idle1',
    head: { at: [1, -100], face: 'grin', look: [1, 0] },
    elR: [34, -70], fiR: [42, -62], gloveR: { angle: 90 },
    elL: [-24, -60], fiL: [-12, -72],
  },
  spin2: { extends: 'spin1', fiR: [44, -68], gloveR: { angle: -30 } },
  // victory: blowing the smoke off his glove
  blowSmoke: {
    extends: 'idle1',
    head: { at: [0, -100], face: 'grin', look: [1, 0] },
    elR: [26, -74], fiR: [12, -92], gloveR: { angle: -10, view: 'back' },
    elL: [-26, -60], fiL: [-26, -46], gloveL: { angle: 185 },
    smoke: 1,
  },
};

export default {
  id: 'quinn',
  build: 'medium',
  // his own body on the build: a lanky cowboy: long legs, slim hips
  body: { size: [0.96, 1], legLen: 1.08, torsoLen: 0.97, shoulders: 0.96, dims: { belly: 2, waistW: 14 } },
  palettes: { default: 'quinn' },
  torsoMaterial: 'skin',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['vestHi', 'vest', 'vestDk'],
    shorts: ['denimHi', 'denim', 'denimDk'],
    boot: ['bootHi', 'boot', 'vestDk'],
    sole: ['vestDk', 'outline', 'outline'],
    hair: ['hairHi', 'hair', 'outline'],
    hat: ['hatHi', 'hat', 'hatDk'],
    vest: ['vestHi', 'vest', 'vestDk', 'outline'],
    band: ['band', 'band', 'bandDk'],
    brass: ['brass', 'brass', 'brassDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';
    const cy = y + (H.tilt === 'up' ? -2 : H.tilt === 'down' ? 1 : 0);

    ears(ctx, H, ramps.skin, [2.2, 3.2]);
    skull(ctx, H, ramps.skin, 'square');
    // long sideburns
    for (const s of [-1, 1]) cv.part(ctx.mask().rect(x + s * (H.rx - 1.5) - 1, y - 4, 3, 9), { ramp: ramps.hair, bevel: 1, inner: 'line', shadow: false });
    // a squint: the eyes, then heavy lids over them
    eyes(ctx, fx, fy, face, 0);
    if (!['wide', 'hurt', 'ko', 'dazed'].includes(face)) for (const s of [-1, 1]) for (let i = 2; i <= 7; i++) cv.px(fx + (s < 0 ? -i - 1 : i), fy - 2, c('outline'));
    brows(ctx, fx, fy, face, ramps.hair, { len: 4.8, thick: 1.2, y: -4.6 });
    nose(ctx, fx, fy, ramps.skin, [2.2, 2.2], 3.6);
    mouth(ctx, fx, fy + 9, face, { w: 3.4 });
    stubble(ctx, fx, fy, 8, 13, 1);
    // horseshoe mustache
    const mu = ctx.mask().ellipse(fx, fy + 6.6, 6.2, 1.6).rect(fx - 6, fy + 6, 2, 6).rect(fx + 4, fy + 6, 2, 6);
    cv.part(mu, { ramp: ramps.hair, bevel: 1, inner: 'line', shadow: false });
    // the ten-gallon hat: a wide brim, a pinched crown, a snakeskin band
    const brim = ctx.mask().ellipse(x + lx * 0.4, cy - 9, H.rx + 9, 3.2);
    const crown = ctx.mask().ellipse(x + lx * 0.3, cy - 14, H.rx - 0.5, 6).rect(x - H.rx + 0.5 + lx * 0.3, cy - 14, H.rx * 2 - 1, 5);
    crown.cut(ctx.mask().ellipse(x + lx * 0.3, cy - 21, 3, 2.4));
    cv.part(brim, { ramp: ramps.hat, bevel: 2, inner: 'line' });
    cv.part(crown, { ramp: ramps.hat, bevel: 3, inner: 'line' });
    for (let i = -Math.round(H.rx) + 1; i < H.rx; i++) cv.px(x + i + lx * 0.3, cy - 11, c((i & 1) ? 'band' : 'bandDk'));
    for (let i = -Math.round(H.rx) - 7; i < H.rx + 8; i++) if (brim.in(Math.round(x + i + lx * 0.4), cy - 8)) cv.shade(x + i + lx * 0.4, cy - 8, 1);
  },

  torso(ctx) {
    const { cv, J, c, D, ramps, pose } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, h = J.hip;
    const tm = ctx.torsoMask;
    // chest lines
    for (const s of [-1, 1]) cv.line(ch[0] + s * 3, ch[1] + 5, ch[0] + s * (D.chestW - 7), ch[1] + 4, (X, Y) => { if (tm.in(X, Y)) cv.shade(X, Y, 1); });
    // open leather vest: two panels down the sides
    for (const s of [-1, 1]) {
      const v = ctx.mask().poly([
        [J['sh' + (s < 0 ? 'L' : 'R')][0] + s * 3, J.shL[1] - 4], [n[0] + s * 6, n[1] + 1], [ch[0] + s * 7, w[1] - 1], [w[0] + s * (D.waistW + 2), w[1] + 1], [ch[0] + s * (D.chestW + 3), ch[1]],
      ]).clip(tm);
      cv.part(v, { ramp: ramps.vest, bevel: 2, inner: 'line' });
      cv.px(ch[0] + s * 11, ch[1] - 2, c('brass'));
    }
    // red bandana knotted at the throat
    if (!pose.lying) {
      cv.part(ctx.mask().poly([[n[0] - 7, n[1] - 1], [n[0] + 7, n[1] - 1], [n[0] + 1, n[1] + 8]]), { ramp: ramps.band, bevel: 1, inner: 'line', shadow: false });
      for (const [dx, dy] of [[-3, 1], [2, 2], [0, 4]]) cv.px(n[0] + dx, n[1] + dy, c('white'));
    }
    // gun belt of brass cartridges, and the empty holster on his right hip
    const sm = ctx.shortsMask;
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, w[1] - 3, D.waistW * 2 + 2, 4).clip(sm), { ramp: ramps.vest, bevel: 1, inner: 'line', shadow: false });
    for (let X = Math.round(w[0] - D.waistW + 1); X < w[0] + D.waistW; X += 2) if (sm.in(X, Math.round(w[1] - 2))) cv.px(X, w[1] - 2, c('brass'));
    if (!pose.lying) {
      const hx = Math.round(h[0] + D.hipSpread + 7), hy = Math.round(h[1] - 2);
      cv.part(ctx.mask().poly([[hx - 4, hy], [hx + 4, hy], [hx + 3, hy + 11], [hx - 2, hy + 11]]), { ramp: ramps.vest, bevel: 1, inner: 'line' });
      cv.px(hx, hy + 3, c('brass'));
    }
  },

  front(ctx) {
    const { cv, J, c, D, pose } = ctx;
    if (!pose.lying) for (const s of ['L', 'R']) { const f = J['ft' + s]; const sg = s === 'L' ? -1 : 1; cv.px(f[0] - sg * (D.boot[0] - 1), f[1] - 3, c('spur')); cv.px(f[0] - sg * D.boot[0], f[1] - 3, c('spur')); cv.px(f[0] - sg * D.boot[0], f[1] - 4, c('spur')); cv.px(f[0] - sg * D.boot[0], f[1] - 2, c('spur')); }
    if (pose.smoke) { const [x, y] = J.fiR; for (const [dx, dy] of [[0, -12], [1, -14], [0, -16], [-1, -18], [0, -20]]) cv.px(x + dx, y + dy, c('white')); }
  },
};
