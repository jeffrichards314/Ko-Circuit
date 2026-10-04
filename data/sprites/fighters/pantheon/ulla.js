// Updraft Ulla (#57): sprite layers on the medium build.
// A windswept warrior: brown skin, a long braid of silver-white hair blown out to the
// viewer's right, a gold circlet with a feather, a teal cropped top with gold trim and a
// sash that streams behind her, gold bracers and greaves, teal trunks, white gloves.
// Poses: gale (arms up and out, pennants flying: the call that starts the gale).

import { makePalette } from '../../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from '../_face.js';
import { ribbon } from './_kit.js';

const A = makePalette('ulla.A', {
  outline: [2, 3, 5],
  skinHi: [26, 18, 12], skin: [20, 12, 8], skinSh: [13, 7, 5], skinDk: [7, 4, 3],
  white: [31, 31, 31], mouth: [10, 2, 4],
  hairHi: [31, 31, 31], hair: [25, 27, 30], hairDk: [14, 16, 22],
  gloveHi: [31, 31, 31], glove: [26, 28, 31], gloveDk: [14, 17, 24],
});
const B = makePalette('ulla.B', {
  tealHi: [10, 28, 27], teal: [2, 19, 20], tealDk: [1, 9, 12],
  goldHi: [31, 30, 16], gold: [28, 21, 4], goldSh: [17, 10, 2],
  sashHi: [31, 20, 14], sash: [28, 9, 8], sashDk: [15, 3, 5],
  featherHi: [31, 31, 30], feather: [22, 27, 31],
});
export const palettes = { ulla: { A, B } };

const poses = {
  // arms flung up, the wind in her hair: the gale
  gale: {
    extends: 'idle1', shift: [-1, 0],
    head: { at: [-2, -102], face: 'strain', tilt: 'up', look: [-1, -1] },
    elL: [-33, -88], elR: [30, -90], fiL: [-30, -108], fiR: [26, -110],
    gloveL: { angle: 20 }, gloveR: { angle: -15 },
    gale: true,
  },
};

export default {
  id: 'ulla',
  build: 'medium',
  // her own body: an athlete's, strong shoulders, a narrow waist, long legs
  body: { size: [0.99, 1.0], legLen: 1.02, torsoLen: 0.98, shoulders: 1.04, dims: { waistW: 14, belly: 1.5, upperArm: [5.6, 4.6] } },
  palettes: { default: 'ulla' },
  torsoMaterial: 'skin',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['goldHi', 'gold', 'goldSh'],
    shorts: ['tealHi', 'teal', 'tealDk'],
    sock: ['goldHi', 'gold', 'goldSh'],
    boot: ['goldHi', 'gold', 'goldSh'],
    sole: ['goldSh', 'tealDk', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    gold: ['goldHi', 'gold', 'goldSh'],
    teal: ['tealHi', 'teal', 'tealDk', 'outline'],
    sash: ['sashHi', 'sash', 'sashDk'],
  },

  // the sash and the braid stream out behind her to the viewer's right
  back(ctx) {
    const { J, ramps, pose } = ctx;
    if (pose.lying) return;
    const w = J.waist, h = J.head;
    const lift = pose.gale ? -12 : -2;
    ribbon(ctx, [w[0] + 9, w[1] + 1], 1, 34, { amp: 4, waves: 1.3, r0: 3, r1: 1, lift, ramp: ramps.sash, phase: 0.4 });
    ribbon(ctx, [h[0] + 7, h[1] + 1], 1, 38, { amp: 5, waves: 1.6, r0: 3.2, r1: 1.1, lift: lift - 2, ramp: ramps.hair, phase: 1.4 });
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';
    ears(ctx, H, ramps.skin, [2, 3]);
    const hm = skull(ctx, H, ramps.skin, 'narrow');
    // silver-white hair pulled back off a high brow, the braid streaming out behind
    const hair = ctx.mask().ellipse(x + lx * 0.3, y - 5, H.rx + 0.6, 7).cut(ctx.mask().ellipse(fx, fy + 1.5, H.rx - 1.8, 8));
    hair.ellipse(x - H.rx + 0.5 + lx * 0.3, y + 3, 2.2, 6);
    cv.part(hair, { ramp: ramps.hair, bevel: 3, inner: 'line' });
    for (let i = -5; i <= 5; i += 3) cv.px(x + i + lx * 0.3, y - 10 + (i & 1), c('hairHi'));
    // a gold circlet with a white feather
    cv.part(ctx.mask().rect(x - H.rx + 0.5 + lx * 0.3, y - 6.5, H.rx * 2 - 1, 2), { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
    cv.part(ctx.mask().poly([[x - 5 + lx * 0.3, y - 7], [x - 7 + lx * 0.3, y - 15], [x - 3 + lx * 0.3, y - 18], [x - 2 + lx * 0.3, y - 10]]), { ramp: ['featherHi', 'feather', 'feather'].map(c), bevel: 1, inner: 'line', shadow: false });
    eyes(ctx, fx, fy, face === 'neutral' ? 'focus' : face, -1);
    brows(ctx, fx, fy, face, ramps.hair, { len: 3.8, thick: 0.9, y: -4 });
    nose(ctx, fx, fy, ramps.skin, [1.7, 1.9], 3.4);
    mouth(ctx, fx, fy + 8, face === 'neutral' ? 'teeth' : face, { w: 3 });
    // a windswept scar under one eye
    cv.px(fx + 5, fy + 3, c('skinHi')); cv.px(fx + 6, fy + 4, c('skinHi'));
    ctx.headMask = hm;
  },

  torso(ctx) {
    const { cv, J, c, ramps, D, pose } = ctx;
    if (pose.lying) return;
    const n = J.neck, w = J.waist, ch = J.chest, tm = ctx.torsoMask;
    // a teal cropped top with gold trim and a gold clasp between the pecs
    const top = ctx.mask().poly([[n[0] - 10, n[1] + 1], [n[0] + 10, n[1] + 1], [ch[0] + D.chestW - 1, ch[1] + 5], [ch[0] - D.chestW + 1, ch[1] + 5]]).clip(tm);
    cv.part(top, { ramp: ramps.teal, bevel: 4, inner: 'line' });
    cv.line(ch[0] - D.chestW + 1, ch[1] + 5, ch[0] + D.chestW - 1, ch[1] + 5, (X, Y) => cv.px(X, Y, c('gold')));
    for (const s of [-1, 1]) cv.line(n[0] + s * 10, n[1] + 2, ch[0] + s * (D.chestW - 1), ch[1] + 4, (X, Y) => cv.px(X, Y, c('goldHi')));
    cv.part(ctx.mask().ellipse(ch[0], ch[1] - 1, 2.4, 2.2), { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
    // a sash round the waist, gold bands on the trunks
    const by = Math.round(w[1]);
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, by - 2, D.waistW * 2 + 2, 4).clip(ctx.mask().add(tm).add(ctx.shortsMask)), { ramp: ramps.sash, bevel: 2, inner: 'line', shadow: false });
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, by + 3, D.waistW * 2 + 2, 2).clip(ctx.shortsMask), { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
  },
};
