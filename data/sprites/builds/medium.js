// Medium build template. Poses come from the shared pose library; this file sets
// proportions. Other builds (lean / heavy / giant) reuse the same poses with
// different scale and thickness.
import { POSES } from './poses.js';

export default {
  id: 'medium',
  canvas: { w: 132, h: 140, ax: 66, ay: 134 },
  scale: [1, 1],
  dims: {
    head: [10.5, 12.5],
    neck: 5.5,
    deltoid: 6.5,
    chestW: 20,
    waistW: 16,
    belly: 5,
    hipSpread: 9,
    upperArm: [6, 5],
    forearm: [5, 4.2],
    glove: [7.5, 9],
    thigh: [7.5, 5.8],
    shin: [5.4, 4.2],
    ankle: 5,
    boot: [7, 4.5],
    sockHeight: 0.55,
    shortsLen: 0.4,
  },
  poses: POSES,
};
