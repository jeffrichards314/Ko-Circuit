// Radiant Rho (#80): sprite layers on the medium build. Pantheon VII's champion.
// The Summit's own light: white-gold from head to foot, a sunburst of gold hair round a calm face, a
// golden breastplate with a sun on it, white trunks, gloves like small suns. He borrows the champions
// of the Pantheon: `rho.<champion>` tints him their colour for their signature (rose for Aurora,
// sky blue for Cirrus, sepia for the Old Guard, violet for Nebula, ember for Hale, white-cyan for Prism).
import { rig } from './_rig.js';

const tintA = (h, m, s, d) => ({ skinHi: h, skin: m, skinSh: s, gloveHi: h, glove: m, gloveDk: d, hairHi: h, hair: m, hairDk: s });
const tintB = (h, m, s, d) => ({ topHi: h, top: m, topSh: s, topDk: d, trimHi: h, trim: m, trimSh: s, bootHi: h, boot: m, bootDk: s });
const T = (h, m, s, d) => ({ A: tintA(h, m, s, d), B: tintB(h, m, s, d) });
const { layers, palettes } = rig('rho', {
  build: 'medium',
  body: { size: [1.0, 1.0], legLen: 1.0, torsoLen: 1.0, shoulders: 1.02, dims: { belly: 4, chestW: 20 } },
  colors: {
    skin: [[31, 27, 21], [28, 21, 13], [21, 14, 8], [13, 8, 4]],
    hair: [[31, 31, 20], [30, 25, 6], [20, 13, 2]],
    glove: [[31, 31, 22], [30, 26, 8], [20, 14, 3]],
    top: [[31, 31, 26], [30, 24, 8], [21, 14, 3], [11, 7, 1]],
    trim: [[31, 31, 28], [30, 27, 12], [21, 15, 4]],
    boot: [[31, 31, 26], [29, 22, 6], [16, 10, 2]],
    sh: [[31, 31, 31], [27, 27, 29], [16, 16, 21]],
    extraA: { ray: [31, 31, 24] }, extraB: { sun: [31, 29, 10] },
  },
  head: {
    jaw: 'round', ears: [2.4, 3.4], hair: 'wild', eyeFace: 'focus', mouthW: 3, nose: [1.8, 1.8],
    gear(ctx, H) {
      const { cv, c } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.3), y = Math.round(H.y);
      // a thin ring of light over the sunburst
      const m = ctx.mask().ellipse(x, y - H.ry - 5, 9, 2.6).cut(ctx.mask().ellipse(x, y - H.ry - 5, 6.6, 1.4));
      cv.part(m, { ramp: ['ray', 'trimHi', 'trim'].map(c), bevel: 1, inner: 'line', shadow: false });
    },
  },
  top: {
    style: 'plate', pauldrons: true,
    emblem(ctx, cx, cy) { const { cv, c } = ctx; cv.part(ctx.mask().ellipse(cx, cy, 4, 4), { ramp: ['ray', 'sun', 'trimSh'].map(c), bevel: 2, inner: 'line', shadow: false }); for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2, r = k & 1 ? 8 : 6.6; cv.px(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.9, c('trimHi')); } },
  },
  belt: { buckle: 'round' }, stripe: true,
  swaps: {
    'rho.aurora': T([31, 26, 27], [30, 14, 20], [21, 6, 12], [11, 2, 6]),
    'rho.cirrus': T([28, 31, 31], [10, 24, 31], [4, 13, 25], [2, 6, 13]),
    'rho.oldguard': T([27, 22, 16], [20, 14, 8], [12, 8, 4], [6, 4, 2]),
    'rho.nebula': T([29, 24, 31], [19, 9, 27], [10, 4, 18], [5, 2, 9]),
    'rho.hale': T([31, 24, 14], [31, 11, 3], [21, 5, 2], [11, 2, 1]),
    'rho.prism': T([28, 31, 31], [14, 28, 31], [7, 18, 28], [3, 8, 16]),
  },
});
export { palettes };
export default layers;
