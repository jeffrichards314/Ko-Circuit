// The Herald (#107): sprite layers on the medium build.
// Vorgath's voice: a tall herald in a crimson-and-black tabard that bears the King's crown in gold thread on the
// chest, a spiked mantle over the shoulders, a bone-white mask with a wide-open mouth (a horn's bell for a mouth) and
// two red points for eyes, black gloves to the elbow. A ring of five small crowns hangs at his belt: one for every champion
// he has spoken for.
import { rig } from '../pantheon/_rig.js';

const { layers, palettes } = rig('herald', {
  build: 'medium',
  body: { size: [1.0, 1.04], legLen: 1.02, torsoLen: 1.0, shoulders: 1.0, dims: { belly: 2, waistW: 13.5, chestW: 17.5, upperArm: [5.8, 4.8] } },
  colors: {
    skin: [[24, 23, 20], [17, 16, 14], [10, 10, 9], [5, 5, 5]],
    hair: [[6, 4, 5], [3, 2, 3], [1, 1, 1]],
    glove: [[8, 6, 8], [4, 3, 5], [2, 1, 2]],
    top: [[22, 4, 8], [14, 2, 5], [7, 1, 3], [3, 0, 1]],
    trim: [[31, 26, 9], [28, 19, 4], [15, 9, 2]],
    boot: [[8, 6, 7], [4, 3, 4], [1, 1, 1]],
    sh: [[9, 3, 5], [5, 1, 3], [2, 0, 1]],
    extraA: { bone: [29, 28, 24], boneDk: [19, 18, 15] }, extraB: { eye: [31, 8, 6] },
  },
  head: {
    jaw: 'narrow', ears: null, hair: 'none', eyeFace: 'focus', mouthW: 3, nose: null,
    face(ctx, H) {
      // the mask: a bone-white oval over the whole face, a wide black mouth, two red points for eyes
      const { cv, c } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.4), y = Math.round(H.y + H.look[1] * 0.4);
      cv.part(ctx.mask().ellipse(x, y, H.rx + 1.2, H.ry + 1).ellipse(x, y + 6, H.rx - 1, 9), { ramp: [c('bone'), c('bone'), c('boneDk')], bevel: 5, inner: 'line' });
      cv.part(ctx.mask().ellipse(x, y + 8, 4.4, 3.4), { ramp: [c('outline'), c('outline'), c('outline')], bevel: 0, inner: 'none', shadow: false });
      for (const s of [-1, 1]) { cv.part(ctx.mask().rect(x + s * 5 - 1.5, y - 3, 3.4, 2.4), { ramp: [c('outline'), c('outline'), c('outline')], bevel: 0, inner: 'none', shadow: false }); cv.px(x + s * 5, y - 2, c('eye')); }
      cv.line(x, y - H.ry, x, y + 1, (X, Y) => cv.px(X, Y, c('boneDk')));
    },
  },
  top: {
    style: 'robe', hem: true,
    emblem(ctx, cx, cy) {
      // the crown of Vorgath in gold thread on the tabard
      const { cv, c } = ctx;
      for (const [dx, dy] of [[-6, 3], [-6, 2], [-6, 1], [-4, 2], [-2, 1], [-2, 2], [0, 0], [0, 1], [0, 2], [2, 1], [2, 2], [4, 2], [6, 1], [6, 2], [6, 3]]) cv.px(cx + dx, cy + dy + 2, c('trim'));
      for (let i = -6; i <= 6; i++) cv.px(cx + i, cy + 6, c('trim'));
    },
  },
  belt: { buckle: 'none' },
  front(ctx) {
    const { cv, J, pose, c, ramps } = ctx;
    if (pose.lying) return;
    // the spiked mantle: three spikes off each shoulder
    for (const s of ['L', 'R']) {
      const sh = J['sh' + s], d = s === 'L' ? -1 : 1;
      for (let i = 0; i < 3; i++) cv.part(ctx.mask().poly([[sh[0] + d * (1 + i * 3), sh[1] - 2], [sh[0] + d * (3 + i * 4), sh[1] - 9 + i], [sh[0] + d * (5 + i * 3), sh[1] - 2]]), { ramp: [c('trim'), c('trimSh'), c('trimSh')], bevel: 1, inner: 'line', shadow: false });
      const f = J['fi' + s]; cv.line(f[0] - 4, f[1] - 3, f[0] + 4, f[1] - 3, (X, Y) => cv.px(X, Y, c('trim')));
    }
    // the ring of little crowns at the belt
    const w = J.waist;
    for (const dx of [-14, -8, 9, 15]) { cv.px(w[0] + dx, w[1] + 5, c('trim')); cv.px(w[0] + dx - 1, w[1] + 4, c('trim')); cv.px(w[0] + dx + 1, w[1] + 4, c('trim')); }
    void ramps;
  },
});
export { palettes };
export default layers;
