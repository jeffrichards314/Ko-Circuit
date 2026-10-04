// Intro-card portraits: the Nightmare Circuit (Hollow, Frenzy, Eclipse) and the
// final boss, ZERO. Revenant Rourke is Old Man Rourke's portrait in his
// grave-pale palette (see the PORTRAITS map).
import { setup, mirror, bust, earsP, headP, eyesP, browsP, noseP, mouthP } from './kit.js';

export function hollowPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'outline');
  bust(k, r('skinHi', 'skin', 'skinSh', 'skinDk'), skin, { neck: 7, top: 47, slope: 8 });
  earsP(k, skin, 19, 31, 2, 3.4);
  headP(k, skin, { rx: 13, ry: 17, cy: 28, jawY: 36, jawRx: 10, jawRy: 11 });
  for (const s of [1, -1]) for (let y = 34; y < 42; y++) cv.shade(s > 0 ? 23 : mirror(23), y, 1);
  // black sockets, a white pinpoint in each
  for (const s of [1, -1]) {
    const X = (x) => (s > 0 ? x : mirror(x));
    cv.flat(m().ellipse(X(25) + 0.5, 28.5, 3.6, 3), c('socket'));
    cv.px(X(25), 28, c('white'));
  }
  noseP(k, skin, { y: 35, rx: 1.8, ry: 1.8, bridge: false });
  cv.flat(m().ellipse(32, 43, 2.6, 2.6), c('mouth'), true);
  // long lank hair, parted, hanging down both sides of the face
  const hr = m().ellipse(32, 15, 16, 8);
  for (const s of [1, -1]) hr.poly([[s > 0 ? 24 : 40, 12], [s > 0 ? 14 : 50, 16], [s > 0 ? 12 : 52, 58], [s > 0 ? 22 : 42, 56], [s > 0 ? 23 : 41, 22]]);
  hr.cut(m().poly([[30, 8], [34, 8], [41, 20], [41, 60], [23, 60], [23, 20]]));
  cv.part(hr, { ramp: hair, bevel: 2, inner: 'line' });
  for (const x of [15, 18, 46, 49]) for (let y = 18; y < 54; y++) if (hr.in(x, y) && y % 4) cv.px(x, y, c('hairHi'));
  return cv.toSprite(0, 0, false);
}

export function frenzyPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  bust(k, skin, skin, { neck: 8, top: 46, slope: 11 });
  // the straitjacket straps
  cv.part(m().capsule(6, 50, 40, 62, 2.6, 2.6).capsule(58, 50, 24, 62, 2.6, 2.6), { ramp: r('strapHi', 'strap', 'strapDk'), bevel: 1, inner: 'line' });
  cv.part(m().rect(29, 55, 6, 5), { ramp: r('buckle', 'buckle', 'strapDk'), bevel: 1, inner: 'line', shadow: false });
  // wild hair behind the head
  const hr = m().ellipse(32, 18, 18, 11);
  for (const [a, b, x, y] of [[14, 20, 2, 12], [16, 12, 6, 0], [24, 8, 20, -4], [32, 7, 34, -6], [40, 8, 46, -3], [48, 12, 58, 2], [50, 20, 62, 14]]) hr.poly([[a - 3, b + 2], [x, y], [a + 3, b - 2]]);
  cv.part(hr, { ramp: hair, bevel: 3, inner: 'line' });
  earsP(k, skin, 18, 31, 2.4, 3.8);
  headP(k, skin, { rx: 13.5, ry: 16, cy: 29, jawY: 36, jawRx: 11, jawRy: 10.5 });
  for (const [x, y] of [[40, 18], [41, 19], [41, 21], [42, 22], [40, 20]]) cv.px(x, y, c('vein'));
  // wide yellow eyes, pinprick pupils
  for (const s of [1, -1]) {
    const X = (x) => (s > 0 ? x : mirror(x));
    for (let x = 22; x <= 28; x++) cv.px(X(x), 25, c('outline'));
    for (let y = 26; y <= 29; y++) for (let x = 22; x <= 28; x++) cv.px(X(x), y, c(x === 22 || x === 28 ? 'outline' : 'white'));
    for (let x = 22; x <= 28; x++) cv.px(X(x), 30, c('outline'));
    for (const [x, y] of [[24, 27], [25, 27], [24, 28], [25, 28]]) cv.px(X(x), y, c('eye'));
    cv.px(X(25), 27, c('outline'));
  }
  browsP(k, hair, { y: 22, r0: 1.3, r1: 1, tilt: -1.6 });
  noseP(k, skin, { y: 35, rx: 2.6, ry: 2.4 });
  // the grin round the mouthguard
  cv.flat(m().ellipse(32, 43, 8, 3), c('mouth'), true);
  for (let x = 25; x <= 39; x++) cv.px(x, 42, c('guard'));
  return cv.toSprite(0, 0, false);
}

export function eclipsePortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  // a thin corona behind him
  for (let a = 0; a < 90; a++) { const t = (a / 90) * Math.PI * 2; const X = Math.round(32 + Math.cos(t) * 27), Y = Math.round(26 + Math.sin(t) * 24); if (Y < 44) cv.px(X, Y, c(a & 1 ? 'sun' : 'sunHi')); }
  bust(k, skin, skin, { neck: 9, top: 46, slope: 12 });
  for (let a = 0; a < 16; a++) { const t = (a / 16) * Math.PI * 2; cv.px(32 + Math.round(Math.cos(t) * 3), 54 + Math.round(Math.sin(t) * 3), c('sun')); }
  earsP(k, skin, 17, 30, 2.8, 4.4);
  const hm = headP(k, skin, { rx: 15, ry: 17, cy: 27, jawY: 34, jawRx: 13, jawRy: 11 });
  // sun rays off the left half
  for (const a of [-2.8, -2.4, -2, -1.65]) {
    const cx = 32 + Math.cos(a) * 16, cy = 26 + Math.sin(a) * 18, ox = Math.cos(a) * 6, oy = Math.sin(a) * 6;
    cv.part(m().poly([[cx - oy * 0.4, cy + ox * 0.4], [cx + ox, cy + oy], [cx + oy * 0.4, cy - ox * 0.4]]), { ramp: r('sunHi', 'sun', 'sunDk'), bevel: 1, inner: 'line', shadow: false });
  }
  // the mask: sun on the left, moon on the right, down to the nose
  const top = m().rect(0, 0, 64, 36).clip(hm);
  cv.part(top.copy().cut(m().rect(32, 0, 32, 64)), { ramp: r('sunHi', 'sun', 'sunDk', 'sunDk'), bevel: 8, inner: 'soft', shadow: false });
  cv.part(top.copy().cut(m().rect(0, 0, 32, 64)), { ramp: r('moonHi', 'moon', 'moonDk', 'moonDk'), bevel: 8, inner: 'soft', shadow: false });
  for (let y = 10; y < 36; y++) if (hm.in(32, y)) cv.px(32, y, c('outline'));
  cv.flat(m().ellipse(41, 16, 4.4, 5).cut(m().ellipse(43, 15, 3.8, 4.6)), c('silver'));
  for (const s of [1, -1]) cv.flat(m().ellipse(s > 0 ? 25 : 39, 27.5, 4.4, 2.8), c('outline'));
  eyesP(k, { y: 26, x0: 22, x1: 28, style: 'narrow' });
  noseP(k, skin, { y: 36, rx: 2.8, ry: 2.4, bridge: false });
  mouthP(k, { y: 43, x0: 28, x1: 36, kind: 'flat' });
  return cv.toSprite(0, 0, false);
}

// ZERO's true form: the white mask split down the middle, one black slit for the eyes, a crown of shards, the hole in his chest
export function zeroTruePortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  bust(k, skin, skin, { neck: 10, top: 44, slope: 10 });
  for (let y = 50; y < 60; y++) for (let x = 24; x <= 40; x++) { const d = Math.hypot(x - 32, (y - 56) * 0.9); if (d < 5) cv.px(x, y, c('white')); else if (d < 6.4) cv.px(x, y, c('glow')); }
  cv.px(30, 54, c('skinHi')); cv.px(34, 57, c('skinHi'));
  earsP(k, skin, 17, 30, 2.4, 4);
  headP(k, skin, { rx: 15, ry: 17, cy: 27, jawY: 34, jawRx: 13, jawRy: 11 });
  for (let y = 11; y < 44; y++) cv.px(32 + ((y >> 2) & 1), y, c('outline'));
  for (let x = 19; x <= 45; x++) { cv.px(x, 27, c('white')); if (x > 21 && x < 43) cv.px(x, 28, c('white')); }
  cv.px(36, 27, c('glow')); cv.px(37, 27, c('glow'));
  for (const [x, h] of [[14, 6], [20, 9], [26, 12], [32, 15], [38, 12], [44, 9], [50, 6]]) for (let j = 0; j < h; j++) { const w = j > h / 2 ? 1 : 0, Y = 10 - (x === 32 ? 4 : Math.abs(x - 32) < 10 ? 2 : 0) - h + j; for (let i = -w - 1; i <= w + 1; i++) if (Y >= 0) cv.px(x + i, Y, c(Math.abs(i) > w ? 'outline' : j < 2 ? 'glow' : 'skinHi')); }
  void m;
  return cv.toSprite(0, 0, false);
}

export function zeroPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  bust(k, skin, skin, { neck: 9, top: 45, slope: 12 });
  for (let a = 0; a < 40; a++) { const t = (a / 40) * Math.PI * 2; const X = Math.round(32 + Math.cos(t) * 5), Y = Math.round(56 + Math.sin(t) * 7); if (Y < 60) cv.px(X, Y, c(a < 20 ? 'glow' : 'white')); }
  earsP(k, skin, 17, 30, 2.4, 4);
  headP(k, skin, { rx: 15, ry: 17, cy: 27, jawY: 34, jawRx: 13, jawRy: 11 });
  // one thin white line, nothing else
  for (let x = 21; x <= 43; x++) cv.px(x, 28, c(x < 24 || x > 40 ? 'glow' : 'white'));
  return cv.toSprite(0, 0, false);
}
