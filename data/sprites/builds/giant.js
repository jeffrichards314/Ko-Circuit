// Giant build: a head taller and half again as wide as the heavies (Glacier,
// and later Goliath). Same pose library, bigger scale, thick everything.
import { POSES } from './poses.js';

export default {
  id: 'giant',
  canvas: { w: 196, h: 176, ax: 98, ay: 170 },
  scale: [1.38, 1.26],
  dims: {
    head: [12, 13],
    neck: 9,
    deltoid: 10,
    chestW: 29,
    waistW: 24,
    belly: 8,
    hipSpread: 12,
    upperArm: [9.4, 8],
    forearm: [8.2, 7],
    glove: [10.2, 12],
    thigh: [11.5, 9],
    shin: [8.2, 6.8],
    ankle: 6,
    boot: [9.6, 6],
    sockHeight: 0.5,
    shortsLen: 0.42,
  },
  poses: POSES,
};
