// Cirrus Crown (#58, Pantheon II's champion): sprite layers on the medium build.
// The king of the weather: pale lavender skin, a long wispy white beard and hair that
// drifts like cirrus, a tall crown of white feathers on a silver band, an open robe of
// deep indigo over his trunks with silver star-and-moon trim, a sun-and-moon medallion,
// silver-white gloves. `cirrus.dark` is the same man as a silhouette (the lightning:
// he's only lit while a bolt flashes; opponentAI's `weather`).
// Poses: decree (both arms raised to the sky: the taunt).

import { makePalette, swapPalette } from '../../../../src/engine/palette.js';
import { eyes, mouth, ears, skull, nose } from '../_face.js';

const A = makePalette('cirrus.A', {
  outline: [3, 3, 8],
  skinHi: [29, 27, 31], skin: [24, 22, 29], skinSh: [16, 14, 23], skinDk: [9, 8, 15],
  white: [31, 31, 31], mouth: [9, 5, 12],
  hairHi: [31, 31, 31], hair: [27, 28, 31], hairDk: [17, 19, 27],
  gloveHi: [31, 31, 31], glove: [25, 27, 31], gloveDk: [14, 16, 25],
});
const B = makePalette('cirrus.B', {
  robeHi: [12, 11, 26], robe: [6, 5, 18], robeSh: [3, 3, 10],
  silverHi: [31, 31, 31], silver: [24, 26, 30], silverDk: [13, 15, 22],
  sunHi: [31, 31, 20], sun: [31, 24, 6], sunDk: [22, 12, 2],
  moon: [23, 29, 31], moonDk: [12, 19, 27],
});
// the silhouette: every colour a near-black blue, the eyes and the crown's edge faintly lit
const darkA = {}, darkB = {};
for (const k of A.keys) if (k !== 'outline') darkA[k] = /Hi$|white/.test(k) ? [5, 6, 12] : /Dk$/.test(k) ? [2, 2, 5] : [3, 4, 8];
for (const k of B.keys) darkB[k] = /Hi$/.test(k) ? [6, 7, 13] : /Dk$/.test(k) ? [2, 2, 5] : [3, 4, 9];
darkA.outline = [1, 1, 4];
export const palettes = { cirrus: { A, B }, 'cirrus.dark': { A: swapPalette('cirrus.darkA', A, darkA), B: swapPalette('cirrus.darkB', B, darkB) } };

const poses = {
  // both arms to the sky: the decree
  decree: {
    extends: 'idle1', shift: [0, 0],
    head: { at: [0, -101], face: 'grin', tilt: 'up', look: [0, -1] },
    elL: [-32, -88], elR: [32, -88], fiL: [-26, -110], fiR: [26, -110],
    gloveL: { angle: 15 }, gloveR: { angle: -15 },
  },
};

export default {
  id: 'cirrus',
  build: 'medium',
  // his own body: tall and spare, long arms, an old king's straight back
  body: { size: [1.0, 1.02], legLen: 1.0, torsoLen: 1.02, shoulders: 1.0, neckLen: 0.5, dims: { waistW: 14.5, belly: 2, upperArm: [5.6, 4.6] } },
  palettes: { default: 'cirrus' },
  torsoMaterial: 'skin',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['silverHi', 'silver', 'silverDk'],
    robe: ['robeHi', 'robe', 'robeSh', 'outline'],
    shorts: ['robeHi', 'robe', 'robeSh'],
    sock: ['silverHi', 'silver', 'silverDk'],
    boot: ['silverHi', 'silver', 'silverDk'],
    sole: ['silverDk', 'robeSh', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    silver: ['silverHi', 'silver', 'silverDk'],
    sun: ['sunHi', 'sun', 'sunDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';
    // the crown first: a silver band and a fan of tall white feathers
    for (let k = -3; k <= 3; k++) {
      const fx0 = x + k * 4.2 + lx * 0.4, len = 15 - Math.abs(k) * 2.4;
      cv.part(ctx.mask().poly([[fx0 - 2.2, y - 8], [fx0 + 2.2, y - 8], [fx0 + k * 0.9, y - 8 - len]]), { ramp: ramps.hair, bevel: 2, inner: 'line' });
    }
    ears(ctx, H, ramps.skin, [2.2, 3]);
    const hm = skull(ctx, H, ramps.skin, 'chin');
    // long wispy hair on either side and a bald crown under the band
    for (const s of [-1, 1]) cv.part(ctx.mask().ellipse(x + s * (H.rx + 1) + lx * 0.3, y + 6, 3, 10).cut(ctx.mask().ellipse(fx, fy + 3, H.rx - 0.6, 9)), { ramp: ramps.hair, bevel: 2, inner: 'line' });
    cv.part(ctx.mask().rect(x - H.rx - 0.5 + lx * 0.3, y - 7, H.rx * 2 + 1, 3.4), { ramp: ramps.silver, bevel: 1, inner: 'line', shadow: false });
    cv.part(ctx.mask().ellipse(fx, y - 5.3, 2, 2), { ramp: ramps.sun, bevel: 1, shadow: false });
    // eyes lit from within, snowy brows
    eyes(ctx, fx, fy, face === 'neutral' ? 'focus' : face, 0);
    cv.part(ctx.mask().capsule(fx - 8, fy - 3.4, fx - 1.5, fy - 2.6, 1.5, 1.2).capsule(fx + 1.5, fy - 2.6, fx + 8, fy - 3.4, 1.2, 1.5), { ramp: ramps.hair, bevel: 1, inner: 'soft' });
    nose(ctx, fx, fy, ramps.skin, [2.1, 2.2], 3.5);
    // the wispy beard: long, white, trailing off to one side
    const bd = ctx.mask().ellipse(fx, fy + 10, H.rx - 0.4, 7).cut(ctx.mask().ellipse(fx, fy + 3.5, H.rx + 3, 4.6));
    bd.poly([[fx - 6, fy + 12], [fx + 6, fy + 12], [fx + 8, fy + 26], [fx + 2, fy + 21], [fx - 4, fy + 24]]);
    cv.part(bd, { ramp: ramps.hair, bevel: 3, inner: 'line' });
    for (let i = -5; i <= 6; i += 3) cv.shade(fx + i, fy + 13 + ((i + 8) % 4), 1);
    const m = mouth(ctx, fx, fy + 8, face === 'neutral' ? 'neutral' : face, { w: 3 });
    if (m == null) for (let i = -2; i <= 1; i++) cv.px(fx + i, fy + 8, c('outline'));
    ctx.headMask = hm;
  },

  torso(ctx) {
    const { cv, J, c, ramps, D, pose } = ctx;
    if (pose.lying) return;
    const n = J.neck, w = J.waist, ch = J.chest, tm = ctx.torsoMask;
    // the open robe: two panels over the shoulders, hanging to the trunks, silver trim
    for (const s of [-1, 1]) {
      const p = ctx.mask().poly([[n[0] + s * 4, n[1] + 1], [n[0] + s * 13, n[1] + 1], [ch[0] + s * (D.chestW - 1), ch[1] + 2], [w[0] + s * (D.waistW - 1), w[1] + 8], [w[0] + s * 5, w[1] + 8], [ch[0] + s * 6, ch[1] + 2]]).clip(ctx.mask().add(tm).add(ctx.shortsMask));
      cv.part(p, { ramp: ramps.robe, bevel: 4, inner: 'line' });
      cv.line(n[0] + s * 4, n[1] + 2, w[0] + s * 5, w[1] + 7, (X, Y) => cv.px(X, Y, c('silver')));
      for (let k = 0; k < 4; k++) cv.px(ch[0] + s * (10 + (k & 1) * 4), ch[1] - 2 + k * 5, c('silverHi')); // stars
    }
    // the sun-and-moon medallion on his chest
    const sx = Math.round(ch[0]), sy = Math.round(ch[1] + 1);
    cv.part(ctx.mask().ellipse(sx, sy, 4.4, 4.4), { ramp: ramps.sun, bevel: 3, inner: 'line' });
    cv.part(ctx.mask().ellipse(sx + 1.6, sy, 3, 3.4), { ramp: ['moon', 'moon', 'moonDk'].map(c), bevel: 2, shadow: false });
    // a silver belt
    const by = Math.round(w[1] + 1);
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, by - 1, D.waistW * 2 + 2, 3).clip(ctx.mask().add(tm).add(ctx.shortsMask)), { ramp: ramps.silver, bevel: 1, inner: 'line', shadow: false });
  },
};
