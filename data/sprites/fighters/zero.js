// ZERO: sprite layers on the medium build, void palette.
// A figure the colour of nothing: near-black from head to toe with the
// faintest cold shading, a smooth blank head with one thin white line where
// eyes should be, and a white ring (a zero) on his chest. Black trunks with a
// white hairline waistband, black gloves and boots.
// Palettes 'zero.<champion>': his echoes, the same frames in that champion's
// colour (see /data/fighters/zero.js ALL_SIGNATURES: all twelve, for his true form).
// Poses: his own taunt (nought: arms held open, the ring on show), coming
// undone (undone1/2), plus every champion pose his borrowed signatures use,
// pulled from that champion's own sprite layers (flattened, and namespaced
// 'champion:pose' so no two collide).

import { makePalette, swapPalette } from '../../../src/engine/palette.js';
import { resolvePose } from '../../../src/engine/figure.js';
import { ears, skull } from './_face.js';
import * as K from '../remixKit.js';
import { POSES } from '../builds/poses.js';
import { ALL_SIGNATURES as SIGNATURES, posePath } from '../../fighters/zero.js';
import gus from './gus.js';
import brody from './brody.js';
import mcbride from './mcbride.js';
import midnight from './midnight.js';
import rex from './rex.js';
import baron from './baron.js';
import maestro from './maestro.js';
import avalanche from './avalanche.js';
import mirror from './mirror.js';
import karver from './karver.js';
import warden from './warden.js';
import eclipse from './eclipse.js';

const A = makePalette('zero.A', {
  outline: [0, 0, 0],
  skinHi: [10, 10, 13], skin: [5, 5, 7], skinSh: [3, 3, 4], skinDk: [1, 1, 2],
  white: [31, 31, 31], glow: [24, 25, 31],
  gloveHi: [9, 9, 12], glove: [4, 4, 6], gloveDk: [2, 2, 3],
});
const B = makePalette('zero.B', {
  trunkHi: [7, 7, 9], trunk: [3, 3, 4], trunkDk: [1, 1, 2],
  bootHi: [7, 7, 9], boot: [3, 3, 4],
});

// the echoes: every surface takes the champion's colour
const ramp = ([r, g, b], k) => [r, g, b].map((v) => Math.max(0, Math.min(31, Math.round(k < 1 ? v * k : v + (31 - v) * (k - 1)))));
const palettes = { zero: { A, B } };
for (const s of SIGNATURES) {
  const col = s.color, id = s.champ.id;
  const hi = ramp(col, 1.35), mid = ramp(col, 1), sh = ramp(col, 0.6), dk = ramp(col, 0.32);
  palettes['zero.' + id] = {
    A: swapPalette(`zero.${id}.A`, A, { skinHi: hi, skin: mid, skinSh: sh, skinDk: dk, gloveHi: hi, glove: sh, gloveDk: dk }),
    B: swapPalette(`zero.${id}.B`, B, { trunkHi: sh, trunk: dk, trunkDk: ramp(col, 0.18), bootHi: sh, boot: dk }),
  };
}
export { palettes };

// the champions' own poses, for the signatures that need them
const LAYERS = { gus, brody, mcbride, midnight, rex, baron, maestro, avalanche, mirror, karver, warden, eclipse };
const pulled = {};
for (const s of SIGNATURES) {
  const L = LAYERS[s.champ.spriteLayers];
  const lib = { ...POSES, ...(L.poses || {}) };
  const A2 = s.champ.moves[s.move].animation;
  for (const p of [...A2.windup, ...A2.active, ...A2.recovery]) {
    const key = posePath(s.champ, p);
    if (key !== p) pulled[key] = resolvePose(lib, p);
  }
}

const poses = {
  ...pulled,
  // taunt: arms held open, palms out, the ring on show
  nought: {
    extends: 'idle1',
    head: { at: [0, -100], face: 'neutral', look: [0, 0] },
    elL: [-32, -64], fiL: [-38, -80], elR: [32, -64], fiR: [38, -80],
    gloveL: { angle: -10, view: 'back' }, gloveR: { angle: 10, view: 'back' },
  },
  // coming undone: slumped, arms hanging, the head dropped
  undone1: {
    extends: 'idle1', shift: [0, 3],
    head: { at: [0, -94], face: 'dazed', look: [0, 2] },
    elL: [-24, -54], fiL: [-22, -36], elR: [24, -54], fiR: [22, -36],
    gloveL: { angle: 180 }, gloveR: { angle: 180 },
  },
  undone2: { extends: 'undone1', shift: [1, 4], head: { at: [2, -93], face: 'dazed', look: [1, 2] } },
};

export default {
  id: 'zero',
  build: 'medium',
  palettes: { default: 'zero' },
  torsoMaterial: 'skin',
  poses,  // Title Defense: ZERO, CROWNED. The black figure is dressed in what it has taken: a crown of bone, a skull-white jaw plate, bone gauntlets and boots, a
  // ragged violet cape lined in bone, ribs over the chest and a red ring where the white one was.
  remix: {
    swap: {
      A: { skinHi: [12, 10, 19], skin: [7, 5, 12], skinSh: [4, 3, 7], skinDk: [2, 1, 4], glow: [31, 10, 13], gloveHi: [31, 31, 29], glove: [26, 25, 24], gloveDk: [14, 13, 14] },
      B: { trunkHi: [13, 8, 22], trunk: [7, 4, 14], trunkDk: [3, 2, 7], bootHi: [30, 30, 28], boot: [24, 23, 22] },
    },
    ramps: { bone: ['gloveHi', 'glove', 'gloveDk'], void: ['trunkHi', 'trunk', 'trunkDk'], red: ['white', 'glow', 'skinSh'] },
    back(ctx) { if (!ctx.pose.lying) K.cape(ctx, { ramp: 'void', inner: 'bone', len: 40, flare: 9, hem: 'tatter', collar: true }); },
    head(ctx, H) {
      if ((H.face || 'neutral') === 'ko') { K.crown(ctx, H, { ramp: 'bone', n: 5, h: 9, band: 3, w: 0.5 }); return; }
      K.mask(ctx, H, { ramp: 'bone', y: 4 });
      const fx = Math.round(H.x + H.look[0]), fy = Math.round(H.y + H.look[1]);
      for (let i = -5; i <= 5; i += 2) for (let j = 0; j < 3; j++) ctx.cv.px(fx + i, fy + 7 + j, ctx.c('outline'));
      K.crown(ctx, H, { ramp: 'bone', n: 5, h: 10, band: 3, w: 0.5 });
    },
    torso(ctx) {
      if (ctx.pose.lying) return;
      K.ribs(ctx, { ramp: 'bone', n: 4 });
      K.pauldrons(ctx, { ramp: 'bone', style: 'spiked', size: 1, tip: 'bone' });
    },
    front(ctx) { K.bracers(ctx, { ramp: 'bone', from: 0.25, to: 0.6, wide: 1.6 }); K.greaves(ctx, { ramp: 'bone', knee: false, from: 0.3, to: 0.7 }); },
  },

  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['white', 'glow', 'skinSh'],
    shorts: ['trunkHi', 'trunk', 'trunkDk'],
    sock: ['bootHi', 'boot', 'outline'],
    boot: ['bootHi', 'boot', 'outline'],
    sole: ['boot', 'outline', 'outline'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';
    ears(ctx, H, ramps.skin, [1.6, 2.8]);
    skull(ctx, H, ramps.skin, 'round');
    // one thin white line where the eyes should be (broken when he's hurt, out when he's out)
    if (face === 'ko') return;
    const hurt = ['hurt', 'dazed'].includes(face);
    for (let i = -6; i <= 6; i++) {
      if (hurt && (i === -1 || i === 2 || i === 3)) continue;
      cv.px(fx + i, fy + (hurt && i > 2 ? 1 : 0), c(Math.abs(i) > 4 ? 'glow' : 'white'));
    }
  },

  torso(ctx) {
    const { cv, J, c, D, pose } = ctx;
    const n = J.neck, w = J.waist;
    const tm = ctx.torsoMask;
    // the zero on his chest
    if (!pose.lying) {
      const cx = n[0], cy = n[1] + 16;
      for (let a = 0; a < 28; a++) {
        const t = (a / 28) * Math.PI * 2;
        const X = Math.round(cx + Math.cos(t) * 4.5), Y = Math.round(cy + Math.sin(t) * 6);
        if (tm.in(X, Y)) cv.px(X, Y, c(a < 14 ? 'glow' : 'white'));
      }
    }
    // a white hairline waistband
    for (let X = Math.round(w[0] - D.waistW); X <= w[0] + D.waistW; X++) if (ctx.shortsMask.in(X, Math.round(w[1] - 2))) cv.px(X, w[1] - 2, c('glow'));
  },
};
