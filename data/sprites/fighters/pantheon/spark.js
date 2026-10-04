// Spark (#69): sprite layers on the lean build.
// Live wire in shorts: a tan, twitchy fighter with a shock of white-yellow spiky hair, an electric-yellow
// top with a black bolt on it, blue trim, yellow gloves that throw off sparks, blue boots.
// `spark.hot` is the whole of him crackling white-yellow: he's charged and his next hit doubles.
import { rig } from './_rig.js';

const { layers, palettes } = rig('spark', {
  build: 'lean',
  body: { size: [0.97, 1.02], legLen: 1.04, torsoLen: 0.97, shoulders: 0.95, dims: { belly: 1, waistW: 12, chestW: 16 } },
  colors: {
    skin: [[27, 21, 14], [22, 15, 9], [15, 9, 6], [8, 5, 3]],
    hair: [[31, 31, 26], [31, 28, 10], [22, 16, 4]],
    glove: [[31, 31, 24], [30, 26, 6], [20, 14, 2]],
    top: [[31, 30, 14], [29, 24, 4], [20, 14, 2], [10, 7, 1]],
    trim: [[16, 26, 31], [6, 14, 28], [2, 6, 18]],
    boot: [[14, 22, 31], [5, 10, 24], [2, 4, 14]],
    sh: [[8, 12, 26], [3, 5, 18], [1, 2, 10]],
    extraA: { bolt: [3, 3, 8] }, extraB: { arc: [24, 30, 31] },
  },
  head: { jaw: 'chin', ears: [2.2, 3], hair: 'spike', eyeFace: 'focus', mouthFace: 'teeth', mouthW: 3, nose: [1.8, 1.8], gap: 0 },
  top: {
    style: 'tank', hem: true,
    emblem(ctx, cx, cy) { const { cv, c } = ctx; for (const [x, y] of [[cx + 3, cy - 9], [cx - 1, cy - 4], [cx + 3, cy - 3], [cx - 2, cy + 3], [cx + 2, cy + 3]]) { cv.px(x, y, c('bolt')); cv.px(x, y + 1, c('bolt')); cv.px(x - 1, y + 1, c('bolt')); } },
  },
  belt: { buckle: 'none' }, stripe: true,
  swaps: {
    'spark.hot': {
      A: { skinHi: [31, 31, 30], skin: [31, 29, 18], skinSh: [27, 22, 8], hairHi: [31, 31, 31], hair: [31, 31, 24], hairDk: [28, 24, 8], gloveHi: [31, 31, 31], glove: [31, 31, 22], gloveDk: [27, 22, 6] },
      B: { topHi: [31, 31, 28], top: [31, 31, 18], topSh: [28, 24, 6], trimHi: [31, 31, 31], trim: [24, 30, 31], trimSh: [12, 22, 31], bootHi: [26, 31, 31], boot: [14, 24, 31] },
    },
  },
  front(ctx) {
    const { cv, J, c, pose } = ctx;
    if (pose.lying) return;
    // sparks off the gloves
    for (const s of ['L', 'R']) {
      const fi = J['fi' + s], dir = s === 'L' ? -1 : 1;
      for (const [dx, dy] of [[dir * 9, -6], [dir * 12, 2], [dir * 7, 8]]) { cv.px(fi[0] + dx, fi[1] + dy, c('arc')); cv.px(fi[0] + dx + dir, fi[1] + dy - 1, c('white')); }
    }
  },
});
export { palettes };
export default layers;
