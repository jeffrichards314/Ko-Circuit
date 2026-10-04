// Rattle (#93): sprite layers on the lean build.
// A skeleton: bone-white skin drawn tight over every rib, black sockets with a cold pinpoint in each, a
// permanent grin, no hair, a thin scrap of dark cloth for trunks, hands of bare bone in place of gloves
// (a knuckle at each fist). Ribs and a spine show through the torso; a few small bones hang at his belt
// on cord and clatter when he moves.
import { rig } from '../pantheon/_rig.js';

const { layers, palettes } = rig('rattle', {
  build: 'lean',
  body: { size: [0.95, 1.05], legLen: 1.06, torsoLen: 0.95, shoulders: 0.9, dims: { belly: 0.4, waistW: 10.5, chestW: 14, upperArm: [4, 3.4], forearm: [3.6, 3], thigh: [5.2, 4.2], shin: [3.6, 3] } },
  colors: {
    skin: [[30, 30, 26], [23, 23, 19], [14, 14, 12], [6, 6, 6]],
    hair: [[23, 23, 19], [14, 14, 12], [6, 6, 6]],
    glove: [[29, 29, 25], [21, 21, 17], [11, 11, 10]],
    top: [[23, 23, 19], [14, 14, 12], [8, 8, 8], [3, 3, 3]],
    trim: [[26, 26, 22], [17, 17, 14], [8, 8, 7]],
    boot: [[22, 22, 18], [13, 13, 11], [6, 6, 5]],
    sh: [[9, 8, 9], [4, 4, 5], [1, 1, 2]],
    extraA: { socket: [1, 1, 2], glintE: [12, 30, 28] }, extraB: { cord: [14, 9, 5], knuckle: [31, 31, 28] },
  },
  head: {
    jaw: 'narrow', ears: null, hair: 'none', eyeFace: 'focus', mouthW: 3.4, mouthFace: 'grin', nose: null,
    gear(ctx, H) {
      const { cv, c } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.3), y = Math.round(H.y);
      const fx = x + H.look[0], fy = y + H.look[1];
      // sockets, a cold point in each, a hole for a nose and the row of teeth
      for (const s of [-1, 1]) { cv.part(ctx.mask().ellipse(fx + s * 4.6, fy - 0.5, 3.2, 3.6), { ramp: [c('socket'), c('socket'), c('socket')], bevel: 0, inner: 'none', shadow: false }); cv.px(fx + s * 4.6, fy - 0.5, c('glintE')); }
      cv.px(fx, fy + 4, c('socket')); cv.px(fx - 1, fy + 5, c('socket')); cv.px(fx + 1, fy + 5, c('socket'));
      for (let i = -4; i <= 4; i++) { cv.px(fx + i, fy + 8, c('outline')); if (i & 1) cv.px(fx + i, fy + 9, c('outline')); }
    },
  },
  top: {
    style: 'bare',
    emblem(ctx, cx, cy) {
      const { cv, c } = ctx;
      // ribs and spine
      cv.line(cx, cy - 12, cx, cy + 14, (X, Y) => cv.px(X, Y, c('skinSh')));
      for (let i = 0; i < 5; i++) for (const s of [-1, 1]) { const y = cy - 8 + i * 4; cv.line(cx + s * 1, y, cx + s * (11 - i), y + 2, (X, Y) => cv.px(X, Y, c('skinSh'))); }
    },
  },
  belt: { buckle: 'none' }, stripe: false,
  front(ctx) {
    const { cv, J, pose, c } = ctx;
    if (pose.lying) return;
    for (const s of ['L', 'R']) { const f = J['fi' + s]; for (let i = -2; i <= 2; i++) cv.px(f[0] + i * 2, f[1] - 4, c('knuckle')); }
    // little bones on cords at the belt
    const w = J.waist;
    for (const [dx, l] of [[-9, 8], [-4, 11], [8, 9]]) { cv.line(w[0] + dx, w[1], w[0] + dx, w[1] + l - 3, (X, Y) => cv.px(X, Y, c('cord'))); cv.rect ? 0 : 0; cv.px(w[0] + dx, w[1] + l - 2, c('knuckle')); cv.px(w[0] + dx, w[1] + l - 1, c('knuckle')); cv.px(w[0] + dx + 1, w[1] + l, c('knuckle')); cv.px(w[0] + dx - 1, w[1] + l, c('knuckle')); }
  },
});
export { palettes };
export default layers;
