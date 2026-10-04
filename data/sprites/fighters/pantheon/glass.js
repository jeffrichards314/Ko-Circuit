// Glass (#73): sprite layers on the lean build.
// A man of clear crystal, cut all over in facets: icy near-white skin with pale-cyan shadows, white spiky
// hair like shards, a vest of prism shards, white trim, crystal gloves. He shatters when he's hit hard
// and re-forms: the shards and the flash are drawn live (the `glass` modifier).
import { rig } from './_rig.js';

const { layers, palettes } = rig('glass', {
  build: 'lean',
  body: { size: [0.97, 1.03], legLen: 1.04, torsoLen: 0.97, shoulders: 0.95, dims: { belly: 1, waistW: 12, chestW: 16 } },
  colors: {
    skin: [[31, 31, 31], [24, 30, 31], [14, 24, 30], [6, 14, 24]],
    hair: [[31, 31, 31], [26, 30, 31], [14, 22, 30]],
    glove: [[31, 31, 31], [22, 29, 31], [10, 20, 28]],
    top: [[27, 31, 31], [16, 27, 31], [8, 18, 28], [4, 9, 20]],
    trim: [[31, 31, 31], [24, 30, 31], [12, 22, 30]],
    boot: [[28, 31, 31], [16, 26, 31], [7, 14, 26]],
    sh: [[24, 30, 31], [12, 22, 30], [5, 12, 24]],
    extraA: { glint: [31, 31, 31] }, extraB: { rose: [31, 22, 28] },
  },
  head: { jaw: 'narrow', ears: [2.2, 3], hair: 'spike', eyeFace: 'focus', mouthW: 2.6, nose: [1.6, 1.6] },
  top: {
    style: 'vest', pauldrons: false,
    emblem(ctx, cx, cy) { const { cv, c } = ctx; for (const [dx, dy, l] of [[-9, -4, 6], [7, -6, 7], [-3, 4, 5], [10, 3, 5]]) { cv.line(cx + dx, cy + dy, cx + dx + 3, cy + dy + l, (X, Y) => cv.px(X, Y, c('glint'))); } },
  },
  belt: { buckle: 'none' }, stripe: true,
  swaps: { 'glass.crack': { A: { skinHi: [31, 28, 31], skin: [26, 26, 31], skinSh: [16, 18, 28] }, B: { topHi: [31, 28, 31] } } },
});
export { palettes };
export default layers;
