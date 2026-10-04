// Skyline Sam: sprite layers on the medium build.
// Forty-storey window washer: sun-bleached shaggy blond hair, aviators pushed
// up on his head, a sunburnt nose, stubble, a teal work tee under a yellow
// safety harness (chest strap, shoulder straps, a steel D-ring), navy work
// shorts with a tool belt, grey socks and work boots, sky-blue gloves. His
// squeegee rides on the belt and comes out for the big horizontal swipe.

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose, stubble } from './_face.js';

const A = makePalette('sam.A', {
  outline: [2, 3, 4],
  skinHi: [31, 24, 18], skin: [28, 17, 12], skinSh: [21, 11, 8], skinDk: [12, 6, 5],
  white: [31, 31, 30], mouth: [14, 3, 5], burn: [29, 15, 11],
  hairHi: [31, 29, 18], hair: [27, 21, 8], hairDk: [17, 11, 4],
  gloveHi: [22, 28, 31], glove: [12, 20, 29], gloveDk: [5, 10, 19],
});
const B = makePalette('sam.B', {
  teeHi: [10, 24, 24], tee: [5, 17, 18], teeSh: [2, 10, 12],
  strapHi: [31, 29, 8], strap: [29, 21, 3], strapDk: [18, 11, 2],
  navyHi: [10, 12, 20], navy: [6, 7, 14], navyDk: [3, 3, 8],
  steelHi: [30, 30, 31], steel: [20, 21, 24], steelDk: [10, 11, 14],
  rubber: [4, 4, 5], lens: [7, 14, 20],
});
export const palettes = { sam: { A, B } };

const SQ = { squeegee: true };
const poses = {
  squeegeeTell: { extends: 'sweepTell', ...SQ, head: { at: [6, -98], face: 'strain', look: [2, 0] } },
  squeegee1: { extends: 'sweep1', ...SQ },
  squeegee2: { extends: 'sweep2', ...SQ },
  // taunt: polishes an imaginary window in little circles
  wipe1: {
    extends: 'idle1', ...SQ,
    head: { at: [1, -100], face: 'grin', look: [1, -1] },
    elR: [32, -84], fiR: [26, -106], gloveR: { angle: 10 },
  },
  wipe2: {
    extends: 'wipe1',
    elR: [34, -86], fiR: [34, -104], gloveR: { angle: 30 },
  },
};

export default {
  id: 'sam',
  build: 'medium',
  // his own body on the build: a wiry climber: long reach, tight waist, lean legs
  body: { shoulders: 1.04, legLen: 1.04, dims: { waistW: 14, belly: 2, forearm: [5.2, 4.4] } },
  palettes: { default: 'sam' },
  torsoMaterial: 'tee',
  sleeve: { material: 'tee', length: 0.5 },
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['white', 'steel', 'steelDk', 'navyDk'],
    tee: ['teeHi', 'tee', 'teeSh', 'navyDk'],
    shorts: ['navyHi', 'navy', 'navyDk'],
    sock: ['steelHi', 'steel', 'steelDk'],
    boot: ['strapDk', 'hairDk', 'outline'],
    sole: ['rubber', 'rubber', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    strap: ['strapHi', 'strap', 'strapDk'],
    steel: ['steelHi', 'steel', 'steelDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    ears(ctx, H, ramps.skin, [2.4, 3.4]);
    skull(ctx, H, ramps.skin, 'chin');
    stubble(ctx, fx, fy, 8, 12, 1);
    // shaggy blond hair, long at the back and over the ears
    const hr = ctx.mask().ellipse(x + lx * 0.3, y - 7, H.rx + 1.5, 7).cut(ctx.mask().rect(x - 16, y - 4, 32, 14));
    for (let i = -3; i <= 3; i++) hr.poly([[x + i * 3.2 - 2, y - 5], [x + i * 3.2 + 2, y - 5], [x + i * 3.6 + (i < 0 ? -1 : 1), y - 1 - (i & 1)]]);
    hr.rect(x - Math.round(H.rx) - 1, y - 6, 3, 9).rect(x + Math.round(H.rx) - 2, y - 6, 3, 9);
    cv.part(hr, { ramp: ramps.hair, bevel: 3, inner: 'line' });
    for (const [dx, dy] of [[-6, -9], [-2, -11], [3, -10], [7, -8]]) cv.shade(x + dx, y + dy, -1);
    // aviators pushed up into the hair
    const gy = y - 9 + (H.tilt === 'up' ? -1 : 0);
    for (const s of [-1, 1]) cv.flat(ctx.mask().ellipse(fx + s * 4.5 - (s > 0 ? 1 : 0), gy, 3.2, 2), c('lens'), true);
    cv.line(fx - 1, gy - 1, fx, gy - 1, (X, Y) => cv.px(X, Y, c('steel')));
    cv.px(fx - 6, gy - 1, c('white')); cv.px(fx + 3, gy - 1, c('white'));
    eyes(ctx, fx, fy, face === 'neutral' ? 'focus' : face, 0); // squinting into the sun
    brows(ctx, fx, fy, face, ramps.hair, { len: 4.4, thick: 1.1 });
    // sunburnt nose + cheeks
    nose(ctx, fx, fy, ['skinHi', 'burn', 'skinSh', 'skinDk'].map(c), [2.2, 2.3], 3.6);
    for (const s of [-1, 1]) { cv.px(fx + s * 6, fy + 3, c('burn')); cv.px(fx + s * 6 - s, fy + 3, c('burn')); }
    mouth(ctx, fx, fy + 8.5, face, { w: 3.8 });
  },

  torso(ctx) {
    const { cv, J, c, ramps, D } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, h = J.hip;
    const nx = Math.round(n[0]), ny = Math.round(n[1]);
    const tm = ctx.torsoMask;
    // harness: two shoulder straps, a chest strap and a D-ring
    const st = ctx.mask();
    for (const s of [-1, 1]) st.capsule(nx + s * 8, ny + 1, ch[0] + s * 10, w[1] - 1, 2, 2);
    st.rect(ch[0] - D.chestW, ch[1] - 2, D.chestW * 2, 3);
    cv.part(st.clip(tm), { ramp: ramps.strap, bevel: 1, inner: 'line', shadow: false });
    cv.part(ctx.mask().ellipse(ch[0], ch[1] - 1, 2.6, 2.6).cut(ctx.mask().ellipse(ch[0], ch[1] - 1, 1.2, 1.2)), { ramp: ramps.steel, bevel: 1, inner: 'line', shadow: false });
    // tool belt with pouches and the holstered squeegee handle
    const bl = ctx.mask().rect(w[0] - D.waistW - 2, w[1] - 2, D.waistW * 2 + 4, 4);
    cv.part(bl, { ramp: ramps.strap, bevel: 1, inner: 'line', shadow: false });
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, w[1] + 1, 7, 6).rect(w[0] + 4, w[1] + 1, 6, 5), { ramp: ['strapDk', 'hairDk', 'outline'].map(c), bevel: 1, inner: 'line' });
    cv.part(ctx.mask().rect(h[0] + D.waistW - 1, w[1] - 6, 2, 12), { ramp: ramps.steel, bevel: 1, inner: 'line', shadow: false });
    // leg straps of the harness over the shorts
    for (const s of [-1, 1]) cv.line(h[0] + s * 4, h[1] - 3, h[0] + s * 14, h[1] + 4, (X, Y) => { if (ctx.shortsMask.in(X, Y)) { cv.px(X, Y, c('strap')); cv.px(X, Y + 1, c('strapDk')); } });
  },

  front(ctx) {
    const { cv, J, c, pose, ramps } = ctx;
    if (!pose.squeegee) return;
    // the squeegee: a rubber-edged blade across the top of the viewer-right glove
    const [gx, gy] = [Math.round(J.fiR[0]), Math.round(J.fiR[1])];
    const vertical = pose.gloveR && Math.abs(pose.gloveR.angle || 0) > 60;
    const blade = vertical ? ctx.mask().rect(gx - 12, gy - 2, 24, 3) : ctx.mask().rect(gx - 14, gy - 12, 28, 3);
    cv.part(blade, { ramp: ramps.steel, bevel: 1, inner: 'line' });
    const edge = vertical ? ctx.mask().rect(gx - 12, gy + 1, 24, 1) : ctx.mask().rect(gx - 14, gy - 13, 28, 1);
    cv.flat(edge, c('rubber'));
    if (!vertical) cv.part(ctx.mask().rect(gx - 1, gy - 10, 3, 5), { ramp: ramps.strap, bevel: 1, inner: 'line', shadow: false });
  },
};
