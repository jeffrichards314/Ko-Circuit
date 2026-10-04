// The Warden: sprite layers on the heavy build.
// LOCKDOWN (round 1): a grey flat-top, a heavy grey mustache, cold narrow eyes
// and a scar across the chin. A pressed navy uniform shirt with epaulettes,
// breast pockets, a brass star badge and a brass whistle on a chain; black
// trunks with a duty belt and a ring of brass keys on his hip; navy gloves.
// RIOT (rounds 2-3, palette 'warden.riot'): the shirt is gone. It's a palette
// swap: every shirt colour becomes his skin, the seams become muscle lines, and
// the prison ink that was hidden under the uniform shows up (the 'ink' keys are
// shirt- or skin-coloured in LOCKDOWN): barbed wire round both arms, a web on
// his shoulder, LIFER across his gut, a teardrop under his eye, and the badge
// turns out to be a tattooed star. The Warden was a lifer.
// Poses: the whistle (HEADCOUNT), jingling the keys (taunt), SOLITARY (cuffed
// fists raised, then slammed down), the BREAKOUT charge.

import { makePalette, swapPalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './_face.js';
import { drawText, textWidth } from '../../../src/engine/font.js';

const A = makePalette('warden.A', {
  outline: [2, 2, 4],
  skinHi: [30, 22, 17], skin: [25, 16, 12], skinSh: [18, 10, 8], skinDk: [10, 5, 5],
  white: [31, 31, 30], mouth: [12, 2, 4],
  hairHi: [27, 27, 28], hair: [18, 18, 20],
  gloveHi: [14, 16, 24], glove: [6, 8, 16], gloveDk: [3, 4, 9],
  brass: [28, 22, 8], brassDk: [17, 11, 3],
});
const B = makePalette('warden.B', {
  shirtHi: [12, 16, 26], shirt: [7, 10, 19], shirtSh: [4, 6, 12], shirtDk: [2, 3, 7],
  seam: [3, 5, 11],
  badge: [29, 24, 9], badgeDk: [18, 12, 3],
  inkShirt: [7, 10, 19],   // hidden on the shirt
  inkSkin: [25, 16, 12],   // hidden on the skin
  trunkHi: [8, 8, 10], trunk: [4, 4, 6], trunkDk: [2, 2, 3],
  bootHi: [8, 8, 9], boot: [3, 3, 4],
});
// RIOT: shirt off, ink showing
const INK = [4, 10, 14];
const riotB = swapPalette('warden.riotB', B, {
  shirtHi: A.spec.skinHi, shirt: A.spec.skin, shirtSh: A.spec.skinSh, shirtDk: A.spec.skinDk,
  seam: A.spec.skinSh, badge: INK, badgeDk: INK, inkShirt: INK, inkSkin: INK,
});
export const palettes = { warden: { A, B }, 'warden.riot': { A, B: riotB } };

const poses = {
  // HEADCOUNT: the whistle to his lips, the other glove pointing at you
  whistle1: {
    extends: 'idle1',
    head: { at: [1, -100], face: 'focus', look: [0, 0] },
    elL: [-22, -80], fiL: [-3, -92], gloveL: { angle: 70 },
    elR: [30, -68], fiR: [30, -84], gloveR: { angle: -10, view: 'back' },
  },
  whistle2: { extends: 'whistle1', shift: [0, -1], fiR: [31, -86], head: { at: [1, -101], face: 'strain', look: [0, 0] } },
  // taunt: the keys, jingled at you
  keys1: {
    extends: 'idle1',
    head: { at: [0, -100], face: 'grin', look: [1, 0] },
    elR: [30, -76], fiR: [26, -96], gloveR: { angle: 20 },
    elL: [-24, -60], fiL: [-12, -72],
  },
  keys2: { extends: 'keys1', fiR: [28, -94], elR: [31, -74] },
  // SOLITARY: fists clasped like cuffed hands, raised over the right shoulder...
  cuffTell1: {
    extends: 'idle1', shift: [2, 0],
    head: { at: [-1, -99], face: 'focus', look: [1, -1] },
    elL: [-6, -92], fiL: [12, -110], elR: [30, -94], fiR: [18, -112],
    gloveL: { angle: 50 }, gloveR: { angle: -30 },
    frontOrder: ['R', 'L'],
  },
  cuffTell2: {
    extends: 'cuffTell1', shift: [1, -1],
    elL: [-4, -96], fiL: [14, -116], elR: [32, -98], fiR: [20, -118],
  },
  // ...and hammered down
  cuffSlam: {
    extends: 'idle1', shift: [-2, 4],
    head: { at: [-2, -95], face: 'strain', look: [0, 1] },
    elL: [-22, -68], fiL: [-4, -56], elR: [16, -70], fiR: [4, -58],
    gloveL: { view: 'front', size: 1.3 }, gloveR: { view: 'front', size: 1.3 },
    knL: [-16, -18], knR: [16, -18],
  },
  // BREAKOUT: shoulder down, about to charge... and the charge itself
  charge: {
    extends: 'chargeTell', shift: [4, 6],
    head: { at: [-2, -86], face: 'strain', look: [0, 2] },
    shL: [-22, -74], elL: [-30, -60], fiL: [-14, -58], gloveL: { view: 'front', size: 1.3 },
    knL: [-18, -16], knR: [16, -18],
  },
  // BREAKOUT: shoulder down, about to charge
  chargeTell: {
    extends: 'idle1', shift: [-4, 4],
    head: { at: [-6, -93], face: 'strain', look: [-1, 1] },
    chest: [-4, -68], neck: [-5, -83],
    shL: [-24, -76], shR: [16, -80],
    elL: [-28, -58], fiL: [-16, -64], elR: [24, -60], fiR: [14, -70],
    knL: [-18, -18], knR: [14, -22], ftL: [-20, 0], ftR: [18, 0],
  },
};

export default {
  id: 'warden',
  build: 'heavy',
  // his own body on the build: a big square prison guard
  body: { torsoLen: 1.06, shoulders: 1.06, dims: { belly: 7 } },
  palettes: { default: 'warden' },
  torsoMaterial: 'shirt',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['brass', 'brass', 'brassDk'],
    shorts: ['trunkHi', 'trunk', 'trunkDk'],
    sock: ['bootHi', 'boot', 'outline'],
    boot: ['bootHi', 'boot', 'outline'],
    sole: ['boot', 'outline', 'outline'],
    hair: ['hairHi', 'hair', 'outline'],
    shirt: ['shirtHi', 'shirt', 'shirtSh', 'shirtDk'],
    brass: ['brass', 'brass', 'brassDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    ears(ctx, H, ramps.skin, [2.4, 3.4]);
    const hm = skull(ctx, H, ramps.skin, 'square');
    // grey flat-top: a flat brush of hair squared off on top
    const ft = ctx.mask().rect(x - H.rx + 1.5 + lx * 0.3, y - H.ry - 2, H.rx * 2 - 3, 8).clip(ctx.mask().ellipse(x + lx * 0.3, y - 2, H.rx + 1, H.ry + 3));
    ft.cut(ctx.mask().rect(x - 20, y - 5, 40, 20));
    cv.part(ft, { ramp: ramps.hair, bevel: 1, inner: 'line' });
    for (let X = x - 9; X <= x + 9; X += 2) { cv.px(X + lx * 0.3, y - H.ry - 1, c('hairHi')); cv.px(X + 1 + lx * 0.3, y - H.ry + 2, c('outline')); cv.px(X + lx * 0.3, y - H.ry + 3, c('hairHi')); }
    eyes(ctx, fx, fy, face === 'neutral' ? 'focus' : face, 0);
    brows(ctx, fx, fy, face, ramps.hair, { len: 4.8, thick: 1.3, y: -3.8 });
    nose(ctx, fx, fy, ramps.skin, [2.6, 2.3], 3.6);
    // the heavy grey mustache
    const mu = ctx.mask().ellipse(fx - 3.6, fy + 7, 4.2, 1.9, 1, -0.15).ellipse(fx + 3.6, fy + 7, 4.2, 1.9, 1, 0.15);
    cv.part(mu, { ramp: ramps.hair, bevel: 1, inner: 'line' });
    mouth(ctx, fx, fy + 9, face, { w: 3 });
    // scar across the chin
    for (let k = 0; k < 4; k++) if (hm.in(fx - 4 + k, fy + 12 - (k >> 1))) cv.px(fx - 4 + k, fy + 12 - (k >> 1), c('skinHi'));
    // the teardrop (only ink in RIOT)
    const sk = cv.rampId(ramps.skin);
    for (const [dx, dy] of [[-6, 3], [-6, 4]]) { const i = (fy + dy) * cv.w + fx + dx; if (cv.ramp[i] === sk && cv.lvl[i] === 1) cv.px(fx + dx, fy + dy, c('inkSkin')); }
  },

  torso(ctx) {
    const { cv, J, c, D, pose, ramps } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, h = J.hip, sL = J.shL, sR = J.shR;
    const tm = ctx.torsoMask;
    const shirt = cv.rampId(ramps.shirt);
    const flat = (X, Y) => { X = Math.round(X); Y = Math.round(Y); const i = Y * cv.w + X; return tm.in(X, Y) && cv.ramp[i] === shirt && cv.lvl[i] === 1; };
    // open collar: a V of skin at the neck
    if (!pose.lying) cv.part(ctx.mask().poly([[n[0] - 6, n[1] - 1], [n[0] + 6, n[1] - 1], [n[0], n[1] + 8]]).clip(tm), { ramp: ramps.skin, bevel: 2, inner: 'soft', shadow: false });
    // seams: button placket, pockets, epaulettes
    for (let Y = Math.round(n[1] + 8); Y < w[1] - 1; Y++) if (tm.in(Math.round(n[0]), Y)) cv.px(n[0], Y, c('seam'));
    for (let Y = Math.round(n[1] + 12); Y < w[1] - 2; Y += 5) if (tm.in(Math.round(n[0]) + 1, Y)) cv.px(n[0] + 1, Y, c('shirtHi'));
    if (!pose.lying) {
      for (const s of [-1, 1]) {
        const px = Math.round(ch[0] + s * 10), py = Math.round(ch[1] - 6);
        // pocket flaps (a line under the pecs, once the shirt is gone)
        for (let i = -5; i <= 5; i++) if (tm.in(px + i, py + 2 + (Math.abs(i) > 3 ? 0 : 1))) cv.px(px + i, py + 2 + (Math.abs(i) > 3 ? 0 : 1), c('seam'));
        if (tm.in(px, py + 4)) cv.px(px, py + 4, c('shirtHi'));
        const sh = s < 0 ? sL : sR;
        for (let k = -4; k <= 4; k++) if (tm.in(Math.round(sh[0] + k * 0.3), Math.round(sh[1] - 4 + k * 0.2))) cv.px(sh[0] + k * 0.3, sh[1] - 4 + k * 0.2, c('seam'));
      }
      // the star badge on his left breast (a tattooed star, once the shirt is off)
      const bx = Math.round(ch[0] + 10), by = Math.round(ch[1] - 13);
      cv.stamp(['..#..', '#####', '.###.', '.#.#.'], bx - 2, by, { '#': c('badge') });
      cv.px(bx, by + 1, c('badgeDk'));
      // the whistle on a brass chain
      for (let k = 0; k <= 8; k++) { const X = Math.round(n[0] - 6 - k * 0.6), Y = Math.round(n[1] + 2 + k * 1.3); if (tm.in(X, Y)) cv.px(X, Y, c(k & 1 ? 'brass' : 'brassDk')); }
      const wx = Math.round(n[0] - 12), wy = Math.round(n[1] + 13);
      cv.part(ctx.mask().rect(wx - 2, wy, 5, 3), { ramp: ramps.brass, bevel: 1, inner: 'line', shadow: false });
      // prison ink, hidden under the uniform: a web on his right shoulder, LIFER across his gut
      const cx = Math.round(sL[0] + 8), cy = Math.round(sL[1] + 4);
      for (let a = 0; a < 5; a++) { const t = Math.PI * (0.05 + a * 0.22); cv.line(cx, cy, cx + Math.cos(t) * 11, cy + Math.sin(t) * 11, (X, Y) => { if (flat(X, Y)) cv.px(X, Y, c('inkShirt')); }); }
      for (const r of [4, 8]) for (let k = 0; k <= 12; k++) { const t = Math.PI * (0.05 + k * 0.074); if (flat(cx + Math.cos(t) * r, cy + Math.sin(t) * r)) cv.px(cx + Math.cos(t) * r, cy + Math.sin(t) * r, c('inkShirt')); }
      drawText({ px: (X, Y) => { if (flat(X, Y)) cv.px(X, Y, c('inkShirt')); } }, 'LIFER', Math.round(w[0] - textWidth('LIFER', false) / 2), Math.round(w[1] - 12), 0, { mono: false });
    }
    // duty belt with a brass buckle, and the key ring on his hip
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, w[1] - 4, D.waistW * 2 + 2, 4).clip(ctx.shortsMask), { ramp: ['trunkHi', 'trunkDk', 'outline'].map(c), bevel: 1, inner: 'line', shadow: false });
    cv.part(ctx.mask().rect(w[0] - 3, w[1] - 4, 6, 4), { ramp: ramps.brass, bevel: 1, inner: 'line', shadow: false });
    if (!pose.lying) {
      const kx = Math.round(h[0] + D.hipSpread + 8), ky = Math.round(w[1] + 1);
      for (let a = 0; a < 12; a++) { const t = (a / 12) * Math.PI * 2; cv.px(kx + Math.round(Math.cos(t) * 2.5), ky + Math.round(Math.sin(t) * 2.5), c('brass')); }
      for (const [dx, len] of [[-2, 5], [0, 6], [2, 4]]) for (let k = 0; k < len; k++) cv.px(kx + dx, ky + 3 + k, c(k === len - 1 ? 'brassDk' : 'brass'));
    }
  },

  // barbed wire round both upper arms (skin-coloured in LOCKDOWN)
  front(ctx) {
    const { cv, J, c, ramps, pose } = ctx;
    if (pose.lying) return;
    const skin = cv.rampId(ramps.skin);
    for (const s of ['L', 'R']) {
      const sh = J['sh' + s], el = J['el' + s];
      const cx = sh[0] + (el[0] - sh[0]) * 0.55, cy = sh[1] + (el[1] - sh[1]) * 0.55;
      const len = Math.hypot(el[0] - sh[0], el[1] - sh[1]) || 1;
      const ux = -(el[1] - sh[1]) / len, uy = (el[0] - sh[0]) / len; // across the arm
      for (let k = -9; k <= 9; k++) {
        const X = Math.round(cx + ux * k + ((k & 1) ? (el[0] - sh[0]) / len : 0)), Y = Math.round(cy + uy * k + ((k & 1) ? (el[1] - sh[1]) / len : 0));
        const i = Y * cv.w + X;
        if (X >= 0 && Y >= 0 && X < cv.w && Y < cv.h && cv.ramp[i] === skin && cv.lvl[i] === 1) cv.px(X, Y, c('inkSkin'));
      }
    }
  },
  // Title Defense, MAXIMUM SECURITY: riot gear. A black riot helmet with the
  // visor pushed up and a black tactical vest with pouches (it stays on when the
  // shirt comes off in the riot).
  remix: {
    colors: { A: { visor: [19, 25, 31] } },
    ramps: { riot: ['bootHi', 'boot', 'outline'], plate: ['trunkHi', 'trunk', 'trunkDk'] },
    head(ctx, H) {
      const { cv, ramps, c } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.3), y = Math.round(H.y) + (H.tilt === 'up' ? -1 : H.tilt === 'down' ? 1 : 0);
      const hel = ctx.mask().ellipse(x, y - 6, H.rx + 2.5, H.ry - 1).cut(ctx.mask().rect(x - 20, y - 3, 40, 20)).rect(x - H.rx - 2.5, y - 5, 4, 9).rect(x + H.rx - 1.5, y - 5, 4, 9);
      cv.part(hel, { ramp: ramps.riot, bevel: 3 });
      // the visor, pushed up over the brow of the helmet
      const vi = ctx.mask().rect(x - H.rx, y - 14, H.rx * 2, 5).ellipse(x, y - 14, H.rx, 2);
      cv.part(vi, { ramp: ['white', 'visor', 'gloveHi'].map(c), bevel: 1, inner: 'line', shadow: false });
      cv.px(x - 5, y - 13, c('white')); cv.px(x - 4, y - 13, c('white'));
    },
    torso(ctx) {
      const { cv, J, D, ramps, c, pose } = ctx;
      const ch = J.chest, w = J.waist, n = J.neck;
      const vest = ctx.mask().poly([[n[0] - 9, n[1] + 3], [n[0] + 9, n[1] + 3], [ch[0] + D.chestW - 3, ch[1] - 4], [w[0] + D.waistW - 1, w[1] - 3], [w[0] - D.waistW + 1, w[1] - 3], [ch[0] - D.chestW + 3, ch[1] - 4]]).clip(ctx.torsoMask);
      cv.part(vest, { ramp: ramps.plate, bevel: 4 });
      if (pose.lying) return;
      // pouches along the bottom, a radio clip high on the chest
      for (const dx of [-12, -4, 4, 12]) cv.part(ctx.mask().rect(w[0] + dx - 3, w[1] - 11, 6, 7), { ramp: ramps.riot, bevel: 1, inner: 'line', shadow: false });
      cv.part(ctx.mask().rect(ch[0] + 7, ch[1] - 9, 4, 7), { ramp: ramps.riot, bevel: 1, inner: 'line', shadow: false });
      cv.px(ch[0] + 9, ch[1] - 11, c('brass'));
    },
  },
};
