// Clouds (spec §19 G4): the bank that hides what is ahead, the clouds that close over the sky until it opens, and the stepped, dithered
// effects of a reveal. A cloud pixel is one of four palette colours chosen from a tiling noise texture, never blended.
import { c32 } from '../engine/palette.js';

const N = 128;
const TEX = new Float32Array(N * N);       // cloud body
const EDGE = new Float32Array(N * N);      // how far the edge of a bank is pushed in or out
// value noise that tiles: lattice points wrap after `per` steps
function lattice(x, y, s) { let h = (x * 374761393 + y * 668265263 + s * 2246822519) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function pn(x, y, s, per) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, m = (v) => ((v % per) + per) % per;
  const a = lattice(m(xi), m(yi), s), b = lattice(m(xi + 1), m(yi), s), c = lattice(m(xi), m(yi + 1), s), d = lattice(m(xi + 1), m(yi + 1), s), u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
  const u = x / N, v = y / N;
  TEX[y * N + x] = pn(u * 6, v * 6, 1, 6) * 0.6 + pn(u * 12, v * 12, 2, 12) * 0.3 + pn(u * 24, v * 24, 3, 24) * 0.1;
  EDGE[y * N + x] = pn(u * 8, v * 8, 7, 8) * 0.65 + pn(u * 16, v * 16, 8, 16) * 0.35;
}

// each map's clouds: [brightest, light, mid, the dark under-edge]. day: white; gold: the Pantheon's sunlit banks; smoke: the Underworld's
// dark; static: the Void's (drawn as a flicker of white and grey)
export const FOG_PALS = {
  day: [c32(31, 31, 31), c32(27, 29, 31), c32(21, 25, 30), c32(15, 19, 27)],
  gold: [c32(31, 31, 26), c32(31, 28, 18), c32(29, 23, 12), c32(22, 15, 8)],
  smoke: [c32(10, 7, 8), c32(7, 5, 6), c32(4, 3, 4), c32(16, 6, 4)],
  static: [c32(31, 31, 31), c32(18, 18, 22), c32(6, 6, 9), c32(1, 1, 2)],
};

// Fill the parts of the frame that clouds cover.
//   cam: { x, y } the world position of screen (0, viewTop); view: [top, bottom] screen rows
//   cover(wx, wy): returns a signed depth: > 0 inside the clouds (how far from their edge, in px), <= 0 outside
//   t: frame counter (they drift)
export function paintClouds(f, cam, view, cover, t, reach = 18, pal = 'day') {
  const B = f.buf, FW = f.w, dx = Math.floor(t * 0.12), dy = Math.floor(t * 0.03);
  const [CW, CL, CM, CD] = FOG_PALS[pal] || FOG_PALS.day, flick = pal === 'static';
  for (let y = view[0]; y < view[1]; y++) {
    const wy = Math.floor(cam.y) + (y - view[0]);
    for (let x = 0; x < FW; x++) {
      const wx = Math.floor(cam.x) + x;
      const d0 = cover(wx, wy);
      if (d0 < -reach) continue;
      const ti = ((wy >> 1) + dy) & (N - 1), tj = ((wx >> 1) + dx) & (N - 1);
      const push = (EDGE[((wy >> 1) & (N - 1)) * N + ((wx >> 1) & (N - 1))] - 0.5) * 2 * reach;
      if (d0 + push <= 0) continue;
      const v = TEX[ti * N + tj], low = cover(wx, wy + 3) + (EDGE[(((wy + 3) >> 1) & (N - 1)) * N + ((wx >> 1) & (N - 1))] - 0.5) * 2 * reach <= 0;
      if (flick) { const h = ((wx * 73856093) ^ (wy * 19349663) ^ ((t >> 2) * 83492791)) >>> 0; B[y * FW + x] = low ? CD : (h & 15) === 0 ? CW : (h & 3) === 0 ? CL : CM; continue; }
      B[y * FW + x] = low ? CD : v > 0.56 ? CW : v > 0.42 ? CL : CM;
    }
  }
}

// a ring of sparkles at a radius around a point (a reveal's wave front), drawn as single pixels
export function sparkleRing(f, cx, cy, r, t, col = c32(31, 30, 18), n = 18) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + t * 0.03, rr = r + Math.sin(t * 0.2 + i * 2.1) * 3, x = Math.round(cx + Math.cos(a) * rr), y = Math.round(cy + Math.sin(a) * rr * 0.8);
    if (((t >> 1) + i) % 3) { f.px(x, y, col); f.px(x + 1, y, col); f.px(x, y - 1, col); }
  }
}
