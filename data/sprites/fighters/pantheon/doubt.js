// The Doubt (#74): sprite layers on the medium build.
// A figure in a grey hood and a long grey tunic, pale as paper, with eyes too big for his face and a
// mouth that never stops. Everything about him is a little off: one shoulder higher, one glove a
// different grey. His words (LEFT! RIGHT! DUCK!) are drawn live in a box over his head (`callout`).
import { rig } from './_rig.js';

const { layers, palettes } = rig('doubt', {
  build: 'medium',
  body: { size: [0.98, 1.0], legLen: 0.98, torsoLen: 1.04, shoulders: 0.96, dims: { belly: 3, waistW: 14, chestW: 18 } },
  colors: {
    skin: [[28, 27, 29], [22, 21, 25], [14, 13, 18], [8, 7, 11]],
    hair: [[14, 14, 18], [8, 8, 12], [3, 3, 6]],
    glove: [[22, 22, 26], [14, 14, 18], [7, 7, 10]],
    top: [[17, 17, 22], [10, 10, 15], [5, 5, 9], [2, 2, 5]],
    trim: [[26, 26, 30], [16, 16, 21], [8, 8, 13]],
    boot: [[12, 12, 17], [7, 7, 11], [3, 3, 6]],
    sh: [[11, 11, 16], [6, 6, 10], [3, 3, 5]],
    extraA: { lie: [31, 8, 8] }, extraB: { truth: [8, 28, 12] },
  },
  head: {
    jaw: 'narrow', ears: null, hair: 'none', eyeFace: 'wide', mouthFace: 'open', mouthW: 3.4, gap: 2, brow: { len: 4.6, thick: 0.9 },
    gear(ctx, H) {
      const { cv } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.3), y = Math.round(H.y);
      // the hood: a cowl round the face, the point flopping to one side
      const hood = ctx.mask().ellipse(x, y - 4, H.rx + 3, 11).cut(ctx.mask().ellipse(x + H.look[0], y + 3, H.rx - 2.4, 11));
      hood.poly([[x + 3, y - 12], [x + 14, y - 8], [x + 9, y - 2]]);
      cv.part(hood, { ramp: ctx.ramps.top, bevel: 4, inner: 'line' });
    },
  },
  top: { style: 'robe', hem: false },
  belt: { buckle: 'none', ramp: 'top' },
});
export { palettes };
export default layers;
