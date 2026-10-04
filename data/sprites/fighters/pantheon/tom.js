// "Iron" Tom Hadley (#59): sprite layers on the medium build, in sepia: every colour is
// a brown or a cream, like a photograph from the 1890s.
// A bare-knuckle brawler: a thick handlebar moustache, a side-parted head of hair and
// mutton-chop sideburns, a broad bare chest, wide leather braces buttoned to
// high-waisted striped tights, laced leather boots, knuckles wrapped in cloth (no
// gloves). Poses: stand1/2 (the upright old prizefighter's stance, fists high and out
// in front: the idle) and squareUp (the taunt: rolling his shoulders, fists up).

import { makePalette } from '../../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from '../_face.js';

const A = makePalette('tom.A', {
  outline: [4, 2, 2],
  skinHi: [28, 22, 15], skin: [23, 17, 10], skinSh: [16, 11, 6], skinDk: [9, 6, 3],
  white: [30, 27, 20], mouth: [9, 4, 3],
  hairHi: [15, 10, 6], hair: [8, 5, 3], hairDk: [3, 2, 1],
  gloveHi: [30, 27, 21], glove: [25, 21, 14], gloveDk: [15, 12, 8],
});
const B = makePalette('tom.B', {
  stripeHi: [27, 23, 16], stripe: [20, 15, 9], stripeSh: [12, 9, 5],
  creamHi: [30, 27, 20], cream: [25, 21, 14],
  braceHi: [13, 8, 4], brace: [7, 4, 2],
  bootHi: [15, 9, 5], boot: [9, 5, 3], bootDk: [4, 2, 1],
  buckle: [29, 24, 14],
});
export const palettes = { tom: { A, B } };

const FEET = { knL: [-13, -22], knR: [13, -22], ftL: [-16, 0], ftR: [16, 0] };
const poses = {
  // the old prizefighter's stance: upright, left fist out front at chin height, right one cocked back
  stand1: {
    extends: 'idle1', shift: [1, 0], ...FEET,
    head: { at: [2, -101], face: 'focus', look: [1, 0] },
    shL: [-19, -82], elL: [-28, -74], fiL: [-24, -90], gloveL: { angle: 5 },
    shR: [21, -81], elR: [28, -66], fiR: [14, -80], gloveR: { angle: -30 },
  },
  stand2: { extends: 'stand1', shift: [0, 1], ...FEET, fiL: [-24, -88], fiR: [14, -78] },
  // rolling the shoulders, fists up: the taunt
  squareUp: {
    extends: 'stand1', ...FEET,
    head: { at: [1, -101], face: 'grin', look: [0, 0] },
    elL: [-30, -80], fiL: [-26, -98], elR: [30, -80], fiR: [26, -98], gloveL: { angle: 15 }, gloveR: { angle: -15 },
  },
};

export default {
  id: 'tom',
  build: 'medium',
  // his own body: a barrel of a man, thick arms and neck, short legs
  body: { size: [1.03, 0.98], legLen: 0.95, torsoLen: 1.02, shoulders: 1.06, neckLen: -1, dims: { neck: 7, chestW: 22, waistW: 18, belly: 5, upperArm: [6.6, 5.6], forearm: [5.6, 4.7] } },
  palettes: { default: 'tom' },
  torsoMaterial: 'skin',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['creamHi', 'cream', 'gloveDk'],
    shorts: ['stripeHi', 'stripe', 'stripeSh'],
    sock: ['creamHi', 'cream', 'stripe'],
    boot: ['bootHi', 'boot', 'bootDk'],
    sole: ['boot', 'bootDk', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    brace: ['braceHi', 'brace', 'outline'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';
    ears(ctx, H, ramps.skin, [2.4, 3.4]);
    const hm = skull(ctx, H, ramps.skin, 'square');
    // side-parted hair, oiled flat, and thick mutton chops
    const hair = ctx.mask().ellipse(x + lx * 0.3, y - 5, H.rx + 0.4, 7).cut(ctx.mask().rect(x - 20, y - 1.5, 40, 20));
    for (const s of [-1, 1]) hair.rect(x + s * (H.rx - 2) - 1 + lx * 0.3, y - 2, 3, 12);
    cv.part(hair, { ramp: ramps.hair, bevel: 2, inner: 'line' });
    cv.line(x - 3 + lx * 0.3, y - 11, x - 6 + lx * 0.3, y - 3, (X, Y) => cv.shade(X, Y, 2)); // the parting
    for (const i of [-6, -3, 2, 5]) cv.px(x + i + lx * 0.3, y - 8, c('hairHi'));
    eyes(ctx, fx, fy, face === 'neutral' ? 'focus' : face, 0);
    brows(ctx, fx, fy, face, ramps.hair, { len: 4.6, thick: 1.3, y: -3.4 });
    nose(ctx, fx, fy, ramps.skin, [2.4, 2.4], 3.6);
    // the moustache: a big handlebar, waxed up at the tips
    const mu = ctx.mask().ellipse(fx - 3.6, fy + 6.6, 4.6, 2.1, 1, -0.3).ellipse(fx + 3.6, fy + 6.6, 4.6, 2.1, 1, 0.3).ellipse(fx, fy + 6, 3, 1.7);
    mu.poly([[fx - 8, fy + 6], [fx - 10.5, fy + 2.5], [fx - 8.5, fy + 7.5]]).poly([[fx + 8, fy + 6], [fx + 10.5, fy + 2.5], [fx + 8.5, fy + 7.5]]);
    cv.part(mu, { ramp: ramps.hair, bevel: 2, inner: 'line' });
    const m = mouth(ctx, fx, fy + 9.6, face === 'grin' ? 'smile' : face === 'neutral' ? 'neutral' : face, { w: 3 });
    if (m == null) for (let i = -2; i <= 1; i++) cv.px(fx + i, fy + 10, c('outline'));
    ctx.headMask = hm;
  },

  torso(ctx) {
    const { cv, J, c, ramps, D, pose } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, tm = ctx.torsoMask;
    // a hairy chest
    for (let j = -5; j <= 14; j++) for (let i = -8; i <= 8; i++) if ((i * 7 + j * 5) % 9 === 0 && Math.abs(i) <= 8 - Math.abs(j - 3) / 3) cv.shade(ch[0] + i, ch[1] + j, 1);
    for (const s of [-1, 1]) cv.line(ch[0] + s * 3, ch[1] + 2, ch[0] + s * 16, ch[1] + 1, (X, Y) => cv.shade(X, Y, 1));
    if (pose.lying) return;
    // high-waisted striped tights up over the belly, with braces from the shoulders
    const by = Math.round(w[1] - 5);
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, by, D.waistW * 2 + 2, 9).clip(ctx.mask().add(tm).add(ctx.shortsMask)), { ramp: ramps.shorts, bevel: 2, inner: 'line', shadow: false });
    for (const s of [-1, 1]) {
      cv.line(J['sh' + (s < 0 ? 'L' : 'R')][0] + s * -3, J.neck[1] + 3, w[0] + s * 10, by + 1, (X, Y) => { cv.px(X, Y, c('brace')); cv.px(X + 1, Y, c('braceHi')); cv.px(X - 1, Y, c('brace')); });
      cv.px(w[0] + s * 10, by + 2, c('buckle')); cv.px(w[0] + s * 10, by + 3, c('buckle'));
    }
    // vertical stripes over the whole trunk
    const sm = ctx.shortsMask;
    for (let X = Math.round(w[0] - D.waistW - 2); X < w[0] + D.waistW + 2; X += 4) for (let Y = by; Y < J.hip[1] + 14; Y++) if (sm.in(X, Y) && (Y > by + 8 || Y < by + 8)) cv.px(X, Y, c('cream'));
    // a knotted sash at the waist
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, w[1] - 1, D.waistW * 2 + 2, 3).clip(ctx.mask().add(tm).add(sm)), { ramp: ['creamHi', 'cream', 'stripe'].map(c), bevel: 1, inner: 'line', shadow: false });
  },
};
