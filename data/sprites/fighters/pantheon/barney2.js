// Barney Buckets, Ascended (#81): Barney's own sprite layers (his face, his walrus moustache, his work
// shirt) on the white-and-gold palette `barney2`, with what heaven gave him: a pair of white wings, an upturned
// bucket for a halo (floating a hand above his cap) and a golden mop standing by his right fist.
import barney from '../barney.js';
import { wing } from './_rig.js';
import * as K from '../../remixKit.js';

export default {
  ...barney,
  id: 'barney2',
  palettes: { default: 'barney2' },
  back(ctx) {
    const { J, pose, ramps } = ctx;
    if (pose.lying) return;
    const ch = J.chest;
    for (const dir of [-1, 1]) wing(ctx, [ch[0] + dir * 9, ch[1] - 8], dir, 27, 1.5, ['white', 'hairHi', 'hair'].map(ctx.c), { rise: 3, tip: ctx.c('metalHi') });
    void ramps;
  },
  head(ctx, H) {
    barney.head(ctx, H);
    const { cv, c } = ctx;
    if (ctx.layers.remixed) return;
    const x = Math.round(H.x + H.look[0] * 0.4), y = Math.round(H.y) - 27;
    // the bucket, upturned, worn as a halo: a tapering pail with a rim, and a glow ring
    cv.part(ctx.mask().poly([[x - 8, y - 5], [x + 8, y - 5], [x + 6, y + 4], [x - 6, y + 4]]), { ramp: ['metalHi', 'metal', 'brown'].map(c), bevel: 2, inner: 'line', shadow: false });
    cv.part(ctx.mask().rect(x - 9, y + 3, 18, 2), { ramp: ['metalHi', 'metal', 'brown'].map(c), bevel: 1, inner: 'line', shadow: false });
    for (let i = -10; i <= 10; i += 2) { cv.px(x + i, y + 7 + ((i & 2) ? 0 : 1), c('metalHi')); }
  },
  // Title Defense: BARNEY ON THE NIGHT SHIFT. The wings go midnight blue, the bucket halo becomes a hard hat with a lamp, the shirt a hi-vis
  // vest with reflective bands, and there is a tool belt and a pair of black rubber gloves. Same mop.
  remix: {
    skip: ['back'],
    body: { size: [1.12, 1.14] },
    swap: {
      A: { gloveHi: [22, 22, 25], glove: [10, 10, 13], gloveSh: [6, 6, 8], gloveDk: [3, 3, 5] },
      B: {
        shirtHi: [31, 27, 12], shirt: [31, 19, 3], shirtSh: [23, 10, 2], shirtDk: [12, 5, 1],
        pantsHi: [11, 14, 24], pants: [5, 8, 17], pantsDk: [2, 3, 9],
        capHi: [31, 31, 18], cap: [30, 27, 4], capDk: [20, 15, 1],
        metalHi: [29, 30, 31], metal: [19, 21, 26], brownHi: [14, 14, 18], brown: [8, 8, 11],
      },
    },
    ramps: { night: ['pantsHi', 'pants', 'pantsDk'], hat: ['capHi', 'cap', 'capDk'], steel: ['metalHi', 'metal', 'brown'] },
    back(ctx) {
      if (ctx.pose.lying) return;
      K.pack(ctx, { ramp: 'steel', w: 20, h: 34, top: 2, round: true });
      K.wingsFeather(ctx, { ramp: 'night', span: 42, spread: 1.5, tip: 'metalHi', rise: 3, lift: 8 });
    },
    head(ctx, H) {
      K.hat(ctx, H, { kind: 'peak', ramp: 'hat', h: 12 });
      const x = Math.round(H.x + H.look[0] * 0.4), y = Math.round(H.y - H.ry);
      ctx.cv.part(ctx.mask().ellipse(x, y - 1, 3.4, 2.6), { ramp: ctx.ramps.steel, bevel: 2, inner: 'line', shadow: false });
      ctx.cv.px(x, y - 1, ctx.c('white'));
    },
    torso(ctx) {
      if (ctx.pose.lying) return;
      const { J, D, cv, c } = ctx, ch = J.chest, w = J.waist;
      for (const dy of [4, 10]) cv.line(ch[0] - D.chestW + 3, ch[1] + dy, ch[0] + D.chestW - 3, ch[1] + dy, (X, Y) => { if (ctx.torsoMask.in(X, Y)) cv.px(X, Y, c('metalHi')); });
      K.belt(ctx, { ramp: 'night', buckle: 'steel', wide: 4 });
      for (const dx of [-12, -7, 9]) cv.part(ctx.mask().rect(w[0] + dx, w[1] + 1, 4, 6), { ramp: ctx.ramps.steel, bevel: 1, inner: 'line', shadow: false });
    },
  },
  front(ctx) {
    const { cv, J, c, pose } = ctx;
    if (pose.lying) return;
    // a golden mop: a shaft up from the right fist and a head of gold strands at the top
    const fi = J.fiR;
    cv.part(ctx.mask().capsule(fi[0] + 2, fi[1] + 4, fi[0] + 9, fi[1] - 34, 1.6, 1.3), { ramp: ['metalHi', 'metal', 'brown'].map(c), bevel: 1, inner: 'line', shadow: false });
    const tx = fi[0] + 9, ty = fi[1] - 34;
    for (let i = -5; i <= 5; i++) cv.line(tx + i * 0.6, ty, tx + i * 1.4, ty - 8 - (i & 1) * 2, (X, Y) => cv.px(X, Y, c(i & 1 ? 'metalHi' : 'metal')));
  },
};
export const palettes = {};
