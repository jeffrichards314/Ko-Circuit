// Intro-card portraits: Bolt Brennan, Downpour, Cyclone Cole, Avalanche.
import { setup, mirror, bust, earsP, headP, eyesP, browsP, noseP, mouthP } from './kit.js';

export function boltPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  bust(k, r('topHi', 'top', 'topDk', 'outline'), skin, { neck: 7, top: 47, slope: 9 });
  cv.part(m().poly([[40, 46], [30, 53], [34, 54], [24, 60], [36, 52], [32, 51]]), { ramp: r('bolt', 'bolt', 'boltDk'), bevel: 1, inner: 'line', shadow: false });
  earsP(k, skin, 18, 31, 2.8, 4.4);
  headP(k, skin, { rx: 14, ry: 16.5, cy: 29, jawY: 37, jawRx: 11.5, jawRy: 11 });
  // lightning-point spikes
  const hr = m().ellipse(32, 18, 15, 7).cut(m().rect(0, 20, 64, 40));
  for (const [x, h, lean] of [[16, 12, -8], [23, 17, -4], [32, 19, 1], [41, 17, 5], [48, 12, 9]]) hr.poly([[x - 4, 16], [x + lean, 16 - h], [x + 1, 12 - h * 0.4], [x + 4, 16]]);
  cv.part(hr, { ramp: hair, bevel: 2, inner: 'line' });
  for (const x of [22, 30, 38]) cv.shade(x, 8, -1);
  eyesP(k, { y: 27, x0: 22, x1: 27, style: 'narrow' });
  browsP(k, hair, { y: 23, r0: 1.4, r1: 1.1, tilt: 2 });
  noseP(k, skin, { y: 34, rx: 3, ry: 3 });
  mouthP(k, { y: 42, x0: 28, x1: 37, kind: 'grin' });
  // sparks
  for (const [x, y] of [[6, 20], [8, 18], [56, 26], [58, 24], [10, 38], [55, 40]]) cv.px(x, y, c('spark'));
  return cv.toSprite(0, 0, false);
}

export function downpourPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hood = r('hoodHi', 'hood', 'hoodDk', 'outline');
  bust(k, hood, skin, { neck: 8, top: 46, slope: 12 });
  // the hood, up
  cv.part(m().ellipse(32, 28, 23, 26).rect(9, 28, 46, 22), { ramp: hood, bevel: 7, inner: 'line' });
  cv.part(m().ellipse(32, 31, 18, 21), { ramp: r('lining', 'lining', 'hoodDk'), bevel: 2, inner: 'line' });
  headP(k, skin, { rx: 14.5, ry: 17, cy: 30, jawY: 37, jawRx: 13, jawRy: 11 });
  // wet hair plastered down
  const hr = m().ellipse(32, 20, 14, 7).cut(m().rect(0, 22, 64, 40));
  for (const x of [22, 27, 32, 37, 42]) hr.poly([[x - 2, 20], [x + 2, 20], [x + (x < 32 ? -1 : 1), 27]]);
  cv.part(hr, { ramp: r('hairHi', 'hair', 'outline'), bevel: 1, inner: 'line' });
  eyesP(k, { y: 29, x0: 22, x1: 27, style: 'heavy' });
  browsP(k, r('hairHi', 'hair', 'outline'), { y: 25, r0: 1.2, r1: 1, tilt: -2 });
  noseP(k, skin, { y: 36, rx: 3.4, ry: 3.2 });
  mouthP(k, { y: 44, x0: 28, x1: 36, kind: 'flat' });
  cv.px(27, 45, c('outline')); cv.px(37, 45, c('outline'));
  // drawstrings, raindrops
  for (const x of [26, 38]) { cv.line(x, 47, x, 58, (X, Y) => cv.px(X, Y, c('string'))); cv.px(x, 59, c('lining')); }
  for (const [x, y] of [[20, 34], [45, 12], [12, 50], [52, 44], [30, 6]]) { cv.px(x, y, c('drop')); cv.px(x, y + 1, c('white')); }
  return cv.toSprite(0, 0, false);
}

export function colePortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  // ponytail flying out sideways, mid-spin
  cv.part(m().capsule(44, 18, 62, 8, 4.4, 2.6), { ramp: hair, bevel: 3, inner: 'line' });
  bust(k, r('vestHi', 'vest', 'vestDk', 'outline'), skin, { neck: 8, top: 47, slope: 10 });
  for (let a = 0; a < 30; a++) { const t = a * 0.5, rr = 0.6 + a * 0.24; cv.px(Math.round(46 + Math.cos(t) * rr), Math.round(54 + Math.sin(t) * rr * 0.8), c('swirl')); }
  earsP(k, skin, 17.5, 30, 2.8, 4.4);
  headP(k, skin, { rx: 14.5, ry: 16.5, cy: 28, jawY: 36, jawRx: 12, jawRy: 11 });
  cv.part(m().ellipse(32, 16, 15, 8).cut(m().rect(0, 19, 64, 40)), { ramp: hair, bevel: 3, inner: 'line' });
  cv.part(m().rect(17, 16, 30, 4), { ramp: r('band', 'band', 'bandSh'), bevel: 1, inner: 'line' });
  // one eye on each side of dizzy
  eyesP(k, { y: 26, x0: 22, x1: 27, style: 'wide' });
  browsP(k, hair, { y: 22, r0: 1.4, r1: 1.1, tilt: -1 });
  noseP(k, skin, { y: 33, rx: 3.2, ry: 3 });
  mouthP(k, { y: 41, x0: 27, x1: 37, kind: 'open' });
  // whirl lines
  for (const [x0, y0] of [[2, 30], [4, 40], [54, 36]]) for (let i = 0; i < 6; i++) cv.px(x0 + i, y0 + (i >> 1), c('swirl'));
  return cv.toSprite(0, 0, false);
}

export function avalanchePortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  // shaggy mane behind, huge shoulders in red knit with the white yoke
  cv.part(m().ellipse(32, 26, 24, 22), { ramp: hair, bevel: 6, inner: 'line' });
  bust(k, r('knitHi', 'knit', 'knitDk', 'outline'), skin, { neck: 14, top: 41, slope: 18 });
  cv.part(m().rect(0, 48, 64, 7).cut(m().ellipse(32, 44, 12, 6)), { ramp: r('yoke', 'yoke', 'yokeSh'), bevel: 1, inner: 'line', shadow: false });
  for (let x = 0; x < 64; x++) { const y = 51 + ((x >> 1) & 1); if (cv.filled(x, y)) cv.px(x, y, c('knit')); }
  earsP(k, skin, 13, 30, 3.6, 5.4);
  headP(k, skin, { rx: 17.5, ry: 17, cy: 27, jawY: 34, jawRx: 17.5, jawRy: 12.5 });
  // fringe
  const fr = m().ellipse(32, 14, 17, 8).cut(m().rect(0, 17, 64, 40));
  for (const x of [20, 26, 32, 38, 44]) fr.poly([[x - 3, 16], [x + 3, 16], [x, 22]]);
  cv.part(fr, { ramp: hair, bevel: 3, inner: 'line' });
  // huge beard
  cv.part(m().ellipse(32, 44, 20, 14).cut(m().rect(0, 20, 64, 17)).rect(13, 30, 5, 10).rect(46, 30, 5, 10), { ramp: hair, bevel: 5, inner: 'line' });
  eyesP(k, { y: 25, x0: 21, x1: 27, style: 'narrow' });
  browsP(k, hair, { y: 21, r0: 2.6, r1: 2.2, tilt: 1.5 });
  noseP(k, r('skinHi', 'ruddy', 'skinSh', 'skinDk'), { y: 32, rx: 5, ry: 4.2 });
  cv.flat(m().ellipse(20, 32, 3, 1.6).ellipse(44, 32, 3, 1.6), c('ruddy'));
  cv.part(m().ellipse(26, 38, 7.5, 3, 1, -0.2).ellipse(mirror(26), 38, 7.5, 3, 1, 0.2), { ramp: hair, bevel: 2, inner: 'line' });
  for (let x = 29; x <= 35; x++) cv.px(x, 42, c('mouth'));
  // snow in the hair and beard
  for (const [x, y] of [[12, 12], [20, 6], [34, 5], [48, 10], [54, 20], [8, 26], [22, 48], [40, 52], [30, 55], [46, 44], [16, 42]]) cv.px(x, y, c('snow'));
  return cv.toSprite(0, 0, false);
}
