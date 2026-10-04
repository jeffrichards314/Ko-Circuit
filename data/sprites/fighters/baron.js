// The Baron: sprite layers on the lean build.
// An aristocratic fencer: silver hair slicked straight back, a waxed upturned
// moustache and a pointed goatee, a monocle, a white high-collared fencing
// jacket with a diagonal closure and a gold crest, a crimson sash, white
// trunks with a crimson stripe, tall black riding boots, royal-blue gloves.
// He fights en garde: lead glove out in front like a blade, rear glove raised
// high behind his head. Poses: en garde, the thrust, the cut-over, parries,
// the salute and the running fleche, and a courtly bow (taunt).

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './_face.js';

const A = makePalette('baron.A', {
  outline: [2, 2, 4],
  skinHi: [31, 26, 21], skin: [28, 20, 15], skinSh: [21, 13, 11], skinDk: [12, 7, 7],
  white: [31, 31, 31], mouth: [14, 3, 6],
  hairHi: [30, 30, 31], hair: [21, 22, 25], hairDk: [12, 13, 16],
  gloveHi: [12, 17, 31], glove: [5, 8, 24], gloveDk: [2, 3, 13],
  monocle: [26, 28, 31],
});
const B = makePalette('baron.B', {
  jacket: [30, 30, 29], jacketSh: [22, 22, 24], jacketDk: [13, 13, 17],
  sashHi: [29, 7, 9], sash: [21, 3, 6], sashDk: [11, 1, 3],
  goldHi: [31, 29, 13], gold: [27, 20, 4],
  bootHi: [11, 11, 14], boot: [4, 4, 6],
  crest: [7, 10, 25],
});
export const palettes = { baron: { A, B } };

// the rear (viewer-right) glove stays raised high behind his head
const REAR = { elR: [30, -96], fiR: [21, -114], gloveR: { angle: -30 } };

const poses = {
  enGarde1: {
    extends: 'idle1', shift: [0, 2],
    knL: [-15, -20], knR: [15, -21], ftL: [-19, 0], ftR: [16, 0],
    head: { at: [1, -98], face: 'neutral', look: [0, 0] },
    ...REAR,
    elL: [-24, -66], fiL: [-14, -76], gloveL: { view: 'front', size: 1.1 },
    frontOrder: ['R', 'L'],
  },
  enGarde2: {
    extends: 'enGarde1', shift: [0, 1],
    fiL: [-14, -75], fiR: [21, -113],
  },
  // lead glove drawn back to the hip: the thrust is loading
  thrustTell: {
    extends: 'enGarde1', shift: [-1, 1],
    head: { at: [-1, -98], face: 'focus', look: [-1, 0] },
    elL: [-32, -62], fiL: [-30, -76], gloveL: { view: 'side', angle: -20 },
  },
  // the full-length thrust, straight at you
  thrust: {
    extends: 'enGarde1', shift: [2, 4],
    head: { at: [3, -96], face: 'strain', look: [0, 1] },
    shL: [-16, -80], elL: [-11, -72], fiL: [-3, -70], gloveL: { view: 'front', size: 1.6 },
  },
  // the cut-over: the rear glove climbs even higher before coming over the top
  coupeTell: {
    extends: 'enGarde1', shift: [2, 0],
    head: { at: [3, -99], face: 'focus', look: [1, -1] },
    elR: [34, -104], fiR: [32, -126], gloveR: { angle: 15 },
  },
  // parries: the lead glove whips across and knocks your punch aside
  parryL: {
    extends: 'enGarde1',
    head: { at: [0, -99], face: 'focus', look: [-1, 0] },
    elL: [-30, -74], fiL: [-38, -90], gloveL: { view: 'side', angle: -60 },
  },
  parryR: {
    extends: 'enGarde1',
    head: { at: [1, -99], face: 'focus', look: [1, 0] },
    elL: [-12, -72], fiL: [6, -90], gloveL: { view: 'side', angle: 50 },
  },
  // the salute: lead glove up in front of the face, then the fleche comes
  salute: {
    extends: 'idle1', shift: [0, -1],
    head: { at: [0, -101], face: 'neutral', tilt: 'up', look: [0, -1] },
    elL: [-18, -82], fiL: [-4, -104], gloveL: { view: 'side', angle: 0 },
    elR: [28, -60], fiR: [34, -44], gloveR: { angle: 160 },
  },
  flecheTell: {
    extends: 'crouchTell', shift: [-2, 2],
    head: { at: [-2, -90], face: 'focus', look: [0, 1] },
    ...REAR,
    elL: [-34, -58], fiL: [-32, -70], gloveL: { angle: -30 },
    knR: [18, -14], ftR: [26, 0],
  },
  // the running lunge: flying at you, lead glove huge
  fleche: {
    extends: 'idle1', shift: [0, 6],
    knL: [-16, -18], knR: [18, -16], ftL: [-16, 0], ftR: [26, -2],
    head: { at: [1, -92], face: 'strain', look: [0, 2] },
    shL: [-17, -78], elL: [-12, -70], fiL: [-2, -66], gloveL: { view: 'front', size: 1.75 },
    elR: [34, -78], fiR: [42, -92], gloveR: { angle: 70 },
    frontOrder: ['R', 'L'],
  },
  // taunt: a courtly bow, one glove across the belly, the other swept out
  bow: {
    extends: 'idle1', shift: [0, 5],
    head: { at: [0, -90], face: 'grin', tilt: 'down', look: [0, 2] },
    chest: [0, -68], neck: [0, -82],
    elL: [-22, -58], fiL: [0, -58], gloveL: { angle: 90 },
    elR: [36, -66], fiR: [50, -56], gloveR: { angle: 120 },
  },
};

export default {
  id: 'baron',
  build: 'lean',
  // his own body on the build: a fencer: tall, straight-backed, all leg
  body: { size: [0.94, 0.94], legLen: 1.08, torsoLen: 0.96, shoulders: 0.95 },
  palettes: { default: 'baron' },
  torsoMaterial: 'jacket',
  sleeve: { material: 'jacket', length: 0.95 },
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['jacket', 'jacketSh', 'jacketDk'],
    jacket: ['jacket', 'jacket', 'jacketSh', 'jacketDk'],
    shorts: ['jacket', 'jacket', 'jacketSh', 'jacketDk'],
    sock: ['bootHi', 'boot', 'outline'],
    boot: ['bootHi', 'boot', 'outline'],
    sole: ['boot', 'outline', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    sash: ['sashHi', 'sash', 'sashDk'],
    gold: ['goldHi', 'gold', 'sashDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    ears(ctx, H, ramps.skin, [1.8, 2.9]);
    const hm = skull(ctx, H, ramps.skin, 'chin');
    // silver hair slicked straight back, high forehead
    const hr = ctx.mask().ellipse(x + lx * 0.3, y - 6, H.rx + 0.5, 7).cut(ctx.mask().rect(x - 14, y - 5, 28, 12));
    hr.rect(x - Math.round(H.rx), y - 6, 2, 5).rect(x + Math.round(H.rx) - 2, y - 6, 2, 5);
    cv.part(hr, { ramp: ramps.hair, bevel: 3, inner: 'line' });
    for (const dx of [-6, -2, 2, 6]) cv.line(x + dx, y - 12, x + dx * 1.2, y - 6, (X, Y) => { if (hr.in(X, Y)) cv.shade(X, Y, 1); });
    eyes(ctx, fx, fy, face, 0);
    brows(ctx, fx, fy, face, ramps.hair, { len: 4.4, thick: 0.9, y: -4.4 });
    // monocle over the viewer-right eye, chain dangling
    if (!['ko', 'hurt'].includes(face) && !ctx.layers.remixed) { // (the remix wears an eye patch)
      const mx = fx + 5, my = fy;
      for (let a = 0; a < 22; a++) { const t = (a / 22) * Math.PI * 2; cv.px(Math.round(mx + Math.cos(t) * 3.8), Math.round(my + Math.sin(t) * 3.4), c('monocle')); }
      for (let k = 0; k < 6; k++) cv.px(mx + 3 + (k >> 2), my + 3 + k, c(k % 2 ? 'gold' : 'goldHi'));
    }
    nose(ctx, fx, fy, ramps.skin, [2, 2.4], 3.8);
    mouth(ctx, fx, fy + 9, face, { w: 3.4 });
    // waxed upturned moustache + pointed goatee
    const mu = ctx.mask()
      .ellipse(fx - 3, fy + 7, 3.4, 1.2, 1, 0.15).ellipse(fx + 3, fy + 7, 3.4, 1.2, 1, -0.15)
      .capsule(fx - 5.5, fy + 7, fx - 9, fy + 4, 1, 0.6).capsule(fx + 5.5, fy + 7, fx + 9, fy + 4, 1, 0.6);
    cv.part(mu, { ramp: ramps.hair, bevel: 1, inner: 'line', shadow: false });
    if (!['strain', 'hurt', 'wide'].includes(face)) cv.part(ctx.mask().poly([[fx - 2, fy + 11], [fx + 2, fy + 11], [fx, fy + 16]]).clip(hm.copy().add(ctx.mask().rect(fx - 3, fy + 10, 7, 8))), { ramp: ramps.hair, bevel: 1, inner: 'line', shadow: false });
  },

  torso(ctx) {
    const { cv, J, c, D, ramps, pose } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, h = J.hip;
    const tm = ctx.torsoMask;
    // high collar
    cv.part(ctx.mask().rect(n[0] - 6, n[1] - 3, 12, 5), { ramp: ramps.jacket, bevel: 1, bias: 0.2, inner: 'line', shadow: false });
    // diagonal closure from the collar to the hip, with gold buttons
    cv.line(n[0] + 5, n[1] + 2, w[0] - 9, w[1] - 3, (X, Y) => { if (tm.in(X, Y)) cv.px(X, Y, c('jacketDk')); });
    for (let k = 1; k < 5; k++) { const X = Math.round(n[0] + 5 + (w[0] - 14 - n[0]) * k / 5), Y = Math.round(n[1] + 2 + (w[1] - 5 - n[1]) * k / 5); if (tm.in(X, Y)) cv.px(X + 2, Y, c('gold')); }
    // gold crest on the chest
    if (!pose.lying) {
      const cx = Math.round(ch[0] + 7), cy = Math.round(ch[1] - 5);
      cv.stamp(['.ggg.', 'gbbbg', 'gbgbg', '.gbg.', '..g..'], cx - 2, cy - 2, { g: c('gold'), b: c('crest') });
    }
    // crimson sash knotted at the hip
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, w[1] - 5, D.waistW * 2 + 2, 5).clip(tm.copy().add(ctx.shortsMask)), { ramp: ramps.sash, bevel: 1, inner: 'line', shadow: false });
    if (!pose.lying) cv.part(ctx.mask().poly([[w[0] + D.waistW - 3, w[1] - 2], [w[0] + D.waistW + 3, w[1] + 10], [w[0] + D.waistW - 2, w[1] + 9]]), { ramp: ramps.sash, bevel: 1, inner: 'line' });
    // crimson stripe down the trunks
    for (const s of [-1, 1]) cv.line(h[0] + s * (D.hipSpread + 7), h[1] - 2, h[0] + s * (D.hipSpread + 8), h[1] + 8, (X, Y) => { if (ctx.shortsMask.in(X, Y)) cv.px(X, Y, c('sash')); });
  },
  // Title Defense, THE RETURN MATCH: he lost an eye in a duel and came back for
  // more. A black eye patch where the monocle was, a duelling scar down the
  // other cheek, a red rose in his lapel, and a crimson hussar's half-cape with
  // gold frogging slung over one shoulder.
  remix: {
    colors: { B: { leaf: [6, 18, 7] } },
    ramps: { pelisse: ['sashHi', 'sash', 'sashDk', 'outline'] }, // (crimson: black vanished on the black jacket)
    head(ctx, H) {
      const { cv, c } = ctx;
      const fx = Math.round(H.x + H.look[0]), fy = Math.round(H.y + H.look[1]);
      // the eye patch and its strap
      cv.part(ctx.mask().ellipse(fx + 5, fy, 3.4, 2.8), { ramp: ['bootHi', 'boot', 'outline'].map(c), bevel: 1, inner: 'line', shadow: false });
      cv.line(fx + 2, fy - 2, fx - Math.round(H.rx) + 1, fy - 6, (X, Y) => cv.px(X, Y, c('boot')));
      cv.line(fx + 8, fy - 2, fx + Math.round(H.rx), fy - 5, (X, Y) => cv.px(X, Y, c('boot')));
      // the duelling scar down the viewer-left cheek
      for (let k = 0; k < 6; k++) cv.px(fx - 6 + (k >> 2), fy + 1 + k, c(k % 2 ? 'skinHi' : 'skinDk'));
    },
    torso(ctx) {
      const { cv, J, ramps, c, pose } = ctx;
      if (pose.lying) return;
      const L = J.shL, ch = J.chest;
      // the half-cape: over the viewer-left shoulder, down past the elbow
      const pl = ctx.mask().poly([[L[0] - 8, L[1] - 3], [L[0] + 9, L[1] - 4], [L[0] + 7, L[1] + 24], [L[0] - 11, L[1] + 22]]);
      cv.part(pl, { ramp: ramps.pelisse, bevel: 3 });
      for (let k = 0; k < 4; k++) cv.line(L[0] - 5, L[1] + 3 + k * 5, L[0] + 5, L[1] + 3 + k * 5, (X, Y) => { if (pl.in(X, Y)) cv.px(X, Y, c(k % 2 ? 'gold' : 'goldHi')); });
      cv.line(L[0] - 11, L[1] + 22, L[0] + 7, L[1] + 24, (X, Y) => cv.px(X, Y, c('gold')));
      // a red rose in the lapel
      const rx = Math.round(ch[0] + 9), ry = Math.round(ch[1] - 8);
      cv.part(ctx.mask().ellipse(rx, ry, 2.6, 2.4), { ramp: ['sashHi', 'sash', 'sashDk'].map(c), bevel: 1, inner: 'line', shadow: false });
      cv.px(rx, ry, c('sashDk')); cv.px(rx - 2, ry + 3, c('leaf')); cv.px(rx - 1, ry + 3, c('leaf')); cv.px(rx - 1, ry + 2, c('leaf'));
    },
  },
};
