// Rocksteady Reuben (#61): sprite layers on the heavy build, in black and white: greys
// only, like a fight on a 1950s television.
// A slugger: a crew cut, a heavy brow and a jaw like a cinder block, a broken nose,
// a thick neck, a barrel chest, white trunks with a black stripe and his initial on
// them, black gloves and high black boots with white laces, a towel round his neck.
// Poses: hugTell / hug (both arms spread wide, then closing: the clinch) and holding
// (the squeeze: the open step while he has you).

import { makePalette, swapPalette } from '../../../../src/engine/palette.js';
import { eyes, mouth, ears, skull, nose } from '../_face.js';

const A = makePalette('reuben.A', {
  outline: [1, 1, 1],
  skinHi: [28, 28, 28], skin: [22, 22, 22], skinSh: [14, 14, 14], skinDk: [7, 7, 7],
  white: [31, 31, 31], mouth: [6, 6, 6],
  hairHi: [12, 12, 12], hair: [4, 4, 4], hairDk: [1, 1, 1],
  gloveHi: [15, 15, 15], glove: [6, 6, 6], gloveDk: [2, 2, 2],
});
const B = makePalette('reuben.B', {
  trunkHi: [31, 31, 31], trunk: [27, 27, 27], trunkSh: [17, 17, 17],
  stripe: [3, 3, 3], stripeHi: [10, 10, 10],
  bootHi: [14, 14, 14], boot: [6, 6, 6], bootDk: [2, 2, 2],
  laces: [29, 29, 29],
  towelHi: [30, 30, 30], towel: [23, 23, 23], towelSh: [14, 14, 14],
});
// His alternate colours (Phase F, spec §16): the 1950s television in colour. A hue turn can't recolour a grey figure,
// so this one is made by hand: a ruddy slugger with red gloves, a blue stripe and a yellow towel.
const colA = swapPalette('reuben.color.A', A, {
  skinHi: [31, 24, 18], skin: [27, 17, 12], skinSh: [19, 11, 8], skinDk: [10, 5, 4],
  hairHi: [16, 10, 5], hair: [9, 5, 2], hairDk: [4, 2, 1],
  gloveHi: [31, 14, 12], glove: [26, 4, 5], gloveDk: [13, 2, 3],
});
const colB = swapPalette('reuben.color.B', B, {
  trunkSh: [17, 17, 24], stripe: [4, 8, 22], stripeHi: [10, 16, 30],
  bootHi: [18, 11, 6], boot: [11, 6, 3], bootDk: [5, 3, 1],
  towelHi: [31, 30, 14], towel: [28, 22, 4], towelSh: [17, 12, 2],
});
export const palettes = { reuben: { A, B }, 'reuben.color': { A: colA, B: colB } };

const FEET = { knL: [-15, -20], knR: [15, -20], ftL: [-17, 0], ftR: [17, 0] };
const poses = {
  // both arms spread wide and open: the bear hug coming
  hugTell: {
    extends: 'idle1', shift: [0, 3], ...FEET,
    head: { at: [0, -97], face: 'strain', look: [0, 1] },
    shL: [-21, -80], elL: [-40, -78], fiL: [-52, -82], gloveL: { angle: -80, view: 'back' },
    shR: [21, -80], elR: [40, -78], fiR: [52, -82], gloveR: { angle: 80, view: 'back' },
  },
  // closing in: both arms swinging round to your back
  hug: {
    extends: 'idle1', shift: [0, 5], ...FEET,
    head: { at: [0, -95], face: 'strain', tilt: 'down', look: [0, 1] },
    shL: [-19, -78], elL: [-12, -66], fiL: [6, -62], gloveL: { view: 'front', size: 1.3 },
    shR: [19, -78], elR: [12, -66], fiR: [-6, -64], gloveR: { view: 'front', size: 1.3 },
    frontOrder: ['L', 'R'],
  },
  // squeezing: hunched over, arms locked tight round nothing but you
  holding: {
    extends: 'hug', shift: [0, 1], ...FEET,
    head: { at: [0, -93], face: 'grin', tilt: 'down', look: [0, 2] },
    fiL: [8, -60], fiR: [-8, -62],
  },
};

export default {
  id: 'reuben',
  build: 'heavy',
  // his own body: a slab: a huge trunk, no neck, arms like logs
  body: { size: [1.1, 1.0], legLen: 0.92, torsoLen: 1.06, shoulders: 1.12, neckLen: -2, dims: { neck: 10, chestW: 27, waistW: 22, belly: 6, upperArm: [8.4, 7], forearm: [7, 5.8] } },
  palettes: { default: 'reuben' },
  torsoMaterial: 'skin',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['laces', 'laces', 'trunkSh'],
    shorts: ['trunkHi', 'trunk', 'trunkSh'],
    sock: ['laces', 'trunk', 'trunkSh'],
    boot: ['bootHi', 'boot', 'bootDk'],
    sole: ['boot', 'bootDk', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    towel: ['towelHi', 'towel', 'towelSh'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';
    ears(ctx, H, ramps.skin, [3, 3.8]);
    const hm = skull(ctx, H, ramps.skin, 'square');
    // a crew cut: a bristle of short hair, flat on top
    const top = ctx.mask().rect(x - H.rx + 0.5 + lx * 0.3, y - H.ry - 2, H.rx * 2 - 1, 9).cut(ctx.mask().rect(x - 20, y - 4, 40, 20));
    cv.part(top, { ramp: ramps.hair, bevel: 2, inner: 'line' });
    for (let X = x - 8; X <= x + 8; X += 2) for (let Y = y - H.ry - 1; Y < y - 5; Y += 2) cv.px(X + lx * 0.3, Y, c('hairHi'));
    // a heavy brow, small hard eyes, a broken nose, a scar through one brow
    eyes(ctx, fx, fy, face === 'neutral' ? 'focus' : face, 1);
    cv.part(ctx.mask().capsule(fx - 9, fy - 2.6, fx - 1, fy - 2, 2, 1.7).capsule(fx + 1, fy - 2, fx + 9, fy - 2.6, 1.7, 2), { ramp: ramps.hair, bevel: 1, inner: 'soft' });
    nose(ctx, fx + 1, fy, ramps.skin, [3, 2.5], 3.6);
    cv.px(fx - 5, fy - 4, c('skinHi')); cv.px(fx - 4, fy - 3, c('skinHi')); cv.px(fx - 3, fy - 1, c('skinHi'));
    const m = mouth(ctx, fx, fy + 8, face === 'grin' ? 'teeth' : face, { w: 4 });
    if (m == null) for (let i = -4; i <= 3; i++) cv.px(fx + i, fy + 8, c('outline'));
    for (let j = 6; j <= 12; j++) for (let i = -9; i <= 9; i++) if (hm.in(fx + i, fy + j) && (i + j) % 2 === 0 && Math.abs(i) > 2) cv.shade(fx + i, fy + j, 1); // stubble
    ctx.headMask = hm;
  },

  torso(ctx) {
    const { cv, J, c, ramps, D, pose } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, tm = ctx.torsoMask;
    for (const s of [-1, 1]) cv.line(ch[0] + s * 3, ch[1] + 2, ch[0] + s * 18, ch[1] + 1, (X, Y) => cv.shade(X, Y, 1));
    cv.line(ch[0], ch[1] - 6, w[0], w[1] - 4, (X, Y) => cv.shade(X, Y, 1));
    // a towel round his neck, hanging down both sides of the chest
    for (const s of [-1, 1]) cv.part(ctx.mask().poly([[n[0] + s * 4, n[1] + 1], [n[0] + s * 12, n[1] + 3], [n[0] + s * 10, ch[1] + 8], [n[0] + s * 4, ch[1] + 6]]).clip(tm), { ramp: ramps.towel, bevel: 2, inner: 'line', shadow: false });
    if (pose.lying) return;
    // the trunks: a black stripe up the side and a big R on the belt
    const by = Math.round(w[1] - 1), sm = ctx.shortsMask;
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, by - 2, D.waistW * 2 + 2, 5).clip(ctx.mask().add(tm).add(sm)), { ramp: ['stripeHi', 'stripe', 'stripe'].map(c), bevel: 1, inner: 'line', shadow: false });
    for (const s of [-1, 1]) for (let Y = by + 3; Y < J.hip[1] + 14; Y++) for (let dx = 0; dx < 3; dx++) { const X = Math.round(J.hip[0] + s * (D.hipSpread + D.thigh[0] - 2) + (s > 0 ? -dx : dx)); if (sm.in(X, Y)) cv.px(X, Y, c('stripe')); }
    // the R
    const R = ['###.', '#..#', '###.', '#.#.', '#..#'];
    R.forEach((row, j) => { for (let i = 0; i < 4; i++) if (row[i] === '#') cv.px(w[0] - 2 + i, by + 6 + j, c('stripe')); });
  },
};
