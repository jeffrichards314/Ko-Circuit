// Ringmaster Rex: sprite layers on the medium build.
// The ringmaster of the big top: a tall crimson top hat with a gold band,
// dark curly sideburns and a big curled moustache, a crimson tailcoat with gold
// frogging and brass buttons (open over a white shirt-front and a black bow
// tie), black trunks with a gold stripe, tall black riding boots, white gloves.
// A coiled whip hangs at his hip. `callLights` is the arm-up "LIGHTS!" pose
// that brings in the spotlight (spotlight modifier).

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './_face.js';

const A = makePalette('rex.A', {
  outline: [3, 2, 3],
  skinHi: [31, 25, 19], skin: [28, 18, 13], skinSh: [21, 11, 9], skinDk: [12, 6, 6],
  white: [31, 31, 31], mouth: [13, 2, 4],
  hairHi: [12, 8, 6], hair: [6, 3, 3],
  gloveHi: [31, 31, 31], glove: [26, 26, 28], gloveDk: [16, 16, 20],
  shirtSh: [22, 22, 26],
});
const B = makePalette('rex.B', {
  coatHi: [30, 8, 9], coat: [22, 3, 6], coatDk: [11, 1, 3],
  goldHi: [31, 30, 14], gold: [29, 22, 4], goldDk: [16, 10, 2],
  blackHi: [9, 8, 11], black: [4, 3, 5],
  leather: [13, 8, 4], leatherHi: [21, 13, 6],
  bootHi: [12, 12, 15], boot: [5, 5, 7], bootDk: [2, 2, 3],
});
export const palettes = { rex: { A, B } };

const poses = {
  // "LIGHTS!": right arm thrown up to the rafters
  callLights: {
    extends: 'idle1', shift: [1, -1],
    head: { at: [3, -102], face: 'wide', tilt: 'up', look: [2, -2] },
    elR: [30, -96], fiR: [34, -120], gloveR: { angle: 10 },
    elL: [-28, -62], fiL: [-14, -70],
  },
  // taunt: a sweeping bow with the hat
  presents: {
    extends: 'idle1', shift: [0, 2],
    head: { at: [2, -96], face: 'grin', tilt: 'down', look: [1, 1] },
    elL: [-36, -72], fiL: [-50, -64], gloveL: { angle: -110 },
    elR: [26, -60], fiR: [10, -66], gloveR: { angle: -60 },
  },
  bravo: {
    extends: 'victory',
    head: { at: [0, -101], face: 'grin', look: [0, -1] },
  },
};

export default {
  id: 'rex',
  build: 'medium',
  // his own body on the build: a ringmaster: a puffed-out chest and a showman's paunch
  body: { legLen: 0.96, dims: { chestW: 22, belly: 6 } },
  palettes: { default: 'rex' },
  torsoMaterial: 'coat',
  sleeve: { material: 'coat', length: 0.95 },
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['goldHi', 'gold', 'goldDk'],
    coat: ['coatHi', 'coat', 'coatDk', 'outline'],
    shorts: ['blackHi', 'black', 'outline'],
    sock: ['bootHi', 'boot', 'bootDk'],
    boot: ['bootHi', 'boot', 'bootDk'],
    sole: ['boot', 'bootDk', 'outline'],
    hair: ['hairHi', 'hair', 'outline'],
    gold: ['goldHi', 'gold', 'goldDk'],
    shirt: ['white', 'white', 'shirtSh', 'gloveDk'],
    leather: ['leatherHi', 'leather', 'outline'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    ears(ctx, H, ramps.skin, [2.4, 3.4]);
    const hm = skull(ctx, H, ramps.skin, 'square');
    // curly sideburns
    const sb = ctx.mask();
    for (const s of [-1, 1]) sb.ellipse(x + s * (H.rx - 1.5), y + 1, 2.2, 5).ellipse(x + s * (H.rx - 2.5), y + 5, 2, 2.4);
    cv.part(sb.clip(hm), { ramp: ramps.hair, bevel: 1, inner: 'line', shadow: false });
    eyes(ctx, fx, fy, face, 0);
    brows(ctx, fx, fy, face, ramps.hair, { len: 4.6, thick: 1.2, y: -4 });
    nose(ctx, fx, fy, ramps.skin, [2.4, 2.4], 3.5);
    mouth(ctx, fx, fy + 9, face, { w: 3.8 });
    // big curled moustache
    const mu = ctx.mask()
      .ellipse(fx - 3.2, fy + 6.6, 4, 1.8, 1, -0.2).ellipse(fx + 3.2, fy + 6.6, 4, 1.8, 1, 0.2)
      .capsule(fx - 6.5, fy + 7, fx - 9, fy + 9, 1.2, 0.8).capsule(fx + 6.5, fy + 7, fx + 9, fy + 9, 1.2, 0.8)
      .ellipse(fx - 9.5, fy + 8, 1.4, 1.4).ellipse(fx + 9.5, fy + 8, 1.4, 1.4);
    cv.part(mu, { ramp: ramps.hair, bevel: 1, inner: 'line' });
    // tall crimson top hat with a gold band, a little tilted
    const cy = y + (H.tilt === 'up' ? -1 : H.tilt === 'down' ? 1 : 0);
    const hx = x + lx * 0.4 + 1;
    const crown = ctx.mask().poly([[hx - 8, cy - 7], [hx + 8, cy - 7], [hx + 9, cy - 25], [hx - 7, cy - 25]]).ellipse(hx + 1, cy - 25, 8, 1.8);
    cv.part(crown, { ramp: ramps.coat, bevel: 3 });
    cv.line(hx - 5, cy - 23, hx - 5, cy - 10, (X, Y) => cv.shade(X, Y, -1));
    cv.part(ctx.mask().rect(hx - 8, cy - 12, 17, 3).clip(crown), { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
    cv.part(ctx.mask().ellipse(hx, cy - 6.5, H.rx + 4, 2), { ramp: ramps.coat, bevel: 1, bias: -0.2, inner: 'line' });
    for (let i = -8; i <= 8; i++) if (hm.in(fx + i, cy - 4)) cv.shade(fx + i, cy - 4, 1);
  },

  torso(ctx) {
    const { cv, J, c, ramps, D } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, h = J.hip;
    const tm = ctx.torsoMask;
    const nx = Math.round(n[0]), ny = Math.round(n[1]);
    // white shirt-front in the open coat
    const sf = ctx.mask().poly([[nx - 6, ny + 1], [nx + 6, ny + 1], [w[0] + 5, w[1]], [w[0] - 5, w[1]]]).clip(tm);
    cv.part(sf, { ramp: ramps.shirt, bevel: 2, inner: 'line', shadow: false });
    for (let k = 0; k < 3; k++) cv.px(w[0], ch[1] + k * 6, c('outline'));
    // lapels
    for (const s of [-1, 1]) cv.part(ctx.mask().poly([[nx + s * 6, ny + 1], [nx + s * 11, ny + 3], [w[0] + s * 6, ch[1] + 4], [w[0] + s * 5, ch[1] + 8]]).clip(tm), { ramp: ramps.coat, bevel: 1, bias: 0.3, inner: 'line', shadow: false });
    // gold frogging: three braids across each side
    for (let k = 0; k < 3; k++) for (const s of [-1, 1]) {
      const y0 = Math.round(ch[1] - 3 + k * 6);
      cv.line(w[0] + s * 6, y0, w[0] + s * (D.chestW - 5), y0 + 1, (X, Y) => { if (tm.in(X, Y) && !sf.in(X, Y)) cv.px(X, Y, c('gold')); });
      cv.px(w[0] + s * (D.chestW - 4), y0 + 1, c('goldHi'));
    }
    // black bow tie
    cv.part(ctx.mask().poly([[nx - 5, ny + 1], [nx, ny + 3], [nx - 5, ny + 5]]).poly([[nx + 5, ny + 1], [nx, ny + 3], [nx + 5, ny + 5]]), { ramp: ['blackHi', 'black', 'outline'].map(c), bevel: 1, inner: 'line', shadow: false });
    // coat tails behind the hips
    for (const s of [-1, 1]) cv.part(ctx.mask().poly([[w[0] + s * (D.waistW - 2), w[1] - 2], [w[0] + s * (D.waistW + 4), w[1] - 2], [h[0] + s * (D.waistW + 6), h[1] + 12], [h[0] + s * (D.waistW - 1), h[1] + 10]]), { ramp: ramps.coat, bevel: 2, inner: 'line' });
    // gold stripe on the trunks + the coiled whip at the hip
    for (const s of [-1, 1]) cv.line(h[0] + s * 14, h[1] - 3, h[0] + s * 15, h[1] + 8, (X, Y) => { if (ctx.shortsMask.in(X, Y)) cv.px(X, Y, c('gold')); });
    const wx = Math.round(h[0] - D.waistW - 1), wy = Math.round(h[1] + 2);
    cv.part(ctx.mask().ellipse(wx, wy, 4, 4).cut(ctx.mask().ellipse(wx, wy, 2, 2)), { ramp: ramps.leather, bevel: 1, inner: 'line' });
  },
  // Title Defense, THE FAREWELL TOUR: one last show. A pink feather boa round his
  // neck and over his shoulders, a white plume in the hat band, sequins on the coat.
  remix: {
    colors: { B: { boaHi: [31, 22, 27], boa: [27, 11, 20] } },
    ramps: { boa: ['boaHi', 'boa', 'coatDk'], plume: ['white', 'white', 'shirtSh'] },
    head(ctx, H) {
      const { cv, ramps } = ctx;
      const cy = Math.round(H.y) + (H.tilt === 'up' ? -1 : H.tilt === 'down' ? 1 : 0);
      const hx = Math.round(H.x + H.look[0] * 0.4 + 1);
      // the plume sweeps up and back out of the hat band
      const pl = ctx.mask().ellipse(hx + 10, cy - 20, 3, 8, 1, 0.5).ellipse(hx + 13, cy - 27, 2.4, 5, 1, 0.8);
      cv.part(pl, { ramp: ramps.plume, bevel: 2, inner: 'line' });
      for (let k = 0; k < 5; k++) cv.shade(hx + 9 + k, cy - 14 - k * 3, 1);
    },
    torso(ctx) {
      const { cv, J, ramps, c, pose } = ctx;
      // sequins: a scatter of glints over the coat
      const tm = ctx.torsoMask;
      for (let k = 0; k < 40; k++) {
        const X = Math.round(J.chest[0] + ((k * 37) % 41) - 20), Y = Math.round(J.chest[1] + ((k * 23) % 31) - 12);
        if (tm.in(X, Y)) cv.px(X, Y, c(k % 3 ? 'coatHi' : 'goldHi'));
      }
      if (pose.lying) return;
      // the boa: a fluffy rope of puffs round the neck and down both sides
      const n = J.neck, L = J.shL, R = J.shR;
      const path = [[L[0] + 2, L[1] + 14], [L[0] + 1, L[1] + 5], [L[0] + 5, L[1] - 1], [n[0] - 5, n[1] + 3], [n[0], n[1] + 5], [n[0] + 5, n[1] + 3], [R[0] - 5, R[1] - 1], [R[0] - 1, R[1] + 5], [R[0] - 2, R[1] + 14]];
      const m = ctx.mask();
      path.forEach(([x, y], k) => m.ellipse(x, y, 3.6, 3.2 - (k % 2) * 0.4));
      cv.part(m, { ramp: ramps.boa, bevel: 2, inner: 'soft' });
      path.forEach(([x, y], k) => { if (k % 2) cv.px(Math.round(x - 1), Math.round(y - 1), c('boaHi')); });
    },
  },
};
