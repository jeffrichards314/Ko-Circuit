// Verity (#79): sprite layers on the medium build.
// A judge: a black robe with a white jabot at the neck, grey hair in a neat bun, a silk blindfold
// across her eyes (she sees the whole ring anyway), a small pair of gold scales on the chest, and
// black gloves. Pose bow: bent at the waist, hands folded: hit her then and it's a FOUL.
import { rig } from './_rig.js';

const { layers, palettes } = rig('verity', {
  build: 'medium',
  body: { size: [0.98, 1.0], legLen: 0.98, torsoLen: 1.03, shoulders: 0.96, dims: { belly: 3, waistW: 14, chestW: 18 } },
  colors: {
    skin: [[28, 22, 18], [23, 16, 12], [16, 10, 8], [9, 5, 4]],
    hair: [[27, 27, 29], [19, 19, 22], [10, 10, 14]],
    glove: [[12, 12, 18], [6, 6, 11], [2, 2, 5]],
    top: [[9, 9, 14], [4, 4, 9], [2, 2, 5], [1, 1, 2]],
    trim: [[31, 31, 31], [26, 26, 29], [15, 15, 20]],
    boot: [[12, 12, 18], [6, 6, 11], [2, 2, 5]],
    sh: [[8, 8, 13], [4, 4, 8], [2, 2, 4]],
    extraA: { blind: [5, 5, 10] }, extraB: { gold: [30, 24, 6] },
  },
  head: {
    jaw: 'narrow', ears: [2.2, 3.2], hair: 'bun', eyeFace: 'neutral', mouthW: 2.6, gap: 0,
    gear(ctx, H) {
      const { cv } = ctx;
      const x = Math.round(H.x + H.look[0]), y = Math.round(H.y + H.look[1]);
      // the blindfold over the eyes
      cv.part(ctx.mask().rect(x - H.rx, y - 3, H.rx * 2, 6), { ramp: ['blind', 'blind', 'blind'].map(ctx.c), bevel: 1, inner: 'line', shadow: false });
      cv.px(x - 3, y - 1, ctx.c('trimSh')); cv.px(x + 3, y - 1, ctx.c('trimSh'));
    },
  },
  top: {
    style: 'robe', hem: false,
    emblem(ctx, cx, cy) {
      const { cv, c } = ctx;
      // a white jabot and gold scales
      cv.part(ctx.mask().poly([[cx - 6, cy - 12], [cx + 6, cy - 12], [cx + 3, cy - 2], [cx - 3, cy - 2]]), { ramp: ctx.ramps.trim, bevel: 2, inner: 'line', shadow: false });
      cv.line(cx - 7, cy + 3, cx + 7, cy + 3, (X, Y) => cv.px(X, Y, c('gold'))); cv.line(cx, cy + 3, cx, cy + 9, (X, Y) => cv.px(X, Y, c('gold')));
      for (const s of [-1, 1]) { cv.px(cx + s * 7, cy + 4, c('gold')); cv.px(cx + s * 7, cy + 5, c('gold')); cv.line(cx + s * 5, cy + 6, cx + s * 9, cy + 6, (X, Y) => cv.px(X, Y, c('gold'))); }
    },
  },
  belt: { buckle: 'none', ramp: 'trim' },
  poses: {
    bow: { extends: 'winded1', head: { at: [0, -84], face: 'neutral', tilt: 'down', look: [0, 3] } },
  },
});
export { palettes };
export default layers;
