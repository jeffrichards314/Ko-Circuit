// Polaris (#64): sprite layers on the lean build.
// The astronomer of the Starfield, and he never moves: a tall, still man with silver hair in
// a knot and a pointed goatee, a gold circlet with a white north star on his brow, an indigo
// robe-top sewn with tiny stars, silver trim and white gloves. (His constellations are drawn
// over him live: opponentAI's `constellation` modifier.)
import { rig } from './_rig.js';

const { layers, palettes } = rig('polaris', {
  build: 'lean',
  body: { size: [1.0, 1.02], legLen: 1.03, torsoLen: 1.0, shoulders: 0.96, dims: { belly: 2, waistW: 13, chestW: 17 } },
  colors: {
    skin: [[26, 22, 20], [20, 15, 14], [13, 9, 10], [7, 5, 7]],
    hair: [[31, 31, 31], [26, 28, 31], [15, 17, 24]],
    glove: [[31, 31, 31], [27, 29, 31], [15, 18, 25]],
    top: [[11, 12, 26], [6, 7, 19], [3, 3, 12], [1, 1, 7]],
    trim: [[31, 31, 28], [24, 26, 30], [13, 14, 22]],
    boot: [[24, 26, 30], [13, 15, 24], [5, 6, 14]],
    sh: [[9, 10, 24], [5, 5, 17], [2, 2, 10]],
    extraA: { starHi: [31, 31, 24] }, extraB: { starGold: [31, 26, 8] },
  },
  head: {
    jaw: 'narrow', ears: [2.2, 3.2], hair: 'bun', beard: 'goatee', mouthW: 2.6, eyeFace: 'focus',
    gear(ctx, H) {
      const { cv, c } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.3), y = Math.round(H.y);
      // the circlet and the north star on the brow
      cv.part(ctx.mask().rect(x - H.rx + 0.5, y - 6.5, H.rx * 2 - 1, 2), { ramp: ctx.ramps.trim, bevel: 1, inner: 'line', shadow: false });
      cv.px(x, y - 9, c('starHi')); cv.px(x, y - 8, c('starHi')); cv.px(x, y - 7, c('starHi')); cv.px(x - 1, y - 8, c('starHi')); cv.px(x + 1, y - 8, c('starHi'));
      cv.px(x, y - 10, c('white'));
    },
  },
  top: {
    style: 'tank', hem: true,
    emblem(ctx, cx, cy) {
      const { cv, c } = ctx;
      // stars sewn on the robe-top
      for (const [dx, dy] of [[-10, -6], [9, -8], [-6, 2], [11, 1], [3, -3], [-12, 5], [6, 6]]) { cv.px(cx + dx, cy + dy, c('starHi')); if ((dx + dy) & 1) { cv.px(cx + dx - 1, cy + dy, c('trim')); cv.px(cx + dx + 1, cy + dy, c('trim')); } }
    },
  },
  belt: { buckle: 'square' }, stripe: true,
  swaps: { 'polaris.lit': { A: { skinHi: [31, 30, 28] }, B: { topHi: [16, 18, 31], top: [10, 12, 27] } } },
});
export { palettes };
export default layers;
