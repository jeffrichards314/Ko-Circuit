// Umbra (#104): sprite layers on the lean build.
// A pale figure with no colour of its own: chalk-grey skin, long black hair over half a narrow face, two blank white
// eyes, dark wraps on the arms and a torn dark cloth for trunks. His shadow does not match him (the `shadow` modifier draws
// it, in the `umbra.shade` palette: a body-sized cut-out of black with a violet edge).
import { rig } from '../pantheon/_rig.js';
import { swapPalette } from '../../../../src/engine/palette.js';

const { layers, palettes: base } = rig('umbra', {
  build: 'lean',
  body: { size: [0.96, 1.05], legLen: 1.06, torsoLen: 0.96, shoulders: 0.9, dims: { belly: 0.6, waistW: 11, chestW: 14.5, upperArm: [4.6, 3.8], forearm: [4, 3.4] } },
  colors: {
    skin: [[25, 25, 27], [19, 19, 22], [12, 12, 16], [6, 6, 9]],
    hair: [[7, 6, 10], [3, 3, 6], [1, 1, 3]],
    glove: [[8, 7, 12], [4, 4, 8], [2, 1, 4]],
    top: [[7, 6, 11], [4, 3, 7], [2, 1, 4], [0, 0, 2]],
    trim: [[20, 14, 27], [11, 7, 17], [5, 3, 9]],
    boot: [[6, 5, 9], [3, 3, 5], [1, 1, 2]],
    sh: [[6, 5, 10], [3, 3, 6], [1, 1, 3]],
    extraA: { lilac: [24, 16, 31] }, extraB: { rag: [9, 8, 13] },
  },
  head: {
    jaw: 'narrow', ears: null, hair: 'long', eyeFace: 'focus', mouthW: 2.4, nose: [1.4, 1.4], brow: { len: 4, thick: 1 },
    gear(ctx, H) {
      // blank white eyes over the real ones, and a fall of hair across one side of the face
      const { cv, c } = ctx;
      const x = Math.round(H.x + H.look[0]), y = Math.round(H.y + H.look[1]);
      for (const s of [-1, 1]) cv.part(ctx.mask().ellipse(x + s * 4.4, y - 0.6, 2.6, 1.9), { ramp: [c('white'), c('white'), c('lilac')], bevel: 0, inner: 'none', shadow: false });
      cv.part(ctx.mask().poly([[x - 9, y - 9], [x + 3, y - 10], [x - 1, y + 4], [x - 5, y + 12], [x - 9, y + 4]]), { ramp: ctx.ramps.hair, bevel: 2, inner: 'line', shadow: false });
      cv.px(x - 4, y - 0.6, c('white')); cv.px(x - 5, y - 0.6, c('white'));
    },
  },
  top: { style: 'bare', emblem(ctx, cx, cy) { const { cv, c } = ctx; for (const [dx, dy] of [[-6, -4], [-5, -3], [5, 1], [6, 2], [-2, 7], [3, 8]]) cv.px(cx + dx, cy + dy, c('lilac')); } },
  belt: { buckle: 'none' },
  front(ctx) {
    const { cv, J, pose, c, ramps } = ctx;
    if (pose.lying) return;
    // dark wraps from the elbow to the knuckle
    for (const s of ['L', 'R']) {
      const f = J['fi' + s], e = J['el' + s];
      for (let i = 1; i <= 4; i++) { const u = i / 5, x = e[0] + (f[0] - e[0]) * u, y = e[1] + (f[1] - e[1]) * u; cv.part(ctx.mask().ellipse(x, y, 3.4, 1.4), { ramp: ramps.glove, bevel: 1, inner: 'line', shadow: false }); }
      cv.px(f[0] - 2, f[1] + 3, c('lilac'));
    }
  },
});
// his shadow on the canvas: the same frames cut out in black with a violet edge (the modifier tints its tell)
const K = [3, 1, 8], K2 = [9, 4, 16], L = [22, 12, 30];
export const palettes = {
  ...base,
  'umbra.shade': {
    A: swapPalette('umbra.shade.A', base.umbra.A, { outline: [1, 0, 3], skinHi: K2, skin: K, skinSh: K, skinDk: K, white: L, mouth: K, hairHi: K2, hair: K, hairDk: K, gloveHi: K2, glove: K, gloveDk: K, lilac: L }),
    B: swapPalette('umbra.shade.B', base.umbra.B, { trimHi: L, trim: K2, trimSh: K, bootHi: K2, boot: K, bootDk: K, shHi: K2, sh: K, shDk: K, topHi: K2, top: K, topSh: K, topDk: K, rag: K }),
  },
  // the tell: the same cut-out, lit
  'umbra.shade.hot': {
    A: swapPalette('umbra.shade.hot.A', base.umbra.A, { outline: [10, 4, 20], skinHi: [20, 10, 28], skin: [14, 6, 22], skinSh: [10, 4, 18], skinDk: [6, 2, 12], white: [31, 28, 31], mouth: K, hairHi: K2, hair: K, hairDk: K, gloveHi: [22, 12, 30], glove: [16, 7, 24], gloveDk: [10, 4, 16], lilac: [31, 26, 31] }),
    B: swapPalette('umbra.shade.hot.B', base.umbra.B, { trimHi: L, trim: [16, 8, 24], trimSh: K2, bootHi: [16, 7, 24], boot: [10, 4, 16], bootDk: K, shHi: [16, 7, 24], sh: [10, 4, 16], shDk: K, topHi: [16, 7, 24], top: [10, 4, 16], topSh: K2, topDk: K, rag: K }),
  },
};

export default layers;
