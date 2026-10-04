// Mayor McBride: sprite layers on the heavy build.
// Four-term mayor and Metro champion: silver hair with a perfect side part and
// mutton chops, a campaign-poster grin with gleaming teeth, a big ruddy face,
// a crimson "MAYOR" sash with gold trim over his bare chest, a gold rosette,
// navy trunks with a gold waistband and stars, navy socks, black dress shoes,
// crimson gloves. The `mcbride.hype` palette swap is his glow when the crowd
// meter is full.

import { makePalette, swapPalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './_face.js';

const A = makePalette('mcbride.A', {
  outline: [3, 2, 3],
  skinHi: [31, 25, 20], skin: [29, 19, 15], skinSh: [22, 12, 10], skinDk: [13, 6, 6],
  white: [31, 31, 31], mouth: [14, 2, 4], ruddy: [29, 12, 11],
  hairHi: [30, 30, 31], hair: [21, 21, 24], hairDk: [12, 12, 15],
  gloveHi: [31, 12, 12], glove: [23, 3, 6], gloveDk: [12, 1, 3],
});
const B = makePalette('mcbride.B', {
  sashHi: [29, 8, 10], sash: [21, 3, 6], sashDk: [11, 1, 3],
  goldHi: [31, 30, 14], gold: [29, 22, 4], goldDk: [18, 11, 2],
  navyHi: [9, 12, 24], navy: [5, 7, 17], navyDk: [2, 3, 9],
  shoeHi: [11, 11, 14], shoe: [5, 5, 7], shoeDk: [2, 2, 3],
  blue: [8, 18, 30],
});
// full crowd meter: he glows gold and flushes red with pride
const hypeA = swapPalette('mcbride.hypeA', A, { skinHi: [31, 28, 20], skin: [31, 21, 14], skinSh: [26, 13, 9], gloveHi: [31, 26, 14], glove: [31, 13, 5] });
const hypeB = swapPalette('mcbride.hypeB', B, { sashHi: [31, 26, 12], sash: [31, 14, 6], navyHi: [18, 18, 28] });
export const palettes = { mcbride: { A, B }, 'mcbride.hype': { A: hypeA, B: hypeB } };

const poses = {
  // waving to the crowd: the opening
  wave1: {
    extends: 'idle1', shift: [-1, 0],
    head: { at: [-3, -101], face: 'grin', look: [-2, -1] },
    elR: [36, -88], fiR: [34, -112], gloveR: { angle: -10 },
    elL: [-28, -60], fiL: [-14, -58], gloveL: { angle: 60 },
  },
  wave2: {
    extends: 'wave1',
    elR: [38, -86], fiR: [44, -108], gloveR: { angle: 25 },
  },
  // taunt: points at the crowd, "I'm with YOU!"
  point: {
    extends: 'idle1', shift: [1, 0],
    head: { at: [3, -101], face: 'grin', look: [2, -1] },
    elR: [40, -80], fiR: [52, -86], gloveR: { angle: 80 },
    elL: [-27, -58], fiL: [-12, -68],
  },
};

export default {
  id: 'mcbride',
  build: 'heavy',
  // his own body on the build: a portly politician: all belly and handshake
  body: { size: [1.06, 0.96], legLen: 0.9, dims: { belly: 12, waistW: 22 } },
  palettes: { default: 'mcbride' },
  torsoMaterial: 'skin',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['white', 'goldHi', 'gold', 'goldDk'],
    shorts: ['navyHi', 'navy', 'navyDk'],
    sock: ['navyHi', 'navy', 'navyDk'],
    boot: ['shoeHi', 'shoe', 'shoeDk'],
    sole: ['shoe', 'shoeDk', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    sash: ['sashHi', 'sash', 'sashDk'],
    gold: ['goldHi', 'gold', 'goldDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    ears(ctx, H, ramps.skin, [2.6, 3.6]);
    const hm = skull(ctx, H, ramps.skin, 'square');
    // jowls
    cv.part(ctx.mask().ellipse(fx - 7, fy + 8, 3.4, 3).ellipse(fx + 7, fy + 8, 3.4, 3).cut(ctx.mask().ellipse(fx, fy + 6, 5, 6)), { ramp: ramps.skin, bevel: 2, inner: 'soft', shadow: false });
    // silver hair: a big side-parted wave
    const hr = ctx.mask().ellipse(x + lx * 0.3, y - 7, H.rx + 1, 7).cut(ctx.mask().rect(x - 15, y - 5, 30, 14));
    hr.ellipse(x + 3 + lx * 0.4, y - 10, 8, 4.5);
    cv.part(hr, { ramp: ramps.hair, bevel: 3, inner: 'line' });
    cv.line(x - 5, y - 13, x - 4, y - 6, (X, Y) => cv.shade(X, Y, 1));
    for (const [dx, dy] of [[1, -12], [4, -13], [7, -11]]) cv.shade(x + dx, y + dy, -1);
    // mutton chops
    const mc = ctx.mask().poly([[x - H.rx + 0.5, y - 4], [x - H.rx + 2.5, y - 3], [x - H.rx + 3.5, y + 4], [x - H.rx + 1.5, y + 5]])
      .poly([[x + H.rx - 0.5, y - 4], [x + H.rx - 2.5, y - 3], [x + H.rx - 3.5, y + 4], [x + H.rx - 1.5, y + 5]]);
    cv.part(mc.clip(hm), { ramp: ramps.hair, bevel: 1, inner: 'line', shadow: false });
    for (const s of [-1, 1]) { cv.px(fx + s * 6, fy + 3, c('ruddy')); cv.px(fx + s * 6 - s, fy + 4, c('ruddy')); }
    eyes(ctx, fx, fy, face, 0);
    brows(ctx, fx, fy, face, ramps.hair, { len: 4.6, thick: 1.2, y: -4 });
    nose(ctx, fx, fy, ['skinHi', 'ruddy', 'skinSh', 'skinDk'].map(c), [2.6, 2.4], 3.5);
    // the campaign grin: extra wide, extra white
    if (face === 'grin' || face === 'neutral') {
      const my = fy + 8;
      cv.flat(ctx.mask().rect(fx - 5, my, 10, 3), c('mouth'), true);
      for (let i = -4; i < 5; i++) cv.px(fx + i, my, c('white'));
      for (let i = -4; i < 5; i += 2) cv.px(fx + i, my + 1, c('white'));
      cv.px(fx - 6, my - 1, c('outline')); cv.px(fx + 5, my - 1, c('outline'));
      if ((x + y) % 2 === 0) cv.px(fx - 2, my, c('hairHi'));
    } else mouth(ctx, fx, fy + 8, face, { w: 4.6 });
  },

  torso(ctx) {
    const { cv, J, c, ramps, D, pose } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, h = J.hip;
    const tm = ctx.torsoMask;
    // chest + belly definition
    cv.line(ch[0] - 10, ch[1] - 1, ch[0] - 2, ch[1] + 1, (X, Y) => cv.shade(X, Y, 1));
    cv.line(ch[0] + 10, ch[1] - 1, ch[0] + 2, ch[1] + 1, (X, Y) => cv.shade(X, Y, 1));
    cv.px(w[0], w[1] - 5, c('skinDk'));
    // the sash: viewer-left shoulder down to the viewer-right hip
    if (!pose.lying) {
      const sa = ctx.mask().capsule(J.shL[0] + 3, J.shL[1] - 2, w[0] + D.waistW - 2, w[1] - 1, 5, 5).clip(tm);
      cv.part(sa, { ramp: ramps.sash, bevel: 2, inner: 'line' });
      for (const s of [-1, 1]) cv.line(J.shL[0] + 3 + s * 4, J.shL[1] - 2 - s * 2, w[0] + D.waistW - 2 + s * 4, w[1] - 1 - s * 3, (X, Y) => { if (sa.in(X, Y)) cv.px(X, Y, c('gold')); });
      // "MAYOR" lettering hint along the sash
      for (let k = 0; k < 5; k++) { const X = Math.round(J.shL[0] + 7 + k * 5), Y = Math.round(J.shL[1] + 4 + k * 5.4); if (sa.in(X, Y)) { cv.px(X, Y, c('goldHi')); cv.px(X + 1, Y, c('goldHi')); } }
      // rosette
      const rx = Math.round(ch[0] - 8), ry = Math.round(ch[1] - 6);
      cv.part(ctx.mask().ellipse(rx, ry, 4, 4), { ramp: ramps.gold, bevel: 2, inner: 'line' });
      cv.flat(ctx.mask().ellipse(rx, ry, 1.6, 1.6), c('blue'));
      cv.part(ctx.mask().poly([[rx - 3, ry + 3], [rx - 1, ry + 3], [rx - 3, ry + 9]]).poly([[rx + 1, ry + 3], [rx + 3, ry + 3], [rx + 3, ry + 9]]), { ramp: ramps.sash, bevel: 1, inner: 'line', shadow: false });
    }
    // gold waistband + stars on the trunks
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, w[1] - 3, D.waistW * 2 + 2, 4).clip(ctx.shortsMask), { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
    for (const [dx, dy] of [[-12, 5], [11, 6], [-4, 10]]) {
      const X = Math.round(h[0] + dx), Y = Math.round(h[1] + dy);
      if (ctx.shortsMask.in(X, Y)) for (const [a, b] of [[0, 0], [1, 0], [-1, 0], [0, -1], [0, 1]]) cv.px(X + a, Y + b, c('white'));
    }
  },
  // Title Defense, FOUR MORE YEARS: re-election night. A tall stovepipe hat
  // with a gold band, and campaign buttons pinned all the way down the sash.
  remix: {
    ramps: { hat: ['shoeHi', 'shoe', 'shoeDk'] },
    head(ctx, H) {
      const { cv, ramps, c } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.4), y = Math.round(H.y) + (H.tilt === 'up' ? -1 : H.tilt === 'down' ? 1 : 0);
      const brim = ctx.mask().ellipse(x, y - 9, H.rx + 3.5, 2.4);
      const crown = ctx.mask().rect(x - H.rx + 2, y - 27, H.rx * 2 - 4, 18).ellipse(x, y - 27, H.rx - 2, 2);
      cv.part(crown, { ramp: ramps.hat, bevel: 3 });
      cv.part(ctx.mask().rect(x - H.rx + 2, y - 14, H.rx * 2 - 4, 3), { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
      cv.part(brim, { ramp: ramps.hat, bevel: 1, inner: 'line' });
      cv.px(x - 4, y - 24, c('shoeHi')); cv.px(x - 4, y - 23, c('shoeHi'));
    },
    torso(ctx) {
      const { cv, J, c, D, pose } = ctx;
      if (pose.lying) return;
      const w = J.waist, a = J.shL;
      // campaign buttons down the sash: red, white and blue
      const cols = [['white', 'glove'], ['white', 'blue'], ['goldHi', 'sash'], ['white', 'glove']];
      cols.forEach(([o, i2], k) => {
        const t = (k + 0.7) / 4.4;
        const X = a[0] + 3 + (w[0] + D.waistW - 5 - a[0]) * t, Y = a[1] + (w[1] - 1 - a[1]) * t;
        cv.part(ctx.mask().ellipse(X, Y, 2.3, 2.3), { ramp: [c(o), c(o), c('hair')], bevel: 1, inner: 'line', shadow: false });
        cv.px(Math.round(X), Math.round(Y), c(i2));
      });
    },
  },
};
