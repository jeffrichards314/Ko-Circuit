// Gentleman Jules (#60): sprite layers on the lean build, in the grey of a silent film
// (a cold blue-grey from black to white, nothing else).
// A 1920s showman: slicked hair under a black top hat with a pale band, a pencil
// moustache and a wide grin, a white bib shirt with a black bow tie and a waistcoat,
// sleeve garters, pinstriped black trunks held up by braces, spats over his boots,
// white gloves, and a cane with a silver crook in his right hand.
// Poses: bow (bent at the waist: an opening), twirl1/2 (the cane spinning: the feint)
// and the cane rides along in every other pose.

import { makePalette } from '../../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from '../_face.js';

const A = makePalette('jules.A', {
  outline: [1, 1, 3],
  skinHi: [28, 29, 31], skin: [23, 24, 28], skinSh: [15, 16, 21], skinDk: [8, 8, 12],
  white: [31, 31, 31], mouth: [7, 7, 11],
  hairHi: [14, 14, 18], hair: [5, 5, 8], hairDk: [1, 1, 3],
  gloveHi: [31, 31, 31], glove: [26, 27, 30], gloveDk: [15, 16, 22],
});
const B = makePalette('jules.B', {
  blkHi: [11, 11, 15], blk: [4, 4, 7], blkDk: [1, 1, 3],
  shirtHi: [31, 31, 31], shirt: [26, 27, 30], shirtSh: [16, 17, 22],
  stripe: [19, 20, 25],
  silverHi: [31, 31, 31], silver: [22, 23, 28], silverDk: [11, 12, 18],
  band: [18, 19, 24],
});
export const palettes = { jules: { A, B } };

const FEET = { knL: [-13, -22], knR: [13, -22], ftL: [-16, 0], ftR: [16, 0] };
const poses = {
  // a deep bow: bent at the waist, one glove across the chest, the hat swept out
  bow: {
    extends: 'winded1', shift: [0, -3],
    head: { at: [2, -82], face: 'grin', tilt: 'down', look: [0, 2] },
    shR: [19, -72], elR: [10, -62], fiR: [-4, -66], gloveR: { angle: -100 },
    shL: [-19, -72], elL: [-32, -56], fiL: [-42, -60], gloveL: { angle: -70 },
    cane: 'down',
  },
  // the cane spinning in his glove: he's not attacking, he's showing off
  twirl1: {
    extends: 'idle1', shift: [1, 0], ...FEET,
    head: { at: [2, -101], face: 'grin', look: [1, 0] },
    shR: [21, -81], elR: [32, -76], fiR: [34, -94], gloveR: { angle: 10 },
    cane: 'spinA',
  },
  twirl2: { extends: 'twirl1', shift: [0, 1], ...FEET, fiR: [35, -91], cane: 'spinB' },
};

export default {
  id: 'jules',
  build: 'lean',
  // his own body: a slim dancer's, narrow shoulders and a long back
  body: { size: [0.97, 1.03], legLen: 1.04, torsoLen: 1.0, shoulders: 0.96, neckLen: 1, dims: { waistW: 11, upperArm: [4.4, 3.6], thigh: [5.8, 4.5] } },
  palettes: { default: 'jules' },
  torsoMaterial: 'skin',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['shirtHi', 'shirt', 'shirtSh'],
    shorts: ['blkHi', 'blk', 'blkDk'],
    sock: ['shirtHi', 'shirt', 'shirtSh'],
    boot: ['blkHi', 'blk', 'blkDk'],
    sole: ['blk', 'blkDk', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    blk: ['blkHi', 'blk', 'blkDk'],
    shirt: ['shirtHi', 'shirt', 'shirtSh'],
    silver: ['silverHi', 'silver', 'silverDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';
    ears(ctx, H, ramps.skin, [1.9, 2.8]);
    const hm = skull(ctx, H, ramps.skin, 'narrow');
    // slicked-back hair with a centre parting, under the hat
    cv.part(ctx.mask().ellipse(x + lx * 0.3, y - 4, H.rx + 0.4, 6).cut(ctx.mask().rect(x - 20, y - 0.5, 40, 20)), { ramp: ramps.hair, bevel: 2, inner: 'line' });
    // the top hat: a tall black crown with a pale band and a flat brim
    cv.part(ctx.mask().rect(x - H.rx + 2 + lx * 0.4, y - 22, H.rx * 2 - 4, 16), { ramp: ramps.blk, bevel: 3, inner: 'line' });
    cv.part(ctx.mask().rect(x - H.rx + 2 + lx * 0.4, y - 10, H.rx * 2 - 4, 3), { ramp: ['band', 'band', 'blkDk'].map(c), bevel: 1, inner: 'line', shadow: false });
    cv.part(ctx.mask().ellipse(x + lx * 0.4, y - 6.5, H.rx + 3.4, 2.4), { ramp: ramps.blk, bevel: 1, inner: 'line' });
    cv.px(x - 4 + lx * 0.4, y - 19, c('blkHi')); cv.px(x - 4 + lx * 0.4, y - 17, c('blkHi'));
    // a wide grin, arched brows, a pencil moustache
    eyes(ctx, fx, fy, face === 'neutral' ? 'wide' : face, -1);
    brows(ctx, fx, fy, face, ramps.hair, { len: 3.8, thick: 0.8, y: -4.4 });
    nose(ctx, fx, fy, ramps.skin, [1.6, 1.8], 3.4);
    for (let i = -6; i <= 6; i++) cv.px(fx + i, fy + 6 - (Math.abs(i) > 4 ? 1 : 0), c('hair'));
    mouth(ctx, fx, fy + 8.5, face === 'neutral' ? 'smile' : face, { w: 3.6 });
    ctx.headMask = hm;
  },

  torso(ctx) {
    const { cv, J, c, ramps, D, pose } = ctx;
    if (pose.lying) return;
    const n = J.neck, w = J.waist, ch = J.chest, tm = ctx.torsoMask;
    // a white bib shirt and a dark waistcoat over it, buttoned down the front
    const shirt = ctx.mask().poly([[n[0] - 9, n[1] + 1], [n[0] + 9, n[1] + 1], [ch[0] + D.chestW - 2, ch[1] + 6], [ch[0] - D.chestW + 2, ch[1] + 6]]).clip(tm);
    cv.part(shirt, { ramp: ramps.shirt, bevel: 4, inner: 'line' });
    const vest = ctx.mask().poly([[n[0] - 10, n[1] + 4], [n[0] - 3, n[1] + 4], [n[0], ch[1] + 8], [w[0], w[1] + 3], [w[0] - D.waistW + 1, w[1] + 3], [ch[0] - D.chestW + 1, ch[1] + 4]])
      .add(ctx.mask().poly([[n[0] + 10, n[1] + 4], [n[0] + 3, n[1] + 4], [n[0], ch[1] + 8], [w[0], w[1] + 3], [w[0] + D.waistW - 1, w[1] + 3], [ch[0] + D.chestW - 1, ch[1] + 4]]));
    cv.part(vest.clip(ctx.mask().add(tm).add(ctx.shortsMask)), { ramp: ramps.blk, bevel: 3, inner: 'line' });
    for (let k = 0; k < 4; k++) cv.px(n[0], ch[1] + 3 + k * 4, c('silverHi'));
    // the bow tie
    cv.part(ctx.mask().poly([[n[0] - 6, n[1] + 3], [n[0], n[1] + 5], [n[0] - 6, n[1] + 8]]).poly([[n[0] + 6, n[1] + 3], [n[0], n[1] + 5], [n[0] + 6, n[1] + 8]]), { ramp: ramps.blk, bevel: 1, inner: 'line', shadow: false });
    // braces and pinstripes on the trunks, a garter on each arm
    const sm = ctx.shortsMask;
    for (const s of [-1, 1]) cv.line(J['sh' + (s < 0 ? 'L' : 'R')][0] - s * 2, ch[1] + 3, w[0] + s * 8, w[1] + 2, (X, Y) => cv.px(X, Y, c('blkHi')));
    for (let X = Math.round(w[0] - D.waistW - 2); X < w[0] + D.waistW + 2; X += 3) for (let Y = Math.round(w[1] + 3); Y < J.hip[1] + 14; Y++) if (sm.in(X, Y)) cv.px(X, Y, c('stripe'));
    for (const s of ['L', 'R']) { const sh = J['sh' + s], el = J['el' + s], p = [sh[0] + (el[0] - sh[0]) * 0.5, sh[1] + (el[1] - sh[1]) * 0.5]; cv.px(p[0], p[1], c('silver')); cv.px(p[0] + 1, p[1], c('silver')); }
  },

  // the cane: a black shaft with a silver crook, in the right glove (spinning in the twirl)
  front(ctx) {
    const { cv, J, c, ramps, pose } = ctx;
    if (pose.lying) return;
    const g = J.fiR;
    const line = (x0, y0, x1, y1) => { cv.line(x0, y0, x1, y1, (X, Y) => { cv.px(X, Y, c('blk')); cv.px(X + 1, Y, c('blkHi')); }); };
    if (pose.cane === 'spinA') { line(g[0] - 14, g[1] - 10, g[0] + 14, g[1] + 10); cv.part(ctx.mask().ellipse(g[0] + 15, g[1] + 11, 2.4, 2.4), { ramp: ramps.silver, bevel: 1, shadow: false }); }
    else if (pose.cane === 'spinB') { line(g[0] - 12, g[1] + 12, g[0] + 12, g[1] - 12); cv.part(ctx.mask().ellipse(g[0] - 13, g[1] + 13, 2.4, 2.4), { ramp: ramps.silver, bevel: 1, shadow: false }); }
    else if (pose.cane === 'down') { line(g[0] - 2, g[1] - 2, g[0] - 2, g[1] + 22); }
    else {
      // held low at his side, the crook up: a black shaft down the viewer-right
      const x = g[0] + 5, y = g[1];
      line(x, y - 14, x + 2, y + 16);
      cv.part(ctx.mask().ellipse(x - 1, y - 16, 2.6, 2.2), { ramp: ramps.silver, bevel: 1, shadow: false });
    }
  },
};
