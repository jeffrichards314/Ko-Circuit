// Intro-card portraits (64x60 busts) for the Pantheon's fighters (spec §18), painted with the
// same kit and shading as Barney's. Circuit by circuit, the way the roster is numbered.
import { setup, mirror, bust, earsP, headP, eyesP, browsP, noseP, mouthP, stubbleP } from './kit.js';

// --- P1: Gate of Dawn --------------------------------------------------------------

export function oroPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  const gold = r('goldHi', 'gold', 'goldSh', 'goldDk');
  // a low sun behind him (the gate at dawn)
  for (let rad = 30; rad > 0; rad -= 6) cv.part(m().ellipse(50, 52, rad, rad * 0.8), { ramp: r(rad > 20 ? 'goldSh' : 'gold', rad > 20 ? 'goldSh' : 'gold'), bevel: 1, shadow: false, inner: 'none' });
  bust(k, gold, skin, { neck: 9, top: 46, slope: 14 });
  // pauldrons and the sun on his chest
  cv.part(m().ellipse(10, 50, 11, 7).ellipse(mirror(10), 50, 11, 7), { ramp: gold, bevel: 4, inner: 'line' });
  cv.part(m().ellipse(32, 57, 5.5, 4), { ramp: gold, bevel: 3, inner: 'line' });
  cv.part(m().ellipse(32, 57, 2.4, 2), { ramp: r('white', 'gem', 'goldDk'), bevel: 1, shadow: false });
  earsP(k, skin, 14, 29, 3.2, 5);
  // the crest: red horsehair fanning up behind the helm
  cv.part(m().poly([[28, 12], [22, 4], [28, -2], [36, -2], [42, 4], [36, 12]]), { ramp: r('plumeHi', 'plume', 'plumeDk'), bevel: 3, inner: 'line' });
  for (let x = 26; x <= 38; x += 3) cv.line(x, 11, x + (x - 32) * 0.5, 0, (X, Y) => cv.shade(X, Y, 1));
  const hm = headP(k, skin, { rx: 15.5, ry: 16, cy: 27, jawY: 33, jawRx: 15.5, jawRy: 12 });
  // the helm: dome, brow band, cheek guards and a nose guard
  cv.part(m().ellipse(32, 18, 17, 11).cut(m().rect(0, 22, 64, 40)), { ramp: gold, bevel: 6, inner: 'line' });
  cv.part(m().rect(15, 21, 34, 4), { ramp: gold, bevel: 1, inner: 'line', shadow: false });
  for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); cv.part(m().poly([[X(15), 24], [X(20), 24], [X(21), 40], [X(15), 37]]), { ramp: gold, bevel: 2, inner: 'line', shadow: false }); }
  cv.part(m().rect(30.5, 22, 3.4, 17), { ramp: gold, bevel: 1, inner: 'line', shadow: false });
  cv.px(28, 14, c('white')); cv.px(29, 13, c('white'));
  eyesP(k, { y: 26, x0: 22, x1: 28, style: 'heavy' });
  browsP(k, hair, { y: 23.5, r0: 2.2, r1: 1.8, tilt: 1.5 });
  // a thick black beard
  const bd = m().ellipse(32, 41, 14, 10).cut(m().ellipse(32, 33, 18, 7));
  bd.ellipse(19, 36, 4, 7).ellipse(mirror(19), 36, 4, 7);
  cv.part(bd, { ramp: hair, bevel: 4, inner: 'line' });
  for (let x = 20; x < 45; x += 3) { cv.shade(x, 44 + ((x >> 1) & 1), 1); cv.px(x, 38, c('hairHi')); }
  mouthP(k, { y: 39, x0: 28, x1: 36, kind: 'flat' });
  void hm; void stubbleP; void noseP;
  return cv.toSprite(0, 0, false);
}

export function larkPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  const tab = r('tabHi', 'tab', 'tabSh', 'outline');
  const gold = r('goldHi', 'gold', 'goldSh');
  // a bell of brass in the corner: the trumpet she's about to blow
  cv.part(m().poly([[44, 26], [62, 16], [62, 42], [44, 34]]), { ramp: r('brassHi', 'brass', 'brassDk'), bevel: 4, inner: 'line' });
  cv.part(m().ellipse(56, 29, 4, 9), { ramp: r('brassDk', 'brassDk', 'outline'), bevel: 2, inner: 'none', shadow: false });
  bust(k, tab, skin, { neck: 6.5, top: 47, slope: 10 });
  cv.line(8, 52, 56, 52, (X, Y) => cv.px(X, Y, c('gold')));
  cv.part(m().ellipse(32, 55, 4, 3.6), { ramp: gold, bevel: 2, inner: 'line', shadow: false });
  earsP(k, skin, 17.5, 30, 2.6, 4);
  const hm = headP(k, skin, { rx: 13.5, ry: 15.5, cy: 27, jawY: 34, jawRx: 11, jawRy: 10.5 });
  // curly gold fringe and side curls
  const fr = m().ellipse(32, 20, 15, 8).cut(m().rect(0, 25, 64, 40));
  for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); for (const y of [26, 32, 38]) fr.ellipse(X(17.5), y, 3.2, 3.6); }
  for (let i = -3; i <= 3; i++) fr.ellipse(32 + i * 4, 23 + (i & 1), 2.6, 3);
  cv.part(fr, { ramp: hair, bevel: 3, inner: 'line' });
  // the cap and the tall feather
  cv.part(m().ellipse(32, 13, 14.5, 8).cut(m().rect(0, 16, 64, 40)), { ramp: r('tabHi', 'tab', 'tabSh'), bevel: 5, inner: 'line' });
  cv.part(m().rect(18, 14.5, 28, 3), { ramp: gold, bevel: 1, inner: 'line', shadow: false });
  cv.part(m().poly([[39, 9], [46, -2], [53, -10], [55, -4], [48, 8]]), { ramp: r('feaHi', 'fea', 'feaDk'), bevel: 2, inner: 'line' });
  cv.line(43, 6, 52, -6, (X, Y) => cv.shade(X, Y, 1));
  eyesP(k, { y: 26, x0: 22, x1: 28, style: 'wide' });
  browsP(k, hair, { y: 22, r0: 1.2, r1: 1, tilt: 1.2 });
  noseP(k, skin, { y: 33, rx: 2.4, ry: 2.2 });
  mouthP(k, { y: 41, x0: 27, x1: 37, kind: 'grin' });
  void hm; void stubbleP;
  return cv.toSprite(0, 0, false);
}

export function emberPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  const robe = r('robeHi', 'robe', 'robeSh', 'outline');
  // the lantern glowing in the corner, throwing light across his face
  for (let rad = 20; rad > 0; rad -= 5) cv.part(m().ellipse(10, 46, rad, rad), { ramp: r(rad > 15 ? 'lampDk' : rad > 8 ? 'lamp' : 'lampHi', rad > 15 ? 'lampDk' : rad > 8 ? 'lamp' : 'lampHi'), bevel: 1, shadow: false, inner: 'none' });
  cv.part(m().rect(5, 41, 11, 12), { ramp: r('lampHi', 'lamp', 'lampDk'), bevel: 4, inner: 'line' });
  cv.part(m().rect(4, 38, 13, 3).rect(4, 53, 13, 3), { ramp: r('brassHi', 'brass', 'brassDk'), bevel: 1, inner: 'line', shadow: false });
  // the pushed-back hood behind his shoulders, the burlap tunic
  cv.part(m().ellipse(32, 44, 26, 12).cut(m().ellipse(32, 30, 20, 14)), { ramp: robe, bevel: 4, inner: 'line' });
  bust(k, robe, skin, { neck: 10, top: 46, slope: 13 });
  cv.part(m().poly([[24, 45], [40, 45], [32, 60]]), { ramp: skin, bevel: 3, inner: 'line', shadow: false });
  for (let x = 6; x < 60; x += 5) if (x < 22 || x > 42) cv.line(x, 48, x + 1, 60, (X, Y) => cv.shade(X, Y, 1));
  earsP(k, skin, 15, 30, 3.6, 5);
  const hm = headP(k, skin, { rx: 16.5, ry: 16, cy: 26, jawY: 33, jawRx: 16.5, jawRy: 12 });
  // shaved crown, a rim of rust hair, a cord round the brow
  for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); cv.part(m().ellipse(X(17), 24, 3.6, 6), { ramp: hair, bevel: 2, inner: 'line', shadow: false }); }
  cv.part(m().rect(16, 16, 32, 3), { ramp: r('cord', 'cord', 'gloveHi'), bevel: 1, inner: 'line', shadow: false });
  eyesP(k, { y: 24, x0: 21, x1: 27, style: 'normal' });
  browsP(k, hair, { y: 21, r0: 2, r1: 1.7, tilt: 0.8 });
  noseP(k, skin, { y: 31, rx: 4, ry: 3.4 });
  const bd = m().ellipse(32, 41, 15, 10).cut(m().ellipse(32, 32, 20, 6));
  bd.ellipse(18, 35, 3.6, 7).ellipse(mirror(18), 35, 3.6, 7);
  cv.part(bd, { ramp: hair, bevel: 4, inner: 'line' });
  for (let x = 19; x < 46; x += 3) cv.shade(x, 44 + ((x >> 1) & 1), 1);
  mouthP(k, { y: 39, x0: 28, x1: 36, kind: 'smile' });
  void hm; void stubbleP;
  return cv.toSprite(0, 0, false);
}

export function auroraPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  const ray = r('rayHi', 'ray', 'rayDk');
  // the sunburst behind her head
  for (let i = 0; i < 15; i++) {
    const a = -Math.PI + (i / 14) * Math.PI, len = i % 2 ? 27 : 34;
    cv.part(m().poly([[32 + Math.cos(a) * 15, 30 + Math.sin(a) * 15], [32 + Math.cos(a - 0.13) * 20, 30 + Math.sin(a - 0.13) * 20], [32 + Math.cos(a) * len, 30 + Math.sin(a) * len], [32 + Math.cos(a + 0.13) * 20, 30 + Math.sin(a + 0.13) * 20]]), { ramp: ray, bevel: 1, inner: 'line', shadow: false });
  }
  cv.part(m().ellipse(32, 29, 21, 21), { ramp: ray, bevel: 8, inner: 'line', shadow: false });
  // long rose-gold hair falling to her shoulders
  cv.part(m().poly([[12, 28], [52, 28], [58, 60], [6, 60]]), { ramp: hair, bevel: 6, inner: 'line' });
  bust(k, r('topHi', 'top', 'topSh', 'outline'), skin, { neck: 6.5, top: 48, slope: 9 });
  cv.line(24, 48, 12, 56, (X, Y) => cv.px(X, Y, c('gold'))); cv.line(40, 48, 52, 56, (X, Y) => cv.px(X, Y, c('gold')));
  earsP(k, skin, 18, 30, 2.4, 3.6);
  const hm = headP(k, skin, { rx: 12.5, ry: 15.5, cy: 28, jawY: 35, jawRx: 10.5, jawRy: 10 });
  // hair parted, swept round the face, the circlet
  const hr = m().ellipse(32, 20, 15.5, 10).cut(m().ellipse(32, 31, 10, 10));
  hr.ellipse(19, 34, 3.2, 10).ellipse(mirror(19), 34, 3.2, 10);
  cv.part(hr, { ramp: hair, bevel: 4, inner: 'line' });
  cv.line(32, 11, 30, 21, (X, Y) => cv.shade(X, Y, 2));
  cv.part(m().rect(19, 18, 26, 2.5), { ramp: r('goldHi', 'gold', 'goldSh'), bevel: 1, inner: 'line', shadow: false });
  cv.part(m().ellipse(32, 18.5, 2.4, 2.4), { ramp: r('goldHi', 'gold', 'goldSh'), bevel: 1, shadow: false });
  eyesP(k, { y: 27, x0: 22, x1: 28, style: 'normal' });
  for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); cv.px(X(21), 26, c('hairDk')); cv.px(X(20), 25, c('hairDk')); }
  browsP(k, hair, { y: 23.5, r0: 1, r1: 0.9, tilt: 1.4 });
  noseP(k, skin, { y: 34, rx: 2.4, ry: 2.2 });
  mouthP(k, { y: 41, x0: 28, x1: 36, kind: 'smile' });
  void hm; void stubbleP;
  return cv.toSprite(0, 0, false);
}

// --- P2: Cloud Terrace ---------------------------------------------------------------

export function zephyrPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  for (const [y, len] of [[14, 14], [26, 18], [40, 12]]) for (let i = 0; i < len; i++) if (i % 3 !== 2) cv.px(2 + i, y + (i >> 3), c('wing'));
  cv.part(m().poly([[0, 44], [18, 40], [30, 46], [10, 60], [0, 60]]), { ramp: r('scarfHi', 'scarf', 'scarfDk'), bevel: 3, inner: 'line' });
  bust(k, r('topHi', 'top', 'topSh', 'outline'), skin, { neck: 6.5, top: 47, slope: 10 });
  cv.line(16, 47, 12, 60, (X, Y) => cv.px(X, Y, c('teal'))); cv.line(48, 47, 52, 60, (X, Y) => cv.px(X, Y, c('teal')));
  earsP(k, skin, 18, 30, 2.4, 3.6);
  headP(k, skin, { rx: 13, ry: 15.5, cy: 27, jawY: 34, jawRx: 10.5, jawRy: 10 });
  const hr = m().ellipse(32, 19, 14.5, 7).cut(m().rect(0, 24, 64, 40));
  for (const [x, h] of [[20, 12], [26, 18], [32, 22], [38, 18], [44, 12]]) hr.poly([[x - 4, 20], [x + 4, 20], [x + (x - 32) * 0.3, 20 - h]]);
  cv.part(hr, { ramp: hair, bevel: 2, inner: 'line' });
  cv.part(m().rect(18, 20, 28, 3), { ramp: r('tealHi', 'teal', 'tealDk'), bevel: 1, inner: 'line', shadow: false });
  eyesP(k, { y: 27, x0: 22, x1: 28, style: 'narrow' });
  browsP(k, hair, { y: 24, r0: 1.1, r1: 0.9, tilt: 1.2 });
  noseP(k, skin, { y: 34, rx: 2.4, ry: 2.2 });
  mouthP(k, { y: 41, x0: 27, x1: 37, kind: 'grin' });
  return cv.toSprite(0, 0, false);
}

export function nimbusPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  for (let i = 0; i < 6; i++) cv.line(6 + i * 10, 2, 2 + i * 10, 16, (X, Y) => { if ((Y & 3) < 2) cv.px(X, Y, c('drip')); });
  bust(k, skin, skin, { neck: 16, top: 42, slope: 22 });
  for (const [x, y, rr] of [[8, 50, 9], [22, 56, 8], [42, 56, 8], [56, 50, 9]]) cv.part(m().ellipse(x, y, rr, rr * 0.8), { ramp: skin, bevel: 4, inner: 'line', shadow: false });
  const hm = headP(k, skin, { rx: 17, ry: 16, cy: 27, jawY: 34, jawRx: 17, jawRy: 12 });
  const puffs = m();
  for (const [x, y, rr] of [[16, 16, 8], [26, 9, 9], [38, 9, 9], [48, 16, 8], [32, 15, 10], [11, 28, 6], [53, 28, 6]]) puffs.ellipse(x, y, rr, rr * 0.85);
  puffs.cut(m().ellipse(32, 30, 13, 10));
  cv.part(puffs, { ramp: hair, bevel: 4, inner: 'line' });
  const bd = m().ellipse(32, 42, 15, 9).cut(m().ellipse(32, 34, 20, 6));
  for (const [x, y, rr] of [[17, 40, 5], [24, 48, 6], [40, 48, 6], [47, 40, 5]]) bd.ellipse(x, y, rr, rr * 0.8);
  cv.part(bd, { ramp: hair, bevel: 4, inner: 'line' });
  eyesP(k, { y: 26, x0: 22, x1: 27, style: 'narrow' });
  cv.part(m().capsule(20, 22, 28, 23.5, 2.2, 1.9).capsule(mirror(20), 22, mirror(28), 23.5, 2.2, 1.9), { ramp: hair, bevel: 1, inner: 'soft' });
  mouthP(k, { y: 40, x0: 27, x1: 37, kind: 'flat' });
  void hm; void stubbleP; void noseP;
  return cv.toSprite(0, 0, false);
}

export function ullaPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  // hair and sash streaming out to the right
  cv.part(m().poly([[36, 16], [64, 6], [64, 26], [40, 30]]), { ramp: hair, bevel: 3, inner: 'line' });
  cv.part(m().poly([[40, 52], [64, 46], [64, 60], [44, 60]]), { ramp: r('sashHi', 'sash', 'sashDk'), bevel: 3, inner: 'line' });
  bust(k, r('tealHi', 'teal', 'tealDk', 'outline'), skin, { neck: 8, top: 46, slope: 12 });
  cv.line(8, 52, 56, 52, (X, Y) => cv.px(X, Y, c('gold')));
  cv.part(m().ellipse(32, 54, 3.4, 3), { ramp: r('goldHi', 'gold', 'goldSh'), bevel: 2, inner: 'line', shadow: false });
  earsP(k, skin, 18, 30, 2.6, 3.8);
  headP(k, skin, { rx: 13.5, ry: 15.5, cy: 27, jawY: 34, jawRx: 11.5, jawRy: 10.5 });
  cv.part(m().ellipse(32, 19, 15, 9).cut(m().ellipse(32, 30, 11, 9)), { ramp: hair, bevel: 3, inner: 'line' });
  cv.part(m().rect(18, 18, 28, 3), { ramp: r('goldHi', 'gold', 'goldSh'), bevel: 1, inner: 'line', shadow: false });
  cv.part(m().poly([[24, 17], [22, 8], [27, 4], [28, 14]]), { ramp: r('featherHi', 'feather', 'feather'), bevel: 1, inner: 'line', shadow: false });
  eyesP(k, { y: 26, x0: 22, x1: 28, style: 'normal' });
  browsP(k, hair, { y: 23, r0: 1.4, r1: 1.1, tilt: 1 });
  noseP(k, skin, { y: 33, rx: 2.8, ry: 2.5 });
  mouthP(k, { y: 41, x0: 27, x1: 37, kind: 'grin' });
  cv.px(38, 35, c('skinHi')); cv.px(39, 36, c('skinHi'));
  return cv.toSprite(0, 0, false);
}

export function cirrusPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  // the crown: a fan of tall white feathers
  for (let i = -3; i <= 3; i++) cv.part(m().poly([[32 + i * 7 - 3, 14], [32 + i * 7 + 3, 14], [32 + i * 9, 14 - (20 - Math.abs(i) * 3)]]), { ramp: hair, bevel: 2, inner: 'line' });
  bust(k, r('robeHi', 'robe', 'robeSh', 'outline'), skin, { neck: 8, top: 47, slope: 12 });
  cv.line(26, 47, 24, 60, (X, Y) => cv.px(X, Y, c('silver'))); cv.line(38, 47, 40, 60, (X, Y) => cv.px(X, Y, c('silver')));
  cv.part(m().ellipse(32, 55, 4, 4), { ramp: r('sunHi', 'sun', 'sunDk'), bevel: 3, inner: 'line', shadow: false });
  earsP(k, skin, 17, 30, 2.6, 4);
  headP(k, skin, { rx: 14, ry: 16, cy: 27, jawY: 34, jawRx: 12, jawRy: 11 });
  for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); cv.part(m().ellipse(X(15), 34, 3.4, 12), { ramp: hair, bevel: 3, inner: 'line', shadow: false }); }
  cv.part(m().rect(17, 14, 30, 4), { ramp: r('silverHi', 'silver', 'silverDk'), bevel: 1, inner: 'line', shadow: false });
  cv.part(m().ellipse(32, 16, 2.4, 2.4), { ramp: r('sunHi', 'sun', 'sunDk'), bevel: 1, shadow: false });
  eyesP(k, { y: 25, x0: 22, x1: 28, style: 'normal', iris: 'moonDk' });
  cv.part(m().capsule(20, 22, 28, 23, 2, 1.6).capsule(mirror(20), 22, mirror(28), 23, 2, 1.6), { ramp: hair, bevel: 1, inner: 'soft' });
  noseP(k, skin, { y: 32, rx: 3.6, ry: 3 });
  const bd = m().ellipse(32, 44, 13, 9).cut(m().ellipse(32, 36, 18, 6));
  bd.poly([[24, 46], [40, 46], [42, 62], [34, 56], [26, 60]]);
  cv.part(bd, { ramp: hair, bevel: 4, inner: 'line' });
  mouthP(k, { y: 40, x0: 28, x1: 36, kind: 'flat' });
  return cv.toSprite(0, 0, false);
}

// --- P3: Hall of Heroes (each in the look of his era) --------------------------------------

export function tomPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  bust(k, skin, skin, { neck: 10, top: 45, slope: 15 });
  for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); cv.line(X(18), 45, X(24), 60, (Xx, Yy) => { cv.px(Xx, Yy, c('brace')); cv.px(Xx + 1, Yy, c('braceHi')); }); }
  earsP(k, skin, 15, 30, 3.4, 5);
  const hm = headP(k, skin, { rx: 16, ry: 16.5, cy: 26, jawY: 33, jawRx: 16, jawRy: 12 });
  cv.part(m().ellipse(32, 17, 16.5, 8).cut(m().rect(0, 21, 64, 40)), { ramp: hair, bevel: 3, inner: 'line' });
  for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); cv.part(m().rect(X(15), 22, 4, 16), { ramp: hair, bevel: 1, inner: 'line', shadow: false }); }
  cv.line(30, 10, 24, 20, (X, Y) => cv.shade(X, Y, 2));
  eyesP(k, { y: 25, x0: 21, x1: 27, style: 'heavy' });
  browsP(k, hair, { y: 22, r0: 2.4, r1: 2, tilt: 0.8 });
  noseP(k, skin, { y: 32, rx: 4.2, ry: 3.6 });
  const mu = m().ellipse(24, 39, 8, 3.4).ellipse(40, 39, 8, 3.4).ellipse(32, 38, 5, 3);
  mu.poly([[16, 38], [10, 32], [17, 42]]).poly([[48, 38], [54, 32], [47, 42]]);
  cv.part(mu, { ramp: hair, bevel: 2, inner: 'line' });
  mouthP(k, { y: 44, x0: 29, x1: 35, kind: 'flat' });
  void hm; void stubbleP;
  return cv.toSprite(0, 0, false);
}

export function julesPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  bust(k, r('shirtHi', 'shirt', 'shirtSh'), skin, { neck: 7, top: 46, slope: 11 });
  cv.part(m().poly([[0, 60], [4, 50], [22, 46], [28, 60]]).poly([[64, 60], [60, 50], [42, 46], [36, 60]]), { ramp: r('blkHi', 'blk', 'blkDk'), bevel: 3, inner: 'line' });
  cv.part(m().poly([[24, 47], [32, 50], [24, 54]]).poly([[40, 47], [32, 50], [40, 54]]), { ramp: r('blkHi', 'blk', 'blkDk'), bevel: 1, inner: 'line', shadow: false });
  earsP(k, skin, 17, 30, 2.6, 4);
  headP(k, skin, { rx: 13.5, ry: 16, cy: 27, jawY: 34, jawRx: 11, jawRy: 10.5 });
  cv.part(m().ellipse(32, 18, 14.5, 8).cut(m().rect(0, 22, 64, 40)), { ramp: hair, bevel: 3, inner: 'line' });
  // the top hat
  cv.part(m().rect(18, -6, 28, 22), { ramp: r('blkHi', 'blk', 'blkDk'), bevel: 3, inner: 'line' });
  cv.part(m().rect(18, 10, 28, 3.5), { ramp: r('band', 'band', 'blkDk'), bevel: 1, inner: 'line', shadow: false });
  cv.part(m().ellipse(32, 16, 21, 3.4), { ramp: r('blkHi', 'blk', 'blkDk'), bevel: 1, inner: 'line' });
  eyesP(k, { y: 26, x0: 22, x1: 28, style: 'wide' });
  browsP(k, hair, { y: 23, r0: 1, r1: 0.9, tilt: 1.6 });
  noseP(k, skin, { y: 33, rx: 2.6, ry: 2.4 });
  for (let x = 24; x <= 40; x++) cv.px(x, 38 - (Math.abs(x - 32) > 6 ? 1 : 0), c('hair'));
  mouthP(k, { y: 41, x0: 26, x1: 38, kind: 'grin' });
  return cv.toSprite(0, 0, false);
}

export function reubenPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  bust(k, skin, skin, { neck: 15, top: 43, slope: 22 });
  for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); cv.part(m().poly([[X(22), 43], [X(30), 43], [X(28), 60], [X(20), 58]]), { ramp: r('towelHi', 'towel', 'towelSh'), bevel: 2, inner: 'line', shadow: false }); }
  earsP(k, skin, 13, 28, 3.6, 5);
  const hm = headP(k, skin, { rx: 17.5, ry: 16.5, cy: 25, jawY: 32, jawRx: 17.5, jawRy: 12.5 });
  cv.part(m().rect(15, 4, 34, 14), { ramp: hair, bevel: 2, inner: 'line' });
  for (let x = 16; x < 48; x += 2) for (let y = 5; y < 17; y += 2) cv.px(x, y, c('hairHi'));
  eyesP(k, { y: 24, x0: 20, x1: 27, style: 'narrow' });
  cv.part(m().capsule(18, 21, 28, 22, 2.6, 2).capsule(mirror(18), 21, mirror(28), 22, 2.6, 2), { ramp: hair, bevel: 1, inner: 'soft' });
  noseP(k, skin, { y: 31, rx: 5, ry: 3.6 });
  for (let i = 0; i < 6; i++) cv.px(20 + (i >> 1), 18 + i, c('skinHi'));
  mouthP(k, { y: 39, x0: 25, x1: 39, kind: 'flat' });
  stubbleP(k, hm, 36, 47);
  return cv.toSprite(0, 0, false);
}

export function simonePortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  // the afro behind everything
  cv.part(m().ellipse(32, 22, 30, 24), { ramp: hair, bevel: 10, inner: 'line' });
  for (const [x, y, rr] of [[6, 30, 8], [58, 30, 8], [12, 8, 9], [52, 8, 9], [32, -2, 10]]) cv.part(m().ellipse(x, y, rr, rr), { ramp: hair, bevel: 4, inner: 'line', shadow: false });
  bust(k, r('halterHi', 'halter', 'halterDk', 'outline'), skin, { neck: 6.5, top: 47, slope: 9 });
  cv.part(m().poly([[24, 46], [40, 46], [32, 60]]), { ramp: skin, bevel: 3, inner: 'line', shadow: false });
  earsP(k, skin, 18, 31, 2.4, 3.6);
  headP(k, skin, { rx: 12.5, ry: 15.5, cy: 28, jawY: 35, jawRx: 10.5, jawRy: 10 });
  cv.part(m().ellipse(32, 20, 16, 9).cut(m().ellipse(32, 31, 10, 9)), { ramp: hair, bevel: 3, inner: 'line' });
  cv.part(m().rect(17, 19, 30, 3), { ramp: r('bandHi', 'band', 'outline'), bevel: 1, inner: 'line', shadow: false });
  for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); cv.part(m().ellipse(X(17), 40, 3, 4).cut(m().ellipse(X(17), 40, 1.4, 2.4)), { ramp: r('gold', 'gold', 'halterDk'), bevel: 1, inner: 'line', shadow: false }); }
  eyesP(k, { y: 27, x0: 22, x1: 28, style: 'normal' });
  for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); cv.px(X(21), 26, c('hairDk')); cv.px(X(20), 25, c('hairDk')); }
  browsP(k, hair, { y: 24, r0: 1, r1: 0.9, tilt: 1.4 });
  noseP(k, skin, { y: 34, rx: 2.5, ry: 2.3 });
  mouthP(k, { y: 41, x0: 27, x1: 37, kind: 'grin' });
  return cv.toSprite(0, 0, false);
}

export function oldguardPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  // ghost wisps curling off his shoulders
  for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); for (let i = 0; i < 26; i++) cv.px(X(52 + i * 0.3), 48 - i * 1.4 + Math.sin(i * 0.5) * 3, c('wisp')); }
  bust(k, skin, skin, { neck: 14, top: 43, slope: 20 });
  cv.part(m().ellipse(32, 56, 16, 6), { ramp: r('goldHi', 'gold', 'goldSh'), bevel: 3, inner: 'line' });
  cv.part(m().ellipse(32, 56, 8, 3.4), { ramp: r('goldSh', 'gold', 'goldHi'), bevel: 2, inner: 'line', shadow: false });
  earsP(k, skin, 14, 29, 3.4, 5);
  const hm = headP(k, skin, { rx: 16, ry: 16.5, cy: 26, jawY: 33, jawRx: 16, jawRy: 12 });
  for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); cv.part(m().rect(X(15), 22, 4, 14), { ramp: hair, bevel: 1, inner: 'line', shadow: false }); }
  // the top hat with a torn brim
  cv.part(m().rect(17, -8, 30, 24), { ramp: r('hatHi', 'hat', 'hatDk'), bevel: 3, inner: 'line' });
  cv.part(m().rect(17, 9, 30, 4), { ramp: r('goldHi', 'gold', 'goldSh'), bevel: 1, inner: 'line', shadow: false });
  cv.part(m().ellipse(32, 16, 22, 3.6).cut(m().poly([[42, 12], [50, 12], [46, 20]])), { ramp: r('hatHi', 'hat', 'hatDk'), bevel: 1, inner: 'line' });
  eyesP(k, { y: 26, x0: 21, x1: 27, style: 'heavy' });
  cv.part(m().capsule(19, 23, 28, 24, 2.4, 2).capsule(mirror(19), 23, mirror(28), 24, 2.4, 2), { ramp: hair, bevel: 1, inner: 'soft' });
  noseP(k, skin, { y: 32, rx: 4.6, ry: 3.8 });
  const mu = m().ellipse(24, 40, 9, 4).ellipse(40, 40, 9, 4).ellipse(32, 39, 6, 3.2);
  mu.poly([[15, 40], [11, 52], [19, 46]]).poly([[49, 40], [53, 52], [45, 46]]);
  cv.part(mu, { ramp: hair, bevel: 3, inner: 'line' });
  void hm; void stubbleP;
  return cv.toSprite(0, 0, false);
}

// --- P4: Starfield (built with the portrait rig, ./rig.js) ---------------------------------------------
import { portrait } from './rig.js';

const stars = (k, n, cols, seed = 3) => {
  for (let i = 0; i < n; i++) { const x = (i * 37 + seed * 11) % 60 + 2, y = (i * 23 + seed * 5) % 34 + 2; k.cv.px(x, y, k.c(cols[i % cols.length])); if (i % 4 === 0) { k.cv.px(x - 1, y, k.c('outline')); k.cv.px(x + 1, y, k.c('outline')); } }
};

export const polarisPortrait = portrait({
  bg(k) { const { cv, m, c, r } = k; cv.part(m().ellipse(32, 30, 40, 32), { ramp: r('topDk', 'topDk', 'topDk'), bevel: 1, shadow: false, inner: 'none' }); stars(k, 22, ['starHi', 'white', 'trim']); },
  top: { neck: 7, top: 47, slope: 11 }, head: { rx: 13, ry: 16, cy: 27, jawY: 35, jawRx: 10.5, jawRy: 10.5 }, ear: [17.5, 30, 2.4, 3.6],
  hair: 'bun', beard: 'goatee', eyes: 'narrow', mouth: 'flat', brow: { r0: 1.6, r1: 1.4, tilt: 1.4 },
  body(k) { const { cv, c } = k; cv.line(20, 48, 14, 58, (X, Y) => cv.px(X, Y, c('trim'))); cv.line(44, 48, 50, 58, (X, Y) => cv.px(X, Y, c('trim'))); for (const [x, y] of [[26, 52], [38, 55], [32, 58], [18, 56]]) cv.px(x, y, c('starHi')); },
  front(k) { const { cv, m, c, r } = k; cv.part(m().rect(19, 17, 26, 2.6), { ramp: r('trimHi', 'trim', 'trimSh'), bevel: 1, inner: 'line', shadow: false }); for (const [x, y] of [[32, 13], [31, 14], [33, 14], [32, 15], [32, 12]]) cv.px(x, y, c('starHi')); cv.px(32, 14, c('white')); },
});

export const kiraPortrait = portrait({
  bg(k) { const { cv, c } = k; for (let i = 0; i < 7; i++) cv.line(64, 6 + i * 3, 30 - i * 6, 22 + i * 8, (X, Y) => { if (((X + Y) & 3) < 2) cv.px(X, Y, c(i < 3 ? 'trim' : 'trimSh')); }); },
  behind(k) { const { cv, m, r } = k; cv.part(m().poly([[40, 20], [64, 6], [64, 26], [46, 36]]), { ramp: r('hairHi', 'hair', 'hairDk'), bevel: 4, inner: 'line' }); },
  top: { neck: 6.5, top: 48, slope: 9 }, head: { rx: 12.5, ry: 15.5, cy: 27, jawY: 34, jawRx: 10, jawRy: 10.5 }, ear: [18, 30, 2.4, 3.4],
  hair: 'crop', eyes: 'wide', mouth: 'grin', brow: { r0: 1.2, r1: 1, tilt: 1.6 },
  body(k) { const { cv, m, c, r } = k; cv.part(m().ellipse(42, 54, 3.6, 3.6), { ramp: r('white', 'flame', 'trimSh'), bevel: 1, inner: 'line', shadow: false }); cv.line(38, 57, 22, 60, (X, Y) => cv.px(X, Y, c('trim'))); },
  front(k) { const { cv, m, c, r } = k; cv.part(m().rect(18, 19, 28, 4), { ramp: r('white', 'visor', 'trimSh'), bevel: 1, inner: 'line', shadow: false }); cv.px(24, 20, c('white')); cv.px(25, 20, c('white')); },
});

export const orbitPortrait = portrait({
  bg(k) { const { cv, m, c, r } = k; for (const [rx, ry] of [[30, 12], [24, 9], [18, 6]]) { const ring = m().ellipse(32, 50, rx, ry).cut(m().ellipse(32, 50, rx - 1.6, ry - 1.4)); cv.part(ring, { ramp: r('trimHi', 'trim', 'trimSh'), bevel: 1, shadow: false, inner: 'none' }); } cv.part(m().ellipse(8, 38, 5, 5), { ramp: r('starHi' in k ? 'starHi' : 'trimHi', 'trim', 'trimSh'), bevel: 2, shadow: false, inner: 'line' }); },
  top: { neck: 9, top: 45, slope: 14 }, head: { rx: 16, ry: 16.5, cy: 26, jawY: 33, jawRx: 15, jawRy: 12 }, ear: [15, 29, 3, 4.6],
  hair: 'none', eyes: 'heavy', mouth: 'flat', brow: { r0: 2.2, r1: 1.8, tilt: 1 },
  body(k) { const { cv, m, r } = k; for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); cv.part(m().poly([[X(22), 45], [X(29), 45], [X(31), 60], [X(12), 60]]), { ramp: r('topHi', 'top', 'topSh'), bevel: 3, inner: 'line', shadow: false }); } },
  front(k) { const { cv, m, r } = k; const ring = m().ellipse(32, 6, 12, 3.4).cut(m().ellipse(32, 6, 9.6, 2.2)); cv.part(ring, { ramp: r('ringHi', 'trimHi', 'trim'), bevel: 1, inner: 'line', shadow: false }); },
});

export const nebulaPortrait = portrait({
  bg(k) { const { cv, m, r } = k; for (const [x, y, rx, ry, a] of [[16, 20, 22, 14, 'skinDk'], [50, 34, 20, 16, 'topSh'], [30, 52, 26, 10, 'hairDk']]) cv.part(m().ellipse(x, y, rx, ry), { ramp: r(a, a, a), bevel: 1, shadow: false, inner: 'none' }); stars(k, 26, ['star', 'white', 'trim'], 7); },
  top: { neck: 9, top: 46, slope: 16 }, head: { rx: 15, ry: 16, cy: 27, jawY: 34, jawRx: 12.5, jawRy: 11 }, ear: [17, 30, 2.6, 3.8],
  hair: 'wild', eyes: 'wide', iris: 'eye', mouth: 'smile', brow: { r0: 1.4, r1: 1.2, tilt: 1.3 },
  body(k) { const { cv, c } = k; for (let i = 0; i < 40; i++) { const t = i * 0.42, rr = 1 + i * 0.32; cv.px(32 + Math.cos(t) * rr, 55 + Math.sin(t) * rr * 0.5, c(i % 5 === 0 ? 'star' : i & 1 ? 'trim' : 'trimSh')); } },
  mid(k) { const { cv, c } = k; for (const [x, y] of [[22, 24], [41, 30], [26, 36], [38, 21], [32, 17]]) cv.px(x, y, c('star')); },
});

// --- P5: Thunder Forge ----------------------------------------------------------------------------------
const glow = (k, cx, cy, n = 4, keys = ['ember', 'spark', 'trimHi']) => { const { cv, m, r } = k; for (let i = n; i > 0; i--) { const q = i > 3 ? keys[0] : i > 2 ? keys[1] : keys[2]; cv.part(m().ellipse(cx, cy, i * 8, i * 6), { ramp: r(q, q, q), bevel: 1, shadow: false, inner: 'none' }); } };

export const anvilPortrait = portrait({
  bg(k) { const { cv, m, r } = k; cv.part(m().rect(0, 0, 64, 60), { ramp: r('topDk', 'topDk', 'topDk'), bevel: 1, shadow: false, inner: 'none' }); cv.part(m().poly([[40, 60], [44, 48], [64, 46], [64, 60]]), { ramp: r('trimHi', 'trim', 'trimSh'), bevel: 3, inner: 'line', shadow: false }); },
  top: { neck: 10, top: 45, slope: 15 }, head: { rx: 16, ry: 16, cy: 26, jawY: 33, jawRx: 16, jawRy: 12 }, ear: [15, 29, 3, 4.6],
  hair: 'none', beard: 'full', eyes: 'heavy', mouth: 'flat', brow: { r0: 2.2, r1: 1.9, tilt: 1.2 },
  front(k) { const { cv, m, r } = k; cv.part(m().ellipse(32, 15, 17, 8).cut(m().rect(0, 19, 64, 40)), { ramp: r('topHi', 'top', 'topSh'), bevel: 4, inner: 'line' }); cv.part(m().rect(15, 17, 34, 3), { ramp: r('topHi', 'top', 'topSh'), bevel: 1, inner: 'line', shadow: false }); },
});

export const sparkPortrait = portrait({
  bg(k) { const { cv, c } = k; for (let i = 0; i < 6; i++) { let x = 6 + i * 11, y = 2; for (let j = 0; j < 8; j++) { cv.px(x, y, c('arc')); x += (i + j) & 1 ? 2 : -2; y += 3; } } },
  top: { neck: 6.5, top: 48, slope: 9 }, head: { rx: 12.5, ry: 15.5, cy: 27, jawY: 34, jawRx: 10, jawRy: 10.5 }, ear: [18, 30, 2.4, 3.4],
  hair: 'spike', eyes: 'wide', mouth: 'grin', brow: { r0: 1.2, r1: 1, tilt: 1.6 },
  body(k) { const { cv, c } = k; for (const [x, y] of [[30, 52], [33, 55], [29, 58]]) { cv.px(x, y, c('bolt')); cv.px(x + 1, y, c('bolt')); } },
});

export const bellowsPortrait = portrait({
  bg(k) { glow(k, 6, 52, 3, ['trimSh', 'trim', 'trimHi']); },
  top: { neck: 12, top: 44, slope: 18 }, head: { rx: 17, ry: 16, cy: 26, jawY: 33, jawRx: 17, jawRy: 12 }, ear: [14, 29, 3, 4.6],
  hair: 'none', beard: 'stache', eyes: 'normal', mouth: 'open', brow: { r0: 2.2, r1: 1.8, tilt: 0.8 },
  mid(k) { const { cv, m, c } = k; cv.flat(m().ellipse(19, 34, 3.4, 2.4).ellipse(45, 34, 3.4, 2.4), c('flush')); },
});

export const halePortrait = portrait({
  bg(k) { glow(k, 32, 62, 5); },
  top: { neck: 11, top: 45, slope: 17 }, head: { rx: 16, ry: 16.5, cy: 26, jawY: 33, jawRx: 16.5, jawRy: 12 }, ear: [15, 29, 3, 4.6],
  hair: 'crop', beard: 'full', eyes: 'heavy', mouth: 'flat', brow: { r0: 2.2, r1: 1.9, tilt: 1.2 },
  body(k) { const { cv, c } = k; for (let i = 0; i < 4; i++) cv.line(14 + i * 12, 50, 16 + i * 12, 60, (X, Y) => cv.px(X, Y, c('ember'))); },
  front(k) { const { cv, m, r, c } = k; cv.part(m().rect(15, 15, 34, 4), { ramp: r('topHi', 'top', 'topSh'), bevel: 1, inner: 'line', shadow: false }); for (let i = -2; i <= 2; i++) cv.part(m().poly([[32 + i * 7 - 2.6, 15], [32 + i * 7, 7 + Math.abs(i)], [32 + i * 7 + 2.6, 15]]), { ramp: r('topHi', 'top', 'topSh'), bevel: 1, inner: 'line', shadow: false }); cv.px(32, 17, c('ember')); },
});

// --- P6: Mirror Sanctum ---------------------------------------------------------------------------------
const panes = (k, tint) => { const { cv, m, r } = k; for (let i = 0; i < 4; i++) cv.part(m().rect(i * 17 - 2, 0, 15, 60), { ramp: r(tint, tint, tint), bevel: 1, shadow: false, inner: 'none' }); for (let i = 0; i < 4; i++) k.cv.line(i * 17 + 2, 4, i * 17 + 10, 40, (X, Y) => { if (Y & 1) k.cv.px(X, Y, k.c('white')); }); };

export const reflectionPortrait = portrait({
  bg(k) { panes(k, 'sh'); },
  top: { neck: 8, top: 46, slope: 12 }, head: { rx: 14, ry: 16, cy: 27, jawY: 34, jawRx: 12, jawRy: 11 },
  hair: 'spike', eyes: 'normal', mouth: 'flat', brow: { r0: 1.8, r1: 1.5, tilt: 1.2 },
});
export const glassPortrait = portrait({
  bg(k) { const { cv, c } = k; for (let i = 0; i < 9; i++) cv.line(4 + i * 7, 2, 16 + i * 5, 58, (X, Y) => { if (((X + Y) & 3) < 2) cv.px(X, Y, c(i & 1 ? 'topHi' : 'trimHi')); }); },
  top: { neck: 6.5, top: 47, slope: 10 }, head: { rx: 12.5, ry: 16, cy: 27, jawY: 35, jawRx: 10, jawRy: 10.5 }, ear: [18, 30, 2.2, 3.2],
  hair: 'spike', eyes: 'narrow', mouth: 'flat', brow: { r0: 1.3, r1: 1.1, tilt: 1.3 },
  mid(k) { const { cv, c } = k; for (const [x1, y1, x2, y2] of [[24, 22, 30, 32], [40, 20, 36, 34], [30, 38, 38, 46]]) cv.line(x1, y1, x2, y2, (X, Y) => cv.px(X, Y, c('glint'))); },
});
export const doubtPortrait = portrait({
  bg(k) { const { cv, m, c, r } = k; cv.part(m().rect(0, 0, 64, 60), { ramp: r('topDk', 'topDk', 'topDk'), bevel: 1, shadow: false, inner: 'none' }); for (const [x, y] of [[8, 10], [52, 14], [10, 40], [54, 42]]) { cv.part(m().rect(x - 5, y - 3, 12, 7), { ramp: r('trimHi', 'trimHi', 'trimSh'), bevel: 1, shadow: false, inner: 'line' }); cv.px(x - 2, y, c('lie')); cv.px(x, y, c('truth')); } },
  top: { neck: 7, top: 47, slope: 11 }, head: { rx: 13, ry: 16, cy: 27, jawY: 34, jawRx: 10.5, jawRy: 10.5 }, ear: null,
  hair: 'none', eyes: 'wide', mouth: 'open', brow: { r0: 1.2, r1: 1, tilt: 1.8 },
  front(k) { const { cv, m, r } = k; cv.part(m().ellipse(32, 20, 21, 17).cut(m().ellipse(32, 30, 14, 14)), { ramp: r('topHi', 'top', 'topSh'), bevel: 4, inner: 'line' }); },
});
export const prismPortrait = portrait({
  bg(k) { const { cv, c } = k; for (const [col, dy] of [['ray1', 0], ['white', 5], ['ray2', 10]]) cv.line(0, 20 + dy, 26, 24 + dy * 0.6, (X, Y) => cv.px(X, Y, c(col))); for (const [col, dy] of [['ray1', 0], ['white', 4], ['ray2', 9]]) cv.line(38, 26 + dy * 0.5, 64, 12 + dy, (X, Y) => cv.px(X, Y, c(col))); },
  top: { neck: 7.5, top: 46, slope: 12 }, head: { rx: 13.5, ry: 16, cy: 27, jawY: 34, jawRx: 11.5, jawRy: 10.5 }, ear: [18, 30, 2.4, 3.6],
  hair: 'long', eyes: 'normal', mouth: 'smile', brow: { r0: 1.4, r1: 1.2, tilt: 1.2 },
  body(k) { const { cv, m, c, r } = k; cv.part(m().poly([[26, 58], [38, 58], [32, 47]]), { ramp: [c('white'), c('trimHi'), c('trimSh')], bevel: 2, inner: 'line', shadow: false }); void r; },
});

// --- P7: the Summit --------------------------------------------------------------------------------------
const rays = (k, col) => { const { cv, c } = k; for (let i = 0; i < 9; i++) { const a = -Math.PI + (i / 8) * Math.PI; cv.line(32 + Math.cos(a) * 16, 30 + Math.sin(a) * 16, 32 + Math.cos(a) * 36, 30 + Math.sin(a) * 36, (X, Y) => { if ((X + Y) & 1) cv.px(X, Y, c(col)); }); } };

export const aldricPortrait = portrait({
  bg(k) { const { cv, m, r } = k; for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); cv.part(m().poly([[X(14), 44], [X(0), 8], [X(12), 14], [X(24), 24], [X(28), 40]]), { ramp: r('gloveHi', 'glove', 'gloveDk'), bevel: 4, inner: 'line' }); } },
  top: { neck: 10, top: 45, slope: 15 }, head: { rx: 15, ry: 16, cy: 26, jawY: 33, jawRx: 15, jawRy: 12 }, ear: [16, 29, 3, 4.4],
  hair: 'crop', beard: 'stubble', eyes: 'heavy', mouth: 'flat', brow: { r0: 2.2, r1: 1.8, tilt: 1.1 },
  body(k) { const { cv, m, r, c } = k; cv.part(m().ellipse(32, 56, 4, 3.4), { ramp: [c('white'), c('gem'), c('trimSh')], bevel: 1, shadow: false }); void r; },
});
export const valkyrPortrait = portrait({
  bg(k) { rays(k, 'plume'); },
  behind(k) { const { cv, m, r } = k; cv.part(m().poly([[44, 20], [58, 30], [56, 60], [44, 60]]), { ramp: r('hairHi', 'hair', 'hairDk'), bevel: 4, inner: 'line' }); },
  top: { neck: 6.5, top: 48, slope: 9 }, head: { rx: 12.5, ry: 15.5, cy: 28, jawY: 35, jawRx: 10, jawRy: 10 }, ear: null,
  hair: 'none', eyes: 'narrow', mouth: 'flat', brow: { r0: 1.2, r1: 1, tilt: 1.4 },
  front(k) { const { cv, m, r } = k; cv.part(m().ellipse(32, 18, 15, 10).cut(m().rect(0, 22, 64, 40)), { ramp: r('trimHi', 'trim', 'trimSh'), bevel: 4, inner: 'line' }); cv.part(m().rect(16, 20, 32, 3), { ramp: r('trimHi', 'trim', 'trimSh'), bevel: 1, inner: 'line', shadow: false }); for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); cv.part(m().poly([[X(14), 20], [X(2), 8], [X(4), 16], [X(0), 20], [X(8), 22]]), { ramp: r('gloveHi', 'glove', 'gloveDk'), bevel: 2, inner: 'line', shadow: false }); } },
});
export const scribePortrait = portrait({
  bg(k) { const { cv, m, c, r } = k; cv.part(m().rect(0, 0, 64, 60), { ramp: r('topDk', 'topDk', 'topDk'), bevel: 1, shadow: false, inner: 'none' }); for (let y = 6; y < 40; y += 6) cv.line(4, y, 20, y, (X, Y) => cv.px(X, Y, c('trimSh'))); cv.part(m().poly([[50, 6], [60, 2], [58, 22], [52, 24]]), { ramp: [c('quill'), c('quill'), c('trimSh')], bevel: 1, shadow: false, inner: 'line' }); },
  top: { neck: 6.5, top: 47, slope: 10 }, head: { rx: 12.5, ry: 16, cy: 27, jawY: 35, jawRx: 10, jawRy: 10.5 }, ear: [18, 30, 2.4, 3.6],
  hair: 'crop', eyes: 'normal', mouth: 'flat', brow: { r0: 1.2, r1: 1, tilt: 0.6 },
  front(k) { const { cv, m, r } = k; for (const s of [-1, 1]) { const m2 = m().ellipse(32 + s * 8, 27, 6, 5.2).cut(m().ellipse(32 + s * 8, 27, 4.2, 3.6)); cv.part(m2, { ramp: r('trimHi', 'trim', 'trimSh'), bevel: 1, inner: 'line', shadow: false }); } cv.line(28, 27, 36, 27, (X, Y) => cv.px(X, Y, k.c('trim'))); },
});
export const verityPortrait = portrait({
  bg(k) { const { cv, m, c, r } = k; cv.part(m().rect(0, 0, 64, 60), { ramp: r('topDk', 'topDk', 'topDk'), bevel: 1, shadow: false, inner: 'none' }); cv.line(32, 0, 32, 10, (X, Y) => cv.px(X, Y, c('gold'))); cv.line(16, 10, 48, 10, (X, Y) => cv.px(X, Y, c('gold'))); for (const s of [-1, 1]) cv.line(32 + s * 16, 10, 32 + s * 16, 16, (X, Y) => cv.px(X, Y, c('gold'))); },
  top: { neck: 6.5, top: 47, slope: 10 }, head: { rx: 12.5, ry: 16, cy: 27, jawY: 35, jawRx: 10.5, jawRy: 10.5 }, ear: [18, 30, 2.4, 3.6],
  hair: 'bun', eyes: 'narrow', mouth: 'flat', brow: { r0: 1.2, r1: 1, tilt: 0.6 },
  body(k) { const { cv, m, r } = k; cv.part(m().poly([[22, 47], [42, 47], [38, 60], [26, 60]]), { ramp: r('trimHi', 'trim', 'trimSh'), bevel: 2, inner: 'line', shadow: false }); },
  front(k) { const { cv, m, r } = k; cv.part(m().rect(17, 24, 30, 6), { ramp: r('blind', 'blind', 'blind'), bevel: 1, inner: 'line', shadow: false }); },
});
export const rhoPortrait = portrait({
  bg(k) { rays(k, 'ray'); },
  top: { neck: 8, top: 46, slope: 12 }, head: { rx: 13.5, ry: 16, cy: 27, jawY: 34, jawRx: 11.5, jawRy: 10.5 }, ear: [18, 30, 2.4, 3.6],
  hair: 'wild', eyes: 'normal', mouth: 'smile', brow: { r0: 1.4, r1: 1.2, tilt: 1 },
  body(k) { const { cv, m, r, c } = k; cv.part(m().ellipse(32, 56, 5, 4), { ramp: [c('ray'), c('sun'), c('trimSh')], bevel: 2, inner: 'line', shadow: false }); void r; },
  front(k) { const { cv, m, r } = k; cv.part(m().ellipse(32, 5, 11, 2.6).cut(m().ellipse(32, 5, 8.4, 1.4)), { ramp: r('ray', 'trimHi', 'trim'), bevel: 1, inner: 'line', shadow: false }); },
});
export const halcyonPortrait = portrait({
  bg(k) { rays(k, 'ray'); const { cv, m, r } = k; cv.part(m().ellipse(32, 30, 22, 22), { ramp: r('ray', 'ray', 'ray'), bevel: 1, shadow: false, inner: 'none' }); },
  behind(k) { const { cv, m, r } = k; cv.part(m().poly([[12, 26], [52, 26], [58, 60], [6, 60]]), { ramp: r('hairHi', 'hair', 'hairDk'), bevel: 6, inner: 'line' }); },
  top: { neck: 7, top: 47, slope: 13 }, head: { rx: 13, ry: 16, cy: 28, jawY: 35, jawRx: 10.5, jawRy: 10.5 }, ear: null,
  hair: 'none', eyes: 'narrow', mouth: 'flat', brow: { r0: 1.2, r1: 1, tilt: 1.4 },
  body(k) { const { cv, m, r, c } = k; cv.part(m().ellipse(32, 56, 5, 4), { ramp: [c('ray'), c('sun'), c('trimSh')], bevel: 2, inner: 'line', shadow: false }); void r; },
  front(k) { const { cv, m, r } = k; cv.part(m().rect(18, 17, 28, 3), { ramp: r('trimHi', 'trim', 'trimSh'), bevel: 1, inner: 'line', shadow: false }); for (let i = -3; i <= 3; i++) cv.part(m().poly([[32 + i * 4 - 2, 17], [32 + i * 5, 6 - (3 - Math.abs(i))], [32 + i * 4 + 2, 17]]), { ramp: r('trimHi', 'trim', 'trimSh'), bevel: 1, inner: 'line', shadow: false }); },
});
