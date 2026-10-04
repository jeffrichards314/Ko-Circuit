// Kiln (#88): sprite layers on the heavy build.
// A man fired in a kiln: brick-red clay skin, bald and set in a scowl, a chest plate of glazed clay with a
// furnace mouth on it (a black arch with a glow inside), seams that still glow between the plates, brick fists,
// soot-black trunks with a belt of bricks. When he hardens a zone the glaze over it shines white-hot
// (the `glaze` modifier draws that live).
import { rig } from '../pantheon/_rig.js';

const { layers, palettes } = rig('kiln', {
  build: 'heavy',
  body: { size: [1.06, 1.0], legLen: 0.9, torsoLen: 1.04, shoulders: 1.12, neckLen: -1, dims: { neck: 10, chestW: 28, waistW: 22, belly: 8, deltoid: 10, upperArm: [7.4, 6] } },
  colors: {
    skin: [[27, 16, 9], [20, 10, 5], [12, 5, 3], [6, 2, 1]],
    hair: [[12, 6, 4], [6, 3, 2], [3, 1, 1]],
    glove: [[24, 12, 7], [16, 7, 4], [8, 3, 2]],
    top: [[26, 15, 9], [18, 9, 5], [10, 4, 3], [5, 2, 1]],
    trim: [[31, 26, 10], [30, 15, 3], [16, 6, 2]],
    boot: [[12, 8, 7], [6, 4, 3], [2, 1, 1]],
    sh: [[8, 7, 8], [4, 4, 5], [2, 2, 2]],
    extraA: { glow: [31, 18, 4], glowHi: [31, 29, 14] }, extraB: { soot: [2, 2, 3] },
  },
  head: { jaw: 'square', ears: [2.6, 3.6], hair: 'none', eyeFace: 'focus', mouthW: 3, brow: { len: 5, thick: 1.4 } },
  top: {
    style: 'plate', pauldrons: true,
    emblem(ctx, cx, cy) {
      const { cv, c } = ctx;
      // the furnace mouth: a black arch with the fire inside
      cv.part(ctx.mask().ellipse(cx, cy + 3, 6.4, 6).cut(ctx.mask().rect(cx - 8, cy + 3, 16, 12)).rect(cx - 6, cy + 2, 13, 8), { ramp: [c('soot'), c('soot'), c('outline')], bevel: 1, inner: 'line', shadow: false });
      cv.part(ctx.mask().ellipse(cx, cy + 4, 4.2, 3.6).rect(cx - 4, cy + 4, 9, 5), { ramp: [c('glowHi'), c('glow'), c('trimSh')], bevel: 2, inner: 'none', shadow: false });
      // glowing seams between the plates
      for (const s of [-1, 1]) cv.line(cx + s * 12, cy - 8, cx + s * 14, cy + 8, (X, Y) => cv.px(X, Y, c('glow')));
    },
  },
  belt: { buckle: 'square', ramp: 'boot' },
  front(ctx) {
    const { cv, J, pose, c } = ctx;
    if (pose.lying) return;
    // seams glowing round the brick fists
    for (const s of ['L', 'R']) { const f = J['fi' + s]; cv.line(f[0] - 4, f[1] - 2, f[0] + 4, f[1] - 2, (X, Y) => cv.px(X, Y, c('glow'))); cv.line(f[0] - 4, f[1] + 3, f[0] + 4, f[1] + 3, (X, Y) => cv.px(X, Y, c('glow'))); }
  },
});
export { palettes };
export default layers;
