// Gaoler Brisk (#92): sprite layers on the medium build.
// The prison warden's own man: a peaked cap with a brass badge, a heavy moustache, a slate-blue uniform
// waistcoat with brass buttons over bare arms, black leather gloves, and a ring of iron keys the size of a
// dinner plate hanging from his belt, swinging when he moves. A whistle on a cord.
import { rig } from '../pantheon/_rig.js';

const { layers, palettes } = rig('brisk', {
  build: 'medium',
  body: { size: [1.0, 1.0], legLen: 0.98, torsoLen: 1.0, shoulders: 1.03, dims: { belly: 3, waistW: 14 } },
  colors: {
    skin: [[27, 21, 16], [20, 14, 10], [12, 8, 6], [6, 4, 3]],
    hair: [[9, 8, 8], [4, 4, 4], [1, 1, 1]],
    glove: [[9, 9, 12], [4, 4, 7], [1, 1, 3]],
    top: [[12, 15, 21], [7, 9, 14], [3, 5, 9], [1, 2, 4]],
    trim: [[30, 24, 8], [22, 15, 4], [12, 8, 2]],
    boot: [[9, 9, 11], [4, 4, 6], [1, 1, 3]],
    sh: [[10, 12, 17], [5, 7, 11], [2, 3, 6]],
    extraA: { brass: [31, 27, 10], white: [29, 29, 30] }, extraB: { key: [18, 19, 23], keyDk: [6, 7, 10] },
  },
  head: {
    jaw: 'square', ears: [2.6, 3.6], hair: 'none', beard: 'stache', eyeFace: 'focus', mouthW: 3, nose: [2.2, 2.4],
    gear(ctx, H) {
      const { cv, c } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.3), y = Math.round(H.y);
      // the peaked cap: a crown, a band, a hard brim and a brass badge
      cv.part(ctx.mask().ellipse(x, y - 7, H.rx + 1.4, 7).cut(ctx.mask().rect(x - 22, y - 3, 44, 20)), { ramp: ctx.ramps.top, bevel: 4, inner: 'line' });
      cv.part(ctx.mask().rect(x - H.rx - 1, y - 5, H.rx * 2 + 2, 2.6), { ramp: ctx.ramps.glove, bevel: 1, inner: 'line', shadow: false });
      cv.part(ctx.mask().ellipse(x, y - 3.4, H.rx + 3, 1.8), { ramp: ctx.ramps.glove, bevel: 1, inner: 'line', shadow: false });
      cv.part(ctx.mask().ellipse(x, y - 8, 2.6, 2.4), { ramp: ctx.ramps.trim, bevel: 1, inner: 'line', shadow: false });
    },
  },
  top: { style: 'vest', pauldrons: false, emblem(ctx, cx, cy) { const { cv, c } = ctx; for (const dy of [-6, -1, 4, 9]) { cv.px(cx - 4, cy + dy, c('brass')); cv.px(cx + 4, cy + dy, c('brass')); } cv.line(cx + 9, cy - 9, cx + 6, cy - 2, (X, Y) => cv.px(X, Y, c('white'))); } },
  belt: { buckle: 'square', ramp: 'trim' },
  front(ctx) {
    const { cv, J, pose, c } = ctx;
    if (pose.lying) return;
    // the key ring on his hip: a great iron loop with a fan of keys
    const h = J.hip, kx = h[0] + 19, ky = h[1] + 2;
    cv.part(ctx.mask().ellipse(kx, ky, 5.5, 5.5).cut(ctx.mask().ellipse(kx, ky, 3.6, 3.6)), { ramp: [c('key'), c('key'), c('keyDk')], bevel: 1, inner: 'line', shadow: false });
    for (const [dx, dy, l] of [[-3, 6, 7], [0, 7, 9], [3, 6, 7]]) { cv.line(kx + dx, ky + dy - 1, kx + dx * 1.4, ky + dy + l, (X, Y) => cv.px(X, Y, c('key'))); cv.px(kx + dx * 1.4, ky + dy + l, c('keyDk')); cv.px(kx + dx * 1.4 + 1, ky + dy + l - 1, c('key')); }
  },
});
export { palettes };
export default layers;
