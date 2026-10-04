// Cinder (#86): sprite layers on the lean build.
// A man burnt out to the bone: ash-grey skin split with cracks that still glow, a spike of charcoal hair, a scorched
// vest, wraps gone black with a hot coal of knuckle under each, charcoal trunks. He sheds ash from the shoulders
// as he moves (the haze is the `ash` modifier's).
import { rig } from '../pantheon/_rig.js';

const { layers, palettes } = rig('cinder', {
  build: 'lean',
  body: { size: [0.97, 1.03], legLen: 1.04, torsoLen: 0.97, shoulders: 0.95, dims: { belly: 1, waistW: 12, chestW: 16 } },
  colors: {
    skin: [[22, 21, 20], [15, 14, 14], [9, 8, 9], [4, 4, 5]],
    hair: [[10, 9, 9], [5, 5, 5], [2, 2, 2]],
    glove: [[15, 14, 14], [8, 7, 7], [3, 3, 3]],
    top: [[8, 8, 8], [4, 4, 4], [2, 2, 2], [1, 1, 1]],
    trim: [[31, 20, 6], [26, 11, 3], [14, 5, 2]],
    boot: [[9, 8, 8], [4, 4, 4], [2, 2, 2]],
    sh: [[13, 6, 4], [7, 3, 2], [3, 1, 1]],
    extraA: { ember: [31, 16, 4], emberHi: [31, 27, 10] }, extraB: { crack: [30, 12, 3], ashHi: [26, 25, 24] },
  },
  head: {
    jaw: 'narrow', ears: [2.2, 3], hair: 'spike', eyeFace: 'focus', mouthW: 2.6, nose: [1.6, 1.6],
    gear(ctx, H) {
      const { cv, c } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.3), y = Math.round(H.y);
      // cracks in the face still glowing, and the eyes two coals
      for (const [dx, dy] of [[-8, -3], [-7, -2], [-7, -1], [8, 2], [7, 3], [9, 4], [-5, 6], [-4, 7]]) cv.px(x + dx, y + dy, c('crack'));
      const fx = x + H.look[0], fy = y + H.look[1];
      for (const s of [-1, 1]) cv.px(fx + s * 4, fy - 0.5, c('emberHi'));
    },
  },
  top: { style: 'vest', pauldrons: false, emblem(ctx, cx, cy) { const { cv, c } = ctx; for (const [dx, dy] of [[-6, -3], [-6, -2], [5, 3], [6, 4], [0, 6], [1, 7]]) cv.px(cx + dx, cy + dy, c('crack')); } },
  belt: { buckle: 'none' }, stripe: false,
  front(ctx) {
    const { cv, J, pose, c } = ctx;
    if (pose.lying) return;
    // a coal of knuckle under each wrap, and ash coming off the shoulders
    for (const s of ['L', 'R']) { const f = J['fi' + s]; cv.px(f[0], f[1] - 3, c('ember')); cv.px(f[0] + 1, f[1] - 3, c('emberHi')); cv.px(f[0] - 1, f[1] - 2, c('ember')); }
    for (const s of ['L', 'R']) { const sh = J['sh' + s], d = s === 'L' ? -1 : 1; for (const [dx, dy] of [[3, 4], [5, 8], [2, 12]]) cv.px(sh[0] + d * dx, sh[1] + dy, c('ashHi')); }
  },
});
export { palettes };
export default layers;
