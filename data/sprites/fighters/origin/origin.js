// ORIGIN and ORIGIN TRUE FORM (2026-10-04): the first fighter there ever was, the one who threw the first punch; ZERO was only his shadow. The most extreme
// design in the game: a towering figure made of shifting light, no face, a radiant slit where eyes would be, rays of light standing out behind him, a sun
// in his chest and gloves that burn like twin suns. Built on ZERO's poses (his shadow: every pose the signatures borrow, and the champions' own poses for
// ORIGIN's twelve arena styles, data/fighters/origin/styles.js).
//   Palettes   'origin'  (his road colours), 'origin.z0'..'origin.z11'  the colours of every zone in the game in turn (road, the city of champions, the
//              warped city, the Pantheon, the Underworld, the Void: z0 pure road, z1 halfway to the city...), cycled by the fight (src/fight/asc/origin.js);
//              'origin.<champion>' the colour of whoever's style or signature he borrows; 'origin.flash' bleached white; 'originTrue' white-gold with
//              'originTrue.fire' (his fire halo's colour).
//   True form  the same body, its light turned white-gold, the gloves bigger suns, a crown of flame (the `.td`-style remix is not used: he is a fighter of his own)
import zeroLayers from '../zero.js';
import { makePalette, swapPalette } from '../../../../src/engine/palette.js';
import { resolvePose } from '../../../../src/engine/figure.js';
import { ears, skull } from '../_face.js';
import * as K from '../../remixKit.js';
import { POSES } from '../../builds/poses.js';
import { posePath, ALL_SIGNATURES } from '../../../fighters/zero.js';
import { STYLES } from '../../../fighters/origin/styles.js';
import { NEW_ECHO_COLORS } from '../void/zeroTrue.js';
import gus from '../gus.js';
import brody from '../brody.js';
import mcbride from '../mcbride.js';
import midnight from '../midnight.js';
import rex from '../rex.js';
import baron from '../baron.js';
import maestro from '../maestro.js';
import avalanche from '../avalanche.js';
import mirror from '../mirror.js';
import karver from '../karver.js';
import warden from '../warden.js';
import eclipse from '../eclipse.js';

// ---------------------------------------------------------------------------------------------------------------- palettes
const OUT = [0, 0, 0];
// per zone: skin (hi, mid, shade, dark), glow, glove (hi, mid, dark), ray (hi, mid), trunk (hi, mid, dark), boot (hi, mid)
const ZONES = {
  road: { skin: [[31, 31, 26], [30, 27, 14], [24, 17, 6], [13, 7, 3]], glow: [18, 29, 31], glove: [[31, 31, 22], [31, 22, 3], [25, 10, 1]], ray: [[31, 31, 24], [31, 26, 10]], trunk: [[31, 26, 9], [24, 16, 4], [12, 6, 2]], boot: [[30, 24, 8], [20, 12, 3]] },
  city: { skin: [[31, 24, 22], [31, 12, 10], [22, 5, 6], [10, 2, 3]], glow: [31, 28, 10], glove: [[31, 29, 18], [31, 16, 4], [22, 6, 1]], ray: [[31, 24, 16], [31, 12, 8]], trunk: [[31, 20, 12], [25, 8, 6], [12, 3, 3]], boot: [[30, 18, 10], [20, 7, 5]] },
  warp: { skin: [[26, 20, 31], [18, 9, 29], [10, 4, 19], [4, 1, 9]], glow: [31, 13, 26], glove: [[30, 26, 31], [24, 10, 31], [12, 3, 20]], ray: [[28, 22, 31], [20, 10, 30]], trunk: [[22, 12, 30], [14, 5, 22], [7, 2, 11]], boot: [[22, 12, 30], [12, 4, 20]] },
  pantheon: { skin: [[31, 31, 31], [29, 29, 26], [22, 23, 22], [12, 13, 14]], glow: [31, 31, 20], glove: [[31, 31, 29], [31, 28, 12], [26, 19, 4]], ray: [[31, 31, 28], [30, 28, 16]], trunk: [[31, 30, 24], [27, 24, 14], [15, 13, 7]], boot: [[31, 30, 24], [24, 21, 12]] },
  underworld: { skin: [[31, 22, 10], [31, 10, 2], [20, 4, 1], [8, 1, 0]], glow: [31, 24, 4], glove: [[31, 30, 14], [31, 17, 2], [24, 6, 0]], ray: [[31, 26, 10], [31, 12, 2]], trunk: [[28, 14, 4], [19, 6, 1], [9, 2, 0]], boot: [[24, 10, 3], [14, 4, 1]] },
  void: { skin: [[28, 29, 31], [20, 22, 31], [9, 10, 20], [2, 2, 8]], glow: [8, 31, 31], glove: [[31, 31, 31], [22, 24, 31], [9, 10, 22]], ray: [[29, 30, 31], [17, 20, 31]], trunk: [[14, 14, 22], [6, 6, 12], [2, 2, 5]], boot: [[14, 14, 22], [5, 5, 10]] },
  // the true form: a body of black stone cracked open on white-gold fire
  gold: { skin: [[17, 12, 10], [8, 5, 5], [3, 2, 3], [0, 0, 1]], glow: [31, 31, 31], glove: [[31, 31, 27], [31, 26, 6], [27, 13, 1]], ray: [[31, 31, 26], [31, 28, 10]], trunk: [[31, 31, 26], [31, 26, 6], [20, 10, 1]], boot: [[31, 29, 16], [24, 16, 4]] },
};
export const ZONE_ORDER = ['road', 'city', 'warp', 'pantheon', 'underworld', 'void'];
const blend = (a, b, t) => (Array.isArray(a[0]) ? a.map((v, i) => blend(v, b[i], t)) : a.map((v, i) => Math.round(v + (b[i] - v) * t)));
const zoneBlend = (a, b, t) => Object.fromEntries(Object.keys(a).map((k) => [k, blend(a[k], b[k], t)]));
const pal = (name, z) => ({
  A: makePalette(`${name}.A`, {
    outline: OUT, skinHi: z.skin[0], skin: z.skin[1], skinSh: z.skin[2], skinDk: z.skin[3], white: [31, 31, 31], glow: z.glow,
    gloveHi: z.glove[0], glove: z.glove[1], gloveDk: z.glove[2], rayHi: z.ray[0], ray: z.ray[1],
  }),
  B: makePalette(`${name}.B`, { trunkHi: z.trunk[0], trunk: z.trunk[1], trunkDk: z.trunk[2], bootHi: z.boot[0], boot: z.boot[1] }),
});
export const palettes = { origin: pal('origin', ZONES.road) };
// the cycle: z0, z1, ... z11 (even: a zone, odd: halfway to the next)
ZONE_ORDER.forEach((zn, i) => {
  const next = ZONES[ZONE_ORDER[(i + 1) % ZONE_ORDER.length]];
  palettes[`origin.z${i * 2}`] = pal(`origin.z${i * 2}`, ZONES[zn]);
  palettes[`origin.z${i * 2 + 1}`] = pal(`origin.z${i * 2 + 1}`, zoneBlend(ZONES[zn], next, 0.5));
});
palettes.originTrue = pal('originTrue', ZONES.gold);
palettes['originTrue.fire'] = pal('originTrue.fire', zoneBlend(ZONES.gold, ZONES.underworld, 0.6));
palettes['origin.flash'] = {
  A: swapPalette('origin.flash.A', palettes.origin.A, { skinHi: [31, 31, 31], skin: [31, 31, 31], skinSh: [27, 27, 31], skinDk: [18, 18, 26], gloveHi: [31, 31, 31], glove: [31, 31, 31], gloveDk: [26, 26, 31], ray: [31, 31, 31], rayHi: [31, 31, 31] }),
  B: swapPalette('origin.flash.B', palettes.origin.B, { trunkHi: [31, 31, 31], trunk: [28, 28, 31], trunkDk: [18, 18, 26], bootHi: [31, 31, 31], boot: [28, 28, 31] }),
};
// whoever's style or signature he borrows: every surface takes that champion's colour (the signatures' own colours, data/fighters/zero.js)
const ramp = ([r, g, b], k) => [r, g, b].map((v) => Math.max(0, Math.min(31, Math.round(k < 1 ? v * k : v + (31 - v) * (k - 1)))));
export function addChampionPalettes(colors) {
  for (const [id, col] of Object.entries(colors)) {
    const hi = ramp(col, 1.35), mid = ramp(col, 1), sh = ramp(col, 0.6), dk = ramp(col, 0.32);
    palettes['origin.' + id] = {
      A: swapPalette(`origin.${id}.A`, palettes.origin.A, { skinHi: hi, skin: mid, skinSh: sh, skinDk: dk, gloveHi: hi, glove: sh, gloveDk: dk, rayHi: hi, ray: mid }),
      B: swapPalette(`origin.${id}.B`, palettes.origin.B, { trunkHi: sh, trunk: dk, trunkDk: ramp(col, 0.18), bootHi: sh, boot: dk }),
    };
  }
}
addChampionPalettes({ ...Object.fromEntries(ALL_SIGNATURES.map((s) => [s.champ.id, s.color])), ...NEW_ECHO_COLORS });

// ---------------------------------------------------------------------------------------------------------------- the champions' poses (the styles)
const LAYERS = { gus, brody, mcbride, midnight, rex, baron, maestro, avalanche, mirror, karver, warden, eclipse };
const pulled = {};
for (const S of STYLES) {
  const champ = S.sig.champ, L = LAYERS[champ.spriteLayers], lib = { ...POSES, ...(L.poses || {}) };
  for (const mid of S.blows) {
    const A2 = champ.moves[mid].animation;
    for (const p of [...A2.windup, ...A2.active, ...A2.recovery]) { const key = posePath(champ, p); if (key !== p && !pulled[key] && !(zeroLayers.poses && zeroLayers.poses[key])) pulled[key] = resolvePose(lib, p); }
  }
}

// ---------------------------------------------------------------------------------------------------------------- the figure
const light = { ramps: { skin: ['skinHi', 'skin', 'skinSh', 'skinDk'], ray: ['rayHi', 'ray', 'skinSh'], glove: ['gloveHi', 'glove', 'gloveDk'], cuff: ['white', 'glow', 'skinSh'], shorts: ['trunkHi', 'trunk', 'trunkDk'], sock: ['bootHi', 'boot', 'outline'], boot: ['bootHi', 'boot', 'outline'], sole: ['boot', 'outline', 'outline'] } };

// a sun on a fist: a disc of the glove's colours with a white core, rays standing out of it in every direction
function sun(ctx, f, r, rays, t0 = 0) {
  const { cv, c } = ctx, [fx, fy] = f, X = Math.round(fx), Y = Math.round(fy - 2);
  for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
    const d = Math.hypot(i, j);
    if (d > r) continue;
    cv.px(X + i, Y + j, c(d < r * 0.4 ? 'white' : d < r * 0.72 ? 'gloveHi' : d < r - 0.8 ? 'glove' : 'gloveDk'));
  }
  for (let k = 0; k < rays; k++) {
    const a = t0 + (k / rays) * Math.PI * 2, len = r + (k % 2 ? 3 : 6);
    for (let d = r + 1; d <= len; d++) cv.px(Math.round(X + Math.cos(a) * d), Math.round(Y + Math.sin(a) * d), c(d < len ? 'gloveHi' : k % 2 ? 'ray' : 'glove'));
  }
}

// the true form's fists trail fire: tongues of flame streaming up and back from each sun
function flare(ctx, f) {
  const { cv, c } = ctx, X = Math.round(f[0]), Y = Math.round(f[1] - 2);
  for (let k = -3; k <= 3; k++) for (let j = 0; j < 12 - Math.abs(k) * 2; j++) cv.px(X + k * 3 + ((j >> 1) & 1) - 1, Y - 14 - j, c(j < 3 ? 'white' : j < 7 ? 'gloveHi' : 'glove'));
}

const fighter = (gold) => ({
  ...zeroLayers,
  remix: undefined,
  id: gold ? 'originTrue' : 'origin',
  palettes: { default: gold ? 'originTrue' : 'origin' },
  ramps: light.ramps,
  poses: { ...zeroLayers.poses, ...pulled },
  // towering: the tallest, widest figure in the game, the shoulders wide and the waist pinched, long arms, enormous fists
  body: { size: gold ? [1.42, 1.34] : [1.34, 1.28], shoulders: gold ? 1.2 : 1.16, legLen: 1.06, neckLen: 1.6,
    dims: { chestW: 23.5, deltoid: 8.4, waistW: 12.5, belly: 2, upperArm: [6.8, 5.2], forearm: [5.8, 4.6], glove: [9.2, 10.8], thigh: [8, 5.6], shin: [5.4, 3.9] } },

  // rays of light stand out behind him in an arc over his head and shoulders (behind everything)
  back(ctx) {
    if (ctx.pose.lying) return;
    const H = ctx.J.head;
    K.aura(ctx, { ramp: 'ray', cx: H[0], cy: H[1] + 6, n: gold ? 17 : 13, len: gold ? 52 : 44, r0: 22, arc: Math.PI * 1.16, spin: -Math.PI * 1.08 });
    if (gold) {
      // the true form: a second, longer fan of rays the other way, a full ring behind the head, and two vast wings of light
      K.aura(ctx, { ramp: 'glove', cx: H[0], cy: H[1] + 8, n: 11, len: 74, r0: 30, arc: Math.PI * 1.5, spin: -Math.PI * 1.25 });
      K.ring(ctx, { ramp: 'ray', cx: H[0], cy: H[1] - 6, rx: 30, ry: 30, thick: 2, half: 'back' });
      K.ring(ctx, { ramp: 'glove', cx: H[0], cy: H[1] - 6, rx: 38, ry: 38, thick: 1, half: 'back' });
      K.wingsFeather(ctx, { ramp: 'ray', span: 46, spread: 1.7, tip: 'white', rise: 6, lift: 14 });
    }
  },
  // a faceless dome of light with a radiant slit where the eyes should be; the true form wears a crown of flame
  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y), [lx, ly] = H.look, fx = x + lx, fy = y + ly, face = H.face || 'neutral';
    ears(ctx, H, ramps.skin, [1.6, 2.8]);
    skull(ctx, H, ramps.skin, 'round');
    if (face !== 'ko') {
      const hurt = ['hurt', 'dazed'].includes(face);
      for (let i = -7; i <= 7; i++) { if (hurt && (i === 0 || i === 3)) continue; cv.px(fx + i, fy, c(Math.abs(i) > 5 ? 'glow' : 'white')); if (Math.abs(i) < 4 && !hurt) cv.px(fx + i, fy + 1, c('glow')); }
    }
    if (gold) {
      K.flames(ctx, H, { ramp: 'ray', n: 9, h: 24 });
      // fire running down from the slit like tears
      if (face !== 'ko') for (const sx of [-6, 6]) for (let j = 2; j < 9; j++) cv.px(fx + sx + ((j >> 1) & 1), fy + j, c(j < 6 ? 'glow' : 'rayHi'));
    }
  },
  // a sun in his chest, light running out of it across the body in straight lines
  torso(ctx) {
    const { cv, J, c, D, pose } = ctx;
    const n = J.neck, w = J.waist, tm = ctx.torsoMask;
    if (!pose.lying) {
      const cx = n[0], cy = n[1] + 15;
      for (let y = -8; y <= 8; y++) for (let x = -8; x <= 8; x++) {
        const d = Math.hypot(x, y * 0.9), X = cx + x, Y = cy + y;
        if (!tm.in(X, Y)) continue;
        if (d < 3.2) cv.px(X, Y, c('white')); else if (d < 5) cv.px(X, Y, c('glow')); else if (d < 6.2) cv.px(X, Y, c('rayHi'));
      }
      for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2, len = k % 2 ? 9 : 12; for (let d = 6; d < len; d++) { const X = Math.round(cx + Math.cos(a) * d), Y = Math.round(cy + Math.sin(a) * d * 0.9); if (tm.in(X, Y)) cv.px(X, Y, c(d < len - 2 ? 'rayHi' : 'ray')); } }
    }
    if (gold && !pose.lying) {
      // the true form is cracked open: fissures of white fire run across the chest and ribs, black at their edges
      const n = J.neck, cx = n[0], cy = n[1] + 15;
      const cracks = [[-6, -4, -16, -12, -22, -10], [6, -3, 16, -9, 21, -4], [-5, 5, -14, 12, -20, 22], [5, 6, 13, 14, 18, 24], [0, 8, -2, 18, 3, 28]];
      for (const cr of cracks) for (let s2 = 0; s2 < 2; s2++) {
        const [x0, y0, x1, y1, x2, y2] = cr;
        for (let i = 0; i <= 16; i++) {
          const u = i / 16, X = Math.round(cx + (u < 0.5 ? x0 + (x1 - x0) * u * 2 : x1 + (x2 - x1) * (u - 0.5) * 2)), Y = Math.round(cy + (u < 0.5 ? y0 + (y1 - y0) * u * 2 : y1 + (y2 - y1) * (u - 0.5) * 2));
          if (!tm.in(X, Y)) continue;
          if (s2 === 0) { cv.px(X + 1, Y, c('glow')); cv.px(X - 1, Y, c('rayHi')); } else cv.px(X, Y, c(i % 3 ? 'white' : 'glow'));
        }
      }
    }
    for (let X = Math.round(w[0] - D.waistW); X <= w[0] + D.waistW; X++) if (ctx.shortsMask.in(X, Math.round(w[1] - 2))) cv.px(X, w[1] - 2, c('white'));
  },
  // the gloves burn like twin suns
  front(ctx) {
    if (ctx.pose.lying) return;
    for (const k of ['L', 'R']) { const f = ctx.J['fi' + k]; if (f) { sun(ctx, f, gold ? 11 : 9, gold ? 22 : 12, k === 'L' ? 0.2 : 0.5); if (gold) flare(ctx, f); } }
  },
});
export default fighter(false);
export const originTrue = fighter(true);
