// Heavy build: wide, thick-necked, big belly, short legs.
import { POSES } from './poses.js';

export default {
  id: 'heavy',
  canvas: { w: 156, h: 140, ax: 78, ay: 134 },
  scale: [1.12, 0.97],
  dims: {
    head: [11.5, 12.5],
    neck: 7.5,
    deltoid: 8.2,
    chestW: 24.5,
    waistW: 21,
    belly: 10,
    hipSpread: 10.5,
    upperArm: [7.6, 6.4],
    forearm: [6.4, 5.4],
    glove: [8.3, 9.8],
    thigh: [9.2, 7.2],
    shin: [6.4, 5.2],
    ankle: 5,
    boot: [7.8, 5],
    sockHeight: 0.5,
    shortsLen: 0.42,
  },
  poses: POSES,
};
