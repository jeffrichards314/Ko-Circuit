// Intro-card portraits: Lumberjack Lars, Hurricane Hank, Glacier, Maestro Vale.
import { setup, mirror, bust, earsP, headP, eyesP, browsP, noseP, mouthP, stubbleP } from './kit.js';

export function larsPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  const check = r('checkHi', 'check', 'checkDk', 'outline');
  bust(k, check, skin, { neck: 12, top: 44, slope: 14 });
  for (let y = 40; y < 60; y++) for (let x = 0; x < 64; x++) if (cv.filled(x, y) && cv.ramp[y * cv.w + x] === cv.rampId(check)) {
    const a = (x >> 2) & 1, b = (y >> 2) & 1;
    if (a && b) cv.px(x, y, c('black')); else if (a || b) cv.shade(x, y, 1);
  }
  for (const s of [1, -1]) cv.part(m().capsule(s > 0 ? 14 : mirror(14), 46, s > 0 ? 22 : mirror(22), 60, 1.8), { ramp: r('leatherHi', 'leather', 'outline'), bevel: 1, inner: 'line' });
  earsP(k, skin, 14, 30, 3.6, 5.4);
  headP(k, skin, { rx: 17, ry: 17, cy: 27, jawY: 34, jawRx: 17, jawRy: 12.5 });
  // long blond beard in two braids
  const bd = m().ellipse(32, 42, 17, 11).cut(m().rect(0, 20, 64, 17)).rect(14, 30, 5, 10).rect(45, 30, 5, 10);
  cv.part(bd, { ramp: hair, bevel: 4, inner: 'line' });
  for (const x of [27, 37]) for (let y = 50; y < 60; y += 3) cv.part(m().ellipse(x, y, 2.6, 2), { ramp: hair, bevel: 1, inner: 'line' });
  eyesP(k, { y: 25, x0: 21, x1: 27, style: 'normal', iris: 'check' });
  browsP(k, hair, { y: 21, r0: 2.4, r1: 2, tilt: 1 });
  noseP(k, r('skinHi', 'ruddy', 'skinSh', 'skinDk'), { y: 32, rx: 4.8, ry: 4 });
  cv.flat(m().ellipse(20, 32, 3, 1.6).ellipse(44, 32, 3, 1.6), c('ruddy'));
  cv.part(m().ellipse(26, 38, 7, 2.8, 1, -0.2).ellipse(mirror(26), 38, 7, 2.8, 1, 0.2), { ramp: hair, bevel: 2, inner: 'line' });
  mouthP(k, { y: 42, x0: 28, x1: 36, kind: 'grin' });
  // red knit toque with a cream pom-pom
  const dome = m().ellipse(32, 12, 18, 12).cut(m().rect(0, 17, 64, 40));
  cv.part(dome, { ramp: r('toque', 'check', 'checkDk'), bevel: 6 });
  for (let x = 16; x < 48; x += 3) cv.line(x, 3, x + (x < 32 ? 1 : -1), 13, (X, Y) => { if (dome.in(X, Y)) cv.shade(X, Y, 1); });
  cv.part(m().rect(13, 13, 38, 6), { ramp: r('toque', 'check', 'checkDk'), bevel: 2, inner: 'line' });
  for (let x = 14; x < 50; x += 2) cv.px(x, 16, c('checkDk'));
  cv.part(m().ellipse(32, 1, 5, 4), { ramp: r('toqueHi', 'toqueHi', 'hairHi', 'hairDk'), bevel: 3 });
  return cv.toSprite(0, 0, false);
}

export function hankPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  bust(k, r('slickHi', 'slick', 'slickDk', 'outline'), skin, { neck: 9, top: 46, slope: 12 });
  cv.part(m().rect(0, 52, 64, 3), { ramp: r('reflect', 'reflect', 'reflectSh'), bevel: 1, inner: 'line', shadow: false });
  cv.line(32, 47, 32, 60, (x, y) => cv.px(x, y, c(y % 2 ? 'reflectSh' : 'slickDk')));
  // hair blown hard to the right
  const hr = m().ellipse(30, 13, 16, 9);
  for (const [y, len] of [[6, 30], [10, 32], [14, 28], [3, 22]]) hr.poly([[34, y - 2], [34 + len, y + 1], [36, y + 5]]);
  hr.poly([[16, 12], [6, 6], [18, 6]]);
  cv.part(hr, { ramp: hair, bevel: 3, inner: 'line' });
  earsP(k, skin, 15, 30, 3.4, 5);
  const hm = headP(k, skin, { rx: 15.5, ry: 16.5, cy: 28, jawY: 35, jawRx: 15, jawRy: 12 });
  stubbleP(k, hm, 36, 46, 1);
  // goggles on the forehead
  cv.part(m().rect(15, 15, 34, 4), { ramp: r('strap', 'strap', 'outline'), bevel: 1, inner: 'line' });
  for (const x of [24, mirror(24)]) { cv.part(m().ellipse(x, 17, 6, 5), { ramp: r('brassHi', 'brass', 'strap'), bevel: 2, inner: 'line' }); cv.flat(m().ellipse(x, 17, 4, 3), c('lens')); cv.px(x - 2, 15, c('white')); cv.px(x - 1, 15, c('white')); }
  eyesP(k, { y: 26, x0: 21, x1: 27, style: 'wide' });
  browsP(k, hair, { y: 23, r0: 2, r1: 1.6, tilt: 1 });
  noseP(k, skin, { y: 34, rx: 4, ry: 3.4 });
  mouthP(k, { y: 42, x0: 26, x1: 38, kind: 'open', teeth: 'white' });
  return cv.toSprite(0, 0, false);
}

export function glacierPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  // shoulders filling the frame under a white wolf pelt
  bust(k, r('furHi', 'fur', 'furSh', 'furDk'), skin, { neck: 15, top: 40, slope: 18 });
  for (let x = 0; x < 64; x += 3) { cv.px(x, 44 + ((x * 7) % 3), c('furSh')); cv.px(x + 1, 49 + ((x * 5) % 4), c('furSh')); }
  earsP(k, skin, 12, 30, 3.6, 5.4);
  const hm = headP(k, skin, { rx: 18, ry: 17, cy: 26, jawY: 33, jawRx: 18, jawRy: 12.5 });
  cv.px(22, 12, c('white')); cv.px(23, 11, c('white')); cv.px(21, 13, c('skinHi'));
  // heavy frost beard with icicles
  const bd = m().ellipse(32, 44, 19, 13).cut(m().rect(0, 20, 64, 17)).rect(12, 30, 5, 10).rect(47, 30, 5, 10);
  cv.part(bd, { ramp: hair, bevel: 5, inner: 'line' });
  for (const x of [20, 25, 30, 35, 40, 45]) { const y0 = 52 + ((x * 3) % 4); for (let y = y0; y < y0 + 5; y++) cv.px(x, y, c(y === y0 + 4 ? 'white' : 'icicle')); cv.px(x + 1, y0 + 1, c('outline')); }
  eyesP(k, { y: 25, x0: 20, x1: 27, style: 'heavy', iris: 'glove' });
  // a frosted brow ridge, set in a line
  cv.part(m().rect(18, 19, 28, 3), { ramp: hair, bevel: 1, inner: 'soft' });
  noseP(k, skin, { y: 32, rx: 5, ry: 4 });
  cv.part(m().ellipse(26, 38, 7, 2.6).ellipse(mirror(26), 38, 7, 2.6), { ramp: hair, bevel: 2, inner: 'line' });
  for (let x = 29; x <= 35; x++) cv.px(x, 42, c('outline'));
  for (let x = 16; x < 48; x++) if (hm.in(x, 19)) cv.shade(x, 19, 1);
  return cv.toSprite(0, 0, false);
}

export function maestroPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  // the mane first, flaring out behind the head
  const mane = m().ellipse(32, 20, 24, 17);
  for (const s of [1, -1]) mane.poly([[s > 0 ? 10 : mirror(10), 16], [s > 0 ? -2 : 66, 34], [s > 0 ? 12 : mirror(12), 40]]);
  cv.part(mane, { ramp: hair, bevel: 6, inner: 'line' });
  for (const [x, y] of [[12, 12], [18, 6], [26, 4], [38, 4], [46, 6], [52, 12], [8, 24], [56, 24], [6, 32], [58, 32]]) { cv.shade(x, y, 1); cv.shade(x + 1, y + 2, -1); }
  bust(k, r('coatHi', 'coat', 'coatDk', 'outline'), skin, { neck: 7, top: 47, slope: 10 });
  cv.part(m().poly([[25, 47], [39, 47], [36, 60], [28, 60]]), { ramp: r('white', 'white', 'shirtSh'), bevel: 2, inner: 'line', shadow: false });
  for (const s of [1, -1]) cv.part(m().poly(s > 0 ? [[25, 47], [18, 50], [26, 60], [29, 60]] : [[39, 47], [46, 50], [38, 60], [35, 60]]), { ramp: r('satinHi', 'satin', 'coat'), bevel: 1, bias: 0.3, inner: 'line', shadow: false });
  cv.part(m().poly([[25, 47], [32, 50], [25, 53]]).poly([[39, 47], [32, 50], [39, 53]]), { ramp: r('white', 'white', 'shirtSh'), bevel: 1, inner: 'line', shadow: false });
  earsP(k, skin, 18, 30, 2.6, 4.2);
  headP(k, skin, { rx: 14, ry: 17, cy: 27, jawY: 36, jawRx: 11.5, jawRy: 11 });
  cv.part(m().ellipse(32, 14, 13.5, 5).cut(m().rect(0, 16, 64, 40)), { ramp: hair, bevel: 2, inner: 'soft', shadow: false });
  eyesP(k, { y: 26, x0: 21, x1: 27, style: 'narrow' });
  // fierce arched brows
  cv.part(m().capsule(19, 23, 28, 20, 2.2, 1.6).capsule(mirror(19), 23, mirror(28), 20, 2.2, 1.6), { ramp: hair, bevel: 2, inner: 'soft' });
  noseP(k, skin, { y: 34, rx: 3.2, ry: 3.6 });
  mouthP(k, { y: 42, x0: 28, x1: 36, kind: 'flat' });
  cv.line(28, 43, 36, 43, (x, y) => cv.shade(x, y, 1));
  // the baton, raised
  cv.line(50, 58, 62, 36, (x, y) => { cv.px(x, y, c('baton')); cv.px(x + 1, y, c('outline')); });
  cv.part(m().ellipse(52, 56, 5, 5), { ramp: r('gloveHi', 'glove', 'gloveDk'), bevel: 3 });
  return cv.toSprite(0, 0, false);
}
