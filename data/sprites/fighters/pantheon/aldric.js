// Aldric the Winged (#76): sprite layers on the heavy build.
// An angel in plate: white-gold armour over a bull chest, a close gold crop of hair, a jaw of
// stubble, and a pair of great white wings that fold behind him. Poses flare1 / flare2 / flare3
// spread the wings wider each time, and the width is the tell: one hit, two, three (`wings` scales the span).
import { rig, wing } from './_rig.js';

const flare = (n) => ({
  extends: 'idle1', wings: [1.05, 1.5, 2.0][n - 1],
  head: { at: [0, -98], face: 'strain', tilt: 'up', look: [0, -1] },
  shL: [-26, -80], elL: [-40, -70], fiL: [-46, -84], shR: [26, -80], elR: [40, -70], fiR: [46, -84],
  gloveL: { angle: -30 }, gloveR: { angle: 30 },
});
const { layers, palettes } = rig('aldric', {
  build: 'heavy',
  body: { size: [1.05, 1.0], legLen: 0.94, torsoLen: 1.05, shoulders: 1.08, neckLen: -1, dims: { neck: 8, chestW: 27, waistW: 21, belly: 5, deltoid: 9.5 } },
  colors: {
    skin: [[29, 22, 16], [24, 16, 10], [17, 10, 6], [10, 5, 3]],
    hair: [[31, 30, 18], [28, 22, 7], [18, 12, 3]],
    glove: [[31, 31, 29], [26, 26, 26], [15, 15, 19]],
    top: [[31, 31, 31], [27, 28, 30], [17, 18, 24], [8, 9, 15]],
    trim: [[31, 30, 17], [29, 23, 5], [20, 13, 2]],
    boot: [[31, 30, 17], [27, 20, 4], [15, 9, 2]],
    sh: [[31, 31, 30], [26, 27, 28], [15, 16, 21]],
    extraA: { down: [26, 28, 31] }, extraB: { gem: [8, 22, 31] },
  },
  head: { jaw: 'square', ears: [2.6, 3.6], hair: 'crop', beard: 'stubble', eyeFace: 'focus', mouthW: 3.2 },
  top: { style: 'plate', emblem(ctx, cx, cy) { const { cv, c } = ctx; cv.part(ctx.mask().ellipse(cx, cy, 3.4, 3.4), { ramp: ['white', 'gem', 'trimSh'].map(c), bevel: 2, inner: 'line', shadow: false }); for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; cv.px(cx + Math.cos(a) * 6, cy + Math.sin(a) * 5.5, c('trimHi')); } } },
  belt: { buckle: 'round' },
  poses: { flare1: flare(1), flare2: flare(2), flare3: flare(3) },
  back(ctx) {
    const { J, pose, ramps, c } = ctx;
    if (pose.lying) return;
    const k = pose.wings || 0.62, ch = J.chest;
    for (const dir of [-1, 1]) wing(ctx, [ch[0] + dir * 10, ch[1] - 8], dir, 26 * k + 10, 1.55, ramps.glove, { rise: k > 1 ? -6 : 2, tip: c('trimHi') });
  },
});
export { palettes };
export default layers;
