// The Echo Shard (#116): sprite layers on the medium build. YOU, bleached: your own outline in bone and grey, a blank face with only your
// seam of a mouth, black wraps for trunks and gloves the way the Void copies whatever it is shown, and in the chest the hollow of a small person.
import { hollow } from './_hollow.js';
import { TD } from './tdLooks.js';

const { layers, palettes } = hollow('echoShard', {
  remix: TD.echoShard,
  build: 'medium',
  body: { size: [1.0, 1.0], legLen: 1.0, torsoLen: 1.0, shoulders: 1.0, neckLen: 0, dims: { belly: 2, waistW: 13, chestW: 16.5, upperArm: [5.4, 4.5], forearm: [4.8, 4.0] } },
  tint: [17, 26, 31], tintHi: [27, 31, 31], tintDk: [6, 11, 17],
  tone: [26, 27, 29],
  face: 'blank',
  head: { jaw: 'round' },
  topStyle: 'bare',
  emblem: 'person',
  hairStyle: 'crop',
  hairDraw(ctx, H, o) {
    const { cv, ramps } = ctx;
    cv.part(ctx.mask().ellipse(o.x + H.look[0] * 0.3, o.y - 5, H.rx + 0.6, 7).cut(ctx.mask().ellipse(o.fx, o.fy + 1.5, H.rx - 1.8, 8)), { ramp: ramps.hair, bevel: 3, inner: 'line' });
  },
  gear(ctx, H, o) { const { cv, c } = ctx; for (let i = -2; i <= 2; i++) cv.px(o.fx + i, o.fy + 9, c('hole')); },
});
export { palettes };
export default layers;
