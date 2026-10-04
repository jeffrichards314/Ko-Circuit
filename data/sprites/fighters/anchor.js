// Admiral Anchor: sprite layers on the heavy build.
// Old salt: a white peaked officer's cap with a black brim and a gold anchor
// badge, a full white beard and moustache, a ruddy nose, bushy white brows,
// a navy-and-white striped sailor's shirt with the sleeves pushed up, an anchor
// tattoo on the viewer-right forearm, navy bell-bottom-blue trunks with a gold
// stripe, black boots, dark navy gloves with rope-braid cuffs.
// The anchor uppercut's tell is deliberately small: anchorTell1 is his idle
// with the right glove sagging a few pixels; anchorTell2 sinks the shoulder.

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, mouth, ears, skull, nose } from './_face.js';
import { lerp } from '../../../src/engine/figure.js';

const A = makePalette('anchor.A', {
  outline: [2, 2, 4],
  skinHi: [31, 24, 19], skin: [28, 17, 13], skinSh: [21, 11, 9], skinDk: [12, 6, 6],
  white: [31, 31, 31], mouth: [13, 2, 4], ruddy: [28, 10, 10],
  hairHi: [31, 31, 30], hair: [25, 25, 26], hairDk: [16, 16, 19],
  gloveHi: [10, 13, 23], glove: [5, 7, 15], gloveDk: [2, 3, 8],
});
const B = makePalette('anchor.B', {
  stripeHi: [30, 30, 31], stripe: [24, 25, 28], stripeSh: [16, 17, 22],
  navyHi: [9, 12, 24], navy: [5, 7, 17], navyDk: [2, 3, 9],
  goldHi: [31, 30, 14], gold: [29, 22, 4], goldDk: [17, 10, 2],
  brim: [3, 3, 5], rope: [25, 20, 12], ropeDk: [15, 11, 6],
  ink: [6, 12, 22], bootHi: [9, 9, 12],
});
export const palettes = { anchor: { A, B } };

const poses = {
  // the long, subtle tell: same stance as idle, the right glove sinks...
  anchorTell1: {
    extends: 'idle1', shift: [0, 0],
    head: { at: [0, -100], face: 'neutral', look: [0, 0] },
    elR: [26, -58], fiR: [12, -67], gloveR: { angle: -12 },
  },
  // ...and then the shoulder drops with it
  anchorTell2: {
    extends: 'idle1', shift: [0, 1],
    head: { at: [0, -99], face: 'neutral', look: [0, 1] },
    shR: [20, -79], elR: [27, -56], fiR: [14, -63], gloveR: { angle: -16 },
  },
  anchorUp: {
    extends: 'upper',
    head: { at: [-2, -104], face: 'strain', look: [0, -2] },
  },
  salute: {
    extends: 'idle1',
    head: { at: [0, -100], face: 'grin', look: [0, 0] },
    elR: [34, -86], fiR: [16, -100], gloveR: { angle: -60 },
    elL: [-27, -58], fiL: [-16, -48], gloveL: { angle: 170 },
  },
};

export default {
  id: 'anchor',
  build: 'heavy',
  // his own body on the build: an old salt: a barrel chest on short sea legs
  body: { torsoLen: 1.05, legLen: 0.9, shoulders: 1.06, dims: { chestW: 26, belly: 9 } },
  palettes: { default: 'anchor' },
  torsoMaterial: 'stripe',
  sleeve: { material: 'stripe', length: 0.7 },
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['rope', 'rope', 'ropeDk', 'outline'],
    stripe: ['stripeHi', 'stripe', 'stripeSh', 'navyDk'],
    shorts: ['navyHi', 'navy', 'navyDk'],
    sock: ['stripeHi', 'stripe', 'stripeSh'],
    boot: ['bootHi', 'brim', 'outline'],
    sole: ['bootHi', 'brim', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    cap: ['white', 'hairHi', 'hair', 'hairDk'],
    gold: ['goldHi', 'gold', 'goldDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    ears(ctx, H, ramps.skin, [2.6, 3.6]);
    const hm = skull(ctx, H, ramps.skin, 'round');
    // full white beard wrapping the jaw
    const bd = ctx.mask().ellipse(fx, fy + 8, H.rx + 1.5, 9).cut(ctx.mask().rect(fx - 20, fy - 8, 40, 11));
    bd.rect(x - Math.round(H.rx) - 1, y - 2, 4, 9).rect(x + Math.round(H.rx) - 3, y - 2, 4, 9);
    const mo = ctx.mask().ellipse(fx, fy + 9.5, 3.4, 1.8);
    if (['strain', 'hurt', 'wide'].includes(face)) bd.cut(mo);
    cv.part(bd, { ramp: ramps.hair, bevel: 4, inner: 'line' });
    for (const [dx, dy] of [[-8, 6], [-4, 12], [0, 14], [4, 12], [8, 6], [-6, 10], [6, 10]]) { cv.shade(fx + dx, fy + dy, 1); cv.shade(fx + dx + 1, fy + dy - 1, -1); }
    if (['strain', 'hurt', 'wide'].includes(face)) { cv.flat(mo, c('mouth'), true); cv.px(fx - 1, fy + 8, c('white')); cv.px(fx, fy + 8, c('white')); }
    for (const s of [-1, 1]) { cv.px(fx + s * 6, fy + 3, c('ruddy')); cv.px(fx + s * 6 - s, fy + 3, c('ruddy')); }
    eyes(ctx, fx, fy, face, 0);
    // bushy white brows
    const [bi, bo] = face === 'focus' || face === 'strain' ? [1, -1] : face === 'hurt' || face === 'ko' ? [-1, 1] : [0, 0];
    cv.part(ctx.mask().capsule(fx - 9, fy - 4 + bo, fx - 2, fy - 4 + bi, 1.6, 1.3).capsule(fx + 8, fy - 4 + bo, fx + 1, fy - 4 + bi, 1.6, 1.3), { ramp: ramps.hair, bevel: 1, inner: 'soft' });
    nose(ctx, fx, fy, ['skinHi', 'ruddy', 'skinSh', 'skinDk'].map(c), [2.8, 2.6], 3.6);
    // moustache over the beard
    cv.part(ctx.mask().ellipse(fx - 3, fy + 7, 4, 1.8, 1, -0.2).ellipse(fx + 3, fy + 7, 4, 1.8, 1, 0.2), { ramp: ramps.hair, bevel: 1, inner: 'line', shadow: false });
    if (face === 'grin') for (let i = -2; i <= 2; i++) cv.px(fx + i, fy + 9, c('mouth'));
    // officer's cap: white crown, gold band, black brim, anchor badge
    const cy = y + (H.tilt === 'up' ? -1 : H.tilt === 'down' ? 1 : 0);
    const hx = x + lx * 0.4;
    const crown = ctx.mask().ellipse(hx, cy - 11, H.rx + 3, 5.5).rect(hx - H.rx, cy - 11, H.rx * 2, 5);
    cv.part(crown, { ramp: ramps.cap, bevel: 3 });
    cv.part(ctx.mask().rect(hx - H.rx, cy - 8, H.rx * 2 + 1, 3), { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
    cv.part(ctx.mask().ellipse(hx + lx * 0.3, cy - 4.5, H.rx - 1, 2.2).cut(ctx.mask().rect(hx - 20, cy - 12, 40, 7)), { ramp: ['bootHi', 'brim', 'brim'].map(c), bevel: 1, inner: 'line' });
    // anchor badge
    const bx = Math.round(hx), by = Math.round(cy - 12);
    cv.stamp(['.g.', 'ggg', '.g.', 'g.g', '.g.'].map((r2) => r2), bx - 1, by - 1, { g: c('goldHi') });
    for (let i = -7; i <= 7; i++) if (hm.in(fx + i, cy - 3)) cv.shade(fx + i, cy - 3, 1);
  },

  torso(ctx) {
    const { cv, J, c, D } = ctx;
    const n = J.neck, w = J.waist, h = J.hip;
    const tm = ctx.torsoMask;
    // sailor stripes
    for (let y = Math.round(n[1]) + 4; y < w[1]; y += 5) for (let x = 0; x < tm.w; x++) if (tm.in(x, y) && tm.in(x, y + 1)) { cv.px(x, y, c('navy')); cv.px(x, y + 1, c('navyDk')); }
    // scoop neck
    cv.part(ctx.mask().ellipse(n[0], n[1] + 2, 7, 3).clip(tm), { ramp: ['skinHi', 'skin', 'skinSh', 'skinDk'].map(c), bevel: 2, inner: 'line', shadow: false });
    // gold side stripe on the trunks
    for (const s of [-1, 1]) cv.line(h[0] + s * (D.hipSpread + 9), h[1] - 3, h[0] + s * (D.hipSpread + 11), h[1] + 8, (X, Y) => { if (ctx.shortsMask.in(X, Y)) cv.px(X, Y, c('gold')); });
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, w[1] - 3, D.waistW * 2 + 2, 3).clip(ctx.shortsMask), { ramp: ['navyHi', 'navy', 'navyDk'].map(c), bevel: 1, inner: 'line', shadow: false });
  },

  front(ctx) {
    const { cv, J, c, pose } = ctx;
    if (pose.lying) return;
    // anchor tattoo on the viewer-right forearm
    const t = lerp(J.elR, J.fiR, 0.42);
    const tx = Math.round(t[0]), ty = Math.round(t[1]);
    cv.stamp(['.i.', 'iii', '.i.', 'i.i'], tx - 1, ty - 2, { i: c('ink') });
    // stripes on the sleeves
    for (const s of ['L', 'R']) {
      const a = lerp(J['sh' + s], J['el' + s], 0.45);
      cv.px(a[0] - 2, a[1], c('navy')); cv.px(a[0] - 1, a[1], c('navy')); cv.px(a[0], a[1], c('navy')); cv.px(a[0] + 1, a[1], c('navy')); cv.px(a[0] + 2, a[1], c('navy'));
    }
  },
};
