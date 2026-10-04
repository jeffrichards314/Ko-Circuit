// Nimbus (#56): sprite layers on the giant build.
// A cloud giant: he is made of cloud, white on top going to slate-grey underneath, soft
// puffs for shoulders and a beard, a small hard face (dark eyes, a heavy brow, a mouth
// like a crack) in the middle of it, grey cloud gloves, a belt with a yellow lightning
// buckle and storm-grey trunks. There is a bolt of lightning tucked in his belt.
// Poses: rain (he crouches and pours: the open step that exposes his head).

import { makePalette } from '../../../../src/engine/palette.js';
import { eyes, mouth, ears, skull } from '../_face.js';

const A = makePalette('nimbus.A', {
  outline: [4, 5, 10],
  skinHi: [31, 31, 31], skin: [26, 28, 31], skinSh: [17, 20, 27], skinDk: [9, 11, 18],
  white: [31, 31, 31], mouth: [5, 5, 11],
  hairHi: [31, 31, 31], hair: [27, 29, 31], hairDk: [17, 20, 27],
  gloveHi: [27, 29, 31], glove: [18, 21, 27], gloveDk: [10, 12, 19],
});
const B = makePalette('nimbus.B', {
  trunkHi: [15, 17, 23], trunk: [9, 10, 16], trunkDk: [4, 5, 10],
  boltHi: [31, 31, 20], bolt: [31, 27, 6], boltDk: [24, 15, 2],
  eye: [8, 12, 22], eyeHi: [16, 24, 31],
  drip: [13, 20, 31],
});
export const palettes = { nimbus: { A, B } };

const poses = {
  // pours: hunched over, cloud arms hanging, rain from the whole of him
  rain: {
    extends: 'crouchTell', shift: [0, 2],
    head: { at: [0, -90], face: 'strain', tilt: 'down', look: [0, 2] },
    elL: [-30, -50], elR: [30, -50], fiL: [-26, -36], fiR: [26, -36],
    gloveL: { angle: 170 }, gloveR: { angle: -170 },
  },
};

export default {
  id: 'nimbus',
  build: 'giant',
  // his own body: huge and round, shoulders like banks of cloud, no neck
  body: { size: [1.0, 1.0], legLen: 0.9, torsoLen: 1.06, shoulders: 1.12, neckLen: -2, dims: { neck: 10, chestW: 32, waistW: 26, belly: 12, deltoid: 12 } },
  palettes: { default: 'nimbus' },
  torsoMaterial: 'skin',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['skinHi', 'skin', 'skinSh'],
    shorts: ['trunkHi', 'trunk', 'trunkDk'],
    sock: ['skinSh', 'skinDk', 'outline'],
    boot: ['gloveHi', 'glove', 'gloveDk'],
    sole: ['skinDk', 'outline', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    bolt: ['boltHi', 'bolt', 'boltDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';
    const hm = skull(ctx, H, ramps.skin, 'square');
    // cloud for hair and beard: overlapping puffs, lit from above
    const puffs = ctx.mask();
    for (const [dx, dy, r] of [[-9, -8, 6], [-3, -12, 7], [4, -12, 7], [10, -8, 6], [0, -6, 8], [-13, -1, 4.5], [13, -1, 4.5]]) puffs.ellipse(x + dx + lx * 0.3, y + dy, r, r * 0.85);
    puffs.cut(ctx.mask().ellipse(fx, fy + 3, H.rx - 2.5, 8.5));
    cv.part(puffs, { ramp: ramps.hair, bevel: 3, inner: 'line' });
    const beard = ctx.mask();
    for (const [dx, dy, r] of [[-9, 8, 5], [-4, 12, 5.5], [3, 13, 5.5], [9, 8, 5], [0, 9, 6]]) beard.ellipse(fx + dx, fy + dy, r, r * 0.8);
    beard.cut(ctx.mask().ellipse(fx, fy + 5.5, 4.4, 2));
    cv.part(beard, { ramp: ramps.hair, bevel: 3, inner: 'line' });
    // a small hard face: dark eyes, a heavy brow, a crack of a mouth
    eyes(ctx, fx, fy, face === 'neutral' ? 'focus' : face, 1);
    cv.part(ctx.mask().capsule(fx - 8, fy - 3, fx - 1, fy - 2, 1.6, 1.4).capsule(fx + 1, fy - 2, fx + 8, fy - 3, 1.4, 1.6), { ramp: ramps.hair, bevel: 1, inner: 'soft' });
    const m = mouth(ctx, fx, fy + 6, face === 'neutral' ? 'neutral' : face, { w: 3 });
    if (m == null) for (let i = -3; i <= 3; i++) cv.px(fx + i, fy + 6 + (i & 1), c('outline'));
    ctx.headMask = hm;
  },

  torso(ctx) {
    const { cv, J, c, ramps, D, pose } = ctx;
    if (pose.lying) return;
    const n = J.neck, w = J.waist, ch = J.chest, tm = ctx.torsoMask;
    // the cloud texture: puffs along the shoulders and belly, dithered shade under each
    for (const s of ['L', 'R']) {
      const sh = J['sh' + s], sign = s === 'L' ? -1 : 1;
      cv.part(ctx.mask().ellipse(sh[0] + sign * 2, sh[1] - 1, D.deltoid + 2, D.deltoid), { ramp: ramps.skin, bevel: 6, inner: 'line' });
      cv.part(ctx.mask().ellipse(sh[0] + sign * 6, sh[1] + 3, 5, 4), { ramp: ramps.skin, bevel: 3, inner: 'line', shadow: false });
    }
    for (let j = -8; j < 22; j += 5) for (let i = -D.chestW + 4; i < D.chestW - 3; i += 8) {
      const cx = ch[0] + i + (j & 1 ? 4 : 0), cy = ch[1] + j;
      if (tm.in(cx, cy)) { cv.part(ctx.mask().ellipse(cx, cy, 4.5, 3.4).clip(tm), { ramp: ramps.skin, bevel: 3, inner: 'soft', shadow: false }); }
    }
    // a belt with a lightning buckle, and a bolt tucked in it
    const by = Math.round(w[1] - 1);
    cv.part(ctx.mask().rect(w[0] - D.waistW - 1, by - 2, D.waistW * 2 + 2, 5).clip(ctx.mask().add(tm).add(ctx.shortsMask)), { ramp: ramps.shorts, bevel: 1, inner: 'line', shadow: false });
    cv.part(ctx.mask().poly([[w[0] - 3, by - 4], [w[0] + 4, by - 4], [w[0] + 1, by + 1], [w[0] + 5, by + 1], [w[0] - 3, by + 8], [w[0] - 1, by + 2], [w[0] - 5, by + 2]]), { ramp: ramps.bolt, bevel: 1, inner: 'line', shadow: false });
  },
};
