// Gus Grill: sprite layers on the heavy build.
// Food-truck cook: folded paper cap with a ketchup stripe, bushy brows,
// goatee, double chin, white tee under a mustard apron (stains included),
// a chili-pepper tattoo, houndstooth chef shorts, kitchen clogs, ketchup-red
// gloves. Keeps a burger in the apron pocket for emergencies.

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose, stubble } from './_face.js';
import { lerp } from '../../../src/engine/figure.js';

const A = makePalette('gus.A', {
  outline: [3, 2, 2],
  skinHi: [31, 25, 20], skin: [29, 19, 15], skinSh: [23, 12, 10], skinDk: [14, 6, 6],
  white: [31, 31, 30], mouth: [13, 2, 4], ruddy: [28, 11, 10],
  hairHi: [10, 8, 9], hair: [5, 4, 5], hairDk: [2, 2, 3],
  gloveHi: [31, 17, 13], glove: [26, 4, 4], gloveDk: [14, 1, 3],
});
const B = makePalette('gus.B', {
  teeSh: [22, 23, 25], teeDk: [14, 15, 19],
  apronHi: [31, 29, 13], apron: [29, 22, 4], apronSh: [21, 14, 2],
  check: [24, 24, 26], checkDk: [7, 7, 10],
  bunHi: [30, 22, 11], bun: [25, 15, 5], bunSh: [16, 8, 3],
  patty: [11, 5, 3], lettuce: [10, 25, 6], cheese: [31, 26, 4],
  tattoo: [4, 14, 16],
});
export const palettes = { gus: { A, B } };

// The burger comes out of the apron pocket, goes up, gets chomped.
const HOLD = { elL: [-27, -60], fiL: [-12, -56], gloveL: { angle: 120 } };
const poses = {
  eatReach: {
    extends: 'idle1', shift: [1, 2], ...HOLD,
    head: { at: [1, -99], face: 'focus', look: [1, 1] },
    elR: [28, -58], fiR: [13, -50], gloveR: { angle: 160 }, burger: 0,
  },
  eat1: {
    extends: 'idle1', shift: [0, 1], ...HOLD,
    head: { at: [-1, -100], face: 'wide', look: [0, 0] },
    elR: [27, -72], fiR: [8, -86], gloveR: { angle: -40 }, burger: 1,
  },
  eat2: {
    extends: 'idle1', shift: [0, 2], ...HOLD,
    head: { at: [0, -98], face: 'chew', look: [0, 1] },
    elR: [28, -68], fiR: [13, -78], gloveR: { angle: -25 }, burger: 2,
  },
  belly: {
    extends: 'idle1', shift: [0, 0],
    head: { at: [1, -101], face: 'grin', look: [0, -1] },
    elL: [-28, -58], fiL: [-8, -50], elR: [28, -58], fiR: [9, -46],
    gloveL: { angle: 110 }, gloveR: { angle: -110 },
  },
};

export default {
  id: 'gus',
  build: 'heavy',
  // his own body on the build: round as a meatball: huge gut, double chin, stubby legs
  body: { size: [1.08, 0.92], legLen: 0.86, dims: { belly: 14, waistW: 23, neck: 8.5, hipSpread: 11.5 } },
  palettes: { default: 'gus' },
  torsoMaterial: 'tee',
  sleeve: { material: 'tee', length: 0.5 },
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['white', 'white', 'teeSh', 'teeDk'],
    tee: ['white', 'teeSh', 'teeDk', 'hairHi'],
    shorts: ['check', 'teeSh', 'checkDk'],
    sock: ['white', 'teeSh', 'teeDk'],
    boot: ['hairHi', 'hair', 'hairDk'],
    sole: ['teeSh', 'teeDk', 'hairDk'],
    hair: ['hairHi', 'hair', 'hairDk'],
    apron: ['apronHi', 'apron', 'apronSh', 'bunSh'],
    paper: ['white', 'white', 'teeSh', 'teeDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    ears(ctx, H, ramps.skin, [2.6, 3.4]);
    const hm = skull(ctx, H, ramps.skin, 'round');
    // double chin
    const chin2 = ctx.mask().ellipse(fx, fy + 12.5, 7, 2.6).cut(hm);
    cv.part(chin2, { ramp: ramps.skin, bevel: 2, inner: 'soft' });
    // puffed cheeks while chewing
    if (face === 'chew') cv.part(ctx.mask().ellipse(fx - 6, fy + 5, 3.4, 3).ellipse(fx + 6, fy + 5, 3.4, 3), { ramp: ramps.skin, bevel: 3, inner: 'soft' });
    // ruddy cheeks
    for (const s of [-1, 1]) { cv.px(fx + s * 6, fy + 3, c('ruddy')); cv.px(fx + s * 5 - (s > 0 ? 1 : 0), fy + 3, c('ruddy')); }
    stubble(ctx, fx, fy, 8, 11, 1);
    eyes(ctx, fx, fy, face, 0);
    brows(ctx, fx, fy, face, ramps.hair, { len: 4.6, thick: 1.15, y: -4.2 });
    nose(ctx, fx, fy, ['skinHi', 'ruddy', 'skinSh', 'skinDk'].map(c), [2.6, 2.4], 3.5);
    mouth(ctx, fx, fy + 8, face, { w: 4.5 });
    // goatee
    const gt = ctx.mask().ellipse(fx, fy + 12, 2.4, 1.7);
    cv.part(gt, { ramp: ramps.hair, bevel: 1, inner: 'line', shadow: false });
    // short black hair under the cap
    for (let j = -4; j <= 1; j++) for (const X of [x - Math.round(H.rx) + 1, x + Math.round(H.rx) - 2]) if (hm.in(X, y + j)) cv.px(X + lx * 0.3, y + j, c('hair'));

    // folded paper cap (soda-jerk style): a trapezoid with a ketchup stripe
    // (the Title Defense remix wears a chef's toque instead: see remix below)
    if (ctx.layers.remixed) return;
    const cy = y + (H.tilt === 'up' ? -1 : H.tilt === 'down' ? 1 : 0);
    const cap = ctx.mask().poly([
      [x - H.rx - 1 + lx * 0.4, cy - 5], [x + H.rx + 1 + lx * 0.4, cy - 5],
      [x + H.rx - 3 + lx * 0.4, cy - 13], [x - H.rx + 3 + lx * 0.4, cy - 13],
    ]).ellipse(x + lx * 0.4, cy - 12.5, H.rx - 3, 2);
    cv.part(cap, { ramp: ramps.paper, bevel: 3 });
    cv.line(x - H.rx + 1 + lx * 0.4, cy - 8, x + H.rx - 1 + lx * 0.4, cy - 8, (X, Y) => { if (cap.in(X, Y)) cv.px(X, Y, c('glove')); });
    cv.line(x + lx * 0.4, cy - 13, x + lx * 0.4, cy - 9, (X, Y) => cv.shade(X, Y, 1));
  },

  torso(ctx) {
    const { cv, J, c, ramps, D } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, h = J.hip;
    // houndstooth shorts: a 2x2 checker over the shorts
    const sm = ctx.shortsMask;
    for (let y = 0; y < sm.h; y++) for (let x = 0; x < sm.w; x++) if (sm.in(x, y) && ((x >> 1) + (y >> 1)) % 2 === 0) cv.shade(x, y, 2);
    // crew neck
    const nx = Math.round(n[0]), ny = Math.round(n[1]);
    cv.part(ctx.mask().ellipse(nx, ny + 1, 6, 2.6).clip(ctx.torsoMask), { ramp: ramps.tee, bevel: 1, bias: -0.2, inner: 'line', shadow: false });
    // apron bib + skirt with neck strap
    const top = ch[1] - 8;
    const apron = ctx.mask().poly([
      [ch[0] - 12, top], [ch[0] + 12, top],
      [w[0] + D.waistW + 3, w[1] - 3], [h[0] + D.hipSpread + 11, h[1] + 7],
      [h[0] - D.hipSpread - 11, h[1] + 7], [w[0] - D.waistW - 3, w[1] - 3],
    ]);
    cv.part(apron, { ramp: ramps.apron, bevel: 5 });
    cv.line(ch[0] - 11, top, nx - 5, ny + 2, (X, Y) => cv.px(X, Y, c('apronSh')));
    cv.line(ch[0] + 11, top, nx + 5, ny + 2, (X, Y) => cv.px(X, Y, c('apronSh')));
    // waist tie
    cv.line(w[0] - D.waistW - 3, w[1] - 3, w[0] + D.waistW + 3, w[1] - 3, (X, Y) => cv.px(X, Y, c('apronSh')));
    // kangaroo pocket (the burger lives here)
    const pk = ctx.mask().rect(w[0] - 9, w[1] + 1, 18, 7);
    cv.part(pk, { ramp: ramps.apron, bevel: 1, inner: 'line', shadow: false });
    cv.px(w[0] + 4, w[1] + 1, c('bun')); cv.px(w[0] + 5, w[1] + 1, c('bunHi')); cv.px(w[0] + 6, w[1] + 1, c('bun'));
    // stains
    for (const [dx, dy, k] of [[-6, 4, 'glove'], [-5, 5, 'glove'], [7, 12, 'patty'], [3, -2, 'glove']]) cv.px(ch[0] + dx, ch[1] + dy, c(k));
    // chef's name stitched on the bib
    cv.stamp(['g.g.g', 'ggggg'], ch[0] - 2, top + 3, { g: c('glove') });
  },

  front(ctx) {
    const { cv, J, c, pose, ramps } = ctx;
    // chili-pepper tattoo on the viewer-left forearm
    if (!pose.lying) {
      const t = lerp(J.elL, J.fiL, 0.45);
      cv.px(t[0], t[1], c('glove')); cv.px(t[0] + 1, t[1] + 1, c('glove')); cv.px(t[0] + 1, t[1], c('tattoo')); cv.px(t[0] - 1, t[1] - 1, c('lettuce'));
    }
    if (pose.burger === undefined) return;
    // the burger, held above the right glove
    const k = pose.burger;
    const [bx, by] = [Math.round(J.fiR[0]) - 2, Math.round(J.fiR[1]) - 11];
    if (k === 0) {
      const b = ctx.mask().ellipse(bx + 2, by + 10, 5, 3);
      cv.part(b, { ramp: ['bunHi', 'bun', 'bunSh'].map(c), bevel: 2 });
      return;
    }
    const top = ctx.mask().ellipse(bx, by, 7, 4).cut(ctx.mask().rect(bx - 10, by + 1, 20, 8));
    if (k === 2) top.cut(ctx.mask().ellipse(bx - 6, by - 1, 3.5, 3));
    cv.part(top, { ramp: ['bunHi', 'bun', 'bunSh'].map(c), bevel: 3 });
    for (const [dx, dy] of [[-3, -2], [0, -3], [3, -2], [1, -1]]) cv.px(bx + dx, by + dy, c('white'));
    cv.flat(ctx.mask().rect(bx - 7, by + 1, 15, 1), c('lettuce'));
    cv.px(bx - 8, by + 2, c('lettuce')); cv.px(bx + 8, by + 1, c('lettuce'));
    cv.flat(ctx.mask().rect(bx - 6, by + 2, 13, 1), c('cheese'));
    cv.px(bx + 5, by + 3, c('cheese'));
    cv.flat(ctx.mask().rect(bx - 6, by + 3, 13, 2), c('patty'));
    const bot = ctx.mask().ellipse(bx, by + 6, 6.5, 2).cut(ctx.mask().rect(bx - 10, by, 20, 5));
    cv.part(bot, { ramp: ['bun', 'bunSh', 'bunSh'].map(c), bevel: 1, shadow: false });
    // outline the sandwich
    const all = ctx.mask().ellipse(bx, by, 7, 4).rect(bx - 7, by, 15, 5).ellipse(bx, by + 6, 6.5, 2);
    if (k === 2) all.cut(ctx.mask().ellipse(bx - 6, by - 1, 3.5, 3));
    for (let y = by - 6; y <= by + 9; y++) for (let x = bx - 10; x <= bx + 10; x++) {
      if (all.in(x, y)) continue;
      if (all.in(x - 1, y) || all.in(x + 1, y) || all.in(x, y - 1) || all.in(x, y + 1)) cv.px(x, y, c('outline'));
    }
  },
  // Title Defense, DOUBLE SHIFT: the night shift. A tall chef's toque with a
  // blue band, a kitchen towel over his shoulder, a spatula through the apron
  // tie, a burn dressing on his forearm, and a gut from tasting everything.
  remix: {
    body: { dims: { belly: 17, waistW: 24.5 } },
    head(ctx, H) {
      const { cv, ramps, c } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.4), y = Math.round(H.y) + (H.tilt === 'up' ? -1 : H.tilt === 'down' ? 1 : 0);
      const puff = ctx.mask().ellipse(x, y - 19, H.rx + 1.5, 6.5).ellipse(x - 6, y - 21, 5, 5).ellipse(x + 6, y - 21, 5, 5).ellipse(x, y - 24, 5.5, 5).rect(x - H.rx + 1, y - 17, H.rx * 2 - 2, 6);
      cv.part(puff, { ramp: ramps.paper, bevel: 4 });
      for (const i of [-4, 0, 4]) cv.line(x + i, y - 23, x + i * 0.8, y - 15, (X, Y) => cv.shade(X, Y, 1));
      const band = ctx.mask().rect(x - H.rx - 0.5, y - 12, H.rx * 2 + 1, 5);
      cv.part(band, { ramp: ramps.apron, bevel: 2, inner: 'line' });
    },
    torso(ctx) {
      const { cv, J, ramps, c } = ctx;
      const s = J.shR, ch = J.chest;
      // a kitchen towel over the viewer-right shoulder, red stripes at the ends
      const tw = ctx.mask().capsule(s[0] - 2, s[1] - 3, s[0] - 5, s[1] + 16, 3.4, 3).capsule(s[0] + 2, s[1] - 3, s[0] + 4, s[1] + 8, 3, 2.6);
      cv.part(tw, { ramp: ramps.paper, bevel: 2, inner: 'line' });
      for (const [dx, dy] of [[-7, 13], [-6, 13], [-5, 13], [-4, 13], [2, 6], [3, 6], [4, 6], [5, 6]]) if (tw.in(Math.round(s[0] + dx), Math.round(s[1] + dy))) cv.px(s[0] + dx, s[1] + dy, c('glove'));
      cv.shade(ch[0] + 4, ch[1] - 6, 1);
    },
    front(ctx) {
      const { cv, J, c, D, pose } = ctx;
      if (pose.lying) return;
      // a spatula stuck through the apron tie on the viewer-left hip
      const w = J.waist, hx = Math.round(w[0] - D.waistW - 1), hy = Math.round(w[1] - 3);
      cv.line(hx, hy - 9, hx - 2, hy + 5, (X, Y) => cv.px(X, Y, c('hairDk')));
      cv.line(hx + 1, hy - 9, hx - 1, hy + 5, (X, Y) => cv.px(X, Y, c('hair')));
      cv.part(ctx.mask().rect(hx - 3, hy - 16, 6, 7), { ramp: ['white', 'teeSh', 'teeDk'].map(c), bevel: 1, inner: 'line' });
      for (const i of [-1, 1]) cv.px(hx + i, hy - 13, c('teeDk'));
      // a burn dressing on the viewer-right forearm
      const t = lerp(J.elR, J.fiR, 0.5);
      cv.part(ctx.mask().capsule(t[0] - 2, t[1] - 1, t[0] + 2, t[1] + 1, 2.8, 2.8), { ramp: ['white', 'teeSh', 'teeDk'].map(c), bevel: 1, inner: 'line', shadow: false });
    },
  },
};
