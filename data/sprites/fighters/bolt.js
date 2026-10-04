// Bolt Brennan: sprite layers on the lean build.
// A wiry live wire: electric-yellow hair spiked up in lightning points, a
// charcoal sleeveless compression top with a yellow bolt across it, black
// trunks with a yellow zigzag hem, yellow gloves, black-and-yellow high-tops.
// crackle1/2 are his hold poses: loose, gloves low, sparks jumping between
// them (the lightning modifier holds these until the real tell).

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './_face.js';

const A = makePalette('bolt.A', {
  outline: [2, 2, 3],
  skinHi: [31, 25, 20], skin: [27, 18, 13], skinSh: [20, 11, 9], skinDk: [11, 6, 5],
  white: [31, 31, 31], mouth: [13, 3, 5],
  hairHi: [31, 31, 20], hair: [31, 27, 4], hairDk: [22, 15, 2],
  gloveHi: [31, 31, 18], glove: [30, 25, 3], gloveDk: [19, 13, 2],
  spark: [28, 31, 31],
});
const B = makePalette('bolt.B', {
  topHi: [12, 13, 16], top: [7, 8, 10], topDk: [3, 3, 5],
  blackHi: [9, 9, 12], black: [4, 4, 6],
  bolt: [31, 27, 4], boltDk: [22, 15, 2],
  shoeHi: [31, 31, 31], shoe: [23, 23, 25],
});
export const palettes = { bolt: { A, B } };

const poses = {
  // loose and crackling, gloves low, weight on his toes
  crackle1: {
    extends: 'idle1', shift: [0, 1],
    head: { at: [0, -99], face: 'grin', look: [0, 0] },
    elL: [-26, -58], elR: [26, -58], fiL: [-18, -48], fiR: [18, -48],
    gloveL: { angle: 160 }, gloveR: { angle: -160 },
    sparks: 1,
  },
  crackle2: {
    extends: 'crackle1', shift: [0, 1],
    fiL: [-17, -50], fiR: [19, -46],
    head: { at: [0, -98], face: 'focus', look: [0, 0] },
    sparks: 2,
  },
};

export default {
  id: 'bolt',
  build: 'lean',
  // his own body on the build: wiry and springy: long legs, thin arms
  body: { shoulders: 0.96, legLen: 1.04, dims: { upperArm: [4.6, 3.8], forearm: [4, 3.4] } },
  palettes: { default: 'bolt' },
  torsoMaterial: 'top',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['topHi', 'top', 'topDk'],
    top: ['topHi', 'top', 'topDk', 'outline'],
    shorts: ['blackHi', 'black', 'outline'],
    sock: ['shoeHi', 'shoe', 'topHi'],
    boot: ['shoeHi', 'bolt', 'boltDk'],
    sole: ['shoeHi', 'shoe', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    bolt: ['bolt', 'bolt', 'boltDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    ears(ctx, H, ramps.skin, [1.8, 2.8]);
    skull(ctx, H, ramps.skin, 'narrow');
    // lightning-point spikes of electric-yellow hair
    const cy = y + (H.tilt === 'up' ? -1 : H.tilt === 'down' ? 1 : 0);
    const hr = ctx.mask().ellipse(x + lx * 0.3, cy - 6, H.rx + 0.5, 6.5).cut(ctx.mask().rect(x - 14, cy - 3, 28, 12));
    for (const [dx, h, lean] of [[-9, 9, -5], [-5, 13, -3], [0, 15, 1], [5, 13, 4], [9, 9, 6]]) hr.poly([[x + dx - 3, cy - 8], [x + dx + lean, cy - 8 - h], [x + dx + 1, cy - 10 - h * 0.45], [x + dx + 3, cy - 8]]);
    cv.part(hr, { ramp: ramps.hair, bevel: 2, inner: 'line' });
    for (const dx of [-6, -1, 4]) cv.shade(x + dx, cy - 12, -1);
    eyes(ctx, fx, fy, face, 0);
    brows(ctx, fx, fy, face, ramps.hair, { len: 4, thick: 1, y: -4.2 });
    nose(ctx, fx, fy, ramps.skin, [1.8, 2], 3.5);
    mouth(ctx, fx, fy + 8, face, { w: 3.2 });
    // a zigzag shaved into one side
    for (const [dx, dy] of [[0, 0], [1, 1], [0, 2], [1, 3]]) cv.px(x + Math.round(H.rx) - 3 + dx, cy - 5 + dy, c('skinSh'));
  },

  torso(ctx) {
    const { cv, J, c, D, ramps, pose } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest;
    const tm = ctx.torsoMask;
    for (const s of ['L', 'R']) cv.part(ctx.mask().ellipse(J['sh' + s][0], J['sh' + s][1], D.deltoid + 1.2, D.deltoid + 0.8).clip(tm), { ramp: ramps.skin, bevel: 3, shadow: false });
    cv.part(ctx.mask().ellipse(n[0], n[1] + 1, 5, 3).clip(tm), { ramp: ramps.skin, bevel: 2, inner: 'line', shadow: false });
    // a yellow lightning bolt slashing across the chest
    if (!pose.lying) {
      const bx = ch[0], by = ch[1];
      cv.part(ctx.mask().poly([[bx + 9, by - 10], [bx - 1, by - 1], [bx + 3, by], [bx - 8, by + 11], [bx + 2, by + 2], [bx - 2, by + 1]]).clip(tm), { ramp: ramps.bolt, bevel: 1, inner: 'line', shadow: false });
    }
    // yellow zigzag hem on the trunks
    const sm = ctx.shortsMask;
    for (let X = 0; X < sm.w; X++) for (let Y = 0; Y < sm.h; Y++) {
      if (!sm.in(X, Y) || sm.in(X, Y + 1)) continue;
      const k = ((X >> 1) & 1);
      cv.px(X, Y - 1 - k, c('bolt'));
    }
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, w[1] - 3, D.waistW * 2 + 2, 2).clip(sm), { ramp: ramps.bolt, bevel: 1, inner: 'line', shadow: false });
  },

  // sparks arcing between his gloves in the crackle poses
  front(ctx) {
    const { cv, J, c, pose } = ctx;
    if (!pose.sparks) return;
    const [ax, ay] = J.fiL, [bx, by] = J.fiR;
    const n = 12;
    for (let k = 1; k < n; k++) {
      const t = k / n, X = ax + (bx - ax) * t, Y = ay + (by - ay) * t + (((k + pose.sparks) % 3) - 1) * 3 - 6;
      cv.px(X, Y, c(k % 2 ? 'spark' : 'hairHi'));
    }
    for (const [x0, y0] of [[ax, ay], [bx, by]]) for (const [dx, dy] of pose.sparks === 1 ? [[-8, -6], [7, -9]] : [[-9, -2], [8, -4]]) cv.px(x0 + dx, y0 + dy, c('spark'));
  },
};
