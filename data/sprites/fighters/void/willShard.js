// The Will Shard (#119): sprite layers on the heavy build. The biggest of the twelve: a giant of a man, broad as a door, bone-white cracked with
// fine black fissures that glow ember-red from inside, a blank head with a crown of five short thorns, chains of black iron hanging from his
// wrists that he has long since stopped noticing, and in the chest the hollow of a heart, its rim burning red.
import { hollow } from './_hollow.js';

const { layers, palettes } = hollow('willShard', {
  build: 'heavy',
  body: { size: [1.1, 1.02], legLen: 0.92, torsoLen: 1.06, shoulders: 1.24, neckLen: -2, dims: { neck: 12, chestW: 32, waistW: 26, belly: 8, deltoid: 13.5, upperArm: [9, 7.6], forearm: [7.8, 6.8] } },
  tint: [31, 8, 6], tintHi: [31, 22, 14], tintDk: [15, 2, 2],
  tone: [27, 25, 25],
  face: 'holes',
  head: { jaw: 'square' },
  topStyle: 'bare',
  emblem: 'heart',
  belt: { buckle: 'round' },
  gear(ctx, H, o) {
    const { cv, c, ramps } = ctx;
    for (const dx of [-8, -4, 0, 4, 8]) cv.part(ctx.mask().poly([[o.x + dx - 2, o.y - H.ry + 2], [o.x + dx, o.y - H.ry - 5 - (dx === 0 ? 2 : 0)], [o.x + dx + 2, o.y - H.ry + 2]]), { ramp: ramps.trim, bevel: 1, inner: 'line', shadow: false });
    cv.line(o.fx - 7, o.fy - 8, o.fx - 4, o.fy - 3, (X, Y) => cv.px(X, Y, c('tint')));
  },
  torso(ctx) {
    // fissures glowing in the chest and shoulders
    const { cv, J, pose, c } = ctx;
    if (pose.lying) return;
    const ch = J.chest;
    for (const [dx0, dy0, dx1, dy1] of [[-16, -6, -10, 4], [-10, 4, -13, 10], [14, -8, 10, 2], [10, 2, 15, 9]]) cv.line(ch[0] + dx0, ch[1] + dy0, ch[0] + dx1, ch[1] + dy1, (X, Y) => cv.px(X, Y, c('tintDk')));
  },
  front(ctx) {
    const { cv, J, pose, c } = ctx;
    if (pose.lying) return;
    for (const s of ['L', 'R']) { const f = J['fi' + s], e = J['el' + s]; for (let i = 1; i < 5; i++) { const u = i / 5; cv.px(e[0] + (f[0] - e[0]) * u, e[1] + (f[1] - e[1]) * u + 4 + (i & 1), c('hole')); } }
  },
});
export { palettes };
export default layers;
