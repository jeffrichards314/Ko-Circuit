// Tightrope Tess: sprite layers on the lean build.
// High-wire acrobat: dark hair in a high bun with a jewelled band, a teal
// sequinned leotard with a pink sash and a spangle of star sequins, sheer
// pink tights, pale ballet flats, taped wrists, pink gloves. Poses cover her
// sways (the evasive modifier), the flip (tuck) and the wobbly landing.

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './_face.js';

const A = makePalette('tess.A', {
  outline: [3, 2, 4],
  skinHi: [31, 25, 20], skin: [28, 19, 14], skinSh: [21, 12, 10], skinDk: [12, 6, 7],
  white: [31, 31, 31], mouth: [22, 5, 9],
  hairHi: [12, 7, 5], hair: [6, 3, 3],
  gloveHi: [31, 20, 26], glove: [29, 10, 19], gloveDk: [17, 4, 11],
  lash: [4, 2, 6],
});
const B = makePalette('tess.B', {
  tealHi: [12, 29, 27], teal: [4, 21, 21], tealDk: [2, 11, 13],
  sequin: [26, 31, 30], gold: [31, 26, 8],
  tightHi: [31, 24, 25], tight: [27, 17, 19], tightSh: [20, 11, 14],
  flatHi: [31, 29, 29], flat: [27, 23, 25], flatDk: [18, 14, 17],
  tape: [29, 29, 27],
});
export const palettes = { tess: { A, B } };

const poses = {
  // sways away from your punch (evade)
  swayL: {
    extends: 'idle1', shift: [-8, 2],
    knL: [-17, -21], knR: [9, -23], ftL: [-16, 0], ftR: [16, 0],
    hip: [-4, -42], waist: [-8, -53],
    head: { at: [-22, -94], face: 'grin', tilt: 'down', look: [-2, 0] },
    neck: [-17, -84], chest: [-12, -70],
    shL: [-32, -76], shR: [8, -80],
    elL: [-40, -56], fiL: [-32, -70], elR: [14, -60], fiR: [-6, -72],
  },
  swayR: { mirror: 'swayL' },
  // the flip: crouch and swing the arms back...
  flipTell: {
    extends: 'idle1', shift: [0, 9],
    knL: [-17, -16], knR: [17, -16], ftL: [-16, 0], ftR: [16, 0],
    head: { at: [0, -88], face: 'focus', look: [0, 1] },
    elL: [-28, -52], elR: [28, -52], fiL: [-34, -38], fiR: [34, -38],
    gloveL: { angle: -150 }, gloveR: { angle: 150 },
  },
  // ...and she's up and over, tucked
  tuck: {
    hip: [0, -86], waist: [0, -94], chest: [0, -106], neck: [0, -116],
    head: { at: [0, -126], face: 'strain', tilt: 'down', look: [0, 2] },
    shL: [-15, -112], shR: [15, -112],
    elL: [-20, -98], elR: [20, -98], fiL: [-10, -90], fiR: [10, -90],
    knL: [-11, -98], knR: [11, -98], ftL: [-8, -80], ftR: [8, -80],
    gloveL: { view: 'front', size: 1.2 }, gloveR: { view: 'front', size: 1.2 },
  },
  // the drop onto you: both gloves down first
  flipStrike: {
    extends: 'overhead1', shift: [0, -4],
    head: { at: [0, -97], face: 'strain', look: [0, 1] },
  },
  // the landing: wobbling, arms out for balance. Hit her NOW.
  land1: {
    extends: 'idle1', shift: [-2, 4],
    knL: [-16, -18], knR: [15, -20], ftL: [-18, 0], ftR: [14, 0],
    head: { at: [-4, -94], face: 'wide', look: [-1, 0] },
    elL: [-36, -78], elR: [34, -70], fiL: [-50, -84], fiR: [50, -66],
    gloveL: { angle: -60 }, gloveR: { angle: 110 },
  },
  land2: {
    extends: 'land1', shift: [3, 0],
    head: { at: [3, -95], face: 'strain', look: [1, 0] },
    elL: [-34, -70], elR: [36, -78], fiL: [-50, -66], fiR: [50, -84],
    gloveL: { angle: -110 }, gloveR: { angle: 60 },
  },
  // taunt: balancing on one foot as if on the wire
  balance: {
    extends: 'idle1', shift: [0, -1],
    knR: [12, -38], ftR: [6, -26], knL: [-4, -22], ftL: [-2, 0],
    head: { at: [0, -101], face: 'grin', tilt: 'up', look: [0, -1] },
    elL: [-34, -86], elR: [34, -86], fiL: [-48, -90], fiR: [48, -90],
    gloveL: { angle: -80 }, gloveR: { angle: 80 },
  },
  curtsy: {
    extends: 'idle1', shift: [0, 3],
    knL: [-10, -20], knR: [8, -18], ftL: [-6, 0], ftR: [14, 0],
    head: { at: [2, -96], face: 'grin', tilt: 'down', look: [1, 1] },
    elL: [-30, -58], elR: [30, -58], fiL: [-40, -46], fiR: [40, -46],
  },
};

export default {
  id: 'tess',
  build: 'lean',
  // his own body on the build: a small acrobat: long legs, short torso, slim arms
  body: { size: [0.9, 0.92], legLen: 1.08, torsoLen: 0.94, shoulders: 0.9, dims: { waistW: 11, chestW: 15 } },
  palettes: { default: 'tess' },
  torsoMaterial: 'teal',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['tape', 'tape', 'flatDk'],
    teal: ['tealHi', 'teal', 'tealDk', 'outline'],
    shorts: ['tealHi', 'teal', 'tealDk'],
    sock: ['tightHi', 'tight', 'tightSh'],
    boot: ['flatHi', 'flat', 'flatDk'],
    sole: ['flatDk', 'tightSh', 'outline'],
    hair: ['hairHi', 'hair', 'outline'],
    sash: ['tightHi', 'glove', 'gloveDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    ears(ctx, H, ramps.skin, [1.8, 2.8]);
    skull(ctx, H, ramps.skin, 'narrow');
    // hair scraped back into a high bun with a jewelled band
    const hr = ctx.mask().ellipse(x + lx * 0.3, y - 6, H.rx + 0.4, 6.5).cut(ctx.mask().rect(x - 14, y - 4, 28, 12));
    hr.rect(x - Math.round(H.rx), y - 5, 2, 4).rect(x + Math.round(H.rx) - 2, y - 5, 2, 4);
    cv.part(hr, { ramp: ramps.hair, bevel: 3, inner: 'line' });
    const cy = y + (H.tilt === 'up' ? -1 : H.tilt === 'down' ? 1 : 0);
    cv.part(ctx.mask().ellipse(x + lx * 0.2, cy - 15, 5, 4.2), { ramp: ramps.hair, bevel: 2, inner: 'line' });
    for (let i = -4; i <= 4; i += 2) cv.px(x + i + lx * 0.2, cy - 12, c(i === 0 ? 'gold' : 'sequin'));
    for (const dx of [-5, -1, 3]) cv.line(x + dx, y - 12, x + dx * 0.6, y - 5, (X, Y) => { if (hr.in(X, Y)) cv.shade(X, Y, -1); });
    eyes(ctx, fx, fy, face, -1);
    // long lashes
    for (const s of [-1, 1]) { const ex = fx + s * 8 - (s > 0 ? 2 : 0); cv.px(ex, fy - 3, c('lash')); cv.px(ex + s, fy - 4, c('lash')); }
    brows(ctx, fx, fy, face, ramps.hair, { len: 3.8, thick: 0.8, y: -4.2 });
    nose(ctx, fx, fy, ramps.skin, [1.6, 1.8], 3.4);
    mouth(ctx, fx, fy + 8, face, { w: 3 });
    if (!['hurt', 'ko', 'dazed', 'strain', 'wide'].includes(face)) { cv.px(fx - 1, fy + 8, c('mouth')); cv.px(fx, fy + 8, c('mouth')); cv.px(fx + 1, fy + 8, c('mouth')); }
    for (const s of [-1, 1]) cv.px(fx + s * 6 - (s > 0 ? 1 : 0), fy + 4, c('tightHi')); // rouge
  },

  torso(ctx) {
    const { cv, J, c, D, pose } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest;
    const tm = ctx.torsoMask;
    // bare shoulders + sweetheart neckline
    for (const s of ['L', 'R']) cv.part(ctx.mask().ellipse(J['sh' + s][0], J['sh' + s][1], D.deltoid + 1.4, D.deltoid + 1).clip(tm), { ramp: ['skinHi', 'skin', 'skinSh', 'skinDk'].map(c), bevel: 3, shadow: false });
    cv.part(ctx.mask().ellipse(n[0], n[1] + 2, 7, 5).clip(tm), { ramp: ['skinHi', 'skin', 'skinSh', 'skinDk'].map(c), bevel: 3, inner: 'line', shadow: false });
    // sequins
    for (let y = 0; y < tm.h; y++) for (let x = 0; x < tm.w; x++) if (tm.in(x, y) && (x * 5 + y * 3) % 11 === 0 && cv.idx[y * cv.w + x] === 0) cv.px(x, y, c('sequin'));
    // pink sash across the waist, star at the hip
    if (!pose.lying) {
      const sa = ctx.mask().capsule(w[0] - D.waistW - 2, w[1] - 6, w[0] + D.waistW + 2, w[1] - 2, 1.8, 1.8).clip(tm);
      cv.part(sa, { ramp: ['tightHi', 'glove', 'gloveDk'].map(c), bevel: 1, inner: 'line', shadow: false });
      const sx = Math.round(ch[0] + 7), sy = Math.round(ch[1] + 4);
      cv.stamp(['..g..', '.ggg.', 'ggggg', '.g.g.'], sx - 2, sy - 2, { g: c('gold') });
    }
  },
};
