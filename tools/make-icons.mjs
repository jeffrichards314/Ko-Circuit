// The app icon (original pixel art, drawn here): a red boxing glove with a "KO" cuff on a night-blue field, 32x32, scaled with nearest-neighbour.
//   node tools/make-icons.mjs        -> icons/icon-32.png, icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png (180)
import { writePNG } from './png.mjs';
import { c32 } from '../src/engine/palette.js';
import { drawText } from '../src/engine/font.js';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const N = 32;
const BG = c32(3, 4, 11), BG2 = c32(5, 7, 17), RAY = c32(8, 10, 24), INK = c32(2, 1, 4);
const RED = c32(25, 5, 6), RED_HI = c32(31, 13, 12), RED_LO = c32(15, 2, 5), RED_SH = c32(10, 1, 4);
const WHITE = c32(30, 30, 31), GREY = c32(21, 22, 26), GOLD = c32(31, 25, 4), GOLD_LO = c32(24, 14, 2);
const art = new Uint32Array(N * N).fill(BG);
const px = (x, y, c) => { if (x >= 0 && y >= 0 && x < N && y < N) art[y * N + x] = c; };
const inEll = (x, y, cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
const ell = (cx, cy, rx, ry, c) => { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (inEll(x + 0.5, y + 0.5, cx, cy, rx, ry)) px(x, y, c); };
const rect = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, c); };

// a quiet backdrop: a checker and rays from the glove
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if ((x + y) % 4 === 0) px(x, y, BG2);
for (let a = 0; a < 12; a++) { const ang = (a / 12) * Math.PI * 2; for (let r = 11; r < 24; r++) px(Math.round(16 + Math.cos(ang) * r), Math.round(13 + Math.sin(ang) * r), RAY); }
// the glove: outline first (grown ellipses), then the red, then light and shade
const parts = [[17, 12.5, 11.2, 10.2], [7.5, 16.5, 4.7, 4.2]];
for (const g of [1.2, 0]) for (const [cx, cy, rx, ry] of parts) ell(cx, cy, rx + g, ry + g, g ? INK : RED);
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
  if (art[y * N + x] !== RED) continue;
  const lit = (x - 17) * -0.6 + (y - 12.5) * -0.8; // light from the top left
  if (lit > 7.5) px(x, y, RED_HI); else if (lit < -8.5) px(x, y, RED_LO);
  if (lit < -11) px(x, y, RED_SH);
}
// thumb crease and finger lines
for (let i = 0; i < 6; i++) px(11 + i, 15 + (i >> 1), RED_LO);
for (let i = 0; i < 5; i++) { px(21, 6 + i, RED_LO); px(25, 9 + i, RED_LO); }
// the cuff
rect(10, 21, 18, 11, INK); rect(11, 22, 16, 9, WHITE); rect(11, 22, 16, 1, GOLD); rect(11, 23, 16, 1, GOLD_LO); rect(11, 30, 16, 1, GREY);
{ const f = { px, w: N, h: N }; drawText(f, 'KO', 13, 24, RED_LO, { mono: false }); }
// two sparks
const spark = (x, y) => { px(x, y, GOLD); px(x - 1, y, GOLD_LO); px(x + 1, y, GOLD_LO); px(x, y - 1, GOLD_LO); px(x, y + 1, GOLD_LO); };
spark(4, 5); spark(28, 3); spark(29, 18);

// size: output px; inner: how many output px the art takes (centred; the rest is the field colour, for the maskable one)
function render(size, inner = size) {
  const out = new Uint32Array(size * size).fill(BG);
  const off = Math.floor((size - inner) / 2);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const ax = Math.floor(((x - off) / inner) * N), ay = Math.floor(((y - off) / inner) * N);
    if (ax >= 0 && ay >= 0 && ax < N && ay < N) out[y * size + x] = art[ay * N + ax];
  }
  return out;
}
const dir = fileURLToPath(new URL('../icons/', import.meta.url));
mkdirSync(dir, { recursive: true });
for (const [name, size, inner] of [['icon-32.png', 32], ['icon-192.png', 192], ['icon-512.png', 512], ['icon-maskable-512.png', 512, 384], ['apple-touch-icon.png', 180]]) writePNG(dir + name, render(size, inner), size, size);
console.log('icons written');
