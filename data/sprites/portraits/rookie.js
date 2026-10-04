// Intro-card portraits: Kid Kilowatt, Mort the Mailman, Gus Grill.
import { setup, mirror, bust, earsP, headP, eyesP, browsP, noseP, mouthP, stubbleP } from './kit.js';

export function kidPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairSh');
  // hair spikes behind everything
  const hr = m().ellipse(32, 12, 18, 9);
  for (const [bx, tx, ty] of [[14, 3, 2], [19, 8, -4], [25, 18, -8], [32, 31, -10], [39, 44, -8], [45, 55, -3], [50, 62, 4]]) hr.poly([[bx - 5, 14], [tx, ty], [bx + 5, 12]]);
  cv.part(hr, { ramp: hair, bevel: 4, inner: 'line' });
  for (const [x, y] of [[9, 4], [15, 0], [26, -2], [37, -3], [48, 1], [56, 6]]) cv.line(x, y + 4, x + 3, y + 10, (X, Y) => cv.shade(X, Y, -1));
  // lime tank top with a bolt
  bust(k, r('tankHi', 'tank', 'tankSh', 'outline'), skin, { neck: 7, top: 45, slope: 6 });
  const shoulders = m().poly([[0, 60], [2, 52], [10, 46], [18, 45], [16, 60]]).poly([[64, 60], [62, 52], [54, 46], [46, 45], [48, 60]]);
  cv.part(shoulders, { ramp: skin, bevel: 5, shadow: false });
  cv.stamp(['..##', '.##.', '####', '..#.', '.#..'], 30, 51, { '#': c('hair') });
  earsP(k, skin, 17, 29, 3, 4.5);
  const hm = headP(k, skin, { rx: 14, ry: 16, cy: 26, jawY: 33, jawRx: 12.5, jawRy: 11 });
  // freckles
  for (const [x, y] of [[21, 33], [23, 34], [19, 34], [42, 33], [40, 34], [44, 34]]) cv.px(x, y, c('skinSh'));
  eyesP(k, { y: 24, x0: 21, x1: 28, style: 'wide' });
  browsP(k, hair, { y: 20, x0: 21, x1: 28, r0: 1.4, r1: 1.2, tilt: -1 });
  cv.line(32, 25, 31, 30, (x, y) => cv.shade(x, y, 1));
  cv.px(30, 31, c('skinDk')); cv.px(33, 31, c('skinDk'));
  // big grin full of braces
  cv.flat(m().ellipse(32, 38, 7.5, 3.4).cut(m().rect(0, 0, 64, 37)), c('mouth'), true);
  for (let x = 26; x <= 38; x++) cv.px(x, 37, c(x % 3 === 0 ? 'metal' : 'white'));
  for (let x = 26; x <= 38; x++) cv.px(x, 38, c('metal'));
  // sweatband over the hair
  cv.part(m().rect(15, 13, 34, 5).clip(m().ellipse(32, 26, 15.5, 17)), { ramp: r('bandHi', 'band', 'mouth'), bevel: 2, inner: 'line' });
  cv.px(31, 15, c('white')); cv.px(32, 15, c('white'));
  // crackle
  for (const [x, y] of [[6, 26], [7, 27], [6, 28], [57, 22], [56, 23], [57, 24]]) cv.px(x, y, c('hairHi'));
  return cv.toSprite(0, 0, false);
}

export function mortPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const shirt = r('shirtHi', 'shirt', 'shirtSh', 'navy');
  bust(k, shirt, skin, { neck: 10, top: 43, slope: 12 });
  // collar, strap, whistle cord, patch
  cv.part(m().poly([[19, 42], [31, 53], [22, 51]]).poly([[45, 42], [33, 53], [42, 51]]), { ramp: shirt, bevel: 2, bias: 0.25 });
  cv.part(m().capsule(6, 44, 26, 60, 3, 3), { ramp: r('leatherHi', 'leather', 'leatherDk'), bevel: 2, inner: 'line' });
  cv.line(28, 44, 25, 58, (x, y) => cv.px(x, y, c('patch')));
  cv.part(m().rect(47, 51, 9, 6), { ramp: r('white', 'white', 'metal'), bevel: 1, inner: 'line', shadow: false });
  cv.stamp(['.ppp.', 'p.p.p', '.ppp.'], 49, 52, { p: c('patch') });
  earsP(k, skin, 14.5, 30, 3.8, 5.6);
  const hm = headP(k, skin, { rx: 16.5, ry: 17, jawY: 34, jawRx: 17, jawRy: 12.5 });
  stubbleP(k, hm, 40, 47, 1);
  // grey sideburns
  for (let y = 24; y <= 32; y++) for (const x of [16, 17, 46, 47]) if (hm.in(x, y)) cv.px(x, y, c(y < 27 ? 'hairHi' : 'hair'));
  eyesP(k, { y: 25, x0: 21, x1: 27, style: 'normal' });
  browsP(k, r('hairHi', 'hair', 'hairDk'), { y: 21, r0: 2.4, r1: 2.2, tilt: 0.8 });
  noseP(k, skin, { y: 32, rx: 4.8, ry: 3.8 });
  // pencil mustache + stern mouth
  cv.part(m().rect(26, 37, 12, 2).rect(24, 38, 2, 1).rect(38, 38, 2, 1), { ramp: r('hairHi', 'hair', 'hairDk'), bevel: 1, inner: 'soft', shadow: false });
  mouthP(k, { y: 42, x0: 28, x1: 36, kind: 'flat' });
  cv.shade(32, 47, 1);
  // pith helmet
  const dome = m().ellipse(32, 14, 19, 12.5).cut(m().rect(0, 17, 64, 50));
  cv.part(dome, { ramp: r('helmetHi', 'helmet', 'helmetSh', 'leatherDk'), bevel: 8 });
  for (const x of [24, 32, 40]) cv.line(x + (32 - x) * 0.4, 3, x, 15, (X, Y) => cv.shade(X, Y, 1));
  cv.part(m().rect(12, 13, 40, 4).clip(dome), { ramp: r('navyHi', 'navy', 'navyDk'), bevel: 1, inner: 'line', shadow: false });
  cv.part(m().ellipse(32, 18.5, 27, 3.6).cut(dome), { ramp: r('helmetHi', 'helmet', 'helmetSh', 'leatherDk'), bevel: 1, bias: -0.3, inner: 'line' });
  cv.part(m().ellipse(32, 2.5, 2, 1.3), { ramp: r('helmetHi', 'helmet', 'helmetSh'), bevel: 1, shadow: false });
  for (let x = 16; x < 48; x++) if (hm.in(x, 22)) cv.shade(x, 22, 1);
  return cv.toSprite(0, 0, false);
}

export function gusPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const tee = r('white', 'teeSh', 'teeDk', 'hairHi');
  const hair = r('hairHi', 'hair', 'hairDk');
  bust(k, tee, skin, { neck: 12, top: 44, slope: 13 });
  // apron bib with straps, a ketchup stain
  cv.part(m().poly([[20, 60], [22, 50], [42, 50], [44, 60]]), { ramp: r('apronHi', 'apron', 'apronSh', 'bunSh'), bevel: 4 });
  cv.line(22, 50, 17, 44, (x, y) => cv.px(x, y, c('apronSh'))); cv.line(42, 50, 47, 44, (x, y) => cv.px(x, y, c('apronSh')));
  cv.px(36, 55, c('glove')); cv.px(37, 55, c('glove')); cv.px(37, 56, c('glove'));
  earsP(k, skin, 14, 30, 3.8, 5.4);
  const hm = headP(k, skin, { rx: 17, ry: 17, jawY: 34, jawRx: 18, jawRy: 13 });
  // double chin
  cv.part(m().ellipse(32, 47, 10, 3.2).cut(hm), { ramp: skin, bevel: 2, inner: 'soft' });
  stubbleP(k, hm, 39, 47, 1);
  cv.flat(m().ellipse(20, 33, 3, 1.8).ellipse(mirror(20), 33, 3, 1.8), c('ruddy'));
  eyesP(k, { y: 25, x0: 21, x1: 27, style: 'normal' });
  browsP(k, hair, { y: 20.5, r0: 2.4, r1: 2.2, tilt: -0.5 });
  noseP(k, r('skinHi', 'ruddy', 'skinSh', 'skinDk'), { y: 31.5, rx: 5, ry: 4.2 });
  // big grin + goatee
  cv.flat(m().ellipse(32, 39.5, 8, 3.4).cut(m().rect(0, 0, 64, 38)), c('mouth'), true);
  for (let x = 25; x <= 39; x++) cv.px(x, 38, c('white'));
  cv.px(24, 37, c('outline')); cv.px(40, 37, c('outline'));
  cv.part(m().ellipse(32, 45.5, 4.5, 2.6), { ramp: hair, bevel: 2, inner: 'line', shadow: false });
  // paper cap with a ketchup stripe
  const cap = m().poly([[13, 18], [51, 18], [46, 6], [18, 6]]).ellipse(32, 6.5, 14, 2.5);
  cv.part(cap, { ramp: r('white', 'white', 'teeSh', 'teeDk'), bevel: 4 });
  cv.line(15, 13, 49, 13, (x, y) => { if (cap.in(x, y)) { cv.px(x, y, c('glove')); cv.px(x, y + 1, c('glove')); } });
  cv.line(32, 4, 32, 11, (x, y) => cv.shade(x, y, 1));
  for (let y = 18; y < 24; y++) for (const x of [15, 16, 47, 48]) if (hm.in(x, y)) cv.px(x, y, c('hair'));
  return cv.toSprite(0, 0, false);
}
