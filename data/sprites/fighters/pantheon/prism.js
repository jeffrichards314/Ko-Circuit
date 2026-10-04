// Prism (#75): sprite layers on the medium build. Pantheon VI's champion.
// Light made into a fighter: near-white skin with a rainbow edge, long white-silver hair, a tunic of
// glass with a triangular prism on the chest, silver trim, crystal gloves. `prism.r`, `prism.g` and
// `prism.b` are the whole of him tinted red, green or blue: the three copies he splits into (the
// `prism` modifier draws them), and the real one is the copy whose colour is the ring light's.
import { rig } from './_rig.js';

const tint = (h, m, s, d) => ({ skinHi: h, skin: m, skinSh: s, skinDk: d, hairHi: h, hair: m, hairDk: s, gloveHi: h, glove: m, gloveDk: s });
const tintB = (h, m, s, d) => ({ topHi: h, top: m, topSh: s, topDk: d, trimHi: h, trim: m, trimSh: s, shHi: h, sh: m, shDk: s, bootHi: h, boot: m, bootDk: s });
const { layers, palettes } = rig('prism', {
  build: 'medium',
  body: { size: [1.0, 1.0], legLen: 1.0, torsoLen: 1.0, shoulders: 1.0, dims: { belly: 3 } },
  colors: {
    skin: [[31, 31, 31], [28, 28, 31], [19, 20, 28], [10, 11, 20]],
    hair: [[31, 31, 31], [27, 28, 31], [16, 18, 26]],
    glove: [[31, 31, 31], [26, 28, 31], [14, 17, 26]],
    top: [[31, 31, 31], [25, 27, 31], [15, 17, 26], [7, 8, 16]],
    trim: [[31, 31, 31], [27, 29, 31], [15, 18, 26]],
    boot: [[30, 30, 31], [20, 22, 30], [9, 10, 20]],
    sh: [[28, 29, 31], [18, 20, 29], [8, 9, 19]],
    extraA: { ray1: [31, 10, 10] }, extraB: { ray2: [10, 28, 12] },
  },
  head: { jaw: 'round', ears: [2.2, 3.2], hair: 'long', eyeFace: 'focus', mouthW: 3, nose: [1.8, 1.8] },
  top: {
    style: 'tank', hem: true,
    emblem(ctx, cx, cy) {
      const { cv, c } = ctx;
      cv.part(ctx.mask().poly([[cx - 6, cy + 5], [cx + 6, cy + 5], [cx, cy - 7]]), { ramp: [c('white'), c('trimHi'), c('trimSh')], bevel: 2, inner: 'line', shadow: false });
      cv.line(cx - 12, cy - 1, cx - 3, cy - 1, (X, Y) => cv.px(X, Y, c('ray1'))); cv.line(cx + 3, cy - 1, cx + 12, cy + 4, (X, Y) => cv.px(X, Y, c('ray2')));
    },
  },
  belt: { buckle: 'round' }, stripe: true,
  swaps: {
    'prism.r': { A: tint([31, 24, 22], [31, 10, 10], [22, 4, 6], [12, 2, 3]), B: tintB([31, 24, 22], [31, 10, 10], [22, 4, 6], [12, 2, 3]) },
    'prism.g': { A: tint([24, 31, 24], [8, 26, 12], [4, 17, 8], [2, 8, 4]), B: tintB([24, 31, 24], [8, 26, 12], [4, 17, 8], [2, 8, 4]) },
    'prism.b': { A: tint([24, 28, 31], [10, 14, 31], [5, 7, 22], [2, 3, 12]), B: tintB([24, 28, 31], [10, 14, 31], [5, 7, 22], [2, 3, 12]) },
  },
});
export { palettes };
export default layers;
