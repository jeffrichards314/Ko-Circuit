// Rush Hour Ray: sprite layers on the medium build.
// Burnt-out commuter: side-parted hair, five o'clock shadow, bags under the
// eyes, a light-blue dress shirt with the sleeves rolled, a loosened striped
// tie, grey suit-trouser shorts, black dress socks and office shoes, a
// wristwatch, traffic-cone orange gloves. On his head: a traffic light on a
// headband stalk. The lamps are dim in his base palette; the lit lamp is a
// palette swap (ray.red / ray.yellow / ray.green) driven by the cueLamp modifier.

import { makePalette, swapPalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose, stubble } from './_face.js';
import { lerp } from '../../../src/engine/figure.js';

const A = makePalette('ray.A', {
  outline: [3, 2, 4],
  skinHi: [30, 24, 19], skin: [26, 18, 13], skinSh: [19, 12, 9], skinDk: [11, 6, 6],
  white: [31, 31, 31], mouth: [13, 3, 5],
  hairHi: [14, 10, 7], hair: [8, 5, 4],
  gloveHi: [31, 22, 8], glove: [30, 13, 2], gloveDk: [18, 6, 2],
  metal: [22, 22, 24], metalDk: [11, 11, 14],
});
const B = makePalette('ray.B', {
  shirtHi: [27, 30, 31], shirt: [20, 25, 30], shirtSh: [13, 17, 25],
  tieHi: [28, 8, 9], tie: [19, 3, 6], tieStripe: [29, 25, 10],
  slackHi: [17, 17, 20], slack: [11, 11, 14], slackDk: [6, 6, 9],
  housing: [26, 21, 4], housingDk: [15, 11, 2],
  lampR: [11, 3, 4], lampY: [12, 10, 3], lampG: [3, 10, 5],
});
const lit = (name, k, v) => ({ A, B: swapPalette(`ray.B.${name}`, B, { [k]: v }) });
export const palettes = {
  ray: { A, B },
  'ray.red': lit('red', 'lampR', [31, 7, 5]),
  'ray.yellow': lit('yellow', 'lampY', [31, 28, 6]),
  'ray.green': lit('green', 'lampG', [9, 31, 12]),
};

const poses = {
  // red light: stops dead, arms dropped, staring at nothing
  frozen1: {
    extends: 'idle1', shift: [0, 1],
    knL: [-12, -22], knR: [12, -22], ftL: [-13, 0], ftR: [13, 0],
    head: { at: [0, -100], face: 'wide', look: [0, 0] },
    elL: [-26, -62], elR: [26, -62], fiL: [-27, -46], fiR: [27, -46],
    gloveL: { angle: 175 }, gloveR: { angle: -175 },
  },
  frozen2: {
    extends: 'frozen1', shift: [0, 0],
    knL: [-12, -22], knR: [12, -22], ftL: [-13, 0], ftR: [13, 0],
    head: { at: [0, -100], face: 'dazed', look: [0, 0] },
    fiL: [-27, -45], fiR: [27, -45],
  },
  // checking his watch (taunt): late again
  watch: {
    extends: 'idle1', shift: [0, 0],
    head: { at: [-2, -99], face: 'focus', look: [-1, 1] },
    elL: [-28, -64], fiL: [-6, -74], gloveL: { angle: 90 },
    elR: [26, -60], fiR: [14, -70],
    watch: true,
  },
  sighVictory: {
    extends: 'victory',
    head: { at: [0, -100], face: 'grin', look: [0, -1] },
  },
};

export default {
  id: 'ray',
  build: 'medium',
  // his own body on the build: a lanky desk jockey: long and thin, no muscle to speak of
  body: { size: [0.95, 0.9], legLen: 1.05, shoulders: 0.92, dims: { belly: 3, waistW: 14.5, upperArm: [5.3, 4.4] } },
  palettes: { default: 'ray' },
  torsoMaterial: 'shirt',
  sleeve: { material: 'shirt', length: 0.62 },
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['white', 'white', 'metal', 'metalDk'],
    shirt: ['shirtHi', 'shirt', 'shirtSh', 'slackDk'],
    shorts: ['slackHi', 'slack', 'slackDk'],
    sock: ['slack', 'slackDk', 'outline'],
    boot: ['hairHi', 'hair', 'outline'],
    sole: ['slack', 'slackDk', 'outline'],
    hair: ['hairHi', 'hair', 'outline'],
    tie: ['tieHi', 'tie', 'outline'],
    housing: ['housing', 'housing', 'housingDk', 'outline'],
    metal: ['white', 'metal', 'metalDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    ears(ctx, H, ramps.skin, [2.4, 3.4]);
    const hm = skull(ctx, H, ramps.skin, 'square');
    stubble(ctx, fx, fy, 6, 12, 1);
    // side-parted hair, a limp cowlick
    const hr = ctx.mask().ellipse(x + lx * 0.3, y - 6, H.rx + 0.6, 7.2).cut(ctx.mask().rect(x - 14, y - 4, 28, 12));
    hr.rect(x - Math.round(H.rx), y - 5, 2, 6).rect(x + Math.round(H.rx) - 2, y - 5, 2, 5);
    hr.poly([[x + 2, y - 5], [x + 9, y - 5], [x + 6, y - 2]]);
    cv.part(hr.clip(ctx.mask().ellipse(x, y - 1, H.rx + 1, H.ry + 1)), { ramp: ramps.hair, bevel: 3, inner: 'line' });
    cv.line(x - 4 + lx * 0.3, y - 12, x - 3 + lx * 0.3, y - 6, (X, Y) => cv.shade(X, Y, 1)); // the part
    cv.px(x - 6, y - 13, c('hairHi')); cv.px(x - 5, y - 14, c('hairHi'));
    eyes(ctx, fx, fy, face, 0);
    // bags under the eyes: this man has not slept since 2009
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) cv.shade(fx + s * 5 - (s > 0 ? 1 : 0) + i - 2, fy + 2, 1);
    brows(ctx, fx, fy, face === 'neutral' ? 'hurt' : face, ramps.hair, { len: 4.2, thick: 1 });
    nose(ctx, fx, fy, ramps.skin, [2.2, 2.3], 3.6);
    mouth(ctx, fx, fy + 8.5, face, { w: 3.6 });

    // traffic light on a headband stalk
    const ty = y + (H.tilt === 'up' ? -1 : H.tilt === 'down' ? 1 : 0);
    const bandY = ty - 10;
    cv.line(x - Math.round(H.rx) + 1, bandY + 2, x + Math.round(H.rx) - 1, bandY + 2, (X, Y) => { if (hm.in(X, Y) || hr.in(X, Y)) cv.px(X, Y, c('metalDk')); });
    const sx = x + Math.round(lx * 0.5);
    const top = ty - Math.round(H.ry) - 18;
    cv.part(ctx.mask().rect(sx - 1, top + 15, 2, 5), { ramp: ramps.metal, bevel: 1, inner: 'line', shadow: false });
    const box = ctx.mask().rect(sx - 5, top, 10, 16);
    cv.part(box, { ramp: ramps.housing, bevel: 2 });
    for (const [k, dy] of [['lampR', 3], ['lampY', 8], ['lampG', 13]]) {
      cv.flat(ctx.mask().rect(sx - 2, top + dy - 2, 4, 4).rect(sx - 3, top + dy - 1, 6, 2), c(k));
      cv.px(sx - 2, top + dy - 2, c('white')); // glass glint
      // visor hood
      cv.line(sx - 3, top + dy - 3, sx + 2, top + dy - 3, (X, Y) => cv.px(X, Y, c('outline')));
    }
  },

  torso(ctx) {
    const { cv, J, c, ramps, D } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, h = J.hip;
    const nx = Math.round(n[0]), ny = Math.round(n[1]);
    // open collar
    cv.part(ctx.mask().poly([[nx - 7, ny], [nx - 1, ny + 5], [nx - 5, ny + 6]]).poly([[nx + 7, ny], [nx + 1, ny + 5], [nx + 5, ny + 6]]), { ramp: ramps.shirt, bevel: 1, bias: 0.3, inner: 'line', shadow: false });
    // loosened tie hanging off-centre
    const tie = ctx.mask().poly([[nx - 2, ny + 3], [nx + 2, ny + 3], [nx + 1, ny + 6], [ch[0] + 4, ch[1] + 12], [ch[0] + 1, ch[1] + 16], [ch[0] - 1, ch[1] + 12], [nx - 1, ny + 6]]);
    cv.part(tie, { ramp: ramps.tie, bevel: 1, inner: 'line' });
    for (let k = 0; k < 5; k++) { const p = lerp([nx, ny + 7], [ch[0] + 2, ch[1] + 12], k / 5); cv.px(p[0] - 1, p[1], c('tieStripe')); cv.px(p[0], p[1] + 1, c('tieStripe')); }
    // button placket + sweat patches
    for (let k = 0; k < 4; k++) cv.px(w[0] - 3, ch[1] + 2 + k * 6, c('white'));
    cv.line(w[0] - 2, ny + 8, w[0] - 2, w[1] - 1, (X, Y) => { if (ctx.torsoMask.in(X, Y)) cv.shade(X, Y, 1); });
    // belt with a cheap buckle
    const bl = ctx.mask().rect(w[0] - D.waistW - 1, w[1] - 2, D.waistW * 2 + 2, 3);
    cv.part(bl, { ramp: ['hairHi', 'hair', 'outline'].map(c), bevel: 1, inner: 'line', shadow: false });
    cv.part(ctx.mask().rect(w[0] - 2, w[1] - 2, 4, 3), { ramp: ramps.metal, bevel: 1, inner: 'line', shadow: false });
    // trouser crease on the shorts
    for (const s of [-1, 1]) cv.line(h[0] + s * 10, h[1] - 2, h[0] + s * 11, h[1] + 8, (X, Y) => { if (ctx.shortsMask.in(X, Y)) cv.shade(X, Y, -1); });
  },

  front(ctx) {
    const { cv, J, c, pose } = ctx;
    if (pose.lying) return;
    // wristwatch on the viewer-left forearm
    const t = lerp(J.fiL, J.elL, 0.3);
    cv.part(ctx.mask().ellipse(t[0], t[1], 2.4, 2), { ramp: ['white', 'metal', 'metalDk'].map(c), bevel: 1, inner: 'line', shadow: false });
    if (pose.watch) { cv.px(t[0], t[1] - 1, c('outline')); cv.px(t[0] + 1, t[1], c('outline')); }
  },
};
