// Orbit (#66): sprite layers on the medium build.
// A gyroscope of a man: a smooth dark head with a small gold ring of light floating above it, dark
// skin, a violet vest over a bare chest, a brass armillary ring circling his body (a thin
// tilted hoop drawn across the torso), gold trim, silver gloves. The two star-fists that
// circle him are drawn live (the `orbit` modifier).
import { rig } from './_rig.js';
import { halo } from './_rig.js';

const { layers, palettes } = rig('orbit', {
  build: 'medium',
  body: { size: [1.0, 1.0], legLen: 0.98, torsoLen: 1.02, shoulders: 1.02, dims: { belly: 4, chestW: 20, waistW: 16 } },
  colors: {
    skin: [[19, 13, 10], [13, 8, 6], [8, 5, 4], [4, 2, 2]],
    hair: [[6, 5, 8], [3, 3, 5], [1, 1, 3]],
    glove: [[31, 31, 31], [25, 27, 31], [13, 16, 24]],
    top: [[20, 12, 31], [13, 6, 24], [7, 3, 15], [3, 1, 8]],
    trim: [[31, 29, 14], [28, 22, 4], [17, 11, 2]],
    boot: [[29, 25, 8], [22, 16, 3], [11, 7, 1]],
    sh: [[14, 8, 26], [8, 4, 18], [4, 2, 10]],
    extraA: { ringHi: [31, 31, 22] }, extraB: { brass: [24, 18, 5] },
  },
  head: {
    jaw: 'round', ears: [2.2, 3], hair: 'bald', eyeFace: 'focus', mouthW: 3, gap: -1,
    gear(ctx, H) {
      const x = Math.round(H.x + H.look[0] * 0.3), y = Math.round(H.y);
      halo(ctx, x, y - H.ry - 5, 8, 2.6, ['ringHi', 'trimHi', 'trim'].map(ctx.c));
    },
  },
  top: { style: 'vest', pauldrons: false },
  belt: { buckle: 'round' }, stripe: true,
  front(ctx) {
    const { cv, J, c, pose } = ctx;
    if (pose.lying) return;
    // the armillary ring: a thin tilted hoop round his middle, in front of everything
    const w = J.waist, ch = J.chest;
    const cx = (w[0] + ch[0]) / 2, cy = (w[1] + ch[1]) / 2 - 2;
    for (let a = 0; a < 64; a++) {
      const t = (a / 64) * Math.PI * 2, X = Math.round(cx + Math.cos(t) * 27), Y = Math.round(cy + Math.sin(t) * 6 + Math.cos(t) * 5);
      if (Math.sin(t) > -0.15) { cv.px(X, Y, c(a & 4 ? 'trim' : 'brass')); }
    }
  },
});
export { palettes };
export default layers;
