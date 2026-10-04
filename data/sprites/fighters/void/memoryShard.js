// The Memory Shard (#115): sprite layers on the heavy build. A scribe of a man: thick, bowed a little at the neck, a smooth blank head
// with a single seam down its middle, and marks all over him: tally strokes cut in rows across his forearms and thighs (sixty of them, more
// or less), a black scholar's cloak open at the front, and in the chest the hollow of a grid of dots, its rim burning green.
import { hollow } from './_hollow.js';

const { layers, palettes } = hollow('memoryShard', {
  build: 'heavy',
  body: { size: [1.04, 1.0], legLen: 0.94, torsoLen: 1.02, shoulders: 1.08, neckLen: -1, dims: { neck: 10, chestW: 27, waistW: 22, belly: 6, deltoid: 11.5, upperArm: [7.4, 6.4], forearm: [6.6, 5.8] } },
  tint: [9, 30, 14], tintHi: [22, 31, 22], tintDk: [3, 13, 6],
  tone: [25, 27, 26],
  face: 'blank',
  head: { jaw: 'square' },
  topStyle: 'robe', top: { hem: false },
  emblem: 'grid',
  front(ctx) {
    const { cv, J, pose, c } = ctx;
    if (pose.lying) return;
    // tally strokes in rows on each forearm
    for (const s of ['L', 'R']) {
      const f = J['fi' + s], e = J['el' + s];
      for (let row = 0; row < 2; row++) for (let i = 0; i < 5; i++) {
        const u = 0.25 + i * 0.13, x = e[0] + (f[0] - e[0]) * u, y = e[1] + (f[1] - e[1]) * u + row * 3 - 2;
        cv.px(x, y, c('tint')); cv.px(x, y + 1, c('tint'));
      }
    }
  },
});
export { palettes };
export default layers;
