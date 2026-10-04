// Maestro Vale: sprite layers on the lean build.
// An orchestra conductor: a wild mane of swept-back grey hair, fierce brows,
// a plum-black tailcoat with satin lapels open over a white shirt-front and
// a white bow tie, tails behind the hips, a white baton tucked in the
// waistband, black trunks with white piping, patent shoes, white gloves.
// Poses: conducting (taunt) and the concert bow (victory).

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './_face.js';

const A = makePalette('maestro.A', {
  outline: [2, 1, 3],
  skinHi: [31, 26, 21], skin: [27, 19, 15], skinSh: [20, 12, 11], skinDk: [11, 6, 7],
  white: [31, 31, 31], mouth: [14, 3, 6],
  hairHi: [29, 29, 30], hair: [19, 19, 22], hairDk: [10, 10, 13],
  gloveHi: [31, 31, 31], glove: [26, 26, 28], gloveDk: [16, 16, 20],
});
const B = makePalette('maestro.B', {
  coatHi: [11, 6, 13], coat: [6, 3, 8], coatDk: [3, 1, 4],
  satinHi: [18, 12, 21], satin: [12, 7, 15],
  shirtSh: [22, 22, 26],
  shoeHi: [13, 13, 16], shoe: [4, 4, 6],
  baton: [30, 29, 24], goldHi: [31, 28, 13], gold: [24, 17, 4],
});
export const palettes = { maestro: { A, B } };

const poses = {
  // conducting: one glove cueing high, the other shaping the phrase
  conduct1: {
    extends: 'idle1',
    head: { at: [1, -101], face: 'focus', tilt: 'up', look: [1, -1] },
    elR: [32, -96], fiR: [30, -118], gloveR: { angle: 25 },
    elL: [-32, -70], fiL: [-42, -80], gloveL: { angle: -70 },
  },
  conduct2: {
    extends: 'idle1',
    head: { at: [-1, -100], face: 'grin', look: [-1, 0] },
    elR: [32, -76], fiR: [40, -66], gloveR: { angle: 110 },
    elL: [-32, -94], fiL: [-28, -116], gloveL: { angle: -20 },
  },
  // the concert bow
  bow: {
    extends: 'idle1', shift: [0, 6],
    head: { at: [0, -88], face: 'grin', tilt: 'down', look: [0, 2] },
    chest: [0, -68], neck: [0, -81],
    elL: [-22, -58], fiL: [-2, -60], gloveL: { angle: 90 },
    elR: [30, -56], fiR: [34, -40], gloveR: { angle: 170 },
  },
};

export default {
  id: 'maestro',
  build: 'lean',
  // his own body on the build: an elderly conductor: thin, long-necked, narrow-shouldered
  body: { size: [0.95, 0.97], shoulders: 0.93, neckLen: 1.5, dims: { upperArm: [4.6, 3.8] } },
  palettes: { default: 'maestro' },
  torsoMaterial: 'coat',
  sleeve: { material: 'coat', length: 0.95 },
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['white', 'shirtSh', 'gloveDk'],
    coat: ['coatHi', 'coat', 'coatDk', 'outline'],
    satin: ['satinHi', 'satin', 'coat'],
    shorts: ['coatHi', 'coat', 'coatDk'],
    sock: ['shoeHi', 'shoe', 'outline'],
    boot: ['shoeHi', 'shoe', 'outline'],
    sole: ['shoe', 'outline', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    shirt: ['white', 'white', 'shirtSh', 'gloveDk'],
    gold: ['goldHi', 'gold', 'coatDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    // the mane: swept back and out past both ears
    const mane = ctx.mask().ellipse(x + lx * 0.3, y - 5, H.rx + 4, 9);
    for (const s of [-1, 1]) mane.ellipse(x + s * (H.rx + 1), y, 4, 7).poly([[x + s * (H.rx - 1), y - 4], [x + s * (H.rx + 8), y + 2], [x + s * (H.rx + 1), y + 6]]);
    cv.part(mane, { ramp: ramps.hair, bevel: 4, inner: 'line' });
    for (const [dx, dy] of [[-10, -6], [-7, -11], [-2, -13], [3, -13], [8, -11], [11, -6], [-13, 0], [13, 0], [-15, 3], [15, 3]]) { cv.shade(x + dx, y + dy, 1); cv.shade(x + dx + 1, y + dy + 1, -1); }
    ears(ctx, H, ramps.skin, [1.8, 2.8]);
    const hm = skull(ctx, H, ramps.skin, 'narrow');
    // hairline: swept back off a high forehead
    const front = ctx.mask().ellipse(x + lx * 0.3, y - 9, H.rx - 0.5, 4.5).clip(hm);
    cv.part(front, { ramp: ramps.hair, bevel: 2, inner: 'soft', shadow: false });
    eyes(ctx, fx, fy, face, 0);
    // fierce, bushy, arched brows
    brows(ctx, fx, fy, face, ramps.hair, { len: 5, thick: 1.5, y: -4.4 });
    nose(ctx, fx, fy, ramps.skin, [2, 2.6], 4);
    mouth(ctx, fx, fy + 9, face, { w: 3.4 });
    for (let i = -3; i <= 3; i++) if (hm.in(fx + i, fy + 12)) cv.shade(fx + i, fy + 12, 1);
  },

  torso(ctx) {
    const { cv, J, c, ramps, D, pose } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, h = J.hip;
    const tm = ctx.torsoMask;
    const nx = Math.round(n[0]), ny = Math.round(n[1]);
    // shirt-front in the open coat, three studs
    const sf = ctx.mask().poly([[nx - 5, ny + 1], [nx + 5, ny + 1], [w[0] + 4, w[1] - 4], [w[0] - 4, w[1] - 4]]).clip(tm);
    cv.part(sf, { ramp: ramps.shirt, bevel: 2, inner: 'line', shadow: false });
    for (let k = 0; k < 3; k++) cv.px(w[0], ch[1] - 2 + k * 6, c('gold'));
    // satin lapels
    for (const s of [-1, 1]) cv.part(ctx.mask().poly([[nx + s * 5, ny + 1], [nx + s * 10, ny + 3], [w[0] + s * 5, ch[1] + 6], [w[0] + s * 4, ch[1] + 10]]).clip(tm), { ramp: ramps.satin, bevel: 1, bias: 0.3, inner: 'line', shadow: false });
    // white bow tie
    cv.part(ctx.mask().poly([[nx - 5, ny + 1], [nx, ny + 3], [nx - 5, ny + 5]]).poly([[nx + 5, ny + 1], [nx, ny + 3], [nx + 5, ny + 5]]), { ramp: ramps.shirt, bevel: 1, inner: 'line', shadow: false });
    // tails behind the hips
    for (const s of [-1, 1]) cv.part(ctx.mask().poly([[w[0] + s * (D.waistW - 2), w[1] - 2], [w[0] + s * (D.waistW + 4), w[1] - 2], [h[0] + s * (D.waistW + 5), h[1] + 16], [h[0] + s * (D.waistW - 1), h[1] + 13]]), { ramp: ramps.coat, bevel: 2, inner: 'line' });
    // white piping on the trunks + the baton in the waistband
    for (const s of [-1, 1]) cv.line(h[0] + s * (D.hipSpread + 7), h[1] - 3, h[0] + s * (D.hipSpread + 8), h[1] + 8, (X, Y) => { if (ctx.shortsMask.in(X, Y)) cv.px(X, Y, c('white')); });
    if (!pose.lying) cv.line(w[0] - D.waistW + 2, w[1] - 6, w[0] - D.waistW - 5, w[1] + 8, (X, Y) => { cv.px(X, Y, c('baton')); cv.px(X + 1, Y, c('outline')); });
  },
  // Title Defense, DA CAPO (con fuoco): the mane flares up into points tipped
  // with fire, a scarlet cravat at the throat, a spare baton behind his ear.
  remix: {
    colors: { B: { fireHi: [31, 28, 8], fire: [31, 14, 3], fireDk: [20, 4, 3] } },
    ramps: { fire: ['fireHi', 'fire', 'fireDk'] },
    head(ctx, H) {
      const { cv, ramps, c } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.3), y = Math.round(H.y);
      // flame points rising off the mane
      const fl = ctx.mask();
      for (const [dx, h, w] of [[-9, 9, 3], [-4, 13, 3.4], [1, 15, 3.6], [6, 12, 3.2], [10, 8, 2.8]]) fl.poly([[x + dx - w, y - 11], [x + dx + w, y - 11], [x + dx + 1, y - 11 - h]]);
      cv.part(fl, { ramp: ramps.fire, bevel: 2, inner: 'soft' });
      for (const dx of [-4, 1, 6]) cv.px(x + dx, y - 13, c('fireHi'));
      // the spare baton behind the viewer-right ear
      cv.line(x + Math.round(H.rx) - 2, y - 8, x + Math.round(H.rx) + 5, y + 2, (X, Y) => cv.px(X, Y, c('baton')));
    },
    torso(ctx) {
      const { cv, J, ramps, pose } = ctx;
      if (pose.lying) return;
      const n = J.neck;
      const cr = ctx.mask().ellipse(n[0], n[1] + 3, 4.5, 2.4).poly([[n[0] - 2, n[1] + 4], [n[0] + 2, n[1] + 4], [n[0] + 3, n[1] + 12], [n[0] - 3, n[1] + 12]]);
      cv.part(cr, { ramp: ramps.fire, bevel: 2, inner: 'line' });
    },
  },
};
