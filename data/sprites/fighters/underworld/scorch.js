// Scorch (#87): sprite layers on the medium build.
// A man on fire and glad of it: burnt-tan skin, a mane of hair that IS flame (orange to white at the tips), a black
// leather harness scorched at the edges, gloves that are two balls of fire wrapped in scraps of cloth, red
// trunks with a black flame at the hem. Flames lick up off both fists in every pose.
import { rig } from '../pantheon/_rig.js';

const { layers, palettes } = rig('scorch', {
  build: 'medium',
  body: { size: [1.0, 1.0], legLen: 0.98, torsoLen: 1.0, shoulders: 1.02, dims: { belly: 2, waistW: 14, deltoid: 8 } },
  colors: {
    skin: [[28, 19, 12], [22, 13, 7], [14, 7, 4], [7, 3, 2]],
    hair: [[31, 27, 10], [30, 14, 3], [20, 5, 2]],
    glove: [[31, 28, 14], [30, 16, 4], [19, 6, 2]],
    top: [[7, 6, 7], [3, 3, 4], [1, 1, 2], [0, 0, 1]],
    trim: [[31, 24, 8], [27, 12, 3], [15, 5, 2]],
    boot: [[10, 5, 4], [5, 2, 2], [2, 1, 1]],
    sh: [[24, 6, 4], [15, 3, 2], [7, 1, 1]],
    extraA: { flameHi: [31, 30, 20], flame: [31, 20, 5] }, extraB: { soot: [2, 2, 3] },
  },
  head: { jaw: 'round', ears: [2.6, 3.6], hair: 'wild', hairKey: 'hair', eyeFace: 'focus', mouthW: 3.4, mouthFace: 'grin' },
  top: { style: 'harness', emblem(ctx, cx, cy) { const { cv, c } = ctx; for (const dx of [-6, 0, 6]) { cv.px(cx + dx, cy + 4, c('flame')); cv.px(cx + dx, cy + 3, c('flameHi')); } } },
  belt: { buckle: 'round', ramp: 'trim' }, stripe: true,
  front(ctx) {
    const { cv, J, pose, c, ramps } = ctx;
    if (pose.lying) return;
    // flames off both fists: a few tongues, the tallest in the middle
    for (const s of ['L', 'R']) {
      const f = J['fi' + s];
      for (const [dx, h] of [[-4, 6], [-2, 10], [0, 14], [2, 9], [4, 5]]) {
        cv.part(ctx.mask().capsule(f[0] + dx, f[1] - 4, f[0] + dx * 0.6, f[1] - 4 - h, 2, 0.6), { ramp: [c('flameHi'), c('flame'), c('glove')], bevel: 1, inner: 'none', shadow: false });
      }
    }
    void ramps;
  },
});
export { palettes };
export default layers;
