// Moros (#85): sprite layers on the giant build.
// A masked brute: charcoal-grey slab of a man, a burlap sack pulled over his head with two eye holes and
// a crude stitched grin, a harness of old black leather straps across a bare chest, chain wound round
// his fists, and ragged crimson trunks. The three masks that tell his punches float over his shoulders
// (drawn live by the `rhythms` modifier); on his belt hangs a fourth, cracked in half.
import { rig } from '../pantheon/_rig.js';

const { layers, palettes } = rig('moros', {
  build: 'giant',
  body: { size: [1.0, 1.0], legLen: 0.9, torsoLen: 1.04, shoulders: 1.1, neckLen: -2, dims: { neck: 10, chestW: 31, waistW: 25, belly: 8, deltoid: 12, upperArm: [9.6, 8] } },
  colors: {
    skin: [[13, 12, 14], [8, 8, 10], [4, 4, 6], [2, 2, 3]],
    hair: [[10, 10, 11], [5, 5, 6], [2, 2, 3]],
    glove: [[12, 12, 15], [7, 7, 10], [3, 3, 5]],
    top: [[9, 8, 8], [5, 4, 4], [2, 2, 2], [1, 1, 1]],
    trim: [[22, 22, 24], [13, 13, 16], [6, 6, 9]],
    boot: [[10, 9, 9], [5, 5, 5], [2, 2, 2]],
    sh: [[19, 6, 6], [11, 3, 3], [5, 1, 1]],
    extraA: { sack: [22, 18, 10], sackDk: [13, 10, 5] }, extraB: { thread: [6, 4, 3], bone: [28, 27, 22] },
  },
  head: {
    jaw: 'square', ears: null, hair: 'none', eyeFace: 'focus', mouthW: 3, nose: null,
    face(ctx, H) {
      // the sack: burlap over the whole head, rough at the neck
      const { cv, c } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.3), y = Math.round(H.y);
      const sack = ctx.mask().ellipse(x, y - 1, H.rx + 1.6, H.ry + 1.2).ellipse(x, y + 7, H.rx + 0.6, 10.5);
      cv.part(sack, { ramp: [c('sack'), c('sack'), c('sackDk')], bevel: 6, inner: 'line' });
      for (let j = -H.ry; j < H.ry + 8; j += 3) for (let i = -H.rx; i <= H.rx; i += 3) if (sack.in(x + i + (j & 3 ? 1 : 0), y + j)) cv.px(x + i + (j & 3 ? 1 : 0), y + j, c('sackDk'));
      // a knot of rope at the crown
      cv.part(ctx.mask().ellipse(x, y - H.ry - 1, 4, 2.4), { ramp: [c('sack'), c('sackDk'), c('sackDk')], bevel: 1, inner: 'line', shadow: false });
    },
    gear(ctx, H) {
      // the stitched grin over the sack, and the eye holes (deep black) lit by two white points
      const { cv, c } = ctx;
      const x = Math.round(H.x + H.look[0]), y = Math.round(H.y + H.look[1]);
      for (const s of [-1, 1]) { cv.part(ctx.mask().ellipse(x + s * 5, y - 1, 3.2, 2.6), { ramp: [c('thread'), c('thread'), c('thread')], bevel: 0, inner: 'none', shadow: false }); cv.px(x + s * 5 + (s < 0 ? 0 : -1), y - 2, c('bone')); }
      for (let i = -6; i <= 6; i++) cv.px(x + i, y + 8 + (Math.abs(i) > 4 ? -1 : 0), c('thread'));
      for (let i = -5; i <= 5; i += 2) { cv.px(x + i, y + 7, c('thread')); cv.px(x + i, y + 9, c('thread')); }
    },
  },
  top: { style: 'harness', emblem(ctx, cx, cy) { const { cv, c } = ctx; cv.part(ctx.mask().ellipse(cx, cy + 1, 3.4, 3.4), { ramp: ctx.ramps.trim, bevel: 2, inner: 'line', shadow: false }); cv.px(cx, cy, c('thread')); } },
  belt: { buckle: 'round', ramp: 'trim' },
  front(ctx) {
    const { cv, J, pose, ramps, c } = ctx;
    if (pose.lying) return;
    // chain wound round each fist
    for (const s of ['L', 'R']) {
      const f = J['fi' + s];
      for (let i = 0; i < 4; i++) cv.part(ctx.mask().ellipse(f[0] + (i & 1 ? 1 : -1), f[1] - 5 + i * 3.4, 6.4, 1.5), { ramp: ramps.trim, bevel: 1, inner: 'line', shadow: false });
    }
    // the cracked mask on his belt
    const w = J.waist;
    cv.part(ctx.mask().ellipse(w[0] + 17, w[1] + 4, 4.5, 5.5), { ramp: [c('bone'), c('bone'), c('trimSh')], bevel: 2, inner: 'line', shadow: false });
    cv.line(w[0] + 17, w[1] - 1, w[0] + 15, w[1] + 9, (X, Y) => cv.px(X, Y, c('outline')));
  },
});
export { palettes };
export default layers;
