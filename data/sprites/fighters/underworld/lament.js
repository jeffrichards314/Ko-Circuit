// Lament (#105): sprite layers on the medium build.
// A mourner: a long black funeral robe to the ankles with a grey lining, a black veil pinned over grey hair, a face
// stretched into a permanent wail (mouth open wide) with tears cut down it, hands wrapped in black cloth, a
// tiny bell hung at the waist. He has been crying for a thousand years and it is getting louder.
import { rig } from '../pantheon/_rig.js';

const { layers, palettes } = rig('lament', {
  build: 'medium',
  body: { size: [0.99, 1.02], legLen: 1.0, torsoLen: 1.0, shoulders: 0.97, dims: { belly: 3, waistW: 13.5, chestW: 17, upperArm: [5.6, 4.6] } },
  colors: {
    skin: [[24, 24, 26], [17, 17, 20], [10, 10, 13], [5, 5, 7]],
    hair: [[18, 18, 20], [11, 11, 13], [5, 5, 7]],
    glove: [[8, 7, 10], [4, 4, 6], [2, 1, 3]],
    top: [[9, 8, 12], [5, 4, 8], [2, 2, 4], [1, 0, 2]],
    trim: [[21, 21, 25], [12, 12, 16], [5, 5, 8]],
    boot: [[6, 6, 8], [3, 3, 4], [1, 1, 2]],
    sh: [[7, 6, 9], [3, 3, 5], [1, 1, 2]],
    extraA: { tear: [14, 26, 31], tearHi: [26, 31, 31] }, extraB: { bell: [27, 22, 8], bellDk: [15, 10, 3] },
  },
  head: {
    jaw: 'round', ears: null, hair: 'long', eyeFace: 'focus', mouthW: 3, nose: [1.6, 1.6], brow: { len: 4.4, thick: 1.1 }, mouthFace: 'shout',
    gear(ctx, H) {
      // the veil over the crown and shoulders; tears cut down both cheeks; the mouth stretched wide
      const { cv, c } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.3), y = Math.round(H.y), fx = x + H.look[0] * 0.7, fy = y + H.look[1];
      cv.part(ctx.mask().ellipse(x, y - 6, H.rx + 3, 7).cut(ctx.mask().ellipse(fx, fy + 1.5, H.rx - 2, 8)), { ramp: ctx.ramps.top, bevel: 3, inner: 'line', shadow: false });
      for (const s of [-1, 1]) { for (let j = 0; j < 8; j++) cv.px(fx + s * 5, fy + 2 + j, c(j & 1 ? 'tear' : 'tearHi')); }
      cv.part(ctx.mask().ellipse(fx, fy + 9, 3.6, 3.2), { ramp: [c('outline'), c('outline'), c('outline')], bevel: 0, inner: 'none', shadow: false });
      cv.px(fx - 1, fy + 8, c('white')); cv.px(fx + 1, fy + 8, c('white'));
    },
  },
  top: { style: 'robe', emblem(ctx, cx, cy) { const { cv, c } = ctx; for (const dx of [-10, -6, 6, 10]) cv.px(cx + dx, cy + 22 + ((dx * 3) & 3), c('trim')); } },
  belt: { buckle: 'none' },
  front(ctx) {
    const { cv, J, pose, c, ramps } = ctx;
    if (pose.lying) return;
    // black cloth round each hand, and the little bell at his waist
    for (const s of ['L', 'R']) { const f = J['fi' + s]; cv.line(f[0] - 4, f[1] - 3, f[0] + 4, f[1] - 2, (X, Y) => cv.px(X, Y, c('trim'))); }
    const w = J.waist;
    cv.part(ctx.mask().ellipse(w[0] + 9, w[1] + 4, 2.6, 3), { ramp: [c('bell'), c('bell'), c('bellDk')], bevel: 1, inner: 'line', shadow: false });
    void ramps;
  },
});
export { palettes };
export default layers;
