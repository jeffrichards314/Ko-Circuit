// The Rhythm Shard (#114): sprite layers on the medium build. A drummer: a bone-white figure who never quite stands still, black
// braces crossed over the chest, two dark empty sockets with a pin of light in each, drumsticks tucked in a belt of black cord, and the hollow
// of a metronome (a tall triangle with a stroke in it) in the chest, its rim burning pink. The `beatgrid` modifier flashes a lamp over his
// heart on every beat.
import { hollow } from './_hollow.js';

const { layers, palettes } = hollow('rhythmShard', {
  build: 'medium',
  body: { size: [0.99, 1.02], legLen: 1.02, torsoLen: 1.0, shoulders: 0.98, neckLen: 0, dims: { belly: 2, waistW: 12.5, chestW: 16, upperArm: [5.2, 4.3], forearm: [4.6, 3.9] } },
  tint: [31, 13, 21], tintHi: [31, 24, 28], tintDk: [15, 4, 9],
  tone: [28, 26, 28],
  face: 'holes',
  head: { jaw: 'round' },
  topStyle: 'harness',
  emblem: 'metronome',
  belt: { buckle: 'round' },
  front(ctx) {
    const { cv, J, pose, c } = ctx;
    if (pose.lying) return;
    const w = J.waist;
    // two sticks stuck through the belt at his hip
    cv.line(w[0] + 8, w[1] + 3, w[0] + 15, w[1] - 8, (X, Y) => cv.px(X, Y, c('trim'))); cv.line(w[0] + 10, w[1] + 3, w[0] + 18, w[1] - 6, (X, Y) => cv.px(X, Y, c('tintHi')));
  },
});
export { palettes };
export default layers;
