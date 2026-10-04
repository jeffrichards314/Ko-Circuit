// Intro-card portraits: DJ Drop, Admiral Anchor, the Gemini Twins, Count Midnight.
import { setup, mirror, bust, earsP, headP, eyesP, browsP, noseP, mouthP, stubbleP } from './kit.js';

export function djdropPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  bust(k, skin, skin, { neck: 9, top: 46, slope: 12 });
  // open purple track top + gold chain + vinyl medallion
  cv.part(m().poly([[0, 60], [2, 52], [16, 46], [24, 60]]).poly([[64, 60], [62, 52], [48, 46], [40, 60]]), { ramp: r('topHi', 'top', 'topDk', 'outline'), bevel: 4, inner: 'line' });
  cv.line(22, 47, 32, 56, (x, y) => cv.px(x, y, c((x + y) & 1 ? 'gold' : 'goldHi')));
  cv.line(42, 47, 32, 56, (x, y) => cv.px(x, y, c((x + y) & 1 ? 'gold' : 'goldHi')));
  cv.part(m().ellipse(32, 58, 4.5, 4.5), { ramp: r('blackHi', 'vinyl', 'vinyl'), bevel: 2, inner: 'line' });
  cv.flat(m().ellipse(32, 58, 1.5, 1.5), c('label'));
  earsP(k, skin, 16, 30, 3.4, 5);
  headP(k, skin, { rx: 15, ry: 16.5, cy: 27, jawY: 35, jawRx: 13.5, jawRy: 12 });
  // backwards cap
  const cap = m().ellipse(32, 17, 17, 10).cut(m().rect(0, 20, 64, 40));
  cv.part(cap, { ramp: r('topHi', 'top', 'topDk', 'outline'), bevel: 5 });
  cv.line(27, 18, 37, 18, (x, y) => cv.px(x, y, c('topDk')));
  cv.px(32, 16, c('goldHi'));
  // shades
  cv.flat(m().rect(19, 25, 12, 6).rect(33, 25, 12, 6).rect(31, 26, 2, 1), c('black'), true);
  cv.px(21, 26, c('lensHi')); cv.px(22, 26, c('lensHi')); cv.px(35, 26, c('lensHi'));
  browsP(k, r('hairHi', 'hair', 'outline'), { y: 22, r0: 1.4, r1: 1.2, tilt: 1 });
  noseP(k, skin, { y: 34, rx: 4.4, ry: 3.4 });
  mouthP(k, { y: 42, x0: 27, x1: 37, kind: 'grin' });
  cv.part(m().rect(30, 45, 4, 4), { ramp: r('hairHi', 'hair', 'outline'), bevel: 1, inner: 'line', shadow: false });
  // headphones
  cv.part(m().ellipse(32, 20, 20, 16).cut(m().ellipse(32, 20, 17.5, 13.6)).cut(m().rect(0, 22, 64, 40)), { ramp: r('gloveHi', 'glove', 'gloveDk'), bevel: 1, inner: 'line' });
  for (const x of [12, 52]) { cv.part(m().ellipse(x, 29, 5, 7), { ramp: r('gloveHi', 'glove', 'gloveDk'), bevel: 3 }); cv.flat(m().ellipse(x, 29, 1.5, 3), c('black')); }
  return cv.toSprite(0, 0, false);
}

export function anchorPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  bust(k, r('stripeHi', 'stripe', 'stripeSh', 'navyDk'), skin, { neck: 11, top: 45, slope: 14 });
  for (const y of [49, 54, 59]) for (let x = 0; x < 64; x++) if (!m().ellipse(32, 45, 10, 5).in(x, y) && x > 1 && x < 63) { cv.px(x, y, c('navy')); cv.px(x, y + 1, c('navyDk')); }
  earsP(k, skin, 14, 30, 3.8, 5.5);
  headP(k, skin, { rx: 16.5, ry: 17, cy: 27, jawY: 34, jawRx: 16.5, jawRy: 12 });
  // big white beard
  const bd = m().ellipse(32, 40, 19, 13).cut(m().rect(0, 0, 64, 33)).rect(14, 26, 5, 12).rect(45, 26, 5, 12);
  cv.part(bd, { ramp: hair, bevel: 5, inner: 'line' });
  for (const [x, y] of [[20, 40], [26, 46], [32, 49], [38, 46], [44, 40], [23, 44], [41, 44]]) { cv.shade(x, y, 1); cv.shade(x + 1, y - 1, -1); }
  cv.flat(m().ellipse(22, 33, 2.6, 1.6).ellipse(42, 33, 2.6, 1.6), c('ruddy'));
  eyesP(k, { y: 26, x0: 22, x1: 27, style: 'narrow' });
  browsP(k, hair, { y: 22, r0: 2.6, r1: 2.2, tilt: -0.5 });
  noseP(k, r('skinHi', 'ruddy', 'skinSh', 'skinDk'), { y: 32, rx: 5, ry: 4 });
  cv.part(m().ellipse(26, 38, 6.5, 2.4, 1, -0.2).ellipse(mirror(26), 38, 6.5, 2.4, 1, 0.2), { ramp: hair, bevel: 2, inner: 'line' });
  // officer's cap
  cv.part(m().ellipse(32, 9, 22, 7).rect(12, 9, 40, 7), { ramp: r('white', 'hairHi', 'hair', 'hairDk'), bevel: 4 });
  cv.part(m().rect(12, 13, 40, 4), { ramp: r('goldHi', 'gold', 'goldDk'), bevel: 1, inner: 'line', shadow: false });
  cv.part(m().ellipse(32, 19, 18, 3).cut(m().rect(0, 0, 64, 17)), { ramp: r('bootHi', 'brim', 'brim'), bevel: 1, inner: 'line' });
  cv.stamp(['.g.', 'ggg', '.g.', 'g.g', '.g.'], 31, 5, { g: c('goldHi') });
  return cv.toSprite(0, 0, false);
}

// The twins share one card: the brother behind is the same face, in shadow.
export function geminiPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'outline');
  const head = (ox, shadow) => {
    const s = shadow ? r('skinSh', 'skinSh', 'skinDk', 'outline') : skin;
    const h2 = shadow ? r('hair', 'hair', 'outline') : hair;
    cv.part(m().ellipse(32 + ox - 16.5, 29, 3.2, 5).ellipse(32 + ox + 16.5, 29, 3.2, 5), { ramp: s, bevel: 3 });
    const hm = m().ellipse(32 + ox, 26, 15, 17).ellipse(32 + ox, 34, 14, 12);
    cv.part(hm, { ramp: s, bevel: 9 });
    const hr = m().ellipse(32 + ox, 16, 16, 9).cut(m().rect(0, 19, 64, 40)).ellipse(32 + ox, 5, 5, 4);
    cv.part(hr, { ramp: h2, bevel: 3, inner: 'line' });
    cv.part(m().rect(17 + ox, 17, 31, 4).clip(m().ellipse(32 + ox, 26, 16, 18)), { ramp: shadow ? r('teamDk', 'teamDk', 'outline') : r('teamHi', 'team', 'teamDk'), bevel: 1, inner: 'line', shadow: false });
    for (const dx of [-1, 1]) for (let y = 17; y < 21; y++) cv.px(32 + ox + dx, y, c(shadow ? 'trim' : 'trimHi'));
    return hm;
  };
  head(14, true);
  bust(k, r('teamHi', 'team', 'teamDk', 'outline'), skin, { neck: 8, top: 46, slope: 10 });
  cv.part(m().ellipse(32, 46, 9, 5), { ramp: skin, bevel: 3, shadow: false });
  cv.stamp(['..w..', '.www.', 'wwwww', '.www.', '.w.w.'], 30, 53, { w: c('white') });
  head(-2, false);
  const X = (x) => x - 2;
  eyesP({ ...k, cv: { ...cv, px: (x, y, v) => cv.px(X(x), y, v), shade: (x, y, n) => cv.shade(X(x), y, n) } }, { y: 26, x0: 22, x1: 27 });
  browsP({ ...k, m: () => m() }, hair, { y: 22, x0: 17.5, x1: 26, r0: 1.6, r1: 1.4, tilt: 1 });
  cv.part(m().ellipse(30, 33, 3.8, 3.2).rect(28, 26, 4, 6), { ramp: skin, bevel: 3, inner: 'soft' });
  mouthP({ ...k, cv: { ...cv, px: (x, y, v) => cv.px(X(x), y, v), shade: (x, y, n) => cv.shade(X(x), y, n) } }, { y: 41, x0: 28, x1: 36, kind: 'smile' });
  return cv.toSprite(0, 0, false);
}

export function midnightPortrait(pal) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'outline');
  // towering collar behind the head
  cv.part(m().poly([[0, 60], [0, 30], [8, 4], [18, 20], [32, 14], [46, 20], [56, 4], [64, 30], [64, 60]]), { ramp: r('blackHi', 'black', 'blackDk', 'outline'), bevel: 4 });
  cv.part(m().poly([[4, 60], [4, 32], [10, 10], [19, 24], [32, 18], [45, 24], [54, 10], [60, 32], [60, 60]]), { ramp: r('violetHi', 'violet', 'violetDk'), bevel: 5, inner: 'soft', shadow: false });
  bust(k, r('blackHi', 'black', 'blackDk', 'outline'), skin, { neck: 7, top: 47, slope: 8 });
  cv.part(m().poly([[22, 47], [42, 47], [32, 60]]), { ramp: skin, bevel: 3, shadow: false });
  cv.part(m().ellipse(32, 50, 3, 3).cut(m().ellipse(33.5, 49, 2.4, 2.4)), { ramp: r('silverHi', 'silver', 'silverDk'), bevel: 1, inner: 'line', shadow: false });
  // pointed ears
  cv.part(m().poly([[18, 26], [9, 14], [19, 36]]).poly([[46, 26], [55, 14], [45, 36]]), { ramp: skin, bevel: 2 });
  headP(k, skin, { rx: 14, ry: 17, cy: 27, jawY: 36, jawRx: 11.5, jawRy: 11.5 });
  for (const s of [1, -1]) for (let y = 33; y < 38; y++) cv.shade(s > 0 ? 22 : mirror(22), y, 1);
  // widow's peak
  const hr = m().ellipse(32, 17, 15, 9).cut(m().rect(0, 19, 64, 40)).poly([[27, 18], [37, 18], [32, 25]]).clip(m().ellipse(32, 26, 15, 18));
  cv.part(hr, { ramp: hair, bevel: 3, inner: 'line' });
  eyesP(k, { y: 27, x0: 22, x1: 27, style: 'narrow' });
  for (const s of [1, -1]) { cv.px(s > 0 ? 25 : mirror(25), 28, c('iris')); cv.px(s > 0 ? 24 : mirror(24), 28, c('iris')); }
  cv.part(m().capsule(19, 24, 24, 20, 1.1, 1).capsule(24, 20, 29, 24, 1, 1).capsule(mirror(19), 24, mirror(24), 20, 1.1, 1).capsule(mirror(24), 20, mirror(29), 24, 1, 1), { ramp: hair, bevel: 1, inner: 'soft' });
  noseP(k, skin, { y: 34, rx: 3, ry: 3.2 });
  mouthP(k, { y: 42, x0: 27, x1: 37, kind: 'smile', inside: 'mouth' });
  for (const x of [29, 34]) { cv.px(x, 42, c('white')); cv.px(x, 43, c('white')); }
  return cv.toSprite(0, 0, false);
}
