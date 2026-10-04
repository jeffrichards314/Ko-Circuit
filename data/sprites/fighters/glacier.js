// Glacier: sprite layers on the giant build.
// Seven and a half feet of silent arctic giant: a bald, frost-pale head, a
// thick white beard hung with icicles, a white wolf-pelt mantle over the
// shoulders with a bone-claw clasp, glacier-blue trunks, shaggy fur boots and
// huge ice-blue gloves. `glacier.thaw` is the pale-blue flash that marks his
// 4-frame counter windows (frozen modifier).

import { makePalette, swapPalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './_face.js';

const A = makePalette('glacier.A', {
  outline: [2, 3, 5],
  skinHi: [31, 29, 28], skin: [26, 23, 23], skinSh: [18, 16, 19], skinDk: [10, 9, 13],
  white: [31, 31, 31], mouth: [9, 4, 8],
  hairHi: [31, 31, 31], hair: [24, 27, 30], hairDk: [14, 17, 23],
  gloveHi: [22, 29, 31], glove: [11, 20, 28], gloveDk: [5, 10, 18],
  icicle: [26, 31, 31],
});
const B = makePalette('glacier.B', {
  furHi: [31, 31, 30], fur: [26, 26, 25], furSh: [18, 18, 20], furDk: [10, 10, 13],
  iceHi: [16, 25, 30], ice: [8, 16, 25], iceDk: [3, 7, 14],
  bone: [29, 27, 22], boneDk: [18, 15, 11],
  bootHi: [22, 20, 18], boot: [14, 12, 11], bootDk: [7, 6, 6],
});
// the flash: everything frosts pale blue-white
const thawA = swapPalette('glacier.thawA', A, {
  skinHi: [31, 31, 31], skin: [24, 30, 31], skinSh: [16, 25, 31], skinDk: [8, 16, 26],
  gloveHi: [31, 31, 31], glove: [22, 31, 31], gloveDk: [10, 22, 30],
  hair: [28, 31, 31], hairDk: [18, 26, 31],
});
const thawB = swapPalette('glacier.thawB', B, {
  fur: [30, 31, 31], furSh: [22, 29, 31], furDk: [12, 20, 28],
  iceHi: [28, 31, 31], ice: [18, 28, 31], iceDk: [8, 18, 28],
});
export const palettes = { glacier: { A, B }, 'glacier.thaw': { A: thawA, B: thawB } };

const poses = {
  // taunt: tips his head back and lets out a long, frosty breath
  exhale: {
    extends: 'idle1', shift: [0, -1],
    head: { at: [0, -101], face: 'wide', tilt: 'up', look: [0, -2] },
    elL: [-27, -58], elR: [27, -58], fiL: [-20, -46], fiR: [20, -46],
    gloveL: { angle: 175 }, gloveR: { angle: -175 },
  },
  // the Ice Shard: the glove drops low, ready to come straight up
  shardTell: {
    extends: 'upperTell',
    head: { at: [4, -94], face: 'strain', look: [1, 1] },
  },
};

export default {
  id: 'glacier',
  build: 'giant',
  // his own body on the build: a slab of ice: broader still, and straight up and down
  body: { shoulders: 1.05, torsoLen: 1.04, dims: { belly: 5, waistW: 26 } },
  palettes: { default: 'glacier' },
  torsoMaterial: 'skin',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['furHi', 'fur', 'furSh'],
    shorts: ['iceHi', 'ice', 'iceDk'],
    sock: ['furHi', 'fur', 'furSh', 'furDk'],
    boot: ['bootHi', 'boot', 'bootDk'],
    sole: ['bootDk', 'outline', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    fur: ['furHi', 'fur', 'furSh', 'furDk'],
    bone: ['bone', 'bone', 'boneDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';
    const open = ['strain', 'hurt', 'wide'].includes(face);

    ears(ctx, H, ramps.skin, [2.6, 3.6]);
    const hm = skull(ctx, H, ramps.skin, 'square');
    // bald: a cold shine on the dome
    cv.px(x - 4 + lx, y - 10, c('white')); cv.px(x - 3 + lx, y - 11, c('white')); cv.px(x - 5 + lx, y - 9, c('skinHi'));
    // heavy frost-white beard with icicles
    const bd = ctx.mask().ellipse(fx, fy + 9, H.rx + 2, 9.5).cut(ctx.mask().rect(fx - 20, fy - 8, 40, 12));
    bd.rect(x - Math.round(H.rx) - 1, y - 2, 4, 9).rect(x + Math.round(H.rx) - 3, y - 2, 4, 9);
    const mo = ctx.mask().ellipse(fx, fy + 9.5, 3.4, 1.8);
    if (open) bd.cut(mo);
    cv.part(bd, { ramp: ramps.hair, bevel: 4, inner: 'line' });
    for (const dx of [-8, -4, 0, 4, 8]) {
      const bottom = fy + 17 - Math.abs(dx) * 0.5;
      for (let k = 0; k < 4 - (Math.abs(dx) >> 2); k++) cv.px(fx + dx, bottom + k, c(k === 0 ? 'icicle' : 'hair'));
      cv.px(fx + dx + 1, bottom, c('outline'));
    }
    if (open) { cv.flat(mo, c('mouth'), true); cv.px(fx - 1, fy + 8, c('white')); cv.px(fx, fy + 8, c('white')); }
    eyes(ctx, fx, fy, face, 0);
    // heavy frosted brow ridge
    brows(ctx, fx, fy, face, ramps.hair, { len: 5, thick: 1.6, y: -4 });
    nose(ctx, fx, fy, ramps.skin, [3, 2.6], 3.8);
    cv.part(ctx.mask().ellipse(fx - 3.4, fy + 7, 4.4, 1.8, 1, -0.15).ellipse(fx + 3.4, fy + 7, 4.4, 1.8, 1, 0.15), { ramp: ramps.hair, bevel: 1, inner: 'line', shadow: false });
    for (let i = -8; i <= 8; i++) if (hm.in(fx + i, fy - 7)) cv.shade(fx + i, fy - 7, 1);
  },

  torso(ctx) {
    const { cv, J, c, D, ramps, pose } = ctx;
    const n = J.neck, w = J.waist, h = J.hip;
    // pecs + abs, carved like ice
    const tm = ctx.torsoMask;
    for (const s of [-1, 1]) cv.line(n[0] + s * 2, n[1] + 14, n[0] + s * (D.chestW - 6), n[1] + 16, (X, Y) => { if (tm.in(X, Y)) cv.shade(X, Y, 1); });
    cv.line(n[0], n[1] + 8, w[0], w[1] - 3, (X, Y) => { if (tm.in(X, Y)) cv.shade(X, Y, 1); });
    for (let k = 0; k < 3; k++) for (const s of [-1, 1]) cv.shade(w[0] + s * 4, w[1] - 6 - k * 5, 1);
    // wolf-pelt mantle over both shoulders, bone-claw clasp at the throat
    if (!pose.lying) {
      const mm = ctx.mask();
      for (const s of ['L', 'R']) mm.ellipse(J['sh' + s][0], J['sh' + s][1] - 1, D.deltoid + 4, D.deltoid + 2);
      mm.poly([[J.shL[0], J.shL[1] - 6], [J.shR[0], J.shR[1] - 6], [n[0] + 12, n[1] + 8], [n[0] - 12, n[1] + 8]]);
      cv.part(mm, { ramp: ramps.fur, bevel: 4, inner: 'line' });
      for (let Y = 0; Y < mm.h; Y++) for (let X = 0; X < mm.w; X++) if (mm.in(X, Y) && !mm.in(X, Y + 1) && (X % 3 === 0)) { cv.px(X, Y + 1, c('fur')); cv.px(X, Y + 2, c('outline')); }
      for (const s of [-1, 1]) cv.part(ctx.mask().poly([[n[0] + s * 2, n[1] + 6], [n[0] + s * 6, n[1] + 6], [n[0] + s * 3, n[1] + 13]]), { ramp: ramps.bone, bevel: 1, inner: 'line', shadow: false });
    }
    // frost-white waistband
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, w[1] - 3, D.waistW * 2 + 2, 3).clip(ctx.shortsMask), { ramp: ramps.fur, bevel: 1, inner: 'line', shadow: false });
    for (const s of [-1, 1]) cv.line(h[0] + s * (D.hipSpread + 12), h[1] - 2, h[0] + s * (D.hipSpread + 14), h[1] + 10, (X, Y) => { if (ctx.shortsMask.in(X, Y)) cv.px(X, Y, c('iceHi')); });
  },
};
