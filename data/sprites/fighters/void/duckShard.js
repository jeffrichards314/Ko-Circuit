// The Duck Shard (#110): sprite layers on the lean build. A dancer, all leg: very long thighs and shins, narrow hips, a small smooth head
// with a low horizontal slit, black ribbon tatters knotted at both ankles, and the hollow of a single bar (▬) across the middle of the
// chest, its rim burning violet.
import { hollow } from './_hollow.js';
import { TD } from './tdLooks.js';

const { layers, palettes } = hollow('duckShard', {
  remix: TD.duckShard,
  build: 'lean',
  body: { size: [0.98, 1.08], legLen: 1.22, torsoLen: 0.88, shoulders: 0.8, neckLen: 1, dims: { belly: 0.4, waistW: 9.6, chestW: 12.5, upperArm: [4.2, 3.4], forearm: [3.8, 3.2] } },
  tint: [22, 11, 31], tintHi: [29, 22, 31], tintDk: [9, 4, 16],
  tone: [26, 25, 30],
  face: 'slit',
  head: { jaw: 'narrow' },
  topStyle: 'tank',
  top: { hem: false },
  emblem: 'bar',
  front(ctx) {
    const { cv, J, pose, c } = ctx;
    if (pose.lying) return;
    // ribbons at both ankles
    for (const s of ['L', 'R']) { const a = J['an' + s] || J['ank' + s]; if (!a) continue; for (let i = 0; i < 5; i++) cv.px(a[0] + (s === 'L' ? -i : i), a[1] - 2 + (i & 1), c('tint')); }
  },
});
export { palettes };
export default layers;
