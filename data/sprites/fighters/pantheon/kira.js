// Comet Kira (#65): sprite layers on the lean build.
// A racer, all forward lean: warm brown skin, an icy-white ponytail streaming out behind her
// like a comet's tail, a cyan visor-band, a violet racing top with a comet on the chest, white and
// cyan trim, cyan gloves, winged running shoes. The light streak that shows her side is drawn
// live (the `lunge` modifier).
import { rig } from './_rig.js';
import { ribbon } from './_kit.js';

const { layers, palettes } = rig('kira', {
  build: 'lean',
  body: { size: [0.98, 1.02], legLen: 1.06, torsoLen: 0.96, shoulders: 0.94, dims: { belly: 1, waistW: 12, chestW: 16, thigh: [7.6, 6] } },
  colors: {
    skin: [[27, 19, 12], [21, 13, 8], [14, 8, 5], [8, 4, 3]],
    hair: [[31, 31, 31], [22, 30, 31], [10, 20, 28]],
    glove: [[22, 31, 31], [8, 24, 30], [3, 12, 22]],
    top: [[22, 14, 31], [14, 6, 25], [8, 3, 17], [4, 1, 9]],
    trim: [[31, 31, 31], [22, 30, 31], [10, 18, 28]],
    boot: [[31, 31, 31], [20, 28, 31], [8, 14, 24]],
    sh: [[16, 9, 28], [10, 4, 21], [5, 2, 12]],
    extraA: { visor: [8, 26, 31] }, extraB: { flame: [31, 28, 12] },
  },
  head: {
    jaw: 'chin', ears: [2.2, 3.2], hair: 'crop', eyeFace: 'focus', mouthW: 3, nose: [1.8, 1.8],
    gear(ctx, H) {
      const { cv, c } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.3), y = Math.round(H.y);
      // a cyan band across the brow
      cv.part(ctx.mask().rect(x - H.rx + 0.5, y - 5.5, H.rx * 2 - 1, 3), { ramp: ['white', 'visor', 'trimSh'].map(c), bevel: 1, inner: 'line', shadow: false });
    },
  },
  top: {
    style: 'tank', hem: true,
    emblem(ctx, cx, cy) {
      const { cv, c } = ctx;
      // a comet: a bright head and a tapering tail down-left
      cv.part(ctx.mask().ellipse(cx + 5, cy - 3, 3, 3), { ramp: ['white', 'flame', 'trimSh'].map(c), bevel: 1, inner: 'line', shadow: false });
      for (let i = 1; i < 9; i++) { cv.px(cx + 5 - i * 1.4, cy - 3 + i * 0.9, c(i < 4 ? 'trim' : 'trimSh')); cv.px(cx + 5 - i * 1.4, cy - 2 + i * 0.9, c(i < 3 ? 'trimHi' : 'trimSh')); }
    },
  },
  belt: { buckle: 'none' }, stripe: true,
  back(ctx) {
    const { J, ramps, pose } = ctx;
    if (pose.lying) return;
    const h = J.head;
    // the comet's tail: a long white-to-cyan ponytail streaming to the viewer's right
    ribbon(ctx, [h[0] + 7, h[1] - 2], 1, 36, { amp: 4, waves: 1.3, r0: 3.4, r1: 1, lift: -3, ramp: ramps.hair, phase: 0.6 });
  },
});
export { palettes };
export default layers;
