// Jester Jinx: sprite layers on the lean build.
// Court jester gone rogue: a two-horned floppy cap (red horn, green horn) with
// gold bells, a white-painted face with a black diamond under one eye and a
// crooked red grin, a scalloped collar with bells, a red-and-green harlequin
// tunic, split-colour trunks, curly-toed slippers, purple gloves.

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './_face.js';

const A = makePalette('jinx.A', {
  outline: [3, 2, 4],
  skinHi: [31, 31, 31], skin: [28, 27, 28], skinSh: [21, 20, 23], skinDk: [12, 11, 15],
  white: [31, 31, 31], mouth: [16, 2, 5], paint: [28, 4, 8],
  hairHi: [8, 6, 10], hair: [3, 2, 4],
  gloveHi: [24, 12, 30], glove: [15, 5, 23], gloveDk: [7, 2, 13],
});
const B = makePalette('jinx.B', {
  redHi: [31, 10, 10], red: [23, 3, 6], redDk: [12, 1, 4],
  greenHi: [10, 27, 10], green: [4, 18, 7], greenDk: [2, 9, 4],
  bellHi: [31, 30, 15], bell: [29, 22, 4], bellDk: [16, 10, 2],
  collarHi: [31, 30, 27], collar: [25, 24, 22], collarSh: [16, 15, 16],
});
export const palettes = { jinx: { A, B } };

const poses = {
  // taunt: glove to his nose, waggling (nyah-nyah)
  nyah1: {
    extends: 'idle1', shift: [0, 0],
    head: { at: [1, -101], face: 'grin', tilt: 'up', look: [1, -1] },
    elR: [26, -84], fiR: [6, -98], gloveR: { angle: -80 },
    elL: [-30, -80], fiL: [-38, -98], gloveL: { angle: -20 },
  },
  nyah2: {
    extends: 'nyah1',
    fiL: [-42, -94], gloveL: { angle: -50 },
  },
  // spinning the wheel between rounds / showing off
  flourish: {
    extends: 'idle1',
    head: { at: [0, -101], face: 'grin', look: [0, -1] },
    elL: [-34, -70], elR: [34, -70], fiL: [-46, -64], fiR: [46, -64],
    gloveL: { angle: -100 }, gloveR: { angle: 100 },
  },
};

export default {
  id: 'jinx',
  build: 'lean',
  // his own body on the build: a spindly jester: long skinny limbs
  body: { size: [0.92, 0.95], legLen: 1.06, shoulders: 0.92, dims: { upperArm: [4.4, 3.6], forearm: [3.9, 3.2], thigh: [5.6, 4.2] } },
  palettes: { default: 'jinx' },
  torsoMaterial: 'red',
  sleeve: { material: 'green', length: 0.9 },
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['bellHi', 'bell', 'bellDk'],
    red: ['redHi', 'red', 'redDk', 'outline'],
    green: ['greenHi', 'green', 'greenDk', 'outline'],
    shorts: ['greenHi', 'green', 'greenDk'],
    sock: ['redHi', 'red', 'redDk'],
    boot: ['greenHi', 'green', 'greenDk'],
    sole: ['redDk', 'outline', 'outline'],
    hair: ['hairHi', 'hair', 'outline'],
    bell: ['bellHi', 'bell', 'bellDk'],
    collar: ['collarHi', 'collar', 'collarSh'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    ears(ctx, H, ramps.skin, [2, 3]);
    skull(ctx, H, ramps.skin, 'chin');
    eyes(ctx, fx, fy, face, 0);
    // a black diamond painted under the viewer-right eye
    cv.flat(ctx.mask().poly([[fx + 4, fy + 1], [fx + 6, fy + 4], [fx + 4, fy + 7], [fx + 2, fy + 4]]), c('outline'));
    brows(ctx, fx, fy, face === 'neutral' ? 'focus' : face, ramps.hair, { len: 3.8, thick: 0.9, y: -4.4 });
    nose(ctx, fx, fy, ramps.skin, [1.8, 2], 3.4);
    // crooked painted grin
    cv.line(fx - 6, fy + 6, fx - 3, fy + 9, (X, Y) => cv.px(X, Y, c('paint')));
    cv.line(fx + 6, fy + 5, fx + 3, fy + 9, (X, Y) => cv.px(X, Y, c('paint')));
    mouth(ctx, fx, fy + 9, face === 'neutral' ? 'grin' : face, { w: 3.2 });
    // the cap: a snug band + two floppy horns, red and green, with bells
    const cy = y + (H.tilt === 'up' ? -1 : H.tilt === 'down' ? 1 : 0);
    const band = ctx.mask().ellipse(x + lx * 0.3, cy - 6, H.rx + 1, 6.5).cut(ctx.mask().rect(x - 16, cy - 4, 32, 12));
    cv.part(band.copy().clip(ctx.mask().rect(0, 0, x, 160)), { ramp: ramps.red, bevel: 3 });
    cv.part(band.copy().cut(ctx.mask().rect(0, 0, x, 160)), { ramp: ramps.green, bevel: 3 });
    for (const s of [-1, 1]) {
      const ramp = s < 0 ? ramps.red : ramps.green;
      const tip = [x + s * 20, cy - 4];
      const horn = ctx.mask().capsule(x + s * 3, cy - 9, x + s * 12, cy - 16, 4.2, 3).capsule(x + s * 12, cy - 16, tip[0], tip[1], 3, 1.2);
      cv.part(horn, { ramp, bevel: 2, inner: 'line' });
      cv.part(ctx.mask().ellipse(tip[0], tip[1] + 2, 2, 2), { ramp: ramps.bell, bevel: 1 });
      cv.px(tip[0], tip[1] + 3, c('bellDk'));
    }
    cv.line(x - Math.round(H.rx), cy - 4, x + Math.round(H.rx), cy - 4, (X, Y) => { if (band.in(X, Y)) cv.px(X, Y, c('bell')); });
  },

  torso(ctx) {
    const { cv, J, c, ramps, pose } = ctx;
    const n = J.neck, h = J.hip;
    const tm = ctx.torsoMask;
    // harlequin diamonds: green on the red tunic
    for (let y = 0; y < tm.h; y++) for (let x = 0; x < tm.w; x++) {
      if (!tm.in(x, y)) continue;
      const u = Math.floor((x - n[0] + y + 400) / 7), v = Math.floor((x - n[0] - y + 400) / 7);
      if ((u + v) % 2 === 0) cv.px(x, y, c((x + y) % 5 === 0 ? 'greenHi' : 'green'));
    }
    // trunks split: red on the viewer-left half
    const sm = ctx.shortsMask;
    for (let y = 0; y < sm.h; y++) for (let x = 0; x < sm.w; x++) if (sm.in(x, y) && x < h[0]) cv.px(x, y, c(sm.in(x - 1, y) ? 'red' : 'redDk'));
    // scalloped collar with bells
    if (!pose.lying) {
      const nx = Math.round(n[0]), ny = Math.round(n[1]) + 2;
      const col = ctx.mask();
      for (let i = -3; i <= 3; i++) col.poly([[nx + i * 4 - 3, ny - 1], [nx + i * 4 + 3, ny - 1], [nx + i * 4.4, ny + 6 - Math.abs(i) * 0.6]]);
      cv.part(col, { ramp: ramps.collar, bevel: 1, inner: 'line' });
      for (const i of [-3, -1, 1, 3]) cv.part(ctx.mask().ellipse(nx + i * 4.4, ny + 7 - Math.abs(i) * 0.6, 1.4, 1.4), { ramp: ramps.bell, bevel: 1, shadow: false });
    }
  },

  front(ctx) {
    // curled toes on the slippers
    const { cv, J, c, pose } = ctx;
    if (pose.lying) return;
    for (const [k, s] of [['ftL', -1], ['ftR', 1]]) {
      const f = J[k];
      cv.part(ctx.mask().capsule(f[0] + s * 5, f[1] - 3, f[0] + s * 10, f[1] - 8, 2.2, 1.2), { ramp: ['greenHi', 'green', 'greenDk'].map(c), bevel: 1, inner: 'line' });
      cv.part(ctx.mask().ellipse(f[0] + s * 10, f[1] - 9, 1.4, 1.4), { ramp: ['bellHi', 'bell', 'bellDk'].map(c), bevel: 1, shadow: false });
    }
  },
};
