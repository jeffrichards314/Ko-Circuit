// Gatekeeper Nox (#103): sprite layers on the heavy build.
// The keeper of the Abyss Gate: a wall of black iron plate under a tabard of dark violet, shoulders built like the
// arches of a gate, a helm with a portcullis for a visor (vertical bars, a cold violet light behind them), a great ring
// of keys at his belt and iron gauntlets. When his guard is up a portcullis of bars is drawn across him (the `gate`
// modifier does that live); when it is open the bars are raised.
import { rig } from '../pantheon/_rig.js';

const { layers, palettes } = rig('nox', {
  build: 'heavy',
  body: { size: [1.08, 1.0], legLen: 0.9, torsoLen: 1.05, shoulders: 1.2, neckLen: -2, dims: { neck: 11, chestW: 31, waistW: 25, belly: 8, deltoid: 13, upperArm: [8.8, 7.4] } },
  colors: {
    skin: [[10, 9, 13], [6, 5, 9], [3, 3, 5], [1, 1, 3]],
    hair: [[9, 8, 12], [4, 4, 7], [1, 1, 3]],
    glove: [[14, 14, 20], [8, 8, 13], [3, 3, 7]],
    top: [[13, 12, 19], [8, 6, 13], [4, 3, 8], [1, 1, 3]],
    trim: [[22, 22, 30], [12, 12, 20], [5, 5, 10]],
    boot: [[9, 9, 13], [4, 4, 7], [2, 2, 4]],
    sh: [[9, 6, 14], [5, 3, 9], [2, 1, 4]],
    extraA: { eye: [22, 12, 31], eyeHi: [29, 24, 31] }, extraB: { key: [27, 23, 10], keyDk: [14, 10, 3] },
  },
  head: {
    jaw: 'square', ears: null, hair: 'none', eyeFace: 'focus', mouthW: 3, nose: null,
    face(ctx, H) {
      // a closed helm; the visor is a portcullis: five bars over a violet light
      const { cv, c } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.3), y = Math.round(H.y);
      const helm = ctx.mask().ellipse(x, y - 1, H.rx + 2, H.ry + 1.4).ellipse(x, y + 6, H.rx + 1.4, 10.5);
      cv.part(helm, { ramp: ctx.ramps.top, bevel: 6, inner: 'line' });
      cv.part(ctx.mask().rect(x - H.rx - 1, y - 6, H.rx * 2 + 2, 2), { ramp: ctx.ramps.trim, bevel: 1, inner: 'line', shadow: false });
      cv.part(ctx.mask().rect(x - 9, y - 3, 19, 11), { ramp: [c('outline'), c('outline'), c('outline')], bevel: 0, inner: 'none', shadow: false });
      for (let i = -8; i <= 8; i++) { cv.px(x + i, y + 1, c('eye')); cv.px(x + i, y + 2, c('eye')); }
      for (const dx of [-3, 3]) { cv.px(x + dx, y + 1, c('eyeHi')); cv.px(x + dx, y + 2, c('eyeHi')); }
      for (const i of [-8, -4, 0, 4, 8]) cv.line(x + i, y - 3, x + i, y + 7, (X, Y) => cv.px(X, Y, c('trim')));
      cv.line(x - 9, y + 3, x + 9, y + 3, (X, Y) => cv.px(X, Y, c('trimSh')));
    },
  },
  top: {
    style: 'plate', pauldrons: true,
    emblem(ctx, cx, cy) {
      // a keyhole in a gate: an arch with a keyhole in the middle of the chest
      const { cv, c } = ctx;
      cv.part(ctx.mask().ellipse(cx, cy + 3, 6.5, 6).rect(cx - 6.5, cy + 3, 13, 9), { ramp: [c('sh'), c('shDk'), c('outline')], bevel: 1, inner: 'line', shadow: false });
      cv.part(ctx.mask().ellipse(cx, cy + 3, 2, 2), { ramp: [c('eyeHi'), c('eye'), c('eye')], bevel: 0, inner: 'none', shadow: false });
      cv.part(ctx.mask().poly([[cx - 1.4, cy + 4], [cx + 1.4, cy + 4], [cx + 2, cy + 9], [cx - 2, cy + 9]]), { ramp: [c('eye'), c('eye'), c('eye')], bevel: 0, inner: 'none', shadow: false });
    },
  },
  belt: { buckle: 'square', ramp: 'trim' },
  front(ctx) {
    const { cv, J, pose, c } = ctx;
    if (pose.lying) return;
    // the ring of keys at his belt
    const w = J.waist;
    for (const dx of [-18, -14, 15, 19]) { cv.line(w[0] + dx, w[1] + 2, w[0] + dx, w[1] + 8, (X, Y) => cv.px(X, Y, c('key'))); cv.px(w[0] + dx, w[1] + 9, c('keyDk')); cv.px(w[0] + dx + 1, w[1] + 9, c('key')); }
    // studs on the gauntlets
    for (const s of ['L', 'R']) { const f = J['fi' + s]; for (const dx of [-3, 0, 3]) cv.px(f[0] + dx, f[1] - 3, c('trimHi')); }
  },
});
export { palettes };
export default layers;
