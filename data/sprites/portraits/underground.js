// Intro-card portraits: the Underground Circuit. Static, Crowbar Cade, Null and
// The Warden (drawn in his LOCKDOWN uniform).
import { setup, mirror, bust, earsP, headP, eyesP, browsP, noseP, mouthP, stubbleP } from './kit.js';

export function staticPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  // snow in the background, a torn scanline
  for (let y = 0; y < 44; y += 1) for (let x = 0; x < 64; x++) if (((x * 7 + y * 13) ^ (x * y)) % 23 === 0) cv.px(x, y, c(((x + y) & 3) ? 'hairDk' : 'hair'));
  bust(k, skin, skin, { neck: 7, top: 47, slope: 9 });
  // the coax cable round his neck
  for (let x = 20; x <= 44; x++) { const y = 47 + Math.round(((x - 32) / 12) ** 2 * -3 + 3); cv.px(x, y, c('outline')); cv.px(x, y - 1, c('hairDk')); }
  cv.part(m().rect(30, 50, 4, 6), { ramp: hair, bevel: 1, inner: 'line', shadow: false });
  earsP(k, skin, 19, 31, 2.4, 3.8);
  headP(k, skin, { rx: 13, ry: 16, cy: 29, jawY: 36, jawRx: 10.5, jawRy: 10 });
  // hair standing straight up
  const hr = m().ellipse(32, 18, 14, 6).cut(m().rect(0, 20, 64, 40));
  for (const [x, h, lean] of [[21, 12, -4], [26, 16, -2], [32, 18, 0], [38, 16, 2], [43, 12, 4]]) hr.poly([[x - 3.5, 18], [x + lean, 18 - h], [x + 3.5, 18]]);
  cv.part(hr, { ramp: hair, bevel: 2, inner: 'line' });
  for (const [x, h] of [[26, 12], [32, 14], [38, 12]]) cv.line(x, 17, x, 18 - h, (X, Y) => { if (hr.in(X, Y)) cv.px(X, Y, c('hairHi')); });
  for (const [dx, dy] of [[0, 0], [1, -1], [2, -1], [3, 0], [4, -2]]) cv.px(27 + dx, 3 + dy, c('eye'));
  // eyes: wired, with dark rings
  eyesP(k, { y: 27, x0: 22, x1: 28, style: 'wide', iris: 'eye' });
  for (const s of [1, -1]) for (let x = 22; x <= 28; x++) cv.shade(s > 0 ? x : mirror(x), 32, 1);
  browsP(k, hair, { y: 23, r0: 1, r1: 0.8, tilt: -0.5 });
  noseP(k, skin, { y: 35, rx: 2.4, ry: 2.4 });
  mouthP(k, { y: 42, x0: 28, x1: 36, kind: 'grin' });
  cv.px(37, 41, c('outline'));
  return cv.toSprite(0, 0, false);
}

export function cadePortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  bust(k, skin, skin, { neck: 13, top: 43, slope: 16 });
  // tank top straps and the chain with its padlock
  cv.part(m().poly([[8, 60], [12, 44], [18, 43], [24, 60]]).poly([[56, 60], [52, 44], [46, 43], [40, 60]]).poly([[22, 54], [42, 54], [44, 60], [20, 60]]), { ramp: r('tankHi', 'tank', 'tankSh', 'outline'), bevel: 2, inner: 'line' });
  for (let x = 20; x <= 44; x++) { const y = 47 + Math.round((1 - ((x - 32) / 12) ** 2) * 4); cv.px(x, y, c(x & 1 ? 'chain' : 'chainDk')); }
  cv.part(m().rect(29, 51, 7, 6), { ramp: r('chain', 'chain', 'chainDk'), bevel: 1, inner: 'line', shadow: false });
  earsP(k, skin, 14, 29, 3.4, 5);
  cv.part(m().ellipse(49, 29, 4.4, 5), { ramp: skin, bevel: 1, inner: 'soft' }); // cauliflower ear
  const hm = headP(k, skin, { rx: 17, ry: 16, cy: 25, jawY: 33, jawRx: 17, jawRy: 12 });
  for (let y = 9; y < 17; y++) for (let x = 15; x < 49; x++) if (hm.in(x, y) && hm.in(x, y - 1)) cv.px(x, y, c((x + y) % 3 ? 'hair' : 'hairHi'));
  for (let i = 0; i < 6; i++) cv.px(38 + i, 9 + i, c('skinHi'));
  eyesP(k, { y: 25, x0: 21, x1: 27, style: 'narrow' });
  browsP(k, r('hairHi', 'hair', 'outline'), { y: 21, r0: 2.6, r1: 2.2, tilt: 1.4 });
  noseP(k, skin, { y: 32, rx: 4.6, ry: 3 });
  for (let x = 27; x <= 38; x++) { cv.px(x, 30, c('tape')); if (x & 1) cv.px(x, 31, c('tapeSh')); }
  stubbleP(k, hm, 34, 47, 1);
  mouthP(k, { y: 40, x0: 26, x1: 38, kind: 'grin' });
  cv.px(33, 39, c('mouth')); // the missing tooth
  return cv.toSprite(0, 0, false);
}

export function nullPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  bust(k, skin, skin, { neck: 9, top: 45, slope: 12 });
  // barcode on the side of the neck
  for (const [x, h] of [[39, 7], [40, 7], [42, 5], [44, 7], [45, 4]]) for (let y = 0; y < h; y++) cv.px(x, 38 + y, c('eye'));
  earsP(k, skin, 17, 30, 2.8, 4.4);
  headP(k, skin, { rx: 15, ry: 17, cy: 27, jawY: 34, jawRx: 13, jawRy: 11 });
  // two small dark eyes and nothing else to speak of
  for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); for (const [x, y] of [[25, 27], [26, 27], [25, 28], [26, 28]]) cv.px(X(x), y, c('eye')); }
  cv.shade(32, 32, 1); cv.shade(32, 33, 1); cv.shade(31, 34, 1);
  for (let x = 29; x <= 35; x++) cv.px(x, 41, c('skinDk'));
  return cv.toSprite(0, 0, false);
}

export function wardenPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'outline');
  // the uniform: collar, epaulettes, the star badge
  bust(k, r('shirtHi', 'shirt', 'shirtSh', 'shirtDk'), skin, { neck: 12, top: 44, slope: 15 });
  cv.part(m().poly([[20, 43], [31, 43], [26, 52]]).poly([[44, 43], [33, 43], [38, 52]]), { ramp: r('shirtHi', 'shirt', 'shirtSh', 'outline'), bevel: 1, inner: 'line' });
  cv.stamp(['..#..', '#####', '.###.', '.#.#.'], 46, 52, { '#': c('badge') });
  for (const x of [4, 5, 58, 59]) for (let y = 49; y < 53; y++) cv.px(x, y, c('seam'));
  earsP(k, skin, 14, 29, 3.2, 4.8);
  const hm = headP(k, skin, { rx: 16, ry: 16, cy: 27, jawY: 34, jawRx: 16, jawRy: 11.5 });
  // grey flat-top
  cv.part(m().rect(17, 6, 30, 9).clip(m().ellipse(32, 20, 17, 16)), { ramp: hair, bevel: 1, inner: 'line' });
  for (let x = 18; x < 47; x += 2) cv.px(x, 7, c('hairHi'));
  eyesP(k, { y: 26, x0: 21, x1: 27, style: 'narrow' });
  browsP(k, hair, { y: 22, r0: 2.2, r1: 1.8, tilt: 1.6 });
  noseP(k, skin, { y: 32, rx: 3.8, ry: 3.2 });
  cv.part(m().ellipse(26, 38, 7, 2.8, 1, -0.15).ellipse(mirror(26), 38, 7, 2.8, 1, 0.15), { ramp: hair, bevel: 2, inner: 'line' });
  for (let x = 29; x <= 35; x++) cv.px(x, 42, c('mouth'));
  for (let i = 0; i < 5; i++) if (hm.in(27 + i, 46 - (i >> 1))) cv.px(27 + i, 46 - (i >> 1), c('skinHi'));
  return cv.toSprite(0, 0, false);
}
