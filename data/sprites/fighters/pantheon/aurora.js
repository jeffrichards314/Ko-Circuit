// Aurora Vess (#54, Pantheon I's champion): sprite layers on the lean build.
// The dawn herself: warm tan skin, a long fall of rose-gold hair over her shoulders, a
// gold circlet, a halo of sunrays behind her head (drawn on the back layer, so it
// follows her), a white cropped top piped in gold, a rose sash, white trunks with a
// gold band, gold sandals, gloves that shine pink.
// `aurora.ghost` is her light trail: pale gold, drawn dithered; `aurora.hot` is the same
// trail flaring for its echo (opponentAI's `afterglow`).
// Poses: greet (arms open to the sun: the taunt).

import { makePalette, swapPalette } from '../../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from '../_face.js';
import * as K from '../../remixKit.js';

const A = makePalette('aurora.A', {
  outline: [3, 2, 5],
  skinHi: [30, 23, 16], skin: [25, 16, 10], skinSh: [17, 9, 7], skinDk: [10, 5, 4],
  white: [31, 31, 30], mouth: [13, 3, 6],
  hairHi: [31, 26, 20], hair: [30, 16, 16], hairDk: [19, 7, 11],
  gloveHi: [31, 24, 26], glove: [29, 12, 19], gloveDk: [17, 4, 11],
});
const B = makePalette('aurora.B', {
  goldHi: [31, 30, 17], gold: [29, 22, 5], goldSh: [18, 11, 2],
  topHi: [31, 31, 30], top: [28, 27, 28], topSh: [19, 18, 23],
  roseHi: [31, 22, 24], rose: [29, 10, 16], roseDk: [17, 3, 9],
  rayHi: [31, 31, 24], ray: [31, 26, 10], rayDk: [27, 15, 4],
});
// her light trail: pale gold, and flaring white for the echo
const ghostA = swapPalette('aurora.ghostA', A, {
  skinHi: [31, 31, 26], skin: [31, 28, 17], skinSh: [30, 22, 10], skinDk: [24, 14, 5],
  hairHi: [31, 31, 28], hair: [31, 27, 15], hairDk: [27, 19, 7],
  gloveHi: [31, 31, 30], glove: [31, 29, 19], gloveDk: [28, 20, 9], mouth: [26, 16, 6],
});
const ghostB = swapPalette('aurora.ghostB', B, {
  goldHi: [31, 31, 28], gold: [31, 29, 17], goldSh: [29, 22, 8], topHi: [31, 31, 31], top: [31, 31, 27], topSh: [30, 27, 16],
  roseHi: [31, 30, 26], rose: [31, 25, 14], roseDk: [28, 17, 7],
});
const hotA = swapPalette('aurora.hotA', ghostA, { skinHi: [31, 31, 31], skin: [31, 31, 27], hairHi: [31, 31, 31], hair: [31, 30, 22], gloveHi: [31, 31, 31], glove: [31, 31, 24] });
const hotB = swapPalette('aurora.hotB', ghostB, { goldHi: [31, 31, 31], gold: [31, 31, 24], topHi: [31, 31, 31], roseHi: [31, 31, 28], rose: [31, 28, 16] });
export const palettes = { aurora: { A, B }, 'aurora.ghost': { A: ghostA, B: ghostB }, 'aurora.hot': { A: hotA, B: hotB } };

const poses = {
  // arms open to the sun, head back: the taunt
  greet: {
    extends: 'idle1', shift: [0, 0],
    head: { at: [0, -101], face: 'grin', tilt: 'up', look: [0, -1] },
    elL: [-34, -84], elR: [34, -84], fiL: [-31, -104], fiR: [31, -104],
    gloveL: { angle: 20 }, gloveR: { angle: -20 },
  },
};

export default {
  id: 'aurora',
  build: 'lean',
  // her own body on the build: tall and light, long legs, a dancer's straight back
  body: { size: [0.98, 1.05], legLen: 1.06, torsoLen: 0.98, shoulders: 0.96, neckLen: 1, dims: { waistW: 11, upperArm: [4.6, 3.8], thigh: [6, 4.6] } },
  palettes: { default: 'aurora' },
  torsoMaterial: 'skin',
  poses,
  // Title Defense: AURORA AT DUSK. The sun is down: indigo hair under a silver crescent, a veil, a cape of night with a scalloped hem, a violet
  // bodice with a silver star, and tassets for the trunks.
  remix: {
    skip: ['back', 'torso'],
    swap: {
      A: { hairHi: [19, 17, 29], hair: [9, 7, 21], hairDk: [3, 2, 10], gloveHi: [28, 28, 31], glove: [17, 18, 27], gloveDk: [7, 8, 17] },
      B: {
        goldHi: [31, 31, 31], gold: [21, 23, 29], goldSh: [10, 11, 19],
        topHi: [15, 9, 24], top: [8, 4, 16], topSh: [4, 2, 9],
        roseHi: [28, 14, 24], rose: [20, 5, 16], roseDk: [9, 2, 8],
        rayHi: [31, 31, 28], ray: [26, 27, 28], rayDk: [14, 15, 22],
      },
    },
    ramps: { night: ['topHi', 'top', 'topSh'], silver: ['goldHi', 'gold', 'goldSh'], moon: ['rayHi', 'ray', 'rayDk'], dusk: ['roseHi', 'rose', 'roseDk'] },
    back(ctx) {
      const { J, ramps, cv } = ctx;
      if (ctx.pose.lying) return;
      const [hx, hy] = J.head, sh = [J.shL, J.shR];
      cv.part(ctx.mask().poly([[hx - 12, hy], [hx + 12, hy], [sh[1][0] + 4, sh[1][1] + 16], [sh[0][0] - 4, sh[0][1] + 16]]), { ramp: ramps.hair, bevel: 5, inner: 'line' });
      K.cape(ctx, { ramp: 'night', inner: 'dusk', len: 38, flare: 9, hem: 'scallop' });
      // stars on the cape
      for (const [dx, dy] of [[-16, 18], [-8, 28], [14, 22], [8, 36], [-20, 36], [20, 38]]) { cv.px(J.hip[0] + dx, J.hip[1] + dy, ctx.c('rayHi')); cv.px(J.hip[0] + dx + 1, J.hip[1] + dy, ctx.c('ray')); }
    },
    head(ctx, H) {
      K.crescent(ctx, H, { ramp: 'moon', dy: 12, r: 10 });
      K.mask(ctx, H, { ramp: 'dusk', y: 4 });
    },
    torso(ctx) {
      const { cv, J, D, ramps } = ctx;
      if (ctx.pose.lying) return;
      const n = J.neck, w = J.waist, ch = J.chest, tm = ctx.torsoMask;
      cv.part(ctx.mask().poly([[n[0] - 10, n[1] + 2], [n[0] + 10, n[1] + 2], [ch[0] + D.chestW - 1, ch[1] + 6], [w[0] + D.waistW - 2, w[1] - 1], [w[0] - D.waistW + 2, w[1] - 1], [ch[0] - D.chestW + 1, ch[1] + 6]]).clip(tm), { ramp: ramps.night, bevel: 4, inner: 'line' });
      cv.line(n[0] - 10, n[1] + 2, ch[0] - D.chestW + 1, ch[1] + 6, (X, Y) => cv.px(X, Y, ctx.c('gold')));
      cv.line(n[0] + 10, n[1] + 2, ch[0] + D.chestW - 1, ch[1] + 6, (X, Y) => cv.px(X, Y, ctx.c('gold')));
      K.emblem(ctx, Math.round(ch[0]), Math.round(ch[1] + 2), 'star', 'silver', 0.8);
      K.belt(ctx, { ramp: 'dusk', buckle: 'silver', wide: 3, shape: 'round' });
      K.skirt(ctx, { ramp: 'dusk', kind: 'strips', len: 15, n: 6 });
    },
    front(ctx) { K.bracers(ctx, { ramp: 'silver', from: 0.25, to: 0.62 }); },
  },

  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['goldHi', 'gold', 'goldSh'],
    shorts: ['topHi', 'top', 'topSh'],
    sock: ['goldHi', 'gold', 'goldSh'],
    boot: ['goldHi', 'gold', 'goldSh'],
    sole: ['gold', 'goldSh', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    gold: ['goldHi', 'gold', 'goldSh'],
    top: ['topHi', 'top', 'topSh', 'outline'],
    rose: ['roseHi', 'rose', 'roseDk'],
    ray: ['rayHi', 'ray', 'rayDk'],
  },

  // the halo: a sunburst behind her head, the long hair falling behind her shoulders
  back(ctx) {
    const { cv, J, c, ramps, pose } = ctx;
    if (pose.lying) return;
    const [hx, hy] = J.head;
    for (let k = 0; k < 13; k++) {
      const a = -Math.PI + (k / 12) * Math.PI, len = k % 2 ? 19 : 25;
      cv.part(ctx.mask().poly([[hx + Math.cos(a) * 10, hy + Math.sin(a) * 10 - 2], [hx + Math.cos(a - 0.11) * 14, hy + Math.sin(a - 0.11) * 14 - 2], [hx + Math.cos(a) * len, hy + Math.sin(a) * len - 2], [hx + Math.cos(a + 0.11) * 14, hy + Math.sin(a + 0.11) * 14 - 2]]), { ramp: ramps.ray, bevel: 1, inner: 'line', shadow: false });
    }
    cv.part(ctx.mask().ellipse(hx, hy - 1, 15.5, 16), { ramp: ramps.ray, bevel: 6, inner: 'line', shadow: false });
    // the hair falls behind her shoulders
    const sh = [J.shL, J.shR];
    cv.part(ctx.mask().poly([[hx - 12, hy], [hx + 12, hy], [sh[1][0] + 4, sh[1][1] + 16], [sh[0][0] - 4, sh[0][1] + 16]]), { ramp: ramps.hair, bevel: 5, inner: 'line' });
    void c;
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';
    ears(ctx, H, ramps.skin, [1.7, 2.6]);
    const hm = skull(ctx, H, ramps.skin, 'narrow');
    // rose-gold hair parted in the middle, swept round the face, a gold circlet across the brow
    const hair = ctx.mask().ellipse(x + lx * 0.3, y - 3, H.rx + 1.4, 8.4).cut(ctx.mask().ellipse(fx, fy + 2.6, H.rx - 2.2, 8.2));
    hair.ellipse(x - H.rx + 0.6 + lx * 0.3, y + 5, 2.4, 8).ellipse(x + H.rx - 0.6 + lx * 0.3, y + 5, 2.4, 8);
    cv.part(hair, { ramp: ramps.hair, bevel: 3, inner: 'line' });
    cv.line(x + lx * 0.3, y - 11, fx - 2, y - 3, (X, Y) => cv.shade(X, Y, 2));
    for (let i = -6; i <= 6; i += 3) cv.px(x + i + lx * 0.3, y - 8 + (i & 1), c('hairHi'));
    cv.part(ctx.mask().rect(x - H.rx + 0.5 + lx * 0.3, y - 6, H.rx * 2 - 1, 2), { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
    cv.part(ctx.mask().ellipse(fx, y - 6, 1.8, 1.8), { ramp: ramps.gold, bevel: 1, shadow: false });
    // calm, bright eyes, arched brows, a serene smile
    eyes(ctx, fx, fy, face === 'neutral' ? 'neutral' : face, -1);
    for (const s of [-1, 1]) { const ex = fx + s * 8 - (s > 0 ? 2 : 0); cv.px(ex, fy - 3, c('hairDk')); cv.px(ex + s, fy - 4, c('hairDk')); }
    brows(ctx, fx, fy, face, ramps.hair, { len: 3.6, thick: 0.8, y: -4.4 });
    nose(ctx, fx, fy, ramps.skin, [1.5, 1.7], 3.3);
    mouth(ctx, fx, fy + 8, face === 'neutral' ? 'smile' : face, { w: 3 });
    ctx.headMask = hm;
  },

  torso(ctx) {
    const { cv, J, c, ramps, D, pose } = ctx;
    if (pose.lying) return;
    const n = J.neck, w = J.waist, ch = J.chest, tm = ctx.torsoMask;
    // a cropped white top piped in gold
    const top = ctx.mask().poly([[n[0] - 9, n[1] + 2], [n[0] + 9, n[1] + 2], [ch[0] + D.chestW - 2, ch[1] + 4], [ch[0] - D.chestW + 2, ch[1] + 4]]).clip(tm);
    cv.part(top, { ramp: ramps.top, bevel: 4, inner: 'line' });
    for (const s of [-1, 1]) cv.line(n[0] + s * 8, n[1] + 3, ch[0] + s * (D.chestW - 3), ch[1] + 3, (X, Y) => cv.px(X, Y, c('gold')));
    cv.line(ch[0] - D.chestW + 3, ch[1] + 4, ch[0] + D.chestW - 3, ch[1] + 4, (X, Y) => cv.px(X, Y, c('gold')));
    cv.part(ctx.mask().ellipse(ch[0], ch[1] - 2, 2.4, 2.2), { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
    // the rose sash at the waist with a long tail, and a gold band on the trunks
    const by = Math.round(w[1]);
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, by - 2, D.waistW * 2 + 2, 4).clip(ctx.mask().add(tm).add(ctx.shortsMask)), { ramp: ramps.rose, bevel: 2, inner: 'line', shadow: false });
    cv.part(ctx.mask().poly([[w[0] + 9, by + 1], [w[0] + 13, by + 1], [w[0] + 16, by + 16], [w[0] + 11, by + 14]]), { ramp: ramps.rose, bevel: 2, inner: 'line' });
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, by + 4, D.waistW * 2 + 2, 2).clip(ctx.shortsMask), { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
  },
};
