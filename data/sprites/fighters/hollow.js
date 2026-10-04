// Hollow: sprite layers on the lean build.
// A ghost of a boxer: grey-blue skin gone translucent-pale, long lank black
// hair hanging down over both sides of his face, eyes that are just black
// sockets with a white pinpoint in each, a slack dark mouth. Tattered grey
// trunks with a frayed hem, grave-dirt bandages wound round his hands instead
// of gloves, bare feet.
// Poses: the WAIL (arms flung wide, head back: his taunt), crouched with a fist
// down at the canvas (FROM BENEATH).

import { makePalette } from '../../../src/engine/palette.js';
import { ears, skull, nose } from './_face.js';

const A = makePalette('hollow.A', {
  outline: [1, 1, 4],
  skinHi: [24, 27, 29], skin: [17, 20, 24], skinSh: [11, 13, 18], skinDk: [6, 7, 11],
  white: [30, 31, 31], mouth: [2, 2, 5], socket: [1, 1, 3],
  hairHi: [9, 9, 14], hair: [3, 3, 7],
  wrapHi: [26, 27, 26], wrap: [19, 20, 19], wrapDk: [11, 12, 12],
});
const B = makePalette('hollow.B', {
  ragHi: [13, 14, 18], rag: [8, 9, 12], ragDk: [4, 5, 7],
  dirt: [9, 8, 7],
});
export const palettes = { hollow: { A, B } };

const poses = {
  // the WAIL: arms flung wide, head thrown back
  wail1: {
    extends: 'idle1', shift: [0, -1],
    head: { at: [0, -102], face: 'wail', look: [0, -2] },
    elL: [-38, -86], fiL: [-50, -98], elR: [38, -86], fiR: [50, -98],
    gloveL: { angle: -40, view: 'back' }, gloveR: { angle: 40, view: 'back' },
  },
  wail2: { extends: 'wail1', shift: [0, -2], fiL: [-52, -102], fiR: [52, -102], head: { at: [0, -104], face: 'wail', look: [0, -2] } },
  // FROM BENEATH: crouched, the right fist down at the canvas
  beneathTell: {
    extends: 'upperTell', shift: [0, 8],
    head: { at: [2, -86], face: 'focus', look: [0, 2] },
    elR: [30, -44], fiR: [26, -24], gloveR: { angle: 180 },
    knL: [-18, -16], knR: [18, -16], ftL: [-20, 0], ftR: [20, 0],
  },
};

export default {
  id: 'hollow',
  build: 'lean',
  // his own body on the build: stretched: too long in the body and neck
  body: { size: [0.9, 1.04], legLen: 1.05, torsoLen: 1.06, neckLen: 2, shoulders: 0.9 },
  palettes: { default: 'hollow' },
  torsoMaterial: 'skin',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['wrapHi', 'wrap', 'wrapDk'],
    cuff: ['wrap', 'wrapDk', 'dirt'],
    shorts: ['ragHi', 'rag', 'ragDk'],
    sock: ['skinHi', 'skin', 'skinSh'],
    boot: ['skin', 'skinSh', 'skinDk'],
    sole: ['skinDk', 'outline', 'outline'],
    hair: ['hairHi', 'hair', 'outline'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    ears(ctx, H, ramps.skin, [1.4, 2.4]);
    const hm = skull(ctx, H, ramps.skin, 'narrow');
    // sunken cheeks
    for (const s of [-1, 1]) for (let j = 3; j < 8; j++) cv.shade(fx + s * 6, fy + j, 1);
    // eye sockets: black hollows with a white pinpoint (none when he's out)
    const big = face === 'wail' || face === 'wide' || face === 'strain';
    for (const s of [-1, 1]) {
      const ex = fx + s * 4 - (s > 0 ? 1 : 0);
      const so = ctx.mask().ellipse(ex + 0.5, fy + 0.5, big ? 3 : 2.7, big ? 2.8 : 2.3);
      cv.flat(so, c('socket'));
      if (face !== 'ko' && face !== 'dazed') cv.px(ex + (s > 0 ? 0 : 1), fy, c('white'));
    }
    nose(ctx, fx, fy, ramps.skin, [1.2, 1.4], 3.6);
    // the slack mouth; the wail is a long black O
    if (face === 'wail' || face === 'hurt' || face === 'strain') cv.flat(ctx.mask().ellipse(fx, fy + 9, 2, face === 'wail' ? 3.4 : 2), c('mouth'), true);
    else for (let i = -2; i <= 2; i++) cv.px(fx + i, fy + 8 + (Math.abs(i) === 2 ? 1 : 0), c('mouth'));
    // long lank hair: over the crown and hanging down both sides of the face
    const hr = ctx.mask().ellipse(x + lx * 0.3, y - 6, H.rx + 1, 6.5);
    for (const s of [-1, 1]) hr.poly([[x + s * 5 + lx * 0.5, y - 7], [x + s * (H.rx + 2), y - 5], [x + s * (H.rx + 1.5), y + 14], [x + s * 7.5 + lx * 0.5, y + 12], [x + s * 7 + lx * 0.5, y - 2]]);
    // a parting down the middle, the face showing between the curtains of hair
    hr.cut(ctx.mask().poly([[x - 2 + lx, y - 12], [x + 2 + lx, y - 12], [x + 7 + lx, y - 2], [x + 7 + lx, y + 20], [x - 7 + lx, y + 20], [x - 7 + lx, y - 2]]));
    cv.part(hr, { ramp: ramps.hair, bevel: 2, inner: 'line' });
    for (const dx of [-8, -6, 5, 7]) for (let k = 0; k < 10; k++) if (hr.in(x + dx, y - 2 + k)) cv.px(x + dx, y - 2 + k, c((k & 3) ? 'hair' : 'hairHi'));
  },

  torso(ctx) {
    const { cv, J, c, D, pose } = ctx;
    const ch = J.chest, h = J.hip;
    const tm = ctx.torsoMask;
    // ribs and a hollow sternum
    for (const k of [0, 4, 8]) for (const s of [-1, 1]) cv.line(ch[0] + s * 3, ch[1] - 2 + k, ch[0] + s * (D.chestW - 3), ch[1] - 4 + k, (X, Y) => { if (tm.in(X, Y)) cv.shade(X, Y, 1); });
    // frayed hem on the rags
    if (!pose.lying) for (let X = Math.round(h[0] - 20); X < h[0] + 20; X += 2) {
      for (let Y = Math.round(h[1] + 16); Y > h[1] - 2; Y--) if (ctx.shortsMask.in(X, Y)) { cv.px(X, Y + 1, c('ragDk')); cv.px(X, Y + 2, c('outline')); break; }
    }
    for (let Y = Math.round(h[1] - 4); Y < h[1] + 10; Y++) for (let X = Math.round(h[0] - 16); X < h[0] + 16; X++) if (ctx.shortsMask.in(X, Y) && (X * 5 + Y * 11) % 13 === 0) cv.px(X, Y, c('dirt'));
  },

  // bandage turns across the wrapped fists
  front(ctx) {
    const { cv, J, c } = ctx;
    const g = cv.rampId(ctx.ramps.glove);
    for (const s of ['L', 'R']) {
      const f = J['fi' + s];
      for (let dx = -7; dx <= 7; dx++) for (const k of [-4, 0, 4]) {
        const X = Math.round(f[0] + dx), Y = Math.round(f[1] + k + dx * 0.4);
        const i = Y * cv.w + X;
        if (X >= 0 && Y >= 0 && X < cv.w && Y < cv.h && cv.ramp[i] === g) cv.px(X, Y, c('wrapDk'));
      }
    }
  },
};
