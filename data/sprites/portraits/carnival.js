// Intro-card portraits: the Strongman, Pockets, Tightrope Tess, Jester Jinx, Ringmaster Rex.
import { setup, mirror, bust, earsP, headP, eyesP, browsP, noseP, mouthP, stubbleP } from './kit.js';

export function strongmanPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'outline');
  bust(k, skin, skin, { neck: 14, top: 42, slope: 16 });
  // leopard strap over one shoulder
  const leo = m().poly([[44, 42], [56, 44], [64, 50], [64, 60], [40, 60], [46, 52]]);
  cv.part(leo, { ramp: r('leoHi', 'leo', 'leoSh'), bevel: 3, inner: 'line' });
  for (let y = 40; y < 60; y++) for (let x = 38; x < 64; x++) if (leo.in(x, y) && (x * 7 + y * 13) % 17 === 0) { cv.px(x, y, c('spot')); cv.px(x + 1, y, c('spot')); }
  cv.line(10, 54, 28, 55, (x, y) => cv.shade(x, y, 1));
  earsP(k, skin, 14, 29, 3.8, 5.4);
  const hm = headP(k, skin, { rx: 17, ry: 17, cy: 26, jawY: 34, jawRx: 17.5, jawRy: 12.5 });
  cv.px(23, 12, c('shine')); cv.px(24, 11, c('shine')); cv.px(22, 13, c('skinHi')); cv.px(25, 11, c('skinHi'));
  stubbleP(k, hm, 13, 18, 1);
  eyesP(k, { y: 25, x0: 21, x1: 27, style: 'normal' });
  browsP(k, hair, { y: 21, r0: 2.6, r1: 2.2, tilt: 1 });
  noseP(k, skin, { y: 31, rx: 5, ry: 4 });
  mouthP(k, { y: 42, x0: 27, x1: 37, kind: 'grin' });
  // the handlebar
  const mu = m().ellipse(26, 37, 7, 2.6, 1, -0.15).ellipse(mirror(26), 37, 7, 2.6, 1, 0.15)
    .capsule(19, 37, 12, 31, 1.8, 1.1).capsule(mirror(19), 37, mirror(12), 31, 1.8, 1.1).ellipse(11.5, 30, 1.8, 1.8).ellipse(mirror(11.5), 30, 1.8, 1.8);
  cv.part(mu, { ramp: hair, bevel: 2, inner: 'line' });
  cv.px(24, 36, c('hairHi')); cv.px(38, 36, c('hairHi'));
  return cv.toSprite(0, 0, false);
}

export function pocketsPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const shirt = r('stripeA', 'stripeA', 'shirtSh', 'outline');
  bust(k, shirt, skin, { neck: 8, top: 47, slope: 10 });
  for (let y = 44; y < 60; y++) for (let x = 0; x < 64; x++) if (((x >> 2) & 1) && y > 48 - Math.abs(x - 32) * 0.1) cv.px(x, y, c('stripeB'));
  // orange frizz
  const fz = m();
  for (const s of [1, -1]) for (const [x, y, rr] of [[10, 24, 6], [8, 32, 6], [12, 16, 5], [11, 38, 4.5]]) fz.ellipse(s > 0 ? x : mirror(x), y, rr, rr);
  cv.part(fz, { ramp: r('hairHi', 'hair', 'hairDk'), bevel: 3, inner: 'line' });
  headP(k, skin, { rx: 15.5, ry: 17, cy: 27, jawY: 35, jawRx: 14.5, jawRy: 12 });
  // blue diamonds + eyes
  for (const s of [1, -1]) { const x = s > 0 ? 24.5 : mirror(24.5); cv.flat(m().poly([[x, 17], [x + 5, 26], [x, 35], [x - 5, 26]]), c('diamond')); }
  eyesP(k, { y: 25, x0: 21, x1: 28, style: 'wide' });
  // painted smile + nose
  cv.flat(m().ellipse(32, 41, 13, 6).cut(m().rect(0, 32, 64, 7)), c('nose'));
  mouthP(k, { y: 41, x0: 27, x1: 37, kind: 'grin' });
  cv.part(m().ellipse(32, 33, 5.5, 5), { ramp: r('noseHi', 'nose', 'nose', 'mouth'), bevel: 3 });
  cv.px(30, 31, c('white')); cv.px(31, 30, c('white'));
  // tiny tilted hat with a flower
  cv.part(m().poly([[27, 10], [42, 7], [41, -2], [29, 0]]), { ramp: r('purpleHi', 'purple', 'purpleDk'), bevel: 3 });
  cv.part(m().ellipse(35, 9, 11, 2.4, 1, -0.2), { ramp: r('purpleHi', 'purple', 'purpleDk'), bevel: 1, inner: 'line' });
  cv.part(m().ellipse(40, 1, 3, 3), { ramp: r('noseHi', 'nose', 'mouth'), bevel: 2 });
  // bow tie
  cv.part(m().poly([[18, 44], [32, 50], [18, 56]]).poly([[46, 44], [32, 50], [46, 56]]), { ramp: r('noseHi', 'nose', 'nose', 'mouth'), bevel: 2, inner: 'line' });
  for (const [x, y] of [[22, 48], [24, 52], [41, 48], [40, 52]]) cv.px(x, y, c('white'));
  return cv.toSprite(0, 0, false);
}

export function tessPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'outline');
  bust(k, skin, skin, { neck: 6.5, top: 48, slope: 8 });
  const leo = m().poly([[8, 60], [14, 52], [24, 50], [32, 55], [40, 50], [50, 52], [56, 60]]);
  cv.part(leo, { ramp: r('tealHi', 'teal', 'tealDk', 'outline'), bevel: 3, inner: 'line' });
  for (let y = 50; y < 60; y++) for (let x = 8; x < 56; x++) if (leo.in(x, y) && (x * 5 + y * 3) % 7 === 0) cv.px(x, y, c('sequin'));
  // the bun
  cv.part(m().ellipse(32, 4, 9, 6), { ramp: hair, bevel: 3, inner: 'line' });
  for (let x = 24; x <= 40; x += 2) cv.px(x, 9, c(x === 32 ? 'gold' : 'sequin'));
  earsP(k, skin, 18, 30, 2.6, 4);
  headP(k, skin, { rx: 13.5, ry: 16, cy: 28, jawY: 36, jawRx: 11, jawRy: 11 });
  const hr = m().ellipse(32, 18, 14.4, 8).cut(m().rect(0, 20, 64, 40)).rect(18, 18, 2, 7).rect(44, 18, 2, 7);
  cv.part(hr, { ramp: hair, bevel: 3, inner: 'line' });
  for (const x of [26, 31, 37]) cv.line(x, 11, x - (x - 32) * 0.3, 19, (X, Y) => cv.shade(X, Y, -1));
  eyesP(k, { y: 26, x0: 22, x1: 27, style: 'normal' });
  for (const s of [1, -1]) { cv.px(s > 0 ? 21 : mirror(21), 25, c('lash')); cv.px(s > 0 ? 20 : mirror(20), 24, c('lash')); }
  browsP(k, hair, { y: 22, r0: 1, r1: 0.9, tilt: -1 });
  noseP(k, skin, { y: 33, rx: 2.8, ry: 2.6 });
  mouthP(k, { y: 41, x0: 29, x1: 35, kind: 'smile', inside: 'mouth' });
  cv.flat(m().ellipse(22, 34, 2.4, 1.4).ellipse(42, 34, 2.4, 1.4), c('tightHi'));
  return cv.toSprite(0, 0, false);
}

export function jinxPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const red = r('redHi', 'red', 'redDk', 'outline'), green = r('greenHi', 'green', 'greenDk', 'outline');
  bust(k, red, skin, { neck: 7, top: 47, slope: 10 });
  for (let y = 44; y < 60; y++) for (let x = 0; x < 64; x++) if (x >= 32 && y > 47) cv.px(x, y, c(((x + y) >> 2) & 1 ? 'green' : 'greenHi'));
  // scalloped collar with bells
  const col = m();
  for (let i = -3; i <= 3; i++) col.poly([[32 + i * 7 - 5, 46], [32 + i * 7 + 5, 46], [32 + i * 7.5, 55 - Math.abs(i)]]);
  cv.part(col, { ramp: r('collarHi', 'collar', 'collarSh'), bevel: 2, inner: 'line' });
  for (const i of [-3, -1, 1, 3]) cv.part(m().ellipse(32 + i * 7.5, 56 - Math.abs(i), 2, 2), { ramp: r('bellHi', 'bell', 'bellDk'), bevel: 1 });
  earsP(k, skin, 18, 30, 2.8, 4.4);
  headP(k, skin, { rx: 14, ry: 16, cy: 28, jawY: 37, jawRx: 11, jawRy: 11 });
  // the two-horned cap
  cv.part(m().capsule(28, 14, 10, 6, 7, 5).capsule(10, 6, 2, 22, 5, 2).cut(m().rect(32, 0, 32, 64)), { ramp: red, bevel: 3, inner: 'line' });
  cv.part(m().capsule(36, 14, 54, 6, 7, 5).capsule(54, 6, 62, 22, 5, 2).cut(m().rect(0, 0, 32, 64)), { ramp: green, bevel: 3, inner: 'line' });
  cv.part(m().ellipse(32, 17, 15, 6).cut(m().rect(0, 19, 64, 40)).cut(m().rect(32, 0, 32, 64)), { ramp: red, bevel: 2 });
  cv.part(m().ellipse(32, 17, 15, 6).cut(m().rect(0, 19, 64, 40)).cut(m().rect(0, 0, 32, 64)), { ramp: green, bevel: 2 });
  for (const x of [2, 62]) cv.part(m().ellipse(x, 24, 2.6, 2.6), { ramp: r('bellHi', 'bell', 'bellDk'), bevel: 1 });
  for (let x = 18; x <= 46; x++) cv.px(x, 19, c('bell'));
  eyesP(k, { y: 26, x0: 22, x1: 27, style: 'normal' });
  cv.flat(m().poly([[39, 30], [42, 35], [39, 40], [36, 35]]), c('outline'));
  browsP(k, r('hairHi', 'hair', 'outline'), { y: 22, r0: 1.2, r1: 1, tilt: 2 });
  noseP(k, skin, { y: 33, rx: 3, ry: 2.8 });
  cv.line(24, 38, 28, 43, (x, y) => cv.px(x, y, c('paint'))); cv.line(40, 37, 36, 43, (x, y) => cv.px(x, y, c('paint')));
  mouthP(k, { y: 43, x0: 28, x1: 36, kind: 'grin' });
  return cv.toSprite(0, 0, false);
}

export function rexPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'outline');
  const coat = r('coatHi', 'coat', 'coatDk', 'outline');
  bust(k, coat, skin, { neck: 8, top: 46, slope: 12 });
  cv.part(m().poly([[24, 46], [40, 46], [36, 60], [28, 60]]), { ramp: r('white', 'white', 'shirtSh'), bevel: 2, inner: 'line', shadow: false });
  cv.part(m().poly([[25, 47], [32, 50], [25, 53]]).poly([[39, 47], [32, 50], [39, 53]]), { ramp: r('blackHi', 'black', 'outline'), bevel: 1, inner: 'line', shadow: false });
  for (const y of [52, 56]) { cv.line(4, y, 22, y + 1, (x, yy) => cv.px(x, yy, c('gold'))); cv.line(42, y + 1, 60, y, (x, yy) => cv.px(x, yy, c('gold'))); }
  earsP(k, skin, 15, 32, 3.4, 5);
  const hm = headP(k, skin, { rx: 15.5, ry: 16.5, cy: 30, jawY: 37, jawRx: 15.5, jawRy: 11.5 });
  cv.part(m().ellipse(18, 36, 3, 7).ellipse(mirror(18), 36, 3, 7).clip(hm), { ramp: hair, bevel: 1, inner: 'line', shadow: false });
  eyesP(k, { y: 29, x0: 21, x1: 27, style: 'normal' });
  browsP(k, hair, { y: 25, r0: 2.2, r1: 1.8, tilt: 1.5 });
  noseP(k, skin, { y: 36, rx: 4, ry: 3.4 });
  mouthP(k, { y: 46, x0: 28, x1: 36, kind: 'grin' });
  const mu = m().ellipse(27, 41, 6, 2.4, 1, -0.2).ellipse(mirror(27), 41, 6, 2.4, 1, 0.2)
    .capsule(21, 42, 16, 46, 1.6, 1).capsule(mirror(21), 42, mirror(16), 46, 1.6, 1).ellipse(15, 44.5, 1.8, 1.8).ellipse(mirror(15), 44.5, 1.8, 1.8);
  cv.part(mu, { ramp: hair, bevel: 2, inner: 'line' });
  // tall crimson top hat
  const crown = m().poly([[20, 16], [44, 16], [46, -2], [18, -2]]);
  cv.part(crown, { ramp: coat, bevel: 4 });
  cv.line(22, 0, 22, 13, (x, y) => cv.shade(x, y, -1));
  cv.part(m().rect(19, 9, 26, 5).clip(crown), { ramp: r('goldHi', 'gold', 'goldDk'), bevel: 1, inner: 'line', shadow: false });
  cv.part(m().ellipse(32, 17, 23, 3), { ramp: coat, bevel: 1, bias: -0.2, inner: 'line' });
  for (let x = 17; x < 47; x++) if (hm.in(x, 21)) cv.shade(x, 21, 1);
  return cv.toSprite(0, 0, false);
}
