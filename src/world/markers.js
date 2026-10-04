// The places' furniture on the map (spec §19 G11): what a landmark stands on and what marks it, drawn in each world's own style.
//   plinth(f, zone, x, y, t)              a raised round base under a landmark: a lit top, a side, a shadow on the ground
//   flanks(f, zone, id, x, y, t, lit)     the two things standing either side of it: banners in the circuit's belt colours on the road,
//                                         gold lamps in the city, crystals in the warp, braziers in the sky and below, cubes in the Void
//   medallion(f, x, y, st, t, secret)     the place's marker: a bevelled coin with a notched rim, its state in the face, a mark in the middle
//   rivalBadge(f, x, y, st, t)            Dash's: a shield with a D and a bolt          bossMark(f, x, y, t, dim)   a skull with a crown of spikes
import { c32 } from '../engine/palette.js';
import { BELTS } from '../scene/belts.js';
import { bayer } from '../scene/gfx.js';

const C = (r, g, b) => c32(r, g, b);
const INK = C(2, 2, 4), WHITE = C(31, 31, 31);
const ell = (f, cx, cy, rx, ry, col) => { for (let y = -ry; y <= ry; y++) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry)))); f.rect(cx - w, cy + y, w * 2 + 1, 1, col); } };
const disc = (f, cx, cy, r, col) => ell(f, cx, cy, r, r, col);

// each world's plinth: [top light, top, side, side dark, rim] and its flank style
const STYLE = {
  main: { pl: [C(24, 23, 24), C(18, 17, 19), C(12, 11, 14), C(7, 6, 9), C(14, 27, 10)], flank: 'banner' },
  champ: { pl: [C(31, 30, 26), C(27, 25, 21), C(29, 23, 6), C(20, 13, 2), C(31, 29, 14)], flank: 'lamp' },
  zero: { pl: [C(16, 14, 24), C(10, 8, 17), C(6, 5, 11), C(3, 2, 6), C(27, 10, 31)], flank: 'crystal' },
  pantheon: { pl: [C(31, 31, 30), C(28, 27, 26), C(29, 23, 6), C(22, 15, 3), C(31, 29, 14)], flank: 'brazierGold' },
  underworld: { pl: [C(18, 11, 10), C(12, 7, 7), C(8, 4, 5), C(4, 2, 3), C(29, 8, 3)], flank: 'brazier' },
  void: { pl: [C(31, 31, 31), C(22, 22, 26), C(10, 10, 14), C(4, 4, 7), C(31, 31, 31)], flank: 'cube' },
};

export function plinth(f, zone, x, y, t) {
  const S = STYLE[zone] || STYLE.main, [hi, top, side, dk, rim] = S.pl;
  // the shadow it casts, the side, the top, a lit rim on the far edge
  for (let j = -4; j <= 4; j++) { const w = Math.round(25 * Math.sqrt(1 - (j * j) / 16)); for (let i = -w; i <= w; i++) if (bayer(x + i, y + 6 + j) < 0.5) f.px(x + i, y + 6 + j, INK); }
  if (zone === 'void') { const b = Math.round(Math.sin(t / 30) * 1); y += b - 1; }
  ell(f, x, y + 2, 22, 6, dk); ell(f, x, y + 1, 22, 6, side); ell(f, x, y - 2, 21, 5, top);
  for (let i = -18; i <= 18; i += 6) f.rect(x + i, y + 4, 2, 2, dk);
  ell(f, x - 5, y - 4, 10, 2, hi);
  // the rim: grass on the road, gold in the city and the sky, a purple glow in the warp, embers below, white in the Void
  for (let i = -21; i <= 21; i++) { const yy = y - 2 + Math.round(5 * Math.sqrt(Math.max(0, 1 - (i * i) / 441))); if ((i & 1) || zone !== 'underworld' || ((t >> 3) + i) % 5) f.px(x + i, yy, rim); }
}

export function flanks(f, zone, id, x, y, t) {
  const S = STYLE[zone] || STYLE.main, B = BELTS[id] || BELTS.rookie, u = (a) => C(a[0], a[1], a[2]);
  for (const sx of [-1, 1]) {
    const px = x + sx * 25, py = y + 1;
    if (S.flank === 'banner') {
      // a pole and a banner in the belt's colours, rippling
      f.rect(px, py - 26, 2, 26, C(10, 6, 3)); f.px(px, py - 27, C(31, 25, 6));
      for (let j = 0; j < 9; j++) { const o = Math.round(Math.sin(t / 8 + j * 0.7) * 1); f.rect(px + 2 + o * 0, py - 25 + j, 6 + (j > 6 ? -(j - 6) : 0), 1, j < 2 ? u(B.plate[0]) : j & 1 ? u(B.strap[0]) : u(B.strap[1])); }
      f.rect(px + 3, py - 21, 3, 3, u(B.plate[1]));
    } else if (S.flank === 'lamp') {
      f.rect(px, py - 22, 2, 22, C(20, 13, 2)); f.rect(px - 2, py - 25, 6, 3, C(29, 23, 6)); f.rect(px - 1, py - 24, 4, 2, (t >> 4) & 1 ? C(31, 31, 22) : C(31, 29, 14));
      for (let j = 0; j < 4; j++) if (bayer(px + j, py - 20 + j) < 0.4) f.px(px - 1 + j, py - 21 + j, C(31, 30, 20));
      f.rect(px - 1, py - 1, 4, 1, C(20, 13, 2));
    } else if (S.flank === 'crystal') {
      const b = Math.round(Math.sin(t / 20 + sx) * 1.5);
      for (let j = 0; j < 12; j++) { const w = j < 6 ? j >> 1 : (12 - j) >> 1; f.rect(px - w, py - 18 + j + b, w * 2 + 1, 1, j < 6 ? C(27, 10, 31) : C(14, 4, 22)); }
      f.px(px, py - 17 + b, WHITE); f.rect(px - 2, py, 5, 1, C(14, 4, 22));
    } else if (S.flank === 'brazierGold' || S.flank === 'brazier') {
      const gold = S.flank === 'brazierGold', mt = gold ? C(29, 23, 6) : C(12, 11, 14), md = gold ? C(20, 13, 2) : C(6, 5, 8);
      f.rect(px - 3, py - 12, 7, 2, mt); f.rect(px - 1, py - 10, 3, 10, md); f.rect(px - 3, py - 1, 7, 1, md);
      const fl = (t >> 2) & 3; ell(f, px, py - 15, 2 + (fl & 1), 3 + (fl >> 1), gold ? C(31, 25, 6) : C(29, 12, 3)); ell(f, px, py - 14, 1, 2, gold ? C(31, 31, 22) : C(31, 25, 8)); f.px(px, py - 19 - (fl & 1), gold ? WHITE : C(31, 25, 8));
    } else if (S.flank === 'cube') {
      const b = Math.round(Math.sin(t / 25 + sx * 2) * 2);
      f.rect(px - 3, py - 16 + b, 7, 7, WHITE); f.rect(px + 2, py - 16 + b, 2, 7, C(20, 20, 24)); f.rect(px - 3, py - 10 + b, 7, 1, C(20, 20, 24)); f.rect(px - 2, py, 5, 1, C(10, 10, 14));
    }
  }
}

// the marker: [rim, rim dark, face, face light] by state
const STATE = {
  cleared: [C(31, 26, 8), C(20, 13, 2), C(6, 13, 27), C(14, 22, 31)],
  current: [C(31, 26, 8), C(20, 13, 2), C(28, 6, 7), C(31, 18, 14)],
  open: [C(22, 22, 25), C(12, 12, 16), C(24, 5, 6), C(31, 14, 12)],
  locked: [C(12, 12, 16), C(6, 6, 9), C(8, 8, 12), C(13, 13, 17)],
};
export function medallion(f, x, y, st, t, secret = false) {
  const [rim, rimD, face, faceL] = STATE[st] || STATE.locked, pulse = st === 'current' && ((t >> 4) & 1);
  disc(f, x, y + 1, 10, INK); disc(f, x, y, 10, INK); disc(f, x, y, 9, rimD); disc(f, x, y - 1, 8, rim);
  // notches round the rim
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2, nx = Math.round(x + Math.cos(a) * 8), ny = Math.round(y - 0.5 + Math.sin(a) * 8); f.px(nx, ny, rimD); }
  disc(f, x, y, 6, INK); disc(f, x, y, 5, pulse ? faceL : face); ell(f, x - 2, y - 3, 2, 1, faceL);
  if (secret && st !== 'locked') for (let k = 0; k < 4; k++) { const a = t / 20 + (k * Math.PI) / 2; f.px(Math.round(x + Math.cos(a) * 11), Math.round(y + Math.sin(a) * 11), C(31, 17, 29)); }
  // the mark: a star when cleared, a beating heart of light when it is the one you are on, a padlock when shut
  if (st === 'cleared') { f.rect(x - 2, y - 1, 5, 1, WHITE); f.rect(x - 1, y - 2, 3, 3, WHITE); f.px(x, y - 3, WHITE); f.px(x - 1, y + 2, WHITE); f.px(x + 1, y + 2, WHITE); }
  else if (st === 'current') { f.rect(x - 1, y - 3, 2, 4, WHITE); f.rect(x - 1, y + 2, 2, 1, WHITE); }
  else if (st === 'open') f.rect(x - 1, y - 1, 2, 2, WHITE);
  else { f.rect(x - 2, y - 1, 5, 4, C(18, 18, 22)); f.rect(x - 1, y - 3, 3, 1, C(18, 18, 22)); f.px(x - 2, y - 2, C(18, 18, 22)); f.px(x + 2, y - 2, C(18, 18, 22)); f.px(x, y + 1, INK); }
}

export function rivalBadge(f, x, y, st, t) {
  const done = st === 'cleared', pulse = !done && ((t >> 4) & 1);
  const body = done ? C(1, 11, 12) : C(4, 24, 22), lite = done ? C(4, 18, 17) : C(12, 31, 28), rim = done ? C(14, 14, 18) : pulse ? C(31, 29, 14) : C(31, 25, 6);
  // a shield: flat top, sides drawing in to a point
  for (let j = -8; j <= 8; j++) { const w = j < 2 ? 8 : Math.round(8 - (j - 2) * 1.3); f.rect(x - w - 1, y + j, w * 2 + 3, 1, INK); }
  for (let j = -7; j <= 7; j++) { const w = j < 2 ? 7 : Math.round(7 - (j - 2) * 1.3); if (w >= 0) { f.rect(x - w, y + j, w * 2 + 1, 1, rim); if (w > 1) f.rect(x - w + 1, y + j, w * 2 - 1, 1, j < -4 ? lite : body); } }
  // the D, and a bolt through it
  f.rect(x - 3, y - 4, 2, 8, INK); f.rect(x - 1, y - 4, 3, 1, INK); f.rect(x - 1, y + 3, 3, 1, INK); f.rect(x + 2, y - 3, 1, 6, INK); f.px(x + 1, y - 4 + 1, INK); f.px(x + 1, y + 2, INK);
  f.px(x + 4, y - 6, rim); f.px(x + 3, y - 5, rim); f.px(x + 4, y - 4, rim); f.px(x + 3, y - 3, rim);
}

export function bossMark(f, x, y, t, dim = false) {
  const ring = dim ? C(14, 14, 18) : (t >> 4) & 1 ? C(31, 24, 8) : C(28, 8, 8), bone = dim ? C(18, 18, 20) : C(31, 30, 26);
  // a crown of spikes behind the ring
  for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * 0.45; for (let d = 6; d < 11; d++) f.px(Math.round(x + Math.cos(a) * d), Math.round(y + Math.sin(a) * d), d > 9 ? INK : ring); }
  disc(f, x, y, 7, INK); disc(f, x, y, 6, ring); disc(f, x, y, 5, C(4, 3, 6));
  f.rect(x - 3, y - 4, 7, 5, bone); f.rect(x - 2, y + 1, 5, 2, bone); f.rect(x - 2, y - 2, 2, 2, INK); f.rect(x + 1, y - 2, 2, 2, INK); f.px(x, y, INK); f.px(x - 1, y + 2, INK); f.px(x + 1, y + 2, INK);
  if (!dim && (t >> 3) & 1) { f.px(x - 2, y - 2, C(31, 6, 6)); f.px(x + 2, y - 2, C(31, 6, 6)); }
}
