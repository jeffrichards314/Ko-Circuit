// Valkyr (#77): sprite layers on the lean build.
// A diver: pale skin, a long yellow braid, a silver helm with two white wings, a steel-blue breastplate
// over a white tunic, silver greaves, blue-white gloves. Her shadow on the canvas is drawn live
// (the `dive` modifier); overhead1 (a punch straight down) is her dive.
import { rig, wing } from './_rig.js';
import { ribbon } from './_kit.js';

const { layers, palettes } = rig('valkyr', {
  build: 'lean',
  body: { size: [0.98, 1.03], legLen: 1.04, torsoLen: 0.97, shoulders: 0.98, dims: { belly: 1, waistW: 12.5, chestW: 16.5 } },
  colors: {
    skin: [[31, 27, 23], [28, 21, 16], [21, 14, 10], [13, 8, 6]],
    hair: [[31, 30, 16], [28, 22, 6], [18, 12, 2]],
    glove: [[28, 30, 31], [17, 24, 31], [8, 13, 24]],
    top: [[24, 28, 31], [12, 20, 30], [6, 11, 21], [3, 5, 12]],
    trim: [[31, 31, 31], [26, 28, 31], [14, 17, 25]],
    boot: [[27, 29, 31], [16, 20, 28], [7, 9, 17]],
    sh: [[30, 30, 31], [22, 24, 29], [11, 13, 21]],
    extraA: { plume: [31, 26, 12] }, extraB: { gold: [30, 22, 5] },
  },
  head: {
    jaw: 'chin', ears: null, hair: 'none', eyeFace: 'focus', mouthW: 2.8, nose: [1.7, 1.7],
    gear(ctx, H) {
      const { cv, ramps } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.3), y = Math.round(H.y);
      cv.part(ctx.mask().ellipse(x, y - 4, H.rx + 1, 8).cut(ctx.mask().rect(x - 20, y - 1, 40, 20)), { ramp: ramps.trim, bevel: 4, inner: 'line' });
      cv.part(ctx.mask().rect(x - H.rx - 1, y - 4, H.rx * 2 + 2, 2.2), { ramp: ramps.trim, bevel: 1, inner: 'line', shadow: false });
      for (const s of [-1, 1]) wing(ctx, [x + s * (H.rx + 1), y - 5], s, 14, 1.2, ramps.glove);
    },
  },
  top: { style: 'plate', pauldrons: true },
  belt: { buckle: 'round' }, stripe: true,
  back(ctx) {
    const { J, ramps, pose } = ctx;
    if (pose.lying) return;
    const h = J.head;
    ribbon(ctx, [h[0] - 4, h[1] + 2], 1, 30, { amp: 2, waves: 0.8, r0: 3, r1: 1.2, lift: 10, ramp: ramps.hair, phase: 0.3 });
  },
});
export { palettes };
export default layers;
