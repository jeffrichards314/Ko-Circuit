// Brand (#100): sprite layers on the medium build.
// A branding-iron man: lean, hard, bare to the waist, and every inch of him marked: old brands healed white across
// his chest and arms, one fresh one still glowing on his shoulder. Close-cropped ash hair, a cold flat face, a
// leather harness across the chest, and the iron itself, a long black rod ending in a glowing plate, held in the viewer-right
// fist and carried up over the shoulder.
import { rig } from '../pantheon/_rig.js';

const { layers, palettes } = rig('brand', {
  build: 'medium',
  body: { size: [1.0, 1.02], legLen: 0.99, torsoLen: 1.0, shoulders: 1.05, dims: { belly: 1.5, waistW: 13.5, chestW: 18, deltoid: 8, upperArm: [6.2, 5.2] } },
  colors: {
    skin: [[24, 18, 15], [17, 12, 10], [10, 7, 6], [4, 3, 3]],
    hair: [[16, 15, 15], [9, 8, 8], [3, 3, 3]],
    glove: [[18, 12, 8], [10, 6, 4], [4, 2, 1]],
    top: [[12, 8, 6], [7, 4, 3], [3, 2, 1], [1, 1, 0]],
    trim: [[31, 26, 11], [30, 13, 3], [15, 5, 2]],
    boot: [[10, 7, 5], [5, 3, 2], [2, 1, 1]],
    sh: [[10, 8, 8], [5, 4, 4], [2, 2, 2]],
    extraA: { hot: [31, 13, 3], hotHi: [31, 27, 12] }, extraB: { iron: [10, 10, 12], ironHi: [20, 20, 23] },
  },
  head: { jaw: 'narrow', ears: [2.3, 3.2], hair: 'crop', eyeFace: 'focus', mouthW: 2.8, nose: [1.8, 1.8], brow: { len: 4.6, thick: 1.3 } },
  top: {
    style: 'harness',
    emblem(ctx, cx, cy) {
      // the old brands, healed white: three small marks across the chest
      const { cv, c } = ctx;
      for (const [dx, dy] of [[-7, -3], [-6, -2], [-5, -3], [-6, -4], [6, 2], [7, 3], [8, 2], [7, 1], [1, 8], [2, 9], [3, 8]]) cv.px(cx + dx, cy + dy, c('skinHi'));
    },
  },
  belt: { buckle: 'square', ramp: 'boot' },
  front(ctx) {
    const { cv, J, pose, c } = ctx;
    if (pose.lying) return;
    // the fresh brand, glowing, on the viewer-left shoulder
    const sh = J.shL;
    for (const [dx, dy] of [[-3, 2], [-2, 3], [-1, 4], [-3, 4], [-1, 2], [0, 3]]) cv.px(sh[0] + dx, sh[1] + dy, c('hot'));
    cv.px(sh[0] - 2, sh[1] + 3, c('hotHi'));
    // the iron: a rod from the viewer-right fist up over his shoulder, ending in a glowing plate
    const f = J.fiR;
    cv.line(f[0] + 1, f[1] + 5, f[0] + 6, f[1] - 22, (X, Y) => { cv.px(X, Y, c('iron')); cv.px(X + 1, Y, c('ironHi')); });
    cv.part(ctx.mask().rect(f[0] + 1, f[1] - 32, 11, 10), { ramp: [c('hotHi'), c('hot'), c('trimSh')], bevel: 2, inner: 'line', shadow: false });
    for (const [dx, dy] of [[3, -30], [4, -29], [5, -28], [6, -29], [7, -30], [5, -30], [5, -26], [6, -26]]) cv.px(f[0] + dx, f[1] + dy, c('outline'));
  },
});
export { palettes };
export default layers;
