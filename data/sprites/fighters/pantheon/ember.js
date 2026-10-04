// Brother Ember (#53): sprite layers on the medium build.
// The Pantheon's lamp keeper: a round, kind face with a rust-coloured beard and a
// shaved crown under a burlap hood pushed back, a rough brown tunic open at the chest
// with a leather apron over the trunks, work gloves, sandals wrapped in cord, and a
// brass lantern hanging on a chain at his right hip. The lantern is the tell:
// `ember.dim` is the same lantern burnt down to a red coal (opponentAI's cueLamp).

import { makePalette, swapPalette } from '../../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from '../_face.js';

const A = makePalette('ember.A', {
  outline: [3, 2, 3],
  skinHi: [30, 22, 16], skin: [26, 16, 10], skinSh: [18, 10, 6], skinDk: [10, 5, 3],
  white: [31, 29, 25], mouth: [12, 3, 4],
  hairHi: [29, 14, 6], hair: [23, 8, 3], hairDk: [12, 4, 2],
  gloveHi: [22, 16, 10], glove: [14, 9, 5], gloveDk: [8, 5, 3],
});
const B = makePalette('ember.B', {
  robeHi: [22, 16, 9], robe: [15, 10, 5], robeSh: [9, 6, 3],
  aproHi: [17, 12, 8], apro: [10, 7, 4],
  cord: [26, 22, 14],
  brassHi: [30, 27, 14], brass: [24, 17, 4], brassDk: [13, 8, 2],
  lampHi: [31, 31, 20], lamp: [31, 24, 6], lampDk: [26, 10, 2],
  ashHi: [18, 16, 15], ash: [10, 9, 9],
});
// burnt down to a coal: the wind-up
const dimB = swapPalette('ember.dimB', B, {
  lampHi: [12, 5, 3], lamp: [8, 3, 2], lampDk: [4, 2, 1],
  brassHi: [22, 20, 12], brass: [16, 12, 4],
});
export const palettes = { ember: { A, B }, 'ember.dim': { A, B: dimB } };

const poses = {
  // holds the lantern up high: the taunt
  raise: {
    extends: 'idle1', shift: [1, 0],
    head: { at: [2, -100], face: 'grin', look: [1, -1] },
    shR: [21, -81], elR: [31, -86], fiR: [30, -108], gloveR: { angle: 10 },
    shL: [-19, -81], elL: [-25, -59], fiL: [-11, -72],
    lantern: 'high',
  },
};

export default {
  id: 'ember',
  build: 'medium',
  // his own body: broad and soft, a lamp keeper's belly and short thick arms
  body: { size: [1.02, 0.98], legLen: 0.96, torsoLen: 1.02, shoulders: 1.02, dims: { belly: 8, waistW: 17.5, upperArm: [6.2, 5.2] } },
  palettes: { default: 'ember' },
  torsoMaterial: 'skin',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['cord', 'cord', 'gloveHi'],
    robe: ['robeHi', 'robe', 'robeSh', 'outline'],
    shorts: ['aproHi', 'apro', 'outline'],
    sock: ['cord', 'aproHi', 'apro'],
    boot: ['robeHi', 'robe', 'robeSh'],
    sole: ['robeSh', 'apro', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    brass: ['brassHi', 'brass', 'brassDk'],
    lamp: ['lampHi', 'lamp', 'lampDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';
    // the hood pushed back: a burlap roll behind the shoulders and neck (drawn first)
    cv.part(ctx.mask().ellipse(x + lx * 0.3, y + 6, H.rx + 3, 9).cut(ctx.mask().ellipse(x + lx * 0.3, y - 3, H.rx + 6, 10)), { ramp: ramps.robe, bevel: 3, inner: 'line' });
    ears(ctx, H, ramps.skin, [2.4, 3.4]);
    const hm = skull(ctx, H, ramps.skin, 'round');
    // a shaved crown with a rim of rust hair, a thin cord round the brow
    cv.part(ctx.mask().rect(x - H.rx + lx * 0.3, y - 5.5, H.rx * 2, 2), { ramp: ['cord', 'cord', 'gloveHi'].map(c), bevel: 1, inner: 'line', shadow: false });
    for (const s of [-1, 1]) cv.part(ctx.mask().ellipse(x + s * (H.rx - 1) + lx * 0.3, y - 1, 2.4, 3.6), { ramp: ramps.hair, bevel: 2, inner: 'line', shadow: false });
    eyes(ctx, fx, fy, face === 'neutral' ? 'focus' : face, 0);
    brows(ctx, fx, fy, face, ramps.hair, { len: 4.5, thick: 1.2, y: -3.4 });
    nose(ctx, fx, fy, ramps.skin, [2.4, 2.3], 3.6);
    for (const s of [-1, 1]) { cv.px(fx + s * 6, fy + 3, c('skinHi')); cv.px(fx + s * 5, fy + 3, c('skinHi')); }
    // a full rust-coloured beard, the mouth in it
    const bd = ctx.mask().ellipse(fx, fy + 9, H.rx - 0.6, 6.4).cut(ctx.mask().ellipse(fx, fy + 3, H.rx + 3, 4.6));
    bd.ellipse(fx - 6.5, fy + 5.5, 2.2, 4).ellipse(fx + 6.5, fy + 5.5, 2.2, 4);
    cv.part(bd, { ramp: ramps.hair, bevel: 2, inner: 'line' });
    for (let i = -6; i <= 6; i += 2) cv.shade(fx + i, fy + 10 + (i & 2 ? 1 : 0), 1);
    const m = mouth(ctx, fx, fy + 8, face === 'neutral' ? 'smile' : face, { w: 3 });
    if (m == null) for (let i = -2; i <= 1; i++) cv.px(fx + i, fy + 8, c('outline'));
    ctx.headMask = hm;
  },

  torso(ctx) {
    const { cv, J, c, ramps, D, pose } = ctx;
    if (pose.lying) return;
    const n = J.neck, w = J.waist, ch = J.chest, tm = ctx.torsoMask;
    // the tunic: sleeveless burlap over the shoulders, open in a deep V at the chest
    const tun = ctx.mask().poly([[n[0] - 12, n[1] + 1], [n[0] + 12, n[1] + 1], [ch[0] + D.chestW - 1, ch[1] + 1], [w[0] + D.waistW, w[1] - 1], [w[0] - D.waistW, w[1] - 1], [ch[0] - D.chestW + 1, ch[1] + 1]]).clip(tm);
    tun.cut(ctx.mask().poly([[n[0] - 5, n[1] + 1], [n[0] + 5, n[1] + 1], [n[0], n[1] + 18]]));
    cv.part(tun, { ramp: ramps.robe, bevel: 5, inner: 'line' });
    for (let i = -10; i <= 10; i += 4) cv.line(ch[0] + i, ch[1] - 4, ch[0] + i * 1.1, w[1] - 3, (X, Y) => cv.shade(X, Y, 1));
    // the leather apron: a bib and a skirt over the trunks, tied with a cord
    const by = Math.round(w[1] + 1);
    const apron = ctx.mask().rect(w[0] - 11, by - 1, 22, 20).clip(ctx.mask().add(ctx.shortsMask).add(tm));
    cv.part(apron, { ramp: ramps.shorts, bevel: 2, inner: 'line', shadow: false });
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, by - 1, D.waistW * 2 + 2, 3).clip(ctx.mask().add(tm).add(ctx.shortsMask)), { ramp: ['cord', 'cord', 'gloveHi'].map(c), bevel: 1, inner: 'line', shadow: false });
    for (let i = -8; i <= 8; i += 4) { cv.px(w[0] + i, by + 6, c('robeSh')); cv.px(w[0] + i, by + 12, c('robeSh')); }
    // a scorch mark on the apron and a patch on the chest
    cv.px(w[0] - 4, by + 9, c('ash')); cv.px(w[0] - 3, by + 10, c('ash')); cv.px(w[0] + 5, by + 14, c('ash'));
  },

  // the lantern: brass, on a chain from his belt at the right hip (held high in `raise`)
  front(ctx) {
    const { cv, J, c, ramps, pose } = ctx;
    if (pose.lying) return;
    let lx, ly;
    if (pose.lantern === 'high') { lx = J.fiR[0] + 1; ly = J.fiR[1] - 5; }
    else { lx = J.waist[0] + 19; ly = J.waist[1] + 12; for (let k = 0; k < 7; k += 2) cv.px(J.waist[0] + 12 + k, J.waist[1] + 2 + k * 0.9, c('brassDk')); }
    // the cage: a cap, a glass body with a flame, a base
    cv.part(ctx.mask().rect(lx - 4, ly - 6, 9, 2), { ramp: ramps.brass, bevel: 1, inner: 'line', shadow: false });
    cv.part(ctx.mask().poly([[lx - 3, ly - 8], [lx + 3, ly - 8], [lx + 4, ly - 6], [lx - 4, ly - 6]]), { ramp: ramps.brass, bevel: 1, inner: 'line', shadow: false });
    cv.part(ctx.mask().rect(lx - 4, ly - 4, 9, 9), { ramp: ramps.lamp, bevel: 4, inner: 'line' });
    cv.px(lx, ly - 2, c('lampHi')); cv.px(lx, ly, c('lampHi')); cv.px(lx, ly + 1, c('lampHi'));
    for (const x of [lx - 4, lx + 4]) for (let y = ly - 4; y < ly + 5; y++) cv.px(x, y, c('brassDk'));
    cv.px(lx, ly - 4, c('brassDk')); cv.px(lx, ly + 5, c('brassDk'));
    cv.part(ctx.mask().rect(lx - 4, ly + 5, 9, 2), { ramp: ramps.brass, bevel: 1, inner: 'line', shadow: false });
  },
};
