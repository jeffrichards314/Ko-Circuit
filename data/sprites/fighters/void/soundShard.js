// The Sound Shard (#113): sprite layers on the lean build. A listener: a pale grey-green figure, thin as a reed, tilting its smooth head as
// if it heard something, two large fin-like ears on the sides of the skull and, hollowed out of the chest, an ear (concentric arcs), its rim
// burning mint. He is drawn almost not at all (the `unseen` modifier shows one pixel in sixteen of him) until he is hit.
import { hollow } from './_hollow.js';
import { TD } from './tdLooks.js';

const { layers, palettes } = hollow('soundShard', {
  remix: TD.soundShard,
  build: 'lean',
  body: { size: [0.96, 1.06], legLen: 1.08, torsoLen: 0.98, shoulders: 0.82, neckLen: 1, dims: { belly: 0.4, waistW: 10, chestW: 13, upperArm: [4.1, 3.4], forearm: [3.7, 3.1] } },
  tint: [14, 30, 22], tintHi: [26, 31, 28], tintDk: [4, 13, 9],
  tone: [24, 27, 26],
  face: 'blank',
  head: { jaw: 'narrow', ears: null },
  topStyle: 'harness',
  emblem: 'ear',
  behind(ctx, H, o) {
    // the great ears: fins swept back from the skull
    const { cv, ramps, c } = ctx;
    for (const s of [-1, 1]) {
      cv.part(ctx.mask().poly([[o.x + s * (H.rx - 1), o.y - 4], [o.x + s * (H.rx + 9), o.y - 12], [o.x + s * (H.rx + 7), o.y + 6], [o.x + s * (H.rx - 1), o.y + 5]]), { ramp: ramps.skin, bevel: 2, inner: 'line', shadow: false });
      cv.px(o.x + s * (H.rx + 4), o.y - 4, c('tint')); cv.px(o.x + s * (H.rx + 3), o.y - 2, c('tint'));
    }
  },
});
export { palettes };
export default layers;
