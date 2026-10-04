// Dash Maddox, the rival (§11b): sprite layers on the medium build, shared by
// all four of his fights. One body, one face, one haircut; the outfit is
// upgraded each time he comes back, and his signature ELECTRIC TEAL (gloves and
// trunks) never changes.
//   I    plain teal trunks, white waistband, taped wraps showing at the cuffs,
//        white boots with teal laces
//   II   + white piping down the trunks, a sponsor patch on the leg, white cuffs
//   III  satin trunks (a sheen down the front), gold waistband and cuffs, a gold
//        chain, teal boots
//   IV   the "DM" crest on the trunks, gold-trimmed teal boots, gold-cuffed
//        gloves (the teal-and-gold robe is for the walk-in: see his portrait)
//   V-VI gold everywhere, a laurel and a halo, winged boots (VI: worn, cracked, half-plucked)
//   VII  Dash in Chains: the gold gone to dull iron, a dead laurel, iron cuffs and chain, an iron collar
// A cocky prodigy: an athletic medium build, a swept-up fauxhawk with a swoop
// over the brow, one eyebrow always up, and a smirk (his neutral face).
// Poses: beckon1/2 (the taunt: "come on"), reelPoint1/2 (points at the big
// screen: Highlight Reel), flashTell (the Flashbulb Uppercut's dip, a glint on
// the glove), finaleTell1/2 (Grand Finale: both gloves up, sparks),
// knowTell (the Know-It-All hook, cocked with a knowing look).

import { makePalette, swapPalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './_face.js';

// signature teal (never changes between stages)
const TEAL = { tealHi: [12, 29, 27], teal: [3, 21, 20], tealDk: [1, 11, 12] };

const A = makePalette('dash1.A', {
  outline: [2, 2, 3],
  skinHi: [30, 23, 17], skin: [26, 17, 11], skinSh: [19, 11, 7], skinDk: [11, 6, 4],
  white: [31, 31, 31], mouth: [13, 3, 5],
  hairHi: [12, 8, 7], hair: [6, 3, 3], hairDk: [3, 1, 2],
  gloveHi: TEAL.tealHi, glove: TEAL.teal, gloveDk: TEAL.tealDk,
  glint: [31, 31, 20],
});
// costume: the same keys every stage (palette swaps), different colours
const B1 = makePalette('dash1.B', {
  ...TEAL,
  trim: [31, 31, 31], trimSh: [21, 22, 25],
  gold: [28, 27, 24], goldDk: [18, 18, 17], // stage I: tape, not gold
  sockHi: [31, 31, 31], sock: [23, 24, 27],
  bootHi: [31, 31, 31], boot: [23, 24, 27], bootDk: [13, 14, 17],
  patch: [27, 6, 8], patchDk: [15, 2, 4],
  halo: [31, 30, 21], // stage V: the halo and the laurel's highlight
});
const stageB = (n, o) => swapPalette(`dash${n}.B`, B1, o);
const B2 = stageB(2, {});
const B3 = stageB(3, {
  gold: [31, 25, 7], goldDk: [21, 14, 2],
  bootHi: TEAL.tealHi, boot: TEAL.teal, bootDk: TEAL.tealDk,
  sockHi: [31, 31, 31], sock: [24, 25, 28],
});
const B4 = stageB(4, {
  gold: [31, 26, 8], goldDk: [22, 15, 2],
  trim: [31, 27, 10], trimSh: [22, 16, 3],
  bootHi: TEAL.tealHi, boot: TEAL.teal, bootDk: [1, 8, 10],
  patch: [31, 27, 10], patchDk: [22, 15, 2],
});
// V: Dash Ascendant: gold everywhere, a laurel, a halo, winged boots
const B5 = stageB(5, {
  gold: [31, 27, 9], goldDk: [23, 16, 3],
  trim: [31, 28, 12], trimSh: [23, 17, 4],
  bootHi: TEAL.tealHi, boot: TEAL.teal, bootDk: [1, 8, 10],
  patch: [31, 28, 12], patchDk: [23, 17, 4],
  sockHi: [31, 30, 22], sock: [28, 25, 12],
});
// VI: Dash Desperate: the same gold, dulled and scuffed; a laurel with leaves missing and a cracked halo
const B6 = stageB(6, {
  gold: [25, 19, 6], goldDk: [14, 9, 2],
  trim: [27, 25, 20], trimSh: [17, 15, 12],
  bootHi: TEAL.tealHi, boot: [2, 16, 16], bootDk: [1, 7, 9],
  patch: [24, 19, 6], patchDk: [14, 10, 2],
  sockHi: [27, 26, 20], sock: [20, 18, 12], halo: [26, 24, 15],
});
// VII: Dash in Chains: the gold gone to dull iron, the teal dulled with it; a dead laurel, no halo, no wings, iron cuffs
// on both wrists with the chain hanging from them, an iron collar with a link of red where the shadow chain
// is fixed to it. (`halo` is the dull red of that link.)
const B7 = stageB(7, {
  tealHi: [7, 20, 19], teal: [2, 14, 14], tealDk: [1, 8, 9],
  gold: [15, 15, 19], goldDk: [6, 6, 9],
  trim: [17, 17, 21], trimSh: [8, 8, 12],
  bootHi: [7, 19, 18], boot: [2, 12, 12], bootDk: [1, 6, 7],
  patch: [15, 15, 19], patchDk: [6, 6, 9],
  sockHi: [15, 15, 19], sock: [9, 9, 13], halo: [27, 6, 4],
});
// VIII: Dash, the King's Champion: teal gone nearly to black, the gold replaced by black iron, red where the King's mark is (`halo` is the ruby of
// the circlet and of the crown on his breastplate)
const B8 = stageB(8, {
  tealHi: [5, 15, 15], teal: [1, 9, 10], tealDk: [0, 4, 6],
  gold: [10, 9, 13], goldDk: [3, 3, 6],
  trim: [14, 3, 6], trimSh: [6, 1, 3],
  bootHi: [6, 14, 14], boot: [1, 8, 9], bootDk: [0, 3, 5],
  patch: [10, 9, 13], patchDk: [3, 3, 6],
  sockHi: [12, 10, 14], sock: [7, 5, 9], halo: [31, 6, 9],
});
// Grand Finale afterimages: the same frames in pale teal
const ghostA = swapPalette('dash4.ghostA', A, {
  skinHi: [22, 31, 30], skin: [14, 27, 26], skinSh: [8, 20, 21], skinDk: [4, 12, 14],
  hairHi: [10, 22, 22], hair: [5, 15, 16], hairDk: [2, 9, 10],
  gloveHi: [26, 31, 31], glove: [16, 29, 28], gloveDk: [8, 19, 20], mouth: [4, 12, 14],
});
const ghostB = swapPalette('dash4.ghostB', B4, {
  tealHi: [26, 31, 31], teal: [16, 29, 28], tealDk: [8, 19, 20], gold: [24, 31, 30], goldDk: [12, 22, 22],
  trim: [24, 31, 30], trimSh: [12, 22, 22], bootHi: [26, 31, 31], boot: [16, 29, 28], bootDk: [8, 19, 20],
  sockHi: [26, 31, 31], sock: [16, 29, 28], patch: [24, 31, 30], patchDk: [12, 22, 22],
});
export const palettes = {
  dash1: { A, B: B1 }, dash2: { A: swapPalette('dash2.A', A, {}), B: B2 },
  dash3: { A: swapPalette('dash3.A', A, {}), B: B3 }, dash4: { A: swapPalette('dash4.A', A, {}), B: B4 }, dash5: { A: swapPalette('dash5.A', A, {}), B: B5 },
  dash6: { A: swapPalette('dash6.A', A, { skinHi: [30, 21, 15], skin: [25, 15, 10], skinSh: [18, 10, 7] }), B: B6 },
  // VII: paler, bruised, and tired
  dash7: { A: swapPalette('dash7.A', A, { skinHi: [26, 20, 17], skin: [21, 14, 11], skinSh: [14, 9, 8], skinDk: [8, 5, 5], gloveHi: [7, 20, 19], glove: [2, 14, 14], gloveDk: [1, 8, 9] }), B: B7 },
  // VIII: paler still, and the eyes are the King's (red-rimmed)
  dash8: { A: swapPalette('dash8.A', A, { skinHi: [25, 20, 19], skin: [19, 13, 12], skinSh: [12, 8, 9], skinDk: [6, 4, 5], gloveHi: [5, 15, 15], glove: [1, 9, 10], gloveDk: [0, 4, 6] }), B: B8 },
  // IX: Dash Unbound: the Void's power in him. The teal gone to a cold white-cyan, the King's iron and ruby gone to bone and white, the skin
  // bleached, the eyes white. (He wears stage VIII's layers: everything he ever wore, with nothing on it that isn't the Void's now.)
  dash9: {
    A: swapPalette('dash9.A', A, { skinHi: [30, 30, 31], skin: [25, 26, 29], skinSh: [17, 18, 23], skinDk: [9, 9, 14], hairHi: [31, 31, 31], hair: [24, 25, 30], hairDk: [12, 12, 20], gloveHi: [26, 31, 31], glove: [14, 26, 30], gloveDk: [5, 13, 19], white: [31, 31, 31], mouth: [8, 8, 14] }),
    B: swapPalette('dash9.B', B8, { tealHi: [26, 31, 31], teal: [12, 24, 29], tealDk: [4, 11, 18], gold: [26, 27, 30], goldDk: [12, 12, 19], trim: [31, 31, 31], trimSh: [17, 18, 24], bootHi: [26, 31, 31], boot: [10, 21, 27], bootDk: [3, 9, 15], patch: [26, 27, 30], patchDk: [12, 12, 19], sockHi: [30, 30, 31], sock: [20, 21, 27], halo: [31, 31, 31] }),
  },
  'dash4.ghost': { A: ghostA, B: ghostB },
  // the shadow step's afterimage: Dash cut out in black-violet
  'dash8.ghost': {
    A: swapPalette('dash8.ghost.A', A, { skinHi: [9, 4, 16], skin: [5, 2, 10], skinSh: [3, 1, 6], skinDk: [2, 0, 4], hairHi: [7, 3, 12], hair: [3, 1, 6], hairDk: [1, 0, 3], gloveHi: [12, 6, 20], glove: [7, 3, 13], gloveDk: [3, 1, 6], mouth: [3, 1, 6], white: [20, 12, 28] }),
    B: swapPalette('dash8.ghost.B', B8, { tealHi: [12, 6, 20], teal: [7, 3, 13], tealDk: [3, 1, 6], gold: [12, 6, 20], goldDk: [5, 2, 9], trim: [12, 6, 20], trimSh: [5, 2, 9], bootHi: [12, 6, 20], boot: [7, 3, 13], bootDk: [3, 1, 6], sockHi: [12, 6, 20], sock: [7, 3, 13], patch: [12, 6, 20], patchDk: [5, 2, 9], halo: [24, 14, 30] }),
  },
};

const FEET = { knL: [-13, -22], knR: [13, -22], ftL: [-16, 0], ftR: [16, 0] };
const poses = {
  // the taunt: weight back, the viewer-right glove down, the other beckoning
  beckon1: {
    extends: 'idle1', shift: [1, 0], ...FEET,
    head: { at: [2, -100], face: 'grin', tilt: 'up', look: [1, 0] },
    elR: [27, -58], fiR: [20, -48], gloveR: { angle: 160 },
    elL: [-28, -66], fiL: [-24, -84], gloveL: { view: 'back', angle: 10 },
  },
  beckon2: { extends: 'beckon1', fiL: [-20, -80], gloveL: { view: 'back', angle: 30 } },
  // Highlight Reel: points up at the big screen (a star glints off it)
  reelPoint1: {
    extends: 'idle1',
    head: { at: [2, -101], face: 'grin', tilt: 'up', look: [1, -1] },
    elR: [28, -92], fiR: [30, -114], gloveR: { angle: 15 },
    elL: [-24, -60], fiL: [-11, -74],
  },
  reelPoint2: { extends: 'reelPoint1', fiR: [31, -117], glint: 2 },
  // Flashbulb Uppercut: the dip, a flash of light on the glove
  flashTell: {
    extends: 'upperTell', shift: [0, 2],
    head: { at: [3, -93], face: 'focus', look: [1, 1] },
    glint: 1,
  },
  // Know-It-All: the hook cocked, head tilted, eyes on your gloves
  knowTell: {
    extends: 'hookTell',
    head: { at: [5, -99], face: 'grin', look: [2, 1] },
  },
  // Grand Finale: both gloves high, sparks falling off them like fireworks
  finaleTell1: { extends: 'overheadTell1', head: { at: [0, -102], face: 'grin', tilt: 'up', look: [0, -1] } },
  finaleTell2: { extends: 'overheadTell2', sparks: 1 },
  // Dash in Chains: the chain hook cocked (a shadow chain wound round the fist, red at the link)...
  chainTell: {
    extends: 'hookTell', head: { at: [4, -99], face: 'strain', look: [1, 1] },
    chainWrap: 1,
  },
  // ...and reeling you in: leaning back with both fists in front, hand over hand on the chain
  chainHold: {
    extends: 'idle1', shift: [0, 2], knL: [-14, -22], knR: [14, -22], ftL: [-18, 0], ftR: [18, 0],
    head: { at: [0, -96], face: 'strain', tilt: 'down', look: [0, 2] },
    shL: [-21, -79], elL: [-21, -64], fiL: [-6, -58], shR: [21, -79], elR: [21, -64], fiR: [6, -60],
    chainWrap: 1,
  },
  // victory: arms up, then the beckon
  showboat: { extends: 'victory', head: { at: [0, -101], face: 'grin', tilt: 'up', look: [0, -1] } },
};

// One set of layers per stage; everything but the outfit is shared.
function layers(stage) {
  const gold = stage >= 3;
  return {
    id: `dash${stage}`,
    build: 'medium',
    // athletic and light on his feet: a V-taper, no belly
    body: { shoulders: 1.05, torsoLen: 1.02, legLen: 1.02, dims: { waistW: 14.5, belly: 1.2, deltoid: 7, upperArm: [6.3, 5.2], forearm: [5.2, 4.3] } },
    palettes: { default: `dash${stage}` },
    torsoMaterial: 'skin',
    poses,
    ramps: {
      skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
      glove: ['gloveHi', 'glove', 'gloveDk'],
      cuff: stage === 1 ? ['gold', 'gold', 'goldDk'] : stage === 2 ? ['trim', 'trim', 'trimSh'] : ['gold', 'gold', 'goldDk'],
      shorts: ['tealHi', 'teal', 'tealDk'],
      sock: ['sockHi', 'sock', 'tealDk'],
      boot: ['bootHi', 'boot', 'bootDk'],
      sole: stage >= 4 ? ['gold', 'goldDk', 'outline'] : ['trimSh', 'bootDk', 'outline'],
      hair: ['hairHi', 'hair', 'hairDk'],
      gold: ['gold', 'gold', 'goldDk'],
      trim: ['trim', 'trim', 'trimSh'],
      patch: ['patch', 'patch', 'patchDk'],
    },

    head(ctx, H) {
      const { cv, ramps, c } = ctx;
      const x = Math.round(H.x), y = Math.round(H.y);
      const [lx, ly] = H.look;
      const fx = x + lx, fy = y + ly;
      const face = H.face || 'neutral';
      ears(ctx, H, ramps.skin, [2.2, 3.4]);
      const hm = skull(ctx, H, ramps.skin, 'chin');
      // fauxhawk: a short crest swept up and over to the viewer-right, the sides faded
      // a close crop on top, faded at the sides...
      const top = ctx.mask().ellipse(x + lx * 0.3, y - 7, H.rx - 1, 6).cut(ctx.mask().rect(x - 14, y - 5, 28, 12));
      cv.part(top, { ramp: ramps.hair, bevel: 2, inner: 'line' });
      for (let Y = y - 5; Y < y; Y++) for (let X = Math.round(x - H.rx); X <= x + H.rx; X++) if (hm.in(X, Y) && Math.abs(X - x) > H.rx - 3 && (X + Y) & 1) cv.px(X, Y, c('hair'));
      // ...and the crest down the middle, swept up and over to the viewer-right
      const crest = ctx.mask().poly([[x - 4, y - 10], [x - 2, y - 15], [x + 2, y - 17], [x + 8, y - 16], [x + 11, y - 13], [x + 6, y - 12], [x + 4, y - 9]]);
      cv.part(crest, { ramp: ramps.hair, bevel: 2, inner: 'line' });
      for (const [dx, dy] of [[0, -14], [2, -15], [4, -15], [6, -14], [8, -14]]) cv.px(x + dx, y + dy, c('hairHi'));
      // the swoop's tip over the brow
      for (const [dx, dy] of [[5, -6], [6, -6], [7, -5]]) cv.px(x + dx, y + dy, c('hair'));
      if (stage === 7) {
        // a dead laurel: half the leaves gone, the rest black, no halo; an iron collar low on the neck is drawn with the torso
        for (let k = -5; k <= 5; k++) {
          if (k === -3 || k === -1 || k === 2 || k === 4) continue;
          const lx2 = x + k * 2.3 + lx * 0.3, ly2 = y - 9 + Math.abs(k) * 0.55;
          cv.part(ctx.mask().ellipse(lx2, ly2, 1.9, 1.2, 1, k * 0.15 + 0.5), { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
        }
        for (const [dx, dy] of [[-6, 6], [-5, 8], [7, 3], [6, 5]]) cv.px(x + lx * 0.3 + dx, y + dy, c('skinSh')); // bruises
      } else if (stage === 8) {
        // the King's circlet: a band of black iron across the brow with a ruby set in it, and two short spikes
        cv.part(ctx.mask().rect(x - H.rx + 1 + lx * 0.3, y - 9, H.rx * 2 - 2, 3), { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
        for (const dx of [-7, 7]) cv.part(ctx.mask().poly([[x + dx - 2 + lx * 0.3, y - 9], [x + dx + lx * 0.3, y - 14], [x + dx + 2 + lx * 0.3, y - 9]]), { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
        cv.part(ctx.mask().ellipse(x + lx * 0.3, y - 8, 2.2, 2), { ramp: ['halo', 'halo', 'goldDk'].map(c), bevel: 1, inner: 'line', shadow: false });
        for (const [dx, dy] of [[-6, 6], [-5, 8], [7, 3], [6, 5]]) cv.px(x + lx * 0.3 + dx, y + dy, c('skinSh')); // bruises
      } else if (stage >= 5) {
        // a laurel of gold leaves round the crown, and a halo floating above it
        for (let k = -5; k <= 5; k++) {
          if (stage === 6 && (k === -3 || k === 1 || k === 4)) continue; // (leaves missing)
          const lx2 = x + k * 2.3 + lx * 0.3, ly2 = y - 9 + Math.abs(k) * 0.55 - (k === 0 ? 0 : 0);
          cv.part(ctx.mask().ellipse(lx2, ly2, 1.9, 1.2, 1, k * 0.15), { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
          cv.px(lx2, ly2 - 1, c('halo'));
        }
        // the halo (stage VI: cracked, slipping to one side, a piece gone)
        const hx = x + lx * 0.3 + 1 + (stage === 6 ? 3 : 0), hy = y - 22 + (stage === 6 ? 2 : 0);
        const ringM = ctx.mask().ellipse(hx, hy, 11, 3).cut(ctx.mask().ellipse(hx, hy, 8, 1.4));
        if (stage === 6) ringM.cut(ctx.mask().rect(hx - 1, hy - 5, 4, 10));
        cv.part(ringM, { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
        for (const dx of [-7, -2, 4, 8]) if (stage !== 6 || dx < 0) cv.px(hx - 1 + dx, hy - 2, c('halo'));
        if (stage === 6) for (const [dx, dy] of [[-3, 5], [-4, 7], [3, 4]]) cv.px(x + lx * 0.3 + dx + 5, y + dy - 4, c('skinHi')); // sweat
      }
      eyes(ctx, fx, fy, face, 0);
      // one eyebrow always up: the viewer-right brow sits higher
      brows(ctx, fx, fy, face, ramps.hair, { len: 4.2, thick: 1.1, y: -4 });
      if (['neutral', 'focus', 'grin', 'strain'].includes(face)) for (let k = 0; k < 4; k++) { cv.px(fx + 3 + k, fy - 6 - (k === 2 ? 1 : 0), c('hair')); cv.px(fx + 3 + k, fy - 5, c('skin')); }
      nose(ctx, fx, fy, ramps.skin, [2, 2], 3.4);
      if (face === 'neutral') {
        // the smirk: a flat line kinked up at the viewer-right corner
        for (let i = -3; i <= 2; i++) cv.px(fx + i, fy + 9, c('outline'));
        cv.px(fx + 3, fy + 8, c('outline')); cv.px(fx + 4, fy + 7, c('outline'));
        cv.px(fx + 3, fy + 10, c('skinSh'));
      } else mouth(ctx, fx, fy + 8.5, face, { w: 3.4 });
      cv.shade(fx - 6, fy + 5, 1); cv.shade(fx + 6, fy + 5, 1);
    },

    torso(ctx) {
      const { cv, J, c, D, ramps, pose } = ctx;
      const n = J.neck, w = J.waist, ch = J.chest, h = J.hip;
      const tm = ctx.torsoMask;
      // lean muscle: pecs, the centre line, a hint of abs
      for (const s of [-1, 1]) cv.line(ch[0] + s * 2, ch[1] + 6, ch[0] + s * (D.chestW - 6), ch[1] + 4, (X, Y) => { if (tm.in(X, Y)) cv.shade(X, Y, 1); });
      cv.line(n[0], n[1] + 8, w[0], w[1] - 4, (X, Y) => { if (tm.in(X, Y) && (X + Y) & 1) cv.shade(X, Y, 1); });
      for (let k = 0; k < 2; k++) for (const s of [-1, 1]) cv.shade(w[0] + s * 4, w[1] - 6 - k * 5, 1);
      // waistband: white, gold from stage III
      cv.part(ctx.mask().rect(w[0] - D.waistW - 1, w[1] - 4, D.waistW * 2 + 2, 4).clip(ctx.shortsMask), { ramp: gold ? ramps.gold : ramps.trim, bevel: 1, inner: 'line', shadow: false });
      if (pose.lying) return;
      const sm = ctx.shortsMask;
      // piping down both sides (stage II on)
      if (stage >= 2) {
        for (const s of [-1, 1]) {
          const x0 = Math.round(h[0] + s * (D.hipSpread + D.thigh[0] + 0.5));
          for (let Y = Math.round(w[1]); Y < h[1] + 12; Y++) for (const dx of [0, -s]) if (sm.in(x0 + dx, Y)) { cv.px(x0 + dx, Y, c(dx ? 'trimSh' : 'trim')); break; }
        }
      }
      // the sponsor patch on the viewer-left leg (stage II and III)
      if (stage === 2 || stage === 3) {
        const px = Math.round(h[0] - D.hipSpread - 2), py = Math.round(h[1] + 1);
        cv.part(ctx.mask().rect(px - 3, py, 6, 4).clip(sm), { ramp: ramps.patch, bevel: 1, inner: 'line', shadow: false });
        cv.px(px - 1, py + 1, c('white')); cv.px(px + 1, py + 2, c('white'));
      }
      // satin sheen down the front (stage III on)
      if (stage >= 3) for (let Y = Math.round(w[1]); Y < h[1] + 8; Y++) for (const X of [Math.round(h[0] - D.hipSpread + 2), Math.round(h[0] + D.hipSpread - 2)]) if (sm.in(X, Y) && (Y & 1)) cv.px(X, Y, c('tealHi'));
      // the gold chain (stage III): a dotted arc under the neck, a pendant
      if (stage === 3) {
        for (let k = -6; k <= 6; k++) { const X = Math.round(n[0] + k), Y = Math.round(n[1] + 4 + (k * k) / 9); cv.px(X, Y, c(k & 1 ? 'goldDk' : 'gold')); }
        cv.part(ctx.mask().ellipse(n[0], n[1] + 9, 1.6, 2), { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
      }
      // Dash in Chains: an iron collar, and a dull red link where the shadow chain is fixed to it
      if (stage === 7) {
        cv.part(ctx.mask().ellipse(n[0], n[1] + 3, 8.4, 2.8).cut(ctx.mask().ellipse(n[0], n[1] + 1.6, 5.6, 1.8)), { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
        cv.part(ctx.mask().ellipse(n[0], n[1] + 7, 1.8, 2.4), { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
        cv.px(n[0], n[1] + 7, c('halo'));
      }
      // Dash, the King's Champion: a black breastplate with the crown of Vorgath in red on it, and a thin red line at the neck where the collar was
      if (stage === 8) {
        cv.part(ctx.mask().poly([[n[0] - 10, n[1] + 3], [n[0] + 10, n[1] + 3], [ch[0] + D.chestW - 3, ch[1] + 2], [w[0] + D.waistW - 3, w[1] - 5], [w[0] - D.waistW + 3, w[1] - 5], [ch[0] - D.chestW + 3, ch[1] + 2]]).clip(tm), { ramp: ramps.gold, bevel: 4, inner: 'line', shadow: false });
        const cx = Math.round(ch[0]), cy = Math.round(ch[1] + 3);
        for (const [dx, dy] of [[-5, 3], [-5, 2], [-5, 1], [-3, 2], [-1, 1], [-1, 2], [0, 0], [0, 1], [0, 2], [1, 1], [1, 2], [3, 2], [5, 1], [5, 2], [5, 3]]) cv.px(cx + dx, cy + dy, c('halo'));
        for (let i = -5; i <= 5; i++) cv.px(cx + i, cy + 5, c('halo'));
        for (let i = -7; i <= 7; i++) cv.px(n[0] + i, n[1] + 4 + Math.round((i * i) / 30), c('halo'));
      }
      // the DM crest (stage IV): a gold shield on the front of the trunks
      if (stage >= 4) {
        const cx = Math.round(w[0]), cy = Math.round(w[1] + 3);
        cv.part(ctx.mask().poly([[cx - 5, cy], [cx + 5, cy], [cx + 5, cy + 4], [cx, cy + 8], [cx - 5, cy + 4]]).clip(sm), { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
        for (const [dx, dy] of [[-2, 2], [-2, 3], [-2, 4], [-1, 2], [-1, 5], [0, 3], [0, 4], [2, 2], [2, 3], [2, 4], [3, 3]]) cv.px(cx + dx, cy + dy, c('tealDk'));
      }
    },

    // the glint on the glove (flashbulb, pointing at the screen) and falling sparks
    front(ctx) {
      const { cv, J, c, ramps, pose } = ctx;
      if (stage === 7 && !pose.lying) {
        // iron cuffs on both wrists and a length of chain hanging from each; plain boots
        for (const s of ['L', 'R']) {
          const f = J['fi' + s], e = J['el' + s], d = s === 'L' ? -1 : 1;
          const mx = (f[0] * 2 + e[0]) / 3, my = (f[1] * 2 + e[1]) / 3;
          cv.part(ctx.mask().ellipse(mx, my, 4.6, 3), { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
          cv.px(mx, my, c('halo'));
          for (let j = 0; j < 6; j++) { const X = f[0] + d * (2 + (j >> 1)), Y = f[1] + 6 + j * 3; cv.px(X, Y, c(j & 1 ? 'gold' : 'trim')); cv.px(X, Y + 1, c('goldDk')); }
        }
      }
      if (stage === 8 && !pose.lying) {
        // spiked bracers of black iron on both wrists (the cuffs the chains hung from), a ruby stud in each
        for (const s of ['L', 'R']) {
          const f = J['fi' + s], e = J['el' + s], d = s === 'L' ? -1 : 1;
          const mx = (f[0] * 2 + e[0]) / 3, my = (f[1] * 2 + e[1]) / 3;
          cv.part(ctx.mask().ellipse(mx, my, 4.8, 3.2), { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
          cv.px(mx, my, c('halo'));
          for (const k of [-1, 1]) cv.part(ctx.mask().poly([[mx + k * 2 - 1, my - 3], [mx + k * 2 + d, my - 7], [mx + k * 2 + 1, my - 3]]), { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
        }
      }
      if (pose.chainWrap && stage >= 7) {
        // the shadow chain wound round each fist: three turns, red at the link
        for (const s of ['L', 'R']) { const f = J['fi' + s]; for (let i = 0; i < 3; i++) cv.line(f[0] - 5, f[1] - 3 + i * 3, f[0] + 5, f[1] - 2 + i * 3, (X, Y) => cv.px(X, Y, c(i === 1 ? 'halo' : 'gold'))); }
      }
      if (stage >= 5 && stage < 7 && !pose.lying) {
        // winged boots: a fan of three gold feathers at each ankle, swept back
        for (const [ft, s] of [[J.ftL, -1], [J.ftR, 1]]) {
          for (const [dx, dy, len] of (stage === 6 ? (s < 0 ? [[-1, -5, 9]] : [[-2, -8, 7], [0, -2, 6]]) : [[-2, -8, 9], [-1, -5, 11], [0, -2, 8]])) {
            cv.part(ctx.mask().poly([[ft[0] + s * (dx + 3), ft[1] + dy], [ft[0] + s * (dx + 3 + len), ft[1] + dy - 4], [ft[0] + s * (dx + 2 + len), ft[1] + dy - 1], [ft[0] + s * (dx + 3), ft[1] + dy + 2]]), { ramp: ramps.gold, bevel: 1, inner: 'line', shadow: false });
          }
          cv.px(ft[0] + s * 8, ft[1] - 14, c('halo'));
        }
      }
      if (pose.glint) {
        const [x, y] = J.fiR;
        const g = pose.glint === 1 ? [x - 4, y - 8] : [x + 2, y - 12];
        for (const [dx, dy] of [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1], [-2, 0], [2, 0], [0, -2], [0, 2], [-3, 0], [3, 0]]) cv.px(g[0] + dx, g[1] + dy, c(Math.abs(dx) + Math.abs(dy) > 1 ? 'glint' : 'white'));
      }
      if (pose.sparks) {
        const pts = [[-14, -8], [-10, -14], [-4, -18], [4, -18], [10, -14], [14, -8], [-12, 2], [12, 2], [-7, -22], [7, -22]];
        const [x, y] = [(J.fiL[0] + J.fiR[0]) / 2, (J.fiL[1] + J.fiR[1]) / 2];
        for (const [dx, dy] of pts) cv.px(Math.round(x + dx), Math.round(y + dy), c((dx + dy) & 2 ? 'glint' : 'gold'));
      }
    },
  };
}

export const dashLayers = { dash1: layers(1), dash2: layers(2), dash3: layers(3), dash4: layers(4), dash5: layers(5), dash6: layers(6), dash7: layers(7), dash8: layers(8) };
