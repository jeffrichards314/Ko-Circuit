// Cyclone Cole: sprite layers on the medium build.
// A dust-bowl whirlwind: a long dark ponytail and a white sweatband, a
// violet sleeveless windbreaker vest with a white spiral print, violet trunks,
// white sneakers, teal gloves. The spin frames turn him all the way round:
// spinA front, spinB side, spinC his back (ponytail and all), spinD the other
// side, spinSet facing you again. Count the backs.

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './_face.js';

const A = makePalette('cole.A', {
  outline: [2, 2, 3],
  skinHi: [30, 23, 16], skin: [25, 16, 10], skinSh: [18, 10, 7], skinDk: [10, 5, 4],
  white: [31, 31, 31], mouth: [13, 3, 5],
  hairHi: [11, 8, 7], hair: [5, 3, 3], hairDk: [2, 1, 2],
  gloveHi: [12, 30, 27], glove: [3, 21, 20], gloveDk: [1, 11, 12],
});
const B = makePalette('cole.B', {
  vestHi: [22, 14, 28], vest: [14, 7, 21], vestDk: [7, 3, 12], swirl: [28, 26, 31],
  trunkHi: [18, 10, 24], trunk: [11, 5, 16], trunkDk: [5, 2, 9],
  band: [31, 31, 31], bandSh: [21, 21, 25],
  shoeHi: [31, 31, 31], shoe: [24, 24, 27], shoeDk: [14, 14, 18],
});
export const palettes = { cole: { A, B } };

const TUCK = {
  elL: [-20, -68], elR: [20, -68], fiL: [-6, -80], fiR: [6, -80],
  gloveL: { angle: 30 }, gloveR: { angle: -30 },
};
const SIDE = {
  hip: [2, -43], waist: [2, -54], chest: [2, -72], neck: [2, -87],
  shL: [-7, -81], shR: [11, -81], hipSpread: 3,
  knL: [-2, -22], knR: [6, -22], ftL: [-4, 0], ftR: [8, 0],
  elL: [16, -68], fiL: [24, -80], elR: [22, -62], fiR: [30, -74],
  gloveL: { angle: 60 }, gloveR: { angle: 70 },
  armZ: { L: 'back' },
};

const poses = {
  spinA: { extends: 'idle1', shift: [0, 1], ...TUCK, head: { at: [0, -99], face: 'focus', look: [0, 0] } },
  spinB: { extends: 'idle1', shift: [0, 1], ...SIDE, head: { at: [3, -99], face: 'side', look: [4, 0] } },
  spinC: { extends: 'idle1', shift: [0, 1], ...TUCK, back: true, frontOrder: ['L', 'R'], armZ: { L: 'back', R: 'back' }, head: { at: [0, -99], face: 'back', look: [0, 0] } },
  spinD: { mirror: 'spinB' },
  spinSet: {
    extends: 'idle1', shift: [0, 2],
    head: { at: [0, -98], face: 'grin', look: [0, 0] },
    elL: [-30, -66], elR: [30, -66], fiL: [-24, -80], fiR: [24, -80],
    gloveL: { angle: -20 }, gloveR: { angle: 20 },
  },
};

export default {
  id: 'cole',
  build: 'medium',
  // his own body on the build: a spinner: compact, with thick legs to pivot on
  body: { legLen: 0.95, dims: { thigh: [8.4, 6.6], shin: [6, 4.6] } },
  palettes: { default: 'cole' },
  torsoMaterial: 'vest',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['band', 'bandSh', 'vestDk'],
    vest: ['vestHi', 'vest', 'vestDk', 'outline'],
    shorts: ['trunkHi', 'trunk', 'trunkDk'],
    sock: ['band', 'bandSh', 'shoeDk'],
    boot: ['shoeHi', 'shoe', 'shoeDk'],
    sole: ['shoeDk', 'trunkDk', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    band: ['band', 'band', 'bandSh'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';
    const back = face === 'back', side = face === 'side';

    // ponytail: behind the head from the front, swinging out on the sides, down the back
    const tailDir = back ? 0 : side ? -Math.sign(lx || 1) : 1;
    const tail = ctx.mask();
    if (back) tail.capsule(x, y - 2, x + 1, y + 16, 3.4, 2.4);
    else tail.capsule(x + tailDir * 6, y - 6, x + tailDir * 15, y + 6, 3.2, 2);
    cv.part(tail, { ramp: ramps.hair, bevel: 2, inner: 'line' });
    if (!back) ears(ctx, H, ramps.skin, [2.2, 3.2]);
    const hm = skull(ctx, H, ramps.skin, back ? 'round' : 'chin');
    if (back) {
      // the back of his head: all hair, the band knot, the tail on top
      cv.part(ctx.mask().ellipse(x, y - 1, H.rx + 0.5, H.ry - 0.5).clip(hm), { ramp: ramps.hair, bevel: 4, inner: 'line' });
      cv.part(ctx.mask().rect(x - Math.round(H.rx) - 1, y - 8, Math.round(H.rx) * 2 + 3, 3), { ramp: ramps.band, bevel: 1, inner: 'line', shadow: false });
      cv.part(ctx.mask().ellipse(x, y - 6, 2.4, 2).ellipse(x - 2, y - 3, 1.2, 2.4).ellipse(x + 2, y - 3, 1.2, 2.4), { ramp: ramps.band, bevel: 1, inner: 'line', shadow: false });
      cv.part(ctx.mask().capsule(x, y - 2, x + 1, y + 16, 3.2, 2.2), { ramp: ramps.hair, bevel: 2, inner: 'line' });
      return;
    }
    // hair swept back over the top
    const hr = ctx.mask().ellipse(x + lx * 0.3, y - 7, H.rx + 0.5, 6).cut(ctx.mask().rect(x - 14, y - 5, 28, 12));
    cv.part(hr, { ramp: ramps.hair, bevel: 3, inner: 'line' });
    // sweatband
    cv.part(ctx.mask().rect(x - Math.round(H.rx), y - 8, Math.round(H.rx) * 2 + 1, 3).clip(hm.copy().add(hr)), { ramp: ramps.band, bevel: 1, inner: 'line', shadow: false });
    if (side) {
      // profile-ish: both eyes pushed to the side he's turned toward
      const s = Math.sign(lx);
      cv.px(fx + s * 3, fy, c('outline')); cv.px(fx + s * 3, fy + 1, c('outline')); cv.px(fx + s * 4, fy, c('white'));
      cv.part(ctx.mask().ellipse(fx + s * 8, fy + 4, 2, 2.2), { ramp: ramps.skin, bevel: 1, inner: 'soft' });
      for (let i = 0; i < 3; i++) cv.px(fx + s * (5 + i), fy + 9, c('outline'));
      return;
    }
    eyes(ctx, fx, fy, face, 0);
    brows(ctx, fx, fy, face, ramps.hair, { len: 4.2, thick: 1.1, y: -4 });
    nose(ctx, fx, fy, ramps.skin, [2, 2.2], 3.6);
    mouth(ctx, fx, fy + 9, face, { w: 3.6 });
  },

  torso(ctx) {
    const { cv, J, c, D, ramps, pose } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest;
    const tm = ctx.torsoMask;
    for (const s of ['L', 'R']) cv.part(ctx.mask().ellipse(J['sh' + s][0], J['sh' + s][1], D.deltoid + 1.2, D.deltoid + 0.8).clip(tm), { ramp: ramps.skin, bevel: 3, shadow: false });
    if (pose.back) {
      // his back: shoulder blades and a spine line, the spiral across the vest's back
      cv.line(n[0], n[1] + 4, w[0], w[1] - 2, (X, Y) => { if (tm.in(X, Y)) cv.shade(X, Y, 1); });
    } else {
      cv.part(ctx.mask().ellipse(n[0], n[1] + 2, 6, 3.5).clip(tm), { ramp: ramps.skin, bevel: 2, inner: 'line', shadow: false });
      cv.line(n[0], n[1] + 6, w[0], w[1] - 1, (X, Y) => { if (tm.in(X, Y)) cv.px(X, Y, c('vestDk')); });
    }
    // the white spiral print
    if (!pose.lying) {
      const cx = ch[0] + (pose.back ? 0 : 8), cy = ch[1] + 2;
      for (let a = 0; a < 40; a++) { const t = a * 0.42, r = 0.5 + a * 0.2; const X = Math.round(cx + Math.cos(t) * r), Y = Math.round(cy + Math.sin(t) * r * 0.9); if (tm.in(X, Y)) cv.px(X, Y, c('swirl')); }
    }
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, w[1] - 3, D.waistW * 2 + 2, 3).clip(ctx.shortsMask), { ramp: ramps.band, bevel: 1, inner: 'line', shadow: false });
  },
};
