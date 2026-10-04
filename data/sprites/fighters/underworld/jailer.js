// The Jailer (#94): sprite layers on the giant build.
// The warden of the Chain Pits: a hulking figure in black iron plate, an iron helm with a single slit and a red
// light behind it, thick chains hanging in loops from both shoulders, a plate of riveted grey iron across the
// chest with a lock in the middle of it, spiked iron gauntlets, a belt hung with keys and a cell-door
// lock as a buckle. His face is never seen.
import { rig } from '../pantheon/_rig.js';

const { layers, palettes } = rig('jailer', {
  build: 'giant',
  body: { size: [1.02, 1.0], legLen: 0.9, torsoLen: 1.06, shoulders: 1.14, neckLen: -2, dims: { neck: 11, chestW: 32, waistW: 26, belly: 8, deltoid: 13, upperArm: [10, 8.4] } },
  colors: {
    skin: [[11, 11, 14], [6, 6, 9], [3, 3, 5], [1, 1, 2]],
    hair: [[12, 12, 15], [6, 6, 9], [2, 2, 4]],
    glove: [[15, 16, 20], [8, 9, 13], [3, 3, 6]],
    top: [[15, 16, 21], [9, 10, 14], [4, 5, 8], [1, 2, 4]],
    trim: [[23, 24, 28], [13, 14, 19], [6, 7, 10]],
    boot: [[10, 10, 13], [5, 5, 8], [2, 2, 3]],
    sh: [[9, 9, 12], [4, 4, 7], [1, 1, 3]],
    extraA: { eye: [31, 6, 4], eyeHi: [31, 20, 10] }, extraB: { key: [28, 23, 9], keyDk: [15, 11, 3] },
  },
  head: {
    jaw: 'square', ears: null, hair: 'none', eyeFace: 'focus', mouthW: 3, nose: null,
    face(ctx, H) {
      // the helm: a plated dome down to the chin, one slit with a red light behind it
      const { cv, c } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.3), y = Math.round(H.y);
      const helm = ctx.mask().ellipse(x, y - 1, H.rx + 2, H.ry + 1.4).ellipse(x, y + 6, H.rx + 1.4, 10.5);
      cv.part(helm, { ramp: ctx.ramps.top, bevel: 6, inner: 'line' });
      cv.part(ctx.mask().rect(x - H.rx - 1, y - 3, H.rx * 2 + 2, 2), { ramp: ctx.ramps.trim, bevel: 1, inner: 'line', shadow: false });
      cv.line(x, y - H.ry, x, y + 2, (X, Y) => cv.shade(X, Y, 1));
      for (const [dx, dy] of [[-9, -4], [9, -4], [-8, 6], [8, 6]]) cv.px(x + dx, y + dy, c('trimHi'));
      // the slit and the light behind it
      cv.part(ctx.mask().rect(x - 8, y + 0.4, 17, 3), { ramp: [c('outline'), c('outline'), c('outline')], bevel: 0, inner: 'none', shadow: false });
      for (let i = -6; i <= 6; i += 3) { cv.px(x + i, y + 1, c('eye')); cv.px(x + i, y + 2, c('eye')); } cv.px(x - 3, y + 1, c('eyeHi')); cv.px(x + 3, y + 1, c('eyeHi'));
      // a breather grille over the mouth
      for (let i = -3; i <= 3; i += 2) cv.line(x + i, y + 8, x + i, y + 13, (X, Y) => cv.px(X, Y, c('outline')));
    },
  },
  top: {
    style: 'plate', pauldrons: true,
    emblem(ctx, cx, cy) {
      const { cv, c } = ctx;
      // the lock in the middle of the chest
      cv.part(ctx.mask().rect(cx - 5, cy - 1, 10, 8), { ramp: [c('key'), c('key'), c('keyDk')], bevel: 2, inner: 'line', shadow: false });
      cv.part(ctx.mask().ellipse(cx, cy - 2, 3.2, 3).cut(ctx.mask().ellipse(cx, cy - 2, 1.8, 1.6)), { ramp: [c('key'), c('key'), c('keyDk')], bevel: 1, inner: 'line', shadow: false });
      cv.px(cx, cy + 3, c('outline')); cv.px(cx, cy + 4, c('outline'));
      for (const dx of [-12, 12]) for (const dy of [-6, 4]) cv.px(cx + dx, cy + dy, c('trimHi'));
    },
  },
  belt: { buckle: 'square', ramp: 'trim' },
  front(ctx) {
    const { cv, J, pose, c } = ctx;
    if (pose.lying) return;
    // chains looped from each shoulder, spiked knuckles, keys on the belt
    for (const s of ['L', 'R']) {
      const sh = J['sh' + s], d = s === 'L' ? -1 : 1;
      for (let i = 0; i < 8; i++) { const u = i / 7, x = sh[0] + d * (2 + u * 10), y = sh[1] + 3 + Math.sin(u * Math.PI) * 9; cv.part(ctx.mask().ellipse(x, y, 2.2, 1.6), { ramp: [c('trimHi'), c('trim'), c('trimSh')], bevel: 1, inner: 'line', shadow: false }); }
      const f = J['fi' + s];
      for (const dx of [-4, 0, 4]) cv.part(ctx.mask().poly([[f[0] + dx - 1.4, f[1] - 4], [f[0] + dx, f[1] - 8], [f[0] + dx + 1.4, f[1] - 4]]), { ramp: [c('trimHi'), c('trim'), c('trimSh')], bevel: 1, inner: 'line', shadow: false });
    }
    const w = J.waist;
    for (const dx of [-16, -12, 13, 17]) { cv.line(w[0] + dx, w[1] + 2, w[0] + dx, w[1] + 8, (X, Y) => cv.px(X, Y, c('key'))); cv.px(w[0] + dx, w[1] + 9, c('keyDk')); }
  },
});
export { palettes };
export default layers;
