// King Karver: sprite layers on the heavy build.
// The old king: salt-and-pepper hair and a thick trimmed beard, a battered gold
// crown with a ruby, old scars on the brow, a crimson cape with an ermine
// collar thrown back over the shoulders, crimson trunks with a gold belt and a
// gold lion, black boots with gold trim, gold gloves.
// Poses: the taunt ("kneel", a glove pointing down at the canvas), the throne
// (victory: arms folded, chin up).

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './_face.js';

const A = makePalette('karver.A', {
  outline: [3, 2, 3],
  skinHi: [30, 23, 18], skin: [25, 16, 12], skinSh: [18, 10, 9], skinDk: [10, 5, 5],
  white: [31, 31, 30], mouth: [12, 2, 4],
  hairHi: [27, 27, 27], hair: [17, 17, 18], hairDk: [8, 8, 9],
  gloveHi: [31, 29, 14], glove: [29, 21, 4], gloveDk: [19, 12, 2],
  ruby: [28, 3, 8],
});
const B = makePalette('karver.B', {
  capeHi: [27, 5, 8], cape: [18, 2, 5], capeDk: [9, 1, 3],
  ermine: [31, 31, 30], ermineSh: [22, 22, 24],
  bootHi: [9, 8, 10], boot: [4, 3, 5],
});
export const palettes = { karver: { A, B } };

const poses = {
  // "KNEEL." A glove pointed down at the canvas in front of him
  beckon1: {
    extends: 'idle1',
    head: { at: [0, -101], face: 'focus', tilt: 'up', look: [0, 1] },
    elR: [32, -66], fiR: [34, -48], gloveR: { angle: 175 },
    elL: [-24, -60], fiL: [-12, -72],
  },
  beckon2: { extends: 'beckon1', fiR: [33, -45], head: { at: [0, -101], face: 'grin', tilt: 'up', look: [0, 1] } },
  // victory: arms folded, chin up
  throne: {
    extends: 'idle1',
    head: { at: [0, -101], face: 'grin', tilt: 'up', look: [0, -1] },
    elL: [-26, -66], fiL: [8, -70], gloveL: { angle: 90 },
    elR: [26, -64], fiR: [-8, -66], gloveR: { angle: -90 },
    frontOrder: ['R', 'L'],
  },
};

export default {
  id: 'karver',
  build: 'heavy',
  // his own body on the build: an old king: broad, with a royal belly
  body: { shoulders: 1.04, dims: { belly: 9 } },
  palettes: { default: 'karver' },
  torsoMaterial: 'skin',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['ermine', 'ermine', 'ermineSh'],
    shorts: ['capeHi', 'cape', 'capeDk'],
    sock: ['bootHi', 'boot', 'outline'],
    boot: ['bootHi', 'boot', 'outline'],
    sole: ['gloveDk', 'outline', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    gold: ['gloveHi', 'glove', 'gloveDk'],
    cape: ['capeHi', 'cape', 'capeDk', 'outline'],
    ermine: ['ermine', 'ermine', 'ermineSh'],
  },

  // the cape, thrown back behind the shoulders
  back(ctx) {
    const { cv, J, D, ramps, pose } = ctx;
    if (pose.lying) return;
    const sL = J.shL, sR = J.shR, h = J.hip;
    const m = ctx.mask().poly([
      [sL[0] - 2, sL[1] - 4], [sR[0] + 2, sR[1] - 4],
      [sR[0] + D.deltoid + 7, h[1] + 14], [h[0] + 4, h[1] + 18], [sL[0] - D.deltoid - 7, h[1] + 14],
    ]);
    cv.part(m, { ramp: ramps.cape, bevel: 3, inner: 'line' });
    for (const s of [-1, 1]) cv.line(J.chest[0] + s * (D.chestW + 1), J.chest[1] + 4, J.chest[0] + s * (D.chestW + 6), h[1] + 14, (X, Y) => { if (m.in(X, Y)) cv.shade(X, Y, 1); });
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';
    const open = ['strain', 'hurt', 'wide'].includes(face);
    const cy = y + (H.tilt === 'up' ? -1 : H.tilt === 'down' ? 1 : 0);

    // swept-back grey hair behind the ears
    cv.part(ctx.mask().ellipse(x + lx * 0.3, y + 1, H.rx + 1.6, H.ry - 3).cut(ctx.mask().rect(x - 20, y - 20, 40, 14)), { ramp: ramps.hair, bevel: 3, inner: 'line' });
    ears(ctx, H, ramps.skin, [2.4, 3.4]);
    const hm = skull(ctx, H, ramps.skin, 'square');
    const hr = ctx.mask().ellipse(x + lx * 0.3, y - 6, H.rx + 0.6, 6.5).cut(ctx.mask().rect(x - 16, y - 4, 32, 14));
    cv.part(hr, { ramp: ramps.hair, bevel: 2, inner: 'line' });
    for (const dx of [-7, -3, 1, 5]) cv.line(x + dx, y - 11, x + dx + 3, y - 5, (X, Y) => { if (hr.in(X, Y)) cv.px(X, Y, c((X + Y) & 1 ? 'hairHi' : 'hairDk')); });
    // the crown: a gold band with five points and a ruby (the remix is re-crowned: see remix)
    if (ctx.layers.remixed) ctx.crownY = cy;
    else {
      const cr = ctx.mask().rect(x - H.rx + 1 + lx * 0.3, cy - 13, H.rx * 2 - 2, 4);
      for (const i of [-8, -4, 0, 4, 8]) cr.poly([[x + i - 2 + lx * 0.3, cy - 12], [x + i + lx * 0.3, cy - 17 - (i === 0 ? 2 : 0)], [x + i + 2 + lx * 0.3, cy - 12]]);
      cv.part(cr, { ramp: ramps.gold, bevel: 1, inner: 'line' });
      cv.px(x + lx * 0.3, cy - 11, c('ruby')); cv.px(x + lx * 0.3 + 1, cy - 11, c('ruby'));
      for (const i of [-6, 6]) cv.px(x + i + lx * 0.3, cy - 11, c('white'));
      cv.px(x - 5 + lx * 0.3, cy - 12, c('outline')); // a dent
    }
    eyes(ctx, fx, fy, face, 0);
    brows(ctx, fx, fy, face, ramps.hair, { len: 5, thick: 1.4, y: -4 });
    for (let k = 0; k < 3; k++) cv.px(fx + 6 + k, fy - 7 + k, c('skinDk')); // an old scar
    nose(ctx, fx, fy, ramps.skin, [2.6, 2.4], 3.6);
    // the trimmed beard and mustache
    const bd = ctx.mask().ellipse(fx, fy + 9.5, H.rx - 0.5, 6).cut(ctx.mask().rect(fx - 20, fy - 6, 40, 11));
    bd.rect(x - Math.round(H.rx) + 1, y + 1, 3, 7).rect(x + Math.round(H.rx) - 4, y + 1, 3, 7);
    const mo = ctx.mask().ellipse(fx, fy + 9, 3, 1.6);
    if (open) bd.cut(mo);
    cv.part(bd, { ramp: ramps.hair, bevel: 3, inner: 'line' });
    if (open) { cv.flat(mo, c('mouth'), true); for (let i = -1; i <= 1; i++) cv.px(fx + i, fy + 8, c('white')); }
    else for (let i = -2; i <= 2; i++) cv.px(fx + i, fy + 9, c('outline'));
    cv.part(ctx.mask().ellipse(fx - 3.4, fy + 6.8, 4, 1.7, 1, -0.2).ellipse(fx + 3.4, fy + 6.8, 4, 1.7, 1, 0.2), { ramp: ramps.hair, bevel: 1, inner: 'line', shadow: false });
    for (let Y = fy + 10; Y < fy + 15; Y++) for (let X = fx - 8; X <= fx + 8; X++) if (bd.in(X, Y) && (X + Y) % 3 === 0) cv.px(X, Y, c('hairHi'));
  },

  torso(ctx) {
    const { cv, J, c, D, ramps, pose } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, h = J.hip;
    const tm = ctx.torsoMask;
    // grey chest hair, old scars
    for (let Y = Math.round(ch[1] - 4); Y < ch[1] + 6; Y++) for (let X = Math.round(ch[0] - 6); X <= ch[0] + 6; X++) if (tm.in(X, Y) && (X * 3 + Y * 7) % 5 === 0) cv.px(X, Y, c('hair'));
    for (const s of [-1, 1]) cv.line(ch[0] + s * 3, ch[1] + 6, ch[0] + s * (D.chestW - 6), ch[1] + 5, (X, Y) => { if (tm.in(X, Y)) cv.shade(X, Y, 1); });
    cv.line(ch[0] + 10, ch[1] - 6, ch[0] + 16, ch[1] + 2, (X, Y) => { if (tm.in(X, Y)) cv.px(X, Y, c('skinHi')); });
    // the ermine collar of the cape, over the shoulders
    if (!pose.lying) {
      const col = ctx.mask();
      for (const s of ['L', 'R']) col.ellipse(J['sh' + s][0] + (s === 'L' ? -2 : 2), J['sh' + s][1] - 3, D.deltoid + 2, 4.5);
      col.cut(ctx.mask().ellipse(n[0], n[1] + 3, 10, 7));
      cv.part(col, { ramp: ramps.ermine, bevel: 2, inner: 'line' });
      for (let Y = 0; Y < col.h; Y++) for (let X = 0; X < col.w; X++) if (col.in(X, Y) && (X * 7 + Y * 3) % 11 === 0) cv.px(X, Y, c('outline'));
    }
    // gold belt and the lion
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, w[1] - 4, D.waistW * 2 + 2, 4).clip(ctx.shortsMask), { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
    if (!pose.lying) {
      const lx = Math.round(h[0] - D.hipSpread - 6), ly = Math.round(h[1] + 1);
      cv.stamp(['.gg.', 'gggg', 'g.gg', '.ggg', 'g..g'], lx - 2, ly, { g: c('glove') });
    }
  },
  // Title Defense, THE RESTORATION: re-crowned. A tall new crown with seven
  // points and an emerald and sapphires to go with the ruby, gold pauldrons on
  // both shoulders, and a heavy gold chain of office across his chest.
  remix: {
    colors: { B: { emerald: [4, 24, 10], sapphire: [6, 12, 30] } },
    head(ctx, H) {
      const { cv, ramps, c } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.3), cy = ctx.crownY ?? Math.round(H.y);
      const cr = ctx.mask().rect(x - H.rx, cy - 14, H.rx * 2, 6);
      for (const i of [-9, -6, -3, 0, 3, 6, 9]) cr.poly([[x + i - 1.8, cy - 13], [x + i, cy - 22 - (i === 0 ? 4 : Math.abs(i) === 3 ? 2 : 0)], [x + i + 1.8, cy - 13]]);
      cv.part(cr, { ramp: ramps.gold, bevel: 1, inner: 'line' });
      for (const i of [-9, -3, 3, 9]) cv.px(x + i, cy - 21 - (Math.abs(i) === 3 ? 2 : 0), c('white'));
      cv.px(x, cy - 11, c('ruby')); cv.px(x + 1, cy - 11, c('ruby'));
      cv.px(x - 5, cy - 11, c('emerald')); cv.px(x + 5, cy - 11, c('sapphire')); cv.px(x - 8, cy - 11, c('sapphire')); cv.px(x + 8, cy - 11, c('emerald'));
    },
    torso(ctx) {
      const { cv, J, ramps, c, pose } = ctx;
      if (pose.lying) return;
      for (const s of ['L', 'R']) {
        const sh = J['sh' + s];
        cv.part(ctx.mask().ellipse(sh[0], sh[1] - 1, 7.5, 5), { ramp: ramps.gold, bevel: 3, inner: 'line' });
        cv.px(sh[0], sh[1] - 1, c('ruby'));
      }
      // the chain of office, in a swag across the chest
      const L = J.shL, R = J.shR, ch = J.chest;
      for (let k = 0; k <= 12; k++) {
        const t = k / 12, x = L[0] + 4 + (R[0] - L[0] - 8) * t, y = L[1] + 5 + Math.sin(t * Math.PI) * (ch[1] - L[1] + 4);
        cv.part(ctx.mask().ellipse(x, y, 1.6, 1.6), { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
      }
      const mx = Math.round((L[0] + R[0]) / 2), my = Math.round(L[1] + 5 + (ch[1] - L[1] + 4) + 3);
      cv.part(ctx.mask().ellipse(mx, my, 3.4, 3.8), { ramp: ramps.gold, bevel: 2, inner: 'line' });
      cv.px(mx, my, c('ruby'));
    },
  },
};
