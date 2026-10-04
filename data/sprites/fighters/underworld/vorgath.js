// VORGATH, KING BELOW: sprite layers on the giant build.
// The king of the dead: a colossus in black-iron plate, the plates split and seamed with dull red, shoulders of
// swept spikes, a cloak of shadow hanging from them to the floor, a helm-less face of grey stone with two eyes that burn
// red-white, and the crown: a jagged ring of black iron, five tall spikes each with a ruby in it, set right into the
// skull. Gauntlets like anvils. In the fight he is in near-darkness (the `gloom` modifier): only the eyes and the
// crown show, and that is the whole of his tell. The palettes `vorgath.p2` and `vorgath.p3` are the fight's later phases:
// the red spreads through the plates.
import { rig } from '../pantheon/_rig.js';
import { swapPalette } from '../../../../src/engine/palette.js';

const { layers, palettes: base } = rig('vorgath', {
  build: 'giant',
  body: { size: [1.16, 1.06], legLen: 0.88, torsoLen: 1.08, shoulders: 1.2, neckLen: -2, dims: { neck: 13, chestW: 35, waistW: 29, belly: 9, deltoid: 15, upperArm: [11.4, 9.6], forearm: [9.6, 8] } },
  colors: {
    skin: [[15, 15, 17], [9, 9, 11], [5, 5, 7], [2, 2, 3]],
    hair: [[8, 7, 9], [4, 3, 5], [1, 1, 2]],
    glove: [[12, 11, 14], [7, 6, 9], [3, 2, 5]],
    top: [[12, 11, 14], [7, 6, 9], [3, 3, 5], [1, 1, 2]],
    trim: [[20, 18, 22], [11, 9, 14], [5, 4, 7]],
    boot: [[8, 7, 9], [4, 3, 5], [1, 1, 2]],
    sh: [[6, 5, 8], [3, 2, 5], [1, 1, 2]],
    extraA: { eye: [31, 8, 6], eyeHi: [31, 26, 22] }, extraB: { ruby: [31, 6, 9], seam: [22, 3, 4] },
  },
  head: {
    jaw: 'square', ears: null, hair: 'none', eyeFace: 'focus', mouthW: 3.4, nose: null, brow: { len: 5.4, thick: 1.7 },
    gear(ctx, H) {
      // the crown: a band and five tall spikes with a ruby in each; the eyes burn
      const { cv, c } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.3), y = Math.round(H.y);
      cv.part(ctx.mask().rect(x - H.rx - 1, y - 9, H.rx * 2 + 2, 4), { ramp: ctx.ramps.trim, bevel: 1, inner: 'line', shadow: false });
      for (let i = -2; i <= 2; i++) {
        const h = 12 - Math.abs(i) * 2;
        cv.part(ctx.mask().poly([[x + i * 5.6 - 2.2, y - 9], [x + i * 5.6, y - 9 - h], [x + i * 5.6 + 2.2, y - 9]]), { ramp: ctx.ramps.trim, bevel: 1, inner: 'line', shadow: false });
        cv.px(x + i * 5.6, y - 8, c('ruby')); cv.px(x + i * 5.6, y - 7, c('eyeHi'));
      }
      const fx = x + H.look[0], fy = y + H.look[1];
      for (const s of [-1, 1]) { cv.part(ctx.mask().ellipse(fx + s * 5.4, fy - 0.6, 3, 2), { ramp: [c('eyeHi'), c('eye'), c('eye')], bevel: 0, inner: 'none', shadow: false }); }
    },
  },
  top: {
    style: 'plate', pauldrons: true,
    emblem(ctx, cx, cy) {
      // seams of red through the plate: a crown-shaped scar over the heart
      const { cv, c } = ctx;
      for (const [x0, y0, x1, y1] of [[-9, 6, -8, -2], [-8, -2, -4, 3], [-4, 3, 0, -5], [0, -5, 4, 3], [4, 3, 8, -2], [8, -2, 9, 6], [-9, 6, 9, 6]]) cv.line(cx + x0, cy + y0, cx + x1, cy + y1, (X, Y) => cv.px(X, Y, c('seam')));
      cv.px(cx, cy + 1, c('eyeHi')); cv.px(cx, cy + 2, c('ruby'));
      for (const s of [-1, 1]) cv.line(cx + s * 14, cy - 8, cx + s * 16, cy + 10, (X, Y) => cv.px(X, Y, c('seam')));
    },
  },
  belt: { buckle: 'square', ramp: 'trim' },
  back(ctx) {
    // the cloak of shadow behind him: from the shoulders to the floor
    const { cv, J, c } = ctx;
    const a = J.shL, b = J.shR, f = Math.round(J.ftL[1]) + 2;
    cv.part(ctx.mask().poly([[a[0] - 6, a[1] - 4], [b[0] + 6, b[1] - 4], [b[0] + 14, f], [a[0] - 14, f]]), { ramp: [c('topSh'), c('topSh'), c('outline')], bevel: 4, inner: 'line', shadow: false });
  },
  front(ctx) {
    const { cv, J, pose, c } = ctx;
    if (pose.lying) return;
    // spikes off each pauldron, red seams round the fists
    for (const s of ['L', 'R']) {
      const sh = J['sh' + s], d = s === 'L' ? -1 : 1;
      for (let i = 0; i < 3; i++) cv.part(ctx.mask().poly([[sh[0] + d * (2 + i * 4), sh[1] - 3], [sh[0] + d * (5 + i * 5), sh[1] - 11 - i * 2], [sh[0] + d * (7 + i * 4), sh[1] - 3]]), { ramp: ctx.ramps.trim, bevel: 1, inner: 'line', shadow: false });
      const f = J['fi' + s];
      cv.line(f[0] - 5, f[1] - 2, f[0] + 5, f[1] - 2, (X, Y) => cv.px(X, Y, c('seam')));
    }
  },
});
export const palettes = {
  ...base,
  // phase 2: the seams brighten, the crown burns; phase 3: the plates themselves glow
  'vorgath.p2': { A: swapPalette('vorgath.p2.A', base.vorgath.A, { eye: [31, 14, 8], eyeHi: [31, 30, 26] }), B: swapPalette('vorgath.p2.B', base.vorgath.B, { seam: [29, 6, 5], ruby: [31, 10, 12] }) },
  'vorgath.p3': { A: swapPalette('vorgath.p3.A', base.vorgath.A, { eye: [31, 22, 14], eyeHi: [31, 31, 30] }), B: swapPalette('vorgath.p3.B', base.vorgath.B, { seam: [31, 14, 6], ruby: [31, 16, 18], topHi: [22, 8, 9], top: [15, 4, 6] }) },
};
export default layers;
