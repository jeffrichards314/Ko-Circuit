// ZERO, true form (Phase E; redrawn 2026-09-30 to be nothing like the first): where the first ZERO is a black figure with a white ring, the
// true form is the negative and worse. A porcelain-white body cracked all over with black, bigger and longer than any fighter, the shoulders
// wide and the waist pinched; a blank white mask split down the middle by a crack, one black slit for both eyes with a cold light in it;
// a hole of nothing in his chest with stars in it and a white ring round it; a crown of white shards turning over his head. Black gloves,
// black trunks with a cold band, black boots.
// His signature poses are the first ZERO's (`champion:pose`); palettes `zero.<champion>` tint him in a champion's colour for the echoes.
import zeroLayers, { palettes as zp } from '../zero.js';
import { swapPalette } from '../../../../src/engine/palette.js';

const ramp = ([r, g, b], k) => [r, g, b].map((v) => Math.max(0, Math.min(31, Math.round(k < 1 ? v * k : v + (31 - v) * (k - 1)))));
export const NEW_ECHO_COLORS = {
  aurora: [31, 22, 8], cirrus: [14, 22, 31], oldguard: [30, 26, 12], nebula: [24, 10, 31], hale: [31, 12, 4], prism: [26, 31, 31],
  moros: [12, 26, 24], soot: [31, 14, 6], jailer: [19, 20, 26], crucible: [31, 22, 8], rho: [31, 29, 14],
};
const palettes = {
  // the true form: white where the first was black, black where he was white
  zeroTrue: {
    A: swapPalette('zeroTrue.A', zp.zero.A, { skinHi: [31, 31, 31], skin: [27, 27, 30], skinSh: [19, 19, 24], skinDk: [10, 10, 15], white: [0, 0, 1], glow: [16, 29, 31], gloveHi: [9, 9, 13], glove: [3, 3, 5], gloveDk: [1, 1, 2] }),
    B: swapPalette('zeroTrue.B', zp.zero.B, { trunkHi: [8, 8, 12], trunk: [2, 2, 4], trunkDk: [0, 0, 1], bootHi: [8, 8, 12], boot: [2, 2, 4] }),
  },
};
// the counter test's flash: all of him bleached white
const W = [31, 31, 31], G = [26, 27, 31];
// (he is white already: his flash turns him black, the cracks and the slit burning white)
const K = [1, 1, 2], K2 = [5, 5, 8];
palettes['zeroTrue.flash'] = {
  A: swapPalette('zeroTrue.flash.A', palettes.zeroTrue.A, { skinHi: K2, skin: K, skinSh: K, skinDk: K, gloveHi: W, glove: G, gloveDk: [16, 17, 22], white: W, glow: W }),
  B: swapPalette('zeroTrue.flash.B', zp.zero.B, { trunkHi: W, trunk: G, trunkDk: [16, 17, 22], bootHi: W, boot: G }),
};
for (const [id, col] of Object.entries(NEW_ECHO_COLORS)) {
  const hi = ramp(col, 1.35), mid = ramp(col, 1), sh = ramp(col, 0.6), dk = ramp(col, 0.32);
  palettes['zero.' + id] = {
    A: swapPalette(`zero.${id}.A`, zp.zero.A, { skinHi: hi, skin: mid, skinSh: sh, skinDk: dk, gloveHi: hi, glove: sh, gloveDk: dk }),
    B: swapPalette(`zero.${id}.B`, zp.zero.B, { trunkHi: sh, trunk: dk, trunkDk: ramp(col, 0.18), bootHi: sh, boot: dk }),
  };
}
export { palettes };
// cracks: fixed lines across the body (relative to the neck and the waist), drawn where his skin is
const CRACKS = [[[-9, 4], [-4, 10], [-7, 17], [-3, 24]], [[10, 6], [6, 12], [9, 19]], [[2, 30], [5, 36], [1, 42]], [[-6, 34], [-10, 40]]];
const line = (cv, mask, a, b, col) => { const n = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])) || 1; for (let i = 0; i <= n; i++) { const X = Math.round(a[0] + ((b[0] - a[0]) * i) / n), Y = Math.round(a[1] + ((b[1] - a[1]) * i) / n); if (!mask || mask.in(X, Y)) cv.px(X, Y, col); } };

export default {
  ...zeroLayers,
  id: 'zeroTrue',
  palettes: { default: 'zeroTrue' },
  // bigger than anyone: tall, the shoulders wide and the waist pinched, long arms, big fists
  body: { size: [1.2, 1.16], shoulders: 1.12, legLen: 1.04, neckLen: 1.5,
    dims: { chestW: 22.5, deltoid: 7.8, waistW: 12.5, belly: 2, upperArm: [6.6, 5], forearm: [5.6, 4.4], glove: [8.6, 10.2], thigh: [7.8, 5.4], shin: [5.2, 3.8] } },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y), [lx, ly] = H.look, fx = x + lx, fy = y + ly, face = H.face || 'neutral';
    zeroLayers.head.call(this, { ...ctx, c: (k) => (k === 'white' || k === 'glow' ? c('skin') : c(k)) }, H); // (the blank head, without the first ZERO's line)
    // the crack down the mask
    for (let j = -Math.round(H.ry) + 1; j < Math.round(H.ry); j++) cv.px(fx + ((j >> 2) & 1) - (j > 4 ? 1 : 0), fy + j, c('outline'));
    // one black slit across both eyes with a cold light moving in it (shut when he is hurt, gone when he is out)
    if (face !== 'ko') {
      const hurt = ['hurt', 'dazed'].includes(face);
      for (let i = -7; i <= 7; i++) { cv.px(fx + i, fy - 1, c('white')); if (Math.abs(i) < 6) cv.px(fx + i, fy, c('white')); }
      if (!hurt) { cv.px(fx + 2 + lx, fy - 1, c('glow')); cv.px(fx + 3 + lx, fy - 1, c('glow')); }
    }
    // the crown: seven white shards standing in an arc over his head, the middle one tallest, cold light at their tips
    const HS = [8, 11, 14, 18, 14, 11, 8];
    for (let k = 0; k < 7; k++) {
      const a = Math.PI + ((k + 0.5) / 7) * Math.PI, sx = Math.round(x + Math.cos(a) * (H.rx + 5)), base = Math.round(y - H.ry * 0.55 + Math.sin(a) * (H.ry + 4)), h = HS[k];
      for (let j = 0; j < h; j++) {
        const w = Math.round((j / h) * 1.6), Y = base - h + j;
        for (let i = -w - 1; i <= w + 1; i++) cv.px(sx + i, Y, c(Math.abs(i) > w ? 'outline' : j < 2 ? 'glow' : i < 0 ? 'skinHi' : 'skinSh'));
      }
      cv.px(sx, base - h - 1, c('outline'));
    }
    void ramps;
  },

  torso(ctx) {
    const { cv, J, c, D, pose } = ctx;
    const n = J.neck, w = J.waist, tm = ctx.torsoMask;
    if (!pose.lying) {
      // black cracks running out over the body
      for (const L of CRACKS) for (let i = 1; i < L.length; i++) {
        const A2 = [n[0] + L[i - 1][0], n[1] + L[i - 1][1]], B2 = [n[0] + L[i][0], n[1] + L[i][1]];
        line(cv, tm, [A2[0] + 1, A2[1]], [B2[0] + 1, B2[1]], c('outline')); line(cv, tm, A2, B2, c('glow'));
      }
      // the hole in his chest: nothing, with stars in it, and a white ring round it
      const cx = n[0], cy = n[1] + 15;
      for (let y = -7; y <= 7; y++) for (let x = -7; x <= 7; x++) { const d = Math.hypot(x, y * 0.85); const X = cx + x, Y = cy + y; if (!tm.in(X, Y)) continue; if (d < 5.2) cv.px(X, Y, c('white')); else if (d < 6.4) cv.px(X, Y, c('glow')); else if (d < 7.2) cv.px(X, Y, c('skinDk')); }
      for (const [x, y] of [[-2, -2], [2, 1], [-1, 3], [3, -3]]) if (tm.in(cx + x, cy + y)) cv.px(cx + x, cy + y, c('skinHi'));
    }
    // a cold band at the waist
    for (let X = Math.round(w[0] - D.waistW); X <= w[0] + D.waistW; X++) if (ctx.shortsMask.in(X, Math.round(w[1] - 2))) cv.px(X, w[1] - 2, c('glow'));
  },
};
