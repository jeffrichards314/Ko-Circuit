// The Gemini Twins: sprite layers on the medium build. One set of frames, two
// brothers: CASTOR wears crimson (base palette `gemini`), POLLUX wears cobalt
// (the `gemini.pollux` swap). Jet-black hair in a short topknot, a headband
// with the twins' "II" mark, matching sleeveless singlets with a white star,
// trunks in the team colour, white boots, white gloves trimmed in team colour.

import { makePalette, swapPalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './_face.js';

const A = makePalette('gemini.A', {
  outline: [2, 2, 4],
  skinHi: [31, 26, 20], skin: [28, 20, 14], skinSh: [21, 13, 10], skinDk: [12, 7, 6],
  white: [31, 31, 31], mouth: [13, 3, 5],
  hairHi: [9, 9, 14], hair: [3, 3, 6],
  gloveHi: [31, 31, 31], glove: [26, 26, 29], gloveDk: [16, 16, 21],
  pale: [22, 23, 27],
});
const B = makePalette('gemini.B', {
  teamHi: [31, 10, 10], team: [23, 3, 6], teamDk: [12, 1, 4],
  trimHi: [31, 28, 8], trim: [26, 19, 3],
  bootHi: [31, 31, 31], boot: [24, 24, 28], bootDk: [14, 14, 19],
});
const polluxB = swapPalette('gemini.pollux.B', B, {
  teamHi: [10, 17, 31], team: [4, 9, 25], teamDk: [2, 3, 13],
  trimHi: [24, 30, 31], trim: [14, 24, 30],
});
export const palettes = { gemini: { A, B }, 'gemini.pollux': { A, B: polluxB } };

const poses = {
  // taunt: the twin sign, two fingers of a glove up by the headband
  twinSign: {
    extends: 'idle1',
    head: { at: [1, -100], face: 'grin', look: [1, -1] },
    elR: [30, -86], fiR: [18, -104], gloveR: { angle: -30 },
    elL: [-28, -60], fiL: [-14, -70],
  },
};

export default {
  id: 'gemini',
  build: 'medium',
  // his own body on the build: identical athletes: V-shaped, light on their feet
  body: { shoulders: 1.05, legLen: 1.02, dims: { waistW: 14.5, belly: 3, deltoid: 7 } },
  palettes: { default: 'gemini' },
  torsoMaterial: 'team',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['teamHi', 'team', 'teamDk'],
    team: ['teamHi', 'team', 'teamDk', 'outline'],
    shorts: ['teamHi', 'team', 'teamDk'],
    sock: ['bootHi', 'boot', 'bootDk'],
    boot: ['bootHi', 'boot', 'bootDk'],
    sole: ['teamHi', 'team', 'teamDk'],
    hair: ['hairHi', 'hair', 'outline'],
    trim: ['trimHi', 'trim', 'teamDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    ears(ctx, H, ramps.skin, [2.2, 3.2]);
    skull(ctx, H, ramps.skin, 'round');
    // hair pulled back into a short topknot
    const hr = ctx.mask().ellipse(x + lx * 0.3, y - 7, H.rx + 0.6, 6.6).cut(ctx.mask().rect(x - 14, y - 5, 28, 12));
    hr.rect(x - Math.round(H.rx), y - 6, 2, 5).rect(x + Math.round(H.rx) - 2, y - 6, 2, 5);
    const knot = ctx.mask().ellipse(x + lx * 0.2, y - 15, 3.4, 3);
    cv.part(knot, { ramp: ramps.hair, bevel: 2, inner: 'line' });
    cv.part(hr, { ramp: ramps.hair, bevel: 3, inner: 'line' });
    for (const dx of [-5, -1, 3, 7]) cv.line(x + dx, y - 12, x + dx - 1, y - 6, (X, Y) => { if (hr.in(X, Y)) cv.shade(X, Y, -1); });
    // headband with the "II" mark
    const hb = ctx.mask().rect(x - Math.round(H.rx), y - 7, Math.round(H.rx) * 2 + 1, 3).clip(ctx.mask().ellipse(x, y, H.rx + 1, H.ry + 1));
    cv.part(hb, { ramp: ramps.team, bevel: 1, inner: 'line', shadow: false });
    for (const dx of [-1, 1]) { cv.px(fx + dx, y - 7, c('trimHi')); cv.px(fx + dx, y - 6, c('trimHi')); cv.px(fx + dx, y - 5, c('trimHi')); }
    eyes(ctx, fx, fy, face, 0);
    brows(ctx, fx, fy, face, ramps.hair, { len: 4.2, thick: 1 });
    nose(ctx, fx, fy, ramps.skin, [2, 2.2], 3.6);
    mouth(ctx, fx, fy + 8.5, face, { w: 3.4 });
    cv.px(fx - 5, fy + 7, c('skinSh')); // matching dimple
  },

  torso(ctx) {
    const { cv, J, c, ramps, D } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, h = J.hip;
    const tm = ctx.torsoMask;
    // singlet cut: bare shoulders and a scoop neck
    for (const s of ['L', 'R']) cv.part(ctx.mask().ellipse(J['sh' + s][0], J['sh' + s][1], D.deltoid + 1, D.deltoid + 1).clip(tm), { ramp: ramps.skin, bevel: 3, shadow: false });
    cv.part(ctx.mask().ellipse(n[0], n[1] + 2, 8, 5).clip(tm), { ramp: ramps.skin, bevel: 3, inner: 'line', shadow: false });
    // trim stripes and the white star
    for (const s of [-1, 1]) cv.line(n[0] + s * 8, n[1] + 3, ch[0] + s * (D.chestW - 5), w[1] - 2, (X, Y) => { if (tm.in(X, Y)) cv.px(X, Y, c('trim')); });
    const sx = Math.round(ch[0]), sy = Math.round(ch[1] + 3);
    cv.stamp(['..w..', '.www.', 'wwwww', '.www.', '.w.w.'], sx - 2, sy - 2, { w: c('white') });
    // trunks trim + the "II" on a leg
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, w[1] - 3, D.waistW * 2 + 2, 3).clip(ctx.shortsMask), { ramp: ramps.trim, bevel: 1, inner: 'line', shadow: false });
    for (const dx of [-12, -10]) for (let k = 0; k < 4; k++) if (ctx.shortsMask.in(Math.round(h[0] + dx), Math.round(h[1] + 3 + k))) cv.px(h[0] + dx, h[1] + 3 + k, c('white'));
  },
};
