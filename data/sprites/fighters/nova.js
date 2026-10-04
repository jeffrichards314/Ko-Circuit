// Nova Reyes: sprite layers on the lean build.
// A track-cyclist-turned-boxer: close-cropped platinum hair swept straight back
// by the wind with a magenta streak, racing goggles pushed up on her forehead,
// a cyan aero racing top with magenta chevrons, cyan trunks with a racing
// stripe, white racing shoes flashed magenta, magenta gloves.
// `nova.ghost` is her afterimage: the same frames in cold violet-blue.
// Poses: the sprinter's crouch (blocks1/2) and the launch (Supernova), a
// hamstring stretch (taunt).

import { makePalette, swapPalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './_face.js';

const A = makePalette('nova.A', {
  outline: [2, 2, 5],
  skinHi: [26, 18, 14], skin: [19, 12, 9], skinSh: [13, 7, 6], skinDk: [7, 4, 4],
  white: [31, 31, 31], mouth: [9, 2, 5],
  hairHi: [31, 31, 30], hair: [26, 26, 26], streak: [31, 8, 24],
  gloveHi: [31, 20, 28], glove: [28, 6, 20], gloveDk: [15, 2, 11],
  lash: [2, 1, 4],
});
const B = makePalette('nova.B', {
  suitHi: [14, 30, 31], suit: [4, 21, 27], suitDk: [2, 10, 15],
  chev: [31, 8, 24], chevDk: [18, 3, 14],
  visor: [3, 10, 14], visorHi: [16, 28, 31],
  shoeHi: [31, 31, 31], shoe: [24, 24, 27], shoeDk: [14, 14, 19],
});
// the afterimage: everything in cold violet-blue
const gA = {}, gB = {};
const V = [[20, 20, 31], [13, 12, 28], [8, 6, 22], [4, 3, 14]];
for (const k of A.keys) if (k !== 'outline') gA[k] = V[/Hi$|white/.test(k) ? 0 : /Dk|Sh$/.test(k) ? 2 : 1];
for (const k of B.keys) gB[k] = V[/Hi$/.test(k) ? 0 : /Dk$/.test(k) ? 2 : 1];
gA.outline = V[3];
export const palettes = { nova: { A, B }, 'nova.ghost': { A: swapPalette('nova.ghostA', A, gA), B: swapPalette('nova.ghostB', B, gB) } };

const poses = {
  // sprinter in the blocks: fingertips on the canvas, hips up
  blocks1: {
    hip: [2, -40], waist: [0, -46], chest: [-2, -58], neck: [-3, -68],
    head: { at: [-3, -78], face: 'focus', tilt: 'down', look: [0, 2] },
    shL: [-20, -64], shR: [16, -64],
    elL: [-24, -44], elR: [22, -44], fiL: [-20, -24], fiR: [18, -24],
    knL: [-14, -12], ftL: [-12, 0], knR: [16, -26], ftR: [20, 0],
    gloveL: { angle: 180 }, gloveR: { angle: 180 },
  },
  blocks2: {
    extends: 'blocks1', shift: [0, -2],
    head: { at: [-3, -81], face: 'strain', tilt: 'down', look: [0, 1] },
  },
  // the launch: straight at you, lead glove the size of the world
  launch: {
    extends: 'jab', shift: [0, 6],
    knL: [-18, -12], ftL: [-22, 0], knR: [18, -30], ftR: [24, -14],
    head: { at: [0, -90], face: 'strain', look: [0, 1] },
    shL: [-16, -76], elL: [-10, -74], fiL: [0, -76], gloveL: { view: 'front', size: 1.9 },
    shR: [20, -76], elR: [30, -60], fiR: [34, -48], gloveR: { angle: 150 },
    frontOrder: ['R', 'L'],
  },
  // taunt: a quick hamstring stretch, glove to the toe
  stretch1: {
    extends: 'idle1', shift: [-4, 6],
    knL: [-20, -16], ftL: [-24, 0], knR: [22, -14], ftR: [34, -2],
    head: { at: [2, -92], face: 'grin', look: [1, 1] },
    elR: [28, -56], fiR: [30, -38], gloveR: { angle: 170 },
    elL: [-24, -60], fiL: [-12, -72],
  },
  stretch2: {
    extends: 'stretch1', shift: [0, -2],
    head: { at: [3, -94], face: 'grin', look: [1, 0] },
    fiR: [32, -34],
  },
};

export default {
  id: 'nova',
  build: 'lean',
  // his own body on the build: a sprinter: powerful thighs, long legs, a short torso
  body: { legLen: 1.08, torsoLen: 0.95, dims: { thigh: [7.6, 5.6], shin: [5.2, 3.9] } },
  palettes: { default: 'nova' },
  torsoMaterial: 'suit',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['shoeHi', 'shoe', 'shoeDk'],
    suit: ['suitHi', 'suit', 'suitDk', 'outline'],
    shorts: ['suitHi', 'suit', 'suitDk'],
    sock: ['shoeHi', 'shoe', 'shoeDk'],
    boot: ['shoeHi', 'shoe', 'shoeDk'],
    sole: ['chev', 'chevDk', 'outline'],
    hair: ['hairHi', 'hair', 'outline'],
    visor: ['visorHi', 'visor', 'outline'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    ears(ctx, H, ramps.skin, [1.7, 2.6]);
    skull(ctx, H, ramps.skin, 'narrow');
    // hair swept straight back, trailing in points behind the head
    // (a smaller crop than before, with spiky swept tips and scalp showing at the
    // hairline, so it reads as hair and not as a cap)
    const hr = ctx.mask().ellipse(x + lx * 0.3, y - 7, H.rx - 0.2, 5.2).cut(ctx.mask().rect(x - 14, y - 4, 28, 12));
    for (const [dx, dy] of [[-10, -2], [10, -2], [-8, -9], [8, -9], [-3, -12], [3, -12]]) hr.poly([[x + dx * 0.6, y + dy - 2], [x + dx * 1.3, y + dy - 1.5], [x + dx * 0.75, y + dy + 1]]);
    cv.part(hr, { ramp: ramps.hair, bevel: 2, inner: 'soft' });
    for (let i = -6; i <= 6; i += 2) if (hr.in(x + i, y - 4)) cv.px(x + i + lx * 0.3, y - 4, c('skin'));
    for (let k = 0; k < 6; k++) cv.px(x + 3 + lx * 0.3 + (k >> 1), y - 12 + k, c('streak'));
    // goggles pushed up high on the head (a thin strap, not a brim)
    const gg = ctx.mask().ellipse(x - 3.5 + lx * 0.3, y - 11, 2.4, 1.4).ellipse(x + 3.5 + lx * 0.3, y - 11, 2.4, 1.4);
    for (const s of [-1, 1]) cv.px(Math.round(x + s * 6.5 + lx * 0.3), y - 11, c('chevDk'));
    cv.part(gg, { ramp: ramps.visor, bevel: 1, inner: 'line', shadow: false });
    cv.px(x - 4 + lx * 0.3, y - 10, c('white')); cv.px(x + 3 + lx * 0.3, y - 10, c('white'));
    eyes(ctx, fx, fy, face, -1);
    for (const s of [-1, 1]) { const ex = fx + s * 8 - (s > 0 ? 2 : 0); cv.px(ex, fy - 3, c('lash')); cv.px(ex + s, fy - 4, c('lash')); }
    brows(ctx, fx, fy, face, ramps.hair, { len: 3.6, thick: 0.8, y: -4.4 });
    nose(ctx, fx, fy, ramps.skin, [1.6, 1.8], 3.4);
    mouth(ctx, fx, fy + 8, face, { w: 3 });
  },

  torso(ctx) {
    const { cv, J, c, D, pose } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, h = J.hip;
    const tm = ctx.torsoMask;
    // mock-neck collar, magenta chevrons pointing forward, a zip line
    cv.part(ctx.mask().rect(n[0] - 5, n[1] - 1, 10, 4).clip(tm.copy().add(ctx.mask().rect(n[0] - 5, n[1] - 3, 10, 4))), { ramp: ['suitHi', 'suit', 'suitDk', 'outline'].map(c), bevel: 1, inner: 'line', shadow: false });
    if (!pose.lying) {
      for (const k of [0, 7]) for (const s of [-1, 1]) cv.line(ch[0] + s * 13, ch[1] - 6 + k, ch[0] + s * 2, ch[1] + k, (X, Y) => { if (tm.in(X, Y)) { cv.px(X, Y, c('chev')); if (tm.in(X, Y + 1)) cv.px(X, Y + 1, c('chevDk')); } });
      for (let Y = Math.round(n[1] + 3); Y < w[1] - 2; Y += 2) if (tm.in(n[0], Y)) cv.px(n[0], Y, c('suitDk'));
    }
    // racing stripe on the trunks
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, w[1] - 3, D.waistW * 2 + 2, 2).clip(ctx.shortsMask), { ramp: ['chev', 'chev', 'chevDk'].map(c), bevel: 1, inner: 'line', shadow: false });
    if (!pose.lying) for (const s of [-1, 1]) cv.line(h[0] + s * (D.hipSpread + 5), h[1] - 3, h[0] + s * (D.hipSpread + 8), h[1] + 7, (X, Y) => { if (ctx.shortsMask.in(X, Y)) { cv.px(X, Y, c('white')); cv.px(X + s, Y, c('chev')); } });
  },
};
