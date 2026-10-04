// The Jailer (#94): sprite layers on the giant build.
// The warden of the Chain Pits: a hulking figure in black iron plate, an iron helm with a single slit and a red
// light behind it, thick chains hanging in loops from both shoulders, a plate of riveted grey iron across the
// chest with a lock in the middle of it, spiked iron gauntlets, a belt hung with keys and a cell-door
// lock as a buckle. His face is never seen.
import { rig } from '../pantheon/_rig.js';
import * as K from '../../remixKit.js';

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
  // Title Defense: THE KEYMASTER. The black iron has weathered to verdigris; a pair of heavy horns have been bolted to the helm, a long coat of
  // chain falls from the shoulders, spiked plate sits on the pauldrons and a great ring of brass keys hangs from the belt.
  remix: {
    swap: {
      A: { skinHi: [10, 14, 14], skin: [5, 8, 9], skinSh: [2, 4, 5], gloveHi: [22, 20, 12], glove: [14, 12, 6], gloveDk: [6, 5, 2] },
      B: { topHi: [13, 22, 20], top: [7, 15, 14], topSh: [3, 8, 8], topDk: [1, 3, 4], trimHi: [31, 28, 14], trim: [27, 21, 7], trimSh: [14, 10, 3], shHi: [8, 12, 12], sh: [4, 7, 8], shDk: [2, 3, 4], bootHi: [10, 13, 13], boot: [5, 7, 8], bootDk: [2, 3, 3] },
    },
    ramps: { verd: ['topHi', 'top', 'topSh'], brass: ['trimHi', 'trim', 'trimSh'], dark: ['shHi', 'sh', 'shDk'] },
    back(ctx) { if (!ctx.pose.lying) K.cape(ctx, { ramp: 'dark', inner: 'verd', len: 34, flare: 10, hem: 'scallop' }); },
    head(ctx, H) { K.horns(ctx, H, { ramp: 'brass', len: 14, out: 7, thick: 3.4 }); },
    torso(ctx) {
      if (ctx.pose.lying) return;
      K.pauldrons(ctx, { ramp: 'brass', style: 'spiked', size: 3, tip: 'verd' });
      K.bandolier(ctx, { ramp: 'brass', dir: 1, studs: 'brass', n: 6 });
    },
    front(ctx) {
      K.bracers(ctx, { ramp: 'brass', from: 0.2, to: 0.5, wide: 2 });
      const w = ctx.J.waist; for (const dx of [-20, -16, 18, 22]) ctx.cv.part(ctx.mask().ellipse(w[0] + dx, w[1] + 4, 2.6, 2.6).cut(ctx.mask().ellipse(w[0] + dx, w[1] + 4, 1.1, 1.1)), { ramp: ctx.ramps.brass, bevel: 1, shadow: false });
    },
  },
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
