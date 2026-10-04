// Lark (#52): sprite layers on the lean build.
// The Pantheon's herald: a bright young face under a curly gold fringe and a herald's
// cap with a tall red feather, a blue tabard with a gold sun and gold piping, a
// brass trumpet on a strap at her hip, white gloves, cream boots with gold tops.
// Poses: blow (the trumpet at her lips: the taunt and the notes' tells) and the
// note poses jabTell/jab etc. from the shared set.

import { makePalette } from '../../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from '../_face.js';

const A = makePalette('lark.A', {
  outline: [2, 2, 5],
  skinHi: [30, 23, 18], skin: [26, 17, 12], skinSh: [18, 10, 8], skinDk: [10, 5, 4],
  white: [31, 31, 30], mouth: [12, 3, 5],
  hairHi: [31, 29, 15], hair: [27, 21, 7], hairDk: [16, 11, 3],
  gloveHi: [31, 31, 31], glove: [26, 27, 30], gloveDk: [15, 16, 22],
});
const B = makePalette('lark.B', {
  tabHi: [13, 19, 31], tab: [6, 10, 26], tabSh: [3, 5, 16],
  goldHi: [31, 30, 16], gold: [29, 22, 4], goldSh: [18, 11, 2],
  feaHi: [31, 15, 12], fea: [27, 6, 7], feaDk: [14, 2, 4],
  brassHi: [31, 30, 18], brass: [29, 23, 5], brassDk: [17, 11, 2],
  bootHi: [31, 29, 24], boot: [24, 20, 15],
});
export const palettes = { lark: { A, B } };

const poses = {
  // the trumpet at her lips, elbow out: the fanfare (her taunt, and the tell of every note)
  blow: {
    extends: 'idle1', shift: [1, 0],
    head: { at: [2, -101], face: 'strain', tilt: 'up', look: [1, -1] },
    shR: [21, -81], elR: [30, -84], fiR: [12, -95], gloveR: { angle: -60 },
    shL: [-19, -81], elL: [-24, -60], fiL: [-9, -71],
    horn: 'lips',
  },
};

export default {
  id: 'lark',
  build: 'lean',
  // her own body on the build: light and upright, a herald's long neck and straight back
  body: { size: [0.98, 1.02], legLen: 1.03, torsoLen: 1.0, shoulders: 0.98, neckLen: 1.5, dims: { waistW: 11.5, upperArm: [4.6, 3.8] } },
  palettes: { default: 'lark' },
  torsoMaterial: 'tab',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['goldHi', 'gold', 'goldSh'],
    tab: ['tabHi', 'tab', 'tabSh', 'outline'],
    shorts: ['tabHi', 'tab', 'tabSh'],
    sock: ['bootHi', 'boot', 'goldSh'],
    boot: ['bootHi', 'boot', 'goldSh'],
    sole: ['gold', 'goldSh', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    gold: ['goldHi', 'gold', 'goldSh'],
    feather: ['feaHi', 'fea', 'feaDk'],
    brass: ['brassHi', 'brass', 'brassDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';
    ears(ctx, H, ramps.skin, [1.9, 2.8]);
    const hm = skull(ctx, H, ramps.skin, 'narrow');
    // a curly gold fringe under the cap and curls at the sides
    const hair = ctx.mask().ellipse(x + lx * 0.3, y - 4, H.rx + 0.6, 6).cut(ctx.mask().rect(x - 20, y - 1, 40, 20));
    for (const s of [-1, 1]) for (const dy of [-1, 3, 7]) hair.ellipse(x + s * (H.rx - 0.5) + lx * 0.3, y + dy, 2.3, 2.6);
    for (let i = -3; i <= 3; i++) hair.ellipse(fx + i * 2.6, y - 3 + (i & 1), 1.8, 2);
    cv.part(hair, { ramp: ramps.hair, bevel: 2, inner: 'line' });
    // the herald's cap: a blue dome with a gold band, and the red feather
    const cap = ctx.mask().ellipse(x + lx * 0.4, y - 8, H.rx + 0.2, 6).cut(ctx.mask().rect(x - 20, y - 5, 40, 20));
    cv.part(cap, { ramp: ['tabHi', 'tab', 'tabSh'].map(c), bevel: 4, inner: 'line' });
    cv.part(ctx.mask().rect(x - H.rx + lx * 0.4, y - 6.5, H.rx * 2, 2), { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
    const fea = ctx.mask().poly([[x + 5 + lx * 0.4, y - 10], [x + 9 + lx * 0.4, y - 19], [x + 13 + lx * 0.4, y - 26], [x + 15 + lx * 0.4, y - 22], [x + 11 + lx * 0.4, y - 12]]);
    cv.part(fea, { ramp: ramps.feather, bevel: 2, inner: 'line' });
    cv.line(x + 7 + lx * 0.4, y - 11, x + 13 + lx * 0.4, y - 24, (X, Y) => cv.shade(X, Y, 1));
    cv.px(x + 4 + lx * 0.4, y - 9, c('goldHi'));
    // a bright open face: big eyes, arched brows, a small nose, a ready smile
    eyes(ctx, fx, fy, face === 'neutral' ? 'wide' : face, 0);
    brows(ctx, fx, fy, face, ramps.hair, { len: 3.8, thick: 0.8, y: -4.2 });
    nose(ctx, fx, fy, ramps.skin, [1.5, 1.7], 3.2);
    mouth(ctx, fx, fy + 8, face === 'neutral' ? 'smile' : face, { w: 3 });
    for (const s of [-1, 1]) cv.px(fx + s * 6, fy + 4, c('skinHi'));
    ctx.headMask = hm;
  },

  torso(ctx) {
    const { cv, J, c, ramps, D, pose } = ctx;
    if (pose.lying) return;
    const n = J.neck, w = J.waist, ch = J.chest, tm = ctx.torsoMask;
    // the tabard: a blue front panel hanging over the chest with a gold sun and piping
    const tab = ctx.mask().poly([[n[0] - 8, n[1] + 1], [n[0] + 8, n[1] + 1], [ch[0] + 11, ch[1] + 4], [w[0] + 10, w[1] + 6], [w[0] - 10, w[1] + 6], [ch[0] - 11, ch[1] + 4]]).clip(ctx.mask().add(tm).add(ctx.shortsMask));
    cv.part(tab, { ramp: ramps.tab, bevel: 4, inner: 'line' });
    for (const s of [-1, 1]) cv.line(n[0] + s * 8, n[1] + 2, w[0] + s * 10, w[1] + 5, (X, Y) => cv.px(X, Y, c('gold')));
    const sx = Math.round(ch[0]), sy = Math.round(ch[1] + 2);
    cv.part(ctx.mask().ellipse(sx, sy, 3.6, 3.2), { ramp: ramps.gold, bevel: 2, inner: 'line', shadow: false });
    for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; cv.px(sx + Math.cos(a) * 5.8, sy + Math.sin(a) * 5.2, c('gold')); }
    // a gold-piped belt, and the trumpet's strap across the chest
    const by = Math.round(w[1] + 1);
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, by - 1, D.waistW * 2 + 2, 3).clip(ctx.mask().add(tm).add(ctx.shortsMask)), { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
    cv.line(J.shL[0] + 3, J.shL[1] + 2, w[0] + 12, w[1] + 2, (X, Y) => { cv.px(X, Y, c('brassDk')); cv.px(X, Y + 1, c('brass')); });
  },

  // the trumpet: on its strap at the right hip (or up at her lips in `blow`)
  front(ctx) {
    const { cv, J, c, ramps, pose } = ctx;
    if (pose.lying) return;
    const brass = ramps.brass;
    if (pose.horn === 'lips') {
      const h = J.head, fi = J.fiR;
      // the horn points out to the viewer's right, flaring into a bell
      cv.part(ctx.mask().capsule(h[0] + 3, h[1] + 6, fi[0] + 16, fi[1] - 2, 1.6, 1.6), { ramp: brass, bevel: 1, inner: 'line', shadow: false });
      cv.part(ctx.mask().poly([[fi[0] + 14, fi[1] - 5], [fi[0] + 24, fi[1] - 9], [fi[0] + 24, fi[1] + 5], [fi[0] + 14, fi[1] + 1]]), { ramp: brass, bevel: 2, inner: 'line' });
      cv.px(fi[0] + 19, fi[1] - 4, c('brassHi'));
      return;
    }
    const w = J.waist, hx = w[0] + 14, hy = w[1] + 4;
    cv.part(ctx.mask().capsule(hx - 4, hy - 4, hx + 6, hy + 8, 1.7, 1.7), { ramp: brass, bevel: 1, inner: 'line', shadow: false });
    cv.part(ctx.mask().poly([[hx + 4, hy + 5], [hx + 10, hy + 2], [hx + 12, hy + 12], [hx + 5, hy + 12]]), { ramp: brass, bevel: 2, inner: 'line' });
    cv.px(hx + 8, hy + 5, c('brassHi'));
  },
};
