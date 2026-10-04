// The Mirror: sprite layers on the medium build, silver palette.
// A figure of polished chrome with no face of his own: a smooth bald head,
// glowing cyan slits for eyes, no brows, a flat faceted nose and a thin line
// of a mouth. Mirror-shard facets across the chest (cyan glints on the cuts),
// dark chrome trunks with a mirror stripe, chrome gloves and boots.
// Poses: tapping on the glass (rewindTell), the reflections of your slips and
// duck, and your star-punch windup played back (starTell).

import { makePalette } from '../../../src/engine/palette.js';
import { ears, skull } from './_face.js';

const A = makePalette('mirror.A', {
  outline: [2, 3, 6],
  skinHi: [29, 30, 31], skin: [19, 21, 25], skinSh: [12, 14, 19], skinDk: [6, 7, 11],
  white: [31, 31, 31], glint: [24, 31, 31], eye: [12, 30, 31], eyeDk: [4, 16, 22],
  mouth: [4, 6, 10],
  gloveHi: [31, 31, 31], glove: [27, 29, 31], gloveDk: [15, 18, 24],
});
const B = makePalette('mirror.B', {
  trunkHi: [12, 14, 19], trunk: [6, 7, 11], trunkDk: [3, 3, 6],
  shard: [16, 28, 31], shardDk: [8, 16, 22],
  bootHi: [28, 29, 31], boot: [18, 20, 24], bootDk: [9, 10, 14],
});
export const palettes = { mirror: { A, B } };

const poses = {
  // tap tap: left palm flat on the glass, right glove tapping it
  rewindTell1: {
    extends: 'idle1',
    head: { at: [0, -100], face: 'neutral', look: [0, 0] },
    elL: [-30, -80], fiL: [-26, -99], gloveL: { angle: 0, view: 'back' },
    elR: [24, -70], fiR: [4, -88], gloveR: { angle: -70 },
  },
  rewindTell2: {
    extends: 'rewindTell1',
    elR: [25, -72], fiR: [8, -94], gloveR: { angle: -40 },
  },
  // your slips and your duck, reflected
  slipL: {
    extends: 'idle1', shift: [-8, 2],
    knL: [-17, -21], knR: [9, -23], ftL: [-16, 0], ftR: [16, 0],
    hip: [-4, -42], waist: [-8, -53], chest: [-12, -70], neck: [-17, -84],
    head: { at: [-22, -95], face: 'focus', look: [-2, 0] },
    shL: [-32, -76], shR: [8, -80], elL: [-38, -58], fiL: [-28, -74], elR: [14, -60], fiR: [-4, -74],
  },
  slipR: { mirror: 'slipL' },
  duckM: {
    extends: 'idle1', shift: [0, 16],
    knL: [-18, -14], knR: [18, -14], ftL: [-17, 0], ftR: [17, 0],
    head: { at: [0, -80], face: 'focus', look: [0, 1] },
    elL: [-20, -50], elR: [20, -50], fiL: [-8, -64], fiR: [8, -64],
  },
  // your star-punch windup: dipped low, right glove drawn way back
  starTell: {
    extends: 'upperTell', shift: [2, 3],
    head: { at: [4, -92], face: 'strain', look: [1, 1] },
    elR: [34, -54], fiR: [36, -36], gloveR: { angle: 200 },
  },
  // taunt: both palms pressed against the glass
  glassPalm1: {
    extends: 'idle1',
    head: { at: [0, -100], face: 'neutral', look: [0, 0] },
    elL: [-24, -76], fiL: [-16, -94], gloveL: { angle: -8, view: 'back' },
    elR: [24, -76], fiR: [16, -94], gloveR: { angle: 8, view: 'back' },
  },
  glassPalm2: { extends: 'glassPalm1', shift: [0, 1], fiL: [-15, -93], fiR: [15, -93] },
};

// Eye slits by face: [dy, width, height]
const SLIT = { neutral: [0, 5, 1], focus: [0, 5, 1], strain: [0, 5, 2], wide: [-1, 5, 2], grin: [0, 4, 1], hurt: [0, 3, 1], dazed: [1, 4, 1], ko: [0, 0, 0] };

export default {
  id: 'mirror',
  build: 'medium',
  // his own body on the build: a statue: ideal proportions, nothing out of place
  body: { shoulders: 1.04, legLen: 1.02, dims: { waistW: 14, belly: 2 } },
  palettes: { default: 'mirror' },
  torsoMaterial: 'skin',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['shard', 'shard', 'shardDk'],
    shorts: ['trunkHi', 'trunk', 'trunkDk'],
    sock: ['bootHi', 'boot', 'bootDk'],
    boot: ['bootHi', 'boot', 'bootDk'],
    sole: ['bootDk', 'outline', 'outline'],
    shard: ['shard', 'shard', 'shardDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    ears(ctx, H, ramps.skin, [1.8, 3]);
    const hm = skull(ctx, H, ramps.skin, 'round');
    // a hard chrome shine across the dome
    for (let k = 0; k < 5; k++) cv.px(x - 6 + k + lx, y - 9 - (k >> 1), c(k === 2 ? 'white' : 'glint'));
    // eyes: glowing slits (an X when he's knocked out)
    const [dy, w, hgt] = SLIT[face] || SLIT.neutral;
    for (const s of [-1, 1]) {
      const ex = fx + s * 5 - (s > 0 ? 0 : w - 1) + (s > 0 ? 0 : 0);
      if (face === 'ko') {
        const X = fx + s * 5 - (s < 0 ? 2 : 0);
        for (let k = 0; k < 3; k++) { cv.px(X + k, fy - 1 + k, c('eyeDk')); cv.px(X + 2 - k, fy - 1 + k, c('eyeDk')); }
        continue;
      }
      for (let i = -1; i <= w; i++) cv.px(ex + i, fy + dy - 1, c('outline'));
      for (let j = 0; j < hgt; j++) for (let i = 0; i < w; i++) cv.px(ex + i, fy + dy + j, c(i === (s > 0 ? 1 : w - 2) ? 'white' : 'eye'));
      for (let i = -1; i <= w; i++) cv.px(ex + i, fy + dy + hgt, c('eyeDk'));
    }
    // a flat faceted nose: two planes
    for (let k = 0; k < 5; k++) { cv.shade(fx, fy + 1 + k, 1); cv.shade(fx - 1, fy + 1 + k, -1); }
    cv.px(fx - 1, fy + 6, c('skinDk')); cv.px(fx + 1, fy + 6, c('skinDk'));
    // a thin line of a mouth (a slot when he strains)
    const open = ['strain', 'hurt', 'wide'].includes(face);
    for (let i = -3; i <= 3; i++) cv.px(fx + i, fy + 9, c('mouth'));
    if (open) for (let i = -2; i <= 2; i++) cv.px(fx + i, fy + 10, c('mouth'));
    // reflections of the ring lights on the cheek
    if (hm.in(fx - 7, fy + 3)) { cv.px(fx - 7, fy + 3, c('glint')); cv.px(fx - 7, fy + 4, c('white')); }
  },

  torso(ctx) {
    const { cv, J, c, D, pose } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, h = J.hip;
    const tm = ctx.torsoMask;
    // mirror-shard facets: cut lines in outline, glints along the cuts
    const cuts = [
      [[-12, 4], [0, 14]], [[0, 14], [12, 4]], [[-16, 18], [0, 14]], [[0, 14], [14, 22]],
      [[-6, 26], [4, 30]], [[-14, 10], [-6, 26]], [[10, 12], [4, 30]],
    ];
    for (const [[x0, y0], [x1, y1]] of cuts) {
      cv.line(ch[0] + x0, n[1] + y0, ch[0] + x1, n[1] + y1, (X, Y) => { if (tm.in(X, Y) && tm.in(X, Y - 1) && tm.in(X, Y + 1)) cv.px(X, Y, c('outline')); });
      cv.line(ch[0] + x0, n[1] + y0 - 1, ch[0] + x1, n[1] + y1 - 1, (X, Y) => { if (tm.in(X, Y) && ((X + Y) % 3 === 0)) cv.px(X, Y, c('shard')); });
    }
    cv.px(ch[0] - 5, n[1] + 8, c('white')); cv.px(ch[0] - 4, n[1] + 9, c('glint'));
    // the mirror stripe on the trunks
    if (!pose.lying) {
      cv.part(ctx.mask().rect(w[0] - D.waistW - 1, w[1] - 3, D.waistW * 2 + 2, 2).clip(ctx.shortsMask), { ramp: ['shard', 'shard', 'shardDk'].map(c), bevel: 1, inner: 'line', shadow: false });
      for (const s of [-1, 1]) cv.line(h[0] + s * (D.hipSpread + 6), h[1] - 2, h[0] + s * (D.hipSpread + 8), h[1] + 8, (X, Y) => { if (ctx.shortsMask.in(X, Y)) cv.px(X, Y, c('glint')); });
    }
  },
  // Title Defense, THE CRACKED GLASS: you broke him. Cracks run out from an
  // impact point on his chest and one splits his face through an eye, a chunk
  // is missing from his shoulder, and loose shards hang in the air round him.
  remix: {
    colors: { B: { voidDk: [1, 2, 4] } },
    head(ctx, H) {
      const { cv, c } = ctx;
      const fx = Math.round(H.x + H.look[0]), fy = Math.round(H.y + H.look[1]);
      // one crack from the crown down through the viewer-right eye
      const pts = [[fx + 2, fy - 12], [fx + 4, fy - 6], [fx + 3, fy - 1], [fx + 6, fy + 4], [fx + 5, fy + 9]];
      for (let k = 0; k < pts.length - 1; k++) cv.line(pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1], (X, Y) => { cv.px(X, Y, c('outline')); cv.px(X + 1, Y, c('glint')); });
    },
    torso(ctx) {
      const { cv, J, c } = ctx;
      const ch = J.chest, tm = ctx.torsoMask;
      const ox = Math.round(ch[0] - 5), oy = Math.round(ch[1] + 2);
      // cracks radiating from the impact, each with a kink
      for (const [a, len] of [[-2.6, 16], [-1.9, 13], [-1.1, 18], [-0.3, 14], [0.5, 17], [1.3, 12], [2.1, 15], [2.9, 11]]) {
        const mx = ox + Math.cos(a) * len * 0.55, my = oy + Math.sin(a) * len * 0.55;
        const ex = ox + Math.cos(a + 0.35) * len, ey = oy + Math.sin(a + 0.35) * len;
        const draw = (X, Y) => { if (tm.in(X, Y)) cv.px(X, Y, c('outline')); };
        cv.line(ox, oy, mx, my, draw); cv.line(mx, my, ex, ey, draw);
      }
      cv.part(ctx.mask().ellipse(ox, oy, 2.2, 2), { ramp: ['glint', 'shardDk', 'voidDk'].map(c), bevel: 1, inner: 'line', shadow: false });
      // the missing chunk on the viewer-right shoulder
      const sh = J.shR;
      cv.flat(ctx.mask().poly([[sh[0] - 3, sh[1] - 3], [sh[0] + 3, sh[1] - 4], [sh[0] + 1, sh[1] + 3]]), c('voidDk'));
    },
    front(ctx) {
      const { cv, J, c, pose } = ctx;
      if (pose.lying) return;
      // loose shards hanging in the air beside his head and shoulders
      const hd = J.head;
      for (const [dx, dy, r] of [[-24, -6, 3], [24, -10, 2.6], [-28, 14, 2.4], [27, 12, 3], [16, -22, 2]]) {
        const x = hd[0] + dx, y = hd[1] + dy;
        cv.part(ctx.mask().poly([[x, y - r * 1.6], [x + r, y + r], [x - r, y + r * 0.6]]), { ramp: ['glint', 'shard', 'shardDk'].map(c), bevel: 1, inner: 'line', shadow: false });
      }
    },
  },
};
