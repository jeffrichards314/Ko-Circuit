// The Time Shard (#118): sprite layers on the lean build. A clockmaker: a tall, stooped figure, bone-white with a warm cast, a smooth head
// with a monocle's thin gold ring round nothing, a black waistcoat and a chain of tiny gold links across it, an hourglass for a belt buckle and,
// hollowed out of the chest, a clock face with its two hands, its rim burning gold.
import { hollow } from './_hollow.js';

const { layers, palettes } = hollow('timeShard', {
  build: 'lean',
  body: { size: [0.98, 1.08], legLen: 1.04, torsoLen: 1.02, shoulders: 0.84, neckLen: 2, dims: { belly: 0.8, waistW: 10.5, chestW: 13.6, upperArm: [4.4, 3.6], forearm: [3.9, 3.3] } },
  tint: [31, 24, 5], tintHi: [31, 30, 16], tintDk: [15, 9, 1],
  tone: [28, 27, 25],
  face: 'holes',
  head: { jaw: 'narrow' },
  topStyle: 'vest',
  emblem: 'ring',
  belt: { buckle: 'square' },
  gear(ctx, H, o) {
    // a monocle: a thin ring and a chain hanging from it
    const { cv, c } = ctx;
    for (let a = 0; a < 24; a++) { const t = (a / 24) * Math.PI * 2; cv.px(Math.round(o.fx + 5 + Math.cos(t) * 5), Math.round(o.fy + Math.sin(t) * 5), c('tint')); }
    for (let j = 6; j < 16; j += 2) cv.px(o.fx + 10, o.fy + j, c('tintHi'));
  },
});
export { palettes };
export default layers;
