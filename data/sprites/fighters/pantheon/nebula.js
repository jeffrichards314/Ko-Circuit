// Nebula (#67): sprite layers on the giant build. Pantheon IV's champion.
// She's a cloud of gas that boxes: a body of violet and magenta vapour with stars inside it, a
// swirl of pink hair that never sits still, white glowing eyes, a galaxy spiral on her chest, bright
// vapour gloves. Every palette here is a colour of her tell: `nebula.hot` (red-gold: head),
// `nebula.cold` (blue: body), `nebula.gold` (white-gold: her super), `nebula.green` (a slip-only
// sweep). She is drawn see-through (dithered) by the `gas` modifier.
import { rig } from './_rig.js';
import * as K from '../../remixKit.js';

const { layers, palettes } = rig('nebula', {
  build: 'giant',
  body: { size: [0.93, 0.95], legLen: 0.97, torsoLen: 1.0, shoulders: 1.0, dims: { belly: 4 } },
  colors: {
    skin: [[26, 20, 31], [18, 11, 27], [10, 5, 19], [5, 2, 11]],
    hair: [[31, 24, 31], [28, 12, 26], [16, 5, 18]],
    glove: [[30, 25, 31], [22, 14, 30], [12, 6, 20]],
    top: [[26, 18, 31], [17, 9, 26], [9, 4, 17], [4, 2, 9]],
    trim: [[31, 28, 31], [26, 18, 31], [14, 8, 22]],
    boot: [[26, 20, 31], [16, 9, 25], [7, 3, 14]],
    sh: [[22, 14, 30], [14, 7, 23], [7, 3, 14]],
    extraA: { eye: [31, 31, 31], star: [31, 31, 24] }, extraB: { gasHi: [31, 26, 31], cyan: [12, 28, 31] },
  },
  head: {
    jaw: 'narrow', ears: [2.4, 3.2], hair: 'wild', hairKey: 'hair', eyeFace: 'focus', mouthW: 3,
    face(ctx, H) {
      // a starry speckle across the face
      const { cv, c } = ctx;
      for (const [dx, dy] of [[-8, -1], [7, 3], [-5, 6], [9, -5], [1, -8]]) cv.px(Math.round(H.x) + dx, Math.round(H.y) + dy, c('star'));
    },
  },
  top: {
    style: 'tank', hem: false,
    emblem(ctx, cx, cy) {
      const { cv, c } = ctx;
      // a galaxy spiral
      for (let i = 0; i < 40; i++) { const t = i * 0.42, r = 1 + i * 0.28; cv.px(cx + Math.cos(t) * r, cy + Math.sin(t) * r * 0.8, c(i % 5 === 0 ? 'star' : i & 1 ? 'trim' : 'trimSh')); }
      cv.px(cx, cy, c('star'));
    },
  },
  belt: { buckle: 'round' },
  // Title Defense: THE BLACK HOLE. The violet gas collapses into a dark star: a body the colour of deep space with the stars still in it, white hair
  // like a jet, and an accretion disc of magenta fire round her middle (half behind her, half in front).
  remix: {
    swap: {
      A: { skinHi: [11, 8, 23], skin: [6, 4, 15], skinSh: [3, 2, 9], skinDk: [1, 1, 4], hairHi: [31, 31, 31], hair: [27, 24, 31], hairDk: [15, 12, 26], gloveHi: [31, 26, 31], glove: [23, 12, 29], gloveDk: [10, 4, 19] },
      B: { topHi: [10, 6, 21], top: [5, 3, 14], topSh: [2, 1, 8], topDk: [1, 0, 4], trimHi: [31, 24, 31], trim: [29, 11, 25], trimSh: [15, 4, 15], bootHi: [11, 7, 23], boot: [5, 3, 14], bootDk: [2, 1, 7], shHi: [10, 6, 21], sh: [5, 3, 14], shDk: [2, 1, 7] },
    },
    ramps: { disc: ['trimHi', 'trim', 'trimSh'], jet: ['hairHi', 'hair', 'hairDk'], void: ['topHi', 'top', 'topSh'] },
    back(ctx) {
      if (ctx.pose.lying) return;
      K.cape(ctx, { ramp: 'void', inner: 'disc', len: 46, flare: 13, hem: 'tatter' });
      K.ring(ctx, { ramp: 'disc', rx: 46, ry: 11, thick: 5, cy: ctx.J.chest[1] + 12, half: 'back' });
      K.speckle(ctx, { color: 'star', n: 60, region: 'all', seed: 11, only: 'filled' });
    },
    head(ctx, H) { K.flames(ctx, H, { ramp: 'jet', n: 5, h: 14 }); },
    torso(ctx) {
      if (ctx.pose.lying) return;
      K.pauldrons(ctx, { ramp: 'jet', style: 'fur', size: 3 });
      K.speckle(ctx, { color: 'star', n: 70, region: 'torso', seed: 3 });
      K.speckle(ctx, { color: 'star', n: 40, region: 'legs', seed: 5 });
    },
    front(ctx) {
      if (!ctx.pose.lying) K.ring(ctx, { ramp: 'disc', rx: 46, ry: 11, thick: 5, cy: ctx.J.chest[1] + 12, half: 'front' });
      K.rings(ctx, { ramp: 'disc', where: 0.4 });
    },
  },
  swaps: {
    'nebula.hot': { A: { skinHi: [31, 26, 20], skin: [30, 16, 8], skinSh: [22, 8, 5], skinDk: [12, 3, 3], gloveHi: [31, 28, 20], glove: [31, 16, 6], gloveDk: [20, 6, 3], hairHi: [31, 28, 20], hair: [31, 16, 6], hairDk: [20, 6, 3] }, B: { topHi: [31, 26, 18], top: [30, 14, 6], topSh: [21, 7, 4], topDk: [11, 3, 2], trimHi: [31, 31, 24], trim: [31, 24, 8], trimSh: [22, 12, 3], shHi: [30, 18, 8], sh: [24, 9, 4], shDk: [12, 4, 2], bootHi: [31, 24, 14], boot: [28, 12, 5], bootDk: [14, 4, 2] } },
    'nebula.cold': { A: { skinHi: [22, 30, 31], skin: [8, 20, 31], skinSh: [4, 10, 24], skinDk: [2, 4, 14], gloveHi: [24, 31, 31], glove: [8, 22, 31], gloveDk: [3, 10, 22], hairHi: [24, 31, 31], hair: [8, 22, 31], hairDk: [3, 10, 22] }, B: { topHi: [22, 30, 31], top: [6, 18, 30], topSh: [3, 9, 22], topDk: [1, 4, 12], trimHi: [31, 31, 31], trim: [16, 28, 31], trimSh: [6, 16, 28], shHi: [14, 26, 31], sh: [4, 14, 27], shDk: [2, 6, 16], bootHi: [20, 28, 31], boot: [6, 16, 28], bootDk: [2, 6, 16] } },
    'nebula.gold': { A: { skinHi: [31, 31, 28], skin: [31, 28, 14], skinSh: [26, 20, 6], skinDk: [14, 9, 2], gloveHi: [31, 31, 30], glove: [31, 29, 16], gloveDk: [24, 16, 4], hairHi: [31, 31, 30], hair: [31, 29, 16], hairDk: [24, 16, 4] }, B: { topHi: [31, 31, 28], top: [31, 27, 12], topSh: [24, 17, 5], topDk: [12, 8, 2], trimHi: [31, 31, 31], trim: [31, 30, 20], trimSh: [26, 20, 8], shHi: [31, 29, 16], sh: [27, 20, 6], shDk: [14, 9, 2], bootHi: [31, 30, 20], boot: [27, 20, 6], bootDk: [14, 9, 2] } },
    'nebula.green': { A: { skinHi: [24, 31, 24], skin: [8, 26, 12], skinSh: [4, 16, 8], skinDk: [2, 7, 4], gloveHi: [26, 31, 24], glove: [10, 28, 14], gloveDk: [4, 14, 8], hairHi: [26, 31, 24], hair: [10, 28, 14], hairDk: [4, 14, 8] }, B: { topHi: [24, 31, 24], top: [6, 24, 10], topSh: [3, 14, 6], topDk: [1, 6, 3], trimHi: [31, 31, 28], trim: [18, 31, 18], trimSh: [6, 20, 10], shHi: [14, 30, 16], sh: [5, 20, 9], shDk: [2, 9, 4], bootHi: [20, 31, 20], boot: [6, 22, 10], bootDk: [2, 9, 4] } },
  },
});
export { palettes };
export default layers;
