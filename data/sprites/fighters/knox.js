// Professor Knox: sprite layers on the medium build.
// Tenured boxing theorist: bald dome with a shine, white tufts over the ears,
// round wire glasses, tidy grey mustache, a navy bow tie, burgundy argyle
// sweater vest over a short-sleeved dress shirt, a pocket protector, tweed
// shorts, argyle socks and brown loafers. Chalkboard-green gloves with chalk dust.

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './_face.js';

const A = makePalette('knox.A', {
  outline: [3, 2, 3],
  skinHi: [31, 25, 20], skin: [27, 19, 14], skinSh: [21, 13, 10], skinDk: [12, 7, 6],
  white: [31, 31, 30], mouth: [13, 3, 5],
  hairHi: [30, 30, 29], hair: [21, 21, 22],
  lens: [22, 28, 31], frame: [9, 6, 4],
  gloveHi: [12, 22, 15], glove: [6, 15, 9], gloveDk: [3, 8, 5],
});
const B = makePalette('knox.B', {
  shirtSh: [22, 23, 26],
  sweaterHi: [23, 7, 10], sweater: [16, 4, 7], sweaterDk: [9, 2, 4],
  argyle: [28, 22, 8],
  tweedHi: [21, 16, 10], tweed: [15, 11, 6], tweedDk: [8, 6, 3],
  bow: [5, 7, 18], bowHi: [11, 14, 28],
  pen: [26, 5, 6],
});
export const palettes = { knox: { A, B } };

const poses = {
  // reading your combo: adjusts the glasses with one glove
  ponder: {
    extends: 'idle1', shift: [0, 0],
    head: { at: [0, -100], face: 'focus', look: [0, 0] },
    elR: [28, -76], fiR: [8, -96], gloveR: { angle: -20 },
  },
  lecture: {
    extends: 'idle1', shift: [1, 0],
    head: { at: [2, -101], face: 'grin', look: [1, -1] },
    elR: [31, -82], fiR: [29, -106], gloveR: { angle: 5 },
    elL: [-26, -60], fiL: [-12, -60], gloveL: { angle: 80 },
  },
};

export default {
  id: 'knox',
  build: 'medium',
  // his own body on the build: a professor: narrow shoulders, soft middle, thin arms
  body: { size: [0.96, 0.95], shoulders: 0.9, dims: { belly: 7, waistW: 17, upperArm: [5.2, 4.4], forearm: [4.6, 3.8] } },
  palettes: { default: 'knox' },
  torsoMaterial: 'shirt',
  sleeve: { material: 'shirt', length: 0.5 },
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['white', 'white', 'shirtSh', 'gloveDk'],
    shirt: ['white', 'white', 'shirtSh', 'tweedDk'],
    shorts: ['tweedHi', 'tweed', 'tweedDk'],
    sock: ['sweaterHi', 'sweater', 'sweaterDk'],
    boot: ['tweed', 'tweedDk', 'outline'],
    sole: ['tweedDk', 'frame', 'outline'],
    hair: ['hairHi', 'hair', 'skinSh'],
    sweater: ['sweaterHi', 'sweater', 'sweaterDk'],
    bow: ['bowHi', 'bow', 'outline'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    ears(ctx, H, ramps.skin, [2.4, 3.4]);
    const hm = skull(ctx, H, ramps.skin, 'round');
    // shiny dome
    cv.px(x - 3, y - 10, c('white')); cv.px(x - 2, y - 11, c('white')); cv.px(x - 4, y - 9, c('skinHi'));
    // forehead wrinkles when thinking
    if (face === 'focus' || face === 'neutral') for (const dy of [-8, -6]) cv.line(fx - 4, fy + dy, fx + 3, fy + dy, (X, Y) => cv.shade(X, Y, 1));
    // white tufts over the ears
    const tufts = ctx.mask().ellipse(x - H.rx + 0.5, y - 3, 3, 3.6).ellipse(x + H.rx - 0.5, y - 3, 3, 3.6);
    tufts.poly([[x - H.rx - 2, y - 5], [x - H.rx - 5, y - 9], [x - H.rx + 1, y - 6]]).poly([[x + H.rx + 2, y - 5], [x + H.rx + 5, y - 9], [x + H.rx - 1, y - 6]]);
    cv.part(tufts, { ramp: ramps.hair, bevel: 2, inner: 'line' });
    eyes(ctx, fx, fy, face, 0);
    // one eyebrow raised: skeptical
    const b = brows(ctx, fx, fy, face === 'neutral' ? 'focus' : face, ramps.hair, { len: 4.2, thick: 1 });
    if (face === 'neutral' || face === 'grin') cv.part(ctx.mask().capsule(fx + 2, fy - 5.6, fx + 7, fy - 6.4, 1, 0.9), { ramp: ramps.hair, bevel: 1, inner: 'soft' });
    // round wire glasses
    for (const s of [-1, 1]) {
      const gx = fx + s * 5 - (s > 0 ? 1 : 0), gy = fy - 1;
      const ring = ctx.mask().ellipse(gx + 0.5, gy + 0.5, 4.2, 3.6).cut(ctx.mask().ellipse(gx + 0.5, gy + 0.5, 3.1, 2.6));
      cv.flat(ring, c('frame'));
      cv.px(gx - 2, gy - 1, c('lens')); cv.px(gx - 1, gy - 2, c('lens'));
    }
    cv.px(fx - 1, fy - 1, c('frame')); cv.px(fx, fy - 1, c('frame'));
    nose(ctx, fx, fy, ramps.skin, [2, 2.2], 3.8);
    mouth(ctx, fx, fy + 8.5, face, { w: 3.4 });
    if (!face || face === 'neutral') { cv.px(fx + 2, fy + 8.5, c('outline')); cv.px(fx + 3, fy + 8, c('outline')); } // smirk
    // tidy grey mustache
    cv.part(ctx.mask().rect(fx - 4, fy + 6.4, 8, 1.8), { ramp: ramps.hair, bevel: 1, inner: 'soft', shadow: false });
  },

  torso(ctx) {
    const { cv, J, c, ramps, D } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest;
    const nx = Math.round(n[0]), ny = Math.round(n[1]);
    // V-neck argyle sweater vest
    const vest = ctx.torsoMask.copy().clip(ctx.mask().poly([
      [nx - 6, ny + 1], [nx, ny + 13], [nx + 6, ny + 1],
      [ch[0] + D.chestW - 3, ch[1] - 8], [w[0] + D.waistW + 4, w[1] + 2],
      [w[0] - D.waistW - 4, w[1] + 2], [ch[0] - D.chestW + 3, ch[1] - 8],
    ]));
    cv.part(vest, { ramp: ramps.sweater, bevel: 6, inner: 'line' });
    // argyle diamonds
    for (let j = -12; j <= 24; j++) for (let i = -24; i <= 24; i++) {
      const X = Math.round(ch[0] + i), Y = Math.round(ch[1] + j);
      if (!vest.in(X, Y)) continue;
      const u = ((i + j + 400) % 12), v = ((i - j + 400) % 12);
      if (u === 0 || v === 0) cv.px(X, Y, c('argyle'));
    }
    // ribbed hem
    for (let i = -D.waistW - 3; i <= D.waistW + 3; i++) if (vest.in(Math.round(w[0] + i), Math.round(w[1]))) cv.shade(w[0] + i, w[1], 1);
    // bow tie
    const by = ny + 3;
    cv.part(ctx.mask().poly([[nx - 6, by - 2], [nx, by], [nx - 6, by + 3]]).poly([[nx + 6, by - 2], [nx, by], [nx + 6, by + 3]]), { ramp: ramps.bow, bevel: 1, inner: 'line', shadow: false });
    cv.px(nx, by, c('bowHi'));
    // pocket protector + pens peeking over the vest on the viewer-right chest
    const px = Math.round(ch[0] + 11), py = Math.round(ch[1] - 9);
    cv.px(px, py, c('pen')); cv.px(px, py + 1, c('pen')); cv.px(px + 2, py - 1, c('bow')); cv.px(px + 2, py, c('bow')); cv.px(px + 1, py + 1, c('white'));
  },

  front(ctx) {
    // chalk dust on the gloves
    const { cv, J, c, pose } = ctx;
    if (pose.lying) return;
    for (const f of [J.fiL, J.fiR]) {
      cv.px(f[0] - 2, f[1] - 3, c('white')); cv.px(f[0] + 1, f[1] - 4, c('hair')); cv.px(f[0] + 3, f[1] - 1, c('white'));
    }
  },
};
