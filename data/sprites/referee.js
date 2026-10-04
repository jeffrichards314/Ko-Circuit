// The referee: sprite layers on the medium build, drawn small at the back of
// the ring during counts (src/fight/fightState.js). A bald crown with a grey
// fringe, a thin moustache, a crisp white shirt with a black bow tie, black
// trousers and shoes. No gloves: bare hands, one chopping down on every count.
// Poses: refStand (hands on hips), refCount1 / refCount2 (the count: arm up,
// arm down), refWave (arms crossing over his head: it's over).

import { makePalette } from '../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './fighters/_face.js';

const A = makePalette('referee.A', {
  outline: [3, 3, 4],
  skinHi: [31, 24, 19], skin: [27, 18, 13], skinSh: [20, 11, 9], skinDk: [11, 6, 5],
  white: [31, 31, 31], mouth: [12, 3, 4],
  hairHi: [24, 24, 25], hair: [15, 15, 17],
  // (hands only: the glove ramp is his skin)
  gloveHi: [31, 24, 19], glove: [27, 18, 13], gloveDk: [20, 11, 9],
});
const B = makePalette('referee.B', {
  shirtHi: [31, 31, 31], shirt: [28, 29, 30], shirtSh: [20, 21, 25], shirtDk: [12, 13, 17],
  tie: [3, 3, 5], tieHi: [9, 9, 12],
  pantsHi: [8, 8, 11], pants: [4, 4, 6],
  shoe: [6, 6, 8], shoeHi: [14, 14, 17],
});
export const palettes = { referee: { A, B } };

const DOWN = { elL: [-24, -50], elR: [24, -50], fiL: [-24, -30], fiR: [24, -30], gloveL: { hidden: true }, gloveR: { hidden: true } };
const poses = {
  refStand: { extends: 'idle1', ...DOWN, elL: [-28, -58], fiL: [-18, -46], elR: [28, -58], fiR: [18, -46], head: { at: [0, -100], face: 'neutral', look: [0, 1] } },
  // the count: the right arm up, then chopping down
  refCount1: { extends: 'refStand', elR: [30, -86], fiR: [26, -110], head: { at: [0, -100], face: 'focus', look: [1, 1] } },
  refCount2: { extends: 'refStand', elR: [32, -64], fiR: [36, -50], head: { at: [0, -100], face: 'focus', look: [1, 2] } },
  // it's over: both arms swept across over his head
  refWave: { extends: 'refStand', elL: [-28, -100], fiL: [10, -124], elR: [28, -100], fiR: [-10, -124], head: { at: [0, -100], face: 'grin', look: [0, 0] } },
};

export default {
  id: 'referee',
  build: 'medium',
  // his own body on the build: a trim, straight-backed official
  body: { size: [0.98, 1], shoulders: 0.92, legLen: 1.04, dims: { belly: 3, waistW: 14.5, upperArm: [4.8, 4], forearm: [4.2, 3.5], shortsLen: 0.55 } },
  palettes: { default: 'referee' },
  torsoMaterial: 'shirt',
  sleeve: { material: 'shirt', length: 0.95 },
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    shirt: ['shirtHi', 'shirt', 'shirtSh', 'shirtDk'],
    shorts: ['pantsHi', 'pants', 'outline'],
    pants: ['pantsHi', 'pants', 'outline'],
    boot: ['shoeHi', 'shoe', 'outline'],
    sole: ['shoe', 'outline', 'outline'],
    hair: ['hairHi', 'hair', 'outline'],
    tie: ['tieHi', 'tie', 'outline'],
  },

  head(ctx, H) {
    const { cv, ramps } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';
    ears(ctx, H, ramps.skin, [2.2, 3.2]);
    skull(ctx, H, ramps.skin, 'round');
    // grey fringe round the back of a bald crown
    // (only above the ears: across the face it read as a pair of glasses)
    const fr = ctx.mask().ellipse(x, y - 6, H.rx + 0.6, 4).cut(ctx.mask().rect(x - H.rx + 2.5, y - 14, (H.rx - 2.5) * 2, 20)).cut(ctx.mask().rect(x - 14, y - 3, 28, 10));
    cv.part(fr, { ramp: ramps.hair, bevel: 1, inner: 'line' });
    cv.shade(x - 3, y - 9, -2); cv.shade(x - 2, y - 10, -2);
    eyes(ctx, fx, fy, face, 0);
    brows(ctx, fx, fy, face, ramps.hair, { len: 4, thick: 1, y: -3.8 });
    nose(ctx, fx, fy, ramps.skin, [2, 2], 3.4);
    // a thin, tidy moustache
    for (let i = -3; i <= 3; i++) cv.px(fx + i, fy + 6, ctx.c('hair'));
    mouth(ctx, fx, fy + 8, face, { w: 3 });
  },

  // black trousers down to the shoes (the shorts pass only reaches mid-thigh)
  torso(ctx) {
    const { J, D, cv, ramps, pose } = ctx;
    const spread = (pose.hipSpread ?? D.hipSpread) * ctx.sx;
    for (const s of ['L', 'R']) {
      const sign = s === 'L' ? -1 : 1;
      const hip = [J.hip[0] + sign * spread, J.hip[1]], kn = J['kn' + s], ft = J['ft' + s];
      const m = ctx.mask().capsule(hip[0], hip[1] - 2, kn[0], kn[1], D.thigh[0] + 1, D.thigh[1] + 1.2)
        .capsule(kn[0], kn[1], ft[0], ft[1] - D.ankle, D.shin[0] + 1.2, D.shin[1] + 1.4);
      cv.part(m, { ramp: ramps.pants, bevel: 3, inner: 'line' });
      cv.shade(kn[0] + sign, kn[1] + 1, 1);
    }
    // bow tie at the collar, and a line of buttons
    const n = J.neck;
    cv.part(ctx.mask().poly([[n[0] - 5, n[1] + 1], [n[0], n[1] + 3], [n[0] - 5, n[1] + 5]]).poly([[n[0] + 5, n[1] + 1], [n[0], n[1] + 3], [n[0] + 5, n[1] + 5]]).ellipse(n[0], n[1] + 3, 1.4, 1.4), { ramp: ramps.tie, bevel: 1, inner: 'line', shadow: false });
    for (let k = 0; k < 4; k++) cv.shade(J.chest[0], n[1] + 9 + k * 7, 2);
  },

  // bare hands where the gloves would be
  front(ctx) {
    const { J, cv, ramps } = ctx;
    for (const s of ['L', 'R']) {
      const fi = J['fi' + s];
      cv.part(ctx.mask().ellipse(fi[0], fi[1], 3.4, 3.8), { ramp: ramps.skin, bevel: 2, inner: 'line' });
    }
  },
};
