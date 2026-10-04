// Small opaque-or-transparent images made in code (map tiles, scenery, interior props).
// An Img is { w, h, buf: Uint32Array } in finished 32-bit colours; 0 is transparent (every colour the game uses has alpha 0xff).
// `makeImg(w, h, draw)` hands `draw` a scratch Frame, so everything the Frame can do (rect, px, frameRect) makes art.
import { Frame } from '../engine/renderer.js';

export function makeImg(w, h, draw) {
  const f = new Frame(w, h);
  f.buf.fill(0);
  draw(f);
  return { w, h, buf: f.buf };
}

// draw an image with its top-left at (x, y). opts: flip, dither (every other pixel), solid (one colour), clipY (skip rows above this screen y)
export function drawImg(f, img, x, y, opts = {}) {
  x = Math.round(x); y = Math.round(y);
  const { w, h } = img, B = f.buf, FW = f.w, FH = f.h, flip = !!opts.flip, dither = opts.dither ? 1 : 0, solid = opts.solid, clipY = opts.clipY ?? 0, clipB = opts.clipB ?? FH;
  for (let j = 0; j < h; j++) {
    const Y = y + j;
    if (Y < clipY || Y >= clipB || Y >= FH) continue;
    for (let i = 0; i < w; i++) {
      const X = x + i;
      if (X < 0 || X >= FW) continue;
      const v = img.buf[j * w + (flip ? w - 1 - i : i)];
      if (!v || (dither && ((X + Y) & 1))) continue;
      B[Y * FW + X] = solid !== undefined ? solid : v;
    }
  }
}

// deterministic hash noise in [0, 1)
export function hash2(x, y, s = 0) {
  let h = (x * 374761393 + y * 668265263 + s * 2246822519) | 0;
  h = (h ^ (h >>> 13)) * 1274126177 | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
// smooth value noise (bilinear over hash2), for clouds and blob edges
export function vnoise(x, y, s = 0) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const a = hash2(xi, yi, s), b = hash2(xi + 1, yi, s), c = hash2(xi, yi + 1, s), d = hash2(xi + 1, yi + 1, s);
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
// a seeded rng
export const rng = (seed) => { let s = (seed * 9301 + 49297) % 233280; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; };
