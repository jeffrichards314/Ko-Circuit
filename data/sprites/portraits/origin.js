// Intro-card portraits (2026-10-04): ORIGIN and ORIGIN TRUE FORM. A bust made of light: rays standing out behind a faceless dome, a radiant slit, a sun in the
// chest, and a ring of small gold belts round the head (the halo). The true form's rays are longer, the ring a ring of flames. Painted with the figure's own
// palette keys (data/sprites/fighters/origin/origin.js), so any palette of his (a zone's, white-gold) draws him.
import { setup, bust, earsP, headP } from './kit.js';

function portrait(pal, gold) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  // rays behind everything
  const n = gold ? 17 : 13;
  for (let i = 0; i < n; i++) {
    const a = Math.PI * 1.08 + (i / (n - 1)) * Math.PI * 0.84 * 1.0 - Math.PI * 0.04, len = (i % 2 ? 22 : gold ? 31 : 28), x0 = 32 + Math.cos(a) * 14, y0 = 30 + Math.sin(a) * 15;
    for (let d = 0; d < len; d++) { const X = Math.round(x0 + Math.cos(a) * d), Y = Math.round(y0 + Math.sin(a) * d * 1.05); cv.px(X, Y, c(d < len * 0.55 ? 'rayHi' : 'ray')); if (d < 6) cv.px(X + 1, Y, c('ray')); }
  }
  bust(k, skin, skin, { neck: 10, top: 44, slope: 10 });
  // the sun in his chest, and the light running out of it
  for (let y = 46; y < 60; y++) for (let x = 20; x <= 44; x++) { const d = Math.hypot(x - 32, (y - 55) * 0.9); if (d < 3.2) cv.px(x, y, c('white')); else if (d < 5.4) cv.px(x, y, c('glow')); else if (d < 6.6) cv.px(x, y, c('rayHi')); }
  for (let q = 0; q < 12; q++) { const a = (q / 12) * Math.PI * 2, len = q % 2 ? 9 : 12; for (let d = 7; d < len; d++) { const X = Math.round(32 + Math.cos(a) * d), Y = Math.round(55 + Math.sin(a) * d * 0.9); if (Y >= 44 && Y < 60) cv.px(X, Y, c('ray')); } }
  earsP(k, skin, 17, 30, 2.4, 4);
  headP(k, skin, { rx: 15, ry: 17, cy: 27, jawY: 34, jawRx: 13, jawRy: 11 });
  // the radiant slit
  for (let x = 20; x <= 44; x++) { cv.px(x, 27, c(Math.abs(x - 32) > 8 ? 'glow' : 'white')); if (Math.abs(x - 32) < 7) cv.px(x, 28, c('glow')); }
  // the halo: a ring of small belts (gold straps, a bright plate on each) round the head, behind it at the back and in front at the sides
  const belts = gold ? 22 : 17;
  for (let i = 0; i < belts; i++) {
    const a = (i / belts) * Math.PI * 2, X = Math.round(32 + Math.cos(a) * 24), Y = Math.round(12 + Math.sin(a) * 6);
    if (Y > 18 || Y < 3) continue;
    for (let dx = -2; dx <= 2; dx++) cv.px(X + dx, Y, c(dx === 0 ? 'white' : i % 2 ? 'glove' : 'gloveHi'));
    cv.px(X, Y + 1, c('gloveDk'));
    if (gold) { cv.px(X, Y - 1, c('rayHi')); if (i % 2) cv.px(X, Y - 2, c('ray')); }
  }
  void m;
  return cv.toSprite(0, 0, false);
}
export const originPortrait = (pal) => portrait(pal, false);
export const originTruePortrait = (pal) => portrait(pal, true);
