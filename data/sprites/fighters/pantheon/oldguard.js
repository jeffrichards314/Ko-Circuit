// The Old Guard (#63, Pantheon III's champion): sprite layers on the heavy build.
// The ghost of the first champion: a big old prizefighter in a pale spectral blue-white,
// a tall top hat with a torn brim, a white walrus moustache down over his chin, a
// gold championship belt (the first one ever made) across the stomach of his
// striped tights, bare-knuckle wraps, and wisps of ghost trailing off his shoulders.
// Each round he wears another era's look (palettes `oldguard.film` and `oldguard.tv`,
// the sepia one is the default): the 1890s, the silent film, the black-and-white television.
// Poses: stand1/2 like Tom's (the upright stance), crest (the taunt: the belt held up).

import { makePalette, swapPalette } from '../../../../src/engine/palette.js';
import { eyes, mouth, ears, skull, nose } from '../_face.js';
import { ribbon } from './_kit.js';

const A = makePalette('oldguard.A', {
  outline: [2, 3, 8],
  skinHi: [29, 30, 31], skin: [23, 26, 30], skinSh: [15, 18, 25], skinDk: [8, 10, 17],
  white: [31, 31, 31], mouth: [7, 8, 14],
  hairHi: [31, 31, 31], hair: [26, 28, 31], hairDk: [16, 19, 26],
  gloveHi: [29, 30, 31], glove: [22, 25, 29], gloveDk: [13, 16, 23],
});
const B = makePalette('oldguard.B', {
  stripeHi: [26, 28, 31], stripe: [17, 20, 27], stripeSh: [9, 11, 19],
  hatHi: [14, 16, 24], hat: [6, 7, 14], hatDk: [2, 3, 8],
  goldHi: [31, 30, 17], gold: [28, 22, 6], goldSh: [17, 11, 3],
  wisp: [20, 24, 31],
  bootHi: [15, 17, 25], boot: [8, 9, 16], bootDk: [3, 4, 9],
});
// the other two rounds: a silent film, a television set
const filmA = swapPalette('oldguard.filmA', A, {
  skinHi: [28, 28, 29], skin: [22, 22, 24], skinSh: [14, 14, 17], skinDk: [7, 7, 9],
  hairHi: [31, 31, 31], hair: [25, 25, 27], hairDk: [14, 14, 17],
  gloveHi: [28, 28, 29], glove: [21, 21, 23], gloveDk: [12, 12, 15], mouth: [6, 6, 8], outline: [1, 1, 3],
});
const filmB = swapPalette('oldguard.filmB', B, {
  stripeHi: [27, 27, 28], stripe: [17, 17, 19], stripeSh: [9, 9, 11],
  hatHi: [12, 12, 15], hat: [4, 4, 6], hatDk: [1, 1, 2],
  goldHi: [31, 31, 31], gold: [24, 24, 26], goldSh: [12, 12, 15], wisp: [22, 22, 25],
  bootHi: [13, 13, 16], boot: [6, 6, 8], bootDk: [2, 2, 3],
});
const tvA = swapPalette('oldguard.tvA', A, {
  skinHi: [30, 30, 29], skin: [23, 24, 22], skinSh: [14, 15, 13], skinDk: [6, 7, 6],
  hairHi: [31, 31, 30], hair: [26, 27, 25], hairDk: [15, 16, 14],
  gloveHi: [16, 17, 15], glove: [7, 8, 6], gloveDk: [2, 3, 2], mouth: [5, 6, 5], outline: [1, 2, 1],
});
const tvB = swapPalette('oldguard.tvB', B, {
  stripeHi: [31, 31, 30], stripe: [22, 23, 21], stripeSh: [12, 13, 11],
  hatHi: [14, 15, 13], hat: [6, 7, 5], hatDk: [2, 3, 2],
  goldHi: [31, 31, 30], gold: [25, 26, 24], goldSh: [13, 14, 12], wisp: [24, 25, 23],
  bootHi: [15, 16, 14], boot: [6, 7, 5], bootDk: [2, 3, 2],
});
// sepia: the 1890s (his own palette above is a ghost blue; the first round is brown)
const sepiaA = swapPalette('oldguard.sepiaA', A, {
  skinHi: [28, 22, 15], skin: [23, 17, 10], skinSh: [16, 11, 6], skinDk: [9, 6, 3],
  hairHi: [31, 28, 21], hair: [26, 22, 15], hairDk: [16, 13, 8],
  gloveHi: [30, 27, 21], glove: [25, 21, 14], gloveDk: [15, 12, 8], mouth: [9, 4, 3], outline: [4, 2, 2],
});
const sepiaB = swapPalette('oldguard.sepiaB', B, {
  stripeHi: [27, 23, 16], stripe: [20, 15, 9], stripeSh: [12, 9, 5],
  hatHi: [14, 9, 5], hat: [7, 4, 2], hatDk: [3, 2, 1],
  goldHi: [31, 28, 17], gold: [27, 20, 7], goldSh: [16, 11, 3], wisp: [24, 19, 12],
  bootHi: [15, 9, 5], boot: [9, 5, 3], bootDk: [4, 2, 1],
});
export const palettes = {
  oldguard: { A: sepiaA, B: sepiaB }, 'oldguard.film': { A: filmA, B: filmB }, 'oldguard.tv': { A: tvA, B: tvB }, 'oldguard.ghost': { A, B },
};

const FEET = { knL: [-15, -20], knR: [15, -20], ftL: [-17, 0], ftR: [17, 0] };
const poses = {
  stand1: {
    extends: 'idle1', shift: [1, 0], ...FEET,
    head: { at: [2, -101], face: 'focus', look: [1, 0] },
    shL: [-19, -82], elL: [-29, -74], fiL: [-25, -90], gloveL: { angle: 5 },
    shR: [21, -81], elR: [28, -66], fiR: [14, -80], gloveR: { angle: -30 },
  },
  stand2: { extends: 'stand1', shift: [0, 1], ...FEET, fiL: [-25, -88], fiR: [14, -78] },
  // holds the belt up for the crowd: the taunt
  crest: {
    extends: 'idle1', ...FEET,
    head: { at: [0, -101], face: 'grin', tilt: 'up', look: [0, -1] },
    elL: [-27, -68], fiL: [-8, -58], elR: [27, -68], fiR: [8, -58], gloveL: { angle: 120 }, gloveR: { angle: -120 },
    belt: 'up',
  },
  // the old-timer's hug: both arms spread wide, closing, and squeezing (the clinch)
  hugTell: {
    extends: 'idle1', shift: [0, 3], ...FEET,
    head: { at: [0, -97], face: 'strain', look: [0, 1] },
    shL: [-21, -80], elL: [-40, -78], fiL: [-52, -82], gloveL: { angle: -80, view: 'back' },
    shR: [21, -80], elR: [40, -78], fiR: [52, -82], gloveR: { angle: 80, view: 'back' },
  },
  hug: {
    extends: 'idle1', shift: [0, 5], ...FEET,
    head: { at: [0, -95], face: 'strain', tilt: 'down', look: [0, 1] },
    shL: [-19, -78], elL: [-12, -66], fiL: [6, -62], gloveL: { view: 'front', size: 1.3 },
    shR: [19, -78], elR: [12, -66], fiR: [-6, -64], gloveR: { view: 'front', size: 1.3 },
    frontOrder: ['L', 'R'],
  },
  holding: { extends: 'hug', shift: [0, 1], ...FEET, head: { at: [0, -93], face: 'grin', tilt: 'down', look: [0, 2] }, fiL: [8, -60], fiR: [-8, -62] },
};

export default {
  id: 'oldguard',
  build: 'heavy',
  // his own body: huge and old, a great barrel of a chest gone soft, thick forearms
  body: { size: [1.08, 1.0], legLen: 0.93, torsoLen: 1.05, shoulders: 1.1, neckLen: -1.5, dims: { neck: 9, chestW: 26, waistW: 21, belly: 11, upperArm: [7.8, 6.6], forearm: [6.6, 5.6] } },
  palettes: { default: 'oldguard' },
  torsoMaterial: 'skin',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['stripeHi', 'stripe', 'stripeSh'],
    shorts: ['stripeHi', 'stripe', 'stripeSh'],
    sock: ['stripeHi', 'stripe', 'stripeSh'],
    boot: ['bootHi', 'boot', 'bootDk'],
    sole: ['boot', 'bootDk', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    hat: ['hatHi', 'hat', 'hatDk'],
    gold: ['goldHi', 'gold', 'goldSh'],
  },

  // ghost wisps trailing off his shoulders
  back(ctx) {
    const { cv, J, c, pose } = ctx;
    if (pose.lying) return;
    const ramp = ['wisp', 'wisp', 'stripeSh'].map(c);
    ribbon(ctx, [J.shL[0] - 4, J.shL[1] - 1], -1, 30, { amp: 4, waves: 1.2, r0: 3, r1: 0.8, lift: -6, ramp, phase: 0.3 });
    ribbon(ctx, [J.shR[0] + 4, J.shR[1] - 1], 1, 30, { amp: 4, waves: 1.2, r0: 3, r1: 0.8, lift: -6, ramp, phase: 2.3 });
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';
    ears(ctx, H, ramps.skin, [2.8, 3.6]);
    const hm = skull(ctx, H, ramps.skin, 'square');
    // white side-whiskers and a tall top hat with a torn brim
    for (const s of [-1, 1]) cv.part(ctx.mask().rect(x + s * (H.rx - 2) - 1.5 + lx * 0.3, y - 3, 3.4, 12), { ramp: ramps.hair, bevel: 1, inner: 'line', shadow: false });
    cv.part(ctx.mask().rect(x - H.rx + 2 + lx * 0.4, y - 23, H.rx * 2 - 4, 17), { ramp: ramps.hat, bevel: 3, inner: 'line' });
    cv.part(ctx.mask().rect(x - H.rx + 2 + lx * 0.4, y - 11, H.rx * 2 - 4, 3), { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
    cv.part(ctx.mask().ellipse(x + lx * 0.4, y - 6.4, H.rx + 3.6, 2.5).cut(ctx.mask().poly([[x + 6, y - 9], [x + 11, y - 9], [x + 9, y - 4]])), { ramp: ramps.hat, bevel: 1, inner: 'line' });
    cv.px(x - 5 + lx * 0.4, y - 20, c('hatHi')); cv.px(x - 5 + lx * 0.4, y - 18, c('hatHi'));
    // eyes under the brim, bushy white brows, a big nose
    eyes(ctx, fx, fy, face === 'neutral' ? 'focus' : face, 1);
    cv.part(ctx.mask().capsule(fx - 9, fy - 2.8, fx - 1, fy - 2.2, 1.8, 1.5).capsule(fx + 1, fy - 2.2, fx + 9, fy - 2.8, 1.5, 1.8), { ramp: ramps.hair, bevel: 1, inner: 'soft' });
    nose(ctx, fx, fy, ramps.skin, [3, 2.7], 3.8);
    // the walrus moustache, hanging over the mouth and the chin
    const mu = ctx.mask().ellipse(fx - 4.2, fy + 7.4, 5.4, 3, 1, -0.2).ellipse(fx + 4.2, fy + 7.4, 5.4, 3, 1, 0.2).ellipse(fx, fy + 6.6, 3.4, 2);
    mu.poly([[fx - 9, fy + 8], [fx - 12, fy + 15], [fx - 7, fy + 11]]).poly([[fx + 9, fy + 8], [fx + 12, fy + 15], [fx + 7, fy + 11]]);
    cv.part(mu, { ramp: ramps.hair, bevel: 2, inner: 'line' });
    for (let i = -8; i <= 8; i += 3) cv.shade(fx + i, fy + 9 + (i & 2 ? 1 : 0), 1);
    ctx.headMask = hm;
    void mouth;
  },

  torso(ctx) {
    const { cv, J, c, ramps, D, pose } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, tm = ctx.torsoMask;
    for (let j = -5; j <= 14; j++) for (let i = -8; i <= 8; i += 1) if ((i * 7 + j * 5) % 10 === 0 && Math.abs(i) <= 8 - Math.abs(j - 3) / 3) cv.shade(ch[0] + i, ch[1] + j, 1);
    if (pose.lying) return;
    // striped tights up over the belly, and the belt: a great gold plate on a black strap
    const by = Math.round(w[1] - 4), sm = ctx.shortsMask;
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, by, D.waistW * 2 + 2, 10).clip(ctx.mask().add(tm).add(sm)), { ramp: ramps.shorts, bevel: 2, inner: 'line', shadow: false });
    for (let X = Math.round(w[0] - D.waistW - 2); X < w[0] + D.waistW + 2; X += 4) for (let Y = by; Y < J.hip[1] + 14; Y++) if (sm.in(X, Y)) cv.shade(X, Y, 1);
    cv.part(ctx.mask().rect(w[0] - D.waistW - 2, w[1] - 3, D.waistW * 2 + 4, 5).clip(ctx.mask().add(tm).add(sm)), { ramp: ['bootHi', 'boot', 'bootDk'].map(c), bevel: 1, inner: 'line', shadow: false });
    const up = pose.belt === 'up' ? -6 : 0;
    cv.part(ctx.mask().ellipse(w[0], w[1] - 1 + up, 11, 6.5), { ramp: ramps.gold, bevel: 4, inner: 'line' });
    cv.part(ctx.mask().ellipse(w[0], w[1] - 1 + up, 6, 3.6), { ramp: ['goldSh', 'gold', 'goldHi'].map(c), bevel: 2, inner: 'line', shadow: false });
    for (const [dx, dy] of [[-8, 0], [8, 0], [0, -5], [0, 4]]) cv.px(w[0] + dx, w[1] - 1 + up + dy, c('goldHi'));
  },
};
