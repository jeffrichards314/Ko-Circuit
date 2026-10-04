// Null: sprite layers on the medium build.
// Grey on grey. A smooth bald head with nothing on it but two small dark eyes,
// no brows, the faintest nose and a flat line of a mouth. A barcode on the side
// of his neck. Plain grey trunks with a white empty-set sign on the leg and a
// white tape waistband, grey gloves, grey boots.
// His tells are the idle frame with one or two pixels moved (n*Tell), and his
// only unprompted motion is a blink (the taunt, and his weak spot).

import { makePalette } from '../../../src/engine/palette.js';
import { ears, skull } from './_face.js';

const A = makePalette('null.A', {
  outline: [3, 3, 4],
  skinHi: [25, 25, 26], skin: [19, 19, 20], skinSh: [13, 13, 14], skinDk: [8, 8, 9],
  white: [29, 29, 30], mouth: [6, 6, 7], eye: [3, 3, 4],
  gloveHi: [13, 13, 14], glove: [8, 8, 9], gloveDk: [4, 4, 5],
});
const B = makePalette('null.B', {
  trunkHi: [14, 14, 15], trunk: [9, 9, 10], trunkDk: [5, 5, 6],
  tape: [27, 27, 28],
  bootHi: [12, 12, 13], boot: [6, 6, 7],
});
export const palettes = { null: { A, B } };

const FEET = { knL: [-13, -22], knR: [13, -22], ftL: [-16, 0], ftR: [16, 0] };
const poses = {
  // the tells: idle1 with a pixel or two moved
  nJabTell: { extends: 'idle1', elL: [-25, -61], fiL: [-11, -74] },                       // left glove up 2
  nHookTell: { extends: 'idle1', shR: [21, -81], elR: [26, -59], fiR: [12, -72] },          // right shoulder out 1
  nHookLTell: { extends: 'idle1', shL: [-21, -81], elL: [-26, -59], fiL: [-12, -72] },      // left shoulder out 1
  nBodyTell: { extends: 'idle1', shift: [0, 1], ...FEET, fiL: [-11, -70], fiR: [11, -70] }, // sinks 1, gloves 2
  nUpperTell: { extends: 'idle1', elR: [25, -58], fiR: [11, -71] },                         // right glove dips 1
  nEraseTell: { extends: 'idle1', shift: [0, -1], ...FEET, fiL: [-10, -73], fiR: [10, -73] }, // rises 1, gloves in
  blink: { extends: 'idle1', head: { at: [0, -100], face: 'blink', look: [0, 0] } },
};

export default {
  id: 'null',
  build: 'medium',
  // his own body on the build: too tall and too even, somehow
  body: { size: [0.94, 1.03] },
  palettes: { default: 'null' },
  torsoMaterial: 'skin',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['tape', 'tape', 'skinSh'],
    shorts: ['trunkHi', 'trunk', 'trunkDk'],
    sock: ['bootHi', 'boot', 'outline'],
    boot: ['bootHi', 'boot', 'outline'],
    sole: ['boot', 'outline', 'outline'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    ears(ctx, H, ramps.skin, [1.8, 3]);
    skull(ctx, H, ramps.skin, 'round');
    // two small dark eyes; a line when they close
    for (const s of [-1, 1]) {
      const ex = fx + s * 4 - (s > 0 ? 1 : 0);
      if (face === 'blink' || face === 'ko') { for (let i = -1; i <= 1; i++) cv.px(ex + i, fy + 1, c('skinDk')); continue; }
      if (face === 'hurt' || face === 'dazed') { cv.px(ex - 1, fy, c('eye')); cv.px(ex + 1, fy, c('eye')); cv.px(ex, fy + 1, c('eye')); continue; }
      const h = face === 'strain' ? 1 : 2;
      for (let j = 0; j < h; j++) for (let i = 0; i < 2; i++) cv.px(ex + i - (s < 0 ? 1 : 0), fy + j, c('eye'));
    }
    // the faintest nose, a flat mouth
    cv.shade(fx, fy + 3, 1); cv.shade(fx, fy + 4, 1); cv.shade(fx - 1, fy + 5, 1);
    const open = ['strain', 'hurt', 'wide'].includes(face);
    for (let i = -2; i <= 2; i++) cv.px(fx + i, fy + 8, c(open && Math.abs(i) < 2 ? 'mouth' : 'skinDk'));
    if (open) for (let i = -1; i <= 1; i++) cv.px(fx + i, fy + 9, c('mouth'));
  },

  torso(ctx) {
    const { cv, J, c, D, pose } = ctx;
    const n = J.neck, w = J.waist, h = J.hip;
    // a barcode on the side of his neck
    if (!pose.lying) for (const [dx, len] of [[5, 5], [6, 4], [8, 5], [10, 3], [11, 5]]) for (let k = 0; k < len; k++) cv.px(Math.round(n[0] + dx - 2), Math.round(n[1] - 7 + k), c(len === 5 ? 'eye' : 'skinDk'));
    // white tape waistband
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, w[1] - 3, D.waistW * 2 + 2, 3).clip(ctx.shortsMask), { ramp: ['tape', 'tape', 'skinSh'].map(c), bevel: 1, inner: 'line', shadow: false });
    // the empty-set sign on his left leg
    if (!pose.lying) {
      const cx = Math.round(h[0] - D.hipSpread - 5), cy = Math.round(h[1] + 3);
      for (let a = 0; a < 16; a++) { const t = (a / 16) * Math.PI * 2; const X = Math.round(cx + Math.cos(t) * 2.6), Y = Math.round(cy + Math.sin(t) * 2.6); if (ctx.shortsMask.in(X, Y)) cv.px(X, Y, c('tape')); }
      for (let k = -4; k <= 4; k++) if (ctx.shortsMask.in(cx + (k >> 1), cy - k)) cv.px(cx + (k >> 1), cy - k, c('tape'));
    }
  },
};
