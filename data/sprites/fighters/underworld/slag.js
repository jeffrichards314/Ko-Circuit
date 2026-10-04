// Slag (#101): sprite layers on the giant build.
// A man of cooling lava: a crust of black rock over the whole of him, split everywhere by cracks of orange and
// white-hot yellow: down the chest, across the shoulders, round the elbows and the knuckles, a face like a slab
// with two white-hot eyes and a mouth full of glow. Drips of molten rock hang from his fists. When he has just
// thrown a punch he cools: the cracks dim (the `molten` modifier does that live), and that is when to hit him.
import { rig } from '../pantheon/_rig.js';
import { swapPalette } from '../../../../src/engine/palette.js';

const { layers, palettes: base } = rig('slag', {
  build: 'giant',
  body: { size: [1.04, 1.0], legLen: 0.9, torsoLen: 1.05, shoulders: 1.14, neckLen: -2, dims: { neck: 11.5, chestW: 31, waistW: 26, belly: 9, deltoid: 12.5, upperArm: [9.8, 8.2] } },
  colors: {
    skin: [[11, 9, 9], [7, 5, 5], [3, 2, 3], [1, 1, 1]],
    hair: [[9, 7, 7], [4, 3, 3], [1, 1, 1]],
    glove: [[12, 9, 8], [7, 5, 5], [3, 2, 2]],
    top: [[11, 9, 9], [6, 4, 4], [3, 2, 2], [1, 1, 1]],
    trim: [[31, 28, 12], [31, 15, 3], [19, 6, 2]],
    boot: [[9, 7, 7], [4, 3, 3], [2, 1, 1]],
    sh: [[8, 6, 6], [4, 3, 3], [1, 1, 1]],
    extraA: { lava: [31, 14, 3], lavaHi: [31, 28, 11] }, extraB: { crack: [26, 8, 2] },
  },
  head: {
    jaw: 'square', ears: null, hair: 'none', eyeFace: 'focus', mouthW: 3.4, nose: null,
    face(ctx, H) {
      // a brow-ridge of rock, cracks running up the skull, the eyes and mouth white-hot
      const { cv, c } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.3), y = Math.round(H.y);
      cv.part(ctx.mask().rect(x - H.rx, y - 5, H.rx * 2, 4), { ramp: ctx.ramps.top, bevel: 2, inner: 'line', shadow: false });
      for (const [dx, dy] of [[-5, -13], [-4, -11], [-5, -9], [-3, -7], [4, -14], [5, -12], [4, -10], [6, -8], [0, -15], [1, -13]]) cv.px(x + dx, y + dy, c('lava'));
    },
    gear(ctx, H) {
      const { cv, c } = ctx;
      const x = Math.round(H.x + H.look[0]), y = Math.round(H.y + H.look[1]);
      for (const s of [-1, 1]) { cv.part(ctx.mask().ellipse(x + s * 5, y - 1, 3.2, 2.2), { ramp: [c('lavaHi'), c('lavaHi'), c('lava')], bevel: 0, inner: 'none', shadow: false }); }
      for (let i = -4; i <= 4; i++) cv.px(x + i, y + 8, c(i & 1 ? 'lava' : 'lavaHi'));
    },
  },
  top: {
    style: 'plate', pauldrons: true,
    emblem(ctx, cx, cy) {
      // the cracks down the chest: a branching line of lava
      const { cv, c } = ctx;
      for (const [x0, y0, x1, y1] of [[0, -8, 1, 0], [1, 0, -4, 6], [1, 0, 6, 8], [-4, 6, -6, 13], [6, 8, 5, 14], [0, -8, -7, -12], [1, -3, 8, -5]]) cv.line(cx + x0, cy + y0, cx + x1, cy + y1, (X, Y) => cv.px(X, Y, c('lava')));
      cv.px(cx + 1, cy, c('lavaHi')); cv.px(cx - 4, cy + 6, c('lavaHi')); cv.px(cx + 6, cy + 8, c('lavaHi'));
    },
  },
  belt: { buckle: 'square', ramp: 'boot' },
  front(ctx) {
    const { cv, J, pose, c } = ctx;
    if (pose.lying) return;
    // cracks round each knuckle and elbow, a drip of molten rock off each fist
    for (const s of ['L', 'R']) {
      const f = J['fi' + s], e = J['el' + s];
      cv.line(f[0] - 5, f[1] - 1, f[0] + 5, f[1] - 2, (X, Y) => cv.px(X, Y, c('lava')));
      cv.line(f[0] - 4, f[1] + 3, f[0] + 4, f[1] + 3, (X, Y) => cv.px(X, Y, c('crack')));
      cv.px(e[0], e[1], c('lava')); cv.px(e[0] + 1, e[1] + 1, c('lavaHi'));
      for (let j = 0; j < 4; j++) { cv.px(f[0] + (s === 'L' ? -3 : 3), f[1] + 6 + j * 2, c(j < 2 ? 'lava' : 'crack')); }
    }
  },
});
// just after he has attacked he has cooled: the cracks go dull, the crust greys over (the modifier swaps this in)
export const palettes = {
  ...base,
  'slag.cool': {
    A: swapPalette('slag.cool.A', base.slag.A, { lava: [12, 8, 8], lavaHi: [18, 12, 11], skinHi: [15, 14, 15], skin: [10, 9, 10] }),
    B: swapPalette('slag.cool.B', base.slag.B, { crack: [8, 5, 5], trimHi: [16, 12, 10], trim: [11, 7, 6], trimSh: [7, 4, 3] }),
  },
};

export default layers;
