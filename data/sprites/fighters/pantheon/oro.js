// Sentinel Oro (#51): sprite layers on the heavy build.
// The gate guard of the Pantheon: a stout knight in gilded plate: an open-faced gold
// helm with a nose guard and a crest of red horsehair, a curly black beard, a
// breastplate with a sun on it, shoulder plates, a white pleated kilt of straps,
// gold greaves and sabatons, gilded gauntlets. In his left hand a big round gilded
// shield (sun rays, a blue gem boss) that covers his front: every pose has a `_ns`
// twin without it (the shield lying on the canvas beside him: opponentAI's `shield`).
// `oro.glow` is the whole armour burning white-gold: the shield bash's tell.
// Poses: bashTell / bash (the shield thrust), and the shared ones.

import { makePalette, swapPalette } from '../../../../src/engine/palette.js';
import { eyes, mouth, skull, ears } from '../_face.js';
import { POSES } from '../../builds/poses.js';

const A = makePalette('oro.A', {
  outline: [3, 2, 3],
  skinHi: [29, 21, 14], skin: [24, 15, 9], skinSh: [17, 9, 5], skinDk: [10, 5, 3],
  white: [31, 31, 29], mouth: [11, 3, 4],
  hairHi: [10, 7, 6], hair: [5, 3, 3], hairDk: [2, 1, 1],
  gloveHi: [31, 30, 17], glove: [29, 23, 5], gloveDk: [18, 12, 2],
});
const B = makePalette('oro.B', {
  goldHi: [31, 30, 17], gold: [29, 23, 5], goldSh: [21, 14, 3], goldDk: [12, 7, 1],
  plumeHi: [31, 14, 10], plume: [26, 5, 5], plumeDk: [13, 2, 3],
  tuHi: [31, 31, 29], tu: [27, 26, 24], tuSh: [18, 17, 19],
  strapHi: [16, 10, 6], strap: [9, 5, 3],
  gem: [5, 19, 31],
});
// the whole armour burning white-gold (the bash)
const glowB = swapPalette('oro.glowB', B, {
  goldHi: [31, 31, 27], gold: [31, 30, 17], goldSh: [31, 25, 8], goldDk: [24, 16, 3], gem: [22, 30, 31],
  tuHi: [31, 31, 31], tu: [31, 31, 27],
});
const glowA = swapPalette('oro.glowA', A, { gloveHi: [31, 31, 27], glove: [31, 30, 17], gloveDk: [24, 16, 3] });
export const palettes = { oro: { A, B }, 'oro.glow': { A: glowA, B: glowB } };

// every shared pose again without the shield (`_ns`)
const noShield = {};
for (const k of Object.keys(POSES)) noShield[k + '_ns'] = { extends: k, noShield: true };

const poses = {
  ...noShield,
  // the bash: the shield hauled back, then driven straight at you
  bashTell: {
    extends: 'idle1', shift: [-2, 3], knL: [-15, -21], knR: [15, -21], ftL: [-17, 0], ftR: [17, 0],
    head: { at: [-4, -97], face: 'strain', look: [-1, 1] },
    shL: [-22, -79], elL: [-36, -66], fiL: [-38, -50],
    gloveL: { angle: 160 },
    shR: [19, -80], elR: [22, -60], fiR: [8, -72],
    shield: { dx: -4, dy: 6, s: 1.08 },
  },
  bash: {
    extends: 'idle1', shift: [3, 4], knL: [-15, -21], knR: [15, -21], ftL: [-17, 0], ftR: [17, 0],
    head: { at: [3, -96], face: 'strain', look: [1, 1] },
    shL: [-14, -80], elL: [-10, -70], fiL: [-2, -66],
    gloveL: { view: 'front', size: 1.2 },
    shR: [22, -79], elR: [27, -59], fiR: [12, -74],
    shield: { dx: 2, dy: 0, s: 1.42 },
    frontOrder: ['R', 'L'],
  },
  // picking the shield back up off the canvas
  retrieve: {
    extends: 'crouchTell', noShield: true,
    head: { at: [0, -88], face: 'focus', tilt: 'down', look: [0, 2] },
    elL: [-24, -46], fiL: [-26, -24], gloveL: { angle: 175 },
    elR: [22, -54], fiR: [12, -66],
  },
};

export default {
  id: 'oro',
  build: 'heavy',
  // his own body on the build: a stout knight: broad plate shoulders, a solid trunk, short strong legs
  body: { size: [1.04, 1.0], legLen: 0.94, torsoLen: 1.04, shoulders: 1.08, neckLen: -1, dims: { neck: 8, chestW: 26, waistW: 21, belly: 6, deltoid: 9 } },
  palettes: { default: 'oro' },
  torsoMaterial: 'skin',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['goldHi', 'gold', 'goldSh'],
    shorts: ['tuHi', 'tu', 'tuSh'],
    sock: ['goldHi', 'gold', 'goldSh'],
    boot: ['goldHi', 'gold', 'goldDk'],
    sole: ['goldSh', 'goldDk', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    gold: ['goldHi', 'gold', 'goldSh', 'goldDk'],
    plume: ['plumeHi', 'plume', 'plumeDk'],
    strap: ['strapHi', 'strap', 'outline'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    ears(ctx, H, ramps.skin, [2.4, 3.4]);
    const hm = skull(ctx, H, ramps.skin, 'square');
    // the crest first (behind the helm): a fan of red horsehair
    const crest = ctx.mask().poly([[x - 3 + lx * 0.4, y - 13], [x - 6 + lx * 0.4, y - 21], [x - 2 + lx * 0.4, y - 26], [x + 3 + lx * 0.4, y - 26], [x + 7 + lx * 0.4, y - 21], [x + 4 + lx * 0.4, y - 13]]);
    cv.part(crest, { ramp: ramps.plume, bevel: 3, inner: 'line' });
    for (let k = -3; k <= 3; k += 2) cv.line(x + k + lx * 0.4, y - 14, x + k * 1.6 + lx * 0.4, y - 25, (X, Y) => cv.shade(X, Y, 1));
    // the helm: a gold dome, a brow band and cheek guards, an open face
    const dome = ctx.mask().ellipse(x + lx * 0.4, y - 7, H.rx + 1.2, 7.5).cut(ctx.mask().rect(x - 20, y - 4, 40, 20));
    cv.part(dome, { ramp: ramps.gold, bevel: 5, inner: 'line' });
    cv.part(ctx.mask().rect(x - H.rx - 0.5 + lx * 0.4, y - 5, H.rx * 2 + 1, 3), { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
    for (const s of [-1, 1]) {
      const g = ctx.mask().poly([[x + s * (H.rx + 0.5) + lx * 0.3, y - 3], [x + s * (H.rx - 3.5) + lx * 0.3, y - 3], [x + s * (H.rx - 4.5) + lx * 0.3, y + 8], [x + s * (H.rx + 0.2) + lx * 0.3, y + 6]]);
      cv.part(g, { ramp: ramps.gold, bevel: 2, inner: 'line', shadow: false });
    }
    cv.px(x - 1 + lx * 0.4, y - 9, c('goldHi')); cv.px(x + lx * 0.4, y - 9, c('white'));
    // eyes under the brow band, heavy dark brows
    eyes(ctx, fx, fy + 1, face === 'neutral' ? 'focus' : face, 0);
    const br = face === 'hurt' || face === 'ko' ? [-1, 1] : face === 'dazed' ? [-1, 0] : [1, -1];
    cv.part(ctx.mask().capsule(fx - 8, fy - 2.4 + br[1], fx - 1.5, fy - 2 + br[0], 1.4, 1.3).capsule(fx + 1.5, fy - 2 + br[0], fx + 7, fy - 2.4 + br[1], 1.3, 1.4), { ramp: ramps.hair, bevel: 1, inner: 'soft' });
    // nose guard down the middle of the face
    cv.part(ctx.mask().rect(fx - 1, y - 5, 2.4, 9), { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
    // a thick curly beard round the jaw, mouth showing through it
    const bd = ctx.mask().ellipse(fx, fy + 8.5, H.rx - 1.2, 6).cut(ctx.mask().ellipse(fx, fy + 3.2, H.rx + 3, 4));
    bd.ellipse(fx - 6.5, fy + 5.5, 2.4, 4).ellipse(fx + 6.5, fy + 5.5, 2.4, 4);
    cv.part(bd, { ramp: ramps.hair, bevel: 2, inner: 'line' });
    for (let i = -6; i <= 6; i += 2) { cv.shade(fx + i, fy + 9 + (i & 2 ? 1 : 0), 1); cv.px(fx + i, fy + 6, c('hairHi')); }
    const m = mouth(ctx, fx, fy + 7, face === 'grin' ? 'neutral' : face, { w: 3 });
    if (m == null) for (let i = -2; i <= 1; i++) cv.px(fx + i, fy + 8, c('outline'));
    ctx.headMask = hm;
  },

  torso(ctx) {
    const { cv, J, c, ramps, D, pose } = ctx;
    if (pose.lying) return;
    const n = J.neck, w = J.waist, ch = J.chest, h = J.hip, tm = ctx.torsoMask;
    // the cuirass: gold plate over the torso with a sculpted chest and a sun
    const plate = ctx.mask().poly([[n[0] - 11, n[1] + 2], [n[0] + 11, n[1] + 2], [ch[0] + D.chestW - 1, ch[1] + 1], [w[0] + D.waistW - 2, w[1] - 2], [w[0] - D.waistW + 2, w[1] - 2], [ch[0] - D.chestW + 1, ch[1] + 1]]).clip(tm);
    cv.part(plate, { ramp: ramps.gold, bevel: 6, inner: 'line' });
    for (const s of [-1, 1]) cv.line(ch[0] + s * 3, ch[1] - 4, ch[0] + s * 15, ch[1] + 3, (X, Y) => cv.shade(X, Y, 1));
    cv.line(ch[0], ch[1] - 2, w[0], w[1] - 4, (X, Y) => cv.shade(X, Y, 1));
    // the sun on his chest: a disc with a blue gem and eight rays
    const sx = Math.round(ch[0]), sy = Math.round(ch[1] + 2);
    for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; cv.px(sx + Math.cos(a) * 6, sy + Math.sin(a) * 5.5, c('goldHi')); cv.px(sx + Math.cos(a) * 7, sy + Math.sin(a) * 6.5, c('goldSh')); }
    cv.part(ctx.mask().ellipse(sx, sy, 4, 3.6), { ramp: ramps.gold, bevel: 2, inner: 'line', shadow: false });
    cv.part(ctx.mask().ellipse(sx, sy, 1.9, 1.7), { ramp: ['white', 'gem', 'goldDk'].map(c), bevel: 1, shadow: false });
    // shoulder plates: layered gold pauldrons
    for (const s of ['L', 'R']) {
      const sh = J['sh' + s], sign = s === 'L' ? -1 : 1;
      cv.part(ctx.mask().ellipse(sh[0] + sign * 1.5, sh[1] - 1, D.deltoid + 2.2, D.deltoid - 0.4), { ramp: ramps.gold, bevel: 4, inner: 'line' });
      cv.part(ctx.mask().ellipse(sh[0] + sign * 2, sh[1] + 2.5, D.deltoid + 1, 2.6), { ramp: ramps.gold, bevel: 1.5, inner: 'line', shadow: false });
      cv.px(sh[0] + sign * 3 - 2, sh[1] - 4, c('goldHi'));
    }
    // belt and the pleated kilt of straps over the white trunks
    const by = Math.round(w[1] - 1);
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, by - 2, D.waistW * 2 + 2, 5).clip(ctx.mask().add(ctx.shortsMask).add(tm)), { ramp: ramps.strap, bevel: 1, inner: 'line', shadow: false });
    cv.part(ctx.mask().ellipse(w[0], by, 5, 3.6), { ramp: ramps.gold, bevel: 2, inner: 'line' });
    const sm = ctx.shortsMask, hy = Math.round(h[1]);
    for (let i = -D.waistW; i <= D.waistW; i += 5) {
      const tab = ctx.mask().rect(w[0] + i - 1.5, by + 2, 3, (i & 1 ? 12 : 14)).clip(sm);
      cv.part(tab, { ramp: ramps.strap, bevel: 1, inner: 'line', shadow: false });
      cv.px(w[0] + i, by + 3, c('goldHi'));
    }
    void hy;
  },

  // the shield: a big round gilded one on his left arm, in front of everything
  front(ctx) {
    const { cv, J, ramps, c, pose } = ctx;
    if (pose.lying || pose.noShield) return;
    const S = pose.shield || { dx: 6, dy: 5, s: 1 };
    const fi = J.fiL, cx = fi[0] + S.dx, cy = fi[1] + S.dy, rx = 16.5 * S.s, ry = 18.5 * S.s;
    // rim, face, rings, sun rays and a gem boss
    cv.part(ctx.mask().ellipse(cx, cy, rx, ry), { ramp: ramps.gold, bevel: 6, inner: 'line' });
    cv.part(ctx.mask().ellipse(cx, cy, rx - 3, ry - 3), { ramp: ['white', 'goldHi', 'gold', 'goldSh'].map(c), bevel: 7, inner: 'line', shadow: false });
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      for (let d = 5; d < 11; d++) cv.px(cx + Math.cos(a) * d * S.s * (rx / ry), cy + Math.sin(a) * d * S.s, c(k & 1 ? 'goldSh' : 'gold'));
    }
    cv.part(ctx.mask().ellipse(cx, cy, 4.6 * S.s, 4.6 * S.s), { ramp: ramps.gold, bevel: 3, inner: 'line' });
    cv.part(ctx.mask().ellipse(cx, cy, 2.4 * S.s, 2.4 * S.s), { ramp: ['white', 'gem', 'goldDk'].map(c), bevel: 2, shadow: false });
    cv.px(cx - 1, cy - 1, c('white'));
    for (let i = -3; i <= 3; i += 3) cv.px(cx - rx + 2, cy + i * 2, c('goldHi'));
  },
};
