// Zephyr Kade (#55): sprite layers on the lean build.
// A wind rider: light tan skin, pale-cyan hair blown straight up into a swept crest,
// a scarf of white silk trailing off one shoulder, a sleeveless white top piped in
// teal, teal-and-white trunks, white bracers, gloves with feathered cuffs and winged
// sandals (a little pair of white wings at each ankle): he never quite touches the
// canvas. Poses: soar (arms out, the taunt: nothing like a boxer).

import { makePalette } from '../../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from '../_face.js';
import { ribbon } from './_kit.js';

const A = makePalette('zephyr.A', {
  outline: [2, 3, 6],
  skinHi: [30, 24, 19], skin: [26, 18, 13], skinSh: [18, 11, 9], skinDk: [10, 6, 5],
  white: [31, 31, 31], mouth: [12, 3, 5],
  hairHi: [26, 31, 31], hair: [13, 26, 29], hairDk: [5, 15, 20],
  gloveHi: [31, 31, 31], glove: [26, 29, 31], gloveDk: [14, 20, 27],
});
const B = makePalette('zephyr.B', {
  topHi: [31, 31, 31], top: [27, 29, 31], topSh: [16, 21, 27],
  tealHi: [12, 29, 29], teal: [3, 21, 23], tealDk: [1, 11, 15],
  wingHi: [31, 31, 31], wing: [25, 28, 31], wingDk: [13, 18, 26],
  scarfHi: [31, 30, 20], scarf: [28, 24, 10], scarfDk: [16, 12, 4],
});
export const palettes = { zephyr: { A, B } };

const poses = {
  // arms wide, chest open, weight on the toes: riding the wind
  soar: {
    extends: 'idle1', shift: [0, 0],
    knL: [-12, -23], knR: [12, -23], ftL: [-13, -2], ftR: [13, -2],
    head: { at: [0, -101], face: 'grin', tilt: 'up', look: [0, -1] },
    elL: [-35, -84], elR: [35, -84], fiL: [-34, -104], fiR: [34, -104],
    gloveL: { angle: 15 }, gloveR: { angle: -15 },
  },
};

export default {
  id: 'zephyr',
  build: 'lean',
  // his own body: tall and narrow, long legs, hardly any weight to him
  body: { size: [0.97, 1.04], legLen: 1.08, torsoLen: 0.96, shoulders: 0.95, neckLen: 0.5, dims: { waistW: 11, upperArm: [4.4, 3.6], thigh: [5.6, 4.4] } },
  palettes: { default: 'zephyr' },
  torsoMaterial: 'skin',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['wingHi', 'wing', 'wingDk'],
    top: ['topHi', 'top', 'topSh', 'outline'],
    shorts: ['tealHi', 'teal', 'tealDk'],
    sock: ['topHi', 'top', 'topSh'],
    boot: ['wingHi', 'wing', 'wingDk'],
    sole: ['tealDk', 'tealDk', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    teal: ['tealHi', 'teal', 'tealDk'],
    wing: ['wingHi', 'wing', 'wingDk'],
    scarf: ['scarfHi', 'scarf', 'scarfDk'],
  },

  // the scarf streaming out behind him (and the wings on his ankles are in `front`)
  back(ctx) {
    const { J, ramps, pose } = ctx;
    if (pose.lying) return;
    const n = J.neck, s = J.shL;
    ribbon(ctx, [n[0] - 3, n[1] + 4], -1, 34, { amp: 4, waves: 1.3, r0: 3.2, r1: 1, lift: -3, ramp: ramps.scarf, phase: 0.6 });
    ribbon(ctx, [s[0] + 2, s[1] + 2], -1, 26, { amp: 3, waves: 1.1, r0: 2.2, r1: 0.8, lift: 3, ramp: ramps.scarf, phase: 2 });
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';
    ears(ctx, H, ramps.skin, [1.8, 2.7]);
    const hm = skull(ctx, H, ramps.skin, 'narrow');
    // hair blown straight up and back into a swept crest, a few loose spikes
    const hair = ctx.mask().ellipse(x + lx * 0.3, y - 5, H.rx + 0.4, 6.5).cut(ctx.mask().rect(x - 20, y - 2, 40, 20));
    for (const [dx, dy, h] of [[-8, -8, 9], [-4, -10, 12], [0, -11, 14], [4, -10, 11], [8, -8, 8], [-11, -3, 6]]) hair.poly([[x + dx - 2.4 + lx * 0.4, y + dy], [x + dx + 2.4 + lx * 0.4, y + dy], [x + dx * 1.35 + lx * 0.4 + 1, y + dy - h]]);
    cv.part(hair, { ramp: ramps.hair, bevel: 2, inner: 'line' });
    for (const [dx, dy] of [[-4, -14], [0, -17], [4, -14]]) cv.px(x + dx + lx * 0.4, y + dy, c('hairHi'));
    // a teal headband
    cv.part(ctx.mask().rect(x - H.rx + lx * 0.3, y - 4.5, H.rx * 2, 2), { ramp: ramps.teal, bevel: 1, inner: 'line', shadow: false });
    eyes(ctx, fx, fy, face === 'neutral' ? 'focus' : face, -1);
    brows(ctx, fx, fy, face, ramps.hair, { len: 3.6, thick: 0.9, y: -4.2 });
    nose(ctx, fx, fy, ramps.skin, [1.6, 1.8], 3.4);
    mouth(ctx, fx, fy + 8, face === 'neutral' ? 'grin' : face, { w: 3 });
    ctx.headMask = hm;
  },

  torso(ctx) {
    const { cv, J, c, ramps, D, pose } = ctx;
    if (pose.lying) return;
    const n = J.neck, w = J.waist, ch = J.chest, tm = ctx.torsoMask;
    // a sleeveless white top piped in teal, cut short over the belly
    const top = ctx.mask().poly([[n[0] - 9, n[1] + 1], [n[0] + 9, n[1] + 1], [ch[0] + D.chestW - 1, ch[1] + 6], [ch[0] - D.chestW + 1, ch[1] + 6]]).clip(tm);
    cv.part(top, { ramp: ramps.top, bevel: 4, inner: 'line' });
    for (const s of [-1, 1]) cv.line(n[0] + s * 9, n[1] + 2, ch[0] + s * (D.chestW - 2), ch[1] + 5, (X, Y) => cv.px(X, Y, c('teal')));
    cv.line(ch[0] - D.chestW + 2, ch[1] + 6, ch[0] + D.chestW - 2, ch[1] + 6, (X, Y) => cv.px(X, Y, c('teal')));
    // swirls of wind stitched into the front
    for (let k = 0; k < 8; k++) { const a = k * 0.8; cv.px(ch[0] - 3 + Math.cos(a) * (2 + k * 0.4), ch[1] + 1 + Math.sin(a) * (2 + k * 0.4), c('tealHi')); }
    // teal-and-white trunks: a white waistband and a stripe
    const by = Math.round(w[1]);
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, by - 2, D.waistW * 2 + 2, 3).clip(ctx.shortsMask), { ramp: ramps.top, bevel: 1, inner: 'line', shadow: false });
    for (const s of [-1, 1]) cv.line(J.hip[0] + s * (D.hipSpread + 4), by + 2, J.hip[0] + s * (D.hipSpread + 6), J.hip[1] + 8, (X, Y) => { if (ctx.shortsMask.in(X, Y)) cv.px(X, Y, c('topHi')); });
  },

  // the little wings on his ankles
  front(ctx) {
    const { cv, J, ramps, pose } = ctx;
    if (pose.lying) return;
    for (const [s, ft] of [[-1, J.ftL], [1, J.ftR]]) {
      const x = ft[0], y = ft[1] - 7;
      for (let k = 0; k < 3; k++) cv.part(ctx.mask().poly([[x + s * 3, y + k * 2 - 1], [x + s * (9 + k * 2), y - 5 + k * 3], [x + s * (10 + k * 2), y - 2 + k * 3], [x + s * 3, y + k * 2 + 2]]), { ramp: ramps.wing, bevel: 1, inner: 'line', shadow: false });
    }
  },
};
