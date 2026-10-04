// Lumberjack Lars: sprite layers on the heavy build.
// A north-woods logger: a red knit toque with a pom-pom, a long blond beard
// in two braids, a red-and-black buffalo-check flannel shirt with the sleeves
// rolled up, leather suspenders, brown canvas work trunks, laced logging
// boots, tan work-leather gloves. Poses: the TIMBER! call (both fists up
// behind his head like an axe), and spitting in his gloves (taunt).

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './_face.js';

const A = makePalette('lars.A', {
  outline: [3, 2, 2],
  skinHi: [31, 25, 19], skin: [28, 18, 13], skinSh: [21, 11, 9], skinDk: [12, 6, 5],
  ruddy: [28, 12, 10], white: [31, 31, 30], mouth: [13, 2, 4],
  hairHi: [31, 29, 17], hair: [27, 21, 8], hairDk: [16, 11, 4],
  gloveHi: [30, 24, 15], glove: [24, 16, 8], gloveDk: [14, 8, 4],
});
const B = makePalette('lars.B', {
  checkHi: [29, 7, 6], check: [21, 3, 4], checkDk: [11, 1, 2], black: [4, 3, 4],
  toque: [26, 5, 6], toqueHi: [31, 26, 24],
  canvasHi: [19, 14, 8], canvas: [13, 9, 5], canvasDk: [7, 5, 3],
  leatherHi: [20, 11, 5], leather: [12, 6, 3],
  bootHi: [17, 11, 6], boot: [9, 5, 3], brass: [29, 22, 7],
});
export const palettes = { lars: { A, B } };

const poses = {
  // TIMBER! both fists up behind the head, like an axe about to come down
  timberCall1: {
    extends: 'idle1', shift: [0, -1],
    head: { at: [0, -101], face: 'wide', tilt: 'up', look: [0, -1] },
    elL: [-30, -104], elR: [30, -104], fiL: [-8, -122], fiR: [8, -124],
    gloveL: { angle: 30 }, gloveR: { angle: -30 },
    armZ: { L: 'back', R: 'back' },
  },
  timberCall2: {
    extends: 'timberCall1', shift: [2, 0],
    head: { at: [2, -101], face: 'wide', tilt: 'up', look: [1, -1] },
    fiL: [-4, -124], fiR: [12, -126],
  },
  // taunt: spits in his gloves and rubs them together
  spitGloves1: {
    extends: 'idle1', shift: [0, 1],
    head: { at: [0, -98], face: 'grin', tilt: 'down', look: [0, 2] },
    elL: [-22, -66], elR: [22, -66], fiL: [-5, -82], fiR: [5, -82],
    gloveL: { angle: 70 }, gloveR: { angle: -70 },
  },
  spitGloves2: {
    extends: 'spitGloves1',
    fiL: [-3, -80], fiR: [7, -84],
    head: { at: [0, -98], face: 'focus', tilt: 'down', look: [0, 2] },
  },
};

export default {
  id: 'lars',
  build: 'heavy',
  // his own body on the build: a tall logger: long, broad and strong
  body: { size: [1.06, 1.05], shoulders: 1.08, legLen: 1.04, dims: { belly: 5 } },
  palettes: { default: 'lars' },
  torsoMaterial: 'check',
  sleeve: { material: 'check', length: 0.6 },
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['gloveHi', 'glove', 'gloveDk'],
    check: ['checkHi', 'check', 'checkDk', 'outline'],
    shorts: ['canvasHi', 'canvas', 'canvasDk'],
    sock: ['toqueHi', 'hairHi', 'hairDk'],
    boot: ['bootHi', 'boot', 'outline'],
    sole: ['boot', 'outline', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    toque: ['toque', 'check', 'checkDk'],
    leather: ['leatherHi', 'leather', 'outline'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';
    const open = ['strain', 'hurt', 'wide'].includes(face);

    ears(ctx, H, ramps.skin, [2.6, 3.6]);
    const hm = skull(ctx, H, ramps.skin, 'square');
    // long blond beard ending in two braids
    const bd = ctx.mask().ellipse(fx, fy + 9, H.rx + 1.5, 9).cut(ctx.mask().rect(fx - 20, fy - 8, 40, 12));
    bd.rect(x - Math.round(H.rx) - 1, y - 2, 4, 9).rect(x + Math.round(H.rx) - 3, y - 2, 4, 9);
    const mo = ctx.mask().ellipse(fx, fy + 9.5, 3.4, 1.8);
    if (open) bd.cut(mo);
    cv.part(bd, { ramp: ramps.hair, bevel: 4, inner: 'line' });
    for (const s of [-1, 1]) {
      for (let k = 0; k < 4; k++) cv.part(ctx.mask().ellipse(fx + s * 3, fy + 18 + k * 3, 2.2, 1.8), { ramp: ramps.hair, bevel: 1, inner: 'line' });
      cv.px(fx + s * 3, fy + 29, c('toque')); cv.px(fx + s * 3 - 1, fy + 29, c('toque'));
    }
    for (const [dx, dy] of [[-8, 6], [-4, 12], [4, 12], [8, 6], [0, 13]]) cv.shade(fx + dx, fy + dy, 1);
    if (open) { cv.flat(mo, c('mouth'), true); cv.px(fx - 1, fy + 8, c('white')); cv.px(fx, fy + 8, c('white')); }
    for (const s of [-1, 1]) { cv.px(fx + s * 6, fy + 3, c('ruddy')); cv.px(fx + s * 6 - s, fy + 3, c('ruddy')); }
    eyes(ctx, fx, fy, face, 0);
    brows(ctx, fx, fy, face, ramps.hair, { len: 4.8, thick: 1.4, y: -4 });
    nose(ctx, fx, fy, ['skinHi', 'ruddy', 'skinSh', 'skinDk'].map(c), [2.8, 2.6], 3.6);
    cv.part(ctx.mask().ellipse(fx - 3.4, fy + 7, 4.4, 1.8, 1, -0.2).ellipse(fx + 3.4, fy + 7, 4.4, 1.8, 1, 0.2), { ramp: ramps.hair, bevel: 1, inner: 'line', shadow: false });
    if (face === 'grin') for (let i = -2; i <= 2; i++) cv.px(fx + i, fy + 9, c('mouth'));
    // red knit toque: ribbed cuff, pom-pom
    const cy = y + (H.tilt === 'up' ? -1 : H.tilt === 'down' ? 1 : 0);
    const hx = x + lx * 0.4;
    const dome = ctx.mask().ellipse(hx, cy - 8, H.rx + 1.5, 9).cut(ctx.mask().rect(hx - 20, cy - 4, 40, 12));
    cv.part(dome, { ramp: ramps.toque, bevel: 5 });
    for (let i = -10; i <= 10; i += 2) cv.line(hx + i * 0.8, cy - 14, hx + i, cy - 7, (X, Y) => { if (dome.in(X, Y)) cv.shade(X, Y, 1); });
    const band = ctx.mask().rect(hx - H.rx - 1, cy - 7, H.rx * 2 + 3, 4);
    cv.part(band, { ramp: ramps.toque, bevel: 1, bias: -0.1, inner: 'line' });
    for (let i = -12; i <= 12; i += 2) cv.px(Math.round(hx + i), cy - 5, c('checkDk'));
    cv.part(ctx.mask().ellipse(hx + 1, cy - 18, 3.4, 3), { ramp: ['toqueHi', 'toqueHi', 'hairHi', 'hairDk'].map(c), bevel: 2, inner: 'line' });
    for (let i = -8; i <= 8; i++) if (hm.in(fx + i, cy - 2)) cv.shade(fx + i, cy - 2, 1);
  },

  torso(ctx) {
    const { cv, J, c, D, ramps, pose } = ctx;
    const n = J.neck, w = J.waist, h = J.hip;
    const tm = ctx.torsoMask;
    // open collar
    cv.part(ctx.mask().poly([[n[0] - 6, n[1]], [n[0] + 6, n[1]], [n[0], n[1] + 7]]).clip(tm), { ramp: ramps.skin, bevel: 2, inner: 'line', shadow: false });
    if (pose.lying) return;
    // leather suspenders with brass clips
    for (const s of [-1, 1]) {
      const sh = J[s < 0 ? 'shL' : 'shR'];
      const m = ctx.mask().capsule(sh[0] - s * 5, sh[1] - 2, w[0] + s * 8, w[1] + 1, 1.6).clip(tm);
      cv.part(m, { ramp: ramps.leather, bevel: 1, inner: 'line', shadow: false });
      cv.px(w[0] + s * 8, w[1] - 1, c('brass')); cv.px(w[0] + s * 8, w[1], c('brass'));
    }
    // double-stitched pocket seams on the canvas trunks
    for (const s of [-1, 1]) cv.line(h[0] + s * (D.hipSpread + 9), h[1] - 2, h[0] + s * (D.hipSpread + 10), h[1] + 8, (X, Y) => { if (ctx.shortsMask.in(X, Y)) cv.px(X, Y, c('brass')); });
  },

  // buffalo check over the shirt and the rolled sleeves (after the arms are drawn)
  front(ctx) {
    const { cv, c, ramps } = ctx;
    const id = cv.rampId(ramps.check);
    for (let Y = 0; Y < cv.h; Y++) for (let X = 0; X < cv.w; X++) {
      if (cv.ramp[Y * cv.w + X] !== id) continue;
      const a = (X >> 2) & 1, b = (Y >> 2) & 1;
      if (a && b) cv.px(X, Y, c('black'));
      else if (a || b) cv.shade(X, Y, 1);
    }
  },
};
