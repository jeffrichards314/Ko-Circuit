// Downpour: sprite layers on the medium build.
// Permanently soaked: a navy rain hoodie with the hood up (drawstrings
// dangling, water dripping off the rim), wet black hair plastered to his
// forehead, droopy eyes, a pale rained-on complexion, charcoal trunks, yellow
// rubber galoshes, slate-blue gloves. Poses: wringing out the hood (taunt).

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, skull, nose } from './_face.js';

const A = makePalette('downpour.A', {
  outline: [2, 2, 4],
  skinHi: [29, 26, 24], skin: [24, 20, 19], skinSh: [17, 14, 15], skinDk: [9, 8, 10],
  white: [30, 31, 31], mouth: [11, 4, 7],
  hairHi: [8, 9, 13], hair: [3, 3, 6],
  gloveHi: [17, 21, 27], glove: [9, 13, 20], gloveDk: [4, 6, 12],
  drop: [22, 29, 31],
});
const B = makePalette('downpour.B', {
  hoodHi: [9, 13, 23], hood: [5, 8, 16], hoodDk: [2, 4, 9],
  lining: [18, 19, 22],
  trunkHi: [10, 10, 13], trunk: [5, 5, 7],
  galoshHi: [31, 29, 12], galosh: [28, 21, 3], galoshDk: [17, 11, 2],
  string: [27, 28, 30],
});
export const palettes = { downpour: { A, B } };

const poses = {
  // taunt: grabs the hood rim with both gloves and wrings the water out
  wring1: {
    extends: 'idle1', shift: [0, 1],
    head: { at: [0, -99], face: 'dazed', tilt: 'down', look: [0, 1] },
    elL: [-30, -84], elR: [30, -84], fiL: [-14, -106], fiR: [14, -106],
    gloveL: { angle: 30 }, gloveR: { angle: -30 },
  },
  wring2: {
    extends: 'wring1',
    fiL: [-12, -110], fiR: [16, -102],
    head: { at: [1, -99], face: 'strain', tilt: 'down', look: [0, 1] },
  },
};

export default {
  id: 'downpour',
  build: 'medium',
  // his own body on the build: hunched against the weather: rounded shoulders, a short neck
  body: { torsoLen: 0.95, neckLen: -1.5, shoulders: 0.95, dims: { belly: 6 } },
  palettes: { default: 'downpour' },
  torsoMaterial: 'hood',
  sleeve: { material: 'hood', length: 0.95 },
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['hoodHi', 'hood', 'hoodDk'],
    hood: ['hoodHi', 'hood', 'hoodDk', 'outline'],
    shorts: ['trunkHi', 'trunk', 'outline'],
    sock: ['galoshHi', 'galosh', 'galoshDk'],
    boot: ['galoshHi', 'galosh', 'galoshDk'],
    sole: ['galoshDk', 'outline', 'outline'],
    hair: ['hairHi', 'hair', 'outline'],
    lining: ['lining', 'lining', 'hoodDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    // the hood, up: a rounded shell around the whole head
    const cy = y + (H.tilt === 'up' ? -1 : H.tilt === 'down' ? 1 : 0);
    const hood = ctx.mask().ellipse(x + lx * 0.2, cy - 2, H.rx + 5, H.ry + 4).rect(x - H.rx - 5, cy, H.rx * 2 + 10, 12);
    cv.part(hood, { ramp: ramps.hood, bevel: 5, inner: 'line' });
    const hm = skull(ctx, H, ramps.skin, 'round');
    // grey lining showing round the face opening
    const rim = ctx.mask().ellipse(fx, fy + 1, H.rx + 2.5, H.ry + 1.5).cut(ctx.mask().ellipse(fx, fy + 1, H.rx + 0.5, H.ry));
    cv.part(rim.clip(hood).cut(ctx.mask().rect(x - 20, fy + 8, 40, 20)), { ramp: ramps.lining, bevel: 1, inner: 'line', shadow: false });
    // wet hair plastered down across the forehead in strands
    const hr = ctx.mask().ellipse(x + lx * 0.3, y - 8, H.rx - 0.5, 5).clip(hm);
    for (const dx of [-7, -3, 1, 5]) hr.poly([[x + dx - 1, y - 6], [x + dx + 2, y - 6], [x + dx + 1, y - 1]]);
    cv.part(hr.clip(hm), { ramp: ramps.hair, bevel: 1, inner: 'line', shadow: false });
    // droopy eyes (heavy lids), sad brows
    eyes(ctx, fx, fy, face, 0);
    if (['neutral', 'focus', 'grin'].includes(face)) for (const s of [-1, 1]) for (let i = 0; i < 4; i++) cv.px(fx + s * 5 - (s > 0 ? 1 : 0) + i - 2, fy - 2, c('outline'));
    brows(ctx, fx, fy, face === 'neutral' ? 'hurt' : face, ramps.hair, { len: 4, thick: 1, y: -4.4 });
    nose(ctx, fx, fy, ramps.skin, [2.2, 2.4], 3.6);
    mouth(ctx, fx, fy + 9, face, { w: 3.4 });
    if (face === 'neutral') { cv.px(fx - 3, fy + 11, c('outline')); cv.px(fx + 3, fy + 11, c('outline')); }
    // raindrops on the cheek and running off the rim
    cv.px(fx - 6, fy + 5, c('drop')); cv.px(fx - 6, fy + 6, c('drop'));
    for (const [dx, dy] of [[-H.rx - 5, 4], [H.rx + 4, 7], [-2, -H.ry - 6]]) { cv.px(x + dx, cy + dy, c('drop')); cv.px(x + dx, cy + dy + 1, c('white')); }
  },

  torso(ctx) {
    const { cv, J, c, D, ramps, pose } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest;
    const tm = ctx.torsoMask;
    // zip, kangaroo pocket, dangling drawstrings
    cv.line(n[0], n[1] + 4, w[0], w[1] - 2, (X, Y) => { if (tm.in(X, Y)) cv.px(X, Y, c(Y % 2 ? 'lining' : 'hoodDk')); });
    if (!pose.lying) {
      cv.part(ctx.mask().poly([[w[0] - 11, ch[1] + 8], [w[0] + 11, ch[1] + 8], [w[0] + 13, w[1] - 3], [w[0] - 13, w[1] - 3]]).clip(tm), { ramp: ramps.hood, bevel: 2, bias: -0.1, inner: 'line', shadow: false });
      for (const s of [-1, 1]) { cv.line(n[0] + s * 4, n[1] + 1, n[0] + s * 5, n[1] + 13, (X, Y) => cv.px(X, Y, c('string'))); cv.px(n[0] + s * 5, n[1] + 14, c('lining')); }
    }
    // soaked patches: darker wet streaks down the hoodie
    for (let Y = 0; Y < tm.h; Y++) for (let X = 0; X < tm.w; X++) if (tm.in(X, Y) && (X * 7 + Y * 3) % 23 === 0) { cv.shade(X, Y, 1); cv.shade(X, Y + 1, 1); }
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, w[1] - 3, D.waistW * 2 + 2, 3).clip(tm.copy().add(ctx.shortsMask)), { ramp: ramps.hood, bevel: 1, inner: 'line', shadow: false });
  },
};
