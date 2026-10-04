// Drowned Mae (#83): sprite layers on the lean build.
// A girl who never came back up: skin the blue-white of a candle under water, hair long and black-green
// and always dripping, a torn white shift, kelp wound round her wrists for gloves, bare feet in
// dark boots. Water falls off her fists and hem in beads (the `wet` canvas is under her feet).
import { rig } from '../pantheon/_rig.js';

const { layers, palettes } = rig('mae', {
  build: 'lean',
  body: { size: [0.97, 1.02], legLen: 1.04, torsoLen: 0.96, shoulders: 0.92, dims: { belly: 1, waistW: 12, chestW: 16, upperArm: [5.2, 4.3] } },
  colors: {
    skin: [[26, 30, 31], [18, 24, 29], [10, 15, 22], [5, 8, 14]],
    hair: [[8, 17, 16], [3, 10, 10], [1, 4, 5]],
    glove: [[7, 17, 10], [3, 11, 6], [1, 5, 3]],
    top: [[27, 29, 29], [19, 21, 23], [11, 13, 16], [5, 6, 9]],
    trim: [[7, 17, 10], [3, 11, 6], [1, 5, 3]],
    boot: [[10, 12, 14], [5, 6, 8], [2, 2, 4]],
    sh: [[7, 15, 17], [3, 9, 11], [1, 4, 6]],
    extraA: { drip: [20, 29, 31], eye: [16, 30, 29] }, extraB: { bead: [22, 30, 31] },
  },
  head: {
    jaw: 'narrow', ears: [2.2, 3], hair: 'long', eyeFace: 'focus', mouthW: 2.6, nose: [1.6, 1.6], mouthFace: 'neutral',
    gear(ctx, H) {
      const { cv, c } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.3), y = Math.round(H.y);
      // wet hair plastered across the brow, a strand of weed, and cold pale eyes
      for (const dx of [-7, -3, 2, 6]) cv.line(x + dx, y - 8, x + dx + (dx > 0 ? -2 : 2), y - 2, (X, Y) => cv.shade(X, Y, 1));
      cv.px(x + 8, y - 5, c('glove')); cv.px(x + 9, y - 4, c('glove')); cv.px(x + 9, y - 3, c('glove'));
      const fx = x + H.look[0], fy = y + H.look[1];
      for (const s of [-1, 1]) cv.px(fx + s * 4, fy - 0.5, c('eye'));
      for (const [dx, dy] of [[-10, 6], [-11, 10], [10, 8], [11, 12]]) cv.px(x + dx, y + dy, c('drip'));
    },
  },
  top: { style: 'tank', hem: true, emblem(ctx, cx, cy) { const { cv, c } = ctx; for (const [dx, dy] of [[-8, -4], [-3, 3], [6, -2], [9, 6]]) { cv.px(cx + dx, cy + dy, c('topDk')); cv.px(cx + dx + 1, cy + dy + 1, c('topDk')); } for (const [dx, dy] of [[-6, 7], [2, 9], [8, 8]]) cv.px(cx + dx, cy + dy, c('bead')); } },
  belt: { buckle: 'none' }, stripe: false,
  front(ctx) {
    const { cv, J, pose, c } = ctx;
    if (pose.lying) return;
    // water beading off the fists, kelp trailing
    for (const s of ['L', 'R']) {
      const f = J['fi' + s];
      cv.px(f[0] + (s === 'L' ? -3 : 3), f[1] + 8, c('bead')); cv.px(f[0] + (s === 'L' ? -2 : 2), f[1] + 12, c('bead'));
      cv.line(f[0], f[1] + 4, f[0] + (s === 'L' ? -3 : 3), f[1] + 10, (X, Y) => cv.px(X, Y, c('glove')));
    }
  },
});
export { palettes };
export default layers;
