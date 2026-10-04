// Old Man Rourke: sprite layers on the medium build.
// A sixty-one-year-old brawler: bald dome with a fringe of white hair, a huge
// white handlebar mustache, bushy white brows, a nose broken more times than
// anyone can count and one cauliflower ear. Bare barrel chest with grey chest
// hair, old-fashioned long maroon trunks with a gold waistband and a white side
// stripe, taped wrists, cracked brown leather gloves, white socks, black boots.
// Faces: the shared set plus 'wink' (the possum: one eye shut, a crooked grin).

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './_face.js';

const A = makePalette('rourke.A', {
  outline: [3, 2, 3],
  skinHi: [31, 24, 19], skin: [27, 18, 14], skinSh: [20, 12, 10], skinDk: [12, 7, 6],
  ruddy: [27, 12, 11], white: [31, 31, 30], mouth: [13, 3, 5],
  hairHi: [31, 31, 31], hair: [25, 25, 26], hairDk: [16, 16, 19],
  gloveHi: [24, 16, 9], glove: [17, 10, 5], gloveDk: [10, 5, 3],
});
const B = makePalette('rourke.B', {
  trunkHi: [23, 6, 9], trunk: [15, 3, 6], trunkDk: [8, 1, 3],
  gold: [30, 24, 8], goldDk: [20, 13, 3],
  sockHi: [31, 31, 30], sock: [25, 25, 24],
  bootHi: [9, 9, 11], boot: [4, 4, 6],
  tape: [29, 28, 24],
});
export const palettes = { rourke: { A, B } };

const poses = {
  // the possum: out on his feet... except for the wink
  possum1: { extends: 'stunned1', head: { at: [-3, -99], face: 'wink', look: [-1, 0] } },
  possum2: { extends: 'stunned2', head: { at: [3, -99], face: 'wink', look: [1, 0] } },
  // SNAP BACK: wide awake, right hand cocked
  snapTell: { extends: 'jabRTell', head: { face: 'grin' } },
  // taunt: "come on, sonny" — one glove turned up, curling him in
  beckon1: {
    extends: 'idle1', shift: [1, 0],
    head: { at: [2, -100], face: 'grin', look: [1, 0] },
    elR: [32, -70], fiR: [38, -84], gloveR: { angle: 60, view: 'back' },
  },
  beckon2: {
    extends: 'beckon1',
    elR: [31, -72], fiR: [33, -89], gloveR: { angle: 10, view: 'back' },
  },
};

export default {
  id: 'rourke',
  build: 'medium',
  // his own body on the build: an old brawler: a thick neck, a veteran's gut, bow legs
  body: { size: [1.02, 0.95], legLen: 0.92, dims: { belly: 9, neck: 7, hipSpread: 10.5 } },
  palettes: { default: 'rourke' },
  torsoMaterial: 'skin',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['tape', 'tape', 'hairDk'],
    shorts: ['trunkHi', 'trunk', 'trunkDk'],
    sock: ['sockHi', 'sock', 'hairDk'],
    boot: ['bootHi', 'boot', 'outline'],
    sole: ['boot', 'outline', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    gold: ['gold', 'gold', 'goldDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';
    const wink = face === 'wink';

    // the fringe: white hair tufting out round the sides and back of the
    // head (painted first, so only what sticks out past the skull shows)
    const fr = ctx.mask().ellipse(x + lx * 0.3, y - 1, H.rx + 2.6, H.ry - 2.5).cut(ctx.mask().rect(x - 20, y - 20, 40, 13)).cut(ctx.mask().rect(x - 20, y + 5, 40, 20));
    for (const s of [-1, 1]) fr.poly([[x + s * (H.rx + 1), y - 7], [x + s * (H.rx + 4), y - 3], [x + s * (H.rx + 2), y + 1]]);
    cv.part(fr, { ramp: ramps.hair, bevel: 2, inner: 'line' });
    // one cauliflower ear (viewer-left), lumpy
    ears(ctx, H, ramps.skin, [2.4, 3.4]);
    cv.part(ctx.mask().ellipse(x - H.rx - 0.5 + lx * 0.3, y + 1, 3.2, 3.8), { ramp: ramps.skin, bevel: 2 });
    cv.shade(x - H.rx + lx * 0.3, y, 1); cv.shade(x - H.rx - 1 + lx * 0.3, y + 2, 1);
    const hm = skull(ctx, H, ramps.skin, 'round');
    // white tufts over the ears
    for (const s of [-1, 1]) cv.part(ctx.mask().ellipse(x + s * (H.rx - 0.5) + lx * 0.3, y - 3, 1.6, 3.2).clip(hm), { ramp: ramps.hair, bevel: 1, inner: 'soft', shadow: false });
    // a shine on the dome
    cv.px(x - 4 + lx, y - 10, c('skinHi')); cv.px(x - 3 + lx, y - 11, c('white')); cv.px(x - 2 + lx, y - 11, c('skinHi'));
    // forehead creases
    for (const dy of [-8, -6]) for (let i = -4; i <= 4; i++) if (hm.in(fx + i, fy + dy) && Math.abs(i) < 4 + (dy + 8)) cv.shade(fx + i, fy + dy, 1);

    if (wink) {
      eyes(ctx, fx, fy, 'neutral', 0);
      // the right eye (viewer's right) squeezed shut
      for (let i = 1; i <= 8; i++) for (let j = -2; j <= 1; j++) cv.px(fx + i, fy + j, c('skin'));
      for (let i = 3; i <= 6; i++) cv.px(fx + i, fy, c('outline'));
      cv.px(fx + 2, fy - 1, c('outline')); cv.px(fx + 7, fy - 1, c('outline'));
      for (let i = 3; i <= 6; i++) cv.shade(fx + i, fy + 1, 1);
    } else eyes(ctx, fx, fy, face, 0);
    // bushy white brows (the winking one squashed down)
    brows(ctx, fx, fy, wink ? 'grin' : face, ramps.hair, { len: 5, thick: 1.5, y: -4 });
    if (wink) cv.part(ctx.mask().capsule(fx + 3, fy - 2.6, fx + 8, fy - 3.2, 1.3, 1.1), { ramp: ramps.hair, bevel: 1, inner: 'soft' });
    // the broken nose, bent to one side
    nose(ctx, fx + 1, fy, ['skinHi', 'ruddy', 'skinSh', 'skinDk'].map(c), [2.6, 2.4], 3.8);
    cv.px(fx, fy + 1, c('skinSh')); cv.px(fx + 1, fy + 2, c('skinHi'));
    for (const s of [-1, 1]) cv.px(fx + s * 6, fy + 4, c('ruddy'));
    // mouth: a crooked grin when he's winking
    if (wink) {
      for (let i = -2; i <= 3; i++) cv.px(fx + i, fy + 9 - (i > 1 ? 1 : 0), c('mouth'));
      cv.px(fx + 4, fy + 7, c('outline'));
    } else mouth(ctx, fx, fy + 9, face, { w: 3.4 });
    // the handlebar mustache, tips curled up
    const mu = ctx.mask().ellipse(fx - 3.4, fy + 6.6, 4.4, 1.9, 1, -0.18).ellipse(fx + 3.4, fy + 6.6, 4.4, 1.9, 1, 0.18);
    mu.capsule(fx - 7, fy + 7, fx - 9, fy + 4.5, 1.3, 0.9).capsule(fx + 7, fy + 7, fx + 9, fy + 4.5, 1.3, 0.9);
    cv.part(mu, { ramp: ramps.hair, bevel: 1, inner: 'line', shadow: false });
    cv.px(fx - 2, fy + 6, c('hairHi')); cv.px(fx + 2, fy + 6, c('hairHi'));
    // jowls and a deep chin line
    cv.shade(fx - 7, fy + 9, 1); cv.shade(fx + 7, fy + 9, 1);
    cv.shade(fx - 1, fy + 12, 1); cv.shade(fx, fy + 12, 1);
  },

  torso(ctx) {
    const { cv, J, c, D, ramps, pose } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, h = J.hip;
    const tm = ctx.torsoMask;
    // grey chest hair on a barrel chest: little curls, thickest in the middle
    for (let Y = Math.round(n[1] + 6); Y < ch[1] + 8; Y++) for (let X = Math.round(ch[0] - 10); X <= ch[0] + 10; X++) {
      const d = Math.abs(X - ch[0]) / 10 + Math.abs(Y - (ch[1] + 1)) / 8;
      const hsh = ((X * 73856093) ^ (Y * 19349663)) >>> 0;
      if (tm.in(X, Y) && d < 1 && hsh % 7 < (d < 0.5 ? 2 : 1)) { cv.px(X, Y, c('hair')); if (tm.in(X + 1, Y + 1)) cv.px(X + 1, Y + 1, c('hairDk')); }
    }
    for (let Y = Math.round(ch[1] + 8); Y < w[1] - 3; Y += 2) if (tm.in(w[0], Y)) cv.px(w[0] + ((Y >> 1) & 1), Y, c('hairDk'));
    // pec + belly lines
    for (const s of [-1, 1]) cv.line(ch[0] + s * 3, ch[1] + 7, ch[0] + s * (D.chestW - 5), ch[1] + 5, (X, Y) => { if (tm.in(X, Y)) cv.shade(X, Y, 1); });
    cv.line(w[0] - D.waistW + 4, w[1] - 3, w[0] + D.waistW - 4, w[1] - 3, (X, Y) => { if (tm.in(X, Y) && (X & 1)) cv.shade(X, Y, 1); });
    // long old-fashioned trunks: gold waistband, a white stripe down each side
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, w[1] - 4, D.waistW * 2 + 2, 4).clip(ctx.shortsMask), { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
    if (!pose.lying) {
      for (const s of [-1, 1]) cv.line(h[0] + s * (D.hipSpread + 7), h[1] - 4, h[0] + s * (D.hipSpread + 9), h[1] + 8, (X, Y) => { if (ctx.shortsMask.in(X, Y)) cv.px(X, Y, c('sockHi')); });
      // an old "R" on the leg
      cv.stamp(['rr.', 'r.r', 'rr.', 'r.r'], h[0] - D.hipSpread - 5, h[1] + 1, { r: c('gold') });
    }
  },
};
