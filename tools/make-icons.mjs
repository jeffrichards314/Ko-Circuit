// The app icon (original pixel art, drawn here): a red boxing glove with a "KO" cuff on a sunburst, 32x32, scaled with nearest-neighbour.
//   node tools/make-icons.mjs        -> icons/icon-32.png, icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png (180)
import { writePNG } from './png.mjs';
import { c32 } from '../src/engine/palette.js';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const N = 32;
const NAVY = c32(2, 3, 9), NAVY2 = c32(4, 6, 15), RAY1 = c32(7, 9, 22), RAY2 = c32(9, 11, 25), GLOW = c32(30, 24, 6), GLOW2 = c32(31, 29, 14);
const INK = c32(2, 1, 3);
const RED = [c32(12, 2, 4), c32(19, 3, 5), c32(25, 6, 7), c32(29, 10, 10), c32(31, 18, 16), c32(31, 27, 25)]; // dark to light
const WHITE = c32(31, 31, 31), GREY = c32(21, 22, 27), GREY2 = c32(14, 15, 20), BLUE = c32(6, 11, 26), BLUE2 = c32(3, 6, 17);
const art = new Uint32Array(N * N).fill(NAVY);
const px = (x, y, c) => { if (x >= 0 && y >= 0 && x < N && y < N) art[y * N + x] = c; };
const rect = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, c); };

// ---- the sunburst: alternating rays from behind the glove, a glow at the centre, a bright rim
const CX = 16, CY = 14;
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
  const dx = x + 0.5 - CX, dy = y + 0.5 - CY, ang = Math.atan2(dy, dx), r = Math.hypot(dx, dy);
  const ray = Math.floor(((ang + Math.PI) / (Math.PI * 2)) * 16) % 2;
  let c = ray ? RAY1 : NAVY2;
  if (r > 14) c = ray ? RAY2 : RAY1; // brighter toward the edge
  if (r < 13) c = ray ? GLOW : c32(26, 19, 4);
  if (r < 9) c = (x + y) % 2 ? GLOW2 : GLOW;
  px(x, y, c);
}
for (let i = 0; i < N; i++) { px(i, 0, NAVY); px(i, N - 1, NAVY); px(0, i, NAVY); px(N - 1, i, NAVY); }

// ---- the glove, as a mask: fist (a rounded block, tipped), thumb, cuff
const inRR = (x, y, x0, y0, x1, y1, r) => { const cx = Math.min(Math.max(x, x0 + r), x1 - r), cy = Math.min(Math.max(y, y0 + r), y1 - r); return (x - cx) ** 2 + (y - cy) ** 2 <= r * r && x >= x0 && x <= x1 && y >= y0 && y <= y1; };
const fist = (x, y) => inRR(x + 0.5, y + 0.5, 8, 2.5, 25.5, 19.5, 6);
const thumb = (x, y) => inRR(x + 0.5, y + 0.5, 4, 11.5, 12.5, 21.5, 3.6);
const cuff = (x, y) => x >= 10 && x <= 23 && y >= 19 && y <= 28;
const body = (x, y) => fist(x, y) || thumb(x, y);
const mask = new Uint8Array(N * N);
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) mask[y * N + x] = body(x, y) || cuff(x, y) ? 1 : 0;
const at = (x, y) => (x >= 0 && y >= 0 && x < N && y < N ? mask[y * N + x] : 0);
// a soft drop shadow, down and right
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!at(x, y) && (at(x - 1, y - 1) || at(x - 2, y - 2) || at(x - 1, y - 2) || at(x - 2, y - 1))) px(x, y, NAVY);
// outline
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!at(x, y) && (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1))) px(x, y, INK);
// fill red with a bevel: nearer the top-left edge is lighter, nearer the bottom-right darker
const distEdge = (x, y, dx, dy) => { let d = 0; while (d < 8 && at(x + dx * (d + 1), y + dy * (d + 1)) && (body(x + dx * (d + 1), y + dy * (d + 1)))) d++; return d; };
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
  if (!body(x, y) || cuff(x, y) && !body(x, y)) continue;
  const up = distEdge(x, y, 0, -1), left = distEdge(x, y, -1, 0), down = distEdge(x, y, 0, 1), right = distEdge(x, y, 1, 0);
  let lv = 2;
  const lit = Math.min(up, left), shade = Math.min(down, right);
  if (lit <= 1) lv = 4; else if (lit <= 2) lv = 3;
  if (shade <= 1) lv = 0; else if (shade <= 3) lv = 1;
  if (lit <= 1 && shade <= 1) lv = 2;
  px(x, y, RED[lv]);
}
// the thumb: a crease where it meets the fist, and its own highlight
for (let i = 0; i < 6; i++) px(11 + (i >> 1), 12 + i, RED[0]);
px(6, 14, RED[5]); px(6, 15, RED[4]); px(7, 13, RED[4]);
// the knuckle highlight, the finger lines
for (let i = 0; i < 5; i++) px(11 + i, 4, RED[5]);
px(10, 5, RED[5]); px(10, 6, RED[4]); px(16, 5, RED[4]);
for (let j = 0; j < 7; j++) { px(21, 4 + j, RED[0]); px(25 - (j > 4 ? 1 : 0), 7 + j, RED[0]); }
// the cuff: white, blue band, the letters
rect(10, 19, 14, 10, INK); rect(11, 20, 12, 8, WHITE);
rect(11, 20, 12, 1, GREY2); rect(11, 21, 12, 1, BLUE); rect(11, 27, 12, 1, GREY);
for (let x = 11; x < 23; x++) { px(x, 22, GREY); }
// (letters drawn by hand, 3x5, to fit the band)
const LET = { K: ['#.#', '#.#', '##.', '#.#', '#.#'], O: ['###', '#.#', '#.#', '#.#', '###'] };
'KO'.split('').forEach((ch, n) => LET[ch].forEach((row, j) => [...row].forEach((v, i) => v === '#' && px(13 + n * 4 + i, 22 + j, RED[1]))));
px(12, 24, GREY); px(21, 24, GREY);
rect(11, 20, 1, 8, GREY); rect(22, 20, 1, 8, GREY);
// sparks
const spark = (x, y, c1, c2) => { px(x, y, c1); px(x - 1, y, c2); px(x + 1, y, c2); px(x, y - 1, c2); px(x, y + 1, c2); };
spark(4, 4, WHITE, GLOW2); spark(28, 3, WHITE, GLOW2); spark(29, 20, GLOW2, GLOW); px(3, 24, WHITE); px(27, 27, WHITE);

// size: output px; inner: how many output px the art takes (centred; the rest is the field colour, for the maskable one)
function render(size, inner = size) {
  const out = new Uint32Array(size * size).fill(NAVY);
  const off = Math.floor((size - inner) / 2);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const ax = Math.floor(((x - off) / inner) * N), ay = Math.floor(((y - off) / inner) * N);
    if (ax >= 0 && ay >= 0 && ax < N && ay < N) out[y * size + x] = art[ay * N + ax];
    else { const ex = Math.min(N - 1, Math.max(0, ax)), ey = Math.min(N - 1, Math.max(0, ay)); out[y * size + x] = art[ey * N + ex]; } // (the maskable margin continues the rays)
  }
  return out;
}
const dir = fileURLToPath(new URL('../icons/', import.meta.url));
mkdirSync(dir, { recursive: true });
for (const [name, size, inner] of [['icon-32.png', 32], ['icon-192.png', 192], ['icon-512.png', 512], ['icon-maskable-512.png', 512, 384], ['apple-touch-icon.png', 180]]) writePNG(dir + name, render(size, inner), size, size);
console.log('icons written');
