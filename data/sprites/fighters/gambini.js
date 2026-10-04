// The Great Gambini: sprite layers on the lean build.
// Stage magician: tall silk top hat with a red band, slicked hair, waxed
// curled mustache and a pointed goatee, arched villain brows. White dress shirt
// with the sleeves rolled DOWN (nothing up them), purple waistcoat, red bow tie,
// a cape with a red lining behind him, black satin trunks with gold stars,
// white gloves. Real tricks sparkle on the glove; feints don't.

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './_face.js';

const A = makePalette('gambini.A', {
  outline: [3, 1, 5],
  skinHi: [31, 27, 23], skin: [28, 21, 17], skinSh: [21, 14, 12], skinDk: [12, 7, 8],
  white: [31, 31, 31], mouth: [14, 2, 6],
  hairHi: [11, 9, 16], hair: [4, 3, 7],
  gloveHi: [31, 31, 31], glove: [26, 25, 30], gloveDk: [16, 14, 23],
  spark: [31, 29, 9], shirtSh: [21, 22, 27],
});
const B = makePalette('gambini.B', {
  hatHi: [10, 8, 15], hat: [4, 3, 7],
  capeHi: [9, 6, 16], cape: [5, 3, 10], capeDk: [2, 1, 5],
  liningHi: [30, 9, 11], lining: [22, 3, 6], liningDk: [12, 1, 4],
  vestHi: [22, 12, 30], vest: [14, 5, 22], vestDk: [7, 2, 13],
  gold: [30, 24, 6],
});
export const palettes = { gambini: { A, B } };

// Real tricks carry a sparkle on the leading glove; feints reuse the plain tell.
const poses = {
  prestoTell: { extends: 'jabTell', sparkle: 'L' },
  hatTrickTell: { extends: 'hookTell', sparkle: 'R' },
  abraTell1: { extends: 'upperTell', sparkle: 'R' },
  abraTell2: { extends: 'upperTell', shift: [0, 1], sparkle: 'R2' },
  bow: {
    extends: 'idle1', shift: [0, 5],
    head: { at: [2, -86], face: 'grin', tilt: 'down', look: [1, 2] },
    chest: [2, -66], neck: [2, -78], shL: [-17, -73], shR: [21, -73],
    elL: [-30, -62], fiL: [-42, -70], elR: [22, -54], fiR: [6, -60],
    gloveL: { angle: -70 }, gloveR: { angle: 100 },
  },
  tada: {
    extends: 'idle1', ...{ knL: [-13, -22], knR: [13, -22], ftL: [-16, 0], ftR: [16, 0] },
    head: { at: [0, -100], face: 'grin', look: [0, -1] },
    elL: [-34, -80], fiL: [-44, -96], elR: [34, -80], fiR: [44, -96],
    gloveL: { angle: -40 }, gloveR: { angle: 40 }, sparkle: 'both',
  },
};

export default {
  id: 'gambini',
  build: 'lean',
  // his own body on the build: a stage magician: tall, narrow and long-legged (the hat does the rest)
  body: { size: [0.95, 0.9], legLen: 1.08, torsoLen: 0.97, shoulders: 0.9, dims: { chestW: 15.5, waistW: 11.5 } },
  palettes: { default: 'gambini' },
  torsoMaterial: 'shirt',
  sleeve: { material: 'shirt', length: 0.95 },
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['white', 'white', 'shirtSh', 'gloveDk'],
    shirt: ['white', 'white', 'shirtSh', 'gloveDk'],
    shorts: ['capeHi', 'cape', 'capeDk'],
    sock: ['hairHi', 'hair', 'capeDk'],
    boot: ['hairHi', 'hat', 'outline'],
    sole: ['hairHi', 'hair', 'outline'],
    hair: ['hairHi', 'hair', 'outline'],
    hat: ['hatHi', 'hat', 'capeDk'],
    cape: ['capeHi', 'cape', 'capeDk'],
    lining: ['liningHi', 'lining', 'liningDk'],
    vest: ['vestHi', 'vest', 'vestDk', 'capeDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    ears(ctx, H, ramps.skin, [2, 3.2]);
    const hm = skull(ctx, H, ramps.skin, 'narrow');
    // slicked-back hair at the temples
    for (let j = -5; j <= 1; j++) for (const X of [x - Math.round(H.rx) + 1, x - Math.round(H.rx) + 2, x + Math.round(H.rx) - 2, x + Math.round(H.rx) - 3]) if (hm.in(X, y + j)) cv.px(X + lx * 0.3, y + j, c(j < -2 ? 'hairHi' : 'hair'));
    // hollow cheeks
    cv.shade(fx - 6, fy + 5, 1); cv.shade(fx + 5, fy + 5, 1); cv.shade(fx - 6, fy + 6, 1); cv.shade(fx + 5, fy + 6, 1);
    eyes(ctx, fx, fy, face, -2);
    // arched, villainous brows: up in the middle of each arch
    const [bi, bo] = face === 'focus' || face === 'strain' ? [1, -1] : face === 'hurt' || face === 'ko' ? [-1, 1] : [0, 0];
    const br = ctx.mask();
    for (const s of [-1, 1]) {
      const ox = s < 0 ? fx - 1 : fx;
      br.capsule(ox + s * 2, fy - 3.8 + bi, ox + s * 4.5, fy - 5.6, 0.9, 0.9).capsule(ox + s * 4.5, fy - 5.6, ox + s * 7.5, fy - 3.4 + bo, 0.9, 0.8);
    }
    cv.part(br, { ramp: ramps.hair, bevel: 1, inner: 'soft' });
    nose(ctx, fx, fy, ramps.skin, [1.7, 2], 3.2);
    mouth(ctx, fx, fy + 7.5, face, { w: 3 });
    // waxed mustache with curls, pointed goatee
    const lift = face === 'grin' ? -1 : 0;
    const mu = ctx.mask()
      .ellipse(fx - 2.6, fy + 6 + lift, 3, 1.1, 1, -0.2).ellipse(fx + 2.6, fy + 6 + lift, 3, 1.1, 1, 0.2)
      .capsule(fx - 5, fy + 6 + lift, fx - 7.5, fy + 3.5 + lift, 0.8, 0.6).capsule(fx + 5, fy + 6 + lift, fx + 7.5, fy + 3.5 + lift, 0.8, 0.6);
    cv.part(mu, { ramp: ramps.hair, bevel: 1, inner: 'line', shadow: false });
    const gt = ctx.mask().poly([[fx - 2, fy + 10], [fx + 2, fy + 10], [fx, fy + 15]]);
    cv.part(gt, { ramp: ramps.hair, bevel: 1, inner: 'line', shadow: false });

    // tall silk top hat with a red band, tipped jauntily
    const cy = y + (H.tilt === 'up' ? -1 : H.tilt === 'down' ? 1 : 0);
    const hx = x + lx * 0.4;
    const crown = ctx.mask().poly([[hx - 7, cy - 6], [hx + 7, cy - 6], [hx + 8, cy - 22], [hx - 6, cy - 22]]).ellipse(hx + 1, cy - 22, 7, 1.6);
    cv.part(crown, { ramp: ramps.hat, bevel: 3 });
    cv.line(hx - 5, cy - 20, hx - 5, cy - 9, (X, Y) => cv.shade(X, Y, -1));
    cv.part(ctx.mask().rect(hx - 7, cy - 10, 14, 3).clip(crown), { ramp: ramps.lining, bevel: 1, inner: 'line', shadow: false });
    const brim = ctx.mask().ellipse(hx, cy - 5.5, H.rx + 3, 1.8);
    cv.part(brim, { ramp: ramps.hat, bevel: 1, bias: -0.2, inner: 'line' });
    for (let i = -8; i <= 8; i++) if (hm.in(fx + i, cy - 3)) cv.shade(fx + i, cy - 3, 1);
  },

  back(ctx) {
    // the cape: red lining seen from the front, black edge
    const { cv, J, ramps, pose } = ctx;
    if (pose.lying) return;
    const sL = J.shL, sR = J.shR, h = J.hip;
    const out = ctx.mask().poly([[sL[0] + 2, sL[1] - 4], [sR[0] - 2, sR[1] - 4], [sR[0] + 17, h[1] + 20], [h[0], h[1] + 24], [sL[0] - 17, h[1] + 20]]);
    cv.part(out, { ramp: ramps.cape, bevel: 4 });
    const lin = ctx.mask().poly([[sL[0] + 3, sL[1] - 2], [sR[0] - 3, sR[1] - 2], [sR[0] + 13, h[1] + 17], [h[0], h[1] + 20], [sL[0] - 13, h[1] + 17]]);
    cv.part(lin, { ramp: ramps.lining, bevel: 5, inner: 'soft', shadow: false });
    for (const s of [-1, 1]) cv.line(h[0] + s * 14, h[1] - 10, h[0] + s * 22, h[1] + 16, (X, Y) => cv.shade(X, Y, 1));
  },

  torso(ctx) {
    const { cv, J, c, ramps, D } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest;
    // waistcoat: two panels meeting in a V, with a watch chain
    const cl = ctx.torsoMask;
    const vest = ctx.mask().poly([
      [n[0] - 7, n[1] + 3], [n[0] - 1, ch[1] + 2], [n[0] + 1, ch[1] + 2], [n[0] + 7, n[1] + 3],
      [ch[0] + D.chestW - 1, ch[1] - 6], [w[0] + D.waistW + 2, w[1] + 1], [w[0], w[1] + 5], [w[0] - D.waistW - 2, w[1] + 1],
      [ch[0] - D.chestW + 1, ch[1] - 6],
    ]).clip(cl);
    cv.part(vest, { ramp: ramps.vest, bevel: 5, inner: 'line' });
    for (let k = 0; k < 3; k++) cv.px(w[0], ch[1] + 5 + k * 5, c('gold'));
    cv.line(w[0] + 1, ch[1] + 10, w[0] + 8, ch[1] + 13, (X, Y) => cv.px(X, Y, c('gold')));
    // red bow tie
    const nx = Math.round(n[0]), ny = Math.round(n[1]) + 3;
    cv.part(ctx.mask().poly([[nx - 5, ny - 2], [nx, ny], [nx - 5, ny + 2]]).poly([[nx + 5, ny - 2], [nx, ny], [nx + 5, ny + 2]]), { ramp: ramps.lining, bevel: 1, inner: 'line', shadow: false });
    cv.px(nx, ny, c('liningDk'));
    // gold stars on the trunks
    const sm = ctx.shortsMask, h = J.hip;
    for (const [dx, dy] of [[-10, 2], [9, 5], [-4, 9], [13, -1]]) {
      const X = Math.round(h[0] + dx), Y = Math.round(h[1] + dy);
      if (sm.in(X, Y)) { cv.px(X, Y, c('gold')); cv.px(X - 1, Y, c('gold')); cv.px(X + 1, Y, c('gold')); cv.px(X, Y - 1, c('gold')); cv.px(X, Y + 1, c('gold')); }
    }
  },

  front(ctx) {
    const { cv, J, c, pose } = ctx;
    if (!pose.sparkle) return;
    const twinkle = (x, y, big) => {
      x = Math.round(x); y = Math.round(y);
      const r = big ? 6 : 4;
      for (let i = -r; i <= r; i++) {
        const k = Math.abs(i) < 2 ? 'white' : 'spark';
        cv.px(x + i, y, c(k)); cv.px(x, y + i, c(k));
      }
      for (const [dx, dy] of [[-1, -1], [1, 1], [1, -1], [-1, 1], [-2, -2], [2, 2], [2, -2], [-2, 2]]) cv.px(x + dx, y + dy, c(Math.abs(dx) === 1 ? 'white' : 'spark'));
      for (const [dx, dy] of [[-r - 1, 0], [r + 1, 0], [0, -r - 1], [0, r + 1]]) cv.px(x + dx, y + dy, c('outline'));
    };
    const s = pose.sparkle;
    if (s === 'L' || s === 'both') twinkle(J.fiL[0] - 7, J.fiL[1] - 9, true);
    if (s === 'R' || s === 'both') twinkle(J.fiR[0] + 7, J.fiR[1] - 9, true);
    if (s === 'R2') { twinkle(J.fiR[0] + 9, J.fiR[1] - 3, false); twinkle(J.fiR[0] - 2, J.fiR[1] - 12, false); }
  },
};
