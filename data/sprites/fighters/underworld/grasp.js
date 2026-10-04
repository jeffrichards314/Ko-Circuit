// Grasp (#106): sprite layers on the giant build.
// The thing the hands belong to: a hulking grave-pale mass with clay caked on its arms and back, a bald skull with a crown
// of grey fingers growing from it (five, reaching up), too-long arms, fists like bundles of roots, a torso streaked with
// grave dirt and a belt of knotted rope. The hands that come up through the canvas (the `hands` modifier draws them)
// are the same grey as his crown.
import { rig } from '../pantheon/_rig.js';

const { layers, palettes } = rig('grasp', {
  build: 'giant',
  body: { size: [1.08, 1.02], legLen: 0.88, torsoLen: 1.06, shoulders: 1.16, neckLen: -2, dims: { neck: 12, chestW: 32, waistW: 27, belly: 10, deltoid: 12.5, upperArm: [9.6, 8.4], forearm: [8.6, 7.2] } },
  colors: {
    skin: [[21, 21, 20], [14, 14, 14], [8, 8, 9], [3, 3, 4]],
    hair: [[13, 12, 12], [7, 7, 7], [3, 3, 3]],
    glove: [[15, 14, 13], [9, 9, 8], [4, 4, 4]],
    top: [[15, 13, 11], [9, 8, 6], [5, 4, 3], [2, 2, 1]],
    trim: [[16, 13, 9], [9, 7, 5], [4, 3, 2]],
    boot: [[10, 9, 8], [5, 5, 4], [2, 2, 2]],
    sh: [[8, 7, 6], [4, 4, 3], [2, 2, 1]],
    extraA: { dirt: [12, 9, 6], dirtDk: [6, 4, 3] }, extraB: { nail: [26, 24, 18] },
  },
  head: {
    jaw: 'square', ears: null, hair: 'none', eyeFace: 'focus', mouthW: 3.4, nose: null, brow: { len: 5, thick: 1.5 },
    gear(ctx, H) {
      // a crown of five grey fingers growing up out of the skull, bent at the knuckle
      const { cv, c } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.3), y = Math.round(H.y);
      for (let i = -2; i <= 2; i++) {
        const bx = x + i * 5, h = 10 - Math.abs(i) * 1.6, lean = i * 1.4;
        cv.part(ctx.mask().capsule(bx, y - H.ry + 2, bx + lean * 0.5, y - H.ry - h * 0.55, 2.2, 1.9).capsule(bx + lean * 0.5, y - H.ry - h * 0.55, bx + lean, y - H.ry - h, 1.9, 1.5), { ramp: ctx.ramps.skin, bevel: 1, inner: 'line', shadow: false });
        cv.px(Math.round(bx + lean), Math.round(y - H.ry - h - 1), c('nail'));
      }
    },
  },
  top: { style: 'bare', emblem(ctx, cx, cy) { const { cv, c } = ctx; for (const [dx, dy] of [[-9, -5], [-8, -4], [-10, -3], [7, 2], [8, 3], [9, 2], [-2, 8], [3, 9], [-3, 9], [12, -6]]) cv.px(cx + dx, cy + dy, c('dirt')); } },
  belt: { buckle: 'none', ramp: 'trim' },
  front(ctx) {
    const { cv, J, pose, c } = ctx;
    if (pose.lying) return;
    // clay caked on the forearms, knuckle-roots on each fist
    for (const s of ['L', 'R']) {
      const f = J['fi' + s], e = J['el' + s];
      for (let i = 1; i <= 3; i++) { const u = i / 4, x = e[0] + (f[0] - e[0]) * u, y = e[1] + (f[1] - e[1]) * u; cv.part(ctx.mask().ellipse(x, y, 4.6, 2), { ramp: [c('dirt'), c('dirt'), c('dirtDk')], bevel: 1, inner: 'line', shadow: false }); }
      for (const dx of [-3, 0, 3]) cv.px(f[0] + dx, f[1] - 3, c('nail'));
    }
  },
});
export { palettes };
export default layers;
