// Halcyon, the Undefeated: sprite layers on the medium build at large scale (1.2x: he fills the ring).
// A golden man who has never been touched: gold-and-white skin with a flush of dawn, long white-gold hair,
// a crown of sun-rays, a breastplate of white gold with the sun on it and a cape of light down his back, white
// trunks, gauntlets like small suns. One set of layers, four palettes: `halcyon` (dawn: rose-gold),
// `halcyon.noon` (bleached white), `halcyon.dusk` (red and violet, cold marble skin) and `halcyon.shade`
// (a flat black silhouette: his shadow in the Noon form).
import { rig, wing } from './_rig.js';
import * as K from '../../remixKit.js';

const flat = (c, c2) => ({ A: Object.fromEntries(['skinHi', 'skin', 'skinSh', 'skinDk', 'hairHi', 'hair', 'hairDk', 'gloveHi', 'glove', 'gloveDk', 'white', 'mouth'].map((k) => [k, c])), B: Object.fromEntries(['trimHi', 'trim', 'trimSh', 'bootHi', 'boot', 'bootDk', 'shHi', 'sh', 'shDk', 'topHi', 'top', 'topSh', 'topDk'].map((k) => [k, c2 || c])) });
const { layers, palettes } = rig('halcyon', {
  build: 'medium',
  body: { size: [1.2, 1.2], legLen: 1.0, torsoLen: 1.02, shoulders: 1.05, dims: { belly: 4, chestW: 20 } },
  colors: {
    skin: [[31, 28, 22], [30, 23, 15], [23, 15, 10], [14, 8, 6]],
    hair: [[31, 31, 26], [30, 27, 14], [21, 15, 5]],
    glove: [[31, 31, 24], [30, 25, 8], [21, 14, 3]],
    top: [[31, 30, 24], [30, 24, 10], [22, 14, 5], [11, 6, 2]],
    trim: [[31, 31, 26], [30, 25, 9], [21, 14, 3]],
    boot: [[31, 30, 22], [29, 21, 6], [16, 10, 2]],
    sh: [[31, 31, 30], [28, 27, 28], [17, 16, 22]],
    extraA: { ray: [31, 31, 24] }, extraB: { sun: [31, 28, 10] },
  },
  head: {
    jaw: 'chin', ears: [2.4, 3.4], hair: 'long', eyeFace: 'focus', mouthW: 3, nose: [1.8, 1.8],
    gear(ctx, H) {
      if (ctx.layers.remixed) return;
      const { cv, c } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.3), y = Math.round(H.y);
      // a crown of sun-rays over the brow
      cv.part(ctx.mask().rect(x - H.rx, y - 8, H.rx * 2, 3), { ramp: ctx.ramps.trim, bevel: 1, inner: 'line', shadow: false });
      for (let i = -3; i <= 3; i++) cv.part(ctx.mask().poly([[x + i * 5 - 2, y - 8], [x + i * 5 * 1.25, y - 16 - (3 - Math.abs(i))], [x + i * 5 + 2, y - 8]]), { ramp: ctx.ramps.trim, bevel: 1, inner: 'line', shadow: false });
      cv.px(x, y - 7, c('ray'));
    },
  },
  top: {
    style: 'plate', pauldrons: true,
    emblem(ctx, cx, cy) { const { cv, c } = ctx; cv.part(ctx.mask().ellipse(cx, cy, 4.4, 4.4), { ramp: ['ray', 'sun', 'trimSh'].map(c), bevel: 2, inner: 'line', shadow: false }); for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2, r = k & 1 ? 9 : 7; cv.px(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.9, c('trimHi')); } },
  },
  belt: { buckle: 'round' }, stripe: true,
  back(ctx) {
    const { J, pose } = ctx;
    if (pose.lying) return;
    // a cape of light: two pale wings of it behind the shoulders
    const ch = J.chest;
    for (const dir of [-1, 1]) wing(ctx, [ch[0] + dir * 11, ch[1] - 8], dir, 22, 1.2, ctx.ramps.hair, { rise: 6 });
  },
  // Title Defense: THE KINGFISHER (his name is the bird). Azure wings, a plumed helm, an orange breastplate and bracers: the man made of morning goes
  // the colours of the water he dives into.
  remix: {
    skip: ['back'],
    swap: {
      A: { hairHi: [18, 28, 31], hair: [6, 17, 29], hairDk: [3, 7, 19], gloveHi: [31, 28, 14], glove: [31, 18, 4], gloveDk: [21, 8, 1] },
      B: {
        topHi: [18, 29, 31], top: [5, 19, 29], topSh: [3, 10, 20], topDk: [1, 4, 10],
        trimHi: [31, 28, 14], trim: [31, 19, 4], trimSh: [21, 9, 1],
        bootHi: [31, 28, 14], boot: [30, 17, 3], bootDk: [17, 7, 1],
      },
    },
    ramps: { azure: ['topHi', 'top', 'topSh'], orange: ['trimHi', 'trim', 'trimSh'], plume: ['hairHi', 'hair', 'hairDk'] },
    back(ctx) {
      if (ctx.pose.lying) return;
      K.wingsFeather(ctx, { ramp: 'azure', span: 46, spread: 1.7, tip: 'trimHi', rise: 5, lift: 9 });
    },
    head(ctx, H) {
      K.helm(ctx, H, { ramp: 'azure', cover: 0.42, crest: 'plume', crestRamp: 'plume', rim: 'orange' });
      K.plume(ctx, H, { ramp: 'orange', len: 20, dir: -1, from: [Math.round(H.x) - 1, Math.round(H.y - H.ry) + 1] });
    },
    torso(ctx) {
      if (ctx.pose.lying) return;
      K.pauldrons(ctx, { ramp: 'azure', style: 'fan', size: 3 });
      K.skirt(ctx, { ramp: 'orange', kind: 'strips', len: 22, n: 6 });
    },
    front(ctx) { K.bracers(ctx, { ramp: 'orange', from: 0.22, to: 0.6, wide: 1.8 }); K.greaves(ctx, { ramp: 'azure', knee: false }); },
  },
  swaps: {
    'halcyon.noon': { A: { skinHi: [31, 31, 31], skin: [31, 31, 30], skinSh: [30, 30, 29], hairHi: [31, 31, 31], hair: [31, 31, 30], hairDk: [29, 29, 28], gloveHi: [31, 31, 31], glove: [31, 31, 30], gloveDk: [29, 29, 28] }, B: { topHi: [31, 31, 31], top: [31, 31, 30], topSh: [30, 30, 29], trimHi: [31, 31, 31], trim: [31, 31, 30], trimSh: [29, 29, 28], bootHi: [31, 31, 31], boot: [31, 31, 30], bootDk: [29, 29, 28] } },
    'halcyon.dusk': { A: { skinHi: [26, 22, 26], skin: [20, 14, 22], skinSh: [12, 8, 16], skinDk: [6, 3, 9], hairHi: [31, 14, 8], hair: [26, 6, 6], hairDk: [14, 2, 4], gloveHi: [31, 20, 14], glove: [28, 8, 5], gloveDk: [15, 3, 3] }, B: { topHi: [24, 12, 18], top: [16, 6, 13], topSh: [9, 3, 9], topDk: [4, 1, 5], trimHi: [31, 18, 10], trim: [27, 8, 5], trimSh: [14, 3, 3], bootHi: [24, 10, 12], boot: [14, 4, 8], bootDk: [6, 1, 3], shHi: [18, 10, 20], sh: [10, 4, 13], shDk: [4, 1, 6], sun: [31, 12, 5] } },
    'halcyon.shade': flat([2, 2, 8], [2, 2, 8]),
  },
});
export { palettes };
export default layers;
