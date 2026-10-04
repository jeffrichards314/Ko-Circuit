// Portrait kit: shared helpers for the 64x60 intro-card busts, so every
// portrait is built from the same parts and shading as Barney's.

import { Mask, SpriteCanvas } from '../../../src/engine/sprites.js';

export const PW = 64, PH = 60;
export const mirror = (x) => 63 - x;

export function setup(pal) {
  const cv = new SpriteCanvas(PW, PH, pal.idx('outline'));
  const m = () => new Mask(PW, PH);
  const c = (k) => pal.idx(k);
  const r = (...keys) => keys.map(c);
  return { cv, m, c, r };
}

// Shoulders + neck. w: shoulder half-width at the bottom, top: shoulder line y.
export function bust(k, ramp, skin, { neck = 9, top = 42, slope = 10 } = {}) {
  const { cv, m } = k;
  cv.part(m().poly([[0, 60], [2, top + 8], [32 - slope - 12, top], [32 + slope + 12, top], [62, top + 8], [64, 60]]), { ramp, bevel: 8 });
  const nk = m().capsule(32, 36, 32, top + 4, neck, neck + 0.5);
  cv.part(nk, { ramp: skin, bevel: 4, bias: -0.15 });
  return nk;
}

export function earsP(k, skin, x = 15, y = 30, rx = 3.6, ry = 5.5) {
  k.cv.part(k.m().ellipse(x, y, rx, ry).ellipse(mirror(x), y, rx, ry), { ramp: skin, bevel: 3 });
  k.cv.shade(x, y, 1); k.cv.shade(mirror(x), y, 1);
}

// Head: skull ellipse + jaw ellipse. Returns the mask.
export function headP(k, skin, { rx = 16, ry = 17, cy = 26, jawY = 33, jawRx = 16, jawRy = 12, bevel = 10 } = {}) {
  const hm = k.m().ellipse(32, cy, rx, ry).ellipse(32, jawY, jawRx, jawRy);
  k.cv.part(hm, { ramp: skin, bevel });
  return hm;
}

// Eyes at portrait scale. style: 'normal' | 'wide' | 'narrow' | 'heavy'
export function eyesP(k, { y = 25, x0 = 21, x1 = 27, style = 'normal', iris = null } = {}) {
  const { cv, c } = k;
  for (const s of [1, -1]) {
    const X = (x) => (s > 0 ? x : mirror(x));
    if (style === 'narrow') {
      for (let x = x0; x <= x1; x++) cv.px(X(x), y, c('outline'));
      for (let x = x0 + 1; x < x1; x++) cv.px(X(x), y + 1, c('white'));
      cv.px(X(x0 + 3), y + 1, c('outline')); cv.px(X(x0 + 4), y + 1, c('outline'));
      for (let x = x0; x <= x1; x++) cv.shade(X(x), y + 2, 1);
      continue;
    }
    for (let x = x0 + 1; x < x1; x++) cv.px(X(x), y, c('outline'));
    cv.px(X(x0), y + 1, c('outline')); cv.px(X(x1), y + 1, c('outline'));
    for (let x = x0 + 1; x < x1; x++) { cv.px(X(x), y + 1, c('white')); cv.px(X(x), y + 2, c('white')); }
    if (style === 'wide') for (let x = x0 + 1; x < x1; x++) cv.px(X(x), y + 3, c('white'));
    const px = x0 + Math.floor((x1 - x0) / 2);
    const pupil = iris ? c(iris) : c('outline');
    cv.px(X(px), y + 1, pupil); cv.px(X(px + 1), y + 1, pupil); cv.px(X(px), y + 2, pupil); cv.px(X(px + 1), y + 2, c('outline'));
    cv.px(X(px - 1), y + 1, c('white'));
    if (style === 'heavy') for (let x = x0 + 1; x < x1; x++) cv.px(X(x), y + 1, c('outline'));
    for (let x = x0 + 1; x < x1; x++) cv.shade(X(x), y + (style === 'wide' ? 4 : 3), 1);
  }
}

export function browsP(k, ramp, { y = 21, x0 = 19.5, x1 = 28, r0 = 2.2, r1 = 1.8, tilt = 0.5 } = {}) {
  k.cv.part(k.m().capsule(x0, y, x1, y + tilt, r0, r1).capsule(mirror(x0), y, mirror(x1), y + tilt, r0, r1), { ramp, bevel: 2, inner: 'soft' });
}

export function noseP(k, ramp, { y = 31, rx = 4.5, ry = 3.8, bridge = true } = {}) {
  const n = k.m().ellipse(32, y, rx, ry);
  if (bridge) n.rect(30, y - 7, 4, 6);
  k.cv.part(n, { ramp, bevel: 3, inner: 'soft' });
  k.cv.px(29, y + 2, k.c('skinDk')); k.cv.px(30, y + 2, k.c('skinDk'));
  k.cv.px(34, y + 2, k.c('skinDk')); k.cv.px(35, y + 2, k.c('skinDk'));
}

// Mouth line from x0..x1 at y; kind: 'flat' | 'smile' | 'grin' | 'open'
export function mouthP(k, { y = 42, x0 = 27, x1 = 37, kind = 'flat', teeth = 'white', inside = 'mouth' } = {}) {
  const { cv, c } = k;
  if (kind === 'open') {
    k.cv.flat(k.m().ellipse(32, y + 1, (x1 - x0) / 2, 3), c(inside), true);
    for (let x = x0 + 2; x <= x1 - 2; x++) cv.px(x, y - 1, c(teeth));
    return;
  }
  for (let x = x0; x <= x1; x++) cv.px(x, y, c(kind === 'flat' ? 'outline' : inside));
  if (kind === 'smile' || kind === 'grin') { cv.px(x0 - 1, y - 1, c('outline')); cv.px(x1 + 1, y - 1, c('outline')); }
  if (kind === 'grin') for (let x = x0 + 1; x < x1; x++) cv.px(x, y - 1, c(teeth));
  for (let x = x0 + 1; x < x1; x++) cv.shade(x, y + 2, 1);
}

export function stubbleP(k, hm, y0 = 36, y1 = 46, n = 1) {
  for (let y = y0; y < y1; y++) for (let x = 14; x < 50; x++) if (hm.in(x, y) && (x + y) % 2 === 0) k.cv.shade(x, y, n);
}
