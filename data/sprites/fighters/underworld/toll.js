// Toll (#84): sprite layers on the medium build.
// The keeper of the crossing: a stooped, sallow man in a black tollkeeper's coat cut off at the ribs, a brass
// plate on a flat cap, thin grey side-whiskers, black gloves ringed in brass, and a coin purse the
// size of his head hung at his hip, bulging with everything he's ever taken. A brass key on a chain.
import { rig } from '../pantheon/_rig.js';

const { layers, palettes } = rig('toll', {
  build: 'medium',
  body: { size: [1.0, 1.0], legLen: 0.98, torsoLen: 1.0, shoulders: 1.0, dims: { belly: 4, waistW: 14 } },
  colors: {
    skin: [[26, 22, 16], [19, 15, 10], [12, 9, 7], [6, 4, 4]],
    hair: [[22, 22, 22], [14, 14, 15], [7, 7, 9]],
    glove: [[13, 13, 16], [7, 7, 10], [3, 3, 5]],
    top: [[9, 10, 12], [5, 6, 8], [2, 3, 5], [1, 1, 2]],
    trim: [[30, 24, 8], [22, 15, 4], [12, 8, 2]],
    boot: [[10, 9, 9], [5, 5, 5], [2, 2, 2]],
    sh: [[8, 9, 12], [4, 5, 7], [2, 2, 4]],
    extraA: { coin: [31, 27, 9], coinDk: [20, 13, 2] }, extraB: { ink: [3, 2, 2] },
  },
  head: {
    jaw: 'narrow', ears: [2.6, 3.6], hair: 'none', beard: 'stubble', eyeFace: 'focus', mouthW: 3, nose: [2.2, 2.6],
    gear(ctx, H) {
      const { cv, c } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.3), y = Math.round(H.y);
      // a flat cap with a brass plate, and grey whiskers down the jaw
      cv.part(ctx.mask().ellipse(x, y - 6.5, H.rx + 1, 6.5).cut(ctx.mask().rect(x - 20, y - 2, 40, 20)), { ramp: ctx.ramps.top, bevel: 4, inner: 'line' });
      cv.part(ctx.mask().rect(x - H.rx - 1, y - 4, H.rx * 2 + 2, 2.4), { ramp: ctx.ramps.top, bevel: 1, inner: 'line', shadow: false });
      cv.part(ctx.mask().rect(x - 3, y - 9, 6, 4), { ramp: ctx.ramps.trim, bevel: 1, inner: 'line', shadow: false });
      for (const s of [-1, 1]) for (let j = 0; j < 8; j++) cv.px(x + s * (H.rx - 1), y + j, c(j & 1 ? 'hair' : 'hairHi'));
    },
  },
  top: { style: 'vest', pauldrons: false, emblem(ctx, cx, cy) { const { cv, c } = ctx; for (const dy of [-4, 1, 6]) { cv.px(cx - 5, cy + dy, c('coin')); cv.px(cx + 5, cy + dy, c('coin')); } cv.line(cx + 8, cy - 8, cx + 4, cy + 4, (X, Y) => cv.px(X, Y, c('coinDk'))); } },
  belt: { buckle: 'square', ramp: 'trim' },
  front(ctx) {
    const { cv, J, pose, ramps, c } = ctx;
    if (pose.lying) return;
    // brass rings on the gloves
    for (const s of ['L', 'R']) { const f = J['fi' + s]; cv.line(f[0] - 4, f[1] + 5, f[0] + 4, f[1] + 5, (X, Y) => cv.px(X, Y, c('coin'))); }
    // the purse on his hip: a fat drawstring bag, coins showing at the neck
    const h = J.hip;
    const px = h[0] - 20, py = h[1] + 4;
    cv.part(ctx.mask().ellipse(px, py + 5, 8, 8.5), { ramp: [c('topHi'), c('top'), c('topSh')], bevel: 4, inner: 'line', shadow: false });
    cv.part(ctx.mask().rect(px - 4, py - 4, 8, 4), { ramp: ramps.trim, bevel: 1, inner: 'line', shadow: false });
    for (const [dx, dy] of [[-2, -6], [0, -7], [2, -6], [-1, -5], [1, -5]]) cv.px(px + dx, py + dy, c('coin'));
    cv.px(px - 3, py + 3, c('coin')); cv.px(px - 2, py + 2, c('coin'));
  },
});
export { palettes };
export default layers;
