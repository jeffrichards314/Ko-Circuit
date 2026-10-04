// Anvil (#68): sprite layers on the heavy build.
// A smith who hits like the thing he's named for: dark-brown skin, a black beard, a bald head under a
// leather cap, a scarred leather apron, iron-grey gloves with a square hammer head behind each fist.
import { rig } from './_rig.js';

const { layers, palettes } = rig('anvil', {
  build: 'heavy',
  body: { size: [1.04, 1.0], legLen: 0.92, torsoLen: 1.04, shoulders: 1.1, neckLen: -1, dims: { neck: 9, chestW: 27, waistW: 21, belly: 7, deltoid: 9.5, upperArm: [7, 5.8] } },
  colors: {
    skin: [[21, 14, 9], [15, 9, 6], [9, 5, 4], [5, 3, 2]],
    hair: [[9, 8, 9], [4, 4, 5], [1, 1, 2]],
    glove: [[22, 24, 28], [13, 15, 20], [6, 7, 11]],
    top: [[22, 14, 8], [15, 8, 4], [9, 4, 2], [4, 2, 1]],
    trim: [[26, 28, 31], [16, 18, 24], [8, 9, 14]],
    boot: [[14, 14, 18], [8, 8, 12], [3, 3, 6]],
    sh: [[11, 11, 15], [6, 6, 10], [2, 2, 5]],
    extraA: { ember: [31, 18, 4] }, extraB: { rivet: [31, 27, 12] },
  },
  head: {
    jaw: 'square', ears: [2.6, 3.6], hair: 'none', beard: 'full', eyeFace: 'focus', mouthW: 3,
    gear(ctx, H) {
      const { cv } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.3), y = Math.round(H.y);
      // a leather cap pulled down over the crown
      cv.part(ctx.mask().ellipse(x, y - 6, H.rx + 0.8, 7.5).cut(ctx.mask().rect(x - 20, y - 3, 40, 20)), { ramp: ctx.ramps.top, bevel: 4, inner: 'line' });
      cv.part(ctx.mask().rect(x - H.rx, y - 4, H.rx * 2, 2.4), { ramp: ctx.ramps.top, bevel: 1, inner: 'line', shadow: false });
    },
  },
  top: { style: 'tank', hem: false, emblem(ctx, cx, cy) { const { cv, c } = ctx; for (const [dx, dy] of [[-9, -6], [10, -4], [-6, 4], [8, 6]]) cv.px(cx + dx, cy + dy, c('rivet')); cv.line(cx - 12, cy + 8, cx + 12, cy + 8, (X, Y) => cv.shade(X, Y, 1)); } },
  belt: { buckle: 'square', ramp: 'top' },
  front(ctx) {
    const { cv, J, pose, ramps } = ctx;
    if (pose.lying) return;
    // a hammer head behind each fist: a block of iron with a handle-side collar
    for (const s of ['L', 'R']) {
      const fi = J['fi' + s];
      cv.part(ctx.mask().rect(fi[0] - 8, fi[1] - 6, 16, 12), { ramp: ramps.trim, bevel: 3, inner: 'line', shadow: false });
      cv.part(ctx.mask().rect(fi[0] - 8, fi[1] - 6, 3, 12).rect(fi[0] + 5, fi[1] - 6, 3, 12), { ramp: ramps.boot, bevel: 1, inner: 'line', shadow: false });
    }
  },
});
export { palettes };
export default layers;
