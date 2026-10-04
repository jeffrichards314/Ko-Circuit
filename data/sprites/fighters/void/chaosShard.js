// The Chaos Shard (#117): sprite layers on the medium build. Nothing on him matches: one arm thicker than the other, mismatched gloves, a
// wild crest of white spikes, a lightning crack down one side of a blank face, and in the chest the hollow of a jagged bolt. His colours turn
// with every re-roll (palettes chaosShard, .a, .b, .c).
import { hollow } from './_hollow.js';

const sw = (hi, mid, dk) => ({ A: { gloveHi: hi, glove: mid, gloveDk: dk }, B: { trimHi: hi, trim: mid, trimSh: dk, bootHi: hi, boot: mid, bootDk: dk } });
const { layers, palettes } = hollow('chaosShard', {
  build: 'medium',
  body: { size: [1.0, 1.02], legLen: 1.0, torsoLen: 0.98, shoulders: 1.05, neckLen: 0, dims: { belly: 1.5, waistW: 12, chestW: 16, upperArm: [6.4, 4.0], forearm: [5.6, 3.6] } },
  tint: [31, 10, 26], tintHi: [31, 24, 30], tintDk: [15, 3, 12],
  tone: [27, 26, 28],
  face: 'crack',
  head: { jaw: 'round' },
  topStyle: 'vest',
  emblem: 'jag',
  hairStyle: 'wild',
  hairDraw(ctx, H, o) {
    const { cv, ramps } = ctx;
    const m = ctx.mask().ellipse(o.x, o.y - 5, H.rx + 0.6, 6);
    for (let i = -4; i <= 4; i++) m.poly([[o.x + i * 2.6 - 2, o.y - 7], [o.x + i * 3.2, o.y - 15 - (Math.abs(i) & 1) * 3], [o.x + i * 2.6 + 2, o.y - 7]]);
    cv.part(m, { ramp: ramps.hair, bevel: 2, inner: 'line' });
  },
  swaps: { a: sw([20, 31, 24], [8, 26, 12], [3, 12, 6]), b: sw([31, 30, 12], [28, 22, 4], [13, 9, 1]), c: sw([12, 26, 31], [4, 16, 28], [1, 7, 14]) },
});
const P = { chaosShard: palettes.chaosShard, 'chaosShard.a': palettes.a, 'chaosShard.b': palettes.b, 'chaosShard.c': palettes.c };
export { P as palettes };
export default layers;
