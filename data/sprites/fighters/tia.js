// Tempest Tia: sprite layers on the lean build.
// A harbour-town sailor: a long dark braid with a streak of storm-grey, a
// navy-and-white striped sleeveless top with a red neckerchief, a silver
// compass pendant, navy trunks with a white lightning stripe, white deck boots,
// sea-green gloves. Poses: the stance-switch hop, the weathervane taunt and the
// wind-swept victory. (Her southpaw frames are the same poses mirrored.)

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './_face.js';

const A = makePalette('tia.A', {
  outline: [2, 2, 4],
  skinHi: [30, 22, 16], skin: [25, 15, 10], skinSh: [18, 10, 7], skinDk: [10, 5, 4],
  white: [31, 31, 31], mouth: [20, 5, 8],
  hairHi: [10, 8, 10], hair: [5, 3, 5], streak: [22, 23, 26],
  gloveHi: [15, 30, 24], glove: [5, 21, 17], gloveDk: [2, 11, 10],
  lash: [3, 2, 4],
});
const B = makePalette('tia.B', {
  navyHi: [10, 13, 24], navy: [5, 7, 16], navyDk: [2, 3, 8],
  stripe: [29, 30, 31], stripeSh: [20, 21, 25],
  kerchief: [28, 6, 7], kerchiefDk: [16, 2, 4],
  silverHi: [31, 31, 31], silver: [20, 21, 24],
  bootHi: [31, 31, 30], boot: [24, 24, 26], bootDk: [14, 14, 18],
});
export const palettes = { tia: { A, B } };

const poses = {
  // the stance-switch hop: tucked, then up in the air, braid flying
  hop1: {
    extends: 'crouchTell', shift: [0, 1],
    head: { at: [0, -92], face: 'focus', look: [0, 0] },
  },
  hop2: {
    extends: 'idle1', shift: [0, -10],
    knL: [-12, -30], knR: [12, -30], ftL: [-10, -12], ftR: [10, -12],
    head: { at: [0, -110], face: 'wide', tilt: 'up', look: [0, -1] },
    elL: [-30, -86], elR: [30, -86], fiL: [-26, -104], fiR: [26, -104],
    gloveL: { angle: 20 }, gloveR: { angle: -20 },
  },
  // taunt: licks a glove and holds it up to feel the wind
  weathervane: {
    extends: 'idle1',
    head: { at: [2, -101], face: 'grin', tilt: 'up', look: [2, -1] },
    elR: [30, -96], fiR: [26, -118], gloveR: { angle: 5 },
    elL: [-26, -62], fiL: [-12, -74],
  },
  windswept: {
    extends: 'victory',
    head: { at: [0, -101], face: 'grin', look: [0, -1] },
  },
};

export default {
  id: 'tia',
  build: 'lean',
  // his own body on the build: a sailor: strong shoulders from the rigging, a slim waist
  body: { size: [0.94, 0.96], shoulders: 1.04, legLen: 1.02, dims: { deltoid: 6, upperArm: [5.4, 4.4] } },
  palettes: { default: 'tia' },
  torsoMaterial: 'stripe',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['stripe', 'stripeSh', 'navy'],
    stripe: ['stripe', 'stripe', 'stripeSh', 'navy'],
    shorts: ['navyHi', 'navy', 'navyDk'],
    sock: ['bootHi', 'boot', 'bootDk'],
    boot: ['bootHi', 'boot', 'bootDk'],
    sole: ['bootDk', 'navy', 'outline'],
    hair: ['hairHi', 'hair', 'outline'],
    kerchief: ['kerchief', 'kerchief', 'kerchiefDk'],
    silver: ['silverHi', 'silver', 'navyDk'],
  },

  back(ctx) {
    // the long braid swinging behind her
    const { cv, J, pose, ramps, c } = ctx;
    if (pose.lying) return;
    const hx = J.head[0], hy = J.head[1];
    const up = pose.head && pose.head.face === 'wide';
    const sway = pose.mirrored ? -1 : 1;
    const pts = [];
    for (let k = 0; k < 7; k++) pts.push([hx + sway * (8 + k * 2.2), hy - 2 + (up ? -k * 2 : k * 5.2)]);
    for (let k = 0; k < 6; k++) {
      const [x0, y0] = pts[k], [x1, y1] = pts[k + 1];
      cv.part(ctx.mask().capsule(x0, y0, x1, y1, 3 - k * 0.25, 2.8 - k * 0.25), { ramp: ramps.hair, bevel: 2, inner: 'line' });
      cv.px(Math.round((x0 + x1) / 2), Math.round((y0 + y1) / 2), c(k % 2 ? 'streak' : 'hairHi'));
    }
    const [ex, ey] = pts[6];
    cv.part(ctx.mask().ellipse(ex, ey + 1, 2, 1.6), { ramp: ramps.kerchief, bevel: 1, inner: 'line' });
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    ears(ctx, H, ramps.skin, [1.8, 2.8]);
    skull(ctx, H, ramps.skin, 'narrow');
    // hair pulled back tight, a side part with a storm-grey streak
    const hr = ctx.mask().ellipse(x + lx * 0.3, y - 5, H.rx + 0.6, 7.5).cut(ctx.mask().rect(x - 14, y - 3, 28, 12));
    hr.rect(x - Math.round(H.rx), y - 5, 2, 5).rect(x + Math.round(H.rx) - 2, y - 5, 2, 5);
    cv.part(hr, { ramp: ramps.hair, bevel: 3, inner: 'line' });
    for (let k = 0; k < 6; k++) cv.px(x - 4 + k, y - 11 + (k >> 1), c('streak'));
    for (const dx of [-6, 2, 6]) cv.line(x + dx, y - 11, x + dx * 0.7, y - 4, (X, Y) => { if (hr.in(X, Y)) cv.shade(X, Y, -1); });
    eyes(ctx, fx, fy, face, -1);
    for (const s of [-1, 1]) { const ex = fx + s * 8 - (s > 0 ? 2 : 0); cv.px(ex, fy - 3, c('lash')); cv.px(ex + s, fy - 4, c('lash')); }
    brows(ctx, fx, fy, face, ramps.hair, { len: 3.8, thick: 0.9, y: -4.2 });
    nose(ctx, fx, fy, ramps.skin, [1.7, 1.8], 3.4);
    mouth(ctx, fx, fy + 8, face, { w: 3 });
    // tiny gold hoop earrings (silver in her palette)
    for (const s of [-1, 1]) cv.px(Math.round(H.x + s * (H.rx + 0.5) + lx * 0.3), Math.round(H.y + 5), c('silver'));
  },

  torso(ctx) {
    const { cv, J, c, D, ramps, pose } = ctx;
    const n = J.neck, w = J.waist, h = J.hip;
    const tm = ctx.torsoMask;
    // bare shoulders, navy sailor stripes
    for (const s of ['L', 'R']) cv.part(ctx.mask().ellipse(J['sh' + s][0], J['sh' + s][1], D.deltoid + 1.2, D.deltoid + 0.8).clip(tm), { ramp: ramps.skin, bevel: 3, shadow: false });
    for (let y = Math.round(n[1]) + 6; y < w[1]; y += 4) for (let x = 0; x < tm.w; x++) if (tm.in(x, y) && cv.ramp[y * cv.w + x] && cv.rampId(ramps.stripe) === cv.ramp[y * cv.w + x]) cv.px(x, y, c(y % 8 < 4 ? 'navy' : 'navyHi'));
    // red neckerchief knotted at the throat, silver compass under it
    cv.part(ctx.mask().poly([[n[0] - 7, n[1]], [n[0] + 7, n[1]], [n[0], n[1] + 7]]).clip(tm), { ramp: ramps.kerchief, bevel: 1, inner: 'line', shadow: false });
    cv.part(ctx.mask().ellipse(n[0], n[1] + 1, 2, 1.6), { ramp: ramps.kerchief, bevel: 1, inner: 'line', shadow: false });
    if (!pose.lying) {
      cv.part(ctx.mask().ellipse(n[0], n[1] + 10, 2.2, 2.2), { ramp: ramps.silver, bevel: 1, inner: 'line', shadow: false });
      cv.px(n[0], n[1] + 9, c('kerchief'));
    }
    // white lightning bolt down the trunks
    for (const s of [-1, 1]) {
      const bx = Math.round(h[0] + s * (D.hipSpread + 7)), by = Math.round(h[1] - 3);
      for (const [dx, dy] of [[0, 0], [1, 1], [0, 2], [-1, 3], [0, 4], [1, 5], [2, 6], [1, 7]]) if (ctx.shortsMask.in(bx + dx * s, by + dy)) cv.px(bx + dx * s, by + dy, c('stripe'));
    }
  },
};
