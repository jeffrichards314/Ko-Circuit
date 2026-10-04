// Crucible (#102): sprite layers on the heavy build.
// The vessel the Furnace melts things in, walking: a cast-iron pot of a helm with a flared rim and one white-hot slit,
// a chest plate of riveted iron with a furnace grate in the middle of it (the bars glow orange, and the more the heat
// climbs the brighter the `overheat` modifier makes them), pipes venting from the shoulders, red-hot iron mitts and
// a belt of ingot moulds. He is always the hottest thing in the room.
import { rig } from '../pantheon/_rig.js';
import * as K from '../../remixKit.js';
import { swapPalette } from '../../../../src/engine/palette.js';

const { layers, palettes: base } = rig('crucible', {
  build: 'heavy',
  body: { size: [1.08, 1.0], legLen: 0.9, torsoLen: 1.05, shoulders: 1.16, neckLen: -2, dims: { neck: 11, chestW: 30, waistW: 25, belly: 8, deltoid: 12, upperArm: [8.8, 7.4] } },
  colors: {
    skin: [[13, 8, 7], [8, 5, 4], [4, 3, 3], [2, 1, 1]],
    hair: [[9, 6, 5], [4, 3, 3], [1, 1, 1]],
    glove: [[27, 12, 6], [18, 6, 3], [9, 3, 2]],
    top: [[15, 10, 9], [9, 6, 5], [4, 3, 3], [2, 1, 1]],
    trim: [[22, 14, 9], [13, 7, 5], [6, 3, 2]],
    boot: [[10, 7, 6], [5, 3, 3], [2, 1, 1]],
    sh: [[9, 6, 5], [4, 3, 2], [2, 1, 1]],
    extraA: { glow: [31, 17, 4], glowHi: [31, 30, 20] }, extraB: { pipe: [12, 11, 12], pipeDk: [5, 5, 6] },
  },
  head: {
    jaw: 'square', ears: null, hair: 'none', eyeFace: 'focus', mouthW: 3, nose: null,
    face(ctx, H) {
      // the crucible: a pot of cast iron down over the whole head, a flared rim, one white-hot slit, rivets
      const { cv, c } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.3), y = Math.round(H.y);
      const pot = ctx.mask().ellipse(x, y - 1, H.rx + 2.4, H.ry + 1.4).ellipse(x, y + 6, H.rx + 1.4, 10.5);
      cv.part(pot, { ramp: ctx.ramps.top, bevel: 6, inner: 'line' });
      cv.part(ctx.mask().rect(x - H.rx - 4, y - 8, H.rx * 2 + 8, 3), { ramp: ctx.ramps.trim, bevel: 1, inner: 'line', shadow: false });
      for (const [dx, dy] of [[-8, -3], [8, -3], [-9, 5], [9, 5], [0, -12]]) cv.px(x + dx, y + dy, c('trimHi'));
      cv.part(ctx.mask().rect(x - 8, y - 0.6, 17, 3), { ramp: [c('outline'), c('outline'), c('outline')], bevel: 0, inner: 'none', shadow: false });
      for (let i = -7; i <= 7; i++) { cv.px(x + i, y + 0.4, c(Math.abs(i) < 4 ? 'glowHi' : 'glow')); cv.px(x + i, y + 1.4, c('glow')); }
      // heat-shimmer drips off the rim
      for (const dx of [-11, -3, 7, 12]) { cv.px(x + dx, y - 4, c('glow')); }
    },
  },
  top: {
    style: 'plate', pauldrons: true,
    emblem(ctx, cx, cy) {
      // the furnace grate: a black frame with four glowing bars
      const { cv, c } = ctx;
      cv.part(ctx.mask().rect(cx - 8, cy - 1, 16, 12), { ramp: [c('pipe'), c('pipeDk'), c('outline')], bevel: 1, inner: 'line', shadow: false });
      for (let i = -6; i <= 6; i += 4) { cv.line(cx + i, cy + 1, cx + i, cy + 9, (X, Y) => cv.px(X, Y, c('glow'))); cv.px(cx + i, cy + 4, c('glowHi')); }
    },
  },
  belt: { buckle: 'square', ramp: 'trim' },
  // Title Defense: CRUCIBLE, QUENCHED. Plunged in the water: pale blue-steel instead of black iron, a pair of bull horns cast into the pot, steam
  // puffing off both shoulders, a strap harness and a heavy apron. The heat is a thing that happens to him (the overheat palette takes him orange).
  remix: {
    swap: {
      A: { skinHi: [20, 22, 25], skin: [13, 15, 19], skinSh: [7, 8, 11], skinDk: [3, 4, 6], gloveHi: [26, 28, 31], glove: [16, 20, 27], gloveDk: [8, 10, 17] },
      B: { topHi: [24, 28, 31], top: [14, 20, 27], topSh: [8, 11, 17], topDk: [4, 5, 9], trimHi: [31, 31, 31], trim: [24, 27, 31], trimSh: [13, 16, 23], shHi: [14, 18, 24], sh: [8, 10, 15], shDk: [4, 5, 8], bootHi: [20, 24, 29], boot: [11, 14, 20], bootDk: [5, 6, 10], pipe: [20, 22, 26], pipeDk: [9, 10, 14] },
    },
    ramps: { steel: ['topHi', 'top', 'topSh'], steam: ['trimHi', 'trim', 'trimSh'], dark: ['shHi', 'sh', 'shDk'] },
    body: { size: [1.1, 1.06], shoulders: 1.1 },
    back(ctx) { if (!ctx.pose.lying) { K.pipes(ctx, { ramp: 'dark', smoke: 'steam', h: 34, w: 7, spread: 12 }); K.pack(ctx, { ramp: 'steel', w: 30, h: 36, top: 6 }); } },
    head(ctx, H) { K.horns(ctx, H, { ramp: 'steel', len: 22, out: 15, thick: 5, y: 5 }); },
    torso(ctx) {
      if (ctx.pose.lying) return;
      K.apron(ctx, { ramp: 'dark', len: 20, top: false, taper: 7 });
      K.straps(ctx, { ramp: 'dark', buckle: 'steam' });
    },
    front(ctx) {
      if (ctx.pose.lying) return;
      for (const [k, s] of [['L', -1], ['R', 1]]) { const sh = ctx.J['sh' + k]; for (let i = 0; i < 3; i++) ctx.cv.part(ctx.mask().ellipse(sh[0] + s * (3 + (i & 1) * 2), sh[1] - 14 - i * 4, 3.4 - i * 0.5, 3), { ramp: ctx.ramps.steam, bevel: 2, shadow: false }); }
      K.bracers(ctx, { ramp: 'steel', from: 0.2, to: 0.55, wide: 2 });
    },
  },
  front(ctx) {
    const { cv, J, pose, c } = ctx;
    if (pose.lying) return;
    // pipes venting from both shoulders
    for (const s of ['L', 'R']) { const sh = J['sh' + s], d = s === 'L' ? -1 : 1; cv.part(ctx.mask().rect(sh[0] + d * 3 - 2, sh[1] - 12, 5, 9), { ramp: [c('pipe'), c('pipe'), c('pipeDk')], bevel: 1, inner: 'line', shadow: false }); cv.px(sh[0] + d * 3, sh[1] - 13, c('glow')); }
    // the mitts glow at the knuckles
    for (const s of ['L', 'R']) { const f = J['fi' + s]; cv.line(f[0] - 4, f[1] - 2, f[0] + 4, f[1] - 2, (X, Y) => cv.px(X, Y, c('glowHi'))); }
  },
});
// overheated: the whole of him white-hot (the `overheat` modifier swaps this in)
export const palettes = {
  ...base,
  'crucible.hot': {
    A: swapPalette('crucible.hot.A', base.crucible.A, { skinHi: [31, 27, 20], skin: [30, 19, 10], skinSh: [24, 10, 5], glove: [31, 26, 14], gloveHi: [31, 31, 26], gloveDk: [28, 15, 6], glow: [31, 28, 18] }),
    B: swapPalette('crucible.hot.B', base.crucible.B, { topHi: [31, 26, 16], top: [30, 17, 8], topSh: [22, 8, 4], trimHi: [31, 30, 22], trim: [31, 22, 10], trimSh: [24, 10, 4] }),
  },
};

export default layers;
