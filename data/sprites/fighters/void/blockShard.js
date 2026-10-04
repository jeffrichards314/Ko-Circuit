// The Block Shard (#109): sprite layers on the heavy build. A slab of a man: broad plated shoulders and forearms like doors, the plates
// bone-white with black seams, a T-shaped visor slit in a squat helm, and in the chest the hollow of a shield (a square), its rim burning
// amber. Nothing on him is round.
import { hollow } from './_hollow.js';

const { layers, palettes } = hollow('blockShard', {
  build: 'heavy',
  body: { size: [1.1, 1.0], legLen: 0.9, torsoLen: 1.04, shoulders: 1.22, neckLen: -2, dims: { neck: 11, chestW: 31, waistW: 25, belly: 7, deltoid: 13, upperArm: [8.6, 7.4], forearm: [7.6, 6.6] } },
  tint: [29, 19, 5], tintHi: [31, 28, 14], tintDk: [13, 7, 1],
  tone: [24, 24, 27],
  face: 'visor',
  head: { jaw: 'square' },
  topStyle: 'plate', top: { pauldrons: true },
  emblem: 'square',
  belt: { buckle: 'square' },
  gear(ctx, H, o) {
    // a squat helm over the skull: a flat crown and a brow bar
    const { cv, ramps, c } = ctx;
    cv.part(ctx.mask().rect(o.x - H.rx - 1, o.y - H.ry - 1, H.rx * 2 + 2, 8).cut(ctx.mask().rect(o.x - 9, o.y - 4, 19, 12)), { ramp: ramps.trim, bevel: 2, inner: 'line' });
    for (let i = -8; i <= 8; i += 4) cv.px(o.x + i, o.y - H.ry + 3, c('hole'));
    cv.line(o.fx, o.fy + 3, o.fx, o.fy + 9, (X, Y) => cv.px(X, Y, c('hole'))); // the stem of the T
  },
  front(ctx) {
    const { cv, J, pose, c } = ctx;
    if (pose.lying) return;
    for (const s of ['L', 'R']) { const f = J['fi' + s]; for (const dx of [-4, 0, 4]) cv.px(f[0] + dx, f[1] - 4, c('tint')); }
  },
});
export { palettes };
export default layers;
