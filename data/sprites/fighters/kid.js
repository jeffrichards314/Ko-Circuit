// Kid Kilowatt: sprite layers on the lean build.
// Hyperactive teen: electric-yellow hair spiking out of a red sweatband, wide
// eyes, freckles, braces, lime tank top with a lightning bolt, purple trunks,
// striped tube socks and high-tops. Crackles with static when he winds up and
// sweats buckets when he runs out of gas.

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose, sweat } from './_face.js';

const A = makePalette('kid.A', {
  outline: [3, 2, 5],
  skinHi: [31, 26, 21], skin: [29, 20, 15], skinSh: [22, 13, 10], skinDk: [14, 7, 7],
  white: [31, 31, 30], mouth: [14, 3, 6], metal: [22, 25, 29],
  hairHi: [31, 31, 18], hair: [31, 26, 5], hairSh: [24, 16, 2],
  gloveHi: [18, 28, 31], glove: [5, 17, 30], gloveDk: [2, 7, 18],
});
const B = makePalette('kid.B', {
  tankHi: [22, 31, 12], tank: [12, 25, 5], tankSh: [6, 15, 3],
  shortsHi: [23, 14, 31], shorts: [14, 5, 24], shortsDk: [7, 2, 14],
  bandHi: [31, 13, 11], band: [24, 4, 5],
  shoeHi: [30, 30, 30], shoe: [20, 21, 25], shoeDk: [9, 10, 14],
  stripe: [5, 20, 30],
});
export const palettes = { kid: { A, B } };

// Kid-specific poses (the shared library covers punches and reactions).
const poses = {
  hop: { extends: 'idle1', shift: [0, -3], ftL: [-16, -2], ftR: [16, -3], knL: [-13, -24], knR: [13, -25] },
  zap1: { extends: 'crouchTell', zap: 1 },
  zap2: { extends: 'crouchTell', shift: [0, -1], zap: 2 },
  gasp1: { extends: 'winded1', sweat: 1 },
  gasp2: { extends: 'winded2', sweat: 2 },
};

export default {
  id: 'kid',
  build: 'lean',
  // his own body on the build: a scrawny teenager: small, narrow, big head for his body
  body: { size: [0.9, 0.88], legLen: 1.02, shoulders: 0.9, dims: { head: [10.4, 12.2], neck: 3.8, upperArm: [4.4, 3.6], forearm: [3.9, 3.2] } },
  palettes: { default: 'kid' },
  torsoMaterial: 'tank',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['white', 'white', 'gloveHi', 'glove'],
    tank: ['tankHi', 'tank', 'tankSh', 'outline'],
    shorts: ['shortsHi', 'shorts', 'shortsDk'],
    sock: ['white', 'white', 'metal'],
    boot: ['shoeHi', 'shoe', 'shoeDk'],
    sole: ['white', 'shoe', 'shoeDk'],
    hair: ['hairHi', 'hair', 'hairSh'],
    band: ['bandHi', 'band', 'mouth'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly + 1;
    const face = H.face || 'neutral';
    ctx.H = H;

    // hair spikes behind the band (drawn first so the skull overlaps their roots)
    const hair = ctx.mask();
    const spikes = [[-11, -8, -16, -17], [-7, -11, -10, -24], [-2, -12, -2, -27], [3, -12, 5, -26], [8, -10, 12, -22], [11, -6, 17, -13]];
    for (const [ax, ay, tx, ty] of spikes) hair.poly([[x + ax - 3, y + ay + 3], [x + tx + lx, y + ty], [x + ax + 3, y + ay + 2]]);
    hair.ellipse(x, y - 6, H.rx + 1.5, 7);
    cv.part(hair, { ramp: ramps.hair, bevel: 3, inner: 'line' });
    for (const [ax, ay, tx, ty] of spikes) cv.line(x + ax, y + ay, x + (ax + tx) / 2 + lx, y + (ay + ty) / 2, (X, Y) => cv.shade(X, Y, -1));

    ears(ctx, H, ramps.skin, [2, 3.2]);
    const hm = skull(ctx, H, ramps.skin, 'narrow');
    // freckles
    for (const [i, j] of [[-6, 3], [-4, 4], [4, 4], [6, 3]]) if (hm.in(fx + i, fy + j)) cv.px(fx + i, fy + j, c('skinSh'));

    eyes(ctx, fx, fy, face === 'neutral' ? 'wide' : face, -2);
    brows(ctx, fx, fy, face, ramps.hair, { len: 3.4, thick: 0.9, gap: -2, y: -4.4 });
    nose(ctx, fx, fy, ramps.skin, [1.6, 1.6], 3);
    const k = mouth(ctx, fx, fy + 7, face, { w: 3.4, teeth: 'metal' });
    if (k === null || k === undefined) cv.px(fx + 3, fy + 7, c('outline')); // lopsided smirk

    // sweatband
    const by = y - 7 + (H.tilt === 'down' ? 1 : 0);
    const band = ctx.mask().rect(x - H.rx - 1, by - 1, H.rx * 2 + 2, 3).clip(ctx.mask().ellipse(x, y, H.rx + 1.2, H.ry + 1));
    cv.part(band, { ramp: ramps.band, bevel: 1, inner: 'line' });
    cv.px(x + lx - 1, by, c('white')); cv.px(x + lx, by, c('white'));
  },

  torso(ctx) {
    const { cv, J, D, ramps, c } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest;
    // tank top: bare shoulders
    const tank = ctx.torsoMask.copy().clip(ctx.mask().poly([
      [n[0] - 4, n[1] + 3], [n[0] + 4, n[1] + 3],
      [ch[0] + D.chestW - 2, ch[1] - 6], [w[0] + D.waistW + 4, w[1] + 2],
      [w[0] - D.waistW - 4, w[1] + 2], [ch[0] - D.chestW + 2, ch[1] - 6],
    ]));
    // re-shade the bare shoulders as skin, then lay the tank over the chest
    cv.part(ctx.torsoMask.copy().cut(tank), { ramp: ramps.skin, bevel: 4, shadow: false, inner: 'soft' });
    cv.part(tank, { ramp: ramps.tank, bevel: 6, inner: 'line' });
    // lightning bolt
    const bx = Math.round(ch[0]), byy = Math.round(ch[1]) - 6;
    const bolt = ['..##', '.##.', '####', '..#.', '.#..', '#...'];
    cv.stamp(bolt, bx - 2, byy, { '#': c('hair') });
    cv.stamp(['...o', '..o.', '....', '...o', '..o.', '.o..'], bx - 1, byy, { o: c('hairSh') });
    // waistband with a stripe
    const band = ctx.mask().rect(w[0] - D.waistW - 1, w[1] - 2, D.waistW * 2 + 2, 2).clip(ctx.shortsMask);
    cv.part(band, { ramp: ['white', 'white', 'metal'].map(c), bevel: 1, inner: 'line', shadow: false });
    // side stripes on the trunks
    const h = J.hip;
    for (const s of [-1, 1]) cv.line(h[0] + s * (D.hipSpread + 5), h[1] - 3, h[0] + s * (D.hipSpread + 6), h[1] + 5, (X, Y) => { if (ctx.shortsMask.in(X, Y)) cv.px(X, Y, c('stripe')); });
  },

  front(ctx) {
    const { cv, J, c, pose } = ctx;
    if (pose.sweat) sweat(ctx, ctx.H, pose.sweat);
    if (pose.zap) {
      // static crackle: little lightning forks jumping off both gloves
      const forks = pose.zap === 1
        ? [[-11, -8, 1], [10, -10, -1], [-12, 4, 1], [11, 3, -1], [-2, -14, 1]]
        : [[-10, -11, -1], [11, -6, 1], [-11, 1, -1], [9, 6, 1], [2, -14, -1]];
      for (const f of [J.fiL, J.fiR]) {
        for (const [dx, dy, d] of forks) {
          const x = Math.round(f[0] + dx), y = Math.round(f[1] + dy);
          for (const [i, j] of [[0, 0], [d, 1], [d, 2], [0, 3], [0, 4], [d, 5]]) cv.px(x + i, y + j, c(j === 2 || j === 3 ? 'hairHi' : 'white'));
          cv.px(x - d, y + 2, c('stripe'));
        }
      }
    }
  },
};
