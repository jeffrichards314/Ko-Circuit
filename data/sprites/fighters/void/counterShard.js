// The Counter Shard (#111): sprite layers on the medium build. A fencer's ghost: a narrow bone-white figure in a plastron of black
// leather, a mask of black mesh where the face was (a wire visor with one cold light behind it), a diamond hollowed out of the
// chest, its rim burning silver-cyan, and a fencer's glove on each hand. His palette `counterShard.flash` bleaches all of him white:
// it shows for exactly the frames of each windup where a punch would land as a counter.
import { hollow, glare } from './_hollow.js';
import { TD } from './tdLooks.js';

const { layers, palettes } = hollow('counterShard', {
  remix: TD.counterShard,
  build: 'medium',
  body: { size: [0.98, 1.04], legLen: 1.04, torsoLen: 0.98, shoulders: 0.92, neckLen: 0, dims: { belly: 1.5, waistW: 12, chestW: 15.5, upperArm: [5, 4.2], forearm: [4.4, 3.8] } },
  tint: [14, 27, 31], tintHi: [27, 31, 31], tintDk: [4, 12, 17],
  tone: [26, 27, 30],
  face: 'visor',
  head: { jaw: 'round' },
  topStyle: 'vest',
  emblem: 'diamond',
  swaps: { flash: glare(1) },
  gear(ctx, H, o) {
    // the wire mask: a grid over the visor and a strap round the back of the head
    const { cv, c } = ctx;
    for (let i = -8; i <= 8; i += 3) cv.line(o.fx + i, o.fy - 3, o.fx + i, o.fy + 3, (X, Y) => cv.px(X, Y, c('hole')));
    cv.line(o.fx - H.rx, o.fy - 5, o.fx + H.rx, o.fy - 5, (X, Y) => cv.px(X, Y, c('tintDk')));
  },
});
export { palettes };
export default layers;
