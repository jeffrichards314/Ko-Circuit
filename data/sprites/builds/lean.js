// Lean build: taller, narrower, long limbs (teenagers, acrobats, fencers).
import { POSES } from './poses.js';

export default {
  id: 'lean',
  canvas: { w: 132, h: 146, ax: 66, ay: 140 },
  scale: [0.9, 1.04],
  dims: {
    head: [9.8, 11.8],
    neck: 4.4,
    deltoid: 5.4,
    chestW: 16.5,
    waistW: 12.5,
    belly: 0,
    hipSpread: 8,
    upperArm: [5, 4.1],
    forearm: [4.3, 3.6],
    glove: [7.2, 8.6],
    thigh: [6.3, 4.8],
    shin: [4.7, 3.6],
    ankle: 5,
    boot: [6.4, 4.1],
    sockHeight: 0.5,
    shortsLen: 0.42,
  },
  poses: POSES,
};
