// Barney Buckets, Ascended (#81): Barney's own sprite layers (his face, his walrus moustache, his work
// shirt) on the white-and-gold palette `barney2`, with what heaven gave him: a pair of white wings, an upturned
// bucket for a halo (floating a hand above his cap) and a golden mop standing by his right fist.
import barney from '../barney.js';
import { wing } from './_rig.js';

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
    const x = Math.round(H.x + H.look[0] * 0.4), y = Math.round(H.y) - 27;
    // the bucket, upturned, worn as a halo: a tapering pail with a rim, and a glow ring
    cv.part(ctx.mask().poly([[x - 8, y - 5], [x + 8, y - 5], [x + 6, y + 4], [x - 6, y + 4]]), { ramp: ['metalHi', 'metal', 'brown'].map(c), bevel: 2, inner: 'line', shadow: false });
    cv.part(ctx.mask().rect(x - 9, y + 3, 18, 2), { ramp: ['metalHi', 'metal', 'brown'].map(c), bevel: 1, inner: 'line', shadow: false });
    for (let i = -10; i <= 10; i += 2) { cv.px(x + i, y + 7 + ((i & 2) ? 0 : 1), c('metalHi')); }
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
