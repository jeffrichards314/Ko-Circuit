// Prism (#75): sprite layers on the medium build. Pantheon VI's champion.
// Light made into a fighter: near-white skin with a rainbow edge, long white-silver hair, a tunic of
// glass with a triangular prism on the chest, silver trim, crystal gloves. `prism.r`, `prism.g` and
// `prism.b` are the whole of him tinted red, green or blue: the three copies he splits into (the
// `prism` modifier draws them), and the real one is the copy whose colour is the ring light's.
import { rig } from './_rig.js';
import * as K from '../../remixKit.js';

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
  // Title Defense: THE SPECTRUM, STAINED. The glass figure puts on a crystal court dress: a crown of tall shards, a burst of crystal spikes behind
  // the shoulders, a flowing cape of glass, faceted bracers and boots. He stays white and cold, so the red, green and blue copies still read.
  remix: {
    swap: {
      A: { skinHi: [31, 31, 31], skin: [26, 30, 31], skinSh: [16, 22, 29], skinDk: [8, 12, 21], hairHi: [31, 31, 31], hair: [27, 25, 31], hairDk: [16, 13, 26] },
      B: { topHi: [28, 31, 31], top: [20, 27, 31], topSh: [11, 17, 28], topDk: [5, 8, 17], trimHi: [31, 31, 30], trim: [30, 29, 24], trimSh: [20, 17, 14], bootHi: [28, 31, 31], boot: [17, 25, 31], bootDk: [8, 13, 24] },
    },
    ramps: { glass: ['topHi', 'top', 'topSh'], gem: ['trimHi', 'trim', 'trimSh'] },
    back(ctx) {
      if (ctx.pose.lying) return;
      K.spikes(ctx, { ramp: 'gem', n: 7, len: 17 });
      K.cape(ctx, { ramp: 'glass', inner: 'gem', len: 30, flare: 6, hem: 'scallop' });
    },
    head(ctx, H) { K.crown(ctx, H, { ramp: 'gem', n: 5, h: 15, band: 2, w: -1 }); },
    torso(ctx) {
      if (ctx.pose.lying) return;
      K.pauldrons(ctx, { ramp: 'gem', style: 'spiked', size: 1, tip: 'glass' });
      ctx.cv.px(ctx.J.shL[0] - 6, ctx.J.shL[1] - 12, ctx.c('ray1')); ctx.cv.px(ctx.J.shR[0] + 6, ctx.J.shR[1] - 12, ctx.c('ray2'));
    },
    front(ctx) { K.bracers(ctx, { ramp: 'gem', from: 0.2, to: 0.58 }); K.greaves(ctx, { ramp: 'glass', knee: true }); },
  },
  swaps: {
    'prism.r': { A: tint([31, 24, 22], [31, 10, 10], [22, 4, 6], [12, 2, 3]), B: tintB([31, 24, 22], [31, 10, 10], [22, 4, 6], [12, 2, 3]) },
    'prism.g': { A: tint([24, 31, 24], [8, 26, 12], [4, 17, 8], [2, 8, 4]), B: tintB([24, 31, 24], [8, 26, 12], [4, 17, 8], [2, 8, 4]) },
    'prism.b': { A: tint([24, 28, 31], [10, 14, 31], [5, 7, 22], [2, 3, 12]), B: tintB([24, 28, 31], [10, 14, 31], [5, 7, 22], [2, 3, 12]) },
  },
});
export { palettes };
export default layers;
