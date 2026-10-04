// The look of an interior (spec §19 G4): the back wall and floor of a hall, themed to its circuit's arena. A theme is data
// (`data/interiors.js` THEMES: a motif name and a handful of 15-bit colours); the painters below turn it into a wall in the game's flat stepped style.
//   paintHall(f, theme, t, camX)   draws the wall (y TOP..BACK) and the floor (y BACK..BOTTOM); camX scrolls a wide hall
import { c32 } from '../engine/palette.js';
import { hash2 } from './img.js';

export const TOP = 24, BACK = 146, BOTTOM = 200;
const C = (a) => c32(a[0], a[1], a[2]);
const blink = (t, n, on = 1) => Math.floor(t / n) % (on + 1) === 0;

// every painter gets (f, th, t, cx): th.w = [base, light, dark] wall, th.f = [light, dark] floor, th.a = [accent, accent2], th.k = extra colour
const M = {};

// a wood-plank floor, with the lane worn down the middle
function plankFloor(f, th, cx, y0 = BACK, y1 = BOTTOM) {
  const [a, b] = th.f.map(C);
  f.rect(0, y0, 256, y1 - y0, b);
  for (let y = y0 + 1; y < y1; y += 6) { f.rect(0, y, 256, 5, a); f.rect(0, y + 5, 256, 1, b); }
  for (let y = y0 + 1, k = 0; y < y1; y += 6, k++) for (let x = -((cx + (k * 37)) % 40); x < 256; x += 40) f.rect(x, y, 1, 5, b);
  f.rect(0, y0, 256, 2, C(th.w[2]));
}
function tileFloor(f, th, cx, y0 = BACK, y1 = BOTTOM) {
  const [a, b] = th.f.map(C);
  f.rect(0, y0, 256, y1 - y0, a);
  for (let y = y0; y < y1; y += 14) f.rect(0, y, 256, 1, b);
  for (let y = y0, k = 0; y < y1; y += 14, k++) for (let x = -((cx + (k & 1 ? 14 : 0)) % 28); x < 256; x += 28) f.rect(x, y, 1, 14, b);
  f.rect(0, y0, 256, 2, C(th.w[2]));
}
function cobbleFloor(f, th, cx) {
  const [a, b] = th.f.map(C);
  f.rect(0, BACK, 256, BOTTOM - BACK, b);
  for (let y = BACK + 2; y < BOTTOM; y += 8) for (let x = -((cx + (y * 3)) % 24); x < 256; x += 24) { f.rect(x, y, 22, 6, a); f.rect(x, y, 22, 1, C(th.w[1])); }
  f.rect(0, BACK, 256, 2, C(th.w[2]));
}
const wall = (f, th) => { f.rect(0, TOP, 256, BACK - TOP, C(th.w[0])); };
const bricks = (f, th, cx) => {
  const d = C(th.w[2]);
  for (let y = TOP; y < BACK; y += 6) { f.rect(0, y + 5, 256, 1, d); for (let x = -((cx + (((y - TOP) / 6) & 1 ? 0 : 12)) % 24); x < 256; x += 24) f.rect(x, y, 1, 5, d); }
};
const banner = (f, x, y, w, h, col, col2, txt) => { f.rect(x, y, w, h, col); f.rect(x, y, w, 1, col2); f.rect(x, y + h - 1, w, 1, col2); for (let i = 0; i < w; i += 4) f.rect(x + i, y + h, 2, 2, col); void txt; };
const hang = (f, x, y, col) => { f.rect(x, TOP, 1, y - TOP, C([8, 8, 10])); f.rect(x - 4, y, 9, 3, C([10, 10, 12])); f.rect(x - 3, y + 3, 7, 1, col); f.rect(x - 5, y + 4, 11, 1, col); };
function lightCone(f, x, y, w, h, col, dens = 0.22) { for (let j = 0; j < h; j++) { const ww = Math.round(w * (j / h)); for (let i = -ww; i <= ww; i++) if (((x + i + y + j) & 3) === 0 && hash2(i, j, 4) < dens * 2) f.px(x + i, y + j, col); } }

M.brick = (f, th, t, cx) => {
  wall(f, th); bricks(f, th, cx); plankFloor(f, th, cx);
  f.rect(0, BACK - 12, 256, 2, C(th.w[1]));
  const acc = C(th.a[0]), acc2 = C(th.a[1]);
  for (const x of [40, 170]) { const X = x - (cx % 512); banner(f, X, TOP + 10, 40, 14, acc, acc2); for (let i = 0; i < 4; i++) f.rect(X + 6 + i * 8, TOP + 14, 5, 5, C([3, 2, 4])); }
  for (const x of [120, 240]) { const X = x - (cx % 512); f.rect(X, TOP + 6, 18, 14, C([8, 14, 20])); f.rect(X + 1, TOP + 7, 16, 12, blink(t + x, 50, 7) ? C([29, 30, 24]) : C([10, 18, 24])); f.rect(X + 8, TOP + 6, 2, 14, C([3, 2, 4])); }
  for (let x = -((cx) % 70); x < 256; x += 70) { f.rect(x + 10, BACK - 26, 3, 26, C([9, 9, 12])); f.rect(x + 4, BACK - 28, 15, 2, C(th.a[0].map((v) => v))); f.rect(x + 6, BACK - 30, 11, 2, C([30, 30, 28])); }
};
M.civic = (f, th, t, cx) => {
  wall(f, th); plankFloor(f, th, cx);
  f.rect(0, BACK - 30, 256, 30, C(th.w[2])); f.rect(0, BACK - 30, 256, 2, C(th.w[1]));
  for (let x = -((cx) % 64); x < 256; x += 64) { f.rect(x + 18, TOP + 12, 22, 34, C([14, 9, 6])); f.rect(x + 20, TOP + 14, 18, 30, C([24, 20, 14])); f.rect(x + 24, TOP + 20, 10, 12, C([19, 15, 11])); f.rect(x + 27, TOP + 34, 4, 8, C([19, 15, 11])); }
  f.rect(0, TOP + 4, 256, 3, C(th.a[0])); f.rect(0, TOP + 7, 256, 1, C(th.a[1]));
  for (let x = -((cx) % 40); x < 256; x += 40) { f.rect(x, TOP + 8, 1, 6, C([10, 10, 14])); f.rect(x + 1, TOP + 8, 8, 5, blink(Math.floor(t / 8) + x, 1, 0) ? C(th.a[0]) : C([30, 30, 28])); }
};
M.rooftop = (f, th, t, cx) => {
  f.rect(0, TOP, 256, BACK - TOP, C(th.w[0]));
  // a skyline behind a railing, its windows lit in turns
  for (let i = 0; i < 14; i++) { const w = 18 + (i * 7) % 12, h = 30 + (i * 13) % 50, x = i * 26 - ((cx * 0.4) % 26), by = BACK - 22; f.rect(x, by - h, w, h, C(th.w[2])); for (let y = by - h + 4; y < by - 3; y += 6) for (let xx = x + 3; xx < x + w - 3; xx += 5) if (hash2(xx + i, y, 9) > 0.4 && ((t >> 5) + xx) % 9) f.rect(xx, y, 2, 3, C(th.a[0])); }
  f.rect(0, BACK - 22, 256, 22, C(th.f[1])); f.rect(0, BACK - 22, 256, 2, C(th.f[0]));
  for (let x = -((cx) % 16); x < 256; x += 16) f.rect(x, BACK - 34, 2, 14, C([16, 16, 20]));
  f.rect(0, BACK - 34, 256, 2, C([20, 20, 25]));
  for (let i = 0; i < 18; i++) f.px((i * 53 + 7) % 256, TOP + 3 + ((i * 29) % 30), blink(t + i * 5, 12, 2) ? C([31, 31, 28]) : C([16, 18, 26]));
  tileFloor(f, { ...th, f: th.f, w: th.w }, cx);
  f.rect(0, BACK - 4, 256, 4, C(th.f[1])); f.rect(0, BACK - 4, 256, 1, C([20, 20, 25]));
};
M.neon = (f, th, t, cx) => {
  wall(f, th); tileFloor(f, th, cx);
  for (let x = -((cx) % 32); x < 256; x += 32) { f.rect(x, TOP, 1, BACK - TOP, C(th.w[2])); }
  const tubes = [C(th.a[0]), C(th.a[1])];
  for (let i = 0; i < 6; i++) { const y = TOP + 10 + i * 18, col = tubes[i & 1], on = blink(t + i * 11, 30, 5); f.rect(0, y, 256, 1, on ? col : C(th.w[2])); if (on) { f.rect(0, y + 1, 256, 1, C(th.w[2])); } }
  for (let x = -((cx) % 80); x < 256; x += 80) { f.rect(x + 20, TOP + 24, 40, 60, C([3, 3, 8])); f.rect(x + 21, TOP + 25, 38, 58, C(th.w[1])); f.rect(x + 24, TOP + 30, 32, 10, blink(t + x, 24, 3) ? tubes[0] : tubes[1]); f.rect(x + 24, TOP + 46, 32, 4, tubes[1]); }
};
M.bigtop = (f, th, t, cx) => {
  for (let x = -((cx) % 40); x < 256; x += 20) { f.rect(x, TOP, 20, BACK - TOP, Math.floor((x + cx) / 20) & 1 ? C(th.w[0]) : C(th.w[1])); }
  // bunting and a row of bulbs
  for (let x = -((cx) % 24); x < 256; x += 12) { const y = TOP + 6 + Math.round(Math.sin((x + cx) / 24 * Math.PI) * 4); f.rect(x, y, 9, 7, Math.floor((x + cx) / 12) & 1 ? C(th.a[0]) : C(th.a[1])); f.rect(x + 3, y + 7, 3, 2, Math.floor((x + cx) / 12) & 1 ? C(th.a[0]) : C(th.a[1])); }
  for (let x = -((cx) % 16); x < 256; x += 16) f.rect(x + 6, TOP + 2, 3, 3, blink(t + (x + cx), 14, 2) ? C([31, 28, 10]) : C([20, 14, 4]));
  const [a, b] = th.f.map(C); f.rect(0, BACK, 256, BOTTOM - BACK, b); for (let i = 0; i < 160; i++) f.px((hash2(i, 1, 2) * 256) | 0, BACK + ((hash2(i, 2, 2) * (BOTTOM - BACK)) | 0), a);
  f.rect(0, BACK, 256, 3, C(th.w[2]));
};
M.grand = (f, th, t, cx) => {
  wall(f, th); f.rect(0, BACK - 10, 256, 10, C(th.w[2]));
  for (let x = -((cx) % 64); x < 256; x += 64) { f.rect(x + 8, TOP, 14, BACK - TOP, C(th.w[1])); f.rect(x + 8, TOP, 4, BACK - TOP, C([31, 30, 27])); f.rect(x + 18, TOP, 4, BACK - TOP, C(th.w[2])); f.rect(x + 5, TOP, 20, 5, C(th.w[1])); f.rect(x + 5, BACK - 8, 20, 4, C(th.w[1])); f.rect(x + 34, TOP + 14, 20, 40, C([8, 10, 16])); f.rect(x + 35, TOP + 15, 18, 38, C([10, 14, 24])); f.rect(x + 43, TOP + 15, 2, 38, C(th.w[1])); }
  // the chandeliers and the red carpet
  for (let x = -((cx) % 96); x < 256; x += 96) { f.rect(x + 46, TOP, 1, 10, C([20, 16, 6])); f.rect(x + 38, TOP + 10, 17, 3, C(th.a[0])); for (let i = 0; i < 5; i++) f.rect(x + 39 + i * 4, TOP + 13, 2, 3, blink(t + i * 5 + x, 10, 2) ? C([31, 30, 16]) : C([24, 18, 6])); }
  tileFloor(f, th, cx); f.rect(0, BACK + 22, 256, 22, C(th.a[1])); f.rect(0, BACK + 22, 256, 2, C(th.a[0])); f.rect(0, BACK + 42, 256, 2, C(th.a[0]));
};
M.stadium = (f, th, t, cx) => {
  wall(f, th);
  // the stands: rows of tiny heads in the dark behind a fence, floodlights up top
  for (let r = 0; r < 6; r++) { const y = TOP + 26 + r * 10; f.rect(0, y, 256, 10, r & 1 ? C(th.w[2]) : C(th.w[0])); for (let x = -((cx + r * 7) % 6); x < 256; x += 6) if (hash2(x + cx, r, 5) > 0.3) { f.rect(x, y + 3, 3, 3, C([hash2(x + cx, r, 6) > 0.5 ? 26 : 14, 14, hash2(x + cx, r, 7) > 0.5 ? 10 : 24])); } }
  for (let x = -((cx) % 90); x < 256; x += 90) { f.rect(x + 30, TOP + 4, 2, 30, C([10, 10, 14])); f.rect(x + 22, TOP + 4, 18, 8, C([8, 8, 11])); for (let i = 0; i < 4; i++) f.rect(x + 23 + i * 4, TOP + 6, 3, 4, blink(t + x, 40, 9) ? C([31, 31, 26]) : C([26, 26, 22])); }
  f.rect(0, BACK - 10, 256, 10, C(th.w[1])); f.rect(0, BACK - 10, 256, 2, C(th.a[0]));
  tileFloor(f, th, cx);
};
M.storm = (f, th, t, cx) => {
  wall(f, th); bricks(f, th, cx); plankFloor(f, th, cx);
  for (let x = -((cx) % 100); x < 256; x += 100) {
    f.rect(x + 30, TOP + 14, 34, 52, C([3, 3, 7])); const flash = blink(t + x, 90, 1) && ((t + x) % 90) < 6;
    f.rect(x + 31, TOP + 15, 32, 50, flash ? C([30, 30, 31]) : C(th.k || [8, 9, 16]));
    for (let i = 0; i < 6; i++) f.rect(x + 34 + i * 5, TOP + 15 + ((t * 2 + i * 13) % 50), 1, 4, C([16, 20, 28]));
    if (flash) { f.rect(x + 46, TOP + 16, 2, 14, C([31, 31, 20])); f.rect(x + 44, TOP + 30, 2, 10, C([31, 31, 20])); f.rect(x + 47, TOP + 40, 2, 8, C([31, 31, 20])); }
    f.rect(x + 46, TOP + 14, 2, 52, C([3, 3, 7]));
  }
};
M.hof = (f, th, t, cx) => {
  wall(f, th); tileFloor(f, th, cx);
  f.rect(0, BACK - 12, 256, 12, C(th.w[2])); f.rect(0, BACK - 12, 256, 2, C(th.a[0]));
  for (let x = -((cx) % 56); x < 256; x += 56) { f.rect(x + 8, TOP + 14, 38, 60, C([6, 4, 8])); f.rect(x + 10, TOP + 16, 34, 56, C([14, 12, 16])); for (const [tx, ty] of [[14, 24], [30, 24], [14, 46], [30, 46]]) { f.rect(x + tx, ty + TOP, 8, 10, C(th.a[0])); f.rect(x + tx + 2, ty + TOP + 10, 4, 3, C(th.a[1])); f.px(x + tx + 2, ty + TOP + 2, C([31, 31, 20])); } f.rect(x + 10, TOP + 38, 34, 1, C(th.a[1])); }
  for (let x = -((cx) % 56); x < 256; x += 56) f.rect(x + 50, TOP + 4, 2, BACK - TOP, C(th.w[1]));
};
M.colosseum = (f, th, t, cx) => {
  wall(f, th); cobbleFloor(f, th, cx);
  for (let x = -((cx) % 48); x < 256; x += 48) { f.rect(x + 6, TOP + 16, 36, 100, C(th.w[2])); for (let y = 0; y < 18; y++) { const w = Math.round(Math.sqrt(Math.max(0, 18 * 18 - (18 - y) * (18 - y)))); f.rect(x + 24 - w, TOP + 16 + y, w * 2, 1, C(th.w[2])); } f.rect(x + 8, TOP + 34, 32, BACK - TOP - 34, C([6, 4, 3])); for (let y = 0; y < 16; y++) { const w = Math.round(Math.sqrt(Math.max(0, 16 * 16 - (16 - y) * (16 - y)))); f.rect(x + 24 - w, TOP + 18 + y, w * 2, 1, C([6, 4, 3])); } }
  f.rect(0, TOP, 256, 12, C(th.w[1])); for (let x = -((cx) % 16); x < 256; x += 16) f.rect(x, TOP + 12, 8, 4, C(th.w[1]));
  for (let x = -((cx) % 96); x < 256; x += 96) { f.rect(x + 40, TOP + 40, 3, 10, C([9, 6, 4])); f.rect(x + 37, TOP + 34, 9, 6, blink(t + x, 5, 1) ? C([31, 22, 5]) : C([31, 28, 10])); }
};
M.warehouse = (f, th, t, cx) => {
  wall(f, th); for (let x = -((cx) % 10); x < 256; x += 10) f.rect(x, TOP, 2, BACK - TOP, C(th.w[2]));
  cobbleFloor(f, th, cx);
  for (let y = TOP + 50; y < BACK - 10; y += 12) for (let x = -((cx) % 12); x < 256; x += 12) { f.px(x, y, C(th.w[1])); f.px(x + 6, y + 6, C(th.w[1])); f.rect(x, y + 1, 12, 1, C(th.w[2])); }
  for (let x = -((cx) % 120); x < 256; x += 120) { f.rect(x + 50, TOP, 1, 20, C([8, 8, 10])); f.rect(x + 44, TOP + 20, 13, 4, C([8, 8, 10])); lightCone(f, x + 50, TOP + 24, 26, 60, C(th.a[0]), 0.16); f.rect(x + 46, TOP + 24, 9, 2, blink(t + x, 70, 12) ? C(th.a[0]) : C([18, 18, 14])); }
  for (let x = -((cx) % 64); x < 256; x += 64) { f.rect(x + 4, BACK - 26, 3, 26, C([10, 10, 13])); for (let i = 0; i < 4; i++) f.rect(x + 7, BACK - 24 + i * 6, 40, 1, C([12, 12, 16])); f.rect(x + 47, BACK - 26, 3, 26, C([10, 10, 13])); }
};
M.arena = (f, th, t, cx) => {
  wall(f, th); tileFloor(f, th, cx);
  for (let x = -((cx) % 64); x < 256; x += 64) { lightCone(f, x + 32, TOP + 6, 34, 110, C(th.a[0]), 0.14); f.rect(x + 27, TOP, 10, 8, C([8, 8, 12])); f.rect(x + 29, TOP + 6, 6, 3, blink(t + x, 18, 5) ? C([31, 31, 24]) : C(th.a[0])); }
  f.rect(0, BACK - 16, 256, 16, C(th.w[2])); f.rect(0, BACK - 16, 256, 2, C(th.a[0]));
  for (let x = -((cx) % 48); x < 256; x += 48) { f.rect(x + 8, BACK - 14, 32, 10, C([4, 4, 8])); f.rect(x + 10, BACK - 12, 28, 2, blink(t + x, 24, 3) ? C(th.a[0]) : C(th.a[1])); }
};
M.nightmare = (f, th, t, cx) => {
  wall(f, th); tileFloor(f, th, cx);
  for (let x = -((cx) % 40); x < 256; x += 40) { for (let y = TOP; y < BACK; y++) f.px(x + Math.round(Math.sin((y + t * 0.7) / 9 + x) * 4) + 10, y, C(th.w[1])); f.rect(x + 24, TOP, 12, 40 + ((x + cx) % 30), C(th.w[2])); }
  for (let i = 0; i < 24; i++) { const x = (hash2(i, 3, 9) * 256) | 0, y = TOP + ((hash2(i, 4, 9) * 110) | 0); if (blink(t + i * 7, 20, 2)) f.rect(x, y, 2, 2, C(th.a[0])); }
  f.rect(0, BACK - 6, 256, 6, C(th.w[2]));
};
M.white = (f, th, t, cx) => {
  f.rect(0, TOP, 256, BACK - TOP, C(th.w[0])); f.rect(0, BACK, 256, BOTTOM - BACK, C(th.f[0])); f.rect(0, BACK, 256, 2, C(th.w[2]));
  for (let x = -((cx) % 48); x < 256; x += 48) f.rect(x, TOP, 1, BACK - TOP, C(th.w[2]));
  for (let x = -((cx) % 48); x < 256; x += 48) f.rect(x + 6, BACK - 80, 36, 80, C(th.w[1]));
  for (let y = BACK + 2; y < BOTTOM; y += 12) f.rect(0, y, 256, 1, C(th.f[1]));
};
M.marble = (f, th, t, cx) => {
  // the Pantheon: a sky behind, pillars of marble in front
  const sky = th.k || [14, 22, 31];
  f.rect(0, TOP, 256, BACK - TOP, C(sky));
  for (let i = 0; i < 6; i++) { const x = (i * 71 + 30 - ((cx * 0.3) % 280) + 280) % 280 - 20, y = TOP + 18 + ((i * 29) % 70); f.rect(x, y, 34, 5, C([31, 31, 31])); f.rect(x + 6, y - 3, 20, 3, C([31, 31, 31])); f.rect(x + 2, y + 5, 28, 2, C([22, 26, 31])); }
  for (let x = -((cx) % 80); x < 256; x += 80) { f.rect(x + 10, TOP, 16, BACK - TOP, C(th.w[0])); f.rect(x + 10, TOP, 5, BACK - TOP, C(th.w[1])); f.rect(x + 22, TOP, 4, BACK - TOP, C(th.w[2])); f.rect(x + 6, TOP, 24, 6, C(th.w[1])); f.rect(x + 6, BACK - 8, 24, 8, C(th.w[1])); }
  f.rect(0, BACK - 14, 256, 14, C(th.w[1])); f.rect(0, BACK - 14, 256, 2, C(th.a[0]));
  tileFloor(f, { ...th, f: th.f }, cx);
  for (let x = 0; x < 256; x += 3) if (hash2(x + cx, 4, 2) > 0.97) f.px(x, TOP + ((hash2(x, 5, 2) * 100) | 0), C([31, 31, 26]));
};
M.stars = (f, th, t, cx) => {
  f.rect(0, TOP, 256, BACK - TOP, C(th.w[0]));
  for (let i = 0; i < 70; i++) { const x = ((hash2(i, 1, 6) * 256) | 0), y = TOP + ((hash2(i, 2, 6) * (BACK - TOP - 10)) | 0); f.px((x - ((cx * (0.2 + (i % 3) * 0.1)) | 0) + 512) % 256, y, blink(t + i * 9, 40, 3) ? C([31, 31, 28]) : C(th.a[0])); }
  f.rect(0, BACK - 12, 256, 12, C(th.w[2])); f.rect(0, BACK - 12, 256, 1, C(th.a[0]));
  tileFloor(f, th, cx);
  for (let x = -((cx) % 64); x < 256; x += 64) { f.rect(x + 14, TOP + 8, 36, 2, C(th.w[1])); f.rect(x + 30, TOP + 10, 4, 40, C(th.w[1])); }
};
M.cave = (f, th, t, cx) => {
  wall(f, th);
  for (let x = -((cx) % 28); x < 256; x += 28) { const h = 20 + ((hash2((x + cx) / 28 | 0, 1, 3) * 40) | 0); for (let y = 0; y < h; y++) { const w = Math.round(9 * (1 - y / h)); f.rect(x + 14 - w, TOP + y, w * 2, 1, C(th.w[2])); } }
  f.rect(0, BACK - 10, 256, 10, C(th.w[2]));
  cobbleFloor(f, th, cx);
  // embers drifting up
  if (th.k) for (let i = 0; i < 14; i++) { const x = (hash2(i, 5, 7) * 256) | 0, y = BACK - ((t * (0.3 + (i % 3) * 0.2) + i * 37) % (BACK - TOP)); f.px(x, Math.round(y), C(th.k)); }
  for (let x = -((cx) % 100); x < 256; x += 100) { f.rect(x + 40, BACK - 34, 4, 34, C([8, 6, 8])); f.rect(x + 36, BACK - 40, 12, 7, C([10, 8, 10])); f.rect(x + 38, BACK - 46 + ((t >> 3) & 1), 8, 7, blink(t + x, 4, 1) ? C([31, 20, 4]) : C([31, 28, 10])); }
};
M.gym = (f, th, t, cx) => {
  wall(f, th); bricks(f, th, cx); plankFloor(f, th, cx);
  f.rect(0, BACK - 12, 256, 12, C(th.w[2]));
  // one hanging light and two regulars' lockers
  const lx = 128 - ((cx * 0.0) | 0);
  f.rect(lx, TOP, 1, 30, C([6, 6, 8])); f.rect(lx - 8, TOP + 30, 17, 4, C([12, 12, 14])); lightCone(f, lx, TOP + 34, 50, 100, C(th.a[0]), 0.1);
  f.rect(lx - 6, TOP + 34, 13, 2, blink(t, 90, 16) ? C(th.a[0]) : C([20, 18, 10]));
  for (let x = -((cx) % 120); x < 256; x += 120) for (let i = 0; i < 3; i++) { f.rect(x + 10 + i * 12, BACK - 54, 10, 54, C([9, 11, 14])); f.rect(x + 11 + i * 12, BACK - 53, 8, 52, C([12, 15, 19])); f.rect(x + 17 + i * 12, BACK - 30, 1, 3, C([24, 22, 12])); }
};
M.home = (f, th, t, cx) => {
  wall(f, th); plankFloor(f, th, cx);
  f.rect(0, BACK - 34, 256, 34, C(th.w[2])); f.rect(0, BACK - 34, 256, 2, C(th.w[1]));
  // posters on the wall, a window that shows a morning, a banner
  for (let x = -((cx) % 128); x < 256; x += 128) {
    f.rect(x + 12, TOP + 16, 28, 38, C([6, 6, 9])); f.rect(x + 14, TOP + 18, 24, 34, C(th.a[0])); f.rect(x + 18, TOP + 22, 16, 16, C([30, 26, 20])); f.rect(x + 21, TOP + 40, 10, 3, C([30, 30, 28]));
    f.rect(x + 66, TOP + 8, 40, 46, C([6, 6, 9])); f.rect(x + 68, TOP + 10, 36, 42, C([18, 25, 31])); f.rect(x + 68, TOP + 34, 36, 18, C([8, 20, 9])); f.rect(x + 85, TOP + 10, 2, 42, C([6, 6, 9])); f.rect(x + 68, TOP + 30, 36, 2, C([6, 6, 9])); f.rect(x + 76, TOP + 16, 8, 4, C([31, 31, 31]));
    f.rect(x + 106, TOP + 16, 16, 30, C(th.a[1])); f.rect(x + 106, TOP + 16, 16, 1, C([31, 27, 10]));
  }
};
M.belthall = (f, th, t, cx) => {
  wall(f, th); tileFloor(f, th, cx);
  f.rect(0, BACK - 14, 256, 14, C(th.w[2])); f.rect(0, BACK - 14, 256, 2, C(th.a[0]));
  for (let x = -((cx) % 70); x < 256; x += 70) {
    // a belt on a cushion in a lit niche
    f.rect(x + 14, TOP + 14, 44, 52, C([5, 3, 6])); f.rect(x + 16, TOP + 16, 40, 48, C([12, 8, 12]));
    f.rect(x + 20, TOP + 34, 32, 8, C([9, 6, 5])); f.rect(x + 20, TOP + 34, 32, 1, C(th.a[1]));
    f.rect(x + 29, TOP + 30, 14, 16, C(th.a[0])); f.rect(x + 31, TOP + 32, 10, 12, C([31, 29, 12])); f.rect(x + 34, TOP + 36, 4, 4, blink(t + x, 16, 1) ? C([8, 26, 28]) : C([26, 4, 6]));
    lightCone(f, x + 36, TOP + 16, 16, 48, C([31, 30, 16]), 0.1);
  }
};
M.tower = (f, th, t, cx) => {
  wall(f, th); bricks(f, th, cx); cobbleFloor(f, th, cx);
  f.rect(0, BACK - 10, 256, 10, C(th.w[2]));
  for (let x = -((cx) % 56); x < 256; x += 56) { f.rect(x + 22, TOP + 30, 4, 30, C([8, 7, 9])); f.rect(x + 18, TOP + 24, 12, 7, C([10, 9, 11])); f.rect(x + 20, TOP + 14 + ((t >> 3) & 1), 8, 10, blink(t + x, 5, 1) ? C([31, 18, 4]) : C([31, 27, 10])); f.rect(x + 23, TOP + 10, 2, 8, C(th.a[0])); lightCone(f, x + 24, TOP + 32, 26, 60, C(th.a[0]), 0.1); }
};
M.void = (f, th, t, cx) => {
  f.rect(0, TOP, 256, BACK - TOP, C(th.w[0]));
  for (let i = 0; i < 50; i++) { const x = (((hash2(i, 1, 8) * 256) | 0) - ((cx * 0.3) | 0) + 512) % 256, y = TOP + ((hash2(i, 2, 8) * (BACK - TOP)) | 0); f.px(x, y, blink(t + i * 6, 30, 2) ? C(th.a[0]) : C(th.w[1])); }
  for (let i = 0; i < 9; i++) { const x = (i * 61 - ((cx * 0.6) | 0) + 512) % 300 - 20, y = TOP + 16 + ((i * 37) % 80) + Math.round(Math.sin((t + i * 20) / 40) * 3); f.rect(x, y, 14 + (i % 3) * 6, 3, C(th.w[1])); f.rect(x + 2, y + 3, 10, 1, C(th.w[2])); }
  f.rect(0, BACK, 256, BOTTOM - BACK, C(th.f[1])); for (let x = -((cx) % 24); x < 256; x += 24) f.rect(x, BACK, 1, BOTTOM - BACK, C(th.f[0])); for (let y = BACK; y < BOTTOM; y += 12) f.rect(0, y, 256, 1, C(th.f[0]));
  f.rect(0, BACK, 256, 2, C(th.a[0]));
};

// ---- the Ascension's halls, given more to look at (spec §19 G11): each base motif, then its extra life on top
const base = { marble: M.marble, stars: M.stars, cave: M.cave, void: M.void };
M.marble = (f, th, t, cx) => {
  base.marble(f, th, t, cx);
  const gold = C(th.a[0]), goldD = C([20, 13, 2]), white = C([31, 31, 31]);
  // a gold frieze along the top with a key pattern
  f.rect(0, TOP + 6, 256, 6, gold); f.rect(0, TOP + 12, 256, 1, goldD);
  for (let x = -((cx) % 8); x < 256; x += 8) { f.rect(x, TOP + 7, 1, 4, goldD); f.rect(x, TOP + 7, 4, 1, goldD); f.rect(x + 3, TOP + 7, 1, 3, goldD); }
  // statues in the bays between the pillars, braziers at their feet, laurels hanging
  for (let x = -((cx) % 80); x < 256; x += 80) {
    const sx = x + 52; f.rect(sx - 8, BACK - 22, 16, 8, C(th.w[1])); f.rect(sx - 8, BACK - 22, 16, 1, white);
    f.rect(sx - 3, BACK - 46, 6, 24, white); f.rect(sx - 2, BACK - 52, 4, 6, white); f.rect(sx - 6, BACK - 44, 3, 12, white); f.rect(sx + 3, BACK - 50, 3, 14, white); f.rect(sx + 1, BACK - 46, 2, 24, C(th.w[2]));
    for (const bx of [sx - 14, sx + 14]) { f.rect(bx - 3, BACK - 26, 7, 2, gold); f.rect(bx - 1, BACK - 24, 3, 10, goldD); const fl = (t >> 2) + bx; f.rect(bx - 2, BACK - 31 - (fl & 1), 5, 5, (fl & 2) ? C([31, 25, 6]) : C([31, 31, 20])); }
    for (let j = 0; j < 7; j++) f.rect(x + 40 + j * 4, TOP + 13 + Math.round(Math.sin(j / 6 * Math.PI) * 6), 3, 2, C([8, 22, 8]));
  }
  // a beam of light from above, slowly breathing
  const k = (Math.sin(t / 60) + 1) / 2;
  for (let j = 0; j < BACK - TOP - 14; j++) for (let i = -10; i <= 10; i++) if (((i + j + t) & 7) === 0 && hash2(i, j, 13) < 0.25 + k * 0.25) f.px(128 + i + (j >> 3), TOP + 14 + j, C([31, 31, 22]));
  // a gold inlay down the floor
  f.rect(0, BACK + 20, 256, 1, gold); f.rect(0, BACK + 34, 256, 1, gold);
};
M.stars = (f, th, t, cx) => {
  base.stars(f, th, t, cx);
  // a ringed planet low in the sky, and constellations drawn in faint lines that twinkle at their stars
  const px = 190 - ((cx * 0.15) | 0) % 300, py = TOP + 40;
  for (let j = -12; j <= 12; j++) { const w = Math.round(Math.sqrt(144 - j * j)); f.rect(px - w, py + j, w * 2, 1, j < -4 ? C([22, 18, 30]) : C([14, 10, 24])); }
  for (let a = 0; a < 60; a++) { const q = (a / 60) * Math.PI * 2, x = Math.round(px + Math.cos(q) * 20), y = Math.round(py + Math.sin(q) * 4); if (Math.sin(q) > -0.3 || Math.abs(x - px) > 12) f.px(x, y, C(th.a[0])); }
  const stars = [[30, 30], [52, 22], [70, 40], [90, 28], [120, 60], [140, 48], [160, 70]];
  for (let i = 1; i < stars.length; i++) { const [ax, ay] = stars[i - 1], [bx, by] = stars[i]; for (let s2 = 0; s2 < 20; s2++) if (s2 & 1) f.px(Math.round(ax + ((bx - ax) * s2) / 20) - ((cx * 0.2) | 0) % 256, TOP + Math.round(ay + ((by - ay) * s2) / 20), C([10, 12, 24])); }
  for (const [x, y] of stars) f.rect(x - 1 - ((cx * 0.2) | 0) % 256, TOP + y - 1, (t >> 4) & 1 ? 3 : 2, (t >> 4) & 1 ? 3 : 2, C([31, 31, 28]));
  // a shooting star now and then
  const ph = t % 240; if (ph < 20) for (let k = 0; k < 8; k++) f.px(220 - ph * 6 + k * 2, TOP + 10 + ph * 2 - k, k < 2 ? C([31, 31, 31]) : C(th.a[0]));
};
M.cave = (f, th, t, cx) => {
  base.cave(f, th, t, cx);
  const glow = th.k ? C(th.k) : C([29, 12, 3]), hot = C([31, 25, 8]), bone = C([27, 25, 22]), iron = C([14, 14, 17]);
  // a fall of lava down the back wall, its light on the stone
  for (let x = -((cx) % 160); x < 256; x += 160) {
    const lx = x + 100;
    for (let y = TOP; y < BACK - 10; y++) { const w = 3 + ((y + (t >> 1)) % 7 === 0 ? 1 : 0); f.rect(lx - w, y, w * 2, 1, ((y - t) & 7) < 2 ? hot : glow); }
    for (let j = 0; j < 30; j++) for (let i = -14; i <= 14; i++) if (((i + j) & 3) === 0 && hash2(i, j, 21) < 0.2) f.px(lx + i, BACK - 40 + j, glow);
  }
  // chains with hooks, swinging; skulls set in the wall
  for (let x = -((cx) % 90); x < 256; x += 90) {
    const sw = Math.round(Math.sin(t / 40 + x) * 3);
    for (let y = TOP; y < TOP + 50; y += 3) f.rect(x + 30 + Math.round((sw * (y - TOP)) / 50), y, 2, 2, iron);
    f.rect(x + 29 + sw, TOP + 50, 4, 2, iron); f.rect(x + 32 + sw, TOP + 52, 1, 3, iron);
    for (const [sx, sy] of [[60, 60], [70, 66]]) { f.rect(x + sx - 2, TOP + sy, 5, 4, bone); f.rect(x + sx - 1, TOP + sy + 4, 3, 1, bone); f.px(x + sx - 1, TOP + sy + 1, C([2, 1, 2])); f.px(x + sx + 1, TOP + sy + 1, C([2, 1, 2])); }
  }
  // the floor cracked with glowing seams
  for (let x = -((cx) % 70); x < 256; x += 70) { let y = BACK + 6, xx = x + 10; for (let k = 0; k < 12; k++) { f.px(xx, y, ((t >> 3) + k) % 4 ? glow : hot); xx += 2; y += (k & 1) ? 1 : 0; } }
};
M.void = (f, th, t, cx) => {
  base.void(f, th, t, cx);
  const white = C([31, 31, 31]), grey = C(th.w[1]);
  // silent white figures far back, cubes turning in the air, an empty doorframe
  for (let i = 0; i < 4; i++) { const x = (i * 83 + 40 - ((cx * 0.3) | 0) + 512) % 300 - 20, y = BACK - 36, on = ((t >> 6) + i) % 5 !== 0; if (!on) continue; f.rect(x, y, 4, 24, grey); f.rect(x - 1, y - 5, 6, 5, grey); }
  for (let i = 0; i < 5; i++) { const x = (i * 57 + 20 - ((cx * 0.5) | 0) + 512) % 280 - 10, y = TOP + 20 + ((i * 41) % 60) + Math.round(Math.sin((t + i * 30) / 30) * 4), s2 = 5 + (i % 3) * 2; f.rect(x, y, s2, s2, white); f.rect(x + s2 - 1, y + 1, 1, s2 - 1, grey); f.rect(x + 1, y + s2 - 1, s2 - 1, 1, grey); }
  for (let x = -((cx) % 200); x < 256; x += 200) { f.rect(x + 150, BACK - 50, 22, 50, white); f.rect(x + 153, BACK - 47, 16, 47, C(th.w[0])); }
  // the picture slips now and then
  if ((t % 131) < 3) { const y0 = TOP + ((t * 7) % 90), B = f.buf; for (let y = y0; y < y0 + 6 && y < BACK; y++) { const row = B.slice(y * 256, y * 256 + 256); for (let x = 0; x < 256; x++) B[y * 256 + x] = row[(x + 5) % 256]; } }
};

export function paintHall(f, th, t, cx = 0) {
  (M[th.motif] || M.brick)(f, th, t, Math.floor(cx));
}
export const MOTIFS = Object.keys(M);
void base;
