// Intro-card portraits: "Big Rig" Rusty, Tempest Tia, Doc Sutures, The Baron.
import { setup, mirror, bust, earsP, headP, eyesP, browsP, noseP, mouthP } from './kit.js';

export function rustyPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  const cap = r('capHi', 'cap', 'capDk');
  // white tank under an open green flannel vest
  bust(k, r('white', 'white', 'tankSh', 'chrome'), skin, { neck: 12, top: 44, slope: 14 });
  for (const s of [1, -1]) {
    const X = (x) => (s > 0 ? x : mirror(x));
    const v = m().poly([[X(0), 60], [X(2), 52], [X(12), 44], [X(22), 44], [X(24), 60]]);
    cv.part(v, { ramp: r('plaidHi', 'plaid', 'plaidDk', 'outline'), bevel: 3, inner: 'line' });
    for (let y = 44; y < 60; y++) for (let x = 0; x < 64; x++) if (v.in(x, y)) { if (y % 5 === 0) cv.shade(x, y, 1); if (x % 5 === 0) cv.shade(x, y, 1); if (x % 5 === 2 && y % 5 === 2) cv.px(x, y, c('capHi')); }
  }
  earsP(k, skin, 14, 30, 3.6, 5.4);
  headP(k, skin, { rx: 17, ry: 17, cy: 27, jawY: 34, jawRx: 17, jawRy: 12.5 });
  // big bushy ginger beard
  const bd = m().ellipse(32, 44, 19, 14).cut(m().rect(0, 20, 64, 17));
  bd.rect(14, 30, 5, 10).rect(45, 30, 5, 10);
  cv.part(bd, { ramp: hair, bevel: 5, inner: 'line' });
  for (const [x, y] of [[20, 44], [26, 50], [32, 54], [38, 50], [44, 44], [23, 40], [41, 40], [32, 47]]) { cv.shade(x, y, 1); cv.shade(x + 1, y - 1, -1); }
  eyesP(k, { y: 25, x0: 21, x1: 27, style: 'narrow' });
  browsP(k, hair, { y: 21, r0: 2.4, r1: 2, tilt: 1 });
  noseP(k, r('skinHi', 'ruddy', 'skinSh', 'skinDk'), { y: 32, rx: 5, ry: 4 });
  cv.flat(m().ellipse(20, 32, 3, 1.6).ellipse(44, 32, 3, 1.6), c('ruddy'));
  const mu = m().ellipse(26, 38, 7.5, 3, 1, -0.2).ellipse(mirror(26), 38, 7.5, 3, 1, 0.2);
  cv.part(mu, { ramp: hair, bevel: 2, inner: 'line' });
  for (let x = 29; x <= 35; x++) cv.px(x, 42, c('mouth'));
  // trucker cap: mesh-panel front with a chrome wheel, flat red bill
  const dome = m().ellipse(32, 12, 18, 11).cut(m().rect(0, 16, 64, 40));
  cv.part(dome, { ramp: cap, bevel: 6 });
  cv.part(m().ellipse(32, 11, 10, 9).cut(m().rect(0, 16, 64, 40)), { ramp: r('mesh', 'mesh', 'tankSh'), bevel: 2, inner: 'line', shadow: false });
  cv.stamp(['..cc..', '.c..c.', 'c.cc.c', '.c..c.', '..cc..'], 29, 6, { c: c('chrome') });
  cv.part(m().ellipse(32, 16.5, 22, 3.6).cut(m().rect(0, 0, 64, 16)), { ramp: cap, bevel: 1, bias: -0.3, inner: 'line' });
  return cv.toSprite(0, 0, false);
}

export function tiaPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'outline');
  // the braid over her shoulder
  cv.part(m().capsule(46, 22, 52, 56, 4, 3), { ramp: hair, bevel: 3, inner: 'line' });
  for (let y = 26; y < 56; y += 4) { cv.shade(48, y, -1); cv.px(50, y + 2, c('streak')); }
  // striped top with a red neckerchief
  bust(k, r('stripe', 'stripe', 'stripeSh', 'navy'), skin, { neck: 6.5, top: 48, slope: 8 });
  for (let y = 50; y < 60; y += 3) for (let x = 0; x < 64; x++) if (cv.filled(x, y) && (x < 22 || x > 42)) cv.px(x, y, c('navy'));
  cv.part(m().poly([[22, 47], [42, 47], [32, 58]]), { ramp: r('kerchief', 'kerchief', 'kerchiefDk'), bevel: 2, inner: 'line' });
  cv.part(m().ellipse(32, 48, 3, 2.2), { ramp: r('kerchief', 'kerchief', 'kerchiefDk'), bevel: 1, inner: 'line' });
  earsP(k, skin, 18, 30, 2.6, 4);
  headP(k, skin, { rx: 13.5, ry: 16, cy: 28, jawY: 36, jawRx: 11, jawRy: 11 });
  // hair pulled back, a storm-grey streak
  const hr = m().ellipse(32, 18, 14.6, 8.5).cut(m().rect(0, 21, 64, 40)).rect(18, 18, 2, 8).rect(44, 18, 2, 8);
  cv.part(hr, { ramp: hair, bevel: 3, inner: 'line' });
  for (let i = 0; i < 9; i++) { cv.px(24 + i, 11 + (i >> 1), c('streak')); cv.px(24 + i, 12 + (i >> 1), c('streak')); }
  eyesP(k, { y: 26, x0: 22, x1: 27, style: 'normal' });
  for (const s of [1, -1]) { cv.px(s > 0 ? 21 : mirror(21), 25, c('lash')); cv.px(s > 0 ? 20 : mirror(20), 24, c('lash')); }
  browsP(k, hair, { y: 22, r0: 1.1, r1: 0.9, tilt: 1.5 });
  noseP(k, skin, { y: 33, rx: 2.8, ry: 2.6 });
  mouthP(k, { y: 41, x0: 29, x1: 35, kind: 'smile', inside: 'mouth' });
  cv.px(17, 36, c('silver')); cv.px(mirror(17), 36, c('silver'));
  return cv.toSprite(0, 0, false);
}

export function suturesPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'outline');
  bust(k, r('smock', 'smock', 'smockSh', 'smockDk'), skin, { neck: 8.5, top: 45, slope: 12 });
  cv.part(m().poly([[26, 45], [38, 45], [32, 54]]), { ramp: skin, bevel: 2, inner: 'line', shadow: false });
  // stethoscope round the neck
  cv.part(m().capsule(21, 46, 23, 58, 1.4).capsule(43, 46, 42, 56, 1.4), { ramp: r('chrome', 'tube', 'outline'), bevel: 1, inner: 'line', shadow: false });
  cv.part(m().ellipse(23, 58, 3, 2.6), { ramp: r('chromeHi', 'chrome', 'outline'), bevel: 1, inner: 'line' });
  cv.stamp(['..x..', '..x..', 'xxxxx', '..x..', '..x..'], 46, 50, { x: c('cross') });
  earsP(k, skin, 15, 30, 3.6, 5.4);
  const hm = headP(k, skin, { rx: 16, ry: 17, cy: 26, jawY: 33, jawRx: 15.5, jawRy: 12 });
  cv.px(24, 12, c('white')); cv.px(25, 11, c('white')); cv.px(23, 13, c('skinHi'));
  cv.part(m().ellipse(17, 28, 3, 7).ellipse(mirror(17), 28, 3, 7).clip(hm), { ramp: hair, bevel: 1, inner: 'soft', shadow: false });
  eyesP(k, { y: 25, x0: 21, x1: 27, style: 'normal' });
  // round wire spectacles
  for (const s of [1, -1]) { const X = s > 0 ? 24 : mirror(24); for (let a = 0; a < 28; a++) { const t = (a / 28) * Math.PI * 2; cv.px(Math.round(X + Math.cos(t) * 5.5), Math.round(26.5 + Math.sin(t) * 4.5), c('chrome')); } cv.px(X - 3, 24, c('glass')); cv.px(X - 2, 23, c('glass')); }
  for (let x = 29; x <= 34; x++) cv.px(x, 25, c('chrome'));
  browsP(k, hair, { y: 19, r0: 1.8, r1: 1.4, tilt: 1 });
  noseP(k, skin, { y: 33, rx: 4, ry: 3.4 });
  cv.part(m().ellipse(27, 38.5, 5, 2).ellipse(mirror(27), 38.5, 5, 2), { ramp: hair, bevel: 1, inner: 'line' });
  mouthP(k, { y: 42, x0: 28, x1: 36, kind: 'smile' });
  // a strip of tape over one brow, a cutman's badge of office
  cv.part(m().rect(35, 16, 9, 4), { ramp: r('bandage', 'bandage', 'smockSh'), bevel: 1, inner: 'line', shadow: false });
  return cv.toSprite(0, 0, false);
}

export function baronPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  const jacket = r('jacket', 'jacket', 'jacketSh', 'jacketDk');
  bust(k, jacket, skin, { neck: 7, top: 47, slope: 10 });
  // high collar, diagonal closure, crest, sash
  cv.part(m().rect(24, 42, 16, 7), { ramp: jacket, bevel: 2, bias: 0.2, inner: 'line' });
  cv.line(38, 49, 22, 60, (x, y) => cv.px(x, y, c('jacketDk')));
  for (const [x, y] of [[35, 52], [31, 55], [27, 58]]) cv.px(x, y, c('gold'));
  cv.stamp(['.ggg.', 'gbbbg', 'gbgbg', '.gbg.', '..g..'], 44, 51, { g: c('gold'), b: c('crest') });
  earsP(k, skin, 17.5, 30, 2.8, 4.4);
  const hm = headP(k, skin, { rx: 14, ry: 17, cy: 27, jawY: 36, jawRx: 11.5, jawRy: 11 });
  // silver hair slicked straight back
  const hr = m().ellipse(32, 15, 15, 8.5).cut(m().rect(0, 18, 64, 40)).rect(17, 15, 2, 8).rect(45, 15, 2, 8);
  cv.part(hr, { ramp: hair, bevel: 3, inner: 'line' });
  for (const x of [24, 29, 34, 39]) cv.line(x, 8, x + (x < 32 ? -1 : 1), 17, (X, Y) => cv.shade(X, Y, 1));
  eyesP(k, { y: 26, x0: 21, x1: 27, style: 'narrow' });
  // monocle + chain
  const mx = mirror(24);
  for (let a = 0; a < 28; a++) { const t = (a / 28) * Math.PI * 2; cv.px(Math.round(mx + Math.cos(t) * 5), Math.round(27 + Math.sin(t) * 4.5), c('monocle')); }
  for (let y = 31; y < 46; y++) cv.px(mx + 4 + ((y >> 2) & 1), y, c(y % 2 ? 'gold' : 'goldHi'));
  browsP(k, hair, { y: 22, r0: 1.4, r1: 1.1, tilt: -1.5 });
  noseP(k, skin, { y: 34, rx: 3, ry: 3.4 });
  // waxed upturned moustache, pointed goatee
  const mu = m().ellipse(27, 39, 5, 1.8, 1, 0.15).ellipse(mirror(27), 39, 5, 1.8, 1, -0.15)
    .capsule(23, 39, 16, 33, 1.4, 0.8).capsule(mirror(23), 39, mirror(16), 33, 1.4, 0.8);
  cv.part(mu, { ramp: hair, bevel: 1, inner: 'line' });
  mouthP(k, { y: 43, x0: 29, x1: 35, kind: 'flat' });
  cv.part(m().poly([[29, 45], [35, 45], [32, 54]]).clip(hm.copy().add(m().rect(28, 44, 9, 11))), { ramp: hair, bevel: 1, inner: 'line' });
  return cv.toSprite(0, 0, false);
}
