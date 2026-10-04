// Stoker (#99): sprite layers on the heavy build.
// The furnace man: a great soot-black slab of a man with a scorched leather apron, a sweat-rag knotted round his
// bald head, coal-dust ground into every crease, blackened leather gloves with a live coal caught in the seam, and a
// belt hung with a glowing lump of coal for a buckle. He is always halfway through a shovelful.
import { rig } from '../pantheon/_rig.js';

const { layers, palettes } = rig('stoker', {
  build: 'heavy',
  body: { size: [1.06, 1.0], legLen: 0.9, torsoLen: 1.04, shoulders: 1.12, neckLen: -1, dims: { neck: 10.5, chestW: 28, waistW: 24, belly: 11, deltoid: 10.5, upperArm: [7.8, 6.4] } },
  colors: {
    skin: [[17, 13, 11], [11, 8, 7], [6, 4, 4], [2, 2, 2]],
    hair: [[9, 7, 6], [4, 3, 3], [1, 1, 1]],
    glove: [[14, 10, 7], [8, 5, 4], [3, 2, 1]],
    top: [[15, 10, 7], [9, 6, 4], [4, 2, 2], [2, 1, 1]],
    trim: [[31, 25, 9], [30, 13, 3], [15, 5, 2]],
    boot: [[9, 7, 6], [4, 3, 2], [2, 1, 1]],
    sh: [[7, 6, 6], [3, 3, 3], [1, 1, 1]],
    extraA: { coal: [27, 9, 3], coalHi: [31, 24, 8] }, extraB: { rag: [22, 20, 15], ragDk: [12, 10, 7] },
  },
  head: {
    jaw: 'square', ears: [2.6, 3.6], hair: 'none', eyeFace: 'focus', mouthW: 3.2, brow: { len: 5, thick: 1.4 },
    gear(ctx, H) {
      // the sweat-rag: a band round the crown, knotted at the side with two tails
      const { cv, c } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.3), y = Math.round(H.y);
      cv.part(ctx.mask().ellipse(x, y - 6, H.rx + 0.4, 4.4).cut(ctx.mask().rect(x - 20, y - 2, 40, 12)), { ramp: [c('rag'), c('rag'), c('ragDk')], bevel: 2, inner: 'line', shadow: false });
      cv.part(ctx.mask().poly([[x + H.rx - 2, y - 5], [x + H.rx + 5, y - 2], [x + H.rx + 3, y + 3], [x + H.rx - 1, y - 1]]), { ramp: [c('rag'), c('ragDk'), c('ragDk')], bevel: 1, inner: 'line', shadow: false });
      // coal smears under the eyes
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) cv.px(x + H.look[0] + s * (5 + i), y + H.look[1] + 3 + (i & 1), c('skinDk'));
    },
  },
  top: {
    style: 'tank', hem: true,
    emblem(ctx, cx, cy) {
      // a pocket of the apron, a burn hole with the coal glowing through it
      const { cv, c } = ctx;
      cv.part(ctx.mask().rect(cx - 6, cy + 4, 12, 8), { ramp: ctx.ramps.top, bevel: 1, inner: 'line', shadow: false });
      cv.px(cx + 8, cy - 4, c('coal')); cv.px(cx + 9, cy - 3, c('coalHi')); cv.px(cx + 9, cy - 4, c('coal'));
    },
  },
  belt: { buckle: 'round', ramp: 'boot' },
  front(ctx) {
    const { cv, J, pose, c } = ctx;
    if (pose.lying) return;
    // a live coal in the seam of each glove, and the lump of coal on his belt
    for (const s of ['L', 'R']) { const f = J['fi' + s]; cv.px(f[0] + 1, f[1] - 2, c('coalHi')); cv.px(f[0] + 2, f[1] - 2, c('coal')); cv.px(f[0] + 2, f[1] - 1, c('coal')); }
    const w = J.waist;
    cv.part(ctx.mask().ellipse(w[0], w[1] - 1, 3.6, 3), { ramp: [c('coalHi'), c('coal'), c('trimSh')], bevel: 2, inner: 'line', shadow: false });
  },
});
export { palettes };
export default layers;
