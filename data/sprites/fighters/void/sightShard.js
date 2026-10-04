// The Sight Shard (#112): sprite layers on the medium build. A watcher: a tall bone-white figure with sloped shoulders in a black
// hooded shawl, no mouth and no nose, one enormous eye where the face was (white, a gold iris, a black lid that shuts), and the hollow of an eye
// in the chest, its rim burning gold. A halo of the fight's tell colours is drawn round his head by the `sightEye` modifier.
import { hollow } from './_hollow.js';

const { layers, palettes } = hollow('sightShard', {
  build: 'medium',
  body: { size: [1.0, 1.05], legLen: 1.0, torsoLen: 1.02, shoulders: 0.9, neckLen: 1, dims: { belly: 1.2, waistW: 12, chestW: 15, upperArm: [5, 4.2], forearm: [4.4, 3.8] } },
  tint: [31, 25, 6], tintHi: [31, 30, 16], tintDk: [14, 9, 1],
  tone: [27, 27, 26],
  face: 'cyclops',
  head: { jaw: 'round' },
  topStyle: 'robe', top: { hem: false },
  emblem: 'eye',
  gear(ctx, H, o) {
    // the shawl's hood over the brow: a black band across the top of the skull
    const { cv, ramps } = ctx;
    cv.part(ctx.mask().ellipse(o.x, o.y - 7, H.rx + 1.4, 6).cut(ctx.mask().ellipse(o.fx, o.fy + 2, H.rx - 2, 9)), { ramp: ramps.top, bevel: 3, inner: 'line', shadow: false });
  },
});
export { palettes };
export default layers;
