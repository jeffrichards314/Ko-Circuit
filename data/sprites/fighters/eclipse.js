// Eclipse: sprite layers on the medium build.
// A masked fighter split down the middle: the left half of his mask is the
// sun (gold, with rays standing out around the edge), the right half is the
// moon (black, a silver crescent on it). Eye holes, and his own dark-skinned
// jaw below. His gloves don't match either: the viewer-left glove is gold, the
// right one black with a silver cuff, so after the screen flips the gold glove
// is on the other side, and you can see the world has turned. Bare chest with
// a gold ring on a cord; black trunks scattered with silver stars and a gold
// waistband; black boots.
// Poses: TOTALITY (arms raised into a ring over his head), CORONA (fists
// crossed, then raised crossed overhead), the taunt (one arm sweeping round
// like an orbit).

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, mouth, ears, skull, nose } from './_face.js';

const A = makePalette('eclipse.A', {
  outline: [2, 1, 4],
  skinHi: [22, 14, 11], skin: [15, 9, 7], skinSh: [10, 5, 5], skinDk: [5, 3, 3],
  white: [31, 31, 30], mouth: [8, 2, 4],
  sunHi: [31, 30, 16], sun: [30, 22, 4], sunDk: [19, 11, 2],
  moonHi: [14, 14, 22], moon: [6, 6, 12], moonDk: [2, 2, 6],
  silver: [24, 25, 30],
});
const B = makePalette('eclipse.B', {
  trunkHi: [9, 8, 15], trunk: [4, 4, 9], trunkDk: [2, 2, 4],
  bootHi: [9, 8, 13], boot: [4, 3, 7],
  star: [28, 28, 31],
});
export const palettes = { eclipse: { A, B } };

const poses = {
  // TOTALITY: both arms raised into a ring, gloves touching overhead
  totality1: {
    extends: 'idle1',
    head: { at: [0, -100], face: 'focus', look: [0, -1] },
    elL: [-30, -100], fiL: [-8, -122], elR: [30, -100], fiR: [8, -122],
    gloveL: { angle: 60 }, gloveR: { angle: -60 },
  },
  totality2: { extends: 'totality1', shift: [0, -1], elL: [-31, -102], elR: [31, -102], fiL: [-7, -124], fiR: [7, -124] },
  // CORONA: sun and moon fists crossed at the chest, then raised crossed overhead
  coronaTell1: {
    extends: 'idle1', shift: [0, 1],
    head: { at: [0, -99], face: 'focus', look: [0, 0] },
    elL: [-24, -64], fiL: [6, -76], elR: [24, -64], fiR: [-6, -78],
    gloveL: { angle: 70 }, gloveR: { angle: -70 },
    frontOrder: ['L', 'R'],
  },
  coronaTell2: {
    extends: 'idle1', shift: [0, 1],
    head: { at: [0, -99], face: 'strain', look: [0, -1] },
    elL: [-22, -100], fiL: [5, -116], elR: [22, -100], fiR: [-5, -118],
    gloveL: { angle: 30 }, gloveR: { angle: -30 },
    frontOrder: ['L', 'R'],
  },
  // taunt: one arm sweeping round overhead like an orbit
  orbit1: {
    extends: 'idle1',
    head: { at: [0, -100], face: 'grin', look: [-1, -1] },
    elR: [34, -84], fiR: [24, -108], gloveR: { angle: -20 },
    elL: [-24, -60], fiL: [-12, -72],
  },
  orbit2: {
    extends: 'idle1',
    head: { at: [0, -100], face: 'grin', look: [1, -1] },
    elR: [18, -98], fiR: [-6, -114], gloveR: { angle: -70 },
    elL: [-24, -60], fiL: [-12, -72],
  },
};

export default {
  id: 'eclipse',
  build: 'medium',
  // his own body on the build: heroic: broad shoulders, long legs
  body: { shoulders: 1.07, legLen: 1.03 },
  palettes: { default: 'eclipse' },
  torsoMaterial: 'skin',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['sunHi', 'sun', 'sunDk'],
    cuff: ['white', 'silver', 'moonHi'],
    shorts: ['trunkHi', 'trunk', 'trunkDk'],
    sock: ['bootHi', 'boot', 'outline'],
    boot: ['bootHi', 'boot', 'outline'],
    sole: ['sunDk', 'outline', 'outline'],
    sun: ['sunHi', 'sun', 'sunDk', 'sunDk'],
    moon: ['moonHi', 'moon', 'moonDk', 'moonDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    // sun rays standing out round the sun half
    for (const a of [-2.7, -2.25, -1.8, -1.35]) {
      const cx = x + Math.cos(a) * (H.rx + 1) + lx * 0.3, cy = y - 2 + Math.sin(a) * (H.ry + 1);
      const ox = Math.cos(a) * 5, oy = Math.sin(a) * 5;
      cv.part(ctx.mask().poly([[cx - oy * 0.4, cy + ox * 0.4], [cx + ox, cy + oy], [cx + oy * 0.4, cy - ox * 0.4]]), { ramp: ramps.sun, bevel: 1, inner: 'line', shadow: false });
    }
    ears(ctx, H, ramps.skin, [1.8, 3]);
    const hm = skull(ctx, H, ramps.skin, 'round');
    // the mask: everything above the jaw, gold on the left, black on the right
    const top = ctx.mask().rect(x - 20, y - 20, 40, 26 + ly).clip(hm);
    const sun = top.copy().cut(ctx.mask().rect(fx, y - 20, 30, 40));
    const moon = top.copy().cut(ctx.mask().rect(fx - 30, y - 20, 30, 40));
    cv.part(sun, { ramp: ramps.sun, bevel: 6, inner: 'soft', shadow: false });
    cv.part(moon, { ramp: ramps.moon, bevel: 6, inner: 'soft', shadow: false });
    for (let Y = y - 13; Y < y + 6 + ly; Y++) if (hm.in(fx, Y)) cv.px(fx, Y, c('outline'));
    // a silver crescent on the moon half
    const cr = ctx.mask().ellipse(fx + 6, fy - 6, 3.2, 3.6).cut(ctx.mask().ellipse(fx + 7.4, fy - 6.8, 2.8, 3.2)).clip(moon);
    cv.flat(cr, c('silver'));
    // eye holes, rimmed
    for (const s of [-1, 1]) cv.flat(ctx.mask().ellipse(fx + s * 4.5 - 0.5, fy, 3.4, 2.2), c('outline'));
    eyes(ctx, fx, fy, face, 0);
    nose(ctx, fx, fy + 1, ramps.skin, [1.8, 1.6], 3.8);
    mouth(ctx, fx, fy + 9, face, { w: 3 });
  },

  torso(ctx) {
    const { cv, J, c, D, pose } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, h = J.hip;
    const tm = ctx.torsoMask;
    if (!pose.lying) {
      // the gold ring on a cord
      for (let i = -7; i <= 7; i++) { const X = Math.round(n[0] + i), Y = Math.round(n[1] + 3 + (i * i) / 6); if (tm.in(X, Y)) cv.px(X, Y, c('outline')); }
      const rx = Math.round(n[0]), ry = Math.round(n[1] + 15);
      for (let a = 0; a < 14; a++) { const t = (a / 14) * Math.PI * 2; cv.px(rx + Math.round(Math.cos(t) * 3), ry + Math.round(Math.sin(t) * 3), c(a < 7 ? 'sun' : 'sunDk')); }
      cv.px(rx - 1, ry - 3, c('sunHi'));
    }
    // gold waistband, silver stars on the trunks
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, w[1] - 3, D.waistW * 2 + 2, 3).clip(ctx.shortsMask), { ramp: ['sunHi', 'sun', 'sunDk'].map(c), bevel: 1, inner: 'line', shadow: false });
    if (!pose.lying) for (const [dx, dy] of [[-12, 4], [-6, 9], [-15, 12], [8, 3], [13, 10], [5, 13], [-2, 2]]) {
      const X = Math.round(h[0] + dx), Y = Math.round(h[1] + dy);
      if (ctx.shortsMask.in(X, Y)) { cv.px(X, Y, c('star')); if ((dx & 3) === 0 && ctx.shortsMask.in(X + 1, Y)) { cv.px(X + 1, Y, c('trunkHi')); cv.px(X - 1, Y, c('trunkHi')); } }
    }
  },

  // the moon glove: whichever glove pixels belong to his right fist go black
  front(ctx) {
    const { cv, J } = ctx;
    const g = cv.rampId(ctx.ramps.glove), m = cv.rampId(ctx.ramps.moon);
    const [Lx, Ly] = J.fiL, [Rx, Ry] = J.fiR;
    for (let Y = 0; Y < cv.h; Y++) for (let X = 0; X < cv.w; X++) {
      const i = Y * cv.w + X;
      if (cv.ramp[i] !== g) continue;
      if ((X - Rx) ** 2 + (Y - Ry) ** 2 < (X - Lx) ** 2 + (Y - Ly) ** 2) cv.ramp[i] = m;
    }
  },
  // Title Defense, THE RING OF FIRE: a ring of fire burning behind his head (a
  // total eclipse's corona), flames licking up from the hems of his trunks, and
  // flame wraps round his forearms.
  remix: {
    colors: { B: { fireHi: [31, 29, 10], fire: [31, 15, 3], fireDk: [22, 4, 3] } },
    ramps: { fire: ['fireHi', 'fire', 'fireDk'] },
    back(ctx) {
      const { cv, J, ramps, pose } = ctx;
      if (pose.lying) return;
      const [x, y] = J.head;
      const ring = ctx.mask().ellipse(x, y, 20, 20).cut(ctx.mask().ellipse(x, y, 15, 15));
      for (let k = 0; k < 14; k++) {
        const a = (k / 14) * Math.PI * 2, r = 20;
        ring.poly([[x + Math.cos(a - 0.12) * r, y + Math.sin(a - 0.12) * r], [x + Math.cos(a) * (r + 6 + (k % 3) * 2), y + Math.sin(a) * (r + 6 + (k % 3) * 2)], [x + Math.cos(a + 0.12) * r, y + Math.sin(a + 0.12) * r]]);
      }
      cv.part(ring, { ramp: ramps.fire, bevel: 3, inner: 'soft' });
    },
    torso(ctx) {
      const { cv, J, ramps } = ctx;
      const sm = ctx.shortsMask;
      // flames up from the hem of each leg of the trunks
      for (const s of ['L', 'R']) {
        const kn = J['kn' + s], hip = J.hip;
        const hx = hip[0] + (kn[0] - hip[0]) * 0.45, hy = hip[1] + (kn[1] - hip[1]) * 0.45;
        const fl = ctx.mask();
        for (const dx of [-6, -2, 2, 6]) fl.poly([[hx + dx - 2.5, hy + 2], [hx + dx + 2.5, hy + 2], [hx + dx + 0.5, hy - 5 - (Math.abs(dx) < 4 ? 3 : 0)]]);
        cv.part(fl.clip(sm), { ramp: ramps.fire, bevel: 1, inner: 'line', shadow: false });
      }
    },
    front(ctx) {
      const { cv, J, c, pose } = ctx;
      if (pose.lying) return;
      for (const s of ['L', 'R']) {
        const e = J['el' + s], f = J['fi' + s];
        for (let k = 2; k <= 6; k++) {
          const t = k / 9, x = Math.round(e[0] + (f[0] - e[0]) * t), y = Math.round(e[1] + (f[1] - e[1]) * t);
          cv.px(x - 1, y, c(k % 2 ? 'fire' : 'fireHi')); cv.px(x + 1, y, c(k % 2 ? 'fireDk' : 'fire'));
        }
      }
    },
  },
};
