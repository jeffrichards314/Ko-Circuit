// Frenzy: sprite layers on the lean build.
// Wild red hair sticking out in every direction, wide yellow eyes with pinprick
// pupils, a vein standing out on his forehead, a huge grin round a neon-blue
// mouthguard. The torn-off remains of a straitjacket: two canvas straps crossed
// over his chest with steel buckles, loose straps flapping from his waist. Red
// trunks, black gloves, black boots.
// `frenzy.hot` is him at full heat: skin flushed red, hair glowing.
// Poses: the cackle (head thrown back, gloves twitching up by his face).

import { makePalette, swapPalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './_face.js';

const A = makePalette('frenzy.A', {
  outline: [3, 1, 2],
  skinHi: [30, 23, 19], skin: [25, 16, 12], skinSh: [18, 10, 8], skinDk: [10, 5, 5],
  white: [31, 31, 29], mouth: [14, 2, 4], eye: [30, 26, 4], vein: [20, 6, 8],
  hairHi: [31, 18, 8], hair: [26, 6, 4], hairDk: [14, 2, 2],
  gloveHi: [12, 12, 14], glove: [5, 5, 7], gloveDk: [2, 2, 3],
});
const B = makePalette('frenzy.B', {
  strapHi: [26, 24, 20], strap: [19, 17, 14], strapDk: [11, 9, 7],
  buckle: [26, 26, 28],
  trunkHi: [28, 8, 8], trunk: [18, 3, 4], trunkDk: [9, 1, 2],
  bootHi: [10, 10, 12], boot: [4, 4, 6],
  guard: [8, 24, 31],
});
// full heat: flushed and glowing
const hotA = swapPalette('frenzy.hotA', A, {
  skinHi: [31, 20, 16], skin: [29, 11, 9], skinSh: [21, 6, 6], skinDk: [12, 2, 3],
  hairHi: [31, 30, 14], hair: [31, 18, 4], hairDk: [22, 6, 2], vein: [31, 28, 10],
});
export const palettes = { frenzy: { A, B }, 'frenzy.hot': { A: hotA, B } };

const poses = {
  // the cackle: head back, gloves twitching up by his face
  cackle1: {
    extends: 'idle1', shift: [0, -1],
    head: { at: [-2, -101], face: 'cackle', look: [0, -2] },
    elL: [-28, -72], fiL: [-22, -92], elR: [28, -70], fiR: [22, -90],
    gloveL: { angle: -20 }, gloveR: { angle: 25 },
  },
  cackle2: {
    extends: 'cackle1', shift: [0, 1],
    head: { at: [2, -100], face: 'cackle', look: [0, -1] },
    fiL: [-24, -88], fiR: [20, -94],
  },
};

export default {
  id: 'frenzy',
  build: 'lean',
  // his own body on the build: hunched and wiry, coiled
  body: { torsoLen: 0.94, neckLen: -1 },
  palettes: { default: 'frenzy' },
  torsoMaterial: 'skin',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['strapHi', 'strap', 'strapDk'],
    shorts: ['trunkHi', 'trunk', 'trunkDk'],
    sock: ['bootHi', 'boot', 'outline'],
    boot: ['bootHi', 'boot', 'outline'],
    sole: ['boot', 'outline', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    strap: ['strapHi', 'strap', 'strapDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    // wild hair: a mop of spikes going every which way
    const hr = ctx.mask().ellipse(x + lx * 0.3, y - 5, H.rx + 1.6, 8);
    const spikes = [[-12, 2, -18, -2], [-11, -5, -17, -12], [-7, -10, -9, -20], [-2, -12, -1, -22], [3, -12, 6, -21], [8, -10, 13, -17], [11, -4, 18, -9], [12, 2, 18, 3]];
    for (const [a, b, cx, cy] of spikes) hr.poly([[x + a - 2.4, y + b + 2], [x + cx, y + cy], [x + a + 2.4, y + b - 1]]);
    hr.cut(ctx.mask().rect(x - 8 + lx, y - 3, 16, 20));
    cv.part(hr, { ramp: ramps.hair, bevel: 2, inner: 'line' });
    ears(ctx, H, ramps.skin, [1.6, 2.6]);
    skull(ctx, H, ramps.skin, 'narrow');
    // fringe spikes over the forehead
    for (const [dx, len] of [[-6, 4], [-2, 5], [3, 4], [6, 3]]) cv.part(ctx.mask().poly([[x + dx - 2 + lx * 0.3, y - 8], [x + dx + 2 + lx * 0.3, y - 8], [x + dx + 1 + lx * 0.6, y - 8 + len]]), { ramp: ramps.hair, bevel: 1, inner: 'line', shadow: false });
    // the vein on his forehead
    for (const [dx, dy] of [[4, -5], [5, -6], [5, -4], [6, -3]]) cv.px(fx + dx, fy + dy, c('vein'));
    // eyes: wide, yellow, pinprick pupils
    const e = face === 'cackle' ? 'grin' : ['neutral', 'focus', 'strain'].includes(face) ? 'wide' : face;
    eyes(ctx, fx, fy, e, -1);
    if (e === 'wide') for (const s of [-1, 1]) { const ex = fx + s * 5 - (s > 0 ? 2 : 0); cv.px(ex, fy - 1, c('eye')); cv.px(ex + 1, fy - 1, c('eye')); cv.px(ex, fy, c('eye')); cv.px(ex + 1, fy, c('outline')); }
    brows(ctx, fx, fy, face === 'cackle' ? 'grin' : 'strain', ramps.hair, { len: 3.6, thick: 0.9, y: -5 });
    nose(ctx, fx, fy, ramps.skin, [1.5, 1.8], 3.4);
    // the grin round the mouthguard
    if (['hurt', 'dazed', 'ko'].includes(face)) { mouth(ctx, fx, fy + 8, face, { w: 3 }); return; }
    const w = face === 'cackle' ? 5 : 4;
    cv.flat(ctx.mask().ellipse(fx, fy + 8.5, w, face === 'cackle' ? 2.6 : 1.8), c('mouth'), true);
    for (let i = -w + 1; i < w; i++) cv.px(fx + i, fy + 8, c('guard'));
    cv.px(fx - w - 1, fy + 7, c('outline')); cv.px(fx + w, fy + 7, c('outline'));
  },

  torso(ctx) {
    const { cv, J, c, D, pose, ramps } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, h = J.hip, sL = J.shL, sR = J.shR;
    const tm = ctx.torsoMask;
    if (pose.lying) return;
    // two canvas straps crossed over the chest, a buckle where they cross
    const st = ctx.mask()
      .capsule(sL[0] + 3, sL[1] - 2, w[0] + D.waistW - 3, w[1] - 3, 2.3, 2.3)
      .capsule(sR[0] - 3, sR[1] - 2, w[0] - D.waistW + 3, w[1] - 3, 2.3, 2.3)
      .clip(tm);
    cv.part(st, { ramp: ramps.strap, bevel: 1, inner: 'line' });
    const bx = Math.round((sL[0] + sR[0]) / 2), by = Math.round(ch[1] + 4);
    cv.part(ctx.mask().rect(bx - 2, by - 2, 5, 5), { ramp: ['buckle', 'buckle', 'strapDk'].map(c), bevel: 1, inner: 'line', shadow: false });
    cv.px(bx, by, c('outline'));
    // loose straps hanging off his waist
    for (const s of [-1, 1]) {
      const x0 = Math.round(h[0] + s * (D.hipSpread + 6));
      cv.part(ctx.mask().rect(x0 - 1, w[1] - 2, 3, 12), { ramp: ramps.strap, bevel: 1, inner: 'line' });
      cv.px(x0, w[1] + 6, c('buckle'));
    }
  },
};
