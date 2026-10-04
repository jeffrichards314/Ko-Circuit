// The belts of the belt ceremony (spec §5, §19): one strap-and-plate sprite per circuit, its name stamped on the plate.
import { drawText, textWidth } from '../engine/font.js';
import { makePalette, spritePalette } from '../engine/palette.js';
import { Mask, SpriteCanvas } from '../engine/sprites.js';
import { SHORT } from '../../data/circuits.js';

export const BELTS = {
  rookie: { strap: [[26, 8, 8], [20, 4, 5], [11, 2, 3]], plate: [[31, 31, 31], [22, 23, 26], [14, 15, 19], [7, 8, 11]] },
  minor: { strap: [[10, 22, 12], [5, 15, 8], [2, 8, 4]], plate: [[31, 30, 14], [29, 22, 4], [20, 13, 2], [11, 6, 1]] },
  metro: { strap: [[8, 12, 22], [4, 6, 15], [2, 3, 8]], plate: [[31, 31, 31], [22, 23, 26], [14, 15, 19], [7, 8, 11]] },
  major: { strap: [[6, 6, 8], [3, 3, 4], [1, 1, 2]], plate: [[31, 30, 14], [29, 22, 4], [20, 13, 2], [11, 6, 1]] },
  carnival: { strap: [[20, 6, 22], [13, 3, 15], [7, 1, 8]], plate: [[31, 30, 14], [29, 22, 4], [20, 13, 2], [11, 6, 1]] },
  continental: { strap: [[24, 4, 7], [16, 2, 5], [8, 1, 3]], plate: [[31, 30, 14], [29, 22, 4], [20, 13, 2], [11, 6, 1]] },
  world: { strap: [[8, 12, 30], [3, 5, 16], [1, 2, 8]], plate: [[31, 31, 31], [24, 25, 28], [15, 16, 20], [7, 8, 11]] },
  storm: { strap: [[10, 11, 15], [5, 6, 8], [2, 2, 4]], plate: [[31, 30, 14], [30, 25, 4], [20, 14, 2], [11, 6, 1]] },
  legends: { strap: [[7, 6, 9], [3, 2, 4], [1, 1, 2]], plate: [[31, 31, 22], [30, 26, 10], [21, 15, 3], [11, 6, 1]] },
  grandprix: { strap: [[18, 6, 26], [10, 2, 15], [5, 1, 8]], plate: [[31, 30, 14], [29, 22, 4], [20, 13, 2], [11, 6, 1]] },
  dream: { strap: [[29, 23, 6], [21, 14, 2], [11, 6, 1]], plate: [[31, 31, 28], [29, 29, 30], [19, 19, 23], [9, 9, 13]] },
  underground: { strap: [[12, 12, 13], [6, 6, 7], [2, 2, 3]], plate: [[26, 18, 10], [22, 11, 4], [13, 6, 2], [6, 3, 1]] },
  nightmare: { strap: [[14, 5, 18], [8, 2, 11], [3, 1, 5]], plate: [[28, 28, 26], [21, 20, 20], [13, 12, 13], [6, 5, 7]] },
  // the Pantheon (§18): white-and-gold straps, a brighter plate for each step up
  p1: { strap: [[31, 29, 22], [28, 22, 12], [19, 12, 4]], plate: [[31, 31, 26], [31, 27, 10], [22, 15, 3], [12, 6, 1]] },
  p2: { strap: [[26, 29, 31], [16, 22, 29], [8, 13, 20]], plate: [[31, 31, 31], [27, 29, 31], [17, 21, 27], [8, 11, 17]] },
  p3: { strap: [[24, 22, 20], [14, 12, 11], [6, 5, 5]], plate: [[31, 31, 26], [31, 26, 8], [22, 15, 2], [12, 6, 1]] },
  p4: { strap: [[10, 10, 24], [5, 5, 15], [2, 2, 8]], plate: [[31, 31, 28], [26, 26, 31], [15, 16, 24], [7, 7, 13]] },
  p5: { strap: [[14, 14, 18], [8, 8, 11], [3, 3, 5]], plate: [[31, 24, 12], [29, 14, 5], [19, 8, 2], [10, 4, 1]] },
  p6: { strap: [[26, 26, 31], [16, 15, 26], [8, 7, 15]], plate: [[31, 31, 31], [25, 25, 31], [16, 16, 25], [8, 8, 14]] },
  p7: { strap: [[31, 31, 28], [29, 26, 14], [20, 15, 4]], plate: [[31, 31, 29], [31, 28, 10], [23, 16, 3], [13, 7, 1]] },
  halcyon: { strap: [[31, 31, 31], [30, 27, 12], [20, 14, 3]], plate: [[31, 31, 31], [31, 30, 16], [26, 19, 5], [14, 8, 1]] },
  // the Underworld (§18): black straps and dull plates, darker and hotter as you go down
  u1: { strap: [[7, 11, 15], [3, 6, 9], [1, 2, 4]], plate: [[22, 28, 28], [12, 20, 21], [6, 11, 13], [2, 5, 7]] },
  u2: { strap: [[13, 5, 4], [7, 2, 2], [3, 1, 1]], plate: [[31, 24, 10], [29, 13, 4], [17, 6, 2], [8, 2, 1]] },
  u3: { strap: [[10, 11, 15], [5, 6, 9], [2, 2, 4]], plate: [[26, 27, 31], [16, 17, 23], [9, 10, 15], [4, 4, 8]] },
  u4: { strap: [[10, 8, 12], [5, 4, 7], [2, 1, 3]], plate: [[27, 27, 29], [17, 17, 21], [9, 8, 12], [4, 3, 6]] },
  u5: { strap: [[14, 6, 3], [8, 3, 2], [3, 1, 1]], plate: [[31, 28, 12], [31, 16, 3], [20, 7, 2], [10, 3, 1]] },
  u6: { strap: [[8, 8, 14], [4, 4, 8], [1, 1, 3]], plate: [[29, 27, 31], [19, 15, 29], [10, 7, 17], [4, 3, 9]] },
  vorgath: { strap: [[16, 3, 6], [9, 1, 3], [3, 0, 1]], plate: [[31, 22, 22], [28, 8, 10], [17, 3, 5], [8, 1, 2]] },
  // the Void (Phase E): white straps on black, the plate a paler white for each fragment, ZERO's own the whitest
  v1: { strap: [[30, 30, 31], [17, 17, 23], [7, 7, 12]], plate: [[31, 31, 31], [24, 26, 31], [14, 16, 24], [6, 7, 13]] },
  v2: { strap: [[30, 30, 31], [18, 18, 22], [8, 8, 11]], plate: [[31, 31, 29], [28, 26, 22], [17, 15, 14], [8, 7, 7]] },
  v3: { strap: [[31, 31, 31], [22, 22, 26], [10, 10, 15]], plate: [[31, 31, 31], [29, 29, 31], [20, 20, 26], [10, 10, 15]] },
  zeroTrue: { strap: [[31, 31, 31], [26, 26, 30], [14, 14, 19]], plate: [[31, 31, 31], [31, 31, 31], [24, 24, 29], [12, 12, 18]] },
};
// (the Origin Belt is not a belt of the halo: ORIGIN's halo is every belt of the game, and this one is what he gives to whoever beats his true form: white-gold, a sun on the plate)
export const ORIGIN_BELT = { strap: [[31, 31, 26], [31, 26, 8], [24, 14, 2]], plate: [[31, 31, 31], [31, 29, 14], [29, 20, 4], [18, 10, 1]] };
// short names that fit on the belt plate
export const PLATE = { grandprix: 'G.P.', dream: 'WORLD', underground: 'CAGE', nightmare: 'VOID', p1: 'DAWN', p2: 'CLOUD', p3: 'HEROES', p4: 'STARS', p5: 'FORGE', p6: 'MIRROR', p7: 'SUMMIT', halcyon: 'SUN', u1: 'SHORE', u2: 'ASH', u3: 'CHAINS', u4: 'FALLEN', u5: 'FURNACE', u6: 'ABYSS', vorgath: 'KING', v1: 'BASICS', v2: 'SENSES', v3: 'MIND', zeroTrue: 'ZERO', origin: 'ORIGIN' };
const BELT_DEFAULT = { strap: [[9, 9, 12], [4, 4, 7], [2, 2, 3]], plate: [[31, 30, 14], [29, 22, 4], [20, 13, 2], [11, 6, 1]] };

export function beltSprite(id) {
  const B = id === 'origin' ? ORIGIN_BELT : BELTS[id] || BELT_DEFAULT;
  const pal = spritePalette(makePalette('belt.' + id, {
    outline: [2, 1, 2], strapHi: B.strap[0], strap: B.strap[1], strapDk: B.strap[2],
    plateHi: B.plate[0], plate: B.plate[1], plateSh: B.plate[2], plateDk: B.plate[3],
    gem: [27, 5, 8], gemHi: [31, 20, 22], stitch: [28, 26, 20],
  }));
  const c = (k) => pal.idx(k), r = (...k) => k.map(c);
  const w = 180, h = 56;
  const cv = new SpriteCanvas(w, h, c('outline'));
  const m = () => new Mask(w, h);
  const strap = m().capsule(8, 28, 172, 28, 10, 10);
  cv.part(strap, { ramp: r('strapHi', 'strap', 'strapDk'), bevel: 4 });
  for (let x = 12; x < 170; x += 3) { cv.px(x, 20, c('stitch')); cv.px(x, 36, c('stitch')); }
  for (const x of [48, 132]) {
    cv.part(m().ellipse(x, 28, 12, 10), { ramp: r('plateHi', 'plate', 'plateSh', 'plateDk'), bevel: 5 });
    cv.part(m().ellipse(x, 28, 4, 4), { ramp: r('gemHi', 'gem', 'plateDk'), bevel: 2, shadow: false });
  }
  for (const x of [22, 158]) cv.part(m().ellipse(x, 28, 7, 7), { ramp: r('plateHi', 'plate', 'plateSh', 'plateDk'), bevel: 3 });
  const plate = m().ellipse(90, 28, 30, 25);
  cv.part(plate, { ramp: r('plateHi', 'plate', 'plateSh', 'plateDk'), bevel: 10 });
  cv.part(m().ellipse(90, 16, 5, 4), { ramp: r('gemHi', 'gem', 'plateDk'), bevel: 2, shadow: false });
  for (let a = 0; a < 12; a++) { const t = (a / 12) * Math.PI * 2; cv.px(90 + Math.cos(t) * 27, 28 + Math.sin(t) * 22, c('plateHi')); }
  // circuit name stamped on the plate
  const label = PLATE[id] || SHORT[id] || 'CHAMP';
  const shim = { px: (x, y) => cv.px(x, y, c('plateDk')) };
  drawText(shim, label, Math.round(90 - textWidth(label, false) / 2), 25, 0, { mono: false });
  drawText({ px: (x, y) => cv.px(x, y, c('plateSh')) }, 'KO', 84, 36, 0, { mono: false });
  return { sprite: cv.toSprite(0, 0, false), pal: pal.u32 };
}

