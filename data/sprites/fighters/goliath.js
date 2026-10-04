// Goliath Gunn: sprite layers on the giant build.
// Eight feet of retired artillery sergeant: a flat buzz cut, a jaw like a
// breech block with a cleft chin, a scar through one eyebrow, dog tags on a
// ball chain, an olive-drab tank top with a stencilled star, woodland-camo
// trunks, black combat boots laced to the shin, desert-tan gloves.
// Poses: down on one knee (kneel1/2, the head-shot window), the salute (taunt).

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './_face.js';

const A = makePalette('goliath.A', {
  outline: [2, 2, 2],
  skinHi: [30, 22, 16], skin: [24, 15, 10], skinSh: [17, 9, 7], skinDk: [9, 5, 4],
  white: [31, 31, 30], mouth: [12, 2, 4],
  hairHi: [11, 9, 7], hair: [5, 4, 3],
  gloveHi: [29, 25, 16], glove: [22, 17, 9], gloveDk: [12, 8, 4],
  tag: [27, 28, 28], tagDk: [15, 16, 17], scar: [29, 19, 16],
});
const B = makePalette('goliath.B', {
  oliveHi: [17, 19, 10], olive: [11, 13, 6], oliveDk: [6, 7, 3],
  camoA: [16, 17, 9], camoB: [12, 9, 5], camoC: [5, 6, 3], camoD: [21, 20, 13],
  bootHi: [9, 9, 9], boot: [4, 4, 4],
  stencil: [24, 25, 17],
});
export const palettes = { goliath: { A, B } };

const poses = {
  // down on one knee: head within reach at last
  kneel1: {
    hip: [0, -26], waist: [0, -36], chest: [0, -54], neck: [0, -68],
    head: { at: [0, -81], face: 'strain', tilt: 'down', look: [0, 1] },
    shL: [-20, -62], shR: [20, -62],
    elL: [-28, -44], elR: [27, -46], fiL: [-18, -34], fiR: [20, -30],
    knL: [-15, -5], ftL: [-12, 0], knR: [16, -24], ftR: [19, 0],
    gloveL: { angle: 170 }, gloveR: { angle: -175 },
  },
  kneel2: {
    extends: 'kneel1', shift: [0, 1],
    knL: [-15, -5], ftL: [-12, 0], knR: [16, -24], ftR: [19, 0],
    head: { at: [0, -79], face: 'hurt', tilt: 'down', look: [0, 2] },
  },
  // taunt: a crisp salute
  salute1: {
    extends: 'idle1',
    head: { at: [0, -100], face: 'focus', look: [-1, 0] },
    elR: [30, -86], fiR: [12, -102], gloveR: { angle: -80, view: 'back' },
    elL: [-24, -58], fiL: [-22, -44], gloveL: { angle: 185 },
  },
  salute2: { extends: 'salute1', head: { at: [0, -100], face: 'grin', look: [-1, 0] }, fiR: [13, -104] },
};

export default {
  id: 'goliath',
  build: 'giant',
  // his own body on the build: a soldier's frame: broad, square shoulders
  body: { shoulders: 1.08, dims: { waistW: 23 } },
  palettes: { default: 'goliath' },
  torsoMaterial: 'olive',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['oliveHi', 'olive', 'oliveDk'],
    olive: ['oliveHi', 'olive', 'oliveDk', 'outline'],
    shorts: ['camoA', 'camoB', 'camoC'],
    sock: ['boot', 'bootHi', 'outline'],
    boot: ['bootHi', 'boot', 'outline'],
    sole: ['boot', 'outline', 'outline'],
    hair: ['hairHi', 'hair', 'outline'],
    tag: ['tag', 'tag', 'tagDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    ears(ctx, H, ramps.skin, [2.4, 3.4]);
    const hm = skull(ctx, H, ramps.skin, 'square');
    // flat buzz cut: a dark stipple over the top of the skull
    const bz = ctx.mask().rect(x - H.rx + lx * 0.3, y - H.ry, H.rx * 2, 9).clip(hm);
    for (let Y = 0; Y < bz.h; Y++) for (let X = 0; X < bz.w; X++) if (bz.in(X, Y)) cv.px(X, Y, c((X + Y) & 1 ? 'hair' : 'hairHi'));
    for (let X = Math.round(x - H.rx); X <= x + H.rx; X++) if (hm.in(X, y - H.ry + 9) && bz.in(X, y - H.ry + 8)) cv.shade(X, y - H.ry + 9, 1);
    eyes(ctx, fx, fy, face, 0);
    brows(ctx, fx, fy, face, ramps.hair, { len: 5, thick: 1.5, y: -4 });
    // the scar through his left brow
    for (let k = 0; k < 5; k++) cv.px(fx - 8 + (k >> 1), fy - 6 + k, c('scar'));
    nose(ctx, fx, fy, ramps.skin, [2.8, 2.4], 3.6);
    mouth(ctx, fx, fy + 8.5, face, { w: 4 });
    // cleft chin
    cv.shade(fx, fy + 12, 1); cv.shade(fx, fy + 13, 1);
    for (const s of [-1, 1]) cv.shade(fx + s * (H.rx - 2), fy + 8, 1);
  },

  torso(ctx) {
    const { cv, J, c, D, ramps, pose } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest;
    const tm = ctx.torsoMask;
    // tank top: bare shoulders and a round neck
    for (const s of ['L', 'R']) cv.part(ctx.mask().ellipse(J['sh' + s][0], J['sh' + s][1], D.deltoid + 1.4, D.deltoid + 1).clip(tm), { ramp: ramps.skin, bevel: 3, shadow: false });
    cv.part(ctx.mask().ellipse(n[0], n[1] + 2, 9, 6).clip(tm), { ramp: ramps.skin, bevel: 3, inner: 'line', shadow: false });
    // dog tags on a ball chain
    if (!pose.lying) {
      for (let k = -7; k <= 7; k++) { const X = n[0] + k, Y = Math.round(n[1] + 2 + (1 - (k / 7) ** 2) * 8); if ((k & 1) === 0) cv.px(X, Y, c('tag')); }
      cv.part(ctx.mask().rect(n[0] - 3, n[1] + 10, 4, 6).rect(n[0] + 1, n[1] + 11, 4, 6), { ramp: ramps.tag, bevel: 1, inner: 'line', shadow: false });
      // stencilled star on the chest
      const sx = Math.round(ch[0] + 11), sy = Math.round(ch[1] + 2);
      cv.stamp(['...s...', '...s...', 'sssssss', '.sssss.', '..sss..', '.ss.ss.', 'ss...ss'], sx - 3, sy - 3, { s: c('stencil') });
    }
    // camo blotches on the trunks
    const sm = ctx.shortsMask;
    for (let Y = 0; Y < sm.h; Y++) for (let X = 0; X < sm.w; X++) {
      if (!sm.in(X, Y) || !cv.ramp[Y * cv.w + X]) continue;
      const v = Math.sin(X * 0.45 + Y * 0.2) + Math.sin(X * 0.17 - Y * 0.5) * 1.2;
      if (v > 1.1) cv.px(X, Y, c('camoC'));
      else if (v < -1.2) cv.px(X, Y, c('camoD'));
    }
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, w[1] - 3, D.waistW * 2 + 2, 3).clip(sm), { ramp: ['oliveHi', 'olive', 'oliveDk'].map(c), bevel: 1, inner: 'line', shadow: false });
  },

  front(ctx) {
    // boot laces up the shin
    const { cv, J, c, D, pose } = ctx;
    if (pose.lying) return;
    for (const s of ['L', 'R']) { const f = J['ft' + s]; for (let k = 0; k < 4; k++) cv.px(f[0] + (k & 1 ? 1 : -1), f[1] - D.ankle - 2 - k * 2, c('tagDk')); }
  },
};
