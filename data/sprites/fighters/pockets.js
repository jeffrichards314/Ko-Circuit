// Pockets the Clown: sprite layers on the medium build.
// Sad-happy circus clown: white greasepaint, a big red nose, blue diamonds over
// the eyes, a painted red smile, tufts of orange frizz round a bald crown with
// a tiny tilted hat, a giant polka-dot bow tie, a baggy striped shirt, baggy
// polka-dot trunks held up by suspenders, huge floppy shoes, a bulb horn on his
// belt, yellow gloves. Real attacks squeeze the horn (pose.honk: the bulb
// flattens); fakes don't touch it.

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, mouth, ears, skull } from './_face.js';

const A = makePalette('pockets.A', {
  outline: [3, 2, 4],
  skinHi: [31, 31, 31], skin: [27, 27, 29], skinSh: [20, 20, 24], skinDk: [11, 11, 15],
  white: [31, 31, 31], mouth: [13, 2, 4],
  nose: [30, 4, 5], noseHi: [31, 20, 18],
  hairHi: [31, 20, 6], hair: [28, 11, 2], hairDk: [16, 5, 1],
  gloveHi: [31, 30, 12], glove: [29, 23, 3], gloveDk: [18, 12, 2],
});
const B = makePalette('pockets.B', {
  stripeA: [9, 22, 13], stripeB: [29, 29, 28], shirtSh: [5, 13, 8],
  purpleHi: [22, 11, 29], purple: [14, 5, 22], purpleDk: [7, 2, 12],
  dot: [30, 26, 5], diamond: [7, 13, 30],
  shoeHi: [31, 12, 12], shoe: [24, 4, 6], shoeDk: [12, 2, 3],
  bulb: [30, 5, 6], brassHi: [31, 29, 13], brass: [24, 17, 3],
});
export const palettes = { pockets: { A, B } };

const H = { honk: true };
const poses = {
  // real tells: the same shapes as the fakes, but his glove squeezes the horn
  jabTellH: { extends: 'jabTell', ...H },
  hookTellH: { extends: 'hookTell', ...H },
  overheadTellH1: { extends: 'overheadTell1', ...H },
  overheadTellH2: { extends: 'overheadTell2', ...H },
  bodyTellH: { extends: 'bodyTell', ...H },
  // taunt: juggling three invisible balls, badly
  juggle1: {
    extends: 'idle1',
    head: { at: [0, -101], face: 'grin', tilt: 'up', look: [0, -2] },
    elL: [-30, -72], elR: [30, -72], fiL: [-18, -92], fiR: [20, -84],
    gloveL: { angle: -10 }, gloveR: { angle: 10 },
  },
  juggle2: {
    extends: 'juggle1',
    head: { at: [1, -101], face: 'wide', tilt: 'up', look: [1, -2] },
    fiL: [-20, -84], fiR: [18, -92],
  },
  bowDown: {
    extends: 'idle1', shift: [0, 4],
    head: { at: [0, -90], face: 'hurt', tilt: 'down', look: [0, 2] },
    elL: [-26, -56], elR: [26, -56], fiL: [-20, -40], fiR: [20, -40],
    gloveL: { angle: 170 }, gloveR: { angle: -170 },
  },
};

export default {
  id: 'pockets',
  build: 'medium',
  // his own body on the build: pear-shaped: narrow shoulders, wide hips, round belly
  body: { shoulders: 0.88, legLen: 0.9, dims: { belly: 11, waistW: 20, hipSpread: 11, thigh: [8.6, 6.4], upperArm: [5.4, 4.6] } },
  palettes: { default: 'pockets' },
  torsoMaterial: 'shirt',
  sleeve: { material: 'shirt', length: 0.95 },
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['stripeB', 'stripeB', 'shirtSh'],
    shirt: ['stripeA', 'stripeA', 'shirtSh', 'outline'],
    shorts: ['purpleHi', 'purple', 'purpleDk'],
    sock: ['stripeB', 'stripeB', 'skinSh'],
    boot: ['shoeHi', 'shoe', 'shoeDk'],
    sole: ['shoeDk', 'outline', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    brass: ['brassHi', 'brass', 'hairDk'],
  },

  head(ctx, Hd) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(Hd.x), y = Math.round(Hd.y);
    const [lx, ly] = Hd.look;
    const fx = x + lx, fy = y + ly;
    const face = Hd.face || 'neutral';

    // orange frizz behind the ears
    const fz = ctx.mask();
    for (const s of [-1, 1]) for (const [dx, dy, rr] of [[9, -4, 4], [12, -1, 4], [11, 3, 3.4], [8, -8, 3]]) fz.ellipse(x + s * dx, y + dy, rr, rr);
    cv.part(fz, { ramp: ramps.hair, bevel: 2, inner: 'line' });
    ears(ctx, Hd, ramps.skin, [2.2, 3.2]);
    skull(ctx, Hd, ramps.skin, 'round');
    // painted blue diamonds over the eyes
    for (const s of [-1, 1]) {
      const dx = fx + s * 5 - (s > 0 ? 1 : 0);
      cv.flat(ctx.mask().poly([[dx, fy - 7], [dx + 3, fy - 2], [dx, fy + 3], [dx - 3, fy - 2]]), c('diamond'));
    }
    eyes(ctx, fx, fy, face, 0);
    // big painted smile (always), the real mouth inside it
    const sm = ctx.mask().ellipse(fx, fy + 8, 7, 3.4).cut(ctx.mask().rect(fx - 8, fy + 3, 16, 5));
    cv.flat(sm, c('nose'));
    mouth(ctx, fx, fy + 8, face, { w: 3.6 });
    // red nose
    cv.part(ctx.mask().ellipse(fx, fy + 3.5, 3, 2.8), { ramp: ['noseHi', 'nose', 'nose', 'mouth'].map(c), bevel: 2 });
    cv.px(fx - 1, fy + 2, c('white'));
    // tiny tilted hat
    const cy = y + (Hd.tilt === 'up' ? -1 : Hd.tilt === 'down' ? 1 : 0);
    const hx = x + 3 + lx * 0.4;
    cv.part(ctx.mask().poly([[hx - 5, cy - 11], [hx + 4, cy - 13], [hx + 3, cy - 19], [hx - 4, cy - 18]]), { ramp: ['purpleHi', 'purple', 'purpleDk'].map(c), bevel: 2 });
    cv.part(ctx.mask().ellipse(hx - 0.5, cy - 11.5, 7, 1.6, 1, -0.2), { ramp: ['purpleHi', 'purple', 'purpleDk'].map(c), bevel: 1, inner: 'line' });
    cv.part(ctx.mask().ellipse(hx + 3, cy - 18, 1.8, 2.4), { ramp: ['noseHi', 'nose', 'nose'].map(c), bevel: 1, shadow: false }); // a flower
  },

  torso(ctx) {
    const { cv, J, c, ramps, D, pose } = ctx;
    const n = J.neck, w = J.waist, h = J.hip;
    const tm = ctx.torsoMask;
    // baggy stripes
    for (let y = 0; y < tm.h; y++) for (let x = 0; x < tm.w; x++) if (tm.in(x, y) && ((x + 400) >> 2) % 2) cv.px(x, y, c('stripeB'));
    for (let y = 0; y < tm.h; y++) for (let x = 0; x < tm.w; x++) if (tm.in(x, y) && ((x + 400) >> 2) % 2 && !tm.in(x + 1, y)) cv.px(x, y, c('shirtSh'));
    // suspenders
    for (const s of [-1, 1]) cv.line(n[0] + s * 9, n[1] + 2, w[0] + s * 9, w[1], (X, Y) => { if (tm.in(X, Y)) { cv.px(X, Y, c('purple')); cv.px(X + 1, Y, c('purpleDk')); } });
    // polka dots on the baggy trunks
    const sm = ctx.shortsMask;
    for (let y = 0; y < sm.h; y += 5) for (let x = (y / 5) % 2 ? 2 : 0; x < sm.w; x += 5) if (sm.in(x, y) && sm.in(x + 1, y + 1)) { cv.px(x, y, c('dot')); cv.px(x + 1, y, c('dot')); cv.px(x, y + 1, c('dot')); cv.px(x + 1, y + 1, c('dot')); }
    // giant polka-dot bow tie
    const nx = Math.round(n[0]), ny = Math.round(n[1]) + 3;
    const bow = ctx.mask().poly([[nx - 10, ny - 4], [nx, ny], [nx - 10, ny + 4]]).poly([[nx + 10, ny - 4], [nx, ny], [nx + 10, ny + 4]]);
    cv.part(bow, { ramp: ['noseHi', 'nose', 'nose', 'mouth'].map(c), bevel: 1, inner: 'line' });
    for (const [dx, dy] of [[-7, -1], [-5, 2], [6, -1], [5, 2]]) cv.px(nx + dx, ny + dy, c('white'));
    cv.part(ctx.mask().ellipse(nx, ny, 1.6, 1.6), { ramp: ['noseHi', 'nose', 'mouth'].map(c), bevel: 1 });
    // the bulb horn on his belt (squeezed flat on real tells)
    const bx = Math.round(w[0] + D.waistW + 2), by = Math.round(w[1] + 2);
    cv.part(ctx.mask().capsule(bx - 8, by + 1, bx - 1, by, 1.2, 3.4), { ramp: ramps.brass, bevel: 1, inner: 'line' });
    const bulb = pose.honk ? ctx.mask().ellipse(bx + 3, by, 2.2, 4.4) : ctx.mask().ellipse(bx + 4, by, 4.6, 4.6);
    cv.part(bulb, { ramp: ['noseHi', 'bulb', 'mouth'].map(c), bevel: 2 });
    if (pose.honk) for (const [dx, dy] of [[7, -6], [8, -5], [9, -1], [10, -1], [8, 4], [9, 5]]) cv.px(bx + dx, by + dy, c('white')); // honk lines
  },
  front(ctx) {
    // the big floppy shoes, over the build's boots
    const { cv, J, c, pose } = ctx;
    if (pose.lying) return;
    for (const [k, sign] of [['ftL', -1], ['ftR', 1]]) {
      const f = J[k];
      const sh = ctx.mask().ellipse(f[0] + sign * 5, f[1] - 3.5, 10, 4.6).ellipse(f[0], f[1] - 6, 5, 4);
      cv.part(sh, { ramp: ['shoeHi', 'shoe', 'shoeDk'].map(c), bevel: 3 });
      cv.px(f[0] + sign * 9, f[1] - 6, c('white')); cv.px(f[0] + sign * 10, f[1] - 6, c('white'));
      for (let i = -9; i < 13; i++) cv.shade(f[0] + sign * 5 + i, f[1] - 1, 1);
    }
  },
};
