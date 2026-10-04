// The Dodge Shard (#108): sprite layers on the lean build.
// A runner. Long in the leg and narrow in the shoulder, pale as a bleached bone with cold blue-white shading, a smooth head with one
// thin slit where the eyes were, black tatters of a running vest crossed on the chest, and in the middle of it the hollow: two chevrons
// (<< >>), the last thing the runner remembers, its rim burning ice blue. Speed lines trail off the wrists.
import { hollow } from './_hollow.js';

const { layers, palettes } = hollow('dodgeShard', {
  build: 'lean',
  body: { size: [0.98, 1.06], legLen: 1.12, torsoLen: 0.96, shoulders: 0.86, neckLen: 1, dims: { belly: 0.5, waistW: 10.5, chestW: 13.5, upperArm: [4.4, 3.6], forearm: [3.9, 3.3] } },
  tint: [10, 24, 31], tintHi: [24, 30, 31], tintDk: [3, 9, 16],
  tone: [25, 27, 31],
  face: 'slit',
  head: { jaw: 'narrow' },
  topStyle: 'harness',
  emblem: 'chevrons',
  front(ctx) {
    const { cv, J, pose, c } = ctx;
    if (pose.lying) return;
    // speed lines off both wrists, and a tatter at each ankle
    for (const s of ['L', 'R']) {
      const f = J['fi' + s], e = J['el' + s];
      const dx = (f[0] - e[0]) * 0.5, dy = (f[1] - e[1]) * 0.5;
      for (let i = 0; i < 3; i++) cv.line(f[0] - dx * (1.3 + i * 0.7) - 2, f[1] - dy * (1.3 + i * 0.7) + i * 2 - 2, f[0] - dx * (2 + i * 0.7), f[1] - dy * (2 + i * 0.7) + i * 2 - 2, (X, Y) => cv.px(X, Y, c(i ? 'tint' : 'tintHi')));
    }
  },
});
export { palettes };
export default layers;
