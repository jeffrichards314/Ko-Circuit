// Iron Jaw Ignatius: sprite layers on the heavy build.
// A foundry man with a jaw like an anvil: a huge square chin (scarred) under
// black stubble, a black flat-top, a neck as wide as his head. A gunmetal
// work singlet with rivets down the seams, a heavy chain for a belt on black
// trunks, steel-grey gloves with riveted cuffs, steel-toe boots.
// Poses: jawOut1/2 (the taunt: chin up, tapping it, "RIGHT HERE, PAL").

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose, stubble } from './_face.js';

const A = makePalette('ignatius.A', {
  outline: [2, 2, 3],
  skinHi: [30, 23, 17], skin: [25, 16, 11], skinSh: [18, 10, 8], skinDk: [10, 5, 5],
  white: [31, 31, 30], mouth: [12, 2, 4],
  hairHi: [8, 8, 11], hair: [3, 3, 5],
  gloveHi: [24, 26, 28], glove: [14, 16, 19], gloveDk: [7, 8, 11],
  scar: [29, 20, 17],
});
const B = makePalette('ignatius.B', {
  steelHi: [16, 18, 21], steel: [10, 11, 14], steelDk: [5, 5, 8],
  rivet: [27, 28, 29],
  trunkHi: [8, 8, 10], trunk: [3, 3, 5],
  chainHi: [29, 29, 27], chain: [19, 19, 19], chainDk: [10, 10, 11],
  bootHi: [18, 19, 21], boot: [11, 11, 13],
});
export const palettes = { ignatius: { A, B } };

const poses = {
  // "RIGHT HERE, PAL": chin up and out, tapping it with his right glove
  jawOut1: {
    extends: 'idle1', shift: [0, -1],
    head: { at: [1, -102], face: 'grin', tilt: 'up', look: [0, -1] },
    elR: [30, -74], fiR: [14, -90], gloveR: { angle: -50 },
    elL: [-30, -58], fiL: [-26, -44], gloveL: { angle: 190 },
  },
  jawOut2: {
    extends: 'jawOut1',
    head: { at: [2, -102], face: 'wide', tilt: 'up', look: [1, -2] },
    fiR: [15, -93],
  },
};

export default {
  id: 'ignatius',
  build: 'heavy',
  // his own body on the build: the jaw: a neck as wide as his head, and a torso to match
  body: { shoulders: 1.06, torsoLen: 1.02, neckLen: -1, dims: { neck: 11 } },
  palettes: { default: 'ignatius' },
  torsoMaterial: 'steel',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['chainHi', 'chain', 'chainDk'],
    steel: ['steelHi', 'steel', 'steelDk', 'outline'],
    shorts: ['trunkHi', 'trunk', 'outline'],
    sock: ['steelHi', 'steel', 'steelDk'],
    boot: ['bootHi', 'boot', 'steelDk'],
    sole: ['steelDk', 'outline', 'outline'],
    hair: ['hairHi', 'hair', 'outline'],
    chain: ['chainHi', 'chain', 'chainDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    ears(ctx, H, ramps.skin, [2.4, 3.2]);
    // the anvil jaw: wider at the chin than at the temples
    const hm = skull(ctx, H, ramps.skin, 'square');
    const jaw = ctx.mask().rect(fx - H.rx - 1.5, fy + 3, H.rx * 2 + 3, 9).ellipse(fx, fy + 11, H.rx + 1, 3.6);
    cv.part(jaw.add(hm), { ramp: ramps.skin, bevel: 5 });
    ctx.headMask = jaw;
    // flat-top: squared off like the face of an anvil, but plainly hair: a short
    // bristly block with a ragged crown, tapering into the temples, and a soft
    // hairline (no hard edge along the bottom, which read as a hat brim)
    const hx = x + Math.round(lx * 0.3), ty = y - H.ry - 1;
    const top = ctx.mask().rect(hx - H.rx + 2, ty, H.rx * 2 - 3, 7).ellipse(hx, y - 7, H.rx + 0.2, 4.5)
      .poly([[hx - H.rx, y - 8], [hx - H.rx + 3, y - 8], [hx - H.rx + 1.5, y - 4]])
      .poly([[hx + H.rx, y - 8], [hx + H.rx - 3, y - 8], [hx + H.rx - 1.5, y - 4]])
      .cut(ctx.mask().rect(x - 14, y - 5, 28, 14));
    // bristles standing up along the crown
    for (let i = -Math.round(H.rx) + 3; i < H.rx - 2; i += 2) top.rect(hx + i, ty - 1 - ((i >> 1) & 1), 1, 2);
    cv.part(top, { ramp: ramps.hair, bevel: 1, inner: 'soft' });
    for (let i = -Math.round(H.rx) + 3; i < H.rx - 2; i += 2) cv.px(hx + i, ty + 1 + ((i >> 1) & 1), c('hairHi'));
    // stubbly hairline: a dither of hair into the forehead
    for (let i = -Math.round(H.rx) + 3; i < H.rx - 2; i++) if (((i + y) & 1) === 0 && hm.in(hx + i, y - 5)) cv.px(hx + i, y - 5, c('hair'));
    eyes(ctx, fx, fy, face, 0);
    brows(ctx, fx, fy, face, ramps.hair, { len: 5, thick: 1.5, y: -4 });
    nose(ctx, fx, fy, ramps.skin, [2.8, 2.4], 3.6);
    mouth(ctx, fx, fy + 8, face, { w: 4 });
    // stubble over the whole jaw, and the scar across the chin
    stubble(ctx, fx, fy, 10, 15, 1);
    for (let k = 0; k < 4; k++) cv.px(fx + 3 + k, fy + 11 + (k >> 1), c('scar'));
    cv.shade(fx - H.rx + 1, fy + 10, 1); cv.shade(fx + H.rx - 1, fy + 10, 1);
  },

  torso(ctx) {
    const { cv, J, c, D, ramps, pose } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest;
    const tm = ctx.torsoMask;
    // singlet: bare shoulders, a deep scoop at the neck
    for (const s of ['L', 'R']) cv.part(ctx.mask().ellipse(J['sh' + s][0], J['sh' + s][1], D.deltoid + 1.2, D.deltoid + 0.8).clip(tm), { ramp: ramps.skin, bevel: 3, shadow: false });
    cv.part(ctx.mask().ellipse(n[0], n[1] + 2, 9, 5.5).clip(tm), { ramp: ramps.skin, bevel: 3, inner: 'line', shadow: false });
    // riveted seams
    for (const s of [-1, 1]) {
      const x0 = n[0] + s * 10, x1 = ch[0] + s * (D.chestW - 7);
      for (let k = 0; k <= 5; k++) {
        const X = Math.round(x0 + (x1 - x0) * (k / 5)), Y = Math.round(n[1] + 8 + (w[1] - 6 - n[1] - 8) * (k / 5));
        if (tm.in(X, Y) && cv.idx[Y * cv.w + X] === 0) { cv.px(X, Y, c('rivet')); cv.px(X + 1, Y + 1, c('steelDk')); }
      }
    }
    // the chain belt
    if (!pose.lying) {
      const y0 = Math.round(w[1] - 3);
      for (let X = Math.round(w[0] - D.waistW - 1); X <= w[0] + D.waistW + 1; X++) {
        if (!ctx.shortsMask.in(X, y0) && !tm.in(X, y0)) continue;
        const k = ((X - Math.round(w[0])) % 4 + 4) % 4;
        cv.px(X, y0 - 1, c(k === 1 ? 'chainHi' : 'outline'));
        cv.px(X, y0, c(k === 0 || k === 2 ? 'chain' : k === 1 ? 'chainHi' : 'outline'));
        cv.px(X, y0 + 1, c(k === 3 ? 'chainDk' : 'outline'));
      }
    }
  },

  front(ctx) {
    // rivets round the glove cuffs
    const { cv, J, c, pose } = ctx;
    if (pose.lying) return;
    for (const s of ['L', 'R']) {
      const g = pose['glove' + s] || {};
      if (g.view === 'front') continue;
      const [ex, ey] = J['el' + s], [fx, fy] = J['fi' + s];
      const t = 0.72, X = ex + (fx - ex) * t, Y = ey + (fy - ey) * t;
      cv.px(X, Y, c('rivet'));
    }
  },
};
