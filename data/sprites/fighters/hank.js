// Hurricane Hank: sprite layers on the medium build.
// A storm chaser: wild white hair blown flat to one side, aviator goggles
// pushed up on his forehead, weathered stubble, a yellow slicker vest with
// silver reflective bands, navy trunks with a white spiral, orange gloves.
// Poses: the windmilling pinwheel before a flurry (and his taunt).

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose, stubble } from './_face.js';

const A = makePalette('hank.A', {
  outline: [3, 2, 3],
  skinHi: [30, 23, 17], skin: [26, 16, 11], skinSh: [19, 10, 8], skinDk: [10, 5, 4],
  white: [31, 31, 31], mouth: [13, 2, 4],
  hairHi: [31, 31, 31], hair: [24, 25, 28], hairDk: [14, 15, 19],
  gloveHi: [31, 22, 10], glove: [30, 13, 3], gloveDk: [17, 6, 2],
  lens: [10, 22, 26],
});
const B = makePalette('hank.B', {
  slickHi: [31, 30, 14], slick: [29, 23, 4], slickDk: [18, 12, 2],
  reflect: [27, 29, 31], reflectSh: [18, 20, 24],
  navyHi: [10, 12, 22], navy: [5, 6, 14], navyDk: [2, 2, 7],
  strap: [8, 6, 5], brassHi: [31, 27, 15], brass: [22, 16, 6],
  bootHi: [14, 15, 18], boot: [6, 6, 8],
});
export const palettes = { hank: { A, B } };

const poses = {
  // windmilling: one arm up, one arm down, then swap
  pinwheel1: {
    extends: 'idle1', shift: [0, 1],
    head: { at: [0, -99], face: 'wide', look: [0, 0] },
    elL: [-34, -94], fiL: [-38, -116], gloveL: { angle: -20 },
    elR: [32, -62], fiR: [40, -46], gloveR: { angle: 150 },
  },
  pinwheel2: {
    extends: 'idle1', shift: [0, 1],
    head: { at: [0, -99], face: 'strain', look: [0, 0] },
    elR: [34, -94], fiR: [38, -116], gloveR: { angle: 20 },
    elL: [-32, -62], fiL: [-40, -46], gloveL: { angle: -150 },
  },
};

export default {
  id: 'hank',
  build: 'medium',
  // his own body on the build: a wiry old storm chaser: thin, rangy
  body: { size: [0.96, 0.98], shoulders: 0.95, legLen: 1.02, dims: { belly: 2, waistW: 14.5 } },
  palettes: { default: 'hank' },
  torsoMaterial: 'slick',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['reflect', 'reflectSh', 'navy'],
    slick: ['slickHi', 'slick', 'slickDk', 'outline'],
    shorts: ['navyHi', 'navy', 'navyDk'],
    sock: ['reflect', 'reflectSh', 'navy'],
    boot: ['bootHi', 'boot', 'outline'],
    sole: ['boot', 'outline', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    reflect: ['reflect', 'reflect', 'reflectSh'],
    brass: ['brassHi', 'brass', 'strap'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    ears(ctx, H, ramps.skin, [2.4, 3.4]);
    const hm = skull(ctx, H, ramps.skin, 'round');
    stubble(ctx, fx, fy, 7, 12, 1);
    // wild white hair, blown flat off to the viewer's right in big tufts
    const hr = ctx.mask().ellipse(x + lx * 0.3, y - 7, H.rx + 0.5, 6.5);
    for (const [dx, dy, len] of [[4, -12, 14], [6, -8, 16], [5, -4, 12], [2, -14, 9]]) hr.poly([[x + dx, y + dy - 2], [x + dx + len, y + dy - 1], [x + dx + 2, y + dy + 3]]);
    hr.poly([[x - 10, y - 8], [x - 16, y - 12], [x - 8, y - 12]]);
    cv.part(hr.cut(ctx.mask().rect(x - 12, y - 4, 22, 14)), { ramp: ramps.hair, bevel: 2, inner: 'line' });
    for (const [dx, dy] of [[6, -9], [10, -8], [9, -12], [14, -9], [0, -10]]) cv.shade(x + dx, y + dy, 1);
    eyes(ctx, fx, fy, face, 0);
    brows(ctx, fx, fy, face, ramps.hair, { len: 4.4, thick: 1.2, y: -4 });
    nose(ctx, fx, fy, ramps.skin, [2.4, 2.4], 3.6);
    mouth(ctx, fx, fy + 9, face, { w: 3.8 });
    // aviator goggles pushed up on the forehead
    const gy = Math.round(y - 7 + (H.tilt === 'up' ? -1 : 0));
    cv.part(ctx.mask().rect(x - Math.round(H.rx), gy - 1, Math.round(H.rx) * 2 + 1, 3).clip(hm.copy().add(ctx.mask().rect(x - 13, gy - 1, 27, 3))), { ramp: ['strap', 'strap', 'outline'].map(c), bevel: 1, inner: 'line', shadow: false });
    for (const s of [-1, 1]) {
      const gx = fx + s * 4.5 - (s > 0 ? 1 : 0);
      cv.part(ctx.mask().ellipse(gx, gy, 3.6, 3), { ramp: ramps.brass, bevel: 1, inner: 'line', shadow: false });
      cv.flat(ctx.mask().ellipse(gx, gy, 2.2, 1.8), c('lens'));
      cv.px(gx - 1, gy - 1, c('white'));
    }
  },

  torso(ctx) {
    const { cv, J, c, D, ramps, pose } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, h = J.hip;
    const tm = ctx.torsoMask;
    // bare shoulders, vest opening down the middle with a zip
    for (const s of ['L', 'R']) cv.part(ctx.mask().ellipse(J['sh' + s][0], J['sh' + s][1], D.deltoid + 1.2, D.deltoid + 1).clip(tm), { ramp: ramps.skin, bevel: 3, shadow: false });
    cv.part(ctx.mask().ellipse(n[0], n[1] + 2, 6.5, 4).clip(tm), { ramp: ramps.skin, bevel: 2, inner: 'line', shadow: false });
    cv.line(n[0], n[1] + 6, w[0], w[1] - 1, (X, Y) => { if (tm.in(X, Y)) cv.px(X, Y, c(Y % 2 ? 'reflectSh' : 'slickDk')); });
    // two silver reflective bands round the chest
    for (const yy of [ch[1] + 2, ch[1] + 10]) {
      const band = ctx.mask().rect(ch[0] - D.chestW - 2, yy, D.chestW * 2 + 4, 3).clip(tm);
      cv.part(band, { ramp: ramps.reflect, bevel: 1, inner: 'line', shadow: false });
    }
    // white storm spiral on the trunks
    if (!pose.lying) for (const s of [-1, 1]) {
      const cx = h[0] + s * (D.hipSpread + 4), cy = h[1] + 3;
      for (let a = 0; a < 26; a++) { const t = a * 0.45, r = 0.4 + a * 0.13; const X = Math.round(cx + Math.cos(t) * r * s), Y = Math.round(cy + Math.sin(t) * r); if (ctx.shortsMask.in(X, Y)) cv.px(X, Y, c('reflect')); }
    }
  },
};
