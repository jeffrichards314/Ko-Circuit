// "Thunder" Jax Crane: sprite layers on the medium build.
// The champion of the world: a sharp black fade with a lightning bolt shaved
// into the side, a hard, handsome, unimpressed face, a carved physique, royal
// blue trunks with a gold waistband and a white lightning bolt down the leg,
// gold wristbands, white socks, blue-and-gold boots, red gloves.
// thunderTell: the dip before the uppercut, sparks crawling over the glove.
// skyPoint1/2: the taunt, pointing up at the storm.

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './_face.js';

const A = makePalette('jax.A', {
  outline: [2, 2, 4],
  skinHi: [28, 19, 14], skin: [21, 13, 9], skinSh: [15, 8, 6], skinDk: [8, 4, 4],
  white: [31, 31, 31], mouth: [11, 2, 4],
  hairHi: [8, 8, 12], hair: [2, 2, 4],
  gloveHi: [31, 12, 12], glove: [26, 3, 6], gloveDk: [14, 1, 4],
  spark: [26, 31, 31], sparkHi: [31, 31, 18],
});
const B = makePalette('jax.B', {
  trunkHi: [8, 14, 31], trunk: [3, 7, 23], trunkDk: [1, 2, 12],
  gold: [31, 25, 7], goldDk: [21, 14, 2],
  bolt: [31, 31, 26],
  sockHi: [31, 31, 31], sock: [24, 25, 28],
  bootHi: [10, 16, 31], boot: [4, 8, 22], bootDk: [2, 3, 12],
});
// phase 2: the champion gets back up ANGRY, red in the face (spec §4 "Boss phases")
const angryA = makePalette('jax.angry.A', {
  outline: [2, 2, 4],
  skinHi: [31, 17, 13], skin: [26, 9, 7], skinSh: [18, 5, 4], skinDk: [9, 2, 2],
  white: [31, 31, 31], mouth: [11, 2, 4],
  hairHi: [8, 8, 12], hair: [2, 2, 4],
  gloveHi: [31, 12, 12], glove: [26, 3, 6], gloveDk: [14, 1, 4],
  spark: [26, 31, 31], sparkHi: [31, 31, 18],
});
export const palettes = { jax: { A, B }, 'jax.angry': { A: angryA, B } };

const poses = {
  thunderTell: {
    extends: 'upperTell', shift: [0, 2],
    head: { at: [3, -93], face: 'strain', look: [1, 1] },
    sparks: 1,
  },
  skyPoint1: {
    extends: 'idle1',
    head: { at: [0, -101], face: 'grin', tilt: 'up', look: [0, -1] },
    elR: [26, -92], fiR: [22, -116], gloveR: { angle: 0 },
    elL: [-26, -60], fiL: [-14, -72],
  },
  skyPoint2: { extends: 'skyPoint1', fiR: [23, -119], sparks: 2 },
};

export default {
  id: 'jax',
  build: 'medium',
  // his own body on the build: the champion: carved, V-shaped, every muscle on show
  body: { shoulders: 1.1, torsoLen: 1.03, dims: { waistW: 14.5, belly: 2, deltoid: 7.5, upperArm: [6.8, 5.6], forearm: [5.6, 4.6] } },
  palettes: { default: 'jax' },
  torsoMaterial: 'skin',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['gold', 'gold', 'goldDk'],
    shorts: ['trunkHi', 'trunk', 'trunkDk'],
    sock: ['sockHi', 'sock', 'trunkDk'],
    boot: ['bootHi', 'boot', 'bootDk'],
    sole: ['gold', 'goldDk', 'outline'],
    hair: ['hairHi', 'hair', 'outline'],
    gold: ['gold', 'gold', 'goldDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    ears(ctx, H, ramps.skin, [2, 3]);
    const hm = skull(ctx, H, ramps.skin, 'chin');
    // a sharp fade: solid on top, stippled at the sides, a bolt shaved in
    const top = ctx.mask().ellipse(x + lx * 0.3, y - 6, H.rx + 0.4, 7).cut(ctx.mask().rect(x - 14, y - 3, 28, 12));
    cv.part(top, { ramp: ramps.hair, bevel: 2, inner: 'line' });
    for (let Y = y - 3; Y < y + 1; Y++) for (let X = Math.round(x - H.rx); X <= x + H.rx; X++) if (hm.in(X, Y) && Math.abs(X - x) > H.rx - 3 && (X + Y) & 1) cv.px(X, Y, c('hair'));
    for (const [dx, dy] of [[0, 0], [1, 1], [0, 2], [1, 3], [2, 4]]) cv.px(x + H.rx - 4 + dx, y - 8 + dy, c('skinSh'));
    for (const dx of [-5, -1, 3]) cv.shade(x + dx + lx * 0.3, y - 11, -1);
    eyes(ctx, fx, fy, face, 0);
    brows(ctx, fx, fy, face, ramps.hair, { len: 4.6, thick: 1.2, y: -4.2 });
    nose(ctx, fx, fy, ramps.skin, [2, 2.2], 3.6);
    mouth(ctx, fx, fy + 8.5, face, { w: 3.4 });
    cv.shade(fx - 6, fy + 5, 1); cv.shade(fx + 6, fy + 5, 1); // cheekbones
  },

  torso(ctx) {
    const { cv, J, c, D, ramps, pose } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, h = J.hip;
    const tm = ctx.torsoMask;
    // carved: pecs, the line down the middle, abs
    for (const s of [-1, 1]) cv.line(ch[0] + s * 2, ch[1] + 6, ch[0] + s * (D.chestW - 5), ch[1] + 3, (X, Y) => { if (tm.in(X, Y)) cv.shade(X, Y, 1); });
    cv.line(n[0], n[1] + 7, w[0], w[1] - 3, (X, Y) => { if (tm.in(X, Y)) cv.shade(X, Y, 1); });
    for (let k = 0; k < 3; k++) for (const s of [-1, 1]) { cv.shade(w[0] + s * 4, w[1] - 6 - k * 5, 1); cv.shade(w[0] + s * 5, w[1] - 6 - k * 5, 1); }
    for (const s of [-1, 1]) cv.shade(ch[0] + s * 9, ch[1] - 2, -1);
    // gold waistband, and a lightning bolt down the leg
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, w[1] - 4, D.waistW * 2 + 2, 4).clip(ctx.shortsMask), { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
    if (!pose.lying) {
      const bx = Math.round(h[0] + D.hipSpread + 3), by = Math.round(h[1] - 2);
      cv.part(ctx.mask().poly([[bx + 3, by], [bx - 1, by + 5], [bx + 2, by + 5], [bx - 2, by + 12], [bx + 5, by + 3], [bx + 2, by + 3], [bx + 5, by]]).clip(ctx.shortsMask), { ramp: ['bolt', 'bolt', 'gold'].map(c), bevel: 1, inner: 'line', shadow: false });
    }
  },

  // sparks crawling over the glove before the uppercut (and on the sky point)
  front(ctx) {
    const { cv, J, c, pose } = ctx;
    if (!pose.sparks) return;
    const [x, y] = J.fiR;
    const pts = pose.sparks === 1
      ? [[-10, -6], [-8, -8], [9, -4], [11, -6], [-6, 8], [7, 9], [0, -13], [1, -14]]
      : [[-8, -10], [-10, -12], [8, -12], [10, -14], [0, -16], [-1, -18]];
    for (const [dx, dy] of pts) cv.px(x + dx, y + dy, c((dx + dy) & 1 ? 'spark' : 'sparkHi'));
  },
  // Title Defense, THUNDER RETURNS: a year of thinking about it. A full black
  // beard, a stitched scar over his brow, a lightning-bolt tattoo across his
  // chest, bigger through the shoulders, and his robe's hood down round his neck.
  remix: {
    colors: { B: { robeHi: [12, 16, 31], robe: [5, 8, 22], robeDk: [2, 3, 11] } },
    body: { shoulders: 1.16, dims: { deltoid: 8.2, upperArm: [7.2, 6], neck: 7 } },
    ramps: { robe: ['robeHi', 'robe', 'robeDk', 'outline'] },
    back(ctx) {
      const { cv, J, ramps, pose } = ctx;
      if (pose.lying) return;
      // the hood, down: a thick fold behind the neck and over the shoulders
      const n = J.neck, L = J.shL, R = J.shR;
      const hood = ctx.mask().ellipse(n[0], n[1] - 1, 13, 7).capsule(L[0] + 4, L[1] - 3, n[0], n[1] - 3, 5, 6).capsule(R[0] - 4, R[1] - 3, n[0], n[1] - 3, 5, 6);
      cv.part(hood, { ramp: ramps.robe, bevel: 4 });
      cv.line(n[0] - 10, n[1] - 2, n[0] + 10, n[1] - 2, (X, Y) => cv.px(X, Y, ctx.c('gold')));
    },
    head(ctx, H) {
      const { cv, ramps, c } = ctx;
      const fx = Math.round(H.x + H.look[0]), fy = Math.round(H.y + H.look[1]);
      const open = ['grin', 'wide', 'strain', 'hurt', 'ko'].includes(H.face);
      const bd = ctx.mask().ellipse(fx, fy + 9, H.rx - 0.3, 6.5).cut(ctx.mask().rect(fx - 20, fy - 6, 40, 11));
      bd.rect(Math.round(H.x) - Math.round(H.rx) + 1, H.y, 3, 8).rect(Math.round(H.x) + Math.round(H.rx) - 4, H.y, 3, 8);
      const mo = ctx.mask().ellipse(fx, fy + 8.5, 3.2, open ? 2 : 1);
      cv.part(bd.cut(mo), { ramp: ['hairHi', 'hair', 'outline'].map(c), bevel: 2, inner: 'line' });
      cv.part(ctx.mask().ellipse(fx - 3, fy + 6.4, 3.2, 1.2).ellipse(fx + 3, fy + 6.4, 3.2, 1.2), { ramp: ['hairHi', 'hair', 'outline'].map(c), bevel: 1, inner: 'line', shadow: false });
      // the stitched scar over the viewer-left brow
      for (let k = 0; k < 6; k++) cv.px(fx - 8 + k, fy - 7 + (k >> 1), c('skinHi'));
      for (const k of [1, 3, 5]) { cv.px(fx - 8 + k, fy - 8 + (k >> 1), c('outline')); cv.px(fx - 8 + k, fy - 6 + (k >> 1), c('outline')); }
    },
    torso(ctx) {
      const { cv, J, c, pose } = ctx;
      if (pose.lying) return;
      // the bolt tattoo: from the viewer-right shoulder down across the chest
      const R = J.shR, ch = J.chest;
      const pts = [[R[0] - 2, R[1] + 1], [ch[0] + 2, ch[1] - 4], [ch[0] + 7, ch[1] - 3], [ch[0] - 4, ch[1] + 8]];
      for (let k = 0; k < pts.length - 1; k++) cv.line(pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1], (X, Y) => { cv.px(X, Y, c('goldDk')); cv.px(X, Y - 1, c('gold')); });
    },
  },
};
