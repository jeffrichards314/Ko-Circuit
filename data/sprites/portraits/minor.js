// Intro-card portraits: Rocco Rivets, The Great Gambini, Professor Knox, Brick Wall Brody.
import { setup, mirror, bust, earsP, headP, eyesP, browsP, noseP, mouthP, stubbleP } from './kit.js';

export function roccoPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  const vest = r('vestHi', 'vest', 'vestSh', 'hairDk');
  bust(k, vest, skin, { neck: 12, top: 44, slope: 14 });
  // V of hairy chest, reflective stripes
  const vee = m().poly([[23, 44], [41, 44], [32, 60]]);
  cv.part(vee, { ramp: skin, bevel: 3, shadow: false });
  for (let y = 46; y < 60; y++) for (let x = 25; x < 40; x++) if (vee.in(x, y) && (x + y) % 2 === 0) cv.shade(x, y, 1);
  for (const y of [52, 53]) for (let x = 0; x < 64; x++) if (!vee.in(x, y) && x > 1 && x < 62) cv.px(x, y, c('reflect'));
  earsP(k, skin, 14.5, 30, 3.8, 5.5);
  const hm = headP(k, skin, { rx: 16.5, ry: 17, jawY: 34, jawRx: 17, jawRy: 12.5 });
  cv.flat(m().ellipse(19, 34, 3, 2), c('soot'));
  eyesP(k, { y: 25, x0: 21, x1: 27, style: 'normal' });
  browsP(k, hair, { y: 21, r0: 2.6, r1: 2.3, tilt: 1 });
  noseP(k, skin, { y: 31, rx: 4.8, ry: 3.8 });
  // big beard, mustache, mouth cut in
  const beard = m().ellipse(32, 41, 18, 10).rect(14, 28, 5, 12).rect(45, 28, 5, 12).cut(m().rect(0, 0, 64, 34));
  cv.part(beard, { ramp: hair, bevel: 4, inner: 'line' });
  for (const [x, y] of [[20, 40], [26, 45], [32, 47], [38, 45], [44, 40], [23, 43], [41, 43]]) { cv.shade(x, y, -1); cv.shade(x + 1, y + 1, 1); }
  cv.part(m().ellipse(26, 36.5, 6.5, 2.4, 1, -0.2).ellipse(mirror(26), 36.5, 6.5, 2.4, 1, 0.2), { ramp: hair, bevel: 2, inner: 'line' });
  mouthP(k, { y: 40, x0: 28, x1: 36, kind: 'grin' });
  // hard hat with a ridge, dents and a sticker
  const dome = m().ellipse(32, 14, 20, 13).cut(m().rect(0, 18, 64, 50));
  cv.part(dome, { ramp: r('hatHi', 'hat', 'hatSh', 'belt'), bevel: 9 });
  cv.part(m().capsule(32, 1.5, 32, 16, 2.6, 2.6).clip(dome), { ramp: r('hatHi', 'hat', 'hatSh'), bevel: 2, bias: 0.3, inner: 'line', shadow: false });
  cv.shade(22, 9, 1); cv.shade(23, 9, 1); cv.shade(22, 10, 1);
  cv.part(m().rect(40, 8, 5, 4), { ramp: r('reflect', 'vest', 'vestSh'), bevel: 1, inner: 'line', shadow: false });
  cv.part(m().ellipse(32, 19, 24, 3.4).cut(m().rect(0, 0, 64, 18.5)), { ramp: r('hatHi', 'hat', 'hatSh', 'belt'), bevel: 1, bias: -0.3, inner: 'line' });
  for (let x = 15; x < 49; x++) if (hm.in(x, 22)) cv.shade(x, 22, 1);
  return cv.toSprite(0, 0, false);
}

export function gambiniPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'outline');
  // cape collar standing up behind the head
  cv.part(m().poly([[4, 60], [6, 34], [18, 40], [46, 40], [58, 34], [60, 60]]), { ramp: r('liningHi', 'lining', 'liningDk'), bevel: 5 });
  cv.part(m().poly([[3, 60], [4, 32], [8, 34], [8, 60]]).poly([[61, 60], [60, 32], [56, 34], [56, 60]]), { ramp: r('capeHi', 'cape', 'capeDk'), bevel: 2 });
  bust(k, r('white', 'white', 'shirtSh', 'gloveDk'), skin, { neck: 7, top: 45, slope: 8 });
  cv.part(m().poly([[12, 60], [16, 48], [24, 46], [30, 60]]).poly([[52, 60], [48, 48], [40, 46], [34, 60]]), { ramp: r('vestHi', 'vest', 'vestDk', 'capeDk'), bevel: 3 });
  cv.part(m().poly([[24, 45], [32, 48], [24, 51]]).poly([[40, 45], [32, 48], [40, 51]]), { ramp: r('liningHi', 'lining', 'liningDk'), bevel: 1, inner: 'line', shadow: false });
  earsP(k, skin, 17.5, 29, 3, 4.6);
  const hm = headP(k, skin, { rx: 14, ry: 16, jawY: 34, jawRx: 11.5, jawRy: 11.5 });
  // slick hair at the temples
  for (let y = 18; y < 28; y++) for (const x of [18, 19, 20, 44, 45, 46]) if (hm.in(x, y)) cv.px(x, y, c(y < 22 ? 'hairHi' : 'hair'));
  cv.shade(22, 36, 1); cv.shade(41, 36, 1); cv.shade(22, 37, 1); cv.shade(41, 37, 1);
  eyesP(k, { y: 25, x0: 22, x1: 28, style: 'narrow' });
  // arched brows
  for (const s of [1, -1]) {
    const X = (x) => (s > 0 ? x : mirror(x));
    cv.part(m().capsule(X(21), 23, X(24), 19, 1.2, 1.2).capsule(X(24), 19, X(29), 21.5, 1.2, 1), { ramp: hair, bevel: 1, inner: 'soft' });
  }
  noseP(k, skin, { y: 32, rx: 3.4, ry: 3.6 });
  mouthP(k, { y: 40, x0: 28, x1: 36, kind: 'smile' });
  // waxed curled mustache + pointed goatee
  const mu = m().ellipse(27, 37, 5, 1.8, 1, -0.2).ellipse(mirror(27), 37, 5, 1.8, 1, 0.2)
    .capsule(22, 37, 18, 33, 1.3, 1).capsule(mirror(22), 37, mirror(18), 33, 1.3, 1)
    .ellipse(17.5, 32, 1.6, 1.6).ellipse(mirror(17.5), 32, 1.6, 1.6);
  cv.part(mu, { ramp: hair, bevel: 1, inner: 'line' });
  cv.part(m().poly([[29, 43], [35, 43], [32, 52]]), { ramp: hair, bevel: 1, inner: 'line' });
  // top hat
  const crown = m().poly([[20, 16], [44, 16], [46, -2], [18, -2]]);
  cv.part(crown, { ramp: r('hatHi', 'hat', 'capeDk'), bevel: 4 });
  cv.line(22, 0, 22, 12, (x, y) => cv.shade(x, y, -1));
  cv.part(m().rect(19, 10, 26, 5).clip(crown), { ramp: r('liningHi', 'lining', 'liningDk'), bevel: 1, inner: 'line', shadow: false });
  cv.part(m().ellipse(32, 17, 22, 2.8), { ramp: r('hatHi', 'hat', 'capeDk'), bevel: 1, bias: -0.2, inner: 'line' });
  for (let x = 17; x < 47; x++) if (hm.in(x, 21)) cv.shade(x, 21, 1);
  // a sparkle
  for (let i = -3; i <= 3; i++) { cv.px(55 + i, 10, c(Math.abs(i) < 2 ? 'white' : 'spark')); cv.px(55, 10 + i, c(Math.abs(i) < 2 ? 'white' : 'spark')); }
  return cv.toSprite(0, 0, false);
}

export function knoxPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'skinSh');
  bust(k, r('white', 'white', 'shirtSh', 'tweedDk'), skin, { neck: 8, top: 45, slope: 10 });
  // argyle vest V + bow tie
  const vest = m().poly([[4, 60], [8, 50], [18, 46], [32, 60]]).poly([[60, 60], [56, 50], [46, 46], [32, 60]]);
  cv.part(vest, { ramp: r('sweaterHi', 'sweater', 'sweaterDk'), bevel: 4 });
  for (let y = 46; y < 60; y++) for (let x = 0; x < 64; x++) if (vest.in(x, y) && ((x + y) % 10 === 0 || (x - y + 100) % 10 === 0)) cv.px(x, y, c('argyle'));
  cv.part(m().poly([[24, 45], [32, 48], [24, 52]]).poly([[40, 45], [32, 48], [40, 52]]), { ramp: r('bowHi', 'bow', 'outline'), bevel: 1, inner: 'line', shadow: false });
  earsP(k, skin, 16, 30, 3.4, 5);
  const hm = headP(k, skin, { rx: 16, ry: 18, cy: 25, jawY: 34, jawRx: 14.5, jawRy: 11.5 });
  // dome shine + wrinkles + tufts
  cv.px(24, 12, c('white')); cv.px(25, 11, c('white')); cv.px(23, 13, c('skinHi')); cv.px(26, 11, c('skinHi'));
  for (const y of [15, 18]) cv.line(24, y, 40, y, (x, yy) => cv.shade(x, yy, 1));
  const tufts = m().ellipse(14, 24, 5, 6).ellipse(mirror(14), 24, 5, 6).poly([[11, 20], [5, 14], [14, 18]]).poly([[53, 20], [59, 14], [50, 18]]);
  cv.part(tufts, { ramp: hair, bevel: 3, inner: 'line' });
  eyesP(k, { y: 26, x0: 22, x1: 27, style: 'normal' });
  // round glasses
  for (const s of [1, -1]) {
    const X = (x) => (s > 0 ? x : mirror(x));
    const ring = m().ellipse(X(24.5) + 0.5, 27.5, 6.2, 5.2).cut(m().ellipse(X(24.5) + 0.5, 27.5, 4.8, 3.9));
    cv.flat(ring, c('frame'));
    cv.px(X(21), 25, c('lens')); cv.px(X(22), 24, c('lens')); cv.px(X(21), 26, c('lens'));
  }
  cv.line(29, 26, 34, 26, (x, y) => cv.px(x, y, c('frame')));
  // one skeptical brow up
  cv.part(m().capsule(19, 20, 28, 20.5, 1.6, 1.4).capsule(mirror(19), 17, mirror(28), 19, 1.6, 1.4), { ramp: hair, bevel: 1, inner: 'soft' });
  noseP(k, skin, { y: 33, rx: 3.8, ry: 3.4 });
  cv.part(m().rect(26, 37, 12, 2.5), { ramp: hair, bevel: 1, inner: 'soft', shadow: false });
  mouthP(k, { y: 42, x0: 28, x1: 36, kind: 'flat' });
  cv.px(37, 41, c('outline')); cv.px(38, 40, c('outline'));
  return cv.toSprite(0, 0, false);
}

export function brodyPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  // huge traps, bare chest
  cv.part(m().poly([[0, 60], [0, 44], [12, 38], [52, 38], [64, 44], [64, 60]]), { ramp: skin, bevel: 9 });
  cv.part(m().capsule(32, 34, 32, 44, 13, 14), { ramp: skin, bevel: 5, bias: -0.15 });
  for (const s of [1, -1]) cv.line(s > 0 ? 8 : 55, 54, s > 0 ? 28 : 35, 55, (x, y) => cv.shade(x, y, 1));
  for (let y = 48; y < 60; y++) for (let x = 27; x < 38; x++) if ((x * 5 + y * 3) % 7 === 0) cv.shade(x, y, 1);
  // ears: viewer-left cauliflowered
  cv.part(m().ellipse(14, 30, 5, 6).ellipse(mirror(15), 30, 3.6, 5.4), { ramp: skin, bevel: 3 });
  cv.shade(13, 29, 1); cv.shade(14, 32, 1); cv.shade(12, 31, 1);
  const hm = headP(k, skin, { rx: 17, ry: 17, jawY: 34, jawRx: 17.5, jawRy: 13, bevel: 9 });
  hm.rect(16, 32, 32, 12);
  stubbleP(k, hm, 34, 47, 1);
  // flat-top
  const top = m().rect(15, -1, 34, 17).rect(15, 16, 3, 7).rect(46, 16, 3, 7);
  cv.part(top, { ramp: hair, bevel: 3, inner: 'line' });
  for (let x = 16; x < 48; x += 2) cv.px(x, 0, c('hairHi'));
  for (let x = 17; x < 47; x += 3) cv.shade(x, 5, -1);
  eyesP(k, { y: 26, x0: 21, x1: 27, style: 'heavy' });
  // unibrow
  cv.part(m().capsule(18, 22, 32, 23.5, 2.4, 2).capsule(32, 23.5, 46, 22, 2, 2.4), { ramp: hair, bevel: 2, inner: 'soft' });
  // scar
  cv.px(41, 20, c('skinHi')); cv.px(42, 21, c('skinHi')); cv.px(42, 24, c('skinHi'));
  // flattened nose
  const nose = m().ellipse(33, 33, 6, 3.6).rect(30, 27, 4, 5);
  cv.part(nose, { ramp: skin, bevel: 3, inner: 'soft' });
  cv.px(28, 35, c('skinDk')); cv.px(29, 35, c('skinDk')); cv.px(36, 35, c('skinDk')); cv.px(37, 35, c('skinDk'));
  mouthP(k, { y: 42, x0: 26, x1: 38, kind: 'flat' });
  cv.shade(32, 47, 1); cv.shade(31, 47, 1);
  return cv.toSprite(0, 0, false);
}
