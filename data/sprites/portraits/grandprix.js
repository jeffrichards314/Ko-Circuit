// Intro-card portraits: Nova Reyes, Goliath Gunn, Quickdraw Quinn, The Monk,
// King Karver, and the Dream Fight: "Thunder" Jax Crane.
import { setup, mirror, bust, earsP, headP, eyesP, browsP, noseP, mouthP, stubbleP } from './kit.js';

export function novaPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'outline');
  // speed lines streaming off behind her
  for (const [y, len] of [[14, 12], [22, 16], [34, 10], [44, 14]]) for (let i = 0; i < len; i++) if (i % 3 !== 2) cv.px(52 + i * 0.8, y + (i >> 2), c('suitHi'));
  bust(k, r('suitHi', 'suit', 'suitDk', 'outline'), skin, { neck: 7, top: 47, slope: 9 });
  cv.part(m().rect(26, 44, 12, 5), { ramp: r('suitHi', 'suit', 'suitDk', 'outline'), bevel: 1, inner: 'line' });
  for (const s of [1, -1]) cv.line(s > 0 ? 8 : 55, 54, s > 0 ? 22 : 41, 50, (X, Y) => { cv.px(X, Y, c('chev')); cv.px(X, Y + 1, c('chevDk')); });
  earsP(k, skin, 19, 31, 2.4, 3.6);
  headP(k, skin, { rx: 13, ry: 16, cy: 28, jawY: 35, jawRx: 10.5, jawRy: 10 });
  // hair swept straight back, trailing points
  const hr = m().ellipse(33, 17, 14.5, 8).cut(m().rect(0, 20, 64, 40));
  hr.poly([[40, 12], [58, 10], [44, 18]]).poly([[42, 18], [60, 20], [45, 22]]);
  cv.part(hr, { ramp: hair, bevel: 2, inner: 'line' });
  for (let i = 0; i < 9; i++) cv.px(36 + i, 11 + (i >> 1), c('streak'));
  // goggles up on the forehead
  cv.part(m().ellipse(26, 18, 3.6, 2.2).ellipse(38, 18, 3.6, 2.2), { ramp: r('visorHi', 'visor', 'outline'), bevel: 1, inner: 'line', shadow: false });
  cv.px(25, 17, c('white')); cv.px(37, 17, c('white'));
  eyesP(k, { y: 27, x0: 22, x1: 28, style: 'normal' });
  for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); cv.px(X(21), 26, c('lash')); cv.px(X(20), 25, c('lash')); }
  browsP(k, hair, { y: 23, r0: 1.1, r1: 0.9, tilt: 1.5 });
  noseP(k, skin, { y: 34, rx: 2.6, ry: 2.4 });
  mouthP(k, { y: 41, x0: 28, x1: 36, kind: 'grin' });
  return cv.toSprite(0, 0, false);
}

export function goliathPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  // so big the card can't hold him: shoulders off the edges, head at the top
  bust(k, r('oliveHi', 'olive', 'oliveDk', 'outline'), skin, { neck: 16, top: 40, slope: 22 });
  cv.part(m().ellipse(32, 42, 15, 8).cut(m().rect(0, 0, 64, 40)), { ramp: skin, bevel: 3, inner: 'line' });
  for (let x = 20; x <= 44; x += 2) cv.px(x, 44 + Math.round((1 - ((x - 32) / 12) ** 2) * 8), c('tag'));
  cv.part(m().rect(29, 52, 5, 7).rect(33, 53, 5, 7), { ramp: r('tag', 'tag', 'tagDk'), bevel: 1, inner: 'line', shadow: false });
  earsP(k, skin, 12, 27, 3.6, 5.2);
  const hm = headP(k, skin, { rx: 18, ry: 17, cy: 23, jawY: 32, jawRx: 18, jawRy: 12 });
  // buzz cut
  for (let y = 5; y < 15; y++) for (let x = 14; x < 50; x++) if (hm.in(x, y)) cv.px(x, y, c((x + y) & 1 ? 'hair' : 'hairHi'));
  eyesP(k, { y: 22, x0: 20, x1: 27, style: 'narrow' });
  browsP(k, r('hairHi', 'hair', 'outline'), { y: 19, r0: 2.4, r1: 2, tilt: 1.5 });
  for (let i = 0; i < 6; i++) cv.px(21 + (i >> 1), 16 + i, c('scar'));
  noseP(k, skin, { y: 29, rx: 4.6, ry: 3.6 });
  mouthP(k, { y: 37, x0: 25, x1: 39, kind: 'flat' });
  cv.shade(32, 42, 1); cv.shade(32, 43, 1); // cleft chin
  return cv.toSprite(0, 0, false);
}

export function quinnPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'outline');
  bust(k, skin, skin, { neck: 9, top: 46, slope: 12 });
  // leather vest panels and the bandana
  cv.part(m().poly([[0, 60], [4, 52], [18, 46], [24, 60]]).poly([[64, 60], [60, 52], [46, 46], [40, 60]]), { ramp: r('vestHi', 'vest', 'vestDk', 'outline'), bevel: 2, inner: 'line' });
  cv.part(m().poly([[22, 44], [42, 44], [33, 56]]), { ramp: r('band', 'band', 'bandDk'), bevel: 1, inner: 'line' });
  for (const [x, y] of [[27, 46], [33, 48], [30, 50]]) cv.px(x, y, c('white'));
  earsP(k, skin, 17, 32, 3, 4.4);
  const hm = headP(k, skin, { rx: 14.5, ry: 16, cy: 29, jawY: 36, jawRx: 13.5, jawRy: 11 });
  cv.part(m().rect(17, 24, 3, 12).rect(44, 24, 3, 12), { ramp: hair, bevel: 1, inner: 'line', shadow: false });
  // the squint
  eyesP(k, { y: 29, x0: 22, x1: 28, style: 'narrow' });
  browsP(k, hair, { y: 26, r0: 1.6, r1: 1.3, tilt: 1.8 });
  noseP(k, skin, { y: 35, rx: 3.2, ry: 3 });
  stubbleP(k, hm, 38, 48, 1);
  cv.part(m().ellipse(32, 40, 8, 2).rect(24, 40, 3, 8).rect(37, 40, 3, 8), { ramp: hair, bevel: 1, inner: 'line' });
  for (let x = 29; x <= 35; x++) cv.px(x, 43, c('mouth'));
  // the ten-gallon hat
  cv.part(m().ellipse(32, 16, 30, 4.4), { ramp: r('hatHi', 'hat', 'hatDk'), bevel: 2, inner: 'line' });
  cv.part(m().ellipse(32, 9, 14, 8).rect(18, 8, 28, 6).cut(m().ellipse(32, 1, 4, 3)).cut(m().rect(0, 15, 64, 50)), { ramp: r('hatHi', 'hat', 'hatDk'), bevel: 4, inner: 'line' });
  for (let x = 19; x < 46; x++) cv.px(x, 13, c((x & 1) ? 'band' : 'bandDk'));
  for (let x = 4; x < 60; x++) if (cv.filled(x, 18)) cv.shade(x, 18, 1);
  return cv.toSprite(0, 0, false);
}

export function monkPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  bust(k, skin, skin, { neck: 8, top: 46, slope: 11 });
  // robe over one shoulder, beads
  cv.part(m().poly([[0, 60], [0, 50], [14, 44], [44, 60]]), { ramp: r('robeHi', 'robe', 'robeDk', 'outline'), bevel: 3, inner: 'line' });
  for (let x = 18; x <= 46; x += 3) cv.part(m().ellipse(x, 47 + Math.round((1 - ((x - 32) / 14) ** 2) * 9), 1.4, 1.4), { ramp: r('beadHi', 'bead', 'outline'), bevel: 1, inner: 'line', shadow: false });
  // long earlobes
  cv.part(m().ellipse(18, 30, 3, 5).ellipse(18, 37, 2.2, 3.2).ellipse(46, 30, 3, 5).ellipse(46, 37, 2.2, 3.2), { ramp: skin, bevel: 2 });
  const hm = headP(k, skin, { rx: 14, ry: 17, cy: 26, jawY: 34, jawRx: 12, jawRy: 11 });
  for (let y = 9; y < 20; y++) for (let x = 18; x < 47; x++) if (hm.in(x, y) && (x + y) % 3 === 0) cv.shade(x, y, 1);
  cv.px(25, 12, c('white')); cv.px(26, 11, c('skinHi'));
  // eyes closed: calm arcs
  for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); cv.px(X(22), 27, c('outline')); for (let x = 23; x <= 26; x++) cv.px(X(x), 28, c('outline')); cv.px(X(27), 27, c('outline')); for (let x = 23; x <= 26; x++) cv.shade(X(x), 29, 1); }
  browsP(k, r('hairHi', 'hair', 'outline'), { y: 23, r0: 1, r1: 0.8, tilt: 0 });
  noseP(k, skin, { y: 33, rx: 3, ry: 2.8 });
  for (let x = 29; x <= 35; x++) cv.px(x, 40 - (x === 29 || x === 35 ? 1 : 0), c('mouth'));
  return cv.toSprite(0, 0, false);
}

export function karverPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  // crimson cape, ermine collar
  bust(k, r('capeHi', 'cape', 'capeDk', 'outline'), skin, { neck: 12, top: 44, slope: 16 });
  cv.part(m().ellipse(10, 48, 12, 5).ellipse(54, 48, 12, 5), { ramp: r('ermine', 'ermine', 'ermineSh'), bevel: 2, inner: 'line' });
  for (const [x, y] of [[6, 47], [12, 49], [16, 46], [48, 46], [52, 49], [58, 47]]) cv.px(x, y, c('outline'));
  cv.part(m().ellipse(32, 26, 19, 18), { ramp: hair, bevel: 5, inner: 'line' });
  earsP(k, skin, 15, 30, 3.2, 4.8);
  headP(k, skin, { rx: 15.5, ry: 16.5, cy: 27, jawY: 34, jawRx: 15, jawRy: 11.5 });
  // the crown
  const cr = m().rect(17, 11, 30, 5);
  for (const x of [19, 25.5, 32, 38.5, 45]) cr.poly([[x - 3, 12], [x, 4 - (x === 32 ? 3 : 0)], [x + 3, 12]]);
  cv.part(cr, { ramp: r('gloveHi', 'glove', 'gloveDk'), bevel: 2, inner: 'line' });
  cv.px(32, 13, c('ruby')); cv.px(33, 13, c('ruby')); cv.px(32, 12, c('ruby'));
  eyesP(k, { y: 26, x0: 21, x1: 27, style: 'narrow' });
  browsP(k, hair, { y: 22, r0: 2.2, r1: 1.8, tilt: 1.6 });
  for (let i = 0; i < 4; i++) cv.px(42 + i, 20 + i, c('skinDk')); // old scar
  noseP(k, skin, { y: 32, rx: 4, ry: 3.4 });
  // salt-and-pepper beard
  const bd = m().ellipse(32, 44, 16, 11).cut(m().rect(0, 20, 64, 18)).rect(16, 30, 4, 10).rect(44, 30, 4, 10);
  cv.part(bd, { ramp: hair, bevel: 4, inner: 'line' });
  for (let y = 38; y < 56; y++) for (let x = 16; x < 48; x++) if (bd.in(x, y) && (x + y) % 3 === 0) cv.px(x, y, c('hairHi'));
  cv.part(m().ellipse(26, 38, 7, 2.6, 1, -0.2).ellipse(mirror(26), 38, 7, 2.6, 1, 0.2), { ramp: hair, bevel: 2, inner: 'line' });
  for (let x = 29; x <= 35; x++) cv.px(x, 42, c('mouth'));
  return cv.toSprite(0, 0, false);
}

export function jaxPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'outline');
  // crackling behind him
  for (const pts of [[[4, 6], [9, 14], [6, 16], [11, 26]], [[58, 4], [53, 12], [57, 14], [51, 24]]]) for (let i = 0; i + 1 < pts.length; i++) cv.line(...pts[i], ...pts[i + 1], (X, Y) => cv.px(X, Y, c(i & 1 ? 'spark' : 'sparkHi')));
  bust(k, skin, skin, { neck: 10, top: 45, slope: 13 });
  for (const s of [1, -1]) cv.line(s > 0 ? 18 : 45, 54, s > 0 ? 29 : 34, 57, (X, Y) => cv.shade(X, Y, 1));
  earsP(k, skin, 17, 30, 2.8, 4.4);
  const hm = headP(k, skin, { rx: 14.5, ry: 16.5, cy: 27, jawY: 35, jawRx: 12, jawRy: 11 });
  // sharp fade with a bolt shaved in
  cv.part(m().ellipse(32, 15, 15, 8).cut(m().rect(0, 19, 64, 40)), { ramp: hair, bevel: 2, inner: 'line' });
  for (let y = 19; y < 26; y++) for (const x of [17, 18, 19, 45, 46, 47]) if (hm.in(x, y) && (x + y) & 1) cv.px(x, y, c('hair'));
  for (const [x, y] of [[42, 12], [43, 13], [42, 14], [43, 15], [44, 16]]) cv.px(x, y, c('skinSh'));
  eyesP(k, { y: 26, x0: 22, x1: 28, style: 'narrow' });
  browsP(k, hair, { y: 22, r0: 1.8, r1: 1.4, tilt: 1.8 });
  noseP(k, skin, { y: 33, rx: 3.2, ry: 3 });
  mouthP(k, { y: 41, x0: 28, x1: 36, kind: 'flat' });
  cv.shade(20, 33, 1); cv.shade(43, 33, 1);
  return cv.toSprite(0, 0, false);
}
