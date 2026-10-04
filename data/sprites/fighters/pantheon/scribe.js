// The Scribe (#78): sprite layers on the medium build.
// A clerk of the heavens: a long ink-black robe stained at the cuffs, a stooped, narrow figure with
// thin grey hair, round gold spectacles, a tall inkwell hanging from his belt and a white quill
// in his glove. Every hit he lands he writes down: the page count is drawn live (the `scribe` modifier).
import { rig } from './_rig.js';

const { layers, palettes } = rig('scribe', {
  build: 'medium',
  body: { size: [0.97, 1.0], legLen: 0.98, torsoLen: 1.03, shoulders: 0.92, dims: { belly: 3, waistW: 14, chestW: 17.5 } },
  colors: {
    skin: [[29, 25, 21], [24, 19, 14], [17, 12, 9], [10, 7, 5]],
    hair: [[27, 27, 29], [19, 19, 22], [10, 10, 14]],
    glove: [[26, 26, 28], [17, 17, 20], [8, 8, 11]],
    top: [[10, 10, 17], [5, 5, 11], [3, 3, 7], [1, 1, 3]],
    trim: [[31, 29, 15], [27, 21, 5], [16, 11, 2]],
    boot: [[14, 14, 20], [8, 8, 13], [3, 3, 6]],
    sh: [[9, 9, 15], [5, 5, 10], [2, 2, 5]],
    extraA: { ink: [6, 8, 26] }, extraB: { quill: [31, 31, 31] },
  },
  head: {
    jaw: 'narrow', ears: [2.4, 3.4], hair: 'crop', hairKey: 'hair', eyeFace: 'focus', mouthW: 2.6, gap: -1,
    gear(ctx, H) {
      const { cv, c } = ctx;
      const fx = Math.round(H.x + H.look[0]), fy = Math.round(H.y + H.look[1]);
      // round gold spectacles
      for (const s of [-1, 1]) { const m = ctx.mask().ellipse(fx + s * 5.4, fy, 4.2, 3.6).cut(ctx.mask().ellipse(fx + s * 5.4, fy, 3, 2.4)); cv.part(m, { ramp: ctx.ramps.trim, bevel: 1, inner: 'line', shadow: false }); }
      cv.line(fx - 1, fy, fx + 1, fy, (X, Y) => cv.px(X, Y, c('trim')));
    },
  },
  top: { style: 'robe', hem: false, emblem(ctx, cx, cy) { const { cv, c } = ctx; for (const [dx, dy] of [[-8, 6], [9, 9], [-3, 12]]) { cv.px(cx + dx, cy + dy, c('ink')); cv.px(cx + dx + 1, cy + dy, c('ink')); } } },
  belt: { buckle: 'none', ramp: 'trim' },
  front(ctx) {
    const { cv, J, c, pose } = ctx;
    if (pose.lying) return;
    // an inkwell on the belt and a white quill standing up from the right glove
    const w = J.waist;
    cv.part(ctx.mask().rect(w[0] + 8, w[1] - 3, 6, 9), { ramp: ['trimHi', 'ink', 'top'].map(c), bevel: 2, inner: 'line', shadow: false });
    const fi = J.fiR;
    cv.part(ctx.mask().capsule(fi[0] + 3, fi[1] - 4, fi[0] + 8, fi[1] - 24, 1.4, 0.8), { ramp: ['quill', 'quill', 'skinSh'].map(c), bevel: 1, inner: 'line', shadow: false });
  },
});
export { palettes };
export default layers;
