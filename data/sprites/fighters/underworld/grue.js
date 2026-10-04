// Oarsman Grue (#82): sprite layers on the heavy build.
// The Ferryman's rower: a drowned-grey heavyweight in a sea-green oilskin with the arms cut off,
// a knitted cap gone black with water, a black beard matted with river-weed, rope-wrapped fists,
// and the OAR he rows with, held in both hands across his body: wherever the fists go, the oar
// follows (a long pole with a broad blade at the viewer-right end). Every sweep is that oar.
import { rig } from '../pantheon/_rig.js';

const { layers, palettes } = rig('grue', {
  build: 'heavy',
  body: { size: [1.05, 1.0], legLen: 0.9, torsoLen: 1.05, shoulders: 1.12, neckLen: -1, dims: { neck: 9.5, chestW: 27, waistW: 22, belly: 8, deltoid: 10, upperArm: [7.2, 6] } },
  colors: {
    skin: [[21, 22, 20], [14, 16, 15], [8, 10, 10], [4, 5, 6]],
    hair: [[9, 11, 10], [4, 6, 6], [1, 2, 2]],
    glove: [[22, 19, 13], [14, 12, 8], [7, 6, 4]],
    top: [[8, 16, 14], [4, 10, 9], [2, 5, 5], [1, 2, 2]],
    trim: [[20, 17, 11], [12, 10, 6], [6, 5, 3]],
    boot: [[12, 11, 11], [6, 6, 7], [2, 2, 3]],
    sh: [[9, 11, 16], [5, 6, 10], [2, 3, 5]],
    extraA: { weed: [8, 20, 9] }, extraB: { oar: [17, 11, 5], oarHi: [24, 17, 8] },
  },
  head: {
    jaw: 'square', ears: [2.6, 3.6], hair: 'none', beard: 'full', eyeFace: 'focus', mouthW: 3,
    gear(ctx, H) {
      const { cv, c } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.3), y = Math.round(H.y);
      // a knitted cap pulled down over the brow, and weed in the beard
      cv.part(ctx.mask().ellipse(x, y - 6, H.rx + 0.8, 7.5).cut(ctx.mask().rect(x - 20, y - 3, 40, 20)), { ramp: ctx.ramps.top, bevel: 4, inner: 'line' });
      cv.part(ctx.mask().rect(x - H.rx, y - 4, H.rx * 2, 2.6), { ramp: ctx.ramps.trim, bevel: 1, inner: 'line', shadow: false });
      for (let i = -H.rx + 2; i < H.rx - 1; i += 3) cv.px(x + i, y - 8 + (i & 1), c('topHi'));
      for (const [dx, dy] of [[-6, 9], [-3, 12], [4, 11], [7, 8]]) { cv.px(x + dx, y + dy, c('weed')); cv.px(x + dx + 1, y + dy + 1, c('weed')); }
    },
  },
  top: { style: 'tank', hem: false, emblem(ctx, cx, cy) { const { cv, c } = ctx; for (const dy of [-6, 0, 6]) cv.line(cx - 10, cy + dy, cx + 10, cy + dy + 1, (X, Y) => cv.shade(X, Y, 1)); cv.px(cx - 4, cy + 3, c('weed')); } },
  belt: { buckle: 'square', ramp: 'trim' },
  front(ctx) {
    const { cv, J, pose, ramps, c } = ctx;
    if (pose.lying) return;
    // the oar: a shaft through both fists, the blade at the viewer-right end
    const a = J.fiL, b = J.fiR;
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
    const x0 = a[0] - ux * 30, y0 = a[1] - uy * 30, x1 = b[0] + ux * 26, y1 = b[1] + uy * 26;
    cv.part(ctx.mask().capsule(x0, y0, x1, y1, 2.3, 2.3), { ramp: [c('oarHi'), c('oar'), c('oar')], bevel: 1, inner: 'line', shadow: false });
    // the blade: broad and flat, on the end
    const bx = x1 + ux * 10, by = y1 + uy * 10;
    cv.part(ctx.mask().capsule(x1, y1, bx, by, 5.2, 6.4), { ramp: [c('oarHi'), c('oar'), c('oar')], bevel: 2, inner: 'line', shadow: false });
    cv.line(x1, y1, bx, by, (X, Y) => cv.shade(X, Y, 1));
    // the rope-wrapped grips, over the shaft
    for (const f of [a, b]) cv.part(ctx.mask().ellipse(f[0], f[1], 5.4, 5.4), { ramp: ramps.glove, bevel: 3, inner: 'line', shadow: false });
  },
});
export { palettes };
export default layers;
