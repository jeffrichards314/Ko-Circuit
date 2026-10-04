// Intro-card portraits: Old Man Rourke, Iron Jaw Ignatius, Duchess Kane, The Mirror.
import { setup, mirror, bust, earsP, headP, eyesP, browsP, noseP, mouthP, stubbleP } from './kit.js';

export function rourkePortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  bust(k, skin, skin, { neck: 10, top: 44, slope: 13 });
  // grey chest hair at the collarbones
  for (let y = 50; y < 60; y++) for (let x = 22; x < 42; x++) if ((x * 3 + y * 5) % 4 === 0) cv.px(x, y, c(y > 55 ? 'hair' : 'hairDk'));
  // a lumpy cauliflower ear on the left, a normal one on the right
  cv.part(m().ellipse(14.5, 30, 4.6, 6.2).ellipse(mirror(15.5), 30, 3.4, 5.2), { ramp: skin, bevel: 3 });
  cv.shade(14, 28, 1); cv.shade(13, 31, 1); cv.shade(15, 33, 1);
  const hm = headP(k, skin, { rx: 16, ry: 17, cy: 26, jawY: 34, jawRx: 15.5, jawRy: 11.5 });
  // white fringe round the sides, bald dome with a shine
  cv.part(m().ellipse(32, 27, 17.5, 13).cut(m().ellipse(32, 20, 15, 12)).cut(m().rect(0, 31, 64, 30)).cut(m().rect(20, 16, 24, 16)), { ramp: hair, bevel: 2, inner: 'line' });
  cv.px(24, 12, c('white')); cv.px(25, 11, c('white')); cv.px(26, 11, c('skinHi')); cv.px(23, 13, c('skinHi'));
  for (const y of [16, 18]) for (let x = 25; x <= 39; x++) if ((x + y) % 3) cv.shade(x, y, 1);
  eyesP(k, { y: 26, x0: 21, x1: 27, style: 'heavy' });
  // the wink: squeeze the right eye shut
  for (let x = 36; x <= 43; x++) for (let y = 25; y <= 28; y++) cv.px(x, y, c('skin'));
  for (let x = 38; x <= 41; x++) cv.px(x, 27, c('outline'));
  cv.px(37, 26, c('outline')); cv.px(42, 26, c('outline'));
  browsP(k, hair, { y: 22, r0: 2.4, r1: 2, tilt: 1 });
  noseP(k, r('skinHi', 'ruddy', 'skinSh', 'skinDk'), { y: 33, rx: 4.6, ry: 3.8 });
  cv.px(33, 28, c('skinSh')); cv.px(34, 29, c('skinHi')); // the break in it
  cv.flat(m().ellipse(20, 34, 2.6, 1.5).ellipse(44, 34, 2.6, 1.5), c('ruddy'));
  // crooked grin under a handlebar mustache
  for (let x = 28; x <= 38; x++) cv.px(x, 44 - (x > 35 ? 1 : 0), c('mouth'));
  cv.part(m().ellipse(25, 39, 7.5, 2.8, 1, -0.2).ellipse(mirror(25), 39, 7.5, 2.8, 1, 0.2).capsule(18, 40, 14, 34, 1.8, 1.2).capsule(46, 40, 50, 34, 1.8, 1.2), { ramp: hair, bevel: 2, inner: 'line' });
  stubbleP(k, hm, 44, 50, 1);
  return cv.toSprite(0, 0, false);
}

export function ignatiusPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'outline');
  bust(k, r('steelHi', 'steel', 'steelDk', 'outline'), skin, { neck: 15, top: 43, slope: 18 });
  cv.part(m().ellipse(32, 45, 13, 7).cut(m().rect(0, 0, 64, 42)), { ramp: skin, bevel: 3, inner: 'line' });
  for (const [x, y] of [[10, 52], [16, 50], [48, 50], [54, 52]]) cv.px(x, y, c('rivet'));
  earsP(k, skin, 14.5, 28, 3.2, 4.8);
  // the anvil jaw: wider at the chin than at the temples
  const hm = headP(k, skin, { rx: 15, ry: 16, cy: 24, jawY: 36, jawRx: 18.5, jawRy: 12 });
  cv.part(m().rect(14, 28, 36, 14).ellipse(32, 42, 18, 5).add(hm), { ramp: skin, bevel: 6 });
  // flat-top
  cv.part(m().rect(17, 5, 30, 10).ellipse(32, 14, 15.5, 4).cut(m().rect(0, 16, 64, 50)), { ramp: hair, bevel: 1, inner: 'line' });
  for (let x = 19; x < 46; x += 2) cv.px(x, 6, c('hairHi'));
  eyesP(k, { y: 23, x0: 21, x1: 27, style: 'narrow' });
  browsP(k, hair, { y: 20, r0: 2.2, r1: 1.8, tilt: 1.4 });
  noseP(k, skin, { y: 30, rx: 4.2, ry: 3.4 });
  mouthP(k, { y: 38, x0: 25, x1: 39, kind: 'grin' });
  stubbleP(k, m().rect(14, 32, 36, 16), 32, 48, 1);
  for (let i = 0; i < 5; i++) cv.px(36 + i, 44 + (i >> 1), c('scar'));
  return cv.toSprite(0, 0, false);
}

export function duchessPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  // the tall chignon behind her head
  cv.part(m().ellipse(34, 8, 11, 8).ellipse(38, 3, 7, 5), { ramp: hair, bevel: 4, inner: 'line' });
  bust(k, r('satinHi', 'satin', 'satinDk', 'outline'), skin, { neck: 6, top: 49, slope: 8 });
  cv.part(m().rect(22, 44, 20, 16), { ramp: skin, bevel: 4, inner: 'line' });
  for (let x = 20; x < 44; x++) cv.px(x, 59, c(x & 1 ? 'white' : 'pearl'));
  for (let x = 25; x <= 39; x += 2) cv.px(x, 46 + (Math.abs(x - 32) < 4 ? 1 : 0), c('pearl'));
  earsP(k, skin, 19, 31, 2.4, 3.6);
  headP(k, skin, { rx: 13, ry: 16, cy: 28, jawY: 35, jawRx: 10.5, jawRy: 10 });
  cv.part(m().ellipse(32, 17, 14, 8).ellipse(25, 19, 7, 3).cut(m().rect(0, 21, 64, 40)).rect(18, 16, 3, 10).rect(43, 16, 3, 10), { ramp: hair, bevel: 3, inner: 'line' });
  for (const x of [24, 30, 36, 41]) cv.line(x, 11, x + 3, 19, (X, Y) => cv.shade(X, Y, -1));
  // tiara
  for (let x = 24; x <= 40; x++) cv.px(x, 12 + (Math.abs(x - 32) > 6 ? 1 : 0), c('gold'));
  for (const x of [27, 32, 37]) cv.px(x, 11 - (x === 32 ? 1 : 0), c('gold'));
  cv.px(32, 11, c('gem')); cv.px(32, 12, c('gem'));
  eyesP(k, { y: 27, x0: 22, x1: 28, style: 'normal' });
  for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); cv.px(X(21), 26, c('lash')); cv.px(X(20), 25, c('lash')); cv.px(X(22), 25, c('lash')); }
  browsP(k, hair, { y: 23, r0: 1.1, r1: 0.9, tilt: -1 });
  noseP(k, skin, { y: 34, rx: 2.6, ry: 2.4 });
  mouthP(k, { y: 41, x0: 29, x1: 35, kind: 'smile', inside: 'mouth' });
  for (let x = 30; x <= 34; x++) cv.px(x, 40, c('mouth'));
  cv.px(38, 38, c('outline')); // beauty mark
  return cv.toSprite(0, 0, false);
}

export function mirrorPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  bust(k, skin, skin, { neck: 9, top: 45, slope: 12 });
  // shard facets on the chest
  for (const [[x0, y0], [x1, y1]] of [[[14, 50], [32, 58]], [[32, 58], [50, 50]], [[22, 60], [30, 52]], [[42, 60], [36, 52]]]) {
    cv.line(x0, y0, x1, y1, (X, Y) => cv.px(X, Y, c('outline')));
    cv.line(x0, y0 - 1, x1, y1 - 1, (X, Y) => { if ((X + Y) % 3 === 0) cv.px(X, Y, c('glint')); });
  }
  earsP(k, skin, 18, 30, 2.6, 4.2);
  headP(k, skin, { rx: 14.5, ry: 17, cy: 27, jawY: 34, jawRx: 12.5, jawRy: 11 });
  // a hard chrome shine
  for (let i = 0; i < 7; i++) cv.px(22 + i, 12 - (i >> 1), c(i === 3 ? 'white' : 'glint'));
  // glowing slits
  for (const s of [1, -1]) {
    const X = (x) => (s > 0 ? x : mirror(x));
    for (let x = 21; x <= 28; x++) { cv.px(X(x), 25, c('outline')); cv.px(X(x), 28, c('eyeDk')); }
    for (let x = 22; x <= 27; x++) { cv.px(X(x), 26, c(x === 23 ? 'white' : 'eye')); cv.px(X(x), 27, c('eye')); }
  }
  // flat faceted nose, a slot of a mouth
  for (let y = 29; y < 36; y++) { cv.shade(32, y, 1); cv.shade(31, y, -1); }
  for (let x = 27; x <= 37; x++) cv.px(x, 41, c('mouth'));
  // your reflection in his forehead: a tiny glove
  cv.part(m().ellipse(36, 17, 2.4, 2.8), { ramp: r('glint', 'eye', 'eyeDk'), bevel: 1, inner: 'line', shadow: false });
  return cv.toSprite(0, 0, false);
}
