// The Strongman: sprite layers on the heavy build.
// Sideshow strongman: a shaved dome, a huge waxed handlebar moustache, a
// leopard-print one-shoulder singlet, a wide leather lifting belt with a brass
// buckle, black-and-white striped tights under his trunks, lace-up boots,
// leather wrist wraps, brick-red gloves. `strongman.power` is his red-hot glow
// once a flex has powered up his next punch (charge modifier).

import { makePalette, swapPalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './_face.js';

const A = makePalette('strongman.A', {
  outline: [3, 2, 2],
  skinHi: [31, 25, 19], skin: [28, 18, 12], skinSh: [21, 11, 8], skinDk: [12, 6, 5],
  white: [31, 31, 30], mouth: [13, 2, 4],
  hairHi: [10, 7, 5], hair: [5, 3, 2],
  gloveHi: [29, 12, 8], glove: [21, 5, 4], gloveDk: [11, 2, 2],
  shine: [31, 30, 27],
});
const B = makePalette('strongman.B', {
  leoHi: [31, 27, 12], leo: [28, 19, 5], leoSh: [19, 11, 3], spot: [8, 4, 2],
  leatherHi: [20, 12, 6], leather: [13, 7, 3], leatherDk: [7, 4, 2],
  brassHi: [31, 29, 14], brass: [26, 19, 4],
  tightW: [29, 29, 30], tightK: [5, 5, 7],
  trunkHi: [9, 9, 12], trunk: [4, 4, 6],
});
const powerA = swapPalette('strongman.powerA', A, {
  skinHi: [31, 22, 14], skin: [31, 13, 7], skinSh: [24, 6, 4], gloveHi: [31, 26, 10], glove: [31, 14, 3],
});
export const palettes = { strongman: { A, B }, 'strongman.power': { A: powerA, B } };

const poses = {
  // the flex: double biceps, chest out
  flex1: {
    extends: 'idle1', shift: [0, 0],
    head: { at: [0, -101], face: 'strain', look: [0, -1] },
    chest: [0, -73],
    elL: [-38, -84], elR: [38, -84], fiL: [-30, -104], fiR: [30, -104],
    gloveL: { angle: 30 }, gloveR: { angle: -30 },
  },
  flex2: {
    extends: 'flex1', shift: [0, -1],
    head: { at: [0, -102], face: 'grin', look: [0, -1] },
    elL: [-39, -85], elR: [39, -85], fiL: [-31, -106], fiR: [31, -106],
  },
  // taunt: twirls the moustache
  twirl: {
    extends: 'idle1',
    head: { at: [1, -100], face: 'grin', look: [1, 0] },
    elR: [28, -78], fiR: [9, -92], gloveR: { angle: -50 },
  },
};

export default {
  id: 'strongman',
  build: 'heavy',
  // his own body on the build: all upper body: a vast chest and arms, a pinched waist, stumpy legs
  body: { shoulders: 1.18, torsoLen: 1.06, legLen: 0.86, dims: { deltoid: 10, chestW: 27, waistW: 19, belly: 4, upperArm: [9, 7.8], forearm: [7.4, 6.4], neck: 9 } },
  palettes: { default: 'strongman' },
  torsoMaterial: 'skin',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['leatherHi', 'leather', 'leatherDk'],
    shorts: ['trunkHi', 'trunk', 'outline'],
    sock: ['tightW', 'tightW', 'tightK'],
    boot: ['leatherHi', 'leather', 'leatherDk'],
    sole: ['leatherDk', 'outline', 'outline'],
    hair: ['hairHi', 'hair', 'outline'],
    leo: ['leoHi', 'leo', 'leoSh'],
    leather: ['leatherHi', 'leather', 'leatherDk'],
    brass: ['brassHi', 'brass', 'leatherDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    ears(ctx, H, ramps.skin, [2.6, 3.6]);
    skull(ctx, H, ramps.skin, 'square');
    // the dome shines
    cv.px(x - 4, y - 10, c('shine')); cv.px(x - 3, y - 11, c('shine')); cv.px(x - 5, y - 9, c('skinHi'));
    eyes(ctx, fx, fy, face, 0);
    brows(ctx, fx, fy, face, ramps.hair, { len: 4.6, thick: 1.3, y: -4 });
    nose(ctx, fx, fy, ramps.skin, [2.8, 2.5], 3.4);
    mouth(ctx, fx, fy + 9, face, { w: 4 });
    // the handlebar moustache: thick, waxed, curled up at the tips
    const mu = ctx.mask()
      .ellipse(fx - 3.5, fy + 6.5, 4.5, 1.9, 1, -0.15).ellipse(fx + 3.5, fy + 6.5, 4.5, 1.9, 1, 0.15)
      .capsule(fx - 7.5, fy + 6.5, fx - 11, fy + 3, 1.3, 0.8).capsule(fx + 7.5, fy + 6.5, fx + 11, fy + 3, 1.3, 0.8)
      .ellipse(fx - 11, fy + 2.4, 1.3, 1.3).ellipse(fx + 11, fy + 2.4, 1.3, 1.3);
    cv.part(mu, { ramp: ramps.hair, bevel: 1, inner: 'line' });
    cv.px(fx - 4, fy + 6, c('hairHi')); cv.px(fx + 3, fy + 6, c('hairHi'));
  },

  torso(ctx) {
    const { cv, J, c, ramps, D, pose } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, h = J.hip;
    const tm = ctx.torsoMask;
    // pecs
    for (const s of [-1, 1]) cv.line(ch[0] + s * 16, ch[1] - 2, ch[0] + s * 2, ch[1] + 1, (X, Y) => cv.shade(X, Y, 1));
    // one-shoulder leopard singlet: over the viewer-right shoulder, bare left pec
    const leo = ctx.mask().poly([
      [J.shR[0] - 3, J.shR[1] - 5], [J.shR[0] + 5, J.shR[1] - 1], [ch[0] + D.chestW + 2, ch[1] + 4],
      [w[0] + D.waistW + 3, w[1] + 1], [w[0] - D.waistW - 3, w[1] + 1], [ch[0] - D.chestW - 1, ch[1] + 6],
      [ch[0] - 6, ch[1] + 3],
    ]).clip(tm);
    cv.part(leo, { ramp: ramps.leo, bevel: 5, inner: 'line' });
    for (let y = 0; y < leo.h; y += 1) for (let x = 0; x < leo.w; x++) {
      if (!leo.in(x, y)) continue;
      const u = (x * 7 + y * 13) % 23;
      if (u === 0) { cv.px(x, y, c('spot')); cv.px(x + 1, y, c('spot')); cv.px(x, y + 1, c('spot')); }
      else if (u === 11) { cv.px(x, y, c('spot')); cv.px(x + 1, y + 1, c('spot')); }
    }
    // wide lifting belt with a brass buckle
    const bl = ctx.mask().rect(w[0] - D.waistW - 2, w[1] - 5, D.waistW * 2 + 4, 6);
    cv.part(bl, { ramp: ramps.leather, bevel: 2, inner: 'line' });
    cv.part(ctx.mask().rect(w[0] - 4, w[1] - 5, 8, 6).cut(ctx.mask().rect(w[0] - 2, w[1] - 3, 4, 2)), { ramp: ramps.brass, bevel: 1, inner: 'line', shadow: false });
    for (let k = -D.waistW + 2; k < D.waistW; k += 4) if (Math.abs(k) > 6) cv.px(w[0] + k, w[1] - 2, c('leatherHi'));
    // striped tights on the thighs below the trunks
    if (!pose.lying) for (const s of ['L', 'R']) {
      const kn = J['kn' + s];
      const onLeg = (x, y) => { const i = y * cv.w + x; return x >= 0 && x < cv.w && (cv.ramp[i] || cv.idx[i]) && cv.idx[i] !== cv.outline; };
      for (let y = Math.round(h[1] + 6); y < kn[1] - 1; y += 3) for (let x = Math.round(kn[0]) - 9; x <= kn[0] + 9; x++) if (!ctx.shortsMask.in(x, y) && onLeg(x, y) && onLeg(x, y - 1) && onLeg(x, y + 1)) cv.px(x, y, c('tightK'));
    }
  },
};
