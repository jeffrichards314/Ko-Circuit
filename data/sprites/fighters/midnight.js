// Count Midnight: sprite layers on the lean build.
// Night-owl nobleman: pale lavender skin, black hair slicked into a sharp
// widow's peak, pointed ears, arched brows, crimson irises and a pair of
// fangs when he grins, a towering stiff collar (black outside, violet inside)
// rising behind his head, an open black waistcoat with a silver crescent
// brooch, black trunks with a silver moon, black boots, deep violet gloves.
// His eyes are what you'll be watching in the dark (lightsOut modifier).

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, mouth, skull, nose } from './_face.js';

const A = makePalette('midnight.A', {
  outline: [2, 1, 4],
  skinHi: [28, 27, 31], skin: [23, 21, 27], skinSh: [17, 15, 22], skinDk: [9, 7, 14],
  white: [31, 31, 31], mouth: [14, 2, 6], iris: [29, 3, 6],
  hairHi: [9, 7, 15], hair: [3, 2, 6],
  gloveHi: [19, 8, 26], glove: [11, 3, 18], gloveDk: [5, 1, 10],
});
const B = makePalette('midnight.B', {
  blackHi: [9, 8, 13], black: [4, 4, 7], blackDk: [1, 1, 3],
  violetHi: [22, 9, 27], violet: [14, 4, 20], violetDk: [7, 2, 11],
  silverHi: [31, 31, 31], silver: [22, 23, 27], silverDk: [12, 13, 18],
  blood: [22, 2, 6],
});
export const palettes = { midnight: { A, B } };

const poses = {
  // the snap: right glove raised beside his face
  snapTell: {
    extends: 'idle1', shift: [1, 0],
    head: { at: [1, -100], face: 'grin', look: [1, 0] },
    elR: [30, -88], fiR: [24, -108], gloveR: { angle: 10 },
    elL: [-28, -62], fiL: [-14, -70],
  },
  // taunt: arms folded high across the chest, cloak-style
  fold: {
    extends: 'idle1',
    head: { at: [0, -101], face: 'grin', tilt: 'up', look: [0, -1] },
    elL: [-24, -72], elR: [24, -72], fiL: [12, -80], fiR: [-12, -78],
    gloveL: { angle: 90 }, gloveR: { angle: -90 }, frontOrder: ['L', 'R'],
  },
  laugh: {
    extends: 'idle1',
    head: { at: [0, -102], face: 'grin', tilt: 'up', look: [0, -2] },
    elL: [-36, -80], elR: [36, -80], fiL: [-44, -94], fiR: [44, -94],
    gloveL: { angle: -40 }, gloveR: { angle: 40 },
  },
};

export default {
  id: 'midnight',
  build: 'lean',
  // his own body on the build: tall and thin and elegant, with a long neck
  body: { size: [0.95, 1], legLen: 1.06, torsoLen: 1.02, shoulders: 0.95, neckLen: 1.5 },
  palettes: { default: 'midnight' },
  torsoMaterial: 'skin',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['silverHi', 'silver', 'silverDk'],
    shorts: ['blackHi', 'black', 'blackDk'],
    sock: ['blackHi', 'black', 'blackDk'],
    boot: ['blackHi', 'black', 'blackDk'],
    sole: ['silver', 'silverDk', 'outline'],
    hair: ['hairHi', 'hair', 'outline'],
    coat: ['blackHi', 'black', 'blackDk', 'outline'],
    violet: ['violetHi', 'violet', 'violetDk'],
    silver: ['silverHi', 'silver', 'silverDk'],
  },

  back(ctx) {
    // the towering collar behind the head
    const { cv, J, ramps, pose } = ctx;
    if (pose.lying) return;
    const n = J.neck, sL = J.shL, sR = J.shR;
    const out = ctx.mask().poly([[sL[0] + 2, sL[1] + 2], [n[0] - 32, n[1] - 26], [n[0] - 14, n[1] - 17], [n[0], n[1] - 22], [n[0] + 14, n[1] - 17], [n[0] + 32, n[1] - 26], [sR[0] - 2, sR[1] + 2]]);
    cv.part(out, { ramp: ramps.coat, bevel: 3 });
    const inn = ctx.mask().poly([[sL[0] + 5, sL[1]], [n[0] - 28, n[1] - 23], [n[0] - 13, n[1] - 14], [n[0], n[1] - 18], [n[0] + 13, n[1] - 14], [n[0] + 28, n[1] - 23], [sR[0] - 5, sR[1]]]);
    cv.part(inn, { ramp: ramps.violet, bevel: 4, inner: 'soft', shadow: false });
    for (const s of [-1, 1]) for (const k of [8, 18]) cv.line(n[0] + s * 4, n[1] - 2, n[0] + s * (k + 6), n[1] - 18 - k / 4, (X, Y) => { if (inn.in(X, Y)) cv.shade(X, Y, 1); });
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    // pointed ears
    const er = ctx.mask();
    for (const s of [-1, 1]) er.poly([[x + s * (H.rx - 1), y - 1], [x + s * (H.rx + 5), y - 7], [x + s * (H.rx + 1), y + 4]]);
    cv.part(er, { ramp: ramps.skin, bevel: 2 });
    skull(ctx, H, ramps.skin, 'narrow');
    // hollow cheekbones
    for (const s of [-1, 1]) for (let j = 3; j <= 6; j++) cv.shade(fx + s * 6 - (s > 0 ? 1 : 0), fy + j, 1);
    // slicked hair with a sharp widow's peak
    const hr = ctx.mask().ellipse(x + lx * 0.3, y - 7, H.rx + 0.6, 7).cut(ctx.mask().rect(x - 14, y - 5, 28, 12));
    hr.poly([[x - 5 + lx, y - 6], [x + 5 + lx, y - 6], [x + lx, y - 1]]);
    hr.rect(x - Math.round(H.rx), y - 6, 2, 6).rect(x + Math.round(H.rx) - 2, y - 6, 2, 6);
    cv.part(hr.clip(ctx.mask().ellipse(x, y - 1, H.rx + 1, H.ry + 1)), { ramp: ramps.hair, bevel: 3, inner: 'line' });
    for (const dx of [-6, -3, 3, 6]) cv.line(x + dx, y - 12, x + dx * 1.2, y - 6, (X, Y) => { if (hr.in(X, Y)) cv.shade(X, Y, -1); });
    eyes(ctx, fx, fy, face, -1);
    if (['neutral', 'focus', 'grin', 'strain', 'wide'].includes(face)) for (const s of [-1, 1]) {
      // crimson irises
      const ex = fx + s * 5 - (s > 0 ? 2 : 1);
      if (face !== 'grin') { cv.px(ex, fy - 1, c('iris')); cv.px(ex + 1, fy - 1, c('iris')); }
    }
    // high arched brows
    const [bi, bo] = face === 'focus' || face === 'strain' ? [1, -2] : face === 'hurt' || face === 'ko' ? [-1, 1] : [0, -1];
    cv.part(ctx.mask().capsule(fx - 2, fy - 4 + bi, fx - 5, fy - 6 + bo, 0.9, 0.9).capsule(fx - 5, fy - 6 + bo, fx - 9, fy - 4, 0.9, 0.8)
      .capsule(fx + 1, fy - 4 + bi, fx + 4, fy - 6 + bo, 0.9, 0.9).capsule(fx + 4, fy - 6 + bo, fx + 8, fy - 4, 0.9, 0.8), { ramp: ramps.hair, bevel: 1, inner: 'soft' });
    nose(ctx, fx, fy, ramps.skin, [1.6, 2.2], 3.4);
    const kind = mouth(ctx, fx, fy + 8, face, { w: 3.2 });
    // fangs
    if (kind === 'smile' || kind === 'teeth' || kind === 'open') { cv.px(fx - 2, fy + 9, c('white')); cv.px(fx + 1, fy + 9, c('white')); cv.px(fx - 2, fy + 10, c('white')); cv.px(fx + 1, fy + 10, c('white')); }
  },

  torso(ctx) {
    const { cv, J, c, ramps, D, pose } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, h = J.hip;
    const tm = ctx.torsoMask;
    // open black waistcoat
    for (const s of [-1, 1]) {
      const pnl = ctx.mask().poly([
        [n[0] + s * 6, n[1] + 1], [ch[0] + s * (D.chestW + 3), ch[1] - 10], [w[0] + s * (D.waistW + 3), w[1] + 1],
        [w[0] + s * 5, w[1] + 1], [ch[0] + s * 5, ch[1] - 2],
      ]).clip(tm);
      cv.part(pnl, { ramp: ramps.coat, bevel: 3, inner: 'line' });
      cv.line(n[0] + s * 6, n[1] + 2, ch[0] + s * 5, ch[1] - 2, (X, Y) => { if (pnl.in(X, Y)) cv.px(X, Y, c('violet')); });
    }
    // lean abs
    for (const dy of [4, 9]) { cv.shade(w[0] - 2, ch[1] + dy, 1); cv.shade(w[0] + 2, ch[1] + dy, 1); }
    // crescent brooch at the throat
    if (!pose.lying) {
      const bx = Math.round(n[0]), by = Math.round(n[1] + 5);
      cv.part(ctx.mask().ellipse(bx, by, 3, 3).cut(ctx.mask().ellipse(bx + 1.5, by - 1, 2.4, 2.4)), { ramp: ramps.silver, bevel: 1, inner: 'line', shadow: false });
      cv.px(bx - 1, by + 3, c('blood'));
    }
    // silver moon on the trunks
    const mx = Math.round(h[0] - 9), my = Math.round(h[1] + 4);
    if (ctx.shortsMask.in(mx, my)) cv.part(ctx.mask().ellipse(mx, my, 3, 3).cut(ctx.mask().ellipse(mx + 2, my - 1, 2.5, 2.5)).clip(ctx.shortsMask), { ramp: ramps.silver, bevel: 1, shadow: false, outline: false });
  },
  // Title Defense, THE BLOOD MOON: a full-length cape, tattered at the hem, that
  // falls behind him to his calves, and a blood-moon medallion on his chest.
  remix: {
    colors: { B: { moonHi: [31, 12, 10], moon: [24, 4, 6], moonDk: [13, 1, 4] } },
    ramps: { cape: ['blackHi', 'black', 'blackDk', 'outline'], moon: ['moonHi', 'moon', 'moonDk'] },
    backUnder(ctx) {
      const { cv, J, ramps, pose } = ctx;
      if (pose.lying) return;
      const L = J.shL, R = J.shR, kl = J.knL, kr = J.knR;
      const hem = Math.max(kl[1], kr[1]) + 6;
      const pts = [[L[0] - 2, L[1] - 3], [R[0] + 2, R[1] - 3], [R[0] + 14, hem]];
      // a ragged hem: points and notches across the bottom
      const n = 8;
      for (let k = 1; k < n; k++) pts.push([R[0] + 14 - (R[0] - L[0] + 28) * (k / n), hem - (k % 2 ? 7 : 0)]);
      pts.push([L[0] - 14, hem]);
      cv.part(ctx.mask().poly(pts), { ramp: ramps.cape, bevel: 6 });
      // the lining shows at the edges
      cv.line(R[0] + 3, R[1], R[0] + 13, hem - 2, (X, Y) => cv.px(X, Y, ctx.c('violetDk')));
      cv.line(L[0] - 3, L[1], L[0] - 13, hem - 2, (X, Y) => cv.px(X, Y, ctx.c('violetDk')));
    },
    torso(ctx) {
      const { cv, J, ramps, c, pose } = ctx;
      if (pose.lying) return;
      const ch = J.chest, x = Math.round(ch[0] + 7), y = Math.round(ch[1] - 7);
      cv.part(ctx.mask().ellipse(x, y, 4.2, 4.2), { ramp: ['silverHi', 'silver', 'silverDk'].map(c), bevel: 1, inner: 'line' });
      cv.part(ctx.mask().ellipse(x, y, 2.8, 2.8), { ramp: ramps.moon, bevel: 2, inner: 'soft', shadow: false });
      cv.px(x - 1, y - 1, c('moonHi'));
    },
  },
};
