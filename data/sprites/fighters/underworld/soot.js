// Queen Soot (#89): sprite layers on the medium build.
// The queen of the Ashen Fields: skin the grey of old ash, a long fall of hair going from black to ember-red at
// the ends, a crown of thin iron spikes each tipped with a live coal, a charred black robe cut away at the shoulders with a
// hem that glows where it is still burning, ember-gold rings on her wraps.
import { rig } from '../pantheon/_rig.js';
import * as K from '../../remixKit.js';

const { layers, palettes } = rig('soot', {
  build: 'medium',
  body: { size: [0.99, 1.02], legLen: 1.0, torsoLen: 0.99, shoulders: 0.96, dims: { belly: 1, waistW: 13, chestW: 17, upperArm: [5.6, 4.6] } },
  colors: {
    skin: [[19, 18, 20], [12, 11, 13], [7, 6, 8], [3, 2, 4]],
    hair: [[26, 9, 4], [12, 3, 2], [3, 1, 1]],
    glove: [[10, 9, 11], [5, 4, 6], [2, 2, 3]],
    top: [[9, 4, 5], [5, 2, 3], [2, 1, 2], [1, 0, 1]],
    trim: [[31, 25, 9], [28, 13, 3], [15, 6, 2]],
    boot: [[9, 8, 9], [4, 3, 4], [2, 1, 2]],
    sh: [[6, 3, 4], [3, 1, 2], [1, 0, 1]],
    extraA: { coal: [31, 12, 3], coalHi: [31, 26, 10] }, extraB: { edge: [30, 10, 2] },
  },
  head: {
    jaw: 'narrow', ears: [2.2, 3], hair: 'long', eyeFace: 'focus', mouthW: 2.8, nose: [1.6, 1.6],
    gear(ctx, H) {
      if (ctx.layers.remixed) { const fx = Math.round(H.x + H.look[0]), fy = Math.round(H.y + H.look[1]); for (const s of [-1, 1]) ctx.cv.px(fx + s * 4, fy - 0.5, ctx.c('coalHi')); return; }
      const { cv, c } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.3), y = Math.round(H.y);
      // the crown: a band of iron and five spikes, each with a coal on its tip
      cv.part(ctx.mask().rect(x - H.rx, y - 8, H.rx * 2, 3), { ramp: ctx.ramps.glove, bevel: 1, inner: 'line', shadow: false });
      for (let i = -2; i <= 2; i++) {
        const h = 7 - Math.abs(i);
        cv.part(ctx.mask().poly([[x + i * 5 - 1.6, y - 8], [x + i * 5, y - 8 - h], [x + i * 5 + 1.6, y - 8]]), { ramp: ctx.ramps.glove, bevel: 1, inner: 'line', shadow: false });
        cv.px(x + i * 5, y - 9 - h, c('coalHi')); cv.px(x + i * 5, y - 8 - h, c('coal'));
      }
      const fx = x + H.look[0], fy = y + H.look[1];
      for (const s of [-1, 1]) cv.px(fx + s * 4, fy - 0.5, c('coalHi'));
    },
  },
  top: { style: 'robe', emblem(ctx, cx, cy) { const { cv, c } = ctx; for (const dx of [-12, -7, -2, 3, 8, 12]) { cv.px(cx + dx, cy + 20 + ((dx * 3) & 3), c('edge')); } } },
  belt: { buckle: 'round', ramp: 'trim' },
  // Title Defense: QUEEN SOOT, REKINDLED. The ash burns up: a crest of living flame in place of the iron crown, wings of fire spread behind her, a
  // robe of molten orange cut with black, and white-hot trim.
  remix: {
    swap: {
      A: { skinHi: [28, 22, 17], skin: [22, 15, 11], skinSh: [14, 8, 7], skinDk: [7, 3, 3], hairHi: [31, 28, 10], hair: [31, 15, 4], hairDk: [21, 6, 2], gloveHi: [31, 26, 12], glove: [30, 13, 3], gloveDk: [19, 5, 1] },
      B: { topHi: [31, 24, 8], top: [29, 12, 3], topSh: [19, 5, 2], topDk: [9, 2, 1], trimHi: [31, 31, 24], trim: [31, 28, 12], trimSh: [24, 15, 4], bootHi: [31, 22, 8], boot: [26, 10, 3], bootDk: [13, 4, 1], shHi: [14, 6, 6], sh: [8, 3, 4], shDk: [4, 1, 2], edge: [31, 20, 4] },
    },
    ramps: { fire: ['hairHi', 'hair', 'hairDk'], robe: ['topHi', 'top', 'topSh'], white: ['trimHi', 'trim', 'trimSh'] },
    back(ctx) {
      if (ctx.pose.lying) return;
      K.wingsFeather(ctx, { ramp: 'fire', span: 50, spread: 1.8, tip: 'trimHi', rise: 6, lift: 9 });
    },
    head(ctx, H) { K.flames(ctx, H, { ramp: 'fire', n: 5, h: 26 }); K.flames(ctx, H, { ramp: 'white', n: 3, h: 15 }); },
    torso(ctx) { if (!ctx.pose.lying) { K.pauldrons(ctx, { ramp: 'fire', style: 'flame', size: 3 }); K.skirt(ctx, { ramp: 'robe', kind: 'strips', len: 30, n: 6 }); } },
    front(ctx) { K.rings(ctx, { ramp: 'white', where: 0.3 }); },
  },
  front(ctx) {
    const { cv, J, pose, c } = ctx;
    if (pose.lying) return;
    for (const s of ['L', 'R']) { const f = J['fi' + s]; cv.line(f[0] - 4, f[1] + 4, f[0] + 4, f[1] + 4, (X, Y) => cv.px(X, Y, c('trim'))); cv.px(f[0], f[1] - 3, c('coal')); }
  },
});
export { palettes };
export default layers;
