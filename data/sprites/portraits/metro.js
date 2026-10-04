// Intro-card portraits: Rush Hour Ray, Pidge, Skyline Sam, Mayor McBride.
import { setup, mirror, bust, earsP, headP, eyesP, browsP, noseP, mouthP, stubbleP } from './kit.js';

export function rayPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'outline');
  bust(k, r('shirtHi', 'shirt', 'shirtSh', 'slackDk'), skin, { neck: 8, top: 46, slope: 10 });
  // open collar + a loosened tie
  cv.part(m().poly([[22, 45], [31, 52], [25, 55]]).poly([[42, 45], [33, 52], [39, 55]]), { ramp: r('shirtHi', 'shirt', 'shirtSh'), bevel: 1, bias: 0.3, inner: 'line' });
  cv.part(m().poly([[30, 50], [35, 50], [34, 53], [37, 60], [31, 60], [32, 53]]), { ramp: r('tieHi', 'tie', 'outline'), bevel: 1, inner: 'line' });
  for (const [x, y] of [[33, 54], [34, 56], [33, 58], [35, 58]]) cv.px(x, y, c('tieStripe'));
  earsP(k, skin, 16, 32, 3.4, 5);
  const hm = headP(k, skin, { rx: 15.5, ry: 16.5, cy: 29, jawY: 36, jawRx: 15.5, jawRy: 11.5 });
  stubbleP(k, hm, 38, 50, 1);
  // side part
  const hr = m().ellipse(32, 20, 16.5, 9).cut(m().rect(0, 22, 64, 40)).rect(16, 20, 3, 8).rect(45, 20, 3, 7);
  hr.poly([[34, 19], [45, 19], [40, 24]]);
  cv.part(hr, { ramp: hair, bevel: 3, inner: 'line' });
  cv.line(26, 12, 27, 20, (x, y) => cv.shade(x, y, 1));
  cv.px(22, 14, c('hairHi')); cv.px(23, 13, c('hairHi'));
  eyesP(k, { y: 28, x0: 21, x1: 27, style: 'heavy' });
  for (const s of [1, -1]) for (let x = 22; x <= 27; x++) { cv.shade(s > 0 ? x : mirror(x), 32, 1); }
  browsP(k, hair, { y: 25, r0: 1.6, r1: 1.4, tilt: -1.5 });
  noseP(k, skin, { y: 35, rx: 3.8, ry: 3.4 });
  mouthP(k, { y: 44, x0: 28, x1: 36, kind: 'flat' });
  cv.px(27, 45, c('outline')); cv.px(37, 45, c('outline'));
  // headband + the traffic light
  for (let x = 17; x < 47; x++) if (hr.in(x, 16)) cv.px(x, 16, c('metalDk'));
  cv.part(m().rect(31, 7, 3, 6), { ramp: r('white', 'metal', 'metalDk'), bevel: 1, inner: 'line', shadow: false });
  cv.part(m().rect(27, -8, 11, 17), { ramp: r('housing', 'housing', 'housingDk', 'outline'), bevel: 2 });
  for (const [y, k2] of [[-4, 'lampR'], [1, 'lampY'], [6, 'lampG']]) { cv.flat(m().rect(30, y - 1, 5, 3).rect(31, y - 2, 3, 5), c(k2)); cv.px(31, y - 1, c('white')); cv.line(30, y - 3, 34, y - 3, (X, Y) => cv.px(X, Y, c('outline'))); }
  // wristwatch glove raised
  const g = m().ellipse(8, 50, 9, 10.5, 1, -0.3).capsule(12, 60, 16, 60, 5, 5);
  cv.part(g, { ramp: r('gloveHi', 'glove', 'gloveDk'), bevel: 7 });
  cv.part(m().ellipse(15, 49, 3.5, 5.5, 1, -0.3), { ramp: r('gloveHi', 'glove', 'gloveDk'), bevel: 2, inner: 'line', shadow: false });
  return cv.toSprite(0, 0, false);
}

export function pidgePortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  bust(k, r('jacketHi', 'jacket', 'jacketSh', 'outline'), skin, { neck: 7, top: 47, slope: 8 });
  cv.line(32, 52, 32, 60, (x, y) => cv.px(x, y, c('jacketSh')));
  // iridescent scarf
  const sc = m().ellipse(32, 48, 14, 5).poly([[33, 50], [42, 60], [37, 60]]);
  cv.part(sc, { ramp: r('sheenG', 'sheenG', 'sheenGd', 'sheenVd'), bevel: 3, inner: 'line' });
  for (let y = 44; y < 60; y++) for (let x = 18; x < 46; x++) if (sc.in(x, y) && (x + y) % 3 === 0 && y > 47) cv.px(x, y, c((x + y) % 2 ? 'sheenV' : 'sheenGd'));
  earsP(k, skin, 17, 31, 3, 4.6);
  headP(k, skin, { rx: 14, ry: 16.5, cy: 29, jawY: 37, jawRx: 11.5, jawRy: 10.5 });
  // beady orange eyes, set close
  for (const s of [1, -1]) {
    const X = (x) => (s > 0 ? x : mirror(x));
    cv.stamp(['.ooo.', 'owiio', 'oiioo', '.ooo.'].map((row) => (s > 0 ? row : [...row].reverse().join(''))), X(s > 0 ? 24 : 28), 27, { o: c('outline'), w: c('white'), i: c('iris') });
    cv.px(X(26), 29, c('outline'));
  }
  browsP(k, hair, { y: 24, x0: 22, x1: 28, r0: 1.3, r1: 1.1, tilt: 1 });
  // long pointed nose
  cv.part(m().capsule(32, 29, 32.5, 39, 2.2, 1.6).ellipse(32, 37, 3, 2.5), { ramp: skin, bevel: 2, inner: 'soft' });
  cv.px(30, 39, c('skinDk')); cv.px(34, 39, c('skinDk'));
  mouthP(k, { y: 44, x0: 29, x1: 35, kind: 'smile' });
  // tall pompadour with a white streak
  const hm = m().ellipse(32, 29, 14, 16.5);
  for (let y = 12; y < 24; y++) for (let x = 16; x < 48; x++) if (hm.in(x, y) && (x < 22 || x > 42) && (x + y) % 2 === 0) cv.shade(x, y, 2);
  const hr = m().ellipse(32, 16, 11, 5).cut(m().rect(0, 18, 64, 40)).ellipse(34, 8, 13, 8).ellipse(30, 14, 10, 4);
  cv.part(hr, { ramp: hair, bevel: 4, inner: 'line' });
  cv.line(20, 15, 42, 16, (x, y) => { if (hr.in(x, y)) cv.shade(x, y, 1); });
  cv.line(24, 3, 44, 9, (x, y) => { if (hr.in(x, y)) { cv.px(x, y, c('white')); cv.px(x, y + 1, c('hairHi')); } });
  return cv.toSprite(0, 0, false);
}

export function samPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  bust(k, r('teeHi', 'tee', 'teeSh', 'navyDk'), skin, { neck: 9, top: 45, slope: 12 });
  // harness straps + D-ring
  const st = m().capsule(20, 44, 24, 60, 2.6, 2.6).capsule(44, 44, 40, 60, 2.6, 2.6).rect(10, 54, 44, 4);
  cv.part(st, { ramp: r('strapHi', 'strap', 'strapDk'), bevel: 1, inner: 'line' });
  cv.part(m().ellipse(32, 56, 3, 3).cut(m().ellipse(32, 56, 1.4, 1.4)), { ramp: r('steelHi', 'steel', 'steelDk'), bevel: 1, inner: 'line', shadow: false });
  // hair at the back, over the ears
  cv.part(m().ellipse(32, 24, 19, 16).rect(13, 24, 38, 16), { ramp: hair, bevel: 5, inner: 'line' });
  earsP(k, skin, 15, 31, 3.4, 5);
  const hm = headP(k, skin, { rx: 15.5, ry: 16.5, cy: 28, jawY: 36, jawRx: 14.5, jawRy: 11.5 });
  cv.part(m().ellipse(32, 46, 5, 3.4), { ramp: skin, bevel: 3 }); // chin
  stubbleP(k, hm, 38, 50, 1);
  // shaggy fringe
  const fr = m().ellipse(32, 16, 17, 8).cut(m().rect(0, 19, 64, 40));
  for (let i = -4; i <= 4; i++) fr.poly([[32 + i * 4 - 2.5, 18], [32 + i * 4 + 2.5, 18], [32 + i * 4.3 + (i < 0 ? -1 : 1), 23 - (i & 1)]]);
  cv.part(fr, { ramp: hair, bevel: 4, inner: 'line' });
  // aviators up in the hair
  for (const s of [1, -1]) cv.flat(m().ellipse(s > 0 ? 25 : 39, 13, 5, 3), c('lens'), true);
  cv.line(30, 12, 34, 12, (x, y) => cv.px(x, y, c('steel')));
  cv.px(22, 12, c('white')); cv.px(36, 12, c('white'));
  eyesP(k, { y: 28, x0: 21, x1: 27, style: 'narrow' });
  browsP(k, hair, { y: 25, r0: 1.8, r1: 1.5, tilt: 1 });
  noseP(k, r('skinHi', 'burn', 'skinSh', 'skinDk'), { y: 35, rx: 4, ry: 3.4 });
  for (const s of [1, -1]) for (const [x, y] of [[20, 35], [21, 35], [22, 36]]) cv.px(s > 0 ? x : mirror(x), y, c('burn'));
  mouthP(k, { y: 43, x0: 27, x1: 37, kind: 'grin' });
  return cv.toSprite(0, 0, false);
}

export function mcbridePortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  bust(k, skin, skin, { neck: 12, top: 44, slope: 14 });
  // sash across the chest + rosette
  const sa = m().capsule(6, 46, 40, 62, 6, 6);
  cv.part(sa, { ramp: r('sashHi', 'sash', 'sashDk'), bevel: 2, inner: 'line' });
  cv.line(3, 41, 40, 57, (x, y) => { if (sa.in(x, y)) cv.px(x, y, c('gold')); });
  cv.line(8, 51, 40, 67, (x, y) => { if (sa.in(x, y)) cv.px(x, y, c('gold')); });
  cv.part(m().ellipse(48, 52, 5, 5), { ramp: r('goldHi', 'gold', 'goldDk'), bevel: 2, inner: 'line' });
  cv.flat(m().ellipse(48, 52, 2, 2), c('blue'));
  earsP(k, skin, 14, 30, 3.8, 5.5);
  const hm = headP(k, skin, { rx: 17, ry: 17, cy: 26, jawY: 35, jawRx: 18, jawRy: 12.5 });
  // silver side-parted wave + mutton chops
  const hr = m().ellipse(32, 16, 18, 9).ellipse(37, 11, 11, 6).cut(m().rect(0, 20, 64, 40));
  cv.part(hr, { ramp: hair, bevel: 4, inner: 'line' });
  cv.line(24, 9, 25, 19, (x, y) => cv.shade(x, y, 1));
  const mc = m().poly([[15, 21], [18, 22], [20, 33], [17, 33]]).poly([[49, 21], [46, 22], [44, 33], [47, 33]]).clip(hm);
  cv.part(mc, { ramp: hair, bevel: 1, inner: 'line', shadow: false });
  cv.flat(m().ellipse(22, 34, 2.6, 1.6).ellipse(42, 34, 2.6, 1.6), c('ruddy'));
  eyesP(k, { y: 25, x0: 22, x1: 28, style: 'normal' });
  browsP(k, hair, { y: 21, r0: 2.2, r1: 1.8, tilt: 0.5 });
  noseP(k, r('skinHi', 'ruddy', 'skinSh', 'skinDk'), { y: 32, rx: 4.6, ry: 3.8 });
  // the campaign grin
  cv.flat(m().rect(24, 40, 16, 4), c('mouth'), true);
  for (let x = 25; x < 39; x++) cv.px(x, 40, c('white'));
  for (let x = 25; x < 39; x += 2) cv.px(x, 41, c('white'));
  cv.px(23, 39, c('outline')); cv.px(40, 39, c('outline'));
  // twinkle on a tooth
  for (const [x, y] of [[29, 38], [28, 39], [30, 39], [29, 40]]) cv.px(x, y, c('white'));
  return cv.toSprite(0, 0, false);
}
