// Rocco Rivets: sprite layers on the heavy build.
// Ironworker: dented safety-yellow hard hat, bushy auburn beard, soot on the
// cheek, open hi-vis vest with reflective stripes over a bare chest, a tool
// belt with a hammer, cut-off denim shorts and tan steel-toe boots. Steel-grey
// gloves. When he's stunned the hard hat knocks crooked.

import { makePalette, swapPalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './_face.js';

const A = makePalette('rocco.A', {
  outline: [3, 2, 2],
  skinHi: [30, 22, 16], skin: [25, 16, 10], skinSh: [18, 10, 6], skinDk: [11, 5, 4],
  white: [30, 30, 28], mouth: [12, 3, 3],
  hairHi: [25, 12, 6], hair: [18, 7, 3], hairDk: [10, 4, 2],
  gloveHi: [23, 25, 28], glove: [14, 16, 20], gloveDk: [7, 8, 12],
  soot: [9, 8, 9],
});
const B = makePalette('rocco.B', {
  hatHi: [31, 30, 13], hat: [30, 24, 3], hatSh: [21, 14, 2],
  vestHi: [31, 21, 8], vest: [30, 13, 2], vestSh: [20, 7, 2],
  reflect: [27, 29, 30],
  denimHi: [15, 19, 27], denim: [9, 12, 21], denimDk: [4, 6, 12],
  beltHi: [19, 12, 6], belt: [11, 6, 3],
  bootHi: [28, 21, 12], boot: [21, 14, 7],
});
// his hard hat knocked off for good (his exploit): the dome shows his auburn hair instead
const hatless = swapPalette('rocco.hatlessB', B, { hatHi: [25, 12, 6], hat: [18, 7, 3], hatSh: [10, 4, 2] });
export const palettes = { rocco: { A, B }, 'rocco.hatless': { A, B: hatless } };

export default {
  id: 'rocco',
  build: 'heavy',
  // his own body on the build: an ironworker: broad yoke, forearms like girders
  body: { shoulders: 1.1, dims: { upperArm: [8.4, 7], forearm: [7.2, 6], belly: 7, deltoid: 9 } },
  palettes: { default: 'rocco' },
  torsoMaterial: 'skin',
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['white', 'gloveHi', 'glove', 'gloveDk'],
    shorts: ['denimHi', 'denim', 'denimDk'],
    boot: ['bootHi', 'boot', 'belt'],
    sole: ['boot', 'belt', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    hat: ['hatHi', 'hat', 'hatSh', 'belt'],
    vest: ['vestHi', 'vest', 'vestSh', 'hairDk'],
    belt: ['beltHi', 'belt', 'outline'],
    metal: ['white', 'gloveHi', 'glove', 'gloveDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';
    // head hits only land while he's stunned, so hitHigh (hurt + tilt up) is rattled too; hitLow isn't
    const rattled = face === 'dazed' || face === 'ko' || (face === 'hurt' && H.tilt === 'up');

    ears(ctx, H, ramps.skin, [2.6, 3.6]);
    const hm = skull(ctx, H, ramps.skin, 'square');
    // soot smudge on the viewer-left cheek
    for (const [i, j] of [[-7, 2], [-6, 3], [-8, 3], [-7, 4]]) if (hm.in(fx + i, fy + j)) cv.px(fx + i, fy + j, c('soot'));
    eyes(ctx, fx, fy, face, 0);
    brows(ctx, fx, fy, face, ramps.hair, { len: 5, thick: 1.5, y: -3.8 });
    nose(ctx, fx, fy, ramps.skin, [2.6, 2.3], 3.2);
    // full beard: sideburns into a wide jaw beard, mouth cut out of it
    const beard = ctx.mask()
      .ellipse(fx, fy + 9, H.rx + 0.8, 6.5)
      .rect(x - H.rx - 0.5 + lx * 0.3, y - 1, 3, 9).rect(x + H.rx - 2.5 + lx * 0.3, y - 1, 3, 9)
      .cut(ctx.mask().rect(x - 20, fy - 30, 40, 34.5))
      .add(ctx.mask().rect(x - H.rx - 0.5 + lx * 0.3, y - 1, 3, 6).rect(x + H.rx - 2.5 + lx * 0.3, y - 1, 3, 6));
    cv.part(beard, { ramp: ramps.hair, bevel: 3, inner: 'line' });
    for (const [i, j] of [[-6, 9], [-3, 11], [0, 12], [3, 11], [6, 9], [-8, 6], [8, 6]]) cv.shade(fx + i, fy + j, -1);
    // mustache over the mouth
    cv.part(ctx.mask().ellipse(fx - 2.8, fy + 6.5, 3.5, 1.6, 1, -0.25).ellipse(fx + 2.8, fy + 6.5, 3.5, 1.6, 1, 0.25), { ramp: ramps.hair, bevel: 1, inner: 'line' });
    mouth(ctx, fx, fy + 8, face, { w: 3.5 });

    // hard hat: dome with a center ridge and a front brim. When he's rattled it
    // gets knocked crooked (tipped ~20 degrees and slid off to one side) so you
    // can see at a glance that his head is open.
    const ang = rattled ? 0.36 : 0;
    const cy = y + (rattled ? 1 : 0) + (H.tilt === 'up' ? -1 : H.tilt === 'down' ? 1 : 0);
    const hx = x + lx * 0.4 + (rattled ? 4 : 0);
    const ca = Math.cos(ang), sa = Math.sin(ang);
    const rot = (dx, dy) => [hx + dx * ca - dy * sa, cy + dx * sa + dy * ca];
    const under = ctx.mask().poly([rot(-30, -5), rot(30, -5), rot(30, 20), rot(-30, 20)]);
    const dome = ctx.mask().ellipse(...rot(0, -8), H.rx + 1.8, 9, 1, ang).cut(under);
    cv.part(dome, { ramp: ramps.hat, bevel: 6 });
    const r0 = rot(0, -16.5), r1 = rot(0, -6);
    cv.part(ctx.mask().capsule(r0[0], r0[1], r1[0], r1[1], 1.6, 1.6).clip(dome), { ramp: ramps.hat, bevel: 1, bias: 0.3, inner: 'line', shadow: false });
    // dents + a sticker
    const d0 = rot(-6, -10), d1 = rot(6, -12), st = rot(4, -9);
    cv.shade(d0[0], d0[1], 1); cv.shade(d0[0] + 1, d0[1], 1); cv.shade(d1[0], d1[1], -1);
    cv.px(st[0], st[1], c('reflect')); cv.px(st[0] + 1, st[1], c('vest')); cv.px(st[0], st[1] + 1, c('vest'));
    const bc = rot(0, H.tilt === 'up' && !rattled ? -6 : -4.5);
    const brim = ctx.mask().ellipse(bc[0], bc[1], H.rx + 4.5, H.tilt === 'up' ? 1.6 : 2.2, 1, ang).cut(ctx.mask().poly([rot(-30, -26), rot(30, -26), rot(30, -5.2), rot(-30, -5.2)]));
    cv.part(brim, { ramp: ramps.hat, bevel: 1, bias: -0.3, inner: 'line' });
    if (!rattled && H.tilt !== 'up') for (let i = -9; i <= 9; i++) if (hm.in(fx + i, Math.round(bc[1]) + 2)) cv.shade(fx + i, Math.round(bc[1]) + 2, 1);
    // stars circling a rattled head
    if (rattled && face === 'dazed') for (const [dx, dy] of [[-12, -14], [13, -18]]) { cv.px(x + dx, y + dy, c('white')); cv.px(x + dx - 1, y + dy, c('hat')); cv.px(x + dx + 1, y + dy, c('hat')); cv.px(x + dx, y + dy - 1, c('hat')); cv.px(x + dx, y + dy + 1, c('hat')); }
  },

  torso(ctx) {
    const { cv, J, c, ramps, D } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, h = J.hip;
    // zipped hi-vis vest over a bare chest: only a V of hairy chest shows
    const nx = Math.round(n[0]), ny = Math.round(n[1]);
    const vee = ctx.mask().poly([[nx - 7, ny], [nx + 7, ny], [nx, ny + 14]]);
    const vest = ctx.torsoMask.copy().cut(vee).clip(ctx.mask().poly([
      [nx - 9, ny - 2], [nx + 9, ny - 2], [ch[0] + D.chestW + 4, ch[1] - 10], [w[0] + D.waistW + 6, w[1] + 2],
      [w[0] - D.waistW - 6, w[1] + 2], [ch[0] - D.chestW - 4, ch[1] - 10],
    ]));
    cv.part(vest, { ramp: ramps.vest, bevel: 6, inner: 'line' });
    for (let j = 1; j <= 12; j++) for (let i = -5; i <= 5; i++) if ((i + j) % 2 === 0 && vee.in(nx + i, ny + j) && !vest.in(nx + i, ny + j)) cv.shade(nx + i, ny + j, 1);
    for (const dy of [-2, 9]) {
      const yy = Math.round(ch[1] + dy);
      for (let X = 0; X < vest.w; X++) if (vest.in(X, yy) && vest.in(X, yy + 1) && Math.abs(X - nx) > 1) { cv.px(X, yy, c('reflect')); cv.px(X, yy + 1, c('reflect')); }
    }
    cv.line(nx, ny + 14, w[0], w[1] - 2, (X, Y) => { if (vest.in(X, Y)) cv.px(X, Y, c('vestSh')); });
    for (const s of [-1, 1]) cv.line(ch[0] + s * 10, ch[1] + 14, ch[0] + s * 12, ch[1] + 20, (X, Y) => cv.shade(X, Y, 1));
    // tool belt with pouches and a hammer on the viewer-right hip
    const by = Math.round(w[1] - 1);
    cv.part(ctx.mask().rect(w[0] - D.waistW - 2, by - 2, D.waistW * 2 + 4, 4).clip(ctx.mask().add(ctx.shortsMask).add(ctx.torsoMask)), { ramp: ramps.belt, bevel: 1, inner: 'line', shadow: false });
    cv.part(ctx.mask().rect(w[0] - 3, by - 2, 6, 4), { ramp: ramps.metal, bevel: 1, inner: 'line', shadow: false });
    for (const s of [-1, 1]) cv.part(ctx.mask().rect(w[0] + s * 14 - 4, by + 1, 8, 8), { ramp: ramps.belt, bevel: 2, inner: 'line' });
    const hx = w[0] + 22;
    cv.part(ctx.mask().rect(hx - 1, by - 3, 3, 16), { ramp: ramps.belt, bevel: 1, inner: 'line' });
    cv.part(ctx.mask().rect(hx - 5, by - 6, 10, 4), { ramp: ramps.metal, bevel: 1, inner: 'line' });
    // frayed cut-off hems + a rip
    for (const s of [-1, 1]) {
      const kx = h[0] + s * (D.hipSpread + 3);
      cv.shade(kx, h[1] + 8, -1); cv.shade(kx + 2, h[1] + 9, -1); cv.shade(kx - 2, h[1] + 9, -1);
    }
    cv.px(h[0] - 12, h[1] + 3, c('white')); cv.px(h[0] - 11, h[1] + 3, c('skin'));
  },
};
