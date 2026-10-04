// The Monk: sprite layers on the lean build.
// A shaved head, long earlobes, a calm face with the eyes closed (they only
// open when he strikes or gets hit), a saffron robe slung across one shoulder
// over a bare chest, a string of wooden beads, saffron trunks with a maroon
// sash, white wrist wraps, rope sandals, maroon gloves.
// His breath is his tell: inhale1/inhale2 are his calm stance with the chest
// and shoulders lifted one pixel, then two. meditate2 is the exhale (down one).
// The hands on the breath tell you which strike: palms together = straight,
// one palm peeling off = a hook from that side, palms sinking = low.
// float1/2: levitating cross-legged (the deep meditation).

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './_face.js';

const A = makePalette('monk.A', {
  outline: [3, 2, 2],
  skinHi: [30, 23, 16], skin: [25, 16, 10], skinSh: [18, 10, 7], skinDk: [10, 5, 4],
  white: [31, 31, 29], mouth: [12, 3, 4],
  hairHi: [21, 14, 10], hair: [14, 9, 6],
  gloveHi: [27, 10, 12], glove: [19, 4, 7], gloveDk: [10, 1, 4],
  bead: [20, 12, 6], beadHi: [27, 19, 10],
});
const B = makePalette('monk.B', {
  robeHi: [31, 22, 6], robe: [28, 14, 2], robeDk: [17, 7, 1],
  maroon: [17, 4, 6], maroonDk: [9, 1, 3],
  wrap: [29, 28, 24], wrapSh: [20, 19, 17],
  sandal: [18, 12, 6], sandalDk: [10, 6, 3],
});
export const palettes = { monk: { A, B } };

// palms pressed together before the chest
const CALM = {
  extends: 'idle1', ...{ knL: [-12, -22], knR: [12, -22], ftL: [-14, 0], ftR: [14, 0] },
  head: { at: [0, -100], face: 'neutral', look: [0, 0] },
  elL: [-20, -60], fiL: [-4, -76], elR: [20, -60], fiR: [4, -76],
  gloveL: { angle: 24 }, gloveR: { angle: -24 },
};
const FEET = { knL: [-12, -22], knR: [12, -22], ftL: [-14, 0], ftR: [14, 0] };
const poses = {
  meditate1: CALM,
  meditate2: { extends: 'meditate1', shift: [0, 1], ...FEET },
  inhale1: { extends: 'meditate1', shift: [0, -1], ...FEET },
  inhale2: { extends: 'meditate1', shift: [0, -2], ...FEET, head: { at: [0, -102], face: 'neutral', tilt: 'up', look: [0, -1] } },
  // the breath before a hook: the striking palm peels off the other (viewer-right
  // for Crane Wing, viewer-left for Tiger Claw); before the Root Strike both palms sink
  inhaleR: { extends: 'inhale2', elR: [25, -66], fiR: [17, -86], gloveR: { angle: -10 } },
  inhaleL: { mirror: 'inhaleR' },
  inhaleLow: { extends: 'meditate1', shift: [0, -1], ...FEET, fiL: [-5, -68], fiR: [5, -68], head: { at: [0, -100], face: 'neutral', tilt: 'down', look: [0, 1] } },
  // Still Water: both palms driven straight out
  palmOut: {
    extends: 'jab', shift: [0, 2],
    head: { at: [0, -97], face: 'wide', look: [0, 1] },
    shL: [-16, -80], elL: [-14, -70], fiL: [-7, -68], gloveL: { view: 'front', size: 1.4 },
    shR: [16, -80], elR: [14, -70], fiR: [7, -68], gloveR: { view: 'front', size: 1.4 },
    frontOrder: ['L', 'R'],
  },
  // floating cross-legged, eyes shut
  float1: {
    hip: [0, -46], waist: [0, -56], chest: [0, -74], neck: [0, -89],
    head: { at: [0, -102], face: 'neutral', look: [0, 0] },
    shL: [-18, -83], shR: [18, -83],
    elL: [-22, -64], fiL: [-14, -52], elR: [22, -64], fiR: [14, -52],
    knL: [-22, -38], knR: [22, -38], ftL: [8, -30], ftR: [-8, -30],
    gloveL: { angle: 160 }, gloveR: { angle: -160 },
  },
  float2: { extends: 'float1', shift: [0, -2] },
  bow: {
    extends: 'meditate1', shift: [0, 3], ...FEET,
    head: { at: [0, -93], face: 'neutral', tilt: 'down', look: [0, 2] },
    fiL: [-4, -72], fiR: [4, -72],
  },
};

export default {
  id: 'monk',
  build: 'lean',
  // his own body on the build: small and compact, rooted low
  body: { size: [0.93, 0.92], legLen: 0.95 },
  palettes: { default: 'monk' },
  torsoMaterial: 'skin',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['wrap', 'wrap', 'wrapSh'],
    shorts: ['robeHi', 'robe', 'robeDk'],
    boot: ['sandal', 'sandal', 'sandalDk'],
    sole: ['sandalDk', 'outline', 'outline'],
    hair: ['hairHi', 'hair', 'outline'],
    robe: ['robeHi', 'robe', 'robeDk', 'outline'],
    maroon: ['maroon', 'maroon', 'maroonDk'],
    bead: ['beadHi', 'bead', 'outline'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';
    const calm = face === 'neutral' || face === 'grin' || face === 'focus';

    // long earlobes
    ears(ctx, H, ramps.skin, [2, 3.2]);
    cv.part(ctx.mask().ellipse(x - H.rx + 0.6 + lx * 0.3, y + 4, 1.6, 2.6).ellipse(x + H.rx - 0.6 + lx * 0.3, y + 4, 1.6, 2.6), { ramp: ramps.skin, bevel: 1 });
    const hm = skull(ctx, H, ramps.skin, 'round');
    // shaved: just the shine on the crown, and a faint hairline
    for (let X = Math.round(x - H.rx + 2); X <= x + H.rx - 2; X++) if (hm.in(X, y - 5) && (X & 1)) cv.shade(X, y - 6, 1);
    cv.px(x - 4 + lx, y - 9, c('skinHi')); cv.px(x - 3 + lx, y - 10, c('white'));
    if (calm) {
      // eyes closed: two soft downward arcs
      for (const s of [-1, 1]) {
        const ex = fx + s * 5 - (s > 0 ? 0 : 3);
        cv.px(ex, fy - 1, c('outline')); cv.px(ex + 1, fy, c('outline')); cv.px(ex + 2, fy, c('outline')); cv.px(ex + 3, fy - 1, c('outline'));
        cv.shade(ex + 1, fy + 1, 1); cv.shade(ex + 2, fy + 1, 1);
      }
    } else eyes(ctx, fx, fy, face, 0);
    brows(ctx, fx, fy, calm ? 'neutral' : face, ramps.hair, { len: 4, thick: 0.9, y: -4.4 });
    nose(ctx, fx, fy, ramps.skin, [1.8, 2], 3.6);
    if (calm) { for (let i = -2; i <= 2; i++) cv.px(fx + i, fy + 8 + (Math.abs(i) === 2 ? -1 : 0), c('mouth')); }
    else mouth(ctx, fx, fy + 8, face, { w: 3 });
  },

  torso(ctx) {
    const { cv, J, c, D, ramps, pose } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest;
    const tm = ctx.torsoMask;
    // the robe slung over his left shoulder and across to the right hip
    const sl = J.shL, fold = ctx.mask().poly([
      [sl[0] - D.deltoid - 1, sl[1] - 3], [sl[0] + 6, sl[1] - 5], [w[0] + D.waistW + 3, w[1] - 7],
      [w[0] + D.waistW + 3, w[1] + 1], [w[0] + D.waistW - 7, w[1] + 1], [sl[0] - D.deltoid + 2, sl[1] + 9],
    ]).clip(tm.copy().add(ctx.mask().ellipse(sl[0], sl[1], D.deltoid + 2, D.deltoid + 2)));
    cv.part(fold, { ramp: ramps.robe, bevel: 2, inner: 'line' });
    for (let k = 0; k < 2; k++) cv.line(sl[0] + 1 + k * 4, sl[1] + 1 + k, w[0] + D.waistW - 4 + k * 3, w[1] - 3, (X, Y) => { if (fold.in(X, Y)) cv.shade(X, Y, 1); });
    for (const s of [-1, 1]) cv.line(ch[0] + s * 3, ch[1] + 5, ch[0] + s * (D.chestW - 5), ch[1] + 4, (X, Y) => { if (tm.in(X, Y) && !fold.in(X, Y)) cv.shade(X, Y, 1); });
    // prayer beads
    if (!pose.lying) {
      for (let k = -6; k <= 6; k++) {
        const X = Math.round(n[0] + k * 1.3), Y = Math.round(n[1] + 2 + (1 - (k / 6) ** 2) * 11);
        cv.part(ctx.mask().ellipse(X, Y, 1.2, 1.2), { ramp: ramps.bead, bevel: 1, inner: 'line', shadow: false });
      }
    }
    // maroon sash knotted at the waist
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, w[1] - 3, D.waistW * 2 + 2, 3).clip(ctx.shortsMask), { ramp: ramps.maroon, bevel: 1, inner: 'line', shadow: false });
    if (!pose.lying) cv.part(ctx.mask().poly([[w[0] + 5, w[1] - 1], [w[0] + 8, w[1] - 1], [w[0] + 9, w[1] + 8], [w[0] + 6, w[1] + 7]]), { ramp: ramps.maroon, bevel: 1, inner: 'line', shadow: false });
  },
};
