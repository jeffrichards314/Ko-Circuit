// Sugarfoot Simone (#62): sprite layers on the lean build, in the colours of the 1970s:
// orange, mustard, brown and avocado.
// A disco dancer: a huge dark afro under a red headband, gold hoop earrings, a mustard
// halter top, satin shorts that shade from orange to burnt orange, striped leg warmers,
// terry-cloth sweatbands at the wrist, orange gloves.
// Poses: cover1/2 (leaning back on the ropes, forearms up, elbows out: the bait, and
// the block), boogie (the taunt: a hip and a point at the ceiling).

import { makePalette } from '../../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from '../_face.js';

const A = makePalette('simone.A', {
  outline: [4, 2, 3],
  skinHi: [26, 18, 11], skin: [20, 12, 7], skinSh: [13, 7, 4], skinDk: [7, 4, 3],
  white: [31, 30, 25], mouth: [11, 3, 4],
  hairHi: [12, 7, 5], hair: [6, 3, 3], hairDk: [2, 1, 1],
  gloveHi: [31, 22, 7], glove: [29, 14, 3], gloveDk: [16, 6, 1],
});
const B = makePalette('simone.B', {
  satinHi: [31, 24, 8], satin: [29, 15, 3], satinDk: [17, 7, 1],
  halterHi: [31, 30, 12], halter: [28, 23, 3], halterDk: [17, 12, 1],
  bandHi: [29, 8, 8], band: [24, 3, 5],
  brownHi: [17, 10, 5], brown: [10, 5, 3],
  greenHi: [16, 22, 6], green: [9, 14, 3],
  gold: [31, 27, 8],
});
export const palettes = { simone: { A, B } };

const FEET = { knL: [-13, -22], knR: [13, -22], ftL: [-16, 0], ftR: [16, 0] };
const poses = {
  // leaning back on the ropes: shoulders back, forearms up in front of the face, elbows out
  cover1: {
    extends: 'block', shift: [-3, 1], ...FEET,
    head: { at: [-3, -98], face: 'focus', tilt: 'down', look: [0, 1] },
    elL: [-30, -80], elR: [26, -82], fiL: [-9, -96], fiR: [7, -98],
    gloveL: { angle: 10 }, gloveR: { angle: -10 },
  },
  cover2: { extends: 'cover1', shift: [1, 0], ...FEET, fiL: [-8, -94], fiR: [8, -96] },
  // a hip and a finger at the ceiling: the taunt
  boogie: {
    extends: 'idle1', shift: [-2, 0], ...FEET,
    head: { at: [-1, -101], face: 'grin', tilt: 'up', look: [1, -1] },
    elR: [30, -90], fiR: [26, -112], gloveR: { angle: -5 },
    elL: [-30, -60], fiL: [-24, -52], gloveL: { angle: 160 },
  },
};

export default {
  id: 'simone',
  build: 'lean',
  // her own body: long-limbed, loose in the hips, a dancer's shoulders
  body: { size: [0.98, 1.03], legLen: 1.05, torsoLen: 0.97, shoulders: 0.97, neckLen: 0.5, dims: { waistW: 11, upperArm: [4.6, 3.8], thigh: [6, 4.7] } },
  palettes: { default: 'simone' },
  torsoMaterial: 'skin',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['white', 'white', 'halterDk'],
    shorts: ['satinHi', 'satin', 'satinDk'],
    sock: ['brownHi', 'brown', 'outline'],
    boot: ['halterHi', 'halter', 'halterDk'],
    sole: ['brown', 'outline', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    halter: ['halterHi', 'halter', 'halterDk', 'outline'],
    band: ['bandHi', 'band', 'outline'],
  },

  // the afro: a huge round cloud of dark hair, behind her head
  back(ctx) {
    const { cv, J, ramps, pose } = ctx;
    if (pose.lying) return;
    const [hx, hy] = J.head;
    cv.part(ctx.mask().ellipse(hx, hy - 4, 19, 19), { ramp: ramps.hair, bevel: 8, inner: 'line' });
    for (const [dx, dy, r] of [[-15, 2, 5], [15, 2, 5], [-11, -12, 6], [11, -12, 6], [0, -20, 6]]) cv.part(ctx.mask().ellipse(hx + dx, hy + dy, r, r), { ramp: ramps.hair, bevel: 3, inner: 'line', shadow: false });
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';
    ears(ctx, H, ramps.skin, [1.8, 2.7]);
    const hm = skull(ctx, H, ramps.skin, 'narrow');
    // the afro in front too: a fringe over the brow, and a red headband across it
    cv.part(ctx.mask().ellipse(x + lx * 0.3, y - 4, H.rx + 2.6, 8).cut(ctx.mask().rect(x - 20, y, 40, 20)).cut(ctx.mask().ellipse(fx, fy + 2, H.rx - 2.4, 8.6)), { ramp: ramps.hair, bevel: 3, inner: 'line' });
    cv.part(ctx.mask().rect(x - H.rx - 1 + lx * 0.3, y - 4.5, H.rx * 2 + 2, 2.4), { ramp: ramps.band, bevel: 1, inner: 'line', shadow: false });
    for (const s of [-1, 1]) cv.part(ctx.mask().ellipse(x + s * (H.rx - 0.2) + lx * 0.3, y + 6, 1.8, 2.4).cut(ctx.mask().ellipse(x + s * (H.rx - 0.2) + lx * 0.3, y + 6, 0.9, 1.4)), { ramp: ['gold', 'gold', 'halterDk'].map(c), bevel: 1, inner: 'line', shadow: false });
    eyes(ctx, fx, fy, face === 'neutral' ? 'neutral' : face, -1);
    for (const s of [-1, 1]) { const ex = fx + s * 8 - (s > 0 ? 2 : 0); cv.px(ex, fy - 3, c('hairDk')); cv.px(ex + s, fy - 4, c('hairDk')); }
    brows(ctx, fx, fy, face, ramps.hair, { len: 3.8, thick: 0.9, y: -4.3 });
    nose(ctx, fx, fy, ramps.skin, [1.7, 1.9], 3.4);
    mouth(ctx, fx, fy + 8, face === 'neutral' ? 'smile' : face, { w: 3.2 });
    ctx.headMask = hm;
  },

  torso(ctx) {
    const { cv, J, c, ramps, D, pose } = ctx;
    if (pose.lying) return;
    const n = J.neck, w = J.waist, ch = J.chest, tm = ctx.torsoMask;
    // a mustard halter top, tied at the neck and the back
    const top = ctx.mask().poly([[n[0] - 3, n[1] + 2], [n[0] + 3, n[1] + 2], [ch[0] + D.chestW - 3, ch[1] + 5], [ch[0] - D.chestW + 3, ch[1] + 5]]).clip(tm);
    cv.part(top, { ramp: ramps.halter, bevel: 3, inner: 'line' });
    cv.line(n[0] - 3, n[1] + 2, n[0] - 6, n[1] - 1, (X, Y) => cv.px(X, Y, c('halter'))); cv.line(n[0] + 3, n[1] + 2, n[0] + 6, n[1] - 1, (X, Y) => cv.px(X, Y, c('halter')));
    // satin shorts shaded orange to burnt orange, a gold band, side stripes
    const by = Math.round(w[1]), sm = ctx.shortsMask;
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, by - 2, D.waistW * 2 + 2, 3).clip(sm), { ramp: ['gold', 'halter', 'halterDk'].map(c), bevel: 1, inner: 'line', shadow: false });
    for (const s of [-1, 1]) for (let Y = by; Y < J.hip[1] + 8; Y++) { const X = Math.round(J.hip[0] + s * (D.hipSpread + 4)); if (sm.in(X, Y)) { cv.px(X, Y, c('halterHi')); cv.px(X - s, Y, c('band')); } }
    for (let Y = Math.round(J.hip[1] - 6); Y < J.hip[1] + 12; Y++) for (let X = Math.round(w[0] - D.waistW); X < w[0] + D.waistW; X++) if (sm.in(X, Y) && Y > J.hip[1] + 2 && (X + Y) % 3 === 0) cv.shade(X, Y, 1);
    // terry-cloth sweatbands at both wrists
    for (const s of ['L', 'R']) { const fi = J['fi' + s], el = J['el' + s]; const p = [fi[0] + (el[0] - fi[0]) * 0.22, fi[1] + (el[1] - fi[1]) * 0.22]; for (let i = -3; i <= 3; i++) { cv.px(p[0] + i, p[1], c('white')); cv.px(p[0] + i, p[1] + 1, c('bandHi')); } }
  },

  // striped leg warmers: brown and avocado bands over the shins
  front(ctx) {
    const { cv, J, c, pose } = ctx;
    if (pose.lying) return;
    for (const ft of [J.ftL, J.ftR]) for (let k = 0; k < 4; k++) { const y = ft[1] - 8 - k * 3; for (let i = -4; i <= 4; i++) cv.px(ft[0] + i, y, c(k & 1 ? 'green' : 'brownHi')); }
  },
};
