// Pidge: sprite layers on the lean build.
// A city-park regular who has spent too long with the pigeons: a slate-grey
// pompadour with a white streak, beady orange eyes, a long pointed nose, an
// iridescent green-and-violet neck scarf, a grey track jacket, pale grey trunks
// with two dark wing bars, coral socks and shoes, slate-blue gloves. His idle
// is a head-bob (bob1 = peck forward on the beat, bob2 = head up on the off-beat).

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull } from './_face.js';

const A = makePalette('pidge.A', {
  outline: [3, 2, 5],
  skinHi: [30, 25, 21], skin: [26, 19, 15], skinSh: [19, 13, 11], skinDk: [11, 7, 8],
  white: [31, 31, 31], mouth: [13, 3, 6],
  iris: [31, 16, 3],
  hairHi: [13, 12, 20], hair: [6, 6, 11], hairDk: [2, 2, 5],
  gloveHi: [18, 22, 29], glove: [10, 13, 22], gloveDk: [5, 6, 13],
});
const B = makePalette('pidge.B', {
  jacketHi: [22, 23, 26], jacket: [15, 16, 20], jacketSh: [9, 10, 14],
  sheenG: [6, 22, 14], sheenGd: [3, 12, 9], sheenV: [18, 8, 22], sheenVd: [9, 4, 13],
  trunkHi: [28, 28, 30], trunk: [22, 22, 26], trunkSh: [15, 15, 19], bar: [6, 6, 9],
  coralHi: [31, 20, 18], coral: [28, 10, 11], coralDk: [16, 4, 7],
});
export const palettes = { pidge: { A, B } };

const poses = {
  // the bob: forward and down on the beat, up and back on the off-beat
  bob1: {
    extends: 'idle1', shift: [0, 1],
    head: { at: [0, -95], face: 'focus', look: [0, 2] },
    neck: [0, -85], fiL: [-11, -70], fiR: [11, -70],
  },
  bob2: {
    extends: 'idle1', shift: [0, -1],
    head: { at: [0, -103], face: 'neutral', look: [0, -1] },
    neck: [0, -89],
  },
  // taunt: chest puffed, arms back like folded wings, cooing
  coo: {
    extends: 'idle1', shift: [0, 0],
    head: { at: [0, -103], face: 'grin', tilt: 'up', look: [0, -2] },
    chest: [0, -74], shL: [-21, -83], shR: [21, -83],
    elL: [-33, -70], elR: [33, -70], fiL: [-38, -54], fiR: [38, -54],
    gloveL: { angle: -160 }, gloveR: { angle: 160 },
    puff: true,
  },
  strut: {
    extends: 'coo',
    head: { at: [2, -101], face: 'grin', look: [1, 0] },
  },
};

export default {
  id: 'pidge',
  build: 'lean',
  // his own body on the build: hunched and bony, with a long pigeon neck
  body: { legLen: 0.98, torsoLen: 0.94, shoulders: 0.88, neckLen: 3, dims: { neck: 3.8, chestW: 15.5 } },
  palettes: { default: 'pidge' },
  torsoMaterial: 'jacket',
  sleeve: { material: 'jacket', length: 0.8 },
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['trunkHi', 'trunk', 'trunkSh', 'gloveDk'],
    jacket: ['jacketHi', 'jacket', 'jacketSh', 'outline'],
    shorts: ['trunkHi', 'trunk', 'trunkSh'],
    sock: ['coralHi', 'coral', 'coralDk'],
    boot: ['coralHi', 'coral', 'coralDk'],
    sole: ['trunk', 'trunkSh', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    sheen: ['sheenG', 'sheenG', 'sheenGd', 'sheenVd'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    ears(ctx, H, ramps.skin, [2, 3]);
    const hm = skull(ctx, H, ramps.skin, 'narrow');
    // beady eyes: small, round, orange irises
    if (['neutral', 'focus', 'grin', 'strain'].includes(face)) {
      for (const s of [-1, 1]) {
        const ex = fx + s * 4 - (s > 0 ? 1 : 0), ey = fy - 1 + (face === 'focus' ? 1 : 0);
        cv.stamp(['.ooo.', 'owiio', 'oiipo', '.ooo.'], ex - 2, ey - 1, { o: c('outline'), w: c('white'), i: c('iris'), p: c('outline') });
      }
    } else eyes(ctx, fx, fy, face, -3);
    brows(ctx, fx, fy, face, ramps.hair, { len: 3.4, thick: 0.9, gap: -1, y: -4.5 });
    // long pointed nose
    const nm = ctx.mask().capsule(fx, fy, fx + lx * 0.4, fy + 6 + ly * 0.5, 1.6, 1.1).ellipse(fx, fy + 4, 2, 2);
    cv.part(nm, { ramp: ramps.skin, bevel: 2, inner: 'soft' });
    cv.px(fx + Math.round(lx * 0.4), fy + 7 + Math.round(ly * 0.5), c('skinDk'));
    mouth(ctx, fx, fy + 9, face, { w: 2.6 });
    // pompadour: swept up and forward, with a white streak
    // faded sides: stippled stubble at the temples
    for (let j = -10; j <= -5; j++) for (let i = -12; i <= 12; i++) if (Math.abs(i) > 5 && hm.in(x + i, y + j) && (i + j) % 2 === 0) cv.shade(x + i, y + j, 2);
    // the pompadour: a tall roll on top, curling forward
    const qx = x + 1 + lx * 0.6;
    const hr = ctx.mask().ellipse(x + lx * 0.3, y - 9, H.rx - 3, 4.5).cut(ctx.mask().rect(x - 14, y - 6, 28, 12));
    hr.ellipse(qx, y - 15, 8, 5.5).ellipse(qx - 2, y - 11, 6.5, 3);
    cv.part(hr, { ramp: ramps.hair, bevel: 3, inner: 'line' });
    cv.line(qx - 7, y - 12, qx + 5, y - 11, (X, Y) => { if (hr.in(X, Y)) cv.shade(X, Y, 1); });   // the curl's crease
    cv.line(qx - 5, y - 18, qx + 6, y - 15, (X, Y) => { if (hr.in(X, Y)) { cv.px(X, Y, c('white')); cv.px(X, Y + 1, c('hairHi')); } });
    cv.px(qx - 7, y - 11, c('hairHi')); cv.px(qx - 6, y - 12, c('hairHi'));
    for (let i = -6; i <= 6; i++) if (hm.in(fx + i, y - 4)) cv.shade(fx + i, y - 4, 1);
  },

  torso(ctx) {
    const { cv, J, c, ramps, D, pose } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, h = J.hip;
    const nx = Math.round(n[0]), ny = Math.round(n[1]);
    // zip line, pocket seams, a stripe down each side
    cv.line(w[0], ny + 5, w[0], w[1], (X, Y) => { if (ctx.torsoMask.in(X, Y)) cv.px(X, Y, c('jacketSh')); });
    cv.px(w[0], ny + 7, c('trunkHi')); cv.px(w[0] + 1, ny + 7, c('trunkHi'));
    for (const s of [-1, 1]) cv.line(ch[0] + s * (D.chestW - 3), ch[1] - 4, w[0] + s * (D.waistW - 1), w[1] - 2, (X, Y) => { if (ctx.torsoMask.in(X, Y)) cv.px(X, Y, c('trunkHi')); });
    // iridescent scarf: green on top, violet shading underneath
    const sc = ctx.mask().ellipse(nx, ny + 2, 8 + (pose.puff ? 2 : 0), 4 + (pose.puff ? 1 : 0)).poly([[nx + 1, ny + 3], [nx + 6, ny + 13], [nx + 3, ny + 14]]);
    cv.part(sc, { ramp: ramps.sheen, bevel: 2, inner: 'line' });
    for (let j = -3; j <= 15; j++) for (let i = -10; i <= 10; i++) if (sc.in(nx + i, ny + j) && (i + j) % 3 === 0 && j > 1) cv.px(nx + i, ny + j, c((i + j) % 2 ? 'sheenV' : 'sheenGd'));
    // wing bars on the trunks
    const sm = ctx.shortsMask;
    for (const dy of [4, 7]) for (let i = -D.waistW - 8; i <= D.waistW + 8; i++) {
      const X = Math.round(h[0] + i), Y = Math.round(h[1] + dy - Math.abs(i) * 0.12);
      if (sm.in(X, Y) && Math.abs(i) > 3) cv.px(X, Y, c('bar'));
    }
  },
};
