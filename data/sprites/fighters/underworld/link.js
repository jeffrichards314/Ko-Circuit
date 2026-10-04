// Link (#91): sprite layers on the lean build.
// A thin wiry man wound in chain: a harness of chain-links crossed over his bare chest, chain wrapped from
// the elbow to the fist on both arms with the loose end trailing (the lash), cropped black hair, a
// hard narrow face, steel-grey trunks. The chain hangs from his fists to the floor in every pose.
import { rig } from '../pantheon/_rig.js';

const { layers, palettes } = rig('link', {
  build: 'lean',
  body: { size: [0.96, 1.04], legLen: 1.05, torsoLen: 0.96, shoulders: 0.94, dims: { belly: 0.8, waistW: 11.5, chestW: 15.5, upperArm: [5, 4.2] } },
  colors: {
    skin: [[25, 21, 17], [18, 14, 10], [11, 8, 6], [5, 4, 3]],
    hair: [[9, 9, 11], [4, 4, 6], [1, 1, 2]],
    glove: [[18, 19, 24], [10, 11, 16], [4, 4, 8]],
    top: [[16, 17, 22], [9, 10, 15], [4, 5, 8], [1, 1, 3]],
    trim: [[22, 23, 28], [12, 13, 19], [5, 6, 10]],
    boot: [[10, 10, 12], [5, 5, 7], [2, 2, 3]],
    sh: [[12, 13, 18], [6, 7, 11], [2, 3, 5]],
    extraA: { iron: [22, 24, 28], ironDk: [7, 8, 12] }, extraB: { glint: [30, 30, 31] },
  },
  head: { jaw: 'narrow', ears: [2.2, 3], hair: 'crop', eyeFace: 'focus', mouthW: 2.6, nose: [1.6, 1.6], brow: { len: 4.2, thick: 1.2 } },
  top: { style: 'harness', emblem(ctx, cx, cy) { const { cv, c } = ctx; for (let i = -2; i <= 2; i++) { cv.px(cx + i * 4, cy - 2 + Math.abs(i), c('glint')); cv.px(cx + i * 4 + 1, cy - 1 + Math.abs(i), c('iron')); } } },
  belt: { buckle: 'none' }, stripe: true,
  front(ctx) {
    const { cv, J, pose, c } = ctx;
    if (pose.lying) return;
    // chain wound elbow to fist, and the loose end hanging down from each fist
    for (const s of ['L', 'R']) {
      const f = J['fi' + s], e = J['el' + s], d = s === 'L' ? -1 : 1;
      for (let i = 1; i <= 4; i++) { const u = i / 5, x = e[0] + (f[0] - e[0]) * u, y = e[1] + (f[1] - e[1]) * u; cv.part(ctx.mask().ellipse(x, y, 3.6, 1.6), { ramp: [c('iron'), c('glove'), c('ironDk')], bevel: 1, inner: 'line', shadow: false }); }
      for (let j = 0; j < 7; j++) { const x = f[0] + d * (3 + (j >> 1)), y = f[1] + 6 + j * 3; if (j & 1) cv.rect ? 0 : cv.px(x, y, c('iron')); else cv.px(x, y, c('iron')); cv.px(x, y + 1, c('ironDk')); }
    }
  },
});
export { palettes };
export default layers;
