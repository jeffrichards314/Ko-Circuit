// Queen Soot (#89): sprite layers on the medium build.
// The queen of the Ashen Fields: skin the grey of old ash, a long fall of hair going from black to ember-red at
// the ends, a crown of thin iron spikes each tipped with a live coal, a charred black robe cut away at the shoulders with a
// hem that glows where it is still burning, ember-gold rings on her wraps.
import { rig } from '../pantheon/_rig.js';

const { layers, palettes } = rig('soot', {
  build: 'medium',
  body: { size: [0.99, 1.02], legLen: 1.0, torsoLen: 0.99, shoulders: 0.96, dims: { belly: 1, waistW: 13, chestW: 17, upperArm: [5.6, 4.6] } },
  colors: {
    skin: [[19, 18, 20], [12, 11, 13], [7, 6, 8], [3, 2, 4]],
    hair: [[26, 9, 4], [12, 3, 2], [3, 1, 1]],
    glove: [[10, 9, 11], [5, 4, 6], [2, 2, 3]],
    top: [[9, 4, 5], [5, 2, 3], [2, 1, 2], [1, 0, 1]],
    trim: [[31, 25, 9], [28, 13, 3], [15, 6, 2]],
    boot: [[9, 8, 9], [4, 3, 4], [2, 1, 2]],
    sh: [[6, 3, 4], [3, 1, 2], [1, 0, 1]],
    extraA: { coal: [31, 12, 3], coalHi: [31, 26, 10] }, extraB: { edge: [30, 10, 2] },
  },
  head: {
    jaw: 'narrow', ears: [2.2, 3], hair: 'long', eyeFace: 'focus', mouthW: 2.8, nose: [1.6, 1.6],
    gear(ctx, H) {
      const { cv, c } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.3), y = Math.round(H.y);
      // the crown: a band of iron and five spikes, each with a coal on its tip
      cv.part(ctx.mask().rect(x - H.rx, y - 8, H.rx * 2, 3), { ramp: ctx.ramps.glove, bevel: 1, inner: 'line', shadow: false });
      for (let i = -2; i <= 2; i++) {
        const h = 7 - Math.abs(i);
        cv.part(ctx.mask().poly([[x + i * 5 - 1.6, y - 8], [x + i * 5, y - 8 - h], [x + i * 5 + 1.6, y - 8]]), { ramp: ctx.ramps.glove, bevel: 1, inner: 'line', shadow: false });
        cv.px(x + i * 5, y - 9 - h, c('coalHi')); cv.px(x + i * 5, y - 8 - h, c('coal'));
      }
      const fx = x + H.look[0], fy = y + H.look[1];
      for (const s of [-1, 1]) cv.px(fx + s * 4, fy - 0.5, c('coalHi'));
    },
  },
  top: { style: 'robe', emblem(ctx, cx, cy) { const { cv, c } = ctx; for (const dx of [-12, -7, -2, 3, 8, 12]) { cv.px(cx + dx, cy + 20 + ((dx * 3) & 3), c('edge')); } } },
  belt: { buckle: 'round', ramp: 'trim' },
  front(ctx) {
    const { cv, J, pose, c } = ctx;
    if (pose.lying) return;
    for (const s of ['L', 'R']) { const f = J['fi' + s]; cv.line(f[0] - 4, f[1] + 4, f[0] + 4, f[1] + 4, (X, Y) => cv.px(X, Y, c('trim'))); cv.px(f[0], f[1] - 3, c('coal')); }
  },
});
export { palettes };
export default layers;
