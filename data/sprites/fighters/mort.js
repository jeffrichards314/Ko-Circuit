// Mort the Mailman: sprite layers on the heavy build.
// Veteran letter carrier: pith sun-helmet with a navy band, grey pencil
// mustache, short-sleeved postal-blue shirt with an eagle-less mail patch,
// a whistle on a lanyard, a leather mailbag slung across the chest, navy
// shorts with a stripe, knee socks and polished black shoes. Red "air mail" gloves.

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './_face.js';

const A = makePalette('mort.A', {
  outline: [3, 2, 3],
  skinHi: [25, 17, 12], skin: [19, 12, 8], skinSh: [13, 8, 5], skinDk: [8, 4, 3],
  white: [30, 30, 29], mouth: [11, 3, 4],
  hairHi: [26, 26, 27], hair: [17, 17, 19], hairDk: [9, 9, 11],
  gloveHi: [31, 18, 15], glove: [27, 6, 6], gloveDk: [15, 2, 4],
  metal: [24, 25, 28],
});
const B = makePalette('mort.B', {
  shirtHi: [24, 27, 30], shirt: [16, 20, 26], shirtSh: [10, 13, 20],
  navyHi: [9, 11, 20], navy: [5, 6, 13], navyDk: [2, 3, 7],
  helmetHi: [31, 30, 26], helmet: [26, 24, 19], helmetSh: [18, 16, 12],
  leatherHi: [23, 14, 7], leather: [16, 9, 4], leatherDk: [9, 5, 2],
  patch: [27, 6, 7], gold: [29, 23, 7],
});
export const palettes = { mort: { A, B } };

export default {
  id: 'mort',
  build: 'heavy',
  // his own body on the build: a stocky old letter carrier: thick bike-rider calves, a little paunch
  body: { size: [0.98, 0.95], legLen: 0.95, dims: { belly: 8, shin: [7, 5.6], thigh: [9.6, 7.4] } },
  palettes: { default: 'mort' },
  torsoMaterial: 'shirt',
  sleeve: { material: 'shirt', length: 0.5 },
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['white', 'white', 'metal', 'hairDk'],
    shirt: ['shirtHi', 'shirt', 'shirtSh', 'navy'],
    shorts: ['shirt', 'shirtSh', 'navyHi'],
    sock: ['navyHi', 'navy', 'navyDk'],
    boot: ['hairDk', 'navyDk', 'outline'],
    sole: ['hair', 'hairDk', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    helmet: ['helmetHi', 'helmet', 'helmetSh', 'leatherDk'],
    leather: ['leatherHi', 'leather', 'leatherDk'],
    metal: ['white', 'metal', 'hairDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    ears(ctx, H, ramps.skin, [2.6, 3.6]);
    const hm = skull(ctx, H, ramps.skin, 'square');
    // grey sideburns + a short grey back-and-sides
    for (let j = -3; j <= 3; j++) for (const X of [x - Math.round(H.rx) + 1, x + Math.round(H.rx) - 2]) if (hm.in(X, y + j)) cv.px(X + lx * 0.3, y + j + ly * 0.5, c(j < 0 ? 'hairHi' : 'hair'));
    // jowls
    for (const s of [-1, 1]) { cv.shade(fx + s * 7, fy + 8, 1); cv.shade(fx + s * 8, fy + 7, 1); cv.shade(fx + s * 7, fy + 9, 1); }

    eyes(ctx, fx, fy, face, 0);
    brows(ctx, fx, fy, face, ramps.hair, { len: 5, thick: 1.3 });
    nose(ctx, fx, fy, ramps.skin, [2.6, 2.3], 3.5);
    mouth(ctx, fx, fy + 9, face, { w: 4 });
    // neat pencil mustache
    const lift = face === 'grin' ? -1 : 0;
    const mu = ctx.mask().rect(fx - 5, fy + 6.5 + lift, 10, 1.6).rect(fx - 6, fy + 7.5 + lift, 2, 1).rect(fx + 4, fy + 7.5 + lift, 2, 1);
    cv.part(mu, { ramp: ramps.hair, bevel: 1, inner: 'soft', shadow: false });
    // chin cleft
    cv.shade(fx, fy + 12, 1);

    // pith sun-helmet: dome, navy band, wide brim all around
    const cy = y + (H.tilt === 'up' ? -1 : H.tilt === 'down' ? 1 : 0);
    const dome = ctx.mask().ellipse(x + lx * 0.4, cy - 8, H.rx + 1.2, 8.5).cut(ctx.mask().rect(x - 30, cy - 5, 60, 20));
    cv.part(dome, { ramp: ramps.helmet, bevel: 6 });
    for (const dx of [-5, 0, 5]) cv.line(x + dx * 0.6 + lx * 0.4, cy - 15, x + dx + lx * 0.4, cy - 7, (X, Y) => cv.shade(X, Y, 1));
    cv.part(ctx.mask().ellipse(x + lx * 0.4, cy - 16.5, 1.4, 1), { ramp: ramps.helmet, bevel: 1, shadow: false });
    const band = ctx.mask().rect(x - H.rx - 2, cy - 8, H.rx * 2 + 4, 3).clip(dome);
    cv.part(band, { ramp: ['navyHi', 'navy', 'navyDk'].map(c), bevel: 1, inner: 'line', shadow: false });
    const brimY = H.tilt === 'up' ? cy - 6 : cy - 4.5;
    const brim = ctx.mask().ellipse(x + lx * 0.6, brimY, H.rx + 5, H.tilt === 'up' ? 2.2 : 2.8).cut(dome);
    cv.part(brim, { ramp: ramps.helmet, bevel: 1, bias: -0.3, inner: 'line' });
    if (H.tilt !== 'up') for (let i = -9; i <= 9; i++) if (hm.in(fx + i, Math.round(brimY) + 3)) cv.shade(fx + i, Math.round(brimY) + 3, 1);
  },

  back(ctx) {
    // the mailbag hangs behind the viewer-right hip
    const { cv, J, ramps, pose } = ctx;
    if (pose.lying) return;
    const w = J.waist;
    const bag = ctx.mask().poly([[w[0] + 14, w[1] - 4], [w[0] + 34, w[1] - 2], [w[0] + 33, w[1] + 15], [w[0] + 16, w[1] + 16]]);
    cv.part(bag, { ramp: ramps.leather, bevel: 3 });
    const flap = ctx.mask().poly([[w[0] + 14, w[1] - 4], [w[0] + 34, w[1] - 2], [w[0] + 33, w[1] + 5], [w[0] + 15, w[1] + 4]]);
    cv.part(flap, { ramp: ramps.leather, bevel: 2, bias: 0.2, inner: 'line' });
    cv.px(w[0] + 24, w[1] + 4, ctx.c('gold')); cv.px(w[0] + 25, w[1] + 4, ctx.c('gold'));
    // envelopes peeking out
    cv.px(w[0] + 19, w[1] - 5, ctx.c('white')); cv.px(w[0] + 20, w[1] - 6, ctx.c('white')); cv.px(w[0] + 21, w[1] - 5, ctx.c('white'));
  },

  torso(ctx) {
    const { cv, J, c, ramps, D } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest;
    const nx = Math.round(n[0]), ny = Math.round(n[1]);
    // open collar
    const col = ctx.mask().poly([[nx - 8, ny], [nx - 1, ny + 7], [nx - 8, ny + 5]]).poly([[nx + 8, ny], [nx + 1, ny + 7], [nx + 8, ny + 5]]);
    cv.part(col, { ramp: ramps.shirt, bevel: 1, bias: 0.2, inner: 'line' });
    const vee = ctx.mask().poly([[nx - 3, ny + 1], [nx + 3, ny + 1], [nx, ny + 6]]).clip(ctx.torsoMask);
    cv.part(vee, { ramp: ramps.skin, bevel: 1, shadow: false });
    // placket, buttons
    cv.line(n[0], n[1] + 7, w[0], w[1] - 3, (X, Y) => cv.shade(X, Y, 1));
    for (let k = 0; k < 4; k++) cv.px(n[0] + 1, n[1] + 10 + k * 6, c('white'));
    // mail patch on the viewer-right chest
    const px = Math.round(ch[0] + 12), py = Math.round(ch[1] - 6);
    cv.part(ctx.mask().rect(px - 3, py, 7, 5), { ramp: ['white', 'white', 'metal'].map(c), bevel: 1, inner: 'line', shadow: false });
    cv.stamp(['.ppp.', 'p.p.p', '.ppp.'], px - 2, py + 1, { p: c('patch') });
    // whistle on a lanyard
    cv.line(nx - 5, ny + 2, nx - 9, ny + 16, (X, Y) => cv.px(X, Y, c('patch')));
    cv.part(ctx.mask().rect(nx - 12, ny + 16, 5, 3), { ramp: ramps.metal, bevel: 1, inner: 'line', shadow: false });
    // mailbag strap: viewer-left shoulder to viewer-right hip
    const s0 = J.shL, s1 = [w[0] + 16, w[1] - 2];
    const strap = ctx.mask().capsule(s0[0] + 2, s0[1] - 2, s1[0], s1[1], 2.4, 2.4).clip(ctx.torsoMask);
    cv.part(strap, { ramp: ramps.leather, bevel: 1, inner: 'line' });
    for (let t = 0.2; t < 1; t += 0.3) { const X = s0[0] + (s1[0] - s0[0]) * t, Y = s0[1] + (s1[1] - s0[1]) * t; if (strap.in(Math.round(X), Math.round(Y))) cv.px(X, Y, c('gold')); }
    // shirt tucked in, belt, fold lines over the belly
    for (const s of [-1, 1]) cv.line(w[0] + s * 10, w[1] - 9, w[0] + s * 14, w[1] - 2, (X, Y) => cv.shade(X, Y, 1));
    const by = Math.round(w[1] - 2);
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, by - 1, D.waistW * 2 + 2, 3).clip(ctx.shortsMask), { ramp: ramps.leather, bevel: 1, inner: 'line', shadow: false });
    cv.part(ctx.mask().rect(w[0] - 2, by - 1, 4, 3), { ramp: ['gold', 'gold', 'leather'].map(c), bevel: 1, inner: 'line', shadow: false });
    // stripe down the side of the shorts
    const h = J.hip;
    for (const s of [-1, 1]) cv.line(h[0] + s * (D.hipSpread + 7), h[1] - 2, h[0] + s * (D.hipSpread + 8), h[1] + 8, (X, Y) => { if (ctx.shortsMask.in(X, Y)) cv.px(X, Y, c('navy')); });
  },
};
