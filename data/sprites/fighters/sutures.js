// Doc Sutures: sprite layers on the medium build.
// A retired cutman: bald dome with a grey horseshoe fringe, round wire
// spectacles, a clipped grey moustache, a white short-sleeved medical smock
// with a red-cross patch, a stethoscope slung round his neck, mint scrub
// trunks, white sneakers, oxblood gloves with white tape at the wrist.
// Poses: slapping on a bandage (patch), the "scrubbed in" gloves-up tell before
// the Anaesthetic, and snapping his glove cuff (taunt).

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './_face.js';

const A = makePalette('sutures.A', {
  outline: [3, 2, 3],
  skinHi: [31, 25, 20], skin: [28, 19, 14], skinSh: [21, 12, 10], skinDk: [12, 6, 6],
  white: [31, 31, 31], mouth: [13, 3, 5],
  hairHi: [27, 27, 28], hair: [17, 17, 19],
  gloveHi: [26, 8, 10], glove: [17, 3, 6], gloveDk: [9, 1, 3],
  glass: [22, 28, 31],
});
const B = makePalette('sutures.B', {
  smock: [29, 30, 31], smockSh: [21, 23, 26], smockDk: [13, 15, 19],
  scrubHi: [18, 29, 25], scrub: [10, 22, 19], scrubDk: [5, 13, 12],
  cross: [29, 5, 6],
  tube: [9, 10, 13], chromeHi: [31, 31, 31], chrome: [18, 20, 23],
  shoe: [28, 28, 29], shoeDk: [17, 17, 20],
  bandage: [30, 26, 20],
});
export const palettes = { sutures: { A, B } };

const poses = {
  // slapping a bandage over his brow
  patch1: {
    extends: 'idle1', shift: [0, 1],
    head: { at: [-1, -99], face: 'hurt', tilt: 'down', look: [-1, 0] },
    bandage: true,
    elL: [-30, -80], fiL: [-12, -98], gloveL: { angle: 60 },
    elR: [26, -60], fiR: [12, -72],
  },
  patch2: {
    extends: 'patch1',
    head: { at: [-1, -99], face: 'strain', tilt: 'down', look: [-1, 0] },
    fiL: [-10, -101],
  },
  // "scrubbed in": both gloves up, elbows bent, like a surgeon before an operation
  scrubTell: {
    extends: 'idle1', shift: [0, 1],
    head: { at: [0, -100], face: 'focus', look: [0, 0] },
    elL: [-32, -70], elR: [32, -70], fiL: [-30, -92], fiR: [30, -92],
    gloveL: { angle: -8 }, gloveR: { angle: 8 },
  },
  // taunt: snaps his glove cuff tight
  snapGlove: {
    extends: 'idle1',
    head: { at: [1, -100], face: 'grin', look: [1, 1] },
    elL: [-24, -64], fiL: [-2, -76], gloveL: { angle: 80 },
    elR: [22, -66], fiR: [8, -80], gloveR: { angle: -20 },
  },
};

export default {
  id: 'sutures',
  build: 'medium',
  // his own body on the build: a retired cutman: slight and a little stooped
  body: { size: [0.96, 0.94], shoulders: 0.92, torsoLen: 0.97, dims: { belly: 6 } },
  palettes: { default: 'sutures' },
  torsoMaterial: 'smock',
  sleeve: { material: 'smock', length: 0.5 },
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['white', 'smockSh', 'smockDk'],
    smock: ['smock', 'smock', 'smockSh', 'smockDk'],
    shorts: ['scrubHi', 'scrub', 'scrubDk'],
    sock: ['smock', 'smockSh', 'smockDk'],
    boot: ['shoe', 'shoe', 'shoeDk'],
    sole: ['shoeDk', 'smockDk', 'outline'],
    hair: ['hairHi', 'hair', 'outline'],
    tube: ['chrome', 'tube', 'outline'],
    chrome: ['chromeHi', 'chrome', 'outline'],
  },

  head(ctx, H) {
    const { cv, ramps, c, pose } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    ears(ctx, H, ramps.skin, [2.4, 3.4]);
    const hm = skull(ctx, H, ramps.skin, 'round');
    // shiny dome, grey horseshoe fringe round the sides
    cv.px(x - 4 + lx, y - 9, c('white')); cv.px(x - 3 + lx, y - 10, c('white')); cv.px(x - 5 + lx, y - 8, c('skinHi'));
    const fr = ctx.mask();
    for (const s of [-1, 1]) fr.ellipse(x + s * (H.rx - 1.2), y - 1, 2.4, 5.2);
    cv.part(fr.clip(hm), { ramp: ramps.hair, bevel: 1, inner: 'soft', shadow: false });
    for (let yy = -5; yy <= 3; yy += 2) for (const s of [-1, 1]) cv.shade(x + s * (H.rx - 1), y + yy, 1);
    eyes(ctx, fx, fy, face, 0);
    brows(ctx, fx, fy, face, ramps.hair, { len: 4.2, thick: 1, y: -4.6 });
    // round wire spectacles
    for (const s of [-1, 1]) {
      const ex = fx + s * 5 - (s > 0 ? 1 : 0), ey = fy;
      for (let a = 0; a < 20; a++) { const t = (a / 20) * Math.PI * 2; cv.px(Math.round(ex + Math.cos(t) * 3.6), Math.round(ey + Math.sin(t) * 3), c('chrome')); }
      cv.px(ex - 2, ey - 1, c('glass')); cv.px(ex - 1, ey - 2, c('glass'));
    }
    cv.px(fx - 1, fy - 1, c('chrome')); cv.px(fx, fy - 1, c('chrome'));
    nose(ctx, fx, fy, ramps.skin, [2.3, 2.3], 3.6);
    mouth(ctx, fx, fy + 9, face, { w: 3.6 });
    // clipped grey moustache
    cv.part(ctx.mask().ellipse(fx - 2.6, fy + 7, 3.4, 1.3).ellipse(fx + 2.6, fy + 7, 3.4, 1.3), { ramp: ramps.hair, bevel: 1, inner: 'line', shadow: false });
    // the bandage going on over one brow (patch poses)
    if (pose.bandage) {
      cv.part(ctx.mask().rect(fx + 3, fy - 9, 7, 3), { ramp: ['bandage', 'bandage', 'smockSh'].map(c), bevel: 1, inner: 'line', shadow: false });
      cv.px(fx + 5, fy - 8, c('smockSh')); cv.px(fx + 7, fy - 8, c('smockSh'));
    }
  },

  torso(ctx) {
    const { cv, J, c, D, ramps, pose } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, h = J.hip;
    const tm = ctx.torsoMask;
    // v-neck
    cv.part(ctx.mask().poly([[n[0] - 5, n[1]], [n[0] + 5, n[1]], [n[0], n[1] + 8]]).clip(tm), { ramp: ramps.skin, bevel: 2, inner: 'line', shadow: false });
    // front placket + snap buttons
    for (let k = 0; k < 4; k++) cv.px(w[0] + 1, n[1] + 11 + k * 6, c('smockDk'));
    // red-cross patch on the chest
    if (!pose.lying) {
      const px = Math.round(ch[0] - 9), py = Math.round(ch[1] - 6);
      cv.part(ctx.mask().rect(px - 3, py - 3, 7, 7).clip(tm), { ramp: ['smock', 'smock', 'smockSh'].map(c), bevel: 1, inner: 'line', shadow: false });
      cv.stamp(['..x..', '..x..', 'xxxxx', '..x..', '..x..'], px - 2, py - 2, { x: c('cross') });
    }
    // stethoscope: tube round the neck, chrome ends, the bell hanging on the chest
    const tube = ctx.mask().capsule(n[0] - 8, n[1] + 1, n[0] - 7, n[1] + 14, 1.2).capsule(n[0] + 8, n[1] + 1, n[0] + 9, n[1] + 12, 1.2).capsule(n[0] - 8, n[1] + 1, n[0] + 8, n[1] + 1, 1.2);
    cv.part(tube.clip(tm), { ramp: ramps.tube, bevel: 1, inner: 'line', shadow: false });
    if (!pose.lying) cv.part(ctx.mask().ellipse(n[0] - 7, n[1] + 16, 2.4, 2.4), { ramp: ramps.chrome, bevel: 1, inner: 'line', shadow: false });
    cv.px(n[0] + 9, n[1] + 13, c('chromeHi'));
    // smock hem over the trunks
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, w[1] - 3, D.waistW * 2 + 2, 4).clip(tm.copy().add(ctx.shortsMask)), { ramp: ramps.smock, bevel: 1, inner: 'line', shadow: false });
    // scrub drawstring
    cv.px(h[0] - 1, w[1] + 2, c('smock')); cv.px(h[0] - 1, w[1] + 3, c('smock')); cv.px(h[0] + 1, w[1] + 2, c('smock')); cv.px(h[0] + 2, w[1] + 4, c('smock'));
  },
};
